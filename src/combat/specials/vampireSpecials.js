import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { SETTINGS } from '../../config/settings.js';
import { applyHit } from '../damage.js';
import { findFreeSpotNear } from '../positioning.js';
import { splitDamage, specialHitFx, trySpecialBlock } from './common.js';
import { faceClose, lowAngle, orbit, twoShot, impactClose, pullBack } from '../../camera/shots.js';

// ESPECIAIS PRÓPRIOS DOS VAMPIROS (pedido do dono, 2026-11-19: "alguns personagens estão sem especial próprio, como a
// alvira"). Antes os três eram o `cinematicCombo` genérico (avança e dá a sequência de golpes). Agora cada um é a cena
// do cânone de Hexatombe (as cenas em si são PROPOSTA):
//   bellAbsolution (ALVIRA, Absolvição): o SINO toca três vezes; as CORDAS DE SANGUE (a Titereira) erguem o alvo no ar
//     como uma marionete; as HASTES DE METAL (as do Damir) o atravessam de todos os lados; puxado até ela, ela BEBE; no
//     último toque do sino as cordas se soltam e a Cruz de Sangue crava.
//   silentFilm (VELISAR, O Beijo Sangrento): o ator do cinema mudo — a tela vira FILME MUDO (sépia, chuvisco, riscos,
//     o projetor batendo) com as CARTELAS de texto; o Olhar da Curiosidade Mórbida põe o alvo em transe, ele ataca em
//     CORTES SECOS (some e aparece de outro lado, como quadros faltando), morde, a cor volta com o sangue e ele faz a
//     reverência para a plateia (aplausos).
//   specimenHunt (ZÉFERO, Espécime): a CORRENTE do grilhão estica até arrebentar; solto, ele dá três BOTES de lados
//     diferentes, prende o alvo NO CHÃO, rasga num frenesi e DEVORA (cura), e ruge.
// Os três avisam antes (telegraph): acertam de longe sem projétil.

const RANGE = 9;
const canReach = (f, sp) => {
  const opp = f.opponent;
  return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? RANGE);
};
const jointPos = (fi, name) => {
  const n = (fi.rig.sockets && fi.rig.sockets[name]) || fi.rig.joints[name];
  return n ? n.getWorldPosition(new THREE.Vector3()) : fi.chestPos();
};
const hit = (world, f, opp, damage, o = {}) => applyHit(world, f, opp, { damage, kind: 'special', reaction: false, ignoreInvuln: true, sound: o.sound || 'bladeHit', color: o.color, scale: o.scale ?? 1.2, element: o.element });
const heal = (world, f, dealt, ratio) => {
  if (!(typeof dealt === 'number' && dealt > 0)) return;
  f.health = Math.min(f.maxHealth, f.health + Math.round(dealt * ratio));
  world.fx.burst(f.chestPos(), { count: 12, color: 0xff3040, speed: 1.2, up: 1.4, life: 0.5, size: 0.12 });
};
const gore = (world, opp, color) => {
  const neck = jointPos(opp, 'hd');
  world.fx.burst(neck, { count: 44, color, speed: 5, life: 0.6, size: 0.16, gravity: 9 });
  world.fx.burst(neck, { count: 10, color: 0x2a0408, kind: 'smoke', speed: 1.2, life: 0.7, size: 0.5, grow: 1 });
  world.audio.play('drain', { volume: 0.7, pitch: 0.6 });
  world.cameraRig.shake(0.3, 0.15);
};
// um lugar livre a `r` metros do alvo, no ângulo `a` (relativo ao lado de quem ataca)
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

