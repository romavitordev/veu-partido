// O QUIBUNGO (id: quibungo) — OUTRO LADO, JOGÁVEL. Pedido do dono (2026-11-20): "assim que finalizar o quimbungo quero
// que lance ele como personagem jogavel do time do 'Outro Lado'" e "deveria [estar] junto das criaturas do outro lado".
// Hexatombe ep. 5 (wiki "Quibungo"): a criatura de Sangue da Coroa de Espinhos — carne vermelha, sem olhos, a bocarra de
// presas com as mandíbulas dos lados, QUATRO braços de dedos longos e a BOCARRA NAS COSTAS cercada de espinhos de osso,
// de onde sai a língua. É o chefe do Sertão do Quibungo no modo Outro Lado (combat/sertaoBeasts.js): o kit daqui são os
// golpes dele lá (garrada, rajada dos quatro braços, pancada que racha o chão, a língua que puxa, o salto e o URRO).
// PROPOSTA: os botões, os nomes dos golpes (menos a língua e os quatro braços) e todos os números.
// Modelo: tools/blender/char_quibungo.py → public/models/quibungo.glb (a MESMA escultura do chefe, no esqueleto de
// lutador). Garras com os clipes de besta do Raziel (db_*), como o Carniçal.
import raziel from './raziel.js';

const FLESH = 0x8a1a20;
const BLOOD = 0xb01020;
const TONGUE = 0x8a2a4a;
const BONE = 0xd4b48a;
const DUST = 0x9a7a50;
const abil = (def, id) => def.abilities.find((a) => a.id === id);
const claw = (s, name) => ({ ...s, name, element: 'sangue', trail: { ...(s.trail || {}), color: BLOOD } });

