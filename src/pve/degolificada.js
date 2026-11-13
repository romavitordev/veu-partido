// A DEGOLIFICADA DE GABRIEL — a chefe da Escola Nostradamus (2ª dungeon do Outro Lado). É a de INICIAÇÃO (A Ordem
// Paranormal): o corpo da Agatha Volkomenn com a mente do Gabriel Opspor (wiki "Gabriel Opspor" e "Degolificada").
// Agatha atraiu o Gabriel ao BUNKER escondido na biblioteca, fez o ritual da troca de corpos e o matou; o corpo dela (com
// a mente dele) virou a Degolificada. No fim os agentes a enfrentam na MAIOR SALA DO BUNKER.
//
// A LUTA (pedido do dono, 2026-11-06): ela NÃO bate corpo a corpo e NÃO investe com o corpo. Flutua a meia distância e
// luta só com os CABELOS, usados como tentáculos (wiki: "usando seus cabelos flutuantes"):
//   Investida de cabelo .. a linha no chão marca; os fios disparam em linha reta (desvie para o lado)
//   Agarrar e arremessar . o cabelo agarra (ATÉ DOIS, cânone: Agarrar e Estrangular), estrangula e joga na PAREDE
//   Cabelo rastejante .... um fio corre pelo chão atrás do alvo e brota debaixo dele
//   Cabelo por cima ...... círculos no chão: os fios caem do teto
//   Defesa de cabelo ..... quem fica colado nela: os fios fecham na frente (quase não apanha) e empurram de volta
//   Arremessar objetos ... o cabelo pega as CAIXAS do bunker e as joga no jogador; ao quebrar, de uma delas pode sair
//                          uma das PROVAS (PROPOSTA: as provas nas caixas)
//   Grito Rasgado ........ (cânone) rompe a vedação da boca: atordoa quem estiver perto
//   Metamorfose .......... DEVORADORA (Sangue, cânone de Iniciação): com o tempo, ou ao absorver quem morreu agarrado,
//                          fica maior, mais rápida e mais forte (mais fios por golpe)
// O ESCUDO DE MEDO: uma SEGUNDA VIDA azul-acinzentada por cima da vida amarela dela (no HUD). Não quebra com golpes;
// cada PROVA de que o corpo é o da Agatha mas quem está nele é o GABRIEL tira um terço. Sem escudo ela apanha e cai.
// As provas são objetos do cânone (o cartão SD da câmera do Matheus, a ficha do Gabriel, a foto do Gabriel com a Lina).
// No cânone o fim é dizer o nome dele (o fogo fica azul e ela se dissipa): o fogo azul aparece quando ela cai.
import * as THREE from 'three';
import { distXZ, yawTo, turnTowards } from '../core/util.js';
import { applyHit } from '../combat/damage.js';
import { resolveBody } from '../combat/positioning.js';
import { inkTentacle } from '../fx/inkFx.js';
import { DEGOLIFICADA_DEVOUR_PROPS } from '../models/props.js';

const v1 = new THREE.Vector3();
const HAIR = 0x0a0909;
const HAIR_E = 0x050505;
const FEAR = 0x8aa4c8; // o azul-acinzentado do Medo
const WARN = 0xc8d0c0;

export const DEGOLIFICADA_CFG = {
  range: [4.6, 8.2], // a distância que ela mantém (não chega perto: não bate corpo a corpo)
  float: { speed: 3.4, flee: 5.2, strafe: 0.55 },
  duel: [1.3, 2.4], // intervalo entre os golpes de cabelo
  lash: { windup: 0.8, track: 0.55, len: 11.5, width: 0.75, damage: 24, knockback: 7, cd: 2.4 },
  grab: { windup: 0.65, range: 8.5, arc: 50, hold: 1.0, ticks: 2, tickDamage: 6, speed: 16, max: 10, wallDamage: 32, landDamage: 14, cd: 8 },
  crawl: { windup: 0.5, speed: 8.0, turn: 2.0, life: 2.8, hitR: 0.85, damage: 22, cd: 6 },
  rain: { windup: 0.95, count: 4, spread: 2.6, radius: 1.2, damage: 22, cd: 7 },
  toss: { lift: 0.6, aim: 0.55, flight: 0.75, peak: 2.6, radius: 1.7, damage: 26, reach: 15, cd: 2.6 },
  guard: { near: 2.7, after: 0.35, time: 1.0, taken: 0.2, push: 3.4, damage: 14, knockback: 9, cd: 4.5 },
  scream: { windup: 1.1, radius: 6.2, damage: 28, stun: 1.2, cd: 11 },
  devour: { after: 120, size: 1.15, speed: 1.2, dealt: 1.2, cd: 0.75 },
  // ENCURRALADA (pedido do dono, 2026-11-12: "dá para prender ela na parede"): presa (não consegue fugir) com alguém
  // perto por `after` s, ela solta uma explosão de cabelo que EMPURRA todos (com dano e atordoamento curto) e desliza
  // para o meio do bunker, quase intocável. Não espera a recarga da Defesa de cabelo.
  breakout: { after: 0.45, windup: 0.28, radius: 4.4, damage: 22, knockback: 14, stun: 0.55, glide: 0.7, glideSpeed: 11, taken: 0.25, cd: 2.2 },
  // FÚRIA (pedido do dono: "quando acha todas as pistas, ela fica mais difícil/furiosa"): sem o escudo ela ataca mais
  // rápido, mais forte e se move mais. rage (Super Difícil/Aniquilação): a fúria já vem com a última prova faltando
  fury: { cd: 0.72, dealt: 1.2, speed: 1.25, guardAfter: 0.18 },
};

// ================================================================== a CENA DE ENTRADA
// O bunker escurece, a névoa sobe, ela aparece flutuando (oscilando entre transparente e sólida) e o nome.
export class DegolificadaIntro {
  constructor(dungeon, spot) {
    this.d = dungeon;
    this.w = dungeon.world;
    this.t = 0;
    this.done = false;
    this.spot = new THREE.Vector3(spot.x, 0, spot.z);
    const b = dungeon.enemy;
    b.setVisible(false);
    b.setState('intro');
    b.pos.copy(this.spot);
    b.yaw = yawTo(b.pos, dungeon.player.pos);
    const p = dungeon.player;
    p.cancelAction && p.cancelAction();
    p.setState('intro');
    p.vel.set(0, 0, 0);
    p.anim.play('idle', { restart: true });
    dungeon.hud.root.classList.add('pve-cine');
    const from = p.pos.clone();
    const to = this.spot;
    const dir = new THREE.Vector3().subVectors(to, from).setY(0).normalize();
    const perp = new THREE.Vector3(dir.z, 0, -dir.x);
    this.w.cameraRig.playShots([
      { dur: 2.2, fov: 52, pos: (k) => v1.copy(from).addScaledVector(dir, -2.4 + k * 0.6).addScaledVector(perp, 1.3).setY(2.0), look: () => to.clone().setY(1.6) },
      { dur: 2.6, fov: 44, cut: true, pos: (k) => to.clone().addScaledVector(dir, -3.6 + k * 0.8).addScaledVector(perp, 0.6).setY(1.2 + k * 0.3), look: () => to.clone().setY(1.7) },
      { dur: 1.8, fov: 40, pos: () => to.clone().addScaledVector(dir, -2.6).addScaledVector(perp, -0.4).setY(1.0), look: () => to.clone().setY(1.9) },
    ]);
    this.w.audio.play('whisper', { volume: 0.9, pitch: 0.6 });
  }

