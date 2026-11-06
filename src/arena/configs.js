// Configuração dos cenários feitos no Blender: limites andáveis, luz, céu, névoa,
// partículas e câmera. A geometria e os obstáculos vêm do .glb (tools/blender/arena_*.py).

export const ORFANATO = {
  id: 'orfanato',
  name: 'Orfanato Santa Mega-Freira',
  glb: 'arenas/orfanato.glb',
  bounds: { radius: 20.2 },
  spawns: [{ x: 0, z: -5 }, { x: 0, z: 5 }],
  sky: 0xc9ccd0,
  skyGradient: [[0, '#b8bcc2'], [0.6, '#d4d6d8'], [1, '#e6e6e4']],
  fog: { color: 0xc4c8cc, density: 0.024 },
  lights: [
    { type: 'hemi', sky: 0xdfe3e8, ground: 0x6a5a40, intensity: 1.5 },
    { type: 'dir', color: 0xf2f0ea, intensity: 1.3, pos: [-14, 26, 10], shadow: true, area: 30 },
    { type: 'ambient', color: 0x8a8a90, intensity: 0.35 },
    { type: 'point', color: 0xffb860, intensity: 18, distance: 10, pos: [19.2, 3, 0] },
  ],
  particles: { color: 0x8a6a3a, count: 160, area: 40, height: 6, rise: -0.25, drift: 0.8, size: 0.09, opacity: 0.8 }, // folhas secas caindo
  camera: { radius: 26, maxY: 14 },
};

// Bar: dá para lutar no salão e sair pela porta para a calçada
export const SUVACO = {
  id: 'suvaco',
  name: 'Bar Suvaco Seco',
  glb: 'arenas/suvaco.glb',
  bounds: {
    // Os retângulos se sobrepõem BEM mais que o diâmetro do corpo (1 m): com sobreposição curta,
    // o raio descontado de cada lado abria frestas e o lutador travava numa "parede invisível" na porta.
    rects: [
      { minX: -8.8, maxX: 8.8, minZ: -5.8, maxZ: 5.9 }, // salão
      { minX: -2.15, maxX: 2.15, minZ: 3.0, maxZ: 9.5 }, // porta (4,6 m), entra fundo no salão e na calçada
      { minX: -29, maxX: 29, minZ: 6.55, maxZ: 26.6 }, // calçada + rua + calçada da frente
      { minX: 17.15, maxX: 20.35, minZ: -5.3, maxZ: 9.0 }, // beco à direita
    ],
  },
  spawns: [{ x: -3.2, z: 0.6 }, { x: 3.0, z: 0.6 }],
  sky: 0x0c0e16,
  skyGradient: [[0, '#05060c'], [0.7, '#141a2a'], [1, '#2a2a34']],
  fog: { color: 0x161a26, density: 0.016 },
  lights: [
    { type: 'hemi', sky: 0x6a7aa0, ground: 0x2a2018, intensity: 0.85 },
    { type: 'ambient', color: 0x3a3a40, intensity: 0.4 },
    { type: 'point', color: 0xf2f4ea, intensity: 26, distance: 11, pos: [-4, 3.2, -1.5], flicker: true },
    { type: 'point', color: 0xf2f4ea, intensity: 26, distance: 11, pos: [4, 3.2, -1.5] },
    { type: 'point', color: 0xf2f4ea, intensity: 20, distance: 10, pos: [0, 3.2, 3] },
    { type: 'point', color: 0xffc070, intensity: 40, distance: 18, pos: [-10, 4.8, 15.2] },
    { type: 'point', color: 0xffc070, intensity: 40, distance: 18, pos: [10, 4.8, 15.2] },
    { type: 'point', color: 0xffc070, intensity: 36, distance: 18, pos: [-24, 4.8, 23.8] },
    { type: 'point', color: 0xffc070, intensity: 36, distance: 18, pos: [24, 4.8, 23.8] },
    { type: 'point', color: 0xffc070, intensity: 34, distance: 17, pos: [0, 4.8, 23.8] },
    { type: 'point', color: 0xffd090, intensity: 8, distance: 7, pos: [17.6, 3.2, -1.0] }, // beco
    { type: 'point', color: 0xff4ab0, intensity: 6, distance: 7, pos: [-13.6, 3.2, 7.2] }, // neon LANCHES
    { type: 'point', color: 0x3aff6a, intensity: 6, distance: 7, pos: [26.2, 3.2, 7.2] }, // neon FARMÁCIA
    { type: 'point', color: 0xffb860, intensity: 10, distance: 6, pos: [0, 3.6, 7.0] },
    { type: 'dir', color: 0x8ea0d0, intensity: 0.95, pos: [10, 24, 22], shadow: true, area: 34 },
  ],
  particles: { color: 0xffe0a0, count: 60, area: 16, height: 3.4, rise: 0.05, drift: 0.3, size: 0.03, opacity: 0.5, center: [0, 0, 0] }, // poeira na luz
  camera: {
    rect: { minX: -31, maxX: 31, minZ: -7, maxZ: 33 },
    maxY: 8.5,
    // dentro do salão: câmera presa no salão e abaixo do teto
    interior: { when: { minX: -9, maxX: 9, minZ: -6, maxZ: 5.6 }, rect: { minX: -8.6, maxX: 8.6, minZ: -5.6, maxZ: 5.7 }, maxY: 3.25 },
  },
};

