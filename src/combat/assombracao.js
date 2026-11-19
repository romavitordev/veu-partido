// AS ASSOMBRAÇÕES de Treb Ciach (A Vigília ep. 3, "Samhain"; a fase de ondas do Outro Lado). Cânone (wiki
// "Assombração"): espíritos azulados de quem morreu, sem consciência, frios ao toque — o toque solta RAIOS que
// transformam a vítima; vão atrás das pessoas e rodam em volta da fogueira (a Chama de Proteção as afasta).
// Dono (2026-11-19): por fora a FANTASIA do Samhain, por dentro um espírito azul quase de energia (Energia +
// Conhecimento + Morte); "as mais fortes ao morrer quebram a fantasia e mostram a forma azul, mas as mais fracas a
// fantasia só desmonta no chão".
//  - FRACA: o Toque Frio (lento, CONGELANDO) e o Avanço Espectral; morta, a fantasia cai no chão e o espírito some;
//  - FORTE: maior; ao "morrer" a fantasia QUEBRA e ela continua como o espírito puro (mais rápida, raios no toque).
// Elas vão atrás das CASAS (as portas com a lamparina, Dungeon.houses) e de quem joga; perto da fogueira recuam.
// PROPOSTA: todos os números.
import * as THREE from 'three';
import { BloodZombie } from './npcs.js';
import { buildAssombracao } from '../models/assombracao.js';
import { distXZ } from '../core/util.js';

const BLUE = 0x5ad0ff;
const ASH = 0x2a2c30; // as cinzas negras (o cânone: cinzas que soltam fumaça azul)
const base = {
  hp: 140, duration: 12, speed: 3.6, radius: 0.5, height: 2.0,
  element: 'morte', fxColor: 0x9aa4b0, poolColor: 0x1a1c20, noPool: true,
  leg: [0.5, 0.48], crouch: { hip: -0.05, knee: 0.1, chest: 0.22, neck: -0.12 },
  armFwd: 1.05, armOut: 0.18, armSwing: 0.12, elbow: -0.25, // os braços estendidos para a frente, os dedos abertos
  attacks: {
    claw: { windup: 0.38, active: 0.14, recovery: 0.45, range: 1.9, arc: 140, damage: 18, cd: 1.2, knockback: 1, chill: true },
    bite: { windup: 0.45, active: 0.2, recovery: 0.5, range: 1.7, arc: 120, damage: 26, cd: 4.0, knockback: 2.5, dash: 9 },
  },
  firstCd: { claw: 0.5, bite: 1.5 },
};
export const ASSOMBRACAO = {
  weak: { ...base, name: 'ASSOMBRAÇÃO' },
  strong: {
    ...base, name: 'ASSOMBRAÇÃO FORTE', hp: 300, speed: 3.3, radius: 0.55, height: 2.0, scale: 1.0, // do tamanho de gente: a força aparece na roupa que quebra, não no tamanho
    attacks: {
      claw: { ...base.attacks.claw, damage: 24, range: 2.2 },
      bite: { ...base.attacks.bite, damage: 36, range: 2.0 },
    },
  },
  // a forma AZUL depois que a fantasia quebra: mais rápida, e o toque solta raios. Bate bem mais que a de fantasia (dono,
  // 2026-11-19: "as assombrações azuis … devem dar mais dano que a fantasia")
  bare: { speedMul: 1.35, dealtMul: 1.6, hpFrac: 0.55 },
  houseChance: { weak: 0.45, strong: 0.3 }, // as primeiras ondas também vêm atrás de quem joga (dono: "quase nao se toma dano nas primeiras ondas") // a chance de ir atrás de uma casa em vez de quem joga
  fireRadius: 5.6, // a CHAMA DE PROTEÇÃO: não chegam mais perto do centro da fogueira que isto
};

export class Assombracao extends BloodZombie {
  configFor(o) { return ASSOMBRACAO[o.strong ? 'strong' : 'weak']; }

