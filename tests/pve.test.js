import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { computeMods, rollChoices, gainXp, xpForLevel, activeSynergies, UPGRADES, TREE, chestCount, chestUpgrades, MAX_KIT, MAX_PASSIVE, slotsOf, rewardChoices, kitUpgrades, kitId, KIT_STEP } from '../src/pve/upgrades.js';
import cindy from '../src/characters/cindy.js';
import { loadPve, savePve, clearPve, emptyData, profileOf, buyRank, refundTree, treeCoinCost, migrateTree, rewardBoss, endAttemptByDeath, newAttempt, PVE_KEY, PVE_PREV_KEY, PVE_BROKEN_KEY, exportPve, parseBackup, describePve } from '../src/pve/save.js';
import { DUNGEONS, DUNGEON_ORDER, rollRouteLength, rollExits, chestChance, pickNextDungeon, advanceAfterClear, validDungeons, isAllowed, rollHeal, depthScale, PVE_DIFFICULTIES } from '../src/pve/dungeons.js';
import { CPU_LEVELS } from '../src/ai/CpuController.js';
import { Closet, PeekingCrack, ESPREITADOR_CFG } from '../src/pve/espreitador.js';
import { RASTROPODA, BILU } from '../src/combat/alheios.js';

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k), m }; };

test('melhorias: somam, as sinergias ligam com as duas peças e a árvore entra junto', () => {
  const m0 = computeMods([]);
  assert.equal(m0.hpMult, 1);
  const m = computeMods(['furia', 'foco', 'vigor'], { dano: 2 });
  assert.ok(Math.abs(m.dealt.melee - (1 + 0.1 + 0.06)) < 1e-9);
  assert.ok(Math.abs(m.dealt.ability - (1 + 0.1 + 0.06 + 0.06)) < 1e-9); // Ritual Furioso
  assert.deepEqual(activeSynergies(['furia', 'foco']).map((s) => s.id), ['ritualFurioso']);
  assert.equal(activeSynergies(['furia']).length, 0);
  const s = computeMods(['sanguessuga', 'furia']);
  assert.ok(Math.abs(s.lifesteal - 0.045) < 1e-9); // Sede de Sangue: ×1,5
  // o piso do dano recebido: nem empilhando Couraça e Defesa passa de −28%
  assert.ok(computeMods(['couraca', 'couraca', 'couraca'], { defesa: 5 }).taken >= 0.72 - 1e-9);
});

test('melhorias: o sorteio não repete e respeita o máximo de cada uma', () => {
  const picks = ['agilidade', 'agilidade', 'agilidade'];
  for (let i = 0; i < 50; i++) {
    const c = rollChoices(picks, Math.random, 3, cindy);
    assert.equal(c.length, 3);
    assert.equal(new Set(c.map((u) => u.id)).size, 3);
    assert.ok(!c.some((u) => u.id === 'agilidade'));
    assert.equal(c[0].kind, 'kit', 'sem nenhum golpe do kit, a primeira carta é do kit');
  }
  assert.equal(rollChoices([], Math.random, 4, cindy).length, 4); // Mais Opções
  const all = [...UPGRADES, ...kitUpgrades(cindy)].flatMap((u) => Array(u.max).fill(u.id));
  assert.equal(rollChoices(all, Math.random, 3, cindy).length, 0);
});

test('experiência: sobe de nível e guarda a sobra', () => {
  const run = { level: 1, xp: 0 };
  assert.equal(gainXp(run, xpForLevel(1) - 1), 0);
  assert.equal(gainXp(run, 1 + xpForLevel(2) + 5), 2);
  assert.equal(run.level, 3);
  assert.equal(run.xp, 5);
});

