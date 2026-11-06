# Changelog

## v4.31.0 — Outro Lado: a Escola Nostradamus e a Degolificada

### Adicionado
- 2ª dungeon do Outro Lado: o Território da Degolificada (Escola Nostradamus, profundidade 2+), com salas de Zumbis de Sangue e o bunker secreto da biblioteca.
- Chefe: a Degolificada de Gabriel (Iniciação). Luta só com os cabelos (investida de cabelo, agarrar e arremessar na parede, cabelo rastejante, cabelo por cima, defesa de cabelo), Grito Rasgado e a metamorfose Devoradora.
- Escudo de Medo: segunda vida em terços por cima da vida; ela arremessa as caixas do bunker e de uma caixa quebrada pode sair uma das 3 provas, cada uma tira um terço do escudo.
- Barris e caixas quebráveis; drops de moedas, experiência e cura em gavetas, barris, caixas e monstros.
- Baús animados (luz, facho, ícones) com 1 a 3 itens que sobem melhorias já escolhidas na partida.
- Melhorias permanentes compráveis com moedas.
- Backup do Outro Lado (exportar/importar) e cópia automática do save.

### Alterado
- HUD do Outro Lado minimalista; nomes de golpes das criaturas pequenos no canto; avisos de interagir sem caixa.
- Tentáculos do Lodo (Dante/Nubi) com o modelo do Amigo Imaginário.
- A tela de fim usa o texto da dungeon (na escola: "Você caiu na escola").

## v4.30.0 — Outro Lado: coop online e volta à vida com moedas

### Adicionado
- Expedição online sincronizada: dois jogadores, cada um no próprio computador e com sua própria câmera, entram na mesma dungeon.
- Lockstep do Outro Lado: `NET_ACTIONS` com as teclas simples e o interagir; `packInput` leva a câmera livre (analógico, mouse, trava); o 3º lugar (CPU do inimigo) roda igual nos dois; a montagem da dungeon usa sorteio com semente; o começo espera os dois carregarem (`netLoaded.pveStart`); o fim acontece no quadro seguinte (`Dungeon.flushEnd`, sem `setTimeout`). Mensagens `pd` (dados de cada um) e `pgo` (o anfitrião começa); sala do Outro Lado sem espectadores.
- Seleção com bloqueados por lado (`SelectScreen.lockedFor`); nome do parceiro em cima dele (`Dungeon.placeMate`, `pveHud.setMate`).
- Voltar à vida (`Dungeon.openRevive`/`updateRevive`, `pveHud.showRevive`, `wallet` do flow): sozinho ou com os dois caídos no coop; 50% da vida e 2,5 s invulnerável. Preço (PROPOSTA): 40 moedas na profundidade 1 (+50% por profundidade), e cada resgate na mesma dungeon soma o preço base outra vez (40, 80, 120…).
- Coop: a escolha da melhoria alterna entre P1 e P2 (`chooser`); online o clique nas cartas não vale (só controle/teclado).
- Se ninguém puder pagar ou o grupo desistir, a tentativa termina normalmente.

## v4.29.0 — Outro Lado: rodada 5 — coop local em tela dividida, Local x Online e a câmera nas paredes

### Adicionado
- Entrada do Outro Lado (`flow.toEntry`, estado `pveentry`): LOCAL x ONLINE; `toPlayers` (`pveplayers`): SOLO x MULTIPLAYER.
- Coop local: `Dungeon` aceita `coopDef`/`coopTeam`/`coopProfile` e cria o P2 (lutador índice 2) com `rig2` próprio (`noOcclusion`), `views[]` por jogador (trava, setas, aviso de interagir em camadas 1/2) e render em tela dividida cima/baixo (`setScissor`). Cutscene do chefe, saída e fim em tela cheia.
- `opponentOf` no coop: o inimigo mira o jogador vivo mais perto (fixa 2,5 s); `revivePlayers` (35% da vida) ao limpar a sala ou trocar de módulo; fim só com os dois caídos.
- 3º lugar de input (`PLAYER_DEVICES[2]`, só a CPU do inimigo); `InputManager.coopLook` dá câmera, R3 e interagir ao P2.
- Seleção `pvecoop` (os dois escolhem); `newAttempt({ coop })`; recompensa do chefe para os dois personagens.
- HUD: `pveHud.setEnemy` (barra do inimigo) e `setSplit` (linha da divisão); classe `pve-coop` com os painéis no pé de cada metade.
- Online etapa 1: `LanScreen({ mode })`, `openOnline('pve')`, salas anunciadas com `mode: 'pve'` (`Lobby.store`) e filtradas por modo; código de modo errado é recusado; conectado → `flow.onlineRoom` (sala de espera).

### Alterado
- `CameraRig.keepInside`: a câmera desliza pela parede (fica no retângulo do jogador), móveis altos a puxam para perto, a distância volta devagar, desce ao ombro quando aperta e `camFade` deixa o personagem translúcido.
- Barra de sanidade com o rótulo "segure C" no teclado; a dica de início cita a tecla.

## v4.28.0 — Outro Lado: rodada 4 — mira travada, teclas simples, gavetas, cadeados e a escada

### Adicionado
- Trava no inimigo no Outro Lado (`Dungeon.updateLock`, `pickLock`, `lockCandidates`): a câmera fica atrás do jogador olhando o alvo (`chaseTarget` devolve `yaw`/`lockRate`), o corpo mira nele, troca com um movimento rápido (flick) e liga/desliga com F, o botão do meio ou R3 (`look.lockBtn`). Marcador vermelho no chão.
- Teclas simples no teclado + mouse (`InputManager.freeLook`, jogador 1): `quick1`–`quick5`, `quickSp`, `grab`; `Fighter.tryQuick`; a HUD mostra as teclas (`f.simpleKeys`).
- Botão de interagir (`interact`: E no teclado, B no controle), só fora da luta; o aperto é consumido e não vira defesa nem golpe (`Dungeon.updateInteract`). Aviso flutuante (`InteractPrompt`).
- Gavetas (`Drawer` em `roomDoors.js`, `drawers` nos módulos): chave, moedas (`locks.drawerCoins`) ou nada.
- Portas com cadeado (`rollLock`, `RoomDoor` com `padlock`/`unpad`): a chave numa gaveta da mesma sala; as chaves ficam no bolso (`pveHud.setKeys`). Atrás: sala de baús (`vault`, todos os baús com sorte) ou de monstros que solta um baú de sorte ao limpar. Ajustes em `locks`.
- `rollChest(rng, depth, luck)`; baús com `manual` e `luck`.
- Escada do hall subida andando: `World.groundAt` (o `Fighter.integrate` pousa nele e grava `groundY`), `Dungeon.setupStairs`/`updateStairs` (só sobe pelo pé), patamar com a porta do 2º andar (`landing`). A câmera acompanha `groundY`.
- `stunNpc` (`abilities.js`): inimigos menores ofuscados ficam parados (`World` pula o `update` com `stunT`).
- Setas flutuantes 3D (`makeArrow`/`aimArrow`) e brilho nas portas destrancadas.

### Alterado
- `photoFlash` atordoa em área: o adversário (`stun`, até 1,2 s) e os inimigos no cone (1,4×), nos dois modos.
- Monstros misturados do time (`pickClones`, `nextClone`).
- Salas sem nome nem contagem; ritmo: depois de uma sala de 4 há uma porta mais leve; baú garantido antes do chefe; baús mais frequentes.
- Câmera: `near` 0,12 em 3ª pessoa e margem de parede 0,35 (não atravessa as paredes).
- `mansao.glb`: papel de parede, móveis e luzes no jantar, infantil e Olhos.

## v4.27.0 — Outro Lado: rodada 3 — caminhos com escolha, portas, câmera livre e o time como assistência

### Adicionado
- ROTAS com escolha no Outro Lado (`src/pve/dungeons.js`): cada sala é um módulo (`modules`), com área andável própria, entrada, saídas `left`/`front`/`right` (o hall tem a escada `up`) e lugares de baú.
  - `rollRouteLength`: de 3 a 5 salas até o chefe (+1 a partir da profundidade 3).
  - `rollExits` sorteia a sala atrás de cada porta e de 2 a 4 monstros. A escada sempre troca de andar, sempre há pelo menos uma porta com luta, e depois da última sala sobra uma porta só: a do chefe.
  - Vale para toda dungeon nova: basta definir os `modules`.
- Portas entre as salas (`src/pve/roomDoors.js`):
  - trancadas durante a luta;
  - abrem com o jogador perto e fecham quando ele se afasta;
  - uma placa com a sala e os monstros (↑/↓ quando troca de andar);
  - atravessar escurece a tela e monta a próxima sala;
  - a porta de entrada se fecha atrás de quem chegou.
- Salas novas na `mansao.glb`: Sala de jantar (PROPOSTA), Quarto infantil e Quarto dos Olhos de Gatos (2º andar, a porta emperrada com 18 olhos).
- Setas no chão: azul para o baú (opcional) e amarelas para as portas abertas, a recompensa e a saída.
- Câmera livre em 3ª pessoa: mouse (pointer lock) e analógico direito (`InputManager.freeLook`, `PlayerInput.look`). `CameraRig.keepInside` anda pelo chão andável e para antes das paredes; perto delas, a câmera desce para o ombro.
- Mira pela câmera: `Fighter.aimYaw` e `aimTarget` (cone de mira) no movimento, nos golpes e nos tiros.
- Equipe no Outro Lado: o menu SOZINHO / EM EQUIPE, o time como assistência (`noSwitch`), e Devorados e cópias sorteados no time.
- Dificuldade em ciclo: `advanceAfterClear`, `diffLabel`, `heatScale` (Difícil +N: +20% de vida e dano cada).

### Alterado
- Os olhos das paredes viraram frestas que abrem à frente do jogador, espiam e fecham (`ambience.js`).
- Espreitador:
  - Modelo: a massa de 70 olhos no alto da cabeça, a boca larga de dentes tortos com um olho dentro, a baba e os pés deformados.
  - Kit: foge e só dá a Pancada encurralado (`updateShy`); escondido, drena a energia; o olhar deixa o jogador mais lento; elemento Conhecimento.
- O número de monstros por sala vem da porta escolhida (o Devorado + N−1 cópias), e os baús são um por sala, mais prováveis nas salas com mais monstros.
- Tremor de tela suave, em ondas que decaem, em vez de um sorteio por quadro (`CameraRig`).
- A biblioteca perdeu a estante do meio, para dar lugar à porta.

## v4.26.0 — Outro Lado: rodada 2 — câmera, moedas e o Espreitador refeito

### Adicionado
- Outro Lado — câmera em 3ª pessoa: `CameraRig.chase` / `updateChase`, atrás do ombro. Na luta mira o inimigo; explorando, segue a direção do movimento. O movimento é relativo à câmera.
- Cutscene de entrada do Espreitador (`src/pve/espreitadorIntro.js`), feita a partir da wiki. Etapas:
  - o "2:11" e as luzes falhando;
  - o olho grande tremendo e chorando na fresta;
  - os olhinhos acendendo e as pupilas se multiplicando;
  - os dedos saindo pela fresta;
  - a porta estourando e ele rastejando para fora tremendo;
  - o rugido.

  Dá para pular.
- Aviso do bote: o armário por onde ele vai sair acende os olhos amarelos antes (0,95 s; ×1,3 no Fácil e ×0,75 no Difícil).
- Vibe de terror (referência: Doors), em `src/pve/ambience.js`:
  - eventos ao acaso: batidas, sussurros, passos, rangidos e luz falhando;
  - o coração batendo com a vida baixa ou com o chefe escondido;
  - olhos nas paredes dos corredores, que abrem e seguem o jogador.

  Sons sintetizados novos: `knock`, `whisper`, `heartbeat`, `buzz`, `steps` e `scare`.
- Moedas e baús: 4 baús por dungeon (`pickups.js Chest`). Cada baú sorteia moedas (50%), vida (28%) ou experiência (22%). O chefe dá 30 moedas.
- Personagens bloqueados no Outro Lado (`src/pve/unlocks.js`, PROPOSTA de ordem e preço):
  - começam liberados Chico, Dara, Guizo e Lírio;
  - os outros custam de 60 a 700 moedas, na tela DESBLOQUEAR PERSONAGENS (`unlockScreen.js`);
  - a seleção mostra o cadeado.
- Cronômetro de speedrun no HUD e o recorde por dificuldade (`campaign.bestTimes`).
- Telas no estilo da loja do Vampire Survivors: o painel de subida de nível e a loja de melhorias permanentes (`treeScreen.js`), com comprar e devolver.
- Melhorias permanentes novas: velocidade, recuperação, crescimento (experiência) e sorte (drops).

### Alterado
- O ESPREITADOR refeito do zero (`tools/blender/char_espreitador.py`), sem o corpo humano base.
  - Forma: metaballs num esqueleto próprio, já agachado (quadril baixo, joelhos dobrados, corcunda e braços até o chão).
  - Detalhes: a massa de olhos no alto da cabeça, as mãos grandes com dedos de galho, a barriga caída e olhos no ombro, no braço e na coxa.
  - Tamanho 1,12 → 1,28.
- Salas mais longas: Devorado com 820 de vida e 80% do dano; 2 cópias na sala e 3 na biblioteca.

### Corrigido
- Golpes com `actives`, mas sem `active`, derrubavam a cópia do Dante (`npcs.js`).

## v4.25.0 — Outro Lado: o Território do Espreitador

### Adicionado
- OUTRO LADO (modo PvE, TODO §3–§14): a opção do menu principal abre (sai o selo EM BREVE) com a 1ª fase jogável.
  - Hub do modo: continuar, nova tentativa (com confirmação), melhorias permanentes, reiniciar campanha e apagar só os dados do Outro Lado.
  - Dificuldade Fácil, Normal e Difícil (CPU do chefe e dos Devorados, vida, dano e chance de cura).
  - Mapa novo, a Mansão Endiabrada (`tools/blender/arena_mansao.py`): hall com o relógio parado às 2:11, sala de estar, corredor, biblioteca, quarto principal e o corredor de saída, com a goteira ao fundo.
  - Os DEVORADOS (cânone, Cópia Observada): cópias cinzentas do lutador do jogador, com olhos amarelos e lágrimas. Cada sala de luta tranca as portas até cair o Devorado e as cópias menores. Os inimigos menores podem deixar cura.
  - A fresta do corredor: os olhos do Espreitador espiam, e quem olha para a fresta perde Sanidade (ensina o Drenar Energia antes da luta).
  - O chefe, O ESPREITADOR, com modelo próprio (`tools/blender/char_espreitador.py`): Pancada, Drenar Energia pelo olhar, Correr pelas Frestas (os armários do quarto), o bote de dentro do armário, Cópia Observada e Fortalecer. O Enigma de Medo: bater nos armários os TRANCA; sem fresta aberta ele fica apavorado, lento e vulnerável.
  - A recompensa surge onde o chefe caiu; ao pegar, a porta de saída se abre e a câmera acompanha o personagem pelo corredor.
  - Experiência e níveis da tentativa, com 3 cartas de melhoria a cada nível (10 melhorias, 4 sinergias).
  - Progressão permanente por personagem: cada chefe derrotado dá +1 nível e +1 ponto, gastos numa árvore de vida, dano, defesa e sanidade.
  - Profundidade: com uma dungeon só, a saída leva de novo ao Território, mais forte (+12% de vida e dano por nível).
  - HUD do modo: a vida do jogador no canto inferior esquerdo, a barra do chefe no centro do alto, o lugar e o objetivo, nível e experiência, as melhorias e as sinergias.
- Salvamento separado (`veu_pve_v1`), com versão e proteção contra dado corrompido; a morte apaga só a tentativa; o ponto permanente não duplica.
- `docs/outro-lado-playtest.md`: as notas da 1ª rodada de testes e o que mudou por causa delas.

## v4.24.1 — Ajustes: Existida e o mangual da Carina

### Removido
- Beatrice Existida: o especial "Lembra de Mim" da v4.24.0. Ele foi apresentado como canônico, mas "Lembra de mim" é só uma fala dela, e o dono já tinha decidido que a Existida não tem especial (um Existido não tem técnicas, só instinto). O HUD esconde o espaço vazio.

### Corrigido
- Carina: a física da corrente deixava a bola para trás no golpe. Agora, enquanto ela ataca, a corrente é puxada para o prolongamento do cabo e a bola chicoteia para a frente com o arco do braço. Vale também para o nunchaku.
- Carina: os chutes do combo (Chute circular, Rasteira, Chute lateral, Chute aéreo e o contra-ataque do Fintar) viraram golpes com o mangual.
- Carina — Todos os Leone: o nunchaku ia para as costas a cada golpe (o mesmo bug do mangual, corrigido na v4.24.0). A forma Leone segue com os chutes de artes marciais.
- O `npm run check` estava quebrado desde a v4.24.0 (lia a pegada da Carina, que saiu).

## v4.24.0 — Existida com a barra de Existência

### Alterado
- Beatrice Existida: sem Sanidade. A barra de vida vira a EXISTÊNCIA, em amarelo de Conhecimento, e as habilidades são pagas com ela. Mais lenta (4,4 m/s) e, ao apanhar, corre 1,8× por 3,5 s (ACESA).
- O HUD esconde o espaço de tiro e de especial de quem não tem.

### Corrigido
- Carina: o mangual ia para as costas a cada golpe e ela batia de mão vazia.

## v4.23.0 — Carina: Mercenária e Atletismo

### Adicionado
- Carina ganha o que faltava das habilidades do cânone (wiki "Carina Leone"), como passivas:
  - Mercenária (2 PE para duas ações principais no primeiro turno): a primeira habilidade do round abre 2,5 s em que a próxima não entra em recarga.
  - Treinada em Atletismo (caída, levanta como ação livre): fica metade do tempo no chão.
  - Afinidade com Precognição (+5 de defesa contra ataques de longo alcance): −12% de dano de tiros e projéteis. A forma Todos os Leone mantém as três.
- O Saque Rápido já estava no □ (a Glock sai do coldre quase na hora). Os números são PROPOSTA.

### Corrigido
- HABILIDADES.md: a passiva Resistente dizia sempre "dano físico", mesmo quando também valia contra tiros.

## v4.22.0 — Beatrice: Merintofobia e a Existida acesa

