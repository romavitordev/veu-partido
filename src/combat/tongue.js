import * as THREE from 'three';

// A RAIZ DA LÍNGUA do modelo (o Quibungo: prop_tongue em tools/blender/char_quibungo.py). A língua é um tubo que sai das
// costas e sobe curvado; no modelo em repouso a RAIZ é a ponta mais baixa dela. Guarda os vértices dessa ponta e os de
// uma faixa um pouco acima (a direção em que ela sai do corpo) e, a cada quadro, lê onde eles estão com a pose atual
// (getVertexPosition aplica os ossos). A ordem dos vértices muda na exportação (meshopt), por isso a busca é pela altura.
// Devolve () => { pos, dir } no mundo, ou null se o modelo não tiver a peça.
export function tongueRoot(rig, propName = 'tongue') {
  const prop = rig && rig.props && rig.props[propName];
  if (!prop) return null;
  let mesh = null;
  prop.traverse((o) => { if (!mesh && o.isMesh) mesh = o; });
  if (!mesh) return null;
  const P = mesh.geometry.attributes.position;
  let minY = Infinity;
  for (let i = 0; i < P.count; i++) minY = Math.min(minY, P.getY(i));
  const base = [];
  const band = [];
  for (let i = 0; i < P.count; i++) {
    const y = P.getY(i) - minY;
    if (y < 0.03) base.push(i);
    else if (y > 0.1 && y < 0.18) band.push(i);
  }
  if (!base.length) return null;
  const v = new THREE.Vector3();
  const avg = (ids, out) => {
    out.set(0, 0, 0);
    for (const i of ids) {
      if (mesh.isSkinnedMesh) mesh.getVertexPosition(i, v);
      else v.fromBufferAttribute(P, i);
      out.add(v);
    }
    out.multiplyScalar(1 / ids.length);
    return mesh.localToWorld(out);
  };
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const fn = () => {
    mesh.updateMatrixWorld();
    if (mesh.skeleton) mesh.skeleton.update(); // escondida, o renderizador não atualiza os ossos dela
    const pos = avg(base, a).clone();
    const dir = band.length ? avg(band, b).clone().sub(pos) : new THREE.Vector3(0, 1, 0);
    if (dir.lengthSq() < 1e-8) dir.set(0, 1, 0);
    return { pos, dir: dir.normalize() };
  };
  fn.material = mesh.material;
  return fn;
}
