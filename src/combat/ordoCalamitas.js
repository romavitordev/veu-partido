import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../core/util.js';
import { ABILITY_TYPES, applySelfBuff } from './abilities.js';
import { PASSIVES } from './passives.js';
import { applyHit } from './damage.js';

// ------------------------------------------------------------------ ORDO CALAMITAS (Calamidade, 67 d.C.)
// Pedido do dono (2026-11-20): "os personagens precisam estar fiéis, com mecânicas próprias, especiais próprios [...]
// não quero poderes padrão". Revisão completa em lore/ORDO-CALAMITAS-KITS.md.
//
// A regra do cânone que liga todos: os PONTOS DE EXISTÊNCIA dos jogos do Amphitruo (Calamidade ep. 6). Quem zera
// INEXISTE, e quase todas as fichas mexem nesses pontos (ceder, roubar, recuperar). No jogo, 1 PONTO = 10% DA VIDA
// MÁXIMA (a barra azul "EXISTÊNCIA" tem 10 marcas). Mover pontos não passa pela defesa nem pelos multiplicadores: é a
// existência, não um golpe. O valor (10%) e as adaptações para o 1×1 são PROPOSTA; a regra é cânone.

const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });
export const PONTO = 0.1;
export const pointHp = (f) => Math.round(f.maxHealth * PONTO);
/** pontos de existência que restam (o último ponto parcial conta como um ponto) */
export const pontos = (f) => (f && f.health > 0 ? Math.ceil(f.health / (f.maxHealth * PONTO) - 1e-6) : 0);
const handPos = (f) => (f.rig.sockets && f.rig.sockets.handR ? f.rig.sockets.handR.getWorldPosition(new THREE.Vector3()) : f.chestPos());
const helpersOf = (world, f) => (f.assists || []).some((a) => a && a.active) || (world.npcs || []).some((n) => n.alive && n.owner === f);
const inTeam = (f) => !!(f.assists && f.assists.length);

/** a esfera de existência viajando de um ponto a outro (Vector3 ou lutador) */
export function pointOrb(world, from, to, color = 0x4a9aff) {
  const a = from.isVector3 ? from : from.chestPos();
  const b = to.isVector3 ? to : to.chestPos();
  world.fx.tracer(a, b, { color, life: 0.35, width: 0.07 });
  world.fx.burst(a, { count: 14, color, speed: 2.2, life: 0.5, size: 0.16 });
  world.fx.burst(b, { count: 22, color: 0xe8f4ff, speed: 2.6, up: 1, life: 0.6, size: 0.14 });
  world.fx.ring(b, { color, radius: 1.1, life: 0.35, vertical: true, yaw: Math.random() * Math.PI });
}

/** tira n pontos de quem apanha. Sem `lethal`, nunca zera (fica com 1 de vida). */
export function takePoint(world, victim, n = 1, { lethal = false, color = 0x4a9aff, label } = {}) {
  if (!victim || victim.state === 'ko') return 0;
  let amt = pointHp(victim) * n;
  if (!lethal) amt = Math.min(amt, victim.health - 1);
  if (amt <= 0) return 0;
  const dealt = victim.takeDamage(amt);
  world.fx.burst(victim.chestPos(), { count: 20, color, speed: 3, life: 0.5, size: 0.14 });
  world.audio.play('drain', { volume: 0.6, pitch: 1.2 });
  if (label) victim.notify(label, true);
  return dealt;
}

/** devolve n pontos (a cura normal: SEM VINHO e a Ferida Aberta seguram) */
export function givePoint(world, f, n = 1) {
  if (!f || f.state === 'ko') return 0;
  const before = f.health;
  f.heal(pointHp(f) * n);
  return f.health - before;
}

/** paga n pontos da própria existência (precisa sobrar pelo menos 1) */
export function spendPoint(f, n = 1) {
  if (pontos(f) <= n) return false;
  f.health = Math.max(1, f.health - pointHp(f) * n);
  f.flash = 0.12;
  return true;
}

// os estados BONS que o Imperador manda o adversário "usar nele"
const isGoodBuff = (b) => b && b.time !== Infinity && b.duration !== Infinity && !b.debuff && !['awakened', 'killerIntent', 'conspiracyOffer', 'traitorMark'].includes(b.type)
  && ((b.mult && b.mult > 1) || (typeof b.takenMult === 'number' && b.takenMult < 1) || (b.speedMult && b.speedMult > 1) || (b.atkSpeed && b.atkSpeed > 1));

