import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { disposeRigResources } from '../src/models/glbRig.js';

test('disposeRigResources frees owned resources and preserves shared geometry and textures', () => {
  const root = new THREE.Group();
  const ownedGeometry = new THREE.BoxGeometry();
  const sharedGeometry = new THREE.SphereGeometry();
  const ownedTexture = new THREE.Texture();
  const sharedTexture = new THREE.Texture();
  const ownedMaterial = new THREE.MeshBasicMaterial({ map: ownedTexture });
  ownedMaterial.userData.sharedMap = false;
  const sharedMaterial = new THREE.MeshBasicMaterial({ map: sharedTexture });
  sharedMaterial.userData.sharedMap = true;
  const ownedCounts = { geometry: 0, texture: 0, material: 0 };
  const sharedCounts = { geometry: 0, texture: 0 };

  ownedGeometry.addEventListener('dispose', () => ownedCounts.geometry++);
  ownedTexture.addEventListener('dispose', () => ownedCounts.texture++);
  ownedMaterial.addEventListener('dispose', () => ownedCounts.material++);
  sharedGeometry.addEventListener('dispose', () => sharedCounts.geometry++);
  sharedTexture.addEventListener('dispose', () => sharedCounts.texture++);

  const ownedMesh = new THREE.Mesh(ownedGeometry, ownedMaterial);
  const duplicateOwnedMesh = new THREE.Mesh(ownedGeometry, ownedMaterial);
  const sharedMesh = new THREE.Mesh(sharedGeometry, sharedMaterial);
  sharedMesh.userData.sharedGeometry = true;
  root.add(ownedMesh, duplicateOwnedMesh, sharedMesh);

  disposeRigResources(root);

  assert.deepEqual(ownedCounts, { geometry: 1, texture: 1, material: 1 });
  assert.deepEqual(sharedCounts, { geometry: 0, texture: 0 });
});

// as cópias (Devorados menores, Embaralhar, hologramas) liberam as peças procedurais e os materiais clonados, mas não a
// geometria do .glb, que é a mesma do lutador (P0 travamentos, 2026-11-07: ~20 geometrias por cópia ficavam na placa)
test('disposeClonedRig libera a geometria própria e preserva a compartilhada', async () => {
  const THREE = await import('three');
  const { disposeClonedRig } = await import('../src/models/glbRig.js');
  const root = new THREE.Group();
  const shared = new THREE.BoxGeometry();
  const own = new THREE.BoxGeometry();
  const mat = new THREE.MeshBasicMaterial();
  const body = new THREE.Mesh(shared, mat);
  body.userData.sharedGeometry = true;
  const knife = new THREE.Mesh(own, new THREE.MeshBasicMaterial());
  root.add(body, knife);
  const freed = new Set();
  for (const x of [shared, own, mat, knife.material]) x.addEventListener('dispose', () => freed.add(x));
  disposeClonedRig(root);
  assert.ok(freed.has(own), 'a peça procedural é liberada');
  assert.ok(!freed.has(shared), 'a geometria do .glb fica');
  assert.ok(freed.has(mat) && freed.has(knife.material), 'os materiais clonados são liberados');
});
