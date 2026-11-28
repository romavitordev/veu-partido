import * as THREE from 'three';
import { part, toon, glowMat } from './rig.js';
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

// ================================================================ AS ARMAS DA VIGÍLIA (o arsenal sob a Árvore Anciã)
// Cânone (wiki, A Vigília ep. 3): no Samhain eles lutam com as armas do arsenal — "Mael rasgando-os com uma das LÂMINAS
// DA VIGÍLIA, Bran perfurando vários com a LANÇA DA VIGÍLIA e Eileen se protegendo com o ESCUDO". Pedido do dono
// (2026-11-28): nas formas transformadas, o Bran usa a lança da Vigília, o Gwayne as flechas da Vigília e o Mael a
// espada e o escudo da Vigília. PROPOSTA: a forma de cada peça (aço claro, bronze, o sol da Chama de Proteção gravado).
const VSTEEL = 0xd8dce0;
const BRONZE = 0xb08a3a;
const DARKWOOD = 0x3a2a1e;
const SUNGLOW = 0xffd86a;

// o SOL DA CHAMA (PROPOSTA de emblema): o disco e os raios, de bronze, no plano YZ com a face em +X
function sunEmblem(r) {
  const g = new THREE.Group();
  const disc = part(new THREE.CylinderGeometry(r * 0.38, r * 0.38, 0.012, 16), BRONZE);
  disc.rotation.z = Math.PI / 2;
  g.add(disc);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const ray = part(new THREE.ConeGeometry(r * 0.1, r * 0.5, 4), BRONZE);
    ray.position.set(0, Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
    ray.rotation.x = a;
    g.add(ray);
  }
  return g;
}

// a LANÇA DA VIGÍLIA: mais longa que a Justiça, a haste escura com anéis de bronze, a ponta larga de folha em aço
// claro com a nervura e as abas de bronze, a fita vermelha. Mesma convenção da spear(): o cabo na origem, a ponta em −Y
export function vigiliaSpear() {
  const g = new THREE.Group();
  const shaft = part(new THREE.CylinderGeometry(0.016, 0.018, 2.05, 8), DARKWOOD);
  shaft.position.y = -0.6;
  g.add(shaft);
  for (const y of [0.25, -0.2, -0.95, -1.5]) {
    const band = part(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 8), BRONZE);
    band.position.y = y;
    g.add(band);
  }
  const s = new THREE.Shape();
  s.moveTo(-0.014, 0);
  s.quadraticCurveTo(-0.075, -0.12, 0, -0.36);
  s.quadraticCurveTo(0.075, -0.12, 0.014, 0);
  s.lineTo(-0.014, 0);
  const head = part(new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false }), 0, { mat: toon(VSTEEL) });
  head.position.set(0, -1.62, -0.005);
  g.add(head);
  const rib = part(new THREE.BoxGeometry(0.008, 0.3, 0.016), BRONZE);
  rib.position.y = -1.78;
  g.add(rib);
  const lugs = part(new THREE.BoxGeometry(0.13, 0.025, 0.02), BRONZE);
  lugs.position.y = -1.6;
  g.add(lugs);
  const ribbon = part(new THREE.BoxGeometry(0.006, 0.26, 0.05), 0x9a1a1a);
  ribbon.position.set(0.02, -1.48, 0.02);
  ribbon.rotation.z = 0.25;
  g.add(ribbon);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), glowMat(SUNGLOW, 0.3));
  glow.position.y = -1.9;
  g.add(glow);
  g.userData.tip = glow;
  return g;
}

// a LÂMINA DA VIGÍLIA (a espada do Mael): lâmina reta de aço claro, guarda de bronze em cruz, o cabo de couro e o
// pomo com o sol. Sai da mão pelo −Y, como a machadinha
export function vigiliaBlade() {
  const g = new THREE.Group();
  const grip = part(new THREE.CylinderGeometry(0.017, 0.019, 0.17, 7), LEATHER);
  grip.position.y = 0.01;
  g.add(grip);
  const pommel = part(new THREE.SphereGeometry(0.03, 8, 6), BRONZE);
  pommel.position.y = 0.11;
  g.add(pommel);
  const guard = part(new THREE.BoxGeometry(0.03, 0.03, 0.2), BRONZE);
  guard.position.y = -0.085;
  g.add(guard);
  const blade = part(new THREE.BoxGeometry(0.012, 0.66, 0.055), 0, { mat: toon(VSTEEL) });
  blade.position.y = -0.43;
  g.add(blade);
  const fuller = part(new THREE.BoxGeometry(0.014, 0.5, 0.012), 0x9aa0a8);
  fuller.position.y = -0.38;
  g.add(fuller);
  const tip = part(new THREE.ConeGeometry(0.039, 0.1, 4), 0, { mat: toon(VSTEEL) });
  tip.rotation.x = Math.PI;
  tip.scale.x = 0.3;
  tip.position.y = -0.81;
  g.add(tip);
  return g;
}

