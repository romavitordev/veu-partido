import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { trySpecialBlock } from './common.js';
import { faceClose, orbit, twoShot } from '../../camera/shots.js';

// ESPECIAL: LEMBRA DE MIM (Beatrice — A Existida, Desconjuração ep. 11 "Lembrar").
// Cânone dos Existidos: "Olha pra mim. Não vai embora. Lembra de mim."
// O ápice do horror do Conhecimento: ela ergue o rosto, os olhos e a boca brilham em amarelo incandescente,
// e ela emite um grito silencioso que ecoa as memórias esquecidas. O adversário é tomado pelo desespero e paralisia,
// enquanto uma tempestade de sigilos e textos dourados consome a mente dele.
export const lembraDeMim = {
  telegraph: () => ({ time: 0.75, anim: 'gaze', animDuration: 0.75, mark: 'sigil' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 14);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const col = sp.color ?? 0xf2c230;
    const total = sp.damage ?? 360;
    world.beginCinematic(f, opp);
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    opp.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.yaw = yawTo(opp.pos, f.pos);

    f.rig.showProp('litGlow', true);

    world.cameraRig.playShots([
      faceClose(f, { dur: 1.1, from: 2.2, to: 1.3, side: 0.25, height: 1.55 }),
      faceClose(opp, { dur: 1.0, from: 1.8, to: 1.3, side: -0.3, height: 1.5 }),
      twoShot(f, opp, { dur: 1.5, dist: 4.8, height: 1.8, push: 0.5, side: 1 }),
      orbit(f, { dur: 1.2, radius: 4.0, height: 1.8, a0: 0.2, a1: 1.0, lookH: 1.2 }),
    ]);

    let aura = null;
    let runes = null;

    tl.add(0.05, () => {
      world.showBanner(sp.banner || 'Lembra de mim.', f.def.color);
      f.anim.play('gaze', { restart: true, duration: 1.2 });
      world.audio.play('fearGaze', { volume: 0.9, pitch: 0.7 });
      aura = world.fx.emitter({
        rate: 55,
        follow: () => f.chestPos(),
        particle: { color: col, speed: 1.2, spread: 0.7, life: 0.5, size: 0.22 },
      });
      runes = world.fx.runes(() => f.chestPos(), { color: col, count: 8, radius: 0.8, size: 0.28 });
    });

    tl.add(1.0, () => {
      if (opp && opp.state !== 'ko') {
        opp.anim.play('stagger', { restart: true, duration: 1.5 });
        opp.stun(2.0, 'fear');
        opp.notify('DESESPERO', true);
        world.audio.play('heartbeat', { volume: 0.8 });
      }
    });

    tl.add(1.8, () => {
      // O impacto devastador do Conhecimento
      f.anim.play('claw_raise', { restart: true, duration: 0.8 });
      world.audio.play('shockwave', { volume: 1.0, pitch: 0.85 });
      world.screenFlash && world.screenFlash('#fff4d0', 0.25);
      world.cameraRig.shake(0.65, 0.4);

      const center = f.chestPos();
      world.fx.flash(center, { color: col, size: 4.0, life: 0.35 });
      for (let i = 0; i < 4; i++) {
        world.after(i * 0.08, () => {
          world.fx.ring(new THREE.Vector3(f.pos.x, 0.06 + i * 0.2, f.pos.z), {
            color: col, radius: 2.2 + i * 1.5, life: 0.6,
          });
        });
      }

      if (opp && opp.state !== 'ko') {
        const at = opp.chestPos();
        world.fx.tracer(center, at, { color: col, life: 0.3, width: 0.08 });
        world.fx.flash(at, { color: col, size: 2.8, life: 0.3 });
        world.fx.burst(at, { count: 45, color: col, speed: 5, life: 0.8, size: 0.25 });
        applyHit(world, f, opp, {
          damage: total,
          kind: 'special',
          element: 'conhecimento',
          knockback: 6,
          hitstun: 1.2,
          launch: true,
          lowLaunch: true,
          unblockable: true,
          sound: 'shockwave',
          color: col,
          scale: 2.2,
          dir: forwardFromYaw(f.yaw),
        });
      }

      f.notify('LEMBRA DE MIM!', true);
    });

    const end = () => {
      if (aura) aura.stop();
      if (runes) runes.stop();
      aura = runes = null;
      world.endCinematic();
      f.anim.play('idle', { blend: 0.1 });
    };

    tl.add(3.6, end);
    tl.end(3.7);

    return {
      update: (dt) => {
        const done = tl.update(dt);
        if (done) end();
        return done;
      },
      cancel: end,
    };
  },
};
