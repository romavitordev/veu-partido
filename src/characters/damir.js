// DAMIR LUKIC (id: damir) — Escriptas (os Marcados do Kian em Calamidade). Pedido do dono (2026-11-12): os gêmeos
// Lukic entram como DOIS personagens, ligados por equipe (Irmãos Lukic).
// Cânone (wiki "Damir Lukic"): sérvio, gêmeo do Boris, ex-trapezista do circo do pai (Lucas Davo), primo do Juan
// ("Priminho"); Ocultista de CONHECIMENTO, arrogante e ganancioso — o que manda no irmão. Visual: careca, chapéu fedora
// roxo de faixa preta, tapa-olho preto no olho direito, camisa vinho de gola drapeada, blazer roxo, a BENGALA de castão
// de prata na direita (esfregada, acende sigilos dourados e dá poder à gadanha do Boris) e o CADERNINHO preto com o
// círculo dos Lukic. Depois da luta com o Kian: a cicatriz no rosto e o olho AMARELO sem o tapa-olho. Rituais:
// Amaldiçoar Arma com Conhecimento, Horus (a armadura de falcão de sangue), Blackout, Cartas do Destino, Perturbação
// ("senta"), Embaralhar, Cicatrização e Ódio Incontrolável. Passivas: Ritual Veloz, Precognição, Força Paranormal.
// Fala: "Eu achava que eu era forte, que eu era poderoso... A verdade é que eu não tinha nada."
// PROPOSTA de jogo (marcada): a bengala como arma de golpes, os números, as Cartas como o □, o especial e o despertar.
const GOLD = 0xf2c230; // os sigilos de Conhecimento
const WINE = 0x7a1e3a;
const PURPLE = 0x6a3a8a;

