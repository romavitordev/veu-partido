import test from 'node:test';
import assert from 'node:assert/strict';
import { computeMods, rollChoices, gainXp, xpForLevel, activeSynergies, UPGRADES, TREE, chestCount, chestUpgrades } from '../src/pve/upgrades.js';
import { loadPve, savePve, clearPve, emptyData, profileOf, buyRank, refundTree, rewardBoss, endAttemptByDeath, newAttempt, PVE_KEY, PVE_PREV_KEY, PVE_BROKEN_KEY, exportPve, parseBackup, describePve } from '../src/pve/save.js';
import { DUNGEONS, rollRouteLength, rollExits, chestChance, pickNextDungeon, isAllowed, rollHeal, depthScale, PVE_DIFFICULTIES } from '../src/pve/dungeons.js';
import { CPU_LEVELS } from '../src/ai/CpuController.js';

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k), m }; };

test('melhorias: somam, as sinergias ligam com as duas peças e a árvore entra junto', () => {
  const m0 = computeMods([]);
  assert.equal(m0.hpMult, 1);
  const m = computeMods(['furia', 'foco', 'vigor'], { dano: 2 });
  assert.ok(Math.abs(m.dealt.melee - (1 + 0.12 + 0.08)) < 1e-9);
  assert.ok(Math.abs(m.dealt.ability - (1 + 0.14 + 0.1 + 0.08)) < 1e-9); // Ritual Furioso
  assert.deepEqual(activeSynergies(['furia', 'foco']).map((s) => s.id), ['ritualFurioso']);
  assert.equal(activeSynergies(['furia']).length, 0);
  const s = computeMods(['sanguessuga', 'furia']);
  assert.ok(Math.abs(s.lifesteal - 0.08) < 1e-9);
});

test('melhorias: o sorteio não repete e respeita o máximo de cada uma', () => {
  const picks = ['vigor', 'vigor', 'vigor'];
  for (let i = 0; i < 50; i++) {
    const c = rollChoices(picks, Math.random);
    assert.equal(c.length, 3);
    assert.equal(new Set(c.map((u) => u.id)).size, 3);
    assert.ok(!c.some((u) => u.id === 'vigor'));
  }
  const all = UPGRADES.flatMap((u) => Array(u.max).fill(u.id));
  assert.equal(rollChoices(all).length, 0);
});

test('experiência: sobe de nível e guarda a sobra', () => {
  const run = { level: 1, xp: 0 };
  assert.equal(gainXp(run, xpForLevel(1) - 1), 0);
  assert.equal(gainXp(run, 1 + xpForLevel(2) + 5), 2);
  assert.equal(run.level, 3);
  assert.equal(run.xp, 5);
});

test('salvamento: chave própria, perfil por personagem, a morte só apaga a tentativa', () => {
  const s = mem();
  const d = emptyData();
  d.attempt = newAttempt({ charId: 'kaiser', dungeon: 'espreitador' });
  assert.ok(rewardBoss(d, 'kaiser', 'run1:1'));
  assert.ok(!rewardBoss(d, 'kaiser', 'run1:1'), 'a mesma recompensa não vale duas vezes');
  assert.equal(profileOf(d, 'kaiser').points, 1);
  assert.equal(profileOf(d, 'kaiser').level, 2);
  assert.equal(profileOf(d, 'arthur').points, 0, 'cada personagem evolui separado');
  assert.ok(buyRank(d, 'kaiser', 'vida'));
  assert.ok(!buyRank(d, 'kaiser', 'vida'), 'sem ponto');
  savePve(d, s);
  assert.deepEqual([...s.m.keys()], [PVE_KEY]);
  const back = loadPve(s);
  assert.equal(back.profiles.kaiser.tree.vida, 1);
  endAttemptByDeath(back);
  assert.equal(back.attempt, null);
  assert.equal(back.campaign.deaths, 1);
  assert.equal(back.profiles.kaiser.tree.vida, 1, 'o permanente fica');
  refundTree(back, 'kaiser');
  assert.equal(back.profiles.kaiser.points, 1);
  clearPve(s);
  assert.equal(s.m.size, 0);
});

