erto do alçapão". A nota da v5.24.0 no menu foi corrigida.

## v5.24.0 — A Noite Inteira em Treb Ciach

A fase do Samhain fechada numa versão só: no menu do jogo e no `CHANGELOG-CLIENTE.md` as notas da v5.22.0 e da v5.23.0
viraram uma entrada única (esta). As seções técnicas abaixo continuam como histórico.

### Mudado
- A progressão da fase: a VILA (parte 1) é a única com XP de abate e baús, e tem duas ondas a mais (`samhain.waves.count`
  8/9/10/11/12); `samhain.xp` 24/55/130 (antes 18/42/100).
- `pve/corredor.js`: as BRASAS DA CHAMA (`RUN.relicFirst` 4 s, `relicEvery` 5,5–7,5 s, `relicXp` 0,45 do nível atual via
  `xpForLevel`): `spawnRelic` põe a brasa na beirada (u = ±(meia largura − 0,6)) e força um aviso de bote no mesmo ponto
  (`spawnHazard(p, P, force)`); `takeRelic` → `giveXp` e "+1 NÍVEL GUARDADO"; o rótulo mostra "Níveis guardados N".
  As escolhas de nível continuam esperando a Árvore.
- `Dungeon.js`: na Árvore abate não dá XP (`onZombieSlain`), não cai XP (`dropLoot`), sem baús (`onWaveCleared`) e a cura
  ×0,5; `startTree` anuncia "RESGATE: N NÍVEIS" quando há níveis guardados.
- `pve/arvore.js` `doorHp`: Difícil 1800 → 1900, Muito Difícil 1700 → 1750.
- `dungeons.js` `tips` do Samhain: a vila com XP, as brasas do corredor e a Árvore sem XP.
- `dev/samhainBattery.js` `fullRun`: o nível e os guardados a cada parte; a CPU com vida cheia no corredor.

## v5.23.0 — O Fogo da Vigília

### Adicionado
- `ui/Screens.js` `LoadingScreen`: o rodapé de dicas (`tips` do modo + `tip.1…6` embaralhadas; ←/→, as setas `.ld-prev`/`.ld-next`, troca sozinha a cada 9 s), `waitStart()` (carregou: "Pressione A/× para começar" / "Toque para começar"; A/×, START, Enter, Espaço ou toque) e `update(input, dt)` chamado pelo `main.js` no estado `loading`. `main.js startMatch` e `pve/flow.js` esperam o A (LAN, Outro Lado online e torneio da CPU começam sozinhos). Chaves `load.ready`, `load.ready_touch`, `load.tip_n`, `load.loading` nos 13 idiomas. `dungeons.js`: `tips` da Tipora e do Samhain e `PVE_TIPS`.
- `pve/itensSamhain.js` `SamhainItems`: o aldeão mensageiro (sai de uma casa acesa / do alçapão, larga o item no chão com a coluna de luz e volta), pegar passando por cima, □ arremessa; COMBUSTÍVEL (poça), TOCHA (encostar na poça ateia a barreira: empurra as Assombrações para a borda e queima), LANTERNA DO CRÂNIO DE PORCO (só depois do 1º fogo; acende dentro do fogo; o clarão chama `Assombracao.blind`). `combat/assombracao.js` `blind(time, from)`: o estado `blind` (recua da luz, para de atacar; Broén metade do tempo). Ligado em `Dungeon.js` (vila e Árvore; some no corredor).
- Detalhes: `pve/arvore.js` (o alçapão: juntas, rebites, dobradiças, travas com cadeado e corrente, a runa completa, pedras-runa, musgo, crânios de porco nas estacas), `pve/samhain.js` (a gaiola da lamparina, o nabo entalhado que apaga com ela, a oferenda), `pve/corredor.js` (sulcos, cerca de estacas, flores, nabos acesos, marcos de pedra, o telhadinho das gaiolas).

### Mudado
- `treeWeaken`: 2% por lamparina até 25% (antes 3% até 45%) e sem tirar onda. A porta da Árvore: Fácil 2200, Normal 2150.
- O começo das fases de ondas mostra só a frase curta (`exploreHint`); o `about` do Samhain virou um resumo de uma linha.
- Celular (`styles.css`, `body.touch-ui`): a vida do Outro Lado no alto, o objetivo embaixo dela, o nível embaixo no meio, a barra dos aldeões abaixo da pausa, a dica no meio de cima, o marcador de dano longe dos botões; a tela de carregamento cabe no celular deitado. O corredor fala do joystick no toque.

### Corrigido
- Uma Assombração que sobrava da vila quebrava ao procurar as casas depois que elas sumiam (`houses()` agora devolve a lista da parte atual ou vazia).

## v5.22.0 — A Noite do Samhain em Treb Ciach

