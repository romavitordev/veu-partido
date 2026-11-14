// OUTRO LADO — CABOS e TUBOS da Torre da TV Varminho (pedido do dono, 2026-11-14: "assim como na série, cheias de tubos e
// fios de energia/transmissão ligados"). Um cabo é um tubo que pende entre dois pontos (curva de Bézier com barriga);
// os "de transmissão" têm um brilho verde correndo por dentro. PROPOSTA: o desenho.
import * as THREE from 'three';

const RUBBER = new THREE.MeshToonMaterial({ color: 0x16181a, emissive: 0x040504 });
const CONDUIT = new THREE.MeshToonMaterial({ color: 0x3a4038, emissive: 0x060806 });

// from/to: THREE.Vector3 (no espaço do pai); sag: quanto a barriga desce; glow: cor do brilho de transmissão
export function makeCable(from, to, { sag = 0.6, r = 0.035, kind = 'rubber', glow = null, seg = 20 } = {}) {
  const mid = from.clone().lerp(to, 0.5);
  mid.y -= sag;
  const curve = new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone());
  const geo = new THREE.TubeGeometry(curve, seg, r, 6, false);
  const mesh = new THREE.Mesh(geo, kind === 'conduit' ? CONDUIT : RUBBER);
  if (glow != null) {
    // o pulso de transmissão: um tubo fino aditivo por cima, a opacidade anima em Cables.update
    const g2 = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r * 0.55, 5, false), new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    g2.userData.pulse = Math.random() * 6;
    mesh.add(g2);
  }
  return mesh;
}

// faz o brilho pulsar (chamar com o tempo)
export function pulseCables(root, t) {
  root.traverse((o) => {
    if (o.userData.pulse === undefined) return;
    o.material.opacity = 0.25 + 0.35 * Math.max(0, Math.sin(t * 3 + o.userData.pulse));
  });
}

export function disposeCables(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material && o.material !== RUBBER && o.material !== CONDUIT) o.material.dispose();
  });
}

// os feixes de cabos pendurados no teto de uma sala da Torre (paredes de 3,2 m: tools/blender/arena_torre.py HH): de
// parede a parede pelo lado curto, em grupos de 2–3, alguns com o brilho de transmissão. rects: a área andável da sala
export function torreRoomCables(world, rects, rng = Math.random) {
  const g = new THREE.Group();
  const H = 3.15;
  for (const r of rects) {
    const w = r.maxX - r.minX;
    const d = r.maxZ - r.minZ;
    if (w < 3 || d < 3) continue; // corredor estreito: só o do chão
    const alongX = w >= d; // os cabos atravessam o lado curto
    const len = alongX ? w : d;
    const runs = Math.max(1, Math.round(len / 5));
    for (let i = 0; i < runs; i++) {
      const t = (i + 0.5 + (rng() - 0.5) * 0.4) / runs;
      const n = 2 + Math.floor(rng() * 2);
      for (let j = 0; j < n; j++) {
        const off = (j - (n - 1) / 2) * 0.18;
        const a = alongX ? new THREE.Vector3(r.minX + w * t + off, H, r.minZ - 0.3) : new THREE.Vector3(r.minX - 0.3, H, r.minZ + d * t + off);
        const b = alongX ? new THREE.Vector3(r.minX + w * t + off * 1.6, H, r.maxZ + 0.3) : new THREE.Vector3(r.maxX + 0.3, H, r.minZ + d * t + off * 1.6);
        g.add(makeCable(a, b, { sag: 0.5 + rng() * 0.6, r: 0.03 + rng() * 0.025, kind: j === 0 ? 'conduit' : 'rubber', glow: j === 0 && rng() < 0.5 ? 0x5aff4a : null, seg: 24 }));
      }
    }
  }
  world.scene.add(g);
  return g;
}
