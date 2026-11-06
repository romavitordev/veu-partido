// OUTRO LADO — salvamento separado das partidas de luta (TODO §8). Uma chave só, `veu_pve_v1`, com três partes:
//   profiles  PERFIL: o progresso permanente de CADA personagem (nível do Outro Lado, pontos livres, árvore)
//   campaign  CAMPANHA: o geral (profundidade máxima, chefes derrotados, mortes, a última dungeon)
//   attempt   TENTATIVA: a corrida atual (personagem, profundidade, nível, xp, melhorias, dificuldade, dungeon) — salva
//             no começo de cada dungeon; a morte apaga (as melhorias temporárias se perdem), o resto fica.
// Apagar os dados do Outro Lado mexe só nesta chave (opções, Torre e o resto do jogo ficam).
import { TREE, treeCost } from './upgrades.js';

export const PVE_KEY = 'veu_pve_v1';
// a CÓPIA AUTOMÁTICA: o save de antes da última gravação (se o principal quebrar, o jogo volta para ela) e o save
// quebrado guardado à parte (nunca é apagado sem o jogador mandar)
export const PVE_PREV_KEY = PVE_KEY + '_prev';
export const PVE_BROKEN_KEY = PVE_KEY + '_quebrado';
export const SAVE_VERSION = 1;
export const BACKUP_KIND = 'veu-partido/outro-lado';

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

// confere e completa um save (do armazenamento ou de um backup); null se não for um save do Outro Lado desta versão
export function normalizePve(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d) || d.version !== SAVE_VERSION) return null;
  const base = emptyData();
  const profiles = d.profiles && typeof d.profiles === 'object' && !Array.isArray(d.profiles) ? d.profiles : {};
  const attempt = d.attempt && typeof d.attempt === 'object' && typeof d.attempt.charId === 'string' ? d.attempt : null;
  return {
    ...base, ...d,
    coins: Number.isFinite(d.coins) ? Math.max(0, Math.floor(d.coins)) : 0,
    unlocked: Array.isArray(d.unlocked) ? d.unlocked.filter((x) => typeof x === 'string') : [],
    campaign: { ...base.campaign, ...(d.campaign && typeof d.campaign === 'object' ? d.campaign : {}) },
    profiles,
    attempt,
  };
}

function parseRaw(raw) {
  try { return normalizePve(JSON.parse(raw)); } catch { return null; }
}

// lê com segurança: dado corrompido ou de outra versão não derruba o jogo. Se o principal quebrou, o original fica
// guardado à parte (PVE_BROKEN_KEY) e o jogo volta para a cópia automática (o save de antes da última gravação).
// O resultado diz de onde veio em `loadedFrom` ('main' | 'prev' | 'empty'), fora do que é gravado.
export function loadPve(s) {
  const st = store(s);
  let raw = null;
  try { raw = st.getItem(PVE_KEY); } catch { raw = null; }
  if (!raw) return emptyData();
  const d = parseRaw(raw);
  if (d) return d;
  let prev = null;
  try { prev = st.getItem(PVE_PREV_KEY); } catch { prev = null; }
  const back = prev ? parseRaw(prev) : null;
  // o original quebrado (ou de outra versão) fica guardado à parte: a próxima gravação substitui a chave principal
  try { if (!st.getItem(PVE_BROKEN_KEY)) st.setItem(PVE_BROKEN_KEY, raw); } catch { /* sem armazenamento */ }
  if (back) { Object.defineProperty(back, 'loadedFrom', { value: 'prev', enumerable: false }); return back; }
  const empty = emptyData();
  Object.defineProperty(empty, 'loadedFrom', { value: 'broken', enumerable: false });
  return empty;
}

export function savePve(data, s) {
  const st = store(s);
  try {
    const json = JSON.stringify(data);
    let old = null;
    try { old = st.getItem(PVE_KEY); } catch { old = null; }
    // a cópia automática: o save que estava lá (se ele estiver bom)
    if (old && old !== json && parseRaw(old)) st.setItem(PVE_PREV_KEY, old);
    st.setItem(PVE_KEY, json);
    return true;
  } catch { return false; }
}

export function clearPve(s) {
  for (const k of [PVE_KEY, PVE_PREV_KEY, PVE_BROKEN_KEY]) { try { store(s).removeItem(k); } catch { /* nada */ } }
}

// ------------------------------------------------ BACKUP (TODO §8: exportar e importar)
// o arquivo: { kind, version, exportedAt, data } — `data` é o save inteiro (perfil, campanha, tentativa, moedas)
export function exportPve(data) {
  return JSON.stringify({ kind: BACKUP_KIND, version: SAVE_VERSION, exportedAt: new Date().toISOString(), data }, null, 1);
}

// lê um arquivo de backup; erro com a explicação se não servir
export function parseBackup(text) {
  let o;
  try { o = JSON.parse(String(text || '')); } catch { throw new Error('O arquivo não é um backup do Véu Partido (não é JSON).'); }
  if (!o || o.kind !== BACKUP_KIND) throw new Error('Esse arquivo não é um backup do Outro Lado.');
  if (o.version !== SAVE_VERSION) throw new Error(`O backup é de outra versão do save (${o.version}); este jogo usa a ${SAVE_VERSION}.`);
  const d = normalizePve(o.data);
  if (!d) throw new Error('O backup está incompleto ou corrompido.');
  return { data: d, exportedAt: typeof o.exportedAt === 'string' ? o.exportedAt : null };
}

// resumo de um save para a tela (o que vai entrar ao importar)
export function describePve(d) {
  const levels = Object.values(d.profiles || {}).reduce((a, p) => a + Math.max(0, (p.level || 1) - 1), 0);
  return { coins: d.coins || 0, unlocked: (d.unlocked || []).length, bestDepth: d.campaign.bestDepth || 0, bossKills: d.campaign.bossKills || 0, levels, attempt: !!d.attempt };
}

export function profileOf(data, charId) {
  if (!data.profiles[charId]) data.profiles[charId] = emptyProfile();
  const p = data.profiles[charId];
  p.tree = p.tree || {};
  return p;
}

// o preço em MOEDAS de um grau da árvore (pedido do dono, 2026-11-06: os ups permanentes também se compram com moedas;
// o valor é PROPOSTA): sobe com o grau
export const treeCoinCost = (rank) => 45 + 30 * rank;

// comprar um grau da árvore: com PONTO se tiver; senão, com MOEDAS (false: sem os dois ou no máximo).
// O grau comprado com moedas vira um ponto gasto (devolver a árvore devolve como ponto do personagem).
export function buyRank(data, charId, nodeId) {
  const p = profileOf(data, charId);
  const node = TREE.find((n) => n.id === nodeId);
  if (!node) return false;
  const r = p.tree[nodeId] || 0;
  const cost = treeCost(r);
  if (r >= node.ranks) return false;
  if (p.points < cost) {
    const coins = treeCoinCost(r);
    if ((data.coins || 0) < coins) return false;
    data.coins -= coins;
    p.points += cost;
  }
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

// coop: o 2º jogador do coop local ({ charId, team }) — a tentativa é dos dois (as melhorias e o nível são do grupo)
export function newAttempt({ charId, team = [], difficulty = 'normal', dungeon, coop = null }) {
  return { charId, team, coop, difficulty, depth: 1, level: 1, xp: 0, picks: [], dungeon, cleared: 0, startedAt: Date.now() };
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
