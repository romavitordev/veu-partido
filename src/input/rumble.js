import { PLAYER_DEVICES } from '../config/controls.js';
import { SETTINGS } from '../config/settings.js';

// VIBRAÇÃO DO CONTROLE (Gamepad API: gamepad.vibrationActuator.playEffect('dual-rumble')). Só no CONTROLE — no
// celular o aparelho não vibra (decisão do dono, 2026-11-15: "sem vibração no cll, só no controle"). Vibra pelo PESO:
// apanhar forte > bater forte > apanhar leve > defender. Só para quem está jogando COM o controle (input.source
// 'gamepad'); CPU, teclado, toque e o outro jogador do online não vibram. Opção: OPÇÕES › Vibração do controle.

// [forte (motor grande), fraco (motor pequeno), duração ms]
export const RUMBLE = {
  block: [0, 0.22, 60],
  hitLight: [0.15, 0.35, 90],
  hitHeavy: [0.7, 0.5, 170],
  grab: [0.85, 0.4, 260],
  special: [0.6, 0.6, 220],
  ko: [1, 1, 450],
  landLight: [0, 0.25, 55],
  landHeavy: [0.35, 0.3, 110],
};

const busy = new Map(); // índice do controle → { until, power } (um tremor fraco não corta um forte no meio)

function padFor(fighter, world) {
  const input = fighter && fighter.input;
  if (!input || input.source !== 'gamepad' || input.cpu) return null;
  let device = PLAYER_DEVICES[input.index];
  // ONLINE: só o lado deste computador, e ele lê o aparelho do P1 (InputManager.readLocal)
  if (world && world.netplay) {
    if (input.index !== world.viewSlot) return null;
    device = PLAYER_DEVICES[0];
  }
  if (!device || typeof navigator === 'undefined' || !navigator.getGamepads) return null;
  const pads = Array.from(navigator.getGamepads()).filter((p) => p && p.connected);
  return pads[device.gamepadSlot] || null;
}

export function rumble(fighter, world, kind) {
  if (SETTINGS.rumble === false) return false;
  const fx = RUMBLE[kind];
  if (!fx) return false;
  const pad = padFor(fighter, world);
  const act = pad && pad.vibrationActuator;
  if (!act || typeof act.playEffect !== 'function') return false;
  const now = performance.now();
  const power = fx[0] + fx[1];
  const b = busy.get(pad.index);
  if (b && now < b.until && power < b.power) return false;
  busy.set(pad.index, { until: now + fx[2], power });
  try {
    const r = act.playEffect('dual-rumble', { startDelay: 0, duration: fx[2], strongMagnitude: fx[0], weakMagnitude: fx[1] });
    if (r && r.catch) r.catch(() => {});
  } catch { return false; }
  return true;
}

// um golpe que entrou: quem apanha e quem bate sentem conforme o peso
export function rumbleHit(world, attacker, victim, dealt, o, launch) {
  if (!(dealt > 0)) return;
  const heavy = launch || dealt >= 60 || o.guardBreak || o.guardCrush;
  const vk = victim.state === 'ko' ? 'ko' : o.grab ? 'grab' : o.kind === 'special' ? 'special' : heavy ? 'hitHeavy' : 'hitLight';
  rumble(victim, world, vk);
  if (attacker && attacker !== victim) rumble(attacker, world, heavy || o.kind === 'special' || victim.state === 'ko' ? 'landHeavy' : 'landLight');
}