### Adicionado
- Beatrice ganha o que faltava do cânone (wiki "Beatrice Portinari"):
  - Merintofobia (o medo de ser amarrada, desde a noite presa no depósito do orfanato): cordas, raízes e veias a prendem 40% mais tempo. Vale também na Existida.
  - A Existida ACESA ("quando é atacada, os olhos e a boca brilham em amarelo, agressiva e forte"): cada golpe recebido acende o brilho e dá 3 s de golpes 20% mais fortes.
  - As foices de jardinagem (Arsenal: carregadas, nunca usadas) saindo da bolsa de couro.
- Os números são PROPOSTA.

## v4.21.0 — Rubens: Surto Temporal e Relógio de Arnaldo

### Adicionado
- Rubens ganha o que faltava da ficha do cânone (wiki "Rubens Naluti", Habilidades e Itens Amaldiçoados), como passivas:
  - Surto Temporal ("uma vez por cena, uma ação padrão adicional"): a primeira habilidade do round abre 2,5 s em que a próxima não entra em recarga.
  - Relógio de Arnaldo (rola de novo o dado que caiu 1): uma vez por round, a Mira de Elite que erra (acaba o alcance ou bate numa parede) volta na hora, com a sanidade devolvida menos 5.
  - Salto Fantasma como reação (o ritual pode sair como reação pagando mais PE): sem carga de esquiva, o L2 apanhando vira o Salto Fantasma. Custa o ritual + 6 de sanidade, coloca o ritual em recarga e leva mais longe que a Substituição.
- Os tempos e custos são PROPOSTA.

## v4.20.0 — As armas da Carina

### Alterado
- Carina: as quatro armas refeitas no Blender pelas artes e pelo texto da wiki ("Carina Leone", Arsenal), no lugar das primitivas em código. O MANGUAL de Marco Leone (cabo verde-acinzentado com os colares de bronze, a corrente preta longa e a bola de espinhos que é uma cabeça de leão com a juba em pontas); a GLOCK SILENCIADA dourada (silenciador comprido e a cabeça de leão no pé do cabo); o NUNCHAKU dourado da forma Todos os Leone ("LEONE" gravado nos bastões, as faixas escuras e a cabeça de leão em cada ponta); e a FACA de arremesso (lâmina em folha, cabo enrolado e o medalhão do leão, forma PROPOSTA: a wiki não tem arte dela).
- O mangual e o nunchaku balançam de verdade: a corrente é simulada elo por elo, a bola do mangual atrasa e gira no golpe e o segundo bastão do nunchaku fica solto.
- A Glock fica no coldre da coxa direita e passa para a mão só no tiro. Na Faca no Olho a faca sai do cinto e é lançada da mão esquerda (o projétil é a faca nova).
- Pose de guarda própria com o mangual (a bola pende na altura da cintura, não na frente do rosto).
- A Glock ficou dourada como diz o texto da wiki; a arte oficial a mostra preta.

## v4.19.1 — Força D completa

### Alterado
- Força D: Dante e Erin (da Força D no cânone de Desconjuração) entram na ligação, a pedido do dono. Vale com 3 dos 6 (Arthur, Kaiser, Joui, Dante, Erin e Beatrice) e aparecem todos. Coreografia: Kaiser, Joui, Dante (Espiral de Lodo), Arthur, Erin (granada Supernova, explosão no pé do alvo) e Beatrice; o especial passou de 5,2 s para 6,4 s.
- Dante, Arthur e Joui sozinhos continuam sendo a Equipe Abutres (a de Calamidade), que ganhou prioridade no desempate.

### Corrigido
- O especial da Força D travava quando a Beatrice entrava na cena (o rastro do Orpheu buscava a cabeça do alvo pelo método errado). Vinha da v4.19.0.

## v4.19.0 — Beatrice Portinari

### Adicionado
- Beatrice Portinari (Força D, Conhecimento), a recruta de Desconjuração, com o Orpheu no ombro. Corpo a corpo com o canivete; □ Balestra (virote preto, mira de ponto vermelho, dois LEDs nas pontas). Habilidades: Voo do Orpheu (o urutau sai do ombro, voa em volta da cabeça do adversário, bica 3 vezes, deixa cego e volta), Virote Silencioso (tiro mais forte de longe), Vício em Adrenalina (joga a moeda: CARA bate mais forte e anda mais rápido; COROA bate ainda mais forte e recebe mais dano) e Clarão dos LEDs (cega quem está olhando). Passiva: ótima balesteira, mais dano de longe.
- Especial Menina do Pássaro (o apelido que o Sidney deu a ela): virotes, o Orpheu e o canivete, fechando com "Saber tudo é perder tudo."
- Transformação: a EXISTIDA, pelo cânone dos Existidos (wiki "Existidos e Lembrados"). A pele se enche de textos, os olhos ficam brancos e o Orpheu some. Ela fica lenta e frágil, sem armas, sem rituais e sem especial: Pancada (golpes fracos e hesitantes), □ Não Vai Embora (fica parada; quem bate nela de frente é agarrado), Olha pra Mim (o toque zera a sanidade, faz definhar e MATA quem está com 30% da vida ou menos) e Brilho Enlouquecedor (paralisa quem olha e ativa o Fortalecimento Paranormal: 50% mais dano e 30% menos dano recebido por 8 s). O Pingente da Lua Dourada segue com ela (resiste a Conhecimento). O toque que mata e os números são PROPOSTA.
- Modelo novo conferido no Blender pelo MCP: 1,69 m, cabelo castanho ondulado na altura dos ombros, sardas, casaco escuro aberto com a gola de pelo, corpete, pingente da lua, bolsa transversal e sandálias. Orpheu (urutau pardo de olhos amarelos) no ombro esquerdo e em voo. Retrato, falas de vitória contra o elenco todo, voz de apresentação e cena de agarrão.

### Alterado
- Especial da Força D: a Beatrice entra com um virote (o Orpheu marca o caminho). A ligação da Força D agora é Arthur, Kaiser, Joui e Beatrice. Dante e Erin, também da Força D no cânone, ainda ficam de fora (pergunta ao dono no TODO).

## v4.18.0 — Rubens Naluti

### Adicionado
- Rubens Naluti (Equipe Abutres, Energia), o paramédico e atirador da equipe. Corpo a corpo com o Martelo de guerra (as pancadas do Balu, mais curtas e rápidas); □ Glock Silenciada (Saque Rápido, dois tiros abafados). Habilidades: Salto Fantasma (some numa estática elétrica rosa, azul, ciano e verde e reaparece), Queima-Roupa (só colado no alvo; de longe nem saca), Mira de Elite (tiro certeiro e forte), Tratar Ferimentos (cura por 3 s) e Coração Pulsante (metade do dano por 4 s). Passivas: rituais de Energia mais fortes e o Amuleto contra Sangue.
- Especial Pelo Johnny (pedido do dono): saca a Glock, some na estática, reaparece nas costas atirando duas vezes e fecha com a faca de combate do Johnny Tabasco, que deixa sangrando. Despertar Ainda Bem Que Eu Voltei: os cabos do peito acendem, ele se cura e as recargas ficam mais rápidas até o fim do round. Números são PROPOSTA.
- Modelo novo pela arte de Calamidade, conferido no Blender pelo MCP: 1,56 m, cabelo branco cacheado no coque, jaqueta preta curta aberta, camisa mostarda com o decote em V mostrando a cicatriz e os cabos que brilham, colar com o flamingo, flanela verde amarrada na cintura, a bainha da faca do Johnny na coxa e o amuleto de Sangue. Retrato, falas de vitória por palavras-chave contra o elenco todo, voz de apresentação e cena de agarrão.

### Alterado
- Especial dos Abutres: o Rubens fecha a coreografia com o Salto Fantasma e a martelada. A Equipe Abutres está completa.

## v4.17.1 — O Grimório de Arnaldo

### Alterado
- Carina (Todos os Leone) — Grimório de Arnaldo com animação própria: ela traz o livro fechado para a frente, abre a capa e as páginas pretas mostram os sigilos dourados acendendo, com o brilho e as runas girando em volta; os olhos ficam brancos, ela ergue o grimório aceso acima da cabeça e grita.
- Grimório de Arnaldo sem distância (pedido do dono): altera a realidade, então atinge o adversário em qualquer lugar do mapa (antes só até 7 m). O clarão dourado cai em cima do alvo.

### Registrado
- TODO: melhorar o uso e os modelos das armas da Carina (mangual, Glock, facas, nunchaku).

## v4.17.0 — Carina Leone

### Adicionado
- Carina Leone (Equipe Abutres, Conhecimento). Forma normal: o Mangual de Marco Leone no corpo a corpo, a Glock Silenciada no □ e as habilidades Faca no Olho (atordoa e sangra), Bater e Reposicionar (quebra a guarda e rola para as costas do alvo, que fica desprevenido), Furtividade e Pergaminho da Pertinácia (energia, armadura e esquivas). Fintar no ← revida quem ataca. Passivas: Precognição e resistência a Energia. Especial: Dança dos Leone.
- Transformação Todos os Leone (cânone de Calamidade): a mecha ciano e os olhos ficam dourados, ela troca o mangual pelo nunchaku dourado e as habilidades ficam mais fortes. Ganha o Grimório de Arnaldo: os olhos ficam brancos, o grito derruba quem estiver perto, deixa surdo, toma as habilidades do adversário por 5 s e a deixa muito mais forte por 8 s. Números são PROPOSTA.
- Modelo novo pela arte de Calamidade, conferido no Blender pelo MCP: cabelo castanho longo e solto repartido no meio, mechas ciano que viram douradas, gola alta, jaqueta de couro cinza com o brasão Leone nas costas e mangas justas dobradas, cinto com facas e correntes, coldre na coxa e botas altas, retrato, falas de vitória contra o elenco todo, voz de apresentação e cena de agarrão.

### Alterado
- Especial dos Abutres: a Carina fecha a coreografia com o mangual e a Glock. Falta o Rubens.
- Correção de cânone: Thiago e Liz são da Equipe E, não da Força D. O especial da Equipe E fica para quando existirem as versões jovens de Arthur, Kaiser e Joui (Segredo na Floresta).
- A tag curta da organização e as falas trocaram "Ordo" por "Ordem" (o nome completo "Ordo Realitas" continua).

## v4.16.0 — O Kit da Aghata

### Adicionado
- Aghata — Identificação Macabra (passiva nova, PROPOSTA a partir do cânone): não perde o rastro de quem fica furtivo (o "Shhh..." da Jae) e vê o sigilo de Sangue debaixo do verdadeiro no meio de clones e ilusões (Multiplicação do Anfitrião, Embaralhar do Dante).
- Aghata — o grimório: abre o livro na mão esquerda no Descarnar e na Leitura de Rituais.

### Alterado
- Aghata — Colar Banhado em Sangue pelo cânone: −20% de dano de Sangue (antes −15%), sangramento +15% (antes +10%) e os rituais de Sangue dela +10%.
- Aghata — Passagem de Conhecimento Expandido (despertar) pelo cânone: na troca de corpos cada mente usa as habilidades do corpo novo, então até o fim do round o □ dela vira o do adversário.

## v4.15.1 — Descarnar

### Alterado
- Descarnar (Aghata, e também a habilidade do Juan, as assistências e o agarrão) refeito pelo cânone: é um ritual de Sangue que arranca a pele e derrete a carne. O alvo fica em carne viva, a pele sai em pedaços, a carne pinga com vapor de sangue e forma uma poça no chão. Saiu o raio que ligava a mão ao alvo. Dano e tempos iguais.

## v4.15.0 — Aghata Remodelada

### Alterado
- Aghata refeita na técnica nova de modelagem, pelo visual da Hexatombe: cabelo preto bagunçado até os ombros com a mecha vermelha, gola alta vermelha com o símbolo ritual, jaqueta preta de couro com bordas e bolsos vermelhos e as mangas puxadas, correntes de elos de verdade (pescoço e cinto), duas pulseiras, a camisa xadrez amarrada na cintura caindo do lado esquerdo, jeans rasgado nos joelhos e coturnos vermelhos de cadarço. Mesmas juntas: golpes e poses não mudaram.

## v4.14.1 — A Plateia em Toda Arena

### Alterado
- A Plateia (Anfitrião e Amphitruo): fora do Palco do Anfitrião, onde não há arquibancada, 8 Anfitriões se materializam em volta da arena num clarão neon, batem palmas durante a cena e somem depois. Ele se curva para o que está mais perto da câmera.
- O marcador de dano do combo não segue mais o lutador: fica travado no canto da tela de quem bate (P1 à esquerda, P2 à direita), como no Naruto Storm.

## v4.14.0 — Contagem de Acertos

### Adicionado
- O marcador de dano do combo agora mostra quantos acertos o combo tem ("5 ACERTOS"), a partir do segundo, nos 13 idiomas.

### Corrigido
- Envelhecimento (especial do Deus da Morte): esquivar ou usar a Substituição durante o preparo agora escapa sempre. Antes só escapava se a invulnerabilidade da esquiva ainda durasse no instante do agarrão.
- Quem não tem sanidade (Erin em Nome do Caos) perdia vida sem aviso ao gastar sanidade fora das habilidades; agora aparece o sangue e o número.

### Conferido no jogo
- Finalizadores de combo, △ + ○ dos 39 contra a defesa, anti-repetição, projéteis dos 39 (livre e na defesa), interrupção do especial no preparo, especiais do Anfitrião, as 37 transformações (cinemática, câmera, vitória na forma) e os custos de sanidade de todos os kits.

## v4.13.1 — Balanceamento com os 39

### Alterado
- Balanceamento geral com o elenco inteiro (39 lutadores, 4 rodadas de CPU contra CPU com todos os pares). Mais fracos: Juan (o Portador), Anfitrião, Amália, Chico, Dara e Estrangeiro. Mais fortes: Gaius, Amigo, Aguiar, Joui, Nubi, Lírio, Aghata, Cristino, Dalmo, Balu, Cristopher, Dante, Veríssimo, Guizo, Labirinto, Henri, Xande, Jae e O Diabo.

### Corrigido
- As formas que dá para escolher na seleção (Juan, o Portador; o Anfitrião e o Deus da Morte das Relíquias) usavam o ajuste de balanceamento do personagem de origem — o Anfitrião ficava com o reforço do Gaius. Agora cada uma tem o seu.

## v4.13.0 — Esquiva nos Especiais

### Corrigido
- Especiais de investida (Carniçal, Lírio, Morato e os outros que correm até o alvo): esquivar ou usar a Substituição durante a investida agora faz o especial errar. Antes a investida perseguia e pegava o alvo no meio da esquiva.

### Conferido no jogo
- Esquiva contra combos e projéteis, Substituição (atordoado, no meio do combo e com os 39), levantar (ataque, pressão e loops), buffer de comandos, agarrões dos 39, defesa contra agarrão e quebra de guarda, e os 39 especiais.

## v4.12.1 — Os Cinco Armados

### Alterado
- Especial em equipe de Os Cinco: o Chico emenda o pulso do scanner com uma rajada da Mac-10, e a Dara abre com a submetralhadora antes da Lanterna UV e do soco.

## v4.12.0 — Especiais pelo Cânone

### Alterado
- Carniçal: especial **Controle Absoluto** — o Símbolo Espiral acende, o alvo chora Lodo e se golpeia três vezes com os próprios golpes, e leva uma Garra da Morte; sai lento (wiki: a morte de Brúlio).
- Morato: especial **Pelos Cinco** refeito — duas rajadas da metralhadora, engole a Calabresa e investe de ombro (Sinais do Outro Lado, ep. 7).
- Chico: especial **Mina de Proximidade** — granada de fumaça, mina no pé do alvo, rajada da Mac-10 e a explosão; o alvo sai cego (wiki: Interflorado e Fummu).
- Dara: especial **Racha** — ela pega a van dos Cinco, atropela, dá o cavalo de pau e volta na segunda passada.
- Nomes e números são PROPOSTA de jogo.

## v4.11.0 — Submetralhadoras dos Cinco

### Adicionado
- Dara: □ **Submetralhadora** — a arma do cânone, vermelha e azul, com o chaveiro de carinha sorrindo (rajada de 5 tiros).
- Chico: □ **Mac-10** — a arma do cânone, com o detalhe vermelho em cima e os dois fios coloridos ligando a arma a ele (rajada de 6 tiros).

### Alterado
- Dara: a Lanterna UV passou para △ + □. Chico: o Pulso do Scanner passou para R2 + × (comandos: PROPOSTA).

## v4.10.0 — A Jaqueta de Veríssimo

### Adicionado
- Veríssimo: a **Jaqueta de Veríssimo** aparece no modelo ao usar a habilidade — aviador, couro marrom, gola forrada de pele branca (wiki "Itens Amaldiçoados").
- No despertar **Líder da Ordo Realitas** ele veste a jaqueta até o fim do round, com as costuras acesas no azul da Ordo (PROPOSTA visual).

### Atualizado
- Página Sobre: fotos de perto e sem HUD de uma luta em Tipora (Arthur × Kaiser) e da Hipnose Espiral (Carniçal × Joui).

## v4.9.1 — Retoques

### Atualizado
- Página Sobre: foto de perto do Carniçal usando a Hipnose Espiral em Joui (Tipora), e o texto de "Especiais e invocações" cita o Carniçal.
- Comentários do modelo do Carniçal explicam o ajuste de contraste (sem mudança no modelo).

## v4.9.0 — O Carniçal Desperta

### Adicionado
- Carniçal: a passiva canônica **Olhar ao Agressor** pode fazer um agressor corpo a corpo entrar em transe e se golpear uma vez (parâmetros de jogo marcados como PROPOSTA).
- No **Instinto Mortal**, o □ troca Lágrimas de Lodo pela **Investida Mortal**, derivada do golpe de Raziel e ajustada para Morte.
- Ilha de Tipora: casas adicionais no vilarejo e a Torre do Sino como marco visual (geometria da torre — PROPOSTA).

### Atualizado
- Modelo do Carniçal com cristas menos contrastadas e peitorais mais discretos.
- Página Sobre com capturas atuais da seleção, de uma luta em Tipora e da Hipnose Espiral, em WebP de 800 px e 480 px.

## v4.8.0 — Especiais em Equipe

### Adicionado
- Força D: cena própria com Cinerária do Kaiser, corte de Joui pelas costas e avanço de Arthur com a Arma de Sangue.
- Os Cinco: coreografia coletiva com ordem e metralhadora de Morato, scanner/farol de Chico, skate de Xande, Magras e Leonora de Lírio, câmera de Guizo e lanterna UV de Dara.
- Abutres: primeira coreografia de grupo com Dante, Balu, Joui e Arthur; Carina e Rubens entram quando estiverem disponíveis no elenco.
- Close nos impactos das coreografias: câmera mira atacante e alvo sem aproximar os golpes à distância.