// ====================================================================================== ALVIRA — ABSOLVIÇÃO
export const bellAbsolution = {
  telegraph: () => ({ time: 0.6, anim: 'cast_up', animDuration: 0.6, mark: 'sigil' }),
  canStart: (f, sp) => canReach(f, sp),
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const color = sp.color ?? 0xa01018;
    const gold = sp.bellColor ?? 0xe0b040;
    const rods = sp.rods ?? 6;
    // partes: puxão das cordas, as hastes (uma cada), a bebida, a cruz
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, [0.1, ...Array(rods).fill(0.05), 0.2, 0.4]);
    const tl = new Timeline();
    const cords = [];
    const stuck = [];
    const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.1, 5).rotateX(Math.PI / 2);
    const rodMat = new THREE.MeshToonMaterial({ color: 0x8a8c94, emissive: 0x200404, emissiveIntensity: 0.4 });
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.yaw = yawTo(opp.pos, f.pos);
    f.anim.play('cast_up', { restart: true, duration: 0.8 });
    opp.anim.play('fear', { restart: true });
    world.cameraRig.playShots([
      lowAngle(f, { dur: 1.1, dist: 2.8, side: 1.2 }),
      orbit(opp, { dur: 1.6, radius: 4.2, height: 2.0, a0: -0.9, a1: 0.5, lookH: 1.8, fov: 46 }),
      twoShot(f, opp, { dur: 1.0, dist: 3.4, height: 1.6, side: -1 }),
      impactClose(f, opp, { dur: 1.0 }),
    ]);
    const toll = (vol) => {
      world.audio.play('bellToll', { volume: vol });
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: gold, radius: 7, life: 0.9 });
      world.fx.ring(f.chestPos(), { color: gold, radius: 2.6, life: 0.5, vertical: true, yaw: f.yaw });
      world.fx.distort(f.chestPos(), { color: gold, radius: 2.4, life: 0.5 });
      world.cameraRig.shake(0.25, 0.25);
    };
    toll(1);
    tl.add(0.25, () => world.specialBanner(f, sp, sp.name));
    // as cordas: das mãos dela aos pulsos e à cabeça do alvo, e do alto (o teto da igreja) aos pulsos
    tl.add(0.6, () => {
      f.anim.play('point', { restart: true, duration: 0.6 });
      world.audio.play('chainPull', { volume: 0.7, pitch: 0.8 });
      const node = (fi, j) => () => (fi.state === 'ko' ? null : jointPos(fi, j));
      for (const [a, b] of [['handR', 'handR'], ['handL', 'handL'], ['handR', 'hd']]) {
        cords.push(world.fx.chain(node(f, a), node(opp, b), { rope: true, thick: 0.018, color, glow: 0xff2030, sag: 0.1, links: 18 }));
      }
      const top = (dx) => () => new THREE.Vector3(opp.pos.x + dx, 7.5, opp.pos.z);
      cords.push(world.fx.chain(top(0.6), node(opp, 'handR'), { rope: true, thick: 0.016, color, glow: 0xff2030, sag: 0, links: 20 }));
      cords.push(world.fx.chain(top(-0.6), node(opp, 'handL'), { rope: true, thick: 0.016, color, glow: 0xff2030, sag: 0, links: 20 }));
    });
    // o alvo sobe e balança como marionete
    tl.each((time) => {
      if (opp.state === 'ko' || !opp.rig.body) return;
      if (time < 0.8) return;
      if (time < 3.2) {
        const up = Math.min(1, (time - 0.8) / 0.5) * 0.9;
        opp.rig.body.position.y = up + Math.sin(time * 9) * 0.04;
        opp.rig.body.rotation.z = Math.sin(time * 5.3) * 0.12;
      } else {
        opp.rig.body.position.y = Math.max(0, opp.rig.body.position.y - 0.08);
        opp.rig.body.rotation.z = 0;
      }
    });
    tl.add(1.1, () => {
      toll(0.9);
      hit(world, f, opp, parts[0], { color, sound: 'chainPull' });
      if (opp.state !== 'ko') opp.anim.play('stagger', { restart: true });
      world.fx.burst(jointPos(opp, 'handR'), { count: 16, color, speed: 3, life: 0.5, size: 0.12, gravity: 6 });
    });
    // as hastes de metal: de um círculo em volta, atravessam e ficam cravadas
    for (let i = 0; i < rods; i++) {
      tl.add(1.5 + i * 0.13, () => {
        if (opp.state === 'ko') return;
        if (i % 2 === 0) f.anim.play(i % 4 === 0 ? 'throw_r' : 'throw_l', { restart: true, duration: 0.3 });
        const a = (i / rods) * Math.PI * 2 + 0.4;
        const c = opp.chestPos();
        const from = c.clone().add(new THREE.Vector3(Math.cos(a) * 4.5, 0.6 + (i % 3) * 0.5, Math.sin(a) * 4.5));
        world.fx.tracer(from, c, { color: 0xc0c4cc, life: 0.12, width: 0.03 });
        world.audio.play('knifeThrow', { volume: 0.6, pitch: 1.1 + i * 0.03 });
        const dealt = hit(world, f, opp, parts[1 + i], { color, sound: 'bladeHit', scale: 0.9 });
        void dealt;
        const dir = c.clone().sub(from).normalize();
        const m = new THREE.Mesh(rodGeo, rodMat);
        m.position.copy(c).addScaledVector(dir, 0.1);
        m.lookAt(m.position.clone().add(dir));
        world.scene.add(m);
        stuck.push({ m, off: m.position.clone().sub(c) });
        world.fx.burst(c, { count: 14, color, speed: 4, life: 0.5, size: 0.12, gravity: 8 });
        if (opp.state !== 'ko') opp.anim.play('hit', { restart: true, blend: 0.02 });
      });
    }
    tl.each(() => { const c = opp.chestPos(); for (const s of stuck) s.m.position.copy(c).add(s.off); });
    // puxado pelas cordas até ela, que bebe
    let pullFrom = null;
    tl.add(2.5, () => { pullFrom = opp.pos.clone(); world.audio.play('chainPull', { volume: 0.8 }); });
    tl.each((time) => {
      if (!pullFrom || time > 2.9 || opp.state === 'ko') return;
      const k = Math.min(1, (time - 2.5) / 0.35);
      const F = forwardFromYaw(f.yaw);
      const to = new THREE.Vector3(f.pos.x + F.x * 1.05, opp.pos.y, f.pos.z + F.z * 1.05);
      opp.pos.lerpVectors(pullFrom, to, k * k);
    });
    tl.add(2.9, () => {
      f.anim.play('raziel_feast', { restart: true, duration: 0.7 });
      if (opp.state !== 'ko') opp.anim.play('stun', { restart: true });
      const dealt = hit(world, f, opp, parts[1 + rods], { color, sound: 'clawHit' });
      heal(world, f, dealt, sp.drain ?? 1.5);
      gore(world, opp, color);
      world.fx.tracer(opp.chestPos(), jointPos(f, 'hd'), { color, life: 0.4, width: 0.05 });
      opp.notify && opp.notify('...VOCÊ VAI ALCANÇAR A SUA LIBERDADE.', true);
    });
    // o último toque: as cordas soltam e a cruz crava
    tl.add(3.6, () => {
      toll(1.2);
      for (const c of cords) c.stop();
      cords.length = 0;
      f.anim.play('hammer_finisher', { restart: true, duration: 0.7 });
    });
    tl.add(3.85, () => {
      hit(world, f, opp, parts[parts.length - 1], { color, sound: 'slashFinal', scale: 2.2 });
      specialHitFx(world, f, opp, { kind: 'stab', big: true }, color);
      world.fx.play('FX_GROUND_SMASH', opp.pos, { scale: 1.2 });
      world.screenFlash && world.screenFlash('#3a0008', 0.2);
      if (opp.state !== 'ko') { opp.anim.play('launched', { restart: true }); opp.applyBleed && opp.applyBleed({ dps: 3, duration: 3 }, f); }
    });
    tl.end(4.5);
    const clear = () => {
      for (const c of cords) c.stop();
      for (const s of stuck) world.scene.remove(s.m);
      stuck.length = 0;
      rodGeo.dispose();
      rodMat.dispose();
      if (opp.rig.body) { opp.rig.body.position.y = 0; opp.rig.body.rotation.z = 0; }
    };
    return {
      update(dt) {
        const done = tl.update(dt);
        if (done) { clear(); finish(world, f, opp, { knockback: 5 }); }
        return done;
      },
      cancel() { clear(); world.endCinematic(); },
    };
  },
};

