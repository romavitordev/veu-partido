import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw, angleDiff } from '../../core/util.js';
import { projectileVisual } from '../projectiles.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { sigilMap, emberBurst, rootSnap } from '../../fx/vigiliaFx.js';
import { igniteFighter } from '../burn.js';
import { stingSwarm } from '../bees.js';
import { overShoulder, impactClose, faceClose, lowAngle, socketClose, orbit, pullBack } from '../../camera/shots.js';

// ESPECIAIS PRÓPRIOS DA VIGÍLIA (Treb Ciach, 890; lore/A-VIGILIA.md). As cenas são PROPOSTA.
//   protectionCircle  MAEL — O Círculo do Samhain: o druida aprendiz do Marban risca no chão o SÍMBOLO DO RITUAL DA CHAMA
//                     DE PROTEÇÃO (o mesmo sigilo dourado da fogueira da arena Treb Ciach); quem está dentro e não é da
//                     Vigília fica preso enquanto a chama amarela sobe em três ondas. Ele, dentro do círculo, quase não
//                     sente dano. "Esse é meu destino."
//   twinArrows        GWAYNE — A Flecha de Gwyneth: com o arco da irmã gêmea, ele acende uma flecha, diz a frase dele e
//                     acerta a CABEÇA do alvo, que fica queimando (sem teleporte). "Esse lugar é minha única chance."

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
    // a câmera de cinema: em volta dele enquanto o sigilo acende, depois aberta e alta para o círculo inteiro
    world.beginCinematic(f, null);
    world.cameraRig.playShots([
      orbit(f, { dur: 0.8, radius: 3, height: 1.5, a0: -0.7, a1: 0.2, lookH: 1.3, fov: 42 }),
      pullBack(f, opp, { dur: 1.4, from: 5, to: 8.5, height: 4.2, fov: 50 }),
      impactClose(f, opp, { dur: 1.2, side: 4.6, height: 2.2 }),
    ]);
    let cine = true;
    const endCine = () => { if (cine) { cine = false; world.endCinematic(); } };
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
      if (!inside()) { f.notify('O CÍRCULO FICOU VAZIO'); endCine(); return; }
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
    tl.add(waves[waves.length - 1] + 0.35, endCine);
    tl.end(waves[waves.length - 1] + 0.4);
    return {
      update: (dt) => tl.update(dt),
      cancel() { if (column) column.stop(); endCine(); },
    };
  },
};

// ---------------------------------------------------------------- câmeras da Vigília
// (dono, 2026-11-28: "ainda falta as cenas de cutscenes nos especiais da Vigília, eles estão sem a câmera cinematográfica")

// câmera baixa, à frente e ao lado de quem corre, olhando para ela (a mesma da corrida da Erin na Supernova)
function runTrack(f, { dur = 1, ahead = 2.4, side = 1.2, height = 1.0, fov = 44 } = {}) {
  return {
    dur, fov,
    pos: () => {
      const F = forwardFromYaw(f.yaw);
      const R = new THREE.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw));
      return new THREE.Vector3(f.pos.x, f.pos.y + height, f.pos.z).addScaledVector(F, ahead).addScaledVector(R, side);
    },
    look: () => new THREE.Vector3(f.pos.x, f.pos.y + 1.2, f.pos.z),
  };
}

// a cabeça de quem leva o tiro
const headOf = (o) => (o.rig.joints && o.rig.joints.hd ? o.rig.joints.hd.getWorldPosition(new THREE.Vector3()) : o.chestPos().add(new THREE.Vector3(0, 0.45, 0)));
const disposeTree = (g) => g.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });

// a FLECHA na mão do Gwayne (penas vermelhas, a ponta de ferro); a ponta pega fogo
function arrowMesh() {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.72, 5), new THREE.MeshToonMaterial({ color: 0x8a6a44 }));
  shaft.rotation.x = Math.PI / 2;
  g.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.08, 4), new THREE.MeshToonMaterial({ color: 0x9a9894 }));
  tip.rotation.x = Math.PI / 2;
  tip.position.z = 0.4;
  g.add(tip);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const fl = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.04, 0.1), new THREE.MeshToonMaterial({ color: 0xb02020 }));
    fl.position.set(Math.cos(a) * 0.014, Math.sin(a) * 0.014, -0.32);
    fl.rotation.z = a;
    g.add(fl);
  }
  g.userData.tip = tip;
  return g;
}

