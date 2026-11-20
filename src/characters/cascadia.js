// CASCADIA (id: cascadia) — ORDO CALAMITAS (Calamidade, 67 d.C.; personagem do mestre). Wiki "Cascadia": guerreira
// antiga da Ordo e MÃE DE CAESAR; gentil com a Amalia, sem nenhuma paciência com a Celestine e desesperada nos jogos do
// Amphitruo (morreu pela flecha da Amalia). Mulher de aspecto CANSADO, cabelo loiro LONGO, armadura com panos e o
// cachecol; nas memórias revividas, a aura AZUL e os olhos azuis. Arma: DUAS LÂMINAS — uma CURVA (o khopesh) e uma RETA.
// Nenhuma habilidade dela foi revelada: TODO o kit abaixo é PROPOSTA, puxado da personalidade e das duas lâminas. Fala:
// "Não lembro de ter perguntado, Celestine.". Modelo próprio do Blender (public/models/cascadia.glb) + as lâminas em
// código (models/ordoWeapons.js → khopesh, straightSword).
const BLUE = 0x4ab4ff;
const STEEL = 0xb8bcc2;

export default {
  id: 'cascadia',
  name: 'CASCADIA',
  model: 'cascadia',
  color: '#4ab4ff',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: BLUE,
  info: {
    weapon: 'O khopesh curvo e a espada reta',
    style: 'A veterana das duas lâminas: o gancho do khopesh puxa a guarda, a espada reta entra no buraco',
    identity: 'A guerreira mais antiga da Ordo Calamitas, mãe de Caesar — cansada de tudo, principalmente da Celestine',
    tagline: 'Não lembro de ter perguntado, Celestine.',
  },
  stats: { moveSpeed: 7.8, attackSpeed: 1.06 },
  anims: { idle: 'idle_dual', run: 'run', charge: 'charge_dual', victory: 'vic_cascadia', block: 'block_weapon' },
  chargeFx: { style: 'default', color: BLUE },
  dodge: { style: 'default', distance: 5 },

  melee: {
    name: 'Khopesh e Espada',
    strikes: [
      { name: 'Gancho do Khopesh', anim: 'dual_r', dur: 0.28, active: [0.09, 0.16], damage: 23, range: 2.0, arc: 120, knockback: 0.6, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: 0.1 } },
      { name: 'Espada Reta', anim: 'dual_l', dur: 0.26, active: [0.08, 0.15], damage: 21, range: 2.1, arc: 110, knockback: 0.6, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, flip: true } },
      { name: 'Tesoura', anim: 'dual_cross', dur: 0.34, actives: [[0.1, 0.16], [0.19, 0.25]], damage: 17, range: 2.0, arc: 130, knockback: 0.8, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL } },
      { name: 'Puxão e Estocada', anim: 'thrust', dur: 0.36, active: [0.13, 0.21], damage: 28, range: 2.3, arc: 60, knockback: 1.0, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Corte da Veterana', anim: 'dual_both', dur: 0.56, active: [0.22, 0.34], damage: 56, range: 2.3, arc: 140, lunge: 1.3, finisher: 'launch', hitstop: 0.1, element: 'energia', sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.7, trail: { color: BLUE, big: true } },
    ],
    up: { name: 'Khopesh de Baixo', anim: 'slash_up', dur: 0.42, active: [0.13, 0.25], damage: 34, range: 2.1, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Corte nas Pernas', anim: 'blade_low_spin', dur: 0.46, active: [0.16, 0.28], damage: 36, range: 2.1, arc: 200, lunge: 0.8, finisher: 'knockdown', sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, wide: true } },
    forward: { name: 'Avanço Cruzado', anim: 'dash_slash', dur: 0.4, active: [0.12, 0.22], damage: 30, range: 2.1, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.2], fwd: 5.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL } },
    back: {
      // a veterana apara com o gancho e revida com a reta
      name: 'Aparar com o Gancho', anim: 'counter_stance', dur: 0.6, active: [0.6, 0.6], damage: 0, range: 0, arc: 0, knockback: 0,
      counter: { window: [0.05, 0.5], riposte: { damage: 50, finisher: 'launch', anim: 'dual_cross', sound: 'slashFinal' } },
      sound: 'blade',
    },
    side: { name: 'Giro das Duas Lâminas', anim: 'dual_spin', dur: 0.4, active: [0.1, 0.24], damage: 28, range: 2.1, arc: 200, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, wide: true } },
    air: { name: 'Lâminas do Alto', anim: 'air_dual', dur: 0.42, active: [0.15, 0.3], damage: 32, range: 2.0, arc: 110, knockback: 3, slam: 15, vertical: 2.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL } },
  },

  // □: KHOPESH ARREMESSADO — o gancho sai girando e volta
  ranged: {
    name: 'Khopesh Arremessado',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'hand',
    hideProp: 'khopesh',
    windup: 0.22,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 30,
    range: 14,
    speed: 26,
    radius: 0.5,
    spread: 0,
    knockback: 1.2,
    hitstun: 0.45,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'khopesh',
    color: STEEL,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      // GANCHO DO KHOPESH (PROPOSTA a partir da arma: a lâmina curva em gancho)
      id: 'gancho',
      name: 'Gancho do Khopesh',
      input: 'carga+physical', // △ + ○
      type: 'khopeshHook',
      description: 'Avança e prende a guarda no gancho do khopesh: a defesa quebra, o alvo é puxado para perto dela e NÃO CONSEGUE DEFENDER por 2 s (não dá para bloquear o gancho).',
      energyCost: 22,
      cooldown: 12,
      windup: 0.28,
      recovery: 0.32,
      lunge: 7,
      range: 3.6,
      damage: 40,
      noGuard: 2,
      color: BLUE,
      ai: { when: 'opening', max: 5 },
    },
    {
      // sem paciência (com a Celestine, com o Amphitruo, com tudo): o ritmo sobe
      id: 'semPaciencia',
      name: 'Sem Paciência',
      input: 'carga+dodge', // △ + L2
      type: 'selfBuff',
      buffType: 'noPatience',
      label: 'SEM PACIÊNCIA',
      anim: 'concentrate',
      animTime: 0.3,
      description: 'Cansou de esperar: por 7 s ataca 20% mais rápido e corre 10% mais rápido.',
      energyCost: 18,
      cooldown: 16,
      duration: 7,
      atkSpeed: 1.2,
      speedMult: 1.1,
      color: BLUE,
    },
    {
      id: 'dancaDuasLaminas',
      name: 'Dança das Duas Lâminas',
      input: 'block+jump', // R2 + ×
      type: 'bladeDance',
      description: 'Gira para trás, intocável no salto, e solta três cortes de energia azul em leque no adversário.',
      energyCost: 22,
      cooldown: 11,
      anim: 'dual_spin',
      duration: 0.7,
      iframes: 0.35,
      back: 8,
      backTime: 0.28,
      throwAt: 0.24,
      interval: 0.06,
      count: 3,
      fan: 0.45,
      element: 'energia',
      projectile: { damage: 20, range: 18, speed: 34, radius: 0.45, knockback: 0.8, hitstun: 0.3, visual: 'shockwave', color: BLUE, hitSound: 'bladeHit', kind: 'ability' },
      color: BLUE,
      ai: { when: 'close' },
    },
    {
      id: 'guerreiraAntiga',
      name: 'Guerreira Antiga',
      input: 'block+carga', // R2 + △
      type: 'heavyProtection',
      label: 'GUERREIRA ANTIGA',
      description: 'Já viu a Ordo nascer: firma as duas lâminas na frente e por 6 s recebe 25% menos dano e aguenta 2 golpes sem recuar.',
      energyCost: 22,
      cooldown: 20,
      duration: 6,
      takenMult: 0.75,
      armor: 2,
      speedMult: 0.95,
      ai: { when: 'hurt' },
    },
  ],

  // POR CAESAR (o filho; PROPOSTA a partir das armas): o khopesh vai como bumerangue, engancha o alvo e volta arrastando-o
  // até a espada reta — a estocada, o corte e as duas lâminas cruzadas
  special: {
    name: 'Por Caesar',
    banner: 'Não lembro de ter perguntado, Celestine.',
    type: 'khopeshBoomerang',
    energyCost: 50,
    cooldown: 14,
    range: 12,
    damage: 250,
    color: BLUE,
    sound: 'specialStart',
  },

  awakening: {
    name: 'Memória Revivida',
    banner: 'Por Caesar',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ability'], cdRate: 1.2, speedMult: 1.08, aura: 'flame', color: BLUE, heal: 0.1,
  },

  passives: [
    // DESESPERADA (nos jogos, a mãe que precisa voltar para o filho): caindo abaixo de 30% pela primeira vez no round, luta
    // com tudo
    { type: 'revenge', below: 0.3, label: 'A MÃE DE CAESAR', mult: 1.3, speedMult: 1.1, duration: 6 },
    // SEM PACIÊNCIA COM A CELESTINE (cânone: o jeito dela com a Celestine; o número é PROPOSTA)
    { type: 'noPatience', vs: ['celestine'], mult: 1.2 },
  ],
};
