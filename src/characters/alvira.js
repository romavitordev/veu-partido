// ALVIRA (id: alvira) — VAMPIROS (Hexatombe), A PRIMEIRA VAMPIRA ("Czerwona Demonica"). Pedido do dono (2026-11-18):
// "siga o todo... personagem novo de alguma equipe que falta" — ela fecha os Vampiros com o Raziel e a Sabara.
// Cânone (wiki "Alvira", lore/EQUIPES-HEXATOMBE.md): 1,70 m, pálida, o sorriso enorme de dentes afiados; o cabelo
// vermelho longuíssimo até os joelhos, a franja cobrindo onde ficavam os olhos, as ATADURAS costuradas sobre os olhos
// descendo e enroladas no pescoço; o hábito de freira preto até o chão, as costas à mostra, o véu enorme com as pontas
// rasgadas e as tiras em X; as cruzes de Sangue douradas penduradas no cinto e o diadema com a cruz; os braços
// mutilados e enfaixados; reza com as mãos formando a cruz de Sangue. Arma: o CAJADO DA CRUZ DE SANGUE (haste longa
// de metal vermelho-escuro, duas travessas com espinhos numa ponta e a lança na outra), levado nas costas. Rituais:
// VAMPIRISMO (amaldiçoa um corpo; quem o devora absorve as intenções) e BOLSA DO SANGUE (cura um alvo com o próprio
// sangue, pode tirar do Morrendo). Habilidades: TITEREIRA DE SANGUE (controla quem bebeu o sangue dela; cortar as
// cordas de sangue machuca) e TRANSFERIR SANGUE (agarra um aliado e o cura). Afinidade com Sangue, trilha Monstruosa.
// Calma, mal se mexe, mantém distância; sádica, fala por analogias religiosas. "Quando o sino tocar hoje, você vai
// alcançar a sua liberdade... Você terá sua absolvição." Morre no ep. 9 (Rajada Caótica do Remi).
// PROPOSTA de jogo (marcada): os números, as Hastes de Metal como tiro (cânone: crava varetas de metal no Damir), o
// Vampirismo como marca que cura, o especial Absolvição e o despertar O Sino Tocou.
const BLOOD = 0xa01018;
const CRIMSON = 0xd01c30;
const IRON = 0x6a1018;
const GOLD = 0xe0b040;

