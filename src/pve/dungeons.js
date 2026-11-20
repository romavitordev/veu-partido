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
    thumb: { from: 'mansao_luta' }, // a prévia na ESCOLHA A FASE
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
    // monsters [2, 3] (2026-11-14, bateria da fase inteira `dev/phaseBattery.js`, 6 personagens): com até 4 cópias a
    // fase levava ~590 s (Escola ~300 s, Torre ~320 s) e a vida da CPU voltou 7× em média (dano 775%): cada cópia do
    // Devorado é um lutador inteiro, 72 s por sala de luta contra 16–32 s nas outras fases
    route: { rooms: [5, 6], monsters: [2, 3], stalkWeight: 0.35 }, // FASES SEPARADAS (2026-11-14): mais salas (PROPOSTA)
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
    thumb: { from: 'escola_luta' }, // a prévia na ESCOLHA A FASE (o bunker, já renderizado para a escolha de mapa)
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
    route: { rooms: [5, 6], monsters: [2, 4], stalkWeight: 0.35 }, // FASES SEPARADAS (2026-11-14): mais salas (PROPOSTA)
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
      // o PÁTIO DA CANTINA (pedido do dono, 2026-11-16: "um pátio com pilastras, mesas de cantina"; PROPOSTA: o claustro
      // do antigo mosteiro): sala de luta grande (20 × 16) com duas fileiras de pilastras para lutar em volta
      patio: {
        kind: 'fight', floor: 0, title: 'Pátio da cantina',
        rects: [{ minX: 0.3, maxX: 19.7, minZ: -35.7, maxZ: -20.3 }],
        entry: { x: 1.2, z: -28, yaw: Math.PI / 2, door: { x: 0.02, z: -28, face: Math.PI / 2, w: 1.4 } },
        spawn: { x: 14, z: -28 },
        exits: {
          left: { x: 10, z: -35.98, face: 0, w: 1.4 },
          front: { x: 19.98, z: -28, face: -Math.PI / 2, w: 1.4 },
          right: { x: 10, z: -20.02, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 1.1, z: -35.0 }, { x: 18.6, z: -21.0 }],
        drawers: [{ x: 18.74, y: 0.55, z: -31.6, face: -Math.PI / 2 }, { x: 18.74, y: 0.55, z: -33.6, face: -Math.PI / 2 }], // o balcão
      },
      // o ALMOXARIFADO SEM SAÍDA (pedido do dono, 2026-11-16: "só tem a porta por onde você veio, você pega o loot dela e
      // volta pra sala anterior para ir para a próxima"): kind 'stash' (Dungeon.enterModule): não conta como sala da rota,
      // a única porta (`back`, a da entrada) leva de volta à sala anterior, com as portas que ela tinha
      almoxarifado: {
        kind: 'stash', floor: 0, title: 'Almoxarifado', objective: 'Pegue o que quiser e volte',
        weight: 0.45, // sai menos que uma sala comum (PROPOSTA)
        hint: 'O almoxarifado não tem outra saída: pegue o que quiser e VOLTE pela porta',
        rects: [{ minX: 26.3, maxX: 33.7, minZ: -31.7, maxZ: -25.3 }],
        entry: { x: 27.2, z: -28.5, yaw: Math.PI / 2 },
        exits: { back: { x: 26.02, z: -28.5, face: Math.PI / 2, w: 1.4 } },
        chests: [{ x: 27.0, z: -26.1 }, { x: 32.5, z: -27.6 }, { x: 31.0, z: -30.6 }],
        drawers: [{ x: 27.15, y: 0.5, z: -31.24, face: 0 }, { x: 27.65, y: 0.95, z: -31.24, face: 0 }], // o arquivo do zelador
      },
      // a SALA DOS PROFESSORES (PROPOSTA; ideias do TODO, 2026-11-16): a mesa de reunião no meio, os escaninhos e o sofá
      professores: {
        kind: 'fight', floor: 0, title: 'Sala dos professores',
        rects: [{ minX: 40.3, maxX: 51.7, minZ: -31.7, maxZ: -22.3 }],
        entry: { x: 41.2, z: -29.5, yaw: Math.PI / 2, door: { x: 40.02, z: -29.5, face: Math.PI / 2, w: 1.4 } },
        spawn: { x: 49, z: -27 },
        exits: {
          left: { x: 46.6, z: -31.98, face: 0, w: 1.4 },
          front: { x: 51.98, z: -27, face: -Math.PI / 2, w: 1.4 },
          right: { x: 45.4, z: -22.02, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 41.0, z: -23.0 }, { x: 51.2, z: -30.4 }],
        drawers: [{ x: 41.0, y: 0.6, z: -31.47, face: 0 }, { x: 42.2, y: 1.1, z: -31.47, face: 0 }, { x: 42.8, y: 0.6, z: -31.47, face: 0 }], // os escaninhos
      },
      // o BANHEIRO (PROPOSTA): corredor de passagem, sem luta, com o espelho trincado e a escrita na parede
      banheiro: {
        kind: 'stalk', floor: 0, title: 'Banheiro', objective: 'Escolha uma porta',
        hint: 'O espelho está trincado… e alguém escreveu na parede · escolha uma porta',
        rects: [{ minX: 58.3, maxX: 67.7, minZ: -31.7, maxZ: -24.3 }],
        entry: { x: 59.0, z: -28, yaw: Math.PI / 2, door: { x: 58.02, z: -28, face: Math.PI / 2, w: 1.4 } },
        exits: {
          left: { x: 65, z: -31.98, face: 0, w: 1.4 },
          front: { x: 67.98, z: -28, face: -Math.PI / 2, w: 1.4 },
          right: { x: 66.8, z: -24.02, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 67.2, z: -24.9 }],
        drawers: [],
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
  // A ILHA DE TIPORA — a 1ª FASE DE ONDAS (pedido do dono, 2026-11-18/19: "o player fica numa arena derrotando monstros
  // que vão vindo e a cada X ondas vem um boss, um bicho mais forte sozinho para ele derrotar"; "essas fases de ondas
  // como treb ciach e ilha de tipora serão fases do modo outro lado, e terá uma explicação de como funciona a fase,
  // tanto no menu de seleção quanto na propria fase"). Sem salas nem portas: o mapa aberto da praça (arena 'tipora').
  // Cânone (wiki "O Segredo na Ilha"): os Zumbis de Sangue, os cachorros e javalis infectados e o AMIGO IMAGINÁRIO são
  // as criaturas da ilha. PROPOSTA: as ondas só de Zumbis de Sangue (cachorros e javalis precisam de modelo), o ZUMBI
  // GIGANTE como minichefe a cada 3 ondas, o Amigo Imaginário na onda final e as quantidades por dificuldade.
  // O Segredo na Ilha (2021) vem antes de Sinais do Outro Lado (2022): entra entre a Mansão e a Torre.
  tipora: {
    id: 'tipora',
    storyOrder: 2.5,
    name: 'Proteja a Ilha de Tipora', // (dono, 2026-11-19: "Ao invés de Ondas de Tipora chame algo como 'Proteja a Ilha de Tipora'")
    place: 'Ilha de Tipora',
    thumb: { from: 'tipora' }, // a prévia na ESCOLHA A FASE (a do mapa de luta, já renderizada na escolha de mapa)
    color: '#7ad0b8',
    arena: 'tipora',
    boss: 'amigo',
    bossName: 'O AMIGO IMAGINÁRIO',
    // o Amigo continua escolhível (a seleção vem antes da fase; restringir aqui o tiraria do Outro Lado inteiro)
    restricted: [],
    // a FASE DE ONDAS (Dungeon.startWaves): `count` = quantas ondas por dificuldade (a última é o chefe); a cada
    // `bossEvery` ondas vem o minichefe sozinho; `rest` = o respiro entre as ondas (s); `spawnRadius` = onde nascem
    waves: {
      count: { easy: 7, normal: 9, hard: 10, superhard: 12, annihilation: 13 },
      bossEvery: 3, chestEvery: 2, chestFade: 6,
      rest: 4.5,
      firstDelay: 6,
      spawnRadius: 13,
      giantHp: 900,
    },
    // a explicação (pedido do dono): no card da ESCOLHA A FASE e no aviso do começo da fase
    about: 'FASE DE ONDAS: um mapa aberto, sem salas. Os infectados da ilha chegam em ondas pela praça — Zumbis de Sangue e de Tinta, javalis, cobras e lobos; a cada 3 ondas vem um ZUMBI GIGANTE sozinho, e na última, o AMIGO IMAGINÁRIO, que na fúria chama mais bichos.',
    aboutShort: 'Fase de ONDAS: proteja a praça dos infectados da ilha; a cada 3 ondas um gigante, e na última o Amigo Imaginário',
    // as DICAS do rodapé da tela de carregamento (dono, 2026-11-19): a explicação da fase em pedaços curtos
    tips: [
      '<b>Fase de ondas:</b> não há salas nem portas. Os infectados da ilha chegam em ondas pela praça.',
      'Zumbis de Sangue e de Tinta, javalis, cobras e lobos: fique de olho em quem vem pelas suas costas.',
      'A cada 3 ondas vem um <b>ZUMBI GIGANTE</b> sozinho. Use o respiro entre as ondas para se recuperar.',
      'Na última onda vem o <b>AMIGO IMAGINÁRIO</b>. Na fúria, ele chama mais bichos.',
    ],
    minDepth: 2, // a força dos inimigos de uma fase do meio da história (a Mansão)
    minions: 'zumbi',
    drops: { heal: { chance: 0.45, amount: 0.18 } },
    xp: { zumbi: 16, zumbiForte: 38, tinta: 22, javali: 26, cao: 14, cobra: 18, gigante: 90, boss: 160 },
    exploreHint: 'Prepare-se: a 1ª onda já vem',
    deathText: 'VOCÊ CAIU',
    endTitle: ['VOCÊ CAIU EM TIPORA', 'VOCÊS CAÍRAM EM TIPORA'],
    killsLabel: 'Zumbis',
    bossDownText: 'O AMIGO IMAGINÁRIO CAIU',
    route: { rooms: [0, 0], monsters: [0, 0] },
    start: 'praca',
    bossModule: 'praca',
    modules: {
      praca: {
        kind: 'waves', floor: 0, title: 'Praça', objective: 'Sobreviva às ondas',
        // sem `rects`: vale o limite redondo da arena (raio 17)
        entry: { x: 0, z: 9, yaw: Math.PI },
        spawn: { x: 0, z: -9 }, // onde o chefe aparece
        exits: {},
        chests: [{ x: -7, z: 4 }, { x: 7, z: 4 }, { x: 0, z: -6 }],
        drawers: [],
      },
    },
    exit: { door: { x: 60, z: 0, hidden: true } }, // sem porta: depois da recompensa a fase acaba (Dungeon.unlockExit)
    chests: { chance: { waves: 0 }, coinsBoss: 16 },
  },
  // A NOITE DO SAMHAIN EM TREB CIACH — a 2ª FASE DE ONDAS (A Vigília ep. 3; dono, 2026-11-18: "o player protegeria das
  // assombrações e protegeria a vila, tentando impedir que o numero de aldeões vivos chegue a zero"; a fase em 3 partes:
  // a praça da Chama de Proteção, o corredor das lamparinas e a Árvore Anciã). Esta é a PARTE 1, a praça: ondas de
  // ASSOMBRAÇÕES fantasiadas (combat/assombracao.js) indo atrás de quem joga e das CASAS (pve/samhain.js: a lamparina da
  // porta e os aldeões de dentro); a cada 3 ondas a ASSOMBRAÇÃO DE BROÉN sozinha (PROPOSTA: a do aldeão que atacou o
  // filho) e, no fim, a TEMPESTADE com a leva enorme. As partes 2 e 3 ainda não existem: vencida a leva, a fase acaba.
  // A Vigília (2025) é a série mais nova: depois do Estrangeiro. PROPOSTA: tudo o que é número.
  samhain: {
    id: 'samhain',
    storyOrder: 4,
    name: 'Proteja Treb Ciach',
    place: 'Treb Ciach',
    thumb: { from: 'treb_ciach_tempestade' },
    color: '#ffd84a',
    // a noite da TEMPESTADE nas três partes (dono, 2026-11-19: "o mapa está no de dia e não o pós tempestade, deveria ser
    // o da tempestade, as 3 partes em tempestade")
    arena: 'treb_ciach_tempestade',
    chestSkin: 'vigilia', // os baús da vila são as caixas de suprimentos da Vigília (pve/pickups.js Chest)
    boss: null, // sem chefe-lutador: a última onda é a TEMPESTADE (Dungeon.startWave kind 'storm')
    bossName: 'AS ASSOMBRAÇÕES',
    restricted: [],
    waves: {
      foes: 'samhain',
      // a VILA dura mais (dono, 2026-11-19: "a primeira parte tem que durar um pouco mais … O player tem que conseguir
      // upar o maximo possivel na parte 1"): duas ondas a mais; é a única parte com XP de abate e baús
      count: { easy: 8, normal: 9, hard: 10, superhard: 11, annihilation: 12 },
      bossEvery: 3, chestEvery: 2, chestFade: 6,
      rest: 6, // um respiro maior: dá tempo de reacender as lamparinas
      firstDelay: 8,
      spawnRadius: 21,
      bounds: 23, // a praça AMPLIADA até as portas das casas (o mapa de luta para no raio 18,5)
      village: true,
      runner: true, // vencida a tempestade: o corredor das lamparinas (pve/corredor.js) até a Árvore Anciã
      giant: 'broen', giantName: 'A ASSOMBRAÇÃO DE BROÉN', giantHp: 950,
    },
    about: 'FASE DE ONDAS em 3 partes: defenda as casas da vila das ASSOMBRAÇÕES, fuja pelo CORREDOR DAS LAMPARINAS e proteja o ALÇAPÃO da Árvore Anciã, onde os aldeões se esconderam.',
    aboutShort: 'Fase de ONDAS: proteja as casas e os aldeões das Assombrações, aguente a tempestade, fuja pelo corredor e defenda os aldeões escondidos na Árvore Anciã',
    tips: [
      '<b>1ª parte, a vila:</b> as Assombrações vão atrás de você e das CASAS. Se a lamparina de uma porta apagar, os aldeões de dentro morrem.',
      'Fique parado perto de uma porta para <b>reacender a chama</b> da lamparina.',
      'Se não sobrar nenhum aldeão vivo na vila, você perde. A cada 3 ondas vem a <b>Assombração de Broén</b>; no fim, a TEMPESTADE.',
      '<b>Suba o máximo de níveis na vila:</b> é a única parte com XP dos abates e com baús. Na Árvore você luta com o que juntou.',
      '<b>2ª parte, o corredor:</b> o personagem corre sozinho. Desvie das faixas vermelhas e das pedras para os lados (←/→ ou o joystick) e com a esquiva.',
      'No corredor, passe rente às <b>lamparinas</b> para acendê-las: cada uma acesa enfraquece um pouco as Assombrações da Árvore.',
      'As <b>brasas da Chama</b> brilham nas beiradas do corredor, bem onde as Assombrações dão o bote: cada uma dá XP. Os níveis ficam guardados e você os resgata ao chegar na Árvore.',
      '<b>3ª parte, a Árvore Anciã:</b> proteja o ALÇAPÃO do arsenal. A barra no topo mostra quão seguros estão os aldeões escondidos.',
      'A porta se recupera um pouco entre as ondas. Na Árvore não há XP nem baús, e a cura cai menos: guarde vida para o fim.',
      '<b>Itens da Vigília (só na Árvore):</b> de tempos em tempos um aldeão sai do alçapão, larga um item no chão (a coluna de luz) e volta. Passe por cima para pegar.',
      'Derrame o <b>COMBUSTÍVEL</b> (□/tiro) perto do alçapão e encoste a <b>TOCHA</b> na poça: o fogo vira uma barreira que as Assombrações não atravessam e que as queima. Ele fica aceso até você acender a lanterna.',
      'Depois do primeiro fogo vem a <b>LANTERNA DO CRÂNIO DE PORCO</b>: acenda no fogo e arremesse (□/tiro). O clarão ofusca as Assombrações em volta.',
    ],
    minDepth: 3,
    minions: 'zumbi',
    drops: { heal: { chance: 0.45, amount: 0.18 } },
    xp: { assombracao: 24, assombracaoForte: 55, gigante: 130, boss: 160 }, // só na vila: na Árvore abate não dá XP
    exploreHint: 'Prepare-se: as Assombrações vêm da névoa',
    deathText: 'VOCÊ CAIU',
    endTitle: ['VOCÊ CAIU EM TREB CIACH', 'VOCÊS CAÍRAM EM TREB CIACH'],
    killsLabel: 'Assombrações',
    bossDownText: 'A TEMPESTADE PASSOU',
    wonText: 'A Árvore Anciã resistiu',
    route: { rooms: [0, 0], monsters: [0, 0] },
    start: 'praca',
    bossModule: 'praca',
    modules: {
      praca: {
        kind: 'waves', floor: 0, title: 'Praça da Chama', objective: 'Proteja as casas',
        entry: { x: 0, z: 9, yaw: Math.PI },
        spawn: { x: 0, z: -12 },
        exits: {},
        chests: [{ x: -9, z: 6 }, { x: 9, z: 6 }, { x: 0, z: -10 }],
        drawers: [],
      },
    },
    exit: { door: { x: 80, z: 0, hidden: true } },
    chests: { chance: { waves: 0 }, coinsBoss: 18 },
  },
  // O SERTÃO DO QUIBUNGO — a 3ª FASE DE ONDAS (Hexatombe ep. 5: o morro da caatinga onde armaram a emboscada para o
  // Quibungo; mapa `sertao`, v5.38.0). Dono, 2026-11-20: "virão ondas de animais afetados pelo sangue, araras devoradas
  // e (monstruosas em dificuldades maiores) … e na ultima onda virá o boss Quimbungo"; "Os infernais só virão na
  // dificuldade Aniquilação". O bestiário é canon (wiki "Araras Devoradas" e "Felinos Devorados": os animais da Coroa
  // de Espinhos tomados pelo Sangue; a variante INFERNAL de cada um). EM PRODUÇÃO (`hidden`): faltam os modelos da
  // Arara, do Felino e do Quibungo. PROPOSTA: tudo o que é número.
  sertao: {
    id: 'sertao',
    hidden: true,
    storyOrder: 3.5, // Hexatombe (2025): antes de A Vigília
    name: 'Sertão do Quibungo',
    place: 'Coroa de Espinhos',
    thumb: { from: 'sertao' },
    color: '#ff4a2a',
    arena: 'sertao',
    boss: null, // o Quibungo é um bicho (Dungeon.startWave kind 'beastBoss'), não um lutador
    bossName: 'O QUIBUNGO',
    restricted: [],
    waves: {
      foes: 'sertao',
      count: { easy: 7, normal: 8, hard: 9, superhard: 10, annihilation: 11 },
      bossEvery: 3, chestEvery: 2, chestFade: 6,
      rest: 5,
      firstDelay: 6,
      spawnRadius: 15,
      giantHp: 700, lanterns: true,
    },
    about: 'FASE DE ONDAS no morro da caatinga: os animais da Coroa de Espinhos tomados pelo Sangue chegam em ondas — ARARAS DEVORADAS dão rasantes do céu e FELINOS DEVORADOS cercam pelo chão. Na última onda vem o QUIBUNGO. No Aniquilação, as variantes INFERNAIS.',
    aboutShort: 'Fase de ONDAS: aguente as Araras e os Felinos Devorados no alto do morro; na última onda, o Quibungo',
    tips: [
      '<b>Fase de ondas:</b> os animais da caatinga tomados pelo Sangue chegam pelo mato em volta do morro.',
      'As <b>ARARAS DEVORADAS</b> voam alto e descem num RASANTE: esquive na hora em que mergulham e bata quando pousam.',
      'As <b>LAMPARINAS DO CRISTINO</b> estão acesas pelo morro: passe por cima para pegar e arremesse nos bichos — estoura e deixa fogo no chão. Acerta as Araras no ar.',
      'Os <b>FELINOS DEVORADOS</b> andam em bando e dão o bote com a língua. Não deixe que cerquem você.',
      'Na última onda vem o <b>QUIBUNGO</b>: mais de três metros, quatro braços e uma bocarra nas costas.',
      'No <b>Aniquilação</b> vêm as variantes INFERNAIS, mais fortes.',
    ],
    minDepth: 3,
    minions: 'zumbi',
    drops: { heal: { chance: 0.45, amount: 0.18 } },
    xp: { araraDevorada: 20, felinoDevorado: 24, araraInfernal: 40, felinoInfernal: 48, gigante: 90, boss: 180 },
    exploreHint: 'Prepare-se: o mato se mexe',
    deathText: 'VOCÊ CAIU',
    endTitle: ['VOCÊ CAIU NO SERTÃO', 'VOCÊS CAÍRAM NO SERTÃO'],
    killsLabel: 'Devorados',
    bossDownText: 'O QUIBUNGO CAIU',
    route: { rooms: [0, 0], monsters: [0, 0] },
    start: 'morro',
    bossModule: 'morro',
    modules: {
      morro: {
        kind: 'waves', floor: 0, title: 'Alto do Morro', objective: 'Sobreviva às ondas',
        entry: { x: 0, z: 9, yaw: Math.PI },
        spawn: { x: 0, z: -11 }, // por onde o Quibungo sobe (a trilha)
        exits: {},
        chests: [{ x: -6, z: 2 }, { x: 6, z: 3 }, { x: 0, z: -6 }],
        drawers: [],
      },
    },
    exit: { door: { x: 70, z: 0, hidden: true } },
    chests: { chance: { waves: 0 }, coinsBoss: 18 },
  },
  // TORRE DA TV VARMINHO (pedido do dono, 2026-11-13: "a nova fase do Outro Lado: Torre de Transmissão, onde o boss será
  // o Estrangeiro"; estudo em docs/TORRE-TRANSMISSAO.md). Lançada na v4.42.0 (dev: B = await
  // import('/src/dev/pveBattery.js'); B.run(['joui'], 1, 'estrangeiro')).
  // Inimigos (dono, 2026-11-13: "canônicas + Interflorados"): os Doppelgangers Civis (pistola de plasma), Combatentes
  // (mais vida, no soco) e em forma monstruosa (o laboratório do 4º), e os Interflorados que saem dos casulos dos Becos.
  // Minibosses sorteados por sala: o Rastropoda e o Bilu (pve/alheioMinis.js).
  estrangeiro: {
    id: 'estrangeiro',
    storyOrder: 3, // Sinais do Outro Lado (2022): depois das outras duas
    name: 'Território do Estrangeiro',
    place: 'Torre da TV Varminho',
    thumb: { arena: 'torre', pos: [73, 3.2, 9], look: [88, 1.6, -3], focus: [82, 0] }, // a prévia na ESCOLHA A FASE
    color: '#8acf4a',
    arena: 'torre',
    boss: 'estrangeiro',
    bossName: 'O ESTRANGEIRO',
    restricted: ['estrangeiro'],
    bossTune: { hp: 0.85, dealt: 0.7 }, // PROPOSTA (sem bateria ainda)
    mist: { from: { color: 0x050806, density: 0.04 }, to: { color: 0x1e3a22, density: 0.075 }, boss: { color: 0x2a4a2a, density: 0.07 }, wisps: 6 },
    minDepth: 3, // a 3ª da história: só depois da Escola e da Mansão
    minions: 'alheios', // pve/Dungeon.js startAlheioEncounter
    models: ['doppel', 'interflorado'],
    drops: { heal: { chance: 0.5, amount: 0.2 } },
    xp: { zumbi: 18, zumbiForte: 42, boss: 160 },
    exploreHint: 'Suba a torre →',
    deathText: 'VOCÊ CAIU',
    endTitle: ['VOCÊ CAIU NA TORRE', 'VOCÊS CAÍRAM NA TORRE'],
    killsLabel: 'Alheios',
    bossDownText: 'O ESTRANGEIRO SUMIU NA INTERFERÊNCIA',
    bossCenter: 82,
    route: { rooms: [7, 9], monsters: [2, 4], stalkWeight: 0.35 }, // FASES SEPARADAS (2026-11-14): mais salas (PROPOSTA)
    // os MINIBOSSES sorteados (pedido do dono, 2026-11-13: "aparecem em salas diferentes e têm chance de aparecer, não é
    // sempre"; pve/alheioMinis.js): a chance de cada sala, no máximo uma vez por tentativa. PROPOSTA: os números.
    // SEMPRE (dono, 2026-11-14: "sempre acontecer 1x cada mini boss na fase do Estrangeiro e no final o Boss, mas ser
    // aleatório quando vai vir"): `always` sorteia em que sala da rota cada um vem (Dungeon.scheduleMinis); `rooms` diz
    // onde cada um pode aparecer
    minibosses: {
      always: true,
      rastropoda: { rooms: { analise: 0.65, laboratorio: 0.3, casulos: 0.2, armarios: 0.25 } },
      bilu: { rooms: { escuro: 0.75, becos: 0.35, fusca: 0.3 } },
    },
    start: 'recepcao',
    bossModule: 'sino',
    modules: {
      recepcao: {
        kind: 'start', floor: 0, title: 'Recepção', objective: 'Escolha um caminho',
        rects: [{ minX: -21.6, maxX: -0.3, minZ: -5.7, maxZ: 5.7 }],
        entry: { x: -20.6, z: 0, yaw: Math.PI / 2 },
        exits: {
          left: { x: -4, z: -6.0, face: 0, w: 1.4 },
          front: { x: -0.02, z: 0, face: -Math.PI / 2, w: 2.0 },
          right: { x: -14, z: 6.0, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: -20.8, z: -2.2 }, { x: -1.2, z: 4.6 }],
        drawers: [{ x: -9.5, y: 0.66, z: 1.0, face: Math.PI }], // a gaveta do balcão da Regina
      },
      seguranca: torreRoom(0, 30, 'Sala de segurança', { front: 38, foes: 'doppel' }),
      editorial: torreRoom(20, 30, 'Escritório editorial', { foes: 'doppel' }),
      estudio: torreRoom(40, 30, 'Estúdio do apresentador', { front: 38.8, foes: 'doppel' }),
      laboratorio: torreRoom(0, 50, 'Laboratório de análises', { foes: 'monstro' }),
      casulos: torreRoom(20, 50, 'Os Becos: sala dos casulos', { foes: 'casulos' }),
      armarios: torreRoom(40, 50, 'Os Becos: sala dos armários', { foes: 'doppel' }),
      // o ESCRITÓRIO DE ANÁLISE (4º andar): a casa do RASTROPODA (no ep. 7 ele pulou do teto daqui) — a chance maior
      analise: torreRoom(0, 70, 'Escritório de análise', { foes: 'doppel', pods: ['far'] }),
      // o QUARTO ESCURO dos Becos: a casa do BILU (só ouvido no ep. 7)
      escuro: {
        ...torreRoom(20, 70, 'Os Becos: o quarto escuro', { kind: 'stalk' }),
        objective: 'Escolha uma porta',
        hint: 'Escuro demais… algo respira atrás das pilastras · escolha uma porta',
      },
      becos: {
        kind: 'stalk', floor: 0, title: 'Os Becos', objective: 'Escolha uma porta',
        hint: 'Os Becos: corredores que não cabem no prédio… escolha uma porta',
        rects: [{ minX: 60.3, maxX: 77.7, minZ: 29.3, maxZ: 40.7 }],
        entry: { x: 62.2, z: 35, yaw: Math.PI / 2, door: { x: 60.02, z: 35, face: Math.PI / 2, w: 1.4 } },
        exits: {
          left: { x: 68, z: 29.02, face: 0, w: 1.4 },
          front: { x: 77.98, z: 35, face: -Math.PI / 2, w: 1.4 },
          right: { x: 67, z: 40.98, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 77.0, z: 30.0 }],
        drawers: [{ x: 61.0, z: 40.0, pod: true }, { x: 75.5, z: 40.0, pod: true }],
      },
      fusca: {
        kind: 'stalk', floor: 0, title: 'Os Becos: o Fusca Azul', objective: 'Escolha uma porta',
        hint: 'Um Fusca Azul batido na parede, o alarme tocando… e uma vontade estranha de socar quem está do lado',
        rects: [{ minX: 60.3, maxX: 75.7, minZ: 49.3, maxZ: 60.7 }],
        entry: { x: 62.2, z: 55, yaw: Math.PI / 2, door: { x: 60.02, z: 55, face: Math.PI / 2, w: 1.4 } },
        exits: {
          left: { x: 67, z: 49.02, face: 0, w: 1.4 },
          front: { x: 75.98, z: 59.0, face: -Math.PI / 2, w: 1.4 },
          right: { x: 64, z: 60.98, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 75.0, z: 50.0 }],
        drawers: [{ x: 61.0, z: 50.0, pod: true }],
      },
      // a SALA DAS PILASTRAS (pedido do dono, 2026-11-13): o precipício; cair = voltar do céu na entrada com dano, e as
      // pilastras mudam de lugar (pve/pillars.js). Sem monstros; o baú fica na borda da saída.
      pilastras: {
        kind: 'parkour', weight: 0.7, floor: 0, title: 'Os Becos: o precipício', objective: 'Atravesse pelas pilastras',
        hint: 'PULE de pilastra em pilastra até o outro lado · quem cai volta do alto, machucado, e as pilastras mudam de lugar',
        rects: [{ minX: 80.3, maxX: 103.7, minZ: 28.3, maxZ: 39.7 }],
        entry: { x: 81.4, z: 34, yaw: Math.PI / 2, door: { x: 80.02, z: 34, face: Math.PI / 2, w: 1.4 } },
        pillars: { ledgeIn: 83, ledgeOut: 100, minZ: 29.2, maxZ: 38.8, size: 1.6, gap: [1.5, 2.3], decoys: 4, fallDamage: 0.12 },
        exits: {
          left: { x: 102, z: 28.02, face: 0, w: 1.4 },
          front: { x: 103.98, z: 34, face: -Math.PI / 2, w: 1.4 },
          right: { x: 102, z: 39.98, face: Math.PI, w: 1.4 },
        },
        chests: [{ x: 101.2, z: 30.4 }],
      },
      // O LABIRINTO DOS BECOS (pedido do dono, 2026-11-13): as paredes de dentro mudam a cada visita (pve/maze.js); as
      // portas de saída ficam na parede do fundo e não há seta amarela — achar a saída é o desafio. Alheios aparecem
      // pelos corredores. 9 × 9 células de 4 m. PROPOSTA: o tamanho, os atalhos e o ritmo dos monstros.
      labirinto: {
        kind: 'maze', weight: 0.6, floor: 0, title: 'Os Becos: o labirinto', objective: 'Ache a saída',
        hint: 'Os corredores não são os mesmos de antes… ACHE A SAÍDA (portas na parede do fundo) · algo anda por aqui',
        rects: [{ minX: 110.3, maxX: 145.7, minZ: 50.3, maxZ: 85.7 }],
        // as portas (entrada e saídas) ficam no MEIO de uma célula (z 52/60/72/84): na linha entre duas, uma parede de
        // dentro podia encostar no meio da porta
        maze: { x0: 110, z0: 50, cell: 4, cols: 9, rows: 9, loops: 0.12, spawn: { every: [8, 13], max: 3 } },
        entry: { x: 112.0, z: 52, yaw: Math.PI / 2, door: { x: 110.02, z: 52, face: Math.PI / 2, w: 1.4 } },
        exits: {
          left: { x: 145.98, z: 60, face: -Math.PI / 2, w: 1.4 },
          front: { x: 145.98, z: 72, face: -Math.PI / 2, w: 1.4 },
          right: { x: 145.98, z: 84, face: -Math.PI / 2, w: 1.4 },
        },
        chests: [{ x: 144, z: 52 }, { x: 112, z: 84 }],
        drawers: [{ x: 128, z: 68, pod: true }, { x: 136, z: 76, pod: true }],
      },
      // a sala do chefe: o CORREDOR DE CABOS (calmo) → a porta verde → a SALA DO SINO (a luta começa ao entrar)
      sino: {
        kind: 'boss', floor: 0, title: 'Sala do Sino', objective: 'Siga até a porta verde',
        hint: 'Os cabos levam à PORTA VERDE · o Estrangeiro espera na Sala do Sino',
        rects: [
          { minX: 70.3, maxX: 93.7, minZ: -10.7, maxZ: 10.7 }, // a Sala do Sino (o 1º: onde ele luta)
          { minX: 38.3, maxX: 71.8, minZ: -1.5, maxZ: 1.5 }, // o corredor de cabos
        ],
        entry: { x: 39.3, z: 0, yaw: Math.PI / 2, door: { x: 38.02, z: 0, face: Math.PI / 2, w: 2.2 } },
        spawn: { x: 87, z: 0 },
        bossTrigger: { x: 71.5 },
        exits: {},
        chests: [{ x: 40.2, z: 1.0 }, { x: 92.6, z: -9.6 }],
      },
    },
    // a Sala do Sino não tem porta de saída (a saída é a cápsula): a porta fica escondida e trancada atrás da parede
    exit: { door: { x: 94.6, z: 0, hidden: true } },
    locks: { chance: 0.4, vault: 0.5, luck: 0.6, drawerCoins: 0.35, coins: [4, 9] },
    chests: {
      chance: { start: 0.7, stalk: 0.9, parkour: 1, boss: 1, fight: [0, 0, 0.45, 0.65, 0.9] },
      coinsBoss: 16,
    },
  },
};

