import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { igniteFighter } from '../burn.js';
import { findFreeSpotNear } from '../positioning.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { lowAngle, orbit, twoShot, impactClose, faceClose } from '../../camera/shots.js';
import { pontos, spendPoint, takePoint, givePoint, pointOrb, duelCircle } from '../ordoCalamitas.js';

// ESPECIAIS PRÓPRIOS DA ORDO CALAMITAS (pedido do dono, 2026-11-20: "não quero poderes padrão pra esses personagens,
// quero eles como no canon"). Antes os dez usavam o `cinematicCombo` genérico. Cada cena sai da ficha ou da história do
// personagem em Calamidade (as cenas em si são PROPOSTA; ver lore/ORDO-CALAMITAS-KITS.md):
//   lastSacrifice   VERITUS — O Sacrifício do Líder: gasta até 3 pontos de existência e cada um vira uma lança
//   bloodMoon       RANCOR — Sob a Lua de Sangue: o círculo do Hexatombe, o sino toca três vezes; quem fica é o sacrifício
//   romeBurns       NERO — Roma em Chamas: três anéis de fogo (dá para pular/esquivar), o chão queima, "AJOELHEM-SE"
//   jupiterPrayer   FAUSTUS — Que Júpiter me Perdoe: reza; três raios marcados no chão; "Te vejo no inferno!"
//   streetBrawl     MARIUS — Briga de Rua: agarra e bate três vezes no chão
//   charmTheft      REMUS — Gostou do que Viu?: o encanto puxa, as garras, o Traiçoeiro duplo
//   ironWall        CORNELIUS — De Ferro: finca o escudo e aguenta tudo; solta a Fúria do que absorveu
//   spyDossier      KARISE — Não é Nada Pessoal: some, aparece atrás, o dossiê prende todas as habilidades
//   grandDuel       MARCELLUS — Duelo até o Fim: o grande círculo; defesas viram riposta, estocadas atravessam
//   khopeshBoomerang CASCADIA — Por Caesar: o khopesh vai e volta, engancha e traz o alvo para a espada reta

const canReach = (f, sp, range = 9) => {
  const opp = f.opponent;
  return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? range);
};
const hit = (world, f, opp, damage, o = {}) => applyHit(world, f, opp, { damage, kind: 'special', reaction: false, ignoreInvuln: true, sound: o.sound || 'bladeHit', color: o.color, scale: o.scale ?? 1.2, element: o.element });
const handPos = (f) => (f.rig.sockets && f.rig.sockets.handR ? f.rig.sockets.handR.getWorldPosition(new THREE.Vector3()) : f.chestPos());
const spotAround = (world, f, opp, a, r) => {
  const base = yawTo(opp.pos, f.pos) + a;
  const x = opp.pos.x + Math.sin(base) * r;
  const z = opp.pos.z + Math.cos(base) * r;
  return findFreeSpotNear(world.arena, x, z, { radius: f.radius ?? 0.5, others: [{ x: opp.pos.x, z: opp.pos.z, r: 0.7 }] }) || { x: f.pos.x, z: f.pos.z };
};
const finish = (world, f, opp, { knockback = 5, low = false } = {}) => {
  world.endCinematic();
  if (opp.rig && opp.rig.body) opp.rig.body.position.y = 0;
  if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: low });
  f.anim.play('idle', { blend: 0.2 });
};
const blocked = () => ({ update: () => true, cancel() {} });
const disposeObj = (world, o) => { world.scene.remove(o); o.traverse((m) => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); }); };

