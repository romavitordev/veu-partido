import * as THREE from 'three';
import { Marionette, BloodZombie, BLOOD_ZOMBIE } from './npcs.js';
import { InkBeast } from './beasts.js';
import { applyHit } from './damage.js';
import { yawTo, angleDiff, DEG, forwardFromYaw, distXZ } from '../core/util.js';
import { buildNpcModel } from '../models/npcRig.js';
import { buildInkBeast } from '../models/beasts.js';
import { buildBloodZombie } from '../models/bloodZombie.js';
import { resolveBody } from './positioning.js';

// ================================================================== O BESTIÁRIO DO SERTÃO DO QUIBUNGO
// Hexatombe ep. 5 (wiki "Araras Devoradas", "Felinos Devorados", "Quibungo"): os animais da Coroa de Espinhos tomados
// pelo Sangue e o chefe Quibungo. As variantes INFERNAIS só vêm no Aniquilação (dono, 2026-11-20). PROPOSTA: todos os
// números, os golpes e a entrada do Quibungo.
const BLOOD = 0xc0202c;
const DUST = 0x8a7a60;

function hitBand(n, p, r, bottom, top) {
  if (!n.alive || n.state === 'rise' || n.state === 'leave' || n.state === 'die') return false;
  if (p.y < bottom - r || p.y > top + r) return false;
  return Math.hypot(p.x - n.pos.x, p.z - n.pos.z) <= n.radius + r;
}

// morreu: desmancha em sangue (como os Zumbis de Sangue), sem a poça que fere
function bloodMelt(n, k, restY, scale = 1) {
  const root = n.model.root;
  root.position.y = restY * (1 - k);
  root.scale.set(scale * (1 + k * 0.4), scale * Math.max(0.05, 1 - k * 0.95), scale * (1 + k * 0.4));
  if (Math.random() < 0.5) n.world.fx.burst(new THREE.Vector3(n.pos.x, 0.3 + (1 - k) * n.height * 0.4, n.pos.z), { count: 4, color: 0xa01018, speed: 2, up: 1, life: 0.5, size: 0.16, gravity: 9 });
}

// ------------------------------------------------------------------ ARARA DEVORADA / INFERNAL
// Voa em círculos no alto (fora do alcance dos socos; tiros e lamparinas pegam), MERGULHA num rasante no alvo e fica
// POUSADA um instante depois (a hora de bater); de perto, no chão, dá bicadas. Morta, despenca.
export const ARARA = {
  devorada: {
    name: 'ARARA DEVORADA', hp: 90, duration: Infinity, speed: 6.4, radius: 0.55, height: 1.2, scale: 1,
    element: 'sangue', fxColor: BLOOD, poolColor: 0x5a0008, noPool: true, alt: 2.9,
    attacks: {
      dive: { windup: 0.55, active: 0.45, recovery: 1.5, range: 1.7, arc: 130, damage: 14, cd: 3.4, knockback: 3, dash: 15 },
      peck: { windup: 0.25, active: 0.1, recovery: 0.35, range: 1.5, arc: 110, damage: 8, cd: 1.0, knockback: 1 },
    },
    firstCd: { dive: 1.4, peck: 0.6 },
  },
  infernal: {
    name: 'ARARA INFERNAL', hp: 200, duration: Infinity, speed: 7, radius: 0.7, height: 1.5, scale: 1.3,
    element: 'sangue', fxColor: BLOOD, poolColor: 0x5a0008, noPool: true, alt: 3.3,
    attacks: {
      dive: { windup: 0.5, active: 0.5, recovery: 1.3, range: 2.0, arc: 140, damage: 24, cd: 3.0, knockback: 5, dash: 17, knockdown: true },
      peck: { windup: 0.22, active: 0.1, recovery: 0.32, range: 1.8, arc: 120, damage: 14, cd: 0.9, knockback: 2 },
    },
    firstCd: { dive: 1.2, peck: 0.5 },
  },
};

function buildArara(kind) {
  const m = buildNpcModel(kind === 'infernal' ? 'arara_infernal' : 'arara_devorada', { outline: 0.012, noOutline: ['vein', 'fang', 'claw', 'beak', 'glow', 'eye', 'membrane', 'bone'] });
  if (!m) return null;
  const J = m.joint;
  const opt = (n) => { try { return J(n); } catch { return null; } };
  return {
    root: m.root,
    joints: {
      body: J('body'), torso: J('torso'), head: J('head'), jaw: opt('jaw'), tail: opt('tail'),
      wings: [['L', 1], ['R', -1]].map(([n, s]) => ({ s, w: J('wing' + n), tip: opt('wingtip' + n), arm: opt('arm' + n), fore: opt('forearm' + n), leg: opt('leg' + n), knee: opt('knee' + n), bat: opt('bat' + n) })),
    },
  };
}

export class AraraBeast extends Marionette {
  configFor(o) { return ARARA[o.kind] || ARARA.devorada; }
  buildModel(o) {
    this.kind = ARARA[o.kind] ? o.kind : 'devorada';
    this.isMarionette = false;
    this.isBird = true;
    this.alt = 9;
    this.orbit = Math.random() < 0.5 ? 1 : -1;
    this.orbitR = 3.4 + Math.random() * 2.2; // cada uma no seu raio (senão o bando se empilha num ponto só)
    const m = buildArara(this.kind);
    if (m) return m;
    this.fallback = true;
    return buildInkBeast('cao');
  }

  chooseTarget() { this.target = this.owner.opponent; }
  landed() { return this.alt < 0.9; }
  restY() { return this.alt; }
  bob() { return this.landed() ? 0 : Math.sin(this.t * 2.2 + this.seed) * 0.18; }

  // de onde se bate nela: no ar, só da altura do peito para cima (tiro, lamparina, golpe alto); pousada, o corpo todo
  hitTest(p, r) {
    const low = this.landed() ? -0.2 : this.alt - 1.6;
    return hitBand(this, p, r, low, this.alt + this.height);
  }

  // NO AR, GOLPE FÍSICO NÃO PEGA (dono, 2026-11-21: "Araras deveriam não tomar ataques fisicos no ar, só quando elas
  // descerem, mas tiros elas podem sim tomar dano"): o soco/corte que alcança a arara voando só levanta penas; tiros,
  // habilidades e especiais continuam valendo. Pousada (depois do rasante), apanha de tudo.
  hitBy(attacker, dmg, info) {
    if (!this.landed() && info && info.kind === 'melee' && this.alive && this.state !== 'die') {
      this.world.fx.burst(new THREE.Vector3(this.pos.x, this.alt + 0.4, this.pos.z), { count: 4, color: this.kind === 'infernal' ? 0x5a1018 : 0x2a8a3a, speed: 1.5, up: 0.5, life: 0.5, size: 0.1, gravity: 2 });
      if (attacker && attacker.notify && !(attacker.araraWarnAt > this.world.time - 8)) {
        attacker.araraWarnAt = this.world.time;
        attacker.notify('NO AR, SÓ TIRO PEGA: BATA QUANDO ELA POUSAR', true);
      }
      return;
    }
    super.hitBy(attacker, dmg, info);
  }

  pickAttack(d) {
    const c = this.cds;
    const A = this.cfg.attacks;
    if (this.landed() && d < A.peck.range - 0.1 && c.peck <= 0) return 'peck';
    if (d > 2 && d < 10 && c.dive <= 0) return 'dive';
    return null;
  }
  attackSound(name) { return name === 'dive' ? 'whip' : 'bloodClaw'; }
  // de perto e sem o rasante pronto, plana em volta do alvo (stepSpeed baixo; a volta é feita em update)
  stepSpeed(d) { return this.cfg.speed * (d < this.orbitR + 1 && !this.landed() ? 0.15 : d > 7 ? 1.25 : 1); }

  // chega voando de cima do mato
  riseTime() { return 0.9; }
  risePose(k) {
    this.alt = this.cfg.alt + (1 - k) * 7;
    const root = this.model.root;
    root.position.set(this.pos.x, this.alt, this.pos.z);
    root.scale.setScalar(this.cfg.scale);
  }
  // morta: despenca girando e desmancha em sangue no chão
  vanishPose(k, restY) {
    const root = this.model.root;
    if (this.state !== 'die') { this.alt += 0.15; root.position.y = this.alt; return; }
    if (this.alt > 0.05) {
      this.fallV = (this.fallV || 0) + 0.02;
      this.alt = Math.max(0, this.alt - this.fallV);
      root.position.y = this.alt;
      root.rotation.z += 0.25;
      return;
    }
    bloodMelt(this, k, 0, this.cfg.scale);
  }

