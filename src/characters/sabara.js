// SABARA (id: sabara) — VAMPIROS (Hexatombe), a batedora do grupo. Pedido do dono (2026-11-13): o membro novo dos
// Vampiros. Cânone (wiki "Sabara", lore/EQUIPES-HEXATOMBE.md): Fenna, a filha d'O Último Caçador; 1,60 m, os olhos
// arrancados, os dentes pontiagudos, as orelhas pontudas; o sobretudo vermelho cortado em dois, o colete preto, os cintos
// cheios de facas pequenas. Afinidade com SANGUE, trilha Monstruosa. Arsenal: a ESPADA longa (mais letal contra quem
// sangra — hoje com o Aguiar) e a ADAGA CERIMONIAL curva. Habilidades: DANÇA DAS LÂMINAS (gira para trás atirando
// várias adagas) e APARAR E REVIDAR (apara o golpe e revida). Cenas: derruba o Papagaio de surpresa e o PRENDE NO CHÃO
// com várias lâminas; desce do alto, saca espada e faca juntas, faz o Aguiar se AJOELHAR, tira a bandana e o MORDE,
// provando o sangue; contra o Mutilador revida com diversas facas. Arrogante; depois do sangue, quase bestial.
// PROPOSTA de jogo (marcada): os números, a Emboscada, o "De Joelhos!", o especial e o despertar.
const BLOOD = 0xa01018;
const CRIMSON = 0xe02030;
const STEEL = 0xd8dce4;

