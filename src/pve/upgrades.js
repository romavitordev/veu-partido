// OUTRO LADO — melhorias (TODO §6 e §7).
//  TEMPORÁRIAS: escolhidas a cada nível dentro da tentativa; somem quando a tentativa acaba em morte.
//  SINERGIAS: duas temporárias juntas ligam um efeito a mais (aparecem no HUD).
//  PERMANENTES: a árvore de cada personagem (pontos ganhos ao derrotar chefes), salva entre as tentativas.
// Tudo vira um objeto `mods` (computeMods) que o lutador lê em poucos pontos: dano feito e recebido (damage.js), custo e
// regeneração de Sanidade (Fighter), vida máxima, velocidade, esquivas e efeitos ao causar dano / ao derrotar.

// max: quantas vezes a mesma melhoria pode ser escolhida na tentativa
export const UPGRADES = [
  { id: 'vigor', name: 'Vigor', icon: '♥', max: 3, desc: '+15% de vida máxima (e cura o que ganhou).', apply: (m) => { m.hpMult += 0.15; } },
  { id: 'furia', name: 'Fúria', icon: '✊', max: 3, desc: '+12% de dano dos golpes físicos.', apply: (m) => { m.dealt.melee += 0.12; } },
  { id: 'foco', name: 'Foco', icon: '✦', max: 3, desc: '+14% de dano das habilidades e do especial.', apply: (m) => { m.dealt.ability += 0.14; m.dealt.special += 0.14; } },
  { id: 'mira', name: 'Mira', icon: '◎', max: 3, desc: '+15% de dano dos tiros e arremessos.', apply: (m) => { m.dealt.ranged += 0.15; } },
  { id: 'couraca', name: 'Couraça', icon: '⛨', max: 3, desc: '−9% de dano recebido.', apply: (m) => { m.taken *= 0.91; } },
  { id: 'calma', name: 'Calma', icon: '☾', max: 2, desc: 'Habilidades custam 12% menos Sanidade.', apply: (m) => { m.costMult *= 0.88; } },
  { id: 'lucidez', name: 'Lucidez', icon: '◐', max: 2, desc: 'A Sanidade volta 25% mais rápido.', apply: (m) => { m.regenMult += 0.25; } },
  { id: 'sanguessuga', name: 'Sanguessuga', icon: '⚕', max: 2, desc: 'Cura 4% do dano físico que causar.', apply: (m) => { m.lifesteal += 0.04; } },
  { id: 'cacador', name: 'Caçador', icon: '✚', max: 2, desc: 'Derrotar um inimigo cura 6% da vida.', apply: (m) => { m.killHeal += 0.06; } },
  { id: 'agilidade', name: 'Agilidade', icon: '➶', max: 2, desc: '+8% de velocidade de movimento.', apply: (m) => { m.speedMult += 0.08; } },
  // HABILIDADES DO BAÚ (pedido do dono, 2026-11-06): só saem de BAÚ (nunca nas cartas de nível). PROPOSTA: os efeitos e
  // os números. pulse/thorns/crit/secondWind são lidos em Dungeon.js (modsFor e o laço) e em combat/damage.js
  { id: 'pulsoMedo', chest: true, name: 'Pulso de Medo', icon: '◉', max: 3, desc: 'A cada 4,5 s uma onda de Medo sai de você e machuca quem estiver a 3 m (+ dano por nível).', apply: (m) => { m.pulse += 1; } },
  { id: 'espinhos', chest: true, name: 'Pele de Espinhos', icon: '✷', max: 3, desc: 'Devolve 15% do dano corpo a corpo que você recebe a quem bateu (+10% por nível).', apply: (m) => { m.thorns += m.thorns ? 0.1 : 0.15; } },
  { id: 'certeiro', chest: true, name: 'Golpe Certeiro', icon: '✧', max: 3, desc: '10% de chance de o golpe causar o dobro do dano (+6% por nível).', apply: (m) => { m.crit += m.crit ? 0.06 : 0.1; } },
  { id: 'folego', chest: true, name: 'Segundo Fôlego', icon: '✝', max: 1, desc: 'Uma vez por tentativa: o golpe que ia te derrubar te deixa com 30% da vida.', apply: (m) => { m.secondWind = true; } },
];