  update(dt) {
    if (this.alive && this.state !== 'rise' && this.state !== 'die' && this.state !== 'leave') {
      const a = this.atk;
      const st = this.stateT;
      let goal = this.cfg.alt;
      let rate = 2.5;
      if (this.state === 'attack' && a && a.name === 'dive') {
        if (st < a.windup) goal = this.cfg.alt + 0.7; // empina antes do mergulho
        else if (st < a.windup + a.active) { goal = 0.15; rate = 9; }
        else if (st < a.windup + a.active + a.recovery * 0.75) { goal = 0; rate = 12; } // pousada: a hora de bater
        else rate = 3;
      } else if (this.state === 'attack' && a && a.name === 'peck') goal = this.alt;
      this.alt += (goal - this.alt) * Math.min(1, dt * rate);
      // plana em círculo em volta do alvo
      const tg = this.target;
      if (this.state === 'chase' && tg && !this.landed()) {
        const d = distXZ(this.pos, tg.pos);
        if (d < this.orbitR + 1.5) {
          const ang = yawTo(tg.pos, this.pos) + this.orbit * dt * 0.9;
          const r = d + (this.orbitR - d) * Math.min(1, dt * 1.5);
          this.pos.x = tg.pos.x + Math.sin(ang) * r;
          this.pos.z = tg.pos.z + Math.cos(ang) * r;
        }
      }
      // afasta das outras araras
      for (const o of this.world.npcs) {
        if (o === this || !o.isBird || !o.alive) continue;
        const dx = this.pos.x - o.pos.x, dz = this.pos.z - o.pos.z;
        const dd = Math.hypot(dx, dz);
        if (dd < 1.8 && dd > 1e-3) { this.pos.x += (dx / dd) * (1.8 - dd) * 0.5; this.pos.z += (dz / dd) * (1.8 - dd) * 0.5; }
        else if (dd <= 1e-3) this.pos.x += 0.05;
      }
      if (Math.random() < dt * 0.25) this.world.audio.play('whip', { volume: 0.25, pitch: 1.6 }); // o bater de asas
    }
    return super.update(dt);
  }

  swingFx(a) {
    if (a.name === 'dive') {
      this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.2, this.pos.z), { count: 10, color: DUST, kind: 'smoke', speed: 2.5, up: 0.6, life: 0.5, size: 0.5 });
      return;
    }
    this.world.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + 0.8, this.pos.z), this.yaw, { color: 0xd02030, radius: a.range, arc: 1.8, life: 0.18, width: 0.2, roll: 0.3 });
  }

  onDestroyed() {}

  pose() {
    const J = this.model.joints;
    const root = this.model.root;
    root.rotation.y = this.yaw;
    root.scale.setScalar(this.state === 'die' && this.alt <= 0.05 ? root.scale.x : this.cfg.scale);
    if (this.fallback) { this.updateFlash(); return; }
    const t = this.t;
    const air = !this.landed();
    const a = this.state === 'attack' ? this.atk : null;
    const st = this.stateT;
    const diving = a && a.name === 'dive' && st >= a.windup && st < a.windup + a.active;
    const flapF = diving ? 0 : this.kind === 'infernal' ? 7 : 9;
    const flap = air ? Math.sin(t * flapF) * 0.75 + 0.15 : 0;
    let pitch = air ? 0.45 : 0.1;
    let head = air ? -0.3 : 0;
    let jaw = 0.2 + Math.abs(Math.sin(t * 6)) * 0.15;
    if (a && a.name === 'dive') {
      if (st < a.windup) { pitch = -0.2; jaw = 0.7; }
      else if (diving) { pitch = 1.15; head = -0.9; jaw = 0.9; }
    } else if (a && a.name === 'peck') {
      const k = Math.min(1, st / a.windup);
      pitch = st < a.windup ? 0.1 - 0.3 * k : 0.7;
      head = st < a.windup ? -0.4 * k : 0.6;
      jaw = st < a.windup ? 0.8 * k : 0.1;
    }
    if (this.state === 'die') { pitch = 0.8; jaw = 0.9; }
    J.torso.rotation.set(pitch, 0, air ? Math.sin(t * 1.3) * 0.15 * this.orbit : 0);
    J.head.rotation.x = head;
    if (J.jaw) J.jaw.rotation.x = jaw;
    if (J.tail) J.tail.rotation.set(Math.sin(t * 3) * 0.15 + (air ? 0.25 : -0.1), Math.sin(t * 2.1) * 0.2, 0);
    for (const w of J.wings) {
      const s = w.s;
      if (air && !diving) w.w.rotation.set(0, 0, s * flap);
      else if (diving) w.w.rotation.set(0, s * 0.9, s * 0.15); // asas fechadas para trás no mergulho
      else w.w.rotation.set(0, s * 1.25, -s * 0.35); // pousada: dobradas nas costas
      if (w.tip) w.tip.rotation.set(0, 0, air && !diving ? s * Math.sin(t * flapF - 0.6) * 0.45 : diving ? 0 : -s * 0.6);
      if (w.bat) w.bat.rotation.set(0, 0, s * (air ? Math.sin(t * flapF + 1.2) * 0.6 : -0.3));
      // os braços do peito agarram
      if (w.arm) w.arm.rotation.set(diving ? -1.1 : -0.3 + Math.sin(t * 4 + s) * 0.15, 0, s * 0.2);
      if (w.fore) w.fore.rotation.x = diving ? -0.2 : -0.7;
      // as pernas: penduradas para trás no voo, à frente com as garras no rasante, em pé pousada
      if (w.leg) w.leg.rotation.set(diving ? -0.9 : air ? 0.75 : -pitch, 0, 0);
      if (w.knee) w.knee.rotation.x = diving ? 0.2 : air ? 0.6 : 0;
    }
    this.updateFlash();
  }
}

// ------------------------------------------------------------------ FELINO DEVORADO (quadrúpede, sobre o cão da tinta)
// Anda em bando: mordida, o BOTE de longe com a língua de fora e o GIRO do rabo-lâmina quando cercado.
export const FELINO = {
  name: 'FELINO DEVORADO', hp: 140, duration: Infinity, speed: 6.6, radius: 0.5, height: 1.5,
  element: 'sangue', fxColor: BLOOD, poolColor: 0x5a0008, noPool: true,
  attacks: {
    bite: { windup: 0.22, active: 0.12, recovery: 0.35, range: 1.6, arc: 120, damage: 12, cd: 0.9, knockback: 1 },
    pounce: { windup: 0.35, active: 0.32, recovery: 0.5, range: 1.7, arc: 110, damage: 18, cd: 3.6, knockback: 3, dash: 13 },
    lash: { windup: 0.4, active: 0.25, recovery: 0.45, range: 2.6, arc: 360, damage: 16, cd: 5, knockback: 4 },
  },
  firstCd: { bite: 0.3, pounce: 0.8, lash: 2 },
};

export class FelinoBeast extends InkBeast {
  configFor() { return FELINO; }
  buildModel() {
    this.kind = 'felino';
    this.isMarionette = false;
    this.isInkBeast = true;
    const m = buildNpcModel('felino_devorado', { outline: 0.012, noOutline: ['vein', 'tooth', 'goo', 'glow', 'claw', 'bone', 'blade'] });
    if (!m) return buildInkBeast('cao');
    const J = m.joint;
    return {
      root: m.root,
      joints: {
        body: J('body'), torso: J('torso'), head: J('head'), jaw: J('jaw'), tail: J('tail'),
        legs: ['FL', 'FR', 'BL', 'BR'].map((n) => ({ hip: J('leg' + n), knee: J('knee' + n) })),
      },
    };
  }

  pickAttack(d) {
    const c = this.cds;
    const A = this.cfg.attacks;
    if (d < A.lash.range && c.lash <= 0 && Math.random() < 0.3) return 'lash';
    if (d > 2.6 && d < 8 && c.pounce <= 0) return 'pounce';
    if (d < A.bite.range - 0.1 && c.bite <= 0) return 'bite';
    return null;
  }
  attackSound(name) { return name === 'lash' ? 'whip' : 'bloodClaw'; }

  // sai do mato rastejando, levantando poeira
  risePose(k) {
    const root = this.model.root;
    root.position.set(this.pos.x, -0.8 * (1 - k), this.pos.z);
    root.scale.setScalar(1);
    if (Math.random() < 0.4) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.15, this.pos.z), { count: 3, color: DUST, kind: 'smoke', speed: 1.4, up: 0.8, life: 0.5, size: 0.4 });
  }
  vanishPose(k, restY) {
    if (this.state !== 'die') { this.model.root.position.y = -k * 1.2; return; }
    bloodMelt(this, k, 0);
  }

  swingFx(a) {
    if (a.dash) return;
    if (a.name === 'lash') {
      this.world.fx.ring(new THREE.Vector3(this.pos.x, 0.5, this.pos.z), { color: 0xd8c098, radius: a.range, life: 0.3, inner: 0.85 });
      return;
    }
    this.world.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + 0.8, this.pos.z), this.yaw, { color: 0xd02030, radius: a.range, arc: 2.0, life: 0.2, width: 0.25, roll: -0.2 });
  }

  pose() {
    super.pose();
    const J = this.model.joints;
    const a = this.state === 'attack' ? this.atk : null;
    if (!a) return;
    const st = this.stateT;
    if (a.name === 'lash') {
      // gira o corpo inteiro e o rabo-lâmina varre em volta
      const k = Math.min(1, Math.max(0, (st - a.windup * 0.6) / (a.active + a.windup * 0.4)));
      this.model.root.rotation.y = this.yaw + k * Math.PI * 2;
      if (J.tail) J.tail.rotation.set(0.6, 0, 0);
    } else if (a.name === 'pounce' && J.jaw) J.jaw.rotation.x = 1.0; // a boca escancarada, a língua de fora
  }
}

