import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { sigilMap, emberBurst, rootSnap } from '../../fx/vigiliaFx.js';
import { igniteFighter } from '../burn.js';
import { gwayneBow } from '../../models/vigiliaProps.js';
import { overShoulder, impactClose } from '../../camera/shots.js';

// ESPECIAIS PRÓPRIOS DA VIGÍLIA (Treb Ciach, 890; lore/A-VIGILIA.md). As cenas são PROPOSTA.
//   protectionCircle  MAEL — O Círculo do Samhain: o druida aprendiz do Marban risca no chão o SÍMBOLO DO RITUAL DA CHAMA
//                     DE PROTEÇÃO (o mesmo sigilo dourado da fogueira da arena Treb Ciach); quem está dentro e não é da
//                     Vigília fica preso enquanto a chama amarela sobe em três ondas. Ele, dentro do círculo, quase não
//                     sente dano. "Esse é meu destino."
//   twinArrows        GWAYNE — A Flecha de Gwyneth: o vulto pálido da irmã gêmea (cânone: a Gwyneth virou uma Enraizada; o
//                     arco era dela) aparece ao lado dele com o mesmo arco; os dois soltam juntos as Flechas Flamejantes,
//                     que prendem e acendem o alvo, e ele some na névoa e fecha com a adaga. "Esse lugar é minha única
//                     chance."

const FLAME = 0xffd84a; // a Chama de Proteção (amarela)
const EMBER = 0xff9a2a;

export const protectionCircle = {
  canStart: (f, sp) => {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 7);
  },
  start(f, sp, world) {
    const opp = f.opponent;
    const color = sp.color ?? FLAME;
    const R = sp.radius ?? 4.4;
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('cast_up', { restart: true, duration: 0.95 });
    world.specialBanner(f, sp, sp.name);
    world.audio.play('ritual', { volume: 0.9, pitch: 0.8 });
    const c = new THREE.Vector3(f.pos.x, 0, f.pos.z);

    // o sigilo no chão (o anel de fora da textura fica a 8,3 m de 8,8 m da metade do quadro)
    const size = (2 * R * 8.8) / 8.3;
    const mat = new THREE.MeshBasicMaterial({ map: sigilMap(), color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    const sigil = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    sigil.rotation.x = -Math.PI / 2;
    sigil.position.set(c.x, 0.06, c.z);
    sigil.scale.setScalar(0.05);
    world.scene.add(sigil);
    const glow = world.fx.emitter({ rate: 30, follow: () => f.chestPos(), particle: { color, speed: 0.6, up: 1.2, spread: 0.5, life: 0.5, size: 0.16 } });

    // dentro do círculo o Mael quase não sente o golpe
    const ward = { type: 'protectionCircle', name: 'CHAMA DE PROTEÇÃO', time: sp.wardTime ?? 2.6, duration: sp.wardTime ?? 2.6, takenMult: sp.wardMult ?? 0.3, knockbackTakenMult: 0.3, color };
    f.addBuff(ward);

    let t = 0;
    let gone = false;
    const dispose = () => {
      if (gone) return;
      gone = true;
      glow.stop();
      world.scene.remove(sigil);
      sigil.geometry.dispose();
      mat.dispose();
    };
    const life = sp.sigilTime ?? 3.2;
    world.addTicker({
      update(dt) {
        t += dt;
        sigil.scale.setScalar(Math.min(1, 0.05 + t * 2.2));
        sigil.rotation.z += dt * 0.25;
        mat.opacity = t < life - 0.5 ? Math.min(0.95, t * 2) : Math.max(0, (life - t) * 1.9);
        // as chamas lambendo a borda do círculo
        if (Math.random() < 0.7) {
          const a = Math.random() * Math.PI * 2;
          world.fx.burst(new THREE.Vector3(c.x + Math.cos(a) * R, 0.2, c.z + Math.sin(a) * R), { count: 2, color: Math.random() < 0.6 ? color : EMBER, speed: 0.4, up: 2.6, life: 0.45, size: 0.22 });
        }
        if (t >= life) dispose();
        return t >= life;
      },
      dispose,
    });

    const inside = () => opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, c) <= R + (opp.radius ?? 0.5);
    let caught = false;
    let column = null;
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, sp.shares ?? [0.22, 0.28, 0.5]);
    const waves = sp.waves ?? [0.95, 1.5, 2.15];
    tl.add(0.75, () => {
      world.fx.ring(new THREE.Vector3(c.x, 0.08, c.z), { color, radius: R, life: 0.5 });
      world.audio.play('powerUp', { volume: 0.8 });
      if (!inside()) { f.notify('O CÍRCULO FICOU VAZIO'); return; }
      if (trySpecialBlock(world, f, opp, sp)) return;
      caught = true;
      opp.stun(waves[waves.length - 1] - 0.6, 'stagger', { bind: true });
      opp.vel.set(0, 0, 0);
      opp.notify('PRESO NO CÍRCULO', true);
      rootSnap(world, opp); // as raízes de Treb Ciach fecham em volta de quem ficou dentro
      column = world.fx.emitter({ rate: 70, follow: () => new THREE.Vector3(opp.pos.x + (Math.random() - 0.5) * 1.1, 0.1, opp.pos.z + (Math.random() - 0.5) * 1.1), particle: { color, speed: 0.6, up: 5, life: 0.6, size: 0.3 } });
    });
    waves.forEach((at, i) => tl.add(at, () => {
      if (!caught || opp.state === 'ko') return;
      const last = i === waves.length - 1;
      f.anim.play(last ? 'cast_up' : 'concentrate', { restart: true, duration: 0.45 });
      const p = opp.chestPos();
      world.fx.burst(p, { count: last ? 60 : 26, color, speed: last ? 9 : 5, up: 4, life: 0.55, size: 0.28 });
      emberBurst(world, p, { big: last, color });
      world.fx.ring(new THREE.Vector3(opp.pos.x, 0.08, opp.pos.z), { color: last ? 0xffffff : color, radius: last ? 3 : 1.6, life: 0.4 });
      world.cameraRig.shake(last ? 0.5 : 0.2, last ? 0.3 : 0.15);
      if (last) world.screenFlash && world.screenFlash('#3a3006', 0.15);
      applyHit(world, f, opp, { damage: parts[i], kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, sound: last ? 'explosion' : 'powerUp', color, scale: last ? 1.8 : 1.1 });
      if (last) {
        if (column) column.stop();
        world.showBanner && world.showBanner(sp.release ?? 'ESSE É MEU DESTINO', f.def.color);
        if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(yawTo(c, opp.pos)), knockback: 6, hitstun: COMBAT.launchHitstun, launch: true });
      }
    }));
    tl.end(waves[waves.length - 1] + 0.4);
    return {
      update: (dt) => tl.update(dt),
      cancel() { if (column) column.stop(); },
    };
  },
};

