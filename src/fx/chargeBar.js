import * as THREE from 'three';

// BARRINHA DE CARGA em cima do lutador (2026-11-20, o arremesso de lança carregado — dono: "cria-se uma barrinha curta
// em cima do personagem indicando o quanto ele já carregou, se foi o maximo"). Duas faixas que sempre olham para a
// câmera: o fundo escuro e o preenchimento, que enche da esquerda e, no máximo, fica branco e pisca.
const GEO = new THREE.PlaneGeometry(1, 1);

export function chargeBar(world, fighter, { color = 0xffc840, maxColor = 0xffffff, width = 0.8, height = 0.085 } = {}) {
  const g = new THREE.Group();
  const mat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthTest: false, depthWrite: false });
  const back = new THREE.Mesh(GEO, mat(0x0a0810, 0.8));
  back.scale.set(width + 0.05, height + 0.05, 1);
  back.renderOrder = 998;
  const fillMat = mat(color, 1);
  const fill = new THREE.Mesh(GEO, fillMat);
  fill.renderOrder = 999;
  g.add(back, fill);
  world.scene.add(g);
  const base = new THREE.Color(color);
  const top = new THREE.Color(maxColor);
  let k = 0;
  let t = 0;
  const bar = {
    full: false,
    set(v) {
      k = Math.max(0, Math.min(1, v));
      bar.full = k >= 1;
    },
    update(dt) {
      t += dt;
      const size = fighter.size || 1;
      g.position.set(fighter.pos.x, fighter.pos.y + 2.4 * size, fighter.pos.z);
      if (world.camera) g.quaternion.copy(world.camera.quaternion);
      const w = Math.max(0.001, width * k);
      fill.scale.set(w, height, 1);
      fill.position.x = -width / 2 + w / 2;
      if (bar.full) {
        // no máximo: branco piscando e um pouco maior (dá para ver sem olhar para ela)
        const p = 0.5 + 0.5 * Math.sin(t * 22);
        fillMat.color.copy(base).lerp(top, 0.55 + 0.45 * p);
        g.scale.setScalar(1.12);
      } else {
        fillMat.color.copy(base);
        g.scale.setScalar(1);
      }
    },
    dispose() {
      world.scene.remove(g);
      back.material.dispose();
      fillMat.dispose();
    },
  };
  return bar;
}
