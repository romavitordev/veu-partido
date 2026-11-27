// FEEDBACK EM TRÊS PESOS (TODO, item 5 das melhorias das skills — game-feel, 2026-11-27).
// Uma tabela só decide quanto "barulho" cada acontecimento do Outro Lado faz: som (volume), partículas, anel no chão,
// tremor da câmera e pausa de impacto. Assim um evento comum (pegar moeda) nunca faz mais festa que um raro (derrubar
// o chefe). Para mudar o peso de um evento, troque só EVENT_WEIGHT; para mudar um peso, só FEEDBACK_TIERS.
//   pequeno  moeda, cura, xp, chave                      — só o som baixo e umas faíscas
//   médio    baú, subir de nível, achado, recompensa,    — som cheio, mais faíscas e um anel
//            voltar à vida, item grande do chão
//   grande   chefe derrubado, fusão descoberta           — tudo: som no máximo, anel largo, tremor e pausa de impacto
// O tremor respeita "Efeitos de tela reduzidos" (CameraRig.shake já o diminui).
import * as THREE from 'three';

export const FEEDBACK_TIERS = {
  small: { volume: 0.6, burst: 10, ring: 0, shake: 0, shakeTime: 0, hitstop: 0 },
  medium: { volume: 0.85, burst: 24, ring: 1.6, shake: 0.08, shakeTime: 0.25, hitstop: 0 },
  large: { volume: 1, burst: 44, ring: 3.2, shake: 0.35, shakeTime: 0.6, hitstop: 0.12 },
};

export const EVENT_WEIGHT = {
  coin: 'small',
  heal: 'small',
  xp: 'small',
  key: 'small',
  chest: 'medium',
  levelUp: 'medium',
  reward: 'medium',
  relic: 'medium',
  fusion: 'medium', // uma fusão já conhecida
  revive: 'medium',
  bigPickup: 'medium',
  discovery: 'large', // fusão ou achado que aparece pela 1ª vez no save
  bossDown: 'large',
};

// o som de cada evento (o volume vem do peso)
const SOUND = {
  coin: ['pickup', 1.4], heal: ['pickup', 1], xp: ['pickup', 1.1], key: ['pickup', 1.1],
  chest: ['levelUp', 1], levelUp: ['levelUp', 1], reward: ['levelUp', 1.1], relic: ['levelUp', 1.15], fusion: ['levelUp', 0.8],
  revive: ['levelUp', 1], bigPickup: ['levelUp', 1], discovery: ['levelUp', 0.8], bossDown: ['levelUp', 0.7],
};

export const weightOf = (event) => EVENT_WEIGHT[event] || 'small';
export const tierOf = (event) => FEEDBACK_TIERS[weightOf(event)];

// world: o World da fase (audio, fx, cameraRig, hitstop). opts: at (Vector3, onde), color, pitch, sound:false (o som já
// tocou em outro lugar), volume (multiplica o do peso)
export function feedback(world, event, opts = {}) {
  if (!world) return null;
  const T = tierOf(event);
  const [name, pitch] = SOUND[event] || ['pickup', 1];
  if (opts.sound !== false && world.audio) world.audio.play(name, { volume: T.volume * (opts.volume ?? 1), pitch: opts.pitch ?? pitch });
  const at = opts.at;
  const color = opts.color ?? 0xf2c230;
  if (at && world.fx) {
    if (T.burst) world.fx.burst(new THREE.Vector3(at.x, (at.y ?? 0) + 0.8, at.z), { count: T.burst, color, speed: 3, life: 0.6, size: 0.14, up: 1.8 });
    if (T.ring) world.fx.ring(new THREE.Vector3(at.x, 0.06, at.z), { color, radius: T.ring, life: 0.6 });
  }
  if (T.shake && world.cameraRig) world.cameraRig.shake(T.shake, T.shakeTime);
  if (T.hitstop && world.hitstop) world.hitstop(T.hitstop);
  return T;
}
