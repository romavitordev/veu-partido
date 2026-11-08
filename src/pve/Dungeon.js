// OUTRO LADO — uma dungeon (TODO §4.1): entrar, explorar, os Devorados, o chefe, a recompensa, a porta de saída.
// Faz o papel da Match (mesma interface para o main.js: update, render, dispose, fighters, phase, timer, wins) em cima
// do World de sempre, com DOIS lutadores: o jogador (fighters[0]) e o "inimigo da vez" (fighters[1]) — primeiro os
// Devorados (cópias do lutador do jogador), depois o chefe. Entre um encontro e outro o inimigo fica escondido na próxima
// sala (`lurking`: invisível, sem agir e sem travar a mira). Os Devorados menores são NPCs (combat/npcs.js).
import * as THREE from 'three';
import { COMBAT } from '../config/combat.js';
import { World } from '../game/World.js';
import { Fighter } from '../combat/Fighter.js';
import { CameraRig } from '../camera/CameraRig.js';
import { PlayerInput } from '../input/InputManager.js';
import { buildModel, isModelLoaded } from '../models/index.js';
import { disposeRigResources } from '../models/glbRig.js';
import { CpuController } from '../ai/CpuController.js';
import { DanteClone, BloodZombie } from '../combat/npcs.js';
import { Assist } from '../combat/assists.js';
import { resolveBody } from '../combat/positioning.js';
import { distXZ } from '../core/util.js';
import { applyHit } from '../combat/damage.js';
import { DUNGEONS, PVE_DIFFICULTIES, depthScale, heatScale, rollHeal, rollRouteLength, rollExits, rollLock, chestChance, charTune } from './dungeons.js';
import { RoomDoor, Drawer, InteractPrompt, makeArrow, aimArrow } from './roomDoors.js';
import { computeMods, gainXp, rollChoices, chestUpgrades, chestCount, countOf, getUpgrade, rewardChoices } from './upgrades.js';
import { devoradoDef, restyleDevorado, copiaOpts } from './devorado.js';
import { Pickup, Chest } from './pickups.js';
import { rollLoot } from './unlocks.js';
import { Breakable } from './breakables.js';
import { PveHud } from './pveHud.js';
import { Closet, EspreitadorBrain, PeekingCrack } from './espreitador.js';
import { EspreitadorIntro } from './espreitadorIntro.js';
import { MansionAmbience } from './ambience.js';
import { DegolificadaBrain, DegolificadaIntro } from './degolificada.js';
import espreitadorDef from '../characters/bosses/espreitador.js';
import degolificadaDef from '../characters/bosses/degolificada.js';

const BOSSES = { espreitador: espreitadorDef, degolificada: degolificadaDef };
const ZOMBIE_HP = { weak: 150, strong: 380 }; // os Zumbis de Sangue da escola (o bombeiro Jorge e os outros)
// feedback do dono (2026-11-05): as salas acabavam rápido demais; os Devorados ficaram mais fortes para durar mais
const DEVORADO_HP = 820;
const MINION_DEALT = 0.8; // os Devorados batem 20% mais fraco que o lutador copiado
const COPIA_HP = 160;
const COPIA_DMG = 0.45;
const LOCK_RANGE = 15; // até onde a mira trava num inimigo
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const MATE_V = new THREE.Vector3(); // o nome do parceiro (online): a projeção na tela
const v3 = new THREE.Vector3();
// coop local: um objeto só aparece na câmera de um jogador (layer 1 = P1, 2 = P2); 0 = nas duas
const onLayer = (o, layer) => { if (layer) o.traverse((c) => c.layers.set(layer)); };

export class Dungeon {
  constructor({ renderer, audio, input, hud, playerDef, teamDefs = [], run, profile, dungeonId = 'espreitador', onEnd, coopDef = null, coopTeam = [], coopProfile = null, net = null }) {
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
    // COOP LOCAL (pedido do dono, 2026-11-06): o 2º jogador no mesmo PC, com a própria câmera (tela dividida)
    this.coop = !!coopDef;
    // EXPEDIÇÃO ONLINE: os dois computadores rodam esta MESMA simulação (lockstep); net.slot = o lado deste (0 = P1)
    this.net = net;
    this.local = net ? net.slot : null; // a vista que esta tela mostra (null = todas: solo ou tela dividida)
    this.chooser = 0; // quem escolhe a próxima melhoria (no coop, alternam)
    this.coopProfile = coopProfile || profile;
    this.D = DUNGEONS[dungeonId];
    this.diff = PVE_DIFFICULTIES[run.difficulty] || PVE_DIFFICULTIES.normal;
    const depth = depthScale(run.depth) * heatScale(run);
    this.scale = { hp: this.diff.hp * depth, dealt: this.diff.dealt * depth };
    this.playerDef = playerDef;
    // EM EQUIPE (pedido do dono, 2026-11-05): o time entra só como ASSISTÊNCIA (sem trocar quem luta), e os Devorados e as
    // cópias saem de todo o time que o Espreitador está observando
    this.teamDefs = teamDefs.filter(Boolean).slice(0, 2);
    this.coopTeam = (coopTeam || []).filter(Boolean).slice(0, 2);
    this.cloneDefs = [playerDef, ...this.teamDefs, ...(coopDef ? [coopDef, ...this.coopTeam] : [])];
    this.stats = { kills: 0, copias: 0, time: 0, damage: 0, coins: 0, chests: 0 };
    this.world = new World({ renderer, audio, input, ui: hud });
    if (net) { this.world.netplay = true; this.world.viewSlot = net.slot ? 2 : 0; }
    const devDef = devoradoDef(playerDef, { hp: Math.round(DEVORADO_HP * this.scale.hp) });
    this.devDef = devDef;
    this.world.setup([playerDef, devDef], this.D.arena);
    const w = this.world;
    // o inimigo da vez: o modelo do jogador pintado de Devorado
    const enemy = this.enemy;
    const initialEnemyRig = enemy.rig;
    w.scene.remove(initialEnemyRig.root);
    enemy.applyDef(devDef, restyleDevorado(buildModel(playerDef.model)));
    disposeRigResources(initialEnemyRig.root);
    enemy.maxHealth = devDef.stats.maxHealth;
    enemy.health = enemy.maxHealth;
    if (this.coop) {
      // o P2 usa o 2º lugar da entrada (2º controle / lado direito do teclado); a CPU do inimigo vai para um 3º lugar
      if (input.players.length < 3) input.players.push(new PlayerInput(2));
      enemy.input = input.players[2];
      const p2 = new Fighter(coopDef, 2, w, input.players[1]);
      w.fighters.push(p2);
      const baseOpp = w.opponentOf.bind(w);
      w.opponentOf = (f) => (f === this.enemy ? this.enemyTarget() : f === this.player || f === this.player2 ? this.enemy : baseOpp(f));
    }
    this.applyPlayerMods(true);
    for (const [p, defs] of [[this.player, this.teamDefs], [this.player2, this.coopTeam]]) {
      if (!p || !defs.length) continue;
      p.assists = defs.map((d, slot) => new Assist(d, p, w, slot));
      p.noSwitch = true;
    }
    input.teamMode = !!(this.teamDefs.length || this.coopTeam.length);
    w.onKO = (f) => this.onKO(f);
    w.onTransform = (f) => { if (this.players.includes(f)) this.applyPlayerMods(false, true); this.bindHud(); };
    w.onSwitch = () => this.bindHud();
    w.onDrain = () => {};
    w.cameraFocus = () => this.cameraTargets();
    w.groundAt = (f) => (f.onStairs ? this.stairHeight(f) : 0);
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
    this.closets = (this.D.closets || []).map((s, i) => new Closet(w, enemy, s, i));
    this.exitDoor = this.makeExitDoor(this.D.exit.door);
    // o ENIGMA DE MEDO (a Escola Nostradamus): as PROVAS que tiram o escudo da Degolificada (saem das caixas do bunker)
    this.clues = 0;
    this.cluesNeeded = this.D.enigma ? this.D.enigma.clues.length : 0;
    this.cluesFound = [];
    this.bossBoxes = [];
    this.props = []; // os barris e caixas quebráveis da sala
    // a ROTA desta tentativa: quantas salas até o chefe (varia), e as salas por onde já passou
    this.routeLen = rollRouteLength(this.D, run.depth);
    this.step = 0;
    this.visited = [];
    this.lurk(null);
    this.ambience = this.D.arena === 'mansao' ? new MansionAmbience(this) : null; // as espiadas e a goteira são da Mansão
    w.cameraRig.distance = 4.4;
    w.cameraRig.height = 2.3;
    // as VISTAS: a câmera de cada jogador (no coop, a 2ª câmera é da metade direita da tela)
    this.views = [this.makeView(0, this.player, input.players[0], w.cameraRig)];
    if (this.coop) {
      const cam2 = new THREE.PerspectiveCamera(50, w.camera.aspect, 0.12, 300);
      const rig2 = new CameraRig(cam2, w);
      // as paredes que somem na frente da câmera: só a câmera de quem olha esta tela (online, a do P2 no computador dele)
      rig2.noOcclusion = this.local !== 1;
      if (this.local === 1) w.cameraRig.noOcclusion = true;
      rig2.distance = 4.4;
      rig2.height = 2.3;
      this.views.push(this.makeView(1, this.player2, input.players[1], rig2));
      this.player2.camBasis = rig2.basis;
      rig2.chase = () => this.chaseTarget(this.views[1]);
    }
    this.enterModule(this.D.start, null);
    this.arriveModule();
    // câmera fixa em 3ª pessoa (CameraRig.updateChase), começando nas costas de quem entra (olhando para +x)
    w.cameraRig.chase = () => this.chaseTarget(this.views[0]);
    w.cameraRig.update(0, [this.player], true);
    if (this.coop) this.views[1].rig.update(0, [this.player2], true);
    // a luz fraca que anda com o jogador: na 3ª pessoa a câmera olha para os cantos que as luzes da casa não pegam
    this.lamp = new THREE.PointLight(0xffd8a8, 7, 8, 1.6);
    w.scene.add(this.lamp);
    // a luz dos BAÚS: criada já aqui (apagada) — acender uma luz nova no meio do jogo recompilaria os materiais
    this.chestLight = new THREE.PointLight(0xffd84a, 0, 7, 1.8);
    w.scene.add(this.chestLight);
    this.drip = 2;
    this.player.simpleKeys = true; // teclas simples no teclado + mouse (InputManager / Fighter.tryQuick)
    if (net && this.player2) this.player2.simpleKeys = true; // online o P2 também joga com o teclado do P1 do computador dele
  }

