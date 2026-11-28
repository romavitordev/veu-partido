// BRAN — O INQUEBRÁVEL (A Vigília). A Transformação do Bran (Barra cheia + vida baixa, segurando △) e também uma VERSÃO
// na seleção (RB/LB no cartão do Bran). Pedido do dono (2026-11-21): cada membro da Vigília tem a forma normal e a
// TRANSFORMADA, com a fantasia do Samhain.
// Visual (wiki, arte "Bran Fantasiado"): a MÁSCARA DE CRÂNIO DE CORVO de bico longo, a gola enorme de PENAS
// cinza-azuladas até a cintura e o manto longo escuro costurado — o mesmo modelo do Bran com as peças da fantasia ligadas
// (models/vigiliaProps.js → addBranInquebravelProps). Nas fantasias do Samhain, vivos e mortos ficam iguais.
// Kit (PROPOSTA): a mesma lança e o broquel, mais pesados; o Guardião vira o VOO DO CORVO, a investida (corre com a Lança da
// Vigília baixada até o adversário) e a Casca Grossa engrossa.
import base from '../bran.js';

const PLUME = 0x8aa0c0;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'bran_inquebravel',
  form: true,
  baseId: 'bran',
  name: 'BRAN — O INQUEBRÁVEL',
  model: 'bran_inquebravel',
  energyColor: PLUME,
  info: {
    ...base.info,
    style: 'A fantasia de corvo do Samhain: a lança pesa mais, ele corre com a Lança da Vigília baixada em cima do adversário',
    identity: 'O Inquebrável (até o fim do round)',
    tagline: 'Hoje à noite, ninguém passa.',
  },
  stats: { ...base.stats, maxHealth: 1600, moveSpeed: 7.3 }, // cabe a vida extra da transformação
  chargeFx: { style: 'aura', color: PLUME, smoke: 0x1a1c22 },
  // A LANÇA DA VIGÍLIA (cânone, ep. 3: "Bran perfurando vários com a Lança da Vigília"; dono, 2026-11-28): mais longa
  // que a Justiça — os golpes de lança alcançam mais e o fecho atravessa (PROPOSTA: os números)
  melee: {
    ...base.melee,
    name: 'Lança da Vigília e Broquel',
    strikes: base.melee.strikes.map((s) => ({ ...s, name: s.name === 'Justiça' ? 'Lança da Vigília' : s.name, damage: Math.round(s.damage * 1.12), range: /spear/.test(s.anim) ? s.range + 0.4 : s.range })),
  },
  // ← + □ solta o INQUEBRÁVEL (recarregando, sai a azagaia normal)
  ranged: { ...base.ranged, variants: { back: { ability: 'inquebravel' } } },
  abilities: [
    { ...byId.cravarJustica, name: 'Cravar a Lança da Vigília' },
    byId.salvaAzagaias,
    // O BARRIL EM CHAMAS (dono, 2026-11-28: "na transformação o barril está pegando fogo"): estoura numa labareda maior
    // e deixa QUEIMANDO (PROPOSTA: os números)
    {
      ...byId.barril,
      id: 'barrilChamas',
      name: 'Barril em Chamas',
      element: 'energia',
      description: 'Joga um barril PEGANDO FOGO por cima, em arco: estoura numa labareda onde o adversário está, derruba e deixa QUEIMANDO.',
      projectile: {
        ...byId.barril.projectile, name: 'Barril em Chamas', color: 0xff6a20, lit: true, element: 'energia', trail: 0xff8a30,
        explode: { radius: 3, damage: 66, knockback: 5.5, launch: true, guardCrush: 20, color: 0xff6a20, burn: { dps: 10, duration: 3 } },
      },
    },
    {
      // △ + L2 VOO DO CORVO (dono, 2026-11-28: "Bran nao pode ter teleporte como voo, pode ser uma investida com a
      // lança" e "a investida pode se chamar 'voo do corvo'"; antes era um sumiço nas penas): baixa a Lança da Vigília e corre atravessando o caminho até o
      // adversário — a ponta crava e joga para cima. PROPOSTA: os números
      id: 'investidaLanca',
      name: 'Voo do Corvo',
      input: 'carga+dodge',
      type: 'dashStrike',
      description: 'Baixa a Lança da Vigília e dispara em linha reta até o adversário: a ponta crava, quebra a defesa e joga para cima.',
      energyCost: 18,
      cooldown: 8,
      anim: 'spear_lunge',
      windup: 0.22,
      distance: 9,
      speed: 24,
      recovery: 0.4,
      range: 3.2,
      damage: 56,
      knockback: 3,
      launch: true,
      guardCrush: 24,
      hitSound: 'bladeHit',
      color: PLUME,
    },
    byId.prontidao,
    byId.seAtira,
    {
      // ← + □ INQUEBRÁVEL (o apelido do cânone, "+1d8 em testes de lesão/trauma"; dono, 2026-11-28: "o quanto bran era
      // forte e voltou depois de quase morrer … balanceado pro jogo"): por alguns segundos ele não cai — o golpe que o
      // derrubaria o levanta com 20% da vida, depois 10%, depois 5% (no máximo três vezes por round). PROPOSTA: os números
      id: 'inquebravel',
      name: 'Inquebrável',
      input: 'ranged+back',
      type: 'selfBuff',
      buffType: 'inquebravel',
      label: 'INQUEBRÁVEL',
      anim: 'cast_up',
      animTime: 0.5,
      sound: 'ritual',
      description: 'Por 8 s ele não cai: o golpe que o derrubaria o levanta com 20% da vida; de novo, 10%; de novo, 5% (no máximo três vezes por round).',
      energyCost: 30,
      cooldown: 30,
      duration: 8,
      unbreakable: [0.2, 0.1, 0.05],
      color: PLUME,
      ai: { when: 'hurt' },
    },
  ],
  awakening: null,
  passives: [
    { type: 'resistant', kinds: ['melee', 'ranged'], mult: 0.82 }, // a Casca Grossa mais grossa
    { type: 'thickSkin', knockback: 0.55, chip: 0.6, guard: 0.7 },
    { type: 'escapeDeath' },
  ],
};
