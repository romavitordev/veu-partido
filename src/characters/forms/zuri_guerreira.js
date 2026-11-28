// ZURI — GUERREIRA DA VIGÍLIA (A Vigília). A Transformação da Zuri (Barra cheia + vida baixa, segurando △) e também uma
// VERSÃO na seleção. O título "Guerreira da Vigília" é do dono (TODO, 2026-11-21).
// Visual (a fantasia do Samhain): o CRÂNIO DE CERVO com a galhada, o musgo e a pintura vermelha, o capuz com o cachecol e a
// capa oliva esfarrapada — o mesmo modelo da Zuri com as peças da fantasia ligadas (vigiliaProps.js → addZuriGuerreiraProps).
// Kit (PROPOSTA): a FACA DA VIGÍLIA (o arsenal sob a Árvore; pedido do dono 2026-11-28: as armas da Vigília nas formas
// transformadas), as curas rendem mais e o Elixir vira a INVESTIDA DO CERVO (a galhada baixada).
import base from '../zuri.js';

const HONEY = 0xe0a83a;
const VSTEEL = 0xd8dce0;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));


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
  id: 'zuri_guerreira',
  form: true,
  baseId: 'zuri',
  name: 'ZURI — GUERREIRA DA VIGÍLIA',
  model: 'zuri_guerreira',
  info: {
    ...base.info,
    weapon: 'A Espada da Vigília, as ervas e a galhada do crânio de cervo',
    style: 'A fantasia do Samhain: a Espada da Vigília alcança mais longe, as ervas curam mais e a galhada abre caminho',
    identity: 'Guerreira da Vigília (até o fim do round)',
    tagline: 'No Samhain, vivos e mortos são iguais.',
  },
  stats: { ...base.stats, maxHealth: 1600, moveSpeed: 8.0 },
  chargeFx: { style: 'aura', color: HONEY, smoke: 0x2a2416 },
  // (dono, 2026-11-28: "na forma transformada eileen e zuri usam a espada da vigília")
  melee: swordMelee(base.melee, 'Espada da Vigília', 1.12),
  abilities: [
    byId.analise,
    { ...byId.pomadaMel, heal: 130 },
    byId.tonico,
    {
      // △ + L2 INVESTIDA DO CERVO (PROPOSTA): baixa a cabeça com o crânio de cervo e dispara — a galhada derruba
      id: 'investidaCervo',
      name: 'Investida do Cervo',
      input: 'carga+dodge',
      type: 'dashStrike',
      description: 'Baixa a galhada do crânio de cervo e dispara em linha reta: quem estiver no caminho é jogado para cima.',
      energyCost: 18,
      cooldown: 9,
      anim: 'shoulder_charge',
      windup: 0.2,
      distance: 8,
      speed: 22,
      recovery: 0.4,
      range: 2.6,
      damage: 50,
      knockback: 3,
      launch: true,
      guardCrush: 18,
      hitSound: 'heavyPunch',
      color: HONEY,
    },
  ],
  awakening: null,
  passives: [{ type: 'combatReading', max: 3, per: 0.15 }, { type: 'curandeira' }],
};
