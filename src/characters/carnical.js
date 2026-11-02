// O CARNIÇAL (id: carnical) — criatura de Morte do Outro Lado, jogável (pedido do TODO: "O Carniçal como personagem
// jogável"; ele saiu das invocações do Deus da Morte na v3.31.0). Wiki "Carniçal Preto da Morte" (arte do livro de
// regras e miniatura de O Segredo na Floresta): humanoide magro e musculoso de Lodo preto estriado, a caveira rachada
// tomada pelo Lodo, o cérebro vermelho à mostra e o SÍMBOLO ESPIRAL brilhando na testa.
// Kit (Habilidades da wiki, todas confirmadas):
//   Garra da Morte ......... as garras do combo e o especial ("poucos e velozes movimentos")
//   Físico Paranormal ...... o salto (△ + ×)
// KIT FRIO (pedido do dono, 2026-11-01; wiki: "calmo e preciso, até mesmo quando prepara um ataque", "assim que é
// atacado, olha para seu agressor e usa sua Hipnose para o controlar"): ele não ataca por impulso — controla. O □ são as
// LÁGRIMAS DE LODO (PROPOSTA a partir do cânone: os controlados choram Lodo Preto) que deixam LENTO, e a Hipnose Espiral
// faz a vítima SE GOLPEAR (a morte de Brúlio). Só no Instinto Mortal ele vira o bicho das garras.
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
    style: 'Frio e preciso: deixa a vítima lenta com o Lodo, hipnotiza quem olha para o Símbolo e a faz se ferir; ferido, vira bicho',
    identity: 'A criatura de Lodo com o Símbolo Espiral na testa',
    tagline: 'Não olhe para a espiral.',
  },
  stats: { moveSpeed: 7.4, attackSpeed: 1.0 }, // anda calmo, gracioso e arrogante (wiki); o Instinto Mortal acelera
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

  // □ LÁGRIMAS DE LODO (PROPOSTA): um fio de Lodo Preto lançado com um gesto — pesa nas pernas de quem pega (LENTO)
  ranged: {
    name: 'Lágrimas de Lodo',
    type: 'projectile',
    anim: 'point',
    description: 'Com um gesto calmo, lança Lodo Preto: quem pega fica LENTO por 2,5 s.',
    windup: 0.3,
    recovery: 0.32,
    count: 1,
    interval: 0,
    damage: 28,
    range: 16,
    speed: 18,
    radius: 0.45,
    spread: 0,
    knockback: 0.6,
    hitstun: 0.3,
    cooldown: 2.8,
    energyCost: 0,
    visual: 'decay',
    color: LODO,
    element: 'morte',
    sound: 'drain',
    hitSound: 'impact',
    onHit: { slow: { time: 2.5, mult: 0.65 } },
  },

  abilities: [
    {
      // △ + ○ HIPNOSE ESPIRAL (wiki: "assim que é feito o contato visual... as faz atacar a si mesmas, como na morte de
      // Brúlio"; os controlados choram Lodo Preto)
      id: 'hipnoseCarnical',
      name: 'Hipnose Espiral',
      input: 'carga+physical',
      type: 'spiralSelfHarm',
      anim: 'point',
      description: 'O Símbolo Espiral da testa acende: quem estiver OLHANDO para ele entra em transe, chora Lodo e se golpeia duas vezes. Ao acordar, fica LENTO por 3 s.',
      energyCost: 30,
      cooldown: 13,
      windup: 0.45,
      recovery: 0.35,
      range: 11,
      arc: 50,
      lookArc: 120,
      trance: 2.0,
      hits: 2,
      gap: 0.75,
      damage: 32,
      slow: { time: 3, mult: 0.6 },
      color: RED,
      ai: { when: 'far', min: 2 },
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
    ranged: { ...raziel.ranged, name: 'Investida Mortal', color: RED, element: 'morte', bleed: undefined },
    mult: 1.18, speedMult: 1.15, cdRate: 1.5, aura: 'smoke', color: RED, heal: 0.08,
  },

  passives: [
    // CORPO FECHADO (wiki: "imune a qualquer dano balístico; a única fraqueza é o crânio") — no jogo os tiros entram com
    // 40% (imunidade total anularia os atiradores do elenco)
    { type: 'closedBody', mult: 0.4 },
    // PROPOSTA DE JOGO (valores pedidos): 25% de chance, recarga interna de 12 s e um golpe durante o transe curto.
    { type: 'aggressorGaze', chance: 0.25, cooldown: 12, trance: 0.8, damage: 20 },
    { type: 'elementalAffinity', element: 'morte', mult: 1.1, resist: 0.85 },
  ],
};
