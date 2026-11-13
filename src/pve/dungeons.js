// OUTRO LADO — cadastro de dungeons (TODO §4.4: adicionar dungeons sem mexer na progressão; requisitos, restrições e
// chefe de cada uma; sorteio da próxima). Cada dungeon:
//   arena      o mapa próprio (arena/configs.js, feito no Blender)
//   boss       a forma do chefe (characters/forms) — fica fora da seleção NESTA dungeon (restricted)
//   rooms      a sequência do mapa: o que acontece em cada sala, na ordem (ver pve/Dungeon.js)
//   drops      chance e quantidade de cura dos inimigos menores (TODO §4.3: configurável, sem mexer no inimigo)
//   minDepth   a partir de que profundidade ela pode ser sorteada
//   storyOrder ordem cronológica da história, seguindo o lançamento da série; novas fases recebem a posição correta
export const DUNGEONS = {
  espreitador: {
    id: 'espreitador',
    storyOrder: 2,
    name: 'Território do Espreitador',
    place: 'Mansão Endiabrada',
    color: '#f2c230',
    arena: 'mansao',
    boss: 'espreitador',
    bossName: 'O ESPREITADOR',
    restricted: ['espreitador'],
    minDepth: 2,
    drops: { heal: { chance: 0.55, amount: 0.2 } }, // mais drops (pedido do dono, 2026-11-06)
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
      coinsBoss: 12, // moedas da recompensa do chefe
    },
    // os 4 armários do quarto (a fresta por onde ele foge): posição da porta e para onde ela abre
    closets: [
      { x: 44, z: -10.4, face: 0 }, { x: 56, z: -10.4, face: 0 },
      { x: 38.5, z: -6, face: Math.PI / 2 }, { x: 61.5, z: 6, face: -Math.PI / 2 }, // nas paredes laterais (na parede da frente tapariam a câmera)
    ],
  },

  // A 2ª DUNGEON (pedido do dono, 2026-11-06): a ESCOLA NOSTRADAMUS, com corredor e salas de aula — o território da
  // DEGOLIFICADA DE GABRIEL (Iniciação, A Ordem Paranormal). Cânone (wikis "Escola Nostradamus de Ensino Médio",
  // "Gabriel Opspor" e "Degolificada"): o corredor queimado do incêndio, as salas de História, Matemática e Geografia, o
  // laboratório da bomba, a sala de arquivos (a ficha do Gabriel), a biblioteca com a passagem secreta e o BUNKER, onde
  // ela é enfrentada; o bombeiro Jorge virou um Zumbi de Sangue. PROPOSTA: a disposição, o corredor dos fundos, os outros
  // zumbis e onde ficam as pistas. Coordenadas iguais às de tools/blender/arena_escola.py.
  degolificada: {
    id: 'degolificada',
    storyOrder: 1,
    name: 'Território da Degolificada',
    place: 'Escola Nostradamus',
    color: '#c8d0c0',
    arena: 'escola',
    boss: 'degolificada',
    bossName: 'A DEGOLIFICADA',
    restricted: ['degolificada'],
    // a chefe mais branda (bateria de 2026-11-08, 18 personagens sem melhorias: caiu só em 8 de 18 em 180 s, e quem a
    // enfrentou perdeu 72–232% da vida): vida ×0,75 e dano ×0,6 (PROPOSTA; ver Dungeon.startBoss/beginBossFight)
    bossTune: { hp: 0.75, dealt: 0.6 },
    // a NEBLINA (pedido do dono, 2026-11-08): bem fraca nas primeiras salas e mais grossa a cada sala até o chefe
    // (Dungeon.updateMist): a cor e a densidade do FogExp2 vão de `from` a `to` pelo avanço da rota; no chefe, `boss`.
    // A névoa rasteira (fumaça baixa em volta de quem joga) cresce junto.
    mist: { from: { color: 0x0b0e11, density: 0.045 }, to: { color: 0x4a5456, density: 0.085 }, boss: { color: 0x5a6466, density: 0.09 }, wisps: 7 },
    minDepth: 1,
    minions: 'zumbi', // as salas de luta: Zumbis de Sangue (pve/Dungeon.js startZombieEncounter)
    drops: { heal: { chance: 0.5, amount: 0.2 } },
    xp: { zumbi: 18, zumbiForte: 42, boss: 140 },
    exploreHint: 'Explore a escola →',
    deathText: 'VOCÊ CAIU',
    endTitle: ['VOCÊ CAIU NA ESCOLA', 'VOCÊS CAÍRAM NA ESCOLA'], // a tela do fim (sozinho, em dupla)
    killsLabel: 'Zumbis',
    bossDownText: 'A DEGOLIFICADA SE DISSIPOU',
    bossCenter: 81,
    route: { rooms: [3, 5], monsters: [2, 4], stalkWeight: 0.35 },
    start: 'corredor',
    bossModule: 'biblioteca',
    modules: {
      corredor: {
        kind: 'start', floor: 0, title: 'Corredor principal', objective: 'Escolha um caminho',
        rects: [{ minX: -21.6, maxX: -0.3, minZ: -3.95, maxZ: 3.95 }], // largo (2026-11-08): 9 m de parede a parede
        entry: { x: -20.6, z: 0, yaw: Math.PI / 2 },
        exits: {
          left: { x: -8, z: -4.48, face: 0, w: 1.4 },
          front: { x: -0.02, z: 0, face: -Math.PI / 2, w: 2.4 },
          right: { x: -14, z: 4.48, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: -18.6, z: -3.3 }, { x: -1.2, z: 3.3 }],
        drawers: [{ x: -11, y: 0.66, z: -4.15, face: 0, locker: true }, { x: -6, y: 0.66, z: 4.15, face: Math.PI, locker: true }], // os escaninhos (armários que abrem)
      },
      historia: classroom(0, 30, 'Sala de História'),
      matematica: classroom(20, 30, 'Sala de Matemática'),
      geografia: classroom(40, 30, 'Sala de Geografia'),
      laboratorio: {
        kind: 'fight', floor: 0, title: 'Laboratório',
        rects: [{ minX: 0.3, maxX: 11.7, minZ: 50.3, maxZ: 59.7 }],
        entry: { x: 1.0, z: 53.5, yaw: Math.PI / 2, door: { x: 0.02, z: 53.5, face: Math.PI / 2, w: 1.4 } },
        spawn: { x: 8, z: 55 },
        exits: {
          left: { x: 10.6, z: 50.02, face: 0, w: 1.4 },
          front: { x: 11.98, z: 56, face: -Math.PI / 2, w: 1.4 },
          right: { x: 2.0, z: 59.98, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 1.2, z: 51.0 }, { x: 10.8, z: 59.0 }],
        drawers: [{ x: 11.36, y: 0.5, z: 53.2, face: -Math.PI / 2 }],
      },
      arquivos: {
        kind: 'stalk', floor: 0, title: 'Sala de arquivos', objective: 'Escolha uma porta',
        hint: 'A sala de arquivos: as fichas dos alunos nos arquivos de aço (as gavetas abrem) · escolha uma porta',
        rects: [{ minX: 20.3, maxX: 29.7, minZ: 50.9, maxZ: 57.2 }],
        entry: { x: 20.9, z: 52.6, yaw: Math.PI / 2, door: { x: 20.02, z: 52.6, face: Math.PI / 2, w: 1.4 } },
        exits: {
          left: { x: 25.5, z: 50.02, face: 0, w: 1.4 },
          front: { x: 29.98, z: 54, face: -Math.PI / 2, w: 1.4 },
          right: { x: 23.6, z: 57.98, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 28.8, z: 51.4 }, { x: 29.0, z: 56.8 }],
        drawers: [{ x: 21.75, y: 0.54, z: 50.82, face: 0 }, { x: 23.25, y: 0.88, z: 50.82, face: 0 }, { x: 26.25, y: 0.54, z: 50.82, face: 0 }],
      },
      fundos: { // PROPOSTA (não é um lugar citado na wiki): o corredor dos fundos, com o rastro arrastado
        kind: 'stalk', floor: 0, title: 'Corredor dos fundos', objective: 'Siga em frente',
        hint: 'Um rastro de sangue arrastado… escolha uma porta',
        rects: [{ minX: 40.3, maxX: 55.7, minZ: 51.1, maxZ: 56.9 }], // largo (2026-11-08): 7 m
        entry: { x: 41.0, z: 54, yaw: Math.PI / 2, door: { x: 40.02, z: 54, face: Math.PI / 2, w: 1.4 } },
        exits: {
          left: { x: 48, z: 50.52, face: 0, w: 1.4 },
          front: { x: 55.98, z: 54, face: -Math.PI / 2, w: 1.4 },
          right: { x: 44, z: 57.48, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 55.1, z: 51.7 }],
        drawers: [{ x: 51, y: 0.66, z: 57.11, face: Math.PI, locker: true }], // o escaninho no vão da fileira
      },
      // a sala do chefe: a BIBLIOTECA (calma, com o fichário) → a PASSAGEM SECRETA → o BUNKER (a luta começa ao entrar)
      biblioteca: {
        kind: 'boss', floor: 0, title: 'Biblioteca', objective: 'Desça ao bunker',
        hint: 'Uma estante foi arrastada: a PASSAGEM SECRETA leva ao BUNKER · a Degolificada está lá embaixo',
        rects: [
          { minX: 70.3, maxX: 91.7, minZ: -8.7, maxZ: 8.7 }, // o bunker (o 1º: é onde ela volta quando se dissipa)
          { minX: 38.3, maxX: 61.7, minZ: -9.8, maxZ: 9.8 }, // a biblioteca
          { minX: 60.2, maxX: 71.8, minZ: -1.2, maxZ: 1.2 }, // a passagem secreta
          { minX: 90.2, maxX: 103.6, minZ: -1.1, maxZ: 1.1 }, // a saída do bunker
        ],
        entry: { x: 39.3, z: 0, yaw: Math.PI / 2, door: { x: 38.02, z: 0, face: Math.PI / 2, w: 2.5 } },
        spawn: { x: 82, z: 0 },
        bossTrigger: { x: 71.5 },
        exits: {},
        chests: [{ x: 40.2, z: 8.8 }, { x: 90.6, z: -7.4 }],
        // o FICHÁRIO da biblioteca
        drawers: [{ x: 49.4, y: 0.62, z: -9.25, face: 0 }, { x: 49.8, y: 0.3, z: -9.25, face: 0 }, { x: 50.2, y: 0.94, z: -9.25, face: 0 }, { x: 50.6, y: 0.62, z: -9.25, face: 0 }],
      },
    },
    exit: { door: { x: 92.6, z: 0 } },
    locks: { chance: 0.4, vault: 0.5, luck: 0.6, drawerCoins: 0.35, coins: [4, 9] },
    chests: {
      chance: { start: 0.7, stalk: 0.9, boss: 1, fight: [0, 0, 0.45, 0.65, 0.9] },
      coinsBoss: 14,
    },
    // o ENIGMA DE MEDO (pedido do dono, 2026-11-06): ela luta com o ESCUDO DE MEDO; as CAIXAS do bunker só quebram com
    // a investida dela, e de dentro saem as 3 PROVAS (cada uma tira um terço do escudo). As provas são objetos do cânone;
    // estarem nas caixas é PROPOSTA. As últimas caixas sempre têm as que faltam (nunca trava).
    enigma: {
      name: 'GABRIEL',
      clues: ['O CARTÃO SD DA CÂMERA', 'A FICHA DO GABRIEL', 'A FOTO DO GABRIEL COM A LINA'],
      clueHints: [
        'A gravação daquela noite: o "Gabriel" mata a Agatha no bunker… e o corpo dela se levanta',
        'A ficha do Gabriel Opspor: ele investigava os sumiços das alunas e tinha certeza de que era a Agatha',
        'Gabriel e a namorada, Lina. Quem está no corpo da Agatha procura por ela',
      ],
      proofChance: 0.5,
      // as caixas de mantimentos no bunker (longe do círculo do ritual, onde ela nasce)
      boxes: [
        { x: 75, z: -5.4 }, { x: 75, z: 5.4 }, { x: 80, z: -6.9 }, { x: 80, z: 6.9 },
        { x: 86.4, z: -6.2 }, { x: 86.4, z: 6.2 }, { x: 88.6, z: 1.2, yaw: 0.4 }, { x: 73.4, z: -2.8, yaw: 0.2 },
      ],
    },
  },
};

