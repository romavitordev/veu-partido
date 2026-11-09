// IVETE BEICUR (id: ivete) — Ordo Realitas (fornecedora de equipamentos; antes dona do Suvaco Seco, o bar de motoqueiros
// de Carpazinha). Cânone (wiki "Ivete Beicur"): entre 50 e 60 anos, dos GAUDÉRIOS ABUTRES (a tatuagem da insígnia no
// braço direito, a mesma do pescoço do Arthur: o juramento de proteger quem ama); bruta e fria com estranhos, carinhosa
// com os de perto; a MÃE do Arthur (e "tia" do Kaiser e do Joui). Aptidões: CONHECIMENTO DE ARMAS (cuida do arsenal da
// Ordem; "habilidosa atiradora", deu muito dano no Espreitador) e BARWOMAN. Arsenal: a ESPINGARDA com um CINTO DE
// MUNIÇÕES na coronha. Fuma (e guardava charutos cubanos caros). Sem rituais: 10% de exposição paranormal.
// Fala: "você só precisa buscar um motivo e você se agarra nele com toda força que tu pode!"
// PROPOSTA de jogo (marcada): os golpes de briga de bar, a Garrafada, a Fumaça do Charuto, o Juramento dos Gaudérios
// como estado, o especial, o despertar, os números e o elemento SANGUE (sem afinidade no cânone: o juramento e a
// família, como o Cristopher).
const DENIM = 0x5a8ab8;
const SHELL = 0xd83a2a;
const SMOKE = 0xb8b0a0;

