// BEATRICE — A EXISTIDA (Desconjuração ep. 11 "Lembrar"). Não aparece na seleção: a Beatrice vira esta forma na
// Transformação (Barra cheia + vida baixa, segurando △) e fica assim até o fim do round.
// Cânone (wiki "Beatrice Portinari"): a morte do Orpheu era a barreira das memórias; quando o Viajante quebra o pescoço
// dele, tudo volta e ela se torna uma EXISTIDA. Cânone (wiki "Existidos e Lembrados"): uma casca que só quer ser
// OBSERVADA ("Olha pra mim. Não vai embora. Lembra de mim."); neutra até ser agredida ou ignorada, aí se ILUMINA e ataca
// até a vítima ou ela morrer. Habilidades canônicas: PANCADA ("fraco e hesitante, reflexo de sua fragilidade"), BRILHO
// ENLOUQUECEDOR (os textos brilham em dourado, difícil de enxergar, o terror dos escritos afeta a mente) e
// FORTALECIMENTO PARANORMAL (depois do brilho fica mais resistente e os golpes mais danosos). Corpo decrépito e LENTO.
// Ela NÃO luta como agente: sem canivete, sem balestra, sem rituais normais e sem Sanidade (usa Existência).
// Especial canônico dos Existidos: "Lembra de Mim" (Desconjuração ep. 11).
// PROPOSTA de jogo (marcada): o toque que suga a sanidade e mata quem já está fraco, e os números.
// O PINGENTE DA LUA DOURADA (item amaldiçoado por Conhecimento com as memórias dela) segue com ela: resiste a Conhecimento.
// Visual: o mesmo modelo com a pele de textos, os olhos brancos, sem o Orpheu e sem armas (models/props.js).
import base from '../beatrice.js';

const GOLD = 0xf2c230;
// pancadas lentas e fracas, de instinto: o braço sobe devagar e cai
const blow = (name, anim, damage, extra = {}) => ({ name, anim, dur: 0.56, active: [0.26, 0.36], damage, range: 1.5, arc: 110, knockback: 0.8, lunge: 0.5, sound: 'swing', hitSound: 'punch', trail: { color: GOLD }, ...extra });

