// OUTRO LADO — a tela das MELHORIAS PERMANENTES no estilo da loja de "PowerUps" do Vampire Survivors (pedido do dono,
// 2026-11-05): uma grade de quadrados com ícone, nome e os graus em pontinhos; em cima, os pontos livres; embaixo, o
// painel da melhoria selecionada (descrição, grau, custo e o botão COMPRAR); e o botão VOLTAR.
// 2026-11-12 (pedido do dono): a árvore é GLOBAL (vale para todos os personagens) e só se compra com MOEDAS — sem pontos
// e sem devolver. Devolve para o flow.js: 'buy:<id>' e 'back'.
import { TREE } from './upgrades.js';
import { treeCoinCost, treeSpent } from './save.js';
import { AGHATA_LINES, pickLine } from './aghataShop.js';

const COLS = 4;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pips = (n, max) => Array.from({ length: max }, (_, i) => `<b class="${i < n ? 'on' : ''}"></b>`).join('');

export class PveTreeScreen {
  constructor(root, { audio, index = 0, data, portrait = '' }) {
    this.audio = audio;
    this.data = data; // as moedas e a árvore global (data.tree)
    // posições: 0..TREE.length-1 = os quadrados; depois VOLTAR
    this.count = TREE.length + 2; // + DEVOLVER TUDO e VOLTAR
    this.index = Math.min(index, this.count - 1);
    const el = document.createElement('div');
    el.className = 'screen pve-tree pve-shop';
    // A LOJA DA AGHATA (pedido do dono, 2026-11-12): a tela inteira é a loja dela — prateleiras, velas, o balcão —, ela
    // fica de pé ao lado, olhando você escolher, e as melhorias ficam num painel (popup) em cima do balcão
    const art = `${import.meta.env.BASE_URL || '/'}sobre/elenco/aghata_loja.webp`; // 720 × 960 (o do Sobre tem 240 × 320 e ficava mole)
    el.innerHTML = `
      <div class="ps-room" aria-hidden="true">
        <div class="ps-shelf s1">${'<i></i>'.repeat(7)}</div>
        <div class="ps-shelf s2">${'<i></i>'.repeat(6)}</div>
        <div class="ps-shelf s3">${'<i></i>'.repeat(8)}</div>
        <div class="ps-sign">AGHATA · ARTIGOS DO OUTRO LADO</div>
      </div>
      <div class="ps-clerk">
        <b>AGHATA</b>
        <p class="pt-say"></p>
        <img src="${art}" alt="Aghata atrás do balcão" onerror="this.src='${portrait}'">
      </div>
      <div class="ps-desk" aria-hidden="true"><span class="ps-candle c1"></span><span class="ps-candle c2"></span><span class="ps-candle c3"></span></div>
      <div class="pt-wrap ps-panel">
        <div class="pt-head"><h2>MELHORIAS PERMANENTES</h2><span class="pt-coins"></span></div>
        <div class="pt-who"></div>
        <div class="pt-grid">${TREE.map((n, i) => `<div class="pt-tile" data-i="${i}"><i>${n.icon}</i><b>${esc(n.name)}</b><s></s></div>`).join('')}</div>
        <div class="pt-info"><i></i><div><b></b><p></p><small></small></div><button class="pt-buy" data-i="buy">COMPRAR</button></div>
        <div class="pt-btns"><button data-i="${TREE.length}" class="pt-refund">DEVOLVER TUDO</button><button data-i="${TREE.length + 1}">VOLTAR</button></div>
        <p class="pt-tip">Valem para TODOS os personagens, em todas as tentativas. Cada grau custa mais que o anterior. As moedas vêm dos baús, dos inimigos e da recompensa de cada chefe (mais nas dificuldades altas).</p>
      </div>`;
    root.appendChild(el);
    this.el = el;
    this.say(pickLine(AGHATA_LINES.hello));
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
    const tree = this.data.tree || {};
    const coins = this.data.coins || 0;
    this.el.querySelector('.pt-coins').textContent = `● ${coins} moedas`;
    this.el.querySelector('.pt-who').innerHTML = `Vale para todos os personagens · já investido: <b>● ${treeSpent(this.data)}</b>`;
    this.el.querySelectorAll('.pt-tile').forEach((t, i) => {
      const n = TREE[i];
      const r = tree[n.id] || 0;
      t.querySelector('s').innerHTML = pips(r, n.ranks);
      t.classList.toggle('on', i === this.index);
      t.classList.toggle('max', r >= n.ranks);
      t.classList.toggle('cant', r < n.ranks && coins < treeCoinCost(n, r));
    });
    const btns = this.el.querySelectorAll('.pt-btns button');
    const spent = treeSpent(this.data);
    btns[0].classList.toggle('on', this.index === TREE.length);
    btns[0].classList.toggle('armed', !!this.armed);
    btns[0].disabled = !spent;
    btns[0].textContent = this.armed ? `CONFIRMAR: ● ${spent} DE VOLTA` : 'DEVOLVER TUDO';
    btns[1].classList.toggle('on', this.index === TREE.length + 1);
    this.el.querySelectorAll('.pt-tile').forEach((t, i) => t.classList.toggle('relic', TREE[i].cost >= 5000));
    const info = this.el.querySelector('.pt-info');
    const n = TREE[Math.min(this.index, TREE.length - 1)];
    const r = tree[n.id] || 0;
    const cc = treeCoinCost(n, r);
    info.classList.toggle('dim', this.index >= TREE.length);
    // ela "olha" você escolher: inclina para o lado do quadrado selecionado
    const col = this.index < TREE.length ? (this.index % COLS) / (COLS - 1) : 0.5;
    this.el.style.setProperty('--look', (col - 0.5).toFixed(2));
    info.querySelector('i').textContent = n.icon;
    info.querySelector('b').textContent = n.name;
    info.querySelector('p').textContent = n.desc;
    info.querySelector('small').textContent = r >= n.ranks ? `Grau ${r}/${n.ranks} · no máximo` : `Grau ${r}/${n.ranks} · próximo grau: ● ${cc} moedas${coins < cc ? ` (faltam ${cc - coins})` : ''}`;
    const buy = info.querySelector('.pt-buy');
    buy.disabled = r >= n.ranks || coins < cc;
    buy.textContent = r >= n.ranks ? 'MÁXIMO' : `COMPRAR · ● ${cc}`;
  }

