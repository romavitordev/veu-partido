import * as THREE from 'three';
import { part, toon, glowMat } from './rig.js';

// AS ARMAS DA ORDO CALAMITAS (Calamidade, 67 d.C.) — os oito que entraram na v5.32.0 (lore/ORDO-CALAMITAS.md).
// Convenção das armas (models/weapons.js): a empunhadura na origem, a lâmina para −Y local (a continuação do braço) e o
// "topo" (o fio de cima, o polegar) em +Z local. Escudos: o disco no plano YZ, a face para fora em +X (o lado do dorso
// da mão esquerda), com a alça na origem.

const STEEL = 0xc4c8d0;
const DARK = 0x24262c;
const GOLD = 0xd8b04a;
const LEATHER = 0x3a2a1e;

function bladeGeo(shape, depth = 0.01) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.004, bevelSegments: 1, curveSegments: 14 });
  g.translate(0, 0, -depth / 2);
  return g;
}

// a lâmina vista de lado (no plano YZ): o fio para +Z; extrudada em X e virada para ficar fina em X
function edgeBlade(shape, depth, mat) {
  const m = part(bladeGeo(shape, depth), 0, { mat });
  m.rotation.y = Math.PI / 2;
  return m;
}

function grip(len, r, color = LEATHER, wraps = 6) {
  const g = new THREE.Group();
  const c = part(new THREE.CylinderGeometry(r, r * 1.05, len, 8), color);
  c.position.y = len / 2 - 0.02;
  g.add(c);
  for (let k = 0; k < wraps; k++) {
    const w = part(new THREE.TorusGeometry(r * 1.05, r * 0.22, 4, 10), 0x1a1410, { outline: false });
    w.rotation.set(Math.PI / 2, 0.35, 0);
    w.position.y = -0.01 + (k + 0.5) * (len / wraps);
    g.add(w);
  }
  return g;
}

// ============================================================================ FAUSTUS — o GLADIUS com o colar de cruz
// A espada curta romana (lâmina larga e reta de ponta triangular, a guarda curta e redonda, o pomo em bola) e o COLAR DE
// CRUZ enrolado no cabo (cânone: a arma dele "com o colar de cruz enrolado"; ele reza a Júpiter, mas guarda a cruz). A
// corrente dá voltas no cabo e a cruz pende da guarda.
export function gladius(aura = 0xff5ab4) {
  const g = new THREE.Group();
  const steel = toon(STEEL);
  g.add(grip(0.13, 0.016, 0x4a3424, 5));
  const pommel = part(new THREE.SphereGeometry(0.03, 10, 8), 0x8a7a5a);
  pommel.scale.set(1, 0.75, 1);
  pommel.position.y = 0.125;
  g.add(pommel);
  const guard = part(new THREE.SphereGeometry(0.045, 12, 8), 0x8a7a5a);
  guard.scale.set(0.7, 0.42, 1.2);
  guard.position.y = -0.03;
  g.add(guard);
  const s = new THREE.Shape(); // lâmina larga, um leve "cintura" (a folha de Pompeia) e a ponta triangular
  s.moveTo(-0.028, 0);
  s.lineTo(-0.026, -0.3);
  s.lineTo(-0.024, -0.38);
  s.lineTo(0, -0.47);
  s.lineTo(0.024, -0.38);
  s.lineTo(0.026, -0.3);
  s.lineTo(0.028, 0);
  s.lineTo(-0.028, 0);
  const blade = edgeBlade(s, 0.008, steel);
  blade.position.y = -0.045;
  g.add(blade);
  const fuller = part(new THREE.BoxGeometry(0.003, 0.3, 0.008), 0x7a7e86, { outline: false });
  fuller.position.y = -0.2;
  for (const sx of [1, -1]) { const f = fuller.clone(); f.position.x = sx * 0.006; g.add(f); }
  // o COLAR: contas de corrente dando voltas no cabo e a cruz pendurada na guarda
  const chainMat = toon(0xd8d4c8);
  for (let k = 0; k < 18; k++) {
    const a = k * 0.9;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 5, 4), chainMat);
    bead.position.set(Math.cos(a) * 0.021, 0.0 + k * 0.0062, Math.sin(a) * 0.021);
    g.add(bead);
  }
  const cross = new THREE.Group();
  const cm = toon(0xe8e2d0);
  const v = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.05, 0.008), cm);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, 0.032), cm);
  h.position.y = 0.01;
  cross.add(v, h);
  for (let k = 0; k < 4; k++) {
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.004, 5, 4), chainMat);
    bead.position.set(0, 0.03 + k * 0.01, 0.0);
    cross.add(bead);
  }
  cross.position.set(0.02, -0.1, 0.02);
  cross.rotation.z = 0.15;
  g.add(cross);
  g.userData.cross = cross;
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), glowMat(aura, 0.35));
  glow.position.y = -0.1;
  cross.add(glow);
  return g;
}

