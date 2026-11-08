// AS CRIATURAS DO OUTRO LADO NO MODO DE LUTA (pedido do dono, 2026-11-06: "a versão de boss tava boa… precisam de
// habilidades do cânone"). Os golpes da Degolificada e do Espreitador jogáveis são os MESMOS da IA dos chefes do Outro
// Lado (pve/degolificada.js e pve/espreitador.js), adaptados ao kit de um lutador (tempo de preparo, custo e recarga):
//   DEGOLIFICADA — só os CABELOS (wiki: "usando seus cabelos flutuantes"):
//     hairLash ....... □ Investida de cabelo: a linha no chão marca; os fios disparam em linha reta e empurram
//     hairGrab ....... Agarrar e Estrangular (cânone): agarra, estrangula e JOGA NA PAREDE mais perto
//     hairCrawl ...... Cabelo rastejante: um fio corre pelo chão atrás do alvo e brota debaixo dele
//     hairRain ....... Cabelo por cima: círculos no chão; os fios caem do alto
//     hairGuard ...... Defesa de cabelo: os fios fecham na frente (quase não apanha) e empurram de volta
//     hairScream ..... Grito Rasgado (cânone): rompe a vedação da boca — atordoa e ENSURDECE quem está perto
//     hairToss ....... Arremessar: o cabelo arranca um caixote do chão e o joga onde o alvo está
//     especial hairStrangle (Desfiguramento Capilar): agarra, ergue, estrangula, esmaga no chão e joga na parede
//   ESPREITADOR — as FRESTAS (wiki: "se locomove pelas frestas"; a fraqueza: "bloquear ou fechar sua fresta"):
//     openFresta ..... Abrir Fresta: um ARMÁRIO entreaberto brota no chão (até 3; o mais velho some). Um golpe ou tiro
//                      do adversário FECHA e TRANCA a porta (reabre sozinha depois de um tempo)
//     frestaTravel ... Correr pelas Frestas: entra na fresta mais perto, os OLHOS AMARELOS acendem na fresta mais perto
//                      do alvo e ele sai dela num BOTE. Sem fresta aberta (trancaram todas): fica APAVORADO
//     fortifyDevorado  Fortalecer (cânone): segura a cabeça de um Devorado em campo e o deixa maior e mais forte; sem
//                      Devorado, fortalece a si mesmo
//     especial frestaAmbush (O Olho da Boca): armários brotam em volta do alvo; ele sai de três frestas em sequência e
//                      no fim abre a boca — o OLHO encara e drena a Sanidade
// PROPOSTA de jogo: os botões, os números, o caixote do Arremessar (no modo de luta não há as caixas do bunker), o
// limite de 3 frestas e as cenas dos dois especiais.
import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw, turnTowards } from '../core/util.js';
import { COMBAT } from '../config/combat.js';
import { ABILITY_TYPES, deafFighter } from './abilities.js';
import { applyHit } from './damage.js';
import { resolveBody, findFreeSpotNear } from './positioning.js';
import { inkTentacle } from '../fx/inkFx.js';
import { Closet } from '../pve/espreitador.js';
import { SPECIALS } from './specials/index.js';

const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });
const v1 = new THREE.Vector3();
const HAIR = 0x0a0909;
const HAIR_E = 0x050505;
const WARN = 0xc8d0c0;
const FEAR = 0xf2c230;

// a fita em X da Degolificada cede (true) ou volta (false): a boca enorme de dentes (peças do .glb, models/props.js)
function tearMouth(f, open) {
  const P = f.rig && f.rig.props;
  if (!P || !P.mouthTape) return;
  f.rig.showProp('mouthTape', !open);
  for (const p of ['bigMouth', 'bigMouthGums', 'bigMouthTeeth']) f.rig.showProp(p, open);
}

function groundMesh(world, geo, color, opacity = 0) {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 3;
  world.scene.add(m);
  return m;
}
function dropMesh(world, m) {
  if (!m || !m.parent) return;
  world.scene.remove(m);
  m.geometry.dispose();
  m.material.dispose();
}
const headOf = (f) => (f.rig.joints.hd ? f.rig.joints.hd.getWorldPosition(new THREE.Vector3()) : f.chestPos().clone().setY(f.pos.y + 1.8)).add(new THREE.Vector3(0, 0.25, 0));
const canHit = (opp) => opp && opp.state !== 'ko' && !opp.isInvulnerable();
const hair = (world, from, to, o = {}) => inkTentacle(world, from, to, { color: HAIR, emissive: HAIR_E, splash: false, ...o });

// a direção da PAREDE mais perto (até `max` m), sem jogar de volta em quem arremessa; sem parede perto: para longe
function wallDir(world, f, q, max) {
  const away = new THREE.Vector3(q.pos.x - f.pos.x, 0, q.pos.z - f.pos.z).normalize();
  let best = null;
  let bd = Infinity;
  const probe = new THREE.Vector3();
  const test = new THREE.Vector3();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    if (dir.dot(away) < -0.2) continue;
    for (let s = 1.2; s <= max; s += 0.5) {
      probe.set(q.pos.x + dir.x * s, 0, q.pos.z + dir.z * s);
      test.copy(probe);
      resolveBody(world.arena, test, 0.35);
      if (test.distanceTo(probe) > 0.05) { if (s < bd) { bd = s; best = dir; } break; }
    }
  }
  return best || away;
}

// ARREMESSO NA PAREDE: a vítima voa até bater (dano maior) ou cair no chão
function flingToWall(world, f, q, { speed = 16, max = 10, wallDamage, landDamage, kind = 'ability', element = 'medo', onEnd } = {}) {
  const dir = wallDir(world, f, q, max);
  let dist = 0;
  q.stun(max / speed + 0.4, 'stagger');
  world.audio.play('whip', { volume: 1, pitch: 0.4 });
  world.addTicker({
    update(dt) {
      if (q.state === 'ko') return true;
      const step = speed * dt;
      const ox = q.pos.x;
      const oz = q.pos.z;
      q.pos.x += dir.x * step;
      q.pos.z += dir.z * step;
      resolveBody(world.arena, q.pos, q.radius);
      q.vel.set(0, 0, 0);
      const moved = Math.hypot(q.pos.x - ox, q.pos.z - oz);
      dist += moved;
      if (Math.random() < 0.6) world.fx.burst(q.chestPos(new THREE.Vector3()), { count: 1, color: 0x6c6a66, kind: 'smoke', speed: 0.4, life: 0.35, size: 0.4 });
      const wall = moved < step * 0.35;
      if (!wall && dist < max) return false;
      applyHit(world, f, q, { damage: wall ? wallDamage : landDamage, kind, element, knockback: wall ? 3 : 2, hitstun: wall ? 0.8 : 0.5, dir: dir.clone().negate(), unblockable: true, ignoreInvuln: true, sound: wall ? 'heavyPunch' : 'impact', color: 0x6c6a66, scale: 1.2, guardCrush: kind === 'special' });
      if (wall) {
        world.cameraRig.shake(0.3, 0.3);
        world.fx.burst(q.chestPos(new THREE.Vector3()), { count: 18, color: 0x8a8478, speed: 3, life: 0.5, size: 0.12 });
        q.notify('JOGADO NA PAREDE', true);
      }
      onEnd && onEnd(wall);
      return true;
    },
  });
}

