// A ÁRVORE ANCIÃ — a PARTE 3 da noite do Samhain em Treb Ciach (TODO: "proteger a ENTRADA da árvore enquanto derrota as
// ondas, que agora têm FIM, mas o jogador não sabe quantas faltam"). Dono (2026-11-19): "quanto mais lamparinas o player
// acender na parte do corredor, mais fraco vai ficar a parte da arvore" — `run.samhainLamps` deixa as ondas menores e as
// Assombrações com menos vida (dungeons.js `treePlan`, `TREE.hpCut`).
// Referências (`Referencias visuais/Mapas/treb-ciach/`): o mapa da wiki (a clareira oval ao norte da Vila, cercada de
// floresta, com colmeias e flores em volta da árvore e a abertura escura na base) e os eps. 1 (1h50–1h52: o campo de
// margaridas brancas e flores amarelas subindo até a árvore na névoa, as fileiras de colmeias de palha, o poste com a
// lanterna, os arbustos vermelhos) e 3 (3h27–3h31: o tronco enorme de fibras torcidas, os galhos nus longos e abertos, as
// raízes grossas com a entrada).
// A clareira fica no centro do mundo (o cenário da vila é baixado para longe enquanto ela existe, e volta no fim): as
// Assombrações e quem joga andam no chão de sempre (y = 0) e o limite redondo da arena vale para a clareira.
// A PORTA DE PEDRA DO ARSENAL entre as raízes é o alvo (como as casas da parte 1: `isHouse`): se ela cair, a tentativa
// acaba. Cenário procedural provisório (PROPOSTA: refazer a árvore no Blender MCP). PROPOSTA: todos os números.
import * as THREE from 'three';

export const TREE = {
  radius: 22, // a clareira (o limite de quem anda)
  doorHp: { easy: 2200, normal: 2150, hard: 1800, superhard: 1700, annihilation: 1600 },
  hpCut: 0.5, // a vida das Assombrações cai até a metade do corte das lamparinas (dungeons.js treeWeaken)
  regen: 0.18, // entre as ondas, o alçapão recupera 18% (os aldeões escoram por dentro)
  trunk: { x: 0, z: -10, r: 4.3 }, // o tronco: ~7 m de largura e ~10 m até se abrir (ep. 3, 3h30: uns 4 personagens de largura)
  spawnR: 21,
};

const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// um tubo que afina (galhos, raízes, as fibras do tronco): anéis ao longo da curva, raio de r0 a r1
function taper(points, r0, r1, radial = 7, bump = 0.12, seed = 0) {
  const curve = new THREE.CatmullRomCurve3(points);
  const n = Math.max(4, Math.round(curve.getLength() * 2.2));
  const fr = curve.computeFrenetFrames(n, false);
  const pos = [], idx = [];
  const p = new THREE.Vector3(), d = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    curve.getPointAt(t, p);
    const r = r0 + (r1 - r0) * Math.pow(t, 0.8);
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const k = 1 + bump * (rnd(seed + i * 3.1 + j * 7.7) - 0.5);
      d.copy(fr.normals[i]).multiplyScalar(Math.cos(a)).addScaledVector(fr.binormals[i], Math.sin(a));
      pos.push(p.x + d.x * r * k, p.y + d.y * r * k, p.z + d.z * r * k);
    }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) {
    const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = a + radial, e = b + radial;
    idx.push(a, c, b, b, c, e);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

// junta várias geometrias indexadas (só posição) numa só
function merge(list) {
  let nv = 0, ni = 0;
  for (const g of list) { nv += g.attributes.position.count; ni += g.index.count; }
  const pos = new Float32Array(nv * 3);
  const idx = new Uint32Array(ni);
  let ov = 0, oi = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, ov * 3);
    const src = g.index.array;
    for (let i = 0; i < src.length; i++) idx[oi + i] = src[i] + ov;
    ov += g.attributes.position.count;
    oi += src.length;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeVertexNormals();
  return out;
}