// ====================================================================================== VERITUS
export const lastSacrifice = {
  telegraph: () => ({ time: 0.5, anim: 'cast_up', animDuration: 0.5, mark: 'sigil' }),
  canStart: (f, sp) => canReach(f, sp, 12) && pontos(f) > 1,
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return blocked();
    const n = Math.max(1, Math.min(sp.maxPoints ?? 3, pontos(f) - 1));
    const color = sp.color ?? 0x4a9aff;
    const gold = sp.gold ?? 0xffd27a;
    const tl = new Timeline();
    const lances = [];
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('cast_up', { restart: true, duration: 0.6 + n * 0.4 });
    opp.anim.play('fear', { restart: true });
    world.cameraRig.playShots([
      lowAngle(f, { dur: 0.6 + n * 0.4, dist: 3, side: 1.2 }),
      twoShot(f, opp, { dur: 1.0, dist: 4.5, height: 2.2, side: -1 }),
      impactClose(f, opp, { dur: 1.0 }),
    ]);
    tl.add(0.2, () => world.specialBanner(f, sp, sp.name));
    const lanceGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6).rotateX(Math.PI / 2);
    const tipGeo = new THREE.OctahedronGeometry(0.11).scale(1, 1, 2.2);
    for (let i = 0; i < n; i++) {
      tl.add(0.4 + i * 0.4, () => {
        spendPoint(f, 1);
        const g = new THREE.Group();
        g.add(new THREE.Mesh(lanceGeo, new THREE.MeshBasicMaterial({ color: 0xe8f4ff, toneMapped: false })));
        const tip = new THREE.Mesh(tipGeo, new THREE.MeshBasicMaterial({ color: gold, toneMapped: false }));
        tip.position.z = 0.9;
        g.add(tip);
        const side = (i - (n - 1) / 2) * 1.1;
        const R = new THREE.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw));
        g.position.copy(f.chestPos()).addScaledVector(R, side).add(new THREE.Vector3(0, 1.4 + (i % 2) * 0.3, 0));
        g.lookAt(opp.chestPos());
        world.scene.add(g);
        lances.push(g);
        pointOrb(world, f, g.position.clone(), color);
        world.audio.play('ritual', { volume: 0.6, pitch: 1.2 + i * 0.15 });
        f.notify(`SACRIFÍCIO: −${i + 1} PONTO${i ? 'S' : ''}`, true);
      });
    }
    const fireAt = 0.6 + n * 0.4;
    const parts = splitDamage(sp.perPoint * n + (sp.final ?? 60), [...Array(n).fill(1), 0.5]);
    tl.add(fireAt - 0.15, () => f.anim.play('point', { restart: true, duration: 0.6 }));
    for (let i = 0; i < n; i++) {
      tl.add(fireAt + i * 0.16, () => {
        const g = lances[i];
        if (!g) return;
        world.fx.tracer(g.position.clone(), opp.chestPos(), { color: gold, life: 0.2, width: 0.08 });
        g.visible = false;
        world.audio.play('bladeHit', { volume: 0.8, pitch: 1.1 });
        hit(world, f, opp, parts[i], { color: gold, element: 'energia' });
        if (opp.state !== 'ko') opp.anim.play('stagger', { restart: true });
        world.fx.burst(opp.chestPos(), { count: 24, color, speed: 4, life: 0.5, size: 0.16 });
      });
    }
    tl.add(fireAt + n * 0.16 + 0.25, () => {
      world.fx.flash(opp.chestPos(), { color: gold, size: 4, life: 0.25 });
      world.fx.ring(opp.chestPos(), { color: gold, radius: 3, life: 0.4, vertical: true, yaw: f.yaw });
      world.cameraRig.shake(0.5, 0.3);
      world.audio.play('slashFinal', { volume: 0.9 });
      hit(world, f, opp, parts[n], { color: gold, element: 'energia', scale: 1.8 });
    });
    const end = fireAt + n * 0.16 + 0.6;
    tl.end(end);
    const cleanup = () => { for (const g of lances) disposeObj(world, g); lances.length = 0; };
    tl.add(end - 0.01, () => { cleanup(); finish(world, f, opp, { knockback: 6 }); });
    return { update: (dt) => tl.update(dt), cancel: () => { cleanup(); world.endCinematic(); } };
  },
};

