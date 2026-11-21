import * as THREE from 'three';
import { SERTAO } from '../arena/configs.js';

// ================================================================== A LUA DE SANGUE E O KERBEROS (Sertão, Aniquilação)
// Dono, 2026-11-20: "No modo Aniquilação ... o quibungo poderia ter uma segunda forma se demorassemos muito pra matá-lo
// assim como acontece com a degolificada, ele derreteria com uma chuva de sangue que começa com uma lua de sangue na
// fase e viraria uma gosma, surgindo um kérberos do corpo dele assim como acontece no final de hexatombe."
// O fim de Hexatombe (ep. 10, a cinemática "Nascimento do Kerberos"; Referencias visuais/quibungo/): o céu fica
// vermelho, chove sangue, o Quibungo derrete numa poça de gosma cercada de ossos pontudos e o Kerberos sobe dela.
// Etapas: a LUA DE SANGUE (o céu, a névoa, as luzes e a lua ficam vermelhos) → a CHUVA DE SANGUE → o Quibungo
// DERRETE (não apanha) → o KERBEROS nasce da gosma e vira o chefe da onda (o Quibungo derretido não conta como abate).
// PROPOSTA: o tempo (TRIGGER), as durações e o visual.
export const INFERNO = {
  trigger: 90, // segundos de luta com o Quibungo vivo até a lua virar
  moon: 3.5, // a lua avermelhando até a chuva
  rain: 3, // chovendo antes de ele começar a derreter
  melt: 3.2, // o derretimento (Quibungo.startMelt)
};
const RED_SKY = [[0, '#0e0204'], [0.45, '#3a0608'], [0.8, '#7a1010'], [1, '#a82018']];
const RED_FOG = new THREE.Color(0x5a0a0c);
const RED_LIGHT = new THREE.Color(0xff3a2a);
const RAIN_N = 700;
const RAIN_BOX = 22;

function lerpStops(a, b, k) {
  return a.map(([s, ca], i) => [s, '#' + new THREE.Color(ca).lerp(new THREE.Color(b[i][1]), k).getHexString()]);
}

export class KerberosInferno {
  constructor(d, quib) {
    this.d = d;
    this.quib = quib;
    this.t = 0;
    this.stage = 'wait';
    this.stageT = 0;
  }

  update(dt) {
    if (this.stage === 'done') { this.tickSky(dt); this.tickRain(dt); return; }
    const q = this.quib;
    if (this.stage === 'wait') {
      // só conta enquanto ele luta (a entrada e a morte não contam); morreu antes do tempo, acabou
      if (!q.alive || q.state === 'die') { this.stage = 'off'; return; }
      if (q.state === 'chase' || q.state === 'attack' || q.state === 'charge' || q.state === 'dizzy') this.t += dt;
      if (this.t >= INFERNO.trigger) this.begin();
      return;
    }
    if (this.stage === 'off') return;
    this.stageT += dt;
    this.tickSky(dt);
    this.tickRain(dt);
    if (this.stage === 'moon' && this.stageT >= INFERNO.moon) {
      this.stage = 'rain';
      this.stageT = 0;
      this.startRain();
      this.d.hud.callout('CHUVA DE SANGUE', '#ff2a2a');
    } else if (this.stage === 'rain' && this.stageT >= INFERNO.rain) {
      // morreu durante a lua? então não derrete (a chuva fica)
      if (!q.alive || q.state === 'die') { this.stage = 'done'; return; }
      this.stage = 'melt';
      this.stageT = 0;
      q.startMelt(INFERNO.melt, () => this.birth());
      this.makeGoo(q.pos);
      this.d.hud.callout('O QUIBUNGO DERRETE', '#ff4a3a');
      this.d.audio.play('drain', { volume: 1, pitch: 0.3 });
    } else if (this.stage === 'melt') {
      this.tickGoo(Math.min(1, this.stageT / INFERNO.melt));
    }
  }