  get fighters() { return this.world.fighters; }
  get player() { return this.world.fighters[0]; }
  get enemy() { return this.world.fighters[1]; }
  get player2() { return this.coop ? this.world.fighters[2] : null; }
  get enemySlot() { return this.input.players[this.coop ? 2 : 1]; }

  bindHud() {
    this.hud.bind(this.coop ? [this.player, this.player2] : this.world.fighters);
  }

  // as classes da HUD que escondem/encolhem o painel 2 (o inimigo): no coop o painel 2 é do P2
  hudAdd(...c) { if (!this.coop) this.hud.root.classList.add(...c); }
  hudRemove(...c) { if (!this.coop) this.hud.root.classList.remove(...c); }

  // ------------------------------------------------ o jogador: melhorias da tentativa + árvore permanente
  applyPlayerMods(fill = false, keepRatio = false) {
    for (const p of this.players) {
      const m = this.modsFor(p, p === this.player ? this.profile : this.coopProfile, fill, keepRatio);
      if (p === this.player) this.mods = m;
    }
  }

  modsFor(p, profile, fill, keepRatio) {
    const m = computeMods(this.run.picks, profile.tree);
    const tune = charTune(p.def.id); // o ajuste do personagem no modo (PVE_CHAR_TUNE)
    if (tune) {
      for (const k in m.dealt) m.dealt[k] *= tune.dealt ?? 1;
      m.taken *= tune.taken ?? 1;
    }
    const ratio = p.health / p.maxHealth;
    const baseHp = p.def.stats?.maxHealth ?? COMBAT.maxHealth;
    const before = p.maxHealth;
    p.maxHealth = Math.round(baseHp * m.hpMult);
    if (fill) p.health = p.maxHealth;
    else if (keepRatio) p.health = Math.max(1, Math.round(p.maxHealth * ratio));
    else p.health = Math.min(p.maxHealth, p.health + Math.max(0, p.maxHealth - before)); // ganhou vida máxima: cura o que ganhou
    p.moveSpeed = (p.def.stats?.moveSpeed ?? COMBAT.moveSpeed) * m.speedMult;
    m.onDealt = (dealt, kind, victim, o) => {
      if (m.lifesteal > 0 && kind === 'melee') p.health = Math.min(p.maxHealth, p.health + dealt * m.lifesteal);
      this.stats.damage += dealt;
      if (o && o.crit) this.world.fx.burst(victim.chestPos ? victim.chestPos(v1).clone() : p.chestPos(v1).clone(), { count: 10, color: 0xffe08a, speed: 3.2, life: 0.3, size: 0.12 });
    };
    // PELE DE ESPINHOS (baú): devolve parte do dano corpo a corpo a quem bateu
    m.onTaken = m.thorns > 0 ? (dealt, kind, attacker, o) => {
      if (kind !== 'melee' || o.thorns || !attacker || attacker === p || !attacker.takeDamage || attacker.state === 'ko') return;
      applyHit(this.world, p, attacker, { damage: Math.max(1, Math.round(dealt * m.thorns)), kind: 'ability', thorns: true, unblockable: true, reaction: false, knockback: 0, hitstun: 0, sound: 'clawHit', color: 0xc8a0ff, scale: 0.6 });
    } : null;
    // SEGUNDO FÔLEGO (baú): uma vez por tentativa, o golpe que ia derrubar deixa com 30%
    if (m.secondWind && !(this.run.secondWindUsed || []).includes(p === this.player ? 0 : 1)) {
      p.lethalHook = () => {
        this.run.secondWindUsed = [...(this.run.secondWindUsed || []), p === this.player ? 0 : 1];
        p.health = Math.round(p.maxHealth * 0.3);
        p.invuln = Math.max(p.invuln || 0, 1.2);
        this.world.fx.burst(p.chestPos(v1).clone(), { count: 40, color: 0xfff0c0, speed: 4, life: 0.7, size: 0.18 });
        this.hud.callout('SEGUNDO FÔLEGO', '#fff0c0');
        this.audio.play('levelUp', { volume: 0.9, pitch: 1.2 });
        return true;
      };
    } else if (!m.secondWind) p.lethalHook = null;
    p.pveMods = m;
    return m;
  }

  // ------------------------------------------------ começo
  beginIntro() {
    const h = this.hud;
    h.reset();
    this.pveHud = new PveHud(h);
    this.bindHud();
    h.show(true);
    this.hudAdd('pve-noboss');
    if (this.coop) { h.root.classList.add('pve-coop'); h.root.classList.toggle('pve-online', !!this.net); this.pveHud.setSplit(!this.net); }
    this.pveHud.setPlace(this.D.place, ''); // as salas não têm nome na tela (pedido do dono, 2026-11-06)
    this.pveHud.setObjective(this.mod.objective);
    this.pveHud.setRun(this.run, this.run.depth);
    this.pveHud.setCoins(this.coinsTotal ? this.coinsTotal() : 0);
    this.pveHud.setKeys(this.keys);
    this.pveHud.setClues(this.clues, this.cluesNeeded);
    this.pveHud.fade(true, 0);
    requestAnimationFrame(() => this.pveHud && this.pveHud.fade(false, 1.2));
    this.phase = 'intro';
    this.phaseTime = 0;
    for (const q of this.players) { q.setState('intro'); q.anim.play('idle', { restart: true }); }
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
    this.hudAdd('pve-noboss');
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
    this.revivePlayers();
    p.pos.set(M.entry.x, 0, M.entry.z);
    p.vel.set(0, 0, 0);
    p.yaw = M.entry.yaw;
    for (const n of w.npcs) if (n.owner === p && n.alive && n.pos) n.pos.set(M.entry.x, 0, M.entry.z);
    w.cameraRig.yaw = M.entry.yaw - Math.PI;
    w.cameraRig.update(0, [p], true);
    const p2 = this.player2;
    if (p2) {
      // o P2 entra ao lado do P1 (à direita de quem entra)
      const rx = Math.cos(M.entry.yaw);
      const rz = -Math.sin(M.entry.yaw);
      p2.pos.set(M.entry.x + rx * 1.1, 0, M.entry.z + rz * 1.1);
      resolveBody(w.arena, p2.pos, p2.radius);
      p2.vel.set(0, 0, 0);
      p2.yaw = M.entry.yaw;
      for (const n of w.npcs) if (n.owner === p2 && n.alive && n.pos) n.pos.copy(p2.pos);
      if (this.views && this.views[1]) { this.views[1].rig.yaw = M.entry.yaw - Math.PI; this.views[1].rig.update(0, [p2], true); }
    }
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
        else c = rollLoot('drawer', Math.random, this.run.depth, this.mods?.dropMult || 1); // moedas, experiência, cura ou nada
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
    this.spawnProps(M);
    this.lurk(M);
  }