### Adicionado
- Modelo (Blender MCP): `tools/blender/npc_assombracao.py` → `public/npcs/assombracao.glb`: o espírito (material `espirito_assombracao`, rosto repetido) dentro de duas roupas (`Manto` de capuz amarrado de cordas, `Palha`) e quatro máscaras (`Raizes`, `Corvo`, `Demonio`, `Bode`) em juntas próprias. `models/assombracao.js` (`buildAssombracao`, sorteia roupa e máscara; o espírito escondido com material aditivo).
- `combat/assombracao.js` `Assombracao` (BloodZombie; do tamanho de gente, `models/assombracao.js` `ASSOMBRACAO_FIT`): flutua, vai atrás de casas (`houses()`) ou de quem joga, não entra na Chama de Proteção (`fireGuard`), toque frio CONGELANDO (renova, não empilha); a forte QUEBRA a fantasia no primeiro golpe fatal (volta com 55% da vida, mais rápida); a fraca deixa a fantasia caída no chão.
- `pve/samhain.js`: `SamhainVillage` (8 casas, 15 aldeões, a lamparina como vida da casa, reacender perto da porta, a TEMPESTADE com relâmpagos, raios e névoa escura) e `House`.
- Fase `samhain` "Proteja Treb Ciach" (`dungeons.js`, storyOrder 4, `boss: null`): `samhainPlan` (Assombrações, as fortes da 3ª onda em diante, Broén a cada 3, a última `storm`). `Dungeon.js`: `spawnFoe` dos tipos novos, `waves.bounds` amplia a praça a 23 m, `onVillageLost` (sem voltar à vida), `finishStorm` (a recompensa onde se está), o contador "Aldeões N/15" no objetivo; `flow.js` mostra "Nenhum aldeão sobreviveu" e `wonText`.
- `ui/portraits.js` `renderGroupPortrait` (e `paintBackground`, o fundo dos retratos separado): três Assombrações juntas (Manto/Corvo, Palha/Raízes, Manto/Bode) como o retrato do adversário na tela de carregamento do Samhain (`flow.js`, fase sem chefe único; dono: "faltou as imagens das assombrações na tela de carregamento, pode ter umas 3 juntas").
- `pve/arvore.js` `TreeDefense` (a parte 3): a clareira da Árvore Anciã no centro do mundo (o cenário da vila desce 600 m enquanto ela existe e volta no `dispose`), a árvore procedural (`buildTree`: 15 fibras torcidas em espiral, 9 galhos longos quase na horizontal com ramos, 9 raízes; ~7 m de tronco e ~10 m até se abrir, na escala do ep. 3), o ALÇAPÃO de pedra do arsenal rente ao chão (`TreeDoor`, `isHouse`: o alvo das Assombrações como as casas da parte 1; 2100/1950/1800/1700/1600 de vida, +18% entre as ondas), margaridas e flores amarelas instanciadas, colmeias de palha, arbustos vermelhos, pinheiros e bétulas, o poste com a lanterna, névoa e luz de lua. `PveHud.setWard`: a barra "Os aldeões escondidos na Árvore". `dungeons.js` `treePlan`/`treeWeaken`: as ondas com fim e sem total na tela; cada lamparina tira 3% (até 45%) das Assombrações e metade disso da vida; 14 ou mais tiram a última onda; Broén na última (Normal para cima). `Dungeon.startTree`/`onTreeLost`/`finishTree`; `flow.js`: "A porta do arsenal caiu". `dev/samhainBattery.js` (a bateria da Árvore e a fase inteira).
- `pve/corredor.js` `LanternRun` (a parte 2): corrida automática (`Fighter.runDir` em `moveInputWorld`: sempre para a frente, o comando só desvia), o caminho saindo da praça a noroeste (`RUN.angle` 3,8) num grupo girado, subida (`World.groundAt` pela distância percorrida), pedras (tropeço 4%), a multidão de 18 Assombrações recicladas nas beiradas, as peças do mapa fundido em cima do caminho cortadas pelos componentes ligados (`clearPath`, o índice volta no `dispose`), sem baús, as escolhas de nível esperando a chegada, avisos no chão com o bote das Assombrações (`applyHit`, fração da vida por dificuldade), lamparinas apagadas nas beiradas (`run.samhainLamps`), Assombrações acompanhando pelas beiradas. `Dungeon.startRunner`/`onRunnerDone`; `waves.runner`. `CameraRig.updateChase` aceita `dist`/`height` do alvo (o corredor: 6,4 m, 3,6 m).

## v5.21.2 — Agarrões na Medida

### Corrigido
- `combat/amigoPowers.js`: `big(f)` = `size / 1,15` (mínimo 1) multiplica as distâncias fixas do Derreter (a vítima presa a 1,0 m e a investida até 1,1 m), do Agarrão/Dissolver (a barra do manto a 0,35 m, o arrasto até 0,7 m e a soltura a 1,2 m) — com o Amigo maior da v5.21.1 a vítima entrava no manto.

## v5.21.1 — O Amigo Enorme

### Alterado
- `char_amigo.py` (Blender MCP): `Builder` 1,04/0,96/1,3 (≈ 2,9 m até o bico); juntas dos braços abertas e à frente (armadura refeita) para os braços saírem do manto; mangas que nascem do manto e alargam rasgadas, antebraços grossos com tendões, mãos e garras maiores; 14 tentáculos no chão + 6 erguidos. `amigo.js`: `stats.size` 1,4, `inkStream.max` 2,8.
- `pve/amigo.js`: `growBoss`/`AMIGO_SIZE` (o chefe ×1,2 desde a entrada, ×1,35 na fúria; raio e `size` acompanham, `sizeScale`); fúria com `taken` ×0,85 e `moveSpeed` ×1,3 ("Frenesi de Sangue" da wiki). `amigoPowers.js` respeita `sizeScale` no Dissolver.
- `combat/beasts.js` `InkSnake`: a curva do pescoço volta ao plano nos segmentos 2–3 e `restY` = a altura que o pescoço tira (a cauda deitada no chão).
- Baús das ondas: `waves.chestEvery` 2 e `chestFade` 6; `Chest` com `fadeAfter` (afunda e some depois de aberto); no máximo 2 fechados, num ponto livre; o gigante sempre deixa um (com mais sorte).
- `tipora.thumb`: `{ from: 'tipora' }` (a prévia do mapa de luta; a gerada não aparecia).

## v5.21.0 — Os Infectados da Ilha

### Adicionado
- Modelos (Blender MCP): `npc_cobra_tinta.py` → `cobra_tinta.glb` (10 segmentos, juntas J_seg0..9/J_head/J_jaw) e `npc_zumbi_tinta.py` → `zumbi_tinta.glb` (juntas do Zumbi de Sangue fraco; sem rosto, buraco de mordida, cabelo cobrindo, pele escura, escorridos de tinta). `npcRig.js` registra os dois; `buildInkSnake` (models/beasts.js) e `buildInkZombie` (models/bloodZombie.js), com reserva procedural.
- `combat/beasts.js`: `InkSnake` (`INK_SNAKE`: mordida e o bote que se enrola e aperta). `combat/npcs.js`: `InkZombie` (`BLOOD_ZOMBIE.ink`: cabeça baixa, curvado, braços pendurados via `armFwd/armOut/armSwing/elbow`; mordida com DERRETENDO; rastro e poça de tinta). `fx/inkFx.js`: `inkTrail`.
- `dungeons.js`: `wavePlan` devolve `foes` por onda (zumbi, forte, tinta, javali, cao, cobra) com `WAVE_DIFF` por dificuldade; `tipora.xp` por tipo.
- `Dungeon.js`: `spawnFoe(tipo, pos, {hpMul})` (`FOE_HP`), as ondas mistas e o XP por tipo em `onZombieSlain`.
- `pve/amigo.js`: `AmigoBrain` — fúria com 50% da vida (nome TODO MUNDO VAI MORRER, ×1,25 de dano, explosão de tinta, bando por dificuldade e reforços com teto).
- Teste das ondas: tipos somam o tamanho, 1ª só zumbis, os três animais da 4ª em diante, mais animais/tinta nas difíceis.

