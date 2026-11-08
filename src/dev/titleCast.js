// ARTE DO ELENCO DA TELA INICIAL (dev): renderiza a "key art" com os modelos do jogo e baixa o public/title/elenco.webp
// (o fundo estático do index.html usa essa imagem; a tela inicial não carrega modelo nenhum). Não faz parte do jogo.
// No console do `npm run dev`, depois que o menu aparecer (modelos carregados):
//   const T = await import('/src/dev/titleCast.js'); T.download()
// e troque o public/title/elenco.webp pelo arquivo baixado. Se o módulo dos modelos foi carregado pela página com outra
// versão (?t=...), passe os módulos da página: T.download({ buildModel, ROSTER, Animator, THREE }) — senão os modelos
// aparecem como "não carregados" (outra cópia do módulo).
import * as THREE0 from 'three';
import { buildModel as build0 } from '../models/index.js';
import { Animator as Anim0 } from '../anim/Animator.js';
import { ROSTER as ROSTER0 } from '../characters/index.js';

// FRENTE (iluminados): um herói de cada grupo, a Ordo Realitas no centro
const FRONT = [
  { id: 'gaius', x: -3.6, z: -0.9, yaw: 0.45 }, // Ordo Calamitas
  { id: 'dara', x: -2.4, z: -0.45, yaw: 0.32 }, // Os Cinco
  { id: 'kian', x: -1.2, z: -0.12, yaw: 0.16 }, // Escriptas
  { id: 'arthur', x: 0, z: 0.1, yaw: 0 }, // Ordo Realitas
  { id: 'jae', x: 1.2, z: -0.12, yaw: -0.16 }, // Mascarados
  { id: 'arnaldo', x: 2.4, z: -0.45, yaw: -0.32 }, // Portadores
  { id: 'cristino', x: 3.6, z: -0.9, yaw: -0.45 }, // Transtornados
];
// ATRÁS (silhuetas grandes, só o contorno na cor do poder): os vilões
const BACK = [
  { id: 'raziel', x: -5.2, z: -5.6, yaw: 0.35, s: 1.85 }, // Vampiros
  { id: 'o_diabo', x: -1.9, z: -6.4, yaw: 0.12, s: 2.05 }, // Relíquias
  { id: 'degolificada', x: 1.9, z: -6.4, yaw: -0.12, s: 2.0 }, // Outro Lado
  { id: 'espreitador', x: 6.0, z: -5.6, yaw: -0.35, s: 1.75 }, // Outro Lado
];

function place(sc, list, deps, rimPower, out) {
  const { THREE, buildModel, Animator, ROSTER } = deps;
  for (const L of list) {
    const def = ROSTER.find((d) => d.id === L.id);
    if (!def) { out.push('sem ' + L.id); continue; }
    let rig;
    try { rig = buildModel(def.model); } catch (e) { out.push(L.id + ': ' + e.message); continue; }
    const anim = new Animator(rig, def.anims);
    anim.play('idle', { blend: 0 });
    anim.update(0.6);
    rig.root.position.set(L.x, 0, L.z);
    rig.root.rotation.y = L.yaw;
    if (L.s) rig.root.scale.setScalar(L.s);
    sc.add(rig.root);
    // o contorno na cor do poder: luz forte de trás e de cima
    const rim = new THREE.SpotLight(def.energyColor ?? 0xa46bff, rimPower, 14 * (L.s || 1), 0.6, 0.6, 1.2);
    rim.position.set(L.x * 1.1, 4 * (L.s || 1), L.z - 2.6 * (L.s || 1));
    rim.target.position.set(L.x, 1.1 * (L.s || 1), L.z);
    sc.add(rim, rim.target);
  }
}

export function render(deps = {}, W = 2800, H = 1150) {
  const D = { THREE: THREE0, buildModel: build0, Animator: Anim0, ROSTER: ROSTER0, ...deps };
  const { THREE } = D;
  const out = [];
  const cv = document.createElement('canvas');
  const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1);
  r.setSize(W, H, false);
  r.setClearColor(0x000000, 0);
  r.autoClear = false;
  // atrás: quase sem luz (silhueta roxa) e o contorno forte
  const back = new THREE.Scene();
  // SILHUETA: todos com o mesmo material escuro que só acende onde a luz de contorno bate
  back.overrideMaterial = new THREE.MeshLambertMaterial({ color: 0x2a1c40 });
  back.add(new THREE.HemisphereLight(0x6a4aa0, 0x050308, 0.5));
  place(back, BACK, D, 900, out);
  // frente: luz de frente fria + contorno
  const front = new THREE.Scene();
  front.add(new THREE.HemisphereLight(0x7a6aaa, 0x0a0812, 1.15));
  const key = new THREE.DirectionalLight(0xf0e6ff, 1.7);
  key.position.set(-2.5, 4, 8);
  front.add(key);
  const fill = new THREE.DirectionalLight(0xff6a8a, 0.5);
  fill.position.set(4, 1.5, 4);
  front.add(fill);
  place(front, FRONT, D, 110, out);
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 80);
  cam.position.set(0, 1.35, 8.6);
  cam.lookAt(0, 1.9, -1.2);
  cam.updateProjectionMatrix();
  r.clear();
  r.render(back, cam);
  r.clearDepth();
  r.render(front, cam);
  // recorta o vazio em volta (caixa do alfa + margem) para a imagem não carregar transparência à toa
  const c2 = document.createElement('canvas');
  c2.width = W; c2.height = H;
  const g = c2.getContext('2d');
  g.drawImage(cv, 0, 0);
  const px = g.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    if (px[(y * W + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const m = 24;
  x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W, x1 + m); y1 = Math.min(H, y1 + 4);
  const c3 = document.createElement('canvas');
  c3.width = x1 - x0; c3.height = y1 - y0;
  c3.getContext('2d').drawImage(c2, x0, y0, c3.width, c3.height, 0, 0, c3.width, c3.height);
  const url = c3.toDataURL('image/webp', 0.9);
  out.push(`${c3.width}x${c3.height}`);
  r.dispose();
  return { url, out };
}

export function download(deps) {
  const a = document.createElement('a');
  a.href = render(deps).url;
  a.download = 'elenco.webp';
  a.click();
}
