import { CLIPS, JOINTS } from './clips.js';
import { smooth } from '../core/util.js';
import { styledClip } from './animStyles.js';

// Toca clipes procedurais num rig (ver models/rig.js) com transição suave.
// Quando os modelos definitivos chegarem com animações próprias, basta
// trocar esta classe por uma que use THREE.AnimationMixer mantendo a mesma API
// (play / update / setOverride).
export class Animator {
  constructor(rig, animMap = {}, style = null) {
    this.style = style; // anim/animStyles.js: o jeito de bater do lutador
    this.rig = rig;
    this.animMap = animMap; // nome lógico → nome do clipe (por personagem)
    this.current = null;
    this.time = 0;
    this.speed = 1;
    this.duration = 1;
    this.prevPose = null;
    this.blend = 1;
    this.blendTime = 0.08;
    this.pose = emptyPose();
    this.poseFilter = null; // (pose) → pose: ajuste aplicado só na hora de mostrar (não altera o clipe)
    this.twist = 0; // giro das pernas (rad) com o tronco compensando: correr de lado ainda olhando o adversário
    this.kicks = []; // impulsos aditivos (aterrissar, frear, arrancar): somados por cima de qualquer clipe
  }

  // soma um desvio de pose que sobe rápido e volta devagar (peso de 0 a 1 a 0 em dur s): o corpo reage ao impacto sem
  // trocar o clipe, então a máquina de estados do lutador continua mandando no que toca
  kick(delta, dur = 0.24, gain = 1) {
    if (!delta || gain <= 0) return;
    // o mesmo impulso de novo (rajada de tiros) recomeça em vez de somar
    const same = this.kicks.find((kk) => kk.delta === delta);
    if (same) { same.t = Math.min(same.t, same.dur * 0.25); same.gain = Math.max(same.gain, Math.min(1.4, gain)); return; }
    if (this.kicks.length > 3) this.kicks.shift();
    this.kicks.push({ delta, dur, gain: Math.min(1.4, gain), t: 0 });
  }

  resolve(name) {
    return this.animMap[name] || name;
  }

  // duration: força a duração (usado nos golpes para casar com o hitbox)
  play(name, { duration, restart = false, blend = 0.08 } = {}) {
    const clipName = this.resolve(name);
    const clip = styledClip(CLIPS[clipName], this.style);
    if (!clip) {
      console.warn('Clipe inexistente:', clipName);
      return;
    }
    if (this.current === clip && !restart) return;
    this.prevPose = clonePose(this.pose);
    this.current = clip;
    this.currentName = clipName;
    this.time = 0;
    this.duration = duration || clip.dur;
    this.blend = blend > 0 ? 0 : 1;
    this.blendTime = blend;
  }

  get progress() {
    return Math.min(1, this.time / this.duration);
  }

  update(dt) {
    if (!this.current) return;
    this.time += dt * this.speed;
    if (this.blend < 1) this.blend = Math.min(1, this.blend + dt / this.blendTime);
    const clip = this.current;
    let t = this.time / this.duration;
    t = clip.loop ? t % 1 : Math.min(1, t);
    sample(clip, t, this.pose);
    if (this.blend < 1 && this.prevPose) mixPose(this.prevPose, this.pose, smooth(this.blend), this.pose);
    this.apply(dt);
  }

  apply(dt = 0) {
    let p = this.pose;
    if (this.kicks.length) {
      p = clonePose(p);
      for (let i = this.kicks.length - 1; i >= 0; i--) {
        const kk = this.kicks[i];
        kk.t += dt;
        const u = kk.t / kk.dur;
        if (u >= 1) { this.kicks.splice(i, 1); continue; }
        // ataque em 25% do tempo, volta suave no resto
        addPose(p, kk.delta, kk.gain * (u < 0.25 ? smooth(u / 0.25) : 1 - smooth((u - 0.25) / 0.75)));
      }
    }
    if (this.rig.applyPose) {
      // rig com esqueleto vindo do Blender
      if (p === this.pose && (this.twist || this.poseFilter)) p = clonePose(p);
      if (this.twist) applyTwist(p, this.twist);
      this.rig.applyPose(this.poseFilter ? this.poseFilter(p) : p);
      return;
    }
    const r = this.rig.joints;
    r.hips.position.y = this.rig.hipHeight + p.h;
    for (const j of JOINTS) {
      const node = r[j];
      if (!node) continue;
      const v = p[j];
      node.rotation.set(v[0], v[1], v[2]);
    }
  }
}

function emptyPose() {
  const p = { h: 0 };
  for (const j of JOINTS) p[j] = [0, 0, 0];
  return p;
}

// gira o quadril (e com ele as pernas) e devolve o giro no tronco/cabeça: o peito continua de frente
function applyTwist(p, a) {
  p.hip[1] += a;
  p.sp[1] -= a * 0.8;
  p.hd[1] -= a * 0.2;
}

function clonePose(p) {
  const o = { h: p.h };
  for (const j of JOINTS) o[j] = [...p[j]];
  return o;
}

function addPose(p, d, w) {
  if (d.h) p.h += d.h * w;
  for (const j of JOINTS) {
    const v = d[j];
    if (v) for (let i = 0; i < 3; i++) p[j][i] += v[i] * w;
  }
}

function mixPose(a, b, t, out) {
  out.h = a.h + (b.h - a.h) * t;
  for (const j of JOINTS) for (let i = 0; i < 3; i++) out[j][i] = a[j][i] + (b[j][i] - a[j][i]) * t;
}

function sample(clip, t, out) {
  const keys = clip.keys;
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[Math.min(i + 1, keys.length - 1)];
  const span = b.t - a.t;
  // clip.linear: clipes densos (importados, anim/ualClips.js) — a suavização por trecho faria o movimento "travar" a
  // cada pose; os feitos à mão (poucas poses-chave) usam a curva suave
  const u = span > 0 ? Math.min(1, Math.max(0, (t - a.t) / span)) : 1;
  const lt = clip.linear ? u : smooth(u);
  out.h = (a.pose.h || 0) + ((b.pose.h || 0) - (a.pose.h || 0)) * lt;
  for (const j of JOINTS) {
    const va = a.pose[j] || ZERO;
    const vb = b.pose[j] || ZERO;
    for (let n = 0; n < 3; n++) out[j][n] = va[n] + (vb[n] - va[n]) * lt;
  }
}
const ZERO = [0, 0, 0];