// ------------------------------------------------------------------ FELINO INFERNAL (de pé, sobre o Zumbi fraco)
// Só no Aniquilação: garras, o salto de boca aberta e a FERROADA do rabo-lâmina por cima da cabeça.
const FELINO_INF_SCALE = 1.15;
BLOOD_ZOMBIE.felinoInfernal = {
  ...BLOOD_ZOMBIE.weak,
  name: 'FELINO INFERNAL', hp: 320, duration: Infinity, speed: 6, radius: 0.6, height: 2.4,
  crouch: { hip: -0.6, knee: 1.0, chest: 0.5, neck: -0.45 },
  attacks: {
    claw: { ...BLOOD_ZOMBIE.weak.attacks.claw, range: 2.2, damage: 20, knockback: 2 },
    bite: { ...BLOOD_ZOMBIE.weak.attacks.bite, damage: 28, dash: 13, cd: 3.5 },
    sting: { windup: 0.5, active: 0.15, recovery: 0.5, range: 3.4, arc: 60, damage: 30, cd: 4.5, knockback: 4, knockdown: true },
  },
  firstCd: { claw: 0.3, bite: 0.9, sting: 1.6 },
};

export class FelinoInfernal extends BloodZombie {
  configFor() { return BLOOD_ZOMBIE.felinoInfernal; }
  buildModel(o) {
    this.strong = false;
    this.isMarionette = false;
    const m = buildNpcModel('felino_infernal', { outline: 0.012, noOutline: ['vein', 'fang', 'claw', 'gum', 'maw', 'bone', 'spine'] });
    if (!m) return buildBloodZombie(false);
    const J = m.joint;
    const opt = (n) => { try { return J(n); } catch { return null; } };
    return {
      root: m.root,
      joints: {
        body: J('body'), chest: J('chest'), neck: J('neck'), jaw: J('jaw'),
        armL: { sh: J('shL'), el: J('elL'), hand: J('handL') },
        armR: { sh: J('shR'), el: J('elR'), hand: J('handR') },
        legs: [{ hip: J('hipL'), knee: J('kneeL') }, { hip: J('hipR'), knee: J('kneeR') }],
        tail: opt('tail'), tail2: opt('tail2'),
        zombie: true,
      },
    };
  }
  restY() { return super.restY() * FELINO_INF_SCALE; }
  risePose(k, restY) { super.risePose(k, restY); this.model.root.scale.setScalar(FELINO_INF_SCALE); }
  vanishPose(k, restY) {
    if (this.state !== 'die') { super.vanishPose(k, restY); return; }
    bloodMelt(this, k, restY, FELINO_INF_SCALE);
  }

  pickAttack(d) {
    const c = this.cds;
    const A = this.cfg.attacks;
    if (d > 1.6 && d < A.sting.range && c.sting <= 0 && Math.random() < 0.5) return 'sting';
    return super.pickAttack(d);
  }
  attackSound(name) { return name === 'sting' ? 'whip' : super.attackSound(name); }

  swingFx(a) {
    if (a.name === 'sting') {
      const f = forwardFromYaw(this.yaw, new THREE.Vector3());
      this.world.fx.tracer(new THREE.Vector3(this.pos.x, 2.6, this.pos.z), new THREE.Vector3(this.pos.x + f.x * a.range, 0.9, this.pos.z + f.z * a.range), { color: 0xd8c098, life: 0.2, width: 0.08 });
      return;
    }
    super.swingFx(a);
  }

  pose() {
    super.pose();
    const J = this.model.joints;
    this.model.root.scale.setScalar(this.state === 'die' ? this.model.root.scale.x : FELINO_INF_SCALE);
    if (!J.tail) return;
    const t = this.t;
    let t1 = 0.25 + Math.sin(t * 2.4) * 0.15, t2 = Math.sin(t * 3.1 + 1) * 0.25;
    const a = this.state === 'attack' ? this.atk : null;
    if (a && a.name === 'sting') {
      // o rabo sobe por cima da cabeça e ferroa para a frente
      const k = Math.min(1, this.stateT / a.windup);
      if (this.stateT < a.windup) { t1 = 0.25 + 1.2 * k; t2 = 0.8 * k; } else { t1 = 1.9; t2 = 1.4; }
    }
    J.tail.rotation.set(t1, Math.sin(t * 1.7) * 0.2, 0);
    if (J.tail2) J.tail2.rotation.set(t2, 0, 0);
  }
}

// ------------------------------------------------------------------ O QUIBUNGO (o chefe)
// Mais de três metros, QUATRO BRAÇOS e a BOCARRA nas costas com a língua. ENTRADA: sai do mato da trilha, para no
// alto do morro e ruge com a língua de fora (intocável enquanto isso). Golpes: garrada, a RAJADA dos quatro braços,
// a PANCADA que racha o chão (onda em volta), a LÍNGUA que puxa de longe e o SALTO quando o alvo foge. Com metade da
// vida, o URRO: fica mais rápido. O FOGO queima mais (×1,5: lamparinas, o Cristino, as tochas).
const QUIB_SCALE = 1.6;
const INTRO_WALK = 0.55; // fração da entrada andando (o resto é o rugido)
BLOOD_ZOMBIE.quibungo = {
  ...BLOOD_ZOMBIE.strong,
  name: 'O QUIBUNGO', hp: 2600, duration: Infinity, speed: 3.6, radius: 1.3, height: 4.6,
  // DE QUATRO (dono, 2026-11-21: "ele deveria estar mais quadrúpede", "com as 4 patas no chão"): o tronco deitado e as
  // garras da frente apoiadas no chão; a cabeça (a bocarra da frente) erguida para a presa
  crouch: { hip: -0.85, knee: 1.35, chest: 0.85, neck: -0.85 },
  fireMult: 1.5,
  attacks: {
    claw: { windup: 0.38, active: 0.14, recovery: 0.45, range: 3.6, arc: 150, damage: 36, cd: 1.4, knockback: 4.5 },
    flurry: { windup: 0.45, active: 0.1, recovery: 0.6, range: 3.4, arc: 160, damage: 15, cd: 5.5, knockback: 1.5, hits: [0.45, 0.62, 0.79, 0.96] },
    slam: { windup: 0.75, active: 0.14, recovery: 0.8, range: 4.4, arc: 360, damage: 60, cd: 6, knockback: 9, knockdown: true },
    // a LÍNGUA da bocarra das costas (dono, 2026-11-20: "o quimbungo nao ataca com a lingua das costas ainda"): sobe por
    // cima dele e chicoteia até o alvo — de longe PUXA para perto; de perto vale como uma chicotada que derruba
    tongue: { windup: 0.55, active: 0.25, recovery: 0.55, range: 11, arc: 50, damage: 22, cd: 4.5, knockback: 0, pull: 7 },
    leap: { windup: 0.7, active: 0.55, recovery: 0.75, range: 3.6, arc: 180, damage: 48, cd: 9, knockback: 7, knockdown: true, dash: 15 },
    roar: { windup: 0.3, active: 1.2, recovery: 0.4, range: 99, arc: 360, damage: 0, cd: 999, knockback: 0, self: true },
    // o ARREMESSO (dono, 2026-11-21: "ainda é possivel ficar spammando ataque proximo dele. Ele deveria arremessar o
    // player pra longe caso ele ficasse proximo por muito tempo"): colado nele por QUIB_TOSS.after s, ele agarra com os
    // quatro braços e joga longe (em volta toda: não adianta ficar atrás)
    toss: { windup: 0.32, active: 0.16, recovery: 0.7, range: 4.6, arc: 360, damage: 30, cd: 0, knockback: 22, knockdown: true },
  },
  firstCd: { claw: 0.5, flurry: 2.5, slam: 3.5, tongue: 1.2, leap: 4, roar: 999, toss: 0 },
  enrage: { at: 0.5, speed: 1.3, cd: 0.7 },
};
// quanto tempo colado nele até o ARREMESSO (no Aniquilação, menos) e o que conta como "colado". PROPOSTA.
const QUIB_TOSS = { close: 4.2, after: 2.6, afterHard: 1.7 };
// o aviso para quem está lutando com ele (o jogador e, no coop, o outro)
function tgNotify(q, text) {
  for (const f of q.world.fighters) if (f !== q.owner && !f.lurking && f.notify) f.notify(text, true);
}
// A INVESTIDA (dono: "ele dar uma investida que atravessa o mapa até a outra ponta e desse muito dano, mas se o player
// desviar, ele bate a cabeça e fica zonzo, dando abertura pra ataca-lo"): abaixa a cabeça e marca o caminho no chão
// (preparo), dispara em linha reta até a borda do mapa atropelando quem estiver na frente; se não pegou ninguém, BATE A
// CABEÇA na borda e fica ZONZO (apanha mais). PROPOSTA: todos os números.
const QUIB_CHARGE = { windup: 1.15, aimUntil: 0.8, speed: 26, maxDist: 44, damage: 80, damageHard: 100, knockback: 13, cd: 12, first: 6, minDist: 5, dizzy: 3.4, dizzyTaken: 1.35, after: 0.8 };

