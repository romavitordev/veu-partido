// O ESPREITADOR — a IA do chefe por cima da CPU de luta (a CPU cuida da Pancada; aqui entram as habilidades do cânone) e
// os ARMÁRIOS do quarto (as frestas). Ver characters/bosses/espreitador.js para o cânone.
//
// ENIGMA DE MEDO (PROPOSTA de controle, fiel à fraqueza da wiki: "bloquear ou fechar sua fresta"):
//   · armário ABERTO = fresta com olhos; um golpe ou um tiro nele FECHA e TRANCA a porta (reabre sozinho depois de um tempo);
//   · quando ele quer fugir pelas frestas e não há nenhuma aberta, fica APAVORADO: treme, foge devagar, toma muito mais
//     dano e mostra o olho da boca — os tiros nele valem ainda mais (o tiro do Kaiser no olho).
// DRENAR ENERGIA: avisa (os olhos acendem e o som do Medo), depois drena a Sanidade de quem está no campo de visão dele
// e olhando para ele. Escapa quem se DEFENDE (cobre os olhos), esquiva, sai do cone ou se esconde atrás de algo.
import * as THREE from 'three';
import { yawTo, distXZ, angleDiff, forwardFromYaw, turnTowards } from '../core/util.js';
import { applyHit } from '../combat/damage.js';
import { DanteClone } from '../combat/npcs.js';
import { resolveBody } from '../combat/positioning.js';
import { copiaOpts } from './devorado.js';

const DEG = Math.PI / 180;
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();

export const ESPREITADOR_CFG = {
  duel: [4.5, 7.5], // segundos de luta comum entre uma habilidade e outra
  gaze: { windup: 0.9, time: 3.0, range: 15, arc: 55, drain: 17, burn: 22, turn: 1.1 }, // drain: Sanidade/s; burn: vida/s sem Sanidade
  // warn: os OLHOS AMARELOS acendem na fresta por onde ele vai sair, este tanto antes do bote (feedback do dono)
  fresta: { hide: [1.6, 2.6], warn: 0.95, lunge: { speed: 13, time: 0.42, damage: 62, reach: 1.9 }, walk: 9.5, maxWalk: 2.4 },
  copia: { count: 2, max: 3, hp: 110 },
  fortify: { hold: 1.6, breakDamage: 110, reach: 1.4, hpMult: 2, dmgMult: 1.7 },
  terror: { time: 7, taken: 2.0, ranged: 1.6, speed: 2.2 },
  closet: { lockTime: 20 },
};

// ================================================================== ARMÁRIO (a fresta)
// Tem a interface de NPC enquanto está ABERTO (os golpes e tiros do jogador o acertam: combat/npcs.js) e sai da lista
// quando tranca (alive = false; volta a entrar ao reabrir).
export class Closet {
  constructor(world, owner, spot, idx) {
    this.world = world;
    this.owner = owner;
    this.idx = idx;
    this.isCloset = true;
    this.face = spot.face;
    const f = forwardFromYaw(spot.face, new THREE.Vector3());
    this.pos = new THREE.Vector3(spot.x + f.x * 0.42, 0, spot.z + f.z * 0.42); // a frente da porta (onde o golpe acerta)
    this.base = new THREE.Vector3(spot.x, 0, spot.z);
    this.radius = 0.75;
    this.height = 2.4;
    this.hp = 1;
    this.maxHp = 1;
    this.state = 'open';
    this.lockT = 0;
    this.openK = 1; // 0 fechado … 1 entreaberto
    this.alive = true;
    this.t = Math.random() * 5;
    this.build(spot);
    // o corpo é sólido (o .glb não tem estes armários: são do jogo)
    const W = 1.3; const D = 0.7;
    const alongX = Math.abs(Math.cos(spot.face)) > 0.5;
    this.box = { minX: spot.x - (alongX ? W : D) / 2, maxX: spot.x + (alongX ? W : D) / 2, minZ: spot.z - (alongX ? D : W) / 2, maxZ: spot.z + (alongX ? D : W) / 2, h: 2.4 };
    world.arena.boxes.push(this.box);
  }