// Santo Berço: a praça do vilarejo dos Luzidios em frente ao Labirinto Infinito, numa tarde dourada "perfeita"
// (a ilusão de conforto), com a névoa girando sobre o labirinto e esporos brilhando no ar
export const SANTO_BERCO = {
  id: 'santo_berco',
  name: 'Santo Berço',
  glb: 'arenas/santo_berco.glb',
  bounds: { radius: 19.5 },
  spawns: [{ x: 0, z: -5 }, { x: 0, z: 5 }],
  sky: 0xe8c890,
  skyGradient: [[0, '#4a3a6a'], [0.45, '#b88aa0'], [0.75, '#f0c890'], [1, '#f6e0b0']],
  fog: { color: 0xd8c0b0, density: 0.018 },
  lights: [
    { type: 'hemi', sky: 0xffe0b8, ground: 0x4a5a2a, intensity: 1.15 },
    { type: 'dir', color: 0xffc888, intensity: 2.2, pos: [26, 18, 20], shadow: true, area: 30 },
    { type: 'ambient', color: 0x8a7a90, intensity: 0.3 },
    { type: 'point', color: 0xff7a2a, intensity: 22, distance: 9, pos: [-19.1, 1.6, -20.4], flicker: true }, // forja
    { type: 'point', color: 0xb8a0ff, intensity: 14, distance: 22, pos: [0, 5, -40] }, // brilho do labirinto
    { type: 'point', color: 0x3aff8a, intensity: 5, distance: 6, pos: [-8.5, 1.2, -9.5] }, // cristal verde
  ],
  particles: { color: 0xfff0b0, count: 260, area: 44, height: 7, rise: 0.12, drift: 0.6, size: 0.07, opacity: 0.7 }, // esporos dourados
  // névoa baixa girando pela praça e um banco denso sobre o Labirinto Infinito (ao fundo, z ≈ −40)
  mist: { color: 0xe8dcd8, count: 34, inner: 6, radius: 21, height: 1.8, size: 7, opacity: 0.32, swirl: 0.035, banks: [{ at: [0, -38], radius: 14, count: 18, y: 1.5, height: 6, size: 12, opacity: 0.55 }] },
  camera: { radius: 23, maxY: 14 }, // não entra nas casas nem nas árvores
};

// Ruínas do Ritual: cemitério abandonado à noite, lua clara, névoa roxa e cinzas subindo; o círculo ritual brilha
export const RUINAS = {
  id: 'ruinas',
  name: 'Ruínas do Ritual',
  glb: 'arenas/ruinas.glb',
  bounds: { radius: 21.5 },
  spawns: [{ x: 0, z: -5 }, { x: 0, z: 5 }],
  sky: 0x0d0a14,
  skyGradient: [[0, '#05040a'], [0.6, '#140e22'], [1, '#2a1c3a']],
  fog: { color: 0x1a1028, density: 0.022 },
  lights: [
    { type: 'hemi', sky: 0xa898d8, ground: 0x2a1c34, intensity: 1.6 },
    { type: 'ambient', color: 0x6a5a8a, intensity: 0.5 },
    { type: 'dir', color: 0xd8d0ff, intensity: 2.6, pos: [12, 22, 8], shadow: true, area: 28 },
    { type: 'point', color: 0xa46bff, intensity: 30, distance: 30, decay: 1.6, pos: [0, 2.5, 0] },
    { type: 'point', color: 0xffa050, intensity: 6, distance: 9, pos: [4, 0.8, 4], flicker: true },
    { type: 'point', color: 0xffa050, intensity: 6, distance: 9, pos: [-4, 0.8, -4], flicker: true },
  ],
  particles: { color: 0xb89aff, count: 400, area: 50, height: 10, rise: 0.25, drift: 0.4, size: 0.07, opacity: 0.6 }, // cinzas roxas
  camera: { radius: 25, maxY: 14 },
};

