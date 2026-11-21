// OUTRO LADO — DESCOBERTAS (pedido do dono, 2026-11-16: "essas fusões de poderes encontrados nas partidas que deveria ter
// uma tela separada pra todos descobertos. Assim como no Vampire Survivors"): a coleção das FUSÕES (upgrades.js FUSIONS)
// e, desde 2026-11-20, dos ACHADOS DAS FASES (RELICS: "mais variedade de melhorias que posso descobrir nas fases").
// A descoberta mostra o ícone, o nome, o efeito e a receita (ou a fase); a que falta mostra "???", mas a PISTA fica à
// mostra — a receita da fusão, a fase do achado (o dono nunca tinha achado nenhuma: sem pista ninguém sabe o que montar).
// Devolve 'back'.
import { FUSIONS, RELICS, getUpgrade } from './upgrades.js';
import { DUNGEONS } from './dungeons.js';
import { hoverIndex } from '../ui/hover.js';

const COLS = 6;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function recipeText(f) {
  return f.needs.map(([id, lv]) => `${getUpgrade(id).name}${lv > 1 ? ` no nível ${lv}` : ''}`).join(' + ');
}

// a fase ainda VELADA (não liberada) não entrega o nome aqui também
const VEILED = 'uma fase além do Véu';
let phaseOpen = () => true;
const phaseName = (r) => {
  const D = DUNGEONS[r.phase];
  if (!phaseOpen(r.phase)) return VEILED;
  return D ? D.cardName || D.place : r.phase;
};

// as duas seções, uma embaixo da outra; cada item sabe a linha e a coluna (a navegação pelo controle usa isso)
const SECTIONS = [
  { id: 'fus', title: 'FUSÕES', items: FUSIONS },
  { id: 'rel', title: 'ACHADOS DAS FASES', items: RELICS },
];
const ITEMS = [];
{
  let row = 0;
  for (const sec of SECTIONS) {
    sec.items.forEach((u, i) => ITEMS.push({ u, sec: sec.id, row: row + Math.floor(i / COLS), col: i % COLS }));
    row += Math.ceil(sec.items.length / COLS);
  }
}

export class PveFusionScreen {
  constructor(root, { audio, discovered = [], phaseOpen: open = null }) {
    phaseOpen = open || (() => true);
    this.audio = audio;
    this.found = new Set(discovered);
    this.index = 0;
    const el = document.createElement('div');
    el.className = 'screen pve-found';
    const nf = FUSIONS.filter((f) => this.found.has(f.id)).length;
    const nr = RELICS.filter((r) => this.found.has(r.id)).length;
    let k = 0;
    const grid = (sec) => `<h3>${sec.title} <span>${sec.items.filter((u) => this.found.has(u.id)).length}/${sec.items.length}</span></h3>
      <div class="pf-grid">${sec.items.map((u) => {
        const ok = this.found.has(u.id);
        // a PISTA em cada quadrado (dono, 2026-11-21): a receita com o nível pedido (fusão) ou a fase (achado)
        const clue = sec.id === 'fus' ? u.needs.map(([id, lv]) => `${esc(getUpgrade(id).name)}${lv > 1 ? ` ${lv}` : ''}`).join(' + ') : esc(phaseName(u));
        return `<div class="pf-tile ${sec.id} ${ok ? 'ok' : ''}" data-i="${k++}"><i>${ok ? u.icon : '?'}</i><b>${ok ? esc(u.name) : '???'}</b><small>${clue}</small></div>`;
      }).join('')}</div>`;
    el.innerHTML = `
      <div class="pf-wrap">
        <header><small>OUTRO LADO</small><h2>DESCOBERTAS</h2><span>${nf}/${FUSIONS.length} fusões · ${nr}/${RELICS.length} achados</span></header>
        <div class="pf-list">${SECTIONS.map(grid).join('')}</div>
        <div class="pf-info"><i></i><div><b></b><p></p><small></small></div></div>
        <p class="pf-tip">FUSÃO: junte a receita numa tentativa (a primeira melhoria no nível pedido e a segunda na build) e o PRÓXIMO baú traz a fusão; a carta de nível avisa quando completa. ACHADO: cada fase esconde dois nos baús dela.</p>
        <div class="pf-btns"><button data-i="back">VOLTAR</button></div>
      </div>`;
    root.appendChild(el);
    this.el = el;
    el.querySelectorAll('.pf-tile').forEach((t) => t.addEventListener('click', () => { this.index = Number(t.dataset.i); this.audio?.play('select'); this.render(); }));
    el.querySelectorAll('.pf-tile').forEach((t) => hoverIndex(this, t, Number(t.dataset.i)));
    el.querySelector('[data-i="back"]').addEventListener('click', () => { this.clicked = 'back'; });
    this.render();
  }

  render() {
    this.el.querySelectorAll('.pf-tile').forEach((t, i) => t.classList.toggle('on', i === this.index));
    const it = ITEMS[this.index];
    const u = it.u;
    const ok = this.found.has(u.id);
    const info = this.el.querySelector('.pf-info');
    info.classList.toggle('locked', !ok);
    info.classList.toggle('rel', it.sec === 'rel');
    info.querySelector('i').textContent = ok ? u.icon : '?';
    info.querySelector('b').textContent = ok ? u.name : '???';
    if (it.sec === 'fus') {
      info.querySelector('p').textContent = ok ? u.desc : 'Ainda não descoberta. Numa tentativa, pegue as duas melhorias da receita nos níveis pedidos (nas cartas de nível); com a receita pronta, o PRÓXIMO baú traz a fusão.';
      info.querySelector('small').textContent = `Receita: ${recipeText(u)} (as duas nas cartas de nível; depois, abra um baú)`;
    } else {
      info.querySelector('p').textContent = ok ? u.desc : 'Ainda não achado. Não sai nas cartas de nível: cada baú aberto nesta fase tem uma chance de trazê-lo (um achado por baú).';
      info.querySelector('small').textContent = `Fase: ${phaseName(u)} · sai dos baús dela`;
    }
    const tile = this.el.querySelectorAll('.pf-tile')[this.index];
    if (tile && tile.scrollIntoView) tile.scrollIntoView({ block: 'nearest' });
  }

  // anda pela linha/coluna visual (as seções começam numa linha nova)
  step(dr, dc) {
    const cur = ITEMS[this.index];
    if (dc) {
      const i = this.index + dc;
      return i >= 0 && i < ITEMS.length ? i : this.index;
    }
    const row = cur.row + dr;
    const inRow = ITEMS.map((x, i) => [x, i]).filter(([x]) => x.row === row);
    if (!inRow.length) return this.index;
    let best = inRow[0];
    for (const c of inRow) if (Math.abs(c[0].col - cur.col) < Math.abs(best[0].col - cur.col)) best = c;
    return best[1];
  }

  update(input) {
    if (this.clicked) { const k = this.clicked; this.clicked = null; this.audio?.play('select'); return k; }
    const p = input.players[0];
    let i = this.index;
    if (p.menu.right) i = this.step(0, 1);
    if (p.menu.left) i = this.step(0, -1);
    if (p.menu.down) i = this.step(1, 0);
    if (p.menu.up) i = this.step(-1, 0);
    if (i !== this.index) { this.index = i; this.audio?.play('select'); this.render(); }
    if (p.pressed.physical || p.pressed.jump || input.keyPressedOnce('Escape') || input.keyPressedOnce('Enter')) { this.audio?.play('select'); return 'back'; }
    return null;
  }

  dispose() { this.el.remove(); }
}
