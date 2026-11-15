import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import '../src/render/bvh.js';
import { moveWithCollision, solidMeshes, EXPLORE } from '../src/game/Explorer.js';

// MODO EXPLORAR (pedido do dono, 2026-11-15): voa como o espectador, mas não atravessa parede nem chão
function room() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial();
  const floor = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 40), mat); floor.position.y = -0.5; g.add(floor);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 40), mat); wall.position.x = 5; g.add(wall); // parede fina
  const sky = new THREE.Mesh(new THREE.SphereGeometry(100, 8, 8), new THREE.MeshBasicMaterial({ side: THREE.BackSide })); g.add(sky);
  return g;
}

test('explorar: o céu não conta como parede', () => {
  assert.equal(solidMeshes(room()).length, 2);
});

test('explorar: não atravessa parede fina nem com um passo enorme, e desliza por ela', () => {
  const solids = solidMeshes(room());
  const p = new THREE.Vector3(0, 2, 0);
  moveWithCollision(p, new THREE.Vector3(30, 0, 8), solids);
  assert.ok(p.x < 5 - 0.1 + 0.001 && p.x > 4.5, `parou na parede (x=${p.x.toFixed(3)})`);
  assert.ok(p.z > 7.5, `deslizou ao longo dela (z=${p.z.toFixed(2)})`);
});

test('explorar: não entra no chão', () => {
  const solids = solidMeshes(room());
  const p = new THREE.Vector3(0, 2, 0);
  moveWithCollision(p, new THREE.Vector3(1, -20, 0), solids);
  assert.ok(Math.abs(p.y - EXPLORE.radius) < 0.02, `y=${p.y.toFixed(3)}`);
  assert.ok(p.x > 0.9, 'o resto do movimento continua');
});
