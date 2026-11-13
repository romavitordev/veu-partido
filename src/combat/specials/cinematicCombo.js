import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, specialHitFx, trySpecialBlock } from './common.js';
import { TELEGRAPH } from './telegraph.js';
import { faceClose, twoShot, overShoulder, lowAngle, pullBack, socketClose, orbit } from '../../camera/shots.js';
import { HoloCopy } from '../holo.js';
import { groundMark, blindFighter } from '../abilities.js';
import { buildOrpheu } from '../../models/orpheu.js';
import { bateriaEloy } from '../../models/weapons.js';

// h.bird: o pássaro sai do ombro e voa em volta da cabeça do alvo, mergulhando de tempos em tempos, até o fim da cena
// (Beatrice — o Orpheu na Menina do Pássaro). Devolve { step(dt), dispose() } — o cleanup chama dispose e o pássaro some em penas.
function flyBird(world, f, opp) {
  const bird = buildOrpheu();
  const shoulder = () => (f.rig.joints.sL ? f.rig.joints.sL.getWorldPosition(new THREE.Vector3()) : f.chestPos()).add(new THREE.Vector3(0, 0.25, 0));
  bird.root.position.copy(shoulder());
  world.scene.add(bird.root);
  world.fx.burst(bird.root.position.clone(), { count: 10, color: 0x8a7458, speed: 1.6, life: 0.5, size: 0.08, gravity: 3 });
  world.audio.play('swing', { pitch: 1.7, volume: 0.6 });
  let t = 0;
  // movido pelo update do especial (o mundo fica congelado na cena: os tickers do World não andam)
  return {
    step(dt) {
      t += dt;
      const head = opp.chestPos().add(new THREE.Vector3(0, 0.45, 0));
      const dive = t > 0.35 && t % 0.5 > 0.36; // circula e mergulha no rosto a cada meio segundo
      const goal = dive ? head : head.clone().add(new THREE.Vector3(Math.sin(t * 7) * 0.75, 0.35, Math.cos(t * 7) * 0.75));
      const to = goal.clone().sub(bird.root.position);
      const d = to.length();
      if (d > 1e-4) bird.root.position.addScaledVector(to.multiplyScalar(1 / d), Math.min(d, 15 * dt));
      if (dive && d < 0.3 && Math.random() < dt * 12) world.fx.burst(head, { count: 4, color: 0x8a7458, speed: 2, life: 0.4, size: 0.07, gravity: 4 });
      bird.root.lookAt(goal);
      bird.update(world.time, 1);
    },
    dispose() {
      world.fx.burst(bird.root.position.clone(), { count: 12, color: 0x8a7458, speed: 2, life: 0.5, size: 0.08, gravity: 3 });
      world.scene.remove(bird.root);
      bird.dispose();
    },
  };
}

// Especial genérico "avança e executa uma sequência de golpes com câmera
// cinematográfica". Usado por Arthur, Aghata, Injustiça e Kian;
// cada um só muda a configuração (golpes, efeitos, tempos).
//
// Fases: preparação → investida → (se encostar) cinematic com golpes → fim.
// Dano total = sp.damage ?? COMBAT.specialDamage, dividido entre os golpes.
// Opções por golpe (todas opcionais): victimAnim (a pose do alvo nesse golpe, ex.: 'forced_kneel'), sigil (o sigilo
// do Controle Mental sobre a cabeça do alvo até o fim da cena), foresee (lampejo dourado no ponto do impacto um
// instante antes — a Bênção Maldita do Gal), push (quanto empurra; padrão 0,18 / 0,6 no final).
// sp.endReaction: { knockback, lowLaunch, stun } — como o alvo sai da cena (padrão: lançado longe; stun: fica atordoado
// esse tempo no lugar em vez de voar).
// Mais opções por golpe: call (o aviso em cima do alvo), shout (o grito de quem bate), quake (o chão racha em volta do
// alvo), pressure (a onda de pressão no contato), behind (quem bate reaparece nas COSTAS do alvo), vanish (some por
// esse tempo), trap (a armadilha de urso fecha no pé do alvo), xMark (o X no chão), consume (rouba essa energia — o
// Lodo correndo do alvo para a lâmina).
// Mais opções do especial: dash.anim / dash.ride (a montaria do lutador na investida), chain.rope / chain.color (a
// corda ou corrente da aproximação), tether { at, color, rope, hands } (a corrente/corda presa ao alvo durante a cena),
// e o que fica depois da cena: afterBuff (um estado no alvo), endBlind (cega o alvo), orderAllies (as assistências
// ficam prontas), selfHeal (fração da vida que quem usa recupera).
// sp.standOff: a distância em que a cena começa (padrão 1,15 m — de longe para quem atira).
// Mais opções por golpe: selfStrike (o ALVO faz o próprio golpe nº tal da sequência dele — a Hipnose do Carniçal),
// tears (o Lodo escorrendo dos olhos do alvo até o fim da cena), rage (a aura vermelha do ódio em quem bate até o fim —
// a Calabresa do Morato), burst { count, gap } (rajada: traçantes da boca da arma ao alvo), closeIn (quem bate vem
// colado no alvo antes do golpe), smoke (granada de fumaça no alvo), mine (a mina de proximidade no pé do alvo) e boom
// (a mina explode), props [[peça, visível], ...] (troca peças nesse passo; tudo volta no fim).

// prep.kit: um cenário montado na frente de quem prepara o especial (a bateria do Eloy)
const PREP_KITS = { drums: bateriaEloy };
// prep.shots: a preparação vira cena (o mundo congela e a câmera fica nele) — o Solo de Bateria do Eloy
const PREP_SHOTS = {
  drumSolo: (f) => [
    lowAngle(f, { dur: 0.95, dist: 2.8, side: 1.6, fov: 48 }),
    orbit(f, { dur: 0.45, radius: 3.4, height: 1.5, a0: 0.6, a1: -0.2, lookH: 1.1 }),
    faceClose(f, { dur: 0.6, from: 1.9, to: 1.25, side: 0.3 }),
    orbit(f, { dur: 0.35, radius: 4.2, height: 1.8, a0: -0.4, a1: 0.4, lookH: 1.0 }),
  ],
};
const DRUM_SOUND = { snare: 'drumSnare', tomL: 'drumTom', tomR: 'drumTom', floor: 'drumTom', kick: 'drumKick', crash: 'drumCrash', hihat: 'drumSnare' };

