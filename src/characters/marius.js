// MARIUS (id: marius) — ORDO CALAMITAS (Calamidade, 67 d.C.; intérprete: Guaxinim). Wiki "Marius": "O Guerreiro" (o
// "Grandão" da Celestine, do Marcellus e do Remus) — ex-lutador de rua, queimado no INCÊNDIO DE ROMA; quieto, fala uma
// ou duas palavras por vez, bondoso. Uns 2 m, parrudo, a armadura grande com o SÍMBOLO DA ORDO GRAVADO no peitoral, o
// ELMO FECHADO e as cicatrizes de queimadura; nas memórias revividas, a aura VERMELHA. Arma: as MANOPLAS escuras com a
// aura vermelha. Nos jogos do Amphitruo matou Karise e Cornelius na Sala da Morte e no fim deixou o Faustus cortar o
// pescoço dele, agradecendo a todos.
// Habilidades da ficha: SANGUINÁRIO (matar com as mãos devolve existência), BONDADE (+1 dado contra quem agride um
// aliado) e, traído, ganha a defesa do atacante. Fala: "Obrigado por tudo.". Números, nomes de golpes e o especial:
// PROPOSTA. Modelo próprio do Blender (public/models/marius.glb; o elmo fechado no modelo) + as manoplas em código.
const RED = 0xff3a2a;

