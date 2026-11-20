import * as THREE from 'three';
import { buildModel } from '../models/index.js';
import { disposeRigResources } from '../models/glbRig.js';
import { Animator } from '../anim/Animator.js';
import { buildNpcModel, ensureNpcModels } from '../models/npcRig.js';

// Gera retratos dos personagens renderizando o modelo 3D uma vez (dataURL).
// Quando houver artes oficiais, basta trocar por <img> das artes.
export function renderPortraits(roster, renderer, { w = 300, h = 400, anim: animName = 'idle', animTime = 0.3, full = false, background = true, turn = 0.35 } = {}) {
  const target = new THREE.WebGLRenderTarget(w, h, { samples: 4 });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = null;
  scene.add(new THREE.HemisphereLight(0xc8b8ff, 0x201830, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa46bff, 2.5);
  rim.position.set(-3, 2, -3);
  scene.add(rim);
  const cam = new THREE.PerspectiveCamera(26, w / h, 0.1, 20);
  if (full) {
    // corpo inteiro (tela de vitória)
    cam.position.set(0.9, 1.3, 6.2);
    cam.lookAt(0, 1.0, 0);
  } else {
    cam.position.set(0.9, 1.5, 3.6);
    cam.lookAt(0, 1.15, 0);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const pixels = new Uint8Array(w * h * 4);
  const out = {};
  const prevTarget = renderer.getRenderTarget();
  const prevClear = renderer.getClearAlpha();
  const prevClearColor = renderer.getClearColor(new THREE.Color());
  renderer.setClearColor(0x000000, 0);

  try {
    for (const def of roster) {
      // formas grandes (Deus da Morte = 2): a câmera afasta e sobe na mesma proporção
      const k = (def.stats && def.stats.size) || 1;
      if (full) { cam.position.set(0.9 * k, 1.3 * k, 6.2 * k); cam.lookAt(0, 1.0 * k, 0); }
      else { cam.position.set(0.9 * k, 1.5 * k, 3.6 * k); cam.lookAt(0, 1.15 * k, 0); }
      cam.far = 20 * k;
      cam.updateProjectionMatrix();
      const rig = buildModel(def.model);
      try {
        const anim = new Animator(rig, def.anims);
        anim.play(animName, { blend: 0 });
        anim.update(animTime);
        rig.root.rotation.y = turn;
        scene.add(rig.root);
        // ENQUADRAMENTO pela altura real da cabeça (antes a câmera era fixa para todos e cortava a cabeça dos mais altos,
        // como o Kian): o busto vai de um pouco acima da cabeça (cabelo, chifres) até a cintura
        rig.root.updateMatrixWorld(true);
        const hd = rig.joints && rig.joints.hd;
        if (hd && !full) {
          const headY = hd.getWorldPosition(new THREE.Vector3()).y;
          const view = 2 * 3.6 * k * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)); // altura visível na distância da câmera
          const yc = headY + 0.42 * k - view / 2; // o alto do quadro fica ~0,42 m acima do centro da cabeça (cabeças grandes, cabelo alto)
          cam.position.set(0.9 * k, yc + 0.35 * k, 3.6 * k);
          cam.lookAt(0, yc, 0);
        }
        renderer.setRenderTarget(target);
        renderer.clear();
        renderer.render(scene, cam);
        renderer.readRenderTargetPixels(target, 0, 0, w, h, pixels);
        const img = ctx.createImageData(w, h);
        // WebGL lê de baixo para cima
        for (let y = 0; y < h; y++) {
          img.data.set(pixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
        }
        // o canvas é reaproveitado entre personagens: limpar antes, senão o fundo (semitransparente embaixo) deixava o
        // retrato anterior aparecer como um "fantasma" atrás do personagem
        ctx.clearRect(0, 0, w, h);
        if (background) paintBackground(ctx, w, h);
        const tmp = document.createElement('canvas');
        tmp.width = w;
        tmp.height = h;
        tmp.getContext('2d').putImageData(img, 0, 0);
        ctx.drawImage(tmp, 0, 0);
        out[def.id] = canvas.toDataURL('image/png');
      } finally {
        scene.remove(rig.root);
        disposeRigResources(rig.root);
      }
    }
    return out;
  } finally {
    try {
      renderer.setRenderTarget(prevTarget);
    } finally {
      try {
        renderer.setClearColor(prevClearColor, prevClear);
      } finally {
        target.dispose();
      }
    }
  }
}

// Retrato de um NPC feito no Blender (um modelo fora do elenco jogável), usado no carregamento das fases de ondas.
export async function renderNpcPortrait(id, renderer, { w = 300, h = 400, turn = 0.35 } = {}) {
  await ensureNpcModels([id]);
  const rig = buildNpcModel(id, { outline: 0.016, noOutline: ['vein', 'fang', 'claw', 'gum', 'maw', 'spine', 'glow'] });
  if (!rig) return null;

  const target = new THREE.WebGLRenderTarget(w, h, { samples: 4 });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xc8b8ff, 0x201830, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa46bff, 2.5);
  rim.position.set(-3, 2, -3);
  scene.add(rim);
  const root = rig.root;
  root.rotation.y = turn;
  scene.add(root);
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const span = Math.max(size.x, size.y, size.z, 1);
  const cam = new THREE.PerspectiveCamera(28, w / h, 0.1, span * 8);
  const distance = (span * 0.62) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  cam.position.set(center.x + distance * 0.16, center.y + size.y * 0.08, center.z + distance);
  cam.lookAt(center.x, center.y, center.z);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const pixels = new Uint8Array(w * h * 4);
  const prevTarget = renderer.getRenderTarget();
  const prevClear = renderer.getClearAlpha();
  const prevClearColor = renderer.getClearColor(new THREE.Color());
  renderer.setClearColor(0x000000, 0);
  try {
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.readRenderTargetPixels(target, 0, 0, w, h, pixels);
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) img.data.set(pixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    paintBackground(ctx, w, h);
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    tmp.getContext('2d').putImageData(img, 0, 0);
    ctx.drawImage(tmp, 0, 0);
    return canvas.toDataURL('image/png');
  } finally {
    renderer.setRenderTarget(prevTarget);
    renderer.setClearColor(prevClearColor, prevClear);
    target.dispose();
    // buildNpcModel compartilha a geometria do GLB em cache com os NPCs da luta; aqui só liberamos materiais da instância.
    const materials = new Set();
    root.traverse((o) => {
      if (!o.material) return;
      for (const material of Array.isArray(o.material) ? o.material : [o.material]) materials.add(material);
    });
    for (const material of materials) material.dispose();
  }
}

