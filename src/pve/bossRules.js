// OUTRO LADO — REGRAS DE CHEFE (pedido do dono, 2026-11-12: "os chefes devem seguir mecânicas e tempos que o jogador
// aprende e lê; hoje apertar botão sem parar vence"; "o chefe ainda deve dar dano assustador, atordoar, avançar, atacar
// de longe e se defender quando precisa").
//
// REPULSÃO: o chefe conta os golpes que leva numa janela curta. Passou do limite da dificuldade (PVE_DIFFICULTIES
// [].counter: 9 no Fácil … 4 na Aniquilação), ele AVISA (um anel vermelho que cresce, ~0,4 s, sem reagir a golpes) e
// EXPLODE: empurra quem estiver perto, com dano e um atordoamento curto, e fica intocável por um instante. Quem bate em
// janelas (algumas pancadas, sai, volta) nunca é repelido; quem só aperta botão é. PROPOSTA: os números.
// A Degolificada não usa: ela já tem a Defesa de cabelo e a Explosão de cabelo (encurralada) — pve/degolificada.js.
import * as THREE from 'three';
import { distXZ } from '../core/util.js';
import { applyHit } from '../combat/damage.js';

export const BOSS_RULES = {
  window: 2.4, // segundos em que os golpes contam
  warn: 0.42, // o aviso antes da explosão
  radius: 3.8,
  damage: 18,
  knockback: 13,
  stun: 0.55,
  invuln: 0.9, // intocável depois de repelir
  cd: 4.5,
};

export class BossPressure {
  constructor(dungeon, boss, limit = 7) {
    this.d = dungeon;
    this.w = dungeon.world;
    this.boss = boss;
    this.limit = Math.max(3, limit);
    this.hits = [];
    this.t = 0;
    this.cd = 0;
    this.warnT = -1;
    this.lastHp = boss.health;
    this.ring = null;
    this.count = 0; // quantas vezes repeliu (para o aviso na primeira)
  }

  dealt(n) { return Math.round(n * (this.boss.cpuEdge?.dealt ?? 1)); }

  update(dt) {
    const b = this.boss;
    if (!b || b.state === 'ko') { this.clear(); return; }
    this.t += dt;
    this.cd = Math.max(0, this.cd - dt);
    // golpe recebido = a vida caiu desde o último quadro
    if (b.health < this.lastHp - 0.5) this.hits.push(this.t);
    this.lastHp = b.health;
    while (this.hits.length && this.t - this.hits[0] > BOSS_RULES.window) this.hits.shift();
    if (this.invulnT > 0) {
      this.invulnT -= dt;
      if (this.invulnT <= 0) this.setTaken(null);
    }
    if (this.warnT >= 0) { this.updateWarn(dt); return; }
    if (this.cd <= 0 && this.hits.length >= this.limit) this.startWarn();
  }

  startWarn() {
    const b = this.boss;
    this.warnT = 0;
    this.hits = [];
    this.prevNoFlinch = b.noFlinch;
    b.noFlinch = true; // durante o aviso ele não é mais travado pelo combo
    if ((b.state === 'hitstun' || b.state === 'stun') && b.onGround !== false) b.setState('idle');
    this.w.audio.play('fearGaze', { volume: 0.8, pitch: 1.6 });
    this.d.pveHud && this.d.pveHud.moveName('Repulsão');
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48), new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
    this.ring.rotation.x = -Math.PI / 2;
    this.w.scene.add(this.ring);
  }

  updateWarn(dt) {
    const b = this.boss;
    const R = BOSS_RULES;
    this.warnT += dt;
    const k = Math.min(1, this.warnT / R.warn);
    if (this.ring) {
      this.ring.position.set(b.pos.x, 0.06, b.pos.z);
      this.ring.scale.setScalar(0.4 + k * (R.radius - 0.4));
      this.ring.material.opacity = 0.35 + 0.5 * k + Math.sin(this.warnT * 50) * 0.1;
    }
    if (this.warnT < R.warn) return;
    this.warnT = -1;
    this.clear();
    b.noFlinch = this.prevNoFlinch;
    this.cd = R.cd;
    this.count++;
    const at = new THREE.Vector3(b.pos.x, 0.08, b.pos.z);
    this.w.fx.ring(at, { color: 0xff3030, radius: R.radius, life: 0.35 });
    this.w.fx.burst(b.chestPos(new THREE.Vector3()).clone(), { count: 26, color: 0xff4a3a, speed: 5, life: 0.5, size: 0.14 });
    this.w.audio.play('guardBreak', { volume: 0.9, pitch: 0.6 });
    this.w.cameraRig.shake(0.25, 0.3);
    for (const q of this.d.players) {
      if (q.state === 'ko' || distXZ(q.pos, b.pos) > R.radius + (q.radius || 0.5)) continue;
      const dir = new THREE.Vector3(q.pos.x - b.pos.x, 0, q.pos.z - b.pos.z);
      if (dir.lengthSq() < 1e-4) dir.set(Math.sin(b.yaw), 0, Math.cos(b.yaw));
      const res = applyHit(this.w, b, q, { damage: this.dealt(R.damage), kind: 'ability', knockback: R.knockback, hitstun: 0.5, dir: dir.normalize(), unblockable: true, ignoreInvuln: true, sound: 'heavyPunch', color: 0xff3030, scale: 1.2 });
      if (typeof res === 'number' && q.state !== 'ko') { q.stun(R.stun, 'stagger'); q.notify('REPELIDO', true); }
    }
    this.invulnT = R.invuln;
    this.setTaken(0);
    if (this.count === 1 && this.d.hint) {
      this.d.hint('Bater sem parar faz o chefe REPELIR. Ataque em janelas: algumas pancadas, saia, volte');
      this.d.hintT = 5;
    }
  }

  // intocável por um instante (guarda o "taken" de antes para devolver)
  setTaken(v) {
    const b = this.boss;
    if (v === null) {
      if (this.savedTaken !== undefined) b.cpuEdge = { ...(b.cpuEdge || {}), taken: this.savedTaken };
      this.savedTaken = undefined;
      return;
    }
    if (this.savedTaken === undefined) this.savedTaken = b.cpuEdge?.taken ?? 1;
    b.cpuEdge = { ...(b.cpuEdge || {}), taken: v };
  }

  clear() {
    if (this.ring) {
      this.w.scene.remove(this.ring);
      this.ring.geometry.dispose();
      this.ring.material.dispose();
      this.ring = null;
    }
  }

  dispose() {
    this.clear();
    this.setTaken(null);
  }
}
