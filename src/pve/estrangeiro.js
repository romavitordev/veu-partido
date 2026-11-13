// O ESTRANGEIRO como CHEFE (Torre da TV Varminho, Sala do Sino; docs/TORRE-TRANSMISSAO.md §5). A CPU de luta cuida dos
// golpes e da esquiva; este "cérebro" faz dele o Estrangeiro do ep. 7 de Sinais do Outro Lado (os poderes da wiki):
//  · A MENTIRA: a luta começa com o OBLÍVIO — ninguém lembrava que ele existia (quase invisível até apanhar);
//  · FASE 1 (100–66%): chama os HOMENS DE TERNO (Doppelgangers) pela interferência e manda a ABDUÇÃO (a luz verde);
//  · FASE 2 (66–33%): + COMANDAR (a vítima anda até ele) e o NINHO DE INTERFLORADOS;
//  · FASE 3 (33–0%): + APARIÇÃO (some e volta atrás do alvo) e o OBLÍVIO de novo; tudo mais rápido;
//  · TOQUE SUTIL: quem ficar PARALISADO perto dele (a Presença, o Comandar) leva o toque que derrete (o fim do Xande).
// A PRESENÇA e as cápsulas (o jeito de derrotá-lo) ficam em pve/sino.js. PROPOSTA: os tempos.
const ORDERS = [
  ['homensDeTerno', 'abducao_luz'],
  ['homensDeTerno', 'comandar', 'ninhoInterflorados', 'abducao_luz'],
  ['comandar', 'abducao', 'homensDeTerno', 'oblivio', 'ninhoInterflorados', 'abducao_luz'],
];
const GAP = [[8, 11], [6.5, 9], [4.5, 6.5]];

export class EstrangeiroBrain {
  constructor(dungeon, sino = null) {
    this.d = dungeon;
    this.e = dungeon.enemy;
    this.sino = sino;
    this.next = 0.6; // o Oblívio de abertura
    this.k = 0;
    this.opened = false;
    this.touchCd = 4;
  }

  phase() {
    const k = this.e.health / this.e.maxHealth;
    return k <= 0.33 ? 2 : k <= 0.66 ? 1 : 0;
  }

  cast(id) {
    const e = this.e;
    const a = e.def.abilities.find((x) => x.id === id);
    if (!a || (e.cooldowns[id] || 0) > 0) return false;
    e.energy = Math.max(e.energy, (e.abilityCost ? e.abilityCost(a) : a.energyCost || 0) + 1);
    e.useAbility(a);
    return true;
  }

  update(dt) {
    const e = this.e;
    if (e.state === 'ko') return;
    const free = ['idle', 'run', 'walk'].includes(e.state);
    // A MENTIRA: ele começa esquecido
    if (!this.opened) {
      this.next -= dt;
      if (this.next <= 0 && free) {
        this.opened = true;
        this.cast('oblivio');
        this.d.hud.callout('VOCÊ NÃO SE LEMBRAVA DELE', '#7aff4a');
        this.next = 6;
      }
      return;
    }
    // durante a Presença ele só irradia
    if (this.sino && this.sino.wave) return;
    // TOQUE SUTIL em quem está paralisado perto dele
    this.touchCd -= dt;
    if (this.touchCd <= 0 && free) {
      const v = this.d.players.find((q) => q.state === 'stun' && q.state !== 'ko' && Math.hypot(q.pos.x - e.pos.x, q.pos.z - e.pos.z) < 2.4);
      if (v) {
        e.yaw = Math.atan2(v.pos.x - e.pos.x, v.pos.z - e.pos.z);
        e.cooldowns.toqueSutil = 0;
        if (this.cast('toqueSutil')) { this.touchCd = 9; return; }
      }
    }
    this.next -= dt;
    if (this.next > 0 || !free) return;
    const w = this.d.world;
    const mine = (pred) => w.npcs.some((n) => n.alive && n.owner === e && pred(n));
    const ph = this.phase();
    const order = ORDERS[ph];
    for (let tries = 0; tries < order.length; tries++) {
      const id = order[this.k++ % order.length];
      if (id === 'homensDeTerno' && mine((n) => n.isDoppel)) continue;
      if (id === 'ninhoInterflorados' && mine((n) => n.isNest)) continue;
      if (this.cast(id)) break;
    }
    const [a, b] = GAP[ph];
    this.next = a + Math.random() * (b - a);
  }

  dispose() {}
}
