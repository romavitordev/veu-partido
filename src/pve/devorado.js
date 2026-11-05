// OS DEVORADOS (cânone, wiki "O Espreitador" — Cópia Observada): cópias CINZENTAS de quem o Espreitador observa, com
// OLHOS AMARELOS e LÁGRIMAS. No Outro Lado eles copiam o lutador do jogador.
//  devoradoDef(def)   a definição do Devorado que luta de verdade (o "inimigo da vez", um Fighter com CPU)
//  restyleDevorado()  pinta o modelo: cinza sem textura, os olhos amarelos acesos e as lágrimas
//  copiaOpts(def)     as opções do Devorado menor (um NPC: combat/npcs.js DanteClone)
import * as THREE from 'three';

const GREY = new THREE.Color(0x6c6a66);

// sem especial, sem transformação e sem assistência: é uma cópia, não o lutador inteiro
export function devoradoDef(def, { hp = 700 } = {}) {
  return {
    ...def,
    id: 'devorado',
    copyOf: def.id,
    name: 'DEVORADO',
    color: '#8a8780',
    energyColor: 0xf2c230,
    special: undefined,
    awakening: undefined,
    hpBar: undefined,
    passives: (def.passives || []).filter((p) => !['noSanity', 'bloodPrice'].includes(p.type)),
    stats: { ...(def.stats || {}), maxHealth: hp, size: def.stats?.size ?? 1 },
    info: { ...(def.info || {}), tagline: 'Uma cópia do que ele viu.' },
  };
}

function eyeMat() {
  return new THREE.MeshBasicMaterial({ color: 0xffd84a, toneMapped: false });
}

// o modelo vira a cópia cinzenta: tira a textura, apaga a cor (fica só o tom), acende os olhos e põe as lágrimas
export function restyleDevorado(rig, { glow = 1 } = {}) {
  rig.root.traverse((m) => {
    if (!m.isMesh || !m.material) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const out = mats.map((src) => {
      const mat = src.clone();
      if (m.userData.isOutline) return mat;
      const c = mat.color ? mat.color.clone() : new THREE.Color(1, 1, 1);
      const lum = 0.3 * c.r + 0.59 * c.g + 0.11 * c.b;
      if (mat.map) { mat.map = null; }
      if (mat.vertexColors) mat.vertexColors = false;
      if (mat.color) mat.color.copy(GREY).multiplyScalar(0.55 + lum * 0.7);
      if (mat.emissive) { mat.emissive.set(0x000000); }
      mat.needsUpdate = true;
      return mat;
    });
    m.material = Array.isArray(m.material) ? out : out[0];
  });
  const head = rig.sockets && rig.sockets.head;
  if (head) {
    const g = new THREE.Group();
    g.name = 'devoradoEyes';
    const em = eyeMat();
    const tear = new THREE.MeshBasicMaterial({ color: 0x9ab0c0, transparent: true, opacity: 0.75 });
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), em);
      e.position.set(s * 0.04, 0.15, 0.115);
      g.add(e);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.28 * glow, depthWrite: false }));
      halo.position.copy(e.position);
      g.add(halo);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.07, 5), tear);
      t.position.set(s * 0.043, 0.11, 0.118);
      g.add(t);
    }
    head.add(g);
    rig.devoradoEyes = g;
  }
  return rig;
}

// o Devorado menor (NPC): o mesmo modelo repintado; golpes fracos (os três primeiros do combo do lutador)
export function copiaOpts(def, { hp = 90, damageMult = 0.42, onSlain } = {}) {
  return {
    model: def.model,
    anims: def.anims,
    strikes: def.melee.strikes.slice(0, 3),
    hp,
    damageMult,
    rise: true,
    restyle(mesh) {
      const mat = mesh.material;
      if (mesh.userData.isOutline) return;
      const c = mat.color ? mat.color.clone() : new THREE.Color(1, 1, 1);
      const lum = 0.3 * c.r + 0.59 * c.g + 0.11 * c.b;
      if (mat.map) mat.map = null;
      if (mat.vertexColors) mat.vertexColors = false;
      if (mat.color) mat.color.copy(GREY).multiplyScalar(0.5 + lum * 0.6);
      if (mat.emissive) mat.emissive.set(0x000000);
      mat.needsUpdate = true;
    },
    setup(rig) {
      const head = rig.sockets && rig.sockets.head;
      if (!head) return;
      const em = eyeMat();
      for (const s of [-1, 1]) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), em);
        e.position.set(s * 0.04, 0.15, 0.115);
        head.add(e);
      }
    },
    onSlain,
  };
}
