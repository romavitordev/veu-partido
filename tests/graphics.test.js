import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { fixMetal } from '../src/arena/glbArena.js';
import { AO } from '../src/render/postfx.js';
import { gfxProfile } from '../src/config/settings.js';

// vistoria de gráficos (2026-11-15): o metal falso das peças do Kenney e a sombra de contato só na qualidade alta
test('metal falso: madeira/pedra voltam a 0, metal de verdade continua metal', () => {
  const wood = new THREE.MeshStandardMaterial({ name: 'woodBark', metalness: 0.4 });
  const chrome = new THREE.MeshStandardMaterial({ name: 'MAT_METAL_chrome_rim', metalness: 0.4 });
  fixMetal(wood); fixMetal(chrome);
  assert.equal(wood.metalness, 0);
  assert.equal(chrome.metalness, 0.4);
  const toon = new THREE.MeshToonMaterial({ name: 'x' });
  fixMetal(toon); // não é Standard: não mexe
  assert.ok(!toon.userData.metalFixed);
});

test('sombra de contato: só na alta, em meia resolução', () => {
  assert.equal(gfxProfile('high').ao, true);
  assert.ok(!gfxProfile('medium').ao && !gfxProfile('low').ao);
  assert.ok(AO.resolution <= 0.5 && AO.intensity > 0 && AO.intensity <= 1);
});
