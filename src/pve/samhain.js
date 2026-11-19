// A NOITE DO SAMHAIN EM TREB CIACH — a parte 1 da fase de ondas de A Vigília (pedido do dono, 2026-11-18: "o player
// protegeria das assombrações e protegeria a vila, tentando impedir que o numero de aldeões vivos chegue a zero";
// "primeiro ficaram até x rodadas derrotando ali proximo a chama de proteção mesmo, mas vai começar a trovejar muito e
// vai vir muitas assombrações de uma vez").
// As CASAS em volta da praça (as mesmas do mapa: tools/blender/arena_treb_ciach.py HOUSES) têm cada uma a LAMPARINA da
// porta com a Chama de Proteção e alguns aldeões dentro. As Assombrações vão atrás das portas (combat/assombracao.js:
// a casa é um alvo como quem joga); quando a lamparina de uma casa apaga, os aldeões dela morrem. ALDEÕES VIVOS chegando
// a zero = derrota. Quem joga REACENDE a lamparina ficando parado perto da porta sem Assombração por perto (o ep. 3:
// "a chama deve ser espalhada pelas casas"). No fim, a TEMPESTADE (trovões e raios) e a leva enorme.
// Cânone: as lamparinas da Chama de Proteção nas portas, as Assombrações indo às casas apagadas, a tempestade
// impossível do Samhain. PROPOSTA: quantos aldeões por casa, a vida das lamparinas, o reacender e os números da tempestade.
import * as THREE from 'three';
import { makeLightning } from '../arena/nightLife.js';
import { distXZ } from '../core/util.js';
import { buildAssombracao } from '../models/assombracao.js';

// as casas do mapa: [ângulo, raio, largura, fundo] (arena_treb_ciach.py HOUSES) e os aldeões de cada uma (são ~15 nomeados)
const HOUSES = [[0.62, 26.5, 8.5, 5.0], [1.05, 28.5, 7.0, 4.6], [2.1, 26.5, 9.0, 5.2], [2.62, 28.5, 7.5, 4.8],
  [Math.PI, 31, 11, 6.0], [4.45, 26.5, 8.0, 5.0], [5.0, 28.5, 9.5, 5.2], [5.62, 26.5, 7.0, 4.6]];
const VILLAGERS = [2, 2, 2, 2, 3, 2, 1, 1];
const ARROW_V = new THREE.Vector3();
export const VILLAGE = {
  lampHp: { easy: 300, normal: 250, hard: 205, superhard: 170, annihilation: 140 }, // mais vida (a vila ficou mais longa)
  relight: 22, // vida por segundo que a lamparina recupera com alguém parado perto
  relightRange: 2.2,
  rest: 0.35, // a chama que volta sozinha entre as ondas (fração da vida)
  safeRange: 3.2, // sem Assombração a esta distância da porta
  alertEvery: 6,
};

// a porta de cada casa, puxada para dentro do limite da luta (as casas ficam na borda)
export function houseDoors(limit) {
  return HOUSES.map(([a, r, w, d], i) => {
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const ry = Math.atan2(-x, -z);
    const c = Math.cos(ry), s = Math.sin(ry);
    const lx = -w * 0.22, lz = d / 2 + 0.5;
    let dx = x + lx * c + lz * s, dz = z - lx * s + lz * c;
    const rr = Math.hypot(dx, dz);
    if (rr > limit) { dx *= limit / rr; dz *= limit / rr; }
    return { i, x: dx, z: dz, villagers: VILLAGERS[i] };
  });
}