// o CABELO QUE BROTA DO CHÃO (fim do Cabelo rastejante)
function sprout(world, at) {
  for (let i = 0; i < 3; i++) {
    const base = at.clone().add(v1.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5)).setY(0.02);
    inkTentacle(world, base, base.clone().setY(2.2 + Math.random() * 0.5), { grow: 0.08, hold: 0.18, retract: 0.3, arc: 0.05, wiggle: 0.18, radius: 0.07, color: HAIR, emissive: HAIR_E, splash: 0x2a2626 });
  }
}

// um CAIXOTE (o Arremessar no modo de luta: o cabelo arranca um do chão)
function crate() {
  const g = new THREE.Group();
  const wood = new THREE.MeshToonMaterial({ color: 0x6a4a2a });
  const dark = new THREE.MeshToonMaterial({ color: 0x3a2814 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), wood);
  g.add(box);
  for (const s of [-1, 1]) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.12, 0.94), dark);
    slat.position.y = s * 0.3;
    g.add(slat);
  }
  return g;
}
function dropGroup(world, g) {
  if (!g || !g.parent) return;
  world.scene.remove(g);
  g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
}

// ------------------------------------------------------------------ AS FRESTAS DO ESPREITADOR
const frestasOf = (world, f) => {
  f.frestas = (f.frestas || []).filter((c) => c.group);
  return f.frestas;
};
const openFrestas = (world, f) => frestasOf(world, f).filter((c) => c.open);

function addFresta(world, f, x, z, face, { max = 3, temp = false } = {}) {
  const c = new Closet(world, f, { x, z, face }, 0);
  world.addNpc(c);
  world.fx.burst(new THREE.Vector3(x, 0.4, z), { count: 22, color: 0x2a2620, kind: 'smoke', speed: 1.8, up: 1, life: 0.6, size: 0.7, grow: 1 });
  world.audio.play('creak', { volume: 0.9, pitch: 0.9 });
  // brota do chão
  c.group.position.y = -2.6;
  let rise = 0;
  world.addTicker({
    update(dt) {
      if (!c.group) return true;
      if (rise < 1) { rise = Math.min(1, rise + dt * 4); c.group.position.y = -2.6 * (1 - rise) ** 2; }
      c.tick(dt, { occupied: c.occupied });
      return false;
    },
    dispose() { c.dispose(); },
  });
  if (!temp) {
    const list = frestasOf(world, f);
    list.push(c);
    while (list.length > max) removeFresta(world, list.shift());
  }
  return c;
}
function removeFresta(world, c) {
  if (!c || !c.group) return;
  world.fx.burst(new THREE.Vector3(c.base.x, 1, c.base.z), { count: 18, color: 0x2a2620, kind: 'smoke', speed: 1.6, life: 0.5, size: 0.6 });
  c.alive = false;
  c.dispose();
}
// um lugar livre para um armário perto de (x, z), de frente para `look`
function frestaSpot(world, x, z, look) {
  const s = findFreeSpotNear(world.arena, x, z, { radius: 0.95 });
  if (!s) return null;
  return { x: s.x, z: s.z, face: Math.atan2(look.x - s.x, look.z - s.z) };
}

