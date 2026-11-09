import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { faceClose, twoShot, orbit, pullBack } from '../../camera/shots.js';
import { splatGeo } from '../bloodPools.js';

const SKIN = 0xd9a48c; // os pedaços de pele arrancada
const FLESH = 0x8a0a12; // a carne viva
const DRIP = 0x5a0008; // o sangue escuro que escorre

// um corte do Descarnar numa junta do alvo: a ferida abre em carne viva, a pele sai em pedaços e o sangue espirra.
// Usado pelo especial da Aghata, pela habilidade do Juan, pelas assistências e pelo agarrão.
export function fleshCut(world, joint, { life = 3, size = 0.3 + Math.random() * 0.15, scale = 1 } = {}) {
  const at = joint.getWorldPosition(new THREE.Vector3());
  world.fx.cutMark(joint, { color: FLESH, life, size });
  world.fx.burst(at, { count: Math.round(5 * scale), kind: 'debris', color: SKIN, speed: 2.6, up: 0.8, life: 0.9, size: 0.09, gravity: 9, jitter: 0.12 });
  world.fx.burst(at, { count: Math.round(9 * scale), kind: 'debris', color: FLESH, speed: 3.2, up: 0.3, life: 0.7, size: 0.08, gravity: 10 });
  return at;
}

// o corpo do alvo em carne viva por um instante (o vermelho some sozinho)
export function rawFlesh(world, opp, { base = 0.4, time = 1.2 } = {}) {
  const tint = { color: FLESH, base };
  opp.glowTint = tint;
  let t = 0;
  world.addTicker({
    update(dt) {
      t += dt;
      tint.base = base * Math.max(0, 1 - t / time);
      if (t < time) return false;
      if (opp.glowTint === tint) opp.glowTint = null;
      return true;
    },
  });
}

// Especial do tipo ritual à distância (Aghata — DESCARNAR, ritual de Sangue):
// encara, concentra-se na raiva, o Sangue percorre o corpo dela, estende a mão e o ritual ARRANCA A PELE do alvo:
// cortes abrem em várias partes do corpo, a pele sai em pedaços e a carne fica viva e DERRETE (pinga, solta vapor
// de sangue e forma a poça no chão). Nada de raio ou energia: é carne. Mecanicamente: 250 de dano (padrão), sem hitkill.
const BODY = ['hd', 'sp', 'sL', 'sR', 'eL', 'eR', 'lL', 'lR', 'kL', 'kR', 'sp', 'hd'];

