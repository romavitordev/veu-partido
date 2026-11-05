// OUTRO LADO — a camada de HUD do modo (TODO §10), por cima do HUD de luta:
//  · o painel do jogador vai para o CANTO INFERIOR ESQUERDO e o do inimigo vira a barra do CHEFE no centro do alto
//    (classe .pve no #hud; ver styles.css);
//  · nível e barra de experiência, as melhorias da tentativa (e as sinergias), o objetivo da sala, a dica do momento;
//  · a escolha de melhoria ao subir de nível (3 cartas) — o jogo para enquanto escolhe.
import { UPGRADES, SYNERGIES, activeSynergies, countOf, xpForLevel } from './upgrades.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class PveHud {
  constructor(hud) {
    this.hud = hud;
    this.root = hud.root;
    this.root.classList.add('pve');
    const el = document.createElement('div');
    el.id = 'pvehud';
    el.innerHTML = `
      <div class="pv-top"><small class="pv-place"></small><b class="pv-room"></b><span class="pv-obj"></span></div>
      <div class="pv-xp"><span class="pv-lv">NV 1</span><div class="pv-bar"><i></i></div><span class="pv-depth"></span></div>
      <div class="pv-ups"></div>
      <div class="pv-hint"></div>
      <div class="pv-choose" hidden><h3>SUBIU DE NÍVEL</h3><p>Escolha uma melhoria para esta tentativa</p><div class="pv-cards"></div><small>◀ ▶ para escolher · A/× confirma</small></div>
      <div class="pv-fade"></div>`;
    this.root.appendChild(el);
    this.el = el;
    this.q = (s) => el.querySelector(s);
    this.choice = null;
    this.lastUps = '';
  }

  setPlace(place, room) {
    this.q('.pv-place').textContent = place || '';
    this.q('.pv-room').textContent = room || '';
  }

  setObjective(text) {
    this.q('.pv-obj').textContent = text || '';
  }

  hint(text) {
    const h = this.q('.pv-hint');
    h.textContent = text || '';
    h.classList.toggle('on', !!text);
  }

  setRun(run, depth) {
    this.q('.pv-lv').textContent = `NV ${run.level}`;
    this.q('.pv-bar i').style.width = `${Math.min(100, (run.xp / xpForLevel(run.level)) * 100)}%`;
    this.q('.pv-depth').textContent = depth > 1 ? `PROFUNDIDADE ${depth}` : '';
    const key = run.picks.join(',');
    if (key === this.lastUps) return;
    this.lastUps = key;
    const ids = [...new Set(run.picks)];
    const syn = activeSynergies(run.picks);
    this.q('.pv-ups').innerHTML = ids.map((id) => {
      const u = UPGRADES.find((x) => x.id === id);
      const n = countOf(run.picks, id);
      return `<span class="pv-up" title="${esc(u.name)}: ${esc(u.desc)}"><i>${u.icon}</i>${n > 1 ? `<u>${n}</u>` : ''}</span>`;
    }).join('') + syn.map((s) => `<span class="pv-syn" title="${esc(s.desc)}">${esc(s.name)}</span>`).join('');
  }

  // cartas de melhoria; onPick(id). Também pode clicar/tocar
  openChoice(choices, onPick) {
    const box = this.q('.pv-choose');
    this.choice = { choices, index: 1 % choices.length, onPick };
    this.q('.pv-cards').innerHTML = choices.map((u, i) => {
      const syn = SYNERGIES.filter((s) => s.needs.includes(u.id));
      return `<div class="pv-card" data-i="${i}"><i>${u.icon}</i><b>${esc(u.name)}</b><p>${esc(u.desc)}</p>${syn.length ? `<small>Sinergia: ${syn.map((s) => esc(s.name)).join(', ')}</small>` : ''}</div>`;
    }).join('');
    box.hidden = false;
    box.querySelectorAll('.pv-card').forEach((c) => c.addEventListener('click', () => { this.choice.index = Number(c.dataset.i); this.pick(); }));
    this.renderChoice();
  }

  renderChoice() {
    if (!this.choice) return;
    this.el.querySelectorAll('.pv-card').forEach((c, i) => c.classList.toggle('on', i === this.choice.index));
  }

  // menu das cartas: devolve true enquanto estiver aberto
  updateChoice(input, audio) {
    if (!this.choice) return false;
    const p = input.players[0];
    const n = this.choice.choices.length;
    if (p.menu.left || p.menu.up) { this.choice.index = (this.choice.index + n - 1) % n; audio.play('select'); this.renderChoice(); }
    if (p.menu.right || p.menu.down) { this.choice.index = (this.choice.index + 1) % n; audio.play('select'); this.renderChoice(); }
    if (p.pressed.jump || input.keyPressedOnce('Enter')) { audio.play('confirm'); this.pick(); }
    return !!this.choice;
  }

  pick() {
    const c = this.choice;
    if (!c) return;
    this.choice = null;
    this.q('.pv-choose').hidden = true;
    c.onPick(c.choices[c.index].id);
  }

  fade(on, time = 0.6) {
    const f = this.q('.pv-fade');
    f.style.transition = `opacity ${time}s`;
    f.classList.toggle('on', on);
  }

  dispose() {
    this.root.classList.remove('pve');
    this.el.remove();
  }
}
