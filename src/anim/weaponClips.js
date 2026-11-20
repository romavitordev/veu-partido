// GOLPES PRÓPRIOS DE CADA ARMA (2026-11-20, revisão armas × animações — dono: "Sempre analise as armas e confira se a
// animação condiz com o jeito que se manipula a arma"). Antes os três usavam os cortes de espada:
//   MAÇA (Gaius): arma curta e pesada — arma o golpe com o cotovelo dobrado atrás do ombro e desce com o peso do corpo,
//     em vez do braço esticado que corta. mace_side, mace_back, mace_over, mace_up, mace_final.
//   MANGUAL (Carina): a bola vem numa corrente com física (weapons.js ropeChain) — o braço GIRA em círculo por cima
//     para dar embalo e chicoteia; a bola segue sozinha. flail_side, flail_back, flail_diag, flail_over, flail_up,
//     flail_spin, flail_air.
//   ARCO (Amália): o arco está na mão ESQUERDA — os golpes de perto saem do braço esquerdo (o espelho dos cortes da
//     direita), batendo com a ponta do arco; a direita fica fechada na guarda. bow_swipe, bow_backhand, bow_rise,
//     bow_spin.
// WEAPON_HIT = fração do clipe em que o golpe acerta (os kits casam a janela `active` com ela).
export const WEAPON_HIT = {
  mace_side: 0.5, mace_back: 0.5, mace_over: 0.55, mace_up: 0.5, mace_final: 0.62,
  flail_side: 0.55, flail_back: 0.55, flail_diag: 0.55, flail_over: 0.62, flail_up: 0.5, flail_spin: 0.6, flail_air: 0.5,
  bow_swipe: 0.45, bow_backhand: 0.45, bow_rise: 0.45, bow_spin: 0.5,
};

