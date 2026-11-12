import * as THREE from 'three';
import { buildGamba } from '../models/gamba.js';
import { applyHit } from './damage.js';

// O COMPANHEIRO QUE LUTA JUNTO (pedido do dono, 2026-11-12: "o pet não atacará em todos os ataques, mas irá
// acompanhá-la, às vezes subindo no seu ombro, às vezes andando ao seu lado, e combaterão juntos"). Primeiro: o GAMBÁ
// da Artemis. Depois servirá à Mia e ao Lupi (def.companion = { kind: 'gamba', ... }).
// Vive pendurado no rig.root do lutador (some, anda e é descartado junto com ele); as posições são calculadas no espaço
// local do lutador (frente +Z, esquerda +X).
//   ombro  — encolhido no ombro esquerdo
//   chão   — anda/corre ao lado esquerdo, acompanhando o passo dela
//   pulo   — salto em arco entre os dois
//   bote   — salta no alvo, morde (dano pequeno + sangramento) e volta
//   bolso  — escondido no bolso do macacão (cânone: ele se esconde quando há perigo): quando ela cai, é agarrada ou
//            lançada, e no fim do round
// Entre um e outro troca sozinho a cada poucos segundos (só quando ela está parada ou andando, nunca no meio de um golpe).

const KINDS = { gamba: buildGamba };
const FLOOR_SPOT = new THREE.Vector3(0.7, 0, 0.2);
const DANGER = new Set(['ko', 'downed', 'grabbed', 'pulled', 'stun']);
const _v = new THREE.Vector3();

export function updateCompanion(f, dt) {
  const def = f.def.companion;
  if (!def || !f.rig || !f.rig.root) return;
  let c = f.companion;
  if (!c) {
    const build = KINDS[def.kind];
    if (!build) return;
    const m = build();
    f.rig.root.add(m.root);
    c = f.companion = {
      def, m, mode: 'ombro', t: 0, next: 4 + Math.random() * 4, cd: 0,
      hop: null, bite: null, gait: 0, last: new THREE.Vector3(),
      leap: (victim, o) => startBite(f, c, victim, o),
    };
    c.m.root.position.copy(shoulderLocal(f));
  }
  tick(f, c, dt);
}

// o ombro esquerdo no espaço local do lutador (um pouco acima, para ele sentar em cima)
function shoulderLocal(f) {
  const j = f.rig.joints && (f.rig.joints.sL || f.rig.joints.chest);
  if (!j) return new THREE.Vector3(0.2, 1.5, 0);
  j.getWorldPosition(_v);
  _v.y += 0.06;
  return f.rig.root.worldToLocal(_v.clone());
}

function hopTo(c, to, time = 0.38, height = 0.45, then = null) {
  c.hop = { from: c.m.root.position.clone(), to, t: 0, time, height, then };
}

function startBite(f, c, victim, o = {}) {
  if (!victim || victim.state === 'ko' || c.bite || c.mode === 'bolso') return false;
  c.bite = { victim, t: 0, from: c.m.root.position.clone(), damage: o.damage ?? c.def.damage ?? 14, bleed: o.bleed ?? c.def.bleed, stun: o.stun || 0, label: o.label };
  c.hop = null;
  c.mode = 'bote';
  f.world.audio.play('swing', { pitch: 2.2, volume: 0.45 });
  return true;
}

