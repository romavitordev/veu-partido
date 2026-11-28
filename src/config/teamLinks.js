// Ligações de Lore para a Batalha em Equipe (equipe de 3: líder + 2 assistências)
// Inspirado na mecânica do Naruto Storm 4 (TODO, *EQUIPE — BARRA DE EQUIPE E ESPECIAIS EM EQUIPE*).
// Cada ligação muda só a ANIMAÇÃO do Especial em Equipe (o dano é o mesmo de qualquer um); a coreografia de cada uma
// fica em combat/teamSpecials.js.
//   members  os personagens da ligação (trio ou dupla; todos precisam estar na equipe)
//   group + min  grupo: vale com `min` membros na equipe e aparecem TODOS os membros, mesmo os de fora da equipe
//   unreleased  (opcional) a ligação está pronta mas ainda não vale no jogo (espera o resto da equipe entrar no elenco)
//   priority  (opcional) desempate manual quando duas ligações valem para a mesma equipe (maior ganha)
//
// VERSÕES DO MESMO PERSONAGEM (pedido de 2026-10-26: vão existir várias versões, e especiais diferentes com membros em
// comum — nem sempre todos, às vezes outra versão dos mesmos). Cada versão nova é uma ficha com `baseId` apontando
// para o personagem (como as formas: `baseId: 'kaiser'`). Na lista de uma ligação:
//   'kaiser'             vale para QUALQUER versão do Kaiser (o id dele ou a baseId das versões)
//   'kaiser_calamidade'  vale SÓ para essa versão
// Duas versões do mesmo personagem na equipe contam como UM membro. Se mais de uma ligação valer, ganha: `priority`,
// depois grupo > trio > dupla (regra do TODO), depois a mais ESPECÍFICA (mais versões exatas), depois a que tem o líder.

export const MASCARADOS = ['dalmo', 'aguiar', 'jae', 'kemi', 'labirinto', 'juan'];
// FORÇA D (Desconjuração): Arthur, Kaiser, Joui, Dante, Erin (v4.19.1, pedido do dono) e a Beatrice (v4.19.0). Elizabeth e
// Fernando entram quando estiverem no elenco. A Equipe Abutres é a equipe de Calamidade (sem o Kaiser) — outra
// ligação. (2026-11-02, correção do dono) THIAGO e LIZ NÃO são da Força D: são da EQUIPE E (Segredo na Floresta), com o
// Arthur, o Kaiser e o Joui MAIS NOVOS. O especial da Equipe E só entra quando existirem essas versões jovens; até lá o
// Thiago e a Liz podem entrar no elenco como lutadores da Ordem, sem ligação de equipe.
export const FORCA_D = ['arthur', 'kaiser', 'joui', 'dante', 'erin', 'beatrice', 'fernando', 'tristan']; // o Fernando (e o Luciano, a outra ficha) desde 2026-11-08; o Tristan desde 2026-11-09
// ORDO CALAMITAS (Calamidade, 67 d.C.): no especial em equipe só entram os que tiveram JOGADORES nos episódios (Celestine,
// Gaius, Amalia, Faustus, Marius e Remus) e os dois líderes, o Veritus e o Nero (pedido do dono, 2026-11-20). Cascadia,
// Cornelius, Karise e Marcellus são da Ordo, mas ficam fora do especial. O Sacrifício do Rancor conta como o Veritus.
export const ORDO_CALAMITAS = ['veritus', 'nero', 'celestine', 'gaius', 'amalia', 'faustus', 'marius', 'remus'];

