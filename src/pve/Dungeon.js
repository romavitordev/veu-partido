// OUTRO LADO — uma dungeon (TODO §4.1): entrar, explorar, os Devorados, o chefe, a recompensa, a porta de saída.
// Faz o papel da Match (mesma interface para o main.js: update, render, dispose, fighters, phase, timer, wins) em cima
// do World de sempre, com DOIS lutadores: o jogador (fighters[0]) e o "inimigo da vez" (fighters[1]) — primeiro os
// Devorados (cópias do lutador do jogador), depois o chefe. Entre um encontro e outro o inimigo fica escondido na próxima
// sala (`lurking`: invisível, sem agir e sem travar a mira). Os Devorados menores são NPCs (combat/npcs.js).
import * as THREE from 'three';
import { COMBAT } from '../config/combat.js';
import { World } from '../game/World.js';
import { buildModel, isModelLoaded } from '../models/index.js';
import { CpuController } from '../ai/CpuController.js';
import { DanteClone } from '../combat/npcs.js';
import { resolveBody } from '../combat/positioning.js';
import { distXZ } from '../core/util.js';
import { DUNGEONS, PVE_DIFFICULTIES, depthScale, rollHeal } from './dungeons.js';
import { computeMods, gainXp, rollChoices } from './upgrades.js';
import { devoradoDef, restyleDevorado, copiaOpts } from './devorado.js';
import { Pickup, Chest } from './pickups.js';
import { rollChest } from './unlocks.js';
import { PveHud } from './pveHud.js';
import { Closet, EspreitadorBrain, PeekingCrack } from './espreitador.js';
import { EspreitadorIntro } from './espreitadorIntro.js';
import { MansionAmbience } from './ambience.js';
import espreitadorDef from '../characters/bosses/espreitador.js';

const BOSSES = { espreitador: espreitadorDef };
// feedback do dono (2026-11-05): as salas acabavam rápido demais; os Devorados ficaram mais fortes para durar mais
const DEVORADO_HP = 820;
const MINION_DEALT = 0.8; // os Devorados batem 20% mais fraco que o lutador copiado
const COPIA_HP = 160;
const COPIA_DMG = 0.45;
const v1 = new THREE.Vector3();

