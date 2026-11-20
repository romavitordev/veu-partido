// FAUSTUS (id: faustus) — ORDO CALAMITAS (Calamidade, 67 d.C.; intérprete: Calango). Wiki "Faustus": "O General" —
// ex-general do exército, aprendiz do imperador Nero, devoto de JÚPITER. Homem negro, cabelo crespo castanho, cicatrizes
// no rosto, armadura cinza e o GRANDE ELMO de gladiador; nas memórias revividas, a aura ROSA com partes AZUIS e os olhos
// azuis. Arma: o GLADIUS (a espada curta) com o COLAR DE CRUZ enrolado. Trai para sobreviver nos jogos do Amphitruo e se
// arrepende no fim (inexistiu rezando a Júpiter).
// Habilidades da ficha: ARRISCAR TUDO (tira o capacete e dá a outro: −5 de defesa e dano dobrado para ele), GLADIADOR (+1
// dado contra um adversário só) e TIRAR CAPACETE (−5 de defesa, +1 dado social). Fala: "Que Júpiter me perdoe, mas eu te
// vejo no inferno!". Números, nomes de golpes e o especial: PROPOSTA.
// Modelo próprio do Blender (public/models/faustus.glb, tools/blender/char_faustus.py; o elmo é a peça prop_helmet) +
// o gládio e a aura em código (models/ordoWeapons.js → gladius).
const PINK = 0xff5ab4;
const BLUE = 0x5aa0ff;
const STEEL = 0xc4c8d0;

