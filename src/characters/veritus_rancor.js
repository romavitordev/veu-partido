// VERITUS — O SACRIFÍCIO DO RANCOR (id: veritus_rancor) — a outra versão do Veritus (RB/LB na seleção). Wiki "Veritus"
// (apelido: "Sacrifício do Rancor"): em HEXATOMBE, o Giovanni conta dos manuscritos sobre a participação dele no ritual
// do Hexatombe — o ÚNICO SACRIFÍCIO que sobreviveu, e que ganhou o TRONO de presente por vencer o ritual. No flashback,
// o tronco exposto, o físico definido e, nas COSTAS, a grande ferida no formato do ESTIGMA do Rancor, Frustração,
// Ansiedade e Ira; a calça armadurada e os braços com FAIXAS ENSANGUENTADAS (a arte de Hexatombe: o cabelo escuro e
// bagunçado, a barba, os olhos amarelos e a aura vermelha).
// Sem arma conhecida nessa versão: luta com os punhos enfaixados (PROPOSTA). As quatro emoções do Estigma viram as
// quatro habilidades; o especial e os números também são PROPOSTA. Modelo próprio do Blender
// (public/models/veritus_rancor.glb, tools/blender/char_veritus_rancor.py; o Estigma é textura com brilho próprio).
const RED = 0xff2a1a;
const BLOOD = 0x9a0010;

