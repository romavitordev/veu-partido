import * as THREE from 'three';
import { buildModel } from '../models/index.js';
import { disposeSkeletons } from '../models/glbRig.js';
import { Animator } from '../anim/Animator.js';

// Palco 3D da seleção de personagem (estilo Storm 4): o lutador que o P1 está olhando aparece à esquerda
// do centro e o do P2 à direita, em pé e animados. Ao trocar o cursor, o novo entra deslizando da lateral;
// ao confirmar, faz a pose de vitória com um brilho no chão. Na equipe, os já escolhidos ficam atrás.
const SIDE_X = [-0.78, 0.78]; // posição de cada lado (perto do centro)
const ENTER_FROM = [-3.6, 3.6]; // de onde o modelo entra
const P_COLORS = [0x4ea3ff, 0xff4e5e];

export class SelectStage {
  constructor(roster) {
    this.roster = roster;
    this.scene = new THREE.Scene();
    // CLIMA DO MENU (dono, 2026-11-21: "todo design ultrapassado com nosso novo nivel de qualidade"): o fundo é o roxo do
    // Outro Lado com o RASGO do Véu no centro (o feixe do menu inicial), o chão com o pentagrama e cinzas subindo
    this.bgTex = riftBackdrop();
    this.scene.background = this.bgTex;
    this.scene.fog = new THREE.Fog(0x0d0816, 8, 17);
    this.cam = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 60);
    this.cam.position.set(0, 1.05, 7.2);
    this.cam.lookAt(0, 0.62, 0); // lutadores mais altos na tela: o nome e as faixas ficam embaixo (2026-11-21)
    this.scene.add(new THREE.HemisphereLight(0xc8b8ff, 0x201830, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(0, 4, 5);
    this.scene.add(key);
    // chão com o sigilo e dois círculos de luz (um por jogador)
    const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshStandardMaterial({ color: 0x140d20, roughness: 0.85 }));
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
    this.sigil = new THREE.Group();
    for (const [r, w] of [[3.2, 0.03], [2.6, 0.02], [1.6, 0.025]]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - w, r + w, 96), new THREE.MeshBasicMaterial({ color: 0x7a4ac0, transparent: true, opacity: 0.6 }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      this.sigil.add(ring);
    }
    // o pentagrama entre os anéis (como o círculo do menu) e as runas em volta
    const starPts = [];
    for (let k = 0; k <= 5; k++) { const a = (k * 2 * Math.PI * 2) / 5 - Math.PI / 2; starPts.push(new THREE.Vector3(Math.cos(a) * 2.55, 0.012, Math.sin(a) * 2.55)); }
    const star = new THREE.Line(new THREE.BufferGeometry().setFromPoints(starPts), new THREE.LineBasicMaterial({ color: 0x9a6ae0, transparent: true, opacity: 0.6 }));
    this.sigil.add(star);
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.05, k % 3 ? 0.14 : 0.26), new THREE.MeshBasicMaterial({ color: 0x7a4ac0, transparent: true, opacity: 0.55 }));
      tick.rotation.x = -Math.PI / 2;
      tick.rotation.z = -a;
      tick.position.set(Math.cos(a) * 2.9, 0.012, Math.sin(a) * 2.9);
      this.sigil.add(tick);
    }
    this.scene.add(this.sigil);
    // cinzas roxas subindo devagar
    const N = 90;
    const pos = new Float32Array(N * 3);
    this.motes = [];
    for (let k = 0; k < N; k++) {
      const m = { x: (Math.random() - 0.5) * 9, y: Math.random() * 4, z: -3 + Math.random() * 4, v: 0.12 + Math.random() * 0.25, w: Math.random() * 6 };
      this.motes.push(m);
      pos.set([m.x, m.y, m.z], k * 3);
    }
    const mg = new THREE.BufferGeometry();
    mg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.moteGeo = mg;
    this.moteObj = new THREE.Points(mg, new THREE.PointsMaterial({ color: 0xc8a0ff, size: 0.035, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.scene.add(this.moteObj);
    this.sides = [0, 1].map((s) => {
      const glow = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), new THREE.MeshBasicMaterial({ color: P_COLORS[s], transparent: true, opacity: 0.22, depthWrite: false }));
      glow.rotation.x = -Math.PI / 2;
      glow.position.set(SIDE_X[s], 0.02, 0);
      this.scene.add(glow);
      const rim = new THREE.DirectionalLight(P_COLORS[s], 2.6);
      rim.position.set(SIDE_X[s] * 3, 3, -3);
      this.scene.add(rim);
      const pulse = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
      pulse.rotation.x = -Math.PI / 2;
      pulse.position.set(SIDE_X[s], 0.03, 0);
      this.scene.add(pulse);
      return { glow, pulse, pulseT: 1, cur: null, leaving: [], back: [] };
    });
    this.cache = [new Map(), new Map()]; // um rig por personagem por lado (os dois lados podem ter o mesmo)
    this.last = performance.now();
  }

  // pega (ou monta) o modelo de um personagem para um lado
  rigFor(side, id) {
    let e = this.cache[side].get(id);
    if (!e) {
      const def = this.roster.find((d) => d.id === id);
      const rig = buildModel(def.model);
      const anim = new Animator(rig, def.anims);
      anim.play('idle', { blend: 0 });
      e = { def, rig, anim };
      this.cache[side].set(id, e);
    }
    return e;
  }

  // mostra o personagem `id` do lado `side`; `locked` = escolha confirmada (pose de vitória)
  show(side, id, locked = false) {
    const S = this.sides[side];
    if (S.cur && S.cur.id === id) {
      if (locked && !S.cur.locked) this.lock(side);
      if (!locked && S.cur.locked) { S.cur.locked = false; S.cur.e.anim.play('idle', { blend: 0.2 }); }
      return;
    }
    // o anterior sai deslizando para a lateral
    // trocas rápidas: só o último sai deslizando; os mais antigos somem na hora
    for (const l of S.leaving) this.scene.remove(l.e.rig.root);
    S.leaving = [];
    if (S.cur) S.leaving.push({ ...S.cur, t: 0 });
    const e = this.rigFor(side, id);
    // se o mesmo rig ainda estiver saindo, tira da fila de saída
    S.leaving = S.leaving.filter((l) => l.e !== e);
    e.rig.root.visible = true;
    e.rig.root.position.set(ENTER_FROM[side], 0, 0.4);
    e.rig.root.rotation.y = side === 0 ? 0.45 : -0.45; // olha um pouco para o centro
    e.rig.root.scale.setScalar(1);
    e.anim.play('run', { blend: 0 });
    this.scene.add(e.rig.root);
    S.cur = { id, e, t: 0, locked: false };
    S.glow.material.color.set(e.def.energyColor ?? P_COLORS[side]);
    if (locked) this.lock(side);
  }

  lock(side) {
    const S = this.sides[side];
    if (!S.cur) return;
    S.cur.locked = true;
    S.cur.e.anim.play('victory', { restart: true, blend: 0.1 });
    S.pulseT = 0;
    S.pulse.material.color.set(S.cur.e.def.energyColor ?? P_COLORS[side]);
  }

  // equipe: personagens já escolhidos ficam atrás, menores (assistências)
  setBack(side, ids) {
    const S = this.sides[side];
    const key = ids.join(',');
    if (S.backKey === key) return;
    S.backKey = key;
    for (const b of S.back) this.scene.remove(b.rig.root);
    S.back = ids.map((id, k) => {
      const def = this.roster.find((d) => d.id === id);
      const rig = buildModel(def.model);
      const anim = new Animator(rig, def.anims);
      anim.play('idle', { blend: 0 });
      const x = SIDE_X[side] + (side === 0 ? -1 : 1) * (0.75 + k * 0.6);
      rig.root.position.set(x, 0, -1.4 - k * 0.3);
      rig.root.rotation.y = side === 0 ? 0.6 : -0.6;
      rig.root.scale.setScalar(0.85);
      this.scene.add(rig.root);
      return { rig, anim };
    });
  }

  // TORRE / OUTRO LADO (só o P1 escolhe): o lutador fica no centro, na frente do rasgo
  sideX(s) { return this.solo && s === 0 ? 0 : SIDE_X[s]; }

  render(renderer) {
    if (this.solo) { this.sides[0].glow.position.x = 0; this.sides[0].pulse.position.x = 0; this.sides[1].glow.visible = false; }
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const size = renderer.getSize(new THREE.Vector2());
    this.cam.aspect = size.x / Math.max(1, size.y);
    // tela estreita: afasta a câmera para os dois caberem
    this.cam.position.z = this.cam.aspect < 1.2 ? 10.5 : 7.2;
    this.cam.updateProjectionMatrix();
    this.sigil.rotation.y += dt * 0.08;
    const mp = this.moteGeo.attributes.position;
    for (let k = 0; k < this.motes.length; k++) {
      const m = this.motes[k];
      m.y += m.v * dt;
      if (m.y > 4.2) { m.y = 0; m.x = (Math.random() - 0.5) * 9; }
      mp.setXYZ(k, m.x + Math.sin(now / 1400 + m.w) * 0.15, m.y, m.z);
    }
    mp.needsUpdate = true;
    for (let s = 0; s < 2; s++) {
      const S = this.sides[s];
      if (S.cur) {
        const c = S.cur;
        c.t += dt;
        const k = Math.min(1, c.t / 0.35);
        const ease = 1 - (1 - k) ** 3;
        c.e.rig.root.position.x = ENTER_FROM[s] + (this.sideX(s) - ENTER_FROM[s]) * ease;
        c.e.rig.root.position.z = 0.4 * (1 - ease);
        if (k >= 1 && !c.locked && c.e.anim.currentName !== c.e.anim.resolve('idle')) c.e.anim.play('idle', { blend: 0.15 });
        c.e.anim.update(dt);
      }
      for (const l of S.leaving) {
        l.t += dt;
        const k = Math.min(1, l.t / 0.25);
        l.e.rig.root.position.x = this.sideX(s) + (ENTER_FROM[s] - this.sideX(s)) * k * k;
        l.e.anim.update(dt);
        if (k >= 1) { this.scene.remove(l.e.rig.root); l.done = true; }
      }
      S.leaving = S.leaving.filter((l) => !l.done);
      for (const b of S.back) b.anim.update(dt);
      S.glow.material.opacity = 0.18 + Math.sin(now / 400 + s) * 0.05 + (S.cur && S.cur.locked ? 0.15 : 0);
      if (S.pulseT < 1) {
        S.pulseT = Math.min(1, S.pulseT + dt * 1.6);
        S.pulse.scale.setScalar(1 + S.pulseT * 2.2);
        S.pulse.material.opacity = 0.9 * (1 - S.pulseT);
      }
    }
    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.cam);
  }

  dispose() {
    for (const m of this.cache) for (const e of m.values()) { e.rig.root.traverse((o) => { if (o.geometry && !o.userData.sharedGeometry) o.geometry.dispose(); }); disposeSkeletons(e.rig.root); }
    for (const S of this.sides) for (const b of S.back) b.rig.root.traverse((o) => { if (o.geometry && !o.userData.sharedGeometry) o.geometry.dispose(); });
    this.cache = [new Map(), new Map()];
    if (this.bgTex) this.bgTex.dispose();
    if (this.moteGeo) this.moteGeo.dispose();
  }
}

