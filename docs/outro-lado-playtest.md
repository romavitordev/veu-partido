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

## Rodada 3 (feedback do dono sobre a v4.26.0) — FEITA (aguarda o lançamento da v4.27.0)

Pedidos:
1. A câmera não pode atravessar as paredes: sempre dentro da dungeon.
2. Câmera movimentável (mouse ou analógico direito), com o personagem girando junto para mirar os ataques.
3. Sem troca de personagem na luta: o time entra só como assistência.
4. Os olhos dos corredores não ficam nas paredes: aparecem em frestas que mudam de lugar enquanto o jogador avança.
5. Uma seta guia até o baú depois de limpar a sala, e depois até a próxima sala.
6. Os clones (Devorados e cópias) são do jogador e das assistências.
7. O Espreitador mais fiel ao cânone (modelo e habilidades): reler a wiki e o livro.
8. Sem dungeon nova, a saída leva à primeira numa dificuldade maior.

Plano técnico (implementado; a seção de rotas abaixo substitui a seta-guia linear):
- **Câmera.**
  - `CameraRig.updateChase` (`src/camera/CameraRig.js:285`): trocar `clampToArena` e `avoidSolids` por um raio contra as paredes da mansão a cada quadro.
  - O `avoidSolids` atual só refaz o raio 10× por segundo e só para os `solids`; incluir as paredes do `mansao.glb`.
  - Entrada `look` em `InputManager.readDevice`: analógico direito (`axes[2]` e `axes[3]`) e mouse (pointer lock, `movementX`/`movementY`).
  - Uma flag `input.freeLook` no modo: o analógico direito hoje faz a troca (`switch1`/`switch2`).
- **Mira.**
  - `Fighter.aimYaw`, ligado pela Dungeon a partir da câmera, usado:
    - no movimento (`Fighter.js:1367`, andar de lado olhando a mira);
    - no início do golpe (`Fighter.js:1939`, alvo mais perto do cone da mira);
    - no tiro (`fireProjectile:2647` e o `seq` de `:2424`, mirar na direção da câmera em vez do `opp`).
- **Equipe.**
  - Seleção em equipe no Outro Lado (`SelectScreen team`, `pick.teams`).
  - A Dungeon cria `player.assists = teams.slice(1).map(new Assist)` (`src/combat/assists.js`), como em `Match.js:36`.
  - Uma flag `fighter.noSwitch` checada em `Fighter.js:747` (`trySwitch`).
  - Devorados e cópias sorteados entre o líder e as assistências.
- **Olhos nas frestas:** trocar `ambience.js buildEyes` por frestas (portas entreabertas ou rachaduras) que surgem à frente do jogador, espiam e somem.
- **Seta-guia:** um mesh no chão (ou uma seta no HUD) apontando para o baú mais perto não aberto quando `encounter.done`, e depois para `r.enter` da próxima sala.
- **Dificuldade maior:** no `flow.js onDungeonEnd`, quando `pickNextDungeon` não tiver dungeon nova, voltar à primeira e subir a dificuldade (Fácil → Normal → Difícil, depois "Difícil +N"), além da profundidade.

### Rodada 3, parte 2: rotas com escolha, portas e setas (pedidos do dono, 2026-11-05)
Pedidos:
- Número de salas até o chefe variável, em todas as dungeons.
- Caminhos com escolha: sala à esquerda, à frente e à direita.
- Cada sala com 2, 3 ou 4 monstros; o chefe é um só e é sempre a última.
- A escada do hall leva ao andar de cima.
- Portas que abrem e fecham entre as salas.
- Setas: azul para os baús (opcionais), amarelas para as portas.

O que foi feito:
- **Módulos.** `DUNGEONS.*.modules` em `src/pve/dungeons.js`. Cada sala tem:
  - a área andável (`rects`): só ela vale enquanto o jogador está ali;
  - a entrada;
  - as saídas `left`/`front`/`right` (o hall tem a escada `up`);
  - os lugares de baú.
- **Rota.**
  - `rollRouteLength`: 3 a 5 salas, +1 a partir da profundidade 3.
  - `rollExits` sorteia o que há atrás de cada porta: a sala e de 2 a 4 monstros.
  - A escada sempre troca de andar.
  - Pelo menos uma porta tem luta.
  - Depois da última sala, uma porta só: o chefe.
- **Portas** (`src/pve/roomDoors.js`):
  - trancadas na luta;
  - com a sala limpa, abrem quando o jogador chega perto e fecham quando ele se afasta;
  - a placa mostra a sala e quantos monstros (↑/↓ quando troca de andar);
  - atravessar escurece a tela e leva à próxima sala;
  - a porta de entrada se fecha atrás de quem chegou.
- **Salas novas** em `arena_mansao.py` (faixa z 34…46):
  - Sala de jantar (PROPOSTA, térreo);
  - Quarto infantil (2º andar);
  - Quarto dos Olhos de Gatos (2º andar, porta emperrada com 18 olhos).

  Também saiu a estante do meio da biblioteca, para dar lugar à porta.
