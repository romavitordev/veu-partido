// OUTRO LADO — itens no chão (TODO §4.3 e §6.1):
//  CURA: cai de um inimigo menor (chance configurável na dungeon); flutua no lugar e cura ao encostar.
//  RECOMPENSA DO CHEFE: surge onde o chefe morreu; brilha e pede para o jogador ir até lá (a experiência e o ponto
//  permanente só entram ao coletar).
import * as THREE from 'three';

const PICK_COLORS = { heal: 0x7dffb0, coins: 0xffc040, xp: 0x6ad1ff, proof: 0xc8d8f0, reward: 0xf2c230 };
const small = (k) => k === 'heal' || k === 'coins' || k === 'xp';

export class Pickup {
  constructor(world, { kind = 'heal', pos, amount = 0.2, onTake, radius = 0.9 }) {
    this.world = world;
    this.kind = kind;
    this.amount = amount;
    this.onTake = onTake;
    this.radius = radius;
    this.t = 0;
    this.alive = true;
    this.pos = new THREE.Vector3(pos.x, 0, pos.z);
    const g = new THREE.Group();
    if (kind === 'heal') {
      // um frasco com o brilho verde da cura do jogo (0x7dffb0)
      const glass = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), new THREE.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0.85, toneMapped: false }));
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 8), new THREE.MeshBasicMaterial({ color: 0xc8f8e0 }));
      neck.position.y = 0.2;
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), new THREE.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0.18, depthWrite: false, toneMapped: false }));
      g.add(glass, neck, halo);
    } else if (kind === 'coins' || kind === 'xp' || kind === 'proof') {
      // MOEDAS (o disco dourado), EXPERIÊNCIA (o cristal azul) e a PROVA da Degolificada (o papel com o brilho do Medo)
      const col = PICK_COLORS[kind];
      const geo = kind === 'coins' ? new THREE.CylinderGeometry(0.17, 0.17, 0.05, 16) : kind === 'xp' ? new THREE.OctahedronGeometry(0.17, 0) : new THREE.BoxGeometry(0.34, 0.44, 0.03);
      const core = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, toneMapped: false }));
      if (kind === 'coins') core.rotation.x = Math.PI / 2;
      const halo = new THREE.Mesh(new THREE.SphereGeometry(kind === 'proof' ? 0.55 : 0.3, 12, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18, depthWrite: false, toneMapped: false }));
      g.add(core, halo);
      if (kind === 'proof') {
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5, 12, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
        beam.position.y = 2.4;
        g.add(beam);
      }
    } else {
      // a recompensa: um olho amarelo fechado num cristal (o que sobrou do Espreitador)
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.9, toneMapped: false }));
      gem.scale.y = 1.4;
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: 0x1a1208 }));
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 10), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false }));
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 7, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
      beam.position.y = 3.2;
      g.add(gem, core, halo, beam);
      this.gem = gem;
    }
    // sem luz pontual própria: acender uma luz nova faz o three.js recompilar os materiais (engasgo)
    g.position.copy(this.pos);
    world.scene.add(g);
    this.group = g;
    world.fx.burst(new THREE.Vector3(pos.x, 0.8, pos.z), { count: 14, color: PICK_COLORS[kind] ?? 0xf2c230, speed: 2.4, life: 0.5, size: 0.18, up: 1 });
  }

  update(dt, players) {
    if (!this.alive) return;
    this.t += dt;
    const y = (small(this.kind) ? 0.55 : 1.1) + Math.sin(this.t * 2.6) * 0.1;
    this.group.position.y = y - 0.0;
    this.group.rotation.y += dt * (small(this.kind) ? 1.4 : 0.9);
    if (this.gem) this.gem.rotation.x = Math.sin(this.t) * 0.2;
    if (this.t < 0.5) return; // não coleta no mesmo quadro em que nasceu
    for (const p of players) {
      if (!p || p.state === 'ko') continue;
      if (Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z) <= this.radius + p.radius) {
        this.take(p);
        return;
      }
    }
  }

  take(p) {
    this.alive = false;
    const w = this.world;
    const at = new THREE.Vector3(this.pos.x, 1, this.pos.z);
    if (this.kind === 'heal') {
      const n = Math.round(p.maxHealth * this.amount);
      p.heal(n);
      w.audio.play('pickup', { volume: 0.8 });
      w.ui && w.ui.popup(p.index, `+${n} VIDA`, '#7dffb0');
    } else if (small(this.kind)) {
      w.audio.play('pickup', { volume: 0.8, pitch: this.kind === 'coins' ? 1.4 : 1.1 });
    } else {
      w.audio.play('levelUp', { volume: 1 });
      w.fx.ring(new THREE.Vector3(this.pos.x, 0.05, this.pos.z), { color: PICK_COLORS[this.kind] ?? 0xf2c230, radius: 3, life: 0.7 });
    }
    w.fx.burst(at, { count: 24, color: PICK_COLORS[this.kind] ?? 0xf2c230, speed: 3, life: 0.6, size: 0.2, up: 1.5 });
    this.onTake && this.onTake(p, this);
    this.dispose();
  }

  dispose() {
    this.alive = false;
    if (!this.group) return;
    this.world.scene.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.group = null;
  }
}


