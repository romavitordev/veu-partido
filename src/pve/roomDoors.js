// OUTRO LADO — as PORTAS entre as salas e as SETAS-GUIA (pedido do dono, 2026-11-05).
// Cada porta de saída leva a uma sala sorteada (pve/dungeons.js rollExits) e mostra em cima o nome dela e quantos
// monstros tem. Trancada enquanto a sala não termina; depois ABRE quando o jogador chega perto e FECHA quando ele se
// afasta. A porta por onde ele entrou se fecha atrás dele. A escada do hall não tem porta: um círculo no chão.
// As setas no chão em volta do jogador: AMARELAS para as portas (e a recompensa / a saída), AZUL para o baú (opcional).
import * as THREE from 'three';

const WOOD = 0x8a5e3a;
const FRAME = 0x5a3a22;
const tmp = new THREE.Vector3();

export function labelSprite(title, sub, color) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(8,5,6,0.78)';
  g.beginPath();
  g.roundRect(6, 6, 500, 148, 22);
  g.fill();
  g.strokeStyle = color;
  g.lineWidth = 4;
  g.stroke();
  g.textAlign = 'center';
  g.fillStyle = color;
  g.font = 'bold 50px Georgia, serif';
  g.fillText(title, 256, 70, 470);
  if (sub) {
    g.fillStyle = '#e8dcc8';
    g.font = '38px Georgia, serif';
    g.fillText(sub, 256, 124, 470);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, fog: false }));
  s.scale.set(1.9, 0.6, 1);
  return s;
}

