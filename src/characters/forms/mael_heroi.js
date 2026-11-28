// MAEL — HERÓI DA VIGÍLIA (A Vigília). A Transformação do Mael (Barra cheia + vida baixa, segurando △) e também uma
// VERSÃO na seleção (RB/LB no cartão do Mael). Pedido do dono (2026-11-21): cada membro da Vigília tem a forma normal e a
// TRANSFORMADA, com a fantasia do Samhain.
// Visual (wiki, arte "Mael Fantasiado"): a MÁSCARA DE CASCA em espiral com galhos como chifres, a GOLA DE FOLHAS SECAS e
// a CAPA ESFARRAPADA verde-oliva em duas camadas, cheia de furos — o mesmo modelo do Mael com as peças da fantasia
// ligadas (models/vigiliaProps.js → addMaelHeroiProps).
// Kit (PROPOSTA): a machadinha pesa mais; o Chamado vira a CAPA DE FOLHAS (some num redemoinho de folhas secas e
// reaparece colado no adversário) e o Ímpeto rende mais.
import base from '../mael.js';

const FLAME = 0xffd84a;
const DRYLEAF = 0xb0903a;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'mael_heroi',
  form: true,
  baseId: 'mael',
  name: 'MAEL — O HERÓI DA VIGÍLIA',
  model: 'mael_heroi',
  energyColor: FLAME,
  info: {
    ...base.info,
    weapon: 'A lâmina e o escudo da Vigília, e as pedras do druida',
    style: 'A fantasia do Samhain: a lâmina da Vigília corta, o escudo segura o tranco, e ele some nas folhas secas e reaparece em cima do adversário',
    identity: 'Herói da Vigília (até o fim do round)',
    tagline: 'No Samhain, vivos e mortos são iguais.',
  },
  stats: { ...base.stats, maxHealth: 1600, moveSpeed: 7.7 }, // cabe a vida extra da transformação
  chargeFx: { style: 'aura', color: FLAME, smoke: 0x2a2414 },
  // A LÂMINA E O ESCUDO DA VIGÍLIA (cânone, ep. 3: "Mael rasgando-os com uma das lâminas da Vigília"; o escudo, pedido
  // do dono 2026-11-28): a espada corta no lugar da machadinha e o punho esquerdo bate com o escudo (PROPOSTA)
  melee: {
    ...base.melee,
    name: 'Lâmina e Escudo da Vigília',
    strikes: base.melee.strikes.map((s) => {
      const name = s.name.replace('Machadinha', 'Lâmina').replace('Machadada', 'Golpe da Lâmina').replace('Soco do Druida', 'Escudada').replace('Gancho', 'Escudo de Baixo');
      const blade = s.hitSound === 'axeHit';
      return { ...s, name, damage: Math.round(s.damage * 1.12), range: blade ? s.range + 0.25 : s.range, hitSound: blade ? 'bladeHit' : s.hitSound, guardCrush: /^Escud/.test(name) ? (s.guardCrush || 0) + 8 : s.guardCrush };
    }),
  },
  abilities: [
    byId.machadada,
    {
      // △ + L2 CAPA DE FOLHAS (PROPOSTA): some num redemoinho de folhas secas e reaparece colado no adversário
      id: 'capaFolhas',
      name: 'Capa de Folhas',
      input: 'carga+dodge',
      type: 'blink',
      description: 'Some num redemoinho de folhas secas e reaparece: na direção do analógico ou, sem direção, colado ao lado do adversário.',
      energyCost: 18,
      cooldown: 8,
      distance: 8,
      flankDistance: 2.2,
      vanishTime: 0.25,
      color: DRYLEAF,
      residue: 'leaves',
    },
    byId.raizes,
    byId.chamaProtecao,
  ],
  awakening: null,
  // o Ímpeto rende mais; o ESCUDO DA VIGÍLIA: a defesa gasta menos e o empurrão pesa menos (PROPOSTA)
  passives: [{ type: 'masochist', ratio: 0.14 }, { type: 'thickSkin', knockback: 0.85, chip: 0.6, guard: 0.7 }],
};
