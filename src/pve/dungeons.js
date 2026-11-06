// OUTRO LADO — cadastro de dungeons (TODO §4.4: adicionar dungeons sem mexer na progressão; requisitos, restrições e
// chefe de cada uma; sorteio da próxima). Cada dungeon:
//   arena      o mapa próprio (arena/configs.js, feito no Blender)
//   boss       a forma do chefe (characters/forms) — fica fora da seleção NESTA dungeon (restricted)
//   rooms      a sequência do mapa: o que acontece em cada sala, na ordem (ver pve/Dungeon.js)
//   drops      chance e quantidade de cura dos inimigos menores (TODO §4.3: configurável, sem mexer no inimigo)
//   minDepth   a partir de que profundidade ela pode ser sorteada
export const DUNGEONS = {
  espreitador: {
    id: 'espreitador',
    name: 'Território do Espreitador',
    place: 'Mansão Endiabrada',
    color: '#f2c230',
    arena: 'mansao',
    boss: 'espreitador',
    restricted: ['espreitador'],
    minDepth: 1,
    drops: { heal: { chance: 0.45, amount: 0.2 } },
    xp: { devorado: 35, copia: 15, boss: 120 },
    // ROTAS (pedido do dono, 2026-11-05): cada sala é um MÓDULO; ao limpar a sala, as portas da esquerda, da frente e da
    // direita (e a escada do hall) se abrem, e cada uma leva a uma sala sorteada — com 2, 3 ou 4 monstros (o número
    // aparece na porta). O número de salas até o chefe varia a cada tentativa (`route.rooms`); a última é sempre o chefe.
    //   rects   a área andável do módulo (só ela vale enquanto o jogador está ali: o resto da casa fica atrás das portas)
    //   entry   onde quem chega aparece (e a porta por onde entrou, que se fecha atrás dele)
    //   exits   as portas de saída: x/z na face da parede, face = para onde a porta olha (para dentro), w = largura;
    //           stairs = a escada (sem porta), que sempre leva ao outro andar
    //   floor   0 = térreo, 1 = 2º andar (a porta que troca de andar avisa ↑ / ↓)
    route: { rooms: [3, 5], monsters: [2, 4], stalkWeight: 0.35 },
    start: 'hall',
    bossModule: 'quarto',
    modules: {
      hall: {
        kind: 'start', floor: 0, title: 'Hall de entrada', objective: 'Escolha um caminho',
        rects: [{ minX: -17.6, maxX: -10.2, minZ: -4.6, maxZ: 4.6 }],
        entry: { x: -14.5, z: 0.5, yaw: Math.PI / 2 },
        exits: {
          left: { x: -14.15, z: -4.98, face: 0, w: 1.4 },
          front: { x: -10.02, z: 0, face: -Math.PI / 2, w: 2.9 },
          // a escada sobe ANDANDO (pedido do dono, 2026-11-06): no patamar, a porta da sala de cima — entra ou desce de volta
          up: { x: -12.0, z: 4.15, y: 3.3, stairs: true, landing: true, face: -Math.PI / 2, w: 1.2 },
        },
        chests: [{ x: -11.2, z: 3.6 }, { x: -16.8, z: -1.2 }],
        // os degraus (x de baixo → de cima, a altura no topo) e o patamar (até landingX)
        stairs: { x0: -16.05, x1: -12.65, landingX: -11.85, minZ: 3.4, maxZ: 4.9, top: 3.3 },
        drawers: [{ x: -11.6, y: 0.66, z: -4.35, face: 0 }], // as GAVETAS (chave do cadeado, moedas ou nada)
      },
      sala: {
        kind: 'fight', floor: 0, title: 'Sala de estar',
        rects: [{ minX: -5.8, maxX: 5.8, minZ: -5.7, maxZ: 5.7 }],
        entry: { x: -4.7, z: 0, yaw: Math.PI / 2, door: { x: -5.98, z: 0, face: Math.PI / 2, w: 2.9 } },
        spawn: { x: 2.5, z: 0 },
        exits: {
          left: { x: -3.5, z: -5.98, face: 0, w: 1.4 },
          front: { x: 5.98, z: 0, face: -Math.PI / 2, w: 2.9 },
          right: { x: 3.5, z: 5.98, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: -4.8, z: 4.8 }, { x: 4.6, z: -5.0 }],
        drawers: [{ x: 5.3, y: 0.85, z: -4.3, face: -Math.PI / 2 }, { x: 5.3, y: 0.5, z: -3.3, face: -Math.PI / 2 }], // as GAVETAS (chave do cadeado, moedas ou nada)
      },
      corredor: {
        kind: 'stalk', floor: 0, title: 'Corredor', objective: 'Não olhe para a fresta',
        rects: [{ minX: 6.4, maxX: 15.6, minZ: -1.45, maxZ: 1.45 }],
        entry: { x: 7.2, z: 0, yaw: Math.PI / 2, door: { x: 6.24, z: 0, face: Math.PI / 2, w: 2.9 } },
        peek: { x: 12, z: -1.95 },
        exits: {
          left: { x: 9, z: -1.78, face: 0, w: 1.4 },
          front: { x: 15.76, z: 0, face: -Math.PI / 2, w: 2.9 },
          right: { x: 13.6, z: 1.78, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 14.5, z: 0.9 }],
        drawers: [{ x: 8.6, y: 0.64, z: 1.24, face: Math.PI }], // as GAVETAS (chave do cadeado, moedas ou nada)
      },
      biblioteca: {
        kind: 'fight', floor: 0, title: 'Biblioteca',
        rects: [{ minX: 16.2, maxX: 29.8, minZ: -6.2, maxZ: 6.2 }],
        entry: { x: 17.2, z: 0, yaw: Math.PI / 2, door: { x: 16.02, z: 0, face: Math.PI / 2, w: 2.9 } },
        spawn: { x: 25, z: 0 },
        exits: {
          left: { x: 23, z: -6.48, face: 0, w: 1.4 },
          front: { x: 29.98, z: 0, face: -Math.PI / 2, w: 2.9 },
          right: { x: 23, z: 6.48, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 18.4, z: 5.2 }, { x: 28.6, z: -5.2 }],
        drawers: [{ x: 17.0, y: 0.32, z: 5.5, face: Math.PI }], // as GAVETAS (chave do cadeado, moedas ou nada)
      },
      jantar: { // PROPOSTA (não é um cômodo citado na wiki): a mesa posta para ninguém
        kind: 'fight', floor: 0, title: 'Sala de jantar',
        rects: [{ minX: 0.3, maxX: 13.7, minZ: 34.3, maxZ: 45.7 }],
        entry: { x: 1.1, z: 40, yaw: Math.PI / 2, door: { x: 0.02, z: 40, face: Math.PI / 2, w: 1.4 } },
        spawn: { x: 12, z: 40 },
        exits: {
          left: { x: 10.8, z: 34.02, face: 0, w: 1.4 },
          front: { x: 13.98, z: 40, face: -Math.PI / 2, w: 1.4 },
          right: { x: 10.8, z: 45.98, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 12.9, z: 35.1 }, { x: 1.2, z: 35.2 }],
        drawers: [{ x: 6.2, y: 0.82, z: 34.72, face: 0 }, { x: 7.8, y: 0.82, z: 34.72, face: 0 }, { x: 4.0, y: 0.4, z: 45.3, face: Math.PI }], // as GAVETAS (chave do cadeado, moedas ou nada)
      },
      infantil: {
        kind: 'fight', floor: 1, title: 'Quarto infantil',
        rects: [{ minX: 20.3, maxX: 31.7, minZ: 34.3, maxZ: 43.7 }],
        entry: { x: 21.1, z: 39, yaw: Math.PI / 2, door: { x: 20.02, z: 39, face: Math.PI / 2, w: 1.4 } },
        spawn: { x: 29, z: 39.5 },
        exits: {
          left: { x: 24.0, z: 34.02, face: 0, w: 1.4 },
          front: { x: 31.98, z: 39, face: -Math.PI / 2, w: 1.4 },
          right: { x: 27.6, z: 43.98, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 23.6, z: 43.0 }, { x: 31.1, z: 36.9 }],
        drawers: [{ x: 31.08, y: 0.42, z: 42.6, face: -Math.PI / 2 }, { x: 20.76, y: 0.32, z: 42.2, face: Math.PI / 2 }], // as GAVETAS (chave do cadeado, moedas ou nada)
      },
      olhos: {
        kind: 'stalk', floor: 1, title: 'Quarto dos Olhos de Gatos', objective: 'Não olhe para a porta emperrada',
        rects: [{ minX: 38.3, maxX: 47.7, minZ: 35.3, maxZ: 42.7 }],
        entry: { x: 39.1, z: 39, yaw: Math.PI / 2, door: { x: 38.02, z: 39, face: Math.PI / 2, w: 1.4 } },
        peek: { x: 45.2, z: 34.85, eyes: 18 },
        exits: {
          left: { x: 41.2, z: 35.02, face: 0, w: 1.4 },
          front: { x: 47.98, z: 36.6, face: -Math.PI / 2, w: 1.4 },
          right: { x: 43.5, z: 42.98, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 47.0, z: 39.6 }],
        drawers: [{ x: 39.32, y: 0.7, z: 41.5, face: Math.PI / 2 }, { x: 39.32, y: 0.4, z: 42.1, face: Math.PI / 2 }], // as GAVETAS (chave do cadeado, moedas ou nada)
      },
      quarto: {
        kind: 'boss', floor: 0, title: 'Quarto principal', objective: 'Derrote o Espreitador',
        rects: [{ minX: 38.2, maxX: 61.8, minZ: -10.2, maxZ: 10.2 }, { minX: 60.4, maxX: 75.6, minZ: -1.1, maxZ: 1.1 }],
        entry: { x: 39.3, z: 0, yaw: Math.PI / 2, door: { x: 38.02, z: 0, face: Math.PI / 2, w: 2.5 } },
        spawn: { x: 54, z: 0 },
        exits: {},
        chests: [{ x: 40, z: 9 }, { x: 59.5, z: -8.6 }],
        drawers: [{ x: 48.25, y: 0.45, z: -9.23, face: 0 }, { x: 51.75, y: 0.45, z: -9.23, face: 0 }, { x: 61.13, y: 0.75, z: 6.0, face: -Math.PI / 2 }], // as GAVETAS (chave do cadeado, moedas ou nada)
      },
    },
    exit: { door: { x: 62.6, z: 0 } },
    // as PORTAS COM CADEADO (pedido do dono, 2026-11-06): a chave está numa gaveta da mesma sala (sem aviso de qual).
    // Atrás: uma sala de baús (vault) ou uma sala com monstros que, limpa, solta um baú com mais sorte (sem aviso).
    locks: { chance: 0.4, vault: 0.5, luck: 0.6, drawerCoins: 0.35, coins: [4, 9] },
    // os BAÚS são OPCIONAIS (pedido do dono): cada sala pode ter um, mais provável nas salas com mais monstros
    chests: {
      chance: { start: 0.7, stalk: 0.9, boss: 1, fight: [0, 0, 0.45, 0.65, 0.9] }, // fight: pelo número de monstros
      coinsBoss: 30, // moedas da recompensa do chefe
    },
    // os 4 armários do quarto (a fresta por onde ele foge): posição da porta e para onde ela abre
    closets: [
      { x: 44, z: -10.4, face: 0 }, { x: 56, z: -10.4, face: 0 },
      { x: 38.5, z: -6, face: Math.PI / 2 }, { x: 61.5, z: 6, face: -Math.PI / 2 }, // nas paredes laterais (na parede da frente tapariam a câmera)
    ],
  },
};