// GWAYNE — A FLECHA DE GWYNETH (PROPOSTA; dono, 2026-11-28: "ele deveria pegar uma flecha, acender ela com fogo, falar
// alguma frase dele e acertar o inimigo com um headshot, deixando o inimigo queimando"). Sem teleporte:
//   1. close na mão: ele tira uma flecha da aljava e a ponta PEGA FOGO;
//   2. close no rosto, com o arco da irmã: "Esse lugar é minha única chance.";
//   3. por cima do ombro, a corda estica; a flecha em chamas cruza o campo e acerta a CABEÇA;
//   4. o alvo cai para trás QUEIMANDO.
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
    const handR = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    const handL = () => f.rig.sockets.handL.getWorldPosition(new THREE.Vector3());
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    f.anim.play('turn_look', { restart: true, duration: 0.7 }); // a mão vai à aljava
    world.cameraRig.playShots([socketClose(f, handR, { dur: 1.15, dist: 1.0, side: 0.6, fov: 36 })]);
    world.audio.play('reload', { volume: 0.6 });
    const arrow = arrowMesh();
    arrow.visible = false;
    f.rig.sockets.handR.add(arrow);
    let flame = null;
    let fly = null;
    let t = 0;
    let step = 0;
    let gone = false;
    const clean = () => {
      if (gone) return;
      gone = true;
      if (flame) flame.stop();
      if (arrow.parent) arrow.parent.remove(arrow);
      disposeTree(arrow);
    };
    const tipPos = () => arrow.userData.tip.getWorldPosition(new THREE.Vector3());
    return {
      update(dt) {
        t += dt;
        if (fly && !fly.hit) {
          fly.t += dt;
          const u = Math.min(1, fly.t / fly.dur);
          const to = headOf(opp);
          arrow.position.lerpVectors(fly.from, to, u);
          arrow.lookAt(to);
          if (u >= 1) {
            fly.hit = true;
            // NA CABEÇA: o tiro inteiro, o fogo, e o alvo cai para trás
            const p = headOf(opp);
            if (flame) { flame.stop(); flame = null; }
            arrow.visible = false;
            world.fx.flash(p, { color, size: 2.6, life: 0.18 });
            emberBurst(world, p, { big: true, color });
            world.fx.burst(p, { count: 50, color, speed: 7, up: 2, life: 0.5, size: 0.2 });
            world.cameraRig.shake(0.6, 0.3);
            world.screenFlash && world.screenFlash('#3a1a06', 0.15);
            world.hitstop && world.hitstop(0.12);
            applyHit(world, f, opp, { damage: sp.damage ?? COMBAT.specialDamage, kind: 'special', element: 'energia', fire: true, reaction: false, ignoreInvuln: true, sound: 'sniper', color, scale: 2.2 });
            igniteFighter(world, f, opp, sp.burn ?? { dps: 12, duration: 4 });
            world.showBanner && world.showBanner(sp.release ?? 'NA CABEÇA', f.def.color);
            if (opp.state !== 'ko') opp.anim.play('launched', { restart: true });
            // a câmera FICA no alvo (o meio do caminho entre os dois, com ele longe, era só o chão): de lado, na altura
            // do peito, girando devagar enquanto ele queima
            world.cameraRig.playShots([orbit(opp, { dur: 1.2, radius: 3.4, height: 1.5, a0: -1.1, a1: -0.6, lookH: 1.2, fov: 44 })]);
          }
        }
        // 1 — a flecha sai da aljava e pega fogo
        if (step === 0 && t >= 0.35) {
          step = 1;
          arrow.visible = true;
          arrow.rotation.set(-0.6, 0, 0);
        }
        if (step === 1 && t >= 0.75) {
          step = 2;
          world.audio.play('smoke', { volume: 0.7, pitch: 1.6 });
          world.fx.flash(tipPos(), { color, size: 0.9, life: 0.2 });
          flame = world.fx.emitter({ rate: 70, follow: tipPos, particle: { color, speed: 0.3, up: 1.4, spread: 0.05, life: 0.35, size: 0.1 } });
        }
        // 2 — o rosto e a frase dele
        if (step === 2 && t >= 1.15) {
          step = 3;
          f.anim.play('bow_aim', { restart: true, duration: 1.6 });
          world.specialBanner(f, sp, sp.name);
          world.cameraRig.playShots([faceClose(f, { dur: 1.5, from: 2.0, to: 1.4, side: -0.4, height: 1.6, fov: 36 })]);
        }
        // 3 — a corda estica: por cima do ombro, mirando a cabeça
        if (step === 3 && t >= 2.65) {
          step = 4;
          world.cameraRig.playShots([overShoulder(f, opp, { dur: 0.7, back: 1.2, side: -0.55, height: 1.6, fov: 28 })]);
        }
        if (step === 4 && t >= 3.15) {
          step = 5;
          f.anim.play('bow_shot', { restart: true, duration: 0.5 });
          world.audio.play('sniper', { volume: 1, pitch: 1.2 });
          const from = handL();
          world.fx.flash(from, { color, size: 1.4, life: 0.12 });
          // a flecha sai da mão e voa sozinha (o fogo vai junto)
          f.rig.sockets.handR.remove(arrow);
          world.scene.add(arrow);
          arrow.position.copy(from);
          fly = { from, t: 0, dur: Math.max(0.18, distXZ(f.pos, opp.pos) / 55), hit: false };
          // a câmera no rosto do alvo, esperando a flecha
          world.cameraRig.playShots([faceClose(opp, { dur: 0.5, from: 2.6, to: 1.8, side: 0.6, height: 1.6, fov: 40 })]);
        }
        if (step === 5 && fly && fly.hit && fly.t >= fly.dur + 1.0) {
          clean();
          world.endCinematic();
          if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback: 7, hitstun: COMBAT.launchHitstun, launch: true });
          return true;
        }
        if (t > 7) { clean(); world.endCinematic(); return true; }
        return false;
      },
      cancel() {
        clean();
        world.endCinematic();
      },
    };
  },
};