### Corrigido
- Van dos Cinco: colisão na Ilha de Tipora agora permite atravessar objetos de cenário sem ultrapassar os limites da arena.
- Com uma assistência, LB/RB chamam o mesmo parceiro e qualquer direção do analógico direito o seleciona; equipes com duas assistências mantêm os comandos separados.
- Especial em equipe restaura armas e props temporários ao fim/cancelamento da cinemática.

### Documentação
- TODO registra o pedido da jaqueta visível na habilidade e na transformação de Veríssimo.

## v4.7.1 — Transmissão nos Cinco

### Alterado
- Dara: elemento corrigido de Medo para Transmissão; o elenco, as cores e os filtros usam o elemento registrado no roster.
- `sobre.html`: Transmissão passa a listar Dara, além de O Estrangeiro e os Alheios.

### Atualizado
- Página Sobre: novos retratos em WebP para Dara, Chico, Morato e Carniçal, renderizados com os modelos atuais do jogo.

## v4.7.0 — Os Cinco Completos

### Adicionado
- `src/characters/chico.js` (Os Cinco, Energia) e `src/characters/morato.js` (Os Cinco, Conhecimento — PROPOSTA); modelos `tools/blender/char_chico.py` e `char_morato.py`; rostos `face_chico`/`face_morato`, `sleeve_chico`, `camo_morato`.
- `machineGun()` em `models/weapons.js` e `addMoratoProps` (metralhadora nas costas / na mão no □).
- Falas `VICTORY_CHICO`/`VICTORY_MORATO` com todo o elenco, vozes de introdução e `GRAB_SCENES`.
- HUD: `hostLine()` e `#hostline` (fala do narrador da arena no centro inferior, moldura própria).
- `glbArena.crowdPoint()` e `cheer(level, time, { clap })` (a plateia bate palmas).
- Cenário `tipora` (`tools/blender/arena_tipora.py` → `public/arenas/tipora.glb`, `TIPORA` em arena/configs.js, registrado em arena/index.js e no fim de `ARENA_ORDER`). Distâncias pelo mapa da ilha da wiki; texturas `dirt_cracked`, `wood_grey`, `roof_shingle`, `sea_tipora`.
- glbArena: `beacons` na config (facho de farol aditivo girando), `fireZones` (fogo pisável, `arena/fireZones.js`: 1/s, 2/s em criatura de Morte) e `dropColliders` (tira colisores antigos do .glb).
- Morato: a Larva da Fúria "Calabresa" virou `bloodBind` com `gut` (as Magras do Lírio) + `buff`; `applySelfBuff()` extraído do `selfBuff` em `combat/abilities.js` (o bloodBind aplica o buff logo depois do arremesso, acertando ou não).
- sobre.html: Os Cinco, Carniçal no Outro Lado, Acampamento Varminho e Ilha de Tipora nos textos.
- Carniçal: modelo novo sobre a base CC0 "Human Base Meshes" (Blender Studio) — `tools/blender/base_body.py` (`load_fitted`, `store_weights`/`read_weights`, `load_mesh`), crânio realista sem mandíbula (mandíbula de Lodo), fibras por deslocamento e decimação. `lib.py`: material Principled achado por tipo (nomes de nós traduzidos no Blender em pt-BR).
- Carniçal: kit frio — `spiralSelfHarm` (novo tipo em `combat/abilities.js`: transe, a vítima se golpeia `hits` vezes, depois `curseSlow`); □ Lágrimas de Lodo (`onHit.slow`) no lugar da Investida Mortal; `moveSpeed` 7,4. check-roster atualizado.
- Chico: △ + □ `vanDosCinco` (`type: 'stuntCar'`, `vehicle: 'van'`); `vanDosCinco()` em `combat/cristopherAbilities.js` (a van do Acampamento com a Dara ao volante, cabine de vidro).

### Alterado
- `hostAudience` (A Plateia): vira cena (`beginCinematic` + dois planos: arquibancada e o close do Anfitrião se curvando).
- `PalcoHost` usa `hud.hostLine` em vez de `hud.subtitle`.
- Passiva `revenge`: aceita `label`.
- Modelos refeitos: `char_carnical.py` (tronco pelo esqueleto, caveira esculpida), `char_dara.py`, `char_chico.py`, `char_morato.py`.
- Acampamento: a fogueira não bloqueia mais (sem `COL_cyl_fire`; zona de fogo no config).
- Repositório e site: `/arena-paranormal/` → `/veu-partido/` (vite `base`, `homepage`, 404, robots, sitemap, Sobre, `tools/release-notes.mjs`). Mantidos: `name` do package, appId, chaves de save, prefixo do online e nomes dos arquivos baixados.

## v4.6.0 — A Médica dos Cinco

### Adicionado
- `src/characters/dara.js` (Os Cinco, Medo): golpes de punho do Kian sem os sigilos (×0,95), □ `photoFlash` Lanterna UV, `healOverTime` Paramédico, `analyze` Olho de Investigadora, `selfBuff` Dedicação (`armor` 2, `refillDodges` 3), `cinematicCombo` Bolsa de Emergência, `awakenMode` Ninguém Fica Pra Trás.
- Modelo `tools/blender/char_dara.py` → `public/models/dara.glb`; rosto `face_dara`.
- Falas `VICTORY_DARA` (ida e volta com todo o elenco), voz de introdução e `GRAB_SCENES.dara`.

## v4.5.0 — O Palco do Anfitrião

### Adicionado
- Cenário `palco` (`tools/blender/arena_palco.py` → `public/arenas/palco.glb`, `PALCO` em arena/configs.js, registrado em arena/index.js e no fim de `ARENA_ORDER`).
- glbArena: prefixo `CROWD_` (grupos da plateia, fora da junção por material e da transparência automática) e `arena.cheer(level, time)`.
- `src/arena/palcoHost.js` (criado pelo Match só no `palco`): narrador na legenda (`config/palcoLines.js`), plateia por evento (encadeia `world.onHit/onKO/onTransform/onBattleDialogue`) e regras temporárias (buff `palcoRule`: `speedMult` 1,25, `takenMult` 1,25, `meleeOnly`; ou +30% de sanidade).
- arena_lib.finalize: `CROWD_` fica de fora da junção.
- 4.5.1: `PALCO_LINES.tease` (provocação a partir do 2º round) e `hostAudience` chama `world.arena.cheer(1, 3)`.

## v4.4.0 — O Carniçal

### Adicionado
- `src/characters/carnical.js` (Outro Lado, Morte): combo e especial com os clipes de garra do Raziel (`db_*`, sem sangramento), □ `dashStrike` Investida Mortal, △ + ○ `hypnoSpiral` (do Ferreiro), △ + × pounce (`boteRetalhador`), △ + L2 `heavyBlow` Pancada Poderosa (knockback 9), R2 + △ ordem do Juan (Comando), `awakenMode` Instinto Mortal.
- Passiva `closedBody` (`damageTakenMod`): `o.ballistic` (projéteis `bullet`/`sniper`/`pellet`, marcado em projectiles.js) × 0,4.
- Modelo `tools/blender/char_carnical.py` → `public/models/carnical.glb` (esqueleto de lutador; fonte `fonte/carnical_lutador.blend`); textura `face_skull_carnical` (caveira rachada, espiral emissiva).
- Falas: `VICTORY_CARNICAL` (ida e volta com os 33), voz de introdução em `introVoices.js`; `GRAB_SCENES.carnical`.
- check-roster: kit do Carniçal e elenco com 34.

## v4.3.0 — Fiel ao Cânone

### Alterado
- Nomes das Transformações (`awakening.name/banner`): kaiser → Angel of the Night, xande → Rei do Rolê, balu → O Urso Acordou, lirio → A Fúria da Leonora, nubi → O Chacal Desperto (efeitos iguais).
- `flowerRain`: `a.vsElement` multiplica o dano contra o elemento do alvo; Acácia `vsElement: { energia: 1.4 }`.
- Gal Sal: passivas `resistant` (melee 0,93) e `precognition`.
- `CpuController`: com o perseguidor caído/atordoado e a distância segura, o atirador atira (tiro carregado se houver) em vez de só fugir.
- `animStyles`: estilo para erin, kemi, amalia, aghata, fantasma, o_diabo, diabo, raziel, raziel_verdadeiro, amigo, labirinto, labirinto_elmo, estrangeiro.
- Kaiser: Dendrobium documentado como proposta (no cânone compartilha a visão).

## v4.2.0 — Véu Partido

### Alterado
- **Identidade: Arena Paranormal → VÉU PARTIDO** (nome público e visual; nada técnico mudou). Logo da tela inicial (`Screens.js` `.logo`: `.t-veu` + `.word` com `.wm` / `.wm.shard` recortados na diagonal e o SVG `.rift`; sem o subtítulo); `<title>`, `manifest.webmanifest` (`name`/`short_name`), `sobre.html` (título, og/twitter, JSON-LD com `alternateName`, FAQ, marca, h1, rodapé com a nota da transição), `404.html`, `menu.title` nos 13 idiomas, `productName`/`shortcutName`, `capacitor appName`, nome da release no workflow, `abrir-jogo.ps1` (procura `Partido</title>`), `gen-moves`.
- Ícones novos (`tools/make-icons.py`): `public/icons/*`, `electron/icon.png` e o favicon `public/veu-partido.ico` (antes `ordo-realitas.ico`, mantido no repositório). Imagens da página Sobre (título, seleção, og) refeitas.
- Seleção de personagens: fundo único dos retratos (`portraits.js`), no lugar da cor de cada equipe.
- **Mantidos de propósito:** URL/`base` `/arena-paranormal/`, nome npm, `appId com.romavitordev.arenaparanormal`, chaves `arena-paranormal:*` do localStorage, `ID_PREFIX` do online, nomes `Arena-Paranormal-*.exe/.apk`.
- Especial em equipe = cinemática da equipe inteira (`teamSpecials.teamScene`): abertura que dá para defender, nome da equipe → retratos → cada membro usa a própria habilidade (`sceneCast`) → todos juntos no golpe final; coreografia própria dos Mascarados (`CHOREO.mascarados`, Kemi como Fantasma, máscaras via `link.masks`). Dano em escada em `COMBAT.teamSpecial` (sem ligação 360/430, com ligação 420/500).
- Animações: camada de impulsos (`Animator.kick`, `LOCO_KICKS`), golpes polidos (`strikePolish`, finalizadores) e estilos por personagem (`anim/animStyles.js`).
- CPU atiradora: "janela de fuga" — abre distância quando o perseguidor está caído, atordoado ou preso.
- Auditoria de cânone 3.2 (Joui): a forma Shi no Kage perdeu os poderes da máscara (Olhar do Desespero → **Ataque Volátil**; passivas Decepar e Um por Um); descrição do Mateo com a cicatriz em espiral.

### Corrigido
- Menu principal em tela baixa (celular deitado): as 11 opções + 3 seções não cabiam; `max-height: 520px` divide em duas colunas (`.hlist:has(.hsec)`, `.hsec[data-g="practice"]` quebra a coluna), livre dos botões dos cantos.
- A tela de equipe (`#teamCut`) do especial da luta anterior reaparecia no começo da luta seguinte.

## v4.1.0 — Dupla Recomendada

### Adicionado
- Treinamento em equipe: o item TREINAMENTO do menu ganhou o submenu `solo:training` / `team:training` (chaves `training.solo`, `training.team` e descrições nos 13 idiomas); `Match.updateTraining` enche a Barra de Equipe (com `energy`) e zera a recarga das assistências (com `noCooldown`).
- `teamLinks.recommendNext(members, available)`: o próximo membro da ligação que tem todos os já escolhidos (`priority` > equipe de 3 > ordem do arquivo; respeita `order`).
- `SelectScreen`: equipe de 2 (confirmar de novo o segundo escolhido), `recommend()` move o cursor e marca o cartão (`.card.rec`), `duoLine` (chave `sel.team_two` nos 13 idiomas).
- `ChangelogScreen`: `NEWS_SHORT` itens e o botão Ver mais / Ver menos (`news.more` / `news.less`).
- Testes de `recommendNext`.

### Corrigido
- `projectiles.wall()`: o tiro usa os retângulos andáveis sem a folga de 0,6 m do `blocksPoint` (as balas passavam pela parede de 0,65 m do Bar Suvaco Seco); vale também para a rota da bala curva.

### Alterado
- `sobre.html`: especiais próprios, especial de equipe, Ordo Calamitas, transformações de Gaius e Celestine, tamanhos dos downloads.

## v4.0.0 — Cada Um com o Seu

### Adicionado
- `specials/headshot.js` (Amalia — Não Perde a Cabeça!).
- `cinematicCombo`: prep `bloodPact` (`selfCost`, `selfLabel`) e `nullify`; `dash.anim` / `dash.ride`; `chain.rope` / `chain.color`; `tether`; por golpe `call`, `shout`, `quake`, `pressure`, `behind`, `vanish`, `trap`, `xMark`, `consume`, `stream`; `endReaction.stun`; depois da cena `afterBuff`, `endBlind`, `orderAllies`, `selfHeal`.
- Especiais próprios pelo cânone: Balu, Lírio, Celestine, Gaius, Veríssimo, Ferreiro, Xande, Aguiar, Cristopher, Dalmo, Jae e Juan.
- `Fighter.useAbility`: buff `noAbilities` (+ `lockMsg`) trava todas as habilidades.
- `teamLinks`: `ordo_calamitas` (grupo, mín. 3) e `arnaldo_verissimo` (dupla com `order`); `LINK_MOVES` de Celestine, Gaius, Amalia, Veríssimo e Arnaldo.
- Clipe `bow_shot_up`; som `signalStatic`; `tools/blender/npc_sculpt_lib.py` (escultura das invocações).

### Alterado
- `amigoPowers`: `inkDissolve`, `inkTentacles` (Agarrão) e `bellToll` (`frenzyBite`) refeitos.
- `abilities`: `mindControl` (`struggle`), `fearGaze` (`resist`), `selfBuff` (`orderAllies`), `flowerRain` (`warn` + área marcada); `groundMark` exportado.
- `weapons.js`: `ironMace` refeita (maça de abas); `physicsRibbon` com normais desde a criação.
- CPU: "atirador alcançado" (empurra/foge com o golpe de empurrão do kit).
- Zumbis de Sangue e animais de tinta reesculpidos (`npc_zumbi_lib.py`, `npc_bicho_lib.py`).

## v3.53.0 — A Flecha

### Adicionado
- `characters/amalia.js` (Ordo Calamitas) + `tools/blender/char_amalia.py` → `public/models/amalia.glb`; `weapons.js` `amaliaBow` / `flameArrow`; `props.js` `addAmaliaProps` (o arco e a aura ciano); texturas `face_amalia` / `tabard_amalia`; visual `flameArrow`; clipes `bow_idle` / `bow_shot` / `bow_aim`; agarrão; falas (`introVoices`, cenas com Celestine, Gaius e Joui, vitórias contra o elenco); retrato da página Sobre.
- Projéteis: `longRange: { from }` — depois de `from` m de voo o tiro atravessa esquiva e defesa (Longa-Distância).
- Habilidade `altruism`; passiva `chaotic` (gancho novo `onHitDealt` em damage.js).
- Estrangeiro: `summonDoppels` (Homens de Terno) com o modelo `tools/blender/char_doppel.py` → `public/models/doppel.glb` e `weapons.js alienPistol`; `awakenMode.larva` (Incubar: a larva no adversário, eclosão com um Doppelganger).
- `sculpt_lib.cloth_pass` / `hair_pass`: o acabamento comum dos modelos antigos.

### Alterado
- `Fighter`: `energyRegenMult` 0 passa a valer (`typeof === 'number'`).
- `DanteClone` (`o.sludge`): `anim`, `sound`, `pitch` e `flash` configuráveis (os Homens de Terno atiram com a pose `point`).
- `deathShot`: `aimAnim` / `fireAnim` / `aimColor` e o tempo lento só com `a.slow`; `flowerRain`: `anim` / `sound`.
- CPU: o atirador lê a investida (a distância caindo > 7 m/s a menos de 5,5 m) e esquiva para o lado; `def.ai.style` força o perfil (Amalia: `zoner`).
- Esfinge: `SPHINX_CROUCH` (combat/beasts.js) — a postura agachada.
- Modelos: `char_magistrada.py`, `char_amigo.py`, `char_diabo.py` revistos; `despairMask` esculpida pelo desenho; Magistrada com a máscara 3D em `addMagistradaProps`.

## v3.52.0 — O Primeiro Anfitrião

### Adicionado
- `characters/gaius.js` (Ordo Calamitas) e a forma `forms/amphitruo.js` (`...anfitriao`, modelo `amphitruo`, `baseId: 'gaius'`); modelo `tools/blender/char_gaius.py` → `public/models/gaius.glb` (variante `amphitruo`); `weapons.js` `ironMace`, `amphitruoMask` (rosto esculpido por vértice com cor por vértice + `metalHand`); `props.js` `addGaiusProps` / `addAmphitruoProps`; texturas `face_gaius` e `tabard_amphitruo`; visual `ironMace` dos projéteis; agarrões `gaius` / `amphitruo`; falas do Gaius contra o elenco inteiro.
- `config/introVoices.js` (`VOICES`, `TEAM_REF`): as introduções montadas pela voz de cada um (ally / rival / any), com `voiceScenes` em dialogues.js (contrações e maiúscula no `polish`); o Anfitrião com voz própria em `introLines`.
- `config/hostLines.js`: `HOST_VICTORY`, `VICTORY_VS_HOST` (quem derruba o Anfitrião fala com ele) e as frases de combate que faltavam (`BATTLE_EXTRA` / `BATTLE_REPLIES_EXTRA`).

### Alterado
- `VERSION_GROUPS`: `['gaius', 'anfitriao']` (sai `['arnaldo', 'anfitriao']`); `anfitriaoReliquia = selectable(amphitruo, { id: 'anfitriao' })`.
- `damage.js`: `takenMult` 0 passa a valer (`typeof === 'number'`) — o Anular zera as habilidades.
- `dethroneHost` vale também contra o `amphitruo`; `victoryLines` não troca mais o Anfitrião derrotado pelo Arnaldo.
- Levitação: `cancel` derruba as pedras que não partiram; Kian/Magistrada `windup` 0,32, `interval` 0,09, `speed` 34, `recovery` 0,22.
- Saem `INTRO_HOOKS` / `INTRO_OPENERS` / `INTRO_REPLIES` (os moldes que só citavam a arma).

## v3.51.0 — Nada Pessoal

