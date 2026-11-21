// OUTRO LADO — melhorias (TODO §6 e §7).
//  TEMPORÁRIAS: escolhidas a cada nível dentro da tentativa; somem quando a tentativa acaba.
//   - DO KIT (dono, 2026-11-14: "não faz sentido esses poderes ativos e passivos, não tem ligação com a lore... deveria
//     haver com cada um dos personagens"): as cartas reforçam os golpes que o PRÓPRIO personagem já tem — cada habilidade
//     dele pelo nome, o tiro, o combo e o especial (mais dano, recarga menor, menos Sanidade). Geradas da ficha
//     (kitUpgrades), então valem para o elenco inteiro. Substituem as "ativas" automáticas (Lâminas de Sangue etc.).
//   - PASSIVAS: números simples do agente (vida, dano, defesa, Sanidade, velocidade...).
//  SINERGIAS: duas temporárias juntas ligam um efeito a mais (aparecem no HUD).
//  PERMANENTES: a árvore GLOBAL comprada com moedas na loja da Aghata, salva entre as tentativas.
// Tudo vira um objeto `mods` (computeMods) que o lutador lê em poucos pontos: dano feito e recebido (damage.js), custo,
// recarga e regeneração de Sanidade (Fighter), vida máxima, velocidade e efeitos ao causar dano / ao derrotar.
// PROPOSTA (marcada): todos os efeitos e números.