// O ELMO DE GLADIADOR do Faustus vem do Blender (prop_helmet). Aqui só a cópia solta que ele entrega na mão (ARRISCAR
// TUDO: o capacete passa para outro) — um elmo de abas largas e grade na frente, como o do modelo
export function gladiatorHelmet() {
  const g = new THREE.Group();
  const grey = toon(0x6a6e78);
  const dome = part(new THREE.SphereGeometry(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.56), 0, { mat: grey });
  g.add(dome);
  const brim = part(new THREE.CylinderGeometry(0.22, 0.24, 0.02, 20), 0, { mat: grey });
  brim.position.y = -0.02;
  g.add(brim);
  const crest = part(new THREE.BoxGeometry(0.03, 0.08, 0.26), 0x4a4e58);
  crest.position.y = 0.15;
  g.add(crest);
  for (let k = -2; k <= 2; k++) {
    const bar = part(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 5), 0x3a3e48, { outline: false });
    bar.position.set(k * 0.03, -0.08, 0.14);
    g.add(bar);
  }
  return g;
}

// ============================================================================ MARIUS — as MANOPLAS escuras
// Cânone: "manoplas escuras com aura vermelha" (o ex-lutador de rua bate com as mãos). Uma por mão: o punho de placas
// sobrepostas, os nós dos dedos em cravos curtos, o punho largo até o meio do antebraço e os filetes vermelhos acesos
export function gauntlet(side = 'R', aura = 0xff3a2a) {
  const g = new THREE.Group();
  const dark = toon(0x1e1c22);
  const plate = toon(0x34323a);
  const fist = part(new THREE.BoxGeometry(0.1, 0.11, 0.11), 0, { mat: dark });
  fist.position.set(0, -0.035, 0.0);
  g.add(fist);
  for (let k = 0; k < 4; k++) {
    const kn = part(new THREE.ConeGeometry(0.012, 0.03, 5), 0, { mat: plate });
    kn.rotation.x = Math.PI / 2;
    kn.position.set(-0.036 + k * 0.024, -0.06, 0.06);
    g.add(kn);
  }
  for (let k = 0; k < 3; k++) {
    const band = part(new THREE.CylinderGeometry(0.066 - k * 0.002, 0.066, 0.034, 10), 0, { mat: k % 2 ? dark : plate });
    band.scale.z = 0.92;
    band.position.y = 0.04 + k * 0.034;
    g.add(band);
  }
  const cuff = part(new THREE.CylinderGeometry(0.078, 0.07, 0.03, 12), 0, { mat: plate });
  cuff.position.y = 0.14;
  g.add(cuff);
  const line = glowMat(aura, 0.8);
  for (const y of [0.057, 0.091]) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.067, 0.003, 4, 18), line);
    r.rotation.x = Math.PI / 2;
    r.position.y = y;
    g.add(r);
  }
  const k = new THREE.Mesh(new THREE.BoxGeometry(0.094, 0.006, 0.006), line);
  k.position.set(0, -0.04, 0.058);
  g.add(k);
  g.userData.side = side;
  return g;
}