### Alterado
- `npc_bicho_lib.py`: javali e cão remodelados (pernas altas, corcunda, pescoço erguido); `INK_BEAST` alturas 1,5 / 1,2.
- `BloodZombie.pose`: braços configuráveis por `cfg` (o padrão não muda).

## v5.20.0 — Dificuldades Trancadas

### Adicionado
- `dungeons.js`: `diffUnlocked(campanha, fase, dificuldade)` (Fácil e Normal sempre; cada uma acima com o recorde da fase na de baixo, ou já vencida) e `clampDiff` (a mais alta aberta até a pedida).
- `flow.js`: a tela de dificuldade tranca (🔒, "Vença esta fase no X para abrir", `disabled`) e começa numa aberta; `beginPhase` limita a dificuldade (o "PRÓXIMA FASE" cai para a aberta e avisa); online fica tudo aberto. `toDifficulty` exportado.
- Teste "Dificuldades trancadas por fase".

### Alterado
- `tipora.name`: "Proteja a Ilha de Tipora"; a tela de carregamento não repete o lugar quando o nome já o contém.

## v5.19.0 — Ondas em Tipora

### Adicionado
- `dungeons.js`: fase `tipora` (`storyOrder` 2,5, `minDepth` 2, arena `tipora`, chefe `amigo`), módulo único `praca` com `kind: 'waves'` (sem `rects`: vale o raio da arena), `waves` (`count` por dificuldade 7/9/10/12/13, `bossEvery` 3, `rest`, `firstDelay`, `spawnRadius`, `giantHp`), `about`/`aboutShort` (a explicação). `wavePlan(D, dificuldade)`: `horde` (2 → 7 zumbis, fortes a partir da 4ª), `giant` (sozinho) e `boss` (a última).
- `Dungeon.js`: `startWaves`, `updateWaves`, `startWave`, `onWaveCleared` (baú depois do gigante), `waveObjective` (HUD "Onda N de T"), `wavesBossIntro` (o Amigo sobe de uma poça de tinta do outro lado da praça); `unlockExit` sem porta (a fase acaba); `stats.waves`.
- `combat/npcs.js`: `GiantBloodZombie` (`BLOOD_ZOMBIE.giant`, Zumbi Forte 1,45×).
- `characters/bosses/amigo.js`: o Amigo Imaginário de chefe (sem especial e sem transformação, 2100 de vida).
- `flow.js`: card da fase com `aboutShort` e a etiqueta ONDAS; a explicação na escolha da dificuldade; tela do fim "Caiu na onda N de T".
- Teste "Ondas de Tipora".

### Alterado
- `phaseUnlocked`: uma fase vencida continua aberta mesmo que entre uma fase nova antes dela (a Torre depois de Tipora).
- `Dungeon.enterModule` / `spawnProps`: módulo sem `rects` (o limite redondo da arena e os barris no miolo da praça).

## v5.18.1 — CPU Contorna

### Corrigido
- `CpuController.steerAround`: a direção de andar da CPU é testada a 0,7/1,4/2,1 m (`arena.blocksPoint`); bloqueada, gira para o lado livre mais próximo (25° por passo, até 150°) e mantém o lado ~0,8 s; parada ~0,4 s querendo andar troca o lado. Só no andar (sem botão apertado e a mais de 1,6 m do adversário).
- Teste "CPU contorna o obstáculo no caminho".

## v5.18.0 — A Vila do Samhain

### Alterado
- `arena_treb_ciach.py` / `treb_ciach.glb`: pórtico com galhada e lamparina (`protect_lamp`) na frente de cada casa; cordões de globos (`lamp_glass_blue/amber/rose`) entre as casas vizinhas. Feito e conferido no Blender MCP.
- `configs.js`: brilho das lamparinas e dos globos por versão (fraco de dia; a lamparina forte na pós-tempestade).

## v5.17.0 — Mais Fusões

### Adicionado
- `upgrades.js`: fusões `menteDesperta` (Lucidez 3 + Ritmo), `fluxo` (Ritmo 3 + Foco), `execucao` (Golpe Certeiro 3 + Fúria), `banquete` (Sanguessuga 3 + Caçador) e `estudioso` (Sabedoria 3 + Ímã); 12 no total.
- Teste "Fusões: 12, cada receita com passivas que existem e nenhuma receita repetida".

## v5.16.0 — A Escola Cresce

### Adicionado
- `dungeons.js` (Escola): módulos `patio` (luta), `professores` (luta), `banheiro` (espreita) e `almoxarifado` (`kind: 'stash'`, peso 0,45, uma porta só).
- `Dungeon.enterModule`: sala sem saída; ao entrar guarda a sala de antes (`stashFrom`: portas, cadeados, chave) e a porta de volta (`kind: 'return'`) a restaura sem contar sala.
- `arena_escola.py` / `escola.glb`: pátio da cantina, almoxarifado, sala dos professores e banheiro (feitos e conferidos no Blender MCP); `mcp_build(kind='arena')`.
- Teste "Escola: o almoxarifado sem saída e o pátio da cantina na rota".

### Alterado
- `rollExits`/`rollLock`: o almoxarifado nunca é a única porta, nem sai de outro almoxarifado, e não leva cadeado.
- `sobre.html`: salas da Escola, momentos dos especiais de equipe, card de fusões; retratos de Alvira, Franco, Alê e Caio.

## v5.15.0 — A Névoa da Força D

### Alterado
- `CHOREO.forca_d`: a Névoa da Força D (Cinerária do Kaiser, golpes de dentro da névoa, a equipe formada no fim).

## v5.14.0 — A Roda dos Abutres

### Alterado
- `CHOREO.abutres`: a Roda dos Abutres (círculo girando + mergulho conjunto) antes do golpe final; 6,1 s.

## v5.13.0 — Equipes Falam

### Alterado
- `CHOREO.forca_d`, `os_cinco`, `abutres` e `mascarados`: falas de cada membro com `sayer`.
- `teamScene`: a legenda é limpa no `cleanup`.

## v5.12.0 — Alvira (Vampiros)

### Adicionado
- `src/characters/alvira.js`, `public/models/alvira.glb` (`tools/blender/char_alvira.py`, feito e conferido no Blender MCP), `face_alvira`, `cajadoCruzSangue` + `addAlviraProps` (o cajado nas costas parada, na mão nos golpes).
- Tipo de habilidade `vampirismo` (marca que cura quem marcou, lida em `damage.js`), visual de projétil `metalRod`, clipes `idle_pray` e `vic_alvira`.
- `mindControl`: opções `strings` (cordas de sangue até os pulsos e a cabeça do alvo), `struggleDamage`, `buffName` e `notifyText`.
- Ligação `vampiros` (Raziel, Sabara e Alvira, mín. 3) com a coreografia `CHOREO.vampiros` (Missa de Sangue).

