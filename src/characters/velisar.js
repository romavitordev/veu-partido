// VELISAR (id: velisar) — VAMPIROS (Hexatombe). Pedido do dono (2026-11-19): "faça os membros que faltam dos vampiros".
// Cânone (wiki "Velisar"): Welly Sachs, ator do cinema mudo (Lorde Ruthven em "Vampir", 1921), ex-soldado, palhaço de
// circo e animador de plateia; o Conde Orlok da equipe. 2 m, esguio, membros longos, pele vermelho-escura, careca com
// cortes na cabeça, os buracos no lugar dos olhos, orelhas pontudas, dentes longos e o sorriso macabro; se curva de um
// jeito desumano. A túnica amarela até o chão, o sobretudo preto com os babados de asa de morcego azuis e os pingentes
// de metal. Contido, curioso, sádico ("Vocês viram um passarinho passando por aqui?"); o dono do Zéfero (segura a
// corrente). Rituais: OLHAR DA CURIOSIDADE MÓRBIDA (quem evita olhar fica cego; quem olha pode virar servo) e ARMADILHA
// SANGUINÁRIA (a cabeça e o tronco de um corpo explodem em sangue, dentes e navalhas). Matou o Dalmo abrindo as
// entranhas e sugando o sangue; pulou até o telhado e voou na direção da Lena. Afinidade com Sangue, trilha Monstruosa.
// PROPOSTA de jogo (marcada): os números, as navalhas no □, o Voo do Vampiro, o especial O Beijo Sangrento (a peça de
// Brecht que o lançou) e o despertar Lorde Ruthven (o papel do filme).
const BLOOD = 0xa01018;
const CRIMSON = 0xd01c30;
const TEAL = 0x3a8a90;

