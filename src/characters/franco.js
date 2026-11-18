// FRANCO (id: franco) — PSIKOLERA (Hexatombe), o guitarrista da banda. Pedido do dono (2026-11-18): "finalize os
// psikolera, adicione Franco e Alê". Cânone (wiki "Franco", lore/EQUIPES-HEXATOMBE.md): 19 anos, o mais novo da banda;
// ~1,75 m, magro, cabelo RUIVO espetado, QUEIMADURAS pelo corpo e a tatuagem tribal na panturrilha; a camisa de força
// com espinhos na gola, o MANTO CINZA queimado e furado, as caneleiras de metal com espinhos sobre o coturno; a MÁSCARA
// DE GÁS preta com espinhos e lentes vermelhas, o tubo ligado a um TANQUE nas costas. Arma: a GUITARRA LANÇA-CHAMAS (a
// pintura de chamas e o lança-chamas saindo de baixo). A página da wiki não lista habilidade. Morto no ep. 7; a Cindy toca
// a ÚLTIMA NOTA no lança-chamas dele para cremar o Franco e o Alê.
// PROPOSTA de jogo (marcada): TODO o kit (a wiki não dá habilidade): os golpes com a guitarra, a Labareda, o Solo
// Incendiário (o jato da guitarra), o Power Chord, a Microfonia de Guitarra, a Distorção, o especial TORMENTA TARDIA (uma
// das músicas da banda) e o despertar com a máscara de gás.
const BLOOD = 0x8a0c14;
const FIRE = 0xff7a2a; // o fogo do lança-chamas (o mesmo laranja do Tristan e da Última Nota)
const FLAME = 0xffa030;
const HAIR = 0xc8461c;

