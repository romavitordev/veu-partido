import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// RAIOS RÁPIDOS NO CENÁRIO (three-mesh-bvh, MIT; seção 10 do GUIA_TECNOLOGIAS_GAME_DEV.txt). Cada malha do cenário
// ganha uma árvore de caixas (BVH): o raio só testa os triângulos perto dele em vez de todos. Antes, o raio da câmera
// contra os blocos grandes (CameraRig.avoidSolids) levava ~1,6 ms no Santo Berço e na Igreja, a cada quadro nos
// especiais. Malha sem árvore continua funcionando do jeito antigo (o acceleratedRaycast cai no raycast normal).
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const MIN_TRIS = 48; // malha pequena: testar todos os triângulos já é barato

// monta a árvore das malhas de um objeto (o cenário inteiro); a árvore fica na geometria, que o cache do .glb reaproveita
export function accelerate(root) {
  if (!root) return 0;
  let n = 0;
  root.traverse((o) => {
    if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh) return;
    const g = o.geometry;
    if (!g || g.boundsTree || !g.attributes.position) return;
    const tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
    if (tris < MIN_TRIS) return;
    g.computeBoundsTree();
    n++;
  });
  return n;
}
