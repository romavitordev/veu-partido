// DECALQUES NO CHÃO (TODO "Melhoria de Gráficos — Parte 2b"; docs/AUDITORIA-MAPAS.md: "o detalhe vai no CHÃO —
// marcas, sangue, rachaduras — em vez de chão de uma cor só"; a área de luta continua livre para os golpes e a câmera).
// Cada mapa tem a sua receita (DECALS): o tipo, quantos e o tamanho. Os desenhos são pintados aqui em canvas (sem
// download), transparentes, e deitados no chão da luta (y = 0, onde os lutadores pisam), espalhados em volta do meio
// entre os dois pontos de partida, dentro da área andável e fora dos obstáculos. A semente é o nome do mapa: o mesmo
// mapa tem sempre os mesmos decalques. PROPOSTA (não é cânone): o que suja cada chão saiu da descrição do cenário.
import * as THREE from 'three';
import { inBounds } from '../combat/positioning.js';

const S = 256; // resolução de cada desenho

function rng(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// uma mancha irregular: círculos sobrepostos em volta do centro, a borda macia
function blob(g, r, n, rad, color, alpha) {
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = r() * rad * 0.55;
    const x = S / 2 + Math.cos(a) * d, y = S / 2 + Math.sin(a) * d, rr = rad * (0.25 + r() * 0.4);
    const gr = g.createRadialGradient(x, y, rr * 0.2, x, y, rr);
    gr.addColorStop(0, `rgba(${color},${alpha})`);
    gr.addColorStop(0.7, `rgba(${color},${alpha * 0.8})`);
    gr.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill();
  }
}