export default {
  id: 'veritus_rancor',
  baseId: 'veritus',
  name: 'SACRIFÍCIO DO RANCOR',
  model: 'veritus_rancor',
  color: '#ff2a1a',
  origin: 'Ordo Calamitas',
  element: 'sangue',
  energyColor: RED,
  info: {
    weapon: 'Os punhos enfaixados e o Estigma nas costas',
    style: 'O sobrevivente do Hexatombe: socos de quem saiu vivo do ritual, e as quatro emoções do Estigma queimando nas costas',
    identity: 'Veritus no Hexatombe: o único sacrifício que sobreviveu ao ritual — e ganhou o Trono de presente',
    tagline: 'Rancor, Frustração, Ansiedade e Ira. Eu sobrevivi a todas.',
  },
  stats: { moveSpeed: 7.8, attackSpeed: 1.08 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'vic_veritus_rancor', block: 'block' },
  chargeFx: { style: 'default', color: RED },
  dodge: { style: 'default', distance: 5 },

  melee: {
    name: 'Punhos Enfaixados',
    strikes: [
      { name: 'Jab', anim: 'jab', dur: 0.26, active: [0.08, 0.15], damage: 22, range: 1.7, arc: 80, knockback: 0.8, lunge: 0.9, sound: 'punch', hitSound: 'punch' },
      { name: 'Direto', anim: 'cross', dur: 0.3, active: [0.1, 0.18], damage: 26, range: 1.8, arc: 80, knockback: 1.0, lunge: 0.9, sound: 'punch', hitSound: 'heavyPunch' },
      { name: 'Gancho', anim: 'hook_l', dur: 0.34, active: [0.12, 0.21], damage: 30, range: 1.8, arc: 110, knockback: 1.4, lunge: 0.8, sound: 'punch', hitSound: 'heavyPunch' },
      { name: 'Joelhada', anim: 'knee', dur: 0.32, active: [0.11, 0.19], damage: 28, range: 1.5, arc: 90, knockback: 1.6, lunge: 0.8, sound: 'swing', hitSound: 'kick' },
      { name: 'Sobrevivente', anim: 'heavy_punch', dur: 0.58, active: [0.26, 0.36], damage: 58, range: 2.0, arc: 90, lunge: 1.3, finisher: 'launch', hitstop: 0.12, element: 'sangue', bleed: { dps: 4, duration: 2 }, sound: 'heavyPunch', hitSound: 'heavyPunch', impactScale: 1.9 },
    ],
    up: { name: 'Uppercut', anim: 'uppercut', dur: 0.44, active: [0.15, 0.25], damage: 38, range: 1.8, arc: 100, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'punch', hitSound: 'heavyPunch' },
    down: { name: 'Pisão do Ritual', anim: 'stomp', dur: 0.48, active: [0.2, 0.3], damage: 44, range: 1.9, arc: 130, lunge: 0.6, finisher: 'knockdown', sound: 'heavyPunch', hitSound: 'heavyPunch' },
    forward: { name: 'Avanço de Ombro', anim: 'shoulder_charge', dur: 0.44, active: [0.13, 0.25], damage: 36, range: 2.0, arc: 110, knockback: 2.8, motion: [{ t: [0, 0.22], fwd: 5.2, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Passo e Cruzado', anim: 'cross', dur: 0.5, active: [0.28, 0.36], damage: 32, range: 1.9, arc: 80, knockback: 2.2, iframes: [0, 0.2], motion: [{ t: [0, 0.2], back: 2.4 }], sound: 'punch', hitSound: 'heavyPunch' },
    side: { name: 'Gancho Largo', anim: 'hook_r', dur: 0.44, active: [0.14, 0.28], damage: 32, range: 2.0, arc: 240, knockback: 1.8, motion: [{ t: [0, 0.24], side: 2.4 }], sound: 'punch', hitSound: 'heavyPunch' },
    air: { name: 'Queda do Sacrifício', anim: 'air_kick', dur: 0.44, active: [0.16, 0.32], damage: 36, range: 2.0, arc: 100, knockback: 3.2, slam: 17, vertical: 2.4, sound: 'swing', hitSound: 'heavyPunch' },
  },

  // □: SANGUE DO ESTIGMA — a ferida das costas se abre e o sangue sai em lâmina pelo braço
  ranged: {
    name: 'Sangue do Estigma',
    type: 'projectile',
    anim: 'wave_punch',
    origin: 'chest',
    windup: 0.24,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 30,
    range: 15,
    speed: 30,
    radius: 0.55,
    spread: 0,
    knockback: 1.4,
    hitstun: 0.45,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'bloodCrescent',
    color: RED,
    element: 'sangue',
    sound: 'heavyPunch',
    hitSound: 'heavyPunch',
  },

  abilities: [
    {
      // RANCOR: o soco que guarda tudo
      id: 'rancor',
      name: 'Rancor',
      input: 'carga+physical', // △ + ○
      type: 'heavyBlow',
      description: 'Junta todo o rancor num soco só: quebra a defesa, derruba e faz sangrar. Preparação longa; errar deixa ele aberto.',
      energyCost: 26,
      cooldown: 12,
      anim: 'meteor_punch',
      duration: 1.05,
      armorFrom: 0.22,
      impact: 0.64,
      step: 4.5,
      range: 2.1,
      arc: 90,
      damage: 86,
      knockback: 4.2,
      guardCrush: 60,
      bleed: { dps: 5, duration: 3 },
      element: 'sangue',
      whiffRecovery: 0.5,
      color: RED,
      ai: { when: 'opening', max: 2.3 },
    },
    {
      // ANSIEDADE: não para quieto
      id: 'ansiedade',
      name: 'Ansiedade',
      input: 'carga+dodge', // △ + L2
      type: 'selfBuff',
      buffType: 'anxiety',
      label: 'ANSIEDADE',
      anim: 'concentrate',
      animTime: 0.3,
      description: 'O Estigma acelera o coração: por 7 s corre 15% mais rápido, ataca 20% mais rápido e ganha uma esquiva.',
      energyCost: 18,
      cooldown: 16,
      duration: 7,
      speedMult: 1.15,
      atkSpeed: 1.2,
      refillDodges: 1,
      color: RED,
    },
    {
      // FRUSTRAÇÃO: o soco no chão do ritual
      id: 'frustracao',
      name: 'Frustração',
      input: 'block+jump', // R2 + ×
      type: 'stompQuake',
      description: 'Desce os dois punhos no chão do ritual: a onda de sangue derruba quem estiver em volta.',
      energyCost: 22,
      cooldown: 12,
      duration: 0.78,
      impact: 0.44,
      radius: 3.6,
      damage: 36,
      armorMax: 60,
      element: 'sangue',
      color: RED,
    },
    {
      // IRA: o Estigma queima inteiro nas costas
      id: 'ira',
      name: 'Ira',
      input: 'block+carga', // R2 + △
      type: 'selfBuff',
      buffType: 'wrath',
      label: 'IRA',
      anim: 'taunt_roar',
      animTime: 0.5,
      redAura: RED,
      meleeBleed: true,
      description: 'O Estigma acende nas costas: por 7 s os golpes físicos saem 25% mais fortes e fazem sangrar, mas ele recebe 10% a mais de dano.',
      energyCost: 26,
      cooldown: 20,
      duration: 7,
      damageMult: 1.25,
      affects: ['melee'],
      takenMult: 1.1,
      color: RED,
      ai: { when: 'winning' },
    },
  ],

  // O ÚNICO SOBREVIVENTE (PROPOSTA; o Hexatombe): o Estigma abre nas costas e o sangue sobe, os socos do ritual — as
  // quatro emoções, um soco cada — e o último, com o Trono atrás dele
  special: {
    name: 'O Único Sobrevivente',
    banner: 'Eu sobrevivi ao Hexatombe!',
    type: 'cinematicCombo',
    physical: true,
    energyCost: 50,
    cooldown: 14,
    color: RED,
    sound: 'specialStart',
    prepare: { anim: 'taunt_roar', time: 0.55, fx: 'bloodBurst' },
    dash: { speed: 22, maxTime: 0.5, contact: 1.7 },
    hits: [
      { t: 0.6, anim: 'body_blow', dur: 0.32, share: 0.12, fx: { kind: 'punch', color: BLOOD }, sound: 'heavyPunch', victimAnim: 'stagger', call: 'RANCOR' },
      { t: 1.0, anim: 'hook_l', dur: 0.32, share: 0.12, fx: { kind: 'punch' }, sound: 'heavyPunch', call: 'FRUSTRAÇÃO' },
      { t: 1.4, anim: 'hook_r', dur: 0.32, share: 0.12, fx: { kind: 'punch' }, sound: 'heavyPunch', call: 'ANSIEDADE' },
      { t: 1.8, anim: 'uppercut', dur: 0.4, share: 0.14, fx: { kind: 'punch', up: true }, sound: 'heavyPunch', call: 'IRA' },
      { t: 2.5, anim: 'meteor_punch', dur: 0.62, share: 0.5, fx: { kind: 'punch', big: true }, sound: 'heavyPunch', final: true, quake: RED, rage: true },
    ],
    bannerAt: 0.15,
    length: 3.4,
  },

  // TRANSFORMAÇÃO: o TRONO (cânone: o presente por vencer o ritual) — o sangue toma o corpo e o Estigma arde
  awakening: {
    name: 'O Presente do Trono',
    banner: 'O Trono',
    type: 'awakenMode',
    mult: 1.18, affects: ['melee', 'ranged', 'ability'], cdRate: 1.2, speedMult: 1.08, aura: 'flame', color: RED, heal: 0.12,
  },

  passives: [
    { type: 'escapeDeath' }, // O ÚNICO SOBREVIVENTE: uma vez por round um golpe fatal o deixa com 1 de vida
    { type: 'sonOfPain', after: 3, mult: 0.85 }, // o ritual ensinou: apanhando seguido, aguenta mais
  ],
};
