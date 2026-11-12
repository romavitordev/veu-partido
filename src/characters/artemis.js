// ARTEMIS (id: artemis) — Escriptas (os Marcados do Kian em Calamidade). Pedido do dono (2026-11-12): a terceira
// Escripta nova, para lutar JUNTO COM O PET — o Gambá não ataca em todo golpe, mas a acompanha, às vezes no ombro, às
// vezes andando ao lado, e os dois combatem juntos (combat/companion.js).
// Cânone (wiki "Artemis"): Artemis Deordelin Rodrigues, "Mamãe"; Especialista de SANGUE, 1,90 m; o cabelo escuro
// desgrenhado com franja, os olhos cinzentos, a língua bifurcada, o top preto, o macacão-jogger cáqui cheio de bolsos e
// alças, a corrente de placas no pescoço, os poemas tatuados dos dois lados do pescoço e nas costas e o cachorro no
// braço esquerdo. O GAMBÁ (um saruê) mora nos bolsos dela e se esconde no perigo — foi ele que a salvou. Rituais:
// Distorcer Aparência ("Transformar em Outrem": tomou o rosto da Patrizia e deixou uma casca de sangue), Enfeitiçar e
// Amaldiçoar Arma com Energia (as veias roxas no revólver). Habilidades: Afinidade com Sangue, Devorar e Mira de Elite.
// Arsenal: o Revólver Apache (soqueira + tambor + lâmina), o Rifle de Precisão e um machado enferrujado. "O homem" é a
// voz na cabeça dela. Fala: "Gostou do que a mamãe fez?"
// PROPOSTA de jogo (marcada): a sequência do Apache, os números, o "Gambá!", o especial e o despertar.
const BLOOD = 0xc01828;
const ENERGY = 0xb06aff; // as veias roxas do Amaldiçoar Arma com Energia
const KHAKI = 0x8a8a5a;

