import { inBounds } from './positioning.js';

export function vehicleBlocked(arena, vehicle, point) {
  if (vehicle === 'van' && arena.id === 'tipora') return !inBounds(arena, point.x, point.z, -0.6);
  return arena.blocksPoint(point, 0.4);
}
