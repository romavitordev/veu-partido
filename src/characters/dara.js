// DARA ALICE VENTURINI (id: dara) — Os Cinco, a MÉDICA DE CAMPO (pedido de 2026-10-31: completar Os Cinco). Wiki "Dara
// Alice Venturini": Especialista / Médica de Campo, sem afinidade paranormal; no cartão do grupo é o SUPORTE MÉDICO,
// "auxiliando e protegendo seus aliados", e uma ótima INVESTIGADORA. Itens da arte: a LANTERNA UV, o RADAR, o ALICATE,
// o WALKIE-TALKIE no braço e a BOLSA ENORME no ombro.
// Do cânone (RPG): Paramédico (cura um aliado), Eclético e Perito (testes de perícia), Dedicação (+PE).
// PROPOSTA de jogo (marcada): ela luta nos punhos (não tem arma no cânone), a lanterna UV cega, a bolsa vira o especial e
// a Transformação "Ninguém Fica Pra Trás" (o luto dos Cinco pelo Voytek) — nada disso é cena da série.
// Elemento: Medo (neutro), como o Veríssimo — ela não tem afinidade.
import kian from './kian.js';

const CYAN = 0x2ab8c8;
const UV = 0x9a5aff;
const plain = (s, name) => {
  const { impactFx, ...rest } = s; // sem os sigilos do Kian: soco comum
  return { ...rest, name, damage: Math.round(s.damage * 1.15) };
};

export default {
  id: 'dara',
  name: 'DARA',
  model: 'dara',
  color: '#2ab8c8',
  origin: 'Os Cinco',
  element: 'medo',
  energyColor: CYAN,
  info: {
    weapon: 'Os punhos, a lanterna UV e a bolsa enorme de primeiros socorros',
    style: 'Suporte que aguenta: cega com a lanterna, se cura no meio da luta e acha a brecha do adversário',
    identity: 'A médica de campo dos Cinco, a faixa ciano e as meias de cores diferentes',
    tagline: 'Fica parado que eu já te remendo.',
  },
  stats: { moveSpeed: 7.9, attackSpeed: 1.08 }, // leve e rápida (1,57 m)
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'vic_guizo', block: 'block' },

  melee: {
    name: 'Punhos',
    strikes: kian.melee.strikes.map((s, i) => plain(s, ['Jab', 'Direto', 'Sequência rápida', 'Soco no corpo', 'Cruzado', 'Soco de bolsa'][i] || s.name)),
    up: plain(kian.melee.up, 'Gancho'),
    down: plain(kian.melee.down, 'Soco no chão'),
    forward: plain(kian.melee.forward, 'Avanço'),
    back: plain(kian.melee.back, 'Empurrão'),
    side: plain(kian.melee.side, 'Gancho em movimento'),
    air: plain(kian.melee.air, 'Soco aéreo'),
  },

  // □ LANTERNA UV (o item da arte): o facho na cara — cego quem estiver de frente e olhando
  ranged: {
    name: 'Lanterna UV',
    type: 'photoFlash',
    description: 'Acende a lanterna UV na cara do adversário: quem estiver à frente e olhando para ela fica CEGO por 1,4 s (a guarda cai). De costas ou esquivando na hora, escapa.',
    energyCost: 10,
    cooldown: 7,
    windup: 0.26,
    step: 1.5,
    range: 8,
    arc: 70,
    lookArc: 110,
    blind: 1.4,
    color: UV,
    ai: { when: 'far', min: 2 },
  },

  abilities: [
    {
      // △ + ○ PARAMÉDICO (cânone: "cura 2d10 pontos de vida de um aliado") — na luta, nela mesma
      id: 'paramedico',
      name: 'Paramédico',
      input: 'carga+physical',
      type: 'healOverTime',
      description: 'Abre a bolsa e se remenda no meio da luta: recupera vida por 2 s. Apanhar no meio não cancela.',
      energyCost: 25,
      cooldown: 20,
      heal: 150,
      duration: 2.0,
      style: 'mist',
      color: CYAN,
      ai: { when: 'hurt' },
    },
    {
      // △ + L2 OLHO DE INVESTIGADORA (cânone: "uma ótima investigadora"; Perito/Eclético) — acha a brecha
      id: 'olhoInvestigadora',
      name: 'Olho de Investigadora',
      input: 'carga+dodge',
      type: 'analyze',
      buffType: 'investigada',
      label: 'INVESTIGADA (DARA)',
      description: 'Liga o radar, observa e acha onde dói: por 7 s o adversário recebe 30% a mais de dano dos golpes físicos e do especial.',
      energyCost: 20,
      cooldown: 16,
      range: 14,
      duration: 7,
      takenMult: 1.3,
      takenKinds: ['melee', 'special'],
      color: CYAN,
    },
    {
      // R2 + △ DEDICAÇÃO (cânone: "+PE e o limite de PE por turno aumenta") — mais sanidade e mais firmeza
      id: 'dedicacao',
      name: 'Dedicação',
      input: 'block+carga',
      type: 'selfBuff',
      buffType: 'dedicacao',
      label: 'DEDICAÇÃO',
      description: 'Respira fundo e se concentra no paciente da vez: aguenta 2 golpes sem recuar e recupera as esquivas.',
      energyCost: 15,
      cooldown: 18,
      duration: 6,
      armor: 2,
      refillDodges: 3,
      color: CYAN,
      ai: { when: 'near' },
    },
  ],

  // ESPECIAL A BOLSA DE EMERGÊNCIA: a lanterna UV na cara, dois chutes e a bolsa enorme girada com tudo
  special: {
    name: 'Bolsa de Emergência',
    banner: 'Segura essa!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: CYAN,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'charge_fists', time: 0.4 },
    dash: { speed: 17, maxTime: 0.5, contact: 1.9 },
    hits: [
      { t: 0.55, anim: 'jab', dur: 0.24, share: 0.1, fx: { kind: 'punch', color: UV }, sound: 'punch', shout: 'OLHA A LUZ!', victimAnim: 'stagger' },
      { t: 0.85, anim: 'kick_front', dur: 0.3, share: 0.15, fx: { kind: 'punch' }, sound: 'kick' },
      { t: 1.25, anim: 'spin_kick', dur: 0.45, share: 0.2, fx: { kind: 'punch' }, sound: 'kick' },
      { t: 1.9, anim: 'heavy_punch', dur: 0.5, share: 0.55, fx: { kind: 'smash', big: true }, sound: 'heavyPunch', final: true, call: 'BOLSA DE EMERGÊNCIA', push: 0.2 },
    ],
    endReaction: { knockback: 5, lowLaunch: true },
    selfHeal: 0.05,
    bannerAt: 0.2,
    length: 3.0,
  },

  // TRANSFORMAÇÃO NINGUÉM FICA PRA TRÁS (proposta): a médica que não larga mais ninguém — mais rápida, as habilidades
  // voltam mais cedo e ela se recupera aos poucos enquanto dura
  awakening: {
    name: 'Ninguém Fica Pra Trás',
    banner: 'Ninguém Fica Pra Trás',
    type: 'awakenMode',
    anim: 'charge_fists',
    mult: 1.12, speedMult: 1.12, cdRate: 1.6, aura: 'smoke', color: CYAN, heal: 0.12,
  },

  passives: [
    // PROPOSTA (balanço): Médica de Campo — sabe cair e se proteger; segura 14% do dano físico e de tiro
    { type: 'resistant', kinds: ['melee', 'ranged'], mult: 0.86 },
  ],
};