// o ícone de uma melhoria (o símbolo do HUD) num sprite que sai do baú
function iconSprite(icon, color) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 8, 64, 64, 62);
  grd.addColorStop(0, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(12,10,16,0.82)';
  g.beginPath();
  g.arc(64, 64, 34, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = color;
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = color;
  g.font = '600 38px Inter, "Segoe UI Symbol", system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(icon, 64, 67);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false, fog: false }));
  s.renderOrder = 8;
  s.scale.setScalar(0.01);
  return s;
}

// a cor do baú pela quantidade de itens: 1 (comum, dourado), 2 (verde), 3 (raro, azul-claro)
export const CHEST_TIERS = [0xffc040, 0xffc040, 0x7dffb0, 0x9ad8ff];

// BAÚ (pedido do dono, 2026-11-05/06): abre pelo botão de interagir. A ANIMAÇÃO: treme e vaza luz pela fresta, a tampa
// abre num estouro de luz (a luz de verdade: `light`, uma PointLight que o Dungeon cria no começo com intensidade 0 —
// acender e apagar não recompila os materiais), um facho sobe e os itens saem flutuando (1 a 3 ícones das melhorias).
// onOpen(p, chest) → [{ icon, colorCss }] (o que saiu: o Dungeon decide e aplica)
export class Chest {
  constructor(world, { pos, yaw = 0, onOpen, manual = false, luck = 0, light = null }) {
    this.world = world;
    this.onOpen = onOpen;
    this.manual = manual; // abre pelo botão de interagir (Outro Lado), não ao encostar
    this.luck = luck; // baú com mais sorte (a sala trancada)
    this.light = light;
    this.radius = 0.75;
    this.t = Math.random() * 5;
    this.alive = true;
    this.opened = false;
    this.anim = null;
    this.pos = new THREE.Vector3(pos.x, 0, pos.z);
    const g = new THREE.Group();
    const wood = new THREE.MeshToonMaterial({ color: 0x5a3a20 });
    const gold = new THREE.MeshToonMaterial({ color: 0xc89a2a, emissive: 0x2a1a00 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.6), wood);
    base.position.y = 0.25;
    g.add(base);
    for (const x of [-0.3, 0.3]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.52, 0.62), gold);
      band.position.set(x, 0.25, 0);
      g.add(band);
    }
    // a luz de dentro (aparece pela fresta e quando abre)
    const inner = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.5), new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0, toneMapped: false }));
    inner.position.y = 0.49;
    g.add(inner);
    // a tampa gira na dobradiça de trás
    const lid = new THREE.Group();
    lid.position.set(0, 0.5, -0.3);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), wood);
    top.position.z = 0.3;
    top.scale.set(1, 0.6, 1);
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.05), gold);
    lock.position.set(0, -0.02, 0.62);
    lid.add(top, lock);
    g.add(lid);
    // o brilho que chama de longe (no breu da mansão)
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffc040, transparent: true, opacity: 0.12, depthWrite: false, toneMapped: false }));
    glow.position.y = 0.4;
    g.add(glow);
    g.position.copy(this.pos);
    g.rotation.y = yaw;
    world.scene.add(g);
    this.group = g;
    this.lid = lid;
    this.glow = glow;
    this.inner = inner;
  }

  update(dt, players) {
    if (!this.group) return;
    this.t += dt;
    if (this.anim) { this.updateAnim(dt); return; }
    if (this.opened) return;
    this.glow.material.opacity = 0.1 + Math.sin(this.t * 3) * 0.05;
    if (this.manual) return;
    for (const p of players) {
      if (!p || p.state === 'ko') continue;
      if (Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z) <= this.radius + p.radius + 0.2) { this.open(p); return; }
    }
  }

  open(p) {
    if (this.opened) return;
    this.opened = true;
    this.anim = { t: 0, p, burst: false, items: [], beam: null, color: CHEST_TIERS[1] };
    this.world.audio.play('creak', { volume: 0.7, pitch: 0.9 });
  }

  updateAnim(dt) {
    const A = this.anim;
    const w = this.world;
    A.t += dt;
    const t = A.t;
    const L = this.light;
    const BURST = 0.55;
    if (t < BURST) {
      // treme e a luz vaza pela fresta
      const k = t / BURST;
      this.group.position.x = this.pos.x + Math.sin(t * 60) * 0.025 * k;
      this.group.position.z = this.pos.z + Math.cos(t * 53) * 0.02 * k;
      this.lid.rotation.x = -0.12 * k + Math.sin(t * 40) * 0.04 * k;
      this.inner.material.opacity = k;
      if (L) { L.position.set(this.pos.x, 0.9, this.pos.z); L.color.setHex(0xffd84a); L.intensity = 4 * k; }
      if (Math.random() < dt * 30) w.fx.burst(new THREE.Vector3(this.pos.x, 0.55, this.pos.z), { count: 1, color: 0xffd84a, speed: 0.8, up: 1.2, life: 0.4, size: 0.06 });
      return;
    }
    if (!A.burst) {
      A.burst = true;
      this.group.position.copy(this.pos);
      const items = (this.onOpen && this.onOpen(A.p, this)) || [];
      A.color = CHEST_TIERS[Math.min(3, Math.max(1, items.length))];
      const col = new THREE.Color(A.color);
      this.inner.material.color.copy(col);
      this.glow.material.color.copy(col);
      if (L) L.color.copy(col);
      w.audio.play('creak', { volume: 0.8, pitch: 1.5 });
      w.audio.play('levelUp', { volume: 0.7, pitch: items.length >= 3 ? 1.25 : 1 });
      w.fx.burst(new THREE.Vector3(this.pos.x, 0.8, this.pos.z), { count: 22 + items.length * 10, color: A.color, speed: 3, life: 0.7, size: 0.12, up: 2.2 });
      w.fx.ring(new THREE.Vector3(this.pos.x, 0.06, this.pos.z), { color: A.color, radius: 1.4 + items.length * 0.3, life: 0.5 });
      // o facho de luz
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 6, 18, 1, true), new THREE.MeshBasicMaterial({ color: A.color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false }));
      beam.position.set(this.pos.x, 3.4, this.pos.z);
      w.scene.add(beam);
      A.beam = beam;
      // os itens: sobem em leque
      A.items = items.map((it, i) => {
        const s = iconSprite(it.icon, it.colorCss || '#ffd84a');
        w.scene.add(s);
        const spread = items.length === 1 ? 0 : (i / (items.length - 1) - 0.5) * 1.3;
        return { s, delay: i * 0.18, spread };
      });
    }
    const k = t - BURST;
    // a tampa abre com um leve rebote
    const lk = Math.min(1, k / 0.22);
    this.lid.rotation.x = -1.95 * lk + Math.sin(Math.min(1, k / 0.5) * Math.PI) * 0.15 * (1 - lk * 0.5);
    // a luz: estouro, depois assenta e apaga
    if (L) L.intensity = k < 0.12 ? 4 + (k / 0.12) * 14 : k < 2.4 ? 18 - Math.min(1, (k - 0.12) / 0.5) * 12 : Math.max(0, 6 * (1 - (k - 2.4) / 0.9));
    if (A.beam) {
      const bo = k < 0.3 ? k / 0.3 : k < 2.2 ? 1 : Math.max(0, 1 - (k - 2.2) / 0.8);
      A.beam.material.opacity = 0.32 * bo;
      A.beam.scale.set(1 + Math.sin(t * 6) * 0.04, 0.3 + 0.7 * Math.min(1, k / 0.3), 1 + Math.sin(t * 6) * 0.04);
    }
    this.inner.material.opacity = Math.max(0, 1 - Math.max(0, k - 2.2) / 0.8);
    this.glow.material.opacity = 0.25 * Math.max(0, 1 - k / 3);
    for (const it of A.items) {
      const e = k - it.delay;
      if (e < 0) continue;
      const up = Math.min(1, e / 0.7);
      const ease = 1 - Math.pow(1 - up, 3);
      const size = e < 2.4 ? 0.62 * Math.min(1, e / 0.25) : Math.max(0.01, 0.62 * (1 - (e - 2.4) / 0.4));
      it.s.scale.setScalar(size);
      it.s.position.set(this.pos.x + it.spread * ease, 0.7 + ease * 1.5 + Math.sin(t * 3 + it.delay * 9) * 0.06, this.pos.z);
      if (e > 2.8) it.s.visible = false;
    }
    if (k > 3.4) this.endAnim();
  }

  endAnim() {
    const A = this.anim;
    if (!A) return;
    this.anim = null;
    if (this.light) this.light.intensity = 0;
    if (A.beam) { this.world.scene.remove(A.beam); A.beam.geometry.dispose(); A.beam.material.dispose(); }
    for (const it of A.items) { this.world.scene.remove(it.s); it.s.material.map.dispose(); it.s.material.dispose(); }
    this.lid.rotation.x = -1.95;
  }

  dispose() {
    this.endAnim();
    this.alive = false;
    if (!this.group) return;
    this.world.scene.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.group = null;
  }
}
