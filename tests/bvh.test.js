import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { accelerate } from '../src/render/bvh.js';

test('accelerate: monta a árvore nas malhas grandes e o raio acerta igual ao de antes', () => {
  const root = new THREE.Group();
  const big = new THREE.Mesh(new THREE.TorusKnotGeometry(2, 0.6, 120, 16), new THREE.MeshBasicMaterial());
  big.position.set(0, 1, -6);
  const small = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
  small.position.set(4, 0.5, -3);
  root.add(big, small);
  root.updateMatrixWorld(true);

  const rc = new THREE.Raycaster();
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const rays = Array.from({ length: 300 }, () => [
    new THREE.Vector3((rnd() - 0.5) * 6, 0.2 + rnd() * 3, 4),
    new THREE.Vector3((rnd() - 0.5) * 0.8, (rnd() - 0.5) * 0.4, -1).normalize(),
  ]);
  const cast = () => rays.map(([o, d]) => { rc.set(o, d); const h = rc.intersectObjects(root.children, false); return h.length ? +h[0].distance.toFixed(4) : null; });
  const before = cast();

  assert.equal(accelerate(root), 1); // só a malha grande (a caixa tem 12 triângulos)
  assert.ok(big.geometry.boundsTree);
  assert.equal(small.geometry.boundsTree, undefined);
  const after = cast();
  assert.ok(before.filter((x) => x !== null).length > 50);
  assert.deepEqual(after, before);

  // firstHitOnly: o mais perto, igual
  rc.firstHitOnly = true;
  const first = rays.map(([o, d]) => { rc.set(o, d); const h = rc.intersectObjects(root.children, false); return h.length ? +h[0].distance.toFixed(4) : null; });
  assert.deepEqual(first, before);
});
