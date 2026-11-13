// OUTRO LADO — quem pode entrar (pedidos do dono, 2026-11-05): o modo começa só com alguns dos personagens mais fracos;
// os outros são COMPRADOS com as MOEDAS que saem dos baús espalhados pelo mapa (pve/pickups.js Chest). As moedas e os
// desbloqueios ficam no save do Outro Lado (não voltam com REINICIAR CAMPANHA; só com APAGAR DADOS).
// A ordem e o preço seguem a força no cânone (PROPOSTA): primeiro gente comum dos Cinco, depois os agentes, os
// Mascarados e os Portadores, e por último as Relíquias e as entidades do Outro Lado.
export const UNLOCK_TIERS = [
  { price: 0, ids: ['chico', 'dara', 'guizo', 'lirio'] },
  { price: 60, ids: ['morato', 'xande', 'cristopher', 'balu'] },
  { price: 110, ids: ['verissimo', 'beatrice', 'carina', 'arthur', 'artemis'] }, // Artemis: comum (pedido do dono, 2026-11-12)
  { price: 170, ids: ['erin', 'aghata', 'rubens', 'dante', 'nubi', 'fernando', 'tristan', 'ivete', 'eloy'] }, // Eloy (PSIKOLERA, 2026-11-14)
  { price: 250, ids: ['joui', 'kaiser', 'kian', 'gal_sal', 'dalmo', 'aguiar', 'cristino', 'damir', 'boris', 'sabara'] }, // Sabara (Vampiros, 2026-11-14)
  { price: 350, ids: ['jae', 'kemi', 'labirinto', 'juan', 'raziel', 'arnaldo', 'ferreiro', 'celestine'] },
  { price: 500, ids: ['gaius', 'amalia', 'juan_odio', 'magistrada'] },
  { price: 700, ids: ['o_diabo', 'deus_morte', 'anfitriao'] },
];
// A EQUIPE OUTRO LADO não entra no modo (pedido do dono, 2026-11-06): o Estrangeiro, o Amigo Imaginário, o Carniçal e
// quem mais tiver a equipe 'Outro Lado' são as criaturas do outro lado — não exploram as dungeons com os agentes.
export const PVE_BANNED_TEAM = 'Outro Lado';
export function pveBanned(def) {
  return !!def && [def.origin, ...(def.teams || [])].includes(PVE_BANNED_TEAM);
}

// o PREÇO na loja (pedido do dono, 2026-11-12): pela RARIDADE (pve/economy.js) — comum, raro, épico e lendário. Os 4
// do primeiro degrau (preço 0) já vêm liberados; personagem novo fora da lista = lendário
const FREE = new Set(UNLOCK_TIERS[0].ids);
const RARITY_PRICE = { 60: 250, 110: 250, 170: 500, 250: 500, 350: 900, 500: 1600, 700: 1600 };

export function priceOf(id) {
  if (FREE.has(id)) return 0;
  const t = UNLOCK_TIERS.find((x) => x.ids.includes(id));
  return t ? RARITY_PRICE[t.price] || 900 : 1600;
}

export function isUnlocked(data, id) {
  return FREE.has(id) || (data.unlocked || []).includes(id);
}

// compra com moedas; false sem moedas suficientes (ou já liberado)
export function buyChar(data, id) {
  if (isUnlocked(data, id)) return false;
  const price = priceOf(id);
  if ((data.coins || 0) < price) return false;
  data.coins -= price;
  data.unlocked = [...(data.unlocked || []), id];
  return true;
}

// Map id → texto de como desbloquear, só dos bloqueados
export function lockedMap(data, roster) {
  const out = new Map();
  for (const c of roster) if (pveBanned(c)) out.set(c.id, 'é da equipe Outro Lado: não entra neste modo');
  for (const c of roster) if (!pveBanned(c) && !isUnlocked(data, c.id)) out.set(c.id, `custa ${priceOf(c.id)} moedas (você tem ${data.coins || 0}) · compre na LOJA ou tente a sorte no GACHA`);
  return out;
}

// o que sai de um baú (rng: () => [0,1)): moedas, vida ou experiência
export const CHEST_ODDS = { coins: 0.5, heal: 0.28, xp: 0.22 };

// os DROPS menores (pedido do dono, 2026-11-06: moedas, experiência e cura vêm das gavetas, dos barris e dos monstros —
// e mais vezes): a chance de cada coisa por fonte (o resto = nada). Os baús agora sobem as MELHORIAS (Dungeon.openChest).
export const LOOT_ODDS = {
  drawer: { coins: 0.4, xp: 0.22, heal: 0.14 },
  barrel: { coins: 0.42, xp: 0.24, heal: 0.18 },
  monster: { coins: 0.32, xp: 0.18 }, // a cura dos monstros continua em dungeons.js (drops.heal)
};
export function rollLoot(source, rng = Math.random, depth = 1, mult = 1) {
  const o = LOOT_ODDS[source];
  if (!o) return null;
  const d = 1 + 0.25 * Math.max(0, depth - 1);
  let r = rng() / Math.max(0.2, mult);
  // MOEDAS: sempre aparecem, mas POUCAS (pedido do dono, 2026-11-08: "1021 moedas em 3 fases"; antes 4–10 por drop)
  if ((r -= o.coins || 0) < 0) return { kind: 'coins', amount: Math.max(1, Math.round((1 + rng() * 2) * d)) };
  if ((r -= o.xp || 0) < 0) return { kind: 'xp', amount: Math.round((10 + rng() * 10) * d) };
  if ((r -= o.heal || 0) < 0) return { kind: 'heal', amount: 0.15 };
  return null;
}
// luck: o baú com mais sorte (a sala atrás do cadeado) — rende mais
export function rollChest(rng = Math.random, depth = 1, luck = 0) {
  const r = rng();
  const m = 1 + luck;
  if (r < CHEST_ODDS.coins) return { kind: 'coins', amount: Math.round((3 + rng() * 4) * (1 + 0.25 * Math.max(0, depth - 1)) * m) };
  if (r < CHEST_ODDS.coins + CHEST_ODDS.heal) return { kind: 'heal', amount: Math.min(0.6, 0.25 * (1 + luck * 0.6)) };
  return { kind: 'xp', amount: Math.round(30 * m) };
}