  update(dt, input) {
    if (this.done) return true;
    this.t += dt;
    const t = this.t;
    const w = this.w;
    const b = this.d.enemy;
    const p0 = input.players[0];
    if (t > 1 && (p0.pressed.jump || p0.pressed.start || input.keyPressedOnce('Enter'))) { this.finish(); return true; }
    if (t < 4.6 && Math.random() < dt * 14) w.fx.burst(this.spot.clone().add(v1.set((Math.random() - 0.5) * 2.4, 0.1, (Math.random() - 0.5) * 2.4)), { count: 2, color: 0x8a9a98, kind: 'smoke', speed: 0.4, up: 0.6, life: 1.6, size: 1.1, grow: 1 });
    if (t > 2.2 && !this.shown) { this.shown = true; b.setVisible(true); b.anim.play('idle', { restart: true }); w.audio.play('fearGaze', { volume: 0.8, pitch: 0.5 }); }
    if (this.shown && t < 4.6) b.setVisible(Math.sin(t * 22) > -0.2 || t > 4.1);
    if (t > 4.8 && !this.roared) {
      this.roared = true;
      b.setVisible(true);
      b.anim.play('taunt_roar', { restart: true, duration: 1.6 });
      w.audio.play('scare', { volume: 1, pitch: 0.8 });
      w.cameraRig.shake(0.3, 0.5);
      w.showBanner(b.def.name, b.def.color);
    }
    if (t >= 6.6) { this.finish(); return true; }
    return false;
  }

  finish() {
    if (this.done) return;
    this.done = true;
    const b = this.d.enemy;
    this.w.cameraRig.stopShots();
    this.d.hud.root.classList.remove('pve-cine');
    b.setVisible(true);
    b.pos.copy(this.spot);
    b.yaw = yawTo(b.pos, this.d.player.pos);
  }

  dispose() {}
}

// ================================================================== marcas no chão (os avisos)
function groundMesh(world, geo, color, opacity = 0) {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 3;
  world.scene.add(m);
  return m;
}
function dropMesh(world, m) {
  if (!m) return;
  world.scene.remove(m);
  m.geometry.dispose();
  m.material.dispose();
}

// ================================================================== a IA da luta
export class DegolificadaBrain {
  // boxes: as caixas do bunker (pve/breakables.js, kind 'bossBox'); o Dungeon guarda a lista viva em d.bossBoxes
  constructor(dungeon) {
    this.d = dungeon;
    this.w = dungeon.world;
    this.state = 'duel';
    this.t = 0;
    this.st = 0;
    this.next = 1.4;
    this.cds = { lash: 0, grab: 4, crawl: 2, rain: 3, toss: 0.5, guard: 0, scream: 8, breakout: 0 };
    this.cornered = 0;
    this.hazards = []; // golpes que seguem sozinhos (cabelo rastejante, cabelo por cima, a caixa voando)
    this.marks = [];
    this.near = 0;
    this.strafe = 1;
    const b = this.boss;
    this.baseSpeed = b.moveSpeed;
    b.noFlinch = true; // a IA controla o corpo; ela se defende com o cabelo
    this.holdCpu(true); // sem a CPU de luta: nada de soco, chute ou investida de corpo
    this.layers = Math.max(0, (dungeon.cluesNeeded || 3) - (dungeon.clues || 0)); // o escudo: um terço por prova que falta
    this.freeAt = this.layers > 0 ? null : 0; // quando o escudo caiu (o relógio da Devoradora corre só daí em diante)
    this.applyShield();
    this.checkFury();
    // os golpes que ela leva: no escudo, o brilho azul (sem dano); na defesa de cabelo, o estalo
    const prevHit = this.w.onHit;
    this.prevHit = prevHit;
    this.w.onHit = (a, v, dealt, o) => { prevHit && prevHit(a, v, dealt, o); if (v === this.boss) this.onBossHit(a, o || {}); };
  }

  get boss() { return this.d.enemy; }
  get players() { return this.d.players.filter((p) => p.state !== 'ko'); }
  get cdMult() { return (this.devourer ? DEGOLIFICADA_CFG.devour.cd : 1) * (this.fury ? DEGOLIFICADA_CFG.fury.cd : 1); }
  // o nome do golpe: pequeno, no canto (pedido do dono)
  say(text) { this.d.pveHud && this.d.pveHud.moveName(text); }
  dealt(n) { return Math.round(n * (this.boss.cpuEdge?.dealt ?? 1)); }
  head() { const b = this.boss; return b.chestPos(new THREE.Vector3()).setY(b.pos.y + 1.75 * (b.rig.root?.scale.y || 1)); }

  // ------------------------------------------------ o ESCUDO DE MEDO: a segunda vida (só as provas a tiram)
  applyShield() {
    const b = this.boss;
    const on = this.layers > 0;
    const taken = on ? 0 : this.state === 'guard' ? DEGOLIFICADA_CFG.guard.taken : this.state === 'breakout' ? DEGOLIFICADA_CFG.breakout.taken : 1;
    b.cpuEdge = { ...(b.cpuEdge || {}), taken };
    b.lethalHook = on ? () => { b.health = Math.max(1, b.health); return true; } : null;
    this.d.pveHud && this.d.pveHud.setShield(this.layers, this.d.cluesNeeded || 3, b);
  }

  onBossHit(a, o) {
    const b = this.boss;
    const at = b.chestPos(new THREE.Vector3());
    if (this.layers > 0) {
      this.d.pveHud && this.d.pveHud.flashShield();
      this.w.fx.burst(at, { count: 8, color: FEAR, speed: 2.6, life: 0.3, size: 0.1 });
      if (this.t - (this.clinkT || -9) > 0.25) { this.clinkT = this.t; this.w.audio.play('blockHit', { volume: 0.5, pitch: 0.7 }); }
      if (this.t - (this.saidT || -99) > 12) { this.saidT = this.t; this.d.hint('O ESCUDO DE MEDO (a barra azul) não quebra com golpes: só as PROVAS o tiram'); this.d.hintT = 4; }
    } else if (this.state === 'guard') {
      this.w.fx.burst(at, { count: 6, color: 0x3a3838, speed: 2.2, life: 0.3, size: 0.1 });
      this.w.audio.play('blockHit', { volume: 0.6, pitch: 0.55 });
    }
  }

  // uma prova coletada (o Dungeon chama): um terço do escudo cai
  addProof() {
    if (this.layers <= 0) return;
    this.layers--;
    const b = this.boss;
    this.w.audio.play('guardBreak', { volume: 0.9, pitch: 0.8 });
    this.w.fx.burst(b.chestPos(v1).clone(), { count: 30, color: FEAR, speed: 3.5, life: 0.7, size: 0.14 });
    this.w.cameraRig.shake(0.25, 0.35);
    if (this.layers <= 0) {
      // as três provas: quem está no corpo é o Gabriel — o escudo se desfaz
      this.freeAt = this.t;
      this.d.hud.callout('GABRIEL', '#dce8ff');
      this.d.hint('O escudo caiu: quem está no corpo é o GABRIEL. Agora ela apanha');
      this.d.hintT = 5;
      this.w.fx.burst(b.chestPos(v1).clone(), { count: 60, color: 0xdce8ff, speed: 5, life: 1, size: 0.18 });
    }
    this.applyShield();
    this.checkFury();
  }

