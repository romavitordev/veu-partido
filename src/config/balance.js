// BALANCEAMENTO GERAL (ajuste fino por personagem). Um lugar só para o equilíbrio do elenco, em vez de mexer em dezenas de
// números espalhados pelos kits: `dealt` multiplica todo o dano que o personagem causa (golpes, tiros, rituais, especial
// e as invocações dele), `taken` multiplica o dano que ele recebe. Vale também nas formas (Transformação) — o
// coeficiente é o do personagem de origem. 1 = sem ajuste.
//
// Medido com `src/dev/balance.js` (CPU × CPU no nível normal, todos os pares). Alvo: 35%–65% de vitórias para todos
// (TODO §34 — o tier diz a função do personagem, não obriga uma taxa). Os ajustes são moderados de propósito: uma
// rodada tem ruído de uns ±7% por personagem, então a gente aproxima e mede de novo em vez de corrigir de uma vez.
//
// v3.32.0 — 1ª rodada (≈650 lutas): O Diabo 100%, Kian 90%, Dante 86%, Joui 73%, Gal Sal 66% | Nubi 10%,
// Cristopher 20%, Balu 24%, Arthur 25%, Erin 26%, Aghata 28%, Lírio 30%, Estrangeiro 30%, Veríssimo 34%.
// (O Diabo e o Kian também tiveram correções de kit: a regeneração do Diabo e o Inexistir do Kian.)
// v4.13.1 — rodada com os 39 (1482 lutas): Juan (Ódio) 91%, Anfitrião 75%, Amália 71%, Chico 70% | Gaius 20%,
// Amigo 25%, Aguiar 28%, Joui 29%, Nubi 30%, Lírio 32%, Aghata 32%, Cristino 33%, Dalmo 33%, Balu 33%, Cristopher 34%,
// Dante 34%. Os outros 23 ficaram entre 36% e 64%. Rodada 2: 33 dos 39 na faixa; as formas selecionáveis usavam a
// linha do personagem de origem (o Anfitrião pegou o reforço do Gaius) — corrigido no balanceOf. Rodada 3: 31 dos 39,
// os de fora na beirada (32–34% e 67–70%, dentro do ruído; a Nubi oscila 30 → 62 → 28%). Ajuste fino pela média das 3.
// Rodada 4: 34 dos 39 na faixa (Morato, Arnaldo, Cristino e Cristopher em 32–34%, no ruído; O Diabo caiu para 22%).
export const BALANCE = {
  // rodada 1 → 2 → 3 → 4 (o ruído de uma rodada é de uns ±7%: para quem não mudou, vale a média das rodadas 3 e 4)
  o_diabo: { dealt: 0.76, taken: 1.14 }, // 100 → 94 → 93 → 74 → 51% (focada) (o kit também perdeu vida, regeneração e roubo de vida) | v4.13: 42 → 39 → 37 → 22% → 41% (focada)
  kian: { dealt: 0.86 }, // 90 → 93 → 59 → 59% (+ kit: Inexistir e Escrita)
  kemi: { dealt: 0.97 }, // 56 → 54 → 63 → 43%
  juan: { dealt: 1.06, taken: 0.95 }, // 62 → 65 → 46 → 57% | v4.13: 36 → 18% (o Henri; o Portador selecionável é a linha juan_odio) → 42% → 57%
  ferreiro: { dealt: 0.97 }, // 63 → 65 → 49 → 59%
  dante: { dealt: 0.94, taken: 1.02 }, // 86 → 59 → 56 → 57% | v4.13: 34% → 39% → 41% → 36%
  joui: { dealt: 1, taken: 0.97 }, // 73 → 59 → 48 → 48% | v4.13: 29% → 38% → 42% → 45%
  gal_sal: { dealt: 0.97 }, // 66 → 46 → 59 → 52%
  erin: { dealt: 1.04, taken: 0.97 }, // 26 → 59 → 57 → 52%
  cristopher: { dealt: 1.2, taken: 0.9 }, // 20 → 56 → 26 → 41% (oscila muito entre rodadas) | v4.13: 34% → 38% → 32% → 32% → 34% (focada; segue na beirada)
  nubi: { dealt: 1.25, taken: 0.87 }, // 10 → 39 → 44 → 28 → 48% (focada) | v4.13: 30% → 62% → 28% → 43%
  balu: { dealt: 1.24, taken: 0.86 }, // 24 → 37 → 26 → 46% | v4.13: 33% → 41% → 28% → 51%
  guizo: { dealt: 1.12, taken: 0.95 }, // 48 → 37 → 32 → 65% | v4.13: 39 → 29% → 38% → 37%
  magistrada: { dealt: 1.04 }, // 50 → 37 → 45 → 56%
  verissimo: { dealt: 1.22, taken: 0.97 }, // 34 → 35 → 35 → 33% | v4.13: 45 → 32% → 32% → 36%
  dalmo: { dealt: 1.09, taken: 0.97 }, // 44 → 56 → 37 → 50% | v4.13: 33% → 39% → 36% → 38%
  aguiar: { dealt: 1.15, taken: 0.94 }, // 46 → 50 → 37 → 37% | v4.13: 28% → 37% → 34% → 51%
  lirio: { dealt: 1.22, taken: 0.88 }, // 30 → 35 → 44 → 28% | v4.13: 32% → 33% → 50% → 46%
  labirinto: { dealt: 1.12, taken: 0.92 }, // 44 → 33 → 44 → 46% | v4.13: 41 → 25% → 47% → 43%
  arnaldo: { dealt: 1.08, taken: 0.94 }, // 42 → 32 → 56 → 46%
  amigo: { dealt: 1.14, taken: 0.91 }, // 40 → 30 → 62 → 44% | v4.13: 25% → 43% → 34% → 39%
  aghata: { dealt: 1.19, taken: 0.88 }, // 28 → 28 → 57 → 46% | v4.13: 32% → 50% → 46% → 41%
  estrangeiro: { dealt: 1.06, taken: 0.92 }, // 30 → 28 → 46 → 48% | v4.13: 61 → 67% → 67% → 46%
  arthur: { dealt: 1.16, taken: 0.9 }, // 25 → 24 → 48 → 52%
  cristino: { dealt: 1.08, taken: 0.97 }, // 48 → 57 → 42 → 35% | v4.13: 33% → 43% → 42% → 33%
  // v4.13 (39 personagens, 1482 lutas): entram os que ainda não tinham ajuste
  juan_odio: { dealt: 0.82, taken: 1.1 }, // 91 → 91% (a linha só passou a valer com a correção do balanceOf) → 58% → 61%
  anfitriao: { dealt: 0.92, taken: 1.05 }, // 75 → 89% (usava a linha do Gaius; idem) → 64% → 63%
  amalia: { dealt: 0.93, taken: 1.04 }, // 71 → 59% → 54% → 64%
  chico: { dealt: 0.9, taken: 1.05 }, // 70 → 62% → 67% → 57%
  gaius: { dealt: 1.15, taken: 0.9 }, // 20 → 46% → 39% → 50%
  xande: { dealt: 1.05, taken: 0.97 }, // 37 → 32% → 41% → 42%
  dara: { dealt: 0.95 }, // 64 → 59 → 70% → 51%
  jae: { dealt: 1.04 }, // 43 → 37 → 34% → 45%
  // v4.32 — as criaturas do Outro Lado jogáveis (focadas): a Degolificada herda os golpes do Amigo sem os 1800 de vida
  // nem o roubo de vida dele
  degolificada: { dealt: 1.36, taken: 0.79 }, // 8% (sem ajuste) → 33% (1.3/0.82, 86 lutas); kit novo (v4.33): 43% (172 lutas)
  espreitador: { dealt: 1.32, taken: 0.8 }, // kit novo (v4.33): 20% com 1.17/0.89 (132 lutas) → 48% (172 lutas)
  // 2026-11-09 — os novos, focados (92 lutas cada, sem ajuste): Fernando 20%, Tristan 12%, Ivete 20%
  fernando: { dealt: 1.13, taken: 0.93 }, // 20% (sem ajuste) → 70% (1.24/0.86) → 47% (92 lutas) (o Luciano é a mesma ficha: herda a linha)
  tristan: { dealt: 1.19, taken: 0.89 }, // 12% (sem ajuste) → 80% (1.34/0.8) → 48% (92 lutas)
  ivete: { dealt: 1.13, taken: 0.92 }, // 20% (sem ajuste) → 79% (1.26/0.84, 70 lutas) → 49% (92 lutas, já com a tacada de sinuca no lugar do Suvaco Seco) → 46% (102 lutas, 2026-11-13)
  // 2026-11-13 — Escriptas e Hexatombe, focados (102 lutas cada, sem ajuste): Sabara 31%, Artemis 24%, Boris 10%,
  // Damir 5%, Eloy 3%. Nenhum golpe travado: os kits novos só causam ~40% menos dano por luta (Eloy ~1800, Damir
  // ~1400 contra ~3300 da Ivete e do Kaiser). O Damir também ganhou a Força Paranormal (cânone) no físico.
  sabara: { dealt: 1.08, taken: 0.95 }, // 31% (sem ajuste) → 40%
  artemis: { dealt: 1.12, taken: 0.93 }, // 24% (sem ajuste) → 37%
  boris: { dealt: 1.25, taken: 0.86 }, // 10% (sem ajuste) → 32% (1.2/0.88) → 51%
  damir: { dealt: 1.22, taken: 0.87 }, // 5% (sem ajuste; + Força Paranormal 1.08 no físico) → 40%
  eloy: { dealt: 1.28, taken: 0.85 }, // 3% (sem ajuste) → 42%
};

// o coeficiente de um lutador (transformado: o do personagem de origem). As formas selecionáveis (o Portador, o Anfitrião
// e o Deus da Morte das Relíquias) têm linha própria: herdam o baseId da forma, mas são outro lutador na seleção.
export function balanceOf(f) {
  if (!f || !f.def) return null;
  if (f.def.selectableForm && !f.baseForm) return BALANCE[f.def.id] || null;
  const id = f.baseForm && f.baseForm.def ? f.baseForm.def.id : f.def.baseId || f.def.id;
  return BALANCE[id] || null;
}