const PREP_FX = {
  // Joui com a Shi no Kage: saca a Relíquia de Energia (relâmpago roxo na mão esquerda) e os sigilos dourados da Shi no
  // Kage acendem na direita
  relicDraw(f, world) {
    const hl = () => f.rig.sockets.handL.getWorldPosition(new THREE.Vector3());
    const hr = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    world.audio.play('slashFinal', { volume: 0.6, pitch: 0.7 });
    world.fx.flash(hl(), { color: 0xb070ff, size: 1.6, life: 0.25 });
    const e1 = world.fx.emitter({ rate: 80, follow: hl, particle: { color: 0xb070ff, speed: 1.4, spread: 0.5, life: 0.35, size: 0.16, jitter: 0.2 } });
    const e2 = world.fx.emitter({ rate: 60, follow: hr, particle: { color: 0xffd27a, speed: 0.8, spread: 0.4, life: 0.5, size: 0.12 } });
    const runes = world.fx.runes(() => f.chestPos(), { color: 0xffd27a, count: 6, radius: 0.8, size: 0.24 });
    return [e1, e2, { stop: () => runes.stop() }];
  },
  // Arthur: energia vermelha no antebraço e a Arma de Sangue surgindo
  forearmEnergy(f, world, sp) {
    const s = (sp.prepare && sp.prepare.arm) || 'R';
    const elbow = () => f.rig.joints['e' + s].getWorldPosition(new THREE.Vector3());
    const hand = () => f.rig.sockets['hand' + s].getWorldPosition(new THREE.Vector3());
    const e1 = world.fx.emitter({ rate: 90, follow: elbow, particle: { color: sp.color, speed: 1.6, spread: 0.7, life: 0.45, size: 0.28, jitter: 0.2 } });
    const e2 = world.fx.emitter({ rate: 60, follow: hand, particle: { color: 0x5a0008, kind: 'smoke', speed: 0.6, spread: 0.4, life: 0.6, size: 0.35, grow: 1 } });
    return [e1, e2];
  },
  bloodBurst(f, world, sp) {
    world.fx.burst(f.chestPos(), { count: 40, color: sp.color, speed: 6, life: 0.5, size: 0.3 });
    world.fx.burst(f.chestPos(), { count: 16, color: 0x2a0408, kind: 'smoke', speed: 2, life: 0.7, size: 0.8, grow: 1 });
    return [];
  },
  bladeGlow(f, world, sp) {
    const mk = (s) => world.fx.emitter({ rate: 90, follow: () => f.rig.sockets[s].getWorldPosition(new THREE.Vector3()), particle: { color: sp.color, speed: 1.4, spread: 0.8, life: 0.4, size: 0.3, jitter: 0.5 } });
    return [mk('handR'), mk('handL')];
  },
  // Lírio: nada de energia — pisa firme, levanta poeira e ergue a Leonora
  stomp(f, world) {
    world.fx.play('FX_DUST', f.pos, { scale: 1.2 });
    world.cameraRig.shake(0.25, 0.3);
    world.audio.play('heavyPunch', { volume: 0.6, pitch: 0.55 });
    return [];
  },
  fistGlow(f, world, sp) {
    const mk = (s) => world.fx.emitter({ rate: 100, follow: () => f.rig.sockets[s].getWorldPosition(new THREE.Vector3()), particle: { color: sp.color, speed: 1.4, spread: 0.7, life: 0.4, size: 0.32 } });
    return [mk('handR'), mk('handL')];
  },
  // PAGO COM SANGUE (Balu — o pomo de pantera cravado no peito; Juan — o corte masoquista): prep.selfCost tira essa
  // fração da vida de quem usa (nunca abaixo de 1) e o sangue escorre do peito durante a preparação
  bloodPact(f, world, sp) {
    const P = sp.prepare;
    const hp = Math.round(f.maxHealth * (P.selfCost ?? 0.04));
    f.health = Math.max(1, f.health - hp);
    world.audio.play('drain', { volume: 0.7, pitch: 0.7 });
    world.fx.burst(f.chestPos(), { count: 36, color: sp.color, speed: 4.5, life: 0.5, size: 0.2, gravity: 8 });
    world.fx.flash(f.chestPos(), { color: sp.color, size: 1.6, life: 0.15 });
    if (P.selfLabel) f.notify(P.selfLabel, true);
    return [world.fx.emitter({ rate: 50, follow: () => f.chestPos(), particle: { color: sp.color, speed: 0.6, up: -0.6, spread: 0.3, life: 0.5, size: 0.12 } })];
  },
  // ANULAR (Gaius — "anulava uma habilidade usada contra ele"): a onda roxa tira os estados ruins dele, apaga os
  // projéteis do adversário por perto e corta a habilidade que o adversário estiver usando
  nullify(f, world, sp) {
    let any = false;
    for (const b of f.buffs) if (NEGATIVE.has(b.type)) { b.time = 0; any = true; }
    for (const p of [...world.projectiles.list]) {
      if (p.owner === f || Math.hypot(p.pos.x - f.pos.x, p.pos.z - f.pos.z) > 9) continue;
      world.fx.burst(p.pos.clone(), { count: 10, color: sp.color, speed: 3, life: 0.3, size: 0.14 });
      world.projectiles.remove(p, true);
      any = true;
    }
    const opp = f.opponent;
    if (opp && opp.state === 'ability' && distXZ(f.pos, opp.pos) < 12) {
      opp.stun(0.5);
      opp.notify('HABILIDADE ANULADA', true);
      any = true;
    }
    if (any) f.notify('ANULADO!', true);
    const c = new THREE.Vector3(f.pos.x, 1, f.pos.z);
    world.fx.distort(c, { color: sp.color, radius: 3.2, life: 0.45 });
    for (let i = 0; i < 3; i++) world.after(i * 0.09, () => world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: sp.color, radius: 1.2 + i * 1.1, life: 0.4 }));
    world.audio.play('fearGaze', { volume: 0.7, pitch: 0.6 });
    return [world.fx.emitter({ rate: 60, follow: () => f.chestPos(), particle: { color: sp.color, speed: 1.0, up: 1.2, spread: 0.6, life: 0.45, size: 0.2 } })];
  },
};

// os estados ruins que o Anular do Gaius desfaz (os mesmos que o Mateo fecha — abilities.js CLEANSE)
const NEGATIVE = new Set(['bleed', 'noHeal', 'dying', 'aging', 'burn', 'blind', 'deaf', 'ritualWeak', 'curseSlow', 'lodoWeak', 'withered', 'deathMark', 'impaled', 'grabSlow', 'chaosSlow']);

// a ARMADILHA DE URSO (Aguiar) que se fecha no pé do alvo durante a cena: duas mandíbulas dentadas que sobem e travam
// a MINA DE PROXIMIDADE (Chico): o disco verde-oliva com a luz vermelha piscando no pé do alvo
function proximityMine(world, pos) {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0x3e4a2e, metalness: 0.4, roughness: 0.6 });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.07, 14), body));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 10), new THREE.MeshStandardMaterial({ color: 0x24282a, metalness: 0.7, roughness: 0.4 }));
  cap.position.y = 0.05;
  g.add(cap);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2020 }));
  led.position.set(0.1, 0.05, 0);
  g.add(led);
  let t = 0;
  led.onBeforeRender = () => { t++; led.material.color.setHex(t % 20 < 10 ? 0xff2020 : 0x300404); };
  g.position.set(pos.x, 0.035, pos.z);
  world.scene.add(g);
  return { pos: g.position.clone(), stop() { world.scene.remove(g); } };
}

