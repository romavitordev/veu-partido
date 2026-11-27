// MÚSICA POR CAMADAS (TODO, item 3 das melhorias das skills; o dono escolheu em 2026-11-26: "composta por código").
// Uma trilha só, original, tocada pelo WebAudio (sem arquivo). Ela não troca de faixa: são CAMADAS que entram e saem
// suaves conforme a tensão do Outro Lado —
//   explore  o ZUMBIDO grave (drone com o vento) e um SINO esparso, como uma casa vazia;
//   fight    entra o PULSO do baixo (colcheias) e a PERCUSSÃO; o sino quase some;
//   boss     tudo junto + os ACORDES do chefe (o trítono no começo de cada compasso) e o chimbal em semicolcheias;
//   quiet    só um resto do zumbido (morte, saída).
// Durante falas, especiais e a apresentação do chefe a música ABAIXA (~ −8 dB, "ducking") e volta depois.
// Harmonia: Ré menor, com a segunda menor (Mi♭, frígio) para a tensão. Progressão de 4 compassos: Ré · Ré · Si♭ · Lá.
// Agendamento com antecedência (o relógio do AudioContext, não o setInterval), como o "A Tale of Two Clocks".

const BPM = 92;
const STEP = 60 / BPM / 4; // semicolcheia (s)
const AHEAD = 0.12; // agenda o que cai nos próximos 120 ms
const ROOTS = [38, 38, 34, 33]; // notas MIDI (Ré2, Ré2, Si♭1, Lá1) — um por compasso
const SCALE = [0, 1, 3, 5, 7, 8, 10]; // Ré frígio (o sino escolhe daqui)
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// quanto de cada camada em cada nível (0..1)
const MIX = {
  quiet: { drone: 0.35, bell: 0, pulse: 0, perc: 0, boss: 0 },
  explore: { drone: 1, bell: 0.8, pulse: 0, perc: 0, boss: 0 },
  fight: { drone: 0.75, bell: 0.25, pulse: 0.9, perc: 0.8, boss: 0 },
  boss: { drone: 0.9, bell: 0, pulse: 1, perc: 1, boss: 1 },
};
export const MUSIC_LEVELS = Object.keys(MIX);
const BASE = 0.32; // a música fica embaixo dos efeitos da luta
const DUCK = 0.4; // ≈ −8 dB durante falas e especiais

export class Music {
  constructor(audio) {
    this.audio = audio;
    this.on = false;
    this.level = 'explore';
    this.ducked = false;
    this.step = 0;
  }

  get ctx() { return this.audio.ctx; }

