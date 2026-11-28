// GWAYNE — O MORTO QUE CAMINHA (A Vigília). A Transformação do Gwayne (Barra cheia + vida baixa, segurando △) e também
// uma VERSÃO na seleção (RB/LB no cartão do Gwayne). Pedido do dono (2026-11-21): cada membro da Vigília tem a forma
// normal e a TRANSFORMADA, com a fantasia do Samhain.
// Visual (wiki, arte "Gwayne Fantasiado"): o CRÂNIO de cão/lobo com as presas, as PENAS VERMELHAS do lado, a PELE de pelo
// cinza-escuro por cima da cabeça e dos ombros e o PONCHO verde-oliva longo e esfarrapado — o mesmo modelo do Gwayne com
// as peças da fantasia ligadas (models/vigiliaProps.js → addGwayneMortoProps).
// Kit (PROPOSTA): as flechas queimam mais; a Esquiva vira o PASSO DO MORTO (some na névoa azul do Samhain e reaparece
// do lado do adversário já com a adaga).
import base from '../gwayne.js';

const FIRE = 0xff7a2a;
const MIST = 0x8aa8d8;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'gwayne_morto',
  form: true,
  baseId: 'gwayne',
  name: 'GWAYNE — O MORTO QUE CAMINHA',
  model: 'gwayne_morto',
  energyColor: FIRE,
  info: {
    ...base.info,
    style: 'A fantasia do Samhain: as flechas queimam mais e ele some na névoa azul para surgir do lado com a adaga',
    identity: 'O Morto que Caminha (até o fim do round)',
    tagline: 'No Samhain, vivos e mortos são iguais.',
  },
  stats: { ...base.stats, maxHealth: 1600, moveSpeed: 8.4 }, // cabe a vida extra da transformação
  chargeFx: { style: 'aura', color: FIRE, smoke: 0x1a2030 },
  // □ AS FLECHAS DA VIGÍLIA (pedido do dono, 2026-11-28: "gwayne as flechas da vigilia"): a flecha do arsenal, mais
  // pesada e sem fogo — o fogo fica na Salva Flamejante (o poder à parte). PROPOSTA: os números
  ranged: { ...base.ranged, name: 'Flecha da Vigília', visual: 'vigiliaArrow', color: 0x9ac8ff, damage: 30, knockback: 1.2, burn: undefined },
  melee: {
    ...base.melee,
    strikes: base.melee.strikes.map((s) => ({ ...s, damage: Math.round(s.damage * 1.1) })),
  },
  abilities: [
    byId.flechaCaca,
    byId.salvaFlamejante,
    byId.prontidao,
    {
      // R2 + × PASSO DO MORTO (PROPOSTA): some na névoa azul do Samhain e reaparece do lado do adversário com a adaga
      id: 'passoMorto',
      name: 'Passo do Morto',
      input: 'block+jump',
      type: 'blink',
      description: 'Some na névoa azul do Samhain e reaparece: na direção do analógico ou, sem direção, do lado do adversário já cravando a adaga.',
      energyCost: 18,
      cooldown: 8,
      distance: 8,
      flankDistance: 1.8,
      vanishTime: 0.25,
      color: MIST,
      residue: 'mist',
      strike: { range: 2.2, damage: 34, anim: 'thrust' },
    },
  ],
  awakening: null,
  passives: [{ type: 'longShot', minDist: 10, mult: 1.12 }],
};
