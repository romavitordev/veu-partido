import * as THREE from 'three';

// A CASCA DAS SALAS DE LUTA DO OUTRO LADO (TODO 2026-11-09: "estão feias comparadas aos outros cenários"). No PvE a
// câmera é por cima do ombro e as paredes param em 3,2 m; na luta a câmera fica mais longe e vê o vazio preto acima
// delas. Aqui as paredes da sala ganham mais camadas (cópias empilhadas da própria parede, com a mesma textura), o
// vão acima das portas é fechado e entra um teto com vigas. As cópias são OCC (ficam transparentes quando tampam a
// luta), como as paredes de baixo.
//   cfg.shell = { prefix: 'OCC_bunker_', layers: 1, ceiling: 0x2a2826, beams: { color, every, axis: 'x'|'z', depth },
//                 trim: { color, h } }
export function buildRoomShell(group, occluders, s) {
  const walls = [];
  group.traverse((o) => {
    if (!o.isMesh) return;
    let n = '';
    for (let p = o; p && p !== group; p = p.parent) if ((p.name || '').startsWith(s.prefix)) { n = p.name; break; }
    if (n && !(s.skip || ['_barra', '_wains']).some((k) => n.includes(k))) walls.push(o); // sem rodapé e lambri
  });
  if (!walls.length) return;
  group.updateMatrixWorld(true);
  const room = new THREE.Box3();
  const boxes = walls.map((w) => { const b = new THREE.Box3().setFromObject(w); room.union(b); return b; });
  const H = room.max.y - room.min.y;
  const layers = s.layers ?? 1;
  const top = room.min.y + H * (layers + 1);
  const cx = (room.min.x + room.max.x) / 2, cz = (room.min.z + room.max.z) / 2;

  const add = (mesh) => {
    // material próprio (o fade das paredes é por peça) e sempre opaco ao nascer
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone();
    for (const m of [].concat(mesh.material)) { m.transparent = false; m.opacity = 1; m.depthWrite = true; }
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    occluders.push(mesh);
    return mesh;
  };
  // sobe uma cópia da parede em y (no espaço do pai; as salas não têm escala no pai)
  const stack = (w, dy, shift) => {
    const c = add(w.clone());
    c.position.y += dy;
    if (shift) c.position.add(shift);
    w.parent.add(c);
    return c;
  };

  walls.forEach((w, i) => {
    for (let k = 1; k <= layers; k++) stack(w, H * k);
  });

  // os vãos das portas: paredes no mesmo plano com um buraco entre elas. Acima da porta e nas camadas de cima, uma
  // cópia da parede vizinha, recuada uns centímetros para fora (fica atrás das outras, sem brigar com elas)
  const planes = new Map();
  boxes.forEach((b, i) => {
    const dx = b.max.x - b.min.x, dz = b.max.z - b.min.z;
    const alongX = dx > dz;
    const key = (alongX ? 'z' : 'x') + Math.round((alongX ? (b.min.z + b.max.z) : (b.min.x + b.max.x)) * 5);
    if (!planes.has(key)) planes.set(key, { alongX, list: [] });
    planes.get(key).list.push(i);
  });
  for (const { alongX, list } of planes.values()) {
    const ax = alongX ? 'x' : 'z';
    list.sort((a, b) => boxes[a].min[ax] - boxes[b].min[ax]);
    for (let j = 0; j < list.length - 1; j++) {
      const A = boxes[list[j]], B = boxes[list[j + 1]];
      const gap = B.min[ax] - A.max[ax];
      if (gap < 0.3) continue;
      const w = walls[list[j]];
      const len = A.max[ax] - A.min[ax];
      if (len < gap) continue;
      // para fora da sala, na espessura da parede
      const mid = alongX ? (A.min.z + A.max.z) / 2 : (A.min.x + A.max.x) / 2;
      const out = Math.sign(mid - (alongX ? cz : cx)) * 0.05;
      const shift = new THREE.Vector3();
      shift[ax] = B.min[ax] - A.max[ax] + 0.0; // a cópia de A empurrada até o fim do vão
      if (alongX) shift.z = out; else shift.x = out;
      // da altura da porta (s.doorH) até o topo da sala original e em todas as camadas de cima
      const doorH = s.doorH ?? 2.7; // as portas do jogo (pve/roomDoors.js) têm até 2,62 m
      // a verga: a cópia achatada entre o alto da porta e o alto da sala
      const lintel = stack(w, 0, shift);
      lintel.scale.y = (H - doorH) / H;
      lintel.updateMatrixWorld(true);
      const lb = new THREE.Box3().setFromObject(lintel);
      lintel.position.y += room.min.y + doorH - lb.min.y;
      for (let k = 1; k <= layers; k++) stack(w, H * k, shift);
    }
  }

  // o teto (virado para baixo: por cima não aparece) e as vigas
  const W = room.max.x - room.min.x, D = room.max.z - room.min.z;
  const ceilMat = new THREE.MeshStandardMaterial({ color: s.ceiling ?? 0x2a2622, roughness: 0.95 });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(cx, top, cz);
  ceil.receiveShadow = true;
  group.add(ceil);
  if (s.beams) {
    const b = s.beams;
    const bm = new THREE.MeshStandardMaterial({ color: b.color ?? 0x3a2a1c, roughness: 0.85 });
    const along = b.axis === 'z';
    const span = along ? D : W;
    const across = along ? W : D;
    const n = Math.max(1, Math.floor(across / (b.every ?? 3)));
    const depth = b.depth ?? 0.35;
    for (let i = 1; i < n; i++) {
      const t = (along ? room.min.x : room.min.z) + (across * i) / n;
      const geo = along ? new THREE.BoxGeometry(0.3, depth, span) : new THREE.BoxGeometry(span, depth, 0.3);
      const m = new THREE.Mesh(geo, bm);
      m.position.set(along ? t : cx, top - depth / 2, along ? cz : t);
      m.receiveShadow = true;
      group.add(m);
    }
  }
  if (s.trim) {
    // a moldura onde a parede de baixo encontra a de cima (esconde a emenda das cópias)
    const tm = new THREE.MeshStandardMaterial({ color: s.trim.color ?? 0x2a1c12, roughness: 0.7 });
    const th = s.trim.h ?? 0.18;
    for (const b of boxes) {
      const dx = b.max.x - b.min.x, dz = b.max.z - b.min.z;
      const alongX = dx > dz;
      const geo = alongX ? new THREE.BoxGeometry(dx, th, 0.32) : new THREE.BoxGeometry(0.32, th, dz);
      for (let k = 1; k <= layers; k++) {
        const m = add(new THREE.Mesh(geo, tm));
        m.position.set((b.min.x + b.max.x) / 2, room.min.y + H * k, (b.min.z + b.max.z) / 2);
        group.add(m);
      }
    }
  }
  // adereços simples da sala (quadros, canos): { box: [x, y, z], size: [w, h, d], color, emissive, ei, rotY }
  // ou { pipe: [x, y, z], r, len, axis: 'x'|'z'|'y', color }
  for (const p of s.props || []) {
    const mat = new THREE.MeshStandardMaterial({ color: p.color ?? 0x333333, roughness: p.rough ?? 0.7, metalness: p.metal ?? 0 });
    if (p.emissive !== undefined) { mat.emissive = new THREE.Color(p.emissive); mat.emissiveIntensity = p.ei ?? 1; }
    let m;
    if (p.pipe) {
      m = new THREE.Mesh(new THREE.CylinderGeometry(p.r ?? 0.08, p.r ?? 0.08, p.len, 10), mat);
      if (p.axis === 'x') m.rotation.z = Math.PI / 2;
      else if (p.axis !== 'y') m.rotation.x = Math.PI / 2;
      m.position.set(...p.pipe);
    } else {
      m = new THREE.Mesh(new THREE.BoxGeometry(...p.size), mat);
      m.position.set(...p.box);
      m.rotation.y = p.rotY || 0;
    }
    m.receiveShadow = true;
    group.add(m);
  }
  return { top, room };
}
