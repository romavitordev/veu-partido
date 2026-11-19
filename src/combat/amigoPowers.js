import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw, angleDiff, DEG } from '../core/util.js';
import { applyHit } from './damage.js';
import { splitDamage } from './specials/common.js';
import { inkTentacle, inkSplash, ghostBell, bellWave } from '../fx/inkFx.js';

// Habilidades próprias do AMIGO IMAGINÁRIO ("A Obra de Arte Perfeita", O Segredo na Ilha), registradas em
// abilities.js. Wiki: Tentáculos, AGARRÃO (puxa; irritada, arremessa), DERRETER (a tinta escorre no rosto da vítima),
// DISSOLVER (absorve o corpo e cura o que tirou) e O SINO (a mente falha; no Frenesi, quem ouve morde a si mesmo).

const INK = 0x5a2410;
const v = new THREE.Vector3();

const mouth = (f) => (f.rig.sockets.mouth || f.rig.joints.hd).getWorldPosition(new THREE.Vector3());
const headOf = (f) => f.rig.joints.hd.getWorldPosition(new THREE.Vector3());
// as distâncias dos agarrões crescem com a criatura (a ficha tem size 1,4; o chefe, maior): a vítima fica na frente do
// manto, não dentro dele (v5.21.1 deixou o Amigo enorme)
const big = (f) => Math.max(1, (f.size || 1) / 1.15);
const inFront = (f, opp, arc) => Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos))) <= (arc * DEG) / 2;

// ROSTO DERRETIDO: o que sobra depois da tinta — dano contínuo, lento, mais fraco e a tinta pingando do rosto
export function meltFace(world, opp, a) {
  const old = opp.findBuff('meltedFace');
  if (old) { old.time = a.duration; return; }
  let acc = 0;
  const prev = opp.buffTint;
  opp.buffTint = { color: 0x6a3418, base: 0.3 };
  opp.addBuff({
    type: 'meltedFace', name: 'ROSTO DERRETENDO', time: a.duration, duration: a.duration,
    mult: a.weaken, affects: ['melee', 'ranged', 'ability'], speedMult: a.slow,
    onTick(dt) {
      if (opp.state === 'ko') return;
      acc += a.dps * dt;
      if (acc >= 1) { const n = Math.floor(acc); acc -= n; opp.takeDamage(n); opp.flash = 0; }
      if (Math.random() < 0.3) world.fx.burst(headOf(opp), { count: 1, color: INK, speed: 0.2, up: -0.5, life: 0.5, size: 0.08, gravity: 9 });
    },
    onEnd() { if (opp.buffTint && opp.buffTint.color === 0x6a3418) opp.buffTint = prev || null; },
  });
}

