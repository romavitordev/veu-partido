// GRADAÇÃO DE COR POR MAPA (TODO "Melhoria de Gráficos — Parte 2"): o tom final da tela de cada cenário, aplicado no
// último passe do pós-processamento (render/postfx.js) — só com a qualidade média ou alta (na baixa não há passes).
//   sat: saturação (1 = igual)   contrast: contraste em volta do cinza médio (1 = igual)
//   gain: multiplica R, G, B (o "calor" da luz)   lift: soma em R, G, B nas sombras (a cor do escuro)
// Valores leves de propósito: o clima de cada mapa já vem da luz e da névoa; aqui é só o acabamento. PROPOSTA (não é
// cânone): o tom de cada mapa foi escolhido pela descrição e pelas cores do cenário (arena/index.js).
export const NEUTRAL = { sat: 1, contrast: 1, gain: [1, 1, 1], lift: [0, 0, 0] };

export const GRADE = {
  orfanato: { sat: 0.86, contrast: 1.04, gain: [0.98, 1.0, 1.03], lift: [0.005, 0.008, 0.012] }, // dia nublado, desbotado
  orfanato_noite: { sat: 0.88, contrast: 1.08, gain: [0.94, 0.98, 1.08], lift: [0, 0.006, 0.022] }, // a tempestade azul
  suvaco: { sat: 1.06, contrast: 1.06, gain: [1.06, 1.0, 0.9], lift: [0.012, 0.006, 0] }, // a luz âmbar do bar
  coliseu: { sat: 1.08, contrast: 1.05, gain: [1.07, 1.0, 0.9], lift: [0.012, 0.004, 0] }, // o entardecer na areia
  santo_berco: { sat: 1.05, contrast: 1.02, gain: [1.04, 1.0, 1.02], lift: [0.008, 0.002, 0.014] }, // dourado e lilás
  acampamento: { sat: 0.95, contrast: 1.05, gain: [1.02, 1.02, 0.96], lift: [0.004, 0.008, 0.004] },
  igreja: { sat: 0.82, contrast: 1.1, gain: [0.96, 0.97, 1.05], lift: [0, 0.002, 0.018] }, // fria e dura
  igreja_dia: { sat: 0.9, contrast: 1.04, gain: [1.03, 1.0, 0.96], lift: [0.006, 0.004, 0] },
  palco: { sat: 1.12, contrast: 1.08, gain: [1.04, 0.97, 1.02], lift: [0.014, 0, 0.01] }, // o show do Anfitrião
  tipora: { sat: 1.04, contrast: 1.03, gain: [0.98, 1.02, 1.0], lift: [0, 0.01, 0.01] }, // a ilha verde e úmida
  ferro_velho: { sat: 0.92, contrast: 1.08, gain: [1.04, 0.98, 0.92], lift: [0.01, 0.004, 0] }, // ferrugem à noite
  ferro_velho_dia: { sat: 0.9, contrast: 1.04, gain: [1.04, 1.0, 0.94], lift: [0.008, 0.006, 0] }, // poeira e sol
  circo: { sat: 1.1, contrast: 1.06, gain: [1.05, 0.98, 0.98], lift: [0.012, 0, 0.006] },
  circo_noite: { sat: 1.08, contrast: 1.1, gain: [1.0, 0.95, 1.05], lift: [0.012, 0, 0.02] }, // néon e escuro
  passaros: { sat: 1.02, contrast: 1.03, gain: [1.03, 1.02, 0.96], lift: [0.004, 0.006, 0] },
  passaros_noite: { sat: 0.88, contrast: 1.06, gain: [0.95, 0.99, 1.07], lift: [0, 0.006, 0.02] },
  treb_ciach: { sat: 0.9, contrast: 1.06, gain: [1.04, 0.98, 0.94], lift: [0.01, 0.004, 0.006] }, // o Samhain
  treb_ciach_tempestade: { sat: 0.8, contrast: 1.06, gain: [0.95, 0.99, 1.05], lift: [0, 0.006, 0.016] },
  mansao_luta: { sat: 0.9, contrast: 1.08, gain: [1.05, 0.98, 0.9], lift: [0.01, 0.004, 0] }, // a luz amarela
  escola_luta: { sat: 0.84, contrast: 1.08, gain: [0.98, 1.0, 0.98], lift: [0.004, 0.006, 0.006] }, // o bunker
  mansao: { sat: 0.9, contrast: 1.08, gain: [1.05, 0.98, 0.9], lift: [0.01, 0.004, 0] },
  escola: { sat: 0.84, contrast: 1.08, gain: [0.98, 1.0, 0.98], lift: [0.004, 0.006, 0.006] },
  torre: { sat: 0.88, contrast: 1.08, gain: [0.95, 1.04, 0.95], lift: [0, 0.01, 0.004] }, // o verde da TV
};

export const gradeFor = (arenaId) => GRADE[arenaId] || NEUTRAL;