// uma sala de aula da Escola Nostradamus (12 × 10, a partir de x0, z0): a porta de entrada no oeste, o quadro e a mesa do
// professor no oeste, as carteiras em dois blocos e o meio livre para a luta (tools/blender/arena_escola.py classroom)
function classroom(x0, z0, title) {
  return {
    kind: 'fight', floor: 0, title,
    rects: [{ minX: x0 + 0.3, maxX: x0 + 11.7, minZ: z0 + 0.3, maxZ: z0 + 9.7 }],
    entry: { x: x0 + 1.0, z: z0 + 2.5, yaw: Math.PI / 2, door: { x: x0 + 0.02, z: z0 + 2.5, face: Math.PI / 2, w: 1.4 } },
    spawn: { x: x0 + 9, z: z0 + 5 },
    exits: {
      left: { x: x0 + 6.6, z: z0 + 0.02, face: 0, w: 1.4 },
      front: { x: x0 + 11.98, z: z0 + 5, face: -Math.PI / 2, w: 1.4 },
      right: { x: x0 + 5.4, z: z0 + 9.98, face: Math.PI, w: 1.4 },
    },
    chests: [{ x: x0 + 1.1, z: z0 + 1.0 }, { x: x0 + 11.2, z: z0 + 3.6 }],
    drawers: [{ x: x0 + 2.12, y: 0.5, z: z0 + 6.5, face: Math.PI / 2 }, { x: x0 + 2.12, y: 0.5, z: z0 + 7.1, face: Math.PI / 2 }], // a mesa do professor
  };
}

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