class House {
  constructor(v, door, hp) {
    this.v = v;
    this.isHouse = true;
    this.index = door.i;
    this.pos = new THREE.Vector3(door.x, 0, door.z);
    this.radius = 0.6;
    this.height = 2;
    this.maxHp = hp;
    this.hp = hp;
    this.villagers = door.villagers;
    this.state = 'idle';
    this.alertAt = -99;
    // a lamparina (a chama amarela) e o anel no chão que mostra quanto ela aguenta
    const g = new THREE.Group();
    g.position.copy(this.pos);
    this.flame = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd84a }));
    this.flame.position.y = 1.9;
    this.halo = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffc040, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.halo.position.y = 1.9;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.8, 6), new THREE.MeshLambertMaterial({ color: 0x3a2a1c }));
    post.position.y = 0.9;
    this.ringBg = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 40), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
    this.ringBg.rotation.x = -Math.PI / 2;
    this.ringBg.position.y = 0.04;
    this.ringMat = new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.85, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 40, 1, 0, Math.PI * 2), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.05;
    g.add(post, this.flame, this.halo, this.ringBg, this.ring);
    // OS INDICADORES (dono, 2026-11-19: "Deve ter mais um indicador visual que as casas nao estao protegidas pelo fogo …
    // é bem dificil de distinguir qual casa está sendo atacada"): o DOMO da Chama de Proteção sobre a porta (forte com
    // a lamparina cheia, some quando ela apaga) e a COLUNA VERMELHA que pulsa sobre a casa atacada, vista de longe
    this.domeMat = new THREE.MeshBasicMaterial({ color: 0xffc84a, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(2.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), this.domeMat);
    this.beaconMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    this.beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 14, 12, 1, true), this.beaconMat);
    this.beacon.position.y = 7;
    this.mark = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 4), new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0, depthWrite: false }));
    this.mark.rotation.x = Math.PI; // a seta para baixo, em cima da casa
    this.mark.position.y = 4.2;
    g.add(this.dome, this.beacon, this.mark);
    // MAIS DETALHES NA PORTA (dono, 2026-11-19; PROPOSTA de enfeite): a gaiola de ferro da lamparina (as quatro hastes,
    // o telhadinho e o prato), o braço do poste, o NABO ENTALHADO do Samhain no chão (a cara acesa apaga junto com a
    // lamparina) e a oferenda (a tigela com maçãs e o feixe de palha)
    const iron = new THREE.MeshLambertMaterial({ color: 0x1e1a16 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.42, 0.025), iron);
      bar.position.set(Math.cos(a) * 0.17, 1.9, Math.sin(a) * 0.17);
      g.add(bar);
    }
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 4), iron);
    cap.rotation.y = Math.PI / 4;
    cap.position.y = 2.2;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.05, 4), iron);
    plate.rotation.y = Math.PI / 4;
    plate.position.y = 1.68;
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 5, 10), iron);
    hook.position.y = 2.33;
    g.add(cap, plate, hook);
    const toCenter = Math.atan2(-this.pos.x, -this.pos.z);
    const deco = new THREE.Group();
    deco.rotation.y = toCenter;
    g.add(deco);
    const nabo = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshLambertMaterial({ color: 0xd8c8a0 }));
    nabo.scale.set(1, 0.9, 1);
    nabo.position.set(0.75, 0.2, 0.35);
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 5), new THREE.MeshLambertMaterial({ color: 0x5a6a2a }));
    leaves.position.set(0.75, 0.46, 0.35);
    this.faceMat = new THREE.MeshBasicMaterial({ color: 0xff9a2a });
    const eyeGeo = new THREE.CircleGeometry(0.045, 3);
    for (const ex of [-0.07, 0.07]) {
      const eye = new THREE.Mesh(eyeGeo, this.faceMat);
      eye.position.set(0.75 + ex, 0.26, 0.35 + 0.215);
      eye.rotation.z = Math.PI;
      deco.add(eye);
    }
    const mouth = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.035), this.faceMat);
    mouth.position.set(0.75, 0.15, 0.35 + 0.218);
    deco.add(nabo, leaves, mouth);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.13, 0.1, 10), new THREE.MeshLambertMaterial({ color: 0x6a4a2c }));
    bowl.position.set(-0.75, 0.05, 0.4);
    deco.add(bowl);
    for (const [ax, az] of [[-0.08, 0], [0.07, 0.04], [0, -0.07]]) {
      const apple = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshLambertMaterial({ color: 0xa82a20 }));
      apple.position.set(-0.75 + ax, 0.14, 0.4 + az);
      deco.add(apple);
    }
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.5, 7), new THREE.MeshLambertMaterial({ color: 0xc8a050 }));
    straw.position.set(-1.05, 0.25, 0.05);
    straw.rotation.z = 0.15;
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 4, 10), new THREE.MeshLambertMaterial({ color: 0x8a2a20 }));
    tie.rotation.x = Math.PI / 2;
    tie.position.set(-1.04, 0.32, 0.05);
    deco.add(straw, tie);
    v.d.world.scene.add(g);
    this.group = g;
    this.shown = 1;
  }

  get alive() { return this.state !== 'ko'; }
  isInvulnerable() { return this.state === 'ko'; }
  chestPos(out = new THREE.Vector3()) { return out.set(this.pos.x, 1.4, this.pos.z); }

  hurt(dmg) {
    if (this.state === 'ko') return;
    this.hp = Math.max(0, this.hp - dmg);
    this.hitAt = this.v.t;
    this.v.onHouseHit(this);
    if (this.hp <= 0) {
      this.state = 'ko';
      this.v.onHouseLost(this);
    }
  }

  update(dt, t) {
    const k = this.hp / this.maxHp;
    if (Math.abs(k - this.shown) > 0.01) {
      this.shown = k;
      this.ring.geometry.dispose();
      this.ring.geometry = new THREE.RingGeometry(0.85, 1.0, 40, 1, Math.PI / 2, Math.max(0.001, Math.PI * 2 * k));
      this.ringMat.color.setHex(0xffd84a); // sempre amarela: o tamanho do arco mostra quanto falta
    }
    const lit = this.state !== 'ko';
    // QUASE APAGANDO (dono, 2026-11-19: "deveria permanecer amarelo e piscar desligando e ligando"): abaixo de 35% a
    // chama falha — apaga e acende, sempre amarela, cada vez mais seguido quanto mais fraca. Atacada, o aviso é a coluna
    // vermelha e a seta (não o domo).
    const hitAgo = t - (this.hitAt ?? -99);
    const attacked = lit && hitAgo < 2.5;
    let on = true;
    if (lit && k < 0.35) {
      const rate = 5 + (1 - k / 0.35) * 7;
      on = Math.sin(t * rate + this.index) + 0.45 * Math.sin(t * rate * 2.3 + this.index * 5) > -0.35;
    }
    this.flame.visible = lit && on;
    this.halo.visible = lit && on;
    this.dome.visible = lit && on;
    if (lit) {
      this.domeMat.color.setHex(0xffc84a);
      this.domeMat.opacity = attacked ? 0.12 + 0.06 * k : 0.05 + 0.1 * k;
      this.dome.scale.setScalar(0.75 + 0.25 * k);
    }
    const pulse = attacked ? (1 - hitAgo / 2.5) * (0.6 + 0.4 * Math.sin(t * 10)) : 0;
    this.beaconMat.opacity = 0.32 * pulse;
    this.mark.material.opacity = pulse > 0 ? 0.95 : 0;
    this.mark.position.y = 4.2 + Math.sin(t * 6) * 0.25;
    this.mark.rotation.y = t * 2;
    this.attacked = attacked;
    if (lit) {
      const f = 0.85 + Math.sin(t * 11 + this.index) * 0.08 + Math.sin(t * 23 + this.index * 2) * 0.05;
      this.halo.scale.setScalar(f * (0.6 + 0.4 * k));
      this.halo.material.opacity = 0.18 + 0.14 * k;
      if (on) this.faceMat.color.setHex(0xff9a2a).multiplyScalar(0.75 + 0.25 * Math.sin(t * 9 + this.index * 3));
      else this.faceMat.color.setHex(0x1a120c); // a chama falhou: o nabo apaga junto
    } else {
      this.ringBg.material.opacity = 0.2;
      this.faceMat.color.setHex(0x1a120c); // o nabo apagou com a lamparina
    }
  }

  dispose() {
    this.v.d.world.scene.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }
}