export default {
  id: 'alvira',
  name: 'ALVIRA',
  model: 'alvira',
  color: '#b0141e', // o cabelo vermelho
  origin: 'Vampiros',
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'O Cajado da Cruz de Sangue e as hastes de metal',
    style: 'Calma e distante: reza, controla o alvo pelas cordas de sangue e bebe a vida de quem marcou',
    identity: 'A Primeira Vampira, a freira dos Vampiros',
    tagline: 'Você terá sua absolvição.',
  },
  stats: { moveSpeed: 7.1, attackSpeed: 0.96 }, // mal se mexe (cânone); só o Lírio é mais lento
  anims: { idle: 'idle_pray', run: 'run', charge: 'concentrate', victory: 'vic_alvira', block: 'block_hammer', blockHeavy: 'block_heavy' },
  chargeFx: { style: 'default', color: BLOOD },
  dodge: { style: 'default', distance: 5.0 },

  // O CAJADO DA CRUZ DE SANGUE (cânone): as cruzes com espinhos numa ponta, a lança na outra; golpes longos e lentos
  melee: {
    name: 'Cajado da Cruz de Sangue',
    strikes: [
      { name: 'Varrida da cruz', anim: 'hammer_h', dur: 0.4, active: [0.13, 0.22], damage: 28, range: 2.8, arc: 150, knockback: 0.9, lunge: 0.8, sound: 'swing', hitSound: 'bladeHit', trail: { color: IRON, tilt: 0.05, wide: true } },
      { name: 'Volta do cajado', anim: 'hammer_diag', dur: 0.42, active: [0.16, 0.26], damage: 30, range: 2.8, arc: 140, knockback: 1.0, lunge: 0.8, sound: 'swing', hitSound: 'bladeHit', trail: { color: IRON, roll: 0.8 } },
      { name: 'Penitência', anim: 'hammer_v', dur: 0.5, active: [0.22, 0.32], damage: 36, range: 2.9, arc: 80, knockback: 1.4, lunge: 0.9, guardCrush: 14, sound: 'swing', hitSound: 'bladeHit', impactFx: 'smash', impactScale: 1.2, hitstop: 0.07, trail: { color: CRIMSON, roll: 1.55 } },
      { name: 'Lança no peito', anim: 'thrust', dur: 0.6, active: [0.22, 0.34], damage: 56, range: 3.0, arc: 70, lunge: 1.3, finisher: 'launch', bleed: { dps: 4, duration: 2.5 }, element: 'sangue', sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.5, hitstop: 0.1, trail: { color: BLOOD, big: true } },
    ],
    up: { name: 'Cruz que ergue', anim: 'hammer_up', dur: 0.48, active: [0.17, 0.27], damage: 36, range: 2.7, arc: 120, lunge: 0.7, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: IRON, tilt: -1.3 } },
    down: { name: 'Cravar no chão', anim: 'hammer_ground', dur: 0.56, active: [0.22, 0.34], damage: 40, range: 2.7, arc: 100, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactFx: 'smash', impactScale: 1.2, groundFx: 'dust', groundScale: 0.6, hitstop: 0.08 },
    forward: { name: 'Estocada da lança', anim: 'thrust', dur: 0.5, active: [0.2, 0.3], damage: 32, range: 3.1, arc: 60, knockback: 2.0, motion: [{ t: [0, 0.22], fwd: 5.0, stopClose: true }], sound: 'swing', hitSound: 'bladeHit', trail: { color: IRON } },
    back: { name: 'Distância santa', anim: 'hammer_h', dur: 0.48, active: [0.22, 0.3], damage: 30, range: 2.8, arc: 150, knockback: 2.6, motion: [{ t: [0, 0.14], back: 2.2 }], sound: 'swing', hitSound: 'bladeHit', trail: { color: IRON, tilt: 0.05 } },
    side: { name: 'Giro do cajado', anim: 'hammer_h', dur: 0.46, active: [0.15, 0.27], damage: 28, range: 2.9, arc: 300, knockback: 1.7, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'swing', hitSound: 'bladeHit', trail: { color: CRIMSON, wide: true } },
    air: { name: 'A cruz desce', anim: 'hammer_air', dur: 0.48, active: [0.17, 0.33], damage: 34, range: 2.7, arc: 110, knockback: 3, slam: 15, vertical: 2.3, sound: 'swing', hitSound: 'bladeHit', impactFx: 'smash', impactScale: 1.2, trail: { color: IRON, roll: 1.4 } },
  },

  // □ HASTES DE METAL (cânone: crava varetas de metal no Damir; o tiro é PROPOSTA): duas hastes finas, de longe
  ranged: {
    name: 'Hastes de Metal',
    description: 'Arremessa duas hastes finas de metal que atravessam o alvo e o fazem sangrar.',
    type: 'projectile',
    anim: 'throw_l',
    windup: 0.2,
    recovery: 0.3,
    count: 2,
    interval: 0.14,
    damage: 17,
    range: 26,
    speed: 44,
    radius: 0.24,
    spread: 0.04,
    knockback: 0.5,
    hitstun: 0.24,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'metalRod',
    color: BLOOD,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
    onHit: { bleed: { dps: 2, duration: 1.5 } },
  },

  abilities: [
    {
      // △ + □ TITEREIRA DE SANGUE (cânone: controla quem bebeu o sangue dela; cortar as cordas de sangue machuca)
      id: 'titereiraSangue',
      name: 'Titereira de Sangue',
      input: 'carga+ranged',
      type: 'mindControl',
      description: 'Cordas de sangue saem das mãos dela e prendem os pulsos e a cabeça do alvo: ele vem andando até ela sem se defender. Dá para resistir apertando os botões, mas cada puxão nas cordas machuca.',
      energyCost: 30,
      cooldown: 17,
      windup: 0.45,
      recovery: 0.3,
      range: 10,
      arc: 60,
      duration: 2.2,
      walkTo: true,
      noBlock: true,
      struggle: 0.12,
      struggleDamage: 3,
      strings: true,
      buffName: 'MARIONETE',
      notifyText: 'CORDAS DE SANGUE',
      color: CRIMSON,
    },
    {
      // △ + ○ VAMPIRISMO (cânone: o ritual que amaldiçoa um corpo; a marca que cura é PROPOSTA)
      id: 'vampirismo',
      name: 'Vampirismo',
      input: 'carga+physical',
      type: 'vampirismo',
      description: 'Desenha a cruz de sangue no peito do alvo: por 7 s, um terço de todo dano que a Alvira causa nele volta para ela como vida.',
      energyCost: 22,
      cooldown: 16,
      anim: 'cast_up',
      windup: 0.4,
      range: 11,
      arc: 70,
      duration: 7,
      ratio: 0.33,
      damage: 8,
      color: BLOOD,
    },
    {
      // R2 + △ BOLSA DO SANGUE (cânone: cura com o próprio sangue)
      id: 'bolsaSangue',
      name: 'Bolsa do Sangue',
      input: 'block+carga',
      type: 'healOverTime',
      description: 'Abre a bolsa de sangue e bebe: recupera vida por 2,5 s e limpa os efeitos.',
      energyCost: 26,
      cooldown: 22,
      heal: 95,
      duration: 2.5,
      cleanse: true,
      style: 'mist',
      color: BLOOD,
      ai: { when: 'hurt' },
    },
    {
      // △ + L2 O SINO (PROPOSTA; cânone: "Quando o sino tocar hoje..."): bate o cajado no chão e o som do sino
      // paralisa quem está perto
      id: 'sinoAlvira',
      name: 'O Sino',
      input: 'carga+dodge',
      type: 'command',
      description: 'Bate o cajado no chão e o sino toca: o adversário perto fica parado, ouvindo, aberto para o próximo golpe.',
      energyCost: 24,
      cooldown: 14,
      windup: 0.4,
      range: 6.5,
      orders: ['PARE!'],
      stun: 1.0,
      damage: 12,
      element: 'sangue',
      color: GOLD,
    },
  ],

  // ABSOLVIÇÃO (PROPOSTA; base canônica: a fala do sino, as hastes de metal no Damir, as cordas da Titereira e a
  // vampira que bebe sangue). Ela reza, o sino toca, as cordas puxam o alvo, o cajado bate e as hastes atravessam;
  // no fim ela bebe e crava a lança.
  special: {
    name: 'Absolvição',
    banner: 'Você terá sua absolvição.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLOOD,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'concentrate', time: 0.5 },
    dash: { speed: 20, maxTime: 0.55, contact: 2.0 },
    standOff: 1.8,
    hits: [
      { t: 0.1, anim: 'hammer_h', dur: 0.42, share: 0.08, fx: { kind: 'slash', wide: true }, sound: 'bladeHit', shout: 'QUANDO O SINO TOCAR...' },
      { t: 0.6, anim: 'hammer_diag', dur: 0.42, share: 0.08, fx: { kind: 'slash', flip: true }, sound: 'bladeHit' },
      { t: 1.1, anim: 'thrust', dur: 0.4, share: 0.1, fx: { kind: 'stab', color: CRIMSON }, sound: 'bladeHit', bleed: { dps: 3, duration: 2.5 } },
      { t: 1.55, anim: 'hammer_v', dur: 0.5, share: 0.1, fx: { kind: 'cross', color: CRIMSON }, sound: 'bladeHit' },
      // ela bebe (drain): a Primeira Vampira
      { t: 2.15, anim: 'raziel_feast', dur: 0.7, share: 0.16, fx: { kind: 'punch', color: BLOOD }, sound: 'clawHit', victimAnim: 'stun', drain: 2.5, gore: true, stream: true, shout: '...VOCÊ VAI ALCANÇAR A SUA LIBERDADE.' },
      { t: 3.0, anim: 'hammer_finisher', dur: 0.7, share: 0.48, fx: { kind: 'stab', big: true, color: BLOOD }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.2,
    length: 3.9,
  },

  // O SINO TOCOU (PROPOSTA; cânone: a Primeira Vampira, sádica, que cura com o próprio sangue)
  awakening: {
    name: 'O Sino Tocou',
    banner: 'O sino tocou.',
    type: 'awakenMode',
    mult: 1.12, affects: ['melee', 'ability', 'special'], cdRate: 1.3, regen: 2.5, heal: 0.1, speedMult: 1.1, aura: 'flame', color: CRIMSON,
  },

  passives: [
    { type: 'elementalAffinity', element: 'sangue', mult: 1.1, resist: 0.85 }, // Afinidade com Sangue (trilha Monstruosa)
    { type: 'lifesteal', ratio: 0.05 }, // a Primeira Vampira
  ],
};