function snapTrap(world, pos) {
  const mesh = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0x6a6460, metalness: 0.8, roughness: 0.45 });
  mesh.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 10), steel));
  const jaws = [];
  for (const s of [-1, 1]) {
    const jaw = new THREE.Group();
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 4, 18, Math.PI), steel);
    arc.rotation.x = -Math.PI / 2;
    jaw.add(arc);
    for (let k = 1; k < 8; k++) {
      const ang = (k / 8) * Math.PI;
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 4), steel);
      tooth.position.set(Math.cos(ang) * 0.34, 0.04, -Math.sin(ang) * 0.34);
      jaw.add(tooth);
    }
    jaw.rotation.order = 'YXZ';
    jaw.rotation.y = s > 0 ? 0 : Math.PI;
    mesh.add(jaw);
    jaws.push(jaw);
  }
  mesh.position.set(pos.x, 0.03, pos.z);
  world.scene.add(mesh);
  let shut = 0;
  return {
    update(dt) { shut = Math.min(1.45, shut + dt * 20); for (const j of jaws) j.rotation.x = -shut; },
    stop() { world.scene.remove(mesh); mesh.traverse((o) => o.geometry && o.geometry.dispose()); steel.dispose(); },
  };
}

function buildShots(kind, f, opp, sp) {
  const firstHit = sp.hits[0].t;
  const finalHit = sp.hits[sp.hits.length - 1].t;
  const shots = [];
  if (kind === 'claw') {
    // aproximação no braço com a garra, depois no rosto (nome aparece), golpes
    shots.push(socketClose(f, () => f.rig.joints.eR.getWorldPosition(new THREE.Vector3()), { dur: 0.45, dist: 1.6, side: 0.9 }));
    shots.push(faceClose(f, { dur: firstHit - 0.45, from: 1.8, to: 1.2, side: -0.4 }));
  } else if (kind === 'control') {
    // o alvo dominado: por cima do ombro do Gal, olhando o alvo ajoelhar sob o sigilo, até o primeiro corte
    const firstReal = (sp.hits.find((h) => !h.noHit) || sp.hits[0]).t;
    shots.push(overShoulder(f, opp, { dur: firstReal * 0.55, back: 2.0, side: 2.2, height: 2.0, fov: 48 }));
    // na altura da cabeça de verdade: o Carniçal é bem mais alto que o padrão de 1,55 m e o plano cortava o rosto
    const faceH = f.rig.sockets.head.getWorldPosition(new THREE.Vector3()).y - f.pos.y - 0.1;
    shots.push(faceClose(f, { dur: firstReal * 0.45, from: 1.7 + (faceH - 1.55), to: 1.25 + (faceH - 1.55), side: 0.4, height: faceH }));
    const mid2 = finalHit - firstReal;
    shots.push(twoShot(f, opp, { dur: mid2 * 0.6, dist: 3.6, push: 0.5, side: 1 }));
    shots.push(lowAngle(f, { dur: mid2 * 0.4, dist: 3.0, side: 1.6 }));
    shots.push(pullBack(f, opp, { dur: sp.length - finalHit + 0.1, from: 2.4, to: 5.5, height: 1.8, side: -1 }));
    return shots;
  } else {
    shots.push(faceClose(f, { dur: firstHit, from: 2.0, to: 1.25, side: 0.45 }));
  }
  const mid = finalHit - firstHit;
  // ENXAME (rajadas longas, o pássaro; docs/REFERENCIAS-ANIMACAO.md §3): a câmera gira em volta do alvo enquanto os
  // tiros/bichos chegam, no lugar do plano lateral e do ombro. `sp.swarmCam` liga ou desliga à mão.
  const swarm = sp.swarmCam ?? sp.hits.some((h) => (h.burst && h.burst.count >= 6) || h.bird);
  if (swarm) {
    shots.push(orbit(opp, { dur: mid * 0.7, radius: 3.4, height: 1.5, a0: -1.3, a1: 1.3, lookH: 1.1, fov: 46 }));
    shots.push(lowAngle(f, { dur: mid * 0.3, dist: 3.2, side: 2.0 }));
    shots.push(pullBack(f, opp, { dur: sp.length - finalHit + 0.1, from: 2.6, to: 6.5, height: 1.8, side: -1 }));
    return shots;
  }
  shots.push(twoShot(f, opp, { dur: mid * 0.4, dist: 4.2, push: 0.8, side: 1 }));
  shots.push(overShoulder(opp, f, { dur: mid * 0.3, back: 1.8, side: 0.9, height: 1.8 }));
  shots.push(lowAngle(f, { dur: mid * 0.3, dist: 3.2, side: 2.0 }));
  shots.push(pullBack(f, opp, { dur: sp.length - finalHit + 0.1, from: 2.6, to: 6.5, height: 1.8, side: -1 }));
  return shots;
}

// uma batida de cena: o som (ex.: fistClang) e, se for o choque dos punhos, faíscas, clarão e a onda de pressão entre
// as duas mãos
function beatFx(f, world, o, sp) {
  world.audio.play(o.beatSound || 'fistClang');
  const a = f.rig.sockets.handL.getWorldPosition(new THREE.Vector3());
  const b = f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
  const p = a.add(b).multiplyScalar(0.5);
  world.fx.flash(p, { color: 0xfff0d0, size: 2.2, life: 0.12 });
  world.fx.burst(p, { count: 26, color: 0xffc070, speed: 6, life: 0.35, size: 0.12, gravity: 6 });
  world.fx.ring(p, { color: sp.color, radius: 1.6, life: 0.3, vertical: true, yaw: f.yaw + Math.PI / 2 });
  world.fx.distort(p, { color: sp.color, radius: 1.4, life: 0.25 });
  world.cameraRig.shake(0.25, 0.12);
}

