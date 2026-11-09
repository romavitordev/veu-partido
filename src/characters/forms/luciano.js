// LUCIANO CARVALHO (forma do Fernando; id: luciano). Não aparece na seleção: o Fernando troca para ele com a habilidade
// "Luciano" (△ + L2) ou sozinho quando se apavora (passiva panicSwap), e volta com a habilidade "Fernando". Não é
// transformação da barra: é a SEGUNDA FICHA do mesmo lutador (pedido do dono, 2026-11-02).
// Cânone (wiki "Luciano Carvalho"; HQ Desconjuração Pt. 1): ex-militar, sério, metódico e frio em crise, por vezes
// arrogante; protege o marido acima de tudo. Ocultista: ao Transcender só ELE foi aceito pelo Outro Lado e aprendeu a
// REAÇÃO (segurando um aparelho eletrônico, metade do dano que recebe volta ao agressor como Energia caótica e a outra
// metade vai para a mente); depois o DESCARNAR DISCENTE (sangue no anel, encara o alvo e a carne queima e se despedaça).
// Anéis com os símbolos dos dois rituais. Habilidades de Ocultista: Mente Inabalável, Concentração Inquebrável. Item: o
// ANEL ESPIRAL (comprado pelo Fernando): atira rápido duas vezes seguidas, o segundo disparo com metade do dano.
// Arsenal: M4 com lanterna, Glock 17, canivete. Integrou a equipe de VARREDURA da Ordem com o Johnny Tabasco.
// PROPOSTA de jogo (marcada): as sequências de combate militar, o especial "Varredura" (o nome vem da equipe
// canônica), o despertar e os números.
import base from '../fernando.js';

const YELLOW = 0xe8b818;
const PINK = 0xff6ab8;
const CHAOS = 0xa865ff; // a Energia caótica da Reação