// A ÁRVORE: o tronco de fibras torcidas em espiral, os galhos nus longos que se abrem para os lados e as raízes grossas
function buildTree() {
  const parts = [];
  const H = 9.5; // onde o tronco se abre (ep. 3, 3h30: ~5 personagens de altura)
  // as fibras do tronco: cordas grossas girando em volta do eixo (1,2 volta), largas embaixo
  const N = 15;
  for (let s = 0; s < N; s++) {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const y = -0.4 + t * (H + 0.6);
      const R = 2.9 - 1.1 * t + (t < 0.15 ? (0.15 - t) * 5 : 0);
      const a = (s / N) * Math.PI * 2 + t * Math.PI * 2.4;
      pts.push(new THREE.Vector3(Math.cos(a) * R, y, Math.sin(a) * R));
    }
    parts.push(taper(pts, 1.2, 0.75, 8, 0.18, s * 13));
  }
  parts.push(taper([new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(0, H * 0.5, 0), new THREE.Vector3(0, H + 0.2, 0)], 3.0, 1.9, 10, 0.1, 5));
  // os galhos: os grandes saem do alto do tronco, sobem pouco e se estendem quase na horizontal, retorcidos
  const branch = (from, dir, len, r, depth, seed) => {
    const pts = [from.clone()];
    const d = dir.clone().normalize();
    const p = from.clone();
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      d.x += (rnd(seed + i) - 0.5) * 0.7;
      d.z += (rnd(seed + i * 2.3) - 0.5) * 0.7;
      d.y += (rnd(seed + i * 4.1) - 0.55) * 0.5 - (depth === 0 ? 0.04 * i : 0);
      d.normalize();
      p.addScaledVector(d, len / steps);
      pts.push(p.clone());
    }
    parts.push(taper(pts, r, r * 0.22, depth ? 5 : 7, 0.14, seed));
    if (depth >= 2) return;
    const kids = depth === 0 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const at = pts[2 + Math.floor(rnd(seed * 3 + k) * (pts.length - 3))];
      const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar((k % 2 ? 1 : -1) * (0.6 + rnd(seed + k * 9)));
      const nd = dir.clone().normalize().add(side).add(new THREE.Vector3(0, 0.12 + rnd(seed + k * 5) * 0.3, 0));
      branch(at, nd, len * (0.45 + rnd(seed + k * 7) * 0.2), r * 0.45, depth + 1, seed * 1.7 + k * 31);
    }
  };
  const top = new THREE.Vector3(0, H, 0);
  const B = 9;
  for (let b = 0; b < B; b++) {
    const a = (b / B) * Math.PI * 2 + 0.3 + rnd(b) * 0.4;
    const up = 0.05 + rnd(b * 3) * 0.32;
    const from = top.clone().add(new THREE.Vector3(Math.cos(a) * 1.4, -2 + rnd(b * 5) * 2.6, Math.sin(a) * 1.4));
    branch(from, new THREE.Vector3(Math.cos(a), up, Math.sin(a)), 14 + rnd(b * 7) * 6, 1.25, 0, b * 17 + 3);
  }
  const rootTips = [];
  // as raízes grossas: saem da base, arqueiam e mergulham no chão (a frente, +z, fica aberta para a porta)
  const roots = 9;
  for (let k = 0; k < roots; k++) {
    let a = (k / roots) * Math.PI * 2 + 0.2;
    if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.42) a += 0.5;
    const L = 5 + rnd(k * 3) * 4;
    const c = Math.cos(a), s = Math.sin(a);
    parts.push(taper([
      new THREE.Vector3(c * 2.8, 2.6, s * 2.8),
      new THREE.Vector3(c * 4.2, 1.4, s * 4.2),
      new THREE.Vector3(c * (4.2 + L * 0.5), 0.55, s * (4.2 + L * 0.5)),
      new THREE.Vector3(c * (4.2 + L), -0.3, s * (4.2 + L)),
    ], 1.35, 0.2, 8, 0.16, k * 11));
    rootTips.push({ x: c * (4.2 + L * 0.35), z: s * (4.2 + L * 0.35), r: 0.9 });
  }
  return { geo: merge(parts), roots: rootTips };
}

// a COLMEIA de palha trançada (o sino com anéis de corda), num toco
function skepGeometry() {
  const pts = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const y = t * 1.25;
    const r = 0.46 * Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.4))) * (1 + 0.05 * Math.sin(t * Math.PI * 9));
    pts.push(new THREE.Vector2(Math.max(0.01, r), y));
  }
  const g = new THREE.LatheGeometry(pts, 14);
  g.translate(0, 0.42, 0);
  return g;
}