// duas melhorias juntas: o efeito extra (needs: ids que precisam estar na build)
export const SYNERGIES = [
  { id: 'ritualFurioso', name: 'Ritual Furioso', needs: ['furia', 'foco'], desc: '+10% de dano das habilidades.', apply: (m) => { m.dealt.ability += 0.1; } },
  { id: 'carneDura', name: 'Carne Dura', needs: ['couraca', 'vigor'], desc: 'Regenera 0,6% da vida por segundo fora de combo.', apply: (m) => { m.regenHp += 0.006; } },
  { id: 'sedeDeSangue', name: 'Sede de Sangue', needs: ['sanguessuga', 'furia'], desc: 'O roubo de vida dobra.', apply: (m) => { m.lifesteal *= 2; } },
  { id: 'mente', name: 'Mente Blindada', needs: ['calma', 'lucidez'], desc: 'O Drenar Energia tira metade.', apply: (m) => { m.drainTaken *= 0.5; } },
];

// ÁRVORE PERMANENTE (TODO §7.3): por personagem, 5 graus cada, 1 ponto por grau
export const TREE = [
  { id: 'vida', name: 'Vida', icon: '♥', ranks: 5, per: 0.05, desc: '+5% de vida máxima por grau.', apply: (m, r) => { m.hpMult += 0.05 * r; } },
  { id: 'dano', name: 'Dano', icon: '✊', ranks: 5, per: 0.04, desc: '+4% de dano por grau.', apply: (m, r) => { for (const k in m.dealt) m.dealt[k] += 0.04 * r; } },
  { id: 'defesa', name: 'Defesa', icon: '⛨', ranks: 5, per: 0.04, desc: '−4% de dano recebido por grau.', apply: (m, r) => { m.taken *= 1 - 0.04 * r; } },
  { id: 'sanidade', name: 'Sanidade', icon: '✦', ranks: 5, per: 0.05, desc: 'Habilidades 5% mais baratas por grau.', apply: (m, r) => { m.costMult *= 1 - 0.05 * r; } },
  { id: 'velocidade', name: 'Velocidade', icon: '➶', ranks: 3, per: 0.03, desc: '+3% de velocidade de movimento por grau.', apply: (m, r) => { m.speedMult += 0.03 * r; } },
  { id: 'recuperacao', name: 'Recuperação', icon: '✚', ranks: 3, per: 0.001, desc: 'Regenera 0,1% da vida por segundo por grau.', apply: (m, r) => { m.regenHp += 0.001 * r; } },
  { id: 'crescimento', name: 'Crescimento', icon: '▲', ranks: 5, per: 0.06, desc: '+6% de experiência por grau.', apply: (m, r) => { m.xpMult += 0.06 * r; } },
  { id: 'sorte', name: 'Sorte', icon: '♣', ranks: 3, per: 0.1, desc: '+10% de chance de os inimigos deixarem cura, por grau.', apply: (m, r) => { m.dropMult += 0.1 * r; } },
];
export const treeCost = (rank) => 1; // eslint-disable-line no-unused-vars -- 1 ponto por grau (pode crescer depois)

export function baseMods() {
  return {
    hpMult: 1,
    dealt: { melee: 1, ranged: 1, ability: 1, special: 1 },
    taken: 1,
    costMult: 1,
    regenMult: 1,
    lifesteal: 0,
    killHeal: 0,
    speedMult: 1,
    regenHp: 0,
    drainTaken: 1,
    xpMult: 1,
    dropMult: 1,
    pulse: 0,
    thorns: 0,
    crit: 0,
    secondWind: false,
  };
}

const byId = (list, id) => list.find((x) => x.id === id);

// picks: ids escolhidos na tentativa (com repetição); tree: { vida: 2, ... }
export function activeSynergies(picks) {
  const has = new Set(picks);
  return SYNERGIES.filter((s) => s.needs.every((n) => has.has(n)));
}

