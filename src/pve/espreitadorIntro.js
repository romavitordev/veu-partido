// A ENTRADA DO ESPREITADOR (pedido do dono, 2026-11-05: "não pode só spawnar"). Montada com a página da wiki (o jeito de
// ele se revelar aos poucos, as aparições na Mansão Endiabrada e o conto d'O Espreitador):
//   1. 2:11 da manhã: a goteira acelera e as luzes da casa falham (o conto e a cena do Kaiser fingindo dormir);
//   2. a câmera vai ao armário entreaberto: UM olho amarelo na fresta, tremendo, e uma lágrima cai (o som da goteira
//      é a lágrima dele: a cena do Kaiser na loja e na prisão);
//   3. o olho se multiplica — de 15 a 20 olhos na fresta — e as pupilas dobram (o quarto dos olhos de gatos);
//   4. os DEDOS LONGOS saem pela fresta e agarram a porta (o dormitório do orfanato);
//   5. a porta se escancara e ele sai CURVADO, tremendo, com a respiração engasgada ("GHLRLLGHRHGH");
//   6. o grito e o nome (a luta começa).
// Dá para pular (pulo/Enter/Start) depois de 1 s. Durante a cena ninguém se mexe; no fim o Dungeon liga a IA do chefe.
import * as THREE from 'three';

const v1 = new THREE.Vector3();
const SKIN = 0x8a8478;
const T = { flicker: 0, fresta: 2.0, tear: 2.9, multiply: 3.6, fingers: 4.5, burst: 5.6, roar: 7.6, end: 9.4 };

export class EspreitadorIntro {
  constructor(dungeon, closet) {
    this.d = dungeon;
    this.w = dungeon.world;
    this.c = closet;
    this.t = 0;
    this.dripT = 0;
    this.done = false;
    const f = new THREE.Vector3(Math.sin(closet.face), 0, Math.cos(closet.face)); // a frente da porta
    this.f = f;
    this.side = new THREE.Vector3(f.z, 0, -f.x);
    this.build();
    const b = dungeon.enemy;
    b.setVisible(false);
    b.setState('intro');
    b.pos.copy(closet.base);
    b.yaw = closet.face;
    const p = dungeon.player;
    p.cancelAction && p.cancelAction();
    p.setState('intro');
    p.vel.set(0, 0, 0);
    p.anim.play('idle', { restart: true });
    this.playShots();
    dungeon.hud.root.classList.add('pve-cine'); // sem HUD durante a cena
    dungeon.hud.callout('2:11', '#f2c230');
    this.w.audio.play('fearGaze', { volume: 0.5, pitch: 0.5 });
  }

