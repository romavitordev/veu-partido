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
      // IMPERADOR (a ficha: ordena que quem tem uma habilidade que o favoreça a use nele)
      id: 'imperador',
      name: 'Imperador',
      input: 'carga+dodge', // △ + L2
      type: 'imperialOrder',
      description: 'A ordem do imperador: os estados BONS do adversário (força, proteção, velocidade) passam para Nero. Sem nenhum, o adversário AJOELHA por 1 s e 30 de sanidade dele vão para Nero.',
      energyCost: 24,
      cooldown: 15,
      windup: 0.4,
      recovery: 0.3,
      range: 10,
      kneel: 1.0,
      drain: 30,
      color: GOLD,
    },
    {
      // CONSPIRADOR (a ficha: se o alvo trair alguém, o alvo ganha +1 ponto de existência)
      id: 'conspirador',
      name: 'Conspirador',
      input: 'carga+physical', // △ + ○
      type: 'conspiracy',
      description: 'Oferece a conspiração por 4 s: se o adversário bater nele (trair), GANHA 1 ponto de existência, mas fica MARCADO como traidor por 12 s e Nero bate 40% mais forte nele. Se ninguém trair, o ponto fica com Nero.',
      energyCost: 20,
      cooldown: 16,
      range: 12,
      window: 4,
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
      // as REGRAS do imperador (cânone: sem vinho, formalidade): um decreto por vez, em ordem
      id: 'regrasDoImperador',
      name: 'Regras do Imperador',
      input: 'block+carga', // R2 + △
      type: 'emperorRules',
      anim: 'ver_order',
      description: 'Um decreto por 6 s, na ordem: SEM VINHO (nada cura e a sanidade volta pela metade), FORMALIDADE (lento e sem esquiva), SILÊNCIO (sem habilidades).',
      energyCost: 26,
      cooldown: 18,
      range: 12,
      duration: 6,
      color: GOLD,
    },
  ],

  // ROMA EM CHAMAS (o incêndio de que ele levou a culpa): três anéis de fogo saem dele — pule ou esquive —, o chão em
  // volta queima e ele ordena "AJOELHEM-SE"
  special: {
    name: 'Roma em Chamas',
    banner: 'Eu sou o imperador de Roma!',
    type: 'romeBurns',
    energyCost: 50,
    cooldown: 14,
    range: 14,
    ringDamage: 75,
    ringSpeed: 9,
    ringRadius: 12,
    groundRadius: 4.5,
    groundTime: 3,
    kneel: 1.1,
    damage: 250,
    color: 0xff6a1a,
    sound: 'specialStart',
  },

  awakening: {
    name: 'Memória Revivida',
    banner: 'O Imperador',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ability'], cdRate: 1.2, speedMult: 1.06, aura: 'flame', color: BLUE, heal: 0.12,
  },

  passives: [
    // CONSPIRADOR (a ficha): quem aceita a conspiração e bate nele ganha o ponto, mas fica marcado — Nero bate 40% mais
    // forte em quem o traiu (combat/ordoCalamitas.js)
    { type: 'conspirador', mult: 1.4, mark: 12, color: GOLD },
  ],
};
