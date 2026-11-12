// BORIS LUKIC (id: boris) — Escriptas (os Marcados do Kian em Calamidade). Pedido do dono (2026-11-12): os gêmeos Lukic
// entram como DOIS personagens, ligados por equipe (Irmãos Lukic), e com a Artemis fecham os três Escriptas novos.
// Cânone (wiki "Boris Lukic"): sérvio, 41 anos, gêmeo do Damir, ex-trapezista do "Show do Diabo" (filho de Lucas Davo,
// primo do Juan); Combatente de MORTE; sereno, obediente ao irmão e o que mais se importa com os outros — sempre na
// linha de frente com um sorriso meigo. Arma: a GADANHA (foice de cabo longo); com a bengala do Damir encaixada vira a
// FOICE AMALDIÇOADA de Conhecimento ("Nostis omnia perdet omnia" — saber tudo é perder tudo), pesada, de duas mãos.
// Item amaldiçoado: o ELMO SANGRENTO (capacete romano que aguenta tiros e Sangue). Habilidades: Afinidade com Morte,
// Ataque Volátil, Precognição, Ataque Poderoso e Escapar da Morte. Fala: "meu objetivo é matar o Diabo... seja do lado
// do Kian, seja do lado deles." Morreu com a cabeça esmagada pelo Kian.
// PROPOSTA de jogo (marcada): as sequências da gadanha, a Onda de Morte do □, o Salto do Trapézio, o especial, o
// despertar e os números.
const MORTE = 0x8a8494;
const GOLD = 0xf2c230; // a Foice Amaldiçoada com a bengala do Damir
const STEEL = 0xb8bcc4;