// ------------------------------------------------------------------ OS TIPOS
Object.assign(ABILITY_TYPES, {
  // □ INVESTIDA DE CABELO (a do chefe): a linha marca o chão, a mira acompanha um pouco e trava; os fios disparam
  hairLash: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      const len = a.range ?? 10;
      const width = a.width ?? 0.75;
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('ai_charge', { restart: true, duration: a.windup + 0.35 });
      world.audio.play('whisper', { volume: 0.7, pitch: 1.5 });
      const mark = groundMesh(world, new THREE.PlaneGeometry(width * 2, len).translate(0, len / 2 + 0.6, 0), WARN);
      tl.each((time, dt) => {
        if (time >= a.windup) return;
        if (opp && time < a.windup * 0.6) f.yaw = turnTowards(f.yaw, yawTo(f.pos, opp.pos), dt * 6);
        mark.position.set(f.pos.x, 0.04, f.pos.z);
        mark.rotation.z = f.yaw + Math.PI;
        mark.material.opacity = 0.12 + 0.3 * (time / a.windup);
      });
      tl.add(a.windup, () => {
        dropMesh(world, mark);
        const dir = forwardFromYaw(f.yaw, new THREE.Vector3());
        const from = headOf(f);
        f.anim.play('ai_lash', { restart: true, duration: a.recovery + 0.15 });
        world.audio.play('whip', { volume: 1, pitch: 0.55 });
        for (let s = 0; s < 3; s++) {
          const end = f.pos.clone().addScaledVector(dir, len + 0.6).setY(0.7 + s * 0.25);
          end.x += dir.z * (s - 1) * 0.25;
          end.z -= dir.x * (s - 1) * 0.25;
          hair(world, from, end, { grow: 0.1, hold: 0.12, retract: 0.3, arc: 0.12, radius: 0.06, wiggle: 0.06 });
        }
        if (!canHit(opp)) return;
        const rx = opp.pos.x - f.pos.x;
        const rz = opp.pos.z - f.pos.z;
        const along = rx * dir.x + rz * dir.z;
        const side = Math.abs(rx * dir.z - rz * dir.x);
        if (along < 0 || along > len + 0.6 || side > width + opp.radius) return;
        applyHit(world, f, opp, { damage: a.damage, kind: a.kind || 'ranged', element: a.element, knockback: a.knockback ?? 7, hitstun: 0.5, dir, sound: 'clawHit', color: 0x2a2626, scale: 1.1 });
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: () => dropMesh(world, mark) });
    },
  },

  // △ + ○ AGARRAR E ESTRANGULAR (cânone): o cabelo agarra quem está à frente, puxa, estrangula e JOGA NA PAREDE
  hairGrab: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      const ropes = [];
      let caught = false;
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('ai_point', { restart: true, duration: a.windup + 0.3 });
      world.audio.play('whip', { volume: 0.7, pitch: 0.5 });
      tl.each((time, dt) => {
        if (!caught && time < a.windup && opp) f.yaw = turnTowards(f.yaw, yawTo(f.pos, opp.pos), dt * 5);
        if (!caught || opp.state === 'ko') return;
        // segurando: puxa a vítima para a frente dela (1,8 m)
        const fw = forwardFromYaw(f.yaw, v1);
        opp.pos.x += (f.pos.x + fw.x * 1.8 - opp.pos.x) * Math.min(1, dt * 5);
        opp.pos.z += (f.pos.z + fw.z * 1.8 - opp.pos.z) * Math.min(1, dt * 5);
        opp.vel.set(0, 0, 0);
      });
      tl.add(a.windup, () => {
        const fw = forwardFromYaw(f.yaw, new THREE.Vector3());
        const from = headOf(f);
        world.audio.play('whip', { volume: 0.9, pitch: 0.6 });
        const to = opp && new THREE.Vector3(opp.pos.x - f.pos.x, 0, opp.pos.z - f.pos.z);
        const inArc = to && to.length() <= a.range && Math.acos(Math.max(-1, Math.min(1, to.normalize().dot(fw)))) < (a.arc * Math.PI) / 360;
        if (!canHit(opp) || !inArc) {
          hair(world, from, from.clone().addScaledVector(fw, a.range * 0.85).setY(1.1), { grow: 0.14, hold: 0.1, retract: 0.25, arc: 0.3, radius: 0.07 });
          tl.length = a.windup + 0.4;
          return;
        }
        caught = true;
        opp.cancelAction && opp.cancelAction();
        opp.stun(a.hold + 1.2, 'stagger');
        opp.notify(a.caughtLabel || 'AGARRADO PELO CABELO', true);
        for (let i = 0; i < 2; i++) ropes.push(hair(world, from, () => opp.pos.clone().setY(opp.pos.y + 1.35 + i * 0.2), { grow: 0.12, hold: a.hold + 0.4, retract: 0.2, coil: true, radius: 0.065, arc: 0.3 }));
        world.audio.play('chainPull', { volume: 0.8, pitch: 0.5 });
        world.onHit && world.onHit(f, opp, 0, { kind: 'ability', ability: a.id });
      });
      // estrangula (ticks)
      for (let k = 1; k <= (a.ticks ?? 2); k++) {
        tl.add(a.windup + (a.hold * k) / ((a.ticks ?? 2) + 1), () => {
          if (!caught || opp.state === 'ko') return;
          applyHit(world, f, opp, { damage: a.tickDamage, kind: 'ability', ability: a.id, element: a.element, knockback: 0, hitstun: 0.05, unblockable: true, ignoreInvuln: true, reaction: false, sound: 'clawHit', color: 0x2a2626, scale: 0.7 });
        });
      }
      tl.add(a.windup + a.hold, () => {
        for (const r of ropes) r.release && r.release();
        if (!caught || opp.state === 'ko') return;
        f.anim.play('ai_lash', { restart: true, duration: 0.4 });
        flingToWall(world, f, opp, { max: a.throwDistance ?? 10, wallDamage: a.wallDamage, landDamage: a.landDamage, element: a.element });
      });
      tl.end(a.windup + a.hold + 0.35);
      return seqFrom(tl, { cancel: () => { for (const r of ropes) r.release && r.release(); } });
    },
  },

  // △ + □ CABELO RASTEJANTE: o fio corre pelo chão atrás do alvo (vira devagar) e brota debaixo dele
  hairCrawl: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('ai_point', { restart: true, duration: a.windup + 0.3 });
      world.audio.play('whisper', { volume: 0.8, pitch: 1.2 });
      tl.add(a.windup, () => {
        const at = new THREE.Vector3(f.pos.x, 0.06, f.pos.z);
        let dir = Math.atan2(opp.pos.x - at.x, opp.pos.z - at.z);
        const headPt = at.clone();
        const rope = hair(world, at.clone().setY(0.05), () => headPt, { grow: 0.05, hold: a.life, retract: 0.3, arc: 0.02, wiggle: 0.22, radius: 0.055 });
        const ring = groundMesh(world, new THREE.RingGeometry(0.35, 0.55, 20), WARN, 0.4);
        let t = 0;
        world.addTicker({
          update(dt) {
            t += dt;
            dir = turnTowards(dir, Math.atan2(opp.pos.x - headPt.x, opp.pos.z - headPt.z), dt * (a.turn ?? 2));
            headPt.x += Math.sin(dir) * a.speed * dt;
            headPt.z += Math.cos(dir) * a.speed * dt;
            const probe = headPt.clone();
            resolveBody(world.arena, probe, 0.2);
            const blocked = probe.distanceTo(headPt) > 0.05;
            headPt.x = probe.x;
            headPt.z = probe.z;
            ring.position.set(headPt.x, 0.05, headPt.z);
            ring.material.opacity = 0.3 + Math.sin(t * 20) * 0.15;
            if (Math.random() < dt * 30) world.fx.burst(headPt.clone().setY(0.1), { count: 1, color: HAIR, kind: 'smoke', speed: 0.3, life: 0.4, size: 0.3 });
            const near = canHit(opp) && distXZ(opp.pos, headPt) < (a.hitRadius ?? 0.85) + opp.radius;
            if (!near && t < a.life && !blocked && f.state !== 'ko') return false;
            rope.release && rope.release();
            sprout(world, headPt);
            world.audio.play('clawHit', { volume: 0.7, pitch: 0.6 });
            if (canHit(opp) && distXZ(opp.pos, headPt) < (a.hitRadius ?? 0.85) + opp.radius + 0.3) {
              applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: a.element, launch: true, knockback: 2, hitstun: 0.6, sound: 'clawHit', color: 0x2a2626, scale: 1.1 });
              opp.notify(a.caughtLabel || 'PRESO NOS CABELOS', true);
            }
            return true;
          },
          dispose: () => dropMesh(world, ring),
        });
      });
      tl.end(a.windup + 0.25);
      return seqFrom(tl);
    },
  },

  // △ + × CABELO POR CIMA: círculos no chão (um no alvo e outros em volta); os fios caem do alto
  hairRain: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('taunt_roar', { restart: true, duration: 0.6 });
      world.audio.play('whisper', { volume: 0.8, pitch: 0.7 });
      tl.add(0.25, () => {
        const spots = [opp.pos.clone()];
        while (spots.length < a.count) {
          const ang = Math.random() * Math.PI * 2;
          const r = 1.2 + Math.random() * (a.spread ?? 2.6);
          spots.push(new THREE.Vector3(opp.pos.x + Math.sin(ang) * r, 0, opp.pos.z + Math.cos(ang) * r));
        }
        spots.forEach((s, i) => {
          const at = s.clone().setY(0);
          resolveBody(world.arena, at, 0.3);
          const disc = groundMesh(world, new THREE.CircleGeometry(a.radius, 24), WARN, 0);
          disc.position.set(at.x, 0.045, at.z);
          let t = -i * 0.12;
          world.addTicker({
            update(dt) {
              t += dt;
              if (t < 0) return false;
              disc.material.opacity = 0.08 + 0.3 * Math.min(1, t / a.windup) + Math.sin(t * 30) * 0.04;
              if (t < a.windup) return false;
              for (let k = 0; k < 3; k++) {
                const top = at.clone().add(v1.set((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6)).setY(5.5);
                inkTentacle(world, top, top.clone().setY(0.05), { grow: 0.09, hold: 0.2, retract: 0.35, arc: 0.04, wiggle: 0.1, radius: 0.06, color: HAIR, emissive: HAIR_E, splash: false });
              }
              world.fx.burst(at.clone().setY(0.1), { count: 8, color: 0x6c6a66, kind: 'smoke', speed: 1, life: 0.4, size: 0.4 });
              world.audio.play('whip', { volume: 0.5, pitch: 0.8 + Math.random() * 0.3 });
              if (canHit(opp) && distXZ(opp.pos, at) <= a.radius + opp.radius * 0.5) applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: a.element, knockback: 2, hitstun: 0.45, sound: 'clawHit', color: 0x2a2626, scale: 1 });
              return true;
            },
            dispose: () => dropMesh(world, disc),
          });
        });
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },

  // △ + L2 DEFESA DE CABELO: os fios fecham na frente (quase não apanha, não recua) e no fim EMPURRAM em volta
  hairGuard: {
    start(f, a, world) {
      const tl = new Timeline();
      const label = a.label || a.name.toUpperCase();
      f.vel.set(0, 0, 0);
      const opp = f.opponent;
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('ai_charge', { restart: true, duration: a.time });
      world.audio.play('whisper', { volume: 0.7, pitch: 1.6 });
      const from = headOf(f);
      for (let i = 0; i < 6; i++) {
        const ang = f.yaw + (i / 5 - 0.5) * 2.2;
        hair(world, from, new THREE.Vector3(f.pos.x + Math.sin(ang) * 1.0, 0.3 + (i % 3) * 0.55, f.pos.z + Math.cos(ang) * 1.0), { grow: 0.1, hold: a.time - 0.1, retract: 0.2, arc: 0.5, wiggle: 0.15, radius: 0.08 });
      }
      f.armorHits = (f.armorHits || 0) + 99;
      f.addBuff({ type: 'hairGuard', name: label, time: a.time, duration: a.time, takenMult: a.takenMult, onEnd() { f.armorHits = Math.max(0, (f.armorHits || 0) - 99); } });
      f.notify(label, true);
      tl.add(a.time - 0.15, () => {
        world.fx.ring(new THREE.Vector3(f.pos.x, 0.08, f.pos.z), { color: 0x3a3838, radius: a.push, life: 0.35 });
        world.audio.play('whip', { volume: 0.9, pitch: 0.5 });
        if (canHit(opp) && distXZ(opp.pos, f.pos) <= a.push + opp.radius) applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: a.element, knockback: a.knockback ?? 9, hitstun: 0.45, sound: 'clawHit', color: 0x2a2626, scale: 1 });
      });
      tl.end(a.time);
      return seqFrom(tl);
    },
  },

  // R2 + △ GRITO RASGADO (cânone): rompe a vedação da boca — atordoa e ENSURDECE quem está perto. A fita em X se abre e
  // a boca de dentes aparece no grito (wiki: "rasgar o tecido preso em sua boca"); na Devoradora ela já fica aberta
  hairScream: {
    start(f, a, world) {
      const tl = new Timeline();
      const opp = f.opponent;
      f.vel.set(0, 0, 0);
      f.anim.play('taunt_roar', { restart: true, duration: a.windup + 0.6 });
      world.audio.play('fearGaze', { volume: 0.9, pitch: 0.4 });
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: WARN, radius: a.radius, life: a.windup });
      tl.each((time) => { if (f.rig.body) f.rig.body.position.x = time < a.windup ? Math.sin(time * 70) * 0.02 : 0; });
      tl.add(a.windup, () => {
        tearMouth(f, true);
        world.after(0.75, () => { if (!f.findBuff('awakened')) tearMouth(f, false); });
        world.audio.play('scare', { volume: 1.2, pitch: 1.4 });
        world.cameraRig.shake(0.4, 0.5);
        for (let i = 0; i < 3; i++) world.after(i * 0.08, () => world.fx.ring(f.chestPos(new THREE.Vector3()).setY(1.6), { color: 0xe0e8e0, radius: a.radius * (0.5 + i * 0.25), life: 0.45 }));
        if (!canHit(opp) || distXZ(opp.pos, f.pos) > a.radius + opp.radius) return;
        const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: a.element, knockback: 3, hitstun: 0.3, unblockable: true, reaction: false, sound: 'impact', color: WARN, scale: 1.2 });
        if (typeof res === 'number' && opp.state !== 'ko') {
          opp.stun(a.stun, 'stagger');
          deafFighter(world, opp, a.deaf ?? 4);
          opp.notify('ENSURDECIDO', true);
        }
      });
      tl.end(a.windup + 0.6);
      return seqFrom(tl, { cancel: () => { if (f.rig.body) f.rig.body.position.x = 0; } });
    },
  },

  // R2 + × ARREMESSAR: o cabelo arranca um caixote do chão, ergue sobre a cabeça, mira (a marca segue o alvo) e joga
  hairToss: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const tl = new Timeline();
      const box = crate();
      const side = Math.random() < 0.5 ? 1 : -1;
      const fw = forwardFromYaw(f.yaw, new THREE.Vector3());
      const from = new THREE.Vector3(f.pos.x + fw.z * side * 1.6 - fw.x * 0.6, -0.5, f.pos.z - fw.x * side * 1.6 - fw.z * 0.6);
      box.position.copy(from);
      world.scene.add(box);
      world.fx.play('FX_DUST', from.clone().setY(0), { scale: 0.8 });
      f.vel.set(0, 0, 0);
      f.anim.play('ai_point', { restart: true, duration: a.lift + a.aim });
      world.audio.play('whip', { volume: 0.8, pitch: 0.7 });
      const rope = hair(world, headOf(f), () => box.position.clone(), { grow: 0.15, hold: a.lift + a.aim + 0.1, retract: 0.2, coil: true, arc: 0.4, radius: 0.07 });
      const hold = () => v1.set(f.pos.x - Math.sin(f.yaw) * 0.4, 3.0, f.pos.z - Math.cos(f.yaw) * 0.4);
      let aimAt = null;
      let mark = null;
      let flying = false;
      tl.each((time, dt) => {
        if (flying) return;
        if (time < a.lift) {
          const k = time / a.lift;
          const e = 1 - (1 - k) * (1 - k);
          const h = hold();
          box.position.set(from.x + (h.x - from.x) * e, from.y + (h.y - from.y) * e, from.z + (h.z - from.z) * e);
          box.rotation.y += dt * 3;
          return;
        }
        f.yaw = turnTowards(f.yaw, yawTo(f.pos, opp.pos), dt * 6);
        if (!aimAt) { aimAt = opp.pos.clone(); mark = groundMesh(world, new THREE.RingGeometry(a.radius - 0.18, a.radius, 28), WARN, 0.3); }
        if (time < a.lift + a.aim - 0.15) aimAt.lerp(opp.pos, Math.min(1, dt * 10));
        mark.position.set(aimAt.x, 0.05, aimAt.z);
        mark.material.opacity = 0.3 + Math.sin(time * 30) * 0.12;
        const h = hold();
        box.position.set(h.x + Math.sin(time * 40) * 0.04, h.y, h.z);
      });
      tl.add(a.lift + a.aim, () => {
        flying = true;
        rope.release && rope.release();
        f.anim.play('ai_lash', { restart: true, duration: 0.45 });
        world.audio.play('whip', { volume: 1, pitch: 0.45 });
        const p0 = box.position.clone();
        const to = (aimAt || opp.pos).clone().setY(0);
        resolveBody(world.arena, to, 0.3);
        const m = mark;
        mark = null;
        let t = 0;
        world.addTicker({
          update(dt) {
            t += dt;
            const k = Math.min(1, t / a.flight);
            box.position.set(p0.x + (to.x - p0.x) * k, Math.max(0.45, p0.y + (0.45 - p0.y) * k + Math.sin(k * Math.PI) * 2.6), p0.z + (to.z - p0.z) * k);
            box.rotation.x += dt * 9;
            const hit = k > 0.6 && canHit(opp) && distXZ(opp.pos, box.position) < 0.9 + opp.radius;
            if (k < 1 && !hit) return false;
            world.cameraRig.shake(0.2, 0.25);
            world.audio.play('heavyPunch', { volume: 0.9, pitch: 0.8 });
            world.fx.burst(box.position.clone(), { count: 24, color: 0x6a4a2a, speed: 5, life: 0.6, size: 0.14, gravity: 8 });
            world.fx.burst(box.position.clone(), { count: 10, color: 0x8a7a60, kind: 'smoke', speed: 1.4, life: 0.5, size: 0.5 });
            if (canHit(opp) && distXZ(opp.pos, box.position) <= a.radius + opp.radius * 0.5) applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: a.element, knockback: 6, hitstun: 0.55, sound: 'heavyPunch', color: 0x8a6a40, scale: 1.2 });
            return true;
          },
          dispose: () => { dropMesh(world, m); dropGroup(world, box); },
        });
      });
      tl.end(a.lift + a.aim + 0.3);
      return seqFrom(tl, { cancel: () => { rope.release && rope.release(); if (!flying) { dropMesh(world, mark); dropGroup(world, box); } } });
    },
  },

  // △ + □ ABRIR FRESTA: um armário entreaberto brota do chão ao lado dele (até a.max; o mais velho some)
  openFresta: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('taunt_roar', { restart: true, duration: 0.5 });
      tl.add(0.25, () => {
        // de preferência para o lado (nem colado nele nem no caminho do adversário)
        const fw = forwardFromYaw(f.yaw, new THREE.Vector3());
        const side = Math.random() < 0.5 ? 1 : -1;
        const x = f.pos.x + fw.z * side * 2.4 - fw.x * 1.2;
        const z = f.pos.z - fw.x * side * 2.4 - fw.z * 1.2;
        const spot = frestaSpot(world, x, z, opp ? opp.pos : f.pos);
        if (!spot) { f.notify('SEM ESPAÇO PARA A FRESTA'); return; }
        addFresta(world, f, spot.x, spot.z, spot.face, { max: a.max ?? 3 });
        f.notify(`FRESTA ${openFrestas(world, f).length}/${a.max ?? 3}`, true);
      });
      tl.end(0.5);
      return seqFrom(tl);
    },
  },

  // △ + × CORRER PELAS FRESTAS: entra na fresta mais perto dele, os OLHOS acendem na fresta mais perto do alvo e ele sai
  // dela num BOTE. Sem fresta aberta: com as frestas TRANCADAS fica APAVORADO (a fraqueza); sem nenhuma, nada acontece
  frestaTravel: {
    start(f, a, world) {
      const opp = f.opponent;
      const all = frestasOf(world, f);
      const open = all.filter((c) => c.open);
      if (!opp) return null;
      if (!open.length) {
        if (!all.length) { f.notify('ABRA UMA FRESTA PRIMEIRO (△ + □)'); return null; }
        return terror(f, a, world);
      }
      const tl = new Timeline();
      const entry = open.slice().sort((x, y) => distXZ(x.pos, f.pos) - distXZ(y.pos, f.pos))[0];
      const pickExit = () => {
        const o = openFrestas(world, f);
        const pool = o.length > 1 ? o.filter((c) => c !== entry) : o;
        return pool.sort((x, y) => distXZ(x.pos, opp.pos) - distXZ(y.pos, opp.pos))[0];
      };
      let exit = null;
      let lunging = false;
      let hit = false;
      f.vel.set(0, 0, 0);
      f.anim.play('vanish', { restart: true, duration: 0.3 });
      world.audio.play('creak', { volume: 1, pitch: 0.8 });
      world.fx.burst(f.chestPos(new THREE.Vector3()), { count: 26, color: 0x2a2620, kind: 'smoke', speed: 2, life: 0.6, size: 0.6, grow: 1 });
      f.invuln = a.hide + 0.5;
      tl.add(0.22, () => {
        f.setVisible(false);
        f.pos.set(entry.base.x, 0, entry.base.z);
        entry.occupied = true;
        exit = pickExit();
        if (exit) exit.warn(a.hide);
        world.audio.play('fearGaze', { volume: 0.7, pitch: 1.5 });
      });
      tl.add(0.22 + a.hide, () => {
        entry.occupied = false;
        // trancaram a fresta de saída: escolhe outra (ou sai pela de entrada)
        if (!exit || !exit.open || !exit.group) exit = pickExit() || entry;
        f.pos.set(exit.pos.x, 0, exit.pos.z);
        resolveBody(world.arena, f.pos, f.radius);
        f.yaw = yawTo(f.pos, opp.pos);
        f.setVisible(true);
        f.invuln = 0.15;
        world.fx.burst(f.chestPos(new THREE.Vector3()), { count: 30, color: 0x2a2620, kind: 'smoke', speed: 2.4, life: 0.6, size: 0.6, grow: 1 });
        world.audio.play('closetSlam', { volume: 0.8, pitch: 1.3 });
        f.anim.play('db_dash', { restart: true, duration: a.lungeTime + 0.2 });
        lunging = true;
        if (!hasNoticed(opp)) opp.surprised = 0.35;
      });
      tl.each((time, dt) => {
        if (!lunging || time > 0.22 + a.hide + a.lungeTime) return;
        f.yaw = turnTowards(f.yaw, yawTo(f.pos, opp.pos), dt * 8);
        f.pos.x += Math.sin(f.yaw) * a.lungeSpeed * dt;
        f.pos.z += Math.cos(f.yaw) * a.lungeSpeed * dt;
        resolveBody(world.arena, f.pos, f.radius);
        if (!hit && canHit(opp) && distXZ(f.pos, opp.pos) - opp.radius < (a.reach ?? 1.9)) {
          hit = true;
          applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: a.element, knockback: 4.5, hitstun: 0.5, dir: forwardFromYaw(f.yaw, new THREE.Vector3()), sound: 'clawHit', color: FEAR, scale: 1.2 });
        }
      });
      tl.end(0.22 + a.hide + a.lungeTime + 0.2);
      return seqFrom(tl, {
        cancelable: () => tl.time > 0.22 + a.hide + 0.1,
        cancel: () => { entry.occupied = false; f.setVisible(true); },
        finish: () => f.setVisible(true),
      });
    },
  },

  // △ + L2 FORTALECER (cânone): segura a cabeça de um Devorado (as Cópias Observadas) e o deixa maior e mais forte;
  // sem Devorado em campo, as pupilas se multiplicam nele mesmo (o selfBuff de antes)
  fortifyDevorado: {
    start(f, a, world) {
      const n = world.npcs.filter((x) => x.isClone && x.owner === f && x.alive && !x.fortified && distXZ(x.pos, f.pos) < (a.reach ?? 7)).sort((x, y) => distXZ(x.pos, f.pos) - distXZ(y.pos, f.pos))[0];
      if (!n) return ABILITY_TYPES.selfBuff.start(f, a.self, world);
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      // vai até ele (rápido) e segura a cabeça
      const d0 = distXZ(f.pos, n.pos);
      f.yaw = yawTo(f.pos, n.pos);
      f.anim.play('run', { restart: true });
      const walk = Math.min(0.45, Math.max(0, (d0 - 1.3) / 12));
      tl.each((time, dt) => {
        if (time > walk || !n.alive) return;
        f.yaw = yawTo(f.pos, n.pos);
        const d = distXZ(f.pos, n.pos);
        if (d > 1.3) { f.pos.x += Math.sin(f.yaw) * Math.min(12 * dt, d - 1.3); f.pos.z += Math.cos(f.yaw) * Math.min(12 * dt, d - 1.3); resolveBody(world.arena, f.pos, f.radius); }
      });
      tl.add(walk, () => {
        f.anim.play('grab', { restart: true, duration: a.hold });
        world.audio.play('fearGaze', { volume: 0.6, pitch: 1.2 });
        if (n.alive) { n.attack = null; n.cd = a.hold + 0.3; }
      });
      tl.each((time) => {
        if (time < walk || !n.alive) return;
        n.yaw = yawTo(n.pos, f.pos);
        if (Math.random() < 0.2) world.fx.burst(v1.set(n.pos.x, 1.7, n.pos.z).clone(), { count: 2, color: FEAR, speed: 1.2, life: 0.4, size: 0.12, up: 1 });
      });
      tl.add(walk + a.hold, () => {
        if (!n.alive) return;
        n.fortified = true;
        n.hp = Math.round(n.hp * a.hpMult);
        n.maxHp = Math.round(n.maxHp * a.hpMult);
        n.o.damageMult = (n.o.damageMult ?? 0.5) * a.dmgMult;
        if (n.expire !== undefined && Number.isFinite(n.expire)) n.expire += a.extend ?? 4;
        if (n.rig && n.rig.root) n.rig.root.scale.multiplyScalar(1.12);
        world.fx.ring(new THREE.Vector3(n.pos.x, 0.05, n.pos.z), { color: FEAR, radius: 2, life: 0.5 });
        f.notify('DEVORADO FORTALECIDO', true);
      });
      tl.end(walk + a.hold + 0.15);
      return seqFrom(tl);
    },
  },
});