// Coliseu: arena de areia ao entardecer cercada por muralhas e torres em ruínas (peças do Castle Kit)
export const COLISEU = {
  id: 'coliseu',
  name: 'Coliseu',
  glb: 'arenas/coliseu.glb',
  bounds: { radius: 22.6 },
  spawns: [{ x: 0, z: -6 }, { x: 0, z: 6 }],
  sky: 0xe8915a,
  skyGradient: [[0, '#3a2a5a'], [0.45, '#c8604a'], [0.75, '#f0a060'], [1, '#f6d0a0']],
  fog: { color: 0xe0a070, density: 0.0085 },
  lights: [
    { type: 'hemi', sky: 0xffc8a0, ground: 0x6a4a3a, intensity: 1.0 },
    { type: 'dir', color: 0xffb070, intensity: 2.6, pos: [-34, 14, 18], shadow: true, area: 30 },
    { type: 'ambient', color: 0x8a6a6a, intensity: 0.3 },
  ],
  particles: { color: 0xf0c890, count: 240, area: 46, height: 7, rise: 0.08, drift: 1.2, size: 0.06, opacity: 0.55 }, // poeira dourada
  camera: { radius: 23, maxY: 16 }, // a muralha começa em ~24 m
};

// Acampamento Varminho (Sinais do Outro Lado, ep. 2): clareira no mato à noite ao lado da Estação de
// Transmissão de Varminho — fogueira no centro, barracas, a van dos Cinco e a torre ao fundo, céu estrelado
export const ACAMPAMENTO = {
  id: 'acampamento',
  name: 'Acampamento Varminho',
  glb: 'arenas/acampamento.glb',
  bounds: { radius: 20 },
  spawns: [{ x: 0, z: -6 }, { x: 0, z: 6 }],
  sky: 0x060a1a,
  skyGradient: [[0, '#04060f'], [0.55, '#0a1430'], [0.85, '#14264a'], [1, '#1c2e48']],
  fog: { color: 0x0a1222, density: 0.02 },
  lights: [
    { type: 'hemi', sky: 0x6a7ab8, ground: 0x141a14, intensity: 1.0 },
    { type: 'ambient', color: 0x3a4a6a, intensity: 0.45 },
    // luar azulado
    { type: 'dir', color: 0x9ab0ff, intensity: 1.5, pos: [-18, 26, -10], shadow: true, area: 28 },
    // a fogueira: a luz principal do acampamento
    { type: 'point', color: 0xff8a3a, intensity: 70, distance: 26, decay: 1.5, pos: [0, 1.6, 0], flicker: true },
    // varal de lâmpadas, lampiões das barracas e os faróis da van
    { type: 'point', color: 0xffc070, intensity: 10, distance: 11, pos: [-10.2, 2.8, -7.8], flicker: true },
    { type: 'point', color: 0xffb060, intensity: 4, distance: 7, pos: [7.5, 0.6, 8.5], flicker: true },
    { type: 'point', color: 0xffb060, intensity: 4, distance: 7, pos: [-7.8, 0.6, 8.2], flicker: true },
    { type: 'point', color: 0xe8f0ff, intensity: 14, distance: 14, pos: [-9.2, 1.2, -22.5] },
    // luz verde fraca na lateral da van (o grafite neon) para ela aparecer no fundo
    { type: 'point', color: 0x7dff9a, intensity: 9, distance: 9, pos: [-6.6, 2.0, -21.2] },
    // a luz vermelha no alto da torre
    { type: 'point', color: 0xff2020, intensity: 8, distance: 12, pos: [18, 29.6, -31], flicker: true },
  ],
  fires: [{ pos: [0, 0.15, 0], scale: 0.75 }],
  // a fogueira NÃO bloqueia (2026-11-01): dá para passar por cima, queimando 1/s (2/s em criatura de Morte)
  fireZones: [{ x: 0, z: 0, radius: 1.25, height: 1.0, dps: 1, deathDps: 2 }],
  dropColliders: ['COL_cyl_fire'], // o .glb ainda tem o colisor antigo (rebuild precisa dos kits Kenney)
  stars: { count: 1500, radius: 170, size: 0.85 },
  particles: [
    { color: 0xffa040, count: 60, area: 1.8, height: 4.5, rise: 1.4, drift: 0.45, size: 0.07, opacity: 0.85 }, // brasas da fogueira
    { color: 0xd8ff7a, count: 120, area: 46, height: 3, rise: 0.05, drift: 0.6, size: 0.07, opacity: 0.7 }, // vaga-lumes no mato
  ],
  camera: { radius: 24, maxY: 15 },
};

