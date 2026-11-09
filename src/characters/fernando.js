// FERNANDO CARVALHO (id: fernando) — Ordo Realitas (Equipe Brasa e Força D, Desconjuração). Pedido do dono (2026-11-02):
// o casal Carvalho é UM lutador com DUAS fichas — Fernando e Luciano — e a troca entre os dois é uma habilidade com o
// nome do outro. A ficha do Luciano é a forma forms/luciano.js.
// Cânone (wiki "Fernando Carvalho" e "Luciano Carvalho"; HQ Desconjuração Pt. 1): o cantor Fernando, à beira da morte,
// passou a viver no CORPO do marido, o ex-militar Luciano (o ritual de Leonardo Gomes e Dante). Os dois dividem o corpo:
// o Fernando fica no controle nos momentos calmos; quando ele se apavora, os olhos ficam AMARELOS e o LUCIANO assume.
// Olhos ROSA = Fernando. Gentil, sensível, medroso e ansioso; toma calmantes para o Luciano não vir à tona; músico (o
// álbum "Pote de Vidro", o violão). Foi REJEITADO pelo Outro Lado (não faz rituais) — só o Luciano aprendeu a Reação.
// Arsenal do casal: M4 com lanterna, Glock 17 e canivete. Fala do cânone: "Você nunca perde tudo se você tiver você
// mesmo, se você tiver esperança e (...) ter algum motivo pra lutar."
// PROPOSTA de jogo (marcada): as sequências do canivete, a Lanterna, a Canção do Pote de Vidro, o especial LuciFer (o
// nome é o apelido canônico do casal), o despertar, a troca automática e os números. Elemento Energia: o do corpo (a
// Reação do Luciano) — o Fernando em si não tem ritual.
const PINK = 0xff6ab8;
const YELLOW = 0xe8b818;