// ============================================================================ REMUS — as GARRAS (três em cada mão)
// Cânone: "um par de garras, com três garras cada". Presas no dorso da mão por uma placa e uma tira, as três lâminas
// curvas saem por cima dos nós dos dedos (para −Y) e se curvam para o fio (+Z)
export function claws(aura = 0x4aff6a) {
  const g = new THREE.Group();
  const steel = toon(0xd0d4dc);
  const back = part(new THREE.BoxGeometry(0.08, 0.08, 0.018), 0x2a3a2c);
  back.position.set(0, 0.0, -0.045);
  g.add(back);
  const strap = part(new THREE.TorusGeometry(0.048, 0.008, 4, 14), 0x4a3828);
  strap.scale.set(1, 1, 1.1);
  strap.rotation.x = Math.PI / 2;
  strap.position.y = 0.03;
  g.add(strap);
  const s = new THREE.Shape();
  s.moveTo(-0.008, 0);
  s.quadraticCurveTo(-0.01, -0.12, 0.03, -0.24);
  s.quadraticCurveTo(0.012, -0.11, 0.009, 0);
  s.lineTo(-0.008, 0);
  for (let k = -1; k <= 1; k++) {
    const b = edgeBlade(s, 0.004, steel);
    b.position.set(k * 0.026, -0.05, -0.04);
    b.rotation.x = -0.15;
    g.add(b);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.008, 5, 4), glowMat(aura, 0.4));
    tip.position.set(k * 0.026, -0.27, -0.01);
    g.add(tip);
  }
  return g;
}

// ============================================================================ CASCADIA — o KHOPESH e a espada reta
// Cânone: duas lâminas, "uma curva e uma reta". O KHOPESH (a espada-foice: o cabo, um trecho reto e a lâmina em gancho
// com o fio do lado de fora da curva) na direita; a espada reta e estreita na esquerda
export function khopesh() {
  const g = new THREE.Group();
  const steel = toon(0xb8bcc2);
  g.add(grip(0.13, 0.015, 0x2c2420, 5));
  const pom = part(new THREE.SphereGeometry(0.02, 8, 6), 0x9a8460);
  pom.position.y = 0.125;
  g.add(pom);
  const s = new THREE.Shape(); // reto até −0.2, depois o gancho que volta para +Z
  s.moveTo(-0.014, 0);
  s.lineTo(-0.014, -0.2);
  s.quadraticCurveTo(-0.03, -0.36, 0.04, -0.46);
  s.quadraticCurveTo(0.1, -0.5, 0.11, -0.42);
  s.quadraticCurveTo(0.06, -0.44, 0.03, -0.36);
  s.quadraticCurveTo(0.016, -0.28, 0.014, -0.2);
  s.lineTo(0.014, 0);
  s.lineTo(-0.014, 0);
  const b = edgeBlade(s, 0.007, steel);
  b.position.y = -0.02;
  g.add(b);
  return g;
}

export function straightSword() {
  const g = new THREE.Group();
  const steel = toon(STEEL);
  g.add(grip(0.14, 0.015, 0x2c2420, 5));
  const pom = part(new THREE.SphereGeometry(0.022, 8, 6), 0x9a8460);
  pom.position.y = 0.135;
  g.add(pom);
  const guard = part(new THREE.BoxGeometry(0.03, 0.022, 0.15), 0x7a6a50);
  guard.position.y = -0.02;
  g.add(guard);
  const s = new THREE.Shape();
  s.moveTo(-0.02, 0);
  s.lineTo(-0.017, -0.56);
  s.lineTo(0, -0.62);
  s.lineTo(0.017, -0.56);
  s.lineTo(0.02, 0);
  s.lineTo(-0.02, 0);
  const b = edgeBlade(s, 0.006, steel);
  b.position.y = -0.03;
  g.add(b);
  return g;
}

