// FOGO NO CHÃO DO CENÁRIO (2026-11-01, pedido do dono: "a fogueira do Acampamento deveria ter como andar por cima"):
// zonas de fogo do config da arena (fireZones: [{ x, z, radius, height, dps, deathDps }]) que não bloqueiam — quem
// pisa queima devagar: 1 de dano por segundo, 2 se for uma CRIATURA DE MORTE (o fogo purifica o que é do Outro Lado).
// Criatura de Morte: elemento Morte e origem no Outro Lado (Carniçal, Estrangeiro) ou a forma Deus da Morte; humanos
// que usam Morte (Nubi, Dante...) queimam como todo mundo.
const DEATH_FORMS = new Set(['deus_morte']);

export function isDeathCreature(f) {
  const d = f.def || {};
  return d.element === 'morte' && (d.origin === 'Outro Lado' || DEATH_FORMS.has(d.id));
}

export function updateFireZones(world, zones, dt) {
  for (const f of world.fighters) {
    if (!f || f.state === 'ko' || f.health <= 0) continue;
    const z = zones.find((q) => (f.pos.x - q.x) ** 2 + (f.pos.z - q.z) ** 2 <= q.radius * q.radius && f.pos.y <= (q.height ?? 1.0));
    if (!z) { f.fireBurnAcc = 0; continue; }
    f.fireBurnAcc = (f.fireBurnAcc || 0) + (isDeathCreature(f) ? z.deathDps ?? 2 : z.dps ?? 1) * dt;
    if (f.fireBurnAcc < 1) continue;
    const n = Math.floor(f.fireBurnAcc);
    f.fireBurnAcc -= n;
    f.takeDamage(n);
    f.flash = 0;
    world.fx.burst(f.pos.clone().setY(0.3), { count: 6, color: 0xff8a3a, speed: 1.6, life: 0.4, size: 0.12 });
  }
}
