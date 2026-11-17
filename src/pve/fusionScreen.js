// OUTRO LADO — DESCOBERTAS (pedido do dono, 2026-11-16: "essas fusões de poderes encontrados nas partidas que deveria ter
// uma tela separada pra todos descobertos. Assim como no Vampire Survivors"): a coleção das FUSÕES (upgrades.js FUSIONS).
// A descoberta mostra o ícone, o nome, a receita e o efeito; a que falta é "???" — como a coleção do VS, a receita só
// aparece depois de achar. Devolve 'back'.
import { FUSIONS, getUpgrade } from './upgrades.js';

const COLS = 4;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function recipeText(f) {
  return f.needs.map(([id, lv], i) => `${getUpgrade(id).name}${i === 0 ? ` no nível ${lv} (máximo)` : ''}`).join(' + ');
}

export class PveFusionScreen {
  constructor(root, { audio, discovered = [] }) {
    this.audio = audio;
    this.found = new Set(discovered);
    this.index = 0;
    const el = document.createElement('div');
    el.className = 'screen pve-found';
    const n = FUSIONS.filter((f) => this.found.has(f.id)).length;
    el.innerHTML = `
      <div class="pf-wrap">
        <header><small>OUTRO LADO</small><h2>DESCOBERTAS</h2><span>${n}/${FUSIONS.length} fusões</span></header>
        <div class="pf-grid">${FUSIONS.map((f, i) => {
          const ok = this.found.has(f.id);
          return `<div class="pf-tile ${ok ? 'ok' : ''}" data-i="${i}"><i>${ok ? f.icon : '?'}</i><b>${ok ? esc(f.name) : '???'}</b></div>`;
        }).join('')}</div>
        <div class="pf-info"><i></i><div><b></b><p></p><small></small></div></div>
        <p class="pf-tip">Uma FUSÃO junta duas melhorias da tentativa: com a primeira no nível máximo e a segunda na build, cada baú pode trazê-la. Depois de descoberta, ela ainda aparece de vez em quando, rara, mesmo sem a receita.</p>
        <div class="pf-btns"><button data-i="back">VOLTAR</button></div>
      </div>`;
    root.appendChild(el);
    this.el = el;
    el.querySelectorAll('.pf-tile').forEach((t) => t.addEventListener('click', () => { this.index = Number(t.dataset.i); this.audio?.play('select'); this.render(); }));
    el.querySelector('[data-i="back"]').addEventListener('click', () => { this.clicked = 'back'; });
    this.render();
  }

  render() {
    this.el.querySelectorAll('.pf-tile').forEach((t, i) => t.classList.toggle('on', i === this.index));
    const f = FUSIONS[this.index];
    const ok = this.found.has(f.id);
    const info = this.el.querySelector('.pf-info');
    info.classList.toggle('locked', !ok);
    info.querySelector('i').textContent = ok ? f.icon : '?';
    info.querySelector('b').textContent = ok ? f.name : '???';
    info.querySelector('p').textContent = ok ? f.desc : 'Ainda não descoberta. Junte duas melhorias numa tentativa e abra um baú.';
    info.querySelector('small').textContent = ok ? `Receita: ${recipeText(f)}` : '';
  }

  update(input) {
    if (this.clicked) { const k = this.clicked; this.clicked = null; this.audio?.play('select'); return k; }
    const p = input.players[0];
    const n = FUSIONS.length;
    let i = this.index;
    if (p.menu.right) i = (i + 1) % n;
    if (p.menu.left) i = (i + n - 1) % n;
    if (p.menu.down) i = Math.min(n - 1, i + COLS);
    if (p.menu.up) i = Math.max(0, i - COLS);
    if (i !== this.index) { this.index = i; this.audio?.play('select'); this.render(); }
    if (p.pressed.physical || p.pressed.jump || input.keyPressedOnce('Escape') || input.keyPressedOnce('Enter')) { this.audio?.play('select'); return 'back'; }
    return null;
  }

  dispose() { this.el.remove(); }
}
