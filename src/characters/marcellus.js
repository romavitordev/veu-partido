// MARCELLUS (id: marcellus) — ORDO CALAMITAS (Calamidade, 67 d.C.; personagem do mestre). Wiki "Marcellus": uns 35 anos,
// ANIMADO, morre de medo da Amalia e procura o irmão GALLERIUS. Magro, pele negra, cabelo castanho (cacheado nas
// miniaturas), a armadura medieval; nas memórias revividas, a aura AZUL. Arma: a RAPIEIRA de CABO DOURADO. Morreu nos
// Caixões do Diabo (o Faustus e a Amalia).
// Habilidade da ficha: DUELO (+5 de defesa e de luta contra um adversário só). Fala: "Eu não posso deixar de existir, eu
// tenho que encontrar o meu irmão!". Números, nomes de golpes e o especial: PROPOSTA. Modelo próprio do Blender
// (public/models/marcellus.glb) + a rapieira em código (models/ordoWeapons.js → rapier).
const BLUE = 0x7ab0ff;
const GOLD = 0xd8b04a;
const STEEL = 0xd8dce4;

export default {
  id: 'marcellus',
  name: 'MARCELLUS',
  model: 'marcellus',
  color: '#7ab0ff',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: BLUE,
  info: {
    weapon: 'A rapieira de cabo dourado',
    style: 'O duelista: estocadas que estalam e voltam, a guarda que apara e o contra-ataque no tempo certo',
    identity: 'O duelista animado da Ordo Calamitas, que não pode deixar de existir antes de achar o irmão',
    tagline: 'Eu não posso deixar de existir, eu tenho que encontrar o meu irmão!',
  },
  stats: { moveSpeed: 8.2, attackSpeed: 1.14 },
  anims: { idle: 'arn_guard', run: 'run', charge: 'charge', victory: 'vic_marcellus', block: 'block_weapon' },
  chargeFx: { style: 'default', color: BLUE },
  dodge: { style: 'default', distance: 5.4 },

  melee: {
    name: 'Rapieira',
    // a escola da esgrima: a ponta é a arma, o fio só raspa
    strikes: [
      { name: 'Estocada', anim: 'thrust', dur: 0.24, active: [0.08, 0.14], damage: 20, range: 2.4, arc: 40, knockback: 0.5, lunge: 1.1, sound: 'swing', hitSound: 'bladeHit' },
      { name: 'Estocada Alta', anim: 'ver_thrust', dur: 0.26, active: [0.09, 0.15], damage: 20, range: 2.4, arc: 40, knockback: 0.5, lunge: 1.1, sound: 'swing', hitSound: 'bladeHit' },
      { name: 'Raspão', anim: 'slash_rapid', dur: 0.3, actives: [[0.08, 0.13], [0.16, 0.21]], damage: 14, range: 2.2, arc: 110, knockback: 0.6, lunge: 0.9, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL } },
      { name: 'Finta e Ponta', anim: 'arn_lunge', dur: 0.34, active: [0.14, 0.2], damage: 24, range: 2.6, arc: 40, knockback: 0.8, lunge: 1.3, sound: 'swing', hitSound: 'bladeHit' },
      { name: 'Ataque a Fundo', anim: 'arn_lunge', dur: 0.52, active: [0.22, 0.32], damage: 54, range: 3.0, arc: 40, lunge: 1.8, finisher: 'launch', hitstop: 0.1, element: 'energia', sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.6, trail: { color: BLUE, big: true } },
    ],
    up: { name: 'Ponta para Cima', anim: 'slash_up', dur: 0.4, active: [0.12, 0.24], damage: 30, range: 2.2, arc: 100, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Pé no Joelho', anim: 'kick_low', dur: 0.4, active: [0.14, 0.24], damage: 32, range: 1.9, arc: 120, lunge: 0.9, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Flecha', anim: 'arn_lunge', dur: 0.4, active: [0.12, 0.22], damage: 30, range: 2.6, arc: 40, knockback: 2.0, motion: [{ t: [0, 0.2], fwd: 6.2, stopClose: true }], sound: 'swing', hitSound: 'bladeHit' },
    back: {
      // PARADA E RESPOSTA: a guarda apara e a ponta responde
      name: 'Parada e Resposta', anim: 'arn_guard', dur: 0.6, active: [0.6, 0.6], damage: 0, range: 0, arc: 0, knockback: 0,
      counter: { window: [0.05, 0.5], riposte: { damage: 52, finisher: 'launch', anim: 'arn_lunge', sound: 'slashFinal' } },
      sound: 'blade',
    },
    side: { name: 'Volta do Duelista', anim: 'arn_flourish', dur: 0.42, active: [0.12, 0.26], damage: 26, range: 2.3, arc: 220, knockback: 1.2, motion: [{ t: [0, 0.22], side: 2.8 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, wide: true } },
    air: { name: 'Ponta do Alto', anim: 'air_slash', dur: 0.42, active: [0.15, 0.3], damage: 30, range: 2.3, arc: 80, knockback: 3, slam: 15, vertical: 2.3, sound: 'swing', hitSound: 'bladeHit' },
  },

  // □: ESTOCADA DE ENERGIA — a ponta da rapieira dispara o fio azul
  ranged: {
    name: 'Estocada de Energia',
    type: 'projectile',
    anim: 'thrust',
    origin: 'chest',
    windup: 0.16,
    recovery: 0.22,
    count: 1,
    interval: 0,
    damage: 26,
    range: 20,
    speed: 46,
    radius: 0.3,
    spread: 0,
    knockback: 0.8,
    hitstun: 0.35,
    cooldown: 2.2,
    energyCost: 0,
    visual: 'bolt',
    color: BLUE,
    sound: 'swing',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      // DUELO (a ficha: +5 de defesa e de luta contra um adversário só)
      id: 'duelo',
      name: 'Duelo',
      input: 'carga+dodge', // △ + L2
      type: 'selfBuff',
      buffType: 'duel',
      label: 'DUELO',
      anim: 'arn_focus',
      animTime: 0.4,
      description: 'Chama o adversário para o duelo: por 8 s recebe 25% menos dano e os golpes físicos saem 25% mais fortes.',
      energyCost: 24,
      cooldown: 18,
      duration: 8,
      takenMult: 0.75,
      damageMult: 1.25,
      affects: ['melee'],
      color: BLUE,
    },
    {
      id: 'aFundo',
      name: 'A Fundo',
      input: 'carga+physical', // △ + ○
      type: 'dashStrike',
      description: 'O ataque a fundo do esgrimista: atravessa a distância numa estocada só e quebra a defesa.',
      energyCost: 20,
      cooldown: 9,
      anim: 'arn_lunge',
      windup: 0.18,
      distance: 7,
      speed: 28,
      recovery: 0.3,
      range: 2.4,
      damage: 50,
      knockback: 2.6,
      guardBreak: true,
      hitSound: 'bladeHit',
      color: BLUE,
    },
    {
      id: 'chuvaDePontas',
      name: 'Chuva de Pontas',
      input: 'block+jump', // R2 + ×
      type: 'cursedShots',
      description: 'Três estocadas no ar, rápidas: três fios de energia azul seguidos.',
      energyCost: 20,
      cooldown: 10,
      windup: 0.12,
      count: 3,
      interval: 0.1,
      spread: 6,
      anim: 'thrust',
      projectile: { visual: 'bolt', color: BLUE, damage: 18, range: 22, speed: 48, radius: 0.28, knockback: 0.5, hitstun: 0.25, element: 'energia', hitSound: 'bladeHit' },
    },
    {
      // EU TENHO QUE ENCONTRAR O MEU IRMÃO: ele não pode deixar de existir
      id: 'meuIrmao',
      name: 'Meu Irmão',
      input: 'block+carga', // R2 + △
      type: 'altruism',
      description: 'Lembra do Gallerius e se recompõe: paga 4% da vida e recupera 35 de sanidade e as esquivas; na equipe, as assistências voltam na hora.',
      energyCost: 0,
      cooldown: 20,
      healthCost: 0.04,
      energy: 35,
      refillDodges: 2,
      teamGauge: 10,
      color: BLUE,
    },
  ],

  // EU TENHO QUE ENCONTRAR O MEU IRMÃO (PROPOSTA; a fala dele): saudação de duelista, e a rapieira não para — as
  // estocadas, a volta e o ataque a fundo que atravessa
  special: {
    name: 'Duelo até o Fim',
    banner: 'Eu não posso deixar de existir, eu tenho que encontrar o meu irmão!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLUE,
    sound: 'specialStart',
    prepare: { anim: 'arn_open', time: 0.5, fx: 'bladeGlow' },
    dash: { speed: 26, maxTime: 0.45, contact: 2.0 },
    hits: [
      { t: 0.5, anim: 'thrust', dur: 0.24, share: 0.1, fx: { kind: 'stab' }, sound: 'bladeHit', victimAnim: 'stagger' },
      { t: 0.78, anim: 'ver_thrust', dur: 0.24, share: 0.1, fx: { kind: 'stab', color: GOLD }, sound: 'bladeHit' },
      { t: 1.06, anim: 'thrust', dur: 0.24, share: 0.1, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.4, anim: 'arn_flourish', dur: 0.4, share: 0.14, fx: { kind: 'slash', wide: true }, sound: 'blade' },
      { t: 2.1, anim: 'arn_lunge', dur: 0.52, share: 0.56, fx: { kind: 'stab', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.15,
    length: 3.0,
  },

  awakening: {
    name: 'Memória Revivida',
    banner: 'O Duelista',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ranged', 'ability'], cdRate: 1.25, speedMult: 1.08, aura: 'flame', color: BLUE, heal: 0.1,
  },

  passives: [
    { type: 'forcaParanormal', mult: 1.06 }, // DUELO: um contra um, a ponta acha o buraco
    { type: 'escapeDeath' }, // NÃO POSSO DEIXAR DE EXISTIR: uma vez por round um golpe fatal o deixa com 1 de vida
  ],
};