const hasNoticed = (opp) => !!(opp.def && (opp.def.passives || []).some((p) => p.type === 'precognition'));

// APAVORADO (a fraqueza do cânone): sem fresta para fugir, ele treme, chora e apanha mais por alguns segundos
function terror(f, a, world) {
  const T = a.terror || { time: 3, taken: 1.4 };
  const tl = new Timeline();
  f.vel.set(0, 0, 0);
  f.anim.play('fear', { restart: true, duration: 1.0 });
  world.audio.play('fearGaze', { volume: 1, pitch: 1.6 });
  f.addBuff({ type: 'frestaTerror', name: 'APAVORADO', time: T.time, duration: T.time, takenMult: T.taken });
  if (f.rig.props && f.rig.props.mouthEye) f.rig.showProp('mouthEye', true);
  world.after(T.time, () => { if (f.rig.props && f.rig.props.mouthEye) f.rig.showProp('mouthEye', false); });
  f.notify('SEM FRESTA — APAVORADO!', true);
  tl.each((time) => {
    if (f.rig.body) f.rig.body.position.x = time < 0.95 ? Math.sin(time * 60) * 0.025 : 0;
    if (Math.random() < 0.1) world.fx.burst(f.chestPos(new THREE.Vector3()).setY(f.pos.y + 1.6), { count: 2, color: 0x9ab0c0, speed: 0.6, life: 0.6, size: 0.06 });
  });
  tl.end(1.0);
  return seqFrom(tl, { cancel: () => { if (f.rig.body) f.rig.body.position.x = 0; } });
}

