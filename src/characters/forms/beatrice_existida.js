// BEATRICE — A EXISTIDA (Desconjuração ep. 11 "Lembrar"). Não aparece na seleção: a Beatrice vira esta forma na
// Transformação (Barra cheia + vida baixa, segurando △) e fica assim até o fim do round.
// Cânone (wiki "Beatrice Portinari"): a morte do Orpheu era a barreira das memórias; quando o Viajante quebra o pescoço
// dele, tudo volta. A 90% de exposição a pele EMAGRECE e se enche de TEXTOS como os das criaturas do Orfanato Santa
// Menefreda, os olhos ficam esbranquiçados e, ao lembrar a resposta sobre o Outro Lado, ela termina como EXISTIDA.
// "Quando é atacada, os olhos e a boca brilham em amarelo, ficando em um estado totalmente agressivo e forte."
// O PINGENTE DA LUA DOURADA (item amaldiçoado por Conhecimento com as memórias dela) a deixa mais resistente a dano e a
// efeitos de Conhecimento. Ela aprendeu o DESCARNAR na transcendência (e nunca usou em vida): aqui ela usa.
// PROPOSTA de jogo (marcada): o kit agressivo, o Grito das Memórias e os números.
// Visual: o mesmo modelo com a pele de textos, os olhos brancos e sem o Orpheu (models/props.js → addBeatriceExistidaProps).
import base from '../beatrice.js';

const GOLD = 0xf2c230;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));
const fierce = (s, k = 1.18) => ({ ...s, damage: Math.round(s.damage * k), trail: { ...(s.trail || {}), color: GOLD } });

export default {
  ...base,
  id: 'beatrice_existida',
  form: true,
  baseId: 'beatrice',
  name: 'BEATRICE PORTINARI',
  model: 'beatrice_existida',
  color: '#f2c230',
  energyColor: GOLD,
  info: {
    ...base.info,
    weapon: 'O canivete, a balestra e o ritual Descarnar',
    style: 'Existida: agressiva e forte, o canivete mais rápido e o grito das memórias que paralisa',
    identity: 'A Existida (até o fim do round)',
    tagline: 'Meu nome é Beatrice... lembra de mim!',
  },
  stats: { ...base.stats, moveSpeed: 8.6, attackSpeed: 1.2, maxHealth: 1600 }, // cabe a vida extra da transformação
  chargeFx: { style: 'aura', color: GOLD },

  melee: {
    ...base.melee,
    name: 'Canivete da Existida',
    strikes: base.melee.strikes.map((s) => fierce(s)),
    up: fierce(base.melee.up),
    forward: fierce(base.melee.forward),
    side: fierce(base.melee.side),
    air: fierce(base.melee.air),
  },

  abilities: [
    {
      // △ + ○ GRITO DAS MEMÓRIAS (PROPOSTA: "Saber tudo é perder tudo" — os olhos e a boca brilham em amarelo)
      id: 'gritoMemorias',
      name: 'Saber Tudo É Perder Tudo',
      input: 'carga+physical',
      type: 'fearGaze',
      description: 'Os olhos e a boca brilham em amarelo e ela grita tudo o que lembrou: quem estiver à frente fica paralisado por um instante, vulnerável a combo.',
      energyCost: 22,
      cooldown: 11,
      range: 8,
      arc: 80,
      windup: 0.35,
      recovery: 0.3,
      stun: 1.0,
      color: GOLD,
    },
    { ...byId.viroteSilencioso, cooldown: 10, projectile: { ...byId.viroteSilencioso.projectile, damage: 62 } },
    { ...byId.vicioAdrenalina, cooldown: 12 },
    byId.claraoLeds,
  ],

  // DESCARNAR (cânone: aprendeu na transcendência — o ódio dela é a INJUSTIÇA; em vida nunca usou)
  special: {
    name: 'Descarnar',
    banner: 'Descarnar!',
    type: 'ritual',
    energyCost: 50,
    cooldown: 14,
    range: 20,
    color: GOLD,
    waves: [
      { t: 2.1, cuts: 6, share: 0.45 },
      { t: 2.55, cuts: 7, share: 0.55, final: true },
    ],
  },

  awakening: undefined,

  passives: [
    ...base.passives,
    { type: 'elementalAffinity', element: 'conhecimento', mult: 1.1, resist: 0.8 }, // o Pingente da Lua Dourada
  ],
};