// o ESCUDO DA VIGÍLIA: redondo e maior que o broquel, tábuas escuras, aro de bronze e o SOL DA CHAMA na face.
// Mesma convenção do broquel (o disco no plano YZ, a face em +X, a alça na origem)
export function vigiliaShield() {
  const g = new THREE.Group();
  const wood = part(new THREE.CylinderGeometry(0.3, 0.3, 0.035, 26), 0x4a3424);
  wood.rotation.z = Math.PI / 2;
  g.add(wood);
  const rim = part(new THREE.TorusGeometry(0.3, 0.018, 6, 32), BRONZE);
  rim.rotation.y = Math.PI / 2;
  g.add(rim);
  const sun = sunEmblem(0.22);
  sun.position.x = 0.02;
  g.add(sun);
  const boss = part(new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), VSTEEL);
  boss.rotation.z = -Math.PI / 2;
  boss.position.x = 0.024;
  g.add(boss);
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
export function addBranProps(rig, { vigilia = false } = {}) {
  const sp = vigilia ? vigiliaSpear() : spear(0x9aa4b4); // O Inquebrável luta com a LANÇA DA VIGÍLIA (cânone, ep. 3)
  inFist(sp, GRIP_HEAVY);
  rig.sockets.handR.add(sp);
  rig.props.spear = sp;
  rig.gripProp = { obj: sp, base: sp.rotation.x, rest: SPEAR_REST }; // os golpes de lança giram a pegada (Animator.updateGrip)
  // o broquel segurado pela alça do meio: o punho atrás do umbo, a face para a frente na guarda de lança (idle_spear).
  // Rotação e posição achadas na pose da guarda (a face do broquel virada para a frente do corpo)
  const sh = broquel();
  sh.rotation.set(1.467, -1.121, 0);
  sh.position.set(0.03, -0.065, -0.013);
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
  addBranProps(rig, { vigilia: true });
  for (const p of ['crowMask', 'feathers']) if (rig.props[p]) rig.showProp(p, true);
  for (const p of ['hair', 'fur']) if (rig.props[p]) rig.showProp(p, false);
}

// a MACHADINHA do Mael (cânone: no cinto): cabo curto de madeira, cabeça de ferro com o fio claro. Como as outras armas
// do jogo, sai da mão pelo −Y (a cabeça na ponta, longe do punho)
function machadinha() {
  const g = new THREE.Group();
  const haft = part(new THREE.CylinderGeometry(0.016, 0.019, 0.46, 7), WOOD);
  haft.position.y = -0.16;
  g.add(haft);
  const head = part(new THREE.BoxGeometry(0.034, 0.11, 0.16), IRON);
  head.position.set(0, -0.34, 0.07);
  g.add(head);
  const edge = part(new THREE.BoxGeometry(0.014, 0.16, 0.03), 0xd8d4d0, { mat: toon(0xd8d4d0) });
  edge.position.set(0, -0.34, 0.16);
  g.add(edge);
  const wrap = part(new THREE.CylinderGeometry(0.021, 0.021, 0.1, 7), LEATHER);
  wrap.position.y = -0.02;
  g.add(wrap);
  return g;
}

// MAEL: a machadinha na direita (a lâmina para a frente). A fantasia (máscara de casca, gola de folhas e capa) fica
// guardada: só a forma Herói da Vigília liga
export function addMaelProps(rig) {
  const h = machadinha();
  inFist(h, 0);
  // orientação achada a partir do punho na guarda (idle_fist): o cabo sobe na vertical, um pouco para a frente, e o FIO
  // aponta para o adversário (dono, 2026-11-27: "o machado do mael ainda esta com a lamina virada para trás" — com o
  // inFist(-1.3) o cabo deitava para trás rumo à cabeça e o fio olhava para o rosto dele)
  h.rotation.set(2.92, 0.142, -3.013);
  rig.sockets.handR.add(h);
  rig.props.hatchet = h;
  for (const p of ['woodMask', 'leafCollar', 'heroCloak']) if (rig.props[p]) rig.showProp(p, false);
}