// ====================================================================================== SACRIFÍCIO DO RANCOR
// SOB A LUA DE SANGUE: o Hexatombe. A lua vermelha, o círculo do ritual em volta do adversário e o SINO toca três vezes;
// quem continua no círculo é o sacrifício — perde 1 ponto de existência a cada badalada, e ele, o sacrifício que
// sobreviveu, recupera 1. Dá para sair correndo do círculo: não é cinemática.
export const bloodMoon = {
  canStart: (f, sp) => canReach(f, sp, 12),
  start(f, sp, world) {
    const opp = f.opponent;
    const color = sp.color ?? 0xff2a1a;
    const R = sp.radius ?? 2.8;
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('cast_up', { restart: true, duration: 0.9 });
    world.specialBanner(f, sp, sp.name);
    world.screenFlash && world.screenFlash('#3a0004', 0.3);
    const c = new THREE.Vector3(opp.pos.x, 0, opp.pos.z);
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.RingGeometry(R - 0.16, R, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    g.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 64), new THREE.MeshBasicMaterial({ color: 0x5a0006, transparent: true, opacity: 0.35, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.04;
    g.add(disc);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xc01010, fog: false, toneMapped: false }));
    moon.position.set(0, 22, -14);
    g.add(moon);
    g.position.copy(c);
    world.scene.add(g);
    let t = 0;
    let tolls = 0;
    const tollAt = sp.tolls ?? [0.9, 1.9, 2.9];
    world.addTicker({
      update(dt) {
        t += dt;
        ring.material.opacity = 0.6 + 0.3 * Math.sin(t * 7);
        while (tolls < tollAt.length && t >= tollAt[tolls]) {
          tolls++;
          world.audio.play('bellToll', { volume: 1 });
          world.fx.ring(new THREE.Vector3(c.x, 0.07, c.z), { color, radius: R * 1.3, life: 0.7 });
          world.cameraRig.shake(0.25, 0.2);
          if (opp.state !== 'ko' && f.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, c) <= R + 0.2) {
            takePoint(world, opp, 1, { color, label: 'O SACRIFÍCIO É VOCÊ' });
            givePoint(world, f, 1);
            pointOrb(world, opp, f, color);
            if (opp.state !== 'ko') opp.stun(0.2, 'stagger');
          }
        }
        return tolls >= tollAt.length && t >= tollAt[tollAt.length - 1] + 0.4;
      },
      dispose() { disposeObj(world, g); },
    });
    tl.end(0.9);
    return { update: (dt) => tl.update(dt), cancel() {} };
  },
};

// ====================================================================================== NERO
// ROMA EM CHAMAS (cânone: o incêndio de que Nero levou a culpa): três anéis de fogo saem dele — pule ou esquive —, o
// chão em volta queima e ele ordena: "AJOELHEM-SE".
export const romeBurns = {
  canStart: (f, sp) => canReach(f, sp, 14),
  start(f, sp, world) {
    const opp = f.opponent;
    const color = sp.color ?? 0xff6a1a;
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('cast_up', { restart: true, duration: 0.6 });
    world.specialBanner(f, sp, sp.name);
    const o = new THREE.Vector3(f.pos.x, 0, f.pos.z);
    const rings = [];
    const ringAt = sp.rings ?? [0.5, 1.15, 1.8];
    ringAt.forEach((at, i) => tl.add(at, () => {
      f.anim.play(i % 2 ? 'slash_h_back' : 'slash_h', { restart: true, duration: 0.4 });
      world.audio.play('explosion', { volume: 0.6, pitch: 0.7 + i * 0.1 });
      const m = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(o.x, 0.3, o.z);
      world.scene.add(m);
      rings.push({ m, r: 0.5, hit: false });
    }));
    const speed = sp.ringSpeed ?? 9;
    const maxR = sp.ringRadius ?? 12;
    tl.each((t, dt) => {
      for (const R of rings) {
        if (!R.m.parent) continue;
        R.r += speed * (dt ?? 1 / 60);
        R.m.scale.set(R.r, R.r, R.r);
        R.m.material.opacity = 0.9 * (1 - R.r / maxR);
        if (Math.random() < 0.6) {
          const a = Math.random() * Math.PI * 2;
          world.fx.burst(new THREE.Vector3(o.x + Math.cos(a) * R.r, 0.3, o.z + Math.sin(a) * R.r), { count: 2, color: Math.random() < 0.5 ? color : 0xffd070, speed: 0.6, up: 2.4, life: 0.4, size: 0.24 });
        }
        if (!R.hit && opp.state !== 'ko' && !opp.isInvulnerable() && opp.pos.y < 0.45 && Math.abs(distXZ(opp.pos, o) - R.r) < 0.6) {
          R.hit = true;
          applyHit(world, f, opp, { damage: sp.ringDamage ?? 70, kind: 'special', element: 'fogo', knockback: 2.5, hitstun: 0.45, sound: 'explosion', color });
          igniteFighter(world, f, opp, { dps: 10, duration: 2 });
        }
        if (R.r >= maxR) disposeObj(world, R.m);
      }
    });
    tl.add(ringAt[ringAt.length - 1] + 0.3, () => {
      const fire = world.fx.emitter({ rate: 40, follow: () => new THREE.Vector3(o.x + (Math.random() - 0.5) * 9, 0.1, o.z + (Math.random() - 0.5) * 9), particle: { color, speed: 0.4, up: 2.2, life: 0.5, size: 0.3 } });
      let ft = 0;
      world.addTicker({
        update(dt) {
          ft += dt;
          if (opp.state !== 'ko' && distXZ(opp.pos, o) <= (sp.groundRadius ?? 4.5) && opp.pos.y < 0.4) igniteFighter(world, f, opp, { dps: 12, duration: 1 });
          return ft >= (sp.groundTime ?? 3);
        },
        dispose() { fire.stop(); },
      });
    });
    const kneelAt = ringAt[ringAt.length - 1] + 0.8;
    tl.add(kneelAt, () => {
      f.anim.play('point', { restart: true, duration: 0.6 });
      world.showBanner && world.showBanner('AJOELHEM-SE', f.def.color);
      world.audio.play('bellToll', { volume: 0.6, pitch: 0.7 });
      if (opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, f.pos) <= (sp.kneelRange ?? 7)) {
        opp.stun(sp.kneel ?? 1.1, 'forced_kneel');
        opp.notify('AJOELHE-SE', true);
      }
    });
    tl.end(kneelAt + 0.5);
    const cleanup = () => { for (const R of rings) if (R.m.parent) disposeObj(world, R.m); };
    tl.add(kneelAt + 0.49, cleanup);
    return { update: (dt) => tl.update(dt), cancel: cleanup };
  },
};

