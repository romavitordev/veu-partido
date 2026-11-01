import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTeamActionSlots } from '../src/combat/teamInput.js';

test('with one assist, both shoulder buttons call it and either right-stick direction switches to it', () => {
  for (const pressed of [{ assist1: true }, { assist2: true }, { switch1: true }, { switch2: true }, { assist1: true, assist2: true }, { switch1: true, switch2: true }]) {
    const actions = resolveTeamActionSlots(1, pressed);
    assert.deepEqual(actions.assistSlots, pressed.assist1 || pressed.assist2 ? [0] : []);
    assert.deepEqual(actions.switchSlots, pressed.switch1 || pressed.switch2 ? [0] : []);
  }
});

test('with two assists, each button and stick direction still selects its own slot', () => {
  assert.deepEqual(resolveTeamActionSlots(2, {
    assist1: true,
    switch2: true,
  }), { assistSlots: [0], switchSlots: [1] });
});
