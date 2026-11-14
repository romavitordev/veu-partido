// A SALA DO SINO (Torre da TV Varminho, 6º andar; docs/TORRE-TRANSMISSAO.md §5) — o que faz a luta contra o ESTRANGEIRO
// parecer a do ep. 7 de Sinais do Outro Lado:
//  · CÂNONE: a sala tem as cápsulas ligadas ao Sino, e "elas estão protegidas, elas não serão atacadas"; o grupo só se
//    salvou ENTRANDO nas cápsulas enquanto ele avançava devagar. A PRESENÇA dele congelou o Xande; ele o COMANDOU
//    ("ataque-se", "ajoelhe") e o fez ESQUECER tudo, e o derreteu com um toque (o Toque Sutil).
//  · PROPOSTA (o jogo): de tempos em tempos ele para e solta A PRESENÇA, uma onda verde que cresce dele até cobrir a sala;
//    uma cápsula vazia se abre. Quem está dentro dela está protegido; quem a onda pega fica PARALISADO e recebe um
//    COMANDO (ajoelhe / ataque-se; na fase 3 também ESQUEÇA: as habilidades voltam a recarregar). Se alguém se protegeu,
//    O SINO RESPONDE (as cápsulas são ligadas a ele): o Estrangeiro fica ATORDOADO e EXPOSTO (toma mais dano) — é assim
//    que ele cai. Depois que ele some, a saída não é uma porta: é DEITAR numa cápsula (pedido do dono, 2026-11-13).
import * as THREE from 'three';
import { makeCable, pulseCables, disposeCables } from './cables.js';

// as seis cápsulas da sala (tools/blender/arena_torre.py: x 76/82/88, z ±9,8); a 2 e a 4 têm gente (e a 4 está quebrada)
export const SINO_CAPSULES = [
  { x: 76, z: -9.8 }, { x: 82, z: -9.8 }, { x: 88, z: -9.8 },
  { x: 76, z: 9.8 }, { x: 82, z: 9.8 }, { x: 88, z: 9.8 },
];
const FREE = [0, 1, 3, 5];
const BELL = new THREE.Vector3(82, 4.4, 0);
const GREEN = 0x5aff4a;

// PROPOSTA (sem bateria ainda): os tempos e a força de cada fase
const PHASES = [
  { hp: 1.0, every: 22, grow: 6.0 },
  { hp: 0.66, every: 17, grow: 5.2 },
  { hp: 0.33, every: 13, grow: 4.6 },
];
const MAX_R = 17; // o raio final da onda: cobre a sala inteira (24 × 21 m)
const SPOT_R = 1.35; // o quanto se pode estar longe do meio da frente da cápsula e ainda estar dentro
const EXPOSED = { stun: 3.4, time: 7, taken: 1.7 };
const COMMAND = { freeze: 1.4, selfHit: 0.12, kneel: 1.6 };

// a frente de uma cápsula (onde o jogador fica): 1,25 m para o meio da sala
export function capsuleSpot(k) {
  const c = SINO_CAPSULES[k];
  return { x: c.x, z: c.z - Math.sign(c.z) * 1.25 };
}

export class SinoMechanics {
  constructor(dungeon) {
    this.d = dungeon;
    this.w = dungeon.world;
    this.e = dungeon.enemy;
    this.next = 11; // a 1ª Presença vem logo, para ensinar
    this.wave = null;
    this.exposedT = 0;
    this.lastCap = -1;
    this.phase = 0;
    this.exitCap = null;
    this.beams = [];
    this.t = 0;
    this.dress();
  }

