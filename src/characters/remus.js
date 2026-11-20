// REMUS (id: remus) — ORDO CALAMITAS (Calamidade, 67 d.C.; intérprete: Rakin). Wiki "Remus": "O Cativante" — rico,
// carismático, SORRISO CONSTANTE e fala suave; da seção de Energia da Ordo (a ideia do cubo de metal). Físico definido,
// pele clara, cabelo castanho LONGO, o pano que vai da cintura ao ombro, a saia, as SANDÁLIAS, a CAPA BRANCA no ombro
// esquerdo e as cordas com lantejoulas; nas memórias revividas, a aura VERDE e os olhos verdes. Arma: um par de GARRAS,
// TRÊS em cada mão. Morreu no Baile dos Mascarados, no sacrifício do Dante no corpo dele.
// Habilidade da ficha: TRAIÇOEIRO (gasta 1 de existência para tirar 1 de outro). Fala: "Por quê? Gostou do que viu?".
// Números, nomes de golpes e o especial: PROPOSTA. Modelo próprio do Blender (public/models/remus.glb) + as garras em
// código (models/ordoWeapons.js → claws).
const GREEN = 0x4aff6a;
const STEEL = 0xd0d4dc;

export default {
  id: 'remus',
  name: 'REMUS',
  model: 'remus',
  color: '#4aff6a',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: GREEN,
  info: {
    weapon: 'As garras — três em cada mão',
    style: 'Rápido e bonito de ver: rasgos de garra em sequência, o sorriso que distrai e a facada pelas costas',
    identity: 'O Cativante: rico, sorridente, de fala mansa — e o primeiro a trair quando a coisa aperta',
    tagline: 'Por quê? Gostou do que viu?',
  },
  stats: { moveSpeed: 8.4, attackSpeed: 1.12 },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge_dual', victory: 'vic_remus', block: 'block' },
  chargeFx: { style: 'default', color: GREEN },
  dodge: { style: 'default', distance: 5.6 },

  melee: {
    name: 'Garras',
    // cada mão rasga com as três lâminas: o rastro sai em três riscos verdes
    strikes: [
      { name: 'Rasgo', anim: 'hook_r', dur: 0.24, active: [0.08, 0.14], damage: 20, range: 1.8, arc: 110, knockback: 0.6, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: GREEN, tilt: 0.1 } },
      { name: 'Contrarrasgo', anim: 'hook_l', dur: 0.24, active: [0.08, 0.14], damage: 20, range: 1.8, arc: 110, knockback: 0.6, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: GREEN, flip: true } },
      { name: 'Garras Cruzadas', anim: 'dual_cross', dur: 0.32, actives: [[0.09, 0.15], [0.18, 0.24]], damage: 16, range: 1.9, arc: 130, knockback: 0.8, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL } },
      { name: 'Joelhada Charmosa', anim: 'knee', dur: 0.3, active: [0.1, 0.18], damage: 22, range: 1.5, arc: 90, knockback: 1.4, lunge: 0.8, sound: 'swing', hitSound: 'kick' },
      { name: 'Gostou do que Viu?', anim: 'uppercut', dur: 0.5, active: [0.18, 0.28], damage: 52, range: 2.0, arc: 100, lunge: 1.3, finisher: 'launch', hitstop: 0.1, element: 'energia', bleed: { dps: 3, duration: 2 }, sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.6, trail: { color: GREEN, big: true, tilt: -1.2 } },
    ],
    up: { name: 'Garra de Baixo', anim: 'uppercut', dur: 0.4, active: [0.13, 0.24], damage: 32, range: 1.9, arc: 110, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: GREEN, tilt: -1.3 } },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.4, active: [0.14, 0.24], damage: 32, range: 1.9, arc: 130, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Bote', anim: 'dash_punch', dur: 0.38, active: [0.11, 0.21], damage: 28, range: 2.0, arc: 110, knockback: 2.0, motion: [{ t: [0, 0.2], fwd: 5.8, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: GREEN } },
    back: { name: 'Pirueta Elegante', anim: 'knife_evade', dur: 0.5, active: [0.26, 0.36], damage: 28, range: 2.0, arc: 140, knockback: 1.6, iframes: [0, 0.24], motion: [{ t: [0, 0.22], back: 3 }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Giro das Garras', anim: 'dual_spin', dur: 0.38, active: [0.1, 0.22], damage: 26, range: 2.0, arc: 200, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.8 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: GREEN, wide: true } },
    air: { name: 'Garras do Alto', anim: 'air_dual', dur: 0.4, active: [0.14, 0.3], damage: 30, range: 2.0, arc: 110, knockback: 3, slam: 15, vertical: 2.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: GREEN } },
  },

  // □: RISCOS DE ENERGIA — as três garras riscam o ar e os três riscos verdes voam
  ranged: {
    name: 'Riscos de Energia',
    type: 'projectile',
    anim: 'hook_r',
    origin: 'chest',
    windup: 0.16,
    recovery: 0.24,
    count: 3,
    interval: 0.05,
    damage: 12,
    range: 16,
    speed: 34,
    radius: 0.32,
    spread: 0.08,
    knockback: 0.5,
    hitstun: 0.22,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'inkClaw',
    color: GREEN,
    sound: 'blade',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      // TRAIÇOEIRO (a ficha): gasta a própria existência para tirar a do outro — some e aparece nas costas
      id: 'traicoeiro',
      name: 'Traiçoeiro',
      input: 'carga+physical', // △ + ○
      type: 'teleportBehind',
      description: 'Paga 5% da própria vida e aparece nas COSTAS do alvo já rasgando com as seis garras: ele fica desprevenido e sangra.',
      energyCost: 18,
      lifeCost: 0.05,
      cooldown: 10,
      distance: 1.2,
      vanishTime: 0.22,
      surpriseTime: 0.7,
      strike: { damage: 48, anim: 'dual_cross', dur: 0.34, at: 0.1, knockback: 1.6, hitstun: 0.55, element: 'energia', sound: 'bladeHit', bleed: { dps: 4, duration: 2.5 } },
      color: GREEN,
    },
    {
      // O CATIVANTE: o sorriso, a voz mansa — e o alvo baixa a guarda e vem
      id: 'cativante',
      name: 'Cativante',
      input: 'carga+dodge', // △ + L2
      type: 'mindControl',
      description: 'Sorri e fala manso: um anel verde fecha em volta do alvo (dá para esquivar) e ele vem andando até o Remus sem se defender. Apertar botões resiste.',
      energyCost: 30,
      cooldown: 18,
      windup: 0.4,
      recovery: 0.3,
      range: 9,
      arc: 60,
      duration: 2.0,
      walkTo: true,
      noBlock: true,
      struggle: 0.12,
      color: GREEN,
    },
    {
      id: 'dancaDasGarras',
      name: 'Dança das Garras',
      input: 'block+jump', // R2 + ×
      type: 'sweepStrike',
      description: 'Gira com as garras abertas, a capa branca voando: dois rasgos em volta dele, o último joga longe.',
      energyCost: 20,
      cooldown: 11,
      anim: 'dual_spin',
      startSound: 'blade',
      windup: 0.1,
      hits: 2,
      interval: 0.2,
      recovery: 0.3,
      radius: 2.8,
      damage: 54,
      color: GREEN,
    },
    {
      id: 'sorrisoConstante',
      name: 'Sorriso Constante',
      input: 'block+carga', // R2 + △
      type: 'selfBuff',
      buffType: 'charmer',
      label: 'SORRISO CONSTANTE',
      anim: 'concentrate',
      animTime: 0.3,
      description: 'Nada tira o sorriso dele: por 7 s corre 15% mais rápido, ataca 15% mais rápido e os golpes pelas costas doem mais ainda.',
      energyCost: 18,
      cooldown: 16,
      duration: 7,
      speedMult: 1.15,
      atkSpeed: 1.15,
      color: GREEN,
    },
  ],

  // POR QUÊ? GOSTOU DO QUE VIU? (PROPOSTA; a fala dele): some com um sorriso, aparece nas costas, nos lados, de novo nas
  // costas — e o último rasgo de garra com a aura verde inteira
  special: {
    name: 'Gostou do que Viu?',
    banner: 'Por quê? Gostou do que viu?',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: GREEN,
    sound: 'specialStart',
    prepare: { anim: 'concentrate', time: 0.45, fx: 'fistGlow' },
    dash: { speed: 26, maxTime: 0.45, contact: 1.7 },
    hits: [
      { t: 0.55, anim: 'hook_r', dur: 0.26, share: 0.12, fx: { kind: 'claw' }, sound: 'bladeHit', victimAnim: 'stagger' },
      { t: 0.9, anim: 'hook_l', dur: 0.26, share: 0.12, fx: { kind: 'claw', flip: true }, sound: 'bladeHit', behind: true, vanish: 0.12 },
      { t: 1.3, anim: 'dual_cross', dur: 0.32, share: 0.14, fx: { kind: 'claw' }, sound: 'bladeHit', behind: true, vanish: 0.12 },
      { t: 1.7, anim: 'dual_spin', dur: 0.34, share: 0.14, fx: { kind: 'claw', tilt: 0.4 }, sound: 'bladeHit' },
      { t: 2.3, anim: 'uppercut', dur: 0.5, share: 0.48, fx: { kind: 'claw', big: true }, sound: 'slashFinal', final: true, shout: 'Gostou?' },
    ],
    bannerAt: 0.15,
    length: 3.1,
  },

  awakening: {
    name: 'Memória Revivida',
    banner: 'O Cativante',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ability'], cdRate: 1.25, speedMult: 1.1, aura: 'flame', color: GREEN, heal: 0.1,
  },

  passives: [
    { type: 'backstab', mult: 1.3, surprised: true }, // TRAIÇOEIRO: pelas costas, ou com o alvo desprevenido, a garra entra fundo
  ],
};
