import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw, angleDiff, DEG } from '../core/util.js';
import { ABILITY_TYPES } from './abilities.js';
import { applyHit } from './damage.js';
import { igniteFighter } from './tristanAbilities.js';

// Habilidades próprias da CINDY LOPES (PSIKOLERA). Cânone (wiki "Cindy Lopes"): toca a ÚLTIMA NOTA no lança-chamas do
// Franco para cremar o Franco e o Alê (e acende um cigarro em homenagem). Mecânica = PROPOSTA.

const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });

Object.assign(ABILITY_TYPES, {
  // ÚLTIMA NOTA: um acorde grave no Fuzil Baixo — a onda de som sai em cone, empurra e deixa o alvo QUEIMANDO (o fogo
  // do lança-chamas do Franco). a.range / a.arc: o cone; a.damage; a.burn {dps, duration}; a.anim
  ultimaNota: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      const dur = a.windup + a.recovery;
      f.anim.play(a.anim || 'bass_play', { restart: true, duration: dur });
      world.audio.play('carga', { volume: 0.5, pitch: 0.5 });
      tl.add(a.windup, () => {
        const F = forwardFromYaw(f.yaw);
        const c = f.chestPos();
        world.audio.play('heavyPunch', { volume: 1.1, pitch: 0.45 });
        world.audio.play('impact', { volume: 0.8, pitch: 0.6 });
        for (let i = 1; i <= 4; i++) {
          const p = c.clone().addScaledVector(F, i * a.range / 4.5);
          world.after(i * 0.04, () => {
            world.fx.ring(p, { color: a.color, radius: 0.5 + i * 0.45, life: 0.32, vertical: true, yaw: f.yaw + Math.PI / 2, inner: 0.85 });
            world.fx.burst(p, { count: 6, color: i % 2 ? a.color : 0xffb040, speed: 2, up: 1.5, life: 0.35, size: 0.2 });
          });
        }
        world.fx.distort(c.clone().addScaledVector(F, 1.2), { color: a.color, radius: 2, life: 0.35 });
        world.cameraRig.shake(0.35, 0.25);
        if (!opp || opp.state === 'ko' || opp.isInvulnerable()) return;
        const d = distXZ(f.pos, opp.pos) - opp.radius;
        const ang = Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos)));
        if (d > a.range || ang > (a.arc * DEG) / 2) return;
        applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: a.element, knockback: a.knockback ?? 4, hitstun: a.hitstun ?? 0.6, sound: 'heavyPunch', color: a.color, scale: 1.5, dir: new THREE.Vector3().subVectors(opp.pos, f.pos).setY(0).normalize() });
        if (a.burn) igniteFighter(world, f, opp, a.burn);
      });
      tl.end(dur);
      return seqFrom(tl);
    },
  },
});