export default {
  id: 'velisar',
  name: 'VELISAR',
  model: 'velisar',
  color: '#3a8a90', // os babados azuis de asa de morcego
  origin: 'Vampiros',
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'Garras longas, navalhas e os rituais de Sangue',
    style: 'Ator sádico e curioso: garras de longe, o olhar que cega ou escraviza e as armadilhas de sangue',
    identity: 'O cientista dos Vampiros, ex-astro do cinema mudo e dono do Zéfero',
    tagline: 'Vocês viram um passarinho passando por aqui?',
  },
  stats: { moveSpeed: 7.8, attackSpeed: 0.98 },
  anims: { idle: 'idle_velisar', run: 'run', charge: 'db_charge', victory: 'vic_velisar', block: 'db_block' },
  chargeFx: { style: 'default', color: BLOOD },
  dodge: { style: 'default', distance: 5.2 },

  // AS GARRAS dos dedos longos (2 m de braço: alcance maior que o do Raziel, mais lento)
  melee: {
    name: 'Garras Longas',
    strikes: [
      { name: 'Unha comprida', anim: 'db_claw_r', dur: 0.32, active: [0.1, 0.18], damage: 24, range: 2.4, arc: 120, knockback: 0.8, lunge: 1.0, sound: 'blade', hitSound: 'clawHit', trail: { color: TEAL, tilt: 0.1 } },
      { name: 'Unha de volta', anim: 'db_claw_l', dur: 0.32, active: [0.1, 0.18], damage: 24, range: 2.4, arc: 120, knockback: 0.8, lunge: 1.0, sound: 'blade', hitSound: 'clawHit', trail: { color: TEAL, flip: true } },
      { name: 'Abrir as entranhas', anim: 'db_cross', dur: 0.44, actives: [[0.14, 0.2], [0.24, 0.3]], damage: 30, range: 2.4, arc: 130, knockback: 1.0, lunge: 0.9, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
      { name: 'Corte final', anim: 'db_rend', dur: 0.55, active: [0.2, 0.32], damage: 54, range: 2.5, arc: 150, lunge: 1.3, finisher: 'launch', bleed: { dps: 4, duration: 2 }, sound: 'slashFinal', hitSound: 'clawHit', trail: { color: BLOOD, big: true } },
    ],
    up: { name: 'Garra que ergue', anim: 'db_up', dur: 0.42, active: [0.14, 0.24], damage: 36, range: 2.3, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'clawHit', trail: { color: TEAL, tilt: -0.6 } },
    down: { name: 'Curvar-se sobre a presa', anim: 'db_down', dur: 0.52, active: [0.22, 0.32], damage: 42, range: 2.3, arc: 140, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.3 },
    forward: { name: 'Passo desumano', anim: 'db_dash', dur: 0.42, active: [0.12, 0.24], damage: 32, range: 2.4, arc: 110, knockback: 1.8, motion: [{ t: [0, 0.22], fwd: 6.5, stopClose: true }], sound: 'blade', hitSound: 'clawHit', trail: { color: TEAL } },
    back: { name: 'Recua curvado', anim: 'db_cross', dur: 0.5, actives: [[0.26, 0.32], [0.36, 0.42]], damage: 30, range: 2.3, arc: 120, knockback: 1.6, iframes: [0, 0.2], motion: [{ t: [0, 0.16], back: 2.8 }, { t: [0.2, 0.34], fwd: 2.4, stopClose: true }], sound: 'blade', hitSound: 'clawHit' },
    side: { name: 'Babado de morcego', anim: 'db_claw_l', dur: 0.36, active: [0.1, 0.2], damage: 30, range: 2.4, arc: 160, knockback: 1.4, motion: [{ t: [0, 0.22], side: 2.8 }], sound: 'blade', hitSound: 'clawHit', trail: { color: TEAL, wide: true } },
    air: { name: 'O vampiro desce', anim: 'db_air', dur: 0.46, active: [0.14, 0.3], damage: 36, range: 2.3, arc: 120, knockback: 2.8, slam: 16, vertical: 2.4, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
  },

  // □ NAVALHAS (PROPOSTA; base: as navalhas e os dentes da Armadilha Sanguinária): três de uma vez, em leque
  ranged: {
    name: 'Navalhas',
    description: 'Atira três navalhas em leque que fazem sangrar.',
    type: 'projectile',
    anim: 'throw_l',
    windup: 0.18,
    recovery: 0.3,
    count: 3,
    interval: 0.06,
    damage: 13,
    range: 24,
    speed: 40,
    radius: 0.22,
    spread: 0.16,
    knockback: 0.4,
    hitstun: 0.22,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'knife',
    color: TEAL,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
    onHit: { bleed: { dps: 2, duration: 1.5 } },
  },

  abilities: [
    {
      // △ + □ OLHAR DA CURIOSIDADE MÓRBIDA (cânone)
      id: 'olharCuriosidade',
      name: 'Olhar da Curiosidade Mórbida',
      input: 'carga+ranged',
      type: 'morbidGaze',
      ritual: true,
      description: 'Atrai o adversário a olhar no fundo dos buracos dos olhos dele. Quem OLHA cai em transe, parado e sem defesa. Quem EVITA olhar (de costas ou defendendo) fica CEGO. A esquiva escapa.',
      energyCost: 24,
      cooldown: 15,
      windup: 0.5,
      recovery: 0.3,
      range: 10,
      arc: 70,
      damage: 14,
      trance: 1.3,
      blind: 3,
      color: CRIMSON,
    },
    {
      // △ + ○ ARMADILHA SANGUINÁRIA (cânone)
      id: 'armadilhaSanguinaria',
      name: 'Armadilha Sanguinária',
      input: 'carga+physical',
      type: 'bloodTrap',
      ritual: true,
      description: 'Deixa um "presente" no chão: um corpo com a armadilha dentro. Quando o adversário chega perto, a cabeça e o tronco EXPLODEM em sangue, dentes e navalhas, que ferem e fazem sangrar em volta. Só uma por vez.',
      energyCost: 24,
      cooldown: 13,
      distance: 1.8,
      trigger: 1.5,
      radius: 3.2,
      armTime: 0.7,
      life: 18,
      damage: 46,
      knockback: 3,
      bleed: { dps: 4, duration: 3 },
      color: CRIMSON,
    },
    {
      // R2 + △ SUGAR O SANGUE (cânone: abriu as entranhas do Dalmo e sugou o sangue)
      id: 'sugarSangue',
      name: 'Sugar o Sangue',
      input: 'block+carga',
      type: 'vampireBite',
      description: 'Dá o bote, segura a presa e crava os dentes duas vezes: tira vida, faz sangrar e CURA o Velisar com o sangue que suga.',
      energyCost: 22,
      cooldown: 11,
      duration: 1.0,
      step: 8,
      range: 1.9,
      hold: 0.9,
      damage: 26,
      drain: 0.6,
      bleed: { dps: 4, duration: 2.5 },
      color: BLOOD,
    },
    {
      // △ + L2 VOO DO VAMPIRO (cânone: pula até o telhado e voa na direção da Lena; o golpe = PROPOSTA)
      id: 'vooVampiro',
      name: 'Voo do Vampiro',
      input: 'carga+dodge',
      type: 'dashStrike',
      description: 'Salta alto e voa na direção do adversário com as garras na frente: atravessa a arena e rasga em X, fazendo sangrar.',
      energyCost: 20,
      cooldown: 10,
      anim: 'db_dash',
      windup: 0.2,
      distance: 12,
      speed: 30,
      recovery: 0.35,
      range: 1.8,
      aiRange: 12,
      damage: 34,
      knockback: 2.2,
      hitstun: 0.5,
      xSlash: true,
      bleed: { dps: 3, duration: 2 },
      color: TEAL,
      trailKind: 'smoke',
      element: 'sangue',
      startSound: 'blink',
      hitSound: 'clawHit',
    },
  ],

  // O BEIJO SANGRENTO (PROPOSTA; base: a peça de Brecht que o lançou ao estrelato, a morte do Dalmo — garras que abrem
  // as entranhas e a boca que suga — e a Armadilha Sanguinária): avança, rasga, suga e a presa explode em sangue
  special: {
    name: 'O Beijo Sangrento',
    banner: 'Vocês viram um passarinho passando por aqui?',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLOOD,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'vic_velisar', time: 0.6 },
    dash: { speed: 22, maxTime: 0.5, contact: 2.0 },
    hits: [
      { t: 0.6, anim: 'db_claw_r', dur: 0.3, share: 0.1, fx: { kind: 'cross', color: TEAL }, sound: 'clawHit' },
      { t: 0.95, anim: 'db_claw_l', dur: 0.3, share: 0.1, fx: { kind: 'cross', color: TEAL }, sound: 'clawHit' },
      { t: 1.35, anim: 'db_cross', dur: 0.4, share: 0.12, fx: { kind: 'cross', color: CRIMSON }, sound: 'clawHit', bleed: { dps: 4, duration: 2 }, shout: 'Que curioso...' },
      { t: 1.9, anim: 'raziel_feast', dur: 0.6, share: 0.2, fx: { kind: 'punch', color: BLOOD }, sound: 'clawHit', victimAnim: 'stun', drain: 0.8, gore: true, stream: true },
      { t: 2.7, anim: 'db_rend', dur: 0.6, share: 0.48, fx: { kind: 'cross', big: true, color: BLOOD, color2: CRIMSON }, sound: 'slashFinal', final: true, shout: 'Um presente.' },
    ],
    bannerAt: 0.2,
    length: 3.6,
  },

  // LORDE RUTHVEN (PROPOSTA; cânone: o papel do filme "Vampir" — depois dele, Welly ficou cada vez mais parecido com o
  // personagem): mais rápido, mais forte e as recargas andam mais depressa
  awakening: {
    name: 'Lorde Ruthven',
    banner: 'Velisar deixa a vida como o cinema mudo.',
    type: 'awakenMode',
    mult: 1.12, affects: ['melee', 'ability', 'special'], cdRate: 1.35, regen: 2, heal: 0.08, speedMult: 1.12, aura: 'flame', color: TEAL,
  },

  passives: [
    { type: 'elementalAffinity', element: 'sangue', mult: 1.1, resist: 0.85 }, // Afinidade com Sangue (trilha Monstruosa)
    { type: 'bloodAffinity' }, // rituais de Sangue sem ingrediente
    { type: 'lifesteal', ratio: 0.04 },
  ],
};
