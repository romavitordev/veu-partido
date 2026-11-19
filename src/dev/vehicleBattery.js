// BATERIA DOS CARROS DOS GOLPES (dev): o Racha da Dara, a Van dos Cinco do Chico e a Direção Avançada do Cristopher em
// todas as arenas, no meio, de COSTAS para a parede e de FRENTE para a parede. Conta o dano, os quadros com o carro
// dentro de parede/casa, se ele ficou parado (travado) e se sobrou carro na cena no fim. Não faz parte do jogo:
//   const B = await import('/src/dev/vehicleBattery.js'); B.run(); /* depois */ B.report()
import { preloadPveArena } from '../arena/index.js';
import { vehicleBlocked } from '../combat/vehicleCollision.js';

const CASES = [
  { char: 'dara', kind: 'special' },
  { char: 'chico', kind: 'ability', id: 'vanDosCinco' },
  { char: 'cristopher', kind: 'ability', id: 'direcaoAvancada' },
];
const out = [];
let state = { running: false, done: 0, total: 0 };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// anda do centro na direção (dx, dz) até a primeira parede (ou o limite da arena)
function edge(arena, dx, dz) {
  let last = 0;
  for (let s = 0.5; s < 40; s += 0.25) {
    if (vehicleBlocked(arena, 'van', { x: dx * s, y: 0.6, z: dz * s })) break;
    last = s;
  }
  return last;
}

function bigNew(scene, before) {
  return scene.children.filter((o) => !before.has(o) && o.isObject3D && o.type !== 'Points' && o.type !== 'Sprite' && (o.children.length > 2 || o.isGroup));
}

async function one(arenaId, C, place) {
  const g = window.__game;
  await preloadPveArena(arenaId);
  const m = g.quick(C.char, 'joui', false, arenaId);
  const tgt = () => m.fighters[1];
  for (let i = 0; i < 4; i++) { g.step(48); await pause(0); } // ROUND → LUTE
  const [a, b] = m.fighters;
  const w = m.world;
  const arena = w.arena;
  const ang = place.ang;
  const dx = Math.sin(ang), dz = Math.cos(ang);
  const E = edge(arena, dx, dz);
  let A, Bp;
  if (place.kind === 'meio') { A = { x: 0, z: 0 }; Bp = { x: dx * 2.5, z: dz * 2.5 }; }
  else if (place.kind === 'costas') { const s = Math.max(0, E - 1.2); A = { x: dx * s, z: dz * s }; Bp = { x: dx * (s - 2.5), z: dz * (s - 2.5) }; }
  else { const s = Math.max(2.5, E - 1.2); Bp = { x: dx * s, z: dz * s }; A = { x: dx * (s - 2.5), z: dz * (s - 2.5) }; }
  a.pos.set(A.x, 0, A.z); b.pos.set(Bp.x, 0, Bp.z);
  a.yaw = Math.atan2(Bp.x - A.x, Bp.z - A.z); b.yaw = a.yaw + Math.PI;
  a.vel.set(0, 0, 0); b.vel.set(0, 0, 0);
  a.energy = a.maxEnergy; a.cooldowns.special = 0;
  for (const k in a.cooldowns) a.cooldowns[k] = 0;
  b.cpuEdge = 0;
  const hp0 = tgt().health;
  const before = new Set(w.scene.children);
  let err = null;
  try {
    if (C.kind === 'special') a.trySpecial();
    else {
      const ab = (a.def.abilities || []).find((x) => x.id === C.id);
      a.useAbility(ab);
    }
  } catch (e) { err = String(e).slice(0, 80); }
  let inWall = 0, stuck = 0, seen = 0, maxN = 0;
  const lastPos = new Map();
  for (let f = 0; f < 600; f++) {
    try { g.step(1); } catch (e) { err = String(e).slice(0, 80); break; }
    b.cpuEdge = 0;
    const vans = bigNew(w.scene, before).filter((o) => o.children.length > 3);
    maxN = Math.max(maxN, vans.length);
    for (const o of vans) {
      seen++;
      if (vehicleBlocked(arena, C.char === 'cristopher' ? 'car' : 'van', { x: o.position.x, y: 0.6, z: o.position.z })) inWall++;
      const lp = lastPos.get(o);
      if (lp && Math.hypot(lp.x - o.position.x, lp.z - o.position.z) < 0.001) stuck++;
      lastPos.set(o, { x: o.position.x, z: o.position.z });
    }
    if (f % 60 === 0) await pause(0);
    if (f > 120 && a.state === 'idle' && !w.cinematic && !a.seq) {
      // mais um respiro para o carro sair de cena
      for (let k = 0; k < 90; k++) g.step(1);
      break;
    }
  }
  const left = bigNew(w.scene, before).filter((o) => o.children.length > 3).length;
  return { arena: arenaId, char: C.char, place: place.kind, ang: +ang.toFixed(2), edge: +E.toFixed(1), dmg: Math.round(hp0 - tgt().health), inWall, stuck, seen, maxN, left, err };
}

// as variantes de horário dividem o mesmo mapa: só os originais
const BASE = ['orfanato', 'suvaco', 'coliseu', 'santo_berco', 'acampamento', 'igreja', 'palco', 'tipora', 'ferro_velho', 'circo', 'passaros', 'treb_ciach', 'mansao_luta', 'escola_luta'];
export async function run(arenas = BASE) {
  out.length = 0;
  const places = [];
  for (const ang of [0, Math.PI / 2]) for (const kind of ['meio', 'costas', 'frente']) if (!(kind === 'meio' && ang)) places.push({ kind, ang });
  state = { running: true, done: 0, total: arenas.length * CASES.length * places.length };
  for (const id of arenas) for (const C of CASES) for (const p of places) {
    try { out.push(await one(id, C, p)); } catch (e) { out.push({ arena: id, char: C.char, place: p.kind, err: String(e).slice(0, 100) }); }
    state.done++;
  }
  state.running = false;
  return state;
}

export function status() { return { ...state }; }
export function report(filter = (r) => r.err || r.left || r.inWall > 5 || r.stuck > 40 || r.dmg <= 0) {
  return out.filter(filter);
}
export function all() { return out; }
