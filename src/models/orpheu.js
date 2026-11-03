import * as THREE from 'three';
import { toon, glowMat } from './rig.js';

// ORPHEU, o urutau da Beatrice, VOANDO (a habilidade Voo do Orpheu): o mesmo pássaro do ombro (prop_orpheu no GLB),
// pardo com as listras escuras, a cabeça larga, os olhos amarelos enormes, as asas abertas batendo e a cauda longa.
// Retorna { root, update(t, flap), dispose } — update bate as asas (flap 1 = voando, 0 = planando/bicando).
export function buildOrpheu() {
  const root = new THREE.Group();
  const brown = toon(0x8a7458);
  const dark = toon(0x4a3a2a);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), brown);
  body.scale.set(0.9, 0.85, 1.5);
  root.add(body);
  for (let i = 0; i < 4; i++) { // as listras das penas (camuflagem de galho)
    const s = new THREE.Mesh(new THREE.TorusGeometry(0.085 - i * 0.006, 0.006, 4, 14), dark);
    s.position.z = 0.06 - i * 0.045;
    root.add(s);
  }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), brown);
  head.scale.set(1.15, 0.95, 1);
  head.position.set(0, 0.04, 0.16);
  root.add(head);
  const eyeMat = glowMat(0xf2c230, 0.95);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), eyeMat);
    eye.position.set(s * 0.038, 0.055, 0.215);
    root.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), toon(0x0a0a0c));
    pupil.position.set(s * 0.04, 0.055, 0.238);
    root.add(pupil);
  }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.035, 6), dark);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.015, 0.24);
  root.add(beak);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.22), brown);
  tail.position.set(0, -0.01, -0.24);
  root.add(tail);
  const wings = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(s * 0.07, 0.03, 0.02);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.16), brown);
    wing.position.x = s * 0.15;
    pivot.add(wing);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.014, 0.12), dark);
    tip.position.set(s * 0.26, 0, -0.02);
    pivot.add(tip);
    root.add(pivot);
    wings.push({ pivot, s });
  }
  return {
    root,
    update(t, flap = 1) {
      const a = flap ? Math.sin(t * 22) * 0.75 : 0.25;
      for (const w of wings) w.pivot.rotation.z = w.s * a;
    },
    dispose() {
      root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    },
  };
}