export default {
  id: 'fernando',
  name: 'FERNANDO CARVALHO',
  model: 'fernando',
  color: '#ff6ab8', // os olhos rosa de quando o Fernando está no controle
  // falas marcadas "(olhos amarelos)" são do Luciano: a legenda mostra o nome dele (game/Match.js). Apelidos (wiki):
  // o Luciano chama o marido de "Fê" ou "meu amor"; o Fernando chama o Luciano de "Lu", "querido", "gatão", "meu amor"
  altSpeaker: { tag: '(olhos amarelos)', name: 'LUCIANO CARVALHO', color: '#e8b818' },
  origin: 'Ordo Realitas', // Equipe Brasa e Força D
  element: 'energia',
  energyColor: PINK,
  info: {
    weapon: 'O canivete e a Glock 17; quando o Luciano assume, a M4',
    style: 'Leve e defensivo: canivete rápido, a Glock no □, se acalma e se cura; quando aperta, chama o marido e o kit vira o do Luciano',
    identity: 'O cantor que divide o corpo com o marido, o Luciano',
    tagline: 'Você nunca perde tudo se tiver algum motivo pra lutar.',
  },
  stats: { moveSpeed: 8.5, attackSpeed: 1.06 },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'default', color: PINK },
  dodge: { style: 'default', distance: 5.6 }, // ele foge do perigo: a esquiva vai mais longe

  // o CANIVETE: cortes curtos e defensivos (cânone: o Fernando "sabe que é fraco" e evita o contato)
  melee: {
    name: 'Canivete',
    strikes: [
      { name: 'Corte nervoso', anim: 'knife_1', dur: 0.28, active: [0.09, 0.16], damage: 20, range: 1.5, arc: 110, knockback: 1.0, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.0, tilt: 0.1 } },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.28, active: [0.09, 0.16], damage: 20, range: 1.5, arc: 110, knockback: 1.0, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.0, tilt: -0.1, flip: true } },
      { name: 'Empurrão', anim: 'shove', dur: 0.34, active: [0.11, 0.2], damage: 22, range: 1.8, arc: 100, knockback: 2.2, lunge: 0.8, sound: 'swing', hitSound: 'punch' },
      { name: 'Fica longe!', anim: 'knife_final', dur: 0.44, active: [0.15, 0.26], damage: 46, range: 1.8, arc: 80, lunge: 1.8, finisher: 'launch', sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 0.3, big: true, color: PINK } },
    ],
    up: { name: 'Corte para cima', anim: 'slash_up', dur: 0.4, active: [0.12, 0.24], damage: 30, range: 1.7, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: PINK, tilt: -1.2 } },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.42, active: [0.15, 0.25], damage: 34, range: 1.8, arc: 130, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Avanço com medo', anim: 'dash_slash', dur: 0.4, active: [0.12, 0.22], damage: 28, range: 1.8, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.2], fwd: 4.2, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: 0.1 } },
    // recua (ele quer distância do perigo) e corta na volta
    back: { name: 'Recua e corta', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 32, range: 1.7, arc: 100, knockback: 2.6, iframes: [0, 0.22], motion: [{ t: [0, 0.15], back: 2.8 }, { t: [0.18, 0.32], fwd: 2.0, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: -0.2 } },
    side: { name: 'Corte de lado', anim: 'knife_2', dur: 0.3, active: [0.08, 0.16], damage: 22, range: 1.6, arc: 130, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, flip: true } },
    air: { name: 'Corte aéreo', anim: 'air_knife', dur: 0.36, active: [0.12, 0.28], damage: 28, range: 1.7, arc: 110, knockback: 3, slam: 14, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 1.2 } },
  },

  // □ GLOCK 17 (cânone, o arsenal do casal): dois tiros e volta para o canivete
  ranged: {
    name: 'Glock 17',
    description: 'Puxa a Glock 17, dois tiros e volta para o canivete.',
    type: 'projectile',
    anim: 'point',
    showProp: 'glock',
    hideProp: 'knife',
    windup: 0.12,
    recovery: 0.26,
    count: 2,
    interval: 0.14,
    damage: 15,
    range: 28,
    speed: 82,
    radius: 0.24,
    spread: 0.03,
    knockback: 0.6,
    hitstun: 0.2,
    cooldown: 2.0,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffe08a,
    sound: 'm4',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + L2 "LUCIANO" (pedido do dono; cânone: quando o Fernando se apavora, os olhos ficam amarelos e o Luciano
      // assume o corpo). Troca o modelo e o kit na hora, sem gastar a barra; a vida é a mesma (o corpo é um só)
      id: 'luciano',
      name: 'Luciano',
      input: 'carga+dodge',
      type: 'partnerSwap',
      to: 'luciano',
      description: 'O Fernando se apavora, os olhos ficam AMARELOS e o Luciano assume o corpo: o kit vira o do Luciano na hora (a vida é a mesma). No Luciano, a habilidade "Fernando" troca de volta.',
      energyCost: 0,
      cooldown: 8,
      pairWith: 'fernando',
      color: YELLOW,
      shout: 'OS OLHOS FICAM AMARELOS',
      grace: 0.25,
      ai: { when: 'hurt' },
    },
    {
      // R2 + △ CALMANTES (PROPOSTA; base canônica: o Fernando toma calmantes para se acalmar e o Luciano não vir à tona)
      id: 'calmantes',
      name: 'Calmantes',
      input: 'block+carga',
      type: 'healOverTime',
      description: 'Toma os calmantes e respira fundo: recupera vida por 3 s (mais se ficar parado). Apanhar no meio não cancela.',
      energyCost: 22,
      cooldown: 20,
      heal: 140,
      duration: 3,
      stillBonus: 1.3,
      style: 'mist',
      color: PINK,
      ai: { when: 'hurt' },
    },
    {
      // △ + □ LANTERNA (PROPOSTA; base canônica: a miniatura oficial do Fernando com a lanterna, e a lanterna acoplada
      // na M4 do casal): o facho de luz na cara do adversário
      id: 'lanterna',
      name: 'Lanterna',
      input: 'carga+ranged',
      type: 'photoFlash',
      description: 'Acende a lanterna na cara do adversário: quem estiver de frente e olhando fica CEGO por 1,2 s e ATORDOADO por 0,7 s.',
      energyCost: 16,
      cooldown: 12,
      windup: 0.22,
      step: 1.2,
      range: 8,
      arc: 70,
      lookArc: 110,
      blind: 1.2,
      color: 0xfff4d0,
      ai: { when: 'far', min: 2 },
    },
    {
      // △ + ○ CANÇÃO DO POTE DE VIDRO (PROPOSTA; base canônica: o primeiro álbum do Fernando, "Pote de Vidro"; o
      // cantor cantarola para não entrar em pânico e aguenta firme)
      id: 'poteDeVidro',
      name: 'Canção do Pote de Vidro',
      input: 'carga+physical',
      type: 'selfBuff',
      buffType: 'poteDeVidro',
      label: 'POTE DE VIDRO',
      anim: 'concentrate',
      description: 'Cantarola a música do primeiro álbum para não entrar em pânico: por 5 s recebe 30% menos dano e não recua com golpes leves.',
      energyCost: 20,
      cooldown: 18,
      duration: 5,
      takenMult: 0.7,
      armor: 2,
      color: PINK,
      sound: 'ready',
      ai: { when: 'hurt' },
    },
  ],

  // LUCIFER (PROPOSTA; o nome é o apelido canônico do casal — Luciano + Fernando): o Fernando corta duas vezes, se
  // apavora, os olhos ficam amarelos e o LUCIANO toma o corpo no meio do combo — saca a Glock, descarrega à queima-roupa
  // e fecha com o chute de militar; no fim os olhos voltam ao rosa
  special: {
    name: 'LuciFer',
    banner: 'Lu... me ajuda.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: PINK,
    sound: 'specialStart',
    prepare: { anim: 'knife_1', time: 0.3 },
    dash: { speed: 24, maxTime: 0.45, contact: 2.0 },
    standOff: 2.0,
    hits: [
      { t: 0.2, anim: 'knife_1', dur: 0.3, share: 0.14, fx: { kind: 'slash' }, sound: 'bladeHit', shout: 'FICA LONGE!' },
      { t: 0.55, anim: 'knife_2', dur: 0.3, share: 0.14, fx: { kind: 'slash', flip: true }, sound: 'bladeHit' },
      { t: 0.95, noHit: true, anim: 'concentrate', dur: 0.4, call: 'OS OLHOS FICAM AMARELOS' },
      { t: 1.4, anim: 'point', dur: 0.55, share: 0.32, fx: { kind: 'punch' }, sound: 'impact', burst: { count: 5, gap: 0.08, sound: 'm4' }, props: [['knife', false], ['glock', true]], shout: 'DEIXA COMIGO.', push: 0.05 },
      { t: 2.15, anim: 'kick_front', dur: 0.45, share: 0.4, fx: { kind: 'punch', big: true }, sound: 'heavyPunch', props: [['glock', false], ['knife', true]], final: true, shout: 'NINGUÉM TOCA NELE.' },
    ],
    bannerAt: 0.2,
    length: 2.9,
  },

  // DESPERTAR (PROPOSTA, pela fala do cânone): "Você nunca perde tudo (...) se tiver algum motivo pra lutar" — o medo
  // passa: até o fim do round ele bate e aguenta mais, se cura aos poucos e as recargas voltam mais rápido
  awakening: {
    name: 'Motivo Pra Lutar',
    banner: 'Você nunca perde tudo... se tiver algum motivo pra lutar.',
    type: 'awakenMode',
    mult: 1.12, affects: ['melee', 'ranged', 'ability'], cdRate: 1.3, regen: 3, heal: 0.1, takenMult: 0.88, speedMult: 1.06, aura: 'flame', color: PINK,
  },

  passives: [
    // QUANDO ELE SE APAVORA, O LUCIANO ASSUME (cânone): a primeira vez no round que a vida cai abaixo de 30%, os olhos
    // ficam amarelos e o Luciano toma o corpo sozinho (a troca não gasta nada)
    { type: 'panicSwap', below: 0.3, to: 'luciano', color: YELLOW },
  ],
};
