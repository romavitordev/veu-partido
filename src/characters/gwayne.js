// GWAYNE (id: gwayne) — A VIGÍLIA (Treb Ciach, Irlanda, 890). Pedido do dono (2026-11-21): os membros da Vigília, cada um
// com a forma normal e a TRANSFORMADA (a fantasia do Samhain). Notas de cânone em lore/A-VIGILIA.md.
// Wiki "Gwayne Ó Doirnáin": intérprete Pedro "Grifo" Ernesto; O FORASTEIRO; Vigilante; 20–21 anos; irmão gêmeo da
// GWYNETH (que virou uma Enraizada); morreu no ep. 3 defendendo a Eileen das Assombrações e virou uma delas.
// Fala: "Esse lugar é minha única chance." Habilidades da ficha: PRONTIDÃO (2 PD), FLECHAS FLAMEJANTES (2 PD, dano de
// fogo), ESQUIVA (Acrobacia, uma vez por rodada) e DEDICADO.
// Visual (cânone): cabelo escuro repartido no meio e a TRANÇA LOIRA do lado esquerdo (piebaldismo) com o pano azulado e a
// conta de espiral; o manto verde quase preto de capuz com o broche penanular dourado; a túnica verde até o joelho sobre
// a camisa marrom; o pano vermelho-xadrez na cintura; a aljava de penas vermelhas; o ARCO RECURVO que era da Gwyneth.
// PROPOSTA de jogo (marcada): o elemento, as sequências de adaga e arco, os números, o especial "A Flecha de Gwyneth" e
// a Transformação "O Morto que Caminha" (forms/gwayne_morto.js).
const FIRE = 0xff7a2a; // as Flechas Flamejantes
const STEEL = 0xd0ccc8;
const BOW = 0x8a5a34;

