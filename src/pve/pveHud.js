// OUTRO LADO — a camada de HUD do modo (TODO §10), por cima do HUD de luta:
//  · o painel do jogador vai para o CANTO INFERIOR ESQUERDO e o do inimigo vira a barra do CHEFE no centro do alto
//    (classe .pve no #hud; ver styles.css);
//  · nível e barra de experiência, as melhorias da tentativa (e as sinergias), o objetivo da sala, a dica do momento;
//  · a escolha de melhoria ao subir de nível (3 cartas) — o jogo para enquanto escolhe.
import { UPGRADES, SYNERGIES, activeSynergies, countOf, xpForLevel } from './upgrades.js';

// os graus como pontinhos (cheios até `n`; `was`: os que já tinha, o novo brilha)
const pipsHtml = (n, max, was = n) => Array.from({ length: max }, (_, i) => `<b class="${i < was ? 'on' : i < n ? 'new' : ''}"></b>`).join('');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function fmtTime(t) {
  const cs = Math.floor((t || 0) * 100);
  const m = Math.floor(cs / 6000);
  const s = Math.floor(cs / 100) % 60;
  return `${m}:${String(s).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
}

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
      <div class="pv-time" title="Cronômetro da dungeon (para speedrun)"><b>0:00</b><small>.00</small></div>
      <div class="pv-coins" title="Moedas: compram os personagens bloqueados">● <b>0</b></div>
      <div class="pv-hint"></div>
      <div class="pv-choose" hidden><div class="pv-panel"><h3>SUBIU DE NÍVEL!</h3><p>Escolha uma melhoria para esta tentativa</p><div class="pv-cards"></div><div class="pv-build"></div><small>▲ ▼ escolhe · A/× ou Enter confirma</small></div></div>
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

  // cronômetro de speedrun (mm:ss.cc); pausa com o jogo (cartas, pausa)
  setTime(t) {
    const [m, c] = fmtTime(t).split('.');
    if (m !== this.lastT) { this.lastT = m; this.q('.pv-time b').textContent = m; }
    this.q('.pv-time small').textContent = `.${c}`;
  }

  setCoins(n) {
    this.q('.pv-coins b').textContent = String(n);
  }

  // as chaves guardadas (portas com cadeado): só aparece com pelo menos uma
  setKeys(n) {
    const el = this.q('.pv-coins');
    let k = el.querySelector('.pv-keys');
    if (!k) { k = document.createElement('span'); k.className = 'pv-keys'; el.appendChild(k); }
    k.textContent = n > 0 ? `  · 🗝 ${n}` : '';
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
      return `<span class="pv-up" title="${esc(u.name)}: ${esc(u.desc)}"><i>${u.icon}</i><s>${pipsHtml(n, u.max)}</s></span>`;
    }).join('') + syn.map((s) => `<span class="pv-syn" title="${esc(s.desc)}">${esc(s.name)}</span>`).join('');
  }

  // a escolha ao subir de nível, no estilo Vampire Survivors: uma lista de linhas (ícone, nome, NOVO! ou o nível que
  // vai ganhar, a descrição) e, embaixo, a build atual. onPick(id). Também pode clicar/tocar
  openChoice(choices, run, onPick) {
    const box = this.q('.pv-choose');
    const picks = run.picks || [];
    this.choice = { choices, index: 0, onPick };
    this.q('.pv-cards').innerHTML = choices.map((u, i) => {
      const n = countOf(picks, u.id);
      const syn = SYNERGIES.filter((s) => s.needs.includes(u.id));
      const ready = syn.filter((s) => s.needs.every((x) => x === u.id || picks.includes(x)));
      const tag = n ? `nv ${n + 1}` : 'NOVO!';
      return `<div class="pv-card" data-i="${i}"><i>${u.icon}</i><div><b>${esc(u.name)}<em class="${n ? '' : 'new'}">${tag}</em></b><p>${esc(u.desc)}</p><s>${pipsHtml(n + 1, u.max, n)}</s>${ready.length ? `<small class="ready">★ Liga a sinergia ${ready.map((s) => esc(s.name)).join(', ')}!</small>` : syn.length ? `<small>Sinergia: ${syn.map((s) => esc(s.name)).join(', ')}</small>` : ''}</div></div>`;
    }).join('');
    const ids = [...new Set(picks)];
    this.q('.pv-build').innerHTML = `<span>Build (nv ${run.level})</span>` + (ids.length ? ids.map((id) => {
      const u = UPGRADES.find((x) => x.id === id);
      return `<span class="pv-up" title="${esc(u.name)}"><i>${u.icon}</i><s>${pipsHtml(countOf(picks, id), u.max)}</s></span>`;
    }).join('') : '<em>nenhuma melhoria ainda</em>');
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
    if (p.menu.up || p.menu.left) { this.choice.index = (this.choice.index + n - 1) % n; audio.play('select'); this.renderChoice(); }
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

  // COOP LOCAL: a vida do inimigo da vez (os dois painéis da HUD são dos jogadores) e a linha do meio da tela dividida
  setEnemy(name, frac) {
    let el = this.q('.pv-enemy');
    if (!el) {
      el = document.createElement('div');
      el.className = 'pv-enemy';
      el.innerHTML = '<b></b><div class="pv-ebar"><i></i></div>';
      this.el.appendChild(el);
    }
    el.hidden = name == null;
    if (name == null) return;
    const b = el.querySelector('b');
    if (b.textContent !== name) b.textContent = name;
    el.querySelector('i').style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`;
  }

  setSplit(on) {
    let el = this.q('.pv-split');
    if (!el && on) { el = document.createElement('div'); el.className = 'pv-split'; this.el.appendChild(el); }
    if (el) el.hidden = !on;
  }

  dispose() {
    this.root.classList.remove('pve');
    this.el.remove();
  }
}
