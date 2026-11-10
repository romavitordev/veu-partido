import { createGLBArena, preloadArena } from './glbArena.js';
import { ORFANATO, SUVACO, COLISEU, SANTO_BERCO, ACAMPAMENTO, IGREJA, PALCO, TIPORA, MANSAO, ESCOLA, MANSAO_LUTA, ESCOLA_LUTA, FERRO_VELHO, CIRCO } from './configs.js';

// cenários do Blender carregados no início do jogo
const GLB_ARENAS = { orfanato: ORFANATO, suvaco: SUVACO, coliseu: COLISEU, santo_berco: SANTO_BERCO, acampamento: ACAMPAMENTO, igreja: IGREJA, palco: PALCO, tipora: TIPORA, mansao_luta: MANSAO_LUTA, escola_luta: ESCOLA_LUTA, ferro_velho: FERRO_VELHO, circo: CIRCO };
export async function preloadArenas() {
  await Promise.all(Object.values(GLB_ARENAS).map((cfg) => preloadArena(cfg).catch((e) => {
    console.warn('Cenário indisponível:', cfg.id, e);
    ARENAS[cfg.id].available = false;
  })));
}

// Registro de cenários. Para adicionar um: monte o cenário no Blender (tools/blender/arena_<id>.py, com peças
// prontas do Kenney via kenney.py), descreva luz/céu/limites em configs.js, registre aqui e coloque o id em ARENA_ORDER.
//  available: false → aparece na seleção como "EM BREVE"
//  colors: [céu, chão, destaque] — usados no cartão da seleção enquanto o preview não fica pronto
//  thumbCamera: { pos, look } — enquadramento da imagem de preview (src/ui/arenaThumbs.js)
export const ARENAS = {
  orfanato: {
    name: 'Orfanato Santa Mega-Freira',
    description: 'O pátio de um casarão antigo num dia nublado: balanços nas árvores, raízes expostas e janelas que observam.',
    colors: ['#c9ccd0', '#6b5a3e', '#e8b860'],
    available: true,
    thumbCamera: { pos: [-10, 2.2, 0], look: [14, 5.5, 0] }, // enquadramento do preview na seleção
    create: () => createGLBArena(ORFANATO),
  },
  suvaco: {
    name: 'Bar Suvaco Seco',
    description: 'Bar de esquina à noite. A luta começa lá dentro, entre a sinuca e o balcão, e pode sair para a calçada.',
    colors: ['#14100c', '#3a2a1a', '#ffb347'],
    available: true,
    thumbCamera: { pos: [7.5, 2.6, 4.5], look: [-4, 1.4, -2] }, // enquadramento do preview na seleção
    create: () => createGLBArena(SUVACO),
  },
  coliseu: {
    name: 'Coliseu',
    description: 'Arena de areia ao entardecer cercada por muralhas e torres em ruínas, com estandartes, braseiros e catapultas destruídas.',
    colors: ['#e8915a', '#c9a46a', '#7a2a1a'],
    available: true,
    thumbCamera: { pos: [12, 2.5, -10], look: [-10, 6, 8] }, // enquadramento do preview na seleção
    create: () => createGLBArena(COLISEU),
  },
  santo_berco: {
    name: 'Santo Berço',
    description: 'A praça do vilarejo dos Luzidios, em frente ao Labirinto Infinito: casas medievais, as estátuas dos Cinco Guardiões e o Símbolo Espiral no chão.',
    colors: ['#f0c890', '#7a5a3a', '#b8a0ff'],
    available: true,
    thumbCamera: { pos: [0, 4.5, 16], look: [0, 3, -30] }, // a praça com o labirinto e as estátuas ao fundo
    create: () => createGLBArena(SANTO_BERCO),
  },
  acampamento: {
    name: 'Acampamento Varminho',
    description: 'Uma clareira no mato à noite, ao lado da estação de TV abandonada de Varminho: fogueira, barracas, a van dos Cinco e um céu cheio de estrelas.',
    colors: ['#0a1430', '#1e2a1c', '#ff8a3a'],
    available: true,
    thumbCamera: { pos: [6, 3.2, 13], look: [-2, 2.5, -20] }, // a fogueira com a van e a torre ao fundo
    create: () => createGLBArena(ACAMPAMENTO),
  },
  igreja: {
    name: 'Igreja Antiga',
    description: 'A base dos Vampiros em Hexatombe: a nave gótica trancada, a mesa do banquete, a Dama da Culpa no altar, a névoa da membrana e a lua de sangue nos vitrais.',
    colors: ['#1a0406', '#2a2220', '#ff2a1a'],
    available: true,
    thumbCamera: { pos: [0, 3.2, 11], look: [0, 4, -16] }, // a nave até o altar
    create: () => createGLBArena(IGREJA),
  },
  palco: {
    name: 'O Palco do Anfitrião',
    description: 'O coliseu roxo dos jogos do Anfitrião: tochas de Energia, uma plateia inteira de Anfitriões e ele mesmo narrando — e mudando as regras no meio da luta.',
    colors: ['#1a0a30', '#3a2450', '#b48cff'],
    available: true,
    thumbCamera: { pos: [0, 4, 15], look: [0, 4, -20] }, // o chão aceso com a arquibancada cheia ao fundo
    create: () => createGLBArena(PALCO),
  },
  tipora: {
    name: 'Ilha de Tipora',
    description: 'O centro do vilarejo de O Segredo na Ilha à noite: casas de tábua, lampiões, a igreja no morro e, ao longe, o mar e o farol.',
    colors: ['#123030', '#b49a78', '#ffb060'],
    available: true,
    thumbCamera: { pos: [-4, 4.5, 15], look: [4, 4, -40] }, // a praça com a igreja à direita e o mar e o farol ao fundo
    create: () => createGLBArena(TIPORA),
  },
  ferro_velho: {
    name: 'Ferro Velho',
    description: 'A base dos Couraças em Hexatombe: o pátio entre pilhas de carcaças no fundo do cânion, a grua com a cabine do Miasma, o portão entre as torres e a lua cheia sobre o paredão.',
    colors: ['#0c1a36', '#6a4a34', '#ff2a1a'],
    available: true,
    thumbCamera: { pos: [3, 3.5, 15], look: [-2, 7, -30] }, // o pátio com o portão, a grua e a lua ao fundo
    create: () => createGLBArena(FERRO_VELHO),
  },
  circo: {
    name: 'Circo dos Psikolera',
    description: 'O velho Circo dos Irmãos Davo, tomado pela banda em Hexatombe: o pátio de terra entre a lona com a entrada em cara de demônio, as barracas de jogos, os canhões e o medidor de força, sob o sol da caatinga.',
    colors: ['#6aa0dc', '#c8a878', '#a82a1e'],
    available: true,
    thumbCamera: { pos: [2, 3, 14], look: [0, 6, -30] }, // a fachada de demônio com a lona listrada atrás
    create: () => createGLBArena(CIRCO),
  },
};

