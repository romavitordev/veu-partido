// PARTIDA DE TESTE DO SAMHAIN (dev): a fase inteira com a CPU lutando e um "jogador" roteirizado fazendo o que uma
// pessoa faria — reacende as lamparinas fracas e seguras na vila, vai atrás das brasas no corredor e usa os itens da
// Vigília na Árvore (combustível na frente do alçapão, tocha na poça, lanterna acesa no fogo e arremessada em 2+).
// Não faz parte do jogo: no console do `npm run dev`:
//   const P = await import('/src/dev/samhainPlay.js'); const t = await P.start('normal'); await t.run(300); t.status()
import { newAttempt } from '../pve/save.js';
import { CpuController } from '../ai/CpuController.js';

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

export async function start(diff = 'normal', char = 'joui') {
  const g = window.__game;
  g.pve.data.attempt = newAttempt({ charId: char, team: [], difficulty: diff, dungeon: 'samhain' });
  g.pve.startDungeon();
  for (let w = 0; w < 250; w++) {
    if (g.screen && g.screen.ready && g.screen.go) { g.screen.readyAt = 0; g.screen.go(); }
    if (g.state === 'fight' && g.match && g.match.world && g.match.player && g.match.phase) break;
    await pause(100);
  }
  await pause(400);
  const m = g.match;
  const slot = m.input.players[0];
  slot.cpu = new CpuController({ level: 'hard' });
  slot.cpu.attach(m.player);
  const S = { s: 0, part: 'vila', log: [], ev: [], relSeen: 0, relTaken: 0, runDmg: 0, fireDmg: 0, fireT: 0, downs: 0, minDoor: 1, hpRun0: null, wv: '', relit: 0, fireOn: null };
  const p = () => m.player;
  const ev = (t) => S.ev.push(`${S.s}s ${t}`);
  const foes = () => (m.copias || []).filter((c) => c.alive && c.state !== 'die');
  const walk = (x, z, sp = 6.5) => { const dx = x - p().pos.x, dz = z - p().pos.z, d = Math.hypot(dx, dz); if (d < 0.05) return 0; const k = Math.min(1, sp / 60 / d); p().pos.x += dx * k; p().pos.z += dz * k; return d; };

  function tick() {
    const now = m.tree ? 'arvore' : m.runner ? 'corredor' : 'vila';
    if (now !== S.part) {
      S.log.push(`${S.part} até ${S.s}s (nível ${m.run.level}, guardados ${m.pendingUps || 0}, vida ${Math.round(100 * p().health / p().maxHealth)}%)`);
      S.part = now;
      if (now === 'corredor') S.hpRun0 = p().health;
      S.wv = '';
    }
    const V = m.village;
    if (V && !m.runner && !m.tree) {
      const w = `${m.waves ? m.waves.n : ''}`;
      if (w !== S.wv) { S.wv = w; ev(`vila onda ${w}: aldeões ${V.alive}/${V.total}`); }
      const F = foes();
      const safe = (h) => !F.some((c) => Math.hypot(c.pos.x - h.pos.x, c.pos.z - h.pos.z) < 5);
      const h = V.houses.filter((x) => x.alive && x.hp < x.maxHp * (F.length ? 0.45 : 0.95) && safe(x)).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (h && walk(h.pos.x, h.pos.z) < 1.5) S.relit++;
    }
    if (m.runner && !m.runner.done) {
      const R = m.runner;
      const P = R.local(p().pos);
      const r = R.relics.filter((x) => !x.gone && x.v > P.v - 0.5 && x.v < P.v + 9).sort((a, b) => a.v - b.v)[0];
      if (r) {
        if (!r.seen) { r.seen = true; S.relSeen++; }
        const du = Math.max(-0.06, Math.min(0.06, r.u - P.u));
        p().pos.x += R.R.x * du; p().pos.z += R.R.z * du;
      }
      if (S.hpRun0 != null && p().health < S.hpRun0) S.runDmg += S.hpRun0 - p().health;
      S.hpRun0 = p().health;
      S.relTaken = R.relicsTaken;
    }
    const I = m.items;
    if (I && m.tree) {
      const door = m.tree.door.pos || { x: 0, z: 0 };
      const held = I.items.find((it) => it.holder === p());
      if (!held) {
        const ground = I.items.find((it) => !it.holder && !it.flying);
        if (ground) { if (!ground.seenPt) { ground.seenPt = 1; ev(`${ground.kind} no chão`); } walk(ground.g.position.x, ground.g.position.z, 8); }
      } else if (held.kind === 'oil') {
        if (walk(door.x, door.z + 2, 8) < 0.5) { p().yaw = 0; p().aimYaw = 0; I.throwItem(held, p()); ev('combustível derramado'); }
      } else if (held.kind === 'torch') {
        const pool = I.pools[0];
        if (pool) walk(pool.x, pool.z, 8); else { I.throwItem(held, p()); ev('tocha sem poça'); }
      } else if (held.kind === 'lantern') {
        const f = I.fires[0];
        if (!held.lit && f) walk(f.x, f.z, 8);
        else if (held.lit) {
          const near = foes().filter((z) => Math.hypot(z.pos.x - p().pos.x, z.pos.z - p().pos.z) < 11).length;
          if (near >= 2) { I.throwItem(held, p()); ev(`lanterna arremessada (${near} perto)`); }
        }
      }
      if (I.fires.length && S.fireOn == null) { S.fireOn = S.s; ev('fogo aceso'); }
      if (!I.fires.length && S.fireOn != null) { ev(`fogo apagou (durou ${S.s - S.fireOn}s)`); S.fireOn = null; }
      if (I.fires.length) S.fireT++;
      S.minDoor = Math.min(S.minDoor, m.tree.door.hp / m.tree.door.maxHp);
      const w = `${m.waves.n}`;
      if (w !== S.wv) { S.wv = w; ev(`árvore onda ${w}: porta ${Math.round(100 * m.tree.door.hp / m.tree.door.maxHp)}%`); }
    }
    if (m.choosing && m.pick) { try { m.pick(0); } catch { /* sem escolha */ } }
    if (p().health < p().maxHealth * 0.08) { S.downs++; ev(`caiu (${S.part})`); p().health = p().maxHealth; }
  }

  async function run(secs) {
    for (let i = 0; i < secs && m.phase !== 'dead' && !(m.phase === 'bossDown' && m.tree); i++) {
      const I = m.items;
      const before = I && I.fires.length ? foes().map((z) => [z, z.hp ?? z.health]) : null;
      for (let f = 0; f < 60; f++) { g.step(1); tick(); }
      S.s++;
      if (before) {
        const f = I.fires[0];
        for (const [z, h0] of before) if (f && Math.hypot(z.pos.x - f.x, z.pos.z - f.z) < f.R + 1.5) S.fireDmg += Math.max(0, h0 - (z.hp ?? z.health));
      }
    }
    return status();
  }

  function status() {
    const door = m.tree ? Math.round(100 * m.tree.door.hp / m.tree.door.maxHp) : '-';
    return { s: S.s, part: S.part, phase: m.phase, wave: m.waves ? `${m.waves.n}/${m.waves.total}` : '-', level: m.run.level, pend: m.pendingUps,
      hp: Math.round(100 * p().health / p().maxHealth), vivos: m.village ? m.village.alive : '-', door, minDoor: Math.round(S.minDoor * 100),
      downs: S.downs, relSeen: S.relSeen, relTaken: S.relTaken, runDmg: Math.round(S.runDmg), fireDmg: Math.round(S.fireDmg), fireT: S.fireT,
      relit: S.relit, lamps: m.run.samhainLamps, log: S.log, ev: S.ev.slice(-18) };
  }
  return { run, status, m, S };
}
