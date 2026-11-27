// COOP: CAÍDO, RESGATE E CAIXÃO (pedido do dono, 2026-11-19; tempos e preço: PROPOSTA)
//  · quem cai com o amigo ainda de pé fica no chão MORRENDO: se arrasta bem devagar (pode ir até o amigo) e tem
//    BLEED segundos para ser salvo;
//  · o amigo chega perto e SEGURA o botão de interagir: dá a mão, puxa o caído para cima e, ao levantar, uma aura
//    empurra os inimigos em volta;
//  · o tempo acabou: morre de vez e fica um CAIXÃO onde caiu; a tela volta a ser de um jogador só;
//  · o amigo pode pagar METADE do preço da ressurreição para reviver do caixão — segurando bem mais tempo que o
//    resgate. O caixão abre, sai uma luz de dentro e o jogador volta.
// A sala limpa (ou a próxima sala) ainda põe de pé quem está caído — mas não quem já está no caixão.
// QUEM RESGATA APANHA (dono, 2026-11-20: "o player não toma dano ao salvar um amigo, isso deveria ter mais sentido, porém
// vai ficar muito difícil de reviver com os monstros atacando"; PROPOSTA de equilíbrio):
//  · ao começar a levantar o amigo, um BRADO curto empurra quem estiver colado (recarga própria, não dá para abusar);
//  · segurando, leva só parte do dano (`taken`) e aguenta os primeiros golpes sem soltar (`armor`);
//  · um golpe forte interrompe, mas o PROGRESSO FICA (cai devagar, `decay` por segundo): volte e termine.
import * as THREE from 'three';
import { applyHit } from '../combat/damage.js';
import { resolveBody } from '../combat/positioning.js';
import { actionLabel } from '../ui/labels.js';

export const RESCUE = {
  bleed: 25, // segundos caído antes de morrer de vez
  crawl: 0.5, // m/s se arrastando (o normal anda uns 5)
  reach: 1.7, // distância para o resgate / o caixão
  hold: 2.0, // segurar para levantar quem está caído
  coffinHold: 5.0, // segurar para reviver do caixão (mais lento)
  coffinPrice: 0.5, // fração do preço da ressurreição
  push: { radius: 4.5, knockback: 12 },
  taken: 0.6, // fração do dano que quem resgata leva
  armor: { hits: 2 }, // golpes que não interrompem a cada vez que começa a segurar
  decay: 0.35, // segundos de progresso perdidos por segundo sem ninguém segurando
  shout: { radius: 3.2, knockback: 7, cooldown: 8 }, // o brado ao começar
};

