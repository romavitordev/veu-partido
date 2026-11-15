import * as THREE from 'three';

// RAGDOLL NO NOCAUTE (seção 10 do GUIA_TECNOLOGIAS_GAME_DEV.txt, item 9): quem cai nocauteado vira um boneco de pano
// com o Rapier DETERMINÍSTICO (@dimforge/rapier3d-deterministic-compat, Apache-2.0). É SÓ VISUAL: mexe nos ossos do
// modelo, nunca na posição, vida ou estado do lutador — o online em lockstep continua igual nos dois computadores
// (o netHash lê fighter.pos/health, que o ragdoll não toca). Sem Math.random (o online troca o aleatório por um semeado).
// O pacote (~4 MB com o WebAssembly embutido) só é baixado quando a primeira luta começa (preloadRagdoll); se ainda não
// chegou no nocaute, o lutador cai com a animação de sempre.
//
// O corpo: 11 cápsulas, uma por osso do esqueleto padrão (quadril, tronco, cabeça, braço/antebraço, coxa/canela).
// Joelhos e cotovelos são DOBRADIÇAS com limite (não dobram ao contrário); coluna e pescoço dobram só para frente e
// para trás, um pouco; ombros e quadris giram livres (com amortecimento). As peças não batem umas nas outras (só no
// chão): no nocaute os braços já estão colados no corpo e o choque entre elas faria o boneco "explodir".

let RAPIER = null;
let loading = null;

export function preloadRagdoll() {
  if (RAPIER) return Promise.resolve(RAPIER);
  if (loading) return loading;
  loading = import('@dimforge/rapier3d-deterministic-compat')
    .then(async (m) => {
      const R = m.default || m;
      await R.init();
      RAPIER = R;
      return R;
    })
    .catch((e) => {
      console.warn('Ragdoll indisponível (o nocaute usa a animação):', e);
      loading = null;
      return null;
    });
  return loading;
}

export const ragdollReady = () => !!RAPIER;

export const RAGDOLL = {
  gravity: 18, // um pouco mais pesado que a Terra: a queda lê melhor na luta
  step: 1 / 60,
  maxSteps: 4,
  minPush: 2.6, // nocaute sem empurrão (veneno, tempo): ainda cai para trás
  topple: 2.2, // quanto o alto do corpo vai à frente do quadril na direção do golpe (o corpo tomba)
  kneeMax: 2.5,
  elbowMax: 2.6,
  spineSwing: 0.7,
  neckSwing: 0.6,
};

// [osso, ponta (osso filho / extra) ou null, raio (fração da altura), pai, junta]
const SEGMENTS = [
  ['hips', 'sp', 0.1, null, null],
  ['sp', 'hd', 0.11, 'hips', 'spine'],
  ['hd', null, 0.075, 'sp', 'neck'],
  ['sL', 'eL', 0.04, 'sp', 'ball'],
  ['eL', 'handL', 0.035, 'sL', 'elbow'],
  ['sR', 'eR', 0.04, 'sp', 'ball'],
  ['eR', 'handR', 0.035, 'sR', 'elbow'],
  ['lL', 'kL', 0.055, 'hips', 'ball'],
  ['kL', 'footL', 0.045, 'lL', 'knee'],
  ['lR', 'kR', 0.055, 'hips', 'ball'],
  ['kR', 'footR', 0.045, 'lR', 'knee'],
];

const GROUP_BODY = (0x0002 << 16) | 0x0001; // o boneco só bate no chão
const GROUP_GROUND = (0x0001 << 16) | 0x0002;
const Y = new THREE.Vector3(0, 1, 0);
const X = new THREE.Vector3(1, 0, 0);
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const q1 = new THREE.Quaternion();
const q2 = new THREE.Quaternion();

const vec = (v) => ({ x: v.x, y: v.y, z: v.z });

// ângulo de a até b girando em torno de axis (com sinal)
function signedAngle(a, b, axis) {
  const c = v1.copy(a).cross(b);
  return Math.atan2(c.dot(axis), a.dot(b));
}

