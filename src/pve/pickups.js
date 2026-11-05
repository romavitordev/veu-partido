// OUTRO LADO — itens no chão (TODO §4.3 e §6.1):
//  CURA: cai de um inimigo menor (chance configurável na dungeon); flutua no lugar e cura ao encostar.
//  RECOMPENSA DO CHEFE: surge onde o chefe morreu; brilha e pede para o jogador ir até lá (a experiência e o ponto
//  permanente só entram ao coletar).
import * as THREE from 'three';

export class Pickup {
  constructor(world, { kind = 'heal', pos, amount = 0.2, onTake, radius = 0.9 }) {
    this.world = world;
    this.kind = kind;
    this.amount = amount;
    this.onTake = onTake;
    this.radius = radius;
    this.t = 0;
    this.alive = true;
    this.pos = new THREE.Vector3(pos.x, 0, pos.z);
    const g = new THREE.Group();
    if (kind === 'heal') {
      // um frasco com o brilho verde da cura do jogo (0x7dffb0)
      const glass = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), new THREE.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0.85, toneMapped: false }));
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 8), new THREE.MeshBasicMaterial({ color: 0xc8f8e0 }));
      neck.position.y = 0.2;
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), new THREE.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0.18, depthWrite: false, toneMapped: false }));
      g.add(glass, neck, halo);
    } else {
      // a recompensa: um olho amarelo fechado num cristal (o que sobrou do Espreitador)
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.9, toneMapped: false }));
      gem.scale.y = 1.4;
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: 0x1a1208 }));
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 10), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false }));
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 7, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
      beam.position.y = 3.2;
      g.add(gem, core, halo, beam);
      this.gem = gem;
    }
    // sem luz pontual própria: acender uma luz nova faz o three.js recompilar os materiais (engasgo)
    g.position.copy(this.pos);
    world.scene.add(g);
    this.group = g;
    world.fx.burst(new THREE.Vector3(pos.x, 0.8, pos.z), { count: 14, color: kind === 'heal' ? 0x7dffb0 : 0xf2c230, speed: 2.4, life: 0.5, size: 0.18, up: 1 });
  }

  update(dt, players) {
    if (!this.alive) return;
    this.t += dt;
    const y = (this.kind === 'heal' ? 0.55 : 1.1) + Math.sin(this.t * 2.6) * 0.1;
    this.group.position.y = y - 0.0;
    this.group.rotation.y += dt * (this.kind === 'heal' ? 1.4 : 0.9);
    if (this.gem) this.gem.rotation.x = Math.sin(this.t) * 0.2;
    if (this.t < 0.5) return; // não coleta no mesmo quadro em que nasceu
    for (const p of players) {
      if (!p || p.state === 'ko') continue;
      if (Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z) <= this.radius + p.radius) {
        this.take(p);
        return;
      }
    }
  }

  take(p) {
    this.alive = false;
    const w = this.world;
    const at = new THREE.Vector3(this.pos.x, 1, this.pos.z);
    if (this.kind === 'heal') {
      const n = Math.round(p.maxHealth * this.amount);
      p.heal(n);
      w.audio.play('pickup', { volume: 0.8 });
      w.ui && w.ui.popup(p.index, `+${n} VIDA`, '#7dffb0');
    } else {
      w.audio.play('levelUp', { volume: 1 });
      w.fx.ring(new THREE.Vector3(this.pos.x, 0.05, this.pos.z), { color: 0xf2c230, radius: 3, life: 0.7 });
    }
    w.fx.burst(at, { count: 24, color: this.kind === 'heal' ? 0x7dffb0 : 0xf2c230, speed: 3, life: 0.6, size: 0.2, up: 1.5 });
    this.onTake && this.onTake(p, this);
    this.dispose();
  }

  dispose() {
    this.alive = false;
    if (!this.group) return;
    this.world.scene.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.group = null;
  }
}
