// OS ITENS DA VIGÍLIA no Samhain (só na Árvore Anciã, a parte 3). Pedidos do dono, 2026-11-19:
//   "pode ter alguns itens que podem ser encontrados na fase como a lanterna de porco que é como uma flashbang nos
//    monstros, mas tem que atear fogo nela"; "para fontes de fogo pra lanterna o player tem que achar oque a eileen usa
//    pra atear fogo no chão … criando uma area de fogo no chão que protege a porta, depois ele tem que achar a lanterna
//    de porco"; "no ep 3 o gwayne acha um combustivel … e quem coloca fogo é a eileen … pode ser algum npc que vem de
//    tempos em tempos trazendo alguns itens".
// Cânone (A Vigília ep. 3): o combustível, o fogo no chão como barreira e a lanterna do crânio de porco que, quebrada
// no fogo, afasta as Assombrações. PROPOSTA: o ALDEÃO MENSAGEIRO que sai do abrigo (uma casa acesa ou o alçapão da
// Árvore) com a CAIXA DA VIGÍLIA, a ordem dos itens, o alcance, os tempos e o dano.
//
// O ciclo: COMBUSTÍVEL (□ derrama o jarro: uma poça no chão) → TOCHA (encostar a tocha na poça ATEIA FOGO: a barreira
// que as Assombrações não atravessam e que queima quem fica nela) → LANTERNA DO CRÂNIO DE PORCO (levar ao fogo para
// acender; □ arremessa: o clarão OFUSCA as Assombrações em volta). Uma coisa nas mãos por vez; pega encostando.
import * as THREE from 'three';
import { molotov } from '../models/weapons.js';
import { glowMat } from '../models/rig.js';
import { actionLabel } from '../ui/labels.js';

export const ITEMS = {
  courierFirst: 14, // s até o 1º aldeão sair do abrigo
  courierEvery: 26, // s entre um aldeão e o próximo (depois que a caixa anterior foi aberta)
  oil: { radius: 3.4, life: 70 }, // a poça de combustível (espera a tocha)
  // a barreira de fogo: maior e QUEIMA quem encosta na borda; fica acesa até a lanterna acender e depois dura
  // `after` s (dono, 2026-11-19: "o fogo deveria ficar no chão até eu acender a lanterna e devia ser maior para dar
  // dano nas assombrações")
  fire: { radius: 4.2, after: 12, dps: 60, band: 0.9 },
  flash: { radius: 7.5, blind: 4.2, damage: 70 }, // o clarão da lanterna
  order: ['oil', 'torch', 'lantern'],
};
const NAMES = { oil: 'COMBUSTÍVEL', torch: 'TOCHA', lantern: 'LANTERNA DO CRÂNIO DE PORCO' };
const COLORS = { oil: '#c8a040', torch: '#ff9a3a', lantern: '#ffe7a8' };
const FIRE = 0xff6a1a;

const toon = (c) => new THREE.MeshToonMaterial({ color: c });

// ---------------------------------------------------------------- os modelos (código; PROPOSTA de forma)
function fuelJar() {
  const g = new THREE.Group();
  const m = molotov(); // o vidro com o pano: o mesmo jarro do coquetel, maior e sem a chama
  m.userData.flame.visible = false;
  m.rotation.x = Math.PI; // o gargalo para cima
  m.scale.setScalar(2.6);
  m.position.y = 0.42;
  g.add(m);
  return g;
}

function torch() {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.7, 7), toon(0x5a3a22));
  stick.position.y = 0.35;
  const wrap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.16, 8), toon(0x3a2a1c));
  wrap.position.y = 0.72;
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 8), glowMat(0xffa030, 0.95));
  flame.position.y = 0.92;
  g.add(stick, wrap, flame);
  g.userData.flame = flame;
  return g;
}

