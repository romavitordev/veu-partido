// O KERBEROS — a TRANSFORMAÇÃO do Quibungo jogável. Dono, 2026-11-21: "E a transformação dele ser o kerberus, com uma
// cutscene como a do outro lado". Não aparece na seleção: o Quibungo vira esta forma na Transformação (Barra cheia +
// vida baixa, segurando △) e fica assim até o fim do round. A cena ('kerberos' em combat/specials/maskTransform.js) é
// a do fim de Hexatombe, a mesma do Outro Lado (pve/kerberosInferno.js): o céu fica vermelho, chove sangue, o Quibungo
// DERRETE numa gosma cercada de ossos e o Kerberos sobe dela.
// Cânone (wiki "Kerberos"): seis patas, cauda enorme, três cabeças (o verme dentado, a canina de sete dentes enormes e
// a insetoide de quatro quelíceras); MORDIDA, DISPARO DE ESPINHOS, ATAQUE FLEXÍVEL, DEVORAR e DERRUBAR E DEVORAR.
// PROPOSTA: os botões e todos os números. Modelo: tools/blender/char_kerberos.py (o esqueleto deitado; os clipes kb_* em
// src/anim/kerberosClips.js).
import base from '../quibungo.js';

const FLESH = 0x8a1a20;
const BLOOD = 0xb01020;
const BONE = 0xd4b48a;
const DUST = 0x9a7a50;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));
const M = base.melee;
const beast = (s, anim, name, mult = 1.15) => ({ ...s, anim, name, damage: Math.round(s.damage * mult), trail: { ...(s.trail || {}), color: BLOOD } });

