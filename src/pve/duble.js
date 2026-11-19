// O DUBLÊ DOS ESPECIAIS (Outro Lado). Pedido do dono, 2026-11-19: "Os especiais no modo outro lado atualmente nao
// mostram a animação que deveria nos bichos, só no boss". Nas salas de bichos o "adversário" de todo especial é o
// inimigo ESCONDIDO da próxima sala (`lurking`): a cena rodava num corpo invisível, longe, e não saía dano nenhum.
//
// Agora, quando alguém solta o especial e o inimigo da sala está escondido, ele vira o DUBLÊ do bicho na mira: vai para
// o lugar do bicho, continua invisível (só a malha some; para o jogo ele está ali), e o especial roda inteiro nele — a
// cena, a câmera, os empurrões. A cada quadro o bicho segue o dublê (posição e altura) e leva o dano que o dublê levou
// (os bichos colados nele levam metade). Acabou o especial: o dublê volta a se esconder onde estava, com a vida de antes.
import { distXZ } from '../core/util.js';

const RANGE = 16; // até onde o especial procura o bicho
const SPLASH = 2.4; // os bichos colados no alvo levam metade

const rootOf = (n) => (n.model && n.model.root) || (n.rig && n.rig.root) || n.group || null;

// o bicho na mira (o cone da câmera) ou o mais perto à frente
function pickMob(world, f) {
  const aimed = f.aimTarget ? f.aimTarget(RANGE, 0.5) : null;
  if (aimed && !aimed.def && aimed.alive !== false && aimed.pos) return aimed;
  const fy = f.aimYaw != null ? f.aimYaw : f.yaw;
  const fx = Math.sin(fy), fz = Math.cos(fy);
  let best = null, bs = Infinity;
  for (const n of world.hostileNpcs(f)) {
    if (n.alive === false || n.isCloset || !n.pos) continue;
    const dx = n.pos.x - f.pos.x, dz = n.pos.z - f.pos.z;
    const d = Math.hypot(dx, dz);
    if (d > RANGE) continue;
    const front = d < 0.01 ? 1 : (dx * fx + dz * fz) / d;
    const s = d * (front > 0.3 ? 1 : 2.5); // à frente vale mais
    if (s < bs) { bs = s; best = n; }
  }
  return best;
}

export class SpecialStandIn {
  constructor(d) {
    this.d = d;
    this.cur = null;
  }

  // chamado por Fighter.trySpecial (antes do canStart) e por Fighter.useAbility: true = o dublê está no bicho da mira
  begin(f, kind = 'special') {
    const e = this.d.enemy;
    if (!e || !this.d.players.includes(f)) return false;
    if (this.cur) {
      // já em cena: numa nova ação, troca para o bicho da mira (no meio de um especial com cena, fica onde está)
      const S = this.cur;
      if (S.f !== f || this.d.world.cinematic) return true;
      const mob = pickMob(this.d.world, f);
      if (mob && mob !== S.mob) { this.flush(); this.place(mob, f); }
      S.kind = kind;
      S.quiet = 0;
      S.t = 0;
      return true;
    }
    if (!e.lurking) return false;
    const mob = pickMob(this.d.world, f);
    if (!mob) return false;
    this.cur = { f, mob: null, t: 0, quiet: 0, kind, saved: { pos: e.pos.clone(), yaw: e.yaw, hp: e.health, maxHp: e.maxHealth, edge: e.cpuEdge } };
    e.lurking = false;
    e.setVisible(true);
    e.maxHealth = 99999;
    e.health = this.hp = 99999;
    e.cpuEdge = { dealt: 1, taken: 1 };
    this.place(mob, f);
    return true;
  }

  // põe o dublê no lugar do bicho
  place(mob, f) {
    const e = this.d.enemy;
    const S = this.cur;
    const r = rootOf(mob);
    S.mob = mob;
    S.baseY = r ? r.position.y - (mob.pos.y || 0) : 0;
    e.standIn = mob;
    e.rig.root.visible = false; // invisível: quem aparece é o bicho
    if (e.state !== 'idle') { e.cancelAction && e.cancelAction(); e.setState('idle'); }
    e.vel.set(0, 0, 0);
    e.pos.set(mob.pos.x, 0, mob.pos.z);
    e.yaw = Math.atan2(f.pos.x - mob.pos.x, f.pos.z - mob.pos.z);
  }

  // o dano que o dublê levou vai para o bicho (e metade para os colados nele)
  flush() {
    const S = this.cur;
    const e = this.d.enemy;
    const dealt = this.hp - e.health;
    if (dealt > 0) {
      for (const n of this.d.world.hostileNpcs(S.f)) {
        if (n.alive === false || n.isCloset || !n.pos) continue;
        if (n === S.mob) n.hitBy(S.f, dealt, { kind: S.kind });
        else if (distXZ(n.pos, S.mob.pos) < SPLASH) n.hitBy(S.f, dealt * 0.5, { kind: S.kind });
      }
    }
    e.health = this.hp = 99999;
  }

  // a cada quadro, depois do mundo andar
  update(dt) {
    const S = this.cur;
    if (!S) return;
    const e = this.d.enemy;
    const w = this.d.world;
    S.t += dt;
    e.rig.root.visible = false;
    this.flush();
    const m = S.mob;
    if (m.alive === false) { this.end(); return; }
    // quem segue quem: o golpe empurrou/puxou/ergueu o dublê → o bicho vai junto; senão o dublê acompanha o bicho
    const moved = !['idle', 'run', 'walk', 'intro'].includes(e.state) || Math.hypot(e.vel.x, e.vel.z) > 0.5 || (e.pos.y || 0) > 0.05;
    if (moved) {
      m.pos.x = e.pos.x;
      m.pos.z = e.pos.z;
      const r = rootOf(m);
      if (r) { r.position.x = e.pos.x; r.position.z = e.pos.z; r.position.y = S.baseY + (m.pos.y || 0) + Math.max(0, e.pos.y || 0); }
    } else {
      e.pos.x = m.pos.x;
      e.pos.z = m.pos.z;
    }
    const f = S.f;
    const busy = f.state === 'special' || f.state === 'specialStart' || f.pendingSpecial || f.state === 'ability' || f.seq || w.cinematic || moved;
    S.quiet = busy ? 0 : S.quiet + dt;
    // depois da ação, um respiro para os tiros e efeitos chegarem (projéteis dela ainda no ar seguram o dublê)
    const flying = w.projectiles && w.projectiles.list && w.projectiles.list.some((q) => q.owner === f);
    const grace = S.kind === 'special' ? 0.2 : 1.2;
    if ((S.quiet > grace && !(flying && S.quiet < 5)) || S.t > 30 || f.state === 'ko') this.end();
  }

  end() {
    const S = this.cur;
    if (!S) return;
    const e = this.d.enemy;
    const w = this.d.world;
    if (w.cinematic && w.cinematic.target === e) w.endCinematic();
    e.standIn = null;
    e.cancelAction && e.cancelAction();
    e.pos.copy(S.saved.pos);
    e.yaw = S.saved.yaw;
    e.vel.set(0, 0, 0);
    e.maxHealth = S.saved.maxHp;
    e.health = S.saved.hp;
    e.cpuEdge = S.saved.edge;
    if (e.buffs) e.buffs.length = 0; // o que o especial deixou nele não acompanha o inimigo da próxima sala
    this.d.lurk(null);
    this.cur = null;
  }
}
