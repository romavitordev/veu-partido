import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { impactClose } from '../src/camera/shots.js';

test('impact close keeps both fighters centered and follows their movement', () => {
  const attacker = { pos: new THREE.Vector3(1, 0, 2), yaw: 0 };
  const target = { pos: new THREE.Vector3(1, 0, 4) };
  const shot = impactClose(attacker, target);

  const camera = shot.pos(0.5);
  const look = shot.look(0.5);
  assert.equal(shot.fov, 48);
  assert.equal(camera.y, 2.05);
  assert.equal(look.y, 1.35);
  assert.ok(Math.abs(camera.x - 5.1) < 1e-6);
  assert.equal(look.x, 1);
  assert.equal(look.z, 3);

  attacker.pos.x += 10;
  target.pos.x += 10;
  assert.ok(Math.abs(shot.pos(1).x - 15.1) < 1e-6);
  assert.equal(shot.look(1).x, 11);
});
