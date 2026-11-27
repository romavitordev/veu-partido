// BRAN (id: bran) — A VIGÍLIA (Treb Ciach, Irlanda, 890). Pedido do dono (2026-11-21): os membros da Vigília, cada um
// com a forma normal e a TRANSFORMADA (a fantasia do Samhain). Notas de cânone em lore/A-VIGILIA.md.
// Wiki "Bran": intérprete Core; O VIGIA NOTURNO, apelido "O INQUEBRÁVEL"; quase 2 m, ruivo; estoico e rígido, toma a
// LINHA DE FRENTE e "se atira em cima de criaturas para salvar seus companheiros"; nas situações extremas larga o lado
// gentil e ataca "com ódio e violência". Fala: "Eu preciso voltar, mais uma vez." Bran = "corvo" em gaélico.
// Afinidade: nenhuma no cânone; Core escolheria MORTE — o elemento aqui vem dessa escolha (PROPOSTA).
// Arsenal (cânone): a LANÇA "JUSTIÇA" (cabo de madeira, ponta de metal, nas costas), as AZAGAIAS que ele lança de longe,
// o BROQUEL e o punhal no cinto.
// Habilidades (ficha): PRONTIDÃO (rerola um dado seu ou de aliado), GUARDIÃO (vira o alvo do ataque feito a um aliado),
// CASCA GROSSA (reduz dano físico em 5) e INQUEBRÁVEL (+1d8 em testes de lesão ou trauma).
// PROPOSTA de jogo (marcada): as sequências da lança e do broquel, os números, o especial "Até o Amanhecer" e a
// Transformação "O Inquebrável" (a fantasia de corvo do Samhain, forms/bran_inquebravel.js).
const MORTE = 0x9aa4b4; // a cor fria do vigia (o cinza-azulado das penas da fantasia)
const STEEL = 0xc8c4c0;
const NIGHT = 0x5a6a86;

