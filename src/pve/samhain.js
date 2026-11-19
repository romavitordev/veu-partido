// A NOITE DO SAMHAIN EM TREB CIACH — a parte 1 da fase de ondas de A Vigília (pedido do dono, 2026-11-18: "o player
// protegeria das assombrações e protegeria a vila, tentando impedir que o numero de aldeões vivos chegue a zero";
// "primeiro ficaram até x rodadas derrotando ali proximo a chama de proteção mesmo, mas vai começar a trovejar muito e
// vai vir muitas assombrações de uma vez").
// As CASAS em volta da praça (as mesmas do mapa: tools/blender/arena_treb_ciach.py HOUSES) têm cada uma a LAMPARINA da
// porta com a Chama de Proteção e alguns aldeões dentro. As Assombrações vão atrás das portas (combat/assombracao.js:
// a casa é um alvo como quem joga); quando a lamparina de uma casa apaga, os aldeões dela morrem. ALDEÕES VIVOS chegando
// a zero = derrota. Quem joga REACENDE a lamparina ficando parado perto da porta sem Assombração por perto (o ep. 3:
// "a chama deve ser espalhada pelas casas"). No fim, a TEMPESTADE (trovões e raios) e a leva enorme.
// Cânone: as lamparinas da Chama de Proteção nas portas, as Assombrações indo às casas apagadas, a tempestade
// impossível do Samhain. PROPOSTA: quantos aldeões por casa, a vida das lamparinas, o reacender e os números da tempestade.
import * as THREE from 'three';
import { makeLightning } from '../arena/nightLife.js';
import { distXZ } from '../core/util.js';

// as casas do mapa: [ângulo, raio, largura, fundo] (arena_treb_ciach.py HOUSES) e os aldeões de cada uma (são ~15 nomeados)
const HOUSES = [[0.62, 26.5, 8.5, 5.0], [1.05, 28.5, 7.0, 4.6], [2.1, 26.5, 9.0, 5.2], [2.62, 28.5, 7.5, 4.8],
  [Math.PI, 31, 11, 6.0], [4.45, 26.5, 8.0, 5.0], [5.0, 28.5, 9.5, 5.2], [5.62, 26.5, 7.0, 4.6]];
const VILLAGERS = [2, 2, 2, 2, 3, 2, 1, 1];
export const VILLAGE = {
  lampHp: { easy: 240, normal: 200, hard: 170, superhard: 150, annihilation: 130 },
  relight: 22, // vida por segundo que a lamparina recupera com alguém parado perto
  relightRange: 2.2,
  safeRange: 3.2, // sem Assombração a esta distância da porta
  alertEvery: 6,
};

// a porta de cada casa, puxada para dentro do limite da luta (as casas ficam na borda)
export function houseDoors(limit) {
  return HOUSES.map(([a, r, w, d], i) => {
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const ry = Math.atan2(-x, -z);
    const c = Math.cos(ry), s = Math.sin(ry);
    const lx = -w * 0.22, lz = d / 2 + 0.5;
    let dx = x + lx * c + lz * s, dz = z - lx * s + lz * c;
    const rr = Math.hypot(dx, dz);
    if (rr > limit) { dx *= limit / rr; dz *= limit / rr; }
    return { i, x: dx, z: dz, villagers: VILLAGERS[i] };
  });
}

