// O ESPREITADOR (id: espreitador) — OUTRO LADO, JOGÁVEL no modo de luta (pedido do dono, 2026-11-06). Wiki "O
// Espreitador": criatura de Conhecimento com complemento de Medo, de pele cinza enrugada, muitos olhos amarelos cujas
// pupilas se multiplicam, lágrimas, um OLHO GRANDE dentro da boca, dentes tortos, pernas curtas e braços e dedos longos.
// No modo Outro Lado ele é o CHEFE da Mansão Endiabrada (characters/bosses/espreitador.js deriva desta ficha, sem o kit:
// a IA dele está em pve/espreitador.js, com os armários — as frestas — e o Enigma de Medo, que NÃO existem aqui).
// Kit (Habilidades da wiki; os botões e números são PROPOSTA de jogo):
//   Pancada .............. ○ o combo: os braços longos se debatendo — golpes fracos, mas de alcance grande
//   Dedos longos ......... □ os dedos se esticam, pegam e puxam (PROPOSTA a partir dos braços e dedos longos)
//   Drenar Energia ....... △ + ○ o olhar: drena a Sanidade (a energia) de quem está à frente E olhando para ele
//   Abrir Fresta ......... △ + □ um ARMÁRIO entreaberto brota do chão (até 3); o adversário tranca com um golpe
//   Correr pelas Frestas . △ + × entra numa fresta e sai pela mais perto do alvo num BOTE (o do chefe); sem fresta
//                          aberta fica APAVORADO (a fraqueza do cânone: "bloquear ou fechar sua fresta")
//   Cópia Observada ...... R2 + × cria DEVORADOS — cópias cinzentas de quem ele observa (o adversário)
//   Fortalecer ........... △ + L2 (cânone) segura a cabeça de um Devorado e o fortalece; sem Devorado, a si mesmo
//   O Olho da Boca ....... o ESPECIAL (PROPOSTA): frestas em volta do alvo, três botes e o olho de dentro da boca
// Os golpes são os do chefe (pedido do dono, 2026-11-06): combat/outroLadoAbilities.js.
//   Pupilas que se Multiplicam ... a TRANSFORMAÇÃO (PROPOSTA a partir do cânone: as pupilas se multiplicam)
import raziel from './raziel.js';

const FEAR = 0xf2c230; // o amarelo dos olhos
const GREY = 0x8a8478;

// a Pancada (wiki: ataques desesperados, descoordenados e trêmulos): as garras do Raziel com mais alcance (os braços
// longos) e dano mais baixo. k = quanto do dano fica (a chefe bate ainda mais fraco: bosses/espreitador.js).
export const slap = (s, name, k = 0.8) => ({ ...s, name, element: 'conhecimento', bleed: undefined, damage: Math.round(s.damage * k), range: (s.range ?? 2) + 0.6, hitSound: 'punch', trail: { ...(s.trail || {}), color: GREY } });
export const PANCADA_NAMES = ['Pancada', 'Pancada de volta', 'Braços se debatendo', 'Pancada longa', 'Pancada longa'];
export function pancada(k) {
  return {
    name: 'Pancada',
    strikes: raziel.melee.strikes.map((s, i) => slap(s, PANCADA_NAMES[i] || 'Pancada', k)),
    up: slap(raziel.melee.up, 'Dedos de baixo', k),
    down: slap(raziel.melee.down, 'Esmagar', k),
    forward: slap(raziel.melee.forward, 'Avanço da fresta', k),
    back: slap(raziel.melee.back, 'Recua e golpeia', k),
    side: slap(raziel.melee.side, 'Braço em giro', k),
    air: slap(raziel.melee.air, 'Cair sobre a vítima', k),
  };
}