// ------------------------------------------------ ROTAS: quantas salas até o chefe e o que há atrás de cada porta
const randInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

// salas entre o hall e o chefe (mais fundo = às vezes uma a mais)
export function rollRouteLength(D, depth = 1, rng = Math.random) {
  const [a, b] = D.route.rooms;
  return randInt(rng, a, b + (depth >= 3 ? 1 : 0));
}

// as portas da sala `curId`, que é a `step`-ésima de `total`: cada saída sorteia a sala e quantos monstros ela tem.
// Depois da última sala, uma porta só (a da frente, se houver): o chefe.
export function rollExits(D, curId, { step = 0, total = 3, visited = [], prevCount = 0, rng = Math.random } = {}) {
  const cur = D.modules[curId];
  const slots = Object.keys(cur.exits);
  if (!slots.length) return [];
  if (step >= total) {
    const doors = slots.filter((s) => !cur.exits[s].stairs || D.modules[D.bossModule].floor !== cur.floor);
    const slot = doors.includes('front') ? 'front' : doors[Math.floor(rng() * doors.length)];
    return [{ slot, to: D.bossModule, kind: 'boss', count: 1 }];
  }
  const pool = slots.slice();
  const k = Math.min(pool.length, rng() < 0.5 ? 2 : 3);
  const chosen = [];
  while (chosen.length < k) chosen.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  const used = new Set();
  const out = [];
  const okFor = (ex, id) => {
    const m = D.modules[id];
    if (id === curId || used.has(id) || m.kind === 'start' || m.kind === 'boss') return false;
    return ex.stairs ? m.floor !== cur.floor : true; // a escada sempre troca de andar
  };
  for (const slot of chosen) {
    const ex = cur.exits[slot];
    let cand = Object.keys(D.modules).filter((id) => okFor(ex, id));
    if (!cand.length) continue;
    const fresh = cand.filter((id) => !visited.includes(id));
    if (fresh.length) cand = fresh;
    // as salas de espreita saem menos (stalkWeight)
    const wts = cand.map((id) => (D.modules[id].kind === 'stalk' ? D.route.stalkWeight : 1));
    let r = rng() * wts.reduce((a, b) => a + b, 0);
    let to = cand[cand.length - 1];
    for (let i = 0; i < cand.length; i++) { r -= wts[i]; if (r <= 0) { to = cand[i]; break; } }
    used.add(to);
    const m = D.modules[to];
    out.push({ slot, to, kind: m.kind, count: m.kind === 'fight' ? randInt(rng, D.route.monsters[0], D.route.monsters[1]) : 0 });
  }
  // pelo menos uma porta com luta (senão a rota podia ser só corredor)
  if (out.length && !out.some((e) => e.kind === 'fight')) {
    const ex = cur.exits[out[0].slot];
    used.delete(out[0].to);
    const fights = Object.keys(D.modules).filter((id) => D.modules[id].kind === 'fight' && okFor(ex, id));
    if (fights.length) {
      const to = fights[Math.floor(rng() * fights.length)];
      out[0] = { slot: out[0].slot, to, kind: 'fight', count: randInt(rng, D.route.monsters[0], D.route.monsters[1]) };
    }
  }
  // RITMO (skill level-design: tensão em dente de serra): depois de uma sala de 4, sempre há uma porta mais leve
  if (prevCount >= D.route.monsters[1] && out.length && !out.some((e) => e.kind === 'stalk' || (e.kind === 'fight' && e.count <= D.route.monsters[0]))) {
    const f = out.find((e) => e.kind === 'fight');
    if (f) f.count = D.route.monsters[0];
  }
  return out;
}

