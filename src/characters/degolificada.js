// A DEGOLIFICADA (id: degolificada) — OUTRO LADO, JOGÁVEL no modo de luta (pedido do dono, 2026-11-06: "Degolificada e
// Espreitador vão se tornar personagens jogáveis no modo de luta"). A de INICIAÇÃO (A Ordem Paranormal): o corpo da Agatha
// Volkomenn com a mente do Gabriel Opspor (wiki "Degolificada" e "Gabriel Opspor"). Criatura de MEDO; flutua com os
// membros pendurados e ataca com os longos fios de cabelo.
// No modo Outro Lado ela é a CHEFE da Escola Nostradamus (characters/bosses/degolificada.js deriva desta ficha, sem o
// kit: a IA dela está em pve/degolificada.js, com o Escudo de Medo e as provas — que NÃO existem aqui no modo de luta).
// Kit (Habilidades da wiki; os botões e números são PROPOSTA de jogo):
//   Pancada ................. ○ o combo: os braços pendentes e o cabelo que sai do chão (os clipes do Amigo, ai_*)
//   Investida de cabelo ..... □ a linha marca o chão; os fios disparam em linha reta e empurram (o golpe da chefe)
//   Agarrar e Estrangular ... △ + ○ (cânone) o cabelo agarra, estrangula e JOGA NA PAREDE
//   Cabelo rastejante ....... △ + □ um fio corre pelo chão atrás do alvo e brota debaixo dele (o da chefe)
//   Cabelo por cima ......... △ + × círculos no chão; os fios caem do alto (o da chefe)
//   Defesa de cabelo ........ △ + L2 os fios fecham na frente (quase não apanha) e empurram (o da chefe)
//   Grito Rasgado ........... R2 + △ (cânone) rompe a vedação da boca: atordoa e ENSURDECE quem estiver perto
//   Arremessar .............. R2 + × o cabelo arranca um caixote do chão e joga no alvo (a chefe joga as caixas)
//   Desfiguramento Capilar .. o ESPECIAL (cânone: o nome; a cena é PROPOSTA): ergue, estrangula, esmaga e joga na parede
// Os golpes são os da chefe (pedido do dono, 2026-11-06: "a versão de boss tava boa"): combat/outroLadoAbilities.js.
//   Devoradora .............. a TRANSFORMAÇÃO (cânone de Iniciação: a metamorfose de Sangue — maior, mais rápida, mais forte)
import amigo from './amigo.js';

const HAIR = 0x0a0909;
const PALE = 0xc8d0c0;
const FEAR = 0x8aa4c8; // o azul-acinzentado do Medo
const BLOOD = 0xa02a18;
const hair = (s, name) => ({ ...s, name, element: 'medo', impactFx: undefined, trail: s.trail ? { ...s.trail, color: HAIR } : undefined });

// a Pancada (wiki: "usando seus cabelos flutuantes ou, até mesmo, seus braços pendentes"): os golpes do Amigo Imaginário
// com os TENTÁCULOS que saem do chão virando o CABELO preto; sem a tinta. A chefe usa o mesmo combo.
export const DEGOLIFICADA_MELEE = {
  name: 'Pancada',
  strikes: amigo.melee.strikes.map((s, i) => hair(s, ['Braço pendente', 'Braço pendente', 'Chicote de cabelo', 'Fios cortantes', 'Esmagar a cabeça'][i] || 'Pancada')),
  up: hair(amigo.melee.up, 'Erguer pelos cabelos'),
  down: hair(amigo.melee.down, 'Esmagar'),
  forward: hair(amigo.melee.forward, 'Flutuar e golpear'),
  back: hair(amigo.melee.back, 'Recua e chicoteia'),
  side: hair(amigo.melee.side, 'Varredura de cabelo'),
  air: hair(amigo.melee.air, 'Desabar'),
};