// ZURI — PONTO FRACO (PROPOSTA): ela lê o adversário (a ANÁLISE do cânone) — três pontos dourados acendem no corpo dele,
// ele fica preso no olhar dela — e ela AVANÇA (sem teleporte) e corta um a um com a faca; o último corte derruba e uma
// parte volta para ela como vida (Curandeira). "Fica parado. Deixa eu ver isso." Com a câmera de cinema: o close nos
// olhos dela, o alvo marcado, os cortes de perto e o último de baixo.
export const weakPoint = {
  telegraph: () => ({ time: 0.5, anim: 'turn_look', animDuration: 0.5, mark: 'laser' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 9);
  },
  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const color = sp.color ?? 0xe0a83a;
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, sp.shares ?? [0.25, 0.25, 0.5]);
    const tl = new Timeline();
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    f.anim.play('turn_look', { restart: true, duration: 0.7 });
    world.specialBanner(f, sp, sp.name);
    world.audio.play('ritual', { volume: 0.7, pitch: 1.4 });
    opp.notify('ANALISADO', true);
    world.cameraRig.playShots([
      faceClose(f, { dur: 0.55, from: 1.9, to: 1.4, side: 0.3, height: 1.55, fov: 36 }),
      faceClose(opp, { dur: 0.45, from: 2.6, to: 2.2, side: -0.5, height: 1.3, fov: 42 }),
      impactClose(f, opp, { dur: 1.0, side: 3.4, height: 1.7 }),
      lowAngle(f, { dur: 0.9, dist: 2.4, side: 1.5, fov: 50 }),
    ]);
    // os três pontos: o ombro, o peito e a perna, acesos em dourado
    const spots = [[0.25, 0.35], [0, 0], [-0.15, -0.6]];
    const at = (i) => opp.chestPos().add(new THREE.Vector3(spots[i][0], spots[i][1], 0));
    spots.forEach((_, i) => tl.add(0.6 + i * 0.12, () => {
      world.fx.ring(at(i), { color, radius: 0.28, life: 0.9, vertical: true, yaw: f.yaw });
      world.fx.flash(at(i), { color, size: 0.6, life: 0.2 });
    }));
    let dealt = 0;
    // ela avança colada (corrida curta, não teleporte)
    let dash = null;
    tl.add(0.95, () => {
      f.anim.play('run', { restart: true });
      world.audio.play('swing', { volume: 0.5 });
      const back = forwardFromYaw(yawTo(opp.pos, f.pos));
      dash = { from: f.pos.clone(), to: new THREE.Vector3(opp.pos.x + back.x * 1.2, 0, opp.pos.z + back.z * 1.2), t: 0, dur: Math.min(0.3, Math.max(0.12, distXZ(f.pos, opp.pos) / 26)) };
    });
    const cuts = [['slash_h', 1.3], ['slash_h_back', 1.62], ['knife_final', 2.05]];
    cuts.forEach(([anim, t], i) => {
      tl.add(t, () => f.anim.play(anim, { restart: true, duration: 0.35 }));
      tl.add(t + 0.14, () => {
        if (opp.state === 'ko') return;
        const last = i === cuts.length - 1;
        const p = at(i);
        world.fx.flash(p, { color: last ? 0xffffff : color, size: last ? 2 : 1.1, life: 0.14 });
        world.fx.burst(p, { count: last ? 30 : 14, color, speed: last ? 6 : 3.5, life: 0.4, size: 0.12 });
        world.cameraRig.shake(last ? 0.45 : 0.15, last ? 0.25 : 0.1);
        const r = applyHit(world, f, opp, { damage: parts[i], kind: 'special', element: f.def.element, reaction: false, ignoreInvuln: true, sound: last ? 'slashFinal' : 'bladeHit', color, scale: last ? 1.8 : 1.1 });
        if (typeof r === 'number') dealt += r;
        if (last) {
          world.showBanner && world.showBanner(sp.release ?? 'ACHEI', f.def.color);
          // CURANDEIRA: uma parte do que ela tirou volta como vida
          const heal = Math.round(dealt * (sp.heal ?? 0.25));
          if (heal > 0 && f.state !== 'ko') {
            f.health = Math.min(f.maxHealth, f.health + heal);
            f.notify('+' + heal + ' VIDA', true);
            world.fx.burst(f.chestPos(), { count: 18, color: 0x9ad870, speed: 1.4, up: 1.6, life: 0.7, size: 0.12 });
          }
        }
      });
    });
    tl.end(2.9);
    let ended = false;
    const finish = () => { if (!ended) { ended = true; world.endCinematic(); } };
    return {
      update(dt) {
        if (dash) {
          dash.t += dt;
          const k = Math.min(1, dash.t / dash.dur);
          f.pos.lerpVectors(dash.from, dash.to, k);
          f.yaw = yawTo(f.pos, opp.pos);
          if (k >= 1) dash = null;
        }
        const done = tl.update(dt);
        if (done) {
          finish();
          if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback: 5, hitstun: COMBAT.launchHitstun, launch: true });
        }
        return done;
      },
      cancel: finish,
    };
  },
};

