// OS MINIBOSSES DA TORRE (pedido do dono, 2026-11-13: "os minibosses como o Bilu e o Rastropoda aparecem em salas
// diferentes e têm chance de aparecer, não é sempre"). Cada sala que pode tê-los sorteia ao entrar (D.minibosses), e
// cada um aparece no máximo uma vez por tentativa.
//  · RASTROPODA (wiki; ep. 7): INVISÍVEL — no ep. 7 o Guizo só o viu pela LENTE DA CÂMERA, e ele fica visível coberto de
//    pó. Na sala: uma CÂMERA NO TRIPÉ varre a sala (quem está no cone dela aparece) e SACOS DE FARINHA espalhados —
//    encoste para PEGAR e use o botão de TIRO para ARREMESSAR (pedido do dono, 2026-11-13: "ficar procurando sacos de
//    farinha pra jogar nele e poder enxergá-lo"); acertou, o pó gruda e ele aparece. A VIDA dele não aparece: a barra
//    é só chiado (sinal perdido) — ninguém sabe quanto falta. Ele pula do teto, solta gás ácido e ARREMESSA objetos
//    com a mente (telecinese, cânone). PROPOSTA: os tempos, o alcance do arremesso, a volta dos sacos.
//  · BILU (wiki): o quarto escuro; RÁPIDO e FRACO, morre fácil e VOLTA em outro lugar da sala; os barulhos de bicho e o
//    sangue no chão anunciam (cânone). PROPOSTA: volta 2 vezes (3 vidas) e o prêmio ao sumir de vez.
import * as THREE from 'three';
import { Rastropoda, Bilu } from '../combat/alheios.js';
import { actionLabel } from '../ui/labels.js';
import { BiluIntro } from './torreIntros.js';

const GREEN = 0x7aff4a;

// sorteio: a sala `modId` tem o miniboss `kind`? (uma vez por tentativa)
export function rollMiniboss(D, kind, modId, met, rng = Math.random) {
  const M = D.minibosses && D.minibosses[kind];
  if (!M || met[kind]) return false;
  const ch = M.rooms[modId];
  return ch > 0 && rng() < ch;
}

// ---------------------------------------------------------------- RASTROPODA: a câmera do tripé + os sacos de farinha
export class RastropodaRoom {
  constructor(dungeon, r) {
    this.d = dungeon;
    this.w = dungeon.world;
    const R = r.rects[0];
    this.R = R;
    const e = dungeon.enemy;
    const pos = new THREE.Vector3((R.minX + R.maxX) / 2 + 2, 0, (R.minZ + R.maxZ) / 2);
    const hp = Math.round(900 * dungeon.scale.hp);
    this.boss = new Rastropoda(e, this.w, pos, { hp });
    this.boss.onDestroyed = () => this.onSlain();
    this.w.addNpc(this.boss);
    // a barra de vida: chiado, sem o tamanho certo (HUD #npcbar.sig.lost)
    this.boss.bossBar = true;
    this.boss.barStyle = 'signal';
    this.boss.barLost = true;
    this.boss.barName = 'RASTROPODA';
    this.boss.barOwner = 'SINAL PERDIDO';
    // os sacos de farinha: nos cantos e no meio das paredes (voltam aos poucos depois de usados)
    this.spots = [
      [R.minX + 1.2, R.minZ + 1.2], [R.maxX - 1.2, R.minZ + 1.2], [R.minX + 1.2, R.maxZ - 1.2], [R.maxX - 1.2, R.maxZ - 1.2],
      [(R.minX + R.maxX) / 2, R.minZ + 1.0], [(R.minX + R.maxX) / 2, R.maxZ - 1.0],
    ];
    this.sacks = this.spots.map(([x, z]) => this.makeSack(x, z));
    this.flying = [];
    this.refill = 0;
    this.buildCamera(R.minX + 0.7, R.minZ + 0.7);
  }

