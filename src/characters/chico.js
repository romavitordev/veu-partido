// FRANCISCO "CHICO" ALBUQUERQUE (id: chico) — Os Cinco, o TÉCNICO (pedido de 2026-10-31: completar Os Cinco). Wiki
// "Francisco Albuquerque": Especialista / Técnico; no cartão do grupo é o especialista em tecnologia, "criatividade e
// improviso no manuseio de aparelhos". Na primeira cena ele acende o FAROL DA VAN no Rastejador Sombrio para ele não
// fugir. Itens: o SCANNER DE MANIFESTAÇÃO PARANORMAL DE ENERGIA, as JOIAS DE ESCUDO MENTAL (Conhecimento: resistência
// mental) e o TECLADO DE CONEXÃO NEURAL (glifos de Energia). Do RPG: Remendão, Engenhosidade, Nerd, Perito, Eclético.
// ARMA do cânone (wiki, Arsenal): a MAC-10 com o detalhe vermelho em cima e os dois fios coloridos ligando a arma a ele.
// É o □.
// PROPOSTA de jogo (marcada): no corpo a corpo luta nos punhos e com a chave inglesa do cinto, o pulso do scanner
// (R2 + ×), o especial é a Conexão Neural e a Transformação é a Engenhosidade.
// Elemento: Energia (o scanner e o teclado são de Energia).
import kian from './kian.js';

const YELLOW = 0xe0b828;
const ENERGY = 0xa865ff;
const plain = (s, name) => {
  const { impactFx, ...rest } = s;
  return { ...rest, name, damage: Math.round(s.damage * 1.35) };
};

