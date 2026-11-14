// CINDY LOPES (id: cindy) — PSIKOLERA (Hexatombe), a líder e baixista da banda. Pedido do dono (2026-11-13): o segundo
// membro da equipe, depois do Eloy. Cânone (wiki "Cindy Lopes", lore/EQUIPES-HEXATOMBE.md): Cristiene "Cindy" Lopes, 25
// anos, de Santos; BAIXINHA e delicada, cabelo curto loiro por fora e rosa por dentro; debochada, arrogante, quer ser o
// centro das atenções — e boa líder. COM A MÁSCARA fica animada e descontraída: "não consegue parar de DANÇAR e
// CANTAROLAR, mesmo lutando". Arma: o FUZIL BAIXO (um fuzil acoplado a um baixo, branco, manchado de sangue, com um salto
// alto branco amarrado na ponta) — a única da banda com arma de fogo. Habilidade SILENCIAR (o alvo fica em silêncio
// total, perde a determinação, fica fraco em Força e Agilidade e trêmulo); bônus de aliado TIROS DE AVISO (atira junto
// no mesmo alvo). Cenas: o tiro de cima do palco no fim do show no The Monica Club; as PIRUETAS atirando do alto do
// cânion nos Couraças; a ÚLTIMA NOTA no lança-chamas do Franco.
// PROPOSTA de jogo (marcada): os números, o Tiro do Palco, a Pirueta, a Última Nota, o especial e o despertar.
const BLOOD = 0x8a0c14;
const WHITE = 0xf4f1ea; // o Fuzil Baixo branco
const PINK = 0xe86aa6; // o rosa por dentro do cabelo
const FIRE = 0xff7a2a; // o lança-chamas do Franco (a Última Nota)