// o crânio de porco oco com a vela dentro: o focinho, as órbitas, as orelhas, as presas e a alça de ferro
function pigLantern() {
  const g = new THREE.Group();
  const bone = toon(0xe6dcc4);
  const dark = new THREE.MeshBasicMaterial({ color: 0x120c08 });
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), bone);
  skull.scale.set(1, 0.86, 1.3);
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.11, 0.17, 10), bone);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.03, 0.25);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.083, 12), toon(0xcfc2a6));
  disc.position.set(0, -0.03, 0.336);
  g.add(skull, snout, disc);
  for (const s of [-1, 1]) {
    const nostril = new THREE.Mesh(new THREE.CircleGeometry(0.018, 8), dark);
    nostril.position.set(s * 0.032, -0.03, 0.338);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 6), bone);
    ear.position.set(s * 0.11, 0.13, -0.04);
    ear.rotation.z = -s * 0.5;
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.07, 5), toon(0xf4ecd8));
    tusk.position.set(s * 0.07, -0.08, 0.27);
    tusk.rotation.x = -0.4;
    g.add(nostril, ear, tusk);
  }
  // as órbitas: escuras apagada; acesa, a luz da vela passa por elas
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), dark);
    e.position.set(s * 0.075, 0.04, 0.17);
    e.scale.z = 0.5;
    g.add(e);
    eyes.push(e);
  }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 16, Math.PI), toon(0x3a3632));
  handle.position.y = 0.13;
  g.add(handle);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glowMat(0xff7a10, 0.55));
  glow.position.set(0, 0.0, 0.08);
  glow.visible = false;
  g.add(glow);
  g.userData.eyes = eyes;
  g.userData.glow = glow;
  g.userData.dark = dark;
  g.scale.setScalar(1.7);
  return g;
}

// a CAIXA DA VIGÍLIA: tábuas com o símbolo pintado em amarelo
function supplyCrate() {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.5), toon(0x6a4a2c));
  box.position.y = 0.25;
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.06, 0.54), toon(0x553a22));
  lid.position.y = 0.52;
  g.add(box, lid);
  for (const x of [-0.3, 0.3]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.52, 0.52), toon(0x2e2a26));
    band.position.set(x, 0.26, 0);
    g.add(band);
  }
  const sign = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.1, 16), glowMat(0xffd84a, 0.9));
  sign.position.set(0, 0.27, 0.256);
  g.add(sign);
  return g;
}

// o ALDEÃO MENSAGEIRO (PROPOSTA): capa com capuz, rosto à sombra, carrega a caixa na frente
function courierModel() {
  const g = new THREE.Group();
  const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.3, 10, 1, true), toon(0x4a3f34));
  cloak.position.y = 0.72;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.0, 10), toon(0x5a4c3e));
  body.position.y = 0.75;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), toon(0xd8b896));
  head.position.y = 1.5;
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), toon(0x3e342a));
  hood.position.set(0, 1.53, -0.02);
  const legs = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 6), toon(0x2a221c));
    leg.position.set(s * 0.1, 0.22, 0);
    g.add(leg);
    legs.push(leg);
  }
  const crate = supplyCrate();
  crate.scale.setScalar(0.62);
  crate.position.set(0, 0.86, 0.32);
  g.add(cloak, body, head, hood, crate);
  g.userData.legs = legs;
  g.userData.crate = crate;
  return g;
}

// halo dourado no chão + coluna de luz: dá para achar a caixa/o item no meio da luta
function beacon(color = 0xffd84a) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.4, 5, 12, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  pillar.position.y = 2.5;
  g.add(ring, pillar);
  g.userData.ring = ring;
  g.userData.pillar = pillar;
  return g;
}

// ---------------------------------------------------------------- os itens
export class SamhainItems {
  // shelters(): os abrigos de onde o aldeão sai e para onde volta ([{x, z}]); dropAt(from): onde ele deixa a caixa
  constructor(d, { shelters, dropAt, first = ITEMS.courierFirst }) {
    this.d = d;
    this.w = d.world;
    this.shelters = shelters;
    this.dropAt = dropAt;
    this.next = first;
    this.step = 0; // a vez de qual item (ITEMS.order)
    this.items = []; // no chão ou nas mãos
    this.pools = []; // poças de combustível
    this.fires = []; // barreiras de fogo
    this.flying = [];
    this.courier = null;
    this.firstFire = false;
  }

