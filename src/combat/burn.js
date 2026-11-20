// O estado QUEIMANDO (fogo que fica no alvo por alguns segundos). Módulo sem dependências de propósito: damage.js usa
// (o Fogo em Geral do Franco) e importar tristanAbilities.js de lá fazia um ciclo de imports.
const FIRE = 0xff7a2a; // o mesmo laranja de cristinoAbilities.FIRE

export function igniteFighter(world, owner, foe, { dps = 10, duration = 2.5 } = {}) {
  if (!foe || foe.state === 'ko') return;
  // CICATRIZES DO INCÊNDIO (Marius, salvo do incêndio por Veritus): o fogo não pega nele
  if ((foe.def.passives || []).some((p) => p.type === 'fireScars')) return;
  let b = foe.findBuff('burn');
  if (!b) {
    b = { type: 'burn', name: 'QUEIMANDO', time: duration, duration };
    foe.addBuff(b);
  }
  b.time = Math.max(b.time || 0, duration);
  b.duration = Math.max(b.duration || 0, duration);
  b.dps = Math.max(b.dps || 0, dps);
  if (!b.onTick) {
    let acc = 0;
    b.onTick = (dt) => {
      if (foe.state === 'ko' || !b.dps) return;
      acc += b.dps * dt;
      if (acc >= 1) {
        const n = Math.floor(acc);
        acc -= n;
        foe.takeDamage(n);
        foe.flash = 0;
        if (Math.random() < 0.5) world.fx.burst(foe.chestPos(), { count: 3, color: Math.random() < 0.5 ? FIRE : 0xffd070, speed: 1, up: 2.2, life: 0.35, size: 0.22 });
        world.onHit && world.onHit(owner, foe, n, { kind: 'burn' });
      }
    };
  }
}