  // OS CABOS DO SINO (dono, 2026-11-14: "cheias de tubos e fios de energia/transmissão ligados", como na série): cada
  // cápsula manda um conduíte de transmissão do topo até o sino e cabos pelo chão até a base dele. PROPOSTA: o desenho
  dress() {
    const g = new THREE.Group();
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    for (const c of SINO_CAPSULES) {
      const s = Math.sign(c.z);
      g.add(makeCable(V(c.x, 3.1, c.z - s * 0.2), V(BELL.x + (c.x - BELL.x) * 0.08, BELL.y + 0.9, BELL.z + s * 0.4), { sag: 1.1, r: 0.07, kind: 'conduit', glow: GREEN, seg: 28 }));
      g.add(makeCable(V(c.x + 0.3, 2.9, c.z - s * 0.1), V(BELL.x + (c.x - BELL.x) * 0.1, BELL.y + 0.6, BELL.z + s * 0.6), { sag: 1.6, r: 0.035, seg: 28 }));
      g.add(makeCable(V(c.x - 0.35, 0.05, c.z - s * 0.6), V(BELL.x + (c.x - BELL.x) * 0.15, 0.05, s * 1.2), { sag: 0.02, r: 0.05, seg: 24 }));
    }
    this.w.scene.add(g);
    this.cables = g;
  }

  get phaseIdx() {
    const k = this.e.health / this.e.maxHealth;
    return k <= PHASES[2].hp ? 2 : k <= PHASES[1].hp ? 1 : 0;
  }

  // um feixe verde translúcido na frente da cápsula aberta (onde entrar)
  makeBeam(k) {
    const s = capsuleSpot(k);
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.25, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    const col = new THREE.Mesh(new THREE.CylinderGeometry(SPOT_R * 0.8, SPOT_R * 0.9, 3.2, 20, 1, true), mat);
    col.position.y = 1.6;
    const ring = new THREE.Mesh(new THREE.RingGeometry(SPOT_R * 0.85, SPOT_R, 32), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.8, toneMapped: false, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    g.add(col, ring);
    g.position.set(s.x, 0, s.z);
    this.w.scene.add(g);
    const b = { g, col, ring, k, spot: s };
    this.beams.push(b);
    return b;
  }

  dropBeam(b) {
    if (!b) return;
    this.w.scene.remove(b.g);
    b.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.beams = this.beams.filter((x) => x !== b);
  }

  inside(q, b) {
    return b && Math.hypot(q.pos.x - b.spot.x, q.pos.z - b.spot.z) <= SPOT_R;
  }

  // ------------------------------------------------ a PRESENÇA
  startWave() {
    const e = this.e;
    const P = PHASES[this.phaseIdx];
    // a cápsula: a vazia mais longe dele (dá tempo de correr, mas é preciso correr)
    const opts = FREE.filter((k) => k !== this.lastCap).map((k) => ({ k, d: Math.hypot(capsuleSpot(k).x - e.pos.x, capsuleSpot(k).z - e.pos.z) }));
    opts.sort((a, b) => b.d - a.d);
    const pick = opts[Math.random() < 0.7 ? 0 : 1].k;
    this.lastCap = pick;
    const beam = this.makeBeam(pick);
    const mat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    const edge = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 64), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = 0.06;
    const g = new THREE.Group();
    g.add(dome, edge);
    g.position.set(e.pos.x, 0, e.pos.z);
    this.w.scene.add(g);
    this.wave = { t: 0, grow: P.grow, r: 0, g, dome, edge, beam, caught: new Set(), safe: new Set() };
    // a onda começa: solta quem ele ainda controla (Comandar, Abdução/Esquecido: movimento invertido) — o caminho até
    // a cápsula tem que ser do jogador
    for (const q of this.d.players) {
      if (!q.buffs) continue;
      for (const bf of q.buffs.filter((x) => x.walkTo || x.invertMove)) { bf.time = 0; bf.onEnd && bf.onEnd(); }
      q.buffs = q.buffs.filter((x) => !(x.walkTo || x.invertMove));
    }
    // ele para de lutar e avança devagar, irradiando (o ep. 7: ele só anda)
    e.cancelAction && e.cancelAction();
    e.stun(P.grow + 0.4, 'breath');
    this.d.hud.callout('A PRESENÇA', '#7aff4a');
    this.d.pveHud.hint('UMA CÁPSULA SE ABRIU · entre no feixe verde antes que a onda chegue: lá dentro ele não te ataca');
    this.d.hintT = P.grow;
    this.d.audio.play('fearGaze', { volume: 0.9, pitch: 0.45 });
  }

