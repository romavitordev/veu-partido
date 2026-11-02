import * as THREE from 'three';
import { Timeline, distXZ, smooth, yawTo } from '../core/util.js';
import { Assist, rushStrike, shoot } from './assists.js';
import { findSpotBehind, findFreeSpotNear } from './positioning.js';
import { applyHit } from './damage.js';
import { twoShot, orbit, pullBack, overShoulder, lowAngle, faceClose, impactClose } from '../camera/shots.js';
import { ROSTER } from '../characters/index.js';
import { getTeamLink, linkId, inLink as inLinkOf, matchesEntry } from '../config/teamLinks.js';

// ESPECIAL EM EQUIPE = CINEMÁTICA DA EQUIPE INTEIRA (pedido do dono, 2026-11-01: "não são apenas assistências atacando no
// mapa, é um especial com cinematic, de todos atacando em equipe, e isso vale pra todos os especiais em equipe").
// Antes as assistências entravam no mapa e o líder fechava com o PRÓPRIO especial (com o Mascarados aparecia o especial
// do Dalmo, e o nome da equipe, a fala e os retratos saíam todos juntos). Agora (teamScene):
//   1. ABERTURA — o primeiro membro avança e golpeia (dá para defender/esquivar: errou, o especial acaba ali)
//   2. PEGOU → cena: o NOME DA EQUIPE (sozinho) → os RETRATOS (sozinhos) → cada membro usa a HABILIDADE/RITUAL dele
//      (sceneCast) com a câmera NELE e o nome da habilidade
//      (os de fora da equipe também, nas ligações de grupo) → TODOS JUNTOS em volta do alvo com o LÍDER no golpe final
//      (a fala do líder entra aqui, sozinha)
//   3. Os Mascarados vestem as máscaras (link.masks) durante a cena
// Dano total exato e em escada (COMBAT.teamSpecial: em equipe > especial transformado > especial normal).
// LINK_MOVES continua sendo o golpe próprio de cada um quando entra como assistência comum (e na abertura).

// GOLPES DA LIGAÇÃO: (ctx de Assist.enter) → Timeline
const LINK_MOVES = {
  // KAISER — rajada de Balas Amaldiçoadas da M4 (o tiro do filho)
  kaiser: (c) => {
    const tl = shoot(c, 'shoot_rifle', 5, 30, c.def.ranged && c.def.ranged.sound);
    tl.add(0.3, () => c.world.fx.flash(c.as.chest(), { color: 0xa865ff, size: 1.2, life: 0.15 }));
    return tl;
  },
  // CRISTOPHER — A MURALHA: avança, ombrada de armário e SEGURA o alvo no lugar para o disparo
  cristopher: (c) => {
    const tl = rushStrike(c, 'shoulder_bash', [[0.38, 50]], 'heavyPunch', { knockback: 0.4 });
    tl.add(0.4, () => {
      if (c.opp.state === 'ko' || c.opp.isInvulnerable()) return;
      c.opp.stun(1.3, 'stagger');
      c.opp.notify('SEGURADO!', true);
      c.world.fx.play('FX_DUST', c.opp.pos, { scale: 1 });
      c.world.cameraRig.shake(0.25, 0.2);
    });
    tl.add(0.55, () => c.as.play('block', 0.8));
    return tl.end(1.35);
  },
  // JOUI — some na sombra, surge atrás e corta (iai)
  joui: (c) => {
    const tl = new Timeline();
    tl.add(0.05, () => {
      const spot = findSpotBehind(c.world.arena, { x: c.opp.pos.x, z: c.opp.pos.z, yaw: c.opp.yaw }, { distance: 1.5, radius: 0.5 });
      if (spot) c.as.pos.set(spot.x, 0, spot.z);
      c.as.face(c.opp);
      c.world.fx.shadowDisc(c.as.pos, { radius: 1, life: 0.4 });
      c.as.play('iai_slash', 0.45);
    });
    tl.add(0.25, () => {
      c.hit(55, { knockback: 1, sound: 'slashFinal' });
      c.world.fx.slash(c.opp.chestPos(), c.as.yaw, { color: 0xffd84a, radius: 1.6, arc: 2.2, life: 0.3, width: 0.4, roll: 0.6 });
    });
    return tl.end(0.75);
  },
  // ARTHUR — o tiro do Rebirth (verde) de longe
  arthur: (c) => {
    const tl = shoot(c, 'shoot_sniper', 1, 60, 'sniper');
    tl.add(0.36, () => {
      if (distXZ(c.as.pos, c.opp.pos) > 30) return;
      c.world.fx.tracer(c.as.chest(), c.opp.chestPos(), { color: 0x3aff6a, life: 0.25, width: 0.06 });
      c.world.fx.flash(c.opp.chestPos(), { color: 0x3aff6a, size: 1.6, life: 0.18 });
    });
    return tl;
  },
  // CELESTINE — a corrente das chamas de energia: puxa o alvo e o atinge com as duas lâminas
  celestine: (c) => {
    const tl = rushStrike(c, 'dual_cross', [[0.32, 28], [0.48, 28]], 'bladeHit', { knockback: 0.8, color: 0x8ad8ff });
    tl.add(0.33, () => c.world.fx.slash(c.opp.chestPos(), c.as.yaw, { color: 0x8ad8ff, radius: 1.5, arc: 2.4, life: 0.3, width: 0.35, roll: -0.5 }));
    return tl.end(0.8);
  },
  // GAIUS — o corte final do gládio, em energia roxa
  gaius: (c) => {
    const tl = rushStrike(c, 'slash_finisher', [[0.4, 55]], 'slashFinal', { knockback: 1.2, color: 0x9a5aff });
    tl.add(0.41, () => c.world.fx.slash(c.opp.chestPos(), c.as.yaw, { color: 0x9a5aff, radius: 1.8, arc: 2.6, life: 0.35, width: 0.45, roll: 1.2 }));
    return tl.end(0.85);
  },
  // AMALIA — a Flecha Flamejante de longe (o rastro ciano)
  amalia: (c) => {
    const tl = shoot(c, 'bow_shot', 1, 55, 'swing');
    tl.add(0.36, () => {
      if (distXZ(c.as.pos, c.opp.pos) > 30) return;
      c.world.fx.tracer(c.as.chest(), c.opp.chestPos(), { color: 0x3ae8b8, life: 0.25, width: 0.06 });
    });
    return tl;
  },
  // VERÍSSIMO — a estocada do veterano: atravessa a guarda e deixa o alvo aberto para o amigo
  verissimo: (c) => {
    const tl = rushStrike(c, 'thrust', [[0.3, 40]], 'bladeHit', { knockback: 0.3 });
    tl.add(0.31, () => {
      if (c.opp.state === 'ko' || c.opp.isInvulnerable()) return;
      c.opp.stun(1.0, 'stagger');
      c.opp.notify('BRECHA NA GUARDA', true);
      c.world.fx.flash(c.opp.chestPos(), { color: 0x4a90e2, size: 1.1, life: 0.15 });
    });
    return tl.end(0.9);
  },
  // ARNALDO — o rodopio teatral da fita e o corte de reverência
  arnaldo: (c) => {
    const tl = rushStrike(c, 'arn_spin', [[0.3, 25], [0.55, 40]], 'slashFinal', { knockback: 1.4, color: 0xd01c30 });
    tl.add(0.56, () => c.world.fx.slash(c.opp.chestPos(), c.as.yaw, { color: 0xd01c30, radius: 1.7, arc: 2.8, life: 0.35, width: 0.4, roll: 0.3 }));
    return tl.end(0.95);
  },
};

// golpe de roda dos Mascarados: o último golpe da sequência de cada um, colado no alvo
function circleStrike(c) {
  const fin = c.def.melee.strikes.at(-1);
  const tl = rushStrike(c, fin.anim, [[0.3, 22]], fin.hitSound || 'heavyPunch', { knockback: 0.3, color: 0xc4241c });
  tl.add(0.31, () => c.world.fx.burst(c.opp.chestPos(), { count: 12, color: 0xc4241c, speed: 4, life: 0.35, size: 0.16 }));
  return tl.end(0.7);
}

function moveFor(def) {
  return LINK_MOVES[linkId(def)] || ((c) => {
    const fin = def.melee.strikes.at(-1);
    return rushStrike(c, fin.anim, [[0.4, 50]], fin.hitSound || 'heavyPunch', { knockback: 1 });
  });
}

