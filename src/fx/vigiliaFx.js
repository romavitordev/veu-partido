import * as THREE from 'three';
import { ARENA_TEXTURES } from '../arena/arenaTextures.js';

// EFEITOS DA VIGÍLIA (Treb Ciach, 890; lore/A-VIGILIA.md). Pedido do dono (2026-11-27): "os ataques do mael devem ser
// polidos, os efeitos dos poderes etc." — os poderes do Mael tinham só as faíscas genéricas do selfBuff. Cenas PROPOSTA:
//   emberBurst     as BRASAS AMARELAS da Chama de Proteção saltam de onde a machadinha (ou o punho) acerta forte
//   rootSnap       RAÍZES finas rompem o chão em volta de quem leva o Pisão na Raiz e fecham por um instante
//   leafCall       CHAMADO: o redemoinho de folhas sobe em espiral em volta dele e, enquanto dura, folhas verdes caem
//   protectionFlame CHAMA DE PROTEÇÃO: o sigilo dourado do ritual acende sob os pés, um anel de chamas amarelas sobe em
//                  volta e fica queimando baixo enquanto dura
// Cada efeito de duração devolve stop().

export const FLAME = 0xffd84a;
const EMBER = 0xff9a2a;
const LEAVES = [0x5ad02a, 0x8ae04a, 0xb0d84a, 0x4ab02a];
const ROOT = 0x5a4028;

let sigilTex = null; // pintar a textura do sigilo é caro: uma só para a partida inteira
export function sigilMap() {
  if (!sigilTex) {
    const t = ARENA_TEXTURES.protection_sigil();
    sigilTex = t.map || t;
  }
  return sigilTex;
}

export function emberBurst(world, at, { big = false, color = FLAME } = {}) {
  // o golpe já tem o clarão próprio: aqui só as faíscas e as brasas (antes o clarão extra estourava a tela em branco)
  world.fx.burst(at, { count: big ? 20 : 10, color, speed: big ? 5 : 3.4, up: 1.2, life: big ? 0.55 : 0.4, size: big ? 0.09 : 0.07, gravity: 4, kind: 'spark' });
  world.fx.burst(at, { count: big ? 12 : 6, color: EMBER, speed: big ? 2.4 : 1.6, up: 2, life: big ? 0.9 : 0.6, size: 0.06, gravity: -0.6, drag: 1.2 });
  if (big) {
    world.fx.ring(new THREE.Vector3(at.x, 0.06, at.z), { color: EMBER, radius: 1.8, life: 0.35 });
    world.fx.burst(new THREE.Vector3(at.x, 0.2, at.z), { count: 8, color: EMBER, speed: 0.8, up: 3, life: 0.5, size: 0.12, spread: 0.6 });
  }
}

let rootMat = null;
export function rootSnap(world, target) {
  // raízes SÓLIDAS (o traço do fx é aditivo: marrom some): pontas afinadas que brotam do chão, se curvam por cima de
  // quem está caído, seguram um instante e afundam
  rootMat = rootMat || new THREE.MeshLambertMaterial({ color: ROOT });
  const c = new THREE.Vector3(target.pos.x, 0, target.pos.z);
  const group = new THREE.Group();
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
    const r = 0.6 + Math.random() * 0.25;
    const len = 0.95 + Math.random() * 0.4;
    const geo = new THREE.CylinderGeometry(0.02, 0.095, len, 6, 1);
    geo.translate(0, len / 2, 0);
    const m = new THREE.Mesh(geo, rootMat);
    m.position.set(c.x + Math.cos(a) * r, 0, c.z + Math.sin(a) * r);
    // inclinada para dentro, por cima do alvo
    m.rotation.order = 'YXZ';
    m.rotation.y = -a + Math.PI / 2;
    m.rotation.x = -(0.55 + Math.random() * 0.35);
    m.scale.y = 0.01;
    m.userData.delay = i * 0.02;
    group.add(m);
  }
  world.scene.add(group);
  let t = 0;
  const dispose = () => {
    if (!group.parent) return;
    world.scene.remove(group);
    group.children.forEach((m) => m.geometry.dispose());
  };
  world.addTicker({
    update(dt) {
      t += dt;
      for (const m of group.children) {
        const u = t - m.userData.delay;
        m.scale.y = u < 0 ? 0.01 : u < 0.12 ? Math.max(0.01, u / 0.12) : u < 0.5 ? 1 : Math.max(0.01, 1 - (u - 0.5) / 0.25);
      }
      if (t > 0.9) { dispose(); return true; }
      return false;
    },
    dispose,
  });
  world.fx.burst(new THREE.Vector3(c.x, 0.15, c.z), { count: 14, color: 0x6a5434, kind: 'debris', speed: 2.4, up: 1.6, life: 0.5, size: 0.1, gravity: 9 });
  world.fx.ring(new THREE.Vector3(c.x, 0.05, c.z), { color: 0x6aa83a, radius: 1.3, life: 0.35 });
}