  build(spot) {
    const g = new THREE.Group();
    const wood = new THREE.MeshToonMaterial({ color: 0x4a3020 });
    const woodLt = new THREE.MeshToonMaterial({ color: 0x6a4a30 });
    const dark = new THREE.MeshBasicMaterial({ color: 0x030203 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.4, 0.7), wood);
    body.position.y = 1.25;
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.12, 0.78), wood);
    cornice.position.y = 2.5;
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 2.2), dark);
    inner.position.set(0, 1.25, 0.352);
    g.add(body, cornice, inner);
    // as duas portas (giram nas dobradiças dos lados)
    this.doors = [-1, 1].map((s) => {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.6, 0, 0.37);
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.24, 0.05), woodLt);
      door.position.set(-s * 0.3, 1.25, 0);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshToonMaterial({ color: 0x9a7a3a }));
      knob.position.set(-s * 0.52, 1.2, 0.04);
      pivot.add(door, knob);
      g.add(pivot);
      return { pivot, s };
    });
    // os OLHOS na fresta (muitos, amarelos, piscando)
    this.eyes = new THREE.Group();
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffd84a, toneMapped: false });
    for (let i = 0; i < 9; i++) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.022 + Math.random() * 0.014, 8, 6), eyeMat);
      e.position.set((Math.random() - 0.5) * 0.22, 0.9 + Math.random() * 1.0, 0.36);
      e.userData.seed = Math.random() * 10;
      this.eyes.add(e);
    }
    g.add(this.eyes);
    // a TRANCA (barra de ferro atravessada; o brilho dela some quando vai reabrir)
    this.bar = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.1, 0.08), new THREE.MeshToonMaterial({ color: 0x3a3a3e, emissive: 0x2a1a00 }));
    this.bar.position.set(0, 1.3, 0.42);
    this.bar.visible = false;
    g.add(this.bar);
    g.position.set(spot.x, 0, spot.z);
    g.rotation.y = spot.face;
    this.world.scene.add(g);
    this.group = g;
  }

  get open() { return this.state === 'open'; }

  // AVISO do bote: um punhado de olhos grandes amarelos acende na frente da fresta por onde ele vai sair
  warn(time) {
    if (!this.warnEyes) {
      const g = new THREE.Group();
      const white = new THREE.MeshBasicMaterial({ color: 0xffd84a, toneMapped: false });
      const black = new THREE.MeshBasicMaterial({ color: 0x050403 });
      for (let i = 0; i < 11; i++) {
        const r = 0.06 + Math.random() * 0.07;
        const e = new THREE.Group();
        const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), white);
        ball.scale.z = 0.5;
        const n = Math.random() < 0.3 ? 2 : 1; // alguns com duas pupilas (como os dele)
        for (let k = 0; k < n; k++) {
          const pu = new THREE.Mesh(new THREE.SphereGeometry(r * 0.38, 8, 6), black);
          pu.position.set(n > 1 ? (k - 0.5) * r * 0.8 : 0, 0, r * 0.42);
          pu.scale.z = 0.4;
          e.add(pu);
        }
        e.add(ball);
        e.position.set((Math.random() - 0.5) * 0.9, 0.8 + Math.random() * 1.5, 0.5 + Math.random() * 0.1);
        e.userData.seed = Math.random() * 10;
        g.add(e);
      }
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.0, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.6, toneMapped: false, depthWrite: false }));
      ring.position.set(0, 0.04, 1.1);
      g.add(ring);
      g.userData.ring = ring;
      this.group.add(g);
      this.warnEyes = g;
    }
    this.warnT = time;
    this.warnDur = time;
  }

  updateWarn(dt) {
    const g = this.warnEyes;
    if (!g) return;
    if (!(this.warnT > 0) || !this.open) { g.visible = false; this.warnT = 0; return; }
    this.warnT -= dt;
    g.visible = true;
    const k = 1 - this.warnT / this.warnDur;
    g.children.forEach((e, i) => {
      if (e === g.userData.ring) return;
      // acendem um a um, bem rápido, e piscam
      const on = k * 14 > i ? 1 : 0;
      const blink = Math.sin(this.t * 9 + e.userData.seed * 4) > 0.9 ? 0.15 : 1;
      e.scale.setScalar(on * blink * (1 + 0.15 * Math.sin(this.t * 20 + i)));
    });
    const ring = g.userData.ring;
    ring.scale.setScalar(0.6 + k * 0.9);
    ring.material.opacity = 0.75 * (1 - k * 0.5);
  }

  update() { /* a lógica é do cérebro (tick); como NPC não faz nada */ }

  hitTest(p, r = 0) {
    if (!this.open) return false;
    const dy = p.y - this.pos.y;
    if (dy < -0.2 - r || dy > this.height + r) return false;
    return Math.hypot(p.x - this.pos.x, p.z - this.pos.z) <= this.radius + r;
  }

  hitBy(attacker) {
    if (!this.open || attacker === this.owner) return;
    this.lock();
  }

  kill() { this.lock(); }
  shatter() { this.lock(); }

  // forever: o chefe morreu — fecha de vez, sem avisar o cérebro
  lock({ forever = false } = {}) {
    if (!this.open) return;
    const w = this.world;
    this.state = 'locked';
    this.lockT = forever ? Infinity : ESPREITADOR_CFG.closet.lockTime;
    if (forever) { this.alive = false; w.audio.play('closetSlam', { volume: 0.6 }); return; }
    this.alive = false; // sai da lista de NPCs (o World remove)
    w.audio.play('closetSlam', { volume: 1 });
    w.fx.burst(v1.set(this.pos.x, 1.3, this.pos.z).clone(), { count: 18, color: 0x8a7a60, kind: 'smoke', speed: 1.6, life: 0.5, size: 0.4 });
    w.cameraRig.shake(0.12, 0.2);
    this.onLock && this.onLock(this);
  }

  reopen() {
    if (this.open) return;
    this.state = 'open';
    this.alive = true;
    this.world.addNpc(this);
    this.world.audio.play('creak', { volume: 0.8 });
  }

  tick(dt, { occupied = false } = {}) {
    this.t += dt;
    if (this.state === 'locked') {
      this.lockT -= dt;
      if (this.lockT <= 0) this.reopen();
    }
    const want = this.open ? (occupied ? 0.55 : 0.32) : 0;
    this.openK += (want - this.openK) * Math.min(1, dt * (this.open ? 3 : 18));
    for (const d of this.doors) d.pivot.rotation.y = d.s * this.openK * 1.2;
    this.eyes.visible = this.open && this.openK > 0.15;
    for (const e of this.eyes.children) {
      const blink = Math.sin(this.t * 1.7 + e.userData.seed * 3) > 0.94 ? 0.1 : 1;
      e.scale.setScalar((occupied ? 1.35 : 1) * blink);
    }
    this.updateWarn(dt);
    if (this.warnT > 0) for (const d of this.doors) d.pivot.rotation.y = d.s * Math.max(this.openK, 0.9) * 1.2;
    this.bar.visible = !this.open;
    if (this.bar.visible) this.bar.material.emissive.setHex(this.lockT < 3 && Math.sin(this.t * 14) > 0 ? 0x6a3a00 : 0x2a1a00);
  }

  dispose() {
    this.alive = false;
    const boxes = this.world.arena.boxes;
    const i = boxes.indexOf(this.box);
    if (i >= 0) boxes.splice(i, 1);
    if (!this.group) return;
    this.world.scene.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.group = null;
  }
}