// ====================================================================================== FAUSTUS
// QUE JÚPITER ME PERDOE (o devoto de Júpiter, que inexistiu rezando): ajoelha e reza com o colar; três raios caem onde
// o adversário estava (o círculo avisa: dá para fugir); ele levanta com o gládio — "Te vejo no inferno!"
export const jupiterPrayer = {
  canStart: (f, sp) => canReach(f, sp, 16),
  start(f, sp, world) {
    const opp = f.opponent;
    const color = sp.color ?? 0xbfe0ff;
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('idle_pray', { restart: true });
    world.specialBanner(f, sp, sp.name);
    world.audio.play('ritual', { volume: 0.6, pitch: 0.7 });
    const bolts = sp.bolts ?? 3;
    for (let i = 0; i < bolts; i++) {
      const markAt = 0.35 + i * 0.6;
      let p = null;
      tl.add(markAt, () => {
        p = new THREE.Vector3(opp.pos.x, 0.07, opp.pos.z);
        world.fx.ring(p, { color, radius: 1.4, life: 0.55 });
        world.fx.ring(p, { color, radius: 0.7, life: 0.55 });
        world.audio.play('heartbeat', { volume: 0.4, pitch: 1.4 });
      });
      tl.add(markAt + 0.55, () => {
        if (!p) return;
        const top = p.clone().setY(16);
        let prev = top;
        for (let s = 1; s <= 6; s++) {
          const q = top.clone().lerp(p, s / 6);
          if (s < 6) q.add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 0, (Math.random() - 0.5) * 0.8));
          world.fx.tracer(prev, q, { color: s % 2 ? 0xffffff : color, life: 0.22, width: 0.12 });
          prev = q;
        }
        world.fx.flash(p.clone().setY(1), { color, size: 4, life: 0.2 });
        world.fx.burst(p, { count: 30, color, speed: 6, up: 2, life: 0.4, size: 0.12 });
        world.audio.play('shockwave', { volume: 0.9, pitch: 1.4 });
        world.audio.play('explosion', { volume: 0.5, pitch: 1.6 });
        world.cameraRig.shake(0.35, 0.2);
        if (opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, p) <= (sp.boltRadius ?? 1.4)) {
          applyHit(world, f, opp, { damage: sp.boltDamage ?? 70, kind: 'special', element: 'energia', knockback: 1.5, hitstun: 0.5, sound: 'shockwave', color });
        }
      });
    }
    const riseAt = 0.35 + bolts * 0.6 + 0.3;
    let lunging = false;
    tl.add(riseAt, () => {
      world.specialBanner(f, sp, 'Te vejo no inferno!');
      f.anim.play('thrust', { restart: true, duration: 0.5 });
      world.audio.play('swing', { volume: 0.8 });
      lunging = opp.state !== 'ko' && distXZ(f.pos, opp.pos) <= (sp.lungeRange ?? 12);
    });
    tl.each((t, dt) => {
      if (!lunging || t < riseAt || t > riseAt + 0.25) return;
      f.yaw = yawTo(f.pos, opp.pos);
      const d = distXZ(f.pos, opp.pos);
      if (d < 1.3) return;
      const F = forwardFromYaw(f.yaw);
      const step = Math.min(d - 1.2, 40 * (dt ?? 1 / 60));
      f.pos.x += F.x * step;
      f.pos.z += F.z * step;
    });
    tl.add(riseAt + 0.28, () => {
      if (!lunging || opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) > 2.2) return;
      if (trySpecialBlock(world, f, opp, { ...sp, damage: sp.finalDamage })) return;
      applyHit(world, f, opp, { damage: sp.finalDamage ?? 110, kind: 'special', knockback: 6, launch: true, hitstun: 0.8, sound: 'slashFinal', color: sp.gladiusColor ?? 0xff5ab4, scale: 1.8 });
      world.cameraRig.shake(0.4, 0.25);
    });
    tl.end(riseAt + 0.6);
    return { update: (dt) => tl.update(dt), cancel() {} };
  },
};