  // ---- a LUA DE SANGUE
  begin() {
    const d = this.d;
    const w = d.world;
    this.stage = 'moon';
    this.stageT = 0;
    const sc = w.scene;
    const lights = [];
    sc.traverse((o) => { if (o.isLight && !o.isAmbientLight) lights.push([o, o.color.clone(), o.isHemisphereLight ? o.groundColor.clone() : null]); });
    const moons = [];
    sc.traverse((o) => {
      if (!o.isMesh) return;
      for (const m of [].concat(o.material)) if (m && /moon_full$/.test(m.name) && !moons.some((x) => x[0] === m)) moons.push([m, m.color.clone(), m.emissive ? m.emissive.clone() : null]);
    });
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 256;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.sky = {
      bg: sc.background, tex, canvas: c, from: SERTAO.skyGradient,
      fog: sc.fog ? { c: sc.fog.color.clone(), dens: sc.fog.density } : null, lights, moons, k: 0, drawnK: -1,
    };
    sc.background = tex;
    d.hud.callout('A LUA DE SANGUE', '#ff2a2a');
    d.audio.play('fearGaze', { volume: 0.9, pitch: 0.3 });
    w.cameraRig && w.cameraRig.shake(0.3, 1.5);
  }

  tickSky(dt) {
    const S = this.sky;
    if (!S) return;
    const w = this.d.world;
    S.k = Math.min(1, S.k + dt / INFERNO.moon);
    if (Math.abs(S.k - S.drawnK) > 0.04 || (S.k === 1 && S.drawnK !== 1)) {
      S.drawnK = S.k;
      const g = S.canvas.getContext('2d');
      const grd = g.createLinearGradient(0, 0, 0, 256);
      lerpStops(S.from, RED_SKY, S.k).forEach(([k, col]) => grd.addColorStop(k, col));
      g.fillStyle = grd;
      g.fillRect(0, 0, 4, 256);
      S.tex.needsUpdate = true;
    }
    const fog = w.scene.fog;
    if (fog && S.fog) {
      fog.color.copy(S.fog.c).lerp(RED_FOG, S.k);
      if (fog.density !== undefined) fog.density = S.fog.dens * (1 + 0.3 * S.k);
    }
    for (const [o, c0, g0] of S.lights) {
      o.color.copy(c0).lerp(RED_LIGHT, S.k * 0.7);
      if (g0) o.groundColor.copy(g0).lerp(new THREE.Color(0x3a0404), S.k * 0.7);
    }
    for (const [m, c0, e0] of S.moons) {
      m.color.copy(c0).lerp(new THREE.Color(0xff2010), S.k);
      if (e0) m.emissive.copy(e0).lerp(new THREE.Color(0xff1a0a), S.k);
    }
  }

