import test from 'node:test';
import assert from 'node:assert/strict';
import { abilityUsePrior, canSpendDodge, CPU_LEVELS, OpponentPatternMemory } from '../src/ai/CpuController.js';
import { observePlayerMove, playerMoveRate } from '../src/ai/learner.js';

test('CPU tactics and adaptation increase with difficulty below Super Difícil', () => {
  assert.equal(CPU_LEVELS.easy.tactics, 0);
  assert.ok(CPU_LEVELS.normal.tactics < CPU_LEVELS.hard.tactics);
  assert.ok(CPU_LEVELS.hard.tactics < CPU_LEVELS.veryhard.tactics);
  assert.ok(CPU_LEVELS.normal.adapt < CPU_LEVELS.hard.adapt);
  assert.ok(CPU_LEVELS.hard.adapt < CPU_LEVELS.veryhard.adapt);
});

test('CPU retains enough dodge charges for substitution unless a projectile is imminent', () => {
  const fighter = { dodges: 2, cooldowns: { dodge: 0 } };
  assert.equal(canSpendDodge(fighter), false);

  fighter.dodges = 3;
  assert.equal(canSpendDodge(fighter), true);

  fighter.dodges = 1;
  assert.equal(canSpendDodge(fighter), false);
  assert.equal(canSpendDodge(fighter, true), true);

  fighter.dodges = 3;
  fighter.cooldowns.dodge = 0.2;
  assert.equal(canSpendDodge(fighter, true), false);
});

test('CPU ability priorities respond to openings, health, and active buffs', () => {
  const fighter = {
    health: 400,
    maxHealth: 1500,
    findBuff: (type) => ['heavyProtection', 'healing'].includes(type) ? { type } : null,
  };
  const opponent = { state: 'attack', isInvulnerable: () => false };
  const heal = { id: 'heal', type: 'healOverTime' };
  const protection = { id: 'guard', type: 'heavyProtection' };
  const punish = { id: 'punish', type: 'heavyBlow', ai: { when: 'opening' } };

  assert.equal(abilityUsePrior(heal, fighter, opponent, { distance: 5, lowHp: true }), 0);
  assert.equal(abilityUsePrior(protection, fighter, opponent, { distance: 2, lowHp: true, threat: true }), 0);
  assert.ok(abilityUsePrior(heal, { ...fighter, findBuff: () => null }, opponent, { distance: 5, lowHp: true }) > 0);
  assert.equal(abilityUsePrior(punish, fighter, opponent, { distance: 2, opening: false }), 0);
  assert.ok(abilityUsePrior(punish, fighter, opponent, { distance: 2, opening: true }) > 0);
});

test('opponent pattern memory counts repeated moves and expires old observations', () => {
  const memory = new OpponentPatternMemory();
  const strike = { name: 'Corte lateral' };
  const opponent = {
    def: { id: 'arnaldo', ranged: null, special: null },
    state: 'attack',
    stateTime: 0,
    combo: { strike },
  };

  const move = memory.observe(opponent, 0);
  assert.equal(memory.count(move, 0), 1);

  opponent.state = 'idle';
  memory.observe(opponent, 0.4);
  opponent.state = 'attack';
  opponent.stateTime = 0;
  memory.observe(opponent, 1);
  assert.equal(memory.count(move, 1), 2);

  opponent.combo.strike = { name: 'Estocada' };
  opponent.stateTime = 0;
  const otherMove = memory.observe(opponent, 1.5);
  assert.notEqual(otherMove, move);
  assert.equal(memory.count(otherMove, 1.5), 1);
  assert.equal(memory.count(move, 14), 0);
});

test('player move profile learns repeated moves for later matches', () => {
  const move = 'melee:test-character:Test Strike';
  const other = 'ranged:test-character:main';
  assert.equal(playerMoveRate(move), 0);

  for (let i = 0; i < 6; i++) observePlayerMove(move);
  for (let i = 0; i < 2; i++) observePlayerMove(other);

  assert.equal(playerMoveRate(move), 0.75);
  assert.equal(playerMoveRate(other), 0.25);
});

test('CPU contorna o obstáculo no caminho (a fogueira de Treb Ciach) em vez de empacar', async () => {
  const { CpuController } = await import('../src/ai/CpuController.js');
  const { blocksPointGeneric } = await import('../src/combat/positioning.js');
  const arena = { radius: 18.5, colliders: [{ x: 0, z: 0, r: 4.8 }] };
  arena.blocksPoint = (p, r) => blocksPointGeneric(arena, p, r);
  const opp = { pos: { x: 0, z: 7 } };
  const f = {
    pos: { x: 0, z: -6.2 }, radius: 0.45, state: 'idle',
    world: { arena, time: 0, opponentOf: () => opp },
    moveBasis: () => ({ right: { x: 1, z: 0 }, forward: { x: 0, z: 1 } }),
  };
  const c = Object.create(CpuController.prototype);
  c.fighter = f;
  // quer ir reto para +z, através da fogueira: sai uma direção desviada para um lado, ainda para a frente
  const out = c.steerAround({ moveX: 0, moveY: 1, held: {} }, 1 / 60);
  assert.ok(Math.abs(out.moveX) > 0.3, `desviou de lado: ${out.moveX}`);
  assert.ok(out.moveY > -0.2, 'não volta para trás');
  // caminho livre: não mexe
  f.pos = { x: 8, z: -6 };
  c.detour = null;
  f.world.time = 5;
  const free = c.steerAround({ moveX: 0, moveY: 1, held: {} }, 1 / 60);
  assert.deepEqual([free.moveX, free.moveY], [0, 1]);
  // golpe com direção (botão apertado): não mexe
  f.pos = { x: 0, z: -6.2 };
  const atk = c.steerAround({ moveX: 0, moveY: 1, held: { physical: true } }, 1 / 60);
  assert.deepEqual([atk.moveX, atk.moveY], [0, 1]);
});
