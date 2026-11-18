// ALÊ (id: ale) — PSIKOLERA (Hexatombe), o teclado da banda (elu). Pedido do dono (2026-11-18): "finalize os psikolera,
// adicione Franco e Alê". Cânone (wiki "Alê", lore/EQUIPES-HEXATOMBE.md): 25 anos, ~1,75 m; o cabelo LOIRO LONGO com a
// raiz vermelho-alaranjada, olhos azuis; o macacão de camisa de força, piercings, PREGOS NA GOLA e o COLAR COM A PEDRA
// VERMELHA; a máscara de CORPSE PAINT branca e preta (foi Alê quem fez as máscaras da banda, que mudam o humor de quem
// usa). Arma: a LÂMINA KEYTAR (uma lâmina grande presa na lateral de um keytar). Habilidade: PREVER RESULTADOS (deixa um
// aliado rejogar um dado antes de saber o valor); LÊ MÃOS e PÕE EM TRANSE. Morte no ep. 7 (a Cindy crema Franco e Alê
// com a Última Nota). Pronome: ELU — os textos usam a linguagem neutra.
// PROPOSTA de jogo (marcada): os golpes com a Lâmina Keytar, a Nota Aguda, o Transe como espiral (o mesmo efeito da
// Hipnose Espiral), a Leitura de Mão como golpe que atordoa, o Corte de Teclado, o Prever Resultados como estado
// (esquivas de volta e menos dano), o especial ACORDE FINAL e o despertar com a máscara de corpse paint.
const STONE = 0xc8102a; // a pedra vermelha do colar
const TRANCE = 0x9a7aff; // o transe

