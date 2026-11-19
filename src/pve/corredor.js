// O CORREDOR DAS LAMPARINAS — a PARTE 2 da noite do Samhain em Treb Ciach (pedido do dono, 2026-11-18): depois da
// tempestade, "o player fugindo por um caminho/corredor com lanternas com chama da proteção em volta assim como no ep 3
// e ele terá que correr por esse caminho até chegar na arvore, o player terá que aguentar durante um tempo nesse
// corredor evitando ser acertado por essas assombrações que dão bastante dano por sinal" — "como um temple run, ou
// subway surfers". Dono (2026-11-19): "quanto mais lamparinas o player acender na parte do corredor, mais fraco vai
// ficar a parte da arvore"; e, vendo a 1ª versão: sem baús; o caminho SAI da vila (não é outro lugar); mais claro; pedras
// no chão para desviar; o chão numa subida leve; "muito mais assombrações dos lados, cheio de assombrações, mas nao quer
// dizer que todas vão atacar".
// Como funciona: o caminho sai da praça pela abertura entre as casas a NOROESTE (a Árvore Anciã fica ao norte) e sobe
// devagar. O personagem CORRE SOZINHO (Fighter.runDir) e o jogador só desvia de lado (a esquiva passa por tudo).
//  - os BOTES: a faixa vermelha no chão onde o jogador vai estar; a Assombração vem da beirada ou cai do alto (dano alto);
//  - as PEDRAS no caminho: tropeçar machuca pouco e trava um instante;
//  - as LAMPARINAS apagadas nas beiradas: passar rente acende (o total vai para a Árvore, a parte 3);
//  - a MULTIDÃO de Assombrações dos dois lados só olha, balança e estica os braços (quem ataca é o bote).
// Tudo é montado num grupo com a frente em -z local (u = de lado, v = para a frente): o grupo é girado para a direção
// do caminho. Cenário procedural provisório (PROPOSTA: refazer no Blender MCP com as lamparinas do ep. 3).
// PROPOSTA: todos os números.
import * as THREE from 'three';
import { buildAssombracao } from '../models/assombracao.js';
import { applyHit } from '../combat/damage.js';

export const RUN = {
  time: { easy: 35, normal: 45, hard: 55, superhard: 62, annihilation: 70 }, // segundos até a árvore
  every: { easy: [2.0, 3.0], normal: [1.6, 2.6], hard: [1.3, 2.2], superhard: [1.1, 1.9], annihilation: [0.9, 1.6] }, // entre os botes
  damage: { easy: 0.1, normal: 0.14, hard: 0.17, superhard: 0.2, annihilation: 0.24 }, // fração da vida por bote
  rockDamage: 0.04,
  half: 3.2, // meia largura do caminho
  warn: 1.15, // segundos de aviso antes de o jogador chegar na faixa
  lampGap: 5.5, // uma lamparina a cada 5,5 m, alternando os lados
  lampReach: 1.45,
  rockGap: [9, 15],
  angle: 3.8, // a direção do caminho (a abertura entre as casas do mapa, a noroeste)
  start: 19, // onde o caminho começa (a borda da praça)
  slope: 0.035, // a subida
  length: 640,
  crowd: 18, // Assombrações nas beiradas ao mesmo tempo (recicladas para a frente)
  countdown: 2.6,
};