export default {
  ...base,
  id: 'quibungo_kerberos',
  form: true,
  baseId: 'quibungo',
  name: 'KERBEROS',
  model: 'kerberos',
  info: {
    weapon: 'Três cabeças, seis patas, os espinhos e a cauda',
    style: 'A fera de três cabeças: morde e se cura, dispara espinhos, derruba e devora',
    identity: 'O que nasceu da gosma do Quibungo (até o fim do round)',
    tagline: 'Três bocas. Uma fome.',
  },
  // maior e mais pesado que o Quibungo (o modelo tem ~2 m de altura e 4,5 de comprimento)
  stats: { moveSpeed: 7.6, attackSpeed: 1.05, size: 1.25 }, // a área de acerto acompanha só um pouco o corpo comprido
  hpBar: { style: 'flesh' },
  anims: { idle: 'kb_idle', run: 'kb_run', charge: 'kb_charge', victory: 'kb_roar', block: 'kb_block' },
  chargeFx: { style: 'aura', color: BLOOD, smoke: FLESH },
  dodge: { style: 'default', distance: 4.6 },

  // MORDIDA: as três cabeças e as patas da frente
  melee: {
    ...M,
    strikes: M.strikes.map((s, i) => beast(s, ['kb_bite', 'kb_claw_l', 'kb_claw_r', 'kb_bite', 'kb_bite'][i] || 'kb_bite', ['Mordida', 'Pata', 'Pata', 'Três Cabeças', 'Três Cabeças'][i] || s.name)),
    up: beast(M.up, 'kb_bite', 'Mordida de baixo'),
    down: beast(M.down, 'kb_claw_r', 'Esmagar'),
    forward: beast(M.forward, 'kb_pounce', 'Investida'),
    back: beast(M.back, 'kb_claw_l', 'Patada'),
    side: beast(M.side, 'kb_tail', 'Ataque Flexível'),
    air: beast(M.air, 'kb_claw_r', 'Cair sobre a presa'),
  },

  // □ DISPARO DE ESPINHOS: as costas se eriçam e um leque de espinhos de osso voa
  ranged: {
    name: 'Disparo de Espinhos',
    type: 'projectile',
    anim: 'kb_spikes',
    origin: 'back',
    windup: 0.3,
    recovery: 0.32,
    count: 5,
    interval: 0,
    damage: 14,
    range: 15,
    speed: 30,
    radius: 0.35,
    spread: 0.5,
    knockback: 1,
    hitstun: 0.18,
    cooldown: 3.5,
    energyCost: 10,
    visual: 'bloodSpear',
    color: BONE,
    element: 'sangue',
    sound: 'swing',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      // △ + ○ DEVORAR: as três cabeças mordem juntas e o que tiram vira vida
      ...byId.rajadaQuibungo,
      id: 'devorarKerberos',
      name: 'Devorar',
      anim: 'kb_bite',
      description: 'As três cabeças avançam e mordem juntas: um golpe pesado, e boa parte do que tira volta como vida. Aguenta um golpe na preparação.',
      damage: 82,
      drain: 0.5,
      range: 3.4,
      hitSound: 'clawHit',
    },
    {
      // △ + × DERRUBAR E DEVORAR: o bote das seis patas
      ...byId.saltoQuibungo,
      id: 'boteKerberos',
      name: 'Derrubar e Devorar',
      anim: 'kb_pounce',
      description: 'Agacha as seis patas e SALTA sobre a presa, derrubando com as patas da frente e mordendo: cura um pouco. Quem esquiva ainda toma metade.',
      hop: 12,
      step: 14,
      damage: 104,
      drain: 0.25,
    },
    {
      // △ + L2 ATAQUE FLEXÍVEL: gira e a cauda varre em volta
      ...byId.pancadaQuibungo,
      id: 'caudaKerberos',
      name: 'Ataque Flexível',
      anim: 'kb_tail',
      description: 'Gira o corpo e a cauda enorme varre tudo em volta: derruba quem estiver perto.',
      radius: 4.4,
      damage: 58,
      color: BLOOD,
    },
    {
      // R2 + △ o UIVO das três cabeças (o Urro do Quibungo, mais forte)
      ...byId.urroQuibungo,
      id: 'uivoKerberos',
      name: 'Uivo das Três Cabeças',
      buffType: 'urroQuibungo',
      label: 'UIVO',
      anim: 'kb_roar',
      description: 'As três cabeças uivam juntas: por 6 s os golpes físicos ficam 25% mais fortes e ele anda 20% mais rápido.',
      damageMult: 1.25,
      speedMult: 1.2,
    },
  ],

  special: {
    ...base.special,
    name: 'Banquete das Três Cabeças',
    banner: 'Três bocas. Uma fome.',
    prepare: { anim: 'kb_roar', time: 0.55 },
    hits: [
      { t: 0.6, anim: 'kb_claw_r', dur: 0.28, share: 0.1, fx: { kind: 'claw', color: BLOOD }, sound: 'clawHit' },
      { t: 0.88, anim: 'kb_claw_l', dur: 0.28, share: 0.1, fx: { kind: 'claw', flip: true, color: BLOOD }, sound: 'clawHit' },
      { t: 1.2, anim: 'kb_bite', dur: 0.4, share: 0.14, fx: { kind: 'punch', color: BONE }, sound: 'clawHit', call: 'O VERME' },
      { t: 1.6, anim: 'kb_bite', dur: 0.4, share: 0.14, fx: { kind: 'punch', color: BONE }, sound: 'clawHit', call: 'O CÃO' },
      { t: 2.0, anim: 'kb_bite', dur: 0.4, share: 0.14, fx: { kind: 'punch', color: BONE }, sound: 'clawHit', call: 'O INSETO', victimAnim: 'stun', drain: 0.5, bleed: { dps: 5, duration: 2.5 } },
      { t: 2.55, anim: 'kb_tail', dur: 0.6, share: 0.38, fx: { kind: 'cross', big: true, color: BLOOD, color2: BONE }, sound: 'slashFinal', final: true, call: 'BANQUETE' },
    ],
  },

  // já transformado: a Barra cheia volta a ser o modo de fúria (não há outra forma)
  awakening: {
    name: 'Fúria do Kerberos',
    banner: 'Fúria do Kerberos',
    type: 'awakenMode',
    ranged: { ...base.ranged, name: 'Língua do Kerberos', anim: 'kb_bite', origin: 'chest' },
    mult: 1.2, speedMult: 1.15, cdRate: 1.4, aura: 'smoke', color: BLOOD, heal: 0.06,
  },

  passives: [
    { type: 'thickSkin', knockback: 0.6, chip: 0.7, guard: 0.75 },
    { type: 'lifesteal', ratio: 0.06 }, // DEVORAR: cada mordida devolve vida
    { type: 'elementalAffinity', element: 'sangue', mult: 1.15, resist: 0.8 },
  ],
};
