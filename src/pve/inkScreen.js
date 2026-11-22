// A TINTA NA TELA de Proteja a Ilha de Tipora (pedidos do dono, 2026-11-21):
//  - "gotas de tinta na tela que progridem a cada onda": filetes de tinta escorrem do alto da tela, mais e mais longos a
//    cada onda (a tinta do Amigo Imaginário tomando a vila) — `level` 0..1 = onda atual / total;
//  - "um fade leve com tinta na fase contra o Amigo Imaginário": na luta com ele, as bordas da tela escurecem de tinta,
//    respirando devagar (`boss`).
// Só desenho: um canvas 2D no começo do #hud (embaixo das barras e do HUD do modo), em meia resolução. Não mexe na
// simulação. A cena de entrada do Amigo (amigoInkIntro.js) tem a própria tinta, por cima de tudo.
const INK = [22, 8, 4];
const SCALE = 0.5; // meia resolução: a tinta é borrada de propósito, e fica barato

export class InkScreen {
  constructor(parent) {
    const cv = document.createElement('canvas');
    cv.className = 'ink-drips';
    parent.insertBefore(cv, parent.firstChild);
    this.cv = cv;
    this.g = cv.getContext('2d');
    this.level = 0; // o que aparece (corre atrás do alvo)
    this.want = 0;
    this.boss = 0; // a borda de tinta (0..1, entra e sai devagar)
    this.wantBoss = 0;
    this.t = 0;
    this.drip = 1; // opacidade dos filetes (esmaecem na última onda)
    this.wantDrip = 1;
    // os filetes: cada um aparece quando o nível passa do seu `u` e desce até `len` (fração da altura)
    this.drips = Array.from({ length: 34 }, (_, i) => ({
      x: Math.random(),
      u: (i / 34) * 0.95 + Math.random() * 0.05,
      w: 0.004 + Math.random() * 0.011,
      len: 0.06 + Math.random() * 0.42,
      cur: 0,
      speed: 0.02 + Math.random() * 0.05,
      wob: Math.random() * Math.PI * 2,
    }));
  }

  // `clear`: os filetes e a faixa somem (esmaecem) e só a borda fica — a última onda (dono, 2026-11-22)
  set(level, boss, clear = false) {
    this.want = Math.max(0, Math.min(1, level));
    this.wantBoss = boss ? 1 : 0;
    this.wantDrip = clear ? 0 : 1;
  }

  update(dt) {
    this.t += dt;
    this.level += (this.want - this.level) * Math.min(1, dt * 0.8);
    this.boss += (this.wantBoss - this.boss) * Math.min(1, dt * 0.6);
    this.drip += (this.wantDrip - this.drip) * Math.min(1, dt * 0.7);
    const cv = this.cv;
    const W = Math.max(2, Math.round(cv.clientWidth * SCALE));
    const H = Math.max(2, Math.round(cv.clientHeight * SCALE));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const g = this.g;
    g.clearRect(0, 0, W, H);
    if ((this.level < 0.01 || this.drip < 0.01) && this.boss < 0.01) { cv.hidden = true; return; }
    cv.hidden = false;
    const ink = (a) => `rgba(${INK[0]},${INK[1]},${INK[2]},${a})`;
    g.globalAlpha = Math.max(0, Math.min(1, this.drip));
    // a faixa de tinta no alto, engrossando com as ondas
    const band = H * (0.012 + 0.05 * this.level);
    const top = g.createLinearGradient(0, 0, 0, band * 2.2);
    top.addColorStop(0, ink(0.92));
    top.addColorStop(0.5, ink(0.75));
    top.addColorStop(1, ink(0));
    g.fillStyle = top;
    g.fillRect(0, 0, W, band * 2.2);
    // os filetes escorrendo (cada um com a gota mais gorda na ponta)
    for (const d of this.drips) {
      const on = this.level >= d.u;
      const target = on ? d.len * (0.45 + 0.55 * Math.min(1, (this.level - d.u) * 3 + 0.3)) : 0;
      d.cur += (target - d.cur) * Math.min(1, dt * d.speed * 6);
      if (d.cur < 0.004) continue;
      const x = (d.x + Math.sin(this.t * 0.3 + d.wob) * 0.002) * W;
      const w = Math.max(1.5, d.w * W);
      const len = d.cur * H + band;
      g.fillStyle = ink(0.86);
      g.beginPath();
      g.moveTo(x - w * 0.9, 0);
      g.quadraticCurveTo(x - w * 0.55, len * 0.6, x - w * 0.4, len);
      g.lineTo(x + w * 0.4, len);
      g.quadraticCurveTo(x + w * 0.55, len * 0.6, x + w * 0.9, 0);
      g.closePath();
      g.fill();
      g.beginPath();
      g.arc(x, len, w * 0.75, 0, Math.PI * 2);
      g.fill();
      // um brilho fino de tinta molhada
      g.fillStyle = 'rgba(90,40,20,0.35)';
      g.fillRect(x - w * 0.15, band, Math.max(1, w * 0.18), Math.max(0, len - band - w));
    }
    g.globalAlpha = 1;
    // a borda de tinta da luta com o Amigo: um fade LEVE e escuro nos cantos, respirando devagar
    if (this.boss > 0.01) {
      const pulse = 0.85 + Math.sin(this.t * 1.3) * 0.15;
      const R = Math.hypot(W, H) * 0.5;
      const v = g.createRadialGradient(W / 2, H / 2, R * 0.45, W / 2, H / 2, R);
      v.addColorStop(0, ink(0));
      v.addColorStop(0.6, ink(0.16 * this.boss * pulse));
      v.addColorStop(1, ink(0.55 * this.boss * pulse));
      g.fillStyle = v;
      g.fillRect(0, 0, W, H);
    }
  }

  hide() { this.cv.hidden = true; }

  dispose() { this.cv.remove(); }
}
