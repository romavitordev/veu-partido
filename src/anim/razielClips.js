// Animações próprias do RAZIEL (Vampiros, Hexatombe). Chamado no fim de clips.js (recebe CLIPS e o ajudante k).
// Mesmas convenções de clips.js: personagem olha para +Z; ombro x < 0 → braço para a frente; ombro y + → varre para a
// esquerda dele; ombro z → abre para o lado (esq. +, dir. −); cotovelo x < 0 → dobra; perna x < 0 → à frente.
//   idle_raziel    o aristocrata: ereto, o queixo erguido, as garras abertas e baixas, respirando devagar
//   vic_raziel     "Eu espero que vocês aproveitem esse banquete": abre os braços como o anfitrião da ceia
//   raziel_bite    o bote curto da MORDIDA: avança curvado, a cabeça na frente, as garras puxando a vítima
//   raziel_pounce  o BOTE RETALHADOR: agacha, salta e desce com as duas garras rasgando de cima
//   raziel_feast   o BANQUETE: segura com as duas mãos e crava os dentes, puxando a cabeça para trás
//   O VERDADEIRO RAZIEL (cena 'beast' de maskTransform.js):
//   raziel_hunch   dobra-se para a frente, as garras cravadas no peito, tremendo (a fera querendo sair)
//   raziel_tongue  joga a cabeça para trás com a boca escancarada — a língua desenrola para fora
//   raziel_rip     agarra a gola com as duas garras cruzadas no peito e RASGA as vestes para os lados

