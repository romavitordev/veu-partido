// RUBENS NALUTI (id: rubens) — Ordo Realitas (Equipe Abutres, Calamidade). Pedido de 2026-11-02: completar as equipes
// que já existem; com a Carina (v4.17.0) ele fecha os Abutres.
// Wiki "Rubens Naluti": Energia; Especialista / ATIRADOR DE ELITE + SOCORRISTA, 1,56 m, pardo, olhos castanhos, cabelo
// BRANCO e CACHEADO preso num coque. Fechado, sério e econômico: fala por PALAVRAS-CHAVE ("Fio, cobre, solto.
// Palavras-chave, é assim que eu trabalho."). Amigo do Balu, parceiro do Johnny Tabasco; foi quem reanimou o Balu.
// Fala do cânone: "Ainda bem que eu voltei, e vou continuar voltando."
// Arsenal (cânone): GLOCK SILENCIADA; o MARTELO de guerra longo (cabo escuro, anéis de prata, ornamentos dourados);
// a FACA DE COMBATE do Johnny na coxa (o especial Pelo Johnny fecha com ela). Itens: Amuleto de Proteção Elemental
// (Sangue), Relógio de Arnaldo, Coração Pulsante (corta o dano pela metade).
// Habilidades (cânone): SALTO FANTASMA (ritual de Energia: some numa estática elétrica rosa, azul, ciano e verde e
// reaparece), Saque Rápido, Mira de Elite, Paramédico / Tratar Ferimentos, Surto Temporal, Queima-Roupa.
// PROPOSTA de jogo (marcada): as sequências do martelo, o especial "Fio, Cobre, Solto", o despertar e os números.
const CYAN = 0x4ae0ff;
const PINK = 0xff4ab0;
const STEEL = 0xd8dce2; // o rastro do martelo