export class Quibungo extends BloodZombie {
  configFor() { return BLOOD_ZOMBIE.quibungo; }
  buildModel() {
    this.strong = true;
    this.isMarionette = false;
    this.giant = true;
    this.bossBar = true;
    this.noLeave = true; // o chefe não vai embora (npcs.js)
    // só "QUIBUNGO" (dono, 2026-11-20: "São coisas diferentes era pra ser apenas 'Quibungo'" — a Coroa é o lugar)
    this.barName = 'QUIBUNGO';
    this.barOwner = '';
    this.barStyle = 'blood';
    // a entrada: do mato da trilha (atrás e abaixo, ~10 m) até o ponto do morro onde o Dungeon o pôs
    this.introTo = this.pos.clone();
    this.introFrom = new THREE.Vector3(this.pos.x - 3, 0, this.pos.z - 10);
    this.pos.copy(this.introFrom);
    const m = buildNpcModel('quibungo', { outline: 0.016, noOutline: ['vein', 'fang', 'claw', 'gum', 'maw', 'spine', 'glow'] });
    if (!m) return buildBloodZombie(true);
    const J = m.joint;
    const opt = (n) => { try { return J(n); } catch { return null; } };
    const arm = (n) => ({ sh: J('sh' + n), el: J('el' + n), hand: J('hand' + n) });
    return {
      root: m.root,
      joints: {
        body: J('body'), chest: J('chest'), neck: J('neck'), jaw: J('jaw'),
        armL: arm('L'), armR: arm('R'), armL2: arm('L2'), armR2: arm('R2'),
        mandL: opt('mandL'), mandR: opt('mandR'),
        tongue: [opt('tongue'), opt('tongue2'), opt('tongue3')],
        legs: [{ hip: J('hipL'), knee: J('kneeL') }, { hip: J('hipR'), knee: J('kneeR') }],
        zombie: true,
      },
    };
  }
  chooseTarget() { this.target = this.owner.opponent; }
  restY() { return BloodZombie.prototype.restY.call(this) * QUIB_SCALE; }

  // ---- a ENTRADA: sai do mato andando, para e RUGE com a língua de fora
  riseTime() { return 4.4; }
  risePose(k, restY) {
    const root = this.model.root;
    const w = Math.min(1, k / INTRO_WALK);
    const px = this.pos.x, pz = this.pos.z;
    this.pos.lerpVectors(this.introFrom, this.introTo, 1 - (1 - w) * (1 - w) * 0.3 - (1 - w) * 0.7);
    this.gait += Math.hypot(this.pos.x - px, this.pos.z - pz);
    this.introWalk = w < 1;
    this.introRoar = k > INTRO_WALK ? (k - INTRO_WALK) / (1 - INTRO_WALK) : 0;
    this.yaw = yawTo(this.pos, this.introTo.clone().add(new THREE.Vector3(0, 0, 5)));
    // sobe a encosta: começa mais baixo no mato
    root.position.set(this.pos.x, restY - 1.2 * (1 - w), this.pos.z);
    root.scale.setScalar(QUIB_SCALE);
    const W = this.world;
    if (this.introWalk && Math.random() < 0.3) W.fx.burst(new THREE.Vector3(this.pos.x + (Math.random() - 0.5) * 2, 0.3, this.pos.z), { count: 3, color: 0x2a3a20, speed: 2, up: 2.5, life: 0.6, size: 0.18, gravity: 8 }); // o mato quebrando
    if (this.introRoar > 0 && !this.roared) {
      this.roared = true;
      W.audio.play('fearGaze', { volume: 1, pitch: 0.3 });
      W.audio.play('drain', { volume: 0.9, pitch: 0.4 });
      W.cameraRig && W.cameraRig.shake(0.5, 1.4);
    }
    if (this.introRoar > 0 && this.introRoar < 0.8 && Math.random() < 0.25) {
      W.fx.burst(new THREE.Vector3(this.pos.x, 0.2, this.pos.z), { count: 6, color: DUST, kind: 'smoke', speed: 3, up: 0.5, life: 0.7, size: 0.8 });
      if (Math.random() < 0.3) W.audio.play('fearGaze', { volume: 0.5, pitch: 0.25 + Math.random() * 0.1 }); // grunhidos
    }
  }
  vanishPose(k, restY) {
    if (this.state !== 'die') { super.vanishPose(k, restY); this.model.root.scale.multiplyScalar(QUIB_SCALE); return; }
    bloodMelt(this, k, restY, QUIB_SCALE);
  }

  pickAttack(d) {
    const c = this.cds;
    const A = this.cfg.attacks;
    if (d > 4 && d < A.tongue.range - 0.5 && c.tongue <= 0) return 'tongue';
    if ((this.closeT || 0) >= (this.hard ? QUIB_TOSS.afterHard : QUIB_TOSS.after) && d < A.toss.range) { this.closeT = 0; return 'toss'; }
    if (d > 6.5 && d < 13 && c.leap <= 0 && Math.random() < 0.5) return 'leap';
    if (d > 2.2 && c.tongue <= 0 && Math.random() < 0.3) return 'tongue';
    if (d < 3.6 && c.slam <= 0 && Math.random() < 0.35) return 'slam';
    if (d < 3.2 && c.flurry <= 0 && Math.random() < 0.45) return 'flurry';
    if (d < A.claw.range - 0.3 && c.claw <= 0) return 'claw';
    return null;
  }
  attackSound(name) { return name === 'toss' ? 'heavyPunch' : name === 'tongue' ? 'whip' : name === 'leap' ? 'jump' : name === 'roar' ? 'fearGaze' : name === 'claw' ? 'swing' : 'bloodClaw'; }
  stepSpeed(d) { return this.cfg.speed * (this.enraged ? this.cfg.enrage.speed : 1) * (d > 7 ? 1.25 : 1); }
  // no SALTO o corpo sobe num arco
  bob() {
    const a = this.state === 'attack' ? this.atk : null;
    if (a && a.name === 'leap' && this.stateT >= a.windup && this.stateT < a.windup + a.active) return Math.sin(((this.stateT - a.windup) / a.active) * Math.PI) * 3;
    return super.bob();
  }

  // A LUA DE SANGUE (pve/kerberosInferno.js, só no Aniquilação): ele para, não apanha mais e DERRETE numa gosma; no
  // fim some sem contar como abate (quem vem é o Kerberos, que nasce da gosma antes de ele sumir)
  startMelt(time, onDone) {
    if (!this.alive || this.state === 'die') return;
    this.atk = null;
    this.release && this.release(false);
    this.meltTime = time;
    this.onMelted = onDone;
    this.charge = null;
    this.clearChargeMark();
    this.setState('melt');
    this.world.audio.play('fearGaze', { volume: 1, pitch: 0.25 });
  }
  hitTest(p, r) { return this.state !== 'melt' && super.hitTest(p, r); }

  update(dt) {
    if (this.state === 'charge' || this.state === 'dizzy') { this.updateCharge(dt); this.updateTongue(); return; }
    if (this.state === 'melt') {
      if (!this.alive) return;
      this.t += dt;
      this.stateT += dt;
      const k = Math.min(1, this.stateT / this.meltTime);
      this.pose();
      bloodMelt(this, k, this.restY(), QUIB_SCALE);
      this.model.root.position.x = this.pos.x;
      this.model.root.position.z = this.pos.z;
      if (k >= 0.75 && this.onMelted) { const f = this.onMelted; this.onMelted = null; f(); }
      if (k >= 1) this.dispose();
      return;
    }
    // o URRO: com metade da vida, para e ruge uma vez; dali em diante, mais rápido e com os golpes voltando antes
    if (this.alive && this.state === 'chase' && !this.enraged && this.hp < this.maxHp * this.cfg.enrage.at) {
      this.enraged = true;
      this.atk = { name: 'roar', ...this.cfg.attacks.roar, done: [], swung: [] };
      this.setState('attack');
      this.world.audio.play('fearGaze', { volume: 1, pitch: 0.28 });
    }
    if (this.enraged && this.state === 'chase') for (const k in this.cds) this.cds[k] = Math.max(0, this.cds[k] - dt * (1 / this.cfg.enrage.cd - 1));
    // COLADO NELE: o tempo que o alvo passa perto enche a conta do ARREMESSO (longe, ela esvazia)
    const tg = this.target;
    if (this.alive && tg && tg.state !== 'ko' && (this.state === 'chase' || this.state === 'attack')) {
      const d = distXZ(this.pos, tg.pos);
      this.closeT = d < QUIB_TOSS.close ? (this.closeT || 0) + dt : Math.max(0, (this.closeT || 0) - dt * 1.5);
      // a INVESTIDA: fora de um golpe, com o alvo a alguns metros
      if (this.chargeCd === undefined) this.chargeCd = QUIB_CHARGE.first;
      this.chargeCd -= dt * (this.enraged ? 1.4 : 1);
      if (this.state === 'chase' && this.chargeCd <= 0 && d > QUIB_CHARGE.minDist && tg.state !== 'downed' && !this.world.cinematic) { this.startCharge(); return; }
    }
    const r = super.update(dt);
    if (this.alive) this.updateTongue();
    return r;
  }