export default {
  id: 'damir',
  name: 'DAMIR LUKIC',
  model: 'damir',
  color: '#7a4a9a', // o blazer e o fedora roxos
  origin: 'Escriptas',
  element: 'conhecimento',
  energyColor: GOLD,
  info: {
    weapon: 'A bengala de castão de prata e o caderninho de rituais',
    style: 'Ocultista: bengala rápida, cartas que atordoam e rituais que confundem e mandam no adversário',
    identity: 'O gêmeo esperto dos Lukic, que se achava poderoso',
    tagline: 'Senta.',
  },
  stats: { moveSpeed: 7.5, attackSpeed: 1.05 },
  anims: { idle: 'idle_nubi', run: 'run', charge: 'charge', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'default', color: GOLD },
  dodge: { style: 'default', distance: 4.6 },

  // A BENGALA (PROPOSTA): golpes curtos e elegantes, a ponta e o castão — mais leve que a do Nubi
  melee: {
    name: 'Bengala de Prata',
    strikes: [
      { name: 'Castão', anim: 'slash_h', dur: 0.3, active: [0.09, 0.18], damage: 24, range: 2.0, arc: 120, knockback: 0.8, lunge: 0.9, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0xc8ccd4, tilt: 0.05 } },
      { name: 'Volta da bengala', anim: 'slash_h_back', dur: 0.3, active: [0.09, 0.18], damage: 24, range: 2.0, arc: 120, knockback: 0.8, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch', trail: { color: PURPLE, flip: true } },
      { name: 'Ponta no peito', anim: 'thrust', dur: 0.32, active: [0.1, 0.19], damage: 28, range: 2.0, arc: 70, knockback: 1.0, lunge: 1.3, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Sigilo no queixo', anim: 'slash_up', dur: 0.46, active: [0.15, 0.27], damage: 52, range: 2.1, arc: 110, lunge: 1.0, finisher: 'launch', hitstop: 0.09, element: 'conhecimento', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.3, trail: { color: GOLD, tilt: -1.3, big: true } },
    ],
    up: { name: 'Bengala por baixo', anim: 'slash_up', dur: 0.42, active: [0.14, 0.26], damage: 36, range: 2.1, arc: 110, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, tilt: -1.3 } },
    down: { name: 'Bengala no chão', anim: 'slash_v', dur: 0.48, active: [0.18, 0.29], damage: 44, range: 2.1, arc: 100, lunge: 0.9, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.2, trail: { color: PURPLE, roll: 1.5 } },
    forward: { name: 'Passo do trapezista', anim: 'dash_slash', dur: 0.42, active: [0.12, 0.24], damage: 32, range: 2.1, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.22], fwd: 5, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0xc8ccd4, tilt: 0.1 } },
    back: { name: 'Recua e cutuca', anim: 'thrust', dur: 0.48, active: [0.26, 0.36], damage: 30, range: 2.0, arc: 70, knockback: 2.0, iframes: [0, 0.2], motion: [{ t: [0, 0.2], back: 2.4 }], sound: 'swing', hitSound: 'heavyPunch' },
    side: { name: 'Giro do blazer', anim: 'slash_h', dur: 0.44, active: [0.12, 0.28], damage: 28, range: 2.1, arc: 300, knockback: 1.6, motion: [{ t: [0, 0.25], side: 2.6 }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: PURPLE, wide: true } },
    air: { name: 'Salto do trapézio', anim: 'air_slash', dur: 0.4, active: [0.14, 0.3], damage: 32, range: 2.1, arc: 100, knockback: 3, slam: 15, vertical: 2.3, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, roll: 1.5 } },
  },

  // □ CARTAS DO DESTINO (cânone: o ritual das cartas; no jogo, PROPOSTA: três cartas em leque) — a última atordoa
  ranged: {
    name: 'Cartas do Destino',
    description: 'Atira três cartas de Conhecimento em leque; cada uma que acerta deixa o alvo PASMO por um instante.',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'hand',
    windup: 0.24,
    recovery: 0.3,
    count: 3,
    interval: 0.08,
    damage: 16,
    range: 15,
    speed: 22,
    radius: 0.4,
    spread: 0.16,
    knockback: 0.3,
    hitstun: 0.3,
    cooldown: 2.8,
    energyCost: 0,
    visual: 'card',
    color: GOLD,
    element: 'conhecimento',
    sound: 'knifeThrow',
    hitSound: 'impact',
    onHit: { stun: 0.18, stunAnim: 'stagger', label: 'PASMO' },
  },

  abilities: [
    {
      // △ + □ AMALDIÇOAR ARMA COM CONHECIMENTO (cânone): esfrega a bengala e os sigilos dourados acendem
      id: 'amaldicoarDamir',
      name: 'Amaldiçoar Arma',
      input: 'carga+ranged',
      type: 'curseWeapon',
      description: 'Esfrega a bengala: os sigilos dourados de Conhecimento acendem e por 8 s cada golpe da bengala tira sanidade do alvo.',
      energyCost: 20,
      cooldown: 18,
      duration: 8,
      element: 'conhecimento',
      props: ['cane'],
      color: GOLD,
    },
    {
      // △ + ○ PERTURBAÇÃO (cânone: a ordem "senta" que o alvo não consegue desobedecer)
      id: 'perturbacao',
      name: 'Perturbação',
      input: 'carga+physical',
      type: 'command',
      orders: ['SENTA!'],
      description: 'Aponta a bengala e dá a ordem: "SENTA!". O alvo perto ajoelha na hora e fica parado por um instante.',
      energyCost: 22,
      cooldown: 12,
      windup: 0.3,
      range: 7,
      stun: 1.1,
      damage: 12,
      element: 'conhecimento',
      color: GOLD,
      ai: { max: 6.5 },
    },
    {
      // △ + L2 BLACKOUT (cânone)
      id: 'blackout',
      name: 'Blackout',
      input: 'carga+dodge',
      type: 'blackout',
      description: 'Lê o caderninho e apaga a mente do alvo: quem está atacando ou andando fica CONFUSO (comandos invertidos); quem está defendendo fica FRUSTRADO (perde sanidade e a guarda cai). Dá para esquivar do clarão.',
      energyCost: 28,
      cooldown: 16,
      windup: 0.5,
      recovery: 0.3,
      range: 10,
      duration: 2.6,
      drain: 25,
      frustrate: 0.8,
      showProp: 'notebook',
      color: GOLD,
      ai: { max: 9 },
    },
    {
      // R2 + × HORUS (cânone: a armadura de falcão feita de sangue)
      id: 'horus',
      name: 'Horus',
      input: 'block+jump',
      type: 'heavyProtection',
      label: 'HORUS',
      bloodArmor: true,
      description: 'O sangue sobe e fecha numa armadura de falcão: por 7 s recebe menos dano e aguenta golpes sem recuar.',
      energyCost: 26,
      cooldown: 22,
      duration: 7,
      takenMult: 0.72,
      armor: 2,
      ai: { when: 'hurt' },
    },
    {
      // R2 + △ EMBARALHAR (cânone): as cópias que só imitam (como as do Guizo)
      id: 'embaralharDamir',
      name: 'Embaralhar',
      input: 'block+carga',
      type: 'shuffle',
      description: 'Some num clarão roxo, troca de lugar e deixa 3 cópias que imitam cada movimento dele. Por 7 s, um golpe (não especial) pode acertar uma cópia no lugar dele.',
      energyCost: 28,
      cooldown: 22,
      duration: 7,
      copies: 3,
      spacing: 1.1,
      perCopy: 0.22,
      color: PURPLE,
    },
    {
      // △ + × CICATRIZAÇÃO (cânone; o mesmo ritual do Dante e do Guizo)
      id: 'cicatrizacao',
      name: 'Cicatrização',
      input: 'carga+jump',
      type: 'agingHeal',
      description: 'Acelera o tempo nas feridas: recupera vida em instantes.',
      energyCost: 30,
      cooldown: 26,
      heal: 85,
      duration: 2.4,
      style: 'mist',
      color: GOLD,
      ai: { when: 'hurt' },
    },
  ],

  // BARALHO DOS LUKIC (PROPOSTA): bengala, bengala, as cartas em volta do alvo e o "SENTA!" no fim
  special: {
    name: 'Baralho dos Lukic',
    banner: 'O destino está nas cartas.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: GOLD,
    sound: 'specialStart',
    prepare: { anim: 'cast_up', time: 0.35 },
    dash: { speed: 22, maxTime: 0.45, contact: 2.0 },
    standOff: 2.0,
    hits: [
      { t: 0.2, anim: 'slash_h', dur: 0.32, share: 0.16, fx: { kind: 'slash' }, sound: 'heavyPunch' },
      { t: 0.6, anim: 'slash_h_back', dur: 0.32, share: 0.16, fx: { kind: 'slash', flip: true }, sound: 'heavyPunch' },
      { t: 1.0, anim: 'thrust', dur: 0.34, share: 0.18, fx: { kind: 'stab' }, sound: 'heavyPunch', shout: 'CARTAS NA MESA.' },
      { t: 1.6, anim: 'point', dur: 0.8, share: 0.5, fx: { kind: 'smash', big: true }, sound: 'slashFinal', final: true, shout: 'SENTA.' },
    ],
    bannerAt: 0.2,
    length: 2.7,
  },

  // O OLHO AMARELO (PROPOSTA; cânone: depois da luta com o Kian, sem o tapa-olho, o olho direito é amarelo)
  awakening: {
    name: 'O Olho Amarelo',
    banner: 'Eu não tinha nada. Agora eu vejo.',
    type: 'awakenMode',
    mult: 1.14, affects: ['ability', 'special', 'ranged'], cdRate: 1.4, energyRegenMult: 1.3, aura: 'smoke', color: GOLD, heal: 0.1,
  },

  passives: [
    { type: 'elementalAffinity', element: 'conhecimento', mult: 1.1 }, // Afinidade com Conhecimento
    { type: 'precognition' }, // Precognição (cânone)
    { type: 'ritualFocus', mult: 0.85 }, // Ritual Veloz (cânone; no jogo: os rituais custam menos sanidade)
  ],
};
