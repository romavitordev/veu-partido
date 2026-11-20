// ZÉFERO (id: zefero) — VAMPIROS (Hexatombe). Pedido do dono (2026-11-19): "faça os membros que faltam dos vampiros".
// Cânone (wiki "Zéfero"): o "espécime" do Velisar — um jovem assistente de tenista de Praga capturado em 1987, os olhos
// arrancados, a mandíbula alargada, os dentes raspados, "treinado" até esquecer a humanidade. O vampiro mais novo,
// Combatente da trilha Monstruosa, afinidade com Sangue. 1,70 m, pele clara suja de sangue da cabeça aos pés, um pouco de
// cabelo no alto da cabeça, o rosto arranhado e cortado, orelhas pontudas, boca enorme de dentes afiados; camisa branca
// de manga curta com babados na gola e nas mangas, calça azul-escura puxada até os joelhos, faixas pretas nos braços e
// nas pernas, descalço; o GRILHÃO de espinhos no pescoço com a CORRENTE que o Velisar segura. Não fala, só rosna;
// bestial, sempre atrás de comida. Finalizou o Papagaio e matou o Alê, devorando o corpo; solto na Igreja, partiu para o
// Juan. 70 PV na ficha (o mais frágil da equipe).
// PROPOSTA de jogo (marcada): os números, o Bote no □, o Rosnado, o especial Espécime e o despertar Sem Coleira.
const BLOOD = 0xa01018;
const CRIMSON = 0xd01c30;
const SHIRT = 0xd8cbb4;

