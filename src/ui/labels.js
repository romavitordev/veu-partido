import { KEYBOARD_LAYOUTS, PLAYER_DEVICES, BUTTON_LABELS, GAMEPAD_LAYOUTS, padName } from '../config/controls.js';

const NAMES = { Space: 'Espaço', Semicolon: 'Ç', Escape: 'Esc', Backspace: '⌫', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', ShiftLeft: 'Shift', ShiftRight: 'Shift D', PageUp: 'PgUp', PageDown: 'PgDn', NumpadDivide: 'N/', NumpadMultiply: 'N*', NumpadSubtract: 'N-', NumpadAdd: 'N+', NumpadDecimal: 'N,' };

export function keyName(code) {
  if (NAMES[code]) return NAMES[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Numpad')) return 'N' + code.slice(6);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}

// Rótulo do botão de uma ação, conforme o dispositivo em uso pelo jogador.
// PARTIDA LAN: cada um joga com o teclado do P1 do próprio computador (inclusive o convidado, que é o P2)
let netplay = false;
export function setLabelNetplay(v) {
  netplay = !!v;
}

// (2026-11-26) com as TECLAS E BOTÕES trocados nas Opções, o rótulo vem do mapa de cada jogador
export function actionLabel(playerIndex, action, source = 'keyboard') {
  const slot = netplay ? 0 : playerIndex;
  if (source === 'gamepad') {
    const ids = (GAMEPAD_LAYOUTS[slot] || {})[action];
    if (ids && ids.length) return padName(ids[0]);
    return BUTTON_LABELS.pad[action] || action; // o que não é botão (o analógico direito)
  }
  if (source === 'touch') return BUTTON_LABELS.touch[action] || action; // celular: os símbolos dos botões da tela
  const layout = KEYBOARD_LAYOUTS[PLAYER_DEVICES[slot].keyboard];
  // INTERAGIR: o P2 no teclado interage com a própria tecla de defesa
  const codes = layout[action] || (action === 'interact' ? layout.block : null);
  return codes && codes.length ? keyName(codes[0]) : '?';
}

export function moveLabel(playerIndex) {
  const l = KEYBOARD_LAYOUTS[PLAYER_DEVICES[netplay ? 0 : playerIndex].keyboard];
  return [l.up, l.left, l.down, l.right].map((c) => keyName(c[0])).join('');
}
