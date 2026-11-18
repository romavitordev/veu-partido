import * as THREE from 'three';
import { SETTINGS } from '../config/settings.js';

// SANGUE NOS FERIMENTOS (pedido do dono, 2026-11-18): efeitos NOVOS, por cima dos antigos (o FX_BLOOD das habilidades
// de sangue, o sangramento e as poças continuam iguais). Ligam e desligam em Opções → SANGUE (SETTINGS.blood).
//   1. respingo: gotas escuras saem do ponto do acerto para o lado do golpe, caem com gravidade
//   2. gotas no chão: cada gota que toca o chão vira uma manchinha que some devagar
//   3. escorrer: golpe forte deixa o ferido pingando por um instante (gotas caem do ferimento e marcam o chão)
// Leve: um pool de partículas próprio (normal, não aditivo: sangue não brilha), 48 manchas reaproveitadas com uma
// geometria e três texturas compartilhadas.

const MAX_DROPS = 500;
const MAX_STAINS = 48;
const STAIN_LIFE = 9; // segundos até a mancha sumir de vez
const FLOOR = 0.02;
const COLORS = [0x5a0008, 0x6e000c, 0x7c0410, 0x4a0006];

const VERT = `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vAlpha = aAlpha;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
// gota: miolo cheio, borda curta e um brilho úmido no alto
const FRAG = `
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.32, d) * vAlpha;
  float spec = smoothstep(0.16, 0.0, length(c - vec2(-0.13, -0.13))) * 0.35;
  gl_FragColor = vec4(vColor + spec, a);
}`;

// manchas: três desenhos (respingo, gota alongada, poça pequena), pintados uma vez e reaproveitados
let STAIN_TEX = null;
function stainTextures() {
  if (STAIN_TEX) return STAIN_TEX;
  STAIN_TEX = [0, 1, 2].map((v) => {
    const S = 128;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    let seed = 7 + v * 31;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const blob = (x, y, r, a) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(255,255,255,${a})`);
      gr.addColorStop(0.7, `rgba(255,255,255,${a * 0.9})`);
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    };
    const c = S / 2;
    if (v === 0) {
      // respingo: miolo e gotinhas em volta
      blob(c, c, 26, 1);
      for (let i = 0; i < 14; i++) {
        const a = rnd() * Math.PI * 2, d = 24 + rnd() * 34;
        blob(c + Math.cos(a) * d, c + Math.sin(a) * d, 2 + rnd() * 6, 0.95);
      }
    } else if (v === 1) {
      // gota que bateu de lado: alongada, com a cauda afinando
      for (let i = 0; i < 9; i++) blob(c - 30 + i * 8, c + Math.sin(i) * 2, 20 - i * 1.9, 1);
      for (let i = 0; i < 5; i++) blob(c + 40 + rnd() * 16, c + (rnd() - 0.5) * 18, 2 + rnd() * 3, 0.9);
    } else {
      // poça pequena de borda irregular
      for (let i = 0; i < 9; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * 16;
        blob(c + Math.cos(a) * d, c + Math.sin(a) * d, 18 + rnd() * 12, 1);
      }
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.userData.sharedMap = true; // World.dispose não libera (é reaproveitada na próxima luta)
    return tex;
  });
  return STAIN_TEX;
}

let STAIN_GEO = null;
const stainGeo = () => {
  if (!STAIN_GEO) { STAIN_GEO = new THREE.PlaneGeometry(1, 1); STAIN_GEO.rotateX(-Math.PI / 2); }
  return STAIN_GEO;
};

const tmpC = new THREE.Color();

