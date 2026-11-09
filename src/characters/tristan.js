// TRISTAN MONTEIRO (id: tristan) — Ordo Realitas (Equipe Brasa e Força D, Desconjuração). Cânone (wiki "Tristan
// Monteiro"): Combatente, 29 anos, ex-militar (lutou na Guerra dos Dez Dias com o Luciano), RECRUTADOR da Ordem e mentor
// da Erin; carismático, brincalhão e barulhento — calmo e sóbrio só perto do Senhor Veríssimo, que o treinou desde a
// adolescência e lhe deu o próprio CASACO (a "Jaqueta de Veríssimo", que já passou por vários líderes da Ordem).
// Paranoia/mania: PIROMANIA. Protetor: se jogou na frente da Clarissa. Arsenal: COQUETEL MOLOTOV, LANÇA-CHAMAS com o
// tanque nas costas (a arte promocional; HQ6, o marcador "Cano Dispersante") e a GLOCK com silenciador e lanterna.
// Fala da Clarissa (ep. 15): "Enquanto o espírito que o Tristan levava estivesse vivo, a Ordem estaria viva".
// PROPOSTA de jogo (marcada): os golpes de briga de ex-militar, os números, a Lanterna Tática, o "Na Frente de Todos"
// como estado de proteção, o especial Incendiário, o despertar e o número da Piromania. Elemento ENERGIA (PROPOSTA:
// o fogo e o caos — como a Erin, a pupila dele; o Tristan não faz rituais no cânone).
const FIRE = 0xff7a2a; // o mesmo laranja do fogo do Cristino (cristinoAbilities.js; importar de lá criaria ciclo)
const FLAME = 0xffa030;