  // ---- A INVESTIDA e o ZONZO
  startCharge() {
    this.atk = null;
    this.closeT = 0;
    this.charge = { dir: new THREE.Vector3(), gone: 0, go: false, hit: [], hitAny: false, endT: null };
    this.setState('charge');
    this.world.audio.play('fearGaze', { volume: 0.9, pitch: 0.32 });
    tgNotify(this, 'O QUIBUNGO VAI INVESTIR!');
  }

  // o caminho até a borda (onde ele vai bater): anda em passos pelo mapa até a parede ou o limite
  chargeLength(dir) {
    const p = this.pos.clone();
    let L = 0;
    for (; L < QUIB_CHARGE.maxDist; L += 0.8) {
      const nx = p.x + dir.x * 0.8, nz = p.z + dir.z * 0.8;
      p.set(nx, 0, nz);
      resolveBody(this.bounds, p, this.radius);
      if ((p.x - nx) * (p.x - nx) + (p.z - nz) * (p.z - nz) > 0.09) break;
    }
    return Math.max(2, L);
  }

  // a faixa vermelha no chão: o aviso de por onde ele vai passar
  updateChargeMark(len) {
    if (!this.chargeMark) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
      m.rotation.order = 'YXZ';
      m.renderOrder = 4;
      this.world.scene.add(m);
      this.chargeMark = m;
    }
    const m = this.chargeMark;
    m.position.set(this.pos.x, 0.06, this.pos.z);
    m.rotation.set(Math.PI / 2, this.yaw, 0);
    m.scale.set(this.radius * 2.2, len, 1);
    m.material.opacity = 0.25 + 0.2 * Math.abs(Math.sin(this.t * 14));
    m.visible = true;
  }

  clearChargeMark() {
    if (!this.chargeMark) return;
    this.world.scene.remove(this.chargeMark);
    this.chargeMark.geometry.dispose();
    this.chargeMark.material.dispose();
    this.chargeMark = null;
  }

  updateCharge(dt) {
    const C = QUIB_CHARGE;
    const w = this.world;
    const ch = this.charge;
    this.t += dt;
    this.stateT += dt;
    for (const k in this.cds) this.cds[k] = Math.max(0, this.cds[k] - dt);
    if (this.flash > 0) this.flash -= dt;
    const px = this.pos.x, pz = this.pos.z;
    if (this.state === 'charge' && ch) {
      if (!ch.go) {
        // o PREPARO: mira no alvo, raspa o chão e marca o caminho; nos últimos instantes a mira trava (dá para sair)
        const tg = this.target;
        if (tg && this.stateT < C.aimUntil) this.yaw = yawTo(this.pos, tg.pos);
        ch.dir.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
        this.updateChargeMark(this.chargeLength(ch.dir));
        if (Math.random() < 0.35) w.fx.burst(new THREE.Vector3(this.pos.x - ch.dir.x * 1.5, 0.2, this.pos.z - ch.dir.z * 1.5), { count: 3, color: DUST, kind: 'smoke', speed: 2, up: 0.6, life: 0.5, size: 0.6 });
        if (this.stateT >= C.windup) {
          ch.go = true;
          this.clearChargeMark();
          w.audio.play('dash', { volume: 1, pitch: 0.5 });
          w.audio.play('fearGaze', { volume: 0.8, pitch: 0.4 });
          w.cameraRig && w.cameraRig.shake(0.3, 0.4);
        }
      } else if (ch.endT === null) {
        // a CORRIDA: reto pelo mapa; atropela quem estiver no caminho e segue
        const step = C.speed * dt;
        this.pos.x += ch.dir.x * step;
        this.pos.z += ch.dir.z * step;
        resolveBody(this.bounds, this.pos, this.radius);
        const adv = (this.pos.x - px) * ch.dir.x + (this.pos.z - pz) * ch.dir.z;
        ch.gone += Math.max(0, adv);
        for (const f of w.fighters) {
          if (f === this.owner || f.lurking || f.state === 'ko' || ch.hit.includes(f) || f.visible === false) continue;
          if (distXZ(f.pos, this.pos) > this.radius + (f.radius || 0.4) + 0.5 || Math.abs(f.pos.y - this.pos.y) > 2.6) continue;
          ch.hit.push(f);
          if (f.isInvulnerable && f.isInvulnerable()) continue; // desviou (esquiva): não conta como pego
          ch.hitAny = true;
          const side = new THREE.Vector3(f.pos.x - this.pos.x, 0, f.pos.z - this.pos.z);
          const dir = ch.dir.clone().multiplyScalar(1.5).add(side.normalize().multiplyScalar(0.6)).normalize();
          applyHit(w, this.owner, f, { damage: this.hard ? C.damageHard : C.damage, kind: 'ability', element: 'sangue', knockback: C.knockback, launch: true, dir, sound: 'heavyPunch', color: 0xd02030, scale: 2 });
          f.notify && f.notify('A INVESTIDA DO QUIBUNGO', true);
          w.cameraRig && w.cameraRig.shake(0.45, 0.4);
        }
        if (Math.random() < 0.6) w.fx.burst(new THREE.Vector3(this.pos.x, 0.25, this.pos.z), { count: 3, color: DUST, kind: 'smoke', speed: 2.5, up: 0.8, life: 0.6, size: 0.8 });
        const wall = adv < step * 0.5;
        if (wall || ch.gone >= C.maxDist) {
          ch.endT = this.stateT;
          if (!ch.hitAny) this.bonk(wall);
        }
      } else if (this.stateT - ch.endT >= C.after) {
        // pegou alguém: só freia e volta a caçar
        this.charge = null;
        this.chargeCd = C.cd;
        this.setState('chase');
      }
    } else if (this.state === 'dizzy') {
      // ZONZO: cambaleia, as estrelas giram em volta da cabeça; apanha mais (hitBy)
      if (Math.random() < 0.3) {
        const a = this.t * 6 + Math.random();
        w.fx.burst(new THREE.Vector3(this.pos.x + Math.sin(a) * 1.4, this.restY() + this.height * 0.75, this.pos.z + Math.cos(a) * 1.4), { count: 1, color: 0xffe27a, speed: 0.4, up: 0.3, life: 0.5, size: 0.18 });
      }
      if (this.stateT >= C.dizzy) {
        this.charge = null;
        this.chargeCd = C.cd;
        this.setState('chase');
      }
    } else {
      this.setState('chase');
    }
    this.gait += Math.hypot(this.pos.x - px, this.pos.z - pz);
    this.model.root.position.set(this.pos.x, this.restY(), this.pos.z);
    this.pose();
  }

  // BATEU A CABEÇA na borda: poeira, o tranco e fica ZONZO
  bonk(wall) {
    const w = this.world;
    const f = forwardFromYaw(this.yaw, new THREE.Vector3());
    const at = new THREE.Vector3(this.pos.x + f.x * this.radius, 2.2, this.pos.z + f.z * this.radius);
    w.fx.burst(at, { count: 26, color: DUST, kind: 'smoke', speed: 4, up: 1.5, life: 0.8, size: 1 });
    w.fx.burst(at, { count: 18, color: 0xffe27a, speed: 5, up: 2.5, life: 0.5, size: 0.14 });
    w.audio.play(wall ? 'explosion' : 'heavyPunch', { volume: 0.8, pitch: 0.6 });
    w.cameraRig && w.cameraRig.shake(0.5, 0.5);
    this.setState('dizzy');
    tgNotify(this, 'O QUIBUNGO ESTÁ ZONZO! ATAQUE!');
  }

  // A LÍNGUA DO ATAQUE: um tubo de carne que sai da bocarra das costas, sobe por cima dele (o aviso), estica até o alvo
  // e volta. A língua do modelo some enquanto isso (ela "virou" este tubo).
  updateTongue() {
    const a = this.state === 'attack' && this.atk && this.atk.pull ? this.atk : null;
    const J = this.model.joints;
    const g1 = J.tongue && J.tongue[0];
    if (!a) {
      if (this.lash) this.lash.visible = false;
      if (g1) g1.visible = true;
      return;
    }
    if (!this.lash) {
      const mat = new THREE.MeshToonMaterial({ color: 0x8a2a4a, emissive: 0x2a0610 });
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.7, 1, 10, 1).translate(0, 0.5, 0), mat);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 8), mat);
      g.add(body, tip);
      g.userData = { body, tip };
      this.world.scene.add(g);
      this.lash = g;
    }
    const st = this.stateT;
    const from = (g1 || this.model.root).getWorldPosition(new THREE.Vector3());
    const tg = a.caught || this.target;
    const goal = tg ? tg.chestPos() : from.clone().add(forwardFromYaw(this.yaw, new THREE.Vector3()).multiplyScalar(6));
    if (st < a.windup && tg) a.aim = goal.clone(); // mira até o fim do aviso; depois de lançada, dá para esquivar
    const aim = a.caught ? goal : a.aim || goal;
    const up = from.clone().add(new THREE.Vector3(0, 2.4, 0)).addScaledVector(forwardFromYaw(this.yaw, new THREE.Vector3()), -0.6);
    let tip;
    if (st < a.windup) tip = from.clone().lerp(up, Math.min(1, st / (a.windup * 0.7))); // sobe por cima, se debatendo
    else if (st < a.windup + a.active) tip = up.clone().lerp(aim, Math.min(1, (st - a.windup) / (a.active * 0.6)));
    else tip = aim.clone().lerp(from, Math.min(1, (st - a.windup - a.active) / (a.recovery * 0.8)));
    if (st < a.windup) tip.x += Math.sin(st * 30) * 0.15;
    const dir = tip.clone().sub(from);
    const len = Math.max(0.05, dir.length());
    const L = this.lash;
    L.visible = true;
    L.position.copy(from);
    L.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    const r = 0.11;
    L.userData.body.scale.set(r, len, r);
    L.userData.tip.scale.setScalar(r);
    L.userData.tip.position.set(0, len, 0);
    if (g1) g1.visible = false;
    // quem foi pego vem junto com a língua de volta
    if (a.caught && st > a.windup + a.active && a.caught.state !== 'ko') {
      const c = a.caught;
      const toMe = new THREE.Vector3(this.pos.x - c.pos.x, 0, this.pos.z - c.pos.z);
      if (toMe.length() > this.radius + 1.4) { c.pos.x = tip.x; c.pos.z = tip.z; }
    }
  }

  dispose() {
    this.clearChargeMark();
    if (this.lash) {
      this.world.scene.remove(this.lash);
      this.lash.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      this.lash.userData.body.material.dispose();
      this.lash = null;
    }
    super.dispose();
  }

  strike(a, tg, d) {
    if (a.self) {
      // URRO
      const W = this.world;
      W.cameraRig && W.cameraRig.shake(0.45, 1.0);
      W.fx.ring(new THREE.Vector3(this.pos.x, 0.1, this.pos.z), { color: 0xc0202c, radius: 7, life: 0.8, inner: 0.85 });
      this.owner.notify && this.owner.notify('O QUIBUNGO ENFURECEU', true);
      tg && tg.notify && tg.notify('O QUIBUNGO ENFURECEU', true);
      return true;
    }
    if (a.name === 'toss') {
      // o ARREMESSO: joga para LONGE dele (para fora, em qualquer lado), num arco alto — o lançamento baixo do golpe
      // comum (lowLaunch) mal tirava o alvo do lugar
      if (d - tg.radius > a.range || Math.abs(tg.pos.y - this.pos.y) > 2.6 || tg.isInvulnerable()) return true;
      const out = new THREE.Vector3(tg.pos.x - this.pos.x, 0, tg.pos.z - this.pos.z);
      if (out.lengthSq() < 1e-4) forwardFromYaw(this.yaw, out);
      applyHit(this.world, this.owner, tg, { damage: a.damage, kind: 'ability', element: 'sangue', knockback: a.knockback, launch: true, dir: out.normalize(), sound: 'heavyPunch', color: 0xd02030, scale: 1.8 });
      tg.notify && tg.notify('O QUIBUNGO TE ARREMESSOU', true);
      return true;
    }
    if (a.pull) {
      // a LÍNGUA da bocarra das costas: acerta de longe e PUXA o alvo para perto
      const inArc = Math.abs(angleDiff(this.yaw, yawTo(this.pos, tg.pos))) <= (a.arc * DEG) / 2;
      if (!(d - tg.radius <= a.range && inArc && Math.abs(tg.pos.y - this.pos.y) < 2.6) || tg.isInvulnerable()) return true;
      // de longe puxa para perto; de perto a chicotada derruba para trás
      const far = d > 4;
      const dir = far ? new THREE.Vector3(this.pos.x - tg.pos.x, 0, this.pos.z - tg.pos.z).normalize() : forwardFromYaw(this.yaw, new THREE.Vector3());
      applyHit(this.world, this.owner, tg, { damage: a.damage, kind: 'ability', element: 'sangue', knockback: far ? a.pull : 4, launch: !far, lowLaunch: !far, dir, sound: 'whip', color: 0x8a2a4a, scale: 1.2 });
      a.caught = tg;
      tg.notify && tg.notify('A LÍNGUA DO QUIBUNGO', true);
      return true;
    }
    return super.strike(a, tg, d);
  }

  swingFx(a, i) {
    const W = this.world;
    if (a.self) return;
    if (a.pull) return; // a língua é uma peça de verdade (updateTongue)
    if (a.name === 'toss') {
      W.cameraRig && W.cameraRig.shake(0.35, 0.3);
      W.fx.ring(new THREE.Vector3(this.pos.x, 0.08, this.pos.z), { color: 0xc0202c, radius: a.range, life: 0.4, inner: 0.75 });
      return;
    }
    if (a.name === 'slam' || a.name === 'leap') {
      W.cameraRig && W.cameraRig.shake(0.4, 0.35);
      W.fx.ring(new THREE.Vector3(this.pos.x, 0.08, this.pos.z), { color: DUST, radius: a.range + 0.6, life: 0.5, inner: 0.7 });
      W.fx.burst(new THREE.Vector3(this.pos.x, 0.3, this.pos.z), { count: 18, color: DUST, kind: 'smoke', speed: 4, up: 0.6, life: 0.7, size: 0.9 });
      W.audio.play('shockwave', { volume: 0.8, pitch: 0.7 });
      return;
    }
    const roll = a.name === 'flurry' ? (i % 2 ? 0.6 : -0.6) : -0.3;
    W.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + 2.2, this.pos.z), this.yaw, { color: 0xd02030, radius: a.range, arc: 2.4, life: 0.2, width: 0.4, roll });
  }

  // o FOGO queima mais
  hitBy(attacker, dmg, info) {
    if (this.state === 'melt') return;
    if (this.state === 'dizzy') dmg *= QUIB_CHARGE.dizzyTaken; // ZONZO: a abertura
    if (info && info.fire && this.alive && this.state !== 'die') {
      dmg *= this.cfg.fireMult;
      this.world.fx.burst(new THREE.Vector3(this.pos.x, 2.4, this.pos.z), { count: 8, color: 0xff7a2a, speed: 2, up: 2.5, life: 0.5, size: 0.35 });
      if (!this.fireWarned) {
        this.fireWarned = true;
        attacker && attacker.notify && attacker.notify('O FOGO QUEIMA O QUIBUNGO!', true);
      }
    }
    super.hitBy(attacker, dmg, info);
  }

  pose() {
    super.pose();
    const J = this.model.joints;
    if (!J.armL2) return;
    const t = this.t;
    const C = this.cfg.crouch;
    const a = this.state === 'attack' ? this.atk : null;
    const st = this.stateT;
    const roar = this.state === 'rise' ? this.introRoar : a && a.name === 'roar' ? Math.min(1, st / 0.3) * (st > a.windup + a.active ? Math.max(0, 1 - (st - a.windup - a.active) / a.recovery) : 1) : 0;
    // andando na entrada: as pernas passam (o BloodZombie só anda em 'chase')
    if (this.state === 'rise' && this.introWalk) {
      const s1 = Math.sin(this.gait * 2.2);
      for (const [i, l] of J.legs.entries()) {
        const s = i ? -s1 : s1;
        l.hip.rotation.x += s * 0.45;
        l.knee.rotation.x = C.knee + Math.max(0, -s) * 0.5;
      }
    }
    const chest = J.chest.rotation.x;
    const armBase = -chest - 0.4;
    // o 2º par de braços acompanha o 1º, defasado
    let l2 = [armBase + Math.sin(t * 2.3) * 0.15, 0, 0.45], r2 = [armBase - Math.sin(t * 2.3) * 0.15, 0, -0.45];
    let e2 = -0.5;
    if (a && a.name === 'flurry') {
      // a RAJADA: os quatro braços descem um depois do outro (R, L, R2, L2)
      const hits = a.hits;
      const ph = hits.map((h) => Math.max(0, Math.min(1, (st - h + 0.18) / 0.22)));
      const sw = (k) => armBase - 2.2 + k * 2.4;
      J.armR.sh.rotation.x = sw(ph[0]);
      J.armL.sh.rotation.x = sw(ph[1]);
      r2 = [sw(ph[2]), 0, -0.6];
      l2 = [sw(ph[3]), 0, 0.6];
      e2 = -0.3;
    } else if (a && (a.name === 'slam' || a.name === 'leap')) {
      l2 = [J.armL.sh.rotation.x, 0, 0.6];
      r2 = [J.armR.sh.rotation.x, 0, -0.6];
    }
    if (roar > 0) {
      // RUGIDO: abre os quatro braços, ergue o tronco, a boca e as mandíbulas escancaradas
      J.chest.rotation.x = chest - 0.45 * roar;
      J.neck.rotation.x += -0.5 * roar + Math.sin(t * 40) * 0.04 * roar;
      J.armL.sh.rotation.set(armBase - 0.8 * roar, 0, 0.25 + 1.0 * roar);
      J.armR.sh.rotation.set(armBase - 0.8 * roar, 0, -0.25 - 1.0 * roar);
      l2 = [armBase - 0.3 * roar, 0, 0.45 + 0.9 * roar];
      r2 = [armBase - 0.3 * roar, 0, -0.45 - 0.9 * roar];
      if (J.jaw) J.jaw.rotation.x = 0.2 + 0.8 * roar;
    }
    // a INVESTIDA: cabeça baixa no preparo, a corrida a galope; ZONZO: a cabeça e o corpo balançam
    if (this.state === 'charge' && this.charge) {
      const ch = this.charge;
      if (!ch.go) { J.chest.rotation.x += 0.25; J.neck.rotation.x += 0.45; }
      else if (ch.endT === null) {
        const s1 = Math.sin(this.gait * 1.6);
        for (const [i, l] of J.legs.entries()) l.hip.rotation.x += (i ? -s1 : s1) * 0.6;
        J.armL.sh.rotation.x += s1 * 0.6;
        J.armR.sh.rotation.x -= s1 * 0.6;
        l2 = [l2[0] - s1 * 0.5, l2[1], l2[2]];
        r2 = [r2[0] + s1 * 0.5, r2[1], r2[2]];
        J.neck.rotation.x += 0.35;
      }
    } else if (this.state === 'dizzy') {
      const k = Math.min(1, this.stateT / 0.25);
      J.neck.rotation.z = Math.sin(t * 5) * 0.35 * k;
      J.neck.rotation.x += 0.3 * k;
      this.model.root.rotation.z = Math.sin(t * 3.2) * 0.07 * k;
      if (J.jaw) J.jaw.rotation.x = 0.45;
    } else {
      if (this.model.root.rotation.z) this.model.root.rotation.z = 0;
      J.neck.rotation.z = 0;
    }
    J.armL2.sh.rotation.set(l2[0], l2[1], l2[2]);
    J.armR2.sh.rotation.set(r2[0], r2[1], r2[2]);
    J.armL2.el.rotation.x = e2;
    J.armR2.el.rotation.x = e2;
    const jaw = J.jaw ? J.jaw.rotation.x : 0.3;
    if (J.mandL) J.mandL.rotation.y = -0.15 - jaw * 0.5;
    if (J.mandR) J.mandR.rotation.y = 0.15 + jaw * 0.5;
    // a LÍNGUA: balança para fora da bocarra; no rugido, se debate; no golpe, estica para a frente por cima da cabeça
    const [g1, g2, g3] = J.tongue;
    if (g1) {
      let a1 = Math.sin(t * 1.8) * 0.2, a2 = Math.sin(t * 2.4 + 1) * 0.3, a3 = Math.sin(t * 3.1 + 2) * 0.4;
      if (roar > 0) { a1 += Math.sin(t * 11) * 0.35 * roar; a2 += Math.sin(t * 13 + 1) * 0.5 * roar; a3 += Math.sin(t * 15) * 0.6 * roar; }
      if (a && a.pull) {
        const k = Math.min(1, st / a.windup);
        const out = st < a.windup ? k : st < a.windup + a.active + 0.2 ? 1 : Math.max(0, 1 - (st - a.windup - a.active - 0.2) / a.recovery);
        a1 = -0.3 * k + 1.3 * out; a2 = 0.4 * out; a3 = -0.6 * out;
      }
      g1.rotation.set(a1, 0, Math.sin(t * 1.3) * 0.15);
      if (g2) g2.rotation.set(a2, 0, 0);
      if (g3) g3.rotation.set(a3, Math.sin(t * 2) * 0.2, 0);
    }
    this.model.root.scale.setScalar(this.state === 'die' || this.state === 'melt' ? this.model.root.scale.x : QUIB_SCALE);
  }
}