test('salvamento: chave própria, árvore GLOBAL por moedas, a morte só apaga a tentativa', () => {
  const s = mem();
  const d = emptyData();
  d.attempt = newAttempt({ charId: 'kaiser', dungeon: 'espreitador' });
  assert.ok(rewardBoss(d, 'kaiser', 'run1:1'));
  assert.ok(!rewardBoss(d, 'kaiser', 'run1:1'), 'a mesma recompensa não vale duas vezes');
  assert.equal(profileOf(d, 'kaiser').level, 2);
  assert.equal(profileOf(d, 'arthur').level, 1, 'o nível é de cada personagem');
  assert.ok(!buyRank(d, 'vida'), 'sem moedas');
  d.coins = treeCoinCost('vida', 0) + treeCoinCost('vida', 1) - 1;
  assert.ok(buyRank(d, 'vida'));
  assert.ok(!buyRank(d, 'vida'), 'o 2º grau custa mais');
  assert.equal(d.coins, treeCoinCost('vida', 1) - 1);
  savePve(d, s);
  assert.deepEqual([...s.m.keys()], [PVE_KEY]);
  const back = loadPve(s);
  assert.equal(back.tree.vida, 1);
  endAttemptByDeath(back);
  assert.equal(back.attempt, null);
  assert.equal(back.campaign.deaths, 1);
  assert.equal(back.tree.vida, 1, 'o permanente fica');
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
  assert.deepEqual(DUNGEON_ORDER, ['degolificada', 'espreitador', 'tipora', 'estrangeiro', 'samhain']);
  assert.deepEqual(DUNGEON_ORDER, Object.values(DUNGEONS).filter((d) => !d.hidden).sort((a, b) => a.storyOrder - b.storyOrder).map((d) => d.id));
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
  const vig = Array(5).fill('vigor');
  const ups = chestUpgrades(['furia', ...vig], rng, 3);
  // o Vigor já está no máximo; das que você não tem, só as do BAÚ (há vaga)
  assert.ok(ups.includes('furia') && !ups.includes('vigor'));
  assert.ok(ups.every((id) => id === 'furia' || UPGRADES.find((u) => u.id === id).chest));
});