// max: quantas vezes a mesma melhoria pode ser escolhida na tentativa (o nível dela)
// kind: 'kit' | 'passive'; chest: só sai de BAÚ (nunca nas cartas de nível)
export const UPGRADES = [
  // ---------------- PASSIVAS
  { id: 'vigor', kind: 'passive', name: 'Vigor', icon: '♥', max: 5, desc: '+12% de vida máxima (e cura o que ganhou).', apply: (m) => { m.hpMult += 0.12; } },
  { id: 'furia', kind: 'passive', name: 'Fúria', icon: '✊', max: 5, desc: '+10% de dano dos golpes físicos.', apply: (m) => { m.dealt.melee += 0.1; } },
  { id: 'foco', kind: 'passive', name: 'Foco', icon: '✦', max: 5, desc: '+10% de dano das habilidades e do especial.', apply: (m) => { m.dealt.ability += 0.1; m.dealt.special += 0.1; } },
  { id: 'mira', kind: 'passive', name: 'Mira', icon: '◎', max: 5, desc: '+12% de dano dos tiros e arremessos.', apply: (m) => { m.dealt.ranged += 0.12; } },
  { id: 'couraca', kind: 'passive', name: 'Couraça', icon: '⛨', max: 5, desc: '−5% de dano recebido.', apply: (m) => { m.taken *= 0.95; } },
  { id: 'calma', kind: 'passive', name: 'Calma', icon: '☾', max: 3, desc: 'Habilidades custam 10% menos Sanidade.', apply: (m) => { m.costMult *= 0.9; } },
  { id: 'lucidez', kind: 'passive', name: 'Lucidez', icon: '◐', max: 3, desc: 'A Sanidade volta 20% mais rápido.', apply: (m) => { m.regenMult += 0.2; } },
  { id: 'sanguessuga', kind: 'passive', name: 'Sanguessuga', icon: '⚕', max: 3, desc: 'Cura 3% do dano físico que causar.', apply: (m) => { m.lifesteal += 0.03; } },
  { id: 'cacador', kind: 'passive', name: 'Caçador', icon: '✚', max: 3, desc: 'Derrotar um inimigo cura 3% da vida.', apply: (m) => { m.killHeal += 0.03; } },
  { id: 'agilidade', kind: 'passive', name: 'Agilidade', icon: '➶', max: 3, desc: '+7% de velocidade de movimento.', apply: (m) => { m.speedMult += 0.07; } },
  { id: 'espinhos', kind: 'passive', name: 'Pele de Espinhos', icon: '✷', max: 3, desc: 'Devolve 15% do dano corpo a corpo que você recebe a quem bateu (+10% por nível).', apply: (m) => { m.thorns += m.thorns ? 0.1 : 0.15; } },
  { id: 'certeiro', kind: 'passive', name: 'Golpe Certeiro', icon: '✧', max: 3, desc: '10% de chance de o golpe causar o dobro do dano (+6% por nível).', apply: (m) => { m.crit += m.critChest ? 0.06 : 0.1; m.critChest = true; } },
  { id: 'reflexos', kind: 'passive', name: 'Reflexos', icon: '↯', max: 3, desc: 'A esquiva recarrega 12% mais rápido.', apply: (m) => { m.dodgeMult *= 0.88; } },
  { id: 'frequencia', kind: 'passive', name: 'Ritmo', icon: '↻', max: 3, desc: 'Habilidades, tiro e especial recarregam 6% mais rápido.', apply: (m) => { m.cdMult *= 0.94; } },
  { id: 'ima', kind: 'passive', name: 'Ímã', icon: '⊕', max: 2, desc: 'Puxa moedas, experiência e cura de 60% mais longe.', apply: (m) => { m.magnet += 0.6; } },
  { id: 'sabedoria', kind: 'passive', name: 'Sabedoria', icon: '✎', max: 3, desc: '+10% de experiência.', apply: (m) => { m.xpMult += 0.1; } },
  // ---------------- FUSÕES (pedido do dono, 2026-11-16: "poderes desbloqueáveis... essas fusões de poderes encontrados nas
  // partidas que deveria ter uma tela separada pra todos descobertos. Assim como no Vampire Survivors"). Como a evolução
  // de arma do VS (a arma no máximo + o item pedido + um baú aberto depois, por chance): com as DUAS melhorias da receita
  // (a primeira no máximo), cada baú tem `chance` de trazer a fusão; descoberta uma vez, ela fica na tela DESCOBERTAS e
  // pode vir, bem rara (`rare`), mesmo sem a receita. Nunca sai nas cartas de nível e não ocupa vaga. PROPOSTA: todas.
  ...[
    { id: 'carnificina', name: 'Carnificina', icon: '☠', needs: [['furia', 3], ['sanguessuga', 1]], desc: '+15% de dano dos golpes físicos e cura 4% do dano físico que causar.', apply: (m) => { m.dealt.melee += 0.15; m.lifesteal += 0.04; } },
    { id: 'muralhaViva', name: 'Muralha Viva', icon: '⛫', needs: [['couraca', 3], ['vigor', 1]], desc: '−8% de dano recebido e +15% de vida máxima.', apply: (m) => { m.taken *= 0.92; m.hpMult += 0.15; } },
    { id: 'transe', name: 'Transe Ritual', icon: '✺', needs: [['foco', 3], ['calma', 1]], desc: 'Habilidades custam 15% menos Sanidade e causam +12% de dano (o especial também).', apply: (m) => { m.costMult *= 0.85; m.dealt.ability += 0.12; m.dealt.special += 0.12; } },
    { id: 'olhoMorto', name: 'Olho Morto', icon: '◉', needs: [['mira', 3], ['certeiro', 1]], desc: '+15% de dano dos tiros e arremessos e +8% de chance de crítico.', apply: (m) => { m.dealt.ranged += 0.15; m.crit += 0.08; } },
    { id: 'passoSombra', name: 'Passo de Sombra', icon: '☽', needs: [['agilidade', 3], ['reflexos', 1]], desc: '+8% de velocidade e a esquiva recarrega 15% mais rápido.', apply: (m) => { m.speedMult += 0.08; m.dodgeMult *= 0.85; } },
    { id: 'carapaca', name: 'Carapaça de Espinhos', icon: '✹', needs: [['espinhos', 3], ['couraca', 1]], desc: 'Devolve mais 25% do dano corpo a corpo que você recebe.', apply: (m) => { m.thorns += 0.25; } },
    { id: 'predador', name: 'Predador', icon: '⚔', needs: [['cacador', 3], ['agilidade', 1]], desc: 'Derrotar um inimigo cura mais 4% da vida, e você anda 5% mais rápido.', apply: (m) => { m.killHeal += 0.04; m.speedMult += 0.05; } },
    // mais 5 (pedido do dono, 2026-11-18: "mais fusões de poderes"; PROPOSTA), uma por par de passivas que ainda não tinha
    { id: 'menteDesperta', name: 'Mente Desperta', icon: '◑', needs: [['lucidez', 3], ['frequencia', 1]], desc: 'A Sanidade volta 30% mais rápido, as recargas ficam 6% menores e o Drenar Energia tira 30% menos.', apply: (m) => { m.regenMult += 0.3; m.cdMult *= 0.94; m.drainTaken *= 0.7; } },
    { id: 'fluxo', name: 'Fluxo Paranormal', icon: '⟳', needs: [['frequencia', 3], ['foco', 1]], desc: 'Habilidades, tiro e especial recarregam 10% mais rápido e as habilidades causam +8% de dano.', apply: (m) => { m.cdMult *= 0.9; m.dealt.ability += 0.08; } },
    { id: 'execucao', name: 'Execução', icon: '✠', needs: [['certeiro', 3], ['furia', 1]], desc: '+8% de chance de crítico e +10% de dano dos golpes físicos.', apply: (m) => { m.crit += 0.08; m.dealt.melee += 0.1; } },
    { id: 'banquete', name: 'Banquete de Sangue', icon: '❦', needs: [['sanguessuga', 3], ['cacador', 1]], desc: 'Cura mais 3% do dano físico que causar e derrotar um inimigo cura mais 3% da vida.', apply: (m) => { m.lifesteal += 0.03; m.killHeal += 0.03; } },
    { id: 'estudioso', name: 'Ocultista Estudioso', icon: '✐', needs: [['sabedoria', 3], ['ima', 1]], desc: '+15% de experiência e puxa moedas, experiência e cura de 50% mais longe.', apply: (m) => { m.xpMult += 0.15; m.magnet += 0.5; } },
    // mais 5 (pedido do dono, 2026-11-20: "a proxima atualização quero que foque nas fusões... quero mais variedade de
    // melhorias que posso descobrir nas fases"; PROPOSTA)
    { id: 'colosso', name: 'Colosso', icon: '⛰', needs: [['vigor', 3], ['furia', 1]], desc: '+12% de vida máxima e +12% de dano dos golpes físicos.', apply: (m) => { m.hpMult += 0.12; m.dealt.melee += 0.12; } },
    { id: 'tempestade', name: 'Tempestade de Chumbo', icon: '☄', needs: [['mira', 3], ['frequencia', 1]], desc: '+12% de dano dos tiros e arremessos e as recargas ficam 10% menores.', apply: (m) => { m.dealt.ranged += 0.12; m.cdMult *= 0.9; } },
    { id: 'vigilia', name: 'Vigília', icon: '☼', needs: [['lucidez', 3], ['vigor', 1]], desc: '+10% de vida máxima e regenera 0,3% da vida por segundo.', apply: (m) => { m.hpMult += 0.1; m.regenHp += 0.003; } },
    { id: 'fortuna', name: 'Fortuna Macabra', icon: '♠', needs: [['ima', 2], ['cacador', 1]], desc: '+30% de chance de cura dos inimigos, +25% de moedas e baús mais fartos.', apply: (m) => { m.dropMult += 0.3; m.coinMult += 0.25; m.chestLuck += 0.25; } },
    { id: 'sangueFrio', name: 'Sangue Frio', icon: '❄', needs: [['reflexos', 3], ['certeiro', 1]], desc: '+10% de chance de crítico e a esquiva recarrega 10% mais rápido.', apply: (m) => { m.crit += 0.1; m.dodgeMult *= 0.9; } },
  // A FUSÃO É GARANTIDA (2026-11-20): com a receita pronta, o PRÓXIMO baú traz (como a evolução do Vampire Survivors).
  // Antes: o 1º ingrediente no nível 5 e 30% por baú — numa fase só quase ninguém chegava (2–4% das tentativas simuladas)
  ].map((f) => ({ ...f, kind: 'fusion', chest: true, max: 1, evolve: { needs: f.needs, chance: 1, rare: 0.03 } })),
  // ---------------- ACHADOS DAS FASES (pedido do dono, 2026-11-20: "mais variedade de melhorias que posso descobrir nas
  // fases"): dois por fase, só saem dos BAÚS daquela fase (RELIC_CHANCE por baú), cada um uma vez por tentativa, sem
  // ocupar vaga; achado uma vez, fica na tela DESCOBERTAS. PROPOSTA: todos os nomes, efeitos e números.
  ...[
    { id: 'olhoFresta', phase: 'espreitador', name: 'Olho da Fresta', icon: '◔', desc: '+15% de dano nos chefes: você já sabe de onde ele olha.', apply: (m) => { m.bossDealt += 0.15; } },
    { id: 'chaveMestra', phase: 'espreitador', name: 'Chave Mestra', icon: '⚿', desc: 'Baús mais fartos e +15% de moedas.', apply: (m) => { m.chestLuck += 0.35; m.coinMult += 0.15; } },
    { id: 'tesoura', phase: 'degolificada', name: 'Tesoura da Costureira', icon: '✂', desc: 'Golpes físicos têm 15% de chance de fazer SANGRAR.', apply: (m) => { m.bleedChance += 0.15; } },
    { id: 'giz', phase: 'degolificada', name: 'Giz do Quadro-Negro', icon: '✐', desc: '+12% de dano das habilidades e +10% de experiência.', apply: (m) => { m.dealt.ability += 0.12; m.xpMult += 0.1; } },
    { id: 'frascoTinta', phase: 'tipora', name: 'Frasco de Tinta', icon: '⚱', desc: 'Habilidades e tiros deixam o alvo LENTO por 2 s.', apply: (m) => { m.slowOnHit = true; } },
    { id: 'lanternaFarol', phase: 'tipora', name: 'Lanterna do Farol', icon: '☀', desc: '+10% de velocidade e puxa moedas, experiência e cura de 40% mais longe.', apply: (m) => { m.speedMult += 0.1; m.magnet += 0.4; } },
    { id: 'chamaVigilia', phase: 'samhain', name: 'Chama da Vigília', icon: '♨', desc: 'Seus golpes têm 12% de chance de QUEIMAR o alvo.', apply: (m) => { m.burnChance += 0.12; } },
    { id: 'mascaraPalha', phase: 'samhain', name: 'Máscara de Palha', icon: '☗', desc: '−8% de dano recebido e derrotar um inimigo cura 2% da vida.', apply: (m) => { m.taken *= 0.92; m.killHeal += 0.02; } },
    { id: 'denteQuibungo', phase: 'sertao', name: 'Dente do Quibungo', icon: '⚚', desc: 'Cura 3% de TODO dano que você causar (não só o físico).', apply: (m) => { m.lifestealAll += 0.03; } },
    { id: 'mandacaru', phase: 'sertao', name: 'Espinho de Mandacaru', icon: '✶', desc: 'Devolve 20% do dano corpo a corpo que você recebe e +6% de vida máxima.', apply: (m) => { m.thorns += 0.2; m.hpMult += 0.06; } },
    { id: 'fitaTransmissao', phase: 'estrangeiro', name: 'Fita da Transmissão', icon: '▣', desc: 'A Sanidade volta 25% mais rápido e as recargas ficam 8% menores.', apply: (m) => { m.regenMult += 0.25; m.cdMult *= 0.92; } },
    { id: 'antenaTorta', phase: 'estrangeiro', name: 'Antena Torta', icon: '⌁', desc: '+6% de chance de crítico e +10% de dano dos tiros.', apply: (m) => { m.crit += 0.06; m.dealt.ranged += 0.1; } },
  ].map((r) => ({ ...r, kind: 'relic', chest: true, max: 1 })),
];

