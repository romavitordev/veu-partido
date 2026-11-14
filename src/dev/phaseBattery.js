// BATERIA DAS FASES (dev, 2026-11-14): a CPU Difícil joga UMA FASE INTEIRA do Outro Lado no lugar do jogador — todas as
// salas da rota sorteada até o chefe — e mede o tempo, o nível em cada sala e no fim, as moedas e quantas vezes a vida
// teve que voltar. Serve para calibrar `route.rooms` e o XP das fases separadas (TODO "Bateria das fases mais longas").
// Não faz parte do jogo: no console do `npm run dev`:
//   const F = await import('/src/dev/phaseBattery.js'); await F.run('estrangeiro', ['cindy', 'joui'], 2); F.summary('estrangeiro')
// Regras da simulação (parecidas com um jogador comum): escolhe a porta com luta (a 1ª), pega o que cai e abre os baús,
// sobe de nível na 1ª carta. A vida volta cheia abaixo de 25% (conta como "quase morreu", não encerra a fase).
// A ABA PRECISA ESTAR NA FRENTE. Os resultados ficam no localStorage (`pve_phase_<fase>`); run() continua de onde parou.
import { newAttempt } from '../pve/save.js';
import { CpuController } from '../ai/CpuController.js';

const keyOf = (dg) => `pve_phase_${dg}`;
const load = (dg) => { try { return JSON.parse(localStorage.getItem(keyOf(dg)) || '{}'); } catch { return {}; } };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const game = () => window.__game;
const SMALL = new Set(['coins', 'xp', 'heal']);

async function start(id, dungeon) {
  const g = game();
  g.pve.data.attempt = newAttempt({ charId: id, team: [], difficulty: 'normal', dungeon });
  g.pve.startDungeon();
  for (let w = 0; w < 300; w++) {
    if (g.state === 'fight' && g.match && g.match.world && g.match.player) break;
    await pause(100);
  }
  const m = g.match;
  for (let i = 0; i < 30 && m.phase === 'intro'; i++) g.step(60);
  return m;
}

function drive(m) {
  const slot = m.input.players[0];
  if (slot.cpu && slot.cpu.f === m.player) return;
  slot.cpu = new CpuController({ level: 'hard' });
  slot.cpu.attach(m.player);
}

const ended = (m) => ['bossDown', 'exit', 'over'].includes(m.phase) || m.rewardTaken;
const open = (m) => m.doors.some((d) => d.exit && !d.locked);

// um passo da simulação com as "mãos" do jogador: cartas, coleta, baús, cenas e gatilhos
function tick(m, S) {
  const g = game();
  const p = m.player;
  g.step(15);
  if (m.pveHud.choice) m.pveHud.pick();
  if (m.bossIntro && m.bossIntro.finish) m.bossIntro.finish();
  if (m.cluesNeeded && m.clues < m.cluesNeeded) m.clues = m.cluesNeeded; // a CPU não procura provas
  if (m.pendingBoss) {
    const M = m.pendingBoss;
    m.pendingBoss = null;
    m.startBoss(M);
  }
  if (p.health < S.last) S.taken += S.last - p.health;
  if (p.health < p.maxHealth * 0.25) { p.health = p.maxHealth; S.saves++; }
  S.last = p.health;
  for (const k of m.pickups) {
    if (!k.alive) continue;
    if (k.open && !k.opened && !k.manualLocked) { try { k.open(p); } catch { /* baú já aberto */ } }
    else if (k.take && SMALL.has(k.kind) && k.t > 0.6) k.take(p);
  }
}

export async function runOne(id, dungeon) {
  const g = game();
  const m = await start(id, dungeon);
  drive(m);
  const p = m.player;
  p.health = p.maxHealth;
  const S = { taken: 0, saves: 0, last: p.health };
  const rec = { rooms: [], routeLen: m.routeLen };
  const t0 = m.stats.time;
  for (let r = 0; r < 30; r++) {
    const rt = m.stats.time;
    const boss = m.mod && m.mod.kind === 'boss';
    const cap = (boss ? 300 : 150) * 60;
    for (let t = 0; t < cap; t += 15) {
      tick(m, S);
      if (boss ? ended(m) : open(m) && !m.transit) break;
      if (t % 300 === 0) await pause(0);
    }
    rec.rooms.push({ id: m.modId, kind: m.mod.kind, s: Math.round(m.stats.time - rt), lvl: m.run.level, mini: Object.keys(m.met || {}).filter((k) => m.met[k]).join(',') });
    if (boss) { rec.bossDown = ended(m); break; }
    if (!open(m)) { rec.stuck = m.modId; break; }
    // a porta: a de luta com menos monstros se a vida está baixa; senão a 1ª com luta; o cadeado não
    const ex = m.exits.filter((e) => !e.padlock);
    const pick = ex.find((e) => e.kind === 'boss') || ex.find((e) => e.kind === 'fight') || ex[0];
    if (!pick) { rec.stuck = m.modId; break; }
    m.startTransit(pick);
    for (let i = 0; i < 200 && m.transit; i++) g.step(5);
    drive(m);
  }
  Object.assign(rec, {
    s: Math.round(m.stats.time - t0), lvl: m.run.level, coins: m.stats.coins, chests: m.stats.chests, kills: m.stats.kills,
    taken: Math.round((S.taken / p.maxHealth) * 100), saves: S.saves, met: Object.keys(m.met || {}).filter((k) => m.met[k]),
  });
  const gm = game().match;
  if (gm && gm.input) gm.input.players[0].cpu = null;
  return rec;
}

export async function run(dungeon, ids, samples = 2) {
  for (const id of ids) {
    for (let k = 0; k < samples; k++) {
      if ((load(dungeon)[id] || []).length > k) continue;
      let rec;
      try { rec = await runOne(id, dungeon); } catch (e) { rec = { err: String((e && e.stack) || e).slice(0, 300) }; }
      const all = load(dungeon);
      (all[id] = all[id] || []).push(rec);
      localStorage.setItem(keyOf(dungeon), JSON.stringify(all));
    }
  }
  return summary(dungeon);
}

export function summary(dungeon) {
  const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / Math.max(1, a.length));
  return Object.entries(load(dungeon)).map(([id, rs]) => {
    const ok = rs.filter((r) => !r.err);
    return `${id}: ${avg(ok.map((r) => r.s))}s, ${avg(ok.map((r) => r.rooms.length))} salas, nível ${avg(ok.map((r) => r.lvl))}`
      + ` (no chefe ${avg(ok.map((r) => (r.rooms[r.rooms.length - 1] || {}).lvl || 0))}), ${avg(ok.map((r) => r.coins))} moedas,`
      + ` dano ${avg(ok.map((r) => r.taken))}%, salvo ${avg(ok.map((r) => r.saves))}×, chefe caiu ${ok.filter((r) => r.bossDown).length}/${ok.length}`
      + `${ok.some((r) => r.stuck) ? ` | TRAVOU ${ok.filter((r) => r.stuck).map((r) => r.stuck).join(',')}` : ''}${rs.length - ok.length ? ` | ERROS ${rs.length - ok.length}` : ''}`;
  }).join('\n');
}

export function clear(dungeon) { localStorage.removeItem(keyOf(dungeon)); }