export class TreeDefense {
  constructor(d, lamps) {
    this.d = d;
    const w = d.world;
    this.w = w;
    this.lamps = lamps || 0;
    const diff = (d.run && d.run.difficulty) || 'normal';
    this.t = 0;
    this.lost = false;
    // o cenário da vila desce para longe (a clareira usa o centro do mundo); tudo volta no dispose
    const a = w.arena;
    this.saved = { radius: a.radius, colliders: a.colliders, boxes: a.boxes, clamp: a.clampCamera, y: a.group ? a.group.position.y : 0, rects: a.bounds && a.bounds.rects };
    if (a.group) { a.group.position.y -= 600; a.group.updateMatrixWorld(true); }
    a.radius = TREE.radius;
    const T = TREE.trunk;
    this.colliders = [{ x: T.x, z: T.z, r: T.r }];
    a.boxes = [];
    if (a.bounds && a.bounds.rects) a.bounds.rects = null;
    a.clampCamera = (p) => {
      const r = Math.hypot(p.x, p.z);
      if (r > 27) { p.x *= 27 / r; p.z *= 27 / r; }
      p.y = Math.max(0.6, Math.min(16, p.y));
    };
    // a noite depois da tempestade: névoa cinza-azulada, o céu mais claro e as lanternas quentes
    this.lights = [];
    w.scene.traverse((o) => { if (o.isLight && o.intensity > 0) this.lights.push([o, o.intensity]); });
    for (const [o, i0] of this.lights) o.intensity = i0 * 0.25;
    const fog = w.scene.fog;
    this.fog = fog ? { c: fog.color.clone(), dens: fog.density, near: fog.near, far: fog.far } : null;
    if (fog) {
      fog.color.setHex(0x2c3540);
      if (fog.density !== undefined) fog.density = 0.03;
      else { fog.near = 14; fog.far = 70; }
    }
    this.hemi = new THREE.HemisphereLight(0x9fb2d0, 0x2a2418, 1.0);
    this.moon = new THREE.DirectionalLight(0xb8c8e8, 0.7);
    this.moon.position.set(-14, 26, 10);
    w.scene.add(this.hemi, this.moon);
    this.build();
    a.colliders = this.colliders;
    // a PORTA (o alvo das Assombrações)
    this.door = new TreeDoor(this, TREE.doorHp[diff] ?? TREE.doorHp.normal);
    this.chests = [{ x: -9, z: 7 }, { x: 9, z: 7 }];
  }