export default {
  id: 'rubens',
  name: 'RUBENS NALUTI',
  model: 'rubens',
  color: '#4ae0ff', // os cabos que brilham no peito
  origin: 'Ordo Realitas', // Equipe Abutres
  element: 'energia',
  energyColor: CYAN,
  info: {
    weapon: 'O Martelo de guerra, a Glock Silenciada e a faca de combate do Johnny Tabasco',
    style: 'Atirador e socorrista: martelo rápido de perto, a Glock no □, some na estática e reaparece do lado; se remenda no meio da luta',
    identity: 'O paramédico baixinho da Equipe Abutres, que sempre volta',
    tagline: 'Ainda bem que eu voltei. E vou continuar voltando.',
  },
  stats: { moveSpeed: 8.4, attackSpeed: 1.12 }, // pequeno e rápido (PROPOSTA)
  anims: { idle: 'idle_hammer', run: 'run', charge: 'charge', victory: 'victory', block: 'block_hammer', blockHeavy: 'block_heavy' },
  // martelo de duas mãos (a pegada do Balu): andando leva no ombro
  grip: {
    twoHand: true,
    reach: 0.42,
    carry: { sR: [-0.55, 0.35, -0.35], eR: [-1.6, 0, 0] },
    freeLeft: ['point', 'victory', 'throw_r', 'charge', 'defeat', 'hit', 'launched', 'fall', 'getup', 'concentrate', 'vanish', 'spin_kick', 'kick_round'],
  },
  chargeFx: { style: 'default', color: CYAN },
  dodge: { style: 'default', distance: 6.2 }, // o menor e mais rápido dos Abutres

  // O MARTELO: as mesmas pancadas do Balu, mais curtas e mais leves (ele é pequeno)
  melee: {
    name: 'Martelo',
    strikes: [
      { name: 'Martelada lateral', anim: 'hammer_h', dur: 0.36, active: [0.1, 0.19], damage: 28, range: 2.3, arc: 140, knockback: 1.0, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.1, trail: { color: STEEL, tilt: 0.05 } },
      { name: 'Martelada cruzada', anim: 'hammer_diag', dur: 0.42, active: [0.16, 0.26], damage: 30, range: 2.3, arc: 120, knockback: 1.1, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.2, trail: { color: STEEL, roll: 0.8 } },
      { name: 'Martelada por cima', anim: 'hammer_v', dur: 0.48, active: [0.21, 0.31], damage: 36, range: 2.4, arc: 80, knockback: 1.5, lunge: 1.1, guardCrush: 16, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.4, groundFx: 'dust', groundScale: 0.7, hitstop: 0.08, trail: { color: STEEL, roll: 1.55 } },
      { name: 'Fio, Cobre, Solto', anim: 'hammer_finisher', dur: 0.7, active: [0.3, 0.44], damage: 56, range: 2.5, arc: 170, lunge: 1.5, finisher: 'launch', sound: 'slashFinal', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.8, hitstop: 0.11, trail: { color: CYAN, roll: 1.4, big: true } },
    ],
    up: { name: 'Martelo de baixo', anim: 'hammer_up', dur: 0.46, active: [0.16, 0.26], damage: 36, range: 2.3, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.3, trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Martelo no chão', anim: 'hammer_ground', dur: 0.54, active: [0.21, 0.33], damage: 40, range: 2.3, arc: 100, lunge: 0.9, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.4, groundFx: 'smash', groundScale: 0.8, hitstop: 0.09 },
    forward: { name: 'Investida curta', anim: 'hammer_charge', dur: 0.52, active: [0.23, 0.33], damage: 34, range: 2.4, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.25], fwd: 6.4, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.3, groundFx: 'dust', groundScale: 0.5, trail: { color: STEEL, tilt: -0.6 } },
    back: { name: 'Recua e martela', anim: 'hammer_h', dur: 0.46, active: [0.21, 0.29], damage: 30, range: 2.3, arc: 130, knockback: 2.4, motion: [{ t: [0, 0.13], back: 1.8 }, { t: [0.16, 0.28], fwd: 1.9, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.2, trail: { color: STEEL, tilt: 0.05 } },
    side: { name: 'Martelada em movimento', anim: 'hammer_h', dur: 0.42, active: [0.15, 0.24], damage: 28, range: 2.3, arc: 150, knockback: 1.7, motion: [{ t: [0, 0.22], side: 2.8 }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.1, trail: { color: STEEL, tilt: 0.2 } },
    air: { name: 'Martelo aéreo', anim: 'hammer_air', dur: 0.46, active: [0.16, 0.32], damage: 34, range: 2.3, arc: 110, knockback: 3, slam: 16, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.3, trail: { color: STEEL, roll: 1.4 } },
  },

  // □ GLOCK SILENCIADA com o SAQUE RÁPIDO (cânone): solta o martelo numa mão, dois tiros abafados e volta
  ranged: {
    name: 'Glock Silenciada',
    description: 'Saque Rápido: puxa a Glock Silenciada, dois tiros abafados e volta para o martelo.',
    type: 'projectile',
    anim: 'point',
    showProp: 'glock',
    hideProp: 'hammer',
    windup: 0.08,
    recovery: 0.24,
    count: 2,
    interval: 0.12,
    damage: 16,
    range: 30,
    speed: 85,
    radius: 0.24,
    spread: 0.02,
    knockback: 0.6,
    hitstun: 0.2,
    cooldown: 2.0,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffe08a,
    sound: 'knifeThrow', // silenciada: o tiro sai abafado
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + L2 SALTO FANTASMA (cânone): a estática elétrica rosa, azul, ciano e verde, e ele já está em outro lugar
      id: 'saltoFantasma',
      name: 'Salto Fantasma',
      input: 'carga+dodge',
      type: 'blink',
      description: 'Some numa estática elétrica colorida e reaparece: na direção do analógico ou, sem direção, ao lado do adversário.',
      energyCost: 18,
      cooldown: 7,
      distance: 8,
      flankDistance: 2.4,
      vanishTime: 0.2,
      color: CYAN,
      residue: 'glitch',
    },
    {
      // △ + ○ QUEIMA-ROUPA (cânone): a pistola encostada no alvo
      id: 'queimaRoupa',
      name: 'Queima-Roupa',
      input: 'carga+physical',
      type: 'pointBlank',
      description: 'Encosta a Glock no adversário e dispara: só funciona COLADO nele (até 2,4 m) e joga longe. Longe demais, nem saca.',
      energyCost: 18,
      cooldown: 9,
      range: 2.4,
      windup: 0.14,
      recovery: 0.3,
      damage: 46,
      knockback: 3.2,
      hitstun: 0.6,
      anim: 'point',
      showProp: 'glock',
      hideProp: 'hammer',
      color: 0xffe08a,
    },
    {
      // △ + □ MIRA DE ELITE (cânone): para, mira com calma e acerta onde quer
      id: 'miraElite',
      name: 'Mira de Elite',
      input: 'carga+ranged',
      type: 'deathShot',
      description: 'Para, mira com calma (o laser aparece no alvo) e dá um tiro certeiro e forte. A mira deixa ele parado um instante.',
      energyCost: 25,
      cooldown: 12,
      windup: 0.55,
      recovery: 0.28,
      aimAnim: 'point',
      fireAnim: 'point',
      showProp: 'glock',
      hideProp: 'hammer',
      aimColor: CYAN,
      projectile: { name: 'Mira de Elite', type: 'projectile', visual: 'bullet', color: 0xffe08a, damage: 52, range: 40, speed: 95, radius: 0.3, knockback: 2.2, hitstun: 0.6, hitSound: 'impact', impactScale: 1.4 },
      ai: { when: 'far', min: 5 },
    },
    {
      // R2 + △ TRATAR FERIMENTOS / PARAMÉDICO (cânone): o socorrista se remenda no meio da luta
      id: 'tratarFerimentos',
      name: 'Tratar Ferimentos',
      input: 'block+carga',
      type: 'healOverTime',
      description: 'O socorrista se remenda no meio da luta: recupera vida por 3 s (mais se ficar parado). Apanhar no meio não cancela.',
      energyCost: 25,
      cooldown: 20,
      heal: 160,
      duration: 3,
      stillBonus: 1.3,
      style: 'mist',
      color: CYAN,
      ai: { when: 'hurt' },
    },
    {
      // R2 + X CORAÇÃO PULSANTE (cânone: o item corta o dano pela metade)
      id: 'coracaoPulsante',
      name: 'Coração Pulsante',
      input: 'block+jump',
      type: 'selfBuff',
      buffType: 'coracaoPulsante',
      label: 'CORAÇÃO PULSANTE',
      anim: 'concentrate',
      description: 'O Coração Pulsante bate no peito: por 4 s recebe METADE do dano.',
      energyCost: 22,
      cooldown: 22,
      duration: 4,
      takenMult: 0.5,
      color: PINK,
      ai: { when: 'hurt' },
    },
  ],

  // PELO JOHNNY (PROPOSTA; pedido do dono: o especial ligado ao Johnny Tabasco, o parceiro dele): saca a Glock, some na
  // estática, reaparece nas costas atirando, cola no alvo e fecha com a FACA DE COMBATE DO JOHNNY, a que ele leva na coxa
  special: {
    name: 'Pelo Johnny',
    banner: 'Essa é pelo Johnny.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: CYAN,
    sound: 'specialStart',
    prepare: { anim: 'point', time: 0.4, showProp: 'glock', hideProp: 'hammer' },
    dash: { speed: 26, maxTime: 0.45, contact: 2.2 },
    standOff: 2.2,
    hits: [
      { t: 0.2, noHit: true, anim: 'vanish', dur: 0.3, vanish: 0.4, shout: 'FIO.' },
      { t: 0.7, anim: 'point', dur: 0.5, share: 0.24, fx: { kind: 'punch' }, sound: 'impact', behind: true, burst: { count: 4, gap: 0.09, sound: 'knifeThrow' }, call: 'COBRE.', push: 0.05 },
      { t: 1.3, anim: 'point', dur: 0.5, share: 0.24, fx: { kind: 'punch' }, sound: 'impact', behind: true, burst: { count: 4, gap: 0.09, sound: 'knifeThrow' }, push: 0.05 },
      { t: 1.95, anim: 'knife_final', dur: 0.5, share: 0.52, fx: { kind: 'stab', big: true }, sound: 'slashFinal', props: [['glock', false], ['knife', true]], closeIn: true, final: true, shout: 'PELO JOHNNY.', bleed: { dps: 4, duration: 3 } },
    ],
    bannerAt: 0.2,
    length: 2.9,
  },

  // DESPERTAR (PROPOSTA, pela fala do cânone): "Ainda bem que eu voltei" — os cabos do peito acendem, ele se levanta
  // remendado, as recargas voltam mais rápido e ele se cura aos poucos até o fim do round
  awakening: {
    name: 'Ainda Bem Que Eu Voltei',
    banner: 'Ainda bem que eu voltei. E vou continuar voltando.',
    type: 'awakenMode',
    mult: 1.1, affects: ['ranged', 'ability'], cdRate: 1.35, regen: 3, heal: 0.12, takenMult: 0.9, speedMult: 1.08, aura: 'flame', glowMat: 'cables', color: CYAN,
  },

  passives: [
    { type: 'elementalAffinity', element: 'energia', mult: 1.1 }, // rituais de Energia dele um pouco mais fortes
    { type: 'elementalAffinity', element: 'sangue', mult: 1, resist: 0.8 }, // Amuleto de Proteção Elemental (Sangue): −20%
  ],
};
