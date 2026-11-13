// OS ALHEIOS DA TORRE DA TV VARMINHO (3ª dungeon do Outro Lado; docs/TORRE-TRANSMISSAO.md §2). Modelos feitos no
// Blender MCP em peças rígidas (tools/blender/npc_rastropoda.py e npc_bilu.py → public/npcs), animados aqui em código.
//  - RASTROPODA (wiki "Rastropoda"; ep. 7 de Sinais do Outro Lado): a lesma de ~3 m, muitas patinhas e duas garras
//    longas. Alheio CAMUFLADO: INVISÍVEL — só se vê um tremor no ar e o rastro de gosma; fica visível coberto de PÓ
//    (os sacos de FARINHA da sala, pve/Dungeon.js) e por um instante quando apanha. Pula do teto em cima da vítima e
//    solta gás ácido (cânone). Miniboss sorteado da Torre. PROPOSTA: os números e o tremor ao preparar o golpe.
//  - BILU (wiki "Bilu"): alto, magro, braços até o chão, cabeça de cogumelo e olhos verdes. RÁPIDO, mas FRACO: morre
//    fácil e VOLTA em outro lugar (o quarto escuro dos Becos; quem cuida da volta é o Dungeon). PROPOSTA: os números.
import * as THREE from 'three';
import { Marionette } from './npcs.js';
import { buildNpcModel } from '../models/npcRig.js';
import { toon } from '../models/rig.js';
import { applyHit } from './damage.js';

const GREEN = 0x7aff4a;

// juntas vazias (sem o .glb): um bloco cinza com as mesmas juntas, para o jogo não travar
function stubModel(names, size) {
  const root = new THREE.Group();
  const J = {};
  for (const n of names) { const o = new THREE.Object3D(); (n === 'body' ? root : J.body).add(o); J[n] = o; }
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), toon(0x5e6a58));
  m.position.y = size[1] / 2;
  J.body.add(m);
  return { root, J };
}

// ================================================================== RASTROPODA
export const RASTROPODA = {
  name: 'RASTROPODA', hp: 900, duration: Infinity, speed: 3.6, radius: 0.9, height: 1.4, restY: 0,
  element: 'transmissao', fxColor: 0x7aff4a, poolColor: 0x1e3a12, noPool: true,
  attacks: {
    claw: { windup: 0.42, active: 0.14, recovery: 0.45, range: 2.9, arc: 140, damage: 24, cd: 1.3, knockback: 2.5, sound: 'heavyPunch' },
    leap: { windup: 0.7, active: 0.2, recovery: 0.7, range: 2.8, arc: 360, damage: 36, cd: 8, knockback: 4, knockdown: true, hits: [1.15], sound: 'heavyPunch' },
    gas: { windup: 0.6, active: 0.1, recovery: 0.55, range: 3.6, arc: 360, damage: 16, cd: 7, knockback: 0.5, sound: 'bladeHit' },
    // TELECINESE (cânone: move objetos à distância): ergue um entulho e o arremessa onde a vítima ESTAVA (dá para sair)
    throw: { windup: 0.95, active: 0.1, recovery: 0.8, range: 0, arc: 0, damage: 0, cd: 6.5, knockback: 0, flight: 0.5, hit: 22, splash: 1.4 },
  },
  firstCd: { claw: 0.6, leap: 2.5, gas: 4, throw: 3.5 },
  ghost: 0.06, // a opacidade invisível (só o tremor)
};

