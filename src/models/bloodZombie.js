import * as THREE from 'three';
import { buildNpcModel } from './npcRig.js';
import { buildMarionetteProcedural } from './marionette.js';

// ZUMBI DE SANGUE (invocação do Diabo) — modelos do Blender (tools/blender/npc_zumbi_lib.py, escultura de
// npc_sculpt_lib.py) pelas miniaturas da wiki: carne gosmenta vermelha, cegos (as órbitas vazias), a bocarra de presas
// e braços longos com garras. Duas variações: o FRACO (magro, o crânio grande e calvo) e o FORTE = o BESTIAL (a corcova
// de músculo, quase de quatro, o crânio partido ao meio e a mandíbula enorme). Sem o .glb, usa a Marionete tingida.
// o ZUMBI DE TINTA (O Segredo na Ilha; tools/blender/npc_zumbi_tinta.py): um morador tomado pela Tinta, com as mesmas
// juntas do Zumbi de Sangue fraco (a mesma pose curvada). Sem o .glb, o Zumbi de Sangue fraco.
export function buildInkZombie() {
  const m = buildNpcModel('zumbi_tinta', { outline: 0.011, noOutline: ['tooth', 'claw', 'maw', 'olho', 'iris', 'pupila', 'ink', 'cabelo'] });
  if (!m) return buildBloodZombie(false);
  const J = m.joint;
  return {
    root: m.root,
    joints: {
      body: J('body'), chest: J('chest'), neck: J('neck'), jaw: J('jaw'),
      armL: { sh: J('shL'), el: J('elL'), hand: J('handL') },
      armR: { sh: J('shR'), el: J('elR'), hand: J('handR') },
      legs: [{ hip: J('hipL'), knee: J('kneeL') }, { hip: J('hipR'), knee: J('kneeR') }],
      zombie: true,
    },
  };
}

export function buildBloodZombie(strong = false) {
  const m = buildNpcModel(strong ? 'zumbi_sangue_forte' : 'zumbi_sangue', { outline: strong ? 0.016 : 0.012, noOutline: ['vein', 'fang', 'claw', 'gum', 'maw'] });
  if (m) {
    const J = m.joint;
    const joints = {
      body: J('body'), chest: J('chest'), neck: J('neck'), jaw: J('jaw'),
      armL: { sh: J('shL'), el: J('elL'), hand: J('handL') },
      armR: { sh: J('shR'), el: J('elR'), hand: J('handR') },
      legs: [{ hip: J('hipL'), knee: J('kneeL') }, { hip: J('hipR'), knee: J('kneeR') }],
      zombie: true,
    };
    return { root: m.root, joints };
  }
  const p = buildMarionetteProcedural();
  p.root.traverse((o) => {
    if (o.isMesh && o.material && o.material.color && !o.userData.isOutline) {
      o.material = o.material.clone();
      o.material.color.lerp(new THREE.Color(0xa01018), 0.75);
    }
  });
  if (strong) p.root.scale.setScalar(1.2);
  return p;
}
