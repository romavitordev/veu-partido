export function resolveTeamActionSlots(assistCount, pressed) {
  if (assistCount === 1) {
    return {
      assistSlots: pressed.assist1 || pressed.assist2 ? [0] : [],
      switchSlots: pressed.switch1 || pressed.switch2 ? [0] : [],
    };
  }

  const assistSlots = [];
  const switchSlots = [];
  for (let slot = 0; slot < assistCount; slot++) {
    if (pressed[`assist${slot + 1}`]) assistSlots.push(slot);
    if (pressed[`switch${slot + 1}`]) switchSlots.push(slot);
  }
  return { assistSlots, switchSlots };
}