export class Rastropoda extends Marionette {
  configFor() { return RASTROPODA; }
  buildModel() {
    this.isMarionette = false;
    this.isRastropoda = true;
    this.reveal = 0; // segundos ainda visível (farinha, golpe)
    this.trail = 0;
    const legNames = [];
    for (let i = 0; i < 3; i++) for (const s of ['L', 'R']) for (let k = 0; k < 3; k++) legNames.push(`leg${i}${s}${k}`);
    const names = ['body', 'seg0', 'seg1', 'seg2', 'head', 'armL', 'armR', 'foreL', 'foreR', ...legNames];
    const m = buildNpcModel('rastropoda', { outline: 0.014, noOutline: ['glow', 'goo'] });
    let root, J;
    if (m) { root = m.root; J = {}; for (const n of names) J[n] = m.joint(n) || new THREE.Object3D(); }
    else ({ root, J } = stubModel(names, [1.0, 0.9, 3.0]));
    J.legs = legNames.map((n) => J[n]);
    // tudo transparente: a opacidade muda a cada quadro (invisível ↔ revelado)
    this.mats = [];
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      o.material.transparent = true;
      o.material.depthWrite = false;
      this.mats.push({ m: o.material, outline: !!o.userData.isOutline });
    });
    return { root, joints: J };
  }

  chooseTarget() { this.target = this.owner.opponent; }

  // a farinha (ou o pó) gruda nele: visível por `t` segundos
  dust(t) {
    if (this.reveal < t) this.reveal = t;
  }

  hitBy(attacker, dmg, info) {
    this.dust(1.2);
    super.hitBy(attacker, dmg, info);
  }

  pickAttack(d) {
    const c = this.cds;
    if (d > 3.5 && d < 11 && c.leap <= 0) return 'leap';
    if (d > 4 && d < 13 && c.throw <= 0) return 'throw';
    if (d < 3.0 && c.gas <= 0 && Math.random() < 0.35) return 'gas';
    if (d < 2.7 && c.claw <= 0) return 'claw';
    return null;
  }

  attackSound(name) { return name === 'leap' ? 'fearGaze' : name === 'gas' ? 'drain' : name === 'throw' ? 'teleport' : 'swing'; }

  // o entulho da telecinese: sobe tremendo ao lado dele e voa até o chão onde a vítima estava
  updateThrow(dt) {
    const a = this.atk;
    if (a && a.name === 'throw' && this.state === 'attack' && !a.rock) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.6), toon(0x4a4038));
      m.position.set(this.pos.x + Math.sin(this.yaw + 1.2) * 1.2, 0.3, this.pos.z + Math.cos(this.yaw + 1.2) * 1.2);
      this.world.scene.add(m);
      a.rock = { m, from: m.position.clone(), t: 0 };
    }
    const R = this.rock || (a && a.rock);
    if (!R) return;
    R.t += dt;
    const W = RASTROPODA.attacks.throw;
    if (!R.to && R.t < W.windup) {
      R.m.position.y = 0.3 + (R.t / W.windup) * 2.2 + Math.sin(R.t * 40) * 0.04;
      R.m.rotation.y += dt * 3;
      return;
    }
    if (!R.to) {
      const tg = this.target;
      R.to = new THREE.Vector3(tg ? tg.pos.x : this.pos.x, 0.3, tg ? tg.pos.z : this.pos.z);
      R.start = R.m.position.clone();
      R.ft = 0;
      this.rock = R; // segue voando mesmo se o ataque acabar
      this.world.fx.ring(new THREE.Vector3(R.to.x, 0.06, R.to.z), { color: GREEN, radius: W.splash, life: W.flight, inner: 0.85 });
    }
    R.ft += dt;
    const k = Math.min(1, R.ft / W.flight);
    R.m.position.lerpVectors(R.start, R.to, k);
    R.m.position.y += Math.sin(k * Math.PI) * 1.2;
    R.m.rotation.x += dt * 9;
    if (k < 1) return;
    // caiu: quem estiver perto leva
    this.world.fx.burst(R.to.clone().setY(0.4), { count: 20, color: 0x4a4038, speed: 4, life: 0.6, size: 0.12, up: 2 });
    this.world.audio.play('heavyPunch', { volume: 0.7, pitch: 0.7 });
    for (const q of this.world.fighters.filter((f) => f !== this.owner && f.visible !== false)) {
      if (q.state === 'ko' || Math.hypot(q.pos.x - R.to.x, q.pos.z - R.to.z) > W.splash + (q.radius || 0.4)) continue;
      applyHit(this.world, this.owner, q, { damage: W.hit, kind: 'ability', element: 'transmissao', knockback: 2.4, sound: 'heavyPunch', color: GREEN, scale: 1.3 });
    }
    this.world.scene.remove(R.m);
    R.m.geometry.dispose();
    R.m.material.dispose();
    this.rock = null;
    if (a && a.rock === R) a.rock = null;
  }
  stepSpeed(d) { return this.cfg.speed * (d > 6 ? 1.4 : 1); }
  riseTime() { return 0.6; }
  risePose(k) { this.model.root.position.set(this.pos.x, 0, this.pos.z); this.model.root.scale.setScalar(Math.max(0.05, k)); }

  // PULO DO TETO (o ep. 7): some para cima, cai em cima de onde a vítima está
  restY() {
    const a = this.atk;
    if (!a || a.name !== 'leap' || this.state !== 'attack') return 0;
    const t = this.stateT;
    if (t < a.windup) return (t / a.windup) * 6;
    if (t < a.hits[0]) return 6 * (1 - (t - a.windup) / (a.hits[0] - a.windup));
    return 0;
  }
  bob() { return 0; }

  update(dt) {
    const a = this.atk;
    // no alto do pulo: escolhe onde cair (em cima do alvo)
    if (a && a.name === 'leap' && this.state === 'attack' && !a.landSet && this.stateT >= a.windup && this.target) {
      a.landSet = true;
      this.pos.x = this.target.pos.x;
      this.pos.z = this.target.pos.z;
      this.world.fx.ring(new THREE.Vector3(this.pos.x, 0.06, this.pos.z), { color: GREEN, radius: 2.6, life: a.hits[0] - a.windup, inner: 0.85 });
    }
    if (a && a.name === 'gas' && this.state === 'attack' && !a.puffed && this.stateT >= a.windup) {
      a.puffed = true;
      this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.8, this.pos.z), { count: 40, color: 0x8ad83a, kind: 'smoke', speed: 2.6, up: 0.6, life: 1.4, size: 1.1, grow: 1.5 });
    }
    this.reveal = Math.max(0, this.reveal - dt);
    this.updateThrow(dt);
    super.update(dt);
    if (!this.alive) return;
    // a opacidade: revelado (farinha/golpe) → inteiro; preparando um golpe → um tremor; no resto, quase nada
    const winding = this.state === 'attack' && this.atk && this.stateT < this.atk.windup;
    const op = this.state === 'die' ? 1 : this.reveal > 0 ? Math.min(1, 0.4 + this.reveal) : winding ? 0.32 : this.cfg.ghost;
    for (const x of this.mats) x.m.opacity = x.outline ? op * 0.6 : op;
    if (this.reveal > 0 && Math.random() < 0.3) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.9, this.pos.z), { count: 1, color: 0xf0ece0, speed: 0.4, life: 0.6, size: 0.12 });
  }

  dispose() {
    const R = this.rock || (this.atk && this.atk.rock);
    if (R && R.m.parent) { this.world.scene.remove(R.m); R.m.geometry.dispose(); R.m.material.dispose(); }
    this.rock = null;
    super.dispose();
  }

  // o rastro de gosma verde: o jeito de seguir o invisível
  scytheTrail(px, pz) {
    this.trail += Math.hypot(this.pos.x - px, this.pos.z - pz);
    if (this.trail < 0.7) return;
    this.trail = 0;
    this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.05, this.pos.z), { count: 3, color: 0x4aaa20, speed: 0.2, up: 0, life: 2.5, size: 0.22, gravity: 0 });
  }

  swingFx(a) {
    if (a.name !== 'claw') return;
    this.world.fx.slash(new THREE.Vector3(this.pos.x, 1.0, this.pos.z), this.yaw, { color: 0xb8ffa0, radius: a.range, arc: 2.4, life: 0.22, width: 0.3, roll: 0.3 });
  }

  onDestroyed() {}

  // a lesma ondula, as patinhas em onda, as garras sobem e cortam
  pose() {
    const J = this.model.joints;
    this.model.root.rotation.y = this.yaw;
    const t = this.t;
    const walk = this.state === 'chase' ? 1 : 0.3;
    J.seg0.rotation.y = Math.sin(t * 3) * 0.08;
    J.seg1.rotation.y = Math.sin(t * 3 - 1) * 0.16;
    J.seg2.rotation.y = Math.sin(t * 3 - 2) * 0.22;
    J.head.rotation.x = Math.sin(t * 2.2) * 0.08;
    J.legs.forEach((l, i) => { l.rotation.x = Math.sin(this.gait * 7 + i * 0.9) * 0.5 * walk; });
    let arm = -0.2 + Math.sin(t * 1.7) * 0.06;
    let fore = 0;
    const a = this.atk;
    if (a && this.state === 'attack') {
      const st = this.stateT;
      const k = Math.min(1, st / a.windup);
      if (a.name === 'claw') { arm = st < a.windup ? -0.2 - 0.7 * k : 0.5; fore = st < a.windup ? -0.5 * k : 0.6; }
      else if (a.name === 'leap') { arm = -0.9; fore = -0.4; }
      else if (a.name === 'gas') { J.head.rotation.x = -0.4 * k; }
    }
    J.armL.rotation.x = arm;
    J.armR.rotation.x = arm;
    J.foreL.rotation.x = fore;
    J.foreR.rotation.x = fore;
    this.updateFlash();
  }
}