  build() {
    const g = new THREE.Group();
    g.name = 'arvore-ancia';
    const T = TREE.trunk;
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const lam = (c) => new THREE.MeshLambertMaterial({ color: c });
    // o chão: o campo em volta e a clareira (um morrinho até a árvore), e o caminho que chega do corredor (+z)
    const field = new THREE.Mesh(new THREE.CircleGeometry(110, 48), lam(0x2a3420));
    field.rotation.x = -Math.PI / 2;
    field.position.y = -0.02;
    const meadow = new THREE.Mesh(new THREE.CircleGeometry(TREE.radius + 2.5, 48), lam(0x3c4a2a));
    meadow.rotation.x = -Math.PI / 2;
    const path = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 70), lam(0x5a4634));
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.01, 50);
    const trail = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 15), lam(0x4e4030));
    trail.rotation.x = -Math.PI / 2;
    trail.position.set(0, 0.012, 9);
    field.receiveShadow = meadow.receiveShadow = true;
    g.add(field, meadow, path, trail);
    // a árvore
    const bark = new THREE.MeshStandardMaterial({ color: 0x3e342c, roughness: 1, flatShading: true });
    const tree = buildTree();
    this.tree = new THREE.Mesh(tree.geo, bark);
    for (const r of tree.roots) this.colliders.push({ x: T.x + r.x, z: T.z + r.z, r: r.r });
    this.tree.position.set(T.x, 0, T.z);
    this.tree.castShadow = true;
    g.add(this.tree);
    // a PORTA DO ARSENAL: um alçapão de pedra rente ao chão, como porta de porão, encostado na base do tronco entre duas
    // raízes (dono: "quase uma porta de porão, mais pro chão"); embaixo, a escada para o salão sob a árvore
    const door = new THREE.Group();
    door.position.set(T.x, 0, T.z + T.r + 0.3);
    const stone = lam(0x6e6a62);
    const curb = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, d), stone); m.position.set(x, 0.12, z); door.add(m); };
    curb(3.3, 0.4, 0, 1.75); // a soleira de pedra em volta do buraco
    curb(0.4, 2.2, -1.45, 0.75);
    curb(0.4, 2.2, 1.45, 0.75);
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.9), new THREE.MeshBasicMaterial({ color: 0x050403 }));
    hole.rotation.x = -Math.PI / 2 + 0.42;
    hole.position.set(0, 0.42, 0.72);
    this.slabMat = new THREE.MeshLambertMaterial({ color: 0x8a857a, emissive: 0x000000 });
    this.slab = new THREE.Group();
    this.slab.position.set(0, 0.42, 0.75);
    this.slab.rotation.x = 0.42; // inclinado, a borda de baixo no chão e a de cima apoiada no tronco
    for (const sx of [-0.62, 0.62]) {
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.95), this.slabMat);
      leaf.position.x = sx;
      this.slab.add(leaf);
    }
    const iron = new THREE.MeshLambertMaterial({ color: 0x2a2a2c });
    for (const bz of [-0.55, 0.55]) { const b = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 0.12), iron); b.position.set(0, 0.12, bz); this.slab.add(b); }
    const ringH = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 6, 14), iron);
    ringH.rotation.x = Math.PI / 2;
    ringH.position.set(0, 0.13, 0.75);
    this.slab.add(ringH);
    // o símbolo da Vigília entalhado nas duas folhas (PROPOSTA: o círculo com o traço; brilha fraco enquanto a porta aguenta)
    this.runeMat = new THREE.MeshBasicMaterial({ color: 0xffc860, transparent: true, opacity: 0.7 });
    const rune = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.45, 28), this.runeMat);
    rune.rotation.x = -Math.PI / 2;
    rune.position.set(0, 0.111, 0);
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 1.3), this.runeMat);
    bar.rotation.x = -Math.PI / 2;
    bar.position.set(0, 0.112, 0);
    this.slab.add(rune, bar);
    // DETALHES DO ALÇAPÃO (dono, 2026-11-19: "os detalhes do alçapão (runa e travas)"; PROPOSTA de desenho):
    // as juntas da pedra, a borda gasta, os rebites das cintas, as dobradiças em cima, as duas travas com o cadeado no
    // meio, a corrente, a runa completa (anel entalhado, marcas dos quatro lados e os pontos) e as pedras-runa da soleira
    const groove = new THREE.MeshBasicMaterial({ color: 0x3a3732 });
    const edgeMat = lam(0xa49e90);
    for (const sx of [-0.62, 0.62]) {
      for (const gz of [-0.3, 0.3]) { const j = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.012, 0.03), groove); j.position.set(sx, 0.106, gz); this.slab.add(j); }
      const crack = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.42), groove);
      crack.position.set(sx + 0.3 * Math.sign(sx), 0.106, -0.78);
      crack.rotation.y = 0.5 * Math.sign(sx);
      this.slab.add(crack);
      const lip = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.05, 0.08), edgeMat);
      lip.position.set(sx, 0.09, 0.98);
      this.slab.add(lip);
    }
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.014, 1.95), groove);
    seam.position.set(0, 0.106, 0);
    this.slab.add(seam);
    const rivetGeo = new THREE.SphereGeometry(0.03, 6, 4);
    for (const bz of [-0.55, 0.55]) for (let x = -1.15; x <= 1.16; x += 0.33) { const r = new THREE.Mesh(rivetGeo, iron); r.position.set(x, 0.155, bz); this.slab.add(r); }
    // as dobradiças: chapas largas de ferro na borda de cima, presas na pedra do tronco
    for (const hx of [-0.95, -0.3, 0.3, 0.95]) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.5), iron);
      plate.position.set(hx, 0.13, -0.78);
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.26, 8), iron);
      pin.rotation.z = Math.PI / 2;
      pin.position.set(hx, 0.13, -1.0);
      this.slab.add(plate, pin);
    }
    // as TRAVAS: dois ferrolhos atravessando a emenda e o cadeado pendurado entre eles, com a corrente
    for (const tz of [-0.15, 0.32]) {
      const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.07, 0.09), iron);
      bolt.position.set(0, 0.17, tz);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), iron);
      knob.position.set(0.47, 0.19, tz);
      for (const sx of [-0.36, 0.36]) {
        const staple = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 5, 10, Math.PI), iron);
        staple.position.set(sx, 0.16, tz);
        staple.rotation.y = Math.PI / 2;
        this.slab.add(staple);
      }
      this.slab.add(bolt, knob);
    }
    const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.24), lam(0x5a4a2a));
    lockBody.position.set(0, 0.2, 0.08);
    const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 6, 12, Math.PI), iron);
    shackle.rotation.x = -Math.PI / 2;
    shackle.position.set(0, 0.2, -0.04);
    this.slab.add(lockBody, shackle);
    const link = new THREE.TorusGeometry(0.045, 0.012, 5, 8);
    for (let i = 0; i < 9; i++) {
      const l = new THREE.Mesh(link, iron);
      l.position.set(-0.3 - i * 0.075, 0.16, 0.12 + Math.sin(i * 0.7) * 0.06);
      l.rotation.set(Math.PI / 2, 0, i % 2 ? Math.PI / 2 : 0);
      this.slab.add(l);
    }
    // a RUNA completa: o anel entalhado escuro por baixo, as quatro marcas e os três pontos (brilham com this.runeMat)
    const carve = new THREE.Mesh(new THREE.RingGeometry(0.33, 0.48, 28), groove);
    carve.rotation.x = -Math.PI / 2;
    carve.position.set(0, 0.108, 0);
    this.slab.add(carve);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.2), this.runeMat);
      tick.rotation.set(-Math.PI / 2, 0, -a);
      tick.position.set(Math.sin(a) * 0.6, 0.112, Math.cos(a) * 0.6);
      this.slab.add(tick);
    }
    for (const dz of [-0.2, 0, 0.2]) {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), this.runeMat);
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(0.18, 0.112, dz);
      this.slab.add(dot);
    }
    // as pedras-runa nos cantos da soleira (o mesmo brilho) e o musgo nas pedras
    const moss = lam(0x3e5a2a);
    for (const [x, z] of [[-1.45, 1.75], [1.45, 1.75], [-1.45, -0.3], [1.45, -0.3]]) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.42), stone);
      st.position.set(x, 0.25, z);
      const mark = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.11, 14), this.runeMat);
      mark.position.set(x, 0.3, z + 0.215);
      const ms = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.3), moss);
      ms.position.set(x, 0.52, z - 0.05);
      door.add(st, mark, ms);
    }
    for (const [x, z, w] of [[-0.8, 1.95, 0.7], [1.0, 1.95, 0.5], [-1.62, 0.6, 0.18]]) {
      const ms = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.16), moss);
      ms.position.set(x, 0.29, z);
      door.add(ms);
    }
    // os CRÂNIOS DE PORCO em estacas dos dois lados (Samhain; PROPOSTA de enfeite)
    const bone = lam(0xe6dcc4);
    for (const sx of [-2.3, 2.3]) {
      const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.7, 6), lam(0x4a3628));
      stake.position.set(sx, 0.85, 1.4);
      const sk = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), bone);
      sk.scale.set(1, 0.86, 1.3);
      sk.position.set(sx, 1.78, 1.45);
      const sn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.16, 8), bone);
      sn.rotation.x = Math.PI / 2;
      sn.position.set(sx, 1.75, 1.7);
      door.add(stake, sk, sn);
      for (const ex of [-0.07, 0.07]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), groove);
        eye.position.set(sx + ex, 1.82, 1.62);
        door.add(eye);
      }
    }
    for (const [x, z] of [[-2.3, 1.4], [2.3, 1.4]]) this.colliders.push({ x: T.x + x, z: door.position.z + z, r: 0.2 });
    door.add(hole, this.slab);
    g.add(door);
    this.doorGroup = door;
    // as COLMEIAS de palha em fileiras dos dois lados do campo
    const hives = [];
    for (const side of [-1, 1]) for (let i = 0; i < 6; i++) hives.push({ x: side * (10.5 + (i % 2) * 2.2 + rnd(i + side) * 0.6), z: -6 + i * 2.4 + rnd(i * 3 + side) });
    for (let i = 0; i < 4; i++) hives.push({ x: (i < 2 ? -1 : 1) * (12 + (i % 2) * 2.4), z: -15 - rnd(i * 2) * 1.5 });
    const skeps = new THREE.InstancedMesh(skepGeometry(), new THREE.MeshStandardMaterial({ color: 0xa06c38, roughness: 1, flatShading: true }), hives.length);
    const stumps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.36, 0.42, 0.42, 8), lam(0x4a3628), hives.length);
    hives.forEach((k, i) => {
      M.compose(p.set(k.x, 0, k.z), q.setFromEuler(e.set(0, rnd(i) * 6, 0)), s.set(1, 0.9 + rnd(i * 2) * 0.3, 1)); skeps.setMatrixAt(i, M);
      M.compose(p.set(k.x, 0.21, k.z), q.identity(), s.set(1, 1, 1)); stumps.setMatrixAt(i, M);
      this.colliders.push({ x: k.x, z: k.z, r: 0.55 });
    });
    skeps.castShadow = true;
    g.add(skeps, stumps);
    // as FLORES: margaridas brancas (a maioria) e flores amarelas, em hastes; nada no caminho nem no tronco
    const spots = [];
    for (let i = 0; spots.length < 2600 && i < 9000; i++) {
      const a = rnd(i * 1.7) * Math.PI * 2, r = Math.sqrt(rnd(i * 2.9)) * (TREE.radius + 2);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(x) < 1.8 && z > -6) continue;
      if (Math.hypot(x - T.x, z - T.z) < 5.4) continue;
      spots.push({ x, z, y: 0.22 + rnd(i * 4.3) * 0.3, yel: rnd(i * 6.1) < 0.28, i });
    }
    const petal = new THREE.CircleGeometry(0.09, 7);
    petal.rotateX(-Math.PI / 2);
    const white = new THREE.InstancedMesh(petal, new THREE.MeshLambertMaterial({ color: 0xece8dc, side: THREE.DoubleSide }), spots.length);
    const eyes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 5, 4), new THREE.MeshLambertMaterial({ color: 0xe0a828 }), spots.length);
    const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.008, 0.012, 1, 3), lam(0x4e6a32), spots.length);
    this.flowerMats = [white.material];
    spots.forEach((f, i) => {
      const tilt = (rnd(f.i * 8.3) - 0.5) * 0.7;
      const sc = f.yel ? 1.25 : 0.8 + rnd(f.i * 3.3) * 0.5;
      M.compose(p.set(f.x, f.y, f.z), q.setFromEuler(e.set(tilt, rnd(f.i) * 6, tilt * 0.6)), s.set(sc, 1, sc)); white.setMatrixAt(i, M);
      white.setColorAt(i, new THREE.Color(f.yel ? 0xe8b030 : 0xece8dc));
      M.compose(p.set(f.x, f.y + 0.012, f.z), q.identity(), s.set(f.yel ? 1.3 : 1, 1, f.yel ? 1.3 : 1)); eyes.setMatrixAt(i, M);
      M.compose(p.set(f.x, f.y / 2, f.z), q.identity(), s.set(1, f.y, 1)); stems.setMatrixAt(i, M);
    });
    g.add(white, eyes, stems);
    // os tufos de capim e os arbustos vermelhos nas beiradas da clareira
    const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.16, 0.55, 4), lam(0x4a5a30), 700);
    for (let i = 0; i < 700; i++) {
      const a = rnd(i * 5.1) * Math.PI * 2, r = 4 + rnd(i * 7.3) * (TREE.radius + 8);
      M.compose(p.set(Math.cos(a) * r, 0.22, Math.sin(a) * r), q.identity(), s.setScalar(0.7 + rnd(i) * 0.7)); tufts.setMatrixAt(i, M);
    }
    const bushes = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.9, 0), new THREE.MeshLambertMaterial({ color: 0x7a2c1e, flatShading: true }), 46);
    for (let i = 0; i < 46; i++) {
      let a = rnd(i * 3.7) * Math.PI * 2;
      if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.25) a += 0.6; // o caminho (+z) fica livre
      const r = TREE.radius + 0.6 + rnd(i * 2.2) * 3;
      M.compose(p.set(Math.cos(a) * r, 0.5, Math.sin(a) * r), q.setFromEuler(e.set(0, rnd(i) * 6, 0)), s.set(1 + rnd(i * 4) * 0.8, 0.7 + rnd(i * 5) * 0.5, 1 + rnd(i * 6) * 0.8)); bushes.setMatrixAt(i, M);
    }
    g.add(tufts, bushes);
    // a FLORESTA em volta: pinheiros escuros e bétulas de tronco branco (o caminho para a vila fica aberto)
    const trees = [];
    for (let i = 0; trees.length < 190 && i < 600; i++) {
      const a = rnd(i * 1.3) * Math.PI * 2, r = TREE.radius + 4 + rnd(i * 2.1) * 30;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (z > 0 && Math.abs(x) < 6 + (z - TREE.radius) * 0.1) continue;
      trees.push({ x, z, k: 7 + rnd(i * 3.3) * 7, birch: rnd(i * 4.4) < 0.32 });
    }
    const pines = trees.filter((t) => !t.birch), birches = trees.filter((t) => t.birch);
    const pTrunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.26, 1, 6), lam(0x30241a), pines.length);
    const pCrown = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7), lam(0x1a2a20), pines.length);
    pines.forEach((t, i) => {
      M.compose(p.set(t.x, t.k * 0.15, t.z), q.identity(), s.set(1, t.k * 0.3, 1)); pTrunk.setMatrixAt(i, M);
      M.compose(p.set(t.x, t.k * 0.6, t.z), q.identity(), s.set(t.k * 0.26, t.k * 0.85, t.k * 0.26)); pCrown.setMatrixAt(i, M);
    });
    const bTrunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.16, 1, 6), lam(0xd8d4c8), birches.length);
    const bCrown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x55602e, flatShading: true }), birches.length);
    birches.forEach((t, i) => {
      M.compose(p.set(t.x, t.k * 0.4, t.z), q.setFromEuler(e.set((rnd(i) - 0.5) * 0.12, 0, (rnd(i * 2) - 0.5) * 0.12)), s.set(1, t.k * 0.8, 1)); bTrunk.setMatrixAt(i, M);
      M.compose(p.set(t.x, t.k * 0.78, t.z), q.identity(), s.set(t.k * 0.2, t.k * 0.26, t.k * 0.2)); bCrown.setMatrixAt(i, M);
    });
    g.add(pTrunk, pCrown, bTrunk, bCrown);
    // o POSTE com a lanterna de ferro acesa (ep. 1, 1h17) ao lado da porta, e as lamparinas que vêm do corredor
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 3.4, 7), lam(0x4a2e22));
    post.position.set(5.6, 1.7, T.z + 6.4);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.1), lam(0x4a2e22));
    arm.position.set(5.2, 3.05, T.z + 6.4);
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.42, 6), new THREE.MeshLambertMaterial({ color: 0x2a2018, emissive: 0xff7a20, emissiveIntensity: 0.6 }));
    cage.position.set(4.85, 2.72, T.z + 6.4);
    this.flame = new THREE.PointLight(0xffa850, 3, 14, 1.6);
    this.flame.position.set(4.85, 2.6, T.z + 6.6);
    g.add(post, arm, cage, this.flame);
    this.colliders.push({ x: 5.6, z: T.z + 6.4, r: 0.3 });
    this.colliders.push({ x: T.x, z: T.z + T.r + 1.0, r: 1.1 }); // o alçapão (ninguém fica em cima)
    const pathLamps = [];
    for (let i = 0; i < 6; i++) pathLamps.push({ x: (i % 2 ? 1 : -1) * 3.55, z: TREE.radius + 2 + i * 5.5 });
    for (const l of pathLamps) {
      const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.7, 6), lam(0x4a3626));
      lp.position.set(l.x, 0.85, l.z);
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd84a }));
      fl.position.set(l.x, 1.88, l.z);
      g.add(lp, fl);
    }
    this.w.scene.add(g);
    this.group = g;
  }

  // onde as Assombrações surgem: na borda da clareira, pelos lados e pelo caminho (não atrás da árvore)
  spawnPoint(i, count) {
    const spread = count > 1 ? (i / (count - 1) - 0.5) * 3.6 : (Math.random() - 0.5) * 3.6;
    const a = spread + (Math.random() - 0.5) * 0.35;
    const r = TREE.spawnR - Math.random() * 1.5;
    return new THREE.Vector3(Math.sin(a) * r, 0, Math.cos(a) * r);
  }

  targets() { return this.door.alive ? [this.door] : []; }

  // o corte das lamparinas, mostrado no começo
  intro() {
    const d = this.d;
    const lit = this.lamps;
    d.hud.callout('PROTEJA O ALÇAPÃO DA ÁRVORE ANCIÃ', '#ffd84a');
    d.pveHud.hint(lit > 0
      ? `${lit} ${lit === 1 ? 'lamparina acesa' : 'lamparinas acesas'} no caminho: as Assombrações chegam mais fracas. Não deixe o alçapão do arsenal cair`
      : 'Nenhuma lamparina acesa no caminho: as Assombrações chegam com toda a força. Não deixe o alçapão do arsenal cair');
    d.hintT = 8;
  }

  label() { return 'Proteja o alçapão do arsenal'; }

  rest() {
    const D = this.door;
    if (D.alive) D.hp = Math.min(D.maxHp, D.hp + D.maxHp * TREE.regen);
  }

  onDoorHit() {
    const d = this.d;
    this.wardHit = true;
    if (this.t - (this.warnAt ?? -99) > 6) {
      this.warnAt = this.t;
      d.hud.callout('A PORTA ESTÁ SENDO ATACADA', '#ff9a3a');
    }
  }

  onDoorLost() {
    if (this.lost) return;
    this.lost = true;
    const c = this.door.chestPos();
    this.w.fx.burst(c, { count: 40, color: 0x8a857a, speed: 5, up: 3, life: 0.9, size: 0.2, gravity: 9 });
    this.w.fx.burst(c, { count: 30, color: 0x2a2c30, kind: 'smoke', speed: 2, up: 1.5, life: 1.2, size: 0.9, grow: 1 });
    this.slab.visible = false;
    this.d.onTreeLost();
  }

  update(dt) {
    this.t += dt;
    this.door.update(dt, this.t);
    const k = this.door.hp / this.door.maxHp;
    if (Math.abs(k - (this.wardShown ?? -1)) > 0.002 || this.wardHit) {
      this.wardShown = k;
      this.d.pveHud.setWard(k, 'Os aldeões escondidos na Árvore', this.wardHit);
      this.wardHit = false;
    }
    this.flame.intensity = 2.6 + Math.sin(this.t * 9) * 0.25 + Math.sin(this.t * 23) * 0.15;
  }

  dispose() {
    const w = this.w;
    const a = w.arena;
    a.radius = this.saved.radius;
    a.colliders = this.saved.colliders;
    a.boxes = this.saved.boxes;
    a.clampCamera = this.saved.clamp;
    if (a.bounds && this.saved.rects) a.bounds.rects = this.saved.rects;
    if (a.group) { a.group.position.y = this.saved.y; a.group.updateMatrixWorld(true); }
    for (const [o, i0] of this.lights) o.intensity = i0;
    const fog = w.scene.fog;
    if (fog && this.fog) {
      fog.color.copy(this.fog.c);
      if (fog.density !== undefined) fog.density = this.fog.dens;
      else { fog.near = this.fog.near; fog.far = this.fog.far; }
    }
    this.door.dispose();
    this.d.pveHud && this.d.pveHud.setWard(null);
    w.scene.remove(this.group, this.hemi, this.moon);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }
}