// lista de quem aparece no tríptico/painéis do especial
export function teamLinkOf(f) {
  if (!f.assists) return null;
  return getTeamLink([f.def, ...f.assists.map((a) => a.def)]);
}

// tiro (de quem luta de longe) ou o golpe final da sequência: o que cada um usa na cena
const RANGED_LOOK = { kaiser: 'shoot_rifle', arthur: 'shoot_sniper', amalia: 'bow_shot', kemi: 'shoot_sniper' };
const strikeOf = (def, k = 1) => (def.melee && def.melee.strikes && def.melee.strikes.at(-k)) || { anim: 'heavy_punch', hitSound: 'heavyPunch' };

// quem entra na cena: as assistências (na ordem da ligação: link.order, a Muralha antes do disparo) e, nas ligações de
// grupo, os membros que estão fora da equipe (convidados, sem recarga)
function teamCrew(f, world, link) {
  const assists = f.assists.filter(Boolean);
  const guests = [];
  if (link && link.kind === 'group') {
    const team = [f.def, ...assists.map((a) => a.def)];
    for (const id of link.group) {
      if (team.some((d) => matchesEntry(id, d))) continue;
      // a versão base do personagem (com mais de uma versão no elenco, a que tem o id da ligação)
      const def = ROSTER.find((d) => d.id === id) || ROSTER.find((d) => linkId(d) === id);
      if (!def) continue;
      try { guests.push(new Assist(def, f, world, guests.length % 2)); } catch (e) { /* modelo indisponível: fica de fora */ }
    }
  }
  const rank = (a) => { if (!link) return 0; const i = (link.order || ['cristopher']).indexOf(linkId(a.def)); return i < 0 ? 99 : i; };
  const crew = [...assists.slice().sort((a, b) => rank(a) - rank(b)), ...guests];
  return { crew, guests };
}

// vestir as máscaras (link.masks[id]: { show, hide }) — devolve como desfazer
function wearMasks(link, actors) {
  const undo = [];
  if (!link || !link.masks) return () => {};
  for (const x of actors) {
    const m = link.masks[linkId(x.def)];
    const rig = x.rig;
    if (!m || !rig || !rig.props) continue;
    for (const [list, on] of [[m.show || [], true], [m.hide || [], false]]) {
      for (const p of list) {
        if (!rig.props[p]) continue;
        undo.push([rig, p, rig.props[p].visible]);
        rig.showProp(p, on);
      }
    }
  }
  return () => { for (const [rig, p, v] of undo) rig.showProp(p, v); };
}

function showSceneProps(link, actors) {
  const undo = [];
  if (!link || !link.sceneProps) return () => {};
  for (const x of actors) {
    const config = link.sceneProps[linkId(x.def)];
    const rig = x.rig;
    if (!config || !rig || !rig.props) continue;
    for (const [list, visible] of [[config.show || [], true], [config.hide || [], false]]) {
      for (const prop of list) {
        if (!rig.props[prop]) continue;
        undo.push([rig, prop, rig.props[prop].visible]);
        rig.showProp(prop, visible);
      }
    }
  }
  return () => { for (const [rig, prop, visible] of undo) rig.showProp(prop, visible); };
}

// um golpe de um membro na cena: aparece no lugar dele em volta do alvo e bate (ou atira) — o dano é do especial
function sceneStrike(c, { at, dmg, k = 1, onHit }) {
  const tl = new Timeline();
  const look = RANGED_LOOK[linkId(c.def)];
  const st = strikeOf(c.def, k);
  tl.add(0.02, () => {
    c.as.pos.set(at.x, 0, at.z);
    c.as.face(c.opp);
    c.as.play(look || st.anim, 0.62);
    c.world.audio.play('swing', { volume: 0.6 });
  });
  tl.add(look ? 0.34 : 0.26, () => {
    if (c.opp.state === 'ko') return;
    if (look) c.world.fx.tracer(c.as.chest(), c.opp.chestPos(), { color: c.color, life: 0.22, width: 0.07 });
    else c.world.fx.slash(c.opp.chestPos(), c.as.yaw, { color: c.color, radius: 1.6, arc: 2.6, life: 0.28, width: 0.4, roll: (Math.random() - 0.5) * 2 });
    c.world.fx.burst(c.opp.chestPos(), { count: 14, color: c.color, speed: 4, life: 0.35, size: 0.16 });
    if (dmg > 0) applyHit(c.world, c.owner, c.opp, { damage: dmg, kind: 'special', reaction: false, ignoreInvuln: true, sound: look ? 'sniper' : st.hitSound || 'heavyPunch', color: c.color, scale: 1.3 });
    c.opp.anim.play('hit', { restart: true, blend: 0.03 });
    c.world.cameraRig.shake(0.18, 0.12);
    c.world.hitstop(0.05);
    onHit && onHit();
  });
  return tl.end(0.7);
}

// HABILIDADES E RITUAIS NA CENA (pedido do dono, 2026-11-01: "ao invés de só baterem, deveriam usar suas
// habilidades/rituais no especial"). Cada membro usa a habilidade DELE (o nome, a animação e a cor da ficha); o efeito
// na cena vem do tipo da habilidade:
//   shot   — tiro/rajada: raio da arma até o alvo
//   sigil  — ritual/maldição/controle: o sigilo no chão sob o alvo, o anel em pé, a distorção e os raios do elemento
//   rain   — chuva (Acácia, Chuva de Flechas): o que cai do alto em volta do alvo
//   blast  — arremesso/explosão (granada, carro de dublê): a explosão no alvo
//   behind — some na sombra e surge atrás cortando
//   trap   — armadilha/cães: o bote no pé do alvo
//   cut    — golpe de habilidade (investida, golpe pesado, cortes de ritual): o corte grande, com a animação dela
const ABILITY_LOOK = {
  deathShot: ['shot', 'shoot_sniper'], cursedShots: ['shot', 'shoot_rifle'], weaponState: ['shot', 'shoot_sniper'],
  bloodParalysis: ['sigil', 'cast_up'], hatredTemple: ['sigil', 'taunt_roar'], mentalMaze: ['sigil', 'concentrate'], predatorScent: ['sigil', 'point'],
  fearGaze: ['sigil', 'point'], shadowPortal: ['sigil', 'cast_up'], shadowTrap: ['sigil', 'point'], rootTrap: ['sigil', 'cast_up'], command: ['sigil', 'point'],
  analyze: ['sigil', 'point'], falseAlliance: ['sigil', 'point'], polarize: ['sigil', 'arn_emit'], whisperZone: ['sigil', 'concentrate'], shadowVeil: ['sigil', 'concentrate'],
  curseWeapon: ['sigil', 'concentrate'], demonAxe: ['sigil', 'concentrate'], bloodBlade: ['sigil', 'concentrate'], bloodLink: ['sigil', 'point'], mistCloud: ['sigil', 'breath'],
  photoFlash: ['sigil', 'point'], ritualCuts: ['cut', 'slash_v'],
  flowerRain: ['rain', 'cast_up'], throwProjectile: ['blast', 'throw_r'], stuntCar: ['blast', 'point'],
  teleportBehind: ['behind', 'iai_slash'], bearTrap: ['trap', 'point'], huntingDog: ['trap', 'point'],
  dashStrike: ['cut', 'dash_slash'], heavyBlow: ['cut', 'heavy_punch'], sweepStrike: ['cut', 'arn_spin'], arenaGrab: ['cut', 'shoulder_bash'], caiDentro: ['cut', 'shoulder_bash'],
};
// utilidade (análise, furtividade, buff da arma, faro): não mostram nada no alvo — ficam de fora da cena
const UTILITY = new Set(['analyze', 'shadowVeil', 'photoFlash', 'curseWeapon', 'demonAxe', 'bloodBlade', 'bloodLink', 'predatorScent']);

// a habilidade que cada um mostra na cena: ritual primeiro, depois a de MAIS dano (as de efeito grande — sigilo, chuva —
// desempatam); utilidade fica de fora
function sceneAbility(def) {
  let best = null;
  let bestScore = 0;
  for (const a of def.abilities || []) {
    const look = ABILITY_LOOK[a.type];
    if (!look || UTILITY.has(a.type)) continue;
    const hurt = a.damage ? 1 + Math.min(a.damage, 100) / 40 : a.projectile ? 2.5 : 0;
    const score = (a.ritual ? 4 : 0) + hurt + (look[0] === 'sigil' || look[0] === 'rain' ? 0.8 : 0) + 0.5;
    if (score > bestScore) { bestScore = score; best = { a, kind: look[0], anim: a.anim || look[1] }; }
  }
  return best;
}

