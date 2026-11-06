import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pinPrograms } from '../src/core/programPin.js';

// o three.js apaga o programa quando usedTimes chega a 0 (WebGLPrograms.releaseProgram): fixado, o descarte do
// último material do efeito não apaga mais o shader e o próximo golpe não recompila (P0 travamentos, 2026-11-06)
const release = (programs, p) => { if (--p.usedTimes === 0) programs.splice(programs.indexOf(p), 1); };

test('um shader fixado sobrevive ao descarte do material do efeito', () => {
  const programs = [{ id: 1, usedTimes: 1 }];
  const renderer = { info: { programs } };
  assert.equal(pinPrograms(renderer), 1);
  release(programs, programs[0]); // o efeito acabou e descartou o material
  assert.equal(programs.length, 1);
  assert.equal(pinPrograms(renderer), 0, 'não fixa duas vezes');
  assert.equal(programs[0].usedTimes, 1);
});

test('o teto limita quantos programas ficam fixos', () => {
  const programs = Array.from({ length: 5 }, (_, i) => ({ id: i, usedTimes: 1 }));
  assert.equal(pinPrograms({ info: { programs } }, 3), 3);
  assert.equal(programs.filter((p) => p.pinned).length, 3);
});

test('sem renderer não quebra', () => {
  assert.equal(pinPrograms(null), 0);
});