## v5.11.1 — Só o Keytar

### Corrigido
- `char_ale.py`: sem as tiras do antebraço (`armTail`), que pareciam baquetas na mão.

## v5.11.0 — Alê Ao Vivo

### Adicionado
- Clipe `idle_keytar` e o ticker de `addAleProps`: parade, Alê toca o keytar na horizontal.

### Alterado
- `prop_maskOn` de Alê refeito pela arte oficial (olhos à mostra, rachaduras, escorridos, boca costurada); materiais `fine_` sem contorno.

## v5.10.0 — PSIKOLERA Afinada

### Adicionado
- Passiva `fogoEmGeral` (Franco): golpe de perto aplica QUEIMANDO. `src/combat/burn.js` com `igniteFighter`.

### Alterado
- `balance.js`: `franco` 1,22/0,86 (6% → 55%), `ale` 1,22/0,87 (15% → 54%).
- Modelos `franco.glb` e `ale.glb` refeitos pelas artes oficiais; cabelo de Alê sem a touca no topo, cabelo do Franco espetado.
- `guitarraLancaChamas`, `tanqueFranco`, `mascaraFranco` e `laminaKeytar` redesenhadas pelas artes; `pants_franco` creme.

## v5.9.0 — PSIKOLERA Completa

### Adicionado
- Personagens `franco` (Guitarra Lança-Chamas, máscara de gás e tanque) e `ale` (Lâmina Keytar, máscara de corpse paint), com modelos (`char_franco.py`, `char_ale.py`), armas em `weapons.js`, props, texturas, falas, agarrões, poses de vitória e preço no Outro Lado.
- `flameStream`: opção `nozzle` (o jato sai de uma peça sempre à mostra, sem ligar/desligar a lança).

### Alterado
- `teamLinks.psikolera` lançado (`min` 3, cinco membros); `CHOREO.psikolera` com o solo de fogo do Franco e o transe de Alê; dano em 10 partes, a parte de quem falta vai no golpe final.

## v5.8.0 — Praça de Tipora

### Alterado
- `tools/blender/arena_tipora.py`: borda da praça vestida (r ≥ 17,4, fora da luta): poço, banca do peixe, redes secando, covos/caixas, lenha, varal, mural, cocho e bote virado (`edge_spot`/`local`; os arbustos desviam); chão com 70 pedrinhas, sulcos de carroça nas trilhas e 70 tufos na beira. `public/arenas/tipora.glb` refeito (848 → 989 KB).

## v5.7.0 — Download Guardado

### Alterado
- Service worker: o cache dos arquivos de `public/` não leva mais a versão. O build (`vite.config.js`, `publicHashes()`) grava o hash de cada arquivo (`HASHES`); a entrada fica guardada como `arquivo?h=<hash>` em `arena-arquivos` e, ao ativar uma versão nova, só as entradas com hash diferente são apagadas. Arquivo sem hash vai para `arena-antigos-<versão>` (como antes).

## v5.6.0 — Menu Sem Espera

### Alterado
- O menu abre antes dos downloads (`main.js`: `boot.menuReady()` no quadro seguinte); os modelos e cenários seguem baixando por trás com o selo `#netbadge`. Modo escolhido antes do fim espera na tela de carregamento (`game.pendingCmd`, `boot.wait()`), abre sozinho e pode ser cancelado (VOLTAR AO MENU / B). Teste no `npm run dev`: `?slownet=MS`.

## v5.5.0 — Carregando a Luta

### Alterado
- Tela de carregamento da luta (`LoadingScreen`): preview do cenário ao fundo (`thumb`, de `arenaThumbs`), tinta com a cor dos dois lados, retratos maiores em paralelogramo, entrada animada, VS com brilho e porcentagem (`.ld-pct`); respeita `prefers-reduced-motion`.

## v5.4.1 — Lançamento Seguro

### Corrigido
- `release.bat` lê versão e título de `src/config/version.js` (`tools/release-info.mjs`), recusa tag repetida e commit vazio, não inclui `.claude` e para no primeiro erro (antes tinha a v4.58.0 escrita no arquivo).

## v5.4.0 — Explorar no Celular

### Adicionado
- Modo Explorar com controles de toque (`Explorer.makeTouch`, `.ex-touch`): analógico flutuante na metade esquerda, arrastar para olhar na direita (`EXPLORE.lookTouch`), ▲ ▼ de segurar, » para correr e o ← dos controles de toque para sair.

## v5.3.0 — Sangue nos Ferimentos

### Adicionado
- Sangue nos ferimentos (`src/fx/woundBlood.js`, dono em `Effects.wounds`): respingo de gotas na direção do golpe, névoa fina no impacto, gotas que viram manchas no chão (48 reaproveitadas, somem em 9 s) e o ferido pingando depois de golpe forte (dano ≥ 90 ou lançamento). Chamado em `applyHit` (`src/combat/damage.js`) quando o golpe tira vida; `def.noBlood` deixa um personagem sem esse sangue.
- Opção SANGUE (`SETTINGS.blood`, padrão ligado; `BLOOD_OPTIONS`) na seção Vídeo das Opções, chaves `opt.blood.*` e `opt.desc.blood` nos 13 idiomas. Desligar limpa na hora o que estava na tela.

### Sem mudança
- Os efeitos de sangue antigos (FX_BLOOD, sangramento, poças de sangue, armaduras e lâminas de sangue) ficaram iguais.

## v5.2.0 — Tela de Carregamento

### Adicionado
- Tela de carregamento própria (`#bootscreen` no `index.html`, `src/ui/bootScreen.js`): progresso real, MB e arquivos, etapa, dicas, aviso de conexão parada e erro com TENTAR DE NOVO; aparece antes do script e mostra também falha de WebGL ou de script.
- Downloads dos .glb pela fila `src/models/netLoad.js`: no máximo 6 ao mesmo tempo, tempo limite de 30 s sem bytes e progresso; cenários e invocações também tentam de novo (`loadGLBRetry`).

### Corrigido
- O jogo podia ficar para sempre em "PREPARANDO AS LUTAS…" (download parado sem tempo limite, ou erro depois dos downloads sem aviso).

## v5.1.0 — Equipes em Cena

