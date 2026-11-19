import * as THREE from 'three';
import { yawTo } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { vanDosCinco } from '../cristopherAbilities.js';
import { vehicleBlocked, trackVehicle } from '../vehicleCollision.js';

// RACHA (Dara): a motorista fixa dos Cinco pega o volante da van do Chico (wiki "Dara Alice Venturini": segura a van
// quando a van preta bate neles na estrada e ganha um racha contra um rapaz de carro, ultrapassando e deixando para
// trás). Dono, 2026-11-19: "ela pegando a van e dirigindo bem rapido dando voltas e atropelando o inimigo 3 vezes, como
// se fosse um racha mesmo". Ela some para dentro da van e a van faz três laços em volta do alvo (uma rosácea de três
// pétalas, cortando por cima dele a cada volta), cantando pneu; na 3ª ele voa, a van freia de lado e ela pula da cabine.
// O tamanho dos laços se ajusta ao espaço livre (paredes/casas) para a van não travar. PROPOSTA de jogo: a cena e os números.
//   sp.speed (m/s), sp.shares ([1ª, 2ª, 3ª passada]), sp.loop (raio máximo do laço, m)
const LOOP_MIN = 2.8;

export const racha = {
  canStart: (f) => !!f.opponent && f.opponent.state !== 'ko',
  start(f, sp, world) {
    const opp = f.opponent;
    const total = sp.damage ?? COMBAT.specialDamage;
    const shares = sp.shares && sp.shares.length === 3 ? sp.shares : [0.3, 0.3, 0.4];
    const speed = sp.speed ?? 24;
    const car = vanDosCinco();
    const arena = world.arena;
    const center = opp.pos.clone().setY(0);
    const base = Math.atan2(f.pos.x - center.x, f.pos.z - center.z); // o 1º laço começa do lado dela
    // a rosácea r = R·cos(3θ), θ ∈ [0, π]: começa na ponta de uma pétala e passa pelo centro 3 vezes
    const at = (R, th) => {
      const r = R * Math.cos(3 * th);
      const a = base + th;
      return { x: center.x + Math.sin(a) * r, z: center.z + Math.cos(a) * r };
    };
    // o maior laço que cabe no espaço livre
    let R = sp.loop ?? 6.5;
    const fits = (Rt) => { for (let i = 0; i <= 48; i++) { const p = at(Rt, (i / 48) * Math.PI); if (vehicleBlocked(arena, 'van', { x: p.x, y: 0.6, z: p.z })) return false; } return true; };
    while (R > LOOP_MIN && !fits(R)) R -= 0.5;
    R = Math.max(LOOP_MIN, R);
    const vel = Math.min(speed, 8 + R * 3); // laço apertado (pouco espaço): mais devagar, para dar as três passadas

    let phase = 'enter';
    let t = 0;
    let th = 0;
    let hits = 0;
    const done = [false, false, false];
    let track = null;
    let heading = 0;
    let skid = 0;
    const dir = new THREE.Vector3();

    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('point', { restart: true, duration: 0.4 });
    world.audio.play(sp.sound || 'specialStart');
    world.specialBanner(f, sp, sp.name);
    // a câmera no alto, girando devagar em volta do racha
    world.cameraRig.playShots([{
      dur: 4.2,
      fov: 55,
      pos: (k) => new THREE.Vector3(center.x + Math.sin(base + 0.9 + k * 1.2) * (R + 6), 6.5 - k * 1.5, center.z + Math.cos(base + 0.9 + k * 1.2) * (R + 6)),
      look: () => new THREE.Vector3(center.x, 0.8, center.z),
    }]);

    const smoke = (p, n = 2) => world.fx.burst(new THREE.Vector3(p.x, 0.2, p.z), { count: n, color: 0x7a7068, kind: 'smoke', speed: 1, up: 0.8, life: 0.6, size: 0.8, grow: 1 });
    const place = () => {
      const p = at(R, th);
      const q = at(R, Math.min(Math.PI, th + 0.02));
      car.position.set(p.x, 0, p.z);
      const dx = q.x - p.x, dz = q.z - p.z;
      if (Math.hypot(dx, dz) > 1e-4) { heading = Math.atan2(dx, dz); dir.set(dx, 0, dz).normalize(); }
      car.rotation.y = heading;
    };
    const finish = () => {
      if (track) track.remove();
      // ela pula da cabine ao lado da van
      const out = car.position.clone().add(new THREE.Vector3(dir.z, 0, -dir.x).multiplyScalar(1.6)).setY(0);
      if (!vehicleBlocked(arena, 'van', out.clone().setY(0.6))) f.pos.set(out.x, 0, out.z);
      else f.pos.set(car.position.x, 0, car.position.z);
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
          // corre para a van: some numa nuvem de fumaça do escapamento, a van arranca da ponta do 1º laço
          if (t >= 0.35) {
            world.fx.burst(f.chestPos(), { count: 20, color: 0x3a3634, kind: 'smoke', speed: 2, life: 0.5, size: 0.7, grow: 1 });
            f.setVisible(false);
            place();
            track = trackVehicle(world, car, 9);
            world.audio.play('shockwave', { volume: 0.8, pitch: 0.55 }); // o motor roncando
            phase = 'race';
            t = 0;
          }
          return false;
        }
        f.invuln = Math.max(f.invuln, 0.2); // dentro da van: ninguém acerta a motorista
        if (phase === 'race') {
          // anda pela rosácea na velocidade do racha (dθ pelo comprimento do arco)
          const r = R * Math.cos(3 * th), dr = -3 * R * Math.sin(3 * th);
          const ds = Math.max(0.5, Math.hypot(r, dr));
          th = Math.min(Math.PI, th + (vel * dt) / ds);
          place();
          f.pos.set(car.position.x, 0, car.position.z); // a motorista vai junto (a câmera e o dublê a acham)
          // cantando pneu nas curvas: a traseira escorrega e solta fumaça
          skid = Math.abs(Math.sin(3 * th));
          car.rotation.y = heading + skid * 0.35;
          car.rotation.z = Math.sin(t * 30) * 0.015;
          if (Math.random() < 0.4 + skid * 0.5) smoke(car.position.clone().addScaledVector(dir, -2), 2 + Math.round(skid * 2));
          // passou por cima do alvo
          const d = Math.hypot(opp.pos.x - car.position.x, opp.pos.z - car.position.z);
          const pass = Math.max(0, Math.min(2, Math.round((3 * th - Math.PI / 2) / Math.PI))); // qual das 3 passadas pelo centro
          if (!done[pass] && d < 1.4 + (opp.radius || 0.5)) {
            done[pass] = true;
            const last = hits === 2;
            applyHit(world, f, opp, {
              // as duas primeiras passadas derrubam no lugar; a 3ª arremessa
              damage: Math.round(total * shares[hits]), kind: 'special', knockback: last ? 9 : 0.6, hitstun: last ? 1.0 : 1.4, launch: last, guardCrush: true, ignoreInvuln: true,
              dir: dir.clone(), sound: 'heavyPunch', scale: 2.2, hitstop: 0.1, color: 0xffd27a,
            });
            hits++;
            if (!last) opp.pos.set(center.x, opp.pos.y, center.z); // fica no meio da pista para a próxima volta
            world.cameraRig.shake(last ? 0.8 : 0.5, 0.3);
            world.fx.burst(opp.chestPos(), { count: 30, color: 0xd8d4cc, speed: 8, life: 0.4, size: 0.18 });
            world.audio.play('shockwave', { volume: 0.6, pitch: 1.3 + hits * 0.1 });
            f.notify(last ? 'RACHA!' : hits === 1 ? 'SEGURA O VOLANTE!' : 'MAIS UMA VOLTA!', true);
          }
          if (th >= Math.PI) { phase = 'brake'; t = 0; }
          return false;
        }
        if (phase === 'brake') {
          // freia de lado (cavalo de pau) e ela pula da cabine
          const k = Math.min(1, t / 0.45);
          car.rotation.y = heading + k * 1.4;
          car.position.addScaledVector(dir, (1 - k) * 7 * dt);
          f.pos.set(car.position.x, 0, car.position.z);
          smoke(car.position, 3);
          if (k >= 1) { finish(); phase = 'out'; t = 0; }
          return false;
        }
        // ela já desceu: a pose de saída
        if (t >= 0.45) { world.endCinematic(); return true; }
        return false;
      },
      cancel() {
        if (track) track.remove();
        f.setVisible(true);
        world.endCinematic();
      },
    };
  },
};
