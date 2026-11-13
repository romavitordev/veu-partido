// OUTRO LADO — a ECONOMIA (pedido do dono, 2026-11-12): só moedas do jogo, nada de dinheiro de verdade.
//  RARIDADE de cada personagem (pela força no cânone, a mesma ordem de unlocks.js UNLOCK_TIERS): comum, raro, épico e
//  lendário. Os 4 do começo (preço 0) já vêm liberados e não entram na loja.
//  LOJA (comprar direto): qualquer bloqueado, pelo preço da raridade — o caminho certo, porém mais caro.
//  GACHA: uma vitrine de 6 personagens (2 comuns, 2 raros, 1 épico, 1 lendário; antes 10 — o dono achou demais) que TROCA A CADA 4 HORAS (igual para
//  todo mundo: o sorteio usa o número da janela de 4 h como semente). Um giro custa SPIN_PRICE e sorteia a raridade pelas
//  chances; dentro da raridade, um dos personagens da vitrine. Personagem repetido devolve DUP_REFUND moedas.
//  Aos DOMINGOS o lendário sobe de 0,1% para 0,5%.
// Renda (para calibrar os preços, PROPOSTA — medir com a bateria): no Normal uma dungeon rende ~40 moedas dos drops +
// a recompensa do chefe (BOSS_BOUNTY, cresce com a profundidade e a dificuldade): ~80–100 por dungeon, ~300 numa
// tentativa de 3 dungeons. Um giro ≈ 2–2,5 dungeons; um comum ≈ 3; um lendário ≈ 20 no Normal (menos no Aniquilação).
import { UNLOCK_TIERS, priceOf } from './unlocks.js';

export const RARITIES = ['comum', 'raro', 'epico', 'lendario'];
export const RARITY_INFO = {
  comum: { label: 'Comum', color: '#a8b0b8', price: 250, slots: 2 },
  raro: { label: 'Raro', color: '#4aa8ff', price: 500, slots: 2 },
  epico: { label: 'Épico', color: '#b45cff', price: 900, slots: 1 },
  lendario: { label: 'Lendário', color: '#ffc23a', price: 1600, slots: 1 },
};
// o degrau de preço antigo → a raridade
const TIER_RARITY = { 60: 'comum', 110: 'comum', 170: 'raro', 250: 'raro', 350: 'epico', 500: 'lendario', 700: 'lendario' };

// giro mais caro e épico mais raro (pedido do dono, 2026-11-13: "muito fácil de pegar um épico"; antes 150 e 9,9%)
export const SPIN_PRICE = 200;
export const DUP_REFUND = 60;
export const SHOP_WINDOW_MS = 4 * 60 * 60 * 1000;
// chances do giro (somam 1). Domingo: o lendário pega 0,4% a mais, tirado do comum
export const SPIN_ODDS = { comum: 0.71, raro: 0.25, epico: 0.039, lendario: 0.001 };
export const SUNDAY_LEGENDARY = 0.005;

export function rarityOf(id) {
  const t = UNLOCK_TIERS.find((x) => x.ids.includes(id));
  if (!t) return 'lendario'; // personagem novo fora da lista: o degrau mais alto
  if (t.price === 0) return null; // já vem liberado
  return TIER_RARITY[t.price] || 'epico';
}

export const shopPrice = priceOf; // o mesmo preço da loja (unlocks.js), igual ao RARITY_INFO da raridade

export function spinOdds(date = new Date()) {
  if (date.getDay() !== 0) return { ...SPIN_ODDS };
  const extra = SUNDAY_LEGENDARY - SPIN_ODDS.lendario;
  return { ...SPIN_ODDS, comum: SPIN_ODDS.comum - extra, lendario: SUNDAY_LEGENDARY };
}

// gerador com semente (mulberry32) — a vitrine é a mesma em qualquer computador na mesma janela de 4 h
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const shopWindow = (now = Date.now()) => Math.floor(now / SHOP_WINDOW_MS);
export const nextRefresh = (now = Date.now()) => (shopWindow(now) + 1) * SHOP_WINDOW_MS;

// a vitrine da janela: { window, slots: [{ id, rarity }] } — ids: os personagens que podem entrar (sem a equipe Outro
// Lado e sem os do começo). Faltando gente numa raridade, a vaga fica com quem houver.
export function shopBanner(ids, now = Date.now()) {
  const w = shopWindow(now);
  const rng = seeded(w * 2654435761);
  const pools = Object.fromEntries(RARITIES.map((r) => [r, ids.filter((id) => rarityOf(id) === r)]));
  const slots = [];
  for (const r of RARITIES) {
    const pool = [...pools[r]];
    for (let i = 0; i < RARITY_INFO[r].slots && pool.length; i++) slots.push({ id: pool.splice(Math.floor(rng() * pool.length), 1)[0], rarity: r });
  }
  return { window: w, slots };
}

// um giro (sem mexer no save): a raridade pelas chances e um personagem da vitrine nessa raridade
export function rollSpin(banner, rng = Math.random, date = new Date()) {
  const odds = spinOdds(date);
  let r = rng();
  let rarity = 'comum';
  for (const k of RARITIES) { r -= odds[k]; if (r < 0) { rarity = k; break; } }
  let list = banner.slots.filter((s) => s.rarity === rarity);
  if (!list.length) list = banner.slots; // a raridade não veio na vitrine: qualquer um
  const s = list[Math.floor(rng() * list.length)];
  return { id: s.id, rarity: s.rarity };
}

// gira e aplica no save: false sem moedas; senão { id, rarity, dup, refund }
export function spin(data, banner, rng = Math.random, date = new Date()) {
  if ((data.coins || 0) < SPIN_PRICE) return false;
  data.coins -= SPIN_PRICE;
  const got = rollSpin(banner, rng, date);
  const dup = (data.unlocked || []).includes(got.id) || !rarityOf(got.id);
  if (dup) data.coins += DUP_REFUND;
  else data.unlocked = [...(data.unlocked || []), got.id];
  data.spins = (data.spins || 0) + 1;
  return { ...got, dup, refund: dup ? DUP_REFUND : 0 };
}

// RECOMPENSA DO CHEFE em moedas: cresce com a profundidade e a dificuldade (coin da dificuldade em dungeons.js)
export const BOSS_BOUNTY = 45;
export function bossBounty(depth = 1, coinMult = 1) {
  return Math.round(BOSS_BOUNTY * (1 + 0.15 * Math.max(0, depth - 1)) * coinMult);
}