### Alterado
- Especiais em equipe refeitos (`src/combat/teamSpecials.js`): Balu e Rubens (Salto Fantasma, palavras-chave, Machado Demônio), Irmãos Lukic (número do trapézio, chuva das Cartas do Destino, Colheita com a bengala) e Mãe e Filho (garrafada, chutes do Arthur, juramento dos Gaudérios); 6,6–6,8 s cada.
- Versões: depois de x.59 vem (x+1).0.0; a antiga v4.60.0 passou a se chamar v5.0.0.

## v5.0.0 — Marcas no Chão

### Adicionado
- Decalques no chão (`src/arena/groundDecals.js`): sangue velho, rachaduras, queimado, óleo, terra, lama, poças, folhas e marcas arrastadas, pintados em canvas, com receita por mapa (20 cenários de luta), nas lutas e no modo Explorar.

## v4.59.0 — Olhos Brancos e a Cor dos Mapas

### Adicionado
- Gradação de cor por mapa (`src/render/grade.js`): saturação, contraste, calor da luz e cor das sombras de cada cenário, no último passe do pós-processamento.

### Alterado
- Caio Teles: olhos brancos com a máscara da placa PARE (nas frestas da máscara e no rosto, trocado no despertar).

## v4.58.1 — O Berrão de Duas Mãos

### Alterado
- Berrão e Show Final do Caio: as duas mãos no cabo, a espada cravada reta de ponta-cabeça e o microfone na boca.
- Balanceamento do Caio: 20% → 50% de vitórias (212 lutas).
- Versão nova porque a tag v4.58.0 ficou apontando para o commit da v4.57.0.

## v4.58.0 — Caio Teles

### Adicionado
- Caio Teles (PSIKOLERA) jogável: macacão de camisa de força com tiras, sangue e correntes, algemas com espinhos, a Espada Microfone com arame farpado e a máscara da placa PARE no despertar.
- Berrão e especial Show Final: ele segura a espada com as duas mãos, crava a lâmina reta no chão de ponta-cabeça e grita no microfone, que fica na boca; o adversário fica atordoado.
- Seleção de mapas em páginas de até 16 cenários.

### Alterado
- Bengala da Magistrada apontando para baixo, como a do Damir.
- Balanceamento do Caio: 20% → 50% de vitórias (212 lutas).

## v4.57.0 — A Magistrada Refeita

### Alterado
- Magistrada remodelada no Blender (pelo MCP) pela arte do Livro de Regras: mangas bufantes e calça larga esculpidas, faixas brancas de pano com franja, pulseiras douradas, gola em leque de raios dourados; calça cinza.

## v4.56.0 — O Colosso Refeito

### Alterado
- Dalmo remodelado no Blender (pelo MCP) pela arte oficial: braços, manga arregaçada, antebraços, calça cargo e dreads esculpidos; cabeça menor; UV cilíndrico nas peças esculpidas para as texturas de pano.

## v4.55.0 — Brechas

### Alterado
- Espreitador mais difícil: habilidades mais frequentes, menos tempo escondido, frestas reabrem antes (14 s), pânico mais curto e mais fraco, Cópias com mais vida, olhar drena mais, recua menos; abaixo da metade emenda botes em cadeia.

### Adicionado
- Brecha no bote do Espreitador que erra (tropeça 1 s).
- Brecha no pulo do Rastropoda e na corrida do Bilu que erram: tontos, parados e levando ×1,5 de dano.
- Teste das brechas e dos números novos do Espreitador.

## v4.54.0 — Fusões

### Adicionado
- Outro Lado: FUSÕES de melhorias (7 receitas) que saem do baú por chance quando a receita está pronta; a primeira vez é uma descoberta salva.
- Tela DESCOBERTAS no menu do Outro Lado, com todas as fusões (as que faltam como "???").
- Degolificada: estado de exaustão depois do Grito, da Investida que erra, do Agarrar no vazio e da Explosão de cabelo (não se defende e leva mais dano).
- HUD: aviso "TRANSFORMAR: VIDA ≤ 35%" com a barra de transformação cheia e a vida alta.
- Testes das fusões, da descoberta e da exaustão da Degolificada.

### Removido
- Segundo Fôlego (a segunda vida do baú): a única segunda vida é a Ressurreição da loja.

## v4.53.4 — Luz nas Costas

### Corrigido
- Outro Lado: a luz que acompanha o jogador saiu de cima da cabeça (estourava em branco personagens altos ou de roupa clara) e foi para trás dele, do lado da câmera.

### Adicionado
- Teste da posição da luz do jogador.

## v4.53.3 — Sem Brilho Preso

### Corrigido
- Outro Lado: escolha marcada sem a tela aberta não congela mais o mundo (a luz do baú presa no pico deixava o personagem brilhando em branco).

### Adicionado
- Teste da trava de segurança da escolha.

## v4.53.2 — O Baú que Travava

### Corrigido
- Outro Lado: o baú sem nada para subir ("Moedas ou vida") travava o jogo — a variável de quem escolhe tinha sumido de `openReward`.

### Adicionado
- Teste de regressão da escolha "Moedas ou vida".

## v4.53.1 — A Chama de Proteção

### Alterado
- Treb Ciach (Samhain e Pós-Tempestade): a chama de proteção usa o fogo animado das fogueiras, em amarelo, no lugar dos cones parados.
- Fogueiras animadas aceitam cores, abertura, quantidade de línguas e opacidade na config.

## v4.53.0 — Melhoria de Gráficos — Parte 1

### Adicionado
- Sombra de contato (GTAO) na qualidade gráfica alta.
- Teste dos gráficos (metal falso e níveis de qualidade).

### Corrigido
- Peças dos cenários com metal falso (metalness 0,4) que apagava a cor; reflexo só nos metais de verdade.

## v4.52.1 — Explorador

### Corrigido
- Barra de Transformação cheia que não transformava: quem já despertou não enche mais a barra enquanto a transformação vale (luta e Outro Lado).

### Alterado
- Amor e Sangue termina com o beijo do Eloy e da Kemi.

## v4.52.0 — Explorador

### Adicionado
- Modo Explorar escondido na tela inicial: voo livre pelo cenário escolhido, com colisão em paredes e chão (Espaço sobe, Shift desce, dois toques no W correm, mouse ou analógico direito olha).
- Teste da colisão do modo Explorar.

## v4.51.3 — Animações e Queda