### Adicionado
- `characters/index.js`: `VERSION_GROUPS` e `versionsOf(i)` (versões do mesmo personagem).
- Seleção: `GRID` (um cartão por personagem), `posOf`, `home` (cartão) × `cursor` (versão), `cycleVersion` (LB/RB), `pageEdge` (←/→ na ponta da linha), `versionLine` (placa), selo `.vr`; chave `sel.hint_version` nos 13 idiomas (sai `sel.hint_page`).
- Habilidade `falseAlliance` (abilities.js) + `victim.allianceStance` em damage.js; `betray(f, n)` e a passiva `nothingPersonal` (passives.js; o buff `codigo` conta como traição); visual `deathSkull` dos projéteis; CPU: `falseAlliance` como reação.
- `props.js hatchetChain`: a corrente entre as machadinhas, refeita no `onBeforeRender`.
- `textures.js`: `calamitasSymbol` e `tabard_celestine`; `char_celestine.py`: busto, pano do peito (`tabard`), tronco feminino, cabelo prateado, cachecol mais baixo.

### Alterado
- Celestine: sai a Corrente Giratória e a Investida Rebelde; entram a Aliança Falsa e a Sala da Morte; o Código vira traição garantida; `backstab` → `nothingPersonal`; tagline e identidade pelo cânone.
- `chainHatchet`: a lâmina em metal escuro (os talhos azuis continuam acesos).
- `turnPage` fica só nas setas clicáveis do paginador.

## v3.50.0 — Chamas e Sinais

### Adicionado
- Clipe `est_idle` (`anim/charClips.js`): a pose parada do Estrangeiro (sai o `db_idle` do Diabo).
- `weapons.js energyFlames(color, { count, radius, height, width, lean })`: línguas de fogo em duas camadas somadas (`FLAME_GEO`, torno) que tremulam no `onBeforeRender` e ficam sempre de pé (o grupo desfaz a rotação do osso); presas na Celestine por `rig.attach` (cabeça, ombros, cotovelos, tronco, coxas e joelhos).
- Retratos da página Sobre para `raziel`, `juan_odio`, `celestine`, `deus_morte` e `anfitriao`.

### Alterado
- `tools/blender/char_estrangeiro.py`: Builder mais magro e alto, MÁSCARA esculpida (`head_pt`: superelipse por altura em `HP`, testa, órbitas fundas, sulcos e rugas `crease_estrangeiro`, encaixes dos fios `cable_estrangeiro_green` com peso cabeça→peito), olhos verdes, ombreiras pontudas na própria capa (saem as placas quadradas), `leaf_estrangeiro` / `sash_estrangeiro` (folhas do peito e faixa de pano; saem as tiras cruzadas e as cordas verdes), dedos com garras e pés de garra.
- Retratos da página Sobre renderizados de novo com os modelos atuais (240×320, `background: false`).

## v3.49.0 — Celestine e a Máscara do Desespero

### Adicionado
- `characters/celestine.js` (Portadores, `teams: ['Ordo Calamitas']`) e a forma `forms/celestine_magistrada.js` (`...magistrada` com o modelo da Celestine); modelo `tools/blender/char_celestine.py` → `public/models/celestine.glb`; `weapons.js` `chainHatchet` e `despairMask`; `props.js` `addCelestineProps` / `addCelestineMagistradaProps`; texturas `face_celestine` e `shirt_celestine`; visual `hatchet` dos projéteis; cenas de agarrão; falas contra o elenco inteiro.
- `specials/realityRewrite.js` (Reescrever a Realidade); passivas `trueConjuring` (custo × mult em `abilityCost`) e `dethroneHost`.
- Campo `teams` no personagem + `config/teams.js defTeams`: etiquetas extras no cartão da seleção (`.tm i`), na placa, na ficha de golpes e no filtro da página Sobre.
- Modelo `tools/blender/char_seita.py` → `public/models/seita.glb` + `weapons.js seitaMask` / `SEITA_MASKS` + `props.js addSeitaProps`.

### Alterado
- Magistrada: `awakening` `realityRewrite` (sai a transformação inventada).
- `summonMasks`: `DanteClone` com o modelo `seita` e a máscara de cada membro (saem as texturas `mask_seita_*`).
- `TEAM_COLORS`: Relíquias `#d63c8c`, `Ordo Calamitas` `#4a62e0`; sai `Luzidios`.
- `main.js`: os retratos dos vilões das Torres são gerados ANTES do elenco (o Anfitrião e o Deus da Morte selecionáveis ficam com a cor da equipe).

## v3.48.0 — Portadores e Relíquias

### Adicionado
- `characters/selectableForms.js`: `juanPortador`, `deusMorteReliquia`, `anfitriaoReliquia` — as formas como lutadores da seleção (mesmo id/modelo/kit/falas, `selectableForm: true`, cópias próprias dos golpes por causa do `applyAttackSpeed`).
- Equipes `Portadores`, `Relíquias` e `Outro Lado` em `config/teams.js` (sai `Portadores das Relíquias`).
- `weapons.js` `bloodForearmBlade` (sai `bloodBlade`); `props.js` `photoCamera` no Kaiser.
- Habilidade `photoFlash` (Kaiser — Foto com Flash, `ranged.variants.back`); `blindFighter` reaproveitado.
- `DanteClone` com `o.sludge` (fica longe e arremessa) + `summonMananciais.sludgeChance`; `onHit.drainSanity` nos projéteis.
- CPU: `kitProfile(def)` (atirador, perseguidor, velocidade) e `matchupPlan(meu, dele)` (keep, escapeAt, pressure, control); corrida do Botão do Anfitrião (`hostButtonGame.at`).

### Alterado
- Juan (id `juan`) passa a se chamar HENRI; `CHARACTER_NAMES.juan = 'Henri'`.
- Kaiser: ← + □ deixa o Disparo de Emergência e chama a Foto com Flash.
- Tela inicial: equipes em chips gerados de `TEAM_COLORS`; somem com o menu aberto.
- `check-roster`: regras do elenco base usam `BASE_ROSTER` (sem as formas selecionáveis); novas checagens de equipes, falas das formas e da Foto com Flash.

## v3.47.0 — Menus e Combos

### Adicionado
- `HomeScreen`: opções com `group` (`play` / `practice` / `game` → títulos `.hsec`) e `soon` (selo `.badge` + aviso `.hsoon`); opção `pve` (Outro Lado). Chaves `menu.sec.*`, `menu.pve*`, `menu.soon*` nos 13 idiomas.
- Torneio: `cfg.cpuFights` (`quick` | `run` | `watch`), pílula LUTAS DA CPU; `TournamentScreen({ cpuFights })` com `run` / `watch` / `quicksim`; `startTourRun` / `finishTourRun` em `main.js` (a luta real em `TOUR_RUN_SPEED` = 10× atrás de `#tourrun`). Chaves `tour.cpu_fights`, `tour.cf_*`, `tour.watch`, `tour.run`, `tour.running`, `tour.run_skip`, `tour.cpu_vs_cpu`.
- `COMBAT.comboBreak` ({ time: 3, hits: 12, iframes: 0.5 }) em `applyHit` (`victim.comboStart`).
- `anim/strikePolish.js` (`polishStrikes`, `POLISHED_STRIKES`): antecipação, passagem e volta nos 15 golpes genéricos.

### Alterado
- Visual do menu principal (coluna em seções + cartão de descrição), da montagem do torneio (`#tsetup`) e da chave (`#tbracket`).
- CPU: Substituição com a última carga em combo de 4+ acertos.
- Raziel: `lifesteal` 0,08 → 0,05 (forma 0,2 → 0,14); Bote Retalhador 92 → 84.
- Manancial: `char_manancial.py` na técnica atual; texturas `face_manancial` e `skin_manancial_torso` (saem `gown_manancial` / `pants_manancial`).

### Corrigido
- Montagem do torneio: ◀ ▶ só mudavam o valor nas regras e o controle não chegava às outras (agora ◀ ▶ navegam e A/× muda).

## v3.46.0 — Sede Incontrolável

### Adicionado
- Raziel (plano RZ-01 a RZ-09 do TODO): passivas `extraTurn` (Turno Extra), `elementalAffinity` com `element`/`resist` (Afinidade com Sangue) e `predator` (forma verdadeira).
- `razielAbilities.js`: `tongueLash` (Língua: agarrão à distância não defensável) e `thirst` no `vampireBite` (Sede Incontrolável).
- `cinematicCombo`: opção `gore` por golpe (Banquete Bestial com roteiro próprio).
- `dashStrike`: opção `bleed`; `ranged.aiRange` lido pela CPU (□ que é investida usado de longe).
- `bloodArmor.js`: variante `bright` (`def.brightBloodArmor`).
- HUD: barra `.hb-vampire` (`hpBar: { style: 'vampire' }`).
- Arthur: `ritual: true` nas habilidades, buff `noRituals` no Templo do Ódio e passiva `bloodAffinity` na Olhos Sempre Abertos (rituais de Sangue sem custo de vida, lido em `payHealth`).
- `tests/raziel.test.js`.

### Alterado
- Raziel: □ Rasgo de Sangue (projétil) → Vulto Retalhador (`dashStrike`); Maldição Sanguínea 8 s/+12% → 6 s/+10% com gotejamento; na forma, Endurecer Sangue → Língua.

### Corrigido
- `Fighter`: o v3.45.0 deixou dois `hideRangedProps` (o segundo ignorava o `propLock` da maça do Machado Demônio); juntados num só, com `activeRanged`.

## v3.45.0 — Banquete de Sangue

### Adicionado
- Raziel (equipe nova Vampiros) com a forma O Verdadeiro Raziel, e o cenário Igreja Antiga (`igreja`).
- Skate Caótico do Xande arremessado com o modelo atual; `activeRanged`/`hideRangedProps` no `Fighter`.
- `tests/team-links.test.js`.

## v3.44.0 — Laços de Equipe

### Adicionado
- `combat/teamSpecials.js`: coreografia dos Especiais em Equipe com ligação (golpe próprio por membro, convidados do grupo, `f.teamGuests`); `Assist.enter` / `Assist.perform`.
- `config/teamLinks.js` ligado ao `teamSpecial`: grupos (`group` + `min`, `style`), trios e duplas; entradas por versão (`baseId`) e desempate (`priority` > tipo > especificidade > líder). Ligações: `mascarados`, `forca_d`, `cristopher_kaiser`.
- Seleção da equipe: `teamLinkLine` (chave `sel.teamLink` nas 13 línguas); `HUD.teamCut(list, { quick })`.
- `tools/anim/retarget-ual.mjs` → `src/anim/ualClips.js` (Quaternius Universal Animation Library, CC0); `clip.linear` no Animator.
- `CameraRig`: `CUTSCENE` (entrada, troca de plano, saída, velocidade máxima), `shot.cut` / `shot.blend`.

### Alterado
- `run`, `walk` e `fall` usam os clipes importados (os antigos ficam como `*_classic`).
- Câmera dos especiais: transições suaves, recuo contra blocos sólidos na cinemática, volta à luta sem pulo.
- Build: chunks `modelos` e `especiais` (o `main` caiu de 878 para 532 kB, sem aviso).

### Removido
- Código sem uso: `TitleScreen` (+ `title.press` e o CSS `#title`), `watchChain`, `necktie`, `getCharacter`, `isArenaLoaded`, `learnedStats`, `VOLUME_CHANNELS`, `VOLUME_OPTIONS`, `volumeLabel`, `fxLabel`, `FX_NAMES`.

## v3.43.0 — Escrita e Raios

### Adicionado
- `src/anim/powerClips.js` (registrado em `clips.js` por `addPowerClips`): `relic_draw`, `iai_double`, `shadow_plunge`, `levitate_raise`, `script_surge` e `fear_pierce`.
- Opção `a.anim` em `fearBlade`, `abductBeam` e `shadowPortal`; `fearBlade.melody` (ondas da melodia no preparo).
- `damage.js energyHitFx`: raios em zigue-zague (segmentos de `tracer`), clarão, faíscas, anel e som em todo golpe de Energia (elemento do golpe, da maldição da arma no físico/tiro, ou do personagem em ritual/especial).
- `tools/blender/npc_leonora.py` → `public/npcs/leonora.glb` (+ `fonte/leonora.blend`); `npcRig` `leonora`.

### Alterado
- `maskTransform` (Kian, Realizador da Calamidade): clipe `script_surge`, câmera nova e a Escrita subindo das mãos ao rosto (`tl.each`), com `glowTint` escurecendo.
- `weapons.js leonora()`: carrega o `.glb` do Blender; a versão em código fica de reserva.
- `damage.js`: removido o bloco duplicado do `meleeBleed` (o do Mutilador já cobre).

## v3.42.0 — Sombra da Morte

### Adicionado
- Forma `joui_shinokage` (Transformação do Joui, `maskTransform`): modelo `joui_shinokage` (variante do `joui` com `addJouiShinokageProps`), `noMask`, kit próprio e o especial `cinematicCombo` "Shi no Kage" com a Relíquia na mão esquerda (`prepare.showProp: 'relicBlade'`, `fx: 'relicDraw'`).
- Props `shiNoKage()`, `relicScabbard()` e `relicBlade()` (`weapons.js`).
- Tipos de habilidade `shadowPortal` (Portal das Sombras); opções novas: `heavyBlow.lowBonus`, `fearBlade.dying`, `fearGaze.wither`, `healOverTime.cleanse`, `deathTouch.drainAll`, `blink.recastWindow` (+ `recast`), `rejectMist.dispel`, `shadowTrap.atTarget/stun/label`, `abductBeam.sigils/hitLabel/missLabel`, `selfBuff.redAura/meleeBleed`; buff `meleeBleed` lido em `damage.js`.
- Rejeitar Névoa pelo cânone: zona `rejectMist` + `rejectMistFor`/`conjureSeq` (conjuração contínua em `Fighter.useAbility`).
- `docs/AUDITORIA-KIAN-JOUI.md`: auditoria código × cânone × proposta.

### Alterado
- Kian: transformação "Realizador da Calamidade" com kit próprio (`kian_calamidade.js`).
- Joui: especial do mascarado renomeado para "Execução das Sombras"; Tomado pelo Ódio (R2 + ×); Portal das Sombras no lugar do Corte das Sombras.
- Arthur: Rebirth verde (`0x3aff6a`).
- `agingHeal`: só a cura (sem `ageHair`).
- `specialHitFx`: `fx.color` e `fx.color2` por golpe.
- `Fighter.applyDef` zera o estado da máscara; `def.noMask`.

### Corrigido
- Service worker: o cache de arquivos (`.glb`, sons, imagens) leva a versão — versão nova apaga o antigo (modelos velhos apareciam).
- PC (Electron): limpa o cache do Chromium e service workers quando a versão do app muda.

## v3.41.0 — Lâmina de Sangue

### Adicionado
- `weapons.js bloodBlade()`: a lâmina de sangue do Arthur no punho direito (prop `bloodBlade`, com `inFist`).
- Habilidade `bloodBlade` aceita `a.melee`: troca a ficha do físico do lutador enquanto dura e devolve no fim (se ele não se transformou no meio).

### Alterado
- Arthur: a Arma de Sangue usa o prop `bloodBlade` (no lugar do braço de sangue `claw` no ombro esquerdo) e a sequência de cortes com as animações de faca de uma mão; o físico normal ganha `onearm_punch` e `onearm_elbow`.
- `char_arthur.py` e `char_joui.py` reescritos na técnica atual (sculpt_lib), revisados no Blender pelo MCP; geram `fonte/arthur.blend` e `fonte/joui.blend`. Retratos da página Sobre regerados.
- `check-roster`: o Arthur pode usar o braço direito (soco/cotovelada de um braço) e a Arma de Sangue precisa nascer do punho direito com a sequência própria.

## v3.40.0 — Peso e Pelo

### Alterado
- Balu (`char_balu.py`) reescrito na técnica atual (sculpt_lib: polo e jeans a partir do corpo, barriga em relevo, gola e cinto colados por raio, topete, bigode e mocassins em metaballs) pela miniatura de Calamidade; gera `fonte/balu.blend`.
- Lírio (`char_lirio.py`): sobretudo com dobras (`relief`), pelo em tufos de metaball (textura nova `fur_lirio`, cinza), ombreiras em camadas, tiras e fivelas no peito, cabelo refeito em metaballs (mechas jogadas para trás até os ombros, mecha laranja); gera `fonte/lirio.blend`.
- `jeans_balu`: azul-acinzentado. Retratos da página Sobre do Balu e do Lírio regerados.

## v3.39.0 — Olhos Sempre Abertos

### Adicionado
- Especial `eliteShot` (`specials/eliteShot.js`): Solo do Abutre do Arthur — some na fumaça, reaparece ajoelhado, rastros roxos do Rebirth, laser de mira e o tiro crítico (`critMult`, elemento Energia).
- Passivas `luckyStrike`, `longShot` (Arthur), `oneByOne` e `disarmStrike` (Joui); `runMeleePassives` também lê as passivas de `buff.passives`.
- Habilidade Pavor Anormal do Joui: `shadowTrap` com `stun`/`label` (o `blind` passou a ser opcional).

### Alterado
- Arthur: Arma de Sangue virou habilidade (`bloodBlade` com `showProp`), transformação Olhos Sempre Abertos, Rebirth roxo (`0xa46bff`, Energia) e os olhos do Rebirth roxos.
- Joui: passivas Precognição, `resistant` (corpo a corpo) e `iKnewIt` (Conhecimento); a Técnica Secreta ganha `disarmStrike`.
- Modelos do Arthur (`char_arthur.py`, Calamidade) e do Joui (`char_joui.py`: cabelo e chinelos) refeitos pela arte oficial.
- `renderPortraits`: enquadra pela altura da cabeça; retratos da página Sobre regerados.
- `check-roster`: checagens do Arthur e do Joui pelo kit novo.

## v3.38.0 — Todos Juntos

### Adicionado
- Transformação em equipe (F3): `Fighter.startAwakening` com a Barra de Equipe cheia gasta a barra e chama `Assist.empower` nas duas assistências — com `awakening.form` a assistência troca para a forma (modelo e ficha), sem forma ganha aura e dano ×1,25 (forma ×1,15); `revertEmpower` no fim do round (`reset`) e na troca (`trySwitch`).
- Cinemática do tríptico (`HUD.teamCut`, `#teamCut` em `styles.css`): três painéis inclinados com o retrato sem fundo (gerado no começo da partida em equipe), linhas verticais na cor do elemento e o nome.