  // a fala da Aghata no balcão (o flow.js chama depois de cada compra)
  say(text) {
    const p = this.el.querySelector('.pt-say');
    p.textContent = text;
    p.classList.remove('pop');
    void p.offsetWidth; // reinicia a animação
    p.classList.add('pop');
  }

  move(d) {
    const n = TREE.length;
    let i = this.index;
    if (d === 'left') i = i < n ? (i % COLS === 0 ? Math.min(n - 1, i + COLS - 1) : i - 1) : i === n ? n + 1 : n;
    else if (d === 'right') i = i < n ? (i % COLS === COLS - 1 || i === n - 1 ? i - (i % COLS) : i + 1) : i === n ? n + 1 : n;
    else if (d === 'up') i = i < n ? (i - COLS >= 0 ? i - COLS : n) : Math.max(0, n - COLS);
    else if (d === 'down') i = i < n ? (i + COLS < n ? i + COLS : n) : 0;
    if (i !== this.index) { this.index = i; this.armed = false; this.audio?.play('select'); this.render(); }
  }

  // DEVOLVER TUDO pede confirmação: o 1º aperto arma (mostra quanto volta), o 2º devolve
  idAt(i) {
    if (i < TREE.length) return `buy:${TREE[i].id}`;
    if (i === TREE.length) {
      if (!treeSpent(this.data)) { this.audio?.play('denied'); return null; }
      if (!this.armed) { this.armed = true; this.audio?.play('select'); this.render(); return 'refundAsk'; }
      this.armed = false;
      return 'refund';
    }
    return 'back';
  }

  update(input) {
    if (this.clicked !== undefined && this.clicked !== null) {
      const i = this.clicked;
      this.clicked = undefined;
      return this.idAt(i);
    }
    this.clicked = undefined;
    const p = input.players[0];
    for (const d of ['left', 'right', 'up', 'down']) if (p.menu[d]) this.move(d);
    if (p.pressed.jump || input.keyPressedOnce('Enter')) {
      return this.idAt(this.index);
    }
    if (p.pressed.physical || input.keyPressedOnce('Escape')) { this.audio?.play('select'); return 'back'; }
    return null;
  }

  dispose() { this.el.remove(); }
}