  // a vez de qual item. A lanterna só vem depois do 1º fogo (dono: "depois ele tem que achar a lanterna de porco"):
  // sem fogo ainda, a vez dela volta para o combustível
  nextKind() {
    if (!this.firstFire && ITEMS.order[this.step % ITEMS.order.length] === 'lantern') this.step++;
    return ITEMS.order[this.step % ITEMS.order.length];
  }

  // ------------------------------------------------ o aldeão que traz a caixa
  spawnCourier() {
    const list = this.shelters();
    if (!list.length) return false;
    const s = list[Math.floor(Math.random() * list.length)];
    const to = this.dropAt(s);
    const g = courierModel();
    g.position.set(s.x, 0, s.z);
    this.w.scene.add(g);
    const kind = this.nextKind();
    this.step++;
    this.courier = { g, from: new THREE.Vector3(s.x, 0, s.z), to: new THREE.Vector3(to.x, 0, to.z), t: 0, leg: 'out', kind };
    this.d.hud.callout('UM ALDEÃO TRAZ SUPRIMENTOS', '#ffd84a');
    this.d.popup(0, `O ALDEÃO TRAZ: ${NAMES[kind]}`, COLORS[kind]);
    this.d.audio.play('creak', { volume: 0.5, pitch: 1.1 });
    return true;
  }

  updateCourier(dt) {
    const C = this.courier;
    if (!C) return;
    const sp = 4.2;
    const tgt = C.leg === 'out' ? C.to : C.from;
    const g = C.g;
    const dx = tgt.x - g.position.x;
    const dz = tgt.z - g.position.z;
    const dist = Math.hypot(dx, dz);
    C.t += dt;
    g.rotation.y = Math.atan2(dx, dz);
    for (const [i, leg] of g.userData.legs.entries()) leg.rotation.x = Math.sin(C.t * 11 + i * Math.PI) * 0.6;
    g.position.y = Math.abs(Math.sin(C.t * 11)) * 0.05;
    if (dist > 0.15) {
      const k = Math.min(1, (sp * dt) / dist);
      g.position.x += dx * k;
      g.position.z += dz * k;
      return;
    }
    if (C.leg === 'out') {
      C.leg = 'back';
      g.userData.crate.visible = false;
      this.dropCrate(C.to.x, C.to.z, C.kind);
      return;
    }
    this.w.scene.remove(g);
    this.courier = null;
  }

  // o aldeão LARGA O ITEM NO CHÃO e volta para dentro (dono, 2026-11-19: "melhor o aldeão vir e dropar o item no chão
  // e voltar pra dentro e nao ter que clicar nele pra pegar o item"): passar por cima pega; a coluna de luz mostra onde
  dropCrate(x, z, kind) {
    const it = { kind, g: kind === 'oil' ? fuelJar() : kind === 'torch' ? torch() : pigLantern(), holder: null, lit: false, lightT: 0, beacon: beacon() };
    it.g.position.set(x, 0, z);
    it.beacon.position.set(x, 0, z);
    this.w.scene.add(it.g, it.beacon);
    this.items.push(it);
    this.w.fx.burst(new THREE.Vector3(x, 0.4, z), { count: 10, color: 0xffd84a, speed: 1.5, up: 1.5, life: 0.5, size: 0.12 });
    this.d.audio.play('impact', { volume: 0.35, pitch: 1.4 });
  }

