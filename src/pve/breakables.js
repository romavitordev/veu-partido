// OUTRO LADO — objetos QUEBRÁVEIS (pedido do dono, 2026-11-06):
//  BARRIS e CAIXAS nas salas: quebram com os golpes do jogador e soltam moedas, experiência ou cura (ou nada).
//  As CAIXAS DO BUNKER (a luta contra a Degolificada): o jogador NÃO as quebra; ela as pega com o CABELO e as arremessa.
//  Ao quebrar, de dentro pode sair uma das PROVAS de que o corpo é o da Agatha mas quem está nele é o Gabriel
//  (pve/degolificada.js).
// Para os golpes, o barril é um NPC do inimigo (o mundo o acerta como acerta os NPCs); isCloset = fora da mira e da câmera.
import * as THREE from 'three';

const WOOD = 0x6a4a30;
const WOOD_DK = 0x3e2a1a;
const IRON = 0x3a3a3e;

export class Breakable {
  // kind: 'barrel' | 'crate' | 'bossBox'; onBreak(this, by) — o que sai de dentro
  constructor(world, owner, { x, z, kind = 'barrel', onBreak, yaw = Math.random() * Math.PI * 2 }) {
    this.world = world;
    this.owner = owner;
    this.kind = kind;
    this.isCloset = true; // um objeto: fora da trava de mira, da câmera e dos alvos das habilidades
    this.isProp = true;
    this.showBar = false;
    this.onBreak = onBreak;
    this.pos = new THREE.Vector3(x, 0, z);
    this.y = 0; // a altura (só muda quando o cabelo da Degolificada levanta o objeto)
    this.radius = kind === 'barrel' ? 0.42 : kind === 'bossBox' ? 0.6 : 0.5;
    this.height = kind === 'barrel' ? 1.0 : kind === 'bossBox' ? 1.1 : 0.9;
    this.hp = kind === 'barrel' ? 2 : 3;
    this.maxHp = this.hp;
    this.alive = true;
    this.broken = false;
    this.shake = 0;
    this.t = 0;
    this.build(yaw);
    const r = this.radius;
    this.box = { minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r, h: this.height };
    world.arena.boxes.push(this.box);
  }

  build(yaw) {
    const g = new THREE.Group();
    const wood = new THREE.MeshToonMaterial({ color: WOOD });
    const dark = new THREE.MeshToonMaterial({ color: WOOD_DK });
    const iron = new THREE.MeshToonMaterial({ color: IRON });
    if (this.kind === 'barrel') {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.95, 14), wood);
      body.position.y = 0.48;
      g.add(body);
      for (const y of [0.18, 0.78]) {
        const hoop = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.41, 0.06, 14, 1, true), iron);
        hoop.position.y = y;
        g.add(hoop);
      }
    } else {
      const s = this.kind === 'bossBox' ? 1.05 : 0.85;
      const body = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), wood);
      body.position.y = s / 2;
      g.add(body);
      // as tábuas e as cintas (a caixa de mantimentos do bunker / do porão)
      for (const sx of [-1, 1]) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.08, s + 0.02, s + 0.02), dark);
        slat.position.set(sx * (s / 2 - 0.04), s / 2, 0);
        g.add(slat);
      }
      const band = new THREE.Mesh(new THREE.BoxGeometry(s + 0.03, 0.08, s + 0.03), this.kind === 'bossBox' ? iron : dark);
      band.position.y = s * 0.55;
      g.add(band);
      if (this.kind === 'bossBox') {
        // um brilho fraco azul-acinzentado (o Medo) por baixo da tampa: dá para ver de longe quais ainda estão de pé
        const glow = new THREE.Mesh(new THREE.BoxGeometry(s * 0.9, 0.03, s * 0.9), new THREE.MeshBasicMaterial({ color: 0x8aa4c8, transparent: true, opacity: 0.5, toneMapped: false }));
        glow.position.y = s + 0.02;
        g.add(glow);
        this.glow = glow;
      }
    }
    g.position.copy(this.pos);
    g.rotation.y = yaw;
    this.world.scene.add(g);
    this.group = g;
  }

  // golpe do jogador (NPC do inimigo): as caixas do bunker não quebram com ele
  hitBy(attacker, dmg) {
    if (this.broken || this.kind === 'bossBox') {
      if (this.kind === 'bossBox' && !this.broken) { this.shake = 0.15; this.world.audio.play('blockHit', { volume: 0.4, pitch: 0.6 }); }
      return 0;
    }
    this.hp -= 1;
    this.shake = 0.25;
    this.world.audio.play('impact', { volume: 0.5, pitch: 0.7 + Math.random() * 0.2 });
    this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.6, this.pos.z), { count: 6, color: WOOD, speed: 2.2, life: 0.4, size: 0.08, up: 1.2 });
    if (this.hp <= 0) this.smash(attacker);
    return dmg;
  }

  // o CABELO da Degolificada pegou: sai do chão (sem colisão) e passa a ser movido por ela (pve/degolificada.js)
  lift() {
    if (this.lifted || this.broken) return;
    this.lifted = true;
    const boxes = this.world.arena.boxes;
    const i = boxes.indexOf(this.box);
    if (i >= 0) boxes.splice(i, 1);
  }

  moveTo(x, y, z, spin = 0) {
    this.pos.x = x;
    this.pos.z = z;
    this.y = y;
    if (this.group && spin) this.group.rotation.x = spin;
  }

  // quebrou: as tábuas voam e sai o que tinha dentro
  smash(by = null) {
    if (this.broken) return;
    this.broken = true;
    this.breakT = 0;
    const w = this.world;
    const i = w.arena.boxes.indexOf(this.box);
    if (i >= 0) w.arena.boxes.splice(i, 1);
    w.audio.play('heavyPunch', { volume: 0.7, pitch: 0.6 });
    w.fx.burst(new THREE.Vector3(this.pos.x, 0.6, this.pos.z), { count: 22, color: WOOD, speed: 4, life: 0.7, size: 0.12, up: 2 });
    w.fx.burst(new THREE.Vector3(this.pos.x, 0.4, this.pos.z), { count: 10, color: 0x6c6a66, kind: 'smoke', speed: 1.4, life: 0.6, size: 0.5, grow: 1 });
    this.onBreak && this.onBreak(this, by);
  }

  update(dt) {
    if (!this.group) return;
    this.t += dt;
    if (this.broken) {
      this.breakT += dt;
      const k = Math.min(1, this.breakT / 0.3);
      this.group.scale.set(1 + k * 0.3, Math.max(0.02, 1 - k), 1 + k * 0.3);
      if (this.breakT > 0.35) this.dispose();
      return;
    }
    let sx = 0;
    if (this.shake > 0) { this.shake -= dt; sx = Math.sin(this.t * 70) * 0.04; }
    this.group.position.set(this.pos.x + sx, this.y || 0, this.pos.z);
    if (this.glow) this.glow.material.opacity = 0.35 + Math.sin(this.t * 2.4) * 0.15;
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