### Alterado
- Kaiser remodelada pela arte de Desconjuração (`char_kaiser.py`), com texturas novas `jacket_kaiser`, `turtleneck_kaiser`, `pants_kaiser`, `skin_burn_kaiser` e `face_cineraria` revisto.

## v3.37.0 — Em Movimento

### Adicionado
- `src/anim/locomotionClips.js`: corrida, caminhada, pulo, queda, dash, esquiva e reação a golpe com fases de ciclo (contato, absorção, passagem, impulso), giro do quadril e contra-giro do tronco; meio ciclo espelhado. Substitui as definições antigas em `clips.js`.
- `src/anim/idleClips.js`: 18 posturas paradas próprias (quem dividia `idle_knife`, `idle_katana` e `idle_fist`).
- Página Sobre: seções O universo e Elementos, elenco com retratos (`public/sobre/elenco`) e filtros, e o modo futuro Outro Lado.

### Alterado
- `models/props.js`: `inFist` — as armas brancas de mão atravessam o punho fechado (lâmina do lado do polegar, pomo embaixo).
- Carniçal da Esfinge (`npc_esfinge.py`): cores e detalhes pela arte oficial (verde-oliva, leque de espinhos, colar de crânios, asas roxas, cauda enrolada).
- Galeria: usa o `anims.idle` de cada ficha.

### Corrigido
- Changelog da v3.33.0: o ciclo dos elementos estava escrito ao contrário.

## v3.36.0 — Na Faixa Certa

### Adicionado
- Opção **Falas na luta** (Opções › Partida; `SETTINGS.fightLines`, 13 idiomas): esconde as falas do meio da luta sem mudar a lógica (seguro na partida em rede).
- Contador de desempenho de dev (`src/dev/perf.js`): `?perf` na URL ou F8 no `npm run dev`.
- `awakenMode.glowMat`: materiais que acendem e pulsam no despertar (a venda do Gal).

### Alterado
- Banner do nome do especial/transformação (`#banner`, `HUD.banner`): faixa e texto na mesma célula (a faixa cresce com o texto), letra pela largura da tela, duas linhas equilibradas para nomes longos.
- Gal: Ultimate "Injustiça né?" e transformação "O Realizador do Destino".

## v3.35.0 — Eu Sou a Injustiça

### Alterado
- Gal Sal — especial **Injustiça** refeito pela cena do cânone (Controle Mental em Joui antes da execução): corrente → sigilo do Controle Mental e o alvo ajoelha (`forced_kneel`) → a fala inteira no banner → 3 cortes com lampejo antes do impacto (Bênção Maldita) → cruz final que derruba. Dano 250, custo 50 e recarga 14 mantidos; dano por impacto (15/15/20/50%).
- `cinematicCombo`: opções opcionais por golpe `victimAnim`, `sigil`, `foresee`, `push`, além de `endReaction` e da câmera `shots: 'control'`.
- Despertar **Afinidade com Precognição**: dá a passiva `precognition` enquanto dura (`awakenMode.passives`; `hasPassive` lê passivas de estados ativos) e alarga o Bloqueio Perfeito para 0,2 s (`perfectBlockWindow`); velocidade +15% → +10%.
- CI: ações dos fluxos de apps e Pages nas versões atuais e build em Node 24.

### Corrigido
- `cinematicCombo`: um passo `noHit` sem `share` deixava o dano do último golpe em `NaN`.

## v3.34.0 — Faixas e Correntes

### Adicionado
- Modelo da **Kemi** refeito pela arte oficial (`tools/blender/char_kemi.py` → `public/models/kemi.glb`): dreads em rabo alto com mechas soltas, argolas, top curto com faixa, abdômen em relevo, mochila com alças, faixas coladas por raio no braço e nas pernas, calça cáqui com bolsa na coxa, casaco amarrado na cintura e coturnos. Texturas `top_kemi`, `pants_kemi` e `coat_kemi`.
- Modelo da **Fantasma** refeito pela arte oficial (`tools/blender/char_fantasma.py`, agora independente): sobretudo de couro com gola alta e remendos, faixas na cabeça com a fresta dos olhos, facas, alça do rifle, faixas nos braços e canelas e dreads. Texturas `coat_fantasma`, `pants_fantasma` e `bandage_fantasma`; `face_fantasma` refeita.
- Modelo do **Gal Sal** refeito pela arte de Desconjuração (`tools/blender/char_gal_sal.py`): poncho com caimento por perfil (por cima dos ombros e braços, queda vertical até a barra), decote em V dourado, franja, cabelo em metaballs, venda, brinco e correntes nos antebraços. Texturas `poncho_gal` e `pants_inj`.
- Lâminas **Ereškigal** modeladas no Blender (`npc_gal_blade.py` → `public/npcs/gal_blade.glb`), usadas por `sickleBlade` (`src/models/weapons.js`).
- `src/config/teamLinks.js`: tabela das ligações de lore e `getTeamLink` (trio > grupo > dupla) para os futuros Especiais em Equipe customizados (ainda não ligada).

### Alterado
- Xande: o Skate Caótico (□) usa `hideProp`/`returnsProp` — some da mão no arremesso e volta quando retorna; o projétil clona a peça da mão do dono (`src/combat/projectiles.js`).
- A sniper das costas da Kemi fica mais afastada para passar por cima da mochila (`src/models/props.js`).
- Galeria: o close de rosto (`?face`) ficou mais afastado e centralizado.
- `kemi_common.py` removido (Kemi e Fantasma têm scripts próprios).

### Corrigido
- Import sem uso de `getForm` em `src/combat/assists.js`.

## v3.33.0 — O Ocultista e o Mutilador

### Adicionado
- Modelo do **Xande** refeito pela arte oficial (`tools/blender/char_xande.py` → `public/models/xande.glb`): cabelos ondulados em metaballs, camiseta amarela canelada e estampa dos 3 triângulos com "oculto", bermuda de sarja com pregas e barra de triângulos, suspensórios em X, cinto com rádio e bolsas, balaclava, fones no pescoço, joelheiras de olho, correntes 3D com elos reais e tênis de cano alto. Texturas `face_xande`, `shirt_xande`, `sleeve_xande`, `shorts_xande`, `gaiter_xande`, `legs_xande` (arranhões e mordidas) e `trim_xande`.
- Modelo do **Aguiar / Mutilador Noturno** refeito pela arte oficial (`tools/blender/char_aguiar.py` → `public/models/aguiar.glb`): corpo musculoso esculpido, cabelo preto ondulado até a nuca com mecha na testa, faixa de couro alta no pescoço, distintivo de delegado com corrente 3D, camiseta creme justa, colete vermelho esfiapado com gola levantada, suspensórios em X no cinto largo de couro com tiras soltas, braçadeiras e munhequeiras com fivelas, jeans escuro rasgado nos joelhos e tênis vermelhos com esporas de roseta de pontas de ferro atrás.
- Armas modeladas no Blender (`tools/blender/npc_*.py` → `public/npcs/*.glb`):
  - Taco com arame farpado e pregos (`npc_xande_bat.py` → `xande_bat.glb`).
  - Skate Caótico (`npc_xande_skate.py` → `xande_skate.glb`): guardas metálicas com rebites, lâminas serrilhadas, rodas com espinhos, alça de escudo e runas verdes; utilizado tanto nas mãos quanto no projétil arremessado.
  - Machado do Mutilador (`npc_aguiar_axe.py` → `aguiar_axe.glb`): lâmina curva com fio gasto, contrapeso de ferro, empunhadura de couro e corda amarrada.
- Anatomia refinada em todos os 33 modelos (`tools/blender/lib.py`):
  - Mãos esculpidas (`hand_part`): palma e dorso modelados com dedos em 3 falanges articuladas, nós anatômicos e polegar sobreposto.
  - Sapatos modelados (`foot_part`): formato orgânico com bico arredondado, peito do pé e calcanhar.
  - Solas contornadas (`sole_part`) e pés descalços anatômicos com arco e 5 dedos (`bare_foot_part`).
- Sistema de **Revestimento Elemental de Armas** (`src/models/weapons.js`, `elementCoat`): gera texturas procedurais com emissivo próprio para Sangue, Morte (lodo com espirais), Conhecimento (sigilos pulsantes) e Energia (raios piscantes).
- Mecânica de **Amaldiçoar Arma por Elemento** adaptativa (`src/combat/abilities.js`, `applyWeaponCurse`, `pickCurseElement`):
  - Xande seleciona automaticamente o elemento que supera a afinidade do oponente (contra Sangue usa Morte, contra Morte usa Energia, contra Energia usa Conhecimento, contra Conhecimento usa Sangue).
  - Efeitos em combate por elemento (`src/combat/damage.js`): Sangue aplica sangramento; Morte causa apodrecimento contínuo e lentidão momentânea; Conhecimento drena sanidade/energia da vítima; Energia descarrega choques elétricos extras com chance percentual.
  - Golpes com armas amaldiçoadas herdam multiplicadores de vantagem/desvantagem elemental.
- Assistência em movimento do Xande atualizada (`src/combat/assists.js`): amaldiçoa a arma do líder ativo com o elemento que supera o adversário atual.

## v3.32.0 — O Enigma

### Adicionado
- Personagem **Nubi** (`src/characters/nubi.js`, Escriptas/Morte): modelo `tools/blender/char_nubi.py` →
  `public/models/nubi.glb` (bengala de chacal no próprio modelo), texturas `face_nubi`/`face_nubi_open`, `skin_nubi`,
  `skin_torso_nubi`, `cloak_nubi`, `hair_nubi`; clipes `idle_nubi`, `nubi_ritual`, `vic_nubi`; cena de agarrão; falas
  com todo o elenco. Habilidade nova `calmEvade` (janela de 0,45 s; o golpe não especial vira Substituição grátis,
  `damage.js`), visual de projétil `lodoMass`, esquiva `style: 'calm'`. Reaproveita `decadence`, `lodoTentacles`,
  `heavyBlow`, `timeWarp` e `awakenMode` (que ganhou `face: [de, para]` e `eyeDrip`).
- Especial `sphinx` (`combat/specials/sphinx.js`) e o NPC `SphinxGhoul` (`combat/beasts.js`, `SPHINX`): 480 de vida,
  35 s (o relógio para na paralisia), `bossBar`, nunca trai a dona; `claw`, `leap` (arco de 2,2 m), `vomit` (poça com
  buff `lodoWeak` ×0,7 dano/×0,8 velocidade), `devour` (`dragTick`: 34/s, cura a Esfinge), Amedrontar (0,8 s).
  Modelo `tools/blender/npc_esfinge.py` → `public/npcs/esfinge.glb` (Menés como superfície com listras por material).
- `combat/riddle.js` + `config/riddles.js` (52 enigmas populares reescritos): `world.riddle` congela a simulação e o
  relógio; marcas da barra em 75/50/25%; resposta pelo `input.pressed` (lockstep), toque na resposta
  (`hud.onRiddleTap`), CPU acerta 50%; sem repetir na partida e, fora do online, memória dos últimos vistos.
- `config/balance.js` (`BALANCE`, `balanceOf`): multiplicador de dano causado/recebido por personagem, aplicado em
  `applyHit` depois do `cpuEdge` (vale nas formas e nas invocações). `dev/balance.js`: opção `attackers` (divide a
  rodada entre abas) e espera por `MessageChannel`.
- Barra de Equipe (`COMBAT.teamGauge`: +6 por chamada de assistência, +3 por troca) e Especial em Equipe
  (`COMBAT.teamSpecial`, △ △ △ ○ com a barra cheia; `Assist.callTeam`, `Fighter.tryTeamSpecial`); HUD `.bar.teamg`.
- `Fighter.blockHealing(t)` / buff `noHeal`; `heavyBlow` aceita `track`, `stepTime`, `noHeal`.

### Alterado
- Kian: `erase` com `eraseBelow` 0,35 e `strongDamage` 380 (antes matava em qualquer vida); `kianScript` 45/0,5 s →
  30/0,3 s. O Diabo: vida 1800 → 1550 (forma 2100 → 1850), regeneração 16/8 s → 13/9 s (ferido 24/5 → 19/6; forma
  22/6 → 17/7 e 34/3,5 → 25/4,5), roubo de vida 0,08 → 0,05, Renascimento +300 → +150.
- Cristino — Decepar: `impact` 0,3, `step` 7,5, `stepTime` 0,32, `track`, alcance 2,6, arco 150, `noHeal` 12.
- HUD: a barra do topo vale para `isMarionette || bossBar`, com `barName` e as marcas do enigma. CPU: `calmEvade` só
  como reação (`threat`).

### Corrigido
- `HoloCopy.copyPose` travava com peças que não são nó 3D (o grupo `stowed` da Kemi) — Eco Espiral do Dante × Kemi.
- `sobre.css`: os passos numerados da página de download.

## v3.31.0 — 2026-10-17

### Alterado
- Carga (△): `COMBAT.cargaWindow` 2,5 → **0,45 s** (o próximo toque da sequência precisa vir logo); segurar △ não
  estende mais a etapa (`updateCharging`); `chordWithCarga` sem o caminho "△ segurado" — só △ junto, logo antes ou em
  sequência curta. HUD: saiu o bloco `.carga` (losangos + "○ → ESPECIAL!"); toque: saiu `data-stage` do △.
- Marionete: `get ranged()` dinâmico (forma com `special.ranged`, buff `awakened` ou invocada assim) e aviso quando
  muda; o ataque `slash` (corte de osso por projétil) virou `strings` — **Fios do Luto**: preparo 0,55 s, o fio voa a
  26 m/s até 13 m, `applyHit` de 10 e, se acertar, `pullTo` até 1,7 m da Marionete e o golpe `quick` emenda; defendido
  ou esquivado, o fio volta. `strike` aceita `a.sound`.
- Deus da Morte: `summonCarnical` → `summonExistido`; habilidade `existido` (hp 340).

### Adicionado
- `ExistidoMorte` (`combat/beasts.js`, `EXISTIDO`): passo errático (sorteia ×0,3 ou ×2,1 a cada 0,35–1,1 s), Pancada
  (`claw` com som de soco), `slam`, `timeWarp` (buff `timeWarp` `speedMult` 0,45 por 2,5 s) e `accel` (4 s ×1,9 e 40% dos
  golpes passam). Sem barra própria na tela (como os Zumbis de Sangue).
- Modelo `tools/blender/npc_existido_morte.py` → `public/npcs/existido_morte.glb`: textura de escrita
  (`tools/blender/tex/existido_texto.png`, frases da wiki) com UV cilíndrico por peça, cor por vértice multiplicando,
  Lodo como casca brilhante nos antebraços e mãos. `buildNpcModel` passa a usar a textura do .glb (`map`).
- `tools/blender/preview_npc.py`: renderiza frente/lado/três-quartos/rosto de uma invocação a partir do .blend.

### Removido
- O Carniçal das invocações (`Carnical`, `buildCarnical`, `isBullet`/Corpo Fechado) e do carregamento; o script
  `npc_carnical.py` e o .glb ficam para o personagem jogável futuro.

## v3.30.1 — 2026-10-17

### Corrigido
- iPhone/iPad com o jogo instalado: depois de girar, o iOS deixava a página com o tamanho de antes (faltavam ~47 pt, a
  altura da barra de status). `src/core/viewport.js`: `viewSize()` usa o tamanho da tela (`screen` + orientação) quando o
  iOS erra, põe `html.vp-fix` com `--app-w/--app-h` nas camadas de tela cheia, e `watchViewport()` mede de novo depois
  do giro (resize, orientationchange, visualViewport). `main.js` (renderer, câmeras, nomes da vitória), `World`, `HUD`
  e os controles de toque usam `viewSize()`.
- Botões de habilidade (toque): `abilityLabel()` — o apelido entre aspas primeiro; sem apelido, o maior começo do nome
  até 20 letras sem terminar em conector; `abilityLabels()` usa o nome inteiro quando dois rótulos empatam.

### Alterado
- Seleção com altura até 520 px: grades 5 × 3, cabeçalho de cada lado numa linha (P1 · status · ◀ ▶; em telas até 760 px
  só as setas), coluna do meio estreita com os modelos 3D, placas sem a frase e com a equipe em fichas, COMEÇAR compacto.
- Menus de lista (`.menu` fora do ONLINE) em duas colunas com painel escuro em telas baixas; COMANDOS/NOVIDADES entre os
  botões dos cantos no toque; chave do torneio compacta (os botões ficavam cortados).

## v3.30.0 — 2026-10-17

### Adicionado
- App instalável (PWA): `public/manifest.webmanifest` (caminhos relativos — vale em `/` e em `/arena-paranormal/`;
  `display: fullscreen`, paisagem) e ícones em `public/icons/` (192, 512, maskable 512, apple-touch-icon 180) — monograma
  "AP" com os cinco elementos, feito para o jogo (o emblema da Ordo Realitas tem texto e detalhe demais para ícone).
- `index.html`: manifesto, `apple-touch-icon`, `theme-color` e as metas `apple-mobile-web-app-*` (barra translúcida,
  título "Arena").
- Service worker: modelo em `src/sw-template.js`, gravado como `sw.js` pelo `pwaPlugin` do `vite.config.js` com a
  versão e a "casca" (página, scripts e estilos do build, manifesto e ícones). Casca na instalação; modelos, cenários,
  sons e imagens guardados no primeiro uso (cache-first, sem baixar os ~57 MB de uma vez); página, manifesto e
  `ai/learned.json` da rede primeiro; fontes do Google guardadas. Versão nova apaga a casca anterior.
- `src/ui/installHint.js`: `registerPWA()` (só no build publicado; nunca no Electron, no Capacitor nem no `npm run dev`)
  e o aviso de instalar na tela inicial — passos do Safari no iPhone/iPad, botão INSTALAR (`beforeinstallprompt`) no
  Chrome/Edge; some quando já está instalado ou quando fecham (lembrado no aparelho).
- Textos `install.ios/app/button/close` nos 13 idiomas.

### Alterado
- `sobre.html`: cartão "Instalar pelo navegador" com os 4 passos do iPhone; FAQ e JSON-LD atualizados; no iPhone o
  botão principal vira "Instalar no iPhone" e leva aos passos.
- Instalado (`display-mode` standalone/fullscreen), o botão de tela cheia dos controles de toque sai.

## v3.29.0 — 2026-10-17

### Alterado
- Torneio: as lutas seguem a ordem da chave (`nextMatch`), uma de cada vez. `autoResolve` saiu do fluxo do jogo (fica
  na API e nos testes); `isCpuMatch` / `simulateMatch` em `game/tournament.js` decidem UMA luta só de CPU.
