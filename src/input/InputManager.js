import { KEYBOARD_LAYOUTS, GAMEPAD_LAYOUT, GAMEPAD_DEADZONE, PLAYER_DEVICES } from '../config/controls.js';

const ACTIONS = ['physical', 'ranged', 'carga', 'jump', 'block', 'dodge', 'start', 'select', 'assist1', 'assist2', 'switch1', 'switch2', 'pageL', 'pageR'];
const DIRS = ['up', 'down', 'left', 'right'];

// Estado de entrada de UM jogador, já normalizado (teclado + controle somados).
// O combate só enxerga isto — nunca teclas ou botões diretamente.
export class PlayerInput {
  constructor(index) {
    this.index = index;
    this.moveX = 0; // -1..1  (direita +)
    this.moveY = 0; // -1..1  (frente/cima +)
    this.held = {};
    this.pressed = {};
    this.pressTime = {}; // tempo (s) do último toque de cada ação
    this.menu = { up: false, down: false, left: false, right: false };
    this._prevHeld = {};
    this._prevDir = {};
    this.source = 'keyboard';
    this.cpu = null; // controlador de IA opcional
    this.look = { x: 0, y: 0, mx: 0, my: 0 }; // CÂMERA LIVRE (Outro Lado): analógico direito (-1..1) e mouse (pixels no quadro)
  }