// ====================================================================================== MARIUS
// BRIGA DE RUA: o lutador de rua agarra o adversário e bate três vezes no chão; o Sanguinário fecha (se derrubar com as
// mãos, o ponto volta)
export const streetBrawl = {
  telegraph: () => ({ time: 0.45, anim: 'charge_fists', mark: 'sigil' }),
  canStart: (f, sp) => canReach(f, sp, 9),
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return blocked();
    const color = sp.color ?? 0xff3a2a;
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, [0.12, 0.2, 0.22, 0.46]);
    const tl = new Timeline();
    world.beginCinematic(f, opp);
    const s = spotAround(world, f, opp, 0, 1.0);
    f.pos.x = s.x;
    f.pos.z = s.z;
    f.yaw = yawTo(f.pos, opp.pos);
    opp.yaw = yawTo(opp.pos, f.pos);
    f.anim.play('grab', { restart: true, duration: 0.4 });
    world.cameraRig.playShots([twoShot(f, opp, { dur: 1.2, dist: 3.6 }), orbit(opp, { dur: 1.6, radius: 4, height: 1.6 }), impactClose(f, opp, { dur: 1.0 })]);
    tl.add(0.15, () => world.specialBanner(f, sp, sp.name));
    tl.add(0.3, () => { hit(world, f, opp, parts[0], { color, sound: 'heavyPunch' }); opp.anim.play('stagger', { restart: true }); });
    // ergue e bate no chão três vezes
    const slams = [0.7, 1.3, 1.9];
    tl.each((t) => {
      if (opp.state === 'ko' || !opp.rig.body) return;
      for (const at of slams) {
        if (t >= at - 0.35 && t < at) opp.rig.body.position.y = Math.sin(((t - (at - 0.35)) / 0.35) * Math.PI * 0.5) * 1.3;
        else if (t >= at && t < at + 0.06) opp.rig.body.position.y = 0;
      }
    });
    slams.forEach((at, i) => {
      tl.add(at - 0.35, () => f.anim.play(i === 2 ? 'throw_grab' : 'grab', { restart: true, duration: 0.4 }));
      tl.add(at, () => {
        world.fx.play('FX_GROUND_SMASH', opp.pos.clone().setY(0), { scale: 1.1 + i * 0.2 });
        world.cameraRig.shake(0.35 + i * 0.1, 0.2);
        world.audio.play('heavyPunch', { volume: 0.9, pitch: 0.8 - i * 0.1 });
        hit(world, f, opp, parts[1 + i], { color, sound: 'impact', scale: 1.3 + i * 0.3 });
      });
    });
    tl.add(2.3, () => finish(world, f, opp, { knockback: 4, low: true }));
    tl.end(2.35);
    return { update: (dt) => tl.update(dt), cancel: () => { if (opp.rig.body) opp.rig.body.position.y = 0; world.endCinematic(); } };
  },
};

