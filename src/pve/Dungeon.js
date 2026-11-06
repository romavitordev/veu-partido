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
import { Assist } from '../combat/assists.js';
import { resolveBody } from '../combat/positioning.js';
import { distXZ } from '../core/util.js';
import { DUNGEONS, PVE_DIFFICULTIES, depthScale, heatScale, rollHeal, rollRouteLength, rollExits, rollLock, chestChance } from './dungeons.js';
import { RoomDoor, Drawer, InteractPrompt, makeArrow, aimArrow } from './roomDoors.js';
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
const LOCK_RANGE = 15; // até onde a mira trava num inimigo
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();

export class Dungeon {
  constructor({ renderer, audio, input, hud, playerDef, teamDefs = [], run, profile, dungeonId = 'espreitador', onEnd }) {
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
    const depth = depthScale(run.depth) * heatScale(run);
    this.scale = { hp: this.diff.hp * depth, dealt: this.diff.dealt * depth };
    this.playerDef = playerDef;
    // EM EQUIPE (pedido do dono, 2026-11-05): o time entra só como ASSISTÊNCIA (sem trocar quem luta), e os Devorados e as
    // cópias saem de todo o time que o Espreitador está observando
    this.teamDefs = teamDefs.filter(Boolean).slice(0, 2);
    this.cloneDefs = [playerDef, ...this.teamDefs];
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
    if (this.teamDefs.length) {
      const p = this.player;
      p.assists = this.teamDefs.map((d, slot) => new Assist(d, p, w, slot));
      p.noSwitch = true;
      input.teamMode = true;
    } else input.teamMode = false;
    w.onKO = (f) => this.onKO(f);
    w.onTransform = (f) => { if (f === this.player) this.applyPlayerMods(false, true); this.hud.bind(w.fighters); };
    w.onSwitch = () => this.hud.bind(w.fighters);
    w.onDrain = () => {};
    w.cameraFocus = () => this.cameraTargets();
    w.groundAt = (f) => (f === this.player ? this.stairHeight(f.pos) : 0);
    // pontos que a câmera enquadra além do jogador; visible + chestPos: as paredes na frente deles também ficam transparentes
    const camPt = () => { const o = { pos: new THREE.Vector3(), size: 1, visible: true, chestPos: (v = new THREE.Vector3()) => v.set(o.pos.x, 1.2, o.pos.z) }; return o; };
    this.focusPt = camPt();
    this.npcPt = camPt();
    this.pickups = [];
    this.gates = [];
    this.copias = [];
    this.doors = [];
    this.drawers = [];
    this.keys = 0; // as chaves no bolso (uma por porta com cadeado; a que sobra serve na próxima)
    this.cracks = {};
    this.phase = 'loading';
    this.phaseTime = 0;
    // o território: os armários do quarto (a sala do chefe) e a porta de saída
    this.closets = this.D.closets.map((s, i) => new Closet(w, enemy, s, i));
    this.exitDoor = this.makeExitDoor(this.D.exit.door);
    // a ROTA desta tentativa: quantas salas até o chefe (varia), e as salas por onde já passou
    this.routeLen = rollRouteLength(this.D, run.depth);
    this.step = 0;
    this.visited = [];
    this.lurk(null);
    this.ambience = new MansionAmbience(this);
    w.cameraRig.distance = 4.4;
    w.cameraRig.height = 2.3;
    this.enterModule(this.D.start, null);
    this.arriveModule();
    // câmera fixa em 3ª pessoa (CameraRig.updateChase), começando nas costas de quem entra (olhando para +x)
    w.cameraRig.chase = () => this.chaseTarget();
    w.cameraRig.update(0, [this.player], true);
    // a luz fraca que anda com o jogador: na 3ª pessoa a câmera olha para os cantos que as luzes da casa não pegam
    this.lamp = new THREE.PointLight(0xffd8a8, 7, 8, 1.6);
    w.scene.add(this.lamp);
    // as setas: amarelas para as portas, azul para o baú (opcional)
    this.arrowChest = makeArrow(w.scene, 0x4aa8ff);
    this.arrowDoors = [0, 1, 2].map(() => makeArrow(w.scene, 0xf2c230));
    this.drip = 2;
    this.player.simpleKeys = true; // teclas simples no teclado + mouse (InputManager / Fighter.tryQuick)
    this.prompt = new InteractPrompt(w); // o aviso do botão de interagir (E / B)
    this.lockOn = true; // a mira trava sozinha nos inimigos (F / botão do meio / R3 desliga)
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
    this.pveHud.setPlace(this.D.place, ''); // as salas não têm nome na tela (pedido do dono, 2026-11-06)
    this.pveHud.setObjective(this.mod.objective);
    this.pveHud.setRun(this.run, this.run.depth);
    this.pveHud.setCoins(this.coinsTotal ? this.coinsTotal() : 0);
    this.pveHud.setKeys(this.keys);
    this.pveHud.fade(true, 0);
    requestAnimationFrame(() => this.pveHud && this.pveHud.fade(false, 1.2));
    this.phase = 'intro';
    this.phaseTime = 0;
    this.player.setState('intro');
    this.player.anim.play('idle', { restart: true });
    this.audio.play('creak', { volume: 0.7, pitch: 0.7 });
  }