// ------------------------------------------------------------------ O KERBEROS (a 2ª forma do Quibungo no Aniquilação)
// Hexatombe ep. 10 (wiki "Kerberos"): criatura de Sangue com mais de 3 m de altura e 7 de comprimento, SEIS patas
// caninas, uma cauda enorme e TRÊS CABEÇAS (o verme dentado, a canina com sete dentes enormes, a insetoide com quatro
// quelíceras). Os golpes seguem as habilidades da wiki: MORDIDA, DISPARO DE ESPINHOS, ATAQUE FLEXÍVEL (a cauda),
// DEVORAR (a mordida cura) e DERRUBAR E DEVORAR (o bote). Dono, 2026-11-20: no Aniquilação, se o Quibungo demora a
// morrer, a lua fica de sangue, chove sangue, ele derrete numa gosma e o Kerberos sai do corpo dele
// (pve/kerberosInferno.js). PROPOSTA: todos os números, o tempo e a forma dos golpes.
const KB_SCALE = 1.35;
// MAIS AGRESSIVO (dono, 2026-11-28: "o kerberos é mais sobre quanto tempo você aguenta nele do que se você consegue
// mata-lo, ele deve ser mais agressivo, atacar mais"): mais rápido, armadas e recargas menores (antes speed 5,2; bite cd
// 1,5; tail 5,5; spikes 6; pounce 8). E a FÚRIA que sobe com o tempo (`rage`, pve/kerberosInferno.js). PROPOSTA.
export const KERBEROS = {
  name: 'KERBEROS', hp: 3400, duration: Infinity, speed: 6.2, radius: 1.9, height: 3.4,
  element: 'sangue', fxColor: BLOOD, poolColor: 0x5a0008, noPool: true,
  attacks: {
    // as três cabeças mordem juntas; a mordida que pega DEVORA (cura o Kerberos)
    bite: { windup: 0.36, active: 0.16, recovery: 0.38, range: 4.4, arc: 130, damage: 40, cd: 0.95, knockback: 3.5, devour: 0.03 },
    // a cauda varre em volta (o ataque flexível)
    tail: { windup: 0.5, active: 0.3, recovery: 0.5, range: 5.6, arc: 360, damage: 44, cd: 3.6, knockback: 7, knockdown: true },
    // o DISPARO DE ESPINHOS: as costas se eriçam e uma rajada de espinhos sai em leque
    spikes: { windup: 0.6, active: 0.3, recovery: 0.55, range: 16, arc: 70, damage: 18, cd: 4, knockback: 1.5, volley: 9 },
    // DERRUBAR E DEVORAR: o bote de longe; quem é pego cai e é mordido (cura)
    pounce: { windup: 0.55, active: 0.45, recovery: 0.65, range: 3.6, arc: 160, damage: 62, cd: 5, knockback: 5, knockdown: true, dash: 19, devour: 0.05 },
  },
  firstCd: { bite: 0.4, tail: 3, spikes: 2.5, pounce: 1.5 },
};