// um membro usa a habilidade na cena (named: mostra o nome — só na vez dele, para os textos não se atropelarem)
function sceneCast(c, { at, dmg, named = false }) {
  const pick = sceneAbility(c.def);
  if (!pick) return sceneStrike(c, { at, dmg, k: 2 });
  const { a, kind, anim } = pick;
  const w = c.world;
  const col = a.color ?? c.color;
  const tl = new Timeline();
  const P = () => c.opp.chestPos();
  const feet = () => new THREE.Vector3(c.opp.pos.x, 0.06, c.opp.pos.z);
  const far = kind === 'shot' || kind === 'sigil' || kind === 'rain' || kind === 'blast' || kind === 'trap';
  tl.add(0.02, () => {
    let spot = at;
    if (kind === 'behind') {
      const s = findSpotBehind(w.arena, { x: c.opp.pos.x, z: c.opp.pos.z, yaw: c.opp.yaw }, { distance: 1.4, radius: 0.5 });
      if (s) spot = s;
      w.fx.shadowDisc(new THREE.Vector3(spot.x, 0, spot.z), { radius: 1, life: 0.45, rim: col });
    } else if (far) {
      // quem conjura/atira fica um pouco mais longe (dá para ver o gesto e o efeito no mesmo plano)
      const dx = at.x - c.opp.pos.x, dz = at.z - c.opp.pos.z, l = Math.hypot(dx, dz) || 1;
      const want = { x: c.opp.pos.x + (dx / l) * 3.6, z: c.opp.pos.z + (dz / l) * 3.6 };
      spot = findFreeSpotNear(w.arena, want.x, want.z, { radius: 0.5, others: [{ x: c.opp.pos.x, z: c.opp.pos.z, r: 0.6 }] }) || want;
    }
    c.as.pos.set(spot.x, 0, spot.z);
    c.as.face(c.opp);
    c.as.play(anim, 0.8);
    if (named) c.owner.notify(`${c.def.name.toUpperCase()}: ${a.name.toUpperCase()}`, true);
    w.fx.burst(c.as.chest(), { count: 12, color: col, speed: 2.5, life: 0.35, size: 0.16 });
    if (kind === 'sigil') {
      // o sigilo se forma sob o alvo antes de fechar
      w.fx.ring(feet(), { color: col, radius: 2.2, life: 0.7 });
      w.fx.ring(feet(), { color: col, radius: 1.2, life: 0.7 });
      w.audio.play(a.ritual ? 'ritual' : 'teleport', { volume: 0.6 });
    }
    if (kind === 'rain') w.audio.play('swing', { volume: 0.6, pitch: 0.8 });
  });
  // o efeito fecha no alvo
  const hitT = kind === 'sigil' || kind === 'rain' ? 0.42 : kind === 'shot' ? 0.32 : 0.28;
  tl.add(hitT, () => {
    if (c.opp.state === 'ko') return;
    const p = P();
    switch (kind) {
      case 'shot':
        w.fx.tracer(c.as.chest(), p, { color: col, life: 0.25, width: 0.09 });
        w.fx.flash(p, { color: col, size: 1.6, life: 0.16 });
        w.audio.play('sniper', { volume: 0.6 });
        break;
      case 'sigil':
        w.fx.ring(p, { color: col, radius: 1.3, life: 0.4, vertical: true, yaw: c.as.yaw + Math.PI / 2 });
        w.fx.distort(p, { color: col, radius: 1.8, life: 0.4 });
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2;
          const base = new THREE.Vector3(c.opp.pos.x + Math.cos(ang) * 1.2, 0.1, c.opp.pos.z + Math.sin(ang) * 1.2);
          w.fx.lightning(base, base.clone().setY(2.6), { color: col, life: 0.25 });
        }
        w.fx.burst(p, { count: 24, color: col, speed: 3, up: 1.5, life: 0.5, size: 0.18 });
        break;
      case 'rain':
        for (let i = 0; i < 9; i++) {
          const x = c.opp.pos.x + (Math.random() - 0.5) * 2.4, z = c.opp.pos.z + (Math.random() - 0.5) * 2.4;
          w.fx.tracer(new THREE.Vector3(x + 0.6, 6, z), new THREE.Vector3(x, 0.1, z), { color: col, life: 0.22, width: 0.05 });
        }
        w.fx.burst(feet(), { count: 26, color: col, speed: 3, up: 2, life: 0.5, size: 0.16 });
        break;
      case 'blast':
        w.fx.tracer(c.as.chest(), p, { color: col, life: 0.18, width: 0.06 });
        w.fx.burst(p, { count: 34, color: col, speed: 6, life: 0.45, size: 0.22 });
        w.fx.burst(p, { count: 14, color: 0x2a2632, kind: 'smoke', speed: 2, life: 0.7, size: 0.7, grow: 1 });
        w.audio.play('impact', { volume: 0.8 });
        break;
      case 'trap':
        w.fx.ring(feet(), { color: col, radius: 1, life: 0.35 });
        w.fx.burst(feet(), { count: 18, color: 0x8a1a1a, speed: 3, up: 1, life: 0.4, size: 0.14 });
        w.audio.play('heavyPunch', { volume: 0.7 });
        break;
      default: // behind, cut
        w.fx.slash(p, c.as.yaw, { color: col, radius: 1.9, arc: 2.8, life: 0.32, width: 0.5, roll: (Math.random() - 0.5) * 2 });
        w.fx.burst(p, { count: 18, color: col, speed: 4, life: 0.35, size: 0.18 });
        w.audio.play('slashFinal', { volume: 0.6 });
    }
    if (dmg > 0) applyHit(w, c.owner, c.opp, { damage: dmg, kind: 'special', reaction: false, ignoreInvuln: true, color: col, scale: 1.3 });
    c.opp.anim.play('hit', { restart: true, blend: 0.03 });
    w.cameraRig.shake(0.2, 0.14);
    w.hitstop(0.05);
  });
  return tl.end(0.85);
}

// lugar de cada um em volta do alvo (quem atira fica mais longe)
function ringSpot(world, opp, def, i, n, phase = 0) {
  const ang = phase + (i / Math.max(1, n)) * Math.PI * 2;
  const r = RANGED_LOOK[linkId(def)] ? 4.2 : 1.6;
  const want = { x: opp.pos.x + Math.cos(ang) * r, z: opp.pos.z + Math.sin(ang) * r };
  return findFreeSpotNear(world.arena, want.x, want.z, { radius: 0.5, others: [{ x: opp.pos.x, z: opp.pos.z, r: 0.6 }] }) || want;
}

// SEQUÊNCIA GENÉRICA (equipes sem coreografia própria): cada um usa a habilidade com a câmera nele, depois todos juntos
// em volta do alvo com o líder entrando pela frente. Devolve o instante do golpe final.
function genericParts({ tl, S, f, opp, world, crew, guests, color, crewTotal, TS, live }) {
  const n = crew.length;
  const each = n ? Math.floor(crewTotal / n) : 0;
  crew.forEach((a, i) => {
    tl.add(S + i * TS.beat, () => {
      if (!live()) return;
      const at = ringSpot(world, opp, a.def, i, n, f.yaw + Math.PI);
      a.perform((c) => sceneCast(c, { at, dmg: each, named: true }), { at, quiet: true, guest: guests.includes(a) });
      // quem conjura/atira de longe: por cima do ombro (o alvo e o efeito no meio); quem golpeia: os dois de lado
      const pick = sceneAbility(a.def);
      const far = pick && pick.kind !== 'cut' && pick.kind !== 'behind';
      world.cameraRig.playShots([{ ...(far ? overShoulder(a, opp, { dur: TS.beat + 0.05, back: 2, side: i % 2 ? 0.9 : -0.9, height: 1.9, fov: 48 }) : twoShot(a, opp, { dur: TS.beat + 0.05, dist: 3.4, height: 1.5, push: 0.6, side: i % 2 ? 1 : -1, fov: 42 })), cut: true }]);
    });
  });
  const F = S + n * TS.beat + 0.1;
  tl.add(F, () => {
    if (!live()) return;
    crew.forEach((a, i) => {
      const at = ringSpot(world, opp, a.def, i, n + 1, f.yaw + Math.PI + Math.PI * 2 / (n + 1));
      // todos juntos: cada um solta a habilidade de novo, ao mesmo tempo (sem os nomes)
      a.perform((c) => sceneCast(c, { at, dmg: 0 }), { at, quiet: true, guest: guests.includes(a) });
    });
    // o líder entra pela frente
    const front = ringSpot(world, opp, f.def, 0, n + 1, f.yaw + Math.PI);
    f.pos.set(front.x, 0, front.z);
    f.yaw = yawTo(f.pos, opp.pos);
    const st = strikeOf(f.def);
    f.anim.play(RANGED_LOOK[linkId(f.def)] || st.anim, { restart: true, duration: 0.75, blend: 0.04 });
    world.fx.burst(f.chestPos(), { count: 20, color, speed: 4, life: 0.4, size: 0.2 });
    world.cameraRig.playShots([{ ...pullBack(f, opp, { dur: 1.1, from: 3.4, to: 7, height: 2.4 }), cut: true }]);
  });
  return F;
}