class House {
  constructor(v, door, hp) {
    this.v = v;
    this.isHouse = true;
    this.index = door.i;
    this.pos = new THREE.Vector3(door.x, 0, door.z);
    this.radius = 0.6;
    this.height = 2;
    this.maxHp = hp;
    this.hp = hp;
    this.villagers = door.villagers;
    this.state = 'idle';
    this.alertAt = -99;
    // a lamparina (a chama amarela) e o anel no chão que mostra quanto ela aguenta
    const g = new THREE.Group();
    g.position.copy(this.pos);
    this.flame = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd84a }));
    this.flame.position.y = 1.9;
    this.halo = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffc040, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.halo.position.y = 1.9;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.8, 6), new THREE.MeshLambertMaterial({ color: 0x3a2a1c }));
    post.position.y = 0.9;
    this.ringBg = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 40), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
    this.ringBg.rotation.x = -Math.PI / 2;
    this.ringBg.position.y = 0.04;
    this.ringMat = new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.85, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 40, 1, 0, Math.PI * 2), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.05;
    g.add(post, this.flame, this.halo, this.ringBg, this.ring);
    v.d.world.scene.add(g);
    this.group = g;
    this.shown = 1;
  }

  get alive() { return this.state !== 'ko'; }
  isInvulnerable() { return this.state === 'ko'; }
  chestPos(out = new THREE.Vector3()) { return out.set(this.pos.x, 1.4, this.pos.z); }

  hurt(dmg) {
    if (this.state === 'ko') return;
    this.hp = Math.max(0, this.hp - dmg);
    this.v.onHouseHit(this);
    if (this.hp <= 0) {
      this.state = 'ko';
      this.v.onHouseLost(this);
    }
  }

  update(dt, t) {
    const k = this.hp / this.maxHp;
    if (Math.abs(k - this.shown) > 0.01) {
      this.shown = k;
      this.ring.geometry.dispose();
      this.ring.geometry = new THREE.RingGeometry(0.85, 1.0, 40, 1, Math.PI / 2, Math.max(0.001, Math.PI * 2 * k));
      this.ringMat.color.setHex(k > 0.5 ? 0xffd84a : k > 0.25 ? 0xff9a3a : 0xff4a3a);
    }
    const lit = this.state !== 'ko';
    this.flame.visible = lit;
    this.halo.visible = lit;
    if (lit) {
      const f = 0.85 + Math.sin(t * 11 + this.index) * 0.08 + Math.sin(t * 23 + this.index * 2) * 0.05;
      this.halo.scale.setScalar(f * (0.6 + 0.4 * k));
      this.halo.material.opacity = 0.18 + 0.14 * k;
    } else {
      this.ringBg.material.opacity = 0.2;
    }
  }

  dispose() {
    this.v.d.world.scene.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }
}

export class SamhainVillage {
  constructor(d, W) {
    this.d = d;
    this.W = W;
    this.t = 0;
    const hp = VILLAGE.lampHp[d.run && d.run.difficulty] || VILLAGE.lampHp.normal;
    this.houses = houseDoors((W.bounds || 23) - 0.7).map((door) => new House(this, door, hp));
    this.total = this.houses.reduce((n, h) => n + h.villagers, 0);
    this.lost = false;
    this.storm = null;
  }

  get alive() { return this.houses.filter((h) => h.alive).reduce((n, h) => n + h.villagers, 0); }

  // os alvos das Assombrações: as casas ainda acesas
  targets() { return this.houses.filter((h) => h.alive); }

  label() { return `Aldeões ${this.alive}/${this.total}`; }

  onHouseHit(h) {
    const d = this.d;
    if (this.t - h.alertAt > VILLAGE.alertEvery) {
      h.alertAt = this.t;
      d.hud.callout('UMA CASA ESTÁ SENDO ATACADA', '#ffb84a');
      d.audio.play('fearGaze', { volume: 0.5, pitch: 1.4 });
    }
  }

  onHouseLost(h) {
    const d = this.d;
    d.hud.callout(h.villagers > 1 ? `A LAMPARINA APAGOU: ${h.villagers} ALDEÕES MORRERAM` : 'A LAMPARINA APAGOU: UM ALDEÃO MORREU', '#ff4a3a');
    d.audio.play('drain', { volume: 0.9, pitch: 0.6 });
    d.world.fx.burst(h.chestPos(new THREE.Vector3()), { count: 30, color: 0x2a2c30, kind: 'smoke', speed: 1.6, up: 1.5, life: 1.2, size: 0.8, grow: 1 });
    d.waveObjective();
    if (this.alive <= 0 && !this.lost) {
      this.lost = true;
      d.onVillageLost();
    }
  }

