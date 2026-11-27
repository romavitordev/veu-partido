// MAEL (id: mael) — A VIGÍLIA (Treb Ciach, Irlanda, 890). Pedido do dono (2026-11-21): os membros da Vigília, cada um
// com a forma normal e a TRANSFORMADA (a fantasia do Samhain). Notas de cânone em lore/A-VIGILIA.md.
// Wiki "Mael": intérprete Leo Santi; O DRUIDA, aprendiz do Marban, da CHAMA DE PROTEÇÃO; Executor; morreu no ep. 3.
// Fala: "Esse é meu destino." Ficha: Físico 8, Mente 6, Emoção 8, Bruxaria 8; habilidades ÍMPETO, CHAMADO (2 PD) e
// RESOLUTO (+6 PD).
// Visual (cânone): cabelo cacheado castanho-escuro em mullet, um dread loiro com planta, a coroa de galhos que forma
// chifres, a camisa creme aberta, os suspensórios em X com bolsos, ervas e três pedras (verde, roxa, vermelha), a faixa
// larga trançada, o lenço verde, a calça verde riscada, as botas amarradas e a MACHADINHA no cinto.
// PROPOSTA de jogo (marcada): o elemento, as sequências da machadinha e do punho, as Pedras do Druida, os números, o
// especial "O Círculo do Samhain" e a Transformação "Herói da Vigília" (forms/mael_heroi.js).
const FLAME = 0xffd84a; // a Chama de Proteção (amarela)
const LEAF = 0x6a9a3a;
const STEEL = 0xc8c4c0;