// HERÓI DA VIGÍLIA: o mesmo Mael com a fantasia do Samhain ligada; o cabelo (e a coroa de galhos) some sob a máscara
export function addMaelHeroiProps(rig) {
  addMaelProps(rig);
  // A LÂMINA E O ESCUDO DA VIGÍLIA (cânone, ep. 3: "Mael rasgando-os com uma das lâminas da Vigília"; o escudo, pedido do
  // dono 2026-11-28): a espada no lugar da machadinha (a mesma pegada) e o escudo no braço esquerdo, como o broquel do Bran
  const h = rig.props.hatchet;
  const b = vigiliaBlade();
  b.rotation.copy(h.rotation);
  b.position.copy(h.position);
  h.parent.add(b);
  h.parent.remove(h);
  rig.props.hatchet = b;
  rig.props.blade = b;
  const sh = vigiliaShield();
  // a face para a frente do corpo na guarda de punho do Mael (idle_fist; calculada na pose, como a do broquel)
  sh.rotation.set(0.311, -1.259, -2.378);
  sh.position.set(0.03, -0.065, -0.013);
  rig.sockets.handL.add(sh);
  rig.props.shield = sh;
  for (const p of ['woodMask', 'leafCollar', 'heroCloak']) if (rig.props[p]) rig.showProp(p, true);
  if (rig.props.hair) rig.showProp('hair', false);
}

// o ARCO DA GWYNETH (cânone: era da irmã gêmea): RECURVO largo de madeira, o couro avermelhado costurado nos braços e o
// pano AZUL na empunhadura. Mesma convenção do arco da Amalia: a empunhadura na origem, os braços ao longo de ±Z,
// curvando para +Y e as pontas voltando para −Y (o recurvo); a corda de ponta a ponta
export function gwayneBow() {
  const g = new THREE.Group();
  const grip = part(new THREE.CylinderGeometry(0.02, 0.02, 0.13, 8), 0x4a6aa0); // o pano azulado
  grip.rotation.x = Math.PI / 2;
  g.add(grip);
  const tips = [];
  for (const s of [1, -1]) {
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const k = i / 10;
      // sobe para trás até 80% do braço e as pontas viram para a frente (o recurvo)
      const y = 0.16 * k * k - (k > 0.78 ? (k - 0.78) * (k - 0.78) * 2.6 : 0) + 0.02;
      pts.push(new THREE.Vector3(0, y, s * (0.07 + 0.52 * k)));
    }
    const limb = part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.017, 6), 0x6a4426);
    limb.scale.x = 0.7;
    g.add(limb);
    // o couro avermelhado costurado logo depois da empunhadura
    const wrap = part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.slice(0, 4)), 8, 0.021, 6), 0x8a2e22);
    wrap.scale.x = 0.75;
    g.add(wrap);
    tips.push(pts[10]);
  }
  const str = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, Math.abs(tips[0].z - tips[1].z), 4), new THREE.MeshBasicMaterial({ color: 0xd8d0c0 }));
  str.rotation.x = Math.PI / 2;
  str.position.set(0, tips[0].y, 0);
  g.add(str);
  return g;
}

// a ADAGA do Gwayne (cânone: no cinto): lâmina curta de ferro, guarda reta e o cabo de couro. Sai da mão pelo −Y
function adaga() {
  const g = new THREE.Group();
  const hilt = part(new THREE.CylinderGeometry(0.014, 0.016, 0.1, 6), LEATHER);
  hilt.position.y = 0.02;
  g.add(hilt);
  const guard = part(new THREE.BoxGeometry(0.02, 0.016, 0.08), IRON);
  guard.position.y = -0.04;
  g.add(guard);
  const blade = part(new THREE.BoxGeometry(0.008, 0.2, 0.034), 0xd0ccc8, { mat: toon(0xd0ccc8) });
  blade.position.y = -0.14;
  g.add(blade);
  const tip = part(new THREE.ConeGeometry(0.02, 0.05, 4), 0xd0ccc8, { mat: toon(0xd0ccc8) });
  tip.rotation.x = Math.PI;
  tip.scale.x = 0.4;
  tip.position.y = -0.265;
  g.add(tip);
  return g;
}

// GWAYNE: o arco da Gwyneth na esquerda e a adaga na direita, a lâmina para baixo (pegada de punhal). A fantasia
// (crânio, pele e poncho) fica guardada: só a forma O Morto que Caminha liga
export function addGwayneProps(rig) {
  const bow = gwayneBow();
  rig.sockets.handL.add(bow);
  rig.props.bow = bow;
  const d = adaga();
  inFist(d, 0);
  rig.sockets.handR.add(d);
  rig.props.dagger = d;
  for (const p of ['skullMask', 'pelt', 'poncho']) if (rig.props[p]) rig.showProp(p, false);
}

// O MORTO QUE CAMINHA: o mesmo Gwayne com a fantasia do Samhain — o crânio de lobo, a pele cinza e o poncho
// esfarrapado; o cabelo, a trança e a gola do capuz somem por baixo
export function addGwayneMortoProps(rig) {
  addGwayneProps(rig);
  for (const p of ['skullMask', 'pelt', 'poncho']) if (rig.props[p]) rig.showProp(p, true);
  for (const p of ['hair', 'hoodCowl']) if (rig.props[p]) rig.showProp(p, false);
}
