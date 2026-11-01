import * as THREE from 'three';
import { Timeline, yawTo, forwardFromYaw } from '../core/util.js';
import { ABILITY_TYPES } from './abilities.js';
import { applyHit } from './damage.js';
import { part, glowMat } from '../models/rig.js';

// ------------------------------------------------------------------ CRISTOPHER "CRIS" COHEN (Ordo Realitas, OSNF)
// DIREÇÃO AVANÇADA (wiki): "por ter feito vários filmes de ação, Cristopher tem um talento nato em dirigir e realizava
// várias manobras radicais com o carro". No jogo: ele assobia, o carro dele vem derrapando por trás numa cena de dublê,
// ele se joga para o lado no último instante e o carro atropela quem estiver na frente.
const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });

// o carro: um sedã velho e grandalhão (pintura vinho, faróis acesos), montado em peças simples
export function stuntCar(color = 0x6a1418) {
  const g = new THREE.Group();
  const body = part(new THREE.BoxGeometry(1.9, 0.62, 4.3), color);
  body.position.y = 0.62;
  g.add(body);
  const hood = part(new THREE.BoxGeometry(1.86, 0.18, 1.3), color);
  hood.position.set(0, 0.98, 1.3);
  hood.rotation.x = 0.06;
  g.add(hood);
  const cabin = part(new THREE.BoxGeometry(1.7, 0.56, 2.0), 0x1e2630);
  cabin.position.set(0, 1.18, -0.3);
  g.add(cabin);
  const roof = part(new THREE.BoxGeometry(1.72, 0.08, 1.7), color);
  roof.position.set(0, 1.5, -0.35);
  g.add(roof);
  for (const [x, z] of [[-0.9, 1.35], [0.9, 1.35], [-0.9, -1.35], [0.9, -1.35]]) {
    const w = part(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 14), 0x121214);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.38, z);
    g.add(w);
    const hub = part(new THREE.CylinderGeometry(0.18, 0.18, 0.32, 10), 0xa8a8ae, { outline: false });
    hub.rotation.z = Math.PI / 2;
    hub.position.copy(w.position);
    g.add(hub);
  }
  for (const x of [-0.65, 0.65]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), glowMat(0xfff0b0, 1));
    lamp.position.set(x, 0.72, 2.16);
    g.add(lamp);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.04), glowMat(0xff2010, 0.9));
    tail.position.set(x, 0.75, -2.16);
    g.add(tail);
  }
  const bumper = part(new THREE.BoxGeometry(2.0, 0.18, 0.2), 0x9a9a9e);
  bumper.position.set(0, 0.42, 2.2);
  g.add(bumper);
  return g;
}