// ================================================================== BILU
export const BILU = {
  name: 'BILU', hp: 70, duration: Infinity, speed: 7.4, radius: 0.45, height: 2.7, restY: 0,
  element: 'transmissao', fxColor: 0x5aff6a, poolColor: 0x0a120a, noPool: true,
  attacks: {
    swipe: { windup: 0.28, active: 0.12, recovery: 0.4, range: 2.4, arc: 130, damage: 14, cd: 1.0, knockback: 2 },
  },
  firstCd: { swipe: 0.5 },
};

export class Bilu extends Marionette {
  configFor() { return BILU; }
  buildModel() {
    this.isMarionette = false;
    this.isBilu = true;
    const names = ['body', 'hips', 'chest', 'head', 'armL', 'armR', 'elbowL', 'elbowR', 'legL', 'legR', 'kneeL', 'kneeR'];
    const m = buildNpcModel('bilu', { outline: 0.012, noOutline: ['glow'] });
    if (m) { const J = {}; for (const n of names) J[n] = m.joint(n) || new THREE.Object3D(); return { root: m.root, joints: J }; }
    const { root, J } = stubModel(names, [0.4, 2.6, 0.3]);
    return { root, joints: J };
  }

  chooseTarget() { this.target = this.owner.opponent; }
  pickAttack(d) { return d < 2.2 && this.cds.swipe <= 0 ? 'swipe' : null; }
  attackSound() { return 'swing'; }
  stepSpeed() { return this.cfg.speed; }
  riseTime() { return 0.5; }
  risePose(k) { this.model.root.position.set(this.pos.x, 0, this.pos.z); this.model.root.scale.set(1, Math.max(0.05, k), 1); }
  bob() { return Math.abs(Math.sin(this.gait * 2.6)) * 0.05; }
  scytheTrail() {}
  swingFx(a) {
    this.world.fx.slash(new THREE.Vector3(this.pos.x, 1.0, this.pos.z), this.yaw, { color: 0x9aff9a, radius: a.range, arc: 2.6, life: 0.2, width: 0.25, roll: -0.4 });
  }
  onDestroyed() {}