export default {
  id: 'chico',
  name: 'CHICO',
  model: 'chico',
  color: '#e0b828',
  origin: 'Os Cinco',
  element: 'energia',
  energyColor: YELLOW,
  info: {
    weapon: 'A Mac-10 dos fios coloridos, os punhos, a chave inglesa, o scanner de Energia e a van',
    style: 'Improvisa com o que tiver: a Mac-10 e o pulso do scanner de longe, o farol da van na cara e a mente blindada pelas joias',
    identity: 'O técnico dos Cinco: óculos refletivos com gambiarra, fones no pescoço e o toca-discos na bolsa',
    tagline: 'Calma, eu conserto isso. Com fita.',
  },
  stats: { moveSpeed: 7.9, attackSpeed: 1.1 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'vic_xande', block: 'block' },

  melee: {
    name: 'Punhos e chave inglesa',
    strikes: kian.melee.strikes.map((s, i) => plain(s, ['Jab', 'Direto', 'Sequência nervosa', 'Soco no corpo', 'Chave inglesa', 'Chave na cabeça'][i] || s.name)),
    up: plain(kian.melee.up, 'Gancho'),
    down: plain(kian.melee.down, 'Martelada no chão'),
    forward: plain(kian.melee.forward, 'Avanço'),
    back: plain(kian.melee.back, 'Empurrão'),
    side: plain(kian.melee.side, 'Gancho em movimento'),
    air: plain(kian.melee.air, 'Soco aéreo'),
  },

  // □ MAC-10 (cânone): a rajada mais rápida e mais espalhada que a da Dara
  ranged: {
    name: 'Mac-10',
    description: 'A Mac-10 do detalhe vermelho, presa nele pelos dois fios coloridos: rajada rápida de 6 tiros.',
    type: 'projectile',
    anim: 'shoot_rifle',
    showProp: 'smg',
    windup: 0.22,
    recovery: 0.3,
    count: 6,
    interval: 0.055,
    damage: 7, // por tiro (rajada = 42)
    range: 24,
    speed: 80,
    radius: 0.22,
    spread: 0.09,
    knockback: 0.5,
    hitstun: 0.14,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffd27a,
    sound: 'm4',
    hitSound: 'impact',
  },

  abilities: [
    {
      // R2 + × PULSO DO SCANNER (proposta): a antena da bolsa solta uma onda de Energia pelo chão
      id: 'pulsoScanner',
      name: 'Pulso do Scanner',
      input: 'block+jump',
      type: 'throwProjectile',
      anim: 'point',
      description: 'Aumenta o ganho do Scanner de Energia até a antena estourar: uma onda de Energia corre pelo chão e empurra quem pegar.',
      energyCost: 10,
      cooldown: 6,
      windup: 0.26,
      recovery: 0.32,
      sound: 'carga',
      element: 'energia',
      color: ENERGY,
      projectile: { damage: 42, range: 16, speed: 22, radius: 0.55, knockback: 1.6, hitstun: 0.45, visual: 'shockwave', color: ENERGY },
      ai: { when: 'far', min: 3 },
    },
    {
      // △ + ○ FAROL DA VAN (cânone: acende o farol no Rastejador Sombrio para ele não fugir)
      id: 'farolVan',
      name: 'Farol da Van',
      input: 'carga+physical',
      type: 'photoFlash',
      description: 'Liga o farol da van na cara do adversário: quem estiver de frente e olhando fica CEGO por 1,8 s.',
      energyCost: 18,
      cooldown: 12,
      windup: 0.3,
      step: 2,
      range: 10,
      arc: 80,
      lookArc: 110,
      blind: 1.8,
      color: 0xfff2b0,
      ai: { when: 'far', min: 2 },
    },
    {
      // △ + L2 SCANNER DE ENERGIA (cânone: identifica qualquer manifestação de Energia em volta) — acha a brecha
      id: 'scannerEnergia',
      name: 'Scanner de Energia',
      input: 'carga+dodge',
      type: 'analyze',
      buffType: 'escaneado',
      label: 'ESCANEADO (CHICO)',
      description: 'Passa o scanner no adversário e acha o ponto fraco: por 7 s ele recebe 35% a mais de dano de tudo do Chico.',
      energyCost: 20,
      cooldown: 16,
      range: 14,
      duration: 7,
      takenMult: 1.35,
      takenKinds: ['melee', 'ranged', 'special'],
      color: ENERGY,
    },
    {
      // R2 + △ REMENDÃO (cânone: "remove a condição quebrado de um equipamento") — remenda a si mesmo na fita
      id: 'remendao',
      name: 'Remendão',
      input: 'block+carga',
      type: 'healOverTime',
      description: 'Silver tape em tudo: remenda o que quebrou e recupera vida por 2 s.',
      energyCost: 22,
      cooldown: 20,
      heal: 120,
      duration: 2.0,
      style: 'mist',
      color: YELLOW,
      ai: { when: 'hurt' },
    },
    {
      // △ + □ A VAN DOS CINCO (pedido do dono, 2026-11-01; PROPOSTA — no cânone a van é do grupo e a Dara dirige no
      // Acampamento): o Chico chama no walkie, a van vem por trás com a DARA no volante, ele pula de lado e ela atropela
      id: 'vanDosCinco',
      name: 'A Van dos Cinco',
      input: 'carga+ranged',
      type: 'stuntCar',
      vehicle: 'van',
      behind: 6, // mantém a van dentro da praça da Ilha de Tipora antes da arrancada
      label: 'PEGA ELE, DARA!',
      description: 'Chama a van no walkie: ela vem por trás com a Dara no volante, o Chico pula de lado e a van atropela quem estiver na frente (quebra a defesa).',
      energyCost: 30,
      cooldown: 18,
      delay: 0.45,
      speed: 24,
      damage: 74,
      knockback: 7.5,
      ai: { when: 'far', min: 3 },
    },
  ],

  // ESPECIAL MINA DE PROXIMIDADE (wiki "Dara Alice Venturini", Granja Abobrinha: ela e o Chico armam uma MINA DE
  // PROXIMIDADE, os outros atraem o Interflorado até ela "e Chico a explodindo"; na estação de rádio, contra o Fummu,
  // "Chico lança uma granada de fumaça"). Na luta: a granada de fumaça, a mina no pé do alvo, a Mac-10 segurando ele em
  // cima dela e a explosão. PROPOSTA: a ordem e os números. Antes: Conexão Neural (só socos).
  special: {
    name: 'Mina de Proximidade',
    banner: 'Fogo no buraco!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: YELLOW,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'throw_r', time: 0.35, showProp: 'smg' },
    dash: { speed: 12, maxTime: 0.6, contact: 6 },
    standOff: 4.5,
    hits: [
      { t: 0.1, noHit: true, anim: 'throw_r', dur: 0.5, smoke: true, victimAnim: 'stagger', shout: 'SEGURA ESSA!' },
      { t: 0.75, noHit: true, anim: 'point', dur: 0.55, mine: true, victimAnim: 'stagger', shout: 'MINA ARMADA!' },
      { t: 1.35, anim: 'shoot_rifle', dur: 0.6, share: 0.3, burst: { count: 9, gap: 0.055 }, push: 0, victimAnim: 'stagger', fx: { kind: 'punch', color: 0xffd27a }, sound: 'impact' },
      { t: 2.1, anim: 'point', dur: 0.5, share: 0.7, boom: true, final: true, push: 0, fx: { kind: 'smash', big: true, color: 0xffa040 }, sound: 'heavyPunch', call: 'BOOM!' },
    ],
    endReaction: { knockback: 6, lowLaunch: true },
    endBlind: 1.2,
    bannerAt: 0.2,
    length: 3.1,
  },

  // TRANSFORMAÇÃO ENGENHOSIDADE (habilidade do RPG): no limite, o improviso vira gênio — mais rápido e tudo volta antes
  awakening: {
    name: 'Engenhosidade',
    banner: 'Engenhosidade',
    type: 'awakenMode',
    anim: 'charge_fists',
    mult: 1.15, speedMult: 1.1, cdRate: 1.7, aura: 'smoke', color: ENERGY, heal: 0.06,
  },

  passives: [
    // JOIAS DE ESCUDO MENTAL (cânone: piercing e brinco dourados com sigilos de Conhecimento, "10 de Resistência Mental")
    { type: 'iKnewIt', mult: 0.8 },
    { type: 'resistant', kinds: ['melee', 'ranged'], mult: 0.85 }, // PROPOSTA (balanço): o macacão e as bolsas amortecem
  ],
};
