// CARINA — TODOS OS LEONE (Calamidade). Não aparece na seleção: a Carina vira esta forma na Transformação (Barra cheia +
// vida baixa, segurando △) e fica assim até o fim do round.
// Cânone (wiki "Carina Leone"): conectada com a Marca, ao entrar em combate "seus olhos se tornam dourados e sua mecha em
// ciano se torna um tom dourado e brilhante"; no 4º episódio ela deixa o NUNCHAKU DOURADO (bastões e corrente, "Leone"
// escrito e o brasão nas pontas); completando o GRIMÓRIO DE ARNALDO as páginas ficam pretas com sigilos dourados, ela
// sente "o próprio Outro Lado nas mãos", toma os rituais do Kian, os olhos ficam completamente brancos e ela solta um
// grito ensurdecedor. "Todos os Leone vivem dentro de mim!"
// Decisão do dono (2026-11-02): transformada ela usa o nunchaku dourado, os poderes ficam aprimorados e ganha a
// habilidade do livro do Arnaldo, em que fica muito poderosa. Os números são PROPOSTA.
// Visual: o mesmo modelo com as mechas e os olhos dourados (models/props.js → addCarinaLeoneProps).
import base from '../carina.js';

const GOLD = 0xf2c230;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'carina_leone',
  form: true,
  baseId: 'carina',
  name: 'CARINA LEONE',
  model: 'carina_leone',
  color: '#f2c230',
  energyColor: GOLD,
  info: {
    ...base.info,
    weapon: 'O nunchaku DOURADO dos Leone, a Glock Silenciada e o Grimório de Arnaldo',
    style: 'Transformada: o nunchaku dourado rápido, a Precognição acesa e o grimório que toma os rituais do adversário',
    identity: 'Todos os Leone (até o fim do round)',
    tagline: 'Todos os Leone vivem dentro de mim!',
  },
  stats: { ...base.stats, moveSpeed: 8.6, attackSpeed: 1.18, maxHealth: 1600 }, // cabe a vida extra da transformação
  // sem def.grip: o updateGrip guardaria o nunchaku nas costas a cada golpe (ela bate COM ele)
  grip: undefined,
  chargeFx: { style: 'aura', color: GOLD },
  dodge: { style: 'default', distance: 5.8 },

  melee: {
    name: 'Nunchaku Dourado',
    strikes: [
      { name: 'Giro do nunchaku', anim: 'slash_h', dur: 0.24, active: [0.06, 0.14], damage: 23, range: 1.9, arc: 130, knockback: 0.7, lunge: 1.2, sound: 'swing', hitSound: 'punch', trail: { color: GOLD, tilt: 0.05 } },
      { name: 'Volta do nunchaku', anim: 'slash_h_back', dur: 0.24, active: [0.06, 0.14], damage: 23, range: 1.9, arc: 130, knockback: 0.7, lunge: 1.1, sound: 'swing', hitSound: 'punch', trail: { color: GOLD, flip: true } },
      { name: 'Rajada de nunchaku', anim: 'flurry', dur: 0.32, active: [0.07, 0.22], damage: 28, range: 1.9, arc: 110, knockback: 0.8, lunge: 1.0, sound: 'swing', hitSound: 'punch', trail: { color: GOLD, tilt: -0.3 } },
      { name: 'Chute circular', anim: 'kick_round', dur: 0.3, active: [0.09, 0.18], damage: 29, range: 2.0, arc: 140, knockback: 1.1, lunge: 1.0, sound: 'swing', hitSound: 'kick' },
      { name: 'Nunchaku por cima', anim: 'slash_v', dur: 0.36, active: [0.12, 0.21], damage: 33, range: 2.0, arc: 80, knockback: 1.3, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, roll: 1.5 } },
      // o fecho: o giro inteiro com o chute que lança
      { name: 'Leão Giratório', anim: 'spin_kick', dur: 0.5, active: [0.19, 0.31], damage: 56, range: 2.1, arc: 180, lunge: 1.6, finisher: 'launch', sound: 'slashFinal', hitSound: 'kick', impactScale: 1.5, hitstop: 0.08, trail: { color: GOLD, roll: 1.4, big: true } },
    ],
    up: { name: 'Nunchaku de baixo', anim: 'slash_up', dur: 0.38, active: [0.12, 0.22], damage: 38, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'punch', trail: { color: GOLD, tilt: -1.3 } },
    down: base.melee.down,
    forward: { name: 'Avanço do Leão', anim: 'dash_slash', dur: 0.38, active: [0.11, 0.22], damage: 34, range: 2.0, arc: 110, knockback: 1.6, motion: [{ t: [0, 0.22], fwd: 6.4, stopClose: true }], sound: 'swing', hitSound: 'punch', trail: { color: GOLD, tilt: 0.1 } },
    // FINTAR com a Precognição acesa: a janela fica maior e o revide mais forte
    back: { ...base.melee.back, counter: { window: [0.04, 0.55], riposte: { damage: 60, finisher: 'launch', anim: 'spin_kick', sound: 'slashFinal' } } },
    side: base.melee.side,
    air: base.melee.air,
  },

  ranged: { ...base.ranged, hideProp: 'nunchaku+holsterGlock', count: 3, cooldown: 1.9 },

  abilities: [
    { ...byId.facaNoOlho, cooldown: 6, projectile: { ...byId.facaNoOlho.projectile, damage: 36, onHit: { ...byId.facaNoOlho.projectile.onHit, stun: 0.7 } } },
    { ...byId.baterReposicionar, description: 'Entra com o nunchaku dourado quebrando a guarda e, no mesmo movimento, rola para as costas do alvo: ele fica DESPREVENIDO e sem chance de revidar.', damage: 42, cooldown: 8, color: GOLD, hitSound: 'punch' },
    { ...byId.furtividade, duration: 4, color: GOLD },
    byId.pergaminhoPertinacia,
    {
      // R2 + × GRIMÓRIO DE ARNALDO (cânone: completou o grimório, os olhos ficaram brancos e ela tomou os rituais do Kian)
      id: 'grimorioArnaldo',
      name: 'Grimório de Arnaldo',
      input: 'block+jump',
      type: 'leoneGrimoire',
      description: 'Abre o Grimório de Arnaldo completo: as páginas pretas com os sigilos dourados acendem e brilham, os olhos ficam BRANCOS, ela ergue o livro e solta um grito ensurdecedor. Altera a realidade, então vale EM QUALQUER LUGAR DO MAPA: o adversário é derrubado (a guarda não segura), fica SURDO e tem os rituais TOMADOS — sem habilidades por 5 s — e ela fica muito mais forte por 8 s (+30% de dano, mais rápida, recebe menos dano).',
      energyCost: 40,
      cooldown: 26,
      castTime: 1.2, // abre o livro, lê e grita
      // sem radius: altera a realidade, vale de qualquer lugar do mapa (pedido do dono, 2026-11-02)
      damage: 110,
      knockback: 4.5,
      deaf: 3,
      lock: 5,
      duration: 8,
      damageMult: 1.3,
      speedMult: 1.12,
      takenMult: 0.8,
      color: GOLD,
    },
  ],

  // a Dança dos Leone com o nunchaku dourado
  special: {
    ...base.special,
    hits: [
      { t: 0.45, anim: 'slash_h', dur: 0.22, share: 0.1, fx: { kind: 'punch' }, sound: 'punch', push: 0.05 },
      { t: 0.68, anim: 'slash_h_back', dur: 0.22, share: 0.1, fx: { kind: 'punch', flip: true }, sound: 'punch', push: 0.05 },
      { t: 0.92, anim: 'flurry', dur: 0.36, share: 0.16, fx: { kind: 'punch' }, sound: 'heavyPunch', push: 0.05 },
      { t: 1.38, anim: 'kick_round', dur: 0.32, share: 0.14, fx: { kind: 'punch' }, sound: 'kick', call: 'GUARDA ABERTA!', push: 0.1 },
      { t: 1.85, anim: 'spin_kick', dur: 0.5, share: 0.5, fx: { kind: 'smash', big: true }, sound: 'slashFinal', final: true, shout: 'LEONE!', quake: true },
    ],
  },

  awakening: undefined,

  passives: [
    ...base.passives,
    // Precognição (cânone: "+5 de defesa para ataques de curto alcance; a mecha e os olhos brilham em dourado")
    { type: 'resistant', kinds: ['melee'], mult: 0.85 },
  ],
};