test('melhorias: o KIT do personagem (6 golpes) e 6 passivas, cada tipo com o seu limite; depois só moedas ou vida', () => {
  // as cartas do kit vêm da ficha: cada habilidade pelo nome, o tiro, o combo e o especial (dono, 2026-11-14: "haver com
  // cada um dos personagens")
  const kit = kitUpgrades(cindy);
  const names = kit.map((u) => u.name);
  for (const a of cindy.abilities) assert.ok(names.includes(a.name), a.name);
  assert.ok(names.includes(cindy.ranged.name) && names.includes(cindy.melee.name) && names.includes(cindy.special.name));
  assert.ok(kit.length > MAX_KIT, 'mais golpes do que vagas: precisa escolher');
  assert.ok(UPGRADES.every((u) => u.kind === 'passive' || u.kind === 'fusion'), 'sem as ativas automáticas fora da lore');
  const pass = UPGRADES.filter((u) => !u.chest);
  assert.ok(pass.length >= 14);
  // as do baú nunca nas cartas
  for (let i = 0; i < 50; i++) assert.ok(!rollChoices([], Math.random, 3, cindy).some((u) => u.chest));
  // as 6 vagas do KIT cheias: as cartas só trazem golpes que já tem (passivas novas continuam)
  const six = kit.slice(0, MAX_KIT).map((u) => u.id);
  assert.equal(slotsOf(six, 'kit', 'cindy'), MAX_KIT);
  for (let i = 0; i < 30; i++) assert.ok(rollChoices(six, Math.random, 3, cindy).every((u) => u.kind === 'passive' || six.includes(u.id)));
  // as duas vagas cheias: cartas e baú só sobem o que já tem
  const base = [...six, ...pass.slice(0, MAX_PASSIVE).map((u) => u.id)];
  for (let i = 0; i < 30; i++) {
    assert.ok(rollChoices(base, Math.random, 3, cindy).every((u) => base.includes(u.id)));
    assert.ok(chestUpgrades(base, Math.random, 3).every((id) => base.includes(id)));
  }
  // tudo no máximo: o baú não tem o que dar -> recompensa (moedas ou vida)
  const maxed = base.flatMap((id) => Array(5).fill(id)).filter((id, i, arr) => arr.slice(0, i).filter((x) => x === id).length < ([...UPGRADES, ...kit].find((u) => u.id === id).max));
  // (a sorte acima da chance: nenhuma FUSÃO sai — a receita de algumas está pronta aqui)
  assert.deepEqual(chestUpgrades(maxed, () => 0.99, 3), []);
  assert.equal(rollChoices(maxed, Math.random, 3, cindy).length, 0);
  const r = rewardChoices(30, 0.3);
  assert.deepEqual(r.map((x) => x.id), ['reward:coins', 'reward:heal']);
  // os efeitos do kit: só valem para quem é dono do golpe
  const sil = kitId('cindy', 'silenciar');
  const picks = [sil, sil, kitId('cindy', 'special'), 'espinhos', 'espinhos', 'certeiro', 'frequencia', 'reflexos'];
  const m = computeMods(picks, {}, 'cindy');
  assert.deepEqual(m.kit, { silenciar: 2, special: 1 });
  assert.ok(Math.abs(m.kitDmg.silenciar - (1 + 2 * KIT_STEP.ability.dmg)) < 1e-9);
  assert.ok(Math.abs(m.kitCd.silenciar - (1 - 2 * KIT_STEP.ability.cd)) < 1e-9);
  assert.ok(Math.abs(m.kitCost.special - (1 - KIT_STEP.special.cost)) < 1e-9);
  assert.deepEqual(computeMods(picks, {}, 'eloy').kit, {}, 'a carta da Cindy não vale para o Eloy (co-op)');
  assert.ok(Math.abs(m.thorns - 0.25) < 1e-9);
  assert.ok(Math.abs(m.crit - 0.1) < 1e-9);
  assert.ok(Math.abs(m.cdMult - 0.94) < 1e-9 && Math.abs(m.dodgeMult - 0.88) < 1e-9);
  // a loja: Mais Opções, Iniciação, Especialista
  const t = computeMods([sil], { opcoes: 1, iniciacao: 1, duplicacao: 1, area: 3, ritmo: 3 }, 'cindy');
  assert.equal(t.choices, 4);
  assert.ok(t.startKit);
  assert.ok(Math.abs(t.kitDmg.silenciar - (1 + 1.3 * KIT_STEP.ability.dmg)) < 1e-9, 'Especialista: o kit vale 30% a mais');
  assert.ok(Math.abs(t.dodgeMult - 0.85) < 1e-9);
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

test('moedas: aparecem sempre, mas poucas (pedido do dono, 2026-11-08)', async () => {
  const { rollLoot } = await import('../src/pve/unlocks.js');
  // força o sorteio de moedas (r = 0) e o valor máximo (rng depois = 0,999)
  let k = 0;
  const seq = [0, 0.999];
  const rng = () => seq[k++ % 2];
  const r1 = rollLoot('drawer', rng, 1);
  assert.equal(r1.kind, 'coins');
  assert.ok(r1.amount >= 1 && r1.amount <= 3, `profundidade 1: 1–3 moedas (veio ${r1.amount})`);
  k = 0;
  const r3 = rollLoot('monster', rng, 3);
  assert.ok(r3.amount <= 5, `profundidade 3: no máximo 5 (veio ${r3.amount})`);
});

test('salvamento: a árvore antiga (por personagem, com pontos) vira moedas na árvore global', () => {
  const old = { version: 1, coins: 10, profiles: { kaiser: { level: 3, points: 1, spent: 2, tree: { vida: 2 } } }, campaign: {} };
  const out = JSON.parse(JSON.stringify(old));
  migrateTree(out);
  assert.ok(out.treeGlobal);
  assert.deepEqual(out.profiles.kaiser.tree || {}, {});
  assert.ok(out.coins > 10, 'os pontos viram moedas');
});

test('loja: todo personagem tem raridade e a vitrine do gacha tem 6 (2/2/1/1), igual em toda janela de 4 h', async () => {
  const { ROSTER } = await import('../src/characters/index.js');
  const { UNLOCK_TIERS, pveBanned } = await import('../src/pve/unlocks.js');
  const { shopBanner, rarityOf, spin, SPIN_PRICE } = await import('../src/pve/economy.js');
  const listed = new Set(UNLOCK_TIERS.flatMap((t) => t.ids));
  const missing = ROSTER.filter((c) => !pveBanned(c) && !listed.has(c.id)).map((c) => c.id);
  assert.deepEqual(missing, [], 'personagem sem degrau de preço vira lendário sem querer');
  assert.equal(rarityOf('artemis'), 'comum');
  const ids = ROSTER.filter((c) => !pveBanned(c) && rarityOf(c.id)).map((c) => c.id);
  const b = shopBanner(ids, 1e12);
  assert.equal(b.slots.length, 6);
  const n = (r) => b.slots.filter((x) => x.rarity === r).length;
  assert.deepEqual([n('comum'), n('raro'), n('epico'), n('lendario')], [2, 2, 1, 1]);
  assert.deepEqual(shopBanner(ids, 1e12 + 1000).slots, b.slots, 'mesma janela, mesma vitrine');
  const d = emptyData();
  assert.equal(spin(d, b), false, 'sem moedas');
  d.coins = SPIN_PRICE;
  const r = spin(d, b, () => 0);
  assert.equal(r.rarity, 'comum');
  assert.ok(d.unlocked.includes(r.id));
});

test('loja da Aghata: DEVOLVER TUDO devolve cada moeda; a Ressurreição é cara e liga o revive', () => {
  const d = emptyData();
  d.coins = 5000;
  assert.ok(buyRank(d, 'vida'));
  assert.ok(buyRank(d, 'vida'));
  assert.ok(buyRank(d, 'dano'));
  const spent = 5000 - d.coins;
  assert.equal(refundTree(d), spent);
  assert.equal(d.coins, 5000);
  assert.deepEqual(d.tree, {});
  const res = TREE.find((n) => n.id === 'ressurreicao');
  assert.ok(res && res.ranks === 1);
  const rest = TREE.filter((n) => n !== res).reduce((a, n) => a + Array.from({ length: n.ranks }, (_, r) => treeCoinCost(n, r)).reduce((x, y) => x + y, 0), 0);
  assert.ok(treeCoinCost(res, 0) >= rest * 0.6, 'a Ressurreição custa perto de toda a loja junta');
  assert.ok(computeMods([], { ressurreicao: 1 }).revive);
  assert.ok(Math.abs(computeMods(['certeiro'], { precisao: 3 }).crit - 0.16) < 1e-9, 'o Golpe Certeiro do baú soma por cima da Precisão');
});

// FUSÕES (dono, 2026-11-16, "como no Vampire Survivors"): só do baú, só com a receita (a 1ª no máximo + a 2ª), por chance;
// descobertas antes, bem raras mesmo sem receita. O Segundo Fôlego saiu (a segunda vida é só a Ressurreição comprada)
test('fusões: receita, chance do baú, descoberta e nada de Segundo Fôlego', async () => {
  const U = await import('../src/pve/upgrades.js');
  assert.ok(!U.UPGRADES.some((u) => u.id === 'folego'), 'o Segundo Fôlego saiu');
  assert.ok(U.TREE.some((n) => n.id === 'ressurreicao'), 'a Ressurreição continua na loja');
  assert.ok(U.FUSIONS.length >= 5);
  for (const f of U.FUSIONS) {
    assert.equal(f.max, 1);
    for (const [id] of f.needs) assert.ok(U.getUpgrade(id), `${f.id}: a receita usa melhorias que existem (${id})`);
    const [a, lv] = f.needs[0];
    assert.equal(U.getUpgrade(a).max, lv, `${f.id}: a 1ª da receita pede o máximo`);
  }
  // nunca nas cartas de nível
  for (let i = 0; i < 30; i++) assert.ok(!U.rollChoices([], Math.random, 4).some((u) => u.kind === 'fusion'));
  const carn = U.FUSIONS.find((f) => f.id === 'carnificina');
  const meia = ['furia', 'furia', 'sanguessuga'];
  const pronta = ['furia', 'furia', 'furia', 'furia', 'furia', 'sanguessuga'];
  const always = () => 0; // o sorteio sempre "acerta"
  // sem a receita e sem descoberta: nunca
  assert.ok(!U.chestUpgrades(meia, always, 1).includes('carnificina'));
  // com a receita: sai quando a sorte cai abaixo da chance...
  assert.deepEqual(U.chestUpgrades(pronta, () => carn.evolve.chance - 0.01, 1), ['carnificina']);
  // ...e não sai acima dela
  assert.ok(!U.chestUpgrades(pronta, () => carn.evolve.chance + 0.01, 1).includes('carnificina'));
  // já descoberta: rara mesmo sem a receita
  assert.deepEqual(U.chestUpgrades(meia, () => carn.evolve.rare - 0.001, 1, { discovered: ['carnificina'] }), ['carnificina']);
  assert.ok(!U.chestUpgrades(meia, () => carn.evolve.rare + 0.001, 1, { discovered: ['carnificina'] }).includes('carnificina'));
  // não ocupa vaga e aplica o efeito
  assert.equal(U.slotsOf([...pronta, 'carnificina'], 'passive'), 2);
  const m = U.computeMods([...pronta, 'carnificina']);
  assert.ok(Math.abs(m.dealt.melee - (1 + 5 * 0.1 + 0.15)) < 1e-9);
  // o save guarda a descoberta uma vez
  const S = await import('../src/pve/save.js');
  const data = {};
  assert.equal(S.discover(data, 'carnificina'), true);
  assert.equal(S.discover(data, 'carnificina'), false);
  assert.ok(S.isDiscovered(data, 'carnificina'));
});

// a BRECHA da Degolificada (dono, 2026-11-16: "todos os bosses têm que ter suas fraquezas... depois de um ataque o boss
// fica vulnerável; atualmente a Degolificada não tem esse momento")
test('Degolificada: fica exausta depois do Grito e da Investida que erra — leva mais dano e não se defende', async () => {
  const { DegolificadaBrain, DEGOLIFICADA_CFG } = await import('../src/pve/degolificada.js');
  const T = DEGOLIFICADA_CFG.tired;
  const boss = { cpuEdge: {}, pos: new THREE.Vector3(), vel: new THREE.Vector3(), radius: 0.5, state: 'idle', health: 900, rig: { body: { position: new THREE.Vector3(0, 0.22, 0), rotation: new THREE.Euler() }, root: { scale: { y: 1 } } }, anim: { play() {}, speed: 1 }, chestPos: (v) => v.set(0, 1.2, 0) };
  const brain = Object.create(DegolificadaBrain.prototype);
  Object.assign(brain, {
    d: { enemy: boss, players: [], pveHud: null, cluesNeeded: 3 },
    w: { audio: { play() {} }, fx: { burst() {} } },
    layers: 0, t: 0, st: 0, cds: { guard: 0, breakout: 0 }, marks: [], fury: false, devourer: false, near: 0, cornered: 0,
  });
  brain.backToDuel(T.scream);
  assert.equal(brain.state, 'tired');
  assert.equal(boss.cpuEdge.taken, T.taken, 'exausta: leva mais dano');
  assert.ok(T.taken > 1);
  // o corpo desce
  for (let i = 0; i < 30; i++) { brain.t += 1 / 60; brain.st += 1 / 60; brain.updateTired(1 / 60); }
  assert.ok(boss.rig.body.position.y < 0.22 - T.sink * 0.5);
  // passa o tempo: volta ao duelo, e a defesa de cabelo espera um pouco (o jogador ainda bate)
  brain.st = T.scream + 0.01;
  brain.updateTired(1 / 60);
  assert.equal(brain.state, 'duel');
  assert.equal(boss.cpuEdge.taken, 1);
  assert.ok(brain.cds.guard >= T.guardAfter);
  // na Fúria a brecha encolhe mas existe
  brain.fury = true;
  brain.backToDuel(T.lashMiss);
  assert.ok(brain.tiredFor > 0 && brain.tiredFor < T.lashMiss);
  // a Investida que acerta deixa só um respiro; a que erra, a brecha
  assert.ok(T.lashMiss > T.lashHit * 2 && T.grabMiss >= 1 && T.scream >= 1.5);
});

test('chefes com brecha: o Espreitador mais duro e os minibosses tontos depois do golpe grande que erra', () => {
  const E = ESPREITADOR_CFG;
  // mais difícil: habilidades mais seguidas, pânico mais curto, frestas reabrem antes, bote em cadeia
  assert.ok(E.duel[1] <= 5 && E.terror.time < 7 && E.terror.taken < 2 && E.closet.lockTime < 20);
  assert.ok(E.fresta.chain.max >= 1 && E.fresta.chain.below <= 0.5);
  // mas o bote que ERRA ainda abre a guarda dele
  assert.ok(E.fresta.lunge.miss >= 0.8);
  for (const M of [RASTROPODA, BILU]) assert.ok(M.daze.taken > 1 && Object.values(M.daze).every((x) => x > 1));
});

// o ALMOXARIFADO da Escola (sala sem saída, kind 'stash'; pedido do dono, 2026-11-16): nunca é a única porta, nunca sai
// de outra sala sem saída, aparece no máximo uma vez por tentativa e nunca leva cadeado; o pátio da cantina é sala de luta
test('Escola: o almoxarifado sem saída e o pátio da cantina na rota', () => {
  const D = DUNGEONS.degolificada;
  assert.equal(D.modules.almoxarifado.kind, 'stash');
  assert.deepEqual(Object.keys(D.modules.almoxarifado.exits), ['back']);
  assert.equal(D.modules.patio.kind, 'fight');
  let seed = 7;
  const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  let stashSeen = 0;
  let patioSeen = 0;
  for (let k = 0; k < 3000; k++) {
    const cur = ['corredor', 'historia', 'laboratorio', 'arquivos', 'patio'][k % 5];
    const out = rollExits(D, cur, { step: 1, total: 5, visited: k % 2 ? ['almoxarifado'] : [], rng });
    assert.ok(out.length >= 1);
    assert.ok(out.some((e) => e.kind !== 'stash'), 'o almoxarifado nunca é o único caminho');
    if (k % 2) assert.ok(!out.some((e) => e.to === 'almoxarifado'), 'uma vez por tentativa');
    stashSeen += out.filter((e) => e.kind === 'stash').length;
    patioSeen += out.filter((e) => e.to === 'patio').length;
  }
  assert.ok(stashSeen > 0 && patioSeen > 0);
  assert.equal(rollExits(D, 'almoxarifado', { step: 1, total: 5, rng }).some((e) => e.kind === 'stash'), false);
});

test('Fusões: 12, cada receita com passivas que existem e nenhuma receita repetida', async () => {
  const U = await import('../src/pve/upgrades.js');
  assert.equal(U.FUSIONS.length, 12);
  const seen = new Set();
  for (const f of U.FUSIONS) {
    for (const [id, lv] of f.evolve.needs) {
      const u = U.UPGRADES.find((x) => x.id === id);
      assert.ok(u && u.kind === 'passive', `${f.id}: ${id}`);
      assert.ok(lv >= 1 && lv <= u.max, `${f.id}: ${id} nível ${lv}`);
    }
    const key = f.evolve.needs.map(([id, lv]) => id + lv).join('+');
    assert.ok(!seen.has(key), key);
    seen.add(key);
    const m = U.computeMods([f.id]);
    assert.ok(m, f.id);
  }
});

test('Ondas de Tipora: fase de ondas sem portas, gigante sozinho a cada 3 e o Amigo Imaginário na última', async () => {
  const { wavePlan, phaseUnlocked } = await import('../src/pve/dungeons.js');
  const D = DUNGEONS.tipora;
  assert.ok(D.waves && D.about && D.aboutShort, 'a explicação da fase (menu e começo)');
  assert.equal(D.boss, 'amigo');
  assert.deepEqual(Object.keys(D.modules.praca.exits), []);
  assert.equal(D.modules.praca.kind, 'waves');
  let prev = 0;
  for (const diff of Object.keys(PVE_DIFFICULTIES)) {
    const plan = wavePlan(D, diff);
    assert.ok(plan.length >= prev, `${diff}: mais difícil, mais ondas`);
    prev = plan.length;
    assert.equal(plan[plan.length - 1].kind, 'boss', `${diff}: a última é o chefe`);
    assert.equal(plan.filter((w) => w.kind === 'boss').length, 1);
    for (const w of plan) {
      if (w.kind === 'giant') { assert.equal(w.n % D.waves.bossEvery, 0); assert.equal(w.count, 1, 'o gigante vem sozinho'); }
      if (w.kind === 'horde') {
        assert.ok(w.count >= 2 && w.count <= 9); assert.ok(w.strongs < w.count);
        assert.equal(Object.values(w.foes).reduce((a, b) => a + b, 0), w.count, 'os tipos somam o tamanho da onda');
        if (w.n === 1) assert.deepEqual(Object.keys(w.foes), ['zumbi'], 'a 1ª onda só de zumbis (para aprender)');
        if (w.n >= 4) for (const t of ['javali', 'cao', 'cobra']) assert.ok(w.foes[t] > 0, `${diff} onda ${w.n}: os três infectados juntos (${t})`);
      }
    }
  }
  // mais difícil, mais animais e mais Zumbis de Tinta no total
  const tally = (diff, keys) => wavePlan(D, diff).reduce((a, w) => a + keys.reduce((s, k) => s + ((w.foes || {})[k] || 0), 0), 0);
  assert.ok(tally('annihilation', ['javali', 'cao', 'cobra']) > tally('easy', ['javali', 'cao', 'cobra']));
  assert.ok(tally('hard', ['tinta']) > tally('easy', ['tinta']));
  // entrou entre a Mansão e a Torre, sem trancar a Torre de quem já a venceu
  assert.ok(phaseUnlocked({ phases: ['degolificada', 'espreitador'] }, 'tipora'));
  assert.ok(!phaseUnlocked({ phases: ['degolificada', 'espreitador'] }, 'estrangeiro'));
  assert.ok(phaseUnlocked({ phases: ['degolificada', 'espreitador', 'estrangeiro'] }, 'estrangeiro'));
  const boss = (await import('../src/characters/bosses/amigo.js')).default;
  assert.ok(boss.boss && boss.stats.maxHealth > 1800 && !boss.special && !boss.awakening);
});

test('Dificuldades trancadas por fase: Fácil e Normal abertos; cada uma abre vencendo a de baixo NESTA fase', async () => {
  const { diffUnlocked, clampDiff, phaseUnlocked } = await import('../src/pve/dungeons.js');
  const camp = (times) => ({ phases: [], bestTimes: times });
  const novo = camp({});
  assert.ok(diffUnlocked(novo, 'degolificada', 'easy') && diffUnlocked(novo, 'degolificada', 'normal'));
  assert.ok(!diffUnlocked(novo, 'degolificada', 'hard'));
  // o Fácil não abre o Difícil (mas abre a próxima fase, só com Fácil e Normal)
  const facil = camp({ degolificada: 300, 'degolificada:easy': 300 });
  assert.ok(!diffUnlocked(facil, 'degolificada', 'hard'));
  assert.ok(phaseUnlocked(facil, 'espreitador'));
  // o Normal abre o Difícil dela, e só dela
  const normal = camp({ degolificada: 300, 'degolificada:normal': 300 });
  assert.ok(diffUnlocked(normal, 'degolificada', 'hard'));
  assert.ok(!diffUnlocked(normal, 'degolificada', 'superhard'));
  assert.ok(!diffUnlocked(normal, 'espreitador', 'hard'));
  // em cadeia: Difícil → Superdifícil → Aniquilação
  assert.ok(diffUnlocked(camp({ 'degolificada:hard': 1 }), 'degolificada', 'superhard'));
  assert.ok(diffUnlocked(camp({ 'degolificada:superhard': 1 }), 'degolificada', 'annihilation'));
  // quem já venceu uma dificuldade antes da regra não a perde
  assert.ok(diffUnlocked(camp({ 'degolificada:hard': 1 }), 'degolificada', 'hard'));
  // "PRÓXIMA FASE" no Difícil cai para a mais alta aberta (o Normal)
  assert.equal(clampDiff(normal, 'espreitador', 'hard'), 'normal');
  assert.equal(clampDiff(normal, 'degolificada', 'hard'), 'hard');
  assert.equal(clampDiff(novo, 'degolificada', 'easy'), 'easy');
});

test('Árvore Anciã: as lamparinas do corredor enfraquecem as ondas (menos Assombrações, menos ondas a partir de 14)', async () => {
  const { treePlan, treeWeaken } = await import('../src/pve/dungeons.js');
  const none = treePlan('normal', 0);
  const some = treePlan('normal', 10);
  const many = treePlan('normal', 16);
  const sum = (p) => p.reduce((n, w) => n + w.count, 0);
  assert.equal(none.length, 4);
  assert.ok(sum(some) < sum(none));
  assert.equal(many.length, 3);
  assert.equal(treeWeaken(0), 0);
  assert.equal(treeWeaken(100), 0.45);
  for (const d of Object.keys(PVE_DIFFICULTIES)) for (const w of treePlan(d, 0)) assert.ok(w.count >= 2 && Object.values(w.foes).every((q) => q > 0));
  assert.ok(!treePlan('easy', 0).some((w) => w.foes.broen));
  assert.ok(none[none.length - 1].foes.broen === 1);
});