export const DUNGEON_ORDER = Object.values(DUNGEONS)
  .sort((a, b) => a.storyOrder - b.storyOrder)
  .map((dungeon) => dungeon.id);

// DIFICULDADE (TODO §4.5: o chefe desafia mesmo no Fácil): CPU e multiplicadores do inimigo
// AJUSTE POR PERSONAGEM SÓ NO OUTRO LADO (pedido do dono, 2026-11-06: "os personagens precisam ser ajustados pra esse
// modo"): o kit de luta 1×1 foi equilibrado contra UM adversário; na dungeon o jogador enfrenta salas de 2–4 monstros e
// um chefe. Quem fica para trás aqui ganha dano (dealt) e/ou resistência (taken < 1) — não muda nada no modo de luta.
// Valores medidos pela bateria (CPU Difícil no lugar do jogador, 3 amostras: sala de 3 monstros + chefe). PROPOSTA.
// Referência (Joui, Agatha, Veríssimo, Kian, Nubi, Guizo): sala em ~40 s com ~33% da vida perdida; chefe em ~107 s.
// 2026-11-08: a CPU da bateria ignorava os monstros da sala com mais de 120 de vida enquanto o Devorado ficava escondido
// (corrigido em ai/CpuController.js) — boa parte destes reforços compensava isso. Remedido SEM os ajustes (Espreitador,
// 2 amostras): os 10 limpam as salas em 36–77 s e derrubam o chefe em 19 de 20; os ajustes caíram pela metade e saíram
// os que já passavam folgado (Celestine 68 s no chefe; Chico, Deus da Morte)
export const PVE_CHAR_TUNE = {
  anfitriao: { dealt: 1.2 }, // sem ajuste: sala 63 s, chefe 136 s
  morato: { dealt: 1.25, taken: 0.9 }, // sem ajuste: sala 77 s (a mais lenta), chefe 167 s
  amalia: { dealt: 1.2, taken: 0.85 }, // sem ajuste: sala 73 s com 72% da vida
  kaiser: { dealt: 1.1 }, // sem ajuste: sala 62 s
  kemi: { dealt: 1.1, taken: 0.9 }, // sem ajuste: sala 55 s com 66% da vida | Escola (3 amostras): chefe caiu 1 de 3, 169 s
  chico: { dealt: 1.1 }, // Escola, 3 amostras (2026-11-08): chefe caiu 1 de 3, 171 s, perdeu 59% da vida
  arnaldo: { dealt: 1.1 }, // Escola, 3 amostras (2026-11-08): chefe caiu 1 de 3, 178 s, perdeu 58% da vida
  magistrada: { dealt: 1.1, taken: 0.9 }, // sem ajuste: chefe 155 s
  rubens: { dealt: 1.1, taken: 0.85 }, // sem ajuste: chefe 173 s com 138% da vida (caiu 1 de 2)
};

