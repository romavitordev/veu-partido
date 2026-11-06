// O ESPREITADOR (id: espreitador) — OUTRO LADO, JOGÁVEL no modo de luta (pedido do dono, 2026-11-06). Wiki "O
// Espreitador": criatura de Conhecimento com complemento de Medo, de pele cinza enrugada, muitos olhos amarelos cujas
// pupilas se multiplicam, lágrimas, um OLHO GRANDE dentro da boca, dentes tortos, pernas curtas e braços e dedos longos.
// No modo Outro Lado ele é o CHEFE da Mansão Endiabrada (characters/bosses/espreitador.js deriva desta ficha, sem o kit:
// a IA dele está em pve/espreitador.js, com os armários — as frestas — e o Enigma de Medo, que NÃO existem aqui).
// Kit (Habilidades da wiki; os botões e números são PROPOSTA de jogo):
//   Pancada .............. ○ o combo: os braços longos se debatendo — golpes fracos, mas de alcance grande
//   Dedos longos ......... □ os dedos se esticam, pegam e puxam (PROPOSTA a partir dos braços e dedos longos)
//   Drenar Energia ....... △ + ○ o olhar: drena a Sanidade (a energia) de quem está à frente E olhando para ele
//   Correr pelas Frestas . △ + × some e sai pelas costas do adversário (no cânone: entra num armário e sai de outro)
//   Cópia Observada ...... R2 + × cria DEVORADOS — cópias cinzentas de quem ele observa (o adversário)
//   Fortalecer ........... △ + L2 (no cânone, fortalece um Devorado segurando a cabeça dele; aqui, PROPOSTA: a si mesmo
//                          e às cópias em campo)
//   O Olho da Boca ....... o ESPECIAL (PROPOSTA): agarra com os braços longos e o olho de dentro da boca encara
//   Pupilas que se Multiplicam ... a TRANSFORMAÇÃO (PROPOSTA a partir do cânone: as pupilas se multiplicam)
import raziel from './raziel.js';
import joui from './joui.js';

const FEAR = 0xf2c230; // o amarelo dos olhos
const GREY = 0x8a8478;
const abil = (def, id) => def.abilities.find((a) => a.id === id);

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
      // △ + × CORRER PELAS FRESTAS (cânone: some num armário e sai de outro) — o teleporte do Joui, sem sombra vermelha
      ...abil(joui, 'teleport'),
      id: 'correrFrestas',
      name: 'Correr pelas Frestas',
      input: 'carga+jump',
      description: 'Some por uma fresta e sai pelas costas do adversário, já podendo atacar. Não causa dano.',
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
      // △ + L2 FORTALECER (cânone: segura a cabeça de um Devorado e o deixa mais forte) — PROPOSTA: ele mesmo
      id: 'fortalecer',
      name: 'Fortalecer',
      input: 'carga+dodge',
      type: 'selfBuff',
      buffType: 'fortalecerEspreitador',
      label: 'FORTALECER',
      anim: 'gaze',
      description: 'As pupilas se multiplicam: por 7 s bate 20% mais forte, anda 10% mais rápido e aguenta 2 golpes sem recuar.',
      energyCost: 22,
      cooldown: 18,
      duration: 7,
      damageMult: 1.2,
      speedMult: 1.1,
      armor: 2,
      affects: ['melee', 'ranged'],
      color: FEAR,
    },
  ],

  // ESPECIAL O OLHO DA BOCA (PROPOSTA a partir do cânone: o olho grande dentro da boca): os braços longos agarram e
  // batem, ele puxa a vítima para perto e a boca se abre — o olho encara, a mente racha
  special: {
    name: 'O Olho da Boca',
    banner: 'Feche a fresta.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: FEAR,
    sound: 'specialStart',
    prepare: { anim: 'gaze', time: 0.45 },
    dash: { speed: 9, maxTime: 0.9, contact: 3.0 },
    standOff: 2.2,
    hits: [
      { t: 0.1, anim: 'db_claw_r', dur: 0.4, share: 0.14, fx: { kind: 'punch', color: GREY }, sound: 'punch' },
      { t: 0.5, anim: 'db_claw_l', dur: 0.4, share: 0.14, fx: { kind: 'punch', color: GREY }, sound: 'punch' },
      { t: 0.9, anim: 'db_cross', dur: 0.45, share: 0.16, fx: { kind: 'claw', color: GREY }, sound: 'clawHit', call: 'PANCADA' },
      { t: 1.45, anim: 'gaze', dur: 0.85, share: 0.22, victimAnim: 'stagger', fx: { kind: 'punch', color: FEAR }, sound: 'fearGaze', call: 'O OLHO' },
      { t: 2.4, anim: 'db_rend', dur: 0.45, share: 0.34, closeIn: true, fx: { kind: 'claw', big: true, color: FEAR, color2: GREY }, sound: 'slashFinal', final: true, call: 'A MENTE RACHA' },
    ],
    shots: 'control',
    bannerAt: 0.2,
    length: 3.2,
    endReaction: { knockback: 3, lowLaunch: true },
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