export const AMIGO_TYPES = {
  // DERRETER: avança, agarra a cabeça da vítima com as garras e curva o capuz sobre o rosto dela — a tinta escorre do
  // buraco do rosto direto na cara do alvo (dano em pulsos, sem defesa). Solta com o ROSTO DERRETENDO (dano contínuo,
  // lento e mais fraco). Errou (longe, de lado, esquiva): nada.
  inkMelt: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      const hold = a.hold ?? 0.9;
      f.vel.set(0, 0, 0);
      if (opp && distXZ(f.pos, opp.pos) < 6) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('ai_pour', { restart: true, duration: a.windup + hold + a.recovery });
      world.audio.play('drain', { volume: 0.6, pitch: 0.6 });
      let held = false;
      let stream = null;
      const release = () => {
        held = false;
        if (stream) { stream.stop(); stream = null; }
      };
      tl.each(() => {
        if (held) {
          // a vítima fica presa de frente para o buraco do rosto
          const F = forwardFromYaw(f.yaw);
          opp.pos.set(f.pos.x + F.x * 1.0 * big(f), opp.pos.y, f.pos.z + F.z * 1.0 * big(f));
          opp.vel.set(0, 0, 0);
          opp.yaw = yawTo(opp.pos, f.pos);
          f.vel.set(0, 0, 0);
          return;
        }
        // investida curta até a vítima
        const t = tl.time;
        if (t > a.windup - 0.16 && t < a.windup + 0.02 && opp && distXZ(f.pos, opp.pos) > 1.1 * big(f)) {
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * 7;
          f.vel.z = F.z * 7;
        } else { f.vel.x = 0; f.vel.z = 0; }
      });
      tl.add(a.windup, () => {
        if (!opp || opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) - opp.radius > a.range || !inFront(f, opp, 110)) {
          f.notify('DERRETER (ERROU)', true);
          return;
        }
        held = true;
        opp.cancelAction && opp.cancelAction();
        opp.stun(hold + 0.25, 'stagger');
        opp.notify('A TINTA ESCORRE NO ROSTO', true);
        world.audio.play('inkPour', { volume: 1 });
        // o jorro: do buraco do rosto direto na cara da vítima
        stream = world.fx.emitter({
          rate: 80,
          follow: () => mouth(f).lerp(headOf(opp), 0.15),
          particle: { color: INK, speed: 0.4, up: -1.2, spread: 0.06, life: 0.3, size: 0.13, gravity: 5 },
        });
      });
      const parts = splitDamage(a.damage, [0.2, 0.2, 0.2, 0.4]);
      parts.forEach((d, i) => tl.add(a.windup + 0.12 + (i * hold) / 4, () => {
        if (!held || opp.state === 'ko') return;
        const p = headOf(opp);
        inkSplash(world, p, { size: i === 3 ? 0.9 : 0.5, puddle: false });
        applyHit(world, f, opp, { damage: d, kind: 'ability', ability: a.id, element: 'tinta', unblockable: true, reaction: false, knockback: 0, hitstun: 0, color: INK, sound: i === 3 ? 'heavyPunch' : 'clawHit', scale: 0.7, pos: p });
      }));
      tl.add(a.windup + hold, () => {
        if (!held) return;
        release();
        if (opp.state === 'ko') return;
        const F = forwardFromYaw(f.yaw);
        opp.vel.x = F.x * 5;
        opp.vel.z = F.z * 5;
        inkSplash(world, opp.pos.clone().setY(0.05), { size: 1.1 });
        meltFace(world, opp, a);
        opp.notify('ROSTO DERRETENDO', true);
      });
      tl.end(a.windup + hold + a.recovery);
      return { update: (dt) => tl.update(dt), cancel: release };
    },
  },

  // O SINO: o sino toca DENTRO da criatura (o sino fantasma aparece sobre o capuz). Três badaladas: cada uma abre uma
  // onda de som em volta (qualquer direção) que machuca um pouco; quem ainda estiver perto na ÚLTIMA fica paralisado
  // e VULNERÁVEL (leva mais dano) — "quem ouve o sino tem a mente falhando".
  bellToll: {
    start(f, a, world) {
      const tl = new Timeline();
      const tolls = a.tolls ?? 3;
      const gap = a.gap ?? 0.3;
      const first = a.windup ?? 0.3;
      const total = first + gap * (tolls - 1) + (a.recovery ?? 0.35);
      f.vel.set(0, 0, 0);
      f.anim.play(a.anim || 'ai_bell', { restart: true, duration: total });
      // a.scream (o Grito Rasgado da Degolificada): sem o sino fantasma — as ondas saem do grito
      const bell = a.scream ? { toll() {} } : ghostBell(world, () => headOf(f).add(v.set(0, 0.95, 0)), { life: total + 0.2 });
      for (let i = 0; i < tolls; i++) {
        tl.add(first + i * gap, () => {
          const last = i === tolls - 1;
          bell.toll();
          if (a.scream) world.audio.play(last ? 'scare' : 'fearGaze', { volume: last ? 1.1 : 0.7, pitch: last ? 1.4 : 0.4 + i * 0.1 });
          else world.audio.play('bellToll', { volume: last ? 1.1 : 0.8, pitch: (f.findBuff('awakened') ? 0.7 : 1) - i * 0.06 }); // no Frenesi, distorcido
          bellWave(world, f.pos.clone().setY(1.0), a.range * (0.75 + 0.125 * i), a.color ?? 0xb07a3a);
          world.cameraRig.shake && world.cameraRig.shake(last ? 0.22 : 0.1, 0.2);
          const opp = f.opponent;
          if (!opp || opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) > a.range) return;
          applyHit(world, f, opp, { damage: last ? a.damage : a.tollDamage, kind: 'ability', ability: a.id, element: a.element || 'tinta', unblockable: true, reaction: false, knockback: 0, hitstun: 0, color: a.color ?? 0xb07a3a, sound: 'impact', scale: 0.6 });
          if (!last || opp.state === 'ko') { opp.notify(a.scream ? 'O GRITO...' : 'O SINO...', true); return; }
          opp.stun(a.stun, 'fear');
          const old = opp.findBuff('bellDazed');
          if (old) old.time = a.vulnTime;
          else opp.addBuff({ type: 'bellDazed', name: a.scream ? 'ENSURDECIDO' : 'A MENTE FALHA', time: a.vulnTime, duration: a.vulnTime, takenMult: a.takenMult });
          opp.notify(a.scream ? 'GRITO RASGADO — ENSURDECIDO' : 'O SINO TOCOU — A MENTE FALHA', true);
          // FRENESI DE SANGUE (wiki): o sino muda de frequência, distorcido — quem ouve sente a ânsia de violência e,
          // sem outro ser vivo por perto, MORDE A SI MESMO (dano e sangramento)
          if (f.findBuff('awakened') && a.frenzyBite) {
            applyHit(world, f, opp, { damage: a.frenzyBite, kind: 'ability', ability: a.id, element: 'sangue', unblockable: true, reaction: false, knockback: 0, hitstun: 0, ignoreInvuln: true, color: 0xa02a18, sound: 'bloodClaw', scale: 0.8 });
            opp.applyBleed({ dps: 4, duration: 3 }, f);
            opp.notify('MORDE A SI MESMO', true);
          }
          world.fx.burst(headOf(opp), { count: 24, color: 0x2a1408, kind: 'smoke', speed: 1.5, life: 0.8, size: 0.4 });
          world.onHit && world.onHit(f, opp, 0, { kind: 'ability', ability: a.id });
        });
      }
      tl.end(total);
      return { update: (dt) => tl.update(dt), cancel() {} };
    },
  },

  // DISSOLVER (wiki: "pega o corpo de alguém e o absorve para si, o derretendo completamente, recuperando Pontos de
  // Vida"; no livro, "uma quantidade de PV igual ao dano causado à vítima"). (Pedido do dono, 2026-11-14, pelas cenas de
  // O Segredo na Ilha: "usa os tentáculos de forma rápida e puxa os personagens pelos pés os trazendo para dentro da
  // roupa dele, consumindo-os com a tinta") — os tentáculos disparam RENTE AO CHÃO, laçam a vítima PELOS PÉS de longe,
  // ela cai e é ARRASTADA de costas até a criatura e SOME para dentro do manto; lá dentro a tinta a consome em pulsos
  // (cada pulso cura o mesmo tanto que tirou) e a criatura a CUSPE coberta de tinta, o rosto derretendo. Errou: nada.
  inkDissolve: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      const hold = a.hold ?? 1.1;
      const reach = a.reach ?? 7.5;
      f.vel.set(0, 0, 0);
      if (opp && distXZ(f.pos, opp.pos) < reach + 2) f.yaw = yawTo(f.pos, opp.pos);
      const F = forwardFromYaw(f.yaw);
      f.anim.play('ai_fling', { restart: true, duration: 0.5 });
      world.audio.play('whip', { volume: 0.8, pitch: 0.55 });
      let phase = null; // 'drag' → 'inside' → null
      let dragFrom = null;
      let dragT = 0;
      let dragDur = 0.4;
      let trail = null;
      let gulp = null;
      const hem = () => f.pos.clone().addScaledVector(F, 0.35 * big(f)).setY(0.15);
      const release = () => {
        phase = null;
        if (trail) { trail.stop(); trail = null; }
        if (gulp) { gulp.stop(); gulp = null; }
        if (opp && opp.rig) { opp.rig.root.visible = true; opp.rig.root.scale.set(1, 1, 1); }
        if (f.rig) f.rig.root.scale.setScalar(f.sizeScale || 1); // o chefe é maior (sizeScale)
      };
      tl.each((t, dt) => {
        f.vel.set(0, 0, 0);
        if (!phase || !opp) return;
        if (opp.state === 'ko') { release(); return; }
        if (phase === 'drag') {
          // arrastada de costas pelos pés, cada vez mais rápido, até a barra do manto
          dragT += dt;
          const k = Math.min(1, dragT / dragDur);
          const e = k * k;
          const to = f.pos.clone().addScaledVector(F, 0.7 * big(f));
          opp.pos.set(dragFrom.x + (to.x - dragFrom.x) * e, opp.pos.y, dragFrom.z + (to.z - dragFrom.z) * e);
          opp.vel.set(0, 0, 0);
          opp.yaw = yawTo(opp.pos, f.pos); // os pés na frente, para a criatura
          return;
        }
        // dentro do manto: a vítima fica escondida na criatura, que se contorce enquanto a tinta a consome
        opp.pos.set(f.pos.x + F.x * 0.2, opp.pos.y, f.pos.z + F.z * 0.2);
        opp.vel.set(0, 0, 0);
        const w = Math.sin(t * 26) * 0.05;
        const S = f.sizeScale || 1;
        f.rig.root.scale.set((1.08 + w) * S, (0.96 - w * 0.5) * S, (1.08 + w) * S);
      });
      tl.add(a.windup, () => {
        const caught = opp && opp.state !== 'ko' && !opp.isInvulnerable() && Math.abs(opp.pos.y - f.pos.y) < 1.2 && distXZ(f.pos, opp.pos) <= reach && inFront(f, opp, a.arc ?? 80);
        // três tentáculos rápidos saindo da barra do manto, rente ao chão
        for (let i = 0; i < 3; i++) {
          const o = hem().add(new THREE.Vector3((i - 1) * 0.3 * F.z, 0, (i - 1) * -0.3 * F.x));
          const end = caught ? () => opp.pos.clone().setY(0.12 + i * 0.06) : o.clone().addScaledVector(F, reach * 0.85).setY(0.1);
          inkTentacle(world, o, end, { grow: 0.08, hold: caught ? 0.45 : 0.1, retract: 0.15, coil: caught, radius: 0.07, arc: 0.12, wiggle: 0.18 });
        }
        if (!caught) { f.notify('DISSOLVER (ERROU)', true); return; }
        applyHit(world, f, opp, { damage: a.grabDamage ?? 8, kind: 'ability', ability: a.id, element: 'tinta', unblockable: true, reaction: false, knockback: 0, hitstun: 0, color: INK, sound: 'whip', scale: 0.6, pos: opp.pos.clone().setY(0.2) });
        if (opp.state === 'ko') return;
        opp.cancelAction && opp.cancelAction();
        dragDur = Math.min(0.55, Math.max(0.22, distXZ(f.pos, opp.pos) / 14));
        opp.stun(dragDur + hold + 0.6, 'stagger');
        opp.anim.play('downed', { restart: true, duration: 0.25 });
        opp.notify('PUXADO PELOS PÉS', true);
        world.audio.play('chainPull', { volume: 0.9, pitch: 0.6 });
        dragFrom = opp.pos.clone();
        dragT = 0;
        phase = 'drag';
        f.anim.play('ai_dissolve', { restart: true, duration: dragDur + hold + a.recovery });
        // o rastro de tinta no chão por onde ela é arrastada
        trail = world.fx.emitter({ rate: 70, follow: () => opp.pos.clone().setY(0.06), particle: { color: INK, speed: 0.2, up: 0.1, spread: 0.25, life: 0.9, size: 0.2, gravity: 0 } });
        const t0 = a.windup + dragDur;
        // PARA DENTRO DA ROUPA
        tl.add(t0, () => {
          if (phase !== 'drag' || opp.state === 'ko') return;
          if (trail) { trail.stop(); trail = null; }
          phase = 'inside';
          opp.rig.root.visible = false;
          inkSplash(world, f.pos.clone().setY(0.05), { size: 1.6, life: hold + 0.6 });
          world.audio.play('inkPour', { volume: 1, pitch: 0.6 });
          if (world.cameraRig.shake) world.cameraRig.shake(0.2, 0.2);
          opp.notify('DENTRO DO MANTO — A TINTA CONSOME', true);
          gulp = world.fx.emitter({ rate: 40, follow: () => f.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.1, 0.2 + Math.random() * 0.6, (Math.random() - 0.5) * 1.1)), particle: { color: INK, speed: 0.6, up: 0.4, spread: 0.2, life: 0.4, size: 0.14, gravity: 4 } });
        });
        const parts = splitDamage(a.damage, [0.25, 0.25, 0.25, 0.25]);
        parts.forEach((d, i) => tl.add(t0 + 0.12 + (i * hold) / 4, () => {
          if (phase !== 'inside' || opp.state === 'ko') return;
          const before = opp.health;
          applyHit(world, f, opp, { damage: d, kind: 'ability', ability: a.id, element: 'tinta', unblockable: true, reaction: false, knockback: 0, hitstun: 0, ignoreInvuln: true, color: INK, sound: 'clawHit', scale: 0.6, pos: f.chestPos() });
          const took = Math.max(0, before - opp.health);
          f.health = Math.min(f.maxHealth, f.health + took); // cura o mesmo que tirou
          world.fx.burst(f.chestPos(), { count: 14, color: INK, speed: 1.6, up: 0.6, life: 0.45, size: 0.15 });
        }));
        // CUSPIDA coberta de tinta, o rosto derretendo
        tl.add(t0 + hold, () => {
          if (phase !== 'inside') return;
          release();
          if (opp.state === 'ko') return;
          opp.pos.set(f.pos.x + F.x * 1.2 * big(f), opp.pos.y, f.pos.z + F.z * 1.2 * big(f));
          opp.react({ dir: F, knockback: 6, hitstun: 0.6, launch: true, lowLaunch: true });
          world.audio.play('heavyPunch', { volume: 0.7, pitch: 0.6 });
          inkSplash(world, opp.pos.clone().setY(0.4), { size: 1.4, puddle: false });
          if (a.melt) meltFace(world, opp, a.melt);
          opp.notify('CUSPIDO NA TINTA', true);
        });
      });
      tl.end(a.windup + 0.6 + hold + a.recovery);
      return { update: (dt) => tl.update(dt), cancel: release };
    },
  },

  // AGARRÃO (wiki: "com seus diversos tentáculos, consegue agarrar diversas pessoas simultaneamente para PUXÁ-LAS em
  // sua direção"; "se a criatura se irritar, ela pode também ARREMESSAR quem ela está segurando para longe, com uma
  // força descomunal"): os tentáculos saem de baixo do capuz, se enrolam no alvo e o PUXAM até a frente da criatura
  // (preso um instante: a deixa para o Derreter). No FRENESI DE SANGUE, irritada, ela o ARREMESSA longe.
  inkTentacles: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      const pull = a.pull ?? 0.45;
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('ai_point', { restart: true, duration: a.windup + pull + 0.3 });
      world.audio.play('chainThrow', { volume: 0.7, pitch: 0.6 });
      const frenzy = !!f.findBuff('awakened');
      const n = a.count ?? 4;
      const F = forwardFromYaw(f.yaw);
      const origin = (i) => f.chestPos().add(new THREE.Vector3((i % 2 ? 1 : -1) * 0.35, -0.3 + (i % 3) * 0.15, 0)).addScaledVector(F, 0.3);
      let pulling = false;
      tl.each(() => {
        f.vel.set(0, 0, 0);
        if (!pulling) return;
        // puxa: a vítima desliza até ficar colada na frente da criatura
        const want = f.pos.clone().addScaledVector(F, 1.3);
        opp.vel.set((want.x - opp.pos.x) * 9, opp.vel.y, (want.z - opp.pos.z) * 9);
      });
      tl.add(a.windup, () => {
        const caught = opp && opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(f.pos, opp.pos) <= a.range && inFront(f, opp, a.arc ?? 50);
        for (let i = 0; i < n; i++) {
          const o = origin(i);
          const end = caught ? () => opp.pos.clone().setY(opp.pos.y + 0.6 + (i % 2) * 0.5) : o.clone().addScaledVector(F, a.range * 0.8).setY(1.0 + (i % 2) * 0.3);
          inkTentacle(world, o, end, { grow: 0.12, hold: caught ? pull + 0.15 : 0.15, retract: 0.2, coil: caught, radius: 0.08, arc: 0.4, ...(a.tentColor != null ? { color: a.tentColor, emissive: 0x000000 } : {}) });
        }
        world.audio.play('whip', { volume: 0.8, pitch: 0.7 });
        if (!caught) { f.notify('TENTÁCULOS (ERROU)', true); return; }
        const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: a.element || 'tinta', knockback: 0, hitstun: 0.3, reaction: false, sound: 'clawHit', color: a.color ?? INK, scale: 1 });
        if (typeof res !== 'number' || res <= 0 || opp.state === 'ko') return;
        opp.cancelAction && opp.cancelAction();
        opp.stun(pull + (frenzy ? 0.1 : a.hold ?? 0.6), 'stagger');
        pulling = true;
        opp.notify(a.caughtLabel || 'PUXADO PELOS TENTÁCULOS', true);
        world.audio.play('chainPull', { volume: 0.8, pitch: 0.7 });
        tl.add(a.windup + pull, () => {
          pulling = false;
          opp.vel.set(0, 0, 0);
          // a.alwaysThrow (a Degolificada: o cabelo agarra e JOGA NA PAREDE): arremessa mesmo sem o Frenesi
          if ((!frenzy && !a.alwaysThrow) || opp.state === 'ko') return;
          // irritada: ARREMESSA com força descomunal
          applyHit(world, f, opp, { damage: a.throwDamage ?? 40, kind: 'ability', ability: a.id, element: a.element || 'tinta', launch: true, knockback: 15, hitstun: 0.9, unblockable: true, ignoreInvuln: true, color: 0xa02a18, sound: 'heavyPunch', scale: 1.5, dir: forwardFromYaw(f.yaw) });
          world.cameraRig.shake && world.cameraRig.shake(0.25, 0.25);
          opp.notify('ARREMESSADO', true);
        });
      });
      tl.end(a.windup + pull + 0.3);
      return { update: (dt) => tl.update(dt), cancel() { pulling = false; } };
    },
  },
};