// ============================================================================ CORNELIUS — a LANÇA e o ESCUDO
// A lança de cabo comprido (a ponta em folha larga, o colar de ferro e o conto na outra ponta), segurada no terço de
// trás: a ponta vai longe para −Y. O escudo grande de madeira com a borda de ferro, o umbo no meio e o Símbolo da Ordo
// pintado (o círculo e as três pontas, como no pano do peito)
export function spear(aura = 0x5a8cff) {
  const g = new THREE.Group();
  const shaft = part(new THREE.CylinderGeometry(0.014, 0.016, 1.9, 8), 0x5a4030);
  shaft.position.y = -0.55;
  g.add(shaft);
  const s = new THREE.Shape();
  s.moveTo(-0.012, 0);
  s.quadraticCurveTo(-0.05, -0.08, 0, -0.26);
  s.quadraticCurveTo(0.05, -0.08, 0.012, 0);
  s.lineTo(-0.012, 0);
  const head = part(bladeGeo(s, 0.008), 0, { mat: toon(STEEL) });
  head.position.y = -1.5;
  g.add(head);
  const collar = part(new THREE.CylinderGeometry(0.02, 0.018, 0.06, 8), DARK);
  collar.position.y = -1.48;
  g.add(collar);
  const butt = part(new THREE.ConeGeometry(0.018, 0.07, 6), DARK);
  butt.position.y = 0.42;
  g.add(butt);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), glowMat(aura, 0.3));
  glow.position.y = -1.62;
  g.add(glow);
  g.userData.tip = glow;
  return g;
}

function ordoSymbolPlate(r, color) {
  // o Símbolo da Ordo Calamitas simplificado: o anel e as três pontas para dentro
  const grp = new THREE.Group();
  const mat = toon(color);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.12, 4, 24), mat);
  grp.add(ring);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 2;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(r * 0.16, r * 0.8, 4), mat);
    sp.position.set(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 0);
    sp.rotation.z = a + Math.PI / 2;
    grp.add(sp);
  }
  return grp;
}

export function corneliusShield() {
  const g = new THREE.Group();
  const face = new THREE.Group();
  const wood = part(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 24), 0x2e3a5a);
  wood.scale.set(1, 1, 1.3); // oval, mais alto que largo
  wood.rotation.z = Math.PI / 2;
  face.add(wood);
  const rim = part(new THREE.TorusGeometry(0.34, 0.016, 6, 32), 0x6a6e78);
  rim.scale.set(1.3, 1, 1);
  rim.rotation.y = Math.PI / 2;
  rim.rotation.z = Math.PI / 2;
  face.add(rim);
  const boss = part(new THREE.SphereGeometry(0.075, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x8a8e98);
  boss.rotation.z = -Math.PI / 2;
  boss.position.x = 0.018;
  face.add(boss);
  const sym = ordoSymbolPlate(0.19, 0xd8d4c8);
  sym.rotation.y = Math.PI / 2;
  sym.position.x = 0.02;
  face.add(sym);
  face.position.set(0.06, 0.08, 0);
  g.add(face);
  return g;
}

// ============================================================================ KARISE — as ADAGAS DE PONTA DUPLA
// O cabo curto no meio e uma lâmina em cada ponta (a de baixo maior): na mão, uma vai para a frente do punho (−Y) e a
// outra sai por trás, rente ao antebraço. Lâmina escurecida (a espiã não brilha) com o fio claro
export function doubleDagger() {
  const g = new THREE.Group();
  g.add(grip(0.1, 0.013, 0x1e1a1c, 4));
  const blk = toon(0x3a3c44);
  const s = new THREE.Shape();
  s.moveTo(-0.016, 0);
  s.quadraticCurveTo(-0.02, -0.12, 0, -0.22);
  s.quadraticCurveTo(0.024, -0.12, 0.016, 0);
  s.lineTo(-0.016, 0);
  const a = edgeBlade(s, 0.005, blk);
  a.position.y = -0.03;
  g.add(a);
  const b = edgeBlade(s, 0.005, blk);
  b.scale.set(0.8, 0.7, 0.8);
  b.rotation.x = Math.PI;
  b.position.y = 0.105;
  g.add(b);
  for (const y of [-0.025, 0.1]) {
    const gd = part(new THREE.BoxGeometry(0.02, 0.012, 0.06), 0x5a5c64);
    gd.position.y = y;
    g.add(gd);
  }
  return g;
}

// a MASCARILHA metálica da Karise (cânone: "uma mascarilha metálica"): a meia-máscara sobre os olhos e o nariz
export function mascarilha() {
  const g = new THREE.Group();
  // no SphereGeometry o phi = π/2 aponta para +z (a frente): o arco vai de um lado ao outro do rosto
  const geo = new THREE.SphereGeometry(0.135, 20, 10, Math.PI * 0.08, Math.PI * 0.84, Math.PI * 0.36, Math.PI * 0.22);
  const m = part(geo, 0, { mat: toon(0x9aa0aa, { side: THREE.DoubleSide }) });
  m.scale.set(1, 1.1, 1.05);
  g.add(m);
  const dark = new THREE.MeshBasicMaterial({ color: 0x08090c });
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.CircleGeometry(0.022, 10), dark);
    eye.scale.set(1.5, 0.7, 1);
    eye.position.set(s * 0.045, 0.012, 0.146);
    g.add(eye);
  }
  return g;
}