export const ritual = {
  // aviso: ergue o braço e o sigilo de Sangue pulsa no chão do alvo
  telegraph: () => ({ time: 0.85, anim: 'cast_up', animDuration: 0.85, mark: 'sigil' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 20);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    const total = sp.damage ?? COMBAT.specialDamage;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const waves = sp.waves || [{ t: 2.1, cuts: 6, share: 0.45 }, { t: 2.55, cuts: 6, share: 0.55, final: true }];
    const parts = splitDamage(total, waves.map((w) => w.share));
    world.beginCinematic(f, opp);
    const tl = new Timeline();
    const color = sp.color;
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    world.audio.play('ritual');
    world.cameraRig.playShots([
      twoShot(f, opp, { dur: 0.6, dist: 5, push: 0.5, height: 1.6, side: 1 }),
      faceClose(f, { dur: 1.0, from: 1.6, to: 1.05, side: 0.3 }),
      orbit(f, { dur: 0.5, radius: 2.6, height: 1.3, a0: -0.8, a1: -0.3 }),
      faceClose(opp, { dur: 0.6, from: 3.4, to: 2.8, side: -0.9, height: 1.3, fov: 44 }),
      orbit(opp, { dur: 0.7, radius: 3.2, height: 1.3, a0: 0.6, a1: 1.4, lookH: 1.0, fov: 46 }),
      pullBack(f, opp, { dur: 1.2, from: 4, to: 8, height: 2.4, side: -1 }),
    ]);

    // 1–2: encara e concentra-se (cabeça baixa, olhos fechados)
    tl.add(0.6, () => {
      f.anim.play('concentrate', { restart: true });
      if (f.rig.props.grimoire) f.rig.showProp('grimoire', true); // o grimório aberto (o ritual vem dele)
    });
    // 3: energia vermelha percorre o corpo
    let body = null;
    tl.add(0.75, () => {
      f.glowTint = { color, base: 0.25 };
      body = world.fx.emitter({
        rate: 90,
        follow: () => {
          const j = f.rig.joints[BODY[Math.floor(Math.random() * BODY.length)]];
          return j.getWorldPosition(new THREE.Vector3());
        },
        particle: { color, speed: 1, spread: 0.5, up: 0.6, life: 0.5, size: 0.2 },
      });
    });
    // 4: estende a mão
    let hand = null;
    tl.add(1.6, () => {
      f.anim.play('point', { restart: true, duration: 0.4 });
      // o sangue escorre da mão estendida
      hand = world.fx.emitter({ rate: 40, follow: () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3()), particle: { color: DRIP, kind: 'debris', speed: 0.6, spread: 0.3, life: 0.6, size: 0.07, gravity: 9 } });
      world.audio.play('heartbeat');
    });
    tl.add(1.75, () => world.specialBanner(f, sp, f.def.name));
    // a carne DERRETENDO: pinga de todo o corpo e solta vapor de sangue até o fim do ritual (e um pouco depois)
    let drip = null;
    let steam = null;
    const joint = () => opp.rig.joints[BODY[Math.floor(Math.random() * BODY.length)]].getWorldPosition(new THREE.Vector3());
    const melt = () => {
      drip = world.fx.emitter({ rate: 55, follow: joint, particle: { color: DRIP, kind: 'debris', speed: 0.4, spread: 0.4, life: 0.8, size: 0.07, gravity: 9 } });
      steam = world.fx.emitter({ rate: 22, follow: joint, particle: { color: 0x6a1018, kind: 'smoke', speed: 0.5, spread: 0.4, up: 1.2, life: 1.1, size: 0.35, grow: 0.6 } });
    };
    // a poça de carne e sangue no chão (só visual: não é a poça do Diabo que atola)
    const splat = () => {
      const mat = new THREE.MeshBasicMaterial({ color: DRIP, transparent: true, opacity: 0, depthWrite: false });
      const m = new THREE.Mesh(splatGeo(opp.pos.x, opp.pos.z), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(opp.pos.x, 0.04, opp.pos.z);
      m.renderOrder = 1;
      world.fx._addMesh(m, 5, (k) => {
        m.scale.setScalar(1.3 * Math.min(1, (1 - k) * 6));
        mat.opacity = 0.85 * Math.min(1, k * 4);
      });
    };
    // 5–7: o ritual atinge o alvo, cortes simultâneos em várias partes do corpo
    waves.forEach((w, wi) => {
      tl.add(w.t, () => {
        for (let i = 0; i < w.cuts; i++) {
          fleshCut(world, opp.rig.joints[BODY[(i * 5 + wi * 3) % BODY.length]]);
        }
        world.audio.play('descarnar');
        // a carne fica viva: o corpo inteiro avermelha mais a cada onda
        opp.glowTint = { color: FLESH, base: w.final ? 0.55 : 0.32 };
        if (wi === 0) melt();
        if (w.final) splat();
        applyHit(world, f, opp, { damage: parts[wi], kind: 'special', reaction: false, ignoreInvuln: true, sound: 'bladeHit', color, scale: w.final ? 2 : 1.2 });
        if (opp.state !== 'ko') opp.anim.play(w.final ? 'stagger' : 'hit', { restart: true });
        if (w.final) world.cameraRig.shake(0.5, 0.3);
      });
    });
    const end = waves[waves.length - 1].t + 1.0;
    tl.end(end);
    const cleanup = () => {
      body && body.stop();
      hand && hand.stop();
      f.glowTint = null;
      if (f.rig.props.grimoire) f.rig.showProp('grimoire', false);
      // a carne ainda pinga e o vermelho some aos poucos (já na luta)
      let t = 0;
      const tint = opp.glowTint;
      world.addTicker({
        update(dt) {
          t += dt;
          if (tint && opp.glowTint === tint) tint.base = 0.55 * Math.max(0, 1 - t / 1.6);
          if (t > 1.6) {
            drip && drip.stop();
            steam && steam.stop();
            if (opp.glowTint === tint) opp.glowTint = null;
            return true;
          }
          return false;
        },
        dispose() {
          drip && drip.stop();
          steam && steam.stop();
          if (opp.glowTint === tint) opp.glowTint = null;
        },
      });
    };
    return {
      update(dt) {
        const done = tl.update(dt);
        if (done) {
          cleanup();
          world.endCinematic();
          if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback: 3, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
          f.anim.play('idle', { blend: 0.2 });
        }
        return done;
      },
      cancel() {
        cleanup();
        world.endCinematic();
      },
    };
  },
};
