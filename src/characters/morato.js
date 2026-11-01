// MORATO VERTALER (id: morato) — Os Cinco, o LÍDER (pedido de 2026-10-31: completar Os Cinco). Wiki "Morato Vertaler":
// ex-agente da Ordo Realitas, expulso, fundou Os Cinco para caçar os Alheios. Foi sequestrado investigando a origem
// deles, libertado pelos pupilos e, no fim, avançou contra o Estrangeiro para proteger o grupo e morreu derretido em
// gosma verde. Ritual do cânone: "TAMO COM ELE" (os aliados ganham +5 de Iniciativa no começo do combate). Item: a LARVA
// DA FÚRIA "Calabresa" (Larva de Sangue de 15 cm, apelido dado pelo Lírio; quem engole fica tomado pelo ódio). As
// AMARRAS DE SANGUE "Magras" eram dele antes de ele dar ao Lírio (dono, 2026-11-01): ele estala as Magras com a Calabresa.
// Aparência: cicatriz de Conhecimento na cabeça, faixa vermelha, jaqueta azul, colar militar.
// Arma do cânone: a METRALHADORA (□). PROPOSTA de jogo (marcada): luta nos punhos (treino de agente), a Linha de Frente
// (R2 + △) pelo sacrifício dele, o especial "Pelos Cinco" e a Transformação "Último Sacrifício".
// Elemento: PROPOSTA Conhecimento (a cicatriz; a wiki não lista o elemento).
import kian from './kian.js';

const RED = 0xb0242a;
const GOLD = 0xe8b040;
const plain = (s, name) => {
  const { impactFx, ...rest } = s;
  return { ...rest, name, damage: Math.round(s.damage * 1.2) };
};