export class RoomDoor {
  // spot: { x, z, face, w, stairs } (face = para onde a porta olha, para DENTRO da sala)
  constructor(world, spot, { title = null, sub = null, color = '#f2c230', locked = true, open = 0, padlock = false } = {}) {
    this.w = world;
    this.spot = spot;
    this.stairs = !!spot.stairs && !spot.landing; // landing: a porta no alto da escada (sobe-se andando)
    this.locked = locked;
    this.open = open;
    this.want = 0;
    this.t = Math.random() * 6;
    const g = new THREE.Group();
    g.position.set(spot.x, spot.y || 0, spot.z);
    g.rotation.y = spot.face || 0;
    this.leaves = [];
    const W = spot.w || 1.4;
    const H = W > 2 ? 2.62 : 2.3;
    this.half = W / 2;
    if (this.stairs) {
      // a escada: um círculo no chão ao pé dela
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 32), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.6, toneMapped: false, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      g.add(ring);
      this.ring = ring;
    } else {
      const fm = new THREE.MeshToonMaterial({ color: FRAME, emissive: 0x1e1008 }); // um brilho próprio: a casa é escura demais para a madeira aparecer
      for (const s of [-1, 1]) {
        const j = new THREE.Mesh(new THREE.BoxGeometry(0.14, H + 0.12, 0.16), fm);
        j.position.set(s * (W / 2 + 0.07), (H + 0.12) / 2, 0.04);
        g.add(j);
      }
      const lin = new THREE.Mesh(new THREE.BoxGeometry(W + 0.28, 0.16, 0.18), fm);
      lin.position.set(0, H + 0.08, 0.04);
      g.add(lin);
      // o escuro do outro lado (aparece quando ela abre)
      const dark = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ color: 0x020102 }));
      dark.position.set(0, H / 2, 0.006);
      g.add(dark);
      // destrancada, a porta ganha um brilho quente em volta: a luz guia o olho até a saída (skill level-design)
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.7, H + 0.5), new THREE.MeshBasicMaterial({ color: 0xffc860, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      glow.position.set(0, (H + 0.5) / 2 - 0.1, 0.12);
      g.add(glow);
      this.glow = glow;
      const lm = new THREE.MeshToonMaterial({ color: WOOD, emissive: 0x3a2412 });
      const km = new THREE.MeshStandardMaterial({ color: 0x9a7a3a, metalness: 0.7, roughness: 0.35 });
      const n = W > 2 ? 2 : 1;
      const lw = W / n;
      for (let i = 0; i < n; i++) {
        const side = n === 1 ? -1 : i === 0 ? -1 : 1; // a dobradiça: esquerda (−1) ou direita (+1)
        const pivot = new THREE.Group();
        pivot.position.set(side === -1 ? -W / 2 : W / 2, 0, 0.05);
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(lw - 0.03, H - 0.03, 0.06), lm);
        leaf.position.set(-side * lw / 2, H / 2, 0);
        const panel = new THREE.Mesh(new THREE.BoxGeometry(lw * 0.6, H * 0.34, 0.02), fm);
        panel.position.set(-side * lw / 2, H * 0.68, 0.035);
        const panel2 = panel.clone();
        panel2.position.y = H * 0.3;
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), km);
        knob.position.set(-side * (lw - 0.14), 1.05, 0.06);
        pivot.add(leaf, panel, panel2, knob);
        pivot.userData.side = side;
        g.add(pivot);
        this.leaves.push(pivot);
      }
    }
    if (title) {
      this.label = labelSprite(title, sub, color);
      this.label.position.set(0, this.stairs ? 2.3 : H + 0.55, 0.35);
      g.add(this.label);
    }
    // o CADEADO (pedido do dono, 2026-11-06): só abre com uma chave achada nas gavetas
    if (padlock && !this.stairs) {
      const pl = new THREE.Group();
      const gold = new THREE.MeshStandardMaterial({ color: 0xb08a30, metalness: 0.7, roughness: 0.35, emissive: 0x2a1a04 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.08), gold);
      const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 6, 14, Math.PI), gold);
      shackle.position.y = 0.1;
      const chain = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, 0.05, 0.03), new THREE.MeshStandardMaterial({ color: 0x3a3a3c, metalness: 0.6, roughness: 0.5 }));
      chain.position.set(0, 0.06, -0.02);
      pl.add(chain, body, shackle);
      pl.position.set(0, 1.1, 0.14);
      g.add(pl);
      this.padlock = pl;
    }
    world.scene.add(g);
    this.group = g;
    this.setLocked(locked);
  }

  // abre o cadeado (com a chave): ele cai e some
  unpad() {
    if (!this.padlock) return;
    this.group.remove(this.padlock);
    this.padlock.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.padlock = null;
  }

  setLocked(on) {
    this.locked = on;
    if (this.label) {
      this.label.material.color.setHex(on ? 0x6a6266 : 0xffffff);
      this.label.material.opacity = on ? 0.7 : 1;
    }
    if (this.ring) this.ring.visible = !on;
  }

  // a posição do jogador no espaço da porta: x de lado, z para dentro da sala
  local(p) {
    const a = this.group.rotation.y;
    const dx = p.x - this.spot.x;
    const dz = p.z - this.spot.z;
    return { x: dx * Math.cos(a) - dz * Math.sin(a), z: dx * Math.sin(a) + dz * Math.cos(a) };
  }

  // devolve true quando o jogador ATRAVESSA (porta destrancada, aberta e ele encostado nela)
  update(dt, p) {
    this.t += dt;
    const l = this.local(p);
    const near = Math.abs(l.x) < this.half + 1.2 && l.z < 2.4;
    this.near = near;
    // a porta só abre pelo botão de interagir (pedido do dono, 2026-11-06); aberta, fica aberta
    this.want = (!this.locked && this.opened) || this.forceOpen ? 1 : 0;
    const before = this.open;
    this.open += (this.want - this.open) * Math.min(1, dt * (this.want ? 3.2 : 2.4));
    this.creaked = (before < 0.05 && this.open >= 0.05) || (before > 0.95 && this.open <= 0.95);
    for (const pv of this.leaves) pv.rotation.y = pv.userData.side * this.open * 1.45; // abre para dentro da sala
    if (this.label && !this.locked) this.label.material.opacity = 0.85 + 0.15 * Math.sin(this.t * 3);
    if (this.ring) this.ring.material.opacity = 0.4 + 0.3 * Math.sin(this.t * 4);
    if (this.glow) this.glow.material.opacity += ((this.locked ? 0 : 0.1 + 0.05 * Math.sin(this.t * 2.5)) - this.glow.material.opacity) * Math.min(1, dt * 3);
    if (this.locked) return false;
    if (this.stairs) return false; // a escada: o botão leva direto (Dungeon.interact)
    return this.open > 0.6 && Math.abs(l.x) < this.half + 0.25 && l.z < 1.05;
  }

  // o ponto para onde a seta aponta (na frente da porta)
  target(v = tmp) {
    const a = this.group.rotation.y;
    return v.set(this.spot.x + Math.sin(a) * 0.6, 0, this.spot.z + Math.cos(a) * 0.6);
  }

  dispose() {
    this.w.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    });
  }
}

// a distância do jogador até a porta, para o botão de interagir (de frente para ela, perto)
RoomDoor.prototype.reach = function reach(p) {
  const l = this.local(p);
  if (this.stairs) return Math.hypot(l.x, l.z) < 1.4 ? Math.hypot(l.x, l.z) : Infinity;
  return Math.abs(l.x) < this.half + 0.5 && l.z > -0.2 && l.z < 1.9 ? l.z : Infinity;
};