export const TEAM_LINKS = {
  // Grupo dos Mascarados (3 ou mais na equipe): os seis cercam o alvo
  mascarados: {
    id: 'mascarados',
    kind: 'group',
    name: 'EXECUÇÃO DOS MASCARADOS',
    banner: 'Execução dos Mascarados!',
    group: MASCARADOS,
    min: 3,
    style: 'circle',
    color: 0xc4241c,
    // no Especial em Equipe cada um VESTE a máscara (prop do modelo: mostra → esconde no fim). A Kemi ainda não tem a
    // máscara no modelo (TODO: modelar).
    // coreografia própria (combat/teamSpecials.js CHOREO.mascarados) e quem entra transformado na cena
    choreo: 'mascarados',
    sceneForms: { kemi: 'fantasma' },
    masks: { dalmo: { show: ['helmet'] }, aguiar: { show: ['maskOn'] }, jae: { show: ['hoodX'], hide: ['hoodDown', 'hoodUp'] }, labirinto: { show: ['helmetOn'] }, juan: { show: ['hoodUp'] } },
  },
  // Força D: vale com 3 da equipe e aparecem todos os membros, cada um com o golpe próprio
  forca_d: {
    id: 'forca_d',
    kind: 'group',
    name: 'FORÇA D',
    banner: 'Força D!',
    group: FORCA_D,
    min: 3,
    color: 0x4a90e2,
    choreo: 'forca_d',
    sceneProps: { arthur: { show: ['bloodBlade'] }, beatrice: { show: ['crossbow'], hide: ['knife'] }, fernando: { show: ['glock'], hide: ['knife'] }, tristan: { show: ['flameLance', 'flameTanks'] } },
  },
  os_cinco: {
    id: 'os_cinco',
    kind: 'group',
    name: 'OS CINCO',
    banner: 'Os Cinco!',
    group: ['morato', 'chico', 'xande', 'lirio', 'guizo', 'dara'],
    min: 3,
    order: ['morato', 'chico', 'xande', 'lirio', 'guizo', 'dara'],
    color: 0x2ab8c8,
    choreo: 'os_cinco',
    // as armas do cânone na mão: a metralhadora do Morato, a submetralhadora da Dara e a Mac-10 do Chico
    sceneProps: { morato: { show: ['mgHand'], hide: ['mgBack'] }, chico: { show: ['smg'] }, dara: { show: ['smg'] } },
  },
  abutres: {
    id: 'abutres',
    kind: 'group',
    name: 'EQUIPE ABUTRES',
    banner: 'Equipe Abutres!',
    // a Carina (v4.17.0) e o Rubens (v4.18.0) fecham a coreografia: a equipe completa
    group: ['dante', 'carina', 'arthur', 'joui', 'balu', 'rubens'],
    min: 3,
    order: ['dante', 'balu', 'joui', 'arthur', 'carina', 'rubens'],
    color: 0x9a94ae,
    choreo: 'abutres',
    // Dante, Arthur e Joui também são da Força D: uma equipe só com os três é a dos Abutres (a de Calamidade)
    priority: 1,
    sceneProps: { arthur: { show: ['bloodBlade'] } },
  },
  // Ordo Calamitas: vale com 3 da equipe; cada um com o golpe próprio (a espada longa do Veritus, a espada curva do Nero, a
  // corrente da Celestine, a maça do Gaius, a Flecha Flamejante da Amalia, o gládio do Faustus, as manoplas do Marius e as
  // garras do Remus)
  ordo_calamitas: {
    id: 'ordo_calamitas',
    kind: 'group',
    name: 'ORDO CALAMITAS',
    banner: 'Ordo Calamitas!',
    group: ORDO_CALAMITAS,
    min: 3,
    color: 0x3ae8b8,
  },
  // A VIGÍLIA (Treb Ciach, 890; TODO do dono 2026-11-21: o vínculo quando houvesse 2 ou mais): vale com 3 da equipe e
  // aparecem todos os membros (as versões transformadas contam como o mesmo personagem). Coreografia genérica por enquanto
  a_vigilia: {
    id: 'a_vigilia',
    kind: 'group',
    name: 'A VIGÍLIA',
    banner: 'Até o amanhecer!',
    group: ['bran', 'mael', 'gwayne', 'zuri', 'eileen'],
    min: 3,
    order: ['bran', 'mael', 'gwayne', 'zuri', 'eileen'],
    color: 0x7a8aa8,
  },
  // Dupla Zuri + Eileen (cânone: melhores amigas, as únicas sobreviventes do Samhain e, depois, um casal). PROPOSTA: o nome
  zuri_eileen: {
    id: 'zuri_eileen',
    kind: 'duo',
    name: 'AS SOBREVIVENTES DE TREB CIACH',
    banner: 'As Sobreviventes de Treb Ciach!',
    members: ['eileen', 'zuri'],
    order: ['eileen', 'zuri'],
    color: 0xe0a83a,
  },
  // Dupla Arnaldo + Veríssimo (os melhores amigos da Ordo Realitas, a MESMA espada da fita vermelha): o Veríssimo abre a
  // guarda com a estocada do veterano e o Arnaldo fecha com o corte teatral
  arnaldo_verissimo: {
    id: 'arnaldo_verissimo',
    kind: 'duo',
    name: 'A ESPADA DA FITA VERMELHA',
    banner: 'A Espada da Fita Vermelha!',
    members: ['verissimo', 'arnaldo'],
    order: ['verissimo', 'arnaldo'],
    color: 0xd01c30,
  },
  // Dupla Balu + Rubens (pedido do dono, 2026-11-02; os dois amigos dos Abutres): o Balu avança gritando, o Rubens
  // corrige o nome e entra junto batendo (PROPOSTA dos golpes: machadadas do Balu, Salto Fantasma + martelada do Rubens)
  balu_rubens: {
    id: 'balu_rubens',
    kind: 'duo',
    name: 'A COÇA DOS ABUTRES',
    banner: 'Balu e Rubens!',
    members: ['balu', 'rubens'],
    order: ['balu', 'rubens'],
    choreo: 'balu_rubens',
    color: 0xc8c4d0,
  },
  // EQUIPE BRASA (Desconjuração; wiki "Tristan Monteiro"): o Tristan, a Erin (a pupila) e o casal Carvalho. Os três
  // também são da Força D: uma equipe só com os três é a Brasa (priority, como os Abutres). PROPOSTA dos golpes: o
  // molotov do Tristan, a explosão da Erin e os tiros do Fernando, cada um com o golpe próprio
  brasa: {
    id: 'brasa',
    kind: 'trio',
    name: 'EQUIPE BRASA',
    banner: 'Equipe Brasa!',
    members: ['tristan', 'erin', 'fernando'],
    order: ['tristan', 'erin', 'fernando'],
    priority: 1,
    color: 0xff7a2a,
    choreo: 'brasa', // combat/teamSpecials.js CHOREO.brasa (o fogo, a Supernova dentro dele, o Luciano no ar, o lança-chamas)
  },
  // IVETE + ARTHUR (wiki "Ivete Beicur": depois de O Segredo na Floresta "ambos passam a se tratar abertamente como mãe e
  // filho"). Coreografia do dono (2026-11-09, combat/teamSpecials.js CHOREO.mae_filho): o Arthur passa o Rebirth para a
  // doze dela, ela avança atirando e ele cobre de longe com a sniper
  ivete_arthur: {
    id: 'ivete_arthur',
    kind: 'duo',
    name: 'MÃE E FILHO',
    banner: 'Mãe e filho!',
    members: ['ivete', 'arthur'],
    order: ['ivete', 'arthur'],
    color: 0x3aff6a,
    choreo: 'mae_filho',
    sceneProps: { ivete: { show: ['shotgun'], hide: ['shotgunBack'] }, arthur: { show: ['sniperHand'] } },
  },
  // IRMÃOS LUKIC (pedido do dono, 2026-11-12: os gêmeos entram como dois personagens ligados): a Foice Amaldiçoada do
  // cânone — a gadanha do Boris com a bengala do Damir encaixada (combat/teamSpecials.js CHOREO.irmaos_lukic)
  irmaos_lukic: {
    id: 'irmaos_lukic',
    kind: 'duo',
    name: 'A FOICE AMALDIÇOADA',
    banner: 'Irmãos Lukic!',
    members: ['damir', 'boris'],
    order: ['damir', 'boris'],
    color: 0xf2c230,
    choreo: 'irmaos_lukic',
  },
  // ELOY + KEMI (pedido do dono, 2026-11-14; refeito 2026-11-15; cânone: o casal — ela segura o Eloy quando a focinheira
  // pesa): a focinheira, o Moeller Method no ritmo com os tiros dela, o Disparo da Morte e a baqueta do alto
  // (combat/teamSpecials.js CHOREO.eloy_kemi; a cena é PROPOSTA)
  eloy_kemi: {
    id: 'eloy_kemi',
    kind: 'duo',
    name: 'AMOR E SANGUE',
    banner: 'Amor e Sangue!',
    members: ['eloy', 'kemi'],
    order: ['eloy', 'kemi'],
    color: 0xff5a8a,
    choreo: 'eloy_kemi',
    sceneProps: { kemi: { show: ['sniperHand'], hide: ['stowed'] } },
    sceneForms: { kemi: 'fantasma' }, // ela veste as faixas para o Disparo da Morte (cânone: a Fantasma)
  },
  // PSIKOLERA (pedido do dono, 2026-11-14): a banda de Hexatombe — o Eloy (bateria), a Cindy (baixo), o Caio (vocal,
  // 2026-11-17), o Franco (guitarra) e Alê (teclado, 2026-11-18). LANÇADO em 2026-11-18 (dono, 2026-11-13: "só vai ser
  // lançado quando ter todos psikolera"; 2026-11-18: "finalize os psikolera"): vale com 3 da banda na equipe, como os outros
  // grupos, e todos entram de máscara (combat/teamSpecials.js CHOREO.psikolera)
  psikolera: {
    id: 'psikolera',
    kind: 'group',
    name: 'HORA DO SHOW!',
    banner: 'Hora do Show!',
    group: ['eloy', 'cindy', 'caio', 'franco', 'ale'],
    min: 3,
    order: ['eloy', 'cindy', 'caio', 'franco', 'ale'],
    color: 0xc6f03a,
    choreo: 'psikolera',
    masks: { eloy: { show: ['maskOn'] }, cindy: { show: ['maskOn'] }, caio: { show: ['maskOn'] }, franco: { show: ['maskOn'] }, ale: { show: ['maskOn'] } },
  },
  // VAMPIROS (pedido do dono, 2026-11-18: "personagem novo de alguma equipe que falta"): o Raziel, a Sabara e a Alvira,
  // a Primeira Vampira, e (2026-11-19) o Velisar e o Zéfero: a equipe inteira de Hexatombe
  vampiros: {
    id: 'vampiros',
    kind: 'group',
    name: 'MISSA DE SANGUE',
    banner: 'Missa de Sangue!',
    group: ['raziel', 'sabara', 'alvira', 'velisar', 'zefero'],
    min: 3,
    order: ['alvira', 'velisar', 'zefero', 'sabara', 'raziel'],
    color: 0xa01018,
    choreo: 'vampiros',
  },
  // OS ESCRIPTAS (os Marcados do Kian em Calamidade): vale com 3 na equipe e aparecem todos
  escriptas: {
    id: 'escriptas',
    kind: 'group',
    name: 'OS MARCADOS DO KIAN',
    banner: 'Escriptas!',
    group: ['kian', 'gal_sal', 'nubi', 'damir', 'boris', 'artemis'],
    min: 3,
    color: 0xf2c230,
  },
  // Dupla Cristopher + Kaiser (pai e filho: o dublê segura, o filho atira)
  cristopher_kaiser: {
    id: 'cristopher_kaiser',
    kind: 'duo',
    name: 'A MURALHA E O DISPARO',
    banner: 'A Muralha e o Disparo!',
    members: ['cristopher', 'kaiser'],
    color: 0xd9822b,
  },
};