// O PALCO DO ANFITRIÃO (2026-11-01): o coliseu roxo dos jogos do Anfitrião, as tochas de Energia e a plateia de
// Anfitriões; o narrador e as regras novas ficam em palcoHost.js (ligado pelo Match só neste cenário)
const PALCO_TORCHES = Array.from({ length: 8 }, (_, k) => {
  const a = ((k + 0.5) / 8) * Math.PI * 2;
  return { type: 'point', color: 0xb060ff, intensity: 22, distance: 16, decay: 1.6, pos: [Math.sin(a) * 19.8, 3.6, Math.cos(a) * 19.8], flicker: true };
});
export const PALCO = {
  id: 'palco',
  name: 'O Palco do Anfitrião',
  glb: 'arenas/palco.glb',
  bounds: { radius: 20.2 },
  spawns: [{ x: 0, z: -6 }, { x: 0, z: 6 }],
  sky: 0x120820,
  skyGradient: [[0, '#06020c'], [0.5, '#1a0a30'], [0.8, '#3a1460'], [1, '#5a2080']],
  fog: { color: 0x1a0a2e, density: 0.011 },
  lights: [
    { type: 'hemi', sky: 0xc8a0ff, ground: 0x2a1440, intensity: 1.1 },
    { type: 'ambient', color: 0x5a3a7a, intensity: 0.35 },
    { type: 'dir', color: 0xd8b8ff, intensity: 2.2, pos: [-20, 30, 14], shadow: true, area: 28 }, // o holofote de cima
    { type: 'point', color: 0xb48cff, intensity: 30, distance: 14, decay: 1.4, pos: [0, 2.5, 0] }, // o Símbolo aceso no chão
    ...PALCO_TORCHES,
  ],
  particles: { color: 0xd0a0ff, count: 200, area: 40, height: 9, rise: 0.12, drift: 0.6, size: 0.06, opacity: 0.6 }, // faíscas de Energia
  camera: { radius: 21.5, maxY: 15 },
};

// IGREJA ANTIGA (Hexatombe): a base dos Vampiros, só o INTERIOR (o modelo 3D do próprio RPG). A porta está trancada; a
// NÉVOA DA MEMBRANA enche a nave e a LUA VERMELHA DE SANGUE entra pelos vitrais e tinge tudo; velas na mesa do banquete
// e no altar (a Dama da Culpa e o Serafim decapitado).
export const IGREJA = {
  id: 'igreja',
  name: 'Igreja Antiga',
  glb: 'arenas/igreja.glb',
  bounds: {
    rects: [
      { minX: -9.4, maxX: 9.4, minZ: -13.3, maxZ: 13.3 }, // a nave e os corredores (o altar e a porta ficam de fora)
    ],
  },
  spawns: [{ x: -3.2, z: 3.0 }, { x: 3.2, z: 3.0 }],
  sky: 0x0a0204,
  skyGradient: [[0, '#050102'], [0.6, '#1a0406'], [1, '#2a0608']],
  fog: { color: 0x1a0406, density: 0.012 },
  lights: [
    { type: 'hemi', sky: 0xa05a5a, ground: 0x3a1410, intensity: 1.25 },
    { type: 'ambient', color: 0x4a2224, intensity: 0.4 },
    { type: 'point', color: 0xff5a3a, intensity: 40, distance: 24, decay: 1.4, pos: [0, 7, 3] }, // a luz vermelha que enche a nave
    // a lua de sangue entrando pelos vitrais do lado direito
    { type: 'dir', color: 0xff4a3a, intensity: 2.8, pos: [16, 20, 6], shadow: true, area: 30 },
    { type: 'point', color: 0xff2a1a, intensity: 30, distance: 16, decay: 1.6, pos: [0, 8, -15] }, // o altar e o símbolo de sangue
    { type: 'point', color: 0xff2a1a, intensity: 14, distance: 12, pos: [-8.5, 7, 0] },
    { type: 'point', color: 0xff2a1a, intensity: 14, distance: 12, pos: [8.5, 7, 0] },
    { type: 'point', color: 0xff2a1a, intensity: 10, distance: 10, pos: [-8.5, 7, -9] },
    { type: 'point', color: 0xff2a1a, intensity: 10, distance: 10, pos: [8.5, 7, 9] },
    { type: 'point', color: 0xffa050, intensity: 14, distance: 8, pos: [0, 2.0, -8.5], flicker: true }, // as velas do banquete
    { type: 'point', color: 0xffa050, intensity: 8, distance: 6, pos: [-4, 3.2, -13.6], flicker: true },
    { type: 'point', color: 0xffa050, intensity: 8, distance: 6, pos: [4, 3.2, -13.6], flicker: true },
    { type: 'point', color: 0xffb060, intensity: 7, distance: 8, pos: [0, 6.5, -15.8] }, // o retábulo dourado
    { type: 'point', color: 0xff7a3a, intensity: 6, distance: 6, pos: [-5.6, 3.3, 0], flicker: true }, // as arandelas
    { type: 'point', color: 0xff7a3a, intensity: 6, distance: 6, pos: [5.6, 3.3, 0], flicker: true },
    { type: 'point', color: 0xff7a3a, intensity: 6, distance: 6, pos: [-5.6, 3.3, 8], flicker: true },
    { type: 'point', color: 0xff7a3a, intensity: 6, distance: 6, pos: [5.6, 3.3, -8], flicker: true },
  ],
  // a névoa da membrana: baixa, vermelho-escura, girando devagar pela nave e mais densa no fundo e na porta trancada
  mist: { color: 0x6a1018, count: 22, center: [0, 0], inner: 6, radius: 10, height: 1.2, size: 5, opacity: 0.16, swirl: 0.02, banks: [{ at: [0, -14], radius: 6, count: 10, y: 0.8, height: 3, size: 7, opacity: 0.28 }, { at: [0, 12.5], radius: 5, count: 8, y: 0.6, height: 2.5, size: 6, opacity: 0.26 }] },
  particles: { color: 0xff6a5a, count: 160, area: 20, height: 9, rise: 0.04, drift: 0.25, size: 0.04, opacity: 0.5, center: [0, 0, -1] }, // poeira na luz vermelha
  camera: { rect: { minX: -9.6, maxX: 9.6, minZ: -15.5, maxZ: 13.4 }, maxY: 9.5 },
};