// ====================================================================================== REMUS
// GOSTOU DO QUE VIU?: o sorriso do Cativante puxa o alvo até ele, as garras abrem caminho e o Traiçoeiro duplo leva dois
// pontos de existência (ele paga um)
export const charmTheft = {
  telegraph: () => ({ time: 0.5, anim: 'point', mark: 'sigil' }),
  canStart: (f, sp) => canReach(f, sp, 10),
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return blocked();
    const color = sp.color ?? 0x4aff6a;
    const parts = splitDamage(sp.damage ?? 200, [0.25, 0.25, 0.25, 0.25]);
    const tl = new Timeline();
    world.beginCinematic(f, opp);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.yaw = yawTo(opp.pos, f.pos);
    f.anim.play('point', { restart: true, duration: 0.6 });
    opp.anim.play('fear', { restart: true });
    world.cameraRig.playShots([faceClose(f, { dur: 0.7 }), twoShot(f, opp, { dur: 1.4, dist: 3.4 }), impactClose(f, opp, { dur: 1.1 })]);
    tl.add(0.1, () => world.specialBanner(f, sp, sp.name));
    const from = opp.pos.clone();
    const F = forwardFromYaw(f.yaw);
    const to = new THREE.Vector3(f.pos.x + F.x * 1.0, opp.pos.y, f.pos.z + F.z * 1.0);
    tl.each((t) => {
      if (t < 0.3 || t > 0.7 || opp.state === 'ko') return;
      const k = (t - 0.3) / 0.4;
      opp.pos.lerpVectors(from, to, k * k * (3 - 2 * k));
      if (Math.random() < 0.5) world.fx.burst(opp.chestPos(), { count: 2, color, speed: 0.6, life: 0.4, size: 0.12 });
    });
    ['slash_h', 'slash_h_back', 'dual_cross', 'uppercut'].forEach((anim, i) => {
      tl.add(0.8 + i * 0.28, () => {
        f.anim.play(anim, { restart: true, duration: 0.3 });
        world.fx.slash && world.fx.slash(opp.chestPos(), { color, yaw: f.yaw, roll: i * 0.8 });
        world.audio.play('clawHit', { volume: 0.8 });
        hit(world, f, opp, parts[i], { color, sound: 'clawHit' });
        if (opp.state !== 'ko') opp.anim.play('stagger', { restart: true });
      });
    });
    tl.add(2.0, () => {
      f.anim.play('point', { restart: true, duration: 0.5 });
      if (pontos(f) > 1) spendPoint(f, 1);
      pointOrb(world, f, opp, color);
      takePoint(world, opp, sp.points ?? 2, { lethal: true, color, label: 'TRAÍDO: −2 PONTOS DE EXISTÊNCIA' });
      world.fx.flash(opp.chestPos(), { color, size: 3, life: 0.2 });
    });
    tl.add(2.45, () => finish(world, f, opp, { knockback: 4 }));
    tl.end(2.5);
    return { update: (dt) => tl.update(dt), cancel: () => world.endCinematic() };
  },
};

// ====================================================================================== CORNELIUS
// DE FERRO: finca o escudo e aguenta TUDO por `stance` s (não é cinemática: o adversário bate à vontade, e cada golpe
// soma — passiva `deFerro`); depois solta a FÚRIA num giro de lança que cresce com o que absorveu, e fica em Fúria
// (cada golpe físico acerta duas vezes) por `furia` s.
export const ironWall = {
  canStart: () => true,
  start(f, sp, world) {
    const color = sp.color ?? 0x5a8cff;
    world.specialBanner(f, sp, sp.name);
    world.audio.play('blockHit', { volume: 1, pitch: 0.5 });
    world.after(0.02, () => {
      if (f.state === 'ko') return;
      const stance = sp.stance ?? 2;
      f.stun(stance, f.def.anims.block || 'block_heavy');
      f.armorHits = (f.armorHits || 0) + 99;
      const glow = world.fx.emitter({ rate: 26, follow: () => f.chestPos(), particle: { color, speed: 0.5, spread: 0.6, life: 0.4, size: 0.16 } });
      const wall = {
        type: 'ironWall', name: 'DE FERRO', time: stance, duration: stance, absorbed: 0, takenMult: sp.takenMult ?? 0.1, knockbackTakenMult: 0,
        onEnd() {
          glow.stop();
          f.armorHits = Math.max(0, (f.armorHits || 0) - 99);
          if (f.state === 'ko') return;
          const dmg = Math.round((sp.base ?? 120) + Math.min(sp.maxBonus ?? 220, wall.absorbed * (sp.ratio ?? 0.8)));
          f.anim.play('blade_low_spin', { restart: true, duration: 0.55 });
          world.fx.ring(new THREE.Vector3(f.pos.x, 0.08, f.pos.z), { color: 0xff4a2a, radius: sp.radius ?? 3.6, life: 0.45 });
          world.fx.burst(f.chestPos(), { count: 50, color: 0xff4a2a, speed: 8, life: 0.5, size: 0.18 });
          world.cameraRig.shake(0.5, 0.3);
          world.audio.play('slashFinal', { volume: 0.9, pitch: 0.8 });
          f.notify('FÚRIA', true);
          f.addBuff({ type: 'furia', name: 'FÚRIA', time: sp.furia ?? 6, duration: sp.furia ?? 6, color: 0xff4a2a });
          const opp = f.opponent;
          if (opp && opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, f.pos) <= (sp.radius ?? 3.6) + opp.radius) {
            applyHit(world, f, opp, { damage: dmg, kind: 'special', knockback: 6, launch: true, hitstun: 0.8, sound: 'heavyPunch', color: 0xff4a2a, scale: 2 });
          }
        },
      };
      f.addBuff(wall);
      f.notify('DE FERRO', true);
    });
    return { update: () => true, cancel() {} };
  },
};