  // a CÂMERA no tripé num canto: o cone dela no chão varre a sala; dentro dele o Rastropoda aparece
  buildCamera(x, z) {
    const g = new THREE.Group();
    const dark = new THREE.MeshToonMaterial({ color: 0x1a1a1e });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 5), dark);
      leg.position.set(Math.cos(a) * 0.22, 0.72, Math.sin(a) * 0.22);
      leg.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3);
      g.add(leg);
    }
    const head = new THREE.Group();
    head.position.y = 1.5;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.36), dark);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.14, 12), dark);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.24;
    const rec = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false }));
    rec.position.set(0.08, 0.08, 0.16);
    head.add(body, lens, rec);
    g.add(head);
    // o cone de visão no chão (um setor)
    this.range = 13;
    this.half = 0.32;
    const cone = new THREE.Mesh(new THREE.CircleGeometry(this.range, 24, -this.half, this.half * 2), new THREE.MeshBasicMaterial({ color: 0xbaffd0, transparent: true, opacity: 0.08, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
    cone.rotation.x = -Math.PI / 2;
    cone.position.y = 0.04;
    const pivot = new THREE.Group();
    pivot.add(cone);
    g.add(pivot);
    g.position.set(x, 0, z);
    this.w.scene.add(g);
    this.cam = { g, head, pivot, cone, rec, t: Math.random() * 6, x, z, base: Math.atan2((this.R.maxZ + this.R.minZ) / 2 - z, (this.R.maxX + this.R.minX) / 2 - x) };
  }

  // ------------------------------------------------ os SACOS: no chão → na mão (acima da cabeça) → voando → a nuvem
  makeSack(x, z) {
    const g = new THREE.Group();
    const cloth = new THREE.MeshToonMaterial({ color: 0xe8e0c8 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), cloth);
    body.scale.set(0.95, 1.0, 0.8);
    body.position.y = 0.28;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.16, 8), cloth);
    neck.position.y = 0.6;
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 6, 10), new THREE.MeshToonMaterial({ color: 0x3e2a1a }));
    tie.rotation.x = Math.PI / 2;
    tie.position.y = 0.57;
    // o pó que escapa do pano: um brilho branco fraco no chão (acha-se o saco de longe)
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.55, 18), new THREE.MeshBasicMaterial({ color: 0xf4f0e4, transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false }));
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.03;
    g.add(body, neck, tie, halo);
    g.position.set(x, 0, z);
    g.rotation.y = Math.random() * Math.PI * 2;
    this.w.scene.add(g);
    return { g, halo, x, z, holder: null };
  }

  freeSack(k) {
    this.w.scene.remove(k.g);
    k.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }

  // antes do mundo andar (Dungeon.update): pegar encostando, arremessar no botão de TIRO (que não vira tiro)
  // os SACOS (refeito: dono, 2026-11-14 — "melhorar o jeito de pegar o saco de farinha"): perto de um saco aparece o
  // aviso; pega com INTERAGIR (E / B) ou com o botão de BATER; encostar também pega. Com o saco nas mãos, qualquer
  // botão de ataque (○ / □) ou o interagir ARREMESSA — e o arremesso puxa para o Rastropoda se ele estiver à frente
  input(V) {
    const p = V.p;
    if (!this.boss || !this.boss.alive || p.state === 'ko') return;
    const pr = V.inp.pressed || {};
    const btn = V.inp.source === 'gamepad' ? 'B' : V.i ? 'DEF' : 'E';
    const held = this.sacks.find((k) => k.holder === p);
    const busy = ['hitstun', 'stun', 'grabbed', 'downed', 'launched'].includes(p.state);
    if (held) {
      V.prompt && V.prompt.show(p.pos, 2.6, `${actionLabel(V.i, 'physical', V.inp.source)}|Arremessar`);
      if ((pr.ranged || pr.physical || pr.interact) && !busy) {
        pr.ranged = false; pr.physical = false; pr.interact = false;
        this.throwSack(held, p);
      }
      return;
    }
    if (busy || p.state === 'intro') return;
    let k = null;
    let bd = 1.8;
    for (const s2 of this.sacks) {
      if (s2.holder) continue;
      const d = Math.hypot(s2.x - p.pos.x, s2.z - p.pos.z);
      if (d < bd) { bd = d; k = s2; }
    }
    if (!k) return;
    const phys = V.inp.source === 'gamepad' ? '' : ` / ${actionLabel(V.i, 'physical', V.inp.source)}`;
    V.prompt && V.prompt.show({ x: k.x, z: k.z }, 1.1, `${btn}${phys}|Pegar farinha`);
    if (!(bd < 0.8 || pr.interact || pr.physical)) return;
    pr.physical = false; pr.interact = false;
    k.holder = p;
    k.halo.visible = false;
    this.d.audio.play('pickup', { volume: 0.6, pitch: 0.8 });
    this.d.popup(V.i, 'FARINHA NAS MÃOS — ATAQUE PARA ARREMESSAR', '#f4f0e4');
  }

  throwSack(k, p) {
    this.sacks.splice(this.sacks.indexOf(k), 1);
    let yaw = p.aimYaw ?? p.yaw;
    const from = new THREE.Vector3(p.pos.x + Math.sin(yaw) * 0.5, p.pos.y + 2.0, p.pos.z + Math.cos(yaw) * 0.5);
    // a mira ajuda: o Rastropoda até 14 m e num cone de 70° à frente → o saco vai nele (ele é invisível; seguir a gosma
    // e virar para o lado certo basta)
    const b = this.boss;
    let dist = 0;
    if (b && b.alive) {
      const ty = Math.atan2(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
      let dy = ty - yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      const d = Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
      if (d < 14 && Math.abs(dy) < 1.22) { yaw = ty; dist = d; }
    }
    const H = 13;
    let vy = 4.2;
    if (dist > 0.8) { const t = dist / H; vy = (1.0 - from.y + 0.5 * 16 * t * t) / t; }
    const v = new THREE.Vector3(Math.sin(yaw) * H, vy, Math.cos(yaw) * H);
    k.g.position.copy(from);
    this.flying.push({ k, v, t: 0 });
    this.d.audio.play('swing', { volume: 0.8, pitch: 0.7 });
  }

  // a nuvem: acerto direto = 9 s visível; caiu perto (3 m) = 6 s
  flour(pos, direct) {
    this.w.fx.burst(new THREE.Vector3(pos.x, 0.9, pos.z), { count: 30, color: 0xf4f0e4, kind: 'smoke', speed: 2.6, life: 1.1, size: 0.7, grow: 1.4 });
    this.d.audio.play('impact', { volume: 0.5, pitch: 0.6 });
    const b = this.boss;
    if (!b || !b.alive) return;
    const d = Math.hypot(b.pos.x - pos.x, b.pos.z - pos.z);
    if (direct || d < 3.0) {
      b.dust(direct ? 9 : 6);
      this.d.hud.callout('A FARINHA GRUDOU NELE', '#f4f0e4');
    }
  }

  onSlain() {
    this.d.giveXp(this.d.D.xp.zumbiForte * 3);
    this.d.giveCoins(12 + Math.floor(Math.random() * 8));
    this.d.hud.callout('O RASTROPODA CAIU', '#7aff4a');
  }

  update(dt) {
    this.updateSacks(dt);
    const C = this.cam;
    if (!C) return;
    C.t += dt;
    const ang = C.base + Math.sin(C.t * 0.45) * 0.75; // ângulo no plano (x, z)
    C.pivot.rotation.y = -ang;
    C.head.rotation.y = Math.PI / 2 - ang;
    C.rec.visible = Math.sin(C.t * 6) > 0;
    const b = this.boss;
    if (b && b.alive) {
      const dx = b.pos.x - C.x;
      const dz = b.pos.z - C.z;
      const d = Math.hypot(dx, dz);
      let da = Math.atan2(dz, dx) - ang;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      if (d < this.range && Math.abs(da) < this.half + 0.05) b.dust(0.25);
    }
  }

  updateSacks(dt) {
    const b = this.boss;
    for (const k of this.sacks) {
      if (!k.holder) { k.halo.material.opacity = 0.16 + Math.sin(this.w.time * 3 + k.x) * 0.08; continue; }
      const p = k.holder;
      if (p.state === 'ko' || !this.d.players.includes(p)) {
        k.holder = null;
        k.x = p.pos.x;
        k.z = p.pos.z;
        k.g.position.set(k.x, 0, k.z);
        k.halo.visible = true;
        continue;
      }
      k.g.position.set(p.pos.x, p.pos.y + 1.95, p.pos.z);
      k.g.rotation.y = p.yaw;
    }
    for (let i = this.flying.length - 1; i >= 0; i--) {
      const F = this.flying[i];
      F.t += dt;
      F.v.y -= 16 * dt;
      const P = F.k.g.position;
      P.addScaledVector(F.v, dt);
      F.k.g.rotation.x += dt * 9;
      const hitB = b && b.alive && Math.hypot(b.pos.x - P.x, b.pos.z - P.z) < (b.radius || 0.9) + 0.5 && P.y < 2.6;
      const wall = this.w.arena.boxes.some((x) => P.x > x.minX && P.x < x.maxX && P.z > x.minZ && P.z < x.maxZ && P.y < (x.h ?? 3));
      if (hitB || wall || P.y <= 0.2 || F.t > 2.5) {
        this.flour(P, hitB);
        this.freeSack(F.k);
        this.flying.splice(i, 1);
      }
    }
    // os sacos voltam: um a cada ~10 s enquanto houver menos de 3 (num dos cantos longe de quem está na sala)
    if (b && b.alive && this.sacks.length < 3) {
      this.refill -= dt;
      if (this.refill <= 0) {
        this.refill = 10;
        const near = ([x, z]) => Math.min(...this.d.players.map((q) => Math.hypot(q.pos.x - x, q.pos.z - z)));
        const far = this.spots.slice().sort((A, B) => near(B) - near(A));
        const [x, z] = far[Math.floor(Math.random() * 3)];
        this.sacks.push(this.makeSack(x, z));
        this.w.fx.burst(new THREE.Vector3(x, 0.4, z), { count: 10, color: 0xf4f0e4, kind: 'smoke', speed: 0.8, life: 0.6, size: 0.4 });
      }
    }
  }

  dispose() {
    for (const k of this.sacks) this.freeSack(k);
    for (const F of this.flying) this.freeSack(F.k);
    this.sacks = [];
    this.flying = [];
    if (this.cam) {
      this.w.scene.remove(this.cam.g);
      this.cam.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      this.cam = null;
    }
    if (this.boss && this.boss.alive) this.boss.kill();
  }
}

