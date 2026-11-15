import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { spatialize, acousticsFor, ACOUSTICS, SPATIAL } from '../src/audio/acoustics.js';
import { ARENAS } from '../src/arena/index.js';

function cam() {
  const c = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  c.position.set(0, 3, 10);
  c.lookAt(0, 1, 0);
  c.updateMatrixWorld(true);
  return c;
}

test('som 3D: à direita da tela sai na direita, no meio sai no meio, longe fica mais baixo', () => {
  const c = cam();
  const mid = spatialize(c, new THREE.Vector3(0, 1, 0));
  assert.ok(Math.abs(mid.pan) < 0.01);
  assert.equal(mid.gain, 1);
  const right = spatialize(c, new THREE.Vector3(4, 1, 0));
  const left = spatialize(c, new THREE.Vector3(-4, 1, 0));
  assert.ok(right.pan > 0.25 && right.pan <= SPATIAL.panMax);
  assert.ok(Math.abs(left.pan + right.pan) < 1e-9);
  const far = spatialize(c, new THREE.Vector3(0, 1, -40));
  assert.ok(far.gain < 0.5 && far.gain >= SPATIAL.minGain);
  assert.equal(spatialize(c, null), null);
});

test('eco: todo cenário de luta tem sala definida, e a igreja ecoa mais que o acampamento', () => {
  const ids = Object.keys(ARENAS);
  const missing = ids.filter((id) => !ACOUSTICS[id]);
  assert.deepEqual(missing, [], `cenários sem eco: ${missing.join(', ')}`);
  for (const a of Object.values(ACOUSTICS)) {
    assert.ok(a.time > 0 && a.time <= 4);
    assert.ok(a.wet >= 0 && a.wet <= 0.4);
  }
  assert.ok(acousticsFor('igreja').time > acousticsFor('acampamento').time);
  assert.ok(acousticsFor('nao_existe').wet > 0); // desconhecido: ar livre
});