export default {
  id: 'quibungo',
  name: 'QUIBUNGO',
  model: 'quibungo',
  color: '#9a1a20',
  origin: 'Outro Lado',
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'Quatro braços de garras, a bocarra e a língua das costas',
    style: 'Gigante bruto: rasga com os quatro braços, racha o chão, puxa de longe com a língua e urra para ficar mais rápido',
    identity: 'A criatura de Sangue do sertão da Coroa de Espinhos, a bocarra aberta nas costas',
    tagline: 'A bocarra das costas também tem fome.',
  },
  stats: { moveSpeed: 7.0, attackSpeed: 0.95 }, // o gigante: mais lento, golpes pesados
  anims: { idle: 'idle_raziel', run: 'run', charge: 'db_charge', victory: 'taunt_roar', block: 'db_block' },
  chargeFx: { style: 'aura', color: BLOOD, smoke: FLESH },
  dodge: { style: 'default', distance: 4.2 },
  // o FOGO queima mais (como o chefe: as lamparinas, o Cristino, as tochas)
  weakTo: { fire: 1.5 },
  // o RETRATO (dono, 2026-11-20, com a arte do Quibungo: "ele de lado, olhando pra camera, como um tigre, sua lingua
  // como um rabo curvado pra cima"): o corpo de perfil e curvado, a cabeça virada para a câmera, um braço erguido em garra
  portrait: {
    turn: -1.1,
    fit: true,
    bones: [
      ['sp', 'side', -0.45], ['hd', 'up', 0.9], // ergue o tronco do agachado e vira o rosto sem olhos para a câmera
      ['sR', 'side', 0.6], ['eR', 'side', -1.2], ['sL', 'side', 0.9], ['eL', 'side', -0.6], // a garra erguida
      ['lL', 'side', -0.35], ['kL', 'side', 0.5], ['lR', 'side', 0.35], // a perna da frente avançada
    ],
  },

  // GARRADA: o combo de garras (os clipes de besta do Raziel), os dedos longos rasgando
  melee: {
    name: 'Garrada',
    strikes: raziel.melee.strikes.map((s, i) => claw(s, ['Garrada', 'Garrada de volta', 'Quatro garras', 'Rasgar', 'Rasgar'][i] || s.name)),
    up: claw(raziel.melee.up, 'Garra de baixo'),
    down: claw(raziel.melee.down, 'Esmagar'),
    forward: claw(raziel.melee.forward, 'Avanço do gigante'),
    back: claw(raziel.melee.back, 'Recua e rasga'),
    side: claw(raziel.melee.side, 'Varredura de quatro braços'),
    air: claw(raziel.melee.air, 'Cair sobre a presa'),
  },

  // □ A LÍNGUA DAS COSTAS: chicoteia de longe e PUXA a presa para perto (o golpe do chefe)
  ranged: {
    name: 'Língua da Bocarra',
    type: 'projectile',
    homing: 1.4,
    anim: 'point',
    chain: true,
    rope: true,
    ropeColor: TONGUE,
    ropeThick: 0.07,
    windup: 0.32,
    recovery: 0.36,
    count: 1,
    interval: 0,
    damage: 22,
    range: 11,
    speed: 26,
    radius: 0.55,
    spread: 0,
    knockback: 0,
    hitstun: 0.15,
    onHit: { pull: { distance: 2.2, time: 0.35, after: 0.6 } },
    cooldown: 4.5,
    energyCost: 10,
    visual: 'inkClaw',
    color: TONGUE,
    element: 'sangue',
    sound: 'chainThrow',
    hitSound: 'chainPull',
  },

  abilities: [
    {
      // △ + ○ RAJADA DOS QUATRO BRAÇOS (o "flurry" do chefe): as quatro mãos descem uma atrás da outra
      id: 'rajadaQuibungo',
      name: 'Rajada dos Quatro Braços',
      input: 'carga+physical',
      type: 'heavyBlow',
      description: 'Avança e desce as quatro garras de uma vez: um golpe pesado que joga a presa longe. Aguenta um golpe na preparação.',
      energyCost: 25,
      cooldown: 9,
      anim: 'db_rend',
      duration: 0.75,
      armorFrom: 0.05,
      impact: 0.34,
      step: 3.5,
      stepTime: 0.2,
      track: true,
      range: 2.8,
      arc: 160,
      damage: 64,
      knockback: 5,
      whiffRecovery: 0.35,
      element: 'sangue',
      hitSound: 'clawHit',
      color: BLOOD,
    },
    {
      // △ + × SALTO (o do chefe quando a presa foge): o bote do Raziel
      ...abil(raziel, 'boteRetalhador'),
      id: 'saltoQuibungo',
      name: 'Salto do Quibungo',
      input: 'carga+jump',
      description: 'Agacha o corpo enorme e salta sobre a presa, descendo com as garras. Quem esquiva ainda toma metade. Aguenta um golpe na preparação.',
      element: 'sangue',
      color: BLOOD,
    },
    {
      // △ + L2 PANCADA QUE RACHA O CHÃO (o "slam" do chefe): a onda em volta derruba
      id: 'pancadaQuibungo',
      name: 'Racha-Chão',
      input: 'carga+dodge',
      type: 'stompQuake',
      description: 'Bate os quatro braços no chão: a terra racha e a onda derruba quem estiver perto.',
      energyCost: 22,
      cooldown: 11,
      duration: 0.8,
      impact: 0.45,
      radius: 3.6,
      damage: 40,
      armorMax: 60,
      color: DUST,
    },
    {
      // R2 + △ O URRO (o do chefe com metade da vida): mais rápido e mais forte por um tempo
      id: 'urroQuibungo',
      name: 'Urro do Sertão',
      input: 'block+carga',
      type: 'selfBuff',
      buffType: 'urroQuibungo',
      label: 'URRO',
      anim: 'taunt_roar',
      description: 'Urra com a língua de fora: por 6 s os golpes físicos ficam 20% mais fortes e ele anda 15% mais rápido.',
      energyCost: 20,
      cooldown: 16,
      duration: 6,
      damageMult: 1.2,
      speedMult: 1.15,
      affects: ['melee'],
      color: BLOOD,
    },
  ],

  // BANQUETE DA BOCARRA (PROPOSTA): avança, as quatro garras rasgam, a língua das costas enrola a presa e a joga na
  // bocarra; termina arremessando com a pancada dos quatro braços
  special: {
    name: 'Banquete da Bocarra',
    banner: 'A bocarra das costas também tem fome.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLOOD,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'taunt_roar', time: 0.55 },
    dash: { speed: 18, maxTime: 0.55, contact: 2.2 },
    hits: [
      { t: 0.6, anim: 'db_claw_r', dur: 0.26, share: 0.1, fx: { kind: 'claw', color: BLOOD }, sound: 'clawHit' },
      { t: 0.86, anim: 'db_claw_l', dur: 0.26, share: 0.1, fx: { kind: 'claw', flip: true, color: BLOOD }, sound: 'clawHit' },
      { t: 1.12, anim: 'db_claw_r', dur: 0.26, share: 0.1, fx: { kind: 'claw', color: BONE }, sound: 'clawHit' },
      { t: 1.38, anim: 'db_claw_l', dur: 0.26, share: 0.1, fx: { kind: 'claw', flip: true, color: BONE }, sound: 'clawHit', call: 'QUATRO BRAÇOS' },
      { t: 1.8, anim: 'raziel_feast', dur: 0.5, share: 0.18, fx: { kind: 'punch', color: TONGUE }, sound: 'clawHit', victimAnim: 'stun', drain: 0.5, bleed: { dps: 5, duration: 2.5 } },
      { t: 2.45, anim: 'db_rend', dur: 0.55, share: 0.42, fx: { kind: 'cross', big: true, color: BLOOD, color2: BONE }, sound: 'slashFinal', final: true, call: 'BANQUETE' },
    ],
    bannerAt: 0.2,
    length: 3.4,
    endReaction: { knockback: 6, lowLaunch: true },
  },

  // A FÚRIA DO SERTÃO (o URRO do chefe com metade da vida: fica mais rápido e mais bravo)
  awakening: {
    name: 'Fúria do Sertão',
    banner: 'Fúria do Sertão',
    type: 'awakenMode',
    ranged: { ...raziel.ranged, name: 'Investida do Gigante', color: BLOOD, element: 'sangue' },
    mult: 1.2, speedMult: 1.2, cdRate: 1.4, aura: 'smoke', color: BLOOD, heal: 0.08,
  },

  passives: [
    // PELE GROSSA (o gigante de carne): empurrões e golpes de raspão pegam menos
    { type: 'thickSkin', knockback: 0.7, chip: 0.75, guard: 0.8 },
    // a fome de Sangue: cada garra devolve um pouco de vida
    { type: 'lifesteal', ratio: 0.04 },
    { type: 'elementalAffinity', element: 'sangue', mult: 1.1, resist: 0.85 },
  ],
};
