import * as THREE from 'three';
import { yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { trySpecialBlock } from './common.js';
import { faceClose, overShoulder } from '../../camera/shots.js';

// NÃO PERDE A CABEÇA! (Amalia, Calamidade ep. 6): a Flecha da Ordo Calamitas numa cena só —
//   1. puxa o arco e a AURA CIANO sobe pelo corpo (as memórias revividas: os olhos acesos);
//   2. CHUVA DE FLECHAS: atira para o céu e as flechas flamejantes caem em volta do alvo e o prendem no lugar;
//   3. LONGA-DISTÂNCIA: a última Flecha Flamejante, mirada na CABEÇA, atravessa tudo — não se esquiva nem se defende.
// sp.damage (padrão COMBAT.specialDamage), sp.color (o ciano da aura), sp.rain (quantas flechas caem), sp.rainShare
// (a parte do dano que vai na chuva; o resto é a flecha final).
export const headshot = {
  telegraph: () => ({ time: 0.7, anim: 'bow_aim', animDuration: 0.5, mark: 'laser' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 40);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const color = sp.color ?? 0x3affd0;
    const base = sp.damage ?? COMBAT.specialDamage;
    const rain = sp.rain ?? 12;
    const rainShare = sp.rainShare ?? 0.4;
    const hand = () => f.rig.sockets.handL.getWorldPosition(new THREE.Vector3());
    const head = () => opp.rig.joints.hd.getWorldPosition(new THREE.Vector3());
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    f.anim.play('bow_aim', { restart: true, duration: 1.0 });
    world.cameraRig.playShots([
      faceClose(f, { dur: 1.0, from: 2.1, to: 1.6, side: -0.35, height: 1.6 }),
      // a chuva: plano aberto no ALVO (a distância entre os dois varia muito — de longe, o par não cabe no quadro)
      {
        dur: 1.7, fov: 48,
        pos: (k) => {
          const F = forwardFromYaw(f.yaw);
          return new THREE.Vector3(opp.pos.x - F.z * (4.6 + k * 0.8) - F.x * 1.5, 3.4 + k * 0.4, opp.pos.z + F.x * (4.6 + k * 0.8) - F.z * 1.5);
        },
        look: () => new THREE.Vector3(opp.pos.x, 1.0, opp.pos.z),
      },
      overShoulder(f, opp, { dur: 0.9, back: 1.1, side: 0.45, height: 1.35, fov: 24 }),
    ]);
    world.after(0.25, () => world.showBanner(sp.banner || sp.name, f.def.color));
    world.audio.play('ritual', { volume: 0.6, pitch: 1.2 });
    const aura = world.fx.emitter({ rate: 40, follow: () => f.chestPos(), particle: { color, speed: 0.8, up: 1.6, spread: 0.5, life: 0.5, size: 0.16 } });
    let t = 0;
    let volley = false;
    let fell = 0;
    let fired = false;
    let done = false;
    // onde cada flecha da chuva cai: em volta do alvo, fechando nele (as últimas acertam)
    const drops = Array.from({ length: rain }, (_, i) => {
      const a = (i / rain) * Math.PI * 2 * 2.3;
      const r = i >= rain - 4 ? 0 : 0.6 + (1 - i / rain) * 1.6;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, hit: i >= rain - 4 };
    });
    const rainDmg = Math.round((base * rainShare) / 4);
    return {
      update(dt) {
        t += dt;
        // 2 — a salva para o céu
        if (!volley && t >= 1.0) {
          volley = true;
          f.anim.play('bow_shot', { restart: true, duration: 0.5 });
          world.audio.play('whip', { volume: 0.8, pitch: 1.4 });
          const from = hand();
          for (let i = 0; i < 3; i++) world.fx.tracer(from, from.clone().add(new THREE.Vector3((i - 1) * 0.6, 12, 0)), { color, life: 0.3, width: 0.05 });
          world.fx.flash(from, { color, size: 1.4, life: 0.15 });
        }
        // as flechas flamejantes caem em volta e fecham no alvo
        while (volley && fell < rain && t >= 1.5 + fell * 0.08) {
          const d = drops[fell++];
          const p = new THREE.Vector3(opp.pos.x + d.x, 0.05, opp.pos.z + d.z);
          const top = p.clone().add(new THREE.Vector3(0.4, 9, 0.2));
          world.fx.tracer(top, d.hit ? opp.chestPos() : p, { color, life: 0.12, width: 0.045 });
          world.fx.burst(d.hit ? opp.chestPos() : p.clone().setY(0.2), { count: 8, color, speed: 2.5, up: 1.5, life: 0.35, size: 0.12 });
          world.fx.ring(p, { color, radius: 0.35, life: 0.3 });
          world.audio.play('impact', { volume: 0.3, pitch: 1.5 });
          if (d.hit) {
            applyHit(world, f, opp, { damage: rainDmg, kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, knockback: 0, hitstun: 0, sound: 'bladeHit', color, scale: 0.8 });
            if (opp.state !== 'ko') opp.anim.play('stagger', { restart: true });
          }
        }
        // 3 — a mira na cabeça
        if (!fired && t >= 2.7 && t < 3.3) {
          if (f.anim.currentName !== 'bow_aim') f.anim.play('bow_aim', { restart: true, duration: 0.6 });
          if (Math.random() < 0.6) world.fx.tracer(hand(), head(), { color, life: 0.05, width: 0.004 + (t - 2.7) * 0.01 });
        }
        if (!fired && t >= 3.3) {
          fired = true;
          aura.stop();
          const from = hand();
          const to = head();
          f.anim.play('bow_shot', { restart: true, duration: 0.6 });
          world.audio.play('sniper', { volume: 1.1, pitch: 1.3 });
          world.fx.flash(from, { color, size: 2.4, life: 0.16 });
          world.fx.tracer(from, to, { color, life: 0.35, width: 0.08 });
          world.fx.tracer(from, to, { color: 0xffffff, life: 0.2, width: 0.025 });
          applyHit(world, f, opp, { damage: base - rainDmg * 4, kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, sound: 'heavyPunch', color, scale: 2.2 });
          opp.notify('NA CABEÇA!', true);
          world.fx.distort(to, { color, radius: 2.5, life: 0.5 });
          world.fx.burst(to, { count: 46, color, speed: 6, life: 0.6, size: 0.18 });
          for (let i = 0; i < 3; i++) world.after(i * 0.08, () => world.fx.ring(to, { color, radius: 0.5 + i * 0.6, life: 0.45, vertical: true, yaw: f.yaw }));
          world.cameraRig.shake(0.6, 0.3);
          world.cameraRig.playShots([faceClose(opp, { dur: 1.0, from: 2.2, to: 1.7, side: 0.3, height: 1.5 })]);
          if (opp.state !== 'ko') opp.anim.play('launched', { restart: true });
        }
        if (!done && t >= 3.3 + 1.0) {
          done = true;
          world.endCinematic();
          if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback: 6, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
          return true;
        }
        return false;
      },
      cancel() {
        aura.stop();
        world.endCinematic();
      },
    };
  },
};
