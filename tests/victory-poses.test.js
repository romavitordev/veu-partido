import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER } from '../src/characters/index.js';
import { CLIPS } from '../src/anim/clips.js';

// Pedido do dono (2026-11-15): todo personagem tem a PRÓPRIA pose de vitória — nada da genérica ('victory') nem da
// pose de outro. As criaturas do Outro Lado (rugido) são a exceção: não são gente e rugem.
const CREATURES = new Set(['carnical', 'degolificada', 'espreitador']);

test('cada personagem jogável tem a própria pose de vitória', () => {
  const owner = new Map();
  const problems = [];
  for (const d of ROSTER) {
    if (CREATURES.has(d.id)) continue;
    const v = d.anims && d.anims.victory;
    if (!v || v === 'victory' || v === 'victory_hammer') { problems.push(`${d.id}: genérica (${v})`); continue; }
    if (!CLIPS[v]) { problems.push(`${d.id}: ${v} não existe`); continue; }
    // versões do mesmo personagem (baseId: Juan e Juan do Ódio) podem dividir a pose
    const who = d.baseId || d.id;
    if (owner.has(v) && owner.get(v) !== who) problems.push(`${d.id}: ${v} é de ${owner.get(v)}`);
    else owner.set(v, who);
  }
  assert.deepEqual(problems, []);
});
