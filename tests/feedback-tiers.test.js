// FEEDBACK EM TRÊS PESOS (TODO, item 5 das melhorias das skills, 2026-11-27): uma tabela só decide o peso de cada
// evento do Outro Lado, e um evento comum nunca faz mais barulho que um raro.
import test from 'node:test';
import assert from 'node:assert/strict';
import { FEEDBACK_TIERS, EVENT_WEIGHT, feedback, weightOf } from '../src/pve/feedback.js';

test('os pesos crescem: pequeno < médio < grande em som, faíscas, anel, tremor e pausa', () => {
  const [s, m, l] = ['small', 'medium', 'large'].map((k) => FEEDBACK_TIERS[k]);
  for (const k of ['volume', 'burst', 'ring', 'shake', 'hitstop']) {
    assert.ok(s[k] <= m[k] && m[k] <= l[k], k);
  }
  assert.ok(s.volume < l.volume);
  assert.equal(s.hitstop, 0, 'pausa de impacto só no grande');
  assert.equal(m.hitstop, 0);
});

test('o peso de cada evento: moeda e cura pequenos, baú e nível médios, chefe e descoberta grandes', () => {
  for (const e of ['coin', 'heal', 'xp', 'key']) assert.equal(weightOf(e), 'small', e);
  for (const e of ['chest', 'levelUp', 'reward', 'relic', 'revive']) assert.equal(weightOf(e), 'medium', e);
  for (const e of ['bossDown', 'discovery']) assert.equal(weightOf(e), 'large', e);
  for (const w of Object.values(EVENT_WEIGHT)) assert.ok(FEEDBACK_TIERS[w], w);
});

test('feedback() toca o som com o volume do peso e só o grande treme e pausa', () => {
  const calls = [];
  const world = {
    audio: { play: (n, o) => calls.push(['play', n, o.volume]) },
    fx: { burst: () => calls.push(['burst']), ring: () => calls.push(['ring']) },
    cameraRig: { shake: (a) => calls.push(['shake', a]) },
    hitstop: (t) => calls.push(['hitstop', t]),
  };
  feedback(world, 'coin', { at: { x: 0, z: 0 } });
  assert.deepEqual(calls.map((c) => c[0]), ['play', 'burst']);
  assert.equal(calls[0][2], FEEDBACK_TIERS.small.volume);
  calls.length = 0;
  feedback(world, 'bossDown', { at: { x: 0, z: 0 } });
  assert.deepEqual(calls.map((c) => c[0]), ['play', 'burst', 'ring', 'shake', 'hitstop']);
  assert.equal(feedback(null, 'coin'), null);
});