// o VULTO da Gwyneth: a silhueta pálida e translúcida da irmã gêmea (sem brilho aditivo: no chão claro estourava em branco), de pé, com o arco dela na mão esquerda
function ghostTwin(world, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const add = (geo, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  add(new THREE.SphereGeometry(0.13, 12, 10), 0, 1.6, 0); // a cabeça
  add(new THREE.CapsuleGeometry(0.17, 0.42, 4, 10), 0, 1.18, 0); // o tronco
  add(new THREE.ConeGeometry(0.34, 0.9, 12, 1, true), 0, 0.55, 0); // o manto abrindo até o chão
  for (const s of [1, -1]) {
    const arm = add(new THREE.CapsuleGeometry(0.05, 0.42, 3, 6), s * 0.24, 1.22, -0.12);
    arm.rotation.x = Math.PI / 2 - 0.15; // os dois braços para a frente, puxando a corda
  }
  // o mesmo arco (o dele era dela): fantasma também
  const bow = gwayneBow();
  bow.traverse((o) => { if (o.isMesh) o.material = mat; });
  bow.rotation.set(Math.PI / 2, 0, 0); // os braços do arco de pé
  bow.position.set(0.22, 1.25, -0.42);
  g.add(bow);
  world.scene.add(g);
  return {
    group: g,
    set opacity(v) { mat.opacity = v; },
    dispose() {
      world.scene.remove(g);
      g.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
      mat.dispose();
    },
  };
}

export const twinArrows = {
  telegraph: () => ({ time: 0.6, anim: 'bow_aim', animDuration: 0.5, mark: 'laser' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 30);
  },
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const color = sp.color ?? 0xff7a2a;
    const pale = sp.ghost ?? 0xa8c8ff;
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, sp.shares ?? [0.2, 0.2, 0.6]);
    const hand = () => f.rig.sockets.handL.getWorldPosition(new THREE.Vector3());
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    f.anim.play('bow_aim', { restart: true, duration: 1.3 });
    world.cameraRig.playShots([
      // os dois de frente: o Gwayne e o vulto da Gwyneth à esquerda dele, mirando juntos
      {
        dur: 1.25, fov: 42,
        pos: (k) => {
          const F = forwardFromYaw(f.yaw);
          // na diagonal, do lado da Gwyneth: o adversário fica fora da linha da câmera
          return new THREE.Vector3(f.pos.x + F.x * (3.2 - k * 0.5) + F.z * 2.3, 1.45, f.pos.z + F.z * (3.2 - k * 0.5) - F.x * 2.3);
        },
        look: () => { const F = forwardFromYaw(f.yaw); return new THREE.Vector3(f.pos.x + F.z * 0.55, 1.2, f.pos.z - F.x * 0.55); },
      },
      overShoulder(f, opp, { dur: 0.6, back: 1.3, side: -0.6, height: 1.5, fov: 30 }),
      impactClose(f, opp, { dur: 1.3 }),
    ]);
    world.audio.play('ritual', { volume: 0.7, pitch: 1.3 });
    // a Gwyneth surge do lado esquerdo dele, olhando para o mesmo alvo
    const ghost = ghostTwin(world, pale);
    const F = forwardFromYaw(f.yaw);
    const L = new THREE.Vector3(F.z, 0, -F.x); // a esquerda dele
    ghost.group.position.set(f.pos.x + L.x * 1.1 - F.x * 0.2, 0, f.pos.z + L.z * 1.1 - F.z * 0.2);
    ghost.group.rotation.y = f.yaw;
    const mist = world.fx.emitter({ rate: 30, follow: () => ghost.group.position.clone().setY(0.3 + Math.random() * 1.4), particle: { color: pale, speed: 0.4, up: 0.8, spread: 0.4, life: 0.7, size: 0.18 } });
    const ghostHand = () => ghost.group.localToWorld(new THREE.Vector3(0.22, 1.25, -0.42));
    let t = 0;
    let bannered = false;
    let loosed = false;
    let stepped = false;
    let stabbed = false;
    let done = false;
    let ghostGone = false;
    const clean = () => {
      if (ghostGone) return;
      ghostGone = true;
      mist.stop();
      ghost.dispose();
    };
    return {
      update(dt) {
        t += dt;
        if (!bannered && t >= 0.25) { bannered = true; world.specialBanner(f, sp, sp.name); }
        // o vulto aparece, firma e some depois do tiro
        if (!ghostGone) ghost.opacity = t < 0.5 ? t * 1.1 : t < 1.6 ? 0.55 + Math.sin(t * 14) * 0.05 : Math.max(0, 0.55 - (t - 1.6) * 1.8);
        if (!ghostGone && t >= 1.95) clean();
        // 1 — os dois soltam juntos: duas Flechas Flamejantes no peito do alvo, que fica preso e queimando
        if (!loosed && t >= 1.25) {
          loosed = true;
          f.anim.play('bow_shot', { restart: true, duration: 0.5 });
          world.audio.play('sniper', { volume: 1, pitch: 1.2 });
          const to = opp.chestPos();
          for (const [from, c] of [[hand(), color], [ghostHand(), pale]]) {
            world.fx.flash(from, { color: c, size: 1.4, life: 0.14 });
            world.fx.tracer(from, to, { color, life: 0.3, width: 0.07 });
            world.fx.tracer(from, to, { color: c === pale ? pale : 0xffe0a0, life: 0.18, width: 0.02 });
          }
          parts.slice(0, 2).forEach((d, i) => world.after(0.06 * i, () => {
            if (opp.state === 'ko') return;
            applyHit(world, f, opp, { damage: d, kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, knockback: 0, hitstun: 0, sound: 'bladeHit', color, scale: 1.1 });
          }));
          emberBurst(world, to, { big: false, color });
          if (opp.state !== 'ko') {
            opp.stun(1.2, 'stagger', { bind: true });
            opp.vel.set(0, 0, 0);
            opp.notify('PRESO PELAS FLECHAS', true);
            igniteFighter(world, f, opp, { dps: 10, duration: 3 });
          }
          world.cameraRig.shake(0.25, 0.15);
        }
        // 2 — ele some na névoa e surge na frente do alvo
        if (!stepped && t >= 1.85) {
          stepped = true;
          world.fx.burst(f.chestPos(), { count: 22, color: pale, kind: 'smoke', speed: 0.6, up: 0.3, life: 0.9, size: 0.5, grow: 0.8 });
          const back = forwardFromYaw(yawTo(opp.pos, f.pos));
          f.pos.set(opp.pos.x + back.x * 1.15, 0, opp.pos.z + back.z * 1.15);
          f.yaw = yawTo(f.pos, opp.pos);
          world.fx.distort(f.chestPos(), { color: pale, radius: 1.8, life: 0.3 });
          world.audio.play('blink', { volume: 0.8 });
          f.anim.play('knife_final', { restart: true, duration: 0.5 });
        }
        // 3 — a adaga
        if (!stabbed && t >= 2.05) {
          stabbed = true;
          const p = opp.chestPos();
          world.fx.flash(p, { color, size: 2.2, life: 0.16 });
          emberBurst(world, p, { big: true, color });
          world.fx.ring(new THREE.Vector3(opp.pos.x, 0.08, opp.pos.z), { color, radius: 2.4, life: 0.4 });
          world.cameraRig.shake(0.55, 0.3);
          world.screenFlash && world.screenFlash('#3a1a06', 0.15);
          applyHit(world, f, opp, { damage: parts[2], kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, sound: 'slashFinal', color, scale: 2 });
          world.showBanner && world.showBanner(sp.release ?? 'POR GWYNETH', f.def.color);
        }
        if (!done && t >= 2.75) {
          done = true;
          clean();
          world.endCinematic();
          if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback: 6, hitstun: COMBAT.launchHitstun, launch: true });
          return true;
        }
        return false;
      },
      cancel() {
        clean();
        world.endCinematic();
      },
    };
  },
};
