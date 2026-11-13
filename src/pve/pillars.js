// A SALA DAS PILASTRAS — a Torre da TV Varminho, 5º andar (Os Becos). Pedido do dono (2026-11-13): "uma sala onde terá
// que fazer um parkour [...] pular numas pilastras pra não cair num precipício e quando caem eles caem do céu voltando
// pro início e tomam dano. E quando voltarem depois de cair as pilastras mudam sua posição. No multiplayer os dois teriam
// que cair." Base canônica: a sala dos buracos do ep. 7 de Sinais do Outro Lado (o Lírio pulou num buraco e caiu do alto
// no caminho, machucado). Leitura do coop (PROPOSTA): quando um cai, os DOIS voltam e o caminho muda para os dois.
// Medidas (skill level-design): o pulo do jogo (COMBAT.jumpVelocity 11,5, gravidade 32, corrida 7,5) alcança ~5,4 m
// correndo; os vãos do caminho ficam em 1,5–2,3 m (folgados). A arena (tools/blender/arena_torre.py) só tem as bordas,
// o fosso e as paredes: as pilastras são estas, para poderem mudar de lugar.
import * as THREE from 'three';

const DEPTH = 14; // o quanto a pilastra desce no fosso
const VOID = -40; // o "chão" fora das pilastras: cai sem parar
const SKY = 9; // de onde se cai de volta na entrada

export class PillarRoom {
  constructor(dg, M) {
    this.dg = dg;
    this.world = dg.world;
    this.M = M;
    this.P = M.pillars;
    this.group = new THREE.Group();
    this.world.scene.add(this.group);
    const s = this.P.size;
    this.geo = new THREE.BoxGeometry(s, DEPTH, s);
    this.geo.translate(0, -DEPTH / 2, 0);
    this.capGeo = new THREE.BoxGeometry(s + 0.06, 0.08, s + 0.06);
    this.mat = new THREE.MeshToonMaterial({ color: 0x8a8048, emissive: 0x15140a });
    this.capMat = new THREE.MeshToonMaterial({ color: 0xc8c08a, emissive: 0x2a2818 });
    this.meshes = [];
    this.spots = [];
    this.rise = 1; // 0 = as pilastras no fundo do fosso (trocando de lugar), 1 = em cima
    this.move = null;
    this.fall = null;
    this.falls = 0;
    this.layout();
    this.place();
  }

  // um caminho novo, sempre possível: da borda da entrada até a da saída, vãos folgados; e as pilastras falsas (sem saída)
  layout(rng = Math.random) {
    const P = this.P;
    const s = P.size;
    const half = s / 2;
    const midZ = (P.minZ + P.maxZ) / 2;
    const spots = [];
    // quantas pilastras cabem com o vão médio, e o vão que sobra repartido por igual (±0,3 m de variação)
    const total = P.ledgeOut - P.ledgeIn;
    const avg = (P.gap[0] + P.gap[1]) / 2;
    const n = Math.max(1, Math.round((total - avg) / (s + avg)));
    const g = (total - n * s) / (n + 1);
    let z = this.M.entry.z + (rng() - 0.5) * 2;
    for (let i = 0; i < n; i++) {
      const x = P.ledgeIn + g * (i + 1) + s * i + half + (rng() - 0.5) * 0.6;
      // de lado: a nova pilastra pode sair até ~1,4 m para os lados (o vão real continua folgado)
      z = THREE.MathUtils.clamp(z + (rng() - 0.5) * 2.8, P.minZ + half, P.maxZ - half);
      if (Math.abs(z - midZ) > 3.5 && rng() < 0.5) z += Math.sign(midZ - z) * 1.2;
      spots.push({ x, z, path: true });
    }
    for (let k = 0, tries = 0; k < (P.decoys || 0) && tries < 60; tries++) {
      const x = P.ledgeIn + 1.2 + rng() * (P.ledgeOut - P.ledgeIn - 2.4);
      const zz = P.minZ + half + rng() * (P.maxZ - P.minZ - s);
      if (spots.some((o) => Math.abs(o.x - x) < s + 0.8 && Math.abs(o.z - zz) < s + 0.8)) continue;
      spots.push({ x, z: zz, path: false });
      k++;
    }
    this.spots = spots;
  }