// ====================================================================================== VELISAR — O BEIJO SANGRENTO
// A tela de filme mudo: um véu por cima do jogo (backdrop-filter sépia), com riscos, chuvisco e o tremor da luz do
// projetor; e as CARTELAS (fundo preto, moldura dupla, letra de cinema antigo). Só existe com a interface (no teste sem
// tela, a cena roda igual, sem o véu).
function silentScreen(world) {
  if (typeof document === 'undefined' || !world.ui) return null;
  const root = document.createElement('div');
  root.className = 'silent-film';
  root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:40;transition:opacity .25s;opacity:0;' +
    'backdrop-filter:grayscale(1) sepia(.7) contrast(1.3) brightness(1.18);-webkit-backdrop-filter:grayscale(1) sepia(.7) contrast(1.3) brightness(1.18);';
  const iris = document.createElement('div');
  iris.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 58%, rgba(10,6,2,.7) 100%);';
  const scratch = document.createElement('div');
  scratch.style.cssText = 'position:absolute;inset:0;opacity:.5;';
  const grain = document.createElement('canvas');
  grain.width = 320; grain.height = 180;
  grain.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:.07;mix-blend-mode:soft-light;image-rendering:pixelated;';
  const card = document.createElement('div');
  card.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#080604;';
  const box = document.createElement('div');
  box.style.cssText = 'max-width:70%;padding:4vh 6vw;border:3px double #e8dcc0;outline:1px solid #e8dcc0;outline-offset:8px;' +
    'color:#efe3c6;font:italic 600 clamp(20px,3.6vw,46px)/1.3 Georgia,"Times New Roman",serif;text-align:center;letter-spacing:.02em;';
  card.appendChild(box);
  root.append(iris, scratch, grain, card);
  document.body.appendChild(root);
  const g = grain.getContext('2d');
  const img = g.createImageData(grain.width, grain.height);
  let t = 0;
  return {
    on() { root.style.opacity = '1'; },
    off() { root.style.opacity = '0'; },
    card(text) { if (text) { box.textContent = text; card.style.display = 'flex'; } else card.style.display = 'none'; },
    tick(dt) {
      t += dt;
      if (t < 0.05) return;
      t = 0;
      const calm = SETTINGS.reduceFx;
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0);
      const lines = [];
      for (let i = 0; i < 3; i++) if (Math.random() < 0.5) lines.push(`linear-gradient(90deg, transparent ${(Math.random() * 100).toFixed(1)}%, rgba(255,250,235,.55) 0, transparent ${(Math.random() * 0.15 + 0.1).toFixed(2)}%)`);
      scratch.style.background = lines.join(',') || 'none';
      if (!calm) iris.style.opacity = String(0.85 + Math.random() * 0.15);
    },
    remove() { root.remove(); },
  };
}

