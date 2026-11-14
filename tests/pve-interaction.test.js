import test from 'node:test';
import assert from 'node:assert/strict';
import { Dungeon } from '../src/pve/Dungeon.js';
import { Chest } from '../src/pve/pickups.js';
import { RoomDoor } from '../src/pve/roomDoors.js';

function makeInteraction(chest) {
  const dungeon = Object.create(Dungeon.prototype);
  Object.assign(dungeon, {
    transit: false,
    choosing: false,
    bossIntro: false,
    encounter: null,
    phase: 'explore',
    doors: [],
    pickups: [chest],
    drawers: [],
    opened: [],
    interact(target) { this.opened.push(target); },
  });
  const view = {
    i: 0,
    p: { pos: { x: 0, z: 0 }, state: 'idle', onStairs: false },
    inp: { source: 'gamepad', pressed: {}, held: {} },
    interactLatch: false,
    chestHoldT: 0,
    chestHoldTarget: null,
    prompt: { show() {}, hide() {} },
  };
  return { dungeon, view };
}

test('opening a chest requires holding either interaction input for the hold duration', () => {
  const chest = Object.assign(Object.create(Chest.prototype), {
    pos: { x: 0, z: 0 },
    opened: false,
  });

  for (const action of ['interact', 'physical']) {
    const { dungeon, view } = makeInteraction(chest);
    view.inp.held[action] = true;
    view.inp.pressed[action] = true;
    dungeon.updateInteract(view, 0.2);
    assert.equal(dungeon.opened.length, 0, `${action} tap does not open the chest`);

    view.inp.pressed[action] = false;
    dungeon.updateInteract(view, 0.2);
    assert.equal(dungeon.opened.length, 0, `${action} is still holding`);

    dungeon.updateInteract(view, 0.06);
    assert.deepEqual(dungeon.opened, [chest], `${action} opens after being held`);
  }
});

test('releasing interaction before the hold duration resets chest progress', () => {
  const chest = Object.assign(Object.create(Chest.prototype), {
    pos: { x: 0, z: 0 },
    opened: false,
  });
  const { dungeon, view } = makeInteraction(chest);

  view.inp.held.interact = true;
  view.inp.pressed.interact = true;
  dungeon.updateInteract(view, 0.2);
  view.inp.held.interact = false;
  view.inp.pressed.interact = false;
  dungeon.updateInteract(view, 0.1);

  view.inp.held.interact = true;
  view.inp.pressed.interact = true;
  dungeon.updateInteract(view, 0.2);
  assert.equal(dungeon.opened.length, 0);
});

test('doors still open immediately on a tap', () => {
  const door = Object.assign(Object.create(RoomDoor.prototype), {
    exit: true,
    locked: false,
    opened: false,
    stairs: false,
    spot: { x: 0, z: 0 },
    reach: () => 0.2,
    target: () => ({ x: 0, z: 0 }),
  });
  const { dungeon, view } = makeInteraction({});
  dungeon.doors = [door];
  dungeon.pickups = [];
  view.inp.held.interact = true;
  view.inp.pressed.interact = true;

  dungeon.updateInteract(view, 0.016);
  assert.deepEqual(dungeon.opened, [door]);
});