// chance de baú numa sala (opcional: pegar ou não é escolha do jogador)
// sorteia se uma das saídas desta sala vem com CADEADO: só com 2+ saídas (nunca a única), nunca a escada nem a do chefe,
// e só se a sala tem gaveta para esconder a chave. Marca a saída: e.padlock = 'vault' | 'fight'. Devolve a saída ou null.
export function rollLock(D, curId, exits, rng = Math.random) {
  const L = D.locks;
  const cur = D.modules[curId];
  if (!L || !cur.drawers || !cur.drawers.length || exits.length < 2 || rng() >= L.chance) return null;
  const ok = exits.filter((e) => e.kind !== 'boss' && !cur.exits[e.slot].stairs);
  if (!ok.length) return null;
  const e = ok[Math.floor(rng() * ok.length)];
  // atrás de um corredor de espreita não cabe luta: vira sala de baús
  e.padlock = e.kind === 'fight' && rng() >= L.vault ? 'fight' : 'vault';
  if (e.padlock === 'vault') e.count = 0;
  return e;
}

export function chestChance(D, kind, count = 0) {
  const c = D.chests?.chance;
  if (!c) return 0;
  if (kind === 'fight') return c.fight[Math.min(c.fight.length - 1, count)] ?? 0.5;
  return c[kind] ?? 0;
}