// FOLHAS DE VERDADE (cor sólida, não aditiva: as partículas brilhantes sumiam no chão claro): plaquinhas verdes em
// forma de losango que giram no ar. Um bando é um único ticker; cada folha segue pos(t) até a vida acabar
let leafGeo = null;
const leafMats = new Map();
function leafMat(color) {
  if (!leafMats.has(color)) leafMats.set(color, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
  return leafMats.get(color);
}
function leafFlock(world, leaves) {
  if (!leafGeo) {
    leafGeo = new THREE.BufferGeometry();
    leafGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.07, 0.035, 0, 0, 0, 0, 0.07, -0.035, 0, 0], 3));
    leafGeo.setIndex([0, 1, 2, 0, 2, 3]);
    leafGeo.computeVertexNormals();
  }
  const group = new THREE.Group();
  world.scene.add(group);
  for (const L of leaves) {
    L.mesh = new THREE.Mesh(leafGeo, leafMat(L.color));
    L.mesh.scale.setScalar(L.size ?? 1.9);
    L.mesh.visible = false;
    group.add(L.mesh);
  }
  let t = 0;
  const dispose = () => { if (group.parent) world.scene.remove(group); };
  world.addTicker({
    update(dt) {
      t += dt;
      let alive = 0;
      for (const L of leaves) {
        const u = t - L.delay;
        if (u < 0) { alive++; continue; }
        if (u > L.life) { L.mesh.visible = false; continue; }
        alive++;
        L.mesh.visible = true;
        L.mesh.position.copy(L.pos(u));
        L.mesh.rotation.set(u * L.spin + L.phase, u * L.spin * 0.7, u * L.spin * 0.4);
      }
      if (!alive) { dispose(); return true; }
      return false;
    },
    dispose,
  });
}

export function leafCall(world, f, a = {}) {
  const c0 = f.pos.clone();
  world.fx.ring(new THREE.Vector3(f.pos.x, 0.05, f.pos.z), { color: 0x6aa83a, radius: 2.4, life: 0.5 });
  world.fx.flash(f.chestPos(), { color: 0x8ad04a, size: 1.6, life: 0.2 });
  world.audio.play('powerUp', { volume: 0.55, pitch: 1.2 });
  // o REDEMOINHO: as folhas sobem do chão em espiral em volta dele e se espalham no alto
  const swirl = [];
  for (let i = 0; i < 36; i++) {
    const a0 = (i / 36) * Math.PI * 6;
    const r0 = 0.7 + Math.random() * 0.3;
    swirl.push({
      color: LEAVES[i % LEAVES.length], delay: i * 0.012, life: 0.9 + Math.random() * 0.4, spin: 8 + Math.random() * 6, phase: i,
      pos: (u) => {
        const k = Math.min(1, u / 0.7);
        const ang = a0 + u * 7;
        const r = r0 + Math.max(0, u - 0.6) * 2.4;
        return new THREE.Vector3(c0.x + Math.cos(ang) * r, 0.1 + k * 2.3 - Math.max(0, u - 0.7) * 1.2, c0.z + Math.sin(ang) * r);
      },
    });
  }
  leafFlock(world, swirl);
  // enquanto dura: folhas caem devagar em volta dele, balançando
  const dur = a.duration ?? 7;
  const fall = [];
  for (let i = 0; i < Math.round(dur * 5); i++) {
    const ox = (Math.random() - 0.5) * 2;
    const oz = (Math.random() - 0.5) * 2;
    const sw = Math.random() * 6;
    fall.push({
      color: LEAVES[i % LEAVES.length], delay: 0.5 + (i / 5) + Math.random() * 0.2, life: 1.8, spin: 3 + Math.random() * 3, phase: i, size: 1.3,
      pos: (u) => new THREE.Vector3(f.pos.x + ox + Math.sin(u * 3 + sw) * 0.25, 2.3 - u * 1.25, f.pos.z + oz + Math.cos(u * 2.4 + sw) * 0.2),
    });
  }
  leafFlock(world, fall);
  const glow = world.fx.emitter({ rate: 12, follow: () => f.chestPos(), particle: { color: 0x6ac83a, speed: 0.6, up: 1.1, spread: 0.6, life: 0.5, size: 0.14 } });
  return () => { glow.stop(); for (const L of fall) L.life = 0; };
}