export default {
  ...base,
  id: 'luciano',
  form: true,
  baseId: 'fernando',
  name: 'LUCIANO CARVALHO',
  model: 'luciano',
  color: '#e8b818',
  energyColor: YELLOW,
  animStyle: 'militar', // golpes secos e curtos, sem floreio
  info: {
    weapon: 'A M4 com lanterna, o canivete e os anéis dos rituais',
    style: 'O ex-militar: rajadas da M4, combate de perto seco e a Reação que devolve o dano; a habilidade "Fernando" devolve o corpo',
    identity: 'O marido ex-militar que assume o corpo quando o Fernando se apavora',
    tagline: 'Ninguém toca nele.',
  },
  stats: { moveSpeed: 8.9, attackSpeed: 1.16 },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'aura', color: YELLOW, smoke: 0x1a1608 },
  dodge: { style: 'default' },

  // COMBATE DE PERTO MILITAR (PROPOSTA): canivete, cotovelo e chute, mais forte e mais seco que o do Fernando
  melee: {
    name: 'Canivete de combate',
    strikes: [
      { name: 'Corte seco', anim: 'knife_1', dur: 0.26, active: [0.08, 0.15], damage: 24, range: 1.6, arc: 110, knockback: 1.0, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.0, tilt: 0.1, color: YELLOW } },
      { name: 'Cotovelada', anim: 'sway_elbow', dur: 0.3, active: [0.09, 0.17], damage: 26, range: 1.6, arc: 100, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.26, active: [0.08, 0.15], damage: 24, range: 1.6, arc: 110, knockback: 1.0, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.0, tilt: -0.1, flip: true, color: YELLOW } },
      { name: 'Estocada de militar', anim: 'knife_final', dur: 0.42, active: [0.14, 0.24], damage: 54, range: 1.9, arc: 80, lunge: 2.2, finisher: 'launch', sound: 'blade', hitSound: 'bladeHit', impactScale: 1.3, trail: { radius: 1.2, roll: 0.3, big: true, color: YELLOW } },
    ],
    up: { name: 'Gancho', anim: 'uppercut', dur: 0.4, active: [0.12, 0.22], damage: 36, range: 1.7, arc: 110, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch' },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.4, active: [0.14, 0.24], damage: 38, range: 1.9, arc: 130, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Avanço de assalto', anim: 'dash_slash', dur: 0.38, active: [0.11, 0.21], damage: 34, range: 1.9, arc: 120, knockback: 2.2, motion: [{ t: [0, 0.2], fwd: 5.0, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: 0.1, color: YELLOW } },
    back: { name: 'Recua e corta', anim: 'knife_evade', dur: 0.48, active: [0.26, 0.36], damage: 34, range: 1.8, arc: 100, knockback: 2.6, iframes: [0, 0.18], motion: [{ t: [0, 0.14], back: 2.2 }, { t: [0.17, 0.3], fwd: 2.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: -0.2 } },
    side: { name: 'Chute lateral', anim: 'side_kick', dur: 0.36, active: [0.12, 0.21], damage: 30, range: 1.9, arc: 120, knockback: 1.8, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'swing', hitSound: 'kick' },
    air: { name: 'Corte aéreo', anim: 'air_knife', dur: 0.36, active: [0.12, 0.28], damage: 32, range: 1.8, arc: 110, knockback: 3, slam: 16, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 1.2 } },
  },

  // □ M4 (cânone): rajada de 4. → + □: ANEL ESPIRAL (item canônico — dois disparos seguidos, o segundo com metade do dano)
  ranged: {
    name: 'M4',
    description: 'Tira a M4 da bandoleira e dá uma rajada de 4. Com → + □, o Anel Espiral: duas rajadas seguidas, a segunda mais fraca.',
    type: 'projectile',
    anim: 'shoot_rifle',
    showProp: 'm4Hand',
    hideProp: 'm4Back+knife',
    windup: 0.2,
    recovery: 0.26,
    count: 4,
    interval: 0.08,
    damage: 15,
    range: 36,
    speed: 90,
    radius: 0.25,
    spread: 0.03,
    knockback: 0.8,
    hitstun: 0.18,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffe08a,
    sound: 'm4',
    hitSound: 'impact',
    variants: {
      // 4 × 10 + 4 × 5: dá 60, menos que duas rajadas normais (o segundo disparo sai pela metade)
      forward: { label: 'ANEL ESPIRAL', count: 8, interval: 0.06, damage: 7.5, cooldown: 3.0 },
    },
  },

  abilities: [
    {
      // △ + L2 "FERNANDO": devolve o corpo ao marido (olhos voltam ao rosa)
      id: 'fernando',
      name: 'Fernando',
      input: 'carga+dodge',
      type: 'partnerSwap',
      to: null,
      description: 'O Luciano relaxa e devolve o corpo: os olhos voltam ao ROSA e o kit vira o do Fernando (a vida é a mesma). Abaixo de 30% de vida não dá: o Fernando está apavorado.',
      energyCost: 0,
      cooldown: 8,
      pairWith: 'luciano',
      color: PINK,
      // cânone: o Luciano assume quando o Fernando se apavora; abaixo de 30% de vida o Fernando não volta (pedido do dono)
      lockBelow: 0.3,
      lockText: 'O FÊ ESTÁ APAVORADO',
      shout: 'Volta, Fê.',
      grace: 0.25,
      ai: { when: 'never' },
    },
    {
      // R2 + △ REAÇÃO (ritual canônico de Energia): metade do dano recebido volta ao agressor como Energia caótica e a
      // outra metade vai para a mente (gasta sanidade). Ele segura um aparelho eletrônico e se concentra no símbolo
      id: 'reacao',
      name: 'Reação',
      input: 'block+carga',
      type: 'selfBuff',
      buffType: 'reacao',
      label: 'REAÇÃO',
      anim: 'concentrate',
      animTime: 0.4,
      description: 'Ritual de Energia: por 4 s, metade de todo dano recebido VOLTA para quem bateu como Energia caótica, e a outra metade vai para a mente (gasta sanidade em vez de vida).',
      energyCost: 22,
      cooldown: 18,
      duration: 4,
      takenMult: 0.5,
      reflect: 1, // o que chega no corpo (a metade) volta inteiro ao agressor
      mindCost: 0.5, // e a outra metade sai da sanidade
      color: CHAOS,
      sound: 'ritual',
      ritual: true,
      ai: { when: 'near' },
    },
    {
      // △ + ○ DESCARNAR DISCENTE (ritual canônico de Sangue): mancha o anel com o próprio sangue, encara o alvo e a
      // carne dele queima e se despedaça
      id: 'descarnarDiscente',
      name: 'Descarnar Discente',
      input: 'carga+physical',
      type: 'ritualCuts',
      description: 'Ritual de Sangue: passa o sangue no anel, encara o alvo e a carne dele se despedaça em cortes, um atrás do outro (dano alto e sangramento).',
      energyCost: 30,
      cooldown: 14,
      windup: 0.5,
      range: 9,
      arc: 50,
      cuts: 5,
      interval: 0.1,
      damage: 76,
      element: 'sangue',
      color: 0xc01828,
      ritual: true,
    },
    {
      // R2 + X MENTE INABALÁVEL (habilidade canônica de Ocultista: vantagem nos testes de sanidade). No jogo: firme como
      // militar, não recua com golpes e a sanidade não cai com o medo
      id: 'menteInabalavel',
      name: 'Mente Inabalável',
      input: 'block+jump',
      type: 'selfBuff',
      buffType: 'menteInabalavel',
      label: 'MENTE INABALÁVEL',
      anim: 'counter_stance',
      animTime: 0.4,
      description: 'Fecha a cara de militar: por 5 s aguenta 3 golpes sem recuar e recebe 15% menos dano.',
      energyCost: 18,
      cooldown: 20,
      duration: 5,
      armor: 3,
      takenMult: 0.85,
      color: YELLOW,
      sound: 'carga',
      ai: { when: 'near' },
    },
  ],

  // VARREDURA (PROPOSTA; o nome vem da equipe de Varredura da Ordem, cânone): rajada da M4 entrando, a segunda rajada
  // colada, o corte de canivete e a estocada final — "ninguém toca nele"
  special: {
    name: 'Varredura',
    banner: 'Descansa, meu amor. Eu cuido disso.', // os dois no mesmo corpo: o Luciano assume para o marido não ver (dono, 2026-11-09)
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: YELLOW,
    sound: 'specialStart',
    prepare: { anim: 'shoot_rifle', time: 0.35, showProp: 'm4Hand', hideProp: 'm4Back+knife' },
    dash: { speed: 26, maxTime: 0.45, contact: 2.4 },
    standOff: 2.4,
    hits: [
      { t: 0.2, anim: 'shoot_rifle', dur: 0.5, share: 0.22, fx: { kind: 'punch' }, sound: 'impact', burst: { count: 5, gap: 0.07, sound: 'm4' }, call: 'VARREDURA.', push: 0.05 },
      { t: 0.85, anim: 'shoot_rifle', dur: 0.5, share: 0.22, fx: { kind: 'punch' }, sound: 'impact', burst: { count: 5, gap: 0.07, sound: 'm4' }, push: 0.05 },
      { t: 1.55, anim: 'knife_1', dur: 0.3, share: 0.16, fx: { kind: 'slash' }, sound: 'bladeHit', props: [['m4Hand', false], ['knife', true]], closeIn: true },
      { t: 2.0, anim: 'knife_final', dur: 0.5, share: 0.4, fx: { kind: 'stab', big: true }, sound: 'slashFinal', final: true, shout: 'NINGUÉM TOCA NELE.', bleed: { dps: 4, duration: 3 } },
    ],
    bannerAt: 0.2,
    length: 2.9,
  },

  // DESPERTAR (PROPOSTA; habilidade canônica de Ocultista "Concentração Inquebrável": concentra no símbolo e conjura ao
  // mesmo tempo): até o fim do round as recargas voltam mais rápido e os rituais e tiros batem mais forte
  awakening: {
    name: 'Concentração Inquebrável',
    banner: 'Concentração inquebrável. Ninguém toca nele.',
    type: 'awakenMode',
    mult: 1.14, affects: ['ranged', 'ability'], cdRate: 1.35, regen: 2, heal: 0.08, takenMult: 0.9, speedMult: 1.05, aura: 'flame', color: YELLOW,
  },

  passives: [
    { type: 'elementalAffinity', element: 'energia', mult: 1.1 }, // a Reação é o ritual dele
  ],
};