export default {
  ...base,
  id: 'beatrice_existida',
  form: true,
  baseId: 'beatrice',
  name: 'BEATRICE PORTINARI',
  model: 'beatrice_existida',
  color: '#f2c230',
  energyColor: GOLD,
  info: {
    ...base.info,
    weapon: 'Nenhuma: as mãos de uma Existida',
    style: 'Existida: lenta e frágil; segura quem bate nela, brilha e suga a sanidade com o toque',
    identity: 'A Existida (até o fim do round)',
    tagline: 'Olha pra mim. Lembra de mim.',
  },
  stats: { ...base.stats, moveSpeed: 4.4, attackSpeed: 0.75, maxHealth: 1600 }, // corpo decrépito e lento
  hpBar: { style: 'existida', label: 'EXISTÊNCIA' },
  anims: { ...base.anims, idle: 'ai_idle', block: 'block' },
  grip: undefined,
  chargeFx: { style: 'aura', color: GOLD },
  dodge: { style: 'default', distance: 3.4 },

  melee: {
    name: 'Pancada',
    strikes: [
      blow('Pancada', 'hook_r', 16, { hand: 'R' }),
      blow('Pancada', 'hook_l', 16, { hand: 'L' }),
      blow('Pancada desesperada', 'claw_raise', 30, { dur: 0.8, active: [0.42, 0.54], knockback: 1.6, finisher: 'knockdown' }),
    ],
    up: blow('Empurrão para cima', 'uppercut', 22, { dur: 0.6, finisher: 'launchHigh', launcher: true }),
    down: blow('Pancada no chão', 'stomp', 24, { dur: 0.7, active: [0.34, 0.44], finisher: 'knockdown' }),
    forward: blow('Agarrar o ar', 'shove', 20, { motion: [{ t: [0, 0.3], fwd: 2.4, stopClose: true }] }),
    back: blow('Recua tremendo', 'hook_l', 16, { motion: [{ t: [0, 0.2], back: 1.6 }] }),
    side: blow('Tapa de lado', 'hook_r', 18, { motion: [{ t: [0, 0.2], side: 1.6 }] }),
    air: blow('Cai em cima', 'meteor_punch', 22, { knockback: 2, slam: 10, vertical: 1.6 }),
  },

  // □ NÃO VAI EMBORA (cânone: "caso o indivíduo... tome alguma atitude que faça o Existido se sentir em perigo, como ser
  // ... agredido, a criatura se ilumina e o ataca"; ela segura a vítima para continuar sendo observada): fica parada; quem
  // bater nela de frente é agarrado e leva as pancadas. Sem arma para atirar.
  ranged: {
    name: 'Não Vai Embora',
    type: 'counter',
    description: 'Fica parada, olhando. Um golpe físico ou habilidade que chegar de frente: ela se ilumina, SEGURA quem bateu e devolve com pancadas. Não segura projéteis nem especiais; no vazio, fica aberta.',
    window: [0.1, 0.9],
    recovery: 0.5,
    reach: 2.6,
    cooldown: 5,
    energyCost: 0,
    damage: 40,
    range: 2.6,
    color: GOLD,
    label: 'NÃO VAI EMBORA!',
    riposte: {
      windup: 0.1,
      range: 2.6,
      lunge: 4,
      hold: 0.7,
      blows: 2,
      blowAnims: ['hook_r', 'hook_l'],
      blowDamage: 10,
      final: 'throw',
      finalDamage: 20,
      label: 'OLHA PRA MIM!',
      color: GOLD,
    },
  },

  abilities: [
    {
      // △ + ○ OLHA PRA MIM (PROPOSTA a partir do cânone: o Existido segura a vítima para ser observado; o toque de quem
      // carrega o Conhecimento inteiro do Outro Lado suga a sanidade — e quem já está fraco não aguenta)
      id: 'olhaPraMim',
      name: 'Olha pra Mim',
      input: 'carga+physical',
      type: 'deathTouch',
      anim: 'grab',
      label: 'OLHA PRA MIM',
      element: 'conhecimento',
      description: 'Estende a mão devagar e encosta: a SANIDADE do alvo vai a zero e ele definha por alguns segundos. Se ele já estiver com 30% de vida ou menos, MORRE. Muito lento e curtíssimo alcance — dá para esquivar.',
      energyCost: 30,
      cooldown: 16,
      windup: 0.75,
      recovery: 0.6,
      range: 1.3,
      damage: 30,
      duration: 4,
      dps: 6,
      slow: 0.8,
      drainAll: true,
      execute: 0.3,
      color: GOLD,
    },
    {
      // △ + □ BRILHO ENLOUQUECEDOR + FORTALECIMENTO PARANORMAL (cânone, as duas habilidades dos Existidos)
      id: 'brilhoEnlouquecedor',
      name: 'Brilho Enlouquecedor',
      input: 'carga+ranged',
      type: 'fearGaze',
      description: 'Os textos da pele, os olhos e a boca brilham em dourado: quem estiver olhando fica paralisado pelo terror dos escritos. Depois do brilho ela fica FORTALECIDA por 8 s: bate 50% mais forte e recebe 30% menos dano.',
      energyCost: 22,
      cooldown: 18,
      range: 6,
      arc: 120,
      windup: 0.5,
      recovery: 0.4,
      stun: 0.8,
      color: GOLD,
      selfBuff: { name: 'Fortalecimento Paranormal', buffType: 'fortalecimento', label: 'FORTALECIMENTO PARANORMAL', duration: 8, damageMult: 1.5, takenMult: 0.7, color: GOLD },
    },
  ],

  // Especial canônico (Desconjuração ep. 11 "Lembrar"): "Lembra de mim."
  special: {
    id: 'lembraDeMim',
    name: 'Lembra de Mim',
    banner: 'Lembra de mim.',
    type: 'lembraDeMim',
    energyCost: 0,
    cooldown: 24,
    damage: 360,
    range: 14,
    color: GOLD,
    description: 'Os textos da pele se desprendem e explodem numa tempestade dourada de memórias: paralisa o adversário de terror e causa dano massivo de Conhecimento.',
  },
  awakening: undefined,

  passives: [
    { type: 'noSanity' },
    { type: 'bloodPrice', resource: 'EXISTÊNCIA', color: GOLD, hpPerPoint: 1, minHealth: 0.03 },
    { type: 'elementalAffinity', element: 'conhecimento', mult: 1.1, resist: 0.8 }, // o Pingente da Lua Dourada
    // ACESA (cânone: "quando é atacada, os olhos e a boca brilham em amarelo, agressiva e forte"): apanhar acende 3.5 s de
    // golpes 25% mais fortes e velocidade multiplicada por 1.8 (avança rápido e ensandecida ao ser agredida)
    { type: 'litWhenHit', time: 3.5, mult: 1.25, speedMult: 1.8 },
    ...base.passives.filter((p) => p.type === 'merintofobia'),
  ],
};
