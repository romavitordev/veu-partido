// O ENXAME (Eileen, a apicultora de Treb Ciach; cânone: "Arremessar Abelhas"): o pote de abelhas estoura e o enxame
// fica em volta da cabeça de quem levou — ferroadas de pouco em pouco, mais LENTO enquanto dura e TONTO no começo
// (dono, 2026-11-28: "deixa o inimigo lento e tonto por um tempo além do dano das picadas e queimadura").
// Módulo sem dependências de propósito (projectiles.js e os especiais usam), como burn.js.
import * as THREE from 'three';

const BEE = 0xf2c230;
const DARK = 0x1a140a;

export function stingSwarm(world, owner, foe, { dps = 8, duration = 3, slow = 0.8, dizzy = 0 } = {}) {
  if (!foe || foe.state === 'ko') return;
  // TONTO: cambaleia um instante, sem defesa, com as abelhas no rosto
  if (dizzy > 0) {
    foe.stun(dizzy, 'stagger');
    foe.notify('TONTO!', true);
    const h = foe.chestPos().add({ x: 0, y: 0.75, z: 0 });
    world.fx.ring(h, { color: BEE, radius: 0.45, life: Math.min(1, dizzy), opacity: 0.8 });
  }
  let b = foe.findBuff('bees');
  if (!b) {
    // (dono, 2026-11-28: "as abelhas devem seguir o adversário o atacando"): o ENXAME é um bando de abelhas de verdade
    // que voa atrás dele — rodam em volta da cabeça e mergulham uma de cada vez para picar
    const swarm = new THREE.Group();
    const mats = [new THREE.MeshBasicMaterial({ color: BEE }), new THREE.MeshBasicMaterial({ color: DARK })];
    const geo = new THREE.SphereGeometry(0.035, 6, 4);
    const bees = [];
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Group();
      const body = new THREE.Mesh(geo, mats[0]);
      body.scale.set(1, 0.8, 1.5);
      m.add(body);
      const stripe = new THREE.Mesh(geo, mats[1]);
      stripe.scale.set(1.05, 0.85, 0.5);
      m.add(stripe);
      swarm.add(m);
      bees.push({ m, a: Math.random() * Math.PI * 2, r: 0.35 + Math.random() * 0.35, h: Math.random() * 0.8 - 0.2, sp: 5 + Math.random() * 4, dive: 0 });
    }
    world.scene.add(swarm);
    const center = foe.chestPos();
    swarm.position.copy(center);
    b = {
      type: 'bees', name: 'ENXAME', time: duration, duration, speedMult: slow, swarm, bees,
      onEnd() {
        world.scene.remove(swarm);
        geo.dispose();
        mats.forEach((x) => x.dispose());
      },
    };
    foe.addBuff(b);
    foe.notify('ENXAME!', true);
  }
  b.time = Math.max(b.time || 0, duration);
  b.duration = Math.max(b.duration || 0, duration);
  b.dps = Math.max(b.dps || 0, dps);
  if (!b.onTick) {
    let acc = 0;
    let t = 0;
    b.onTick = (dt) => {
      if (foe.state === 'ko') return;
      t += dt;
      // o bando segue o adversário (com um atraso, como um enxame de verdade) e cada abelha roda e mergulha
      const target = foe.chestPos();
      target.y += 0.3;
      b.swarm.position.lerp(target, Math.min(1, dt * 6));
      for (const bee of b.bees) {
        bee.a += bee.sp * dt;
        if (bee.dive <= 0 && Math.random() < dt * 0.6) bee.dive = 0.35;
        const r = bee.dive > 0 ? bee.r * (0.25 + Math.abs(bee.dive - 0.175) * 4) : bee.r;
        if (bee.dive > 0) bee.dive -= dt;
        bee.m.position.set(Math.cos(bee.a) * r, bee.h + Math.sin(t * 7 + bee.a) * 0.08, Math.sin(bee.a) * r);
        bee.m.rotation.y = -bee.a;
      }
      if (Math.random() < 0.5) {
        const a = t * 9 + Math.random() * Math.PI * 2;
        const h = foe.chestPos();
        h.x += Math.cos(a) * 0.55;
        h.z += Math.sin(a) * 0.55;
        h.y += 0.35 + Math.random() * 0.4;
        world.fx.burst(h, { count: 1, color: Math.random() < 0.7 ? BEE : DARK, speed: 1.2, up: 0.3, life: 0.3, size: 0.07 });
      }
      if (!b.dps) return;
      acc += b.dps * dt;
      if (acc >= 1) {
        const n = Math.floor(acc);
        acc -= n;
        foe.takeDamage(n);
        foe.flash = 0;
        world.onHit && world.onHit(owner, foe, n, { kind: 'bees' });
      }
    };
  }
}
