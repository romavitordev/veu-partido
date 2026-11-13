// AS CENAS DE ENTRADA DA TORRE (pedido do dono, 2026-11-13: "cinematics/cutscenes da aparição do boss/mini bosses").
// Todas com cara de TRANSMISSÃO (Sinais do Outro Lado): chiado na tela, linhas de varredura, o nome que falha.
//  · O ESTRANGEIRO (Sala do Sino): a porta verde bate, as luzes falham, o SINO toca sozinho; a câmera desce do sino até a
//    interferência e ele se forma piscando entre os quadros — a máscara em close, o nome. Cânone (ep. 7): ninguém
//    lembrava que ele existia (por isso ele "aparece" de um vazio) e o sino é a chave da sala. PROPOSTA: os planos.
//  · O RASTROPODA: a cena é vista PELA LENTE da câmera do tripé (cânone: o Guizo só o enxergou pela câmera) — com o
//    "REC" piscando ele aparece inteiro; o corte volta para a sala e não há nada ali, só o chão tremendo.
//  · O BILU (o quarto escuro): o barulho de bicho, dois olhos verdes no escuro, a câmera chega perto… o clarão mostra o
//    chapéu de cogumelo por um instante e ele some (volta já na luta). Cânone: no ep. 7 ele é só OUVIDO.
// O jogador pula a cena com PULO/START depois de 1 s. Enquanto ela corre, o Dungeon não atualiza as salas nem os
// minibosses (Dungeon.update → bossIntro), e o NPC da cena fica preso (held) para não atacar ninguém.
import * as THREE from 'three';

const v1 = new THREE.Vector3();
const GREEN = 0x8aff4a;
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);

// o véu de transmissão sobre a tela (styles.css #sigfx): chiado + linhas; .rec = a lente da câmera do tripé
function sigOverlay(hud, cls = '') {
  const el = document.createElement('div');
  el.id = 'sigfx';
  el.className = cls;
  el.innerHTML = '<i class="snow"></i><i class="lines"></i><b class="rec">● REC</b><u class="tc"></u>';
  hud.root.appendChild(el);
  return el;
}

class TorreIntro {
  constructor(dungeon, { overlay = '' } = {}) {
    this.d = dungeon;
    this.w = dungeon.world;
    this.t = 0;
    this.done = false;
    for (const q of dungeon.players) {
      q.cancelAction && q.cancelAction();
      q.setState('intro');
      q.vel.set(0, 0, 0);
      q.anim.play('idle', { restart: true });
    }
    dungeon.hud.root.classList.add('pve-cine');
    this.fx = sigOverlay(dungeon.hud, overlay);
  }

  // chiado forte por um instante (os cortes da transmissão)
  burst(k = 1) {
    if (!this.fx) return;
    this.fx.style.setProperty('--snow', String(k));
    this.fx.classList.remove('hit');
    void this.fx.offsetWidth;
    this.fx.classList.add('hit');
  }

  skip(input) {
    const p0 = input.players[0];
    return this.t > 1 && (p0.pressed.jump || p0.pressed.start || input.keyPressedOnce('Enter'));
  }

  // devolve true quando a cena acabou
  update(dt, input) {
    if (this.done) return true;
    this.t += dt;
    if (this.fx) { const tc = this.fx.querySelector('.tc'); if (tc) tc.textContent = `00:0${Math.floor(this.t / 60)}:${String(Math.floor(this.t % 60)).padStart(2, '0')}:${String(Math.floor((this.t * 30) % 30)).padStart(2, '0')}`; }
    if (this.skip(input)) { this.finish(); return true; }
    this.tick(dt, this.t);
    if (this.t >= this.length) { this.finish(); return true; }
    return false;
  }

  tick() {}

  finish() {
    if (this.done) return;
    this.done = true;
    this.w.cameraRig.stopShots();
    this.d.hud.root.classList.remove('pve-cine');
    if (this.fx) { this.fx.remove(); this.fx = null; }
    for (const q of this.d.players) if (q.state === 'intro') q.setState('idle');
    this.end && this.end();
  }

