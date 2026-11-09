// AS SALAS DO OUTRO LADO COMO ARENA DE LUTA (pedido do dono, 2026-11-09: "nem portas tem"): no modo Outro Lado as
// portas, os armários do Espreitador, as gavetas e as caixas do bunker são objetos do JOGO (pve/Dungeon.js), não do
// .glb — recortada para a luta, a sala ficava com buracos pretos no lugar das portas e sem os móveis que a contam.
// Aqui eles entram parados (decoração sólida): portas fechadas, armários entreabertos com os olhos espiando, gavetas
// fechadas e as caixas de mantimentos. As posições são as mesmas de pve/dungeons.js.
import { RoomDoor, Drawer } from '../pve/roomDoors.js';
import { Closet } from '../pve/espreitador.js';
import { Breakable } from '../pve/breakables.js';

export function dressFightRoom(world, d) {
  const doors = (d.doors || []).map((spot) => new RoomDoor(world, spot, { locked: true, open: 0 }));
  const closets = (d.closets || []).map((spot, i) => new Closet(world, null, spot, i));
  const drawers = (d.drawers || []).map((spot) => new Drawer(world, spot, null));
  const crates = (d.crates || []).map((s) => new Breakable(world, null, { x: s.x, z: s.z, kind: 'crate', yaw: s.yaw ?? 0 }));
  const away = { pos: { x: 1e4, z: 1e4 } }; // ninguém perto: a porta fica fechada e sem brilho
  // fica a partida inteira (os efeitos do World são limpos a cada round): o World chama update e dispose
  return {
    // os armários balançam a fresta e os olhos piscam lá dentro (o Espreitador observa a luta)
    update(dt) {
      for (const c of closets) c.tick(dt);
      for (const dr of doors) dr.update(dt, away);
    },
    dispose() {
      for (const x of [...doors, ...closets, ...drawers, ...crates]) x.dispose && x.dispose();
    },
  };
}
