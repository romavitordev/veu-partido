// NERO (id: nero) — ORDO CALAMITAS (Calamidade, 67 d.C.; personagem do mestre). Wiki "Nero": o IMPERADOR DE ROMA e
// líder dos guerreiros; superior, impõe regras (sem vinho, formalidade), TREME AS MÃOS QUANDO MENTE, e levou a culpa do
// incêndio de Roma. Meia-idade, pele clara, cabelo RUIVO, a armadura medieval com panos CINZAS; nas memórias revividas, a
// aura AZUL. Arma: a ESPADA longa e CURVA e o ESCUDO redondo. O Veritus priorizou protegê-lo no ataque da grande
// silhueta. Morreu no Baile dos Mascarados (o sacrifício do Dante no corpo do Remus).
// Habilidades da ficha: IMPERADOR (ordena que usem habilidades a favor dele) e CONSPIRADOR (se o alvo trair alguém, ganha
// +1 de existência). Fala: "Eu consigo tirar informações de quem eu quiser. Eu sou o imperador de Roma!". A coroa de
// louros é PROPOSTA (o imperador); números, nomes de golpes e o especial também. Modelo próprio do Blender
// (public/models/nero.glb) + a espada, o escudo e a coroa em código (models/ordoWeapons.js).
const BLUE = 0x3a6aff;
const GOLD = 0xd8b04a;
const STEEL = 0xc8ccd4;

