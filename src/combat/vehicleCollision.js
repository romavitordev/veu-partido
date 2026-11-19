import { inBounds } from './positioning.js';

export function vehicleBlocked(arena, vehicle, point) {
  if (vehicle === 'van' && arena.id === 'tipora') return !inBounds(arena, point.x, point.z, -0.6);
  return arena.blocksPoint(point, 0.4);
}

// OS CARROS DOS GOLPES (dono, 2026-11-19: "em algumas fases eles travam na parede, outras eles permanecem no mapa mesmo
// depois de acabar o golpe"): a PISTA LIVRE — o carro nascia atrás de quem chama, às vezes dentro de uma parede/casa, e a
// primeira checagem já batia. `clearStart` aproxima o ponto de partida do alvo até achar chão livre (e tenta o lado
// oposto); `clearLane` diz se o trecho até o alvo está livre.
export function clearLane(arena, vehicle, from, to, step = 0.8) {
  const dx = to.x - from.x, dz = to.z - from.z;
  const L = Math.hypot(dx, dz);
  const p = { x: 0, y: 0.6, z: 0 };
  for (let s = 0; s <= L; s += step) {
    p.x = from.x + (dx * s) / L; p.z = from.z + (dz * s) / L;
    if (vehicleBlocked(arena, vehicle, p)) return false;
  }
  return true;
}

export function clearStart(arena, vehicle, start, aim, minDist = 3) {
  const free = (x, z) => !vehicleBlocked(arena, vehicle, { x, y: 0.6, z });
  // procura uma PISTA inteira livre até o alvo (antes só o ponto de partida: no Suvaco/Igreja/Acampamento o carro
  // nascia livre mas com uma mesa/banco no caminho e batia no 1º quadro, sem atropelar ninguém): primeiro atrás de
  // quem chama, depois girando a pista em volta do alvo (até o lado oposto); em cada direção, de longe para perto
  const D = Math.max(minDist, Math.hypot(start.x - aim.x, start.z - aim.z));
  const phi = Math.atan2(start.x - aim.x, start.z - aim.z);
  let fallback = null;
  for (let k = 0; k <= 16; k++) {
    const ang = phi + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 8);
    for (let d = D; d >= minDist; d -= 0.5) {
      const x = aim.x + Math.sin(ang) * d, z = aim.z + Math.cos(ang) * d;
      if (!free(x, z)) continue;
      if (!fallback) fallback = { x, z };
      // a frente do carro também (2,2 m adiante) e o caminho todo até o alvo
      if (clearLane(arena, vehicle, { x, z }, aim, 0.5)) return { x, z };
    }
  }
  return fallback || { x: start.x, z: start.z };
}

// o VIGIA do carro: qualquer que seja o fim do golpe (acabou, foi interrompido, o round virou, a sala mudou), o carro
// sai de cena; `maxLife` é o limite de segurança
export function trackVehicle(world, car, maxLife = 8) {
  let t = 0;
  world.scene.add(car);
  const w = {
    gone: false,
    remove() { if (w.gone) return; w.gone = true; world.scene.remove(car); },
  };
  world.addTicker({
    update(dt) { t += dt; if (w.gone) return true; if (t > maxLife) { w.remove(); return true; } return false; },
    dispose() { w.remove(); },
  });
  return w;
}
