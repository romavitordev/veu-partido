// O AMIGO IMAGINÁRIO (id: amigo) — CHEFE da fase de ONDAS da ILHA DE TIPORA (O Segredo na Ilha; pedido do dono,
// 2026-11-19: "Ondas em Tipora"). É a criatura da ilha no cânone; ser o chefe da última onda é PROPOSTA.
// A ficha JOGÁVEL está em characters/amigo.js; o chefe é a mesma criatura com os golpes e as habilidades (a CPU usa os
// tentáculos, o Sino e a tinta), sem o especial e sem a transformação, e com mais vida.
import base from '../amigo.js';

const { special, awakening, ...rest } = base;

export default {
  ...rest,
  boss: true,
  info: { ...base.info, style: 'O chefe da última onda: tentáculos que puxam de longe, garras de perto e o Sino que paralisa' },
  stats: { ...base.stats, maxHealth: 2100 },
  poise: { hits: 5 }, // chefe: depois de 5 golpes seguidos para de reagir (não fica preso no combo)
  defense: { perfectBlock: null },
  passives: [],
};
