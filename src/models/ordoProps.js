import { Color, CanvasTexture, SRGBColorSpace, PlaneGeometry, MeshBasicMaterial, Mesh, DoubleSide } from 'three';
import { MATERIAL_TEXTURES } from './textures.js';
import { SPEAR_REST } from '../anim/spearClips.js';
import { energyFlames } from './weapons.js';
import { gladius, gauntlet, claws, khopesh, straightSword, spear, corneliusShield, doubleDagger, mascarilha, rapier, neroSword, neroShield, laurelCrown, veritusSword } from './ordoWeapons.js';

// AS PEÇAS EM CÓDIGO DA ORDO CALAMITAS (v5.32.0): as armas de cada um e as CHAMAS DA AURA das memórias revividas (a cor
// de cada um, nos ombros, cotovelos e joelhos, como na Amalia). Os elmos e capuzes vêm do Blender (prop_helmet).
// Mesma empunhadura de models/props.js (o cabo atravessa o punho fechado)
const GRIP = -1.35;
const GRIP_HEAVY = -1.15;
const FIST = -0.06;
function inFist(obj, tilt = GRIP) {
  obj.rotation.x = tilt;
  obj.position.y += FIST;
  return obj;
}

// as chamas da aura (a mesma distribuição da Amalia; `alt` pinta os cotovelos e joelhos — o azul do Faustus)
function aura(rig, color, alt = color, size = 1) {
  const inner = new Color(color).lerp(new Color(0xffffff), 0.45).getHex();
  const at = (joint, pos, o, c) => { const f = energyFlames(c, { ...o, inner }); f.position.set(...pos); rig.attach(joint, f); };
  for (const [side, sx] of [['L', 1], ['R', -1]]) {
    at('s' + side, [0.05 * sx, 0.02, 0], { count: 5, radius: 0.1 * size, height: 0.32 * size, width: 0.13 }, color);
    at('e' + side, [0.02 * sx, -0.12, 0], { count: 5, radius: 0.09 * size, height: 0.32 * size, width: 0.12 }, alt);
    at('k' + side, [0, -0.26, 0], { count: 6, radius: 0.1 * size, height: 0.36 * size, width: 0.14 }, alt);
  }
}

// FAUSTUS: o gládio com o colar de cruz na direita; o elmo de gladiador (Blender) sai no Tirar Capacete / Arriscar Tudo
export function addFaustusProps(rig) {
  const g = gladius(0xff5ab4);
  inFist(g);
  rig.sockets.handR.add(g);
  rig.props.gladius = g;
  aura(rig, 0xff5ab4, 0x5aa0ff);
}

// MARIUS: as duas manoplas (presas no pulso, o punho de placas cobrindo a mão fechada)
export function addMariusProps(rig) {
  for (const side of ['R', 'L']) {
    const m = gauntlet(side, 0xff3a2a);
    m.position.y = -0.02;
    rig.sockets['hand' + side].add(m);
    rig.props['gauntlet' + side] = m;
  }
  aura(rig, 0xff3a2a, 0xff3a2a, 1.15);
}

// REMUS: as garras nas duas mãos (três lâminas cada, por cima dos nós dos dedos)
export function addRemusProps(rig) {
  for (const side of ['R', 'L']) {
    const c = claws(0x4aff6a);
    c.rotation.x = -0.25;
    c.position.set(0, -0.04, 0.02);
    rig.sockets['hand' + side].add(c);
    rig.props['claws' + side] = c;
  }
  aura(rig, 0x4aff6a);
}

// CASCADIA: o khopesh na direita, a espada reta na esquerda
export function addCascadiaProps(rig) {
  const k = khopesh();
  inFist(k);
  rig.sockets.handR.add(k);
  rig.props.khopesh = k;
  const s = straightSword();
  inFist(s);
  rig.sockets.handL.add(s);
  rig.props.sword = s;
  aura(rig, 0x4ab4ff);
}

// CORNELIUS: a lança na direita (segurada no terço de trás) e o escudo grande no braço esquerdo
export function addCorneliusProps(rig) {
  const sp = spear(0x5a8cff);
  inFist(sp, GRIP_HEAVY);
  rig.sockets.handR.add(sp);
  rig.props.spear = sp;
  rig.gripProp = { obj: sp, base: sp.rotation.x, rest: SPEAR_REST }; // os golpes de lança giram a pegada (Animator.updateGrip)
  // o escudo na frente do peito com a face para a frente na guarda de lança (idle_spear; spearClips.js)
  const sh = corneliusShield();
  sh.rotation.set(1.48, -1.121, 0);
  sh.position.set(0.035, -0.074, -0.013);
  rig.sockets.handL.add(sh);
  rig.props.shield = sh;
  aura(rig, 0x5a8cff);
}

// KARISE: as duas adagas de ponta dupla e a MASCARILHA metálica no rosto (o capuz vem do Blender)
export function addKariseProps(rig) {
  for (const side of ['R', 'L']) {
    const d = doubleDagger();
    inFist(d);
    rig.sockets['hand' + side].add(d);
    rig.props['dagger' + side] = d;
  }
  const m = mascarilha();
  m.position.set(0, 0.175, 0.008); // o socket da cabeça fica na base do crânio: sobe até os olhos
  rig.sockets.head.add(m);
  rig.props.mascarilha = m;
  aura(rig, 0x3ac8ff);
}

// MARCELLUS: a rapieira de cabo dourado na direita
export function addMarcellusProps(rig) {
  const r = rapier();
  inFist(r);
  rig.sockets.handR.add(r);
  rig.props.rapier = r;
  aura(rig, 0x7ab0ff);
}