export default {
  id: 'faustus',
  name: 'FAUSTUS',
  model: 'faustus',
  color: '#ff5ab4',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: PINK,
  info: {
    weapon: 'O gládio com o colar de cruz enrolado',
    style: 'O general na arena: estocadas curtas e certeiras, o escudo do corpo e o capacete que ele tira quando resolve arriscar tudo',
    identity: 'O General: ex-general de Roma, aprendiz de Nero e devoto de Júpiter — trai para sobreviver e reza depois',
    tagline: 'Que Júpiter me perdoe, mas eu te vejo no inferno!',
  },
  stats: { moveSpeed: 7.6, attackSpeed: 1.02 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge', victory: 'vic_faustus', block: 'block_weapon' },
  chargeFx: { style: 'default', color: PINK },
  dodge: { style: 'default' },

  melee: {
    name: 'Gládio do General',
    // o gládio é arma de estocada: o combo alterna cortes curtos e as pontas (a escola do legionário)
    strikes: [
      { name: 'Corte Curto', anim: 'slash_h', dur: 0.3, active: [0.1, 0.18], damage: 28, range: 1.9, arc: 110, knockback: 1.0, lunge: 0.9, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, tilt: 0.05 } },
      { name: 'Estocada do Legionário', anim: 'thrust', dur: 0.32, active: [0.11, 0.19], damage: 30, range: 2.2, arc: 50, knockback: 1.2, lunge: 1.1, sound: 'swing', hitSound: 'bladeHit' },
      { name: 'Revés', anim: 'slash_h_back', dur: 0.3, active: [0.1, 0.18], damage: 28, range: 1.9, arc: 110, knockback: 1.0, lunge: 0.8, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, flip: true } },
      { name: 'Cotovelada de Arena', anim: 'onearm_elbow', dur: 0.34, active: [0.12, 0.2], damage: 26, range: 1.6, arc: 90, knockback: 1.8, lunge: 0.7, sound: 'punch', hitSound: 'heavyPunch' },
      { name: 'Ordem do General', anim: 'ver_thrust', dur: 0.6, active: [0.28, 0.4], damage: 60, range: 2.6, arc: 60, lunge: 1.4, finisher: 'launch', hitstop: 0.12, element: 'energia', sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.8, trail: { color: PINK, big: true } },
    ],
    up: { name: 'Gládio para Cima', anim: 'slash_up', dur: 0.44, active: [0.15, 0.27], damage: 38, range: 2.0, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Golpe de Misericórdia', anim: 'slash_v', dur: 0.5, active: [0.2, 0.3], damage: 46, range: 2.0, arc: 100, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactScale: 1.4, trail: { color: STEEL, roll: 1.5 } },
    forward: { name: 'Avanço da Legião', anim: 'dash_slash', dur: 0.42, active: [0.13, 0.24], damage: 36, range: 2.2, arc: 110, knockback: 2.4, motion: [{ t: [0, 0.22], fwd: 4.8, stopClose: true }], sound: 'swing', hitSound: 'blade', trail: { color: STEEL, tilt: 0.1 } },
    back: { name: 'Recuo do Veterano', anim: 'thrust', dur: 0.54, active: [0.3, 0.4], damage: 34, range: 2.4, arc: 60, knockback: 2.2, iframes: [0, 0.22], motion: [{ t: [0, 0.2], back: 2.6 }], sound: 'swing', hitSound: 'bladeHit' },
    side: { name: 'Giro do Gladiador', anim: 'slash_h', dur: 0.46, active: [0.13, 0.3], damage: 32, range: 2.2, arc: 280, knockback: 1.6, motion: [{ t: [0, 0.25], side: 2.3 }], sound: 'swing', hitSound: 'blade', trail: { color: STEEL, wide: true } },
    air: { name: 'Gládio do Alto', anim: 'air_slash', dur: 0.44, active: [0.16, 0.32], damage: 36, range: 2.1, arc: 100, knockback: 3, slam: 16, vertical: 2.4, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, roll: 1.5 } },
  },

  // □: CORTE DE JÚPITER — a aura rosa sai do gládio num corte que voa (o raio do deus dele)
  ranged: {
    name: 'Corte de Júpiter',
    type: 'projectile',
    anim: 'slash_h',
    origin: 'chest',
    windup: 0.22,
    recovery: 0.28,
    count: 1,
    interval: 0,
    damage: 30,
    range: 16,
    speed: 30,
    radius: 0.6,
    spread: 0,
    knockback: 1.4,
    hitstun: 0.45,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'shockwave',
    color: PINK,
    sound: 'swing',
    hitSound: 'blade',
  },

  abilities: [
    {
      // o GLÁDIO com o colar de cruz (o Gladiador agora é passiva: ver `gladiator`)
      id: 'gladioGeneral',
      name: 'Gládio do General',
      input: 'carga+physical', // △ + ○
      type: 'heavyBlow',
      description: 'Crava o gládio: uma estocada pesada que quebra a defesa e derruba. Preparação longa; errar deixa ele aberto.',
      energyCost: 28,
      cooldown: 12,
      anim: 'ver_thrust',
      duration: 1.05,
      armorFrom: 0.25,
      impact: 0.62,
      step: 5,
      range: 2.5,
      arc: 60,
      damage: 84,
      knockback: 4,
      guardCrush: 60,
      whiffRecovery: 0.5,
      color: PINK,
      ai: { when: 'opening', max: 2.6 },
    },
    {
      // TIRAR CAPACETE (a ficha: −5 de defesa, +1 dado social): o elmo vai para o chão até o fim do round
      id: 'tirarCapacete',
      name: 'Tirar Capacete',
      input: 'carga+dodge', // △ + L2
      type: 'helmetOff',
      description: 'Tira o grande elmo de gladiador ATÉ O FIM DO ROUND: recebe 12% a mais de dano (−5 de defesa), mas a sanidade volta 80% mais rápido (o dado social: o público do gladiador) e ganha 20 na hora.',
      energyCost: 0,
      cooldown: 6,
      takenMult: 1.12,
      regen: 1.8,
      energy: 20,
      color: PINK,
      ai: { when: 'far', min: 6 },
    },
    {
      id: 'cargaLegiao',
      name: 'Carga da Legião',
      input: 'block+jump', // R2 + ×
      type: 'dashStrike',
      description: 'Abaixa o ombro e entra com o gládio na frente, como a parede de escudos — quebra a defesa e empurra longe.',
      energyCost: 20,
      cooldown: 10,
      anim: 'dash_slash',
      windup: 0.26,
      distance: 6,
      speed: 22,
      recovery: 0.34,
      range: 2.2,
      damage: 50,
      knockback: 3.4,
      guardBreak: true,
      hitSound: 'bladeHit',
      color: PINK,
    },
    {
      // ARRISCAR TUDO (a ficha: dá o capacete a outro — +1 ponto de existência para ele —, −5 de defesa e dano dobrado)
      id: 'arriscarTudo',
      name: 'Arriscar Tudo',
      input: 'block+carga', // R2 + △
      type: 'riskAll',
      description: 'Dá o capacete: +1 PONTO DE EXISTÊNCIA (na equipe vai para as assistências, que voltam na hora; sozinho, para ele). Por 6 s causa 40% a mais, mas recebe o DOBRO de dano.',
      energyCost: 30,
      cooldown: 24,
      duration: 6,
      damageMult: 1.4,
      takenMult: 2.0,
      teamGauge: 20,
      color: PINK,
      ai: { when: 'opening' },
    },
  ],
  // QUE JÚPITER ME PERDOE (o devoto de Júpiter, que inexistiu rezando; a fala "te vejo no inferno"): ajoelha e reza com o
  // colar de cruz; três raios de Júpiter caem marcados onde o adversário estava (dá para fugir) e ele levanta com o
  // gládio
  special: {
    name: 'Que Júpiter me Perdoe',
    banner: 'Que Júpiter me perdoe...',
    type: 'jupiterPrayer',
    energyCost: 50,
    cooldown: 14,
    range: 16,
    bolts: 3,
    boltDamage: 70,
    boltRadius: 1.4,
    lungeRange: 12,
    finalDamage: 110,
    damage: 250,
    color: 0xbfe0ff,
    gladiusColor: PINK,
    sound: 'specialStart',
  },
  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): a MEMÓRIA REVIVIDA — a aura rosa com as partes azuis toma o
  // corpo e os olhos acendem em azul (Calamidade ep. 5)
  awakening: {
    name: 'Memória Revivida',
    banner: 'O General',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ability'], cdRate: 1.2, speedMult: 1.06, aura: 'flame', color: PINK, heal: 0.1,
  },

  passives: [
    { type: 'gladiator', mult: 1.12 }, // GLADIADOR (a ficha: +1 dado contra um adversário só): sem assistência nem invocação do outro lado, bate 12% mais
  ],
};
