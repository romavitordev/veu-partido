// VERITUS — O SACRIFÍCIO DO RANCOR (id: veritus_rancor) — a outra versão do Veritus (RB/LB na seleção). Wiki "Veritus"
// (apelido: "Sacrifício do Rancor") e "Kian": quem estava no HEXATOMBE era o KIAN no corpo do Veritus (Kushim, o
// Primeiro Ocultista, que troca de corpo). Ele foi o sacrifício marcado pelo ESTIGMA DO RANCOR ("Liberta tua cólera
// primordial e aniquila a díade": matar duas pessoas no mesmo dia; a recompensa é mais dano e mais destruição da ira) e
// VENCEU o ritual mesmo sendo sacrifício — o único sobrevivente até 2023 —, ganhando o TRONO (a Relíquia de Sangue) sem
// usá-lo. NÃO virou monstro (dono, 2026-11-20: "o veritus fugiu do hexatombe e nao se tornou monstruoso, ele ganhou
// mesmo sendo um sacrificio"). No flashback: o tronco exposto, nas COSTAS a ferida no formato do Estigma, a calça
// armadurada, os braços com FAIXAS ENSANGUENTADAS, o cabelo e a barba LOIROS, os olhos amarelos e a aura vermelha.
// "Os estigmas também alteram rituais que cada sacrifício possui": por isso o kit são os RITUAIS DO KIAN alterados pelo
// Rancor (vermelhos, com sangue). Luta com os punhos enfaixados (como o Kian). Números, nomes e o especial: PROPOSTA.
// Modelo próprio do Blender (public/models/veritus_rancor.glb, tools/blender/char_veritus_rancor.py).
const RED = 0xff2a1a;
const BLOOD = 0x9a0010;