// o alçapão de pedra como alvo (a mesma conversa das casas da parte 1: Assombracao.strike → hurt)
class TreeDoor {
  constructor(tree, hp) {
    this.tree = tree;
    this.isHouse = true;
    const T = TREE.trunk;
    this.pos = new THREE.Vector3(T.x, 0, T.z + T.r + 2.3); // a borda de baixo do alçapão
    this.radius = 0.9;
    this.height = 1.0;
    this.maxHp = hp;
    this.hp = hp;
    this.state = 'idle';
    this.flash = 0;
    // o anel no chão com quanto a porta aguenta
    const w = tree.w;
    this.ringBg = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.72, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
    this.ringBg.rotation.x = -Math.PI / 2;
    this.ringBg.position.set(this.pos.x, 0.04, this.pos.z + 0.4);
    this.ringMat = new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.85, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.72, 48), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.set(this.pos.x, 0.05, this.pos.z + 0.4);
    w.scene.add(this.ringBg, this.ring);
    this.shown = 1;
  }

  get alive() { return this.state !== 'ko'; }
  isInvulnerable() { return this.state === 'ko'; }
  chestPos(out = new THREE.Vector3()) { return out.set(this.pos.x, 0.6, this.pos.z - 0.8); }

  hurt(dmg) {
    if (this.state === 'ko') return;
    this.hp = Math.max(0, this.hp - dmg);
    this.flash = 0.12;
    this.tree.onDoorHit(this);
    if (this.hp <= 0) {
      this.state = 'ko';
      this.tree.onDoorLost(this);
    }
  }

  update(dt, t) {
    const k = this.hp / this.maxHp;
    if (Math.abs(k - this.shown) > 0.01) {
      this.shown = k;
      this.ring.geometry.dispose();
      this.ring.geometry = new THREE.RingGeometry(1.5, 1.72, 48, 1, Math.PI / 2, Math.max(0.001, Math.PI * 2 * k));
      this.ringMat.color.setHex(k > 0.5 ? 0xffd84a : k > 0.25 ? 0xff9a3a : 0xff4a3a);
    }
    const tr = this.tree;
    this.flash = Math.max(0, this.flash - dt);
    tr.slabMat.emissive.setHex(this.flash > 0 ? 0x4a6a8a : 0x000000);
    // a pedra escurece e racha conforme apanha; o símbolo apaga
    tr.slabMat.color.setHex(0x8a857a).lerp(new THREE.Color(0x3a3834), 1 - k);
    tr.runeMat.opacity = this.alive ? 0.25 + 0.5 * k + Math.sin(t * 3) * 0.06 : 0;
    tr.slab.rotation.z = (1 - k) * 0.05 * Math.sin(t * 40) * (this.flash > 0 ? 1 : 0);
  }

  dispose() {
    const s = this.tree.w.scene;
    s.remove(this.ringBg, this.ring);
    for (const o of [this.ringBg, this.ring]) { o.geometry.dispose(); o.material.dispose(); }
  }
}