// ================================================================== OS ESPECIAIS
// DESFIGURAMENTO CAPILAR (Degolificada; o nome é do cânone, a cena é PROPOSTA): os fios agarram de longe, ERGUEM a vítima
// pelo pescoço e estrangulam, ESMAGAM no chão e a jogam na PAREDE. sp.shares: [estrangular (por tick), esmagar, parede]
export const hairStrangle = {
  canStart: (f, sp) => !!f.opponent && distXZ(f.pos, f.opponent.pos) < (sp.range ?? 11),
  start(f, sp, world) {
    const opp = f.opponent;
    const total = sp.damage ?? COMBAT.specialDamage;
    const [tickShare, slamShare, wallShare] = sp.shares || [0.08, 0.3, 0.46];
    const ticks = 3;
    const ropes = [];
    let t = 0;
    let phase = 'reach';
    let caught = false;
    let lift = 0;
    let tickN = 0;
    let done = false;
    let flingDone = false;
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('ai_point', { restart: true, duration: 0.5 });
    world.audio.play(sp.sound || 'specialStart');
    world.showBanner(sp.banner || sp.name, f.def.color);
    world.audio.play('whip', { volume: 1, pitch: 0.5 });
    const from = () => headOf(f);
    const release = () => { for (const r of ropes) r.release && r.release(); ropes.length = 0; };
    return {
      update(dt) {
        t += dt;
        f.invuln = Math.max(f.invuln, 0.15);
        if (phase === 'reach') {
          if (t < 0.3) return false;
          if (!canHit(opp) || distXZ(f.pos, opp.pos) > (sp.range ?? 11) + 1) {
            hair(world, from(), from().addScaledVector(forwardFromYaw(f.yaw, new THREE.Vector3()), 8).setY(1.1), { grow: 0.14, hold: 0.1, retract: 0.25, arc: 0.3, radius: 0.07 });
            f.notify('ESCAPOU DOS CABELOS');
            return true;
          }
          caught = true;
          opp.cancelAction && opp.cancelAction();
          opp.stun(4, 'stagger');
          opp.notify('ESTRANGULADO PELO CABELO', true);
          for (let i = 0; i < 4; i++) ropes.push(hair(world, from(), () => opp.pos.clone().setY(opp.pos.y + 1.35 + i * 0.12), { grow: 0.12, hold: 9, retract: 0.2, coil: i < 2, radius: 0.07, arc: 0.3 }));
          world.audio.play('chainPull', { volume: 0.9, pitch: 0.5 });
          world.cameraRig.shake(0.2, 0.2);
          phase = 'lift';
          t = 0;
          return false;
        }
        if (phase === 'lift') {
          // puxa para a frente dela e ERGUE pelo pescoço (estrangula 3 vezes)
          const fw = forwardFromYaw(f.yaw, v1);
          opp.pos.x += (f.pos.x + fw.x * 2 - opp.pos.x) * Math.min(1, dt * 6);
          opp.pos.z += (f.pos.z + fw.z * 2 - opp.pos.z) * Math.min(1, dt * 6);
          lift = Math.min(1, lift + dt * 2.2);
          opp.pos.y = 2.2 * lift;
          opp.vel.set(0, 0, 0);
          opp.stun(1, 'stagger');
          if (opp.rig.body) opp.rig.body.position.x = Math.sin(t * 50) * 0.03;
          if (tickN < ticks && t > 0.45 + tickN * 0.35) {
            tickN++;
            f.anim.play(tickN % 2 ? 'ai_lash' : 'ai_lash_l', { restart: true, duration: 0.3 });
            applyHit(world, f, opp, { damage: Math.round(total * tickShare), kind: 'special', knockback: 0, hitstun: 0.05, unblockable: true, ignoreInvuln: true, reaction: false, sound: 'clawHit', color: 0x2a2626, scale: 0.8 });
            if (tickN === 1) world.showCallout && world.showCallout('ESTRANGULA');
          }
          if (t < 0.45 + ticks * 0.35 + 0.15) return false;
          phase = 'slam';
          t = 0;
          f.anim.play('ai_down', { restart: true, duration: 0.5 });
          return false;
        }
        if (phase === 'slam') {
          lift = Math.max(0, lift - dt * 7);
          opp.pos.y = 2.2 * lift;
          if (lift > 0) return false;
          if (opp.rig.body) opp.rig.body.position.x = 0;
          applyHit(world, f, opp, { damage: Math.round(total * slamShare), kind: 'special', knockback: 0.5, hitstun: 0.6, unblockable: true, ignoreInvuln: true, sound: 'heavyPunch', color: 0x2a2626, scale: 1.8, hitstop: 0.1 });
          world.cameraRig.shake(0.5, 0.35);
          world.fx.play('FX_DUST', opp.pos, { scale: 1.2 });
          sprout(world, opp.pos.clone());
          phase = 'throw';
          t = 0;
          return false;
        }
        if (phase === 'throw') {
          if (t < 0.3) return false;
          if (!done) {
            done = true;
            release();
            f.anim.play('ai_lash', { restart: true, duration: 0.45 });
            if (opp.state === 'ko') return true;
            // o resto do dano (não acertou a parede: o chão leva menos, o que sobra fica nos cabelos)
            const wallD = Math.round(total - total * tickShare * ticks - Math.round(total * slamShare));
            flingToWall(world, f, opp, { max: 11, speed: 18, wallDamage: wallD, landDamage: Math.round(wallD * 0.8), kind: 'special', onEnd: () => { flingDone = true; } });
          }
          return flingDone || t > 1.6;
        }
        return true;
      },
      cancel() {
        release();
        if (caught && opp.state !== 'ko') { opp.pos.y = 0; if (opp.rig.body) opp.rig.body.position.x = 0; }
      },
    };
  },
};

