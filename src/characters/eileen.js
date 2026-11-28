// EILEEN (id: eileen) — A VIGÍLIA (Treb Ciach, Irlanda, 890). Pedido do dono (2026-11-21): os membros da Vigília, cada
// um com a forma normal e a TRANSFORMADA (a fantasia do Samhain). Notas de cânone em lore/A-VIGILIA.md.
// Wiki "Eileen": A APICULTORA; a melhor amiga da Zuri (as duas são as únicas sobreviventes do massacre do Samhain e,
// nos anos seguintes, viram um casal); ajudou a Zuri a cuidar do pai dela, o Idir; o Gwayne morreu defendendo ela das
// Assombrações (ep. 3); no Samhain ela se protege com o ESCUDO da Vigília.
// Habilidades da ficha: ÍMPETO ("quando Eileen falha em um teste, ela ganha um ponto de Ímpeto"), ARREMESSAR ABELHAS e
// DEDICADA. Armas: a FOICE e a FUNDA. Afinidade: ENERGIA.
// Visual (cânone): pele clara com sardas pelo rosto todo, olhos verdes com o centro castanho (heterocromia central), dentes
// encavalados; o cabelo ruivo com franja em duas tranças longas jogadas para a frente, com a mecha loira na esquerda.
// PROPOSTA de jogo (marcada): as sequências da foice, os números, o especial "A Colmeia" e a forma transformada (o título
// dela ainda é "?" no cânone: no jogo, "Eileen — Fantasiada"; forms/eileen_fantasia.js).
const BEE = 0xf2c230;
const BRASS = 0xc8a050;