export function protectionFlame(world, f, { color = FLAME } = {}) {
  const R = 1.25;
  const mat = new THREE.MeshBasicMaterial({ map: sigilMap(), color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const sigil = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.2, R * 2.2), mat);
  sigil.rotation.x = -Math.PI / 2;
  sigil.position.set(f.pos.x, 0.05, f.pos.z);
  world.scene.add(sigil);
  world.fx.flash(f.chestPos(), { color, size: 2.2, life: 0.22 });
  world.screenFlash && world.screenFlash('#2a2206', 0.12);
  world.audio.play('powerUp', { volume: 0.7, pitch: 0.8 });
  // o anel de chamas sobe de uma vez em volta dele
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    world.fx.burst(new THREE.Vector3(f.pos.x + Math.cos(a) * R, 0.15, f.pos.z + Math.sin(a) * R), { count: 4, color: i % 3 ? color : EMBER, speed: 0.6, up: 4.2, life: 0.55, size: 0.26, spread: 0.3 });
  }
  world.fx.ring(new THREE.Vector3(f.pos.x, 0.07, f.pos.z), { color, radius: R * 1.6, life: 0.45 });
  // enquanto dura: a chama baixa lambendo a borda e as brasas subindo do corpo
  const edge = world.fx.emitter({
    rate: 26,
    follow: () => { const a = Math.random() * Math.PI * 2; return new THREE.Vector3(f.pos.x + Math.cos(a) * R, 0.1, f.pos.z + Math.sin(a) * R); },
    particle: { color, speed: 0.3, up: 2.2, spread: 0.2, life: 0.45, size: 0.2 },
  });
  const embers = world.fx.emitter({ rate: 12, follow: () => f.chestPos(), particle: { color: EMBER, speed: 0.6, up: 1.6, spread: 0.6, life: 0.7, size: 0.08 } });
  let t = 0;
  let alive = true;
  let fadeOut = 0;
  const dispose = () => {
    if (!sigil.parent) return;
    world.scene.remove(sigil);
    sigil.geometry.dispose();
    mat.dispose();
  };
  world.addTicker({
    update(dt) {
      t += dt;
      sigil.position.set(f.pos.x, 0.05, f.pos.z);
      sigil.rotation.z += dt * 0.6;
      if (alive) mat.opacity = Math.min(0.75, t * 3) * (0.85 + 0.15 * Math.sin(t * 7));
      else {
        fadeOut += dt;
        mat.opacity = Math.max(0, 0.75 - fadeOut * 2.5);
        if (fadeOut > 0.3) { dispose(); return true; }
      }
      return false;
    },
    dispose,
  });
  return () => { alive = false; edge.stop(); embers.stop(); };
}

// efeitos de duração ligados por a.castFx no selfBuff (combat/abilities.js → applySelfBuff)
export const CAST_FX = { leafCall, protectionFlame };