// os decretos das REGRAS DO IMPERADOR (cânone: Nero impõe regras aos convidados — sem vinho, formalidade)
const DECREES = [
  { id: 'semVinho', label: 'SEM VINHO', msg: 'SEM VINHO: NADA CURA', apply(opp, d) { opp.blockHealing(d); return { energyRegenMult: 0.5 }; } },
  { id: 'formalidade', label: 'FORMALIDADE', msg: 'FORMALIDADE: SEM CORRER, SEM ESQUIVA', apply: () => ({ speedMult: 0.72, noDodge: true, lockMsg: 'FORMALIDADE: SEM ESQUIVA' }) },
  { id: 'silencio', label: 'SILÊNCIO', msg: 'SILÊNCIO: SEM HABILIDADES', apply: () => ({ noAbilities: true, lockMsg: 'SILÊNCIO DO IMPERADOR' }) },
];

const noTarget = (f, opp, range) => {
  if (!opp || opp.state === 'ko') { f.notify('SEM ALVO'); return true; }
  if (range && distXZ(f.pos, opp.pos) > range) { f.notify('LONGE DEMAIS'); return true; }
  return false;
};

// o CÍRCULO do duelo (Marcellus): prende os dois lá dentro enquanto o estado `buffType` durar
export function duelCircle(world, f, opp, buffType, radius, color) {
  const c = new THREE.Vector3((f.pos.x + opp.pos.x) / 2, 0, (f.pos.z + opp.pos.z) / 2);
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.RingGeometry(radius - 0.14, radius, 72), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  g.add(ring);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 72), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.07, depthWrite: false }));
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.04;
  g.add(disc);
  g.position.copy(c);
  world.scene.add(g);
  let t = 0;
  world.addTicker({
    update(dt) {
      t += dt;
      ring.material.opacity = 0.55 + 0.25 * Math.sin(t * 4);
      if (!f.findBuff(buffType) || f.state === 'ko' || opp.state === 'ko') return true;
      for (const fi of [f, opp]) {
        const dx = fi.pos.x - c.x;
        const dz = fi.pos.z - c.z;
        const d = Math.hypot(dx, dz);
        const lim = radius - (fi.radius ?? 0.5);
        if (d > lim && d > 1e-4) {
          fi.pos.x = c.x + (dx / d) * lim;
          fi.pos.z = c.z + (dz / d) * lim;
          const vr = (fi.vel.x * dx + fi.vel.z * dz) / d;
          if (vr > 0) { fi.vel.x -= (vr * dx) / d; fi.vel.z -= (vr * dz) / d; }
          if (Math.random() < 0.15) world.fx.burst(new THREE.Vector3(fi.pos.x, 0.6, fi.pos.z), { count: 4, color, speed: 1.4, life: 0.3, size: 0.1 });
        }
      }
      return false;
    },
    dispose() { world.scene.remove(g); g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); },
  });
  return c;
}