export const silentFilm = {
  telegraph: () => ({ time: 0.6, anim: 'gaze', animDuration: 0.6, mark: 'sigil' }),
  canStart: (f, sp) => canReach(f, sp),
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const color = sp.color ?? 0xa01018;
    const cuts = sp.cuts ?? 4;
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, [0.08, ...Array(cuts).fill(0.09), 0.24, 0.32]);
    const film = silentScreen(world);
    const tl = new Timeline();
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.yaw = yawTo(opp.pos, f.pos);
    f.anim.play('gaze', { restart: true, duration: 1.4 });
    opp.anim.play('idle', { restart: true });
    film && film.on();
    world.audio.play('fearGaze', { volume: 0.6, pitch: 0.7 });
    world.cameraRig.playShots([
      faceClose(f, { dur: 1.7, from: 2.4, to: 1.5, side: -0.25, height: 1.95, fov: 34 }),
      faceClose(opp, { dur: 0.6, from: 1.9, to: 1.6, side: 0.3, height: 1.55 }),
      orbit(opp, { dur: 1.4, radius: 4.6, height: 2.2, a0: -1.2, a1: 1.0, lookH: 1.2, fov: 44 }),
      twoShot(f, opp, { dur: 1.0, dist: 2.8, height: 1.7, side: 1, fov: 36 }),
      pullBack(f, opp, { dur: 1.2, from: 2.6, to: 6, height: 2.0, side: -1 }),
    ]);
    // o projetor: o bater do rolo de filme o tempo todo
    let proj = 0;
    tl.each((time, dt) => {
      if (film) film.tick(dt);
      proj += dt;
      if (proj >= 0.09 && time < 4.3) { proj = 0; world.audio.play('tick', { volume: 0.12, pitch: 0.55 + Math.random() * 0.1 }); }
    });
    tl.add(0.2, () => world.specialBanner(f, { ...sp, banner: null }, sp.name));
    tl.add(0.45, () => film && film.card(sp.banner || 'Vocês viram um passarinho passando por aqui?'));
    tl.add(1.45, () => film && film.card(null));
    // o OLHAR: o alvo em transe
    tl.add(1.7, () => {
      const head = jointPos(opp, 'hd');
      world.fx.distort(head, { color, radius: 1.6, life: 0.6 });
      world.fx.ring(head, { color, radius: 0.7, life: 0.6, vertical: true, yaw: opp.yaw });
      world.audio.play('fearGaze', { volume: 0.9 });
      hit(world, f, opp, parts[0], { color, sound: 'blink', scale: 0.8 });
      if (opp.state !== 'ko') opp.anim.play('fear', { restart: true });
      opp.notify && opp.notify('EM TRANSE', true);
    });
    // os CORTES SECOS: some e aparece de outro lado a cada golpe (quadros faltando), um clarão de luz de projetor
    for (let i = 0; i < cuts; i++) {
      tl.add(2.3 + i * 0.32, () => {
        if (opp.state === 'ko') return;
        const s = spotAround(world, f, opp, (i % 2 ? 1 : -1) * (0.9 + i * 0.6), 1.25);
        f.pos.set(s.x, f.pos.y, s.z);
        f.yaw = yawTo(f.pos, opp.pos);
        f.anim.play(i % 2 ? 'db_claw_l' : 'db_claw_r', { restart: true, duration: 0.24, blend: 0 });
        world.screenFlash && world.screenFlash('#f4e8c8', 0.05);
        world.audio.play('clawHit', { volume: 0.8 });
      });
      tl.add(2.3 + i * 0.32 + 0.09, () => {
        if (opp.state === 'ko') return;
        hit(world, f, opp, parts[1 + i], { color, sound: 'clawHit' });
        specialHitFx(world, f, opp, { kind: 'claw', flip: !!(i % 2) }, color);
        f.poseHold = 0.06;
        if (opp.state !== 'ko') { opp.anim.play('hit', { restart: true, blend: 0.02 }); opp.poseHold = 0.06; }
      });
    }
    tl.add(2.3 + cuts * 0.32 + 0.05, () => film && film.card(sp.kissCard || 'Um beijo.'));
    // O BEIJO: de frente, a mordida no pescoço
    tl.add(2.3 + cuts * 0.32 + 0.75, () => {
      film && film.card(null);
      const F = forwardFromYaw(yawTo(opp.pos, f.pos));
      f.pos.set(opp.pos.x + F.x * 0.9, f.pos.y, opp.pos.z + F.z * 0.9);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('raziel_bite', { restart: true, duration: 0.6 });
      if (opp.state !== 'ko') opp.anim.play('stun', { restart: true });
      const dealt = hit(world, f, opp, parts[1 + cuts], { color, sound: 'clawHit' });
      heal(world, f, dealt, sp.drain ?? 1);
      gore(world, opp, color);
    });
    // a COR VOLTA com o sangue: o último golpe e a reverência para a plateia
    const fin = 2.3 + cuts * 0.32 + 1.45;
    tl.add(fin, () => {
      film && film.off();
      world.screenFlash && world.screenFlash('#7a0010', 0.22);
      hit(world, f, opp, parts[parts.length - 1], { color, sound: 'slashFinal', scale: 2.2 });
      specialHitFx(world, f, opp, { kind: 'cross', big: true, color2: 0xd01c30 }, color);
      if (opp.state !== 'ko') { opp.anim.play('launched', { restart: true }); opp.applyBleed && opp.applyBleed({ dps: 3, duration: 3 }, f); }
    });
    tl.add(fin + 0.35, () => {
      f.anim.play('vic_velisar', { restart: true, duration: 1.0 });
      world.audio.play('applause', { volume: 0.7 });
    });
    tl.end(fin + 1.1);
    const clear = () => { if (film) { film.off(); setTimeout(() => film.remove(), 400); } };
    return {
      update(dt) {
        const done = tl.update(dt);
        if (done) { clear(); finish(world, f, opp, { knockback: 4 }); }
        return done;
      },
      cancel() { clear(); world.endCinematic(); },
    };
  },
};