// linha de visão livre entre dois pontos (os obstáculos do mapa param o olhar)
export function lineOfSight(world, a, b, h = 1.35) {
  for (let k = 1; k < 14; k++) {
    v2.lerpVectors(a, b, k / 14).setY(h);
    if (world.arena.blocksPoint(v2, 0.05)) return false;
  }
  return true;
}

// quem está olhando para `from`: de frente (dentro de `arc` graus) e sem se defender/esquivar
export function isLookingAt(f, from, arc = 60) {
  if (f.state === 'block' || f.state === 'dodge' || f.state === 'ko' || f.state === 'downed') return false;
  return Math.abs(angleDiff(f.yaw, yawTo(f.pos, from))) < arc * DEG;
}

// ================================================================== O CÉREBRO
export class EspreitadorBrain {
  constructor(dungeon, { closets, playerDef }) {
    this.d = dungeon;
    this.w = dungeon.world;
    this.closets = closets;
    this.playerDef = playerDef;
    this.state = 'duel';
    this.t = 0;
    this.next = 3.5; // a primeira habilidade sai cedo (mostra quem ele é)
    this.copias = [];
    this.inCloset = null;
    this.gazeFx = null;
    this.hpMarks = [0.75, 0.5, 0.25]; // a cada quarto da vida ele foge pelas frestas
    for (const c of closets) c.onLock = () => this.onClosetLocked(c);
  }

  get boss() { return this.d.enemy; }
  get player() { return this.d.player; }

  openClosets() { return this.closets.filter((c) => c.open); }

  say(text, color = '#f2c230') { this.d.hud.callout(text, color); }

  update(dt) {
    const b = this.boss;
    if (!b || b.state === 'ko') { this.stopGazeFx(); return; }
    this.t += dt;
    for (const c of this.closets) c.tick(dt, { occupied: c === this.inCloset });
    this.copias = this.copias.filter((n) => n.alive);
    switch (this.state) {
      case 'duel': this.updateDuel(dt); break;
      case 'gaze': this.updateGaze(dt); break;
      case 'toCloset': this.updateToCloset(dt); break;
      case 'hidden': this.updateHidden(dt); break;
      case 'lunge': this.updateLunge(dt); break;
      case 'summon': this.updateSummon(dt); break;
      case 'fortify': this.updateFortify(dt); break;
      case 'terror': this.updateTerror(dt); break;
      default: break;
    }
  }

  setState(s) {
    this.state = s;
    this.st = 0;
  }

