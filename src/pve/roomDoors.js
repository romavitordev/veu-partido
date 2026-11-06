// OUTRO LADO — as PORTAS entre as salas e as SETAS-GUIA (pedido do dono, 2026-11-05).
// Cada porta de saída leva a uma sala sorteada (pve/dungeons.js rollExits) e mostra em cima o nome dela e quantos
// monstros tem. Trancada enquanto a sala não termina; depois ABRE quando o jogador chega perto e FECHA quando ele se
// afasta. A porta por onde ele entrou se fecha atrás dele. A escada do hall não tem porta: um círculo no chão.
// As setas no chão em volta do jogador: AMARELAS para as portas (e a recompensa / a saída), AZUL para o baú (opcional).
import * as THREE from 'three';

const WOOD = 0x8a5e3a;
const FRAME = 0x5a3a22;
const tmp = new THREE.Vector3();

function labelSprite(title, sub, color) {
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
  constructor(world, spot, { title = null, sub = null, color = '#f2c230', locked = true, open = 0 } = {}) {
    this.w = world;
    this.spot = spot;
    this.stairs = !!spot.stairs;
    this.locked = locked;
    this.open = open;
    this.want = 0;
    this.t = Math.random() * 6;
    const g = new THREE.Group();
    g.position.set(spot.x, 0, spot.z);
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
    world.scene.add(g);
    this.group = g;
    this.setLocked(locked);
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
    this.want = !this.locked && near ? 1 : this.forceOpen ? 1 : 0;
    const before = this.open;
    this.open += (this.want - this.open) * Math.min(1, dt * (this.want ? 3.2 : 2.4));
    this.creaked = (before < 0.05 && this.open >= 0.05) || (before > 0.95 && this.open <= 0.95);
    for (const pv of this.leaves) pv.rotation.y = pv.userData.side * this.open * 1.45; // abre para dentro da sala
    if (this.label && !this.locked) this.label.material.opacity = 0.85 + 0.15 * Math.sin(this.t * 3);
    if (this.ring) this.ring.material.opacity = 0.4 + 0.3 * Math.sin(this.t * 4);
    if (this.locked) return false;
    if (this.stairs) return Math.hypot(l.x, l.z) < 0.95;
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

// a seta deitada no chão (a ponta para −z), da cor pedida
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
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
  m.renderOrder = 5;
  m.visible = false;
  m.userData.k = 0;
  scene.add(m);
  return m;
}

// aponta a seta `m` do jogador para `t` (ou some, se t for null ou estiver perto)
export function aimArrow(m, p, t, dt, time, radius = 1.5) {
  const far = t && Math.hypot(t.x - p.x, t.z - p.z) > 1.6;
  m.userData.k += ((far ? 1 : 0) - m.userData.k) * Math.min(1, dt * 4);
  m.visible = m.userData.k > 0.02;
  if (!m.visible) return;
  if (far) {
    const yaw = Math.atan2(t.x - p.x, t.z - p.z);
    m.rotation.y = yaw + Math.PI;
    m.position.set(p.x + Math.sin(yaw) * radius, 0.06, p.z + Math.cos(yaw) * radius);
  }
  m.material.opacity = m.userData.k * (0.55 + 0.3 * Math.sin(time * 5));
}
