// VERITUS (id: veritus) — ORDO CALAMITAS (Calamidade, 67 d.C.; personagem do mestre). Wiki "Veritus": o LÍDER da Ordo
// Calamitas, em Roma, que queria guardar todas as Relíquias da Calamidade para estudá-las; imponente e respeitado, mas
// sem ser temido (amigo do Remus, do Gaius, da Amalia...), exige obediência e consagração ao imperador Nero (no ataque
// da grande silhueta negra, protegeu o governante primeiro). Fingiu morrer num dos jogos do Amphitruo; era o KIAN
// (o Sacrifício do Rancor do Hexatombe) — depois de se revelar, a aura vira DOURADA e os olhos amarelos.
// Aparência (Calamidade): meia-idade, pele clara, cabelo e BARBA LOIROS, a ARMADURA medieval metálica com detalhes
// DOURADOS, o pano cinza no peito com o Símbolo da Ordo e o ELMO FECHADO (as miniaturas); nas memórias revividas, a aura
// AZUL. Arma: a ESPADA LONGA (Livro de Regras: a lâmina reta e larga, a cruzeta comprida, o cabo em espiral e o pomo e a
// ponta em losango).
// Habilidade da ficha: SACRIFÍCIO (cede um dos próprios pontos de existência a outra pessoa). Fala: "A gente não tava
// nessa Ordem pra lutar uns contra os outros... Era pra trabalhar juntos pra derrotar esse tipo de coisa!".
// No RB/LB, a outra versão: o SACRIFÍCIO DO RANCOR (veritus_rancor.js), sem armadura, com o Estigma nas costas
// (Hexatombe). Números, nomes de golpes e o especial: PROPOSTA. Modelo próprio do Blender (public/models/veritus.glb; o
// elmo é a peça prop_helmet) + a espada em código (models/ordoWeapons.js → veritusSword).
const BLUE = 0x4a9aff;
const GOLD = 0xffd27a;
const STEEL = 0xd0d4dc;

