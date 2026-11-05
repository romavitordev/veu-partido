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

// 3 opções sorteadas entre as que ainda não chegaram ao máximo (rng: () => [0,1))
export function rollChoices(picks, rng = Math.random, n = 3) {
  const pool = UPGRADES.filter((u) => countOf(picks, u.id) < u.max);
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
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
