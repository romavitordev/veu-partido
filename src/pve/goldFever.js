// FEBRE DO OURO (pedido do dono, 2026-11-19; números: PROPOSTA): bem rara, sai de um baú. Abre uma barra de 30 s que vai
// esvaziando; cada inimigo derrotado devolve tempo (nunca passa do cheio). Enquanto dura, as moedas valem o dobro e todo
// abate solta moedas. Chegou a zero, acabou. Na tela: moedas de ouro caindo e um fade dourado nas bordas.
//
// Por que 30 s: uma sala de luta do Outro Lado dura uns 40–70 s; com 30 s e +3 s por abate, quem mata em ritmo de luta
// (um abate a cada 3 s ou menos) segura a febre a sala inteira, e quem para de lutar perde em meio minuto.
import * as THREE from 'three';
import { Pickup } from './pickups.js';

export const FEVER = {
  chance: 0.04, // por baú aberto (bem raro); não sai enquanto já houver uma febre
  time: 30, // a barra cheia (s)
  perKill: 3, // o que cada abate devolve (s)
  coinMult: 2, // as moedas valem o dobro enquanto dura
  dropCoins: [2, 4], // as moedas que todo abate solta (antes do dobro)
};

export function rollFever(rng = Math.random, luck = 0) {
  return rng() < FEVER.chance * (1 + luck);
}

export class GoldFever {
  constructor(d) {
    this.d = d; // o Dungeon
    this.t = 0;
    this.active = false;
    this.el = null;
  }

  start() {
    const d = this.d;
    this.t = FEVER.time;
    if (!this.active) {
      this.active = true;
      this.mount();
      d.hud.callout('FEBRE DO OURO!', '#ffd84a');
      d.audio.play('levelUp', { volume: 1, pitch: 1.35 });
      d.audio.play('pickup', { volume: 1, pitch: 0.9 });
      for (const q of d.players) {
        if (q.state === 'ko') continue;
        d.world.fx.ring(new THREE.Vector3(q.pos.x, 0.06, q.pos.z), { color: 0xffd84a, radius: 3.5, life: 0.8 });
        d.world.fx.burst(q.chestPos().clone(), { count: 40, color: 0xffd84a, speed: 3.5, up: 2.5, life: 0.9, size: 0.16 });
      }
    }
    d.hint('Derrote inimigos para a febre durar — cada abate devolve tempo');
    d.hintT = 4;
    this.draw();
  }

  // um inimigo caiu: devolve tempo e solta moedas
  onKill(pos) {
    if (!this.active) return;
    this.t = Math.min(FEVER.time, this.t + FEVER.perKill);
    const d = this.d;
    const [a, b] = FEVER.dropCoins;
    const n = a + Math.floor(Math.random() * (b - a + 1));
    const at = { x: pos.x + (Math.random() - 0.5) * 0.8, z: pos.z + (Math.random() - 0.5) * 0.8 };
    d.pickups.push(new Pickup(d.world, { kind: 'coins', pos: at, amount: n, onTake: () => d.giveCoins(n) }));
    if (this.el) {
      const bar = this.el.querySelector('.gf-bar');
      bar.classList.remove('gain');
      void bar.offsetWidth;
      bar.classList.add('gain');
    }
    this.draw();
  }

  // o multiplicador das moedas (giveCoins)
  mult() {
    return this.active ? FEVER.coinMult : 1;
  }

  update(dt) {
    if (!this.active) return;
    this.t -= dt;
    if (this.t <= 0) { this.stop(true); return; }
    this.draw();
  }

  draw() {
    if (!this.el) return;
    const k = Math.max(0, this.t / FEVER.time);
    this.el.querySelector('.gf-bar i').style.width = `${(k * 100).toFixed(1)}%`;
    this.el.querySelector('.gf-sec').textContent = `${Math.max(0, Math.ceil(this.t))} s`;
    this.el.classList.toggle('low', this.t < 6);
  }

  stop(timedOut = false) {
    if (!this.active) return;
    this.active = false;
    this.t = 0;
    if (timedOut && this.d.hud) {
      this.d.hud.callout('A FEBRE PASSOU', '#c8a060');
      this.d.audio.play('denied', { volume: 0.6, pitch: 0.7 });
    }
    const el = this.el;
    this.el = null;
    if (el) {
      el.classList.add('out');
      setTimeout(() => el.remove(), 900);
    }
  }

  mount() {
    const root = this.d.hud && this.d.hud.root;
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'gold-fever';
    // as moedas caindo: cada uma com a sua coluna, tamanho, atraso e velocidade (só CSS: não pesa no quadro)
    let coins = '';
    for (let i = 0; i < 18; i++) {
      const left = (i / 18) * 100 + Math.random() * 4;
      const size = 14 + Math.random() * 14;
      const dur = 2.2 + Math.random() * 1.8;
      const delay = -Math.random() * dur;
      const spin = 0.5 + Math.random() * 0.7;
      coins += `<span style="left:${left.toFixed(1)}%;width:${size.toFixed(0)}px;height:${size.toFixed(0)}px;animation-duration:${dur.toFixed(2)}s,${spin.toFixed(2)}s;animation-delay:${delay.toFixed(2)}s,0s"></span>`;
    }
    el.innerHTML = `<div class="gf-glow"></div><div class="gf-rain">${coins}</div>
      <div class="gf-box"><b>FEBRE DO OURO</b><div class="gf-bar"><i></i></div><small class="gf-sec"></small><em>moedas ×${FEVER.coinMult}</em></div>`;
    root.appendChild(el);
    this.el = el;
  }

  dispose() {
    this.active = false;
    if (this.el) { this.el.remove(); this.el = null; }
  }
}