  // ------------------------------------------------ salas (MÓDULOS: pedido do dono, 2026-11-05)
  // o inimigo some e espera (invisível, sem agir) até a próxima luta
  lurk(room) {
    const e = this.enemy;
    e.lurking = true;
    e.setVisible(false);
    e.setState('intro');
    e.vel.set(0, 0, 0);
    if (room && room.spawn) e.pos.set(room.spawn.x, 0, room.spawn.z);
    this.hud.root.classList.add('pve-noboss');
  }

  // monta o módulo `id`: só a área dele vale (o resto da casa fica atrás das portas), o jogador aparece na entrada, a
  // porta por onde entrou se fecha atrás dele e as saídas sorteiam o que há atrás de cada uma. `via` = a porta escolhida.
  enterModule(id, via) {
    const w = this.world;
    const p = this.player;
    const M = this.D.modules[id];
    this.modId = id;
    this.mod = M;
    this.via = via;
    if (M.kind !== 'start') this.step++;
    this.visited.push(id);
    w.arena.bounds.rects = M.rects;
    this.setupStairs(M);
    for (const d of this.doors) d.dispose();
    this.doors = [];
    for (const d of this.drawers) d.dispose();
    this.drawers = [];
    // o que ficou na sala anterior some (curas não pegas, baús não abertos)
    for (const k of this.pickups) if (k !== this.reward) k.dispose();
    this.pickups = this.pickups.filter((k) => k === this.reward);
    for (const c of this.copias) if (c.alive) c.kill();
    this.copias = [];
    p.pos.set(M.entry.x, 0, M.entry.z);
    p.vel.set(0, 0, 0);
    p.yaw = M.entry.yaw;
    for (const n of w.npcs) if (n.owner === p && n.alive && n.pos) n.pos.set(M.entry.x, 0, M.entry.z);
    w.cameraRig.yaw = M.entry.yaw - Math.PI;
    w.cameraRig.update(0, [p], true);
    // a porta de entrada: começa aberta e se fecha atrás de quem chegou
    if (M.entry.door) {
      const d = new RoomDoor(w, M.entry.door, { locked: true, open: via ? 1 : 0 });
      d.entry = true;
      this.doors.push(d);
    }
    // as saídas: cada uma com a sala sorteada e quantos monstros tem (o número aparece na porta)
    this.exits = rollExits(this.D, id, { step: this.step, total: this.routeLen, visited: this.visited, prevCount: via ? via.count : 0 });
    const padded = rollLock(this.D, id, this.exits);
    for (const slot of Object.keys(M.exits)) {
      const spot = M.exits[slot];
      const e = this.exits.find((x) => x.slot === slot);
      // sem placa (pedido do dono, 2026-11-06): atrás da porta é surpresa — nem o nome da sala, nem quantos monstros
      const d = new RoomDoor(w, spot, { locked: true, padlock: !!(e && e === padded) });
      d.exit = e || null;
      this.doors.push(d);
    }
    // as GAVETAS: a chave do cadeado (se houver) numa delas, ao acaso; nas outras, moedas ou nada
    if (M.drawers) {
      const L = this.D.locks || {};
      const keyAt = padded ? Math.floor(Math.random() * M.drawers.length) : -1;
      M.drawers.forEach((s, i) => {
        let c = null;
        if (i === keyAt) c = { kind: 'key' };
        else if (Math.random() < (L.drawerCoins ?? 0.35)) {
          const [a, b] = L.coins || [4, 9];
          c = { kind: 'coins', amount: Math.round((a + Math.random() * (b - a)) * (1 + 0.25 * Math.max(0, this.run.depth - 1))) };
        }
        this.drawers.push(new Drawer(w, s, c));
      });
    }
    // o baú (opcional): mais provável nas salas com mais monstros
    // a sala antes do chefe sempre tem baú: o respiro antes do clímax (skill level-design)
    const lastBefore = M.kind !== 'boss' && M.kind !== 'start' && this.step >= this.routeLen;
    const hidden = via && via.padlock;
    if (hidden === 'vault') {
      // a sala de baús atrás do cadeado: todos os pontos de baú, com mais sorte
      for (const s of M.chests || []) this.spawnChest(s, (this.D.locks || {}).luck || 0.6);
    } else if (!hidden && M.chests && M.chests.length && (lastBefore || Math.random() < chestChance(this.D, M.kind, via ? via.count : 0))) {
      this.spawnChest(M.chests[Math.floor(Math.random() * M.chests.length)], 0);
    }
    // a fresta das salas de espreita
    if (M.peek && !this.cracks[id]) this.cracks[id] = new PeekingCrack(w, M.peek);
    this.lurk(M);
  }