// ====================================================================================== KARISE
// NÃO É NADA PESSOAL: some, aparece atrás e o dossiê fica completo — TODAS as habilidades do adversário presas por
// `seal` s — e as adagas vêm de todos os lados
export const spyDossier = {
  telegraph: () => ({ time: 0.45, anim: 'point', mark: 'sigil' }),
  canStart: (f, sp) => canReach(f, sp, 10),
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return blocked();
    const color = sp.color ?? 0x3ac8ff;
    const daggers = sp.daggers ?? 8;
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, [...Array(daggers).fill(0.07), 0.44]);
    const tl = new Timeline();
    world.beginCinematic(f, opp);
    world.fx.burst(f.chestPos(), { count: 30, color: 0x10141a, kind: 'smoke', speed: 1.5, life: 0.5, size: 0.4 });
    f.setVisible(false);
    world.audio.play('teleport', { volume: 0.6 });
    world.cameraRig.playShots([orbit(opp, { dur: 1.8, radius: 3.6, height: 1.8, a0: 0.4, a1: -0.8 }), impactClose(f, opp, { dur: 1.1 })]);
    tl.add(0.15, () => world.specialBanner(f, sp, sp.name));
    for (let i = 0; i < daggers; i++) {
      tl.add(0.4 + i * 0.12, () => {
        if (opp.state === 'ko') return;
        const a = (i / daggers) * Math.PI * 2;
        const c = opp.chestPos();
        world.fx.tracer(c.clone().add(new THREE.Vector3(Math.cos(a) * 4, 0.4 + (i % 3) * 0.3, Math.sin(a) * 4)), c, { color: 0xd8e0ea, life: 0.12, width: 0.03 });
        world.audio.play('knifeThrow', { volume: 0.5, pitch: 1.1 + i * 0.04 });
        hit(world, f, opp, parts[i], { color, scale: 0.8 });
        opp.anim.play('stagger', { restart: true });
      });
    }
    const behindAt = 0.4 + daggers * 0.12 + 0.1;
    tl.add(behindAt, () => {
      const back = forwardFromYaw(opp.yaw);
      f.pos.x = opp.pos.x - back.x * 0.9;
      f.pos.z = opp.pos.z - back.z * 0.9;
      f.yaw = yawTo(f.pos, opp.pos);
      f.setVisible(true);
      f.anim.play('dual_cross', { restart: true, duration: 0.4 });
    });
    tl.add(behindAt + 0.2, () => {
      hit(world, f, opp, parts[daggers], { color, scale: 1.6, sound: 'slashFinal' });
      world.fx.flash(opp.chestPos(), { color, size: 3, life: 0.2 });
    });
    tl.add(behindAt + 0.5, () => {
      finish(world, f, opp, { knockback: 4 });
      if (opp.state === 'ko') return;
      const seal = sp.seal ?? 6;
      opp.addBuff({ type: 'dossier', name: 'DOSSIÊ COMPLETO', time: seal, duration: seal, noAbilities: true, lockMsg: 'O DOSSIÊ: HABILIDADES PRESAS', debuff: true });
      opp.notify('DOSSIÊ COMPLETO: HABILIDADES PRESAS', true);
    });
    tl.end(behindAt + 0.55);
    return { update: (dt) => tl.update(dt), cancel: () => { f.setVisible(true); world.endCinematic(); } };
  },
};