// O OLHO DA BOCA (Espreitador; PROPOSTA a partir do cânone: as frestas e o olho grande dentro da boca): QUATRO armários
// brotam em volta do alvo, ele some numa fresta e sai de três delas em sequência (os olhos acendem antes de cada bote);
// no último ele agarra, abre a boca e o OLHO encara — drena a Sanidade. sp.shares: [cada bote, o olho]
export const frestaAmbush = {
  canStart: (f) => !!f.opponent,
  start(f, sp, world) {
    const opp = f.opponent;
    const total = sp.damage ?? COMBAT.specialDamage;
    const [lungeShare, eyeShare] = sp.shares || [0.18, 0.46];
    const closets = [];
    const order = [];
    let t = 0;
    let phase = 'sink';
    let k = 0;
    let lungeT = 0;
    let hitThis = false;
    f.vel.set(0, 0, 0);
    f.anim.play('vanish', { restart: true, duration: 0.35 });
    world.audio.play(sp.sound || 'specialStart');
    world.showBanner(sp.banner || sp.name, f.def.color);
    world.fx.burst(f.chestPos(new THREE.Vector3()), { count: 30, color: 0x2a2620, kind: 'smoke', speed: 2, life: 0.6, size: 0.7, grow: 1 });
    // o alvo fica paralisado de medo enquanto as frestas se abrem em volta (o cerco)
    opp.stun(1.4, 'fear');
    opp.notify('AS FRESTAS SE ABREM', true);
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + Math.random() * 0.4;
      const spot = frestaSpot(world, opp.pos.x + Math.sin(ang) * 3.3, opp.pos.z + Math.cos(ang) * 3.3, opp.pos);
      if (spot) closets.push(addFresta(world, f, spot.x, spot.z, spot.face, { temp: true }));
    }
    while (order.length < 3 && closets.length) order.push(closets[order.length % closets.length]);
    const cleanup = () => {
      for (const c of closets) removeFresta(world, c);
      closets.length = 0;
      if (f.rig.props && f.rig.props.mouthEye) f.rig.showProp('mouthEye', false);
      f.setVisible(true);
    };
    return {
      update(dt) {
        t += dt;
        f.invuln = Math.max(f.invuln, 0.15);
        if (phase === 'sink') {
          if (t < 0.3) return false;
          f.setVisible(false);
          if (!order.length) { cleanup(); return true; }
          phase = 'warn';
          t = 0;
          order[0].warn(0.45);
          world.audio.play('fearGaze', { volume: 0.8, pitch: 1.5 });
          return false;
        }
        if (phase === 'warn') {
          if (opp.state !== 'ko') opp.stun(0.6, 'fear');
          if (t < 0.45) return false;
          const c = order[k];
          f.pos.set(c.pos.x, 0, c.pos.z);
          f.yaw = yawTo(f.pos, opp.pos);
          f.setVisible(true);
          world.audio.play('closetSlam', { volume: 0.9, pitch: 1.2 + k * 0.1 });
          world.fx.burst(f.chestPos(new THREE.Vector3()), { count: 20, color: 0x2a2620, kind: 'smoke', speed: 2.4, life: 0.5, size: 0.6, grow: 1 });
          f.anim.play(k === order.length - 1 ? 'grab' : 'db_dash', { restart: true, duration: 0.45 });
          phase = 'lunge';
          lungeT = 0;
          hitThis = false;
          return false;
        }
        if (phase === 'lunge') {
          lungeT += dt;
          const d = distXZ(f.pos, opp.pos);
          f.yaw = yawTo(f.pos, opp.pos);
          if (d > 1.4) { f.pos.x += Math.sin(f.yaw) * Math.min(16 * dt, d - 1.4); f.pos.z += Math.cos(f.yaw) * Math.min(16 * dt, d - 1.4); }
          const last = k === order.length - 1;
          if (!hitThis && d < 1.9 && opp.state !== 'ko') {
            hitThis = true;
            if (!last) {
              applyHit(world, f, opp, { damage: Math.round(total * lungeShare), kind: 'special', knockback: 0.4, hitstun: 0.7, unblockable: true, ignoreInvuln: true, sound: 'clawHit', color: FEAR, scale: 1.4, dir: forwardFromYaw(f.yaw, new THREE.Vector3()) });
              world.cameraRig.shake(0.25, 0.2);
            }
          }
          if (lungeT < 0.4) return false;
          if (!last) {
            // de volta para dentro: some e a próxima fresta acende
            world.fx.burst(f.chestPos(new THREE.Vector3()), { count: 18, color: 0x2a2620, kind: 'smoke', speed: 2, life: 0.4, size: 0.6 });
            f.setVisible(false);
            k++;
            order[k].warn(0.4);
            world.audio.play('fearGaze', { volume: 0.7, pitch: 1.6 });
            phase = 'warn';
            t = 0.05;
            return false;
          }
          phase = 'eye';
          t = 0;
          // a boca se abre: o OLHO
          if (f.rig.props && f.rig.props.mouthEye) f.rig.showProp('mouthEye', true);
          f.anim.play('gaze', { restart: true, duration: 1.1 });
          world.audio.play('fearGaze', { volume: 1, pitch: 0.6 });
          return false;
        }
        if (phase === 'eye') {
          if (opp.state !== 'ko') opp.stun(0.5, 'fear');
          if (Math.random() < 0.5) world.fx.burst(headOf(f), { count: 2, color: FEAR, speed: 2, life: 0.4, size: 0.12 });
          if (t < 0.9) return false;
          const got = opp.drainEnergy ? opp.drainEnergy(sp.drain ?? 40) : 0;
          if (got > 0) f.addEnergy(got * 0.5);
          applyHit(world, f, opp, { damage: Math.round(total - Math.round(total * lungeShare) * (order.length - 1)), kind: 'special', knockback: 3, launch: true, hitstun: 1, unblockable: true, ignoreInvuln: true, sound: 'slashFinal', color: FEAR, scale: 2.2, hitstop: 0.12 });
          world.cameraRig.shake(0.55, 0.35);
          world.screenFlash && world.screenFlash('#3a3000', 0.15);
          opp.notify(got > 0 ? `O OLHO — SANIDADE −${Math.round(got)}` : 'O OLHO', true);
          cleanup();
          return true;
        }
        return true;
      },
      cancel: cleanup,
    };
  },
};

Object.assign(SPECIALS, { hairStrangle, frestaAmbush });