  // a habilidade em andamento é uma sequência no estado 'ability' do lutador: se ele apanhar (hitstun) ela cai
  runSeq(update) {
    const b = this.boss;
    b.cancelAction && b.cancelAction();
    b.setState('ability');
    const seq = { update, cancelable: () => false };
    b.seq = seq;
    this.seq = seq;
    return seq;
  }

  interrupted() {
    const b = this.boss;
    return !(b.state === 'ability' && b.seq === this.seq);
  }

  backToDuel(wait) {
    const C = ESPREITADOR_CFG;
    this.stopGazeFx();
    const b = this.boss;
    if (b.state === 'ability' && b.seq === this.seq) { b.seq = null; b.setState('idle'); }
    this.seq = null;
    this.setState('duel');
    this.next = wait ?? C.duel[0] + Math.random() * (C.duel[1] - C.duel[0]);
  }

  updateDuel(dt) {
    const b = this.boss;
    const p = this.player;
    // ferido além de um quarto da vida: foge pelas frestas (canon: ele não luta de frente por muito tempo)
    const ratio = b.health / b.maxHealth;
    if (this.hpMarks.length && ratio <= this.hpMarks[0] && ['idle', 'charging', 'attack', 'block'].includes(b.state)) {
      this.hpMarks.shift();
      this.startFresta();
      return;
    }
    this.next -= dt;
    if (this.next > 0 || !['idle', 'charging', 'block'].includes(b.state)) return;
    const d = distXZ(b.pos, p.pos);
    const opts = [];
    if (d > 3 && d < ESPREITADOR_CFG.gaze.range && lineOfSight(this.w, b.pos, p.pos)) opts.push(['gaze', 3]);
    opts.push(['fresta', 2.2]);
    if (this.copias.length < 2) opts.push(['summon', this.copias.length ? 1.2 : 2.6]);
    if (this.copias.some((n) => !n.fortified)) opts.push(['fortify', 2.2]);
    let r = Math.random() * opts.reduce((s, o) => s + o[1], 0);
    let pick = opts[0][0];
    for (const [k, wgt] of opts) { r -= wgt; if (r <= 0) { pick = k; break; } }
    if (pick === 'gaze') this.startGaze();
    else if (pick === 'fresta') this.startFresta();
    else if (pick === 'summon') this.startSummon();
    else this.startFortify();
  }

  // ------------------------------------------------ DRENAR ENERGIA
  startGaze() {
    const G = ESPREITADOR_CFG.gaze;
    const b = this.boss;
    this.setState('gaze');
    this.gazeT = 0;
    this.drained = 0;
    b.anim.play('point', { restart: true, duration: G.windup + G.time });
    this.w.audio.play('fearGaze', { volume: 1 });
    this.say('DRENAR ENERGIA', '#f2c230');
    this.d.hint('Ele vai olhar: DEFENDA para desviar o olhar, ou saia da frente dele');
    this.runSeq((dt) => {
      // vira devagar para a vítima (dá para dar a volta nele)
      b.yaw = turnTowards(b.yaw, yawTo(b.pos, this.player.pos), G.turn * dt);
      return false;
    });
    this.gazeFx = this.makeGazeFx();
  }