export default {
  id: 'gwayne',
  name: 'GWAYNE',
  model: 'gwayne',
  color: '#c8a050',
  origin: 'A Vigília',
  element: 'energia', // PROPOSTA (sem afinidade no cânone)
  energyColor: FIRE,
  info: {
    weapon: 'O arco recurvo da Gwyneth, as flechas flamejantes e a adaga',
    style: 'Arqueiro ligeiro: flechas que queimam de longe, a esquiva no tempo certo e a adaga quando chegam perto',
    identity: 'O Forasteiro: o arqueiro da Vigília, que carrega o arco da irmã gêmea',
    tagline: 'Esse lugar é minha única chance.',
  },
  stats: { moveSpeed: 8.2, attackSpeed: 1.06 },
  ai: { style: 'zoner' }, // a CPU luta de longe com ele: é arqueiro
  anims: { idle: 'bow_idle', run: 'run', charge: 'charge', victory: 'vic_gwayne', block: 'block_weapon' },
  chargeFx: { style: 'default', color: FIRE },
  dodge: { style: 'default', distance: 5.6 }, // ESQUIVA (Acrobacia): o rolamento vai mais longe

  // de perto: a ADAGA na direita, o arco como porrete e os joelhos; fecha com a flecha flamejante à queima-roupa
  melee: {
    name: 'Adaga e Arco',
    strikes: [
      { name: 'Corte da Adaga', anim: 'slash_h', dur: 0.26, active: [0.08, 0.16], damage: 24, range: 1.7, arc: 110, knockback: 0.8, lunge: 1.0, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL } },
      { name: 'Golpe do Arco', anim: 'bow_swipe', dur: 0.3, active: [0.11, 0.19], damage: 26, range: 2.0, arc: 120, knockback: 1.0, lunge: 0.9, sound: 'swing', hitSound: 'punch', trail: { color: BOW, tilt: 0.05, flip: true } },
      { name: 'Estocada', anim: 'thrust', dur: 0.3, active: [0.1, 0.18], damage: 28, range: 1.8, arc: 60, knockback: 1.4, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Joelhada', anim: 'knee', dur: 0.36, active: [0.13, 0.22], damage: 30, range: 1.5, arc: 90, knockback: 1.8, lunge: 0.9, guardCrush: 12, hitstop: 0.05, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Flecha à Queima-Roupa', anim: 'bow_shot', dur: 0.6, active: [0.34, 0.44], damage: 56, range: 3.2, arc: 60, lunge: 0.3, finisher: 'launch', hitstop: 0.11, sound: 'sniper', hitSound: 'impact', impactFx: 'ember', impactScale: 1.6, trail: { color: FIRE, wide: true } },
    ],
    up: { name: 'Arco para Cima', anim: 'bow_rise', dur: 0.44, active: [0.16, 0.28], damage: 36, range: 2.0, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'punch', trail: { color: BOW, tilt: -1.3 } },
    down: { name: 'Adaga no Chão', anim: 'knife_final', dur: 0.44, active: [0.15, 0.26], damage: 40, range: 1.8, arc: 120, lunge: 1, finisher: 'knockdown', otg: true, sound: 'swing', hitSound: 'bladeHit', impactScale: 1.3, trail: { color: STEEL, roll: 1.4 } },
    forward: { name: 'Investida do Forasteiro', anim: 'side_kick', dur: 0.42, active: [0.13, 0.24], damage: 34, range: 2.1, arc: 100, knockback: 2.6, motion: [{ t: [0, 0.2], fwd: 4.8, stopClose: true }], sound: 'swing', hitSound: 'kick' },
    back: { name: 'Esquiva e Adaga', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 36, range: 1.8, arc: 100, knockback: 2.2, iframes: [0, 0.24], motion: [{ t: [0, 0.15], back: 2.4 }, { t: [0.18, 0.32], fwd: 2.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, radius: 1.2, tilt: -0.2 } },
    side: { name: 'Giro do Arco', anim: 'bow_spin', dur: 0.46, active: [0.17, 0.34], damage: 30, range: 2.2, arc: 280, knockback: 1.6, motion: [{ t: [0, 0.25], side: 2.4 }], sound: 'swing', hitSound: 'punch', trail: { color: BOW, wide: true } },
    air: { name: 'Adaga do Alto', anim: 'air_knife', dur: 0.42, active: [0.16, 0.3], damage: 32, range: 2.0, arc: 100, knockback: 3, slam: 15, vertical: 2.2, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, tilt: 1.3 } },
  },

  // □ FLECHAS FLAMEJANTES (cânone, a ficha: dano de fogo): a flecha de penas vermelhas acesa — quem leva fica QUEIMANDO
  ranged: {
    name: 'Flecha Flamejante',
    type: 'projectile',
    anim: 'bow_shot',
    origin: 'chest',
    windup: 0.22,
    recovery: 0.18,
    count: 1,
    interval: 0,
    damage: 22,
    range: 28,
    speed: 44,
    radius: 0.32,
    spread: 0,
    knockback: 0.8,
    hitstun: 0.4,
    cooldown: 1.1,
    energyCost: 0,
    visual: 'flameArrow',
    color: FIRE,
    element: 'energia',
    burn: { dps: 8, duration: 2 },
    sound: 'sniper',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + □ FLECHA DE CAÇA (PROPOSTA): a mira longa, a corda até o rosto — a flecha mais forte, queimando forte
      id: 'flechaCaca',
      name: 'Flecha de Caça',
      input: 'carga+ranged',
      type: 'deathShot',
      description: 'Mira com calma e solta a flecha mais forte, acesa: derruba e deixa o alvo QUEIMANDO. A mira deixa ele parado um instante.',
      energyCost: 26,
      cooldown: 13,
      windup: 0.85,
      recovery: 0.3,
      aimAnim: 'bow_aim',
      fireAnim: 'bow_shot',
      aimColor: FIRE,
      element: 'energia',
      projectile: { name: 'Flecha de Caça', type: 'projectile', visual: 'flameArrow', color: FIRE, damage: 74, range: 36, speed: 58, radius: 0.36, knockback: 2.4, hitstun: 0.7, launch: true, hitSound: 'heavyPunch', impactScale: 1.5, burn: { dps: 12, duration: 3 } },
      ai: { when: 'far', min: 6 },
    },
    {
      // △ + ○ SALVA FLAMEJANTE (PROPOSTA, das Flechas Flamejantes): três flechas acesas em leque
      id: 'salvaFlamejante',
      name: 'Salva Flamejante',
      input: 'carga+physical',
      type: 'cursedShots',
      description: 'Três Flechas Flamejantes em leque, uma atrás da outra: cada uma que acerta deixa o alvo QUEIMANDO.',
      energyCost: 22,
      cooldown: 10,
      windup: 0.16,
      count: 3,
      interval: 0.1,
      spread: 14,
      anim: 'bow_shot',
      projectile: { visual: 'flameArrow', color: FIRE, damage: 20, range: 26, speed: 42, radius: 0.3, knockback: 0.6, hitstun: 0.3, element: 'energia', hitSound: 'impact', burn: { dps: 6, duration: 2 } },
    },
    {
      // △ + L2 PRONTIDÃO (cânone, 2 PD): o Vigilante sempre pronto — as esquivas voltam e os golpes saem mais rápido
      id: 'prontidao',
      name: 'Prontidão',
      input: 'carga+dodge',
      type: 'selfBuff',
      buffType: 'prontidao',
      label: 'PRONTIDÃO',
      anim: 'bow_aim',
      animTime: 0.4,
      sound: 'ritual',
      description: 'Fica de prontidão: as esquivas voltam na hora e, por 7 s, ataca e atira mais rápido.',
      energyCost: 18,
      cooldown: 16,
      duration: 7,
      atkSpeed: 1.15,
      refillDodges: 2,
      color: FIRE,
      ai: { when: 'close' },
    },
    {
      // R2 + × ESQUIVA (cânone: Acrobacia, uma vez por rodada): parado e atento, o golpe que chegar na janela passa
      // direto e ele sai de lado
      id: 'esquiva',
      name: 'Esquiva',
      input: 'block+jump',
      type: 'calmEvade',
      label: 'ESQUIVA',
      description: 'Fica atento por um instante: o golpe que chegar nessa janela é esquivado por acrobacia. Precisa de tempo certo; não vale contra especiais.',
      energyCost: 14,
      cooldown: 9,
      window: 0.6,
      color: FIRE,
      ai: { when: 'hurt' },
    },
  ],

  // A FLECHA DE GWYNETH (PROPOSTA; specials/vigiliaSpecials.js → twinArrows): o vulto pálido da irmã gêmea aparece ao
  // lado dele com o mesmo arco; os dois soltam juntos as Flechas Flamejantes que prendem o alvo, e ele fecha com a adaga.
  // "Esse lugar é minha única chance."
  special: {
    name: 'A Flecha de Gwyneth',
    banner: 'Esse lugar é minha única chance.',
    type: 'twinArrows',
    energyCost: 50,
    cooldown: 14,
    range: 30,
    damage: 250,
    color: FIRE,
    ghost: 0xa8c8ff,
    release: 'POR GWYNETH',
    sound: 'specialStart',
  },

  // O MORTO QUE CAMINHA (PROPOSTA: a fantasia do Samhain como Transformação): o crânio de lobo com as presas e as penas
  // vermelhas, a pele de pelo cinza e o poncho esfarrapado; fica assim até o fim do round
  awakening: {
    name: 'O Morto que Caminha',
    banner: 'O Morto que Caminha',
    type: 'maskTransform',
    prop: 'skullMask',
    form: 'gwayne_morto',
    formBanner: 'O MORTO QUE CAMINHA',
    swap: [['pelt', true], ['poncho', true], ['hair', false], ['hoodCowl', false]],
    sound: 'maskOn',
    tint: 0x8aa8d8,
    duration: 0, // até o fim do round
    bonusHealth: 100,
    color: FIRE,
  },

  passives: [
    { type: 'longShot', minDist: 10, mult: 1.08 }, // DEDICADO: de longe, um pouco mais de dano (PROPOSTA)
  ],
};
