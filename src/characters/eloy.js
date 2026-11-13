// ELOY FURTADO (id: eloy) — PSIKOLERA (Hexatombe), o baterista e fundador da banda. Pedido do dono (2026-11-12): o
// primeiro membro da equipe nova. Cânone (wiki "Eloy Furtado", lore/EQUIPES-HEXATOMBE.md): ~1,90 m, musculoso, o
// macacão de camisa de força, as faixas nas mãos; gentil e mediador sem a FOCINHEIRA — com ela os olhos ficam brancos,
// fica irritável, com AVERSÃO A TOQUE, "quase um animal selvagem", batendo o pé e a cabeça no ritmo. Arma: as
// BAQUETAS manchadas de sangue (estoca com elas). Habilidade MOELLER METHOD (pula no alvo e soca como uma bateria até o
// alvo resistir); bônus de aliado PORRADA RÍTMICA (o aliado bate no ritmo de um tambor de guerra). Cenas: se joga em
// cima da Cindy, soca o Jae sem parar, agarra o Argano e soca, desce do alto cravando a baqueta (arte com a Escarlata);
// o personagem que mais vezes entrou em "Morrendo" e voltou.
// PROPOSTA de jogo (marcada): os números, o Mosh (□), o Bumbo Duplo, o especial e o despertar.
const BLOOD = 0x8a0c14;
const DRUM = 0xe8d8a8; // o brilho das faixas bege no rastro dos golpes
const WILD = 0xf4f4f0; // os olhos brancos da focinheira

