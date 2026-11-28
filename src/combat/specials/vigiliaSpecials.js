import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { sigilMap, emberBurst, rootSnap } from '../../fx/vigiliaFx.js';

// ESPECIAIS PRÓPRIOS DA VIGÍLIA (Treb Ciach, 890; lore/A-VIGILIA.md). As cenas são PROPOSTA.
//   protectionCircle  MAEL — O Círculo do Samhain: o druida aprendiz do Marban risca no chão o SÍMBOLO DO RITUAL DA CHAMA
//                     DE PROTEÇÃO (o mesmo sigilo dourado da fogueira da arena Treb Ciach); quem está dentro e não é da
//                     Vigília fica preso enquanto a chama amarela sobe em três ondas. Ele, dentro do círculo, quase não
//                     sente dano. "Esse é meu destino."

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
