// GOLPES DE LANÇA (2026-11-20, dono: "a maneira de segurar deveriam ser diferentes de uma espada, as vezes o boneco
// pode segurar a lança por cima e cravar no inimigo, ou vir com a lança por baixo e ataca-lo de baixo pra cima, ou dar
// uma investida com a lança, ou arremessar ela" — e logo vem o Bran, o Inquebrável, outro lanceiro).
// A espada sai do punho como um prolongamento do antebraço; a lança não: ela fica DEITADA, apontando para o alvo, e a
// mão gira em volta da haste. Por isso cada clipe tem `grip` (Animator.updateGrip): o giro da lança DENTRO da mão.
// Medido no Cornelius (vista de lado): ângulo da ponta ≈ (−ombro.x − cotovelo.x) + 1,08 − grip, onde 0 = para baixo,
// π/2 = para a frente, π = para cima. As poses foram conferidas renderizadas de lado (2026-11-20).
//   spear_thrust  estocada curta (combo)        spear_lunge  a investida: o corpo inteiro vai junto
//   spear_over    por cima, crava para baixo    spear_low    por baixo, sobe na diagonal
//   spear_air     do alto, crava no chão        spear_throw / spear_throw_hold  o arremesso (e a carga segurando □)
//   spear_sweep   a haste varrida (a lança deitada, o giro do corpo)
export const SPEAR_REST = 1.9; // a guarda: a ponta para a frente, um pouco para cima