test('salvamento: a cópia automática salva o save quebrado e o backup vai e volta', () => {
  const s = mem();
  const d = emptyData();
  d.coins = 40;
  savePve(d, s);
  d.coins = 90;
  savePve(d, s);
  assert.equal(JSON.parse(s.getItem(PVE_PREV_KEY)).coins, 40, 'a cópia é o save de antes');
  s.setItem(PVE_KEY, '{quebrado');
  const back = loadPve(s);
  assert.equal(back.coins, 40, 'volta para a cópia');
  assert.equal(back.loadedFrom, 'prev');
  assert.equal(s.getItem(PVE_BROKEN_KEY), '{quebrado', 'o quebrado fica guardado');
  assert.ok(!JSON.stringify(back).includes('loadedFrom'), 'a origem não vai para o save');
  // backup
  d.unlocked = ['kaiser'];
  rewardBoss(d, 'kaiser', 't');
  const file = exportPve(d);
  const imp = parseBackup(file);
  assert.equal(imp.data.coins, 90);
  assert.deepEqual(imp.data.unlocked, ['kaiser']);
  assert.equal(describePve(imp.data).levels, 1);
  assert.throws(() => parseBackup('{x'), /não é JSON/);
  assert.throws(() => parseBackup(JSON.stringify({ kind: 'outro' })), /não é um backup/);
  const odd = parseBackup(JSON.stringify({ kind: 'veu-partido/outro-lado', version: 1, data: { version: 1, profiles: [], campaign: 3, coins: -5 } })).data;
  assert.deepEqual(odd.profiles, {}, 'perfis estranhos viram vazio');
  assert.equal(odd.coins, 0);
  assert.equal(odd.campaign.bestDepth, 0);
  assert.throws(() => parseBackup(JSON.stringify({ kind: 'veu-partido/outro-lado', version: 1, data: { version: 2 } })), /incompleto/);
  clearPve(s);
  assert.equal(s.m.size, 0, 'apagar leva as cópias junto');
});

test('salvamento: dado quebrado ou de outra versão não derruba', () => {
  const s = mem();
  s.setItem(PVE_KEY, '{quebrado');
  assert.deepEqual(loadPve(s), emptyData());
  s.setItem(PVE_KEY, JSON.stringify({ version: 999 }));
  assert.deepEqual(loadPve(s), emptyData());
});

test('dungeons: o chefe fica fora da seleção, o sorteio evita repetir e a profundidade escala', () => {
  assert.ok(!isAllowed('espreitador', 'espreitador'));
  assert.ok(isAllowed('espreitador', 'kaiser'));
  assert.equal(pickNextDungeon({ depth: 1, previous: 'espreitador' }), 'espreitador', 'com uma só, repete');
  assert.equal(depthScale(1), 1);
  assert.ok(depthScale(3) > depthScale(2));
  assert.equal(rollHeal('espreitador', () => 0.1), DUNGEONS.espreitador.drops.heal.amount);
  assert.equal(rollHeal('espreitador', () => 0.99), 0);
  for (const d of Object.values(PVE_DIFFICULTIES)) { assert.ok(CPU_LEVELS[d.cpu], d.cpu); assert.ok(CPU_LEVELS[d.minion], d.minion); }
  const D = DUNGEONS.espreitador;
  assert.equal(D.modules[D.start].kind, 'start');
  assert.equal(D.modules[D.bossModule].kind, 'boss');
  // rotas: tamanho variável, portas com 2 a 4 monstros, a escada troca de andar, e o fim é sempre o chefe
  let seed = 7;
  const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const lens = new Set();
  for (let t = 0; t < 200; t++) {
    const total = rollRouteLength(D, 1, rng);
    lens.add(total);
    assert.ok(total >= D.route.rooms[0] && total <= D.route.rooms[1]);
    let cur = D.start;
    const visited = [cur];
    for (let step = 0; step <= total; step++) {
      const exits = rollExits(D, cur, { step, total, visited, rng });
      assert.ok(exits.length >= 1, `${cur} sem saída`);
      if (step === total) { assert.equal(exits.length, 1); assert.equal(exits[0].to, D.bossModule); break; }
      assert.ok(exits.some((e) => e.kind === 'fight'), 'pelo menos uma luta');
      for (const e of exits) {
        assert.ok(D.modules[cur].exits[e.slot], e.slot);
        assert.notEqual(e.to, cur);
        if (e.kind === 'fight') assert.ok(e.count >= 2 && e.count <= 4);
        if (D.modules[cur].exits[e.slot].stairs) assert.notEqual(D.modules[e.to].floor, D.modules[cur].floor);
      }
      cur = exits[Math.floor(rng() * exits.length)].to;
      visited.push(cur);
    }
  }
  assert.ok(lens.size > 1, 'o número de salas varia');
  assert.ok(chestChance(D, 'fight', 4) > chestChance(D, 'fight', 2));
  assert.ok(TREE.every((n) => n.ranks > 0));
});

test('baú: 1 item é o comum, 3 é raro; sobe só melhorias que você já tem', () => {
  let s = 1;
  const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const n = { 1: 0, 2: 0, 3: 0 };
  for (let i = 0; i < 5000; i++) n[chestCount(rng)]++;
  assert.ok(n[1] > n[2] && n[2] > n[3] && n[3] > 0);
  assert.ok(n[3] / 5000 < 0.12);
  // a sorte (sala trancada) puxa para cima
  const lucky = { 1: 0, 2: 0, 3: 0 };
  for (let i = 0; i < 5000; i++) lucky[chestCount(rng, 1)]++;
  assert.ok(lucky[3] > n[3]);
  const ups = chestUpgrades(['furia', 'vigor', 'vigor', 'vigor'], rng, 3);
  assert.deepEqual(ups, ['furia']); // o Vigor já está no máximo; nada que você não tenha
});
