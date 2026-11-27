// Mapeamento de controles. Nada no jogo usa teclas fixas: tudo passa por aqui.
// Para mudar uma tecla, troque o código (KeyboardEvent.code) na lista.
//
// Ações:
//   physical → Ataque Físico                (○ Bolinha / B)
//   ranged   → Ataque/habilidade principal  (□ Quadrado / X)
//   carga    → Carga de Poder / Energia     (△ Triângulo / Y)
//   jump     → Pulo                         (× X / A)
//   block    → Defesa (segurar)             (R2 / RT)
//              parado = defende tudo · + direção = passos rápidos (Storm 4)
//   dodge    → Esquiva (+ direção)          (L2 / LT) — 4 cargas
//   start    → Pausa
//   assist1  → Chama a assistência 1 (batalha em equipe)       (L1 / LB)
//   assist2  → Chama a assistência 2 (batalha em equipe)       (R1 / RB)
//   switch1  → Troca para o personagem da assistência 1        (analógico direito ◀)
//   switch2  → Troca para o personagem da assistência 2        (analógico direito ▶)
//
// Habilidades (sem botão modificador próprio): △ + ○ · △ + □ · △ + L2 · R2 + △ · R2 + × (R2 + ○ = agarrão)
//
//   pageL/pageR → nos menus: página anterior/seguinte da seleção    (LB / RB)
//
// A câmera fica sempre travada no adversário (padrão), sem botão de troca.
//
// TECLADO (revisado): os quatro botões de ação ficam num LOSANGO igual ao do controle —
//   I = △ Carga · J = □ Principal · L = ○ Físico · K = × Pulo (Espaço também pula)
// A mão esquerda fica nos "gatilhos": E = R2 Defesa, Shift = L2 Esquiva; Q = L1 e R = R1 (assistências).
// Equipe: Q/1 e R/2 chamam as assistências, 3 / 4 trocam de personagem.

export const KEYBOARD_LAYOUTS = {
  // Jogador 1 — lado esquerdo do teclado
  left: {
    up: ['KeyW'],
    down: ['KeyS'],
    left: ['KeyA'],
    right: ['KeyD'],
    // losango (mesma posição dos botões do controle)
    carga: ['KeyI'], // △ / Y
    ranged: ['KeyJ'], // □ / X
    physical: ['KeyL'], // ○ / B
    jump: ['KeyK', 'Space'], // × / A
    // gatilhos na mão esquerda
    block: ['KeyE'], // R2 / RT (segurar)
    dodge: ['ShiftLeft'], // L2 / LT
    assist1: ['KeyQ', 'Digit1'], // L1 / LB
    assist2: ['KeyR', 'Digit2'], // R1 / RB
    switch1: ['Digit3'],
    switch2: ['Digit4'],
    pageL: ['KeyQ'],
    pageR: ['KeyE'],
    select: ['Tab'],
    start: ['Escape'],
    interact: ['KeyE'], // Outro Lado: portas, baús, gavetas (a Dungeon decide se vira defesa)
  },
  // Jogador 2 — setas + teclado numérico (alternativas para notebook)
  // Jogador 2 — setas + teclado numérico, com o MESMO losango (8 △ · 4 □ · 6 ○ · 2 ×)
  right: {
    up: ['ArrowUp'],
    down: ['ArrowDown'],
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    carga: ['Numpad8'], // △
    ranged: ['Numpad4'], // □
    physical: ['Numpad6'], // ○
    jump: ['Numpad2', 'Numpad0'], // ×
    block: ['Numpad9'], // R2
    dodge: ['Numpad1', 'NumpadDecimal'], // L2
    assist1: ['Numpad7', 'NumpadDivide'], // L1
    assist2: ['Numpad3', 'NumpadMultiply'], // R1
    switch1: ['NumpadSubtract'],
    switch2: ['NumpadAdd'],
    pageL: ['PageUp'],
    pageR: ['PageDown'],
    start: ['Backspace'],
  },
};

