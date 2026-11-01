// MELHORIA DAS ANIMAÇÕES — 1ª leva (TODO 2.1, pedido de 2026-10-26): os golpes genéricos que quase todo o elenco usa
// eram 3 poses (guarda → golpe → guarda) e pareciam duros. Aqui cada um ganha, a partir das próprias poses:
//   ANTECIPAÇÃO — o corpo carrega antes (tronco e braços vão um pouco para o lado OPOSTO do golpe, quadril desce);
//   o GOLPE no mesmo instante de antes (a janela de acerto dos golpes continua batendo com a animação);
//   PASSAGEM (overshoot) — o golpe passa um pouco do ponto, dá o "estalo" do impacto;
//   PESO NA VOLTA — volta devagar até a guarda (segue o movimento em vez de voltar de mola).
// Cotovelos e joelhos nunca dobram ao contrário (o "passar do ponto" não estica além do reto).
const UPPER = ['hip', 'sp', 'hd', 'sL', 'eL', 'sR', 'eR'];
const ALL = ['hip', 'sp', 'hd', 'sL', 'eL', 'sR', 'eR', 'lL', 'kL', 'lR', 'kR'];

// pose = guarda + (alvo − guarda) × f, junta a junta (só nas juntas pedidas; as outras seguem a pose base)
export function blend(guard, target, f, joints, base = target) {
  const out = { ...base };
  out.h = (guard.h ?? 0) + ((target.h ?? 0) - (guard.h ?? 0)) * f;
  for (const j of joints) {
    const g = guard[j] || [0, 0, 0];
    const t = target[j] || g;
    out[j] = [0, 1, 2].map((i) => g[i] + (t[i] - g[i]) * f);
  }
  // cotovelo dobra só para um lado (x ≤ 0) e o joelho só para o outro (x ≥ 0)
  for (const j of ['eL', 'eR']) if (out[j]) out[j] = [Math.min(0, out[j][0]), out[j][1], out[j][2]];
  for (const j of ['kL', 'kR']) if (out[j]) out[j] = [Math.max(0, out[j][0]), out[j][1], out[j][2]];
  return out;
}

// finishers: golpes que fecham combo — passam mais do ponto e seguram a pose do impacto um instante antes de voltar
function role(key, r) {
  key.role = r;
  return key;
}

export function polishStrikes(CLIPS, k, GUARD, names, finishers = []) {
  for (const name of names) {
    const c = CLIPS[name];
    if (!c || c.loop || c.polished || c.linear || c.keys.length < 3) continue;
    const fin = finishers.includes(name);
    const keys = c.keys;
    const start = keys[0].pose; // a guarda, ou o preparo (os cortes de faca já começam armados)
    const end = keys[keys.length - 1].pose; // para onde o golpe volta
    const hit = keys[keys.length - 2]; // a pose do golpe (a última antes de voltar)
    const th = hit.t;
    const out = [keys[0]];
    if (keys.length === 3) {
      // sem pose de preparo: a antecipação leva o começo um pouco mais para o lado contrário do golpe, só na parte de
      // cima (as pernas ficam firmes); o quadril desce um pouco
      const anti = blend(start, hit.pose, -0.22, UPPER, start);
      anti.h = (start.h ?? GUARD.h ?? 0) - 0.035;
      out.push(role(k(th * 0.45, anti), 'anti'));
    } else {
      out.push(...keys.slice(1, -2));
    }
    out.push(role({ ...hit }, 'hit'));
    const rest = 1 - th;
    const over = blend(start, hit.pose, fin ? 1.16 : 1.1, ALL);
    out.push(role(k(th + rest * 0.16, over), 'over'));
    if (fin) out.push(role(k(th + rest * 0.34, blend(start, hit.pose, 1.12, ALL)), 'over'));
    out.push(role(k(th + rest * (fin ? 0.66 : 0.55), blend(end, hit.pose, fin ? 0.5 : 0.42, ALL)), 'ret'));
    out.push(keys[keys.length - 1]);
    CLIPS[name] = { ...c, keys: out, polished: true, guard: start };
  }
}

// os golpes genéricos (soco, gancho, chutes, joelhada, cortes de faca): usados por boa parte do elenco
export const POLISHED_STRIKES_1 = ['jab', 'cross', 'hook_l', 'hook_r', 'uppercut', 'heavy_punch', 'kick_front', 'kick_round', 'kick_low', 'spin_kick', 'knee', 'onearm_punch', 'knife_1', 'knife_2', 'knife_3'];

// 2ª leva (2026-11-01, combos e finalizadores): os golpes de combo do elenco — cortes de lâmina, machado, garras,
// socos de duas mãos, chutes próprios. Ficam de fora os que já têm 5+ poses feitas à mão (já têm a volta desenhada), os de
// pose do golpe tarde demais (> 0,7 do clipe, não sobra tempo para a passagem) e os de corrente/arco/esquiva.
export const POLISHED_STRIKES_2 = ['slash_h', 'slash_up', 'dash_slash', 'slash_v', 'thrust', 'slash_h_back', 'slash_d', 'air_slash', 'knife_final', 'air_knife', 'slash_finisher', 'side_kick', 'hammer_h', 'dual_cross', 'db_claw_l', 'db_claw_r', 'air_kick', 'wave_punch', 'sway_elbow', 'shoulder_bash', 'dual_l', 'dual_r', 'dual_both', 'dual_alt', 'stomp', 'meteor_punch', 'dash_punch', 'arn_lunge', 'sway_kick', 'shove', 'db_up', 'db_air', 'chain_sweep', 'air_dual', 'slash_rapid', 'hammer_v', 'hammer_up', 'hammer_diag', 'hammer_charge', 'hammer_air', 'ai_claw_r', 'ai_claw_l', 'ai_up', 'ai_air', 'onearm_elbow', 'iai_slash', 'headbutt', 'dm_air', 'body_blow', 'arn_spin', 'arn_open'];
// 4ª leva (2026-11-01, habilidades): arremessos e conjurações de um gesto (o lançamento/soltura é a pose do "golpe")
export const POLISHED_CASTS = ['throw_r', 'throw_l', 'point', 'breath', 'arn_emit', 'shadow_cast', 'db_throw', 'cast_up', 'ai_fling', 'arn_focus'];
export const POLISHED_STRIKES = [...POLISHED_STRIKES_1, ...POLISHED_STRIKES_2, ...POLISHED_CASTS];
// os que fecham combo (o 4º golpe ou o finalizador de cada estilo)
export const FINISHER_STRIKES = ['slash_finisher', 'knife_final', 'meteor_punch', 'shoulder_bash', 'headbutt', 'iai_slash', 'heavy_punch', 'spin_kick', 'dual_both', 'hammer_v', 'dash_punch'];