  // ------------------------------------------------ BARRIS e CAIXAS (pedido do dono, 2026-11-06): quebram com golpes e
  // soltam moedas, experiência ou cura. 1 a 3 por sala, longe da entrada e das portas.
  spawnProps(M) {
    for (const x of this.props) x.dispose();
    this.props = [];
    for (const x of this.bossBoxes) x.dispose();
    this.bossBoxes = [];
    const R = M.rects[M.kind === 'boss' ? 1 : 0] || M.rects[0];
    if (!R) return;
    const avoid = [M.entry, ...Object.values(M.exits || {}), ...(M.chests || []), ...(M.drawers || [])];
    const n = 1 + Math.floor(Math.random() * 3);
    for (let k = 0, tries = 0; k < n && tries < 30; tries++) {
      const pos = new THREE.Vector3(R.minX + 1 + Math.random() * Math.max(0.1, R.maxX - R.minX - 2), 0, R.minZ + 0.9 + Math.random() * Math.max(0.1, R.maxZ - R.minZ - 1.8));
      if (avoid.some((s) => s && Math.hypot(s.x - pos.x, s.z - pos.z) < 2.2) || this.props.some((x) => distXZ(x.pos, pos) < 1.4)) continue;
      resolveBody(this.world.arena, pos, 0.55);
      const x = new Breakable(this.world, this.enemy, { x: pos.x, z: pos.z, kind: Math.random() < 0.5 ? 'barrel' : 'crate', onBreak: (o) => this.dropLoot(o.pos, 'barrel', 1) });
      this.world.addNpc(x);
      this.props.push(x);
      k++;
    }
  }

  // um drop no chão (moedas, experiência ou cura) — das gavetas, dos barris e dos monstros
  dropLoot(pos, source, mult = 1) {
    const r = rollLoot(source, Math.random, this.run.depth, mult * (this.mods?.dropMult || 1));
    if (!r) return null;
    const at = { x: pos.x + (Math.random() - 0.5) * 0.6, z: pos.z + (Math.random() - 0.5) * 0.6 };
    const k = new Pickup(this.world, { kind: r.kind, pos: at, amount: r.amount, onTake: r.kind === 'heal' ? null : () => (r.kind === 'coins' ? this.giveCoins(r.amount) : this.giveXp(r.amount)) });
    this.pickups.push(k);
    return k;
  }

  // ------------------------------------------------ AS CAIXAS DO BUNKER e as PROVAS (a luta contra a Degolificada)
  spawnBossBoxes() {
    const En = this.D.enigma;
    if (!En || !En.boxes) return;
    for (const x of this.bossBoxes) x.dispose();
    this.bossBoxes = En.boxes.map((s) => new Breakable(this.world, this.enemy, { x: s.x, z: s.z, kind: 'bossBox', yaw: s.yaw ?? 0, onBreak: (o) => this.onBossBoxBroken(o) }));
  }

  // uma caixa que ela arremessou quebrou: às vezes sai uma prova (as últimas caixas sempre têm a que falta: nunca trava)
  onBossBoxBroken(o) {
    const En = this.D.enigma;
    const dropped = this.pickups.filter((k) => k.kind === 'proof' && k.alive).map((k) => k.proof);
    const left = En.clues.map((_, i) => i).filter((i) => !this.cluesFound.includes(i) && !dropped.includes(i));
    const intact = this.bossBoxes.filter((x) => !x.broken).length;
    if (left.length && (left.length > intact || Math.random() < (En.proofChance ?? 0.5))) {
      const i = left[Math.floor(Math.random() * left.length)];
      const k = new Pickup(this.world, { kind: 'proof', pos: { x: o.pos.x, z: o.pos.z }, radius: 1.0, onTake: () => this.findProof(i) });
      k.proof = i;
      this.pickups.push(k);
      this.popup(0, 'Uma prova caiu da caixa', '#c8d8f0');
      return;
    }
    if (Math.random() < 0.35) this.dropLoot(o.pos, 'barrel', 1);
  }

  // uma PROVA (corpo da Agatha, mente do Gabriel): um terço do escudo cai
  findProof(i) {
    const En = this.D.enigma;
    if (this.cluesFound.includes(i)) return;
    this.cluesFound.push(i);
    this.clues = this.cluesFound.length;
    this.pveHud.setClues(this.clues, this.cluesNeeded);
    this.popup(0, `PROVA ${this.clues}/${this.cluesNeeded}: ${En.clues[i]}`, '#c8d8f0');
    if (this.clues < this.cluesNeeded) { this.hint(En.clueHints?.[i] || null); this.hintT = 5; }
    this.brain && this.brain.addProof && this.brain.addProof();
  }

  // coop: quem caiu volta de pé, com um terço da vida
  // ------------------------------------------------ VOLTAR À VIDA com moedas (pedido do dono, 2026-11-06; preço: PROPOSTA)
  // O preço sobe com a profundidade e a cada vez que o grupo volta nesta dungeon. Quem paga: quem apertar A/× e tiver
  // as moedas (no coop, qualquer um dos dois; online, as moedas de cada computador).
  revivePrice() {
    return Math.round(40 * (1 + 0.5 * Math.max(0, this.run.depth - 1)) * (1 + (this.revives || 0)));
  }

  coinsOf(i) {
    return this.wallet ? this.wallet.coins(i) : 0;
  }

  canAffordRevive() {
    const price = this.revivePrice();
    return this.players.some((q, i) => this.coinsOf(i) >= price);
  }

  openRevive() {
    const price = this.revivePrice();
    this.reviveOffer = { price, t: 12 };
    this.audio.play('select', { volume: 0.8, pitch: 0.7 });
    this.pveHud.showRevive(this.reviveLines());
  }

  reviveLines() {
    const o = this.reviveOffer;
    const names = this.hud.names || [];
    const who = this.players.map((q, i) => ({ name: (this.coop && names[i]) || (this.coop ? `P${i + 1}` : 'Você'), coins: this.coinsOf(i), ok: this.coinsOf(i) >= o.price }));
    return { price: o.price, t: Math.ceil(o.t), who, coop: this.coop };
  }

  updateRevive(dt) {
    const o = this.reviveOffer;
    o.t -= dt;
    let payer = -1;
    let quit = o.t <= 0;
    this.views.forEach((V, i) => {
      const pr = V.inp.pressed || {};
      if (pr.jump && this.coinsOf(i) >= o.price && payer < 0) payer = i;
      if (pr.physical) quit = true;
    });
    if (payer >= 0) {
      this.wallet.spend(payer, o.price);
      this.reviveOffer = null;
      this.pveHud.showRevive(null);
      this.pveHud.setCoins(this.coinsTotal ? this.coinsTotal() : 0);
      this.revives = (this.revives || 0) + 1;
      for (const pl of this.players) {
        pl.health = Math.round(pl.maxHealth * 0.5);
        pl.vel.set(0, 0, 0);
        pl.setState('idle');
        pl.anim.play('idle', { restart: true });
        pl.invuln = Math.max(pl.invuln || 0, 2.5);
      }
      this.phase = this.deadFrom || 'explore';
      this.phaseTime = 0;
      this.reviveAsked = false;
      this.hud.callout('DE VOLTA!', '#7dffb0');
      this.audio.play('levelUp', { volume: 0.9 });
      this.popup(payer, `-${o.price} MOEDAS`, '#ffc040');
      return;
    }
    if (quit) {
      this.reviveOffer = null;
      this.pveHud.showRevive(null);
      this.phaseTime = 2.6; // segue para o fim (a tela escurece)
      return;
    }
    this.pveHud.showRevive(this.reviveLines());
  }

