// EILEEN — FANTASIADA (A Vigília). A Transformação da Eileen (Barra cheia + vida baixa, segurando △) e também uma VERSÃO
// na seleção. O título dela no cânone ainda é "?" (TODO, 2026-11-21): não inventado — no jogo, só "Fantasiada".
// Visual (a fantasia do Samhain): o SACO costurado com os olhos e os dentes, os GALHOS saindo da cabeça e o capuz preto
// com a capa esfarrapada — o mesmo modelo com as peças da fantasia ligadas (vigiliaProps.js → addEileenFantasiaProps).
// Cânone (ep. 3): "Eileen se protegendo com o ESCUDO" da Vigília — o escudo no braço esquerdo, defesa mais firme.
// Kit (PROPOSTA): a ESPADA DA VIGÍLIA (dono, 2026-11-28); o POTE DE ABELHAS PEGANDO FOGO (dono, 2026-11-28: "o pote de abelhas pegando fogo
// na versão transformada" — picadas, queimadura, lento e tonto); o Rolo da Foice vira o GOLPE DE ESCUDO.
import base from '../eileen.js';

const BEE = 0xf2c230;
const FIRE = 0xff7a2a;
const VSTEEL = 0xd8dce0;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));
const jar = byId.abelhas;


// os golpes de lâmina viram golpes da ESPADA: o nome, um pouco mais de dano e de alcance, o aço claro no rastro
const toSword = (mult) => (s) => {
  if (!s || s.hitSound !== 'bladeHit') return s && { ...s, damage: Math.round(s.damage * mult) };
  return { ...s, name: s.name.replace(/Faca|Foice/, 'Espada'), damage: Math.round(s.damage * mult), range: Math.round((s.range + 0.3) * 100) / 100, trail: s.trail && { ...s.trail, color: VSTEEL } };
};
const swordMelee = (m, name, mult) => {
  const f = toSword(mult);
  const out = { ...m, name, strikes: m.strikes.map(f) };
  for (const k of ['up', 'down', 'forward', 'back', 'side', 'air']) if (m[k]) out[k] = f(m[k]);
  return out;
};

export default {
  ...base,
  id: 'eileen_fantasia',
  form: true,
  baseId: 'eileen',
  name: 'EILEEN — FANTASIADA',
  model: 'eileen_fantasia',
  info: {
    ...base.info,
    weapon: 'A Espada e o Escudo da Vigília, a funda e o pote de abelhas em chamas',
    style: 'A fantasia do Samhain: o escudo segura, a Espada da Vigília alcança mais e o pote de abelhas vai pegando fogo',
    identity: 'Fantasiada para o Samhain (até o fim do round)',
    tagline: 'No Samhain, vivos e mortos são iguais.',
  },
  stats: { ...base.stats, maxHealth: 1600 },
  chargeFx: { style: 'aura', color: FIRE, smoke: 0x1a1410 },
  // (dono, 2026-11-28: "na forma transformada eileen e zuri usam a espada da vigília")
  melee: swordMelee(base.melee, 'Espada e Escudo da Vigília', 1.1),
  abilities: [
    {
      // △ + □ POTE DE ABELHAS EM CHAMAS: o pano da tampa pegando fogo — o enxame furioso e o fogo que fica
      ...jar,
      name: 'Pote de Abelhas em Chamas',
      description: 'Joga o pote de abelhas pegando fogo: o chão fica em chamas onde ele estoura e o enxame persegue o adversário — picadas e QUEIMANDO, LENTO e TONTO no começo.',
      projectile: {
        ...jar.projectile,
        name: 'Pote de Abelhas em Chamas',
        big: true,
        lit: true,
        explode: { ...jar.projectile.explode, damage: 34, burn: { dps: 9, duration: 3 }, bees: { dps: 10, duration: 5, slow: 0.65, dizzy: 1.1 }, fireZone: { radius: 2, life: 5, dps: 12 } },
      },
    },
    {
      // △ + ○ GOLPE DE ESCUDO (cânone: o escudo da Vigília; PROPOSTA o golpe): avança com o escudo na frente
      id: 'golpeEscudo',
      name: 'Golpe de Escudo',
      input: 'carga+physical',
      type: 'dashStrike',
      description: 'Avança com o Escudo da Vigília na frente: quebra a defesa e derruba.',
      energyCost: 18,
      cooldown: 9,
      anim: 'shoulder_charge',
      windup: 0.2,
      distance: 7,
      speed: 20,
      recovery: 0.4,
      range: 2.4,
      damage: 46,
      knockback: 4,
      launch: true,
      guardCrush: 26,
      hitSound: 'heavyPunch',
      color: BEE,
    },
    byId.dedicada,
    byId.fumaca,
  ],
  // A Colmeia com o pote em chamas: o enxame deixa o alvo queimando também
  special: { ...base.special, color: FIRE, burn: { dps: 9, duration: 3 } },
  awakening: null,
  // o escudo: aguenta melhor na defesa (Casca Grossa)
  passives: [...base.passives, { type: 'thickSkin', knockback: 0.75, chip: 0.6, guard: 0.7 }],
};