// ILHA DE TIPORA (O Segredo na Ilha): a praça de terra no centro do vilarejo, à noite — as casas de tábua com as janelas
// acesas, os LAMPIÕES (a ilha não tem luz elétrica), a igreja no morro com o cemitério, e ao longe o MAR verde e o
// FAROL no rochedo, com o facho girando; a Mansão dos Moretti no penhasco
export const TIPORA = {
  id: 'tipora',
  name: 'Ilha de Tipora',
  glb: 'arenas/tipora.glb',
  bounds: { radius: 17 },
  spawns: [{ x: 0, z: -6 }, { x: 0, z: 6 }],
  sky: 0x0e2426,
  skyGradient: [[0, '#081414'], [0.5, '#123030'], [0.8, '#2a4a46'], [1, '#4a6660']],
  fog: { color: 0x1e3c3a, density: 0.0048 },
  lights: [
    { type: 'hemi', sky: 0x8ab8b0, ground: 0x2a2418, intensity: 1.05 },
    { type: 'ambient', color: 0x3a5250, intensity: 0.45 },
    // o luar esverdeado atrás das nuvens
    { type: 'dir', color: 0xb0d8d0, intensity: 1.4, pos: [-20, 28, -14], shadow: true, area: 28 },
    // os lampiões em volta da praça (r = 14, os mesmos do .glb)
    ...Array.from({ length: 7 }, (_, k) => {
      const a = ((k + 0.5) / 7) * Math.PI * 2;
      return { type: 'point', color: 0xffa850, intensity: 9, distance: 11, decay: 1.6, pos: [Math.sin(a) * 13.7, 2.4, Math.cos(a) * 13.7], flicker: true };
    }),
    // a igreja acesa no morro (ao norte) e a churrasqueira
    { type: 'point', color: 0xffb060, intensity: 16, distance: 14, pos: [19, 5, -4.5] }, // a igreja ao norte da praça
    { type: 'point', color: 0xff6a20, intensity: 5, distance: 6, pos: [15.5, 1.4, 2.5], flicker: true },
    // o farol ao longe
    { type: 'point', color: 0xfff0b0, intensity: 40, distance: 30, pos: [-27, 17, -90] },
  ],
  // o facho do farol girando (glbArena: beacons)
  beacons: [{ pos: [-27, 17, -90], length: 70, radius: 4, color: 0xfff2c0, opacity: 0.1, speed: 0.7 }],
  particles: { color: 0xffd890, count: 70, area: 30, height: 4, rise: 0.04, drift: 0.5, size: 0.06, opacity: 0.6 }, // vaga-lumes
  camera: { radius: 21, maxY: 14 },
};