- `TournamentScreen` (`sim`, `last`): duelo animado no painel — fase `play` (linhas até o encontro, barra, ⚔️; devolve
  `clash` aos 1,25 s e `simdone` aos 2,7 s) e fase `result` (linha do vencedor dourada até o nome, perdedor riscado e
  ELIMINADO; devolve `next` aos 2,4 s). PULAR adianta a fase. `main.js`: `toTourBracket(last)` e `simTourMatch()`.
- `NetSession`: o anfitrião continua no corretor durante a partida e atende ofertas — `hello.watch` vira espectador
  (até `MAX_WATCHERS` = 8; mesma checagem de versão e senha); um segundo jogador recebe "A sala já está cheia.".
- Anfitrião guarda `history` (os comandos [P1, P2] de cada quadro) e manda a quem assiste: o histórico inteiro em
  pedaços de 1000 quadros na entrada, depois os quadros novos a cada 4 (`t: 'w'`) e, a cada `CHECK` quadros, os números
  da luta (`t: 'ws'`) para corrigir.
- `NetSession.watch(code)` (papel `watch`): não manda comandos, lê os quadros recebidos, vê pelo lado do P1. `netPump`
  refaz até 40 quadros por desenho quando está mais de 20 atrás e espera os próprios modelos na tela de carregamento.
- Lobby: salas jogando são anunciadas com `live`, `players` e `watchers`; o anfitrião de sala pública mantém um `Lobby`
  (`game.liveLobby`) durante a partida.
- `LanScreen`: salas AO VIVO na lista com ASSISTIR (com senha → tela de senha → `act: 'watch'`).
- Espectador: selo no alto vira o botão de sair (Esc também), controles de toque escondidos (`body.spectating`).

### Adicionado
- Textos `tour.sim/winner/out/skip`, `lan.live/watch/watching` e `net.watching/syncing/leave_watch/not_started/
  too_many_watchers/room_full/match_over` nos 13 idiomas.
- Teste: as lutas do torneio saem em ordem e `simulateMatch` decide uma só por vez.

## v3.28.0 — 2026-10-17

### Alterado
- `src/ui/touchControls.js` refeito: ATAQUE (○) grande no canto direito; anel de dentro com × · □ · ESQ · △ · DEF; anel de
  fora com o ESPECIAL e um botão por habilidade do lutador em campo (até 6, ordenadas pelo comando). Posições calculadas
  em `layout()` na escala da tela (`scaleFor`: 0,8–1,35, desenho base 844 × 390), refeitas no `resize`.
- Botão de habilidade = o comando dela num quadro (`CHORDS`: △+○, △+□, △+L2, △+×, DEF+△, DEF+×; □ + direção calcula
  frente/trás/lado em relação ao adversário pela `cameraBasis`). Passa pelo mesmo caminho do controle — vale na partida
  online sem mudar o pacote de rede.
- Recarga, falta de sanidade, especial pronto/usado, etapas da carga, transformação pronta e cargas da esquiva
  desenhados nos próprios botões (`paint()`); nomes encaixados medindo o texto (`fitLabel`, abrevia abaixo de 7,5 px).
- Joystick flutuante: nasce sob o polegar na metade esquerda (`.t-zone`) e volta ao canto ao soltar.
- Equipe: assistências com o nome de quem vem e troca (⇄), à esquerda, abaixo da HUD. Pausa ao lado do relógio.
- `sync()` recebe o lutador deste aparelho (`fighters[input.netSlot || 0]`) e refaz os botões na troca e na transformação.
- HUD no toque (`body.touch-ui`): sem a fila de habilidades, a linha de carga/esquiva, os buffs e as assistências do
  painel; painéis com 36 vw.

### Adicionado
- `InputManager.touch.nudge` (direção de um quadro) e `touch.mute` (ignora a DEF segurada no quadro do botão de habilidade).
- Chaves `touch.attack`, `touch.jump` e `touch.shot` nos 13 idiomas.

## v3.27.1 — 2026-10-16

