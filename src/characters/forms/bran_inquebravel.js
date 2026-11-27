// BRAN — O INQUEBRÁVEL (A Vigília). A Transformação do Bran (Barra cheia + vida baixa, segurando △) e também uma VERSÃO
// na seleção (RB/LB no cartão do Bran). Pedido do dono (2026-11-21): cada membro da Vigília tem a forma normal e a
// TRANSFORMADA, com a fantasia do Samhain.
// Visual (wiki, arte "Bran Fantasiado"): a MÁSCARA DE CRÂNIO DE CORVO de bico longo, a gola enorme de PENAS
// cinza-azuladas até a cintura e o manto longo escuro costurado — o mesmo modelo do Bran com as peças da fantasia ligadas
// (models/vigiliaProps.js → addBranInquebravelProps). Nas fantasias do Samhain, vivos e mortos ficam iguais.
// Kit (PROPOSTA): a mesma lança e o broquel, mais pesados; o Guardião vira o VOO DO CORVO (some nas penas e reaparece
// colado no adversário) e a Casca Grossa engrossa.
import base from '../bran.js';

const PLUME = 0x8aa0c0;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'bran_inquebravel',
  form: true,
  baseId: 'bran',
  name: 'BRAN',
  model: 'bran_inquebravel',
  energyColor: PLUME,
  info: {
    ...base.info,
    style: 'A fantasia de corvo do Samhain: a lança pesa mais, ele some nas penas e reaparece em cima do adversário',
    identity: 'O Inquebrável (até o fim do round)',
    tagline: 'Hoje à noite, ninguém passa.',
  },
  stats: { ...base.stats, maxHealth: 1600, moveSpeed: 7.3 }, // cabe a vida extra da transformação
  chargeFx: { style: 'aura', color: PLUME, smoke: 0x1a1c22 },
  melee: {
    ...base.melee,
    strikes: base.melee.strikes.map((s) => ({ ...s, damage: Math.round(s.damage * 1.12) })),
  },
  abilities: [
    byId.cravarJustica,
    {
      // △ + L2 VOO DO CORVO (PROPOSTA; Bran = "corvo"): some numa revoada de penas e reaparece colado no adversário
      id: 'vooCorvo',
      name: 'Voo do Corvo',
      input: 'carga+dodge',
      type: 'blink',
      description: 'Some numa revoada de penas escuras e reaparece: na direção do analógico ou, sem direção, colado ao lado do adversário.',
      energyCost: 18,
      cooldown: 8,
      distance: 8,
      flankDistance: 2.2,
      vanishTime: 0.25,
      color: PLUME,
      residue: 'feathers',
    },
    byId.prontidao,
    byId.seAtira,
  ],
  awakening: null,
  passives: [
    { type: 'resistant', kinds: ['melee', 'ranged'], mult: 0.82 }, // a Casca Grossa mais grossa
    { type: 'thickSkin', knockback: 0.55, chip: 0.6, guard: 0.7 },
    { type: 'escapeDeath' },
  ],
};