const PAINT = {
  // sangue velho: a poça seca escura e os respingos em volta
  blood(g, r) {
    blob(g, r, 10, 96, '88,10,12', 0.75);
    blob(g, r, 5, 48, '50,4,6', 0.65);
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = 70 + r() * 50, rr = 2 + r() * 7;
      g.fillStyle = `rgba(96,12,14,${0.5 + r() * 0.4})`;
      g.beginPath(); g.arc(S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d, rr, 0, Math.PI * 2); g.fill();
    }
  },
  // rachadura: galhos que saem do centro e afinam
  crack(g, r) {
    g.lineCap = 'round';
    const branch = (x, y, a, len, w, depth) => {
      if (depth > 4 || len < 6) return;
      let px = x, py = y;
      const steps = 5;
      g.strokeStyle = `rgba(14,12,12,${0.55 + r() * 0.3})`;
      g.lineWidth = w;
      g.beginPath(); g.moveTo(px, py);
      for (let k = 0; k < steps; k++) {
        a += (r() - 0.5) * 0.7;
        px += Math.cos(a) * len / steps; py += Math.sin(a) * len / steps;
        g.lineTo(px, py);
      }
      g.stroke();
      const kids = 1 + Math.floor(r() * 2.2);
      for (let k = 0; k < kids; k++) branch(px, py, a + (r() - 0.5) * 1.4, len * 0.62, Math.max(0.8, w * 0.6), depth + 1);
    };
    const arms = 3 + Math.floor(r() * 2);
    for (let i = 0; i < arms; i++) branch(S / 2, S / 2, (i / arms) * Math.PI * 2 + r(), 60 + r() * 30, 3.6, 0);
  },
  // queimado: o centro preto que some em fuligem
  scorch(g, r) {
    blob(g, r, 7, 90, '20,16,14', 0.55);
    blob(g, r, 4, 40, '6,4,4', 0.7);
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(30,24,20,${r() * 0.35})`;
      g.fillRect(S / 2 + (r() - 0.5) * 200, S / 2 + (r() - 0.5) * 200, 2 + r() * 4, 2 + r() * 4);
    }
  },
  // mancha de óleo: escura, com o reflexo azulado da borda
  oil(g, r) {
    blob(g, r, 8, 78, '16,16,20', 0.72);
    g.strokeStyle = 'rgba(70,90,120,0.22)'; g.lineWidth = 5;
    g.beginPath(); g.ellipse(S / 2, S / 2, 58 + r() * 12, 48 + r() * 10, r() * 3, 0, Math.PI * 2); g.stroke();
  },
  // terra/lama: a mancha marrom com grãos
  dirt(g, r, c = '74,54,34', alpha = 0.62) {
    blob(g, r, 12, 100, c, alpha);
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(${c},${0.2 + r() * 0.4})`;
      g.beginPath(); g.arc(S / 2 + (r() - 0.5) * 180, S / 2 + (r() - 0.5) * 180, 1 + r() * 2.5, 0, Math.PI * 2); g.fill();
    }
  },
  mud(g, r) { PAINT.dirt(g, r, '62,48,32', 0.42); }, // mais claro e fino que a terra: à noite não vira buraco
  // poça d'água: escura, a borda clara (o céu refletido)
  puddle(g, r) {
    blob(g, r, 8, 84, '46,60,78', 0.42);
    const sky = g.createLinearGradient(S / 2 - 60, S / 2 - 50, S / 2 + 40, S / 2 + 40); // o céu refletido
    sky.addColorStop(0, 'rgba(150,175,205,0.28)'); sky.addColorStop(1, 'rgba(150,175,205,0)');
    g.fillStyle = sky; g.beginPath(); g.ellipse(S / 2, S / 2, 56, 42, -0.3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(190,210,230,0.35)'; g.lineWidth = 3;
    g.beginPath(); g.ellipse(S / 2 - 8, S / 2 - 6, 50, 34, -0.3, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
  },
  // folhas caídas (as cores vêm da receita)
  leaves(g, r, colors = ['#7a5a26', '#9a6a2a', '#5a4a24', '#6a7a30']) {
    for (let i = 0; i < 16; i++) {
      const x = 30 + r() * (S - 60), y = 30 + r() * (S - 60), a = r() * Math.PI * 2, l = 10 + r() * 9;
      g.save(); g.translate(x, y); g.rotate(a);
      g.fillStyle = colors[Math.floor(r() * colors.length)];
      g.globalAlpha = 0.85;
      g.beginPath(); g.ellipse(0, 0, l, l * 0.45, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(30,20,10,0.5)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(-l, 0); g.lineTo(l + 4, 0); g.stroke();
      g.restore();
    }
  },
  // marcas arrastadas (pés, lâminas, garras): riscos paralelos
  scratch(g, r) {
    g.lineCap = 'round';
    const a = r() * Math.PI, n = 3 + Math.floor(r() * 3), len = 120 + r() * 70;
    for (let i = 0; i < n; i++) {
      const off = (i - n / 2) * 12;
      const cx = S / 2 + Math.cos(a + Math.PI / 2) * off, cy = S / 2 + Math.sin(a + Math.PI / 2) * off;
      g.strokeStyle = `rgba(28,22,18,${0.6 + r() * 0.3})`; g.lineWidth = 3.5 + r() * 3;
      g.beginPath();
      g.moveTo(cx - Math.cos(a) * len / 2, cy - Math.sin(a) * len / 2);
      g.quadraticCurveTo(cx + (r() - 0.5) * 20, cy + (r() - 0.5) * 20, cx + Math.cos(a) * len / 2, cy + Math.sin(a) * len / 2);
      g.stroke();
    }
  },
};

const LEAF_AUTUMN = ['#7a5a26', '#9a6a2a', '#a8462a', '#5a4a24'];
const LEAF_GREEN = ['#4a6a2a', '#5a7a30', '#6a5a26', '#3e5a24'];

// a receita de cada mapa: [tipo, quantos, tamanho mín., tamanho máx. (m)] — e as cores das folhas
export const DECALS = {
  coliseu: { items: [['blood', 4, 1.0, 1.8], ['scratch', 6, 1.4, 2.4], ['dirt', 4, 2, 3.2]] }, // a areia das lutas
  orfanato: { items: [['leaves', 7, 1.2, 2.0], ['dirt', 3, 1.8, 2.8]], leaves: LEAF_GREEN },
  orfanato_noite: { items: [['puddle', 5, 1.4, 2.6], ['leaves', 5, 1.2, 2.0], ['mud', 3, 1.6, 2.6]], leaves: LEAF_GREEN },
  suvaco: { items: [['oil', 3, 0.8, 1.4], ['crack', 3, 1.2, 2.0], ['blood', 1, 0.6, 1.0]] }, // briga de bar
  santo_berco: { items: [['crack', 4, 1.4, 2.4], ['dirt', 3, 1.8, 2.6], ['leaves', 2, 1.0, 1.6]], leaves: LEAF_AUTUMN },
  acampamento: { items: [['dirt', 4, 2, 3], ['leaves', 6, 1.2, 2.0], ['scorch', 1, 1.2, 1.6]], leaves: LEAF_GREEN },
  igreja: { items: [['crack', 4, 1.4, 2.4], ['blood', 2, 0.8, 1.4], ['dirt', 2, 1.6, 2.4]] },
  igreja_dia: { items: [['crack', 4, 1.4, 2.4], ['blood', 1, 0.8, 1.2], ['leaves', 3, 1.0, 1.6]], leaves: LEAF_AUTUMN },
  palco: { items: [['scorch', 2, 1.2, 2.0], ['scratch', 4, 1.4, 2.2], ['blood', 2, 0.8, 1.4]] },
  tipora: { items: [['puddle', 3, 1.4, 2.4], ['leaves', 6, 1.2, 2.0], ['mud', 3, 1.8, 2.8]], leaves: LEAF_GREEN },
  ferro_velho: { items: [['oil', 6, 1.0, 2.0], ['crack', 3, 1.4, 2.2], ['scratch', 3, 1.4, 2.2]] },
  ferro_velho_dia: { items: [['oil', 6, 1.0, 2.0], ['crack', 3, 1.4, 2.2], ['dirt', 3, 2, 3]] },
  circo: { items: [['blood', 3, 0.8, 1.4], ['scratch', 3, 1.4, 2.2], ['scorch', 1, 1.0, 1.4], ['dirt', 2, 1.8, 2.6]] },
  circo_noite: { items: [['blood', 3, 0.8, 1.4], ['scratch', 3, 1.4, 2.2], ['puddle', 2, 1.2, 2.0], ['scorch', 1, 1.0, 1.4]] },
  passaros: { items: [['leaves', 7, 1.2, 2.0], ['dirt', 3, 1.8, 2.8]], leaves: LEAF_GREEN },
  passaros_noite: { items: [['leaves', 5, 1.2, 2.0], ['puddle', 3, 1.4, 2.4], ['mud', 2, 1.8, 2.6]], leaves: LEAF_GREEN },
  treb_ciach: { items: [['leaves', 7, 1.2, 2.0], ['mud', 3, 1.8, 2.8], ['scorch', 1, 1.0, 1.4]], leaves: LEAF_AUTUMN }, // o Samhain
  treb_ciach_tempestade: { items: [['puddle', 6, 1.4, 2.8], ['mud', 4, 2, 3], ['leaves', 3, 1.0, 1.6]], leaves: LEAF_AUTUMN },
  mansao_luta: { items: [['blood', 2, 0.6, 1.2], ['scratch', 3, 1.0, 1.8]] }, // o assoalho do quarto
  escola_luta: { items: [['blood', 3, 0.8, 1.4], ['crack', 3, 1.2, 2.0], ['scorch', 2, 1.0, 1.6]] }, // o bunker do ritual
};

// os desenhos ficam guardados (uma vez por tipo e cor) e passam de uma luta para a outra
const TEX = new Map();
function texture(kind, leaves) {
  const key = kind === 'leaves' ? `leaves:${leaves.join()}` : kind;
  if (TEX.has(key)) return TEX.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  // três variações por tipo, lado a lado num atlas 3 × 1 (cada decalque usa uma)
  const atlas = document.createElement('canvas');
  atlas.width = S * 3; atlas.height = S;
  const ga = atlas.getContext('2d');
  for (let v = 0; v < 3; v++) {
    g.clearRect(0, 0, S, S);
    const r = rng(`${key}#${v}`);
    if (kind === 'leaves') PAINT.leaves(g, r, leaves); else PAINT[kind](g, r);
    ga.drawImage(c, v * S, 0);
  }
  const t = new THREE.CanvasTexture(atlas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  TEX.set(key, t);
  return t;
}

const GEO = [0, 1, 2].map((v) => {
  const geo = new THREE.PlaneGeometry(1, 1);
  geo.rotateX(-Math.PI / 2);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) + v) / 3);
  return geo;
});

