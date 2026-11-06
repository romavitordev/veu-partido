// A DEGOLIFICADA DE GABRIEL (id: degolificada) — CHEFE do OUTRO LADO (a 2ª dungeon, a Escola Nostradamus). NÃO é
// selecionável COMO CHEFE (a jogável fica no modo de luta). A de INICIAÇÃO (A Ordem Paranormal): o corpo da Agatha Volkomenn com a mente do Gabriel Opspor (wiki
// "Degolificada" e "Gabriel Opspor"). Criatura de MEDO com todos os Elementos; flutua com os membros pendurados e ataca
// com os longos fios de cabelo.
// Habilidades do cânone (controladas pela IA da chefe em src/pve/degolificada.js, por cima da CPU de luta): Pancada,
// Voo, Criatura de Medo, Grito Rasgado, Agarrar e Estrangular, Desfiguramento Capilar e a metamorfose DEVORADORA.
// Enigma de Medo: dizer o nome (GABRIEL) queimando os restos mortais — o Ritual de Passagem.
// A Pancada (wiki: "usando seus cabelos flutuantes ou, até mesmo, seus braços pendentes"): os golpes do Amigo Imaginário
// (clipes ai_*), com os TENTÁCULOS que saem do chão virando o CABELO preto; sem a tinta.
// (2026-11-06) A ficha JOGÁVEL (modo de luta) é characters/degolificada.js; a chefe é a mesma criatura sem o kit (a IA
// da dungeon controla tudo) e com mais vida.
import base from '../degolificada.js';

const { special, awakening, ranged, chargeFx, ...rest } = base;

export default {
  ...rest,
  boss: true,
  info: { ...base.info, style: 'Flutua até a vítima, estrangula com o cabelo e grita; não morre por dano' },
  stats: { moveSpeed: 7.0, attackSpeed: 0.95, size: 1.12, maxHealth: 1900 },
  poise: { hits: 5 },
  dodge: { style: 'default', distance: 4.0 },
  defense: { perfectBlock: null },
  ai: { style: 'rush' },
  abilities: [],
  passives: [],
};
