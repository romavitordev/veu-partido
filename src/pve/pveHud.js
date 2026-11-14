// OUTRO LADO — a camada de HUD do modo (TODO §10), por cima do HUD de luta:
//  · o painel do jogador vai para o CANTO INFERIOR ESQUERDO e o do inimigo vira a barra do CHEFE no centro do alto
//    (classe .pve no #hud; ver styles.css);
//  · nível e barra de experiência, as melhorias da tentativa (e as sinergias), o objetivo da sala, a dica do momento;
//  · a escolha de melhoria ao subir de nível (3 cartas) — o jogo para enquanto escolhe.
import { actionLabel } from '../ui/labels.js';
import { SYNERGIES, activeSynergies, countOf, xpForLevel, MAX_KIT, MAX_PASSIVE, slotsOf, getUpgrade } from './upgrades.js';

// os graus como pontinhos (cheios até `n`; `was`: os que já tinha, o novo brilha)
const pipsHtml = (n, max, was = n) => Array.from({ length: max }, (_, i) => `<b class="${i < was ? 'on' : i < n ? 'new' : ''}"></b>`).join('');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function fmtTime(t) {
  const cs = Math.floor((t || 0) * 100);
  const m = Math.floor(cs / 6000);
  const s = Math.floor(cs / 100) % 60;
  return `${m}:${String(s).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
}

// os ids da build sem repetir: os do KIT primeiro, depois as passivas (ids que a ficha ainda não registrou ficam de fora)
function buildIds(picks) {
  const ids = [...new Set(picks)].filter((id) => getUpgrade(id));
  return ids.sort((a, b) => (getUpgrade(b).kind === 'kit') - (getUpgrade(a).kind === 'kit'));
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
      <div class="pv-choose" hidden><div class="pv-panel"><h3>SUBIU DE NÍVEL!</h3><p>Escolha uma melhoria para esta tentativa</p><div class="pv-cards"></div><div class="pv-build"></div><small class="pv-choose-hint">▲ ▼ escolhe · A/× ou Enter confirma · clique/toque também</small></div></div>
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

  // o recorde da fase (embaixo do cronômetro; null = ainda não tem)
  setRecord(t) {
    this.record = t || null;
    let el = this.q('.pv-rec');
    if (!el) { el = document.createElement('div'); el.className = 'pv-rec'; this.q('.pv-time').after(el); }
    el.textContent = t ? `RECORDE ${fmtTime(t)}` : 'SEM RECORDE';
  }

  // cronômetro de speedrun (mm:ss.cc); pausa com o jogo (cartas, pausa)
  setTime(t) {
    const [m, c] = fmtTime(t).split('.');
    if (m !== this.lastT) { this.lastT = m; this.q('.pv-time b').textContent = m; }
    this.q('.pv-time small').textContent = `.${c}`;
    // passou do recorde: o cronômetro fica vermelho; abaixo dele, dourado
    if (this.record) this.q('.pv-time').classList.toggle('over', t > this.record);
    if (this.shield) this.ensureShield();
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

  // as PROVAS do Enigma de Medo (a Escola Nostradamus): "PROVAS n/3"; null = some
  setClues(n, total) {
    const el = this.q('.pv-coins');
    let k = el.querySelector('.pv-clues');
    if (!k) { k = document.createElement('span'); k.className = 'pv-clues'; el.appendChild(k); }
    k.textContent = total ? `  · PROVAS ${n}/${total}` : '';
  }

  // o ESCUDO DE MEDO da Degolificada: uma segunda vida (azul-acinzentada, em terços) por cima da vida amarela DELA.
  // n = terços que faltam tirar; total 0 = some. Vai na barra do painel ligado à chefe (no solo, a barra de chefe do
  // alto); no COOP os dois painéis são dos jogadores, então vai na barra do inimigo do alto (.pv-enemy) — antes o
  // escudo caía no painel 2, que no coop é a vida do P2. O painel é refeito às vezes (bindHud): ensureShield recoloca.
  setShield(n, total, boss = null) {
    this.shield = total ? { n, total, boss: boss || this.shield?.boss || null } : null;
    this.ensureShield(true);
  }

  shieldBar() {
    const boss = this.shield?.boss;
    const i = boss && this.hud.fighters ? this.hud.fighters.indexOf(boss) : -1;
    if (i >= 0 || !boss) return this.hud.panels?.[i >= 0 ? i : 1]?.querySelector('.bar.health');
    // coop: a barra do inimigo da vez (setEnemy), no alto (a de cima; a de baixo copia em ensureShield)
    return this.q('.pv-enemy:not(.low):not([hidden]) .pv-ebar');
  }

  ensureShield(force = false) {
    if (!this.shield) {
      this.el.querySelectorAll('.pv-ebar .pv-shieldbar').forEach((o) => o.remove());
      for (const p of this.hud.panels || []) p.querySelector('.pv-shieldbar')?.remove();
      return;
    }
    const bar = this.shieldBar();
    if (!bar) return;
    let el = bar.querySelector('.pv-shieldbar');
    if (el && !force) return;
    // a barra mudou de lugar (o painel foi refeito): tira o escudo de onde ele não é dela
    for (const o of [...(this.hud.panels || []).map((p) => p.querySelector('.pv-shieldbar')), this.q('.pv-enemy:not(.low) .pv-ebar .pv-shieldbar')]) if (o && o !== el) o.remove();
    if (!el) { el = document.createElement('div'); el.className = 'pv-shieldbar'; bar.appendChild(el); }
    const { n, total } = this.shield;
    el.innerHTML = Array.from({ length: total }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
    // a metade de baixo da tela dividida: a mesma barra azul
    const low = this.q('.pv-enemy.low:not([hidden]) .pv-ebar');
    if (low && bar.closest('.pv-enemy')) {
      let e2 = low.querySelector('.pv-shieldbar');
      if (!e2) { e2 = document.createElement('div'); e2.className = 'pv-shieldbar'; low.appendChild(e2); }
      e2.innerHTML = el.innerHTML;
    }
  }

  flashShield() {
    const el = this.shieldBar()?.querySelector('.pv-shieldbar');
    if (!el) return;
    el.classList.remove('hit');
    void el.offsetWidth;
    el.classList.add('hit');
  }

  // o que saiu do BAÚ: um cartão discreto (título + linhas ícone · nome · nível), some sozinho
  loot(title, rows, tier = 1) {
    let el = this.q('.pv-loot');
    if (!el) { el = document.createElement('div'); el.className = 'pv-loot'; this.el.appendChild(el); }
    el.dataset.tier = String(Math.min(3, tier));
    el.innerHTML = `<small>${esc(title)}</small>` + rows.map((r) => `<div><i>${esc(r.icon)}</i><b>${esc(r.name)}</b><em>${esc(r.tag)}</em></div>`).join('');
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
  }

  // o nome do golpe de uma criatura: pequeno, no canto (pedido do dono, 2026-11-06)
  moveName(text) {
    let el = this.q('.pv-move');
    if (!el) { el = document.createElement('div'); el.className = 'pv-move'; this.el.appendChild(el); }
    el.textContent = text;
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
  }

  hint(text) {
    const h = this.q('.pv-hint');
    h.textContent = text || '';
    h.classList.toggle('on', !!text);
  }

  setRun(run, depth) {
    this.q('.pv-lv').textContent = `NV ${run.level}`;
    this.q('.pv-bar i').style.width = `${Math.min(100, (run.xp / xpForLevel(run.level)) * 100)}%`;
    this.q('.pv-depth').textContent = ''; // fases separadas (2026-11-14): a profundidade é a da fase, não aparece
    const key = run.picks.join(',');
    if (key === this.lastUps) return;
    this.lastUps = key;
    // os golpes do KIT primeiro (com a borda roxa), depois as passivas
    const ids = buildIds(run.picks);
    const syn = activeSynergies(run.picks);
    this.q('.pv-ups').innerHTML = ids.map((id) => {
      const u = getUpgrade(id);
      const n = countOf(run.picks, id);
      return `<span class="pv-up ${u.kind === 'kit' ? 'act' : ''}" title="${esc(u.name)}: ${esc(u.desc)}"><i>${u.icon}</i><s>${pipsHtml(n, u.max)}</s></span>`;
    }).join('') + syn.map((s) => `<span class="pv-syn" title="${esc(s.desc)}">${esc(s.name)}</span>`).join('');
  }

  // a escolha ao subir de nível, no estilo Vampire Survivors: uma lista de linhas (ícone, nome, NOVO! ou o nível que
  // vai ganhar, a descrição) e, embaixo, a build atual. onPick(id). Também pode clicar/tocar
  // who: quem escolhe (coop: P1 e P2 alternam); noClick: online o clique não vale (só o controle/teclado, que viaja
  // na rede); mine: esta tela é de quem escolhe
  openChoice(choices, run, onPick, { who = 0, coop = false, noClick = false, mine = true, title = 'SUBIU DE NÍVEL!', sub = 'Escolha uma melhoria para esta tentativa', what = 'a melhoria' } = {}) {
    const box = this.q('.pv-choose');
    const picks = run.picks || [];
    this.choice = { choices, index: 0, onPick, who };
    const panel = box.querySelector('.pv-panel') || box;
    const head = panel.querySelector('.pv-who') || panel.insertBefore(Object.assign(document.createElement('div'), { className: 'pv-who' }), panel.firstChild);
    head.hidden = !coop;
    head.textContent = coop ? (mine ? `P${who + 1}: sua vez de escolher ${what} do grupo` : `O P${who + 1} está escolhendo ${what} do grupo…`) : '';
    panel.querySelector('h3').textContent = title;
    panel.querySelector('h3 + p').textContent = sub;
    this.q('.pv-cards').innerHTML = choices.map((u, i) => {
      if (u.reward) return `<div class="pv-card" data-i="${i}"><i>${u.icon}</i><div><b>${esc(u.name)}</b><p>${esc(u.desc)}</p></div></div>`;
      const n = countOf(picks, u.id);
      const syn = SYNERGIES.filter((s) => s.needs.includes(u.id));
      const ready = syn.filter((s) => s.needs.every((x) => x === u.id || picks.includes(x)));
      const tag = n ? `nv ${n + 1}` : u.chest ? 'NOVA DO BAÚ!' : 'NOVO!';
      const kind = u.kind === 'kit' ? `<u class="act">${coop ? esc(u.who) : 'SEU KIT'}</u>` : '<u>PASSIVA</u>';
      return `<div class="pv-card ${u.kind === 'kit' ? 'act' : ''}" data-i="${i}"><i>${u.icon}</i><div><b>${kind}${esc(u.name)}<em class="${n ? '' : 'new'}">${tag}</em></b><p>${esc(u.desc)}</p><s>${pipsHtml(n + 1, u.max, n)}</s>${ready.length ? `<small class="ready">★ Liga a sinergia ${ready.map((s) => esc(s.name)).join(', ')}!</small>` : syn.length ? `<small>Sinergia: ${syn.map((s) => esc(s.name)).join(', ')}</small>` : ''}</div></div>`;
    }).join('');
    const ids = buildIds(picks);
    const kitChar = choices.find((u) => u.kind === 'kit')?.char;
    this.q('.pv-build').innerHTML = `<span>Build (nv ${run.level}) · kit ${slotsOf(picks, 'kit', kitChar)}/${MAX_KIT} · passivas ${slotsOf(picks, 'passive')}/${MAX_PASSIVE}</span>` + (ids.length ? ids.map((id) => {
      const u = getUpgrade(id);
      return `<span class="pv-up ${u.kind === 'kit' ? 'act' : ''}" title="${esc(u.name)}"><i>${u.icon}</i><s>${pipsHtml(countOf(picks, id), u.max)}</s></span>`;
    }).join('') : '<em>nenhuma melhoria ainda</em>');
    box.hidden = false;
    if (!noClick) box.querySelectorAll('.pv-card').forEach((c) => c.addEventListener('click', () => { if (!this.choice) return; this.choice.index = Number(c.dataset.i); this.pick(); }));
    this.renderChoice();
  }

  renderChoice() {
    if (!this.choice) return;
    this.el.querySelectorAll('.pv-card').forEach((c, i) => c.classList.toggle('on', i === this.choice.index));
  }

  // menu das cartas: devolve true enquanto estiver aberto
  updateChoice(input, audio) {
    if (!this.choice) return false;
    const p = input.players[this.choice.who || 0];
    const n = this.choice.choices.length;
    if (p.menu.up || p.menu.left) { this.choice.index = (this.choice.index + n - 1) % n; audio.play('select'); this.renderChoice(); }
    if (p.menu.right || p.menu.down) { this.choice.index = (this.choice.index + 1) % n; audio.play('select'); this.renderChoice(); }
    if (p.pressed.jump || (!this.choice.who && input.keyPressedOnce('Enter'))) { audio.play('confirm'); this.pick(); }
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
  // Na tela dividida (coop local) a barra aparece nas DUAS metades (pedido do dono, 2026-11-06): .pv-enemy em cima e
  // .pv-enemy.low na de baixo; o escudo da Degolificada vai nas duas (ensureShield)
  setEnemy(name, frac, sig = false) {
    const els = [this.enemyBar('pv-enemy', true)];
    if (this.split) els.push(this.enemyBar('pv-enemy low', true));
    else this.q('.pv-enemy.low')?.remove();
    for (const el of els) {
      el.hidden = name == null;
      el.classList.toggle('sig', !!sig);
      if (name == null) continue;
      const b = el.querySelector('b');
      if (b.textContent !== name) b.textContent = name;
      el.querySelector('i').style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`;
    }
  }

  enemyBar(cls, make) {
    let el = this.q('.' + cls.split(' ').join('.') + (cls.includes('low') ? '' : ':not(.low)'));
    if (!el && make) {
      el = document.createElement('div');
      el.className = cls;
      el.innerHTML = '<b></b><div class="pv-ebar"><i></i></div>';
      this.el.appendChild(el);
    }
    return el;
  }

  // EXPEDIÇÃO ONLINE: o nome do parceiro em cima do personagem dele (x, y em pixels da tela; null esconde)
  setMate(name, x, y, color = '#7ec8ff') {
    let el = this.q('.pv-mate');
    if (!el) { el = document.createElement('div'); el.className = 'pv-mate'; this.el.appendChild(el); }
    if (name === null || x === null) { el.hidden = true; return; }
    el.hidden = false;
    if (el.textContent !== name) el.textContent = name;
    el.style.color = color;
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
  }

  // VOLTAR À VIDA: a oferta (null esconde). o = { price, t, who: [{ name, coins, ok }], coop }
  showRevive(o) {
    // VOLTAR À VIDA (refeito: pedido do dono, 2026-11-14 — "não tem nenhum botão, indicação visual"): dois CARTÕES
    // (pagar / desistir) que se escolhem com a direção, o mouse ou o dedo; a barra do tempo esvazia; as teclas reais
    let el = this.q('.pv-revive');
    if (!o) { if (el) el.hidden = true; this.reviveKey = null; return; }
    if (!el) { el = document.createElement('div'); el.className = 'pv-revive'; this.el.appendChild(el); }
    el.hidden = false;
    const ok = o.who.some((w) => w.ok);
    const key = JSON.stringify([o.price, o.who, o.coop, o.sel]);
    if (this.reviveKey !== key) {
      this.reviveKey = key;
      const a = actionLabel(0, 'jump');
      const b = actionLabel(0, 'physical');
      const rows = o.who.map((w) => `<span class="${w.ok ? 'ok' : 'no'}">${esc(w.name)} <b>● ${w.coins}</b></span>`).join('');
      el.innerHTML = `<div class="pv-panel">
        <small class="rv-k">VOCÊ CAIU</small>
        <h3>VOLTAR À VIDA?</h3>
        <div class="rv-time"><i></i></div>
        <div class="pv-cards rv-cards">
          <div class="pv-card rv-yes ${o.sel === 0 ? 'on' : ''} ${ok ? '' : 'off'}" data-rv="0"><i>✚</i><div><b>VOLTAR <em class="new">● ${o.price}</em></b><p>${o.coop ? 'Os dois voltam' : 'Você volta'} de pé com metade da vida${o.coop ? ' (paga quem confirmar)' : ''}.</p></div><kbd>${esc(a)} / A</kbd></div>
          <div class="pv-card rv-no ${o.sel === 1 ? 'on' : ''}" data-rv="1"><i>✕</i><div><b>DESISTIR</b><p>A tentativa acaba aqui e você vê o resultado.</p></div><kbd>${esc(b)} / B</kbd></div>
        </div>
        <div class="rv-who">${rows}</div>
        <small class="rv-hint">▲ ▼ escolhe · ${esc(a)} / A confirma · ${esc(b)} / B desiste</small>
      </div>`;
      el.querySelectorAll('[data-rv]').forEach((c) => c.addEventListener('click', () => { this.reviveClick = Number(c.dataset.rv); }));
    }
    const bar = el.querySelector('.rv-time i');
    if (bar) bar.style.width = `${Math.max(0, Math.min(1, o.left)) * 100}%`;
    el.classList.toggle('urgent', o.t <= 4);
  }

  setSplit(on) {
    this.split = !!on;
    let el = this.q('.pv-split');
    if (!el && on) { el = document.createElement('div'); el.className = 'pv-split'; this.el.appendChild(el); }
    if (el) el.hidden = !on;
  }

  dispose() {
    this.root.classList.remove('pve');
    this.el.remove();
  }
}