// quem faz o papel na coreografia: o líder (Fighter) ou um da equipe/convidado (Assist), com a mesma cara
function actorFor(x, f, guests) {
  if (x === f) {
    return {
      def: f.def, pos: f.pos, rig: f.rig, get yaw() { return f.yaw; },
      chest: () => f.chestPos(), face: (o) => { f.yaw = yawTo(f.pos, o.pos); },
      play: (name, dur) => f.anim.play(name, { restart: true, duration: dur, blend: 0.04 }),
      show: () => {}, color: f.def.energyColor ?? 0xc4241c,
    };
  }
  return {
    def: x.def, pos: x.pos, rig: x.rig, get yaw() { return x.yaw; },
    chest: () => x.chest(), face: (o) => x.face(o), play: (name, dur) => x.play(name, dur),
    // entra em cena e fica até `dur` (a coreografia é que move e anima)
    show: (dur, at) => x.perform(() => new Timeline().end(dur), { at, quiet: true, guest: guests.includes(x) }),
    color: x.color,
  };
}

function choreographyTools({ f, opp, world, crew, guests, live, end }) {
  const actors = new Map([[f, actorFor(f, f, guests)], ...crew.map((x) => [x, actorFor(x, f, guests)])]
    .map(([source, actor]) => [linkId(source.def), actor]));
  const get = (id) => actors.get(id) || null;
  const around = (_actor, angle, radius) => {
    const yaw = f.yaw + Math.PI + angle;
    const want = { x: opp.pos.x + Math.sin(yaw) * radius, z: opp.pos.z + Math.cos(yaw) * radius };
    return findFreeSpotNear(world.arena, want.x, want.z, {
      radius: 0.5,
      others: [{ x: opp.pos.x, z: opp.pos.z, r: 0.6 }],
    }) || want;
  };
  const enter = (actor, angle, radius) => {
    if (!actor || !live()) return null;
    const at = around(actor, angle, radius);
    actor.show(end, at);
    actor.pos.set(at.x, 0, at.z);
    actor.face(opp);
    return at;
  };
  const impact = (actor, damage, { sound = 'heavyPunch', color = actor && actor.color, slash = false } = {}) => {
    if (!actor || !live()) return;
    const tint = color ?? 0xc4241c;
    const point = opp.chestPos();
    if (distXZ(actor.pos, opp.pos) <= 4.5) {
      world.cameraRig.playShots([{ ...impactClose(actor, opp), cut: true }]);
    }
    if (slash) world.fx.slash(point, actor.yaw, { color: tint, radius: 1.8, arc: 2.6, life: 0.32, width: 0.45, roll: 0.2 });
    world.fx.burst(point, { count: 18, color: tint, speed: 4, life: 0.38, size: 0.17 });
    if (damage > 0) applyHit(world, f, opp, { damage, kind: 'special', reaction: false, ignoreInvuln: true, sound, color: tint, scale: 1.3 });
    opp.anim.play('hit', { restart: true, blend: 0.03 });
    world.cameraRig.shake(0.18, 0.12);
    world.hitstop(0.05);
  };
  return { get, around, enter, impact };
}

function splitDamage(total, count) {
  const base = Math.floor(total / count);
  return Array.from({ length: count }, (_, i) => base + (i < total - base * count ? 1 : 0));
}