// ============================================================================ MARCELLUS — a RAPIEIRA de cabo dourado
// Lâmina longa e fina, a guarda de copo e os arcos dourados (o "cabo dourado" do cânone), a cruzeta comprida e o pomo
export function rapier() {
  const g = new THREE.Group();
  const gold = toon(GOLD);
  g.add(grip(0.12, 0.012, 0x3a2418, 6));
  const pom = part(new THREE.SphereGeometry(0.02, 10, 8), 0, { mat: gold });
  pom.scale.y = 1.3;
  pom.position.y = 0.125;
  g.add(pom);
  const cross = part(new THREE.CylinderGeometry(0.007, 0.007, 0.24, 6), 0, { mat: gold });
  cross.rotation.x = Math.PI / 2;
  cross.position.y = -0.025;
  g.add(cross);
  for (const z of [0.12, -0.12]) {
    const end = part(new THREE.SphereGeometry(0.011, 6, 4), 0, { mat: gold });
    end.position.set(0, -0.025, z);
    g.add(end);
  }
  const cup = part(new THREE.SphereGeometry(0.05, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), 0, { mat: gold });
  cup.rotation.x = Math.PI;
  cup.position.y = -0.005;
  g.add(cup);
  for (const s of [1, -1]) { // os arcos que protegem os dedos
    const arc = part(new THREE.TorusGeometry(0.065, 0.005, 4, 14, Math.PI), 0, { mat: gold, outline: false });
    arc.rotation.set(0, Math.PI / 2, s * 0.25);
    arc.position.set(s * 0.02, 0.05, 0);
    g.add(arc);
  }
  const blade = part(new THREE.CylinderGeometry(0.005, 0.009, 0.86, 4), 0, { mat: toon(0xd8dce4) });
  blade.scale.z = 1.6;
  blade.position.y = -0.47;
  g.add(blade);
  return g;
}

// ============================================================================ NERO — a ESPADA CURVA e o ESCUDO REDONDO
// A espada longa de lâmina curva (o fio de fora na curva, a contracurva na ponta), o cabo de imperador (a cruzeta e o
// pomo dourados com o couro vermelho) e o escudo redondo de ferro com a borda dourada, a águia e as folhas de louro
export function neroSword() {
  const g = new THREE.Group();
  const gold = toon(GOLD);
  g.add(grip(0.16, 0.016, 0x6a1418, 6));
  const pom = part(new THREE.SphereGeometry(0.024, 10, 8), 0, { mat: gold });
  pom.position.y = 0.155;
  g.add(pom);
  const guard = part(new THREE.BoxGeometry(0.03, 0.02, 0.17), 0, { mat: gold });
  guard.position.y = -0.02;
  g.add(guard);
  const s = new THREE.Shape();
  s.moveTo(-0.022, 0);
  s.quadraticCurveTo(-0.03, -0.45, 0.06, -0.86);
  s.quadraticCurveTo(0.075, -0.82, 0.07, -0.76);
  s.quadraticCurveTo(0.03, -0.45, 0.024, 0);
  s.lineTo(-0.022, 0);
  const b = edgeBlade(s, 0.007, toon(0xc8ccd4));
  b.position.y = -0.03;
  g.add(b);
  return g;
}