// Gamepad no layout "standard" do navegador (Xbox / PlayStation). É o PADRÃO; cada jogador usa a sua cópia em
// GAMEPAD_LAYOUTS (que as trocas das Opções podem mudar)
export const GAMEPAD_LAYOUT = {
  jump: [0], // A / ×
  physical: [1], // B / ○
  ranged: [2], // X / □
  carga: [3], // Y / △
  assist1: [4], // LB / L1 (luta em equipe: assistência 1)
  assist2: [5], // RB / R1 (luta em equipe: assistência 2)
  pageL: [4], // LB / L1 (menus: página anterior)
  pageR: [5], // RB / R1 (menus: página seguinte)
  dodge: [6], // LT / L2
  block: [7], // RT / R2
  select: [8],
  start: [9],
  // switch1/switch2: analógico direito ◀/▶ (lido como eixo no InputManager) — o D-pad fica só para andar/menus
  up: [12],
  down: [13],
  left: [14],
  right: [15],
  interact: [1], // B / ○ no Outro Lado (perto de porta/gaveta/baú; senão é o ○)
};

export const GAMEPAD_DEADZONE = 0.25;

// Quem lê o quê. Cada jogador soma teclado + controle, então dá para jogar
// com dois controles, com teclado dividido ou misturado.
export const PLAYER_DEVICES = [
  { keyboard: 'left', gamepadSlot: 0 },
  { keyboard: 'right', gamepadSlot: 1 },
  // 3º lugar: só a CPU usa (o inimigo do Outro Lado no coop local, quando o P2 é gente)
  { keyboard: null, gamepadSlot: 2 },
];

// Nomes exibidos na HUD / tela de controles quando o jogador usa controle.
export const BUTTON_LABELS = {
  pad: {
    physical: 'B/○', ranged: 'X/□', carga: 'Y/△', jump: 'A/×',
    block: 'RT/R2', dodge: 'LT/L2', pageL: 'LB/L1', pageR: 'RB/R1', assist1: 'LB/L1', assist2: 'RB/R1', switch1: 'R◀', switch2: 'R▶',
  },
  // botões da tela (celular/tablet) — os mesmos rótulos de ui/touchControls.js
  touch: {
    physical: '○', ranged: '□', carga: '△', jump: '×', block: 'DEF', dodge: 'ESQ', assist1: 'AS1', assist2: 'AS2', switch1: '⇄1', switch2: '⇄2',
  },
};

// ------------------------------------------------------------------ TROCAR TECLAS E BOTÕES (Opções, 2026-11-26)
// O dono pediu (TODO, item 2 das melhorias das skills): cada ação do teclado e do controle, por jogador, salva nas
// opções. KEYBOARD_LAYOUTS e GAMEPAD_LAYOUTS são mudados NO LUGAR (quem já importou vê a troca); os padrões ficam
// guardados aqui embaixo para o "voltar ao padrão". SETTINGS.controls guarda só o que mudou:
//   { kb: [{ physical: ['KeyU'] }, {}], pad: [{ jump: [2] }, {}] }
const copy = (o) => JSON.parse(JSON.stringify(o));
const DEFAULT_KEYBOARD = copy(KEYBOARD_LAYOUTS);
export const GAMEPAD_LAYOUTS = [copy(GAMEPAD_LAYOUT), copy(GAMEPAD_LAYOUT), copy(GAMEPAD_LAYOUT)];

// as ações que a tela de troca mostra, na ordem (as do menu — pageL/pageR/select — e a pausa ficam fixas)
export const REMAP_ACTIONS = {
  kb: ['physical', 'ranged', 'carga', 'jump', 'block', 'dodge', 'assist1', 'assist2', 'switch1', 'switch2', 'up', 'down', 'left', 'right', 'interact'],
  pad: ['physical', 'ranged', 'carga', 'jump', 'block', 'dodge', 'assist1', 'assist2', 'interact'],
};
// teclas e botões que não podem ser usados: Esc/Backspace pausam, Enter confirma nos menus; Select/Start do controle
export const RESERVED_KEYS = ['Escape', 'Enter', 'Backspace', 'Tab', 'F5', 'F11', 'F12'];
export const RESERVED_BUTTONS = [8, 9];
// no Outro Lado, o P1 no teclado ainda tem estas teclas fixas (uma tecla por habilidade): avisamos se repetir
export const OUTRO_LADO_KEYS = { Digit1: 'quick1', Digit2: 'quick2', Digit3: 'quick3', Digit4: 'quick4', Digit5: 'quick5', KeyZ: 'quickSp', KeyG: 'grab', KeyC: 'carga', KeyF: 'lock' };

const kbName = (i) => PLAYER_DEVICES[i].keyboard;

export function defaultBinding(device, player, action) {
  if (device === 'kb') return (DEFAULT_KEYBOARD[kbName(player)] || {})[action] || [];
  return GAMEPAD_LAYOUT[action] || [];
}