// COREOGRAFIAS PRÓPRIAS DAS LIGAÇÕES (link.choreo). Recebem a cena e devolvem o instante do golpe final.
const CHOREO = {
  forca_d({ tl, S, f, opp, world, crew, guests, color, crewTotal, live }) {
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: S + 5.2 });
    const kaiser = tools.get('kaiser'), joui = tools.get('joui'), arthur = tools.get('arthur');
    const shares = splitDamage(crewTotal, 3);
    const head = (actor) => actor.chest().add(new THREE.Vector3(0, 0.55, 0));
    const END = S + 5.2;

    if (kaiser) {
      tl.add(S, () => {
        if (!live()) return;
        tools.enter(kaiser, -1.7, 5);
        kaiser.play('breath', 0.85);
        world.cameraRig.playShots([{ ...faceClose(kaiser, { dur: 1.15, from: 2.8, to: 1.35, height: 1.65, fov: 34 }), cut: true }]);
        world.audio.play('carga', { pitch: 0.8 });
      });
      tl.add(S + 0.42, () => {
        if (!live()) return;
        world.showBanner('CINERÁRIA', 0xa46bff);
        world.fx.flash(head(kaiser), { color: 0xa46bff, size: 0.65, life: 0.3 });
        world.fx.burst(head(kaiser), { count: 18, color: 0xa46bff, speed: 1.2, life: 0.5, size: 0.12 });
      });
      tl.add(S + 0.82, () => {
        if (!live()) return;
        world.fx.burst(head(kaiser), { count: 28, color: 0x777184, speed: 2.4, spread: 1.2, life: 0.8, size: 0.19 });
        world.fx.distort(opp.chestPos(), { color: 0x817097, radius: 2.2, life: 0.65 });
        tools.impact(kaiser, shares[0], { sound: 'impact', color: 0xa46bff });
      });
    }

    if (joui) {
      tl.add(S + 1.55, () => {
        if (!live()) return;
        const at = findSpotBehind(world.arena, { x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw }, { distance: 1.35, radius: 0.5 })
          || tools.around(joui, Math.PI, 1.5);
        joui.show(END - (S + 1.55), at);
        joui.pos.set(at.x, 0, at.z);
        joui.face(opp);
        joui.play('iai_slash', 0.5);
        world.cameraRig.playShots([{ ...twoShot(joui, opp, { dur: 0.8, dist: 2.4, height: 1.45, fov: 36 }), cut: true }]);
        world.fx.shadowDisc(new THREE.Vector3(at.x, 0, at.z), { radius: 0.9, life: 0.35, rim: 0x8f4cff });
      });
      tl.add(S + 1.83, () => {
        if (!live()) return;
        tools.impact(joui, shares[1], { sound: 'slashFinal', color: 0x8f4cff, slash: true });
        const wound = opp.chestPos();
        world.fx.slash(wound, joui.yaw + 0.5, { color: 0xd7b5ff, radius: 1.05, arc: 2.3, life: 0.32, width: 0.25, roll: 0.9 });
        world.fx.slash(wound, joui.yaw - 0.5, { color: 0x6a2fe0, radius: 0.85, arc: 2.1, life: 0.28, width: 0.2, roll: -0.8 });
      });
    }

    if (arthur) {
      let start = null;
      const target = tools.around(arthur, 0.4, 1.5);
      const runStart = S + 2.65, runEnd = S + 3.25;
      tl.add(runStart, () => {
        if (!live()) return;
        const at = tools.around(arthur, Math.PI, 7);
        arthur.show(END - runStart, at);
        arthur.pos.set(at.x, 0, at.z);
        arthur.face(opp);
        arthur.play('run', 0.7);
        start = arthur.pos.clone();
        world.cameraRig.playShots([{ ...overShoulder(arthur, opp, { dur: 0.7, back: 2.1, side: 0.5, height: 1.7, fov: 42 }), cut: true }]);
        world.fx.burst(start.clone().lerp(new THREE.Vector3(target.x, 0, target.z), 0.5), {
          count: 26, color: 0x777184, speed: 2, spread: 1.5, life: 0.75, size: 0.18,
        });
      });
      tl.each((time) => {
        if (!start || time < runStart || time > runEnd || !live()) return;
        const t = smooth((time - runStart) / (runEnd - runStart));
        arthur.pos.set(
          start.x + (target.x - start.x) * t,
          0,
          start.z + (target.z - start.z) * t,
        );
        arthur.face(opp);
      });
      tl.add(runEnd, () => {
        if (!live()) return;
        arthur.play('slash_finisher', 0.5);
        world.fx.burst(arthur.chest(), { count: 16, color: 0xb5162a, speed: 2.5, life: 0.4, size: 0.15 });
        tools.impact(arthur, shares[2], { sound: 'slashFinal', color: 0xb5162a, slash: true });
      });
    }

    const F = S + 5.2;
    tl.add(F - 0.45, () => {
      if (!live()) return;
      [kaiser, joui, arthur].forEach((actor, i) => {
        if (!actor) return;
        const at = tools.around(actor, (i - 1) * 0.85, 2.3);
        actor.pos.set(at.x, 0, at.z);
        actor.face(opp);
      });
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 0.7, radius: 4, height: 1.8, a0: -0.6, a1: 0.6 }), cut: true }]);
    });
    return F;
  },

  os_cinco({ tl, S, f, opp, world, crew, guests, color, crewTotal, live }) {
    const END = S + 5.8;
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const morato = tools.get('morato'), chico = tools.get('chico'), xande = tools.get('xande');
    const lirio = tools.get('lirio'), guizo = tools.get('guizo'), dara = tools.get('dara');
    const actors = [morato, chico, xande, lirio, guizo, dara].filter(Boolean);
    const shares = splitDamage(crewTotal, actors.length || 1);
    const damageOf = (actor) => shares[actors.indexOf(actor)] || 0;
    // rajada curta da submetralhadora (Dara) ou da Mac-10 (Chico): traçantes saindo do cano, o dano entra no último tiro
    const smgBurst = (actor, at, count, damage, tint) => {
      for (let i = 0; i < count; i++) {
        tl.add(at + i * 0.06, () => {
          if (!live()) return;
          const from = actor.rig?.muzzle ? actor.rig.muzzle.getWorldPosition(new THREE.Vector3()) : actor.chest();
          const to = opp.chestPos().add(new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0));
          world.fx.tracer(from, to, { color: 0xffd27a, life: 0.08, width: 0.04 });
          world.fx.flash(from, { color: 0xffc070, size: 0.5, life: 0.05 });
          world.audio.play('m4', { volume: 0.5 });
          if (i === count - 1) tools.impact(actor, damage, { sound: 'impact', color: tint });
        });
      }
    };

    if (morato) {
      let start = null;
      const target = tools.around(morato, -1.0, 2.4);
      const walkStart = S + 0.24, walkEnd = S + 1.0;
      tl.add(S, () => {
        if (!live()) return;
        tools.enter(morato, -1.8, 6);
        morato.play('point', 0.65);
        world.cameraRig.playShots([{ ...lowAngle(morato, { dur: 0.65, dist: 2.5, side: 0.8, fov: 44 }), cut: true }]);
      });
      tl.add(walkStart, () => {
        if (!live()) return;
        start = morato.pos.clone();
        morato.play('run', walkEnd - walkStart);
      });
      tl.each((time) => {
        if (!start || time < walkStart || time > walkEnd || !live()) return;
        const t = smooth((time - walkStart) / (walkEnd - walkStart));
        morato.pos.set(start.x + (target.x - start.x) * t, 0, start.z + (target.z - start.z) * t);
        morato.face(opp);
      });
      const bullets = splitDamage(damageOf(morato), 3);
      [0.4, 0.65, 0.9].forEach((offset, i) => {
        tl.add(S + offset, () => {
          if (!live()) return;
          morato.play('shoot_rifle', 0.38);
          world.fx.tracer(morato.chest(), opp.chestPos(), { color: 0x7f9a52, life: 0.18, width: 0.07 });
          tools.impact(morato, bullets[i], { sound: 'sniper', color: 0x7f9a52 });
        });
      });
    }

    if (chico) {
      tl.add(S + 1.15, () => {
        if (!live()) return;
        tools.enter(chico, -0.9, 4.5);
        chico.play('point', 0.55);
        world.cameraRig.playShots([{ ...twoShot(chico, opp, { dur: 0.65, dist: 3, height: 1.5, fov: 42 }), cut: true }]);
        world.fx.ring(opp.pos.clone().setY(0.08), { color: 0x2ab8c8, radius: 1.2, life: 0.45 });
      });
      const [pulse, mac] = splitDamage(damageOf(chico), 2);
      tl.add(S + 1.45, () => {
        if (!live()) return;
        world.fx.flash(opp.chestPos(), { color: 0xf3dc9b, size: 2.1, life: 0.22 });
        tools.impact(chico, pulse, { sound: 'impact', color: 0x2ab8c8 });
      });
      tl.add(S + 1.62, () => live() && chico.play('shoot_rifle', 0.4));
      smgBurst(chico, S + 1.65, 6, mac, 0x2ab8c8);
    }

    if (xande) {
      const startAt = tools.around(xande, Math.PI, 6);
      const targetAt = tools.around(xande, 0.5, 1.5);
      const skateStart = S + 2.05, skateEnd = S + 2.37;
      let start = null;
      tl.add(skateStart, () => {
        if (!live()) return;
        xande.show(END - (S + 2.05), startAt);
        xande.pos.set(startAt.x, 0, startAt.z);
        xande.face(opp);
        xande.play('skate_ride', 0.6);
        start = xande.pos.clone();
        world.fx.tracer(xande.chest(), opp.chestPos(), { color: 0x5aff6a, life: 0.38, width: 0.12 });
      });
      tl.each((time) => {
        if (!start || time < skateStart || time > skateEnd || !live()) return;
        const t = smooth((time - skateStart) / (skateEnd - skateStart));
        xande.pos.set(start.x + (targetAt.x - start.x) * t, 0, start.z + (targetAt.z - start.z) * t);
        xande.face(opp);
      });
      tl.add(S + 2.37, () => {
        if (!live()) return;
        xande.pos.set(targetAt.x, 0, targetAt.z);
        xande.face(opp);
        xande.play('slash_v', 0.48);
        tools.impact(xande, damageOf(xande), { sound: 'heavyPunch', color: 0xf2c230, slash: true });
      });
    }

    if (lirio) {
      tl.add(S + 2.95, () => {
        if (!live()) return;
        tools.enter(lirio, 1.2, 2.5);
        lirio.play('hammer_charge', 0.65);
        world.cameraRig.playShots([{ ...lowAngle(lirio, { dur: 0.65, dist: 2.3, side: -0.7, fov: 43 }), cut: true }]);
        world.fx.ring(opp.pos.clone().setY(0.08), { color: 0xa51528, radius: 1.7, life: 0.8 });
        world.fx.tracer(lirio.chest(), opp.chestPos(), { color: 0xa51528, life: 0.5, width: 0.16 });
      });
      tl.add(S + 3.43, () => {
        if (!live()) return;
        lirio.play('hammer_heavy', 0.55);
        tools.impact(lirio, damageOf(lirio), { sound: 'slashFinal', color: 0xd8c8a0 });
      });
    }

    if (guizo) {
      tl.add(S + 3.78, () => {
        if (!live()) return;
        tools.enter(guizo, 2.0, 3);
        guizo.play('point', 0.55);
        world.cameraRig.playShots([{ ...overShoulder(guizo, opp, { dur: 0.55, back: 1.8, side: 0.4, height: 1.65, fov: 42 }), cut: true }]);
        world.fx.flash(guizo.chest(), { color: 0x9a9a96, size: 0.55, life: 0.2 });
      });
      tl.add(S + 4.12, () => {
        if (!live()) return;
        guizo.play('slash_h', 0.4);
        tools.impact(guizo, damageOf(guizo), { sound: 'bladeHit', color: 0x9a9a96, slash: true });
      });
    }

    if (dara) {
      tl.add(S + 4.55, () => {
        if (!live()) return;
        tools.enter(dara, -2.0, 2.4);
        dara.play('shoot_rifle', 0.35);
        world.cameraRig.playShots([{ ...twoShot(dara, opp, { dur: 0.75, dist: 2.8, height: 1.45, fov: 40 }), cut: true }]);
      });
      const [burst, punch] = splitDamage(damageOf(dara), 2);
      smgBurst(dara, S + 4.6, 5, burst, 0x8bf5ff);
      tl.add(S + 4.92, () => {
        if (!live()) return;
        dara.play('point', 0.2);
        world.fx.flash(opp.chestPos(), { color: 0x8bf5ff, size: 1.8, life: 0.25 }); // a Lanterna UV
      });
      tl.add(S + 5.1, () => {
        if (!live()) return;
        dara.play('heavy_punch', 0.35);
        tools.impact(dara, punch, { sound: 'heavyPunch', color: 0x8bf5ff });
      });
    }

    const F = END;
    tl.add(F - 0.5, () => {
      if (!live()) return;
      actors.forEach((actor, i) => {
        const at = tools.around(actor, (i - (actors.length - 1) / 2) * 0.5, 2.4);
        actor.pos.set(at.x, 0, at.z);
        actor.face(opp);
      });
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 0.8, radius: 4, height: 1.8, a0: -0.8, a1: 0.8 }), cut: true }]);
    });
    return F;
  },

  abutres({ tl, S, f, opp, world, crew, guests, color, crewTotal, live }) {
    const END = S + 5.4;
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const dante = tools.get('dante'), balu = tools.get('balu'), joui = tools.get('joui'), arthur = tools.get('arthur'), carina = tools.get('carina'), rubens = tools.get('rubens');
    const actors = [dante, balu, joui, arthur, carina, rubens].filter(Boolean);
    const shares = splitDamage(crewTotal, actors.length || 1);
    const damageOf = (actor) => shares[actors.indexOf(actor)] || 0;

    if (dante) {
      tl.add(S, () => {
        if (!live()) return;
        tools.enter(dante, -1.7, 4.5);
        dante.play('taunt_roar', 0.65);
        world.cameraRig.playShots([{ ...lowAngle(dante, { dur: 0.7, dist: 2.4, fov: 44 }), cut: true }]);
        world.fx.ring(opp.pos.clone().setY(0.08), { color: 0x392d45, radius: 1.6, life: 0.6 });
      });
      tl.add(S + 0.52, () => {
        if (!live()) return;
        world.fx.burst(opp.chestPos(), { count: 22, color: 0x2a202e, speed: 2.8, spread: 1.3, life: 0.65, size: 0.18 });
        tools.impact(dante, damageOf(dante), { sound: 'drain', color: 0x392d45 });
      });
    }

    if (balu) {
      tl.add(S + 1.05, () => {
        if (!live()) return;
        tools.enter(balu, 0.5, 2.8);
        balu.play('hammer_charge', 0.65);
        world.cameraRig.playShots([{ ...twoShot(balu, opp, { dur: 0.75, dist: 2.8, height: 1.5, fov: 40 }), cut: true }]);
      });
      tl.add(S + 1.62, () => {
        if (!live()) return;
        balu.play('hammer_diag', 0.48);
        tools.impact(balu, damageOf(balu), { sound: 'axeHit', color: 0xb8b3c2, slash: true });
      });
    }

    if (joui) {
      tl.add(S + 2.1, () => {
        if (!live()) return;
        const at = findSpotBehind(world.arena, { x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw }, { distance: 1.3, radius: 0.5 })
          || tools.around(joui, Math.PI, 1.4);
        joui.show(END - (S + 2.1), at);
        joui.pos.set(at.x, 0, at.z);
        joui.face(opp);
        joui.play('iai_slash', 0.5);
        world.cameraRig.playShots([{ ...twoShot(joui, opp, { dur: 0.7, dist: 2.4, height: 1.45, fov: 36 }), cut: true }]);
      });
      tl.add(S + 2.38, () => {
        if (!live()) return;
        tools.impact(joui, damageOf(joui), { sound: 'slashFinal', color: 0x9a94ae, slash: true });
      });
    }

    if (arthur) {
      let start = null;
      const target = tools.around(arthur, -0.5, 1.4);
      const runStart = S + 2.85, runEnd = S + 3.55;
      tl.add(runStart, () => {
        if (!live()) return;
        const at = tools.around(arthur, Math.PI, 6.5);
        arthur.show(END - runStart, at);
        arthur.pos.set(at.x, 0, at.z);
        arthur.face(opp);
        arthur.play('run', 0.75);
        start = arthur.pos.clone();
        world.cameraRig.playShots([{ ...overShoulder(arthur, opp, { dur: 0.7, back: 2, side: 0.5, height: 1.7, fov: 42 }), cut: true }]);
        world.fx.burst(start.clone().lerp(new THREE.Vector3(target.x, 0, target.z), 0.5), {
          count: 24, color: 0x777184, speed: 2, spread: 1.4, life: 0.7, size: 0.18,
        });
      });
      tl.each((time) => {
        if (!start || time < runStart || time > runEnd || !live()) return;
        const t = smooth((time - runStart) / (runEnd - runStart));
        arthur.pos.set(start.x + (target.x - start.x) * t, 0, start.z + (target.z - start.z) * t);
        arthur.face(opp);
      });
      tl.add(runEnd, () => {
        if (!live()) return;
        arthur.play('slash_finisher', 0.5);
        world.fx.burst(arthur.chest(), { count: 18, color: 0xb5162a, speed: 2.5, life: 0.4, size: 0.15 });
        tools.impact(arthur, damageOf(arthur), { sound: 'slashFinal', color: 0xb5162a, slash: true });
      });
    }

    // CARINA: entra de lado na queda do corte do Arthur, gira o nunchaku na cara do alvo e fecha com a Glock Silenciada
    if (carina) {
      tl.add(S + 3.75, () => {
        if (!live()) return;
        const at = tools.around(carina, 1.3, 1.5);
        carina.show(END - (S + 3.75), at);
        carina.pos.set(at.x, 0, at.z);
        carina.face(opp);
        carina.play('flurry', 0.4);
        world.cameraRig.playShots([{ ...twoShot(carina, opp, { dur: 0.75, dist: 2.4, height: 1.45, fov: 38 }), cut: true }]);
      });
      tl.add(S + 3.95, () => {
        if (!live()) return;
        world.fx.burst(opp.chestPos(), { count: 14, color: 0x2a5ad0, speed: 2.4, life: 0.35, size: 0.14 });
        tools.impact(carina, Math.floor(damageOf(carina) * 0.5), { sound: 'punch', color: 0x2a5ad0 });
      });
      tl.add(S + 4.2, () => {
        if (!live()) return;
        carina.play('point', 0.3);
        world.fx.tracer(carina.chest(), opp.chestPos(), { color: 0xffe08a, life: 0.12, width: 0.03 });
        tools.impact(carina, damageOf(carina) - Math.floor(damageOf(carina) * 0.5), { sound: 'impact', color: 0xf2c230 });
      });
    }

    // RUBENS: o Salto Fantasma — a estática rosa, azul, ciano e verde no lado do alvo — e a martelada por cima que fecha
    if (rubens) {
      tl.add(S + 4.45, () => {
        if (!live()) return;
        const at = tools.around(rubens, -1.2, 1.4);
        rubens.show(END - (S + 4.45), at);
        rubens.pos.set(at.x, 0, at.z);
        rubens.face(opp);
        for (const c of [0xff4ab0, 0x3a6aff, 0x4ae0ff, 0x4aff8a]) world.fx.burst(rubens.chest(), { count: 8, color: c, speed: 3, life: 0.35, size: 0.1 });
        world.audio.play('blink', { volume: 0.7 });
        rubens.play('hammer_v', 0.48);
        world.cameraRig.playShots([{ ...lowAngle(rubens, { dur: 0.7, dist: 2.2, fov: 42 }), cut: true }]);
      });
      tl.add(S + 4.68, () => {
        if (!live()) return;
        world.fx.ring(opp.pos.clone().setY(0.08), { color: 0x4ae0ff, radius: 1.4, life: 0.4 });
        tools.impact(rubens, damageOf(rubens), { sound: 'heavyPunch', color: 0x4ae0ff });
      });
    }

    const F = END;
    tl.add(F - 0.45, () => {
      if (!live()) return;
      actors.forEach((actor, i) => {
        const at = tools.around(actor, (i - (actors.length - 1) / 2) * 0.65, 2.4);
        actor.pos.set(at.x, 0, at.z);
        actor.face(opp);
      });
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 0.75, radius: 4, height: 1.8, a0: -0.7, a1: 0.7 }), cut: true }]);
    });
    return F;
  },

  // EXECUÇÃO DOS MASCARADOS (pedido do dono, 2026-11-01): a Kemi (Fantasma) atira de longe, o X (Jae) surge atrás e
  // crava a faca, o ??? (Labirinto) carrega um raio de energia e solta, e o Dalmo e o Aguiar fecham juntos — o Dalmo nos
  // socos e o Aguiar cortando com o machado. O Juan (se estiver na equipe) abre a carne com o Descarnar no meio da dupla.
  mascarados({ tl, S, f, opp, world, crew, guests, color, crewTotal, live }) {
    const by = (id) => { const x = [f, ...crew].find((m) => linkId(m.def) === id); return x ? actorFor(x, f, guests) : null; };
    const kemi = by('kemi'), jae = by('jae'), lab = by('labirinto'), dalmo = by('dalmo'), aguiar = by('aguiar'), juan = by('juan');
    const cast = [kemi, jae, lab, dalmo, aguiar, juan].filter(Boolean);
    // dano: cada parte com o seu peso (os golpes da dupla somam mais)
    const W = { kemi: 2, jae: 2, lab: 2.5, dalmo: 1, aguiar: 1, juan: 1.5 };
    const wsum = (kemi ? W.kemi : 0) + (jae ? W.jae : 0) + (lab ? W.lab : 0) + (dalmo ? W.dalmo * 3 : 0) + (aguiar ? W.aguiar * 2 : 0) + (juan ? W.juan : 0) || 1;
    const part = (w) => Math.floor((crewTotal * w) / wsum);
    const hit = (who, dmg, { sound = 'heavyPunch', fx = 'burst', col } = {}) => {
      if (!live()) return;
      const c = col ?? who.color;
      const p = opp.chestPos();
      if (fx === 'slash') world.fx.slash(p, who.yaw, { color: c, radius: 1.8, arc: 2.6, life: 0.3, width: 0.45, roll: (Math.random() - 0.5) * 2 });
      world.fx.burst(p, { count: 16, color: c, speed: 4, life: 0.35, size: 0.16 });
      if (dmg > 0) applyHit(world, f, opp, { damage: dmg, kind: 'special', reaction: false, ignoreInvuln: true, sound, color: c, scale: 1.3 });
      opp.anim.play('hit', { restart: true, blend: 0.03 });
      world.cameraRig.shake(0.18, 0.12);
      world.hitstop(0.05);
    };
    const place = (who, x, z) => { who.pos.set(x, 0, z); who.face(opp); };
    const around = (ang, r) => {
      const a = opp.yaw + ang;
      const want = { x: opp.pos.x + Math.sin(a) * r, z: opp.pos.z + Math.cos(a) * r };
      return findFreeSpotNear(world.arena, want.x, want.z, { radius: 0.5, others: [{ x: opp.pos.x, z: opp.pos.z, r: 0.6 }] }) || want;
    };
    const END = 5.6; // todos ficam até o fim
    let t = S;
    // o líder espera de lado até a vez dele (a parte dele o põe no lugar)
    tl.add(S, () => {
      if (!live()) return;
      const side = around(-2.2, 6);
      f.pos.set(side.x, 0, side.z);
      f.yaw = yawTo(f.pos, opp.pos);
    });
    // 1. A FANTASMA ATIRA DE LONGE
    if (kemi) {
      tl.add(t, () => {
        if (!live()) return;
        const s = around(Math.PI * 0.75, 9);
        kemi.show(END, s);
        place(kemi, s.x, s.z);
        kemi.play('shoot_sniper', 1.0);
        world.cameraRig.playShots([{ ...overShoulder(kemi, opp, { dur: 0.95, back: 1.6, side: 0.7, height: 1.8, fov: 40 }), cut: true }]);
        world.fx.flash(kemi.chest(), { color: kemi.color, size: 0.6, life: 0.3 });
      });
      tl.add(t + 0.5, () => {
        if (!live()) return;
        world.fx.tracer(kemi.chest(), opp.chestPos(), { color: kemi.color, life: 0.3, width: 0.1 });
        world.fx.flash(opp.chestPos(), { color: kemi.color, size: 1.8, life: 0.18 });
        hit(kemi, part(W.kemi), { sound: 'sniper' });
      });
      t += 1.0;
    }
    // 2. O X SURGE ATRÁS E CRAVA A FACA
    if (jae) {
      tl.add(t, () => {
        if (!live()) return;
        const s = findSpotBehind(world.arena, { x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw }, { distance: 1.2, radius: 0.5 }) || around(Math.PI, 1.2);
        world.fx.shadowDisc(new THREE.Vector3(s.x, 0, s.z), { radius: 1, life: 0.5, rim: jae.color });
        jae.show(END - (t - S), s);
        place(jae, s.x, s.z);
        jae.play('thrust', 0.6);
        world.audio.play('teleport', { volume: 0.6 });
        world.cameraRig.playShots([{ ...twoShot(jae, opp, { dur: 0.75, dist: 2.4, height: 1.4, push: 0.4, side: 1, fov: 38 }), cut: true }]);
      });
      tl.add(t + 0.28, () => {
        hit(jae, part(W.jae), { sound: 'bladeHit', fx: 'slash' });
        if (live()) world.fx.burst(opp.chestPos(), { count: 22, color: 0x9a0e14, speed: 3.5, life: 0.5, size: 0.14, gravity: 8 });
      });
      t += 0.8;
    }
    // 3. O ??? CARREGA O RAIO DE ENERGIA E SOLTA
    if (lab) {
      let charge = null;
      tl.add(t, () => {
        if (!live()) return;
        const s = around(-Math.PI * 0.6, 5);
        lab.show(END - (t - S), s);
        place(lab, s.x, s.z);
        lab.play('concentrate', 0.75);
        world.cameraRig.playShots([{ ...lowAngle(lab, { dur: 0.75, dist: 2.2, side: 1.1, fov: 48 }), cut: true }]);
        charge = world.fx.emitter({ rate: 90, follow: () => lab.chest().add(new THREE.Vector3(0, 0.1, 0)), particle: { color: lab.color, speed: 1.5, spread: 1.2, up: 0.4, life: 0.35, size: 0.14 } });
        world.audio.play('carga', { pitch: 0.8 });
      });
      tl.add(t + 0.7, () => {
        if (charge) charge.stop();
        if (!live()) return;
        lab.play('arn_emit', 0.5);
        world.cameraRig.playShots([{ ...overShoulder(lab, opp, { dur: 0.6, back: 1.8, side: -0.8, height: 1.7, fov: 46 }), cut: true }]);
        world.fx.tracer(lab.chest(), opp.chestPos(), { color: lab.color, life: 0.4, width: 0.32 });
        world.fx.tracer(lab.chest(), opp.chestPos(), { color: 0xffffff, life: 0.3, width: 0.1 });
        world.fx.distort(opp.chestPos(), { color: lab.color, radius: 1.8, life: 0.4 });
      });
      tl.add(t + 0.82, () => hit(lab, part(W.lab), { sound: 'impact' }));
      t += 1.3;
    }
    // 4. DALMO E AGUIAR JUNTOS: os socos do Dalmo e o machado do Aguiar (o Juan no meio, se estiver)
    const duo = [dalmo, aguiar, juan].filter(Boolean);
    if (duo.length) {
      tl.add(t, () => {
        if (!live()) return;
        if (dalmo) { const s = around(0, 1.3); dalmo.show(END - (t - S), s); place(dalmo, s.x, s.z); }
        if (aguiar) { const s = around(0.9, 1.5); aguiar.show(END - (t - S), s); place(aguiar, s.x, s.z); }
        if (juan) { const s = around(-0.9, 1.5); juan.show(END - (t - S), s); place(juan, s.x, s.z); }
        world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.5, radius: 4.2, height: 1.8, a0: -0.5, a1: 0.7, lookH: 1.1, fov: 44 }), cut: true }]);
      });
      // Dalmo: três socos · Aguiar: dois cortes intercalados · Juan: o Descarnar entre eles
      if (dalmo) ['jab', 'cross', 'hook_l'].forEach((an, i) => {
        tl.add(t + 0.05 + i * 0.36, () => { if (live()) dalmo.play(an, 0.34); });
        tl.add(t + 0.18 + i * 0.36, () => hit(dalmo, part(W.dalmo), { sound: 'heavyPunch' }));
      });
      if (aguiar) [0, 1].forEach((i) => {
        tl.add(t + 0.2 + i * 0.5, () => { if (live()) aguiar.play(i ? 'slash_d' : 'slash_v', 0.45); });
        tl.add(t + 0.36 + i * 0.5, () => hit(aguiar, part(W.aguiar), { sound: 'axeHit', fx: 'slash' }));
      });
      if (juan) {
        tl.add(t + 0.55, () => { if (live()) juan.play('slash_v', 0.5); });
        tl.add(t + 0.7, () => {
          hit(juan, part(W.juan), { sound: 'bladeHit', fx: 'slash', col: 0xb01020 });
          if (live()) world.fx.burst(opp.chestPos(), { count: 26, color: 0x9a0e14, speed: 3, life: 0.5, size: 0.14, gravity: 8 });
        });
      }
      t += 1.25;
    }
    // GOLPE FINAL: Dalmo no soco pesado e Aguiar no machado de cima, juntos; os outros soltam o deles ao mesmo tempo
    tl.add(t, () => {
      if (!live()) return;
      if (dalmo) dalmo.play('heavy_punch', 0.6);
      if (aguiar) aguiar.play('slash_v', 0.6);
      if (juan) juan.play('slash_d', 0.6);
      if (jae) jae.play('thrust', 0.5);
      if (kemi) { kemi.play('shoot_sniper', 0.6); world.fx.tracer(kemi.chest(), opp.chestPos(), { color: kemi.color, life: 0.3, width: 0.1 }); }
      if (lab) { lab.play('arn_emit', 0.5); world.fx.tracer(lab.chest(), opp.chestPos(), { color: lab.color, life: 0.35, width: 0.3 }); }
      const hero = dalmo || aguiar || cast[0] || f;
      world.cameraRig.playShots([{ ...pullBack(hero, opp, { dur: 1.1, from: 3.2, to: 7, height: 2.3 }), cut: true }]);
    });
    return t;
  },
};

