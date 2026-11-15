import * as THREE from 'three';
import { World } from './World.js';
import { ARENAS } from '../arena/index.js';
import { accelerate } from '../render/bvh.js';
import { acousticsFor } from '../audio/acoustics.js';
import { viewSize } from '../core/viewport.js';

// MODO EXPLORAR (pedido do dono, 2026-11-15: "um botão meio escondido, não no menu, que leva ao menu de mapas e ele
// pode escolher um mapa para explorar, tipo o modo espectador do Minecraft, só que com colisão nas paredes e chão, só
// pra poder ver o mapa completo"). Uma câmera que voa para onde olha, sem lutadores, sem HUD de luta. Ela não atravessa
// parede, teto nem chão: cada passo é um raio contra a malha do cenário (com a árvore BVH de render/bvh.js) e, quando
// bate, desliza pela superfície.

export const EXPLORE = {
  radius: 0.35, // o "corpo" da câmera: a distância mínima até qualquer superfície
  speed: 6, // m/s
  fast: 2.6, // multiplicador com Shift / L3
  lookMouse: 0.0024, // rad por pixel
  lookPad: 2.4, // rad/s no analógico direito
  maxStep: 0.25, // passo máximo por raio (m): nada de pular uma parede fina num quadro lento
  ceiling: 70, // altura máxima (m)
  floor: 0.25, // sem chão embaixo (fora do cenário): a câmera não desce abaixo disto
};

const ray = new THREE.Raycaster();
const tmpN = new THREE.Vector3();
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((d) => new THREE.Vector3(...d));

// primeiro acerto de um raio contra as malhas sólidas, com a normal no mundo virada contra o raio
export function castSolid(meshes, origin, dir, far) {
  ray.set(origin, dir);
  ray.near = 0;
  ray.far = far;
  ray.firstHitOnly = true; // three-mesh-bvh
  const hit = ray.intersectObjects(meshes, false)[0];
  ray.firstHitOnly = false;
  if (!hit) return null;
  const n = hit.face ? tmpN.copy(hit.face.normal).transformDirection(hit.object.matrixWorld) : tmpN.copy(dir).negate();
  if (n.dot(dir) > 0) n.negate(); // malha de dois lados: a normal sempre contra quem chega
  return { distance: hit.distance, normal: n.clone() };
}

// anda `delta` a partir de `pos` (muda pos) sem entrar nas superfícies: desliza ao bater. Pura (testes em Node).
export function moveWithCollision(pos, delta, meshes, r = EXPLORE.radius) {
  const total = delta.length();
  if (total < 1e-6) return pos;
  const steps = Math.ceil(total / EXPLORE.maxStep);
  const step = delta.clone().divideScalar(steps);
  for (let s = 0; s < steps; s++) {
    let d = step.clone();
    // até 3 superfícies por passo (um canto: parede + chão + outra parede)
    for (let k = 0; k < 3; k++) {
      const len = d.length();
      if (len < 1e-6) break;
      const dir = d.clone().divideScalar(len);
      const hit = castSolid(meshes, pos, dir, len + r);
      if (!hit) { pos.add(d); d.set(0, 0, 0); break; }
      // chega até ficar a r da superfície e tira o que entraria nela; o resto desliza
      const free = Math.max(0, hit.distance - r);
      pos.addScaledVector(dir, free);
      d.addScaledVector(dir, -free);
      const into = d.dot(hit.normal);
      if (into < 0) d.addScaledVector(hit.normal, -into);
    }
    pushOut(pos, meshes, r);
  }
  return pos;
}

// encostou demais (quina, malha fina): empurra para fora pelos seis eixos
function pushOut(pos, meshes, r) {
  for (const dir of DIRS) {
    const hit = castSolid(meshes, pos, dir, r);
    if (hit) pos.addScaledVector(dir, -(r - hit.distance + 0.002));
  }
}

// as malhas que contam como parede/chão: tudo visível do cenário, menos o céu (lado de dentro) e partículas
export function solidMeshes(root) {
  const out = [];
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh || o.isSkinnedMesh) return;
    let vis = true;
    for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; }
    if (!vis) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    if (mats.every((m) => m && (m.side === THREE.BackSide || (m.transparent && m.opacity < 0.35) || m.depthWrite === false))) return;
    if (/sky|ceu|céu|fog|nevoa|névoa/i.test(o.name || '')) return;
    out.push(o);
  });
  return out;
}