export default {
  id: 'sabara',
  name: 'SABARA',
  model: 'sabara',
  color: '#9a141c', // o sobretudo vermelho
  origin: 'Vampiros',
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'A espada longa, a adaga cerimonial curva e as facas dos cintos',
    style: 'Esgrima de duas lâminas: apara e revida, joga facas girando para trás e morde quem já está sangrando',
    identity: 'A batedora dos Vampiros, filha d\'O Último Caçador',
    tagline: 'De joelhos.',
  },
  stats: { moveSpeed: 8.3, attackSpeed: 1.12 }, // pequena e rápida
  anims: { idle: 'idle_dual', run: 'run', charge: 'charge_dual', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'default', color: BLOOD },
  dodge: { style: 'default', distance: 5.4 },

  // ESPADA + ADAGA (cânone: ela saca as duas juntas)
  melee: {
    name: 'Espada e Adaga',
    strikes: [
      { name: 'Corte de espada', anim: 'dual_r', dur: 0.26, active: [0.08, 0.15], damage: 21, range: 2.1, arc: 120, knockback: 0.7, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.3, color: STEEL, tilt: 0.1 } },
      { name: 'Adaga curva', anim: 'dual_l', dur: 0.24, active: [0.07, 0.14], damage: 19, range: 1.7, arc: 110, knockback: 0.6, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.0, color: CRIMSON, flip: true } },
      { name: 'Cruzado', anim: 'dual_cross', dur: 0.34, actives: [[0.1, 0.16], [0.19, 0.25]], damage: 17, range: 2.0, arc: 130, knockback: 0.8, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, color: STEEL } },
      { name: 'Estocada no peito', anim: 'thrust', dur: 0.46, active: [0.16, 0.26], damage: 50, range: 2.4, arc: 70, lunge: 1.6, finisher: 'launch', bleed: { dps: 4, duration: 2 }, sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.3, hitstop: 0.09, trail: { radius: 1.3, color: BLOOD, big: true } },
    ],
    up: { name: 'Corte de baixo', anim: 'slash_up', dur: 0.4, active: [0.12, 0.24], damage: 32, range: 2.1, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -1.2 } },
    down: { name: 'Rasteira de lâmina', anim: 'kick_low', dur: 0.42, active: [0.15, 0.25], damage: 34, range: 1.9, arc: 130, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Bote da batedora', anim: 'dash_slash', dur: 0.4, active: [0.12, 0.22], damage: 28, range: 2.1, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.2], fwd: 5.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.3, color: STEEL } },
    // APARAR E REVIDAR (cânone): ergue as lâminas — quem bater na hora leva o contra-ataque
    back: {
      name: 'Aparar e Revidar', anim: 'counter_stance', dur: 0.6, active: [0.6, 0.6], damage: 0, range: 0, arc: 0, knockback: 0,
      counter: { window: [0.05, 0.5], riposte: { damage: 52, finisher: 'launch', anim: 'dual_cross', sound: 'slashFinal' } },
      sound: 'blade',
    },
    side: { name: 'Giro das lâminas', anim: 'dual_spin', dur: 0.38, active: [0.1, 0.22], damage: 26, range: 2.0, arc: 170, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.8 }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.3, color: CRIMSON } },
    air: { name: 'Lâminas do alto', anim: 'air_dual', dur: 0.4, active: [0.14, 0.3], damage: 30, range: 2.0, arc: 110, knockback: 3, slam: 15, vertical: 2.3, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.3, color: STEEL, roll: 1.2 } },
  },

  // □ FACAS DOS CINTOS (cânone: os cintos cheios de facas pequenas; contra o Mutilador revida com diversas facas)
  ranged: {
    name: 'Facas dos Cintos',
    description: 'Puxa as facas pequenas dos cintos e arremessa três seguidas.',
    type: 'projectile',
    anim: 'throw_l',
    showProp: 'throwKnife',
    hideProp: 'dagger',
    windup: 0.14,
    recovery: 0.26,
    count: 3,
    interval: 0.1,
    damage: 14,
    range: 24,
    speed: 48,
    radius: 0.26,
    spread: 0.06,
    knockback: 0.5,
    hitstun: 0.22,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'knife',
    color: STEEL,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      // △ + □ DANÇA DAS LÂMINAS (cânone)
      id: 'dancaLaminas',
      name: 'Dança das Lâminas',
      input: 'carga+ranged',
      type: 'bladeDance',
      description: 'Gira para trás, intocável no salto, e solta um leque de cinco adagas no adversário: cada uma faz sangrar.',
      energyCost: 22,
      cooldown: 10,
      anim: 'dual_spin',
      duration: 0.7,
      iframes: 0.35,
      back: 9,
      backTime: 0.28,
      throwAt: 0.22,
      interval: 0.05,
      count: 5,
      fan: 0.55,
      element: 'sangue',
      projectile: { damage: 14, range: 22, speed: 46, radius: 0.28, knockback: 0.4, hitstun: 0.25, visual: 'knife', color: STEEL, hitSound: 'bladeHit', kind: 'ability', onHit: { bleed: { dps: 3, duration: 2 } } },
      color: CRIMSON,
      ai: { when: 'close' },
    },
    {
      // △ + ○ A MORDIDA (cânone: tira a bandana e morde o Aguiar, saboreando o sangue)
      id: 'mordidaSabara',
      name: 'Mordida',
      input: 'carga+physical',
      type: 'vampireBite',
      description: 'Dá o bote curto e, se alcança, segura pelo pescoço e morde: tira vida, faz sangrar e CURA a Sabara com o sangue que prova.',
      energyCost: 20,
      cooldown: 10,
      duration: 0.95,
      step: 9,
      range: 1.6,
      hold: 0.9,
      damage: 24,
      drain: 0.6,
      bleed: { dps: 4, duration: 2.5 },
      color: BLOOD,
    },
    {
      // △ + L2 EMBOSCADA (cânone: derruba o Papagaio de surpresa e o PRENDE NO CHÃO com várias lâminas; no ep. 4 desce
      // do alto da colina)
      id: 'emboscada',
      name: 'Emboscada',
      input: 'carga+dodge',
      type: 'heavyBlow',
      description: 'Salta por cima do adversário e cai em cima dele cravando as lâminas: o alvo fica PRESO NO CHÃO (atordoado) e sangra. Quem esquiva ainda toma metade.',
      energyCost: 28,
      cooldown: 13,
      anim: 'raziel_pounce',
      duration: 0.95,
      armorFrom: 0.05,
      impact: 0.62,
      step: 10,
      stepTime: 0.32,
      track: true,
      range: 2.5,
      arc: 140,
      damage: 54,
      stun: 1.0,
      knockback: 0.6,
      bleed: { dps: 4, duration: 3 },
      grazeOnDodge: 0.5,
      element: 'sangue',
      whiffRecovery: 0.4,
      hitSound: 'bladeHit',
      color: BLOOD,
    },
    {
      // R2 + △ DE JOELHOS! (cânone: arrogante, exige humilhação — faz o Aguiar se ajoelhar com a espada no pescoço)
      id: 'deJoelhos',
      name: 'De Joelhos!',
      input: 'block+carga',
      type: 'command',
      description: 'Aponta a espada e ordena: o adversário perto cai de JOELHOS por um instante, aberto para o próximo golpe.',
      energyCost: 24,
      cooldown: 15,
      windup: 0.35,
      range: 6,
      orders: ['DE JOELHOS!'],
      stun: 0.9,
      damage: 10,
      element: 'sangue',
      color: BLOOD,
    },
  ],

  // VALSA DE SANGUE (PROPOSTA; base canônica: a Dança das Lâminas e a mordida no pescoço do Aguiar). Ela luta como se
  // dançasse: piruetas na ponta do pé com a espada e a adaga abertas, gira por trás do alvo, corta baixo, volta girando
  // — e no fim crava os dentes no pescoço, bebe e se cura antes da estocada que joga longe.
  special: {
    name: 'Valsa de Sangue',
    banner: 'Dança comigo.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLOOD,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'blade_waltz', time: 0.45, fx: 'bladeGlow' },
    dash: { speed: 26, maxTime: 0.5, contact: 1.7 },
    standOff: 1.5,
    hits: [
      { t: 0.1, anim: 'blade_waltz', dur: 0.5, share: 0.07, fx: { kind: 'slash' }, sound: 'bladeHit' },
      { t: 0.55, anim: 'dual_spin', dur: 0.4, share: 0.07, fx: { kind: 'slash', flip: true }, sound: 'bladeHit' },
      // gira para as costas dele sem parar a dança
      { t: 0.95, anim: 'blade_low_spin', dur: 0.42, share: 0.07, fx: { kind: 'cross', color: CRIMSON }, sound: 'bladeHit', behind: true },
      { t: 1.35, anim: 'dual_cross', dur: 0.3, share: 0.07, fx: { kind: 'cross', color: CRIMSON }, sound: 'bladeHit' },
      { t: 1.65, anim: 'blade_waltz', dur: 0.5, share: 0.08, fx: { kind: 'slash' }, sound: 'bladeHit', behind: true, bleed: { dps: 3, duration: 2.5 } },
      // a mordida: bebe o sangue e se cura (drain)
      { t: 2.2, anim: 'raziel_feast', dur: 0.7, share: 0.16, fx: { kind: 'punch', color: BLOOD }, sound: 'clawHit', victimAnim: 'stun', drain: 1.0, gore: true, stream: true, shout: 'QUE GOSTO BOM...' },
      { t: 3.05, anim: 'thrust', dur: 0.5, share: 0.48, fx: { kind: 'stab', big: true, color: BLOOD }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.2,
    length: 3.8,
  },

  // A FERA (PROPOSTA; cânone: depois de provar sangue fica quase bestial, impulsiva, parte para o corpo a corpo)
  awakening: {
    name: 'Gosto de Sangue',
    banner: 'Gosto de sangue.',
    type: 'awakenMode',
    mult: 1.14, affects: ['melee', 'ability', 'special'], cdRate: 1.3, regen: 2, heal: 0.1, speedMult: 1.08, aura: 'flame', color: CRIMSON,
  },

  passives: [
    { type: 'elementalAffinity', element: 'sangue', mult: 1.1, resist: 0.85 }, // Afinidade com Sangue (trilha Monstruosa)
    { type: 'bleedingPrey', mult: 1.2 }, // a Espada: mais letal contra quem está sangrando (cânone)
    { type: 'lifesteal', ratio: 0.04 }, // o gosto pelo sangue
  ],
};
