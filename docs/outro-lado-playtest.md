# Outro Lado — notas de playtest (1ª fase: Território do Espreitador)

Notas de produção do modo PvE, escritas jogando a fase e comparando com o TODO (§3–§13). Cada rodada lista o que foi
visto, o que mudou e o que fica para o feedback do dono.

## Rodada 1 (2026-11-05)

Como foi testado: no navegador (preview local), com a CPU no "Muito Difícil" jogando no lugar do jogador. Os saltos de
sala foram feitos por script para testar o chefe sem refazer a dungeon inteira. O navegador estava em segundo plano
(3 qps), então o jogo foi avançado quadro a quadro pelo console; o custo real medido foi de cerca de 2 ms de desenho
e 0,6 ms de lógica por quadro.

### O que funcionou

- O fluxo inteiro: menu principal → OUTRO LADO (hub) → escolha do lutador → dificuldade → carregamento → hall →
  sala de estar (Devorado + cópia) → corredor da fresta → biblioteca (Devorado + 2 cópias) → quarto (o Espreitador)
  → recompensa onde ele caiu → porta de saída → câmera atrás do personagem andando pelo corredor → tela
  "TERRITÓRIO LIMPO" → descer (profundidade 2).
- A morte acaba com a tentativa, mostra "VOCÊ FOI DEVORADO", conta a morte na campanha e mantém o nível e os pontos.
- O chefe usou todos os estados: duelo, olhar (Drenar Energia), correr para a fresta, escondido, bote para fora do
  armário, invocar Devorados, e os armários trancam com golpe e reabrem sozinhos depois.
- Subir de nível pausa o jogo e mostra as 3 cartas; a carta escolhida entra nos modificadores na hora (Vigor deu
  1500 → 1725 de vida).
- O ponto permanente entra uma vez por dungeon (o `token` impediu duplicar) e a árvore compra e devolve pontos.
- O save fica só na chave `veu_pve_v1`; apagar o Outro Lado não mexe no resto.

### Problemas achados e o que mudou

| # | Problema | Mudança |
|---|----------|---------|
| 1 | Depois da morte do chefe a porta de saída abria, mas a porta do quarto (o portão invisível em x 62,2) continuava trancada: **não dava para sair**. | Na morte do chefe abrem os dois portões do quarto. |
| 2 | Os armários continuavam abertos (e com olhos) depois da morte do chefe. | Fecham de vez (`lock({ forever: true })`). |
| 3 | O 1º Devorado (700 de vida) tirou 2/3 da vida de uma CPU no Muito Difícil: a 1ª sala estava pesada demais. | Devorado com 560 de vida e 20% menos dano que o lutador copiado. |
| 4 | O chefe (2600) ficou com 60% da vida depois de 78 s de luta e matou a CPU. | 2100 de vida; armário trancado fica 20 s fechado (antes 15). |
| 5 | O 1º nível só vinha na biblioteca. | Devorado dá 35 de XP (antes 25), cópia dá 15 (antes 12): o 1º nível chega no fim da sala de estar. |
| 6 | A luta da biblioteca escapava para o corredor da fresta. | As salas de luta também trancam a porta de trás até limpar. |
| 7 | Sem o modelo do chefe o jogo travava ao entrar no quarto ("Modelo não carregado"). | O modelo foi feito e, se o download falhar, entra o corpo do Carniçal. |
| 8 | O fim da dungeon desmontava o mundo no meio do próprio quadro. | O fim vai para o quadro seguinte. |
| 9 | Na exploração a câmera ficava colada e as paredes do corredor tapavam o caminho. | O ponto à frente foi para 4,5 m e também deixa transparentes as paredes na frente dele. |
| 10 | Armários na parede da frente do quarto tapariam a câmera. | Os dois de baixo foram para as paredes laterais. |

### O modelo do Espreitador

Feito com o pipeline do Carniçal (`tools/blender/char_espreitador.py`): pele cinza enrugada, cabeça grande com 13
olhos amarelos (alguns com 2 ou 3 pupilas), lágrimas escorrendo, boca com dentes tortos e o olho grande dentro dela,
braços e dedos longos, coxas grossas (as pernas curtas não dá para encurtar de verdade: o esqueleto é o mesmo das
animações de todos). PROPOSTA: o tronco curvado e a cabeça baixa.

- 1ª versão: rugas regulares viraram listras e a cabeça ficou pequena (o metaball aparece a 0,575 do raio). Corrigido.
- Os olhos agora são colocados pela superfície de verdade da cabeça (raio contra a malha).
- **O Blender MCP estava desconectado** nesta sessão: a conferência nas 4 vistas foi feita dentro do jogo. Vale uma
  passada no Blender MCP com as referências da wiki (a regra de polir os modelos depois).

### Para o feedback do dono

- O ritmo das salas e o dano do chefe foram calibrados com a CPU; precisam de uma rodada com mãos humanas.
- A transição entre dungeons mostra a tela de resultado (é o ponto de salvamento) em vez de emendar direto na
  próxima. O §9 pede a passagem sem carregamento aparente: dá para emendar quando houver uma 2ª dungeon.
- O quarto ficou escuro em alguns cantos; se atrapalhar a leitura do chefe, sobe a luz do quarto.
- Exportar/importar backup (§8) ficou para depois, como o cooperativo e o Espreitador jogável.

## Rodada 2 (feedback do dono, 2026-11-05)

Pedidos e o que foi feito:

- **Câmera em 3ª pessoa fixa** (imersão): `CameraRig.chase` / `updateChase`, atrás do ombro; o movimento segue a câmera.
- **Clones mais fortes** (as salas duram mais): Devorado 820 de vida, mais cópias (sala 2, biblioteca 3). Pela CPU,
  a sala passou de ~22 s para ~58 s.
- **Cronômetro de speedrun** no canto e o recorde por dificuldade na tela de resultado.
- **Olhos amarelos onde ele vai sair**: o armário de saída acende os olhos por ~0,95 s (mais no Fácil, menos no Difícil).
- **HUD de melhorias no estilo Vampire Survivors**: o painel de subida de nível em lista e a loja de melhorias permanentes em grade.
- **Personagens bloqueados**: só Chico, Dara, Guizo e Lírio começam liberados. Os outros são comprados com
  **moedas** (60 a 700) na tela DESBLOQUEAR PERSONAGENS. As moedas saem de **baús** no mapa (moedas, vida ou XP) e
  da recompensa do chefe. PROPOSTA: a ordem e os preços.
- **Cutscene de entrada do chefe** (wiki): luzes falhando, a fresta com o olho tremendo e chorando, as pupilas se
  multiplicando, os dedos longos saindo, a porta estourando e ele rastejando para fora tremendo, e o rugido. Pode ser pulada.
- **Vibe de terror (referência: Doors)**: batidas, sussurros, passos, rangidos e luzes falhando ao acaso; o coração
  bate com a vida baixa ou com ele escondido; olhos nas paredes dos corredores abrem e seguem o jogador.
- **Espreitador refeito do zero, sem corpo humano**: esculpido em metaballs num **esqueleto próprio já agachado**
  (quadril baixo, joelhos dobrados, corcunda, braços até o chão). Os ossos e nomes são os do lutador, então as
  animações continuam as mesmas. Ele tem a massa de olhos no alto da cabeça, as mãos grandes com dedos de galho
  e olhos no ombro, no braço e na coxa. Conferido em 4 vistas no Blender MCP e no jogo, e ficou maior (tamanho 1,28).