### Adicionado
- Falas de combate (vida baixa, especial, respostas) para 19 personagens que não tinham nenhuma, e falas de transformação para 10 formas.
- 29 cenas de entrada entre personagens que se conhecem no cânone.
- Teste que exige fala de combate em todo par do elenco.

### Corrigido
- Lutas com um personagem recente ficavam sem nenhum diálogo; formas sem fala própria agora usam a da ficha base.

## v4.51.2 — Animações e Queda

### Alterado
- Especial em equipe Amor e Sangue (Eloy + Kemi) refeito: 6,2 s, 11 golpes, Kemi em Fantasma, Método Moeller, Disparo da Morte em espiral e câmeras novas.

## v4.51.1 — Animações e Queda

### Adicionado
- Poses de vitória próprias para 20 personagens que usavam a genérica ou a de outro; o Tristan, a Ivete e o Chico mostram a arma na vitória.
- Teste que barra pose de vitória genérica ou emprestada.

## v4.51.0 — Animações e Queda

### Adicionado
- Ragdoll no nocaute com o Rapier determinístico (@dimforge/rapier3d-deterministic-compat 0.21.0, Apache-2.0): só visual, joelhos e cotovelos com limite; o pacote carrega na primeira luta.

## v4.50.0 — Ecos da Sala

### Adicionado
- Som 3D: golpes, impactos e projéteis saem do lado da tela onde acontecem e baixam com a distância da câmera.
- Eco por cenário (ConvolverNode, gerado na hora): longo na Igreja, de sala na Torre/Mansão/Escola, quase nada ao ar livre.

## v4.49.0 — O Peso do Golpe

### Adicionado
- Vibração do controle pelo peso do golpe (só controle; o celular não vibra), com opção para desligar.

## v4.48.1 — Raios Rápidos

### Alterado
- Raios contra o cenário com three-mesh-bvh (câmera contra blocos ~200× mais rápida).

### Corrigido
- Pós-processamento deixava os mapas de névoa densa lavados (a névoa era misturada antes do tom e do sRGB).

## v4.48.0 — A Luz do Outro Lado

### Adicionado
- Pós-processamento na luta: bloom, vinheta com a cor do momento (despertar, especial, Outro Lado, pouca vida) e aberração cromática nos impactos; por qualidade gráfica (desligado na baixa).

## v4.47.2 — Sem Engasgo

### Alterado
- Online: atraso de entrada adaptativo ao ping (2 a 10 quadros) e sincronia de relógio entre os dois jogadores.

## v4.47.1 — Mais Leve

### Alterado
- Modelos e cenários comprimidos com meshopt: 166 MB → 65 MB de .glb; o jogo pronto (dist) caiu de 173 MB para 72 MB.

## v4.47.0 — O Outro Lado responde

### Adicionado
- No coop do Outro Lado, quem cai volta após 60 s; ficar perto do aliado acelera o retorno.
- O poço das pilastras da Torre ficou mais alto e profundo, liberando a câmera durante a queda.
- Despertar do Estrangeiro com uso automático, em rodízio, dos poderes do Outro Lado.
- Transformação de Raziel em O Verdadeiro Raziel com cena própria.

### Alterado
- Uma chave pode abrir uma entre duas portas trancadas; salas vizinhas deixam de aparecer através das paredes.
- Ninho de Interflorados abre aos pés do adversário e começa a gerar criaturas enquanto ele estiver no anel.
- Bilu corre para atacar de longe, usa sons e olhos falsos para voltar pelas costas, e seus ataques ficaram mais fortes.
- Especiais no Outro Lado perseguem um Alheio próximo quando o adversário está escondido.
- Dissolver, do Amigo, laça a vítima pelos pés, arrasta-a para dentro do manto e a cospe coberta de tinta.
- O despertar Gosto de Sangue da Sabara mantém o rosto ensanguentado e machucado.

## v4.46.0 — O Acampamento dos Pássaros

### Adicionado
- Cenário Acampamento dos Pássaros (Hexatombe) em duas versões: manhã com névoa e noite de lua de sangue.

### Corrigido
- Henri volta a ser de Sangue; o Juan (a transformação) é de Intenção.

## v4.45.2 — A Coroa de Espinhos

### Alterado
- Elemento Intenção no jogo: Cristino, Jae, Kemi, Henri/Juan, Aguiar e Labirinto (quem tocou a Coroa de Espinhos em Hexatombe).
- Página Sobre: o símbolo oficial de cada elemento na cor dele; Transmissão e Tinta com os seus Sinos.

## v4.45.1 — O símbolo do cervo

### Alterado
- Treb Ciach refeito: Samhain de dia nublado e pós-tempestade à noite azul, ambos com névoa em toda parte.
- A fogueira ficou bem maior, com ossos, a chama de proteção amarela com sigilos subindo e o símbolo de ossos com o crânio de cervo no topo.
- A aura ciano da noite pós-tempestade (flores e mato brilhando), bétulas e nabos-lanterna. As barracas saíram.
- Símbolo dourado do ritual no chão; à noite a fogueira fica acesa e caem raios.

### Corrigido
- Entrada da luta: os lutadores param antes de um obstáculo no meio (não entram mais na fogueira).
- Página Sobre: o elemento Intenção (Hexatombe) no quadro dos elementos.
- Sem poças de lodo no Treb Ciach e na Mansão do Espreitador.
- Casas de enxaimel, ruas de pedra, riacho com ponte e texturas próprias do vilarejo.

## v4.45.0 — A Vigília

### Adicionado
- Cenário Vilarejo de Treb Ciach (A Vigília) em duas versões: noite do Samhain e pós-tempestade.

### Alterado
- Outro Lado: a Sala do Sino ficou sem a porta do fundo; no lugar, um painel de transmissão com tubos.

## v4.44.3 — Segure o baú

### Adicionado
- Retorno visual ao segurar para abrir um baú: a tecla enche, uma barra de progresso corre e o baú treme com luz vazando.

### Alterado
- Mansão do Espreitador: 2 a 3 cópias por sala de luta (antes 2 a 4).

## v4.44.2 — Chiado da Torre

### Adicionado
- Filtro de transmissão em todas as salas da Torre, mais forte na sala do chefe.

## v4.44.1 — Teste da Torre

### Corrigido
- Bilu rodeava para sempre quando o jogador ficava de costas para a parede; agora fecha e ataca de lado depois de alguns segundos.
- Rastropoda empacava na parede ao fugir; agora foge para o canto mais longe da sala.
- A dica do Outro Lado cobria a barra de vida em telas baixas.
- O DANO da tela do fim da fase não contava os monstros das salas.

