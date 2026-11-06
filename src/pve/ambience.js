// A VIBE DE TERROR da Mansão Endiabrada (pedido do dono, 2026-11-05, com o Doors do Roblox como referência):
//  · EVENTOS ao acaso, de tempos em tempos: batidas na parede, sussurros, passos no andar de cima, rangidos e as luzes
//    falhando com o zumbido da lâmpada (mais raros durante as lutas, para não atrapalhar a leitura);
//  · o CORAÇÃO: bate quando a vida está baixa e quando o Espreitador está escondido nas frestas (ele vai sair);
//  · os OLHOS NAS PAREDES dos corredores (como o Seek do Doors, e fiel ao cânone: ele observa de todo canto): abrem
//    quando o jogador chega perto, as pupilas acompanham, e fecham quando ele passa.
import * as THREE from 'three';

const v1 = new THREE.Vector3();
// os corredores: x de/até, a parede de cada lado (|z|) e quantos olhos
const CORRIDORS = [
  { minX: -11.2, maxX: -4.8, wall: 1.56, n: 6 },
  { minX: 4.8, maxX: 17.2, wall: 1.76, n: 12 },
  { minX: 28.8, maxX: 39.2, wall: 1.76, n: 10 },
];
const EVENTS = [
  ['knock', 3], ['whisper', 2.5], ['steps', 2], ['creak', 2], ['flicker', 3],
];

export class MansionAmbience {
  constructor(dungeon) {
    this.d = dungeon;
    this.w = dungeon.world;
    this.next = 6 + Math.random() * 5;
    this.beat = 0;
    this.flickerT = 0;
    this.buildEyes();
  }

  buildEyes() {
    const ball = new THREE.SphereGeometry(0.12, 16, 12);
    const pupil = new THREE.SphereGeometry(0.045, 10, 8);
    const lid = new THREE.SphereGeometry(0.14, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const yellow = new THREE.MeshBasicMaterial({ color: 0xf2c230, toneMapped: false });
    const black = new THREE.MeshBasicMaterial({ color: 0x050403 });
    const skin = new THREE.MeshToonMaterial({ color: 0x5a5650 });
    this.mats = [yellow, black, skin];
    this.geos = [ball, pupil, lid];
    this.group = new THREE.Group();
    this.eyes = [];
    for (const c of CORRIDORS) {
      for (let i = 0; i < c.n; i++) {
        const side = Math.random() < 0.5 ? 1 : -1;
        const e = new THREE.Group();
        const s = 0.7 + Math.random() * 0.9;
        e.scale.setScalar(s);
        e.position.set(c.minX + Math.random() * (c.maxX - c.minX), 0.7 + Math.random() * 1.7, side * c.wall);
        e.rotation.y = side > 0 ? Math.PI : 0; // olhando para dentro do corredor (+z local)
        // o globo gira inteiro para olhar o jogador (de perfil o olho sumia na parede)
        const look = new THREE.Group();
        const b = new THREE.Mesh(ball, yellow);
        look.add(b);
        const pupils = [];
        const np = Math.random() < 0.3 ? 2 : 1; // as pupilas que se multiplicam
        for (let k = 0; k < np; k++) {
          const pu = new THREE.Mesh(pupil, black);
          pu.scale.z = 0.4;
          pu.position.set(np > 1 ? (k - 0.5) * 0.06 : 0, 0, 0.105);
          look.add(pu);
          pupils.push(pu);
        }
        // as pálpebras (pele cinza): fecham por cima e por baixo
        const top = new THREE.Mesh(lid, skin);
        const bot = new THREE.Mesh(lid, skin);
        bot.rotation.x = Math.PI;
        e.add(look, top, bot);
        e.visible = false;
        this.group.add(e);
        this.eyes.push({ g: e, look, top, bot, open: 0, seed: Math.random() * 10 });
      }
    }
    this.w.scene.add(this.group);
  }

  update(dt) {
    const d = this.d;
    const w = this.w;
    const p = d.player;
    const t = w.time;
    // ---- os olhos nas paredes
    for (const e of this.eyes) {
      const dx = p.pos.x - e.g.position.x;
      const near = Math.abs(dx) < 3.6 && d.phase !== 'exit';
      const want = near ? 1 : 0;
      if (want && !e.open && Math.random() < 0.3) w.audio.play('whisper', { volume: 0.25, pitch: 0.8 + Math.random() * 0.4 });
      e.open += (want - e.open) * Math.min(1, dt * (near ? 5 : 2.5));
      e.g.visible = e.open > 0.02;
      if (!e.g.visible) continue;
      // pálpebras abrindo (piscam de vez em quando)
      const blink = Math.sin(t * 1.3 + e.seed * 5) > 0.97 ? 0.1 : 1;
      const k = e.open * blink;
      e.top.rotation.x = -0.15 - k * 1.25;
      e.bot.rotation.x = Math.PI + 0.15 + k * 1.25;
      // o olho acompanha o jogador
      e.look.lookAt(v1.set(p.pos.x, p.pos.y + 1.3, p.pos.z));
    }
    // ---- o coração: vida baixa, ou ele escondido nas frestas
    const low = p.health / p.maxHealth < 0.3 && p.state !== 'ko';
    const hidden = d.brain && d.brain.state === 'hidden';
    if (low || hidden) {
      this.beat -= dt;
      if (this.beat <= 0) { this.beat = low ? 0.75 : 1.0; w.audio.play('heartbeat', { volume: low ? 0.9 : 0.6 }); }
    }
    // ---- a luz falhando
    if (this.flickerT > 0) {
      this.flickerT -= dt;
      w.arena.dim = this.flickerT <= 0 ? 1 : Math.sin(t * 47) * Math.sin(t * 13) > 0.2 ? 0.08 : 0.7;
    }
    // ---- os eventos ao acaso
    if (d.bossIntro || d.phase === 'exit' || d.phase === 'dead') return;
    const fighting = d.encounter && !d.encounter.done;
    this.next -= dt * (fighting ? 0.4 : 1);
    if (this.next > 0) return;
    this.next = 7 + Math.random() * 9;
    let r = Math.random() * EVENTS.reduce((s, x) => s + x[1], 0);
    let ev = EVENTS[0][0];
    for (const [k, wgt] of EVENTS) { r -= wgt; if (r <= 0) { ev = k; break; } }
    if (ev === 'flicker') {
      this.flickerT = 0.5 + Math.random() * 0.8;
      w.audio.play('buzz', { volume: 0.8 });
    } else if (ev === 'knock') w.audio.play('knock', { volume: 0.35 + Math.random() * 0.3, pitch: 0.8 + Math.random() * 0.3, count: 2 + Math.floor(Math.random() * 3) });
    else if (ev === 'steps') w.audio.play('steps', { volume: 0.5, count: 3 + Math.floor(Math.random() * 4) });
    else if (ev === 'whisper') w.audio.play('whisper', { volume: 0.6, pitch: 0.7 + Math.random() * 0.5 });
    else w.audio.play('creak', { volume: 0.5, pitch: 0.5 + Math.random() * 0.4 });
  }

  dispose() {
    this.w.scene.remove(this.group);
    for (const g of this.geos) g.dispose();
    for (const m of this.mats) m.dispose();
    if (this.w.arena) this.w.arena.dim = 1;
  }
}
