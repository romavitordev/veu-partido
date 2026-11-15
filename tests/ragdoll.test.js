import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { preloadRagdoll, startRagdoll, RAGDOLL } from '../src/physics/ragdoll.js';

// esqueleto padrão do jogo (glbRig.js), em pé, de frente para +z, com os mesmos dados de repouso
function fakeFighter(yaw = 0.6) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const bone = (name, parent, x, y, z) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); parent.add(b); return b; };
  const hips = bone('hips', body, 0, 1.0, 0);
  const sp = bone('sp', hips, 0, 0.12, 0);
  const neck = bone('neck', sp, 0, 0.45, 0);
  const hd = bone('hd', neck, 0, 0.08, 0);
  const sL = bone('sL', sp, 0.2, 0.4, 0);
  const eL = bone('eL', sL, 0, -0.3, 0);
  const handL = bone('handL', eL, 0, -0.27, 0);
  const sR = bone('sR', sp, -0.2, 0.4, 0);
  const eR = bone('eR', sR, 0, -0.3, 0);
  const handR = bone('handR', eR, 0, -0.27, 0);
  const lL = bone('lL', hips, 0.1, -0.05, 0);
  const kL = bone('kL', lL, 0, -0.45, 0);
  const footL = bone('footL', kL, 0, -0.45, 0);
  const lR = bone('lR', hips, -0.1, -0.05, 0);
  const kR = bone('kR', lR, 0, -0.45, 0);
  const footR = bone('footR', kR, 0, -0.45, 0);
  root.updateMatrixWorld(true);
  const joints = { hips, sp, hd, sL, eL, sR, eR, lL, kL, lR, kR };
  const rest = {};
  for (const [n, b] of Object.entries(joints)) rest[n] = { A: b.parent.getWorldQuaternion(new THREE.Quaternion()).invert(), B: b.getWorldQuaternion(new THREE.Quaternion()), pos: b.position.clone() };
  // um pouco dobrado, como num golpe
  kL.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.4);
  eR.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.6);
  root.position.set(2, 0, -1);
  root.rotation.y = yaw;
  root.updateMatrixWorld(true);
  const rig = { root, body, joints, rest, bones: { neck, handL, handR, footL, footR }, skinned: true };
  return { rig, pos: new THREE.Vector3(2, 0, -1), vel: new THREE.Vector3(3, 2, 1), yaw, groundY: 0, health: 0, visible: true };
}

function run(fighter, seconds) {
  const rd = startRagdoll(fighter);
  assert.ok(rd, 'o ragdoll começou');
  const frames = Math.round(seconds * 60);
  for (let i = 0; i < frames; i++) rd.update(1 / 60);
  return rd;
}

test('ragdoll: cai, assenta no chão, joelho não dobra ao contrário, não mexe no lutador e repete igual', async () => {
  assert.ok(await preloadRagdoll(), 'Rapier carregou no Node');
  const f = fakeFighter();
  const before = { pos: f.pos.clone(), health: f.health };
  const rd = run(f, 3);
  const c = rd.center();
  assert.ok(c.y < 0.35 && c.y > 0, `quadril no chão (y=${c.y.toFixed(2)})`);
  assert.ok(c.distanceTo(new THREE.Vector3(2, 0, -1)) < 4, 'não voou longe');
  const wp = (o) => o.getWorldPosition(new THREE.Vector3());
  for (const b of Object.values(f.rig.joints)) {
    const p = wp(b);
    assert.ok(Number.isFinite(p.x + p.y + p.z) && p.y > -0.08, `osso ${b.name} acima do chão`);
  }
  // joelho: dobra pelo eixo do personagem levado pela coxa, nunca negativo
  const J = f.rig.joints;
  for (const [up, low, foot] of [['lL', 'kL', 'footL'], ['lR', 'kR', 'footR']]) {
    const axis = new THREE.Vector3(1, 0, 0).applyQuaternion(J[low].parent.getWorldQuaternion(new THREE.Quaternion()).multiply(f.rig.rest[low].A));
    const thigh = wp(J[low]).sub(wp(J[up]));
    const shin = wp(f.rig.bones[foot]).sub(wp(J[low]));
    const flex = Math.atan2(thigh.clone().cross(shin).dot(axis), thigh.dot(shin));
    assert.ok(flex > -0.12 && flex < RAGDOLL.kneeMax + 0.12, `${low} dobrou ${flex.toFixed(2)} rad`);
  }
  assert.deepEqual({ pos: f.pos, health: f.health }, before, 'só visual');
  rd.dispose();

  // determinístico: a mesma queda dá o mesmo resultado
  const a = run(fakeFighter(), 2);
  const b = run(fakeFighter(), 2);
  assert.deepEqual(a.center().toArray(), b.center().toArray());
  a.dispose();
  b.dispose();
});