export class Kerberos extends InkBeast {
  configFor() { return KERBEROS; }
  buildModel() {
    this.kind = 'kerberos';
    this.isMarionette = false;
    this.isInkBeast = true;
    this.giant = true;
    this.bossBar = true;
    this.barName = 'KERBEROS';
    this.noLeave = true;
    this.barOwner = '';
    this.barStyle = 'blood';
    this.spikes = [];
    const m = buildNpcModel('kerberos', { outline: 0.014, noOutline: ['vein', 'fang', 'claw', 'gum', 'maw', 'spine', 'bone'] });
    if (!m) {
      const b = buildInkBeast('cao');
      b.root.scale.setScalar(3);
      return b;
    }
    const J = m.joint;
    const opt = (n) => { try { return J(n); } catch { return null; } };
    return {
      root: m.root,
      joints: {
        body: J('body'), torso: J('torso'), tail: opt('tail'), tail2: opt('tail2'),
        necks: ['L', 'C', 'R'].map((n) => opt('neck' + n)), jaws: ['L', 'C', 'R'].map((n) => opt('jaw' + n)),
        legs: ['FL', 'FR', 'ML', 'MR', 'BL', 'BR'].map((n) => ({ hip: J('leg' + n), knee: J('knee' + n) })),
      },
    };
  }
  chooseTarget() { this.target = this.owner.opponent; }
  restY() { return 0; }
  bob() { return Math.abs(Math.sin(this.gait * 1.6)) * 0.08; }
  stepSpeed(d) { return this.cfg.speed * (d > 7 ? 1.35 : 1) * (this.rage || 1); }
  attackSound(name) { return name === 'tail' ? 'whip' : name === 'spikes' ? 'drain' : name === 'pounce' ? 'jump' : 'bloodClaw'; }

  pickAttack(d) {
    const c = this.cds;
    const A = this.cfg.attacks;
    if (d > 6 && d < 13 && c.pounce <= 0 && Math.random() < 0.75) return 'pounce';
    if (d > 5 && d < A.spikes.range - 1 && c.spikes <= 0) return 'spikes';
    if (d < A.tail.range - 0.4 && c.tail <= 0 && Math.random() < 0.35) return 'tail';
    if (d < A.bite.range - 0.3 && c.bite <= 0) return 'bite';
    return null;
  }