export default {
  id: 'eileen',
  name: 'EILEEN',
  model: 'eileen',
  color: '#e0b030',
  origin: 'A Vigília',
  element: 'energia', // cânone: a afinidade dela
  energyColor: BEE,
  info: {
    weapon: 'A foice, a funda e o pote de abelhas',
    style: 'Apicultora teimosa: a foice de perto, a funda de longe e o pote de abelhas que deixa o adversário lento e tonto; cada golpe que falha vira Ímpeto',
    identity: 'A Apicultora: a ruiva das abelhas de Treb Ciach, a melhor amiga da Zuri',
    tagline: 'Elas não picam quem eu gosto.',
  },
  stats: { moveSpeed: 8.0, attackSpeed: 1.05 },
  ai: { style: 'balanced' },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_eileen', block: 'block' },
  chargeFx: { style: 'default', color: BEE },

  // de perto: a FOICE (cânone) em talhos curvos, o chute baixo e o puxão da lâmina que derruba
  melee: {
    name: 'Foice',
    strikes: [
      { name: 'Talho', anim: 'slash_h', dur: 0.27, active: [0.09, 0.17], damage: 23, range: 1.8, arc: 120, knockback: 0.8, lunge: 1.0, sound: 'swing', hitSound: 'bladeHit', trail: { color: BRASS } },
      { name: 'Talho de Volta', anim: 'slash_h_back', dur: 0.28, active: [0.1, 0.18], damage: 25, range: 1.8, arc: 120, knockback: 0.9, lunge: 0.9, sound: 'swing', hitSound: 'bladeHit', trail: { color: BRASS, flip: true } },
      { name: 'Chute Baixo', anim: 'kick_low', dur: 0.32, active: [0.11, 0.2], damage: 24, range: 1.6, arc: 90, knockback: 1.2, lunge: 0.8, sound: 'swing', hitSound: 'kick' },
      { name: 'Foice de Cima', anim: 'slash_v', dur: 0.36, active: [0.13, 0.23], damage: 30, range: 1.9, arc: 80, knockback: 1.6, lunge: 1.1, guardCrush: 10, sound: 'swing', hitSound: 'bladeHit', trail: { color: BRASS, tilt: 1.2 } },
      { name: 'Colheita', anim: 'slash_finisher', dur: 0.58, active: [0.24, 0.36], damage: 52, range: 2.1, arc: 160, finisher: 'knockdown', hitstop: 0.1, sound: 'blade', hitSound: 'bladeHit', impactScale: 1.4, trail: { color: BEE, wide: true } },
    ],
    up: { name: 'Foice para Cima', anim: 'slash_up', dur: 0.42, active: [0.15, 0.27], damage: 34, range: 1.9, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: BRASS, tilt: -1.3 } },
    down: { name: 'Gancho no Pé', anim: 'kick_low', dur: 0.42, active: [0.15, 0.26], damage: 36, range: 2.0, arc: 120, lunge: 1, finisher: 'knockdown', otg: true, sound: 'swing', hitSound: 'bladeHit' },
    forward: { name: 'Avanço da Foice', anim: 'dash_slash', dur: 0.44, active: [0.14, 0.26], damage: 32, range: 2.1, arc: 100, knockback: 2.4, motion: [{ t: [0, 0.22], fwd: 4.6, stopClose: true }], sound: 'swing', hitSound: 'bladeHit', trail: { color: BRASS } },
    back: { name: 'Recuo e Talho', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 32, range: 1.9, arc: 110, knockback: 2.0, iframes: [0, 0.24], motion: [{ t: [0, 0.15], back: 2.4 }, { t: [0.18, 0.32], fwd: 2.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: BRASS, radius: 1.2, tilt: -0.2 } },
    side: { name: 'Roda da Foice', anim: 'slash_d', dur: 0.46, active: [0.16, 0.32], damage: 30, range: 2.1, arc: 240, knockback: 1.5, motion: [{ t: [0, 0.24], side: 2.2 }], sound: 'swing', hitSound: 'bladeHit', trail: { color: BRASS, wide: true } },
    air: { name: 'Foice do Alto', anim: 'air_slash', dur: 0.42, active: [0.16, 0.3], damage: 31, range: 2.0, arc: 110, knockback: 3, slam: 14, vertical: 2.2, sound: 'swing', hitSound: 'bladeHit', trail: { color: BRASS, tilt: 1.3 } },
  },

  // □ FUNDA (cânone: a arma de longe dela): o seixo girado e solto
  ranged: {
    name: 'Funda',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'chest',
    windup: 0.24,
    recovery: 0.18,
    count: 1,
    interval: 0,
    damage: 21,
    range: 26,
    speed: 40,
    radius: 0.28,
    spread: 0,
    knockback: 1.0,
    hitstun: 0.45,
    cooldown: 1.0,
    energyCost: 0,
    visual: 'slingStone',
    color: 0x8a8478,
    sound: 'swing',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + □ ARREMESSAR ABELHAS (cânone): o POTE DE ABELHAS em arco — estoura onde o adversário está e o enxame fica no
      // rosto dele: ferroadas, LENTO e TONTO por um tempo (dono, 2026-11-28)
      id: 'abelhas',
      name: 'Pote de Abelhas',
      input: 'carga+ranged',
      type: 'throwProjectile',
      description: 'Joga o pote de abelhas em arco: estoura no adversário e o enxame persegue ele picando por 5 s — LENTO e TONTO no começo.',
      energyCost: 24,
      cooldown: 12,
      anim: 'throw_r',
      windup: 0.34,
      recovery: 0.32,
      sound: 'swing',
      projectile: {
        name: 'Pote de Abelhas', visual: 'beeJar', color: BEE, speed: 16, range: 16, radius: 0.45, gravity: 18, damage: 0, lobTo: 'feet',
        explode: { radius: 2.2, damage: 26, knockback: 1, hitstun: 0.4, fire: false, sound: 'impact', bees: { dps: 9, duration: 5, slow: 0.7, dizzy: 0.9 } },
      },
      ai: { when: 'far', min: 4 },
    },
    {
      // △ + ○ ROLO DA FOICE (PROPOSTA): gira com a foice aberta duas vezes — o segundo talho joga longe
      id: 'roloFoice',
      name: 'Rolo da Foice',
      input: 'carga+physical',
      type: 'sweepStrike',
      description: 'Gira com a foice aberta: dois talhos em volta dela, o último joga longe.',
      energyCost: 20,
      cooldown: 10,
      anim: 'arn_spin',
      startSound: 'blade',
      windup: 0.12,
      hits: 2,
      interval: 0.22,
      recovery: 0.3,
      radius: 2.8,
      damage: 56,
      color: BRASS,
    },
    {
      // △ + L2 DEDICADA (cânone): respira e firma a mão — por um tempo a funda sai mais forte e mais rápida
      id: 'dedicada',
      name: 'Dedicada',
      input: 'carga+dodge',
      type: 'selfBuff',
      buffType: 'dedicada',
      label: 'DEDICADA',
      anim: 'concentrate',
      animTime: 0.4,
      sound: 'ritual',
      description: 'Firma a mão: por 8 s a funda sai 25% mais forte e ela ataca mais rápido.',
      energyCost: 18,
      cooldown: 16,
      duration: 8,
      damageMult: 1.25,
      affects: ['ranged'],
      atkSpeed: 1.12,
      color: BEE,
      ai: { when: 'far', min: 5 },
    },
    {
      // R2 + △ FUMAÇA DO APICULTOR (PROPOSTA; a fumaça que acalma a colmeia): a nuvem cinza em volta dela deixa lento
      // quem entra e engole projéteis
      id: 'fumaca',
      name: 'Fumaça do Apicultor',
      input: 'block+carga',
      type: 'mistCloud',
      description: 'Abana o fumegador: a fumaça em volta dela deixa lento quem entra e engole os tiros por 5 s.',
      energyCost: 22,
      cooldown: 18,
      distance: 0,
      radius: 3.6,
      duration: 5,
      enemySlow: 0.35,
      eatsProjectiles: true,
      color: 0x8a8478,
      ai: { when: 'hurt' },
    },
  ],

  // A COLMEIA (PROPOSTA; specials/vigiliaSpecials.js → hiveSwarm): ela abre a tampa e o enxame inteiro sai num rio
  // dourado, prende o adversário no meio da nuvem (lento, tonto, as picadas) e ela fecha com a Colheita da foice
  special: {
    name: 'A Colmeia',
    banner: 'Elas não picam quem eu gosto.',
    type: 'hiveSwarm',
    energyCost: 50,
    cooldown: 14,
    range: 16,
    damage: 250,
    color: BEE,
    release: 'COLHEITA',
    sound: 'specialStart',
  },

  // EILEEN FANTASIADA (o título do cânone é "?": não inventado; a fantasia do Samhain como Transformação): o saco
  // costurado com os galhos, o capuz preto e o escudo da Vigília
  awakening: {
    name: 'Fantasia do Samhain',
    banner: 'Fantasia do Samhain',
    type: 'maskTransform',
    prop: 'sackMask',
    form: 'eileen_fantasia',
    formBanner: 'EILEEN — FANTASIADA',
    swap: [['twigs', true], ['blackHood', true], ['hood', false], ['crown', false]],
    sound: 'maskOn',
    tint: 0xc8a040,
    duration: 0,
    bonusHealth: 100,
    color: BEE,
  },

  passives: [
    { type: 'impeto', max: 3, per: 0.15, bigHit: 60 }, // ÍMPETO (cânone)
    { type: 'longShot', minDist: 9, mult: 1.08 }, // DEDICADA: de longe, a mira firme (PROPOSTA)
  ],
};
