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
    // x: onde a sala começa (o mapa é em linha, da esquerda para a direita); gate: a porta que só abre quando a sala
    // termina; spawn: onde o inimigo da vez espera
    rooms: [
      { id: 'hall', kind: 'start', title: 'Hall de entrada', objective: 'Explore a mansão' },
      { id: 'sala', kind: 'fight', title: 'Sala de estar', gate: 6.2, enemies: { devorado: 1, copias: 1 }, spawn: { x: 2.5, z: 0 }, enter: -6.5, objective: 'Derrote os Devorados' },
      { id: 'corredor', kind: 'stalk', title: 'Corredor', enter: 8.5, peek: { x: 12, z: -1.95 }, objective: 'Não olhe para a fresta' },
      { id: 'biblioteca', kind: 'fight', title: 'Biblioteca', gate: 30.2, enemies: { devorado: 1, copias: 2 }, spawn: { x: 25, z: 0 }, enter: 17.5, objective: 'Derrote os Devorados' },
      { id: 'quarto', kind: 'boss', title: 'Quarto principal', gate: 62.2, spawn: { x: 54, z: 0 }, enter: 39.5, objective: 'Derrote o Espreitador' },
      { id: 'saida', kind: 'exit', title: 'Saída', door: { x: 62.6, z: 0 }, objective: 'Atravesse a porta' },
    ],
    // os 4 armários do quarto (a fresta por onde ele foge): posição da porta e para onde ela abre
    closets: [
      { x: 44, z: -10.4, face: 0 }, { x: 56, z: -10.4, face: 0 },
      { x: 38.5, z: -6, face: Math.PI / 2 }, { x: 61.5, z: 6, face: -Math.PI / 2 }, // nas paredes laterais (na parede da frente tapariam a câmera)
    ],
  },
};

export const DUNGEON_ORDER = ['espreitador'];

// DIFICULDADE (TODO §4.5: o chefe desafia mesmo no Fácil): CPU e multiplicadores do inimigo
export const PVE_DIFFICULTIES = {
  easy: { label: 'Fácil', cpu: 'normal', minion: 'easy', hp: 0.9, dealt: 0.8, drop: 1.25 },
  normal: { label: 'Normal', cpu: 'hard', minion: 'normal', hp: 1, dealt: 1, drop: 1 },
  hard: { label: 'Difícil', cpu: 'veryhard', minion: 'hard', hp: 1.15, dealt: 1.15, drop: 0.8 },
};

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
