// CARINA LEONE (id: carina) — Ordo Realitas (Equipe Abutres, Calamidade). Pedido de 2026-11-02: completar as equipes
// que já existem; a Carina é a primeira das duas que faltam nos Abutres (a outra é o Rubens).
// Wiki "Carina Leone": Conhecimento; Especialista / ARTISTA MARCIAL, 1,80 m. Cabelo castanho comprido com MECHAS CIANO
// que, depois da Marca, ficam DOURADAS e brilham junto com os olhos em combate. Gola alta preta puxada sobre a boca e o
// cabelo preso para lutar; jaqueta de couro cinza com o brasão dos Leone nas costas; calça escura com correntes; botas
// pretas altas; pingente de cabeça de leão; muitas tatuagens (os dois braços, o dragão nas costas).
// Arsenal (cânone): GLOCK SILENCIADA dourada com a cabeça de leão no cabo; NUNCHAKU (azul, depois dourado com "Leone" e
// o brasão); FACAS DE ARREMESSO (matou o Vinicio com uma no olho); o Mangual do pai (depois de "Olhos").
// Habilidades (cânone): Furtividade / Ataque Furtivo; Agilidade; Precognição + Afinidade com Precognição (não é pega
// desprevenida); Fintar; Bater e Reposicionar (o alvo não consegue esquivar nem revidar); Treinada em Atletismo;
// Mercenária; Saque Rápido; Resistência a Energia; Pergaminho da Pertinácia (+PE temporário).
// Fala do cânone: "Todos os Leone vivem dentro de mim!" (a Transformação).
// AS DUAS FORMAS (decisão do dono, 2026-11-02): na forma normal ela luta com o MANGUAL do pai, a GLOCK e as FACAS; na
// Transformação TODOS OS LEONE (forms/carina_leone.js: mechas e olhos dourados, poderes aprimorados) troca para o
// NUNCHAKU DOURADO e ganha o GRIMÓRIO DE ARNALDO, a habilidade em que os olhos ficam brancos e ela fica muito poderosa.
// PROPOSTA de jogo (marcada): as sequências de golpes, o especial Dança dos Leone e os números.
const GOLD = 0xf2c230;
const CYAN = 0x3ad0e0;
const STEEL = 0xd8d4dc;
const FLAIL = 0x9a9aa2; // o rastro da bola do mangual