export default {
  id: 'zefero',
  name: 'ZÉFERO',
  model: 'zefero',
  color: '#8a2a24', // a camisa encharcada de sangue
  origin: 'Vampiros',
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'Garras e dentes (e a corrente no pescoço)',
    style: 'A fera solta: rápida, sempre em cima, morde e devora quem está caindo — mas aguenta pouco',
    identity: 'O espécime do Velisar, o vampiro mais novo',
    tagline: 'Grrrr...',
  },
  stats: { moveSpeed: 9.4, attackSpeed: 1.18 },
  anims: { idle: 'idle_zefero', run: 'run', charge: 'db_charge', victory: 'vic_zefero', block: 'db_block' },
  chargeFx: { style: 'default', color: BLOOD },
  dodge: { style: 'default', distance: 5.6 },

  // GARRAS E DENTES: golpes curtos e rápidos, a fera em cima da presa
  melee: {
    name: 'Garras e Dentes',
    strikes: [
      { name: 'Unhada', anim: 'db_claw_r', dur: 0.24, active: [0.07, 0.13], damage: 20, range: 1.9, arc: 120, knockback: 0.6, lunge: 1.3, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON, tilt: 0.1 } },
      { name: 'Unhada de volta', anim: 'db_claw_l', dur: 0.24, active: [0.07, 0.13], damage: 20, range: 1.9, arc: 120, knockback: 0.6, lunge: 1.2, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON, flip: true } },
      { name: 'Frenesi', anim: 'db_cross', dur: 0.36, actives: [[0.1, 0.16], [0.2, 0.26]], damage: 26, range: 1.9, arc: 130, knockback: 0.9, lunge: 1.1, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
      { name: 'Dentada', anim: 'raziel_bite', dur: 0.46, active: [0.16, 0.28], damage: 48, range: 1.9, arc: 100, lunge: 1.6, finisher: 'launch', bleed: { dps: 5, duration: 2 }, sound: 'slashFinal', hitSound: 'clawHit', trail: { color: BLOOD, big: true } },
    ],
    up: { name: 'Pulo da fera', anim: 'db_up', dur: 0.38, active: [0.12, 0.22], damage: 34, range: 1.9, arc: 120, lunge: 1.0, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON, tilt: -0.6 } },
    down: { name: 'Prender no chão', anim: 'db_down', dur: 0.46, active: [0.2, 0.3], damage: 40, range: 1.9, arc: 140, lunge: 1.0, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.2 },
    forward: { name: 'Avança de quatro', anim: 'db_dash', dur: 0.38, active: [0.11, 0.22], damage: 30, range: 2.0, arc: 110, knockback: 1.6, motion: [{ t: [0, 0.22], fwd: 8.0, stopClose: true }], sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
    back: { name: 'Pulo para trás', anim: 'db_cross', dur: 0.44, actives: [[0.22, 0.28], [0.32, 0.38]], damage: 26, range: 1.9, arc: 120, knockback: 1.4, iframes: [0, 0.2], motion: [{ t: [0, 0.14], back: 3.0 }, { t: [0.18, 0.3], fwd: 3.0, stopClose: true }], sound: 'blade', hitSound: 'clawHit' },
    side: { name: 'Rodeia a presa', anim: 'db_claw_l', dur: 0.3, active: [0.09, 0.17], damage: 26, range: 1.9, arc: 150, knockback: 1.2, motion: [{ t: [0, 0.2], side: 3.2 }], sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
    air: { name: 'Cai em cima', anim: 'db_air', dur: 0.42, active: [0.13, 0.28], damage: 34, range: 1.9, arc: 120, knockback: 2.6, slam: 16, vertical: 2.4, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
  },

  // □ O BOTE (PROPOSTA; cânone: não tem arma nem fala — ataca como bicho): salta longe sobre a presa
  ranged: {
    name: 'Bote',
    type: 'dashStrike',
    description: 'Salta como um bicho sobre o adversário: avança 9 m numa linha e, se alcança, rasga com as duas garras (faz sangrar).',
    anim: 'raziel_pounce',
    windup: 0.16,
    distance: 9,
    speed: 32,
    recovery: 0.3,
    range: 1.6,
    aiRange: 9,
    damage: 26,
    knockback: 1.8,
    hitstun: 0.45,
    xSlash: true,
    bleed: { dps: 3, duration: 1.5 },
    cooldown: 2.4,
    energyCost: 0,
    color: CRIMSON,
    trailKind: 'smoke',
    element: 'sangue',
    startSound: 'blink',
    hitSound: 'clawHit',
  },

  abilities: [
    {
      // △ + □ MORDIDA FAMINTA (cânone: devorou o Alê e a carne do Giovanni)
      id: 'mordidaFaminta',
      name: 'Mordida Faminta',
      input: 'carga+ranged',
      type: 'vampireBite',
      description: 'Pula no pescoço do adversário e morde duas vezes: tira vida, faz sangrar e CURA o Zéfero. Contra quem está morrendo (menos de 30% de vida) vai mais longe e bebe tudo.',
      energyCost: 20,
      cooldown: 8,
      duration: 0.9,
      step: 10,
      range: 1.7,
      hold: 0.9,
      damage: 26,
      drain: 0.7,
      bleed: { dps: 4, duration: 2.5 },
      thirst: { below: 0.3, mult: 1.3, reach: 1.2, drain: 1, stepMult: 1.5 },
      color: BLOOD,
    },
    {
      // △ + ○ ROSNADO (PROPOSTA; cânone: não fala, só rosna)
      id: 'rosnado',
      name: 'Rosnado',
      input: 'carga+physical',
      type: 'command',
      description: 'Rosna na cara do adversário com a boca escancarada: quem está perto fica parado de medo por um instante.',
      energyCost: 20,
      cooldown: 12,
      windup: 0.3,
      range: 5,
      orders: ['GRRRRAAH!'],
      stun: 0.9,
      damage: 10,
      element: 'sangue',
      color: CRIMSON,
    },
    {
      // R2 + △ SOLTO DA CORRENTE (cânone: na Igreja, Velisar o solta e ele parte para cima do Juan)
      id: 'soltoCorrente',
      name: 'Solto da Corrente',
      input: 'block+carga',
      type: 'selfBuff',
      buffType: 'zeferoLoose',
      label: 'SOLTO DA CORRENTE',
      anim: 'vic_zefero',
      animTime: 0.6,
      description: 'Arrebenta a corrente do grilhão: por 7 s corre e ataca mais rápido e bate mais forte, mas apanha um pouco mais.',
      energyCost: 24,
      cooldown: 18,
      duration: 7,
      speedMult: 1.15,
      atkSpeed: 1.15,
      damageMult: 1.15,
      affects: ['melee', 'ability'],
      takenMult: 1.1,
      sound: 'fearGaze',
      color: CRIMSON,
    },
    {
      // △ + L2 FARO DE SANGUE (cânone: está sempre atrás de comida; caçou a Harpia com o Velisar)
      id: 'faroSangue',
      name: 'Faro de Sangue',
      input: 'carga+dodge',
      type: 'predatorScent',
      description: 'Fareja o sangue do adversário: por 8 s segue o rastro dele, anda mais rápido e todo ataque contra ele fica mais forte.',
      energyCost: 18,
      cooldown: 18,
      duration: 8,
      damageMult: 1.15,
      speedMult: 1.08,
      color: BLOOD,
    },
  ],

  // ESPÉCIME (PROPOSTA; base: a morte do Alê — pula, derruba, rasga e devora — e a frase do Velisar sobre ele): o bote,
  // o frenesi de garras, a mordida que bebe e a dentada que arranca
  special: {
    name: 'Espécime',
    banner: 'Ele era como a brisa grega do mundo antigo.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLOOD,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'idle_zefero', time: 0.4 },
    dash: { speed: 26, maxTime: 0.45, contact: 1.7 },
    hits: [
      { t: 0.45, anim: 'db_claw_r', dur: 0.22, share: 0.08, fx: { kind: 'cross', color: CRIMSON }, sound: 'clawHit', shout: 'GRRRAAH!' },
      { t: 0.7, anim: 'db_claw_l', dur: 0.22, share: 0.08, fx: { kind: 'cross', color: CRIMSON }, sound: 'clawHit' },
      { t: 0.95, anim: 'db_claw_r', dur: 0.22, share: 0.08, fx: { kind: 'cross', color: CRIMSON }, sound: 'clawHit' },
      { t: 1.2, anim: 'db_cross', dur: 0.36, share: 0.1, fx: { kind: 'cross', color: BLOOD }, sound: 'clawHit', bleed: { dps: 4, duration: 2 } },
      { t: 1.7, anim: 'raziel_feast', dur: 0.6, share: 0.2, fx: { kind: 'punch', color: BLOOD }, sound: 'clawHit', victimAnim: 'stun', drain: 0.8, gore: true, stream: true },
      { t: 2.5, anim: 'raziel_bite', dur: 0.5, share: 0.46, fx: { kind: 'cross', big: true, color: BLOOD, color2: CRIMSON }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.2,
    length: 3.3,
  },

  // SEM COLEIRA (PROPOSTA; cânone: só o Velisar o domava pela corrente — sem ela, a fera não tem freio)
  awakening: {
    name: 'Sem Coleira',
    banner: 'GRRRRRAAAH!',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ability', 'special'], cdRate: 1.3, regen: 2.5, heal: 0.1, speedMult: 1.15, aura: 'flame', color: CRIMSON,
  },

  passives: [
    { type: 'elementalAffinity', element: 'sangue', mult: 1.1, resist: 0.85 },
    { type: 'lifesteal', ratio: 0.06 }, // a fome
    { type: 'devour', below: 0.3, ratio: 0.5 }, // devora quem está morrendo (o Alê, o invólucro do Giovanni)
  ],
};
