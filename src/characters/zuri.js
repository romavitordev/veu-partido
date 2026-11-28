// ZURI (id: zuri) — A VIGÍLIA (Treb Ciach, Irlanda, 890). Pedido do dono (2026-11-21): os membros da Vigília, cada um
// com a forma normal e a TRANSFORMADA (a fantasia do Samhain). Notas de cânone em lore/A-VIGILIA.md.
// Wiki "Zuri": A CURANDEIRA; filha do Idir; a melhor amiga da Eileen (as duas são as únicas sobreviventes do massacre do
// Samhain e, nos anos seguintes, viram um casal). No ep. 1, entre salvar a Eileen ou o Bran, curou a Eileen na hora.
// Habilidades da ficha: ANÁLISE (marcadores), HERBALISTA (Pomada de Mel, Elixir Calmante, Tônico Fortificante),
// CURANDEIRA e LEITURA DE COMBATE ("quando Zuri gasta uma ação para se defender de um ataque, ela recebe 1 marcador de
// Análise"). Arma: a FACA.
// Visual (cânone): estatura média, pele escura de tons quentes, olhos cor de mel, sardas, cabelo preto trançado pela
// metade com a presilha circular prateada; o manto marrom com franjas e capuz sobre a túnica verde-oliva de gola V.
// PROPOSTA de jogo (marcada): o elemento, as sequências de faca, os números, o especial "Ponto Fraco" e a forma
// transformada (o título "Guerreira da Vigília" é do dono; forms/zuri_guerreira.js).
const HONEY = 0xe0a83a; // o mel da Pomada / o dourado da Análise
const STEEL = 0xc8c4be;
const HERB = 0x7aa84a;