  dispose() { if (this.fx) { this.fx.remove(); this.fx = null; } }
}

// ================================================================== O ESTRANGEIRO
export class EstrangeiroIntro extends TorreIntro {
  constructor(dungeon, spot, bell) {
    super(dungeon);
    this.length = 7.4;
    const b = dungeon.enemy;
    this.spot = new THREE.Vector3(spot.x, 0, spot.z);
    b.setVisible(false);
    b.setState('intro');
    b.pos.copy(this.spot);
    b.yaw = yawTo(b.pos, dungeon.player.pos);
    const p = dungeon.player.pos.clone();
    const to = this.spot;
    const dir = new THREE.Vector3().subVectors(to, p).setY(0).normalize();
    const perp = new THREE.Vector3(dir.z, 0, -dir.x);
    const top = bell ? new THREE.Vector3(bell.x, bell.y ?? 4.2, bell.z) : to.clone().setY(4.5);
    this.w.cameraRig.playShots([
      // 1. de trás de quem entrou: a sala escura, a porta verde batendo
      { dur: 1.9, fov: 58, pos: (k) => v1.copy(p).addScaledVector(dir, -3.2 + k * 0.5).addScaledVector(perp, 1.2).setY(2.1), look: () => to.clone().setY(1.8) },
      // 2. o SINO, de baixo, tocando sozinho
      { dur: 1.8, fov: 46, cut: true, pos: (k) => top.clone().addScaledVector(dir, -3.4).addScaledVector(perp, 1.4 - k * 0.8).setY(1.4), look: () => top },
      // 3. desce até a interferência: ele se forma
      { dur: 2.0, fov: 44, cut: true, pos: (k) => to.clone().addScaledVector(dir, -5.2 + k * 1.2).addScaledVector(perp, -0.8).setY(1.5), look: (k) => to.clone().setY(1.2 + k * 0.6) },
      // 4. a máscara em close (o nome)
      { dur: 1.9, fov: 34, cut: true, pos: (k) => to.clone().addScaledVector(dir, -2.3 + k * 0.25).addScaledVector(perp, 0.3).setY(1.75), look: () => to.clone().setY(1.85) },
    ]);
    this.w.audio.play('closetSlam', { volume: 0.8, pitch: 0.55 });
    this.burst(0.8);
  }

  tick(dt, t) {
    const w = this.w;
    const b = this.d.enemy;
    // o sino toca (2 batidas) no 2º plano
    if (t > 2.0 && !this.bell1) { this.bell1 = true; w.audio.play('bellToll', { volume: 0.9, pitch: 0.8 }); w.cameraRig.shake(0.12, 0.4); this.burst(0.6); }
    if (t > 3.0 && !this.bell2) { this.bell2 = true; w.audio.play('bellToll', { volume: 1, pitch: 0.75 }); this.burst(0.9); }
    // a interferência no chão
    if (t > 3.6 && t < 5.6 && Math.random() < dt * 10) w.fx.burst(this.spot.clone().add(v1.set((Math.random() - 0.5) * 1.6, 0.2 + Math.random() * 1.8, (Math.random() - 0.5) * 1.6)), { count: 2, color: GREEN, speed: 0.6, life: 0.5, size: 0.14 });
    if (t > 3.7 && !this.formed) { this.formed = true; w.fx.distort(this.spot.clone().setY(1.2), { color: GREEN, radius: 2.6, life: 1.6 }); w.audio.play('teleport', { volume: 0.9, pitch: 0.45 }); }
    // ele pisca entre os quadros (o sinal falhando) até firmar
    if (this.formed && t < 5.4) { const on = Math.sin(t * 31) > (t < 4.6 ? 0.4 : -0.3); b.setVisible(on); if (!on && Math.random() < dt * 6) this.burst(0.5); }
    if (t > 5.4 && !this.named) {
      this.named = true;
      b.setVisible(true);
      b.anim.play('idle', { restart: true });
      w.audio.play('fearGaze', { volume: 1, pitch: 0.45 });
      w.cameraRig.shake(0.25, 0.5);
      this.burst(1);
      w.showBanner(b.def.name, '#8acf4a');
    }
  }

