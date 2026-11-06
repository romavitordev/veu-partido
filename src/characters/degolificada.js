// A DEGOLIFICADA (id: degolificada) — OUTRO LADO, JOGÁVEL no modo de luta (pedido do dono, 2026-11-06: "Degolificada e
// Espreitador vão se tornar personagens jogáveis no modo de luta"). A de INICIAÇÃO (A Ordem Paranormal): o corpo da Agatha
// Volkomenn com a mente do Gabriel Opspor (wiki "Degolificada" e "Gabriel Opspor"). Criatura de MEDO; flutua com os
// membros pendurados e ataca com os longos fios de cabelo.
// No modo Outro Lado ela é a CHEFE da Escola Nostradamus (characters/bosses/degolificada.js deriva desta ficha, sem o
// kit: a IA dela está em pve/degolificada.js, com o Escudo de Medo e as provas — que NÃO existem aqui no modo de luta).
// Kit (Habilidades da wiki; os botões e números são PROPOSTA de jogo):
//   Pancada ................. ○ o combo: os braços pendentes e o cabelo que sai do chão (os clipes do Amigo, ai_*)
//   Investida de cabelo ..... □ os fios disparam em linha reta e puxam (PROPOSTA a partir do golpe da chefe)
//   Agarrar e Estrangular ... △ + ○ o cabelo agarra, estrangula e JOGA NA PAREDE
//   Cabelo rastejante ....... △ + □ os fios brotam do chão debaixo do alvo e prendem (PROPOSTA a partir da chefe)
//   Cabelo por cima ......... △ + × os fios caem do alto sobre o alvo (PROPOSTA a partir da chefe)
//   Defesa de cabelo ........ △ + L2 os fios fecham na frente: apanha menos e não recua (PROPOSTA a partir da chefe)
//   Grito Rasgado ........... R2 + △ (cânone) rompe a vedação da boca: ondas que atordoam quem estiver perto
//   Desfiguramento Capilar .. o ESPECIAL (cânone: o nome da habilidade; a cena é PROPOSTA)
//   Devoradora .............. a TRANSFORMAÇÃO (cânone de Iniciação: a metamorfose de Sangue — maior, mais rápida, mais forte)
import amigo from './amigo.js';
import nubi from './nubi.js';
import kaiser from './kaiser.js';

const HAIR = 0x0a0909;
const PALE = 0xc8d0c0;
const FEAR = 0x8aa4c8; // o azul-acinzentado do Medo
const BLOOD = 0xa02a18;
const abil = (def, id) => def.abilities.find((a) => a.id === id);
const hair = (s, name) => ({ ...s, name, element: 'medo', impactFx: undefined, trail: s.trail ? { ...s.trail, color: HAIR } : undefined });

// a Pancada (wiki: "usando seus cabelos flutuantes ou, até mesmo, seus braços pendentes"): os golpes do Amigo Imaginário
// com os TENTÁCULOS que saem do chão virando o CABELO preto; sem a tinta. A chefe usa o mesmo combo.
export const DEGOLIFICADA_MELEE = {
  name: 'Pancada',
  strikes: amigo.melee.strikes.map((s, i) => hair(s, ['Braço pendente', 'Braço pendente', 'Chicote de cabelo', 'Fios cortantes', 'Esmagar a cabeça'][i] || 'Pancada')),
  up: hair(amigo.melee.up, 'Erguer pelos cabelos'),
  down: hair(amigo.melee.down, 'Esmagar'),
  forward: hair(amigo.melee.forward, 'Flutuar e golpear'),
  back: hair(amigo.melee.back, 'Recua e chicoteia'),
  side: hair(amigo.melee.side, 'Varredura de cabelo'),
  air: hair(amigo.melee.air, 'Desabar'),
};

