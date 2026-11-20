// CORNELIUS (id: cornelius) — ORDO CALAMITAS (Calamidade, 67 d.C.; personagem do mestre). Wiki "Cornelius":
// extrovertido e de PAVIO CURTO, amargurado pela traição nos jogos do Amphitruo (morreu pelas mãos do Marius na Sala da
// Morte). Meia-idade, pele clara, BIGODE castanho, a armadura medieval e o ELMO COM CRISTA; nas memórias revividas, a
// aura AZUL. Arma: a LANÇA e o ESCUDO.
// Habilidades da ficha: FÚRIA (com 1 de existência, ataca 2 vezes de uma vez) e DE FERRO (a maior defesa de todos). Fala:
// "Você não me responde! Você sabe que eu tenho pavio curto.". Números, nomes de golpes e o especial: PROPOSTA. Modelo
// próprio do Blender (public/models/cornelius.glb; o elmo de crista no modelo) + a lança e o escudo em código
// (models/ordoWeapons.js → spear, corneliusShield).
const BLUE = 0x5a8cff;
const STEEL = 0xc4c8d0;

export default {
  id: 'cornelius',
  name: 'CORNELIUS',
  model: 'cornelius',
  color: '#5a8cff',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: BLUE,
  info: {
    weapon: 'A lança e o escudo',
    style: 'A muralha de pavio curto: a lança mantém longe, o escudo segura tudo — e quando a vida acaba, a fúria dobra os golpes',
    identity: 'O guerreiro De Ferro da Ordo Calamitas: a maior defesa de todos e nenhuma paciência',
    tagline: 'Você não me responde! Você sabe que eu tenho pavio curto.',
  },
  stats: { moveSpeed: 7.0, attackSpeed: 0.98 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge', victory: 'vic_cornelius', block: 'block_heavy' },
  chargeFx: { style: 'default', color: BLUE },
  dodge: { style: 'default', distance: 4.4 },

  melee: {
    name: 'Lança e Escudo',
    // a lança alcança longe (as estocadas), o escudo bate de perto
    strikes: [
      { name: 'Estocada', anim: 'thrust', dur: 0.32, active: [0.11, 0.19], damage: 26, range: 2.8, arc: 40, knockback: 1.0, lunge: 0.8, sound: 'swing', hitSound: 'bladeHit' },
      { name: 'Estocada Dupla', anim: 'ver_thrust', dur: 0.38, active: [0.14, 0.22], damage: 28, range: 2.9, arc: 40, knockback: 1.2, lunge: 0.9, sound: 'swing', hitSound: 'bladeHit' },
      { name: 'Escudada', anim: 'shoulder_bash', dur: 0.36, active: [0.12, 0.22], damage: 30, range: 1.7, arc: 100, knockback: 2.2, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Haste Varrida', anim: 'slash_h', dur: 0.4, active: [0.14, 0.24], damage: 30, range: 2.6, arc: 160, knockback: 1.6, lunge: 0.6, sound: 'swing', hitSound: 'heavyPunch', trail: { color: STEEL, wide: true } },
      { name: 'Pavio Curto', anim: 'arn_lunge', dur: 0.62, active: [0.28, 0.4], damage: 60, range: 3.2, arc: 40, lunge: 1.6, finisher: 'launch', hitstop: 0.12, element: 'energia', sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.8, trail: { color: BLUE, big: true } },
    ],
    up: { name: 'Lança para Cima', anim: 'slash_up', dur: 0.46, active: [0.16, 0.28], damage: 38, range: 2.6, arc: 100, lunge: 0.7, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Escudo no Chão', anim: 'stomp', dur: 0.5, active: [0.2, 0.3], damage: 44, range: 1.9, arc: 140, lunge: 0.6, finisher: 'knockdown', sound: 'heavyPunch', hitSound: 'heavyPunch' },
    forward: { name: 'Investida de Escudo', anim: 'shoulder_charge', dur: 0.46, active: [0.13, 0.27], damage: 36, range: 2.0, arc: 110, knockback: 3, motion: [{ t: [0, 0.24], fwd: 5, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recuo de Lança', anim: 'thrust', dur: 0.54, active: [0.3, 0.4], damage: 32, range: 3.0, arc: 40, knockback: 2.2, iframes: [0, 0.2], motion: [{ t: [0, 0.2], back: 2.6 }], sound: 'swing', hitSound: 'bladeHit' },
    side: { name: 'Roda da Lança', anim: 'slash_h', dur: 0.5, active: [0.15, 0.32], damage: 32, range: 2.8, arc: 300, knockback: 1.8, motion: [{ t: [0, 0.25], side: 2 }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: STEEL, wide: true } },
    air: { name: 'Lança do Alto', anim: 'air_slash', dur: 0.46, active: [0.16, 0.32], damage: 36, range: 2.6, arc: 80, knockback: 3, slam: 16, vertical: 2.4, sound: 'swing', hitSound: 'bladeHit' },
  },

  // □: LANÇA ARREMESSADA — a lança voa e volta para a mão
  ranged: {
    name: 'Lança Arremessada',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'hand',
    hideProp: 'spear',
    windup: 0.3,
    recovery: 0.34,
    count: 1,
    interval: 0,
    damage: 38,
    range: 20,
    speed: 34,
    radius: 0.4,
    spread: 0,
    knockback: 1.8,
    hitstun: 0.5,
    cooldown: 3,
    energyCost: 0,
    visual: 'pilum',
    color: BLUE,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      id: 'lancaFurada',
      name: 'Lança Certeira',
      input: 'carga+physical', // △ + ○
      type: 'heavyBlow',
      description: 'Recua a lança e crava com o corpo todo: alcance longo, quebra a defesa e derruba. Preparação longa; errar deixa ele aberto.',
      energyCost: 26,
      cooldown: 12,
      anim: 'arn_lunge',
      duration: 1.05,
      armorFrom: 0.25,
      impact: 0.62,
      step: 5.5,
      range: 3.2,
      arc: 40,
      damage: 84,
      knockback: 4,
      guardCrush: 60,
      whiffRecovery: 0.5,
      color: BLUE,
      ai: { when: 'opening', max: 3.2 },
    },
    {
      // DE FERRO (a ficha: a maior defesa de todos)
      id: 'deFerro',
      name: 'De Ferro',
      input: 'carga+dodge', // △ + L2
      type: 'heavyProtection',
      label: 'DE FERRO',
      description: 'Fecha atrás do escudo: por 7 s recebe 40% menos dano e aguenta 3 golpes sem recuar, um pouco mais lento.',
      energyCost: 24,
      cooldown: 20,
      duration: 7,
      takenMult: 0.6,
      armor: 3,
      speedMult: 0.9,
      ai: { when: 'hurt' },
    },
    {
      id: 'muralha',
      name: 'Muralha de Escudo',
      input: 'block+jump', // R2 + ×
      type: 'dashStrike',
      description: 'Avança atrás do escudo e passa por cima: quebra a defesa e joga longe.',
      energyCost: 20,
      cooldown: 10,
      anim: 'shoulder_charge',
      windup: 0.26,
      distance: 6,
      speed: 20,
      recovery: 0.38,
      range: 2.2,
      damage: 50,
      knockback: 4,
      guardBreak: true,
      hitSound: 'heavyPunch',
      color: BLUE,
    },
    {
      // PAVIO CURTO: o grito e o pisão do escudo
      id: 'pavioCurto',
      name: 'Pavio Curto',
      input: 'block+carga', // R2 + △
      type: 'stompQuake',
      description: 'Explode: bate o escudo no chão gritando e a onda derruba quem estiver em volta.',
      energyCost: 20,
      cooldown: 12,
      duration: 0.75,
      impact: 0.42,
      radius: 3.4,
      damage: 32,
      armorMax: 60,
      color: BLUE,
    },
  ],

  // VOCÊ NÃO ME RESPONDE! (PROPOSTA; a fala dele): o pavio acaba — escudo na cara, três estocadas, e a lança atravessa
  special: {
    name: 'Pavio Curto',
    banner: 'Você não me responde! Você sabe que eu tenho pavio curto.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLUE,
    sound: 'specialStart',
    prepare: { anim: 'taunt_roar', time: 0.55, fx: 'stomp' },
    dash: { speed: 20, maxTime: 0.55, contact: 2.0 },
    hits: [
      { t: 0.6, anim: 'shoulder_bash', dur: 0.36, share: 0.14, fx: { kind: 'smash' }, sound: 'heavyPunch', victimAnim: 'stagger', shout: 'RESPONDE!' },
      { t: 1.05, anim: 'thrust', dur: 0.3, share: 0.12, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.4, anim: 'ver_thrust', dur: 0.32, share: 0.12, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.75, anim: 'thrust', dur: 0.3, share: 0.12, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 2.4, anim: 'arn_lunge', dur: 0.62, share: 0.5, fx: { kind: 'stab', big: true }, sound: 'slashFinal', final: true, quake: true },
    ],
    bannerAt: 0.15,
    length: 3.3,
  },

  awakening: {
    name: 'Memória Revivida',
    banner: 'De Ferro',
    type: 'awakenMode',
    mult: 1.12, affects: ['melee', 'ability'], cdRate: 1.15, speedMult: 1.05, aura: 'flame', color: BLUE, heal: 0.14,
  },

  passives: [
    { type: 'resistant', mult: 0.88, kinds: ['melee', 'ranged'] }, // DE FERRO: a maior defesa de todos
    // FÚRIA (a ficha: com 1 de existência, ataca 2 de uma vez): com a vida no fim, a fúria — mais dano e velocidade
    { type: 'revenge', below: 0.2, label: 'FÚRIA', mult: 1.45, speedMult: 1.15, duration: 8 },
  ],
};