// a chance de um achado da fase sair de cada baú (um por baú). PROPOSTA
export const RELIC_CHANCE = 0.18;

// a receita da fusão está pronta (todas as `needs` no nível pedido): o baú pode trazê-la
export function evolutionReady(picks, u) {
  return !!(u.evolve && u.evolve.needs.every(([id, lv]) => countOf(picks, id) >= lv));
}

// duas melhorias juntas: o efeito extra (needs: ids que precisam estar na build)
export const SYNERGIES = [
  { id: 'ritualFurioso', name: 'Ritual Furioso', needs: ['furia', 'foco'], desc: '+6% de dano das habilidades.', apply: (m) => { m.dealt.ability += 0.06; } },
  { id: 'carneDura', name: 'Carne Dura', needs: ['couraca', 'vigor'], desc: 'Regenera 0,3% da vida por segundo fora de combo.', apply: (m) => { m.regenHp += 0.003; } },
  { id: 'sedeDeSangue', name: 'Sede de Sangue', needs: ['sanguessuga', 'furia'], desc: 'O roubo de vida sobe 50%.', apply: (m) => { m.lifesteal *= 1.5; } },
  { id: 'mente', name: 'Mente Blindada', needs: ['calma', 'lucidez'], desc: 'O Drenar Energia tira metade.', apply: (m) => { m.drainTaken *= 0.5; } },
  { id: 'esquivo', name: 'Esquivo', needs: ['reflexos', 'agilidade'], desc: '+5% de velocidade e a esquiva recarrega mais 10% rápido.', apply: (m) => { m.speedMult += 0.05; m.dodgeMult *= 0.9; } },
];

