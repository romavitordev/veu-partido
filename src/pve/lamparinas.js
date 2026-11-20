// AS LAMPARINAS DO CRISTINO no Sertão do Quibungo (pedido do dono, 2026-11-20: "pode ter umas delas no mapa que você
// pode pegar pra arremessar nos animais"). Cânone (Hexatombe ep. 5): Cristino espalhou lampiões no caminho do Quibungo
// e o fogo pulou de um para o outro. PROPOSTA: os pontos no morro, o tempo para reaparecer, o dano e o fogo no chão.
//
// O ciclo: a lamparina fica acesa no chão (a coluna de luz mostra onde) → passar por cima PEGA (uma por vez) → o botão
// de tiro ARREMESSA no bicho mais perto à frente (também nas Araras no ar) → estoura e deixa FOGO NO CHÃO que queima
// quem pisa → depois de `respawn` s outra aparece no mesmo ponto.
import * as THREE from 'three';
import { spikedLantern } from '../models/weapons.js';
import { actionLabel } from '../ui/labels.js';

const FIRE = 0xff7a2a;
export const LAMPS = {
  spots: [[4, 11], [-5, 12], [13, 2], [-13, -2], [3, -13], [-4, -12]], // longe dos barris, dos troncos e da placa
  respawn: 14,
  damage: 90, // o estouro
  radius: 2.6,
  airReach: 4.5, // o estouro pega bicho voando até esta altura acima do ponto
  fire: { radius: 1.8, life: 5, dps: 30 },
  aim: { range: 14, cone: 1.22 },
};

function beacon() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 28), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 5, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  pillar.position.y = 2.5;
  g.add(ring, pillar);
  g.userData.ring = ring;
  g.userData.pillar = pillar;
  return g;
}

export class SertaoLanterns {
  constructor(d, cfg = {}) {
    this.d = d;
    this.w = d.world;
    this.c = { ...LAMPS, ...cfg, fire: { ...LAMPS.fire, ...(cfg.fire || {}) }, aim: { ...LAMPS.aim, ...(cfg.aim || {}) } };
    this.spots = this.c.spots.map(([x, z]) => ({ x, z, it: null, wait: 0 }));
    this.items = [];
    this.flying = [];
    this.fires = [];
    for (const s of this.spots) this.place(s);
  }

  place(s) {
    const g = spikedLantern();
    g.scale.setScalar(2.2);
    g.position.set(s.x, 0.3, s.z);
    const b = beacon();
    b.position.set(s.x, 0, s.z);
    this.w.scene.add(g, b);
    const it = { g, beacon: b, spot: s, holder: null, flying: false };
    s.it = it;
    this.items.push(it);
  }

  // ------------------------------------------------ pegar e arremessar (antes do mundo andar: Dungeon.update)
  input(V) {
    const p = V.p;
    if (p.state === 'ko' || p.state === 'intro') return;
    const pr = V.inp.pressed || {};
    const busy = ['hitstun', 'stun', 'grabbed', 'downed', 'launched'].includes(p.state);
    const held = this.items.find((it) => it.holder === p);
    if (held) {
      V.prompt && V.prompt.show(p.pos, 2.5, `${actionLabel(V.i, 'ranged', V.inp.source)}|Arremessar a lamparina`);
      if (pr.ranged && !busy) {
        pr.ranged = false;
        this.throwItem(held, p);
      }
      return;
    }
    if (busy) return;
    for (const it of this.items) {
      if (it.holder || it.flying) continue;
      if (Math.hypot(it.g.position.x - p.pos.x, it.g.position.z - p.pos.z) > 1.3) continue;
      it.holder = p;
      if (it.beacon) { this.w.scene.remove(it.beacon); it.beacon = null; }
      if (it.spot) { it.spot.it = null; it.spot.wait = this.c.respawn; it.spot = null; }
      this.d.audio.play('pickup', { volume: 0.7, pitch: 0.9 });
      if (!this.told) { this.told = true; this.d.popup(V.i, 'LAMPARINA DO CRISTINO: ARREMESSE NOS BICHOS', '#ff9a3a'); }
      return;
    }
  }

  // os bichos vivos (as Araras contam no ar)
  foes() {
    return (this.d.copias || []).filter((z) => z.alive && z.state !== 'die' && z.state !== 'leave');
  }

  throwItem(it, p) {
    const A = this.c.aim;
    let yaw = p.aimYaw ?? p.yaw;
    let best = null;
    let bd = A.range;
    for (const z of this.foes()) {
      const d = Math.hypot(z.pos.x - p.pos.x, z.pos.z - p.pos.z);
      let dy = Math.atan2(z.pos.x - p.pos.x, z.pos.z - p.pos.z) - yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      if (d < bd && Math.abs(dy) < A.cone) { bd = d; best = z; }
    }
    let to;
    if (best) {
      yaw = Math.atan2(best.pos.x - p.pos.x, best.pos.z - p.pos.z);
      to = new THREE.Vector3(best.pos.x, Math.max(0.05, best.pos.y + 0.6), best.pos.z);
    } else to = new THREE.Vector3(p.pos.x + Math.sin(yaw) * 7, 0.05, p.pos.z + Math.cos(yaw) * 7);
    it.holder = null;
    it.flying = true;
    const from = new THREE.Vector3(p.pos.x + Math.sin(yaw) * 0.5, p.pos.y + 1.6, p.pos.z + Math.cos(yaw) * 0.5);
    const dist = from.distanceTo(to);
    this.flying.push({ it, from, to, t: 0, T: 0.22 + dist * 0.04, who: p, target: best });
    this.d.audio.play('swing', { volume: 0.7, pitch: 0.8 });
  }

