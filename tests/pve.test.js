import test from 'node:test';
import assert from 'node:assert/strict';
import { computeMods, rollChoices, gainXp, xpForLevel, activeSynergies, UPGRADES, TREE } from '../src/pve/upgrades.js';
import { loadPve, savePve, clearPve, emptyData, profileOf, buyRank, refundTree, rewardBoss, endAttemptByDeath, newAttempt, PVE_KEY } from '../src/pve/save.js';
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