- **Monstros:** a sala de N monstros tem o Devorado e N−1 cópias.
- **Baús opcionais:** um por sala, mais provável com mais monstros (30%, 50%, 80%).
- **Setas:** AZUL para o baú; AMARELAS para cada porta aberta, a recompensa e a saída.

Testado no navegador:
- hall com 3 saídas;
- corredor com a fresta;
- biblioteca com 4 monstros;
- a rota inteira até o quarto (5 salas e o chefe);
- o Quarto infantil.

Teste novo de rotas em `tests/pve.test.js`.

### Revisão com as skills (antes da v4.27.0)
- Aplicado (skill `game-feel`): o tremor de tela era um sorteio por quadro, que "chiava". Agora são ondas suaves que decaem (`CameraRig`).
- Propostas, ainda não feitas:
  - parada de impacto (hit-stop) escalonada por importância do golpe;
  - placa de dano maior no golpe final;
  - tremor da câmera no bote do Espreitador.

### Rodada 4 (pedidos do dono, 2026-11-06) — feita, aguarda lançamento
Câmera e mira:
- **Trava no inimigo.** Na luta, a câmera trava sozinha num inimigo, e o corpo mira nele.
  - Um movimento rápido do mouse ou do analógico troca de alvo.
  - F, o botão do meio do mouse ou R3 liga e desliga a trava.
  - Um losango vermelho no chão marca o alvo.
- **Câmera atravessando paredes:** a causa era o corte de perto da câmera (near) em 0,7 m, que cortava a parede do lado.
  - Na 3ª pessoa, o corte agora é de 0,12 m e a folga da parede é de 0,35 m.
  - Testado em 7 salas, 280 posições cada: a câmera ficou sempre a pelo menos 0,48 m das paredes.

Inimigos e salas:
- **Cópias misturadas.** Os monstros de cada sala saem embaralhados do time (`pickClones`), e o chefe tira as cópias de um saco embaralhado (`nextClone`).
- **Salas sem nome:** nem as portas nem o HUD mostram o nome da sala ou quantos monstros ela tem.
- **Salas reformadas:**
  - Sala de jantar: papel vinho, cristaleira, lareira apagada, vinho derramado, espelho rachado.
  - Quarto infantil: papel verde com patinhos, piso de tábua, berço, estante de bonecas, mesinha de chá, móbile, desenhos (um deles cheio de olhos).
  - Quarto dos Olhos de Gatos: papel roxo com olhos de gato e arranhões, gatos pretos de olhos acesos, cadeira de balanço virada para a porta emperrada.
  - As três ganharam luzes próprias.

Controles e setas:
- **Teclas simples no teclado + mouse:**
  - 1 a 5: as habilidades;
  - Z: especial; G: agarrão; C: também carrega;
  - Q e R: assistências.

  A HUD mostra essas teclas.
- **Setas** 3D flutuando na altura do peito, sempre visíveis.
- **Baús** mais frequentes.

Ritmo (skill `level-design`):
- depois de uma sala de 4 monstros, sempre há uma porta mais leve;
- a sala antes do chefe sempre tem baú;
- as portas abertas brilham.

Luz que atordoa:
- Farol da Van, Foto com Flash, Lanterna UV e Clarão dos LEDs (`photoFlash`) cegam e ATORDOAM em área, no modo de luta e no Outro Lado.
- O adversário fica atordoado por até 1,2 s (60% do tempo de cegueira).
- Os inimigos menores no cone ficam parados por 1,4× esse tempo (`stunNpc`; o `World` pula o update deles).

Botão de interagir, gavetas e cadeados:
- **Interagir: E no teclado, B no controle.** Portas, baús e gavetas só abrem pelo botão. Um aviso flutua em cima ("E · Abrir", "Entrar", "Destrancar", "Trancada").
  - Só fora da luta. Na luta o E continua sendo a defesa e o B o golpe físico; perto de algo, o aperto é consumido e não vira defesa.
- **Gavetas** nos móveis (console do hall, armário baixo da sala, mesinha do corredor, armário da biblioteca, aparador e cristaleira do jantar, baú de brinquedos e armário do infantil, cômoda dos Olhos, criados-mudos e cômoda do quarto). Têm a chave, moedas (35%) ou nada.
- **Portas com cadeado** (40% das salas com 2+ saídas e com gaveta; nunca a única saída, a escada ou a do chefe). A chave está numa gaveta da mesma sala, sem aviso de qual. Uma chave por porta; a que sobra fica no bolso (HUD: 🗝 ao lado das moedas).
- **Atrás do cadeado:** sala de baús (todos os pontos de baú, sorte +60%) ou sala de monstros que, limpa, solta um baú de sorte sem aviso. Atrás de corredor de espreita é sempre sala de baús.
- Ajustes em `DUNGEONS.espreitador.locks` (`chance`, `vault`, `luck`, `drawerCoins`, `coins`).
- **A escada do hall se sobe andando.** No patamar fica a porta da sala de cima ("E · Entrar"); dá para não entrar e descer de volta.
  - Só se sobe pelo pé da escada; pelos lados os degraus barram. O chão com altura é `World.groundAt` (o `Fighter` pousa nele) e a câmera sobe junto.
  - Sem saída sorteada para cima, a porta do patamar fica trancada.
