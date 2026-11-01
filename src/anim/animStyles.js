// ESTILO POR LUTADOR (TODO "Polimento individual por estilo de combate", 2026-11-01): o mesmo golpe polido
// (anim/strikePolish.js) toca diferente conforme quem bate. O instante do golpe não muda (a janela de acerto continua
// igual); o estilo mexe só no tamanho da ANTECIPAÇÃO, no quanto o golpe PASSA DO PONTO, no tempo da VOLTA e no quanto o
// corpo AFUNDA no impacto — e na força da aterrissagem.
//   pesado    — carrega muito, afunda no impacto e volta devagar (Balu, Aguiar, Dalmo, Colosso, Lírio, Gal Sal)
//   esgrima   — quase sem preparo, golpe que estala e volta rápido à guarda (Joui, Jae, Celestine, Cristino, Juan)
//   militar   — controlado: pouco preparo e pouca sobra, volta rápida e limpa (Kaiser, Veríssimo, Arthur, Cristopher)
//   caotico   — preparo exagerado, passa muito do ponto e a cabeça entorta (Xande, Guizo, Arnaldo, Anfitrião, Erin no caos)
//   elegante  — economia de movimento e volta longa, sem pressa (Kian, Gaius, Dante, Magistrada, Nubi, Ferreiro)
import { blend } from './strikePolish.js';

export const STYLES = {
  pesado: { anti: 1.6, over: 1.3, recover: 1.15, sink: -0.06, land: 1.35 },
  esgrima: { anti: 0.55, over: 1.35, recover: 0.78, sink: 0, land: 0.75 },
  militar: { anti: 0.75, over: 0.7, recover: 0.82, sink: -0.015, land: 0.9 },
  caotico: { anti: 1.35, over: 1.6, recover: 1.0, sink: -0.02, tilt: 0.14, land: 1.1 },
  elegante: { anti: 0.65, over: 0.85, recover: 1.25, sink: 0, land: 0.7 },
};

const STYLE_OF = {
  balu: 'pesado', aguiar: 'pesado', aguiar_mutilador: 'pesado', dalmo: 'pesado', colosso: 'pesado', lirio: 'pesado', gal_sal: 'pesado',
  joui: 'esgrima', joui_shinokage: 'esgrima', jae: 'esgrima', jae_x: 'esgrima', celestine: 'esgrima', cristino: 'esgrima', cristino_desertor: 'esgrima', juan: 'esgrima',
  kaiser: 'militar', verissimo: 'militar', arthur: 'militar', cristopher: 'militar',
  xande: 'caotico', guizo: 'caotico', guizo_et: 'caotico', guizo_bombado: 'caotico', guizo_velho: 'caotico', arnaldo: 'caotico', anfitriao: 'caotico', erin_caos: 'caotico', juan_odio: 'caotico',
  kian: 'elegante', kian_calamidade: 'elegante', gaius: 'elegante', amphitruo: 'elegante', dante: 'elegante', dante_aberto: 'elegante', magistrada: 'elegante', celestine_magistrada: 'elegante', nubi: 'elegante', ferreiro: 'elegante', deus_morte: 'elegante',
};

// def.animStyle (nome) tem prioridade; senão pela tabela; sem estilo = o polimento padrão
export function styleFor(def) {
  const name = (def && (def.animStyle || STYLE_OF[def.id])) || null;
  return name ? STYLES[name] : null;
}

const ALL = ['hip', 'sp', 'hd', 'sL', 'eL', 'sR', 'eR', 'lL', 'kL', 'lR', 'kR'];
const cache = new WeakMap(); // estilo → (clipe → clipe estilizado)

export function styledClip(clip, style) {
  if (!style || !clip || !clip.polished) return clip;
  let m = cache.get(style);
  if (!m) cache.set(style, (m = new WeakMap()));
  let out = m.get(clip);
  if (out) return out;
  const keys = clip.keys;
  const hit = keys.find((key) => key.role === 'hit');
  if (!hit) return clip;
  const start = clip.guard || keys[0].pose;
  let prevT = 0;
  const nk = keys.map((key) => {
    let { t, pose } = key;
    if (key.role === 'anti') pose = blend(start, pose, style.anti, ALL, pose);
    else if (key.role === 'over') {
      pose = blend(hit.pose, pose, style.over, ALL, pose);
      if (style.tilt) { const hd = pose.hd || [0, 0, 0]; pose.hd = [hd[0], hd[1], hd[2] + style.tilt]; }
    }
    if (key.role === 'ret' || key.role === 'over') t = Math.min(0.97, hit.t + (t - hit.t) * style.recover);
    if (style.sink && (key.role === 'hit' || key.role === 'over')) pose = { ...pose, h: (pose.h ?? 0) + style.sink };
    t = Math.max(t, prevT + 0.005);
    prevT = t;
    return { ...key, t, pose };
  });
  out = { ...clip, keys: nk };
  m.set(clip, out);
  return out;
}