// MELHORIAS PERMANENTES (pedido do dono, 2026-11-12): UMA árvore para TODOS os personagens, comprada só com moedas e
// "um pouco cara" (save.js treeCoinCost: cost × (grau + 1)). PROPOSTA: os números.
export const TREE = [
  { id: 'vida', name: 'Vida', icon: '♥', ranks: 5, cost: 160, desc: '+4% de vida máxima por grau.', apply: (m, r) => { m.hpMult += 0.04 * r; } },
  { id: 'dano', name: 'Dano', icon: '✊', ranks: 5, cost: 200, desc: '+3% de dano por grau.', apply: (m, r) => { for (const k in m.dealt) m.dealt[k] += 0.03 * r; } },
  { id: 'defesa', name: 'Defesa', icon: '⛨', ranks: 5, cost: 200, desc: '−3% de dano recebido por grau.', apply: (m, r) => { m.taken *= 1 - 0.03 * r; } },
  { id: 'sanidade', name: 'Sanidade', icon: '✦', ranks: 5, cost: 150, desc: 'Habilidades 4% mais baratas por grau.', apply: (m, r) => { m.costMult *= 1 - 0.04 * r; } },
  { id: 'velocidade', name: 'Velocidade', icon: '➶', ranks: 3, cost: 180, desc: '+3% de velocidade de movimento por grau.', apply: (m, r) => { m.speedMult += 0.03 * r; } },
  { id: 'recuperacao', name: 'Recuperação', icon: '✚', ranks: 3, cost: 220, desc: 'Regenera 0,1% da vida por segundo por grau.', apply: (m, r) => { m.regenHp += 0.001 * r; } },
  { id: 'crescimento', name: 'Crescimento', icon: '▲', ranks: 5, cost: 120, desc: '+6% de experiência por grau.', apply: (m, r) => { m.xpMult += 0.06 * r; } },
  { id: 'sorte', name: 'Sorte', icon: '♣', ranks: 3, cost: 140, desc: '+10% de chance de os inimigos deixarem cura, por grau.', apply: (m, r) => { m.dropMult += 0.1 * r; } },
  { id: 'ganancia', name: 'Ganância', icon: '●', ranks: 5, cost: 250, desc: '+6% de moedas por grau (drops e recompensa do chefe).', apply: (m, r) => { m.coinMult += 0.06 * r; } },
  // 2026-11-13 (pedido do dono: "umas 3 melhorias novas, a mais cara uma ressurreição")
  { id: 'precisao', name: 'Precisão', icon: '✧', ranks: 3, cost: 300, desc: '+2% de chance de golpe crítico (dano dobrado) por grau.', apply: (m, r) => { m.crit += 0.02 * r; } },
  { id: 'farto', name: 'Baú Farto', icon: '▣', ranks: 3, cost: 280, desc: '+8% de chance de o baú trazer mais itens, por grau.', apply: (m, r) => { m.chestLuck += 0.08 * r; } },
  // 2026-11-14 (pedido do dono: "o mesmo pras melhorias permanentes, deveriam ter mais"): as que mexem no KIT do
  // personagem e na escolha das cartas (os ids `area` e `duplicacao` ficaram de antes: quem já comprou não perde)
  { id: 'pocoes', name: 'Poções', icon: '⚱', ranks: 3, cost: 180, desc: 'Os frascos de cura curam 10% a mais por grau.', apply: (m, r) => { m.healMult += 0.1 * r; } }, // a 20ª: fecha a grade 4 × 5 (dono, 2026-11-14)
  { id: 'lucidezP', name: 'Mente Clara', icon: '◐', ranks: 3, cost: 170, desc: 'A Sanidade volta 6% mais rápido por grau.', apply: (m, r) => { m.regenMult += 0.06 * r; } },
  { id: 'ima', name: 'Ímã', icon: '⊕', ranks: 3, cost: 150, desc: 'Puxa moedas, experiência e cura de 20% mais longe por grau.', apply: (m, r) => { m.magnet += 0.2 * r; } },
  { id: 'area', name: 'Reflexos', icon: '↯', ranks: 3, cost: 260, desc: 'A esquiva recarrega 5% mais rápido por grau.', apply: (m, r) => { m.dodgeMult *= 1 - 0.05 * r; } },
  { id: 'ritmo', name: 'Ritmo', icon: '↻', ranks: 3, cost: 260, desc: 'Habilidades, tiro e especial recarregam 3% mais rápido por grau.', apply: (m, r) => { m.cdMult *= 1 - 0.03 * r; } },
  { id: 'iniciacao', name: 'Iniciação', icon: '⚝', ranks: 1, cost: 1800, desc: 'Toda fase começa com um golpe do SEU KIT sorteado já no nível 1.', apply: (m) => { m.startKit = true; } },
  { id: 'opcoes', name: 'Mais Opções', icon: '☰', ranks: 1, cost: 2600, desc: 'Ao subir de nível aparecem 4 cartas em vez de 3.', apply: (m) => { m.choices = 4; } },
  { id: 'duplicacao', name: 'Especialista', icon: '⧉', ranks: 1, cost: 5200, desc: 'As cartas do SEU KIT valem 30% a mais.', apply: (m) => { m.kitPower += 0.3; } },
  // a ÚNICA segunda vida (dono, 2026-11-16: "segundo fôlego e ressurreição deveriam ser a mesma coisa"): o Segundo
  // Fôlego do baú saiu; ficou esta, comprada
  { id: 'ressurreicao', name: 'Ressurreição', icon: '☥', ranks: 1, cost: 26000, desc: 'Uma vez por tentativa: ao cair, você VOLTA com metade da vida e uma onda afasta os inimigos.', apply: (m) => { m.revive = true; } },
];