### Alterado
- Brilho de transmissão dos cabos da Torre mais forte.

## v4.44.0 — Fases e Kits

### Adicionado
- Outro Lado em fases separadas: cada tentativa é uma fase escolhida (Escola, Mansão ou Torre), do nível 1 ao chefe, com cronômetro e recorde por fase e dificuldade.
- Cartas de nível do kit do personagem: cada habilidade, o tiro, o combo e o especial dele, pelo nome (menos recarga, menos Sanidade, mais dano). Limite de 6 do kit e 6 passivas.
- Loja da Aghata com 20 melhorias (grade 4 × 5): Poções, Iniciação, Mais Opções, Especialista, Reflexos, Ritmo, Mente Clara e Ímã.
- Escolha de fase com a imagem de cada fase.
- Torre: cápsulas em pé (ovo ou tubo) cheias de cabos e conduítes de transmissão, cabos no teto e um tubo de vidro que fecha em volta de quem se esconde na cápsula do Sino.

### Alterado
- Rastropoda invisível de verdade, bate e foge; com a farinha aparece, mostra a vida e fica lento.
- Bilu rodeia o jogador e ataca pelas costas, depois foge para o escuro.
- PSIKOLERA: a máscara só aparece na transformação (Cindy e Eloy).
- Tela do fim da fase refeita (rota, números, recorde) e telas do Outro Lado reordenadas: a loja primeiro, local ou online depois.
- As melhorias agora valem também contra os monstros das salas.
- Cindy balanceada contra o elenco (estava fraca).
- Tela de K.O. nova, com clarão, onda de choque e letras carimbando.

### Corrigido
- A faixa do especial ficava na frente do K.O.
- Cindy andava para trás ao bater no Outro Lado.
- Portas da Escola que abriam mas não deixavam passar.
- Voltar à vida, COMANDOS na pausa, escudo da Degolificada e cápsulas do Sino.

## v4.43.0 — A Torre continua

### Adicionado
- Cápsulas de loot maiores, com brilho no chão e indicadas pela seta azul quando fechadas.

### Alterado
- No coop da Torre, especiais e cenas de entrada, saída e fim da tentativa ocupam a tela toda; a tela dividida volta ao terminar.
- A trava de mira não atravessa paredes no labirinto; o objetivo agora indica para achar a saída e as portas ficam no centro das células.
- Alheios surgem a 3–5 passos dos jogadores vivos; entradas das salas da Torre ficam mais afastadas das paredes.

## v4.42.0 — Sinais da Torre

### Adicionado
- Masmorra 3 do Outro Lado: Torre da TV Varminho, com o chefe Estrangeiro (A Presença, cápsulas, o sino, 3 fases, saída deitando numa cápsula).
- Minibosses sorteados por sala: Rastropoda (invisível; câmera, sacos de farinha arremessáveis, vida oculta) e Bilu (volta duas vezes).
- Labirinto dos Becos com paredes sorteadas, sala das pilastras, gavetas-casulo e cenas de entrada dos chefes e minibosses.
- Barras de vida com efeito de transmissão nos inimigos da Torre.

### Alterado
- Orfanato: escada da porta consertada. Loja da Aghata com retrato maior.
- O Estrangeiro jogável fica fora da seleção do Outro Lado (é o chefe da Torre), como os outros chefes.

## v4.41.0 — Amor e Sangue

### Adicionado
- Cindy Lopes (PSIKOLERA): Fuzil Baixo, Silenciar, Tiro do Palco, Máscara PSIKOLERA, Pirueta no Cânion, Última Nota, especial Show no Monica Club e despertar Pegadas de Sangue.
- Especial em equipe Amor e Sangue (Eloy + Kemi).

### Alterado
- Modelos de Eloy e Artemis polidos pelas artes oficiais; retratos do Sobre renderizados de novo.

## v4.40.0 — O show continua

### Adicionado
- Solo de Bateria do Eloy como cinematic, com a bateria em cena; Focinheira com postura agressiva; despertar com a máscara.
- Valsa de Sangue, novo especial da Sabara (dança com as lâminas e mordida que cura).
- Damir: Força Paranormal e Ódio Incontrolável no despertar.

### Alterado
- Equilíbrio de Eloy, Damir, Boris, Artemis e Sabara contra o elenco.
- Outro Lado: baús só dão moedas ou experiência antes do nível 2.
- Gacha: giro a ● 200 e chance de épico menor.

## v4.39.0 — Eloy e Sabara

### Adicionado
- Eloy Furtado, baterista da PSIKOLERA: baquetas, golpes no ritmo, o agarrão Moeller Method e a Focinheira.
- Sabara, batedora dos Vampiros: espada e adaga, facas arremessadas, Aparar e Revidar e ataques vampíricos.
- Página Sobre: seção do Outro Lado em destaque, com o ciclo da descida, masmorras, chefes, loja e gacha.

### Alterado
- Acabamento adicional nos modelos e armas dos Escriptas.

## v4.38.0 — A loja da Aghata

### Adicionado
- Outro Lado: menu do modo com moedas e tentativa; loja da Aghata para as melhorias permanentes (globais), com falas dela.
- Melhorias Precisão, Baú Farto e Ressurreição; DEVOLVER TUDO devolve as moedas gastas.
- Gacha de personagens com vitrine de 6, chances por personagem e roleta animada; compra direta continua.
- Rifle de precisão próprio da Artemis.

### Alterado
- Telas do Outro Lado (entrada, jogadores, formato, dificuldade, dados, backup, confirmações, resultado) em cartões.
- Chefes punem quem só aperta botão; Degolificada se solta de combos e entra em fúria; moedas por dificuldade.
- Modelos de Damir, Boris e Artemis polidos pela arte oficial; gadanha, Foice Amaldiçoada, bengala e revólver Apache refeitos.
- Artemis passa a comum e Damir/Boris a raros na loja; pontos antigos de melhoria convertidos em moedas.

## v4.37.0 — Os Lukic e a Artemis

### Adicionado
- Damir Lukic, Boris Lukic e Artemis jogáveis (Escriptas), com retratos na página Sobre.
- Gambá, o companheiro da Artemis: acompanha no ombro ou ao lado, se esconde no bolso e morde em alguns golpes e no "Gambá!".
- Especial em Equipe Irmãos Lukic (Damir + Boris) e ligação de grupo dos Escriptas.
- Versões de dia e de noite de lua de sangue para Ferro Velho, Circo dos Psikolera e Igreja; Orfanato Santa Menefreda à noite, com tempestade e Existidos.
- Existido de Conhecimento (modelo novo).