function blocked(arena, x, z, rad) {
  for (const c of arena.colliders || []) if (Math.hypot(x - c.x, z - c.z) < (c.r || 0.5) + rad * 0.3) return true;
  for (const b of arena.boxes || []) if (x > b.minX - rad * 0.3 && x < b.maxX + rad * 0.3 && z > b.minZ - rad * 0.3 && z < b.maxZ + rad * 0.3) return true;
  return false;
}

// põe os decalques do mapa no chão; devolve o grupo (ou null se o mapa não tem receita)
export function addGroundDecals(arena, arenaId, parent) {
  const recipe = DECALS[arenaId];
  if (!recipe || !arena || !parent || typeof document === 'undefined') return null;
  const group = new THREE.Group();
  group.name = 'DECAL_ground';
  const r = rng(arenaId);
  const sp = arena.spawns || [{ x: -3, z: 0 }, { x: 3, z: 0 }];
  const cx = (sp[0].x + sp[1].x) / 2, cz = (sp[0].z + sp[1].z) / 2;
  const reach = Math.min(10, (arena.radius || 12) * 0.7);
  let layer = 0;
  for (const [kind, count, s0, s1] of recipe.items) {
    const map = texture(kind, recipe.leaves || LEAF_AUTUMN);
    const mat = new THREE.MeshStandardMaterial({
      map, transparent: true, depthWrite: false, roughness: kind === 'puddle' || kind === 'oil' ? 0.6 : 1, metalness: 0,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    map.userData.sharedMap = true; // o World.dispose não apaga: o desenho volta na próxima luta
    for (let i = 0; i < count; i++) {
      const size = s0 + r() * (s1 - s0);
      let x = 0, z = 0, ok = false;
      for (let tries = 0; tries < 24 && !ok; tries++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * reach;
        x = cx + Math.cos(a) * d; z = cz + Math.sin(a) * d;
        ok = inBounds(arena, x, z, size * 0.3) && !blocked(arena, x, z, size);
      }
      if (!ok) continue;
      const m = new THREE.Mesh(GEO[Math.floor(r() * 3)], mat);
      m.userData.sharedGeometry = true;
      m.position.set(x, 0.012 + (layer++ % 8) * 0.0015, z); // um pouco acima do chão, sem brigar entre si
      m.rotation.y = r() * Math.PI * 2;
      m.scale.set(size, 1, size * (0.8 + r() * 0.4));
      m.receiveShadow = true;
      m.castShadow = false;
      m.renderOrder = 1;
      group.add(m);
    }
  }
  parent.add(group);
  return group;
}