  // começa a tocar (se o áudio já foi liberado pelo primeiro toque); pode ser chamada de novo sem efeito
  start(level = 'explore') {
    this.level = MIX[level] ? level : 'explore';
    if (this.on || !this.ctx || !this.audio.buses || !this.audio.buses.music) return;
    const ctx = this.ctx;
    this.on = true;
    this.out = ctx.createGain(); // o duck + entrada/saída
    this.out.gain.value = 0;
    this.out.gain.setTargetAtTime(BASE, ctx.currentTime, 1.2);
    this.out.connect(this.audio.buses.music);
    this.layers = {};
    for (const k of Object.keys(MIX.explore)) {
      const g = ctx.createGain();
      g.gain.value = MIX[this.level][k];
      g.connect(this.out);
      this.layers[k] = g;
    }
    // eco do sino (atraso com realimentação, abafado)
    this.delay = ctx.createDelay(1.5);
    this.delay.delayTime.value = STEP * 6;
    const fb = ctx.createGain();
    fb.gain.value = 0.38;
    const damp = ctx.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = 2200;
    this.delay.connect(damp).connect(fb).connect(this.delay);
    damp.connect(this.layers.bell);
    this.startDrone();
    this.next = ctx.currentTime + 0.1;
    this.step = 0;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  // o nível de tensão (quiet/explore/fight/boss) e se é para abaixar (falas, especiais) — chamada todo quadro
  update(level, duck = false) {
    if (!this.on) { if (this.wanted) this.start(level); return; }
    if (MIX[level] && level !== this.level) {
      this.level = level;
      const t = this.ctx.currentTime;
      for (const [k, g] of Object.entries(this.layers)) g.gain.setTargetAtTime(MIX[level][k], t, level === 'boss' ? 0.6 : 1.4);
    }
    if (!!duck !== this.ducked) {
      this.ducked = !!duck;
      this.out.gain.setTargetAtTime(BASE * (duck ? DUCK : 1), this.ctx.currentTime, duck ? 0.25 : 0.9);
    }
  }

  // pede a música (toca assim que o áudio existir)
  want(level = 'explore') {
    this.wanted = true;
    this.start(level);
  }

  stop() {
    this.wanted = false;
    if (!this.on) return;
    this.on = false;
    clearInterval(this.timer);
    const ctx = this.ctx;
    const out = this.out;
    const drone = this.drone;
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    setTimeout(() => { for (const n of drone) { try { n.stop(); } catch { /* já parou */ } } out.disconnect(); }, 3000);
  }

  // ------------------------------------------------------------------ o ZUMBIDO (contínuo)
  startDrone() {
    const ctx = this.ctx;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 260;
    lp.Q.value = 3;
    const lfo = ctx.createOscillator(); // o filtro "respira" bem devagar
    lfo.frequency.value = 0.07;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 130;
    lfo.connect(lfoAmt).connect(lp.frequency);
    const g = ctx.createGain();
    g.gain.value = 0.5;
    lp.connect(g).connect(this.layers.drone);
    const root = hz(ROOTS[0] - 12);
    const a = ctx.createOscillator(); a.type = 'sawtooth'; a.frequency.value = root; a.detune.value = -7;
    const b = ctx.createOscillator(); b.type = 'sawtooth'; b.frequency.value = root * 1.5; b.detune.value = 6; // a quinta
    const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = root;
    const subG = ctx.createGain(); subG.gain.value = 0.9;
    a.connect(lp); b.connect(lp); sub.connect(subG).connect(g);
    // o vento: ruído num passa-banda que passeia
    const noise = ctx.createBufferSource();
    noise.buffer = this.audio.noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 600;
    bp.Q.value = 0.8;
    const wl = ctx.createOscillator(); wl.frequency.value = 0.05;
    const wlAmt = ctx.createGain(); wlAmt.gain.value = 350;
    wl.connect(wlAmt).connect(bp.frequency);
    const wg = ctx.createGain(); wg.gain.value = 0.12;
    noise.connect(bp).connect(wg).connect(this.layers.drone);
    this.droneOsc = [a, b, sub];
    this.drone = [a, b, sub, lfo, noise, wl];
    for (const n of this.drone) n.start();
  }

  // ------------------------------------------------------------------ o agendador
  schedule() {
    const ctx = this.ctx;
    if (!ctx || !this.on) return;
    // aba em segundo plano (o setInterval atrasa): pula o que ficou para trás em vez de tocar tudo de uma vez
    if (this.next < ctx.currentTime - 0.2) this.next = ctx.currentTime + 0.05;
    while (this.next < ctx.currentTime + AHEAD) {
      this.playStep(this.step, this.next);
      this.next += STEP;
      this.step = (this.step + 1) % 64;
    }
  }

  playStep(s, t) {
    const bar = Math.floor(s / 16);
    const i = s % 16;
    const root = ROOTS[bar];
    const L = MIX[this.level];
    // a raiz do zumbido acompanha a progressão
    if (i === 0) {
      const f = hz(root - 12);
      const [a, b, sub] = this.droneOsc;
      a.frequency.setTargetAtTime(f, t, 0.4);
      b.frequency.setTargetAtTime(f * 1.5, t, 0.4);
      sub.frequency.setTargetAtTime(f, t, 0.4);
    }
    if (L.bell > 0.01 && i % 8 === 0 && Math.random() < 0.4) this.bell(root + 24 + SCALE[Math.floor(Math.random() * SCALE.length)], t);
    if (L.pulse > 0.01 && i % 2 === 0) {
      const PAT = [0, 0, 0, 1, 0, 0, 3, 1]; // a segunda menor e a terça puxam para a tensão
      this.bass(root + PAT[i / 2], t, i === 0 ? 1 : 0.7);
    }
    if (L.perc > 0.01) {
      if (i === 0 || i === 8 || (i === 11 && bar % 2 === 1)) this.kick(t);
      if (i === 4 || i === 12) this.snare(t);
      if (this.level === 'boss' ? true : i % 2 === 0) this.hat(t, i % 4 === 2 ? 0.5 : 0.28);
    }
    if (L.boss > 0.01) {
      if (i === 0) this.stab(root + 12, t);
      if (i === 8 && bar % 2 === 1) this.stab(root + 18, t, 0.6); // o trítono
    }
  }

  // ------------------------------------------------------------------ os instrumentos (um nó por nota, some sozinho)
  env(g, t, peak, a, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  bell(m, t) {
    const ctx = this.ctx;
    const f = hz(m);
    const g = ctx.createGain();
    this.env(g, t, 0.22, 0.005, 2.6);
    for (const [mul, amp] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) { // parciais de sino (inarmônicas)
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * mul;
      const og = ctx.createGain();
      og.gain.value = amp;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 2.8);
    }
    g.connect(this.layers.bell);
    g.connect(this.delay);
  }

  bass(m, t, vel) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = hz(m);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 6;
    lp.frequency.setValueAtTime(900 * vel, t);
    lp.frequency.exponentialRampToValueAtTime(160, t + 0.16);
    const g = ctx.createGain();
    this.env(g, t, 0.5 * vel, 0.004, 0.22);
    o.connect(lp).connect(g).connect(this.layers.pulse);
    o.start(t);
    o.stop(t + 0.3);
  }

