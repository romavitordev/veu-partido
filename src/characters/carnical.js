// O CARNIÇAL (id: carnical) — criatura de Morte do Outro Lado, jogável (pedido do TODO: "O Carniçal como personagem
// jogável"; ele saiu das invocações do Deus da Morte na v3.31.0). Wiki "Carniçal Preto da Morte" (arte do livro de
// regras e miniatura de O Segredo na Floresta): humanoide magro e musculoso de Lodo preto estriado, a caveira rachada
// tomada pelo Lodo, o cérebro vermelho à mostra e o SÍMBOLO ESPIRAL brilhando na testa.
// Kit (Habilidades da wiki, todas confirmadas):
//   Garra da Morte ......... as garras do combo e o especial ("poucos e velozes movimentos")
//   Físico Paranormal ...... □ Investida Mortal (velocidade e alcance assustadores) e o salto (△ + ×)
//   Pancada Poderosa ....... △ + L2 (empurra a vítima para longe)
//   Hipnose Espiral ........ △ + ○ (o contato visual: a vítima só vê o Símbolo Espiral)
//   Comando ................ R2 + △ (uma ordem simples à criatura próxima)
//   Corpo Fechado .......... passiva: os tiros quase não entram; a fraqueza é o crânio (no jogo: só tiro reduzido)
//   Instinto Mortal ........ a Transformação ("quando ferido, abandona a postura controlada": mais rápido e implacável)
// Reanimar Corpos fica de fora (invocação de mortos-vivos: o Deus da Morte e o Diabo já têm as deles).
// Modelo próprio: tools/blender/char_carnical.py → public/models/carnical.glb (esqueleto de lutador). Garras com os
// clipes de besta do Raziel (db_*).
import raziel from './raziel.js';
import juan from './juan.js';
import ferreiro from './ferreiro.js';

const LODO = 0x2a2632;
const RED = 0xd8261a;
const BONE = 0xd8cbb0;
const abil = (def, id) => def.abilities.find((a) => a.id === id);
// as garras do Raziel com o dano de Morte e o rastro vermelho do Símbolo
const claw = (s, name) => ({ ...s, name, element: 'morte', bleed: undefined, trail: { ...(s.trail || {}), color: RED } });