// MANSÃO ENDIABRADA (OUTRO LADO: o território do Espreitador) — mapa em linha, sem teto, no breu. Só no modo PvE
// (fora da seleção de cenários). As luzes pontuais são um POOL que acompanha o jogador (lightPool). As portas trancadas,
// os armários do quarto, a fresta do corredor B e a porta de saída são do jogo (src/pve/Dungeon.js).
export const MANSAO = {
  id: 'mansao',
  name: 'Mansão Endiabrada',
  glb: 'arenas/mansao.glb',
  bounds: {
    rects: [
      { minX: -17.6, maxX: -10.2, minZ: -4.6, maxZ: 4.6 }, // hall
      { minX: -11.6, maxX: -4.4, minZ: -1.25, maxZ: 1.25 }, // corredor A
      { minX: -5.8, maxX: 5.8, minZ: -5.7, maxZ: 5.7 }, // sala de estar
      { minX: 4.4, maxX: 17.6, minZ: -1.45, maxZ: 1.45 }, // corredor B
      { minX: 16.2, maxX: 29.8, minZ: -6.2, maxZ: 6.2 }, // biblioteca
      { minX: 28.4, maxX: 39.6, minZ: -1.45, maxZ: 1.45 }, // corredor C
      { minX: 38.2, maxX: 61.8, minZ: -10.2, maxZ: 10.2 }, // quarto principal
      { minX: 60.4, maxX: 75.6, minZ: -1.1, maxZ: 1.1 }, // corredor de saída
    ],
  },
  spawns: [{ x: -14.5, z: 0.5 }, { x: 2.5, z: 0 }],
  sky: 0x020203,
  fog: { color: 0x050406, density: 0.045 },
  lightPool: 7,
  lights: [
    { type: 'hemi', sky: 0x3a3450, ground: 0x1a1008, intensity: 0.55 },
    { type: 'ambient', color: 0x2a2228, intensity: 0.4 },
    { type: 'dir', color: 0x6a80c0, intensity: 0.35, pos: [30, 30, 18], shadow: false },
    { type: 'point', color: 0xffb060, intensity: 22, distance: 11, pos: [-14, 2.4, 0], flicker: true }, // lustre do hall
    { type: 'point', color: 0xffb060, intensity: 8, distance: 6, pos: [-11.9, 1.2, -4.4] },
    { type: 'point', color: 0xffa050, intensity: 7, distance: 6, pos: [-8, 2.0, 1.4] }, // corredor A
    { type: 'point', color: 0xff7a30, intensity: 26, distance: 10, pos: [0, 0.8, -4.8], flicker: true }, // lareira
    { type: 'point', color: 0xffb060, intensity: 9, distance: 7, pos: [-5.6, 2.0, 2.5] },
    { type: 'point', color: 0xffb060, intensity: 9, distance: 7, pos: [5.6, 2.0, 2.5] },
    { type: 'point', color: 0xffb060, intensity: 8, distance: 7, pos: [8.6, 1.2, 1.3] }, // corredor B
    { type: 'point', color: 0xffa050, intensity: 6, distance: 6, pos: [10, 2.0, 1.6], flicker: true },
    { type: 'point', color: 0xffb060, intensity: 24, distance: 13, pos: [23, 2.4, 0], flicker: true }, // biblioteca
    { type: 'point', color: 0xffb060, intensity: 7, distance: 6, pos: [21.6, 1.2, 0.2] },
    { type: 'point', color: 0xffa050, intensity: 7, distance: 6, pos: [34, 2.0, 1.6] }, // corredor C
    { type: 'point', color: 0xffb060, intensity: 20, distance: 12, pos: [45, 2.5, 0], flicker: true }, // quarto
    { type: 'point', color: 0xffb060, intensity: 20, distance: 12, pos: [55, 2.5, 0], flicker: true },
    { type: 'point', color: 0x6a80c0, intensity: 10, distance: 9, pos: [41.2, 2, -9.5] }, // a lua nas janelas
    { type: 'point', color: 0x6a80c0, intensity: 10, distance: 9, pos: [58.8, 2, -9.5] },
    { type: 'point', color: 0xffb060, intensity: 6, distance: 6, pos: [42, 1.0, 8.6] },
    { type: 'point', color: 0x8090c0, intensity: 8, distance: 8, pos: [75, 1.5, 0] }, // fim do corredor de saída
    // as salas soltas (rodada 3): sala de jantar, quarto infantil e quarto dos olhos de gatos
    { type: 'point', color: 0xffb060, intensity: 18, distance: 10, pos: [4.8, 2.4, 40], flicker: true }, // jantar
    { type: 'point', color: 0xffb060, intensity: 18, distance: 10, pos: [9.2, 2.4, 40], flicker: true },
    { type: 'point', color: 0xffa050, intensity: 7, distance: 6, pos: [7, 1.3, 34.6] },
    { type: 'point', color: 0x6a80c0, intensity: 9, distance: 8, pos: [26, 2, 34.8] }, // infantil: a lua na janela
    { type: 'point', color: 0xffb060, intensity: 9, distance: 7, pos: [24, 0.6, 38], flicker: true }, // a vela no chão
    { type: 'point', color: 0xffa050, intensity: 8, distance: 7, pos: [31.4, 2.0, 40] },
    { type: 'point', color: 0xf2c230, intensity: 6, distance: 5, pos: [30.8, 1.8, 40.6] }, // o móbile
    { type: 'point', color: 0xffb060, intensity: 8, distance: 6, pos: [39.2, 1.2, 41.6], flicker: true }, // olhos: a vela
    { type: 'point', color: 0x6a80c0, intensity: 8, distance: 7, pos: [47.4, 2, 38] }, // a lua
    { type: 'point', color: 0xc8a020, intensity: 7, distance: 5, pos: [45.2, 1.2, 35.6], flicker: true }, // a porta emperrada
  ],
  particles: { color: 0xc8b8a0, count: 140, area: 30, height: 3, rise: 0.04, drift: 0.2, size: 0.03, opacity: 0.45, center: [20, 0, 0] }, // poeira
  camera: { rect: { minX: -26, maxX: 82, minZ: -22, maxZ: 22 }, maxY: 11 },
};