export default {
  id: 'carina',
  name: 'CARINA LEONE',
  model: 'carina',
  color: '#3ad0e0', // as mechas ciano
  origin: 'Ordo Realitas', // Equipe Abutres
  element: 'conhecimento',
  energyColor: GOLD,
  info: {
    weapon: 'O Mangual de Marco Leone, a Glock Silenciada dourada da cabeça de leão e as facas de arremesso',
    style: 'Artista marcial: lê o golpe antes de ele sair, finta, bate e já aparece do outro lado; transformada, o nunchaku dourado',
    identity: 'A última dos Leone, a mercenária da Equipe Abutres',
    tagline: 'Todos os Leone vivem dentro de mim.',
  },
  stats: { moveSpeed: 8.1, attackSpeed: 1.1 }, // Agilidade (cânone)
  anims: { idle: 'idle_flail', run: 'run', charge: 'charge_fists', victory: 'victory', block: 'block' },
  chargeFx: { style: 'default', color: GOLD },
  dodge: { style: 'default', distance: 5.4 },

  // o MANGUAL DE MARCO LEONE: golpes de bola mais pesados que o nunchaku, alcance maior, a corrente que enrola na guarda
  melee: {
    name: 'Mangual de Marco Leone',
    strikes: [
      { name: 'Bola lateral', anim: 'slash_h', dur: 0.32, active: [0.09, 0.19], damage: 27, range: 2.3, arc: 130, knockback: 1.0, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch', trail: { color: FLAIL, tilt: 0.05 } },
      { name: 'Bola de volta', anim: 'slash_h_back', dur: 0.32, active: [0.09, 0.19], damage: 27, range: 2.3, arc: 130, knockback: 1.0, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', trail: { color: FLAIL, flip: true } },
      { name: 'Bola em diagonal', anim: 'slash_d', dur: 0.34, active: [0.1, 0.2], damage: 27, range: 2.3, arc: 130, knockback: 1.1, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', trail: { color: FLAIL, roll: 0.8 } },
      { name: 'Bola por cima', anim: 'slash_v', dur: 0.44, active: [0.16, 0.26], damage: 38, range: 2.4, arc: 80, knockback: 1.5, lunge: 1.1, guardCrush: 18, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.3, trail: { color: FLAIL, roll: 1.5 } },
      // o fecho: a bola gira em volta do corpo inteiro e lança
      { name: 'Giro do Mangual', anim: 'slash_finisher', dur: 0.62, active: [0.26, 0.4], damage: 58, range: 2.5, arc: 180, lunge: 1.5, finisher: 'launch', sound: 'slashFinal', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.6, hitstop: 0.09, trail: { color: FLAIL, roll: 1.4, big: true } },
    ],
    up: { name: 'Bola de baixo', anim: 'slash_up', dur: 0.46, active: [0.16, 0.26], damage: 40, range: 2.3, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: FLAIL, tilt: -1.3 } },
    down: { name: 'Bola no chão', anim: 'hammer_ground', dur: 0.46, active: [0.18, 0.28], damage: 40, range: 2.3, arc: 110, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', groundFx: 'dust', groundScale: 0.6, trail: { color: FLAIL, roll: 1.5 } },
    forward: { name: 'Avanço do Leão', anim: 'dash_slash', dur: 0.44, active: [0.13, 0.25], damage: 36, range: 2.3, arc: 110, knockback: 1.8, motion: [{ t: [0, 0.25], fwd: 5.6, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: FLAIL, tilt: 0.1 } },
    // FINTAR (cânone): abre a guarda de propósito — quem morder a isca leva o contra-ataque
    back: {
      name: 'Fintar', anim: 'counter_stance', dur: 0.6, active: [0.6, 0.6], damage: 0, range: 0, arc: 0, knockback: 0,
      counter: { window: [0.05, 0.48], riposte: { damage: 48, finisher: 'launch', anim: 'slash_finisher', sound: 'slashFinal' } },
      sound: 'swing',
    },
    side: { name: 'Bola em movimento', anim: 'slash_h', dur: 0.36, active: [0.11, 0.21], damage: 28, range: 2.3, arc: 150, knockback: 1.6, motion: [{ t: [0, 0.2], side: 2.8 }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: FLAIL, tilt: 0.2 } },
    air: { name: 'Bola aérea', anim: 'air_slash', dur: 0.42, active: [0.12, 0.28], damage: 32, range: 2.3, arc: 110, knockback: 2.6, slam: 15, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch', trail: { color: FLAIL, roll: 1.4 } },
  },

  // □ GLOCK SILENCIADA (cânone) com o SAQUE RÁPIDO (cânone): saca, dois tiros abafados e guarda
  ranged: {
    name: 'Glock Silenciada',
    description: 'Saque Rápido: puxa a Glock dourada da cabeça de leão, dois tiros abafados e guarda de novo.',
    type: 'projectile',
    anim: 'point',
    showProp: 'glock',
    hideProp: 'flail+holsterGlock', // saca a Glock do coldre da coxa
    windup: 0.12,
    recovery: 0.26,
    count: 2,
    interval: 0.13,
    damage: 17,
    range: 30,
    speed: 85,
    radius: 0.24,
    spread: 0.02,
    knockback: 0.6,
    hitstun: 0.2,
    cooldown: 2.2,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffe08a,
    sound: 'knifeThrow', // silenciada: o tiro sai abafado
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + □ FACAS DE ARREMESSO (cânone: matou o Vinicio com uma faca no olho)
      id: 'facaNoOlho',
      name: 'Faca no Olho',
      input: 'carga+ranged',
      type: 'throwProjectile',
      // tira a faca do lado esquerdo do cinto e arremessa com a esquerda (o mangual fica na direita)
      anim: 'throw_l',
      hand: 'L',
      showProp: 'throwKnife',
      hideProp: 'beltKnifeH+beltKnifeB',
      windup: 0.2,
      recovery: 0.28,
      sound: 'knifeThrow',
      description: 'Arremessa uma faca na altura dos olhos: quem é acertado fica ATORDOADO por meio segundo e sangra.',
      energyCost: 12,
      cooldown: 7,
      projectile: { damage: 30, range: 26, speed: 46, radius: 0.32, knockback: 0.8, hitstun: 0.4, visual: 'leoneKnife', color: STEEL, hitSound: 'bladeHit', kind: 'ability', onHit: { stun: 0.5, label: 'NO OLHO!', bleed: { dps: 4, duration: 2 } } },
      ai: { when: 'far', min: 2 },
    },
    {
      // △ + ○ BATER E REPOSICIONAR (cânone: o alvo não consegue esquivar nem revidar)
      id: 'baterReposicionar',
      name: 'Bater e Reposicionar',
      input: 'carga+physical',
      type: 'dashStrike',
      description: 'Entra com o mangual quebrando a guarda e, no mesmo movimento, rola para as costas do alvo: ele fica DESPREVENIDO e sem chance de revidar.',
      energyCost: 20,
      cooldown: 10,
      windup: 0.12,
      distance: 6.5,
      speed: 24,
      range: 1.9,
      recovery: 0.28,
      damage: 34,
      knockback: 0.4,
      hitstun: 0.6,
      guardBreak: true,
      reposition: 1.3, // para trás do alvo, a 1,3 m
      color: FLAIL,
      anim: 'dash_slash',
      startSound: 'swing',
      hitSound: 'heavyPunch',
      trailKind: 'smoke',
    },
    {
      // △ + L2 FURTIVIDADE / ATAQUE FURTIVO (cânone): some no canto do olho — humana, não some de verdade
      id: 'furtividade',
      name: 'Furtividade',
      input: 'carga+dodge',
      type: 'shadowVeil',
      description: 'Sai da vista do adversário (3 s): quase invisível e um pouco mais rápida; o primeiro ataque pega o alvo DESPREVENIDO (Ataque Furtivo). Tomar dano a revela.',
      energyCost: 20,
      cooldown: 14,
      duration: 3,
      opacity: 0.2,
      speedMult: 1.1,
      surprise: 0.5,
      color: CYAN,
    },
    {
      // R2 + △ PERGAMINHO DA PERTINÁCIA (cânone: +PE temporário)
      id: 'pergaminhoPertinacia',
      name: 'Pergaminho da Pertinácia',
      input: 'block+carga',
      type: 'selfBuff',
      buffType: 'pertinacia',
      label: 'PERTINÁCIA',
      description: 'Lê o Pergaminho da Pertinácia: recupera 30 de sanidade e as esquivas, e por 6 s aguenta um golpe sem recuar.',
      energyCost: 0,
      energy: 30,
      cooldown: 24,
      duration: 6,
      armor: 1,
      refillDodges: 3,
      color: GOLD,
      ai: { when: 'hurt' },
    },
  ],

  // DANÇA DOS LEONE (PROPOSTA): entra com o mangual, abre a guarda com a corrente e fecha com o giro da bola
  special: {
    name: 'Dança dos Leone',
    banner: 'Pelos Leone!',
    type: 'cinematicCombo',
    physical: true,
    energyCost: 50,
    cooldown: 14,
    color: GOLD,
    sound: 'specialStart',
    prepare: { anim: 'charge_fists', time: 0.4 },
    dash: { speed: 24, maxTime: 0.45, contact: 1.8 },
    hits: [
      { t: 0.45, anim: 'slash_h', dur: 0.24, share: 0.1, fx: { kind: 'punch' }, sound: 'punch', push: 0.05 },
      { t: 0.7, anim: 'slash_h_back', dur: 0.24, share: 0.1, fx: { kind: 'punch', flip: true }, sound: 'punch', push: 0.05 },
      { t: 0.95, anim: 'slash_v', dur: 0.36, share: 0.16, fx: { kind: 'smash' }, sound: 'heavyPunch', push: 0.05 },
      { t: 1.4, anim: 'kick_round', dur: 0.32, share: 0.14, fx: { kind: 'punch' }, sound: 'kick', call: 'GUARDA ABERTA!', push: 0.1 },
      { t: 1.85, anim: 'slash_finisher', dur: 0.55, share: 0.5, fx: { kind: 'smash', big: true }, sound: 'slashFinal', final: true, shout: 'LEONE!', quake: true },
    ],
    endReaction: { knockback: 5, lowLaunch: true },
    bannerAt: 0.2,
    length: 2.8,
  },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △) — cânone: conectada com a Marca, ao entrar em combate os olhos
  // ficam DOURADOS e a mecha ciano vira um dourado brilhante; "Todos os Leone vivem dentro de mim!". Vira a forma
  // TODOS OS LEONE (forms/carina_leone.js) até o fim do round: o nunchaku dourado e o Grimório de Arnaldo
  awakening: {
    name: 'Todos os Leone',
    banner: 'Todos os Leone vivem dentro de mim!',
    type: 'maskTransform',
    scene: 'leone',
    form: 'carina_leone',
    formBanner: 'TODOS OS LEONE',
    swap: [['streakGold', true], ['streakCyan', false]],
    sound: 'fearGaze',
    tint: GOLD,
    color: GOLD,
    duration: 0, // até o fim do round
    bonusHealth: 80,
  },

  passives: [
    { type: 'precognition' }, // Afinidade com Precognição: não é pega desprevenida
    { type: 'elementalAffinity', element: 'energia', mult: 1, resist: 0.8 }, // Resistência a Energia: −20% de dano de Energia
    // Afinidade com Precognição (cânone: +5 de defesa contra ataques de longo alcance): os tiros pegam menos
    { type: 'resistant', kinds: ['ranged'], mult: 0.88 },
    // Mercenária (cânone: 2 PE, duas ações principais no primeiro turno): a 1ª habilidade do round abre 2,5 s em que a
    // próxima não entra em recarga
    { type: 'mercenaria', window: 2.5 },
    // Treinada em Atletismo (cânone: caída, levanta como ação livre): metade do tempo no chão
    { type: 'athleticRise', mult: 0.5 },
  ],
};