export default {
  id: 'carnical',
  name: 'CARNIÇAL',
  model: 'carnical',
  color: '#8a1a14',
  origin: 'Outro Lado',
  element: 'morte',
  energyColor: RED,
  info: {
    weapon: 'Garras de Lodo que exalam a Morte',
    style: 'Rápido e brutal: entra de longe num salto, rasga com as garras e hipnotiza quem olha para o Símbolo',
    identity: 'A criatura de Lodo com o Símbolo Espiral na testa',
    tagline: 'Não olhe para a espiral.',
  },
  stats: { moveSpeed: 8.4, attackSpeed: 1.08 }, // Físico Paranormal
  anims: { idle: 'idle_raziel', run: 'run', charge: 'db_charge', victory: 'taunt_roar', block: 'db_block' },
  chargeFx: { style: 'aura', color: RED, smoke: LODO },
  dodge: { style: 'default', distance: 4.6 },

  // GARRA DA MORTE: o combo inteiro de garras (os clipes de besta do Raziel)
  melee: {
    name: 'Garra da Morte',
    strikes: raziel.melee.strikes.map((s, i) => claw(s, ['Garra da Morte', 'Garra de volta', 'Rasgo cruzado', 'Dilacerar', 'Dilacerar'][i] || s.name)),
    up: claw(raziel.melee.up, 'Garra de baixo'),
    down: claw(raziel.melee.down, 'Esmagar'),
    forward: claw(raziel.melee.forward, 'Avanço da criatura'),
    back: claw(raziel.melee.back, 'Recua e rasga'),
    side: claw(raziel.melee.side, 'Garra em giro'),
    air: claw(raziel.melee.air, 'Cair sobre a vítima'),
  },

  // □ INVESTIDA MORTAL (Físico Paranormal): atravessa a arena e rasga em X no fim
  ranged: {
    ...raziel.ranged,
    name: 'Investida Mortal',
    description: 'Físico Paranormal: dispara como um bicho, 10 m em linha, e rasga em X com as garras quem encontrar no caminho.',
    color: RED,
    element: 'morte',
    bleed: undefined,
  },

  abilities: [
    {
      // △ + ○ HIPNOSE ESPIRAL (wiki: "assim que é feito o contato visual, o alvo só consegue visualizar o Símbolo Espiral")
      ...abil(ferreiro, 'hipnoseEspiral'),
      id: 'hipnoseCarnical',
      description: 'O Símbolo Espiral da testa acende: quem olha para ele anda em círculos até o Carniçal, sem conseguir defender, e fica parado em transe.',
      color: RED,
    },
    {
      // △ + × SALTO (Físico Paranormal: "pode usar suas musculosas pernas para saltar bons metros") — o bote do Raziel
      ...abil(raziel, 'boteRetalhador'),
      id: 'saltoCarnical',
      name: 'Salto do Carniçal',
      input: 'carga+jump',
      description: 'Agacha e salta bons metros sobre a vítima, descendo com as duas garras. Quem esquiva ainda toma metade. Aguenta um golpe na preparação.',
      element: 'morte',
      bleed: undefined,
      color: RED,
    },
    {
      // △ + L2 PANCADA PODEROSA (wiki: "golpes tão intensos que chegam a empurrar suas vítimas para longe")
      id: 'pancadaPoderosa',
      name: 'Pancada Poderosa',
      input: 'carga+dodge',
      type: 'heavyBlow',
      description: 'Ergue os dois braços e desce com tudo: a vítima é arremessada para longe. Aguenta um golpe na preparação.',
      energyCost: 25,
      cooldown: 11,
      anim: 'db_rend',
      duration: 0.8,
      armorFrom: 0.06,
      impact: 0.36,
      step: 4,
      stepTime: 0.22,
      track: true,
      range: 2.6,
      arc: 140,
      damage: 70,
      knockback: 9,
      whiffRecovery: 0.35,
      element: 'morte',
      hitSound: 'heavyPunch',
      color: RED,
    },
    {
      // R2 + △ COMANDO (wiki: "com uma simples ordem, obriga uma criatura próxima a obedecer") — a ordem do Juan
      ...abil(juan, 'perturbacao'),
      id: 'comandoCarnical',
      input: 'block+carga',
      name: 'Comando',
      description: 'Uma ordem que entra na cabeça de quem está perto: "PARE!" (paralisa), "VENHA!" (puxa) ou "AJOELHE!" (derruba).',
      color: RED,
    },
  ],

  // ESPECIAL GARRA DA MORTE: "dilacera suas vítimas destruindo carne, osso e vitalidade em poucos e velozes movimentos"
  special: {
    ...raziel.special,
    name: 'Garra da Morte',
    banner: 'Garra da Morte',
    color: RED,
    prepare: { anim: 'taunt_roar', time: 0.5 },
    hits: raziel.special.hits.map((h) => ({
      ...h,
      anim: h.anim === 'raziel_feast' ? 'db_cross' : h.anim,
      drain: undefined,
      bleed: undefined,
      fx: { ...h.fx, color: h.final ? RED : LODO, color2: h.final ? BONE : undefined },
    })),
  },

  // INSTINTO MORTAL (wiki: "quando ferido, abandona a postura controlada e revela sua verdadeira natureza: mais agressivo e
  // implacável, recorrendo constantemente à Hipnose Espiral") — mais rápido, mais forte e as habilidades voltam mais cedo
  awakening: {
    name: 'Instinto Mortal',
    banner: 'Instinto Mortal',
    type: 'awakenMode',
    mult: 1.18, speedMult: 1.15, cdRate: 1.5, aura: 'smoke', color: RED, heal: 0.08,
  },

  passives: [
    // CORPO FECHADO (wiki: "imune a qualquer dano balístico; a única fraqueza é o crânio") — no jogo os tiros entram com
    // 40% (imunidade total anularia os atiradores do elenco)
    { type: 'closedBody', mult: 0.4 },
    { type: 'elementalAffinity', element: 'morte', mult: 1.1, resist: 0.85 },
  ],
};
