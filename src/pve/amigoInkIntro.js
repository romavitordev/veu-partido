import * as THREE from 'three';
import { inkSplash, inkTentacle, ghostBell } from '../fx/inkFx.js';
import { SETTINGS } from '../config/settings.js';

// A ENTRADA DO AMIGO IMAGINÁRIO (a onda final de Tipora). Pedido do dono (2026-11-20): "quando o boss Amigo imaginário
// estiver surgindo deve escorrer tinta pela tela, vindo de cima da tela, escorrendo por toda tela e quando o amigo
// imaginario finalmente surgir a tinta cobre a tela toda, fica tudo cheio de tinta e pisca o rosto do amigo imaginario,
// ele encara a tela em primeira pessoa, acaba a cutscene e começa a luta".
//  - SURGE: ele sobe da poça de tinta (tentáculos e o sino fantasma), e a tinta começa a escorrer do alto da tela;
//  - COBRE: os filetes engrossam e a tinta toma a tela inteira;
//  - O ROSTO: a câmera corta para a frente do rosto dele, encarando quem joga; a tinta pisca e o rosto aparece aos
//    lampejos;
//  - ESCORRE: a tinta desce e sai da tela, a luta começa.
const T = { drip: 0.25, flood: 2.5, full: 3.0, face: 3.15, flashEnd: 4.35, clear: 4.6, end: 5.2 };
const INK = '#160804';
const INK_HI = '#3a1a0c';

