// BATERIA DA ÁRVORE ANCIÃ (dev): a parte 3 do Samhain com a CPU Difícil no lugar do jogador, numa dificuldade e com N
// lamparinas acesas no corredor. A CPU luta, mas não guarda o alçapão de propósito (um jogador de verdade guarda). Mede
// a barra dos aldeões no fim e a menor, e quantas vezes o jogador "cairia" (a vida volta cheia abaixo de 8%).
// Não faz parte do jogo: no console do `npm run dev` (aba na frente):
//   const B = await import('/src/dev/samhainBattery.js'); await B.batch([['normal', 0], ['normal', 8]]); B.table()
import { newAttempt } from '../pve/save.js';
import { CpuController } from '../ai/CpuController.js';

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
export const results = [];

export async function treeRun(diff = 'normal', lamps = 0, char = 'joui') {
  const g = window.__game;
  g.pve.data.attempt = newAttempt({ charId: char, team: [], difficulty: diff, dungeon: 'samhain' });
  g.pve.startDungeon();
  for (let w = 0; w < 250; w++) { if (g.screen && g.screen.ready && g.screen.go) { g.screen.readyAt = 0; g.screen.go(); } if (g.state === 'fight' && g.match && g.match.world && g.match.player && g.match.phase) break; await pause(100); }
  await pause(400);
  const m = g.match;
  for (let i = 0; i < 30 && m.phase === 'intro'; i++) g.step(60);
  m.waves.n = m.waves.total;
  m.encounter = { done: true, wave: m.waves.total };
  m.startTree(lamps);
  const slot = m.input.players[0];
  slot.cpu = new CpuController({ level: 'hard' });
  slot.cpu.attach(m.player);
  const D = m.tree.door;
  let downs = 0, s = 0, minK = 1;
  for (; s < 420 && m.phase !== 'dead' && m.phase !== 'bossDown'; s++) {
    g.step(60);
    if (m.choosing && m.pick) { try { m.pick(0); } catch { /* sem escolha */ } }
    if (m.player.health < m.player.maxHealth * 0.08) { downs++; m.player.health = m.player.maxHealth; }
    minK = Math.min(minK, D.hp / D.maxHp);
  }
  const r = { diff, lamps, char, win: m.phase === 'bossDown', door: Math.round(100 * D.hp / D.maxHp), minDoor: Math.round(minK * 100), downs, secs: s, waves: `${m.waves.n}/${m.waves.total}` };
  results.push(r);
  return r;
}

export async function batch(list) { for (const [d, l, c] of list) await treeRun(d, l, c); return table(); }
export function table() { return results.map((r) => `${r.diff} ${r.lamps} ${r.win ? 'W' : 'L'} fim ${r.door}% min ${r.minDoor}% caídas ${r.downs} ${r.secs}s ${r.waves}`); }

// a fase INTEIRA (vila → tempestade → corredor → Árvore) com a CPU Difícil; as casas não apagam (a CPU não reacende
// lamparinas) e no corredor ninguém desvia (o personagem só corre): mede o tempo de cada parte e se as passagens funcionam
export async function fullRun(diff = 'normal', char = 'joui') {
  const g = window.__game;
  g.pve.data.attempt = newAttempt({ charId: char, team: [], difficulty: diff, dungeon: 'samhain' });
  g.pve.startDungeon();
  for (let w = 0; w < 250; w++) { if (g.screen && g.screen.ready && g.screen.go) { g.screen.readyAt = 0; g.screen.go(); } if (g.state === 'fight' && g.match && g.match.world && g.match.player && g.match.phase) break; await pause(100); }
  await pause(400);
  const m = g.match;
  const slot = m.input.players[0];
  slot.cpu = new CpuController({ level: 'hard' });
  slot.cpu.attach(m.player);
  const log = [];
  let s = 0, part = 'vila', downs = 0;
  for (; s < 1500 && m.phase !== 'dead' && !(m.phase === 'bossDown' && m.tree); s++) {
    if (m.village) for (const h of m.village.houses) h.hp = h.maxHp;
    g.step(60);
    if (m.choosing && m.pick) { try { m.pick(0); } catch { /* sem escolha */ } }
    if (m.player.health < m.player.maxHealth * 0.08) { downs++; m.player.health = m.player.maxHealth; }
    const now = m.tree ? 'arvore' : m.runner ? 'corredor' : 'vila';
    if (now !== part) { log.push(`${part} até ${s}s`); part = now; }
  }
  log.push(`${part} até ${s}s · fase ${m.phase} · lamparinas ${m.run.samhainLamps ?? '-'} · caídas ${downs} · nível ${m.run.level}`);
  return log;
}
