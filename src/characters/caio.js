// CAIO TELES (id: caio) — PSIKOLERA (Hexatombe), o vocalista da banda. Pedido do dono (2026-11-17): "adicione um novo
// Psikolera, o vocalista com a mascara de placa de Pare". Cânone (wiki "Caio Teles", lore/EQUIPES-HEXATOMBE.md): 25 anos,
// de São Paulo; alto e robusto, o macacão de camisa de força cheio de tiras e sangue, a corrente no pescoço, as algemas
// com espinhos; tranquilo e simpático sem a máscara (vive citando o CURSO DE PRIMEIROS SOCORROS de seis meses e zoa a
// altura da Cindy, a namorada secreta) — COM A MÁSCARA DE FERRO (a placa "PARE" alongada) fica agressivo e BARULHENTO,
// gritando o tempo todo. Arma: a ESPADA MICROFONE (a espadona enrolada em arame farpado com o microfone na outra ponta).
// Habilidade BERRÃO (finca a espada e grita no microfone colado ao ouvido do alvo: dano, o alvo SOLTA o que segura;
// tampar os ouvidos reduz o dano); bônus de aliado BARULHEIRA (o grito tira um dado de ataque de quem ataca os aliados)
// e, como desertor, CORTE NA JUGULAR (+5 de dano mesmo se errar). Cenas: pula primeiro no portal do The Monica Club;
// GRITA para parar o Quibungo no Mercado Central; intercepta o Eloy quando ele se joga na Cindy.
// PROPOSTA de jogo (marcada): os números, a Microfonia (□), os Primeiros Socorros, a Espada Fincada, o especial e o
// despertar.
const BLOOD = 0x8a0c14;
const MIC = 0xd8d8e0; // o brilho da grade do microfone (o rastro dos golpes)
const STOP = 0xd8141c; // o vermelho da placa PARE
const WAVE = 0xf2ece2; // a onda do grito