  // o ESTOURO: dano em volta (no chão e no ar logo acima) e o fogo no chão
  blast(at, who) {
    const C = this.c;
    const c = new THREE.Vector3(at.x, Math.max(0.4, at.y), at.z);
    this.w.fx.play && this.w.fx.play('FX_EXPLOSION', c, { color: FIRE, scale: C.radius });
    this.w.fx.burst(c, { count: 26, color: 0xffd070, speed: 7, up: 2, life: 0.5, size: 0.3 });
    this.w.fx.burst(c, { count: 10, color: 0xc8c4bc, speed: 9, life: 0.4, size: 0.08 }); // os espinhos voando
    this.d.audio.play('explosion', { volume: 0.85 });
    this.w.cameraRig && this.w.cameraRig.shake(0.25, 0.18);
    for (const z of this.foes()) {
      const h = Math.hypot(z.pos.x - c.x, z.pos.z - c.z);
      if (h > C.radius + (z.radius || 0.5) || z.pos.y > c.y + C.airReach || z.pos.y < c.y - C.airReach) continue;
      z.hitBy(who || this.d.player, C.damage, { kind: 'ability', fire: true });
    }
    this.addFire(at.x, at.z, who);
  }

  addFire(x, z, who) {
    const F = this.c.fire;
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ color: 0xff5a10, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.06, z);
    mesh.renderOrder = 1;
    this.w.scene.add(mesh);
    this.fires.push({ x, z, mesh, t: 0, tick: 0, who });
  }

  update(dt) {
    const t = this.w.time || 0;
    const C = this.c;
    for (const s of this.spots) {
      if (s.it || s.wait <= 0) continue;
      s.wait -= dt;
      if (s.wait <= 0) this.place(s);
    }
    for (const it of this.items) {
      if (it.flying) continue;
      const p = it.holder;
      if (p && (p.state === 'ko' || !this.d.players.includes(p))) { // caiu: a lamparina fica no chão onde estava
        it.holder = null;
        it.g.position.set(p.pos.x, 0.3, p.pos.z);
      }
      if (it.holder) {
        it.g.position.set(it.holder.pos.x, it.holder.pos.y + 2.1, it.holder.pos.z);
        it.g.rotation.y = it.holder.yaw;
      } else it.g.rotation.y += dt * 0.8;
      const fl = it.g.userData.flame;
      if (fl) fl.scale.set(1 + Math.sin(t * 23) * 0.15, 1.6 + Math.sin(t * 17) * 0.25, 1);
      if (it.beacon) {
        it.beacon.userData.ring.material.opacity = 0.3 + Math.sin(t * 4) * 0.15;
        it.beacon.userData.pillar.material.opacity = 0.08 + Math.sin(t * 4) * 0.04;
      }
    }
    for (let i = this.flying.length - 1; i >= 0; i--) {
      const F = this.flying[i];
      F.t += dt;
      // segue o alvo (a Arara se mexe enquanto a lamparina voa)
      if (F.target && F.target.alive) F.to.set(F.target.pos.x, Math.max(0.05, F.target.pos.y + 0.6), F.target.pos.z);
      const u = Math.min(1, F.t / F.T);
      F.it.g.position.lerpVectors(F.from, F.to, u);
      F.it.g.position.y += Math.sin(u * Math.PI) * 1.2;
      F.it.g.rotation.x += dt * 10;
      if (Math.random() < dt * 30) this.w.fx.burst(F.it.g.position.clone(), { count: 1, color: FIRE, speed: 0.3, up: 0.6, life: 0.3, size: 0.18 });
      if (u >= 1) {
        this.flying.splice(i, 1);
        this.items.splice(this.items.indexOf(F.it), 1);
        this.w.scene.remove(F.it.g);
        this.blast(F.to, F.who);
      }
    }
    const R = C.fire.radius;
    for (let i = this.fires.length - 1; i >= 0; i--) {
      const f = this.fires[i];
      f.t += dt;
      const k = f.t / C.fire.life;
      f.mesh.scale.setScalar(R * Math.min(1, f.t / 0.2));
      f.mesh.material.opacity = 0.5 * (k > 0.75 ? (1 - k) / 0.25 : 1) * (0.85 + 0.15 * Math.sin(f.t * 17));
      if (Math.random() < dt * 24 * (1 - k * 0.6)) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * R * 0.9;
        this.w.fx.burst(new THREE.Vector3(f.x + Math.cos(a) * r, 0.1, f.z + Math.sin(a) * r), { count: 2, color: Math.random() < 0.5 ? FIRE : 0xffd070, speed: 0.6, up: 2.6, life: 0.45, size: 0.32 });
      }
      f.tick += dt;
      if (f.tick >= 0.5) { // queima quem pisa (só no chão)
        f.tick = 0;
        for (const z of this.foes()) {
          if (z.pos.y > 1.2 || Math.hypot(z.pos.x - f.x, z.pos.z - f.z) > R + (z.radius || 0.5) * 0.5) continue;
          z.hitBy(f.who || this.d.player, Math.round(C.fire.dps * 0.5), { kind: 'ability', fire: true });
        }
      }
      if (k >= 1) {
        this.w.scene.remove(f.mesh);
        f.mesh.geometry.dispose();
        f.mesh.material.dispose();
        this.fires.splice(i, 1);
      }
    }
  }

  dispose() {
    const S = this.w.scene;
    for (const it of this.items) { S.remove(it.g); if (it.beacon) S.remove(it.beacon); }
    for (const f of this.fires) { S.remove(f.mesh); f.mesh.geometry.dispose(); f.mesh.material.dispose(); }
    this.items = [];
    this.flying = [];
    this.fires = [];
    this.spots = [];
  }
}