export default {
  id: 'tristan',
  name: 'TRISTAN MONTEIRO',
  model: 'tristan',
  color: '#ff7a2a',
  origin: 'Ordo Realitas', // Equipe Brasa e Força D
  element: 'energia',
  energyColor: FIRE,
  info: {
    weapon: 'Lança-chamas, coquetel molotov e a Glock com silenciador e lanterna',
    style: 'Briga de perto como ex-militar e domina o meio da arena com fogo: o molotov deixa o chão queimando, o lança-chamas segura o jato por alguns segundos e a Piromania bate mais em quem está queimando',
    identity: 'O recrutador da Ordem, mentor da Erin, com a jaqueta do Veríssimo nos ombros',
    tagline: 'Se for pra se jogar na frente de alguém, que seja na frente de todos.',
  },
  stats: { moveSpeed: 8.3, attackSpeed: 1.0 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'victory', block: 'block' },
  chargeFx: { style: 'default', color: FIRE },
  dodge: { style: 'default', distance: 5.0 },

  // BRIGA DE EX-MILITAR (PROPOSTA; base canônica: Combatente, a Guerra dos Dez Dias): socos pesados, cotovelada e o chute
  melee: {
    name: 'Briga de Militar',
    strikes: [
      { name: 'Jab', anim: 'jab', dur: 0.26, active: [0.08, 0.15], damage: 22, range: 1.5, arc: 100, knockback: 0.9, lunge: 1.1, sound: 'swing', hitSound: 'punch' },
      { name: 'Direto', anim: 'hook_r', dur: 0.3, active: [0.1, 0.17], damage: 26, range: 1.6, arc: 110, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'punch' },
      { name: 'Cotovelada', anim: 'sway_elbow', dur: 0.32, active: [0.1, 0.18], damage: 28, range: 1.5, arc: 100, knockback: 1.4, lunge: 0.9, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Chute de quartel', anim: 'kick_front', dur: 0.44, active: [0.15, 0.25], damage: 52, range: 1.9, arc: 80, lunge: 1.6, finisher: 'launch', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.3 },
    ],
    up: { name: 'Gancho', anim: 'uppercut', dur: 0.4, active: [0.12, 0.22], damage: 36, range: 1.7, arc: 110, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch' },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.42, active: [0.15, 0.25], damage: 36, range: 1.9, arc: 130, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Ombrada', anim: 'shoulder_bash', dur: 0.42, active: [0.12, 0.24], damage: 34, range: 1.9, arc: 110, knockback: 2.6, motion: [{ t: [0, 0.22], fwd: 5.2, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recua e soca', anim: 'hook_l', dur: 0.48, active: [0.26, 0.34], damage: 32, range: 1.7, arc: 100, knockback: 2.2, iframes: [0, 0.18], motion: [{ t: [0, 0.14], back: 2.4 }, { t: [0.17, 0.3], fwd: 2.2, stopClose: true }], sound: 'swing', hitSound: 'punch' },
    side: { name: 'Chute lateral', anim: 'side_kick', dur: 0.36, active: [0.12, 0.21], damage: 30, range: 1.9, arc: 120, knockback: 1.8, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'swing', hitSound: 'kick' },
    air: { name: 'Chute aéreo', anim: 'air_kick', dur: 0.38, active: [0.12, 0.28], damage: 30, range: 1.8, arc: 110, knockback: 3, slam: 14, vertical: 2.2, sound: 'swing', hitSound: 'kick' },
  },

  // □ GLOCK COM SILENCIADOR (cânone, o arsenal): três tiros abafados
  ranged: {
    name: 'Glock com Silenciador',
    description: 'Puxa a Glock com silenciador: três tiros abafados e volta para os punhos.',
    type: 'projectile',
    anim: 'point',
    showProp: 'glock',
    windup: 0.12,
    recovery: 0.26,
    count: 3,
    interval: 0.13,
    damage: 12,
    range: 28,
    speed: 82,
    radius: 0.24,
    spread: 0.035,
    knockback: 0.5,
    hitstun: 0.18,
    cooldown: 2.2,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffe08a,
    sound: 'm4',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + □ LANÇA-CHAMAS (cânone: o lança-chamas com o tanque nas costas; mecânica PROPOSTA). SEGURÁVEL COM LIMITE
      // (pedido do dono, 2026-11-09): o jato sai enquanto o botão fica apertado e apaga ao soltar, até 2,4 s no máximo
      id: 'lancaChamas',
      name: 'Lança-Chamas',
      input: 'carga+ranged',
      type: 'flameStream',
      description: 'Põe os tanques nas costas e solta o jato de fogo em cone à frente ENQUANTO SEGURA (até 2,4 s; soltar apaga). Quem fica no fogo toma dano contínuo e sai QUEIMANDO.',
      energyCost: 22,
      cooldown: 10,
      windup: 0.3,
      duration: 2.4,
      minHold: 0.4,
      recovery: 0.35,
      tick: 0.2,
      damage: 9,
      range: 5.5,
      arc: 50,
      turn: 2.2,
      element: 'energia',
      burn: { dps: 10, duration: 2.5 },
      anim: 'point',
      color: FLAME,
      ai: { when: 'near', max: 5 },
    },
    {
      // △ + ○ COQUETEL MOLOTOV (cânone, o arsenal; a arte promocional): arremessa a garrafa onde o adversário está —
      // estoura em fogo e deixa o CHÃO QUEIMANDO, como o lampião do Cristino (pedido do dono, 2026-11-09)
      id: 'molotov',
      name: 'Coquetel Molotov',
      input: 'carga+physical',
      type: 'lanternThrow',
      lob: 'molotov',
      description: 'Arremessa o coquetel molotov onde o adversário está: a garrafa estoura em fogo, joga para cima e deixa o chão QUEIMANDO por alguns segundos.',
      energyCost: 18,
      cooldown: 8,
      windup: 0.3,
      recovery: 0.3,
      flight: 0.5,
      range: 14,
      radius: 2.0,
      damage: 48,
      knockback: 3,
      launch: true,
      fire: { radius: 1.9, life: 5, dps: 16 },
      showProp: 'molotov',
      color: FIRE,
      ai: { when: 'far', min: 3 },
    },
    {
      // △ + L2 LANTERNA TÁTICA (PROPOSTA; base canônica: a Glock dele tem LANTERNA): o facho na cara do adversário
      id: 'lanternaTatica',
      name: 'Lanterna Tática',
      input: 'carga+dodge',
      type: 'photoFlash',
      description: 'Acende a lanterna da Glock na cara do adversário: quem estiver de frente e olhando fica CEGO por 1 s e ATORDOADO por 0,6 s.',
      energyCost: 16,
      cooldown: 12,
      windup: 0.2,
      step: 1.0,
      range: 8,
      arc: 70,
      lookArc: 110,
      blind: 1.0,
      flashStun: 0.6,
      color: 0xfff4d0,
      ai: { when: 'far', min: 2 },
    },
    {
      // R2 + △ NA FRENTE DE TODOS (PROPOSTA; base canônica: "se jogar na frente de todos" — a fala da Clarissa; ele se
      // jogou na frente dela). Firma o corpo: por 5 s toma 35% menos dano e não recua com golpes leves
      id: 'naFrenteDeTodos',
      name: 'Na Frente de Todos',
      input: 'block+carga',
      type: 'selfBuff',
      buffType: 'naFrenteDeTodos',
      label: 'NA FRENTE DE TODOS',
      anim: 'concentrate',
      description: 'Firma o corpo como quem se joga na frente dos outros: por 5 s recebe 35% menos dano e não recua com golpes leves.',
      energyCost: 20,
      cooldown: 18,
      duration: 5,
      takenMult: 0.65,
      armor: 2,
      color: FIRE,
      sound: 'ready',
      ai: { when: 'hurt' },
    },
  ],

  // INCENDIÁRIO (PROPOSTA): dois socos, o molotov quebrado na cara e o jato do lança-chamas à queima-roupa
  special: {
    name: 'Incendiário',
    banner: 'Sorria, que é fogo!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: FIRE,
    sound: 'specialStart',
    prepare: { anim: 'jab', time: 0.3 },
    dash: { speed: 24, maxTime: 0.45, contact: 2.0 },
    standOff: 2.0,
    hits: [
      { t: 0.2, anim: 'jab', dur: 0.28, share: 0.12, fx: { kind: 'punch' }, sound: 'punch' },
      { t: 0.5, anim: 'hook_r', dur: 0.3, share: 0.14, fx: { kind: 'punch' }, sound: 'heavyPunch', shout: 'SEGURA ESSA!' },
      { t: 0.9, anim: 'throw_r', dur: 0.4, share: 0.24, fx: { kind: 'punch', big: true, color: FIRE }, sound: 'explosion', props: [['molotov', true]], shout: 'MOLOTOV!' },
      { t: 1.45, anim: 'point', dur: 0.8, share: 0.5, fx: { kind: 'punch', big: true, color: FLAME }, sound: 'explosion', burst: { count: 6, gap: 0.1, sound: 'smoke' }, props: [['molotov', false], ['flameLance', true], ['flameTanks', true]], final: true, shout: 'QUEIMA!' },
    ],
    bannerAt: 0.2,
    length: 2.9,
  },

  // O ESPÍRITO DA ORDEM (PROPOSTA, pela fala da Clarissa: "Enquanto o espírito que o Tristan levava estivesse vivo, a
  // Ordem estaria viva"): até o fim do round bate e aguenta mais, as recargas voltam mais rápido e o fogo dele arde
  awakening: {
    name: 'O Espírito da Ordem',
    banner: 'Enquanto esse espírito estiver vivo, a Ordem está viva.',
    type: 'awakenMode',
    mult: 1.14, affects: ['melee', 'ranged', 'ability'], cdRate: 1.3, regen: 2, heal: 0.08, takenMult: 0.88, speedMult: 1.05, aura: 'flame', color: FIRE,
  },

  passives: [
    // PIROMANIA (cânone: a mania dele; o número é PROPOSTA): bate 15% mais forte em quem está QUEIMANDO
    { type: 'pyromania', mult: 1.15 },
  ],
};
