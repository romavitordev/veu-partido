import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchBuffer, netProgress, _resetNetStats } from '../src/models/netLoad.js';

// fetch falso: devolve um corpo em 2 pedaços e conta quantos downloads correm ao mesmo tempo
test('netLoad: fila de no máximo 6 downloads, progresso e falha', async () => {
  _resetNetStats();
  let live = 0;
  let peak = 0;
  globalThis.fetch = async (url) => {
    live++; peak = Math.max(peak, live);
    await new Promise((r) => setTimeout(r, 5));
    if (url.includes('bad')) { live--; return { ok: false, status: 404, headers: new Map() }; }
    const parts = [new Uint8Array([1, 2]), new Uint8Array([3])];
    return {
      ok: true,
      headers: { get: () => '3' },
      body: { getReader: () => ({ read: async () => { if (!parts.length) { live--; return { done: true }; } return { done: false, value: parts.shift() }; } }) },
    };
  };
  const urls = Array.from({ length: 14 }, (_, i) => `m${i}.glb`);
  const bufs = await Promise.all(urls.map(fetchBuffer));
  assert.equal(peak <= 6, true);
  assert.deepEqual([...new Uint8Array(bufs[0])], [1, 2, 3]);
  await assert.rejects(fetchBuffer('bad.glb'));
  const p = netProgress();
  assert.equal(p.done, 14);
  assert.equal(p.files, 14);
  assert.equal(p.failed, 1);
  assert.equal(p.bytes, 42);
  assert.equal(p.frac, 1);
});