export function neroShield() {
  const g = new THREE.Group();
  const face = new THREE.Group();
  const disc = part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 28), 0x4a4e5a);
  disc.rotation.z = Math.PI / 2;
  face.add(disc);
  const rim = part(new THREE.TorusGeometry(0.3, 0.018, 6, 36), 0, { mat: toon(GOLD) });
  rim.rotation.y = Math.PI / 2;
  face.add(rim);
  const boss = part(new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0, { mat: toon(GOLD) });
  boss.rotation.z = -Math.PI / 2;
  boss.position.x = 0.016;
  face.add(boss);
  // as folhas de louro em volta (a coroa do imperador)
  const leaf = toon(0xc8a040);
  for (let k = 0; k < 18; k++) {
    if (k === 0 || k === 9) continue; // a coroa abre em cima e embaixo
    const a = (k / 18) * Math.PI * 2;
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 4), leaf);
    l.scale.set(0.3, 1, 0.45);
    l.position.set(0.02, Math.cos(a) * 0.2, Math.sin(a) * 0.2);
    l.rotation.x = -a + 0.5;
    face.add(l);
  }
  face.position.set(0.06, 0.08, 0);
  g.add(face);
  return g;
}

// a COROA DE LOUROS dourada do imperador (cânone: o imperador de Roma) — vai na cabeça do Nero, por cima do cabelo ruivo
export function laurelCrown() {
  const g = new THREE.Group();
  const leaf = toon(0xd8b04a);
  for (let k = 0; k < 22; k++) {
    const t = k / 21;
    const a = -Math.PI * 0.9 + t * Math.PI * 1.8; // abre na testa (a frente: +z)
    for (const lay of [0, 1]) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), leaf);
      l.scale.set(0.4, 0.5, 1.2);
      const r = 0.128;
      l.position.set(Math.sin(a + Math.PI) * r, 0.01 * lay + 0.004 * Math.sin(k), Math.cos(a + Math.PI) * r);
      l.rotation.y = a + Math.PI / 2;
      l.rotation.x = lay ? 0.5 : -0.5;
      g.add(l);
    }
  }
  return g;
}

// ============================================================================ VERITUS — a ESPADA LONGA do líder
// Livro de Regras ("Espada de Veritus"): a lâmina reta e larga com o sulco no meio e a ponta em losango, a CRUZETA
// comprida de pontas quadradas, o cabo em espiral e o POMO em losango. Segurada a duas mãos (a mão direita no cabo)
export function veritusSword(aura = 0x4a9aff) {
  const g = new THREE.Group();
  const steel = toon(0xc8ccd2);
  const dark = toon(0x3a3c44);
  const core = part(new THREE.CylinderGeometry(0.016, 0.017, 0.24, 8), 0x2a2a30);
  core.position.y = 0.1;
  g.add(core);
  for (let k = 0; k < 12; k++) { // o cabo em espiral
    const w = part(new THREE.TorusGeometry(0.018, 0.005, 4, 10), 0, { mat: steel, outline: false });
    w.rotation.set(Math.PI / 2, 0.45, 0);
    w.position.y = -0.0 + k * 0.019;
    g.add(w);
  }
  const pom = part(new THREE.OctahedronGeometry(0.035, 0), 0, { mat: steel });
  pom.scale.set(0.5, 1.3, 1);
  pom.position.y = 0.26;
  g.add(pom);
  const cross = part(new THREE.BoxGeometry(0.03, 0.026, 0.34), 0, { mat: dark });
  cross.position.y = -0.02;
  g.add(cross);
  for (const z of [0.17, -0.17]) {
    const end = part(new THREE.BoxGeometry(0.036, 0.05, 0.022), 0, { mat: dark });
    end.position.set(0, -0.02, z);
    g.add(end);
  }
  const s = new THREE.Shape();
  s.moveTo(-0.03, 0);
  s.lineTo(-0.03, -0.86);
  s.lineTo(-0.042, -0.9);
  s.lineTo(0, -1.0);
  s.lineTo(0.042, -0.9);
  s.lineTo(0.03, -0.86);
  s.lineTo(0.03, 0);
  s.lineTo(-0.03, 0);
  const b = edgeBlade(s, 0.008, steel);
  b.position.y = -0.04;
  g.add(b);
  const fuller = part(new THREE.BoxGeometry(0.004, 0.78, 0.012), 0x6a6e78, { outline: false });
  fuller.position.y = -0.46;
  for (const sx of [1, -1]) { const f = fuller.clone(); f.position.x = sx * 0.006; g.add(f); }
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.7, 0.01), glowMat(aura, 0.35));
  glow.position.set(0.008, -0.46, 0);
  g.add(glow);
  return g;
}
