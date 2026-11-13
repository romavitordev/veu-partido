// O LABIRINTO DOS BECOS (Torre da TV Varminho, 5º andar; pedido do dono, 2026-11-13: "uma sala onde é um labirinto e
// você tem que achar a saída enquanto derrota alguns monstros que aparecem. Um labirinto aleatório de corredores como
// uma backrooms, tem isso na série"). Cânone: os Becos do ep. 6–7 são corredores amarelo-esverdeados que não cabem no
// prédio. PROPOSTA (o jogo): a cada visita as paredes de dentro são SORTEADAS (um labirinto perfeito — todo canto tem
// caminho — com alguns atalhos a mais, para parecer os Becos e não um quebra-cabeça de papel); as portas de saída ficam
// na parede do fundo; de tempos em tempos um Alheio sai da interferência num corredor perto (não na cara do jogador).
import * as THREE from 'three';

const WALL_H = 2.5;
const T = 0.24;

// um labirinto perfeito (backtracker recursivo) e `loops` das paredes que sobram abertas a mais
// v[r][c] = parede entre (c, r) e (c+1, r); h[r][c] = parede entre (c, r) e (c, r+1)
export function generateMaze(cols, rows, { loops = 0.1, rng = Math.random } = {}) {
  const v = Array.from({ length: rows }, () => Array(cols - 1).fill(true));
  const h = Array.from({ length: rows - 1 }, () => Array(cols).fill(true));
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [c, r] = stack[stack.length - 1];
    const nb = [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]].filter(([x, y]) => x >= 0 && y >= 0 && x < cols && y < rows && !seen[y][x]);
    if (!nb.length) { stack.pop(); continue; }
    const [nc, nr] = nb[Math.floor(rng() * nb.length)];
    if (nc !== c) v[r][Math.min(c, nc)] = false;
    else h[Math.min(r, nr)][c] = false;
    seen[nr][nc] = true;
    stack.push([nc, nr]);
  }
  for (const row of v) for (let i = 0; i < row.length; i++) if (row[i] && rng() < loops) row[i] = false;
  for (const row of h) for (let i = 0; i < row.length; i++) if (row[i] && rng() < loops) row[i] = false;
  return { v, h, cols, rows };
}

// quantos passos de (c0, r0) até cada célula (para escolher onde os Alheios aparecem)
export function mazeDistances(m, c0, r0) {
  const d = Array.from({ length: m.rows }, () => Array(m.cols).fill(Infinity));
  d[r0][c0] = 0;
  const q = [[c0, r0]];
  while (q.length) {
    const [c, r] = q.shift();
    const step = (nc, nr, open) => { if (open && d[nr][nc] === Infinity) { d[nr][nc] = d[r][c] + 1; q.push([nc, nr]); } };
    if (c + 1 < m.cols) step(c + 1, r, !m.v[r][c]);
    if (c > 0) step(c - 1, r, !m.v[r][c - 1]);
    if (r + 1 < m.rows) step(c, r + 1, !m.h[r][c]);
    if (r > 0) step(c, r - 1, !m.h[r - 1][c]);
  }
  return d;
}

export class MazeRoom {
  constructor(dungeon, M) {
    this.d = dungeon;
    this.w = dungeon.world;
    const Z = M.maze;
    this.Z = Z;
    this.m = generateMaze(Z.cols, Z.rows, { loops: Z.loops ?? 0.1 });
    this.boxes = [];
    this.spawned = [];
    this.next = 5 + Math.random() * 3;
    this.build();
  }