// NERO: a espada curva na direita, o escudo redondo na esquerda e a coroa de louros dourada (PROPOSTA)
export function addNeroProps(rig) {
  const s = neroSword();
  inFist(s);
  rig.sockets.handR.add(s);
  rig.props.sword = s;
  const sh = neroShield();
  sh.rotation.set(0, -Math.PI / 2, 0);
  sh.position.set(0.02, 0.04, 0);
  rig.sockets.handL.add(sh);
  rig.props.shield = sh;
  const c = laurelCrown();
  c.position.set(0, 0.25, -0.012); // o socket fica na base do crânio: sobe até o alto da testa, por cima do cabelo
  c.scale.setScalar(1.24);
  rig.sockets.head.add(c);
  rig.props.crown = c;
  aura(rig, 0x3a6aff);
}

// VERITUS: a espada longa na direita (a duas mãos nos golpes)
export function addVeritusProps(rig) {
  const s = veritusSword(0x4a9aff);
  inFist(s, GRIP_HEAVY);
  rig.sockets.handR.add(s);
  rig.props.sword = s;
  rig.showProp('hair', false); // o cabelo loiro não cabe no elmo fechado: só aparece quando ele tira o elmo (veritus.js)
  aura(rig, 0x4a9aff);
}

// VERITUS REVELADO (a Transformação "A Revelação"; forms/veritus_kian.js): o KIAN por baixo do elmo. Cânone (wiki
// "Veritus"/"Kian"): depois de se revelar, a aura vira DOURADA e os olhos AMARELOS. Sem o elmo, o cabelo loiro à mostra,
// a espada acesa em dourado e o rosto com os olhos amarelos (face_veritus_kian)
let kianFaceTex = null;
export function addVeritusKianProps(rig) {
  const s = veritusSword(0xffd27a);
  inFist(s, GRIP_HEAVY);
  rig.sockets.handR.add(s);
  rig.props.sword = s;
  if (rig.props.helmet) rig.showProp('helmet', false);
  if (rig.props.hair) rig.showProp('hair', true);
  aura(rig, 0xffd27a, 0xffb040);
  const swapped = new Map();
  rig.root.traverse((o) => {
    if (!o.isMesh || !o.material || !o.material.name || o.userData.isOutline || !o.material.name.endsWith('face_veritus')) return;
    if (!swapped.has(o.material)) {
      if (!kianFaceTex) { kianFaceTex = MATERIAL_TEXTURES.face_veritus_kian(); kianFaceTex.flipY = false; kianFaceTex.needsUpdate = true; }
      const m = o.material.clone();
      m.map = kianFaceTex;
      m.userData.sharedMap = true;
      swapped.set(o.material, m);
    }
    o.material = swapped.get(o.material);
  });
}

// O SACRIFÍCIO DO RANCOR: sem arma (os punhos enfaixados são do modelo); a aura vermelha do Hexatombe
export function addVeritusRancorProps(rig) {
  aura(rig, 0xff2a1a, 0xc0101a);
  // O ESTIGMA nas costas (cânone: a grande ferida no formato do Estigma do Rancor, Frustração, Ansiedade e Ira; o
  // desenho exato é PROPOSTA): quatro cortes que saem de um círculo, em brilho vermelho por cima da pele
  if (rig.sockets.back) {
    const st = new Mesh(new PlaneGeometry(0.34, 0.4), new MeshBasicMaterial({ map: stigmaTex(), transparent: true, depthWrite: false, side: DoubleSide, toneMapped: false }));
    st.rotation.y = Math.PI;
    st.position.set(0, -0.06, STIGMA_Z);
    st.renderOrder = 2;
    rig.sockets.back.add(st);
    rig.props.stigma = st;
  }
}
const STIGMA_Z = -0.028; /* a pele das costas fica ~0,11 atrás do socket 'back' + 0,1 (medido no jogo) */
let stigmaCache = null;
function stigmaTex() {
  if (stigmaCache) return stigmaCache;
  const c = document.createElement('canvas');
  c.width = 256; c.height = 300;
  const g = c.getContext('2d');
  g.translate(128, 150);
  g.lineCap = 'round';
  const glow = (w, col, blur) => { g.strokeStyle = col; g.lineWidth = w; g.shadowColor = '#ff2a1a'; g.shadowBlur = blur; };
  for (const [w, col, blur] of [[18, 'rgba(160,0,10,0.55)', 26], [9, 'rgba(255,60,30,0.9)', 14], [3, 'rgba(255,220,180,1)', 4]]) {
    glow(w, col, blur);
    g.beginPath(); g.arc(0, -10, 34, 0, Math.PI * 2); g.stroke(); // o centro
    // as quatro emoções: Rancor (cima), Ira (baixo), Ansiedade e Frustração (as diagonais), em cortes tortos
    for (const [a, len] of [[-Math.PI / 2, 105], [Math.PI / 2, 120], [-Math.PI / 5, 95], [Math.PI + Math.PI / 5, 95]]) {
      g.beginPath();
      let x = Math.cos(a) * 38, y = -10 + Math.sin(a) * 38;
      g.moveTo(x, y);
      for (let k = 1; k <= 5; k++) { const r = 38 + (len - 38) * k / 5; const j = (k % 2 ? 1 : -1) * 0.08; x = Math.cos(a + j) * r; y = -10 + Math.sin(a + j) * r; g.lineTo(x, y); }
      g.stroke();
    }
  }
  stigmaCache = new CanvasTexture(c);
  stigmaCache.colorSpace = SRGBColorSpace;
  return stigmaCache;
}
