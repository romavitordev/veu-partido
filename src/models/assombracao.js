import * as THREE from 'three';
import { buildNpcModel } from './npcRig.js';
import { buildInkZombie } from './bloodZombie.js';

// A ASSOMBRAÇÃO (A Vigília ep. 3; tools/blender/npc_assombracao.py). Dono (2026-11-19): por dentro um espírito azul
// quase de energia; "nas fantasias não dá pra ver a forma azul, são algumas de palha, couro etc.". Então: a FANTASIA
// inteira (uma roupa — o manto de capuz amarrado de cordas ou a capa de palha — e uma das quatro máscaras: raízes com
// galhada, corvo pintado de preto, demônio de couro, bode) e o ESPÍRITO escondido por baixo; quando a forte quebra a
// fantasia, o espírito acende (um brilho azul translúcido, aditivo, sem contorno).
// Juntas do Zumbi de Sangue fraco (a BloodZombie.pose anima). Devolve `costume` (as peças visíveis da fantasia, que caem
// ou quebram na morte) e `spirit` (o corpo de luz).
export const OUTFITS = ['Manto', 'Palha'];
export const MASKS = ['Raizes', 'Corvo', 'Demonio', 'Bode'];
const SPIRIT = 0x2a8cff;

export function spiritMaterial(opacity = 0.62, color = SPIRIT) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
}

const pickOf = (list) => list[Math.floor(Math.random() * list.length)];

export const ASSOMBRACAO_FIT = 0.93;

export function buildAssombracao({ outfit = null, mask = null } = {}) {
  const m = buildNpcModel('assombracao', { outline: 0.011, noOutline: ['espirito', 'galhada', 'raiz', 'palha', 'corda', 'pena', 'trapo', 'orbita', 'tinta_branca'] });
  if (!m) return ghostify(buildInkZombie(), true); // sem o .glb: o Zumbi de Tinta, todo escuro (provisório)
  const o = outfit || pickOf(OUTFITS);
  const k = mask || pickOf(MASKS);
  // as peças das outras roupas e máscaras somem
  m.scene.traverse((n) => {
    const name = n.name || '';
    if (!/^[JP]_/.test(name)) return;
    for (const other of OUTFITS) if (other !== o && name.includes(other)) n.visible = false;
    if (/mask/.test(name) && !name.includes(k)) n.visible = false;
  });
  // o TAMANHO de gente (dono, 2026-11-19: "Elas tem que ter tamanho normal, no maximo algumas com uns 20cm mais alta por
  // conta da roupa"): o .glb sai com ~2,2 de altura sem os chifres (os personagens têm ~2,05): fica do tamanho deles
  m.scene.scale.multiplyScalar(ASSOMBRACAO_FIT);
  const J = m.joint;
  const model = {
    root: m.root,
    joints: {
      body: J('body'), chest: J('chest'), neck: J('neck'), jaw: J('jaw'),
      armL: { sh: J('shL'), el: J('elL'), hand: J('handL') },
      armR: { sh: J('shR'), el: J('elR'), hand: J('handR') },
      legs: [{ hip: J('hipL'), knee: J('kneeL') }, { hip: J('hipR'), knee: J('kneeR') }],
      zombie: true,
    },
    outfit: o,
    mask: k,
  };
  return ghostify(model, false);
}

function visibleChain(o) {
  for (let p = o; p; p = p.parent) if (!p.visible) return false;
  return true;
}

// separa o espírito (escondido, com o material de luz) da fantasia
function ghostify(model, provisional) {
  const costume = [];
  const spirit = [];
  const found = [];
  model.root.traverse((o) => { if (o.isMesh && !o.userData.isOutline) found.push(o); });
  for (const o of found) {
    const name = (o.material && o.material.name) || '';
    if (!provisional && name.includes('espirito')) {
      const core = name.includes('nucleo');
      o.material = spiritMaterial(core ? 0.7 : 0.38, core ? 0x9adcff : SPIRIT);
      o.material.userData.glow = true;
      o.castShadow = false;
      for (const c of [...o.children]) if (c.userData.isOutline) o.remove(c);
      o.visible = false; // por baixo da fantasia: nada de azul aparece
      spirit.push(o);
    } else if (visibleChain(o)) {
      if (provisional && o.material && o.material.color) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.35); }
      costume.push(o);
    }
  }
  model.costume = costume;
  model.spirit = spirit;
  return model;
}
