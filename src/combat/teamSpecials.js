import * as THREE from 'three';
import { Timeline, distXZ, smooth, yawTo } from '../core/util.js';
import { Assist, rushStrike, shoot } from './assists.js';
import { findSpotBehind, findFreeSpotNear } from './positioning.js';
import { applyHit } from './damage.js';
import { twoShot, orbit, pullBack, overShoulder, lowAngle, faceClose, impactClose } from '../camera/shots.js';
import { ROSTER } from '../characters/index.js';
import { bateriaEloy } from '../models/weapons.js';
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

// legenda com o nome e a cor de quem fala (side 0 = esquerda, 1 = direita)
function sayer(world) {
  const hex = (def) => (typeof def.color === 'string' ? def.color : '#' + new THREE.Color(def.energyColor ?? 0xc4241c).getHexString());
  return (actor, text, side) => actor && world.ui && world.ui.subtitle && world.ui.subtitle({ name: actor.def.name, color: hex(actor.def), text, side });
}

// liga/desliga peças do modelo durante a cena e devolve tudo como estava no fim (prop.undo())
function propSwapper() {
  const undo = [];
  const prop = (actor, name, on) => {
    const rig = actor && actor.rig;
    if (!rig || !rig.props || !rig.props[name]) return;
    undo.push([rig, name, rig.props[name].visible]);
    rig.showProp(name, on);
  };
  prop.undo = () => { for (const [rig, name, v] of undo.reverse()) rig.showProp(name, v); undo.length = 0; };
  return prop;
}

function splitDamage(total, count) {
  const base = Math.floor(total / count);
  return Array.from({ length: count }, (_, i) => base + (i < total - base * count ? 1 : 0));
}