export default {
  id: 'bran',
  name: 'BRAN',
  model: 'bran',
  color: '#8a9ab4',
  origin: 'A Vigília',
  element: 'morte', // PROPOSTA: a escolha do Core (wiki)
  energyColor: NIGHT,
  info: {
    weapon: 'A lança "Justiça", as azagaias e o broquel',
    style: 'Muralha de linha de frente: a lança mantém longe, o broquel segura, e ele aguenta o golpe que derrubaria qualquer um',
    identity: 'O vigia noturno de Treb Ciach, o Inquebrável',
    tagline: 'Eu preciso voltar, mais uma vez.',
  },
  stats: { moveSpeed: 7.1, attackSpeed: 0.96 }, // quase 2 m, pesado (PROPOSTA)
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge', victory: 'vic_bran', block: 'block_heavy' },
  chargeFx: { style: 'default', color: NIGHT },
  dodge: { style: 'default', distance: 4.6 },

  // A LANÇA "JUSTIÇA" na direita e o BROQUEL na esquerda: as estocadas alcançam longe, o broquel bate de perto
  melee: {
    name: 'Justiça e Broquel',
    strikes: [
      { name: 'Estocada', anim: 'spear_thrust', dur: 0.32, active: [0.13, 0.21], damage: 26, range: 2.9, arc: 40, knockback: 1.0, lunge: 0.8, sound: 'swing', hitSound: 'bladeHit' },
      { name: 'Broquel na Cara', anim: 'shoulder_bash', dur: 0.36, active: [0.12, 0.22], damage: 30, range: 1.7, arc: 100, knockback: 2.0, lunge: 0.9, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Cravada por Cima', anim: 'spear_over', dur: 0.42, active: [0.2, 0.29], damage: 30, range: 3.0, arc: 40, knockback: 1.3, lunge: 0.9, sound: 'swing', hitSound: 'bladeHit' },
      { name: 'Haste Varrida', anim: 'spear_sweep', dur: 0.42, active: [0.15, 0.25], damage: 30, range: 2.7, arc: 160, knockback: 1.7, lunge: 0.6, sound: 'swing', hitSound: 'heavyPunch', trail: { color: STEEL, wide: true } },
      { name: 'Justiça', anim: 'spear_lunge', dur: 0.64, active: [0.3, 0.45], damage: 60, range: 3.3, arc: 40, lunge: 1.7, finisher: 'launch', hitstop: 0.12, sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.8, trail: { color: NIGHT, big: true } },
    ],
    up: { name: 'Lança de Baixo', anim: 'spear_low', dur: 0.46, active: [0.22, 0.32], damage: 38, range: 2.7, arc: 100, lunge: 0.7, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Pisão do Vigia', anim: 'stomp', dur: 0.5, active: [0.2, 0.3], damage: 44, range: 1.9, arc: 140, lunge: 0.6, finisher: 'knockdown', sound: 'heavyPunch', hitSound: 'heavyPunch' },
    // "se atira em cima de criaturas" (cânone): o corpo inteiro atrás do broquel
    forward: { name: 'Se Atira em Cima', anim: 'shoulder_charge', dur: 0.48, active: [0.13, 0.28], damage: 38, range: 2.0, arc: 110, knockback: 3.2, motion: [{ t: [0, 0.26], fwd: 5.4, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recuo de Lança', anim: 'spear_thrust', dur: 0.54, active: [0.3, 0.4], damage: 32, range: 3.0, arc: 40, knockback: 2.2, iframes: [0, 0.2], motion: [{ t: [0, 0.2], back: 2.6 }], sound: 'swing', hitSound: 'bladeHit' },
    side: { name: 'Roda da Lança', anim: 'spear_sweep', dur: 0.5, active: [0.15, 0.32], damage: 32, range: 2.8, arc: 300, knockback: 1.8, motion: [{ t: [0, 0.25], side: 2 }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: STEEL, wide: true } },
    air: { name: 'Lança do Alto', anim: 'spear_air', dur: 0.46, active: [0.2, 0.34], damage: 36, range: 2.7, arc: 80, knockback: 3, slam: 16, vertical: 2.4, sound: 'swing', hitSound: 'bladeHit' },
  },

  // □ AZAGAIA (cânone: "várias lanças menores, as quais Bran lançava para atacar à distância"): tira uma do cinto e
  // arremessa; a "Justiça" fica na mão. Segurar □ carrega o arremesso
  ranged: {
    name: 'Azagaia',
    description: 'Tira uma azagaia do cinto e arremessa. Segurando □ ele firma o braço: mais dano, mais rápida e quebra a defesa no máximo.',
    type: 'projectile',
    anim: 'spear_throw',
    origin: 'hand',
    windup: 0.3,
    recovery: 0.28,
    hold: { max: 0.9, anim: 'spear_throw_hold', release: 'spear_throw_release', releaseWindup: 0.12, damage: 1.7, speed: 1.4, knockback: 1.6, guardCrushAtMax: 16, color: NIGHT, label: 'AZAGAIA CARREGADA!' },
    count: 1,
    interval: 0,
    damage: 32,
    range: 20,
    speed: 36,
    radius: 0.36,
    spread: 0,
    knockback: 1.6,
    hitstun: 0.45,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'pilum',
    color: STEEL,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      // △ + ○ JUSTIÇA (a lança do cânone): recua a lança e crava com o corpo todo
      id: 'cravarJustica',
      name: 'Cravar a Justiça',
      input: 'carga+physical',
      type: 'heavyBlow',
      description: 'Recua a "Justiça" e crava com o corpo todo: alcance longo, quebra a defesa e derruba. Preparação longa; errar deixa ele aberto.',
      energyCost: 26,
      cooldown: 12,
      anim: 'arn_lunge',
      duration: 1.05,
      armorFrom: 0.25,
      impact: 0.62,
      step: 5.5,
      range: 3.3,
      arc: 40,
      damage: 84,
      knockback: 4,
      guardCrush: 60,
      whiffRecovery: 0.5,
      color: NIGHT,
      ai: { when: 'opening', max: 3.3 },
    },
    {
      // △ + L2 GUARDIÃO (cânone: vira o alvo do ataque feito a um aliado) — no 1 contra 1: planta o broquel e segura
      id: 'guardiao',
      name: 'Guardião',
      input: 'carga+dodge',
      type: 'heavyProtection',
      label: 'GUARDIÃO',
      description: 'Planta o broquel e segura a linha: por 7 s recebe 40% menos dano e aguenta 3 golpes sem recuar, um pouco mais lento.',
      energyCost: 24,
      cooldown: 20,
      duration: 7,
      takenMult: 0.6,
      armor: 3,
      speedMult: 0.9,
      ai: { when: 'hurt' },
    },
    {
      // R2 + × PRONTIDÃO (cânone: rerola o dado) — no jogo, a reação pronta: segura o golpe que vem e devolve com o broquel
      id: 'prontidao',
      name: 'Prontidão',
      input: 'block+jump',
      type: 'arenaCounterStance',
      description: 'Fica pronto, de broquel erguido: um golpe físico ou habilidade que chegar de frente é segurado — ele empurra o broquel na cara e crava a lança. Não segura projéteis nem especiais; no vazio, fica aberto.',
      window: [0.08, 0.8],
      recovery: 0.4,
      reach: 3,
      energyCost: 18,
      cooldown: 9,
      damage: 50,
      range: 3,
      color: NIGHT,
      label: 'PRONTIDÃO!',
      riposte: {
        windup: 0.06,
        range: 3,
        lunge: 5,
        hold: 0.5,
        blows: 1,
        blowAnims: ['shoulder_bash'],
        blowDamage: 20,
        final: 'throw',
        finalDamage: 30,
        label: 'GOLPE SEGURADO!',
        color: NIGHT,
      },
    },
    {
      // R2 + △ SE ATIRA NA FRENTE (cânone: "se atirando em cima de criaturas"): avança atrás do broquel e passa por cima
      id: 'seAtira',
      name: 'Linha de Frente',
      input: 'block+carga',
      type: 'dashStrike',
      description: 'Se atira em cima do adversário atrás do broquel: quebra a defesa e joga longe.',
      energyCost: 20,
      cooldown: 10,
      anim: 'shoulder_charge',
      windup: 0.26,
      distance: 6.5,
      speed: 20,
      recovery: 0.38,
      range: 2.2,
      damage: 52,
      knockback: 4,
      guardBreak: true,
      hitSound: 'heavyPunch',
      color: NIGHT,
    },
  ],

  // ATÉ O AMANHECER (PROPOSTA; o vigia guarda Treb Ciach da escuridão até as 6 da manhã): finca o broquel e aguenta tudo
  // por 2 s — o adversário bate à vontade —, depois devolve num giro da "Justiça" que cresce com o que segurou
  special: {
    name: 'Até o Amanhecer',
    banner: 'Eu preciso voltar, mais uma vez.',
    type: 'ironWall',
    energyCost: 50,
    cooldown: 14,
    stance: 2,
    takenMult: 0.15,
    base: 120,
    ratio: 0.75,
    maxBonus: 200,
    radius: 3.6,
    furia: 0, // sem a Fúria do Cornelius
    release: 'ATÉ O AMANHECER',
    damage: 250,
    color: NIGHT,
    sound: 'specialStart',
  },

  // O INQUEBRÁVEL (o apelido; PROPOSTA: a fantasia de corvo do Samhain como Transformação): põe a máscara de crânio de
  // corvo, as penas sobem pelos ombros e ele fica assim até o fim do round
  awakening: {
    name: 'O Inquebrável',
    banner: 'O Inquebrável',
    type: 'maskTransform',
    prop: 'crowMask',
    form: 'bran_inquebravel',
    formBanner: 'O INQUEBRÁVEL',
    swap: [['feathers', true], ['hair', false], ['fur', false]],
    sound: 'maskOn',
    tint: 0x8aa0c0,
    duration: 0, // até o fim do round
    bonusHealth: 100,
    color: NIGHT,
  },

  passives: [
    // CASCA GROSSA (cânone: reduz dano físico em 5): leva menos dos golpes e dos tiros e quase não é empurrado
    { type: 'resistant', kinds: ['melee', 'ranged'], mult: 0.9 },
    { type: 'thickSkin', knockback: 0.7, chip: 0.7, guard: 0.8 },
    // INQUEBRÁVEL (cânone: +1d8 em testes de lesão ou trauma): uma vez por round, o golpe que o derrubaria o deixa com 1
    // de vida ("Eu preciso voltar, mais uma vez")
    { type: 'escapeDeath' },
  ],
};