// uma sala de aula da Escola Nostradamus (12 × 10, a partir de x0, z0): a porta de entrada no oeste, o quadro e a mesa do
// professor no oeste, as carteiras em dois blocos e o meio livre para a luta (tools/blender/arena_escola.py classroom)
function classroom(x0, z0, title) {
  return {
    kind: 'fight', floor: 0, title,
    rects: [{ minX: x0 + 0.3, maxX: x0 + 11.7, minZ: z0 + 0.3, maxZ: z0 + 9.7 }],
    entry: { x: x0 + 2.2, z: z0 + 2.5, yaw: Math.PI / 2, door: { x: x0 + 0.02, z: z0 + 2.5, face: Math.PI / 2, w: 1.4 } },
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

// uma sala de luta da Torre (12 × 10 a partir de x0, z0; tools/blender/arena_torre.py fight_room): a entrada no oeste;
// `front` = o z da porta leste quando os móveis tampam o meio da parede; `foes` = quem aparece (startAlheioEncounter)
// as salas da Torre têm 17 × 14 (cresceram de 12 × 10, pedido do dono, 2026-11-13: "estão meio apertadas"); `front` é
// dado no desenho antigo (12 × 10) e esticado como a mobília (tools/blender/arena_torre.py stretch)
// pods: as CÁPSULAS DE LOOT (as gavetas da Torre: pve/roomDoors.js Drawer.buildPod) nos cantos sem baú ('near' = o canto
// da entrada, 'far' = o do fundo)
function torreRoom(x0, z0, title, { front = z0 + 5, foes = 'doppel', kind = 'fight', pods = ['near', 'far'] } = {}) {
  const TW = 17;
  const TD = 14;
  const fz = z0 + (front - z0) * (TD / 10);
  return {
    kind, floor: 0, title, foes,
    rects: [{ minX: x0 + 0.3, maxX: x0 + TW - 0.3, minZ: z0 + 0.3, maxZ: z0 + TD - 0.3 }],
    entry: { x: x0 + 2.2, z: z0 + 3.5, yaw: Math.PI / 2, door: { x: x0 + 0.02, z: z0 + 3.5, face: Math.PI / 2, w: 1.4 } },
    spawn: { x: x0 + 11.3, z: z0 + 7 },
    exits: {
      left: { x: x0 + 9.4, z: z0 + 0.02, face: 0, w: 1.4 },
      front: { x: x0 + TW - 0.02, z: fz, face: -Math.PI / 2, w: 1.4 },
      right: { x: x0 + 7.6, z: z0 + TD - 0.02, face: Math.PI, w: 1.4 },
    },
    chests: [{ x: x0 + 1.1, z: z0 + TD - 1.0 }, { x: x0 + TW - 1.1, z: z0 + 1.0 }],
    drawers: pods.map((c) => (c === 'near' ? { x: x0 + 1.4, z: z0 + 1.4, pod: true } : { x: x0 + TW - 1.4, z: z0 + TD - 1.4, pod: true })),
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
    // a sala sem saída (o almoxarifado): uma vez por tentativa e nunca saindo de outra sala sem saída
    if (m.kind === 'stash' && (cur.kind === 'stash' || visited.includes(id))) return false;
    return ex.stairs ? m.floor !== cur.floor : true; // a escada sempre troca de andar
  };
  for (const slot of chosen) {
    const ex = cur.exits[slot];
    let cand = Object.keys(D.modules).filter((id) => okFor(ex, id));
    if (!cand.length) continue;
    const fresh = cand.filter((id) => !visited.includes(id));
    if (fresh.length) cand = fresh;
    // as salas de espreita saem menos (stalkWeight)
    const wts = cand.map((id) => D.modules[id].weight ?? (D.modules[id].kind === 'stalk' ? D.route.stalkWeight : 1));
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
// os CADEADOS de uma sala: devolve a lista das saídas trancadas (vazia = nenhuma). A chave é UMA só (numa gaveta).
// (feedback do dono, 2026-11-14: "pode haver mais de uma porta trancada na mesma sala, mas o jogador recebe apenas uma
// chave: deve poder escolher qual destrancar") com 3+ saídas, às vezes (L.double) DUAS levam cadeado — a chave abre uma
// e o jogador escolhe o caminho; sempre sobra uma saída sem cadeado (nunca prende ninguém)
export function rollLock(D, curId, exits, rng = Math.random) {
  const L = D.locks;
  const cur = D.modules[curId];
  if (!L || !cur.drawers || !cur.drawers.length || exits.length < 2 || rng() >= L.chance) return [];
  const ok = exits.filter((e) => e.kind !== 'boss' && e.kind !== 'stash' && !cur.exits[e.slot].stairs);
  if (!ok.length) return [];
  const n = Math.min(ok.length, exits.length - 1, exits.length >= 3 && rng() < (L.double ?? 0.5) ? 2 : 1);
  const out = [];
  while (out.length < n) {
    const e = ok.splice(Math.floor(rng() * ok.length), 1)[0];
    // atrás de um corredor de espreita não cabe luta: vira sala de baús
    e.padlock = e.kind === 'fight' && rng() >= L.vault ? 'fight' : 'vault';
    if (e.padlock === 'vault') e.count = 0;
    out.push(e);
  }
  return out;
}

export function chestChance(D, kind, count = 0) {
  const c = D.chests?.chance;
  if (!c) return 0;
  if (kind === 'fight') return c.fight[Math.min(c.fight.length - 1, count)] ?? 0.5;
  return c[kind] ?? 0;
}

// o PLANO DAS ONDAS de uma fase de ondas (Tipora): uma entrada por onda, na ordem. kind 'horde' (o bando), 'giant' (a
// cada `bossEvery`: o Zumbi Gigante SOZINHO) ou 'boss' (a última, SEMPRE o chefe). `foes`: { tipo: quantos } com os
// tipos zumbi, forte (Zumbi de Sangue forte), tinta (Zumbi de Tinta), javali, cao (o lobo) e cobra.
// MISTURA PELA DIFICULDADE (dono, 2026-11-19: "Ondas onde tem os 3 tipos de infectados. Isso altera conforme a
// dificuldade selecionada"): a 1ª onda só de zumbis (para aprender), os lobos entram na 2ª, e da 4ª em diante toda
// onda traz os TRÊS animais (javali, cobra e lobo); quanto mais difícil, mais bichos por onda, mais animais no bando e
// mais Zumbis de Tinta. PROPOSTA: as proporções.
const WAVE_DIFF = {
  easy: { extra: 0, share: 0.3, tinta: 0, tintaFrom: 5 },
  normal: { extra: 0, share: 0.4, tinta: 1, tintaFrom: 4 },
  hard: { extra: 1, share: 0.5, tinta: 1, tintaFrom: 4 },
  superhard: { extra: 1, share: 0.55, tinta: 2, tintaFrom: 4 },
  annihilation: { extra: 2, share: 0.6, tinta: 2, tintaFrom: 3 },
};
const ANIMALS = ['cao', 'javali', 'cobra'];
export function wavePlan(D, difficulty = 'normal') {
  const W = D && D.waves;
  if (!W) return [];
  if (W.foes === 'samhain') return samhainPlan(W, difficulty);
  if (W.foes === 'sertao') return sertaoPlan(W, difficulty);
  const total = W.count[difficulty] ?? W.count.normal;
  const every = W.bossEvery || 3;
  const X = WAVE_DIFF[difficulty] || WAVE_DIFF.normal;
  const out = [];
  for (let n = 1; n <= total; n++) {
    if (n === total) { out.push({ n, kind: 'boss', count: 1, strongs: 0, foes: { boss: 1 } }); continue; }
    if (n % every === 0) { out.push({ n, kind: 'giant', count: 1, strongs: 0, foes: { gigante: 1 } }); continue; }
    const count = Math.min(9, 2 + Math.ceil(n * 0.6) + X.extra);
    let animals = n === 1 ? 0 : Math.max(1, Math.round(count * X.share));
    if (n >= 4) animals = Math.max(animals, 3); // os três tipos juntos
    animals = Math.min(animals, count - 1);
    const tinta = n >= X.tintaFrom ? Math.min(X.tinta + (n >= 7 ? 1 : 0), count - animals - 1) : 0;
    const zombies = count - animals - tinta;
    const strongs = n >= 4 ? Math.min(3, Math.floor((n - 1) / 3), Math.max(0, zombies - 1)) : 0;
    const foes = {};
    const put = (k, v) => { if (v > 0) foes[k] = (foes[k] || 0) + v; };
    put('zumbi', zombies - strongs);
    put('forte', strongs);
    put('tinta', tinta);
    // os animais em rodízio: na 2ª onda só lobos; depois, a partir de um tipo diferente a cada onda
    for (let i = 0; i < animals; i++) put(n === 2 ? 'cao' : ANIMALS[(n + i) % 3], 1);
    out.push({ n, kind: 'horde', count, strongs, foes });
  }
  return out;
}

// as ondas do SERTÃO (o Quibungo): Felinos Devorados pelo chão e Araras Devoradas pelo céu, crescendo com a onda; a
// cada `bossEvery` uma REVOADA (só araras, mais delas); a ÚLTIMA é o QUIBUNGO sozinho (kind 'beastBoss'). As variantes
// INFERNAIS entram só no Aniquilação (dono, 2026-11-20). PROPOSTA: as quantidades.
const SERTAO_DIFF = {
  easy: { extra: 0, birds: 0.3, infernal: 0 },
  normal: { extra: 0, birds: 0.35, infernal: 0 },
  hard: { extra: 1, birds: 0.4, infernal: 0 },
  superhard: { extra: 1, birds: 0.45, infernal: 0 },
  annihilation: { extra: 2, birds: 0.45, infernal: 0.35 },
};
export function sertaoPlan(W, difficulty = 'normal') {
  const total = W.count[difficulty] ?? W.count.normal;
  const every = W.bossEvery || 3;
  const X = SERTAO_DIFF[difficulty] || SERTAO_DIFF.normal;
  const out = [];
  const put = (foes, k, v) => { if (v > 0) foes[k] = (foes[k] || 0) + v; };
  for (let n = 1; n <= total; n++) {
    if (n === total) { out.push({ n, kind: 'beastBoss', count: 1, strongs: 0, foes: { quibungo: 1 } }); continue; }
    const foes = {};
    if (n % every === 0) {
      // a REVOADA: as araras descem juntas
      const count = Math.min(7, 3 + Math.floor(n / 3) + X.extra);
      const inf = Math.round(count * X.infernal);
      put(foes, 'araraDevorada', count - inf);
      put(foes, 'araraInfernal', inf);
      out.push({ n, kind: 'flock', count, strongs: inf, foes });
      continue;
    }
    const count = Math.min(9, 2 + Math.ceil(n * 0.6) + X.extra);
    const birds = n === 1 ? 0 : Math.min(count - 1, Math.max(1, Math.round(count * X.birds)));
    const cats = count - birds;
    const infB = Math.round(birds * X.infernal);
    const infC = n >= 3 ? Math.round(cats * X.infernal) : 0;
    put(foes, 'felinoDevorado', cats - infC);
    put(foes, 'felinoInfernal', infC);
    put(foes, 'araraDevorada', birds - infB);
    put(foes, 'araraInfernal', infB);
    out.push({ n, kind: 'horde', count, strongs: infB + infC, foes });
  }
  return out;
}

// as ondas do SAMHAIN (Treb Ciach): só Assombrações — as fortes (que quebram a fantasia) entram na 3ª onda e crescem
// com a dificuldade; a cada `bossEvery` a de Broén sozinha; a ÚLTIMA é a TEMPESTADE, a leva enorme de uma vez.
// PROPOSTA: as quantidades.
const SAMHAIN_DIFF = {
  // a TEMPESTADE menor (dono, 2026-11-19: "o final da parte 1 no modo normal está muito dificil, tem muitos bichos")
  easy: { extra: 0, strong: 0, storm: 6 },
  normal: { extra: 0, strong: 1, storm: 8 },
  // (2026-11-20: a tempestade do Difícil para cima um pouco menor — a parte 1 era a que derrubava; antes 10/13/15)
  hard: { extra: 1, strong: 1, storm: 9 },
  superhard: { extra: 1, strong: 2, storm: 11 },
  annihilation: { extra: 2, strong: 2, storm: 13 },
};
function samhainPlan(W, difficulty) {
  const total = W.count[difficulty] ?? W.count.normal;
  const every = W.bossEvery || 3;
  const X = SAMHAIN_DIFF[difficulty] || SAMHAIN_DIFF.normal;
  const out = [];
  for (let n = 1; n <= total; n++) {
    if (n === total) {
      const strongs = Math.round(X.storm * 0.25);
      out.push({ n, kind: 'storm', count: X.storm, strongs, foes: { assombracao: X.storm - strongs, assombracaoForte: strongs } });
      continue;
    }
    if (n % every === 0) { out.push({ n, kind: 'giant', count: 1, strongs: 0, foes: { broen: 1 } }); continue; }
    const count = Math.min(9, 2 + Math.ceil(n * 0.7) + X.extra);
    const strongs = n >= 3 ? Math.min(count - 1, X.strong + Math.floor((n - 1) / 4)) : 0;
    const foes = { assombracao: count - strongs };
    if (strongs) foes.assombracaoForte = strongs;
    out.push({ n, kind: 'horde', count, strongs, foes });
  }
  return out;
}

// A ÁRVORE ANCIÃ (a parte 3 do Samhain): ondas com FIM que o jogador não vê. As LAMPARINAS acesas no corredor
// (`run.samhainLamps`) cortam: cada uma tira 3% (até 45%) das Assombrações de cada onda e das fortes, e a partir de 14
// a última onda nem vem; a vida delas cai pela metade desse corte (Dungeon.spawnFoe, `tree.hpMul`). A última onda traz a
// Assombração de Broén junto (Normal para cima). PROPOSTA: as quantidades.
const TREE_DIFF = {
  // a ÁRVORE mais longa (dono, 2026-11-19: "A fase 3 durou muito pouco comparada a fase 1"): quase o dobro de ondas,
  // começando menores. PROPOSTA: os números.
  // MAIS ASSOMBRAÇÕES (dono, 2026-11-20: "a parte 3 está fácil até demais, deveria vir mais assombrações"): +2 em cada
  // onda e uma forte a mais do Normal para cima (antes base 3/4/4/5/6 e fortes 0/1/1/2/2). PROPOSTA.
  easy: { waves: 7, base: 5, strong: 0 },
  normal: { waves: 8, base: 6, strong: 2 },
  hard: { waves: 9, base: 6, strong: 2 },
  superhard: { waves: 10, base: 7, strong: 3 },
  annihilation: { waves: 11, base: 8, strong: 3 },
};
// as lamparinas acesas no corredor só ENFRAQUECEM UM POUCO as ondas da Árvore (dono, 2026-11-19: "é apenas um leve
// enfraquecimento das ondas"): até 25% menos Assombrações (2% por lamparina), sem tirar onda nenhuma
export function treeWeaken(lamps = 0) { return Math.min(0.25, Math.max(0, lamps) * 0.02); }
export function treePlan(difficulty = 'normal', lamps = 0) {
  const X = TREE_DIFF[difficulty] || TREE_DIFF.normal;
  const cut = treeWeaken(lamps);
  const total = X.waves;
  const out = [];
  for (let n = 1; n <= total; n++) {
    const last = n === total;
    const count0 = Math.min(18, X.base + n + (last ? 3 : 0));
    const count = Math.max(2, Math.round(count0 * (1 - cut)));
    const strongs = Math.min(count - 1, Math.round((n >= 3 ? X.strong + Math.floor(n / 3) : 0) * (1 - cut)));
    const foes = { assombracao: count - strongs };
    if (strongs) foes.assombracaoForte = strongs;
    if (last && difficulty !== 'easy') foes.broen = 1;
    out.push({ n, kind: 'horde', count: count + (foes.broen || 0), strongs, foes });
  }
  return out;
}

// `hidden`: em produção (fora da ordem da história e do sorteio)
export const DUNGEON_ORDER = Object.values(DUNGEONS)
  .filter((dungeon) => !dungeon.hidden)
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
// dicas gerais do Outro Lado no rodapé da tela de carregamento (depois das dicas da fase)
export const PVE_TIPS = [
  'As MOEDAS dos baús entram no save na hora: cair não leva as moedas que você já pegou.',
  'Caiu? Com moedas dá para pagar e <b>voltar à luta</b>. O preço sobe a cada vez.',
  'Dificuldades mais altas dão mais moedas. Cada uma abre ao vencer esta fase na dificuldade de baixo.',
];

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

// ------------------------------------------------ FASES SEPARADAS (dono, 2026-11-14: "separar as fases assim como no
// vampire survivors… várias salas até o boss, mas únicas e com final, sem levar da escola Nostradamus pra mansão")
// Cada tentativa é UMA fase, escolhida no começo; ela começa no nível 1 e acaba no chefe. A fase seguinte da história
// abre quando a anterior é vencida. A profundidade da fase é a da ordem da história (Escola 1, Mansão 2, Torre 3): os
// inimigos ficam com a força para que cada uma foi ajustada.
export function phaseDepth(id) {
  return (DUNGEONS[id] && DUNGEONS[id].minDepth) || 1;
}
export function phaseCleared(campaign, id) {
  return !!((campaign.phases || []).includes(id) || (campaign.bestTimes && campaign.bestTimes[id]));
}
export function phaseUnlocked(campaign, id) {
  const i = DUNGEON_ORDER.indexOf(id);
  // (v5.19.0) uma fase nova entrou no meio da ordem (Tipora antes da Torre): quem já venceu a de depois não a perde
  return i === 0 || (i > 0 && (phaseCleared(campaign, DUNGEON_ORDER[i - 1]) || phaseCleared(campaign, id)));
}
// DIFICULDADES TRANCADAS (pedido do dono, 2026-11-19: "para jogar no dificil o player tem que ter ganhado essa mesma
// fase no normal, assim por diante, apenas o normal e fácil são liberados, mas fácil nao libera o dificil"): por FASE,
// o Fácil e o Normal estão sempre abertos; cada uma acima abre ao vencer ESSA fase na dificuldade logo abaixo (Normal →
// Difícil → Superdifícil → Aniquilação). Uma dificuldade já vencida nunca tranca (saves de antes da regra).
export function diffUnlocked(campaign, id, difficulty) {
  const i = DIFF_ORDER.indexOf(difficulty);
  if (i <= 1) return true;
  return !!(phaseRecord(campaign, id, DIFF_ORDER[i - 1]) || DIFF_ORDER.slice(i).some((d) => phaseRecord(campaign, id, d)));
}
// a dificuldade mais alta aberta que não passa de `difficulty` (o "PRÓXIMA FASE" com a mesma dificuldade)
export function clampDiff(campaign, id, difficulty) {
  let i = Math.max(0, DIFF_ORDER.indexOf(difficulty));
  while (i > 1 && !diffUnlocked(campaign, id, DIFF_ORDER[i])) i--;
  return DIFF_ORDER[i];
}

// o recorde da fase (por dificuldade; `bestTimes[id]` é o melhor de todas)
export function phaseRecord(campaign, id, difficulty = null) {
  const t = campaign.bestTimes || {};
  return difficulty ? t[`${id}:${difficulty}`] ?? null : t[id] ?? null;
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