export class Dungeon {
  constructor({ renderer, audio, input, hud, playerDef, run, profile, dungeonId = 'espreitador', onEnd }) {
    this.isDungeon = true;
    this.training = false;
    this.timer = 0;
    this.wins = [0, 0];
    this.round = 1;
    this.hud = hud;
    this.audio = audio;
    this.input = input;
    this.onEnd = onEnd;
    this.run = run; // a tentativa (pve/save.js newAttempt): nível, xp, melhorias, profundidade, dificuldade
    this.profile = profile; // o perfil permanente do personagem (a árvore)
    this.D = DUNGEONS[dungeonId];
    this.diff = PVE_DIFFICULTIES[run.difficulty] || PVE_DIFFICULTIES.normal;
    const depth = depthScale(run.depth);
    this.scale = { hp: this.diff.hp * depth, dealt: this.diff.dealt * depth };
    this.playerDef = playerDef;
    this.stats = { kills: 0, copias: 0, time: 0, damage: 0, coins: 0, chests: 0 };
    this.world = new World({ renderer, audio, input, ui: hud });
    const devDef = devoradoDef(playerDef, { hp: Math.round(DEVORADO_HP * this.scale.hp) });
    this.devDef = devDef;
    this.world.setup([playerDef, devDef], this.D.arena);
    const w = this.world;
    // o inimigo da vez: o modelo do jogador pintado de Devorado
    const enemy = this.enemy;
    w.scene.remove(enemy.rig.root);
    enemy.applyDef(devDef, restyleDevorado(buildModel(playerDef.model)));
    enemy.maxHealth = devDef.stats.maxHealth;
    enemy.health = enemy.maxHealth;
    this.applyPlayerMods(true);
    w.onKO = (f) => this.onKO(f);
    w.onTransform = (f) => { if (f === this.player) this.applyPlayerMods(false, true); this.hud.bind(w.fighters); };
    w.onSwitch = () => this.hud.bind(w.fighters);
    w.onDrain = () => {};
    w.cameraFocus = () => this.cameraTargets();
    // pontos que a câmera enquadra além do jogador; visible + chestPos: as paredes na frente deles também ficam transparentes
    const camPt = () => { const o = { pos: new THREE.Vector3(), size: 1, visible: true, chestPos: (v = new THREE.Vector3()) => v.set(o.pos.x, 1.2, o.pos.z) }; return o; };
    this.focusPt = camPt();
    this.npcPt = camPt();
    this.pickups = [];
    this.gates = [];
    this.copias = [];
    this.roomIdx = 0;
    this.phase = 'loading';
    this.phaseTime = 0;
    // o território: os armários do quarto, a fresta do corredor, a porta de saída e as portas trancadas
    this.closets = this.D.closets.map((s, i) => new Closet(w, enemy, s, i));
    const stalk = this.D.rooms.find((r) => r.kind === 'stalk');
    this.crack = stalk ? new PeekingCrack(w, stalk.peek) : null;
    this.exitRoom = this.D.rooms.find((r) => r.kind === 'exit');
    this.exitDoor = this.makeExitDoor(this.exitRoom.door);
    this.lurk(this.nextFightRoom(0));
    this.spawnChests();
    this.ambience = new MansionAmbience(this);
    this.player.pos.set(w.arena.spawns[0].x, 0, w.arena.spawns[0].z);
    this.player.yaw = Math.PI / 2;
    // câmera fixa em 3ª pessoa (CameraRig.updateChase), começando nas costas de quem entra (olhando para +x)
    w.cameraRig.chase = () => this.chaseTarget();
    w.cameraRig.yaw = -Math.PI / 2;
    w.cameraRig.distance = 4.4;
    w.cameraRig.height = 2.3;
    w.cameraRig.update(0, [this.player], true);
    // a luz fraca que anda com o jogador: na 3ª pessoa a câmera olha para os cantos que as luzes da casa não pegam
    this.lamp = new THREE.PointLight(0xffd8a8, 7, 8, 1.6);
    w.scene.add(this.lamp);
    this.drip = 2;
  }

  get fighters() { return this.world.fighters; }
  get player() { return this.world.fighters[0]; }
  get enemy() { return this.world.fighters[1]; }

  // ------------------------------------------------ o jogador: melhorias da tentativa + árvore permanente
  applyPlayerMods(fill = false, keepRatio = false) {
    const p = this.player;
    const m = computeMods(this.run.picks, this.profile.tree);
    const ratio = p.health / p.maxHealth;
    const baseHp = p.def.stats?.maxHealth ?? COMBAT.maxHealth;
    const before = p.maxHealth;
    p.maxHealth = Math.round(baseHp * m.hpMult);
    if (fill) p.health = p.maxHealth;
    else if (keepRatio) p.health = Math.max(1, Math.round(p.maxHealth * ratio));
    else p.health = Math.min(p.maxHealth, p.health + Math.max(0, p.maxHealth - before)); // ganhou vida máxima: cura o que ganhou
    p.moveSpeed = (p.def.stats?.moveSpeed ?? COMBAT.moveSpeed) * m.speedMult;
    m.onDealt = (dealt, kind) => {
      if (m.lifesteal > 0 && kind === 'melee') p.health = Math.min(p.maxHealth, p.health + dealt * m.lifesteal);
      this.stats.damage += dealt;
    };
    p.pveMods = m;
    this.mods = m;
  }

  // ------------------------------------------------ começo
  beginIntro() {
    const h = this.hud;
    h.reset();
    this.pveHud = new PveHud(h);
    h.bind(this.world.fighters);
    h.show(true);
    h.root.classList.add('pve-noboss');
    this.pveHud.setPlace(this.D.place, this.D.rooms[0].title);
    this.pveHud.setObjective(this.D.rooms[0].objective);
    this.pveHud.setRun(this.run, this.run.depth);
    this.pveHud.setCoins(this.coinsTotal ? this.coinsTotal() : 0);
    this.pveHud.fade(true, 0);
    requestAnimationFrame(() => this.pveHud && this.pveHud.fade(false, 1.2));
    this.phase = 'intro';
    this.phaseTime = 0;
    this.player.setState('intro');
    this.player.anim.play('idle', { restart: true });
    this.audio.play('creak', { volume: 0.7, pitch: 0.7 });
  }