// o PISO da resistência (pedido do dono: "ao chegar no boss, ele ainda dá dano o suficiente pra deixar o player com medo de
// morrer"): somando tudo, o jogador nunca recebe menos que 72% do dano
export const MIN_TAKEN = 0.72;

export function baseMods() {
  return {
    hpMult: 1,
    dealt: { melee: 1, ranged: 1, ability: 1, special: 1 },
    taken: 1,
    costMult: 1,
    regenMult: 1,
    lifesteal: 0,
    killHeal: 0,
    speedMult: 1,
    regenHp: 0,
    drainTaken: 1,
    xpMult: 1,
    dropMult: 1,
    coinMult: 1,
    thorns: 0,
    crit: 0,
    chestLuck: 0,
    revive: false,
    // os ACHADOS DAS FASES (Dungeon.modsFor lê no onDealt)
    bossDealt: 0,
    lifestealAll: 0,
    bleedChance: 0,
    burnChance: 0,
    slowOnHit: false,
    // o KIT: { slot: nível } (slot = id da habilidade, 'ranged', 'melee' ou 'special') e o que cada nível vira
    kit: {},
    kitPower: 1,
    kitDmg: {},
    kitCd: {},
    kitCost: {},
    cdMult: 1,
    dodgeMult: 1,
    magnet: 1,
    startKit: false,
    choices: 3,
    healMult: 1,
  };
}