  // o olho grande (com as pupilas) e os dedos, presos no armário (coordenadas da porta: +z é para fora)
  build() {
    const g = new THREE.Group();
    const yellow = new THREE.MeshBasicMaterial({ color: 0xffd84a, toneMapped: false });
    const black = new THREE.MeshBasicMaterial({ color: 0x050403 });
    const eye = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), yellow);
    ball.scale.z = 0.55;
    eye.add(ball);
    this.pupils = [0, 1].map((k) => {
      const pu = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), black);
      pu.position.set(0, 0, 0.035);
      pu.scale.z = 0.4;
      pu.visible = k === 0;
      eye.add(pu);
      return pu;
    });
    eye.position.set(0, 1.58, 0.36);
    eye.scale.setScalar(0);
    g.add(eye);
    this.eye = eye;
    // a lágrima (uma gota que escorre e cai)
    const tear = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: 0xb8d8e8, transparent: true, opacity: 0.85 }));
    tear.scale.y = 1.6;
    tear.visible = false;
    g.add(tear);
    this.tear = tear;
    // os dedos: compridos, finos, cinzentos, com a unha escura; saem da fresta e agarram a borda da porta
    const skin = new THREE.MeshToonMaterial({ color: SKIN });
    const nail = new THREE.MeshToonMaterial({ color: 0x1a1612 });
    this.fingers = [];
    for (let i = 0; i < 5; i++) {
      const pivot = new THREE.Group();
      const side = i < 3 ? 1 : -1;
      pivot.position.set(side * 0.02, 1.1 + i * 0.09 - (i >= 3 ? 0.12 : 0), 0.3);
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.024, 1, 6).translate(0, 0.5, 0), skin);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.017, 0.07, 5).translate(0, 0.03, 0), nail);
      tip.position.y = 1;
      const knuckle = new THREE.Group();
      knuckle.add(seg, tip);
      // para fora e para o lado (por cima da borda da porta), um pouco para baixo
      pivot.rotation.set(Math.PI / 2 - 0.25 + i * 0.05, 0, -side * (0.9 + i * 0.1));
      pivot.add(knuckle);
      pivot.scale.set(1, 0.001, 1);
      pivot.visible = false;
      g.add(pivot);
      this.fingers.push({ pivot, len: 0.5 + Math.random() * 0.2, delay: i * 0.12 });
    }
    this.c.group.add(g);
    this.group = g;
  }

  playShots() {
    const d = this.d;
    const c = this.c;
    const p = d.player;
    const f = this.f;
    const s = this.side;
    const gap = c.base.clone().addScaledVector(f, 0.4).setY(1.5);
    const from = p.pos.clone();
    const toC = new THREE.Vector3().subVectors(c.base, from).setY(0).normalize();
    const perp = new THREE.Vector3(toC.z, 0, -toC.x); // o jogador fica de lado no quadro (não tapa o armário)
    const out = c.base.clone().addScaledVector(f, 1.3);
    this.w.cameraRig.playShots([
      // 1. de trás do jogador, olhando o quarto e o armário (as luzes falham)
      { dur: T.fresta, fov: 52, pos: (k) => v1.copy(from).addScaledVector(toC, -2.6 + k * 0.8).addScaledVector(perp, 1.4).setY(2.0), look: () => gap.clone().setY(1.2) },
      // 2. a fresta de perto: o olho, a lágrima, os olhos se multiplicando, os dedos
      { dur: T.burst - T.fresta, fov: 46, pos: (k) => gap.clone().addScaledVector(f, 3.3 - k * 0.9).addScaledVector(s, 0.3).setY(1.65), look: () => gap.clone().setY(1.35) },
      // 3. a porta se escancara e ele sai, curvado
      { dur: T.roar - T.burst, fov: 50, cut: true, pos: (k) => out.clone().addScaledVector(f, 3.4 - k * 0.6).addScaledVector(s, 1.6).setY(1.5), look: () => d.enemy.pos.clone().setY(1.0) },
      // 4. o grito, de baixo
      { dur: T.end - T.roar, fov: 44, pos: (k) => d.enemy.pos.clone().addScaledVector(f, 2.3 + k * 0.4).addScaledVector(s, -0.5).setY(0.8), look: () => d.enemy.pos.clone().setY(1.7) },
    ]);
  }

  update(dt, input) {
    if (this.done) return true;
    this.t += dt;
    const t = this.t;
    const d = this.d;
    const w = this.w;
    const c = this.c;
    const b = d.enemy;
    // a luz que anda com o jogador vai para a frente do armário (a fresta precisa aparecer no escuro)
    if (t > T.fresta && t < T.roar + 1) { d.lamp.position.copy(c.base).addScaledVector(this.f, 1.8).setY(2.6); d.lamp.intensity = t < T.burst ? 2.2 : 5; }
    else { d.lamp.position.set(d.player.pos.x, 2.4, d.player.pos.z); d.lamp.intensity = 7; }
    // pular a cena
    const p0 = input.players[0];
    if (t > 1 && (p0.pressed.jump || p0.pressed.start || input.keyPressedOnce('Enter'))) { this.finish(); return true; }
    // 1. as luzes falham e a goteira acelera (o som que vem de lugar nenhum)
    const arena = w.arena;
    if (t < T.burst) arena.dim = Math.sin(t * 31) * Math.sin(t * 7) > 0.6 ? 0.1 : 0.45 + 0.1 * Math.sin(t * 5);
    else arena.dim = Math.min(1, (arena.dim ?? 0.5) + dt * 0.6);
    this.dripT -= dt;
    const gap = Math.max(0.22, 1.1 - t * 0.2);
    if (this.dripT <= 0 && t < T.burst) { this.dripT = gap; w.audio.play('drip', { volume: 0.5 + t * 0.06, pitch: 0.85 + Math.random() * 0.2 }); }
    // a porta entreaberta (a fresta); estoura no 5
    const open = t < T.fresta ? 0.12 : t < T.burst ? 0.42 + 0.05 * Math.sin(t * 40) * (t > T.fingers ? 1 : 0) : 1.25;
    c.openK += (open - c.openK) * Math.min(1, dt * (t < T.burst ? 4 : 14));
    for (const dr of c.doors) dr.pivot.rotation.y = dr.s * c.openK * 1.2;
    c.eyes.visible = t > T.multiply && t < T.burst; // os olhos pequenos da fresta só quando se multiplicam
    // 2. o olho: aparece, treme, solta a lágrima; 3. a segunda pupila
    if (t > T.fresta && t < T.burst) {
      const k = Math.min(1, (t - T.fresta) * 3);
      this.eye.scale.setScalar(k * (1 + 0.06 * Math.sin(t * 50)));
      this.eye.position.x = Math.sin(t * 37) * 0.006;
      this.pupils[1].visible = t > T.multiply + 0.4;
      if (this.pupils[1].visible) { this.pupils[0].position.x = -0.022; this.pupils[1].position.x = 0.022; }
    } else this.eye.scale.setScalar(0);
    if (t > T.tear && t < T.tear + 0.9) {
      this.tear.visible = true;
      const k = (t - T.tear) / 0.9;
      this.tear.position.set(0.02, 1.52 - k * k * 1.4, 0.36);
      if (!this.tearSound && k > 0.95) { this.tearSound = true; w.audio.play('drip', { volume: 1, pitch: 0.8 }); }
    } else this.tear.visible = false;
    if (t > T.multiply && !this.multiplied) { this.multiplied = true; w.audio.play('fearGaze', { volume: 0.8, pitch: 1.2 }); }
    // os olhos pequenos da fresta acendem um a um (15 a 20 na wiki)
    if (t > T.multiply) c.eyes.children.forEach((e, i) => e.scale.setScalar(t - T.multiply > i * 0.08 ? 1.3 : 0));
    // 4. os dedos saindo da fresta
    for (const fg of this.fingers) {
      const k = THREE.MathUtils.clamp((t - T.fingers - fg.delay) / 0.7, 0, 1);
      fg.pivot.visible = k > 0 && t < T.burst + 0.1;
      fg.pivot.scale.set(1, Math.max(0.001, fg.len * k * k * (3 - 2 * k)), 1);
      if (k > 0.9) fg.pivot.rotation.z += Math.sin(t * 30 + fg.delay * 20) * 0.004; // tremendo
    }
    if (t > T.fingers && !this.creak) { this.creak = true; w.audio.play('creak', { volume: 1, pitch: 0.7 }); }
    // 5. a porta estoura e ele sai rastejando, curvado e tremendo
    if (t > T.burst && !this.out) {
      this.out = true;
      w.audio.play('closetSlam', { volume: 1.2, pitch: 0.6 });
      w.cameraRig.shake(0.3, 0.4);
      b.setVisible(true);
      b.pos.copy(c.base).addScaledVector(this.f, 0.2);
      b.yaw = c.face;
      b.anim.play('fear', { restart: true });
      w.fx.burst(c.base.clone().addScaledVector(this.f, 0.6).setY(1.2), { count: 30, color: 0x2a2620, kind: 'smoke', speed: 2.2, life: 0.8, size: 0.7, grow: 1 });
    }
    if (this.out && t < T.roar) {
      const k = (t - T.burst) / (T.roar - T.burst);
      b.pos.copy(c.base).addScaledVector(this.f, 0.2 + 1.3 * Math.sin(k * Math.PI / 2));
      if (b.rig.body) b.rig.body.position.x = Math.sin(t * 60) * 0.03;
      if (Math.random() < dt * 6) w.fx.burst(b.chestPos(v1).setY(b.pos.y + 1.5).clone(), { count: 2, color: 0x9ab0c0, speed: 0.6, life: 0.6, size: 0.06, grav: 4 }); // lágrimas
      if (!this.breath && k > 0.3) { this.breath = true; w.audio.play('fearGaze', { volume: 1, pitch: 0.45 }); } // a respiração engasgada
    }
    // 6. o grito e o nome
    if (t > T.roar && !this.roared) {
      this.roared = true;
      if (b.rig.body) b.rig.body.position.x = 0;
      b.yaw = Math.atan2(d.player.pos.x - b.pos.x, d.player.pos.z - b.pos.z);
      b.anim.play('taunt_roar', { restart: true, duration: T.end - T.roar });
      w.audio.play('fearGaze', { volume: 1.2, pitch: 0.7 });
      w.cameraRig.shake(0.35, 0.6);
      w.showBanner(b.def.name, b.def.color);
    }
    if (t >= T.end) { this.finish(); return true; }
    return false;
  }

  finish() {
    if (this.done) return;
    this.done = true;
    const w = this.w;
    const b = this.d.enemy;
    w.arena.dim = 1;
    w.cameraRig.stopShots();
    this.d.hud.root.classList.remove('pve-cine');
    if (b.rig.body) b.rig.body.position.x = 0;
    b.setVisible(true);
    if (!this.out) { b.pos.copy(this.c.base).addScaledVector(this.f, 1.5); }
    b.yaw = Math.atan2(this.d.player.pos.x - b.pos.x, this.d.player.pos.z - b.pos.z);
    this.c.warnT = 0;
    this.d.lamp.intensity = 7;
    this.dispose();
  }

  dispose() {
    if (!this.group) return;
    this.group.parent && this.group.parent.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.group = null;
  }
}
