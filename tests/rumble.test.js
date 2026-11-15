import test from 'node:test';
import assert from 'node:assert/strict';
import { rumble, rumbleHit, RUMBLE } from '../src/input/rumble.js';
import { SETTINGS } from '../src/config/settings.js';

function fakePads() {
  const calls = [];
  const pad = (index) => ({ index, connected: true, vibrationActuator: { playEffect: (type, p) => { calls.push({ pad: index, type, ...p }); return Promise.resolve('complete'); } } });
  const pads = [pad(0), pad(1)];
  Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => pads }, configurable: true });
  return calls;
}
const fighter = (index, source = 'gamepad', state = 'hitstun') => ({ input: { index, source }, state });
let clock = 0;
performance.now = () => clock;

test('vibra só o controle de quem joga com controle, pelo peso do golpe', () => {
  const calls = fakePads();
  clock += 10000;
  const world = {};
  rumbleHit(world, fighter(1, 'keyboard'), fighter(0), 30, { kind: 'melee' }, false);
  assert.equal(calls.length, 1); // quem bateu está no teclado: só a vítima (P1) vibra
  assert.equal(calls[0].pad, 0);
  assert.equal(calls[0].strongMagnitude, RUMBLE.hitLight[0]);
  clock += 1000;
  rumbleHit(world, fighter(0), fighter(1), 80, { kind: 'melee' }, true);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls.slice(1).map((c) => c.strongMagnitude), [RUMBLE.hitHeavy[0], RUMBLE.landHeavy[0]]);
  clock += 1000;
  rumbleHit(world, fighter(1, 'cpu'), fighter(0, 'touch'), 80, { kind: 'melee' }, true);
  assert.equal(calls.length, 3); // CPU e toque não vibram
});

test('um tremor fraco não corta um forte no meio; desligado nas opções não vibra', () => {
  const calls = fakePads();
  clock += 10000;
  rumble(fighter(0), {}, 'ko');
  rumble(fighter(0), {}, 'block');
  assert.equal(calls.length, 1);
  clock += RUMBLE.ko[2] + 1;
  rumble(fighter(0), {}, 'block');
  assert.equal(calls.length, 2);
  SETTINGS.rumble = false;
  clock += 1000;
  rumble(fighter(0), {}, 'ko');
  assert.equal(calls.length, 2);
  SETTINGS.rumble = true;
});

test('online: só o lado deste computador vibra, pelo controle do P1', () => {
  const calls = fakePads();
  clock += 10000;
  const world = { netplay: true, viewSlot: 1 };
  rumble(fighter(0), world, 'ko');
  assert.equal(calls.length, 0);
  rumble(fighter(1), world, 'ko');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].pad, 0);
});
