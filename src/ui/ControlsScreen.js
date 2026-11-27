// TECLAS E BOTÕES (Opções → Teclas e botões; TODO, item 2 das melhorias das skills, 2026-11-26).
// Uma tabela por jogador (P1 / P2): cada ação com a tecla do teclado e o botão do controle. Escolher uma célula e
// confirmar (A/× ou clique) espera a nova tecla/botão; Esc (teclado) ou Start (controle) cancela.
//   - TECLA REPETIDA: a linha ganha um aviso dizendo quem mais usa a mesma tecla (o teclado é um só para os dois
//     jogadores) — a troca vale assim mesmo, o aviso é para quem escolheu de propósito poder seguir;
//   - VOLTAR AO PADRÃO: só do jogador da aba;
//   - salva na hora em SETTINGS.controls (config/controls.js aplica por cima do padrão).
import { t } from '../i18n/index.js';
import { onHover } from './hover.js';
import { keyName } from './labels.js';
import { SETTINGS, saveSettings } from '../config/settings.js';
import {
  REMAP_ACTIONS, RESERVED_KEYS, RESERVED_BUTTONS, PLAYER_DEVICES,
  applyControlBindings, setBinding, resetBindings, currentBinding, bindingConflicts, padName,
} from '../config/controls.js';

const OK = 'A/×';
const BACK = 'B/○';
const ACTIONS = REMAP_ACTIONS.kb; // a lista do teclado contém a do controle
const actionName = (a) => t('remap.a.' + a);

