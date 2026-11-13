// O ESTRANGEIRO (id: estrangeiro) — CHEFE do OUTRO LADO (a 3ª dungeon, a Torre da TV Varminho; docs/TORRE-TRANSMISSAO.md).
// O Alheio original (wiki "Alheios": a origem de todos os outros) espera na SALA DO SINO, no 6º andar (ep. 7 de Sinais
// do Outro Lado). A ficha JOGÁVEL (modo de luta) é characters/estrangeiro.js; o chefe é a mesma criatura com mais vida e
// SEM o especial e o despertar, mas COM o kit (a CPU de luta usa as habilidades: os Homens de Terno, o Ninho de
// Interflorados, a Abdução, o Comandar, a Aparição). PROPOSTA: os números (sem bateria ainda).
import base from '../estrangeiro.js';

const { special, awakening, ...rest } = base;

export default {
  ...rest,
  boss: true,
  info: { ...base.info, style: 'Chama os Homens de Terno pela interferência, planta ninhos de Interflorados e abduz quem fica parado' },
  stats: { ...base.stats, maxHealth: 2000 },
  poise: { hits: 5 },
  defense: { perfectBlock: null },
  passives: [],
};