export class SamhainVillage {
  constructor(d, W) {
    this.d = d;
    this.W = W;
    this.t = 0;
    const hp = VILLAGE.lampHp[d.run && d.run.difficulty] || VILLAGE.lampHp.normal;
    this.houses = houseDoors((W.bounds || 23) - 0.7).map((door) => new House(this, door, hp));
    this.total = this.houses.reduce((n, h) => n + h.villagers, 0);
    this.lost = false;
    this.storm = null;
  }

  get alive() { return this.houses.filter((h) => h.alive).reduce((n, h) => n + h.villagers, 0); }

  // o FÔLEGO entre as ondas: os aldeões avivam por dentro a chama das casas ainda acesas (+`VILLAGE.rest` da vida).
  // Sem isso, com a vila mais longa da v5.24, a Tempestade apagava as últimas casas mesmo jogando bem. PROPOSTA.
  rest() {
    let n = 0;
    for (const h of this.houses) {
      if (!h.alive || h.hp >= h.maxHp) continue;
      h.hp = Math.min(h.maxHp, h.hp + h.maxHp * VILLAGE.rest);
      n++;
    }
    if (n) this.d.popup(0, 'OS ALDEÕES AVIVARAM AS CHAMAS', '#ffd84a');
  }

  // A HORDA (dono, 2026-11-19: "uma onda de bichos que aparece em uma cutscene dele na parte 1, vindo uma horda de
  // assombrações de todos os lados, ele foge pra parte 2"): passada a tempestade, Assombrações saem da névoa por todos os
  // lados e ENCURRALAM quem joga (dono: "nao deveriam cercar o personagem na cutscene, mas encurralar ele pra ele fugir
  // pelo corredor"): um arco por trás e pelos lados que fecha, a única brecha é a entrada do corredor; o personagem
  // recua, vira e dispara para lá. Só cena (não atacam).
  hordeScene(dur = 3.2, exit = null) {
    const d = this.d;
    const p = d.player;
    const cx = p.pos.x, cz = p.pos.z;
    const ex = exit ? exit.x : 0, ez = exit ? exit.z : 0;
    const aim = Math.atan2(ex - cx, ez - cz); // a direção da fuga (a entrada do corredor)
    const gap = 1.25; // meia abertura do arco (rad): a brecha que sobra
    const n = 26;
    const list = [];
    for (let i = 0; i < n; i++) {
      const m = buildAssombracao();
      const a = aim + gap + ((i + 0.5) / n) * (Math.PI * 2 - gap * 2) + (Math.random() - 0.5) * 0.12;
      const r0 = 19 + Math.random() * 6;
      const r1 = 5 + Math.random() * 1.6;
      m.root.position.set(cx + Math.sin(a) * r0, 0.06, cz + Math.cos(a) * r0);
      m.root.rotation.y = a + Math.PI; // de frente para o meio
      d.world.scene.add(m.root);
      list.push({ m, a, r0, r1, seed: i * 1.7 });
    }
    this.horde = { list, t: 0, dur, cx, cz, aim, ex, ez, ran: false };
    for (const q of d.players) { q.vel.set(0, 0, 0); q.setState('intro'); q.yaw = aim + Math.PI; q.anim && q.anim.play('idle', { restart: true }); }
    // a câmera por trás da horda (do lado oposto à brecha), alta, olhando por cima de quem joga para a saída
    const back = aim + Math.PI;
    const cam = d.world.cameraRig;
    cam && cam.playShots([{
      dur: dur + 0.6,
      fov: 60,
      pos: (k) => new THREE.Vector3(cx + Math.sin(back + 0.5 - k * 0.5) * (14 - k * 3), 7 + k * 2, cz + Math.cos(back + 0.5 - k * 0.5) * (14 - k * 3)),
      look: () => new THREE.Vector3(p.pos.x + Math.sin(aim) * 3, 0.8, p.pos.z + Math.cos(aim) * 3),
    }]);
    d.hud.callout('A HORDA ENCURRALOU VOCÊ: FUJA PELO CORREDOR!', '#ff6a4a');
    d.audio.play('fearGaze', { volume: 1, pitch: 0.4 });
    d.world.cameraRig && d.world.cameraRig.shake(0.2, 0.5);
  }