// o fundo: roxo escuro, um brilho embaixo do centro e o rasgo vertical do Véu (o mesmo feixe do menu inicial)
function riftBackdrop() {
  const W = 512, H = 288;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#07050c';
  g.fillRect(0, 0, W, H);
  let r = g.createRadialGradient(W / 2, H * 0.78, 10, W / 2, H * 0.78, W * 0.55);
  r.addColorStop(0, 'rgba(110,50,170,.55)');
  r.addColorStop(0.5, 'rgba(50,20,90,.35)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, W, H);
  r = g.createRadialGradient(W / 2, H * 0.3, 4, W / 2, H * 0.3, W * 0.2);
  r.addColorStop(0, 'rgba(164,107,255,.28)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, W, H);
  // o rasgo: uma linha que treme, com o brilho em volta
  const path = () => {
    g.beginPath();
    let x = W / 2;
    g.moveTo(x, 0);
    for (let y = 8; y <= H * 0.72; y += 8) { x = W / 2 + Math.sin(y * 0.09) * 2.2 + (Math.random() - 0.5) * 2.4; g.lineTo(x, y); }
  };
  g.lineCap = 'round';
  for (const [w, c] of [[14, 'rgba(120,50,220,.10)'], [7, 'rgba(150,80,255,.22)'], [3, 'rgba(200,150,255,.55)'], [1.2, 'rgba(245,235,255,.9)']]) {
    g.strokeStyle = c;
    g.lineWidth = w;
    path();
    g.stroke();
  }
  const v = g.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, 'rgba(4,2,8,.55)');
  v.addColorStop(0.25, 'rgba(0,0,0,0)');
  v.addColorStop(0.7, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(4,2,8,.8)');
  g.fillStyle = v;
  g.fillRect(0, 0, W, H);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