  // FÚRIA: todas as provas achadas (no Super Difícil e na Aniquilação, já com uma faltando)
  checkFury() {
    if (this.fury) return;
    const rage = !!this.d.diff?.rage;
    if (this.layers > (rage ? 1 : 0)) return;
    const F = DEGOLIFICADA_CFG.fury;
    const b = this.boss;
    this.fury = true;
    b.cpuEdge = { ...(b.cpuEdge || {}), dealt: (b.cpuEdge?.dealt ?? 1) * F.dealt };
    this.w.after(this.layers > 0 ? 0 : 1.6, () => {
      if (!this.boss || this.boss.state === 'ko') return;
      this.d.hud.callout('FÚRIA', '#ff3a3a');
      this.say('Fúria — ela não deixa mais ninguém chegar perto');
      this.w.audio.play('fearGaze', { volume: 1, pitch: 0.5 });
      this.w.cameraRig.shake(0.3, 0.45);
      this.w.fx.burst(this.boss.chestPos(v1).clone(), { count: 40, color: 0xff2a2a, speed: 4, life: 0.8, size: 0.16 });
    });
    if (this.boss.rig.body) this.boss.rig.body.traverse?.((o) => { if (o.material && o.material.emissive && !o.userData.furyTint) { o.userData.furyTint = true; o.material = o.material.clone(); o.material.emissive.lerp(new THREE.Color(0x5a0000), 0.5); } });
  }

  holdCpu(on) {
    const b = this.boss;
    if (on) {
      if (b.input.cpu) { this.cpuRef = b.input.cpu; b.input.cpu = null; }
      b.input.setVirtual({ moveX: 0, moveY: 0, held: {} });
    } else {
      b.input.setVirtual(null);
      if (this.cpuRef && !b.input.cpu) b.input.cpu = this.cpuRef;
    }
  }

  setState(s) {
    this.state = s;
    this.st = 0;
    this.applyShield();
  }

  update(dt) {
    const b = this.boss;
    if (!b || b.state === 'ko') return;
    const C = DEGOLIFICADA_CFG;
    this.t += dt;
    this.st += dt;
    for (const k in this.cds) this.cds[k] = Math.max(0, this.cds[k] - dt);
    if (b.input.cpu) this.holdCpu(true); // alguém religou a CPU de luta: ela não luta corpo a corpo
    if (this.layers > 0 && !b.lethalHook) this.applyShield(); // o gancho é de uma vez só: rearma
    // flutua (Voo): o corpo balança um pouco acima do chão
    if (b.rig.body) b.rig.body.position.y = 0.22 + Math.sin(this.t * 2.2) * 0.07;
    this.hazards = this.hazards.filter((h) => !h.update(dt));
    this.updateFlung(dt);
    // METAMORFOSE (Devoradora): com o tempo a vedação da boca cede — contado de quando o escudo caiu (bateria de
    // 2026-11-08: contando do início, quem gastava tempo atrás das provas enfrentava a Devoradora a luta quase toda)
    if (!this.devourer && this.state === 'duel' && this.freeAt !== null && this.t - this.freeAt > C.devour.after) this.becomeDevourer('A boca se abriu');
    switch (this.state) {
      case 'duel': this.updateDuel(dt); break;
      case 'lash': this.updateLash(dt); break;
      case 'grab': this.updateGrab(dt); break;
      case 'cast': this.updateCast(dt); break;
      case 'toss': this.updateToss(dt); break;
      case 'guard': this.updateGuard(dt); break;
      case 'breakout': this.updateBreakout(dt); break;
      case 'scream': this.updateScream(dt); break;
      default: break;
    }
  }

  target() {
    const b = this.boss;
    return this.players.sort((x, y) => distXZ(x.pos, b.pos) - distXZ(y.pos, b.pos))[0] || null;
  }

  // flutua mantendo a distância (foge de quem chega perto, rodeia, volta se o alvo se afasta)
  float(dt, p, mult = 1) {
    const C = DEGOLIFICADA_CFG;
    const b = this.boss;
    const d = distXZ(b.pos, p.pos);
    const to = v1.set(p.pos.x - b.pos.x, 0, p.pos.z - b.pos.z).normalize();
    let fwd = 0;
    if (d < C.range[0]) fwd = -C.float.flee / C.float.speed;
    else if (d > C.range[1]) fwd = 1;
    if (Math.random() < dt * 0.4) this.strafe = -this.strafe;
    const sp = this.baseSpeed * 0.5 * (C.float.speed / 3.4) * (this.devourer ? C.devour.speed : 1) * (this.fury ? C.fury.speed : 1) * mult;
    const sx = -to.z * this.strafe * C.float.strafe;
    const sz = to.x * this.strafe * C.float.strafe;
    const ox = b.pos.x;
    const oz = b.pos.z;
    b.pos.x += (to.x * fwd + sx) * sp * dt;
    b.pos.z += (to.z * fwd + sz) * sp * dt;
    resolveBody(this.w.arena, b.pos, b.radius);
    const moved = Math.hypot(b.pos.x - ox, b.pos.z - oz);
    if (moved < 0.2 * sp * dt) this.strafe = -this.strafe; // encostou: rodeia para o outro lado
    // ENCURRALADA: queria fugir (alguém perto) mas a parede não deixa
    const crowd = this.players.some((q) => distXZ(q.pos, b.pos) < C.range[0] * 0.75);
    this.cornered = fwd < 0 && crowd && moved < 0.55 * sp * dt ? this.cornered + dt : Math.max(0, this.cornered - dt * 2);
    b.yaw = turnTowards(b.yaw, yawTo(b.pos, p.pos), dt * 6);
    b.vel.set(0, 0, 0);
  }

  updateDuel(dt) {
    const C = DEGOLIFICADA_CFG;
    const b = this.boss;
    const p = this.target();
    if (!p) return;
    this.float(dt, p);
    if (b.anim.currentName !== b.anim.resolve('idle')) b.anim.play('idle');
    const d = distXZ(b.pos, p.pos);
    // DEFESA DE CABELO: quem fica colado nela
    if (this.cornered > C.breakout.after && this.cds.breakout <= 0) { this.startBreakout(); return; }
    const close = this.players.some((q) => distXZ(q.pos, b.pos) < C.guard.near);
    this.near = close ? this.near + dt : 0;
    if (this.near > (this.fury ? C.fury.guardAfter : C.guard.after) && this.cds.guard <= 0) { this.startGuard(); return; }
    this.next -= dt;
    if (this.next > 0) return;
    const opts = [];
    const near = this.players.filter((q) => distXZ(q.pos, b.pos) < C.scream.radius).length;
    const objs = this.throwables().length;
    // arremessar as caixas é a base da luta enquanto houver escudo (é de onde saem as provas)
    if (this.cds.toss <= 0 && objs) opts.push(['toss', this.layers > 0 ? 7 : 1.2]);
    if (this.cds.lash <= 0) opts.push(['lash', 3]);
    if (this.cds.grab <= 0 && d < C.grab.range) opts.push(['grab', 2]);
    if (this.cds.crawl <= 0) opts.push(['crawl', 2]);
    if (this.cds.rain <= 0) opts.push(['rain', 2]);
    if (this.cds.scream <= 0 && near) opts.push(['scream', near > 1 ? 2.5 : 1.2]);
    if (!opts.length) { this.next = 0.4; return; }
    let r = Math.random() * opts.reduce((s, o) => s + o[1], 0);
    let pick = opts[0][0];
    for (const [k, wgt] of opts) { r -= wgt; if (r <= 0) { pick = k; break; } }
    if (pick === 'toss') this.startToss();
    else if (pick === 'lash') this.startLash();
    else if (pick === 'grab') this.startGrab();
    else if (pick === 'crawl') this.startCast('crawl');
    else if (pick === 'rain') this.startCast('rain');
    else this.startScream();
  }

