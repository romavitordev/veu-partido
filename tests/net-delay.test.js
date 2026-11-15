import test from 'node:test';
import assert from 'node:assert/strict';
import { NetSession, targetDelay, DELAY, DELAY_MIN, DELAY_MAX } from '../src/net/NetSession.js';

test('targetDelay: rede local no mínimo, ping alto mais quadros, limitado ao máximo', () => {
  assert.equal(targetDelay(4, 0), DELAY_MIN);
  assert.equal(targetDelay(60, 4), 3);
  assert.equal(targetDelay(120, 10), 6);
  assert.equal(targetDelay(1000, 50), DELAY_MAX);
});

test('onRtt: sobe na hora quando o ping piora e desce aos poucos quando melhora', () => {
  const s = new NetSession('host');
  assert.equal(s.delay, DELAY);
  s.onRtt(200, 0);
  assert.ok(s.delay >= 7, `delay ${s.delay}`);
  const high = s.delay;
  // ping bom de novo: não desce antes de 3 s
  let t = 0;
  for (; t < 2500; t += 500) s.onRtt(5, t);
  assert.ok(s.delay >= high - 1);
  for (; t < 60000; t += 500) s.onRtt(5, t);
  assert.equal(s.delay, DELAY_MIN);
});

test('fill: com o atraso maior registra quadros novos; com menor, espera alcançar', () => {
  const s = new NetSession('host');
  const sent = [];
  s.link = { send: (m) => sent.push(m) };
  s.delay = 3;
  s.fill(() => 'a');
  assert.equal(s.localNext, 3);
  s.delay = 6;
  s.fill(() => 'b');
  assert.equal(s.localNext, 6);
  assert.deepEqual([...s.local.values()], ['a', 'a', 'a', 'b', 'b', 'b']);
  s.delay = 2;
  s.fill(() => 'c');
  assert.equal(s.localNext, 6); // nada novo: os quadros já enviados continuam valendo
});

// Dois computadores simulados, com latência e variação, um relógio de 1 ms. Conta quantas vezes cada lado PAROU
// esperando o comando do outro (o "engasgo" do lockstep).
function simulate({ oneWay, jitter, seconds, adaptive, startSkew = 0 }) {
  let now = 0;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const queue = [];
  const peers = [new NetSession('host'), new NetSession('guest')];
  peers.forEach((p, i) => {
    const other = () => peers[1 - i];
    p.link = { send: (m) => queue.push({ at: now + oneWay + rnd() * jitter, to: other(), m: JSON.parse(JSON.stringify(m)) }) };
  });
  const origNow = performance.now;
  performance.now = () => now;
  const stalls = [0, 0];
  const frames = [0, 0];
  const step = 1000 / 60;
  try {
    peers[1].acc = -startSkew / 1000; // o convidado começa atrasado
    for (; now < seconds * 1000; now++) {
      for (let k = queue.length - 1; k >= 0; k--) {
        if (queue[k].at <= now) { const q = queue.splice(k, 1)[0]; q.to.onMessage(q.m); }
      }
      if (now % 500 === 0) peers.forEach((p) => p.send({ t: 'ping', k: now, f: p.frame }));
      peers.forEach((p, i) => {
        if (!adaptive) { p.delay = DELAY; p.rtt = null; }
        p.acc = Math.min(p.acc + 0.001 * (adaptive ? p.pace() : 1), 0.2);
        let n = 0;
        while (p.acc >= step / 1000 && n < 6) {
          p.fill(() => 0);
          if (!p.ready()) { stalls[i]++; break; }
          p.take();
          frames[i]++;
          p.acc -= step / 1000;
          n++;
        }
      });
    }
  } finally {
    performance.now = origNow;
  }
  return { stalls, frames, delay: peers.map((p) => p.delay) };
}

test('com ping alto o atraso adaptativo para muito menos que o fixo', () => {
  const fixed = simulate({ oneWay: 70, jitter: 20, seconds: 20, adaptive: false });
  const adapt = simulate({ oneWay: 70, jitter: 20, seconds: 20, adaptive: true });
  const sum = (a) => a[0] + a[1];
  assert.ok(sum(adapt.stalls) < sum(fixed.stalls) / 4, `adaptativo ${sum(adapt.stalls)} × fixo ${sum(fixed.stalls)}`);
  assert.ok(adapt.delay.every((d) => d >= 5 && d <= 8), `atraso ${adapt.delay}`);
});

test('na rede local o atraso desce para o mínimo e o jogo não para', () => {
  const r = simulate({ oneWay: 2, jitter: 1, seconds: 20, adaptive: true });
  assert.deepEqual(r.delay, [DELAY_MIN, DELAY_MIN]);
  assert.ok(r.frames[0] > 60 * 19, `quadros ${r.frames[0]}`);
});

test('sincronia: quem começou na frente desacelera e os dois ficam juntos', () => {
  const r = simulate({ oneWay: 40, jitter: 5, seconds: 20, adaptive: true, startSkew: 300 });
  assert.ok(Math.abs(r.frames[0] - r.frames[1]) <= r.delay[0] + r.delay[1] + 2, `quadros ${r.frames}`);
});