export class Ragdoll {
  constructor(fighter) {
    const R = RAPIER;
    const rig = fighter.rig;
    this.rig = rig;
    this.acc = 0;
    const J = rig.joints;
    const B = rig.bones || {};
    rig.root.updateMatrixWorld(true);
    const wp = (o) => o.getWorldPosition(new THREE.Vector3());
    const P = {};
    for (const [name] of SEGMENTS) P[name] = wp(J[name]);
    // pontas que o esqueleto pode não ter (mão/pé extras): continuam o osso de cima
    const tip = (name, child, from) => (child && J[child] ? P[child] : child && B[child] ? wp(B[child]) : P[name].clone().add(v2.copy(P[name]).sub(P[from])));
    const legLen = P.lL.distanceTo(P.kL) * 2;
    const H = Math.max(0.8, legLen + P.hips.distanceTo(P.hd) * 1.3);
    this.H = H;

    const world = new R.World({ x: 0, y: -RAGDOLL.gravity, z: 0 });
    world.timestep = RAGDOLL.step;
    this.world = world;
    const gy = Number.isFinite(fighter.groundY) ? fighter.groundY : 0;
    const ground = world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(fighter.pos.x, gy - 0.5, fighter.pos.z));
    world.createCollider(R.ColliderDesc.cuboid(60, 0.5, 60).setFriction(0.9).setCollisionGroups(GROUP_GROUND), ground);

    // empurrão: o que o golpe deu (fighter.vel) + tombo do alto do corpo; sem empurrão, cai para trás
    const vel = fighter.vel.clone();
    const flat = v2.set(vel.x, 0, vel.z);
    let dir;
    if (flat.length() > 1) dir = flat.clone().normalize();
    else {
      dir = new THREE.Vector3(-Math.sin(fighter.yaw), 0, -Math.cos(fighter.yaw));
      vel.addScaledVector(dir, RAGDOLL.minPush);
    }
    const hipsY = P.hips.y;