const byId = (list, id) => list.find((x) => x.id === id) || (list === UPGRADES ? KIT.get(id) : undefined);

// ---------------- O KIT DO PERSONAGEM
// os números de cada nível (PROPOSTA): dano, recarga (fração a menos) e Sanidade (fração a menos) por nível
export const KIT_STEP = {
  ability: { dmg: 0.1, cd: 0.07, cost: 0.05 },
  ranged: { dmg: 0.1, cd: 0.08, cost: 0 },
  melee: { dmg: 0.08, cd: 0, cost: 0 },
  special: { dmg: 0.1, cd: 0.06, cost: 0.05 },
};
const KIT_MAX = 5;
const KIT = new Map(); // id → carta (registrada quando a ficha é lida: kitUpgrades)
export const kitId = (charId, slot) => `kit:${charId}:${slot}`;
export const isKit = (id) => typeof id === 'string' && id.startsWith('kit:');
const kitParts = (id) => { const [, c, ...r] = id.split(':'); return { char: c, slot: r.join(':') }; };

const pctTxt = (x) => `${Math.round(x * 100)}%`;
// o texto da carta só fala do que a habilidade TEM (dono, 2026-11-21: "algumas habilidades mesmo sem ser de dano ... diz:
// -x% cooldown, +10% de dano"): sem dano, não promete dano; sem recarga ou sem custo, não fala delas
// has: { dmg, cd, cost } (o padrão é ter tudo: o tiro, o combo e o especial)
function kitDesc(t, base, has = { dmg: true, cd: true, cost: true }) {
  const S = KIT_STEP[t];
  const bits = [];
  if (S.cd && has.cd) bits.push(`recarga ${pctTxt(S.cd)} menor`);
  if (S.cost && has.cost) bits.push(`${pctTxt(S.cost)} menos Sanidade`);
  if (has.dmg) bits.push(t === 'ability' ? `+${pctTxt(S.dmg)} de dano no que acertar` : `+${pctTxt(S.dmg)} de dano`);
  return `${base} Por nível: ${bits.join(', ')}.`;
}

// a habilidade causa dano? procura um número de dano na ficha dela (o golpe, os tiros, as ondas, o sangramento...)
// (damage, blowDamage, finalDamage, dragDamage, pushDamage..., dps; não os multiplicadores como damageMult)
const isDmgKey = (k) => /amage$/.test(k) || /dps$/i.test(k);
export function dealsDamage(a, depth = 0) {
  if (!a || typeof a !== 'object' || depth > 4) return false;
  for (const [k, v] of Object.entries(a)) {
    if (isDmgKey(k) && typeof v === 'number' && v > 0) return true;
    if (v && typeof v === 'object' && !(v.isColor || v.isVector3) && dealsDamage(v, depth + 1)) return true;
  }
  return false;
}

// as cartas do kit de uma ficha de personagem (def de src/characters): uma por habilidade, o tiro (□), o combo e o especial
export function kitUpgrades(def) {
  if (!def || !def.id) return [];
  const out = [];
  const add = (slot, type, name, icon, base, has) => {
    const id = kitId(def.id, slot);
    let u = KIT.get(id);
    if (!u) {
      u = { id, kind: 'kit', slot, type, char: def.id, who: def.name, name, icon, max: KIT_MAX, desc: kitDesc(type, base, has), apply: () => {} };
      KIT.set(id, u);
    }
    out.push(u);
  };
  for (const a of def.abilities || []) {
    if (!a || !a.id || !a.name || a.hidden) continue;
    const has = { dmg: dealsDamage(a), cd: (a.cooldown || 0) > 0, cost: (a.energyCost || 0) > 0 };
    if (has.dmg || has.cd || has.cost) add(a.id, 'ability', a.name, '◆', 'Habilidade sua.', has); // sem nada a melhorar, sem carta
  }
  if (def.ranged && def.ranged.name) add('ranged', 'ranged', def.ranged.name, '➹', 'O seu ataque à distância.');
  if (def.melee && def.melee.name) add('melee', 'melee', def.melee.name, '⚔', 'O seu combo corpo a corpo.');
  if (def.special && def.special.name) add('special', 'special', def.special.name, '★', 'O seu especial.');
  return out;
}