export function addRazielClips(CLIPS, k) {
  const LEGS = { lL: [-0.2, 0, 0.1], kL: [0.25, 0, 0], lR: [0.18, 0, -0.1], kR: [0.22, 0, 0] };
  const IDLE = { h: -0.04, ...LEGS, sp: [-0.06, 0.1, 0], hd: [-0.12, -0.1, 0], sL: [-0.35, 0, 0.35], eL: [-0.7, 0, 0], sR: [-0.35, 0, -0.35], eR: [-0.7, 0, 0] };
  const CROUCH = { h: -0.36, lL: [-0.85, 0, 0.18], kL: [1.4, 0, 0], lR: [0.45, 0, -0.16], kR: [1.25, 0, 0] };
  // VELISAR (a arte de Hexatombe): curvado de um jeito desumano, os dedos em garra juntos na frente do peito
  const VEL = { h: -0.03, ...LEGS, sp: [0.38, 0.05, 0], hd: [-0.25, -0.1, 0.06], sL: [-1.05, -0.55, 0.15], eL: [-1.55, 0, 0], sR: [-1.05, 0.55, -0.15], eR: [-1.55, 0, 0] };
  // ZÉFERO (a fera na corrente): agachado, o tronco para a frente, as garras abertas penduradas
  const ZEF = { h: -0.2, lL: [-0.65, 0, 0.22], kL: [0.95, 0, 0], lR: [0.2, 0, -0.22], kR: [0.75, 0, 0], sp: [0.55, 0, 0], hd: [-0.45, 0, 0], sL: [-0.55, 0, 0.3], eL: [-0.45, 0, 0], sR: [-0.4, 0, -0.35], eR: [-0.3, 0, 0] };
  Object.assign(CLIPS, {
    idle_velisar: { dur: 2.6, loop: true, keys: [k(0, VEL), k(0.5, { ...VEL, sp: [0.44, 0.1, 0], hd: [-0.3, 0.12, 0.1], eL: [-1.65, 0, 0], eR: [-1.65, 0, 0] }), k(1, VEL)] },
    idle_zefero: { dur: 0.9, loop: true, keys: [k(0, ZEF), k(0.45, { ...ZEF, h: -0.23, sp: [0.62, 0.12, 0], hd: [-0.35, 0.2, 0], sL: [-0.62, 0, 0.32], sR: [-0.5, 0, -0.38] }), k(1, ZEF)] },
    // a reverência do ator do cinema mudo: um braço no peito, o outro aberto, o corpo dobrado
    vic_velisar: { dur: 1.6, keys: [
      k(0, VEL),
      k(0.5, { h: -0.04, ...LEGS, sp: [0.75, 0, 0], hd: [0.2, 0, 0], sL: [-0.4, 0, 1.2], eL: [-0.2, 0, 0], sR: [-1.2, 0.9, -0.1], eR: [-1.8, 0, 0] }),
      k(1, { h: -0.04, ...LEGS, sp: [0.6, 0, 0], hd: [-0.1, 0, 0.1], sL: [-0.6, 0, 1.3], eL: [-0.2, 0, 0], sR: [-1.2, 0.9, -0.1], eR: [-1.8, 0, 0] }),
    ] },
    // a fera rosna para o céu, agachada, as garras abertas
    vic_zefero: { dur: 1.4, keys: [
      k(0, ZEF),
      k(0.5, { ...ZEF, h: -0.26, sp: [0.2, 0, 0], hd: [-0.7, 0, 0], sL: [-0.9, 0, 0.9], eL: [-0.6, 0, 0], sR: [-0.9, 0, -0.9], eR: [-0.6, 0, 0] }),
      k(1, { ...ZEF, h: -0.24, sp: [0.25, 0, 0], hd: [-0.8, 0, 0], sL: [-0.8, 0, 1.0], eL: [-0.7, 0, 0], sR: [-0.8, 0, -1.0], eR: [-0.7, 0, 0] }),
    ] },
    idle_raziel: { dur: 2.2, loop: true, keys: [k(0, IDLE), k(0.5, { ...IDLE, h: -0.06, sp: [-0.02, 0.1, 0], hd: [-0.08, -0.14, 0], sL: [-0.4, 0, 0.38], sR: [-0.4, 0, -0.38] }), k(1, IDLE)] },
    vic_raziel: { dur: 1.6, keys: [
      k(0, IDLE),
      k(0.4, { h: -0.02, ...LEGS, sp: [-0.18, 0, 0], hd: [-0.3, 0, 0], sL: [-1.2, 0, 1.1], eL: [-0.3, 0, 0], sR: [-1.2, 0, -1.1], eR: [-0.3, 0, 0] }),
      k(1, { h: -0.02, ...LEGS, sp: [-0.22, 0, 0], hd: [-0.38, 0, 0], sL: [-1.0, 0, 1.25], eL: [-0.2, 0, 0], sR: [-1.0, 0, -1.25], eR: [-0.2, 0, 0] }),
    ] },
    raziel_bite: { dur: 0.5, keys: [
      k(0, IDLE),
      k(0.35, { h: -0.18, hip: [0, 0.2, 0], lL: [-0.9, 0, 0.1], kL: [0.9, 0, 0], lR: [0.6, 0, -0.1], kR: [0.4, 0, 0], sp: [0.6, 0, 0], hd: [-0.4, 0, 0], sL: [-1.5, -0.3, 0.2], eL: [-0.9, 0, 0], sR: [-1.5, 0.3, -0.2], eR: [-0.9, 0, 0] }),
      k(0.6, { h: -0.2, hip: [0, 0.2, 0], lL: [-0.9, 0, 0.1], kL: [0.9, 0, 0], lR: [0.6, 0, -0.1], kR: [0.4, 0, 0], sp: [0.75, 0, 0], hd: [0.2, 0, 0], sL: [-1.2, -0.5, 0.1], eL: [-1.5, 0, 0], sR: [-1.2, 0.5, -0.1], eR: [-1.5, 0, 0] }),
      k(1, IDLE),
    ] },
    raziel_pounce: { dur: 0.9, keys: [
      k(0, IDLE),
      k(0.3, { ...CROUCH, sp: [0.5, 0, 0], hd: [-0.5, 0, 0], sL: [0.6, 0, 0.6], eL: [-1.2, 0, 0], sR: [0.6, 0, -0.6], eR: [-1.2, 0, 0] }),
      k(0.5, { h: 0.1, lL: [-0.6, 0, 0.1], kL: [0.5, 0, 0], lR: [0.4, 0, -0.1], kR: [0.8, 0, 0], sp: [-0.2, 0, 0], hd: [-0.3, 0, 0], sL: [-2.8, 0, 0.3], eL: [-0.4, 0, 0], sR: [-2.8, 0, -0.3], eR: [-0.4, 0, 0] }),
      k(0.68, { h: -0.3, lL: [-1.0, 0, 0.12], kL: [1.1, 0, 0], lR: [0.6, 0, -0.12], kR: [0.9, 0, 0], sp: [0.9, 0, 0], hd: [0.1, 0, 0], sL: [-0.6, -0.4, 0.2], eL: [-0.2, 0, 0], sR: [-0.6, 0.4, -0.2], eR: [-0.2, 0, 0] }),
      k(1, { ...CROUCH, h: -0.2, sp: [0.6, 0, 0], hd: [-0.1, 0, 0], sL: [-0.4, -0.3, 0.3], eL: [-0.4, 0, 0], sR: [-0.4, 0.3, -0.3], eR: [-0.4, 0, 0] }),
    ] },
    raziel_feast: { dur: 0.7, loop: true, keys: [
      k(0, { h: -0.1, ...LEGS, sp: [0.45, 0, 0], hd: [0.4, 0, 0], sL: [-1.5, -0.4, 0.1], eL: [-1.4, 0, 0], sR: [-1.5, 0.4, -0.1], eR: [-1.4, 0, 0] }),
      k(0.5, { h: -0.12, ...LEGS, sp: [0.3, 0, 0], hd: [-0.25, 0.1, 0], sL: [-1.4, -0.5, 0.1], eL: [-1.6, 0, 0], sR: [-1.4, 0.5, -0.1], eR: [-1.6, 0, 0] }),
      k(1, { h: -0.1, ...LEGS, sp: [0.45, 0, 0], hd: [0.4, 0, 0], sL: [-1.5, -0.4, 0.1], eL: [-1.4, 0, 0], sR: [-1.5, 0.4, -0.1], eR: [-1.4, 0, 0] }),
    ] },
    raziel_hunch: { dur: 0.9, keys: [
      k(0, IDLE),
      k(0.5, { h: -0.2, lL: [-0.5, 0, 0.14], kL: [0.7, 0, 0], lR: [0.3, 0, -0.14], kR: [0.6, 0, 0], sp: [0.7, 0, 0], hd: [0.35, 0, 0], sL: [-1.25, -0.6, 0.25], eL: [-2.1, 0, 0], sR: [-1.25, 0.6, -0.25], eR: [-2.1, 0, 0] }),
      k(0.75, { h: -0.22, lL: [-0.5, 0, 0.14], kL: [0.72, 0, 0], lR: [0.3, 0, -0.14], kR: [0.62, 0, 0], sp: [0.78, 0.06, 0.04], hd: [0.42, -0.08, 0], sL: [-1.3, -0.62, 0.22], eL: [-2.15, 0, 0], sR: [-1.2, 0.6, -0.28], eR: [-2.05, 0, 0] }),
      k(1, { h: -0.22, lL: [-0.5, 0, 0.14], kL: [0.72, 0, 0], lR: [0.3, 0, -0.14], kR: [0.62, 0, 0], sp: [0.74, -0.05, -0.04], hd: [0.38, 0.08, 0], sL: [-1.22, -0.6, 0.28], eL: [-2.05, 0, 0], sR: [-1.3, 0.62, -0.22], eR: [-2.15, 0, 0] }),
    ] },
    raziel_tongue: { dur: 0.7, keys: [
      k(0, { h: -0.22, lL: [-0.5, 0, 0.14], kL: [0.72, 0, 0], lR: [0.3, 0, -0.14], kR: [0.62, 0, 0], sp: [0.74, 0, 0], hd: [0.38, 0, 0], sL: [-1.22, -0.6, 0.28], eL: [-2.05, 0, 0], sR: [-1.3, 0.62, -0.22], eR: [-2.15, 0, 0] }),
      k(0.5, { h: -0.1, ...LEGS, sp: [-0.2, 0, 0], hd: [-0.55, 0, 0], sL: [-0.25, 0, 0.75], eL: [-0.9, 0, 0], sR: [-0.25, 0, -0.75], eR: [-0.9, 0, 0] }),
      k(1, { h: -0.1, ...LEGS, sp: [-0.24, 0, 0], hd: [-0.42, 0, 0], sL: [-0.3, 0, 0.8], eL: [-1.0, 0, 0], sR: [-0.3, 0, -0.8], eR: [-1.0, 0, 0] }),
    ] },
    raziel_rip: { dur: 0.8, keys: [
      k(0, { h: -0.1, ...LEGS, sp: [-0.24, 0, 0], hd: [-0.42, 0, 0], sL: [-0.3, 0, 0.8], eL: [-1.0, 0, 0], sR: [-0.3, 0, -0.8], eR: [-1.0, 0, 0] }),
      k(0.4, { h: -0.14, ...LEGS, sp: [0.15, 0, 0], hd: [0.1, 0, 0], sL: [-1.75, -0.75, 0.15], eL: [-2.2, 0, 0], sR: [-1.75, 0.75, -0.15], eR: [-2.2, 0, 0] }),
      k(0.6, { h: -0.18, ...LEGS, sp: [-0.3, 0, 0], hd: [-0.35, 0, 0], sL: [-1.1, 0.35, 1.45], eL: [-0.25, 0, 0], sR: [-1.1, -0.35, -1.45], eR: [-0.25, 0, 0] }),
      k(1, { h: -0.2, ...LEGS, sp: [-0.34, 0, 0], hd: [-0.45, 0, 0], sL: [-0.95, 0.4, 1.5], eL: [-0.2, 0, 0], sR: [-0.95, -0.4, -1.5], eR: [-0.2, 0, 0] }),
    ] },
  });
}
