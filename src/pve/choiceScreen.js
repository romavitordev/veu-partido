// OUTRO LADO — as telas de ESCOLHA do modo no mesmo visual do menu (pedido do dono, 2026-11-13: "só a primeira tela e
// as lojas foram melhoradas; a tela solo e multiplayer, dados, equipe e sozinho também devem ser melhoradas").
// Substitui o MenuScreen genérico nas telas LOCAIS do modo (entrada, jogadores, formato, dificuldade, dados, confirmações,
// backup, resultado). Cada opção vira um CARTÃO com ícone, título e uma linha explicando; VOLTAR/NÃO ficam pequenos no
// rodapé. Mantém o contrato do MenuScreen: `options[{ id, label, disabled }]`, `index`, `render()`, `update()` → id.
// Campos extras das opções: icon, desc, tag (selo no canto), tone ('danger' | 'gold'), wide (ocupa a linha toda),
// foot (vai para o rodapé pequeno, como VOLTAR), pic (a imagem em cima do cartão: { src, key } — key acha o cartão
// para trocar a imagem quando ela fica pronta depois; setPic). `panel` = HTML livre entre o subtítulo e os cartões (tela do fim).
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SECONDARY = new Set(['back', 'no']);

export class PveChoiceScreen {
  constructor(root, { title, subtitle = '', options, extra = '', panel = '', coins = null, kicker = 'OUTRO LADO', audio = null, cols = 0 }) {
    this.options = options;
    this.audio = audio;
    this.index = 0;
    const main = options.map((o, i) => [o, i]).filter(([o]) => !SECONDARY.has(o.id) && !o.foot);
    const foot = options.map((o, i) => [o, i]).filter(([o]) => SECONDARY.has(o.id) || o.foot);
    const label = (o) => (typeof o.label === 'function' ? o.label() : o.label);
    const el = document.createElement('div');
    el.className = 'screen pve-hub pve-choice';
    el.innerHTML = `
      <div class="ph-wrap">
        <header class="ph-top">
          <div><small>${esc(kicker)}</small><h1>${esc(title)}</h1></div>
          ${coins === null ? '' : `<div class="ph-coins" title="Moedas do Outro Lado"><i>●</i><b>${coins}</b><small>moedas</small></div>`}
        </header>
        ${subtitle ? `<p class="pc-sub">${subtitle}</p>` : ''}
        ${panel}
        ${extra ? `<div class="pc-note">${extra}</div>` : ''}
        <nav class="pc-grid" style="${cols ? `--cols:${cols}` : ''}">
          ${main.map(([o, i]) => `
            <button data-i="${i}" class="${o.tone || ''} ${o.wide ? 'wide' : ''} ${o.pic ? 'pic' : ''}">
              ${o.pic ? `<figure data-pic="${esc(o.pic.key)}">${o.pic.src ? `<img src="${o.pic.src}" alt="">` : ''}</figure>` : ''}
              ${o.icon ? `<i>${o.icon}</i>` : ''}
              <span><b>${esc(label(o))}</b>${o.desc ? `<small>${o.desc}</small>` : ''}</span>
              ${o.tag ? `<em>${esc(o.tag)}</em>` : ''}
            </button>`).join('')}
        </nav>
        ${foot.length ? `<footer class="ph-foot"><span></span><span class="ph-sm">${foot.map(([o, i]) => `<button data-i="${i}">${esc(label(o))}</button>`).join('')}</span></footer>` : ''}
      </div>`;
    root.appendChild(el);
    this.el = el;
    this.btns = [];
    el.querySelectorAll('[data-i]').forEach((b) => {
      this.btns[+b.dataset.i] = b;
      b.addEventListener('click', () => { if (!this.options[+b.dataset.i].disabled) this.clicked = +b.dataset.i; else this.audio?.play('denied'); });
    });
    this.render();
  }

  render() {
    this.btns.forEach((b, i) => {
      if (!b) return;
      b.classList.toggle('on', i === this.index);
      b.classList.toggle('disabled', !!this.options[i].disabled);
    });
  }

  update(input) {
    if (this.clicked !== undefined) { const i = this.clicked; this.clicked = undefined; this.audio?.play('confirm'); return this.options[i].id; }
    const n = this.options.length;
    let i = this.index;
    for (const p of input.players.slice(0, 2)) {
      if (p.menu.down || p.menu.right) i = (i + 1) % n;
      if (p.menu.up || p.menu.left) i = (i + n - 1) % n;
    }
    if (i !== this.index) { this.index = i; this.audio?.play('select'); this.render(); }
    const p = input.players[0];
    if (p.pressed.jump || input.keyPressedOnce('Enter')) {
      if (this.options[this.index].disabled) { this.audio?.play('denied'); return null; }
      this.audio?.play('confirm');
      return this.options[this.index].id;
    }
    if (p.pressed.physical || input.keyPressedOnce('Escape')) { this.audio?.play('select'); return 'back'; }
    return null;
  }

  // a imagem de um cartão ficou pronta (as prévias das fases são geradas na hora: a Torre carrega o cenário antes)
  setPic(key, src) {
    const f = this.el.querySelector(`figure[data-pic="${key}"]`);
    if (f && src && !f.querySelector('img')) f.innerHTML = `<img src="${src}" alt="">`;
  }

  dispose() { this.el.remove(); }
}