  // ------------------------------------------------ pegar e usar (antes do mundo andar: Dungeon.update)
  input(V) {
    const p = V.p;
    if (p.state === 'ko' || p.state === 'intro') return;
    const pr = V.inp.pressed || {};
    const busy = ['hitstun', 'stun', 'grabbed', 'downed', 'launched'].includes(p.state);
    const held = this.items.find((it) => it.holder === p);
    const btn = actionLabel(V.i, 'ranged', V.inp.source);
    if (held) {
      const what = held.kind === 'oil' ? 'Derramar o combustível' : held.kind === 'torch' ? (this.pools.length ? 'Leve a tocha até a poça' : 'Arremessar a tocha') : held.lit ? 'Arremessar a lanterna' : 'Acenda no fogo';
      const canThrow = held.kind !== 'lantern' || held.lit;
      V.prompt && V.prompt.show(p.pos, 2.5, canThrow ? `${btn}|${what}` : `🔥|${what}`);
      if (canThrow && pr.ranged && !busy) {
        pr.ranged = false;
        this.throwItem(held, p);
      }
      return;
    }
    if (busy) return;
    for (const it of this.items) {
      if (it.holder || it.flying) continue;
      if (Math.hypot(it.g.position.x - p.pos.x, it.g.position.z - p.pos.z) > 1.3) continue;
      this.pick(it, p, V.i);
      return;
    }
  }

  pick(it, p, i) {
    it.holder = p;
    if (it.beacon) { this.w.scene.remove(it.beacon); it.beacon = null; }
    if (it.fresh !== false) { it.fresh = false; this.next = Math.max(this.next, ITEMS.courierEvery); }
    this.d.audio.play('pickup', { volume: 0.7, pitch: 0.9 });
    const tip = it.kind === 'oil' ? 'DERRAME PERTO DE UMA PORTA' : it.kind === 'torch' ? 'ENCOSTE A TOCHA NA POÇA DE COMBUSTÍVEL' : it.lit ? 'ARREMESSE NAS ASSOMBRAÇÕES' : 'LEVE AO FOGO PARA ACENDER';
    this.d.popup(i, `${NAMES[it.kind]}: ${tip}`, COLORS[it.kind]);
  }

  // o arremesso (a mira ajuda: a Assombração mais perto num cone de 70° à frente, até 12 m)
  throwItem(it, p) {
    let yaw = p.aimYaw ?? p.yaw;
    let dist = it.kind === 'oil' ? 2.2 : 6;
    if (it.kind !== 'oil') {
      let best = null;
      let bd = 12;
      for (const z of this.d.copias || []) {
        if (!z.alive || z.state === 'die' || z.state === 'leave') continue;
        const d = Math.hypot(z.pos.x - p.pos.x, z.pos.z - p.pos.z);
        let dy = Math.atan2(z.pos.x - p.pos.x, z.pos.z - p.pos.z) - yaw;
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        if (d < bd && Math.abs(dy) < 1.22) { bd = d; best = z; }
      }
      if (best) { yaw = Math.atan2(best.pos.x - p.pos.x, best.pos.z - p.pos.z); dist = bd; }
    }
    it.holder = null;
    it.flying = true;
    const from = new THREE.Vector3(p.pos.x + Math.sin(yaw) * 0.5, 1.6, p.pos.z + Math.cos(yaw) * 0.5);
    const to = new THREE.Vector3(p.pos.x + Math.sin(yaw) * dist, 0.05, p.pos.z + Math.cos(yaw) * dist);
    this.flying.push({ it, from, to, t: 0, T: 0.25 + dist * 0.045 });
    this.d.audio.play('swing', { volume: 0.7, pitch: 0.8 });
  }

  land(it, at) {
    this.items.splice(this.items.indexOf(it), 1);
    this.w.scene.remove(it.g);
    if (it.kind === 'oil') {
      this.addPool(at.x, at.z);
      this.w.fx.burst(new THREE.Vector3(at.x, 0.2, at.z), { count: 18, color: 0x8a6a20, speed: 2.4, up: 1.2, life: 0.5, size: 0.14, gravity: 9 });
      this.d.audio.play('impact', { volume: 0.5, pitch: 1.6 });
      return;
    }
    if (it.kind === 'torch') {
      const pool = this.pools.find((q) => Math.hypot(q.x - at.x, q.z - at.z) < ITEMS.oil.radius + 0.6);
      if (pool) this.ignite(pool);
      else this.w.fx.burst(new THREE.Vector3(at.x, 0.3, at.z), { count: 12, color: FIRE, speed: 1.5, up: 2, life: 0.5, size: 0.2 });
      return;
    }
    this.flash(at);
  }