export class ControlsScreen {
  constructor(root, { audio, player = 0 } = {}) {
    this.audio = audio;
    this.player = player;
    this.index = 0; // linhas: as ações, depois "voltar ao padrão", depois "voltar"
    this.col = 0; // 0 = teclado, 1 = controle
    this.listen = null; // { device, action, since, base }
    this.cool = 0; // depois de trocar: ignora os menus até soltar (a tecla nova não vira "voltar")
    this.msg = '';
    this.el = document.createElement('div');
    this.el.className = 'screen clear';
    this.el.id = 'options';
    this.el.innerHTML = `<div class="opt-panel remap"><h2>${t('remap.title')}</h2>
      <div class="rm-tabs"><button type="button" data-p="0">P1</button><button type="button" data-p="1">P2</button></div>
      <div class="rm-head"><span></span><span>${t('remap.kb')}</span><span>${t('remap.pad')}</span></div>
      <div class="opt-list">${ACTIONS.map((a, i) => `<div class="opt-row rm-row" data-i="${i}"><span class="opt-label">${actionName(a)}<em class="rm-warn"></em></span><button type="button" class="rm-key" data-c="0"></button><button type="button" class="rm-key" data-c="1"></button></div>`).join('')}
        <div class="opt-row rm-row rm-reset" data-i="${ACTIONS.length}"><button type="button" class="rm-resetbtn">${t('remap.reset')}</button></div>
      </div>
      <div class="opt-desc"></div>
      <div class="opt-foot"><button type="button" class="opt-back">◀ ${t('ui.back')}</button><span class="opt-hint">${t('remap.hint', { ok: OK, back: BACK })}</span></div></div>`;
    root.appendChild(this.el);
    this.rowEls = [...this.el.querySelectorAll('.rm-row')];
    this.tabEls = [...this.el.querySelectorAll('.rm-tabs button')];
    this.descEl = this.el.querySelector('.opt-desc');
    this.backEl = this.el.querySelector('.opt-back');
    this.backEl.addEventListener('click', () => { this.clickedBack = true; });
    onHover(this.backEl, () => { if (!this.listen) { this.index = ACTIONS.length + 1; this.render(); } });
    this.tabEls.forEach((b) => b.addEventListener('click', () => this.setPlayer(+b.dataset.p)));
    this.rowEls.forEach((rowEl, i) => {
      onHover(rowEl, () => { if (!this.listen && this.index !== i) { this.index = i; this.render(); } });
      rowEl.querySelectorAll('.rm-key').forEach((b) => b.addEventListener('click', () => { if (this.listen) return; this.index = i; this.col = +b.dataset.c; this.start(); }));
    });
    this.el.querySelector('.rm-resetbtn').addEventListener('click', () => this.reset());
    // a tecla nova é pega ANTES do InputManager (captura) e não chega ao jogo
    this.onKey = (e) => {
      if (!this.listen || this.listen.device !== 'kb') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.repeat) return;
      if (e.code === 'Escape') { this.stop(t('remap.cancel')); return; }
      if (RESERVED_KEYS.includes(e.code)) { this.msg = t('remap.reserved', { key: keyName(e.code) }); this.render(); return; }
      this.bind(e.code);
    };
    window.addEventListener('keydown', this.onKey, true);
    this.render();
  }

  setPlayer(p) {
    if (this.listen || p === this.player) return;
    this.player = p;
    this.msg = '';
    this.audio?.play('select');
    this.render();
  }

  pad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    return pads[PLAYER_DEVICES[this.player].gamepadSlot] || null;
  }

  // a célula pode ser trocada? (o controle não troca direções nem as trocas de personagem; o P2 interage pela defesa)
  editable(action, col) {
    if (col === 1) return REMAP_ACTIONS.pad.includes(action);
    return !(action === 'interact' && this.player === 1);
  }

  start() {
    const action = ACTIONS[this.index];
    if (!action) return;
    if (!this.editable(action, this.col)) { this.msg = t('remap.fixed'); this.render(); return; }
    const device = this.col === 0 ? 'kb' : 'pad';
    if (device === 'pad' && !this.pad()) { this.msg = t('remap.nopad', { n: this.player + 1 }); this.render(); return; }
    const pad = this.pad();
    // os botões já apertados (o A que abriu a escuta) só contam depois de soltos
    const base = new Set(pad ? pad.buttons.map((b, k) => (b.pressed ? k : -1)).filter((k) => k >= 0) : []);
    this.listen = { device, action, base, t: 0 };
    this.msg = '';
    this.audio?.play('confirm');
    this.render();
  }

  stop(msg = '') {
    this.listen = null;
    this.msg = msg;
    this.cool = 0.25;
    this.render();
  }

  bind(code) {
    const { device, action } = this.listen;
    SETTINGS.controls = setBinding(SETTINGS.controls, device, this.player, action, code);
    applyControlBindings(SETTINGS.controls);
    saveSettings();
    this.audio?.play('confirm');
    const label = device === 'kb' ? keyName(code) : padName(code);
    const c = bindingConflicts(device, this.player, action, code);
    this.stop(c.length ? t('remap.dup', { key: label, who: this.who(c) }) : t('remap.ok', { key: label, action: actionName(action) }));
  }

  who(list) {
    return list.map((c) => (c.outroLado ? t('remap.outro', { what: t('remap.ol.' + c.action) }) : `P${c.player + 1} ${actionName(c.action)}`)).join(', ');
  }

  reset() {
    if (this.listen) return;
    SETTINGS.controls = resetBindings(SETTINGS.controls, this.player);
    applyControlBindings(SETTINGS.controls);
    saveSettings();
    this.audio?.play('confirm');
    this.msg = t('remap.didreset', { n: this.player + 1 });
    this.render();
  }

  cell(action, col) {
    if (!this.editable(action, col)) {
      if (col === 0 && action === 'interact') return `<small>${t('remap.a.block')}</small>`;
      return '—';
    }
    const codes = currentBinding(col === 0 ? 'kb' : 'pad', this.player, action);
    if (!codes.length) return '?';
    return codes.map((c) => (col === 0 ? keyName(c) : padName(c))).join(' / ');
  }

  render() {
    this.tabEls.forEach((b) => b.classList.toggle('sel', +b.dataset.p === this.player));
    this.rowEls.forEach((rowEl, i) => {
      rowEl.classList.toggle('on', i === this.index);
      const a = ACTIONS[i];
      if (!a) return;
      const keys = rowEl.querySelectorAll('.rm-key');
      let warn = [];
      keys.forEach((b, col) => {
        const listening = this.listen && this.listen.action === a && this.listen.device === (col === 0 ? 'kb' : 'pad');
        b.innerHTML = listening ? '…' : this.cell(a, col);
        b.classList.toggle('sel', i === this.index && col === this.col);
        b.classList.toggle('wait', !!listening);
        b.classList.toggle('fixed', !this.editable(a, col));
        let dup = false;
        if (this.editable(a, col)) {
          const dev = col === 0 ? 'kb' : 'pad';
          for (const code of currentBinding(dev, this.player, a)) {
            const c = bindingConflicts(dev, this.player, a, code);
            if (c.length) { warn = warn.concat(c); dup = true; }
          }
        }
        b.classList.toggle('dup', dup);
      });
      const w = rowEl.querySelector('.rm-warn');
      w.textContent = warn.length ? ` ⚠ ${t('remap.also', { who: this.who(warn) })}` : '';
    });
    this.backEl.classList.toggle('on', this.index === ACTIONS.length + 1);
    if (this.listen) this.descEl.textContent = this.listen.device === 'kb' ? t('remap.listen_kb', { action: actionName(this.listen.action) }) : t('remap.listen_pad', { action: actionName(this.listen.action), n: this.player + 1 });
    else this.descEl.textContent = this.msg || t('remap.desc', { ok: OK });
    const cur = this.rowEls[this.index] || this.backEl;
    if (cur && cur.scrollIntoView && this.lastShown !== this.index) { cur.scrollIntoView({ block: 'nearest' }); this.lastShown = this.index; }
  }

  update(input, dt = 1 / 60) {
    if (this.clickedBack) { this.clickedBack = false; this.audio?.play('select'); return 'back'; }
    // esperando o botão do controle
    if (this.listen && this.listen.device === 'pad') {
      this.listen.t += dt;
      const pad = this.pad();
      if (!pad || this.listen.t > 8) { this.stop(t('remap.cancel')); return null; }
      for (let k = 0; k < pad.buttons.length; k++) {
        const on = pad.buttons[k].pressed || pad.buttons[k].value > 0.5;
        if (!on) { this.listen.base.delete(k); continue; }
        if (this.listen.base.has(k)) continue;
        if (RESERVED_BUTTONS.includes(k)) { this.stop(t('remap.cancel')); return null; }
        this.bind(k);
        return null;
      }
      return null;
    }
    if (this.listen) return null; // o teclado chega pelo onKey
    // depois de trocar: espera soltar tudo (senão o botão novo vira "voltar"/"confirmar" no mesmo instante)
    if (this.cool > 0) {
      this.cool -= dt;
      const pad = this.pad();
      const busy = input.players.some((p) => Object.values(p.held || {}).some(Boolean)) || (pad && pad.buttons.some((b) => b.pressed));
      if (busy) this.cool = Math.max(this.cool, 0.05);
      return null;
    }
    const n = ACTIONS.length + 2;
    for (const p of input.players) {
      if (p.menu.up) { this.index = (this.index + n - 1) % n; this.msg = ''; this.audio?.play('select'); this.render(); }
      if (p.menu.down) { this.index = (this.index + 1) % n; this.msg = ''; this.audio?.play('select'); this.render(); }
      if ((p.menu.left || p.menu.right) && this.index < ACTIONS.length) { this.col = 1 - this.col; this.audio?.play('select'); this.render(); }
      if (p.pressed.pageL) this.setPlayer(0);
      if (p.pressed.pageR) this.setPlayer(1);
      if (p.pressed.jump) {
        if (this.index < ACTIONS.length) { this.start(); return null; }
        if (this.index === ACTIONS.length) { this.reset(); return null; }
        this.audio?.play('select');
        return 'back';
      }
      if (p.pressed.physical || p.pressed.start) { this.audio?.play('select'); return 'back'; }
    }
    if (input.keyPressedOnce('Enter')) {
      if (this.index < ACTIONS.length) this.start();
      else if (this.index === ACTIONS.length) this.reset();
      else { this.audio?.play('select'); return 'back'; }
      return null;
    }
    if (input.keyPressedOnce('Escape')) { this.audio?.play('select'); return 'back'; }
    return null;
  }

  dispose() {
    window.removeEventListener('keydown', this.onKey, true);
    this.el.remove();
  }
}