// liga as cartas do kit escolhidas para QUEM as usa (charId): as de outro personagem (no co-op) não valem
function applyKit(m, picks, charId) {
  for (const id of picks) {
    if (!isKit(id)) continue;
    const { char, slot } = kitParts(id);
    if (char === charId) m.kit[slot] = (m.kit[slot] || 0) + 1;
  }
  for (const slot in m.kit) {
    const u = KIT.get(kitId(charId, slot));
    const S = KIT_STEP[u ? u.type : (slot === 'ranged' || slot === 'melee' || slot === 'special' ? slot : 'ability')];
    const r = Math.min(KIT_MAX, m.kit[slot]) * m.kitPower;
    m.kitDmg[slot] = 1 + S.dmg * r;
    if (S.cd) m.kitCd[slot] = Math.max(0.5, 1 - S.cd * r);
    if (S.cost) m.kitCost[slot] = Math.max(0.6, 1 - S.cost * r);
  }
}

// picks: ids escolhidos na tentativa (com repetição); tree: { vida: 2, ... }
export function activeSynergies(picks) {
  const has = new Set(picks);
  return SYNERGIES.filter((s) => s.needs.every((n) => has.has(n)));
}

// charId: o personagem que vai usar (as cartas do kit dele valem)
export function computeMods(picks = [], tree = {}, charId = null) {
  const m = baseMods();
  for (const n of TREE) if (tree[n.id]) n.apply(m, Math.min(n.ranks, tree[n.id]));
  for (const id of picks) { if (isKit(id)) continue; const u = byId(UPGRADES, id); if (u) u.apply(m); }
  for (const s of activeSynergies(picks)) s.apply(m);
  if (charId) applyKit(m, picks, charId);
  m.taken = Math.max(MIN_TAKEN, m.taken);
  m.cdMult = Math.max(0.6, m.cdMult);
  m.dodgeMult = Math.max(0.6, m.dodgeMult);
  return m;
}

export function countOf(picks, id) {
  return picks.filter((x) => x === id).length;
}

// LIMITE de habilidades diferentes por tentativa (pedido do dono, 2026-11-14: "6 e 6"): 6 golpes do KIT e 6 PASSIVAS;
// com as 6 vagas de um tipo cheias, as cartas e os baús só sobem as daquele tipo que você já tem; com tudo no máximo, o
// baú dá MOEDAS ou VIDA (você escolhe). No co-op, as vagas do kit contam por personagem
export const MAX_KIT = 6;
export const MAX_PASSIVE = 6;
export const MAX_KINDS = MAX_KIT + MAX_PASSIVE;
export const kindsOf = (picks) => new Set(picks).size;
const kindOf = (id) => (isKit(id) ? 'kit' : byId(UPGRADES, id)?.kind);
export const slotsOf = (picks, kind, char = null) => new Set(picks.filter((id) => kindOf(id) === kind && (!char || !isKit(id) || kitParts(id).char === char))).size;
const slotFree = (picks, u) => slotsOf(picks, u.kind, u.char) < (u.kind === 'kit' ? MAX_KIT : MAX_PASSIVE);
const canAdd = (picks, u) => countOf(picks, u.id) > 0 || slotFree(picks, u);

// n opções sorteadas entre as que ainda não chegaram ao máximo (rng: () => [0,1)); as do baú não entram nas cartas.
// def: a ficha de quem escolhe (as cartas do kit dele entram no sorteio). Sem nenhum golpe do kit ainda, a primeira
// carta é sempre do kit (o jogador descobre o sistema logo no nível 2)
export function rollChoices(picks, rng = Math.random, n = 3, def = null) {
  const pool = [...UPGRADES, ...kitUpgrades(def)].filter((u) => !u.chest && countOf(picks, u.id) < u.max && canAdd(picks, u));
  const out = [];
  if (def && !slotsOf(picks, 'kit', def.id)) {
    const act = pool.filter((u) => u.kind === 'kit');
    if (act.length) { const u = act[Math.floor(rng() * act.length)]; out.push(u); pool.splice(pool.indexOf(u), 1); }
  }
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
}

// o BAÚ (como no Vampire Survivors): SÓ sobe de grau melhorias que o jogador JÁ tem (dono, 2026-11-21: "baús não
// deveriam vir habilidades novas, apenas upar as que você já possui"); de novo só a FUSÃO das que você tem e o ACHADO
// da fase. Ids sem repetir, só abaixo do máximo. Devolve [] quando não há mais nada: aí o baú oferece moedas
// ou vida (Dungeon.openChest)
export function chestUpgrades(picks, rng = Math.random, n = 1, { discovered = [], phase = null } = {}) {
  const have = [...picks];
  const out = [];
  // o ACHADO DA FASE (só nos baús dela; no máximo um por baú)
  const relics = phase ? RELICS.filter((r) => r.phase === phase && !have.includes(r.id)) : [];
  if (relics.length && rng() < RELIC_CHANCE) { const r = relics[Math.floor(rng() * relics.length)]; out.push(r.id); have.push(r.id); }
  // a FUSÃO primeiro, por chance: com a receita pronta (u.evolve.chance) ou, já descoberta antes, bem rara (rare)
  for (const u of UPGRADES) {
    if (!u.evolve || countOf(have, u.id) >= u.max || out.length >= n) continue;
    const chance = evolutionReady(have, u) ? u.evolve.chance : discovered.includes(u.id) ? u.evolve.rare : 0;
    if (chance > 0 && rng() < chance) { out.push(u.id); have.push(u.id); }
  }
  while (out.length < n) {
    const owned = [...new Set(have)].filter(isKit).map((id) => KIT.get(id)).filter(Boolean);
    const pool = [...UPGRADES, ...owned].filter((u) => !u.evolve && u.kind !== 'relic' && !out.includes(u.id) && countOf(have, u.id) < u.max
      && countOf(have, u.id) > 0).map((u) => u.id);
    if (!pool.length) break;
    const id = pool[Math.floor(rng() * pool.length)];
    out.push(id);
    have.push(id);
  }
  return out;
}