export default {
  id: 'franco',
  name: 'FRANCO',
  model: 'franco',
  color: '#c8461c', // o cabelo ruivo
  origin: 'PSIKOLERA',
  element: 'sangue',
  energyColor: FIRE,
  info: {
    weapon: 'A Guitarra Lança-Chamas: uma guitarra com pintura de chamas e um lança-chamas saindo de baixo',
    style: 'Garoto do fogo: golpes rápidos com a guitarra, labaredas à distância e o jato de fogo que segura o meio da arena',
    identity: 'O guitarrista da PSIKOLERA, o mais novo da banda',
    tagline: 'Mais alto! MAIS QUENTE!',
  },
  stats: { moveSpeed: 8.6, attackSpeed: 1.08 },
  anims: { idle: 'idle_bass', run: 'run', charge: 'charge', victory: 'vic_franco', block: 'block' },
  chargeFx: { style: 'default', color: FIRE },
  dodge: { style: 'default', distance: 5.2 },
  passives: [
    // FOGO EM GERAL (cânone, bônus de aliado: aplica "Em chamas" com a Guitarra Lança-Chamas): todo golpe de perto acende
    { type: 'fogoEmGeral', burn: { dps: 7, duration: 2.5 } },
  ],

  // A GUITARRA de perto (empunhada como o baixo da Cindy): o corpo em V, o braço, a cabeça pontuda e o bico do fogo
  melee: {
    name: 'Guitarra Lança-Chamas',
    strikes: [
      { name: 'Corpo da guitarra', anim: 'hammer_h', dur: 0.3, active: [0.09, 0.17], damage: 19, range: 1.8, arc: 120, knockback: 0.8, lunge: 1.0, sound: 'swing', hitSound: 'punch', trail: { radius: 1.2, color: FIRE, tilt: 0.1 } },
      { name: 'Braço da guitarra', anim: 'hammer_diag', dur: 0.3, active: [0.09, 0.17], damage: 21, range: 1.9, arc: 110, knockback: 0.9, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', trail: { radius: 1.2, color: FLAME, flip: true } },
      { name: 'Ponta do V', anim: 'thrust', dur: 0.3, active: [0.1, 0.18], damage: 22, range: 2.0, arc: 70, knockback: 1.0, lunge: 1.2, sound: 'swing', hitSound: 'bladeHit', bleed: { dps: 2, duration: 1.5 } },
      { name: 'Bafo do bico', anim: 'shoot_bass', dur: 0.48, active: [0.16, 0.28], damage: 48, range: 2.2, arc: 90, lunge: 1.3, finisher: 'launch', sound: 'explosion', hitSound: 'heavyPunch', impactScale: 1.3, hitstop: 0.09, trail: { radius: 1.3, big: true, color: FIRE } },
    ],
    up: { name: 'Guitarra para cima', anim: 'hammer_up', dur: 0.4, active: [0.12, 0.24], damage: 30, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: FIRE, tilt: -1.2 } },
    down: { name: 'Pisão de coturno', anim: 'stomp', dur: 0.44, active: [0.18, 0.26], damage: 32, range: 1.7, arc: 140, lunge: 0.6, finisher: 'knockdown', sound: 'swing', hitSound: 'kick', groundFx: 'dust', groundScale: 0.5 },
    ground: { name: 'Caneleira de espinhos', anim: 'stomp', dur: 0.46, active: [0.18, 0.28], damage: 28, range: 1.8, arc: 120, motion: [{ t: [0, 0.18], fwd: 1.4, stopClose: true }], otg: true, knockback: 0, sound: 'swing', hitSound: 'bladeHit' },
    forward: { name: 'Mosh', anim: 'shoulder_charge', dur: 0.42, active: [0.12, 0.24], damage: 26, range: 1.9, arc: 110, knockback: 2.2, motion: [{ t: [0, 0.22], fwd: 5.6, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recua e queima', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.36], damage: 26, range: 2.4, arc: 80, knockback: 2.4, iframes: [0, 0.22], motion: [{ t: [0, 0.15], back: 3.0 }], sound: 'explosion', hitSound: 'heavyPunch', trail: { radius: 1.3, color: FIRE } },
    side: { name: 'Giro do manto', anim: 'dual_spin', dur: 0.38, active: [0.1, 0.22], damage: 22, range: 1.9, arc: 200, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.8 }], sound: 'swing', hitSound: 'punch', trail: { radius: 1.3, color: FLAME } },
    air: { name: 'Guitarra do alto', anim: 'hammer_air', dur: 0.4, active: [0.14, 0.3], damage: 30, range: 1.9, arc: 120, knockback: 3, slam: 14, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch', trail: { radius: 1.2, color: FIRE, roll: 1.2 } },
  },

  // □ LABAREDA (PROPOSTA): duas bolas de fogo curtas saindo do bico da guitarra
  ranged: {
    name: 'Labareda',
    type: 'projectile',
    anim: 'shoot_bass',
    windup: 0.2,
    recovery: 0.32,
    count: 2,
    interval: 0.12,
    damage: 16,
    range: 16,
    speed: 30,
    radius: 0.45,
    spread: 0.05,
    knockback: 1.0,
    hitstun: 0.3,
    cooldown: 1.9,
    energyCost: 0,
    visual: 'flameArrow',
    color: FIRE,
    sound: 'smoke',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + □ SOLO INCENDIÁRIO (cânone: o lança-chamas saindo da guitarra; mecânica PROPOSTA, a mesma do Lança-Chamas do
      // Tristan): o jato sai do bico da guitarra ENQUANTO SEGURA (até 2,2 s)
      id: 'soloIncendiario',
      name: 'Solo Incendiário',
      input: 'carga+ranged',
      type: 'flameStream',
      nozzle: 'guitar',
      description: 'Abre o lança-chamas da guitarra e solta o jato em cone à frente ENQUANTO SEGURA (até 2,2 s; soltar apaga). Quem fica no fogo toma dano contínuo e sai QUEIMANDO.',
      energyCost: 22,
      cooldown: 10,
      windup: 0.25,
      duration: 2.2,
      minHold: 0.4,
      recovery: 0.35,
      tick: 0.2,
      damage: 9,
      range: 5.5,
      arc: 50,
      turn: 2.4,
      element: 'energia',
      burn: { dps: 10, duration: 2.5 },
      anim: 'shoot_bass',
      color: FLAME,
      ai: { when: 'near', max: 5 },
    },
    {
      // △ + ○ POWER CHORD (PROPOSTA): bate a guitarra no chão e o acorde estoura em fogo em volta dele
      id: 'powerChord',
      name: 'Power Chord',
      input: 'carga+physical',
      type: 'stompQuake',
      description: 'Bate a guitarra no chão num acorde pesado: a onda de fogo derruba quem estiver em volta dele.',
      energyCost: 20,
      cooldown: 11,
      duration: 0.7,
      impact: 0.4,
      radius: 3.4,
      damage: 34,
      armorMax: 40,
      color: FIRE,
    },
    {
      // △ + L2 GUITARRADA (PROPOSTA): avança e acerta a guitarra inteira na cabeça — atravessa a defesa e faz sangrar
      id: 'guitarrada',
      name: 'Guitarrada',
      input: 'carga+dodge',
      type: 'heavyBlow',
      description: 'Avança e acerta a guitarra inteira de cima para baixo: faz sangrar e quebra a defesa. Se errar, fica exposto.',
      energyCost: 22,
      cooldown: 10,
      anim: 'hammer_v',
      duration: 0.8,
      armorFrom: 0.05,
      impact: 0.46,
      step: 4.6,
      stepTime: 0.28,
      track: true,
      range: 2.3,
      arc: 110,
      damage: 46,
      knockback: 2.0,
      guardCrush: 24,
      bleed: { dps: 3, duration: 2.5 },
      element: 'sangue',
      whiffRecovery: 0.4,
      hitSound: 'heavyPunch',
      color: HAIR,
    },
    {
      // R2 + △ DISTORÇÃO (PROPOSTA; a banda toca até na luta): liga a distorção no máximo — golpes mais rápidos e fortes
      id: 'distorcao',
      name: 'Distorção',
      input: 'block+carga',
      type: 'selfBuff',
      buffType: 'distorcao',
      label: 'DISTORÇÃO',
      anim: 'bass_play',
      animTime: 0.6,
      sound: 'powerUp',
      description: 'Liga a distorção no máximo: por 7 s os golpes físicos e a Labareda saem mais rápidos e mais fortes.',
      energyCost: 22,
      cooldown: 18,
      duration: 7,
      atkSpeed: 1.18,
      damageMult: 1.1,
      affects: ['melee', 'ranged'],
      color: FLAME,
    },
  ],

  // TORMENTA TARDIA (PROPOSTA; o nome é uma música da PSIKOLERA): o solo de guitarra que vira fogo — ele toca, as
  // labaredas sobem, os golpes com a guitarra e o jato final que joga longe
  special: {
    name: 'Tormenta Tardia',
    banner: 'TORMENTA TARDIA!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: FIRE,
    sound: 'specialStart',
    physical: true,
    prepare: {
      anim: 'bass_play', time: 0.9,
      steps: [{ t: 0.3, sound: 'drumCrash' }, { t: 0.55, shout: 'SOLO!!' }],
    },
    dash: { speed: 24, maxTime: 0.6, contact: 1.8 },
    standOff: 1.5,
    hits: [
      { t: 0.12, anim: 'hammer_h', dur: 0.28, share: 0.12, fx: { kind: 'punch', color: FIRE }, sound: 'heavyPunch' },
      { t: 0.42, anim: 'hammer_diag', dur: 0.28, share: 0.12, fx: { kind: 'punch', color: FIRE }, sound: 'heavyPunch' },
      { t: 0.74, anim: 'thrust', dur: 0.28, share: 0.12, fx: { kind: 'stab' }, sound: 'bladeHit', bleed: { dps: 3, duration: 2 } },
      { t: 1.06, anim: 'hammer_up', dur: 0.36, share: 0.14, fx: { kind: 'slash', color: FLAME }, sound: 'explosion', shout: 'MAIS QUENTE!' },
      { t: 1.55, anim: 'shoot_bass', dur: 0.6, share: 0.5, fx: { kind: 'punch', big: true, color: FIRE }, sound: 'explosion', burst: { count: 6, gap: 0.08, sound: 'smoke' }, final: true, shout: 'TORMENTA TARDIA!!' },
    ],
    bannerAt: 0.2,
    length: 2.4,
  },

  // A MÁSCARA DE GÁS (cânone: a máscara preta com espinhos e lentes vermelhas). Como o resto da PSIKOLERA, a máscara
  // só entra no despertar — e fica até o fim do round
  awakening: {
    name: 'Fogo na Plateia',
    banner: 'FOGO NA PLATEIA!',
    type: 'awakenMode',
    anim: 'taunt_roar',
    props: [['maskOn', true]],
    idleAnim: 'idle_wild',
    mult: 1.15, affects: ['melee', 'ranged', 'ability', 'special'], cdRate: 1.3, regen: 2, heal: 0.12, speedMult: 1.06, aura: 'flame', color: FIRE,
  },
};