  place() {
    while (this.meshes.length < this.spots.length) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(this.geo, this.mat));
      const cap = new THREE.Mesh(this.capGeo, this.capMat);
      cap.position.y = -0.04;
      g.add(cap);
      this.group.add(g);
      this.meshes.push(g);
    }
    this.meshes.forEach((g, i) => {
      const o = this.spots[i];
      g.visible = !!o;
      if (o) g.position.set(o.x, 0, o.z);
    });
  }

  // o chão debaixo de `f`: as bordas e as pilastras em pé valem 0; o resto é o vazio
  ground(f) {
    const P = this.P;
    const x = f.pos.x;
    const z = f.pos.z;
    if (x <= P.ledgeIn + 0.05 || x >= P.ledgeOut - 0.05) return 0;
    if (this.rise < 0.98) return VOID;
    const h = P.size / 2 + 0.22; // um pouco de folga: o pé na quina ainda segura
    for (const o of this.spots) if (Math.abs(x - o.x) <= h && Math.abs(z - o.z) <= h) return 0;
    return VOID;
  }

  update(dt) {
    const dg = this.dg;
    // as pilastras descem, trocam de lugar e sobem (depois de uma queda)
    if (this.move) {
      const m = this.move;
      m.t += dt;
      if (m.t < 0.5) this.rise = 1 - m.t / 0.5;
      else {
        if (!m.swapped) { m.swapped = true; this.layout(); this.place(); this.world.audio.play('creak', { volume: 0.6, pitch: 0.5 }); }
        this.rise = Math.min(1, (m.t - 0.5) / 0.7);
        if (this.rise >= 1) this.move = null;
      }
      for (const g of this.meshes) g.position.y = -DEPTH * (1 - this.rise);
    }
    // a queda: alguém passou do fundo das pilastras
    const live = dg.players.filter((q) => q.state !== 'ko');
    if (!this.fall && live.some((q) => q.pos.y < -3)) {
      this.fall = { t: 0 };
      this.falls++;
      dg.pveHud.fade(true, 0.35);
      this.world.audio.play('fearGaze', { volume: 0.5, pitch: 0.5 });
    }
    if (this.fall) {
      this.fall.t += dt;
      if (this.fall.t > 0.45 && !this.fall.moved) {
        this.fall.moved = true;
        // OS DOIS voltam (coop): do alto, em cima da borda da entrada, com dano (nunca mata)
        const M = this.M;
        live.forEach((q, i) => {
          q.cancelAction && q.cancelAction();
          q.pos.set(M.entry.x + 0.3 + i * 0.4, SKY, M.entry.z + (i ? 1.1 : 0));
          q.vel.set(0, 0, 0);
          q.onGround = false;
          q.yaw = M.entry.yaw;
          const dmg = Math.round(q.maxHealth * (this.P.fallDamage || 0.12));
          q.health = Math.max(1, q.health - dmg);
          dg.popup(i, `-${dmg}`, '#ff6a5a');
        });
        this.move = { t: 0, swapped: false };
        dg.pveHud.fade(false, 0.5);
        dg.pveHud.hint(this.falls === 1 ? 'Você caiu… e voltou do alto, machucado. As PILASTRAS MUDARAM DE LUGAR' : 'As pilastras mudaram de lugar');
        dg.hintT = 4;
      }
      if (this.fall.t > 1.2) this.fall = null;
    }
  }

  dispose() {
    this.world.scene.remove(this.group);
    this.geo.dispose();
    this.capGeo.dispose();
    this.mat.dispose();
    this.capMat.dispose();
  }
}