  update(dt) {
    const d = this.d;
    this.t += dt;
    for (const h of this.houses) h.update(dt, this.t);
    // REACENDER: alguém parado perto da porta, sem Assombração por perto, devolve a chama aos poucos
    for (const h of this.houses) {
      if (!h.alive || h.hp >= h.maxHp) continue;
      const near = d.players.some((p) => p.state !== 'ko' && distXZ(p.pos, h.pos) < VILLAGE.relightRange);
      if (!near) continue;
      const threat = d.copias.some((c) => c.alive && c.state !== 'die' && distXZ(c.pos, h.pos) < VILLAGE.safeRange);
      if (threat) continue;
      h.hp = Math.min(h.maxHp, h.hp + VILLAGE.relight * dt);
      if (Math.random() < dt * 8) d.world.fx.burst(h.chestPos(new THREE.Vector3()).setY(1.9), { count: 2, color: 0xffd84a, speed: 0.8, up: 1.2, life: 0.5, size: 0.08 });
    }
    if (this.storm) this.updateStorm(dt);
  }

  // A TEMPESTADE do fim (o ep. 3: a tempestade impossível): o céu escurece, relâmpagos e raios caindo na praça
  startStorm() {
    const d = this.d;
    const w = d.world;
    const group = new THREE.Group();
    w.scene.add(group);
    const sky = makeLightning(group, { interval: [0.6, 1.8], distance: 90, top: 70, bottom: 10, intensity: 3.2, skyOpacity: 0.55, color: 0xc8d8ff });
    const lights = [];
    w.scene.traverse((o) => { if (o.isLight && o.intensity > 0 && !group.children.includes(o)) lights.push([o, o.intensity]); });
    const fog = w.scene.fog;
    this.storm = { group, sky, lights, fog: fog ? { c: fog.color.clone(), dens: fog.density } : null, k: 0, next: 1.2 };
    d.audio.play('explosion', { volume: 0.6, pitch: 0.4 });
  }

  updateStorm(dt) {
    const S = this.storm;
    const w = this.d.world;
    S.k = Math.min(1, S.k + dt / 3);
    S.sky.update(dt);
    for (const [o, i0] of S.lights) o.intensity = i0 * (1 - 0.5 * S.k);
    const fog = w.scene.fog;
    if (fog && S.fog) {
      fog.color.copy(S.fog.c).lerp(new THREE.Color(0x141c26), S.k * 0.8);
      if (fog.density !== undefined) fog.density = S.fog.dens * (1 + 0.5 * S.k);
    }
    // os raios caindo na praça (um aviso de luz e o estrondo); só visual, não machuca (PROPOSTA)
    S.next -= dt;
    if (S.next <= 0) {
      S.next = 0.9 + Math.random() * 1.6;
      const a = Math.random() * Math.PI * 2, r = 8 + Math.random() * 14;
      const at = new THREE.Vector3(Math.sin(a) * r, 0.1, Math.cos(a) * r);
      w.fx.lightning(at.clone().setY(16), at, { color: 0xd8e4ff, life: 0.3 });
      w.fx.lightning(at.clone().setY(16).add(new THREE.Vector3(0.6, 0, 0.3)), at, { color: 0xffffff, life: 0.15 });
      w.fx.burst(at, { count: 14, color: 0xc8d8ff, speed: 3, up: 2, life: 0.4, size: 0.12 });
      this.d.audio.play('explosion', { volume: 0.35 + Math.random() * 0.2, pitch: 0.35 + Math.random() * 0.2 });
      w.cameraRig && w.cameraRig.shake(0.15, 0.25);
    }
  }

  dispose() {
    for (const h of this.houses) h.dispose();
    const S = this.storm;
    if (S) {
      for (const [o, i0] of S.lights) o.intensity = i0;
      const fog = this.d.world.scene.fog;
      if (fog && S.fog) { fog.color.copy(S.fog.c); if (fog.density !== undefined) fog.density = S.fog.dens; }
      this.d.world.scene.remove(S.group);
      S.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      this.storm = null;
    }
  }
}