const v1 = new THREE.Vector3();
const distXZ = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export class CoopRescue {
  constructor(d) {
    this.d = d;
    this.opening = []; // caixões abrindo (a cena do reviver)
  }

  get w() { return this.d.world; }
  slot(pl) { return pl === this.d.player ? 0 : 1; }

  // caiu com o amigo de pé
  down(pl) {
    pl.downed = { t: RESCUE.bleed, since: 0, shown: -1 };
    pl.crawling = false;
  }

  isDown(pl) { return !!pl.downed; }

  // a sala limpa / a próxima sala: quem está caído levanta (o caixão fica)
  liftAll() {
    for (const pl of this.d.players) if (pl.downed) this.standUp(pl, null);
  }

  // ------------------------------------------------ o tempo de quem está caído, o arrastar e os caixões abrindo
  tick(dt) {
    const d = this.d;
    for (const pl of d.players) {
      const D = pl.downed;
      if (!D || pl.state !== 'ko') continue;
      D.since += dt;
      // a queda (o corpo mole) e depois vira de bruços e começa a se arrastar
      if (!pl.crawling && D.since > 1.1) {
        pl.crawling = true;
        pl.anim.play('crawl', { restart: true, blend: 0.25 });
      }
      if (pl.crawling && !D.saving) {
        const dir = pl.moveInputWorld(v1);
        dir.y = 0;
        const m = Math.min(1, dir.length());
        if (m > 0.15) {
          dir.normalize();
          pl.pos.x += dir.x * RESCUE.crawl * m * dt;
          pl.pos.z += dir.z * RESCUE.crawl * m * dt;
          resolveBody(this.w.arena, pl.pos, pl.radius || 0.5);
          const want = Math.atan2(dir.x, dir.z);
          let dy = want - pl.yaw;
          while (dy > Math.PI) dy -= Math.PI * 2;
          while (dy < -Math.PI) dy += Math.PI * 2;
          pl.yaw += dy * Math.min(1, dt * 4);
        }
        pl.vel.set(0, 0, 0);
        pl.anim.speed = m > 0.15 ? 0.6 + 0.4 * m : 0.08; // parado: só respira
      }
      if (D.saving) continue; // o amigo está levantando: o tempo para
      D.t -= dt;
      const sec = Math.max(0, Math.ceil(D.t));
      if (sec !== D.shown) {
        D.shown = sec;
        d.popup(this.slot(pl), `MORRENDO: ${sec} s`, sec <= 8 ? '#ff4a3a' : '#ffb04a');
        this.w.fx.ring(new THREE.Vector3(pl.pos.x, 0.06, pl.pos.z), { color: 0xff4a3a, radius: RESCUE.reach, life: 0.9, inner: 0.94 });
      }
      if (D.t <= 0) this.toCoffin(pl);
    }
    // o progresso de um resgate interrompido cai devagar enquanto ninguém segura
    for (const pl of d.players) if (pl.rescueProg > 0 && !pl.beingSaved) pl.rescueProg = Math.max(0, pl.rescueProg - RESCUE.decay * dt);
    for (const c of this.opening.slice()) this.tickOpening(c, dt);
    // o caixão acompanha o corpo (a troca de sala leva os dois jogadores para a entrada)
    for (const pl of d.players) if (pl.coffin && !pl.coffin.opening) pl.coffin.g.position.set(pl.pos.x, 0, pl.pos.z);
  }

  // ------------------------------------------------ o botão: levantar quem caiu ou abrir o caixão
  // devolve true quando a vista está ocupada com isso (o Dungeon não mostra o aviso de porta/baú)
  input(V, dt) {
    const d = this.d;
    const q = V.p;
    const mate = d.players.find((o) => o !== q);
    if (!mate || q.state === 'ko' || q.bed || d.phase === 'dead' || d.phase === 'exit' || d.transit) { this.release(V); return false; }
    const target = mate.downed || mate.coffin ? mate : null;
    const dist = target ? distXZ(q.pos, target.pos) : Infinity;
    if (!target || dist > RESCUE.reach || (mate.coffin && mate.coffin.opening)) { this.release(V); return false; }
    const inp = V.inp;
    const held = inp.held || {};
    const pr = inp.pressed || {};
    const on = !!(held.interact || held.block || held.physical);
    const btn = actionLabel(V.i, 'interact', inp.source === 'gamepad' ? 'gamepad' : 'keyboard'); // a tecla/botão de INTERAGIR de cada um (pode ter sido trocado nas Opções)
    const coffin = !!mate.coffin;
    const price = coffin ? this.coffinPrice() : 0;
    const coins = d.coinsOf(V.i);
    const broke = coffin && coins < price;
    const at = v1.set(target.pos.x, 0, target.pos.z);
    V.prompt.show(at.clone(), coffin ? 1.3 : 0.9, broke ? `${btn}|Reviver: ${price} moedas (você tem ${coins})` : coffin ? `${btn}|Segure para reviver (${price} moedas)` : `${btn}|Segure para levantar`);
    if (!on || broke) {
      if (on && broke && pr.interact) d.audio.play('denied');
      this.release(V);
      V.prompt.progress?.(0);
      return true;
    }
    // um golpe tirou quem resgatava da pose (hitstun, derrubado): o resgate solta, o progresso fica guardado
    if (V.rescue && q.state !== 'intro') {
      this.release(V);
      d.popup(V.i, 'RESGATE INTERROMPIDO', '#ff8a4a');
    }
    // segurando: o botão não vira defesa nem golpe
    held.block = false; pr.block = false; pr.physical = false; pr.interact = false;
    V.interactLatch = true;
    if (!V.rescue && !['idle', 'walk', 'run', 'block'].includes(q.state)) return true; // ainda apanhando: espera se recompor
    if (!V.rescue || V.rescue.target !== mate) {
      this.release(V);
      V.rescue = { target: mate, t: mate.rescueProg || 0 };
      q.cancelAction && q.cancelAction();
      q.setState('intro');
      q.vel.set(0, 0, 0);
      q.anim.play('help_hand', { restart: true });
      q.rescue = true;
      q.rescueTaken = RESCUE.taken;
      // (armorHits e não superArmor: o setState de qualquer reação apaga a superArmor dos golpes)
      q.rescueArmor = { prev: q.armorHits || 0 };
      q.armorHits = (q.armorHits || 0) + RESCUE.armor.hits;
      mate.beingSaved = true;
      if (mate.downed) mate.downed.saving = true;
      d.audio.play('select', { volume: 0.6, pitch: coffin ? 0.6 : 0.9 });
      if (!(q.shoutCd > this.w.time)) {
        q.shoutCd = this.w.time + RESCUE.shout.cooldown;
        this.shout(q);
      }
    }
    const R = V.rescue;
    R.t += dt;
    q.yaw = Math.atan2(mate.pos.x - q.pos.x, mate.pos.z - q.pos.z);
    // o caído vira para quem veio buscar
    if (mate.downed) mate.yaw = Math.atan2(q.pos.x - mate.pos.x, q.pos.z - mate.pos.z);
    const need = coffin ? RESCUE.coffinHold : RESCUE.hold;
    const k = Math.min(1, R.t / need);
    V.prompt.progress?.(k);
    if (coffin && Math.random() < dt * 8) this.w.fx.burst(new THREE.Vector3(mate.pos.x, 0.6, mate.pos.z), { count: 1, color: 0xffe9a8, speed: 0.6, up: 1.4, life: 0.6, size: 0.08 });
    if (R.t < need) return true;
    // pronto
    V.prompt.progress?.(0);
    V.rescue = null;
    this.unguard(q);
    mate.beingSaved = false;
    mate.rescueProg = 0;
    if (coffin) {
      d.wallet.spend(V.i, price);
      d.pveHud.setCoins(d.coinsTotal ? d.coinsTotal() : 0);
      d.popup(V.i, `-${price} MOEDAS`, '#ffc040');
      q.setState('idle');
      q.anim.play('idle', { restart: true });
      this.openCoffin(mate);
    } else {
      q.anim.play('help_pull', { restart: true });
      this.w.after(0.5, () => { if (q.state === 'intro' && !q.bed) { q.setState('idle'); q.anim.play('idle'); } });
      this.standUp(mate, q);
    }
    return true;
  }

  // soltou o botão (ou saiu de perto): o resgate para; o caído volta a contar
  release(V) {
    const R = V.rescue;
    if (!R) return;
    V.rescue = null;
    const q = V.p;
    this.unguard(q);
    R.target.beingSaved = false;
    R.target.rescueProg = R.t; // o progresso fica (e cai devagar no tick)
    if (R.target.downed) R.target.downed.saving = false;
    if (q.state === 'intro' && !q.bed) { q.setState('idle'); q.anim.play('idle', { restart: true }); }
    V.prompt.progress?.(0);
  }

  // quem resgatava volta ao normal (a resistência do resgate sai; a de um golpe pesado, não é dela)
  unguard(q) {
    q.rescue = false;
    q.rescueTaken = null;
    if (q.rescueArmor) { q.armorHits = Math.min(q.armorHits || 0, q.rescueArmor.prev); q.rescueArmor = null; }
  }

  // o BRADO de quem começa a levantar o amigo: um empurrão curto em quem está colado (sem dano)
  shout(q) {
    const w = this.w;
    const S = RESCUE.shout;
    w.fx.ring(new THREE.Vector3(q.pos.x, 0.08, q.pos.z), { color: 0x7dffb0, radius: S.radius, life: 0.45 });
    for (const e of w.fighters || []) {
      if (this.d.players.includes(e) || e.state === 'ko' || distXZ(e.pos, q.pos) > S.radius) continue;
      applyHit(w, q, e, { damage: 1, kind: 'ability', knockback: S.knockback, hitstun: 0.45, unblockable: true, sound: 'impact', color: 0x7dffb0, scale: 0.9 });
    }
    for (const n of w.npcs || []) {
      if (!n.alive || this.d.players.includes(n.owner) || n.isCloset || !n.pos || !n.takeDamage || distXZ(n.pos, q.pos) > S.radius) continue;
      applyHit(w, q, n, { damage: 1, kind: 'ability', knockback: S.knockback, hitstun: 0.45, unblockable: true, reaction: true, sound: 'impact', color: 0x7dffb0, scale: 0.7 });
    }
  }

  coffinPrice() {
    return Math.max(1, Math.round(this.d.revivePrice() * RESCUE.coffinPrice));
  }

  // ------------------------------------------------ de pé de novo (resgate: com a aura que empurra)
  standUp(pl, helper) {
    const d = this.d;
    pl.downed = null;
    pl.crawling = false;
    pl.anim.speed = 1;
    pl.health = Math.round(pl.maxHealth * 0.35);
    pl.vel.set(0, 0, 0);
    pl.setState('intro');
    pl.anim.play('getup', { restart: true });
    pl.invuln = Math.max(pl.invuln || 0, 1.8);
    this.w.after(0.4, () => { if (pl.state === 'intro' && !pl.bed) { pl.setState('idle'); pl.anim.play('idle'); } });
    d.popup(this.slot(pl), 'DE PÉ DE NOVO', '#7dffb0');
    if (helper) this.aura(pl, 0x7dffb0);
    else this.w.fx.burst(pl.chestPos(), { count: 30, color: 0x7dffb0, speed: 3, up: 2, life: 0.6, size: 0.2 });
  }

  // a AURA ao levantar: um anel que empurra quem estiver perto
  aura(pl, color) {
    const w = this.w;
    const at = pl.chestPos(v1).clone();
    for (let i = 0; i < 3; i++) w.after(i * 0.08, () => w.fx.burst(at.clone().setY(0.3 + i * 0.5), { count: 26, color, speed: 3 + i, up: 2.5, life: 0.8, size: 0.18, gravity: -2 }));
    w.fx.ring(new THREE.Vector3(pl.pos.x, 0.08, pl.pos.z), { color, radius: RESCUE.push.radius, life: 0.6 });
    w.cameraRig.shake(0.25, 0.4);
    this.d.audio.play('ritual', { volume: 0.9, pitch: 1.3 });
    for (const e of w.fighters || []) {
      if (e === pl || this.d.players.includes(e) || e.state === 'ko' || distXZ(e.pos, pl.pos) > RESCUE.push.radius) continue;
      applyHit(w, pl, e, { damage: 1, kind: 'ability', knockback: RESCUE.push.knockback, hitstun: 0.6, unblockable: true, sound: 'impact', color, scale: 1.1 });
    }
    for (const n of w.npcs || []) {
      if (!n.alive || this.d.players.includes(n.owner) || n.isCloset || !n.pos || !n.takeDamage || distXZ(n.pos, pl.pos) > RESCUE.push.radius) continue;
      applyHit(w, pl, n, { damage: 1, kind: 'ability', knockback: RESCUE.push.knockback, hitstun: 0.6, unblockable: true, reaction: true, sound: 'impact', color, scale: 0.8 });
    }
  }

  // ------------------------------------------------ o CAIXÃO
  toCoffin(pl) {
    const d = this.d;
    pl.downed = null;
    pl.crawling = false;
    pl.anim.speed = 1;
    pl.setVisible(false);
    pl.vel.set(0, 0, 0);
    const g = makeCoffin();
    g.position.set(pl.pos.x, 0, pl.pos.z);
    g.rotation.y = pl.yaw;
    this.w.scene.add(g);
    pl.coffin = { g, lid: g.userData.lid, glow: g.userData.glow, beam: g.userData.beam, opening: false, t: 0 };
    this.w.fx.burst(new THREE.Vector3(pl.pos.x, 0.5, pl.pos.z), { count: 30, color: 0x3a3430, kind: 'smoke', speed: 1.6, life: 0.8, size: 0.6, grow: 1 });
    this.w.cameraRig.shake(0.2, 0.3);
    d.audio.play('ko', { volume: 0.9, pitch: 0.7 });
    d.hud.callout(`${this.slot(pl) ? 'P2' : 'P1'} MORREU`, '#ff4a3a');
    d.hint(`O caixão fica onde caiu — segure o botão perto dele para reviver (${this.coffinPrice()} moedas)`);
    d.hintT = 6;
  }

  openCoffin(pl) {
    const C = pl.coffin;
    C.opening = true;
    C.t = 0;
    this.opening.push(pl);
    this.d.audio.play('creak', { volume: 0.9, pitch: 0.55 });
  }

  // a cena: a tampa treme e abre, a luz sai de dentro, o jogador aparece de pé e o caixão afunda
  tickOpening(pl, dt) {
    const C = pl.coffin;
    if (!C) { this.opening = this.opening.filter((x) => x !== pl); return; }
    const w = this.w;
    C.t += dt;
    const t = C.t;
    if (t < 0.5) {
      C.lid.position.x = Math.sin(t * 70) * 0.02;
      C.glow.material.opacity = t;
    } else {
      const k = Math.min(1, (t - 0.5) / 0.4);
      C.lid.rotation.z = 1.9 * (1 - Math.pow(1 - k, 3)); // abre de lado, na dobradiça
      C.glow.material.opacity = 1;
      C.beam.material.opacity = 0.55 * Math.min(1, (t - 0.5) / 0.3) * (t > 1.8 ? Math.max(0, 1 - (t - 1.8) / 0.8) : 1);
      C.beam.scale.y = 0.2 + 0.8 * Math.min(1, (t - 0.5) / 0.3);
      if (Math.random() < dt * 30) w.fx.burst(new THREE.Vector3(pl.pos.x, 0.5, pl.pos.z), { count: 1, color: 0xffe9a8, speed: 1, up: 3, life: 0.6, size: 0.12 });
    }
    if (t >= 1.1 && !C.out) {
      C.out = true;
      pl.pos.y = 0;
      pl.setVisible(true);
      pl.health = Math.round(pl.maxHealth * 0.5);
      pl.setState('intro');
      pl.anim.play('getup', { restart: true });
      pl.invuln = Math.max(pl.invuln || 0, 2.5);
      w.after(0.4, () => { if (pl.state === 'intro') { pl.setState('idle'); pl.anim.play('idle'); } });
      this.aura(pl, 0xffe9a8);
      this.d.hud.callout('DE VOLTA DO CAIXÃO', '#ffe9a8');
      this.d.audio.play('levelUp', { volume: 0.9, pitch: 0.9 });
    }
    if (t > 1.6) C.g.position.y = -(t - 1.6) * 0.9; // afunda no chão
    if (t > 2.8) { this.removeCoffin(pl); this.opening = this.opening.filter((x) => x !== pl); }
  }

  removeCoffin(pl) {
    const C = pl.coffin;
    if (!C) return;
    pl.coffin = null;
    this.w.scene.remove(C.g);
    C.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }

  // a volta paga (a tela do fim): tudo zera
  clear(pl) {
    pl.downed = null;
    pl.rescueProg = 0;
    pl.beingSaved = false;
    this.unguard(pl);
    pl.crawling = false;
    if (pl.anim) pl.anim.speed = 1;
    if (pl.coffin) { this.removeCoffin(pl); pl.setVisible(true); }
  }

  dispose() {
    for (const pl of this.d.players || []) this.clear(pl);
    this.opening = [];
  }
}