  // ------------------------------------------------ salas
  nextFightRoom(from) {
    for (let i = from; i < this.D.rooms.length; i++) if (this.D.rooms[i].kind === 'fight' || this.D.rooms[i].kind === 'boss') return this.D.rooms[i];
    return null;
  }

  // o inimigo some e espera na próxima sala de luta
  lurk(room) {
    const e = this.enemy;
    e.lurking = true;
    e.setVisible(false);
    e.setState('intro');
    e.vel.set(0, 0, 0);
    if (room) e.pos.set(room.spawn.x, 0, room.spawn.z);
    this.hud.root.classList.add('pve-noboss');
  }

  enterRoom(i) {
    this.roomIdx = i;
    const r = this.D.rooms[i];
    this.pveHud.setPlace(this.D.place, r.title);
    this.pveHud.setObjective(r.objective);
    if (r.kind === 'fight') this.startEncounter(r);
    else if (r.kind === 'boss') this.startBoss(r);
    else if (r.kind === 'stalk') this.pveHud.hint('Uma fresta no corredor… NÃO OLHE para ela (defenda para desviar o olhar)');
  }

  addGate(x, side, { visual = true } = {}) {
    const g = { x, side, open: false };
    if (visual) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ color: 0x050306, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false }));
      m.position.set(x, 1.6, 0);
      m.rotation.y = Math.PI / 2;
      this.world.scene.add(m);
      g.mesh = m;
      g.k = 0;
    }
    this.gates.push(g);
    return g;
  }

  openGate(g) {
    if (!g || g.open) return;
    g.open = true;
    this.audio.play('creak', { volume: 0.8 });
  }

  // a porta trancada: o jogador (e o que for dele) não passa
  applyGates(dt) {
    const p = this.player;
    for (const g of this.gates) {
      if (g.mesh) {
        g.k += ((g.open ? 0 : 0.86) - g.k) * Math.min(1, dt * 4);
        g.mesh.material.opacity = g.k;
        g.mesh.visible = g.k > 0.02;
        if (!g.open && Math.random() < dt * 10) this.world.fx.burst(v1.set(g.x, 0.4 + Math.random() * 2.2, (Math.random() - 0.5) * 2.4).clone(), { count: 1, color: Math.random() < 0.3 ? 0xf2c230 : 0x1a1418, kind: Math.random() < 0.3 ? undefined : 'smoke', speed: 0.4, life: 0.8, size: 0.25 });
      }
      if (g.open) continue;
      if (g.side === 'max' && p.pos.x > g.x - 0.55) p.pos.x = g.x - 0.55;
      if (g.side === 'min' && p.pos.x < g.x + 0.55) p.pos.x = g.x + 0.55;
    }
  }

  startEncounter(r) {
    const e = this.enemy;
    this.encounter = { room: r, gate: this.addGate(r.gate, 'max'), back: this.addGate(r.enter - 0.9, 'min'), done: false, koAt: null };
    e.lurking = false;
    e.maxHealth = Math.round(DEVORADO_HP * this.scale.hp);
    e.reset();
    e.pos.set(r.spawn.x, 0, r.spawn.z);
    e.yaw = Math.atan2(this.player.pos.x - e.pos.x, this.player.pos.z - e.pos.z);
    e.setVisible(true);
    this.attachEnemyCpu(this.diff.minion);
    e.cpuEdge = { dealt: this.scale.dealt * MINION_DEALT, taken: 1 };
    this.world.fx.burst(e.chestPos(v1).clone(), { count: 30, color: 0x6c6a66, kind: 'smoke', speed: 2, life: 0.7, size: 0.7, grow: 1 });
    this.audio.play('fearGaze', { volume: 0.5, pitch: 0.8 });
    this.hud.root.classList.remove('pve-noboss');
    this.hud.root.classList.add('pve-minor');
    this.hud.bind(this.world.fighters);
    // as cópias menores (Cópia Observada) junto do Devorado
    const n = r.enemies.copias || 0;
    for (let i = 0; i < n; i++) {
      const o = copiaOpts(this.playerDef, { hp: Math.round(COPIA_HP * this.scale.hp), damageMult: COPIA_DMG, onSlain: (c) => this.onCopiaSlain(c) });
      const c = new DanteClone(e, this.world, i, Infinity, o);
      const ang = Math.PI / 2 + ((i + 0.5) / n) * Math.PI * 2; // em volta do Devorado
      c.pos.set(r.spawn.x + Math.sin(ang) * 2.2, 0, r.spawn.z + Math.cos(ang) * 2.2);
      resolveBody(this.world.arena, c.pos, c.radius);
      this.world.addNpc(c);
      this.copias.push(c);
    }
    this.pveHud.hint(null);
  }

  attachEnemyCpu(level) {
    const p2 = this.input.players[1];
    p2.setVirtual(null);
    p2.cpu = new CpuController({ level });
    p2.cpu.attach(this.enemy);
  }

  startBoss(r) {
    const w = this.world;
    const e = this.enemy;
    const def = BOSSES[this.D.boss];
    this.encounter = { room: r, gate: this.addGate(r.gate, 'max', { visual: false }), back: this.addGate(r.enter - 0.9, 'min'), boss: true, done: false };
    w.scene.remove(e.rig.root);
    // sem o modelo próprio (falhou o download): o corpo do Carniçal, para a luta não travar
    e.applyDef(def, buildModel(isModelLoaded(def.model) ? def.model : 'carnical'));
    e.lurking = false;
    e.maxHealth = Math.round(def.stats.maxHealth * this.scale.hp);
    e.reset();
    // ele sai do armário mais perto da porta: primeiro a CENA (pve/espreitadorIntro.js), depois a luta
    const c0 = this.closets.slice().sort((a, b) => distXZ(a.pos, this.player.pos) - distXZ(b.pos, this.player.pos))[0];
    this.hud.root.classList.add('pve-noboss');
    this.pveHud.hint(null);
    this.bossIntro = new EspreitadorIntro(this, c0);
  }

  // fim da cena de entrada: a luta começa
  beginBossFight() {
    const w = this.world;
    const e = this.enemy;
    this.bossIntro = null;
    resolveBody(w.arena, e.pos, e.radius);
    e.setState('idle');
    this.player.setState('idle');
    this.attachEnemyCpu(this.diff.cpu);
    e.cpuEdge = { dealt: this.scale.dealt, taken: 1 };
    for (const c of this.closets) { if (c.open) { c.alive = true; w.addNpc(c); } }
    this.brain = new EspreitadorBrain(this, { closets: this.closets, playerDef: this.playerDef });
    this.hud.root.classList.remove('pve-noboss', 'pve-minor');
    this.hud.bind(w.fighters);
    this.pveHud.hint('Os ARMÁRIOS são as frestas dele: bata neles para TRANCAR · OLHOS AMARELOS acesos = ele vai sair por ali');
    this.hintT = 7;
  }

  onClosetLocked(c, openLeft) {
    this.popup(0, openLeft ? `FRESTA TRANCADA (${openLeft} aberta${openLeft > 1 ? 's' : ''})` : 'TODAS AS FRESTAS TRANCADAS!', '#f2c230');
  }

  // ------------------------------------------------ baús
  spawnChests() {
    const C = this.D.chests;
    if (!C) return;
    const spots = C.spots.slice();
    for (let i = 0; i < C.count && spots.length; i++) {
      const s = spots.splice(Math.floor(Math.random() * spots.length), 1)[0];
      const pos = new THREE.Vector3(s.x, 0, s.z);
      resolveBody(this.world.arena, pos, 0.6);
      this.pickups.push(new Chest(this.world, { pos, yaw: Math.random() * Math.PI * 2, onOpen: (p, c) => this.openChest(c) }));
    }
  }

  openChest(c) {
    this.stats.chests++;
    const r = rollChest(Math.random, this.run.depth);
    if (r.kind === 'coins') this.giveCoins(r.amount);
    else if (r.kind === 'heal') this.pickups.push(new Pickup(this.world, { kind: 'heal', pos: { x: c.pos.x + 0.9, z: c.pos.z }, amount: r.amount }));
    else this.giveXp(r.amount);
  }

  // as moedas entram no save NA HORA (a morte não leva): o flow.js grava (onCoins)
  giveCoins(n) {
    this.stats.coins += n;
    this.audio.play('pickup', { volume: 1, pitch: 1.4 });
    this.popup(0, `+${n} MOEDAS`, '#ffc040');
    this.onCoins && this.onCoins(n);
    this.pveHud && this.pveHud.setCoins(this.coinsTotal ? this.coinsTotal() : this.stats.coins);
  }

  // ------------------------------------------------ mortes, drops, experiência
  onKO(f) {
    if (f === this.player) {
      if (this.phase === 'dead') return;
      this.phase = 'dead';
      this.phaseTime = 0;
      this.hud.callout('DEVORADO', '#ff4a3a');
      this.audio.play('ko', { volume: 1.2 });
      this.pveHud.hint(null);
      return;
    }
    if (!this.encounter || this.encounter.done) return;
    const at = f.pos.clone();
    if (this.encounter.boss) {
      this.encounter.done = true;
      this.brain && this.brain.dispose();
      this.brain = null;
      this.bossDeadAt = at;
      this.phase = 'bossDown';
      this.phaseTime = 0;
      this.hud.callout('O ESPREITADOR CAIU', '#ffd84a');
      this.pveHud.hint(null);
      for (const c of this.copias) if (c.alive) c.kill();
      // as frestas morrem com ele: os armários fecham e o quarto se abre
      for (const c of this.closets) if (c.open) c.lock({ forever: true });
      this.openGate(this.encounter.gate);
      this.openGate(this.encounter.back);
      return;
    }
    this.encounter.koAt = this.world.time;
    this.stats.kills++;
    this.giveXp(this.D.xp.devorado);
    this.tryHeal(at, 1);
    if (this.mods.killHeal) this.player.health = Math.min(this.player.maxHealth, this.player.health + this.player.maxHealth * this.mods.killHeal);
  }

  onCopiaSlain(n) {
    this.stats.copias++;
    this.giveXp(this.D.xp.copia);
    this.tryHeal(n.pos, 0.6);
    if (this.mods.killHeal) this.player.health = Math.min(this.player.maxHealth, this.player.health + this.player.maxHealth * this.mods.killHeal * 0.5);
  }

  tryHeal(pos, mult) {
    const amount = rollHeal(this.D.id, Math.random, mult * this.diff.drop * (this.mods.dropMult || 1));
    if (!amount) return;
    this.pickups.push(new Pickup(this.world, { kind: 'heal', pos: { x: pos.x, z: pos.z }, amount }));
  }

  giveXp(n) {
    n = Math.round(n * (this.mods.xpMult || 1));
    const ups = gainXp(this.run, n);
    this.popup(0, `+${n} XP`, '#ffd84a');
    this.pendingUps = (this.pendingUps || 0) + ups;
    this.pveHud.setRun(this.run, this.run.depth);
  }

  popup(i, text, color) {
    this.hud.popup(i, text, color);
  }

  hint(text) {
    this.pveHud && this.pveHud.hint(text);
  }

  // abre as cartas de melhoria (o jogo para enquanto escolhe)
  openLevelUp() {
    this.pendingUps--;
    const choices = rollChoices(this.run.picks);
    if (!choices.length) return;
    this.audio.play('levelUp', { volume: 1 });
    this.choosing = true;
    this.pveHud.openChoice(choices, this.run, (id) => {
      this.run.picks.push(id);
      this.applyPlayerMods(false);
      this.pveHud.setRun(this.run, this.run.depth);
      this.choosing = false;
      this.hud.callout(choices.find((u) => u.id === id).name.toUpperCase(), '#ffd84a');
    });
  }

  // ------------------------------------------------ câmera: luta = os dois; exploração = o jogador e um ponto à frente
  cameraTargets() {
    const p = this.player;
    const e = this.enemy;
    const active = e.visible && !e.lurking && e.state !== 'intro' && distXZ(p.pos, e.pos) < 16;
    if (this.phase === 'exit') return [p, this.focusAt(p.pos.x + 3, p.pos.z)];
    if (active) return [p, e];
    let near = null; let nd = 11;
    for (const n of this.world.npcs) {
      if (!n.alive || n.isCloset || n.owner === p) continue;
      const d = distXZ(n.pos, p.pos);
      if (d < nd) { nd = d; near = n; }
    }
    if (near) { this.npcPt.pos.copy(near.pos); return [p, this.npcPt]; }
    // no quarto, com ele escondido numa fresta: enquadra o jogador e o meio do quarto (não entrega onde ele está)
    if (this.encounter && this.encounter.boss && !this.encounter.done) return [p, this.focusAt((p.pos.x + 50) / 2, p.pos.z * 0.5)];
    return [p, this.focusAt(p.pos.x + 4.5, p.pos.z * 0.6)]; // um ponto à frente: a câmera abre e mostra para onde ir
  }

  // 3ª pessoa: com inimigo por perto, a câmera fica atrás do jogador olhando para ele
  chaseTarget() {
    const p = this.player;
    const e = this.enemy;
    const out = { player: p, focus: null };
    if (e.visible && !e.lurking && e.state !== 'intro' && distXZ(p.pos, e.pos) < 16) { out.focus = e.pos; return out; }
    let near = null; let nd = 9;
    for (const n of this.world.npcs) {
      if (!n.alive || n.isCloset || n.owner === p) continue;
      const d = distXZ(n.pos, p.pos);
      if (d < nd) { nd = d; near = n; }
    }
    if (near) out.focus = near.pos;
    return out;
  }

  focusAt(x, z) {
    this.focusPt.pos.set(x, 0, z);
    return this.focusPt;
  }

  // ------------------------------------------------ porta de saída
  makeExitDoor(spot) {
    const g = new THREE.Group();
    const pivot = new THREE.Group();
    pivot.position.set(0, 0, -1.2);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 2.4), new THREE.MeshToonMaterial({ color: 0x3a2618 }));
    door.position.set(0, 1.3, 1.2);
    const eye = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), new THREE.MeshBasicMaterial({ color: 0xf2c230, toneMapped: false }));
    eye.position.set(-0.07, 1.6, 1.2);
    eye.rotation.y = -Math.PI / 2;
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.6), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
    glow.position.set(0.1, 1.3, 0);
    glow.rotation.y = Math.PI / 2;
    pivot.add(door, eye);
    g.add(pivot, glow);
    g.position.set(spot.x - 0.4, 0, spot.z);
    this.world.scene.add(g);
    return { group: g, pivot, eye, glow, open: 0, unlocked: false, gate: this.addGate(spot.x - 0.3, 'max', { visual: false }) };
  }

  unlockExit() {
    const d = this.exitDoor;
    if (d.unlocked) return;
    d.unlocked = true;
    this.openGate(d.gate);
    this.audio.play('creak', { volume: 1, pitch: 0.6 });
    this.hud.callout('A SAÍDA SE ABRIU', '#ffd84a');
    this.pveHud.setObjective('Atravesse a porta');
    this.pveHud.hint('A porta de saída está aberta →');
    this.hintT = 4;
  }

  updateExitDoor(dt) {
    const d = this.exitDoor;
    d.open += ((d.unlocked ? 1 : 0) - d.open) * Math.min(1, dt * 1.6);
    d.pivot.rotation.y = -d.open * 1.5;
    d.glow.material.opacity = d.unlocked ? 0.12 + Math.sin(this.world.time * 3) * 0.06 : 0;
    d.eye.visible = !d.unlocked;
  }

  // ------------------------------------------------ loop
  update(dt) {
    this.lastDt = dt;
    if (this.phase === 'loading' || this.phase === 'over' || this.disposed) return;
    // a cena de entrada do Espreitador: o mundo anda (animações, câmera), mas ninguém luta
    if (this.bossIntro) {
      this.phaseTime += dt;
      this.world.update(dt);
      for (const c of this.closets) if (c !== this.bossIntro.c) c.tick(dt);
      if (this.bossIntro.update(dt, this.input)) this.beginBossFight();
      this.hud.update(this);
      return;
    }
    // escolhendo melhoria: o mundo para
    if (this.choosing) {
      this.pveHud.updateChoice(this.input, this.audio);
      this.hud.update(this);
      return;
    }
    if (this.pendingUps > 0 && this.phase !== 'dead' && this.phase !== 'exit' && this.player.state !== 'ko' && !this.world.cinematic) {
      this.openLevelUp();
      return;
    }
    this.phaseTime += dt;
    this.stats.time += dt;
    const w = this.world;
    const p = this.player;
    w.update(dt);
    this.applyGates(dt);
    this.updateExitDoor(dt);
    this.lamp.position.set(p.pos.x, p.pos.y + 2.4, p.pos.z);
    this.ambience.update(dt);
    for (const c of this.closets) if (!this.brain) c.tick(dt);
    for (const k of this.pickups) k.update(dt, [p]);
    this.pickups = this.pickups.filter((k) => k.alive);
    this.copias = this.copias.filter((c) => c.alive);
    if (this.hintT > 0) { this.hintT -= dt; if (this.hintT <= 0) this.pveHud.hint(null); }
    // a goteira (o som da Mansão)
    this.drip -= dt;
    if (this.drip <= 0) { this.drip = 1.6 + Math.random() * 2.6; this.audio.play('drip', { volume: 0.35 + Math.random() * 0.25, pitch: 0.9 + Math.random() * 0.25 }); }
    // as melhorias de regeneração (Carne Dura)
    if (this.mods.regenHp > 0 && p.state !== 'ko' && !['hitstun', 'downed', 'stun', 'grabbed'].includes(p.state)) p.health = Math.min(p.maxHealth, p.health + p.maxHealth * this.mods.regenHp * dt);

    switch (this.phase) {
      case 'intro':
        if (this.phaseTime > 1.1) {
          p.setState('idle');
          this.phase = 'explore';
          this.hud.banner(this.D.name.toUpperCase(), this.D.color);
          this.pveHud.hint('Explore a mansão →');
          this.hintT = 3.5;
        }
        break;
      case 'explore':
      case 'fight':
        this.updateRooms(dt);
        break;
      case 'bossDown':
        this.updateRooms(dt);
        if (this.phaseTime > 2.2 && !this.reward) {
          const e = this.enemy;
          w.fx.burst(e.chestPos(v1).clone(), { count: 40, color: 0x2a2620, kind: 'smoke', speed: 2.4, life: 0.9, size: 0.8, grow: 1 });
          this.lurk(null);
          this.reward = new Pickup(w, { kind: 'reward', pos: { x: this.bossDeadAt.x, z: this.bossDeadAt.z }, radius: 1.1, onTake: () => this.takeReward() });
          this.pickups.push(this.reward);
          this.pveHud.setObjective('Colete a recompensa');
          this.pveHud.hint('Vá até a recompensa onde ele caiu');
          this.hintT = 4;
        }
        break;
      case 'exit':
        this.updateExit(dt);
        break;
      case 'dead':
        if (this.phaseTime > 2.6 && !this.ended) {
          this.ended = true;
          this.pveHud.fade(true, 0.8);
          w.after(0.9, () => this.finish('death'));
        }
        break;
      default:
        break;
    }
    // o crack do corredor (etapa 2: perseguição)
    if (this.crack) {
      const inside = p.pos.x > 7 && p.pos.x < 16.5;
      const draining = this.crack.update(dt, p, inside && this.phase === 'explore');
      this.hud.vignette.classList.toggle('on', draining);
    }
    this.pveHud.setTime(this.stats.time);
    this.hud.update(this);
  }

  updateRooms() {
    const p = this.player;
    // entrou numa sala nova (o mapa é em linha: pela posição x)
    const rooms = this.D.rooms;
    for (let i = this.roomIdx + 1; i < rooms.length; i++) {
      const r = rooms[i];
      if (r.enter !== undefined && p.pos.x > r.enter && (!this.encounter || this.encounter.done)) { this.enterRoom(i); break; }
    }
    const enc = this.encounter;
    if (enc && !enc.done && !enc.boss) {
      // o Devorado caiu: some, e a sala termina quando não sobra cópia
      if (enc.koAt !== null && this.world.time - enc.koAt > 1.3 && !this.enemy.lurking) {
        this.world.fx.burst(this.enemy.chestPos(v1).clone(), { count: 30, color: 0x6c6a66, kind: 'smoke', speed: 2, life: 0.7, size: 0.7, grow: 1 });
        this.lurk(this.nextFightRoom(this.roomIdx + 1));
      }
      if (enc.koAt !== null && this.enemy.lurking && !this.copias.length) {
        enc.done = true;
        this.openGate(enc.gate);
        this.openGate(enc.back);
        this.hud.root.classList.remove('pve-minor');
        this.hud.callout('SALA LIMPA', '#7dffb0');
        this.pveHud.setObjective('Siga em frente');
        this.pveHud.hint('A porta se abriu →');
        this.hintT = 3;
      }
    }
    if (this.brain && enc && enc.boss && !enc.done) this.brain.update(this.lastDt);
    // atravessou a porta de saída
    if (this.exitDoor.unlocked && p.pos.x > this.exitRoom.door.x + 0.4 && this.phase !== 'exit') this.startExit();
  }

  takeReward() {
    this.giveXp(this.D.xp.boss);
    if (this.D.chests && this.D.chests.coinsBoss) this.giveCoins(Math.round(this.D.chests.coinsBoss * (1 + 0.25 * (this.run.depth - 1))));
    this.rewardTaken = true;
    this.onReward && this.onReward(this); // o main.js grava o nível e o ponto permanente (uma vez por dungeon)
    this.hud.callout('+1 NÍVEL DO PERSONAGEM', '#ffd84a');
    this.popup(0, '+1 PONTO PERMANENTE', '#ffd84a');
    this.unlockExit();
  }

  // TODO §9: a câmera vai para trás do personagem, que anda pelo corredor; a tela escurece e a próxima carrega
  startExit() {
    const p = this.player;
    const w = this.world;
    this.phase = 'exit';
    this.phaseTime = 0;
    this.pveHud.hint(null);
    p.cancelAction && p.cancelAction();
    p.setState('intro');
    p.yaw = Math.PI / 2;
    p.anim.play('walk', { restart: true });
    const cam = w.cameraRig;
    const from = cam.pos.clone();
    cam.playShots([{
      dur: 4,
      fov: 50,
      pos: (k) => v1.set(p.pos.x - 3.4, 1.9 + 0.2 * k, p.pos.z * 0.5).lerp(from, Math.max(0, 1 - k * 4)),
      look: () => new THREE.Vector3(p.pos.x + 4, 1.3, 0),
    }]);
  }

  updateExit(dt) {
    const p = this.player;
    p.pos.x += 2.1 * dt;
    p.pos.z += (0 - p.pos.z) * Math.min(1, dt * 2);
    p.yaw = Math.PI / 2;
    if (p.anim.currentName !== p.anim.resolve('walk')) p.anim.play('walk');
    if (this.phaseTime > 2.2 && !this.fading) { this.fading = true; this.pveHud.fade(true, 1.2); }
    if (this.phaseTime > 3.6 && !this.ended) { this.ended = true; this.finish('clear'); }
  }

  // o fim vai para o próximo quadro: o main.js desmonta a dungeon, e isso não pode acontecer no meio do update dela
  finish(result) {
    if (this.phase === 'over') return;
    this.phase = 'over';
    setTimeout(() => { if (!this.disposed) this.onEnd && this.onEnd({ result, stats: this.stats, run: this.run }); }, 0);
  }

  // a tentativa abandonada pelo menu de pausa
  quit() {
    this.finish('quit');
  }

  render() {
    this.world.render();
  }

  dispose() {
    this.disposed = true;
    this.bossIntro && this.bossIntro.dispose();
    this.ambience && this.ambience.dispose();
    this.brain && this.brain.dispose();
    for (const k of this.pickups) k.dispose();
    for (const c of this.closets) c.dispose();
    this.crack && this.crack.dispose();
    for (const g of this.gates) if (g.mesh) { this.world.scene.remove(g.mesh); g.mesh.geometry.dispose(); g.mesh.material.dispose(); }
    this.world.dispose();
    this.pveHud && this.pveHud.dispose();
    this.hud.root.classList.remove('pve', 'pve-noboss', 'pve-minor');
    this.hud.reset();
    this.hud.show(false);
  }
}
