// TECLAS E BOTÕES (Opções, 2026-11-26): a troca vale no mapa que o jogo lê, aparece nos rótulos, avisa tecla
// repetida e volta ao padrão.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KEYBOARD_LAYOUTS, GAMEPAD_LAYOUTS, REMAP_ACTIONS, applyControlBindings, setBinding, resetBindings,
  currentBinding, bindingConflicts,
} from '../src/config/controls.js';
import { actionLabel } from '../src/ui/labels.js';

test('trocar o ataque físico do P1 muda o mapa do teclado e o rótulo', () => {
  const saved = setBinding(null, 'kb', 0, 'physical', 'KeyU');
  applyControlBindings(saved);
  assert.deepEqual(KEYBOARD_LAYOUTS.left.physical, ['KeyU']);
  assert.equal(actionLabel(0, 'physical'), 'U');
  assert.deepEqual(KEYBOARD_LAYOUTS.right.physical, ['Numpad6'], 'o P2 não muda');
  applyControlBindings(null);
  assert.deepEqual(KEYBOARD_LAYOUTS.left.physical, ['KeyL']);
});

test('o controle é por jogador', () => {
  applyControlBindings(setBinding(null, 'pad', 1, 'jump', 2));
  assert.deepEqual(GAMEPAD_LAYOUTS[1].jump, [2]);
  assert.deepEqual(GAMEPAD_LAYOUTS[0].jump, [0]);
  assert.equal(actionLabel(1, 'jump', 'gamepad'), 'X/□');
  applyControlBindings(null);
});

test('voltar a tecla padrão não guarda nada; voltar ao padrão limpa só o jogador', () => {
  let s = setBinding(null, 'kb', 0, 'physical', 'KeyU');
  s = setBinding(s, 'kb', 0, 'physical', 'KeyL');
  assert.deepEqual(s.kb[0], {});
  s = setBinding(s, 'kb', 0, 'ranged', 'KeyU');
  s = setBinding(s, 'kb', 1, 'ranged', 'Numpad5');
  s = resetBindings(s, 0);
  assert.deepEqual(s.kb[0], {});
  assert.deepEqual(s.kb[1], { ranged: ['Numpad5'] });
});

test('o padrão não tem tecla repetida; repetir avisa quem mais usa', () => {
  applyControlBindings(null);
  for (const p of [0, 1]) {
    for (const d of ['kb', 'pad']) {
      for (const a of REMAP_ACTIONS[d]) {
        for (const c of currentBinding(d, p, a)) assert.deepEqual(bindingConflicts(d, p, a, c), [], `${d} P${p + 1} ${a}`);
      }
    }
  }
  applyControlBindings(setBinding(null, 'kb', 0, 'ranged', 'KeyE'));
  const who = bindingConflicts('kb', 0, 'ranged', 'KeyE').map((c) => c.action);
  assert.ok(who.includes('block'));
  applyControlBindings(null);
});

test('teclas reservadas e lixo salvo são ignorados', () => {
  applyControlBindings({ kb: [{ physical: ['Escape'], jump: 'x' }, null], pad: [{ jump: [9] }] });
  assert.deepEqual(KEYBOARD_LAYOUTS.left.physical, ['KeyL']);
  assert.deepEqual(KEYBOARD_LAYOUTS.left.jump, ['KeyK', 'Space']);
  assert.deepEqual(GAMEPAD_LAYOUTS[0].jump, [0]);
  applyControlBindings(null);
});