// EILEEN — A COLMEIA (PROPOSTA). Dono, 2026-11-28: "deveria ser como um lançamento de granada da Erin no especial dela.
// Só que com o pote de abelhas pegando fogo" e "deveria correr até o inimigo e acertar com a funda, como quando a Erin
// corre". Então:
//   1. (sem cinemática) ela joga o POTE EM CHAMAS em arco até onde o adversário ESTAVA — dá para sair de baixo, e
//      defender de frente para ela abafa o pote. Errou: ela fica parada e aberta;
//   2. acertou: o pote estoura, o ENXAME prende o alvo picado (PICADAS) e queimando, ela CORRE até ele e, de perto,
//      gira a FUNDA e solta a pedra na cara dele. "Elas não picam quem eu gosto."
export const hiveSwarm = {
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 16);
  },
  start(f, sp, world) {
    const opp = f.opponent;
    const color = sp.color ?? 0xf2c230;
    const parts = splitDamage(sp.damage ?? COMBAT.specialDamage, sp.shares ?? [0.35, 0.65]);
    const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    const J = sp.jar || {};
    const jarRadius = J.radius ?? 2.4;
    // ---------------------------------------------------------------- 1) o pote em chamas (não é cinemática)
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('throw_r', { restart: true, duration: 0.55 });
    world.audio.play('swarm', { volume: 0.5 });
    let lob = null;
    let tt = 0;
    let caught = null;
    let trail = null;
    const target = new THREE.Vector3(opp.pos.x, 0.15, opp.pos.z); // onde ele ESTAVA
    const dropLob = () => {
      if (trail) { trail.stop(); trail = null; }
      if (!lob) return;
      world.scene.remove(lob.mesh);
      disposeTree(lob.mesh);
      lob = null;
      f.threatLob = null;
    };
    const smash = () => {
      const pp = lob.mesh.position.clone();
      dropLob();
      world.fx.flash(pp, { color: 0xff8a2a, size: 4, life: 0.3 });
      world.fx.ring(new THREE.Vector3(pp.x, 0.07, pp.z), { color: 0xff7a2a, radius: jarRadius, life: 0.4 });
      world.fx.burst(pp, { count: 30, color: 0xff7a2a, speed: 6, up: 2, life: 0.5, size: 0.22 });
      world.fx.burst(pp, { count: 30, color, speed: 4, life: 0.6, size: 0.07 });
      world.fx.burst(pp, { count: 10, color: 0xc8d8c0, speed: 5, life: 0.4, size: 0.06 }); // os cacos do vidro
      world.audio.play('blockHit', { volume: 0.8, pitch: 1.6 });
      world.audio.play('explosion', { volume: 0.5, pitch: 1.3 });
      const inside = opp.state !== 'ko' && Math.hypot(opp.pos.x - pp.x, opp.pos.z - pp.z) <= jarRadius;
      const facing = Math.abs(angleDiff(opp.yaw, yawTo(opp.pos, f.pos))) <= (COMBAT.block.arc * Math.PI) / 360;
      if (inside && opp.isGuarding() && facing) { opp.notify('ABAFOU O POTE!', true); return false; }
      if (!inside || opp.isInvulnerable()) { if (inside) opp.notify('DESVIOU!', true); return false; }
      return true;
    };
    const whiff = () => {
      f.notify('ERROU', true);
      f.stun(J.missRecovery ?? 0.6, 'breath');
      f.whiffRecovery = true;
    };
    return {
      update(dt) {
        if (caught) return caught.update(dt);
        tt += dt;
        if (!lob && tt >= 0.3) {
          const mesh = projectileVisual('beeJar', color, { lit: true, big: !!sp.burn });
          const start = hand();
          mesh.position.copy(start);
          world.scene.add(mesh);
          lob = { mesh, start, t: 0, dur: J.flight ?? 0.65, target };
          f.threatLob = lob; // a CPU adversária vê o pote vindo
          trail = world.fx.emitter({ rate: 50, follow: () => (lob ? lob.mesh.position.clone() : target.clone()), particle: { color: 0xff8a2a, speed: 0.4, up: 1.2, spread: 0.15, life: 0.3, size: 0.16 } });
          world.audio.play('knifeThrow');
        }
        if (lob) {
          lob.t += dt;
          const u = Math.min(1, lob.t / lob.dur);
          lob.mesh.position.lerpVectors(lob.start, target, u);
          lob.mesh.position.y += Math.sin(u * Math.PI) * 2.0;
          const tum = lob.mesh.userData.tumble;
          if (tum) tum.rotation.x += dt * 10;
          if (u >= 1) {
            if (smash()) { caught = startCinematic(); return false; }
            whiff();
            return true;
          }
        }
        return false;
      },
      cancel() {
        dropLob();
        if (caught) caught.cancel();
      },
    };

    // ---------------------------------------------------------------- 2) acertou: o enxame, a corrida e a funda
    function startCinematic() {
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    world.specialBanner(f, sp, sp.name);
    world.audio.play('swarm', { volume: 0.9 });
    world.cameraRig.playShots([overShoulder(f, opp, { dur: 1.0, back: 1.8, side: 0.8, height: 1.6, fov: 44 })]);
    // o enxame que saiu do pote quebrado, rodando em volta dele
    const river = world.fx.emitter({
      rate: 120,
      follow: () => opp.chestPos().add(new THREE.Vector3((Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.4)),
      particle: { color, speed: 1.5, spread: 0.4, life: 0.35, size: 0.07 },
    });
    let riverOn = true;
    const stopRiver = () => { if (riverOn) { riverOn = false; river.stop(); } };
    let phase = 'jar';
    let t = 0;
    let total = 0;
    let stung = false;
    let stone = null;
    let spin = null;
    const go = (p) => { phase = p; t = 0; };
    const dropStone = () => {
      if (!stone) return;
      world.scene.remove(stone.mesh);
      disposeTree(stone.mesh);
      stone = null;
    };
    const clean = () => {
      stopRiver();
      if (spin) { spin.stop(); spin = null; }
      dropStone();
    };
    return {
      update(dt) {
        t += dt;
        total += dt;
        if (phase === 'jar') {
          if (!stung) {
            stung = true;
            if (opp.state !== 'ko') {
              opp.stun(3, 'stagger', { bind: true });
              opp.vel.set(0, 0, 0);
              stingSwarm(world, f, opp, { dps: 10, duration: 4, slow: 0.65 });
              igniteFighter(world, f, opp, sp.burn ?? { dps: 6, duration: 2.5 }); // o pote estava pegando fogo
              applyHit(world, f, opp, { damage: parts[0], kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, knockback: 0, hitstun: 0, sound: 'impact', color, scale: 1.2 });
              opp.notify('PRESO NO ENXAME', true);
            }
          }
          if (t >= 1.0) {
            stopRiver();
            f.anim.play('run', { restart: true });
            world.cameraRig.playShots([runTrack(f, { dur: 1.3 })]);
            go('run');
          }
        } else if (phase === 'run') {
          // corre até ficar a uns passos dele (de perto a funda não erra)
          f.yaw = yawTo(f.pos, opp.pos);
          const want = sp.slingDistance ?? 3.2;
          const d = distXZ(f.pos, opp.pos);
          if (d > want && t < 1.2) {
            f.pos.addScaledVector(forwardFromYaw(f.yaw), Math.min(d - want, (sp.runSpeed ?? 13) * dt));
            if (Math.random() < 0.3) world.fx.burst(new THREE.Vector3(f.pos.x, 0.05, f.pos.z), { count: 2, color: 0x8a7a60, kind: 'smoke', speed: 0.5, life: 0.4, size: 0.25 });
          } else {
            // para e gira a funda: as voltas da pedra em cima da mão
            f.anim.play('throw_r', { restart: true, duration: 0.75 });
            world.audio.play('swing', { volume: 0.6, pitch: 0.7 });
            let ang = 0;
            spin = world.fx.emitter({ rate: 60, follow: () => { ang += 0.9; return hand().add(new THREE.Vector3(Math.cos(ang) * 0.35, 0.25 + Math.sin(ang) * 0.1, Math.sin(ang) * 0.35)); }, particle: { color: 0xd8c8a0, speed: 0, spread: 0, life: 0.12, size: 0.06 } });
            world.cameraRig.playShots([lowAngle(f, { dur: 0.6, dist: 2.2, side: 1.4, fov: 48 })]);
            go('spin');
          }
        } else if (phase === 'spin') {
          if (t >= 0.45) {
            if (spin) { spin.stop(); spin = null; }
            world.audio.play('knifeThrow', { volume: 0.9 });
            const g = new THREE.Group();
            g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshToonMaterial({ color: sp.burn ? 0x6a3a1a : 0x8a8478 })));
            const from = hand();
            g.position.copy(from);
            world.scene.add(g);
            stone = { mesh: g, from, t: 0, dur: 0.14 };
            world.cameraRig.playShots([impactClose(f, opp, { dur: 1.2, side: 3.4, height: 1.8 })]);
            go('fly');
          }
        } else if (phase === 'fly') {
          stone.t += dt;
          const u = Math.min(1, stone.t / stone.dur);
          stone.mesh.position.lerpVectors(stone.from, headOf(opp), u);
          stone.mesh.rotation.x += dt * 20;
          if (u >= 1) {
            const p = headOf(opp);
            dropStone();
            world.fx.flash(p, { color, size: 2.4, life: 0.16 });
            world.fx.burst(p, { count: 40, color, speed: 6, life: 0.5, size: 0.1 });
            world.fx.burst(p, { count: 12, color: 0x8a8478, speed: 4, life: 0.4, size: 0.08 });
            world.fx.ring(new THREE.Vector3(opp.pos.x, 0.08, opp.pos.z), { color, radius: 2.4, life: 0.4 });
            world.cameraRig.shake(0.5, 0.3);
            world.hitstop && world.hitstop(0.1);
            applyHit(world, f, opp, { damage: parts[1], kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, sound: 'heavyPunch', color, scale: 2 });
            world.showBanner && world.showBanner(sp.release ?? 'COLHEITA', f.def.color);
            if (opp.state !== 'ko') opp.anim.play('launched', { restart: true });
            go('end');
          }
        } else if (phase === 'end') {
          if (t >= 0.85) {
            clean();
            world.endCinematic();
            if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback: 6, hitstun: COMBAT.launchHitstun, launch: true });
            return true;
          }
        }
        if (total > 7) { clean(); world.endCinematic(); return true; }
        return false;
      },
      cancel() {
        clean();
        world.endCinematic();
      },
    };
    }
  },
};