// volta tudo ao padrão e aplica as trocas salvas por cima
export function applyControlBindings(saved) {
  for (const k of Object.keys(KEYBOARD_LAYOUTS)) {
    const L = KEYBOARD_LAYOUTS[k];
    for (const a of Object.keys(L)) if (!(a in DEFAULT_KEYBOARD[k])) delete L[a];
    Object.assign(L, copy(DEFAULT_KEYBOARD[k]));
  }
  GAMEPAD_LAYOUTS.forEach((L) => { for (const a of Object.keys(L)) delete L[a]; Object.assign(L, copy(GAMEPAD_LAYOUT)); });
  if (!saved) return;
  [0, 1].forEach((i) => {
    const kb = saved.kb && saved.kb[i];
    const L = KEYBOARD_LAYOUTS[kbName(i)];
    // o que sobrar vazio (só tecla reservada ou lixo) fica no padrão: nenhuma ação pode ficar sem tecla
    if (kb && L) for (const a of REMAP_ACTIONS.kb) {
      const ok = Array.isArray(kb[a]) ? kb[a].filter((c) => typeof c === 'string' && !RESERVED_KEYS.includes(c)) : [];
      if (ok.length) L[a] = ok;
    }
    const pad = saved.pad && saved.pad[i];
    if (pad) for (const a of REMAP_ACTIONS.pad) {
      const ok = Array.isArray(pad[a]) ? pad[a].filter((b) => Number.isInteger(b) && !RESERVED_BUTTONS.includes(b)) : [];
      if (ok.length) GAMEPAD_LAYOUTS[i][a] = ok;
    }
  });
}

// liga UMA tecla/botão a uma ação (substitui as que ela tinha) e devolve o objeto salvo atualizado
export function setBinding(saved, device, player, action, code) {
  const out = copy(saved || {});
  out[device] = out[device] || [{}, {}];
  out[device][player] = out[device][player] || {};
  const def = defaultBinding(device, player, action);
  if (def.length === 1 && def[0] === code) delete out[device][player][action];
  else out[device][player][action] = [code];
  return out;
}

export function resetBindings(saved, player) {
  const out = copy(saved || {});
  for (const d of ['kb', 'pad']) if (out[d]) out[d][player] = {};
  return out;
}

export function currentBinding(device, player, action) {
  if (device === 'kb') return (KEYBOARD_LAYOUTS[kbName(player)] || {})[action] || [];
  return GAMEPAD_LAYOUTS[player][action] || [];
}

// TECLA REPETIDA: quem mais (deste ou do outro jogador — o teclado é um só) usa esta tecla/botão.
// Devolve [{ player, action }]. No controle, cada jogador tem o seu, então só conta o mesmo jogador.
// Ficam de fora as duplas de propósito: interagir com a defesa (a Dungeon decide) e interagir com o físico no controle.
const SHARED_ON_PURPOSE = [['interact', 'block'], ['interact', 'physical']];
export function bindingConflicts(device, player, action, code) {
  const out = [];
  const players = device === 'kb' ? [0, 1] : [player];
  for (const p of players) {
    for (const a of REMAP_ACTIONS[device]) {
      if (p === player && a === action) continue;
      if (p === player && SHARED_ON_PURPOSE.some(([x, y]) => (x === a && y === action) || (y === a && x === action))) continue;
      if (currentBinding(device, p, a).includes(code)) out.push({ player: p, action: a });
    }
  }
  // no Outro Lado as assistências e as trocas do P1 ficam fixas (Q/R, sem troca): ali elas não brigam com 1–4
  const FIXED_IN_OUTRO = ['assist1', 'assist2', 'switch1', 'switch2'];
  if (device === 'kb' && player === 0 && OUTRO_LADO_KEYS[code] && OUTRO_LADO_KEYS[code] !== action && !FIXED_IN_OUTRO.includes(action)) out.push({ player: 0, action: OUTRO_LADO_KEYS[code], outroLado: true });
  return out;
}

// nomes dos botões do controle (layout standard), para a HUD e a tela de troca
export const PAD_NAMES = { 0: 'A/×', 1: 'B/○', 2: 'X/□', 3: 'Y/△', 4: 'LB/L1', 5: 'RB/R1', 6: 'LT/L2', 7: 'RT/R2', 8: 'Select', 9: 'Start', 10: 'L3', 11: 'R3', 12: '↑', 13: '↓', 14: '←', 15: '→', 16: 'Home' };
export const padName = (id) => PAD_NAMES[id] || `#${id}`;
