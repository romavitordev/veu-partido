// O ESPREITADOR (id: espreitador) — CHEFE do OUTRO LADO (a primeira dungeon, a Mansão Endiabrada). Esta é a versão de CHEFE
// (o jogável está em characters/espreitador.js). Wiki "O Espreitador": criatura de Medo de pele cinza enrugada, muitos olhos
// amarelos cujas pupilas se multiplicam, lágrimas, um OLHO GRANDE dentro da boca, dentes tortos, pernas curtas e braços e
// dedos longos.
// Habilidades do cânone (todas controladas pela IA do chefe em src/pve/espreitador.js, por cima da CPU de luta):
//   Pancada .............. o combo: os braços longos se debatendo, golpes FRACOS mas de alcance grande (aqui embaixo)
//   Drenar Energia ....... o olhar: drena a Sanidade de quem está no campo de visão dele E olhando para ele
//   Correr pelas Frestas . some num armário aberto e sai de outro
//   Cópia Observada ...... gera Devorados (cópias cinzentas de quem ele observa)
//   Fortalecer ........... segura a cabeça de um Devorado e o deixa mais forte
// Enigma de Medo (a fraqueza): sem fresta para voltar, fica APAVORADO — tremendo, lento, toma muito mais dano; o tiro no
// olho da boca acaba com ele (Kaiser, Desconjuração).
// (2026-11-06) A ficha JOGÁVEL (modo de luta) é characters/espreitador.js; o chefe é a mesma criatura sem o kit (a IA
// da dungeon cuida das habilidades) e com mais vida. A Pancada dele bate ainda mais fraco (0,65; a do jogável, 0,8).
import base, { pancada } from '../espreitador.js';

const { special, awakening, chargeFx, ranged, ...rest } = base; // a chefe nunca teve □ (a IA cuida de tudo)

export default {
  ...rest,
  boss: true,
  // pernas curtas: anda devagar; aguenta mais que um lutador (chefe)
  stats: { moveSpeed: 6.4, attackSpeed: 0.95, size: 1.28, maxHealth: 2100 },
  poise: { hits: 5 }, // chefe: depois de 5 golpes seguidos para de reagir (não fica preso no combo)
  dodge: { style: 'default', distance: 4.2 },
  defense: { perfectBlock: null },
  ai: { style: 'rush' },
  melee: pancada(0.65),
  abilities: [],
  passives: [],
};