  backToDuel() {
    const C = DEGOLIFICADA_CFG;
    const b = this.boss;
    this.clearMarks();
    if (b.rig.body) b.rig.body.position.x = 0;
    this.setState('duel');
    this.next = (C.duel[0] + Math.random() * (C.duel[1] - C.duel[0])) * this.cdMult;
  }

  mark(m) { this.marks.push(m); return m; }
  clearMarks() { for (const m of this.marks) dropMesh(this.w, m); this.marks = []; }

  // ------------------------------------------------ INVESTIDA DE CABELO: a linha marca; os fios disparam em linha reta
  startLash() {
    const C = DEGOLIFICADA_CFG.lash;
    const b = this.boss;
    this.cds.lash = C.cd * this.cdMult;
    this.setState('lash');
    const p = this.target();
    if (p) b.yaw = yawTo(b.pos, p.pos);
    b.anim.play('ai_charge', { restart: true, duration: C.windup + 0.4 });
    this.w.audio.play('whisper', { volume: 0.8, pitch: 1.5 });
    this.say('Investida de cabelo');
    // a Devoradora dispara três (em leque)
    this.fan = this.devourer ? [-0.32, 0, 0.32] : [0];
    for (let i = 0; i < this.fan.length; i++) {
      const m = this.mark(groundMesh(this.w, new THREE.PlaneGeometry(C.width * 2, C.len).translate(0, C.len / 2 + 0.6, 0), WARN));
      m.position.y = 0.04;
    }
    this.struck = false;
  }

  updateLash(dt) {
    const C = DEGOLIFICADA_CFG.lash;
    const b = this.boss;
    if (this.st < C.windup) {
      const p = this.target();
      if (p && this.st < C.track) b.yaw = turnTowards(b.yaw, yawTo(b.pos, p.pos), dt * 5);
      this.marks.forEach((m, i) => {
        m.position.set(b.pos.x, 0.04, b.pos.z);
        m.rotation.z = b.yaw + this.fan[i] + Math.PI; // o plano deitado: rotation.z gira em volta do eixo vertical
        m.material.opacity = 0.1 + 0.28 * (this.st / C.windup) + (this.st > C.track ? Math.sin(this.st * 40) * 0.08 : 0);
      });
      return;
    }
    if (!this.struck) {
      this.struck = true;
      this.clearMarks();
      const from = this.head();
      this.w.audio.play('whip', { volume: 1, pitch: 0.55 });
      for (const off of this.fan) {
        const yaw = b.yaw + off;
        const dir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
        for (let s = 0; s < 3; s++) {
          const end = b.pos.clone().addScaledVector(dir, C.len + 0.6).setY(0.7 + s * 0.25);
          end.x += dir.z * (s - 1) * 0.25;
          end.z -= dir.x * (s - 1) * 0.25;
          inkTentacle(this.w, from, end, { grow: 0.1, hold: 0.12, retract: 0.3, arc: 0.12, radius: 0.06, wiggle: 0.06, color: HAIR, emissive: HAIR_E, splash: false });
        }
        for (const q of this.players) {
          if (q.isInvulnerable()) continue;
          const rx = q.pos.x - b.pos.x;
          const rz = q.pos.z - b.pos.z;
          const along = rx * dir.x + rz * dir.z;
          const side = Math.abs(rx * dir.z - rz * dir.x);
          if (along < 0 || along > C.len + 0.6 || side > C.width + q.radius) continue;
          applyHit(this.w, b, q, { damage: this.dealt(C.damage), kind: 'ability', knockback: C.knockback, hitstun: 0.5, dir, sound: 'clawHit', color: 0x2a2626, scale: 1.1 });
        }
      }
    }
    if (this.st > C.windup + 0.45) this.backToDuel();
  }

  // ------------------------------------------------ AGARRAR E ARREMESSAR (até dois): estrangula e joga na PAREDE
  startGrab() {
    const G = DEGOLIFICADA_CFG.grab;
    const b = this.boss;
    this.cds.grab = G.cd * this.cdMult;
    this.setState('grab');
    const p = this.target();
    if (p) b.yaw = yawTo(b.pos, p.pos);
    b.anim.play('ai_point', { restart: true, duration: G.windup + 0.3 });
    this.w.audio.play('whip', { volume: 0.7, pitch: 0.5 });
    this.say('Agarrar e estrangular');
    this.victims = [];
    this.tickT = 0;
    this.ticks = 0;
    this.grabbed = false;
    this.ropes = [];
  }

