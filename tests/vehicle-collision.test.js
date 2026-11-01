import test from 'node:test';
import assert from 'node:assert/strict';
import chico from '../src/characters/chico.js';
import { vehicleBlocked } from '../src/combat/vehicleCollision.js';

test('the Five van starts close enough to stay on the Tipora plaza', () => {
  const van = chico.abilities.find((ability) => ability.id === 'vanDosCinco');

  assert.equal(van.behind, 6);
});

test('the Five van can cross Tipora plaza props but still stops at the arena edge', () => {
  const arena = {
    id: 'tipora',
    radius: 17,
    colliders: [{ x: 0, z: 0, r: 2 }],
    boxes: [],
    blocksPoint: () => true,
  };

  assert.equal(vehicleBlocked(arena, 'van', { x: 0, y: 0.6, z: 0 }), false);
  assert.equal(vehicleBlocked(arena, 'van', { x: 18, y: 0.6, z: 0 }), true);
});

test('other vehicles still stop at arena obstacles', () => {
  const arena = { id: 'tipora', blocksPoint: (point, radius) => point.x === 2 && radius === 0.4 };

  assert.equal(vehicleBlocked(arena, undefined, { x: 2, y: 0.6, z: 0 }), true);
  assert.equal(vehicleBlocked(arena, 'van', { x: 2, y: 0.6, z: 0 }), true);
});