export function addSpearClips(CLIPS, k, GUARD) {
  const G = { ...GUARD, sR: [-0.7, 0, -0.25], eR: [-2.0, 0, 0] };
  const R = SPEAR_REST;
  const P = {
    thrustWind: { ...G, h: -0.12, sp: [0.05, -0.2, 0], sR: [-0.3, 0, -0.2], eR: [-1.9, 0, 0] },
    thrustHit: { ...G, h: -0.2, sp: [0.3, 0.25, 0], hip: [0, 0.1, 0], sR: [-1.5, 0, -0.05], eR: [-0.1, 0, 0], lL: [-0.95, 0, 0.1], kL: [0.9, 0, 0], lR: [0.45, 0, -0.1], kR: [0.15, 0, 0] },
    lungeWind: { ...G, h: -0.22, sp: [0.15, -0.35, 0], hip: [0, -0.4, 0], sR: [0.05, 0, -0.2], eR: [-1.7, 0, 0], lL: [-0.5, 0, 0.12], kL: [0.9, 0, 0], lR: [0.4, 0, -0.12], kR: [0.8, 0, 0] },
    lungeHit: { ...G, h: -0.3, sp: [0.45, 0.25, 0], hip: [0, 0.15, 0], sR: [-1.55, 0, 0], eR: [0, 0, 0], sL: [-0.2, 0, 0.5], eL: [-0.6, 0, 0], lL: [-1.25, 0, 0.1], kL: [1.1, 0, 0], lR: [0.7, 0, -0.1], kR: [0.05, 0, 0] },
    overWind: { ...G, h: -0.06, sp: [-0.12, 0.1, 0], sR: [-2.9, 0, -0.25], eR: [-1.5, 0, 0] },
    overHit: { ...G, h: -0.18, sp: [0.4, 0.2, 0], sR: [-1.9, 0, -0.1], eR: [-0.2, 0, 0], lL: [-0.7, 0, 0.1], kL: [0.7, 0, 0] },
    lowWind: { ...G, h: -0.3, sp: [0.35, -0.1, 0], sR: [0.2, 0, -0.2], eR: [-1.0, 0, 0], lL: [-0.7, 0, 0.15], kL: [1.3, 0, 0], lR: [0.3, 0, -0.15], kR: [0.9, 0, 0] },
    lowHit: { ...G, h: -0.1, sp: [0.05, 0.25, 0], sR: [-1.3, 0, -0.1], eR: [-0.3, 0, 0], lL: [-0.6, 0, 0.12], kL: [0.5, 0, 0] },
    airWind: { ...G, sp: [-0.2, 0.1, 0], sR: [-3.0, 0, -0.25], eR: [-1.3, 0, 0], lL: [-0.9, 0, 0.1], kL: [1.4, 0, 0], lR: [-0.3, 0, -0.1], kR: [1.6, 0, 0] },
    airHit: { ...G, sp: [0.55, 0.15, 0], sR: [-1.4, 0, -0.1], eR: [-0.1, 0, 0], lL: [-0.6, 0, 0.1], kL: [1.0, 0, 0], lR: [0.1, 0, -0.1], kR: [1.2, 0, 0] },
    throwWind: { ...G, h: -0.1, sp: [-0.15, -0.25, 0], hip: [0, -0.5, 0], sR: [-2.9, 0, -0.3], eR: [-1.6, 0, 0], sL: [-1.4, 0, 0.3], eL: [-0.5, 0, 0], lL: [-0.6, 0, 0.12], kL: [0.3, 0, 0] },
    throwHold: { ...G, h: -0.12, sp: [-0.2, -0.3, 0], hip: [0, -0.55, 0], sR: [-2.95, 0, -0.32], eR: [-1.7, 0, 0], sL: [-1.45, 0, 0.32], eL: [-0.45, 0, 0], lL: [-0.65, 0, 0.12], kL: [0.35, 0, 0] },
    throwRel: { ...G, h: -0.14, sp: [0.35, 0.25, 0], sR: [-1.8, 0, -0.1], eR: [-0.2, 0, 0], sL: [-0.4, 0, 0.3], eL: [-0.8, 0, 0], lL: [-0.8, 0, 0.12], kL: [0.6, 0, 0] },
    sweepWind: { ...G, h: -0.14, sp: [0.1, -0.7, 0], hip: [0, -0.5, 0], sR: [-1.4, 0.9, -0.3], eR: [-0.4, 0, 0] },
    sweepHit: { ...G, h: -0.16, sp: [0.15, 0.8, 0], hip: [0, 0.4, 0], sR: [-1.4, -0.9, -0.4], eR: [-0.3, 0, 0], lL: [-0.6, 0, 0.12], kL: [0.6, 0, 0] },
  };
  // a pegada de cada pose (a fórmula do topo): a lança deitada para a frente em quase tudo
  const g = { thrustWind: 1.71, thrustHit: 1.05, lungeWind: 1.5, lungeHit: 1.0, overWind: 4.21, overHit: 2.15, lowWind: 0.0, lowHit: 0.3, airWind: 4.3, airHit: 2.4, throwWind: 3.83, throwHold: 3.9, throwRel: 1.48, sweepWind: 0.9, sweepHit: 0.9 };

  CLIPS.spear_thrust = { dur: 0.34, keys: [k(0, G), k(0.3, P.thrustWind), k(0.48, P.thrustHit), k(0.7, P.thrustHit), k(1, G)], grip: [[0, R], [0.3, g.thrustWind], [0.48, g.thrustHit], [0.7, g.thrustHit], [1, R]] };
  CLIPS.spear_lunge = { dur: 0.5, keys: [k(0, G), k(0.36, P.lungeWind), k(0.52, P.lungeHit), k(0.78, P.lungeHit), k(1, G)], grip: [[0, R], [0.36, g.lungeWind], [0.52, g.lungeHit], [0.78, g.lungeHit], [1, R]] };
  CLIPS.spear_over = { dur: 0.42, keys: [k(0, G), k(0.36, P.overWind), k(0.55, P.overHit), k(0.75, P.overHit), k(1, G)], grip: [[0, R], [0.3, g.overWind], [0.55, g.overHit], [0.78, g.overHit], [1, R]] };
  CLIPS.spear_low = { dur: 0.44, keys: [k(0, G), k(0.34, P.lowWind), k(0.55, P.lowHit), k(0.75, P.lowHit), k(1, G)], grip: [[0, R], [0.34, g.lowWind], [0.55, g.lowHit], [0.78, g.lowHit], [1, R]] };
  CLIPS.spear_air = { dur: 0.46, keys: [k(0, P.airWind), k(0.3, P.airWind), k(0.5, P.airHit), k(1, P.airHit)], grip: [[0, g.airWind], [0.3, g.airWind], [0.5, g.airHit], [1, g.airHit]] };
  CLIPS.spear_throw = { dur: 0.6, keys: [k(0, G), k(0.42, P.throwWind), k(0.55, P.throwRel), k(0.75, P.throwRel), k(1, G)], grip: [[0, R], [0.4, g.throwWind], [0.55, g.throwRel], [1, g.throwRel]] };
  // segurando □: a lança já armada atrás da cabeça, o corpo tremendo um pouco (carregando)
  CLIPS.spear_throw_hold = { dur: 0.5, keys: [k(0, G), k(0.6, P.throwWind), k(0.8, P.throwHold), k(1, P.throwWind)], grip: [[0, R], [0.6, g.throwWind], [0.8, g.throwHold], [1, g.throwWind]] };
  // a soltura quando vem da carga: a pose de armar já está pronta, então só o arremesso
  CLIPS.spear_throw_release = { dur: 0.4, keys: [k(0, P.throwWind), k(0.3, P.throwRel), k(0.65, P.throwRel), k(1, G)], grip: [[0, g.throwWind], [0.3, g.throwRel], [1, g.throwRel]] };
  CLIPS.spear_sweep = { dur: 0.42, keys: [k(0, G), k(0.3, P.sweepWind), k(0.55, P.sweepHit), k(0.75, P.sweepHit), k(1, G)], grip: [[0, R], [0.3, g.sweepWind], [0.55, g.sweepHit], [1, R]] };
}
