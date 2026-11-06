// BATERIA DO OUTRO LADO (dev): mede cada personagem no modo com a CPU Difícil no lugar do jogador — uma sala de 3
// monstros e o chefe do Espreitador, sozinho, dificuldade Normal. Serve para achar quem quebra, quem não limpa sala e
// para calibrar PVE_CHAR_TUNE (pve/dungeons.js). Não faz parte do jogo: carregue no console do `npm run dev`:
//   const B = await import('/src/dev/pveBattery.js'); await B.run(['morato', 'joui'], 3); B.summary()
// A ABA PRECISA ESTAR NA FRENTE (aba em segundo plano fica lenta). Os resultados vão para o localStorage (`pve_battery`),
// então sobrevivem a uma recarga da página (o HMR recarrega quando um módulo muda): chamar run() de novo continua de
// onde parou. Vida do jogador: volta cheia abaixo de 25% (mede o dano recebido, não a morte). Melhorias: a 1ª opção.
import { newAttempt } from '../pve/save.js';
import { CpuController } from '../ai/CpuController.js';

const KEY = 'pve_battery';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const game = () => window.__game;

async function start(id) {
  const g = game();
  g.pve.data.attempt = newAttempt({ charId: id, team: [], difficulty: 'normal', dungeon: 'espreitador' });
  g.pve.startDungeon();
  for (let w = 0; w < 300; w++) {
    if (g.state === 'fight' && g.match && g.match.world && g.match.phase === 'intro') break;
    await pause(100);
  }
  const m = g.match;
  for (let i = 0; i < 30 && m.phase === 'intro'; i++) g.step(60);
  return m;
}

function drive(m) {
  const slot = m.input.players[0];
  slot.cpu = new CpuController({ level: 'hard' });
  slot.cpu.attach(m.player);
}

async function fight(m, maxS, boss) {
  const g = game();
  const p = m.player;
  let taken = 0;
  let last = p.health;
  const t0 = m.world.time;
  for (let t = 0; t < maxS * 60; t += 15) {
    g.step(15);
    if (m.pveHud.choice) m.pveHud.pick(); // subiu de nível: o mundo para até escolher
    if (p.health < last) taken += last - p.health;
    last = p.health;
    if (p.health < p.maxHealth * 0.25) { p.health = p.maxHealth; last = p.health; }
    if (!boss && m.encounter && m.encounter.done) break;
    if (boss && ['bossDown', 'exit', 'over'].includes(m.phase)) break;
    if (t % 300 === 0) await pause(0);
  }
  const done = boss ? ['bossDown', 'exit', 'over'].includes(m.phase) : !!(m.encounter && m.encounter.done);
  return { s: Math.round(m.world.time - t0), tk: Math.round((taken / p.maxHealth) * 100), done, hp: boss ? Math.round((m.enemy.health / m.enemy.maxHealth) * 100) : 0 };
}

export async function run(ids, samples = 3) {
  for (const id of ids) {
    for (let k = 0; k < samples; k++) {
      if ((load()[id] || []).length > k) continue;
      const rec = {};
      try {
        const m = await start(id);
        drive(m);
        const rooms = Object.keys(m.D.modules).filter((x) => m.D.modules[x].kind === 'fight');
        const to = rooms[k % rooms.length];
        m.enterModule(to, { slot: 'front', to, count: 3 });
        m.player.health = m.player.maxHealth;
        m.startEncounter(m.mod, 3);
        rec.room = await fight(m, 90, false);
        for (const c of m.copias) if (c.alive) c.kill();
        m.copias = [];
        const bossId = Object.keys(m.D.modules).find((x) => m.D.modules[x].kind === 'boss');
        m.enterModule(bossId, { slot: 'front', to: bossId, count: 0 });
        m.player.health = m.player.maxHealth;
        if (!m.encounter || !m.encounter.boss) m.startBoss(m.mod);
        if (m.bossIntro && m.bossIntro.finish) m.bossIntro.finish();
        drive(m);
        rec.boss = await fight(m, 180, true);
      } catch (e) {
        rec.err = String((e && e.stack) || e).slice(0, 300);
      }
      const all = load();
      (all[id] = all[id] || []).push(rec);
      localStorage.setItem(KEY, JSON.stringify(all));
    }
  }
  return summary();
}

export function summary() {
  const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / Math.max(1, a.length));
  return Object.entries(load()).map(([id, rs]) => {
    const ok = rs.filter((r) => r.room && r.boss);
    const errs = rs.length - ok.length;
    return `${id}: sala ${avg(ok.map((r) => r.room.s))}s ${avg(ok.map((r) => r.room.tk))}% limpa ${ok.filter((r) => r.room.done).length}/${ok.length}`
      + ` | chefe ${avg(ok.map((r) => r.boss.s))}s ${avg(ok.map((r) => r.boss.tk))}% caiu ${ok.filter((r) => r.boss.done).length}/${ok.length}${errs ? ` | ERROS ${errs}` : ''}`;
  }).join('\n');
}

export function clear() {
  localStorage.removeItem(KEY);
}
