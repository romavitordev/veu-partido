// VERITUS (id: veritus) — ORDO CALAMITAS (Calamidade, 67 d.C.; personagem do mestre). Wiki "Veritus": o LÍDER da Ordo
// Calamitas, em Roma, que queria guardar todas as Relíquias da Calamidade para estudá-las; imponente e respeitado, mas
// sem ser temido (amigo do Remus, do Gaius, da Amalia...), exige obediência e consagração ao imperador Nero (no ataque
// da grande silhueta negra, protegeu o governante primeiro). Fingiu morrer num dos jogos do Amphitruo; era o KIAN
// (o Sacrifício do Rancor do Hexatombe) — depois de se revelar, a aura vira DOURADA e os olhos amarelos.
// Aparência (Calamidade): meia-idade, pele clara, cabelo e BARBA LOIROS, a ARMADURA medieval metálica com detalhes
// DOURADOS, o pano cinza no peito com o Símbolo da Ordo e o ELMO FECHADO (as miniaturas); nas memórias revividas, a aura
// AZUL. Arma: a ESPADA LONGA (Livro de Regras: a lâmina reta e larga, a cruzeta comprida, o cabo em espiral e o pomo e a
// ponta em losango).
// Habilidade da ficha: SACRIFÍCIO (cede um dos próprios pontos de existência a outra pessoa; ver combat/ordoCalamitas.js). Fala: "A gente não tava
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
      type: 'ordoSacrifice',
      description: 'Cede 1 PONTO DE EXISTÊNCIA (10% da vida; precisa sobrar 1). Na equipe, as ASSISTÊNCIAS voltam na hora e a Barra de Equipe enche; sozinho, a sanidade, a guarda e as esquivas enchem e ele bate 15% mais forte por 6 s.',
      energyCost: 0,
      cooldown: 18,
      energy: 50,
      refillDodges: 2,
      teamGauge: 25,
      duration: 6,
      damageMult: 1.15,
      color: BLUE,
      ai: { when: 'opening' },
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
      // a PONTA EM LOSANGO da espada (Livro de Regras): a estocada que atravessa a guarda
      id: 'pontaLosango',
      name: 'Ponta de Losango',
      input: 'carga+physical', // △ + ○
      type: 'dashStrike',
      description: 'Avança com a ponta em losango da espada longa: a estocada QUEBRA A DEFESA de quem está bloqueando e empurra longe.',
      energyCost: 26,
      cooldown: 11,
      anim: 'thrust',
      windup: 0.22,
      distance: 6,
      speed: 26,
      range: 2.6,
      damage: 70,
      knockback: 4,
      hitstun: 0.6,
      guardBreak: true,
      recovery: 0.4,
      color: GOLD,
      ai: { when: 'opening', max: 6 },
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

  // O SACRIFÍCIO DO LÍDER (PROPOSTA a partir da ficha): ele dá a própria existência — até 3 pontos (sempre sobra 1) — e
  // cada ponto vira uma lança de luz que voa contra o adversário; quanto mais ele dá, mais forte
  special: {
    name: 'O Sacrifício do Líder',
    banner: 'A gente não tava nessa Ordem pra lutar uns contra os outros!',
    type: 'lastSacrifice',
    energyCost: 50,
    cooldown: 14,
    range: 12,
    maxPoints: 3,
    perPoint: 140, // por ponto dado (3 pontos = 450 de vida dele: 420 + o final 90 = 510)
    final: 90,
    damage: 250,
    color: BLUE,
    gold: GOLD,
    sound: 'specialStart',
  },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): A REVELAÇÃO — o elmo sai e quem está ali é o KIAN (cânone:
  // depois de se revelar, a aura DOURADA e os olhos amarelos). Vira forms/veritus_kian.js até o fim do round: os rituais
  // do Primeiro Ocultista e o INEXISTIR
  awakening: {
    name: 'A Revelação',
    banner: 'A Revelação',
    type: 'maskTransform',
    form: 'veritus_kian',
    formBanner: 'O LÍDER ERA O KIAN',
    finalAnim: 'powerup',
    tint: GOLD,
    sound: 'powerUp',
    duration: 0,
    bonusHealth: 100,
    color: GOLD,
  },

  passives: [
    { type: 'resistant', mult: 0.92, kinds: ['melee', 'ranged'] }, // a armadura completa do líder
  ],
};