export default {
  id: 'veritus_rancor',
  baseId: 'veritus',
  name: 'SACRIFÍCIO DO RANCOR',
  model: 'veritus_rancor',
  color: '#ff2a1a',
  origin: 'Ordo Calamitas',
  element: 'sangue',
  energyColor: RED,
  info: {
    weapon: 'Os punhos enfaixados, os rituais do Kian e o Estigma do Rancor',
    style: 'O Kian no corpo do Veritus: socos, os rituais do Primeiro Ocultista em vermelho e a cólera que cresce a cada inimigo derrubado',
    identity: 'O sacrifício que venceu o Hexatombe: o Kian, marcado pelo Rancor, que ganhou o Trono e nunca o usou',
    tagline: 'Liberta tua cólera primordial e aniquila a díade.',
  },
  stats: { moveSpeed: 7.8, attackSpeed: 1.08 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'vic_veritus_rancor', block: 'block' },
  chargeFx: { style: 'default', color: RED },
  dodge: { style: 'default', distance: 5 },

  melee: {
    name: 'Punhos Enfaixados',
    strikes: [
      { name: 'Jab', anim: 'jab', dur: 0.26, active: [0.08, 0.15], damage: 22, range: 1.7, arc: 80, knockback: 0.8, lunge: 0.9, sound: 'punch', hitSound: 'punch' },
      { name: 'Direto', anim: 'cross', dur: 0.3, active: [0.1, 0.18], damage: 26, range: 1.8, arc: 80, knockback: 1.0, lunge: 0.9, sound: 'punch', hitSound: 'heavyPunch' },
      { name: 'Gancho', anim: 'hook_l', dur: 0.34, active: [0.12, 0.21], damage: 30, range: 1.8, arc: 110, knockback: 1.4, lunge: 0.8, sound: 'punch', hitSound: 'heavyPunch' },
      { name: 'Joelhada', anim: 'knee', dur: 0.32, active: [0.11, 0.19], damage: 28, range: 1.5, arc: 90, knockback: 1.6, lunge: 0.8, sound: 'swing', hitSound: 'kick' },
      { name: 'Sobrevivente', anim: 'heavy_punch', dur: 0.58, active: [0.26, 0.36], damage: 58, range: 2.0, arc: 90, lunge: 1.3, finisher: 'launch', hitstop: 0.12, element: 'sangue', bleed: { dps: 4, duration: 2 }, sound: 'heavyPunch', hitSound: 'heavyPunch', impactScale: 1.9 },
    ],
    up: { name: 'Uppercut', anim: 'uppercut', dur: 0.44, active: [0.15, 0.25], damage: 38, range: 1.8, arc: 100, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'punch', hitSound: 'heavyPunch' },
    down: { name: 'Pisão do Ritual', anim: 'stomp', dur: 0.48, active: [0.2, 0.3], damage: 44, range: 1.9, arc: 130, lunge: 0.6, finisher: 'knockdown', sound: 'heavyPunch', hitSound: 'heavyPunch' },
    forward: { name: 'Avanço de Ombro', anim: 'shoulder_charge', dur: 0.44, active: [0.13, 0.25], damage: 36, range: 2.0, arc: 110, knockback: 2.8, motion: [{ t: [0, 0.22], fwd: 5.2, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Passo e Cruzado', anim: 'cross', dur: 0.5, active: [0.28, 0.36], damage: 32, range: 1.9, arc: 80, knockback: 2.2, iframes: [0, 0.2], motion: [{ t: [0, 0.2], back: 2.4 }], sound: 'punch', hitSound: 'heavyPunch' },
    side: { name: 'Gancho Largo', anim: 'hook_r', dur: 0.44, active: [0.14, 0.28], damage: 32, range: 2.0, arc: 240, knockback: 1.8, motion: [{ t: [0, 0.24], side: 2.4 }], sound: 'punch', hitSound: 'heavyPunch' },
    air: { name: 'Queda do Sacrifício', anim: 'air_kick', dur: 0.44, active: [0.16, 0.32], damage: 36, range: 2.0, arc: 100, knockback: 3.2, slam: 17, vertical: 2.4, sound: 'swing', hitSound: 'heavyPunch' },
  },

  // □: SANGUE DO ESTIGMA — a ferida das costas se abre e o sangue sai em lâmina pelo braço
  ranged: {
    name: 'Sangue do Estigma',
    type: 'projectile',
    anim: 'wave_punch',
    origin: 'chest',
    windup: 0.24,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 30,
    range: 15,
    speed: 30,
    radius: 0.55,
    spread: 0,
    knockback: 1.4,
    hitstun: 0.45,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'bloodCrescent',
    color: RED,
    element: 'sangue',
    sound: 'heavyPunch',
    hitSound: 'heavyPunch',
  },

  // OS RITUAIS DO KIAN ALTERADOS PELO ESTIGMA DO RANCOR (cânone: "os estigmas também alteram rituais que cada sacrifício
  // possui"): os mesmos rituais do Kian, em vermelho, com o sangue e a cólera do Rancor
  abilities: [
    {
      id: 'teletransporteRancor',
      name: 'Teletransporte do Rancor',
      input: 'block+jump', // R2 + ×
      type: 'blink',
      description: 'O Teletransporte do Kian tingido pelo Rancor: some e reaparece; sem direção, surge ao lado do adversário já socando.',
      energyCost: 20,
      cooldown: 7,
      distance: 7,
      flankDistance: 2.2,
      vanishTime: 0.16,
      color: RED,
      residue: 'sigil',
      strike: { range: 2.6, damage: 38, anim: 'dash_punch' },
    },
    {
      id: 'laminaMedoRancor',
      name: 'Lâmina do Medo do Rancor',
      input: 'carga+physical', // △ + ○
      type: 'fearBlade',
      description: 'A Lâmina do Medo em vermelho: o golpe curto que quebra a defesa e deixa o alvo SANGRANDO (o Rancor). Errar deixa ele exposto.',
      energyCost: 40,
      cooldown: 22,
      duration: 0.75,
      active: [0.42, 0.56],
      range: 2.8,
      arc: 100,
      damage: 130,
      hitstun: 1.0,
      whiffRecovery: 0.45,
      dying: { dps: 9, duration: 4 },
      color: RED,
    },
    {
      id: 'toqueMorteRancor',
      name: 'Toque da Morte',
      input: 'carga+dodge', // △ + L2
      type: 'deathTouch',
      description: 'Toca o alvo e o envelhece: definha, fica lento e mais FRACO até o fim do round. Curtíssimo alcance; dá para esquivar. Recarga muito longa.',
      energyCost: 40,
      cooldown: 50,
      roundWeaken: 0.85,
      windup: 0.38,
      recovery: 0.35,
      range: 1.3,
      damage: 30,
      duration: 6,
      dps: 6,
      slow: 0.8,
      element: 'sangue',
      color: BLOOD,
    },
    {
      id: 'levitacaoRancor',
      name: 'Levitação do Rancor',
      input: 'block+carga', // R2 + △
      type: 'levitation',
      description: 'Ergue a mão e as pedras do chão sobem em volta dele, encharcadas de sangue; depois voam uma a uma contra o alvo.',
      energyCost: 30,
      cooldown: 15,
      windup: 0.32,
      recovery: 0.22,
      stones: 5,
      interval: 0.09,
      speed: 34,
      range: 18,
      damage: 17,
      color: RED,
    },
  ],

  // SOB A LUA DE SANGUE (o Hexatombe): a lua vermelha, o círculo do ritual em volta do adversário e o sino toca três
  // vezes — quem continua no círculo é o sacrifício e perde 1 ponto de existência a cada badalada; ele, o sacrifício que
  // sobreviveu, recupera 1. Dá para sair correndo do círculo.
  special: {
    name: 'Sob a Lua de Sangue',
    banner: 'Sob a Lua de Sangue',
    type: 'bloodMoon',
    energyCost: 50,
    cooldown: 14,
    range: 12,
    radius: 2.8,
    color: RED,
    sound: 'specialStart',
  },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): O PRIMEIRO OCULTISTA — o Kian aparece por trás dos olhos
  // amarelos: os rituais voltam bem mais rápido e a cólera bate mais forte. Nada de monstro: ele venceu o ritual inteiro.
  awakening: {
    name: 'O Primeiro Ocultista',
    banner: 'O Primeiro Ocultista',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ranged', 'ability'], cdRate: 1.6, speedMult: 1.06, aura: 'flame', color: 0xffc83a, heal: 0.1,
  },

  passives: [
    { type: 'dyad', per: 0.12, max: 2 }, // ANIQUILA A DÍADE: cada inimigo (ou entidade) derrubado na partida soma dano, até 2
    { type: 'escapeDeath' }, // O SACRIFÍCIO QUE SOBREVIVEU: uma vez por round o golpe fatal o deixa com 1 de vida
    { type: 'precognition' }, // o Kian não é pego desprevenido
  ],
};