  // NASCE DA GOSMA do Quibungo: sobe do chão encolhido, se desdobrando, jorrando sangue
  riseTime() { return 3.6; }
  risePose(k) {
    const root = this.model.root;
    const e = 1 - (1 - k) * (1 - k);
    root.position.set(this.pos.x, -2.4 * (1 - e), this.pos.z);
    root.scale.setScalar(KB_SCALE * (0.35 + 0.65 * e));
    root.rotation.y = this.yaw;
    const W = this.world;
    if (Math.random() < 0.6) W.fx.burst(new THREE.Vector3(this.pos.x + (Math.random() - 0.5) * 2, 0.4 + e * 2, this.pos.z + (Math.random() - 0.5) * 2), { count: 5, color: 0xa01018, speed: 3, up: 3, life: 0.7, size: 0.22, gravity: 9 });
    if (k > 0.85 && !this.howled) {
      this.howled = true;
      W.audio.play('fearGaze', { volume: 1, pitch: 0.22 });
      W.audio.play('drain', { volume: 0.9, pitch: 0.3 });
      W.cameraRig && W.cameraRig.shake(0.55, 1.2);
    }
  }
  vanishPose(k, restY) {
    if (this.state !== 'die') { this.model.root.position.y = -k * 3; return; }
    bloodMelt(this, k, restY, KB_SCALE);
  }

  strike(a, tg, d) {
    if (a.volley) { this.fireSpikes(a, tg); return true; }
    const hit = Marionette.prototype.strike.call(this, a, tg, d);
    // DEVORAR: a mordida que pega cura (uma fração da vida máxima)
    if (hit && a.devour && this.hp > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * a.devour);
      this.world.fx.burst(new THREE.Vector3(this.pos.x, 2.4, this.pos.z), { count: 10, color: 0xff3040, speed: 2, up: 2, life: 0.6, size: 0.25 });
      if (!this.devourWarned) { this.devourWarned = true; tg.notify && tg.notify('O KERBEROS DEVORA: ELE SE CURA', true); }
    }
    return hit;
  }

  // a rajada: espinhos de osso voando em leque (desviáveis; cada um acerta uma vez)
  fireSpikes(a, tg) {
    const W = this.world;
    const from = new THREE.Vector3(this.pos.x, 2.9, this.pos.z);
    const aim = tg.chestPos();
    const base = yawTo(this.pos, aim);
    if (!Kerberos.spikeGeo) {
      Kerberos.spikeGeo = new THREE.ConeGeometry(0.09, 0.9, 6).rotateX(Math.PI / 2);
      Kerberos.spikeMat = new THREE.MeshToonMaterial({ color: 0xd8c4a0, emissive: 0x3a0a08 });
    }
    for (let i = 0; i < a.volley; i++) {
      const yaw = base + (i / (a.volley - 1) - 0.5) * (a.arc * DEG);
      const dir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      dir.y = (aim.y - from.y) / Math.max(2, distXZ(from, aim));
      dir.normalize();
      const mesh = new THREE.Mesh(Kerberos.spikeGeo, Kerberos.spikeMat);
      mesh.position.copy(from);
      mesh.lookAt(from.clone().add(dir));
      W.scene.add(mesh);
      this.spikes.push({ mesh, dir, t: 0, a, tg });
    }
    W.audio.play('swing', { volume: 0.8, pitch: 0.5 });
  }

  updateSpikes(dt) {
    const W = this.world;
    for (const s of this.spikes) {
      s.t += dt;
      s.mesh.position.addScaledVector(s.dir, 26 * dt);
      const tg = s.tg;
      if (!s.dead && tg && tg.state !== 'ko' && !tg.isInvulnerable() && s.mesh.position.distanceTo(tg.chestPos()) < 0.8) {
        s.dead = true;
        applyHit(W, this.owner, tg, { damage: s.a.damage, kind: 'ability', element: 'sangue', knockback: s.a.knockback, dir: s.dir.clone().setY(0).normalize(), sound: 'bladeHit', color: BLOOD, scale: 1 });
      }
      if (s.t > 0.9 || s.mesh.position.y < 0) s.dead = true;
      if (s.dead) W.scene.remove(s.mesh);
    }
    this.spikes = this.spikes.filter((s) => !s.dead);
  }

  update(dt) {
    if (this.spikes.length) this.updateSpikes(dt);
    return super.update(dt);
  }

  dispose() {
    for (const s of this.spikes) this.world.scene.remove(s.mesh);
    this.spikes = [];
    super.dispose();
  }

  swingFx(a) {
    const W = this.world;
    if (a.volley) {
      W.fx.burst(new THREE.Vector3(this.pos.x, 3, this.pos.z), { count: 14, color: 0xd8c4a0, speed: 3, up: 2, life: 0.4, size: 0.15 });
      return;
    }
    if (a.name === 'tail') {
      W.fx.ring(new THREE.Vector3(this.pos.x, 0.6, this.pos.z), { color: 0xc0202c, radius: a.range, life: 0.35, inner: 0.85 });
      return;
    }
    if (a.name === 'pounce') {
      W.cameraRig && W.cameraRig.shake(0.35, 0.3);
      W.fx.burst(new THREE.Vector3(this.pos.x, 0.3, this.pos.z), { count: 16, color: DUST, kind: 'smoke', speed: 4, up: 0.6, life: 0.7, size: 0.9 });
    }
    W.fx.slash(new THREE.Vector3(this.pos.x, 1.8, this.pos.z), this.yaw, { color: 0xd02030, radius: a.range, arc: 2.2, life: 0.22, width: 0.45, roll: -0.25 });
  }

  // galope de SEIS patas (tripé: FL+MR+BL com FR+ML+BR), as três cabeças balançando cada uma no seu ritmo
  pose() {
    const J = this.model.joints;
    const root = this.model.root;
    root.rotation.y = this.yaw;
    if (this.state !== 'rise' && this.state !== 'die') root.scale.setScalar(KB_SCALE);
    if (!J.necks) { this.updateFlash(); return; } // o modelo provisório (sem o .glb)
    const t = this.t;
    const walk = this.state === 'chase' ? 1 : 0;
    const ph = this.gait * 1.6;
    let neckX = 0, jaw = 0.15 + Math.abs(Math.sin(t * 5)) * 0.1, torsoX = 0, tailX = Math.sin(t * 2.1) * 0.12;
    const tailY = Math.sin(t * 1.6) * 0.35;
    const a = this.state === 'attack' ? this.atk : null;
    if (a) {
      const st = this.stateT;
      const k = Math.min(1, st / a.windup);
      const after = st > a.windup;
      const end = st > a.windup + a.active;
      if (a.name === 'bite' || a.name === 'pounce') {
        neckX = after && !end ? 0.35 : -0.35 * k;
        jaw = after && !end ? 0.05 : 0.9 * k;
        if (a.name === 'pounce') torsoX = after ? 0.1 : -0.25 * k;
      } else if (a.name === 'tail') {
        const s = Math.min(1, Math.max(0, (st - a.windup * 0.6) / (a.active + a.windup * 0.4)));
        root.rotation.y = this.yaw + s * Math.PI * 2;
        tailX = -0.3;
      } else if (a.name === 'spikes') {
        torsoX = -0.15 * k;
        neckX = -0.45 * k;
        jaw = 0.8 * k;
        if (!after && Math.random() < 0.4) this.world.fx.burst(new THREE.Vector3(this.pos.x, 3, this.pos.z), { count: 2, color: 0xa01018, speed: 1, up: 2, life: 0.4, size: 0.12 });
      }
    }
    if (this.state === 'rise') { neckX = -0.6; jaw = 0.9 + Math.sin(t * 30) * 0.1; }
    const tremble = Math.sin(t * 31) * 0.012;
    J.torso.rotation.set(torsoX + tremble, 0, Math.sin(ph) * 0.03 * walk);
    J.necks.forEach((n, i) => {
      if (n) n.rotation.set(neckX + Math.sin(t * (2.1 + i * 0.7) + i) * 0.1, Math.sin(t * (1.3 + i * 0.4) + i * 2) * 0.18, 0);
    });
    const [jL, jC, jR] = J.jaws;
    if (jC) jC.rotation.x = jaw;
    if (jL) jL.scale.setScalar(0.8 + jaw * 0.45); // o anel de dentes do verme abre
    if (jR) { jR.scale.set(1 + jaw * 0.6, 1 + jaw * 0.4, 1); jR.rotation.z = Math.sin(t * 7) * 0.15; } // as quelíceras abrem
    if (J.tail) J.tail.rotation.set(tailX, tailY, 0);
    if (J.tail2) J.tail2.rotation.set(Math.sin(t * 2.6 + 1) * 0.2, tailY * 0.8, 0);
    J.legs.forEach((l, i) => {
      const s = Math.sin(ph + ([0, 3, 4].includes(i) ? 0 : Math.PI));
      l.hip.rotation.x = s * 0.5 * walk;
      if (l.knee) l.knee.rotation.x = Math.max(0, -s) * 0.6 * walk * (i < 4 ? -1 : 1);
    });
    this.updateFlash();
  }
}