// A CENA (abilities.js teamSpecial). Devolve { tl, cancel }.
export function teamScene(f, world, TS) {
  const opp = f.opponent;
  const link = teamLinkOf(f);
  const { crew, guests } = teamCrew(f, world, link);
  f.teamGuests = guests;
  const color = link ? link.color : f.def.energyColor ?? 0xffd84a;
  // dano em escada (COMBAT.teamSpecial): sem ligação < com ligação; o líder transformado sobe um degrau
  const total = link ? (f.baseForm ? TS.formDamage : TS.damage) : (f.baseForm ? TS.plainFormDamage : TS.plainDamage);
  const tl = new Timeline();
  const h0 = opp.health;
  let caught = false;
  let inScene = false;
  let undoSceneProps = () => {};
  const formed = [];
  const cleanup = () => {
    for (const a of formed.splice(0)) a.revertEmpower();
    undoSceneProps();
    undoSceneProps = () => {};
    for (const a of crew) if (a.active) a.leave();
    guests.forEach((g) => g.reset());
    if (f.teamGuests === guests) f.teamGuests = null;
    if (inScene) { inScene = false; world.endCinematic(); }
  };

  f.vel.set(0, 0, 0);
  f.yaw = yawTo(f.pos, opp.pos);
  f.invuln = Math.max(f.invuln, TS.catchAt + 0.5); // o líder não é interrompido na abertura (quem pode errar é o golpe de abertura)
  f.anim.play('concentrate', { restart: true, duration: 1 });
  world.audio.play('specialStart', { volume: 0.9 });
  world.fx.ring(f.pos.clone().setY(0.06), { color, radius: 2.8, life: 0.7 });
  // 1º TEXTO: só o nome da equipe
  world.showBanner(link ? link.banner : 'Especial em Equipe!', color);

  // ABERTURA: o primeiro membro avança e golpeia (com reação normal: dá para defender ou esquivar)
  const opener = crew[0];
  tl.add(0.05, () => {
    if (!opener) return;
    // o golpe próprio da ligação (LINK_MOVES; Mascarados: o de roda); quem atira avança e golpeia (o tiro chegaria tarde)
    const st = strikeOf(opener.def);
    const own = link && link.style === 'circle' ? circleStrike : !RANGED_LOOK[linkId(opener.def)] && link ? moveFor(opener.def) : (c) => rushStrike(c, st.anim, [[0.28, 30]], st.hitSound || 'heavyPunch', { knockback: 0.2 });
    opener.perform(own, { quiet: true, guest: guests.includes(opener) });
  });
  tl.each(() => {
    if (!caught && tl.time <= TS.catchAt + 0.05 && opp.health < h0 && opp.state !== 'ko') caught = true;
  });

  // ERROU: acaba aqui (o líder não gasta o especial)
  tl.add(TS.catchAt + 0.06, () => {
    if (caught) return;
    f.notify('ESPECIAL EM EQUIPE ERROU', true);
    cleanup();
    tl.end(tl.time + 0.3);
  });

  // PEGOU: vira cena
  const C = TS.catchAt + 0.06;
  tl.add(C, () => {
    if (!caught || opp.state === 'ko') return;
    if (opener && opener.active) opener.leave();
    world.beginCinematic(f, opp);
    inScene = true;
    f.invuln = Math.max(f.invuln, 30);
    if (link && link.sceneForms) {
      for (const a of crew) {
        const want = link.sceneForms[linkId(a.def)];
        if (want && !a.empowered && a.def.awakening && a.def.awakening.form === want) { a.empower(color); formed.push(a); }
      }
    }
    const undoMasks = wearMasks(link, [f, ...crew]);
    const undoProps = showSceneProps(link, [f, ...crew]);
    undoSceneProps = () => {
      undoProps();
      undoMasks();
    };
    // conta como o especial do líder (a sanidade do especial, a recarga e o uso na partida)
    f.spendEnergy(Math.min(f.energy, f.specialCost()));
    f.cooldowns.special = f.cooldownMax.special;
    f.specialUses++;
    world.cameraRig.playShots([{ ...orbit(opp, { dur: TS.banner + TS.cards - C + 0.2, radius: 5, height: 2.4, a0: -1.2, a1: 0.4, lookH: 1 }), cut: true }]);
  });
  // 2º TEXTO: os retratos (depois que o nome saiu)
  tl.add(TS.banner, () => {
    if (!inScene || !world.ui || !world.ui.teamCut) return;
    const cards = link ? linkCards(link, f) : [...crew.map((a) => a.def), f.def];
    world.ui.teamCut(cards.map((d) => ({ id: d.id, name: d.name, color: '#' + new THREE.Color(d.energyColor ?? color).getHexString() })), { quick: true });
  });

  const S = TS.banner + TS.cards;
  const crewTotal = Math.round(total * TS.crewShare);
  const choreo = link && CHOREO[link.choreo];
  const F = choreo
    ? choreo({ tl, S, f, opp, world, crew, guests, color, crewTotal, live: () => inScene && opp.state !== 'ko' })
    : genericParts({ tl, S, f, opp, world, crew, guests, color, crewTotal, TS, live: () => inScene && opp.state !== 'ko' });
  // 3º TEXTO (só nas ligações): o NOME DO ESPECIAL EM EQUIPE, sozinho, no golpe final — nunca o especial próprio do líder
  if (link) tl.add(F, () => { if (inScene) world.showBanner(link.name, color); });
  // o golpe final: o que falta para o total exato, com a reação de verdade (voa longe)
  tl.add(F + 0.4, () => {
    if (!inScene) return;
    const dealt = h0 - opp.health;
    const rest = Math.max(Math.round(total * 0.3), total - dealt); // o golpe final nunca é fraco
    inScene = false;
    world.endCinematic();
    if (opp.state === 'ko') return;
    opp.comboHits = 0;
    const dir = new THREE.Vector3().subVectors(opp.pos, f.pos).setY(0).normalize();
    applyHit(world, f, opp, { damage: rest, kind: 'special', knockback: 7, launch: true, dir, ignoreInvuln: true, unblockable: true, sound: 'slashFinal', color, scale: 2.2 });
    world.fx.ring(opp.chestPos(), { color, radius: 2.4, life: 0.4, vertical: true, yaw: f.yaw + Math.PI / 2 });
    world.fx.burst(opp.chestPos(), { count: 40, color, speed: 6, life: 0.5, size: 0.2 });
    world.screenFlash && world.screenFlash(color, 0.18);
    world.cameraRig.shake(0.45, 0.3);
    world.hitstop(0.14);
  });
  tl.add(F + 0.75, () => { f.invuln = Math.min(f.invuln, 0.3); cleanup(); });
  tl.end(F + 0.9);
  return { tl, cancel: () => { f.invuln = Math.min(f.invuln, 0.3); cleanup(); } };
}

// os retratos do tríptico de abertura: quem está na ligação (no grupo, todos os membros)
export function linkCards(link, f) {
  // quem está na equipe aparece com a versão escolhida; os de fora, com a versão da ligação; o líder por último
  const team = [...f.assists.map((a) => a.def), f.def];
  const cards = (link.group || link.members).map((e) => team.find((d) => matchesEntry(e, d)) || ROSTER.find((d) => d.id === e) || ROSTER.find((d) => d.baseId === e));
  const uniq = [...new Set(cards.filter(Boolean))];
  return [...uniq.filter((d) => d !== f.def), ...uniq.filter((d) => d === f.def)];
}
