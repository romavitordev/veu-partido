// HOVER DOS MENUS (dono, 2026-11-20: "eu passo o mouse sobre as outras opções e elas nao ficam selecionadas, isso deve
// ser ajustado em todos menus"): passar o MOUSE por uma opção a destaca, como mexer o direcional até ela; o clique
// confirma. Só mouse (no celular, mudar a tela no "hover" fazia o navegador engolir o 1º toque) e fora da partida
// online (lá cada aparelho ficaria numa opção diferente; Screens.js liga HOVER.off ao NET_UI).
export const HOVER = { off: () => false };

// select() roda quando o mouse entra no elemento; ela mesma decide se a opção muda (e evita redesenhar à toa)
export function onHover(elm, select) {
  if (!elm) return;
  elm.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' || HOVER.off()) return;
    select(e);
  });
}

// o caso comum: a tela tem this.index e this.render()
export function hoverIndex(screen, elm, i, audio = screen.audio) {
  onHover(elm, () => {
    if (screen.index === i) return;
    screen.index = i;
    if (audio) audio.play('select');
    screen.render();
  });
}
