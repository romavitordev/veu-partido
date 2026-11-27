// ESCADA DE MIGRAÇÕES DO SAVE DO OUTRO LADO (TODO, item 7 das melhorias das skills, 2026-11-27): um save antigo sobe
// degrau por degrau até a versão do jogo sem perder moedas, personagens e árvore; um save mais novo que o jogo é recusado.
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePve, migratePve, emptyData, SAVE_VERSION, MIGRATIONS, parseBackup, exportPve, loadPve, PVE_KEY, PVE_BROKEN_KEY } from '../src/pve/save.js';

const memStore = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }; };

// um save v1 de verdade (como o jogo grava hoje)
function saveV1() {
  const d = emptyData();
  d.version = 1;
  d.coins = 1234;
  d.unlocked = ['nubi', 'velisar'];
  d.tree = { vida: 2, dano: 1 };
  d.profiles = { dara: { level: 4, points: 0, spent: 0, tree: {}, bossKills: 3 } };
  d.campaign.bestDepth = 7;
  return d;
}

// degraus de TESTE: v1 → v2 renomeia as moedas para um campo novo; v2 → v3 acrescenta um campo com padrão
const STEPS = {
  1: (d) => { d.wallet = { coins: d.coins }; return d; },
  2: (d) => { d.settings2 = { hints: true }; return d; },
};

test('o jogo atual abre o próprio save (a escada não muda nada na versão atual)', () => {
  const d = normalizePve(saveV1());
  assert.equal(SAVE_VERSION, 1);
  assert.equal(d.version, 1);
  assert.equal(d.coins, 1234);
  assert.deepEqual(d.unlocked, ['nubi', 'velisar']);
});

test('um save v1 abre numa versão 2 de teste com moedas, personagens e árvore iguais', () => {
  const d = normalizePve(saveV1(), { version: 2, migrations: STEPS });
  assert.ok(d);
  assert.equal(d.version, 2);
  assert.equal(d.coins, 1234);
  assert.deepEqual(d.wallet, { coins: 1234 });
  assert.deepEqual(d.unlocked, ['nubi', 'velisar']);
  assert.deepEqual(d.tree, { vida: 2, dano: 1 });
  assert.equal(d.profiles.dara.level, 4);
  assert.equal(d.campaign.bestDepth, 7);
});

test('sobe mais de um degrau de uma vez (1 → 2 → 3) e não mexe no original', () => {
  const v1 = saveV1();
  const d = migratePve(v1, 3, STEPS);
  assert.equal(d.version, 3);
  assert.deepEqual(d.wallet, { coins: 1234 });
  assert.deepEqual(d.settings2, { hints: true });
  assert.equal(v1.version, 1);
  assert.equal(v1.wallet, undefined);
});

test('falta um degrau, degrau que quebra ou save mais novo: recusa (null)', () => {
  assert.equal(migratePve(saveV1(), 3, { 1: STEPS[1] }), null);
  assert.equal(migratePve(saveV1(), 2, { 1: () => { throw new Error('x'); } }), null);
  assert.equal(normalizePve({ ...saveV1(), version: 99 }), null);
  assert.equal(normalizePve({ ...saveV1(), version: '1' }), null);
});

test('o save mais novo que o jogo fica guardado à parte, sem ser apagado', () => {
  const st = memStore();
  const raw = JSON.stringify({ ...saveV1(), version: SAVE_VERSION + 1 });
  st.setItem(PVE_KEY, raw);
  const d = loadPve(st);
  assert.equal(d.coins, 0);
  assert.equal(st.getItem(PVE_BROKEN_KEY), raw);
});

test('backup: o da versão atual entra; o de versão mais nova explica que precisa atualizar', () => {
  const ok = parseBackup(exportPve(saveV1()));
  assert.equal(ok.data.coins, 1234);
  const newer = JSON.parse(exportPve(saveV1()));
  newer.version = SAVE_VERSION + 1;
  assert.throws(() => parseBackup(JSON.stringify(newer)), /mais nova/);
});

test('todo degrau publicado tem número inteiro abaixo da versão atual', () => {
  for (const k of Object.keys(MIGRATIONS)) {
    const n = Number(k);
    assert.ok(Number.isInteger(n) && n >= 1 && n < SAVE_VERSION, `degrau ${k}`);
    assert.equal(typeof MIGRATIONS[k], 'function');
  }
});