    this.parts = {};
    const order = [];
    for (const [name, child, rf, parent, joint] of SEGMENTS) {
      const a = P[name];
      const b = name === 'hd' ? a.clone().add(v2.copy(P.hd).sub(P.sp).normalize().multiplyScalar(0.2 * H)) : tip(name, child, name === 'eL' ? 'sL' : name === 'eR' ? 'sR' : name === 'kL' ? 'lL' : name === 'kR' ? 'lR' : 'hips');
      const seg = v2.copy(b).sub(a);
      const len = Math.max(0.02, seg.length());
      const r = rf * H;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const rise = (mid.y - hipsY) / H;
      const lv = vel.clone().addScaledVector(dir, RAGDOLL.topple * Math.max(0, rise));
      const body = world.createRigidBody(R.RigidBodyDesc.dynamic()
        .setTranslation(mid.x, mid.y, mid.z)
        .setLinvel(lv.x, lv.y, lv.z)
        .setLinearDamping(0.3)
        .setAngularDamping(name === 'hd' ? 3 : 1.6)
        .setCcdEnabled(name === 'sp' || name === 'hips'));
      // o corpo começa SEM rotação (os eixos locais das peças coincidem — a dobradiça usa o mesmo eixo nos dois lados);
      // a cápsula é que vai inclinada dentro dele
      const capQ = new THREE.Quaternion().setFromUnitVectors(Y, seg.normalize());
      world.createCollider(R.ColliderDesc.capsule(Math.max(0.01, len / 2 - r), r)
        .setRotation({ x: capQ.x, y: capQ.y, z: capQ.z, w: capQ.w })
        .setDensity(name === 'hips' || name === 'sp' ? 1.4 : 1)
        .setFriction(0.9)
        .setRestitution(0.05)
        .setCollisionGroups(GROUP_BODY), body);
      const bone = J[name];
      const part = { name, body, bone, mid0: mid, boneQ0: bone.getWorldQuaternion(new THREE.Quaternion()), head0: a.clone(), dir0: seg.clone(), b };
      this.parts[name] = part;
      order.push(part);
      if (!parent) continue;
      const pp = this.parts[parent];
      const pivot = a;
      const a1 = vec(v1.copy(pivot).sub(pp.mid0));
      const a2 = vec(v2.copy(pivot).sub(mid));
      let jd;
      let limits = null;
      if (joint === 'ball') {
        jd = R.JointData.spherical(a1, a2);
      } else {
        // eixo da dobradiça no mundo: o X do personagem levado pelo osso de cima (é em torno dele que a pose dobra o
        // joelho e o cotovelo: glbRig applyPose → bone = A·qE·B)
        const rest = rig.rest && rig.rest[name];
        const parentQ = bone.parent.getWorldQuaternion(q1);
        const axis = rest ? X.clone().applyQuaternion(q2.copy(parentQ).multiply(rest.A)) : X.clone().applyQuaternion(rig.root.quaternion);
        if (joint === 'elbow') axis.negate(); // o cotovelo dobra com X negativo (clips.js), o joelho com positivo
        axis.normalize();
        if (joint === 'knee' || joint === 'elbow') {
          const max = joint === 'knee' ? RAGDOLL.kneeMax : RAGDOLL.elbowMax;
          const flex = Math.max(0, Math.min(max, signedAngle(pp.dir0, part.dir0, axis)));
          limits = [-flex, max - flex];
        } else {
          const s = joint === 'spine' ? RAGDOLL.spineSwing : RAGDOLL.neckSwing;
          limits = [-s, s];
        }
        jd = R.JointData.revolute(a1, a2, vec(axis));
      }
      const j = world.createImpulseJoint(jd, pp.body, body, true);
      if (limits && j.setLimits) j.setLimits(limits[0], limits[1]);
      if (j.setContactsEnabled) j.setContactsEnabled(false);
    }
    this.order = order;
    this.time = 0;
  }

  update(dt) {
    if (!this.world) return;
    this.acc = Math.min(this.acc + Math.max(0, dt), RAGDOLL.step * RAGDOLL.maxSteps);
    while (this.acc >= RAGDOLL.step) {
      this.world.step();
      this.acc -= RAGDOLL.step;
      this.time += RAGDOLL.step;
    }
    this.apply();
  }

  // ossos ← corpos (de cima para baixo na hierarquia: o pai já está no lugar quando o filho é posto)
  apply() {
    const root = this.rig.root;
    root.updateMatrixWorld(true);
    for (const p of this.order) {
      const t = p.body.translation();
      const r = p.body.rotation();
      q1.set(r.x, r.y, r.z, r.w);
      const bone = p.bone;
      if (p.name === 'hips') {
        // o quadril leva o corpo inteiro: posição = centro da peça + o deslocamento do osso, girado com ela
        v1.copy(p.head0).sub(p.mid0).applyQuaternion(q1).add(v2.set(t.x, t.y, t.z));
        bone.parent.worldToLocal(v1);
        bone.position.copy(v1);
      }
      q2.copy(q1).multiply(p.boneQ0); // rotação no mundo
      bone.parent.getWorldQuaternion(q1);
      bone.quaternion.copy(q1.invert().multiply(q2));
      bone.updateMatrixWorld(true);
    }
  }

  // onde o corpo está agora (centro do quadril), para testes e a câmera
  center(out = new THREE.Vector3()) {
    const t = this.parts.hips.body.translation();
    return out.set(t.x, t.y, t.z);
  }

  dispose() {
    if (!this.world) return;
    this.world.free();
    this.world = null;
  }
}

// começa o ragdoll de quem caiu (null se o Rapier ainda não chegou ou o modelo não tem o esqueleto padrão)
export function startRagdoll(fighter) {
  if (!RAPIER || !fighter.rig || !fighter.rig.skinned || !fighter.rig.joints) return null;
  try {
    return new Ragdoll(fighter);
  } catch (e) {
    console.warn('Ragdoll falhou (o nocaute usa a animação):', e);
    return null;
  }
}
