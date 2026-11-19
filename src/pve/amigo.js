// O AMIGO IMAGINÁRIO, chefe da fase de ondas da Ilha de Tipora (O Segredo na Ilha). Pedido do dono (2026-11-19): "na
// sua forma transformada pode ser TODO MUNDO VAI MORRER e ele fica com raiva, invoca esses zumbis de tinta e as cobras
// junto aos outros animais".
// Com METADE da vida ele se transforma: o nome na barra vira TODO MUNDO VAI MORRER, explode em tinta, bate mais forte
// e chama um bando dos infectados da ilha (Zumbis de Tinta, cobras, javalis e lobos); enquanto a fúria dura, chama
// reforços de tempos em tempos (com um teto de bichos vivos). Os invocados morrem junto com ele (Dungeon: o KO do chefe
// mata as cópias). CÂNONE (wiki, "Frenesi de Sangue"): "Conforme é ferido, o Amigo Imaginário se transforma, entrando
// em um estado de fúria descontrolada e tornando-se mais rápido, agressivo e resistente" — e "Todo Mundo Vai Morrer" é
// a música da batalha final contra ele. PROPOSTA: o limiar, os números e quantos bichos por dificuldade.
import * as THREE from 'three';
import { inkSplash } from '../fx/inkFx.js';
import { resolveBody } from '../combat/positioning.js';

const RAGE_AT = 0.5; // a fração da vida em que ele se transforma
const RAGE_DEALT = 1.25; // mais agressivo: o dano dele na fúria
const RAGE_TAKEN = 0.85; // mais resistente: o dano que ele leva
const RAGE_SPEED = 1.3; // mais rápido
// o tamanho do chefe (× o jogável, que já é enorme) e o da forma transformada
const SIZE = 1.2;
const SIZE_RAGE = 1.35;
// o bando da transformação e os reforços, por dificuldade
const SUMMON = {
  easy: { burst: ['tinta', 'cobra', 'cao'], every: 18, add: 1, cap: 4 },
  normal: { burst: ['tinta', 'tinta', 'cobra', 'javali', 'cao'], every: 15, add: 2, cap: 5 },
  hard: { burst: ['tinta', 'tinta', 'cobra', 'cobra', 'javali', 'cao'], every: 13, add: 2, cap: 6 },
  superhard: { burst: ['tinta', 'tinta', 'tinta', 'cobra', 'cobra', 'javali', 'cao'], every: 12, add: 3, cap: 7 },
  annihilation: { burst: ['tinta', 'tinta', 'tinta', 'cobra', 'cobra', 'javali', 'cao', 'cao'], every: 10, add: 3, cap: 8 },
};
const REINFORCE = ['tinta', 'cobra', 'javali', 'cao', 'tinta', 'cobra'];
export const RAGE_NAME = 'TODO MUNDO VAI MORRER';
export const AMIGO_SIZE = SIZE;

// muda o tamanho do chefe (o modelo, o raio do corpo e a área de acerto), de forma que os poderes respeitem
// (f.sizeScale). Chamado já na entrada (Dungeon.wavesBossIntro) para ele surgir grande.
export function growBoss(b, to) {
  if (!b || !b.rig || !b.rig.root) return;
  const from = b.sizeScale || 1;
  if (from === to) return;
  b.rig.root.scale.multiplyScalar(to / from);
  b.radius = (b.radius || 0.5) * (to / from);
  b.size = (b.size || 1) * (to / from); // a área de acerto e o peito acompanham (Fighter.size)
  b.sizeScale = to;
}

export class AmigoBrain {
  constructor(d) {
    this.d = d;
    this.grow(SIZE); // o chefe é bem MAIOR que a ficha jogável (feedback do dono, 2026-11-19: "está pequeno")
    this.raged = false;
    this.t = 0;
    this.next = 0;
    this.k = 0;
    this.S = SUMMON[d.run && d.run.difficulty] || SUMMON.normal;
  }

  get boss() { return this.d.enemy; }

  grow(to) { growBoss(this.boss, to); }

  update(dt) {
    const b = this.boss;
    if (!b || b.state === 'ko') return;
    this.t += dt;
    if (!this.raged) {
      if (b.health <= b.maxHealth * RAGE_AT) this.enrage();
      return;
    }
    if (this.t >= this.next) {
      this.next = this.t + this.S.every;
      const alive = this.d.copias.filter((c) => c.alive).length;
      const n = Math.min(this.S.add, this.S.cap - alive);
      if (n > 0) this.summon(Array.from({ length: n }, () => REINFORCE[this.k++ % REINFORCE.length]), 'ELE CHAMA MAIS BICHOS');
    }
  }

  enrage() {
    const d = this.d, b = this.boss;
    this.raged = true;
    this.next = this.t + this.S.every;
    // a forma transformada: o nome na barra e o dano
    b.def = { ...b.def, name: RAGE_NAME };
    this.grow(SIZE_RAGE); // a transformação: cresce mais um pouco
    d.bindHud();
    if (b.cpuEdge) b.cpuEdge = { ...b.cpuEdge, dealt: b.cpuEdge.dealt * RAGE_DEALT, taken: (b.cpuEdge.taken ?? 1) * RAGE_TAKEN };
    if (b.moveSpeed) b.moveSpeed *= RAGE_SPEED;
    d.hud.callout(RAGE_NAME, '#ff2a1a');
    d.audio.play('fearGaze', { volume: 1.2, pitch: 0.4 });
    d.world.cameraRig && d.world.cameraRig.shake(0.5, 0.7);
    inkSplash(d.world, new THREE.Vector3(b.pos.x, 0.05, b.pos.z), { size: 2.6, life: 6 });
    d.world.fx.burst(new THREE.Vector3(b.pos.x, 1.6, b.pos.z), { count: 50, color: 0x2a0e06, speed: 7, up: 2, life: 0.9, size: 0.22, gravity: 9 });
    this.summon(this.S.burst, null);
    d.pveHud.hint('Na FÚRIA ele chama os infectados da ilha: derrube o AMIGO e todos eles caem junto');
    d.hintT = 7;
  }

  // os bichos brotam numa poça de tinta em volta dele
  summon(types, text) {
    const d = this.d, b = this.boss;
    const n = types.length;
    types.forEach((type, i) => {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const r = 2.6 + Math.random() * 1.2;
      const pos = new THREE.Vector3(b.pos.x + Math.sin(a) * r, 0, b.pos.z + Math.cos(a) * r);
      resolveBody(d.world.arena, pos, 0.9);
      inkSplash(d.world, new THREE.Vector3(pos.x, 0.05, pos.z), { size: 0.9, life: 3 });
      d.spawnFoe(type, pos, { hpMul: 0.8 });
    });
    if (text) d.hud.callout(text, '#ff6a3a');
  }

  dispose() {}
}
