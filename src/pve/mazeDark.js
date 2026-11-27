// O ESCURO DO LABIRINTO (pedido do dono, 2026-11-21: "tem que ter um suspense maior, pode ter um fade em volta, é um
// labirinto, tem que dar medo"): por cima da vista de cima dos Becos, a tela fica preta fora de um círculo de luz em
// volta de cada jogador. A luz respira e às vezes tremula (como lanterna fraca); com bicho perto ela encolhe.
// Só desenho (DOM por cima do canvas): não mexe na simulação. Na tela dividida, um círculo em cada metade.
import * as THREE from 'three';
import { SETTINGS } from '../config/settings.js';

const v = new THREE.Vector3();
const FLICK = 0.5; // duração da queda da luz (s)

export class MazeDark {
  constructor(parent) {
    this.parent = parent;
    this.els = [];
    this.t = 0;
    this.flick = 0;
    this.flickT = 2 + Math.random() * 4;
    this.near = [0, 0];
  }

  el(i) {
    if (!this.els[i]) {
      const d = document.createElement('div');
      d.className = 'maze-dark';
      this.parent.insertBefore(d, this.parent.firstChild); // embaixo do resto do HUD
      this.els[i] = d;
    }
    return this.els[i];
  }

  // views: [{ cam, p, x, w, h, threat }] — x/w/h a área da tela (px) de cada vista; threat 0..1 (bicho perto)
  update(dt, views) {
    this.t += dt;
    // a tremida: de tempos em tempos, a luz pisca por um instante
    // (2026-11-26, acessibilidade) era um pisca liga/desliga a ~11 Hz: estroboscópio na faixa de risco para
    // fotossensibilidade (o seguro é até 3 por segundo). Agora é UMA queda suave da luz (≈0,5 s, sobe de volta),
    // e com "Efeitos de tela reduzidos" ela não acontece
    this.flickT -= dt;
    if (this.flickT <= 0) { this.flick = FLICK; this.flickT = 3 + Math.random() * 6; }
    this.flick = Math.max(0, this.flick - dt);
    const blink = this.flick > 0 && !SETTINGS.reduceFx ? 1 - 0.4 * Math.sin(Math.PI * (1 - this.flick / FLICK)) : 1;
    const breath = 1 + Math.sin(this.t * 1.7) * 0.035;
    views.forEach((V, i) => {
      const d = this.el(i);
      d.hidden = false;
      this.near[i] = (this.near[i] || 0) + ((V.threat || 0) - (this.near[i] || 0)) * Math.min(1, dt * 3);
      v.set(V.p.pos.x, (V.p.pos.y || 0) + 1, V.p.pos.z).project(V.cam);
      const cx = (v.x * 0.5 + 0.5) * V.w;
      const cy = (-v.y * 0.5 + 0.5) * V.h;
      const r = V.h * 0.34 * breath * blink * (1 - 0.3 * this.near[i]);
      d.style.left = `${V.x}px`;
      d.style.width = `${V.w}px`;
      d.style.setProperty('--x', `${cx.toFixed(1)}px`);
      d.style.setProperty('--y', `${cy.toFixed(1)}px`);
      d.style.setProperty('--r', `${Math.max(40, r).toFixed(1)}px`);
    });
    for (let i = views.length; i < this.els.length; i++) this.els[i].hidden = true;
  }

  hide() { for (const d of this.els) d.hidden = true; }

  dispose() { for (const d of this.els) d.remove(); this.els = []; }
}
