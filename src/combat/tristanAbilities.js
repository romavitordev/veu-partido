import * as THREE from 'three';
import { yawTo, distXZ, forwardFromYaw, angleDiff, turnTowards, DEG } from '../core/util.js';
import { ABILITY_TYPES } from './abilities.js';
import { applyHit } from './damage.js';
import { FIRE } from './cristinoAbilities.js';

// Habilidades próprias do TRISTAN MONTEIRO (Desconjuração). Cânone (wiki "Tristan Monteiro", Arsenal): o coquetel
// molotov (usa o lanternThrow do Cristino: arremessa, estoura e deixa o chão queimando) e o LANÇA-CHAMAS com os
// tanques nas costas (a arte promocional; HQ6, o marcador "Cano Dispersante"). Mecânicas = PROPOSTA.

const foeOf = (world, owner) => (world.opponentOf ? world.opponentOf(owner) : owner.opponent);

// QUEIMANDO: dano contínuo por alguns segundos (renova a cada pulso do fogo). O buff 'burn' também é o que o fogo no
// chão do Cristino marca — e o que a Piromania do Tristan procura
export function igniteFighter(world, owner, foe, { dps = 10, duration = 2.5 } = {}) {
  if (!foe || foe.state === 'ko') return;
  let b = foe.findBuff('burn');
  if (!b) {
    b = { type: 'burn', name: 'QUEIMANDO', time: duration, duration };
    foe.addBuff(b);
  }
  b.time = Math.max(b.time || 0, duration);
  b.duration = Math.max(b.duration || 0, duration);
  b.dps = Math.max(b.dps || 0, dps);
  if (!b.onTick) {
    let acc = 0;
    b.onTick = (dt) => {
      if (foe.state === 'ko' || !b.dps) return;
      acc += b.dps * dt;
      if (acc >= 1) {
        const n = Math.floor(acc);
        acc -= n;
        foe.takeDamage(n);
        foe.flash = 0;
        if (Math.random() < 0.5) world.fx.burst(foe.chestPos(), { count: 3, color: Math.random() < 0.5 ? FIRE : 0xffd070, speed: 1, up: 2.2, life: 0.35, size: 0.22 });
        world.onHit && world.onHit(owner, foe, n, { kind: 'burn' });
      }
    };
  }
}

Object.assign(ABILITY_TYPES, {
  // △ → □  LANÇA-CHAMAS: o jato de fogo em cone à frente. SEGURÁVEL COM LIMITE (pedido do dono, 2026-11-09): o fogo
  // sai enquanto o △ ou o □ ficam apertados e apaga ao soltar (depois de a.minHold s), mas nunca passa de a.duration s.
  // Pulsos de dano a cada a.tick s em quem estiver no cone (alcance a.range, abertura a.arc) e QUEIMANDO por alguns
  // segundos. Ele gira devagar acompanhando o alvo — correr de lado ou esquivar sai do fogo; a defesa de frente segura.
  flameStream: {
    start(f, a, world) {
      const lance = f.rig.props.flameLance;
      const tanks = f.rig.props.flameTanks;
      const props = (on) => {
        if (lance) lance.visible = on;
        if (tanks) tanks.visible = on;
        if (a.hideProp) f.rig.showProp(a.hideProp, !on);
      };
      props(true);
      f.vel.set(0, 0, 0);
      const opp0 = f.opponent;
      if (opp0 && opp0.state !== 'ko') f.yaw = yawTo(f.pos, opp0.pos);
      let stopAt = a.windup + a.duration;
      let total = stopAt + a.recovery;
      f.anim.play(a.anim || 'point', { restart: true, duration: total });
      f.holdChannel = true;
      world.audio.play('carga', { volume: 0.6, pitch: 0.7 });
      let t = 0;
      let tickT = 0;
      let roar = 0;
      const from = new THREE.Vector3();
      const end = () => { f.holdChannel = false; props(false); };
      return {
        update(dt) {
          t += dt;
          f.vel.x = 0;
          f.vel.z = 0;
          const opp = foeOf(world, f);
          if (opp && opp.state !== 'ko') f.yaw = turnTowards(f.yaw, yawTo(f.pos, opp.pos), dt * (a.turn ?? 2.2));
          const held = f.input && (f.input.held.ranged || f.input.held.carga);
          if (f.holdChannel && t >= a.windup + (a.minHold ?? 0.4) && t < stopAt && !held) {
            stopAt = t; // soltou: o fogo apaga
            total = stopAt + a.recovery;
          }
          if (t >= stopAt) f.holdChannel = false;
          const firing = t >= a.windup && t < stopAt;
          if (t < a.windup && lance && Math.random() < 0.5) world.fx.burst(lance.userData.muzzle.getWorldPosition(from), { count: 1, color: 0x4ab0ff, speed: 0.3, life: 0.2, size: 0.08 });
          if (firing) {
            const F = forwardFromYaw(f.yaw);
            if (lance) lance.userData.muzzle.getWorldPosition(from); else from.copy(f.chestPos());
            // o jato: labaredas saindo do bico e abrindo em cone, mais largas e alaranjadas na ponta
            for (let i = 0; i < 4; i++) {
              const k = Math.random();
              const spread = (Math.random() - 0.5) * (a.arc * DEG) * k;
              const c = Math.cos(spread), s = Math.sin(spread);
              const dx = F.x * c - F.z * s, dz = F.x * s + F.z * c;
              const p = new THREE.Vector3(from.x + dx * a.range * k, from.y - 0.25 * k + Math.random() * 0.2, from.z + dz * a.range * k);
              world.fx.burst(p, { count: 1, color: k < 0.3 ? 0xffe8a0 : k < 0.65 ? 0xffa030 : FIRE, speed: 0.8, up: 1.2, life: 0.22 + k * 0.2, size: 0.18 + k * 0.5 });
            }
            if (Math.random() < 0.25) world.fx.burst(from.clone().addScaledVector(F, a.range * 0.8), { count: 1, color: 0x2a2220, kind: 'smoke', speed: 0.5, up: 1.4, life: 0.8, size: 0.7, grow: 1 });
            roar -= dt;
            if (roar <= 0) { roar = 0.3; world.audio.play('smoke', { volume: 0.55, pitch: 0.6 + Math.random() * 0.15 }); }
            tickT -= dt;
            if (tickT <= 0) {
              tickT = a.tick;
              const inCone = (pos) => distXZ(f.pos, pos) <= a.range && Math.abs(angleDiff(f.yaw, yawTo(f.pos, pos))) <= (a.arc * DEG) / 2;
              if (opp && opp.state !== 'ko' && opp.pos.y < 2.6 && inCone(opp.pos)) {
                const dealt = applyHit(world, f, opp, {
                  damage: a.damage, kind: 'ability', ability: a.id, element: a.element, reaction: false, knockback: 0.3, hitstun: 0, fire: true,
                  dir: new THREE.Vector3(F.x, 0, F.z), color: FIRE, sound: 'impact', scale: 0.7,
                });
                if (dealt > 0 && a.burn) igniteFighter(world, f, opp, a.burn);
              }
              for (const n of world.npcs || []) if (n.alive && n.owner !== f && n.pos && inCone(n.pos)) n.hitBy(f, a.damage, { kind: 'ability' });
            }
          }
          if (t >= total) { end(); return true; }
          return false;
        },
        cancel: end,
      };
    },
  },
});
