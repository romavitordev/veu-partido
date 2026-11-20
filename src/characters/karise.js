// KARISE (id: karise) — ORDO CALAMITAS (Calamidade, 67 d.C.; personagem do mestre). Wiki "Karise": a ESPIÃ da Ordo.
// Mulher negra, cabelo preto, a MASCARILHA metálica, o CAPUZ, a armadura com panos e o cachecol; nas memórias revividas,
// a aura AZUL. Arma: as ADAGAS DE PONTA DUPLA (um par). Foi a primeira a morrer nos jogos do Amphitruo (o Marius, na Sala
// da Morte).
// Habilidades da ficha: ESPIÃ (obriga alguém a revelar uma habilidade) e IMPERCEPTÍVEL (escolhe alguém e fica imune às
// habilidades dele). Fala: "Não é nada pessoal, Amalia!". Números, nomes de golpes e o especial: PROPOSTA. Modelo próprio
// do Blender (public/models/karise.glb; o capuz no modelo) + as adagas e a mascarilha em código (models/ordoWeapons.js →
// doubleDagger, mascarilha).
const BLUE = 0x3ac8ff;
const DARK = 0x5a5c64;

export default {
  id: 'karise',
  name: 'KARISE',
  model: 'karise',
  color: '#3ac8ff',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: BLUE,
  info: {
    weapon: 'O par de adagas de ponta dupla',
    style: 'A espiã: some da vista, lê o kit do adversário, fica imune ao que ele tem de melhor e corta por todos os lados',
    identity: 'A espiã da Ordo Calamitas — de capuz e mascarilha, nada é pessoal',
    tagline: 'Não é nada pessoal, Amalia!',
  },
  stats: { moveSpeed: 8.6, attackSpeed: 1.14 },
  anims: { idle: 'idle_dual', run: 'run', charge: 'charge_dual', victory: 'vic_karise', block: 'block_weapon' },
  chargeFx: { style: 'default', color: BLUE },
  dodge: { style: 'default', distance: 5.8 },

  melee: {
    name: 'Adagas de Ponta Dupla',
    // as duas pontas cortam: ida e volta no mesmo giro de punho
    strikes: [
      { name: 'Ponta', anim: 'knife_1', dur: 0.24, active: [0.07, 0.14], damage: 19, range: 1.7, arc: 100, knockback: 0.5, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: DARK, tilt: 0.1 } },
      { name: 'Contraponta', anim: 'knife_2', dur: 0.24, active: [0.07, 0.14], damage: 19, range: 1.7, arc: 100, knockback: 0.5, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: DARK, flip: true } },
      { name: 'Duas Pontas', anim: 'dual_cross', dur: 0.3, actives: [[0.08, 0.14], [0.17, 0.23]], damage: 15, range: 1.8, arc: 130, knockback: 0.7, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: DARK } },
      { name: 'Giro de Punho', anim: 'knife_3', dur: 0.28, active: [0.09, 0.17], damage: 21, range: 1.8, arc: 140, knockback: 0.8, lunge: 0.9, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Nada Pessoal', anim: 'knife_final', dur: 0.5, active: [0.18, 0.28], damage: 50, range: 2.0, arc: 90, lunge: 1.4, finisher: 'launch', hitstop: 0.1, element: 'energia', bleed: { dps: 3, duration: 2 }, sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.6, trail: { color: BLUE, big: true } },
    ],
    up: { name: 'Pontas para Cima', anim: 'slash_up', dur: 0.4, active: [0.12, 0.24], damage: 30, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: BLUE, tilt: -1.3 } },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.4, active: [0.14, 0.24], damage: 32, range: 1.9, arc: 130, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Bote da Espiã', anim: 'dash_slash', dur: 0.38, active: [0.11, 0.21], damage: 28, range: 2.0, arc: 110, knockback: 1.8, motion: [{ t: [0, 0.2], fwd: 6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: DARK } },
    back: { name: 'Esquiva e Corte', anim: 'knife_evade', dur: 0.48, active: [0.26, 0.34], damage: 26, range: 1.9, arc: 140, knockback: 1.4, iframes: [0, 0.26], motion: [{ t: [0, 0.22], back: 3.2 }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Roda das Pontas', anim: 'dual_spin', dur: 0.36, active: [0.1, 0.22], damage: 24, range: 1.9, arc: 200, knockback: 1.2, motion: [{ t: [0, 0.2], side: 3 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: BLUE, wide: true } },
    air: { name: 'Pontas do Alto', anim: 'air_knife', dur: 0.4, active: [0.14, 0.3], damage: 28, range: 1.9, arc: 110, knockback: 3, slam: 15, vertical: 2.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: DARK } },
  },

  // □: ADAGA ARREMESSADA — uma das duas sai girando pelas duas pontas
  ranged: {
    name: 'Adaga Arremessada',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'hand',
    hideProp: 'daggerR',
    windup: 0.14,
    recovery: 0.24,
    count: 2,
    interval: 0.12,
    damage: 16,
    range: 22,
    speed: 46,
    radius: 0.28,
    spread: 0.05,
    knockback: 0.5,
    hitstun: 0.25,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'doubleDagger',
    color: DARK,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      // ESPIÃ (a ficha: obriga alguém a revelar uma habilidade): a habilidade revelada fica presa
      id: 'espia',
      name: 'Espiã',
      input: 'carga+physical', // △ + ○
      type: 'spyReveal',
      description: 'Obriga o adversário a revelar uma habilidade (o nome aparece): ela fica PRESA por 8 s. Sem habilidades, é o especial que fica preso.',
      energyCost: 20,
      cooldown: 15,
      range: 14,
      seal: 8,
      color: BLUE,
    },
    {
      // ESTUDAR O ALVO (PROPOSTA; a espiã lê o kit inteiro — o IMPERCEPTÍVEL da ficha virou passiva)
      id: 'estudarAlvo',
      name: 'Estudar o Alvo',
      input: 'carga+dodge', // △ + L2
      type: 'analyze',
      buffType: 'espionada',
      label: 'ESPIONADO',
      description: 'Estuda o adversário: por 8 s ele recebe 25% a mais de dano de tudo o que vem dela.',
      energyCost: 20,
      cooldown: 16,
      range: 16,
      duration: 8,
      takenMult: 1.25,
      takenKinds: ['melee', 'ranged', 'ability'],
      color: BLUE,
    },
    {
      id: 'sombraDaOrdo',
      name: 'Sombra da Ordo',
      input: 'block+jump', // R2 + ×
      type: 'shadowVeil',
      description: 'Puxa o capuz e sai da vista (3 s): quase invisível e mais rápida; o primeiro ataque pega o alvo DESPREVENIDO. Tomar dano a revela.',
      energyCost: 20,
      cooldown: 14,
      duration: 3,
      opacity: 0.18,
      speedMult: 1.15,
      surprise: 0.6,
      color: BLUE,
    },
    {
      id: 'lequeDeAdagas',
      name: 'Leque de Adagas',
      input: 'block+carga', // R2 + △
      type: 'bladeDance',
      description: 'Gira para trás, intocável no salto, e solta quatro adagas em leque no adversário.',
      energyCost: 22,
      cooldown: 10,
      anim: 'dual_spin',
      duration: 0.7,
      iframes: 0.35,
      back: 9,
      backTime: 0.28,
      throwAt: 0.22,
      interval: 0.05,
      count: 4,
      fan: 0.5,
      element: 'energia',
      projectile: { damage: 15, range: 22, speed: 46, radius: 0.28, knockback: 0.4, hitstun: 0.25, visual: 'doubleDagger', color: DARK, hitSound: 'bladeHit', kind: 'ability' },
      color: BLUE,
      ai: { when: 'close' },
    },
  ],

  // NÃO É NADA PESSOAL (PROPOSTA; a fala dela para a Amalia): some, as adagas vêm de todos os lados, aparece nas costas
  // — e o dossiê fica completo: TODAS as habilidades do adversário presas por 6 s
  special: {
    name: 'Nada Pessoal',
    banner: 'Não é nada pessoal, Amalia!',
    type: 'spyDossier',
    energyCost: 50,
    cooldown: 14,
    range: 10,
    daggers: 8,
    seal: 6,
    damage: 250,
    color: BLUE,
    sound: 'specialStart',
  },

  awakening: {
    name: 'Memória Revivida',
    banner: 'A Espiã',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ranged', 'ability'], cdRate: 1.25, speedMult: 1.1, aura: 'flame', color: BLUE, heal: 0.1,
  },

  passives: [
    // IMPERCEPTÍVEL (a ficha: escolhe alguém e fica imune às habilidades especiais dele): o escolhido é o adversário — as
    // habilidades dele doem 40% menos nela, o especial 20% menos, e o que prende/atordoa quase não a segura
    { type: 'imperceptible', mult: 0.6, special: 0.8 },
    { type: 'backstab', mult: 1.25, surprised: true }, // a espiã: pelas costas, ou com o alvo desprevenido, entra fundo
  ],
};