### Alterado
- Mansão Endiabrada e Escola Nostradamus no modo de luta: paredes altas, teto, portas e objetos.
- Tela de escolha do cenário em tela cheia, com miniaturas embaixo.
- Orfanato: nome corrigido para Santa Menefreda.

## v4.36.0 — Ferro Velho e Circo dos Psikolera

### Adicionado
- Dois novos cenários de luta: Ferro Velho, a base dos Couraças em Hexatombe, e Circo dos Psikolera, o circo dos Irmãos Davo tomado pela banda.

## v4.35.1 — Nomes dos especiais

### Alterado
- A faixa dos especiais mostra o nome do especial, com duração pelo tamanho do texto (1,5 s a 4,2 s); a frase do personagem vira legenda temporizada.
- Tela de vitória: falas "(olhos amarelos)" do Fernando saem como Luciano Carvalho, com os olhos amarelos no modelo.

### Corrigido
- A habilidade "Fernando" do Luciano não funciona abaixo de 30% de vida.

## v4.35.0 — Tristan e Ivete

### Adicionado
- Tristan Monteiro jogável (Equipe Brasa e Força D): lança-chamas segurável, Molotov com fogo no chão, Glock tática, passiva Piromania.
- Ivete Beicur jogável: briga de bar, espingarda, garrafada, charuto, Juramento, despertar A Última Gaudéria; tacada de sinuca no "Bem-vindo ao Suvaco Seco".
- Especiais em Equipe com coreografia própria: Mãe e Filho (Ivete + Arthur) e Brasa (Tristan, Erin, Fernando).

### Alterado
- Kian remodelado sobre o corpo do Luciano, mais musculoso.
- Falas do Fernando e do Luciano ("Lu" e "Fê"); legenda da abertura com o nome do Luciano.
- Balanceamento: Fernando 47%, Tristan 48%, Ivete 49%.
- Three.js 0.169 → 0.187 (Timer no lugar do Clock; sombra PCF).

### Removido
- Especial em Equipe A Casa da Ivete (com os três, vale o Mãe e Filho).

## v4.34.0 — Fernando e Luciano

### Adicionado
- Fernando Carvalho jogável (Força D), com a segunda ficha Luciano Carvalho: habilidades "Luciano"/"Fernando" trocam modelo e kit no meio da luta; o Luciano assume sozinho na 1ª vez abaixo de 30% de vida; Reação (reflete o dano, custa sanidade).
- Especial de dupla Balu + Rubens (A Coça dos Abutres).
- Tela de título com arte estática do elenco.
- Fontes das cenas por habilidade (`docs/FONTES-CENAS.md`).

### Alterado
- Animação: hitstop maior nos finalizadores, pose segurada nos especiais cinematográficos, câmera em órbita nos especiais de enxame.
- Outro Lado: menos moedas, corredores da Escola mais largos, névoa crescente, portões e passagem do chefe; texturas da Escola; Degolificada (fita, boca, alunos) e Espreitador (pupilas em 8); Espreitador rebalanceado.
- Joui Shi no Kage: Decepar → Corte Ceifador.

### Corrigido
- Travamentos no meio das partidas do Outro Lado (clones liberam a geometria; erros isolados por quadro).
- Erro ao limpar os Zumbis de Sangue na troca de sala.

## v4.33.0 — Kits do cânone e frestas

### Adicionado
- Especiais novos: Estrangulamento Capilar (Degolificada) e Emboscada das Frestas (Espreitador).
- Frestas do Espreitador no modo de luta: abre até 3 armários pelo mapa e viaja entre eles; armário atingido fica trancado; sem fresta, fica apavorado.

### Alterado
- Kit da Degolificada refeito só com cabelo (chicote, agarrão, rastejante, chuva, casulo, grito, arremesso) e do Espreitador com frestas e Fortalecer os Devorados; sem golpes herdados do Amigo/Joui.
- Mansão Endiabrada e Escola Nostradamus (arenas de luta) mais iluminadas; miniaturas reenquadradas.
- Tela de seleção de cenário em duas colunas (cartões e preview) em telas largas.

## v4.32.0 — Degolificada e Espreitador jogáveis

### Adicionado
- A Degolificada e o Espreitador jogáveis no modo de luta (equipe Outro Lado). Os chefes da dungeon derivam das fichas novas, sem o kit e com a vida e os números de antes.
- Arenas de luta Mansão Endiabrada (quarto principal) e Escola Nostradamus (bunker), recortadas dos mapas do PvE.
- Outro Lado: habilidades só de baú (Pulso de Medo, Pele de Espinhos, Golpe Certeiro, Segundo Fôlego), limite de 6 habilidades diferentes por tentativa e escolha entre moedas e vida quando não há mais o que subir.
- Barra do inimigo nas duas metades da tela dividida (coop local).

### Alterado
- Carniçal remodelado (modelo e retrato da página Sobre).
- Balanceamento inicial da Degolificada e do Espreitador.

### Corrigido
- O Escudo de Medo era desenhado na barra do P2 no coop, em vez de na barra da Degolificada.

## v4.31.2 — Outro Lado sem travamentos

### Corrigido
- Travamento ao lutar no Outro Lado: barris e caixas não tinham `hitTest`, e o primeiro projétil numa sala com eles lançava erro no `World.update`, que congelava o jogo.
- Engasgos de 60 a 420 ms nas lutas: os shaders dos efeitos de golpe eram apagados e recompilados a cada uso; agora ficam fixos.
- O laço do jogo registra o erro de um quadro e continua, em vez de parar.

### Alterado
- A equipe Outro Lado (Estrangeiro, Amigo Imaginário, Carniçal) fica bloqueada no modo Outro Lado e saiu da loja de desbloqueio.

## v4.31.1 — Outro Lado: retratos dos chefes e tela de carregamento

### Adicionado
- A página Sobre agora apresenta O Espreitador e A Degolificada com retratos renderizados a partir dos modelos 3D.
- A tela de carregamento mostra P1 e P2 contra o chefe da masmorra no coop local.

### Corrigido
- Retratos ausentes no carregamento usam uma imagem alternativa para os jogadores; a falha ao renderizar o retrato do chefe não bloqueia o início da dungeon.
- Liberação de recursos gráficos ao substituir rigs e depois de gerar retratos, reduzindo acúmulo de recursos.

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
- A Glock ficou dourada como diz o texto da wiki; a arte of