// GAVETA (pedido do dono, 2026-11-06): nos criados-mudos, aparadores, cômodas e armários das salas. Abre pelo botão de
// interagir e pode ter a CHAVE de uma porta com cadeado, MOEDAS ou nada. Não há aviso de onde está a chave.
export class Drawer {
  // spot: { x, y, z, face } na frente do móvel (face = para onde a gaveta abre)
  constructor(world, spot, content = null) {
    this.w = world;
    this.spot = spot;
    this.content = content; // { kind: 'key' } | { kind: 'coins', amount } | null
    this.opened = false;
    this.k = 0;
    this.pos = new THREE.Vector3(spot.x, 0, spot.z);
    const g = new THREE.Group();
    g.position.set(spot.x, spot.y ?? 0.6, spot.z);
    g.rotation.y = spot.face || 0;
    const wood = new THREE.MeshToonMaterial({ color: 0x6a4428, emissive: 0x24140a });
    const slide = new THREE.Group();
    const front = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.17, 0.03), wood);
    front.position.z = 0.015;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.34), new THREE.MeshToonMaterial({ color: 0x2a1a10 }));
    box.position.set(0, -0.01, -0.17);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshStandardMaterial({ color: 0x9a7a3a, metalness: 0.7, roughness: 0.35 }));
    knob.position.set(0, 0, 0.045);
    slide.add(front, box, knob);
    if (content && content.kind === 'key') {
      const key = new THREE.Group();
      const km = new THREE.MeshBasicMaterial({ color: 0xe8c050, toneMapped: false });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 12), km);
      ring.rotation.x = Math.PI / 2;
      const stem = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.1), km);
      stem.position.z = -0.06;
      key.add(ring, stem);
      key.position.set(0, 0.06, -0.15);
      slide.add(key);
      this.keyMesh = key;
    }
    g.add(slide);
    world.scene.add(g);
    this.group = g;
    this.slide = slide;
  }

  reach(p) {
    const d = Math.hypot(p.x - this.spot.x, p.z - this.spot.z);
    return !this.opened && d < 1.25 ? d : Infinity;
  }

  open() {
    this.opened = true;
    return this.content;
  }

  update(dt) {
    this.k += ((this.opened ? 1 : 0) - this.k) * Math.min(1, dt * 7);
    this.slide.position.z = this.k * 0.26;
    if (this.keyMesh && this.opened) {
      // a chave sobe brilhando e some (foi para o bolso)
      this.keyMesh.position.y += dt * 0.6;
      this.keyMesh.rotation.y += dt * 6;
      if (this.keyMesh.position.y > 0.6) { this.slide.remove(this.keyMesh); this.keyMesh = null; }
    }
  }

  dispose() {
    this.w.scene.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }
}

// o AVISO do botão ("E · Abrir"), flutuando em cima do que dá para usar
export class InteractPrompt {
  constructor(world) {
    this.w = world;
    this.key = '';
    this.sprite = null;
  }

  show(pos, y, text) {
    if (text !== this.key) {
      this.hide();
      this.key = text;
      const [btn, verb] = text.split('|');
      this.sprite = labelSprite(btn, verb, '#f2c230');
      this.sprite.scale.set(1.1, 0.35, 1);
      this.sprite.material.depthTest = false; // o aviso aparece mesmo atrás do móvel
      this.sprite.renderOrder = 9;
      this.w.scene.add(this.sprite);
    }
    this.sprite.position.set(pos.x, y, pos.z);
  }

  hide() {
    if (!this.sprite) return;
    this.w.scene.remove(this.sprite);
    this.sprite.material.map.dispose();
    this.sprite.material.dispose();
    this.sprite = null;
    this.key = '';
  }
}

// a seta FLUTUANTE (pedido do dono, 2026-11-06: no chão ela sumia): uma seta 3D na altura do peito, ao lado do jogador,
// apontando para o alvo; sempre visível (as paredes e os lutadores não tapam), com um contorno escuro e balançando
export function makeArrow(scene, color) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.55);
  shape.lineTo(0.38, 0.05);
  shape.lineTo(0.16, 0.05);
  shape.lineTo(0.16, -0.45);
  shape.lineTo(-0.16, -0.45);
  shape.lineTo(-0.16, 0.05);
  shape.lineTo(-0.38, 0.05);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.09, bevelEnabled: false });
  geo.translate(0, 0, -0.045);
  geo.rotateX(-Math.PI / 2); // deitada, a ponta para −z
  const m = new THREE.Group();
  const body = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, toneMapped: false, depthTest: false, depthWrite: false }));
  const edge = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x0a0608, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
  edge.scale.setScalar(1.22);
  edge.renderOrder = 9;
  body.renderOrder = 10;
  m.add(edge, body);
  m.scale.setScalar(0.75);
  m.visible = false;
  m.userData = { k: 0, body, edge };
  scene.add(m);
  return m;
}

// aponta a seta `m` do jogador para `t` (ou some, se t for null ou estiver perto)
export function aimArrow(m, p, t, dt, time, radius = 1.5) {
  const far = t && Math.hypot(t.x - p.x, t.z - p.z) > 1.6;
  const u = m.userData;
  u.k += ((far ? 1 : 0) - u.k) * Math.min(1, dt * 4);
  m.visible = u.k > 0.02;
  if (!m.visible) return;
  if (far) {
    const yaw = Math.atan2(t.x - p.x, t.z - p.z);
    m.rotation.set(0, yaw + Math.PI, 0);
    const bob = Math.sin(time * 3 + radius * 5) * 0.07;
    const push = 0.12 * Math.sin(time * 4); // vai e volta na direção do alvo
    m.position.set(p.x + Math.sin(yaw) * (radius + push), 1.05 + bob, p.z + Math.cos(yaw) * (radius + push));
  }
  u.body.material.opacity = u.k * 0.95;
  u.edge.material.opacity = u.k * 0.6;
}