export default {
  id: 'zuri',
  name: 'ZURI',
  model: 'zuri',
  color: '#7a9a4a',
  origin: 'A Vigília',
  element: 'conhecimento', // PROPOSTA (sem afinidade no cânone): a Análise
  energyColor: HONEY,
  info: {
    weapon: 'A faca, as ervas e os frascos da bolsa',
    style: 'Curandeira que lê a luta: defende para juntar Análise, marca o ponto fraco e cura a si mesma com as ervas',
    identity: 'A Curandeira: a herbalista de Treb Ciach, a melhor amiga da Eileen',
    tagline: 'Fica parado. Deixa eu ver isso.',
  },
  stats: { moveSpeed: 7.8, attackSpeed: 1.04 },
  ai: { style: 'balanced' },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_zuri', block: 'block' },
  chargeFx: { style: 'default', color: HONEY },

  // de perto: a FACA (cânone) em cortes curtos e o joelho; fecha com a estocada no ponto que ela leu
  melee: {
    name: 'Faca',
    strikes: [
      { name: 'Corte Curto', anim: 'slash_h', dur: 0.25, active: [0.08, 0.15], damage: 22, range: 1.6, arc: 110, knockback: 0.7, lunge: 1.0, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL } },
      { name: 'Corte de Volta', anim: 'slash_h_back', dur: 0.27, active: [0.09, 0.17], damage: 24, range: 1.6, arc: 110, knockback: 0.8, lunge: 0.9, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, flip: true } },
      { name: 'Joelhada', anim: 'knee', dur: 0.34, active: [0.12, 0.21], damage: 28, range: 1.4, arc: 90, knockback: 1.6, lunge: 0.9, guardCrush: 10, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Ponto da Faca', anim: 'thrust', dur: 0.32, active: [0.11, 0.19], damage: 30, range: 1.8, arc: 60, knockback: 1.4, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Corte Fundo', anim: 'knife_final', dur: 0.52, active: [0.2, 0.32], damage: 50, range: 1.9, arc: 100, finisher: 'knockdown', hitstop: 0.1, sound: 'blade', hitSound: 'bladeHit', impactScale: 1.4, trail: { color: HONEY, wide: true } },
    ],
    up: { name: 'Faca para Cima', anim: 'slash_up', dur: 0.42, active: [0.15, 0.27], damage: 34, range: 1.8, arc: 110, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Faca no Chão', anim: 'knife_final', dur: 0.44, active: [0.15, 0.26], damage: 38, range: 1.8, arc: 120, lunge: 1, finisher: 'knockdown', otg: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, roll: 1.4 } },
    forward: { name: 'Empurrão', anim: 'kick_front', dur: 0.4, active: [0.13, 0.23], damage: 30, range: 1.9, arc: 100, knockback: 2.6, motion: [{ t: [0, 0.2], fwd: 4.2, stopClose: true }], sound: 'swing', hitSound: 'kick' },
    back: { name: 'Recuo e Corte', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 34, range: 1.8, arc: 100, knockback: 2.0, iframes: [0, 0.24], motion: [{ t: [0, 0.15], back: 2.4 }, { t: [0.18, 0.32], fwd: 2.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, radius: 1.2, tilt: -0.2 } },
    side: { name: 'Corte de Lado', anim: 'slash_d', dur: 0.42, active: [0.15, 0.3], damage: 28, range: 1.9, arc: 200, knockback: 1.4, motion: [{ t: [0, 0.22], side: 2.2 }], sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, wide: true } },
    air: { name: 'Faca do Alto', anim: 'air_knife', dur: 0.42, active: [0.16, 0.3], damage: 30, range: 2.0, arc: 100, knockback: 3, slam: 14, vertical: 2.2, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, tilt: 1.3 } },
  },

  // □ FRASCO DE ERVAS (PROPOSTA): joga um frasquinho da bolsa — o pó de erva ardida estoura no rosto
  ranged: {
    name: 'Frasco de Ervas',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'chest',
    windup: 0.2,
    recovery: 0.22,
    count: 1,
    interval: 0,
    damage: 18,
    range: 20,
    speed: 30,
    radius: 0.32,
    spread: 0,
    knockback: 0.6,
    hitstun: 0.4,
    cooldown: 1.1,
    energyCost: 0,
    visual: 'druidStone',
    color: HERB,
    sound: 'swing',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + □ ANÁLISE (cânone: marcadores): estuda o adversário — ele fica exposto e ela ganha um marcador de Análise
      id: 'analise',
      name: 'Análise',
      input: 'carga+ranged',
      type: 'analyze',
      buffType: 'analiseZuri',
      label: 'ANALISADO (ZURI)',
      description: 'Estuda o adversário: por 7 s ele recebe 15% a mais de dano, e ela ganha 1 marcador de Análise (o próximo golpe dela sai mais forte).',
      energyCost: 18,
      cooldown: 14,
      range: 14,
      duration: 7,
      takenMult: 1.15,
      analysisMarks: 1,
      color: HONEY,
      ai: { when: 'far', min: 3 },
    },
    {
      // R2 + △ POMADA DE MEL (cânone, Herbalista): passa a pomada nas feridas e se cura por alguns segundos
      id: 'pomadaMel',
      name: 'Pomada de Mel',
      input: 'block+carga',
      type: 'healOverTime',
      label: 'POMADA DE MEL',
      description: 'Passa a pomada de mel nas feridas: recupera vida por 3 s (mais parada) e fecha sangramento e queimadura. Curandeira: rende 25% a mais.',
      energyCost: 26,
      cooldown: 20,
      heal: 110,
      duration: 3,
      stillBonus: 1.2,
      cleanse: true,
      style: 'comfort',
      color: HONEY,
      ai: { when: 'hurt' },
    },
    {
      // △ + L2 ELIXIR CALMANTE (cânone, Herbalista): um gole e a cabeça volta ao lugar — recupera sanidade
      id: 'elixirCalmante',
      name: 'Elixir Calmante',
      input: 'carga+dodge',
      type: 'selfBuff',
      buffType: 'elixirCalmante',
      label: 'ELIXIR CALMANTE',
      anim: 'breath',
      animTime: 0.5,
      sound: 'ritual',
      description: 'Bebe o elixir: recupera 35 de energia na hora e, por 6 s, apanha 10% menos.',
      energyCost: 0,
      cooldown: 18,
      duration: 6,
      energy: 35,
      takenMult: 0.9,
      color: HERB,
      ai: { when: 'hurt' },
    },
    {
      // △ + ○ TÔNICO FORTIFICANTE (cânone, Herbalista): o tônico amargo deixa o braço firme
      id: 'tonico',
      name: 'Tônico Fortificante',
      input: 'carga+physical',
      type: 'selfBuff',
      buffType: 'tonicoFortificante',
      label: 'TÔNICO FORTIFICANTE',
      anim: 'breath',
      animTime: 0.45,
      sound: 'ritual',
      description: 'Toma o tônico: por 8 s bate 18% mais forte e ataca mais rápido.',
      energyCost: 22,
      cooldown: 18,
      duration: 8,
      damageMult: 1.18,
      affects: ['melee', 'ranged'],
      atkSpeed: 1.1,
      color: 0xc8783a,
      ai: { when: 'close' },
    },
  ],

  // PONTO FRACO (PROPOSTA; specials/vigiliaSpecials.js → weakPoint): ela lê o adversário — três pontos dourados acendem
  // no corpo dele — e corta um a um com a faca; cada corte rende mais com a Análise, e o último cura um pouco a ela
  special: {
    name: 'Ponto Fraco',
    banner: 'Fica parado. Deixa eu ver isso.',
    type: 'weakPoint',
    energyCost: 50,
    cooldown: 14,
    range: 9,
    damage: 250,
    heal: 0.25,
    color: HONEY,
    release: 'ACHEI',
    sound: 'specialStart',
  },

  // GUERREIRA DA VIGÍLIA (o título é do dono; a fantasia do Samhain como Transformação): o crânio de cervo com a galhada,
  // o capuz com o cachecol e a capa esfarrapada; fica assim até o fim do round
  awakening: {
    name: 'Guerreira da Vigília',
    banner: 'Guerreira da Vigília',
    type: 'maskTransform',
    prop: 'deerMask',
    form: 'zuri_guerreira',
    formBanner: 'GUERREIRA DA VIGÍLIA',
    swap: [['cowl', true], ['robe', true], ['hair', false], ['mantle', false]],
    sound: 'maskOn',
    tint: 0xc8a060,
    duration: 0,
    bonusHealth: 100,
    color: HONEY,
  },

  passives: [
    { type: 'combatReading', max: 3, per: 0.12 }, // LEITURA DE COMBATE + ANÁLISE (cânone)
    { type: 'curandeira' }, // CURANDEIRA (cânone): as curas rendem mais
  ],
};