function tick(f, c, dt) {
  const { m } = c;
  const root = m.root;
  c.t += dt;
  c.cd = Math.max(0, c.cd - dt);
  // perigo: para o bolso (some num pulinho para dentro)
  const danger = DANGER.has(f.state);
  if (danger && c.mode !== 'bolso') {
    c.mode = 'bolso';
    c.hop = null;
    c.bite = null;
    root.visible = false;
    if (f.state !== 'ko') f.world.fx.burst(f.chestPos(), { count: 5, color: 0x8c8a88, speed: 1, life: 0.3, size: 0.06 });
  }
  if (c.mode === 'bolso') {
    if (danger) return;
    // saiu do perigo: volta para o ombro depois de um instante
    c.next = Math.min(c.next, 0.6);
    c.next -= dt;
    if (c.next > 0) return;
    root.visible = true;
    root.position.copy(shoulderLocal(f));
    c.mode = 'ombro';
    c.next = 5 + Math.random() * 5;
  }

  let gait = 0, crouch = 0, open = 0;
  if (c.bite) {
    // BOTE: arco até o peito do alvo, morde, volta para o chão ao lado dela
    const b = c.bite;
    b.t += dt;
    const v = b.victim;
    const go = 0.32;
    if (!b.done) {
      const target = f.rig.root.worldToLocal(v.chestPos());
      const k = Math.min(1, b.t / go);
      root.position.lerpVectors(b.from, target, k);
      root.position.y += Math.sin(k * Math.PI) * 0.5;
      faceLocal(root, target.clone().sub(b.from));
      open = k;
      gait = 1;
      if (k >= 1) {
        b.done = true;
        b.t = 0;
        b.at = root.position.clone();
        if (v.state !== 'ko' && !v.isInvulnerable()) {
          const res = applyHit(f.world, f, v, { damage: b.damage, kind: 'ability', element: 'sangue', knockback: 0.2, hitstun: 0.25 + b.stun, sound: 'bladeHit', color: 0xc01828, scale: 0.7, dir: _v.subVectors(v.pos, f.pos).setY(0).normalize().clone() });
          if (typeof res === 'number' && res > 0) {
            if (b.bleed && v.state !== 'ko') v.applyBleed(b.bleed, f);
            if (b.stun && v.state !== 'ko') v.stun(b.stun, 'stagger');
            v.notify(b.label || 'MORDIDA DO GAMBÁ', true);
            f.world.fx.burst(v.chestPos(), { count: 8, color: 0xc01828, speed: 1.8, life: 0.4, size: 0.08, gravity: 4 });
          }
        }
      }
    } else {
      // fica pendurado um instante e cai de volta para o lado dela
      const back = 0.42;
      if (b.t < 0.12) { open = 1; root.position.copy(b.at); }
      else {
        const k = Math.min(1, (b.t - 0.12) / back);
        root.position.lerpVectors(b.at, FLOOR_SPOT, k);
        root.position.y += Math.sin(k * Math.PI) * 0.6;
        faceLocal(root, FLOOR_SPOT.clone().sub(b.at));
        gait = 1;
        if (k >= 1) { c.bite = null; c.mode = 'chão'; c.next = 3 + Math.random() * 4; root.position.copy(FLOOR_SPOT); }
      }
    }
  } else if (c.hop) {
    const h = c.hop;
    h.t += dt;
    const k = Math.min(1, h.t / h.time);
    const to = typeof h.to === 'function' ? h.to() : h.to;
    root.position.lerpVectors(h.from, to, k);
    root.position.y += Math.sin(k * Math.PI) * h.height;
    faceLocal(root, to.clone().sub(h.from));
    gait = 0.6;
    if (k >= 1) { c.hop = null; if (h.then) h.then(); }
  } else if (c.mode === 'ombro') {
    root.position.copy(shoulderLocal(f));
    root.rotation.set(0, 0, 0);
    crouch = 1;
  } else if (c.mode === 'chão') {
    // anda ao lado dela: a cena do lutador já leva o corpo, o passo vem da velocidade dela
    const speed = Math.hypot(f.vel.x, f.vel.z);
    gait = Math.min(1, speed / 7);
    root.position.lerp(_v.copy(FLOOR_SPOT).setY(0), Math.min(1, dt * 8));
    root.position.y = f.onGround ? 0 : Math.max(0, root.position.y - dt * 4); // no pulo dela fica no chão do corpo
    root.rotation.set(0, 0, 0);
  }

  // troca de lugar sozinho (ombro ↔ chão), só com ela calma
  if (!c.bite && !c.hop && (c.mode === 'ombro' || c.mode === 'chão')) {
    c.next -= dt;
    const calm = f.state === 'idle';
    if (c.next <= 0 && calm && f.onGround) {
      if (c.mode === 'ombro') { c.mode = 'pulo'; hopTo(c, FLOOR_SPOT.clone(), 0.4, 0.3, () => { c.mode = 'chão'; }); }
      else { c.mode = 'pulo'; hopTo(c, () => shoulderLocal(f), 0.38, 0.35, () => { c.mode = 'ombro'; }); }
      c.next = 6 + Math.random() * 7;
    }
  }
  m.update(dt, { gait, crouch, open });
}

function faceLocal(root, dir) {
  if (dir.lengthSq() < 1e-6) return;
  root.rotation.set(0, Math.atan2(dir.x, dir.z), 0);
}

// a passiva do companheiro (passives.js → companionAttack): nem todo golpe — uma chance por golpe físico que acerta,
// com um intervalo mínimo entre os botes
export function companionStrike(f, victim, passive) {
  const c = f.companion;
  if (!c || c.cd > 0 || c.bite || c.mode === 'bolso') return;
  if (Math.random() > (passive.chance ?? 0.3)) return;
  if (startBite(f, c, victim)) c.cd = passive.interval ?? 6;
}

// novo round / volta da tela de pausa: de volta ao ombro
export function resetCompanion(f) {
  const c = f.companion;
  if (!c) return;
  c.mode = 'ombro';
  c.hop = null;
  c.bite = null;
  c.cd = 2;
  c.next = 4 + Math.random() * 4;
  c.m.root.visible = true;
}