const KIND_ORDER = { group: 0, trio: 1, duo: 2 };

// a ficha de quem está na equipe (aceita id, ficha ou lutador/assistência)
const defOf = (m) => (typeof m === 'string' ? { id: m } : (m && m.def) || m || {});

// id de base (uma versão ou forma conta como o personagem: Colosso → dalmo)
export const linkId = (m) => { const d = defOf(m); return d.baseId || d.id || ''; };

// a entrada da ligação vale para essa ficha? ('kaiser' → qualquer versão; 'kaiser_x' → só ela)
export const matchesEntry = (entry, m) => { const d = defOf(m); return d.id === entry || d.baseId === entry; };

// a ficha faz parte da ligação?
export const inLink = (link, m) => (link.group || link.members).some((e) => matchesEntry(e, m));

// quantas entradas da ligação a equipe cobre, e quantas por versão exata
function coverage(link, defs) {
  let hit = 0;
  let exact = 0;
  for (const e of link.group || link.members) {
    const d = defs.find((x) => matchesEntry(e, x));
    if (!d) continue;
    hit++;
    if (d.baseId && d.id === e) exact++;
  }
  return { hit, exact };
}

// RECOMENDAÇÃO NA SELEÇÃO (como no Naruto Storm 4: escolheu o primeiro, o cursor já vai para quem fecha um especial de
// equipe com ele). Entre as ligações que têm TODOS os já escolhidos e ainda têm alguém que falta, ganha: `priority`,
// depois a que fecha a equipe de 3 (grupo/trio antes de dupla), depois a ordem deste arquivo (as equipes mais conhecidas
// primeiro). Devolve a entrada (id) do próximo membro — na ordem da ligação (`order`, senão a lista) — ou null.
// available(entry): o membro existe no elenco (o Rubens dos Abutres ainda não)
export function recommendNext(members, available = () => true) {
  const defs = members.map(defOf).filter((d) => d.id);
  if (!defs.length || defs.length >= 3) return null;
  const best = [];
  Object.values(TEAM_LINKS).forEach((l, order) => {
    if (!defs.every((d) => inLink(l, d))) return;
    const list = l.group || l.members;
    const ordered = l.order ? [...l.order, ...list.filter((e) => !l.order.includes(e))] : list;
    const next = ordered.find((e) => !defs.some((d) => matchesEntry(e, d)) && available(e));
    if (!next) return;
    const three = (l.group ? l.min : l.members.length) >= 3 ? 1 : 0;
    best.push({ next, three, order, pr: l.priority || 0 });
  });
  best.sort((a, b) => b.pr - a.pr || b.three - a.three || a.order - b.order);
  return best.length ? best[0].next : null;
}

// A ligação da equipe (ou null). members[0] é o líder.
export function getTeamLink(members) {
  if (!members || members.length < 2) return null;
  const defs = members.map(defOf).filter((d) => d.id);
  // duas versões do mesmo personagem contam como um membro
  const people = new Set(defs.map(linkId)).size;
  const leader = defs[0];
  const ok = [];
  Object.values(TEAM_LINKS).forEach((l, order) => {
    if (l.unreleased) return;
    const c = coverage(l, defs);
    const entries = (l.group || l.members).length;
    const valid = l.group ? c.hit >= l.min && people >= l.min && new Set(defs.filter((d) => inLink(l, d)).map(linkId)).size >= l.min : c.hit === entries;
    if (valid) ok.push({ l, order, exact: c.exact, lead: inLink(l, leader) ? 1 : 0 });
  });
  ok.sort((a, b) => (b.l.priority || 0) - (a.l.priority || 0) || KIND_ORDER[a.l.kind] - KIND_ORDER[b.l.kind] || b.exact - a.exact || b.lead - a.lead || a.order - b.order);
  return ok.length ? ok[0].l : null;
}