### Alterado
- `sobre.html` / `src/sobre.css` / `src/sobre.js` refeitos pelo padrão de qualidade de sites: direção visual ThoughtLab (Refero) em `docs/DESIGN-SOBRE.md`, tokens em variáveis CSS, CTA principal pelo aparelho (Android → `.apk`, iPhone/iPad → navegador, resto → `.exe`), seções Baixar · O jogo (capturas reais em `public/sobre/*.webp` com `srcset` de 480 px) · Modos · Elenco (carregado por `IntersectionObserver`) · Controles · Perguntas; SEO (canonical, Open Graph, Twitter Card, JSON-LD `VideoGame` + `FAQPage`) e acessibilidade (link de pular, foco visível, alvos ≥ 44 px). Fontes sem bloquear a pintura (`preload` + troca).
- `vite.config.js`: `define.__APP_VERSION__` (a versão do `package.json` para páginas leves, sem o changelog).
- Embaralhar do Dante: as cópias escurecem × 0,035 (linear — o × 0,16 de antes dava #6f6f6f na tela).
- `char_dante.py`: franja mais curta (termina 0,025 H mais alto) — os olhos aparecem.
- Cena `eyes` (`maskTransform`): a luz da cena cai para 4 depois de abrir os olhos (o 14 do `maskOn` estourava o xale branco).

### Adicionado
- `public/robots.txt`, `public/sitemap.xml`, `public/404.html` e `public/sobre/og.jpg`.
- `docs/DESIGN-SOBRE.md` (direção visual) e `docs/QUALIDADE-SOBRE.md` (status do checklist, com os itens que não se aplicam).

## v3.27.0 — 2026-10-16

### Adicionado
- `src/ui/OptionsScreen.js`: a tela de OPÇÕES em seções, com linhas `slider` (barra arrastável por `pointer` com captura, ◀ ▶ de 5 em 5, toque no valor = mudo) e `choice` (até 4 → botões; mais → ◀ valor ▶), descrição da linha selecionada e o VOLTAR. Cada mudança chama `onChange(id, v)`; o idioma pede a tela de novo (`'relabel'`).
- `AudioManager`: canais `sfx` / `ui` / `hum` (ganhos entre os sons e o `master`), `setChannel(ch, k)`, `channelOf(name)` (`UI_SOUNDS`: select, confirm, denied, back, move); os blocos de síntese ligam no canal do som em montagem (`this.out`, guardado e devolvido em sons aninhados); os loops da Carga vão para `hum`.
- Opções `volSfx`, `volUi`, `volHum` (0–100); os volumes aceitam qualquer valor de 0 a 100 (a barra), não só de 10 em 10.
- Chaves `opt.sec.*`, `opt.vol.*`, `opt.desc.*`, `opt.*.label`, `opt.hint` nos 13 idiomas.

### Alterado
- `main.js`: `toOptions` monta a `OptionsScreen` (sai a lista do `MenuScreen` e os rótulos `opt.volume`/`opt.fx`/`opt.gfx` da tela).
- `menu.fanmade` mais curto em todos os idiomas ("Jogo fan made por romavitordev · inspirado em Ordem Paranormal") e o estilo `.fanmade` numa linha só, menor.
- `menu.options.desc`: "Som, imagem, tempo da luta e idioma."

## v3.26.1 — 2026-10-16

### Corrigido
- Vazamento de memória de GPU: a textura de ossos de cada `Skeleton` (`computeBoneTexture`) nunca era liberada — ~30 texturas a mais por luta (765 → 900+ em cinco lutas; agora estável em ~260). `glbRig.disposeSkeletons(root)` chamado em `World.dispose`, `DanteClone.dispose`, `HoloCopy.dispose`, `portraits` e `selectStage.dispose`.
- `glbRig`: as texturas pintadas (`MATERIAL_TEXTURES`) são feitas UMA vez por material e compartilhadas (`paintedTexture`), em vez de repintadas a cada cópia do modelo.
- Ciclo de imports `damage → guizoAbilities → abilities → beasts → npcs → damage`: `shuffleDodge` passou para `damage.js`.

### Adicionado
- Opção `graphics` (`GFX_OPTIONS`: auto · high · medium · low; `gfxProfile`, `gfxLevel`, `autoGraphics` — auto = low com ponteiro `coarse` ou `deviceMemory ≤ 4`): `pixelRatio` (2 / 1,5 / 1), `antialias` (só ao abrir o jogo), sombras (PCFSoft 2048 / PCF 1024 / sem), luzes pontuais dos cenários (8 / 2 / 1, as mais fortes), luzes de contorno da tela de título (8 / 2 / 0) e `maxFps` (sem limite / 60 / 60). Chaves `opt.gfx*` nos 13 idiomas. Nada que mude a luta nem o sorteio dos efeitos (o online depende disso).
- `WebGLRenderer({ powerPreference: 'high-performance' })`.

## v3.26.0 — 2026-10-16

### Adicionado
- Forma `dante_aberto` (`src/characters/forms/dante_aberto.js`), a Transformação do Dante (`maskTransform`, cena nova `eyes`): de olhos fechados, o Lodo sobe do chão e ele abre os olhos (o rosto troca ao vivo com `swapFace`, as orelhas pontudas por `swap`). Kit: Decadência `fromMouth`, Trinitá Aprimorado (4 cópias, `recast`), Tentáculos maiores, Paradiso `noAging`, Paradoxo, Eco Espiral, Rotura no ← + □ (`ranged.variants.back`), especial com `ranged`, passiva `deathMarked`.
- `src/combat/danteAbilities.js`: tipos `paradox` (`addParadoxZone`: espiral no chão, dano por segundo, lentidão, dano em invocações inimigas) e `echoPain` (buff `ecoDolor`; `damage.js` repete cada golpe do dono com `echo: true`).
- `Fighter.useAbility`: `recast` — com a habilidade recarregando, `ABILITY_TYPES[type].recast` pode dar um segundo uso (o Embaralhar troca de lugar com uma cópia, uma vez a cada 1,2 s).
- Embaralhar `fight: true` (só o Dante): as cópias são `DanteClone` (andam, cercam e batem a 50%; `shatter()` para levarem o golpe), escurecidas.
- A Marionete: golpe `slash` (projétil `boneCrescent`), só com `o.ranged` (invocada pela forma `dante_aberto`).
- Passiva `deathMarked` (dano de Morte × 0,8); `decadence.fromMouth`; `agingHeal.noAging`.
- Variante de modelo `dante_aberto` (`addDanteAbertoProps`: troca `face_dante`/`skin_dante` por `face_dante_open`/`skin_dante_open` e mostra `prop_eartip`); `addDanteProps` esconde as orelhas pontudas.
- Texturas `face_dante` (olhos fechados, cicatriz, sigilo), `face_dante_open`, `skin_dante` (sem tatuagens), `skin_dante_open` (as tatuagens), `shawl_dante`, `wraps_dante`.
- Fala de transformação do `dante_aberto`; `check-roster`: regras do Trinitá que luta e da forma.

### Alterado
- `tools/blender/char_dante.py` v2 (técnica do Cristino/Cristopher): camiseta por `clothe`, calça e cabelo esculpidos, o xale em casca (`shell_grid`) com a aba cruzada, cintos com `chain_mesh` → `public/models/dante.glb` (~47 mil triângulos; fonte `tools/blender/fonte/dante.blend`).
- `tools/blender/npc_marionette.py` v2, esculpida (tronco, crânio, mandíbula, cabelo, galhos dos braços, cabo e dorso da foice por metaballs; saia de tiras e lâmina em meia-lua por `shell_grid`) → `public/npcs/marionette.glb`. Mesmas juntas da v1.
- Dante: a Transformação deixa de ser o despertar "Afinidade com o Outro Lado" (`awakenMode`) e vira a forma Olhos Abertos.
- `guizoAbilities.js` pega `DanteClone` por `abilities.js` (importar `npcs.js` direto fechava um ciclo com `damage.js`).

## v3.25.1 — 2026-10-16

### Adicionado
- Tela de título: `.fanmade` dentro do logo (`menu.fanmade` nos 13 idiomas), escondido quando o menu abre.

### Alterado
- Dalmo e a forma Colosso: `element` `energia` → `sangue` (o personagem, a Pressão Atmosférica, os golpes das Manoplas e o soco do Colosso).

## v3.25.0 — 2026-10-16

### Adicionado
- `sobre.html` (+ `src/sobre.js`, `src/sobre.css`), terceira entrada do Vite: como o jogo funciona, modos, elenco (lido de `ROSTER`), controles e os downloads (`releases/latest/download/Arena-Paranormal-Windows.exe` / `Arena-Paranormal-Android.apk`); destaca o aparelho de quem vê e esconde os downloads dentro dos apps.
- Opção `about` no menu principal (`homeOptions`, `main.js` → `BASE_URL + sobre.html`); chaves `menu.about` / `menu.about.desc` nos 13 idiomas.
- Versão para PC com Electron: `electron/main.cjs` (protocolo privilegiado `app://` servindo `dist/`, porque o fetch dos `.glb` não funciona em `file://`; tela cheia, F11, links externos no navegador) e a configuração `build` do electron-builder (NSIS x64, `Arena-Paranormal-Windows.exe`); scripts `pc` e `dist:pc`.
- Versão Android com Capacitor: `capacitor.config.json` (`com.romavitordev.arenaparanormal`, `webDir: dist`); script `dist:android`.
- Workflow `.github/workflows/release-apps.yml`: numa tag `v*` (ou à mão) gera o `.exe` (windows-latest) e o `.apk` (ubuntu + JDK 17: `cap add android`, horizontal com `sensorLandscape`, `versionCode`/`versionName` do package.json, `assembleDebug`) e publica a release com as notas de `tools/release-notes.mjs` (a entrada mais nova do CHANGELOG).
- `vite.config.js`: `APP_BASE` sobrepõe o `base` (os apps servem o jogo na raiz mesmo com o build no GitHub Actions).

### Alterado
- Menu principal: em tela grande começa a 27vh e as opções usam `clamp(24px, 3.9vh, 30px)`; em tela baixa `clamp(15px, 5.6vh, 26px)` — as 10 opções cabem em 812×375.
- `deploy-pages.yml`: `ELECTRON_SKIP_BINARY_DOWNLOAD=1` no `npm ci` (o site não precisa do Electron).
- `.gitignore`: `release/` e `android/` (gerados).

## v3.24.1 — 2026-10-16

### Adicionado
- `awakenMode`: `drain` / `drainMax` / `drainRamp` / `drainFloor` (perde vida com o tempo sem passar do piso) e `lowHealth` `{ from, min, max }` (o multiplicador de dano sobe em linha reta conforme a vida cai).
- Opções `volume` (`VOLUME_OPTIONS`, `AudioManager.setVolume`) e `reduceFx` (`FX_OPTIONS`: `World.screenFlash` não pisca e `CameraRig.shake` a 25%); chaves `opt.volume` / `opt.fx*` nos 13 idiomas.
- `check-roster`: todo `type` de habilidade, □, especial e transformação existe nos registros e todo som dos kits existe (`AudioManager.SOUND_NAMES`).

### Alterado
- Cristopher: especial "Por Você, Filho!"; Transformação "Último Sacrifício" (`lowHealth` 1,25 → 1,8 a partir de 35% da vida, só físico; `drain` 3 → 5 em 40 s, piso 1; `knockbackTakenMult` 0,5; `armorEvery` 4).
- `props.liveCable` (cabo do Anfitrião): buffer de vértices fixo reescrito no lugar, sem criar um `TubeGeometry` por quadro.
- `TODO.md`: versão de referência v3.24.1; saíram os itens já prontos (§75 e quatro itens do §76.5).

## v3.24.0 — 2026-10-16

### Adicionado
- Lutador `cristopher` (`src/characters/cristopher.js`, Ordo Realitas, Sangue), na página 1 depois do Veríssimo.
- `src/combat/cristopherAbilities.js`: tipo `stuntCar` (o carro vem por trás, ele desvia, o carro atropela e capota na parede) e o modelo `stuntCar()`.
- Modelo `tools/blender/char_cristopher.py` → `public/models/cristopher.glb` (fonte `tools/blender/fonte/cristopher.blend`): relevo dos músculos com `relief`, a regata e o cabelo com `clothe` (cópia inflada e cortada da malha do tronco / da cabeça), calça e sapatos por escultura.
- `sculpt_lib.clothe` (roupa justa a partir de uma peça do corpo, com a malha avaliada e subdividida antes do corte).
- Texturas `face_/skin_torso_/arms_/tank_cristopher`; pose `vic_cristopher`; cena de agarrão `cristopher`; falas (introdução, vitória, batalha) e regras no `check-roster`.
- `tools/fetch-lore.mjs`: `cristopher` como id do Cristopher Cohen.

## v3.23.1 — 2026-10-16

### Alterado
- Rituais compartilhados na versão mais nova (v3.16/v3.19): Dante □ Decadenza `projectile` → `decadence`; Dante Embaralhar "Trinitá" `shadowClones` → `shuffle`; Cicatrização do Dante ("Paradiso") e do Xande `healOverTime` → `agingHeal`; Velocidade Mortal do Xande `selfBuff` → `deadlySpeedTrail`; `curseWeapon` de Aghata, Balu, Xande e Lírio com os números do Guizo (20 / 18 s / 8 s / sangramento 4 por 3 s).
- `Fighter.tryRanged`: um □ cujo `type` é um tipo de `ABILITY_TYPES` (que não seja `projectile`) roda como habilidade, com a recarga e o custo do □.
- Modelos refeitos: `char_juan.py` (relevo esculpido no tronco com `relief`, manto `shell_grid` rasgado, capuz/cabelo/calça/chaparreiras por escultura, correntes `chain_mesh`, grampos 3D) e `char_deus_morte.py` (corpo esculpido por partes com estrias e a espiral do peito por deslocamento, cor por vértice, espiral emissiva, fios de Lodo); fontes em `tools/blender/fonte/`.
- `sculpt_lib.py`: `rod`, `outward`, `ring_pts`, `shell_grid` (vindos do Cristino), `relief`, `chain_mesh`, `vcol_material` e `paint`.
- `glbRig`: `vertexColors` quando a malha tem `COLOR_0`; material com `fine_` no nome fica sem contorno.
- `weapons.peixeira`: lâmina de ~50 cm, dorso reto, guarda de latão e cabo de chifre.
- `check-roster`: regra dos rituais compartilhados; regras do Dante e do Xande atualizadas.

## v3.23.0 — 2026-10-16

### Adicionado
- Lutador `cristino` (`src/characters/cristino.js`, origem `Transtornados`, Sangue) e a forma `cristino_desertor` (`forms/cristino_desertor.js`); equipe `Transtornados` em `config/teams.js`, no título e na página 2 da seleção.
- `src/combat/cristinoAbilities.js`: `addFireZone` (fogo no chão), `lanternBlast`, `placeLantern`/`lanternsOf`/`explodeLantern`, `detonateLanterns` (detonação em cadeia num cone), `lobLantern` e os tipos `lanternThrow` e `lanternTrap`.
- Especial `lanternCount` (`specials/lanternCount.js`): três lampiões em cerco → cinemática com a contagem e o tiro → três explosões + a grande (250 dividido); fora do cerco, os lampiões viram armadilhas.
- Modelo `tools/blender/char_cristino.py` → `public/models/cristino.glb` (fonte `tools/blender/fonte/cristino.blend`); `tools/blender/sculpt_lib.py` (escultura orgânica por metaballs para os `char_*`); armas `socadeira`, `peixeira`, `spikedLantern`, `tenebrisPendant` (`weapons.js`); `addCristinoProps`/`addCristinoDesertorProps` (rabiscos vermelhos como mapa de brilho); texturas `face_/shirt_/jacket_/trim_/pants_/bandage_/hat_cristino`, `bloodSymbol` e `leather`.
- Pose `vic_cristino`, cena de agarrão `cristino`/`cristino_desertor`, falas (introdução, vitória contra os 25, batalha) e regras no `check-roster`.

### Alterado
- `teleportBehind`: `a.rope` (sobe pela corda e cai atrás em vez de afundar na sombra). `heavyBlow`: `a.bleed` e `a.downBonus` (mais dano em alvo atordoado, agarrado ou puxado).
- `Fighter.tryRanged`: `ranged.ignitesLanterns` detona os lampiões do lutador no primeiro disparo. `rig.showProp('a+b')` mostra/esconde as duas peças.
- Carniçal refeito: `npc_carnical.py` agora esculpe cada parte com metaballs (estrias por deslocamento, cor por vértice `COLOR_0`) e guarda `tools/blender/fonte/carnical.blend`; `buildNpcModel` liga `vertexColors` quando a malha tem cor por vértice.
- `tools/fetch-lore.mjs`: origem `Transtornados` (Cristino e a equipe); `lore/membros.json`/`MEMBROS.md` regerados; `lore/NOTAS.md` com o arsenal e o mapeamento do kit do Cristino.

## v3.22.0 — 2026-10-16

### Adicionado
- `summonMananciais` (Ferreiro), `summonCarnical` (Deus da Morte) e `summonInkBeasts` (Amigo) em `abilities.js`; NPCs `Carnical` e `InkBeast` em `src/combat/beasts.js` (modelos em `src/models/beasts.js`).
- Modelos: `char_manancial.py` (models/manancial.glb, fora da seleção), `npc_carnical.py`, `npc_bicho_lib.py` (+ `npc_javali_tinta.py`, `npc_cao_tinta.py`); texturas `face_/gown_/pants_manancial`; clipes `man_*`; som `siren`.
- `def.hpBar` (barras de vida dos Portadores, `.hb-*` em `styles.css`); `Fighter.untrackable()` e `STICKY_SPECIALS` (Shhh sem rastro); `DanteClone` aceita `o.anims` e `o.onSlain`; `hitBy(..., { bullet })` para o Corpo Fechado.

### Alterado
- `COMBAT.maxHealth` 1000 → 1500 e `roundTime`/`timer` 99 → 150 (`TIMER_OPTIONS` 45–180); vida individual removida do elenco (Portadores 1800; formas de Portador 1800–2100; outras formas 1500 + bônus); o número de vida saiu do HUD e da barra de chefe (`def.boss`).
- Senhor do Sangue: O Diabo só zumbis fracos; o Portador do Trono sempre com o forte.
- `.gitignore`: `__pycache__/` (os .pyc que entraram no commit anterior foram tirados do repositório).

## v3.21.0 — 2026-10-11

### Adicionado
- `src/combat/amigoPowers.js` (`AMIGO_TYPES`, registrado em `abilities.js`): `inkMelt` (Derreter), `inkTentacles` (Tentáculos que Prendem), `bellToll` (O Sino), `inkDissolve` (Dissolver) e `meltFace` (o debuff `meltedFace`).
- `src/combat/specials/inkRequiem.js`: especial Todo Mundo Vai Morrer (tentáculos erguem, garras, derreter, última badalada).
- `src/fx/inkFx.js`: `inkTentacle`, `inkSplash`, `ghostBell`, `bellWave`.
- `Fighter.updateInkStream` (`def.inkStream`: jorro de tinta do socket da boca até o chão com poça), golpes com `tentacle` (`spawnStrikeTentacle`) e `impactFx: 'ink'`.
- Clipes `ai_*` em `anim/charClips.js` (run/walk/strafe/dash, claw_r/l, lash/lash_l, rake, tear, up, down, air, fling, point, pour, bell, dissolve, block, charge, frenzy).
- Projétil `inkClaw` e `ropeColor`/`ropeThick` para a corda do `chain`; sons sintetizados `bellToll` e `inkPour`; cena de agarrão própria do `amigo` com o finalizador `ink`.

### Alterado
- `char_amigo.py`: capuz em visor com dentes, barbatanas nas costas e no capuz, cauda do manto, fitas, tendões na frente, 12 tentáculos enrolados, mangas rasgadas e garras curvas.

## v3.20.0 — 2026-10-11

### Adicionado
- Lutador `amigo` (`src/characters/amigo.js`, `tools/blender/char_amigo.py`, clips `ai_idle` e `vic_amigo`): elemento `tinta`, `drips` no socket da boca, falas completas.

## v3.19.1 — 2026-10-11

### Adicionado
- Elementos `transmissao` (#5aff6a) e `tinta` (#8a5a2a) em `src/config/elements.js` (neutros: fora do `BEATS`).
- Especial `mindTorture` (`src/combat/specials/mindTorture.js`): aviso com sigilo, paralisia com fios de sinal, 3 autogolpes com os golpes do próprio alvo, `forced_kneel`, apagar memória (recargas no máximo, `sp.forget`, sanidade 0) e o toque final.
- Habilidade `abductBeam` (Estrangeiro — Abdução, R2 + △): círculo de aviso, ergue (`launch` alto) e crava (`spike`).
- Clip `forced_kneel`.

### Alterado
- `estrangeiro`: elemento `transmissao`, especial `mindTorture`, golpe novo "Pulso de Sinal" (`wave_punch`, 3,6 m).
- `titleStage` LINEUP: um lutador de cada equipe (Xande, Kian, Arthur, Jae, O Diabo).

## v3.19.0 — 2026-10-11

### Adicionado
- Lutador `estrangeiro` (`src/characters/estrangeiro.js`, `char_estrangeiro.py`, `face_estrangeiro`, `vic_estrangeiro`).
- Modelo `o_diabo.glb` (`char_o_diabo.py`, `face_o_diabo`): o Diabo canônico; `o_diabo.awakening` = `devilPact` → forma `diabo`.
- Habilidade `summonMasks` (Magistrada — Chamar as Máscaras): `DanteClone` parametrizado (`restyle`, `setup`, `strikes`, `hp`, `rise`); texturas `mask_seita_*`.
- `cinematicCombo`: `sp.sphere` (esfera da Prisão das Sombras, animada pelo próprio especial).
- `maskTransform`: `sp.randomForms` (sorteio da forma); formas `guizo_bombado` e `guizo_velho` (variantes de modelo).
- `teleportBehind`: `a.vanishFx` ('sigil' / 'signal') e a borda do poço na cor da habilidade (`shadowDisc` `rim`).
- Joui: `Envelhecimento Localizado "Mateo"` (`healOverTime`).

### Alterado
- Magistrada: físico novo (bengala + Mão das Sombras, `impactFx: 'sigil'`), especial com a esfera.
- Gal: Velocidade Mortal → `deadlySpeedTrail`. Dante: `pocaLodo` → `rotura` (`decadence`).
- `gen-moves`: `launchHigh` e variações do □ que disparam habilidades; `HABILIDADES.md` regenerado.

## v3.18.0 — 2026-10-10

### Adicionado
- Equipe `Portadores das Relíquias` (`src/config/teams.js`, curta "Portadores"): `o_diabo`, `magistrada`, `arnaldo`, `ferreiro`.
- Lutadora `magistrada` (`src/characters/magistrada.js`, `tools/blender/char_magistrada.py`, `face_magistrada`, `bengala()`, `vic_magistrada`, agarrão do Arnaldo, falas completas e pares com Kian, Joui e Arnaldo).
- Lutador `o_diabo` (`src/characters/o_diabo.js`): kit da forma `diabo` + golpes frente/trás/lado; despertar `awakenMode` "Coroa de Espinhos"; agarrão, falas de introdução, vitória e batalha.
- Forma `juan_odio` (`src/characters/forms/juan_odio.js`) + variante de modelo `juan_odio` (`addJuanOdioProps`: `bloodHand`, `hoodUp`, `hateEye`); cena `maskTransform` `'hate'`.
- Transformação em dois estágios: `awakening.chain` (a Barra enche dentro da forma; `awakening.fill` acelera) — Juan → `juan_odio` → `diabo`.

### Alterado
- `juan.awakening`: `devilPact` → `maskTransform` (`scene: 'hate'`, `form: 'juan_odio'`); o `devilPact` virou o 2º estágio.
- `devilPact.canStart` aceita `sp.chain`; o trono afunda pelo flag `transformed` (não mais por `!f.baseForm`).
- Ordem do `ROSTER`: Arnaldo e Ferreiro saem da Ordo / Luzidios para os Portadores; título com "PORTADORES".

## v3.17.1 — 2026-10-10

### Alterado
- `char_juan.py`: cabelo em mechas (`hair_pt`/`strand`), franja sobre o olho esquerdo, meio rabo, raspado (`undercut` projetado no crânio); manga direita até o punho; tiras esfiapadas na barra e nas bordas do manto.
- `char_dante.py`: xale com abertura menor (`GAP` 0.13 → 0.075) e frente curta (poncho); `skin_dante` com manchas graúdas e espirais maiores.
- `char_erin.py`: cabelo de trás em mechas onduladas no lugar do tubo + cones.

### Corrigido
- Troncos do Juan e do Diabo com material de pele (`skin_torso_juan`, `skin_torso_diabo`): não ficam mais tingidos pela luz das arenas.

## v3.17.0 — 2026-10-10

### Alterado
- `katana()` / `scabbard()` (`src/models/weapons.js`): lâmina curva (`katanaShape`, corpo + hamon), tsuba octogonal, ito em losangos, saya curva com sageo.
- `char_joui.py`: capuz caído grande; `char_labirinto.py` reescrito com tronco próprio (robe transpassado); `char_arthur.py`: cabelo em mechas até o coque, barba em ponta, gola e suspensórios; `char_aghata.py`: jaqueta curta, gola alta, luvas, coturnos.
- Texturas `skin_labirinto` / `face_labirinto` (pele acinzentada), `plaid` (flanela cáqui), `arms_vampira` (sigilos menores).

### Corrigido
- `Fighter.setOpacity` religava o contorno de peças escondidas; o contorno agora guarda a malha de origem (`userData.source`) e só aparece com ela.

## v3.16.4 — 2026-10-10

### Alterado
- `char_lirio.py`: sem a malha de barba/bigode (só a barba rala pintada em `face_lirio`).
- `leonora()` (`src/models/weapons.js`): barril de tábuas, espinhos de metal nas cintas, tufo de pelo, faixa preta no cabo.

## v3.16.3 — 2026-10-10

### Adicionado
- Passiva `kianScript` (A Escrita, `src/combat/kianPowers.js`), visual `scriptWave`, `blink.strike`, `onHit.script`, marcas na Levitação.

### Alterado
- Modelo do Lírio refeito (`char_lirio.py`); `shirt_lirio` desenhada na orientação certa.

### Corrigido
- Tronco nu do Kian/Colosso com material de pele (`skin_torso_*`): não fica mais tingido pela luz das arenas.

## v3.16.2 — 2026-10-10

### Adicionado
- Forma `kian_calamidade` (Transformação do Kian, cena `calamity` no maskTransform; `unblockableMelee` no Fighter).
- Texturas `torso_kian` e `arms_kian` (com brilho).

### Alterado
- Modelo do Kian refeito (`char_kian.py`), rosto `face_desconjurado` refeito.
- Guizo: pele, cabelo, ombros, gola e barra da calça.

## v3.16.1 — 2026-10-10

### Alterado
- Furtividade (`stealth`) desenhada por quem olha a tela: silhueta + anel para o dono, invisível no online para o adversário (`world.viewSlot`); câmera usa a última posição vista contra a CPU (`Fighter.camPos`).
- Cego e surdo com efeito visual enquanto duram.

## v3.16.0 — 2026-10-10

### Adicionado
- Lutador GUIZO (Os Cinco) e a forma Disfarce Alienígena (`guizo_et`): modelo, câmera/faca/cabeça de ET em código, kit, falas, agarrão, vitória.
- `src/combat/holo.js` (cópias que copiam a pose do dono) e `src/combat/guizoAbilities.js` (decadence, doomSpirals, shuffle, deadlySpeedTrail, agingHeal, mindLink).
- Cena `distort` no maskTransform; `copies`/`outro` no cinematicCombo; visual `mindSigil`; `onHit.label`/`onHit.distort` nos projéteis; `grip.stow`/`grip.bothHands`.

### Alterado
- Modelo do Ferreiro refeito.
- CPU: carrega sanidade quando falta para as habilidades, gasta mais com a barra cheia, habilidade guardada por 1,6 s; chance base de habilidade maior em todos os níveis.

### Corrigido
- Cena de abertura Lírio × Xande (chave 'xande+lirio' → 'lirio+xande').

## v3.15.1 — 2026-10-10

### Adicionado
- Clipe `fist_clang`; `cinematicCombo` com `prepare.beats` e golpes de cena `noHit`.
- Sons sintetizados `metalPunch` e `fistClang`.
- `src/config/teams.js`: cor por equipe no fundo dos retratos.

### Alterado
- Colosso: manoplas de metal no modelo, especial com o choque dos punhos, `hitSound` de manopla em golpes e habilidades.
- Escolha de cenário em grade 3 × 2 com ▲ ▼ por linha.

## v3.15.0 — 2026-10-10

### Adicionado
- Lutador DALMO MAGNO / O COLOSSO (Mascarados, Energia): modelo, kit, transformação `helmet` com troca de roupa (`sp.swap`, `sp.finalAnim`), forma Colosso, falas, agarrões, vitórias e vilão das Torres.
- Tipos de habilidade `arenaGrab`, `stompQuake` e `arenaCounterStance`; □ do tipo `counter` (postura que segura o golpe e devolve com um `arenaGrab`); `heavyBlow` com `stun` e `pressure`.
- Assistência própria do Dalmo (Atropelar / cabeçada + soco).

### Alterado
- Modelo do Dalmo refeito: tronco com barriga e peito, ombros redondos, braços grossos, camisa folgada com gola grande e fralda para fora, calça cargo larga, coturnos de cano alto, dreads caindo pela testa.
- Juan de volta aos Mascarados; seleção com quebra de página por equipe e etiqueta de equipe.

### Corrigido
- Câmera com aspecto NaN (tela de tamanho zero) levava lutadores para posição NaN.

## v3.14.0 — 2026-10-09

### Adicionado
- Cenário ACAMPAMENTO VARMINHO (Sinais do Outro Lado): fogueira animada, barracas, van dos Cinco, Estação de Transmissão, céu estrelado.
- Cenários: estrelas, fogueiras animadas e várias camadas de partículas por config.

### Alterado
- Tiro carregado da sniper (Arthur, Kemi, Fantasma): laser com atraso, tiro no ponto do laser, aviso antes do disparo automático, bala mais lenta.

### Corrigido
- Modelo antigo de outro personagem aparecendo quando um .glb falhava (modelos procedurais removidos; download com novas tentativas e aviso).

## v3.13.0 — 2026-10-09

### Adicionado
- Modo TORNEIO local (2 a 8 participantes, solo/equipe, humano/CPU por vaga) com montagem em 3 passos e chave em árvore espelhada.
- Lutadora JAE (Park Jae-Yoon) e a forma X: modelo próprio, kit (Punhal X, Shhh..., Assassinato Furtivo, Zona dos Sussurros, A Marca do X; X: Zona das Sombras e Assassinato Cruel), cena de transformação do capuz, falas e agarrão.

### Alterado
- CPU guarda a habilidade escolhida no meio de um golpe e usa no primeiro quadro livre; transformação priorizada.

### Corrigido
- Transformação do Juan (Renascimento) congelava o jogo.
- Punhais arremessados da Jae não acertavam.

## v3.12.0 — 2026-10-09

### Alterado
- Efeitos sonoros gravados (CC0) no lugar dos sintetizados: golpes, espadas, whoosh, bloqueios, K.O., tiros (M4, escopetas, sniper), sons paranormais, garras, correntes, teleporte e o zumbido da Carga de Poder (em loop). A risada do Anfitrião continua a sintetizada.
- Efeitos visuais com texturas (CC0): fumaça, clarão de golpe, explosão, pedrinhas, faíscas elétricas; corte de lâmina com degradê e varredura.

## v3.11.0 — 2026-10-09

### Adicionado
- Modo TORRES: 8 torres com cadeado, torre em 3D com câmera subindo, lutador fixo, dificuldade para a torre inteira e vilão fortalecido no topo; melhor dificuldade zerada por torre.
- Interface traduzida em 13 idiomas, trocando na hora (avisos de combate e mensagens online incluídos).
- Pose de vitória própria do Arthur.

### Removido
- Opção de movimento "relativo ao inimigo".

### Corrigido
- Luta espelho travando na introdução.

## v3.10.1 — 2026-10-08

### Corrigido
- Fita da espada do Arnaldo/Veríssimo preta quando pendurada parada.

### Alterado
- Senhor Veríssimo: golpes e habilidades com nomes da série e do RPG (Olhos Sempre Abertos!, Em Seu Caminho, Brecha na Guarda, Oficial Comandante, Escopeta de Varredura, Líder da Ordo Realitas).

## v3.10.0 — 2026-10-08

### Adicionado
- Arnaldo Fritz (transforma em O Anfitrião) e Senhor Veríssimo.
- Gal: Ativar Ereshkigal (trás + □) liga a cura que cobra sanidade por 6 s.
- Falas curtas durante a luta (vida crítica, especiais, transformações).

### Alterado
- Vantagem/desvantagem elemental dos rituais: ±10% → ±15%; Xande de Conhecimento.
- Passo da defesa contínuo; escape do agarrão nas duas ordens.
- Balu arremessa a maça do Machado Demônio quando ela está na mão.

### Corrigido
- Tela preta na vitória com O Anfitrião; fita vermelha da espada voltando a ficar preta.

## v3.9.4 — 2026-10-06

### Alterado
- Balu, Resistência à Dor (transformação): agora vira um TANQUE — recebe 45% menos dano, quase não é empurrado, aguenta golpes sem recuar (guarda até 2, um novo a cada 1,5 s), recupera 25% da vida ao transformar e bate 20% mais forte; em troca anda um pouco mais devagar.

## v3.9.3 — 2026-10-06

### Alterado
- Balu com modelo novo, seguindo as referências: cabelo preto volumoso penteado para trás com gel, bigode grosso e cavanhaque só no meio do queixo, ombros e braços bem mais fortes, polo verde-clara de gola aberta e jeans até o cinto.
- Machado do Balu refeito: lâmina grande em barba com o fio de aço claro, miolo escuro com furos e gravações, ponta-lança no alto, gancho atrás e o cabo de madeira com faixas de pano enroladas.

## v3.9.2 — 2026-10-06

### Corrigido
- Online no celular: dá para escolher o lutador TOCANDO nele (antes o toque não fazia nada na partida online). O 1º toque olha, o 2º confirma.
- Online: os dois jogadores escolhem AO MESMO TEMPO, cada um na própria grade (marcada com "VOCÊ"), e confirmam — ninguém precisa esperar o outro. Depois, qualquer um toca em COMEÇAR.
- Online no celular: as configurações da batalha, a escolha do cenário, a pausa e a tela de vitória também aceitam toque.

## v3.9.1 — 2026-10-06

### Corrigido
- Celular: as opções do menu respondem ao PRIMEIRO toque (antes, no submenu, às vezes era preciso tocar duas vezes).
- Celular: a HUD da luta volta a mostrar as habilidades, numa faixa compacta com o comando de cada uma, a recarga e o contorno de pronta.
- Celular: os comandos na HUD e nas dicas aparecem com os botões da tela (△ □ ○ × DEF ESQ) em vez das teclas do teclado.
- HUD: quem paga rituais com vida (Arthur, Erin Em Nome do Caos) não aparece mais com as habilidades bloqueadas por "sem sanidade".

## v3.9.0 — 2026-10-06

### Alterado
- Tela inicial nova: os lutadores em 3D contra a luz (contorno na cor do poder de cada um) sobre o círculo ritual brilhando, cinzas subindo, neblina e a câmera se aproximando devagar; logo redesenhado ("ARENA" sobre "PARANORMAL" metálico com brilho e glitch, a linha dos cinco elementos), vinheta e granulado de filme. Com o menu aberto, o logo vai para o canto e o menu vira uma coluna à esquerda.
- Corrigido: depois de uma partida, os personagens podiam ficar invisíveis na seleção (só a arma aparecia).
- Corrigido: a Erin (e o Labirinto/Aguiar) voltava mascarada no round seguinte depois de transformar.
- Erin, Em Nome do Caos: o especial agora também começa com a granada de luz — dá para sair de baixo, esquivar ou defender. Se cegar: ela corre até o adversário, dá o tiro de escopeta e se explode. Se errar, ela fica exposta e não se explode.
- Labirinto (???): a Tempestade Caótica do □ virou um RAIO CONTÍNUO que sai da Antena por uns 2 segundos e persegue o adversário (correndo de lado ou com dash dá para escapar; a defesa segura). Sem o capacete continua sendo a bola de energia.

## v3.8.2 — 2026-10-06

### Alterado
- Erin: o especial Supernova agora precisa ser PEGO. Ela arremessa primeiro uma granada de luz (no ar, sem parar o tempo) no lugar onde o adversário está. Dá para escapar: sair de baixo, esquivar na hora ou defender de frente para ela (cobre os olhos). Se errar, ela fica parada e aberta. Se o clarão cegar o adversário, aí sim vem a cutscene: ela corre até ele, dá o tiro de escopeta à queima-roupa e o explode com a granada do coração vermelho.

## v3.8.1 — 2026-10-06

### Alterado
- Erin: a transformação Em Nome do Caos agora tem cena própria — ela ajoelha rindo descontrolada com a mão agarrando o rosto, levanta e VESTE a máscara de gás, que acende em verde (sem o vermelho dos Mascarados: ela não é uma deles). A máscara fica no rosto o round inteiro.
- Máscara de gás da Erin remodelada como nas referências: borracha preta dos olhos ao queixo, duas lentes redondas com aro brilhando em verde, filtro na frente da boca, cartucho grande na bochecha e tubos verdes brilhantes descendo até o peito.

## v3.8.0 — 2026-10-06

### Alterado
- Transformações dos Mascarados refeitas seguindo as animações de referência: o Labirinto segura o capacete sorridente no peito, ergue acima da cabeça e encaixa; o Aguiar agacha com o machado esticado e leva a máscara ao rosto; a Kemi solta as faixas dos braços, que chicoteiam num rastro vermelho, e abre o braço como a Fantasma. Quando a máscara encaixa a cena fica vermelha e o assassino fica com uma aura vermelha até o fim do round.
- Juan: a Armadura de Sangue Diabólica agora explode do ombro em espinhos de sangue antes de endurecer. Transformado, o nome dele é PORTADOR DO TRONO.
- Erin, Em Nome do Caos: SEM SANIDADE — a barra fica zerada e travada e tudo que gastaria sanidade (granadas, Bênção Maldita, dash longo) sai da VIDA; os golpes ficaram ainda mais fortes. O especial ganhou uma cutscene: se ela alcança o adversário, o tempo para, close na máscara de gás (ela ri), nas três granadas sem pino, nos dois — e a explosão vista de longe.

## v3.7.1 — 2026-10-06

### Alterado
- Mascarados: ao pôr a máscara na Transformação, o nome na tela muda para o do assassino — A FANTASMA (Kemi), ??? (Labirinto) e MUTILADOR NOTURNO (Aguiar).

## v3.7.0 — 2026-10-06

### Alterado
- Mascarados: a máscara agora é só da TRANSFORMAÇÃO (como no cânone, é ela que desperta a Intenção de Assassino) — e ficou bem mais forte, trocando o kit inteiro até o fim do round.
- Labirinto: o Capacete do ??? saiu do kit normal. Sem o capacete: Rajada Caótica, Labirinto Mental, Mapa Sanguíneo e Capturar Momento (e o especial não põe mais o capacete). Na Transformação vira o ???: Tempestade Caótica no □, Labirinto Abissal, Consumir Momento, Tempestade Caótica em área, Revelação Sanguínea, golpes 25% mais fortes e especial mais forte.
- Aguiar: a Máscara do Mutilador Noturno saiu do kit normal (no lugar: Ataque Especial, um golpe pesado de machado; o especial virou Caçada no Acampamento). Na Transformação vira o MUTILADOR NOTURNO: todo golpe do machado sangra, Ataque Mutilador, Predador Perfeito, resiste aos golpes e o especial Finalização do Mutilador fica mais forte.
- Erin: nova Transformação EM NOME DO CAOS — põe a máscara de gás e enlouquece: cortes mais rápidos e explosivos, granadas mais fortes, sem cura. Especial Em Nome do Caos: puxa os pinos de três granadas, corre até o adversário e se explode (450 de dano; esquiva desvia, defesa segura metade). Ela morre na explosão: se o adversário também cair, a Erin ganha o round; se ele sobreviver, ela perde.
- Especiais que acertam de longe agora têm AVISO: Descarnar (Aghata), O Labirinto é a Resposta, Contrato de Morte e Disparo Espiral (Kemi / Fantasma), Supernova (Erin), Shi no Kage (Joui) e Cinerária com a Acácia (Kaiser). Depois do preparo, quem usa faz o gesto — a Aghata ergue o braço, a Kemi ajoelha e mira — e um sigilo pulsa no chão do alvo (ou a mira brilha nele). Esquive ou use a Substituição no fim do aviso para desviar (quem usou fica exposto), ou defenda de frente. O Descarnar continua acertando de qualquer distância.
- Acertar quem está no aviso interrompe o especial, como no preparo. A CPU também reage ao aviso (mais nas dificuldades altas).
- Esquiva: ao gastar TODAS as cargas, por 3 s o dano recebido não conta para recarregar (a barra fica vermelha).

### Documentação
- Pesquisa e propostas de kit para Arnaldo Fritz (→ O Anfitrião) e Senhor Veríssimo; plano de redesenho da tela de início, da HUD e da identidade do jogo (`TODO.md`).

## v3.6.0 — 2026-10-06

### Alterado
- Esquiva: as cargas voltam mais rápido conforme você apanha — 1 carga a cada 70 de dano (antes 120).
- Habilidades △ → ○ e △ → □: o segundo botão precisa vir logo depois do △ (até 0,4 s). Antes, dava para apertar △, andar alguns segundos e soltar a habilidade com ○ sem querer.
- Defesa + direção (como no Storm 4): segurando R2/RT, o analógico não faz mais andar — o personagem emenda passos rápidos para os lados e para trás, sempre de frente para o rival.
- Substituição: também funciona atordoado e agora interrompe o combo do adversário (ele bate no “tronco” e fica exposto), então dá mesmo para escapar no meio da sequência.

## v3.5.1 — 2026-10-05

### Corrigido
- Substituição: ao usar L2 enquanto apanha, o lutador desvia do golpe com um passo curto para o lado (para onde o direcional aponta) e reaparece perto de onde estava — não teleporta mais para as costas do adversário. Também corrige a substituição, que não estava funcionando.

## v3.5.0 — 2026-10-04

### Adicionado
- Modo online pronto: crie ou entre em salas públicas e privadas por código e jogue partidas sincronizadas pela internet.

### Alterado
- Substituição: ao usar L2 enquanto apanha, reaparece atrás do adversário em um ponto livre da arena, interrompe o combo e ganha invulnerabilidade breve.

## v3.4.1 — 2026-10-04

### Corrigido
- Substituição: ao usar L2 enquanto apanha, o lutador cancela o golpe e reaparece no mesmo lugar, sem teleportar para trás do atacante.

## v3.4.0 — 2026-10-04

### Corrigido
- Tela de vitória: só a forma de quem venceu transformado.

### Alterado
- Super Difícil mais forte (reações, punição, esquiva de tiros, combos longos, +15%/−15%).
- Deus da Morte: especial Envelhecimento (agarra pelo pescoço, envelhece o alvo até o fim do round).

## v3.3.0 — 2026-10-04

### Adicionado
- CPU Super Difícil que aprende (ações por situação e o perfil do jogador), salvo no navegador e em public/ai/learned.json.

### Alterado
- Esquiva só gasta carga quando desvia de algo.

## v3.2.1 — 2026-10-04

### Alterado
- Dante: Decadenza soprada de médio alcance (8 m), nuvem que abre; CPU respeita o alcance do □.

## v3.2.0 — 2026-10-04

### Alterado
- Agarrão próprio para cada personagem (e formas), com finalizador dos seus poderes.

## v3.1.0 — 2026-10-04

### Alterado
- Agarrão em cutscene (câmera, dois golpes no estilo do personagem, arremesso).

## v3.0.0 — 2026-10-04

### Adicionado
- Despertar (Barra de Transformação) para os 13 personagens sem forma própria, com estados do cânone.

## v2.7.0 — 2026-10-04

### Adicionado
- Barra de Transformação (Juan, Kemi, Ferreiro): cheia + vida ≤ 35% → segurar △ passa da sanidade cheia e transforma.
- Especiais Hemorragia Severa (Juan), Contrato de Morte (Kemi), Consumir (Ferreiro); Levitação (Kian).

### Removido
- Transcender (todos) e a Transcendência do Kian; transformações pelo especial.

### Alterado
- Diabo: asas de braços e boca vertical no modelo.

## v2.6.0 — 2026-10-03

### Alterado
- Fantasma: Faixas enrolam o alvo como múmia (até 2,2 s; apertar botões solta antes).
- Teleportes com rastro (Kian, Fantasma); câmera de cinema na tela de vitória.

## v2.5.0 — 2026-10-03

### Alterado
- Curas com visual e regra próprios (Erin a mais forte; Dante parado; Ferreiro quebra ao apanhar).
- Ferreiro: Hipnose Espiral própria; Labirinto: Tempestade Caótica em área; Aghata: facas que voltam.
- Fantasma: Disparo Espiral com a bala dando a volta na arena e a câmera seguindo.

## v2.4.0 — 2026-10-03

### Adicionado
- Novo lutador: Balu (Antônio Pontevedra) — pesado da Ordo Realitas, Machado em Giro, Machado Demônio (paga com vida),
  Fala Imponente, 110%, Colete, especial Pancada do Urso, falas e assistência.
- Seleção em duas páginas (16 lutadores).

## v2.3.2 — 2026-10-03

### Equilíbrio
- Combos mais rápidos para leves/médios (`stats.attackSpeed`); pesados com mais vida (Lírio 1350, Ferreiro 1250, Aguiar 1150).
- Juan 82% → 61%: mais lento, menos cura/sangramento, Vínculo 30%, armadura automática mais fraca.
- Gal 29% → 41%: Velocidade Mortal e a sanidade drenada vai para ele.

## v2.3.1 — 2026-10-03

### Alterado
- HUD: nomes de habilidade em até 2 linhas (nome inteiro no title).
- Build dividido: three.js e personagens em arquivos próprios (sem o aviso de 500 kB).

## v2.3.0 — 2026-10-03
### Alterado
- Santo Berço com névoa; CPU limpa invocações fracas; Arthur paga rituais com vida sem sanidade.
- Diabo: Veias de Sangue saindo do próprio alvo; garras pingando sangue.
- Juan: Lâmina de Sangue em meia-lua (sangramento); Armadura de Sangue nasce sozinha ao sangrar (220 de dano).
- Aghata: Passagem de Conhecimento e Leitura de Rituais (cânone).
- Aguiar mascarado: o machado sangra também arremessado.

## v2.2.0 — 2026-10-03

### Alterado
- O Diabo (Juan) reformulado pelo cânone de Hexatombe: Pacto com escolha (aceitar/recusar), Lança de Sangue que
  empala e deixa poça (3 variações por direção), poças de sangue, Ódio do Diabo no alvo, Transportar pelo Sangue que
  arrasta o adversário, Regeneração mais forte ferido e ódio ao Conhecimento (+15%).
- Armadura de Sangue do Juan pela referência (carne porosa num lado do corpo, espinhos, veias, garras); quem conjura
  ganha o braço da faca de sangue (+25% físico); pela assistência, só resistência a golpes físicos e tiros.
- Arthur: sem Armadura de Sangue (não é do cânone); entra Analisar Brecha (+25% de dano físico no alvo por 7 s).

### Equilíbrio
- Diabo (medido já na forma desde o 1º round): 86% → 75% — sangramento da Lança 4→3/s (1,5 s), Ódio +20→+15%,
  roubo de vida 0,12→0,08, vida 1250→1150. Dante 46% e Juan (base) 64% na faixa.
- Defesa + toque na direção = passo rápido (Storm).
- Poça de Lodo do Dante é uma poça no chão; Zumbis sobem/morrem em poças; foice da Marionete risca o chão; agarrão
  da Marionete solta mais cedo apertando botões.

## v2.1.0 — 2026-10-03

### Alterado
- A Marionete (Dante) refeita no Blender e com IA nova: anda aos trancos, atravessa obstáculos, Reflexos Perfeitos e
  Ironia do Destino (agarra, arrasta e repassa 50% do dano que leva).
- Zumbis de Sangue (Diabo) refeitos: fraco e forte; Senhor do Sangue invoca 1–3 fracos ou 2 fracos + 1 forte.

### Corrigido
- Retratos da seleção com um personagem "fantasma" atrás (canvas não era limpo).
- Recursão sem fim ao montar o contorno dos modelos de invocação.

## v2.0.0 — 2026-10-03

### Corrigido
- Recuperados os IDs novos, as 420 introduções, as vitórias variadas e os valores da Fantasma desfeitos pelo commit
  `29f1170` (mantida a parte mobile dele).
- Tela de vitória com câmera dentro do cenário (no Bar Suvaco Seco ficava atrás da parede) e vencedor no centro.
- Mobile: menu cabe no celular deitado; seleção 5 × 3 sem 3D vazando; botões de combate fora da apresentação (toque
  pula); tela cheia fora da vida do P2; textos de toque no título.
- Ficha da seleção sem cortar habilidades/especial; COMANDOS rolável; especiais de transformação/invocação descritos.
- Campos do Online com fonte legível.

### Adicionado
- Pose de vitória própria para cada personagem.
- Nomes da equipe vencedora sob cada modelo.

### Desempenho
- Raios da câmera a 10 Hz: simulação ~4× mais leve.

## v1.6.0 — 2026-10-03

### Corrigido
- Restaurada a tela de vitória com a equipe vencedora em pose 3D no cenário atual, em vez de um retrato sobre fundo separado.

## v1.5.0 — 2026-10-03

### Adicionado
- 420 cenas de introdução pré-luta para os 210 confrontos, em um sistema separado das falas de vitória.
- Duas variações de vitória para cada confronto, escolhidas aleatoriamente.
- Tempo de leitura ajustado ao tamanho das falas, pausa antes de “LUTEM” e HUD de combate oculta durante a cena.

## v1.4.0 — 2026-10-03

### Adicionado
- Tela de vitória com o cenário atual, equipe vencedora completa em poses e fala do personagem ativo.
- Apresentação da primeira luta com entradas caminhando, falas originais e chamada “LUTEM”; a cena pode ser pulada
  com ×/Start.
- Falas originais de introdução e vitória contextualizadas pelas relações conhecidas e personalidade dos personagens.

### Corrigido
- Equipe vencedora agora mostra os integrantes corretos sem repetir o personagem que estava ativo no fim da luta.
- CPUs não controlam a navegação do menu de pausa; o controlador é restaurado ao continuar.

### Renomeado
- IDs e arquivos internos dos personagens atualizados: `desconjurado` → `kian`, `abutre` → `arthur`,
  `cineraria` → `kaiser`, `mascarado` → `joui`, `vampira` → `aghata` e `injustica` → `gal_sal`.
- Imports, registros de modelos, scripts Blender e assets `.glb` atualizados em conjunto.

### Validação
- `npm run build`
- `npm run check`
- `git diff --check`
