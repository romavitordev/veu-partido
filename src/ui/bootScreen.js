// TELA DE CARREGAMENTO DO JOGO (#bootscreen, index.html) — pedido do dono, 2026-11-18. Mostra o progresso real dos
// downloads (models/netLoad.js), o que está sendo feito, avisa quando a conexão para e mostra o erro com
// "TENTAR DE NOVO". Some quando o menu fica pronto.
// MENU ANTES DOS DOWNLOADS (TODO, 2026-11-18): a tela sai da frente logo (menuReady) e os downloads seguem por trás,
// com um selo no canto (#netbadge). Escolher um modo antes do fim chama wait(): a tela volta com "TERMINANDO DE
// BAIXAR" e o botão VOLTAR; quando tudo chega, done() some com ela e o modo abre sozinho.
import { onNetProgress } from '../models/netLoad.js';
import { t } from '../i18n/index.js';

const TIP_COUNT = 6;
const STALL_MS = 15000; // sem byte novo por 15 s: avisa que a conexão está lenta/parada

const mb = (b) => (b / 1048576).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function createBootScreen() {
  const root = document.getElementById('bootscreen');
  if (!root) return { setStage() {}, fail() {}, done() {}, menuReady() {}, wait() {}, unwait() {}, onCancel() {} };
  window.__bootStarted = true;
  const $ = (s) => root.querySelector(s);
  const fill = $('.bs-bar i');
  const pct = $('.bs-pct');
  const mbEl = $('.bs-mb');
  const status = $('.bs-status');
  const note = $('.bs-note');
  const tipEl = $('.bs-tip');
  let shown = 0; // a barra só anda para frente (uma nova tentativa aumenta o total de arquivos)
  let scale = 0.9; // os downloads ocupam até 90%; o resto é preparar os retratos
  let finished = false;
  let away = false; // menu aberto por cima: a tela está escondida, mas segue o progresso
  let cancelFn = null;
  const badge = document.createElement('div');
  badge.id = 'netbadge';
  badge.setAttribute('role', 'status');
  badge.hidden = true;
  badge.innerHTML = '<i></i><span></span>';
  document.body.appendChild(badge);
  const badgeTxt = badge.querySelector('span');
  const badgeFill = badge.querySelector('i');
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'bs-cancel';
  cancel.hidden = true;
  cancel.addEventListener('click', () => cancelFn && cancelFn());
  tipEl.before(cancel);
  let last = { bytes: 0, lastByteAt: performance.now(), files: 0, done: 0, failed: 0, frac: 0 };

  const setBar = (k) => {
    shown = Math.max(shown, Math.min(1, k));
    fill.style.width = `${(shown * 100).toFixed(1)}%`;
    pct.textContent = `${Math.floor(shown * 100)}%`;
    badgeFill.style.width = `${(shown * 100).toFixed(1)}%`;
    badgeTxt.textContent = t('boot.badge', { pct: Math.floor(shown * 100) });
  };
  status.textContent = t('boot.models');
  let tip = Math.floor(Math.random() * TIP_COUNT);
  const nextTip = () => { tip = (tip + 1) % TIP_COUNT; tipEl.textContent = t('load.tip', { tip: t(`tip.${tip + 1}`) }); };
  nextTip();
  const tipTimer = setInterval(nextTip, 7000);

  const off = onNetProgress((p) => {
    last = p;
    setBar(p.frac * scale);
    mbEl.textContent = t('boot.mb', { mb: mb(p.bytes), done: p.done, files: p.files });
    if (p.failed) note.dataset.retry = '1';
  });

  // relógio de travamento: conexão parada mostra o aviso (e some quando volta a baixar)
  const stallTimer = setInterval(() => {
    if (finished) return;
    const idle = performance.now() - (last.lastByteAt || 0);
    const waitingNet = last.done < last.files;
    if (waitingNet && idle > STALL_MS) {
      note.hidden = false;
      note.textContent = t('boot.stall', { s: Math.round(idle / 1000) });
    } else if (note.dataset.retry && waitingNet) {
      note.hidden = false;
      note.textContent = t('boot.retrying');
    } else note.hidden = true;
  }, 1000);

  const stop = () => { finished = true; off(); clearInterval(stallTimer); clearInterval(tipTimer); badge.remove(); };

  return {
    // etapa depois dos downloads (os retratos): a barra vai de 90% a 100%
    setStage(key, k = 0) {
      if (finished) return;
      status.textContent = t(key);
      if (key === 'boot.portraits') { scale = 0.9; setBar(0.9 + 0.1 * k); }
    },
    fail(e) {
      if (finished) return;
      stop();
      window.__bootFail = true;
      console.error(e);
      const msg = String((e && (e.message || e)) || 'erro');
      root.classList.add('failed');
      root.classList.remove('hide');
      cancel.hidden = true;
      note.hidden = true;
      status.textContent = t('boot.failed_title');
      const box = $('.bs-err');
      box.hidden = false;
      box.querySelector('p').textContent = /webgl/i.test(msg) ? t('boot.webgl') : t('boot.failed');
      box.querySelector('code').textContent = msg.slice(0, 300);
      const btn = box.querySelector('button');
      btn.textContent = t('boot.retry');
      btn.onclick = () => location.reload();
      btn.focus();
    },
    // o menu já pode abrir: a tela sai da frente e o selo do canto mostra o resto
    menuReady() {
      if (finished || away) return;
      away = true;
      root.classList.add('hide');
      badge.hidden = false;
    },
    // escolheram um modo antes do fim: a tela volta por cima do menu, com o VOLTAR
    wait() {
      if (finished) return;
      status.textContent = t('boot.wait');
      cancel.textContent = t('boot.cancel');
      cancel.hidden = false;
      root.classList.remove('hide');
      cancel.focus();
    },
    unwait() {
      if (finished) return;
      cancel.hidden = true;
      root.classList.add('hide');
    },
    onCancel(fn) { cancelFn = fn; },
    done() {
      if (finished) return;
      setBar(1);
      cancel.hidden = true;
      status.textContent = t('boot.ready');
      stop();
      root.dataset.done = '1';
      setTimeout(() => root.classList.add('hide'), 250);
      setTimeout(() => root.remove(), 1000);
    },
  };
}