  // o tubo de vidro que sobe do chão em volta de quem entrou na cápsula
  closeShell(W, q) {
    const sp = W.beam.spot;
    const g = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.6, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xbaffd0, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    glass.position.y = 1.3;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.05, 6, 32), new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 2.6;
    g.add(glass, rim);
    g.position.set(sp.x, 0, sp.z);
    g.scale.y = 0.01;
    this.w.scene.add(g);
    W.shells = W.shells || [];
    W.shells.push(g);
    this.w.fx.burst(new THREE.Vector3(sp.x, 0.4, sp.z), { count: 18, color: GREEN, speed: 2.2, life: 0.5, size: 0.14, up: 2 });
    this.d.audio.play('teleport', { volume: 0.5, pitch: 0.7 });
    if (q === this.d.player || q === this.d.player2) this.d.hud.callout('PROTEGIDO NA CÁPSULA', '#7aff4a');
  }

  endWave() {
    const W = this.wave;
    this.wave = null;
    for (const g of W.shells || []) { this.w.scene.remove(g); g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
    for (const q of this.d.players) q.capsuleSafe = false;
    this.w.scene.remove(W.g);
    W.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.dropBeam(W.beam);
    if (W.safe.size) this.bellAnswers();
    else this.d.hud.callout('NINGUÉM SE PROTEGEU', '#ff6a5a');
  }

  // O SINO RESPONDE: as cápsulas são a rede do sino; o Estrangeiro perde o controle por um instante
  bellAnswers() {
    const e = this.e;
    const fx = this.w.fx;
    for (let i = 0; i < 3; i++) this.w.after(i * 0.15, () => fx.ring(BELL.clone().setY(0.1), { color: GREEN, radius: 4 + i * 4, life: 0.6 }));
    fx.burst(BELL.clone(), { count: 50, color: 0xbaffa0, speed: 6, life: 0.8, size: 0.16 });
    this.d.audio.play('impact', { volume: 1, pitch: 0.35 });
    this.d.audio.play('fearGaze', { volume: 0.7, pitch: 1.6 });
    if (e.state !== 'ko') {
      e.stun(EXPOSED.stun, 'stagger');
      e.notify && e.notify('EXPOSTO', true);
    }
    this.exposedT = EXPOSED.time;
    if (e.cpuEdge) e.cpuEdge.taken = EXPOSED.taken;
    this.d.hud.callout('O SINO RESPONDE — ELE ESTÁ EXPOSTO', '#7aff4a');
    this.d.pveHud.hint('ATAQUE AGORA: exposto, ele toma muito mais dano');
    this.d.hintT = 4;
  }

  // o COMANDO em quem a onda pegou (fora da cápsula)
  command(q) {
    const e = this.e;
    const fx = this.w.fx;
    q.cancelAction && q.cancelAction();
    q.stun(COMMAND.freeze, 'fear');
    q.notify('PARALISADO PELA PRESENÇA', true);
    fx.ring(new THREE.Vector3(q.pos.x, 2.4, q.pos.z), { color: GREEN, radius: 0.5, life: COMMAND.freeze, vertical: false });
    const ph = this.phaseIdx;
    const orders = ph >= 1 ? ['ATAQUE-SE', 'AJOELHE'] : ['AJOELHE'];
    const order = orders[Math.floor(Math.random() * orders.length)];
    this.w.after(COMMAND.freeze * 0.6, () => {
      if (q.state === 'ko') return;
      q.notify(`"${order}"`, true);
      if (order === 'ATAQUE-SE') {
        // ele se fere sozinho (nunca morre disso)
        const dmg = Math.min(q.health - 1, q.maxHealth * COMMAND.selfHit);
        if (dmg > 0) q.takeDamage(dmg);
        fx.burst(q.chestPos(new THREE.Vector3()), { count: 14, color: 0x8a1a1a, speed: 2.4, life: 0.5, size: 0.1 });
        this.d.audio.play('punch', { volume: 0.7 });
      } else q.stun(COMMAND.kneel, 'downed');
      // fase 3: ESQUEÇA — as habilidades voltam a recarregar do zero (Apagar Memória)
      if (ph >= 2) {
        for (const a of q.def.abilities || []) q.cooldowns[a.id] = Math.max(q.cooldowns[a.id] || 0, a.cooldown || 6);
        q.notify('"ESQUEÇA" — as habilidades se apagaram', true);
      }
    });
    e.lastCommanded = q;
  }

  update(dt) {
    const e = this.e;
    this.t += dt;
    if (this.cables) pulseCables(this.cables, this.t);
    if (this.wave && this.wave.shells) for (const g of this.wave.shells) g.scale.y = Math.min(1, g.scale.y + dt * 3.5);
    if (e.state === 'ko') return;
    // a mudança de fase (pelo HP)
    const ph = this.phaseIdx;
    if (ph !== this.phase) {
      this.phase = ph;
      this.d.hud.callout(ph === 1 ? 'ELE COMANDA' : 'ELE APAGA MEMÓRIAS', '#7aff4a');
      this.next = Math.min(this.next, 4);
    }
    if (this.exposedT > 0) {
      this.exposedT -= dt;
      if (this.exposedT <= 0 && e.cpuEdge) e.cpuEdge.taken = 1;
    }
    const W = this.wave;
    if (!W) {
      this.next -= dt;
      // não abre a onda com alguém ainda preso num poder dele (abduzido no ar, agarrado)
      const held = this.d.players.some((q) => q.state !== 'ko' && (q.state === 'grabbed' || q.pos.y > 0.6));
      if (this.next <= 0 && !held && !['stun', 'hitstun', 'grabbed', 'downed', 'launched'].includes(e.state)) {
        this.startWave();
        this.next = PHASES[this.phaseIdx].every;
      }
      return;
    }
    W.t += dt;
    const k = Math.min(1, W.t / W.grow);
    W.r = MAX_R * k * k * (3 - 2 * k) * 0.25 + MAX_R * k * 0.75; // começa devagar e acelera um pouco
    W.g.position.set(e.pos.x, 0, e.pos.z);
    W.g.scale.set(W.r, Math.min(W.r, 4), W.r);
    W.dome.material.opacity = 0.1 + 0.08 * Math.sin(W.t * 6);
    W.beam.col.material.opacity = 0.2 + 0.12 * Math.sin(W.t * 8);
    for (const q of this.d.players) {
      if (q.state === 'ko' || W.caught.has(q)) continue;
      if (W.safe.has(q) || this.inside(q, W.beam)) {
        // DENTRO DA CÁPSULA (dono, 2026-11-14: melhorar o esconder): o vidro sobe e se fecha em volta e o corpo fica
        // preso no meio dela até a onda passar (de fora, ele não te alcança)
        if (!W.safe.has(q)) this.closeShell(W, q);
        W.safe.add(q);
        q.capsuleSafe = true;
        const sp = W.beam.spot;
        q.pos.x += (sp.x - q.pos.x) * Math.min(1, dt * 8);
        q.pos.z += (sp.z - q.pos.z) * Math.min(1, dt * 8);
        if (q.vel) q.vel.x = q.vel.z = 0;
        continue;
      }
      W.safe.delete(q);
      q.capsuleSafe = false;
      if (Math.hypot(q.pos.x - e.pos.x, q.pos.z - e.pos.z) <= W.r) {
        W.caught.add(q);
        this.command(q);
      }
    }
    if (W.t >= W.grow) this.endWave();
  }

  // ------------------------------------------------ a SAÍDA: deitar numa cápsula (depois que ele some)
  // a saída é DEITAR numa cápsula (dono, 2026-11-14: "algumas cápsulas têm que ficar em pé e outras deitadas; a que você
  // dorme tem que ser deitada"): as seis da sala ficam EM PÉ (as do sino, que protegem); a da saída é um LEITO que sobe
  // do chão no meio da sala, deitado, com a tampa de vidro aberta. PROPOSTA: o desenho do leito
  openExit(from) {
    const x = from.x < 82 ? 76.5 : 87.5;
    const z = from.z < 0 ? -3.2 : 3.2;
    const g = new THREE.Group();
    const steel = new THREE.MeshToonMaterial({ color: 0x4a5048, emissive: 0x080a08 });
    const dark = new THREE.MeshToonMaterial({ color: 0x1a1e1a });
    const L = 2.3;
    const base = new THREE.Mesh(new THREE.BoxGeometry(L, 0.42, 0.95), steel);
    base.position.y = 0.21;
    const tub = new THREE.Mesh(new THREE.BoxGeometry(L - 0.16, 0.06, 0.8), dark);
    tub.position.y = 0.44;
    const liquid = new THREE.Mesh(new THREE.BoxGeometry(L - 0.2, 0.3, 0.74), new THREE.MeshBasicMaterial({ color: 0x3aff4a, transparent: true, opacity: 0.45, toneMapped: false, depthWrite: false }));
    liquid.position.y = 0.47;
    liquid.scale.y = 0.05;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.95), steel);
    head.position.set(-L / 2 + 0.06, 0.55, 0);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x7aff4a, toneMapped: false }));
    light.position.set(-L / 2 + 0.06, 0.95, 0);
    // a tampa: meio cilindro de vidro na dobradiça de trás (aberta para cima e para trás)
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.46, -0.45);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, L - 0.16, 20, 1, true, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xbaffd0, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
    glass.rotation.z = Math.PI / 2;
    glass.rotation.y = 0;
    glass.position.z = 0.45;
    hinge.add(glass);
    hinge.rotation.x = -1.9; // aberta
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.45, 1.6, 40), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.8, toneMapped: false, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    ring.scale.set(1, 0.62, 1);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 3.2, 20, 1, true), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.12, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
    col.position.y = 1.6;
    g.add(base, tub, liquid, head, light, hinge, ring, col);
    g.position.set(x, -0.9, z); // sobe do chão
    this.w.scene.add(g);
    this.w.fx.distort(new THREE.Vector3(x, 0.8, z), { color: GREEN, radius: 2, life: 0.6 });
    const b = { g, col, ring, k: -1, spot: { x, z }, bed: true, hinge, liquid, rise: 0, len: L };
    this.beams.push(b);
    this.exitCap = b;
    return b;
  }

  exitReached(players) {
    const b = this.exitCap;
    return b && b.rise >= 1 && players.some((q) => q.state !== 'ko' && Math.hypot(q.pos.x - b.spot.x, q.pos.z - b.spot.z) <= 1.5);
  }

  // o leito sobe do chão (chamado a cada quadro pelo Dungeon enquanto ele espera)
  exitIdle(dt) {
    const b = this.exitCap;
    if (!b || !b.bed) return;
    b.rise = Math.min(1, b.rise + dt / 0.8);
    b.g.position.y = -0.9 * (1 - b.rise);
    b.col.material.opacity = 0.1 + 0.06 * Math.sin(performance.now() / 260);
  }

  // durante a cena: a tampa fecha e o líquido enche
  exitTick(t) {
    const b = this.exitCap;
    if (!b) return;
    if (!b.bed) { b.col.material.opacity = Math.min(0.85, 0.25 + t * 0.4); return; }
    const k = Math.min(1, t / 0.9);
    b.hinge.rotation.x = -1.9 * (1 - k * k);
    b.liquid.scale.y = 0.05 + Math.min(1, Math.max(0, (t - 0.6) / 1.2)) * 0.95;
    b.liquid.position.y = 0.45 + 0.15 * b.liquid.scale.y;
    b.col.material.opacity = Math.max(0, 0.12 - t * 0.1);
  }

  dispose() {
    for (const q of this.d.players) q.capsuleSafe = false;
    if (this.wave) {
      for (const g of this.wave.shells || []) { this.w.scene.remove(g); g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
      this.w.scene.remove(this.wave.g);
      this.wave.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      this.wave = null;
    }
    for (const b of this.beams.slice()) if (b !== this.exitCap) this.dropBeam(b);
    if (this.e.cpuEdge) this.e.cpuEdge.taken = 1;
  }

  disposeAll() {
    this.dispose();
    if (this.cables) { this.w.scene.remove(this.cables); disposeCables(this.cables); this.cables = null; }
    for (const b of this.beams.slice()) this.dropBeam(b);
    this.exitCap = null;
  }
}