export default {
  id: 'eloy',
  name: 'ELOY FURTADO',
  model: 'eloy',
  color: '#c4bca6', // o macacão de camisa de força
  origin: 'PSIKOLERA',
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'As baquetas manchadas de sangue e os punhos enfaixados',
    style: 'Briga no ritmo: estocadas de baqueta, socos sem parar, se joga em cima e põe a focinheira quando o show esquenta',
    identity: 'O baterista e fundador da PSIKOLERA',
    tagline: 'NO RITMO, CARALHO!',
  },
  stats: { moveSpeed: 7.7, attackSpeed: 1.12 },
  anims: { idle: 'idle_dual', run: 'run', charge: 'charge_dual', victory: 'victory', block: 'block' },
  chargeFx: { style: 'default', color: BLOOD },
  dodge: { style: 'default', distance: 5 },

  // AS BAQUETAS (cânone: estoca com elas) e os punhos: o combo é uma levada, cada golpe no tempo
  melee: {
    name: 'Baquetas',
    strikes: [
      { name: 'Caixa', anim: 'dual_r', dur: 0.24, active: [0.07, 0.14], damage: 18, range: 1.7, arc: 100, knockback: 0.6, lunge: 1.0, sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.0, color: DRUM, tilt: 0.1 } },
      { name: 'Contratempo', anim: 'dual_l', dur: 0.24, active: [0.07, 0.14], damage: 18, range: 1.7, arc: 100, knockback: 0.6, lunge: 1.0, sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.0, color: DRUM, flip: true } },
      { name: 'Soco no tempo', anim: 'hook_r', dur: 0.28, active: [0.09, 0.16], damage: 22, range: 1.6, arc: 90, knockback: 0.8, lunge: 1.1, sound: 'swing', hitSound: 'punch' },
      { name: 'Rufo', anim: 'flurry', dur: 0.42, actives: [[0.08, 0.13], [0.16, 0.21], [0.24, 0.29]], damage: 14, range: 1.7, arc: 100, knockback: 0.4, lunge: 0.8, sound: 'swing', hitSound: 'punch' },
      { name: 'Prato de ataque', anim: 'dual_both', dur: 0.48, active: [0.17, 0.27], damage: 48, range: 1.9, arc: 130, lunge: 1.5, finisher: 'launch', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.3, hitstop: 0.09, bleed: { dps: 3, duration: 2 }, trail: { radius: 1.2, color: BLOOD, big: true } },
    ],
    up: { name: 'Baqueta de baixo', anim: 'uppercut', dur: 0.4, active: [0.12, 0.24], damage: 32, range: 1.7, arc: 110, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch' },
    // o pé batendo no ritmo (cânone: com a focinheira ele bate o pé o tempo todo)
    down: { name: 'Pedal do bumbo', anim: 'stomp', dur: 0.46, active: [0.2, 0.28], damage: 36, range: 1.7, arc: 140, lunge: 0.6, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', groundFx: 'dust', groundScale: 0.6 },
    forward: { name: 'Se joga', anim: 'shoulder_charge', dur: 0.44, active: [0.12, 0.26], damage: 30, range: 1.9, arc: 110, knockback: 2.4, motion: [{ t: [0, 0.24], fwd: 6.0, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recua e estoca', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 28, range: 1.7, arc: 100, knockback: 2.2, iframes: [0, 0.22], motion: [{ t: [0, 0.15], back: 2.6 }, { t: [0.18, 0.32], fwd: 2.0, stopClose: true }], sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.1, color: DRUM } },
    side: { name: 'Virada', anim: 'dual_spin', dur: 0.38, active: [0.1, 0.22], damage: 26, range: 1.8, arc: 160, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.2, color: DRUM } },
    // a arte com a Escarlata: desce do alto com a baqueta erguida para cravar
    air: { name: 'Baqueta do alto', anim: 'air_dual', dur: 0.4, active: [0.14, 0.3], damage: 32, range: 1.8, arc: 110, knockback: 3, slam: 15, vertical: 2.4, sound: 'swing', hitSound: 'bladeHit', trail: { radius: 1.2, color: BLOOD, roll: 1.2 } },
  },

  // □ MOSH (PROPOSTA; cânone: ele se JOGA em cima dos alvos — a Cindy, o Jae): atravessa a arena e cai em cima socando
  ranged: {
    name: 'Mosh',
    type: 'dashStrike',
    description: 'Se joga de corpo inteiro: avança 9 m numa linha e, se encontra o adversário, cai em cima dele com os punhos.',
    anim: 'shoulder_charge',
    windup: 0.16,
    distance: 9,
    speed: 28,
    recovery: 0.36,
    range: 1.7,
    aiRange: 9,
    damage: 30,
    knockback: 2.6,
    hitstun: 0.5,
    cooldown: 3,
    energyCost: 0,
    color: DRUM,
    trailKind: 'smoke',
    startSound: 'swing',
    hitSound: 'heavyPunch',
  },

  abilities: [
    {
      // △ + ○ MOELLER METHOD (cânone): pula no alvo e soca como se fosse uma bateria, até ele resistir
      id: 'moellerMethod',
      name: 'Moeller Method',
      input: 'carga+physical',
      type: 'arenaGrab',
      description: 'Pula em cima do adversário e soca como se tocasse bateria: seis socos no ritmo e a baqueta cravada no fim. Errou o pulo, fica exposto.',
      energyCost: 28,
      cooldown: 12,
      windup: 0.32,
      lunge: 9,
      range: 1.8,
      hold: 1.5,
      blows: 6,
      blowAnims: ['jab', 'hook_r', 'hook_l', 'jab', 'hook_r', 'hook_l'],
      blowDamage: 9,
      finalDamage: 30,
      final: 'slam',
      label: 'MOELLER METHOD!',
      element: 'sangue',
      hitSound: 'punch',
      color: BLOOD,
    },
    {
      // △ + □ DO ALTO (cânone: a arte "Eloy e Escarlata" — desce de cima cravando a baqueta)
      id: 'doAlto',
      name: 'Do Alto',
      input: 'carga+ranged',
      type: 'heavyBlow',
      description: 'Agacha, salta por cima do adversário e desce cravando as duas baquetas: aguenta um golpe na preparação e faz sangrar. Se errar, fica exposto.',
      energyCost: 26,
      cooldown: 11,
      anim: 'raziel_pounce',
      duration: 0.95,
      armorFrom: 0.05,
      impact: 0.62,
      step: 9,
      stepTime: 0.32,
      track: true,
      range: 2.4,
      arc: 140,
      damage: 64,
      knockback: 2.0,
      bleed: { dps: 4, duration: 2.5 },
      element: 'sangue',
      whiffRecovery: 0.4,
      hitSound: 'bladeHit',
      color: BLOOD,
    },
    {
      // R2 + △ A FOCINHEIRA (cânone): os olhos brancos, a aversão a toque — bate mais forte e mais rápido, aguenta golpes,
      // mas NÃO DEFENDE (não deixa ninguém chegar perto do jeito certo)
      id: 'focinheira',
      name: 'Focinheira',
      input: 'block+carga',
      type: 'maskForm',
      description: 'Tranca a focinheira de espinhos no cadeado da gola e ruge: por 9 s os olhos ficam brancos, ele fica curvado e agressivo, bate mais forte e mais rápido e aguenta golpes sem recuar, mas não consegue defender.',
      energyCost: 30,
      cooldown: 20,
      duration: 9,
      damageMult: 1.2,
      speedMult: 1.1,
      armor: 2,
      noBlock: true,
      atkSpeed: 1.15,
      idleAnim: 'idle_wild', // curvado, batendo a cabeça e o pé no ritmo
      wild: { anim: 'taunt_roar', shout: 'NÃO ENCOSTA EM MIM!' },
      label: 'FOCINHEIRA',
      color: WILD,
    },
    {
      // △ + L2 PORRADA RÍTMICA (cânone: o bônus de aliado — bater no ritmo de um tambor de guerra)
      id: 'porradaRitmica',
      name: 'Porrada Rítmica',
      input: 'carga+dodge',
      type: 'selfBuff',
      buffType: 'porradaRitmica',
      label: 'PORRADA RÍTMICA',
      anim: 'taunt_roar',
      animTime: 0.5,
      sound: 'powerUp',
      description: 'Puxa o ritmo do tambor de guerra: por 7 s os golpes físicos saem mais rápidos e mais fortes, e na batalha em equipe as assistências ficam prontas na hora.',
      energyCost: 22,
      cooldown: 18,
      duration: 7,
      atkSpeed: 1.2,
      damageMult: 1.1,
      affects: ['melee'],
      orderAllies: true,
      color: DRUM,
      ai: { when: 'close' },
    },
    {
      // R2 + × BUMBO DUPLO (PROPOSTA; cânone: o pé batendo no ritmo): pisa forte e o chão treme em volta
      id: 'bumboDuplo',
      name: 'Bumbo Duplo',
      input: 'block+jump',
      type: 'stompQuake',
      description: 'Pisa duas vezes no tempo do bumbo: a onda de choque derruba quem estiver perto no chão.',
      energyCost: 18,
      cooldown: 10,
      duration: 0.75,
      impact: 0.42,
      radius: 3.2,
      damage: 30,
      armorMax: 50,
      color: DRUM,
    },
  ],

  // SOLO DE BATERIA (PROPOSTA; base canônica: o show da PSIKOLERA no The Monica Club). A bateria surge na frente dele e
  // ele toca uma levada; no meio da virada tranca a FOCINHEIRA, os olhos ficam brancos e a raiva toma conta: espanca a
  // caixa, chuta a bateria inteira para longe e se joga no adversário — socos no tempo e o prato final que joga longe.
  special: {
    name: 'Solo de Bateria',
    banner: 'SOLO DE BATERIA!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLOOD,
    sound: 'specialStart',
    physical: true,
    prepare: {
      anim: 'drum_play', loop: true, time: 2.35, kit: 'drums', shots: 'drumSolo',
      // a levada (bumbo/caixa), a virada nos tons e o prato
      drums: [
        [0.12, 'kick'], [0.12, 'crash'], [0.3, 'hihat'], [0.48, 'snare'], [0.66, 'kick'], [0.75, 'kick'], [0.84, 'snare'],
        [1.0, 'tomL'], [1.08, 'tomR'], [1.16, 'floor'], [1.24, 'floor'], [1.32, 'crash'], [1.32, 'kick'],
        // a raiva da focinheira: espanca a caixa cada vez mais rápido
        [1.72, 'snare'], [1.78, 'snare'], [1.84, 'snare'], [1.89, 'snare'], [1.94, 'snare'], [1.98, 'crash'],
      ],
      showProp: 'maskOn', showAt: 1.42, keepIfBuff: 'mask',
      steps: [
        { t: 1.38, anim: 'concentrate', dur: 0.2 },
        { t: 1.46, anim: 'taunt_roar', dur: 0.3, rage: true, shout: 'NÃO ENCOSTA EM MIM!', sound: 'maskOn' },
        { t: 1.68, anim: 'drum_play' },
        { t: 2.02, anim: 'kick_front', dur: 0.3, smash: true },
      ],
    },
    dash: { speed: 24, maxTime: 0.7, contact: 1.6 },
    standOff: 1.4,
    hits: [
      { t: 0.15, anim: 'jab', dur: 0.2, share: 0.07, fx: { kind: 'punch' }, sound: 'punch' },
      { t: 0.32, anim: 'hook_r', dur: 0.22, share: 0.07, fx: { kind: 'punch' }, sound: 'punch' },
      { t: 0.5, anim: 'hook_l', dur: 0.22, share: 0.07, fx: { kind: 'punch' }, sound: 'punch', shout: 'NO RITMO!' },
      { t: 0.68, anim: 'dual_r', dur: 0.2, share: 0.07, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 0.84, anim: 'dual_l', dur: 0.2, share: 0.07, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.0, anim: 'flurry', dur: 0.42, share: 0.15, fx: { kind: 'punch' }, sound: 'heavyPunch' },
      { t: 1.55, anim: 'dual_both', dur: 0.5, share: 0.5, fx: { kind: 'stab', big: true, color: BLOOD }, sound: 'slashFinal', final: true, shout: 'PRATO!', bleed: { dps: 4, duration: 2.5 } },
    ],
    bannerAt: 0.2,
    length: 2.7,
  },

  // O SHOW NÃO PARA (PROPOSTA; cânone: o show no The Monica Club — o mosh pit e o portal aberto). Como os Mascarados, a
  // PSIKOLERA fica mais forte com as máscaras: no despertar ele TRANCA A FOCINHEIRA e fica com ela até o fim do round —
  // os olhos brancos, a postura de bicho (batendo a cabeça e o pé no ritmo)
  awakening: {
    name: 'O Show Não Para',
    banner: 'O SHOW NÃO PARA!',
    type: 'awakenMode',
    anim: 'taunt_roar',
    props: [['maskOn', true]],
    idleAnim: 'idle_wild',
    mult: 1.15, affects: ['melee', 'ability', 'special'], cdRate: 1.3, regen: 2, heal: 0.12, speedMult: 1.06, aura: 'flame', color: BLOOD,
  },

  passives: [
    // o personagem que mais vezes entrou em "Morrendo" e levantou: uma vez por round fica com 1 de vida
    { type: 'escapeDeath' },
  ],
};
