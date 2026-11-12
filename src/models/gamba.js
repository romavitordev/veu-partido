import * as THREE from 'three';
import { toon, part } from './rig.js';

// O GAMBÁ DA ARTEMIS (wiki "Artemis": um saruê — o gambá-de-orelha-branca brasileiro — que vive nos bolsos do macacão
// dela e se esconde quando há perigo; foi ele que a salvou). Montado em código, como o Orpheu da Beatrice: corpo
// cinza-mesclado, a cara branca com a faixa escura dos olhos, o focinho comprido rosado, as orelhas pretas de ponta
// clara, as patas escuras e a cauda longa e pelada, rosada na ponta. Frente para +Z, pés em y = 0.
// Retorna { root, update(dt, { gait, crouch, open }), dispose }:
//   gait  — 0 parado … 1 correndo (as patas alternam, a cauda balança)
//   crouch — 0 de pé … 1 encolhido (no ombro, agarrado)
//   open  — boca aberta (0…1), para a mordida
export function buildGamba() {
  const root = new THREE.Group();
  const grey = toon(0x8c8a88);
  const dark = toon(0x2a2828);
  const white = toon(0xe8e4dc);
  const pink = toon(0xd89a9a);
  const body = new THREE.Group();
  body.position.y = 0.11;
  root.add(body);
  const torso = part(new THREE.SphereGeometry(0.075, 12, 9), 0, { mat: grey });
  torso.scale.set(0.9, 0.85, 1.55);
  body.add(torso);
  // o dorso mais escuro (o pelo de guarda)
  const back = part(new THREE.SphereGeometry(0.06, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.45), 0, { mat: toon(0x5e5c5a), outline: false });
  back.scale.set(1.05, 0.9, 1.7);
  back.position.y = 0.02;
  body.add(back);
  // a cabeça: cara branca, focinho comprido, a faixa escura dos olhos
  const head = new THREE.Group();
  head.position.set(0, 0.03, 0.12);
  body.add(head);
  const skull = part(new THREE.SphereGeometry(0.045, 10, 8), 0, { mat: white });
  skull.scale.set(1, 0.9, 1.1);
  head.add(skull);
  const snout = part(new THREE.ConeGeometry(0.028, 0.085, 8), 0, { mat: white });
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.012, 0.06);
  head.add(snout);
  const nose = part(new THREE.SphereGeometry(0.011, 8, 6), 0, { mat: pink, outline: false });
  nose.position.set(0, -0.012, 0.104);
  head.add(nose);
  const jaw = new THREE.Group();
  jaw.position.set(0, -0.025, 0.02);
  head.add(jaw);
  const jawM = part(new THREE.ConeGeometry(0.018, 0.07, 6), 0, { mat: white, outline: false });
  jawM.rotation.x = Math.PI / 2;
  jawM.position.z = 0.035;
  jaw.add(jawM);
  for (const s of [-1, 1]) {
    const mask = part(new THREE.SphereGeometry(0.016, 8, 6), 0, { mat: dark, outline: false });
    mask.scale.set(1, 0.7, 1.4);
    mask.position.set(s * 0.024, 0.012, 0.03);
    head.add(mask);
    const eye = part(new THREE.SphereGeometry(0.007, 6, 5), 0, { mat: toon(0x050505), outline: false });
    eye.position.set(s * 0.026, 0.014, 0.043);
    head.add(eye);
    const ear = part(new THREE.SphereGeometry(0.022, 8, 6), 0, { mat: dark });
    ear.scale.set(1, 1.1, 0.35);
    ear.position.set(s * 0.032, 0.042, -0.01);
    ear.rotation.z = s * -0.4;
    head.add(ear);
    const tip = part(new THREE.SphereGeometry(0.01, 6, 5), 0, { mat: white, outline: false });
    tip.position.set(s * 0.04, 0.06, -0.012);
    head.add(tip);
  }
  // as patas
  const legs = [];
  for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const hip = new THREE.Group();
    hip.position.set(x * 0.045, -0.03, z * 0.065);
    body.add(hip);
    const leg = part(new THREE.CylinderGeometry(0.012, 0.01, 0.08, 6), 0, { mat: dark });
    leg.position.y = -0.04;
    hip.add(leg);
    const paw = part(new THREE.SphereGeometry(0.014, 6, 5), 0, { mat: pink, outline: false });
    paw.scale.set(1, 0.6, 1.3);
    paw.position.set(0, -0.08, 0.006);
    hip.add(paw);
    legs.push({ hip, phase: (x > 0) === (z > 0) ? 0 : Math.PI });
  }
  // a cauda longa e pelada (cinza escura na base, rosada no resto), em segmentos
  const tail = [];
  let parent = body;
  const segs = 7;
  for (let i = 0; i < segs; i++) {
    const j = new THREE.Group();
    j.position.set(0, i === 0 ? 0.0 : 0, i === 0 ? -0.11 : -0.04);
    parent.add(j);
    const r0 = 0.014 * (1 - i / segs) + 0.004;
    const seg = part(new THREE.CylinderGeometry(r0 * 0.85, r0, 0.045, 6), 0, { mat: i < 2 ? dark : pink, outline: false });
    seg.rotation.x = Math.PI / 2;
    seg.position.z = -0.02;
    j.add(seg);
    tail.push(j);
    parent = j;
  }
  let clock = Math.random() * 10;
  return {
    root,
    head,
    update(dt, { gait = 0, crouch = 0, open = 0 } = {}) {
      clock += dt * (4 + gait * 10);
      for (const l of legs) l.hip.rotation.x = Math.sin(clock + l.phase) * 0.7 * gait - crouch * 0.9 * Math.sign(l.hip.position.z);
      body.position.y = 0.11 - crouch * 0.05 + Math.abs(Math.sin(clock)) * 0.012 * gait;
      body.rotation.x = crouch * 0.15;
      head.rotation.x = -crouch * 0.2 + Math.sin(clock * 0.37) * 0.08 * (1 - gait);
      head.rotation.y = Math.sin(clock * 0.21) * 0.35 * (1 - gait);
      jaw.rotation.x = open * 0.7;
      for (let i = 0; i < tail.length; i++) {
        tail[i].rotation.y = Math.sin(clock * 0.8 - i * 0.6) * (0.12 + gait * 0.12);
        tail[i].rotation.x = (i === 0 ? 0.35 : -0.12) + crouch * 0.25; // a cauda desce e a ponta se enrola um pouco
      }
    },
    dispose() {
      root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    },
  };
}