export default {
  id: 'nero',
  name: 'NERO',
  model: 'nero',
  color: '#3a6aff',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: BLUE,
  info: {
    weapon: 'A espada longa e curva e o escudo redondo',
    style: 'O imperador: cortes largos de espada curva atrás do escudo, e ordens que o adversário obedece sem querer',
    identity: 'Nero, o imperador de Roma e líder da Ordo Calamitas — superior, cheio de regras, e as mãos tremem quando mente',
    tagline: 'Eu sou o imperador de Roma!',
  },
  stats: { moveSpeed: 7.2, attackSpeed: 1.0 },
  anims: { idle: 'idle_verissimo', run: 'run', charge: 'charge', victory: 'vic_nero', block: 'block_heavy' },
  chargeFx: { style: 'default', color: BLUE },
  dodge: { style: 'default', distance: 4.6 },

  melee: {
    name: 'Espada Curva e Escudo',
    strikes: [
      { name: 'Corte Imperial', anim: 'slash_h', dur: 0.32, active: [0.11, 0.19], damage: 28, range: 2.3, arc: 130, knockback: 1.0, lunge: 0.9, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, tilt: 0.05 } },
      { name: 'Revés Curvo', anim: 'slash_h_back', dur: 0.32, active: [0.11, 0.19], damage: 28, range: 2.3, arc: 130, knockback: 1.0, lunge: 0.9, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, flip: true } },
      { name: 'Escudada', anim: 'shoulder_bash', dur: 0.34, active: [0.12, 0.2], damage: 26, range: 1.7, arc: 100, knockback: 2.0, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Corte Diagonal', anim: 'slash_d', dur: 0.38, active: [0.14, 0.24], damage: 34, range: 2.3, arc: 120, knockback: 1.4, lunge: 0.9, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, roll: 0.8 } },
      { name: 'Sentença do Imperador', anim: 'slash_finisher', dur: 0.62, active: [0.28, 0.4], damage: 60, range: 2.5, arc: 140, lunge: 1.3, finisher: 'launch', hitstop: 0.12, element: 'energia', sound: 'slashFinal', hitSound: 'blade', impactScale: 1.8, trail: { color: GOLD, roll: 1.5, big: true } },
    ],
    up: { name: 'Corte Ascendente', anim: 'slash_up', dur: 0.44, active: [0.15, 0.27], damage: 38, range: 2.3, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Ajoelhe-se', anim: 'slash_v', dur: 0.5, active: [0.2, 0.3], damage: 46, range: 2.3, arc: 100, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'blade', impactScale: 1.4, trail: { color: STEEL, roll: 1.5 } },
    forward: { name: 'Avanço do Escudo', anim: 'shoulder_charge', dur: 0.44, active: [0.13, 0.25], damage: 36, range: 2.0, arc: 110, knockback: 2.8, motion: [{ t: [0, 0.22], fwd: 4.8, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recuo Real', anim: 'slash_h', dur: 0.54, active: [0.3, 0.4], damage: 34, range: 2.4, arc: 130, knockback: 2.2, iframes: [0, 0.22], motion: [{ t: [0, 0.2], back: 2.4 }], sound: 'swing', hitSound: 'blade' },
    side: { name: 'Meia-Lua', anim: 'slash_h', dur: 0.48, active: [0.13, 0.3], damage: 32, range: 2.4, arc: 280, knockback: 1.6, motion: [{ t: [0, 0.25], side: 2.2 }], sound: 'swing', hitSound: 'blade', trail: { color: STEEL, wide: true } },
    air: { name: 'Espada do Alto', anim: 'air_slash', dur: 0.44, active: [0.16, 0.32], damage: 36, range: 2.3, arc: 100, knockback: 3, slam: 16, vertical: 2.4, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, roll: 1.5 } },
  },

  // □: MEIA-LUA DE ENERGIA — a espada curva solta o corte azul em arco
  ranged: {
    name: 'Meia-Lua de Energia',
    type: 'projectile',
    anim: 'slash_h',
    origin: 'chest',
    windup: 0.22,
    recovery: 0.28,
    count: 1,
    interval: 0,
    damage: 30,
    range: 16,
    speed: 28,
    radius: 0.7,
    spread: 0,
    knockback: 1.4,
    hitstun: 0.45,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'shockwave',
    color: BLUE,
    sound: 'swing',
    hitSound: 'blade',
  },

  abilities: [
    {
      // IMPERADOR (a ficha: ordena que usem habilidades a favor dele)
      id: 'imperador',
      name: 'Imperador',
      input: 'carga+dodge', // △ + L2
      type: 'command',
      description: 'Dá a ordem do imperador: o adversário perto obedece — fica parado, de joelhos, aberto para o próximo golpe.',
      energyCost: 26,
      cooldown: 15,
      windup: 0.4,
      range: 7,
      orders: ['AJOELHE-SE!', 'OBEDEÇA!'],
      stun: 1.1,
      damage: 12,
      element: 'energia',
      color: GOLD,
    },
    {
      id: 'muralhaImperial',
      name: 'Escudo Imperial',
      input: 'block+jump', // R2 + ×
      type: 'dashStrike',
      description: 'Avança atrás do escudo redondo e corta por cima: quebra a defesa e empurra longe.',
      energyCost: 20,
      cooldown: 10,
      anim: 'shoulder_charge',
      windup: 0.26,
      distance: 5.5,
      speed: 20,
      recovery: 0.36,
      range: 2.2,
      damage: 50,
      knockback: 3.6,
      guardBreak: true,
      hitSound: 'heavyPunch',
      color: BLUE,
    },
    {
      id: 'sentenca',
      name: 'Sentença',
      input: 'carga+physical', // △ + ○
      type: 'heavyBlow',
      description: 'Ergue a espada curva e dá a sentença: um corte que quebra a defesa e derruba. Preparação longa; errar deixa ele aberto.',
      energyCost: 28,
      cooldown: 12,
      anim: 'slash_v',
      duration: 1.1,
      armorFrom: 0.28,
      impact: 0.66,
      step: 4.5,
      range: 2.4,
      arc: 100,
      damage: 86,
      knockback: 4,
      guardCrush: 60,
      whiffRecovery: 0.5,
      color: GOLD,
      ai: { when: 'opening', max: 2.6 },
    },
    {
      // as REGRAS do imperador: formalidade, sem vinho — e a guarda dele inteira
      id: 'regrasDoImperador',
      name: 'Regras do Imperador',
      input: 'block+carga', // R2 + △
      type: 'selfBuff',
      buffType: 'emperorRules',
      label: 'REGRAS DO IMPERADOR',
      anim: 'ver_order',
      animTime: 0.5,
      orderAllies: true,
      description: 'Impõe as regras: por 7 s recebe 20% menos dano e causa 15% a mais; na equipe, as assistências ficam prontas na hora.',
      energyCost: 26,
      cooldown: 20,
      duration: 7,
      takenMult: 0.8,
      damageMult: 1.15,
      affects: ['melee', 'ranged', 'ability'],
      color: GOLD,
    },
  ],

  // EU SOU O IMPERADOR DE ROMA (PROPOSTA; a fala dele): ordena — o alvo ajoelha —, o escudo na cara, os cortes da espada
  // curva e a sentença final com a aura azul e o dourado do império
  special: {
    name: 'O Imperador de Roma',
    banner: 'Eu consigo tirar informações de quem eu quiser. Eu sou o imperador de Roma!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLUE,
    sound: 'specialStart',
    prepare: { anim: 'ver_command', time: 0.55, fx: 'bladeGlow' },
    dash: { speed: 20, maxTime: 0.5, contact: 1.9 },
    hits: [
      { t: 0.6, anim: 'ver_order', dur: 0.4, share: 0.08, fx: { kind: 'punch', color: GOLD }, sound: 'heavyPunch', victimAnim: 'forced_kneel', call: 'AJOELHE-SE!' },
      { t: 1.1, anim: 'shoulder_bash', dur: 0.34, share: 0.14, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.5, anim: 'slash_h', dur: 0.32, share: 0.14, fx: { kind: 'slash' }, sound: 'blade' },
      { t: 1.9, anim: 'slash_h_back', dur: 0.32, share: 0.14, fx: { kind: 'slash', flip: true, color: GOLD }, sound: 'blade' },
      { t: 2.5, anim: 'slash_finisher', dur: 0.62, share: 0.5, fx: { kind: 'slash', big: true, roll: 1.5 }, sound: 'slashFinal', final: true, quake: GOLD },
    ],
    bannerAt: 0.15,
    length: 3.4,
  },

  awakening: {
    name: 'Memória Revivida',
    banner: 'O Imperador',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ability'], cdRate: 1.2, speedMult: 1.06, aura: 'flame', color: BLUE, heal: 0.12,
  },

  passives: [
    // CONSPIRADOR (a ficha: se o alvo trair alguém, ganha +1 de existência) — no jogo, como a Celestine: cada traição
    // (pelas costas, ou no meio do ataque do outro) soma um dado
    { type: 'nothingPersonal', mult: 0.06, max: 4, time: 12, label: 'CONSPIRADOR' },
  ],
};