// as duas recompensas quando não há mais o que subir (o jogador escolhe uma)
export function rewardChoices(coins, healFrac) {
  return [
    { id: 'reward:coins', reward: true, name: 'Moedas', icon: '●', desc: `+${coins} moedas (compram personagens).`, amount: coins },
    { id: 'reward:heal', reward: true, name: 'Vida', icon: '♥', desc: `Recupera ${Math.round(healFrac * 100)}% da vida.`, amount: healFrac },
  ];
}

// quantos itens o baú dá (pedido do dono, 2026-11-06): 1 é o comum, 2 de vez em quando, 3 é meio raro.
// luck (o baú da sala trancada, 0..1) puxa para cima. Odds: PROPOSTA
export const CHEST_ODDS = { two: 0.24, three: 0.07 };
export function chestCount(rng = Math.random, luck = 0) {
  const r = rng();
  const three = CHEST_ODDS.three * (1 + 2 * luck);
  const two = CHEST_ODDS.two * (1 + luck);
  return r < three ? 3 : r < three + two ? 2 : 1;
}

// experiência para passar do nível `lv` (1 → 2 custa 60, depois cresce)
export function xpForLevel(lv) {
  return Math.round(60 + (lv - 1) * 45);
}

// soma xp; devolve quantos níveis subiu
export function gainXp(run, amount) {
  run.xp += amount;
  let ups = 0;
  while (run.xp >= xpForLevel(run.level)) {
    run.xp -= xpForLevel(run.level);
    run.level++;
    ups++;
  }
  return ups;
}

export function getUpgrade(id) { return byId(UPGRADES, id); }
export function getTreeNode(id) { return byId(TREE, id); }

// as FUSÕES (para a tela DESCOBERTAS e o HUD)
export const FUSIONS = UPGRADES.filter((u) => u.kind === 'fusion');
export const isFusion = (id) => FUSIONS.some((f) => f.id === id);
// os ACHADOS DAS FASES (tela DESCOBERTAS)
export const RELICS = UPGRADES.filter((u) => u.kind === 'relic');
export const isRelic = (id) => RELICS.some((r) => r.id === id);
// O PROGRESSO DAS FUSÕES na tentativa (dono, 2026-11-21: "quero que mostre quais melhorias são necessárias para eu
// fazer elas na fase"): as fusões ainda não ganhas em que a build já tem ao menos um ingrediente, com o que cada
// ingrediente tem / pede e se a receita está pronta (o próximo baú traz). As mais perto de ficar prontas primeiro.
// SÓ AS JÁ DESCOBERTAS (dono, 2026-11-21: "a receita das fusões só deve mostrar das quais você já aprendeu"): `known`
// é a lista do save (profile.discovered); a fusão nunca achada continua saindo do baú, mas como surpresa.
const knownFusions = (known) => (known ? FUSIONS.filter((f) => known.includes(f.id)) : FUSIONS);
export function fusionProgress(picks, known = null) {
  return knownFusions(known).filter((f) => !picks.includes(f.id) && f.evolve.needs.some(([x]) => countOf(picks, x) > 0))
    .map((f) => {
      const parts = f.evolve.needs.map(([id, need]) => ({ id, need, have: Math.min(need, countOf(picks, id)), u: getUpgrade(id) }));
      const missing = parts.reduce((s, p) => s + (p.need - p.have), 0);
      return { f, parts, missing, ready: missing === 0 };
    })
    .sort((a, b) => a.missing - b.missing);
}

// a pista nas cartas de nível: a melhoria entra em alguma fusão que falta, e escolher `id` agora deixa uma pronta
export function fusionHint(picks, id, known = null) {
  const open = knownFusions(known).filter((f) => !picks.includes(f.id) && f.evolve.needs.some(([x]) => x === id));
  const completes = open.some((f) => !evolutionReady(picks, f) && evolutionReady([...picks, id], f));
  return { part: open.length > 0, completes };
}