export default {
  id: 'ale',
  name: 'ALÊ',
  model: 'ale',
  color: '#e6cf86', // o loiro
  origin: 'PSIKOLERA',
  element: 'morte',
  energyColor: STONE,
  info: {
    weapon: 'A Lâmina Keytar: uma lâmina grande presa na lateral de um keytar',
    style: 'Lê o jogo antes de acontecer: cortes longos com a lâmina, o transe que puxa o adversário e as esquivas de volta na hora certa',
    identity: 'O teclado da PSIKOLERA (elu), quem fez as máscaras da banda',
    tagline: 'Me dá sua mão. Eu já sei como termina.',
  },
  stats: { moveSpeed: 8.0, attackSpeed: 1.04 },
  anims: { idle: 'idle_hammer', run: 'run', charge: 'charge', victory: 'vic_ale', block: 'block_hammer', blockHeavy: 'block_heavy' },
  chargeFx: { style: 'default', color: STONE },
  dodge: { style: 'default', distance: 5.0 },
  passives: [
    { type: 'precognition' }, // Prever Resultados (cânone): não é pego desprevenide
  ],

  // A LÂMINA KEYTAR de perto: cortes longos (a lâmina passa da ponta do teclado)
  melee: {
    name: 'Lâmina Keytar',
    strikes: [
      { name: 'Corte da lâmina', anim: 'hammer_h', dur: 0.32, active: [0.1, 0.18], damage: 22, range: 2.4, arc: 140, knockback: 0.9, lunge: 1.0, sound: 'swing', hitSound: 'bladeHit', bleed: { dps: 2, duration: 1.5 }, trail: { radius: 1.4, color: STONE, tilt: 0.1 } },
      { name: 'Volta do teclado', anim: 'hammer_diag', dur: 0.36, active: [0.13, 0.22], damage: 25, range: 2.4, arc: 120, knockback: 1.0, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', trail: { radius: 1.4, color: TRANCE, flip: true } },
      { name: 'Estocada', anim: 'thrust', dur: 0.34, active: [0.12, 0.2], damage: 26, range: 2.6, arc: 60, knockback: 1.2, lunge: 1.3, sound: 'swing', hitSound: 'bladeHit', bleed: { dps: 2, duration: 2 } },
      { name: 'Acorde cortante', anim: 'hammer_finisher', dur: 0.66, active: [0.28, 0.4], damage: 54, range: 2.5, arc: 170, lunge: 1.4, finisher: 'launch', bleed: { dps: 3, duration: 2.5 }, sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.25, hitstop: 0.09, trail: { radius: 1.5, big: true, color: STONE } },
    ],
    up: { name: 'Lâmina de baixo', anim: 'hammer_up', dur: 0.44, active: [0.15, 0.25], damage: 32, range: 2.3, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: STONE, tilt: -1.2 } },
    down: { name: 'Teclado no chão', anim: 'hammer_ground', dur: 0.54, active: [0.21, 0.32], damage: 38, range: 2.3, arc: 100, lunge: 0.9, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', groundFx: 'dust', groundScale: 0.5 },
    ground: { name: 'Corta no chão', anim: 'hammer_ground', dur: 0.54, active: [0.21, 0.32], damage: 28, range: 2.3, arc: 110, motion: [{ t: [0, 0.2], fwd: 1.5, stopClose: true }], otg: true, knockback: 0, sound: 'swing', hitSound: 'bladeHit' },
    forward: { name: 'Entra no ritmo', anim: 'dash_slash', dur: 0.42, active: [0.12, 0.24], damage: 28, range: 2.2, arc: 100, knockback: 2.0, motion: [{ t: [0, 0.22], fwd: 5.8, stopClose: true }], sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.3, color: STONE } },
    back: { name: 'Já sabia', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.36], damage: 28, range: 2.4, arc: 100, knockback: 2.2, iframes: [0, 0.24], motion: [{ t: [0, 0.15], back: 3.0 }], sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.3, color: TRANCE } },
    side: { name: 'Corte rodado', anim: 'hammer_h', dur: 0.44, active: [0.16, 0.25], damage: 28, range: 2.3, arc: 150, knockback: 1.6, motion: [{ t: [0, 0.24], side: 2.6 }], sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.4, color: STONE } },
    air: { name: 'Lâmina do alto', anim: 'hammer_air', dur: 0.46, active: [0.16, 0.32], damage: 34, range: 2.3, arc: 110, knockback: 3, slam: 15, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', trail: { radius: 1.3, color: STONE, roll: 1.2 } },
  },

  // □ NOTA AGUDA (PROPOSTA; o teclado da banda): a onda de uma nota aguda sai do keytar em linha
  ranged: {
    name: 'Nota Aguda',
    type: 'projectile',
    anim: 'shoot_bass',
    windup: 0.2,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 20,
    range: 15,
    speed: 26,
    radius: 0.6,
    spread: 0,
    knockback: 1.4,
    hitstun: 0.35,
    cooldown: 2.2,
    energyCost: 0,
    visual: 'shockwave',
    color: TRANCE,
    element: 'morte',
    sound: 'ready',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + □ TRANSE (cânone: põe as pessoas em transe; mecânica PROPOSTA, a mesma da Hipnose Espiral): a melodia desenha a
      // espiral e o alvo anda até Alê sem conseguir defender
      id: 'transe',
      name: 'Transe',
      input: 'carga+ranged',
      type: 'hypnoSpiral',
      description: 'Toca a melodia do transe: o alvo na frente anda em círculos até Alê, sem conseguir defender, e fica parado um instante, hipnotizade.',
      energyCost: 25,
      cooldown: 20,
      windup: 0.45,
      recovery: 0.3,
      range: 10,
      arc: 60,
      duration: 2.3,
      offset: 1.6,
      stun: 0.7,
      color: TRANCE,
    },
    {
      // △ + ○ LEITURA DE MÃO (cânone: Alê lê mãos; mecânica PROPOSTA): pega a mão do adversário de perto, lê o futuro dele
      // e o deixa ATORDOADO com o que viu
      id: 'leituraDeMao',
      name: 'Leitura de Mão',
      input: 'carga+physical',
      type: 'fearGaze',
      description: 'Pega a mão do adversário bem de perto e lê o futuro dele: dano e ATORDOADO. Quem estiver defendendo puxa a mão e leva menos.',
      energyCost: 22,
      cooldown: 13,
      windup: 0.35,
      recovery: 0.5,
      range: 2.4,
      arc: 70,
      damage: 28,
      stun: 1.0,
      earsCover: 0.5,
      hitLabel: 'LEITURA DE MÃO',
      anim: 'grab',
      sound: 'ritual',
      shout: 'Eu vi.',
      element: 'morte',
      color: STONE,
    },
    {
      // △ + L2 CORTE DE TECLADO (PROPOSTA): avança deslizando a lâmina e para do outro lado do alvo
      id: 'corteTeclado',
      name: 'Corte de Teclado',
      input: 'carga+dodge',
      type: 'dashStrike',
      description: 'Avança deslizando a lâmina pela lateral do adversário (quebra a defesa) e termina atrás dele.',
      energyCost: 20,
      cooldown: 10,
      windup: 0.12,
      distance: 6.5,
      speed: 24,
      range: 2.0,
      recovery: 0.3,
      damage: 32,
      knockback: 0.5,
      hitstun: 0.5,
      guardBreak: true,
      reposition: 1.3,
      bleed: { dps: 2, duration: 2 },
      color: STONE,
      anim: 'dash_slash',
      startSound: 'swing',
    },
    {
      // R2 + △ PREVER RESULTADOS (cânone: a habilidade de Alê; o estado é PROPOSTA): vê o que vem antes de acontecer — as
      // esquivas voltam e os golpes chegam mais fracos
      id: 'preverResultados',
      name: 'Prever Resultados',
      input: 'block+carga',
      type: 'selfBuff',
      buffType: 'prever',
      label: 'PREVER RESULTADOS',
      anim: 'concentrate',
      animTime: 0.5,
      sound: 'ritual',
      description: 'Vê o resultado antes de acontecer: recupera todas as esquivas e, por 6 s, toma menos dano e se mexe mais rápido.',
      energyCost: 22,
      cooldown: 18,
      duration: 6,
      refillDodges: true,
      takenMult: 0.8,
      speedMult: 1.1,
      color: TRANCE,
    },
  ],

  // ACORDE FINAL (PROPOSTA): Alê toca o acorde, entra cortando com a lâmina e termina com a nota que joga longe
  special: {
    name: 'Acorde Final',
    banner: 'ACORDE FINAL!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: STONE,
    sound: 'specialStart',
    physical: true,
    prepare: {
      anim: 'bass_play', time: 0.9,
      steps: [{ t: 0.3, sound: 'ready' }, { t: 0.55, shout: 'Eu já sei como termina.' }],
    },
    dash: { speed: 24, maxTime: 0.6, contact: 2.0 },
    standOff: 1.7,
    hits: [
      { t: 0.12, anim: 'hammer_h', dur: 0.3, share: 0.12, fx: { kind: 'slash', color: STONE }, sound: 'bladeHit' },
      { t: 0.44, anim: 'hammer_diag', dur: 0.3, share: 0.12, fx: { kind: 'slash', color: TRANCE }, sound: 'bladeHit' },
      { t: 0.78, anim: 'thrust', dur: 0.3, share: 0.14, fx: { kind: 'stab' }, sound: 'bladeHit', bleed: { dps: 3, duration: 2 } },
      { t: 1.12, anim: 'hammer_up', dur: 0.36, share: 0.14, fx: { kind: 'slash', color: STONE }, sound: 'slashFinal', shout: 'Escuta!' },
      { t: 1.6, anim: 'hammer_finisher', dur: 0.62, share: 0.48, fx: { kind: 'slash', big: true, color: STONE }, sound: 'explosion', final: true, shout: 'ACORDE FINAL!!' },
    ],
    bannerAt: 0.2,
    length: 2.4,
  },

  // A MÁSCARA DE CORPSE PAINT (cânone: foi Alê quem fez as máscaras da banda). Como o resto da PSIKOLERA, a máscara só
  // entra no despertar — e fica até o fim do round
  awakening: {
    name: 'Máscara do Humor',
    banner: 'MÁSCARA DO HUMOR!',
    type: 'awakenMode',
    anim: 'taunt_roar',
    props: [['maskOn', true]],
    idleAnim: 'idle_wild',
    mult: 1.15, affects: ['melee', 'ranged', 'ability', 'special'], cdRate: 1.3, regen: 2, heal: 0.12, speedMult: 1.06, aura: 'shadow', color: TRANCE,
  },
};