export const cinematicCombo = {
  canStart: () => true,
  start(f, sp, world) {
    const total = sp.damage ?? COMBAT.specialDamage;
    const parts = splitDamage(total, sp.hits.map((h) => (h.noHit ? 0 : h.share ?? 0))); // passo sem dano vale 0 (sem NaN)
    const prep = sp.prepare || { anim: 'charge', time: 0.3 };
    const dash = sp.dash || { speed: 22, maxTime: 0.45, contact: 1.7 };
    let phase = 'prepare';
    let dashAt = 0; // quando a investida saiu (para a esquiva durante ela)
    let t = 0;
    let tl = null;
    let emitters = [];
    let propShown = false;
    let opp = f.opponent;

    f.vel.set(0, 0, 0);
    f.anim.play(prep.anim, prep.loop ? { restart: true } : { restart: true, duration: prep.time });
    // a bateria surge na frente dele (prep.kit) e voa longe quando ele chuta (step.smash)
    let kit = null;
    let kitFly = null;
    if (prep.kit && PREP_KITS[prep.kit]) {
      kit = PREP_KITS[prep.kit]();
      kit.position.set(f.pos.x, f.pos.y, f.pos.z);
      kit.rotation.y = f.opponent ? yawTo(f.pos, f.opponent.pos) : f.yaw;
      world.scene.add(kit);
      world.fx.burst(kit.localToWorld(new THREE.Vector3(0, 0.6, 0.6)), { count: 24, color: 0x2a2226, kind: 'smoke', speed: 1.6, life: 0.5, size: 0.6, grow: 1 });
    }
    // a preparação em cena: o mundo congela (world.cinematic sem alvo) e a câmera fica nele até sair a investida
    let prepCine = false;
    const pulses = []; // peças da bateria tremendo na batida (o mundo congelado não roda world.after)
    if (prep.shots && PREP_SHOTS[prep.shots] && !world.cinematic) {
      prepCine = true;
      world.beginCinematic(f, null);
      world.cameraRig.playShots(PREP_SHOTS[prep.shots](f));
    }
    const endPrepCine = () => { if (prepCine) { prepCine = false; if (world.cinematic && world.cinematic.actor === f) world.endCinematic(); } };
    const removeKit = () => { if (kit) { world.scene.remove(kit); kit = null; kitFly = null; } };
    world.audio.play(sp.sound || 'specialStart');
    if (prep.fx && PREP_FX[prep.fx]) emitters = PREP_FX[prep.fx](f, world, sp);
    if (!sp.physical) world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: sp.color, radius: 3, life: 0.5 });

    // corrente da aproximação (approach: 'chain')
    let chainFx = null;
    let tip = null;
    let pullFrom = null;
    const hitChains = [];
    let copies = []; // sp.copies: cópias ilusórias em volta do alvo (Guizo — Registro do Outro Lado)
    let sphere = null; // sp.sphere: esfera que prende os dois durante a cena (Magistrada — Prisão das Sombras)
    let trap = null; // h.trap: a armadilha de urso no pé do alvo
    let xMark = null; // h.xMark: o X no chão
    let hidden = false; // h.vanish: sumido
    let mine = null; // h.mine: a mina no chão
    let bird = null; // h.bird: o pássaro voando (a peça do ombro volta no fim)
    let propSwaps = []; // h.props: peças trocadas no meio da cena (a faca do Johnny no fim do especial do Rubens)
    const ownStrike = (i) => opp.def.melee?.strikes?.[i]?.anim || 'hit';
    const cleanup = () => {
      removeKit();
      endPrepCine();
      if (mine) { mine.stop(); mine = null; }
      if (sphere) { world.scene.remove(sphere.group); sphere = null; }
      if (trap) { trap.stop(); trap = null; }
      if (xMark) { const m = xMark; xMark = null; world.after(1.2, () => m.dispose()); }
      if (hidden) { f.setVisible(true); hidden = false; }
      if (f.riding) f.mount(false);
      copies.forEach((c) => c.alive && c.shatter(sp.copies.color ?? sp.color));
      copies = [];
      emitters.forEach((e) => e.stop());
      emitters = [];
      propSwaps.reverse().forEach(([p, v]) => { if (!(p === 'maskOn' && !v && (f.findBuff('mask') || f.findBuff('awakened')?.keepProps?.includes('maskOn')))) f.rig.showProp(p, v); });
      propSwaps = [];
      if (bird) { bird.dispose(); f.orpheuOut = false; if (f.state !== 'ko') f.rig.showProp(bird.props, true); bird = null; }
      // a peça some no fim — a não ser que um estado ativo a mantenha (ex.: máscara do Aguiar)
      if (sp.prepare?.showProp && !(sp.prepare.keepIfBuff && f.findBuff(sp.prepare.keepIfBuff))) {
        f.rig.showProp(sp.prepare.showProp, false);
        if (sp.prepare.hideProp) f.rig.showProp(sp.prepare.hideProp, true); // troca de volta (ex.: maça do Balu → machado)
      }
      if (chainFx) { chainFx.stop(); chainFx = null; }
      hitChains.forEach((c) => c.stop());
      hitChains.length = 0;
    };
    const handPos = (s = 'handR') => f.rig.sockets[s].getWorldPosition(new THREE.Vector3());
    const feet = () => new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z);

    // o que acontece no começo de um passo (com ou sem dano)
    const stepFx = (h) => {
      if (h.shout) f.notify(h.shout, true);
      if (h.props) for (const [p, v] of h.props) { f.rig.showProp(p, v); propSwaps.push([p, !v]); }
      // o Voo do Orpheu já no ar: o pássaro é um só (não sai outro do ombro vazio)
      if (h.bird && !bird && !f.orpheuOut) { f.rig.showProp(h.bird.props, false); f.orpheuOut = true; bird = flyBird(world, f, opp); bird.props = h.bird.props; }
      if (h.vanish) {
        // some numa fumaça e volta depois de h.vanish s (Jae — Shhh...)
        world.fx.burst(f.chestPos(), { count: 22, color: 0x0a0608, kind: 'smoke', speed: 2, life: 0.5, size: 0.6, grow: 1 });
        world.audio.play('blink', { volume: 0.7 });
        f.setVisible(false);
        hidden = true;
        tl.add(h.t + h.vanish, () => { f.setVisible(true); hidden = false; world.fx.burst(f.chestPos(), { count: 18, color: 0x0a0608, kind: 'smoke', speed: 2, life: 0.45, size: 0.5, grow: 1 }); });
      }
      if (h.closeIn) {
        // vem colado no alvo (a investida tomada pelo ódio): um rastro de poeira no caminho
        const F = forwardFromYaw(yawTo(f.pos, opp.pos));
        const from = f.chestPos();
        f.pos.set(opp.pos.x - F.x * 1.15, f.pos.y, opp.pos.z - F.z * 1.15);
        f.yaw = yawTo(f.pos, opp.pos);
        world.fx.tracer(from, f.chestPos(), { color: sp.color, life: 0.25, width: 0.25 });
        world.fx.burst(new THREE.Vector3(f.pos.x, 0.2, f.pos.z), { count: 14, color: 0x9a8a72, kind: 'smoke', speed: 2, up: 0.6, life: 0.5, size: 0.6, grow: 1 });
      }
      if (h.selfStrike != null && opp.state !== 'ko') opp.anim.play(ownStrike(h.selfStrike), { restart: true, duration: h.dur, blend: 0.04 });
      if (h.tears) {
        const head = () => opp.rig.joints.hd.getWorldPosition(new THREE.Vector3());
        emitters.push(world.fx.emitter({ rate: 28, follow: head, particle: { color: 0x0a0810, speed: 0.4, spread: 0.12, life: 0.6, size: 0.08 } }));
      }
      if (h.rage) {
        emitters.push(world.fx.emitter({ rate: 22, follow: () => f.chestPos(), particle: { color: h.rage === true ? 0xd01a1a : h.rage, speed: 0.6, up: 1.4, spread: 0.5, life: 0.6, size: 0.3 } }));
        world.fx.burst(f.chestPos(), { count: 30, color: 0xd01a1a, speed: 4, life: 0.5, size: 0.2 });
        world.audio.play('drain', { volume: 0.6, pitch: 0.7 });
      }
      if (h.burst) {
        const B = h.burst;
        for (let k = 0; k < (B.count ?? 8); k++) {
          tl.add(h.t + 0.08 + k * (B.gap ?? 0.07), () => {
            if (opp.state === 'ko') return;
            const from = f.rig.muzzle ? f.rig.muzzle.getWorldPosition(new THREE.Vector3()) : handPos();
            const to = opp.chestPos().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4));
            world.fx.tracer(from, to, { color: 0xffd27a, life: 0.06, width: 0.03 });
            world.fx.flash(from, { color: 0xffd27a, size: 0.5, life: 0.05 });
            world.fx.burst(to, { count: 3, color: 0xd8d4cc, speed: 2, life: 0.2, size: 0.06 });
            world.audio.play(B.sound || 'm4', { volume: 0.45 });
          });
        }
      }
      if (h.smoke) {
        // a granada de fumaça: o arco até o alvo e a nuvem cinza que o engole
        const from = handPos();
        const to = opp.chestPos();
        world.fx.tracer(from, to, { color: 0x6a6e66, life: 0.25, width: 0.06 });
        tl.add(h.t + 0.25, () => {
          world.fx.burst(to, { count: 40, color: 0x8a8c86, kind: 'smoke', speed: 2.2, up: 1, life: 1.6, size: 1.4, grow: 1.4 });
          world.audio.play('shockwave', { volume: 0.5, pitch: 1.6 });
          if (opp.state !== 'ko') opp.notify('FUMAÇA!', true);
        });
      }
      if (h.mine && !mine) {
        mine = proximityMine(world, feet());
        world.audio.play('ready', { volume: 0.7, pitch: 1.8 });
      }
      if (h.behind) {
        // reaparece nas costas do alvo, de frente para ele (o alvo continua olhando para onde estava)
        const B = forwardFromYaw(opp.yaw);
        world.fx.burst(f.chestPos(), { count: 14, color: sp.color, speed: 3, life: 0.3, size: 0.2 });
        f.pos.set(opp.pos.x - B.x * 1.1, f.pos.y, opp.pos.z - B.z * 1.1);
        f.yaw = yawTo(f.pos, opp.pos);
        world.fx.burst(f.chestPos(), { count: 14, color: sp.color, speed: 3, life: 0.3, size: 0.2 });
      }
    };
    // o que um golpe que acertou faz além do dano
    const hitExtras = (h, dealt) => {
      if (h.call && opp.state !== 'ko') opp.notify(h.call, true);
      if (h.quake) {
        const p = feet();
        world.fx.play('FX_DUST', p, { scale: 1.4 });
        for (let i = 0; i < 2; i++) world.after(i * 0.08, () => world.fx.ring(p, { color: h.quake === true ? sp.color : h.quake, radius: 1.6 + i * 1.4, life: 0.4 }));
        world.fx.burst(p.clone().setY(0.2), { count: 26, color: 0x6a5a48, speed: 5, up: 3, life: 0.6, size: 0.16, gravity: 12 });
        world.cameraRig.shake(0.45, 0.25);
      }
      if (h.pressure) {
        const p = opp.chestPos();
        world.fx.distort(p, { color: sp.color, radius: 1.8, life: 0.3 });
        world.fx.ring(p, { color: sp.color, radius: 1.3, life: 0.28, vertical: true, yaw: f.yaw });
      }
      if (h.trap && !trap) { trap = snapTrap(world, feet()); world.audio.play('trapSnap'); world.fx.burst(feet().setY(0.3), { count: 26, color: 0x9a0010, speed: 4, up: 1.5, life: 0.6, size: 0.2, gravity: 8 }); }
      if (h.boom) {
        // a mina explode embaixo do alvo
        const p = mine ? mine.pos.clone().setY(0.5) : feet().setY(0.5);
        if (mine) { mine.stop(); mine = null; }
        world.fx.play('FX_EXPLOSION', p, { color: 0xffa040, scale: 1.6 });
        world.fx.burst(p, { count: 40, color: 0x3a3634, kind: 'smoke', speed: 3, up: 2.5, life: 1.2, size: 1.4, grow: 1 });
        world.fx.burst(p, { count: 30, color: 0x6a5a48, speed: 6, up: 4, life: 0.7, size: 0.14, gravity: 12 });
        world.audio.play('explosion', { volume: 0.9 });
        world.cameraRig.shake(0.8, 0.4);
      }
      if (h.xMark && !xMark) { xMark = groundMark(world, feet(), h.xMark, sp.color, 0.85); world.audio.play('ritual', { volume: 0.5, pitch: 1.3 }); }
      if (h.consume) {
        // a Espada Consumidora bebe a energia: o Lodo corre do alvo até a lâmina
        const n = opp.drainEnergy(h.consume);
        f.addEnergy(n);
        const from = opp.chestPos();
        const to = handPos();
        world.fx.tracer(from, to, { color: 0x14100c, life: 0.3, width: 0.08 });
        world.fx.burst(to, { count: 14, color: 0x2a221a, kind: 'smoke', speed: 1, life: 0.5, size: 0.35, grow: 1 });
      }
      if (h.stream && typeof dealt === 'number' && dealt > 0) {
        // o sangue do alvo corre até quem bate (Faca Predadora / Vínculo de Sangue)
        world.fx.tracer(opp.chestPos(), f.chestPos(), { color: h.stream === true ? sp.color : h.stream, life: 0.28, width: 0.05 });
      }
    };

    const beginCinematic = () => {
      phase = 'cinematic';
      world.beginCinematic(f, opp);
      // posiciona os dois frente a frente
      const yaw = yawTo(f.pos, opp.pos);
      f.yaw = yaw;
      opp.yaw = yawTo(opp.pos, f.pos);
      const F = forwardFromYaw(yaw);
      f.pos.set(opp.pos.x - F.x * (sp.standOff ?? 1.15), opp.pos.y, opp.pos.z - F.z * (sp.standOff ?? 1.15));
      if (f.riding) f.mount(false);
      f.anim.play('idle', { restart: true, blend: 0.05 });
      opp.anim.play('hit', { restart: true });
      world.cameraRig.playShots(buildShots(sp.shots, f, opp, sp));
      if (sp.sphere) sphere = shadowSphere(world, f, opp, sp.sphere);

      tl = new Timeline();
      tl.add(sp.bannerAt ?? 0.1, () => world.specialBanner(f, sp, f.def.name));
      if (sp.tether) {
        tl.add(sp.tether.at ?? 0, () => {
          const hands = sp.tether.hands === 'both' ? ['handL', 'handR'] : [sp.tether.hands === 'R' ? 'handR' : 'handL'];
          for (const s of hands) hitChains.push(world.fx.chain(() => handPos(s), () => opp.chestPos(), chainLook(sp.tether, { links: 18, sag: 0.08 })));
          world.audio.play('chainPull', { volume: 0.6 });
        });
      }
      sp.hits.forEach((h, i) => {
        // momento de cena sem dano (ex.: o Colosso batendo um punho no outro antes da sequência)
        if (h.noHit) {
          tl.add(h.t, () => {
            stepFx(h);
            f.anim.play(h.anim, { restart: true, duration: h.dur, blend: 0.04 });
            if (h.victimAnim && opp.state !== 'ko') opp.anim.play(h.victimAnim, { restart: true, blend: 0.06 });
            if (h.sigil) controlSigil(world, opp, sp, emitters);
          });
          for (const b of h.beats || []) tl.add(h.t + b, () => beatFx(f, world, h, sp));
          return;
        }
        tl.add(h.t, () => {
          stepFx(h);
          f.anim.play(h.anim, { restart: true, duration: h.dur, blend: 0.04 });
          world.audio.play('swing', { volume: 0.7 });
          // o golpe já é sabido antes de acontecer: um lampejo dourado marca onde a lâmina vai entrar
          if (h.foresee) {
            const p = opp.chestPos();
            world.fx.flash(p, { color: sp.color, size: 0.9, life: 0.1 });
            world.fx.ring(p, { color: sp.color, radius: 0.45, life: 0.18, vertical: true, yaw: f.yaw + Math.PI / 2 });
          }
        });
        tl.add(h.t + h.dur * 0.4, () => {
          const dealt = applyHit(world, f, opp, {
            damage: parts[i], kind: 'special', reaction: false, ignoreInvuln: true,
            sound: h.sound, color: sp.color, scale: h.final ? 2 : 1.2,
            applyMeleePassives: !!sp.applyMeleePassives,
            strike: sp.applyMeleePassives ? { damage: parts[i], heal: Math.floor(parts[i] * 0.3) } : undefined,
          });
          specialHitFx(world, f, opp, h.fx, sp.color);
          // pose de impacto segurada: 3 quadros nos golpes, 5 no último (o h.hold do golpe manda, 0 desliga)
          const hold = h.hold ?? sp.poseHold ?? (h.final ? 0.085 : 0.05);
          if (hold > 0) { f.poseHold = hold; if (opp.state !== 'ko') opp.poseHold = hold; }
          // h.drain (o Banquete de Sangue do Raziel): a mordida cura uma fração do que tirou
          if (h.drain && typeof dealt === 'number' && dealt > 0) {
            f.health = Math.min(f.maxHealth, f.health + Math.round(dealt * h.drain));
            world.fx.burst(f.chestPos(), { count: 10, color: 0xff3040, speed: 1.2, up: 1.4, life: 0.5, size: 0.12 });
          }
          // h.gore (o Banquete Bestial): a mordida que devora — o sangue jorra do pescoço e a cena treme
          if (h.gore) {
            const neck = opp.rig.joints.hd ? opp.rig.joints.hd.getWorldPosition(new THREE.Vector3()) : opp.chestPos();
            world.fx.burst(neck, { count: 44, color: sp.color, speed: 5, life: 0.6, size: 0.16, gravity: 9 });
            world.fx.burst(neck, { count: 10, color: 0x2a0408, kind: 'smoke', speed: 1.2, life: 0.7, size: 0.5, grow: 1 });
            world.audio.play('drain', { volume: 0.7, pitch: 0.6 });
            world.cameraRig.shake(0.3, 0.15);
          }
          if (h.bleed && opp.state !== 'ko') opp.applyBleed(h.bleed, f); // ex.: Hemorragia Severa (Juan)
          hitExtras(h, dealt);
          if (h.fx && h.fx.chain) {
            // correntes aparecem fisicamente durante o golpe
            const sides = h.fx.chain === 'both' ? ['handR', 'handL'] : [h.fx.chain === 'L' ? 'handL' : 'handR'];
            for (const s of sides) {
              const c = world.fx.chain(() => handPos(s), () => opp.chestPos(), { links: 14, sag: 0.05 });
              hitChains.push(c);
              world.after(0.35, () => c.stop());
            }
            world.audio.play('chainPull', { volume: 0.6 });
          }
          // no golpe que ele mesmo dá (selfStrike) o alvo continua no próprio golpe
          if (opp.state !== 'ko' && (h.selfStrike == null || h.final)) opp.anim.play(h.victimAnim || (h.final ? 'launched' : 'hit'), { restart: true, blend: 0.02 });
          // empurra um pouco e acompanha
          const F2 = forwardFromYaw(f.yaw);
          const push = h.push ?? (h.final ? 0.6 : 0.18);
          opp.pos.addScaledVector(F2, push);
          f.pos.addScaledVector(F2, push * 0.8);
          if (h.final) world.cameraRig.shake(0.6, 0.35);
        });
      });
      // sp.copies: as cópias surgem em volta do alvo e IMITAM cada golpe dele (o Embaralhar no especial); somem juntas
      if (sp.copies) {
        const C = sp.copies;
        tl.add(C.at ?? 0.3, () => {
          // espalhadas no lado do alvo OPOSTO à câmera (uma cópia entre a câmera e a luta tampava a cena)
          const cam = world.camera ? world.camera.position : f.pos;
          const away = yawTo(cam, opp.pos);
          const n = C.count ?? 3;
          for (let k = 0; k < n; k++) {
            const ang = away + (n > 1 ? (k / (n - 1) - 0.5) * Math.PI * 1.1 : 0);
            const pos = new THREE.Vector3(opp.pos.x + Math.sin(ang) * (C.radius ?? 1.2), f.pos.y, opp.pos.z + Math.cos(ang) * (C.radius ?? 1.2));
            const c = new HoloCopy(f, world, { mode: 'anchor', pos, yaw: yawTo(pos, opp.pos), life: (C.until ?? sp.length) - (C.at ?? 0.3), color: C.color ?? sp.color, opacity: 0.45 });
            world.addNpc(c);
            world.fx.burst(new THREE.Vector3(pos.x, 1, pos.z), { count: 16, color: C.color ?? sp.color, speed: 3, life: 0.35, size: 0.12 });
            copies.push(c);
          }
          world.audio.play('blink', { volume: 0.8 });
        });
        tl.add(C.until ?? sp.length, () => { copies.forEach((c) => c.alive && c.shatter(C.color ?? sp.color)); copies = []; });
      }
      // sp.outro: pose depois do último golpe (ex.: o Guizo confere a câmera)
      if (sp.outro) tl.add(sp.outro.t, () => f.anim.play(sp.outro.anim, { restart: true, duration: sp.outro.dur ?? 0.8 }));
      tl.add(sp.length, () => {});
      tl.end(sp.length);
    };

    return {
      update(dt) {
        if (sphere) sphere.update(dt);
        for (let i = pulses.length - 1; i >= 0; i--) if ((pulses[i].t -= dt) <= 0) { pulses[i].o.scale.setScalar(1); pulses.splice(i, 1); }
        if (kitFly) {
          kitFly.t += dt;
          for (const p of kitFly.parts) {
            p.v.y -= 14 * dt;
            p.o.position.addScaledVector(p.v, dt);
            if (p.o.position.y < 0.05 && p.v.y < 0) { p.o.position.y = 0.05; p.v.multiplyScalar(0.4); p.v.y = Math.abs(p.v.y) * 0.5; }
            p.o.rotation.x += p.spin.x * dt;
            p.o.rotation.z += p.spin.z * dt;
          }
          if (kitFly.t > 1.6) removeKit();
        }
        if (bird) bird.step(dt);
        if (trap) trap.update(dt);
        t += dt;
        if (phase === 'prepare') {
          opp = f.opponent;
          // batidas da preparação (prep.beats: segundos) — ex.: o CLANG das Manoplas
          for (const b of prep.beats || []) if (t - dt < b && t >= b) beatFx(f, world, prep, sp);
          // prep.drums: [[t, peça]] — cada batida da baqueta na bateria (som da peça, lampejo e a peça tremendo)
          if (kit && !kitFly) {
            for (const [b, name] of prep.drums || []) {
              if (!(t - dt < b && t >= b)) continue;
              const pt = kit.userData.hit[name];
              if (!pt) continue;
              const p = pt.getWorldPosition(new THREE.Vector3());
              world.audio.play(DRUM_SOUND[name] || 'drumSnare', { volume: 0.8 });
              world.fx.flash(p, { color: name === 'crash' ? 0xffe08a : 0xfff0d0, size: name === 'crash' ? 1.4 : 0.7, life: 0.08 });
              world.fx.burst(p, { count: name === 'crash' ? 18 : 6, color: name === 'crash' ? 0xffd27a : sp.color, speed: 3, up: 1.5, life: 0.3, size: 0.08, gravity: 6 });
              const piece = pt.parent;
              if (piece && piece !== kit) { piece.scale.setScalar(1.08); pulses.push({ o: piece, t: 0.07 }); }
              if (name === 'crash' || name === 'kick') world.cameraRig.shake(0.12, 0.08);
            }
          }
          // prep.steps: a cena da preparação (anim, grito, raiva, chute na bateria)
          for (const st of prep.steps || []) {
            if (!(t - dt < st.t && t >= st.t)) continue;
            stepFx(st);
            if (st.anim) f.anim.play(st.anim, st.dur ? { restart: true, duration: st.dur } : { restart: true });
            if (st.sound) world.audio.play(st.sound);
            if (st.smash && kit && !kitFly) {
              const F = forwardFromYaw(kit.rotation.y);
              kitFly = { t: 0, parts: kit.userData.pieces.map((o) => ({ o, v: new THREE.Vector3(F.x * (5 + Math.random() * 4) + (Math.random() - 0.5) * 4, 3 + Math.random() * 4, F.z * (5 + Math.random() * 4) + (Math.random() - 0.5) * 4), spin: new THREE.Vector3((Math.random() - 0.5) * 16, 0, (Math.random() - 0.5) * 16) })) };
              world.audio.play('drumCrash');
              world.audio.play('heavyPunch', { volume: 0.8, pitch: 0.7 });
              world.fx.burst(kit.localToWorld(new THREE.Vector3(0, 0.5, 0.7)), { count: 30, color: 0x7a0e14, speed: 6, up: 3, life: 0.5, size: 0.12, gravity: 10 });
              world.cameraRig.shake(0.4, 0.2);
            }
          }
          if (opp) f.yaw = yawTo(f.pos, opp.pos);
          if (prep.showProp && !propShown && t >= (prep.showAt ?? prep.time * 0.55)) {
            propShown = true;
            f.rig.showProp(prep.showProp, true);
            if (prep.hideProp) f.rig.showProp(prep.hideProp, false); // a peça nova ocupa o lugar da antiga
            const p = (prep.showProp === 'maskOn' ? f.rig.joints.hd : f.rig.joints['e' + (prep.arm || 'R')]).getWorldPosition(new THREE.Vector3());
            world.fx.burst(p, { count: 40, color: sp.color, speed: 5, life: 0.5, size: 0.3 });
            world.fx.flash(p, { color: sp.color, size: 2, life: 0.15 });
          }
          if (t >= prep.time) {
            t = 0;
            endPrepCine();
            if (sp.approach === 'chain') {
              // 1: lança a lâmina presa à corrente
              phase = 'chain';
              tip = handPos();
              chainFx = world.fx.chain(() => handPos(), () => tip.clone(), chainLook(sp.chain, { links: 32, sag: 0.06 }));
              f.anim.play('chain_throw', { restart: true, duration: 0.4 });
              world.audio.play('chainThrow');
            } else {
              phase = 'dash';
              dashAt = world.inputTime;
              if (dash.ride && f.def.mount) f.mount(true);
              f.anim.play(dash.anim || 'dash', { restart: true });
            }
          }
          return false;
        }
        if (phase === 'chain') {
          const c = sp.chain || { speed: 60, range: 16 };
          if (!opp || opp.state === 'ko') { cleanup(); return true; }
          f.yaw = yawTo(f.pos, opp.pos);
          const goal = opp.chestPos();
          const dir = goal.clone().sub(tip);
          const step = c.speed * dt;
          const tooFar = tip.distanceTo(handPos()) > c.range;
          if (dir.length() <= step + 0.35 && !tooFar) {
            if (opp.isInvulnerable() && opp.state !== 'grabbed') {
              phase = 'whiff';
              t = 0;
              cleanup();
              return false;
            }
            if (trySpecialBlock(world, f, opp, sp)) { cleanup(); return true; }
            // 2–3: prende e puxa o adversário para perto
            phase = 'pull';
            t = 0;
            pullFrom = opp.pos.clone();
            world.beginCinematic(f, opp);
            opp.anim.play('launched', { restart: true, duration: 0.4 });
            f.anim.play('chain_pull', { restart: true, duration: 0.4 });
            world.audio.play('chainPull');
            world.fx.burst(goal, { count: 20, color: sp.color, speed: 5, life: 0.35, size: 0.22 });
            chainFx.toFn = () => opp.chestPos();
            return false;
          }
          if (tooFar || t > 0.8) { phase = 'whiff'; t = 0; cleanup(); return false; }
          tip.addScaledVector(dir.normalize(), step);
          return false;
        }
        if (phase === 'pull') {
          const k = Math.min(1, t / 0.32);
          const F = forwardFromYaw(f.yaw);
          const to = new THREE.Vector3(f.pos.x + F.x * 1.15, opp.pos.y, f.pos.z + F.z * 1.15);
          opp.pos.lerpVectors(pullFrom, to, k);
          if (k >= 1) {
            if (chainFx) { chainFx.stop(); chainFx = null; }
            world.endCinematic();
            beginCinematic();
          }
          return false;
        }
        if (phase === 'dash') {
          if (!opp || opp.state === 'ko') { cleanup(); return true; }
          f.yaw = yawTo(f.pos, opp.pos);
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * dash.speed;
          f.vel.z = F.z * dash.speed;
          if (sp.physical) world.fx.burst(new THREE.Vector3(f.pos.x, 0.2, f.pos.z), { count: 2, color: 0x9a8a72, kind: 'smoke', speed: 1, up: 0.4, life: 0.45, size: 0.5, grow: 1 });
          else world.fx.burst(f.chestPos(), { count: 2, color: sp.color, speed: 1, life: 0.3, size: 0.4 });
          const d = distXZ(f.pos, opp.pos);
          const reachable = Math.abs(opp.pos.y - f.pos.y) < 1.8 && opp.visible;
          if (d <= dash.contact && reachable) {
            f.vel.set(0, 0, 0);
            // esquivou (ou usou a Substituição) na chegada ou DURANTE a investida: o especial erra e a esquiva gasta a
            // carga. A investida persegue, então só a invulnerabilidade não bastava (acabava antes do contato, e a do
            // Carniçal é mais lenta que a esquiva). Vale também a janela do aviso (telegraph.js) logo antes da saída.
            // Caído continua sendo pego, como antes.
            const ev = opp.lastEvadeAt;
            const evaded = ev !== undefined && (ev >= dashAt || world.inputTime - ev <= TELEGRAPH.evadeWindow);
            if ((opp.invuln > 0 || evaded) && opp.state !== 'grabbed' && opp.state !== 'downed') {
              if (opp.state === 'dodge' && opp.dodge) opp.dodge.threat = true;
              phase = 'whiff';
              t = 0;
              f.anim.play('idle', { restart: true });
              return false;
            }
            if (trySpecialBlock(world, f, opp, sp)) { cleanup(); return true; }
            beginCinematic();
            return false;
          }
          if (t >= dash.maxTime) {
            // errou: recupera sem causar dano
            f.vel.set(0, 0, 0);
            phase = 'whiff';
            t = 0;
            f.anim.play('idle', { restart: true });
          }
          return false;
        }
        if (phase === 'whiff') {
          if (t >= 0.45) { cleanup(); return true; }
          return false;
        }
        if (phase === 'cinematic') {
          const done = tl.update(dt);
          if (done) {
            cleanup();
            world.endCinematic();
            if (opp.state !== 'ko') {
              const er = sp.endReaction || {};
              if (er.stun) opp.react({ dir: forwardFromYaw(f.yaw), knockback: er.knockback ?? 0, stun: er.stun });
              else opp.react({ dir: forwardFromYaw(f.yaw), knockback: er.knockback ?? 8, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: !!er.lowLaunch });
              afterScene(world, f, opp, sp);
            }
            f.anim.play('idle', { blend: 0.15 });
            return true;
          }
          return false;
        }
        return true;
      },
      cancel() {
        cleanup();
        if (phase === 'cinematic' || phase === 'pull') world.endCinematic();
      },
    };
  },
};