export default {
  id: 'artemis',
  name: 'ARTEMIS',
  model: 'artemis',
  color: '#8a8a5a', // o macacão cáqui
  origin: 'Escriptas',
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'O Revólver Apache, o rifle de precisão e o Gambá',
    style: 'Briga suja de perto com o Apache (soco, lâmina e tiro), rifle de longe e o Gambá mordendo junto',
    identity: 'A "Mamãe" dos Escriptas e o saruê que mora no bolso dela',
    tagline: 'Gostou do que a mamãe fez?',
  },
  stats: { moveSpeed: 7.6, attackSpeed: 1.08 },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'victory', block: 'block' },
  chargeFx: { style: 'default', color: BLOOD },
  dodge: { style: 'default', distance: 5 },
  // o companheiro: o Gambá anda com ela (combat/companion.js); a passiva companionAttack faz ele dar o bote às vezes
  companion: { kind: 'gamba', damage: 14, bleed: { dps: 3, duration: 2.5 } },

  // O APACHE (PROPOSTA): a soqueira no soco, a lâmina no corte e um tiro colado no fim
  melee: {
    name: 'Revólver Apache',
    strikes: [
      { name: 'Soqueira', anim: 'jab', dur: 0.26, active: [0.08, 0.15], damage: 20, range: 1.6, arc: 90, knockback: 0.8, lunge: 1.0, sound: 'swing', hitSound: 'punch' },
      { name: 'Corte da lâmina', anim: 'knife_1', dur: 0.28, active: [0.09, 0.16], damage: 22, range: 1.6, arc: 110, knockback: 0.9, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.0, tilt: 0.1 } },
      { name: 'Volta da lâmina', anim: 'knife_2', dur: 0.28, active: [0.09, 0.16], damage: 22, range: 1.6, arc: 110, knockback: 0.9, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.0, tilt: -0.1, flip: true } },
      { name: 'Tiro colado', anim: 'knife_final', dur: 0.44, active: [0.15, 0.25], damage: 50, range: 1.9, arc: 80, lunge: 1.6, finisher: 'launch', element: 'sangue', sound: 'shotgun', hitSound: 'heavyPunch', impactScale: 1.3, hitstop: 0.09, trail: { radius: 1.2, roll: 0.3, big: true, color: BLOOD } },
    ],
    up: { name: 'Gancho de soqueira', anim: 'slash_up', dur: 0.4, active: [0.12, 0.24], damage: 30, range: 1.7, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'punch', trail: { color: KHAKI, tilt: -1.2 } },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.42, active: [0.15, 0.25], damage: 34, range: 1.8, arc: 130, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Bote', anim: 'dash_slash', dur: 0.4, active: [0.12, 0.22], damage: 28, range: 1.8, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.2], fwd: 4.8, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: 0.1 } },
    back: { name: 'Recua e corta', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 32, range: 1.7, arc: 100, knockback: 2.6, iframes: [0, 0.22], motion: [{ t: [0, 0.15], back: 2.8 }, { t: [0.18, 0.32], fwd: 2.0, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: -0.2 } },
    side: { name: 'Corte de lado', anim: 'knife_2', dur: 0.3, active: [0.08, 0.16], damage: 22, range: 1.6, arc: 130, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, flip: true } },
    air: { name: 'Lâmina do alto', anim: 'air_knife', dur: 0.36, active: [0.12, 0.28], damage: 28, range: 1.7, arc: 110, knockback: 3, slam: 14, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 1.2 } },
  },

  // □ RIFLE DE PRECISÃO (cânone: o arsenal dela), com a mira carregada do Arthur e da Kemi — mais curta e mais fraca
  ranged: {
    name: 'Rifle de Precisão',
    type: 'projectile',
    anim: 'shoot_sniper',
    showProp: 'sniperHand',
    hideProp: 'apache',
    windup: 0.4,
    recovery: 0.45,
    count: 1,
    interval: 0,
    damage: 90,
    range: 60,
    speed: 95,
    radius: 0.3,
    spread: 0,
    knockback: 4,
    hitstun: 0.4,
    cooldown: 3.4,
    energyCost: 0,
    visual: 'sniper',
    color: 0xffe0d0,
    sound: 'sniper',
    hitSound: 'heavyPunch',
    impactScale: 1.6,
    chargeShot: { draw: 0.3, maxAim: 1.1, minDamage: 60, maxDamage: 130, recovery: 0.42, track: 5, lockWarn: 0.35 },
  },

  abilities: [
    {
      // △ + □ AMALDIÇOAR ARMA COM ENERGIA (cânone: as veias do revólver acendem em roxo)
      id: 'amaldicoarArtemis',
      name: 'Amaldiçoar Arma',
      input: 'carga+ranged',
      type: 'curseWeapon',
      description: 'As veias do Apache acendem em roxo: por 8 s os golpes saem com Energia, imprevisíveis, e às vezes dão choque.',
      energyCost: 20,
      cooldown: 18,
      duration: 8,
      element: 'energia',
      props: ['apache'],
      color: ENERGY,
    },
    {
      // R2 + △ MIRA DE ELITE (cânone)
      id: 'miraElite',
      name: 'Mira de Elite',
      input: 'block+carga',
      type: 'deathShot',
      description: 'Ajoelha, firma o rifle e mira com calma: um tiro certeiro e pesado, difícil de sair da frente.',
      energyCost: 28,
      cooldown: 15,
      windup: 0.75,
      recovery: 0.35,
      element: 'sangue',
      showProp: 'sniperHand',
      hideProp: 'apache',
      aimColor: 0xff5a5a,
      projectile: { visual: 'sniper', color: 0xffe0d0, damage: 105, range: 70, speed: 170, radius: 0.34, knockback: 4.5, hitstun: 0.5, impactScale: 1.8, hitSound: 'heavyPunch' },
    },
    {
      // △ + L2 DISTORCER APARÊNCIA (cânone: "Transformar em Outrem" — o corpo antigo vira uma casca de sangue)
      id: 'distorcerAparencia',
      name: 'Distorcer Aparência',
      input: 'carga+dodge',
      type: 'teleportBehind',
      description: 'O corpo se desfaz numa casca de sangue e ela reaparece pelas costas do alvo já cortando: ele fica desprevenido.',
      energyCost: 24,
      cooldown: 11,
      distance: 1.3,
      vanishTime: 0.26,
      vanishFx: 'blood',
      surpriseTime: 0.6,
      strike: { damage: 36, anim: 'knife_final', dur: 0.34, at: 0.1, knockback: 1.4, hitstun: 0.5, element: 'sangue', sound: 'bladeHit' },
      color: BLOOD,
    },
    {
      // △ + ○ ENFEITIÇAR (cânone): o alvo vem andando até ela, sem se defender
      id: 'enfeiticar',
      name: 'Enfeitiçar',
      input: 'carga+physical',
      type: 'mindControl',
      description: 'Fala mansa de "mamãe": um anel de sangue fecha em volta do alvo (dá para esquivar) e ele vem andando até ela sem se defender. Apertar botões resiste.',
      energyCost: 32,
      cooldown: 18,
      windup: 0.45,
      recovery: 0.3,
      range: 10,
      arc: 60,
      duration: 2.2,
      walkTo: true,
      noBlock: true,
      struggle: 0.12,
      color: BLOOD,
    },
    {
      // △ + × GAMBÁ! (PROPOSTA; o saruê é cânone): manda o Gambá morder
      id: 'gamba',
      name: 'Gambá!',
      input: 'carga+jump',
      type: 'gambaCall',
      description: 'Aponta e o Gambá salta do ombro (ou do chão) no alvo perto: morde forte, atordoa e faz sangrar. Escondido no bolso, ele não sai.',
      energyCost: 18,
      cooldown: 9,
      range: 7,
      damage: 34,
      stun: 0.5,
      bleed: { dps: 4, duration: 3 },
      ai: { max: 6 },
    },
    {
      // R2 + × QUEIMA-ROUPA (PROPOSTA; o tambor do Apache é cânone)
      id: 'queimaRoupaArtemis',
      name: 'Queima-Roupa',
      input: 'block+jump',
      type: 'pointBlank',
      description: 'Enfia a soqueira no adversário e dispara o Apache colado: só funciona de perto e joga longe.',
      energyCost: 18,
      cooldown: 9,
      range: 2.4,
      windup: 0.14,
      recovery: 0.3,
      damage: 46,
      knockback: 3.2,
      hitstun: 0.6,
      anim: 'point',
      color: 0xffe08a,
    },
  ],

  // GOSTOU DO QUE A MAMÃE FEZ? (PROPOSTA): soqueira, lâmina, o Gambá morde, e o tiro colado do Apache
  special: {
    name: 'Gostou do que a Mamãe Fez?',
    banner: 'Gostou do que a mamãe fez?',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLOOD,
    sound: 'specialStart',
    prepare: { anim: 'idle_knife', time: 0.3 },
    dash: { speed: 24, maxTime: 0.45, contact: 1.6 },
    standOff: 1.6,
    hits: [
      { t: 0.2, anim: 'jab', dur: 0.26, share: 0.14, fx: { kind: 'punch' }, sound: 'punch' },
      { t: 0.5, anim: 'knife_1', dur: 0.28, share: 0.14, fx: { kind: 'slash' }, sound: 'bladeHit' },
      { t: 0.8, anim: 'knife_2', dur: 0.28, share: 0.14, fx: { kind: 'slash', flip: true }, sound: 'bladeHit', shout: 'PEGA, GAMBÁ!' },
      { t: 1.25, anim: 'knife_final', dur: 0.5, share: 0.58, fx: { kind: 'stab', big: true }, sound: 'shotgun', final: true, shout: 'GOSTOU?' },
    ],
    bannerAt: 0.2,
    length: 2.4,
  },

  // O HOMEM (PROPOSTA; cânone: "o homem" é a voz na cabeça dela): ela para de ouvir o medo
  awakening: {
    name: 'O Homem',
    banner: 'O homem mandou.',
    type: 'awakenMode',
    mult: 1.14, affects: ['melee', 'ability', 'special'], cdRate: 1.3, regen: 2, heal: 0.1, speedMult: 1.06, aura: 'flame', color: BLOOD,
  },

  passives: [
    { type: 'elementalAffinity', element: 'sangue', mult: 1.1 }, // Afinidade com Sangue
    { type: 'bloodAffinity' }, // rituais de Sangue sem gastar o próprio sangue
    { type: 'devour', below: 0.3, ratio: 0.5 }, // Devorar (cânone)
    { type: 'companionAttack', chance: 0.3, interval: 6 }, // o Gambá dá o bote às vezes (PROPOSTA)
  ],
};
