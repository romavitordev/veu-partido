// O DUBLÊ DOS ESPECIAIS (Outro Lado). Pedido do dono, 2026-11-19: "Os especiais no modo outro lado atualmente nao
// mostram a animação que deveria nos bichos, só no boss". Nas salas de bichos o "adversário" de todo especial é o
// inimigo ESCONDIDO da próxima sala (`lurking`): a cena rodava num corpo invisível, longe, e não saía dano nenhum.
//
// Agora, quando alguém solta o especial e o inimigo da sala está escondido, ele vira o DUBLÊ do bicho na mira: vai para
// o lugar do bicho, continua invisível (só a malha some; para o jogo ele está ali), e o especial roda inteiro nele — a
// cena, a câmera, os empurrões. A cada quadro o bicho segue o dublê (posição e altura) e leva o dano que o dublê levou
// (os bichos em volta também: veja ÁREA abaixo). Acabou o especial: o dublê volta a se esconder onde estava, com a vida de antes.
import { distXZ } from '../core/util.js';

const RANGE = 16; // até onde o especial procura o bicho
const SPLASH = 2.4; // golpe de um alvo só (tiro, agarrão): os bichos colados no alvo levam metade
// ÁREA (dono, 2026-11-21: "confira se os ataques que são em area pegam em area, por exemplo uma espadada em um especial
// ou uma habilidade normal"): o dublê é UM corpo, então o que ele leva é repartido pela forma da ação —
//  - área (radius/aoe/explode... de 1,2 m ou mais): todos dentro do raio em volta do alvo (e em volta de quem usou, se
//    o alvo estava dentro dele) levam o dano inteiro;
//  - golpe em arco (arc + range): todos no arco à frente de quem bateu levam o dano inteiro;
//  - especial: no mínimo SPECIAL_AREA em volta do alvo e o arco à frente até ele. PROPOSTA: os números.
const MIN_AREA = 1.2;
const SPECIAL_AREA = 3.2;
const SPECIAL_ARC = 110;

// o maior raio de área declarado na ação (o `radius` pequeno de projétil fica de fora)
export function areaOf(act) {
  if (!act) return 0;
  let r = 0;
  const take = (v) => { if (typeof v === 'number' && v >= MIN_AREA && v > r) r = v; };
  take(act.radius); take(act.aoe); take(act.area);
  for (const k of ['explode', 'zone', 'blast', 'shockwave', 'burst', 'field']) if (act[k] && typeof act[k] === 'object') take(act[k].radius);
  return r;
}

// quem leva o dano do dublê e quanto (1 = inteiro, 0.5 = respingo); exportada para o teste
// `at`: onde o alvo estava quando a ação saiu (o especial costuma arrastar o alvo para a cena; a área é a de onde bateu)
export function shareOf(n, mob, f, kind, act, at = null) {
  if (n === mob) return 1;
  const dm = at ? Math.min(distXZ(n.pos, mob.pos), distXZ(n.pos, at)) : distXZ(n.pos, mob.pos);
  const nr = n.radius ?? 0.5;
  let R = areaOf(act);
  if (kind === 'special') R = Math.max(R, SPECIAL_AREA);
  if (R > 0) {
    if (dm <= R + nr) return 1;
    if (distXZ(f.pos, mob.pos) <= R + (mob.radius ?? 0.5) && distXZ(n.pos, f.pos) <= R + nr) return 1;
  }
  const arc = act && act.arc ? act.arc : kind === 'special' ? SPECIAL_ARC : 0;
  if (arc) {
    const reach = act && act.range && kind !== 'special' ? act.range : Math.min(8, distXZ(f.pos, mob.pos) + 1);
    const df = distXZ(n.pos, f.pos);
    if (df <= reach + nr + 0.4) {
      const ax = mob.pos.x - f.pos.x, az = mob.pos.z - f.pos.z;
      const al = Math.hypot(ax, az);
      const yaw = al > 0.01 ? Math.atan2(ax, az) : f.yaw;
      const ang = Math.atan2(n.pos.x - f.pos.x, n.pos.z - f.pos.z);
      let d = Math.abs(ang - yaw) % (Math.PI * 2);
      if (d > Math.PI) d = Math.PI * 2 - d;
      if (df < 0.6 || d <= (arc * Math.PI / 180) / 2) return 1;
    }
  }
  return dm < SPLASH ? 0.5 : 0;
}

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
  begin(f, kind = 'special', act = null) {
    const e = this.d.enemy;
    if (!e || !this.d.players.includes(f)) return false;
    if (this.cur) {
      // já em cena: numa nova ação, troca para o bicho da mira (no meio de um especial com cena, fica onde está)
      const S = this.cur;
      if (S.f !== f || this.d.world.cinematic) return true;
      const mob = pickMob(this.d.world, f);
      if (mob && mob !== S.mob) { this.flush(); this.place(mob, f); }
      S.kind = kind;
      S.act = act;
      S.at = S.mob.pos.clone();
      S.quiet = 0;
      S.t = 0;
      return true;
    }
    if (!e.lurking) return false;
    const mob = pickMob(this.d.world, f);
    if (!mob) return false;
    this.cur = { f, mob: null, t: 0, quiet: 0, kind, act, saved: { pos: e.pos.clone(), yaw: e.yaw, hp: e.health, maxHp: e.maxHealth, edge: e.cpuEdge } };
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
    S.at = mob.pos.clone();
    S.baseY = r ? r.position.y - (mob.pos.y || 0) : 0;
    e.standIn = mob;
    e.rig.root.visible = false; // invisível: quem aparece é o bicho
    if (e.state !== 'idle') { e.cancelAction && e.cancelAction(); e.setState('idle'); }
    e.vel.set(0, 0, 0);
    e.pos.set(mob.pos.x, 0, mob.pos.z);
    e.yaw = Math.atan2(f.pos.x - mob.pos.x, f.pos.z - mob.pos.z);
  }

  // o dano que o dublê levou vai para o bicho e para os que a ação pega em volta (shareOf)
  flush() {
    const S = this.cur;
    const e = this.d.enemy;
    const dealt = this.hp - e.health;
    if (dealt > 0) {
      for (const n of this.d.world.hostileNpcs(S.f)) {
        if (n.alive === false || n.isCloset || !n.pos) continue;
        const k = shareOf(n, S.mob, S.f, S.kind, S.act, S.at);
        if (k > 0) n.hitBy(S.f, dealt * k, { kind: S.kind });
      }
    }
    e.health = this.hp = 99999;
    // a FERIDA ABERTA (noHeal: o Decepar e o Corte Ceifador) trava a vida do dublê onde ela caiu; sem soltar o teto, a
    // volta para 99999 era desfeita a cada quadro e o MESMO golpe passava de novo para o bicho a cada quadro (dono,
    // 2026-11-21: "quando usei no quibungo a vida dele foi de 70% pra uns 2%")
    const nh = e.findBuff && e.findBuff('noHeal');
    if (nh) nh.cap = this.hp;
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