  end() {
    const b = this.d.enemy;
    b.setVisible(true);
    b.pos.copy(this.spot);
    b.yaw = yawTo(b.pos, this.d.player.pos);
  }
}

// ================================================================== O RASTROPODA (pela lente da câmera do tripé)
export class RastropodaIntro extends TorreIntro {
  constructor(dungeon, room) {
    super(dungeon, { overlay: 'rec' });
    this.length = 6.2;
    this.room = room;
    const b = room.boss;
    this.b = b;
    b.held = true;
    const C = room.cam;
    const lens = new THREE.Vector3(C.x, 1.5, C.z);
    this.lensX = C.x;
    this.lensZ = C.z;
    const at = b.pos.clone();
    const p = dungeon.player.pos.clone();
    const dir = new THREE.Vector3().subVectors(at, p).setY(0).normalize();
    const perp = new THREE.Vector3(dir.z, 0, -dir.x);
    // a lente fica no canto: o plano é tirado da linha câmera → bicho, a ~5 m dele (dentro da sala)
    const toLens = new THREE.Vector3().subVectors(lens, at).setY(0).normalize();
    this.w.cameraRig.playShots([
      // 1. PELA LENTE: o REC, a sala… e ele lá, inteiro (a opacidade sobe só neste plano)
      { dur: 3.0, fov: 46, cut: true, pos: (k) => b.pos.clone().addScaledVector(toLens, 6.4 - k * 1.0).setY(2.3), look: () => b.pos.clone().setY(1.3) },
      // 2. o corte: a sala de verdade, do lado de quem entrou — não há nada ali
      { dur: 1.6, fov: 54, cut: true, pos: () => v1.copy(p).addScaledVector(dir, -2.6).addScaledVector(perp, 1.1).setY(1.9), look: () => b.pos.clone().setY(1.0) },
      // 3. o chão treme onde ele estava: o nome
      { dur: 1.6, fov: 46, pos: (k) => b.pos.clone().addScaledVector(dir, -4.8 + k * 0.6).setY(1.6), look: () => b.pos.clone().setY(0.6) },
    ]);
    this.w.audio.play('select', { volume: 0.5, pitch: 1.8 }); // o bipe da câmera
    // a luz da câmera (o refletor do tripé): só no plano da lente
    this.light = new THREE.PointLight(0xd8ffd8, 70, 14, 1.2);
    this.w.scene.add(this.light);
  }

  tick(dt, t) {
    const w = this.w;
    const b = this.b;
    // pela lente: visível; fora dela: o fantasma (cfg.ghost)
    const rec = t < 3.0;
    if (this.fx) this.fx.classList.toggle('rec', rec);
    if (this.light) { this.light.visible = rec; this.light.position.set(b.pos.x + (this.lensX - b.pos.x) * 0.35, 3.2, b.pos.z + (this.lensZ - b.pos.z) * 0.35); }
    b.reveal = rec ? 1.2 : 0;
    if (t > 1.2 && !this.hiss) { this.hiss = true; w.audio.play('fearGaze', { volume: 0.8, pitch: 0.7 }); }
    if (t > 3.0 && !this.cut) { this.cut = true; this.burst(1); w.audio.play('drain', { volume: 0.6, pitch: 0.6 }); }
    if (t > 4.6 && t < 6.2 && Math.random() < dt * 8) w.fx.burst(new THREE.Vector3(b.pos.x + (Math.random() - 0.5) * 2, 0.1, b.pos.z + (Math.random() - 0.5) * 2), { count: 2, color: 0x6a6458, kind: 'smoke', speed: 0.5, life: 0.6, size: 0.4 });
    if (t > 4.7 && !this.named) { this.named = true; w.cameraRig.shake(0.18, 0.5); w.showBanner('RASTROPODA', '#7aff4a'); }
  }

