import * as THREE from 'three';
import { part, toon } from './rig.js';
import { SPEAR_REST } from '../anim/spearClips.js';
import { spear } from './ordoWeapons.js';

// AS PEÇAS EM CÓDIGO DA VIGÍLIA (Treb Ciach, 890; lore/A-VIGILIA.md). O corpo, o manto, o cabelo e a fantasia vêm do
// Blender (tools/blender/char_bran.py); aqui as armas: a lança "JUSTIÇA" (cabo de madeira, ponta de metal), o BROQUEL
// com umbo e as AZAGAIAS na bainha do cinto. Mesma empunhadura de models/ordoProps.js (o cabo atravessa o punho).
const GRIP_HEAVY = -1.15;
const FIST = -0.06;
const WOOD = 0x6a4a30;
const IRON = 0x8a8a88;
const LEATHER = 0x4a3020;

function inFist(obj, tilt) {
  obj.rotation.x = tilt;
  obj.position.y += FIST;
  return obj;
}

// o BROQUEL (cânone): escudo redondo e pequeno de madeira, aro e UMBO de ferro no meio. Mesma convenção do escudo do
// Cornelius: o disco no plano YZ, a face para fora em +X, a alça na origem
export function broquel() {
  const g = new THREE.Group();
  const wood = part(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 22), WOOD);
  wood.rotation.z = Math.PI / 2;
  g.add(wood);
  // as tábuas: riscos escuros verticais na face
  for (const z of [-0.09, 0, 0.09]) {
    const line = part(new THREE.BoxGeometry(0.004, 0.4 - Math.abs(z) * 1.6, 0.006), 0x3a2818);
    line.position.set(0.016, 0, z + 0.045);
    g.add(line);
  }
  const rim = part(new THREE.TorusGeometry(0.22, 0.014, 6, 28), IRON);
  rim.rotation.y = Math.PI / 2;
  g.add(rim);
  const boss = part(new THREE.SphereGeometry(0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x9a9a98);
  boss.rotation.z = -Math.PI / 2;
  boss.position.x = 0.015;
  g.add(boss);
  const ring = part(new THREE.TorusGeometry(0.075, 0.01, 5, 18), 0x5a5a58);
  ring.rotation.y = Math.PI / 2;
  ring.position.x = 0.016;
  g.add(ring);
  g.position.set(0.05, 0.06, 0);
  const out = new THREE.Group();
  out.add(g);
  return out;
}

// uma AZAGAIA: lança curta de arremesso (cabo fino, ponta de ferro em folha)
function azagaia() {
  const g = new THREE.Group();
  const shaft = part(new THREE.CylinderGeometry(0.009, 0.01, 0.78, 6), WOOD);
  g.add(shaft);
  const tip = part(new THREE.ConeGeometry(0.022, 0.12, 4), IRON, { mat: toon(0xc8c4c0) });
  tip.position.y = 0.45;
  g.add(tip);
  return g;
}

// BRAN: a "Justiça" na direita (segurada no terço de trás), o broquel no braço esquerdo, as azagaias na bainha do lado
// direito do quadril. A fantasia (máscara de corvo e penas) fica guardada: só a forma O Inquebrável liga
export function addBranProps(rig) {
  const sp = spear(0x9aa4b4);
  inFist(sp, GRIP_HEAVY);
  rig.sockets.handR.add(sp);
  rig.props.spear = sp;
  rig.gripProp = { obj: sp, base: sp.rotation.x, rest: SPEAR_REST }; // os golpes de lança giram a pegada (Animator.updateGrip)
  const sh = broquel();
  sh.rotation.set(0, -Math.PI / 2, 0);
  sh.position.set(0.02, 0.04, 0);
  rig.sockets.handL.add(sh);
  rig.props.shield = sh;
  // a bainha com três azagaias, de pé atrás do quadril direito, as pontas para cima
  const quiver = new THREE.Group();
  const sheath = part(new THREE.CylinderGeometry(0.045, 0.035, 0.42, 8), LEATHER);
  quiver.add(sheath);
  for (let k = 0; k < 3; k++) {
    const a = azagaia();
    a.position.set((k - 1) * 0.025, 0.2, (k % 2) * 0.02);
    a.rotation.z = (k - 1) * 0.06;
    quiver.add(a);
  }
  quiver.position.set(-0.24, -0.05, -0.12);
  quiver.rotation.set(-0.25, 0, 0.12);
  rig.attach('hips', quiver);
  rig.props.azagaias = quiver;
  for (const p of ['crowMask', 'feathers']) if (rig.props[p]) rig.showProp(p, false);
}

// O INQUEBRÁVEL: o mesmo Bran com a fantasia de corvo do Samhain — a máscara e as penas ligadas; o cabelo, a barba, a
// gola de pelo e as franjas somem por baixo
export function addBranInquebravelProps(rig) {
  addBranProps(rig);
  for (const p of ['crowMask', 'feathers']) if (rig.props[p]) rig.showProp(p, true);
  for (const p of ['hair', 'fur']) if (rig.props[p]) rig.showProp(p, false);
}

// a MACHADINHA do Mael (cânone: no cinto): cabo curto de madeira, cabeça de ferro com o fio claro
function machadinha() {
  const g = new THREE.Group();
  const haft = part(new THREE.CylinderGeometry(0.016, 0.019, 0.46, 7), WOOD);
  haft.position.y = 0.16;
  g.add(haft);
  const head = part(new THREE.BoxGeometry(0.03, 0.09, 0.14), IRON);
  head.position.set(0, 0.34, 0.06);
  g.add(head);
  const edge = part(new THREE.BoxGeometry(0.012, 0.13, 0.03), 0xd8d4d0, { mat: toon(0xd8d4d0) });
  edge.position.set(0, 0.34, 0.14);
  g.add(edge);
  const wrap = part(new THREE.CylinderGeometry(0.021, 0.021, 0.1, 7), LEATHER);
  wrap.position.y = 0.02;
  g.add(wrap);
  return g;
}

// MAEL: a machadinha na direita (a lâmina para a frente). A fantasia (máscara de casca, gola de folhas e capa) fica
// guardada: só a forma Herói da Vigília liga
export function addMaelProps(rig) {
  const h = machadinha();
  inFist(h, -1.3);
  rig.sockets.handR.add(h);
  rig.props.hatchet = h;
  for (const p of ['woodMask', 'leafCollar', 'heroCloak']) if (rig.props[p]) rig.showProp(p, false);
}

// HERÓI DA VIGÍLIA: o mesmo Mael com a fantasia do Samhain ligada; o cabelo (e a coroa de galhos) some sob a máscara
export function addMaelHeroiProps(rig) {
  addMaelProps(rig);
  for (const p of ['woodMask', 'leafCollar', 'heroCloak']) if (rig.props[p]) rig.showProp(p, true);
  if (rig.props.hair) rig.showProp('hair', false);
}