  build() {
    const { x0, z0, cell, cols, rows } = this.Z;
    const segs = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols - 1; c++) if (this.m.v[r][c]) segs.push({ x: x0 + (c + 1) * cell, z: z0 + (r + 0.5) * cell, sx: T, sz: cell + T });
    for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols; c++) if (this.m.h[r][c]) segs.push({ x: x0 + (c + 0.5) * cell, z: z0 + (r + 1) * cell, sx: cell + T, sz: T });
    // o papel de parede amarelo-esverdeado dos Becos e o rodapé escuro (dois InstancedMesh: barato)
    const wallMat = new THREE.MeshToonMaterial({ color: 0xb4a85a, emissive: 0x1a1808 });
    const baseMat = new THREE.MeshToonMaterial({ color: 0x4a4228 });
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const walls = new THREE.InstancedMesh(geo, wallMat, segs.length);
    const bases = new THREE.InstancedMesh(geo, baseMat, segs.length);
    const mtx = new THREE.Matrix4();
    segs.forEach((s, i) => {
      mtx.compose(new THREE.Vector3(s.x, WALL_H / 2, s.z), new THREE.Quaternion(), new THREE.Vector3(s.sx, WALL_H, s.sz));
      walls.setMatrixAt(i, mtx);
      mtx.compose(new THREE.Vector3(s.x, 0.09, s.z), new THREE.Quaternion(), new THREE.Vector3(s.sx + 0.03, 0.18, s.sz + 0.03));
      bases.setMatrixAt(i, mtx);
      const b = { minX: s.x - s.sx / 2, maxX: s.x + s.sx / 2, minZ: s.z - s.sz / 2, maxZ: s.z + s.sz / 2, h: WALL_H };
      this.w.arena.boxes.push(b);
      this.boxes.push(b);
    });
    walls.castShadow = false;
    this.group = new THREE.Group();
    this.group.add(walls, bases);
    this.w.scene.add(this.group);
    this.geo = geo;
  }

  cellOf(p) {
    const { x0, z0, cell, cols, rows } = this.Z;
    return [Math.max(0, Math.min(cols - 1, Math.floor((p.x - x0) / cell))), Math.max(0, Math.min(rows - 1, Math.floor((p.z - z0) / cell)))];
  }

  update(dt) {
    const S = this.Z.spawn;
    if (!S) return;
    this.spawned = this.spawned.filter((c) => c.alive);
    this.next -= dt;
    if (this.next > 0 || this.spawned.length >= S.max) return;
    this.next = S.every[0] + Math.random() * (S.every[1] - S.every[0]);
    const alive = this.d.players.filter((q) => q.state !== 'ko');
    if (!alive.length) return;
    // uma célula a 3–5 passos de corredor de ALGUÉM e a pelo menos 3 de TODOS (no coop não nasce na cara do outro)
    const maps = alive.map((q) => { const [pc, pr] = this.cellOf(q.pos); return mazeDistances(this.m, pc, pr); });
    const opts = [];
    for (let r = 0; r < this.Z.rows; r++) for (let c = 0; c < this.Z.cols; c++) {
      const ds = maps.map((d) => d[r][c]);
      if (Math.min(...ds) >= 3 && ds.some((d) => d <= 5)) opts.push([c, r]);
    }
    if (!opts.length) return;
    const [c, r] = opts[Math.floor(Math.random() * opts.length)];
    const pos = new THREE.Vector3(this.Z.x0 + (c + 0.5) * this.Z.cell, 0, this.Z.z0 + (r + 0.5) * this.Z.cell);
    const kind = Math.random() < 0.55 ? 'interflorado' : Math.random() < 0.5 ? 'combatente' : 'civil';
    const n = this.d.spawnAlheio(kind, pos, this.spawned.length);
    if (n) this.spawned.push(n);
  }

  dispose() {
    const boxes = this.w.arena.boxes;
    for (const b of this.boxes) { const i = boxes.indexOf(b); if (i >= 0) boxes.splice(i, 1); }
    this.boxes = [];
    if (this.group) {
      this.w.scene.remove(this.group);
      this.geo.dispose();
      this.group.children.forEach((o) => { o.material.dispose(); o.dispose && o.dispose(); });
      this.group = null;
    }
  }
}