export default {
  id: 'espreitador',
  name: 'O ESPREITADOR',
  model: 'espreitador',
  color: '#c8b070',
  origin: 'Outro Lado',
  element: 'conhecimento', // wiki: criatura de Conhecimento com complemento de Medo
  energyColor: FEAR,
  info: {
    weapon: 'Os braços e dedos longos',
    style: 'Observa, drena quem olha para ele, some pelas frestas e cria cópias cinzentas de quem ele vê',
    identity: 'A criatura de muitos olhos amarelos que mora nos armários',
    tagline: 'Feche a fresta.',
  },
  // pernas curtas, mas o elenco tem um piso de velocidade (o Lírio é o mais lento); vida do elenco
  stats: { moveSpeed: 7.0, attackSpeed: 0.95, size: 1.2 },
  anims: { idle: 'idle_raziel', run: 'run', charge: 'db_charge', victory: 'taunt_roar', block: 'db_block' },
  chargeFx: { style: 'aura', color: FEAR, smoke: 0x3a3830 },
  dodge: { style: 'default', distance: 4.4 },

  melee: pancada(0.8),

  // □ DEDOS LONGOS: o braço se estica, os dedos pegam e puxam (o tentáculo do Amigo, em cinza)
  ranged: {
    name: 'Dedos longos',
    type: 'projectile',
    homing: 1.6,
    anim: 'point',
    origin: 'hand',
    chain: true,
    rope: true,
    ropeColor: GREY,
    ropeThick: 0.045,
    windup: 0.26,
    recovery: 0.34,
    count: 1,
    interval: 0,
    damage: 24,
    range: 13,
    speed: 28,
    radius: 0.5,
    spread: 0,
    knockback: 0,
    hitstun: 0.1,
    onHit: { pull: { distance: 1.8, time: 0.35, after: 0.6 } },
    cooldown: 5.5,
    energyCost: 15,
    visual: 'inkClaw',
    color: GREY,
    element: 'conhecimento',
    sound: 'chainThrow',
    hitSound: 'chainPull',
  },

  // Os golpes do kit são os da IA do chefe do Outro Lado (pve/espreitador.js), em combat/outroLadoAbilities.js
  abilities: [
    {
      // △ + ○ DRENAR ENERGIA (cânone): só pega quem está no campo de visão dele E olhando para ele
      id: 'drenarEnergia',
      name: 'Drenar Energia',
      input: 'carga+physical',
      type: 'fearGaze',
      description: 'Os olhos amarelos se abrem: quem estiver à frente E OLHANDO para ele fica paralisado, perde Sanidade (energia) e ele a toma para si. De costas, não pega.',
      energyCost: 20,
      cooldown: 12,
      range: 9,
      arc: 70,
      lookArc: 120,
      windup: 0.4,
      recovery: 0.3,
      stun: 0.8,
      drain: 25,
      drainGain: 0.8,
      damage: 30,
      element: 'conhecimento',
      color: FEAR,
    },
    {
      // △ + □ ABRIR FRESTA: um ARMÁRIO entreaberto brota do chão (as frestas por onde ele anda)
      id: 'abrirFresta',
      name: 'Abrir Fresta',
      input: 'carga+ranged',
      type: 'openFresta',
      description: 'Um armário entreaberto (uma FRESTA, com olhos lá dentro) brota do chão ao lado dele. Até 3 no mapa; o mais velho some. Um golpe ou tiro do adversário FECHA e TRANCA a fresta por 20 s.',
      max: 3,
      energyCost: 10,
      cooldown: 4,
      color: FEAR,
    },
    {
      // △ + × CORRER PELAS FRESTAS (cânone): entra numa fresta e sai pela mais perto do alvo num bote
      id: 'correrFrestas',
      name: 'Correr pelas Frestas',
      input: 'carga+jump',
      type: 'frestaTravel',
      description: 'Entra na fresta mais perto, os OLHOS AMARELOS acendem na fresta mais perto do adversário e ele sai por ela num BOTE. Com todas as frestas trancadas, fica APAVORADO (apanha mais por 3 s).',
      hide: 0.55,
      lungeTime: 0.4,
      lungeSpeed: 13,
      reach: 1.9,
      damage: 52,
      terror: { time: 3, taken: 1.4 },
      element: 'conhecimento',
      energyCost: 16,
      cooldown: 7,
      color: FEAR,
    },
    {
      // R2 + × CÓPIA OBSERVADA (cânone): gera Devorados — cópias cinzentas de quem ele observa
      id: 'copiaObservada',
      name: 'Cópia Observada',
      input: 'block+jump',
      type: 'shadowClones',
      label: 'CÓPIA OBSERVADA',
      description: 'Encara o adversário e cria 2 DEVORADOS: cópias cinzentas dele que lutam com os golpes dele por 9 s (metade do dano; caem com poucos golpes).',
      energyCost: 30,
      cooldown: 22,
      clones: 2,
      duration: 9,
      sidestep: 1.6,
      copyOpponent: true,
      copyColor: GREY,
      hp: 60,
      color: FEAR,
    },
    {
      // △ + L2 FORTALECER (cânone): segura a cabeça de um Devorado e o deixa maior e mais forte; sem Devorado, ele mesmo
      id: 'fortalecer',
      name: 'Fortalecer',
      input: 'carga+dodge',
      type: 'fortifyDevorado',
      label: 'FORTALECER',
      description: 'Segura a cabeça de um DEVORADO em campo: ele fica maior, com o dobro da vida e 70% mais forte. Sem Devorado, as pupilas se multiplicam nele: por 7 s bate 20% mais forte, anda 10% mais rápido e aguenta 2 golpes sem recuar.',
      energyCost: 22,
      cooldown: 18,
      reach: 7,
      hold: 0.9,
      hpMult: 2,
      dmgMult: 1.7,
      extend: 4,
      self: { id: 'fortalecer', name: 'Fortalecer', type: 'selfBuff', buffType: 'fortalecerEspreitador', label: 'FORTALECER', anim: 'gaze', duration: 7, damageMult: 1.2, speedMult: 1.1, armor: 2, affects: ['melee', 'ranged'], color: FEAR },
      color: FEAR,
    },
  ],

  // ESPECIAL O OLHO DA BOCA (PROPOSTA a partir do cânone: as frestas e o olho grande dentro da boca): quatro armários
  // brotam em volta do alvo, ele sai de três frestas em sequência e no fim abre a boca — o OLHO encara e drena a Sanidade
  special: {
    name: 'O Olho da Boca',
    banner: 'Feche a fresta.',
    type: 'frestaAmbush',
    energyCost: 50,
    cooldown: 14,
    shares: [0.18, 0.46],
    drain: 40,
    color: FEAR,
    sound: 'specialStart',
  },

  // PUPILAS QUE SE MULTIPLICAM (PROPOSTA): os olhos se abrem por todo o corpo — mais rápido, mais forte e as habilidades
  // voltam mais cedo
  awakening: {
    name: 'Pupilas que se Multiplicam',
    banner: 'Pupilas que se Multiplicam',
    type: 'awakenMode',
    mult: 1.18, speedMult: 1.12, cdRate: 1.5, aura: 'smoke', color: FEAR, heal: 0.08,
  },

  passives: [],
};