export default {
  id: 'cindy',
  name: 'CINDY LOPES',
  model: 'cindy',
  color: '#d6c8a8', // a camisa de força creme
  origin: 'PSIKOLERA',
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'O Fuzil Baixo: um baixo branco manchado de sangue acoplado a um fuzil, com um salto alto amarrado na ponta',
    style: 'Atiradora que dança: rajadas do fuzil, coronhadas com o baixo, piruetas atirando e o grito que cala o adversário',
    identity: 'A líder e baixista da PSIKOLERA',
    tagline: 'Para, Caio! Eu sou baixinha!',
  },
  stats: { moveSpeed: 8.1, attackSpeed: 1.06 },
  anims: { idle: 'idle_bass', run: 'run', charge: 'charge', victory: 'victory', block: 'block' },
  chargeFx: { style: 'default', color: PINK },
  dodge: { style: 'default', distance: 5.4 },
  passives: [
    { type: 'warningShots', chance: 0.35, damage: 8, interval: 1.2 }, // Tiros de Aviso (cânone, bônus de aliado)
  ],

  // O FUZIL BAIXO de perto: o corpo do baixo, a coronha, o SALTO ALTO da ponta e o tiro colado
  melee: {
    name: 'Fuzil Baixo',
    strikes: [
      { name: 'Corpo do baixo', anim: 'hammer_h', dur: 0.3, active: [0.09, 0.17], damage: 18, range: 1.8, arc: 120, knockback: 0.8, lunge: 1.0, sound: 'swing', hitSound: 'punch', trail: { radius: 1.2, color: WHITE, tilt: 0.1 } },
      { name: 'Coronhada', anim: 'hammer_diag', dur: 0.3, active: [0.09, 0.17], damage: 20, range: 1.8, arc: 110, knockback: 0.9, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', trail: { radius: 1.1, color: WHITE, flip: true } },
      { name: 'Salto alto', anim: 'thrust', dur: 0.3, active: [0.1, 0.18], damage: 22, range: 2.0, arc: 70, knockback: 1.0, lunge: 1.2, sound: 'swing', hitSound: 'bladeHit', bleed: { dps: 2, duration: 1.5 } },
      { name: 'Giro', anim: 'dual_spin', dur: 0.36, active: [0.1, 0.22], damage: 20, range: 1.9, arc: 200, knockback: 1.2, lunge: 0.8, sound: 'swing', hitSound: 'punch', trail: { radius: 1.3, color: PINK } },
      { name: 'Tiro colado', anim: 'shoot_bass', dur: 0.46, active: [0.16, 0.26], damage: 46, range: 2.0, arc: 80, lunge: 1.4, finisher: 'launch', element: 'sangue', sound: 'rifleShot', hitSound: 'heavyPunch', impactScale: 1.3, hitstop: 0.09, trail: { radius: 1.2, roll: 0.3, big: true, color: BLOOD } },
    ],
    up: { name: 'Braço do baixo', anim: 'hammer_up', dur: 0.4, active: [0.12, 0.24], damage: 30, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: WHITE, tilt: -1.2 } },
    down: { name: 'Pisão de coturno', anim: 'stomp', dur: 0.44, active: [0.18, 0.26], damage: 32, range: 1.7, arc: 140, lunge: 0.6, finisher: 'knockdown', sound: 'swing', hitSound: 'kick', groundFx: 'dust', groundScale: 0.5 },
    forward: { name: 'Avança dançando', anim: 'dash_slash', dur: 0.4, active: [0.12, 0.22], damage: 26, range: 1.9, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.2], fwd: 5.0, stopClose: true }], sound: 'swing', hitSound: 'punch', trail: { radius: 1.2, color: PINK } },
    back: { name: 'Recua atirando', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.36], damage: 26, range: 2.2, arc: 80, knockback: 2.4, iframes: [0, 0.22], motion: [{ t: [0, 0.15], back: 3.0 }], sound: 'rifleShot', hitSound: 'heavyPunch' },
    side: { name: 'Pirueta curta', anim: 'blade_waltz', dur: 0.4, active: [0.12, 0.24], damage: 22, range: 1.8, arc: 200, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.8 }], sound: 'swing', hitSound: 'punch', trail: { radius: 1.2, color: PINK } },
    air: { name: 'Baixo do alto', anim: 'hammer_air', dur: 0.4, active: [0.14, 0.3], damage: 30, range: 1.9, arc: 120, knockback: 3, slam: 14, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch', trail: { radius: 1.2, color: WHITE, roll: 1.2 } },
  },

  // □ RAJADA (o Fuzil Baixo: a única da banda com arma de fogo): três tiros rápidos
  ranged: {
    name: 'Rajada do Fuzil Baixo',
    type: 'projectile',
    anim: 'shoot_bass',
    windup: 0.2,
    recovery: 0.32,
    count: 3,
    interval: 0.08,
    damage: 15,
    range: 30,
    speed: 70,
    radius: 0.25,
    spread: 0.04,
    knockback: 0.8,
    hitstun: 0.25,
    cooldown: 1.6,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffe0b0,
    sound: 'rifleShot',
    hitSound: 'punch',
  },

  abilities: [
    {
      // △ + ○ SILENCIAR (cânone): grita para o alvo calar — ele treme, perde a determinação e fica fraco
      id: 'silenciar',
      name: 'Silenciar',
      input: 'carga+physical',
      type: 'fearGaze',
      description: 'Grita para o adversário calar a boca: na frente dela, ele treme por um instante e, por 5 s, fica SILENCIADO: não usa habilidades, bate mais fraco e anda mais devagar.',
      energyCost: 26,
      cooldown: 16,
      windup: 0.35,
      recovery: 0.3,
      range: 7,
      arc: 70,
      stun: 0.5,
      silence: { duration: 5, mult: 0.85, speedMult: 0.85 },
      anim: 'taunt_roar',
      sound: 'scream',
      shout: 'SILÊNCIO!',
      element: 'sangue',
      color: PINK,
    },
    {
      // △ + □ TIRO DO PALCO (cânone: do alto do palco do The Monica Club, mata o último do mosh pit com um tiro)
      id: 'tiroDoPalco',
      name: 'Tiro do Palco',
      input: 'carga+ranged',
      type: 'deathShot',
      description: 'Apoia o Fuzil Baixo no ombro como no fim do show e mira com calma: um tiro só, longo e pesado.',
      energyCost: 26,
      cooldown: 14,
      windup: 0.65,
      recovery: 0.35,
      element: 'sangue',
      aimColor: 0xff5a8a,
      projectile: { visual: 'sniper', color: 0xffe0d0, damage: 92, range: 60, speed: 150, radius: 0.32, knockback: 4, hitstun: 0.5, impactScale: 1.6, hitSound: 'heavyPunch' },
    },
    {
      // R2 + △ A DANÇA (cânone: com a máscara ela dança e cantarola até lutando). Pedido do dono (2026-11-14): a
      // PSIKOLERA só VESTE a máscara na transformação (o despertar), não nas habilidades — aqui ela só entra no ritmo
      id: 'mascaraPsikolera',
      name: 'Dança da PSIKOLERA',
      input: 'block+carga',
      type: 'maskForm',
      noMask: true,
      description: 'Entra no ritmo e começa a dançar, cantarolando: por 9 s ela fica mais rápida, os golpes e os tiros saem mais rápidos e mais fortes, e os Tiros de Aviso saem mais vezes.',
      energyCost: 28,
      cooldown: 20,
      duration: 9,
      damageMult: 1.12,
      speedMult: 1.15,
      atkSpeed: 1.2,
      idleAnim: 'idle_dance',
      wild: { anim: 'blade_waltz', shout: 'Lá-lá-lá...' },
      label: 'DANÇA DA PSIKOLERA',
      color: WHITE,
    },
    {
      // △ + L2 PIRUETA NO CÂNION (cânone: do alto de um cânion, atira na Ana e no Chispa dançando e fazendo piruetas)
      id: 'piruetaCanion',
      name: 'Pirueta no Cânion',
      input: 'carga+dodge',
      type: 'bladeDance',
      description: 'Gira para trás numa pirueta, sem tomar dano no começo, e solta um leque de tiros no meio do giro.',
      energyCost: 20,
      cooldown: 10,
      anim: 'blade_waltz',
      duration: 0.7,
      iframes: 0.35,
      back: 9,
      backTime: 0.28,
      count: 5,
      throwAt: 0.3,
      interval: 0.05,
      fan: 0.4,
      shotSound: 'rifleShot',
      element: 'sangue',
      projectile: { name: 'Pirueta no Cânion', type: 'projectile', visual: 'bullet', color: 0xffe0b0, damage: 13, range: 26, speed: 70, radius: 0.25, knockback: 0.8, hitstun: 0.3, hitSound: 'punch' },
      color: PINK,
    },
    {
      // R2 + × ÚLTIMA NOTA (cânone: a última nota tocada no lança-chamas do Franco para cremar o Franco e o Alê)
      id: 'ultimaNota',
      name: 'Última Nota',
      input: 'block+jump',
      type: 'ultimaNota',
      description: 'Toca um acorde grave no Fuzil Baixo: a onda de som sai em cone na frente dela, empurra e deixa o adversário queimando.',
      energyCost: 22,
      cooldown: 12,
      windup: 0.45,
      recovery: 0.3,
      range: 5,
      arc: 80,
      damage: 34,
      knockback: 4.5,
      burn: { dps: 8, duration: 2.5 },
      element: 'sangue',
      color: FIRE,
    },
  ],

  // SHOW NO MONICA CLUB (PROPOSTA; base canônica: o último show da turnê "Pegadas de Sangue" no The Monica Club — o mosh
  // pit e o tiro de cima do palco). Ela toca a linha de baixo e desce dançando no mosh (a máscara só no despertar):
  // coronhadas no ritmo, a pirueta, a estocada do salto alto, a rajada e o tiro final colado
  special: {
    name: 'Show no Monica Club',
    banner: 'SHOW NO MONICA CLUB!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: PINK,
    sound: 'specialStart',
    physical: true,
    prepare: {
      anim: 'bass_play', loop: true, time: 2.1, shots: 'bassSolo',
      // a linha de baixo (Lá, Lá, Dó, Ré... e o grave final)
      notes: [[0.1, 55], [0.34, 55], [0.58, 65], [0.82, 73], [1.06, 55], [1.18, 55], [1.3, 82], [1.78, 49], [1.9, 41]],
      steps: [
        { t: 1.4, anim: 'concentrate', dur: 0.2 },
        { t: 1.55, anim: 'blade_waltz', dur: 0.4, shout: 'Lá-lá-lá...' },
        { t: 1.75, anim: 'bass_play' },
      ],
    },
    dash: { speed: 22, maxTime: 0.6, contact: 1.6 },
    standOff: 1.5,
    hits: [
      { t: 0.15, anim: 'hammer_h', dur: 0.26, share: 0.1, fx: { kind: 'punch' }, sound: 'heavyPunch' },
      { t: 0.42, anim: 'hammer_diag', dur: 0.26, share: 0.1, fx: { kind: 'punch' }, sound: 'heavyPunch', shout: 'DANÇA COMIGO!' },
      { t: 0.72, anim: 'blade_waltz', dur: 0.4, share: 0.1, fx: { kind: 'slash' }, sound: 'swing' },
      { t: 1.1, anim: 'thrust', dur: 0.26, share: 0.12, fx: { kind: 'stab' }, sound: 'bladeHit', bleed: { dps: 3, duration: 2 } },
      { t: 1.4, anim: 'shoot_bass', dur: 0.4, share: 0.13, fx: { kind: 'punch' }, sound: 'rifleShot', burst: { count: 4, gap: 0.07, sound: 'rifleShot' } },
      { t: 1.95, anim: 'shoot_bass', dur: 0.5, share: 0.45, fx: { kind: 'stab', big: true, color: BLOOD }, sound: 'sniper', final: true, shout: 'FIM DO SHOW.', bleed: { dps: 4, duration: 2.5 } },
    ],
    bannerAt: 0.2,
    length: 2.7,
  },

  // PEGADAS DE SANGUE (PROPOSTA; o nome da turnê da banda). Como o Eloy, a PSIKOLERA fica mais forte com as máscaras:
  // no despertar ela põe a MÁSCARA BRANCA e fica com ela até o fim do round — dançando e cantarolando
  awakening: {
    name: 'Pegadas de Sangue',
    banner: 'PEGADAS DE SANGUE!',
    type: 'awakenMode',
    anim: 'blade_waltz',
    props: [['maskOn', true]],
    idleAnim: 'idle_dance',
    mult: 1.15, affects: ['melee', 'ranged', 'ability', 'special'], cdRate: 1.3, regen: 2, heal: 0.12, speedMult: 1.1, aura: 'flame', color: PINK,
  },
};
