// OUTRO LADO — BATERIA DA ECONOMIA (TODO "Calibrar a economia do Outro Lado com a bateria"): simula N tentativas de cada
// dungeon com as MESMAS funções de sorteio do jogo (rotas, cadeados, gavetas, barris, drops dos monstros, baús do
// começo, recompensa do chefe) e mostra a renda média por dungeon e por tentativa em cada dificuldade, contra os preços
// da loja e do giro. Supõe um jogador que abre tudo (gavetas, barris, baús) e pega a rota sorteada.
// Limites (PROPOSTA, não medido jogando): os baús depois do nível 2 dão melhorias e só viram moedas quando a build está
// cheia (aqui contam 0); a escolha "moedas ou vida" da recompensa conta como moedas; sem a Ganância da Aghata.
//   node tools/pve-economy.mjs [tentativas=4000] [dungeons por tentativa=3]
import { DUNGEONS, PVE_DIFFICULTIES, rollRouteLength, rollExits, rollLock, chestChance } from '../src/pve/dungeons.js';
import { rollLoot } from '../src/pve/unlocks.js';
import { chestCount } from '../src/pve/upgrades.js';
import { bossBounty, RARITY_INFO, SPIN_PRICE } from '../src/pve/economy.js';

const RUNS = Number(process.argv[2] || 4000);
const PER_ATTEMPT = Number(process.argv[3] || 3);
const rnd = Math.random;
const coinsOf = (r) => (r && r.kind === 'coins' ? r.amount : 0);

// moedas de UMA dungeon na profundidade `depth` (antes de multiplicar pela dificuldade)
function oneDungeon(D, depth, diff) {
  let coins = 0;
  const total = rollRouteLength(D, depth, rnd);
  let cur = D.start;
  let via = null;
  const visited = [cur];
  for (let step = 0; ; step++) {
    const M = D.modules[cur];
    // gavetas (a chave do cadeado ocupa uma delas: aqui ignorada) e 1–3 barris/caixas
    for (const _ of M.drawers || []) coins += coinsOf(rollLoot('drawer', rnd, depth, 1));
    const props = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < props; i++) coins += coinsOf(rollLoot('barrel', rnd, depth, 1));
    // os monstros da sala
    if (M.kind === 'fight') {
      const n = via && via.padlock === 'vault' ? 0 : via ? via.count : 2;
      for (let i = 0; i < n; i++) coins += coinsOf(rollLoot('monster', rnd, depth, diff.drop));
    }
    // o baú: só os do começo (nível 1, antes da 1ª melhoria) rendem moedas — metade dos itens, 3–6 cada
    const early = step <= 1;
    const vault = via && via.padlock === 'vault';
    const nChests = vault ? (M.chests || []).length : (M.chests && M.chests.length && (step >= total || rnd() < chestChance(D, M.kind, via ? via.count : 0)) ? 1 : 0);
    if (early) for (let c = 0; c < nChests; c++) {
      const n = chestCount(rnd, vault ? D.locks?.luck || 0.6 : 0);
      for (let i = 0; i < n; i++) if (rnd() < 0.5) coins += Math.round((3 + rnd() * 3) * (1 + 0.25 * (depth - 1)));
    }
    if (M.kind === 'boss') break;
    const exits = rollExits(D, cur, { step, total, visited, prevCount: via ? via.count : 0, rng: rnd });
    if (!exits.length) break;
    rollLock(D, cur, exits, rnd);
    via = exits[Math.floor(rnd() * exits.length)];
    cur = via.to;
    visited.push(cur);
  }
  const extra = D.chests && D.chests.coinsBoss ? Math.round(D.chests.coinsBoss * (1 + 0.25 * (depth - 1))) : 0;
  const drops = Math.round(coins * (diff.coin ?? 1));
  const boss = Math.round((bossBounty(depth) + extra) * (diff.coin ?? 1));
  return { drops, boss };
}

const ids = Object.keys(DUNGEONS);
const fmt = (n) => String(Math.round(n)).padStart(5);
console.log(`Renda média em moedas (${RUNS} simulações; tentativa = ${PER_ATTEMPT} dungeons, profundidades 1..${PER_ATTEMPT})\n`);
console.log('dificuldade     ' + ids.map((id) => `${id.slice(0, 11).padEnd(11)} drops chefe`).join('  ') + '   tentativa  giros  comum  lendário');
for (const [dk, diff] of Object.entries(PVE_DIFFICULTIES)) {
  const per = {};
  for (const id of ids) {
    let d = 0, b = 0;
    for (let k = 0; k < RUNS; k++) { const r = oneDungeon(DUNGEONS[id], 1, diff); d += r.drops; b += r.boss; }
    per[id] = { d: d / RUNS, b: b / RUNS };
  }
  // uma tentativa: dungeons sorteadas, profundidade 1..PER_ATTEMPT
  let att = 0;
  for (let k = 0; k < RUNS; k++) for (let depth = 1; depth <= PER_ATTEMPT; depth++) {
    const r = oneDungeon(DUNGEONS[ids[Math.floor(rnd() * ids.length)]], depth, diff);
    att += r.drops + r.boss;
  }
  att /= RUNS;
  console.log(`${diff.label.padEnd(16)}` + ids.map((id) => `${''.padEnd(11)} ${fmt(per[id].d)} ${fmt(per[id].b)}`).join('  ') +
    `   ${fmt(att)}    ${(SPIN_PRICE / att).toFixed(1).padStart(4)}   ${(RARITY_INFO.comum.price / att).toFixed(1).padStart(4)}   ${(RARITY_INFO.lendario.price / att).toFixed(1).padStart(5)}`);
}
console.log('\n"giros", "comum" e "lendário" = quantas TENTATIVAS para pagar um giro, um personagem comum e um lendário.');