export default {
  id: 'marius',
  name: 'MARIUS',
  model: 'marius',
  color: '#ff3a2a',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: RED,
  info: {
    weapon: 'As manoplas escuras com a aura vermelha',
    style: 'O lutador de rua de 2 metros: socos que derrubam parede, agarrões e uma armadura que mal sente o golpe',
    identity: 'O Guerreiro: o grandão quieto da Ordo Calamitas — fala pouco, bate muito e cuida de quem está do lado dele',
    tagline: 'Obrigado por tudo.',
  },
  stats: { moveSpeed: 7.0, attackSpeed: 0.92 },
  anims: { idle: 'idle_dalmo', run: 'run', charge: 'charge_fists', victory: 'vic_marius', block: 'block_heavy' },
  chargeFx: { style: 'default', color: RED },
  dodge: { style: 'default', distance: 4 },

  melee: {
    name: 'Manoplas',
    // o boxe da rua: sem firula, cada soco com o corpo inteiro
    strikes: [
      { name: 'Direto', anim: 'jab', dur: 0.3, active: [0.1, 0.17], damage: 28, range: 1.8, arc: 80, knockback: 1.2, lunge: 0.8, sound: 'punch', hitSound: 'heavyPunch' },
      { name: 'Cruzado', anim: 'cross', dur: 0.34, active: [0.12, 0.2], damage: 32, range: 1.8, arc: 90, knockback: 1.4, lunge: 0.8, sound: 'punch', hitSound: 'heavyPunch' },
      { name: 'Gancho no Corpo', anim: 'body_blow', dur: 0.36, active: [0.13, 0.22], damage: 34, range: 1.7, arc: 90, knockback: 1.6, lunge: 0.7, sound: 'punch', hitSound: 'heavyPunch' },
      { name: 'Gancho', anim: 'hook_l', dur: 0.4, active: [0.15, 0.24], damage: 38, range: 1.8, arc: 110, knockback: 1.8, lunge: 0.8, sound: 'punch', hitSound: 'heavyPunch', impactScale: 1.3 },
      { name: 'Punho do Incêndio', anim: 'meteor_punch', dur: 0.66, active: [0.32, 0.42], damage: 66, range: 2.1, arc: 90, lunge: 1.2, finisher: 'launch', hitstop: 0.14, element: 'energia', sound: 'heavyPunch', hitSound: 'heavyPunch', impactScale: 2.2 },
    ],
    up: { name: 'Uppercut', anim: 'uppercut', dur: 0.46, active: [0.16, 0.26], damage: 42, range: 1.8, arc: 100, lunge: 0.7, finisher: 'launchHigh', launcher: true, sound: 'punch', hitSound: 'heavyPunch' },
    down: { name: 'Martelo de Punho', anim: 'hammer_v', dur: 0.54, active: [0.22, 0.32], damage: 50, range: 1.9, arc: 120, lunge: 0.6, finisher: 'knockdown', sound: 'heavyPunch', hitSound: 'heavyPunch', impactScale: 1.6 },
    forward: { name: 'Ombrada', anim: 'shoulder_charge', dur: 0.46, active: [0.13, 0.27], damage: 40, range: 2.0, arc: 110, knockback: 3, motion: [{ t: [0, 0.24], fwd: 5, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Passo e Direto', anim: 'cross', dur: 0.52, active: [0.3, 0.38], damage: 34, range: 1.9, arc: 80, knockback: 2.2, iframes: [0, 0.2], motion: [{ t: [0, 0.2], back: 2.2 }], sound: 'punch', hitSound: 'heavyPunch' },
    side: { name: 'Braçada', anim: 'heavy_punch', dur: 0.5, active: [0.15, 0.32], damage: 34, range: 2.1, arc: 260, knockback: 2, motion: [{ t: [0, 0.25], side: 2 }], sound: 'swing', hitSound: 'heavyPunch' },
    air: { name: 'Queda do Grandão', anim: 'hammer_air', dur: 0.46, active: [0.18, 0.34], damage: 40, range: 2.1, arc: 110, knockback: 3.2, slam: 18, vertical: 2.2, sound: 'heavyPunch', hitSound: 'heavyPunch' },
  },

  // □: ONDA DO PUNHO — o soco no ar empurra a aura vermelha para a frente
  ranged: {
    name: 'Onda do Punho',
    type: 'projectile',
    anim: 'wave_punch',
    origin: 'chest',
    windup: 0.3,
    recovery: 0.34,
    count: 1,
    interval: 0,
    damage: 32,
    range: 12,
    speed: 22,
    radius: 0.75,
    spread: 0,
    knockback: 2.2,
    hitstun: 0.5,
    cooldown: 3,
    energyCost: 0,
    visual: 'shockwave',
    color: RED,
    sound: 'heavyPunch',
    hitSound: 'heavyPunch',
  },

  abilities: [
    {
      // MÃOS NUAS (o lutador de rua; o SANGUINÁRIO é matar "com as próprias mãos"): agarra, bate e arremessa — com o
      // adversário no último ponto de existência, o agarrão MATA
      id: 'maosNuas',
      name: 'Mãos Nuas',
      input: 'carga+physical', // △ + ○
      type: 'bareHandsGrab',
      description: 'Agarra (não dá para defender), dá dois socos e arremessa. Com o adversário no ÚLTIMO PONTO DE EXISTÊNCIA (10% da vida ou menos), as mãos nuas MATAM — e o Sanguinário devolve 1 ponto.',
      energyCost: 26,
      cooldown: 13,
      windup: 0.32,
      range: 1.6,
      lunge: 7,
      hold: 1.0,
      blows: 2,
      blowDamage: 22,
      finalDamage: 50,
      final: 'throw',
      blowAnims: ['body_blow', 'hook_r'],
      executeAt: 1,
      color: RED,
      ai: { when: 'opening', max: 2.4 },
    },
    {
      // NA FRENTE DOS AMIGOS (PROPOSTA; o jeito dele: o grandão que fica na frente — a BONDADE da ficha é passiva)
      id: 'naFrente',
      name: 'Na Frente dos Amigos',
      input: 'carga+dodge', // △ + L2
      type: 'selfBuff',
      buffType: 'kindness',
      label: 'NA FRENTE DOS AMIGOS',
      anim: 'block_heavy',
      animTime: 0.4,
      description: 'Fica na frente dos amigos: por 7 s recebe 30% menos dano e aguenta 3 golpes sem recuar, quase sem ser empurrado.',
      energyCost: 24,
      cooldown: 18,
      duration: 7,
      takenMult: 0.7,
      armor: 3,
      knockbackTakenMult: 0.4,
      color: RED,
      ai: { when: 'hurt' },
    },
    {
      id: 'agarraoDeRua',
      name: 'Agarrão de Rua',
      input: 'block+jump', // R2 + ×
      type: 'dashStrike',
      description: 'Avança de ombro e passa por cima de quem estiver na frente: quebra a defesa e joga longe.',
      energyCost: 20,
      cooldown: 10,
      anim: 'shoulder_charge',
      windup: 0.3,
      distance: 5.5,
      speed: 19,
      recovery: 0.4,
      range: 2.2,
      damage: 54,
      knockback: 4,
      guardBreak: true,
      hitSound: 'heavyPunch',
      color: RED,
    },
    {
      id: 'chaoQuebrado',
      name: 'Chão Quebrado',
      input: 'block+carga', // R2 + △
      type: 'stompQuake',
      description: 'Desce as duas manoplas no chão: a onda vermelha derruba quem estiver em volta.',
      energyCost: 22,
      cooldown: 12,
      duration: 0.8,
      impact: 0.45,
      radius: 3.6,
      damage: 36,
      armorMax: 60,
      color: RED,
    },
  ],

  // BRIGA DE RUA (o lutador de rua): agarra o adversário, ergue e bate três vezes no chão; se derrubar com as mãos, o
  // Sanguinário devolve o ponto
  special: {
    name: 'Briga de Rua',
    banner: 'Obrigado por tudo.',
    type: 'streetBrawl',
    energyCost: 50,
    cooldown: 14,
    range: 9,
    damage: 250,
    color: RED,
    sound: 'specialStart',
  },

  awakening: {
    name: 'Memória Revivida',
    banner: 'O Guerreiro',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ability'], cdRate: 1.15, speedMult: 1.05, aura: 'flame', color: RED, heal: 0.12,
  },

  passives: [
    { type: 'sanguinario' }, // SANGUINÁRIO (a ficha): derrubar alguém ou matar uma entidade com as mãos devolve 1 ponto de existência
    { type: 'bondade', mult: 1.2 }, // BONDADE (a ficha: num 2 contra 2, +1 dado): com uma assistência dele em campo, bate 20% mais
    { type: 'fireScars', fire: 0.6, energia: 0.85 }, // CICATRIZES DO INCÊNDIO (PROPOSTA): não pega fogo; resiste a fogo e Energia
    { type: 'thickSkin' }, // o grandão: empurrado menos, a defesa gasta menos
  ],
};