  // a sala começa (depois que a tela clareia): luta, chefe, espreita ou o hall
  arriveModule() {
    const M = this.mod;
    if (this.pveHud) {
      this.pveHud.setPlace(this.D.place, '');
      this.pveHud.setObjective(M.objective || (M.kind === 'fight' ? 'Derrote os monstros' : 'Escolha uma porta'));
    }
    this.activeCrack = this.cracks[this.modId] || null;
    if (this.via && this.via.padlock === 'vault' && M.kind !== 'boss') {
      this.encounter = null;
      this.unlockExits(null);
    } else if (M.kind === 'fight') this.startEncounter(M, this.via ? this.via.count : 2);
    else if (M.kind === 'boss') this.startBoss(M);
    else {
      this.encounter = null;
      this.unlockExits(M.kind === 'stalk' ? 'Uma fresta… NÃO OLHE para ela (defenda para desviar o olhar) · escolha uma porta' : null);
    }
  }

  unlockExits(hint) {
    for (const d of this.doors) if (d.exit) d.setLocked(false);
    if (!this.pveHud) return;
    this.pveHud.setObjective('Escolha uma porta');
    this.pveHud.hint(hint || (this.player.input?.source === 'gamepad' ? 'B' : 'E') + ' abre portas, baús e gavetas · setas AMARELAS: as portas · seta AZUL: um baú (opcional)');
    this.hintT = 4;
  }

  // atravessou uma porta: a tela escurece, a próxima sala monta, a tela clareia
  startTransit(e) {
    const p = this.player;
    this.transit = { e, t: 0, moved: false, shown: false };
    this.pveHud.fade(true, 0.35);
    p.cancelAction && p.cancelAction();
    p.setState('intro');
    p.vel.set(0, 0, 0);
    p.anim.play('walk', { restart: true });
    this.audio.play('steps', { volume: 0.6 });
  }

