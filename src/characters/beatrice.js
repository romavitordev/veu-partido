// BEATRICE PORTINARI (id: beatrice) — Ordo Realitas (FORÇA D, Desconjuração). Pedido de 2026-11-02: completar as
// equipes que já existem; a Beatrice é a recruta da Força D (com Arthur, Kaiser, Joui, Dante, Erin, Fernando e
// Elizabeth).
// Wiki "Beatrice Portinari": florista de 23 anos, 1,69 m, sardas, cabelo castanho; gentil, altruísta, curiosa com o
// desconhecido. Nome original LILIAN GALEN; Dante é o "irmão" do orfanato e o Arnaldo, o "avô".
// Aptidões (cânone): BALESTRA (treinou com o Tristan; "naturalmente silenciada", vantagem em combate furtivo) e
// Floricultura. Arsenal: a balestra com DOIS LEDs nas extremidades, o CANIVETE (guardado embaixo da asa do Orpheu) e as
// foices de jardinagem (nunca usadas). Mania superada: VÍCIO EM ADRENALINA (joga uma moeda e o resultado decide quem
// ela ataca). Fobia: ser amarrada. O URUTAU ORPHEU, sempre com ela — a morte dele devolve as memórias e ela vira a
// EXISTIDA (forms/beatrice_existida.js). Fala do cânone: "Saber tudo é perder tudo."
// Pedido do dono (2026-11-02): o ORPHEU luta com ela — voa e ataca o inimigo.
// PROPOSTA de jogo (marcada): as sequências do canivete, o Clarão dos LEDs, o especial e os números.
const BROWN = 0x8a7458; // as penas do Orpheu
const LED = 0xf4f0d8;
const GOLD = 0xf2c230;
const ORPHEU = 'orpheu+orpheuEye1+orpheuEye-1+orpheuPupil1+orpheuPupil-1+orpheuBeak+orpheuFeet';