export class WoundBlood {
  constructor(scene) {
    this.scene = scene;
    this.n = MAX_DROPS;
    this.pos = new Float32Array(MAX_DROPS * 3);
    this.vel = new Float32Array(MAX_DROPS * 3);
    this.col = new Float32Array(MAX_DROPS * 3);
    this.size = new Float32Array(MAX_DROPS);
    this.alpha = new Float32Array(MAX_DROPS);
    this.life = new Float32Array(MAX_DROPS);
    this.stainOnLand = new Uint8Array(MAX_DROPS);
    this.cursor = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    this.points = new THREE.Points(g, new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
    }));
    this.points.frustumCulled = false;
    this.points.renderOrder = 9;
    this.points.name = 'woundBloodDrops';
    scene.add(this.points);

    const tex = stainTextures();
    this.stains = [];
    for (let i = 0; i < MAX_STAINS; i++) {
      const m = new THREE.Mesh(stainGeo(), new THREE.MeshStandardMaterial({
        map: tex[i % 3], color: 0x5c0008, transparent: true, depthWrite: false, roughness: 0.35, metalness: 0,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
      }));
      m.userData.sharedGeometry = true;
      m.visible = false;
      m.renderOrder = 2;
      m.name = 'woundBloodStain';
      scene.add(m);
      this.stains.push({ mesh: m, life: 0, size: 0 });
    }
    this.stainCursor = 0;
    this.drips = []; // { follow, until, acc, rate }
    this.lastStain = new THREE.Vector3(1e9, 0, 0);
  }

  get enabled() { return SETTINGS.blood !== false; }

  drop(x, y, z, vx, vy, vz, size, life, stain = 1) {
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.n;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    tmpC.set(COLORS[(Math.random() * COLORS.length) | 0]);
    this.col[i * 3] = tmpC.r; this.col[i * 3 + 1] = tmpC.g; this.col[i * 3 + 2] = tmpC.b;
    this.size[i] = size;
    this.life[i] = life;
    this.alpha[i] = 1;
    this.stainOnLand[i] = stain;
  }

  // o acerto: p = ponto do impacto, dir = para onde o golpe empurra (XZ), power ~ 0.4 (leve) .. 2.5 (pesado)
  hit(p, dir, power = 1) {
    if (!this.enabled) return;
    const n = Math.round(6 + power * 10);
    const dx = dir ? dir.x : 0, dz = dir ? dir.z : 0;
    for (let i = 0; i < n; i++) {
      const s = (1.6 + Math.random() * 2.4) * (0.7 + power * 0.35);
      const sx = (Math.random() - 0.5) * 1.3, sz = (Math.random() - 0.5) * 1.3;
      this.drop(
        p.x + (Math.random() - 0.5) * 0.12, p.y + (Math.random() - 0.5) * 0.15, p.z + (Math.random() - 0.5) * 0.12,
        (dx * 0.9 + sx) * s, (0.35 + Math.random() * 0.9) * s, (dz * 0.9 + sz) * s,
        0.08 + Math.random() * 0.09 * (0.8 + power * 0.3), 1.6, i % 3 === 0 ? 1 : 0,
      );
    }
    // névoa fina de sangue no impacto (gotinhas pequenas e rápidas, não marcam o chão)
    for (let i = 0; i < 4 + power * 4; i++) {
      this.drop(p.x, p.y, p.z, (dx + (Math.random() - 0.5) * 2) * 2.2, Math.random() * 1.6, (dz + (Math.random() - 0.5) * 2) * 2.2, 0.05, 0.35, 0);
    }
  }

  // o ferido pinga por `time` segundos (follow() devolve o ponto do ferimento, ou null para parar)
  drip(follow, time = 1.4, rate = 7) {
    if (!this.enabled) return;
    if (this.drips.length > 6) this.drips.shift();
    this.drips.push({ follow, left: time, acc: 0, rate });
  }

  stain(x, z, size) {
    // gotas que caem quase no mesmo lugar engrossam a mancha que já está lá em vez de empilhar outra
    if (Math.hypot(x - this.lastStain.x, z - this.lastStain.z) < 0.08 && this.lastStainRef && this.lastStainRef.life > 0) {
      const s = this.lastStainRef;
      s.size = Math.min(0.55, s.size + size * 0.25);
      s.mesh.scale.setScalar(s.size);
      s.life = STAIN_LIFE;
      return;
    }
    const s = this.stains[this.stainCursor];
    this.stainCursor = (this.stainCursor + 1) % this.stains.length;
    s.life = STAIN_LIFE;
    s.size = size;
    s.mesh.visible = true;
    s.mesh.position.set(x, 0.016 + this.stainCursor * 0.0002, z);
    s.mesh.rotation.y = Math.random() * Math.PI * 2;
    s.mesh.scale.setScalar(size);
    s.mesh.material.opacity = 0.9;
    this.lastStain.set(x, 0, z);
    this.lastStainRef = s;
  }

  update(dt) {
    if (!this.enabled) {
      // desligou nas Opções no meio da luta: some tudo na hora
      if (this.any) this.clear();
      return;
    }
    this.any = true;
    for (let k = this.drips.length - 1; k >= 0; k--) {
      const d = this.drips[k];
      d.left -= dt;
      const p = d.left > 0 && d.follow();
      if (!p) { this.drips.splice(k, 1); continue; }
      d.acc += dt * d.rate;
      while (d.acc >= 1) {
        d.acc -= 1;
        this.drop(p.x + (Math.random() - 0.5) * 0.18, p.y - 0.05, p.z + (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.3, -0.2, (Math.random() - 0.5) * 0.3, 0.06 + Math.random() * 0.04, 2, 1);
      }
    }
    const P = this.pos, V = this.vel;
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.life[i] -= dt;
      const dr = Math.max(0, 1 - 0.6 * dt);
      V[i * 3] *= dr; V[i * 3 + 2] *= dr;
      V[i * 3 + 1] -= 11 * dt;
      P[i * 3] += V[i * 3] * dt; P[i * 3 + 1] += V[i * 3 + 1] * dt; P[i * 3 + 2] += V[i * 3 + 2] * dt;
      if (P[i * 3 + 1] <= FLOOR) {
        // tocou o chão: a gota vira mancha (só as que marcam; a névoa some)
        if (this.stainOnLand[i]) this.stain(P[i * 3], P[i * 3 + 2], 0.12 + this.size[i] * 1.6 + Math.random() * 0.1);
        this.life[i] = 0;
        this.alpha[i] = 0;
        continue;
      }
      this.alpha[i] = Math.min(1, this.life[i] * 4);
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.aColor.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
    g.attributes.aAlpha.needsUpdate = true;
    for (const s of this.stains) {
      if (s.life <= 0) continue;
      s.life -= dt;
      // seca: escurece e some no último terço
      const k = s.life / STAIN_LIFE;
      s.mesh.material.opacity = 0.9 * Math.min(1, k * 3);
      if (s.life <= 0) s.mesh.visible = false;
    }
  }

  clear() {
    this.any = false;
    this.life.fill(0);
    this.alpha.fill(0);
    this.points.geometry.attributes.aAlpha.needsUpdate = true;
    this.drips.length = 0;
    for (const s of this.stains) { s.life = 0; s.mesh.visible = false; }
    this.lastStainRef = null;
  }
}
