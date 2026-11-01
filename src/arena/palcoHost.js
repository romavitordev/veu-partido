// O PALCO DO ANFITRIÃO (2026-11-01): o que só acontece neste mapa, ligado pelo Match quando o cenário é 'palco'.
//  - O NARRADOR: o Anfitrião comenta a luta (primeiro sangue, golpe forte, combo, especial, transformação, quase-K.O.,
//    K.O.) na faixa de legenda, sem repetir a fala seguida e sem atropelar as falas dos lutadores.
//  - A PLATEIA de Anfitriões (CROWD_* do cenário) pula mais com o que acontece e fica parada na tensão do quase-K.O.
//  - Os EVENTOS: de tempos em tempos ele anuncia uma regra nova, igual para os dois (mais rápidos, tudo dói mais, só golpe
//    físico, sanidade de presente). O sorteio usa Math.random, que na partida em rede é o da simulação (main.js).
import { PALCO_LINES as L } from '../config/palcoLines.js';
import { CHARACTER_NAMES } from '../config/dialogues.js';

const NAME = 'O ANFITRIÃO';
const COLOR = '#b48cff';
const EVENT_EVERY = [24, 34]; // s entre um evento e outro
const EVENT_TIME = 7;

export class PalcoHost {
  constructor(match) {
    this.match = match;
    this.world = match.world;
    this.arena = this.world.arena;
    this.last = new Map();
    this.lineLeft = 0;
    this.nextLineAt = 0;
    this.roundStarted = false;
    this.firstBlood = false;
    this.combo = { by: null, n: 0, at: -9 };
    this.critical = new Set();
    this.eventAt = this.rand(...EVENT_EVERY);
    this.eventEnd = 0;
    const w = this.world;
    const prevHit = w.onHit;
    w.onHit = (a, v, dealt, o) => { prevHit && prevHit(a, v, dealt, o); this.onHit(a, v, dealt, o || {}); };
    const prevKO = w.onKO;
    w.onKO = (...args) => { prevKO && prevKO(...args); this.onKO(); };
    const prevTr = w.onTransform;
    w.onTransform = (f) => { prevTr && prevTr(f); this.say('transform', f, f.opponent, true); this.cheer(1); };
    const prevDl = w.onBattleDialogue;
    w.onBattleDialogue = (f, ev) => {
      if (ev === 'special') { this.say('special', f, f.opponent, true); this.cheer(1); }
      return prevDl && prevDl(f, ev);
    };
  }

  rand(a, b) { return a + Math.random() * (b - a); }

  cheer(level, time = 2.5) { this.arena.cheer && this.arena.cheer(level, time); }

  // uma fala da lista (nunca a mesma da última vez naquela lista)
  pick(list) {
    if (list.length < 2) return list[0];
    let k = Math.floor(Math.random() * list.length);
    if (list[k] === this.last.get(list)) k = (k + 1) % list.length;
    this.last.set(list, list[k]);
    return list[k];
  }

  say(key, a, b, force = false) {
    const m = this.match;
    const now = this.world.time;
    if (m.battleDialogue || (!force && now < this.nextLineAt)) return;
    const list = typeof key === 'string' ? L[key] : key;
    const nm = (f) => (f ? CHARACTER_NAMES[f.def.id] || f.def.name : '');
    const text = this.pick(list).replace(/\{a\}/g, nm(a)).replace(/\{b\}/g, nm(b));
    m.hud.subtitle({ name: NAME, color: COLOR, text, side: 0 });
    this.lineLeft = Math.min(3.2, 1.4 + text.length * 0.03);
    this.nextLineAt = now + 7;
  }

  onHit(a, v, dealt, o) {
    if (!a || !v || a === v || o.blocked || !(dealt > 0) || this.match.phase !== 'fight') return;
    const t = this.world.time;
    if (!this.firstBlood) {
      this.firstBlood = true;
      this.say('first', a, v, true);
      this.cheer(0.8);
    }
    const c = this.combo;
    if (c.by === a && t - c.at < 1.1) c.n++;
    else { c.by = a; c.n = 1; }
    c.at = t;
    if (c.n === 6) { this.say('combo', a, v); this.cheer(0.9); }
    if (dealt >= 70) { this.say('big', a, v); this.cheer(Math.min(1, dealt / 120)); }
    else this.cheer(0.25, 0.8);
  }

  onKO() {
    const [f0, f1] = this.world.fighters;
    const loser = f0.state === 'ko' ? f0 : f1;
    this.say('ko', loser.opponent, loser, true);
    this.cheer(1, 4);
    this.world.audio.play('applause', { volume: 0.7 });
  }

  // regra nova: anúncio e o efeito igual para os dois lutadores
  startEvent() {
    const kinds = ['haste', 'pain', 'melee', 'energy'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    this.say(L.event[kind], null, null, true);
    this.world.showBanner(kind === 'haste' ? 'Regra nova: mais rápido' : kind === 'pain' ? 'Regra nova: tudo dói mais' : kind === 'melee' ? 'Regra nova: só golpe físico' : 'Intervalo comercial', 0xb48cff);
    this.cheer(0.8);
    for (const f of this.world.fighters) {
      if (f.state === 'ko') continue;
      if (kind === 'energy') f.addEnergy(f.maxEnergy * 0.3);
      else {
        const b = { type: 'palcoRule', name: 'REGRA DO ANFITRIÃO', time: EVENT_TIME, duration: EVENT_TIME };
        if (kind === 'haste') b.speedMult = 1.25;
        if (kind === 'pain') b.takenMult = 1.25;
        if (kind === 'melee') { b.meleeOnly = true; b.lockMsg = 'REGRA DO ANFITRIÃO: SÓ GOLPE FÍSICO'; }
        f.addBuff(b);
      }
    }
    this.eventEnd = this.world.time + EVENT_TIME;
  }

  // chamado pelo Match a cada passo da luta
  update(dt) {
    const m = this.match;
    if (this.lineLeft > 0) {
      this.lineLeft -= dt;
      if (this.lineLeft <= 0 && !m.battleDialogue) m.hud.subtitle(null);
    }
    if (m.phase !== 'fight') { this.roundStarted = false; return; }
    if (!this.roundStarted) {
      this.roundStarted = true;
      this.firstBlood = false;
      this.critical.clear();
      this.eventAt = this.world.time + this.rand(...EVENT_EVERY);
      if (m.round === 1) this.say('start', null, null, true);
      else {
        // a partir do 2º round: provoca um dos dois (quem tem ligação com ele no cânone primeiro)
        const fs = this.world.fighters;
        const f = fs.find((x) => L.tease[x.def.id]) || fs[Math.floor(Math.random() * fs.length)];
        this.say(L.tease[f.def.id] || L.tease.any, f, f.opponent, true);
      }
    }
    for (const f of this.world.fighters) {
      if (f.state !== 'ko' && f.health / f.maxHealth < 0.2 && !this.critical.has(f)) {
        this.critical.add(f);
        this.say('critical', f.opponent, f);
        this.cheer(0, 3); // a plateia prende a respiração
      }
    }
    if (!m.training && !this.world.cinematic && this.world.time >= this.eventAt) {
      this.startEvent();
      this.eventAt = this.world.time + this.rand(...EVENT_EVERY);
    }
  }
}
