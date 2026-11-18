// DOWNLOAD DOS ARQUIVOS GRANDES (.glb dos lutadores, cenários e invocações) — pedido do dono, 2026-11-18: no PC de um
// amigo o jogo ficou MINUTOS em "PREPARANDO AS LUTAS…" sem abrir o menu. Antes os ~95 .glb (~62 MB) eram pedidos
// todos de uma vez, sem tempo limite e sem progresso: um download parado segurava o jogo para sempre e, numa conexão
// lenta, a tela parecia travada. Agora:
//  - FILA: no máximo MAX_ACTIVE downloads ao mesmo tempo (o navegador já faria isso por baixo, mas aí o relógio do
//    tempo limite contaria a espera na fila do navegador);
//  - TEMPO LIMITE: sem receber NENHUM byte por IDLE_MS, o download é cancelado (quem chamou tenta de novo);
//  - PROGRESSO: arquivos prontos, bytes baixados e a fração de cada arquivo em andamento, para a tela de carregamento.
const MAX_ACTIVE = 6;
const IDLE_MS = 30000;

const stats = { files: 0, done: 0, failed: 0, bytes: 0, lastByteAt: 0 };
const partial = new Map(); // id → fração (0..1) dos arquivos em andamento
const listeners = new Set();
let queue = [];
let active = 0;
let nextId = 1;

const emit = () => { for (const fn of listeners) fn(netProgress()); };

// fração total: arquivos prontos + o pedaço dos que estão baixando (os da fila contam 0)
export function netProgress() {
  let part = 0;
  for (const f of partial.values()) part += f;
  const frac = stats.files ? Math.min(1, (stats.done + part) / stats.files) : 0;
  return { ...stats, frac };
}

export function onNetProgress(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function pump() {
  while (active < MAX_ACTIVE && queue.length) {
    const job = queue.shift();
    active++;
    job.run().finally(() => { active--; pump(); });
  }
}

// teste (só no `npm run dev`): ?slownet=MS atrasa cada download, para ver o menu abrindo antes do fim
const SLOW = import.meta.env && import.meta.env.DEV && typeof location !== 'undefined' ? Number(new URLSearchParams(location.search).get('slownet')) || 0 : 0;

async function download(url, id) {
  if (SLOW) await new Promise((r) => setTimeout(r, SLOW));
  const ctrl = new AbortController();
  let timer = 0;
  const arm = () => { clearTimeout(timer); timer = setTimeout(() => ctrl.abort(new Error(`sem resposta por ${IDLE_MS / 1000} s: ${url}`)), IDLE_MS); };
  arm();
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    const total = Number(res.headers.get('content-length')) || 0;
    // sem leitura em pedaços (navegador antigo): baixa inteiro, ainda com o tempo limite
    if (!res.body || !res.body.getReader) {
      const buf = await res.arrayBuffer();
      stats.bytes += buf.byteLength;
      stats.lastByteAt = performance.now();
      return buf;
    }
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0;
    for (;;) {
      arm();
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      got += value.byteLength;
      stats.bytes += value.byteLength;
      stats.lastByteAt = performance.now();
      // tamanho desconhecido (resposta comprimida pelo servidor): só marca que andou
      partial.set(id, total ? Math.min(0.99, got / total) : 0.5);
      emit();
    }
    const out = new Uint8Array(got);
    let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.byteLength; }
    return out.buffer;
  } finally {
    clearTimeout(timer);
  }
}

// baixa um arquivo pela fila; devolve um ArrayBuffer. Cada chamada conta como 1 arquivo no progresso (a nova
// tentativa de um que falhou entra de novo na conta e a falha sai).
export function fetchBuffer(url) {
  const id = nextId++;
  stats.files++;
  emit();
  return new Promise((resolve, reject) => {
    queue.push({
      run: () => download(url, id).then(
        (buf) => { partial.delete(id); stats.done++; emit(); resolve(buf); },
        (e) => { partial.delete(id); stats.files--; stats.failed++; emit(); reject(e); },
      ),
    });
    pump();
  });
}

// só para os testes
export function _resetNetStats() {
  Object.assign(stats, { files: 0, done: 0, failed: 0, bytes: 0, lastByteAt: 0 });
  partial.clear();
  queue = [];
  active = 0;
}
