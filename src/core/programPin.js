// SHADERS FIXOS (P0 de estabilidade, 2026-11-06): o three.js apaga o programa de um material quando o último material
// com aquela configuração é descartado. Os efeitos de golpe (rastros, brilhos aditivos, projéteis) criam e descartam o
// próprio material a cada uso, então o mesmo shader era COMPILADO DE NOVO a cada golpe — 60 a 165 ms parado por vez,
// medido no Outro Lado com 4 monstros na sala (os picos do render coincidiam todos com um programa novo).
// Aqui cada programa compilado ganha um uso a mais e nunca chega a zero: o próximo material igual reaproveita o shader.
// São poucos programas distintos (um por combinação de material + luzes), então o custo de memória é pequeno; o teto
// evita crescer sem limite numa sessão muito longa.
export const PIN_LIMIT = 600;

export function pinPrograms(renderer, limit = PIN_LIMIT) {
  const list = renderer && renderer.info && renderer.info.programs;
  if (!list) return 0;
  let pinned = 0;
  let total = 0;
  for (const p of list) {
    if (p.pinned) { total++; continue; }
    if (total >= limit) break;
    p.usedTimes++;
    p.pinned = true;
    pinned++;
    total++;
  }
  return pinned;
}