export default {
  id: 'boris',
  name: 'BORIS LUKIC',
  model: 'boris',
  color: '#8aa08a', // o sobretudo cinza-esverdeado
  origin: 'Escriptas', // os Marcados do Kian (cânone)
  element: 'morte',
  energyColor: MORTE,
  info: {
    weapon: 'A gadanha (foice de cabo longo) e o Elmo Sangrento',
    style: 'Linha de frente: gadanha larga de duas mãos, golpes que dobram de força e um elmo que segura bala',
    identity: 'O gêmeo grandão e sereno dos Lukic, que segue o irmão sem perguntar',
    tagline: 'Meu objetivo é matar o Diabo. Seja do lado de quem for.',
  },
  stats: { moveSpeed: 7.2, attackSpeed: 0.96 }, // grande e pesado (PROPOSTA; a vida é a mesma do elenco)
  anims: { idle: 'idle_hammer', run: 'run', charge: 'charge', victory: 'victory_hammer', block: 'block_hammer', blockHeavy: 'block_heavy', dash: 'dash_heavy' },
  // a gadanha nas duas mãos (a pegada do machado do Balu); andando leva no ombro
  grip: {
    twoHand: true,
    reach: 0.46,
    carry: { sR: [-0.55, 0.35, -0.35], eR: [-1.6, 0, 0] },
    freeLeft: ['taunt_roar', 'throw_r', 'charge', 'shoulder_charge', 'defeat', 'dash_heavy', 'hit', 'launched', 'fall', 'getup', 'concentrate', 'point'],
  },
  chargeFx: { style: 'default', color: MORTE },
  dodge: { style: 'default', distance: 5.2 },

  // A GADANHA: varridas largas de duas mãos (PROPOSTA; as animações do martelo, que já têm o peso certo)
  melee: {
    name: 'Gadanha',
    strikes: [
      { name: 'Varrida baixa', anim: 'hammer_h', dur: 0.4, active: [0.13, 0.22], damage: 30, range: 2.7, arc: 160, knockback: 1.0, lunge: 0.9, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, tilt: 0.05, wide: true } },
      { name: 'Volta da lâmina', anim: 'hammer_diag', dur: 0.44, active: [0.17, 0.27], damage: 32, range: 2.7, arc: 140, knockback: 1.1, lunge: 0.9, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, roll: 0.8 } },
      { name: 'Ceifa por cima', anim: 'hammer_v', dur: 0.5, active: [0.22, 0.32], damage: 40, range: 2.8, arc: 80, knockback: 1.5, lunge: 1.0, guardCrush: 18, sound: 'swing', hitSound: 'bladeHit', impactFx: 'smash', impactScale: 1.3, hitstop: 0.08, trail: { color: STEEL, roll: 1.55 } },
      { name: 'Colheita', anim: 'hammer_finisher', dur: 0.72, active: [0.3, 0.46], damage: 60, range: 2.9, arc: 200, lunge: 1.4, finisher: 'launch', element: 'morte', sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.7, hitstop: 0.11, trail: { color: MORTE, roll: 1.4, big: true } },
    ],
    up: { name: 'Gancho da gadanha', anim: 'hammer_up', dur: 0.48, active: [0.17, 0.27], damage: 38, range: 2.6, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Lâmina no chão', anim: 'hammer_ground', dur: 0.56, active: [0.22, 0.34], damage: 42, range: 2.6, arc: 100, lunge: 0.9, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactFx: 'smash', impactScale: 1.3, groundFx: 'dust', groundScale: 0.7, hitstop: 0.09 },
    forward: { name: 'Investida do grandão', anim: 'hammer_charge', dur: 0.54, active: [0.24, 0.34], damage: 36, range: 2.7, arc: 120, knockback: 2.2, motion: [{ t: [0, 0.26], fwd: 6.2, stopClose: true }], sound: 'swing', hitSound: 'bladeHit', groundFx: 'dust', groundScale: 0.5, trail: { color: STEEL, tilt: -0.6 } },
    back: { name: 'Recua e ceifa', anim: 'hammer_h', dur: 0.48, active: [0.22, 0.3], damage: 32, range: 2.7, arc: 150, knockback: 2.4, motion: [{ t: [0, 0.13], back: 1.8 }, { t: [0.16, 0.28], fwd: 1.6, stopClose: true }], sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, tilt: 0.05 } },
    side: { name: 'Giro da gadanha', anim: 'hammer_h', dur: 0.46, active: [0.15, 0.27], damage: 30, range: 2.8, arc: 300, knockback: 1.8, motion: [{ t: [0, 0.22], side: 2.6 }], sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, wide: true } },
    // SALTO DO TRAPÉZIO (PROPOSTA; base canônica: os gêmeos foram trapezistas no circo do pai)
    air: { name: 'Salto do Trapézio', anim: 'hammer_air', dur: 0.48, active: [0.17, 0.33], damage: 36, range: 2.6, arc: 110, knockback: 3, slam: 16, vertical: 2.4, sound: 'swing', hitSound: 'bladeHit', impactFx: 'smash', impactScale: 1.3, trail: { color: STEEL, roll: 1.4 } },
  },

  // □ ONDA DE MORTE (PROPOSTA; Afinidade com Morte): crava a gadanha no chão e o Lodo corre até o alvo, que fica lento
  ranged: {
    name: 'Onda de Morte',
    description: 'Crava a gadanha no chão: uma onda de Lodo corre pelo chão até o alvo e o deixa LENTO.',
    type: 'projectile',
    anim: 'hammer_ground',
    windup: 0.36,
    recovery: 0.36,
    count: 1,
    interval: 0,
    damage: 42,
    range: 16,
    speed: 18,
    radius: 0.9,
    spread: 0,
    knockback: 1.2,
    hitstun: 0.35,
    cooldown: 3.4,
    energyCost: 0,
    visual: 'decay',
    element: 'morte',
    color: MORTE,
    onHit: { slow: { time: 2.2, mult: 0.7 } },
    sound: 'shockwave',
    hitSound: 'heavyPunch',
  },

  abilities: [
    {
      // △ + ○ ATAQUE VOLÁTIL (cânone: 1 PE para DOBRAR a força no dano da arma corpo a corpo)
      id: 'ataqueVolatil',
      name: 'Ataque Volátil',
      input: 'carga+physical',
      type: 'selfBuff',
      buffType: 'ataqueVolatil',
      label: 'ATAQUE VOLÁTIL',
      anim: 'concentrate',
      description: 'Firma a gadanha e põe o peso inteiro no braço: por 6 s os golpes da gadanha batem com o DOBRO da força (+35% de dano).',
      energyCost: 20,
      cooldown: 16,
      duration: 6,
      damageMult: 1.35,
      affects: ['melee'],
      color: MORTE,
      sound: 'ready',
      ai: { when: 'near' },
    },
    {
      // R2 + △ ATAQUE PODEROSO (cânone: +5 no acerto — aqui, o golpe que atravessa a defesa)
      id: 'ataquePoderoso',
      name: 'Ataque Poderoso',
      input: 'block+carga',
      type: 'heavyBlow',
      description: 'Ergue a gadanha bem alto, avança e desce com tudo: o golpe atravessa a defesa e derruba. Preparação longa (aguenta um golpe pequeno depois de concentrar); errar deixa ele aberto.',
      energyCost: 30,
      cooldown: 12,
      duration: 1.4,
      armorFrom: 0.35,
      impact: 0.84,
      step: 6,
      range: 2.8,
      arc: 100,
      damage: 92,
      knockback: 4.5,
      guardCrush: 80,
      whiffRecovery: 0.5,
      ai: { when: 'opening', max: 3 },
    },
    {
      // R2 + × ELMO SANGRENTO (cânone: o capacete romano de Domus Aurea que resiste a tiros e a Sangue)
      id: 'elmoSangrento',
      name: 'Elmo Sangrento',
      input: 'block+jump',
      type: 'heavyProtection',
      label: 'ELMO SANGRENTO',
      prop: 'helmet',
      description: 'Veste o Elmo Sangrento: por 7 s recebe bem menos dano (quase nada de tiros e de Sangue) e aguenta golpes sem recuar.',
      energyCost: 25,
      cooldown: 20,
      duration: 7,
      takenMult: 0.65,
      armor: 2,
      ai: { when: 'hurt' },
    },
    {
      // △ + L2 INVESTIDA DO TRAPEZISTA (PROPOSTA; base canônica: os trapezistas do circo do Diabo): gira o corpo no
      // cabo da gadanha cravada, voa por cima e cai no alvo
      id: 'trapezio',
      name: 'Investida do Trapezista',
      input: 'carga+dodge',
      type: 'dashStrike',
      description: 'Crava a gadanha, gira o corpo no cabo como no trapézio e cai em cima do alvo com a lâmina: derruba.',
      energyCost: 22,
      cooldown: 10,
      anim: 'hammer_air',
      windup: 0.18,
      speed: 18,
      distance: 7,
      recovery: 0.4,
      range: 2.4,
      damage: 54,
      knockback: 3,
      knockdown: true,
      color: MORTE,
      ai: { when: 'far', min: 3, max: 9 },
    },
  ],

  // PELA FAMÍLIA LUKIC (PROPOSTA; o broche dos Lukic no sobretudo): ceifa, gira, e o Damir aparece para encaixar a
  // bengala — a gadanha vira a FOICE AMALDIÇOADA dourada ("Saber tudo é perder tudo") e o golpe final escreve os
  // sigilos na pele do alvo (cânone do corte da foice)
  special: {
    name: 'Pela Família Lukic',
    banner: 'Por Lucas.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: GOLD,
    sound: 'specialStart',
    prepare: { anim: 'hammer_h', time: 0.35 },
    dash: { speed: 22, maxTime: 0.45, contact: 2.4 },
    standOff: 2.4,
    hits: [
      { t: 0.2, anim: 'hammer_h', dur: 0.4, share: 0.18, fx: { kind: 'slash', wide: true }, sound: 'bladeHit', shout: 'GRANDÃO TÁ AQUI.' },
      { t: 0.7, anim: 'hammer_diag', dur: 0.4, share: 0.18, fx: { kind: 'slash', flip: true }, sound: 'bladeHit' },
      { t: 1.2, noHit: true, anim: 'concentrate', dur: 0.5, shout: 'A FOICE AMALDIÇOADA', props: [['scythe', false], ['foice', true]] },
      { t: 1.8, anim: 'hammer_finisher', dur: 0.7, share: 0.64, fx: { kind: 'slash', big: true }, sound: 'slashFinal', final: true, shout: 'SABER TUDO É PERDER TUDO' },
    ],
    bannerAt: 0.2,
    length: 2.9,
  },

  // DESPERTAR (PROPOSTA, pelo Escapar da Morte do cânone): ele se recusa a cair — ainda de pé, bate e aguenta mais até o
  // fim do round, e se cura aos poucos
  awakening: {
    name: 'Ainda de Pé',
    banner: 'Eu ainda tô de pé, irmão.',
    type: 'awakenMode',
    mult: 1.12, affects: ['melee', 'ranged', 'ability'], cdRate: 1.2, regen: 3, heal: 0.12, takenMult: 0.85, speedMult: 1.04, aura: 'flame', color: MORTE,
  },

  passives: [
    { type: 'elementalAffinity', element: 'morte', mult: 1.1 }, // Afinidade com Morte
    { type: 'precognition' }, // Precognição (cânone: o sexto sentido contra perigos de perto)
    { type: 'resistant', kinds: ['melee'], mult: 0.92 }, // +5 de defesa contra ataques em alcance curto
    { type: 'escapeDeath' }, // Escapar da Morte (cânone): uma vez por round fica com 1 de vida
  ],
};