Object.assign(ABILITY_TYPES, {
  // VERITUS — SACRIFÍCIO (ficha: cede um dos próprios pontos de existência a outra pessoa). Em equipe o ponto vai para a
  // equipe: as assistências voltam na hora e a Barra de Equipe enche. No 1×1 (adaptação, PROPOSTA) o ponto vira a
  // sanidade, a guarda e as esquivas cheias e um instante de força.
  ordoSacrifice: {
    start(f, a, world) {
      if (pontos(f) <= 1) { f.notify('SÓ RESTA UM PONTO DE EXISTÊNCIA'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play(a.anim || 'ver_command', { restart: true, duration: 0.6 });
      world.audio.play('ritual', { volume: 0.6, pitch: 1.25 });
      tl.add(0.3, () => {
        spendPoint(f, 1);
        pointOrb(world, f, f.chestPos().add(new THREE.Vector3(0, 2.4, 0)), a.color);
        world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: a.color, radius: 2.6, life: 0.6 });
        if (inTeam(f)) {
          for (const as of f.assists) if (as) as.cooldown = 0;
          f.addTeamGauge(a.teamGauge ?? 25);
          f.notify('SACRIFÍCIO: UM PONTO PARA A EQUIPE', true);
        } else {
          f.energy = Math.min(f.maxEnergy, f.energy + (a.energy ?? 50));
          f.guard = f.maxGuard;
          f.dodges = Math.max(f.dodges, a.refillDodges ?? 2);
          applySelfBuff(f, { name: 'Sacrifício', label: 'SACRIFÍCIO', buffType: 'ordoSacrifice', duration: a.duration ?? 6, damageMult: a.damageMult ?? 1.15, affects: ['melee', 'ranged', 'ability'], color: a.color }, world);
        }
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },

  // REMUS — TRAIÇOEIRO (ficha: gasta 1 ponto de existência seu para tirar 1 de outra pessoa). Não passa pela defesa;
  // com o último ponto do alvo, ele INEXISTE.
  existenceTheft: {
    start(f, a, world) {
      const opp = f.opponent;
      if (noTarget(f, opp, a.range)) return null;
      if (pontos(f) <= 1) { f.notify('SEM EXISTÊNCIA PARA GASTAR'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'point', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('fearGaze', { volume: 0.7, pitch: 1.3 });
      const glow = world.fx.emitter({ rate: 40, follow: () => handPos(f), particle: { color: a.color, speed: 0.6, spread: 0.2, life: 0.3, size: 0.12 } });
      tl.add(a.windup, () => {
        glow.stop();
        spendPoint(f, 1);
        pointOrb(world, f, opp, a.color);
        if (opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) > a.range + 1) { f.notify('ERROU', true); return; }
        takePoint(world, opp, a.points ?? 1, { lethal: true, color: a.color, label: 'TRAÍDO: −1 PONTO DE EXISTÊNCIA' });
        if (opp.state !== 'ko') opp.stun(a.stagger ?? 0.35, 'stagger');
        else f.notify('INEXISTIU', true);
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: () => glow.stop() });
    },
  },

  // NERO — IMPERADOR (ficha: ordena que quem tem uma habilidade que o favoreça a use nele). Os estados bons do
  // adversário passam para Nero; sem nenhum, o adversário AJOELHA e a sanidade dele vai para o imperador.
  imperialOrder: {
    start(f, a, world) {
      const opp = f.opponent;
      if (noTarget(f, opp, a.range)) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'point', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('ritual', { volume: 0.6, pitch: 0.8 });
      tl.add(a.windup, () => {
        world.fx.ring(f.chestPos(), { color: a.color, radius: 1.6, life: 0.4, vertical: true, yaw: f.yaw });
        world.fx.tracer(handPos(f), opp.chestPos(), { color: a.color, life: 0.25, width: 0.04 });
        if (opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) > a.range + 1) { f.notify('NINGUÉM OUVIU', true); return; }
        const goods = opp.buffs.filter(isGoodBuff);
        if (goods.length) {
          for (const b of goods) {
            opp.buffs.splice(opp.buffs.indexOf(b), 1);
            if (b.onEnd) b.onEnd();
            f.addBuff({ type: 'imperial_' + b.type, name: (b.name || 'ESTADO') + ' (DO IMPERADOR)', time: b.time, duration: b.duration ?? b.time, mult: b.mult, affects: b.affects, takenMult: b.takenMult, takenKinds: b.takenKinds, speedMult: b.speedMult, atkSpeed: b.atkSpeed });
            pointOrb(world, opp, f, a.color);
          }
          f.notify('O IMPERADOR TOMOU: ' + goods.map((b) => b.name || b.type).join(', ').toUpperCase(), true);
          opp.notify('USOU A HABILIDADE NO IMPERADOR', true);
        } else {
          opp.stun(a.kneel ?? 1.0, 'forced_kneel');
          const take = Math.min(opp.energy, a.drain ?? 30);
          opp.energy -= take;
          f.energy = Math.min(f.maxEnergy, f.energy + take);
          opp.notify('AJOELHE-SE DIANTE DO IMPERADOR', true);
          world.fx.ring(new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z), { color: a.color, radius: 1.8, life: 0.5 });
        }
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl);
    },
  },

  // NERO — CONSPIRADOR (ficha: se o alvo trair alguém, o alvo ganha +1 ponto). Ele OFERECE a conspiração: se o adversário
  // bater nele dentro da janela (a traição), ganha 1 ponto, mas fica MARCADO e Nero bate mais nele (passiva
  // `conspirador`); se ninguém trair, o ponto fica com Nero.
  conspiracy: {
    start(f, a, world) {
      const opp = f.opponent;
      if (noTarget(f, opp, a.range)) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'point', { restart: true, duration: 0.55 });
      world.audio.play('fearGaze', { volume: 0.5, pitch: 1.5 });
      tl.add(0.3, () => {
        const old = opp.findBuff('conspiracyOffer');
        if (old) { old.betrayed = true; old.time = 0; }
        const smoke = world.fx.emitter({ rate: 14, follow: () => opp.chestPos(), particle: { color: a.color, speed: 0.5, spread: 0.5, up: 0.8, life: 0.5, size: 0.14 } });
        const offer = {
          type: 'conspiracyOffer', name: 'CONSPIRAÇÃO', time: a.window, duration: a.window, owner: f, betrayed: false,
          onEnd() {
            smoke.stop();
            if (offer.betrayed || f.state === 'ko' || opp.state === 'ko') return;
            givePoint(world, f, 1);
            pointOrb(world, opp, f, a.color);
            f.notify('NINGUÉM TRAIU: +1 PONTO', true);
          },
        };
        opp.addBuff(offer);
        opp.notify('CONSPIRAÇÃO: TRAIR O IMPERADOR?', true);
        world.fx.tracer(handPos(f), opp.chestPos(), { color: a.color, life: 0.3, width: 0.03 });
      });
      tl.end(0.55);
      return seqFrom(tl);
    },
  },

  // NERO — REGRAS DO IMPERADOR: um decreto por vez, na ordem SEM VINHO → FORMALIDADE → SILÊNCIO
  emperorRules: {
    start(f, a, world) {
      const opp = f.opponent;
      if (noTarget(f, opp, a.range)) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'point', { restart: true, duration: 0.6 });
      world.audio.play('ritual', { volume: 0.6, pitch: 0.7 });
      tl.add(0.35, () => {
        if (opp.state === 'ko' || opp.isInvulnerable()) { f.notify('NINGUÉM OUVIU', true); return; }
        f.decreeIdx = ((f.decreeIdx ?? -1) + 1) % DECREES.length;
        const D = DECREES[f.decreeIdx];
        const old = opp.findBuff('decree');
        if (old) { old.time = 0; }
        opp.addBuff({ type: 'decree', name: D.label, time: a.duration, duration: a.duration, debuff: true, ...D.apply(opp, a.duration) });
        opp.notify(D.msg, true);
        f.notify('DECRETO: ' + D.label, true);
        world.fx.ring(new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z), { color: a.color, radius: 2.2, life: 0.6 });
        world.fx.burst(opp.chestPos().add(new THREE.Vector3(0, 0.9, 0)), { count: 18, color: a.color, speed: 1.4, life: 0.6, size: 0.12 });
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },

  // REMUS — CUBO DE METAL (cânone: a ideia dele de conter a Relíquia de Energia num cubo de metal). O cubo marca o lugar
  // do adversário; quem não sair a tempo fica preso dentro e o cubo implode.
  metalCube: {
    start(f, a, world) {
      const opp = f.opponent;
      if (noTarget(f, opp, a.range)) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('cast_up', { restart: true, duration: a.windup + 0.25 });
      world.audio.play('chainPull', { volume: 0.6, pitch: 0.7 });
      const at = new THREE.Vector3(opp.pos.x, 0, opp.pos.z);
      const mark = world.fx.emitter({ rate: 18, follow: () => at.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.6, 0.05, (Math.random() - 0.5) * 1.6)), particle: { color: a.color, speed: 0.2, up: 2, life: 0.4, size: 0.1 } });
      world.fx.ring(new THREE.Vector3(at.x, 0.06, at.z), { color: a.color, radius: 1.3, life: a.windup });
      tl.add(a.windup, () => {
        mark.stop();
        const caught = opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, at) <= (a.radius ?? 1.3);
        const g = new THREE.Group();
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.4, 1.7), new THREE.MeshStandardMaterial({ color: 0x8a9098, metalness: 0.8, roughness: 0.35, transparent: true, opacity: 0.5, depthWrite: false }));
        box.position.y = 1.2;
        g.add(box);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color: a.color }));
        edges.position.y = 1.2;
        g.add(edges);
        g.position.set(caught ? opp.pos.x : at.x, 0, caught ? opp.pos.z : at.z);
        world.scene.add(g);
        world.audio.play('blockHit', { volume: 0.9, pitch: 0.5 });
        if (caught) {
          opp.stun(a.hold + 0.2, 'fear');
          opp.vel.set(0, 0, 0);
          opp.notify('PRESO NO CUBO', true);
        }
        let t = 0;
        let boom = false;
        world.addTicker({
          update(dt) {
            t += dt;
            if (caught && opp.state !== 'ko') { opp.pos.x = g.position.x; opp.pos.z = g.position.z; opp.vel.set(0, 0, 0); }
            const life = caught ? a.hold : 0.35;
            if (t >= life && !boom) {
              boom = true;
              const c = new THREE.Vector3(g.position.x, 1.1, g.position.z);
              world.fx.flash(c, { color: a.color, size: 3, life: 0.2 });
              world.fx.burst(c, { count: 40, color: 0xc8ccd4, speed: 8, life: 0.5, size: 0.08, gravity: 8 });
              world.audio.play(caught ? 'explosion' : 'blockHit', { volume: 0.7, pitch: 1.4 });
              if (caught && opp.state !== 'ko') applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'energia', unblockable: true, ignoreInvuln: true, knockback: 2.5, launch: true, hitstun: 0.5, sound: 'heavyPunch', color: a.color, pos: c });
            }
            if (boom) {
              const k = Math.max(0, 1 - (t - life) / 0.18);
              g.scale.set(k, k, k);
              return k <= 0;
            }
            return false;
          },
          dispose() { world.scene.remove(g); box.geometry.dispose(); box.material.dispose(); edges.geometry.dispose(); edges.material.dispose(); },
        });
      });
      tl.end(a.windup + 0.25);
      return seqFrom(tl, { cancel: () => mark.stop() });
    },
  },

  // CORNELIUS — PAVIO CURTO (cânone: o pavio curto dele). Acende o pavio: aguenta firme e cada golpe que leva vira raiva
  // (passiva `deFerro` conta); no fim explode num giro de lança que cresce com a raiva.
  shortFuse: {
    start(f, a, world) {
      if (f.findBuff('shortFuse')) { f.notify('O PAVIO JÁ ESTÁ ACESO'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('taunt_roar', { restart: true, duration: 0.5 });
      world.audio.play('scream', { volume: 0.4, pitch: 0.6 });
      tl.add(0.25, () => {
        const sparks = world.fx.emitter({ rate: 30, follow: () => f.chestPos(), particle: { color: 0xff7a2a, speed: 1.4, up: 1.2, spread: 0.5, life: 0.35, size: 0.12 } });
        f.armorHits = (f.armorHits || 0) + (a.armor ?? 3);
        const fuse = {
          type: 'shortFuse', name: 'PAVIO CURTO', time: a.duration, duration: a.duration, rage: 0, takenMult: a.takenMult ?? 0.85, color: a.color,
          onEnd() {
            sparks.stop();
            f.armorHits = Math.max(0, (f.armorHits || 0) - (a.armor ?? 3));
            if (f.state === 'ko') return;
            const dmg = Math.round(a.base + Math.min(a.maxBonus ?? 120, fuse.rage * (a.ratio ?? 0.6)));
            if (f.canAct()) f.anim.play('blade_low_spin', { restart: true, duration: 0.5 });
            world.fx.ring(new THREE.Vector3(f.pos.x, 0.08, f.pos.z), { color: 0xff7a2a, radius: a.radius, life: 0.4 });
            world.fx.burst(f.chestPos(), { count: 40, color: 0xff7a2a, speed: 7, life: 0.45, size: 0.16 });
            world.cameraRig.shake(0.35, 0.2);
            world.audio.play('explosion', { volume: 0.6, pitch: 1.3 });
            f.notify(fuse.rage > 0 ? 'EXPLODIU!' : 'O PAVIO APAGOU', true);
            const opp = f.opponent;
            if (opp && opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, f.pos) <= a.radius + opp.radius) {
              applyHit(world, f, opp, { damage: dmg, kind: 'ability', knockback: 4.5, launch: true, hitstun: 0.6, sound: 'heavyPunch', color: 0xff7a2a, scale: 1.6 });
            }
          },
        };
        f.addBuff(fuse);
        f.notify('PAVIO CURTO', true);
      });
      tl.end(0.5);
      return seqFrom(tl);
    },
  },

  // KARISE — ESPIÃ (ficha: obriga alguém a revelar uma habilidade). A habilidade revelada fica presa por `seal` s.
  spyReveal: {
    start(f, a, world) {
      const opp = f.opponent;
      if (noTarget(f, opp, a.range)) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'point', { restart: true, duration: 0.55 });
      world.audio.play('fearGaze', { volume: 0.5, pitch: 1.8 });
      tl.add(0.3, () => {
        world.fx.tracer(handPos(f), opp.chestPos(), { color: a.color, life: 0.3, width: 0.03 });
        if (opp.state === 'ko' || opp.isInvulnerable()) { f.notify('ESCAPOU DA ESPIÃ', true); return; }
        const list = (opp.def.abilities || []).filter((x) => x && x.id);
        const ready = list.filter((x) => !(opp.cooldowns[x.id] > 0));
        const pool = ready.length ? ready : list;
        if (!pool.length) {
          opp.cooldowns.special = Math.max(opp.cooldowns.special || 0, a.seal);
          opp.notify('O ESPECIAL FOI REVELADO', true);
          return;
        }
        const x = pool[Math.floor(Math.random() * pool.length)];
        opp.cooldowns[x.id] = Math.max(opp.cooldowns[x.id] || 0, a.seal);
        if (opp.cooldownMax) opp.cooldownMax[x.id] = Math.max(opp.cooldownMax[x.id] || 0, a.seal);
        opp.addBuff({ type: 'spied', name: 'REVELADA: ' + x.name.toUpperCase(), time: a.seal, duration: a.seal, debuff: true });
        f.notify('ESPIÃ: ' + x.name.toUpperCase(), true);
        opp.notify(x.name.toUpperCase() + ' REVELADA', true);
        world.fx.burst(opp.chestPos().add(new THREE.Vector3(0, 0.8, 0)), { count: 16, color: a.color, speed: 1.2, life: 0.6, size: 0.1 });
      });
      tl.end(0.55);
      return seqFrom(tl);
    },
  },

  // MARCELLUS — DUELO (ficha: em combate com um adversário só, +5 de defesa e luta). O círculo prende os dois; lá dentro
  // ele leva menos e bate mais, e nada de fora o atinge (passiva `duelist`).
  duelRing: {
    start(f, a, world) {
      const opp = f.opponent;
      if (noTarget(f, opp, a.range)) return null;
      if (f.findBuff('duel') || f.findBuff('grandDuel')) { f.notify('O DUELO JÁ COMEÇOU'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'point', { restart: true, duration: 0.55 });
      world.audio.play('blade', { volume: 0.7, pitch: 1.3 });
      tl.add(0.3, () => {
        if (opp.state === 'ko') return;
        f.addBuff({ type: 'duel', name: 'DUELO', time: a.duration, duration: a.duration, foe: opp, takenMult: a.takenMult ?? 0.8, mult: a.damageMult ?? 1.2, affects: ['melee', 'ability'], color: a.color });
        duelCircle(world, f, opp, 'duel', a.radius ?? 5.5, a.color);
        f.notify('DUELO', true);
        opp.notify('DUELO: NINGUÉM SAI DO CÍRCULO', true);
      });
      tl.end(0.55);
      return seqFrom(tl);
    },
  },

  // CASCADIA — GANCHO DO KHOPESH (PROPOSTA a partir da arma): o gancho puxa a guarda e traz o alvo para perto; por
  // `noGuard` s ele não consegue defender.
  khopeshHook: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'slash_h_back', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('swing', { volume: 0.7, pitch: 0.8 });
      tl.each((t) => {
        if (t < a.windup && opp && distXZ(f.pos, opp.pos) > 2) { const F = forwardFromYaw(f.yaw); f.vel.x = F.x * (a.lunge ?? 6); f.vel.z = F.z * (a.lunge ?? 6); } else { f.vel.x = 0; f.vel.z = 0; }
      });
      tl.add(a.windup, () => {
        if (!opp || opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) - opp.radius > a.range) { f.notify('ERROU', true); return; }
        if (opp.isGuarding()) opp.guardBreak();
        applyHit(world, f, opp, { damage: a.damage, kind: 'ability', unblockable: true, knockback: 0, hitstun: 0.5, reaction: false, sound: 'blade', color: a.color });
        if (opp.state === 'ko') return;
        const F = forwardFromYaw(f.yaw);
        opp.pullTo(new THREE.Vector3(f.pos.x + F.x * 1.2, opp.pos.y, f.pos.z + F.z * 1.2), { time: 0.2, after: 0.4 });
        const old = opp.findBuff('hooked');
        if (old) old.time = a.noGuard;
        else opp.addBuff({ type: 'hooked', name: 'GUARDA PUXADA', time: a.noGuard, duration: a.noGuard, noGuard: true, lockMsg: 'GUARDA PUXADA', debuff: true });
        opp.notify('GUARDA PUXADA', true);
        world.fx.tracer(handPos(f), opp.chestPos(), { color: 0xd8c08a, life: 0.2, width: 0.04 });
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl);
    },
  },

  // MARIUS — MÃOS NUAS: o agarrão de rua; com o adversário no último ponto de existência, ele MATA com as próprias mãos
  // (e o Sanguinário devolve 1 ponto)
  bareHandsGrab: {
    start(f, a, world) {
      const opp = f.opponent;
      const exec = opp && opp.state !== 'ko' && pontos(opp) <= (a.executeAt ?? 1);
      const seq = ABILITY_TYPES.arenaGrab.start(f, exec ? { ...a, finalDamage: opp.maxHealth, label: 'MÃOS NUAS' } : a, world);
      if (exec) f.notify('MÃOS NUAS', true);
      return seq;
    },
  },

  // FAUSTUS — TIRAR CAPACETE (ficha: −5 de defesa, +1 dado social). Até o fim do round: sem o capacete ele recebe mais
  // dano, mas a sanidade volta bem mais rápido (o público, o lado social do gladiador)
  helmetOff: {
    start(f, a, world) {
      if (f.findBuff('helmetOff')) { f.notify('JÁ ESTÁ SEM CAPACETE'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play(a.anim || 'mask_lift', { restart: true, duration: 0.55 });
      world.audio.play('blockHit', { volume: 0.5, pitch: 1.3 });
      tl.add(0.3, () => {
        applySelfBuff(f, { name: 'Sem Capacete', label: 'SEM CAPACETE', buffType: 'helmetOff', duration: 999, takenMult: a.takenMult ?? 1.12, props: [['helmet', false]], color: a.color, trail: false }, world);
        const b = f.findBuff('helmetOff');
        if (b) b.energyRegenMult = a.regen ?? 1.8;
        f.energy = Math.min(f.maxEnergy, f.energy + (a.energy ?? 20));
      });
      tl.end(0.55);
      return seqFrom(tl);
    },
  },

  // FAUSTUS — ARRISCAR TUDO (ficha: dá o capacete a outro — +1 ponto para ele —, fica com −5 de defesa e recebe dano
  // DOBRADO). Em equipe o ponto vai para a equipe; no 1×1 (PROPOSTA) volta para ele mesmo. Por `duration` s bate mais.
  riskAll: {
    start(f, a, world) {
      if (f.findBuff('riskAll')) { f.notify('JÁ ARRISCOU TUDO'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('powerup', { restart: true, duration: 0.6 });
      world.audio.play('powerUp', { volume: 0.6, pitch: 1.2 });
      tl.add(0.3, () => {
        if (inTeam(f)) {
          for (const as of f.assists) if (as) as.cooldown = 0;
          f.addTeamGauge(a.teamGauge ?? 20);
          pointOrb(world, f, f.chestPos().add(new THREE.Vector3(0, 2.4, 0)), a.color);
          f.notify('O CAPACETE VAI PARA A EQUIPE', true);
        } else {
          givePoint(world, f, 1);
        }
        applySelfBuff(f, { name: 'Arriscar Tudo', label: 'ARRISCAR TUDO', buffType: 'riskAll', duration: a.duration ?? 6, takenMult: a.takenMult ?? 2, damageMult: a.damageMult ?? 1.4, affects: ['melee', 'ranged', 'ability'], props: [['helmet', false]], color: a.color }, world);
        world.fx.flash(f.chestPos(), { color: a.color, size: 2.2, life: 0.2 });
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },
});

Object.assign(PASSIVES, {
  // FAUSTUS — GLADIADOR (ficha: +1 dado contra um adversário só): sem assistência nem invocação do outro lado, bate mais
  gladiator: {
    damageMod({ victim, kind, passive, world }) {
      if (kind === 'status' || kind === 'burn') return 1;
      return helpersOf(world, victim) ? 1 : passive.mult ?? 1.12;
    },
  },
  // MARIUS — SANGUINÁRIO (ficha: matar uma entidade ou pessoa com as próprias mãos devolve 1 ponto de existência)
  sanguinario: {
    onHitDealt({ attacker, victim, kind, world }) {
      if (victim.state !== 'ko' || !['melee', 'ability', 'special'].includes(kind)) return;
      givePoint(world, attacker, 1);
      attacker.notify('SANGUINÁRIO: +1 PONTO', true);
    },
    onNpcKill({ attacker, world }) {
      givePoint(world, attacker, 1);
      attacker.notify('SANGUINÁRIO: +1 PONTO', true);
    },
  },
  // MARIUS — BONDADE (ficha: num 2 contra 2, +1 dado contra quem agride o aliado): com uma assistência dele em campo,
  // bate mais
  bondade: {
    damageMod({ attacker, kind, passive }) {
      if (kind === 'status' || kind === 'burn') return 1;
      return (attacker.assists || []).some((a) => a && a.active) ? passive.mult ?? 1.2 : 1;
    },
  },
  // MARIUS — CICATRIZES DO INCÊNDIO (o incêndio de que Veritus o salvou; PROPOSTA): não pega fogo (burn.js) e resiste a
  // fogo e a Energia
  fireScars: {
    damageTakenMod({ kind, element, passive }) {
      if (kind === 'burn' || element === 'fogo') return passive.fire ?? 0.6;
      if (element === 'energia') return passive.energia ?? 0.85;
      return 1;
    },
  },
  // CORNELIUS — DE FERRO (ficha: a maior defesa de todos). Também conta a raiva do Pavio Curto e o que a muralha do
  // especial absorve
  deFerro: {
    damageTakenMod({ kind, passive }) { return kind === 'status' || kind === 'burn' ? 1 : passive.mult ?? 0.85; },
    blockChipMod({ passive }) { return passive.chip ?? 0.5; },
    guardDamageMod({ passive }) { return passive.guard ?? 0.6; },
    knockbackTakenMod({ passive }) { return passive.knockback ?? 0.7; },
    onHitTaken({ victim, dealt, o }) {
      const raw = Math.max(dealt || 0, (o && o.damage) || 0);
      const fuse = victim.findBuff('shortFuse');
      if (fuse) fuse.rage += raw;
      const wall = victim.findBuff('ironWall');
      if (wall) wall.absorbed += raw;
    },
  },
  // CORNELIUS — FÚRIA (ficha: com 1 ponto de existência, ataca dois de uma vez). Com 1 ponto (ou na Fúria que o De Ferro
  // solta) cada golpe físico acerta DUAS vezes
  furia: {
    onMeleeHit({ attacker, victim, strike, dealt, world, passive }) {
      if (strike && strike.furiaEcho) return;
      if (!(pontos(attacker) <= (passive.points ?? 1) || attacker.findBuff('furia'))) return;
      const dmg = Math.round(((strike && strike.damage) || dealt || 0) * (passive.echo ?? 0.6));
      if (dmg <= 0) return;
      if (!attacker.furiaSaid) { attacker.furiaSaid = true; attacker.notify('FÚRIA', true); }
      world.after(0.1, () => {
        if (victim.state === 'ko' || attacker.state === 'ko') return;
        applyHit(world, attacker, victim, { damage: dmg, kind: 'melee', strike: { damage: dmg, noPassive: true, furiaEcho: true }, knockback: 0.6, hitstun: 0.25, sound: 'heavyPunch', color: passive.color ?? 0xff4a2a });
        world.fx.tracer(attacker.chestPos(), victim.chestPos(), { color: passive.color ?? 0xff4a2a, life: 0.12, width: 0.04 });
      });
    },
  },
  // KARISE — IMPERCEPTÍVEL (ficha: escolhe alguém e fica imune às habilidades especiais dele). O escolhido é o adversário:
  // as habilidades e o especial dele doem bem menos nela, e o que prende/atordoa quase não a segura (Fighter.stun)
  imperceptible: {
    damageTakenMod({ attacker, victim, kind, passive }) {
      if (attacker !== victim.opponent) return 1;
      return kind === 'ability' ? passive.mult ?? 0.6 : kind === 'special' ? passive.special ?? 0.8 : 1;
    },
  },
  // CASCADIA — SEM PACIÊNCIA (cânone: sem paciência com a Celestine): bate mais forte nela (e nas formas dela)
  noPatience: {
    damageMod({ victim, passive }) {
      const id = victim.def && (victim.def.baseId || victim.def.id);
      return (passive.vs || []).includes(id) ? passive.mult ?? 1.2 : 1;
    },
  },
  // MARCELLUS — DUELO: dentro do círculo nada de fora o atinge (só o adversário do duelo)
  duelist: {
    damageTakenMod({ attacker, victim }) {
      const d = victim.findBuff('duel') || victim.findBuff('grandDuel');
      return d && d.foe && attacker !== d.foe ? 0 : 1;
    },
  },
  // NERO — CONSPIRADOR (ficha: se o alvo trair alguém, o alvo ganha +1 ponto): quem aceita a conspiração e bate nele
  // ganha o ponto, mas fica MARCADO — Nero bate `mult` vezes mais forte em quem o traiu
  conspirador: {
    onHitTaken({ attacker, victim, dealt, world, passive }) {
      const offer = attacker && attacker.findBuff && attacker.findBuff('conspiracyOffer');
      if (!offer || offer.owner !== victim || offer.betrayed || !(dealt > 0)) return;
      offer.betrayed = true;
      offer.time = 0;
      givePoint(world, attacker, 1);
      pointOrb(world, victim, attacker, passive.color ?? 0xffd27a);
      const m = attacker.findBuff('traitorMark');
      if (m) m.time = passive.mark ?? 12;
      else attacker.addBuff({ type: 'traitorMark', name: 'TRAIDOR', time: passive.mark ?? 12, duration: passive.mark ?? 12, owner: victim, debuff: true });
      attacker.notify('TRAIU: +1 PONTO, MAS MARCADO', true);
      victim.notify('TRAIDOR!', true);
    },
    damageMod({ attacker, victim, passive }) {
      const m = victim.findBuff && victim.findBuff('traitorMark');
      return m && m.owner === attacker ? passive.mult ?? 1.4 : 1;
    },
  },
  // SACRIFÍCIO DO RANCOR — ANIQUILA A DÍADE (o Estigma do Rancor: "Liberta tua cólera primordial e aniquila a díade";
  // a condição é matar duas pessoas no mesmo dia, e a recompensa é mais dano e mais destruição da ira). Cada inimigo
  // (ou entidade) que ele derruba na partida soma dano, até 2: a díade.
  dyad: {
    onHitDealt({ attacker, victim, world, passive }) {
      if (victim.state !== 'ko') return;
      dyadStack(world, attacker, passive);
    },
    onNpcKill({ attacker, world, passive }) { dyadStack(world, attacker, passive); },
    damageMod({ attacker, kind, passive }) {
      if (kind === 'status' || kind === 'burn') return 1;
      return 1 + (passive.per ?? 0.12) * Math.min(passive.max ?? 2, attacker.dyadKills || 0);
    },
  },
});

function dyadStack(world, f, passive) {
  const max = passive.max ?? 2;
  if ((f.dyadKills || 0) >= max) return;
  f.dyadKills = (f.dyadKills || 0) + 1;
  world.fx.flash(f.chestPos(), { color: 0xff2a1a, size: 2.4, life: 0.25 });
  f.notify(f.dyadKills >= max ? 'A DÍADE FOI ANIQUILADA' : 'O RANCOR CRESCE (1/2)', true);
}
