// OUTRO LADO — a tela das MELHORIAS PERMANENTES no estilo da loja de "PowerUps" do Vampire Survivors (pedido do dono,
// 2026-11-05): uma grade de quadrados com ícone, nome e os graus em pontinhos; em cima, os pontos livres; embaixo, o
// painel da melhoria selecionada (descrição, grau, custo e o botão COMPRAR); e os botões DEVOLVER e VOLTAR.
// Devolve para o flow.js os mesmos ids da tela antiga: 'buy:<id>', 'refund', 'back'.
import { TREE, treeCost } from './upgrades.js';
import { treeCoinCost } from './save.js';

const COLS = 4;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pips = (n, max) => Array.from({ length: max }, (_, i) => `<b class="${i < n ? 'on' : ''}"></b>`).join('');

export class PveTreeScreen {
  constructor(root, { audio, charName, profile, index = 0, data = null }) {
    this.audio = audio;
    this.profile = profile;
    this.data = data; // as MOEDAS (o grau também se compra com elas)
    this.charName = charName;
    // posições: 0..TREE.length-1 = os quadrados; depois DEVOLVER e VOLTAR
    this.count = TREE.length + 2;
    this.index = Math.min(index, this.count - 1);
    const el = document.createElement('div');
    el.className = 'screen pve-tree';
    el.innerHTML = `
      <div class="pt-wrap">
        <div class="pt-head"><h2>MELHORIAS PERMANENTES</h2><span class="pt-coins"></span></div>
        <div class="pt-who"></div>
        <div class="pt-grid">${TREE.map((n, i) => `<div class="pt-tile" data-i="${i}"><i>${n.icon}</i><b>${esc(n.name)}</b><s></s></div>`).join('')}</div>
        <div class="pt-info"><i></i><div><b></b><p></p><small></small></div><button class="pt-buy" data-i="buy">COMPRAR</button></div>
        <div class="pt-btns"><button data-i="${TREE.length}">DEVOLVER OS PONTOS</button><button data-i="${TREE.length + 1}">VOLTAR</button></div>
        <p class="pt-tip">Cada chefe derrotado dá +1 nível e +1 ponto ao personagem. Sem ponto, o grau também sai por MOEDAS. Vale em todas as tentativas dele.</p>
      </div>`;
    root.appendChild(el);
    this.el = el;
    el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.i;
      if (v === 'buy') { this.clicked = this.index < TREE.length ? this.index : null; return; }
      const i = Number(v);
      // clique no quadrado já selecionado = comprar (como no Vampire Survivors: seleciona, depois compra)
      if (i === this.index || i >= TREE.length) this.clicked = i;
      else { this.index = i; this.audio?.play('select'); this.render(); }
    }));
    this.render();
  }

  render() {
    const p = this.profile;
    const coins = this.data ? this.data.coins || 0 : 0;
    this.el.querySelector('.pt-coins').textContent = `✦ ${p.points} ponto${p.points === 1 ? '' : 's'} · ● ${coins} moedas`;
    this.el.querySelector('.pt-who').innerHTML = `${esc(this.charName)} · nível do Outro Lado <b>${p.level}</b>`;
    this.el.querySelectorAll('.pt-tile').forEach((t, i) => {
      const n = TREE[i];
      const r = p.tree[n.id] || 0;
      t.querySelector('s').innerHTML = pips(r, n.ranks);
      t.classList.toggle('on', i === this.index);
      t.classList.toggle('max', r >= n.ranks);
    });
    const btns = this.el.querySelectorAll('.pt-btns button');
    btns[0].classList.toggle('on', this.index === TREE.length);
    btns[0].disabled = !p.spent;
    btns[1].classList.toggle('on', this.index === TREE.length + 1);
    const info = this.el.querySelector('.pt-info');
    const n = TREE[Math.min(this.index, TREE.length - 1)];
    const r = p.tree[n.id] || 0;
    const cost = treeCost(r);
    info.classList.toggle('dim', this.index >= TREE.length);
    info.querySelector('i').textContent = n.icon;
    info.querySelector('b').textContent = n.name;
    info.querySelector('p').textContent = n.desc;
    const cc = treeCoinCost(r);
    const byCoins = p.points < cost;
    info.querySelector('small').textContent = r >= n.ranks ? `Grau ${r}/${n.ranks} · no máximo` : `Grau ${r}/${n.ranks} · custo ${cost} ponto${cost > 1 ? 's' : ''} ou ${cc} moedas`;
    const buy = info.querySelector('.pt-buy');
    buy.disabled = r >= n.ranks || (byCoins && coins < cc);
    buy.textContent = r >= n.ranks ? 'MÁXIMO' : byCoins ? `COMPRAR · ${cc} MOEDAS` : 'COMPRAR';
  }

  move(d) {
    const n = TREE.length;
    let i = this.index;
    if (d === 'left') i = i < n ? (i % COLS === 0 ? Math.min(n - 1, i + COLS - 1) : i - 1) : i === n ? n + 1 : n;
    else if (d === 'right') i = i < n ? (i % COLS === COLS - 1 || i === n - 1 ? i - (i % COLS) : i + 1) : i === n ? n + 1 : n;
    else if (d === 'up') i = i < n ? (i - COLS >= 0 ? i - COLS : n) : Math.max(0, n - COLS);
    else if (d === 'down') i = i < n ? (i + COLS < n ? i + COLS : n) : 0;
    if (i !== this.index) { this.index = i; this.audio?.play('select'); this.render(); }
  }

  idAt(i) {
    if (i < TREE.length) return `buy:${TREE[i].id}`;
    return i === TREE.length ? 'refund' : 'back';
  }

  update(input) {
    if (this.clicked !== undefined && this.clicked !== null) {
      const i = this.clicked;
      this.clicked = undefined;
      if (i === TREE.length && !this.profile.spent) return null;
      return this.idAt(i);
    }
    this.clicked = undefined;
    const p = input.players[0];
    for (const d of ['left', 'right', 'up', 'down']) if (p.menu[d]) this.move(d);
    if (p.pressed.jump || input.keyPressedOnce('Enter')) {
      if (this.index === TREE.length && !this.profile.spent) { this.audio?.play('denied'); return null; }
      return this.idAt(this.index);
    }
    if (p.pressed.physical || input.keyPressedOnce('Escape')) { this.audio?.play('select'); return 'back'; }
    return null;
  }

  dispose() { this.el.remove(); }
}