export default {
  id: 'beatrice',
  name: 'BEATRICE PORTINARI',
  model: 'beatrice',
  color: '#c8a070', // o urutau e o colar dourado
  origin: 'Ordo Realitas', // Força D
  element: 'conhecimento', // as memórias, os textos da Existida e o Pingente da Lua Dourada
  energyColor: GOLD,
  info: {
    weapon: 'A balestra dos LEDs, o canivete e o urutau Orpheu',
    style: 'Atiradora de balestra: virotes silenciosos de longe, o canivete de perto e o Orpheu voando no rosto do adversário',
    identity: 'A florista recruta da Força D, a Menina do Pássaro',
    tagline: 'Saber tudo é perder tudo.',
  },
  stats: { moveSpeed: 8.3, attackSpeed: 1.1 },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'default', color: GOLD },
  dodge: { style: 'default', distance: 5.2 },

  // o CANIVETE: cortes curtos e rápidos (ela não é lutadora de perto: menos dano que a Aghata)
  melee: {
    name: 'Canivete',
    strikes: [
      { name: 'Corte curto', anim: 'knife_1', dur: 0.28, active: [0.09, 0.16], damage: 21, range: 1.5, arc: 110, knockback: 1.0, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.0, tilt: 0.1 } },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.28, active: [0.09, 0.16], damage: 21, range: 1.5, arc: 110, knockback: 1.0, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.0, tilt: -0.1, flip: true } },
      { name: 'Chute', anim: 'kick_front', dur: 0.32, active: [0.1, 0.19], damage: 24, range: 1.8, arc: 90, knockback: 1.4, lunge: 1.0, sound: 'swing', hitSound: 'kick' },
      { name: 'Estocada do canivete', anim: 'knife_final', dur: 0.44, active: [0.15, 0.26], damage: 48, range: 1.8, arc: 80, lunge: 2.0, finisher: 'launch', sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 0.3, big: true } },
    ],
    up: { name: 'Corte para cima', anim: 'slash_up', dur: 0.4, active: [0.12, 0.24], damage: 32, range: 1.7, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: LED, tilt: -1.2 } },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.42, active: [0.15, 0.25], damage: 36, range: 1.8, arc: 130, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Avanço', anim: 'dash_slash', dur: 0.4, active: [0.12, 0.22], damage: 30, range: 1.8, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.2], fwd: 4.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: 0.1 } },
    // recua (a atiradora quer distância) e corta na volta
    back: { name: 'Recua e corta', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 34, range: 1.7, arc: 100, knockback: 2.6, iframes: [0, 0.2], motion: [{ t: [0, 0.15], back: 2.6 }, { t: [0.18, 0.32], fwd: 2.2, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: -0.2 } },
    side: { name: 'Corte de lado', anim: 'knife_2', dur: 0.3, active: [0.08, 0.16], damage: 24, range: 1.6, arc: 130, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, flip: true } },
    air: { name: 'Corte aéreo', anim: 'air_knife', dur: 0.36, active: [0.12, 0.28], damage: 30, range: 1.7, arc: 110, knockback: 3, slam: 14, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 1.2 } },
  },

  // □ BALESTRA (cânone: ótima balesteira; arma "naturalmente silenciada"): um virote certeiro, sem barulho
  ranged: {
    name: 'Balestra',
    description: 'Ergue a balestra dos LEDs e dispara um virote silencioso, rápido e forte.',
    type: 'projectile',
    anim: 'point',
    showProp: 'crossbow',
    hideProp: 'knife',
    windup: 0.16,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 32,
    range: 34,
    speed: 70,
    radius: 0.26,
    spread: 0,
    knockback: 1.0,
    hitstun: 0.3,
    cooldown: 1.7,
    energyCost: 0,
    visual: 'bolt',
    color: LED,
    sound: 'knifeThrow', // silenciosa
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      // △ + ○ VOO DO ORPHEU (pedido do dono): o urutau sai do ombro, voa no rosto do adversário e volta
      id: 'vooOrpheu',
      name: 'Voo do Orpheu',
      input: 'carga+physical',
      type: 'orpheuFlight',
      description: 'O Orpheu sai do ombro, voa em volta da cabeça do adversário e ataca três vezes; a última deixa CEGO por 1 s. Ela continua lutando enquanto ele voa.',
      energyCost: 20,
      cooldown: 12,
      hits: 3,
      damage: 13,
      interval: 0.45,
      blind: 1.0,
      speed: 11,
      maxTime: 4,
      shoulderProps: ORPHEU,
      ownerId: 'beatrice',
    },
    {
      // △ + □ VIROTE SILENCIOSO (cânone: a balestra dá vantagem no combate furtivo): mira com calma e acerta forte
      id: 'viroteSilencioso',
      name: 'Virote Silencioso',
      input: 'carga+ranged',
      type: 'deathShot',
      description: 'Mira com calma (o ponto vermelho no alvo) e dispara o virote mais forte; a mais de 9 m o alvo não consegue esquivar nem defender. A mira deixa ela parada um instante.',
      energyCost: 25,
      cooldown: 12,
      windup: 0.6,
      recovery: 0.28,
      aimAnim: 'point',
      fireAnim: 'point',
      showProp: 'crossbow',
      hideProp: 'knife',
      aimColor: 0xff2a20,
      projectile: { name: 'Virote Silencioso', type: 'projectile', visual: 'bolt', color: LED, damage: 56, range: 40, speed: 80, radius: 0.3, knockback: 2.2, hitstun: 0.6, hitSound: 'bladeHit', impactScale: 1.4, longRange: { from: 9 } },
      ai: { when: 'far', min: 6 },
    },
    {
      // △ + L2 VÍCIO EM ADRENALINA (cânone, mania superada: joga uma moeda e o resultado decide quem ela ataca)
      id: 'vicioAdrenalina',
      name: 'Vício em Adrenalina',
      input: 'carga+dodge',
      type: 'selfBuff',
      buffType: 'adrenalina',
      label: 'ADRENALINA',
      anim: 'point',
      description: 'Joga a moeda. CARA: por 6 s bate 25% mais forte e anda mais rápido. COROA: bate 35% mais forte, mas recebe 20% a mais de dano.',
      energyCost: 18,
      cooldown: 16,
      duration: 6,
      coin: {
        heads: { label: 'CARA!', damageMult: 1.25, speedMult: 1.12 },
        tails: { label: 'COROA!', damageMult: 1.35, takenMult: 1.2 },
      },
      color: GOLD,
    },
    {
      // R2 + △ CLARÃO DOS LEDs (PROPOSTA: os dois LEDs da balestra, cânone, na cara do adversário)
      id: 'claraoLeds',
      name: 'Clarão dos LEDs',
      input: 'block+carga',
      type: 'photoFlash',
      description: 'Acende os LEDs da balestra na cara do adversário: quem estiver de frente e olhando fica CEGO por 1,5 s e ATORDOADO por 0,9 s, e todo inimigo menor no clarão fica parado.',
      energyCost: 18,
      cooldown: 13,
      windup: 0.25,
      step: 1.5,
      range: 9,
      arc: 80,
      lookArc: 110,
      blind: 1.5,
      color: LED,
      ai: { when: 'far', min: 2 },
    },
  ],

  // A MENINA DO PÁSSARO (PROPOSTA; o apelido que o Sidney deu a ela): o Orpheu voa no rosto do alvo, ela dispara dois
  // virotes de perto e fecha com o canivete do Orpheu
  special: {
    name: 'Menina do Pássaro',
    banner: 'Orpheu, agora!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: GOLD,
    sound: 'specialStart',
    prepare: { anim: 'point', time: 0.4, showProp: 'crossbow', hideProp: 'knife' },
    dash: { speed: 24, maxTime: 0.45, contact: 2.4 },
    standOff: 2.4,
    hits: [
      { t: 0.25, anim: 'point', dur: 0.4, share: 0.14, fx: { kind: 'punch' }, sound: 'swing', bird: { props: ORPHEU }, call: 'ORPHEU!', victimAnim: 'stagger', push: 0.02 },
      { t: 0.75, anim: 'point', dur: 0.4, share: 0.2, fx: { kind: 'stab' }, sound: 'bladeHit', burst: { count: 1, gap: 0.1, sound: 'knifeThrow' }, push: 0.05 },
      { t: 1.25, anim: 'point', dur: 0.4, share: 0.2, fx: { kind: 'stab' }, sound: 'bladeHit', burst: { count: 1, gap: 0.1, sound: 'knifeThrow' }, push: 0.05 },
      { t: 1.85, anim: 'knife_final', dur: 0.5, share: 0.46, fx: { kind: 'stab', big: true }, sound: 'slashFinal', props: [['crossbow', false], ['knife', true]], closeIn: true, final: true, shout: 'SABER TUDO É PERDER TUDO.' },
    ],
    bannerAt: 0.2,
    length: 2.8,
  },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △) — cânone, Desconjuração ep. 11 "Lembrar": a morte do Orpheu
  // devolve as memórias e ela vira a EXISTIDA (forms/beatrice_existida.js) até o fim do round
  awakening: {
    name: 'Lembrar',
    banner: 'Meu nome é Beatrice... lembra de mim!',
    type: 'maskTransform',
    scene: 'existida',
    form: 'beatrice_existida',
    formBanner: 'A EXISTIDA',
    hideProps: ORPHEU,
    sound: 'fearGaze',
    tint: GOLD,
    color: GOLD,
    duration: 0, // até o fim do round
    bonusHealth: 80,
  },

  passives: [
    { type: 'longShot', minDist: 10, mult: 1.1 }, // ótima balesteira: de longe, um pouco mais de dano
    // Merintofobia (cânone: o medo de ser amarrada, desde a noite no depósito do orfanato): cordas, raízes e veias a
    // prendem 40% mais tempo (PROPOSTA nos números)
    { type: 'merintofobia', mult: 1.4 },
  ],
};