export default {
  id: 'mael',
  name: 'MAEL',
  model: 'mael',
  color: '#8aa84a',
  origin: 'A Vigília',
  element: 'energia', // PROPOSTA: o druida da Chama de Proteção (sem afinidade no cânone)
  energyColor: FLAME,
  info: {
    weapon: 'A machadinha, os punhos e as pedras do druida',
    style: 'Briga de perto com ímpeto: apanhar enche a barra, as raízes prendem e a Chama de Proteção segura o tranco',
    identity: 'O druida aprendiz do Marban, da Chama de Proteção',
    tagline: 'Esse é meu destino.',
  },
  stats: { moveSpeed: 7.5, attackSpeed: 1.02, maxEnergy: 120 }, // RESOLUTO (+6 PD): a barra maior (PROPOSTA)
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge', victory: 'vic_mael', block: 'block' },
  chargeFx: { style: 'default', color: FLAME },
  dodge: { style: 'default', distance: 5 },

  // a MACHADINHA na direita e o punho na esquerda: talho, soco, talho, gancho e a machadada por cima
  melee: {
    name: 'Machadinha e Punho',
    strikes: [
      { name: 'Talho da Machadinha', anim: 'slash_h', dur: 0.3, active: [0.1, 0.18], damage: 26, range: 2.0, arc: 120, knockback: 1.0, lunge: 1.0, sound: 'swing', hitSound: 'axeHit' },
      { name: 'Soco do Druida', anim: 'jab', dur: 0.26, active: [0.08, 0.15], damage: 22, range: 1.6, arc: 70, knockback: 0.8, lunge: 0.9, sound: 'swing', hitSound: 'punch' },
      { name: 'Talho de Volta', anim: 'slash_h_back', dur: 0.32, active: [0.1, 0.19], damage: 28, range: 2.0, arc: 120, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'axeHit' },
      { name: 'Gancho', anim: 'hook_l', dur: 0.36, active: [0.12, 0.21], damage: 32, range: 1.7, arc: 90, knockback: 1.6, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Machadada do Peregrino', anim: 'slash_finisher', dur: 0.6, active: [0.26, 0.4], damage: 58, range: 2.2, arc: 100, lunge: 1.4, finisher: 'launch', hitstop: 0.12, sound: 'slashFinal', hitSound: 'axeHit', impactScale: 1.7, trail: { color: FLAME, big: true } },
    ],
    up: { name: 'Machadinha de Baixo', anim: 'slash_up', dur: 0.44, active: [0.16, 0.28], damage: 38, range: 2.0, arc: 100, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'axeHit', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Pisão na Raiz', anim: 'stomp', dur: 0.48, active: [0.2, 0.3], damage: 42, range: 1.9, arc: 140, lunge: 0.6, finisher: 'knockdown', sound: 'heavyPunch', hitSound: 'heavyPunch' },
    forward: { name: 'Ímpeto', anim: 'uppercut', dur: 0.46, active: [0.14, 0.26], damage: 38, range: 1.9, arc: 90, knockback: 2.6, motion: [{ t: [0, 0.22], fwd: 5, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recua e Corta', anim: 'slash_v', dur: 0.5, active: [0.26, 0.36], damage: 32, range: 2.1, arc: 80, knockback: 2.0, iframes: [0, 0.18], motion: [{ t: [0, 0.2], back: 2.6 }], sound: 'swing', hitSound: 'axeHit' },
    side: { name: 'Talho de Passagem', anim: 'slash_h', dur: 0.4, active: [0.12, 0.22], damage: 30, range: 2.0, arc: 140, knockback: 1.6, motion: [{ t: [0, 0.24], side: 2 }], sound: 'swing', hitSound: 'axeHit' },
    air: { name: 'Machadinha do Alto', anim: 'air_slash', dur: 0.42, active: [0.16, 0.3], damage: 34, range: 2.0, arc: 100, knockback: 3, slam: 15, vertical: 2.2, sound: 'swing', hitSound: 'axeHit' },
  },

  // □ PEDRAS DO DRUIDA (PROPOSTA; as três pedras do suspensório no cânone): tira uma pedra do bolso e joga, acesa de
  // Energia — verde, roxa e vermelha, uma de cada vez
  ranged: {
    name: 'Pedras do Druida',
    description: 'Tira uma das três pedras do suspensório (verde, roxa, vermelha) e joga acesa de Energia. Rápida e leve.',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'hand',
    windup: 0.2,
    recovery: 0.22,
    count: 1,
    interval: 0,
    damage: 26,
    range: 18,
    speed: 30,
    radius: 0.34,
    spread: 0,
    knockback: 1.2,
    hitstun: 0.35,
    cooldown: 1.6,
    energyCost: 0,
    visual: 'druidStone',
    colors: [0x5ad05a, 0xa865ff, 0xff4a3a],
    color: LEAF,
    element: 'energia',
    sound: 'knifeThrow',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + ○ MACHADADA (PROPOSTA): ergue a machadinha com as duas mãos e desce com o corpo todo
      id: 'machadada',
      name: 'Machadada',
      input: 'carga+physical',
      type: 'heavyBlow',
      description: 'Ergue a machadinha com as duas mãos e desce com o corpo todo: quebra a defesa e derruba. Preparação longa; errar deixa ele aberto.',
      energyCost: 24,
      cooldown: 11,
      anim: 'arn_lunge',
      duration: 0.95,
      armorFrom: 0.2,
      impact: 0.56,
      step: 4.5,
      range: 2.4,
      arc: 70,
      damage: 76,
      knockback: 4,
      guardCrush: 55,
      whiffRecovery: 0.5,
      color: FLAME,
      ai: { when: 'opening', max: 2.4 },
    },
    {
      // △ + L2 CHAMADO (cânone, 2 PD): o druida chama a força da natureza para si — golpes mais fortes e mais rápidos
      id: 'chamado',
      name: 'Chamado',
      input: 'carga+dodge',
      type: 'selfBuff',
      buffType: 'chamado',
      label: 'CHAMADO',
      anim: 'concentrate',
      animTime: 0.45,
      sound: 'ritual',
      description: 'Chama a força da floresta: por 7 s bate 20% mais forte e ataca mais rápido.',
      energyCost: 20,
      cooldown: 18,
      duration: 7,
      damageMult: 1.2,
      atkSpeed: 1.12,
      color: LEAF,
      ai: { when: 'close' },
    },
    {
      // R2 + △ RAÍZES DE TREB CIACH (PROPOSTA; a floresta da vila): as raízes de madeira sobem sob o adversário e prendem
      id: 'raizes',
      name: 'Raízes de Treb Ciach',
      input: 'block+carga',
      type: 'rootTrap',
      description: 'Bate a mão no chão: as raízes da floresta de Treb Ciach sobem sob o adversário e o prendem por um instante.',
      energyCost: 24,
      cooldown: 13,
      range: 14,
      radius: 1.3,
      delay: 0.5,
      hold: 1.1,
      damage: 40,
      color: LEAF,
      rootColor: 0x5a4028,
      flower: false,
      ai: { when: 'far', min: 2.5 },
    },
    {
      // R2 + × CHAMA DE PROTEÇÃO (cânone: o ritual que o Marban ensinou; o fogo amarelo que guarda a vila): a chama
      // envolve o corpo e segura o tranco
      id: 'chamaProtecao',
      name: 'Chama de Proteção',
      input: 'block+jump',
      type: 'selfBuff',
      buffType: 'chamaProtecao',
      label: 'CHAMA DE PROTEÇÃO',
      anim: 'cast_up',
      animTime: 0.5,
      sound: 'ritual',
      description: 'A chama amarela da proteção envolve o corpo: por 6 s recebe 35% menos dano e aguenta 2 golpes sem recuar.',
      energyCost: 22,
      cooldown: 20,
      duration: 6,
      takenMult: 0.65,
      armor: 2,
      redAura: FLAME,
      color: FLAME,
      ai: { when: 'hurt' },
    },
  ],

  // O CÍRCULO DO SAMHAIN (PROPOSTA): risca no chão o símbolo dourado do ritual da Chama de Proteção; quem está dentro
  // fica preso e a chama amarela sobe em três ondas. "Esse é meu destino."
  special: {
    name: 'O Círculo do Samhain',
    banner: 'Esse é meu destino.',
    type: 'protectionCircle',
    energyCost: 50,
    cooldown: 14,
    range: 6.5,
    radius: 4.4,
    damage: 250,
    color: FLAME,
    release: 'ESSE É MEU DESTINO',
    sound: 'specialStart',
  },

  // HERÓI DA VIGÍLIA (PROPOSTA: a fantasia do Samhain como Transformação): a máscara de casca em espiral com os galhos,
  // a gola de folhas secas e a capa esfarrapada; fica assim até o fim do round
  awakening: {
    name: 'Herói da Vigília',
    banner: 'Herói da Vigília',
    type: 'maskTransform',
    prop: 'woodMask',
    form: 'mael_heroi',
    formBanner: 'HERÓI DA VIGÍLIA',
    swap: [['heroCloak', true], ['leafCollar', true], ['hair', false]],
    sound: 'maskOn',
    tint: 0xc8b050,
    duration: 0, // até o fim do round
    bonusHealth: 100,
    color: FLAME,
  },

  passives: [
    // ÍMPETO (cânone): apanhar dá mais vontade — o dano recebido enche a barra
    { type: 'masochist', ratio: 0.1 },
  ],
};