  // ------------------------------------------------ poça, fogo e clarão
  addPool(x, z) {
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(ITEMS.oil.radius, 28), new THREE.MeshBasicMaterial({ color: 0x2a1e0c, transparent: true, opacity: 0.7, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.035, z);
    mesh.scale.setScalar(0.2);
    this.w.scene.add(mesh);
    this.pools.push({ x, z, mesh, t: 0 });
  }

  ignite(pool) {
    this.pools.splice(this.pools.indexOf(pool), 1);
    this.w.scene.remove(pool.mesh);
    pool.mesh.geometry.dispose();
    pool.mesh.material.dispose();
    const R = ITEMS.fire.radius;
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0xff5a10, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pool.x, 0.045, pool.z);
    const light = new THREE.PointLight(0xff7a2a, 6, 13, 1.6);
    light.position.set(pool.x, 1.2, pool.z);
    // as LÍNGUAS DE FOGO: cones que tremulam espalhados pela poça (o disco sozinho ficava chapado)
    const tongues = new THREE.Group();
    const tMat = glowMat(0xff8a2a, 0.85);
    const cMat = glowMat(0xffd070, 0.9);
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * R * 0.9;
      const big = i < 16;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(big ? 0.22 : 0.13, big ? 0.9 : 0.55, 6), big ? tMat : cMat);
      cone.position.set(pool.x + Math.cos(a) * r, (big ? 0.45 : 0.28), pool.z + Math.sin(a) * r);
      cone.userData.ph = Math.random() * 10;
      cone.userData.h = cone.position.y;
      tongues.add(cone);
    }
    this.w.scene.add(mesh, light, tongues);
    this.fires.push({ x: pool.x, z: pool.z, R, mesh, light, tongues, t: 0, tick: 0, hold: true }); // hold: espera a lanterna
    this.w.fx.burst(new THREE.Vector3(pool.x, 0.4, pool.z), { count: 40, color: FIRE, speed: 3.5, up: 3, life: 0.7, size: 0.4 });
    this.d.audio.play('explosion', { volume: 0.6, pitch: 1.2 });
    this.d.hud.callout('BARREIRA DE FOGO', '#ff9a3a');
    this.d.popup(0, 'AS ASSOMBRAÇÕES NÃO ATRAVESSAM O FOGO', '#ff9a3a');
    this.firstFire = true;
  }

  // o clarão: ofusca (Assombracao.blind) e fere quem está perto; Broén aguenta metade do tempo
  flash(at) {
    const F = ITEMS.flash;
    const c = new THREE.Vector3(at.x, 1.2, at.z);
    this.w.fx.burst(c, { count: 60, color: 0xfff4d0, speed: 7, up: 2, life: 0.5, size: 0.35 });
    this.w.fx.burst(c, { count: 24, color: 0xe6dcc4, speed: 4, up: 3, life: 0.8, size: 0.1, gravity: 9 }); // os cacos do crânio
    const light = new THREE.PointLight(0xfff0c0, 40, 22, 1.4);
    light.position.copy(c);
    this.w.scene.add(light);
    let t = 0;
    this.w.addTicker({ update: (dt) => { t += dt; light.intensity = 40 * Math.max(0, 1 - t / 0.45); return t > 0.45; }, dispose: () => this.w.scene.remove(light) });
    this.d.audio.play('guardBreak', { volume: 0.9, pitch: 1.5 });
    this.d.audio.play('explosion', { volume: 0.5, pitch: 1.8 });
    let n = 0;
    for (const z of this.d.copias || []) {
      if (!z.alive || z.state === 'die' || z.state === 'leave') continue;
      if (Math.hypot(z.pos.x - at.x, z.pos.z - at.z) > F.radius) continue;
      n++;
      if (z.blind) z.blind(F.blind, at);
      z.hitBy(this.d.player, F.damage);
    }
    this.d.hud.callout(n ? `${n} OFUSCADA${n === 1 ? '' : 'S'}` : 'O CLARÃO SE PERDEU', '#fff4d0');
  }

  // ------------------------------------------------ o quadro
  update(dt) {
    const t = this.w.time || 0;
    if (!this.courier && !this.items.some((it) => it.beacon)) {
      this.next -= dt;
      if (this.next <= 0) { if (!this.spawnCourier()) this.next = 3; else this.next = ITEMS.courierEvery; }
    }
    this.updateCourier(dt);
    for (const it of this.items) {
      if (!it.beacon) continue;
      it.beacon.userData.ring.material.opacity = 0.35 + Math.sin(t * 4) * 0.2;
      it.beacon.userData.pillar.material.opacity = 0.09 + Math.sin(t * 4) * 0.04;
    }
    // nas mãos: acima da cabeça (vê-se de longe); a lanterna acende dentro do fogo
    for (const it of this.items) {
      if (it.flying) continue;
      const p = it.holder;
      if (p && (p.state === 'ko' || !this.d.players.includes(p))) { it.holder = null; it.g.position.set(p.pos.x, 0, p.pos.z); }
      if (it.holder) {
        it.g.position.set(it.holder.pos.x, it.holder.pos.y + 2.05, it.holder.pos.z);
        it.g.rotation.y = it.holder.yaw;
      } else it.g.rotation.y += dt;
      if (it.kind === 'torch' && it.holder) {
        it.g.userData.flame.scale.setScalar(0.9 + Math.sin(t * 20) * 0.15);
        const pool = this.pools.find((q) => Math.hypot(q.x - it.holder.pos.x, q.z - it.holder.pos.z) < ITEMS.oil.radius + 0.3);
        if (pool) {
          const who = it.holder;
          this.items.splice(this.items.indexOf(it), 1);
          this.w.scene.remove(it.g);
          this.ignite(pool);
          this.d.popup(this.d.players.indexOf(who), 'A TOCHA ATEOU FOGO NA POÇA', '#ff9a3a');
          break;
        }
      }
      if (it.kind === 'lantern' && !it.lit) {
        const pos = it.holder ? it.holder.pos : it.g.position;
        const inFire = this.fires.some((f) => Math.hypot(f.x - pos.x, f.z - pos.z) < f.R + 0.4);
        it.lightT = inFire ? it.lightT + dt : Math.max(0, it.lightT - dt);
        if (it.lightT >= 0.8) {
          it.lit = true;
          for (const f of this.fires) if (f.hold) { f.hold = false; f.t = 0; } // a lanterna acesa: o fogo começa a apagar
          it.g.userData.glow.visible = true;
          for (const e of it.g.userData.eyes) e.material = glowMat(0xff8a1a, 0.9);
          this.w.fx.burst(new THREE.Vector3(pos.x, 2, pos.z), { count: 20, color: 0xffc040, speed: 2, up: 1.5, life: 0.5, size: 0.2 });
          this.d.audio.play('pickup', { volume: 0.9, pitch: 0.6 });
          if (it.holder) this.d.popup(this.d.players.indexOf(it.holder), 'A LANTERNA ACENDEU: ARREMESSE NAS ASSOMBRAÇÕES', '#ffe7a8');
        }
      }
      if (it.lit) it.g.userData.glow.scale.setScalar(0.9 + Math.sin(t * 13) * 0.1);
    }
    for (let i = this.flying.length - 1; i >= 0; i--) {
      const F = this.flying[i];
      F.t += dt;
      const u = Math.min(1, F.t / F.T);
      F.it.g.position.lerpVectors(F.from, F.to, u);
      F.it.g.position.y += Math.sin(u * Math.PI) * 1.4;
      F.it.g.rotation.x += dt * 10;
      if (u >= 1) { this.flying.splice(i, 1); F.it.flying = false; F.it.g.rotation.x = 0; this.land(F.it, F.to); }
    }
    for (let i = this.pools.length - 1; i >= 0; i--) {
      const q = this.pools[i];
      q.t += dt;
      q.mesh.scale.setScalar(Math.min(1, 0.2 + q.t * 3));
      if (q.t > ITEMS.oil.life) { this.w.scene.remove(q.mesh); q.mesh.geometry.dispose(); q.mesh.material.dispose(); this.pools.splice(i, 1); }
    }
    this.updateFires(dt, t);
  }

  updateFires(dt, t) {
    const FI = ITEMS.fire;
    for (let i = this.fires.length - 1; i >= 0; i--) {
      const f = this.fires[i];
      f.t += dt;
      const k = f.hold ? 0 : f.t / FI.after;
      f.mesh.scale.setScalar(f.R * (f.hold ? Math.min(1, f.t / 0.25) : 1));
      f.mesh.material.opacity = 0.5 * (k > 0.8 ? (1 - k) / 0.2 : 1) * (0.85 + 0.15 * Math.sin(t * 17));
      f.light.intensity = 5 * (k > 0.8 ? (1 - k) / 0.2 : 1) * (0.85 + 0.15 * Math.sin(t * 23));
      const fade = k > 0.8 ? (1 - k) / 0.2 : f.hold ? Math.min(1, f.t / 0.3) : 1;
      for (const c of f.tongues.children) {
        const fl = 0.75 + 0.35 * Math.sin(t * 14 + c.userData.ph) + 0.15 * Math.sin(t * 31 + c.userData.ph * 2);
        c.scale.set(fade, Math.max(0.05, fade * fl), fade);
        c.position.y = c.userData.h * fade * fl;
      }
      if (Math.random() < dt * 34 * (1 - k * 0.5)) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * f.R * 0.95;
        this.w.fx.burst(new THREE.Vector3(f.x + Math.cos(a) * r, 0.1, f.z + Math.sin(a) * r), { count: 2, color: Math.random() < 0.5 ? FIRE : 0xffd070, speed: 0.6, up: 3, life: 0.5, size: 0.36 });
      }
      if (Math.random() < dt * 4) this.w.fx.burst(new THREE.Vector3(f.x, 0.8, f.z), { count: 1, color: 0x2a2220, kind: 'smoke', speed: 0.4, up: 1.4, life: 1.1, size: 0.9, grow: 1 });
      // a BARREIRA: Assombração não entra (é empurrada para a borda) e queima enquanto encosta
      f.tick += dt;
      const burn = f.tick >= 0.5;
      if (burn) f.tick = 0;
      for (const z of this.d.copias || []) {
        if (!z.alive || z.state === 'die' || z.state === 'leave') continue;
        const dx = z.pos.x - f.x;
        const dz = z.pos.z - f.z;
        const d = Math.hypot(dx, dz) || 0.01;
        const edge = f.R + (z.radius || 0.45);
        if (d >= edge + FI.band) continue; // a faixa da borda também queima (empurrada para a borda, antes nunca queimava)
        if (d < edge) {
          z.pos.x = f.x + (dx / d) * edge;
          z.pos.z = f.z + (dz / d) * edge;
          if (z.model && z.model.root) { z.model.root.position.x = z.pos.x; z.model.root.position.z = z.pos.z; }
        }
        if (burn) {
          z.hitBy(this.d.player, Math.round(FI.dps * 0.5), { kind: 'ability', fire: true });
          this.w.fx.burst(new THREE.Vector3(z.pos.x, 1.2, z.pos.z), { count: 3, color: FIRE, speed: 1.2, up: 2, life: 0.35, size: 0.25 });
        }
      }
      if (!f.hold && f.t >= FI.after) {
        this.w.scene.remove(f.mesh, f.light, f.tongues);
        f.tongues.children.forEach((c) => c.geometry.dispose());
        f.mesh.geometry.dispose();
        f.mesh.material.dispose();
        this.fires.splice(i, 1);
      }
    }
  }

  dispose() {
    const S = this.w.scene;
    if (this.courier) S.remove(this.courier.g);
    for (const it of this.items) { S.remove(it.g); if (it.beacon) S.remove(it.beacon); }
    for (const q of this.pools) S.remove(q.mesh);
    for (const f of this.fires) S.remove(f.mesh, f.light, f.tongues);
    this.courier = null;
    this.items = [];
    this.pools = [];
    this.fires = [];
    this.flying = [];
  }
}