// mapas do OUTRO LADO (PvE): fora da seleção (não entram em ARENA_ORDER) e carregados só ao entrar no modo
export const PVE_ARENAS = { mansao: MANSAO, escola: ESCOLA };
ARENAS.mansao = {
  name: 'Mansão Endiabrada',
  description: 'O território do Espreitador: corredores, armários entreabertos e o relógio parado nas 2:11.',
  colors: ['#020203', '#3e2a1c', '#f2c230'],
  available: true,
  pve: true,
  create: () => createGLBArena(MANSAO),
};
ARENAS.escola = {
  name: 'Escola Nostradamus',
  description: 'O território da Degolificada: o corredor queimado, as salas de aula, a biblioteca e o bunker escondido.',
  colors: ['#020304', '#4e4e4a', '#c8d0c0'],
  available: true,
  pve: true,
  create: () => createGLBArena(ESCOLA),
};
// as salas do Outro Lado como ARENAS DE LUTA (entram na seleção; o mapa inteiro continua só no PvE)
ARENAS.mansao_luta = {
  name: 'Mansão Endiabrada',
  description: 'O quarto principal da mansão do Espreitador: armários entreabertos, a lua nas janelas e o relógio parado nas 2:11.',
  colors: ['#020203', '#3e2a1c', '#f2c230'],
  available: true,
  thumbCamera: { pos: [50, 4.2, 9.2], look: [50, 1, -6] },
  create: () => createGLBArena(MANSAO_LUTA),
};
ARENAS.escola_luta = {
  name: 'Escola Nostradamus',
  description: 'O bunker escondido sob a biblioteca da escola: o círculo do ritual, as velas e as lâmpadas nuas.',
  colors: ['#020304', '#4e4e4a', '#c8d0c0'],
  available: true,
  thumbCamera: { pos: [81, 4.2, 8], look: [81, 0.6, -4] },
  create: () => createGLBArena(ESCOLA_LUTA),
};
export async function preloadPveArena(id) {
  return preloadArena(PVE_ARENAS[id]);
}

export const ARENA_ORDER = ['orfanato', 'suvaco', 'coliseu', 'santo_berco', 'acampamento', 'igreja', 'palco', 'tipora', 'ferro_velho', 'circo', 'mansao_luta', 'escola_luta'];
export const DEFAULT_ARENA = 'ferro_velho';