// o caixão (PROPOSTA de desenho): madeira escura, o formato de seis lados, cruz de latão; a tampa abre de lado
function makeCoffin() {
  const g = new THREE.Group();
  const wood = new THREE.MeshToonMaterial({ color: 0x3a2416 });
  const dark = new THREE.MeshToonMaterial({ color: 0x1a0e08 });
  const brass = new THREE.MeshToonMaterial({ color: 0xc89a2a, emissive: 0x2a1a00 });
  // o contorno de seis lados (mais largo nos ombros), em XZ, comprido em Z
  const shape = new THREE.Shape();
  shape.moveTo(-0.22, -0.95); shape.lineTo(0.22, -0.95); shape.lineTo(0.36, 0.45); shape.lineTo(0.26, 0.95);
  shape.lineTo(-0.26, 0.95); shape.lineTo(-0.36, 0.45); shape.closePath();
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.38, bevelEnabled: false }), wood);
  body.rotation.x = -Math.PI / 2; // a extrusão sobe em Y
  const inner = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false }), dark);
  inner.rotation.x = -Math.PI / 2;
  inner.scale.set(0.86, 0.94, 1);
  inner.position.y = 0.37;
  // a tampa: presa na borda esquerda (x = -0.36), abre girando em Z
  const hinge = new THREE.Group();
  hinge.position.set(-0.36, 0.38, 0);
  const lidShape = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 }), wood);
  lidShape.rotation.x = -Math.PI / 2;
  lidShape.position.x = 0.36;
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.62), brass);
  crossV.position.set(0.36, 0.1, -0.12);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.06), brass);
  crossH.position.set(0.36, 0.1, -0.28);
  hinge.add(lidShape, crossV, crossH);
  // a luz de dentro e o facho (apagados até abrir)
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.7), new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.39;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 5, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false }));
  beam.position.y = 2.5;
  beam.scale.set(0.8, 0.2, 1.6);
  g.add(body, inner, hinge, glow, beam);
  g.userData = { lid: hinge, glow, beam };
  return g;
}
