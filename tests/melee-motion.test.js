import test from 'node:test';
import assert from 'node:assert/strict';
import { Fighter } from '../src/combat/Fighter.js';

function strikeMotion(strike, index) {
  const fighter = Object.create(Fighter.prototype);
  Object.assign(fighter, {
    buffs: [],
    state: 'idle',
    stateTime: 0,
    combo: { chain: -1, steps: 0, hits: [], windows: [] },
    world: { time: 0, hostileNpcs: () => [], opponentOf: () => null },
    anim: { play() {}, speed: 1, twist: 0 },
    pos: { x: 0, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    yaw: 0,
    onGround: true,
  });
  fighter.startStrike(strike, index === undefined ? {} : { index });
  return fighter.combo.motion;
}

test('first three regular melee strikes do not advance, but the fourth retains its authored movement', () => {
  const strike = { name: 'Soco', anim: 'jab', dur: 0.3, active: [0.1, 0.2], lunge: 2 };

  for (let index = 0; index < 3; index++) {
    assert.equal(strikeMotion(strike, index)[0].fwd, 0, `strike ${index + 1} stays in place`);
  }
  assert.equal(strikeMotion(strike, 3)[0].fwd, 2, 'strike 4 keeps its authored lunge');
});

test('directional melee branches keep their authored forward movement', () => {
  const strike = {
    name: 'Avanço',
    anim: 'dash_punch',
    dur: 0.4,
    active: [0.1, 0.2],
    motion: [{ t: [0, 0.2], fwd: 5, stopClose: true }],
  };

  assert.equal(strikeMotion(strike)[0].fwd, 5);
});
