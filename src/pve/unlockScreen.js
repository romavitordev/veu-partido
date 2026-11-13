// OUTRO LADO — a LOJA DE PERSONAGENS (pedido do dono, 2026-11-12), duas abas:
//  GACHA: a vitrine de 6 personagens (2 comuns, 2 raros, 1 épico, 1 lendário) que troca a cada 4 horas; um giro custa
//   SPIN_PRICE e sorteia pelas chances (lendário 0,1%, 0,5% aos domingos). Repetido devolve moedas. Só moedas do jogo.
//  COMPRAR: qualquer bloqueado direto, pelo preço da raridade — o caminho certo, porém mais caro que o giro.
// Devolve para o flow.js: 'spin', 'buy:<id>' ou 'back'. O resultado do giro volta por showSpin().
import { isUnlocked, pveBanned } from './unlocks.js';
import { RARITY_INFO, RARITIES, SPIN_PRICE, DUP_REFUND, rarityOf, shopPrice, shopBanner, shopWindow, nextRefresh, spinOdds } from './economy.js';

const COLS = 6;
const GCOLS = 3;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x) => `${(x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}min ${String(s % 60).padStart(2, '0')}s`;
};

export class PveUnlockScreen {
  constructor(root, { audio, data, roster, portraits, tab = 'gacha' }) {
    this.audio = audio;
    this.data = data;
    this.portraits = portraits;
    this.byId = Object.fromEntries(roster.map((c) => [c.id, c]));
    // a loja: os que podem ser comprados, do mais barato ao mais caro
    this.list = roster.filter((c) => !pveBanned(c) && rarityOf(c.id)).sort((a, b) => shopPrice(a.id) - shopPrice(b.id));
    this.banner = shopBanner(this.list.map((c) => c.id));
    this.tab = tab;
    this.focus = 'grid'; // 'tabs' | 'grid' | 'action' | 'back'
    this.index = 0;
    const el = document.createElement('div');
    el.className = 'screen pve-tree pve-unlock';
    el.innerHTML = `
      <div class="pt-wrap">
        <div class="pt-head"><h2>LOJA DE PERSONAGENS</h2><span class="pt-coins"></span></div>
        <div class="pu-tabs"><button data-tab="gacha">GACHA</button><button data-tab="shop">COMPRAR DIRETO</button></div>
        <div class="pu-gacha">
          <div class="pu-gtop"><h3>VITRINE DO OUTRO LADO</h3><span>⏱ Troca em <b class="pu-clock"></b></span></div>
          <div class="pu-bbody">
            <div class="pu-hero"><img alt=""><div><span>LENDÁRIO EM DESTAQUE</span><b></b><small></small></div></div>
            <div class="pt-grid pu-grid pu-banner"></div>
          </div>
          <div class="pu-odds"></div>
          <div class="pu-result" hidden></div>
        </div>
        <div class="pu-shop"><div class="pt-grid pu-grid pu-all"></div></div>
        <div class="pt-info"><img alt=""><div><b></b><p></p><small></small></div><button class="pt-buy" data-i="action">COMPRAR</button></div>
        <div class="pt-btns"><button data-i="back" class="pu-back">VOLTAR</button></div>
        <p class="pt-tip"></p>
      </div>`;
    root.appendChild(el);
    this.el = el;
    const tile = (c, i, kind) => {
      const r = rarityOf(c.id);
      return `<div class="pt-tile pu-tile r-${r}" data-k="${kind}" data-i="${i}" style="--c:${RARITY_INFO[r].color}"><img src="${this.portraits[c.id] || ''}" alt=""><b>${esc(c.name)}</b><em></em></div>`;
    };
    this.tileHtml = tile;
    el.querySelector('.pu-all').innerHTML = this.list.map((c, i) => tile(c, i, 's')).join('');
    this.sTiles = [...el.querySelectorAll('.pu-all .pu-tile')];
    this.sTiles.forEach((t) => this.bindTile(t));
    this.buildBanner();
    el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => this.setTab(b.dataset.tab)));
    el.querySelector('.pt-buy').addEventListener('click', () => { this.clicked = 'action'; });
    el.querySelector('.pu-back').addEventListener('click', () => { this.clicked = 'back'; });
    el.querySelector('.pu-result').addEventListener('click', () => this.hideResult());
    this.setTab(tab, true);
    this.timer = setInterval(() => this.tick(), 1000);
  }

  bindTile(t) {
    t.addEventListener('click', () => {
      const i = Number(t.dataset.i);
      if (this.focus === 'grid' && i === this.index && this.tab === 'shop') { this.clicked = 'action'; return; }
      this.focus = 'grid';
      this.index = i;
      this.audio?.play('select');
      this.render();
    });
  }

  // a vitrine da janela de 4 h (troca sozinha com a tela aberta)
  buildBanner() {
    const box = this.el.querySelector('.pu-banner');
    box.innerHTML = this.banner.slots.map((s, i) => this.tileHtml(this.byId[s.id], i, 'g')).join('');
    // o DESTAQUE (referência visual do dono: o banner de gacha com o personagem raro grande ao lado): o lendário da vez,
    // de corpo inteiro (o render da página Sobre; sem ele, o retrato)
    const top = this.banner.slots.find((x) => x.rarity === 'lendario') || this.banner.slots[this.banner.slots.length - 1];
    const hero = this.el.querySelector('.pu-hero');
    if (top) {
      const c = this.byId[top.id];
      const img = hero.querySelector('img');
      img.onerror = () => { img.onerror = null; img.src = this.portraits[top.id] || ''; };
      img.src = `${import.meta.env.BASE_URL || '/'}sobre/elenco/${top.id}.webp`;
      hero.style.setProperty('--c', RARITY_INFO[top.rarity].color);
      hero.querySelector('b').textContent = c ? c.name : top.id;
      hero.querySelector('small').textContent = c?.info?.tagline || '';
    }
    this.gTiles = [...box.querySelectorAll('.pu-tile')];
    this.gTiles.forEach((t) => this.bindTile(t));
  }

  get tiles() { return this.tab === 'gacha' ? this.gTiles : this.sTiles; }
  get cols() { return this.tab === 'gacha' ? GCOLS : COLS; }

  setTab(t, silent = false) {
    this.tab = t;
    this.focus = 'grid';
    this.index = t === 'shop' ? Math.max(0, this.list.findIndex((c) => !isUnlocked(this.data, c.id))) : 0;
    this.hideResult();
    if (!silent) this.audio?.play('select');
    this.render();
  }

  tick() {
    const left = nextRefresh() - Date.now();
    const c = this.el.querySelector('.pu-clock');
    if (c) c.textContent = clock(left);
    // a janela virou com a tela aberta: a vitrine nova aparece sozinha
    if (shopWindow() !== this.banner.window) {
      this.banner = shopBanner(this.list.map((x) => x.id));
      this.buildBanner();
      if (this.tab === 'gacha') this.index = 0;
      this.render();
    }
  }

  render() {
    const d = this.data;
    const coins = d.coins || 0;
    this.el.querySelector('.pt-coins').textContent = `● ${coins} moedas`;
    this.el.querySelectorAll('[data-tab]').forEach((b) => {
      b.classList.toggle('sel', b.dataset.tab === this.tab);
      b.classList.toggle('on', this.focus === 'tabs' && b.dataset.tab === this.tab);
    });
    this.el.querySelector('.pu-gacha').hidden = this.tab !== 'gacha';
    this.el.querySelector('.pu-shop').hidden = this.tab !== 'shop';
    const odds = spinOdds();
    const sunday = new Date().getDay() === 0;
    this.el.querySelector('.pu-odds').innerHTML = RARITIES.map((r) => `<i style="color:${RARITY_INFO[r].color}">${RARITY_INFO[r].label} ${pct(odds[r])}</i>`).join(' · ') + (sunday ? ' <b class="pu-sun">DOMINGO: lendário ×5</b>' : '');
    this.tick();
    const mark = (t, id) => {
      const own = isUnlocked(d, id);
      t.classList.toggle('locked', !own);
      // a chance de CADA um (a chance da raridade dividida entre os da vitrine nessa raridade)
      const r = rarityOf(id);
      const same = this.banner.slots.filter((x) => x.rarity === r).length || 1;
      t.querySelector('em').textContent = `${own ? '✓ ' : ''}${pct(spinOdds()[r] / same)}`;
    };
    this.gTiles.forEach((t, i) => { mark(t, this.banner.slots[i].id); t.classList.toggle('on', this.tab === 'gacha' && this.focus === 'grid' && i === this.index); });
    this.sTiles.forEach((t, i) => {
      const c = this.list[i];
      const own = isUnlocked(d, c.id);
      t.classList.toggle('locked', !own);
      t.classList.toggle('on', this.tab === 'shop' && this.focus === 'grid' && i === this.index);
      t.querySelector('em').textContent = own ? '✓ seu' : `● ${shopPrice(c.id)}`;
    });
    this.el.querySelector('.pu-back').classList.toggle('on', this.focus === 'back');
    const buy = this.el.querySelector('.pt-buy');
    buy.classList.toggle('on', this.focus === 'action');
    const info = this.el.querySelector('.pt-info');
    const tip = this.el.querySelector('.pt-tip');
    const tiles = this.tiles;
    const i = Math.min(this.index, tiles.length - 1);
    const c = this.tab === 'gacha' ? this.byId[this.banner.slots[i].id] : this.list[i];
    const r = rarityOf(c.id);
    const own = isUnlocked(d, c.id);
    info.style.setProperty('--c', RARITY_INFO[r].color);
    info.querySelector('img').src = this.portraits[c.id] || '';
    info.querySelector('b').innerHTML = `${esc(c.name)} <span class="pu-rar" style="color:${RARITY_INFO[r].color}">${RARITY_INFO[r].label.toUpperCase()}</span>`;
    info.querySelector('p').textContent = c.info?.tagline || c.origin || '';
    if (this.tab === 'gacha') {
      const missing = this.banner.slots.filter((s) => !isUnlocked(d, s.id)).length;
      info.querySelector('small').textContent = own ? 'Já é seu: se sair no giro, devolve moedas.' : `Na vitrine agora · na loja direta custa ● ${shopPrice(c.id)}`;
      buy.disabled = coins < SPIN_PRICE;
      buy.textContent = `GIRAR ×1 · ● ${SPIN_PRICE}`;
      tip.textContent = `Um giro sorteia a raridade pelas chances e depois um dos personagens da vitrine. Repetido devolve ● ${DUP_REFUND}. ${missing ? `${missing} da vitrine ainda não são seus.` : 'Você já tem todos da vitrine: espere a próxima.'} Só moedas do jogo.`;
    } else {
      const price = shopPrice(c.id);
      info.querySelector('small').textContent = own ? 'Liberado no Outro Lado' : `Custa ● ${price}${coins < price ? ` (faltam ${price - coins})` : ''} · no gacha sai mais barato, com sorte`;
      buy.disabled = own || coins < price;
      buy.textContent = own ? 'LIBERADO' : `COMPRAR · ● ${price}`;
      tip.textContent = 'Comprar direto é garantido, mas custa mais que tentar no gacha. As moedas vêm dos baús, dos inimigos e dos chefes; a morte não leva as moedas.';
    }
    const t = tiles[i];
    if (t && t.scrollIntoView && this.focus === 'grid') t.scrollIntoView({ block: 'nearest' });
  }

  // o resultado do giro (o flow.js chama depois de spin())
  // A ROLETA (pedido do dono, 2026-11-12: "uma animação ao girar, brilhando e passando vários personagens rápido; às vezes
  // passa um lendário do lado de um comum e cai o comum"): uma fita de retratos da vitrine corre pela janela, desacelera
  // e para no sorteado (o resultado já foi decidido em economy.js spin — a fita só mostra). Quase-lendário: quando não
  // saiu lendário, 40% das vezes ele aparece colado ao sorteado, e a fita para puxando para o lado dele.
  showSpin(res) {
    if (!res) return;
    const R = { cards: 46, target: 38, step: 112, dur: 4200 };
    const slots = this.banner.slots;
    const legend = slots.find((x) => x.rarity === 'lendario');
    // a fita: sorteia pela vitrine com mais peso nos raros, para a fita "brilhar"
    const strip = Array.from({ length: R.cards }, () => slots[Math.floor(Math.random() * slots.length)]);
    strip[R.target] = { id: res.id, rarity: res.rarity };
    let tease = 0;
    if (legend && res.rarity !== 'lendario' && Math.random() < 0.4) {
      tease = Math.random() < 0.5 ? 1 : -1;
      strip[R.target + tease] = legend;
    }
    // nenhum lendário encostado sem querer, fora o da provocação
    for (const i of [R.target - 1, R.target + 1]) if (i !== R.target + tease && strip[i].rarity === 'lendario' && res.rarity !== 'lendario') strip[i] = slots[0];
    const reel = document.createElement('div');
    reel.className = 'pu-reel';
    reel.innerHTML = `<div class="pu-rwin"><div class="pu-strip">${strip.map((x) => `<div class="pu-rcard r-${x.rarity}" style="--c:${RARITY_INFO[x.rarity].color}"><img src="${this.portraits[x.id] || ''}" alt=""><b>${esc(this.byId[x.id]?.name || x.id)}</b></div>`).join('')}</div><i class="pu-mark"></i></div>`;
    this.el.querySelector('.pu-gacha').appendChild(reel);
    const stripEl = reel.querySelector('.pu-strip');
    const win = reel.querySelector('.pu-rwin');
    const center = () => win.clientWidth / 2 - (R.step - 8) / 2;
    // onde para: o centro do sorteado, com um desvio pequeno (puxando para o lado do lendário na provocação)
    const jitter = tease ? tease * (0.3 + Math.random() * 0.12) : (Math.random() - 0.5) * 0.5;
    const end = R.target * R.step + jitter * (R.step - 8) * 0.5;
    const t0 = performance.now();
    let lastCard = -1;
    this.spinning = true;
    const ease = (k) => 1 - Math.pow(1 - k, 4); // rápido no começo, para devagar
    const frame = (now) => {
      if (!reel.isConnected) return;
      const k = Math.min(1, (now - t0) / R.dur);
      const x = end * ease(k);
      stripEl.style.transform = `translateX(${center() - x}px)`;
      const card = Math.round(x / R.step);
      if (card !== lastCard) { lastCard = card; this.audio?.play('select', { volume: 0.35, pitch: 1 + 0.6 * (1 - k) }); }
      if (k < 1) { requestAnimationFrame(frame); return; }
      // parou: o sorteado brilha na cor da raridade, depois o cartão do resultado
      const got = stripEl.children[R.target];
      got.classList.add('win');
      reel.classList.add('done', `r-${res.rarity}`);
      setTimeout(() => {
        reel.remove();
        this.spinning = false;
        this.showResult(res);
      }, res.rarity === 'lendario' || res.rarity === 'epico' ? 1100 : 650);
    };
    requestAnimationFrame(frame);
    this.render();
  }

  showResult(res) {
    const box = this.el.querySelector('.pu-result');
    const c = this.byId[res.id];
    const info = RARITY_INFO[res.rarity];
    box.hidden = false;
    box.style.setProperty('--c', info.color);
    box.className = `pu-result r-${res.rarity}`;
    box.innerHTML = `<div><img src="${this.portraits[res.id] || ''}" alt=""><span>${info.label.toUpperCase()}</span><b>${esc(c ? c.name : res.id)}</b><small>${res.dup ? `Repetido: +● ${res.refund} de volta` : 'NOVO! Liberado no Outro Lado'}</small><em>clique ou aperte para continuar</em></div>`;
    this.resultT = performance.now();
    this.render();
  }

  hideResult() {
    const box = this.el.querySelector('.pu-result');
    if (box) box.hidden = true;
    this.resultT = 0;
  }

  move(dir) {
    const tiles = this.tiles;
    const n = tiles.length;
    const C = this.cols;
    let { focus, index: i } = this;
    if (focus === 'tabs') {
      if (dir === 'left' || dir === 'right') { this.setTab(this.tab === 'gacha' ? 'shop' : 'gacha'); this.focus = 'tabs'; this.render(); return; }
      if (dir === 'down') focus = 'grid';
    } else if (focus === 'grid') {
      if (dir === 'left') i = (i + n - 1) % n;
      else if (dir === 'right') i = (i + 1) % n;
      else if (dir === 'up') { if (i - C >= 0) i -= C; else focus = 'tabs'; }
      else if (dir === 'down') { if (i + C < n) i += C; else focus = 'action'; }
    } else if (focus === 'action') {
      if (dir === 'up') focus = 'grid';
      else if (dir === 'down') focus = 'back';
    } else if (focus === 'back') {
      if (dir === 'up') focus = 'action';
    }
    if (focus !== this.focus || i !== this.index) { this.focus = focus; this.index = i; this.audio?.play('select'); this.render(); }
  }

  action() {
    if (this.tab === 'gacha') return 'spin';
    const c = this.list[this.index];
    return c ? `buy:${c.id}` : null;
  }

  update(input) {
    const k = this.clicked;
    this.clicked = undefined;
    const p = input.players[0];
    const ok = p.pressed.jump || input.keyPressedOnce('Enter');
    const esc2 = p.pressed.physical || input.keyPressedOnce('Escape');
    // o resultado na tela: qualquer botão fecha (depois de um instante, para não pular sem ver)
    if (this.spinning) return null; // a roleta girando: espera
    if (this.resultT) {
      if ((ok || esc2 || k) && performance.now() - this.resultT > 450) { this.hideResult(); this.render(); }
      return null;
    }
    if (k === 'back') { this.audio?.play('select'); return 'back'; }
    if (k === 'action') return this.action();
    for (const d of ['left', 'right', 'up', 'down']) if (p.menu[d]) this.move(d);
    if (input.keyPressedOnce('KeyQ') || input.keyPressedOnce('KeyE')) { this.setTab(this.tab === 'gacha' ? 'shop' : 'gacha'); return null; }
    if (ok) {
      if (this.focus === 'back') return 'back';
      if (this.focus === 'tabs') { this.focus = 'grid'; this.render(); return null; }
      if (this.focus === 'action' || this.tab === 'shop') return this.action();
      this.focus = 'action'; // no gacha: o quadrado só mostra; Enter leva ao GIRAR
      this.render();
      return null;
    }
    if (esc2) { this.audio?.play('select'); return 'back'; }
    return null;
  }

  dispose() { clearInterval(this.timer); this.el.remove(); }
}
