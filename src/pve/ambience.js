// A VIBE DE TERROR da Mansão Endiabrada (pedido do dono, 2026-11-05, com o Doors do Roblox como referência):
//  · EVENTOS ao acaso, de tempos em tempos: batidas na parede, sussurros, passos no andar de cima, rangidos e as luzes
//    falhando com o zumbido da lâmpada (mais raros durante as lutas, para não atrapalhar a leitura);
//  · o CORAÇÃO: bate quando a vida está baixa e quando o Espreitador está escondido nas frestas (ele vai sair);
//  · as FRESTAS que espiam (pedido do dono, 2026-11-05: nada de olhos fixos nas paredes): uma fresta se abre numa
//    parede à frente de quem avança, os olhos amarelos espiam de dentro e acompanham o jogador, e ela fecha e some
//    para abrir em outro lugar — o monstro seguindo o jogador por dentro das paredes.
import * as THREE from 'three';

const v1 = new THREE.Vector3();
const ray = new THREE.Raycaster();
const PEEK = { first: 4, every: [3.5, 7], life: [2.6, 4.2], ahead: [2.5, 7], maxActive: 2, fightSlow: 0.35 };
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
    this.buildPeeks();
  }

  buildPeeks() {
    const ball = new THREE.SphereGeometry(0.06, 14, 10);
    const pupil = new THREE.SphereGeometry(0.024, 8, 6);
    // a fresta: um rasgo escuro e torto na parede (abre na largura)
    const sh = new THREE.Shape();
    const pts = [[0, 0.55], [0.05, 0.3], [0.03, 0.1], [0.07, -0.12], [0.02, -0.3], [0, -0.55], [-0.03, -0.32], [-0.06, -0.08], [-0.02, 0.12], [-0.06, 0.32]];
    sh.moveTo(...pts[0]);
    for (const q of pts.slice(1)) sh.lineTo(...q);
    sh.closePath();
    const slit = new THREE.ShapeGeometry(sh);
    const yellow = new THREE.MeshBasicMaterial({ color: 0xf2c230, toneMapped: false });
    const black = new THREE.MeshBasicMaterial({ color: 0x050403 });
    const dark = new THREE.MeshBasicMaterial({ color: 0x010101, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    // a borda da fresta: um brilho amarelado fraco (no papel de parede escuro, o rasgo preto sozinho sumia)
    const rim = new THREE.MeshBasicMaterial({ color: 0x5a4210, transparent: true, opacity: 0.55, side: THREE.DoubleSide, toneMapped: false, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
    this.mats = [yellow, black, dark, rim];
    this.geos = [ball, pupil, slit];
    this.group = new THREE.Group();
    this.w.scene.add(this.group);
    this.peeks = [];
    this.peekT = PEEK.first;
    this.mk = () => {
      const g = new THREE.Group();
      const crack = new THREE.Group();
      const edge = new THREE.Mesh(slit, rim);
      edge.scale.set(1.6, 1.12, 1);
      edge.position.z = -0.002;
      crack.add(edge, new THREE.Mesh(slit, dark));
      g.add(crack);
      const eyes = [];
      const n = Math.random() < 0.4 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        const look = new THREE.Group();
        look.position.set(0, (n > 1 ? (k ? -0.14 : 0.12) : 0.05) + (Math.random() - 0.5) * 0.08, -0.03);
        look.add(new THREE.Mesh(ball, yellow));
        const np = Math.random() < 0.35 ? 2 : 1; // as pupilas que se multiplicam
        for (let q = 0; q < np; q++) {
          const pu = new THREE.Mesh(pupil, black);
          pu.scale.z = 0.4;
          pu.position.set(np > 1 ? (q - 0.5) * 0.035 : 0, 0, 0.052);
          look.add(pu);
        }
        g.add(look);
        eyes.push(look);
      }
      return { g, crack, eyes, open: 0, t: 0, life: 0 };
    };
  }

  // um ponto de parede à frente do jogador (raio horizontal contra o cenário, de um ponto à frente para o lado)
  findWall() {
    const d = this.d;
    const p = d.player;
    const arena = this.w.arena;
    if (!arena || !arena.group) return null;
    const sp = Math.hypot(p.vel.x, p.vel.z);
    // à frente: para onde anda (ou para onde a câmera olha)
    let fx = 1;
    let fz = 0;
    if (sp > 0.5) { fx = p.vel.x / sp; fz = p.vel.z / sp; } else { const y = this.w.cameraRig.yaw; fx = -Math.sin(y); fz = -Math.cos(y); }
    for (let tries = 0; tries < 6; tries++) {
      const ahead = PEEK.ahead[0] + Math.random() * (PEEK.ahead[1] - PEEK.ahead[0]);
      const ox = p.pos.x + fx * ahead;
      const oz = p.pos.z + fz * ahead;
      if (arena.bounds && !arena.bounds.rects.some((r) => ox > r.minX && ox < r.maxX && oz > r.minZ && oz < r.maxZ)) continue;
      const y = 0.9 + Math.random() * 1.1;
      // de lado (perpendicular ao avanço), para uma das paredes
      const s = Math.random() < 0.5 ? 1 : -1;
      const dir = v1.set(-fz * s, 0, fx * s).normalize();
      ray.set(new THREE.Vector3(ox, y, oz), dir);
      ray.far = 9;
      const hit = ray.intersectObject(arena.group, true).find((h) => h.face && h.object.visible);
      if (!hit || hit.distance < 0.6) continue;
      const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      if (Math.abs(n.y) > 0.3) continue; // chão/teto
      if (this.peeks.some((q) => q.g.position.distanceTo(hit.point) < 1.5)) continue;
      return { point: hit.point.clone().addScaledVector(n, 0.015), normal: n.setY(0).normalize() };
    }
    return null;
  }

  updatePeeks(dt) {
    const d = this.d;
    const p = d.player;
    const fighting = d.encounter && !d.encounter.done;
    const quiet = d.bossIntro || d.phase === 'exit' || d.phase === 'dead' || (d.encounter && d.encounter.boss && !d.encounter.done);
    this.peekT -= dt * (fighting ? PEEK.fightSlow : 1);
    if (!quiet && this.peekT <= 0 && this.peeks.length < PEEK.maxActive) {
      this.peekT = PEEK.every[0] + Math.random() * (PEEK.every[1] - PEEK.every[0]);
      const at = this.findWall();
      if (at) {
        const k = this.mk();
        k.g.position.copy(at.point);
        k.g.lookAt(v1.copy(at.point).add(at.normal)); // a face (+z local) sai da parede
        k.g.scale.setScalar(0.9 + Math.random() * 0.5);
        k.life = PEEK.life[0] + Math.random() * (PEEK.life[1] - PEEK.life[0]);
        this.group.add(k.g);
        this.peeks.push(k);
        this.w.audio.play('creak', { volume: 0.25, pitch: 1.3 + Math.random() * 0.3 });
        if (Math.random() < 0.6) this.w.audio.play('whisper', { volume: 0.3, pitch: 0.8 + Math.random() * 0.4 });
      }
    }
    const t = this.w.time;
    for (const k of this.peeks) {
      k.t += dt;
      // abre, espia, e fecha mais rápido se o jogador chegar muito perto (ele se esconde)
      const close = k.t > k.life || k.g.position.distanceTo(v1.set(p.pos.x, k.g.position.y, p.pos.z)) < 1.1 || quiet;
      if (close && !k.closing) k.closing = true;
      k.open += ((k.closing ? 0 : 1) - k.open) * Math.min(1, dt * (k.closing ? 7 : 3));
      k.crack.scale.set(0.2 + k.open * 1.3, 0.6 + k.open * 0.4, 1);
      const blink = Math.sin(t * 1.7 + k.life * 9) > 0.96 ? 0.15 : 1;
      for (const e of k.eyes) {
        e.scale.set(k.open, k.open * blink, k.open);
        e.lookAt(v1.set(p.pos.x, p.pos.y + 1.4, p.pos.z));
      }
    }
    for (const k of this.peeks.filter((q) => q.closing && q.open < 0.03)) this.group.remove(k.g);
    this.peeks = this.peeks.filter((q) => !(q.closing && q.open < 0.03));
  }

  update(dt) {
    const d = this.d;
    const w = this.w;
    const p = d.player;
    const t = w.time;
    // ---- as frestas que espiam
    this.updatePeeks(dt);
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