  kick(t) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.14);
    const g = ctx.createGain();
    this.env(g, t, 0.9, 0.002, 0.3);
    o.connect(g).connect(this.layers.perc);
    o.start(t);
    o.stop(t + 0.35);
  }

  noise(t, dur, type, freq, q, peak, dest) {
    const ctx = this.ctx;
    const n = ctx.createBufferSource();
    n.buffer = this.audio.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    this.env(g, t, peak, 0.002, dur);
    n.connect(f).connect(g).connect(dest);
    n.start(t, Math.random() * 1.2);
    n.stop(t + dur + 0.05);
  }

  snare(t) {
    this.noise(t, 0.16, 'bandpass', 1700, 0.9, 0.35, this.layers.perc);
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(190, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.08);
    const g = this.ctx.createGain();
    this.env(g, t, 0.25, 0.002, 0.1);
    o.connect(g).connect(this.layers.perc);
    o.start(t);
    o.stop(t + 0.15);
  }

  hat(t, peak) { this.noise(t, 0.04, 'highpass', 7500, 0.7, 0.12 * peak, this.layers.perc); }

  stab(m, t, vel = 1) {
    const ctx = this.ctx;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1600, t);
    lp.frequency.exponentialRampToValueAtTime(300, t + 0.7);
    const g = ctx.createGain();
    this.env(g, t, 0.28 * vel, 0.01, 0.9);
    lp.connect(g).connect(this.layers.boss);
    for (const [dm, det] of [[0, -9], [0, 9], [6, 0], [12, 4]]) { // raiz dobrada, o trítono e a oitava
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = hz(m + dm);
      o.detune.value = det;
      o.connect(lp);
      o.start(t);
      o.stop(t + 1);
    }
  }
}