// fundo ÚNICO para todos (v4.2.0, identidade VÉU PARTIDO — antes era a cor da equipe e a grade ficava colorida demais):
// preto arroxeado, o brilho roxo do Outro Lado atrás do personagem e uma linha carmesim no chão
function paintBackground(ctx, w, h) {
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#24133a');
  grd.addColorStop(0.6, '#150c22');
  grd.addColorStop(1, '#0a0610');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  const rad = ctx.createRadialGradient(w / 2, h * 0.34, 0, w / 2, h * 0.34, Math.max(w, h) * 0.55);
  rad.addColorStop(0, '#8a4ce07a');
  rad.addColorStop(1, '#8a4ce000');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, w, h);
  const floor = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.6);
  floor.addColorStop(0, '#c8183a40');
  floor.addColorStop(1, '#c8183a00');
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, w, h);
}

// um retrato em GRUPO (a tela de carregamento de uma fase sem chefe único, como as Assombrações do Samhain; dono,
// 2026-11-19: "faltou as imagens das assombrações na tela de carregamento, pode ter umas 3 juntas"): os modelos lado a
// lado, o do meio um passo à frente, no mesmo fundo dos retratos. `roots`: objetos já montados (o chamador os descarta).
export function renderGroupPortrait(roots, renderer, { w = 300, h = 400, top = 2.3, bottom = 0.9 } = {}) {
  const target = new THREE.WebGLRenderTarget(w, h, { samples: 4 });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xc8b8ff, 0x201830, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2, 3, 4);
  const rim = new THREE.DirectionalLight(0xa46bff, 2.5);
  rim.position.set(-3, 2, -3);
  scene.add(key, rim);
  const n = roots.length;
  roots.forEach((r, i) => {
    const off = n > 1 ? i / (n - 1) - 0.5 : 0; // -0,5 … 0,5
    r.position.set(off * 0.9, 0, Math.abs(off) < 0.01 ? 0.35 : -0.25);
    r.rotation.y = -off * 0.9;
    scene.add(r);
  });
  const cam = new THREE.PerspectiveCamera(26, w / h, 0.1, 30);
  const mid = (top + bottom) / 2;
  const dist = ((top - bottom) / 2) / Math.tan(THREE.MathUtils.degToRad(13)) + 1.4;
  cam.position.set(0.25, mid + 0.2, dist);
  cam.lookAt(0, mid, 0);
  const prevTarget = renderer.getRenderTarget();
  const prevClear = renderer.getClearAlpha();
  const prevClearColor = renderer.getClearColor(new THREE.Color());
  renderer.setClearColor(0x000000, 0);
  try {
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, cam);
    const pixels = new Uint8Array(w * h * 4);
    renderer.readRenderTargetPixels(target, 0, 0, w, h, pixels);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) img.data.set(pixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    paintBackground(ctx, w, h);
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    tmp.getContext('2d').putImageData(img, 0, 0);
    ctx.drawImage(tmp, 0, 0);
    return canvas.toDataURL('image/png');
  } finally {
    for (const r of roots) scene.remove(r);
    renderer.setRenderTarget(prevTarget);
    renderer.setClearColor(prevClearColor, prevClear);
    target.dispose();
  }
}