// ESCOLA NOSTRADAMUS (OUTRO LADO: o território da Degolificada, a 2ª dungeon) — salas soltas, sem teto, à noite. Só no
// modo PvE. Cada sala é um módulo (src/pve/dungeons.js DUNGEONS.degolificada); o bunker fica depois da passagem secreta da
// biblioteca. As caixas do bunker, as portas, as gavetas e a porta de saída são do jogo (src/pve/Dungeon.js).
const room = (x0, z0, w = 12, d = 10) => ({ minX: x0 + 0.3, maxX: x0 + w - 0.3, minZ: z0 + 0.3, maxZ: z0 + d - 0.3 });
const tube = (x, z, i = 12, flicker = false) => ({ type: 'point', color: 0xd8e8ff, intensity: i, distance: 8, pos: [x, 2.8, z], flicker });
export const ESCOLA = {
  id: 'escola',
  name: 'Escola Nostradamus',
  glb: 'arenas/escola.glb',
  bounds: {
    rects: [
      { minX: -21.6, maxX: -0.3, minZ: -1.95, maxZ: 1.95 }, // corredor
      room(0, 30), room(20, 30), room(40, 30), // as salas de aula
      room(0, 50), // laboratório
      { minX: 20.3, maxX: 29.7, minZ: 50.9, maxZ: 57.2 }, // arquivos
      { minX: 40.3, maxX: 55.7, minZ: 52.6, maxZ: 55.4 }, // corredor dos fundos
      { minX: 38.3, maxX: 61.7, minZ: -9.8, maxZ: 9.8 }, // biblioteca
      { minX: 60.2, maxX: 71.8, minZ: -1.2, maxZ: 1.2 }, // passagem secreta
      { minX: 70.3, maxX: 91.7, minZ: -8.7, maxZ: 8.7 }, // bunker
      { minX: 90.2, maxX: 103.6, minZ: -1.1, maxZ: 1.1 }, // saída do bunker
    ],
  },
  spawns: [{ x: -20.6, z: 0 }, { x: -19, z: 0 }],
  sky: 0x020304,
  fog: { color: 0x05070a, density: 0.05 },
  lightPool: 7,
  lights: [
    { type: 'hemi', sky: 0x34405a, ground: 0x12100c, intensity: 0.5 },
    { type: 'ambient', color: 0x22262e, intensity: 0.4 },
    { type: 'dir', color: 0x6a80c0, intensity: 0.3, pos: [20, 30, -18], shadow: false },
    // o corredor: as fluorescentes e a fuligem do incêndio
    tube(-19, 0), tube(-12.5, 0, 9, true), tube(-5, 0),
    { type: 'point', color: 0x30ff70, intensity: 4, distance: 4, pos: [-21.4, 2.8, 0] }, // a placa de saída
    // as salas de aula
    tube(4, 35, 10, true), tube(8.5, 35), tube(24, 35, 10, true), tube(28.5, 35), tube(44, 35, 10, true), tube(48.5, 35),
    { type: 'point', color: 0x6a80c0, intensity: 7, distance: 7, pos: [6, 2, 30.6] }, // a lua nas janelas
    { type: 'point', color: 0x6a80c0, intensity: 7, distance: 7, pos: [26, 2, 30.6] },
    { type: 'point', color: 0x6a80c0, intensity: 7, distance: 7, pos: [46, 2, 30.6] },
    // o laboratório: o fogo que ainda queima e as brasas
    tube(5, 55, 7, true),
    { type: 'point', color: 0xff6a20, intensity: 18, distance: 9, pos: [11, 0.8, 52.8], flicker: true },
    { type: 'point', color: 0xff4010, intensity: 8, distance: 6, pos: [7.5, 0.4, 55] },
    // arquivos e o corredor dos fundos
    tube(25, 54, 10, true), tube(43, 54, 8, true), tube(51, 54),
    // a biblioteca
    tube(44, -4, 10, true), tube(50, 4), tube(56, -4, 10, true), tube(44, 4), tube(56, 4),
    { type: 'point', color: 0x6a80c0, intensity: 8, distance: 8, pos: [61, 2.2, -6.5] }, // o vitral
    { type: 'point', color: 0x6a80c0, intensity: 8, distance: 8, pos: [61, 2.2, 6.5] },
    // a passagem e o bunker: lâmpadas nuas e as velas do círculo
    { type: 'point', color: 0xffc880, intensity: 8, distance: 6, pos: [66, 2.5, 0], flicker: true },
    { type: 'point', color: 0xffc880, intensity: 14, distance: 9, pos: [75, 2.5, 0], flicker: true },
    { type: 'point', color: 0xffc880, intensity: 12, distance: 9, pos: [87, 2.5, -4] },
    { type: 'point', color: 0xffc880, intensity: 12, distance: 9, pos: [87, 2.5, 4], flicker: true },
    { type: 'point', color: 0xff9a40, intensity: 12, distance: 8, pos: [81, 0.6, 0], flicker: true }, // as velas do ritual
    { type: 'point', color: 0x8090c0, intensity: 8, distance: 8, pos: [103, 1.5, 0] }, // o fim da saída
  ],
  particles: { color: 0xa8a8a0, count: 140, area: 30, height: 3, rise: 0.05, drift: 0.2, size: 0.03, opacity: 0.4, center: [40, 0, 20] }, // a cinza
  camera: { rect: { minX: -30, maxX: 110, minZ: -20, maxZ: 68 }, maxY: 11 },
};