  updateHorde(dt) {
    const H = this.horde;
    if (!H) return;
    H.t += dt;
    const k = Math.min(1, H.t / H.dur);
    // quem joga: recua de costas para a brecha olhando a horda e, no meio da cena, vira e dispara para o corredor
    const run = k > 0.5;
    for (const q of this.d.players) {
      if (run && !H.ran) { q.yaw = H.aim; q.anim && q.anim.play('run', { restart: true }); }
      const sp = run ? 6.5 : 1.2;
      if (Math.hypot(H.ex - q.pos.x, H.ez - q.pos.z) < 2) continue; // já na entrada do corredor
      q.pos.x += Math.sin(H.aim) * sp * dt;
      q.pos.z += Math.cos(H.aim) * sp * dt;
    }
    if (run) H.ran = true;
    for (const c of H.list) {
      const r = c.r0 - (c.r0 - c.r1) * (1 - (1 - k) * (1 - k));
      c.m.root.position.x = H.cx + Math.sin(c.a) * r;
      c.m.root.position.z = H.cz + Math.cos(c.a) * r;
      c.m.root.position.y = 0.06 + Math.sin(H.t * 2.4 + c.seed) * 0.06;
      const J = c.m.joints;
      if (J && J.armR && J.armR.sh) J.armR.sh.rotation.x = -1.1 + Math.sin(H.t * 3 + c.seed) * 0.2;
      if (J && J.armL && J.armL.sh) J.armL.sh.rotation.x = -1.0 + Math.sin(H.t * 2.7 + c.seed) * 0.2;
      if (Math.random() < dt * 1.5) this.d.world.fx.burst(c.m.root.position.clone().setY(0.3), { count: 2, color: 0x5ad0ff, kind: 'smoke', speed: 0.6, up: 1, life: 0.8, size: 0.6, grow: 1 });
    }
  }