export default {
  id: 'degolificada',
  name: 'A DEGOLIFICADA',
  model: 'degolificada',
  color: '#c8d0c0',
  origin: 'Outro Lado',
  element: 'medo', // wiki: o Elemento principal é o Medo (tem todos)
  energyColor: PALE,
  tentacle: { color: HAIR, emissive: 0x050505, radius: 0.06 },
  info: {
    weapon: 'Os longos fios de cabelo e os braços pendentes',
    style: 'Flutua a meia distância e luta com o cabelo: puxa, agarra e joga na parede, prende pelo chão e grita',
    identity: 'O corpo da Agatha com a mente do Gabriel',
    tagline: 'Se você vir longos cabelos pretos flutuando em sua direção… CORRA.',
  },
  // flutua devagar e é grande; vida do elenco (a chefe do Outro Lado aguenta mais: bosses/degolificada.js)
  stats: { moveSpeed: 7.1, attackSpeed: 0.95, size: 1.12 },
  anims: { ...amigo.anims, victory: 'taunt_roar' },
  chargeFx: { style: 'default', color: PALE },
  dodge: { style: 'default', distance: 4.2 },

  melee: DEGOLIFICADA_MELEE,

  // □ INVESTIDA DE CABELO: um feixe de fios dispara em linha reta e PUXA quem pega (o tentáculo do Amigo, em cabelo)
  ranged: {
    ...amigo.ranged,
    name: 'Investida de cabelo',
    description: 'Os fios disparam em linha reta: quem pega é puxado para perto dela.',
    ropeColor: HAIR,
    color: HAIR,
    element: 'medo',
    damage: 24,
  },

  abilities: [
    {
      // △ + ○ AGARRAR E ESTRANGULAR (cânone) — o cabelo agarra, estrangula e JOGA NA PAREDE (o golpe da chefe)
      ...abil(amigo, 'tentaculosPrendem'),
      id: 'agarrarEstrangular',
      name: 'Agarrar e Estrangular',
      input: 'carga+physical',
      description: 'Os fios se enrolam no pescoço de quem está à frente, puxam até ela, estrangulam e o ARREMESSAM longe.',
      alwaysThrow: true,
      caughtLabel: 'ESTRANGULADO PELO CABELO',
      tentColor: HAIR,
      element: 'medo',
      damage: 22,
      throwDamage: 42,
      energyCost: 30,
      cooldown: 14,
      color: HAIR,
    },
    {
      // △ + □ CABELO RASTEJANTE — um fio corre pelo chão e brota debaixo do alvo (os tentáculos de Lodo da Nubi, em cabelo)
      ...abil(nubi, 'lodoPrende'),
      id: 'cabeloRastejante',
      name: 'Cabelo rastejante',
      input: 'carga+ranged',
      description: 'Os fios correm pelo chão e brotam debaixo do adversário, prendem e apertam.',
      damage: 48,
      stun: 1.0,
      caughtLabel: 'PRESO NOS CABELOS',
      cooldown: 13,
      color: HAIR,
    },
    {
      // △ + × CABELO POR CIMA — os fios caem do alto sobre o alvo (a chuva da Acácia do Kaiser, em fios pretos)
      ...abil(kaiser, 'acacia'),
      id: 'cabeloPorCima',
      name: 'Cabelo por cima',
      input: 'carga+jump',
      description: 'Um círculo marca o chão: os fios caem do alto sobre quem estiver dentro, várias vezes.',
      vsElement: undefined,
      damage: 64,
      cooldown: 12,
      color: HAIR,
    },
    {
      // △ + L2 DEFESA DE CABELO — os fios fecham na frente dela
      id: 'defesaCabelo',
      name: 'Defesa de cabelo',
      input: 'carga+dodge',
      type: 'heavyProtection',
      label: 'DEFESA DE CABELO',
      description: 'Os fios fecham na frente dela: por 5 s recebe 35% menos dano e aguenta 3 golpes sem recuar.',
      energyCost: 22,
      cooldown: 17,
      duration: 5,
      takenMult: 0.65,
      armor: 3,
      color: HAIR,
    },
    {
      // R2 + △ GRITO RASGADO (cânone) — o Sino do Amigo virado grito: três ondas, a última atordoa e ensurdece
      ...abil(amigo, 'oSino'),
      id: 'gritoRasgado',
      name: 'Grito Rasgado',
      input: 'block+carga',
      description: 'Rompe a vedação da boca e GRITA: três ondas em volta dela; quem ainda estiver perto na última fica atordoado e ENSURDECIDO (apanha mais) por alguns segundos.',
      scream: true,
      anim: 'taunt_roar',
      element: 'medo',
      frenzyBite: undefined,
      color: PALE,
    },
  ],

  // ESPECIAL DESFIGURAMENTO CAPILAR (cânone: o nome da habilidade; a cena é PROPOSTA): os fios pegam a vítima de longe,
  // erguem, apertam, cortam e a jogam no chão
  special: {
    name: 'Desfiguramento Capilar',
    banner: 'Corra.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: FEAR,
    sound: 'specialStart',
    prepare: { anim: 'ai_bell', time: 0.45 },
    dash: { speed: 10, maxTime: 0.9, contact: 3.4 },
    chain: { rope: true, color: HAIR },
    standOff: 2.6,
    hits: [
      { t: 0.1, anim: 'ai_lash', dur: 0.45, share: 0.14, fx: { kind: 'claw', color: HAIR }, sound: 'whip', call: 'OS FIOS' },
      { t: 0.6, anim: 'ai_up', dur: 0.5, share: 0.16, victimAnim: 'stagger', fx: { kind: 'claw', color: HAIR }, sound: 'whip' },
      { t: 1.15, anim: 'ai_lash_l', dur: 0.45, share: 0.18, fx: { kind: 'claw', flip: true, color: HAIR }, sound: 'clawHit', call: 'ESTRANGULA' },
      { t: 1.65, anim: 'ai_rake', dur: 0.5, share: 0.2, fx: { kind: 'claw', color: FEAR }, sound: 'clawHit' },
      { t: 2.3, anim: 'ai_down', dur: 0.5, share: 0.32, fx: { kind: 'claw', big: true, color: HAIR, color2: FEAR }, sound: 'slashFinal', quake: true, final: true, call: 'DESFIGURAMENTO CAPILAR' },
    ],
    shots: 'control',
    bannerAt: 0.2,
    length: 3.1,
    endReaction: { knockback: 3, lowLaunch: true },
  },

  // DEVORADORA (cânone de Iniciação: a metamorfose de Sangue) — maior, mais rápida e mais forte
  awakening: {
    name: 'Devoradora',
    banner: 'Devoradora',
    type: 'awakenMode',
    anim: 'ai_frenzy',
    mult: 1.18, affects: ['melee', 'ability'], takenMult: 0.88, speedMult: 1.2, cdRate: 1.3, aura: 'blood', color: BLOOD, heal: 0.1,
  },

  passives: [],
};
