// OUTRO LADO — o MENU do modo (pedido do dono, 2026-11-12: "está confuso, não mostra as moedas nem se já jogou; o
// apagar dados está tão à mostra que eu apago para testar; deixe profissional, intuitivo e bonito").
// Em cima: as MOEDAS e o resumo da campanha. No meio: o cartão da TENTATIVA (quem, profundidade, nível, dificuldade) com
// o botão principal (CONTINUAR ou COMEÇAR). Embaixo: LOJA, MELHORIAS e, pequeno no canto, DADOS (backup, reiniciar e
// apagar ficam lá dentro, atrás de confirmação). Devolve: 'continue' | 'new' | 'unlock' | 'tree' | 'data' | 'back'.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class PveHubScreen {
  // info: { coins, attempt: { name, team, p2, depth, level, diff, portrait } | null, campaign, owned, total, warn, treeRanks, spinReady }
  constructor(root, { audio, info }) {
    this.audio = audio;
    const a = info.attempt;
    const c = info.campaign;
    const played = c.runs > 0 || c.bossKills > 0 || c.deaths > 0;
    this.items = a ? ['continue', 'new', 'unlock', 'tree', 'data', 'back'] : ['new', 'unlock', 'tree', 'data', 'back'];
    this.index = 0;
    const el = document.createElement('div');
    el.className = 'screen pve-hub';
    el.innerHTML = `
      <div class="ph-wrap">
        <header class="ph-top">
          <div><small>MODO HISTÓRIA</small><h1>OUTRO LADO</h1></div>
          <div class="ph-coins" title="Moedas do Outro Lado"><i>●</i><b>${info.coins}</b><small>moedas</small></div>
        </header>
        ${info.warn ? `<p class="ph-warn">${info.warn}</p>` : ''}
        <section class="ph-card ${a ? '' : 'empty'}">
          ${a ? `
            ${a.portrait ? `<img src="${a.portrait}" alt="">` : ''}
            <div class="ph-run">
              <small>TENTATIVA EM ANDAMENTO</small>
              <b>${esc(a.name)}</b>
              ${a.team ? `<span>+ ${esc(a.team)} (assistências)</span>` : ''}${a.p2 ? `<span>P2: ${esc(a.p2)}</span>` : ''}
              <div class="ph-tags"><em>Profundidade ${a.depth}</em><em>Nível ${a.level}</em><em class="d">${esc(a.diff)}</em></div>
            </div>
            <button class="ph-main" data-id="continue">CONTINUAR ▸</button>` : `
            <div class="ph-run">
              <small>${played ? 'NENHUMA TENTATIVA EM ANDAMENTO' : 'PRIMEIRA VEZ AQUI?'}</small>
              <b>${played ? 'Pronto para descer de novo?' : 'Entre, sobreviva, derrote o chefe e desça mais fundo.'}</b>
              <span>${played ? 'As moedas, os personagens e as melhorias ficam. A morte só leva a tentativa.' : 'As moedas dos baús e dos chefes compram personagens e melhorias que valem para sempre.'}</span>
            </div>
            <button class="ph-main" data-id="new">COMEÇAR ▸</button>`}
        </section>
        <nav class="ph-grid">
          ${a ? '<button data-id="new"><b>NOVA TENTATIVA</b><small>abandona a atual</small></button>' : ''}
          <button data-id="unlock"><b>LOJA · GACHA</b><small>${info.owned}/${info.total} personagens · giro ● 150</small></button>
          <button data-id="tree"><b>MELHORIAS</b><small>${info.treeRanks} grau(s) · balcão da Aghata</small></button>
        </nav>
        <footer class="ph-foot">
          <span>${played ? `Recorde: profundidade ${c.bestDepth} · chefes ${c.bossKills} · mortes ${c.deaths}` : 'Nenhuma descida ainda'}</span>
          <span class="ph-sm"><button data-id="data">DADOS</button><button data-id="back">VOLTAR</button></span>
        </footer>
      </div>`;
    root.appendChild(el);
    this.el = el;
    this.btns = this.items.map((id) => el.querySelector(`[data-id="${id}"]`));
    el.querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => { this.clicked = b.dataset.id; }));
    this.render();
  }

  render() { this.btns.forEach((b, i) => b && b.classList.toggle('on', i === this.index)); }

  update(input) {
    if (this.clicked) { const k = this.clicked; this.clicked = null; this.audio?.play('confirm'); return k; }
    const p = input.players[0];
    let i = this.index;
    if (p.menu.down || p.menu.right) i = (i + 1) % this.items.length;
    if (p.menu.up || p.menu.left) i = (i + this.items.length - 1) % this.items.length;
    if (i !== this.index) { this.index = i; this.audio?.play('select'); this.render(); }
    if (p.pressed.jump || input.keyPressedOnce('Enter')) { this.audio?.play('confirm'); return this.items[this.index]; }
    if (p.pressed.physical || input.keyPressedOnce('Escape')) { this.audio?.play('select'); return 'back'; }
    return null;
  }

  dispose() { this.el.remove(); }
}