// CONTROLE MENTAL (Gal — Injustiça): o sigilo dourado sobre a cabeça do alvo, como na habilidade, até o fim da cena
// (as partículas entram na lista de emissores do especial, que o cleanup para)
function controlSigil(world, opp, sp, emitters) {
  const head = () => opp.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.45, 0));
  world.fx.ring(head(), { color: sp.color, radius: 0.6, life: 0.6, vertical: false });
  world.fx.flash(head(), { color: sp.color, size: 1.2, life: 0.15 });
  emitters.push(world.fx.emitter({ rate: 34, follow: head, particle: { color: sp.color, speed: 0.3, spread: 0.3, life: 0.4, size: 0.12 } }));
  world.audio.play('fearGaze', { pitch: 1.3 });
}

// PRISÃO DAS SOMBRAS (Magistrada): uma esfera de sombra em volta dos dois — por fora quase preta, por dentro os Sigilos
// dourados girando (a "esfera de Conhecimento" da wiki onde ficam só os dois se enfrentando). Cresce no começo e gira
// com a cena (atualizada por um ticker até ser removida).
function shadowSphere(world, f, opp, o = {}) {
  const group = new THREE.Group();
  const c = f.pos.clone().lerp(opp.pos, 0.5);
  group.position.set(c.x, 0, c.z);
  const R = o.radius ?? 3.2;
  const shell = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 20), new THREE.MeshBasicMaterial({ color: o.color ?? 0x0c0812, transparent: true, opacity: 0.0, side: THREE.BackSide, depthWrite: false }));
  shell.position.y = R * 0.55;
  group.add(shell);
  const gold = new THREE.MeshBasicMaterial({ color: o.sigil ?? 0xe0b84a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R * (0.92 - i * 0.04), 0.03, 6, 64), gold);
    ring.position.y = R * 0.55;
    ring.rotation.set(Math.PI / 2 + i * 0.6, i * 1.1, 0);
    group.add(ring);
    rings.push(ring);
  }
  const glyphs = [];
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.2, 3), gold);
    const a = (i / 14) * Math.PI * 2;
    g.position.set(Math.cos(a) * R * 0.85, R * 0.55 + Math.sin(i * 1.7) * R * 0.4, Math.sin(a) * R * 0.85);
    g.lookAt(0, R * 0.55, 0);
    group.add(g);
    glyphs.push(g);
  }
  world.scene.add(group);
  world.fx.distort(new THREE.Vector3(c.x, 1.2, c.z), { color: o.sigil ?? 0xe0b84a, radius: R, life: 0.5 });
  // animada pelo próprio especial (os tickers do mundo param durante a cinemática)
  const state = {
    group,
    t: 0,
    update(dt) {
      state.t += dt;
      const k = Math.min(1, state.t / 0.5);
      shell.material.opacity = 0.82 * k;
      gold.opacity = 0.75 * k;
      rings.forEach((r, i) => { r.rotation.z += dt * (0.6 + i * 0.35) * (i % 2 ? -1 : 1); });
      glyphs.forEach((g, i) => { g.rotation.z += dt * 2; g.position.y += Math.sin(state.t * 2 + i) * dt * 0.2; });
    },
  };
  return state;
}

// a aparência da corrente/corda (approach: 'chain' e sp.tether): o.rope = corda, o.color = cor (ex.: as Amarras de
// Sangue da Lírio, vermelhas)
function chainLook(o = {}, base) {
  const r = { ...base };
  if (o.rope) r.rope = true;
  if (o.color != null) { r.color = o.color; r.glow = o.glow ?? o.color; }
  return r;
}

// o que fica depois da cena (o alvo ainda de pé)
function afterScene(world, f, opp, sp) {
  if (sp.afterBuff) {
    const b = sp.afterBuff;
    opp.addBuff({ ...b, time: b.duration, duration: b.duration });
    opp.notify(b.name, true);
  }
  if (sp.endBlind) blindFighter(world, opp, sp.endBlind);
  // Inteligência Estratégica (Veríssimo): "ao ouvirem a ordem, ganham um ataque extra" — as assistências ficam prontas
  if (sp.orderAllies && f.assists) {
    let ready = 0;
    for (const as of f.assists) if (as && !as.active && as.cooldown > 0) { as.cooldown = 0; ready++; }
    if (ready) f.notify('AGENTES, AGORA!', true);
  }
  if (sp.selfHeal) f.heal(Math.round(f.maxHealth * sp.selfHeal));
}