  makeGazeFx() {
    const w = this.w;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.32, 24), new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.9, side: THREE.DoubleSide, toneMapped: false, depthWrite: false }));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.08, 1, 6, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.0, toneMapped: false, depthWrite: false }));
    w.scene.add(ring, beam);
    return { ring, beam };
  }

  stopGazeFx() {
    if (!this.gazeFx) return;
    for (const m of [this.gazeFx.ring, this.gazeFx.beam]) { this.w.scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
    this.gazeFx = null;
  }

  updateGaze(dt) {
    const G = ESPREITADOR_CFG.gaze;
    const b = this.boss;
    const p = this.player;
    if (this.interrupted()) { this.d.hint(null); this.backToDuel(3); return; }
    this.gazeT += dt;
    const eye = b.chestPos(v1).setY(b.pos.y + 1.75 * (b.size || 1));
    const fx = this.gazeFx;
    if (fx) {
      fx.ring.position.copy(eye).addScaledVector(forwardFromYaw(b.yaw, v2), 0.35);
      fx.ring.rotation.set(0, b.yaw, 0);
      fx.ring.scale.setScalar(this.gazeT < G.windup ? 0.5 + this.gazeT / G.windup : 1.2 + Math.sin(this.gazeT * 18) * 0.15);
    }
    if (this.gazeT < G.windup) return;
    // dentro do cone dele, sem nada no meio e OLHANDO para ele
    const inCone = Math.abs(angleDiff(b.yaw, yawTo(b.pos, p.pos))) < G.arc * DEG && distXZ(b.pos, p.pos) < G.range;
    const caught = inCone && lineOfSight(this.w, b.pos, p.pos) && isLookingAt(p, b.pos, 70) && !p.isInvulnerable();
    if (fx) {
      fx.beam.position.copy(eye);
      const to = p.chestPos(v2).setY(p.pos.y + 1.6);
      fx.beam.lookAt(to);
      fx.beam.scale.set(1, 1, eye.distanceTo(to));
      fx.beam.material.opacity = caught ? 0.5 + Math.sin(this.gazeT * 30) * 0.15 : 0;
    }
    if (caught) {
      const k = (p.pveMods ? p.pveMods.drainTaken : 1);
      const take = Math.min(p.energy, G.drain * dt * k);
      p.energy -= take;
      this.drained += take;
      if (p.energy <= 0.5) p.takeDamage(G.burn * dt * k); // sem Sanidade, o olhar consome a vida
      if (Math.random() < dt * 8) this.w.fx.burst(p.chestPos(v2).clone(), { count: 2, color: 0xf2c230, speed: 1.4, life: 0.4, size: 0.12, up: 1 });
      this.d.hud.vignette && this.d.hud.vignette.classList.add('on');
    } else {
      this.d.hud.vignette && this.d.hud.vignette.classList.remove('on');
    }
    if (this.gazeT >= G.windup + G.time) {
      this.d.hud.vignette && this.d.hud.vignette.classList.remove('on');
      if (this.drained > 4) this.d.popup(0, `−${Math.round(this.drained)} SANIDADE`, '#6ad1ff');
      this.d.hint(null);
      this.backToDuel();
    }
  }

  // ------------------------------------------------ CORRER PELAS FRESTAS
  startFresta() {
    const open = this.openClosets();
    if (!open.length) { this.startTerror(); return; }
    const b = this.boss;
    // a fresta mais perto dele (longe do jogador, se der)
    open.sort((a, c) => distXZ(a.pos, b.pos) - distXZ(c.pos, b.pos) + 0.35 * (distXZ(c.pos, this.player.pos) - distXZ(a.pos, this.player.pos)));
    this.target = open[0];
    this.setState('toCloset');
    this.say('CORRER PELAS FRESTAS', '#f2c230');
    this.d.hint('Bata nos armários abertos para TRANCAR as frestas');
    b.anim.play('run', { restart: true });
    this.runSeq(() => false);
  }

  updateToCloset(dt) {
    const F = ESPREITADOR_CFG.fresta;
    const b = this.boss;
    if (this.interrupted()) { this.backToDuel(2.5); return; }
    this.st += dt;
    if (!this.target.open) {
      // trancaram a fresta na cara dele: procura outra (ou entra em pânico)
      const open = this.openClosets();
      if (!open.length) { this.startTerror(); return; }
      this.target = open.sort((a, c) => distXZ(a.pos, b.pos) - distXZ(c.pos, b.pos))[0];
    }
    const c = this.target;
    const d = distXZ(b.pos, c.pos);
    b.yaw = yawTo(b.pos, c.pos);
    if (d > 0.7 && this.st < F.maxWalk) {
      const sp = Math.min(F.walk * dt, d);
      b.pos.x += Math.sin(b.yaw) * sp;
      b.pos.z += Math.cos(b.yaw) * sp;
      resolveBody(this.w.arena, b.pos, b.radius);
      if (b.anim.currentName !== b.anim.resolve('run')) b.anim.play('run');
      return;
    }
    // entra (se demorou demais, ele "escorre" para dentro de qualquer jeito)
    this.enterCloset(c);
  }

  enterCloset(c) {
    const b = this.boss;
    const F = ESPREITADOR_CFG.fresta;
    this.w.fx.burst(b.chestPos(v1).clone(), { count: 26, color: 0x2a2620, kind: 'smoke', speed: 2, life: 0.6, size: 0.6, grow: 1 });
    this.w.audio.play('creak', { volume: 1, pitch: 0.8 });
    b.seq = null;
    this.seq = null;
    b.setState('intro');
    b.setVisible(false);
    b.pos.set(c.base.x, 0, c.base.z);
    this.inCloset = c;
    this.warnTo = null;
    this.setState('hidden');
    this.hideT = F.hide[0] + Math.random() * (F.hide[1] - F.hide[0]);
  }

  updateHidden(dt) {
    this.st += dt;
    const open = this.openClosets();
    if (!open.length) {
      // TODAS as frestas trancadas com ele dentro: arromba a última e sai APAVORADO
      this.say('SEM FRESTA PARA VOLTAR!', '#ffd84a');
      this.emerge(this.inCloset, { terror: true });
      return;
    }
    if (this.st < this.hideT) return;
    // o aviso já está aceso: espera e sai por ali (se trancaram a fresta avisada, escolhe outra e avisa de novo)
    if (this.warnTo) {
      if (!this.warnTo.open) { this.warnTo = null; return; }
      this.warnLeft -= dt;
      if (this.warnLeft > 0) return;
      const c = this.warnTo;
      this.warnTo = null;
      this.emerge(c);
      return;
    }
    // sai por outra fresta (de preferência perto do jogador: o bote)
    const others = open.filter((c) => c !== this.inCloset);
    const pool = others.length ? others : open;
    pool.sort((a, c) => distXZ(a.pos, this.player.pos) - distXZ(c.pos, this.player.pos));
    const c = pool[Math.random() < 0.7 ? 0 : pool.length - 1];
    // OS OLHOS AMARELOS acendem onde ele vai aparecer: dá para prever (e até trancar a fresta antes)
    const W = ESPREITADOR_CFG.fresta.warn * (this.d.diff?.warnMult ?? 1);
    this.warnTo = c;
    this.warnLeft = W;
    c.warn(W);
    this.w.audio.play('fearGaze', { volume: 0.8, pitch: 1.5 });
  }

  emerge(c, { terror = false } = {}) {
    const b = this.boss;
    this.inCloset = null;
    b.pos.set(c.pos.x, 0, c.pos.z);
    resolveBody(this.w.arena, b.pos, b.radius);
    b.setVisible(true);
    b.setState('idle');
    b.yaw = yawTo(b.pos, this.player.pos);
    this.w.fx.burst(b.chestPos(v1).clone(), { count: 30, color: 0x2a2620, kind: 'smoke', speed: 2.4, life: 0.6, size: 0.6, grow: 1 });
    if (terror) {
      if (c.open === false) { c.state = 'open'; c.alive = true; } // arrombada…
      c.lock(); // …e fecha de novo atrás dele (fica trancada)
      this.startTerror();
      return;
    }
    this.w.audio.play('closetSlam', { volume: 0.8, pitch: 1.3 });
    // o BOTE para fora da fresta
    this.setState('lunge');
    this.lungeHit = false;
    b.anim.play('db_dash', { restart: true, duration: ESPREITADOR_CFG.fresta.lunge.time + 0.2 });
    this.runSeq(() => false);
  }

  updateLunge(dt) {
    const L = ESPREITADOR_CFG.fresta.lunge;
    const b = this.boss;
    const p = this.player;
    if (this.interrupted()) { this.backToDuel(2.5); return; }
    this.st += dt;
    if (this.st < L.time) {
      b.yaw = yawTo(b.pos, p.pos);
      b.pos.x += Math.sin(b.yaw) * L.speed * dt;
      b.pos.z += Math.cos(b.yaw) * L.speed * dt;
      resolveBody(this.w.arena, b.pos, b.radius);
      if (!this.lungeHit && distXZ(b.pos, p.pos) - p.radius < L.reach && !p.isInvulnerable()) {
        this.lungeHit = true;
        applyHit(this.w, b, p, { damage: L.damage, kind: 'melee', knockback: 4.5, hitstun: 0.5, dir: forwardFromYaw(b.yaw, new THREE.Vector3()), sound: 'clawHit', color: 0xf2c230, scale: 1.2, element: 'medo' });
      }
      return;
    }
    this.d.hint(null);
    this.backToDuel();
  }

  onClosetLocked(c) {
    this.d.onClosetLocked && this.d.onClosetLocked(c, this.openClosets().length);
  }

  // ------------------------------------------------ CÓPIA OBSERVADA
  startSummon() {
    const b = this.boss;
    this.setState('summon');
    b.anim.play('taunt_roar', { restart: true, duration: 1.3 });
    this.say('CÓPIA OBSERVADA', '#f2c230');
    this.w.audio.play('fearGaze', { volume: 0.7, pitch: 0.7 });
    this.runSeq(() => false);
  }

  updateSummon(dt) {
    if (this.interrupted()) { this.backToDuel(2.5); return; }
    this.st += dt;
    if (this.st < 0.9 || this.summoned) {
      if (this.st >= 1.3) { this.summoned = false; this.backToDuel(); }
      return;
    }
    this.summoned = true;
    const C = ESPREITADOR_CFG.copia;
    const n = Math.min(C.count, C.max - this.copias.length);
    for (let i = 0; i < n; i++) this.spawnCopia(i);
  }

  spawnCopia(i) {
    const p = this.player;
    const C = ESPREITADOR_CFG.copia;
    const ang = p.yaw + Math.PI + (i - 0.5) * 1.6;
    const o = copiaOpts(this.playerDef, { hp: Math.round(C.hp * this.d.scale.hp), damageMult: 0.42 * this.d.scale.dealt, onSlain: (n) => this.d.onCopiaSlain(n) });
    const npc = new DanteClone(this.boss, this.w, i + this.copias.length, Infinity, o);
    npc.pos.set(p.pos.x + Math.sin(ang) * 3, 0, p.pos.z + Math.cos(ang) * 3);
    resolveBody(this.w.arena, npc.pos, npc.radius);
    this.w.addNpc(npc);
    this.copias.push(npc);
    this.w.fx.burst(v1.set(npc.pos.x, 1, npc.pos.z).clone(), { count: 20, color: 0x6c6a66, kind: 'smoke', speed: 1.8, life: 0.6, size: 0.5 });
    return npc;
  }

  // ------------------------------------------------ FORTALECER
  startFortify() {
    const b = this.boss;
    const free = this.copias.filter((n) => n.alive && !n.fortified);
    if (!free.length) { this.backToDuel(1); return; }
    this.fTarget = free.sort((a, c) => distXZ(a.pos, b.pos) - distXZ(c.pos, b.pos))[0];
    this.setState('fortify');
    this.fPhase = 'walk';
    this.fDamage0 = b.health;
    b.anim.play('run', { restart: true });
    this.runSeq(() => false);
  }

  updateFortify(dt) {
    const F = ESPREITADOR_CFG.fortify;
    const b = this.boss;
    const n = this.fTarget;
    if (this.interrupted() || !n || !n.alive) { this.backToDuel(2.5); return; }
    this.st += dt;
    if (this.fPhase === 'walk') {
      const d = distXZ(b.pos, n.pos);
      b.yaw = yawTo(b.pos, n.pos);
      if (d > F.reach && this.st < 2.5) {
        const sp = Math.min(8 * dt, d);
        b.pos.x += Math.sin(b.yaw) * sp;
        b.pos.z += Math.cos(b.yaw) * sp;
        resolveBody(this.w.arena, b.pos, b.radius);
        if (b.anim.currentName !== b.anim.resolve('run')) b.anim.play('run');
        return;
      }
      this.fPhase = 'hold';
      this.st = 0;
      this.fDamage0 = b.health;
      b.anim.play('grab', { restart: true, duration: F.hold });
      this.say('FORTALECER', '#f2c230');
      this.d.hint('Bata nele AGORA para interromper');
      n.attack = null; n.cd = F.hold + 0.3; // o Devorado fica parado, seguro pela cabeça
      return;
    }
    // segurando a cabeça do Devorado: dano suficiente interrompe
    n.yaw = yawTo(n.pos, b.pos);
    if (Math.random() < dt * 12) this.w.fx.burst(v1.set(n.pos.x, 1.7, n.pos.z).clone(), { count: 2, color: 0xf2c230, speed: 1.2, life: 0.4, size: 0.12, up: 1 });
    if (this.fDamage0 - b.health >= F.breakDamage) {
      this.say('INTERROMPIDO!', '#ffffff');
      this.d.hint(null);
      b.stun(0.9, 'stagger');
      this.backToDuel(3);
      return;
    }
    if (this.st >= F.hold) {
      n.fortified = true;
      n.hp = Math.round(n.hp * F.hpMult);
      n.maxHp = Math.round(n.maxHp * F.hpMult);
      n.o.damageMult = (n.o.damageMult ?? 0.42) * F.dmgMult;
      n.rig.root.scale.setScalar(1.12);
      this.w.fx.ring(v1.set(n.pos.x, 0.05, n.pos.z).clone(), { color: 0xf2c230, radius: 2, life: 0.5 });
      this.d.popup(1, 'DEVORADO FORTALECIDO', '#f2c230');
      this.d.hint(null);
      this.backToDuel();
    }
  }

  // ------------------------------------------------ APAVORADO (a fraqueza)
  startTerror() {
    const T = ESPREITADOR_CFG.terror;
    const b = this.boss;
    this.stopGazeFx();
    this.setState('terror');
    this.say('APAVORADO!', '#ffd84a');
    this.d.hint('Ele está indefeso: ATIRE NO OLHO DA BOCA!');
    this.w.audio.play('fearGaze', { volume: 1, pitch: 1.6 });
    b.seq = null;
    if (b.state !== 'ko') b.setState('idle');
    b.addBuff({ type: 'pveTerror', name: 'APAVORADO', time: T.time, duration: T.time, takenMult: T.taken });
    b.addBuff({ type: 'pveTerrorEye', name: 'O OLHO DA BOCA', time: T.time, duration: T.time, takenMult: T.ranged, takenKinds: ['ranged'] });
    if (b.rig.props && b.rig.props.mouthEye) b.rig.showProp('mouthEye', true);
    // sem a CPU: ele não reage, só foge (tremendo)
    this.cpu = b.input.cpu;
    b.input.cpu = null;
    b.input.setVirtual({ moveX: 0, moveY: 0, held: {} });
    this.terrorT = T.time;
  }

  updateTerror(dt) {
    const T = ESPREITADOR_CFG.terror;
    const b = this.boss;
    const p = this.player;
    this.terrorT -= dt;
    // treme (o corpo todo) e se afasta devagar quando está livre
    if (b.rig.body) b.rig.body.position.x = Math.sin(this.t * 60) * 0.025;
    if (b.state === 'idle') {
      const away = yawTo(p.pos, b.pos);
      b.yaw = yawTo(b.pos, p.pos);
      b.pos.x += Math.sin(away) * T.speed * dt;
      b.pos.z += Math.cos(away) * T.speed * dt;
      resolveBody(this.w.arena, b.pos, b.radius);
      if (b.anim.currentName !== b.anim.resolve('fear')) b.anim.play('fear', { restart: true });
    }
    if (Math.random() < dt * 5) this.w.fx.burst(b.chestPos(v1).setY(b.pos.y + 1.6).clone(), { count: 2, color: 0x9ab0c0, speed: 0.6, life: 0.6, size: 0.06, grav: 4 }); // as lágrimas
    if (this.terrorT > 0) return;
    // passou: arromba as frestas de novo (todas reabrem) e volta a lutar
    if (b.rig.body) b.rig.body.position.x = 0;
    if (b.rig.props && b.rig.props.mouthEye) b.rig.showProp('mouthEye', false);
    b.input.setVirtual(null);
    b.input.cpu = this.cpu;
    for (const c of this.closets) if (!c.open) c.reopen();
    this.say('AS FRESTAS SE ABREM', '#f2c230');
    this.d.hint(null);
    this.backToDuel();
  }

  dispose() {
    this.stopGazeFx();
    const b = this.boss;
    if (b && this.state === 'terror' && this.cpu) { b.input.setVirtual(null); b.input.cpu = this.cpu; }
  }
}