  updateTransit(dt) {
    const T = this.transit;
    T.t += dt;
    if (T.t > 0.4 && !T.moved) {
      T.moved = true;
      this.enterModule(T.e.to, T.e);
      this.audio.play('creak', { volume: 0.7, pitch: 0.8 });
    }
    if (T.t > 0.5 && !T.shown) { T.shown = true; this.pveHud.fade(false, 0.5); }
    if (T.t > 0.8) {
      this.transit = null;
      this.player.setState('idle');
      this.arriveModule();
    }
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

  startEncounter(r, count = 2) {
    const e = this.enemy;
    this.encounter = { room: r, done: false, koAt: null };
    e.lurking = false;
    // os monstros da sala saem MISTURADOS do time (pedido do dono, 2026-11-06): cada um do time aparece antes de repetir
    const mix = this.pickClones(count);
    const src = mix[0]; // o Devorado
    if (e.def.copyOf !== src.id) {
      this.world.scene.remove(e.rig.root);
      this.devDef = devoradoDef(src, { hp: Math.round(DEVORADO_HP * this.scale.hp) });
      e.applyDef(this.devDef, restyleDevorado(buildModel(src.model)));
    }
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
    const n = Math.max(0, count - 1); // o Devorado + as cópias = os monstros da porta
    for (let i = 0; i < n; i++) {
      const o = copiaOpts(mix[i + 1], { hp: Math.round(COPIA_HP * this.scale.hp), damageMult: COPIA_DMG, onSlain: (c) => this.onCopiaSlain(c) });
      const c = new DanteClone(e, this.world, i, Infinity, o);
      const ang = Math.PI / 2 + ((i + 0.5) / n) * Math.PI * 2; // em volta do Devorado
      c.pos.set(r.spawn.x + Math.sin(ang) * 2.2, 0, r.spawn.z + Math.cos(ang) * 2.2);
      resolveBody(this.world.arena, c.pos, c.radius);
      this.world.addNpc(c);
      this.copias.push(c);
    }
    this.pveHud.hint(null);
  }

  // `n` lutadores do time para copiar, embaralhados: o jogador e as assistências aparecem antes de alguém repetir
  pickClones(n) {
    const out = [];
    while (out.length < n) {
      const bag = this.cloneDefs.slice();
      for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
      if (out.length && bag[0] === out[out.length - 1] && bag.length > 1) bag.push(bag.shift()); // sem dois iguais seguidos
      out.push(...bag);
    }
    return out.slice(0, n);
  }

  // uma cópia por vez (as do chefe): um saco embaralhado que só repete depois de usar o time todo
  nextClone() {
    if (!this.cloneBag || !this.cloneBag.length) this.cloneBag = this.pickClones(this.cloneDefs.length);
    return this.cloneBag.shift();
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
    this.encounter = { room: r, boss: true, done: false };
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
    this.brain = new EspreitadorBrain(this, { closets: this.closets, playerDef: this.playerDef, cloneDefs: this.cloneDefs });
    this.hud.root.classList.remove('pve-noboss', 'pve-minor');
    this.hud.bind(w.fighters);
    this.pveHud.hint('Os ARMÁRIOS são as frestas dele: bata neles para TRANCAR · OLHOS AMARELOS acesos = ele vai sair por ali');
    this.hintT = 7;
  }

  onClosetLocked(c, openLeft) {
    this.popup(0, openLeft ? `FRESTA TRANCADA (${openLeft} aberta${openLeft > 1 ? 's' : ''})` : 'TODAS AS FRESTAS TRANCADAS!', '#f2c230');
  }

  // ------------------------------------------------ baús (abrem pelo botão de interagir)
  spawnChest(s, luck = 0) {
    const pos = new THREE.Vector3(s.x, 0, s.z);
    resolveBody(this.world.arena, pos, 0.6);
    const c = new Chest(this.world, { pos, yaw: Math.random() * Math.PI * 2, manual: true, luck, onOpen: (pp, ch) => this.openChest(ch) });
    this.pickups.push(c);
    return c;
  }

  openChest(c) {
    this.stats.chests++;
    const r = rollChest(Math.random, this.run.depth, c.luck || 0);
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

  // ------------------------------------------------ as SETAS (pedido do dono, 2026-11-05): com a sala limpa, AMARELAS
  // para as portas abertas (ou a recompensa / a saída, depois do chefe) e AZUL para o baú ainda fechado (opcional)
  updateArrows(dt) {
    const p = this.player.pos;
    const time = this.world.time;
    const hide = this.bossIntro || this.choosing || this.transit || ['intro', 'dead', 'exit', 'over'].includes(this.phase) || (this.encounter && !this.encounter.done);
    let chest = null;
    const yellow = [];
    if (!hide) {
      let bd = Infinity;
      for (const k of this.pickups) {
        if (!(k instanceof Chest) || k.opened) continue;
        const d = distXZ(k.pos, p);
        if (d < bd) { bd = d; chest = k.pos; }
      }
      if (this.reward && this.reward.alive) yellow.push(this.reward.pos);
      else if (this.exitDoor.unlocked) yellow.push(v3.set(this.D.exit.door.x, 0, this.D.exit.door.z));
      else for (const d of this.doors) if (d.exit && !d.locked) yellow.push(d.target(new THREE.Vector3()));
    }
    aimArrow(this.arrowChest, p, chest, dt, time, 1.0);
    this.arrowDoors.forEach((m, i) => aimArrow(m, p, yellow[i] || null, dt, time, 1.35));
  }

  // ------------------------------------------------ TRAVA NO INIMIGO (pedido do dono, 2026-11-06): na luta a câmera trava
  // num inimigo (senão o avanço sai na direção da parede). Um movimento rápido do mouse / analógico direito troca de alvo;
  // F, o botão do meio do mouse ou R3 liga e desliga a trava.
  lockCandidates() {
    const p = this.player;
    const e = this.enemy;
    const out = [];
    if (e.visible && !e.lurking && e.state !== 'intro' && e.state !== 'ko' && distXZ(p.pos, e.pos) < LOCK_RANGE) out.push(e);
    for (const n of this.world.npcs) {
      if (!n.alive || n.isCloset || n.owner === p || !n.pos) continue;
      if (distXZ(n.pos, p.pos) < LOCK_RANGE) out.push(n);
    }
    return out;
  }

  validLock(t) {
    if (!t) return false;
    if (t === this.enemy) return t.visible && !t.lurking && t.state !== 'ko' && t.state !== 'intro' && distXZ(t.pos, this.player.pos) < LOCK_RANGE + 3;
    return t.alive && distXZ(t.pos, this.player.pos) < LOCK_RANGE + 3;
  }

  // o alvo na direção `side` (−1 esquerda, +1 direita) a partir do atual; sem side: o mais perto do centro da tela
  pickLock(side = 0) {
    const p = this.player.pos;
    const cams = this.lockCandidates();
    if (!cams.length) return null;
    const fwd = this.world.cameraRig.yaw + Math.PI; // a frente da câmera
    const ref = side && this.lockT ? Math.atan2(this.lockT.pos.x - p.x, this.lockT.pos.z - p.z) : fwd;
    let best = null;
    let bs = Infinity;
    for (const t of cams) {
      if (side && t === this.lockT) continue;
      const ang = Math.atan2(t.pos.x - p.x, t.pos.z - p.z);
      let da = ang - ref;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      // yaw cresce para a esquerda da tela; "direita" = da negativo
      if (side && Math.sign(-da) !== side) continue;
      const score = side ? Math.abs(da) : Math.abs(da) * 4 + distXZ(t.pos, p) * 0.25;
      if (score < bs) { bs = score; best = t; }
    }
    return best || (side ? this.lockT : null);
  }

  updateLock(dt) {
    const L = this.input.players[0].look;
    if (L.lockBtn && !this.lockBtnPrev) {
      this.lockOn = !this.lockOn;
      this.lockT = this.lockOn ? this.pickLock() : null;
      this.audio.play('select', { volume: 0.5, pitch: this.lockOn ? 1.2 : 0.8 });
      this.popup(0, this.lockOn ? 'MIRA TRAVADA' : 'MIRA LIVRE', '#f2c230');
    }
    this.lockBtnPrev = L.lockBtn;
    const busy = this.bossIntro || this.transit || ['intro', 'dead', 'exit', 'over'].includes(this.phase);
    if (!this.lockOn || busy) { this.lockT = null; this.updateLockMark(dt); return; }
    if (!this.validLock(this.lockT)) this.lockT = this.pickLock();
    // trocar de alvo: um movimento rápido para o lado
    this.flick = (this.flick || 0) * Math.max(0, 1 - dt * 6) + (L.mx || 0) + (L.x || 0) * 900 * dt;
    this.flickCd = Math.max(0, (this.flickCd || 0) - dt);
    if (this.lockT && this.flickCd <= 0 && Math.abs(this.flick) > 70) {
      const nt = this.pickLock(Math.sign(this.flick));
      if (nt && nt !== this.lockT) { this.lockT = nt; this.audio.play('select', { volume: 0.35, pitch: 1.4 }); }
      this.flick = 0;
      this.flickCd = 0.3;
    }
    this.updateLockMark(dt);
  }

  // o marcador no chão, embaixo do alvo travado
  updateLockMark(dt) {
    if (!this.lockMark) {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.68, 4, 1), new THREE.MeshBasicMaterial({ color: 0xff4a2a, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2;
      m.renderOrder = 5;
      this.world.scene.add(m);
      this.lockMark = m;
    }
    const m = this.lockMark;
    const t = this.lockT;
    m.material.opacity += ((t ? 0.85 : 0) - m.material.opacity) * Math.min(1, dt * 8);
    m.visible = m.material.opacity > 0.02;
    if (t) {
      m.position.set(t.pos.x, 0.05, t.pos.z);
      m.rotation.z += dt * 1.6;
      const sc = (t.size || 1) * (1 + 0.06 * Math.sin(this.world.time * 6));
      m.scale.setScalar(sc);
    }
  }

  chaseTarget() {
    const p = this.player;
    const e = this.enemy;
    // CÂMERA LIVRE: o jogador gira a câmera (mouse / analógico direito) e o personagem mira para onde ela aponta
    const out = { player: p, focus: null, free: !this.bossIntro && this.phase !== 'exit', look: this.input.players[0].look };
    // TRAVADA: a câmera fica atrás do jogador olhando o alvo (o corpo mira nele; o mouse só troca de alvo)
    if (this.lockT && out.free) {
      const t = this.lockT.pos;
      out.focus = t;
      out.free = false;
      if (distXZ(p.pos, t) > 0.8) { out.yaw = Math.atan2(p.pos.x - t.x, p.pos.z - t.z); out.lockRate = 7; }
      return out;
    }
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

  // ------------------------------------------------ A ESCADA DO HALL (pedido do dono, 2026-11-06): sobe-se andando pelos
  // degraus até o patamar, onde fica a porta da sala de cima. Dá para não entrar e descer de volta. Os degraus são um
  // bloco sólido: só se sobe pelo pé da escada (por baixo); pelos lados, eles barram como antes.
  setupStairs(M) {
    const a = this.world.arena;
    this.onStairs = false;
    this.stairs = M.stairs || null;
    // a caixa de colisão dos degraus sai enquanto a sala tem escada (a escada cuida dela); volta nas outras salas
    if (this.stairs && !this.stairBox) {
      const S = this.stairs;
      const i = (a.boxes || []).findIndex((b) => b.minX < (S.x0 + S.x1) / 2 && b.maxX > (S.x0 + S.x1) / 2 && b.minZ < (S.minZ + S.maxZ) / 2 && b.maxZ > (S.minZ + S.maxZ) / 2);
      if (i >= 0) this.stairBox = a.boxes.splice(i, 1)[0];
      if (!this.stairBlock) {
        // o patamar lá em cima (um bloco de madeira até o chão) e o escuro da subida
        const g = new THREE.Group();
        const wood = new THREE.MeshToonMaterial({ color: 0x5a3a22, emissive: 0x1e1008 });
        const blk = new THREE.Mesh(new THREE.BoxGeometry(S.landingX - S.x1, S.top, S.maxZ - S.minZ), wood);
        blk.position.set((S.landingX + S.x1) / 2, S.top / 2, (S.minZ + S.maxZ) / 2);
        g.add(blk);
        this.world.scene.add(g);
        this.stairBlock = g;
      }
    } else if (!this.stairs && this.stairBox) {
      a.boxes.push(this.stairBox);
      this.stairBox = null;
    }
    if (this.stairBlock) this.stairBlock.visible = !!this.stairs;
  }

  // a altura do degrau em x (0 no pé, S.top no patamar); fora da escada, 0
  stairHeight(pos) {
    const S = this.stairs;
    if (!S || !this.onStairs) return 0;
    const k = Math.max(0, Math.min(1, (pos.x - S.x0) / (S.x1 - S.x0)));
    return k * S.top;
  }

  inStairs(x, z, m = 0) {
    const S = this.stairs;
    return S && x > S.x0 - m && x < S.landingX + m && z > S.minZ - m && z < S.maxZ + m;
  }

  updateStairs(prevX, prevZ) {
    const S = this.stairs;
    if (!S) return;
    const p = this.player;
    const r = p.radius || 0.45;
    if (this.onStairs) {
      // nos degraus: entre os corrimãos, até o fim do patamar; descendo até o pé, volta ao chão
      p.pos.z = Math.max(S.minZ + r * 0.5, Math.min(S.maxZ - r * 0.5, p.pos.z));
      p.pos.x = Math.min(S.landingX - r * 0.6, p.pos.x);
      if (p.pos.x < S.x0 - 0.05) this.onStairs = false;
      return;
    }
    // no chão: só entra na escada pelo pé (onde o degrau ainda é baixo); pelos lados e por baixo, o bloco barra
    if (this.inStairs(p.pos.x, p.pos.z, r)) {
      const k = (p.pos.x - S.x0) / (S.x1 - S.x0);
      const fromFoot = prevX <= S.x0 + 0.15 && p.pos.z > S.minZ + 0.1 && p.pos.z < S.maxZ - 0.1;
      if (k < 0.12 && fromFoot && p.pos.y < 0.3) this.onStairs = true;
      else if (!this.inStairs(prevX, prevZ, r)) { p.pos.x = prevX; p.pos.z = prevZ; }
      else {
        // empurrado para dentro (por um golpe): sai pelo lado mais perto
        const opts = [[S.x0 - r - p.pos.x, 0], [S.landingX + r - p.pos.x, 0], [0, S.minZ - r - p.pos.z], [0, S.maxZ + r - p.pos.z]];
        opts.sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]));
        p.pos.x += opts[0][0];
        p.pos.z += opts[0][1];
      }
    }
  }

  // ------------------------------------------------ INTERAGIR (pedido do dono, 2026-11-06): portas, escada, baús e gavetas
  // abrem pelo botão — E no teclado, B no controle. Só fora da luta (na luta o E é a defesa e o B o golpe físico).
  updateInteract() {
    const p = this.player;
    const inp = this.input.players[0];
    const pr = inp.pressed || {};
    const held = inp.held || {};
    // o botão apertado para interagir não vira defesa nem golpe até ser solto
    if (this.interactLatch) {
      if (!held.interact) this.interactLatch = false;
      else { held.block = false; pr.block = false; pr.physical = false; }
    }
    const enc = this.encounter;
    const calm = !this.transit && !this.choosing && !this.bossIntro && (!enc || enc.done) && ['explore', 'fight', 'bossDown'].includes(this.phase) && !['ko', 'intro', 'hitstun', 'stun', 'grabbed', 'downed'].includes(p.state);
    let best = null;
    let bd = Infinity;
    if (calm) {
      const consider = (o, d, y, verb) => { if (d < bd) { bd = d; best = { o, y, verb }; } };
      for (const d of this.doors) {
        if (!d.exit || d.locked || (d.opened && !d.stairs)) continue;
        if (d.spot.landing && !this.onStairs) continue; // a porta do patamar: só de cima da escada
        consider(d, d.reach(p.pos), (d.spot.y || 0) + (d.stairs ? 1.6 : 2.0), d.stairs ? 'Subir' : d.padlock ? (this.keys > 0 ? 'Destrancar' : 'Trancada') : d.spot.landing ? 'Entrar' : 'Abrir');
      }
      for (const k of this.pickups) {
        if (!(k instanceof Chest) || k.opened) continue;
        const dd = distXZ(k.pos, p.pos);
        if (dd < 1.5) consider(k, dd, 1.35, 'Abrir');
      }
      for (const dr of this.drawers) consider(dr, dr.reach(p.pos), (dr.spot.y ?? 0.6) + 0.7, 'Abrir');
    }
    if (!best) { this.prompt.hide(); return; }
    const btn = inp.source === 'gamepad' ? 'B' : 'E';
    const at = best.o instanceof RoomDoor ? best.o.target(v3) : best.o.pos;
    this.prompt.show(at, best.y, `${btn}|${best.verb}`);
    if (!pr.interact) return;
    // usou: o aperto é do interagir
    this.interactLatch = true;
    held.block = false; pr.block = false; pr.physical = false;
    this.interact(best.o);
  }

  interact(o) {
    const p = this.player;
    if (o instanceof RoomDoor) {
      if (o.stairs) { this.prompt.hide(); this.startTransit(o.exit); return; }
      if (o.padlock) {
        if (this.keys <= 0) {
          this.audio.play('creak', { volume: 0.5, pitch: 0.5 });
          this.popup(0, 'TRANCADA — PRECISA DE UMA CHAVE', '#c8b8a0');
          return;
        }
        this.keys--;
        this.pveHud.setKeys(this.keys);
        o.unpad();
        this.audio.play('select', { volume: 0.7, pitch: 0.7 });
        this.world.fx.burst(o.target(v3).clone().setY(1.1), { count: 18, color: 0xe8c050, speed: 2.2, life: 0.5, size: 0.08 });
        this.popup(0, 'DESTRANCADA', '#e8c050');
      }
      o.opened = true;
      return;
    }
    if (o instanceof Chest) { o.open(p); return; }
    if (o instanceof Drawer) {
      const c = o.open();
      this.audio.play('creak', { volume: 0.45, pitch: 1.7 });
      if (!c) { this.popup(0, 'VAZIA', '#9a9088'); return; }
      if (c.kind === 'key') {
        this.keys++;
        this.pveHud.setKeys(this.keys);
        this.audio.play('pickup', { volume: 1, pitch: 1.1 });
        this.popup(0, '+1 CHAVE', '#e8c050');
      } else if (c.kind === 'coins') {
        this.world.fx.burst(new THREE.Vector3(o.spot.x, (o.spot.y ?? 0.6) + 0.2, o.spot.z), { count: 14, color: 0xffd84a, speed: 2, life: 0.5, size: 0.1, up: 1.4 });
        this.giveCoins(c.amount);
      }
    }
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
      this.player.aimYaw = null;
      this.updateArrows(dt);
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
    // CÂMERA LIVRE: o mouse/analógico direito giram a câmera e o corpo mira para onde ela olha (frente = yaw + π)
    this.input.freeLook = true;
    p.aimYaw = this.phase === 'exit' || this.phase === 'dead' || p.input?.cpu ? null : w.cameraRig.yaw + Math.PI;
    // travado: o corpo mira direto no alvo (não espera a câmera terminar de virar)
    if (p.aimYaw !== null && this.lockT && this.lockT.pos) p.aimYaw = Math.atan2(this.lockT.pos.x - p.pos.x, this.lockT.pos.z - p.pos.z);
    this.updateInteract();
    const prevX = p.pos.x;
    const prevZ = p.pos.z;
    w.update(dt);
    this.updateStairs(prevX, prevZ);
    this.applyGates(dt);
    this.updateExitDoor(dt);
    this.lamp.position.set(p.pos.x, p.pos.y + 2.4, p.pos.z);
    this.ambience.update(dt);
    this.updateLock(dt);
    this.updateArrows(dt);
    if (this.transit) this.updateTransit(dt);
    for (const d of this.doors) {
      const pass = d.update(dt, p.pos);
      if (d.creaked) this.audio.play('creak', { volume: 0.55, pitch: d.entry ? 0.75 : 0.9 + Math.random() * 0.2 });
      if (pass && d.exit && (!d.spot.landing || this.onStairs) && !this.transit && (this.phase === 'explore' || this.phase === 'fight')) this.startTransit(d.exit);
    }
    for (const c of this.closets) if (!this.brain) c.tick(dt);
    for (const k of this.pickups) k.update(dt, [p]);
    for (const d of this.drawers) d.update(dt);
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
          this.pveHud.hint(this.player.input?.source === 'gamepad' ? 'Explore a mansão →' : 'Clique esq. golpe · clique dir. tiro · 1–5 habilidades · Z especial · G agarrão · E defesa · Shift esquiva · Q/R assistências · F trava a mira');
          this.hintT = 8;
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
    // a fresta das salas de espreita: só a da sala atual olha
    let draining = false;
    for (const id in this.cracks) {
      const c = this.cracks[id];
      if (c.update(dt, p, c === this.activeCrack && this.phase === 'explore' && !this.transit)) draining = true;
    }
    this.hud.vignette.classList.toggle('on', draining);
    this.pveHud.setTime(this.stats.time);
    this.hud.update(this);
  }

  updateRooms() {
    const p = this.player;
    const enc = this.encounter;
    if (enc && !enc.done && !enc.boss) {
      // o Devorado caiu: some, e a sala termina quando não sobra cópia
      if (enc.koAt !== null && this.world.time - enc.koAt > 1.3 && !this.enemy.lurking) {
        this.world.fx.burst(this.enemy.chestPos(v1).clone(), { count: 30, color: 0x6c6a66, kind: 'smoke', speed: 2, life: 0.7, size: 0.7, grow: 1 });
        this.lurk(null);
      }
      if (enc.koAt !== null && this.enemy.lurking && !this.copias.length) {
        enc.done = true;
        this.hud.root.classList.remove('pve-minor');
        this.hud.callout('SALA LIMPA', '#7dffb0');
        if (this.via && this.via.padlock === 'fight' && this.mod.chests && this.mod.chests.length) {
          const s = this.mod.chests.slice().sort((a, b) => distXZ(a, p.pos) - distXZ(b, p.pos))[0];
          const c = this.spawnChest(s, (this.D.locks || {}).luck || 0.6);
          this.world.fx.burst(new THREE.Vector3(c.pos.x, 0.6, c.pos.z), { count: 24, color: 0x6c6a66, kind: 'smoke', speed: 1.6, life: 0.7, size: 0.5, grow: 1 });
        }
        this.unlockExits();
      }
    }
    if (this.brain && enc && enc.boss && !enc.done) this.brain.update(this.lastDt);
    // atravessou a porta de saída
    if (this.exitDoor.unlocked && p.pos.x > this.D.exit.door.x + 0.4 && this.phase !== 'exit') this.startExit();
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
    this.input.teamMode = false;
    this.input.freeLook = false;
    if (this.player) this.player.aimYaw = null;
    if (document.pointerLockElement) document.exitPointerLock();
    this.bossIntro && this.bossIntro.dispose();
    this.ambience && this.ambience.dispose();
    this.brain && this.brain.dispose();
    for (const k of this.pickups) k.dispose();
    for (const c of this.closets) c.dispose();
    for (const id in this.cracks) this.cracks[id].dispose();
    if (this.lockMark) { this.world.scene.remove(this.lockMark); this.lockMark.geometry.dispose(); this.lockMark.material.dispose(); }
    for (const d of this.doors) d.dispose();
    for (const d of this.drawers) d.dispose();
    this.prompt && this.prompt.hide();
    this.world.groundAt = null;
    if (this.stairBlock) this.world.scene.remove(this.stairBlock);
    if (this.stairBox) { this.world.arena.boxes.push(this.stairBox); this.stairBox = null; }
    for (const m of [this.arrowChest, ...(this.arrowDoors || [])]) if (m) { this.world.scene.remove(m); m.userData.body.geometry.dispose(); m.userData.body.material.dispose(); m.userData.edge.material.dispose(); }
    for (const g of this.gates) if (g.mesh) { this.world.scene.remove(g.mesh); g.mesh.geometry.dispose(); g.mesh.material.dispose(); }
    this.world.dispose();
    this.pveHud && this.pveHud.dispose();
    this.hud.root.classList.remove('pve', 'pve-noboss', 'pve-minor');
    this.hud.reset();
    this.hud.show(false);
  }
}