  clearHorde() {
    const H = this.horde;
    if (!H) return;
    for (const c of H.list) this.d.world.scene.remove(c.m.root); // a geometria é do .glb compartilhado: não libera
    this.horde = null;
  }

  // a SETA NA BORDA DA TELA para a casa atacada que está fora da vista
  updateArrow() {
    const w = this.d.world;
    const cam = w.camera;
    const el = w.renderer && w.renderer.domElement;
    if (!cam || !el) return;
    if (!this.arrow) {
      const a = document.createElement('div');
      a.className = 'pv-house-arrow';
      a.textContent = '▲';
      (el.parentElement || document.body).appendChild(a);
      this.arrow = a;
    }
    const h = this.houses.filter((x) => x.attacked).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (!h) { this.arrow.style.display = 'none'; return; }
    const s = ARROW_V.set(h.pos.x, 2, h.pos.z).project(cam);
    const behind = s.z > 1;
    const on = !behind && Math.abs(s.x) < 0.92 && Math.abs(s.y) < 0.9;
    if (on) { this.arrow.style.display = 'none'; return; }
    let x = behind ? -s.x : s.x;
    let y = behind ? -s.y : s.y;
    if (behind && Math.abs(y) < 0.2) y = -1; // atrás: aponta para baixo
    const m = Math.max(Math.abs(x), Math.abs(y)) || 1;
    x = (x / m) * 0.9;
    y = (y / m) * 0.86;
    const W = el.clientWidth, H = el.clientHeight;
    this.arrow.style.display = 'block';
    this.arrow.style.left = `${(x + 1) / 2 * W}px`;
    this.arrow.style.top = `${(1 - y) / 2 * H}px`;
    this.arrow.style.transform = `translate(-50%, -50%) rotate(${Math.atan2(x, y)}rad)`;
  }

  // os alvos das Assombrações: as casas ainda acesas
  targets() { return this.houses.filter((h) => h.alive); }

  label() { return `Aldeões ${this.alive}/${this.total}`; }

  onHouseHit(h) {
    const d = this.d;
    if (this.t - h.alertAt > VILLAGE.alertEvery) {
      h.alertAt = this.t;
      d.hud.callout('UMA CASA ESTÁ SENDO ATACADA', '#ffb84a');
      d.audio.play('fearGaze', { volume: 0.5, pitch: 1.4 });
    }
  }

  onHouseLost(h) {
    const d = this.d;
    d.hud.callout(h.villagers > 1 ? `A LAMPARINA APAGOU: ${h.villagers} ALDEÕES MORRERAM` : 'A LAMPARINA APAGOU: UM ALDEÃO MORREU', '#ff4a3a');
    d.audio.play('drain', { volume: 0.9, pitch: 0.6 });
    d.world.fx.burst(h.chestPos(new THREE.Vector3()), { count: 30, color: 0x2a2c30, kind: 'smoke', speed: 1.6, up: 1.5, life: 1.2, size: 0.8, grow: 1 });
    d.waveObjective();
    if (this.alive <= 0 && !this.lost) {
      this.lost = true;
      d.onVillageLost();
    }
  }

