import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { computeMods, rollChoices, gainXp, xpForLevel, activeSynergies, UPGRADES, TREE, chestCount, chestUpgrades, MAX_KINDS, kindsOf, rewardChoices } from '../src/pve/upgrades.js';
import { loadPve, savePve, clearPve, emptyData, profileOf, buyRank, refundTree, rewardBoss, endAttemptByDeath, newAttempt, PVE_KEY, PVE_PREV_KEY, PVE_BROKEN_KEY, exportPve, parseBackup, describePve } from '../src/pve/save.js';
import { DUNGEONS, DUNGEON_ORDER, rollRouteLength, rollExits, chestChance, pickNextDungeon, advanceAfterClear, validDungeons, isAllowed, rollHeal, depthScale, PVE_DIFFICULTIES } from '../src/pve/dungeons.js';
import { CPU_LEVELS } from '../src/ai/CpuController.js';
import { Closet, PeekingCrack } from '../src/pve/espreitador.js';

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
  assert.deepEqual(DUNGEON_ORDER, ['degolificada', 'espreitador']);
  assert.deepEqual(DUNGEON_ORDER, Object.values(DUNGEONS).sort((a, b) => a.storyOrder - b.storyOrder).map((d) => d.id));
  assert.equal(new Set(Object.values(DUNGEONS).map((d) => d.storyOrder)).size, Object.keys(DUNGEONS).length, 'cada fase futura precisa de uma posição cronológica própria');
  assert.deepEqual(validDungeons(1), ['degolificada']);
  const run = { depth: 2, difficulty: 'easy', heat: 0, played: [] };
  assert.deepEqual(advanceAfterClear(run, 'degolificada'), { dungeon: 'espreitador', looped: false });
  assert.ok(!isAllowed('espreitador', 'espreitador'));
  assert.ok(isAllowed('espreitador', 'kaiser'));
  assert.equal(pickNextDungeon({ depth: 1, previous: 'espreitador' }), 'degolificada', 'na profundidade 1 só há a fase cronologicamente inicial');
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
  // o Vigor já está no máximo; das que você não tem, só as HABILIDADES DO BAÚ (há vaga no limite)
  assert.ok(ups.includes('furia') && !ups.includes('vigor'));
  assert.ok(ups.every((id) => id === 'furia' || UPGRADES.find((u) => u.id === id).chest));
});

test('baú: habilidades novas só do baú, limite de habilidades e depois só moedas ou vida', () => {
  const chestOnly = UPGRADES.filter((u) => u.chest).map((u) => u.id);
  assert.ok(chestOnly.length >= 4);
  // as cartas de nível nunca oferecem as do baú
  for (let i = 0; i < 50; i++) assert.ok(!rollChoices([], Math.random).some((u) => u.chest));
  // limite cheio (MAX_KINDS diferentes): cartas e baú só sobem as que já tem
  const base = UPGRADES.filter((u) => !u.chest).slice(0, MAX_KINDS).map((u) => u.id);
  assert.equal(kindsOf(base), MAX_KINDS);
  for (let i = 0; i < 30; i++) {
    assert.ok(rollChoices(base, Math.random).every((u) => base.includes(u.id)));
    assert.ok(chestUpgrades(base, Math.random, 3).every((id) => base.includes(id)));
  }
  // tudo no máximo: o baú não tem o que dar -> recompensa (moedas ou vida)
  const maxed = base.flatMap((id) => Array(UPGRADES.find((u) => u.id === id).max).fill(id));
  assert.deepEqual(chestUpgrades(maxed, Math.random, 3), []);
  assert.equal(rollChoices(maxed).length, 0);
  const r = rewardChoices(30, 0.3);
  assert.deepEqual(r.map((x) => x.id), ['reward:coins', 'reward:heal']);
  // os efeitos
  const m = computeMods(['pulsoMedo', 'espinhos', 'espinhos', 'certeiro', 'folego']);
  assert.equal(m.pulse, 1);
  assert.ok(Math.abs(m.thorns - 0.25) < 1e-9);
  assert.ok(Math.abs(m.crit - 0.1) < 1e-9);
  assert.equal(m.secondWind, true);
});

test('os olhos do Espreitador somem das frestas depois da derrota', () => {
  const world = { scene: new THREE.Scene(), arena: { boxes: [] }, audio: { play() {} }, addNpc() {} };
  const closet = new Closet(world, {}, { x: 0, z: 0, face: 0 }, 0);
  const crack = new PeekingCrack(world, { x: 1, z: 0 });
  closet.warn(1);
  crack.eyes.visible = true;

  closet.hideEyes();
  crack.hideEyes();

  assert.equal(closet.eyes.visible, false);
  assert.equal(closet.warnEyes.visible, false);
  assert.equal(crack.update(1, {}, true), false);
  assert.equal(crack.eyes.visible, false);
  assert.equal(crack.t, 0, 'a fresta para de atualizar depois de desativada');
  closet.dispose();
  crack.dispose();
});