export default {
  id: 'degolificada',
  name: 'A DEGOLIFICADA',
  model: 'degolificada',
  color: '#c8d0c0',
  origin: 'Outro Lado',
  element: 'medo', // wiki: o Elemento principal é o Medo (tem todos)
  energyColor: PALE,
  tentacle: { color: HAIR, emissive: 0x050505, radius: 0.06 },
  info: {
    weapon: 'Os longos fios de cabelo e os braços pendentes',
    style: 'Flutua a meia distância e luta com o cabelo: puxa, agarra e joga na parede, prende pelo chão e grita',
    identity: 'O corpo da Agatha com a mente do Gabriel',
    tagline: 'Se você vir longos cabelos pretos flutuando em sua direção… CORRA.',
  },
  // flutua devagar e é grande; vida do elenco (a chefe do Outro Lado aguenta mais: bosses/degolificada.js)
  stats: { moveSpeed: 7.1, attackSpeed: 0.95, size: 1.12 },
  anims: { ...amigo.anims, victory: 'taunt_roar' },
  chargeFx: { style: 'default', color: PALE },
  dodge: { style: 'default', distance: 4.2 },

  melee: DEGOLIFICADA_MELEE,

  // □ INVESTIDA DE CABELO (o golpe da chefe): a linha marca o chão, a mira trava e os fios disparam em linha reta e
  // EMPURRAM (combat/outroLadoAbilities.js hairLash)
  ranged: {
    name: 'Investida de cabelo',
    type: 'hairLash',
    description: 'Uma linha marca o chão à frente dela; os fios disparam em linha reta e empurram longe quem estiver nela.',
    windup: 0.5,
    recovery: 0.3,
    range: 10,
    aiRange: 9,
    width: 0.75,
    damage: 32,
    knockback: 7,
    cooldown: 3.5,
    energyCost: 10,
    element: 'medo',
    color: HAIR,
  },

  // Os golpes do kit são os MESMOS da chefe do Outro Lado (pve/degolificada.js), em combat/outroLadoAbilities.js
  abilities: [
    {
      // △ + ○ AGARRAR E ESTRANGULAR (cânone): agarra, estrangula e JOGA NA PAREDE mais perto
      id: 'agarrarEstrangular',
      name: 'Agarrar e Estrangular',
      input: 'carga+physical',
      type: 'hairGrab',
      description: 'Os fios agarram quem está à frente (até 8 m), puxam até ela, estrangulam e o ARREMESSAM na parede mais perto (bater na parede machuca mais).',
      windup: 0.45,
      range: 8,
      arc: 50,
      hold: 1.0,
      ticks: 2,
      tickDamage: 8,
      wallDamage: 46,
      landDamage: 22,
      throwDistance: 10,
      caughtLabel: 'ESTRANGULADO PELO CABELO',
      element: 'medo',
      energyCost: 30,
      cooldown: 14,
      ai: { max: 8 },
      color: HAIR,
    },
    {
      // △ + □ CABELO RASTEJANTE — um fio corre pelo chão atrás do alvo e brota debaixo dele
      id: 'cabeloRastejante',
      name: 'Cabelo rastejante',
      input: 'carga+ranged',
      type: 'hairCrawl',
      description: 'Um fio corre pelo chão perseguindo o adversário (vira devagar: dá para fugir de lado) e brota debaixo dele, jogando-o para o alto.',
      windup: 0.35,
      speed: 8.5,
      turn: 2.0,
      life: 2.8,
      hitRadius: 0.85,
      damage: 46,
      caughtLabel: 'PRESO NOS CABELOS',
      element: 'medo',
      energyCost: 20,
      cooldown: 11,
      color: HAIR,
    },
    {
      // △ + × CABELO POR CIMA — círculos no chão; os fios caem do alto
      id: 'cabeloPorCima',
      name: 'Cabelo por cima',
      input: 'carga+jump',
      type: 'hairRain',
      description: 'Quatro círculos marcam o chão (um no adversário); os fios caem do alto em cada um, um depois do outro.',
      count: 4,
      spread: 2.6,
      radius: 1.25,
      windup: 0.9,
      damage: 34,
      element: 'medo',
      energyCost: 22,
      cooldown: 12,
      color: HAIR,
    },
    {
      // △ + L2 DEFESA DE CABELO — os fios fecham na frente e empurram
      id: 'defesaCabelo',
      name: 'Defesa de cabelo',
      input: 'carga+dodge',
      type: 'hairGuard',
      label: 'DEFESA DE CABELO',
      description: 'Os fios fecham na frente dela por 1,2 s: recebe só 20% do dano e não recua. No fim, os fios EMPURRAM longe quem estiver perto.',
      time: 1.2,
      takenMult: 0.2,
      push: 3.4,
      damage: 22,
      knockback: 9,
      element: 'medo',
      energyCost: 18,
      cooldown: 12,
      color: HAIR,
    },
    {
      // R2 + △ GRITO RASGADO (cânone)
      id: 'gritoRasgado',
      name: 'Grito Rasgado',
      input: 'block+carga',
      type: 'hairScream',
      description: 'Rompe a vedação da boca e GRITA: quem estiver a até 6 m é atordoado e fica ENSURDECIDO por alguns segundos.',
      windup: 0.9,
      radius: 6.2,
      damage: 34,
      stun: 1.2,
      deaf: 4,
      element: 'medo',
      energyCost: 30,
      cooldown: 16,
      ai: { max: 6 },
      color: PALE,
    },
    {
      // R2 + × ARREMESSAR (a chefe joga as caixas do bunker; aqui o cabelo arranca um caixote do chão — PROPOSTA)
      id: 'arremessar',
      name: 'Arremessar',
      input: 'block+jump',
      type: 'hairToss',
      description: 'O cabelo arranca um caixote do chão, ergue sobre a cabeça e o arremessa onde o adversário está (a marca no chão segue o alvo e trava antes).',
      lift: 0.5,
      aim: 0.55,
      flight: 0.7,
      radius: 1.7,
      damage: 40,
      element: 'medo',
      energyCost: 20,
      cooldown: 10,
      ai: { min: 3 },
      color: HAIR,
    },
  ],

  // ESPECIAL DESFIGURAMENTO CAPILAR (cânone: o nome; a cena é PROPOSTA a partir do Agarrar e Estrangular da chefe): os
  // fios agarram de longe, ERGUEM pelo pescoço e estrangulam, ESMAGAM no chão e jogam na PAREDE
  special: {
    name: 'Desfiguramento Capilar',
    banner: 'Corra.',
    type: 'hairStrangle',
    energyCost: 50,
    cooldown: 14,
    range: 11,
    shares: [0.08, 0.3, 0.46],
    color: FEAR,
    sound: 'specialStart',
  },

  // DEVORADORA (cânone de Iniciação: a metamorfose de Sangue) — maior, mais rápida e mais forte
  awakening: {
    name: 'Devoradora',
    banner: 'Devoradora',
    type: 'awakenMode',
    anim: 'ai_frenzy',
    mult: 1.18, affects: ['melee', 'ability'], takenMult: 0.88, speedMult: 1.2, cdRate: 1.3, aura: 'blood', color: BLOOD, heal: 0.1,
  },

  passives: [],
};