// ================================================================== A FRESTA DO CORREDOR (etapa 2: perseguição)
// Os olhos dele numa fresta do corredor: de tempos em tempos olham, e quem estiver olhando para a fresta perde
// Sanidade. Ensina o Drenar Energia antes da luta, sem prender ninguém (só Sanidade, nunca vida).
export class PeekingCrack {
  constructor(world, spot) {
    this.w = world;
    this.pos = new THREE.Vector3(spot.x, 0, spot.z);
    this.t = 0;
    this.cycle = 0;
    const g = new THREE.Group();
    const dark = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.2), new THREE.MeshBasicMaterial({ color: 0x020102 }));
    dark.position.set(0, 1.2, 0.17);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.05), new THREE.MeshToonMaterial({ color: 0x6a4a30 }));
    this.door = new THREE.Group();
    this.door.position.set(-0.5, 0, 0.2);
    door.position.set(0.45, 1.2, 0);
    this.door.add(door);
    this.eyes = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ color: 0xffd84a, toneMapped: false });
    for (let i = 0; i < 7; i++) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.02 + Math.random() * 0.012, 8, 6), m);
      e.position.set(0.32 + (Math.random() - 0.5) * 0.1, 1.0 + Math.random() * 0.9, 0.18);
      this.eyes.add(e);
    }
    g.add(dark, this.door, this.eyes);
    g.position.copy(this.pos);
    world.scene.add(g);
    this.group = g;
    this.active = false;
  }

  // devolve true enquanto o jogador está sendo drenado
  update(dt, p, inside) {
    this.t += dt;
    let draining = false;
    if (inside) {
      this.cycle += dt;
      const phase = this.cycle % 5.5; // 3,5 s quieto → 0,8 s de aviso → 1,2 s de olhar
      const warn = phase > 3.5 && phase < 4.3;
      const look = phase >= 4.3;
      if (warn && !this.warned) { this.warned = true; this.w.audio.play('fearGaze', { volume: 0.6 }); }
      if (!warn && !look) this.warned = false;
      this.door.rotation.y = -(look ? 0.75 : warn ? 0.45 : 0.2);
      this.eyes.visible = warn || look || Math.sin(this.t * 0.9) > 0.6;
      for (const e of this.eyes.children) e.scale.setScalar(look ? 1.5 : 1);
      if (look && isLookingAt(p, this.pos, 65) && lineOfSight(this.w, this.pos.clone().setZ(this.pos.z + 0.4), p.pos)) {
        const k = p.pveMods ? p.pveMods.drainTaken : 1;
        p.energy = Math.max(0, p.energy - 14 * dt * k);
        draining = true;
      }
    } else {
      this.door.rotation.y = -0.12;
      this.eyes.visible = false;
    }
    return draining;
  }

  dispose() {
    if (!this.group) return;
    this.w.scene.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.group = null;
  }
}