// ====================================================================================== MARCELLUS
// DUELO ATÉ O FIM: o grande círculo do duelo por `duration` s — toda defesa dele vira riposta (o bloqueio perfeito fica
// largo) e as estocadas atravessam a defesa
export const grandDuel = {
  canStart: (f, sp) => canReach(f, sp, 9),
  start(f, sp, world) {
    const opp = f.opponent;
    const color = sp.color ?? 0xffd27a;
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('thrust', { restart: true, duration: 0.6 });
    world.specialBanner(f, sp, sp.name);
    world.audio.play('blade', { volume: 0.9, pitch: 1.4 });
    tl.add(0.3, () => {
      const old = f.findBuff('duel');
      if (old) old.time = 0;
      const dur = sp.duration ?? 7;
      f.addBuff({ type: 'grandDuel', name: 'DUELO ATÉ O FIM', time: dur, duration: dur, foe: opp, unblockable: true, perfectBlockWindow: sp.parryWindow ?? 0.5, takenMult: 0.8, mult: sp.damageMult ?? 1.25, affects: ['melee', 'ability'] });
      duelCircle(world, f, opp, 'grandDuel', sp.radius ?? 7, color);
      f.notify('DUELO ATÉ O FIM', true);
      opp.notify('NINGUÉM SAI DO CÍRCULO', true);
    });
    tl.end(0.6);
    return { update: (dt) => tl.update(dt), cancel() {} };
  },
};
// ====================================================================================== CASCADIA
// POR CAESAR (o filho; PROPOSTA a partir das armas): o khopesh vai como bumerangue, engancha o alvo e volta arrastando-o
// até a espada reta — a estocada e o corte cruzado
export const khopeshBoomerang = {
  telegraph: () => ({ time: 0.5, anim: 'throw_r', mark: 'laser' }),
  canStart: (f, sp) => canReach(f, sp, 12),
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return blocked();
    const color = sp.color ?? 0x4ab4ff;
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, [0.2, 0.15, 0.25, 0.4]);
    const tl = new Timeline();
    world.beginCinematic(f, opp);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.yaw = yawTo(opp.pos, f.pos);
    f.anim.play('throw_r', { restart: true, duration: 0.4 });
    world.cameraRig.playShots([twoShot(f, opp, { dur: 1.3, dist: 4.4, height: 1.8 }), orbit(f, { dur: 1.0, radius: 3.2 }), impactClose(f, opp, { dur: 1.0 })]);
    tl.add(0.1, () => world.specialBanner(f, sp, sp.name));
    const kh = f.rig.props && f.rig.props.khopesh;
    const blade = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 6, 18, Math.PI * 1.3), new THREE.MeshStandardMaterial({ color: 0xc8ccd4, metalness: 0.8, roughness: 0.3, emissive: color, emissiveIntensity: 0.25 }));
    blade.visible = false;
    world.scene.add(blade);
    let start = null;
    tl.add(0.2, () => { if (kh) kh.visible = false; start = handPos(f); blade.position.copy(start); blade.visible = true; world.audio.play('swing', { volume: 0.8 }); });
    const F = forwardFromYaw(f.yaw);
    const near = () => new THREE.Vector3(f.pos.x + F.x * 1.1, opp.pos.y, f.pos.z + F.z * 1.1);
    let oppFrom = null;
    tl.each((t, dt) => {
      blade.rotation.y += 20 * (dt ?? 1 / 60);
      if (!start) return;
      if (t < 0.55) blade.position.lerpVectors(start, opp.chestPos(), (t - 0.2) / 0.35);
      else if (t < 1.05) {
        const k = (t - 0.55) / 0.5;
        if (!oppFrom) oppFrom = opp.pos.clone();
        if (opp.state !== 'ko') opp.pos.lerpVectors(oppFrom, near(), k * k * (3 - 2 * k));
        blade.position.copy(opp.chestPos());
      } else blade.visible = false;
    });
    tl.add(0.55, () => { hit(world, f, opp, parts[0], { color, sound: 'blade' }); opp.anim.play('stagger', { restart: true }); world.audio.play('chainPull', { volume: 0.6 }); });
    tl.add(1.05, () => { if (kh) kh.visible = true; f.anim.play('thrust', { restart: true, duration: 0.35 }); });
    tl.add(1.15, () => { hit(world, f, opp, parts[1], { color, sound: 'bladeHit' }); world.fx.burst(opp.chestPos(), { count: 16, color, speed: 3, life: 0.4, size: 0.12 }); });
    tl.add(1.45, () => { f.anim.play('slash_h', { restart: true, duration: 0.35 }); hit(world, f, opp, parts[2], { color, sound: 'blade' }); });
    tl.add(1.85, () => {
      f.anim.play('dual_cross', { restart: true, duration: 0.45 });
      world.fx.flash(opp.chestPos(), { color, size: 3, life: 0.2 });
      world.cameraRig.shake(0.4, 0.25);
      hit(world, f, opp, parts[3], { color, sound: 'slashFinal', scale: 1.8 });
    });
    tl.add(2.25, () => finish(world, f, opp, { knockback: 5 }));
    tl.end(2.3);
    const cleanup = () => { disposeObj(world, blade); if (kh) kh.visible = true; };
    tl.add(2.29, cleanup);
    return { update: (dt) => tl.update(dt), cancel: () => { cleanup(); world.endCinematic(); } };
  },
};