export default {
  id: 'ivete',
  name: 'IVETE BEICUR',
  model: 'ivete',
  color: '#5a8ab8',
  origin: 'Ordo Realitas', // a fornecedora do arsenal; antes dos Gaudérios Abutres
  element: 'sangue', // PROPOSTA: sem afinidade no cânone
  energyColor: SHELL,
  info: {
    weapon: 'A espingarda com o cinto de cartuchos na coronha e as garrafas do Suvaco Seco',
    style: 'Briga de bar de perto e a espingarda de chumbo espalhado: forte colada no adversário, garrafada de longe e a fumaça do charuto para segurar quem vem',
    identity: 'A dona do Suvaco Seco, a mãe do Arthur e quem cuida do arsenal da Ordem',
    tagline: 'Busca um motivo e se agarra nele com toda força.',
  },
  stats: { moveSpeed: 7.9, attackSpeed: 0.97 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'victory', block: 'block' },
  chargeFx: { style: 'default', color: SHELL },
  dodge: { style: 'default', distance: 4.6 },

  // BRIGA DE BAR (PROPOSTA; base canônica: trabalha entre gangues de motoqueiros "desde sempre" e sabe se proteger)
  melee: {
    name: 'Briga de Bar',
    strikes: [
      { name: 'Tapa', anim: 'jab', dur: 0.26, active: [0.08, 0.15], damage: 20, range: 1.5, arc: 100, knockback: 0.8, lunge: 1.0, sound: 'swing', hitSound: 'punch' },
      { name: 'Soco de balcão', anim: 'hook_r', dur: 0.3, active: [0.1, 0.17], damage: 25, range: 1.6, arc: 110, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'punch' },
      { name: 'Cabeçada', anim: 'headbutt', dur: 0.34, active: [0.12, 0.2], damage: 28, range: 1.4, arc: 90, knockback: 1.6, lunge: 0.9, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Bota na porta', anim: 'kick_front', dur: 0.44, active: [0.15, 0.25], damage: 50, range: 1.9, arc: 80, lunge: 1.5, finisher: 'launch', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.25 },
    ],
    up: { name: 'Gancho', anim: 'uppercut', dur: 0.4, active: [0.12, 0.22], damage: 34, range: 1.7, arc: 110, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch' },
    down: { name: 'Canelada', anim: 'kick_low', dur: 0.42, active: [0.15, 0.25], damage: 34, range: 1.9, arc: 130, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Empurrão de bar', anim: 'shove', dur: 0.42, active: [0.12, 0.24], damage: 30, range: 1.9, arc: 110, knockback: 3.0, motion: [{ t: [0, 0.2], fwd: 4.6, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recua e soca', anim: 'hook_l', dur: 0.48, active: [0.26, 0.34], damage: 30, range: 1.7, arc: 100, knockback: 2.2, iframes: [0, 0.18], motion: [{ t: [0, 0.14], back: 2.4 }, { t: [0.17, 0.3], fwd: 2.2, stopClose: true }], sound: 'swing', hitSound: 'punch' },
    side: { name: 'Chute lateral', anim: 'side_kick', dur: 0.36, active: [0.12, 0.21], damage: 28, range: 1.9, arc: 120, knockback: 1.8, motion: [{ t: [0, 0.2], side: 2.4 }], sound: 'swing', hitSound: 'kick' },
    air: { name: 'Chute aéreo', anim: 'air_kick', dur: 0.38, active: [0.12, 0.28], damage: 28, range: 1.8, arc: 110, knockback: 3, slam: 14, vertical: 2.2, sound: 'swing', hitSound: 'kick' },
  },

  // □ ESPINGARDA (cânone, o arsenal): tira das costas e dá um tiro de chumbo espalhado — forte de perto, fraco de longe
  ranged: {
    name: 'Espingarda',
    description: 'Tira a espingarda das costas e dispara chumbo espalhado: forte de perto, perde força com a distância.',
    type: 'projectile',
    anim: 'shoot_rifle',
    showProp: 'shotgun',
    hideProp: 'shotgunBack',
    windup: 0.22,
    recovery: 0.42,
    count: 6,
    interval: 0,
    damage: 10,
    range: 9,
    speed: 55,
    radius: 0.3,
    spread: 0.34,
    knockback: 2.4,
    hitstun: 0.3,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'pellet',
    color: 0xffd27a,
    sound: 'shotgun',
    hitSound: 'impact',
  },

  abilities: [
    {
      // △ + □ BEM-VINDO AO SUVACO SECO (PROPOSTA; base canônica: a espingarda e a atiradora que entrou no quarto do
      // Espreitador): encosta o cano no adversário e dispara à queima-roupa
      id: 'suvacoSeco',
      name: 'Bem-vindo ao Suvaco Seco',
      input: 'carga+ranged',
      type: 'pointBlank',
      ritual: false,
      description: 'Encosta o cano da espingarda no adversário e dispara à queima-roupa: só funciona COLADA nele (até 2,6 m) e joga longe.',
      energyCost: 20,
      cooldown: 9,
      range: 2.6,
      windup: 0.16,
      recovery: 0.36,
      damage: 56,
      knockback: 4,
      hitstun: 0.6,
      launch: true,
      anim: 'shoot_rifle',
      showProp: 'shotgun',
      hideProp: 'shotgunBack',
      sound: 'shotgun',
      color: SHELL,
      ai: { when: 'near', max: 2.4 },
    },
    {
      // △ + ○ GARRAFADA (PROPOSTA; base canônica: BARWOMAN, a vida inteira atrás do balcão): arremessa uma long neck
      id: 'garrafada',
      name: 'Garrafada',
      input: 'carga+physical',
      type: 'throwProjectile',
      description: 'Arremessa uma garrafa do Suvaco Seco na cabeça do adversário: quem leva fica TONTO por meio segundo.',
      energyCost: 16,
      cooldown: 8,
      windup: 0.26,
      recovery: 0.3,
      anim: 'throw_r',
      showProp: 'bottle',
      sound: 'knifeThrow',
      projectile: { damage: 34, range: 20, speed: 30, radius: 0.36, knockback: 1.2, hitstun: 0.45, visual: 'bottle', color: 0x7a4a14, hitSound: 'blockHit', kind: 'ability', onHit: { stun: 0.5, label: 'GARRAFADA!' } },
      ai: { when: 'far', min: 3 },
    },
    {
      // △ + L2 FUMAÇA DO CHARUTO (PROPOSTA; base canônica: o vício em fumar e os charutos cubanos que ela guardava): uma
      // baforada grossa à frente que engole projéteis e deixa quem entra lento e sem recuperar sanidade
      id: 'charuto',
      name: 'Fumaça do Charuto',
      input: 'carga+dodge',
      type: 'mistCloud',
      ritual: false,
      description: 'Acende um charuto cubano e solta uma baforada grossa à frente: a fumaça engole projéteis, deixa o adversário lento e sem recuperar sanidade dentro dela.',
      energyCost: 18,
      cooldown: 13,
      distance: 2.6,
      radius: 2.8,
      duration: 4.5,
      enemySlow: 0.25,
      enemyRegen: 0,
      eatsProjectiles: true,
      smokeIntensity: 0.8,
      color: SMOKE,
      ai: { when: 'far', min: 2 },
    },
    {
      // R2 + △ JURAMENTO DOS GAUDÉRIOS (PROPOSTA; base canônica: a insígnia tatuada no braço, "o juramento de proteger
      // quem amam pelo brasão dos Gaudérios"): por 6 s bate mais forte, aguenta mais e não recua com golpes leves
      id: 'juramento',
      name: 'Juramento dos Gaudérios',
      input: 'block+carga',
      type: 'selfBuff',
      ritual: false,
      buffType: 'juramentoGauderios',
      label: 'JURAMENTO DOS GAUDÉRIOS',
      anim: 'concentrate',
      description: 'Bate na insígnia tatuada no braço: por 6 s bate 20% mais forte, recebe 15% menos dano e não recua com golpes leves.',
      energyCost: 22,
      cooldown: 20,
      duration: 6,
      damageMult: 1.2,
      affects: ['melee', 'ranged', 'ability'],
      takenMult: 0.85,
      armor: 1,
      color: SHELL,
      sound: 'ready',
      ai: { when: 'hurt' },
    },
  ],

  // NINGUÉM MEXE COM OS MEUS MENINOS (PROPOSTA; a mãe do Arthur e "tia" do Kaiser e do Joui): tapa, garrafada na cara e
  // dois tiros de espingarda bombeando, o último à queima-roupa
  special: {
    name: 'Ninguém Mexe com os Meus Meninos',
    banner: 'Busca um motivo e se agarra nele!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: SHELL,
    sound: 'specialStart',
    prepare: { anim: 'jab', time: 0.3 },
    dash: { speed: 22, maxTime: 0.45, contact: 2.0 },
    standOff: 2.0,
    hits: [
      { t: 0.2, anim: 'jab', dur: 0.28, share: 0.12, fx: { kind: 'punch' }, sound: 'punch', shout: 'SAI DAQUI!' },
      { t: 0.55, anim: 'throw_r', dur: 0.36, share: 0.2, fx: { kind: 'punch', big: true, color: 0x7a4a14 }, sound: 'blockHit', props: [['bottle', true]], shout: 'GARRAFADA!' },
      { t: 1.0, anim: 'shoot_rifle', dur: 0.45, share: 0.28, fx: { kind: 'punch', big: true, color: 0xffd27a }, sound: 'shotgun', props: [['bottle', false], ['shotgun', true], ['shotgunBack', false]] },
      { t: 1.6, anim: 'shoot_rifle', dur: 0.7, share: 0.4, fx: { kind: 'punch', big: true, color: SHELL }, sound: 'shotgun', burst: { count: 4, gap: 0.08, sound: 'impact' }, final: true, shout: 'NINGUÉM!' },
    ],
    bannerAt: 0.2,
    length: 2.8,
  },

  // A ÚLTIMA GAUDÉRIA (PROPOSTA; cânone: perdeu os Gaudérios, o bar e o Seu Getúlio e se agarrou no Arthur): até o fim
  // do round bate e aguenta mais e as recargas voltam mais rápido
  awakening: {
    name: 'A Última Gaudéria',
    banner: 'Você é a única coisa que sobrou da minha vida.',
    type: 'awakenMode',
    mult: 1.14, affects: ['melee', 'ranged', 'ability'], cdRate: 1.3, regen: 2, heal: 0.1, takenMult: 0.88, speedMult: 1.05, aura: 'smoke', color: SHELL,
  },

  passives: [
    // SE AGARRA NO MOTIVO (PROPOSTA; a fala do cânone): uma vez por round, abaixo de 30% de vida, bate 25% mais forte por
    // 8 s, anda mais rápido e recupera sanidade
    { type: 'revenge', below: 0.3, mult: 1.25, duration: 8, energy: 30, label: 'SE AGARRA NO MOTIVO' },
  ],
};
