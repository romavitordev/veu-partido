import * as THREE from 'three';
import { yawTo, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { vanDosCinco } from '../cristopherAbilities.js';
import { vehicleBlocked } from '../vehicleCollision.js';

// RACHA (Dara): a motorista fixa dos Cinco pega o volante da van do Chico (wiki "Dara Alice Venturini": segura a van
// quando a van preta bate neles na estrada e ganha um racha contra um rapaz de carro, ultrapassando e deixando para
// trás). Ela some para dentro da van, a van vem de trás dela e atropela, faz o cavalo de pau e volta na segunda
// passada; no fim ela pula da cabine. PROPOSTA de jogo: a cena e os números.
//   sp.behind (m atrás dela onde a van surge), sp.speed, sp.shares ([1ª passada, 2ª]), sp.overshoot (m depois do alvo)
export const racha = {
  canStart: (f) => !!f.opponent,
  start(f, sp, world) {
    const opp = f.opponent;
    const total = sp.damage ?? COMBAT.specialDamage;
    const shares = sp.shares || [0.5, 0.5];
    const car = vanDosCinco();
    let phase = 'enter';
    let t = 0;
    let dir = null;
    let travelled = 0;
    let length = 0;
    let hit = [false, false];
    let pass = 0;
    let driftFrom = 0;
    let driftTo = 0;
    let added = false;

    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('point', { restart: true, duration: 0.4 });
    world.audio.play(sp.sound || 'specialStart');
    world.showBanner(sp.banner || sp.name, f.def.color);

    const smoke = (p, n = 2) => world.fx.burst(new THREE.Vector3(p.x, 0.2, p.z), { count: n, color: 0x7a7068, kind: 'smoke', speed: 1, up: 0.8, life: 0.6, size: 0.8, grow: 1 });
    // a van sai de trás dela, apontada para onde o alvo está agora
    const launch = (from) => {
      const aim = opp.pos.clone().setY(0);
      dir = aim.clone().sub(from).setY(0).normalize();
      car.position.copy(from);
      car.rotation.y = Math.atan2(dir.x, dir.z);
      travelled = 0;
      length = from.distanceTo(aim) + (sp.overshoot ?? 6);
    };
    const finish = () => {
      if (added) world.scene.remove(car);
      added = false;
      // ela pula da cabine ao lado da van
      const R = new THREE.Vector3(dir.z, 0, -dir.x);
      const out = car.position.clone().addScaledVector(R, 1.6).setY(0);
      if (!vehicleBlocked(world.arena, 'van', out.clone().setY(0.6))) f.pos.set(out.x, 0, out.z);
      f.yaw = yawTo(f.pos, opp.pos);
      f.setVisible(true);
      f.anim.play('tech_roll', { restart: true, duration: 0.45 });
      world.fx.play('FX_DUST', f.pos, { scale: 0.9 });
      smoke(car.position, 14);
    };

    return {
      update(dt) {
        t += dt;
        if (phase === 'enter') {
          // corre para a van: some numa nuvem de fumaça do escapamento
          if (t >= 0.35) {
            world.fx.burst(f.chestPos(), { count: 20, color: 0x3a3634, kind: 'smoke', speed: 2, life: 0.5, size: 0.7, grow: 1 });
            f.setVisible(false);
            const F = forwardFromYaw(f.yaw);
            launch(new THREE.Vector3(f.pos.x - F.x * (sp.behind ?? 6), 0, f.pos.z - F.z * (sp.behind ?? 6)));
            world.scene.add(car);
            added = true;
            world.audio.play('shockwave', { volume: 0.8, pitch: 0.55 }); // o motor roncando
            phase = 'pass';
            t = 0;
          }
          return false;
        }
        f.invuln = Math.max(f.invuln, 0.2); // dentro da van: ninguém acerta a motorista
        if (phase === 'pass') {
          const step = (sp.speed ?? 26) * dt;
          travelled += step;
          car.position.addScaledVector(dir, step);
          car.rotation.z = Math.sin(t * 30) * 0.015;
          if (Math.random() < 0.6) smoke(car.position.clone().addScaledVector(dir, -2.2));
          if (!hit[pass] && opp.state !== 'ko' && !opp.isInvulnerable() && opp.pos.y < 1.6) {
            const rel = opp.pos.clone().sub(car.position).setY(0);
            const along = rel.dot(dir);
            const across = Math.abs(rel.x * dir.z - rel.z * dir.x);
            if (Math.abs(along) < 2.3 && across < 1.0 + opp.radius) {
              hit[pass] = true;
              const last = pass === 1;
              applyHit(world, f, opp, {
                // a 1ª passada só atordoa (lançado, o alvo passava por cima da van na volta); a 2ª lança
                damage: Math.round(total * shares[pass]), kind: 'special', knockback: last ? 8 : 2.5, hitstun: last ? 1.0 : 1.6, launch: last, guardCrush: true,
                dir: dir.clone(), sound: 'heavyPunch', scale: 2.2, hitstop: 0.12, color: 0xffd27a,
              });
              world.cameraRig.shake(last ? 0.7 : 0.5, 0.35);
              world.fx.burst(opp.chestPos(), { count: 30, color: 0xd8d4cc, speed: 8, life: 0.4, size: 0.18 });
              f.notify(last ? 'RACHA!' : 'SEGURA O VOLANTE!', true);
            }
          }
          const nose = car.position.clone().addScaledVector(dir, 2.2).setY(0.6);
          if (vehicleBlocked(world.arena, 'van', nose) || travelled > length) {
            if (pass === 0) {
              // o cavalo de pau: a van gira no lugar levantando fumaça e volta
              phase = 'drift';
              t = 0;
              driftFrom = car.rotation.y;
              const back = opp.pos.clone().setY(0).sub(car.position).setY(0).normalize();
              driftTo = Math.atan2(back.x, back.z);
              while (driftTo - driftFrom > Math.PI) driftTo -= Math.PI * 2;
              while (driftTo - driftFrom < -Math.PI) driftTo += Math.PI * 2;
              world.audio.play('shockwave', { volume: 0.7, pitch: 1.4 });
            } else {
              finish();
              phase = 'out';
              t = 0;
            }
          }
          return false;
        }
        if (phase === 'drift') {
          const k = Math.min(1, t / 0.5);
          car.rotation.y = driftFrom + (driftTo - driftFrom) * (1 - (1 - k) * (1 - k));
          car.position.addScaledVector(dir, (1 - k) * 6 * dt); // escorrega ainda um pouco para a frente
          smoke(car.position, 3);
          if (k >= 1) {
            pass = 1;
            launch(car.position.clone());
            phase = 'pass';
            t = 0;
          }
          return false;
        }
        // ela já desceu: a pose de saída
        return t >= 0.45;
      },
      cancel() {
        if (added) world.scene.remove(car);
        added = false;
        f.setVisible(true);
      },
    };
  },
};