  update(dt) {
    const d = this.d;
    this.t += dt;
    for (const h of this.houses) h.update(dt, this.t);
    // REACENDER: alguém parado perto da porta, sem Assombração por perto, devolve a chama aos poucos
    for (const h of this.houses) {
      if (!h.alive || h.hp >= h.maxHp) continue;
      const near = d.players.some((p) => p.state !== 'ko' && distXZ(p.pos, h.pos) < VILLAGE.relightRange);
      if (!near) continue;
      const threat = d.copias.some((c) => c.alive && c.state !== 'die' && distXZ(c.pos, h.pos) < VILLAGE.safeRange);
      if (threat) continue;
      h.hp = Math.min(h.maxHp, h.hp + VILLAGE.relight * dt);
      if (Math.random() < dt * 8) d.world.fx.burst(h.chestPos(new THREE.Vector3()).setY(1.9), { count: 2, color: 0xffd84a, speed: 0.8, up: 1.2, life: 0.5, size: 0.08 });
    }
    if (this.storm) this.updateStorm(dt);
    this.updateHorde(dt);
    this.updateArrow();
  }

  // A TEMPESTADE do fim (o ep. 3: a tempestade impossível): o céu escurece, relâmpagos e raios caindo na praça
  startStorm() {
    const d = this.d;
    const w = d.world;
    const group = new THREE.Group();
    w.scene.add(group);
    const sky = makeLightning(group, { interval: [0.6, 1.8], distance: 90, top: 70, bottom: 10, intensity: 3.2, skyOpacity: 0.55, color: 0xc8d8ff });
    const lights = [];
    w.scene.traverse((o) => { if (o.isLight && o.intensity > 0 && !group.children.includes(o)) lights.push([o, o.intensity]); });
    const fog = w.scene.fog;
    this.storm = { group, sky, lights, fog: fog ? { c: fog.color.clone(), dens: fog.density } : null, k: 0, next: 1.2 };
    d.audio.play('explosion', { volume: 0.6, pitch: 0.4 });
  }

  updateStorm(dt) {
    const S = this.storm;
    const w = this.d.world;
    S.k = Math.min(1, S.k + dt / 3);
    S.sky.update(dt);
    for (const [o, i0] of S.lights) o.intensity = i0 * (1 - 0.5 * S.k);
    const fog = w.scene.fog;
    if (fog && S.fog) {
      fog.color.copy(S.fog.c).lerp(new THREE.Color(0x141c26), S.k * 0.8);
      if (fog.density !== undefined) fog.density = S.fog.dens * (1 + 0.5 * S.k);
    }
    // os raios caindo na praça (um aviso de luz e o estrondo); só visual, não machuca (PROPOSTA)
    S.next -= dt;
    if (S.next <= 0) {
      S.next = 0.9 + Math.random() * 1.6;
      const a = Math.random() * Math.PI * 2, r = 8 + Math.random() * 14;
      const at = new THREE.Vector3(Math.sin(a) * r, 0.1, Math.cos(a) * r);
      w.fx.lightning(at.clone().setY(16), at, { color: 0xd8e4ff, life: 0.3 });
      w.fx.lightning(at.clone().setY(16).add(new THREE.Vector3(0.6, 0, 0.3)), at, { color: 0xffffff, life: 0.15 });
      w.fx.burst(at, { count: 14, color: 0xc8d8ff, speed: 3, up: 2, life: 0.4, size: 0.12 });
      this.d.audio.play('explosion', { volume: 0.35 + Math.random() * 0.2, pitch: 0.35 + Math.random() * 0.2 });
      w.cameraRig && w.cameraRig.shake(0.15, 0.25);
    }
  }

  dispose() {
    for (const h of this.houses) h.dispose();
    if (this.arrow) { this.arrow.remove(); this.arrow = null; }
    this.clearHorde();
    const S = this.storm;
    if (S) {
      for (const [o, i0] of S.lights) o.intensity = i0;
      const fog = this.d.world.scene.fog;
      if (fog && S.fog) { fog.color.copy(S.fog.c); if (fog.density !== undefined) fog.density = S.fog.dens; }
      this.d.world.scene.remove(S.group);
      S.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      this.storm = null;
    }
  }
}