  // anda com as pernas compridas, os braços balançando quase no chão; o golpe é um arrastão do braço
  pose() {
    const J = this.model.joints;
    this.model.root.rotation.y = this.yaw;
    const ph = this.gait * 2.6;
    const walk = this.state === 'chase' ? 1 : 0;
    const s = Math.sin(ph);
    J.legL.rotation.x = s * 0.55 * walk;
    J.legR.rotation.x = -s * 0.55 * walk;
    J.kneeL.rotation.x = Math.max(0, -s) * 0.8 * walk;
    J.kneeR.rotation.x = Math.max(0, s) * 0.8 * walk;
    J.chest.rotation.x = 0.18 + Math.sin(this.t * 1.3) * 0.03;
    J.head.rotation.x = -0.15;
    let aL = -s * 0.35 * walk;
    let aR = s * 0.35 * walk;
    const a = this.atk;
    if (a && this.state === 'attack') {
      const k = Math.min(1, this.stateT / a.windup);
      aR = this.stateT < a.windup ? 0.8 * k : -1.4;
      J.chest.rotation.y = this.stateT < a.windup ? 0.3 * k : -0.3;
    } else J.chest.rotation.y = 0;
    J.armL.rotation.x = aL;
    J.armR.rotation.x = aR;
    J.elbowL.rotation.x = -0.1;
    J.elbowR.rotation.x = -0.1;
    this.updateFlash();
  }
}