export function computeMods(picks = [], tree = {}) {
  const m = baseMods();
  for (const n of TREE) if (tree[n.id]) n.apply(m, Math.min(n.ranks, tree[n.id]));
  for (const id of picks) { const u = byId(UPGRADES, id); if (u) u.apply(m); }
  for (const s of activeSynergies(picks)) s.apply(m);
  return m;
}

export function countOf(picks, id) {
  return picks.filter((x) => x === id).length;
}

// LIMITE de habilidades diferentes por tentativa (pedido do dono, 2026-11-06): depois de 6, as cartas e os baús só
// sobem de nível as que você já tem; com todas no máximo, o baú dá MOEDAS ou VIDA (você escolhe). PROPOSTA: o número 6.
export const MAX_KINDS = 6;
export const kindsOf = (picks) => new Set(picks).size;
const canAdd = (picks, u) => countOf(picks, u.id) > 0 || kindsOf(picks) < MAX_KINDS;

// 3 opções sorteadas entre as que ainda não chegaram ao máximo (rng: () => [0,1)); as do baú não entram nas cartas
export function rollChoices(picks, rng = Math.random, n = 3) {
  const pool = UPGRADES.filter((u) => !u.chest && countOf(picks, u.id) < u.max && canAdd(picks, u));
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
}

// o BAÚ (como no Vampire Survivors): sobe de grau melhorias que o jogador JÁ tem e, enquanto houver vaga no limite
// (MAX_KINDS), pode trazer uma HABILIDADE NOVA do baú (u.chest). Ids sem repetir, só abaixo do máximo. Devolve [] quando
// não há mais nada: aí o baú oferece moedas ou vida (Dungeon.openChest)
export function chestUpgrades(picks, rng = Math.random, n = 1) {
  const have = [...picks];
  const out = [];
  while (out.length < n) {
    const pool = UPGRADES.filter((u) => !out.includes(u.id) && countOf(have, u.id) < u.max
      && (countOf(have, u.id) > 0 || (u.chest && kindsOf(have) < MAX_KINDS))).map((u) => u.id);
    if (!pool.length) break;
    const id = pool[Math.floor(rng() * pool.length)];
    out.push(id);
    have.push(id);
  }
  return out;
}

// as duas recompensas quando não há mais o que subir (o jogador escolhe uma)
export function rewardChoices(coins, healFrac) {
  return [
    { id: 'reward:coins', reward: true, name: 'Moedas', icon: '●', desc: `+${coins} moedas (compram personagens).`, amount: coins },
    { id: 'reward:heal', reward: true, name: 'Vida', icon: '♥', desc: `Recupera ${Math.round(healFrac * 100)}% da vida.`, amount: healFrac },
  ];
}

// quantos itens o baú dá (pedido do dono, 2026-11-06): 1 é o comum, 2 de vez em quando, 3 é meio raro.
// luck (o baú da sala trancada, 0..1) puxa para cima. Odds: PROPOSTA
export const CHEST_ODDS = { two: 0.24, three: 0.07 };
export function chestCount(rng = Math.random, luck = 0) {
  const r = rng();
  const three = CHEST_ODDS.three * (1 + 2 * luck);
  const two = CHEST_ODDS.two * (1 + luck);
  return r < three ? 3 : r < three + two ? 2 : 1;
}

// experiência para passar do nível `lv` (1 → 2 custa 60, depois cresce)
export function xpForLevel(lv) {
  return Math.round(60 + (lv - 1) * 45);
}

// soma xp; devolve quantos níveis subiu
export function gainXp(run, amount) {
  run.xp += amount;
  let ups = 0;
  while (run.xp >= xpForLevel(run.level)) {
    run.xp -= xpForLevel(run.level);
    run.level++;
    ups++;
  }
  return ups;
}

export function getUpgrade(id) { return byId(UPGRADES, id); }
export function getTreeNode(id) { return byId(TREE, id); }