  updateGrab(dt) {
    const G = DEGOLIFICADA_CFG.grab;
    const b = this.boss;
    if (this.st < G.windup) {
      const p = this.target();
      if (p) b.yaw = turnTowards(b.yaw, yawTo(b.pos, p.pos), dt * 5);
      return;
    }
    if (!this.grabbed) {
      this.grabbed = true;
      const fw = new THREE.Vector3(Math.sin(b.yaw), 0, Math.cos(b.yaw));
      const caught = this.players.filter((q) => {
        if (q.isInvulnerable() || distXZ(q.pos, b.pos) > G.range) return false;
        const to = new THREE.Vector3(q.pos.x - b.pos.x, 0, q.pos.z - b.pos.z).normalize();
        return Math.acos(Math.max(-1, Math.min(1, to.dot(fw)))) < (G.arc * Math.PI) / 180;
      }).slice(0, 2);
      const from = this.head();
      this.w.audio.play('whip', { volume: 0.9, pitch: 0.6 });
      if (!caught.length) {
        inkTentacle(this.w, from, from.clone().addScaledVector(fw, G.range * 0.85).setY(1.1), { grow: 0.14, hold: 0.1, retract: 0.25, arc: 0.3, radius: 0.07, color: HAIR, emissive: HAIR_E, splash: false });
        this.st = G.windup + G.hold;
      } else {
        this.victims = caught;
        for (const q of caught) {
          q.cancelAction && q.cancelAction();
          q.stun(G.hold + 1.2, 'stagger');
          q.notify('AGARRADO PELO CABELO', true);
          for (let i = 0; i < 2; i++) this.ropes.push(inkTentacle(this.w, from, () => q.pos.clone().setY(q.pos.y + 1.35 + i * 0.2), { grow: 0.12, hold: G.hold + 0.4, retract: 0.2, coil: true, radius: 0.065, arc: 0.3, color: HAIR, emissive: HAIR_E, splash: false }));
        }
        this.w.audio.play('chainPull', { volume: 0.8, pitch: 0.5 });
      }
    }
    // segurando: puxa a vítima para perto (a 1,8 m, na frente) e estrangula
    for (const q of this.victims) {
      const fw = v1.set(Math.sin(b.yaw), 0, Math.cos(b.yaw));
      const tx = b.pos.x + fw.x * 1.8;
      const tz = b.pos.z + fw.z * 1.8;
      q.pos.x += (tx - q.pos.x) * Math.min(1, dt * 5);
      q.pos.z += (tz - q.pos.z) * Math.min(1, dt * 5);
      q.vel.set(0, 0, 0);
    }
    this.tickT -= dt;
    if (this.victims.length && this.tickT <= 0 && this.ticks < G.ticks) {
      this.tickT = G.hold / G.ticks;
      this.ticks++;
      for (const q of this.victims) {
        if (q.state === 'ko') continue;
        applyHit(this.w, b, q, { damage: this.dealt(G.tickDamage), kind: 'ability', knockback: 0, hitstun: 0.05, unblockable: true, ignoreInvuln: true, reaction: false, sound: 'clawHit', color: 0x2a2626, scale: 0.7 });
      }
    }
    if (!this.devourer && this.victims.some((q) => q.state === 'ko')) this.devourPending = true; // absorveu quem morreu agarrado
    if (this.st > G.windup + G.hold) {
      // ARREMESSA: cada vítima voa para a parede mais perto
      for (const q of this.victims) if (q.state !== 'ko') this.fling(q);
      for (const r of this.ropes) r.release && r.release();
      this.ropes = [];
      this.victims = [];
      this.backToDuel();
      if (this.devourPending) { this.devourPending = false; this.becomeDevourer('Ela absorveu a vítima'); }
    }
  }