// a VAN DOS CINCO (a mesma do Acampamento Varminho: escura, grafite verde neon, antena parabólica no teto) com a DARA
// no volante — vista pelo para-brisa. Frente em +z, como o sedã; volante à esquerda (+x, carro brasileiro).
export function vanDosCinco() {
  const g = new THREE.Group();
  const PAINT = 0x16241c, TRIM = 0x0c0e0e, NEON = 0x5cff7a;
  const glass = new THREE.MeshBasicMaterial({ color: 0x0a1418, transparent: true, opacity: 0.32, depthWrite: false });
  // baú (atrás) + cabine aberta com vidro (na frente): a Dara aparece pelo para-brisa e pelas janelas
  const body = part(new THREE.BoxGeometry(2.0, 1.75, 3.0), PAINT);
  body.position.set(0, 0.55 + 0.875, -0.95);
  g.add(body);
  const cabLow = part(new THREE.BoxGeometry(2.0, 0.75, 1.2), PAINT);
  cabLow.position.set(0, 0.55 + 0.375, 1.15);
  g.add(cabLow);
  const nose = part(new THREE.BoxGeometry(2.0, 0.95, 0.75), PAINT);
  nose.position.set(0, 0.55 + 0.475, 2.12);
  g.add(nose);
  const roof = part(new THREE.BoxGeometry(2.0, 0.1, 1.15), PAINT);
  roof.position.set(0, 2.25, 1.1);
  g.add(roof);
  for (const s of [-1, 1]) for (const z of [0.58, 1.66]) {
    const pillar = part(new THREE.BoxGeometry(0.08, 0.95, 0.08), PAINT);
    pillar.position.set(s * 0.96, 1.77, z);
    if (z > 1) pillar.rotation.x = -0.3;
    g.add(pillar);
  }
  // para-brisa inclinado (transparente: dá para ver a Dara dirigindo)
  const ws = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.95, 0.04), glass);
  ws.position.set(0, 1.77, 1.62);
  ws.rotation.x = -0.3;
  g.add(ws);
  for (const s of [-1, 1]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.9, 1.0), glass);
    win.position.set(s * 1.0, 1.77, 1.1);
    g.add(win);
    const back = part(new THREE.BoxGeometry(0.02, 0.55, 0.9), 0x0a1418, { outline: false });
    back.position.set(s * 1.01, 2.05, -1.9);
    g.add(back);
    // o grafite verde neon do lado (o alienígena de asas, em traços simples)
    const wingA = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 1.9), glowMat(NEON, 0.85));
    wingA.position.set(s * 1.012, 1.35, -0.55);
    wingA.rotation.x = 0.35;
    g.add(wingA);
    const wingB = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 1.9), glowMat(NEON, 0.85));
    wingB.position.set(s * 1.012, 1.35, -0.55);
    wingB.rotation.x = -0.35;
    g.add(wingB);
    const alien = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), glowMat(NEON, 0.9));
    alien.scale.set(0.08, 1.3, 0.9);
    alien.position.set(s * 1.012, 1.42, -0.55);
    g.add(alien);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 4.0), glowMat(NEON, 0.6));
    stripe.position.set(s * 1.012, 0.82, -0.2);
    g.add(stripe);
    // bagageiro
    const rail = part(new THREE.BoxGeometry(0.06, 0.06, 3.4), TRIM);
    rail.position.set(s * 0.85, 2.38, -0.6);
    g.add(rail);
  }
  for (const [x, z] of [[-0.9, 1.6], [0.9, 1.6], [-0.9, -1.75], [0.9, -1.75]]) {
    const w = part(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14), 0x121214);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.42, z);
    g.add(w);
    const hub = part(new THREE.CylinderGeometry(0.22, 0.22, 0.32, 10), 0xa8a8ae, { outline: false });
    hub.rotation.z = Math.PI / 2;
    hub.position.copy(w.position);
    g.add(hub);
  }
  for (const x of [-0.68, 0.68]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.06), glowMat(0xfff0b0, 1));
    lamp.position.set(x, 0.9, 2.52);
    g.add(lamp);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.04), glowMat(0xff2010, 0.9));
    tail.position.set(x * 1.18, 1.0, -2.47);
    g.add(tail);
  }
  for (const z of [2.55, -2.5]) {
    const bumper = part(new THREE.BoxGeometry(2.05, 0.22, 0.18), TRIM);
    bumper.position.set(0, 0.5, z);
    g.add(bumper);
  }
  const plate = part(new THREE.BoxGeometry(0.5, 0.14, 0.02), 0xe8e8e0, { outline: false });
  plate.position.set(0, 0.52, 2.65);
  g.add(plate);
  // a antena parabólica do Chico no teto
  const post = part(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), TRIM);
  post.position.set(0, 2.6, -1.4);
  g.add(post);
  const dish = part(new THREE.SphereGeometry(0.5, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0xb8bcc0);
  dish.scale.set(1, 0.3, 1);
  dish.rotation.x = Math.PI;
  dish.position.set(0, 3.0, -1.4);
  g.add(dish);
  // a DARA ao volante (blusa esverdeada, sobretudo preto, bandana, cabelo escuro)
  const dara = new THREE.Group();
  const torso = part(new THREE.BoxGeometry(0.46, 0.55, 0.3), 0x16161a);
  torso.position.y = 0.28;
  dara.add(torso);
  const blouse = part(new THREE.BoxGeometry(0.2, 0.4, 0.02), 0x3a8070, { outline: false });
  blouse.position.set(0, 0.32, 0.16);
  dara.add(blouse);
  const head = part(new THREE.SphereGeometry(0.17, 12, 10), 0x8a5a3c);
  head.position.y = 0.76;
  dara.add(head);
  const hair = part(new THREE.SphereGeometry(0.185, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), 0x1a1210);
  hair.position.set(0, 0.79, -0.02);
  dara.add(hair);
  const band = part(new THREE.CylinderGeometry(0.185, 0.185, 0.07, 14), 0x8a2a2a, { outline: false });
  band.position.y = 0.84;
  dara.add(band);
  for (const s of [-1, 1]) {
    const arm = part(new THREE.CylinderGeometry(0.06, 0.055, 0.45, 8), 0x16161a);
    arm.position.set(s * 0.2, 0.38, 0.22);
    arm.rotation.x = -1.1;
    dara.add(arm);
  }
  dara.position.set(0.45, 1.05, 0.95);
  g.add(dara);
  const wheel = part(new THREE.TorusGeometry(0.17, 0.025, 6, 16), 0x101012, { outline: false });
  wheel.position.set(0.45, 1.45, 1.35);
  wheel.rotation.x = -0.5;
  g.add(wheel);
  g.userData.driver = dara;
  return g;
}