  end() {
    this.b.held = false;
    this.b.reveal = 0;
    if (this.light) { this.w.scene.remove(this.light); this.light.dispose(); this.light = null; }
  }

  dispose() {
    super.dispose();
    if (this.light) this.end();
  }
}

// ================================================================== O BILU (o quarto escuro)
export class BiluIntro extends TorreIntro {
  constructor(dungeon, bilu) {
    super(dungeon);
    this.length = 4.8;
    this.b = bilu;
    bilu.held = true;
    bilu.model.root.visible = false;
    const at = bilu.pos.clone();
    this.at = at;
    const p = dungeon.player.pos.clone();
    const dir = new THREE.Vector3().subVectors(at, p).setY(0).normalize();
    const perp = new THREE.Vector3(dir.z, 0, -dir.x);
    // os dois olhos verdes no escuro (somem no clarão)
    const mat = new THREE.MeshBasicMaterial({ color: 0x46ff46, toneMapped: false, transparent: true, opacity: 0 });
    this.eyes = new THREE.Group();
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6), mat);
      e.scale.set(1.4, 0.8, 0.6);
      e.position.set(s * 0.24, 0, 0);
      this.eyes.add(e);
    }
    this.eyes.position.copy(at).setY(2.35);
    this.eyes.rotation.y = yawTo(at, p);
    this.eyeMat = mat;
    this.w.scene.add(this.eyes);
    this.w.cameraRig.playShots([
      // 1. o escuro, do ombro de quem entrou (só o barulho)
      { dur: 1.8, fov: 56, pos: (k) => v1.copy(p).addScaledVector(dir, -2.0 + k * 0.4).addScaledVector(perp, 0.9).setY(1.8), look: () => at.clone().setY(2.0) },
      // 2. a câmera chega perto dos olhos…
      { dur: 1.6, fov: 38, pos: (k) => at.clone().addScaledVector(dir, -4.4 + k * 1.8).setY(2.2), look: () => at.clone().setY(2.3) },
      // 3. o clarão: o chapéu de cogumelo por um instante
      { dur: 1.4, fov: 44, cut: true, pos: () => at.clone().addScaledVector(dir, -3.2).addScaledVector(perp, 0.6).setY(1.6), look: () => at.clone().setY(1.6) },
    ]);
    this.w.audio.play('fearGaze', { volume: 0.7, pitch: 0.5 });
  }

  tick(dt, t) {
    const w = this.w;
    this.eyeMat.opacity = t < 0.8 ? 0 : t < 3.4 ? Math.min(1, (t - 0.8) * 1.5) * (Math.sin(t * 9) > -0.9 ? 1 : 0) : 0;
    if (t > 1.6 && !this.growl) { this.growl = true; w.audio.play('drain', { volume: 0.6, pitch: 0.4 }); }
    if (t > 3.4 && !this.flash) {
      this.flash = true;
      this.b.model.root.visible = true;
      w.fx.burst(this.at.clone().setY(1.6), { count: 20, color: 0xeaffea, speed: 3, life: 0.25, size: 0.3 });
      w.audio.play('scare', { volume: 1, pitch: 1.1 });
      w.cameraRig.shake(0.3, 0.3);
      this.burst(1);
      w.showBanner('BILU', '#7aff4a');
    }
    if (this.flash && t > 3.75) { const on = t < 4.0 || Math.sin(t * 40) > 0.6; this.b.model.root.visible = on; }
  }

  end() {
    this.b.held = false;
    this.b.model.root.visible = true;
    this.w.scene.remove(this.eyes);
    this.eyes.children.forEach((m) => m.geometry.dispose());
    this.eyeMat.dispose();
  }

  dispose() {
    super.dispose();
    if (this.eyes && this.eyes.parent) this.end();
  }
}
