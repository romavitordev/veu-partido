import * as THREE from 'three';
import { buildExistido } from '../models/beasts.js';

// A VIDA DA NOITE nos cenários (pedido do dono, 2026-11-12: o Orfanato Santa Menefreda à noite). Três peças da config:
//   windows   — vidros acesos atrás das janelas do .glb, alguns piscando: [{ pos, size, flicker, rotY }]
//   lightning — relâmpagos no céu escuro: o céu inteiro clareia em dois ou três estalos e um raio risca ao longe
//   walkers   — EXISTIDOS andando devagar pelo lado de FORA da área de luta (nunca entram), com os olhos e as escritas
//               do corpo brilhando em dourado: [{ arc: [ângulo0, ângulo1], radius, speed }] — vão e voltam no arco

// ---------------------------------------------------------------- janelas
export function makeWindows(group, list, { color = 0xffd890, emissive = 0xffa040 } = {}) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const panes = list.map((w) => {
    const mat = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: w.intensity ?? 2.2, roughness: 0.4 });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...w.pos);
    m.scale.set(...w.size);
    m.rotation.y = w.rotY || 0;
    group.add(m);
    return { m, base: mat.emissiveIntensity, flicker: !!w.flicker, seed: Math.random() * 100, off: 0 };
  });
  return {
    update(dt, time) {
      for (const p of panes) {
        if (!p.flicker) continue;
        // pisca de verdade: apagões curtos e irregulares, às vezes some por um tempo
        if (p.off > 0) p.off -= dt;
        else if (Math.random() < dt * 0.25) p.off = 0.3 + Math.random() * 1.6;
        const buzz = Math.sin(time * 31 + p.seed) * Math.sin(time * 13.7 + p.seed * 2) > 0.8 ? 0.2 : 1;
        p.m.material.emissiveIntensity = p.off > 0 ? 0.05 : p.base * buzz * (0.85 + Math.sin(time * 7 + p.seed) * 0.15);
      }
    },
  };
}

