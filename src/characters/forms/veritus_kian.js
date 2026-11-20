// VERITUS REVELADO — O KIAN (Transformação "A Revelação"). Não aparece na seleção: o Veritus vira esta forma na
// Transformação (Barra cheia + vida baixa, segurando △) e fica assim até o fim do round.
// Cânone (wiki "Veritus" e "Kian"): o líder da Ordo Calamitas era o KIAN disfarçado — Kushim, o Primeiro Ocultista, que
// troca de corpo —, o mesmo que venceu o Hexatombe como o Sacrifício do Rancor. Depois de se revelar, a aura vira
// DOURADA e os olhos AMARELOS. No jogo: o elmo sai, o cabelo loiro aparece, a espada acende em dourado e ele passa a
// usar os RITUAIS do Kian (Teletransporte, Lâmina do Medo, Toque da Morte, Levitação), a Escrita do Conhecimento nos
// golpes e o especial INEXISTIR. Números: PROPOSTA.
import base from '../veritus.js';
import kian from '../kian.js';

const GOLD = 0xffd27a;
const ritual = (id, patch = {}) => ({ ...kian.abilities.find((a) => a.id === id), color: GOLD, ...patch });
const stronger = (s) => ({ ...s, damage: Math.round(s.damage * 1.15), trail: s.trail ? { ...s.trail, color: GOLD } : s.trail });
const M = base.melee;

export default {
  ...base,
  id: 'veritus_kian',
  form: true,
  baseId: 'veritus',
  name: 'VERITUS (KIAN)',
  model: 'veritus_kian',
  energyColor: GOLD,
  chargeFx: { style: 'default', color: GOLD },
  info: {
    ...base.info,
    identity: 'O líder revelado: era o Kian, o Primeiro Ocultista, o tempo todo (até o fim do round)',
    tagline: 'Vocês nunca souberam quem eu era.',
  },
  stats: { ...base.stats, moveSpeed: 7.6, attackSpeed: 1.08, maxHealth: 1600 },
  melee: {
    ...M,
    name: 'Espada do Primeiro Ocultista',
    strikes: M.strikes.map(stronger),
    up: stronger(M.up),
    down: stronger(M.down),
    forward: stronger(M.forward),
    back: M.back,
    side: stronger(M.side),
    air: stronger(M.air),
  },
  ranged: { ...base.ranged, name: 'Corte do Conhecimento', color: GOLD, onHit: { script: 1 } },
  abilities: [
    ritual('teletransporte', { input: 'block+jump' }),
    ritual('laminaMedo', { input: 'carga+physical' }),
    ritual('toqueMorte', { input: 'carga+dodge' }),
    ritual('levitacao', { input: 'block+carga' }),
  ],
  special: { ...kian.special, name: 'Inexistir', banner: 'Inexistir', color: GOLD },
  awakening: undefined,
  passives: [
    { type: 'resistant', mult: 0.92, kinds: ['melee', 'ranged'] },
    { type: 'precognition' },
    { type: 'kianScript', max: 5, burst: 30, stun: 0.3, time: 5 },
  ],
};
