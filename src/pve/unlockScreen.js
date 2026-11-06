// OUTRO LADO — a loja de PERSONAGENS (pedido do dono, 2026-11-05): os bloqueados são comprados com as moedas dos baús.
// Mesma cara da tela de melhorias permanentes (a loja do Vampire Survivors): grade de retratos, as moedas no alto e o
// painel de baixo com o preço e o botão COMPRAR. Devolve para o flow.js 'buy:<id>' ou 'back'.
import { isUnlocked, priceOf, pveBanned } from './unlocks.js';

const COLS = 6;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class PveUnlockScreen {
  constructor(root, { audio, data, roster, portraits }) {
    this.audio = audio;
    this.data = data;
    // os mais baratos primeiro (a ordem de força)
    this.list = roster.filter((c) => !pveBanned(c)).sort((a, b) => priceOf(a.id) - priceOf(b.id));
    const firstLocked = this.list.findIndex((c) => !isUnlocked(data, c.id));
    this.index = Math.max(0, firstLocked);
    const el = document.createElement('div');
    el.className = 'screen pve-tree pve-unlock';
    el.innerHTML = `
      <div class="pt-wrap">
        <div class="pt-head"><h2>DESBLOQUEAR PERSONAGENS</h2><span class="pt-coins"></span></div>
        <div class="pt-grid pu-grid">${this.list.map((c, i) => `<div class="pt-tile pu-tile" data-i="${i}" style="--c:${c.color}"><img src="${portraits[c.id] || ''}" alt=""><b>${esc(c.name)}</b><em></em></div>`).join('')}</div>
        <div class="pt-info"><img alt=""><div><b></b><p></p><small></small></div><button class="pt-buy" data-i="buy">COMPRAR</button></div>
        <div class="pt-btns"><button data-i="back" class="pu-back">VOLTAR</button></div>
        <p class="pt-tip">As moedas saem dos BAÚS espalhados pelas dungeons (um baú pode ter moedas, vida ou experiência) e da recompensa do chefe. A morte não leva as moedas.</p>
      </div>`;
    root.appendChild(el);
    this.el = el;
    this.tiles = [...el.querySelectorAll('.pu-tile')];
    el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.i;
      if (v === 'buy') { this.clicked = 'buy'; return; }
      if (v === 'back') { this.clicked = 'back'; return; }
      const i = Number(v);
      if (i === this.index) this.clicked = 'buy';
      else { this.index = i; this.audio?.play('select'); this.render(); }
    }));
    this.render();
  }

  render() {
    const d = this.data;
    this.el.querySelector('.pt-coins').textContent = `● ${d.coins || 0} moedas`;
    this.tiles.forEach((t, i) => {
      const c = this.list[i];
      const free = isUnlocked(d, c.id);
      t.classList.toggle('locked', !free);
      t.classList.toggle('on', i === this.index);
      t.querySelector('em').textContent = free ? '✓' : `● ${priceOf(c.id)}`;
    });
    this.el.querySelector('.pu-back').classList.toggle('on', this.index === this.list.length);
    const c = this.list[Math.min(this.index, this.list.length - 1)];
    const free = isUnlocked(d, c.id);
    const price = priceOf(c.id);
    const info = this.el.querySelector('.pt-info');
    info.classList.toggle('dim', this.index >= this.list.length);
    info.querySelector('img').src = this.tiles[Math.min(this.index, this.list.length - 1)].querySelector('img').src;
    info.querySelector('b').textContent = c.name;
    info.querySelector('p').textContent = c.info?.tagline || '';
    info.querySelector('small').textContent = free ? 'Liberado no Outro Lado' : `${c.origin || ''} · custa ${price} moedas${(d.coins || 0) < price ? ` (faltam ${price - (d.coins || 0)})` : ''}`;
    const buy = info.querySelector('.pt-buy');
    buy.disabled = free || (d.coins || 0) < price;
    buy.textContent = free ? 'LIBERADO' : 'COMPRAR';
    // mantém o selecionado à vista (a grade rola)
    const t = this.tiles[this.index];
    if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest' });
  }

  move(dir) {
    const n = this.list.length;
    let i = this.index;
    if (i >= n) { if (dir === 'up') i = n - 1; else if (dir === 'down') i = 0; }
    else if (dir === 'left') i = (i + n - 1) % n;
    else if (dir === 'right') i = (i + 1) % n;
    else if (dir === 'up') i = i - COLS >= 0 ? i - COLS : n;
    else if (dir === 'down') i = i + COLS < n ? i + COLS : n;
    if (i !== this.index) { this.index = i; this.audio?.play('select'); this.render(); }
  }

  update(input) {
    const k = this.clicked;
    this.clicked = undefined;
    if (k === 'back') { this.audio?.play('select'); return 'back'; }
    if (k === 'buy') return this.index < this.list.length ? `buy:${this.list[this.index].id}` : 'back';
    const p = input.players[0];
    for (const d of ['left', 'right', 'up', 'down']) if (p.menu[d]) this.move(d);
    if (p.pressed.jump || input.keyPressedOnce('Enter')) return this.index < this.list.length ? `buy:${this.list[this.index].id}` : 'back';
    if (p.pressed.physical || input.keyPressedOnce('Escape')) { this.audio?.play('select'); return 'back'; }
    return null;
  }

  dispose() { this.el.remove(); }
}