export default {
  id: 'caio',
  name: 'CAIO TELES',
  model: 'caio',
  color: '#d9d0bb', // o macacão de camisa de força
  origin: 'PSIKOLERA',
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'A Espada Microfone: uma espadona enrolada em arame farpado com um microfone adaptado na outra ponta',
    style: 'Grandalhão barulhento: golpes pesados que sangram, gritos que desarmam e enfraquecem, e o primeiro socorro no meio da briga',
    identity: 'O vocalista da PSIKOLERA',
    tagline: 'EU VOU TOMAR TUDO QUE EU POSSO TER!',
  },
  stats: { moveSpeed: 7.5, attackSpeed: 1.05 },
  anims: { idle: 'idle_hammer', run: 'run', charge: 'charge', victory: 'vic_caio', block: 'block_hammer', blockHeavy: 'block_heavy', dash: 'dash_heavy' },
  chargeFx: { style: 'default', color: STOP },
  dodge: { style: 'default', distance: 4.8 },

  // A ESPADA MICROFONE de perto (cânone: a espadona com arame farpado): golpes pesados; o arame faz sangrar
  melee: {
    name: 'Espada Microfone',
    strikes: [
      { name: 'Lâmina farpada', anim: 'hammer_h', dur: 0.36, active: [0.1, 0.19], damage: 26, range: 2.4, arc: 140, knockback: 1.0, lunge: 1.0, sound: 'swing', hitSound: 'bladeHit', bleed: { dps: 2, duration: 1.5 }, trail: { radius: 1.4, color: BLOOD, tilt: 0.1 } },
      { name: 'Volta da espada', anim: 'hammer_diag', dur: 0.42, active: [0.16, 0.26], damage: 30, range: 2.4, arc: 120, knockback: 1.1, lunge: 1.0, sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.4, color: BLOOD, flip: true } },
      { name: 'Microfone na cara', anim: 'hammer_v', dur: 0.5, active: [0.22, 0.32], damage: 38, range: 2.3, arc: 80, knockback: 1.5, lunge: 1.1, guardCrush: 18, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', trail: { radius: 1.2, color: MIC } },
      { name: 'Refrão', anim: 'hammer_finisher', dur: 0.74, active: [0.32, 0.46], damage: 62, range: 2.5, arc: 170, lunge: 1.5, finisher: 'launch', armor: { from: 0.14, to: 0.32, max: 30 }, bleed: { dps: 3, duration: 2.5 }, sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.3, hitstop: 0.1, trail: { radius: 1.5, big: true, color: BLOOD } },
    ],
    up: { name: 'Espada de baixo', anim: 'hammer_up', dur: 0.48, active: [0.17, 0.27], damage: 36, range: 2.3, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: BLOOD, tilt: -1.2 } },
    down: { name: 'Espada no chão', anim: 'hammer_ground', dur: 0.58, active: [0.23, 0.34], damage: 44, range: 2.3, arc: 100, lunge: 0.9, finisher: 'knockdown', armor: { from: 0.1, to: 0.24, max: 26 }, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', groundFx: 'dust', groundScale: 0.6 },
    ground: { name: 'Pisa e corta', anim: 'hammer_ground', dur: 0.58, active: [0.23, 0.34], damage: 30, range: 2.3, arc: 110, motion: [{ t: [0, 0.22], fwd: 1.5, stopClose: true }], otg: true, knockback: 0, sound: 'swing', hitSound: 'bladeHit' },
    // cânone: ele intercepta o Eloy quando ele se joga na Cindy — entra de ombro na frente
    forward: { name: 'Intercepta', anim: 'shoulder_charge', dur: 0.46, active: [0.12, 0.26], damage: 32, range: 1.9, arc: 110, knockback: 2.4, armor: { from: 0.0, to: 0.24, max: 26 }, motion: [{ t: [0, 0.24], fwd: 6.0, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recua e corta', anim: 'hammer_h', dur: 0.5, active: [0.23, 0.31], damage: 32, range: 2.3, arc: 130, knockback: 2.4, motion: [{ t: [0, 0.14], back: 1.7 }, { t: [0.18, 0.3], fwd: 1.9, stopClose: true }], sound: 'swing', hitSound: 'bladeHit' },
    side: { name: 'Corte rodado', anim: 'hammer_h', dur: 0.46, active: [0.17, 0.26], damage: 30, range: 2.3, arc: 150, knockback: 1.8, motion: [{ t: [0, 0.24], side: 2.4 }], sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.4, color: BLOOD } },
    air: { name: 'Espada do alto', anim: 'hammer_air', dur: 0.5, active: [0.18, 0.34], damage: 38, range: 2.3, arc: 110, knockback: 3, slam: 17, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', trail: { radius: 1.3, color: BLOOD, roll: 1.2 } },
  },

  // □ MICROFONIA (PROPOSTA; cânone: ele grita no microfone da espada): a onda do grito sai em linha e empurra
  ranged: {
    name: 'Microfonia',
    type: 'projectile',
    anim: 'taunt_roar',
    windup: 0.24,
    recovery: 0.34,
    count: 1,
    interval: 0,
    damage: 22,
    range: 13,
    speed: 24,
    radius: 0.7,
    spread: 0,
    knockback: 2.0,
    hitstun: 0.4,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'shockwave',
    color: WAVE,
    element: 'sangue',
    sound: 'scream',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + ○ BERRÃO (cânone): finca a espada e GRITA no microfone colado ao ouvido do alvo — dano, e ele solta a arma.
      // Quem está DEFENDENDO "tampa os ouvidos": leva menos e não solta nada
      id: 'berrao',
      name: 'Berrão',
      input: 'carga+physical',
      type: 'fearGaze',
      description: 'Crava a espada no chão e grita no microfone: o adversário na frente fica ATORDOADO, leva dano e SOLTA A ARMA (fica 4 s sem o ataque à distância). Quem estiver defendendo tampa os ouvidos e leva menos.',
      energyCost: 26,
      cooldown: 14,
      windup: 0.5,
      recovery: 0.6,
      range: 3.2,
      arc: 90,
      damage: 34,
      stun: 1.1, // o golpe que atordoa (dono, 2026-11-17: "a mesma animação, sem cutscene")
      disarm: 4,
      earsCover: 0.4,
      hitLabel: 'BERRÃO!',
      anim: 'caio_berro', // crava a espada e grita (o mesmo começo do Show Final)
      sound: 'scream',
      shout: 'AAAAAAAAH!!',
      element: 'sangue',
      color: STOP,
    },
    {
      // △ + □ BARULHEIRA (cânone, bônus de aliado: o grito tira um dado de ataque de quem ataca os aliados): um grito em
      // volta dele que atrapalha — quem está perto treme e fica batendo mais fraco
      id: 'barulheira',
      name: 'Barulheira',
      input: 'carga+ranged',
      type: 'fearGaze',
      description: 'Solta um grito em volta: quem estiver perto treme por um instante e, por 6 s, bate mais fraco.',
      energyCost: 22,
      cooldown: 16,
      windup: 0.3,
      recovery: 0.3,
      range: 6,
      arc: 360,
      stun: 0.3,
      wither: { duration: 6, mult: 0.75 },
      hitLabel: 'BARULHEIRA',
      anim: 'taunt_roar',
      sound: 'scream',
      shout: 'BARULHEIRA!!',
      element: 'sangue',
      color: WAVE,
    },
    {
      // R2 + △ PRIMEIROS SOCORROS (PROPOSTA; cânone: ele vive citando o curso de primeiros socorros de seis meses)
      id: 'primeirosSocorros',
      name: 'Primeiros Socorros',
      input: 'block+carga',
      type: 'healOverTime',
      description: 'Seis meses de curso: aperta as faixas, estanca o sangue e recupera vida por 2 s.',
      energyCost: 24,
      cooldown: 22,
      heal: 90,
      duration: 2.0,
      cleanse: true,
      style: 'mist',
      color: WAVE,
      ai: { when: 'hurt' },
    },
    {
      // △ + L2 CORTE NA JUGULAR (cânone, bônus do Caio desertor: +5 de dano mesmo se errar): o corte vai no pescoço —
      // sangra, pega de raspão quem esquiva e entra mais fundo em quem já está morrendo
      id: 'corteNaJugular',
      name: 'Corte na Jugular',
      input: 'carga+dodge',
      type: 'heavyBlow',
      description: 'Avança e corta na altura do pescoço: faz sangrar, ainda pega de raspão quem esquivar e, com o adversário de vida baixa, entra mais fundo. Se errar, fica exposto.',
      energyCost: 24,
      cooldown: 11,
      anim: 'hammer_v',
      duration: 0.85,
      armorFrom: 0.05,
      impact: 0.5,
      step: 5,
      stepTime: 0.3,
      track: true,
      range: 2.5,
      arc: 120,
      damage: 52,
      knockback: 1.8,
      bleed: { dps: 4, duration: 3 },
      grazeOnDodge: 0.35,
      lowBonus: { below: 0.3, mult: 1.4, label: 'NA JUGULAR' },
      element: 'sangue',
      whiffRecovery: 0.4,
      hitSound: 'bladeHit',
      color: BLOOD,
    },
    {
      // R2 + × ESPADA FINCADA (PROPOSTA; cânone: o Berrão começa com a espada fincada no chão, e o grito que PAROU o
      // Quibungo no Mercado Central): crava a espada e o grito estoura em volta, derrubando quem estiver perto
      id: 'espadaFincada',
      name: 'Espada Fincada',
      input: 'block+jump',
      type: 'stompQuake',
      description: 'Crava a Espada Microfone no chão e grita: a onda derruba quem estiver em volta dele.',
      energyCost: 20,
      cooldown: 11,
      duration: 0.75,
      impact: 0.42,
      radius: 3.4,
      damage: 32,
      armorMax: 50,
      color: STOP,
    },
  ],

  // SHOW FINAL (PROPOSTA; base canônica: o Berrão e o "EU VOU TOMAR TUDO QUE EU POSSO TER!"). Pedido do dono (2026-11-17):
  // ele CRAVA A ESPADA no chão e GRITA no microfone — o adversário fica ATORDOADO — e logo em seguida arranca a espada e
  // ataca: os cortes farpados, o microfone na cara e o golpe final que joga longe
  special: {
    name: 'Show Final',
    banner: 'SHOW FINAL!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: STOP,
    sound: 'specialStart',
    physical: true,
    prepare: {
      anim: 'caio_berro', time: 1.15,
      steps: [
        { t: 0.42, sound: 'heavyPunch' }, // a espada cravando
        { t: 0.5, scream: { stun: 2.6, label: 'ATORDOADO' }, shout: 'EU VOU TOMAR TUDO QUE EU POSSO TER!!' },
      ],
    },
    dash: { speed: 24, maxTime: 0.6, contact: 1.8 },
    standOff: 1.6,
    hits: [
      { t: 0.12, anim: 'hammer_h', dur: 0.32, share: 0.12, fx: { kind: 'slash' }, sound: 'bladeHit', bleed: { dps: 3, duration: 2 } },
      { t: 0.46, anim: 'hammer_diag', dur: 0.34, share: 0.12, fx: { kind: 'slash' }, sound: 'bladeHit' },
      { t: 0.82, anim: 'hammer_v', dur: 0.4, share: 0.14, fx: { kind: 'punch' }, sound: 'heavyPunch', shout: 'MICROFONE!' },
      { t: 1.25, anim: 'hammer_up', dur: 0.4, share: 0.14, fx: { kind: 'slash' }, sound: 'bladeHit' },
      { t: 1.75, anim: 'hammer_finisher', dur: 0.7, share: 0.48, fx: { kind: 'slash', big: true, color: STOP }, sound: 'slashFinal', final: true, shout: 'THE MONICA CLUB, P#RRA!!!', bleed: { dps: 4, duration: 2.5 } },
    ],
    bannerAt: 0.2,
    length: 2.7,
  },

  // A PLACA PARE (PROPOSTA; cânone: com a máscara ele fica agressivo e barulhento, gritando o tempo todo). Como o resto
  // da PSIKOLERA, a máscara só entra no despertar — e fica até o fim do round
  awakening: {
    name: 'Ninguém Me Para',
    banner: 'NINGUÉM ME PARA!',
    type: 'awakenMode',
    anim: 'taunt_roar',
    props: [['maskOn', true]],
    idleAnim: 'idle_wild',
    mult: 1.15, affects: ['melee', 'ranged', 'ability', 'special'], cdRate: 1.3, regen: 2, heal: 0.12, speedMult: 1.06, aura: 'flame', color: STOP,
  },
};
