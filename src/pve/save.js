// OUTRO LADO — salvamento separado das partidas de luta (TODO §8). Uma chave só, `veu_pve_v1`, com três partes:
//   profiles  PERFIL: o progresso permanente de CADA personagem (nível do Outro Lado, pontos livres, árvore)
//   campaign  CAMPANHA: o geral (profundidade máxima, chefes derrotados, mortes, a última dungeon)
//   attempt   TENTATIVA: a corrida atual (personagem, profundidade, nível, xp, melhorias, dificuldade, dungeon) — salva
//             no começo de cada dungeon; a morte apaga (as melhorias temporárias se perdem), o resto fica.
// Apagar os dados do Outro Lado mexe só nesta chave (opções, Torre e o resto do jogo ficam).
import { TREE, treeCost } from './upgrades.js';

export const PVE_KEY = 'veu_pve_v1';
export const SAVE_VERSION = 1;

const memory = new Map();
const fallback = { getItem: (k) => (memory.has(k) ? memory.get(k) : null), setItem: (k, v) => memory.set(k, String(v)), removeItem: (k) => memory.delete(k) };
function store(s) {
  if (s) return s;
  try { if (typeof localStorage !== 'undefined') return localStorage; } catch { /* sem armazenamento */ }
  return fallback;
}

export function emptyData() {
  // coins/unlocked: as MOEDAS dos baús e os personagens comprados com elas (pve/unlocks.js)
  return { version: SAVE_VERSION, profiles: {}, coins: 0, unlocked: [], campaign: { bestDepth: 0, bossKills: 0, deaths: 0, runs: 0, lastDungeon: null, bestTimes: {} }, attempt: null };
}

export function emptyProfile() {
  return { level: 1, points: 0, spent: 0, tree: {}, bossKills: 0 };
}

// lê com segurança: dado corrompido ou de outra versão não derruba o jogo (volta ao vazio, sem apagar a chave)
export function loadPve(s) {
  let raw = null;
  try { raw = store(s).getItem(PVE_KEY); } catch { raw = null; }
  if (!raw) return emptyData();
  try {
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object' || d.version !== SAVE_VERSION) return emptyData();
    const base = emptyData();
    return { ...base, ...d, coins: Number.isFinite(d.coins) ? Math.max(0, d.coins) : 0, unlocked: Array.isArray(d.unlocked) ? d.unlocked : [], campaign: { ...base.campaign, ...(d.campaign || {}) }, profiles: d.profiles && typeof d.profiles === 'object' ? d.profiles : {} };
  } catch {
    return emptyData();
  }
}

export function savePve(data, s) {
  try { store(s).setItem(PVE_KEY, JSON.stringify(data)); return true; } catch { return false; }
}

export function clearPve(s) {
  try { store(s).removeItem(PVE_KEY); } catch { /* nada */ }
}

export function profileOf(data, charId) {
  if (!data.profiles[charId]) data.profiles[charId] = emptyProfile();
  const p = data.profiles[charId];
  p.tree = p.tree || {};
  return p;
}

// gastar 1 ponto num grau da árvore (false: sem ponto ou no máximo)
export function buyRank(data, charId, nodeId) {
  const p = profileOf(data, charId);
  const node = TREE.find((n) => n.id === nodeId);
  if (!node) return false;
  const r = p.tree[nodeId] || 0;
  const cost = treeCost(r);
  if (r >= node.ranks || p.points < cost) return false;
  p.points -= cost;
  p.spent += cost;
  p.tree[nodeId] = r + 1;
  return true;
}

// devolve os pontos gastos (refazer a árvore)
export function refundTree(data, charId) {
  const p = profileOf(data, charId);
  p.points += p.spent;
  p.spent = 0;
  p.tree = {};
}

export function newAttempt({ charId, difficulty = 'normal', dungeon }) {
  return { charId, difficulty, depth: 1, level: 1, xp: 0, picks: [], dungeon, cleared: 0, startedAt: Date.now() };
}

// chefe derrotado: +1 nível permanente e +1 ponto para o personagem (TODO §3.0: "a cada chefe derrotado, o personagem
// sobe um pouco de nível"); a recompensa é dada UMA vez por dungeon (o `token` impede duplicar ao recarregar)
export function rewardBoss(data, charId, token) {
  const p = profileOf(data, charId);
  p.rewarded = p.rewarded || [];
  if (token && p.rewarded.includes(token)) return false;
  if (token) { p.rewarded.push(token); if (p.rewarded.length > 20) p.rewarded.shift(); }
  p.level += 1;
  p.points += 1;
  p.bossKills += 1;
  data.campaign.bossKills += 1;
  return true;
}

// a morte: a tentativa acaba; a campanha e o perfil ficam
export function endAttemptByDeath(data) {
  data.campaign.deaths += 1;
  data.attempt = null;
}