// ARENAS DE LUTA do Outro Lado (pedido do dono, 2026-11-06): uma sala só de cada mapa do PvE, no modo de luta. Usam o
// mesmo .glb; a luta fica presa na sala (bounds), a câmera não sai dela e só as luzes de dentro acendem (sem lightPool).
// PROPOSTA: a escolha da sala (o quarto principal da Mansão e o bunker da Escola), a névoa mais leve e os nascimentos.
const inRect = (r, m) => (L) => L.type !== 'point' || (L.pos[0] > r.minX - m && L.pos[0] < r.maxX + m && L.pos[2] > r.minZ - m && L.pos[2] < r.maxZ + m);
function fightRoom(base, id, r, { spawns, fog, center }) {
  return {
    ...base,
    id,
    bounds: { rects: [r] },
    spawns,
    lightPool: undefined,
    lights: base.lights.filter(inRect(r, 1.5)),
    fog: { color: base.fog.color, density: fog },
    particles: { ...base.particles, area: 22, center },
    camera: { rect: { minX: r.minX - 6, maxX: r.maxX + 6, minZ: r.minZ - 10, maxZ: r.maxZ + 10 }, maxY: 11 },
  };
}
// o quarto principal (os armários e a lua nas janelas)
export const MANSAO_LUTA = fightRoom(MANSAO, 'mansao_luta', MANSAO.bounds.rects[6], { spawns: [{ x: 45, z: 0 }, { x: 55, z: 0 }], fog: 0.022, center: [50, 0, 0] });
// o bunker (o círculo do ritual e as velas)
export const ESCOLA_LUTA = fightRoom(ESCOLA, 'escola_luta', ESCOLA.bounds.rects[ESCOLA.bounds.rects.length - 2], { spawns: [{ x: 76, z: 0 }, { x: 86, z: 0 }], fog: 0.024, center: [81, 0, 0] });
