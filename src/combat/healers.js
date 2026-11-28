import * as THREE from 'three';

// OS CURANDEIROS (dono, 2026-11-28: "personagens curandeiros agora devem curar quando estiver na assistência e pode curar
// o amigo no coop se segurar o botão da habilidade próximo do amigo"). Quem cuida dos outros na história — a socorrista,
// o paramédico, o curso de primeiros socorros, a curandeira da Vigília, o remendão e o Envelhecimento Localizado do Joui:
//  · na ASSISTÊNCIA (Batalha em Equipe), além da ação de sempre, cura o parceiro um pouco;
//  · no COOP, a habilidade de cura usada PERTO do amigo cura o amigo enquanto o botão fica segurado.
// Os números são PROPOSTA. Erin e Dante já curam o parceiro na assistência deles (andando) e ficam de fora da cura extra.
export const HEALERS = new Set(['zuri', 'dara', 'rubens', 'caio', 'chico', 'joui']);

export const HEAL_ASSIST = { amount: 70, time: 1.5 }; // cura da assistência no parceiro
export const HEAL_ALLY = { reach: 2.6, keep: 3.4 }; // distância para começar e para continuar curando o amigo

const GREEN = 0x7dffb0;

export function isHealer(def) {
  if (!def) return false;
  if (HEALERS.has(def.baseId || def.id)) return true;
  return (def.passives || []).some((p) => p.type === 'curandeira');
}

// cura aos poucos, respeitando a FERIDA ABERTA (noHeal) e o KO
function addHealTick(world, target, { amount, time, name, onTick, until }) {
  let given = 0;
  let t = 0;
  const buff = {
    type: 'allyHeal', name, time, duration: time,
    onTick(dt) {
      t += dt;
      if (target.state === 'ko' || target.downed) { this.time = 0; return; }
      if (until && !until()) { this.time = 0; return; }
      if (target.findBuff('noHeal')) return;
      const n = Math.min(amount - given, (amount / time) * dt);
      if (n > 0) {
        given += n;
        target.health = Math.min(target.maxHealth, target.health + n);
      }
      if (Math.random() < 0.35) world.fx.burst(target.chestPos(), { count: 2, color: GREEN, speed: 0.6, up: 1, life: 0.6, size: 0.18 });
      if (onTick) onTick(dt, t);
    },
  };
  const old = target.findBuff('allyHeal');
  if (old) old.time = 0;
  target.addBuff(buff);
  return buff;
}

// ASSISTÊNCIA: o curandeiro chamado cura o parceiro (em qualquer ação)
export function assistHeal(world, healerDef, owner) {
  if (!isHealer(healerDef) || owner.state === 'ko') return;
  addHealTick(world, owner, { ...HEAL_ASSIST, name: `CURA (${healerDef.name.split(' ')[0]})` });
  world.fx.ring(new THREE.Vector3(owner.pos.x, 0.06, owner.pos.z), { color: GREEN, radius: 1.4, life: 0.5 });
  owner.notify('CURADO!', true);
}

// os botões da habilidade ('block+carga') ainda segurados
export function abilityHeld(f, a) {
  const held = f.input && f.input.held;
  if (!held) return false;
  return String(a.input || 'carga').split('+').every((k) => held[k]);
}

// COOP: o amigo de pé, ferido e perto
export function nearbyAlly(world, f) {
  const ally = world.allyOf ? world.allyOf(f) : null;
  if (!ally || ally.state === 'ko' || ally.downed || ally.health >= ally.maxHealth) return null;
  return Math.hypot(ally.pos.x - f.pos.x, ally.pos.z - f.pos.z) <= HEAL_ALLY.reach ? ally : null;
}

// COOP: cura o amigo com a mesma habilidade, enquanto o curandeiro segura o botão e fica perto. Rende o mesmo que a
// cura em si mesmo (com o bônus da Curandeira), e um fio de luz liga os dois
export function healAlly(world, f, ally, a, H) {
  const mat = new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.7 });
  const geo = new THREE.BufferGeometry().setFromPoints([f.chestPos(), ally.chestPos()]);
  const line = new THREE.Line(geo, mat);
  world.scene.add(line);
  const time = Math.max(2, a.duration || 2);
  const buff = addHealTick(world, ally, {
    amount: H, time, name: `CURA (${f.def.name.split(' ')[0]})`,
    until: () => f.state !== 'ko' && abilityHeld(f, a) && Math.hypot(ally.pos.x - f.pos.x, ally.pos.z - f.pos.z) <= HEAL_ALLY.keep,
    onTick: () => geo.setFromPoints([f.chestPos(), ally.chestPos()]),
  });
  buff.onEnd = () => {
    world.scene.remove(line);
    geo.dispose();
    mat.dispose();
  };
  ally.notify('O AMIGO ESTÁ CURANDO', true);
  f.notify('CURANDO O AMIGO — SEGURE', true);
  world.fx.ring(new THREE.Vector3(ally.pos.x, 0.06, ally.pos.z), { color: GREEN, radius: 1.2, life: 0.5 });
}