const RED = 0xff3a2a;
const h = (v) => (v <= 0 ? 0 : v < 12 ? RUN.slope * v * v / 24 : RUN.slope * (v - 6)); // a altura do chão (começa suave)
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export class LanternRun {
  constructor(d) {
    this.d = d;
    const w = d.world;
    this.w = w;
    const diff = (d.run && d.run.difficulty) || 'normal';
    this.time = RUN.time[diff] ?? RUN.time.normal;
    this.every = RUN.every[diff] || RUN.every.normal;
    this.dmg = RUN.damage[diff] ?? RUN.damage.normal;
    this.t = 0;
    this.started = false;
    this.done = false;
    this.lit = 0;
    this.next = 1.6;
    this.hazards = [];
    this.pool = [];
    // a frente do caminho (D), a direita (R) e a origem (O, na borda da praça)
    this.D = new THREE.Vector3(Math.sin(RUN.angle), 0, Math.cos(RUN.angle));
    this.R = new THREE.Vector3(-this.D.z, 0, this.D.x);
    this.O = this.D.clone().multiplyScalar(RUN.start);
    this.yaw = Math.atan2(-this.D.x, -this.D.z); // a câmera atrás, olhando o caminho
    // sem baús no corredor (dono): os que sobraram da praça somem
    for (const k of d.pickups) if (k.constructor && k.constructor.name === 'Chest' && k.dispose) k.dispose();
    d.pickups = d.pickups.filter((k) => k.alive !== false);
    // o mapa continua (a vila fica lá atrás); só o que está EM CIMA do caminho some, e a luta deixa de ser presa à praça
    const a = w.arena;
    this.saved = { radius: a.radius, colliders: a.colliders, boxes: a.boxes, clamp: a.clampCamera, ground: w.groundAt };
    a.radius = 5000;
    a.colliders = a.colliders.filter((c) => !this.onPath(c.x, c.z, c.r + 1));
    a.boxes = [];
    a.clampCamera = (p) => { p.y = Math.max(p.y, this.heightAt(p) + 0.6); };
    // o cenário de Treb Ciach vem FUNDIDO por material (todas as árvores numa malha só): separa as peças soltas
    // (componentes ligados pelos vértices) e tira só as que ficam EM CIMA do caminho — árvores, cercas, tufos (dono:
    // "só nao devia ter arvores no caminho em si, só dos lados. No maximo pedras"). O terreno fica; tudo volta no fim.
    this.cut = [];
    if (a.group) { a.group.updateMatrixWorld(true); a.group.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.index && !/^GROUND_|^DECAL_/.test(o.name)) this.clearPath(o); }); }
    const prevGround = w.groundAt;
    w.groundAt = (f) => (d.players.includes(f) ? this.heightAt(f.pos) : prevGround ? prevGround(f) : 0);
    // mais luz no caminho (a tempestade escurece a praça): o céu e uma luz quente que anda com quem corre
    this.hemi = new THREE.HemisphereLight(0x8fa6c8, 0x3a2c1e, 0.85);
    this.lamp = new THREE.PointLight(0xffc070, 2.2, 16, 1.6);
    w.scene.add(this.hemi, this.lamp);
    this.build();
  }

  clearPath(o) {
    const geo = o.geometry;
    const pos = geo.attributes.position;
    const idx = geo.index.array;
    const n = pos.count;
    // união-busca: cada peça solta é um componente
    const par = new Int32Array(n);
    for (let i = 0; i < n; i++) par[i] = i;
    const find = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
    for (let t = 0; t < idx.length; t += 3) {
      const a0 = find(idx[t]), b0 = find(idx[t + 1]), c0 = find(idx[t + 2]);
      if (a0 !== b0) par[b0] = a0;
      const a1 = find(a0);
      if (a1 !== c0) par[c0] = a1;
    }
    // a caixa de cada peça em (u, v) do caminho
    const box = new Map();
    const v3 = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      v3.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      const { u, v } = this.uv(v3.x, v3.z);
      const r = find(i);
      let b = box.get(r);
      if (!b) box.set(r, (b = [u, u, v, v]));
      else { if (u < b[0]) b[0] = u; if (u > b[1]) b[1] = u; if (v < b[2]) b[2] = v; if (v > b[3]) b[3] = v; }
    }
    const drop = new Set();
    const W = RUN.half + 0.8;
    for (const [r, b] of box) {
      const big = b[1] - b[0] > 16 || b[3] - b[2] > 16; // terreno, morros: ficam
      if (!big && b[1] > -W && b[0] < W && b[3] > -1 && b[2] < RUN.length) drop.add(r);
    }
    if (!drop.size) return;
    const keep = [];
    for (let t = 0; t < idx.length; t += 3) if (!drop.has(find(idx[t]))) keep.push(idx[t], idx[t + 1], idx[t + 2]);
    this.cut.push({ geo, index: geo.index });
    geo.setIndex(keep);
  }

  // u (de lado) e v (para a frente) de um ponto do mundo
  uv(x, z) { const dx = x - this.O.x, dz = z - this.O.z; return { u: dx * this.R.x + dz * this.R.z, v: dx * this.D.x + dz * this.D.z }; }
  onPath(x, z, r) { const { u, v } = this.uv(x, z); return v > -r && v < RUN.length && Math.abs(u) < RUN.half + 2.5 + r; }
  heightAt(p) { return h(this.uv(p.x, p.z).v); }
  local(p) { return this.uv(p.x, p.z); }

  build() {
    const g = new THREE.Group();
    g.name = 'corredor';
    g.position.copy(this.O);
    g.rotation.y = this.yaw; // a frente local (-z) vira D
    const L = RUN.length;
    const strip = (width, color, y, seg) => {
      const geo = new THREE.PlaneGeometry(width, L + 20, 1, seg);
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, 0, -(L + 20) / 2 + 10);
      const P = geo.attributes.position;
      for (let i = 0; i < P.count; i++) P.setY(i, h(-P.getZ(i)) + y);
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
      m.receiveShadow = true;
      g.add(m);
      return m;
    };
    strip(RUN.half * 2 + 0.9, 0x5a4634, 0.03, 160); // a terra batida do caminho
    strip(70, 0x2c3a26, 0.0, 160); // o capim dos lados
    // as pedras do caminho (obstáculos) e os detalhes do chão (pedrinhas, tufos)
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    this.rocks = [];
    for (let v = 26; v < L - 10; v += RUN.rockGap[0] + rnd(v) * (RUN.rockGap[1] - RUN.rockGap[0])) {
      const r = 0.32 + rnd(v * 3) * 0.24;
      this.rocks.push({ u: (rnd(v * 7) * 2 - 1) * (RUN.half - 0.8), v, r, hit: false });
    }
    const rocks = new THREE.InstancedMesh(rockGeo, new THREE.MeshLambertMaterial({ color: 0x77706a }), this.rocks.length);
    const pebbles = new THREE.InstancedMesh(rockGeo, new THREE.MeshLambertMaterial({ color: 0x6a6058 }), 900);
    const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.18, 0.5, 4), new THREE.MeshLambertMaterial({ color: 0x4a5a30 }), 900);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const put = (im, i, x, v, y, sc, rot = 0) => { e.set(rot * 0.7, rot * 3.1, rot * 0.4); q.setFromEuler(e); M.compose(p.set(x, h(v) + y, -v), q, s.set(sc, sc * 0.7, sc)); im.setMatrixAt(i, M); };
    this.rocks.forEach((k, i) => put(rocks, i, k.u, k.v, k.r * 0.45, k.r, rnd(i + 0.5)));
    for (let i = 0; i < 900; i++) {
      const v = -4 + rnd(i * 1.3) * (L - 4);
      put(pebbles, i, (rnd(i * 2.1) * 2 - 1) * (RUN.half + 0.3), v, 0.03, 0.06 + rnd(i * 5.7) * 0.08, rnd(i * 9.1));
      const side = rnd(i * 4.4) < 0.5 ? -1 : 1;
      put(tufts, i, side * (RUN.half + 0.4 + rnd(i * 6.3) * 4), -4 + rnd(i * 7.7) * (L - 4), 0.2, 0.7 + rnd(i * 8.8) * 0.6);
    }
    rocks.castShadow = true;
    g.add(rocks, pebbles, tufts);
    // as árvores dos dois lados (troncos e copas instanciados)
    const trees = [];
    for (let v = 2; v < L; v += 2.6) for (const sd of [-1, 1]) {
      if (rnd(v * 11 + sd) < 0.25) continue;
      trees.push({ u: sd * (RUN.half + 7 + rnd(v * 3 + sd) * 14), v: v + rnd(v + sd) * 2, k: 5 + rnd(v * 5 + sd) * 5 });
    }
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.22, 1, 6), new THREE.MeshLambertMaterial({ color: 0x3a2a1e }), trees.length);
    const crowns = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7), new THREE.MeshLambertMaterial({ color: 0x1e3022 }), trees.length);
    trees.forEach((t, i) => {
      M.compose(p.set(t.u, h(t.v) + t.k * 0.17, -t.v), q.identity(), s.set(1, t.k * 0.35, 1)); trunks.setMatrixAt(i, M);
      M.compose(p.set(t.u, h(t.v) + t.k * 0.6, -t.v), q.identity(), s.set(t.k * 0.28, t.k * 0.8, t.k * 0.28)); crowns.setMatrixAt(i, M);
    });
    g.add(trunks, crowns);
    // MAIS DETALHES NO CAMINHO (dono, 2026-11-19: "Melhore o mapa por completo com mais detalhes … as 3 partes"; PROPOSTA):
    // os sulcos das carroças na terra, a cerca de estacas torta das duas beiradas (com falhas), as flores do campo, os
    // nabos entalhados do Samhain acesos na beira e os montes de pedra (marcos) mais para dentro do mato
    for (const ux of [-0.75, 0.75]) {
      const geo = new THREE.PlaneGeometry(0.32, L + 20, 1, 160);
      geo.rotateX(-Math.PI / 2);
      geo.translate(ux, 0, -(L + 20) / 2 + 10);
      const P = geo.attributes.position;
      for (let i = 0; i < P.count; i++) P.setY(i, h(-P.getZ(i)) + 0.045);
      g.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x46372a })));
    }
    const fence = [];
    for (const sd of [-1, 1]) for (let v = 0; v < L; v += 1.5) if (rnd(v * 2.3 + sd * 7) > 0.18) fence.push({ u: sd * (RUN.half + 1.5 + rnd(v + sd) * 0.25), v, tilt: (rnd(v * 4.1 + sd) - 0.5) * 0.25 });
    const stakes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1, 0.1), new THREE.MeshLambertMaterial({ color: 0x5a4430 }), fence.length);
    const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.07, 1.55), new THREE.MeshLambertMaterial({ color: 0x6a5038 }), fence.length * 2);
    fence.forEach((f, i) => {
      e.set(f.tilt, 0, f.tilt * 0.6); q.setFromEuler(e);
      M.compose(p.set(f.u, h(f.v) + 0.5, -f.v), q, s.set(1, 1.0 + rnd(i * 3.3) * 0.2, 1)); stakes.setMatrixAt(i, M);
      for (const [k, y] of [[0, 0.42], [1, 0.82]]) {
        e.set(rnd(i * 1.9 + k) * 0.12 - 0.06, 0, 0); q.setFromEuler(e);
        M.compose(p.set(f.u, h(f.v + 0.75) + y, -(f.v + 0.75)), q, s.set(1, 1, rnd(i * 5 + k) < 0.12 ? 0.001 : 1)); rails.setMatrixAt(i * 2 + k, M);
      }
    });
    const flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 5, 3), new THREE.MeshLambertMaterial({ color: 0xffffff }), 1400);
    for (let i = 0; i < 1400; i++) {
      const sd = rnd(i * 3.7) < 0.5 ? -1 : 1;
      const v = -4 + rnd(i * 1.7) * (L - 4);
      M.compose(p.set(sd * (RUN.half + 0.6 + rnd(i * 2.9) * 9), h(v) + 0.14, -v), q.identity(), s.set(1, 0.6, 1)); flowers.setMatrixAt(i, M);
      flowers.setColorAt(i, new THREE.Color(rnd(i * 6.1) < 0.7 ? 0xf4f0e6 : 0xf2c230));
    }
    const turnips = [];
    for (let v = 14; v < L - 6; v += 9 + rnd(v) * 6) turnips.push({ u: (rnd(v * 5.5) < 0.5 ? -1 : 1) * (RUN.half + 0.9), v });
    const nabo = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshLambertMaterial({ color: 0xd8c8a0, emissive: 0x3a1a04 }), turnips.length);
    const naboFace = new THREE.InstancedMesh(new THREE.CircleGeometry(0.11, 3), new THREE.MeshBasicMaterial({ color: 0xff9a2a }), turnips.length);
    turnips.forEach((t, i) => {
      M.compose(p.set(t.u, h(t.v) + 0.18, -t.v), q.identity(), s.set(1, 0.9, 1)); nabo.setMatrixAt(i, M);
      // a cara entalhada virada para o caminho
      e.set(0, t.u < 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI); q.setFromEuler(e);
      M.compose(p.set(t.u - Math.sign(t.u) * 0.2, h(t.v) + 0.2, -t.v), q, s.set(1, 1, 1)); naboFace.setMatrixAt(i, M);
    });
    const cairns = new THREE.InstancedMesh(rockGeo, new THREE.MeshLambertMaterial({ color: 0x6c6862 }), 60);
    for (let i = 0; i < 20; i++) {
      const sd = rnd(i * 8.8) < 0.5 ? -1 : 1;
      const v = 10 + rnd(i * 3.1) * (L - 20);
      const u = sd * (RUN.half + 4 + rnd(i * 4.7) * 5);
      for (let k = 0; k < 3; k++) { M.compose(p.set(u + (k === 1 ? 0.1 : 0), h(v) + 0.25 + k * 0.38, -v), q.identity(), s.set(0.42 - k * 0.1, 0.28, 0.42 - k * 0.1)); cairns.setMatrixAt(i * 3 + k, M); }
    }
    stakes.castShadow = true;
    g.add(stakes, rails, flowers, nabo, naboFace, cairns);
    // as lamparinas: postes, gaiolas e brasas instanciados; a chama acesa é criada quando alguém acende
    this.lamps = [];
    for (let i = 0, v = 6; v < L; i++, v += RUN.lampGap) this.lamps.push({ u: (i % 2 ? 1 : -1) * (RUN.half + 0.35), v, lit: false, i });
    const n = this.lamps.length;
    this.posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.07, 1.7, 6), new THREE.MeshLambertMaterial({ color: 0x4a3626 }), n);
    this.cages = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, 0.32, 0.26), new THREE.MeshLambertMaterial({ color: 0x2a2018 }), n);
    this.embers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8a3a12 }), n);
    for (const l of this.lamps) {
      const y = h(l.v);
      M.compose(p.set(l.u, y + 0.85, -l.v), q.identity(), s.set(1, 1, 1)); this.posts.setMatrixAt(l.i, M);
      M.compose(p.set(l.u, y + 1.85, -l.v), q.identity(), s.set(1, 1, 1)); this.cages.setMatrixAt(l.i, M);
      this.embers.setMatrixAt(l.i, M);
    }
    // o telhadinho de ferro em cima de cada gaiola e o braço que a segura
    const caps = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 0.16, 4), new THREE.MeshLambertMaterial({ color: 0x1e1814 }), n);
    for (const l of this.lamps) {
      e.set(0, Math.PI / 4, 0); q.setFromEuler(e);
      M.compose(p.set(l.u, h(l.v) + 2.09, -l.v), q, s.set(1, 1, 1)); caps.setMatrixAt(l.i, M);
    }
    g.add(this.posts, this.cages, this.embers, caps);
    this.flameGeo = new THREE.SphereGeometry(0.15, 10, 8);
    this.haloGeo = new THREE.SphereGeometry(0.55, 12, 8);
    this.flameMat = new THREE.MeshBasicMaterial({ color: 0xffd84a });
    this.haloMat = new THREE.MeshBasicMaterial({ color: 0xffc040, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false });
    this.halos = [];
    this.w.scene.add(g);
    this.group = g;
    // a MULTIDÃO dos lados (recicladas para a frente conforme se corre)
    this.crowd = [];
    for (let i = 0; i < RUN.crowd; i++) {
      const m = buildAssombracao();
      g.add(m.root);
      const c = { m, seed: i * 1.93, side: i % 2 ? 1 : -1, u: 0, v: 0, reach: rnd(i * 3.3) < 0.4 };
      this.placeCrowd(c, 2 + i * 2.2);
      this.crowd.push(c);
    }
  }

  placeCrowd(c, v) {
    c.v = v;
    c.u = c.side * (RUN.half + 1.4 + rnd(v * 2.7 + c.seed) * 4.5);
    c.m.root.position.set(c.u, h(v) + 0.06, -v);
    c.m.root.rotation.y = c.side > 0 ? -Math.PI / 2 + 0.4 : Math.PI / 2 - 0.4; // de frente para o caminho, um pouco para quem vem
    c.m.root.scale.setScalar(0.96 + rnd(v + c.seed) * 0.09); // do tamanho de gente (dono)
  }

  start() {
    const d = this.d;
    for (const [i, p] of d.players.entries()) {
      p.pos.copy(this.O).addScaledVector(this.D, -3).addScaledVector(this.R, i ? 1.2 : 0);
      p.vel.set(0, 0, 0);
      p.yaw = Math.atan2(this.D.x, this.D.z);
      p.setState('intro');
      p.anim && p.anim.play('idle', { restart: true });
    }
    // a cena curta: a câmera na frente, olhando quem foge com a vila atrás
    const cam = this.w.cameraRig;
    const p = d.player;
    cam.playShots([{
      dur: RUN.countdown + 1,
      fov: 55,
      pos: (k) => new THREE.Vector3().copy(p.pos).addScaledVector(this.D, 7.5 - k * 2).addScaledVector(this.R, 2).setY(3.2 - k * 0.8),
      look: () => new THREE.Vector3(p.pos.x, 1.2, p.pos.z).addScaledVector(this.D, -4),
    }]);
    d.hud.callout('CORRA PARA A ÁRVORE ANCIÃ!', '#ffd84a');
    d.pveHud.hint(`Desvie das faixas vermelhas e das pedras (${typeof document !== 'undefined' && document.body.classList.contains('touch-ui') ? 'joystick para os lados, ESQ' : '←/→, esquiva'}) · passe rente às lamparinas para acendê-las: cada uma acesa enfraquece um pouco a Árvore`);
    d.hintT = 7;
    d.audio.play('fearGaze', { volume: 0.9, pitch: 0.5 });
  }

  label() {
    const left = Math.max(0, Math.ceil(this.time - this.t));
    return `Corra até a Árvore Anciã: ${left} s · Lamparinas ${this.lit}`;
  }

  update(dt) {
    const d = this.d;
    if (this.done) return;
    this.t += dt;
    const live = d.players.filter((p) => p.state !== 'ko');
    const p = live[0] || d.player;
    const P = this.local(p.pos);
    this.lamp.position.copy(p.pos).addScaledVector(this.D, 2.5).setY(p.pos.y + 3);
    this.updateCrowd(P);
    if (!this.started) {
      if (this.t >= RUN.countdown) {
        this.started = true;
        this.t = 0;
        this.w.cameraRig.stopShots();
        for (const q of d.players) { if (q.state === 'intro') q.setState('idle'); q.runDir = this.D.clone(); }
        d.hud.callout('CORRA!', '#ffd84a');
      }
      return;
    }
    // presos ao caminho: de lado não passam da beirada
    for (const q of d.players) {
      const Q = this.local(q.pos);
      const lim = RUN.half - 0.45;
      if (Math.abs(Q.u) > lim) q.pos.addScaledVector(this.R, Math.sign(Q.u) * lim - Q.u);
    }
    // as lamparinas: passar rente acende
    for (const l of this.lamps) {
      if (l.lit || Math.abs(l.v - P.v) > 3) continue;
      for (const q of live) {
        const Q = this.local(q.pos);
        if (Math.abs(Q.v - l.v) < 1.1 && Math.abs(Q.u - l.u) < RUN.lampReach) { this.light(l); break; }
      }
    }
    for (const [i, o] of this.halos.entries()) o.scale.setScalar(0.85 + Math.sin(this.t * 11 + i) * 0.08);
    // as pedras: tropeçar
    for (const k of this.rocks) {
      if (k.hit || Math.abs(k.v - P.v) > 2) continue;
      for (const q of live) {
        const Q = this.local(q.pos);
        if (Math.abs(Q.v - k.v) < k.r + 0.15 && Math.abs(Q.u - k.u) < k.r + 0.3) {
          k.hit = true;
          applyHit(this.w, d.enemy, q, { damage: Math.round(q.maxHealth * RUN.rockDamage), kind: 'ability', knockback: 0.4, hitstun: 0.4, dir: this.D.clone().negate(), sound: 'punch', color: 0xc8b8a0, scale: 0.7 });
          d.hud.callout('TROPEÇOU', '#ffb84a');
        }
      }
    }
    // os botes: o aviso no chão onde o jogador vai estar daqui a `warn` segundos
    this.next -= dt;
    if (this.next <= 0 && this.t < this.time - 1.5) {
      this.next = this.every[0] + Math.random() * (this.every[1] - this.every[0]);
      this.spawnHazard(p, P);
    }
    for (const hz of this.hazards) this.updateHazard(hz, dt, live, P);
    this.hazards = this.hazards.filter((hz) => !hz.gone);
    const lab = this.label();
    if (lab !== this.shown) { this.shown = lab; d.pveHud.setObjective(lab); }
    if (this.t >= this.time) this.finish();
  }

  light(l) {
    l.lit = true;
    this.lit++;
    this.embers.setMatrixAt(l.i, new THREE.Matrix4().makeScale(0, 0, 0));
    this.embers.instanceMatrix.needsUpdate = true;
    const f = new THREE.Mesh(this.flameGeo, this.flameMat);
    f.position.set(l.u, h(l.v) + 1.88, -l.v);
    const o = new THREE.Mesh(this.haloGeo, this.haloMat);
    o.position.copy(f.position);
    this.group.add(f, o);
    this.halos.push(o);
    this.d.audio.play('carga', { volume: 0.5, pitch: 1.2 });
    this.w.fx.burst(this.group.localToWorld(f.position.clone()), { count: 12, color: 0xffd84a, speed: 1.6, up: 1.4, life: 0.5, size: 0.12 });
  }

  updateCrowd(P) {
    const T = this.w.time;
    let front = Math.max(...this.crowd.map((c) => c.v));
    for (const c of this.crowd) {
      if (c.v < P.v - 5) { front += 2.2; this.placeCrowd(c, front); }
      const r = c.m.root;
      r.position.y = h(c.v) + 0.06 + Math.sin(T * 2.1 + c.seed) * 0.05;
      r.position.x = c.u + Math.sin(T * 0.8 + c.seed) * 0.25;
      // as mais perto se inclinam e esticam os braços para quem passa (sem atacar)
      const near = Math.max(0, 1 - Math.abs(c.v - P.v) / 6);
      const J = c.m.joints;
      if (J && J.armR && J.armR.sh) J.armR.sh.rotation.x = -(c.reach ? 0.6 + 0.8 * near : 0.2) + Math.sin(T * 3 + c.seed) * 0.15;
      if (J && J.armL && J.armL.sh) J.armL.sh.rotation.x = -(c.reach ? 0.4 + 0.6 * near : 0.15) + Math.sin(T * 2.6 + c.seed) * 0.15;
      if (J && J.chest) J.chest.rotation.x = 0.25 + 0.2 * near;
    }
  }

  ghost() {
    const m = this.pool.pop() || buildAssombracao();
    if (!m.root.parent) this.group.add(m.root);
    m.root.visible = true;
    return m;
  }

  spawnHazard(p, P) {
    const speed = Math.max(3, p.moveSpeed || 7.5);
    const v = P.v + speed * RUN.warn;
    const H = RUN.half;
    const kind = Math.random() < 0.6 ? 'side' : 'mid';
    let x0, x1, side = 0;
    if (kind === 'side') {
      side = Math.random() < 0.5 ? -1 : 1;
      const reach = H * (1.05 + Math.random() * 0.35); // cobre de 50% a 70% da largura
      x0 = side < 0 ? -H : H - reach;
      x1 = side < 0 ? -H + reach : H;
    } else {
      // cai do alto no meio (mira onde o jogador está agora): vai para uma beirada
      const c = Math.max(-H + 1.4, Math.min(H - 1.4, P.u));
      x0 = c - 1.5;
      x1 = c + 1.5;
    }
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 1.8), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    mark.rotation.x = -Math.PI / 2 + Math.atan(RUN.slope);
    mark.position.set((x0 + x1) / 2, h(v) + 0.08, -v);
    this.group.add(mark);
    const g = this.ghost();
    if (kind === 'side') { g.root.position.set(side * (H + 1.4), h(v) + 0.06, -v); g.root.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; }
    else { g.root.position.set((x0 + x1) / 2, h(v) + 5, -v - 1.5); g.root.rotation.y = 0; }
    this.hazards.push({ kind, side, x0, x1, v, mark, ghost: g, t: 0, resolved: false, gone: false, out: 0 });
    this.d.audio.play('swing', { volume: 0.35, pitch: 0.6 });
  }

  updateHazard(hz, dt, live, P) {
    hz.t += dt;
    hz.mark.material.opacity = hz.resolved ? 0.35 * Math.max(0, 1 - hz.out / 0.4) : 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(hz.t * 16));
    const dv = hz.v - P.v; // > 0: ainda não chegou
    const g = hz.ghost;
    if (!hz.resolved && dv < 2.4) {
      const k = Math.min(1, (2.4 - dv) / 2.4);
      if (hz.kind === 'side') g.root.position.x = hz.side * (RUN.half + 1.4) - hz.side * k * (hz.x1 - hz.x0 + 1.2);
      else g.root.position.y = h(hz.v) + 5 - 4.8 * k;
      const arm = g.joints && g.joints.armR;
      if (arm && arm.sh) arm.sh.rotation.x = -1.4 * k;
    }
    if (!hz.resolved && dv <= 0) {
      hz.resolved = true;
      hz.mark.material.color.setHex(0x3a6aa0);
      const at = this.group.localToWorld(new THREE.Vector3((hz.x0 + hz.x1) / 2, h(hz.v) + 1.1, -hz.v));
      const sideYaw = this.yaw + (hz.side > 0 ? -Math.PI / 2 : Math.PI / 2);
      this.w.fx.slash(at, hz.kind === 'side' ? sideYaw : this.yaw, { color: 0xbfeaff, radius: (hz.x1 - hz.x0) / 2 + 0.6, arc: 2.4, life: 0.25, width: 0.4 });
      for (const q of live) {
        const Q = this.local(q.pos);
        if (Math.abs(Q.v - hz.v) > 1.6 || Q.u < hz.x0 - 0.25 || Q.u > hz.x1 + 0.25) continue;
        const dir = hz.kind === 'side' ? this.R.clone().multiplyScalar(-hz.side) : this.D.clone().negate();
        const res = applyHit(this.w, this.d.enemy, q, { damage: Math.round(q.maxHealth * this.dmg), kind: 'ability', element: 'morte', knockback: 1.6, hitstun: 0.3, dir, sound: 'heavyPunch', color: 0x9adcff, scale: 1.1 });
        if (typeof res === 'number' && res > 0) this.w.cameraRig && this.w.cameraRig.shake(0.25, 0.3);
      }
    }
    if (hz.resolved) {
      hz.out += dt;
      g.root.position.y += dt * 1.5;
      if (hz.out > 0.6) {
        hz.gone = true;
        this.group.remove(hz.mark);
        hz.mark.geometry.dispose();
        hz.mark.material.dispose();
        g.root.visible = false;
        const arm = g.joints && g.joints.armR;
        if (arm && arm.sh) arm.sh.rotation.x = 0;
        this.pool.push(g);
      }
    }
  }

  finish() {
    this.done = true;
    for (const p of this.d.players) p.runDir = null;
    for (const hz of this.hazards) { this.group.remove(hz.mark); hz.ghost.root.visible = false; }
    this.hazards = [];
    this.d.onRunnerDone(this.lit);
  }

  dispose() {
    const w = this.w;
    const a = w.arena;
    for (const p of this.d.players) p.runDir = null;
    a.radius = this.saved.radius;
    a.colliders = this.saved.colliders;
    a.boxes = this.saved.boxes;
    a.clampCamera = this.saved.clamp;
    w.groundAt = this.saved.ground;
    for (const c of this.cut) { c.geo.index && c.geo.index !== c.index && c.geo.index.array && c.geo.setIndex(c.index); }
    w.scene.remove(this.group, this.hemi, this.lamp);
    // os modelos das Assombrações dividem a geometria do .glb: só a do cenário é liberada
    const keep = new Set();
    for (const c of this.crowd) c.m.root.traverse((o) => keep.add(o));
    for (const m of this.pool) m.root.traverse((o) => keep.add(o));
    for (const hz of this.hazards) hz.ghost.root.traverse((o) => keep.add(o));
    this.group.traverse((o) => { if (keep.has(o)) return; if (o.geometry && o.geometry !== this.flameGeo && o.geometry !== this.haloGeo) o.geometry.dispose(); if (o.material && o.material !== this.flameMat && o.material !== this.haloMat) o.material.dispose(); });
    this.flameGeo.dispose();
    this.haloGeo.dispose();
    this.flameMat.dispose();
    this.haloMat.dispose();
    this.hazards = [];
  }
}