export const DUNGEON_ORDER = ['espreitador'];

// DIFICULDADE (TODO §4.5: o chefe desafia mesmo no Fácil): CPU e multiplicadores do inimigo
export const PVE_DIFFICULTIES = {
  // warnMult: quanto tempo os olhos avisam antes do bote do Espreitador
  easy: { label: 'Fácil', cpu: 'normal', minion: 'easy', hp: 0.9, dealt: 0.8, drop: 1.25, warnMult: 1.3 },
  normal: { label: 'Normal', cpu: 'hard', minion: 'normal', hp: 1, dealt: 1, drop: 1, warnMult: 1 },
  hard: { label: 'Difícil', cpu: 'veryhard', minion: 'hard', hp: 1.15, dealt: 1.15, drop: 0.8, warnMult: 0.75 },
};

// a ordem das dificuldades: ao terminar TODAS as dungeons ainda não jogadas, a tentativa volta à primeira um degrau acima
// (pedido do dono, 2026-11-05); depois do Difícil sobe o "calor" (Difícil +1, +2…: +20% de vida e dano cada)
export const DIFF_ORDER = ['easy', 'normal', 'hard'];
export function diffLabel(run) {
  const base = (PVE_DIFFICULTIES[run.difficulty] || PVE_DIFFICULTIES.normal).label;
  return run.heat ? `${base} +${run.heat}` : base;
}
export function heatScale(run) {
  return 1 + 0.2 * (run.heat || 0);
}
// depois de limpar a dungeon `cleared`: a próxima não jogada neste ciclo; sem nenhuma, a 1ª, mais difícil.
// Devolve { dungeon, looped } e altera run.played / run.difficulty / run.heat.
export function advanceAfterClear(run, cleared) {
  const played = new Set([...(run.played || []), cleared]);
  const next = DUNGEON_ORDER.find((id) => !played.has(id) && (DUNGEONS[id].minDepth || 1) <= run.depth);
  if (next) { run.played = [...played]; return { dungeon: next, looped: false }; }
  run.played = [];
  const i = DIFF_ORDER.indexOf(run.difficulty);
  if (i >= 0 && i < DIFF_ORDER.length - 1) run.difficulty = DIFF_ORDER[i + 1];
  else run.heat = (run.heat || 0) + 1;
  return { dungeon: DUNGEON_ORDER[0], looped: true };
}