export class Explorer {
  constructor({ renderer, audio, input, root, arenaId }) {
    this.input = input;
    this.audio = audio;
    this.arenaId = arenaId;
    const A = ARENAS[arenaId];
    this.world = new World({ renderer, audio, input, ui: null });
    const w = this.world;
    w.arena = A.create();
    w.arena.build(w.scene);
    accelerate(w.arena.group);
    audio.listener = w.camera;
    if (audio.setAcoustics) audio.setAcoustics(acousticsFor(arenaId));
    this.solids = solidMeshes(w.arena.group || w.scene);
    this.center = new THREE.Vector3();
    const sp = w.arena.spawns || [{ x: -3, z: 0 }, { x: 3, z: 0 }];
    this.center.set((sp[0].x + sp[1].x) / 2, 0, (sp[0].z + sp[1].z) / 2);
    this.range = Math.max(40, (w.arena.radius || 30) * 3);
    // começa de onde a luta é vista: de lado para os dois pontos de partida, um pouco acima
    const ax = sp[1].x - sp[0].x;
    const az = sp[1].z - sp[0].z;
    const l = Math.hypot(ax, az) || 1;
    this.pos = new THREE.Vector3(this.center.x - (az / l) * 9, 3.2, this.center.z + (ax / l) * 9);
    this.yaw = Math.atan2(this.pos.x - this.center.x, this.pos.z - this.center.z);
    this.pitch = -0.18;
    const cam = w.camera;
    cam.rotation.order = 'YXZ';
    cam.near = 0.1;
    cam.far = 400;
    const { w: vw, h: vh } = viewSize();
    cam.aspect = vw / vh;
    cam.updateProjectionMatrix();
    pushOut(this.pos, this.solids, EXPLORE.radius);
    input.freeLook = true; // o mouse gira a câmera (clique trava o ponteiro), o analógico direito também

    this.el = document.createElement('div');
    this.el.className = 'explore-hud';
    this.el.innerHTML = `<div class="ex-name">${A.name}</div>
      <div class="ex-help"><b>Mouse</b> olha · <b>WASD</b> anda · <b>Espaço</b> sobe · <b>Ctrl</b> desce · <b>Shift</b> corre · <b>Esc</b> sai<br>
      Controle: analógico esquerdo anda · <b>direito olha</b> · <b>R2</b>/<b>L2</b> sobe/desce · <b>L3</b> corre · <b>B</b> sai</div>`;
    root.appendChild(this.el);
    // o mouse já olha ao entrar (o clique/tecla que escolheu o cenário ainda vale como gesto); se o navegador recusar,
    // um clique na tela trava o ponteiro (InputManager)
    const cv = renderer.domElement;
    if (cv && cv.requestPointerLock && !document.pointerLockElement) { try { const r = cv.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch { /* sem trava */ } }
    // Ctrl desce: os atalhos do navegador com Ctrl (salvar, favoritos...) não abrem no meio do voo
    this.onKey = (e) => { if (e.ctrlKey && e.code !== 'KeyR') e.preventDefault(); };
    window.addEventListener('keydown', this.onKey);
    this.helpTimer = 6;
    this.prevPad = {};
  }

  pad() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    return pads[0] || null;
  }

  // 'exit' quando a pessoa sai
  update(dt) {
    const input = this.input;
    const p = input.players[0];
    const pad = this.pad();
    const btn = (i) => !!(pad && pad.buttons[i] && pad.buttons[i].pressed);
    const val = (i) => (pad && pad.buttons[i] ? pad.buttons[i].value || (pad.buttons[i].pressed ? 1 : 0) : 0);
    const edge = (i) => { const now = btn(i); const was = this.prevPad[i]; this.prevPad[i] = now; return now && !was; };
    if (input.keyPressedOnce('Escape') || input.keyPressedOnce('Backspace') || edge(1) || edge(9)) return 'exit';

    // olhar: mouse (travado) e analógico direito
    const L = p.look || {};
    this.yaw -= (L.mx || 0) * EXPLORE.lookMouse + (L.x || 0) * EXPLORE.lookPad * dt;
    this.pitch -= (L.my || 0) * EXPLORE.lookMouse + (L.y || 0) * EXPLORE.lookPad * dt;
    this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch));

    // andar: para onde olha (como o espectador), de lado e para cima/baixo
    const k = input.keys;
    const fwd = new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    // pedido do dono: Espaço sobe, Ctrl desce (no controle, R2/L2)
    const up = (k.has('Space') ? 1 : 0) - (k.has('ControlLeft') || k.has('ControlRight') ? 1 : 0) + val(7) - val(6);
    const move = new THREE.Vector3().addScaledVector(fwd, p.moveY || 0).addScaledVector(right, p.moveX || 0);
    move.y += Math.max(-1, Math.min(1, up));
    if (move.lengthSq() > 1) move.normalize();
    const fast = k.has('ShiftLeft') || k.has('ShiftRight') || btn(10);
    move.multiplyScalar(EXPLORE.speed * (fast ? EXPLORE.fast : 1) * dt);
    moveWithCollision(this.pos, move, this.solids);
    // fora do cenário: teto, chão de reserva e um raio máximo em volta do centro
    this.pos.y = Math.max(EXPLORE.floor, Math.min(EXPLORE.ceiling, this.pos.y));
    const dx = this.pos.x - this.center.x;
    const dz = this.pos.z - this.center.z;
    const dist = Math.hypot(dx, dz);
    if (dist > this.range) { this.pos.x = this.center.x + (dx / dist) * this.range; this.pos.z = this.center.z + (dz / dist) * this.range; }

    const cam = this.world.camera;
    cam.position.copy(this.pos);
    cam.rotation.set(this.pitch, this.yaw, 0);
    this.world.time += dt;
    this.world.arena.update(dt);
    this.world.fx.update(dt);

    if (this.helpTimer > 0) {
      this.helpTimer -= dt;
      if (this.helpTimer <= 0) this.el.classList.add('faded');
    }
    if (move.lengthSq() > 0 && this.helpTimer > 1) this.helpTimer = 1;
    return null;
  }

  render() {
    this.world.render();
  }

  resize(w, h) {
    this.world.camera.aspect = w / h;
    this.world.camera.updateProjectionMatrix();
  }

  dispose() {
    this.input.freeLook = false;
    window.removeEventListener('keydown', this.onKey);
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
    this.el.remove();
    this.world.dispose();
    this.audio.listener = null;
  }
}