  // ---- a CHUVA DE SANGUE: riscos vermelhos caindo numa caixa em volta de quem joga
  startRain() {
    const pos = new Float32Array(RAIN_N * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0xb01418, transparent: true, opacity: 0, depthWrite: false });
    const lines = new THREE.LineSegments(geo, mat);
    lines.frustumCulled = false;
    this.d.world.scene.add(lines);
    const drops = [];
    for (let i = 0; i < RAIN_N; i++) drops.push({ x: (Math.random() - 0.5) * RAIN_BOX * 2, y: Math.random() * 18, z: (Math.random() - 0.5) * RAIN_BOX * 2, v: 16 + Math.random() * 8 });
    this.rain = { lines, drops, k: 0, splash: 0 };
  }

  tickRain(dt) {
    const R = this.rain;
    if (!R) return;
    R.k = Math.min(1, R.k + dt / 1.5);
    R.lines.material.opacity = 0.55 * R.k;
    const p = this.d.player.pos;
    const arr = R.lines.geometry.attributes.position.array;
    R.drops.forEach((q, i) => {
      q.y -= q.v * dt;
      if (q.y < 0) { q.y += 18; q.x = (Math.random() - 0.5) * RAIN_BOX * 2; q.z = (Math.random() - 0.5) * RAIN_BOX * 2; }
      const x = p.x + q.x, z = p.z + q.z;
      arr.set([x, q.y, z, x + 0.03, q.y + 0.7, z + 0.02], i * 6);
    });
    R.lines.geometry.attributes.position.needsUpdate = true;
    // respingos no chão perto de quem joga
    R.splash -= dt;
    if (R.splash <= 0) {
      R.splash = 0.06;
      const a = Math.random() * Math.PI * 2, r = Math.random() * 9;
      this.d.world.fx.burst(new THREE.Vector3(p.x + Math.sin(a) * r, 0.05, p.z + Math.cos(a) * r), { count: 2, color: 0x9a1014, speed: 1.2, up: 1.5, life: 0.3, size: 0.08, gravity: 9 });
    }
  }

  // ---- a GOSMA: a poça onde ele derrete, cercada de ossos pontudos (a cinemática)
  makeGoo(at) {
    const g = new THREE.Group();
    g.position.set(at.x, 0, at.z);
    const mat = new THREE.MeshToonMaterial({ color: 0x5a0408, emissive: 0x1a0002 });
    const puddle = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10), mat);
    puddle.scale.set(0.1, 0.05, 0.1);
    g.add(puddle);
    const bone = new THREE.MeshToonMaterial({ color: 0xd8c4a0 });
    const spikes = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.2;
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1, 6).translate(0, 0.5, 0), bone);
      s.position.set(Math.sin(a) * 2.6, 0, Math.cos(a) * 2.6);
      s.rotation.set(Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5); // apontados para fora
      s.userData.h = 1.2 + Math.random() * 1.4;
      s.scale.set(1, 0.01, 1);
      g.add(s);
      spikes.push(s);
    }
    this.d.world.scene.add(g);
    this.goo = { g, puddle, spikes, mat, bone };
  }

  tickGoo(k) {
    const G = this.goo;
    if (!G) return;
    const r = 0.2 + 3 * Math.min(1, k * 1.4);
    G.puddle.scale.set(r, 0.25 + 0.4 * Math.sin(k * Math.PI), r);
    for (const s of G.spikes) s.scale.set(1, Math.max(0.01, Math.min(1, (k - 0.3) / 0.5)) * s.userData.h, 1);
    if (Math.random() < 0.5) this.d.world.fx.burst(new THREE.Vector3(G.g.position.x + (Math.random() - 0.5) * r, 0.3, G.g.position.z + (Math.random() - 0.5) * r), { count: 3, color: 0x7a0810, speed: 1.5, up: 2.5, life: 0.5, size: 0.2, gravity: 8 });
  }

  // ---- o KERBEROS sobe da gosma (entra nas cópias ANTES de o Quibungo sumir: a onda não acaba no meio)
  birth() {
    const d = this.d;
    const q = this.quib;
    const kb = d.spawnFoe('kerberos', new THREE.Vector3(q.pos.x, 0, q.pos.z), { hpMul: 1 });
    kb.yaw = q.yaw;
    d.hud.callout('O KERBEROS', '#ff2a2a');
    d.audio.play('explosion', { volume: 0.7, pitch: 0.4 });
    this.kerberos = kb;
    this.stage = 'done';
  }

  dispose() {
    const w = this.d.world;
    const S = this.sky;
    if (S) {
      if (w.scene.background === S.tex) w.scene.background = S.bg;
      S.tex.dispose();
      if (w.scene.fog && S.fog) { w.scene.fog.color.copy(S.fog.c); if (w.scene.fog.density !== undefined) w.scene.fog.density = S.fog.dens; }
      for (const [o, c0, g0] of S.lights) { o.color.copy(c0); if (g0) o.groundColor.copy(g0); }
      for (const [m, c0, e0] of S.moons) { m.color.copy(c0); if (e0) m.emissive.copy(e0); }
      this.sky = null;
    }
    if (this.rain) {
      w.scene.remove(this.rain.lines);
      this.rain.lines.geometry.dispose();
      this.rain.lines.material.dispose();
      this.rain = null;
    }
    if (this.goo) {
      w.scene.remove(this.goo.g);
      this.goo.g.traverse((o) => o.geometry && o.geometry.dispose());
      this.goo.mat.dispose();
      this.goo.bone.dispose();
      this.goo = null;
    }
    this.stage = 'off';
  }
}
