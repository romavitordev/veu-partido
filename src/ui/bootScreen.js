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
  let shown = 0; // valor mostrado (corre atrás do alvo, ver tick)
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

  // PORCENTAGEM GRADUAL (pedido do dono, 2026-11-21): o progresso real vira o ALVO e o número mostrado corre atrás
  // dele quadro a quadro (nunca pula de 12% para 60%). Anel, rasgo do emblema, rachadura do título, barra e selo leem
  // o mesmo valor (--p). O 100% só aparece quando o número chega lá de verdade — aí vem o momento "PRONTO!".
  let target = 0;
  let onFull = null; // done() espera o número chegar a 100% antes de mostrar o fim
  let raf = 0;
  let prev = performance.now();
  const paint = () => {
    const v = Math.floor(shown * 100);
    fill.style.width = `${(shown * 100).toFixed(2)}%`;
    root.style.setProperty('--p', shown.toFixed(4));
    pct.textContent = `${v}%`;
    badge.style.setProperty('--p', shown.toFixed(4));
    if (!badge.classList.contains('done')) badgeTxt.textContent = t('boot.badge', { pct: v });
  };
  const tick = (now) => {
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    const gap = target - shown;
    // persegue o alvo: rápido quando está longe, com um passo mínimo para não ficar se arrastando no fim
    if (gap > 0) shown = Math.min(target, shown + Math.max(gap * Math.min(1, dt * 4), dt * 0.12));
    paint();
    if (shown >= 1 && onFull) { const f = onFull; onFull = null; f(); }
    raf = (shown < target || onFull) ? requestAnimationFrame(tick) : 0;
  };
  const setBar = (k) => {
    target = Math.max(target, Math.min(1, k)); // a barra só anda para frente (uma nova tentativa aumenta o total)
    if (!raf) { prev = performance.now(); raf = requestAnimationFrame(tick); }
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

  const stop = () => { finished = true; off(); clearInterval(stallTimer); clearInterval(tipTimer); };

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
      badge.remove();
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
      stop();
      cancel.hidden = true;
      root.dataset.done = '1';
      setBar(1);
      // espera o número chegar a 100% e então marca o fim: brilho, anel completo, "PRONTO!" — e só depois some
      onFull = () => {
        status.textContent = t('boot.ready');
        root.classList.add('complete');
        badge.classList.add('done');
        badgeTxt.textContent = t('boot.ready');
        setTimeout(() => badge.classList.add('out'), 1500);
        setTimeout(() => badge.remove(), 2100);
        setTimeout(() => root.classList.add('hide'), away && root.classList.contains('hide') ? 0 : 1300);
        setTimeout(() => root.remove(), 2100);
      };
      if (!raf) raf = requestAnimationFrame(tick);
    },
  };
}