  // Usado pela IA e por testes: injeta um estado completo.
  setVirtual(state) {
    this._virtual = state;
  }
}

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.players = [new PlayerInput(0), new PlayerInput(1)];
    this.time = 0;
    this.anyPressed = false;

    // toques que aconteceram desde o último frame (não perde toque rápido)
    this.tapped = new Set();
    this.frameTaps = new Set();
    // controles de toque na tela (celular): somados ao jogador 1 — ver ui/touchControls.js
    this.touch = { active: false, moveX: 0, moveY: 0, held: {}, taps: new Set() };
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      // digitando num campo (código da partida LAN): as teclas não viram comandos
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      this.keys.add(e.code);
      this.tapped.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Tab', 'NumpadDecimal'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => { this.keys.clear(); this.mouseHeld.clear(); });
    // CÂMERA LIVRE (Outro Lado, pedido do dono 2026-11-05): com freeLook ligado, um clique no jogo trava o ponteiro e o
    // mouse gira a câmera (o personagem gira junto para mirar); travado, o botão esquerdo é o ataque físico e o direito
    // o à distância. O analógico direito também gira a câmera (e deixa de trocar o personagem).
    this.freeLook = false;
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.mouseHeld = new Set();
    const locked = () => !!document.pointerLockElement;
    window.addEventListener('mousemove', (e) => { if (this.freeLook && locked()) { this.mouseDX += e.movementX || 0; this.mouseDY += e.movementY || 0; } });
    window.addEventListener('mousedown', (e) => {
      if (!this.freeLook) return;
      if (!locked()) {
        const cv = e.target && e.target.tagName === 'CANVAS' ? e.target : null;
        if (cv && cv.requestPointerLock) { try { const r = cv.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch { /* sem trava */ } }
        return;
      }
      this.mouseHeld.add(e.button);
      this.tapped.add(`Mouse${e.button}`);
      e.preventDefault();
    });
    window.addEventListener('mouseup', (e) => this.mouseHeld.delete(e.button));
    window.addEventListener('contextmenu', (e) => { if (this.freeLook && locked()) e.preventDefault(); });
  }

  connectedPads() {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
    return pads.filter((p) => p && p.connected);
  }

  update(dt) {
    this.time += dt;
    const pads = this.connectedPads();
    this.anyPressed = false;

    // PARTIDA LAN: os dois lados vêm do quadro sincronizado (netFrame), nunca dos aparelhos daqui (os toques do
    // teclado ficam guardados para o readLocal)
    if (this.netFrame) {
      this.frameTaps = new Set();
      this.players.forEach((p, i) => {
        const v = this.netFrame[i];
        this.applyHeld(p, v.moveX, v.moveY, v.held);
        p.humanPressed = { start: p.pressed.start, select: p.pressed.select };
        p.source = i === this.netSlot ? this.localSource || 'keyboard' : 'keyboard';
      });
      return;
    }
    this.frameTaps = this.tapped;
    this.tapped = new Set();
    this.players.forEach((p, i) => {
      const dev = PLAYER_DEVICES[i];
      const layout = KEYBOARD_LAYOUTS[dev.keyboard];
      const pad = pads[dev.gamepadSlot];
      const held = {};
      let mx = 0;
      let my = 0;

      // Start/Select do aparelho físico (para pausar/reiniciar mesmo com a CPU no controle)
      {
        const kbStart = layout.start && layout.start.some((c) => this.frameTaps.has(c) || this.keys.has(c));
        const kbSelect = layout.select && layout.select.some((c) => this.frameTaps.has(c) || this.keys.has(c));
        const padBtn = (ids) => pad && ids && ids.some((id) => pad.buttons[id] && pad.buttons[id].pressed);
        const now = { start: !!(kbStart || padBtn(GAMEPAD_LAYOUT.start)), select: !!(kbSelect || padBtn(GAMEPAD_LAYOUT.select)) };
        const prev = p._prevHuman || {};
        p.humanPressed = { start: now.start && !prev.start, select: now.select && !prev.select };
        p._prevHuman = now;
      }

      if (p.cpu || p._virtual) {
        const v = p.cpu ? p.cpu.produce(dt) : p._virtual;
        mx = v.moveX || 0;
        my = v.moveY || 0;
        for (const a of ACTIONS) held[a] = !!(v.held && v.held[a]);
        p.source = 'cpu';
      } else {
        const d = this.readDevice(i, pads, this.frameTaps, p.source);
        mx = d.mx;
        my = d.my;
        Object.assign(held, d.held);
        p.source = d.source;
      }

      this.applyHeld(p, mx, my, held);
      // a câmera livre é só do jogador 1 neste computador
      if (i === 0) {
        const L = p.look;
        L.x = 0; L.y = 0; L.mx = 0; L.my = 0;
        if (this.freeLook && !p.cpu && !p._virtual) {
          if (pad) {
            const rx = pad.axes[2] || 0;
            const ry = pad.axes[3] || 0;
            L.x = Math.abs(rx) > 0.15 ? rx : 0;
            L.y = Math.abs(ry) > 0.15 ? ry : 0;
          }
          L.mx = this.mouseDX;
          L.my = this.mouseDY;
        }
        this.mouseDX = 0;
        this.mouseDY = 0;
      }
    });
  }

  // aplica o estado de um quadro num jogador: movimento, botões e as bordas (apertou agora / menu)
  applyHeld(p, mx, my, held) {
    const mag = Math.hypot(mx, my);
    if (mag > 1) { mx /= mag; my /= mag; }
    p.moveX = mx;
    p.moveY = my;

    for (const a of ACTIONS) {
      p.pressed[a] = held[a] && !p._prevHeld[a];
      if (p.pressed[a]) {
        p.pressTime[a] = this.time;
        this.anyPressed = true;
      }
    }
    p.held = held;
    p._prevHeld = held;

    // Navegação de menu com detecção de borda
    const dirNow = { up: my > 0.5, down: my < -0.5, left: mx < -0.5, right: mx > 0.5 };
    for (const d of DIRS) {
      p.menu[d] = dirNow[d] && !p._prevDir[d];
      if (p.menu[d]) this.anyPressed = true;
    }
    p._prevDir = dirNow;
  }

  // aparelhos físicos do jogador i (teclado do layout dele + controle do slot dele + toque na tela no P1)
  readDevice(i, pads, taps, prevSource = 'keyboard') {
    const dev = PLAYER_DEVICES[i];
    const layout = KEYBOARD_LAYOUTS[dev.keyboard];
    const pad = pads[dev.gamepadSlot];
    const held = {};
    let mx = 0;
    let my = 0;
    let source = prevSource;
    const kbHeld = (codes) => codes && codes.some((c) => this.keys.has(c) || taps.has(c));
    for (const a of ACTIONS) held[a] = kbHeld(layout[a]);
    // mouse travado (câmera livre): esquerdo = físico, direito = à distância
    if (i === 0 && this.freeLook && document.pointerLockElement) {
      if (this.mouseHeld.has(0) || taps.has('Mouse0')) held.physical = true;
      if (this.mouseHeld.has(2) || taps.has('Mouse2')) held.ranged = true;
    }
    mx += (kbHeld(layout.right) ? 1 : 0) - (kbHeld(layout.left) ? 1 : 0);
    my += (kbHeld(layout.up) ? 1 : 0) - (kbHeld(layout.down) ? 1 : 0);

    // toque na tela (celular): botões e joystick virtuais do jogador 1
    const T = this.touch;
    if (i === 0 && T.active) {
      // mute: num quadro de botão de habilidade, a DEF segurada não conta (senão DEF + △ viraria outra habilidade)
      for (const a of ACTIONS) if ((T.held[a] && !(T.mute && T.mute.includes(a))) || T.taps.has(a)) held[a] = true;
      if (Math.abs(T.moveX) > Math.abs(mx)) mx = T.moveX;
      if (Math.abs(T.moveY) > Math.abs(my)) my = T.moveY;
      // nudge: direção de UM quadro (botão de habilidade □ + direção — frente/trás/lado em relação ao adversário)
      if (T.nudge) { [mx, my] = T.nudge; source = 'touch'; }
      T.nudge = null;
      T.mute = null;
      if (T.moveX || T.moveY || T.taps.size || ACTIONS.some((a) => T.held[a])) source = 'touch';
      T.taps.clear();
    }
    if (pad) {
      // gatilhos (LT/RT) são analógicos: considera apertado acima de 35%
      const btn = (ids) => ids.some((id) => pad.buttons[id] && (pad.buttons[id].pressed || pad.buttons[id].value > 0.35));
      for (const a of ACTIONS) if (GAMEPAD_LAYOUT[a] && btn(GAMEPAD_LAYOUT[a])) held[a] = true;
      // analógico direito ◀/▶: TROCA o personagem em campo pelo da assistência 1/2
      // (as assistências são chamadas por L1/LB e R1/RB)
      const rx = pad.axes[2] || 0;
      if (!this.freeLook && rx < -0.6) held.switch1 = true;
      if (!this.freeLook && rx > 0.6) held.switch2 = true;
      let ax = pad.axes[0] || 0;
      let ay = -(pad.axes[1] || 0);
      const mag = Math.hypot(ax, ay);
      if (mag < GAMEPAD_DEADZONE) { ax = 0; ay = 0; }
      ax += (btn(GAMEPAD_LAYOUT.right) ? 1 : 0) - (btn(GAMEPAD_LAYOUT.left) ? 1 : 0);
      ay += (btn(GAMEPAD_LAYOUT.up) ? 1 : 0) - (btn(GAMEPAD_LAYOUT.down) ? 1 : 0);
      if (Math.abs(ax) > Math.abs(mx)) mx = ax;
      if (Math.abs(ay) > Math.abs(my)) my = ay;
      if (ax || ay || ACTIONS.some((a) => GAMEPAD_LAYOUT[a] && btn(GAMEPAD_LAYOUT[a]))) source = 'gamepad';
      else if (mx || my || ACTIONS.some((a) => held[a])) source = 'keyboard';
    } else if (source !== 'touch') {
      source = 'keyboard';
    }
    return { mx, my, held, source };
  }

  // PARTIDA LAN: comandos do jogador LOCAL (aparelhos do P1 deste computador), lidos uma vez por quadro de rede
  readLocal() {
    const taps = this.tapped;
    this.tapped = new Set();
    const d = this.readDevice(0, this.connectedPads(), taps, this.localSource);
    this.localSource = d.source;
    d.escape = taps.has('Escape') || this.keys.has('Escape');
    return d;
  }

  // Tecla "global" (ex.: Enter no título)
  keyPressedOnce(code) {
    return this.frameTaps.has(code);
  }
}