export function charTune(id) {
  return PVE_CHAR_TUNE[id] || null;
}

// DIFICULDADES (pedido do dono, 2026-11-12: "fases estão muito fáceis, no normal pelo menos; deve ter Super Difícil e
// Aniquilação"). hp/dealt: vida e dano dos inimigos e do chefe; coin: multiplica as moedas (drops e recompensa do chefe);
// rage: o chefe entra em FÚRIA mais cedo; counter: quantos golpes seguidos o chefe aguenta antes de REPELIR (anti-spam,
// pve/bossRules.js). warnMult: quanto tempo os olhos avisam antes do bote do Espreitador. PROPOSTA: os números.
export const PVE_DIFFICULTIES = {
  easy: { label: 'Fácil', cpu: 'normal', minion: 'normal', hp: 1, dealt: 0.95, drop: 1.2, warnMult: 1.25, coin: 0.7, counter: 9 },
  normal: { label: 'Normal', cpu: 'veryhard', minion: 'hard', hp: 1.25, dealt: 1.3, drop: 1, warnMult: 0.9, coin: 1, counter: 7 },
  hard: { label: 'Difícil', cpu: 'veryhard', minion: 'veryhard', hp: 1.55, dealt: 1.65, drop: 0.85, warnMult: 0.7, coin: 1.4, counter: 6 },
  superhard: { label: 'Super Difícil', cpu: 'superhard', minion: 'veryhard', hp: 1.9, dealt: 2.05, drop: 0.7, warnMult: 0.55, coin: 1.9, counter: 5, rage: true },
  annihilation: { label: 'Aniquilação', cpu: 'superhard', minion: 'superhard', hp: 2.4, dealt: 2.6, drop: 0.55, warnMult: 0.45, coin: 2.6, counter: 4, rage: true, annihilation: true },
};

// a ordem das dificuldades: ao terminar TODAS as dungeons ainda não jogadas, a tentativa volta à primeira um degrau acima
// (pedido do dono, 2026-11-05); depois da Aniquilação sobe o "calor" (+1, +2…: +20% de vida e dano cada)
export const DIFF_ORDER = ['easy', 'normal', 'hard', 'superhard', 'annihilation'];
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