export function addWeaponClips(CLIPS, k, GUARD) {
  const END = { ...GUARD, sR: [-1.0, 0.2, -0.2], eR: [-0.9, 0, 0] };
  const LUNGE = { lL: [-0.85, 0, 0.1], kL: [0.85, 0, 0], lR: [0.5, 0, -0.1], kR: [0.25, 0, 0] };
  const DEEP = { lL: [-0.95, 0, 0.1], kL: [1.1, 0, 0], lR: [0.6, 0, -0.1], kR: [0.45, 0, 0] };

  // ---------------- MAÇA (direita, uma mão)
  CLIPS.mace_side = { dur: 0.36, keys: [
    k(0, END),
    k(0.3, { ...GUARD, h: -0.1, sp: [0.05, 0.75, 0], hip: [0, -0.4, 0], sR: [-2.1, -1.2, -0.35], eR: [-1.7, 0, 0], sL: [-0.7, 0.3, 0.4] }),
    k(0.5, { ...GUARD, h: -0.18, sp: [0.2, -0.5, 0], hip: [0, 0.2, 0], sR: [-1.45, 0.8, 0], eR: [-0.35, 0, 0], sL: [-0.4, 0, 0.5], ...LUNGE }),
    k(0.68, { ...GUARD, h: -0.18, sp: [0.22, -0.65, 0], sR: [-1.3, 1.05, 0.1], eR: [-0.5, 0, 0], ...LUNGE }),
    k(1, END),
  ] };
  CLIPS.mace_back = { dur: 0.36, keys: [
    k(0, END),
    k(0.3, { ...GUARD, h: -0.1, sp: [0.05, -0.6, 0], sR: [-1.7, 1.0, 0.1], eR: [-1.9, 0, 0] }),
    k(0.5, { ...GUARD, h: -0.16, sp: [0.18, 0.75, 0], sR: [-1.5, -1.2, 0], eR: [-0.35, 0, 0], ...LUNGE }),
    k(0.68, { ...GUARD, h: -0.16, sp: [0.2, 0.85, 0], sR: [-1.35, -1.4, -0.1], eR: [-0.5, 0, 0], ...LUNGE }),
    k(1, END),
  ] };
  CLIPS.mace_over = { dur: 0.46, keys: [
    k(0, END),
    k(0.35, { ...GUARD, h: -0.02, sp: [-0.28, 0.35, 0], sR: [-2.95, 0.15, -0.2], eR: [-2.2, 0, 0], sL: [-1.2, -0.2, 0.3], eL: [-0.6, 0, 0] }),
    k(0.55, { ...GUARD, h: -0.3, sp: [0.5, 0.1, 0], sR: [-1.4, 0.15, 0], eR: [-0.3, 0, 0], sL: [0.35, 0, 0.45], eL: [-0.4, 0, 0], ...DEEP }),
    k(0.75, { ...GUARD, h: -0.3, sp: [0.52, 0.1, 0], sR: [-1.25, 0.15, 0], eR: [-0.35, 0, 0], ...DEEP }),
    k(1, END),
  ] };
  CLIPS.mace_up = { dur: 0.44, keys: [
    k(0, END),
    k(0.3, { ...GUARD, h: -0.28, sp: [0.4, -0.35, 0], sR: [0.25, 0.35, -0.2], eR: [-0.7, 0, 0], kL: [1.1, 0, 0], kR: [1.0, 0, 0] }),
    k(0.5, { ...GUARD, h: 0.02, sp: [-0.25, 0.45, 0], sR: [-2.6, -0.35, 0], eR: [-0.7, 0, 0], lL: [-0.5, 0, 0.1], kL: [0.3, 0, 0] }),
    k(0.7, { ...GUARD, h: 0.02, sp: [-0.28, 0.5, 0], sR: [-2.8, -0.3, 0], eR: [-0.8, 0, 0] }),
    k(1, END),
  ] };
  // o fim do combo: gira a maça por cima (o peso vai para trás) e esmaga com o corpo inteiro
  CLIPS.mace_final = { dur: 0.64, keys: [
    k(0, END),
    k(0.25, { ...GUARD, h: -0.05, sp: [0.1, 0.8, 0], sR: [-2.0, -1.1, -0.3], eR: [-1.6, 0, 0] }),
    k(0.45, { ...GUARD, h: 0.05, sp: [-0.35, 0.3, 0], sR: [-3.05, 0.1, -0.2], eR: [-2.3, 0, 0], sL: [-1.6, -0.3, 0.3], eL: [-0.4, 0, 0], kL: [0.2, 0, 0], kR: [0.2, 0, 0] }),
    k(0.62, { ...GUARD, h: -0.38, sp: [0.6, 0.05, 0], sR: [-1.35, 0.1, 0], eR: [-0.25, 0, 0], sL: [0.4, 0, 0.5], eL: [-0.3, 0, 0], lL: [-1.05, 0, 0.1], kL: [1.25, 0, 0], lR: [0.7, 0, -0.1], kR: [0.6, 0, 0] }),
    k(0.82, { ...GUARD, h: -0.38, sp: [0.62, 0.05, 0], sR: [-1.2, 0.1, 0], eR: [-0.3, 0, 0], lL: [-1.05, 0, 0.1], kL: [1.25, 0, 0], lR: [0.7, 0, -0.1], kR: [0.6, 0, 0] }),
    k(1, END),
  ] };

  // ---------------- MANGUAL (direita; a bola na corrente segue o braço sozinha)
  const F = { ...GUARD, sR: [-0.4, 0, -0.34], eR: [-0.8, 0, 0] }; // a guarda do mangual (idle_flail): a bola pendurada
  CLIPS.flail_side = { dur: 0.36, keys: [
    k(0, F),
    k(0.18, { ...GUARD, sp: [0.0, 0.5, 0], sR: [-2.4, -0.9, -0.45], eR: [-0.4, 0, 0] }),
    k(0.36, { ...GUARD, h: -0.1, sp: [-0.1, 0.6, 0], sR: [-3.0, 0.2, -0.1], eR: [-0.3, 0, 0] }),
    k(0.55, { ...GUARD, h: -0.16, sp: [0.2, -0.55, 0], sR: [-1.45, 1.1, 0], eR: [-0.05, 0, 0], ...LUNGE }),
    k(0.75, { ...GUARD, h: -0.14, sp: [0.2, -0.75, 0], sR: [-1.1, 1.45, 0.15], eR: [-0.2, 0, 0], ...LUNGE }),
    k(1, F),
  ] };
  CLIPS.flail_back = { dur: 0.36, keys: [
    k(0, F),
    k(0.2, { ...GUARD, sp: [0.05, -0.5, 0], sR: [-1.2, 1.3, 0.1], eR: [-0.3, 0, 0] }),
    k(0.36, { ...GUARD, h: -0.12, sp: [0.2, -0.3, 0], sR: [-0.3, 0.6, -0.4], eR: [-0.1, 0, 0] }),
    k(0.55, { ...GUARD, h: -0.16, sp: [0.18, 0.75, 0], sR: [-1.5, -1.3, 0], eR: [-0.05, 0, 0], ...LUNGE }),
    k(0.75, { ...GUARD, h: -0.14, sp: [0.18, 0.85, 0], sR: [-1.2, -1.6, -0.2], eR: [-0.2, 0, 0], ...LUNGE }),
    k(1, F),
  ] };
  CLIPS.flail_diag = { dur: 0.38, keys: [
    k(0, F),
    k(0.2, { ...GUARD, sp: [0.05, 0.3, 0], sR: [-0.6, -0.8, -0.5], eR: [-0.2, 0, 0] }),
    k(0.38, { ...GUARD, h: -0.05, sp: [-0.2, 0.5, 0], sR: [-2.9, -0.6, -0.2], eR: [-0.3, 0, 0] }),
    k(0.55, { ...GUARD, h: -0.2, sp: [0.4, -0.4, 0], sR: [-0.8, 0.8, 0], eR: [-0.05, 0, 0], ...LUNGE }),
    k(0.75, { ...GUARD, h: -0.18, sp: [0.4, -0.55, 0], sR: [-0.5, 1.0, 0.1], eR: [-0.2, 0, 0], ...LUNGE }),
    k(1, F),
  ] };
  // por cima: o helicóptero (duas voltas da bola sobre a cabeça) e desce no adversário
  CLIPS.flail_over = { dur: 0.46, keys: [
    k(0, F),
    k(0.14, { ...GUARD, sp: [-0.15, 0.2, 0], sR: [-2.9, -0.7, -0.4], eR: [-0.3, 0, 0] }),
    k(0.27, { ...GUARD, sp: [-0.2, 0.0, 0], sR: [-3.05, 0.6, 0.2], eR: [-0.3, 0, 0] }),
    k(0.4, { ...GUARD, sp: [-0.2, 0.2, 0], sR: [-2.9, -0.7, -0.4], eR: [-0.3, 0, 0] }),
    k(0.5, { ...GUARD, h: 0.0, sp: [-0.3, 0.1, 0], sR: [-3.1, 0.2, 0], eR: [-0.4, 0, 0] }),
    k(0.62, { ...GUARD, h: -0.28, sp: [0.5, 0.0, 0], sR: [-1.1, 0.1, 0], eR: [-0.05, 0, 0], ...DEEP }),
    k(0.82, { ...GUARD, h: -0.28, sp: [0.5, 0.0, 0], sR: [-0.9, 0.1, 0], eR: [-0.1, 0, 0], ...DEEP }),
    k(1, F),
  ] };
  // por baixo: embala atrás, perto do chão, e a bola sobe na frente
  CLIPS.flail_up = { dur: 0.44, keys: [
    k(0, F),
    k(0.3, { ...GUARD, h: -0.25, sp: [0.4, -0.3, 0], sR: [0.6, 0.2, -0.3], eR: [-0.1, 0, 0], kL: [1.1, 0, 0], kR: [1.0, 0, 0] }),
    k(0.5, { ...GUARD, h: 0.0, sp: [-0.25, 0.4, 0], sR: [-2.7, -0.2, 0], eR: [-0.1, 0, 0], lL: [-0.5, 0, 0.1], kL: [0.3, 0, 0] }),
    k(0.7, { ...GUARD, h: 0.0, sp: [-0.3, 0.45, 0], sR: [-3.0, -0.1, 0], eR: [-0.2, 0, 0] }),
    k(1, F),
  ] };
  // o Giro do Mangual: o braço aberto para o lado e o corpo inteiro gira — a bola faz o círculo em volta dela
  CLIPS.flail_spin = { dur: 0.62, keys: [
    k(0, F),
    k(0.2, { ...GUARD, h: -0.12, hip: [0, -1.0, 0], sp: [0.1, -0.6, 0], sR: [-1.2, -0.3, -1.25], eR: [-0.05, 0, 0] }),
    k(0.4, { ...GUARD, h: -0.18, hip: [0, 0.2, 0], sp: [0.1, 0.3, 0], sR: [-1.35, 0.3, -1.3], eR: [0, 0, 0] }),
    k(0.6, { ...GUARD, h: -0.24, hip: [0, 1.1, 0], sp: [0.25, 0.8, 0], sR: [-1.45, 1.0, -0.6], eR: [0, 0, 0], ...LUNGE }),
    k(0.8, { ...GUARD, h: -0.22, hip: [0, 1.2, 0], sp: [0.25, 0.9, 0], sR: [-1.2, 1.3, -0.2], eR: [-0.2, 0, 0], ...LUNGE }),
    k(1, F),
  ] };
  const AIRL = { lL: [-0.8, 0, 0], kL: [1.6, 0, 0], lR: [-0.3, 0, 0], kR: [1.4, 0, 0] };
  const AIRD = { lL: [-0.6, 0, 0], kL: [1.0, 0, 0], lR: [0, 0, 0], kR: [0.8, 0, 0] };
  CLIPS.flail_air = { dur: 0.42, keys: [
    k(0, { sp: [-0.2, 0.2, 0], sR: [-2.9, -0.7, -0.4], eR: [-0.3, 0, 0], ...AIRL }),
    k(0.3, { sp: [-0.3, 0, 0], sR: [-3.1, 0.4, 0.1], eR: [-0.4, 0, 0], ...AIRL }),
    k(0.5, { sp: [0.6, 0, 0], sR: [-0.6, 0.15, 0], eR: [0, 0, 0], ...AIRD }),
    k(1, { sp: [0.3, 0, 0], sR: [-0.6, 0.15, 0], eR: [-0.2, 0, 0], ...AIRD }),
  ] };

  // ---------------- ARCO (esquerda): o espelho dos cortes da direita — y e z do ombro e o giro do tronco trocam de sinal
  const B = { ...GUARD, sL: [-1.1, 0, 0.25], eL: [-1.2, 0, 0], sR: [-0.8, 0, -0.3], eR: [-1.9, 0, 0] }; // o arco na frente
  CLIPS.bow_swipe = { dur: 0.32, keys: [
    k(0, B),
    k(0.25, { ...B, h: -0.1, sp: [0.1, -0.8, 0], sL: [-1.5, 1.3, 0], eL: [-0.4, 0, 0] }),
    k(0.45, { ...B, h: -0.15, sp: [0.15, 0.6, 0], sL: [-1.5, -1.0, 0], eL: [-0.1, 0, 0], ...LUNGE }),
    k(0.65, { ...B, h: -0.14, sp: [0.15, 0.75, 0], sL: [-1.35, -1.25, -0.1], eL: [-0.25, 0, 0], ...LUNGE }),
    k(1, B),
  ] };
  CLIPS.bow_backhand = { dur: 0.32, keys: [
    k(0, B),
    k(0.25, { ...B, h: -0.1, sp: [0.1, 0.7, 0], sL: [-1.5, -1.0, 0], eL: [-0.6, 0, 0] }),
    k(0.45, { ...B, h: -0.15, sp: [0.15, -0.8, 0], sL: [-1.5, 1.3, 0], eL: [-0.1, 0, 0], ...LUNGE }),
    k(0.65, { ...B, h: -0.14, sp: [0.15, -0.9, 0], sL: [-1.35, 1.5, 0.1], eL: [-0.25, 0, 0], ...LUNGE }),
    k(1, B),
  ] };
  CLIPS.bow_rise = { dur: 0.42, keys: [
    k(0, B),
    k(0.25, { ...B, h: -0.2, sp: [0.35, 0.3, 0], sL: [-0.4, -0.6, 0], eL: [-0.2, 0, 0], kL: [1.0, 0, 0], kR: [1.0, 0, 0] }),
    k(0.45, { ...B, h: 0, sp: [-0.2, -0.5, 0], sL: [-2.7, 0.6, 0], eL: [-0.2, 0, 0] }),
    k(0.65, { ...B, h: 0, sp: [-0.22, -0.55, 0], sL: [-2.85, 0.5, 0], eL: [-0.3, 0, 0] }),
    k(1, B),
  ] };
  CLIPS.bow_spin = { dur: 0.46, keys: [
    k(0, B),
    k(0.22, { ...B, h: -0.12, hip: [0, 0.9, 0], sp: [0.1, 0.7, 0], sL: [-1.3, -0.4, 1.1], eL: [-0.1, 0, 0] }),
    k(0.5, { ...B, h: -0.18, hip: [0, -1.0, 0], sp: [0.15, -0.8, 0], sL: [-1.45, 1.0, 0.6], eL: [0, 0, 0], ...LUNGE }),
    k(0.72, { ...B, h: -0.16, hip: [0, -1.1, 0], sp: [0.15, -0.9, 0], sL: [-1.2, 1.3, 0.2], eL: [-0.2, 0, 0], ...LUNGE }),
    k(1, B),
  ] };
}