// P0 travamentos (2026-11-06): todo NPC posto no mundo precisa do hitTest dos projéteis — o barril sem ele fazia o 1º
// tiro numa sala lançar erro no World.update (a luta parava)
test('barris e caixas respondem ao hitTest dos projéteis', async () => {
  const { Breakable } = await import('../src/pve/breakables.js');
  const world = { arena: { boxes: [] }, scene: { add() {}, remove() {} }, audio: { play() {} }, fx: { burst() {} } };
  const b = new Breakable(world, null, { x: 2, z: 0, kind: 'barrel', yaw: 0 });
  assert.equal(typeof b.hitTest, 'function');
  assert.equal(b.hitTest(new THREE.Vector3(2.3, 0.5, 0), 0.1), true);
  assert.equal(b.hitTest(new THREE.Vector3(5, 0.5, 0), 0.1), false);
  assert.equal(b.hitTest(new THREE.Vector3(2, 3, 0), 0.1), false, 'por cima do barril não acerta');
});

// pedido do dono (2026-11-06): a equipe Outro Lado (Estrangeiro, Amigo Imaginário, Carniçal…) não entra no modo
test('a equipe Outro Lado fica de fora do modo Outro Lado', async () => {
  const { pveBanned, lockedMap } = await import('../src/pve/unlocks.js');
  const { ROSTER } = await import('../src/characters/index.js');
  const banned = ROSTER.filter(pveBanned).map((c) => c.id).sort();
  for (const id of ['amigo', 'carnical', 'estrangeiro']) assert.ok(banned.includes(id), id);
  assert.ok(!banned.includes('dante'));
  const locked = lockedMap(emptyData(), ROSTER);
  for (const id of banned) assert.match(locked.get(id), /Outro Lado/);
});

// ajuste por personagem só no Outro Lado (pedido do dono, 2026-11-06): ids reais, só reforço (dano ≥ 1, recebido ≤ 1),
// sem extremos, e nenhum da equipe Outro Lado (que não entra no modo)
test('PVE_CHAR_TUNE só reforça personagens permitidos no modo', async () => {
  const { PVE_CHAR_TUNE, charTune } = await import('../src/pve/dungeons.js');
  const { pveBanned } = await import('../src/pve/unlocks.js');
  const { ROSTER } = await import('../src/characters/index.js');
  for (const [id, t] of Object.entries(PVE_CHAR_TUNE)) {
    const def = ROSTER.find((c) => c.id === id);
    assert.ok(def, `${id} existe`);
    assert.ok(!pveBanned(def), `${id} não é da equipe Outro Lado`);
    assert.ok((t.dealt ?? 1) >= 1 && (t.dealt ?? 1) <= 1.6, `${id} dano`);
    assert.ok((t.taken ?? 1) <= 1 && (t.taken ?? 1) >= 0.7, `${id} recebido`);
  }
  assert.equal(charTune('joui'), null);
});

// pedido do dono (2026-11-06): a Degolificada e o Espreitador viram lutadores do modo de luta. A chefe do Outro Lado é a
// mesma criatura, mas SEM o kit (a IA da dungeon cuida de tudo) e com a vida de chefe; os jogáveis ficam fora do modo.
test('Degolificada e Espreitador: jogáveis no modo de luta, chefes iguais no Outro Lado', async () => {
  const { ROSTER } = await import('../src/characters/index.js');
  const { pveBanned } = await import('../src/pve/unlocks.js');
  const bossDeg = (await import('../src/characters/bosses/degolificada.js')).default;
  const bossEsp = (await import('../src/characters/bosses/espreitador.js')).default;
  for (const [id, boss, hp] of [['degolificada', bossDeg, 1900], ['espreitador', bossEsp, 2100]]) {
    const def = ROSTER.find((c) => c.id === id);
    assert.ok(def && !def.boss && def.special && def.awakening && def.ranged, `${id} jogável com especial, transformação e □`);
    assert.ok(def.abilities.length >= 4, `${id} com o kit de habilidades`);
    assert.ok(pveBanned(def), `${id} (equipe Outro Lado) fica fora do modo Outro Lado`);
    assert.equal(boss.boss, true);
    assert.equal(boss.abilities.length, 0, `a chefe ${id} não usa o kit (a IA da dungeon controla)`);
    assert.ok(!boss.special && !boss.awakening && !boss.ranged, `a chefe ${id} sem especial, transformação ou □`);
    assert.equal(boss.stats.maxHealth, hp);
    assert.equal(boss.model, def.model);
  }
  // a Pancada da chefe continua mais fraca que a do jogável
  assert.ok(bossEsp.melee.strikes[0].damage < ROSTER.find((c) => c.id === 'espreitador').melee.strikes[0].damage);
});