// ====================================================================================== ZÉFERO — ESPÉCIME
export const specimenHunt = {
  telegraph: () => ({ time: 0.5, anim: 'vic_zefero', animDuration: 0.5, mark: 'sigil' }),
  canStart: (f, sp) => canReach(f, sp),
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const color = sp.color ?? 0xa01018;
    const crimson = 0xd01c30;
    const pounces = 3;
    const frenzy = sp.frenzy ?? 7;
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, [...Array(pounces).fill(0.08), ...Array(frenzy).fill(0.035), 0.5]);
    const tl = new Timeline();
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    // a CORRENTE do grilhão, esticada para trás e para o alto (quem a segura, o Velisar, fica fora do quadro)
    const back = forwardFromYaw(f.yaw).multiplyScalar(-1);
    const anchor = f.pos.clone().addScaledVector(back, 4).setY(2.4);
    let chain = world.fx.chain(() => jointPos(f, 'hd').add(new THREE.Vector3(0, -0.22, 0)), () => anchor, { links: 26, sag: 0.02 });
    f.anim.play('vic_zefero', { restart: true, duration: 0.9 });
    world.audio.play('chainPull', { volume: 0.8, pitch: 0.8 });
    world.cameraRig.playShots([
      lowAngle(f, { dur: 1.0, dist: 2.4, side: -1.3, fov: 48 }),
      orbit(opp, { dur: 1.5, radius: 5, height: 2.3, a0: 0.8, a1: -0.9, lookH: 1.0, fov: 48 }),
      impactClose(f, opp, { dur: 1.3 }),
      faceClose(f, { dur: 1.2, from: 2.2, to: 1.6, side: 0.4, height: 1.2, fov: 40 }),
    ]);
    tl.add(0.35, () => world.audio.play('chainPull', { volume: 1, pitch: 0.7 }));
    // ARREBENTA
    tl.add(0.8, () => {
      const mid = jointPos(f, 'hd').lerp(anchor, 0.35);
      if (chain) { chain.stop(); chain = null; }
      world.fx.burst(mid, { count: 30, color: 0xb0b4bc, speed: 7, life: 0.5, size: 0.1, gravity: 9 });
      world.fx.flash(mid, { color: 0xffffff, size: 1.6, life: 0.12 });
      world.audio.play('trapSnap', { volume: 1 });
      world.cameraRig.shake(0.35, 0.2);
      world.specialBanner(f, sp, sp.name);
    });
    // os três BOTES, de lados diferentes
    const sides = [-1.4, Math.PI, 1.4];
    for (let i = 0; i < pounces; i++) {
      const t0 = 1.0 + i * 0.45;
      let from = null;
      let to = null;
      tl.add(t0, () => {
        if (opp.state === 'ko') return;
        const s = spotAround(world, f, opp, sides[i], 3.6);
        from = new THREE.Vector3(s.x, f.pos.y, s.z);
        const d = new THREE.Vector3(opp.pos.x - s.x, 0, opp.pos.z - s.z).normalize();
        to = new THREE.Vector3(opp.pos.x - d.x * 0.85, f.pos.y, opp.pos.z - d.z * 0.85);
        f.pos.copy(from);
        f.yaw = yawTo(f.pos, opp.pos);
        f.anim.play('raziel_pounce', { restart: true, duration: 0.3, blend: 0 });
        world.audio.play('blink', { volume: 0.5 });
        world.fx.burst(from.clone().setY(0.2), { count: 10, color: 0x2a0408, kind: 'smoke', speed: 1.5, life: 0.5, size: 0.5, grow: 1 });
      });
      tl.each((time) => {
        if (!from || time < t0 || time > t0 + 0.2) return;
        const k = Math.min(1, (time - t0) / 0.18);
        f.pos.lerpVectors(from, to, k);
        if (f.rig.body) f.rig.body.position.y = Math.sin(k * Math.PI) * 0.7;
      });
      tl.add(t0 + 0.2, () => {
        if (f.rig.body) f.rig.body.position.y = 0;
        if (opp.state === 'ko') return;
        f.anim.play(i % 2 ? 'db_claw_l' : 'db_claw_r', { restart: true, duration: 0.22, blend: 0 });
        hit(world, f, opp, parts[i], { color, sound: 'clawHit' });
        specialHitFx(world, f, opp, { kind: 'claw', flip: !!(i % 2) }, crimson);
        if (opp.state !== 'ko') opp.anim.play('hit', { restart: true, blend: 0.02 });
      });
    }
    // PRESO NO CHÃO: em cima do alvo, o frenesi de garras
    const pin = 1.0 + pounces * 0.45 + 0.05;
    tl.add(pin, () => {
      if (opp.state === 'ko') return;
      opp.anim.play('downed', { restart: true });
      const F = forwardFromYaw(yawTo(opp.pos, f.pos));
      f.pos.set(opp.pos.x + F.x * 0.7, f.pos.y, opp.pos.z + F.z * 0.7);
      f.yaw = yawTo(f.pos, opp.pos);
      world.fx.play('FX_DUST', opp.pos, { scale: 1 });
      world.audio.play('heavyPunch', { volume: 0.8 });
      world.cameraRig.shake(0.4, 0.2);
    });
    for (let i = 0; i < frenzy; i++) {
      tl.add(pin + 0.2 + i * 0.1, () => {
        if (opp.state === 'ko') return;
        f.anim.play(i % 2 ? 'db_claw_l' : 'db_claw_r', { restart: true, duration: 0.12, blend: 0 });
        hit(world, f, opp, parts[pounces + i], { color, sound: 'clawHit', scale: 0.8 });
        const c = opp.chestPos();
        world.fx.burst(c, { count: 14, color, speed: 4.5, up: 2, life: 0.5, size: 0.12, gravity: 9 });
        world.fx.slash(c, f.yaw, { color: crimson, radius: 1.0, roll: (i % 2 ? 1 : -1) * 1.2, arc: 1.8, life: 0.18, width: 0.12 });
      });
    }
    // DEVORA
    const eat = pin + 0.2 + frenzy * 0.1 + 0.15;
    tl.add(eat, () => {
      f.anim.play('raziel_feast', { restart: true, duration: 0.8 });
      const dealt = hit(world, f, opp, parts[parts.length - 1], { color, sound: 'slashFinal', scale: 2 });
      heal(world, f, dealt, sp.drain ?? 1.2);
      gore(world, opp, color);
      world.fx.tracer(opp.chestPos(), jointPos(f, 'hd'), { color, life: 0.4, width: 0.05 });
      if (opp.state !== 'ko') opp.applyBleed && opp.applyBleed({ dps: 4, duration: 3 }, f);
    });
    // e RUGE
    tl.add(eat + 0.85, () => {
      f.anim.play('vic_zefero', { restart: true, duration: 0.9 });
      world.audio.play('scream', { volume: 0.6, pitch: 0.55 });
      world.fx.ring(jointPos(f, 'hd'), { color, radius: 2.2, life: 0.45, vertical: true, yaw: f.yaw });
      world.cameraRig.shake(0.5, 0.35);
    });
    tl.end(eat + 1.6);
    const clear = () => {
      if (chain) { chain.stop(); chain = null; }
      if (f.rig.body) f.rig.body.position.y = 0;
    };
    return {
      update(dt) {
        const done = tl.update(dt);
        if (done) { clear(); finish(world, f, opp, { knockback: 2.5, low: true }); }
        return done;
      },
      cancel() { clear(); world.endCinematic(); },
    };
  },
};