// ---------------------------------------------------------------- BILU: morre fácil e volta noutro canto
export class BiluStalker {
  constructor(dungeon, M, { lives = 3 } = {}) {
    this.d = dungeon;
    this.w = dungeon.world;
    this.R = M.rects[0];
    this.lives = lives;
    this.bilu = null;
    this.wait = 1.6; // entra na sala, e logo o barulho
    this.warned = false;
    this.done = false;
    this.blood = [];
    // o sangue no chão (cânone): manchas escuras perto das paredes
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.3 + Math.random() * 0.4, 12), new THREE.MeshBasicMaterial({ color: 0x3a0606, transparent: true, opacity: 0.85, depthWrite: false }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(this.R.minX + 0.8 + Math.random() * (this.R.maxX - this.R.minX - 1.6), 0.02, this.R.minZ + 0.8 + Math.random() * (this.R.maxZ - this.R.minZ - 1.6));
      this.w.scene.add(m);
      this.blood.push(m);
    }
  }

  // um canto da sala longe de quem está nela
  spot() {
    const R = this.R;
    let best = null;
    let bd = -1;
    for (let i = 0; i < 12; i++) {
      const p = new THREE.Vector3(R.minX + 1 + Math.random() * (R.maxX - R.minX - 2), 0, R.minZ + 1 + Math.random() * (R.maxZ - R.minZ - 2));
      const d = Math.min(...this.d.players.filter((q) => q.state !== 'ko').map((q) => Math.hypot(q.pos.x - p.x, q.pos.z - p.z)));
      if (d > bd) { bd = d; best = p; }
    }
    return best;
  }

  update(dt) {
    if (this.done) return;
    if (this.bilu && this.bilu.alive) return;
    this.wait -= dt;
    // o aviso: o barulho de bicho e dois olhos verdes no escuro
    if (!this.warned && this.wait < 1.0) {
      this.warned = true;
      this.at = this.spot();
      this.d.audio.play('fearGaze', { volume: 0.7, pitch: 0.55 });
      this.w.fx.burst(new THREE.Vector3(this.at.x, 2.4, this.at.z), { count: 2, color: GREEN, speed: 0.1, life: 0.9, size: 0.12 });
    }
    if (this.wait > 0) return;
    const b = new Bilu(this.d.enemy, this.w, this.at || this.spot(), { hp: Math.round(70 * this.d.scale.hp) });
    b.onDestroyed = () => this.onSlain(b);
    b.bossBar = true;
    b.barStyle = 'signal';
    b.barName = 'BILU';
    b.barOwner = this.lives > 1 ? `VOLTA MAIS ${this.lives - 1}×` : 'ÚLTIMA VEZ';
    this.w.addNpc(b);
    this.bilu = b;
    // a 1ª vez: a CENA (os olhos no escuro, o clarão); a luta continua quando ela acaba
    if (this.lives === 3 && !this.d.bossIntro) {
      this.d.bossIntro = new BiluIntro(this.d, b);
      this.d.bossIntro.onDone = () => this.d.hud.callout('ELE MORRE FÁCIL… E VOLTA', '#7aff4a');
    }
  }

  onSlain(b) {
    this.lives--;
    this.d.giveXp(Math.round(this.d.D.xp.zumbi * 0.6));
    if (this.lives <= 0) {
      this.done = true;
      this.d.giveXp(this.d.D.xp.zumbiForte * 2);
      this.d.giveCoins(8 + Math.floor(Math.random() * 6));
      this.d.hud.callout('O BILU NÃO VOLTOU', '#7aff4a');
      return;
    }
    this.d.popup && this.d.popup(0, `ELE VAI VOLTAR (${this.lives})`, '#7aff4a');
    this.wait = 3.5 + Math.random() * 1.5;
    this.warned = false;
  }

  dispose() {
    this.done = true;
    if (this.bilu && this.bilu.alive) this.bilu.kill();
    for (const m of this.blood) { this.w.scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
    this.blood = [];
  }
}
