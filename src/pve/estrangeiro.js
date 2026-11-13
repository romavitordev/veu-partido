// O ESTRANGEIRO como CHEFE (Torre da TV Varminho, Sala do Sino; docs/TORRE-TRANSMISSAO.md §5). A CPU de luta cuida dos
// golpes e da esquiva; este "cérebro" garante o que faz dele o chefe da Torre (PROPOSTA): de tempos em tempos ele chama
// os HOMENS DE TERNO pela interferência (os Doppelgangers), planta o NINHO DE INTERFLORADOS e manda a ABDUÇÃO (a luz
// verde do céu). Usa as habilidades do kit jogável (characters/estrangeiro.js), com recarga e tudo; a energia vem de graça.
const ORDER = ['homensDeTerno', 'ninhoInterflorados', 'abducao_luz'];

export class EstrangeiroBrain {
  constructor(dungeon) {
    this.d = dungeon;
    this.e = dungeon.enemy;
    this.next = 3; // a 1ª chamada sai logo
    this.k = 0;
  }

  update(dt) {
    const e = this.e;
    if (e.state === 'ko') return;
    this.next -= dt;
    if (this.next > 0 || !['idle', 'run', 'walk'].includes(e.state)) return;
    const w = this.d.world;
    const mine = (pred) => w.npcs.some((n) => n.alive && n.owner === e && pred(n));
    // na 2ª metade da vida, mais rápido (PROPOSTA)
    const angry = e.health < e.maxHealth * 0.5;
    for (let tries = 0; tries < ORDER.length; tries++) {
      const id = ORDER[this.k++ % ORDER.length];
      const a = e.def.abilities.find((x) => x.id === id);
      if (!a || (e.cooldowns[id] || 0) > 0) continue;
      if (id === 'homensDeTerno' && mine((n) => n.isDoppel)) continue;
      if (id === 'ninhoInterflorados' && mine((n) => n.isNest)) continue;
      e.energy = Math.max(e.energy, (e.abilityCost ? e.abilityCost(a) : a.energyCost || 0) + 1);
      e.useAbility(a);
      break;
    }
    this.next = angry ? 4.5 + Math.random() * 2 : 7 + Math.random() * 3;
  }

  dispose() {}
}