  // a direção da PAREDE mais perto (até G.max), sem ser para cima dela; sem parede perto: para longe dela
  wallDir(q) {
    const G = DEGOLIFICADA_CFG.grab;
    const b = this.boss;
    const away = new THREE.Vector3(q.pos.x - b.pos.x, 0, q.pos.z - b.pos.z).normalize();
    let best = null;
    let bd = Infinity;
    const probe = new THREE.Vector3();
    const test = new THREE.Vector3();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      if (dir.dot(away) < -0.2) continue; // não joga de volta nela
      for (let s = 1.2; s <= G.max; s += 0.5) {
        probe.set(q.pos.x + dir.x * s, 0, q.pos.z + dir.z * s);
        test.copy(probe);
        resolveBody(this.w.arena, test, 0.35);
        if (test.distanceTo(probe) > 0.05) { if (s < bd) { bd = s; best = dir; } break; }
      }
    }
    return best || away;
  }

  fling(q) {
    const G = DEGOLIFICADA_CFG.grab;
    this.flung = this.flung || [];
    this.flung.push({ q, dir: this.wallDir(q), dist: 0 });
    this.w.audio.play('whip', { volume: 1, pitch: 0.4 });
    q.stun(G.max / G.speed + 0.4, 'stagger');
  }

  updateFlung(dt) {
    if (!this.flung || !this.flung.length) return;
    const G = DEGOLIFICADA_CFG.grab;
    const b = this.boss;
    this.flung = this.flung.filter((f) => {
      const q = f.q;
      if (q.state === 'ko') return false;
      const step = G.speed * dt;
      const ox = q.pos.x;
      const oz = q.pos.z;
      q.pos.x += f.dir.x * step;
      q.pos.z += f.dir.z * step;
      resolveBody(this.w.arena, q.pos, q.radius);
      q.vel.set(0, 0, 0);
      const moved = Math.hypot(q.pos.x - ox, q.pos.z - oz);
      f.dist += moved;
      if (Math.random() < 0.6) this.w.fx.burst(q.chestPos(new THREE.Vector3()), { count: 1, color: 0x6c6a66, kind: 'smoke', speed: 0.4, life: 0.35, size: 0.4 });
      const wall = moved < step * 0.35;
      if (!wall && f.dist < G.max) return true;
      // bateu na parede (ou caiu no chão)
      const back = f.dir.clone().negate();
      applyHit(this.w, b, q, { damage: this.dealt(wall ? G.wallDamage : G.landDamage), kind: 'ability', knockback: wall ? 3 : 2, hitstun: wall ? 0.8 : 0.5, dir: back, unblockable: true, ignoreInvuln: true, sound: wall ? 'heavyPunch' : 'impact', color: 0x6c6a66, scale: 1.2 });
      if (wall) {
        this.w.cameraRig.shake(0.3, 0.3);
        this.w.fx.burst(q.chestPos(new THREE.Vector3()), { count: 18, color: 0x8a8478, speed: 3, life: 0.5, size: 0.12 });
        q.notify('JOGADO NA PAREDE', true);
      }
      return false;
    });
  }

  // ------------------------------------------------ CABELO RASTEJANTE e CABELO POR CIMA (golpes que seguem sozinhos)
  startCast(kind) {
    const C = DEGOLIFICADA_CFG[kind];
    const b = this.boss;
    this.cds[kind] = C.cd * this.cdMult;
    this.setState('cast');
    this.castKind = kind;
    const p = this.target();
    if (p) b.yaw = yawTo(b.pos, p.pos);
    b.anim.play(kind === 'rain' ? 'taunt_roar' : 'ai_point', { restart: true, duration: C.windup + 0.3 });
    this.w.audio.play('whisper', { volume: 0.8, pitch: kind === 'rain' ? 0.7 : 1.2 });
    this.say(kind === 'rain' ? 'Cabelo por cima' : 'Cabelo rastejante');
    this.cast = false;
  }

  updateCast(dt) {
    const kind = this.castKind;
    const C = DEGOLIFICADA_CFG[kind];
    const p = this.target();
    if (p) this.float(dt, p, 0.4);
    if (this.st < (kind === 'rain' ? 0.25 : C.windup)) return;
    if (!this.cast) {
      this.cast = true;
      if (kind === 'crawl') for (const q of this.devourer ? this.players.concat(this.players).slice(0, 2) : [p]) q && this.spawnCrawler(q);
      else this.spawnRain();
    }
    if (this.st > (kind === 'rain' ? 0.6 : C.windup + 0.2)) this.backToDuel();
  }

  spawnCrawler(q) {
    const C = DEGOLIFICADA_CFG.crawl;
    const b = this.boss;
    const w = this.w;
    const at = new THREE.Vector3(b.pos.x, 0.06, b.pos.z);
    let dir = Math.atan2(q.pos.x - at.x, q.pos.z - at.z) + (Math.random() - 0.5) * 0.6;
    const headPt = at.clone();
    // o fio no chão: sai dela e segue a ponta
    const rope = inkTentacle(w, at.clone().setY(0.05), () => headPt, { grow: 0.05, hold: C.life, retract: 0.3, arc: 0.02, wiggle: 0.22, radius: 0.055, color: HAIR, emissive: HAIR_E, splash: false });
    const ring = groundMesh(w, new THREE.RingGeometry(0.35, 0.55, 20), WARN, 0.4);
    let t = 0;
    let done = false;
    this.hazards.push({
      update: (dt) => {
        if (done) return true;
        t += dt;
        dir = turnTowards(dir, Math.atan2(q.pos.x - headPt.x, q.pos.z - headPt.z), dt * C.turn);
        headPt.x += Math.sin(dir) * C.speed * dt;
        headPt.z += Math.cos(dir) * C.speed * dt;
        const probe = headPt.clone();
        resolveBody(w.arena, probe, 0.2);
        const blocked = probe.distanceTo(headPt) > 0.05;
        headPt.x = probe.x;
        headPt.z = probe.z;
        ring.position.set(headPt.x, 0.05, headPt.z);
        ring.material.opacity = 0.3 + Math.sin(t * 20) * 0.15;
        if (Math.random() < dt * 30) w.fx.burst(headPt.clone().setY(0.1), { count: 1, color: HAIR, kind: 'smoke', speed: 0.3, life: 0.4, size: 0.3 });
        const hit = this.players.find((x) => !x.isInvulnerable() && distXZ(x.pos, headPt) < C.hitR + x.radius);
        if (hit || t > C.life || blocked) {
          done = true;
          dropMesh(w, ring);
          rope.release && rope.release();
          // brota: os fios sobem do chão (debaixo de quem estiver ali)
          for (let i = 0; i < 3; i++) {
            const base = headPt.clone().add(v1.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5)).setY(0.02);
            inkTentacle(w, base, base.clone().setY(2.2 + Math.random() * 0.5), { grow: 0.08, hold: 0.18, retract: 0.3, arc: 0.05, wiggle: 0.18, radius: 0.07, color: HAIR, emissive: HAIR_E, splash: 0x2a2626 });
          }
          w.audio.play('clawHit', { volume: 0.7, pitch: 0.6 });
          for (const x of this.players) {
            if (x.isInvulnerable() || distXZ(x.pos, headPt) > C.hitR + x.radius + 0.3) continue;
            applyHit(w, this.boss, x, { damage: this.dealt(C.damage), kind: 'ability', launch: true, knockback: 2, hitstun: 0.6, sound: 'clawHit', color: 0x2a2626, scale: 1.1 });
          }
          return true;
        }
        return false;
      },
      dispose: () => { dropMesh(w, ring); },
    });
  }

  spawnRain() {
    const C = DEGOLIFICADA_CFG.rain;
    const w = this.w;
    const spots = [];
    for (const q of this.players) spots.push(q.pos.clone());
    const p = this.target();
    while (p && spots.length < C.count + (this.devourer ? 2 : 0)) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * C.spread;
      spots.push(new THREE.Vector3(p.pos.x + Math.sin(a) * r, 0, p.pos.z + Math.cos(a) * r));
    }
    spots.forEach((s, i) => {
      const at = s.clone().setY(0);
      resolveBody(w.arena, at, 0.3);
      const delay = i * 0.12;
      const disc = groundMesh(w, new THREE.CircleGeometry(C.radius, 24), WARN, 0);
      disc.position.set(at.x, 0.045, at.z);
      let t = -delay;
      let done = false;
      this.hazards.push({
        update: (dt) => {
          if (done) return true;
          t += dt;
          if (t < 0) return false;
          disc.material.opacity = 0.08 + 0.3 * Math.min(1, t / C.windup) + Math.sin(t * 30) * 0.04;
          if (t < C.windup) return false;
          done = true;
          dropMesh(w, disc);
          for (let k = 0; k < 3; k++) {
            const top = at.clone().add(v1.set((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6)).setY(5.5);
            inkTentacle(w, top, top.clone().setY(0.05), { grow: 0.09, hold: 0.2, retract: 0.35, arc: 0.04, wiggle: 0.1, radius: 0.06, color: HAIR, emissive: HAIR_E, splash: false });
          }
          w.fx.burst(at.clone().setY(0.1), { count: 8, color: 0x6c6a66, kind: 'smoke', speed: 1, life: 0.4, size: 0.4 });
          w.audio.play('whip', { volume: 0.5, pitch: 0.8 + Math.random() * 0.3 });
          for (const x of this.players) {
            if (x.isInvulnerable() || distXZ(x.pos, at) > C.radius + x.radius * 0.5) continue;
            applyHit(w, this.boss, x, { damage: this.dealt(C.damage), kind: 'ability', knockback: 2, hitstun: 0.45, sound: 'clawHit', color: 0x2a2626, scale: 1 });
          }
          return true;
        },
        dispose: () => dropMesh(w, disc),
      });
    });
  }

  // ------------------------------------------------ ARREMESSAR OBJETOS: o cabelo pega uma caixa e joga no jogador.
  // Ao quebrar, de uma caixa do bunker pode sair uma PROVA (Dungeon.onBossBoxBroken)
  throwables() {
    const b = this.boss;
    const C = DEGOLIFICADA_CFG.toss;
    return [...(this.d.bossBoxes || []), ...(this.d.props || [])].filter((x) => x.alive && !x.broken && !x.lifted && distXZ(x.pos, b.pos) < C.reach);
  }

  startToss() {
    const C = DEGOLIFICADA_CFG.toss;
    const b = this.boss;
    const list = this.throwables().sort((x, y) => distXZ(x.pos, b.pos) - distXZ(y.pos, b.pos));
    // as caixas do bunker primeiro (são as das provas)
    const obj = list.find((x) => x.kind === 'bossBox') || list[0];
    if (!obj) { this.next = 0.3; return; }
    this.cds.toss = C.cd * this.cdMult;
    this.setState('toss');
    this.obj = obj;
    obj.lift();
    this.objFrom = obj.pos.clone();
    b.yaw = yawTo(b.pos, obj.pos);
    b.anim.play('ai_point', { restart: true, duration: C.lift + 0.2 });
    this.w.audio.play('whip', { volume: 0.8, pitch: 0.7 });
    this.say('Arremessar');
    const objPt = () => obj.pos.clone().setY((obj.y || 0) + obj.height * 0.6);
    this.rope = inkTentacle(this.w, this.head(), objPt, { grow: 0.15, hold: C.lift + C.aim + 0.1, retract: 0.2, coil: true, arc: 0.4, radius: 0.07, color: HAIR, emissive: HAIR_E, splash: false });
    this.aimAt = null;
    this.flying = false;
  }

  updateToss(dt) {
    const C = DEGOLIFICADA_CFG.toss;
    const b = this.boss;
    const obj = this.obj;
    if (!obj || obj.broken || !obj.alive) { this.backToDuel(); return; }
    const hold = () => v1.set(b.pos.x - Math.sin(b.yaw) * 0.4, 3.0, b.pos.z - Math.cos(b.yaw) * 0.4);
    if (this.st < C.lift) {
      // puxa a caixa para cima da cabeça
      const k = this.st / C.lift;
      const e = 1 - (1 - k) * (1 - k);
      const h = hold();
      obj.moveTo(this.objFrom.x + (h.x - this.objFrom.x) * e, h.y * e, this.objFrom.z + (h.z - this.objFrom.z) * e);
      return;
    }
    if (this.st < C.lift + C.aim) {
      // mira: a marca no chão segue o alvo e trava no fim
      const p = this.target();
      if (p) {
        b.yaw = turnTowards(b.yaw, yawTo(b.pos, p.pos), dt * 6);
        if (!this.aimAt) { this.aimAt = p.pos.clone(); this.aimMark = this.mark(groundMesh(this.w, new THREE.RingGeometry(C.radius - 0.18, C.radius, 28), WARN, 0.3)); }
        if (this.st < C.lift + C.aim - 0.15) this.aimAt.lerp(p.pos, Math.min(1, dt * 10));
        this.aimMark.position.set(this.aimAt.x, 0.05, this.aimAt.z);
        this.aimMark.material.opacity = 0.3 + Math.sin(this.st * 30) * 0.12;
      }
      const h = hold();
      obj.moveTo(h.x + Math.sin(this.t * 40) * 0.04, h.y, h.z);
      return;
    }
    if (!this.flying) {
      this.flying = true;
      this.rope && this.rope.release && this.rope.release();
      this.rope = null;
      this.flyFrom = hold().clone();
      this.flyTo = (this.aimAt || this.target()?.pos || b.pos).clone().setY(0);
      resolveBody(this.w.arena, this.flyTo, 0.3);
      b.anim.play('ai_charge', { restart: true, duration: 0.5 });
      this.w.audio.play('whip', { volume: 1, pitch: 0.45 });
      // ela volta a flutuar; a caixa segue sozinha (golpe que segue)
      this.launchBox(obj, this.flyFrom, this.flyTo);
      this.obj = null;
      this.backToDuel();
    }
  }

  launchBox(obj, from, to) {
    const C = DEGOLIFICADA_CFG.toss;
    const w = this.w;
    const mark = this.aimMark;
    this.marks = this.marks.filter((m) => m !== mark); // a marca fica até a caixa cair
    this.aimMark = null;
    let t = 0;
    let done = false;
    this.hazards.push({
      update: (dt) => {
        if (done) return true;
        t += dt;
        const k = Math.min(1, t / C.flight);
        const y = from.y + (0.25 - from.y) * k + Math.sin(k * Math.PI) * C.peak;
        obj.moveTo(from.x + (to.x - from.x) * k, Math.max(0, y), from.z + (to.z - from.z) * k, k * 9);
        if (mark) mark.material.opacity = 0.35 + Math.sin(t * 34) * 0.15;
        // acerta quem estiver no caminho no fim da queda
        const low = k > 0.6;
        const hit = low && this.players.find((x) => !x.isInvulnerable() && distXZ(x.pos, obj.pos) < 0.9 + x.radius);
        if (k < 1 && !hit) return false;
        done = true;
        dropMesh(w, mark);
        w.cameraRig.shake(0.2, 0.25);
        for (const x of this.players) {
          if (x.isInvulnerable() || distXZ(x.pos, obj.pos) > C.radius + x.radius * 0.5) continue;
          applyHit(w, this.boss, x, { damage: this.dealt(C.damage), kind: 'ability', knockback: 6, hitstun: 0.55, sound: 'heavyPunch', color: 0x8a6a40, scale: 1.2 });
        }
        obj.moveTo(obj.pos.x, 0, obj.pos.z);
        obj.smash(this.boss);
        return true;
      },
      dispose: () => {
        dropMesh(w, mark);
        if (!done && obj.alive && !obj.broken) { obj.moveTo(obj.pos.x, 0, obj.pos.z); obj.smash(this.boss); }
      },
    });
  }

  // ------------------------------------------------ DEFESA DE CABELO: fecha os fios na frente e empurra de volta
  startGuard() {
    const C = DEGOLIFICADA_CFG.guard;
    const b = this.boss;
    this.cds.guard = C.cd * this.cdMult;
    this.near = 0;
    this.setState('guard');
    const p = this.target();
    if (p) b.yaw = yawTo(b.pos, p.pos);
    b.anim.play('ai_charge', { restart: true, duration: C.time });
    this.w.audio.play('whisper', { volume: 0.7, pitch: 1.6 });
    this.say('Defesa de cabelo');
    const from = this.head();
    for (let i = 0; i < 6; i++) {
      const a = b.yaw + (i / 5 - 0.5) * 2.2;
      const end = new THREE.Vector3(b.pos.x + Math.sin(a) * 1.0, 0.3 + (i % 3) * 0.55, b.pos.z + Math.cos(a) * 1.0);
      inkTentacle(this.w, from, end, { grow: 0.1, hold: C.time - 0.1, retract: 0.2, arc: 0.5, wiggle: 0.15, radius: 0.08, color: HAIR, emissive: HAIR_E, splash: false });
    }
    this.pushed = false;
  }

  updateGuard() {
    const C = DEGOLIFICADA_CFG.guard;
    const b = this.boss;
    if (this.st < C.time - 0.15) return;
    if (!this.pushed) {
      this.pushed = true;
      this.w.fx.ring(new THREE.Vector3(b.pos.x, 0.08, b.pos.z), { color: 0x3a3838, radius: C.push, life: 0.35 });
      this.w.audio.play('whip', { volume: 0.9, pitch: 0.5 });
      for (const q of this.players) {
        if (q.isInvulnerable() || distXZ(q.pos, b.pos) > C.push + q.radius) continue;
        applyHit(this.w, b, q, { damage: this.dealt(C.damage), kind: 'ability', knockback: C.knockback, hitstun: 0.45, sound: 'clawHit', color: 0x2a2626, scale: 1 });
      }
    }
    if (this.st > C.time) this.backToDuel();
  }

  // ------------------------------------------------ EXPLOSÃO DE CABELO (encurralada): empurra todos e desliza para o meio
  startBreakout() {
    const C = DEGOLIFICADA_CFG.breakout;
    const b = this.boss;
    this.cds.breakout = C.cd;
    this.cds.guard = Math.max(this.cds.guard, 1.2);
    this.cornered = 0;
    this.near = 0;
    this.setState('breakout');
    b.anim.play('taunt_roar', { restart: true, duration: C.windup + 0.3 });
    this.w.audio.play('whisper', { volume: 1, pitch: 1.9 });
    this.w.fx.ring(new THREE.Vector3(b.pos.x, 0.07, b.pos.z), { color: WARN, radius: C.radius, life: C.windup });
    this.say('Explosão de cabelo');
    this.pushed = false;
    // para onde deslizar: o meio do bunker (ou, sem ele, para longe de quem está perto)
    const home = this.d.bossHome;
    if (home) this.glideDir = new THREE.Vector3(home.x - b.pos.x, 0, home.z - b.pos.z);
    else {
      const c = new THREE.Vector3();
      for (const q of this.players) c.add(q.pos);
      c.multiplyScalar(1 / Math.max(1, this.players.length));
      this.glideDir = new THREE.Vector3(b.pos.x - c.x, 0, b.pos.z - c.z).multiplyScalar(-1);
    }
    if (this.glideDir.lengthSq() < 1e-4) this.glideDir.set(1, 0, 0);
    this.glideDir.normalize();
  }

  updateBreakout(dt) {
    const C = DEGOLIFICADA_CFG.breakout;
    const b = this.boss;
    if (this.st < C.windup) return;
    if (!this.pushed) {
      this.pushed = true;
      const from = this.head();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const end = new THREE.Vector3(b.pos.x + Math.sin(a) * C.radius, 0.4 + (i % 3) * 0.35, b.pos.z + Math.cos(a) * C.radius);
        inkTentacle(this.w, from, end, { grow: 0.06, hold: 0.1, retract: 0.25, arc: 0.2, wiggle: 0.1, radius: 0.08, color: HAIR, emissive: HAIR_E, splash: false });
      }
      this.w.fx.ring(new THREE.Vector3(b.pos.x, 0.08, b.pos.z), { color: 0x3a3838, radius: C.radius, life: 0.4 });
      this.w.audio.play('whip', { volume: 1, pitch: 0.4 });
      this.w.cameraRig.shake(0.22, 0.3);
      for (const q of this.players) {
        if (distXZ(q.pos, b.pos) > C.radius + q.radius) continue;
        const dir = new THREE.Vector3(q.pos.x - b.pos.x, 0, q.pos.z - b.pos.z);
        if (dir.lengthSq() < 1e-4) dir.copy(this.glideDir).multiplyScalar(-1);
        dir.normalize();
        // não dá para defender nem esquivar parado em cima dela: é a punição por prendê-la
        const res = applyHit(this.w, b, q, { damage: this.dealt(C.damage), kind: 'ability', knockback: C.knockback, hitstun: 0.5, dir, unblockable: true, ignoreInvuln: true, sound: 'clawHit', color: 0x2a2626, scale: 1.2 });
        if (typeof res === 'number' && q.state !== 'ko') q.stun(C.stun, 'stagger');
      }
    }
    // desliza para o meio (quase intocável enquanto desliza)
    const k = this.st - C.windup;
    if (k < C.glide) {
      b.pos.x += this.glideDir.x * C.glideSpeed * dt * (1 - k / C.glide);
      b.pos.z += this.glideDir.z * C.glideSpeed * dt * (1 - k / C.glide);
      resolveBody(this.w.arena, b.pos, b.radius);
      return;
    }
    this.backToDuel();
  }

  // ------------------------------------------------ GRITO RASGADO
  startScream() {
    const S = DEGOLIFICADA_CFG.scream;
    const b = this.boss;
    this.cds.scream = S.cd * this.cdMult;
    this.setState('scream');
    b.anim.play('taunt_roar', { restart: true, duration: S.windup + 0.6 });
    this.w.audio.play('fearGaze', { volume: 0.9, pitch: 0.4 });
    this.w.fx.ring(new THREE.Vector3(b.pos.x, 0.06, b.pos.z), { color: WARN, radius: S.radius, life: S.windup });
    this.say('Grito rasgado');
    this.screamed = false;
  }

  updateScream() {
    const S = DEGOLIFICADA_CFG.scream;
    const b = this.boss;
    if (this.st < S.windup) {
      if (b.rig.body) b.rig.body.position.x = Math.sin(this.t * 70) * 0.02;
      return;
    }
    if (!this.screamed) {
      this.screamed = true;
      if (b.rig.body) b.rig.body.position.x = 0;
      // a fita em X se rasga no grito (cânone) e volta depois — na Devoradora a boca já fica aberta
      this.mouth(true);
      this.w.after(0.75, () => { if (!this.devourer && this.boss) this.mouth(false); });
      this.w.audio.play('scare', { volume: 1.2, pitch: 1.4 });
      this.w.cameraRig.shake(0.4, 0.5);
      for (let i = 0; i < 3; i++) this.w.after(i * 0.08, () => this.w.fx.ring(b.chestPos(new THREE.Vector3()).setY(1.6), { color: 0xe0e8e0, radius: S.radius * (0.5 + i * 0.25), life: 0.45 }));
      for (const q of this.players) {
        if (distXZ(q.pos, b.pos) > S.radius + q.radius || q.isInvulnerable()) continue;
        const res = applyHit(this.w, b, q, { damage: this.dealt(S.damage), kind: 'ability', knockback: 3, hitstun: 0.3, unblockable: true, reaction: false, sound: 'impact', color: WARN, scale: 1.2 });
        if (typeof res === 'number' && q.state !== 'ko') { q.stun(S.stun, 'stagger'); q.notify('ENSURDECIDO', true); }
      }
    }
    if (this.st > S.windup + 0.6) this.backToDuel();
  }

  // a fita em X cede (true) ou volta (false): a boca enorme de dentes (peças do .glb)
  mouth(open) {
    const r = this.boss && this.boss.rig;
    if (!r || !r.props || !r.props.mouthTape) return;
    r.showProp('mouthTape', !open);
    for (const p of ['bigMouth', 'bigMouthGums', 'bigMouthTeeth']) r.showProp(p, open);
  }

  // ------------------------------------------------ DEVORADORA (a metamorfose de Sangue): maior, mais rápida, mais fios
  becomeDevourer(why) {
    const C = DEGOLIFICADA_CFG.devour;
    const b = this.boss;
    this.devourer = true;
    this.say(`Devoradora — ${why.toLowerCase()}`);
    this.w.audio.play('scare', { volume: 1.2, pitch: 0.6 });
    this.w.cameraRig.shake(0.35, 0.5);
    this.w.fx.burst(b.chestPos(v1).clone(), { count: 40, color: 0x7a0a10, speed: 3, life: 0.8, size: 0.14 });
    b.cpuEdge = { ...(b.cpuEdge || {}), dealt: (b.cpuEdge?.dealt ?? 1) * C.dealt };
    if (b.rig.root) b.rig.root.scale.multiplyScalar(C.size);
    // a fita em X cede: a boca enorme de dentes aparece, e os alunos presos no cabelo (cânone)
    if (b.rig.props) {
      b.rig.showProp('mouthTape', false);
      for (const p of DEGOLIFICADA_DEVOUR_PROPS) b.rig.showProp(p, true);
    }
  }

  // caiu: o FOGO AZUL (cânone: ao dizerem o nome do Gabriel, o fogo ficou azul e a criatura foi dissipada)
  onDeath() {
    const at = this.boss.chestPos(new THREE.Vector3()).clone();
    for (let i = 0; i < 6; i++) this.w.after(i * 0.12, () => this.w.fx.burst(at.clone().setY(0.3 + i * 0.25), { count: 26, color: i % 2 ? 0x3a7aff : 0x8ab8ff, speed: 2.2, up: 3, life: 1, size: 0.2, gravity: -2 }));
    this.w.audio.play('ritual', { volume: 1, pitch: 0.8 });
  }

  dispose() {
    const b = this.boss;
    this.clearMarks();
    for (const h of this.hazards) h.dispose && h.dispose();
    this.hazards = [];
    this.flung = [];
    this.w.onHit = this.prevHit || null;
    this.d.pveHud && this.d.pveHud.setShield(0, 0);
    if (!b) return;
    b.lethalHook = null;
    b.noFlinch = false;
    this.holdCpu(false);
    if (b.rig.body) b.rig.body.position.set(0, 0, 0);
    b.moveSpeed = this.baseSpeed;
    if (this.devourer && b.rig.root) b.rig.root.scale.divideScalar(DEGOLIFICADA_CFG.devour.size);
    if (this.devourer && b.rig.props) {
      b.rig.showProp('mouthTape', true);
      for (const p of DEGOLIFICADA_DEVOUR_PROPS) b.rig.showProp(p, false);
    }
  }
}