// COREOGRAFIAS PRÓPRIAS DAS LIGAÇÕES (link.choreo). Recebem a cena e devolvem o instante do golpe final.
const CHOREO = {
  forca_d({ tl, S, f, opp, world, crew, guests, color, crewTotal, live }) {
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: S + 8.3 });
    const kaiser = tools.get('kaiser'), joui = tools.get('joui'), dante = tools.get('dante'), arthur = tools.get('arthur');
    const erin = tools.get('erin'), beatrice = tools.get('beatrice'), fernando = tools.get('fernando'), tristan = tools.get('tristan');
    const actors = [kaiser, joui, dante, arthur, erin, beatrice, fernando, tristan].filter(Boolean);
    // um pedaço a mais para os ataques de dentro da névoa (o último)
    const shares = splitDamage(crewTotal, (actors.length || 1) + 1);
    const damageOf = (actor) => shares[actors.indexOf(actor)] || 0;
    const say = sayer(world);
    const head = (actor) => actor.chest().add(new THREE.Vector3(0, 0.55, 0));
    const END = S + 8.3;

    if (kaiser) {
      tl.add(S, () => {
        if (!live()) return;
        tools.enter(kaiser, -1.7, 5);
        kaiser.play('breath', 0.85);
        say(kaiser, 'Força D, comigo. A névoa fecha o caminho.', 0);
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
        tools.impact(kaiser, damageOf(kaiser), { sound: 'impact', color: 0xa46bff });
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
        say(joui, 'Sem perder quem eu sou.', 1);
        world.cameraRig.playShots([{ ...twoShot(joui, opp, { dur: 0.8, dist: 2.4, height: 1.45, fov: 36 }), cut: true }]);
        world.fx.shadowDisc(new THREE.Vector3(at.x, 0, at.z), { radius: 0.9, life: 0.35, rim: 0x8f4cff });
      });
      tl.add(S + 1.83, () => {
        if (!live()) return;
        tools.impact(joui, damageOf(joui), { sound: 'slashFinal', color: 0x8f4cff, slash: true });
        const wound = opp.chestPos();
        world.fx.slash(wound, joui.yaw + 0.5, { color: 0xd7b5ff, radius: 1.05, arc: 2.3, life: 0.32, width: 0.25, roll: 0.9 });
        world.fx.slash(wound, joui.yaw - 0.5, { color: 0x6a2fe0, radius: 0.85, arc: 2.1, life: 0.28, width: 0.2, roll: -0.8 });
      });
    }

    // DANTE: o ocultista ergue o Lodo e fecha a Espiral no alvo
    if (dante) {
      tl.add(S + 2.2, () => {
        if (!live()) return;
        tools.enter(dante, 1.2, 2.2);
        dante.play('wave_punch', 0.56);
        say(dante, 'A luz apaga.', 0);
        world.cameraRig.playShots([{ ...twoShot(dante, opp, { dur: 0.6, dist: 3, height: 1.5, fov: 42 }), cut: true }]);
        world.fx.ring(opp.pos.clone().setY(0.08), { color: 0x392d45, radius: 1.5, life: 0.5 });
      });
      tl.add(S + 2.6, () => {
        if (!live()) return;
        world.fx.burst(opp.chestPos(), { count: 24, color: 0x1a161e, kind: 'smoke', speed: 2.6, spread: 1.2, life: 0.7, size: 0.4 });
        tools.impact(dante, damageOf(dante), { sound: 'drain', color: 0x392d45 });
      });
    }

    if (arthur) {
      let start = null;
      const target = tools.around(arthur, 0.4, 1.5);
      const runStart = S + 3.0, runEnd = S + 3.6;
      tl.add(runStart, () => {
        if (!live()) return;
        const at = tools.around(arthur, Math.PI, 7);
        arthur.show(END - runStart, at);
        arthur.pos.set(at.x, 0, at.z);
        arthur.face(opp);
        arthur.play('run', 0.7);
        say(arthur, 'Eu queria resolver de outro jeito. Mas vamos lá!', 1);
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
        tools.impact(arthur, damageOf(arthur), { sound: 'slashFinal', color: 0xb5162a, slash: true });
      });
    }

    // ERIN: a granada Supernova cai no pé do alvo — KABOOM
    if (erin) {
      tl.add(S + 3.95, () => {
        if (!live()) return;
        const at = tools.around(erin, 1.6, 4.6);
        erin.show(END - (S + 3.95), at);
        erin.pos.set(at.x, 0, at.z);
        erin.face(opp);
        erin.play('throw_r', 0.5);
        say(erin, 'KABOOOM!', 0);
        world.cameraRig.playShots([{ ...twoShot(erin, opp, { dur: 0.7, dist: 3.2, height: 1.5, fov: 42 }), cut: true }]);
        world.fx.tracer(erin.chest(), opp.chestPos(), { color: 0xff7a2a, life: 0.3, width: 0.05 });
      });
      tl.add(S + 4.35, () => {
        if (!live()) return;
        const at = opp.pos.clone();
        world.fx.flash(at.clone().setY(1), { color: 0xff7a2a, size: 3, life: 0.2 });
        world.fx.ring(at.clone().setY(0.08), { color: 0xff7a2a, radius: 2, life: 0.45 });
        world.fx.burst(at.clone().setY(0.6), { count: 40, color: 0x0c0a0e, kind: 'smoke', speed: 4, up: 1.5, life: 0.9, size: 0.7, grow: 1 });
        world.fx.burst(at.clone().setY(0.6), { count: 36, color: 0xff7a2a, speed: 8, life: 0.5, size: 0.22 });
        world.cameraRig.shake(0.3, 0.2);
        tools.impact(erin, damageOf(erin), { sound: 'explosion', color: 0xff7a2a });
      });
    }

    // BEATRICE: de longe, o Orpheu levanta voo do ombro dela e ela fecha com o virote da balestra (os LEDs acesos)
    if (beatrice) {
      tl.add(S + 4.75, () => {
        if (!live()) return;
        const at = tools.around(beatrice, -1.0, 4.2);
        beatrice.show(END - (S + 4.75), at);
        beatrice.pos.set(at.x, 0, at.z);
        beatrice.face(opp);
        beatrice.play('point', 0.7);
        say(beatrice, 'Orpheu, vai!', 1);
        world.cameraRig.playShots([{ ...overShoulder(beatrice, opp, { dur: 0.8, back: 1.6, side: 0.45, height: 1.6, fov: 40 }), cut: true }]);
        world.fx.burst(beatrice.chest().add(new THREE.Vector3(0, 0.5, 0)), { count: 14, color: 0x8a7458, speed: 2, life: 0.6, size: 0.09, gravity: 3 });
        world.fx.tracer(beatrice.chest().add(new THREE.Vector3(0, 0.5, 0)), opp.chestPos().add(new THREE.Vector3(0, 0.55, 0)), { color: 0x8a7458, life: 0.35, width: 0.08 });
      });
      tl.add(S + 5.2, () => {
        if (!live()) return;
        world.fx.tracer(beatrice.chest(), opp.chestPos(), { color: 0xf4f0d8, life: 0.15, width: 0.035 });
        world.fx.flash(beatrice.chest(), { color: 0xf4f0d8, size: 0.8, life: 0.12 });
        tools.impact(beatrice, damageOf(beatrice), { sound: 'bladeHit', color: 0xf2c230 });
      });
    }

    // FERNANDO: por último, do lado; os olhos ficam amarelos (o Luciano assume) e três tiros da Glock 17
    if (fernando) {
      tl.add(S + 5.45, () => {
        if (!live()) return;
        const at = tools.around(fernando, 1.1, 3.4);
        fernando.show(END - (S + 5.45), at);
        fernando.pos.set(at.x, 0, at.z);
        fernando.face(opp);
        fernando.play('point', 0.5);
        world.ui && world.ui.subtitle && world.ui.subtitle({ name: 'LUCIANO CARVALHO', color: '#e8b818', text: 'Deixa comigo, Fê.', side: 0 });
        world.fx.flash(head(fernando), { color: 0xe8b818, size: 0.8, life: 0.2 });
      });
      for (let i = 0; i < 3; i++) {
        tl.add(S + 5.62 + i * 0.08, () => {
          if (!live()) return;
          world.fx.tracer(fernando.chest(), opp.chestPos(), { color: 0xffe08a, life: 0.1, width: 0.03 });
          world.audio.play('m4', { volume: 0.5 });
          if (i === 2) tools.impact(fernando, damageOf(fernando), { sound: 'impact', color: 0xe8b818 });
        });
      }
    }

    // TRISTAN: do outro lado, o jato do lança-chamas em cima do alvo (os tanques nas costas)
    if (tristan) {
      tl.add(S + 5.2, () => {
        if (!live()) return;
        const at = tools.around(tristan, -1.1, 3.0);
        tristan.show(END - (S + 5.2), at);
        tristan.pos.set(at.x, 0, at.z);
        tristan.face(opp);
        tristan.play('point', 0.9);
        if (!fernando) say(tristan, 'QUEIMA!', 1);
      });
      for (let i = 0; i < 6; i++) {
        tl.add(S + 5.35 + i * 0.1, () => {
          if (!live()) return;
          const a = tristan.chest();
          const b = opp.chestPos();
          for (let k = 1; k <= 4; k++) world.fx.burst(a.clone().lerp(b, k / 4), { count: 2, color: k < 2 ? 0xffd070 : 0xff7a2a, speed: 1, up: 1.4, life: 0.3, size: 0.25 + k * 0.08 });
          if (i === 0) world.audio.play('smoke', { volume: 0.7, pitch: 0.6 });
          if (i === 5) tools.impact(tristan, damageOf(tristan), { sound: 'impact', color: 0xff7a2a });
        });
      }
    }

    // A NÉVOA DA FORÇA D (PROPOSTA; base canônica: a CINERÁRIA do Kaiser, a névoa que ele abre nos rituais, e a fala
    // dele "a névoa fecha o caminho"). O Kaiser fecha a névoa em volta do alvo; de dentro dela cada membro sai, golpeia e
    // some de novo, de um lado diferente; a névoa abre para fora e a Força D aparece formada atrás do Kaiser
    const FOG = S + 6.0;
    const FOG_C = 0xc8bfd8, FOG_DARK = 0x948aa8, KAISER_C = 0xa46bff;
    const STRIKE = { kaiser: 'heavy_punch', joui: 'iai_slash', dante: 'wave_punch', arthur: 'slash_finisher', erin: 'dual_cross', beatrice: 'slash_h', fernando: 'heavy_punch', tristan: 'slash_h' };
    const step = Math.min(0.17, 1.0 / Math.max(1, actors.length));
    const fogAt = (ang, r) => new THREE.Vector3(opp.pos.x + Math.sin(ang) * r, 0.9, opp.pos.z + Math.cos(ang) * r);
    const puff = (count = 1) => {
      for (let q = 0; q < count; q++) {
        const ang = Math.random() * Math.PI * 2;
        world.fx.burst(fogAt(ang, 1.4 + Math.random() * 2.2), { kind: 'smoke', count: 4, color: Math.random() < 0.6 ? FOG_C : FOG_DARK, speed: 0.3, spread: 1, up: 0.1, life: 1.8, size: 2.0, grow: 1.1, drag: 1, jitter: 0.6 });
      }
    };
    let fogOn = false;
    tl.add(FOG, () => {
      if (!live() || !actors.length) return;
      fogOn = true;
      const who = kaiser || actors[0];
      if (kaiser) { kaiser.play('breath', 0.7); say(kaiser, 'Cinerária.', 0); world.showBanner('CINERÁRIA', KAISER_C); }
      else say(who, 'Agora!', 0);
      world.audio.play('ritual', { volume: 0.7, pitch: 0.8 });
      world.fx.ring(opp.pos.clone().setY(0.06), { color: KAISER_C, radius: 3.4, life: 0.9 });
      puff(40);
      // todos somem na névoa (cada um num lado do círculo)
      actors.forEach((actor, n) => {
        const ang = f.yaw + (n / actors.length) * Math.PI * 2;
        actor.pos.set(opp.pos.x + Math.sin(ang) * 3.6, 0, opp.pos.z + Math.cos(ang) * 3.6);
        actor.face(opp);
      });
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.5, radius: 2.6, height: 1.3, a0: -0.9, a1: 0.9, lookH: 1.2, fov: 50 }), cut: true }]);
    });
    tl.each((time) => { if (fogOn && live() && time < FOG + 1.5) puff(3); });
    actors.forEach((actor, n) => {
      const t = FOG + 0.35 + n * step;
      const ang = f.yaw + (n * 2.4); // ângulo dourado: cada um sai de um lado bem diferente
      tl.add(t, () => {
        if (!live()) return;
        actor.pos.set(opp.pos.x + Math.sin(ang) * 1.05, 0, opp.pos.z + Math.cos(ang) * 1.05);
        actor.face(opp);
        actor.play(STRIKE[linkId(actor.def)] || 'heavy_punch', 0.3);
        world.fx.burst(actor.chest(), { kind: 'smoke', count: 6, color: FOG_DARK, speed: 1.2, life: 0.5, size: 0.6, grow: 0.6 });
        world.fx.slash(opp.chestPos(), ang + Math.PI, { color: 0xd7c8ef, radius: 0.9, arc: 1.8, life: 0.2, width: 0.14, roll: (n % 2 ? 0.8 : -0.8) });
        world.audio.play('swing', { volume: 0.5, pitch: 0.9 + n * 0.04 });
        opp.anim.play('hit', { restart: true, blend: 0.03 });
      });
      tl.add(t + step * 0.9, () => {
        if (!live()) return;
        // volta para a névoa
        actor.pos.set(opp.pos.x + Math.sin(ang) * 3.6, 0, opp.pos.z + Math.cos(ang) * 3.6);
        actor.face(opp);
      });
    });
    const OPEN = FOG + 0.35 + actors.length * step + 0.15;
    tl.add(OPEN - 0.1, () => {
      if (!live() || !actors.length) return;
      tools.impact(kaiser || actors[0], shares[shares.length - 1], { sound: 'heavyPunch', color: KAISER_C });
    });
    // a névoa abre e a Força D aparece formada (o Kaiser na frente, os outros em leque atrás dele)
    tl.add(OPEN, () => {
      if (!live() || !actors.length) return;
      fogOn = false;
      for (let q = 0; q < 14; q++) {
        const ang = (q / 14) * Math.PI * 2;
        world.fx.burst(fogAt(ang, 1.2), { kind: 'smoke', count: 2, color: FOG_C, speed: 2.6, dir: new THREE.Vector3(Math.sin(ang) * 1.5, 0.1, Math.cos(ang) * 1.5), life: 0.9, size: 0.9, grow: 1.2 });
      }
      world.fx.ring(opp.pos.clone().setY(0.08), { color: FOG_C, radius: 3.8, life: 0.6 });
      const lead = kaiser || actors[0];
      const rest = actors.filter((a) => a !== lead);
      const lp = tools.around(lead, 0, 2.2);
      lead.pos.set(lp.x, 0, lp.z);
      lead.face(opp);
      lead.play('point', 0.6);
      rest.forEach((actor, n) => {
        const side = n % 2 ? 1 : -1, row = Math.floor(n / 2) + 1;
        const at = tools.around(actor, side * (0.32 + row * 0.16), 2.2 + row * 0.75);
        actor.pos.set(at.x, 0, at.z);
        actor.face(opp);
      });
      world.cameraRig.playShots([{ ...pullBack(lead, opp, { dur: 1.0, from: 3.0, to: 7.0, height: 2.3 }), cut: true }]);
    });
    const F = OPEN + 0.55;
    tl.add(END, () => { fogOn = false; world.ui && world.ui.subtitle && world.ui.subtitle(null); });
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
    const say = sayer(world);
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
        say(morato, 'Os Cinco, em formação. Agora!', 0);
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
        say(chico, 'Achei o sinal! Tá bem ali!', 1);
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
        say(xande, 'Chegou a hora de virar o jogo!', 0);
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
        say(lirio, 'Leonora, comigo! Vamos nessa!', 1);
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
        say(guizo, 'Sorria! Você tá no Registro do Outro Lado!', 0);
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
        say(dara, 'Fica quieto que eu já te examino.', 1);
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

  // BALU + RUBENS — A COÇA DOS ABUTRES (pedido do dono, 2026-11-02: "Balu fala RUBINHOO! VAMOS DAR UMA COÇA NELE!
  // avançando pra bater, Rubens diz: É RUBENS! e Rubens o ajuda a bater"; refeita em 2026-11-18 na revisão dos especiais
  // em equipe simples). Cânone usado: o Balu bobo e piadista que paga o MACHADO DEMÔNIO com o próprio sangue (o pomo de
  // pantera cravado no peito vira a maça-estrela) e a PANCADA DO URSO; o Rubens que fala por PALAVRAS-CHAVE ("Fio, cobre,
  // solto"), o SALTO FANTASMA (some na estática rosa, azul, ciano e verde e reaparece), o martelo de guerra e a fala
  // "Ainda bem que eu voltei". PROPOSTA (a ordem, os tempos e as falas novas): o machado em giro abre, a coça dos dois, o
  // "Fio" com o Salto Fantasma para trás do alvo, o "Cobre" segurando, o Balu crava o pomo no peito, o "Solto" empurra o
  // alvo para a maça de sangue e a piada do nome fecha.
  balu_rubens({ tl, S, f, opp, world, crew, guests, crewTotal, live }) {
    const END = S + 6.8;
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const balu = tools.get('balu'), rubens = tools.get('rubens');
    const hits = splitDamage(crewTotal, 10);
    const BLOOD = 0xc01828;
    const GLITCH = [0xff4ab0, 0x3a6aff, 0x4ae0ff, 0x4aff8a]; // a estática do Salto Fantasma (cânone)
    const say = sayer(world);
    const prop = propSwapper();
    // corre de `from` até `to` entre t0 e t1 (o corpo de verdade anda; a câmera acompanha)
    const run = (actor, t0, t1, fromAng, fromR, toAng, toR) => {
      let a0 = null, a1 = null;
      tl.add(t0, () => {
        if (!live()) return;
        a0 = tools.around(actor, fromAng, fromR);
        a1 = tools.around(actor, toAng, toR);
        actor.show(END - t0, a0);
        actor.pos.set(a0.x, 0, a0.z);
        actor.face(opp);
        actor.play('run', t1 - t0 + 0.1);
      });
      tl.each((time) => {
        if (!a0 || time < t0 || time > t1 || !live()) return;
        const k = smooth((time - t0) / (t1 - t0));
        actor.pos.set(a0.x + (a1.x - a0.x) * k, 0, a0.z + (a1.z - a0.z) * k);
        actor.face(opp);
      });
    };
    const blow = (actor, t, anim, dur, i, opts) => {
      if (!actor) return;
      tl.add(t, () => { if (!live()) return; actor.face(opp); actor.play(anim, dur); });
      tl.add(t + dur * 0.45, () => tools.impact(actor, hits[i], opts));
    };
    const AXE = { sound: 'axeHit', color: 0xd8d8de, slash: true };
    const HAMMER = { sound: 'heavyPunch', color: 0xe8b23a };
    const glitch = (at) => {
      for (const c of GLITCH) {
        world.fx.burst(at.clone().setY(0.9), { count: 10, color: c, speed: 2.4, up: 0.6, life: 0.5, size: 0.1 });
        world.fx.tracer(at.clone().setY(0.3 + Math.random() * 1.4), at.clone().set(at.x + (Math.random() - 0.5) * 1.4, 0.3 + Math.random() * 1.4, at.z + (Math.random() - 0.5) * 1.4), { color: c, life: 0.25, width: 0.02 });
      }
    };

    // 1. o Balu avança gritando e abre com o MACHADO EM GIRO (□ do kit): o machado sai girando, acerta e volta
    if (balu) {
      run(balu, S, S + 0.9, 0.25, 7, 0.25, 4.6);
      tl.add(S, () => {
        if (!live()) return;
        say(balu, 'RUBINHOO! VAMOS DAR UMA COÇA NELE!', 0);
        world.cameraRig.playShots([{ ...overShoulder(balu, opp, { dur: 1.5, back: 2.2, side: 0.8, height: 1.8, fov: 46 }), cut: true }]);
      });
      let axe = null;
      const hand = () => (balu.rig?.sockets?.handR ? balu.rig.sockets.handR.getWorldPosition(new THREE.Vector3()) : balu.chest());
      tl.add(S + 0.9, () => {
        if (!live()) return;
        balu.face(opp);
        balu.play('throw_r', 0.5);
        world.audio.play('knifeThrow', { volume: 0.8 });
      });
      tl.add(S + 1.02, () => {
        if (!live()) return;
        const src = balu.rig?.props?.axe;
        if (src) { axe = src.clone(true); axe.visible = true; world.scene.add(axe); prop(balu, 'axe', false); }
      });
      // ida até o peito do alvo e volta para a mão, girando
      tl.each((time) => {
        if (!axe) return;
        const k = (time - (S + 1.02)) / 0.6;
        if (k < 0 || !live()) return;
        if (k >= 1) { world.scene.remove(axe); axe = null; prop(balu, 'axe', true); return; }
        const out = k < 0.5 ? smooth(k * 2) : smooth((1 - k) * 2);
        axe.position.lerpVectors(hand(), opp.chestPos(), out);
        axe.rotation.set(0, balu.yaw + Math.PI / 2, -time * 22);
      });
      tl.add(S + 1.32, () => tools.impact(balu, hits[0], AXE));
      tl.add(END, () => { if (axe) { world.scene.remove(axe); axe = null; } });
      run(balu, S + 1.62, S + 2.0, 0.25, 4.6, 0.35, 1.5);
    }
    // 2. o Rubens chega correndo do lado, corrigindo o nome
    if (rubens) {
      run(rubens, S + 1.25, S + 1.95, -1.5, 6, -1.2, 1.5);
      tl.add(S + 1.3, () => {
        if (!live()) return;
        say(rubens, 'É RUBENS!', 1);
        world.cameraRig.playShots([{ ...twoShot(rubens, opp, { dur: 0.75, dist: 3, height: 1.5, side: -1, fov: 42 }), cut: true }]);
      });
    }
    // 3. a coça: o MARTELO do Rubens intercalado com a ombrada e a machadada do Balu
    tl.add(S + 2.0, () => {
      if (!live()) return;
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.3, radius: 3.6, height: 1.7, a0: -0.5, a1: 0.6 }), cut: true }]);
    });
    blow(rubens, S + 2.0, 'hammer_h', 0.36, 1, HAMMER);
    blow(balu, S + 2.2, 'shoulder_bash', 0.42, 2, { sound: 'heavyPunch', color: BLOOD });
    blow(rubens, S + 2.5, 'hammer_diag', 0.42, 3, HAMMER);
    blow(balu, S + 2.8, 'hammer_ground', 0.55, 4, { ...AXE, color: BLOOD });

    // 4. "FIO." — o SALTO FANTASMA: o Rubens some na estática e reaparece atrás do alvo
    if (rubens) {
      tl.add(S + 3.3, () => {
        if (!live()) return;
        say(rubens, 'Fio.', 1);
        rubens.play('vanish', 0.2);
        world.audio.play('blink');
        world.fx.distort(rubens.chest(), { color: GLITCH[2], radius: 1.8, life: 0.35 });
        glitch(rubens.pos.clone());
      });
      tl.add(S + 3.42, () => { if (live() && rubens.rig) rubens.rig.root.visible = false; });
      tl.add(S + 3.55, () => {
        if (!live()) return;
        const at = tools.around(rubens, Math.PI, 1.1); // do outro lado do alvo: atrás dele
        rubens.pos.set(at.x, 0, at.z);
        if (rubens.rig) rubens.rig.root.visible = true;
        rubens.face(opp);
        world.audio.play('signalStatic', { volume: 0.5 });
        glitch(rubens.pos.clone());
        world.fx.ring(new THREE.Vector3(rubens.pos.x, 0.06, rubens.pos.z), { color: GLITCH[1], radius: 2, life: 0.35 });
        world.cameraRig.playShots([{ ...overShoulder(rubens, opp, { dur: 0.7, back: 1.6, side: 0.6, height: 1.6, fov: 40 }), cut: true }]);
      });
      // "COBRE." — o martelo atravessado prende o alvo
      tl.add(S + 3.8, () => {
        if (!live()) return;
        say(rubens, 'Cobre.', 1);
        rubens.face(opp);
        rubens.play('hammer_up', 0.46);
        if (opp.state !== 'ko') opp.stun(2.4, 'stagger');
      });
      tl.add(S + 3.98, () => tools.impact(rubens, hits[5], HAMMER));
    }
    // 5. o Balu crava o pomo de pantera no peito: o MACHADO DEMÔNIO nasce de sangue (pago com o dele)
    if (balu) {
      tl.add(S + 4.05, () => {
        if (!live()) return;
        balu.face(opp);
        balu.play('concentrate', 0.7);
        say(balu, 'Essa aqui eu pago do meu bolso, ó!', 0);
        world.audio.play('bloodClaw', { volume: 0.9 });
        world.audio.play('heartbeat', { volume: 0.7 });
        world.cameraRig.playShots([{ ...orbit(balu, { dur: 0.75, radius: 2.4, height: 1.5, a0: 1.25, a1: 1.5, lookH: 1.3 }), cut: true }]); // de lado: de frente o alvo tapava
      });
      tl.add(S + 4.35, () => {
        if (!live()) return;
        prop(balu, 'axe', false);
        prop(balu, 'demonMace', true);
        world.fx.burst(balu.chest(), { count: 28, color: BLOOD, speed: 2.6, life: 0.5, size: 0.14 });
        world.fx.flash(balu.chest(), { color: BLOOD, size: 1.6, life: 0.2 });
        for (let i = 0; i < 4; i++) world.fx.lightning(balu.chest(), balu.chest().add(new THREE.Vector3((Math.random() - 0.5) * 1.2, 0.6 + Math.random() * 0.6, (Math.random() - 0.5) * 1.2)), { color: BLOOD, life: 0.25 });
      });
    }
    // 6. "SOLTO." — o Rubens solta o alvo de costas para o Balu, e a PANCADA DO URSO com a maça de sangue
    tl.add(S + 4.75, () => {
      if (!live()) return;
      if (rubens) { say(rubens, 'Solto.', 1); rubens.face(opp); rubens.play('shove', 0.42); }
      opp.anim.play('hit', { restart: true, blend: 0.03 });
      if (balu) {
        balu.face(opp);
        balu.play('hammer_finisher', 0.8);
        world.cameraRig.playShots([{ ...lowAngle(balu, { dur: 1.0, dist: 3, fov: 48 }), cut: true }]);
      }
    });
    tl.add(S + 5.1, () => {
      if (!live()) return;
      world.audio.play('slashFinal', { volume: 1 });
      tools.impact(balu || rubens, hits[6] + hits[7] + hits[8], { sound: 'heavyPunch', color: BLOOD });
      world.fx.ring(opp.pos.clone().setY(0.08), { color: BLOOD, radius: 3, life: 0.55 });
      world.fx.burst(opp.chestPos(), { count: 40, color: BLOOD, speed: 5, life: 0.6, size: 0.2 });
      opp.anim.play('downed', { restart: true, blend: 0.04 });
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.0, radius: 5, height: 1.4, a0: 0.4, a1: 0.8, lookH: 0.8 }), cut: true }]);
      world.cameraRig.shake(0.55, 0.35);
      world.hitstop(0.12);
    });
    // 7. o QUEIMA-ROUPA do Rubens no alvo caído e a piada do nome
    if (rubens) {
      tl.add(S + 5.55, () => {
        if (!live()) return;
        prop(rubens, 'hammer', false);
        prop(rubens, 'glock', true);
        rubens.face(opp);
        rubens.play('point', 0.6);
      });
      tl.add(S + 5.75, () => {
        if (!live()) return;
        const from = rubens.rig?.muzzle ? rubens.rig.muzzle.getWorldPosition(new THREE.Vector3()) : rubens.chest();
        world.fx.flash(from, { color: 0xffe08a, size: 0.9, life: 0.08 });
        world.fx.tracer(from, opp.chestPos(), { color: 0xffe08a, life: 0.1, width: 0.05 });
        world.audio.play('sniper', { volume: 0.6 });
        tools.impact(rubens, hits[9], { sound: 'impact', color: 0xffe08a });
      });
    }
    tl.add(S + 6.0, () => {
      if (!live()) return;
      if (balu) { say(balu, 'HAHAHA! Viu, Rubinho?', 0); world.audio.play('laugh', { volume: 0.7 }); }
      if (balu && rubens) world.cameraRig.playShots([{ ...twoShot(balu, rubens, { dur: 0.8, dist: 3.4, height: 1.6, side: 1, fov: 44 }), cut: true }]);
    });
    tl.add(S + 6.45, () => { if (live() && rubens) say(rubens, 'Rubens.', 1); });
    tl.add(END, () => { prop.undo(); world.ui && world.ui.subtitle && world.ui.subtitle(null); });
    return END;
  },

  // IRMÃOS LUKIC — O SHOW DO DIABO (refeito em 2026-11-18 na revisão dos especiais em equipe simples). Cânone usado: a
  // FOICE AMALDIÇOADA (a gadanha do Boris com a bengala do Damir encaixada: o Damir esfrega a bengala, os sigilos dourados
  // de Conhecimento acendem e dão poder à foice; "Nostis omnia perdet omnia"), as CARTAS DO DESTINO e a PERTURBAÇÃO
  // ("senta") do Damir, o Boris sereno que obedece ao irmão e sorri, e os dois EX-TRAPEZISTAS do "Show do Diabo" (o circo
  // do pai). PROPOSTA (a ordem, os tempos e as falas novas): as cartas e o "senta", os dois cortes do Boris, o encaixe da
  // bengala, o NÚMERO DO TRAPÉZIO (o Boris lança o irmão pelo cabo da foice), a chuva de cartas lá de cima, a Colheita e
  // a bengala do Damir caindo no mesmo instante, e os aplausos.
  irmaos_lukic({ tl, S, f, opp, world, crew, guests, crewTotal, live }) {
    const END = S + 6.6;
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const damir = tools.get('damir'), boris = tools.get('boris');
    const hits = splitDamage(crewTotal, 9);
    const GOLD = 0xf2c230;
    const say = sayer(world);
    const prop = propSwapper();
    const lifts = [];
    const lift = (body, t0, t1, curve) => lifts.push({ body, t0, t1, curve });
    tl.each((time) => {
      for (const l of lifts) {
        if (time < l.t0 || time > l.t1 + 0.05 || !live()) continue;
        l.body.pos.y = Math.max(0, l.curve(Math.min(1, (time - l.t0) / (l.t1 - l.t0))));
      }
    });
    const place = (actor, ang, r, t) => tl.add(t, () => {
      if (!live() || !actor) return;
      const p = tools.around(actor, ang, r);
      actor.show(END - t, p);
      actor.pos.set(p.x, 0, p.z);
      actor.face(opp);
    });
    const card = (from, i) => {
      world.fx.tracer(from, opp.chestPos().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4)), { color: i % 2 ? GOLD : 0xf4ecd8, life: 0.16, width: 0.05 });
      world.audio.play('knifeThrow', { volume: 0.55, pitch: 1.2 + i * 0.04 });
    };
    // 1. o Damir de longe: três cartas e "SENTA."
    if (damir) {
      place(damir, -0.4, 5.5, S);
      tl.add(S, () => {
        if (!live()) return;
        say(damir, 'Grandão. Segura ele pra mim.', 0);
        damir.play('throw_r', 0.5);
        world.cameraRig.playShots([{ ...overShoulder(damir, opp, { dur: 1.3, back: 2, side: 0.8, height: 1.7, fov: 46 }), cut: true }]);
      });
      for (let i = 0; i < 3; i++) tl.add(S + 0.2 + i * 0.12, () => { if (live()) card(damir.chest(), i); });
      tl.add(S + 0.5, () => tools.impact(damir, hits[0], { sound: 'impact', color: GOLD }));
      tl.add(S + 0.9, () => {
        if (!live()) return;
        damir.play('point', 0.7);
        say(damir, 'Senta.', 0);
        if (opp.state !== 'ko') opp.stun(4.6, 'forced_kneel');
        world.fx.ring(opp.chestPos(), { color: GOLD, radius: 1.4, life: 0.45, vertical: true, yaw: damir.yaw });
      });
    }
    // 2. o Boris chega com a gadanha e corta duas vezes
    if (boris) {
      place(boris, 0.5, 2.2, S + 0.8);
      tl.add(S + 0.85, () => { if (live()) world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.1, radius: 3.6, height: 1.6, a0: 0.4, a1: -0.4 }), cut: true }]); });
      tl.add(S + 1.1, () => { if (live()) { boris.face(opp); boris.play('hammer_h', 0.4); } });
      tl.add(S + 1.28, () => tools.impact(boris, hits[1], { sound: 'bladeHit', color: 0xb8bcc4, slash: true }));
      tl.add(S + 1.3, () => live() && say(boris, 'Tô aqui, irmão.', 1));
      tl.add(S + 1.5, () => { if (live()) { boris.face(opp); boris.play('hammer_diag', 0.42); } });
      tl.add(S + 1.7, () => tools.impact(boris, hits[2], { sound: 'bladeHit', color: 0xb8bcc4, slash: true }));
    }
    // 3. o Damir esfrega a bengala (os sigilos acendem) e a encaixa na gadanha: a FOICE AMALDIÇOADA
    tl.add(S + 1.95, () => {
      if (!live()) return;
      if (damir && boris) {
        const yaw = boris.yaw + Math.PI / 2;
        damir.pos.set(boris.pos.x + Math.sin(yaw) * 1.1, 0, boris.pos.z + Math.cos(yaw) * 1.1);
        damir.face(boris);
        world.fx.burst(damir.chest(), { count: 10, color: GOLD, speed: 1.2, life: 0.4, size: 0.08 });
      }
      if (damir) { damir.play('concentrate', 0.7); prop(damir, 'caneSigils', true); }
      world.cameraRig.playShots([{ ...twoShot(damir || boris, boris || damir, { dur: 0.9, dist: 3.2, height: 1.5, side: 1, fov: 42 }), cut: true }]);
    });
    tl.add(S + 2.55, () => {
      if (!live()) return;
      if (damir) prop(damir, 'cane', false);
      if (boris) {
        prop(boris, 'scythe', false);
        prop(boris, 'foice', true);
        world.fx.flash(boris.chest(), { color: GOLD, size: 1.8, life: 0.25 });
        say(boris, 'Nostis omnia perdet omnia.', 1);
      }
      world.audio.play('ritual', { volume: 0.7 });
    });
    // 4. O NÚMERO DO TRAPÉZIO: o Boris firma a foice, o Damir corre, pisa no cabo e sobe girando
    if (damir && boris) {
      tl.add(S + 3.05, () => {
        if (!live()) return;
        boris.face(damir);
        boris.play('hammer_up', 0.5);
        damir.face(boris);
        damir.play('dash_slash', 0.3);
        say(damir, 'Respeitável público...', 0);
        world.audio.play('jump');
        world.cameraRig.playShots([{ ...lowAngle(damir, { dur: 1.0, dist: 3.4, fov: 52 }), cut: true }]);
      });
      let d0 = null;
      tl.add(S + 3.3, () => {
        if (!live()) return;
        d0 = damir.pos.clone();
        damir.play('air_slash', 1.1);
        world.fx.burst(boris.chest(), { count: 12, color: GOLD, speed: 2, life: 0.4, size: 0.08 });
      });
      // sobe por cima do alvo e desce na frente dele (a bengala por cima no fim)
      tl.each((time) => {
        if (!d0 || time < S + 3.3 || time > S + 4.6 || !live()) return;
        const k = (time - (S + 3.3)) / 1.3;
        const at = opp.pos;
        damir.pos.x = d0.x + (at.x - d0.x) * smooth(k) * 0.8;
        damir.pos.z = d0.z + (at.z - d0.z) * smooth(k) * 0.8;
        damir.face(opp);
      });
      lift(damir, S + 3.3, S + 4.6, (k) => Math.sin(Math.PI * k) * 3.6);
      // 5. lá de cima, a chuva das CARTAS DO DESTINO
      for (let i = 0; i < 6; i++) tl.add(S + 3.6 + i * 0.07, () => { if (live()) card(damir.chest(), i); });
      tl.add(S + 3.65, () => { if (live()) world.cameraRig.playShots([{ ...orbit(opp, { dur: 0.75, radius: 4.4, height: 0.9, a0: -0.3, a1: 0.2, lookH: 2.4 }), cut: true }]); });
      tl.add(S + 4.0, () => tools.impact(damir, hits[3], { sound: 'impact', color: GOLD }));
    }
    // 6. a COLHEITA da Foice Amaldiçoada e a bengala do Damir caindo do alto no MESMO instante
    tl.add(S + 4.2, () => {
      if (!live() || !boris) return;
      boris.face(opp);
      boris.play('hammer_finisher', 0.8);
      world.cameraRig.playShots([{ ...lowAngle(boris, { dur: 0.8, dist: 3, fov: 46 }), cut: true }]);
    });
    tl.add(S + 4.4, () => { if (live() && damir) { damir.face(opp); damir.play('slash_v', 0.4); } });
    tl.add(S + 4.6, () => {
      if (!live()) return;
      if (damir) damir.pos.y = 0;
      const hitter = boris || damir;
      tools.impact(hitter, hits[4] + hits[5] + hits[6] + hits[7], { sound: 'slashFinal', color: GOLD, slash: true });
      world.fx.slash(opp.chestPos(), hitter.yaw, { color: GOLD, radius: 2.2, arc: 3, life: 0.45, width: 0.6, roll: 1.2 });
      if (damir) world.fx.slash(opp.chestPos(), damir.yaw + Math.PI / 2, { color: 0xf4ecd8, radius: 1.8, arc: 2.4, life: 0.4, width: 0.4, roll: -1.2 });
      for (let i = 0; i < 12; i++) world.fx.burst(opp.chestPos().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.6)), { count: 2, color: GOLD, speed: 0.6, life: 0.9, size: 0.06 });
      world.fx.ring(opp.pos.clone().setY(0.08), { color: GOLD, radius: 2.8, life: 0.5 });
      world.cameraRig.playShots([{ ...pullBack(hitter, opp, { dur: 1.0, from: 3, to: 6.5, height: 2.2 }), cut: true }]);
      world.cameraRig.shake(0.5, 0.3);
      world.hitstop(0.12);
    });
    tl.add(S + 5.0, () => tools.impact(damir || boris, hits[8], { sound: 'impact', color: GOLD })); // a escrita queima
    // 7. a reverência: os aplausos do circo que não existe mais
    tl.add(S + 5.5, () => {
      if (!live()) return;
      world.audio.play('applause', { volume: 0.6 });
      if (damir) { damir.face(opp); damir.play('point', 0.8); say(damir, 'Pode aplaudir.', 0); }
      if (damir && boris) world.cameraRig.playShots([{ ...twoShot(damir, boris, { dur: 1.0, dist: 3.6, height: 1.6, side: -1, fov: 44 }), cut: true }]);
    });
    tl.add(S + 6.05, () => { if (live() && boris) say(boris, '(sorri)', 1); });
    tl.add(END, () => { if (damir) damir.pos.y = 0; prop.undo(); world.ui && world.ui.subtitle && world.ui.subtitle(null); });
    return END;
  },

  // AMOR E SANGUE (nome do dono; pedido de 2026-11-14: "Eloy precisa ter especial em conjunto com Kemi"; refeito em
  // 2026-11-15: "alguns especiais em equipe como o da Kemi e Eloy que está bem simples"). Cânone usado:
  //   - os dois são um casal e ela é quem segura o Eloy quando a focinheira pesa (dono);
  //   - Eloy: a FOCINHEIRA (olhos brancos, aversão a toque, bate o pé no ritmo), o MOELLER METHOD (pula no alvo e soca
  //     como se tocasse bateria), o bônus de aliado PORRADA RÍTMICA (o aliado bate no ritmo de um tambor de guerra), a
  //     arte com a Escarlata (desce do alto de joelho erguido, a baqueta levantada para cravar) e o CAPSLOCK;
  //   - Kemi: VESTE AS FAIXAS e vira a FANTASMA (o rifle pinga lodo preto), o DISPARO DA MORTE (o tempo desacelera em
  //     volta dela no tiro) e a SNIPER DA MORTE (uma espiral de Morte se forma do tiro); silenciosa.
  // PROPOSTA (a ordem, os tempos e as falas): ele veste a focinheira e ela o acalma; ele se joga no alvo e o Moeller vira
  // a bateria — ela atira nas batidas fortes (a Porrada Rítmica ao contrário: o aliado no ritmo DELE); a baqueta de baixo
  // joga o alvo no ar, o tempo desacelera, a bala dela atravessa devagar deixando a espiral, e ele desce do alto cravando
  // a baqueta no MESMO instante em que a bala chega.
  eloy_kemi({ tl, S, f, opp, world, crew, guests, crewTotal, live }) {
    const END = S + 7.7; // (+1,5 s: o beijo no fim — pedido do dono, 2026-11-15)
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const eloy = tools.get('eloy'), kemi = tools.get('kemi');
    const hits = splitDamage(crewTotal, 11);
    const ROSE = 0xff5a8a;
    const DEATH = 0x2a2a30; // a espiral de Morte (cinza-chumbo) e o lodo preto do rifle da Fantasma
    const say = sayer(world);
    const prop = propSwapper();
    const muzzle = (actor) => (actor && actor.rig && actor.rig.muzzle ? actor.rig.muzzle.getWorldPosition(new THREE.Vector3()) : actor ? actor.chest() : opp.chestPos());
    const hitter = eloy || kemi;
    const BEAT = ['drumKick', 'drumSnare', 'drumKick', 'drumSnare'];
    // movimento vertical de quem está na cena (o alvo no ar, o Eloy caindo do alto): curva por tempo
    const lifts = [];
    const lift = (body, t0, t1, curve) => lifts.push({ body, t0, t1, curve });
    tl.each((time) => {
      for (const l of lifts) {
        if (time < l.t0 || time > l.t1 + 0.05 || !live()) continue;
        const k = Math.min(1, (time - l.t0) / (l.t1 - l.t0));
        l.body.pos.y = Math.max(0, l.curve(k));
        if (l.body === opp) opp.onGround = false;
      }
    });
    const tapFoot = (t) => tl.add(t, () => { if (live() && eloy) { world.audio.play('drumKick', { volume: 0.55 }); world.fx.burst(eloy.pos.clone().setY(0.05), { count: 5, color: 0x8a7a66, kind: 'smoke', speed: 0.8, life: 0.3, size: 0.25 }); } });

    // 1. A FOCINHEIRA — o Eloy veste, os olhos ficam brancos e ele bate o pé no ritmo; a Kemi veste as faixas, longe
    tl.add(S, () => {
      if (!live()) return;
      if (eloy) {
        tools.enter(eloy, -0.5, 3.6);
        prop(eloy, 'maskOn', true);
        eloy.play('taunt_roar', 0.9);
        world.audio.play('maskOn');
        say(eloy, 'NÃO ENCOSTA EM MIM!', 0);
        world.cameraRig.playShots([{ ...faceClose(eloy, { dur: 0.9, from: 2.6, to: 1.4, height: 1.6, fov: 36 }), cut: true }]);
      }
      if (kemi) {
        tools.enter(kemi, 0.9, 8.5);
        kemi.play('sniper_kneel', 6);
      }
    });
    for (let i = 0; i < 3; i++) tapFoot(S + 0.35 + i * 0.22);
    tl.add(S + 0.95, () => {
      if (!live() || !kemi) return;
      say(kemi, 'Respira, amor. No meu tempo.', 1);
      world.fx.burst(muzzle(kemi), { count: 10, color: DEATH, kind: 'smoke', speed: 0.6, up: -1.2, life: 0.6, size: 0.3 }); // o lodo pinga
      world.cameraRig.playShots([{ ...overShoulder(kemi, opp, { dur: 0.75, back: 1.4, side: 0.6, height: 1.05, fov: 34 }), cut: true }]);
    });

    // 2. SE JOGA — ele pula em cima do alvo (o começo do Moeller Method)
    tl.add(S + 1.7, () => {
      if (!live() || !eloy) return;
      eloy.face(opp);
      eloy.play('raziel_pounce', 0.45);
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 0.5, radius: 4.6, height: 1.6, a0: 1.5, a1: 1.25, lookH: 1.1 }), cut: true }]);
    });
    if (eloy) {
      let from = null, to = null;
      tl.add(S + 1.7, () => { if (!live()) return; from = eloy.pos.clone(); to = tools.around(eloy, -0.15, 0.95); });
      tl.each((time) => {
        if (!from || time < S + 1.7 || time > S + 2.05 || !live()) return;
        const k = smooth((time - (S + 1.7)) / 0.35);
        eloy.pos.set(from.x + (to.x - from.x) * k, Math.sin(Math.PI * k) * 1.1, from.z + (to.z - from.z) * k);
        eloy.face(opp);
      });
    }
    tl.add(S + 2.05, () => { if (eloy) eloy.pos.y = 0; tools.impact(hitter, hits[0], { sound: 'heavyPunch', color: ROSE }); });

    // 3. MOELLER METHOD — oito batidas aceleradas; nas fortes (4ª e 8ª) a Kemi atira junto (a Porrada Rítmica)
    const moeller = [0, 0.2, 0.38, 0.54, 0.68, 0.8, 0.91, 1.0];
    const punch = ['hook_r', 'hook_l', 'dual_r', 'dual_l', 'jab', 'hook_r', 'dual_l', 'flurry'];
    tl.add(S + 2.15, () => {
      if (!live()) return;
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.25, radius: 2.8, height: 1.4, a0: -0.7, a1: 0.5 }), cut: true }]);
      if (eloy) say(eloy, 'UM, DOIS, TRÊS, QUATRO!', 0);
    });
    moeller.forEach((dt, i) => {
      const t = S + 2.2 + dt;
      tl.add(t, () => {
        if (!live()) return;
        if (eloy) { eloy.face(opp); eloy.play(punch[i], 0.18); }
        world.audio.play(BEAT[i % 4], { volume: 0.95 });
        world.fx.ring(opp.chestPos(), { color: ROSE, radius: 0.5 + (i % 4) * 0.12, life: 0.2, vertical: true, yaw: hitter.yaw });
        const strong = i === 3 || i === 7;
        if (strong && kemi) {
          kemi.face(opp);
          const from = muzzle(kemi);
          world.fx.flash(from, { color: 0xffe08a, size: 1, life: 0.08 });
          world.fx.tracer(from, opp.chestPos(), { color: 0xd8d4dc, life: 0.16, width: 0.05 });
          world.audio.play('sniper', { volume: 0.75, pitch: 1.05 });
          world.audio.play('drumCrash', { volume: 0.6 });
        }
        if (i < 7) tools.impact(strong && kemi ? kemi : hitter, hits[1 + i], { sound: strong ? 'clawHit' : 'punch', color: ROSE });
      });
    });

    // 4. BAQUETA DE BAIXO — o alvo vai para o ar
    tl.add(S + 3.35, () => {
      if (!live()) return;
      if (eloy) { eloy.face(opp); eloy.play('uppercut', 0.4); }
      tools.impact(hitter, hits[8], { sound: 'heavyPunch', color: ROSE });
      opp.anim.play('launched', { restart: true, blend: 0.04 });
      world.cameraRig.playShots([{ ...lowAngle(opp, { dur: 0.6, dist: 3.2, fov: 50 }), cut: true }]);
    });
    // sobe rápido e, no Disparo da Morte, quase para no alto (o tempo desacelera)
    lift(opp, S + 3.4, S + 5.3, (k) => (k < 0.25 ? smooth(k / 0.25) * 2.6 : 2.6 + Math.sin((k - 0.25) / 0.75 * Math.PI) * 0.25 - Math.max(0, k - 0.9) * 8));

    // 5. DISPARO DA MORTE — o tempo desacelera em volta da Kemi; a bala sai devagar e deixa a espiral de Morte
    let bullet = null, b0 = null;
    const T0 = S + 4.0, T1 = S + 5.05; // a bala viaja devagar
    tl.add(S + 3.75, () => {
      if (!live() || !kemi) return;
      kemi.face(opp);
      kemi.play('sniper_fire', 1.4);
      say(kemi, 'Disparo da Morte.', 1);
      world.audio.play('chargeHum', { volume: 0.6, pitch: 0.5 }); // o tempo arrastado
      world.cameraRig.playShots([{ ...overShoulder(kemi, opp, { dur: 0.9, back: 0.9, side: 0.45, height: 1.0, fov: 22 }), cut: true }]);
    });
    tl.add(T0, () => {
      if (!live()) return;
      b0 = muzzle(kemi || hitter);
      world.fx.flash(b0, { color: 0xd8d4dc, size: 1.6, life: 0.2 });
      world.audio.play('sniper', { volume: 1, pitch: 0.6 });
      bullet = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xf2eef6 }));
      bullet.position.copy(b0);
      world.scene.add(bullet);
      // de lado, no meio do caminho: a câmera acompanha a bala da Kemi até o alvo no ar (a espiral fica para trás)
      const from = kemi || hitter;
      world.cameraRig.playShots([{
        dur: T1 - T0, fov: 46, cut: true,
        pos: (t) => {
          const dir = new THREE.Vector3(opp.pos.x - from.pos.x, 0, opp.pos.z - from.pos.z);
          const len = dir.length() || 1;
          dir.multiplyScalar(1 / len);
          return new THREE.Vector3(from.pos.x, 0, from.pos.z).addScaledVector(dir, len * (0.35 + t * 0.45)).addScaledVector(new THREE.Vector3(-dir.z, 0, dir.x), 3.4).setY(1.6 + t * 1.2);
        },
        look: () => (bullet ? bullet.position.clone() : from.chest()),
      }]);
    });
    tl.each((time) => {
      if (!bullet) return;
      if (time > T1 || !live()) { world.scene.remove(bullet); bullet.geometry.dispose(); bullet.material.dispose(); bullet = null; return; }
      const k = Math.max(0, (time - T0) / (T1 - T0));
      const target = opp.chestPos();
      bullet.position.lerpVectors(b0, target, k);
      // SNIPER DA MORTE: a espiral nasce do tiro e fica no ar atrás da bala
      const dir = target.clone().sub(b0).normalize();
      const side = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
      const up = dir.clone().cross(side);
      for (let j = 0; j < 2; j++) {
        const a = time * 26 + j * Math.PI;
        const r = 0.22 + 0.1 * Math.sin(time * 9);
        const p = bullet.position.clone().addScaledVector(side, Math.cos(a) * r).addScaledVector(up, Math.sin(a) * r);
        world.fx.burst(p, { count: 1, color: j ? DEATH : 0x6a6670, kind: 'smoke', speed: 0.05, life: 0.9, size: 0.16 });
      }
    });
    tl.add(END, () => { if (bullet) { world.scene.remove(bullet); bullet = null; } });

    // 6. A BAQUETA DO ALTO — ele salta e desce de joelho erguido, cravando no instante em que a bala chega
    tl.add(S + 4.25, () => {
      if (!live() || !eloy) return;
      eloy.face(opp);
      eloy.play('air_dual', 0.9);
      say(eloy, 'PRATO!', 0);
    });
    if (eloy) {
      let a0 = null;
      tl.add(S + 4.25, () => { if (live()) a0 = eloy.pos.clone(); });
      tl.each((time) => {
        if (!a0 || time < S + 4.25 || time > T1 || !live()) return;
        const k = (time - (S + 4.25)) / (T1 - (S + 4.25));
        const at = opp.pos;
        eloy.pos.set(a0.x + (at.x - a0.x) * k * 0.8, k < 0.6 ? smooth(k / 0.6) * 4.2 : 4.2 - smooth((k - 0.6) / 0.4) * (4.2 - Math.max(0.6, opp.pos.y - 0.2)), a0.z + (at.z - a0.z) * k * 0.8);
        eloy.face(opp);
      });
    }
    tl.add(T1, () => {
      if (!live()) return;
      world.audio.play('drumCrash', { volume: 1.2 });
      world.audio.play('sniper', { volume: 1 });
      tools.impact(hitter, hits[9] + hits[10], { sound: 'slashFinal', color: ROSE });
      world.fx.ring(opp.chestPos(), { color: ROSE, radius: 2.2, life: 0.45, vertical: true, yaw: hitter.yaw });
      world.fx.burst(opp.chestPos(), { count: 36, color: DEATH, kind: 'smoke', speed: 3, life: 0.8, size: 0.4 });
      // de longe e de baixo: o Eloy cravando no alto e a fumaça da espiral (o close do impacto cortaria os dois)
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.2, radius: 5, height: 1.2, a0: 0.3, a1: 0.7, lookH: 1.8 }), cut: true }]);
      world.cameraRig.shake(0.5, 0.3);
      world.hitstop(0.12);
    });
    // o alvo cai, o Eloy pousa; a última fala é dela
    lift(opp, T1, S + 5.6, (k) => (1 - k) * Math.max(0, 2.4));
    if (eloy) lift(eloy, T1, S + 5.35, (k) => (1 - smooth(k)) * 1.6);
    tl.add(S + 5.5, () => { if (live() && kemi) say(kemi, 'No tempo, amor. Eu tô aqui.', 1); });

    // 7. O BEIJO (pedido do dono): ele tira a focinheira e volta a ser o Eloy gentil; ela some no lodo da Fantasma e
    // aparece colada nele; os dois de perfil, pétalas rosa subindo
    if (eloy && kemi) {
      tl.add(S + 5.8, () => {
        if (!live()) return;
        prop(eloy, 'maskOn', false);
        world.audio.play('maskOn', { pitch: 0.8, volume: 0.7 });
        eloy.play('idle', 0.4);
        world.fx.burst(kemi.chest(), { count: 26, color: DEATH, kind: 'smoke', speed: 1.4, life: 0.55, size: 0.45 });
      });
      tl.add(S + 6.05, () => {
        if (!live()) return;
        // no corte, os dois se afastam do alvo caído (senão o corpo dele tapava o beijo): o Eloy a 5 m, do lado da Kemi
        const away = new THREE.Vector3(eloy.pos.x - opp.pos.x, 0, eloy.pos.z - opp.pos.z);
        if (away.lengthSq() < 1e-4) away.set(Math.sin(eloy.yaw), 0, Math.cos(eloy.yaw));
        away.normalize();
        const spot = findFreeSpotNear(world.arena, opp.pos.x + away.x * 5, opp.pos.z + away.z * 5, { radius: 0.6, others: [{ x: opp.pos.x, z: opp.pos.z, r: 1.2 }] }) || { x: opp.pos.x + away.x * 5, z: opp.pos.z + away.z * 5 };
        eloy.pos.set(spot.x, 0, spot.z);
        // ela do lado dele, de perfil para o alvo (o eixo do casal fica de través)
        const d = new THREE.Vector3(-away.z, 0, away.x);
        kemi.pos.set(eloy.pos.x + d.x * 0.46, 0, eloy.pos.z + d.z * 0.46);
        world.fx.burst(kemi.chest(), { count: 30, color: DEATH, kind: 'smoke', speed: 1.2, life: 0.6, size: 0.45 });
        eloy.face(kemi);
        kemi.face(eloy);
        eloy.play('kiss_lead', 1.0);
        kemi.play('kiss_follow', 1.0);
        say(eloy, 'Sempre no seu tempo.', 0);
        // de perfil, do lado do alvo: ele fica atrás da câmera, fora do quadro
        // (calculado a cada quadro com as posições reais: perpendicular ao eixo Eloy–Kemi, do lado do alvo)
        const mid = () => new THREE.Vector3((eloy.pos.x + kemi.pos.x) / 2, 1.5, (eloy.pos.z + kemi.pos.z) / 2);
        const camDir = () => {
          const ax = new THREE.Vector3(kemi.pos.x - eloy.pos.x, 0, kemi.pos.z - eloy.pos.z).normalize();
          const side = new THREE.Vector3(-ax.z, 0, ax.x);
          return side.dot(new THREE.Vector3(opp.pos.x - eloy.pos.x, 0, opp.pos.z - eloy.pos.z)) >= 0 ? side : side.negate();
        };
        world.cameraRig.playShots([{
          dur: 1.65, fov: 34, cut: true,
          pos: (t) => mid().addScaledVector(camDir(), 3.0 - t * 0.4).setY(1.5 + t * 0.05),
          look: () => mid(),
        }]);
      });
      // as pétalas sobem entre os dois enquanto o beijo dura
      for (let i = 0; i < 6; i++) {
        tl.add(S + 6.5 + i * 0.17, () => {
          if (!live()) return;
          const mid = eloy.chest().lerp(kemi.chest(), 0.5).setY(1.75);
          world.fx.burst(mid, { count: 4, color: i % 2 ? ROSE : 0xffc2d4, speed: 0.6, up: 1.2, life: 0.9, size: 0.12 });
        });
      }
    }
    tl.add(END, () => { opp.pos.y = Math.max(0, opp.pos.y); if (eloy) eloy.pos.y = 0; prop.undo(); world.ui && world.ui.subtitle && world.ui.subtitle(null); });
    return END;
  },

  // MISSA DE SANGUE (PROPOSTA; base canônica: o sino da Alvira, as cordas da Titereira de Sangue, a Dança das Lâminas da
  // Sabara e a fome do Raziel). O sino toca, a Alvira reza e as cordas de sangue prendem o alvo; a Sabara dança com
  // as lâminas em volta, o Raziel salta e morde, e a Alvira dá a absolvição com a lança do cajado
  vampiros({ tl, S, f, opp, world, crew, guests, crewTotal, live }) {
    const END = S + 5.4;
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const alvira = tools.get('alvira'), sabara = tools.get('sabara'), raziel = tools.get('raziel');
    const BLOOD = 0xa01018, CRIMSON = 0xd01c30;
    const hits = splitDamage(crewTotal, 7);
    const say = sayer(world);
    const cords = [];
    // 1. o sino e a reza; as cordas de sangue saem das mãos dela
    tl.add(S, () => {
      if (!live()) return;
      if (alvira) { tools.enter(alvira, 0, 4.2); alvira.play('concentrate', 1.4); }
      if (sabara) { tools.enter(sabara, -0.9, 3.2); sabara.play('idle_dual', 1.2); }
      if (raziel) { tools.enter(raziel, 0.9, 3.4); raziel.play('taunt_roar', 1.0); }
      world.audio.play('bellToll', { volume: 0.9 });
      say(alvira || sabara || raziel, alvira ? 'Quando o sino tocar hoje...' : 'De joelhos.', 0);
      if (alvira) world.cameraRig.playShots([{ ...faceClose(alvira, { dur: 1.2, from: 2.6, to: 1.6, height: 1.55, fov: 38 }), cut: true }]);
    });
    tl.add(S + 0.8, () => {
      if (!live()) return;
      if (alvira && alvira.rig) {
        const node = (fi, j) => (fi.rig.sockets && fi.rig.sockets[j]) || fi.rig.joints[j];
        const jp = (fi, j) => () => (node(fi, j) ? node(fi, j).getWorldPosition(new THREE.Vector3()) : fi.chest());
        for (const [a, b] of [['handR', 'handR'], ['handL', 'handL'], ['handR', 'hd']]) cords.push(world.fx.chain(jp(alvira, a), jp(opp, b), { rope: true, thick: 0.018, color: CRIMSON, glow: 0xff2030, sag: 0.18, links: 18 }));
      }
      if (opp.state !== 'ko') { opp.stun(3.2, 'stagger'); opp.notify('MARIONETE', true); }
      world.audio.play('bellToll', { volume: 0.7, pitch: 0.9 });
      tools.impact(alvira || sabara || raziel, hits[0], { sound: 'clawHit', color: BLOOD });
    });
    // 2. a Sabara dança com as lâminas em volta do alvo preso
    const blades = [[S + 1.4, 'dual_r', -1.2], [S + 1.7, 'dual_spin', 1.4], [S + 2.0, 'dual_cross', 0.2]];
    blades.forEach(([t, anim, ang], i) => tl.add(t, () => {
      if (!live() || !sabara) return;
      const at = tools.around(sabara, ang, 1.4);
      sabara.pos.set(at.x, 0, at.z);
      sabara.face(opp);
      sabara.play(anim, 0.32);
      if (i === 0) say(sabara, 'Dança comigo.', 1);
      tools.impact(sabara, hits[1 + i], { sound: 'bladeHit', color: CRIMSON, slash: true });
    }));
    // 3. o Raziel salta e morde
    tl.add(S + 2.5, () => {
      if (!live() || !raziel) return;
      const at = tools.around(raziel, Math.PI, 1.2);
      raziel.pos.set(at.x, 0, at.z);
      raziel.face(opp);
      raziel.play('raziel_pounce', 0.45);
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.2, radius: 3.4, height: 1.5, a0: 0.4, a1: -0.4 }), cut: true }]);
    });
    tl.add(S + 2.95, () => {
      if (!live() || !raziel) return;
      raziel.play('raziel_feast', 0.7);
      say(raziel, 'Sangue... finalmente.', 0);
      world.fx.burst(opp.chestPos(), { count: 26, color: BLOOD, speed: 3, life: 0.6, size: 0.16, gravity: 8 });
      tools.impact(raziel, hits[4], { sound: 'clawHit', color: BLOOD });
    });
    // 4. a absolvição: as cordas puxam o alvo e a lança do cajado atravessa
    tl.add(S + 3.8, () => {
      if (!live()) return;
      const who = alvira || sabara || raziel;
      const at = tools.around(who, 0, 2.2);
      who.pos.set(at.x, 0, at.z);
      who.face(opp);
      who.play(alvira ? 'thrust' : 'dual_cross', 0.6);
      say(who, alvira ? '...você terá sua absolvição.' : 'Acabou.', 1);
      world.cameraRig.playShots([{ ...impactClose(who, opp), cut: true }]);
      tools.impact(who, hits[5], { sound: 'bladeHit', color: CRIMSON });
    });
    tl.add(S + 4.3, () => {
      if (!live()) return;
      for (const c of cords) c.stop();
      cords.length = 0;
      world.audio.play('bellToll', { volume: 1 });
      tools.impact(alvira || sabara || raziel, hits[6], { sound: 'slashFinal', color: BLOOD });
    });
    tl.add(END, () => { for (const c of cords) c.stop(); cords.length = 0; world.ui && world.ui.subtitle && world.ui.subtitle(null); });
    return S + 4.3;
  },

  // HORA DO SHOW! (nome do dono; pedido de 2026-11-14: "um especial dos psikolera"). A PSIKOLERA em cena: o Eloy na bateria e
  // a Cindy no Fuzil Baixo, o Caio na Espada Microfone, o Franco na Guitarra Lança-Chamas e Alê na Lâmina Keytar, todos de
  // máscara (link.masks). PROPOSTA: a batida, o GRITO (Silenciar da Cindy / o Berrão do Caio, cânone) que prende o alvo, o
  // rufo do Eloy, o leque de tiros dela dançando, o SOLO DE FOGO do Franco, o TRANSE de Alê (cânone: põe em transe) e a
  // ÚLTIMA NOTA com o prato no fim. Lançado em 2026-11-18 com os cinco no elenco (vale com 3 da banda na equipe); quem
  // não está na equipe não entra, e o tempo encolhe junto
  psikolera({ tl, S, f, opp, world, crew, guests, crewTotal, live }) {
    const tools0 = { get: (id) => [f, ...crew].some((x) => linkId(x.def) === id) };
    const hasFranco = tools0.get('franco'), hasAle = tools0.get('ale');
    const FR = S + 3.55; // o solo do Franco
    const AL = FR + (hasFranco ? 0.7 : 0); // o transe de Alê
    const D = (hasFranco ? 0.7 : 0) + (hasAle ? 0.7 : 0); // quanto o fim anda para a frente
    const END = S + 5.6 + D;
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const eloy = tools.get('eloy'), cindy = tools.get('cindy'), caio = tools.get('caio'), franco = tools.get('franco'), ale = tools.get('ale');
    const hits = splitDamage(crewTotal, 10);
    const FIRE = 0xff7a2a, TRANCE = 0x9a7aff, STONE = 0xc8102a;
    const ACID = 0xc6f03a, BLOOD = 0xd01c30;
    const say = sayer(world);
    const muzzle = (actor) => (actor.rig && actor.rig.muzzle ? actor.rig.muzzle.getWorldPosition(new THREE.Vector3()) : actor.chest());
    let kit = null;
    // 1. o palco: a bateria atrás, o Eloy contando e a Cindy no baixo
    tl.add(S, () => {
      if (!live()) return;
      if (eloy) {
        tools.enter(eloy, -0.5, 5.2);
        kit = bateriaEloy();
        kit.position.set(eloy.pos.x, 0, eloy.pos.z);
        kit.rotation.y = eloy.yaw;
        world.scene.add(kit);
        eloy.play('drum_play', 1.6);
      }
      if (cindy) {
        tools.enter(cindy, 0.45, 4.2);
        cindy.play('bass_play', 1.6);
      }
      // o CAIO (2026-11-17) no meio do palco, a Espada Microfone erguida
      if (caio) {
        tools.enter(caio, 0, 3.4);
        caio.play('taunt_roar', 1.2);
      }
      // o FRANCO e Alê (2026-11-18) nas pontas do palco
      if (franco) {
        tools.enter(franco, -1.0, 4.0);
        franco.play('bass_play', 1.6);
      }
      if (ale) {
        tools.enter(ale, 1.0, 4.0);
        ale.play('bass_play', 1.6);
      }
      world.audio.play('drumCrash', { volume: 0.8 });
      say(eloy || cindy, eloy ? 'UM, DOIS, TRÊS, QUATRO!' : 'Boa noite, Monica Club! ✩☾', 0);
      if (eloy && cindy) world.cameraRig.playShots([{ ...twoShot(eloy, cindy, { dur: 1.5, dist: 4.2, height: 1.5, side: -1, fov: 46 }), cut: true }]);
    });
    for (let i = 0; i < 4; i++) {
      tl.add(S + 0.3 + i * 0.3, () => {
        if (!live()) return;
        world.audio.play(i % 2 ? 'drumSnare' : 'drumKick', { volume: 0.8 });
        world.audio.play('bassNote', { volume: 0.7, freq: [55, 55, 73, 82][i] });
        const at = cindy ? cindy.chest() : opp.chestPos();
        world.fx.ring(at, { color: ACID, radius: 0.5 + i * 0.2, life: 0.3, vertical: true, yaw: (cindy || eloy || f).yaw + Math.PI / 2 });
      });
    }
    // 2. o GRITO: a Cindy Silencia o alvo (preso no lugar)
    tl.add(S + 1.55, () => {
      if (!live()) return;
      const who = caio || cindy || eloy; // o vocalista é quem grita (o Berrão do Caio, cânone)
      if (cindy) { cindy.face(opp); cindy.play('taunt_roar', 0.6); say(cindy, 'SHHH... SILÊNCIO NA PLATEIA!', 1); }
      if (caio) { caio.face(opp); caio.play('taunt_roar', 0.6); say(caio, 'EU VOU TOMAR TUDO QUE EU POSSO TER!', 2); }
      world.audio.play('scream', { volume: 1 });
      world.fx.distort(who.chest(), { color: ACID, radius: 2.4, life: 0.4 });
      for (let i = 1; i <= 3; i++) world.fx.ring(who.chest().lerp(opp.chestPos(), i / 3), { color: ACID, radius: 0.6 + i * 0.4, life: 0.35, vertical: true, yaw: who.yaw + Math.PI / 2 });
      if (opp.state !== 'ko') { opp.stun(2.2, 'stagger'); opp.notify('SILENCIADO', true); }
      tools.impact(who, hits[0], { sound: 'impact', color: ACID });
      world.cameraRig.playShots([{ ...faceClose(who, { dur: 0.8, from: 2.4, to: 1.3, height: 1.6, fov: 36 }), cut: true }]);
    });
    // 3. o Eloy chuta a bateria e entra no rufo
    tl.add(S + 2.25, () => {
      if (!live() || !eloy) return;
      eloy.play('kick_front', 0.3);
      world.audio.play('drumCrash', { volume: 1 });
      if (kit) { world.fx.burst(kit.localToWorld(new THREE.Vector3(0, 0.6, 0.5)), { count: 24, color: 0xd8d0c0, speed: 5, life: 0.45, size: 0.2 }); world.scene.remove(kit); kit = null; }
    });
    tl.add(S + 2.5, () => {
      if (!live() || !eloy) return;
      const at = tools.around(eloy, -0.4, 1.4);
      eloy.pos.set(at.x, 0, at.z);
      eloy.face(opp);
      eloy.play('flurry', 0.5);
      say(eloy, 'NO RITMO!', 0);
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.2, radius: 3.4, height: 1.5, a0: -0.6, a1: 0.2 }), cut: true }]);
    });
    tl.add(S + 2.6, () => tools.impact(eloy, hits[1], { sound: 'punch', color: BLOOD }));
    tl.add(S + 2.78, () => tools.impact(eloy, hits[2], { sound: 'heavyPunch', color: BLOOD }));
    // 4. a Cindy dança girando e atira em leque (Pirueta no Cânion)
    for (let i = 0; i < 3; i++) {
      tl.add(S + 3.05 + i * 0.17, () => {
        if (!live() || !cindy) return;
        if (i === 0) { cindy.play('dual_spin', 0.55); world.cameraRig.playShots([{ ...overShoulder(cindy, opp, { dur: 0.9, back: 2, side: 0.8, height: 1.5, fov: 44 }), cut: true }]); }
        const from = muzzle(cindy);
        world.fx.flash(from, { color: 0xffe08a, size: 0.9, life: 0.08 });
        world.fx.tracer(from, opp.chestPos().add(new THREE.Vector3((i - 1) * 0.3, 0, 0)), { color: 0xffe08a, life: 0.14, width: 0.04 });
        world.audio.play('rifleShot', { volume: 0.7 });
        tools.impact(cindy, hits[3 + i], { sound: 'clawHit', color: BLOOD });
      });
    }
    // 4b. o SOLO DE FOGO do Franco: o jato sai do bico da Guitarra Lança-Chamas e varre o alvo
    if (franco) {
      tl.add(FR, () => {
        if (!live()) return;
        const at = tools.around(franco, -0.9, 3.2);
        franco.pos.set(at.x, 0, at.z);
        franco.face(opp);
        franco.play('shoot_bass', 0.7);
        say(franco, 'MAIS ALTO! MAIS QUENTE!', 3);
        world.audio.play('smoke', { volume: 0.9, pitch: 0.6 });
        world.cameraRig.playShots([{ ...overShoulder(franco, opp, { dur: 0.8, back: 2, side: -0.8, height: 1.5, fov: 46 }), cut: true }]);
      });
      for (let i = 0; i < 6; i++) {
        tl.add(FR + 0.1 + i * 0.08, () => {
          if (!live()) return;
          const from = muzzle(franco), to = opp.chestPos();
          for (let k = 1; k <= 4; k++) world.fx.burst(from.clone().lerp(to, k / 4), { count: 2, color: k < 2 ? 0xffe8a0 : k < 3 ? 0xffa030 : FIRE, speed: 0.8, up: 1.2, life: 0.25, size: 0.2 + k * 0.12 });
          if (i === 2) tools.impact(franco, hits[8], { sound: 'impact', color: FIRE });
        });
      }
    }
    // 4c. o TRANSE de Alê: a melodia acende a espiral, o alvo para no lugar e a lâmina corta
    if (ale) {
      tl.add(AL, () => {
        if (!live()) return;
        ale.face(opp);
        ale.play('concentrate', 0.4);
        say(ale, 'Me dá sua mão. Eu já sei como termina.', 4);
        world.audio.play('ritual', { volume: 0.8 });
        for (let i = 1; i <= 3; i++) world.fx.ring(opp.chestPos(), { color: TRANCE, radius: 0.4 + i * 0.35, life: 0.5 });
        if (opp.state !== 'ko') { opp.stun(1.4, 'stagger'); opp.notify('EM TRANSE', true); }
        world.cameraRig.playShots([{ ...faceClose(ale, { dur: 0.6, from: 2.2, to: 1.4, height: 1.6, fov: 36 }), cut: true }]);
      });
      tl.add(AL + 0.4, () => {
        if (!live()) return;
        const at = tools.around(ale, 0.6, 1.5);
        ale.pos.set(at.x, 0, at.z);
        ale.face(opp);
        ale.play('hammer_diag', 0.35);
        tools.impact(ale, hits[9], { sound: 'bladeHit', color: STONE, slash: true });
      });
    }
    // 5. a ÚLTIMA NOTA e o prato de ataque juntos
    tl.add(S + 3.85 + D, () => {
      if (!live()) return;
      if (cindy) { cindy.face(opp); cindy.play('bass_play', 0.8); say(cindy, 'Última nota, amor. ✩☾', 1); }
      if (eloy) { eloy.face(opp); eloy.play('dual_both', 0.55); }
      if (franco) { franco.face(opp); franco.play('bass_play', 0.8); }
      if (ale) { ale.face(opp); ale.play('bass_play', 0.8); }
      world.audio.play('bassNote', { volume: 1, freq: 41 });
      world.cameraRig.playShots([{ ...lowAngle(cindy || eloy, { dur: 1.3, dist: 3.2, fov: 48 }), cut: true }]);
    });
    tl.add(S + 4.15 + D, () => {
      if (!live()) return;
      const who = cindy || eloy || caio || franco || ale;
      world.audio.play('drumCrash', { volume: 1.1 });
      world.audio.play('heavyPunch', { volume: 1.1, pitch: 0.45 });
      for (let i = 1; i <= 4; i++) world.fx.ring(who.chest().lerp(opp.chestPos(), i / 4), { color: i % 2 ? ACID : 0xffb040, radius: 0.6 + i * 0.45, life: 0.35, vertical: true, yaw: who.yaw + Math.PI / 2 });
      world.fx.burst(opp.chestPos(), { count: 30, color: 0xffb040, speed: 5, up: 2, life: 0.5, size: 0.2 });
      // o que sobrou de quem não está na equipe vai todo no golpe final (o total do especial não muda)
      tools.impact(who, hits[6] + hits[7] + (eloy ? 0 : hits[1] + hits[2]) + (cindy ? 0 : hits[3] + hits[4] + hits[5]) + (franco ? 0 : hits[8]) + (ale ? 0 : hits[9]), { sound: 'slashFinal', color: ACID });
      world.cameraRig.shake(0.5, 0.35);
    });
    tl.add(END, () => { if (kit) world.scene.remove(kit); kit = null; world.ui && world.ui.subtitle && world.ui.subtitle(null); });
    return END;
  },

  // MÃE E FILHO (pedido do dono, 2026-11-09; refeito em 2026-11-18 na revisão dos especiais em equipe simples). Cânone
  // usado: o REBIRTH do Arthur (o ritual Amaldiçoar Tecnologia: o pulso verde sobe até a mão que toca a arma; o ser na
  // doze dela é PROPOSTA), a ESPINGARDA da Ivete, a dona do SUVACO SECO (a garrafa), o combate de UM BRAÇO SÓ do Arthur
  // (chutes), a tatuagem dos GAUDÉRIOS ABUTRES dos dois (no braço dela e no pescoço dele: o juramento de proteger quem
  // ama) e a fala dela "você só precisa buscar um motivo e você se agarra nele com toda força". PROPOSTA (a ordem, os
  // tempos e as falas novas): o Rebirth na doze, ela avança atirando e ele cobre de longe, a garrafada da casa, ele chega
  // nos chutes, o juramento acende nos dois e o fecho: o chute dele joga o alvo para o alto e a doze dela o pega no ar.
  mae_filho({ tl, S, f, opp, world, crew, guests, crewTotal, live }) {
    const END = S + 6.6;
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const ivete = tools.get('ivete'), arthur = tools.get('arthur');
    const GREEN = 0x3aff6a, OATH = 0xd83a2a;
    const hits = splitDamage(crewTotal, 10);
    const say = sayer(world);
    const prop = propSwapper();
    const muzzle = (actor) => (actor.rig && actor.rig.muzzle ? actor.rig.muzzle.getWorldPosition(new THREE.Vector3()) : actor.chest());
    const handles = [];
    const lifts = [];
    const lift = (body, t0, t1, curve) => lifts.push({ body, t0, t1, curve });
    tl.each((time) => {
      for (const l of lifts) {
        if (time < l.t0 || time > l.t1 + 0.05 || !live()) continue;
        l.body.pos.y = Math.max(0, l.curve(Math.min(1, (time - l.t0) / (l.t1 - l.t0))));
        if (l.body === opp) opp.onGround = false;
      }
    });
    const run = (actor, t0, t1, fromAng, fromR, toAng, toR, anim = 'run') => {
      let a0 = null, a1 = null;
      tl.add(t0, () => {
        if (!live()) return;
        a0 = fromR == null ? actor.pos.clone() : tools.around(actor, fromAng, fromR);
        a1 = tools.around(actor, toAng, toR);
        actor.show(END - t0, a0);
        actor.pos.set(a0.x, 0, a0.z);
        actor.face(opp);
        actor.play(anim, t1 - t0 + 0.1);
      });
      tl.each((time) => {
        if (!a0 || time < t0 || time > t1 || !live()) return;
        const k = smooth((time - t0) / (t1 - t0));
        actor.pos.set(a0.x + (a1.x - a0.x) * k, 0, a0.z + (a1.z - a0.z) * k);
        actor.face(opp);
      });
    };
    // a doze amaldiçoada: leque de bagos verdes saindo do cano
    const blast = (actor, i, { pellets = 6, spread = 0.5, big = false } = {}) => {
      if (!actor || !live()) return;
      const from = muzzle(actor);
      const to = opp.chestPos();
      world.fx.flash(from, { color: GREEN, size: big ? 1.8 : 1.1, life: 0.1 });
      for (let p = 0; p < pellets; p++) {
        const off = new THREE.Vector3((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread * 0.7, (Math.random() - 0.5) * spread);
        world.fx.tracer(from, to.clone().add(off), { color: p % 2 ? GREEN : 0xffe08a, life: 0.12, width: 0.035 });
      }
      world.audio.play('shotgun', { volume: big ? 1 : 0.85 });
      tools.impact(actor, hits[i], { sound: 'clawHit', color: GREEN });
    };
    // a sniper do Rebirth: o traço verde de longe
    const snipe = (i) => {
      if (!arthur || !live()) return;
      const from = muzzle(arthur);
      world.fx.flash(from, { color: GREEN, size: 1.2, life: 0.1 });
      world.fx.tracer(from, opp.chestPos(), { color: GREEN, life: 0.25, width: 0.07 });
      world.audio.play('sniper', { volume: 0.9 });
      tools.impact(arthur, hits[i], { sound: 'clawHit', color: GREEN });
    };
    const kick = (t, anim, dur, i) => {
      if (!arthur) return;
      tl.add(t, () => { if (live()) { arthur.face(opp); arthur.play(anim, dur); } });
      tl.add(t + dur * 0.45, () => tools.impact(arthur, hits[i], { sound: 'kick', color: 0xff2a3d }));
    };

    // 1. o REBIRTH na doze: o Arthur atrás dela abre os olhos verdes e os raios passam para a espingarda
    tl.add(S, () => {
      if (!live()) return;
      if (ivete) { const at = tools.enter(ivete, 0.15, 6.2); if (at) ivete.play('charge_fists', 1.3); prop(ivete, 'shotgunBack', false); prop(ivete, 'shotgun', true); }
      if (arthur) {
        tools.enter(arthur, 0.33, 6.6); // colado nela: o Rebirth sobe pela mão que TOCA a arma (wiki)
        arthur.face(ivete || opp);
        arthur.play('rebirth', 0.9);
        prop(arthur, 'eyes', true);
      }
      world.audio.play('rebirth');
      say(arthur || ivete, arthur ? 'Mãe! Pega o Rebirth!' : 'Ninguém mexe com os meus meninos!', 1);
      if (arthur && ivete) world.cameraRig.playShots([{ ...twoShot(arthur, ivete, { dur: 1.4, dist: 3.6, height: 1.6, side: 1, fov: 44 }), cut: true }]);
    });
    tl.add(S + 0.4, () => {
      if (!live() || !ivete) return;
      const src = arthur ? arthur.chest() : ivete.chest();
      for (let i = 0; i < 5; i++) world.fx.lightning(src, muzzle(ivete).add(new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3)), { color: GREEN, life: 0.3 });
      handles.push(world.fx.runes(() => muzzle(ivete), { color: GREEN, count: 6, radius: 0.45, shape: 'skull', size: 0.22 }));
      world.fx.flash(muzzle(ivete), { color: GREEN, size: 2.2, life: 0.2 });
    });
    tl.add(S + 0.85, () => {
      if (!live() || !ivete) return;
      ivete.face(opp);
      say(ivete, 'Ninguém mexe com os meus meninos!', 0);
      world.cameraRig.playShots([{ ...lowAngle(ivete, { dur: 0.6, dist: 2.6, fov: 46 }), cut: true }]);
    });

    // 2. ela RUSHA atirando; o filho ajoelha e cobre de longe
    if (ivete) {
      run(ivete, S + 1.3, S + 1.75, 0.15, 6.2, 0.1, 4.4);
      tl.add(S + 1.75, () => { if (live()) { ivete.face(opp); ivete.play('shoot_rifle', 0.4); } });
      tl.add(S + 1.85, () => blast(ivete, 0));
    }
    if (arthur) {
      tl.add(S + 1.3, () => {
        if (!live()) return;
        const at = tools.around(arthur, 0.7, 9);
        arthur.pos.set(at.x, 0, at.z);
        arthur.face(opp);
        arthur.play('sniper_kneel', 0.5);
        world.cameraRig.playShots([{ ...overShoulder(ivete || arthur, opp, { dur: 0.9, back: 2.2, side: -0.8, height: 1.7, fov: 46 }), cut: true }]);
      });
      tl.add(S + 2.1, () => {
        if (!live()) return;
        arthur.face(opp);
        arthur.play('shoot_sniper', 0.6);
        world.cameraRig.playShots([{ ...overShoulder(arthur, opp, { dur: 0.6, back: 2.6, side: 1.1, height: 1.7, fov: 34 }), cut: true }]);
      });
      tl.add(S + 2.3, () => snipe(1));
    }
    // 3. A GARRAFADA da casa: a garrafa do Suvaco Seco na cabeça do alvo
    if (ivete) {
      tl.add(S + 2.6, () => {
        if (!live()) return;
        prop(ivete, 'shotgun', false);
        prop(ivete, 'bottle', true);
        ivete.face(opp);
        ivete.play('throw_r', 0.5);
        say(ivete, 'Essa é por conta da casa!', 0);
        world.audio.play('knifeThrow', { volume: 0.8 });
        world.cameraRig.playShots([{ ...overShoulder(ivete, opp, { dur: 0.7, back: 1.8, side: 0.7, height: 1.6, fov: 42 }), cut: true }]);
      });
      tl.add(S + 2.78, () => {
        if (!live()) return;
        prop(ivete, 'bottle', false);
        const head = opp.chestPos().add(new THREE.Vector3(0, 0.45, 0));
        world.fx.tracer(ivete.chest(), head, { color: 0x7a4a14, life: 0.14, width: 0.08 });
      });
      tl.add(S + 2.92, () => {
        if (!live()) return;
        const head = opp.chestPos().add(new THREE.Vector3(0, 0.45, 0));
        world.audio.play('blockHit', { volume: 1, pitch: 1.3 }); // o vidro estoura
        world.fx.burst(head, { count: 22, color: 0x9ac8a0, speed: 4, life: 0.4, size: 0.07 });
        world.fx.burst(head, { count: 10, color: 0x7a4a14, speed: 2, life: 0.5, size: 0.12 });
        tools.impact(ivete, hits[2], { sound: 'impact', color: 0x7a4a14 });
        if (opp.state !== 'ko') opp.stun(2.6, 'stagger');
        prop(ivete, 'shotgun', true);
      });
    }
    // 4. o filho chega nos CHUTES (um braço só: a perna faz o serviço)
    if (arthur) {
      run(arthur, S + 2.75, S + 3.15, 0.7, null, -0.6, 1.4);
      tl.add(S + 3.15, () => {
        if (!live()) return;
        say(arthur, 'Deixa comigo, mãe.', 1);
        world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.0, radius: 3.4, height: 1.5, a0: -0.6, a1: 0.3 }), cut: true }]);
      });
      kick(S + 3.2, 'kick_low', 0.32, 3);
      kick(S + 3.5, 'side_kick', 0.36, 4);
      kick(S + 3.8, 'spin_kick', 0.5, 5);
    }
    // 5. O JURAMENTO DOS GAUDÉRIOS: a tatuagem acende no braço dela e no pescoço dele; o fio vermelho liga os dois
    tl.add(S + 4.3, () => {
      if (!live()) return;
      if (ivete && arthur) {
        const arm = () => (ivete.rig?.sockets?.handR ? ivete.rig.sockets.handR.getWorldPosition(new THREE.Vector3()).lerp(ivete.chest(), 0.4) : ivete.chest());
        const neck = () => arthur.chest().add(new THREE.Vector3(0, 0.32, 0));
        world.fx.flash(arm(), { color: OATH, size: 1.2, life: 0.3 });
        world.fx.flash(neck(), { color: OATH, size: 1.2, life: 0.3 });
        for (let i = 0; i < 3; i++) world.fx.lightning(arm(), neck(), { color: OATH, life: 0.45 });
        const thread = world.fx.chain(arm, neck, { rope: true, thick: 0.012, color: OATH, glow: 0x6a0808, sag: 0.1, links: 18 }); // o fio vermelho do juramento
        handles.push(thread);
        world.after(0.7, () => { if (handles.includes(thread)) { thread.stop(); handles.splice(handles.indexOf(thread), 1); } });
        world.cameraRig.playShots([{ ...twoShot(ivete, arthur, { dur: 1.0, dist: 3.4, height: 1.5, side: 1, fov: 42 }), cut: true }]);
      }
      world.audio.play('heartbeat', { volume: 0.8 });
      say(ivete || arthur, 'Busca um motivo e te agarra nele com toda força!', 0);
    });
    // 6. o fecho: o chute alto dele joga o alvo para cima e a doze dela o pega no ar, com o Rebirth junto
    const F = S + 5.2;
    if (arthur) {
      tl.add(F - 0.3, () => { if (live()) { arthur.face(opp); arthur.play('kick_front', 0.46); } });
      tl.add(F - 0.12, () => {
        if (!live()) return;
        tools.impact(arthur, hits[6], { sound: 'kick', color: 0xff2a3d });
        opp.anim.play('launched', { restart: true, blend: 0.04 });
      });
      lift(opp, F - 0.12, F + 0.9, (k) => (k < 0.4 ? smooth(k / 0.4) * 2.2 : 2.2 - smooth((k - 0.4) / 0.6) * 2.2));
    }
    if (ivete) {
      run(ivete, F - 0.55, F - 0.15, 0.1, null, 0.0, 2.2);
      tl.add(F, () => {
        if (!live()) return;
        ivete.face(opp);
        ivete.play('shoot_rifle', 0.6);
        say(ivete, 'Ninguém!', 0);
        world.cameraRig.playShots([{ ...lowAngle(ivete, { dur: 0.6, dist: 2.6, fov: 50 }), cut: true }]);
      });
      tl.add(F + 0.15, () => blast(ivete, 7, { pellets: 10, spread: 0.3, big: true }));
    }
    tl.add(F + 0.18, () => {
      if (!live()) return;
      if (arthur) for (let i = 0; i < 3; i++) world.fx.lightning(arthur.chest(), opp.chestPos(), { color: GREEN, life: 0.3 });
      tools.impact(ivete || arthur, hits[8] + hits[9], { sound: 'slashFinal', color: GREEN });
      world.fx.ring(opp.chestPos(), { color: GREEN, radius: 2.4, life: 0.5, vertical: true, yaw: (ivete || arthur).yaw });
      world.fx.burst(opp.chestPos(), { count: 34, color: GREEN, speed: 5, life: 0.45, size: 0.18 });
      world.fx.burst(opp.chestPos(), { count: 14, color: OATH, speed: 3, life: 0.5, size: 0.14 });
      world.cameraRig.playShots([{ ...pullBack(ivete || arthur, opp, { dur: 1.2, from: 3, to: 7, height: 2.2 }), cut: true }]);
      world.cameraRig.shake(0.5, 0.3);
      world.hitstop(0.12);
    });
    tl.add(F + 1.0, () => { opp.pos.y = 0; if (live() && opp.state !== 'ko') opp.anim.play('downed', { restart: true, blend: 0.05 }); });
    tl.add(F + 1.1, () => { if (live() && arthur) say(arthur, 'Valeu, mãe.', 1); });
    tl.add(END, () => {
      opp.pos.y = Math.max(0, opp.pos.y);
      for (const h of handles.splice(0)) h && h.stop && h.stop();
      prop.undo();
      world.ui && world.ui.subtitle && world.ui.subtitle(null);
    });
    return END;
  },

  // EQUIPE BRASA (wiki "Tristan Monteiro"/"Erin Parker"/"Luciano Carvalho"): o Tristan recrutou a Erin e os dois dividem
  // o gosto por explosões e fogo; o Luciano é o ex-militar da equipe (o Fernando divide o corpo com ele e não conjura).
  // PROPOSTA da cena (aprovada pelo dono, 2026-11-09): o Molotov do Tristan acende o chão, a Supernova da Erin cai DENTRO
  // do fogo e a explosão joga o alvo para cima; no ar, os olhos ficam amarelos (o Luciano assume) e a Glock 17 acerta;
  // no chão de novo, o lança-chamas do Tristan fecha com os três juntos.
  brasa({ tl, S, f, opp, world, crew, guests, crewTotal, live }) {
    const END = S + 5.4;
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const tristan = tools.get('tristan'), erin = tools.get('erin'), fernando = tools.get('fernando');
    const FIRE = 0xff7a2a, FLAME = 0xffd070, YELLOW = 0xe8b818;
    const hits = splitDamage(crewTotal, 6);
    const hex = (def) => (typeof def.color === 'string' ? def.color : '#' + new THREE.Color(def.energyColor ?? FIRE).getHexString());
    const say = (actor, text, side) => actor && world.ui && world.ui.subtitle && world.ui.subtitle({ name: actor.def.name, color: hex(actor.def), text, side });
    const hand = (actor) => (actor.rig && actor.rig.sockets && actor.rig.sockets.handR ? actor.rig.sockets.handR.getWorldPosition(new THREE.Vector3()) : actor.chest());
    const undo = [];
    const prop = (actor, name, on) => {
      const rig = actor && actor.rig;
      if (!rig || !rig.props || !rig.props[name]) return;
      undo.push([rig, name, rig.props[name].visible]);
      rig.showProp(name, on);
    };
    // arremesso em arco: uma cópia do prop sai da mão e cai no alvo girando
    const flying = new Set();
    const lob = (actor, name, t0, dur, height) => {
      let obj = null, from = null;
      tl.add(t0, () => {
        if (!live() || !actor) return;
        const src = actor.rig && actor.rig.props && actor.rig.props[name];
        from = hand(actor);
        if (src) { obj = src.clone(true); obj.visible = true; world.scene.add(obj); flying.add(obj); prop(actor, name, false); }
      });
      tl.each((time) => {
        if (!obj) return;
        const k = (time - t0) / dur;
        if (k < 0) return;
        if (k >= 1 || !live()) { world.scene.remove(obj); flying.delete(obj); obj = null; return; }
        const to = opp.pos.clone().setY(0.4);
        obj.position.lerpVectors(from, to, k);
        obj.position.y += Math.sin(Math.PI * k) * height;
        obj.rotation.set(time * 9, 0, time * 13);
      });
    };
    const lift = { t0: 0, t1: 0, on: false };
    // o alvo sobe com a explosão e volta (só o corpo na cena; o golpe final é que o arremessa de verdade)
    tl.each((time) => {
      if (!lift.on || !live()) return;
      const k = (time - lift.t0) / (lift.t1 - lift.t0);
      if (k >= 1) { opp.pos.y = 0; lift.on = false; return; }
      opp.pos.y = Math.max(0, Math.sin(Math.PI * k) * 2.4);
    });

    // 1. o MOLOTOV do Tristan: a garrafa voa em arco e o chão em volta do alvo pega fogo
    if (tristan) {
      tl.add(S, () => {
        if (!live()) return;
        tools.enter(tristan, -0.55, 5.2);
        prop(tristan, 'molotov', true);
        tristan.play('throw_r', 0.55);
        say(tristan, 'Erin! Acende a festa!', 0);
        world.cameraRig.playShots([{ ...overShoulder(tristan, opp, { dur: 1.2, back: 2.2, side: -0.8, height: 1.8, fov: 46 }), cut: true }]);
      });
      lob(tristan, 'molotov', S + 0.22, 0.55, 1.6);
      tl.add(S + 0.77, () => {
        if (!live()) return;
        const at = opp.pos.clone();
        world.audio.play('explosion', { volume: 0.7, pitch: 1.3 });
        world.fx.ring(at.clone().setY(0.06), { color: FIRE, radius: 2.4, life: 0.6 });
        world.fx.burst(at.clone().setY(0.3), { count: 30, color: FIRE, speed: 3, up: 2, life: 0.6, size: 0.26 });
        tools.impact(tristan, hits[0], { sound: 'impact', color: FIRE });
      });
      // o fogo fica queimando no chão até o fim da cena
      let tick = 0;
      tl.each((time, dt) => {
        if (time < S + 0.8 || time > END - 0.3 || !live()) return;
        tick += dt || 1 / 60;
        if (tick < 0.07) return;
        tick = 0;
        const a = Math.random() * Math.PI * 2, r = 0.4 + Math.random() * 1.6;
        world.fx.burst(new THREE.Vector3(opp.pos.x + Math.cos(a) * r, 0.15, opp.pos.z + Math.sin(a) * r), { count: 3, color: Math.random() < 0.5 ? FIRE : FLAME, speed: 0.6, up: 2.4, life: 0.55, size: 0.3 });
      });
    }
    // 2. a SUPERNOVA da Erin cai dentro do fogo: a explosão grande joga o alvo para cima
    if (erin) {
      tl.add(S + 0.95, () => {
        if (!live()) return;
        tools.enter(erin, 0.65, 5.0);
        prop(erin, 'grenade', true);
        erin.play('throw_r', 0.55);
        say(erin, 'KABOOOM!', 1);
        world.cameraRig.playShots([{ ...twoShot(erin, opp, { dur: 1.0, dist: 3.6, height: 1.6, side: 1, fov: 44 }), cut: true }]);
      });
      lob(erin, 'grenade', S + 1.17, 0.5, 1.8);
      tl.add(S + 1.67, () => {
        if (!live()) return;
        const at = opp.pos.clone();
        world.fx.flash(at.clone().setY(1), { color: FIRE, size: 4, life: 0.25 });
        world.fx.ring(at.clone().setY(0.08), { color: FIRE, radius: 3, life: 0.5 });
        world.fx.burst(at.clone().setY(0.6), { count: 44, color: 0x0c0a0e, kind: 'smoke', speed: 4, up: 1.6, life: 1.0, size: 0.75, grow: 1 });
        world.fx.burst(at.clone().setY(0.6), { count: 44, color: FIRE, speed: 9, life: 0.55, size: 0.24 });
        world.screenFlash && world.screenFlash(FIRE, 0.12);
        world.cameraRig.shake(0.45, 0.3);
        tools.impact(erin, hits[1], { sound: 'explosion', color: FIRE });
        Object.assign(lift, { t0: S + 1.67, t1: S + 3.0, on: true });
        world.cameraRig.playShots([{ ...lowAngle(opp, { dur: 1.2, dist: 4.5, fov: 54 }), cut: true }]);
      });
    }
    // 3. no ar: os olhos ficam amarelos (o Luciano assume) e a Glock 17 acerta três vezes
    if (fernando) {
      tl.add(S + 2.0, () => {
        if (!live()) return;
        tools.enter(fernando, 0.0, 4.2);
        prop(fernando, 'knife', false);
        prop(fernando, 'glock', true);
        world.fx.flash(fernando.chest().add(new THREE.Vector3(0, 0.55, 0)), { color: YELLOW, size: 0.9, life: 0.25 });
        fernando.play('point', 1.0);
        world.ui && world.ui.subtitle && world.ui.subtitle({ name: 'LUCIANO CARVALHO', color: '#e8b818', text: 'Deixa comigo, Fê.', side: 0 });
        world.cameraRig.playShots([{ ...overShoulder(fernando, opp, { dur: 1.0, back: 2.0, side: 0.7, height: 1.6, fov: 44 }), cut: true }]);
      });
      for (let i = 0; i < 3; i++) {
        tl.add(S + 2.3 + i * 0.14, () => {
          if (!live()) return;
          const from = fernando.rig && fernando.rig.muzzle ? fernando.rig.muzzle.getWorldPosition(new THREE.Vector3()) : fernando.chest();
          fernando.face(opp);
          world.fx.flash(from, { color: 0xffe08a, size: 0.6, life: 0.06 });
          world.fx.tracer(from, opp.chestPos(), { color: 0xffe08a, life: 0.1, width: 0.035 });
          world.audio.play('m4', { volume: 0.55 });
          tools.impact(fernando, hits[2 + i], { sound: 'impact', color: YELLOW });
        });
      }
    }
    // 4. o fecho: o alvo cai no fogo e o LANÇA-CHAMAS do Tristan, com a Erin e o Fernando dos lados
    const F = S + 3.9;
    tl.add(S + 3.1, () => {
      if (!live()) return;
      if (tristan) {
        const at = tools.around(tristan, -0.15, 3.2);
        tristan.pos.set(at.x, 0, at.z);
        tristan.face(opp);
        prop(tristan, 'flameTanks', true);
        prop(tristan, 'flameLance', true);
        tristan.play('point', 1.3);
        say(tristan, 'QUEIMA!', 0);
      }
      if (erin) { erin.face(opp); erin.play('dual_cross', 0.6); }
      if (fernando) { fernando.face(opp); fernando.play('point', 0.8); }
      world.cameraRig.playShots([{ ...pullBack(tristan || erin || fernando, opp, { dur: 1.3, from: 2.8, to: 6.5, height: 2.0 }), cut: true }]);
    });
    if (tristan) {
      for (let i = 0; i < 12; i++) {
        tl.add(S + 3.25 + i * 0.06, () => {
          if (!live()) return;
          const a = hand(tristan), b = opp.chestPos();
          world.fx.flash(a, { color: FLAME, size: 0.7, life: 0.06 });
          for (let k = 1; k <= 7; k++) world.fx.burst(a.clone().lerp(b, k / 7), { count: 4, color: k < 3 ? FLAME : FIRE, speed: 1.4, up: 1.2, life: 0.4, size: 0.2 + k * 0.09 });
          if (i === 0) world.audio.play('smoke', { volume: 0.8, pitch: 0.6 });
        });
      }
    }
    tl.add(F - 0.05, () => tools.impact(tristan || erin || fernando, hits[5], { sound: 'explosion', color: FIRE }));
    tl.add(END, () => {
      for (const o of flying) world.scene.remove(o);
      flying.clear();
      if (lift.on) { opp.pos.y = 0; lift.on = false; }
      for (const [rig, name, v] of undo.reverse()) rig.showProp(name, v);
      undo.length = 0;
      world.ui && world.ui.subtitle && world.ui.subtitle(null);
    });
    return F;
  },

  abutres({ tl, S, f, opp, world, crew, guests, color, crewTotal, live }) {
    const END = S + 6.3;
    const tools = choreographyTools({ f, opp, world, crew, guests, live, end: END });
    const dante = tools.get('dante'), balu = tools.get('balu'), joui = tools.get('joui'), arthur = tools.get('arthur'), carina = tools.get('carina'), rubens = tools.get('rubens');
    const actors = [dante, balu, joui, arthur, carina, rubens].filter(Boolean);
    // um pedaço a mais para o mergulho da roda (o último)
    const shares = splitDamage(crewTotal, (actors.length || 1) + 1);
    const damageOf = (actor) => shares[actors.indexOf(actor)] || 0;
    const say = sayer(world);

    if (dante) {
      tl.add(S, () => {
        if (!live()) return;
        tools.enter(dante, -1.7, 4.5);
        dante.play('taunt_roar', 0.65);
        say(dante, 'Abutres. Ao trabalho.', 0);
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
        say(balu, 'Agora o tio Balu vai mostrar serviço!', 1);
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
        say(joui, 'Agora.', 0);
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
        say(arthur, 'Vamos lá!', 1);
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
        say(carina, 'Minha vez!', 0);
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
        say(rubens, 'Ainda bem que eu voltei.', 1);
        world.cameraRig.playShots([{ ...lowAngle(rubens, { dur: 0.7, dist: 2.2, fov: 42 }), cut: true }]);
      });
      tl.add(S + 4.68, () => {
        if (!live()) return;
        world.fx.ring(opp.pos.clone().setY(0.08), { color: 0x4ae0ff, radius: 1.4, life: 0.4 });
        tools.impact(rubens, damageOf(rubens), { sound: 'heavyPunch', color: 0x4ae0ff });
      });
    }

    // A RODA DOS ABUTRES (PROPOSTA; o nome da equipe): depois do martelo do Rubens, todos cercam o alvo e GIRAM em volta
    // dele como abutres no céu (câmera do alto, a sombra roxa do Dante no chão); um grito do Balu e todos mergulham
    // juntos, cada um com o golpe próprio, e o alvo some no meio deles
    const RING0 = S + 4.95, DIVE = S + 5.85, F = S + 6.1;
    const DIVE_ANIM = { dante: 'wave_punch', balu: 'hammer_diag', joui: 'iai_slash', arthur: 'slash_finisher', carina: 'flurry', rubens: 'hammer_v' };
    const ring = { on: false, a0: 0 };
    const ringPos = (k, ang, r) => ({ x: opp.pos.x + Math.sin(ang) * r, z: opp.pos.z + Math.cos(ang) * r, k });
    tl.add(RING0, () => {
      if (!live() || !actors.length) return;
      ring.on = true;
      ring.a0 = f.yaw + Math.PI;
      actors.forEach((actor) => actor.play('run', 0.6));
      world.fx.ring(opp.pos.clone().setY(0.06), { color: 0x392d45, radius: 2.9, life: 1.0 });
      world.fx.ring(opp.pos.clone().setY(0.06), { color: 0x2a202e, radius: 2.2, life: 1.1 });
      world.audio.play('swing', { volume: 0.6, pitch: 0.7 });
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 1.0, radius: 2.2, height: 7.5, a0: 0, a1: 1.2, lookH: 0.4, fov: 50 }), cut: true }]);
    });
    tl.each((time) => {
      if (!ring.on || !live() || time > F) return;
      const n = actors.length;
      let r = 2.7, spin = (time - RING0) * 3.2;
      if (time >= DIVE) { const t = smooth(Math.min(1, (time - DIVE) / 0.2)); r = 2.7 + (0.95 - 2.7) * t; spin = (DIVE - RING0) * 3.2; }
      actors.forEach((actor, k) => {
        const p = ringPos(k, ring.a0 + spin + (k / n) * Math.PI * 2, r);
        actor.pos.set(p.x, 0, p.z);
        actor.face(opp);
      });
    });
    tl.add(DIVE - 0.25, () => {
      if (!live() || !actors.length) return;
      if (balu) say(balu, 'VAMOS DAR UMA COÇA NELE!', 1); else say(actors[0], 'Agora!', 1);
    });
    tl.add(DIVE, () => {
      if (!live() || !actors.length) return;
      actors.forEach((actor) => actor.play(DIVE_ANIM[linkId(actor.def)] || 'heavy_punch', 0.45));
      world.cameraRig.playShots([{ ...orbit(opp, { dur: 0.7, radius: 4.8, height: 2.9, a0: -0.4, a1: 0.4, lookH: 0.9, fov: 46 }), cut: true }]);
    });
    tl.add(DIVE + 0.2, () => {
      if (!live() || !actors.length) return;
      world.fx.burst(opp.chestPos(), { count: 36, color: 0x2a202e, speed: 3.4, spread: 1.6, life: 0.6, size: 0.2 });
      world.fx.ring(opp.pos.clone().setY(0.08), { color: 0xb8b3c2, radius: 1.8, life: 0.45 });
      tools.impact(actors[0], shares[shares.length - 1], { sound: 'heavyPunch', color: 0x392d45 });
    });
    tl.add(F, () => { ring.on = false; });
    tl.add(END, () => { ring.on = false; world.ui && world.ui.subtitle && world.ui.subtitle(null); });
    return F;
  },

  // EXECUÇÃO DOS MASCARADOS (pedido do dono, 2026-11-01): a Kemi (Fantasma) atira de longe, o X (Jae) surge atrás e
  // crava a faca, o ??? (Labirinto) carrega um raio de energia e solta, e o Dalmo e o Aguiar fecham juntos — o Dalmo nos
  // socos e o Aguiar cortando com o machado. O Juan (se estiver na equipe) abre a carne com o Descarnar no meio da dupla.
  mascarados({ tl, S, f, opp, world, crew, guests, color, crewTotal, live }) {
    const by = (id) => { const x = [f, ...crew].find((m) => linkId(m.def) === id); return x ? actorFor(x, f, guests) : null; };
    const kemi = by('kemi'), jae = by('jae'), lab = by('labirinto'), dalmo = by('dalmo'), aguiar = by('aguiar'), juan = by('juan');
    const cast = [kemi, jae, lab, dalmo, aguiar, juan].filter(Boolean);
    const say = sayer(world);
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
        say(kemi, 'Contrato aceito. Alvo marcado.', 0);
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
        say(jae, 'Shh. Não grita.', 1);
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
        say(lab, 'Você entrou no caminho errado.', 0);
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
        say(dalmo || aguiar || juan, dalmo ? 'Agora você vai ver por que me chamam de Colosso.' : aguiar ? 'O caçador chegou ao fim da trilha.' : 'Eu escolho o que fazer com esse poder.', 1);
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
    world.ui && world.ui.subtitle && world.ui.subtitle(null);
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
