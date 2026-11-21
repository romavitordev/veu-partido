// Animações próprias do KERBEROS (a forma do Quibungo jogável; tools/blender/char_kerberos.py). O esqueleto dele está
// DEITADO: os braços são as patas da frente e as pernas as de trás, a coluna na horizontal e a cabeça do meio para a
// frente. Por isso os clipes quase não mexem a coluna (sp, hip) — os clipes de gente dobrariam o corpo para dentro do
// chão. Convenções de clips.js: ombro/perna x < 0 → a pata vai para a frente; joelho x > 0 → dobra; cabeça x > 0 → baixa.
//   kb_idle    respira pesado, as cabeças balançando
//   kb_run     o galope (as patas da frente juntas, depois as de trás)
//   kb_bite    as cabeças recuam e MORDEM para baixo e à frente (o combo e a Mordida)
//   kb_claw_l/r  uma pata da frente se ergue e rasga para baixo
//   kb_tail    gira o corpo e a cauda varre em volta
//   kb_spikes  arqueia as costas (os espinhos se eriçam) e dispara
//   kb_pounce  agacha e se lança com as patas da frente esticadas
//   kb_roar    ergue a frente do corpo e urra (a vitória e o fim da transformação)
//   kb_block   abaixa e se fecha, as cabeças baixas
//   kb_charge  agachado, tremendo
export function addKerberosClips(CLIPS, k) {
  const KB = { h: 0 };
  const CROUCH = { h: -0.16, sL: [-0.25, 0, 0], eL: [0.55, 0, 0], sR: [-0.25, 0, 0], eR: [0.55, 0, 0], lL: [-0.35, 0, 0], kL: [0.6, 0, 0], lR: [-0.35, 0, 0], kR: [0.6, 0, 0], hd: [0.2, 0, 0] };
  const GAL_A = { h: 0.05, sL: [-0.6, 0, 0], eL: [0.25, 0, 0], sR: [-0.45, 0, 0], eR: [0.2, 0, 0], lL: [0.5, 0, 0], kL: [0.2, 0, 0], lR: [0.38, 0, 0], kR: [0.15, 0, 0], hd: [0.1, 0, 0] };
  const GAL_B = { h: -0.05, sL: [0.45, 0, 0], eL: [0.6, 0, 0], sR: [0.35, 0, 0], eR: [0.65, 0, 0], lL: [-0.55, 0, 0], kL: [0.6, 0, 0], lR: [-0.42, 0, 0], kR: [0.55, 0, 0], hd: [-0.1, 0, 0] };
  const ROAR = { h: 0.12, hip: [-0.22, 0, 0], sp: [-0.12, 0, 0], hd: [-0.75, 0, 0], sL: [-1.0, 0, 0.3], eL: [0.9, 0, 0], sR: [-1.0, 0, -0.3], eR: [0.9, 0, 0], lL: [0.25, 0, 0], kL: [0.3, 0, 0], lR: [0.25, 0, 0], kR: [0.3, 0, 0] };
  const BITE_UP = { h: -0.04, hd: [-0.45, 0, 0], sp: [-0.06, 0, 0], sL: [0.2, 0, 0], sR: [0.2, 0, 0], lL: [-0.15, 0, 0], kL: [0.3, 0, 0], lR: [-0.15, 0, 0], kR: [0.3, 0, 0] };
  const BITE = { h: -0.1, hd: [0.5, 0, 0], sp: [0.08, 0, 0], sL: [-0.45, 0, 0], eL: [0.3, 0, 0], sR: [-0.45, 0, 0], eR: [0.3, 0, 0], lL: [0.25, 0, 0], kL: [0.15, 0, 0], lR: [0.25, 0, 0], kR: [0.15, 0, 0] };
  const claw = (s) => {
    const S = s === 'L' ? 1 : -1;
    const up = { h: 0.04, hd: [-0.25, 0.15 * S, 0], ['s' + s]: [-1.6, 0, 0.35 * S], ['e' + s]: [-0.5, 0, 0], lL: [-0.1, 0, 0], lR: [-0.1, 0, 0] };
    const hit = { h: -0.06, hd: [0.25, -0.1 * S, 0], ['s' + s]: [-0.55, 0, -0.1 * S], ['e' + s]: [0.4, 0, 0], lL: [0.15, 0, 0], lR: [0.15, 0, 0] };
    return { dur: 0.3, keys: [k(0, KB), k(0.35, up), k(0.6, hit), k(1, KB)] };
  };
  Object.assign(CLIPS, {
    kb_idle: { dur: 1.6, loop: true, keys: [k(0, KB), k(0.5, { h: -0.035, sp: [0.03, 0, 0], hd: [-0.1, 0.12, 0], sL: [0.04, 0, 0], sR: [0.04, 0, 0] }), k(1, KB)] },
    kb_run: { dur: 0.48, loop: true, keys: [k(0, GAL_A), k(0.5, GAL_B), k(1, GAL_A)] },
    kb_bite: { dur: 0.45, keys: [k(0, KB), k(0.4, BITE_UP), k(0.62, BITE), k(1, KB)] },
    kb_claw_l: claw('L'),
    kb_claw_r: claw('R'),
    kb_tail: { dur: 0.6, keys: [k(0, KB), k(0.25, { ...CROUCH, hip: [0, -0.5, 0] }), k(0.6, { h: -0.05, hip: [0, 1.4, 0] }), k(1, KB)] },
    kb_spikes: { dur: 0.7, keys: [k(0, KB), k(0.45, { h: 0.08, sp: [-0.22, 0, 0], hip: [0.1, 0, 0], hd: [-0.5, 0, 0], lL: [0.2, 0, 0], lR: [0.2, 0, 0] }), k(0.65, { h: -0.04, sp: [0.12, 0, 0], hd: [0.2, 0, 0] }), k(1, KB)] },
    kb_pounce: { dur: 0.9, keys: [k(0, KB), k(0.3, CROUCH), k(0.55, { h: 0.2, hip: [-0.2, 0, 0], hd: [-0.3, 0, 0], sL: [-1.3, 0, 0], eL: [-0.2, 0, 0], sR: [-1.3, 0, 0], eR: [-0.2, 0, 0], lL: [0.8, 0, 0], kL: [0.1, 0, 0], lR: [0.8, 0, 0], kR: [0.1, 0, 0] }), k(0.8, BITE), k(1, KB)] },
    kb_roar: { dur: 1.4, keys: [k(0, KB), k(0.3, ROAR), k(0.6, { ...ROAR, hd: [-0.85, 0.15, 0] }), k(0.85, { ...ROAR, hd: [-0.7, -0.15, 0] }), k(1, ROAR)] },
    kb_block: { dur: 0.8, loop: true, keys: [k(0, CROUCH), k(1, { ...CROUCH, h: -0.2 })] },
    kb_charge: { dur: 0.5, loop: true, keys: [k(0, CROUCH), k(0.5, { ...CROUCH, h: -0.2, hd: [-0.3, 0, 0] }), k(1, CROUCH)] },
  });
}