export default {
  id: 'morato',
  name: 'MORATO',
  model: 'morato',
  color: '#2c4a86',
  origin: 'Os Cinco',
  element: 'conhecimento',
  energyColor: GOLD,
  info: {
    weapon: 'Os punhos, a metralhadora, as Magras e a Larva da Fúria "Calabresa"',
    style: 'Líder na linha de frente: dá o "Tamo com Ele", segura a pancada pelos Cinco e, quando precisa, engole a Calabresa',
    identity: 'Ex-agente da Ordo Realitas, o fundador dos Cinco: faixa vermelha, jaqueta azul e o colar militar',
    tagline: 'Tamo com ele.',
  },
  stats: { moveSpeed: 7.5, attackSpeed: 1.0 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'vic_xande', block: 'block' },

  melee: {
    name: 'Punhos de agente',
    strikes: kian.melee.strikes.map((s, i) => plain(s, ['Jab', 'Direto', 'Sequência', 'Soco no corpo', 'Cotovelada', 'Direto pesado'][i] || s.name)),
    up: plain(kian.melee.up, 'Gancho'),
    down: plain(kian.melee.down, 'Soco no chão'),
    forward: plain(kian.melee.forward, 'Avanço'),
    back: plain(kian.melee.back, 'Empurrão'),
    side: plain(kian.melee.side, 'Gancho em movimento'),
    air: plain(kian.melee.air, 'Soco aéreo'),
  },

  // □ METRALHADORA (cânone: a arma dele na arte "Metralhadora de Morato em Sinais do Outro Lado") — rajada pesada
  ranged: {
    name: 'Metralhadora',
    type: 'projectile',
    anim: 'shoot_rifle',
    showProp: 'mgHand',
    hideProp: 'mgBack',
    description: 'Tira a metralhadora das costas e solta uma rajada de 6 tiros.',
    windup: 0.26,
    recovery: 0.32,
    count: 6,
    interval: 0.07,
    damage: 10, // por tiro (rajada = 60)
    range: 30,
    speed: 85,
    radius: 0.25,
    spread: 0.04,
    knockback: 0.7,
    hitstun: 0.16,
    cooldown: 2.8,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffd27a,
    sound: 'm4',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + ○ TAMO COM ELE (ritual do cânone: os aliados agem primeiro) — o grito do líder
      id: 'tamoComEle',
      name: 'Tamo com Ele',
      input: 'carga+physical',
      type: 'selfBuff',
      buffType: 'tamoComEle',
      label: 'TAMO COM ELE!',
      anim: 'point',
      description: '"Tamo com ele!" — por 7 s anda 15% mais rápido, bate 15% mais forte e recupera as esquivas. Na batalha em equipe, as assistências ficam PRONTAS na hora.',
      energyCost: 22,
      cooldown: 18,
      duration: 7,
      damageMult: 1.15,
      speedMult: 1.15,
      refillDodges: 3,
      affects: ['melee', 'ranged'],
      orderAllies: true,
      color: GOLD,
    },
    {
      // △ + L2 LARVA DA FÚRIA "CALABRESA" (item do cânone: quem engole fica tomado pelo ódio) com as AMARRAS DE SANGUE
      // "MAGRAS" — as mesmas do Lírio: eram do Morato antes de ele dar de presente ao Lírio (pedido do dono, 2026-11-01).
      // Estala as Magras no alvo e engole a Calabresa enquanto ele está preso.
      id: 'larvaCalabresa',
      name: 'Larva da Fúria "Calabresa"',
      input: 'carga+dodge',
      type: 'bloodBind',
      description: 'Estala as Magras (as Amarras de Sangue que depois deu ao Lírio) e prende o alvo; logo em seguida engole a Calabresa, a Larva de Sangue: por 6 s tomado pelo ódio — golpes físicos 35% mais fortes que sangram, mas recebe 10% a mais de dano.',
      energyCost: 25,
      cooldown: 20,
      windup: 0.3,
      range: 9,
      arc: 40,
      hold: 1.0,
      damage: 24,
      gut: true, // o mesmo visual das Magras do Lírio (tripas trançadas + voltas no corpo)
      vsConhecimento: 1.6,
      buff: {
        buffType: 'calabresa',
        label: 'CALABRESA',
        duration: 6,
        damageMult: 1.35,
        affects: ['melee'],
        takenMult: 1.1,
        meleeBleed: { dps: 3, duration: 2.5 },
        redAura: 0xff1a1a,
        color: RED,
      },
      ai: { when: 'far', min: 2 },
    },
    {
      // R2 + △ LINHA DE FRENTE (proposta pelo cânone: ele avançou contra o Estrangeiro para salvar o grupo)
      id: 'linhaDeFrente',
      name: 'Linha de Frente',
      input: 'block+carga',
      type: 'heavyProtection',
      label: 'LINHA DE FRENTE',
      description: 'Fica na frente dos Cinco: por 6 s recebe 25% menos dano e aguenta 2 golpes sem recuar.',
      energyCost: 22,
      cooldown: 20,
      duration: 6,
      takenMult: 0.75,
      armor: 2,
      speedMult: 0.95,
      color: 0x2c4a86,
    },
  ],

  // ESPECIAL PELOS CINCO (proposta): o líder entra na frente e bate por todos
  special: {
    name: 'Pelos Cinco',
    banner: 'Pelos Cinco!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: GOLD,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'charge_fists', time: 0.45 },
    dash: { speed: 17, maxTime: 0.5, contact: 1.9 },
    hits: [
      { t: 0.55, anim: 'jab', dur: 0.24, share: 0.1, fx: { kind: 'punch', color: GOLD }, sound: 'punch', shout: 'TAMO COM ELE!' },
      { t: 0.85, anim: 'cross', dur: 0.26, share: 0.12, fx: { kind: 'punch', color: GOLD }, sound: 'punch' },
      { t: 1.15, anim: 'flurry', dur: 0.5, share: 0.23, fx: { kind: 'punch', color: GOLD }, sound: 'punch' },
      { t: 1.9, anim: 'heavy_punch', dur: 0.5, share: 0.55, fx: { kind: 'smash', big: true, color: RED }, sound: 'heavyPunch', final: true, call: 'PELOS CINCO', push: 0.2 },
    ],
    endReaction: { knockback: 5, lowLaunch: true },
    orderAllies: true,
    bannerAt: 0.2,
    length: 3.0,
  },

  // TRANSFORMAÇÃO ÚLTIMO SACRIFÍCIO (proposta pelo cânone): tudo pelo grupo
  awakening: {
    name: 'Último Sacrifício',
    banner: 'Último Sacrifício',
    type: 'awakenMode',
    anim: 'charge_fists',
    mult: 1.2, takenMult: 0.85, speedMult: 1.08, aura: 'smoke', color: GOLD, heal: 0.08,
  },

  passives: [
    // PROPOSTA: o líder que não cai — abaixo de 30% de vida, volta com tudo uma vez por luta
    { type: 'revenge', label: 'AINDA DE PÉ', below: 0.3, mult: 1.25, duration: 7, energy: 30 },
    { type: 'resistant', kinds: ['melee', 'ranged'], mult: 0.9 },
  ],
};