Object.assign(ABILITY_TYPES, {
  // △ → □  DIREÇÃO AVANÇADA: o carro vem por trás dele, ele pula para o lado e o carro atropela
  stuntCar: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: 0.5 });
      world.audio.play('ready', { volume: 0.9, pitch: a.vehicle === 'van' ? 1.2 : 1.6 }); // o assobio (ou o rádio chamando a van)
      const F = forwardFromYaw(f.yaw);
      const R = new THREE.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw));
      const start = new THREE.Vector3(f.pos.x - F.x * (a.behind ?? 11), 0, f.pos.z - F.z * (a.behind ?? 11));
      const aim = opp.pos.clone().setY(0);
      const dir = aim.clone().sub(start).setY(0).normalize();
      const car = a.vehicle === 'van' ? vanDosCinco() : stuntCar(a.carColor);
      car.position.copy(start);
      car.rotation.y = Math.atan2(dir.x, dir.z);
      let carT = -(a.delay ?? 0.35);
      let hit = false;
      let gone = false;
      let travelled = 0;
      const total = start.distanceTo(aim) + (a.overshoot ?? 10);
      tl.add(a.delay ?? 0.35, () => {
        world.scene.add(car);
        world.audio.play('shockwave', { volume: 0.8, pitch: 0.55 }); // o motor roncando
      });
      // ele se joga para o lado quando o carro chega (a cena de dublê)
      tl.add((a.delay ?? 0.35) + 0.25, () => {
        f.anim.play('dodge', { restart: true, duration: 0.45 });
        f.invuln = Math.max(f.invuln, 0.5);
      });
      tl.each((t) => {
        const t0 = (a.delay ?? 0.35) + 0.25;
        if (t > t0 && t < t0 + 0.3) {
          f.vel.x = R.x * (a.sidestep ?? 2.2) / 0.3;
          f.vel.z = R.z * (a.sidestep ?? 2.2) / 0.3;
        } else { f.vel.x = 0; f.vel.z = 0; }
      });
      world.addTicker({
        update(dt) {
          carT += dt;
          if (carT < 0) return false;
          if (gone) return true;
          const step = (a.speed ?? 26) * dt;
          travelled += step;
          car.position.addScaledVector(dir, step);
          car.rotation.z = Math.sin(carT * 30) * 0.015; // a suspensão tremendo
          if (Math.random() < 0.6) {
            const back = car.position.clone().addScaledVector(dir, -2.2);
            world.fx.burst(new THREE.Vector3(back.x, 0.2, back.z), { count: 2, color: 0x7a7068, kind: 'smoke', speed: 1, up: 0.8, life: 0.6, size: 0.7, grow: 1 });
          }
          // atropelou?
          if (!hit && opp.state !== 'ko' && !opp.isInvulnerable() && opp.pos.y < 1.6) {
            const rel = opp.pos.clone().sub(car.position).setY(0);
            const along = rel.dot(dir);
            const across = Math.abs(rel.x * dir.z - rel.z * dir.x);
            if (Math.abs(along) < 2.3 && across < 1.0 + opp.radius) {
              hit = true;
              applyHit(world, f, opp, {
                damage: a.damage, kind: 'ability', knockback: a.knockback ?? 7, hitstun: 0.9, launch: true, guardCrush: true,
                dir: dir.clone(), sound: 'heavyPunch', scale: 2.2, hitstop: 0.12, color: 0xffd27a,
              });
              world.cameraRig.shake(0.6, 0.35);
              world.fx.burst(opp.chestPos(), { count: 30, color: 0xd8d4cc, speed: 8, life: 0.4, size: 0.18 });
              f.notify(a.label || 'CENA DE AÇÃO!', true);
            }
          }
          // bateu numa parede: o carro capota numa nuvem de fumaça
          const nose = car.position.clone().addScaledVector(dir, 2.2).setY(0.6);
          if (world.arena.blocksPoint(nose, 0.4) || travelled > total) {
            world.fx.play('FX_EXPLOSION', car.position.clone().setY(0.8), { color: 0xffa040, scale: 1.4 });
            world.fx.burst(car.position.clone().setY(1), { count: 30, color: 0x3a3634, kind: 'smoke', speed: 3, up: 2, life: 1.2, size: 1.6, grow: 1 });
            world.audio.play('explosion', { volume: 0.8 });
            gone = true;
            return true;
          }
          return false;
        },
        dispose() { world.scene.remove(car); },
      });
      tl.end((a.delay ?? 0.35) + 0.75);
      return seqFrom(tl, { cancel: () => { f.vel.set(0, 0, 0); } });
    },
  },
});