// profundidade (a mesma dungeon de novo, mais funda): +12% de vida e dano por nível
export function depthScale(depth) {
  return 1 + 0.12 * Math.max(0, depth - 1);
}

// dungeons que podem vir agora
export function validDungeons(depth) {
  return DUNGEON_ORDER.filter((id) => (DUNGEONS[id].minDepth || 1) <= depth);
}

// sorteio da próxima: evita repetir a anterior quando há outra opção (TODO §4.4)
export function pickNextDungeon({ depth = 1, previous = null, rng = Math.random } = {}) {
  const list = validDungeons(depth);
  if (!list.length) return null;
  const fresh = list.filter((id) => id !== previous);
  const pool = fresh.length ? fresh : list;
  return pool[Math.floor(rng() * pool.length)];
}

// personagem permitido nesta dungeon (o chefe não pode ser escolhido contra ele mesmo — TODO §3.3)
export function isAllowed(dungeonId, charId) {
  const d = DUNGEONS[dungeonId];
  return !d || !(d.restricted || []).includes(charId);
}

// cura de um inimigo menor: sorteia se cai e quanto (fração da vida máxima)
export function rollHeal(dungeonId, rng = Math.random, mult = 1) {
  const h = DUNGEONS[dungeonId]?.drops?.heal;
  if (!h) return 0;
  return rng() < Math.min(1, h.chance * mult) ? h.amount : 0;
}