  revivePlayers() {
    if (!this.coop) return;
    for (const pl of this.players) {
      if (pl.state !== 'ko') continue;
      pl.health = Math.round(pl.maxHealth * 0.35);
      pl.vel.set(0, 0, 0);
      pl.setState('idle');
      pl.anim.play('idle', { restart: true });
      this.popup(pl === this.player ? 0 : 1, 'DE PÉ DE NOVO', '#7dffb0');
    }
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
    else if (M.kind === 'boss' && M.bossTrigger) {
      // a sala do chefe começa calma (a biblioteca): a luta só quando alguém passa do gatilho (o bunker)
      this.encounter = null;
      this.pendingBoss = M;
      if (this.pveHud) { this.pveHud.hint(M.hint || null); this.hintT = 8; }
    } else if (M.kind === 'boss') this.startBoss(M);
    else {
      this.encounter = null;
      this.unlockExits(M.kind === 'stalk' ? (M.hint || 'Uma fresta… NÃO OLHE para ela (defenda para desviar o olhar) · escolha uma porta') : null);
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
    this.transit = { e, t: 0, moved: false, shown: false };
    this.pveHud.fade(true, 0.35);
    for (const p of this.players) {
      if (p.state === 'ko') continue;
      p.cancelAction && p.cancelAction();
      p.setState('intro');
      p.vel.set(0, 0, 0);
      p.anim.play('walk', { restart: true });
    }
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
      for (const p of this.players) if (p.state === 'intro') p.setState('idle');
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

  // a NEBLINA que engrossa a cada sala (D.mist): 0 no começo da rota, ~0,85 na última sala antes do chefe, 1 no chefe.
  // A cor e a densidade do fog da cena seguem devagar (sem salto na troca de sala) e a névoa rasteira acompanha.
  mistLevel() {
    const M = this.mod;
    if (!M) return 0;
    if (M.kind === 'boss' || this.modId === this.D.bossModule) return 1;
    if (M.kind === 'start') return 0;
    return Math.min(0.85, 0.85 * this.step / Math.max(1, this.routeLen));
  }

  updateMist(dt) {
    const fog = this.world.scene.fog;
    const X = this.D.mist;
    if (!fog || fog.density === undefined) return;
    const want = this.mistLevel();
    this.mistK = this.mistK === undefined ? want : this.mistK + (want - this.mistK) * Math.min(1, dt * 0.8);
    const k = this.mistK;
    const a = k < 0.85 ? X.from : X.to, b = k < 0.85 ? X.to : X.boss;
    const t = k < 0.85 ? k / 0.85 : (k - 0.85) / 0.15;
    fog.density = a.density + (b.density - a.density) * t;
    if (!this.mistA) { this.mistA = new THREE.Color(); this.mistB = new THREE.Color(); }
    fog.color.copy(this.mistA.setHex(a.color)).lerp(this.mistB.setHex(b.color), t);
    // a névoa rasteira: fumaça baixa e lenta em volta de quem joga (nada no corredor do começo)
    if (X.wisps && k > 0.05 && this.player && Math.random() < dt * X.wisps * k) {
      const p = this.player.pos, ang = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 5;
      const at = new THREE.Vector3(p.x + Math.sin(ang) * r, 0.15 + Math.random() * 0.35, p.z + Math.cos(ang) * r);
      this.world.fx.burst(at, { count: 1, color: 0x8a9496, kind: 'smoke', speed: 0.15, up: 0.05, life: 3.2, size: 1.6 + k * 1.2, grow: 1 });
    }
  }

  // a porta trancada: ninguém passa — os DOIS jogadores (antes só o 1º: em dupla o 2º atravessava a saída fechada e a
  // chefe ia atrás e ficava presa no corredor final, relato do dono 2026-11-08) e o inimigo (a chefe)
  applyGates(dt) {
    const bodies = [...this.players];
    if (this.enemy && !this.enemy.lurking && !bodies.includes(this.enemy)) bodies.push(this.enemy);
    for (const g of this.gates) {
      if (g.mesh) {
        g.k += ((g.open ? 0 : 0.86) - g.k) * Math.min(1, dt * 4);
        g.mesh.material.opacity = g.k;
        g.mesh.visible = g.k > 0.02;
        if (!g.open && Math.random() < dt * 10) this.world.fx.burst(v1.set(g.x, 0.4 + Math.random() * 2.2, (Math.random() - 0.5) * 2.4).clone(), { count: 1, color: Math.random() < 0.3 ? 0xf2c230 : 0x1a1418, kind: Math.random() < 0.3 ? undefined : 'smoke', speed: 0.4, life: 0.8, size: 0.25 });
      }
      if (g.open) continue;
      for (const p of bodies) {
        if (!p || !p.pos) continue;
        if (g.side === 'max' && p.pos.x > g.x - 0.55) p.pos.x = g.x - 0.55;
        if (g.side === 'min' && p.pos.x < g.x + 0.55) p.pos.x = g.x + 0.55;
      }
    }
  }

  // a luta da sala na ESCOLA: os ZUMBIS DE SANGUE (cânone: o bombeiro Jorge virou um; PROPOSTA: os outros e quantos).
  // O inimigo da vez fica escondido (é o "dono" dos zumbis); a sala termina quando não sobra zumbi.
  startZombieEncounter(r, count = 2) {
    const e = this.enemy;
    this.encounter = { room: r, done: false, koAt: this.world.time, zombies: true };
    e.pos.set(r.spawn.x, 0, r.spawn.z);
    for (let i = 0; i < count; i++) {
      const strong = count >= 3 && i === 0;
      const ang = Math.PI / 2 + ((i + 0.5) / count) * Math.PI * 2;
      const pos = new THREE.Vector3(r.spawn.x + Math.sin(ang) * (count > 1 ? 2.2 : 0), 0, r.spawn.z + Math.cos(ang) * (count > 1 ? 2.2 : 0));
      resolveBody(this.world.arena, pos, 0.8);
      const z = new BloodZombie(e, this.world, pos, { strong, duration: Infinity, hp: Math.round(ZOMBIE_HP[strong ? 'strong' : 'weak'] * this.scale.hp) });
      z.onDestroyed = () => this.onZombieSlain(z);
      this.world.addNpc(z);
      this.copias.push(z);
    }
    e.cpuEdge = { dealt: this.scale.dealt * MINION_DEALT, taken: 1 };
    this.audio.play('fearGaze', { volume: 0.5, pitch: 0.6 });
    this.pveHud.hint(null);
  }

  onZombieSlain(z) {
    this.stats.kills++;
    this.giveXp(z.strong ? this.D.xp.zumbiForte : this.D.xp.zumbi);
    this.tryHeal(z.pos, z.strong ? 1 : 0.6);
    if (this.mods.killHeal) for (const pl of this.players) if (pl.state !== 'ko') pl.health = Math.min(pl.maxHealth, pl.health + pl.maxHealth * this.mods.killHeal * 0.5);
  }

  startEncounter(r, count = 2) {
    if (this.D.minions === 'zumbi') { this.startZombieEncounter(r, count); return; }
    const e = this.enemy;
    this.encounter = { room: r, done: false, koAt: null };
    e.lurking = false;
    // os monstros da sala saem MISTURADOS do time (pedido do dono, 2026-11-06): cada um do time aparece antes de repetir
    const mix = this.pickClones(count);
    const src = mix[0]; // o Devorado
    if (e.def.copyOf !== src.id) {
      const previousRig = e.rig;
      this.world.scene.remove(previousRig.root);
      this.devDef = devoradoDef(src, { hp: Math.round(DEVORADO_HP * this.scale.hp) });
      e.applyDef(this.devDef, restyleDevorado(buildModel(src.model)));
      disposeRigResources(previousRig.root);
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
    this.hudRemove('pve-noboss');
    this.hudAdd('pve-minor');
    this.bindHud();
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
    const p2 = this.enemySlot;
    p2.setVirtual(null);
    p2.cpu = new CpuController({ level });
    p2.cpu.attach(this.enemy);
  }

  startBoss(r) {
    const w = this.world;
    const e = this.enemy;
    const def = BOSSES[this.D.boss];
    this.encounter = { room: r, boss: true, done: false };
    const previousRig = e.rig;
    w.scene.remove(previousRig.root);
    // sem o modelo próprio (falhou o download): o corpo do Carniçal, para a luta não travar
    e.applyDef(def, buildModel(isModelLoaded(def.model) ? def.model : 'carnical'));
    disposeRigResources(previousRig.root);
    e.lurking = false;
    e.maxHealth = Math.round(def.stats.maxHealth * this.scale.hp * (this.D.bossTune?.hp ?? 1));
    e.reset();
    this.hudAdd('pve-noboss');
    this.pveHud.hint(null);
    if (this.D.boss === 'degolificada') {
      // a PASSAGEM SECRETA se fecha atrás de quem entrou (pedido do dono, 2026-11-08: dava para voltar para a biblioteca):
      // quem ficou para trás (o 2º jogador em dupla) vem junto para dentro do bunker; abre de novo quando ela cai
      if (r.bossTrigger && !this.bossGate) {
        const gx = r.rects[0].minX - 0.2;
        this.bossGate = this.addGate(gx, 'min');
        this.audio.play('closetSlam', { volume: 0.8, pitch: 0.7 });
        for (const q of this.players) if (q.pos.x < gx + 0.6) { q.pos.set(gx + 1.6, q.pos.y, 0); resolveBody(w.arena, q.pos, q.radius || 0.5); }
      }
      // ela se forma no meio do bunker (pve/degolificada.js), depois a luta
      this.bossIntro = new DegolificadaIntro(this, r.spawn);
      return;
    }
    // ele sai do armário mais perto da porta: primeiro a CENA (pve/espreitadorIntro.js), depois a luta
    const c0 = this.closets.slice().sort((a, b) => distXZ(a.pos, this.player.pos) - distXZ(b.pos, this.player.pos))[0];
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
    e.cpuEdge = { dealt: this.scale.dealt * (this.D.bossTune?.dealt ?? 1), taken: 1 };
    this.hudRemove('pve-noboss', 'pve-minor');
    if (this.D.boss === 'degolificada') {
      this.spawnBossBoxes();
      this.brain = new DegolificadaBrain(this);
      this.bindHud();
      this.pveHud.hint('A barra azul é o ESCUDO DE MEDO: não quebra com golpes. Desvie das CAIXAS que ela arremessa: de uma delas sai uma PROVA');
      this.hintT = 9;
      return;
    }
    for (const c of this.closets) { if (c.open) { c.alive = true; w.addNpc(c); } }
    this.brain = new EspreitadorBrain(this, { closets: this.closets, playerDef: this.playerDef, cloneDefs: this.cloneDefs });
    this.bindHud();
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
    const c = new Chest(this.world, { pos, yaw: Math.random() * Math.PI * 2, manual: true, luck, light: this.chestLight, onOpen: (pp, ch) => this.openChest(ch) });
    this.pickups.push(c);
    return c;
  }

  // o BAÚ (pedido do dono, 2026-11-06, como no Vampire Survivors): sobe de grau 1 a 3 melhorias TEMPORÁRIAS que você já
  // escolheu nesta tentativa (1 é o comum; 3 é raro — upgrades.js chestCount). O que não tiver melhoria para subir vira
  // moedas. Devolve os ícones que saem do baú (a animação em pickups.js Chest)
  openChest(c) {
    this.stats.chests++;
    const n = chestCount(Math.random, c.luck || 0);
    const ups = chestUpgrades(this.run.picks, Math.random, n);
    const items = [];
    const rows = [];
    for (const id of ups) {
      this.run.picks.push(id);
      const u = getUpgrade(id);
      items.push({ icon: u.icon, colorCss: '#ffd84a' });
      rows.push({ icon: u.icon, name: u.name, tag: `nv ${countOf(this.run.picks, id)}` });
    }
    if (ups.length) {
      this.applyPlayerMods(false);
      this.pveHud.setRun(this.run, this.run.depth);
    }
    // o que sobrou (nada para subir: tudo no máximo, ou o limite de habilidades cheio e as que tem no máximo): o jogador
    // ESCOLHE moedas ou vida (pedido do dono, 2026-11-06)
    const missing = n - ups.length;
    if (missing > 0) {
      const coins = Math.round(missing * (3 + Math.random() * 3) * (1 + 0.25 * Math.max(0, this.run.depth - 1)) * (1 + (c.luck || 0))); // antes 12–24 cada (moedas menores, 2026-11-08)
      const heal = Math.min(0.75, 0.3 * missing);
      items.push({ icon: '?', colorCss: '#ffc040' });
      rows.push({ icon: '?', name: 'Moedas ou vida', tag: 'escolha' });
      this.pendingRewards = [...(this.pendingRewards || []), { coins, heal }];
    }
    for (const id of ups) if (getUpgrade(id).chest && countOf(this.run.picks, id) === 1) this.hud.callout(getUpgrade(id).name.toUpperCase(), '#7ec8ff');
    this.pveHud.loot(n >= 3 ? 'Baú raro' : 'Baú', rows, n);
    return items;
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
    if (this.players.includes(f)) {
      if (this.phase === 'dead') return;
      if (this.coop && this.players.some((p) => p !== f && p.state !== 'ko')) {
        this.hud.callout(`${f === this.player ? 'P1' : 'P2'} CAIU`, '#ff4a3a');
        this.audio.play('ko', { volume: 0.8 });
        this.hint('Quem caiu volta de pé na próxima sala (ou quando a sala ficar limpa)');
        this.hintT = 4;
        return;
      }
      this.deadFrom = this.phase === 'bossDown' ? 'bossDown' : this.encounter && !this.encounter.done ? 'fight' : 'explore';
      this.phase = 'dead';
      this.phaseTime = 0;
      this.hud.callout(this.D.deathText || 'DEVORADO', '#ff4a3a');
      this.audio.play('ko', { volume: 1.2 });
      this.pveHud.hint(null);
      return;
    }
    if (!this.encounter || this.encounter.done) return;
    const at = f.pos.clone();
    if (this.encounter.boss) {
      this.encounter.done = true;
      this.brain && this.brain.onDeath && this.brain.onDeath();
      this.brain && this.brain.dispose();
      this.brain = null;
      this.clearEspreitadorEyes();
      this.bossDeadAt = at;
      this.phase = 'bossDown';
      this.phaseTime = 0;
      if (this.bossGate) this.openGate(this.bossGate);
      this.hud.callout(this.D.bossDownText || 'O ESPREITADOR CAIU', '#ffd84a');
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
    if (this.mods.killHeal) for (const pl of this.players) if (pl.state !== 'ko') pl.health = Math.min(pl.maxHealth, pl.health + pl.maxHealth * this.mods.killHeal);
  }

  clearEspreitadorEyes() {
    for (const c of this.closets) c.hideEyes();
    for (const id in this.cracks) this.cracks[id].hideEyes();
    this.activeCrack = null;
  }

  onCopiaSlain(n) {
    this.stats.copias++;
    this.giveXp(this.D.xp.copia);
    this.tryHeal(n.pos, 0.6);
    if (this.mods.killHeal) for (const pl of this.players) if (pl.state !== 'ko') pl.health = Math.min(pl.maxHealth, pl.health + pl.maxHealth * this.mods.killHeal * 0.5);
  }

  // o que cai de um monstro: a cura (chance da dungeon) e, à parte, moedas ou experiência (pve/unlocks.js LOOT_ODDS)
  tryHeal(pos, mult) {
    const amount = rollHeal(this.D.id, Math.random, mult * this.diff.drop * (this.mods.dropMult || 1));
    if (amount) this.pickups.push(new Pickup(this.world, { kind: 'heal', pos: { x: pos.x, z: pos.z }, amount }));
    this.dropLoot({ x: pos.x + 0.7, z: pos.z }, 'monster', mult * this.diff.drop);
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

  // MOEDAS ou VIDA (o baú sem nada para subir, ou a carta de nível quando tudo chegou ao máximo): o jogador escolhe;
  // a vida vai para os dois no coop
  openReward(r) {
    this.audio.play('levelUp', { volume: 0.8, pitch: 1.1 });
    this.choosing = true;
    const who = this.coop ? this.chooser : 0;
    if (this.coop) this.chooser = 1 - this.chooser;
    const choices = rewardChoices(r.coins, r.heal);
    this.pveHud.openChoice(choices, this.run, (id) => {
      this.choosing = false;
      if (id === 'reward:coins') this.giveCoins(r.coins);
      else {
        for (const pl of this.players) if (pl.state !== 'ko') pl.health = Math.min(pl.maxHealth, pl.health + pl.maxHealth * r.heal);
        this.audio.play('heal', { volume: 0.8 });
        this.hud.callout('VIDA', '#7cff9a');
      }
    }, { who, coop: this.coop, noClick: !!this.net || (this.coop && who === 1), mine: this.local === null || this.local === who, title: 'NADA MAIS PARA SUBIR', sub: 'Escolha a recompensa', what: 'a recompensa' });
  }

  // abre as cartas de melhoria (o jogo para enquanto escolhe)
  openLevelUp() {
    this.pendingUps--;
    const choices = rollChoices(this.run.picks);
    if (!choices.length) { this.openReward({ coins: Math.round(4 * (1 + 0.25 * Math.max(0, this.run.depth - 1))), heal: 0.3 }); return; }
    this.audio.play('levelUp', { volume: 1 });
    this.choosing = true;
    const who = this.coop ? this.chooser : 0;
    if (this.coop) this.chooser = 1 - this.chooser;
    this.pveHud.openChoice(choices, this.run, (id) => {
      this.run.picks.push(id);
      this.applyPlayerMods(false);
      this.pveHud.setRun(this.run, this.run.depth);
      this.choosing = false;
      this.hud.callout(choices.find((u) => u.id === id).name.toUpperCase(), '#ffd84a');
    }, { who, coop: this.coop, noClick: !!this.net || (this.coop && who === 1), mine: this.local === null || this.local === who });
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
    if (this.encounter && this.encounter.boss && !this.encounter.done) return [p, this.focusAt((p.pos.x + (this.D.bossCenter ?? 50)) / 2, p.pos.z * 0.5)];
    return [p, this.focusAt(p.pos.x + 4.5, p.pos.z * 0.6)]; // um ponto à frente: a câmera abre e mostra para onde ir
  }

  // ------------------------------------------------ VISTAS (coop local, pedido do dono 2026-11-06): uma por jogador —
  // a câmera dele (metade da tela), a trava de mira, as setas e o aviso de interagir, numa CAMADA (layer) só dela
  makeView(i, p, inp, rig) {
    const w = this.world;
    const layer = this.coop ? i + 1 : 0;
    const V = { i, p, inp, rig, layer, lockOn: true, lockT: null, lockBtnPrev: false, flick: 0, flickCd: 0, interactLatch: false };
    V.prompt = new InteractPrompt(w);
    V.prompt.layer = layer;
    V.arrowChest = makeArrow(w.scene, 0x4aa8ff);
    V.arrowDoors = [0, 1, 2].map(() => makeArrow(w.scene, 0xf2c230));
    for (const m of [V.arrowChest, ...V.arrowDoors]) onLayer(m, layer);
    if (layer) rig.camera.layers.enable(layer);
    return V;
  }

  get players() { return this.coop ? [this.player, this.player2] : [this.player]; }
  // os testes e a pausa ligam/desligam a trava do P1
  get lockOn() { return this.views ? this.views[0].lockOn : true; }
  set lockOn(v) { if (this.views) this.views[0].lockOn = v; }
  get lockT() { return this.views ? this.views[0].lockT : null; }
  get prompt() { return this.views ? this.views[0].prompt : null; }
  get onStairs() { return !!this.player.onStairs; }

  // o alvo do inimigo no coop: o jogador de pé mais perto (segura o mesmo por um tempo, para não ficar trocando)
  enemyTarget() {
    const e = this.enemy;
    const alive = this.players.filter((p) => p.state !== 'ko');
    if (!alive.length) return this.player;
    if (this.eTgt && alive.includes(this.eTgt) && this.eTgtT > 0) return this.eTgt;
    this.eTgt = alive.sort((x, y) => distXZ(x.pos, e.pos) - distXZ(y.pos, e.pos))[0];
    this.eTgtT = 2.5;
    return this.eTgt;
  }

  // ------------------------------------------------ as SETAS (pedido do dono, 2026-11-05): com a sala limpa, AMARELAS
  // para as portas abertas (ou a recompensa / a saída, depois do chefe) e AZUL para o baú ainda fechado (opcional)
  updateArrows(dt, V = this.views[0]) {
    const p = V.p.pos;
    const time = this.world.time;
    const hide = this.bossIntro || this.choosing || this.transit || V.p.state === 'ko' || ['intro', 'dead', 'exit', 'over'].includes(this.phase) || (this.encounter && !this.encounter.done);
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
    aimArrow(V.arrowChest, p, chest, dt, time, 1.0);
    V.arrowDoors.forEach((m, i) => aimArrow(m, p, yellow[i] || null, dt, time, 1.35));
  }

  // ------------------------------------------------ TRAVA NO INIMIGO (pedido do dono, 2026-11-06): na luta a câmera trava
  // num inimigo (senão o avanço sai na direção da parede). Um movimento rápido do mouse / analógico direito troca de alvo;
  // F, o botão do meio do mouse ou R3 liga e desliga a trava.
  lockCandidates(p) {
    const e = this.enemy;
    const out = [];
    if (e.visible && !e.lurking && e.state !== 'intro' && e.state !== 'ko' && distXZ(p.pos, e.pos) < LOCK_RANGE) out.push(e);
    for (const n of this.world.npcs) {
      if (!n.alive || n.isCloset || this.players.includes(n.owner) || !n.pos) continue;
      if (distXZ(n.pos, p.pos) < LOCK_RANGE) out.push(n);
    }
    return out;
  }

  validLock(t, p) {
    if (!t) return false;
    if (t === this.enemy) return t.visible && !t.lurking && t.state !== 'ko' && t.state !== 'intro' && distXZ(t.pos, p.pos) < LOCK_RANGE + 3;
    return t.alive && distXZ(t.pos, p.pos) < LOCK_RANGE + 3;
  }

  // o alvo na direção `side` (−1 esquerda, +1 direita) a partir do atual; sem side: o mais perto do centro da tela
  pickLock(V, side = 0) {
    const p = V.p.pos;
    const cams = this.lockCandidates(V.p);
    if (!cams.length) return null;
    const fwd = V.rig.yaw + Math.PI; // a frente da câmera
    const ref = side && V.lockT ? Math.atan2(V.lockT.pos.x - p.x, V.lockT.pos.z - p.z) : fwd;
    let best = null;
    let bs = Infinity;
    for (const t of cams) {
      if (side && t === V.lockT) continue;
      const ang = Math.atan2(t.pos.x - p.x, t.pos.z - p.z);
      let da = ang - ref;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      // yaw cresce para a esquerda da tela; "direita" = da negativo
      if (side && Math.sign(-da) !== side) continue;
      const score = side ? Math.abs(da) : Math.abs(da) * 4 + distXZ(t.pos, p) * 0.25;
      if (score < bs) { bs = score; best = t; }
    }
    return best || (side ? V.lockT : null);
  }

  updateLock(dt, V = this.views[0]) {
    const L = V.inp.look || {};
    if (L.lockBtn && !V.lockBtnPrev) {
      V.lockOn = !V.lockOn;
      V.lockT = V.lockOn ? this.pickLock(V) : null;
      this.audio.play('select', { volume: 0.5, pitch: V.lockOn ? 1.2 : 0.8 });
      this.popup(V.i, V.lockOn ? 'MIRA TRAVADA' : 'MIRA LIVRE', '#f2c230');
    }
    V.lockBtnPrev = L.lockBtn;
    const busy = this.bossIntro || this.transit || V.p.state === 'ko' || ['intro', 'dead', 'exit', 'over'].includes(this.phase);
    if (!V.lockOn || busy) { V.lockT = null; this.updateLockMark(dt, V); return; }
    if (!this.validLock(V.lockT, V.p)) V.lockT = this.pickLock(V);
    // trocar de alvo: um movimento rápido para o lado
    V.flick = V.flick * Math.max(0, 1 - dt * 6) + (L.mx || 0) + (L.x || 0) * 900 * dt;
    V.flickCd = Math.max(0, V.flickCd - dt);
    if (V.lockT && V.flickCd <= 0 && Math.abs(V.flick) > 70) {
      const nt = this.pickLock(V, Math.sign(V.flick));
      if (nt && nt !== V.lockT) { V.lockT = nt; this.audio.play('select', { volume: 0.35, pitch: 1.4 }); }
      V.flick = 0;
      V.flickCd = 0.3;
    }
    this.updateLockMark(dt, V);
  }

  // o marcador no chão, embaixo do alvo travado
  updateLockMark(dt, V) {
    if (!V.lockMark) {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.68, 4, 1), new THREE.MeshBasicMaterial({ color: V.i ? 0x4ab0ff : 0xff4a2a, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2;
      m.renderOrder = 5;
      onLayer(m, V.layer);
      this.world.scene.add(m);
      V.lockMark = m;
    }
    const m = V.lockMark;
    const t = V.lockT;
    m.material.opacity += ((t ? 0.85 : 0) - m.material.opacity) * Math.min(1, dt * 8);
    m.visible = m.material.opacity > 0.02;
    if (t) {
      m.position.set(t.pos.x, 0.05, t.pos.z);
      m.rotation.z += dt * 1.6;
      const sc = (t.size || 1) * (1 + 0.06 * Math.sin(this.world.time * 6));
      m.scale.setScalar(sc);
    }
  }

  chaseTarget(V = this.views[0]) {
    const p = V.p;
    const e = this.enemy;
    // CÂMERA LIVRE: o jogador gira a câmera (mouse / analógico direito) e o personagem mira para onde ela aponta
    const out = { player: p, focus: null, free: !this.bossIntro && this.phase !== 'exit', look: V.inp.look };
    // TRAVADA: a câmera fica atrás do jogador olhando o alvo (o corpo mira nele; o mouse só troca de alvo)
    if (V.lockT && out.free) {
      const t = V.lockT.pos;
      out.focus = t;
      out.free = false;
      if (distXZ(p.pos, t) > 0.8) { out.yaw = Math.atan2(p.pos.x - t.x, p.pos.z - t.z); out.lockRate = 7; }
      return out;
    }
    if (e.visible && !e.lurking && e.state !== 'intro' && distXZ(p.pos, e.pos) < 16) { out.focus = e.pos; return out; }
    let near = null; let nd = 9;
    for (const n of this.world.npcs) {
      if (!n.alive || n.isCloset || this.players.includes(n.owner)) continue;
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
    for (const pl of this.players) pl.onStairs = false;
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
  stairHeight(f) {
    const S = this.stairs;
    const pos = f.pos;
    if (!S || !f.onStairs) return 0;
    const k = Math.max(0, Math.min(1, (pos.x - S.x0) / (S.x1 - S.x0)));
    return k * S.top;
  }

  inStairs(x, z, m = 0) {
    const S = this.stairs;
    return S && x > S.x0 - m && x < S.landingX + m && z > S.minZ - m && z < S.maxZ + m;
  }

  updateStairs(p, prevX, prevZ) {
    const S = this.stairs;
    if (!S) return;
    const r = p.radius || 0.45;
    if (p.onStairs) {
      // nos degraus: entre os corrimãos, até o fim do patamar; descendo até o pé, volta ao chão
      p.pos.z = Math.max(S.minZ + r * 0.5, Math.min(S.maxZ - r * 0.5, p.pos.z));
      p.pos.x = Math.min(S.landingX - r * 0.6, p.pos.x);
      if (p.pos.x < S.x0 - 0.05) p.onStairs = false;
      return;
    }
    // no chão: só entra na escada pelo pé (onde o degrau ainda é baixo); pelos lados e por baixo, o bloco barra
    if (this.inStairs(p.pos.x, p.pos.z, r)) {
      const k = (p.pos.x - S.x0) / (S.x1 - S.x0);
      const fromFoot = prevX <= S.x0 + 0.15 && p.pos.z > S.minZ + 0.1 && p.pos.z < S.maxZ - 0.1;
      if (k < 0.12 && fromFoot && p.pos.y < 0.3) p.onStairs = true;
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
  updateInteract(V = this.views[0]) {
    const p = V.p;
    const inp = V.inp;
    const pr = inp.pressed || {};
    const held = inp.held || {};
    // o botão apertado para interagir não vira defesa nem golpe até ser solto
    if (V.interactLatch) {
      if (!held.interact) V.interactLatch = false;
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
        if (d.spot.landing && !p.onStairs) continue; // a porta do patamar: só de cima da escada
        consider(d, d.reach(p.pos), (d.spot.y || 0) + (d.stairs ? 1.6 : 2.0), d.stairs ? 'Subir' : d.padlock ? (this.keys > 0 ? 'Destrancar' : 'Trancada') : d.spot.landing ? 'Entrar' : 'Abrir');
      }
      for (const k of this.pickups) {
        if (!(k instanceof Chest) || k.opened) continue;
        const dd = distXZ(k.pos, p.pos);
        if (dd < 1.5) consider(k, dd, 1.35, 'Abrir');
      }
      for (const dr of this.drawers) consider(dr, dr.reach(p.pos), (dr.spot.y ?? 0.6) + 0.7, 'Abrir');
    }
    if (!best) { V.prompt.hide(); return; }
    const btn = inp.source === 'gamepad' ? 'B' : V.i ? 'DEF' : 'E';
    const at = best.o instanceof RoomDoor ? best.o.target(v3) : best.o.pos;
    V.prompt.show(at, best.y, `${btn}|${best.verb}`);
    if (!pr.interact) return;
    // usou: o aperto é do interagir
    V.interactLatch = true;
    held.block = false; pr.block = false; pr.physical = false;
    this.interact(best.o, V);
  }

  interact(o, V = this.views[0]) {
    const p = V.p;
    if (o instanceof RoomDoor) {
      if (o.stairs) { V.prompt.hide(); this.startTransit(o.exit); return; }
      if (o.padlock) {
        if (this.keys <= 0) {
          this.audio.play('creak', { volume: 0.5, pitch: 0.5 });
          this.popup(V.i, 'TRANCADA — PRECISA DE UMA CHAVE', '#c8b8a0');
          return;
        }
        this.keys--;
        this.pveHud.setKeys(this.keys);
        o.unpad();
        this.audio.play('select', { volume: 0.7, pitch: 0.7 });
        this.world.fx.burst(o.target(v3).clone().setY(1.1), { count: 18, color: 0xe8c050, speed: 2.2, life: 0.5, size: 0.08 });
        this.popup(V.i, 'DESTRANCADA', '#e8c050');
      }
      o.opened = true;
      return;
    }
    if (o instanceof Chest) { o.open(p); return; }
    if (o instanceof Drawer) {
      const c = o.open();
      this.audio.play('creak', { volume: 0.45, pitch: 1.7 });
      if (!c) { this.popup(V.i, 'VAZIA', '#9a9088'); return; }
      if (c.kind === 'key') {
        this.keys++;
        this.pveHud.setKeys(this.keys);
        this.audio.play('pickup', { volume: 1, pitch: 1.1 });
        this.popup(V.i, '+1 CHAVE', '#e8c050');
      } else if (c.kind === 'coins') {
        this.world.fx.burst(new THREE.Vector3(o.spot.x, (o.spot.y ?? 0.6) + 0.2, o.spot.z), { count: 14, color: 0xffd84a, speed: 2, life: 0.5, size: 0.1, up: 1.4 });
        this.giveCoins(c.amount);
      } else if (c.kind === 'xp') {
        this.world.fx.burst(new THREE.Vector3(o.spot.x, (o.spot.y ?? 0.6) + 0.2, o.spot.z), { count: 12, color: 0x6ad1ff, speed: 2, life: 0.5, size: 0.1, up: 1.4 });
        this.giveXp(c.amount);
      } else if (c.kind === 'heal') {
        this.pickups.push(new Pickup(this.world, { kind: 'heal', pos: { x: p.pos.x, z: p.pos.z }, amount: c.amount }));
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
    if (this.endQueued) { this.flushEnd(); return; }
    if (this.phase === 'loading' || this.phase === 'over' || this.disposed) return;
    // a cena de entrada do Espreitador: o mundo anda (animações, câmera), mas ninguém luta
    if (this.bossIntro) {
      for (const q of this.players) q.aimYaw = null;
      this.updateArrows(dt);
      this.phaseTime += dt;
      this.world.update(dt);
      for (const c of this.closets) if (c !== this.bossIntro.c) c.tick(dt);
      if (this.bossIntro.update(dt, this.input)) this.beginBossFight();
      this.hud.update(this);
      return;
    }
    // a oferta de voltar à vida: o mundo para até alguém pagar ou desistir
    if (this.reviveOffer) {
      this.updateRevive(dt);
      this.hud.update(this);
      return;
    }
    // escolhendo melhoria: o mundo para
    if (this.choosing) {
      this.pveHud.updateChoice(this.input, this.audio);
      if (this.endQueued) this.flushEnd();
      this.hud.update(this);
      return;
    }
    if (!this.choosing && this.pendingRewards && this.pendingRewards.length && this.phase !== 'dead' && this.phase !== 'exit' && this.player.state !== 'ko' && !this.world.cinematic) this.openReward(this.pendingRewards.shift());
    else if (this.pendingUps > 0 && this.phase !== 'dead' && this.phase !== 'exit' && this.player.state !== 'ko' && !this.world.cinematic) {
      this.openLevelUp();
      return;
    }
    this.phaseTime += dt;
    this.stats.time += dt;
    const w = this.world;
    const p = this.player;
    // CÂMERA LIVRE: o mouse/analógico direito giram a câmera e o corpo mira para onde ela olha (frente = yaw + π)
    this.input.freeLook = true;
    this.input.coopLook = this.coop;
    if (this.eTgtT > 0) this.eTgtT -= dt;
    for (const V of this.views) {
      const q = V.p;
      q.aimYaw = this.phase === 'exit' || this.phase === 'dead' || q.input?.cpu ? null : V.rig.yaw + Math.PI;
      // travado: o corpo mira direto no alvo (não espera a câmera terminar de virar)
      if (q.aimYaw !== null && V.lockT && V.lockT.pos) q.aimYaw = Math.atan2(V.lockT.pos.x - q.pos.x, V.lockT.pos.z - q.pos.z);
      // um erro na interação (porta, gaveta, baú) não pode impedir o mundo de andar logo abaixo (travamentos, 2026-11-07)
      try { this.updateInteract(V); } catch (e) { console.error('Erro na interação do Outro Lado:', e); }
    }
    const prev = this.players.map((q) => [q.pos.x, q.pos.z]);
    w.update(dt);
    if (this.coop) this.views[1].rig.update(dt, [this.player2]);
    this.players.forEach((q, i) => this.updateStairs(q, prev[i][0], prev[i][1]));
    this.applyGates(dt);
    this.updateExitDoor(dt);
    if (this.D.mist) this.updateMist(dt);
    this.lamp.position.set(p.pos.x, p.pos.y + 2.4, p.pos.z);
    this.ambience && this.ambience.update(dt);
    for (const V of this.views) { this.updateLock(dt, V); this.updateArrows(dt, V); }
    if (this.transit) this.updateTransit(dt);
    for (const d of this.doors) {
      d.update(dt, p.pos);
      const pass = this.players.some((q) => q.state !== 'ko' && d.passes(q.pos) && (!d.spot.landing || q.onStairs));
      if (d.creaked) this.audio.play('creak', { volume: 0.55, pitch: d.entry ? 0.75 : 0.9 + Math.random() * 0.2 });
      if (pass && d.exit && !this.transit && (this.phase === 'explore' || this.phase === 'fight')) this.startTransit(d.exit);
    }
    for (const c of this.closets) if (!this.brain) c.tick(dt);
    for (const k of this.pickups) k.update(dt, this.players.filter((q) => q.state !== 'ko'));
    for (const d of this.drawers) d.update(dt);
    for (const x of this.bossBoxes) x.update(dt);
    this.bossBoxes = this.bossBoxes.filter((x) => x.alive);
    this.pickups = this.pickups.filter((k) => k.alive);
    this.copias = this.copias.filter((c) => c.alive);
    if (this.hintT > 0) { this.hintT -= dt; if (this.hintT <= 0) this.pveHud.hint(null); }
    // a goteira (o som da Mansão)
    this.drip -= dt;
    if (this.drip <= 0 && this.ambience) { this.drip = 1.6 + Math.random() * 2.6; this.audio.play('drip', { volume: 0.35 + Math.random() * 0.25, pitch: 0.9 + Math.random() * 0.25 }); }
    // as melhorias de regeneração (Carne Dura)
    // PULSO DE MEDO (baú): a cada 4,5 s, uma onda em volta de quem tem (dano 30/45/60, escala com o dano das habilidades)
    for (const q of this.players) {
      const pm = q.pveMods;
      if (!pm || !pm.pulse || q.state === 'ko' || this.phase !== 'explore' || this.world.cinematic) continue;
      q.pulseT = (q.pulseT ?? 4.5) - dt;
      if (q.pulseT > 0) continue;
      q.pulseT = 4.5;
      const dmg = Math.round((15 + 15 * pm.pulse) * (pm.dealt.ability || 1));
      this.world.fx.ring(new THREE.Vector3(q.pos.x, 0.1, q.pos.z), { color: 0x8aa4c8, radius: 3, life: 0.4 });
      const e = this.enemy;
      if (e && e.visible && !e.lurking && e.state !== 'ko' && e.state !== 'intro' && distXZ(e.pos, q.pos) <= 3 + e.radius) applyHit(this.world, q, e, { damage: dmg, kind: 'ability', unblockable: true, reaction: false, knockback: 0, hitstun: 0, sound: 'impact', color: 0x8aa4c8, scale: 0.7 });
      for (const n of this.world.hostileNpcs(q)) if (!n.isCloset && n.pos && n.hitBy && !this.players.includes(n.owner) && distXZ(n.pos, q.pos) <= 3 + (n.radius || 0.5)) n.hitBy(q, dmg, { kind: 'ability' });
    }
    for (const q of this.players) if (q.pveMods && q.pveMods.regenHp > 0 && q.state !== 'ko' && !['hitstun', 'downed', 'stun', 'grabbed'].includes(q.state)) q.health = Math.min(q.maxHealth, q.health + q.maxHealth * q.pveMods.regenHp * dt);

    switch (this.phase) {
      case 'intro':
        if (this.phaseTime > 1.1) {
          for (const q of this.players) q.setState('idle');
          this.phase = 'explore';
          this.hud.banner(this.D.name.toUpperCase(), this.D.color);
          this.pveHud.hint(this.player.input?.source === 'gamepad' ? (this.D.exploreHint || 'Explore a mansão →') : 'Clique esq. golpe · clique dir. tiro · 1–5 habilidades · Z especial · G agarrão · E defesa · Shift esquiva · C (segure) sanidade · Q/R assistências · F trava a mira');
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
        // VOLTAR À VIDA com moedas (pedido do dono, 2026-11-06): antes do fim, quem tiver moedas pode pagar
        if (this.phaseTime > 1.6 && !this.ended && !this.reviveAsked) {
          this.reviveAsked = true;
          if (this.canAffordRevive()) { this.openRevive(); break; }
        }
        if (this.phaseTime > 2.6 && !this.ended && !this.reviveOffer) {
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
    if (this.coop) {
      const e = this.enemy;
      const show = this.encounter && !this.encounter.done && e.visible && !e.lurking && e.state !== 'intro';
      this.pveHud.setEnemy(show ? e.def.name : null, e.health / e.maxHealth);
    }
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
        this.hudRemove('pve-minor');
        this.hud.callout('SALA LIMPA', '#7dffb0');
        this.revivePlayers();
        if (this.via && this.via.padlock === 'fight' && this.mod.chests && this.mod.chests.length) {
          const s = this.mod.chests.slice().sort((a, b) => distXZ(a, p.pos) - distXZ(b, p.pos))[0];
          const c = this.spawnChest(s, (this.D.locks || {}).luck || 0.6);
          this.world.fx.burst(new THREE.Vector3(c.pos.x, 0.6, c.pos.z), { count: 24, color: 0x6c6a66, kind: 'smoke', speed: 1.6, life: 0.7, size: 0.5, grow: 1 });
        }
        this.unlockExits();
      }
    }
    if (this.brain && enc && enc.boss && !enc.done) this.brain.update(this.lastDt);
    // a sala do chefe com gatilho (o bunker da escola): a luta começa quando alguém passa dele
    const B = this.pendingBoss;
    if (B && this.mod === B && !this.transit && this.players.some((q) => q.state !== 'ko' && q.pos.x > B.bossTrigger.x)) {
      this.pendingBoss = null;
      this.startBoss(B);
    }
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
    const p2 = this.player2;
    if (p2) { p2.setState('intro'); p2.pos.x = p.pos.x - 1.2; p2.pos.z = p.pos.z + 0.6; p2.yaw = Math.PI / 2; if (p2.anim.currentName !== p2.anim.resolve('walk')) p2.anim.play('walk'); }
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
    // online: no próximo quadro da simulação (igual nos dois computadores); local: fora do quadro atual
    if (this.net) { this.endQueued = { result, stats: this.stats, run: this.run }; return; }
    setTimeout(() => { if (!this.disposed) this.onEnd && this.onEnd({ result, stats: this.stats, run: this.run }); }, 0);
  }

  flushEnd() {
    const e = this.endQueued;
    this.endQueued = null;
    if (e && !this.disposed && this.onEnd) this.onEnd(e);
  }

  // a tentativa abandonada pelo menu de pausa
  quit() {
    this.finish('quit');
  }

  // TELA DIVIDIDA no coop local: P1 em cima, P2 embaixo (pedido do dono), cada um com a câmera dele. A cena do chefe e a saída
  // voltam para a tela cheia (a câmera da cena é uma só).
  render() {
    const w = this.world;
    const r = w.renderer;
    const size = r.getSize(v2);
    if (this.net) this.placeMate();
    if (this.net && this.local === 1 && !(this.bossIntro || this.phase === 'exit' || this.phase === 'over')) {
      const cam = this.views[1].rig.camera;
      const asp = size.x / Math.max(1, size.y);
      if (Math.abs(cam.aspect - asp) > 1e-3) { cam.aspect = asp; cam.updateProjectionMatrix(); }
      r.render(w.scene, cam);
      return;
    }
    const full = !this.coop || this.net || this.bossIntro || this.phase === 'exit' || this.phase === 'over';
    if (full) {
      const asp = size.x / Math.max(1, size.y);
      if (Math.abs(w.camera.aspect - asp) > 1e-3) { w.camera.aspect = asp; w.camera.updateProjectionMatrix(); }
      w.render();
      return;
    }
    const half = Math.floor(size.y / 2);
    r.setScissorTest(true);
    this.views.forEach((V, i) => {
      const cam = V.rig.camera;
      cam.aspect = size.x / Math.max(1, half);
      cam.updateProjectionMatrix();
      const y = i === 0 ? size.y - half : 0; // a origem do WebGL é embaixo: o P1 fica na metade de cima
      r.setViewport(0, y, size.x, half);
      r.setScissor(0, y, size.x, half);
      r.render(w.scene, cam);
    });
    r.setScissorTest(false);
    r.setViewport(0, 0, size.x, size.y);
  }

  // online: o nome do outro jogador flutuando em cima dele, na câmera desta tela (só desenho: não mexe na simulação)
  placeMate() {
    if (!this.pveHud) return;
    const mate = this.local === 1 ? this.player : this.player2;
    const names = this.hud.names || [];
    const name = names[this.local === 1 ? 0 : 1];
    const fullCam = this.bossIntro || this.phase === 'exit' || this.phase === 'over';
    const cam = this.local === 1 && !fullCam ? this.views[1].rig.camera : this.world.camera;
    if (!mate || !name || !mate.visible || this.phase === 'loading') { this.pveHud.setMate(null); return; }
    const s = MATE_V.set(mate.pos.x, mate.pos.y + 2.15, mate.pos.z).project(cam);
    if (s.z > 1 || s.z < -1 || Math.abs(s.x) > 1.1 || Math.abs(s.y) > 1.1) { this.pveHud.setMate(null); return; }
    const k = mate.state === 'ko' ? ' (caído)' : '';
    const el = this.world.renderer.domElement;
    this.pveHud.setMate(name + k, (s.x + 1) / 2 * el.clientWidth, (1 - s.y) / 2 * el.clientHeight, this.local === 1 ? '#ffb24a' : '#7ec8ff');
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
    for (const V of this.views || []) {
      if (V.lockMark) { this.world.scene.remove(V.lockMark); V.lockMark.geometry.dispose(); V.lockMark.material.dispose(); }
      V.prompt.hide();
      for (const m of [V.arrowChest, ...V.arrowDoors]) { this.world.scene.remove(m); m.userData.body.geometry.dispose(); m.userData.body.material.dispose(); m.userData.edge.material.dispose(); }
    }
    this.input.coopLook = false;
    if (this.coop) { this.input.players[1].cpu = null; this.input.players.length = 2; }
    for (const d of this.doors) d.dispose();
    for (const d of this.drawers) d.dispose();
    for (const x of this.bossBoxes || []) x.dispose();
    this.world.groundAt = null;
    if (this.stairBlock) this.world.scene.remove(this.stairBlock);
    if (this.stairBox) { this.world.arena.boxes.push(this.stairBox); this.stairBox = null; }
    for (const g of this.gates) if (g.mesh) { this.world.scene.remove(g.mesh); g.mesh.geometry.dispose(); g.mesh.material.dispose(); }
    this.world.dispose();
    this.pveHud && this.pveHud.dispose();
    this.hud.root.classList.remove('pve', 'pve-noboss', 'pve-minor', 'pve-coop', 'pve-online');
    this.hud.reset();
    this.hud.show(false);
  }
}
