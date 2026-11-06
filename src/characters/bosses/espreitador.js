// O ESPREITADOR (id: espreitador) — CHEFE do OUTRO LADO (a primeira dungeon, a Mansão Endiabrada). NÃO é selecionável
// (TODO §5.1: o jogável fica para depois). Wiki "O Espreitador": criatura de Medo de pele cinza enrugada, muitos olhos
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
import raziel from '../raziel.js';

const FEAR = 0xf2c230; // o amarelo dos olhos (Medo usa o amarelo-pálido; aqui é a cor dos olhos da arte)
const GREY = 0x8a8478;
// a Pancada (wiki: ataques desesperados, descoordenados e trêmulos, "causando pouco estrago"): os golpes de garra do
// Raziel com dano baixo e mais alcance (os braços longos). Ele só bate encurralado (pve/espreitador.js, shy).
const slap = (s, name) => ({ ...s, name, element: 'conhecimento', bleed: undefined, damage: Math.round(s.damage * 0.65), range: (s.range ?? 2) + 0.6, hitSound: 'punch', trail: { ...(s.trail || {}), color: GREY } });

export default {
  id: 'espreitador',
  name: 'O ESPREITADOR',
  model: 'espreitador',
  color: '#c8b070',
  origin: 'Outro Lado',
  element: 'conhecimento', // wiki: criatura de Conhecimento com complemento de Medo
  energyColor: FEAR,
  boss: true,
  info: {
    weapon: 'Os braços e dedos longos',
    style: 'Observa de dentro das frestas, drena quem olha para ele e cria cópias de quem ele vê',
    identity: 'A criatura de muitos olhos amarelos que mora nos armários',
    tagline: 'Feche a fresta.',
  },
  // pernas curtas: anda devagar; aguenta mais que um lutador (chefe)
  stats: { moveSpeed: 6.4, attackSpeed: 0.95, size: 1.28, maxHealth: 2100 },
  poise: { hits: 5 }, // chefe: depois de 5 golpes seguidos para de reagir (não fica preso no combo)
  anims: { idle: 'idle_raziel', run: 'run', charge: 'db_charge', victory: 'taunt_roar', block: 'db_block' },
  dodge: { style: 'default', distance: 4.2 },
  defense: { perfectBlock: null },
  ai: { style: 'rush' },

  melee: {
    name: 'Pancada',
    strikes: raziel.melee.strikes.map((s, i) => slap(s, ['Pancada', 'Pancada de volta', 'Braços se debatendo', 'Pancada longa', 'Pancada longa'][i] || 'Pancada')),
    up: slap(raziel.melee.up, 'Dedos de baixo'),
    down: slap(raziel.melee.down, 'Esmagar'),
    forward: slap(raziel.melee.forward, 'Avanço da fresta'),
    back: slap(raziel.melee.back, 'Recua e golpeia'),
    side: slap(raziel.melee.side, 'Braço em giro'),
    air: slap(raziel.melee.air, 'Cair sobre a vítima'),
  },
  abilities: [],
  passives: [],
};