  buildModel(o) {
    this.strong = false; // a pose do Zumbi de Sangue fraco (a forte é só maior)
    this.forte = !!o.strong;
    this.isMarionette = false;
    this.houses = o.houses || null; // () => [casas vivas] (a fase de Treb Ciach)
    const m = buildAssombracao();
    if (o.strong) m.root.scale.setScalar(ASSOMBRACAO.strong.scale);
    return m;
  }

  restY() { return super.restY() + 0.06; } // flutua de leve (sem passar da altura de gente)
  bob() { return Math.sin(this.t * 2.1 + this.seed) * 0.08; }
  riseTime() { return 1.0; }

  // surge da névoa, curvada, e se endireita (as cinzas escuras com a fumaça azulada em volta)
  risePose(k, restY) {
    const root = this.model.root;
    root.position.set(this.pos.x, restY - (1 - k) * 0.8, this.pos.z);
    this.model.joints.body.rotation.x = (1 - k) * 0.5;
    if (Math.random() < 0.5) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.3, this.pos.z), { count: 3, color: Math.random() < 0.5 ? ASH : BLUE, kind: 'smoke', speed: 1.2, up: 1.5, life: 0.6, size: 0.5 });
  }

  // a ESCOLHA DO ALVO: uma casa (a porta com a lamparina) ou quem joga; quem joga perto sempre chama atenção
  chooseTarget() {
    const p = this.owner.opponent;
    const houses = this.houses ? this.houses() : [];
    if (p && p.state !== 'ko' && distXZ(this.pos, p.pos) < 4) { this.target = p; return; }
    if (houses.length && Math.random() < ASSOMBRACAO.houseChance[this.forte ? 'strong' : 'weak']) {
      this.target = houses.slice().sort((a, b) => distXZ(this.pos, a.pos) - distXZ(this.pos, b.pos))[0];
      this.retarget = 6;
      return;
    }
    this.target = p;
  }

  attackSound(name) { return name === 'claw' ? 'swing' : 'fearGaze'; }

  stepSpeed(d) { return this.cfg.speed * (this.bare ? ASSOMBRACAO.bare.speedMul : 1) * (d > 6 ? 1.2 : 1); }

  swingFx(a) {
    this.world.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + this.height * 0.55, this.pos.z), this.yaw, { color: this.bare ? BLUE : 0x9aa4b0, radius: a.range, arc: 2.2, life: 0.22, width: 0.3, roll: -0.3 });
  }

  // o TOQUE FRIO: em quem joga, dano e CONGELANDO (mais lento); a forma azul solta um raio. Numa casa: apaga a lamparina
  strike(a, tg, d) {
    if (tg.isHouse) {
      if (d - tg.radius > a.range + 0.4) return false;
      tg.hurt(a.damage * (this.bare ? ASSOMBRACAO.bare.dealtMul : 1), this);
      this.world.fx.burst(tg.chestPos(new THREE.Vector3()), { count: 10, color: BLUE, speed: 2, up: 1, life: 0.4, size: 0.12 });
      return true;
    }
    const dmg0 = a.damage;
    if (this.bare) a.damage = dmg0 * ASSOMBRACAO.bare.dealtMul;
    const ok = super.strike(a, tg, d);
    a.damage = dmg0;
    if (!ok) return false;
    const hand = this.model.joints.armR.hand;
    const from = hand ? hand.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(this.pos.x, 1.4, this.pos.z);
    if (this.bare || a.chill) this.world.fx.lightning(from, tg.chestPos(), { color: 0xbfeaff, life: 0.18 });
    // renova o CONGELANDO em vez de empilhar (várias Assombrações tocando ao mesmo tempo)
    const cur = tg.buffs && tg.buffs.find((b) => b.name === 'CONGELANDO (ASSOMBRAÇÃO)');
    if (cur) cur.time = Math.max(cur.time, 1.6);
    else if (tg.addBuff && tg.state !== 'ko') tg.addBuff({ type: 'lodoWeak', name: 'CONGELANDO (ASSOMBRAÇÃO)', time: 1.6, duration: 1.6, mult: 0.92, affects: ['melee', 'ranged', 'ability'], speedMult: 0.8 });
    return true;
  }

  // OFUSCADA pelo clarão da lanterna do crânio de porco (pve/itensSamhain.js): larga o que fazia, recua cambaleando para
  // longe da luz e fica parada até passar (Broén, a maior, aguenta metade do tempo)
  blind(time, from) {
    if (!this.alive || ['die', 'leave', 'rise'].includes(this.state)) return;
    if (this.state === 'drag' || this.held) this.release(false);
    this.atk = null;
    this.setState('blind');
    this.blindT = time * (this.giant ? 0.5 : 1);
    this.blindFrom = { x: from.x, z: from.z };
  }

  update(dt) {
    if (this.state === 'blind' && this.alive) {
      this.blindT -= dt;
      const dx = this.pos.x - this.blindFrom.x;
      const dz = this.pos.z - this.blindFrom.z;
      const d = Math.hypot(dx, dz) || 1;
      const push = Math.max(0, 1 - this.stateT / 0.7) * 4.5;
      this.pos.x += (dx / d) * push * dt;
      this.pos.z += (dz / d) * push * dt;
      this.yaw = Math.atan2(-dx, -dz) + Math.sin(this.t * 7) * 0.35; // vira o rosto da luz, aos trancos
      if (this.blindT <= 0) this.setState('chase');
    }
    const r = super.update(dt);
    if (!this.alive) return r;
    // a Chama de Proteção: não entram no círculo da fogueira (rodam em volta, como no ep. 3)
    const R = ASSOMBRACAO.fireRadius;
    const rr = Math.hypot(this.pos.x, this.pos.z);
    if (this.fireGuard && rr < R && rr > 0.01) {
      this.pos.x *= R / rr;
      this.pos.z *= R / rr;
      this.model.root.position.x = this.pos.x;
      this.model.root.position.z = this.pos.z;
    }
    // fantasiada: as cinzas escuras caindo da barra (nada de azul); a forma azul tremula, solta fumaça azul e o rosto dá
    // trancos (a "repetição" do rosto)
    if (this.state !== 'die' && this.state !== 'leave') {
      if (Math.random() < dt * (this.bare ? 9 : 4)) this.world.fx.burst(new THREE.Vector3(this.pos.x + (Math.random() - 0.5) * 0.4, 0.25, this.pos.z + (Math.random() - 0.5) * 0.4), { count: 1, color: this.bare ? BLUE : ASH, kind: 'smoke', speed: 0.4, up: 0.8, life: 0.8, size: 0.45 });
      if (this.bare) {
        const fl = 0.36 + Math.sin(this.t * 13 + this.seed) * 0.06 + (Math.random() < 0.04 ? 0.18 : 0);
        for (const o of this.model.spirit) if (o.material.opacity < 0.65) o.material.opacity = fl;
        const J = this.model.joints;
        if (J.neck && Math.random() < 0.08) J.neck.position.x += (Math.random() - 0.5) * 0.05;
        if (J.neck) J.neck.position.x *= 0.8;
      }
    }
    return r;
  }

  // a FORTE: a primeira "morte" quebra a fantasia e ela continua como o espírito azul
  hitBy(attacker, dmg) {
    if (this.forte && !this.bare && this.alive && this.state !== 'die' && this.state !== 'leave' && this.hp - dmg <= 0) {
      this.breakCostume();
      return;
    }
    super.hitBy(attacker, dmg);
  }

  breakCostume() {
    const w = this.world;
    this.bare = true;
    this.hp = Math.round(this.maxHp * ASSOMBRACAO.bare.hpFrac);
    this.flash = 0.15;
    const c = new THREE.Vector3(this.pos.x, this.height * 0.6, this.pos.z);
    // os pedaços da máscara e do manto voando
    w.fx.burst(c, { count: 26, color: 0xd8ccb0, speed: 5, up: 3, life: 0.8, size: 0.14, gravity: 9 });
    w.fx.burst(c, { count: 20, color: 0x1e1c1a, speed: 4, up: 2, life: 0.9, size: 0.22, gravity: 7 });
    w.fx.burst(c, { count: 30, color: BLUE, kind: 'smoke', speed: 2.5, life: 0.9, size: 0.8, grow: 1 });
    for (let i = 0; i < 4; i++) w.fx.lightning(c, c.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2)), { color: 0xbfeaff, life: 0.25 });
    w.audio.play('guardBreak', { volume: 0.8, pitch: 0.7 });
    w.audio.play('fearGaze', { volume: 0.6, pitch: 1.3 });
    for (const o of this.model.costume) o.visible = false;
    for (const o of this.model.spirit) { o.visible = true; o.material.opacity = 0.4; }
    this.cds.bite = 0; // avança na hora
  }

  // morreu: a FRACA deixa a fantasia desmontar no chão (o espírito se desfaz); a forma azul só se desfaz em fumaça
  vanishPose(k, restY) {
    const root = this.model.root;
    if (this.state !== 'die') return super.vanishPose(k, restY);
    if (!this.dropped) {
      this.dropped = true;
      if (!this.bare) this.dropCostume(); // a FRACA: a fantasia desmonta no chão; o que estava dentro some nas cinzas
      this.world.fx.burst(new THREE.Vector3(this.pos.x, this.height * 0.5, this.pos.z), { count: 30, color: this.bare ? BLUE : ASH, kind: 'smoke', speed: 2, up: 1.5, life: 1, size: 0.8, grow: 1 });
    }
    for (const o of this.model.spirit) o.material.opacity = 0.4 * (1 - k);
    root.position.y = restY + k * 0.6; // a forma azul sobe e se desfaz
  }

  // a fantasia desmonta: os pedaços saem do corpo (no lugar onde estão) e caem no chão, onde ficam um tempo
  dropCostume() {
    const w = this.world;
    const g = new THREE.Group();
    this.model.root.updateMatrixWorld(true);
    const parts = [];
    for (const o of this.model.costume) {
      if (!visibleChain(o)) continue;
      const m = new THREE.Mesh(o.geometry, o.material);
      o.matrixWorld.decompose(m.position, m.quaternion, m.scale);
      m.userData.sharedGeometry = true;
      o.visible = false;
      g.add(m);
      parts.push({ m, vy: Math.random() * 1.2, spin: (Math.random() - 0.5) * 3, floor: 0.04 + Math.random() * 0.06 });
    }
    // a geometria/material passam para a pilha no chão (o dispose da Assombração não os libera)
    for (const o of this.model.costume) {
      o.userData.sharedGeometry = true;
      o.userData.keepMaterial = true;
      for (const c of o.children) if (c.userData.isOutline) c.userData.sharedGeometry = true;
    }
    w.scene.add(g);
    let t = 0;
    const update = (dt) => {
      t += dt;
      for (const p of parts) {
        p.vy -= 9 * dt;
        p.m.position.y = Math.max(p.floor, p.m.position.y + p.vy * dt);
        if (p.m.position.y > p.floor) p.m.rotation.x += p.spin * dt;
        else p.m.rotation.x += (Math.PI / 2 * Math.sign(p.spin || 1) - p.m.rotation.x) * Math.min(1, dt * 6); // deitado
      }
      if (t > 5) {
        const k = Math.min(1, (t - 5) / 1.2);
        g.position.y = -k * 0.4;
        if (k >= 1) return true; // acabou (o mundo chama o dispose)
      }
      return false;
    };
    w.addTicker({
      update,
      dispose: () => {
        w.scene.remove(g);
        for (const p of parts) { p.m.geometry.dispose(); if (p.m.material.dispose) p.m.material.dispose(); }
      },
    });
  }

  dispose() {
    // a fantasia que caiu no chão é dela: não libera aqui
    if (!this.alive && !this.model.root.parent) return;
    for (const o of this.model.costume) if (o.userData.keepMaterial) o.material = new THREE.MeshBasicMaterial();
    super.dispose();
  }
}

function visibleChain(o) {
  for (let p = o; p; p = p.parent) if (!p.visible) return false;
  return true;
}