export class AmigoInkIntro {
  constructor(d, at) {
    this.d = d;
    this.w = d.world;
    this.at = at.clone();
    this.t = 0;
    this.c = null;
    const e = d.enemy;
    const w = this.w;
    inkSplash(w, new THREE.Vector3(at.x, 0.04, at.z), { size: 2.4, life: 4 });
    w.fx.burst(new THREE.Vector3(at.x, 0.4, at.z), { count: 50, color: 0x2a120a, kind: 'smoke', speed: 2.6, life: 1.1, size: 1, grow: 1 });
    this.bell = ghostBell(w, () => this.headPos().add(new THREE.Vector3(0, 1.1, 0)), { life: 3.0, size: 0.8 });
    this.tendrils = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const from = new THREE.Vector3(at.x + Math.sin(a) * 1.6, 0.03, at.z + Math.cos(a) * 1.6);
      this.tendrils.push(inkTentacle(w, from, () => e.chestPos(), { grow: 0.5, hold: 2.0, retract: 0.4, radius: 0.12, arc: 1.2, coil: true }));
    }
    this.shots();
    w.beginCinematic(e, null);
    d.audio.play('bellToll', { volume: 0.9, pitch: 0.8 });
    d.hud.callout(d.D.bossName, d.D.color);
    this.makeOverlay();
  }

  // o ponto do rosto (o osso da cabeça do modelo; sem ele, uma altura pelo tamanho)
  headPos(out = new THREE.Vector3()) {
    const e = this.d.enemy;
    // o Amigo é um lutador: a junta da cabeça do rig (hd); sem ela, um osso "head" do modelo
    const hd = e.rig && e.rig.joints && e.rig.joints.hd;
    if (hd) return hd.getWorldPosition(out);
    if (this.head === undefined) {
      this.head = null;
      e.rig && e.rig.root && e.rig.root.traverse((o) => { if (!this.head && o.isBone && /head/i.test(o.name)) this.head = o; });
    }
    if (this.head) {
      this.head.getWorldPosition(out);
      return out;
    }
    return out.set(e.pos.x, e.pos.y + 1.65 * (e.size || 1), e.pos.z);
  }

  shots() {
    const d = this.d;
    const e = d.enemy;
    const at = this.at;
    const fwd = new THREE.Vector3(Math.sin(e.yaw), 0, Math.cos(e.yaw));
    const side = new THREE.Vector3(fwd.z, 0, -fwd.x);
    const focus = () => e.chestPos();
    this.w.cameraRig.playShots([
      // ele sobe da poça (de longe, depois mais perto)
      { dur: 1.2, pos: () => at.clone().addScaledVector(fwd, 6).addScaledVector(side, 3).setY(2.2), look: focus },
      { dur: T.full - 1.2, pos: (k) => at.clone().addScaledVector(fwd, 4.4 - k * 0.8).addScaledVector(side, -2.2).setY(2.6), look: focus },
      // a tinta cobriu tudo: o corte seco para a frente do rosto, encarando a tela
      { dur: T.end - T.full + 0.4, cut: true, fov: 38, pos: (k) => this.headPos().addScaledVector(fwd, 1.25 * (e.size || 1) - k * 0.2), look: () => this.headPos() },
    ]);
  }

  // ---------------------------------------------------------------- a tinta na TELA (canvas 2D por cima de tudo)
  makeOverlay() {
    const cv = document.createElement('canvas');
    cv.className = 'ink-screen';
    Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '60' });
    document.body.appendChild(cv);
    this.cv = cv;
    this.ctx = cv.getContext('2d');
    this.resize();
    // os filetes: cada um nasce no alto num momento, desce acelerando e engrossa; a "gota" na ponta
    this.drips = [];
    const n = 46;
    for (let i = 0; i < n; i++) {
      this.drips.push({
        x: (i + Math.random() * 0.8) / n,
        w: 0.006 + Math.random() * 0.02,
        delay: T.drip + Math.random() * 1.4,
        speed: 0.18 + Math.random() * 0.35,
        wob: Math.random() * 6,
      });
    }
  }

  resize() {
    const k = 0.5; // meia resolução: é tinta, não precisa de nitidez
    const W = Math.max(2, Math.round(innerWidth * k));
    const H = Math.max(2, Math.round(innerHeight * k));
    if (this.cv.width !== W || this.cv.height !== H) { this.cv.width = W; this.cv.height = H; }
  }

  drawInk() {
    const t = this.t;
    const c = this.ctx;
    const W = this.cv.width;
    const H = this.cv.height;
    c.clearRect(0, 0, W, H);
    if (t >= T.end) return;
    // a tinta saindo da tela no fim: tudo desce
    const slide = t > T.clear ? ((t - T.clear) / (T.end - T.clear)) ** 1.6 * H * 1.15 : 0;
    // a faixa de cima (de onde tudo escorre) cresce; no alagamento, a frente da tinta desce até o fim da tela
    const flood = t < T.flood ? 0 : Math.min(1, (t - T.flood) / (T.full - T.flood));
    const band = H * (0.03 + Math.min(0.1, Math.max(0, t - T.drip) * 0.05)) + flood * H * 1.05;
    c.save();
    c.translate(0, slide);
    c.fillStyle = INK;
    // a frente ondulada da faixa
    c.beginPath();
    c.moveTo(0, -H);
    c.lineTo(0, band);
    for (let x = 0; x <= W; x += W / 40) c.lineTo(x, band + Math.sin(x * 0.05 + t * 3) * H * 0.012);
    c.lineTo(W, -H);
    c.closePath();
    c.fill();
    // os filetes
    for (const dp of this.drips) {
      const lt = t - dp.delay;
      if (lt <= 0) continue;
      const len = band + H * dp.speed * lt * lt * 1.4 + H * 0.05 * lt;
      const x = dp.x * W + Math.sin(lt * 1.3 + dp.wob) * W * 0.003;
      const ww = W * dp.w * (1 + lt * 0.8 + flood * 3);
      c.fillStyle = INK;
      c.fillRect(x - ww / 2, 0, ww, len);
      c.beginPath();
      c.ellipse(x, len, ww * 0.85, ww * 1.15, 0, 0, Math.PI * 2); // a gota na ponta
      c.fill();
      if (flood < 1) { // o brilho úmido de um lado do filete (some quando a tinta toma a tela: virava listras)
        c.globalAlpha = 1 - flood;
        c.fillStyle = INK_HI;
        c.fillRect(x - ww * 0.3, 0, Math.max(1, ww * 0.12), len * 0.96);
        c.globalAlpha = 1;
      }
    }
    c.restore();
  }

  // ---------------------------------------------------------------- linha do tempo
  update(dt) {
    if (this.done) return true;
    this.t += dt;
    const t = this.t;
    const d = this.d;
    const w = this.w;
    const e = d.enemy;
    // ele SOBE da poça: o modelo começa afundado e emerge até a tinta cobrir a tela
    const rise = Math.min(1, t / (T.full - 0.3));
    const sink = (1 - (1 - (1 - rise) * (1 - rise))) * 3.2 * (e.size || 1);
    if (e.rig && e.rig.root) e.rig.root.position.y = e.pos.y - sink;
    if (t < T.full && Math.random() < 0.5) w.fx.burst(new THREE.Vector3(this.at.x, 0.2, this.at.z), { count: 4, color: 0x5a1e10, speed: 1.6, up: 2, life: 0.5, size: 0.3 });
    if (t > 1.0 && !this.tolled) {
      this.tolled = true;
      this.bell.toll();
      d.audio.play('bellToll', { volume: 0.8, pitch: 0.65 });
    }
    if (t > T.full && !this.covered) {
      this.covered = true;
      // uma luz fria na cara dele: o Amigo é tinta preta na noite de Tipora — sem ela, o rosto não aparecia nos lampejos
      const fwd = new THREE.Vector3(Math.sin(e.yaw), 0, Math.cos(e.yaw));
      this.faceLight = new THREE.PointLight(0xd8e4ff, 9, 5 * (e.size || 1), 1.5);
      this.faceLight.position.copy(this.headPos()).addScaledVector(fwd, 0.9 * (e.size || 1)).add(new THREE.Vector3(0, 0.35, 0));
      w.scene.add(this.faceLight);
      d.audio.play('fearGaze', { volume: 1, pitch: 0.5 });
      w.cameraRig.shake && w.cameraRig.shake(0.2, 0.3);
    }
    // O ROSTO: a tinta pisca e ele aparece aos lampejos, encarando
    let alpha = 1;
    if (t > T.face && t < T.flashEnd) {
      const k = (t - T.face) / (T.flashEnd - T.face);
      // (2026-11-26, acessibilidade) eram 9 trechos em 1,2 s: a tela inteira trocava de tinta para o rosto ≈3,75
      // vezes por segundo. Agora são 6 trechos (3 lampejos, 2,5 por segundo, abaixo do limite de 3), e com "Efeitos
      // de tela reduzidos" a tinta só clareia, devagar, sem piscar
      const blink = SETTINGS.reduceFx ? k > 0.15 : Math.floor(k * 6) % 2 === 1;
      alpha = SETTINGS.reduceFx ? 1 - 0.92 * Math.min(1, k / 0.6) : blink || k > 0.82 ? 0.08 : 1;
      if (blink && !this.lastBlink) d.audio.play('fearGaze', { volume: 0.6, pitch: 0.35 + Math.random() * 0.2 });
      this.lastBlink = blink;
    } else if (t >= T.flashEnd && t < T.clear) alpha = 0.08;
    else if (t >= T.clear) alpha = 1;
    this.resize();
    this.drawInk();
    this.cv.style.opacity = String(alpha);
    if (t < T.end) return false;
    this.finish();
    return true;
  }

  finish() {
    if (this.done) return;
    this.done = true;
    const e = this.d.enemy;
    if (e.rig && e.rig.root) e.rig.root.position.y = e.pos.y;
    this.tendrils.forEach((h) => h.release && h.release());
    if (this.w.cinematic) this.w.endCinematic();
    this.dispose();
  }

  // sair do jogo no meio da cena (Dungeon.dispose) também limpa a tinta da tela
  dispose() {
    if (this.cv) { this.cv.remove(); this.cv = null; }
    if (this.faceLight) { this.faceLight.removeFromParent(); this.faceLight.dispose(); this.faceLight = null; }
    if (!this.done) {
      this.done = true;
      this.tendrils.forEach((h) => h.release && h.release());
      if (this.w.cinematic) this.w.endCinematic();
    }
  }
}