// ---------------------------------------------------------------- relâmpagos
export function makeLightning(group, o = {}) {
  const color = new THREE.Color(o.color ?? 0xd8e0ff);
  const flash = new THREE.HemisphereLight(color, 0x202030, 0);
  group.add(flash);
  // o céu clareando: uma esfera por dentro, transparente, na frente do céu pintado e atrás de tudo
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(o.domeRadius ?? 150, 24, 12),
    new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, transparent: true, opacity: 0, depthWrite: false, fog: false }),
  );
  dome.renderOrder = -1;
  group.add(dome);
  const boltMat = new THREE.MeshBasicMaterial({ color: 0xf4f6ff, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  let bolt = null;
  const [i0, i1] = o.interval ?? [5, 12];
  let wait = 2 + Math.random() * 3;
  let t = -1;
  let pattern = [];

  // um raio em zigue-zague (tira de quadriláteros) ao longe, virado para o centro
  function newBolt() {
    if (bolt) { group.remove(bolt); bolt.geometry.dispose(); }
    const a = (o.arc ? o.arc[0] + Math.random() * (o.arc[1] - o.arc[0]) : Math.random() * Math.PI * 2);
    const r = o.distance ?? 110;
    const cx = Math.sin(a) * r, cz = Math.cos(a) * r;
    const pts = [];
    let x = 0, y = o.top ?? 70;
    const bottom = o.bottom ?? 12;
    while (y > bottom) { pts.push([x, y]); y -= 4 + Math.random() * 6; x += (Math.random() - 0.5) * 9; }
    pts.push([x, bottom]);
    const pos = [];
    const w = 0.9;
    for (let i = 0; i < pts.length - 1; i++) {
      const [xa, ya] = pts[i], [xb, yb] = pts[i + 1];
      const wa = w * (1 - i / pts.length) + 0.3, wb = w * (1 - (i + 1) / pts.length) + 0.3;
      pos.push(xa - wa, ya, 0, xa + wa, ya, 0, xb + wb, yb, 0, xa - wa, ya, 0, xb + wb, yb, 0, xb - wb, yb, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    bolt = new THREE.Mesh(g, boltMat);
    bolt.position.set(cx, 0, cz);
    bolt.lookAt(0, 0, 0);
    bolt.renderOrder = 0;
    group.add(bolt);
  }

  return {
    update(dt) {
      if (t < 0) {
        wait -= dt;
        if (wait <= 0) {
          t = 0;
          newBolt();
          // dois ou três estalos: [início, duração, força]
          pattern = [[0, 0.09, 1], [0.16, 0.07, 0.6]];
          if (Math.random() < 0.5) pattern.push([0.32, 0.22, 0.85]);
        }
      }
      let k = 0;
      if (t >= 0) {
        t += dt;
        for (const [s, d, f] of pattern) if (t >= s && t < s + d) k = Math.max(k, f * (1 - (t - s) / d * 0.5));
        const end = pattern[pattern.length - 1];
        if (t > end[0] + end[1] + 0.05) { t = -1; wait = i0 + Math.random() * (i1 - i0); }
      }
      flash.intensity = k * (o.intensity ?? 2.6);
      dome.material.opacity = k * (o.skyOpacity ?? 0.35);
      boltMat.opacity = k > 0.5 ? 1 : k * 1.6;
    },
  };
}

// ---------------------------------------------------------------- Existidos
// as escritas da pele (tools/blender/tex/existido_texto.png: letra escura sobre pele clara) viram a máscara do brilho
let tattooTex = null;
function tattooGlowMap(map) {
  if (tattooTex) return tattooTex;
  const img = map && map.image;
  if (!img || !img.width) return null;
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const lum = (px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11) / 255;
    const k = lum < 0.22 ? 1 : lum < 0.34 ? (0.34 - lum) / 0.12 : 0; // só o traço mais escuro da letra (a escrita é densa)
    px[i] = 255 * k; px[i + 1] = 214 * k; px[i + 2] = 90 * k; px[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  tattooTex = new THREE.CanvasTexture(c);
  tattooTex.colorSpace = THREE.SRGBColorSpace;
  tattooTex.flipY = map.flipY;
  tattooTex.wrapS = map.wrapS; tattooTex.wrapT = map.wrapT;
  return tattooTex;
}

const CROUCH = { hip: -0.06, knee: 0.18, chest: 0.16, neck: -0.08 }; // quase ereto (humano), um pouco curvado
const GOLD = new THREE.Color(0xffc040);

export function makeWalkers(group, list) {
  const walkers = [];
  for (const w of list) {
    let model;
    try { model = buildExistido(w.kind || 'existido'); } catch (e) { console.warn('Existido do cenário indisponível', e); continue; }
    const glowMats = [];
    model.root.traverse((o) => {
      if (!o.isMesh || o.userData.isOutline || !o.material) return;
      const m = o.material;
      const n = m.name || '';
      if (n.includes('olho') || n.includes('pupila')) { // os olhos brancos vazios acesos em amarelo
        m.color = new THREE.Color(0xfff0b0);
        m.emissive = GOLD.clone();
        m.emissiveIntensity = 3;
        glowMats.push({ m, base: 3 });
      } else if (m.map && (n.includes('pele') || n.includes('cranio'))) { // as escritas da pele acesas
        const em = tattooGlowMap(m.map);
        if (em) {
          m.emissive = GOLD.clone();
          m.emissiveMap = em;
          m.emissiveIntensity = 2.2;
          m.needsUpdate = true;
          glowMats.push({ m, base: 2.2 });
        }
      }
      o.castShadow = false;
    });
    model.root.scale.setScalar(w.scale ?? 1);
    group.add(model.root);
    walkers.push({
      model, glowMats,
      a0: w.arc[0], a1: w.arc[1], r: w.radius, wobble: w.wobble ?? 0.6, speed: w.speed ?? 0.9,
      u: Math.random(), dir: Math.random() < 0.5 ? 1 : -1, pause: 0,
      gait: Math.random() * 10, seed: Math.random() * 10,
    });
  }

  return {
    update(dt, time) {
      for (const W of walkers) {
        const len = Math.abs(W.a1 - W.a0) * W.r;
        let moving = 1;
        if (W.pause > 0) { W.pause -= dt; moving = 0; }
        else {
          W.u += (W.speed * dt / len) * W.dir;
          if (W.u > 1 || W.u < 0) { W.u = Math.min(1, Math.max(0, W.u)); W.dir *= -1; W.pause = 1.5 + Math.random() * 3; }
        }
        const a = W.a0 + (W.a1 - W.a0) * W.u;
        const r = W.r + Math.sin(time * 0.3 + W.seed) * W.wobble;
        const root = W.model.root;
        root.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
        // de frente para onde anda (tangente do arco); parado, vira a cabeça para o pátio
        const tang = a + (W.a1 > W.a0 ? 1 : -1) * W.dir * Math.PI / 2;
        const want = moving ? tang : Math.atan2(-root.position.x, -root.position.z);
        let d = want - root.rotation.y;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        root.rotation.y += d * Math.min(1, dt * 2.5);
        W.gait += W.speed * dt * moving;
        // o passo lento e arrastado do Existido (a pose do BloodZombie, mais ereta)
        const J = W.model.joints;
        const ph = W.gait * 3.0;
        const s1 = Math.sin(ph);
        const chest = CROUCH.chest + Math.sin(time * 1.4 + W.seed) * 0.05;
        J.chest.rotation.set(chest, Math.sin(ph) * 0.08 * moving, Math.sin(time * 1.1 + W.seed) * 0.06);
        for (const [i, l] of J.legs.entries()) {
          const s = i ? -s1 : s1;
          l.hip.rotation.set(CROUCH.hip - chest + s * 0.4 * moving, 0, (i ? -1 : 1) * 0.08);
          l.knee.rotation.x = CROUCH.knee + Math.max(0, -s) * 0.5 * moving;
        }
        J.neck.rotation.set(CROUCH.neck + Math.sin(time * 0.9 + W.seed) * 0.12, Math.sin(time * 0.6 + W.seed) * 0.35, Math.sin(time * 0.7) * 0.1);
        if (J.jaw) J.jaw.rotation.x = 0.2 + Math.sin(time * 2.1 + W.seed) * 0.12;
        const armBase = -chest - 0.05;
        J.armL.sh.rotation.set(armBase - s1 * 0.35 * moving, 0, 0.25);
        J.armR.sh.rotation.set(armBase + s1 * 0.35 * moving, 0, -0.25);
        J.armL.el.rotation.x = -0.35;
        J.armR.el.rotation.x = -0.35;
        // as escritas pulsam devagar, cada Existido no seu tempo
        const pulse = 0.75 + Math.sin(time * 1.8 + W.seed * 3) * 0.25;
        for (const g of W.glowMats) g.m.emissiveIntensity = g.base * pulse;
      }
    },
  };
}
