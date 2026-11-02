import * as THREE from 'three';

export function startSelfHarmTrance(world, controller, target, ability, applyHit) {
  const head = (fighter) => fighter.rig.joints.hd.getWorldPosition(new THREE.Vector3());
  const tears = world.fx.emitter({
    rate: 28,
    follow: () => head(target),
    particle: { color: 0x0a0810, speed: 0.4, spread: 0.12, life: 0.6, size: 0.08 },
  });
  world.fx.ring(head(target).add(new THREE.Vector3(0, 0.35, 0)), { color: ability.color, radius: 0.5, life: ability.trance, vertical: false });
  target.vel.set(0, 0, 0);
  target.stun(ability.trance, 'stagger');
  target.notify(ability.label || 'HIPNOSE ESPIRAL', true);
  world.onHit && world.onHit(controller, target, 0, { kind: 'ability', ability: ability.id });

  const strike = target.def.melee && target.def.melee.strikes && target.def.melee.strikes[0];
  for (let i = 0; i < (ability.hits ?? 1); i++) {
    world.after(0.3 + i * (ability.gap ?? 0), () => {
      if (target.state === 'ko') return;
      if (strike && strike.anim) target.anim.play(strike.anim, { restart: true, duration: 0.4 });
      applyHit(controller, target, {
        damage: ability.damage,
        kind: 'ability',
        element: ability.element || 'morte',
        knockback: 0,
        hitstun: 0.2,
        reaction: false,
        sound: 'punch',
        color: 0x1a1620,
        scale: 0.8,
      });
      if (target.state !== 'ko') target.stun(Math.max(0.05, ability.trance - (0.3 + i * (ability.gap ?? 0))), 'stagger');
    });
  }
  world.after(ability.trance, () => {
    tears.stop();
    if (target.state !== 'ko' && ability.slow) {
      target.addBuff({ type: 'curseSlow', name: 'LENTO', time: ability.slow.time, duration: ability.slow.time, speedMult: ability.slow.mult });
    }
  });
}
