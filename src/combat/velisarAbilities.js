import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../core/util.js';
import { ABILITY_TYPES, blindFighter } from './abilities.js';
import { applyHit } from './damage.js';

// ------------------------------------------------------------------ VELISAR (Vampiros, Hexatombe)
// Os dois rituais da ficha dele (wiki "Velisar") que não cabiam nos tipos que já existiam:
//  · OLHAR DA CURIOSIDADE MÓRBIDA: ele atrai o alvo a olhar no fundo do buraco dos olhos. Quem EVITA olhar (está de
//    costas ou defendendo) fica CEGO; quem olha cai em TRANSE (vira servo por um instante) — não tem saída boa.
//  · ARMADILHA SANGUINÁRIA: põe a "armadilha" dentro de um corpo; quem chega perto faz a cabeça e o tronco EXPLODIREM em
//    sangue, espalhando DENTES e NAVALHAS em volta (o "presente" deixado na Mansão; a armadilha que matou a Cleo).
const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });
const BLOOD = 0xa01018;
const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

Object.assign(ABILITY_TYPES, {
  morbidGaze: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko') { f.notify('NINGUÉM PARA OLHAR'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'concentrate', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('fearGaze', { volume: 0.8, pitch: 0.75 });
      const head = () => (f.headPos ? f.headPos() : f.chestPos().add(new THREE.Vector3(0, 0.5, 0)));
      // os buracos dos olhos escurecem e puxam o olhar
      const pull = world.fx.emitter({ rate: 30, follow: head, particle: { color: 0x14040a, kind: 'smoke', speed: 0.4, spread: 0.15, life: 0.4, size: 0.3 } });
      tl.add(a.windup, () => {
        pull.stop();
        const d = distXZ(f.pos, opp.pos);
        const inCone = d <= a.range && Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos))) <= (a.arc * Math.PI) / 360;
        world.fx.ring(head(), { color: a.color, radius: 1.0, life: 0.4, vertical: true, yaw: f.yaw });
        if (!inCone || opp.isInvulnerable()) { f.notify('NÃO OLHOU'); return; }
        const looking = Math.abs(angleDiff(opp.yaw, yawTo(opp.pos, f.pos))) <= Math.PI * 0.6 && opp.state !== 'block';
        world.fx.tracer(head(), opp.headPos ? opp.headPos() : opp.chestPos(), { color: a.color, life: 0.3, width: 0.05 });
        if (looking) {
          // OLHOU: o transe — parado, sem defesa, virado para ele
          applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'sangue', knockback: 0, hitstun: 0.2, reaction: false, sound: 'fearGaze', color: a.color, unblockable: true });
          if (opp.state !== 'ko') {
            opp.stun(a.trance, 'stagger');
            opp.yaw = yawTo(opp.pos, f.pos);
            opp.notify('SERVO DO VAMPIRO', true);
            world.fx.burst(opp.headPos ? opp.headPos() : opp.chestPos(), { count: 16, color: a.color, speed: 1.2, life: 0.6, size: 0.14 });
          }
        } else {
          // EVITOU OLHAR: fica cego
          blindFighter(world, opp, a.blind);
          opp.notify('EVITOU O OLHAR: CEGO', true);
        }
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: () => pull.stop() });
    },
  },

  bloodTrap: {
    start(f, a, world) {
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('sniper_kneel', { restart: true, duration: 0.6 });
      world.audio.play('ritual', { volume: 0.6, pitch: 0.7 });
      tl.add(0.4, () => {
        if (f.bloodTrapObj) f.bloodTrapObj.remove();
        const F = forwardFromYaw(f.yaw);
        const pos = new THREE.Vector3(f.pos.x + F.x * (a.distance ?? 1.6), 0, f.pos.z + F.z * (a.distance ?? 1.6));
        // o "presente": um corpo encharcado de sangue largado no chão, com o símbolo pulsando
        const mesh = new THREE.Group();
        const flesh = new THREE.MeshStandardMaterial({ color: 0x5a1418, roughness: 0.6 });
        const cloth = new THREE.MeshStandardMaterial({ color: 0x3a3430, roughness: 0.9 });
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.9, 4, 10), cloth);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.2;
        mesh.add(body);
        const headM = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), flesh);
        headM.position.set(0.72, 0.2, 0);
        mesh.add(headM);
        const pool = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), new THREE.MeshBasicMaterial({ color: 0x4a0408, transparent: true, opacity: 0.85 }));
        pool.rotation.x = -Math.PI / 2;
        pool.position.y = 0.02;
        mesh.add(pool);
        const sigil = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.05, 24), new THREE.MeshBasicMaterial({ color: a.color, transparent: true, opacity: 0.5 }));
        sigil.rotation.x = -Math.PI / 2;
        sigil.position.y = 0.03;
        mesh.add(sigil);
        mesh.position.copy(pos);
        mesh.rotation.y = f.yaw + Math.PI / 2;
        world.scene.add(mesh);
        let t = 0;
        let done = false;
        const explode = () => {
          done = true;
          const c = new THREE.Vector3(pos.x, 0.5, pos.z);
          world.audio.play('explosion', { volume: 0.7, pitch: 1.3 });
          world.audio.play('clawHit', { volume: 0.9 });
          world.fx.flash(c, { color: 0xff2030, size: 3.5, life: 0.2 });
          world.fx.burst(c, { count: 60, color: BLOOD, speed: 9, up: 3, life: 0.9, size: 0.22, gravity: 10 });
          world.fx.burst(c, { count: 24, color: 0xf0e8d8, speed: 11, up: 2, life: 0.6, size: 0.06, gravity: 9 }); // os dentes
          world.fx.burst(c, { count: 18, color: 0xc8ccd4, speed: 12, up: 1.5, life: 0.5, size: 0.05, gravity: 8 }); // as navalhas
          world.fx.ring(c, { color: a.color, radius: a.radius, life: 0.4 });
          const opp = f.opponent;
          if (opp && opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, pos) <= a.radius) {
            const dir = new THREE.Vector3(opp.pos.x - pos.x, 0, opp.pos.z - pos.z).normalize();
            const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'sangue', knockback: a.knockback ?? 3, launch: true, hitstun: 0.5, sound: 'bladeHit', color: BLOOD, pos: c, dir });
            if (typeof res === 'number' && opp.state !== 'ko' && a.bleed) opp.applyBleed(a.bleed, f);
          }
        };
        const self = {
          update(dt) {
            t += dt;
            if (done) return true;
            sigil.material.opacity = 0.3 + 0.3 * Math.abs(Math.sin(t * 3));
            if (t > (a.life ?? 18)) return (done = true);
            const opp = f.opponent;
            if (t < (a.armTime ?? 0.6) || !opp || opp.state === 'ko') return false;
            if (distXZ(opp.pos, pos) > (a.trigger ?? 1.4)) return false;
            explode();
            return true;
          },
          dispose() { world.scene.remove(mesh); mesh.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); if (f.bloodTrapObj === self) f.bloodTrapObj = null; },
          remove() { done = true; },
        };
        f.bloodTrapObj = self;
        world.addTicker(self);
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },
});