export default {
  id: 'veritus',
  name: 'VERITUS',
  model: 'veritus',
  color: '#4a9aff',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: BLUE,
  info: {
    weapon: 'A espada longa do líder',
    style: 'O líder em armadura completa: cortes largos de espada longa, a guarda inteira e o sacrifício pelos seus',
    identity: 'O líder da Ordo Calamitas, guardião das Relíquias — e, por baixo do elmo, um segredo de Conhecimento',
    tagline: 'A gente não tava nessa Ordem pra lutar uns contra os outros!',
  },
  stats: { moveSpeed: 7.0, attackSpeed: 0.96 },
  anims: { idle: 'idle_katana', run: 'run', charge: 'charge', victory: 'vic_veritus', block: 'block_weapon' },
  chargeFx: { style: 'default', color: BLUE },
  dodge: { style: 'default', distance: 4.4 },

  melee: {
    name: 'Espada Longa',
    // a espada longa a duas mãos: cortes que cobrem a frente toda, sem pressa e sem buraco
    strikes: [
      { name: 'Corte do Líder', anim: 'slash_h', dur: 0.36, active: [0.13, 0.22], damage: 32, range: 2.5, arc: 140, knockback: 1.2, lunge: 0.9, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, tilt: 0.05 } },
      { name: 'Revés Longo', anim: 'slash_h_back', dur: 0.36, active: [0.13, 0.22], damage: 32, range: 2.5, arc: 140, knockback: 1.2, lunge: 0.9, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, flip: true } },
      { name: 'Ponta da Espada', anim: 'thrust', dur: 0.36, active: [0.13, 0.21], damage: 30, range: 2.8, arc: 50, knockback: 1.4, lunge: 1.0, sound: 'swing', hitSound: 'bladeHit' },
      { name: 'Corte de Cima', anim: 'slash_v', dur: 0.46, active: [0.18, 0.28], damage: 44, range: 2.5, arc: 100, knockback: 1.6, lunge: 1.0, sound: 'swing', hitSound: 'blade', impactScale: 1.4, trail: { color: STEEL, roll: 1.5 } },
      { name: 'Ordem da Calamidade', anim: 'slash_finisher', dur: 0.66, active: [0.3, 0.42], damage: 64, range: 2.7, arc: 150, lunge: 1.3, finisher: 'launch', hitstop: 0.12, element: 'energia', sound: 'slashFinal', hitSound: 'blade', impactScale: 2.0, trail: { color: BLUE, roll: 1.5, big: true } },
    ],
    up: { name: 'Espada para Cima', anim: 'slash_up', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.5, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Golpe de Juízo', anim: 'slash_v', dur: 0.54, active: [0.22, 0.32], damage: 50, range: 2.5, arc: 100, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'blade', impactScale: 1.6, trail: { color: STEEL, roll: 1.5 } },
    forward: { name: 'Passo do Comandante', anim: 'dash_slash', dur: 0.46, active: [0.14, 0.26], damage: 38, range: 2.4, arc: 130, knockback: 2.6, motion: [{ t: [0, 0.22], fwd: 4.8, stopClose: true }], sound: 'swing', hitSound: 'blade', trail: { color: STEEL, tilt: 0.1 } },
    back: {
      // a guarda do líder: apara com a lâmina inteira e responde
      name: 'Guarda do Líder', anim: 'counter_stance', dur: 0.62, active: [0.62, 0.62], damage: 0, range: 0, arc: 0, knockback: 0,
      counter: { window: [0.05, 0.5], riposte: { damage: 56, finisher: 'launch', anim: 'slash_finisher', sound: 'slashFinal' } },
      sound: 'blade',
    },
    side: { name: 'Roda da Espada Longa', anim: 'slash_h', dur: 0.52, active: [0.15, 0.34], damage: 34, range: 2.6, arc: 300, knockback: 1.8, motion: [{ t: [0, 0.25], side: 2 }], sound: 'swing', hitSound: 'blade', trail: { color: STEEL, wide: true } },
    air: { name: 'Espada do Alto', anim: 'air_slash', dur: 0.46, active: [0.16, 0.32], damage: 38, range: 2.5, arc: 100, knockback: 3.2, slam: 16, vertical: 2.4, sound: 'swing', hitSound: 'blade', trail: { color: STEEL, roll: 1.5 } },
  },

  // □: CORTE DE ENERGIA — a lâmina longa solta o arco azul
  ranged: {
    name: 'Corte de Energia',
    type: 'projectile',
    anim: 'slash_h',
    origin: 'chest',
    windup: 0.26,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 32,
    range: 16,
    speed: 26,
    radius: 0.8,
    spread: 0,
    knockback: 1.6,
    hitstun: 0.45,
    cooldown: 2.8,
    energyCost: 0,
    visual: 'shockwave',
    color: BLUE,
    sound: 'swing',
    hitSound: 'blade',
  },

  abilities: [
    {
      // SACRIFÍCIO (a ficha): cede um dos próprios pontos de existência a outra pessoa
      id: 'sacrificio',
      name: 'Sacrifício',
      input: 'carga+dodge', // △ + L2
      type: 'altruism',
      description: 'Cede a própria existência: paga 6% da vida e, na equipe, as ASSISTÊNCIAS voltam na hora e a Barra de Equipe enche; sozinho, recupera 40 de sanidade e as esquivas.',
      energyCost: 0,
      cooldown: 20,
      healthCost: 0.06,
      energy: 40,
      refillDodges: 2,
      teamGauge: 22,
      color: BLUE,
    },
    {
      // o LÍDER: obediência e consagração — a ordem que a Ordo segue
      id: 'liderDaOrdo',
      name: 'Líder da Ordo',
      input: 'block+carga', // R2 + △
      type: 'selfBuff',
      buffType: 'ordoLeader',
      label: 'LÍDER DA ORDO',
      anim: 'ver_command',
      animTime: 0.5,
      orderAllies: true,
      description: 'Ergue a espada e dá a ordem: por 7 s recebe 20% menos dano, aguenta 2 golpes sem recuar e os golpes saem 15% mais fortes; na equipe, as assistências ficam prontas.',
      energyCost: 26,
      cooldown: 20,
      duration: 7,
      takenMult: 0.8,
      damageMult: 1.15,
      armor: 2,
      color: BLUE,
    },
    {
      id: 'julgamento',
      name: 'Julgamento',
      input: 'carga+physical', // △ + ○
      type: 'heavyBlow',
      description: 'Ergue a espada longa com as duas mãos e desce com tudo: quebra a defesa e derruba. Preparação longa; errar deixa ele aberto.',
      energyCost: 28,
      cooldown: 12,
      anim: 'slash_v',
      duration: 1.15,
      armorFrom: 0.28,
      impact: 0.7,
      step: 4.5,
      range: 2.6,
      arc: 100,
      damage: 90,
      knockback: 4.2,
      guardCrush: 70,
      whiffRecovery: 0.55,
      color: BLUE,
      ai: { when: 'opening', max: 2.8 },
    },
    {
      // proteger o governante primeiro (o ataque da silhueta negra): o líder se planta
      id: 'protegerImperador',
      name: 'Proteger o Imperador',
      input: 'block+jump', // R2 + ×
      type: 'heavyProtection',
      label: 'PROTEGER O IMPERADOR',
      description: 'Planta a espada na frente: por 6 s recebe 35% menos dano e aguenta 3 golpes sem recuar, um pouco mais lento.',
      energyCost: 22,
      cooldown: 20,
      duration: 6,
      takenMult: 0.65,
      armor: 3,
      speedMult: 0.9,
      ai: { when: 'hurt' },
    },
  ],

  // A GENTE NÃO TAVA NESSA ORDEM PRA LUTAR UNS CONTRA OS OUTROS (PROPOSTA; a fala dele em Calamidade): o líder tira o
  // elmo — os olhos acesos —, três cortes da espada longa e o último com a aura azul virando DOURADA por um instante (o
  // segredo de quem ele é)
  special: {
    name: 'Era pra Trabalhar Juntos',
    banner: 'A gente não tava nessa Ordem pra lutar uns contra os outros!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLUE,
    sound: 'specialStart',
    prepare: { anim: 'ver_command', time: 0.55, fx: 'bladeGlow' },
    dash: { speed: 20, maxTime: 0.55, contact: 2.0 },
    hits: [
      { t: 0.6, anim: 'slash_h', dur: 0.36, share: 0.14, fx: { kind: 'slash' }, sound: 'blade', victimAnim: 'stagger', props: [['helmet', false]] },
      { t: 1.05, anim: 'slash_h_back', dur: 0.36, share: 0.14, fx: { kind: 'slash', flip: true }, sound: 'blade' },
      { t: 1.5, anim: 'thrust', dur: 0.34, share: 0.14, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.95, anim: 'slash_v', dur: 0.44, share: 0.14, fx: { kind: 'slash', roll: 1.5, color: GOLD }, sound: 'blade' },
      { t: 2.6, anim: 'slash_finisher', dur: 0.66, share: 0.44, fx: { kind: 'cross', big: true, color: GOLD, color2: BLUE }, sound: 'slashFinal', final: true, quake: GOLD },
    ],
    bannerAt: 0.15,
    length: 3.5,
  },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): o líder se revela — a aura azul vira DOURADA e os olhos
  // acendem em amarelo (cânone: depois de se revelar Kian)
  awakening: {
    name: 'O Segredo do Líder',
    banner: 'Veritus revelado',
    type: 'awakenMode',
    mult: 1.18, affects: ['melee', 'ranged', 'ability'], cdRate: 1.25, speedMult: 1.06, aura: 'flame', color: GOLD, heal: 0.12,
  },

  passives: [
    { type: 'resistant', mult: 0.92, kinds: ['melee', 'ranged'] }, // a armadura completa do líder
  ],
};
