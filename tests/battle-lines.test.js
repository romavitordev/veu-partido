import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER } from '../src/characters/index.js';
import { battleLines } from '../src/config/dialogues.js';

// Pedido do dono (2026-11-15): os personagens recentes estavam mudos na luta — o battleLines() exige fala dos DOIS
// lados, então faltar em um calava a luta inteira. Agora todo par do elenco tem troca de vida baixa e de especial.
const FORMS = ['carina_leone', 'luciano', 'beatrice_existida', 'erin_caos', 'aguiar_mutilador', 'labirinto_elmo', 'joui_shinokage', 'raziel_verdadeiro', 'celestine_magistrada'];

test('todo par do elenco tem fala de combate (vida baixa e especial)', () => {
  const ids = ROSTER.map((d) => d.id);
  const missing = [];
  for (const a of ids) for (const b of ids) for (const ev of ['critical', 'special']) if (a !== b && !battleLines(a, b, ev)) missing.push(`${a}→${b} ${ev}`);
  assert.deepEqual(missing.slice(0, 20), []);
});

test('as formas novas falam ao transformar e na luta', () => {
  for (const f of FORMS) {
    assert.ok(battleLines(f, 'arthur', 'transform'), `${f} transform`);
    assert.ok(battleLines(f, 'arthur', 'critical'), `${f} critical`);
    assert.ok(battleLines('arthur', f, 'special'), `resposta de ${f}`);
  }
  // a volta do Luciano para o Fernando
  assert.equal(battleLines('fernando', 'eloy', 'transform')[0][1], 'Luciano...? Obrigado. Deixa comigo agora.');
});
