# TODO — VÉU PARTIDO (antes Arena Paranormal)

**Versão de referência atual:** v4.33.0 (2026-11-06: kits do cânone e especiais novos da Degolificada e do Espreitador, frestas teleportáveis, Mansão e Escola mais claras e a tela de cenários reorganizada). Antes: v4.32.0 (2026-11-06: a Degolificada e o Espreitador jogáveis, a Mansão e a Escola como arenas de luta, o Carniçal remodelado, habilidades do baú com limite por partida e moedas ou vida no Outro Lado). Antes: v4.31.2 (2026-11-06: o Outro Lado sem travamentos — barril sem hitTest, shaders fixos, laço que não congela — e a equipe Outro Lado fora do modo). Antes: v4.31.1 (2026-11-06: retratos dos chefes, tela de carregamento P1/P2 contra o chefe no coop local e correções de recursos gráficos). Base: v4.31.0 (a 2ª dungeon do Outro Lado — a Escola Nostradamus e a Degolificada —, baús com 1 a 3 itens, HUD minimalista e backup); versões anteriores: histórico completo nos changelogs.
**Documento:** TODO principal
**Histórico de desenvolvimento:** Changelog Admin + Changelog Cliente

## Fila de personagens novos (pedido do dono, 2026-11-02)
- [x] **Rubens Naluti** (Equipe Abutres, Calamidade) — v4.18.0: fecha os Abutres. Kit pelo cânone (Martelo, Glock
      Silenciada, faca do Johnny; Salto Fantasma, Tratar Ferimentos, Queima-Roupa, Mira de Elite, Coração Pulsante),
      especial Pelo Johnny (pedido do dono) e modelo no Blender pelo MCP com a arte de Calamidade. Balanceamento dele
      fica para a próxima rodada.
- [ ] **Depois do Rubens: um personagem que COMPLETE uma equipe que já existe no jogo** (correção do dono, 2026-11-02:
      o Aaron NÃO é o próximo). Candidatos citados pelo dono: **Beatrice**, **Tristan**, **Luciano**, **Fernando** e
      outros na mesma situação. Antes de escolher: conferir na wiki a equipe de cada um e quais equipes do jogo estão
      incompletas, e dar prioridade a quem fecha uma equipe (o mesmo critério que trouxe a Carina e o Rubens). Depois,
      o mesmo processo: kit pelo cânone com o que não for cânone marcado como PROPOSTA, modelo no Blender pelo MCP
      conferido em 4 vistas contra as referências, retrato, falas de vitória, voz de apresentação e cena de agarrão.
      **Conferido na wiki (2026-11-02):**
      - Força D (Desconjuração): Arthur, Kaiser, Joui, Dante, Erin, Beatrice, Fernando e Elizabeth. No jogo a ligação
        só tem Arthur, Kaiser e Joui; Dante e Erin já estão no elenco. **Beatrice Portinari** (a recruta, protagonista
        de Desconjuração, com o urutau Orpheu; vira a Existida) é a mais central que falta → recomendação para o próximo.
      - Equipe Brasa: Tristan Monteiro, Erin Parker, Luciano Carvalho e depois Fernando Carvalho. No jogo só tem a Erin;
        Tristan e Luciano juntos criariam a equipe. **Fernando** fecha as duas (Brasa e Força D).
      - Escriptas: Kian, Gal Sal e Nubi já estão no jogo, sem ligação de equipe; Beatrice aparece só como prisioneira.
      - Ordem sugerida: Beatrice → Fernando → Tristan + Luciano (a Equipe Brasa); ao entrarem, a ligação da Força D
        passa a ter os membros de Desconjuração.
- [x] **Beatrice Portinari** (Força D, Desconjuração) — v4.19.0. **O ORPHEU luta com ela** (pedido do dono): o urutau
      sai do ombro, VOA e ATACA o adversário (Voo do Orpheu), depois volta para o ombro. Canivete, Balestra, Virote
      Silencioso, Vício em Adrenalina (a moeda) e Clarão dos LEDs; especial Menina do Pássaro. A forma EXISTIDA foi
      refeita pelo cânone dos Existidos (pedido do dono, 2026-11-03): lenta, sem armas, sem rituais e sem especial;
      Pancada, Não Vai Embora (segura quem bate), Olha pra Mim (suga a sanidade e mata quem está com 30% ou menos) e
      Brilho Enlouquecedor + Fortalecimento Paranormal. Sem o Orpheu na forma (a morte dele devolve as memórias).
- [x] **Força D — Dante e Erin na ligação** (v4.19.1, o dono aprovou): a ligação tem Arthur, Kaiser, Joui, Dante, Erin
      e Beatrice; o Dante entra com a Espiral de Lodo e a Erin com a granada Supernova. Dante + Arthur + Joui sozinhos
      continuam sendo os Abutres (`priority`). Elizabeth e Fernando entram quando estiverem no elenco.
- [x] **Rubens — o que faltava da ficha do cânone** (pedido do dono, 2026-11-03: "ver o que falta do cânone" nos
      personagens novos; v4.21.0): SURTO TEMPORAL (a 1ª habilidade do round abre 2,5 s em que a próxima não recarrega),
      RELÓGIO DE ARNALDO (uma vez por round a Mira de Elite que erra volta na hora) e SALTO FANTASMA COMO REAÇÃO (sem
      carga de esquiva, o L2 apanhando vira o ritual, mais longe que a Substituição). Os números são PROPOSTA.
- [x] **Beatrice — o que faltava do cânone** (v4.22.0): MERINTOFOBIA (cordas, raízes e veias a prendem 40% mais
      tempo), a Existida ACESA (atacada, os olhos e a boca brilham em amarelo e ela bate 20% mais forte por 3 s) e as
      FOICES DE JARDINAGEM saindo da bolsa. Números PROPOSTA.
- [ ] **Beatrice — sobras do cânone, para decidir com o dono**: o canivete guardado embaixo da asa do Orpheu (hoje
      fica sempre na mão) e o Vício em Adrenalina do cânone, em que a moeda decide se ela ataca o aliado ou o inimigo
      (no jogo a moeda dá dois buffs; a mania foi superada no cânone, então ficou assim).
- [x] **Carina — o que faltava do cânone** (v4.23.0): MERCENÁRIA (a 1ª habilidade do round abre 2,5 s em que a
      próxima não recarrega), TREINADA EM ATLETISMO (metade do tempo no chão) e a AFINIDADE COM PRECOGNIÇÃO contra tiros
      (−12% de dano de projéteis). O Saque Rápido já estava no □. Números PROPOSTA.
- [ ] **Fernando + Luciano = UM personagem com duas fichas** (pedido do dono, 2026-11-02): os irmãos Carvalho (Equipe
      Brasa) são o MESMO lutador no elenco, cada um com habilidades, mecânicas e rituais diferentes. Durante a luta dá
      para TROCAR entre os dois usando uma habilidade com o NOME DO OUTRO (na ficha do Fernando, a habilidade "Luciano";
      na do Luciano, "Fernando"); a troca muda o modelo e o kit na hora. Base técnica: as formas (`characters/forms`,
      `baseId`), como a Carina ↔ Todos os Leone, só que de ida e volta e sem gastar a barra de transformação.

## Revisão do trabalho do Copilot (v4.9.1, 2026-11-02)
- [x] Conferido no jogo: Olhar ao Agressor (o atacante entra em transe e se golpeia, ~22 de dano) e Investida Mortal no
      □ do Instinto Mortal (dashStrike, nome no HUD troca). Testes 62/62, `check` e `build` verdes.
- [x] Página Sobre: a foto da Hipnose estava longe e escura e o texto de "Especiais e invocações" só falava da Marionete.
      Foto nova de perto (Carniçal de garras estendidas, Joui curvado em transe em Tipora) e o Carniçal citado no texto.
- [x] `char_carnical.py`: os comentários "PROPOSTA visual" viraram o porquê do ajuste (contraste não é cânone, é
      leitura no jogo); o .glb não muda.
- [ ] Tag `v4.7.1` não existe (a release saiu junto da v4.8.0); criar só se o dono quiser os apps dela separados.
- [x] Fotos da página Sobre (v4.10.0): luta refeita de perto e sem HUD (Arthur × Kaiser em Tipora); a da Hipnose refeita
      fora do clarão de dano (no primeiro close o Joui saiu branco). A da seleção é a tela do jogo e ficou.

## Nota de passagem — Copilot (v4.9.0)
- [x] Carniçal: passiva canônica Olhar ao Agressor e Investida Mortal no Instinto Mortal; parâmetros de chance, recarga, transe e dano da passiva são PROPOSTA de jogo.
- [x] Modelo do Carniçal: cristas e peitorais menos contrastados; geometria visual refinada marcada como PROPOSTA no código.
- [x] Página Sobre: capturas atuais da seleção, luta em Tipora e Hipnose Espiral em WebP (800/480 px), com textos alternativos atualizados.
- [x] Ilha de Tipora: casas adicionais e Torre do Sino; a geometria visual da torre é PROPOSTA baseada no marco citado pela wiki.
- Testes e builds do Blender concluídos; PvE continua em espera.

## Nota de passagem — Copilot (v4.8.0)
- Feito: especiais em equipe da Força D e de Os Cinco; primeira coreografia dos Abutres com o elenco atual; closes de impacto que mantêm atacante e alvo no quadro; Van dos Cinco em Tipora; comandos de assistência com um único parceiro.
- Registrado para depois: jaqueta do Veríssimo na habilidade e na transformação. Carina (v4.17.0) e Rubens (v4.18.0) entraram no elenco e na coreografia: a Equipe Abutres está completa.
- Teste visual no Treinamento em Equipe: Força D confirmada com o close enquadrando o grupo. Conferir também Os Cinco e Abutres em uma próxima rodada.

---


# PRÓXIMA GRANDE ATUALIZAÇÃO — LUTA + MODO PvE (planejamento de 2026-10-18)

**Estado em 2026-10-31 (v4.1.0):**
- [x] **IDENTIDADE VÉU PARTIDO (pedido do dono, 2026-11-01, v4.2.0):** nome público, logo (PARTIDO rachado com o rasgo
  da Membrana), ícones/favicon (`tools/make-icons.py`), títulos, manifest, Sobre, 404, 13 idiomas, nome do app no PC/Android,
  README e changelogs com a transição registrada. Mantidos: URL `/arena-paranormal/`, appId, chaves de save, ID do online,
  nomes dos arquivos baixados.
  - [x] Repositório/URL → `veu-partido` (pedido do dono, 2026-11-01, v4.7.0): código e links trocados, `gh repo rename`
    feito e o Pages publicado em https://romavitordev.github.io/veu-partido/. Os arquivos `Arena-Paranormal-*.exe/.apk` continuam com o nome antigo (decidir à parte).
  - [ ] `public/ordo-realitas.ico` ficou sem uso (mantido); apagar quando quiser.
- [x] **Menu no celular deitado não cabia** (pedido do dono, v4.2.0): duas colunas em tela baixa.
- [x] **Fundo único dos personagens na seleção** (pedido do dono, v4.2.0): `portraits.js`, no lugar da cor da equipe.
- [x] **v4.2.0 — ESPECIAL EM EQUIPE (notas do dono, 2026-11-01, jogando com Os Mascarados):** feito em
  2026-11-01 (`combat/teamSpecials.js teamScene`), falta só a máscara da Kemi. Testado: Mascarados (5 membros + Dalmo),
  dupla Cristopher + Kaiser, Força D, equipe sem ligação — 385 a 425 de dano, sem erro; errou (alvo invulnerável) → acaba
  em 0,9 s sem gastar o especial do líder.
  - [x] **Bug: a tela de equipe do especial da luta anterior aparece no começo da luta seguinte.** Era o `#teamCut`
        ficando com `.show`: ao mostrar o HUD da luta seguinte a animação CSS tocava de novo. Agora sai sozinho no fim
        e o `HUD.reset()` limpa.
  - [x] **Cinemática de verdade com TODOS atacando juntos** (vale para TODOS os especiais em equipe — "não são apenas
        assistências atacando no mapa"): o primeiro membro abre (dá para defender/esquivar); pegou, vira cena — cada
        membro golpeia com a câmera nele (nas ligações de grupo os de fora da equipe também entram), depois TODOS JUNTOS
        em volta do alvo com o LÍDER no golpe final. O especial próprio do líder não toca mais no fim (pegou, conta como
        o especial dele: sanidade, recarga e uso). Durante a cena a equipe se mexe (`World`: a equipe de quem está na
        cena atualiza no mundo congelado).
  - [x] **Habilidades e rituais na cena** (pedido de 2026-11-01: "ao invés de só baterem, deveriam usar suas
        habilidades/rituais"): cada membro usa a habilidade DELE (`sceneAbility`: ritual primeiro, depois a de mais dano;
        utilidade fica de fora) com o nome na tela e o efeito pelo tipo — tiro, sigilo do ritual sob o alvo, chuva,
        explosão, surgir atrás, armadilha, corte. Quem conjura de longe é filmado por cima do ombro. Ex.: Mascarados =
        Ataque Especial, Punhal X, Disparo da Morte, Labirinto Mental, Descarnar Discente; Força D = Acácia, Portal das
        Sombras; Ordo = Golpe do Veterano, Chuva de Flechas. No golpe final todos soltam a habilidade juntos.
  - [x] **Texto do fim** (pedido de 2026-11-01: aparecia "Finalização de Arena", o especial do Dalmo): no golpe final
        entra só o NOME DO ESPECIAL EM EQUIPE da ligação; sem ligação não entra fala nenhuma (só o "Especial em Equipe!"
        do começo).
  - [x] **Coreografia própria dos Mascarados** (`CHOREO.mascarados`, pedido de 2026-11-01): a Kemi entra como FANTASMA
        e atira de longe (por cima do ombro) → o X (Jae) surge atrás e crava a faca → o ??? (Labirinto) carrega o raio de
        energia (câmera baixa) e solta → Dalmo nos socos e Aguiar no machado JUNTOS (o Juan, se estiver, abre a carne no
        meio) → golpe final de todos. Outras ligações podem ganhar a sua em `link.choreo`.
  - [x] **Revisão dos danos por tipo** (`COMBAT.teamSpecial`, medido contra o Balu): especial normal ~160–240 <
        transformado ~250–300 < em equipe SEM ligação 360 (líder transformado 430) < com LIGAÇÃO 420 (500). Fora da
        escada de propósito: Erin no Caos (450, ela morre junto) e o Envelhecimento do Deus da Morte (150 + o
        envelhecimento até o fim do round).
  - Pedido original: hoje aparecem os membros bem rápido e depois toca o especial do
        Dalmo. O especial em equipe tem que ser uma cena em que todos golpeiam em conjunto, um ajudando o outro a derrotar
        o adversário (cada um com o seu golpe, em sequência e ao mesmo tempo), não o especial de um só.
  - [x] **Câmera com ênfase:** close em quem está atacando naquele momento (troca de plano a cada golpe de cada membro).
  - [x] **Os Mascarados vestem as máscaras** (`link.masks`: Dalmo o capacete, Aguiar a máscara, Jae o capuz do X,
        Labirinto o elmo, Juan o capuz; a Kemi entra como **Fantasma** — a forma é a máscara dela, decisão do dono 2026-11-01) no momento do especial em equipe (e o mesmo cuidado com o visual de cada
        equipe: roupas/armas/formas próprias da cena).
  - [x] **Textos na tela organizados** (nome da equipe → retratos → a fala do líder no golpe final, um de cada vez): hoje "OS MASCARADOS", a fala ("Aí sim, neném") e as imagens deles aparecem todos ao
        mesmo tempo e se sobrepõem. Dar uma sequência: 1º o nome da equipe, depois os retratos, depois as falas, cada um
        com tempo próprio e sem sobrepor.
  - [x] **Dano por tipo de especial (o dono achou o especial em equipe fraco):** `COMBAT.teamSpecial` damage 400 /
        formDamage 475 (especial normal 250, transformado ~300 nas fichas das formas). escala clara e crescente —
        especial normal < especial transformado < especial em equipe < especial em equipe transformado. Definir os
        multiplicadores em `config/balance.js` e testar com a telemetria.
  - Nota original do dono (mantida):
    > Joguei e percebi que no começo da luta aparece a tela de equipe do especial que teve na ultima batalha, um bug.
    > Os especiais de equipe devem dar mais enfase e close nos personagens que estão atacando no momento, usei o dos mascarados e só apareceu eles bem rapido atacando e depois o especial do Dalmo, sendo que deveria ser um especial de todos eles atacando em equipe, uma cinematic de todos usando ataques em conjunto se ajudando a derrotar, percebi também que o dano foi pouco. Dano de especial normal != Especial  transformado != especial em equipe != especial transformado em equipe.
    > Os mascarados por exemplo: Devem vestir suas mascaras no momento do especial em equipe. Os textos na tela bugam e se sobrepoem, é tudo atropelado. Aparecendo Os Mascarados, Ai sim nenem e a imagem deles, tudo ao mesmo tempo. Organize isso no TODO para proxima versão.
- [~] 2.2 Modelos antigos: Xande e Aguiar (v3.33.0), Fantasma, Kemi e Gal Sal + as lâminas Ereškigal (v3.34.0), Kaiser
  (v3.38.0), Balu e Lírio (v3.40.0), Arthur e Joui (v3.41.0), Arnaldo, Anfitrião, Veríssimo, Kian e O Diabo (2026-10-26)
  refeitos pelas artes oficiais; faltam os outros antigos
  (ver *MODELOS — PRÓXIMOS PASSOS*).
- [x] Feedback de Kian e Joui (25/10/2026): auditoria, Rejeitar Névoa pelo cânone, transformações com kit próprio
  (Realizador da Calamidade, Shi no Kage), ultimates diferentes no Joui, Tomado pelo Ódio, Portal das Sombras — v3.42.0;
  animações próprias, cena da Escrita, Leonora e raios de Energia — v3.43.0 (ver *ANDAMENTO DO FEEDBACK*).
- [x] 2.3 Especiais em equipe: Barra de Equipe, Especial simplificado, Transformação em equipe (F1/F2/F3) e os especiais
  com ligação na lore — Mascarados, Joui + Kaiser + Arthur, Cristopher + Kaiser (F4, ver *EQUIPE*). Novas ligações
  ficam "a confirmar" pelo dono.
- [x] 2.1 Animações de movimentação: 1ª parte na v3.37.0 (corrida, caminhada, pulo, queda, dash, esquiva, reação e 18
  posturas paradas próprias); 2ª parte (2026-10-26): pacote gratuito importado e redirecionado — corrida, caminhada e
  queda (ver *REAJUSTE DAS ANIMAÇÕES*).
- [x] **MELHORIA GERAL DE TODAS AS ANIMAÇÕES** — 1ª leva na v3.47.0 (`anim/strikePolish.js`): os 15 golpes genéricos
  (jab, direto, ganchos, gancho de baixo, soco pesado, os chutes, joelhada, soco de um braço, cortes de faca) ganharam
  antecipação, passagem (overshoot) e peso na volta, com o acerto no mesmo instante de antes. Depois (pedido de
  2026-10-27): os socos do DALMO com o mesmo impacto dos do Kian — `impactFx: 'shock'` (anel de ar, onda que distorce,
  poeira e tranco na câmera, sem o sigilo paranormal), escala de impacto e pausa no impacto maiores; anel 2,3 / onda 1,8
  (finalizador 3,4 + eco 4,4 / 2,6) — ele é pesado, golpes lentos e de impacto. O COLOSSO (a forma mais forte) fica acima:
  a onda da Pressão Atmosférica com anel 3,0 / onda 2,4 e, no finalizador, anel 4,4 + dois ecos (5,6 e 6,8), onda 3,4 e o
  anel de choque no chão (sem duplicar com o 'shock'). 2ª leva (2026-11-01, movimento): camada de
  impulsos aditivos no Animator (`kick`) com aterrissagem (afunda conforme a velocidade de queda), freada da corrida e
  arrancada; pulo com pose de pico; esquiva com antecipação e assentamento. 3ª leva (2026-11-01, combos):
  mais 51 golpes de combo do elenco (lâminas, machado, garras, duas mãos, chutes próprios) com antecipação, passagem e
  peso na volta; 11 golpes que fecham combo (`FINISHER_STRIKES`) passam mais do ponto e seguram o impacto um instante.
  4ª leva (2026-11-01, habilidades): 10 arremessos e conjurações (throw_r/l, point, breath, cast_up, shadow_cast,
  db_throw, ai_fling, arn_emit, arn_focus) com antecipação e soltura; todo projétil lançado dá um coice no corpo de quem
  atira (mais forte no tiro de precisão; rajada recomeça o coice em vez de somar).
  5ª leva (2026-11-01, ESTILO POR LUTADOR — `anim/animStyles.js`): o mesmo golpe toca diferente conforme quem bate, sem
  mudar o instante do acerto: PESADO (Balu, Aguiar, Dalmo, Colosso, Lírio, Gal Sal: carrega muito, afunda no impacto, volta
  devagar, aterrissa pesado), ESGRIMA (Joui, Jae, Celestine, Cristino, Juan: quase sem preparo, estala e volta rápido),
  MILITAR (Kaiser, Veríssimo, Arthur, Cristopher: controlado e limpo), CAÓTICO (Xande, Guizo, Arnaldo/Anfitrião, Erin no
  caos, Juan no ódio: preparo exagerado, passa muito do ponto, cabeça entorta), ELEGANTE (Kian, Gaius, Dante, Magistrada,
  Nubi, Ferreiro: econômico, volta longa). `def.animStyle` sobrepõe a tabela.
  6ª leva (2026-11-01): ESTILO PARA TODO O ELENCO — Erin, Kemi, Amalia (militar), Aghata, Fantasma (esgrima), Diabo e
  Raziel Verdadeiro (pesado), Raziel e Amigo (caótico), Labirinto e Estrangeiro (elegante); nenhum lutador fica no padrão.
  Os golpes de 5+ poses (hammer_finisher, dm_*, ai_*, db_*) ficam como estão de propósito: já têm preparo e volta
  desenhados à mão, e o polimento automático é feito para golpes de 3–4 poses. Pedido original (2026-10-26): Todas as animações de movimento, ataques básicos,
  combos, finalizadores, esquivas e habilidades de todos os personagens precisam ser melhoradas e retrabalhadas. Buscar
  referências da internet (jogos de luta consagrados como Naruto Storm, Guilty Gear, Tekken, além de coreografias de artes
  marciais e animes de ação) para trazer muito mais impacto, fluidez, peso e naturalidade (ver *2.1*).
- [x] 2.4 Câmera de cutscenes (2026-10-26): sem cortes bruscos e sem a câmera entrar no cenário — ver *2.4*.
- [~] 2.5 Auditoria de fidelidade ao cânone de todos os personagens (Capítulo Complementar v3.44.0/v3.45.0): **Raziel
  CONCLUÍDO (RZ-01 a RZ-09, 2026-10-26)** — Turno Extra, Sede Incontrolável, Banquete Bestial próprio, Vulto Retalhador
  no lugar do projétil, Maldição revista, crosta visível, kit próprio da forma (Língua, Predador), Afinidade com Sangue e
  validação. **Arthur (§3.1) auditado na v3.46.0.** Falta a revisão dos outros personagens do elenco (§3.2 a §3.30).
- [x] **FEITO (v3.45.0/v3.46.0) — CENÁRIO NOVO + EQUIPE VAMPIROS.** Um cenário novo — pode ser o **interior da
  Igreja dos Vampiros de Hexatombe** (a Igreja de Sangue, ep. 9) — que entra junto com um **personagem novo de uma
  equipe nova, os VAMPIROS: Raziel**. Antes de começar: levantar o Raziel e a igreja na wiki/HQ (`lore/`, arte
  oficial), o kit pelo cânone (o braço do Raziel já aparece na lore do Cristino, ep. 9), o modelo no Blender (sculpt_lib),
  o cenário no Blender (kits CC0 + peças próprias) e a nova origem/equipe "Vampiros" na seleção, nas ligações de equipe
  e na CPU.
  **O CENÁRIO (notas do dono):** buscar as referências visuais em CENAS DOS EPISÓDIOS de Hexatombe; é só o INTERIOR (mais
  fácil). Igreja GÓTICA; a PORTA trancada; o ambiente cheio da NÉVOA DA MEMBRANA; iluminada pela LUA VERMELHA DE SANGUE
  (entrando pelos vitrais/janelas). São só pontos de partida — confirmar e completar ao pesquisar.
  - [x] **CENÁRIO "Igreja Antiga"** (2026-10-26, `tools/blender/arena_igreja.py` → `public/arenas/igreja.glb`, id `igreja`, na
        seleção de cenários). Referências: o modelo 3D da igreja usado no próprio RPG (wiki "Igreja Antiga": interior, vista
        de cima, Dama da Culpa, área dos anzóis), a cinemática da Ceia dos Vampiros e QUADROS DO EPISÓDIO (Hexatombe ep. 9
        "Banho de Sangue", YouTube p5alZam12ss: 4h55 a entrada com os pilares entalhados, 5h05 o altar com o retábulo
        dourado e o trono, 5h20 a nave vista de cima, 6h10 a luta com as arandelas e os balcões, 6h50 a rosácea com o símbolo).
        Feito à mão: a nave com os pilares e os arcos, as galerias com os balcões, as janelas ogivais com os vitrais
        vermelhos, as nervuras de madeira do teto, a mesa do banquete (toalha manchada, candelabros, taças, cadeiras de
        encosto pontiagudo), o altar (retábulo dourado com o trono, o Serafim Vermelho decapitado, a Dama da Culpa com o
        leque de espinhos e a pedra vermelha, o SÍMBOLO DE SANGUE aceso no lugar da cruz — wiki "Sangue"), a porta TRANCADA com correntes e cadeado, a rosácea
        com o símbolo de sangue, os anzóis com correntes, bancos quebrados e entulho. A névoa da membrana (vermelho-escura, mais densa no
        altar e na porta) e a luz da lua de sangue ficam na config. Testado no jogo.
  - [x] **RAZIEL** (2026-10-26, kit aprovado pelo dono) — jogável, equipe nova **Vampiros** (cor vermelho-sangue, na
        seleção depois dos Transtornados e no título). Modelo `tools/blender/char_raziel.py` → `public/models/raziel.glb`
        (técnica atual, revisado no Blender e no jogo): o casacão até o chão com a gola alta vermelha por dentro, as
        dragonas com franjas, o jabô e a pedra vermelha, as correntes e os laços, a cabeça descarnada sem olhos com o
        estigma aceso e os dentes, garras e pés descalços; a TRANSFORMAÇÃO "O Verdadeiro Raziel" é o mesmo .glb trocando as
        peças (prop_up some; prop_true mostra a ferida com as costelas, os braços rasgados até o osso e a língua).
        Kit: Garras (físico), Vulto Retalhador (□; era o Rasgo de Sangue, trocado no RZ-04), Bote Retalhador (heavyBlow com `grazeOnDodge`: quem esquiva toma
        metade), Mordida (`vampireBite`: segura, morde duas vezes e cura), Endurecer Sangue (crosta de sangue, menos dano),
        Maldição Sanguínea (`bloodCurse`: ABALADO), Turno Extra (ataca mais rápido), especial Banquete de Sangue (as
        mordidas curam: `h.drain` no cinematicCombo); na forma: Devorar, Frenesi e o Banquete Bestial. Agarrão próprio
        (garras + mordida), falas de introdução (cenas do cânone com Cristino, Juan, Jae, Labirinto e Dalmo) e de vitória
        contra os 28. Testado: cada golpe, o raspão na esquiva, a transformação e 4 partidas CPU × CPU sem erro.
        Na forma verdadeira, BARRA DE VIDA PRÓPRIA (`hpBar: { style: 'vampire' }`, `.hb-vampire` em styles.css): sangue
        escuro coagulado com veias pulsando e GOTAS escorrendo pela barra. Na seleção fica logo depois do Cristino.
        Revisão da v3.45.0 (outra IA): o commit deixou DOIS `hideRangedProps` no Fighter — o segundo apagava a trava da
        maça do Machado Demônio (Balu); juntados num só, que usa o `activeRanged` e mantém o `propLock`.
        Kian: o cabelo voltou a ser CURTO e rente (não é black power).
        Proposta original (para referência): líder dos Vampiros, Sangue, Combatente (trilha Monstruoso), 1,90 m, rápido "como um vulto".
        Visual (arte de Hexatombe): a cabeça careca descarnada sem olhos nem nariz, a boca de fera com os dentes amarelos e
        o estigma da Coroa de Espinhos cortado na testa; o casacão preto/vermelho até o chão de ombros altos com a gola alta
        e rígida, o forro vermelho, os laços dourados e correntes no peito, o lenço com a pedra vermelha; garras longas;
        descalço com unhas pontudas; tudo manchado de sangue.
        Kit: físico de GARRAS e MORDIDA (a mordida suga vida); ENDURECER SANGUE (resistência a todo dano por alguns
        segundos, a crosta de sangue por cima da roupa); BOTE RETALHADOR (o bote enorme; quem esquiva toma metade);
        MALDIÇÃO SANGUÍNEA (apodrece o sangue do alvo: ABALADO, dano e defesa menores); TURNO EXTRA (passiva: às vezes um
        golpe a mais / ação extra); especial "BANQUETE DE SANGUE" (agarra, morde e bebe, curando — "Eu espero que vocês
        aproveitem esse banquete"); TRANSFORMAÇÃO "O VERDADEIRO RAZIEL" (rasga a parte de cima das roupas: o corpo
        descarnado com as costelas à mostra e os braços rasgados até o osso, a língua comprida; descontrolado, mais rápido
        e forte, SEDE INCONTROLÁVEL: devora quem está morrendo e se cura).
        Equipe nova "Vampiros" (Alvira, Velisar, Zéfero, Sabara quando entrarem).
- [ ] 3–14 Modo PvE, que vai se chamar **Outro Lado** — **EM PRODUÇÃO desde 2026-11-05; a 1ª fase jogável (Território do Espreitador) saiu na v4.25.0** — o coop local saiu na v4.29.0; falta o coop online sincronizado, o backup e mais dungeons (pedido do dono: "leia tudo
  sobre o modo Outro Lado e comece a produção. Quero que tenha pelo menos uma fase jogável pra lançar"; antes ficou em
  espera de 2026-11-01 a 2026-11-05). O plano de produção está na seção 3.4; as ideias do dono, na seção 3.0. (dungeons, Espreitador como chefe, progressão, salvamento,
  cooperativo): antes da v4.25.0, já anunciado como "em desenvolvimento, sem data" na página Sobre. Na v3.47.0 entrou só a
  opção OUTRO LADO no menu principal (selo EM BREVE e aviso ao escolher), como pedido.
- [x] **Menu principal em seções** (v3.47.0): LUTAR / PRATICAR / JOGO, Outro Lado com EM BREVE, descrição em cartão ao
  lado (telas grandes), opções de JOGO menores, lista que rola em telas baixas.
- [x] **Limite de combo e balanceamento** (v3.47.0): `COMBAT.comboBreak` (3 s ou 12 acertos → ESCAPOU DO COMBO, 0,5 s
  invulnerável; especial e agarrão não são cortados); a CPU usa a Substituição num combo longo mesmo com 1 carga. Raziel:
  roubo de vida 8% → 5% (forma 20% → 14%), Bote Retalhador 92 → 84 — de 9 em 10 vitórias para 6 em 10; hitstun máximo
  de ~7 s para ~3,5 s na maioria das lutas.
- [x] **Torneio** (v3.47.0): montagem com o visual novo (cantos cortados, faixa de cor por tipo de vaga, número da vaga,
  regras num painel só) e a regra **LUTAS DA CPU**: SORTEIO (como antes, só o resultado), RODAR (a luta de verdade
  acelerada atrás do painel "lutando…" com a vida dos dois; mostra só quem venceu) ou ASSISTIR (a luta inteira na tela).
  Corrigido: nas regras ◀ ▶ mudavam o valor e não dava para chegar às outras regras pelo controle (agora ◀ ▶ escolhem e
  A/× muda o valor). A chave ganhou o fundo roxo do menu.
- [x] arrumar posição das facas/espadas nas mãos dos personagens (feito em 2026-10-23: o cabo atravessa o punho fechado
  — `inFist` em `models/props.js` —, a lâmina sai pelo lado do polegar e o pomo aparece embaixo).

## 1. Objetivo da atualização

Esta atualização tem como objetivo ampliar o Arena Paranormal sem descaracterizar sua proposta original de jogo de luta 3D. O desenvolvimento será dividido em duas frentes principais:

- **Melhorias no jogo de luta atual:** animações, modelos, especiais em equipe, câmera e interface de combate.
- **Criação de um novo modo PvE:** dungeons, chefes, progressão, melhorias temporárias e permanentes, salvamento e possibilidade de jogar cooperativamente.

O desenvolvimento deverá aproveitar os sistemas existentes sempre que possível. Antes de criar ou substituir qualquer sistema, será necessário analisar a arquitetura atual do jogo, seus personagens, as arenas, a inteligência artificial, a sincronização multiplayer e os mecanismos de salvamento.

### Importante: separar o que será feito agora do que ficará para o futuro

A criação do modo PvE e a implementação das primeiras dungeons fazem parte do escopo desta atualização.

**A adição do Espreitador como personagem selecionável e jogável é uma possibilidade futura, não uma entrega obrigatória desta atualização.** Nesta etapa, ele poderá ser desenvolvido como chefe de uma dungeon, com comportamentos, animações e habilidades específicas para esse confronto. Sua versão jogável poderá ser planejada posteriormente, depois de o modo PvE estar estabelecido.

O projeto também deverá ser preparado para receber novas dungeons e chefes em futuras atualizações, sem exigir a reconstrução do modo PvE a cada expansão.

---

## 2. Melhorias no jogo de luta atual

ARENA PARANORMAL — FEEDBACK
Auditoria e revisão de Kian e Joui: habilidades, transformações e fidelidade ao cânone
Data: 25/10/2026

IMPORTANTE
Este documento reúne o feedback do Vitor até agora. NÃO é autorização para reconstruir os personagens do zero nem para alterar o balanceamento global. Antes de implementar, leia o código REAL da versão atual do repositório e a documentação existente. Não presuma que uma habilidade existe, não existe ou funciona de determinada maneira sem conferir a implementação.

OBJETIVO GERAL
Alguns personagens possuem transformações narrativamente importantes. Quando ativadas, essas formas devem representar suas versões mais poderosas e mudar de verdade o kit de habilidades: poderes, funções, efeitos, animações e possibilidades de combate. Não basta aumentar dano, velocidade ou resistência e manter as mesmas skills.

Preservar o que já funciona, manter compatibilidade com o sistema de combate e fazer alterações localizadas. O foco é fidelidade ao cânone e identidade mecânica de cada forma.

ETAPA 1 — AUDITORIA OBRIGATÓRIA DO REPOSITÓRIO
1. Leia README.md, TODO.md, CHANGELOG-ADMIN.md, HABILIDADES.md e quaisquer documentos específicos sobre personagens/transformações.
2. Localize os arquivos reais de Kian e Joui e todos os pontos que definem:
   - kit normal e kit transformado;
   - nomes, descrições, dano, custo de energia, cooldown e duração;
   - condições de ativação, encerramento e retorno à forma normal;
   - animações, VFX, hitboxes, telegraph, interrupções, invulnerabilidade e efeitos de status;
   - Ultimate, passivas, IA/CPU e lógica de seleção de habilidade.
3. Faça uma tabela de auditoria para cada personagem: habilidade atual, comportamento real no código, relação com o cânone, problema encontrado e recomendação.
4. Diferencie claramente fatos do código, fatos canônicos e propostas de design. Não apresente ideias novas como se fossem habilidades oficiais.
5. Não comece a implementar antes de concluir essa auditoria e conferir as referências canônicas.

KIAN — PROBLEMAS E DIREÇÃO DE DESIGN
Feedback do Vitor:
- Kian está forte fisicamente e consegue fazer combos. Isso não é a prioridade principal da revisão.
- As habilidades atuais não parecem suficientemente fiéis ao cânone; revisar principalmente a versão transformada, que deve representar Kian em Calamidade, na sua versão de maior poder.
- A forma transformada precisa ter um kit próprio e claramente mais poderoso, centrado em rituais e manifestações de Conhecimento, e não ser apenas Kian normal com atributos aumentados.
- Revisar também habilidades que se tornam pouco úteis em partidas normais.

PONTO ESPECÍFICO: REJEITAR NÉVOA
O feedback do jogador é que Rejeitar Névoa fica praticamente inútil quando não há um Kaiser como adversário.
- Inspecione a implementação atual e identifique exatamente o que o poder faz, quais condições o ativam e por que depende do Kaiser.
- Não mantenha uma habilidade situacional quase sem função em confrontos comuns sem avaliar alternativas.
- Proponha uma função útil contra outros personagens, coerente com o ritual e com as regras já existentes. Exemplos de DIREÇÃO POSSÍVEL, não decisões fechadas: dissipar/neutralizar uma manifestação paranormal ativa, interromper ou enfraquecer um efeito sobrenatural específico, ou criar uma janela curta de proteção/negação contra um ataque paranormal.
- Não invente uma mecânica genérica que contradiga o ritual. Defina alvos válidos, duração, alcance, custo, cooldown, feedback visual e contrajogo.
- Se a interação exclusiva com Kaiser for importante para a fidelidade, preserve-a como interação especial, mas faça a habilidade continuar tendo utilidade equilibrada fora desse confronto.
- Evite transformar a habilidade em um botão universal que anula qualquer skill. Teste contra personagens diferentes e documente as exceções.

REFERÊNCIAS CANÔNICAS A INVESTIGAR PARA KIAN
Verifique fontes confiáveis da wiki e/ou material canônico antes de fechar nomes e funções. Investigue, quando aplicável à fase escolhida, Inexistir, Teletransporte, Toque da Morte, Lâmina do Medo, Rejeitar Névoa e o domínio de Kian sobre rituais. Confirme a nomenclatura e o contexto de cada habilidade; não inclua automaticamente todas no jogo.
A versão selecionada precisa ser explícita: Kian em Calamidade, com a condição de poderes correspondente à fase narrativa escolhida. Não misture fases contraditórias.

Direção de gameplay para Kian transformado:
- identidade de ocultista extremamente poderoso;
- controle sobrenatural e manipulação de posição/estado do adversário;
- rituais com funções distintas: controle, mobilidade, pressão e finalização;
- efeitos visuais de Conhecimento/sigilos consistentes com o estilo visual já existente;
- ultimate e transformação com apresentação própria, sem copiar literalmente cenas da série em todo golpe;
- manter o combate físico atual onde ele funciona, sem deixar que ele seja a única parte interessante do personagem.

JOUI — TRANSFORMAÇÃO E KATANA DA MAGISTRADA
Feedback do Vitor:
- Joui tem problema semelhante ao Kian: a forma transformada deve representar uma versão realmente mais poderosa, com kit diferente.
- A transformação do Joui pode usar a katana recebida de Magistrada: Shi no Kage.
- A transformação deve comunicar visual e mecanicamente que a arma e o conjunto de habilidades mudaram. Não basta trocar a aparência ou aumentar atributos.

IMPORTANTE SOBRE AS FASES DO JOUI
Investigue e diferencie corretamente:
- Joui usando os poderes da máscara / fase da Seita das Máscaras;
- Joui após deixar de ter a máscara e receber a Shi no Kage, a katana de Conhecimento concedida por Magistrada.
Não misture automaticamente poderes da máscara com a fase posterior. A decisão de qual fase a transformação do jogo representa precisa ficar explícita e coerente com o cânone.

DIREÇÃO DE DESIGN PARA A FORMA TRANSFORMADA DO JOUI
- Usar a Shi no Kage como arma visual e mecânica da transformação, se isso se encaixar no sistema e no modelo já disponível.
- A katana deve mudar os golpes, o alcance/ritmo e as animações de forma perceptível, respeitando o que os assets atuais permitem.
- Priorizar esgrima técnica, cortes precisos, pressão ofensiva e movimentação ágil; não transformar Joui em um conjurador genérico.
- Se a transformação escolhida for especificamente Joui Mascarado, o kit deve ser baseado na máscara e nos poderes correspondentes, incluindo o uso de sombras/teleporte apenas se a fonte canônica e a implementação justificarem.
- Se a forma for Joui com Shi no Kage, não conceder automaticamente todos os poderes da máscara. Pode ser necessário tratar essas como fases/formas diferentes.
- Verifique a existência de modelo, textura, katana e animações antes de propor assets novos. Reutilize os recursos existentes sempre que possível; não invente caminhos de arquivo.

REFERÊNCIAS CANÔNICAS A INVESTIGAR PARA JOUI
Confirme em fontes confiáveis:
- a origem e o nome correto da katana Shi no Kage;
- a relação da arma com Magistrada e Conhecimento;
- quais poderes pertencem à fase da máscara e quais pertencem ao Joui posterior;
- a nomenclatura e os feitos realmente mostrados em material canônico.
Não apresente propostas de gameplay como se fossem poderes oficiais.

CRITÉRIOS PARA A TRANSFORMAÇÃO DOS DOIS
Uma transformação importante deve:
1. Ter identidade visual inequívoca.
2. Trocar ou modificar significativamente o kit de skills.
3. Ter nomes e efeitos fiéis à versão narrativa escolhida.
4. Fazer o jogador sentir que desbloqueou a versão mais poderosa daquele personagem.
5. Ter animações, VFX, telegraphs, hitboxes e feedback legíveis.
6. Continuar balanceada no contexto do jogo, sem resolver tudo com dano excessivo.
7. Funcionar contra vários personagens e na CPU, não apenas em uma interação específica.
8. Retornar ao estado normal corretamente ao terminar, sem deixar buffs, armas ou estados presos.

TESTES OBRIGATÓRIOS
- Testar transformação e retorno à forma normal.
- Testar todas as habilidades novas e modificadas com energia suficiente e insuficiente.
- Testar cooldown, interrupção, bloqueio, esquiva, acerto, erro e KO durante as animações.
- Testar contra vários personagens, incluindo Kaiser para Rejeitar Névoa, e também adversários que não sejam Kaiser.
- Verificar que a IA/CPU consegue escolher e executar as habilidades sem travar ou repeti-las de forma problemática.
- Verificar que trocar de personagem, reiniciar partida ou terminar a luta não deixa efeitos residuais.
- Rodar os testes/comandos existentes no projeto e relatar exatamente o que foi executado. Não afirmar que algo foi testado se não foi.

DOCUMENTAÇÃO E ENTREGA
Após a auditoria e, se autorizada/necessária, a implementação:
- Atualize HABILIDADES.md com nomes, funções, custos e cooldowns reais.
- Atualize TODO.md marcando apenas o que foi efetivamente concluído.
- Atualize CHANGELOG-ADMIN.md com resumo das alterações e testes realizados.
- Atualize README/versão por último, seguindo o fluxo existente do projeto.
- Preserve o estilo e a arquitetura atuais; não faça refatoração ampla nem passe de balanceamento geral fora do escopo.
- Apresente ao Vitor um resumo: o que estava errado, o que foi alterado, quais referências canônicas foram usadas, testes executados e limitações restantes.

ESCOPO ATUAL
Este é um feedback. Kian e Joui são o foco inicial. Não considere o feedback global finalizado; outras observações do Vitor podem ser acrescentadas depois.

ANDAMENTO DO FEEDBACK (2026-10-26 — auditoria completa em `docs/AUDITORIA-KIAN-JOUI.md`)
- [x] Etapa 1 — auditoria do código e do cânone (wiki: Kian, Rituais, Joui Jouki, A Magistrada), com fatos do código,
      fatos canônicos e propostas separados.
- [x] Rejeitar Névoa pelo cânone ("todos os rituais no raio demoram muito mais para serem conjurados"): área de 6 s
      onde todo ritual do adversário vira CONJURAÇÃO CONTÍNUA (0,7 s parado, um golpe interrompe) e sai 25% mais fraco;
      vale contra todo o elenco; a névoa da Kaiser some na hora (interação preservada). Testado contra Arthur e Kaiser.
- [x] Kian transformado com KIT PRÓPRIO, não só números — **Realizador da Calamidade** (nome canônico; antes "Kian de
      Calamidade"): Teletransporte com DOIS SALTOS seguidos; Levitação: SUSPENDER (ergue e arremessa o adversário);
      Lâmina do Medo que deixa MORRENDO (sangra e não regenera); Rejeitar Névoa que DESFAZ os rituais ativos do
      adversário; Toque da Morte que SUGA A SANIDADE; Impacto Sigilar com 3 marcas da Escrita. Testado no jogo.
- [x] Joui transformado = **Shi no Kage**, a fase final contra o Kian (decisão de fase explícita): sem a máscara (perde os
      poderes dela), a Shi no Kage preta de sigilos dourados (prop novo) e a bainha da Relíquia de Energia (prop novo);
      esgrima de Conhecimento, Corte de Conhecimento, Saque da Relíquia, **DECEPAR** (como o do Cristino: sangra, ferida
      aberta; decapita na vida baixa), Mateo que FECHA AS FERIDAS, Olhar do Desespero que deixa ESMORECIDO, Pavor
      Anormal riscado DEBAIXO do alvo, Técnica Secreta (Desarmar) passiva. Testado no jogo.
- [x] Ultimate do Joui diferente nas duas versões: o mascarado tem a **Execução das Sombras** (golpe pelas costas saindo da
      sombra; "Shi no Kage" é o nome da katana); a forma tem a **Shi no Kage** — saca a Relíquia de Energia na mão
      esquerda e luta com as duas lâminas: sigilo de Conhecimento no alvo, cortes previstos, o Decepar que ajoelha e
      sangra e o X dourado e roxo (~250 contra ~180 da versão normal, medido no jogo).
- [x] Voltar à forma normal no fim do round sem estados presos (máscara, katana, Relíquia, habilidades) — testado.
- [x] Joui mascarado: **Tomado pelo Ódio** (R2 + ×) — ativa os poderes da máscara como os outros Mascarados, sem a
      cena de pôr a máscara: postura de saque, aura vermelha, 6 s com +20% de dano, mais velocidade e cortes que fazem
      sangrar de leve (pedido de 2026-10-26). Testado: 88 → 109 na mesma sequência, o alvo sangra, some em 6 s.
- [x] A forma Shi no Kage acima do Joui mascarado mesmo com o Tomado pelo Ódio ativo (pedido: "o normal não ficou mais forte
      que a transformada?" — ficava): cortes da Shi no Kage +20%, a sequência na mesma ordem da normal, velocidade 9,3 /
      1,28. Medido no jogo, sequência inteira: Balu 144 normal · 180 com o Tomado pelo Ódio · 182 forma; Kian 159 · 197 · 203. O
      Decepar (o golpe que arranca) já era só da forma.
- [x] A cura que envelhece (Cicatrização do Guizo e do Xande, Paradiso do Dante) NÃO deixa mais o cabelo branco — para
      TODOS os personagens (pedido de 2026-10-26): o `agingHeal` é só a cura; a função `ageHair` saiu.
- [x] HABILIDADES.md regerado (`npm run moves`); `npm run check`, `npm test` (43) e `npm run build` passando.
- [x] EFEITO DE ENERGIA no impacto (pedido de 2026-10-26: "energia deveria ter raios e eletricidade em volta"): todo
      golpe de Energia — rituais e especiais de quem é de Energia, tiros com elemento Energia (o Rebirth do Arthur, as Balas
      Amaldiçoadas da Kaiser...) e a arma amaldiçoada de Energia — solta raios em zigue-zague em volta do corpo de quem
      apanha (na cor do golpe e em branco), faíscas, um clarão e o estalo (`damage.js energyHitFx`).
- [x] ANIMAÇÕES NOVAS (`src/anim/powerClips.js`, 2026-10-26): `relic_draw` (o Joui agacha com as duas mãos nos dois
      cabos), `iai_double` (o X final das duas lâminas até o zanshin), `shadow_plunge` (crava a katana na sombra — Portal
      das Sombras), `levitate_raise` (o Kian ergue a palma — Suspender) e `fear_pierce` (a lâmina junto do ouvido e a
      estocada que perfura); e o efeito da MELODIA da Lâmina do Medo de Calamidade (anéis de som saindo da mão). Testado no
      jogo: cada habilidade usa o clipe novo, sem erro.
- [x] A ESCRITA TOMA O CORPO na Transformação "Realizador da Calamidade": pose nova `script_surge` (braços abrindo, a
      cabeça para trás), os sigilos dourados sobem das mãos pelos braços até o peito e o rosto, e o corpo acende cada vez
      mais até o clarão (a barba cresce e as faixas aparecem como antes). Testado: a forma entra e o brilho apaga no fim.
- [x] Joui mascarado: **Portal das Sombras** (cânone de Calamidade: "um portal pelas sombras; um objeto, como sua katana,
      seria transportado para sua mão") no lugar do Corte das Sombras (que era proposta): crava a katana na sombra e ela
      sobe de um portal debaixo do adversário, cortando e lançando; volta para a mão. Testado: acerta parado, erra quem sai.
- [x] Suspender com visual próprio do Kian: os sigilos de Conhecimento sobem do chão e giram em volta do alvo suspenso
      (antes era o feixe de luz do Estrangeiro); o texto é "SUSPENSO".
- [~] Trocar as PROPOSTAS restantes por feitos canônicos onde houver: no Kian, a luta contra a Magistrada ("derrota a
      Magistrada facilmente"); no Joui da Shi no Kage, o Corte de Conhecimento e o Saque da Relíquia continuam proposta
      (a Relíquia na bainha é canônica, o golpe não).
- [x] CPU com o kit novo (2026-10-26): 12 partidas CPU × CPU (difícil) — Kian e Joui, normais e transformados, contra
      Kaiser, Arthur e Balu: nenhum erro, nenhum estado preso; a CPU usa Suspender, Rejeitar Névoa, Saque da Relíquia,
      Decepar e Tomado pelo Ódio. (O especial Shi no Kage dura ~5,4 s e sempre termina.)

### 2.1. Novas animações de movimentação e melhoria geral de todas as animações

Adicionar e aprimorar animações de movimentação para deixar os personagens mais naturais e responsivos durante as batalhas.

As animações deverão respeitar o estilo de luta de cada personagem e ser compatíveis com os sistemas atuais de movimentação, ataques, esquivas e habilidades.

- [x] **Melhoria geral de todas as animações do jogo (pedido de 2026-10-26):** todas as animações de movimento (corrida, caminhada, esquivas, dash, pulo, transições), ataques normais, sequências de combo, finalizadores e habilidades precisam ser aprimoradas para maior fluidez, impacto e naturalidade.
 — feito em 6 levas (ver MELHORIA GERAL DE TODAS AS ANIMAÇÕES, 2026-11-01).
- [ ] **Pesquisa e uso de referências visuais da internet:** buscar referências de alta qualidade em jogos de luta consagrados (Naruto Storm, Guilty Gear, Tekken, Street Fighter), coreografias de artes marciais reais e cenas de ação em animes para guiar o timing, arcos de movimento (anticipation, follow-through, peso e inércia).
- [x] **Polimento individual por estilo de combate** (2026-11-01, `anim/animStyles.js`, ver a 5ª leva acima): garantir que cada combatente tenha animações fiéis ao seu estilo e personalidade narrativa (ex.: agilidade e esgrima de Joui, brutalidade pesada de Balu e Aguiar, técnica militar de Kaiser e Veríssimo, loucura caótica de Xande e Anfitrião, elegância sobrenatural de Kian).

### 2.2. Atualização dos modelos antigos

Revisar os modelos 3D dos personagens antigos, identificando problemas visuais, diferenças de qualidade e oportunidades de melhoria.

As alterações deverão preservar a identidade visual dos personagens e a compatibilidade com suas animações, habilidades e sistemas de combate.

### 2.3. Melhoria dos especiais em equipe

Aprimorar os ataques especiais realizados em conjunto, dando mais destaque às animações, à participação dos personagens envolvidos, aos efeitos visuais e à sensação de impacto.

As melhorias deverão considerar a sincronização entre os personagens, a câmera e o momento em que o dano é aplicado.

### 2.4. Melhorias na câmera de cutscenes

Aprimorar os enquadramentos e movimentos da câmera durante as cenas especiais, ataques cinematográficos e transições.

A câmera deverá valorizar os personagens e as ações importantes sem perder o controle da posição dos jogadores nem causar cortes bruscos ou enquadramentos inadequados.

- [x] Feito em 2026-10-26 (`camera/CameraRig.js`, vale para os 46 usos de `playShots` em 24 especiais e na cutscene do
  agarrão): a cinemática ENTRA saindo de onde a câmera de luta estava (0,3 s); cada plano novo CHEGA num movimento
  curto a partir do anterior (0,16 s; um plano pode pedir o corte seco com `cut: true` ou outro tempo com `blend`); se o
  personagem do plano teleporta/atravessa, a câmera corre até ele (máx. 30 m/s) em vez de pular; no FIM volta à luta
  da mesma posição e altura, com o olhar deslizando até os lutadores (antes pulava ~2 m); os planos não entram mais
  dentro de casas/muralhas (o recuo contra os blocos sólidos agora vale na cinemática); plano com conta inválida não
  leva a câmera para NaN. Medido quadro a quadro nos especiais dos 28 personagens: o maior salto caiu de 5,2 m para
  ~1 m (só as transições rápidas), sem erro.

### 2.5. Capítulo Complementar — Auditoria de Fidelidade ao Cânone de Todos os Personagens (v3.44.0 / v3.45.0)

**Data de elaboração:** 26/10/2026  
**Escopo:** complemento à vistoria de personagens da v3.44.0/v3.45.0. Não substitui o TODO existente, não invalida tarefas marcadas como concluídas e não autoriza rebalanceamento geral.  
**Prioridade imediata:** Raziel e sua forma **O Verdadeiro Raziel**; depois, revisão sistemática dos demais personagens do elenco.

#### Objetivo
Revisar os personagens comparando três fontes que devem ficar separadas no relatório:
1. **Implementação real:** o que os arquivos do jogo executam de fato.
2. **Cânone narrativo:** o que aparece nos episódios oficiais, artes e materiais oficiais.
3. **Cânone mecânico:** regras de *Ordem Paranormal RPG*, incluindo *Sobrevivendo ao Horror*, quando aplicáveis.

A wiki comunitária é um índice e uma ferramenta para localizar fatos e cenas, não a autoridade final. Quando houver divergência, dar prioridade ao material oficial e aos episódios; anotar a divergência em vez de inventar uma conciliação. Não copiar literalmente as regras de mesa se elas não funcionarem em um jogo de luta: registrar a regra original e explicar a adaptação de gameplay.

#### 1. Processo obrigatório para cada personagem
Antes de propor alterações:
- [x] Conferir o código atual e listar todos os kits: base, forma(s), passivas, especial, agarrão, armas, assistências, efeitos de status e interações de equipe.
 (2026-11-01: script de kit para os 22 personagens + formas)
- [x] Confirmar em quais arquivos estão definidos os golpes, animações, hitboxes, dano, cooldown, custo de energia, VFX, IA/CPU, HUD e transformações.
- [x] Consultar a página da wiki do personagem, as páginas das habilidades/elementos/trilhas relacionadas e as referências indicadas nelas.
 (2026-11-01: wikitext pela API para todos de 3.2 a 3.28)
- [~] Verificar as cenas relevantes nos episódios oficiais. Registrar episódio, cena e timestamp quando possível; não inventar timestamp se não foi conferido.
 — só os timestamps que a wiki cita; episódios não assistidos nesta passada.
- [~] Para poderes que vêm do RPG, consultar a descrição mecânica no livro/suplemento. Se o texto integral não estiver disponível legalmente, não reconstruir regras detalhadas de memória: usar a descrição pública e marcar a incerteza.
 — usada a descrição mecânica da wiki; o livro não foi consultado.
- [x] Criar uma tabela: **habilidade atual → comportamento real no código → referência canônica → divergência → proposta → impacto técnico → teste de aceite**.
 (tabela completa no 3.1/3.2; resumo por personagem nos demais)
- [x] Marcar cada conclusão como uma destas categorias:
  - **CONFIRMADO:** aparece em fonte oficial ou descrição mecânica identificável.
  - **ADAPTAÇÃO:** efeito criado para traduzir a habilidade para combate em tempo real.
  - **PROPOSTA NÃO CANÔNICA:** ideia nova de gameplay; nunca a descrever como poder oficial.
  - **INCERTO:** a fonte consultada não permite confirmar.
- [x] Só depois da auditoria, propor mudanças. Não remover habilidade existente sem explicar o que entra no lugar.
- [ ] Depois de qualquer implementação, atualizar este TODO, `CHANGELOG-ADMIN.md`, `HABILIDADES.md` e os documentos de versão pertinentes; executar `npm run check`, `npm test` e `npm run build`, e realizar testes visuais.

---

#### 2. Raziel — Conclusão da pesquisa de cânone e plano de melhoria

##### 2.1 Referências para consulta
- **Episódios oficiais de Hexatombe:**
  - Episódio 7 — "Consequências": https://www.youtube.com/watch?v=K_c2VdmPuLg
  - Episódio 8 — "Culpa": https://www.youtube.com/watch?v=-7prXUHT8OM
  - Episódio 9 — "Banho de Sangue": https://www.youtube.com/watch?v=p5alZam12ss
- **Páginas de referência comunitária:**
  - Raziel: https://ordemparanormal.fandom.com/wiki/Raziel
  - Vampiros: https://ordemparanormal.fandom.com/wiki/Vampiros
  - Monstruosos: https://ordemparanormal.fandom.com/wiki/Monstruosos
  - *Sobrevivendo ao Horror*: https://ordemparanormal.fandom.com/wiki/Ordem_Paranormal_RPG%3A_Sobrevivendo_ao_Horror

A página de Raziel aponta o episódio 7 como sua aparição completa, o episódio 8 como parte de sua história e o episódio 9 como o confronto final. O episódio 9 é a principal referência visual/comportamental para a forma verdadeira. A wiki cita por volta de **5h12m15s** para a fala do banquete no episódio 9. O TODO da v3.44.0 também aponta cenas da igreja por volta de 4h55, 5h05, 5h20, 6h10 e 6h50 para a construção da arena.

##### 2.2 Identidade canônica que o jogo deve preservar
Raziel é descrito como **Combatente da trilha Monstruoso, afinidade com Sangue**, líder dos Vampiros. Ele alterna duas faces que não devem ser tratadas como simples troca de roupa:
- **Forma base — predador aristocrático:** postura controlada, fala educada e teatral, inteligência tática e violência súbita. Rápido e fisicamente dominante sem agir como um bruto desorientado o tempo todo.
- **O Verdadeiro Raziel — bestialidade exposta:** depois de sofrer ferimentos graves, rasga as vestes e passa a agir com muito mais agressividade, gritos e perda de controle. Ataca alvos ao alcance, devora vítimas vulneráveis e fica mais brutal. Ainda conserva reações emocionais e algum direcionamento: não deve virar uma IA aleatória que só corre sem conseguir lutar.

A forma base é a tradução de sua ficha mais ritualística/elegante; a forma verdadeira deve se concentrar em ataques diretos, pressão, mordida, resistência e devoração. Não tratar a forma verdadeira apenas como a mesma lista de golpes com multiplicadores maiores.

##### 2.3 Evidências narrativas e consequências para o kit
| Evidência em Hexatombe / material de referência | Tradução recomendada para o jogo | Limite da interpretação |
|---|---|---|
| Raziel é líder dos Vampiros e consegue derrubar Harpia com um golpe. | Golpes físicos pesados e reação de impacto convincente; força como identidade do personagem. | Não significa que todo golpe deva causar dano extremo ou quebrar qualquer defesa. |
| Ele entra no incêndio do circo e continua avançando, mas a narrativa indica que ainda sente o dano. | Pode ter postura destemida e avançar sob pressão; usar resistência geral de Endurecer Sangue quando ativado. | **Não conceder imunidade a fogo** com base nessa cena. Ele sente o dano. |
| Avança sobre Henri em velocidade descrita como um vulto; agarra-o e morde-o duas vezes. | A Mordida deve ter aproximação curta/rápida, agarrão claro, duas mordidas e cura. | Evitar teleporte literal se a referência só sustenta velocidade extrema. |
| Uma facada de Henri parece não detê-lo; Raziel usa Endurecer Sangue. | Endurecer Sangue é a ferramenta defensiva principal: resistência temporária, crosta visual de sangue e reação de impacto reduzida. | Resistência não deve ser invulnerabilidade; permitir contrajogo, fim de duração e interrupções coerentes. |
| Maldição Sanguínea apodrece o sangue do alvo e o deixa Abalado, com penalidade de −1 dado para testes durante a cena; pode ser resistida. | Manter o ritual como debuff relevante, com duração/recarga legíveis e possibilidade de resistência ou redução por defesa. | Como o jogo não usa testes por dados, mapear explicitamente −1 dado para um efeito de gameplay; não afirmar que o debuff atual equivale perfeitamente à regra. |
| Bote Retalhador causa dano enorme; se o alvo esquiva, ainda recebe metade, até 105 na descrição da wiki. | Preservar a regra especial de raspão em esquiva, restrita ao alcance e arco do bote. Dar telegraph suficiente para que o golpe seja forte, mas legível. | O valor 105 é uma referência de ficha, não obrigação de copiar literalmente para o balanceamento do jogo. |
| Turno Extra permite realizar duas ações/turnos por rodada na descrição mecânica. | Traduzir a economia de ações para um jogo em tempo real: janela limitada para golpe/ação adicional após acerto, ou cancelamento especial de recuperação. | `attackSpeed: 1.12` sozinho **não** implementa uma ação extra. Não criar ataques extras infinitos nem retirar todo o contrajogo. |
| No estado bestial, quando vê um corpo morrendo próximo, Raziel não consegue se controlar e o devora. | Sede Incontrolável deve ser contextual e característica da forma verdadeira: identificar alvo vulnerável próximo, entrar numa animação de devoração, causar dano/consumir uma oportunidade e recuperar vida. | Não aplicar a corpos já em KO se a lógica de combate não suporta interação pós-KO; a ação deve acontecer antes do encerramento definitivo e não prolongar artificialmente o round. |
| Na luta da igreja, após sofrer dano grave e um tiro na cabeça, ele rasga as roupas e revela a forma verdadeira; devora Cindy e Maria quando estão morrendo. | A transformação deve ter apresentação própria e mudar o comportamento. Pode ser ativada pelo jogador; se houver gatilho automático por vida, ele precisa ser opcional/consistente com as regras de transformação do jogo. Sede Incontrolável deve priorizar alvos vulneráveis. | Não exigir a reprodução literal do evento da cena em toda partida. A forma é uma tradução jogável, não uma cutscene obrigatória. |
| Cristino arranca um braço de Raziel e ele continua tentando atacar Remi antes de Juan finalizá-lo. | A forma verdadeira pode continuar ofensiva mesmo sob pressão e demonstrar ferimentos sem perder a capacidade de lutar. | Desmembramento permanente não é necessário em partidas normais; pode ficar restrito à cinemática/efeito especial. |
| Raziel devora vítimas e, ao final, Juan o mata e devora sua cabeça. | Especial de banquete deve comunicar agarrão, mordida e recuperação de vida. Uma interação especial com Juan pode ser considerada, mas apenas como conteúdo opcional e aprovado pelo dono. | Não dar imortalidade, ressurreição ou devoração universal ao Raziel com base no fato de ser vampiro. |

##### 2.4 Auditoria do código atual e tarefas propostas para Raziel
O código atual já contém `src/characters/raziel.js`, `src/characters/forms/raziel_verdadeiro.js`, `src/combat/razielAbilities.js` e clipes próprios em `src/anim/razielClips.js`. Não recomeçar o personagem do zero.

- [x] **RZ-01 — Turno Extra** (2026-10-26): passiva `extraTurn` — o FINALIZADOR do combo que acerta abre 2 s em que a
  próxima habilidade é a "ação extra" (não entra em recarga; gasta a janela); recarga interna de 10 s, zera no round;
  vale também na forma verdadeira. Testado: a Mordida dentro da janela sai sem recarga; CPU × CPU sem erro.
  Pedido original: Rever a implementação atual (a passiva está representada apenas por `attackSpeed: 1.12`). Escolher e documentar uma adaptação real de ação extra para combate em tempo real (ex.: janela limitada para golpe/ação adicional após acerto com cooldown interno). Limitar a uma oportunidade por janela/cooldown para não encadear infinitos. Testar jogador, CPU, bloqueio, esquiva, combo, interrupção e fim de round.
- [x] **RZ-02 — Sede Incontrolável** (2026-10-26): no DEVORAR da forma verdadeira (`thirst` em `vampireBite`), contra
  alvo abaixo de 30% da vida: aviso "SEDE INCONTROLÁVEL" (anel e sangue, batida de coração), o bote vai 1,6 m mais
  longe, morde 1,4× e bebe 100%; a CPU prioriza o Devorar nessa hora só com o alvo no alcance do bote. Testado: de 3,2 m
  pegou, 90 de dano, bebeu tudo. Pedido original: Implementar a condição de alvo vulnerável/morrendo próximo apenas na forma verdadeira. Adicionar indicação visual/sonora breve e uma ação de devoração legível. Definir raio, limiar de vida/estado, duração, cura e recarga com base no balanceamento existente. Fazer a CPU usar a mecânica com prioridade contextual sem ficar presa tentando devorar um alvo fora de alcance. Testar KO, interrupção, alvo protegido, multiplayer e encerramento da luta.
- [x] **RZ-03 — Banquete Bestial próprio** (2026-10-26): roteiro novo no `cinematicCombo` — ruge e explode em sangue
  (`db_powerup` + `bloodBurst`), investida mais rápida (30 m/s), câmera das garras (`shots: 'claw'`), frenesi de 4 garras
  (sangramento), o DEVORAR no centro (duas mordidas longas com o alvo de joelhos, `drain: 1` e a opção nova `gore`:
  sangue jorrando do pescoço e tremor) e o rasgo final que joga no chão (`endReaction.lowLaunch`). Dano fixo de 320
  (sem execução contextual). Testado: 242 de dano/74 de cura contra o Balu, KO no meio fecha a cena, interrupção por
  golpe libera os dois, cena de ~3,7 s. Pedido original: O especial da forma verdadeira não deve apenas herdar a sequência do especial base mudando cor e dano. Base: encenação de anfitrião/predador controlado, agarrão e mordidas com drenagem. Forma verdadeira: início explosivo, garras/rasgos, mordida/devorar como centro e finalização visual mais animalesca. Se não existir mecânica segura de execução contextual, aplicar dano fixo em cinemática brutal. Testar interrupção, invulnerabilidade, KO e duração da cutscene.
- [x] **RZ-04 — Rasgo de Sangue → VULTO RETALHADOR** (2026-10-26, opção B): no cânone o Raziel não atira; o □ virou a
  investida longa (`dashStrike`, 10 m a 34 m/s) que termina num X de garras com sangramento (opção `bleed` nova no
  `dashStrike`); `aiRange: 10` para a CPU usar de longe (opção nova lida pela CPU). Diferente do Frente + ○ (bote curto
  do combo). Testado: de 9 m acerta 28 + sangra, a 14 m erra sem dano, na defesa tira 7; CPU usa. Pedido original: O projétil em meia-lua é uma adaptação de gameplay, não uma habilidade canônica confirmada. Decidir explicitamente entre (A) mantê-lo como licença de gameplay, documentada como adaptação; ou (B) substituí-lo por uma investida rápida de garras (dash/bote frontal), que comunica melhor a velocidade de vulto e o combate direto do episódio. Preservar o botão e função de gameplay do golpe; testar alcance, bloqueio, esquiva e combos.
- [x] **RZ-05 — Maldição Sanguínea** (2026-10-26): −1 dado → bate 20% mais fraco; apanha 10% mais (era 12%); 6 s (era
  8 s: ficava 57% do tempo no ar, agora ~43%); renova sem acumular; quem defende resiste a metade; o alvo pinga sangue
  podre enquanto durar (some no fim e na troca de round, testado). Pedido original: Manter a penalidade de −1 dado como a referência do RPG e documentar a tradução para combate em tempo real. A implementação atual de dano inicial + `ABALADO` + redução de dano causado + aumento de dano recebido é uma adaptação; verificar se o efeito é compreensível e não excessivo. Rever duração, resistência, defesa, substituição de estado e encerramento de round.
- [x] **RZ-06 — Endurecer Sangue** (2026-10-26): a crosta (`buildBloodArmor`) sumia no casacão vermelho — opção nova
  `bright` (mais viva, molhada e pulsando; `brightBloodArmor: true` no Raziel), conferida no jogo. Testado: −40% de todo
  dano (116 → 70 físico; especial 56), 3 golpes sem recuar e o 4º faz recuar, o AGARRÃO ainda pega (não é imunidade), e
  ao fim dos 6 s a crosta, o buff e as armaduras saem. Pedido original: Confirmar visualmente a crosta de sangue sobre a roupa e a leitura clara de defesa temporária. Testar dano físico, paranormal, agarrões, especiais, interrupções e fim de duração. Não converter a resistência em imunidade a todos os efeitos.
- [x] **RZ-07 — Forma verdadeira com kit próprio** (2026-10-26): a fera não se protege — o Endurecer Sangue sai e entra
  a LÍNGUA (`tongueLash`: dispara até 6,5 m, enrola, puxa para as garras e atordoa; não defensável, a esquiva escapa;
  errar deixa exposto); □ VULTO BESTIAL (mais rápido, 36, sangra mais); passiva PREDADOR (+20% em atordoado, caído,
  tomando golpe ou < 30% da vida); somam-se Devorar com a Sede (RZ-02), o Frenesi e o Banquete Bestial (RZ-03).
  Testado: Língua pega (25 + sangra), atravessa a defesa (24), a esquiva escapa, de 9 m erra; Predador 90 → 108; no
  round seguinte volta ao Raziel normal com `prop_up`/`prop_true` trocados de volta; CPU usa a Língua. Pedido original: Preservar os golpes de base que ainda fazem sentido, mas dar função mecânica distinta à forma: pressão física, aproximação rápida, cura por mordida/devoração e punição de oponentes vulneráveis. Não depender apenas de aumento de atributos, sangramento e cor de VFX. Revisar se Endurecer Sangue precisa permanecer no kit transformado. Validar retorno à forma normal/round seguinte e troca das peças visuais `prop_up`/`prop_true`.
- [x] **RZ-08 — Afinidade com Sangue** (2026-10-26): registrado no código e no HABILIDADES — Combatente, trilha
  Monstruoso, afinidade com Sangue. A `elementalAffinity` ganhou `element` (só os rituais desse elemento ficam mais
  fortes) e `resist` (resiste a rituais desse elemento): Raziel +10% nos rituais de Sangue e −15% dos rituais de Sangue
  dos outros; a fraqueza a Morte já vem do ciclo. Penalidades de interpretação/progressão do Monstruoso não entram.
  Kaiser e Nubi seguem iguais. Testado: ritual de Sangue da Agatha 115 → 98; Kaiser 115 (igual). Pedido original: Registrar que Raziel é um Combatente Monstruoso com afinidade em Sangue. Não transformar Afinidade Elemental numa habilidade genérica sem função; usá-la para orientar a identidade de rituais e resistências. Não importar para o jogo todas as penalidades de interpretação e progressão do RPG sem decisão explícita.
- [x] **RZ-09 — Validação final** (2026-10-26): CPU × CPU (difícil, na Igreja) contra um de cada perfil, dos dois lados
  — rápido (Gal), tanque (Lírio), zoner (Arthur), agarrador (Dalmo), ritualista (Magistrada): 10 partidas até o fim, sem
  erro, sem NaN, sem cena travada (a maior: Banquete Bestial, 3,9 s), forma verdadeira entrando e saindo. Testes do jogador
  feitos com o testkit em cada item (RZ-01 a RZ-08); `tests/raziel.test.js` (5 testes) e o check cobrem o kit.
  **Para a fase de balanceamento (não mexido agora):** (1) o Raziel venceu 9 das 10; (2) combos longos de 5 a 7 s em
  hitstun contínuo (Gal e Magistrada no Raziel, Raziel na Magistrada) — não é estado travado (a vida cai a cada golpe),
  é o motor permitindo combos longos e a CPU sem usar a Substituição para sair. Pedido original: Testar base e forma verdadeira contra pelo menos um personagem de cada perfil (rápido, tanque, zoner, agarrador e ritualista). Testar CPU × CPU e jogador × CPU. Verificar hitboxes, câmera, animações, VFX, barra de vida, energia e cooldown. Verificar se o especial não trava o oponente após interrupção/KO. Atualizar documentações e testes.

---

#### 3. Auditoria de fidelidade — Elenco completo, personagem por personagem

Para cada personagem, produzir a análise `habilidade atual → código real → fonte/cena → divergência → proposta → teste`, com links e timestamps conferidos:

- [x] **3.1 Arthur Cervero — auditado (2026-10-26)** contra a wiki "Arthur Cervero" (seções Aparência, Rituais e
  Habilidades de Desconjuração e Calamidade):
  | Habilidade | Código | Fonte | Divergência | Feito |
  |---|---|---|---|---|
  | Um braço | `oneArm`, modelo sem o esquerdo (manga vazia) | braço ESQUERDO arrancado pelo Minerador (Santo Berço) | os cortes da Arma de Sangue não eram checados | check novo: os cortes também são de um braço |
  | Sniper | □ 110 + tiro carregado, Golpe de Sorte, Furtivo e Letal | Atirador de Elite (Calamidade), margem 16–20, d8 furtivo | — (rifle é o centro; chutes são o corpo a corpo de um braço) | — |
  | Rebirth | arma amaldiçoada, raios VERDES | Desconj.: Amaldiçoar Tecnologia (verde); Calam.: Amaldiçoar Arma com Energia (roxo) | verde por pedido do dono (HQ) | mantido, documentado |
  | Templo do Ódio | +35% físico, não defende | Calam.: +1 dado ataque/dano corpo a corpo, NÃO CONJURA RITUAIS, precisa atacar | faltava "não conjura rituais" | `noRituals`: Rebirth, Dystopia e Arma de Sangue bloqueados (tiro e chutes liberados); vale na assistência; CPU respeita |
  | Dystopia | paralisa à frente, custa vida | marca o alvo, arame no braço, sangue no Símbolo do peito, olhos vermelhos | — | — |
  | Olhos Sempre Abertos | +15% / −15%, aura de sangue | nome do jogo; cânone: Afinidade com Sangue (50%): vantagem nos rituais de Sangue e, em Calamidade, rituais de Sangue SEM INGREDIENTES | só multiplicadores | passiva `bloodAffinity`: Templo, Dystopia e Arma de Sangue não custam vida na forma; comentário corrigido (as mechas brancas são do Medo, não da afinidade) |
  Testado: o Templo bloqueia a Dystopia e libera Brecha e o tiro; na forma a Dystopia e a Arma custam 0 de vida (fora dela
  a Arma custa 40); CPU × CPU sem erro (a CPU às vezes enfileira um ritual logo antes do Templo pegar: só o aviso).
  Itens originais da auditoria:
  - Conferir se a animação corporal respeita a regra de um braço em todos os golpes, esquivas, vitória, especial e transformação.
  - Confirmar que o rifle é o centro do kit de longo alcance e que golpes corpo a corpo são opções de emergência.
  - Comparar Rebirth com a arma amaldiçoada e seus efeitos de Energia na fase correta; distinguir a versão de Desconjuração da de Calamidade.
  - Verificar se Templo do Ódio representa o ritual e não um buff sem custo/risco; definir como a fúria se traduz sem suicídio de IA.
  - A forma Olhos Sempre Abertos deve ter mudança visual e mecânica legível.
  - Testar mira, alcance, hitboxes do rifle, interrupção do especial, colisão com cenário e golpes de um braço.

- [~] **3.2 Joui Jouki (`src/characters/joui.js`; forma `forms/joui_shinokage.js`):** auditado em 2026-11-01 contra a
  wiki (nota "Joui perdeu essa habilidade ao entregar a Máscara para a Magistrada" em Teleporte, Portal, Olhar do
  Desespero, Decepar e Um por Um).
  | Habilidade | Código | Fonte | Divergência | Feito |
  |---|---|---|---|---|
  | Teleporte das Sombras, Portal das Sombras, Tomado pelo Ódio | mascarado | máscara (Calamidade) | — | ok, só no mascarado |
  | Olhar do Desespero | estava na forma Shi no Kage | máscara | forma é a fase SEM máscara | trocado por **Ataque Volátil** (canônico do Joui, Calamidade ep. 11, sem máscara) |
  | Passivas Decepar e Um por Um | estavam na forma | máscara | idem | saem da forma (ficam no mascarado) |
  | Decepar (△+L2 da forma) | heavyBlow | máscara | idem | **em aberto**: pedido do dono — decidir manter como licença ou trocar |
  | Envelhecimento Localizado "Mateo" | healOverTime | Desconjuração | faltava a cicatriz em espiral | descrição corrigida |
  | Coincidência Forçada "Rodolfo", Pavor Anormal | contra-ataque / armadilha | Desconjuração | — | ok nas duas fases |
  | Resistência Paranormal, Precognição, Desarmar | passivas | Calamidade | Resistência vem de Celestine, não da Seita | ok nas duas fases |
  | Sombra Rasteira, Corte de Conhecimento, Saque da Relíquia | projétil / avanço | proposta | — | marcados como proposta |
  Falta: decisão sobre o Decepar e o teste em jogo da troca de forma/teleporte.
  - Conferir a fase exata de cada poder de sombra, máscara e katana.
  - A transformação Shi no Kage deve usar a katana da Magistrada apenas se a referência temporal e narrativa confirmar a associação desejada; não misturar o kit da máscara com a fase da nova katana.
  - Confirmar o efeito e o nome de cada ritual, especialmente Envelhecimento Localizado e Portal das Sombras.
  - Separar mobilidade de sombra, corte físico e controle por medo em funções diferentes.
  - Testar troca de forma, modelo/arma, cancelamento de teleporte, distância máxima, ataques aéreos e retorno de round.

- [x] **3.3 Kaiser (`src/characters/kaiser.js`):** auditado em 2026-11-01 (wiki "Cesar Oliveira Cohen"): Acácia, Cinerária (névoa de 5 m, esquiva e rituais fortalecidos), Resistente, Afinidade Elemental e Combate Perfeito batem com o cânone. Feito: **Acácia +40% contra quem é de Energia** ("grande dano em entidades de Energia" — `vsElement` no `flowerRain`); **Dendrobium** marcado como proposta (no cânone compartilha a visão; no jogo marca e prende). Foto com Flash, Granada Nebulosa e Balas Amaldiçoadas: equipamento/proposta, ok. Saque Rápido e Iniciativa Aprimorada sem efeito próprio (o jogo já troca de arma na hora).
  - Confirmar quais armas aparecem em cada fase e não alternar entre M4, Desert Eagle e karambit sem transição visual.
  - Separar disparo balístico, bala amaldiçoada e ritual de área. Cada um deve ter telegraph, alcance e resposta diferentes.
  - Verificar a fidelidade visual de Cinerária/névoa e Acácia, evitando que o efeito de Energia vire explosão roxa genérica.
  - Auditar a interação com Rejeitar Névoa do Kian: responder aos efeitos compatíveis sem anular todo o kit da Kaiser.
  - Testar munição, cadência, recarga/cooldown, bloqueio, projéteis simultâneos e câmera.

- [x] **3.4 Dante (`src/characters/dante.js`; forma `forms/dante_aberto.js`):** auditado em 2026-11-01 (wiki "Dante"): Decadenza, Paradiso, Rotura, Trinitá (e o aprimorado com troca de lugar), Eco Dolor, Paradoxo, Tentáculos de Lodo e a Invocação da Marionete têm nome e efeito pelo cânone, cada um com um tipo próprio (`decadence`, `agingHeal`, `shuffle`, `echoPain`, `paradox`, `lodoTentacles`, `marionette`). A forma Olhos Abertos ganha kit de Calamidade (Paradoxo, Eco Dolor, Trinitá Aprimorado), não só números. Sem mudanças. Fora do kit (não-combate): Terceiro Olho, Leitura Psíquica, Mergulho Mental, Brute, Fortalecimento Sensorial, Disparo de Energia.
  - Conferir nome e efeito de cada ritual por fase; evitar que Decadenza, Paradiso e Rotura sejam confundidos como “lodo que causa dano”.
  - Diferenciar debuff/doença, controle de espaço, cura e especial temporal por animação, som e resposta do adversário.
  - Verificar se Invocação: A Marionete pertence à versão/fase correta e se sua execução representa a fonte.
  - A forma Olhos Abertos deve ter kit coerente com a mudança de fase, não só multiplicadores de dano.
  - Testar duração de efeitos, cura, hitboxes dos tentáculos e leitura visual em cenários escuros.

- [x] **3.5 Erin Parker (`src/characters/erin.js`; forma `forms/erin_caos.js`):** auditado em 2026-11-01 (wiki "Erin Parker"): Bênção Maldita e Envelhecimento Localizado Discente "Black Hole" canônicos; granadas Supernova/Nebulosa/Luz e a escopeta são equipamento da série. Sem mudanças. Mira Certeira (dobro de dano no extremo) fica como possível passiva futura.
  - Conferir o efeito de cada granada e manter diferenças reais de área, tempo de detonação e contrajogo.
  - Distinguir Bênção Maldita (visão/previsão) da cura de Black Hole; não transformar ambos em projéteis de dano.
  - Verificar a forma Em Nome do Caos na cena de origem: mudança de postura, poder, visual e intenção.
  - Confirmar se o amuleto elétrico deve atuar como reação ao ser atingida.
  - Testar explosões perto de ambos os jogadores, autocolisão, bloqueio, esquiva e tempo de detonação.

- [x] **3.6 Aghata (`src/characters/aghata.js`):** auditado em 2026-11-01 (wiki "Agatha"): Passagem de Conhecimento, Descarnar, Passagem de Conhecimento Expandido (Transformação), Leitura de Rituais e Amaldiçoar (Facas Amaldiçoadas — no cânone ela amaldiçoa balas com Sangue; no jogo a arma dela é a faca) batem. Sem mudanças.
  - Confirmar o que demonstra em cada campanha/fase e quais poderes pertencem à ficha de RPG.
  - Diferenciar leitura/análise de ritual, preparação de arma e dano direto.
  - Verificar se Passagem de Conhecimento muda uma condição do combate ou só causa dano; descrição, VFX e efeito devem coincidir.
  - Documentar qual habilidade se amplia na forma expandida.
  - Testar legibilidade de sigilos, custo de energia, interrupção e variedade de ataques.

- [x] **3.7 Gal Sal (`src/characters/gal_sal.js`):** auditado em 2026-11-01 (wiki "Gal"): Controle Mental, Teletransporte (faíscas douradas), Velocidade Mortal, Ereshkigal e Desviar de Balas batem. Feito: passivas **Resistente** e **Precognição** (canônicas, faltavam). Bênção Maldita Discente e Sugada Mortal (não usada na série) ficam fora.
  - Confirmar se cada habilidade está ligada ao personagem, à arma Ereškigal ou a um ritual.
  - Verificar a regra especial de “cura invertida”: quem recupera vida, quem perde energia e se o HUD corresponde ao código.
  - Distinguir puxão, captura, controle mental e teletransporte.
  - Confirmar a forma Realizador do Destino e comportamento próprio além de atributos.
  - Testar correntes em alvos no ar, bloqueio, esquiva, limites de distância e cancelamento de captura.

- [x] **3.8 Nubi (`src/characters/nubi.js`):** auditado em 2026-11-01 (wiki "Nubi"): a página só lista Afinidade Elemental (Morte) — está no jogo (`elementalAffinity`). O resto do kit (Decadência, Lodo, Drenagem, bengala de chacal, Carniçal da Esfinge) é proposta coerente com o elemento e já marcada na ficha. Sem mudanças.
  - Conferir a cena da Mansão Leone e separar o ritual do Carniçal da Esfinge dos ataques comuns de lodo.
  - Verificar se Desvio Imperturbável comunica antecipação/percepção alterada, em vez de esquiva instantânea sem leitura.
  - Distinguir aprisionamento, drenagem, decadência e invocação em funções e animações.
  - Revisar a classificação elemental para não deduzir apenas pela cor do VFX.
  - Testar invocação, colisão da criatura, alcance da bengala e duração do lodo.

- [x] **3.9 Xande / Alexandre (`src/characters/xande.js`):** auditado em 2026-11-01 (wiki "Alexandre"): Amaldiçoar Arma, Polarização Caótica, Tela de Ruído, Velocidade Mortal e Cicatrização são rituais da ficha dele. Sem mudanças.
  - Conferir se o skate aparece como ferramenta de mobilidade e ataque de modo consistente, sem sumiço/teleporte sem animação.
  - Diferenciar Polarização Caótica de Tela de Ruído por função e efeito visual; confirmar elemento e ritual de cada um.
  - Verificar a passiva Gladiador Paranormal e adaptação da recuperação de recurso sem gerar energia infinita.
  - Confirmar coerência entre cicatrização, velocidade e ataques com o taco.
  - Testar trajetória do skate arremessado, retorno à mão, colisão, hitbox do taco e cancelamento aéreo.

- [x] **3.10 Guizo (`src/characters/guizo.js`; formas ET, bombado e velho):** auditado em 2026-11-01 (wiki "Guizo"): Decadência, Amaldiçoar Arma com Sangue, Velocidade Mortal, Embaralhar, Espirais da Perdição, Cicatrização, Invadir Mente (o tiro), Distorcer Aparência (as formas), Desacelerar Impacto (`slowImpact`) e Eu Já Sabia (`iKnewIt`) batem. Sem mudanças.
  - Confirmar o que cada forma representa na narrativa e não tratar ET, bombado e velho como simples skins se houver habilidades diferentes.
  - A câmera deve fazer parte da identidade visual/comportamental sem ocupar a mão da faca de modo impossível.
  - Verificar se Invadir Mente, Embaralhar e Espirais da Perdição têm efeitos distintos.
  - Se as formas bombado/velho multiplicam dano e reduzem cooldown, avaliar suficiência da variação sem inventar poderes sem fonte.
  - Testar troca de forma, escala, hitbox e animação da faca com a câmera.

- [x] **3.11 Lírio Tellini (`src/characters/lirio.js`):** auditado em 2026-11-01 (wiki "Lírio Tellini"): Sangue de Ferro (`ironBlood` + a Transformação), Casca Grossa (`thickSkin`), Ataque Especial e Golpe Pesado (`heavyBlow`), Mão Pesada (`heavyHand`), Cai Dentro e Proteção Pesada — todos no jogo. Sem mudanças.
  - Confirmar a modelagem exata da Leonora e como as miniaturas amaldiçoadas aparecem durante os ataques.
  - Diferenciar proteção/absorção de dano de superarmadura: resistir sem ignorar todos os ataques.
  - Verificar se Amarras de Sangue controla o alvo com duração, escape e telegraph.
  - Compensar lentidão e curta distância com impacto real sem invulnerabilidade absoluta.
  - Testar empurrão, agarrões, ataques aéreos, superarmadura e proteção de aliado.

- [x] **3.12 Balu (`src/characters/balu.js`):** auditado em 2026-11-01 (wiki "Balu"): Amaldiçoar Arma com Sangue, 110%, Língua de Prata (Fala Imponente), Machado Demônio e o colete batem. Técnica Secreta, Saque Rápido e Derrubar e Atacar sem efeito próprio. Sem mudanças.
  - Conferir a transformação do machado: a arma comum deve virar a maça-estrela de sangue na habilidade correta.
  - Distinguir Fala Imponente (pressão/controle), 110% (esforço físico) e Colete (defesa balística).
  - Verificar custo em sangue/vida associado ao Machado Demônio se presente na fonte.
  - A personalidade protetora deve aparecer em postura, reação e defesa.
  - Testar armadura contra tiros, corpo a corpo, agarrões e visual antes/depois da maldição.

- [x] **3.13 Cristino (`src/characters/cristino.js`; forma `forms/cristino_desertor.js`):** auditado em 2026-11-01 (wiki "Cristino", Arsenal): Espingarda Socadeira, Peixeira e Lampiões Explosivos batem; Corda do Telhado (Igreja de Sangue) e Decepar já têm fonte na ficha. Sem mudanças.
  - Conferir ordem de uso das armas: espingarda carregada pela boca tem ritmo diferente de arma moderna.
  - Diferenciar lampiões como controle/preparação de área em vez de simples granada.
  - Validar a corda e deslocamento em relação às cenas sem conceder teleporte não mostrado.
  - Verificar mudança de kit na forma Desertor e se o rifle altera o ritmo e a distância preferencial.
  - Testar munição/cooldown, explosão, corda, troca de forma e hitboxes da peixeira.

- [x] **3.14 Cristopher Cohen (`src/characters/cristopher.js`):** auditado em 2026-11-01 (wiki "Cristopher Cohen"): Experiência de Dublê (Levanta, Grandão!), Físico (A Muralha, pele grossa) e Direção Avançada (o carro) batem. Sem mudanças.
  - Confirmar movimentos de dublê/luta coreografada: quedas, rolamentos e agarrões legíveis.
  - A Muralha e Último Sacrifício devem ter função defensiva e protetora clara, não apenas dano alto.
  - Conferir relação entre Último Sacrifício e Kaiser (ataque conjunto, assistência ou cena independente).
  - Evitar transformar o personagem num tanque genérico sem as técnicas de dublê.
  - Testar agarrões, rolamentos, proteção, invulnerabilidade e especial conjunto.

- [x] **3.15 Dalmo Magno (`src/characters/dalmo.js`; forma `forms/colosso.js`):** auditado em 2026-11-01 (wiki "Dalmo Magno"): Golpes de Arena (`arenaBlows`) e Pressão Atmosférica (atordoa) batem. Sem mudanças.
  - Conferir velocidade menor compensada por alcance e impacto.
  - Golpes de Arena deve recompensar combate corpo a corpo sem gerar ataques infinitos.
  - A Glória Era Viciante precisa refletir a sede de arena de forma mecânica/narrativa coerente.
  - Na forma Colosso, confirmar escala, câmera, alcance e hitbox sem desalinhar colisão.
  - Testar agarrões, atropelamento, pressão e limites da arena.

- [x] **3.16 Jonas Aguiar (`src/characters/aguiar.js`; forma `forms/aguiar_mutilador.js`):** auditado em 2026-11-01 (wiki "Jonas Aguiar"): Ataque Especial, Predador de Sangue e, com a máscara, Ataque Mutilador / Predador Perfeito (forma `aguiar_mutilador`) batem; armadilha de urso e os cães são do acampamento da série. Sem mudanças.
  - Distinguir Aguiar sem máscara do Mutilador Noturno; não misturar poderes entre as duas fases.
  - Confirmar o machado arremessado pela corda com trajetória legível e puxão evitável.
  - Armadilha de Urso e Cães de Caça devem controlar e pressionar o espaço com funções distintas.
  - Validar elemento Sangue com a fonte oficial.
  - Testar armadilhas no cenário, limite de armadilhas, puxão e troca de forma no round.

- [x] **3.17 Park Jae-Yoon (`src/characters/jae.js`; forma `forms/jae_x.js`):** auditado em 2026-11-01 (wiki "Park Jae-Yoon"): Assassinato Furtivo, Zona dos Sussurros, Punhal X e, com o Capuz de X, Assassinato Cruel e Zona das Sombras (armadilha de Conhecimento, 3 m) batem. Sem mudanças.
  - Confirmar distinção entre Jae sem máscara e X/Capuz de X com mudança de comportamento.
  - Furtividade deve criar janela tática curta com aviso sonoro/visual e resposta, sem invisibilidade injusta.
  - Diferenciar punhaladas rápidas, arremesso e ataque surpresa em alcance e recuperação.
  - Confirmar pronome e nome consistentes na UI (Jae, X, Park Jae-Yoon).
  - Testar furtividade contra CPU, lock-on, ataque pelas costas e esquiva.

- [x] **3.18 Kemi (`src/characters/kemi.js`; forma `forms/fantasma.js`):** auditado em 2026-11-01 (wiki "Kemi"): Perita, Disparo da Morte, Sniper da Morte e, com as Faixas da Fantasma, Analítica e Disparo Espiral (balas curvas) batem. Sem mudanças. No especial em equipe dos Mascarados ela entra como Fantasma (a forma é a máscara dela).
  - Separar rifle de precisão, revólver, faca e Pistola Transtornada em funções distintas.
  - Confirmar se Sede de Vingança pertence à Kemi, à Lena ou à condição do corpo utilizado.
  - A forma A Fantasma deve alterar o padrão de luta de modo coerente com as faixas e o papel de assassina.
  - Verificar tempo de reação na mira e contrajogo justo.
  - Testar distância máxima, colisão do projétil, execução e troca de modelo.

- [x] **3.19 Labirinto (`src/characters/labirinto.js`; forma `forms/labirinto_elmo.js`):** auditado em 2026-11-01 (wiki "Labirinto"): Rajada Caótica, Labirinto Mental, Capturar Momento, Mapa Sanguíneo e, com o Capacete do ???, Tempestade Caótica, Labirinto Abissal, Consumir Momento e Revelação Sanguínea — todos no jogo com o nome da ficha. Sem mudanças.
  - Conferir identidade do capacete antes de nomear a forma (manter "???" se não confirmado).
  - Diferenciar Rajada Caótica, Labirinto Mental, Mapa Sanguíneo e Capturar Momento.
  - Validar a função narrativa de cada poder com cenas em vez de apenas pacote genérico de Energia.
  - Garantir antena na mão correta em ataques, bloqueios, corrida e especial.
  - Testar zonas, efeitos temporais, câmera e retorno de forma.

- [x] **3.20 Juan / Henri (`src/characters/juan.js`; forma `forms/juan_odio.js`):** auditado em 2026-11-01 (wiki "Juan"): Armadura de Sangue (Diabólica), Vínculo de Sangue, Descarnar Discente, Perturbação Discente e Afinidade com Sangue batem. Sem mudanças.
  - Conferir cronologia e nomenclatura: Henri/Juan, Ódio do Diabo, pacto e Portador do Trono.
  - Verificar custo físico do pacto, sangue como recurso e progressão de forma.
  - Diferenciar Faca Predadora (dreno), Vínculo (controle), Perturbação (mental) e Descarnar (físico).
  - Confirmar ativação e duração da transformação por round.
  - Testar transições, regeneração, especial e consistência com o personagem O Diabo.

- [x] **3.21 O Diabo (`src/characters/o_diabo.js`; forma `forms/diabo.js`):** auditado em 2026-11-01 (wiki "O Diabo"): Ódio do Diabo, Sangue nos Arredores, Transportar pelo Sangue, Veias de Sangue, Senhor do Sangue, Pacto e Regeneração (Renascimento) batem. Sem mudanças.
  - Separar a entidade O Diabo selecionável da transformação de Juan; manter semelhanças mecânicas sem copiar identidade integralmente.
  - Conferir se Renascimento é transformação/estado e como funciona o retorno.
  - Verificar escala corporal, garras, chifres, manto e hitboxes.
  - Distinguir agressividade, agarrão, regeneração e pactos sem imunidades ilimitadas.
  - Testar espelhamento contra Juan transformado e transições.

- [x] **3.22 Ferreiro / Deus da Morte (`src/characters/ferreiro.js`; forma `forms/deus_morte.js`):** auditado em 2026-11-01 (wiki "Deus da Morte"): Espiral Descendente, Controlar Mortos, Senhor do Tempo e Regeneração estão na forma; o Ferreiro antes do pacto usa a Espada Consumidora e os Mananciais. Sem mudanças.
  - Confirmar condição de transformação e relação entre sanidade, tempo e morte com regra visível.
  - Diferenciar Espada Consumidora, lodo, hipnose e mananciais.
  - No Deus da Morte, ajustar escala de hitbox, câmera, distância e vulnerabilidade; confirmar fraquezas elementais com fonte confiável.
  - Evitar que tamanho e regeneração criem luta sem contrajogo.
  - Testar transformação por morte, reset de round e fraquezas.

- [x] **3.23 Arnaldo Fritz / O Anfitrião (`src/characters/arnaldo.js`; forma `forms/anfitriao.js`):** auditado em 2026-11-01 (wiki "Arnaldo Fritz", Arsenal e Itens Paranormais): a espada da fita vermelha e o Emissor de Pulsos Paranormais (atrai as criaturas de um elemento e afasta as do oposto — no jogo atrai de longe e repele de perto) batem; o kit do Anfitrião segue a ficha de Calamidade. Sem mudanças.
  - Separar esgrima teatral de Arnaldo do kit de caos/tempo do Anfitrião.
  - Conferir relógio/relíquia na transição e duração da forma por round.
  - Validar atração/repulsão do Emissor de Pulsos com leitura direcional clara.
  - Anfitrião com animações e especial próprios, sem ser apenas espada com efeitos de Energia.
  - Testar transição, efeitos de atração, colisão e retorno de round.

- [x] **3.24 Senhor Veríssimo (`src/characters/verissimo.js`):** feito (2026-10-31), conferido com a wiki "Senhor
  Veríssimo". Batem com o cânone: a espada do Arnaldo (esgrima de veterano, a estocada e a guarda — diferente da
  teatralidade do Arnaldo), a escopeta (Sinais do Outro Lado), a Jaqueta de Veríssimo (item amaldiçoado de proteção) e
  o Segredo de Veríssimo (o golpe fatal o deixa com 1 de vida; contra o Kian, a cada round — "impossibilita que Kian o
  mate"). INTELIGÊNCIA ESTRATÉGICA: no cânone ele dá a ORDEM aos aliados, que ganham um ataque extra — agora, além do
  corte extra (que passa para quem entrar em campo), na batalha em equipe as assistências ficam prontas na hora
  (testado: recarga 15 → 0). Sem loop: a ordem tem 18 s de recarga, o mesmo de uma assistência.
  - [x] **Jaqueta visível e transformação** (v4.10.0, 2026-11-02): a jaqueta canônica (wiki "Itens Amaldiçoados": aviador,
    couro marrom, gola forrada de pele branca) está no modelo (`prop_jacket`, escondida). A habilidade a veste durante o
    buff; o despertar Líder da Ordo Realitas a veste até o fim do round com as costuras acesas no azul da Ordo
    (`prop_ordoSeams`, PROPOSTA visual) — `awakenMode` ganhou `props`, e a habilidade não tira a jaqueta do despertar.
    Testado: começo, despertar, habilidade durante o despertar, fim da habilidade e fim do round.
  - Diferenciar a esgrima disciplinada de Veríssimo da teatralidade de Arnaldo, apesar da mesma espada.
  - Inteligência Estratégica deve refletir comando e abertura tática.
  - Conferir Segredo de Veríssimo e Olhos Sempre Abertos com a fonte.
  - Limitar liderança para evitar loops de ações extras com assistências/CPU.
  - Testar interceptação, proteção de aliado e combate solo.

- [x] **3.25 O Estrangeiro (`src/characters/estrangeiro.js`):** feito (2026-10-31). Transformação pelo cânone (Incubar:
  a larva no adversário), os Homens de Terno (Doppelgangers), a Abdução com o feixe que segue, a vítima girando no ar e o
  ESQUECIDO. COMANDAR ganhou contrajogo: um anel verde fecha em volta do alvo na preparação (dá para esquivar) e quem é
  controlado RESISTE apertando botões (0,12 s por botão: 2,5 s parado → ~1,4 s resistindo). Testado: abdução nas 4
  bordas do cenário sem sair dos limites (45 de dano), e o Estrangeiro nocauteado no meio da abdução solta a vítima no
  chão e o round seguinte começa normal.
  - Confirmar poderes próprios versus adaptações; justificar presença sem inventar posse de Relíquia se não houver fonte.
  - Diferenciar Comandar (controle), Oblívio (apagamento), Aparição (deslocamento) e Abdução (transporte).
  - Confirmar visual da máscara, fios, capa e proporções.
  - Fornecer contrajogo ao controle mental (telegraph, duração, escape).
  - Testar abdução em bordas, câmera, interrupção e fim de round.
  - [ ] **Ninho de Interflorados (pedido do dono, 2026-11-06; arte de referência do Interflorado enviada):** o
    Estrangeiro cria um PONTO DE SPAWN no chão. Por 40 s, sempre que o inimigo chega perto do ponto, nascem
    Interflorados dele. Eles são fracos e têm pouca vida, mas atrapalham no meio da luta. Visual pela arte: corpo de homem
    comum (camiseta clara, camisa xadrez marrom aberta, calça jeans), braços com veias verdes e mãos em raízes de dedos
    compridos; a cabeça é um emaranhado de galhos/raízes cheio de olhos verdes, com galhos compridos saindo para todos
    os lados e o limo verde escorrendo pelo pescoço e pela roupa.
    - Definir na implementação: o raio de "perto", quantos nascem por vez e o máximo em campo, o intervalo entre
      nascimentos, a recarga do ninho e se o ponto pode ser destruído.
    - Conferir na wiki o vínculo canônico Estrangeiro ↔ Interflorado antes de fechar; marcar PROPOSTA o que não tiver
      fonte.
    - Modelo: npc_* próprio, como os Zumbis de Sangue (`tools/blender/npc_*.py`).

- [x] **3.26 Amigo Imaginário (`src/characters/amigo.js`):** feito (2026-10-31) — ver "O AMIGO IMAGINÁRIO: melhorar
  os PODERES e o CÂNONE": Agarrão (puxa; no Frenesi arremessa), Dissolver (absorve e cura o dano causado), o Sino no
  Frenesi (a vítima morde a si mesma). Tentáculo físico, tinta, aprisionamento, dissolução e Sino agora têm papéis
  distintos.
  - Distinguir tentáculo físico, tinta/derreter, aprisionamento, dissolução e efeitos do Sino.
  - Confirmar vínculo com Barnabé, Tipora e o sino.
  - O especial Todo Mundo Vai Morrer deve representar o horror/escala da criatura.
  - Conferir animação irregular/assimétrica do corpo e tentáculos sem atravessar o chão.
  - Testar agarrão, dissolução, colisão e leitura em cenários escuros.

- [x] **3.27 A Magistrada (`src/characters/magistrada.js`):** feito (2026-10-31), conferido com a wiki "A Magistrada".
  Máscaras (Chamar as Máscaras), Dimensão das Sombras/Onipresença (teleporte), Mão das Sombras (golpe da bengala),
  Controle Mental (anda até ela, sem defesa; o "resistir apertando botões" ficou só no Comandar do Estrangeiro), Levitação (Conjuração Verdadeira), Prisão das Sombras (especial) e Reescrever a Realidade (a "forma"
  Saber Tudo é Perder Tudo já tinha saído por ser invenção) batem com o cânone. Ajustes: OLHAR DO DESESPERO agora
  segue a wiki — paralisa e deixa ESMORECIDO (−20% por 4 s); quem está DEFENDENDO resiste e só fica esmorecido
  (testado). DISPERSÃO DE DANO: no cânone protege os ALIADOS — na batalha em equipe a aura (metade do dano) fica com
  quem entrar em campo, porque os buffs passam na troca; descrição corrigida.
  - Confirmar uso das máscaras e controle coerente.
  - Diferenciar Dimensão das Sombras, Mão das Sombras e controle mental.
  - Verificar Dispersão de Dano (quem recebe, limite e contrajogo).
  - Conferir forma Saber Tudo é Perder Tudo sem ser mero buff de atributos.
  - Testar controle de alvo, absorção/redistribuição de dano e reset de round.

- [x] **3.28 Kian (`src/characters/kian.js`; forma `forms/kian_calamidade.js`):** auditado em 2026-11-01 (wiki "Kian" + `docs/AUDITORIA-KIAN-JOUI.md`): Inexistir, Teletransporte, Toque da Morte, Rejeitar Névoa, Levitação e Lâmina do Medo batem; a forma Realizador da Calamidade tem as versões de Calamidade. Sem mudanças.
  - Reaproveitar `docs/AUDITORIA-KIAN-JOUI.md` e conferir poderes por fase.
  - Rejeitar Névoa com utilidade ampla contra efeitos compatíveis sem anular tudo.
  - Distinguir teletransporte, levitação, combate físico e rituais.
  - Forma Realizador da Calamidade com kit e presença visual coerentes.
  - Testar contra Kaiser e personagens sem névoa para balanceamento consistente.

- [x] **3.29 Raziel (`src/characters/raziel.js`; forma `forms/raziel_verdadeiro.js`):** feito pelo plano RZ-01 a RZ-09 (v3.46.0).
  - Seguir o plano RZ-01 a RZ-09: Turno Extra, Sede Incontrolável, Banquete Bestial diferenciado, investida de garras no lugar de projétil ou licença documentada, Endurecer Sangue com crosta visual, e kit bestial exclusivo.
  - Testes com CPU, jogador, alvos críticos, esquiva e finalizadores.

- [~] **3.30 Revisão final cruzada — Formas, elementos e documentação:** 2026-11-01: registro de formas conferido por script — as 20 formas estão em `FORMS`, nenhuma `awakening.form` sem registro e nenhum arquivo de forma solto. Falta a classificação de cada forma e a revisão de elementos.
  - Comparar `src/characters/forms/index.js` com `src/characters/index.js`; garantir registro de todas as formas sem aliases confusos.
  - Classificar cada forma: transformação temporária, estado narrativo, chefe, entidade separada ou skin.
  - Conferir `element` e `energyColor` contra fontes canônicas (cor não comprova elemento).
  - Verificar correspondência exata em `HABILIDADES.md` (nomes, efeitos, custos e durações).
  - Revisão visual dos modelos, armas, roupas, poses e silhueta.
  - Executar testes e atualizar `CHANGELOG-ADMIN.md`, `TODO.md` e versões.

---

#### 4. Regras para preservar a qualidade do jogo
- **Fidelidade não é cópia literal:** uma ação de turno do RPG pode virar uma janela de cancelamento ou uma ação contextual, desde que a intenção original seja preservada e a adaptação esteja documentada.
- **Não criar imunidades a partir de uma única cena:** resistir, continuar lutando ou avançar não significa ser imune.
- **Não transformar todo poder em dano:** rituais, controle, defesa, mobilidade, pressão, suporte e condição contextual devem continuar diferentes.
- **Transformação importante exige identidade própria:** novos golpes, regras de uso, animações e/ou interação; não só dano/velocidade/vida.
- **Oponentes vulneráveis não são necessariamente alvos em KO:** qualquer devoração contextual deve ser executada antes do estado terminal e respeitar o fluxo de combate.
- **Não alterar o balanceamento global nesta etapa:** primeiro implementar as lacunas canônicas aprovadas; depois medir dano, duração e taxa de vitória.
- **Não remover o que já funciona sem substituição aprovada.** Se uma habilidade for uma licença de gameplay, pode permanecer, desde que seja identificada como adaptação.
- **O jogador decide o que vira escopo:** propostas de novas habilidades, interações de equipe e especiais canônicos precisam de aprovação antes de implementação.

#### 5. Referências e fontes
- [Raziel — Ordem Paranormal Wiki](https://ordemparanormal.fandom.com/wiki/Raziel)
- [Vampiros — Ordem Paranormal Wiki](https://ordemparanormal.fandom.com/wiki/Vampiros)
- [Monstruosos — Ordem Paranormal Wiki](https://ordemparanormal.fandom.com/wiki/Monstruosos)
- [Sobrevivendo ao Horror — Ordem Paranormal Wiki](https://ordemparanormal.fandom.com/wiki/Ordem_Paranormal_RPG%3A_Sobrevivendo_ao_Horror)
- [Hexatombe, episódio 7 — "Consequências" (canal oficial)](https://www.youtube.com/watch?v=K_c2VdmPuLg)
- [Hexatombe, episódio 8 — "Culpa" (canal oficial)](https://www.youtube.com/watch?v=-7prXUHT8OM)
- [Hexatombe, episódio 9 — "Banho de Sangue" (canal oficial)](https://www.youtube.com/watch?v=p5alZam12ss)
- [Site oficial de Ordem Paranormal](https://ordemparanormal.com.br/)

**Ordem de execução sugerida:** RZ-01 e RZ-02 → RZ-03 → RZ-04 e RZ-05 → RZ-06 e RZ-07 → testes RZ-09 → auditoria individual do elenco nos grupos prioritários.

---

## 3. Novo modo PvE — dungeons e chefes

> **EM PRODUÇÃO (2026-11-05).** Ficou em espera de 2026-11-01 a 2026-11-05. O plano de produção da primeira fase jogável
> está na seção 3.4.

### 3.0. Ideias do dono (2026-11-01)

- **Dungeons com chefes:** você derrota os minions antes do chefe.
- **Cada chefe bem diferente do outro**, com mecânica própria e um jeito próprio de ser derrotado.
- **A cada chefe derrotado, o personagem sobe um pouco de nível.**
- **Se morrer, reinicia**, e a próxima dungeon que vem é aleatória.
- **Melhorias por personagem:** cada lutador evolui separado, então você tem que ir upando cada um.
- **Solo ou cooperativo.**

### 3.1. Conceito do modo

O modo PvE será uma experiência de progressão baseada em dungeons, exploração, combate contra inimigos e confrontos contra chefes inspirados nas criaturas do Outro Lado.

O jogador poderá iniciar uma campanha, escolher um personagem disponível e avançar por diferentes dungeons. Cada dungeon terá uma identidade própria, com cenário, ambientação, desafios e um chefe principal.

A experiência deverá ter uma progressão inspirada em jogos como *Vampire Survivors*: durante uma tentativa, o jogador conquista melhorias temporárias e desenvolve uma combinação de poderes. Ao morrer, perde essa evolução temporária, mas mantém parte do progresso permanente conquistado.

O objetivo é incentivar o jogador a aprender os padrões dos chefes, experimentar combinações de habilidades e tentar avançar cada vez mais longe.

### 3.2. Formas de jogar

O modo deverá ser planejado para funcionar em três formatos:

- **Solo:** um jogador enfrenta a dungeon e seus desafios.
- **Cooperativo local:** dois jogadores enfrentam os inimigos e o chefe juntos.
- **Cooperativo online:** jogadores em uma mesma sessão compartilham a experiência de explorar e derrotar os chefes.

No PvE cooperativo, os jogadores lutarão contra os desafios da dungeon. Não deverá ser utilizado o formato tradicional de batalha em equipe do jogo de luta atual como estrutura obrigatória desse modo.

O cooperativo deverá ter regras próprias para inimigos, chefes, recompensas, progressão e sincronização. A implementação online precisa ser analisada com cuidado, pois o multiplayer de luta existente não garante, por si só, que já exista suporte para sincronizar uma dungeon inteira.

### 3.3. Seleção de personagens

Os jogadores poderão utilizar os personagens jogáveis disponíveis no jogo, respeitando as restrições específicas de cada dungeon.

Criaturas do Outro Lado que forem utilizadas como chefes não deverão poder ser selecionadas pelos jogadores naquela dungeon enquanto isso permitiria escolher o próprio chefe ou quebrar a proposta do confronto.

Essa restrição deverá ser definida por dungeon, evitando uma proibição global desnecessária de personagens que não sejam chefes naquele conteúdo.

### 3.4. Plano de produção da primeira fase jogável (2026-11-05)

Escrito antes de produzir, depois de ler as seções 3 a 13 e a página "O Espreitador" da wiki. As escolhas que não vêm
do documento nem do cânone estão marcadas como **PROPOSTA**.

#### O que o cânone dá (wiki "O Espreitador")

- **Aparência:** criatura de Medo, pele cinza enrugada; MUITOS OLHOS amarelos cujas pupilas se multiplicam; lágrimas;
  um OLHO GRANDE dentro da boca; dentes tortos; pernas curtas; braços e dedos longos.
- **Comportamento e habilidades:** Pancada (braços longos se debatendo, fracos); Drenar Energia (o contato visual drena
  quem está no campo de visão dele; desviar o olhar ou quebrar a linha de visão escapa); Correr pelas Frestas (vai de
  um armário/fresta a outro); Cópia Observada (gera os Devorados, cópias cinzentas de quem ele observa, com olhos
  amarelos e lágrimas); Fortalecer (segura a cabeça de um Devorado e o deixa mais forte).
- **Enigma de Medo (a fraqueza):** bloquear ou fechar a fresta dele; sem ter para onde voltar, ele fica indefeso,
  tremendo e tentando fugir. Morreu com um tiro do Kaiser no olho da boca.
- **Ambiente:** a Mansão Endiabrada, armários e frestas, o relógio das 2:11, o som de goteira.

#### Arquitetura (reuso, sem mexer nas lutas tradicionais)

- **`src/pve/Dungeon.js`** faz o papel da `Match` (mesma interface: `update`, `render`, `dispose`, `fighters`,
  `phase`). Usa o `World` de sempre com DOIS lutadores: o jogador e o "inimigo da vez".
- **O inimigo da vez** é um `Fighter` de verdade (golpes, defesa, projéteis, habilidades e a CPU funcionam sem
  adaptação). Primeiro um Devorado (a cópia do lutador do jogador), depois o Espreitador. A troca usa `applyDef`, o
  mesmo caminho da troca de personagem da equipe.
- **Entre um encontro e outro** o inimigo fica escondido e parado na próxima sala (`lurking`: invisível, sem CPU e sem
  travar a mira do jogador).
- **Os Devorados extras** são NPCs (`DanteClone` com o modelo do jogador repintado). Os golpes e tiros do jogador já
  acertam NPCs.
- **Câmera de exploração:** o `World` aceita um foco próprio (`cameraFocus`). Nos corredores, a câmera enquadra o
  jogador e um ponto à frente no sentido do mapa; nos encontros, volta a enquadrar os dois.
- **Arquivos novos:**
  - `src/pve/dungeons.js`: cadastro de dungeons (mapa, chefe, salas, restrições, drops, sorteio da próxima);
  - `src/pve/save.js`: salvamento separado em `veu_pve_v1`, com perfil, campanha e tentativa;
  - `src/pve/upgrades.js`: melhorias temporárias, sinergias e árvore permanente;
  - `src/pve/espreitador.js`: a IA própria do chefe por cima do lutador;
  - `src/pve/pickups.js`: cura e recompensa;
  - `src/pve/pveHud.js`: a camada de HUD do modo;
  - `src/ui/pveScreens.js`: menus;
  - `src/characters/espreitador.js`: a definição do chefe, fora do elenco;
  - `tools/blender/arena_mansao.py`: o mapa;
  - `tools/blender/char_espreitador.py`: o modelo.

#### A primeira dungeon: "Território do Espreitador" (Mansão Endiabrada)

**Mapa próprio** (`arena_mansao.py`), em linha para a câmera ficar legível:

1. **Hall de entrada:** onde o jogador nasce. O relógio parado nas 2:11.
2. **Corredor estreito** com armários nas paredes.
3. **Sala de estar:** 1º encontro, 2 Devorados.
4. **Corredor 2:** o Espreitador aparece numa fresta e drena quem olha para ele. É a etapa "perseguição e domínio do
   território", que ensina a mecânica sem prender o jogador.
5. **Biblioteca:** 2º encontro, 3 Devorados.
6. **Quarto principal**, a sala do chefe, com 4 ARMÁRIOS.
7. **Porta de saída**, trancada até a vitória.

Detalhes do mapa:

- Cada porta entre salas fica bloqueada (névoa escura) enquanto o encontro da sala não acaba.
- O som de goteira acompanha a fase.
- Pouca luz: lampiões que piscam.

**Etapas do confronto com o chefe (§5.3):**

- **Ataques:**
  - Pancada: o combo de garras, fraco e longo;
  - Drenar Energia: o olhar. Avisa antes, drena a Sanidade de quem está no cone dele E olhando para ele, e escapa quem
    vira de costas ou se esconde atrás de algo;
  - Correr pelas Frestas: some num armário aberto e sai de outro, com um bote;
  - Cópia Observada: 2 Devorados;
  - Fortalecer: para, segura a cabeça de um Devorado e o fortalece. É a janela para bater nele.
- **Enigma de Medo** (**PROPOSTA** de controle, fiel à fraqueza do cânone):
  - um armário ABERTO tem a fresta com olhos; um golpe ou um tiro nele FECHA e TRANCA a porta, que reabre sozinha
    depois de um tempo;
  - quando o Espreitador tenta fugir e não há fresta aberta, ele fica APAVORADO (tremendo, lento, toma muito mais dano
    e mostra o olho da boca);
  - tiros no APAVORADO contam como o tiro no olho e dão dano extra.

#### Progressão (§6–§7), escopo da 1ª versão

- **Experiência na tentativa:**
  - Devorado: 25 (o NPC, 12);
  - chefe: 120, pela recompensa física que cai onde ele morreu e é coletada indo até lá.
- **Níveis:** o jogo pausa e oferece **3 melhorias sorteadas** entre 10 (vida máxima, dano físico, dano de
  habilidades, defesa, custo de Sanidade, regeneração de Sanidade, roubo de vida, cura ao derrotar, esquiva extra,
  velocidade).
- **Sinergias**, legíveis no HUD:
  - Fúria + Foco → +10% de dano das habilidades;
  - Couraça + Vigor → regeneração lenta de vida;
  - Sanguessuga + Fúria → o roubo de vida dobra no físico.
- **Drops de cura** configuráveis por dungeon: `drops.heal.chance` e `amount`, 45% e 20% da vida.
- **Ao derrotar o chefe:**
  - o personagem sobe 1 NÍVEL PERMANENTE (ideia do dono, §3.0) e ganha 1 PONTO PERMANENTE;
  - os pontos são POR PERSONAGEM ("cada lutador evolui separado") e vão na árvore permanente: Vida, Dano, Defesa e
    Sanidade, 5 graus cada, 1 ponto por grau.
- **Morte:**
  - perde níveis, experiência e melhorias da tentativa, e a tentativa acaba;
  - a campanha e os pontos ficam;
  - a próxima dungeon sai do sorteio, sem repetir a anterior quando houver mais de uma.
- **Sequência:** com uma dungeon só, a saída leva de novo ao Território do Espreitador numa PROFUNDIDADE maior
  (inimigos +12% de vida e dano por nível de profundidade), mantendo as melhorias. O cadastro já sorteia entre as
  dungeons válidas quando houver mais.

#### Salvamento (§8)

- Chave própria `veu_pve_v1`, em `localStorage`, como o resto do jogo; IndexedDB fica para quando o volume pedir.
- Três partes:
  - **perfil:** os pontos e a árvore de cada personagem;
  - **campanha:** profundidade máxima, chefes derrotados, mortes;
  - **tentativa:** personagem, profundidade, nível, experiência, melhorias e dificuldade, salva no começo de cada
    dungeon.
- Menu do Outro Lado:
  - CONTINUAR, se houver tentativa;
  - NOVA TENTATIVA, que pede confirmação se apagar uma;
  - MELHORIAS PERMANENTES;
  - APAGAR DADOS DO OUTRO LADO, com confirmação, sem tocar nas opções nem nos recordes da Torre.
- Exportar e importar backup: FEITO (hub → BACKUP), com a cópia automática e o save quebrado guardado à parte.

#### Transição (§9)

- Ao derrotar o chefe, a porta destranca com luz e aviso.
- Ao atravessá-la, a câmera vai para trás do personagem, que anda pelo corredor escuro.
- A tela escurece, a próxima dungeon carrega por trás e o controle volta.
- Se o carregamento falhar, volta ao menu do modo com a tentativa salva.

#### Interface (§10)

- **Vida do jogador:** canto inferior esquerdo.
- **Chefe:** nome e barra no centro superior. Os Devorados usam a mesma barra, menor.
- **Faixa do modo:** nível e barra de experiência, as melhorias com as sinergias, o objetivo atual ("Derrote os
  Devorados", "Tranque as frestas") e os avisos de cura, saída liberada e próxima dungeon.

#### Fora desta versão (próximas etapas)

- Cooperativo local e online (Etapas 6–7).
- ~~Exportar e importar backup.~~ (feito: hub → BACKUP)
- O Espreitador jogável.
- Mais dungeons, que liberam o sorteio de verdade.
- Dificuldade por opção no menu do modo: começa com Fácil, Normal e Difícil, que mudam a CPU e os multiplicadores do
  chefe.

#### Ordem de produção

1. Cadastro, salvamento e melhorias, com testes `node --test`.
2. Mapa da mansão no Blender.
3. Dungeon, encontros e drops.
4. O chefe e o Enigma de Medo.
5. HUD.
6. Menus e fluxo.
7. Modelo do Espreitador.
8. Testes jogando, notas de feedback (`docs/outro-lado-playtest.md`) e ajustes.
9. Release.

**Feito na v4.25.0 (2026-11-05):** os 9 passos. A rodada 1 de playtest, com os problemas achados e o que mudou, está em `docs/outro-lado-playtest.md`.

**Feito na v4.26.0 (2026-11-05), rodada 2 pelo feedback do dono:**
- [x] Câmera em 3ª pessoa fixa.
- [x] Espreitador não humanoide, refeito do zero.
- [x] Clones mais fortes.
- [x] Cronômetro de speedrun.
- [x] Olhos amarelos onde ele vai sair.
- [x] HUD de melhorias no estilo Vampire Survivors.
- [x] Personagens bloqueados, comprados com moedas dos baús.
- [x] Cutscene de entrada do chefe.
- [x] Vibe de terror (referência: Doors).

Detalhes em `docs/outro-lado-playtest.md` (rodada 2).

**Feito na v4.27.0 (2026-11-05), rodada 3 pelo feedback do dono:**
- [x] Câmera que não atravessa as paredes.
- [x] Câmera livre (mouse e analógico direito) e mira pela câmera.
- [x] Sem troca de personagem: o time só como assistência.
- [x] Olhos em frestas que mudam de lugar.
- [x] Setas: azul para o baú (opcional), amarelas para as portas.
- [x] Clones do jogador e das assistências.
- [x] Espreitador mais fiel ao cânone (modelo e habilidades).
- [x] Sem dungeon nova: volta à primeira numa dificuldade maior.
- [x] Número de salas variável e caminhos com escolha (esquerda, frente, direita), salas de 2 a 4 monstros, chefe único no fim.
- [x] A escada do hall leva ao 2º andar.
- [x] Portas que abrem e fecham entre as salas.

Detalhes em `docs/outro-lado-playtest.md` (rodada 3).

**Feito na v4.28.0 (2026-11-06), rodada 4 pelos pedidos do dono:**
- [x] Câmera trava num inimigo (troca com movimento rápido; F / botão do meio / R3).
- [x] Câmera não atravessa as paredes (plano próximo 0,12).
- [x] Monstros misturados: cópias do jogador e das assistências.
- [x] Salas sem nome nem número de monstros.
- [x] Teclado + mouse simplificado (1–5, Z, G, Q/R).
- [x] Setas flutuantes, não no chão.
- [x] Luz/cegueira atordoa em área (modo de luta e Outro Lado).
- [x] Botão de interagir (E / B) para portas, baús e gavetas.
- [x] Gavetas com chave, moedas ou nada; portas com cadeado; salas escondidas (baús ou monstros com baú de sorte).
- [x] Escada do hall subida andando, com a porta no patamar (entrar ou descer).

Detalhes em `docs/outro-lado-playtest.md` (rodada 4).

**Feito na v4.29.0 (2026-11-06), rodada 5 pelos pedidos do dono:**
- [x] Tecla da sanidade: C (segurar), mostrada na barra.
- [x] Câmera melhor nas paredes e cantos (desliza, aproxima, translúcido).
- [x] Entrada LOCAL x ONLINE; no local, SOLO x MULTIPLAYER.
- [x] Coop local em tela dividida em cima e embaixo, câmera própria para cada jogador.
- [x] Salas online do Outro Lado: criar, entrar por código, lista (etapa 1).
- [x] Expedição online sincronizada (cada um no próprio monitor) — v4.30.0.

Detalhes em `docs/outro-lado-playtest.md` (rodada 5).

**Feito na v4.30.0 (2026-11-06), rodada 6:**
- [x] Expedição online sincronizada: P1 e P2 jogam em computadores diferentes.
- [x] Voltar à vida com moedas (sozinho ou coop): quem paga traz todos de volta com metade da vida; o custo sobe com a profundidade e a cada resgate na mesma dungeon.
- [x] Desistir ou não ter moedas suficientes encerra a tentativa normalmente.

Detalhes em `docs/outro-lado-playtest.md` (rodada 6).

**Feito na v4.31.0 (2026-11-06), rodada 7 — salvamento e falhas:**
- [x] Backup do Outro Lado: exportar (baixa um .json) e importar (escolher o arquivo; mostra o resumo e pede confirmação).
- [x] Cópia automática: o save de antes da última gravação; se o principal quebrar, o jogo volta para ela e avisa. O save quebrado fica guardado à parte.
- [x] Se a dungeon não montar, volta ao menu do modo com a tentativa salva (online: fecha a sala para os dois).
- [x] Online: a dungeon já montada esperando o outro é desmontada se a conexão cair.

Detalhes em `docs/outro-lado-playtest.md` (rodada 7).

**Feito na v4.31.0 (2026-11-06), rodada 8 — a 2ª dungeon (Escola Nostradamus) e a economia:**
- [x] **Território da Degolificada** (profundidade 2+): a Escola Nostradamus (corredor, salas de aula, laboratório,
      arquivos, biblioteca com a PASSAGEM SECRETA para o BUNKER). Salas de luta com Zumbis de Sangue.
- [x] **A Degolificada de Gabriel** (Iniciação; NÃO a de Desconjuração): flutua a meia distância e luta só com os
      CABELOS — investida de cabelo (linha no chão), agarrar e arremessar na parede (até dois), cabelo rastejante,
      cabelo por cima, defesa de cabelo, Grito Rasgado e a metamorfose Devoradora. Sem corpo a corpo.
- [x] **Escudo de Medo = segunda vida** (barra azul em terços por cima da vida amarela). Ela arremessa as CAIXAS do
      bunker com o cabelo; ao quebrar, de uma delas pode sair uma das 3 PROVAS (cartão SD, ficha do Gabriel, foto com a
      Lina — nas caixas: PROPOSTA). Cada prova tira um terço; sem escudo ela apanha. Fogo azul ao cair.
- [x] **Barra azul do Escudo de Medo aparecia no jogador** (relato do dono, 2026-11-06) — no COOP os dois painéis da HUD
      são dos jogadores e o escudo era desenhado no painel 2 (a vida do P2). Agora `pveHud.setShield` recebe a chefe e
      desenha o escudo na barra dela: no solo, a barra de chefe do alto; no coop, a barra do inimigo (`.pv-enemy`).
      Conferido no navegador (solo e coop). A luta começa com as 3 partes azuis; cada prova tira uma; sem escudo ela cai.
- [x] Barris e caixas quebráveis nas salas; moedas, experiência e cura vêm de gavetas, barris, caixas e monstros.
- [x] Baús no estilo Vampire Survivors: animação (treme, luz pela fresta, estouro de luz, facho), 1 a 3 itens (1 comum,
      3 raro) que sobem melhorias que você já escolheu; sem nenhuma para subir, moedas.
- [x] **Habilidades do baú, limite por tentativa e moedas OU vida** (pedido do dono, 2026-11-06, ainda não lançado):
      - 4 HABILIDADES NOVAS que só saem do BAÚ (nunca nas cartas de nível; marcadas "NOVA DO BAÚ!"): Pulso de Medo (onda
        a cada 4,5 s que machuca quem está a 3 m), Pele de Espinhos (devolve 15/25/35% do dano corpo a corpo),
        Golpe Certeiro (10/16/22% de chance de dano dobrado) e Segundo Fôlego (uma vez por tentativa, o golpe que ia
        derrubar deixa com 30%). `chest: true` em `pve/upgrades.js`; efeitos em `Dungeon.modsFor`, no laço e em
        `combat/damage.js` (`pveMods.crit` e o gancho novo `pveMods.onTaken`).
      - LIMITE de 6 habilidades diferentes por tentativa (`MAX_KINDS`; a HUD mostra "habilidades n/6"): cheio, as cartas
        e os baús só sobem as que você já tem, até o máximo.
      - Tudo no máximo: o baú (e a carta de nível) abre a escolha MOEDAS ou VIDA — o jogador escolhe (no coop, a vez
        alterna como nas cartas; a vida vai para os dois).
      - PROPOSTA: as 4 habilidades, os números e o limite 6. Testes em `tests/pve.test.js`.
- [x] **Moedas: compartilhadas no coop local, separadas no online** (pedido do dono, 2026-11-06) — já era assim: no coop
      local as moedas vão para a mesma carteira do save (os dois compram os personagens com ela); no online cada jogador
      tem a sua (`net.coins[slot]`) e só a dele é gravada no save dele. Conferido no código (`pve/flow.js`).
- [x] **Barra de vida do chefe nas DUAS metades da tela dividida** (pedido do dono, 2026-11-06): no coop local a barra
      do inimigo (`.pv-enemy`) aparece em cima e na metade de baixo (`.pv-enemy.low`); o Escudo de Medo vai nas duas.
- [x] Melhorias permanentes compráveis com moedas (45 + 30 por grau: PROPOSTA).
- [x] HUD do modo minimalista (Inter, vidro escuro, avisos de interagir sem caixa); nome dos golpes das criaturas
      pequeno no canto.
- [x] Tentáculos do Lodo (Dante/Nubi) com o tentáculo do Amigo Imaginário.
- [x] **Polimento da Degolificada** (2026-11-07): `char_degolificada.py` — o rosto preso na superfície (raio na malha),
      a FITA EM X sobre a boca costurada e a BOCA GRANDE escondida (gengiva e dentes); os ALUNOS PRESOS no cabelo
      (5 braços com mãos, uma cabeça meio engolida, mangas de camisa e sangue; PROPOSTA a disposição). Despertar
      (Devoradora): a fita some, a boca e os alunos aparecem e ela cresce 20% (`sp.grow` novo no `awakenMode`); o
      Grito rasga a fita por um instante. No chefe da Escola, `becomeDevourer` faz o mesmo (escala 1.15).
      Armários: os ESCANINHOS do corredor e do laboratório viraram armários de aço de verdade, cuja porta gira na
      dobradiça e mostra o achado (chave, moedas, cura) — `Drawer` com `spot.locker`.
- [ ] Texturas da Escola (o que sobrou do polimento da Degolificada): paredes, piso e armários com textura em vez de
      cor lisa (`arena_escola.py`).
- [x] **Pupilas em 8 do Espreitador** (2026-11-07; wiki: "pupilas que se multiplicam com o passar do tempo" e "o olho
      de duas pupilas" na fresta): `char_espreitador.py` — as pupilas duplas nascem COLADAS uma em cima da outra (um 8;
      um terço dos olhos já tem, alguns viram um 3 em fila) e o olho da boca tem as duas. As que faltam formam a peça
      `prop_morePupils`, escondida (`addEspreitadorProps`) até se multiplicarem: na transformação Pupilas que se
      Multiplicam (até o fim do round) e no Fortalecer sem Devorado. Corrigido junto: as pupilas ficavam ENTERRADAS na
      íris e não apareciam; agora saem dela, sem contorno (`fine_`). Os olhos de aviso da fresta (`pve/espreitador.js`)
      também têm o 8. PROPOSTA: proporção e tamanho. Falas do Espreitador sem o "caído" errado ("a guitarra caído").
- [x] **Travamento ao lutar no Outro Lado** (relato do dono, 2026-11-06: "quando começo a lutar contra os personagens,
      parece que sobrecarrega e trava"). Duas causas medidas: (1) o barril/caixa (`pve/breakables.js`) não tinha
      `hitTest`; o 1º projétil numa sala com barril lançava erro no `World.update`, e como o erro saía do `tick()` o
      `requestAnimationFrame` seguinte não era pedido e o jogo CONGELAVA de vez (Arthur, Kaiser, Erin, Agatha, Balu,
      Carina, Rubens, Veríssimo…); (2) os efeitos de golpe criam e descartam o próprio material, e o three.js apagava o
      shader junto: cada golpe recompilava (picos de 60–420 ms no render). Correções: `hitTest` no Breakable, laço do
      jogo que registra o erro e continua (`main.js`), shaders fixos (`core/programPin.js`). Testes de regressão em
      `tests/pve.test.js` e `tests/program-pin.test.js`.
- [x] **Travou no meio da partida — de novo** (relato do dono, 2026-11-07: Guizo na Mansão, quarto infantil, contra
      Devorados; "isso é recorrente"). Medido no navegador:
      (1) **vazamento de memória de vídeo**: as cópias (Devorados menores, Cópia Observada, Embaralhar, hologramas,
      plateia do Anfitrião) só liberavam os materiais; as peças procedurais de cada `buildModel` (arma, acessórios,
      ~20–26 geometrias por cópia) ficavam na placa — com o Guizo, +200 geometrias por sala, sem parar. Agora
      `disposeClonedRig` (`models/glbRig.js`) em `npcs.js`, `holo.js` e `hostAbilities.js`: a contagem fica estável
      sala após sala (2480 ± 50 em 8 salas; antes 2328 → 3400);
      (2) **erro repetido a cada quadro congelava a imagem**: desde a v4.31.2 o laço continuava, mas o mesmo erro
      interrompia o quadro antes do desenho. Agora o `World.update` isola cada efeito, NPC, lutador e projétil (o que
      quebra sai do jogo / o golpe é cancelado, com o erro no console uma vez), o desenho roda fora do `try` da lógica
      (`main.js`) e a interação do Outro Lado também é isolada. Conferido injetando erros de propósito: o mundo
      continua. A exceção exata do relato NÃO foi reproduzida (bateria, varredura das salas e fuzz de habilidades do
      Guizo sem erro) — se voltar a travar, o console agora mostra "Erro isolado (…)" com o ponto. Teste novo em
      `tests/glb-rig.test.js`.
- [ ] **Personagens no Outro Lado — conferir e equilibrar TODOS** (pedido do dono, 2026-11-06): bateria automática
      (cada lutador sozinho, CPU Difícil no lugar do jogador, 2 salas de 3 monstros + o chefe) para achar quem quebra,
      quem não consegue limpar sala ou não acerta o chefe, e ajustar o kit no modo (sem mexer no balanceamento da luta).
      **1ª rodada (2026-11-06, 1 amostra cada, ruído alto):** os 39 permitidos FUNCIONAM — nenhum erro depois da
      correção do `hitTest`. Salas de 3 monstros limpas em 21–60 s; o chefe cai em 66–121 s. Mais fracos no modo:
      **Deus da Morte** (sala não limpa em 60 s; chefe ficou com 45%), **Anfitrião** (chefe 36%), **Morato** (não limpou
      nenhuma das duas salas), **Amália** (idem), Dalmo/Magistrada/Arnaldo/Rubens (chefe 16–24%), Kaiser/Gaius/Chico
      (chefe a 2–11%). Muito dano recebido: Celestine (115% numa sala), Balu, Dante, Kemi, Xande (~80%). Próximo: 3
      amostras dos que ficaram para trás antes de mexer (só no modo: multiplicador por personagem no Outro Lado).
      **Feito (2026-11-06):** 9 amostras sem ajuste dos atrasados → `PVE_CHAR_TUNE` em `pve/dungeons.js` (só no modo;
      aplicado em `Dungeon.modsFor`): Anfitrião dano ×1,5; Morato ×1,5 e recebe ×0,85; Amália ×1,45 / ×0,75; Kaiser ×1,3;
      Kemi e Magistrada ×1,2 / ×0,85; Deus da Morte ×1,2; Rubens ×1,15 / ×0,8; Celestine recebe ×0,85; Chico ×0,9
      (PROPOSTA). Depois: todos limpam 3/3 salas (40–60 s) e derrubam o chefe (78–123 s). A bateria virou ferramenta
      de dev: `src/dev/pveBattery.js` (instruções no topo). Falta: o Anfitrião ainda deixou o chefe vivo 1 de 3 vezes
      em 180 s — conferir jogando.
- [x] **Chamas de Energia saindo da barra de vida do Anfitrião** (pedido do dono, 2026-11-06): `.hb-energy .fill::before/
      ::after` em `styles.css` — roxo, rosa e ciano, só sobre a vida que resta.
- [x] **A equipe Outro Lado não entra no modo Outro Lado** (pedido do dono, 2026-11-06): Estrangeiro, Amigo Imaginário,
      Carniçal (e quem tiver a equipe 'Outro Lado') aparecem bloqueados na escolha ("é da equipe Outro Lado: não entra
      neste modo") e saíram da loja de desbloqueio (`pveBanned` em `pve/unlocks.js`).

## OS CHEFES E OS CENÁRIOS DO OUTRO LADO NO MODO DE LUTA (pedido do dono, 2026-11-06)

- [x] **A Degolificada e o Espreitador como personagens jogáveis no modo de luta** — feito em 2026-11-06 (ainda não
      lançado). Fichas novas `src/characters/degolificada.js` e `src/characters/espreitador.js` (equipe Outro Lado, fora
      do modo Outro Lado pelo `pveBanned`); os chefes da dungeon (`characters/bosses/*.js`) agora DERIVAM delas, sem o kit,
      com a vida e os números de antes (o Escudo de Medo e as provas continuam só na dungeon).
      - Degolificada (Medo): □ Investida de cabelo (puxa), △ + ○ Agarrar e Estrangular (puxa e joga longe), △ + □ Cabelo
        rastejante, △ + × Cabelo por cima, △ + L2 Defesa de cabelo, R2 + △ Grito Rasgado; especial Desfiguramento
        Capilar; transformação Devoradora. PROPOSTA: os botões, os números e a cena do especial.
      - Espreitador (Conhecimento): □ Dedos longos (puxa), △ + ○ Drenar Energia (só pega quem está OLHANDO para ele;
        rouba Sanidade), △ + × Correr pelas Frestas, R2 + × Cópia Observada (2 Devorados: cópias cinzentas do
        adversário), △ + L2 Fortalecer; especial O Olho da Boca e transformação Pupilas que se Multiplicam (PROPOSTA).
      - Extensões reaproveitáveis: `inkTentacles` (alwaysThrow, tentColor, element, caughtLabel), `bellToll` (scream),
        `fearGaze` (lookArc, drain, damage), `shadowClones` (copyOpponent), `lodoTentacles` (caughtLabel).
      - Falas de introdução e de vitória contra todo o elenco, agarrão próprio, retratos (`public/sobre/elenco`),
        modelos sem `lazy`; teste novo em `tests/pve.test.js`.
      - Balanceamento (rodada focada, 86 lutas cada, Ruínas): a Degolificada sem ajuste ganhava 8% (herda os golpes do
        Amigo sem os 1800 de vida nem o roubo de vida); com 1.3/0.82 → 33%; o Espreitador com 1.1/0.93 → 34%. Subidos
        para 1.36/0.79 e 1.17/0.89 (`config/balance.js`) — falta medir de novo.
- [x] **Remodelação completa do Carniçal** (pedido do dono, 2026-11-06; feita numa sessão separada, ainda não lançada):
      `tools/blender/char_carnical.py` → `public/models/carnical.glb` — membros secos, costelas e barriga funda, pés com
      garras, Lodo escorrendo e fios de Lodo no lugar do bloco da boca. Conferido em 4 vistas e numa luta Carniçal × Dante
      em Tipora, sem erros. Retrato da página Sobre (`public/sobre/elenco/carnical.webp`) refeito com o modelo novo.
- [x] **Mansão Endiabrada como arena única de luta** (2026-11-06, ainda não lançada): `MANSAO_LUTA` em
      `arena/configs.js` — o QUARTO PRINCIPAL do mapa da dungeon (mesmo `.glb`), a luta presa na sala, a câmera não sai
      dela, só as luzes de dentro (sem o pool) e névoa mais leve. Id `mansao_luta` em `ARENAS`/`ARENA_ORDER`. O cache do
      `.glb` passou a ser por arquivo (`glbArena.js`), então a arena e o mapa do PvE dividem o mesmo download.
      PROPOSTA: a escolha da sala, a névoa e os nascimentos.
- [x] **Escola Nostradamus como arena única de luta** (idem): `ESCOLA_LUTA` — o BUNKER escondido (o círculo do ritual
      e as velas), id `escola_luta`.
- [x] **Kits do cânone refeitos para a Degolificada e o Espreitador** (pedido do dono, 2026-11-06, ainda não lançado:
      "se perdeu ao fazer o personagem… a versão de boss tava bom… espalhar armários/frestas no mapa e se teleportar
      por elas… precisam de especiais"). Tipos novos em `src/combat/outroLadoAbilities.js`, todos com cabelo ou frestas,
      sem herdar golpes do Amigo ou do Joui. PROPOSTA: botões, números e as cenas dos especiais.
      - Degolificada: □ Chicote de cabelo (`hairLash`), △ + ○ Agarrar e Estrangular (`hairGrab`), △ + □ Cabelo
        rastejante (`hairCrawl`), △ + × Cabelo por cima (`hairRain`, 4 pontos), △ + L2 Defesa de cabelo (`hairGuard`,
        casulo que corta o dano e empurra), R2 + △ Grito Rasgado (`hairScream`, atordoa e ensurdece), R2 + × Arremessar
        (`hairToss`, ergue um caixote com o cabelo e joga). Especial **Estrangulamento Capilar** (`hairStrangle`):
        agarra, ergue, estrangula 3 vezes, bate no chão e joga na parede.
      - Espreitador: △ + ○ Drenar Energia, △ + □ **Abrir Fresta** (`openFresta`: um armário sobe do chão; até 3 no mapa;
        bater num armário o tranca por 20 s, como no chefe), △ + × **Correr pelas Frestas** (`frestaTravel`: entra na
        fresta mais próxima e sai pela mais perto do alvo com um bote; sem fresta aberta fica APAVORADO, como no chefe),
        R2 + × Cópia Observada, △ + L2 Fortalecer (`fortifyDevorado`: os Devorados ganham vida e dano). Especial
        **Emboscada das Frestas** (`frestaAmbush`): 4 armários em volta do alvo, 3 botes e o Olho da Boca drenando.
      - Conferido no navegador: cada golpe acerta (31 a 64 de dano), os especiais dão ~280, os armários somem no fim.
      - Falta: medir o balanceamento de novo (os números de 1.36/0.79 e 1.17/0.89 eram do kit antigo).
- [x] **Mansão e Escola mais claras** (pedido do dono, 2026-11-06): `brighten()` em `arena/configs.js` multiplica as
      luzes do mapa do PvE só nas arenas de luta (hemisférica ×2.6, ambiente ×2.4, direcional ×3.2 com sombra, pontuais
      ×1.6) + uma luz de preenchimento quente no centro; névoa 0.012. Câmeras das miniaturas reposicionadas.
- [x] **Tela de seleção de cenários melhorada** (idem): em telas ≥ 900 px os cartões ficam numa grade de 4 colunas à
      esquerda e o preview grande + descrição à direita (`#stage` em grid, `styles.css`); o preview não cobre mais a 4ª
      fileira de cartões.

Detalhes em `docs/outro-lado-playtest.md` (rodada 8).


---

## 4. Como as dungeons funcionarão

### 4.1. Estrutura geral de uma dungeon

Cada dungeon deverá funcionar como uma pequena experiência completa, e não apenas como uma arena com um chefe no centro.

O fluxo pretendido será:

1. O jogador entra em uma dungeon e conhece o ambiente.
2. Explora o mapa, identifica caminhos e se prepara para o confronto.
3. Caso sejam implementados inimigos menores, enfrenta esses adversários e pode obter recursos para sobreviver.
4. Encontra a área ou o evento que inicia o confronto contra o chefe.
5. Enfrenta o chefe, que deverá ter padrões de ataque, habilidades e comportamentos próprios.
6. Após a vitória, recebe acesso à saída e pode coletar as recompensas.
7. Atravessa a porta de saída para avançar para a próxima dungeon.

A duração, o tamanho do mapa e a quantidade de desafios poderão variar de acordo com o chefe e com a proposta da dungeon.

**A prioridade é fazer cada dungeon parecer um território pertencente à criatura que o domina.** O cenário, os obstáculos, a iluminação, os efeitos e os desafios deverão reforçar a identidade do chefe enfrentado.

### 4.2. Mapas personalizados

As dungeons deverão contar com mapas próprios, criados para o modo PvE. Não basta reutilizar as arenas tradicionais de luta e apenas colocar um chefe nelas.

Cada mapa poderá ter:

- Corredores, salas, passagens estreitas e áreas abertas.
- Obstáculos e elementos de cenário que influenciem o combate.
- Rotas que ajudem a criar tensão ou preparar o encontro com o chefe.
- Elementos visuais que indiquem a presença e a influência da criatura.
- Uma área apropriada para o confronto principal.
- Uma saída que só seja liberada depois da vitória contra o chefe.

Nem todas as dungeons precisam seguir a mesma estrutura. Algumas podem enfatizar exploração e tensão; outras podem ser mais diretas e focadas no combate. O importante é que cada uma tenha personalidade própria.

### 4.3. Inimigos menores antes do chefe

A presença de inimigos menores antes do chefe deverá ser avaliada durante o desenvolvimento. Essa mecânica é interessante porque pode transformar a dungeon em uma jornada com preparação, em vez de levar o jogador diretamente para uma luta isolada.

Caso sejam implementados, esses inimigos deverão ser mais simples do que o chefe principal. Eles poderão testar a capacidade de combate do jogador, ocupar determinadas áreas do mapa e aumentar a tensão antes do confronto final.

Entretanto, eles não deverão ser usados apenas para aumentar artificialmente a duração da dungeon. Sua quantidade, resistência e dano deverão ser adequados à progressão, especialmente no modo cooperativo.

#### Drops de cura

**Os inimigos menores deverão ter uma chance de deixar itens de cura, garantindo uma possibilidade de recuperação antes do chefe.**

O sistema de drops deverá ser configurável, permitindo ajustar a probabilidade e a quantidade de itens sem alterar diretamente o código de cada inimigo.

As regras pretendidas são:

- Inimigos menores poderão deixar itens de cura ao serem derrotados.
- A cura não deverá ser garantida a cada eliminação, mas a chance precisa ser relevante o suficiente para ter utilidade prática.
- Os itens deverão aparecer em uma posição acessível, permitindo que o jogador os colete.
- A quantidade de cura deverá ser equilibrada para ajudar na preparação sem eliminar a necessidade de jogar bem.
- A dificuldade do chefe e o tamanho da dungeon deverão ser considerados ao ajustar as chances de drop.
- No cooperativo, as regras de coleta e distribuição dos itens deverão ser definidas para evitar disputas injustas entre os jogadores.

A cura antes do chefe é especialmente importante porque o jogador poderá chegar ao confronto com a vida reduzida após a exploração ou os combates anteriores.

Se os testes indicarem que uma dungeon é excessivamente punitiva, deverão ser ajustados os drops, os desafios anteriores ou os recursos disponíveis. Não se deve depender exclusivamente de o jogador já possuir melhorias permanentes para conseguir sobreviver.

### 4.4. Aleatoriedade e expansão futura

Inicialmente, o desenvolvimento poderá começar com uma quantidade pequena de dungeons, suficiente para validar o funcionamento do modo PvE.

**No futuro, quando houver várias dungeons disponíveis, a próxima dungeon poderá ser selecionada aleatoriamente após o jogador atravessar a porta de saída.**

A ideia é aumentar a variedade entre tentativas, fazendo com que o jogador não enfrente necessariamente a mesma sequência de dungeons em todas as campanhas.

O sistema deverá ser planejado para permitir:

- Adicionar novas dungeons sem reconstruir a lógica de progressão.
- Manter as fases em ordem cronológica da história, de acordo com o lançamento da série; definir essa posição ao cadastrar cada fase.
- Registrar quais dungeons estão disponíveis para seleção.
- Definir requisitos, restrições e chefes de cada dungeon.
- Selecionar aleatoriamente uma dungeon válida para a próxima etapa.
- Evitar a seleção de conteúdo bloqueado, indisponível ou incompatível com o progresso atual.
- Manter a progressão sincronizada entre os jogadores de uma sessão cooperativa.

A aleatoriedade deverá respeitar a estrutura da campanha. Uma dungeon não poderá ser escolhida se o jogador ainda não tiver cumprido seus requisitos ou se ela não estiver habilitada para aquela etapa.

Também será necessário avaliar a repetição de dungeons consecutivas. Caso a quantidade de opções permita, o sistema poderá priorizar dungeons diferentes da anterior.

Não é necessário implementar uma aleatoriedade complexa antes de haver conteúdo suficiente. A primeira versão pode utilizar uma sequência controlada ou uma lista pequena de opções, desde que a arquitetura facilite a expansão futura.

### 4.5. Dificuldade

Os chefes deverão ser desafiadores mesmo na dificuldade Fácil. Isso não significa torná-los injustos, mas exigir que o jogador observe os padrões de ataque, escolha os momentos de atacar e utilize suas habilidades corretamente.

A dificuldade poderá influenciar:

- Dano e resistência dos inimigos.
- Frequência, velocidade e combinação de ataques.
- Comportamento e pressão exercida pelo chefe.
- Recursos de recuperação disponíveis.
- Quantidade e força dos inimigos menores.
- Escalonamento de desafios no cooperativo.

No multiplayer, a dificuldade deverá aumentar de maneira controlada para considerar a presença de mais de um jogador. Não se deve simplesmente multiplicar a vida do chefe sem avaliar o tempo de combate, a quantidade de ataques e a dificuldade de evitar o dano.

O objetivo é que o cooperativo ofereça um desafio próprio, sem se tornar automaticamente mais fácil ou injustamente mais difícil.

---

## 5. Primeira dungeon: o território do Espreitador

### 5.1. Papel do Espreitador

O Espreitador será utilizado como referência para a primeira dungeon temática, caso essa seja a criatura escolhida para iniciar o desenvolvimento do modo PvE.

Ele será tratado inicialmente como um chefe controlado pela inteligência artificial, e não como um personagem selecionável.

**A criação do Espreitador como personagem jogável fica para uma atualização futura.** O desenvolvimento do chefe poderá aproveitar conceitos de suas habilidades, mas não deverá depender da conclusão de uma versão jogável completa.

### 5.2. Conceito do mapa

A dungeon deverá representar um território dominado pelo Espreitador, com sensação constante de vulnerabilidade e perseguição.

O mapa poderá apresentar:

- Corredores estreitos, salas conectadas e frestas.
- Armários espalhados pelo cenário, relacionados à identidade da criatura.
- Pontos de passagem que criem dúvidas sobre a rota mais segura.
- Áreas de pouca visibilidade e elementos que indiquem a presença do chefe.
- Um espaço final apropriado para a luta principal.

As frestas e passagens deverão fazer parte do desenho do mapa, não apenas servir como decoração. Elas poderão criar caminhos alternativos, áreas de risco ou pontos de observação, desde que isso seja compatível com os sistemas de movimentação existentes.

### 5.3. Etapas do confronto

A dungeon poderá ser organizada em três momentos:

**Etapa 1 — Exploração e tensão**

O jogador começa a explorar o território e entende gradualmente a disposição do mapa. Caso existam inimigos menores, eles poderão aparecer nessa etapa, oferecendo combate e uma oportunidade de obter cura antes do chefe.

**Etapa 2 — Perseguição e domínio do território**

O Espreitador começa a demonstrar sua presença por meio de eventos, aparições ou ataques. Armários e passagens do mapa poderão participar da mecânica de perseguição, preparando o jogador para o confronto.

Esses eventos deverão ser desenvolvidos com cuidado para não prender o jogador em sequências inevitáveis de dano. A ameaça precisa ser compreensível e oferecer oportunidades de reação.

**Etapa 3 — Confronto contra o chefe**

O jogador enfrenta o Espreitador diretamente. O chefe deverá utilizar habilidades compatíveis com sua identidade, com sinais visuais ou animações que permitam reconhecer ataques importantes.

A luta deverá ter espaço suficiente para movimentação, esquiva e utilização das habilidades dos personagens escolhidos.

As três etapas são uma proposta de estrutura, não uma exigência de que todas as dungeons futuras tenham exatamente o mesmo formato.

---

## 6. Recompensas, experiência e melhorias durante a dungeon

### 6.1. Recompensa física após derrotar o chefe

Quando o chefe for derrotado, deverá surgir um item de recompensa na região em que ele morreu.

O jogador precisará ir até esse local e coletar a recompensa para receber a experiência ou os recursos correspondentes.

A coleta deverá ser perceptível, com indicação visual e retorno na interface. Isso cria um pequeno momento de conclusão e evita que todas as recompensas sejam concedidas automaticamente sem interação.

No cooperativo, o sistema deverá definir claramente se a recompensa será individual ou compartilhada, evitando que um jogador fique sem progresso por não conseguir alcançar o item a tempo.

### 6.2. Evolução temporária durante a campanha

Durante a dungeon, o jogador poderá ganhar experiência e subir de nível. Cada evolução poderá oferecer opções de melhoria, como:

- Aumentar temporariamente a vida máxima.
- Aumentar o dano de ataques ou habilidades.
- Melhorar a defesa ou a capacidade de sobrevivência.
- Melhorar a eficiência de energia.
- Modificar o funcionamento de uma habilidade.
- Criar sinergias entre habilidades e atributos.

As escolhas deverão permitir estilos diferentes de jogo. Uma combinação poderá favorecer dano elevado, enquanto outra poderá priorizar sobrevivência ou uso frequente de habilidades.

O sistema deverá começar simples, com um conjunto limitado de melhorias bem definidas. A quantidade de opções poderá crescer conforme novas dungeons e personagens forem adicionados.

### 6.3. Sinergias

Algumas melhorias poderão interagir entre si para produzir resultados mais interessantes do que aumentos isolados de atributos.

Por exemplo, uma melhoria pode aumentar o dano de uma habilidade, enquanto outra reduz seu custo de energia. Quando combinadas, elas criam uma configuração especializada.

As sinergias deverão ser legíveis na interface, e seus efeitos precisarão ser testados para evitar combinações que tornem os chefes triviais ou que quebrem o sistema de combate.

### 6.4. Builds no cooperativo

Cada jogador deverá desenvolver sua própria configuração temporária.

Um jogador poderá focar em dano e outro em sobrevivência, por exemplo. As escolhas de um jogador não deverão substituir automaticamente as melhorias do outro.

O balanceamento deverá considerar que os jogadores podem criar combinações complementares.

---

## 7. Morte e progressão permanente

### 7.1. Consequências da morte

A morte deverá encerrar a tentativa atual da dungeon ou da sequência de dungeons, conforme as regras da campanha.

Ao morrer, o jogador perderá os níveis, a experiência não convertida e as melhorias temporárias obtidas naquela tentativa.

**A morte não deverá apagar a campanha inteira nem os pontos de progressão permanente já conquistados.**

Essa separação é essencial: cada tentativa oferece uma oportunidade de experimentar novas combinações, enquanto o progresso permanente permite que o jogador avance gradualmente ao longo de várias tentativas.

As regras de derrota no cooperativo precisarão ser definidas durante a implementação. Por exemplo, será necessário decidir se a derrota de um jogador encerra a tentativa imediatamente ou se o outro poderá continuar e tentar revivê-lo.

### 7.2. Pontos permanentes

O jogador deverá conquistar pontos permanentes por meio da progressão, de chefes derrotados e de outros objetivos definidos pelo jogo.

Esses pontos serão mantidos entre as tentativas e poderão ser gastos em uma árvore permanente de melhorias.

A distribuição de pontos deverá recompensar o avanço real e evitar que a melhor estratégia seja repetir indefinidamente uma atividade trivial apenas para acumular recursos.

### 7.3. Árvore permanente de melhorias

A árvore permanente deverá ser simples e fácil de entender, com melhorias como:

- Vida máxima.
- Dano.
- Defesa ou redução de dano.
- Eficiência de energia.
- Outros atributos que façam sentido para o sistema de combate.

Cada melhoria deverá ter custos e limites definidos. A progressão permanente deve ajudar o jogador a evoluir, mas não substituir a necessidade de aprender os padrões dos chefes.

Os pontos permanentes serão diferentes das melhorias temporárias: os primeiros permanecem salvos entre as tentativas; as segundas são perdidas quando a tentativa termina em morte.

No cooperativo, os pontos permanentes deverão ser associados ao perfil individual de cada jogador, mesmo quando o avanço pela dungeon for compartilhado.

---

## 8. Sistema de salvamento e gerenciamento de campanha

O modo PvE deverá ter um sistema de salvamento separado da lógica das partidas tradicionais de luta.

O jogador deverá encontrar opções claras para:

- **Continuar:** retomar a campanha salva, respeitando o estado que o sistema consegue recuperar com segurança.
- **Nova campanha:** iniciar uma campanha separada ou substituir a atual somente após confirmação.
- **Reiniciar campanha:** apagar o progresso da campanha selecionada e começar novamente.
- **Apagar dados do PvE:** remover os dados do modo PvE sem apagar configurações ou outros dados do jogo que não estejam relacionados a ele.
- **Exportar e importar backup:** avaliar a possibilidade de permitir que o jogador guarde uma cópia dos dados e os restaure posteriormente.

O armazenamento local deverá ser analisado. IndexedDB pode ser uma opção adequada caso o volume e a estrutura dos dados justifiquem sua utilização, mas a escolha deve considerar a arquitetura existente.

Os dados deverão distinguir:

1. **Perfil:** informações permanentes de cada jogador, incluindo melhorias e pontos permanentes.
2. **Campanha:** progresso geral, dungeons concluídas e regras de avanço.
3. **Tentativa atual:** dungeon atual, vida, experiência, níveis e melhorias temporárias, quando for possível e desejável restaurar esse estado.

O jogo deverá evitar perda acidental de dados, corrupção de salvamentos, duplicação de recompensas e incompatibilidades entre versões.

No cooperativo online, será necessário definir qual sistema é responsável por validar e persistir o progresso compartilhado. Não se deve confiar apenas nos dados enviados pelos clientes para conceder recompensas permanentes.

---

## 9. Transição entre dungeons e cutscenes

Após derrotar o chefe, a porta de saída da dungeon deverá ser liberada.

A saída deverá ser visualmente identificável e poderá contar com efeitos ou animações que indiquem que o jogador concluiu o desafio.

Ao atravessar a porta, deverá começar uma transição cinematográfica:

1. A câmera passa para uma posição atrás do personagem.
2. O personagem começa a caminhar por um túnel, corredor ou passagem.
3. A câmera acompanha o movimento, criando a sensação de continuidade.
4. Durante a transição, o jogo prepara e carrega a próxima dungeon.
5. A nova área é apresentada e o controle volta ao jogador.

A transição não deverá expor carregamentos abruptos nem deixar o jogador preso caso o carregamento falhe.

No cooperativo, a transição deverá manter os jogadores sincronizados. O sistema precisará definir como lidar com quem atravessa a porta primeiro, quem ainda está coletando recompensas e o que acontece caso um participante fique para trás.

A futura seleção aleatória de dungeons deverá acontecer de maneira compatível com essa transição, para que o jogador não veja uma área escolhida diferente daquela carregada para os demais participantes.

---

## 10. Interface do modo PvE

### 10.1. Posicionamento da vida do jogador e do chefe

A interface deverá ser adaptada para permitir que a vida do jogador e a vida do chefe fiquem visíveis simultaneamente.

**A barra de vida do jogador deverá ser deslocada para o canto inferior esquerdo da tela. A barra de vida do chefe deverá ficar centralizada na parte superior.**

A organização visual pretendida será:

- **Canto inferior esquerdo:** vida do jogador e informações pessoais de combate necessárias.
- **Centro superior:** nome do chefe e sua barra de vida.
- **Demais áreas:** energia, habilidades, experiência, nível e informações contextuais, posicionadas sem sobrecarregar a tela.

<escape>
[ CANTO SUPERIOR ESQUERDO ]                    [ CANTO SUPERIOR DIREITO ]

                       NOME DO CHEFE
                    [ BARRA DE VIDA DO CHEFE ]



                           ÁREA DE COMBATE



[ VIDA DO JOGADOR ]                         [ ENERGIA / HABILIDADES ]
CANTO INFERIOR ESQUERDO
</escape>

O esquema é apenas uma referência de posicionamento, não uma exigência visual definitiva.

A barra do chefe deverá ser suficientemente destacada para que o jogador acompanhe sua vida durante o combate, sem cobrir informações importantes nem prejudicar a visão da arena.

No cooperativo, será necessário avaliar como apresentar as informações de cada jogador sem duplicar excessivamente a interface. A solução deverá funcionar nas diferentes resoluções suportadas pelo jogo.

### 10.2. Informações de progressão

Durante a tentativa, a interface deverá informar de forma clara:

- Vida e energia do jogador.
- Nível e experiência temporários.
- Melhorias temporárias selecionadas.
- Vida do chefe durante o confronto.
- Indicação de recompensas coletáveis.
- Avisos de conclusão, saída liberada e mudança de dungeon.

As informações devem aparecer quando forem relevantes, evitando preencher permanentemente a tela com elementos desnecessários.

---

## 11. Compatibilidade com a arquitetura atual

Antes de implementar o novo modo, deverá ser feita uma análise dos sistemas existentes:

- Combate e aplicação de dano.
- Personagens, modelos e animações.
- Inteligência artificial.
- Arenas e carregamento de cenários.
- Câmera e cutscenes.
- Interface de usuário.
- Partidas locais para dois jogadores.
- Partidas contra a CPU.
- Multiplayer online/LAN e sincronização.
- Armazenamento e persistência de dados.

O objetivo é reutilizar sistemas compatíveis, isolando as regras específicas do PvE quando necessário.

A implementação deverá evitar duplicar sistemas de combate ou alterar o funcionamento das batalhas tradicionais sem necessidade.

O multiplayer atual de luta deverá ser auditado antes de se assumir que suporta o cooperativo contra chefes. O PvE online precisará sincronizar corretamente inimigos, chefes, ataques, vida, itens, recompensas, transições e progresso da sessão.

---

## 12. Ordem sugerida de implementação

A ordem abaixo prioriza uma base funcional e reduz o risco de desenvolver vários sistemas complexos ao mesmo tempo.

### Etapa 1 — Auditoria e melhorias de combate

- Ler README, TODO e changelog-admin.
- Analisar a arquitetura e identificar os sistemas reutilizáveis.
- Implementar e testar as melhorias de movimentação, modelos, especiais em equipe e câmera.
- Ajustar a posição das barras de vida para o PvE sem prejudicar o modo de luta atual.

### Etapa 2 — Protótipo de uma dungeon

- Criar um mapa PvE próprio.
- Definir o fluxo de entrada, exploração, chefe e saída.
- Implementar o primeiro chefe com inteligência artificial.
- Avaliar a presença de inimigos menores e implementar drops de cura.
- Validar a experiência em solo antes de expandir o conteúdo.

### Etapa 3 — Progressão temporária

- Implementar experiência e evolução durante a tentativa.
- Criar opções de melhorias temporárias.
- Adicionar sinergias iniciais.
- Implementar a coleta de recompensas após o chefe.

### Etapa 4 — Progressão permanente e salvamentos

- Criar a árvore permanente.
- Separar dados de perfil, campanha e tentativa.
- Implementar continuar, nova campanha e reiniciar com confirmação.
- Testar a persistência e as regras de morte.

### Etapa 5 — Transições e expansão de dungeons

- Implementar a porta de saída.
- Criar a cutscene de caminhada pelo corredor.
- Preparar o carregamento de novas dungeons.
- Estruturar o cadastro de dungeons para futuras expansões.
- Quando houver opções suficientes, implementar a seleção aleatória da próxima dungeon.

### Etapa 6 — Cooperativo local

- Permitir que dois jogadores enfrentem juntos as dungeons.
- Adaptar a interface para dois jogadores.
- Definir regras de cura, coleta, derrota e recompensas.
- Ajustar a dificuldade para o cooperativo.

### Etapa 7 — Cooperativo online

- Auditar e adaptar a sincronização existente.
- Sincronizar chefes, inimigos, ataques, itens e transições.
- Definir autoridade sobre o progresso e as recompensas.
- Testar desconexões, reconexões e situações de falha.

### Etapa 8 — Expansão e balanceamento

- Adicionar novas dungeons e chefes.
- Expandir as melhorias e sinergias.
- Ajustar dificuldade, drops e progressão com base em testes.
- Planejar o Espreitador como personagem jogável em uma atualização futura, caso essa prioridade seja mantida.

A ordem poderá ser ajustada após a auditoria técnica, mas o projeto não deverá tentar implementar todas as funcionalidades simultaneamente.

---

## 13. Critérios de aceitação

A atualização deverá ser considerada funcional quando os seguintes pontos aplicáveis estiverem concluídos e testados:

### Jogo de luta

- [ ] As melhorias de animações, modelos, especiais em equipe e câmera foram implementadas sem quebrar as batalhas existentes.
- [x] A interface foi ajustada sem prejudicar o modo de luta tradicional.

### Dungeons e chefes

- [x] Existe pelo menos uma dungeon PvE funcional com mapa próprio.
- [x] O jogador consegue entrar, explorar, enfrentar o chefe e concluir a dungeon.
- [x] A presença de inimigos menores foi avaliada e, caso implementada, eles possuem uma chance configurável de deixar itens de cura antes do chefe.
- [x] A saída é liberada após a vitória.
- [x] A transição para a próxima dungeon funciona sem erros.
- [x] A estrutura permite adicionar novas dungeons futuramente.
- [x] A seleção aleatória fica prevista para quando houver conteúdo suficiente.

### Progressão e salvamentos

- [x] As melhorias temporárias são perdidas conforme as regras da morte.
- [x] A progressão permanente permanece salva.
- [x] O jogador consegue iniciar, continuar e reiniciar uma campanha com segurança.
- [x] O salvamento não apaga dados não relacionados ao PvE.

### Interface

- [x] A barra de vida do jogador fica no canto inferior esquerdo.
- [x] A barra de vida do chefe fica centralizada na parte superior.
- [x] As informações continuam legíveis durante o combate.

### Cooperativo

- [x] As regras de progressão, cura e recompensas estão definidas.
- [x] A sincronização funciona no formato cooperativo efetivamente implementado (lockstep, v4.30.0; testado em duas abas, ~12 mil quadros sem divergência).
- [x] O jogo trata falhas de conexão e transições de maneira previsível (quem cai volta ao menu do Outro Lado com aviso; a dungeon montada esperando o outro é desmontada; se a dungeon não montar, volta ao menu com a tentativa salva).

### Escopo futuro

- [x] O Espreitador funciona como chefe conforme o escopo da dungeon.
- [x] Sua implementação como personagem selecionável não é tratada como requisito obrigatório desta atualização.

---

## 14. Diretrizes de desenvolvimento

Antes de alterar os arquivos, consultar a documentação e o estado atual do repositório.

Durante o desenvolvimento:

- Não recriar o jogo do zero.
- Não substituir sistemas existentes sem justificativa técnica.
- Fazer alterações incrementais e compatíveis com a arquitetura atual.
- Testar as funcionalidades existentes depois de mudanças importantes.
- Atualizar o TODO e o changelog-admin de acordo com o progresso real.
- Registrar a versão e o resumo das alterações no changelog destinado ao jogador ao concluir uma versão estável.
- Seguir o fluxo de commit e push definido para o projeto.
- Não marcar uma funcionalidade como concluída sem que ela tenha sido implementada e verificada.

Quando uma decisão técnica depender de informações ausentes no código ou na documentação, investigar antes de escolher uma solução definitiva.

## Resultado esperado

O Arena Paranormal continuará sendo um jogo de luta 3D, mas passará a contar com um modo PvE próprio, estruturado em dungeons temáticas e confrontos contra chefes.

A experiência combinará exploração, possibilidade de recuperação antes dos chefes, melhorias temporárias durante cada tentativa, progressão permanente entre tentativas, salvamentos seguros e transições cinematográficas.

A arquitetura deverá permitir que novas dungeons sejam adicionadas ao longo do tempo e, futuramente, selecionadas aleatoriamente para aumentar a variedade. O Espreitador será desenvolvido inicialmente como chefe, deixando sua versão jogável para uma atualização posterior.

# REGRA PRIORITÁRIA — RECUPERAÇÃO DA UPDATE, AUDITORIA E REVISÃO DO ELENCO

**Estado em 2026-10-22:** a recuperação (item 1) foi feita na revisão da v3.34.0 — os commits de 18/10 (skate do
Xande voltando para a mão, enquadramento do close de rosto da galeria, README, `teamLinks.js` e este planejamento)
conferidos contra o código; o import sem uso em `assists.js` saiu. A auditoria do elenco (item 2) segue pelos modelos
mais antigos.

## 1. PRIMEIRA PRIORIDADE: RECUPERAR A ATUALIZAÇÃO INTERROMPIDA

A última atualização foi interrompida no meio do trabalho do Claude, mas as alterações realizadas foram commitadas e enviadas ao GitHub. Portanto, não presuma que o último trabalho foi concluído corretamente nem que está perdido.

Antes de iniciar qualquer outra tarefa:

1. Leia integralmente `README.md`, `TODO.md`, `CHANGELOG-ADMIN.md` e `CHANGELOG-CLIENTE.md`.
2. Confira `git status`, os commits recentes, o último commit enviado ao GitHub e as diferenças entre os commits relevantes.
3. Identifique exatamente quais alterações entraram no último commit, quais partes da implementação ficaram incompletas e quais tarefas estavam em andamento.
4. Examine o código alterado, incluindo modelos, habilidades, invocações, animações, efeitos, configurações dos personagens e integrações com os sistemas existentes.
5. Verifique se existem implementações pela metade, referências quebradas, arquivos esquecidos, comportamentos provisórios ou divergências entre código, TODO e changelogs.
6. Recupere o trabalho a partir do estado atual do repositório. Não reverta o commit simplesmente porque a atualização foi interrompida e não refaça tudo do zero.
7. Corrija primeiro os problemas deixados pela interrupção e conclua as partes iniciadas que pertençam ao escopo atual.

Preserve todo o trabalho válido já enviado. Não faça reset destrutivo, não descarte alterações existentes e não reescreva o histórico do Git sem necessidade.

## 2. SEGUNDA PRIORIDADE: AUDITORIA COMPLETA DOS PERSONAGENS

Recentemente, muitos personagens foram adicionados ao jogo, mas nem todos passaram por uma revisão cuidadosa dos modelos, poderes, invocações, animações e efeitos. Os personagens antigos também precisam de melhorias.

Por isso, antes de considerar o elenco concluído, faça uma auditoria individual de TODOS os personagens selecionáveis existentes no código atual, incluindo personagens recentes, antigos, formas alternativas, transformações e personagens que utilizem invocações.

Não se limite aos personagens destacados nas tarefas antigas do TODO. A auditoria deve considerar o elenco real encontrado no projeto.

Para cada personagem, examine separadamente:

### A. Modelo visual

- Fidelidade ao personagem de referência.
- Silhueta, proporções, rosto, cabelo, roupas, acessórios, armas e elementos característicos.
- Qualidade e coerência dos materiais, texturas, cores e detalhes.
- Animação em repouso, poses de combate, ataques, dano, vitória e transformação.
- Clipping, deformações, partes atravessando o corpo, acessórios flutuantes e problemas de posicionamento.
- Escala, orientação, ponto de origem e compatibilidade com a câmera.
- Qualidade do modelo em combate, e não apenas na tela de seleção.
- Uso excessivo de modelos genéricos, peças reaproveitadas ou soluções provisórias que prejudiquem a identidade visual.

Não refaça automaticamente todos os modelos. Identifique os problemas concretos, preserve o que já está bom e implemente melhorias proporcionais à necessidade.

### B. Poderes, golpes e habilidades

- Fidelidade aos poderes, feitos e estilo de luta do personagem.
- Variedade real entre ataques básicos, habilidades, especiais, passivas e transformações, quando aplicáveis.
- Animações correspondentes ao golpe executado.
- Hitboxes, alcance, trajetória, tempo de execução, recuperação e interação com o adversário.
- Efeitos visuais e sonoros coerentes com o poder representado.
- Avisos visuais claros para ataques que possam ser esquivados ou interrompidos.
- Integração com energia, sanidade, cooldowns, combos, defesa e demais sistemas existentes.
- Ausência de ataques genéricos que poderiam pertencer a qualquer outro personagem, salvo quando houver justificativa.
- Ausência de habilidades provisórias, placeholders ou efeitos que não correspondam à ação executada.

Não iniciar um balanceamento geral nesta etapa. Corrija habilidades quebradas, incoerentes ou incompletas e registre eventuais questões de equilíbrio para uma fase posterior.

### C. Invocações, criaturas e entidades

Para todo personagem que invoque criaturas, entidades, marionetes, aliados, armas autônomas ou outras manifestações, faça uma revisão específica:

- Verifique se a entidade correta é invocada e se corresponde à referência do personagem.
- Revise modelo, escala, materiais, animações, posição e orientação.
- Confira a animação de entrada, permanência em campo, ataque, dano, desaparecimento e encerramento.
- Garanta que a invocação apareça no momento correto e não surja abruptamente ou sem contexto visual.
- Verifique se ataca o alvo correto, respeita o alcance previsto e interage adequadamente com colisões, câmera e cenário.
- Confira se a entidade desaparece corretamente e se não permanece presa, invisível ou duplicada.
- Revise efeitos, partículas, sons e telegraphs.
- Verifique desempenho e consumo de recursos, especialmente quando várias entidades aparecem simultaneamente.
- Confira a integração com IA, multiplayer ou batalha em equipe quando esses sistemas forem aplicáveis.

Não considere uma invocação concluída apenas porque o comando de ativação funciona. A apresentação visual e o comportamento durante toda a execução também precisam ser revisados.

### D. Identidade e integração no jogo

- Verifique se o personagem possui identidade própria de combate.
- Revise introduções, falas, poses de vitória e transformações.
- Confira o funcionamento da CPU e o uso adequado das habilidades.
- Verifique seleção, HUD, retratos, nomes, formas alternativas e integração com equipes e assistências, quando aplicáveis.
- Identifique animações compartilhadas que não combinem com o personagem.
- Preserve as particularidades já implementadas e evite substituir mecânicas próprias por soluções genéricas.

## 3. TERCEIRA PRIORIDADE: EXECUTAR AS MELHORIAS IDENTIFICADAS

Depois da auditoria, organize os resultados por prioridade:

**P0 — Correções críticas:** funcionalidades quebradas, modelos ausentes, invocações que não funcionam, erros que impedem jogar, referências inválidas e regressões introduzidas pela atualização interrompida.

**P1 — Revisão de qualidade:** modelos visualmente inadequados, poderes incompletos, invocações sem apresentação apropriada, animações genéricas, efeitos incoerentes e falta de identidade mecânica.

**P2 — Polimento:** melhorias adicionais de poses, materiais, efeitos, sons, animações secundárias e apresentação cinematográfica.

**P3 — Futuro:** personagens novos, grandes expansões de conteúdo, novos modos e melhorias que não sejam necessárias para concluir a versão estável atual.

Não comece várias revisões simultaneamente. Trabalhe por personagem ou conjunto de sistemas relacionados, conclua cada etapa e teste o resultado antes de avançar.

Priorize as correções P0, depois os problemas P1 que comprometam significativamente a qualidade do elenco. Os itens P2 e P3 podem continuar no TODO para etapas futuras.

## 4. REFERÊNCIAS E FIDELIDADE

Quando a revisão depender de fidelidade a uma obra ou personagem, consulte referências confiáveis, como episódios, cenas, wikis e materiais disponíveis.

Diferencie informações canônicas de adaptações criadas para o jogo. Não invente poderes, feitos, falas ou características como se fossem oficiais.

Quando houver informações insuficientes, implemente apenas o que estiver fundamentado e registre a dúvida ou a necessidade de pesquisa.

## 5. TESTES OBRIGATÓRIOS

Após cada revisão significativa:

- Execute as verificações técnicas disponíveis no projeto.
- Execute o build de produção quando apropriado.
- Teste o personagem em combate real, não apenas na seleção.
- Teste habilidades, especiais, invocações, transformações e animações alteradas.
- Verifique a CPU, colisões, hitboxes, câmera e efeitos.
- Confira se outros personagens e sistemas não foram afetados.
- Teste em mobile quando a mudança puder afetar desempenho, interface ou controles.
- Registre falhas que não puderem ser reproduzidas ou verificadas no ambiente disponível.

Não declare uma revisão concluída se apenas inspecionou o código e não verificou o comportamento necessário.

## 6. DOCUMENTAÇÃO, COMMITS E CONTINUIDADE

- Atualize o TODO conforme o estado real do código, removendo tarefas concluídas e mantendo as pendências verdadeiras.
- Registre as alterações técnicas no `CHANGELOG-ADMIN.md`.
- Registre no `CHANGELOG-CLIENTE.md` somente as novidades relevantes para os jogadores.
- Faça commits claros após marcos significativos e envie-os ao GitHub quando possível.
- Nunca presuma que o changelog ou o TODO está atualizado só porque o código foi commitado.
- Atualize a versão do cliente e finalize a documentação de lançamento somente quando a próxima versão estável estiver realmente pronta.

## 7. RESTRIÇÕES DE ESCOPO

- Não iniciar o balanceamento geral nesta etapa.
- Não adicionar novos personagens em massa antes de revisar o elenco existente.
- Não recriar o jogo, sistemas completos ou modelos que já estejam adequados.
- Não substituir mecânicas próprias por golpes genéricos apenas para acelerar o desenvolvimento.
- Não iniciar a migração para executável ou software instalável.
- Não interromper o trabalho para pedir confirmação sobre decisões técnicas reversíveis e de baixo risco. Se uma decisão depender realmente do usuário, documente o bloqueio e continue com tarefas independentes.

## ORDEM FINAL DE EXECUÇÃO

1. Recuperar e concluir o trabalho interrompido.
2. Auditar o TODO e a documentação contra o código atual.
3. Corrigir regressões e implementações incompletas da última atualização.
4. Auditar todos os personagens, incluindo modelos, poderes, invocações, animações e integração.
5. Corrigir os problemas críticos e executar melhorias prioritárias de qualidade.
6. Validar estabilidade, build, combate, IA e mobile crítico.
7. Atualizar TODO e changelogs.
8. Finalizar a próxima versão estável e atualizar a versão do cliente apenas no encerramento.

**A prioridade é recuperar o estado real do projeto, concluir o que ficou incompleto e elevar a qualidade do elenco inteiro antes de expandi-lo ainda mais.**

# 0. REGRA DESTE TODO

Este documento contém apenas:

* tarefas pendentes;
* melhorias;
* testes;
* decisões ainda abertas;
* sistemas planejados;
* problemas que precisam de validação.

Os **commits, implementações concluídas e histórico de versões** já estão documentados nos Changelogs Admin e Cliente.

### Regra de manutenção

Quando uma tarefa for concluída:

**TODO → remover da lista → registrar no Changelog**

Não transformar este documento em histórico.

---

# 1. VISÃO ATUAL DO PROJETO

O Arena Paranormal é um jogo de luta 3D em arena, com foco em:

* combate rápido;
* movimentação livre;
* combos;
* defesa;
* esquiva;
* substituição;
* grabs;
* especiais;
* transformações;
* personagens com kits próprios;
* IA;
* batalha em equipe;
* assistências;
* LAN/Online;
* diferentes modos de jogo;
* identidade visual própria.

O projeto deve continuar evoluindo sem recriar sistemas já existentes.

---

# 2. PRIORIDADES

## 🔴 P0 — Estabilidade

1. **Travamentos e congelamentos do jogo — prioridade máxima:** reproduzir e corrigir antes de novas funcionalidades,
   conteúdo ou polimento. Não tratar lentidão como balanceamento nem assumir a causa sem medir.
   - Registrar cenário, modo, personagens/formas, quantidade de entidades, ações anteriores e dispositivo em que ocorre;
     verificar se trava sempre no mesmo ponto, após algum tempo ou apenas sob carga.
   - Usar o contador `?perf`/F8 e o console para observar FPS, memória e erros; comparar uma partida simples com o caso
     que trava e isolar cenário, personagem, transformação e efeitos até localizar a condição.
   - Investigar como hipóteses: carregamento ou decodificação síncrona de modelos/texturas; trabalho excessivo por quadro
     (IA, colisões, animações ou efeitos); loops/tarefas que não terminam; crescimento de partículas, entidades ou
     objetos sem descarte; listeners/timers duplicados; espera de rede ou sincronização que não se resolve. Confirmar
     cada hipótese com evidência antes de mudar código.
   - Corrigir a causa raiz, preservar o comportamento esperado e adicionar um teste de regressão reproduzível sempre que
     possível. Revalidar o modo afetado e os modos relacionados; não esconder erros com fallback silencioso.
2. Limpeza
3. Build
4. Regressão
5. Correção de problemas atuais
6. Revisão dos personagens recentes

## 🔴 P1 — Gameplay

6. Mecânicas de combate
7. Transformações
8. IA
9. Telemetria
10. Balanceamento

   - **Equipe: Barra de Equipe, transformação em equipe e Especial em Equipe (△ △ △ ○)** — ver a seção
     *EQUIPE — BARRA DE EQUIPE E ESPECIAIS EM EQUIPE* logo abaixo (pedido de 2026-10-17, inspirado no Storm 4).

## 🟠 P1 — Infraestrutura

11. LAN real
12. Mobile
13. Sistema de idiomas

## 🟠 P1 — Novos modos

14. Torneio
15. Torre

## 🟡 P2 — Polimento

16. Animações
17. Câmera
18. HUD
19. Menus
   - **Tela inicial estática, mais bonita e imediata:** a abertura atual depende dos modelos 3D do elenco; a cena só
     monta os lutadores depois do preload, deixando a tela incompleta enquanto os arquivos carregam. Redesenhar a
     composição com arte estática leve e responsiva, sem modelos 3D na tela de título, para mostrar a abertura completa
     imediatamente. Separar essa exibição do preload necessário às partidas e indicar o carregamento sem permitir iniciar
     uma partida antes de os modelos necessários estarem prontos; medir o tempo até a tela e o menu ficarem utilizáveis.
20. Áudio
21. Efeitos
22. Cenários

## 🟢 P3 — Conteúdo futuro

23. Novas formas
24. Novos personagens
25. Novos cenários
26. Novos modos

---

# NUBI — PERSONAGEM NOVA (Escriptas)

- [x] Modelo, texturas, golpes, Desvio Imperturbável, Decadência, Ritual de Drenagem, Afinidade com a Morte, agarrão, falas.
- [x] Carniçal da Esfinge: invocação com barra de vida (não trai a Nubi), Amedrontar, Saltar, Vomitar Lodo, Estômago.
- [x] Enigma nas 3 marcas da barra (75/50/25%): Y/A/B/X, 52 enigmas sem repetir; acertou = paralisa, errou = devorada.
- [x] Acabamento do modelo da Esfinge (pedido: "depois melhore o modelo"): proporções de leão, patas mais grossas, Menés
      lisa com listras nítidas, asas maiores e menos ruidosas; refazer a base e refinar pelo MCP.
- [x] Ajustes do teste: Esfinge paralisada (não a vítima), 35 s com o relógio parado na paralisia, olhos pretos na
      Transformação, Lodo que Prende e Sentença do Chacal.
- [x] **Terminar a Esfinge** (pedido de 2026-10-23; a POSTURA feita em 2026-10-31: agachada como réptil — as patas abertas
      para os lados com os cotovelos/joelhos para fora, o corpo baixo e o peito alto, `SPHINX_CROUCH` em combat/beasts.js): modelo aproximado da arte oficial ("Miniatura Carniçal da Esfinge
      em Calamidade") — pele e ossos verde-oliva, Menés escura com listras roxas e o LEQUE de espinhos roxos, colar de
      crânios em duas fileiras, asas de membrana roxa, cauda fina enrolada, garras longas. Falta: a POSTURA (na arte
      ela fica agachada, réptil, com o peito alto; hoje as patas animadas em código a deixam em pé como um cão) —
      junto do REAJUSTE DAS ANIMAÇÕES.
- [x] BALANCEAMENTO GERAL DOS PERSONAGENS (v3.32.0): 4 rodadas de telemetria, ajustes em `src/config/balance.js`.
      Repetir a medição a cada personagem novo (`runBalance({ focus: 'id' })`) e a cada mudança grande de kit.

# MODELOS — PRÓXIMOS PASSOS

- [x] **Carina — armas: melhorar o USO e os MODELOS** (pedido do dono, 2026-11-02; feito na v4.20.0). Os modelos do MANGUAL de Marco
      Leone, da GLOCK SILENCIADA dourada (cabeça de leão), das FACAS de arremesso e do NUNCHAKU dourado ainda são
      primitivas em código (`models/weapons.js`): refazer no Blender pelo MCP com as referências da wiki (o nunchaku com
      "Leone" escrito e o brasão nas pontas; o mangual decorado). E o USO: a pegada e os golpes (a bola do mangual
      pendendo e girando de verdade na corrente em vez de seguir rígida; o nunchaku com os dois bastões soltos; a Glock
      saindo do coldre da coxa; a faca saindo do cinto no arremesso).
- [x] Xande e Aguiar refeitos pelas artes oficiais (modelos, texturas, machado, taco e skate no Blender); mãos e sapatos de todos.
- [x] **Lírio**: a LEONORA remodelada no Blender pela arte oficial (`tools/blender/npc_leonora.py` → `public/npcs/leonora.glb`):
      o tambor com a pata dourada nas duas faces, as cintas de ferro com os cravos, o tufo de pelo e o cabo com as faixas
      pretas; a versão em código ficou de reserva. A maldição do Xande (Amaldiçoar Arma) continua pegando nela.
- [x] Fantasma remodelada pela arte oficial (sobretudo, faixas, facas, dreads; texturas novas).
- [x] Kemi remodelada pela arte oficial (top, mochila, faixas, casaco amarrado, dreads; texturas novas).
- [x] Gal Sal remodelado pela arte de Desconjuração (poncho com caimento real, cabelo, venda, correntes) e as lâminas Ereškigal no Blender.
- [x] Kaiser remodelada pela arte de Desconjuração (versão queimada/50%: casaco do avesso, braço esquerdo queimado, faixas, olhos roxos).
- [x] Arthur e Joui remodelados no Blender na técnica atual (sculpt_lib), revisados pelo MCP em 4 vistas contra as miniaturas de Calamidade — v3.41.0.
- [x] Arma de Sangue do Arthur no punho DIREITO (o braço que ele tem) e o físico vira cortes com a lâmina enquanto dura; o físico normal usa o braço direito (soco e cotovelada) — v3.41.0.
- [x] Balu (miniatura de Calamidade) e Lírio (miniatura de Sinais do Outro Lado) remodelados no Blender — v3.40.0.
- [x] Retratos com a cabeça cortada (Kian no tríptico): `renderPortraits` enquadra pela altura da cabeça — v3.39.0.
- [x] **Arnaldo** remodelado no Blender na técnica atual (sculpt_lib) pela "Arte do Arnaldo em Desconjuração" e a miniatura
      de Desconjuração, revisado pelo MCP em 4 vistas e no jogo (2026-10-26): o casacão escuro até o joelho, aberto, com as
      lapelas e a gola virada e o forro vinho; colete marrom com os botões e a corrente de ouro; colarinho branco e a
      gravata vermelha colada no peito; mangas compridas com o punho da camisa; calça com vinco; sapatos sociais pretos;
      o cabelo castanho volumoso penteado de lado (risca à direita, cobrindo o alto das orelhas e a nuca) e a barba cheia
      com o bigode. Os óculos redondos, a espada e o relógio continuam em código. (`tools/blender/arnaldo_common.py`, que
      agora também salva `fonte/<id>.blend`.)
- [x] **Anfitrião** remodelado pela "Miniatura O Anfitrião em Calamidade" (2026-10-26): o corpo e as roupas novas do Arnaldo
      (as mesmas roupas, como no cânone) e a cabeça refeita na técnica atual — a MÁSCARA lisa e escura cobrindo a cabeça,
      o SÍMBOLO DO ANFITRIÃO gravado em luz (círculo duplo com as runas, o triângulo), as LENTES redondas rosa acesas, o
      FILTRO canelado no queixo com a mangueira até o peito e as runas acesas, e as MANGUEIRAS CANELADAS (cinza, rosa e azul)
      que saem do alto, emolduram a máscara e descem pelas costas. Revisado pelo MCP em 4 vistas e no jogo.
- [x] **Veríssimo** remodelado pela "Miniatura Senhor Veríssimo em Calamidade" (2026-10-26, `char_verissimo.py` na técnica
      atual): o cabelo grisalho volumoso penteado para trás, a barba curta com o bigode e o cavanhaque, o colete escuro
      RISCADO DE GIZ abotoado, a camisa branca de gola aberta com as mangas arregaçadas até o cotovelo, a gravata azul
      afrouxada, a calça escura riscada (antes azulada, da época de Desconjuração) e os sapatos pretos. Revisado pelo MCP
      em 4 vistas e no jogo.
- [x] **Kian** (2026-10-26) pelas miniaturas "Kian marcado em Desconjuração" e "Kian em Calamidade": o corpo base (que guarda
      os UVs das linhas douradas e da escrita) ganhou a técnica atual — MÚSCULOS em relevo (peitoral, seis gomos com a
      linha alba, oblíquos, dorsais, bíceps), o AFRO curto e arredondado esculpido (antes uma calota raspada), as BARBAS da
      Transformação esculpidas (média e a cheia densa de Calamidade, com o bigode), as FAIXAS em espiral rentes do cotovelo
      aos nós dos dedos com as pontas soltas e as dobras da calça. Os nomes das peças (beard_m, beard_f, wraps) seguem os
      mesmos. Revisado pelo MCP e no jogo, normal e Calamidade (1,9 MB).
- [x] **O Diabo** (2026-10-26) pela "Miniatura O Diabo em Calamidade": os CHIFRES altos esculpidos com os anéis em relevo,
      os DEDOS longos vermelhos com as GARRAS escuras (mãos e pés), o manto, o capuz e as mangas com DOBRAS de verdade e a
      barra rasgada. Revisado pelo MCP e no jogo.
- [ ] **PARA DEPOIS (pedido de 2026-10-27) — upgrade de modelos: A MAGISTRADA (e as MÁSCARAS que ela invoca), O
      ESTRANGEIRO e O AMIGO IMAGINÁRIO** na técnica atual (sculpt_lib), pelas artes oficiais.
      [~] Feito em 2026-10-27: as MÁSCARAS (modelo `seita.glb`, v3.49.0) e o ESTRANGEIRO ajustado pelas artes (v3.50.0:
      mais alto e magro, ROSTO refeito do zero, pose parada própria `est_idle`, olhos verdes, ombreiras pontudas na capa,
      folhas no peito, faixa de pano, garras e pés de garra).
      [x] 2026-10-31: a MAGISTRADA revista pela "Miniatura A Magistrada em Desconjuração" (capa preta presa atrás dos
      braços, gola dourada em pé, ombreiras com espinhos, mangas bufantes até o cotovelo com o antebraço à mostra, luvas e
      faixas pretas, gola escura, calça clara, sapatos de duas cores) e a MÁSCARA DO DESESPERO em relevo (os sulcos
      afundados pelo próprio desenho — vale para a Celestine também); o AMIGO IMAGINÁRIO pela miniatura de O Segredo na
      Ilha (barbatanas da crista bem maiores, pregas fundas, a cauda longa arrastando, os fios de tinta compridos).
      Ainda na técnica antiga por baixo (sem `sculpt_lib` no corpo): um refazer completo fica para depois, se for preciso.
- [x] **O ESTRANGEIRO: os "SOLDADOS"** (feito em 2026-10-30) — no cânone são os DOPPELGANGERS (wiki "Doppelganger", apelido
      "Homens de Terno"; Sinais do Outro Lado ep. 3: chegam na van preta de terno e chapéu): o rosto rachado ao meio, olhos
      pequenos pretos de pupila verde, dedos longos e pontudos, e os FUZIS ALHEIOS (pistolas de plasma verde, sem munição).
      Modelo `tools/blender/char_doppel.py` → `public/models/doppel.glb` + `weapons.js alienPistol`; habilidade HOMENS DE
      TERNO (R2 + ×, `summonDoppels`): três em volta do adversário por 10 s — dois atiram de longe, o terceiro bate; "Somos
      Todos Um" (um cai, os outros atiram mais rápido).
- [x] **Pedidos de 2026-10-27 (feitos):**
      - EQUIPES: HENRI (o antigo "Juan", id `juan`) nos Mascarados → no ódio vira o JUAN (Portador) → Portador do Trono.
        PORTADORES ≠ RELÍQUIAS: Portadores = Juan (selecionável, `juan_odio`), Arnaldo, Ferreiro; Relíquias = O Diabo, O Deus
        da Morte (selecionável), A Magistrada, O Anfitrião (selecionável) — dá para começar já como a Relíquia
        (`characters/selectableForms.js`, mesmas definições das formas); OUTRO LADO = Estrangeiro e Amigo Imaginário. Cores,
        páginas da seleção, falas (pelo personagem base), página Sobre e check atualizados.
      - Tela inicial: as equipes em chips pequenos com a cor de cada uma (gerados da lista), somem com o menu aberto.
      - ARTHUR: a Arma de Sangue cobre o ANTEBRAÇO e a lâmina sai dele na linha do braço (`bloodForearmBlade`), não é mais
        segurada como espada.
      - KAISER: FOTO COM FLASH (← + □, no lugar do Disparo de Emergência): a câmera fotográfica cega quem está à frente
        olhando para ele (de costas ou esquivando escapa).
      - FERREIRO: 50% de chance de um dos Mananciais ser o que fica LONGE (~6 m) e arremessa o LODO que tira SANIDADE
        (`DanteClone` com `o.sludge`; `onHit.drainSanity`).
      - CPU — INTELIGÊNCIA ÚNICA ("uma IA que saiba usar qualquer personagem contra qualquer outro"): sem IA por personagem
        nem por confronto. `kitProfile(def)` lê o kit — ATIRADOR (tiro carregado ou arma automática de longe: Arthur, Kaiser,
        Kemi), PERSEGUIDOR (rápido ou com 2+ formas de encurtar a distância: investidas, botes, puxões, teleporte) e a
        velocidade — e `matchupPlan(meu, dele)` monta o plano com os DOIS kits: atirador × perseguidor fica a 9 m, foge a
        4,5 m e prioriza o que trava (Dystopia); atirador × resto a 7,5 m / 3,5 m; quem enfrenta um atirador PRESSIONA
        (encurta ziguezagueando, entra de dash bem mais vezes). Validado em 10 confrontos (5 sorteados do elenco), sem erro.
      - [~] (2026-10-31: o atirador agora LÊ A INVESTIDA — a distância caindo mais de 7 m/s a menos de 5,5 m — e esquiva
        para o LADO no tempo certo; e FOGE PELO CENÁRIO — `fleeDirection` testa 16 direções e evita parede, canto e
        obstáculo à frente e, com o perseguidor perto, passa ATRÁS DOS PILARES. Teste CPU × CPU (normal, 3 lutas cada):
        a distância média subiu de ~2 m para 5–6 m; Kaiser 3×0 Jae, Amalia 3×0 Jae, Amalia 2×1 Raziel, Kemi 1×1 Jae.
        Falta: Arthur × Raziel (0×3, o Raziel fecha rápido demais — a 4 m, perto 45% do tempo))
        [x] 2026-10-31: ATIRADOR ALCANÇADO — colado no perseguidor, a CPU abre espaço com o golpe que EMPURRA (o de trás,
        com invencibilidade, se o outro está atacando; senão o chute de frente) e volta a fugir/atirar. CPU × CPU (normal,
        3 lutas cada): Arthur × Raziel 1×1, 2×1, 0×2 (antes 0×3); Kaiser × Jae 1×1, 1×1, 2×0. **Ainda a melhorar:** atirador × perseguidor rápido quando OS DOIS são CPU (Arthur × Raziel, Kaiser × Jae ficam
        ~2 m): o perseguidor, mais rápido e agora também pressionando, vence a corrida pela distância. Próximo passo: o
        atirador ler a investida do outro (o telegraph) e esquivar no tempo certo, e usar o cenário (pilares) para fugir.
        [x] 2026-11-01: JANELA DE FUGA — com o perseguidor caído, atordoado, agarrado ou tomando golpe, o atirador dá dash
        curto para longe pelo cenário (fleeDirection) e volta a atirar. CPU × CPU (normal, 3 lutas cada): Kaiser × Jae 2×0,
        2×0, 1×1 com distância média 5–6 m (antes ~2 m); Arthur × Raziel 0×2 nas 3, distância 3,7–5,7 m (antes ~2 m) — o
        Raziel ainda vence: falta o Arthur converter a distância em dano (tiro carregado/Dystopia na hora certa).
        [x] 2026-11-01: JANELA PARA CONVERTER — com o perseguidor caído ou atordoado e a distância já segura, o atirador
        ATIRA em vez de só fugir. CPU × CPU (normal): **Arthur × Raziel 3×1** (antes 0×3).
      - CPU no BOTÃO DO ANFITRIÃO: larga tudo, corre até o botão e aperta primeiro (testado no Fácil e no Difícil).
- [ ] **PLANEJAMENTO — DISTRIBUIÇÃO PELO CÂNONE (pesquisa de 2026-10-27, wiki "Relíquias da Calamidade" e "A
      Magistrada").** Cada Relíquia é um OBJETO, e quem a porta recebe um TÍTULO:
      | Elemento | Relíquia (objeto) | Título do portador | Portadores no cânone |
      |---|---|---|---|
      | Sangue | O Trono | O Diabo | Juan (nascido Lúcio Davo, antes chamado Henri) |
      | Conhecimento | A Máscara do Desespero | A/O Magistrada(o) | Celestine (67 d.C.), a "Última Magistrada" (sem nome) |
      | Energia | (etérea; hoje na antiga katana do Joui) | O Anfitrião | Amphitruo, Aeneas, Liber, Silenus, Plautus, Arnaldo Fritz |
      | Morte | O Parasita de Dimensões | O Deus da Morte | portador desconhecido; receptáculos: um Deus da Morte desconhecido e O Ferreiro |
      Propostas (decidir com o dono antes de mexer):
      1. **Portadora de CONHECIMENTO que falta: CELESTINE** — guerreira da Ordo Calamitas em 67 d.C. (loira, cabelo curto
         jogado de lado, armadura com o Símbolo da Ordo Calamitas). Transformação CANÔNICA: depois dos jogos de Amphitruo
         ela coloca a Máscara do Desespero e vira A MAGISTRADA. Fecha o padrão dos Portadores: Juan → O Diabo/Portador do
         Trono, Celestine → A Magistrada, Arnaldo → O Anfitrião, Ferreiro → O Deus da Morte. Precisa de modelo novo
         (Blender) e kit (guerreira romana da Ordo Calamitas).
      2. **A transformação da MAGISTRADA não é canônica** ("Saber Tudo é Perder Tudo" é um fortalecimento genérico do
         jogo; no cânone ela é o título de quem porta a Máscara e não se transforma). Sugestão: as RELÍQUIAS não se
         transformam (como o Anfitrião e o Deus da Morte selecionáveis) e as habilidades canônicas dela entram no kit:
         REESCREVER A REALIDADE (recupera corpo e mente / reescreve o estado do alvo), CONJURAÇÃO VERDADEIRA (qualquer ritual
         de Conhecimento) e DESTRONAR O ANFITRIÃO (a única capaz de solucionar o Enigma de Medo e dizimar o Anfitrião —
         uma interação própria contra ele).
      3. [x] (feito: o Henri tem a etiqueta dos ESCRIPTAS junto dos Mascarados) **HENRI pela linha do tempo:** no cânone "Henri" é o nome do tempo de Escripta (Desconjuração, Dia Final, onde
         perdeu a mão e o olho esquerdos); "Juan" é o de Hexatombe (o Pacto, o Estigma, vence como sacrifício) e o portador
         do Trono é O Diabo. Avaliar se o Henri fica nos ESCRIPTAS em vez dos Mascarados.
      4. **O ANFITRIÃO selecionável com o visual de AMPHITRUO** (o primeiro Anfitrião conhecido: máscara sorridente com três
         mãos que se fundem ao rosto, armadura romana de ombreiras pontudas, a grande capa roxa com capuz, chamas roxas) — e
         o Anfitrião do Arnaldo com o visual do Arnaldo. Bate com o pedido da skin diferente (item abaixo).
         **Referências levantadas (2026-10-29, wiki "Amphitruo": arte de Arquivos Secretos, "Máscara de Amphitruo", miniatura
         de Calamidade):** o corpo é o de GAIUS (Ordo Calamitas, alto e magro). A MÁSCARA é metálica, cinza-escura, "em
         constante transformação": rosto de SORRISO LARGO (boca aberta em meia-lua mostrando os dentes) e OLHOS PEQUENOS
         apertados de riso; a superfície toda em SULCOS/FAIXAS ondulados horizontais (como camadas de metal derretido);
         TRÊS MÃOS saem das bordas e seguram o rosto (uma de cada lado + uma em cima), fundidas a ele, com os DEDOS
         subindo acima da cabeça como uma coroa. Armadura com OMBREIRAS PONTUDAS que sobem até o pescoço (detalhes roxos nos
         lados), o PANO no peito com o Símbolo da Ordo Calamitas, cordas/faixas enroladas no tronco, a saia de pano, e a
         grande CAPA ROXA com CAPUZ dos ombros até o chão, derramando no piso. Em combate brilha em roxo, com CHAMAS
         ROXAS/AZUIS subindo pelo corpo todo (as mesmas chamas da Celestine servem: `energyFlames`). Fala: "Agora é minha
         vez de brilhar!".
      5. **O Ferreiro** no cânone é RECEPTÁCULO (o portador da Morte é desconhecido): continua nos Portadores, que é o mais
         próximo.
      6. A **cor das Relíquias** era quase o amarelo da Ordo: trocada por MAGENTA (`#d63c8c`), única entre as equipes (feito).
         E os retratos do Anfitrião e do Deus da Morte na seleção saíam sem a cor da equipe (o retrato de vilão da Torre,
         com o mesmo id, era gerado depois e sobrescrevia) — corrigido (os do elenco são gerados por último).
      - [x] **2 (feito em 2026-10-27): A MAGISTRADA sem a transformação inventada** — a Barra dela agora é REESCREVER A
        REALIDADE (`specials/realityRewrite.js`, não é transformação: 30% da vida, sanidade cheia, sem nada de ruim em cima,
        recargas zeradas e os buffs do adversário apagados) + CONJURAÇÃO VERDADEIRA (rituais 25% mais baratos) + DESTRONAR O
        ANFITRIÃO (+30% de dano nele). Testado no jogo.
      - [x] **CELESTINE REFEITA PELO CÂNONE (v3.51.0, 2026-10-29)** — kit novo: Aliança Falsa (a traição da Sala da Morte),
        Código (todo golpe vira traição), Sala da Morte (a caveira que persegue), Endorfina e o Nada Pessoal acumulando
        (até 4 dados); a Corrente Giratória e a Investida Rebelde saíram. Modelo: corpo de mulher, o pano com o Símbolo,
        a corrente entre as machadinhas, lâminas de metal com talhos azuis, cabelo prateado, chamas de energia.
      - [x] **SELEÇÃO NO ESTILO STORM (v3.51.0)** — um cartão por personagem, versões no RB/LB (Henri ↔ Juan, Arnaldo ↔
        Anfitrião, Ferreiro ↔ Deus da Morte) com o selo ⇄; ←/→ trocam de página pela ponta da linha.
      - [x] **1 (feito em 2026-10-27): CELESTINE** — jogável: Portadores (logo depois do Ferreiro) com a etiqueta da Ordo Calamitas; kit das machadinhas na corrente (□ crava e puxa), Corrente Giratória, Código, Investida Rebelde, Endorfina, especial Duelo Final, passiva Nada Pessoal (+20% pelas costas) e a Transformação que vira CELESTINE, A MAGISTRADA (o kit da Magistrada com a aparência dela). Falas contra o elenco inteiro. Testado no jogo. Retrato da página Sobre feito (2026-10-27: o elenco inteiro renderizado de novo dos modelos atuais, com os que faltavam — Raziel, Juan Portador, Celestine, Deus da Morte e Anfitrião). — pedido do dono: entra numa equipe NOVA, a **ORDO CALAMITAS** (depois entram os
        outros membros: Gaius, Amalia, Cornelius...). Pesquisa (wiki "Celestine"): guerreira de 67 d.C., pele clara, cabelo
        loiro curto, armadura com panos, cachecol, o Símbolo da Ordo Calamitas no peito; arma: DUAS MACHADINHAS com talhos
        azuis LIGADAS POR UMA CORRENTE; habilidades da ficha: NADA PESSOAL (+1 dado ao trair) e CÓDIGO (sussurra mensagens);
        energética e debochada. Transformação canônica (Calamidade ep. 6): veste a MÁSCARA DO DESESPERO e vira A MAGISTRADA —
        **com os MESMOS PODERES da Magistrada das Relíquias, mas a APARÊNCIA dela** (pedido do dono; como o Anfitrião do
        Arnaldo × o Anfitrião separado).
        Feito: o modelo `tools/blender/char_celestine.py` → `public/models/celestine.glb` (sculpt_lib; revisado no Blender),
        as MACHADINHAS (`weapons.js chainHatchet`) e a MÁSCARA DO DESESPERO (`despairMask`) em código, `addCelestineProps` /
        `addCelestineMagistradaProps` e as variantes `celestine` / `celestine_magistrada` em `models/index.js`, as texturas
        `face_celestine` e `shirt_celestine` (o Símbolo da Ordo Calamitas), o visual `hatchet` do arremesso e as cenas de
        agarrão. **Falta:** `characters/celestine.js` (machadinhas: combo duplo, □ = a machadinha na corrente que puxa,
        Corrente Giratória, Nada Pessoal, Código, Endorfina; especial "Duelo Final"), a forma `forms/celestine_magistrada.js`
        (o kit da Magistrada com a aparência dela; maskTransform com a Máscara), a equipe "Ordo Calamitas" (cor, ordem), as
        falas (intro e vitória contra o elenco), a CPU, o check e os testes no jogo.
      - [x] **EQUIPES DUPLAS (2026-10-27)**: `teams` no personagem = outras equipes além da `origin` (que decide o grupo na seleção e a cor do retrato); aparecem como etiquetas extras no cartão, na ficha, nos golpes e no filtro da página Sobre (`config/teams.js defTeams`). Marcados: Celestine (Portadores + Ordo Calamitas), Arnaldo (Portadores + Ordo Realitas), Henri (Mascarados + Escriptas), Juan Portador (Portadores + Mascarados). A equipe Luzidios saiu (não existe no jogo).
      - [x] **FALAS (v3.52.0)** — introduções pela voz de cada personagem (`introVoices.js`), falas contra o Anfitrião e as
        dele no tom irônico (`hostLines.js`); **LEVITAÇÃO** corrigida (interrompida, as pedras caem; mais rápida).
      - [x] **GAIUS (2026-10-29)** — o primeiro da ORDO CALAMITAS (grupo próprio entre os Portadores e as Relíquias): o velho
        guerreiro da maça de ferro (Maça Arremessada, Golpe do Veterano, ANULAR — a habilidade canônica que anula as
        habilidades usadas contra ele —, Carga do Veterano, Cansado Mas Firme, passiva Couro Velho, especial Ciente da
        Própria Força). Transformação canônica: a Relíquia de Energia no rosto → AMPHITRUO. Na seleção, RB/LB troca entre os
        dois; o Anfitrião das Relíquias agora tem a aparência do Amphitruo (o do Arnaldo continua só como transformação).
        Modelo `char_gaius.py` (variante `amphitruo`: a máscara sorridente com as três mãos de metal e as chamas roxas).
      - [x] **AMALIA (2026-10-31)** — a segunda da ORDO CALAMITAS: "A Flecha" (wiki "Amalia"), a arqueira de Calamidade. Modelo
        `char_amalia.py` pela miniatura (capuz e manto verdes, cachecol, ombreiras pontudas, as fivelas até o pescoço, o
        pano com o Símbolo, a aljava, a cicatriz em cruz e os olhos acesos na textura) + o ARCO verde de pontas brancas e a
        AURA CIANO em código. Kit pela ficha: Flecha Flamejante (□), LONGA-DISTÂNCIA (de longe, ninguém esquiva nem
        defende — `longRange` nos projéteis), Chuva de Flechas, ALTRUÍSMO (sacrifica vida: na equipe as assistências voltam;
        sozinha, sanidade e esquivas), Flechas Caóticas, a passiva CAÓTICA (a cada 2 flechas que acertam, cura), o especial
        "Não Perde a Cabeça!" e a Transformação Memória Revivida. Falas (voz própria, cenas com Celestine, Gaius e Joui, e
        vitórias contra o elenco inteiro), agarrão, retrato da página Sobre, CPU como atiradora.
        2026-10-31: CHUVA DE FLECHAS pelo pedido do dono — mira para o CÉU (clipe `bow_shot_up`), a ÁREA fica marcada no
        chão em volta do alvo (círculo pulsando) por 0,9 s antes da queda: sair do círculo escapa (0 de dano), defender
        segura (24 em vez de 62).
        2026-10-31: a FLECHA mais ligeira (pedido do dono, "atira meio devagar"): preparo 0,34 → 0,2 s, recuperação
        0,24 → 0,16 s, recarga 1,8 → 1,0 s, voo 38 → 46 m/s, dano 28 → 25; Flechas Caóticas com preparo 0,16 s e 0,1 s
        entre as flechas.
      - [ ] **ORDO CALAMITAS**: Faustus, Marius, Remus (Marcados) e Cascadia (Cornelius, Karise e Marcellus ficam de fora — decisão do dono, 2026-10-31)
      - [x] **O MODELO DAS MÁSCARAS** (feito em 2026-10-27: modelo próprio `tools/blender/char_seita.py` → `public/models/seita.glb` — túnica branca longa com as regiões pretas, capuz, pelerine, forca no pescoço, corda na cintura e os Símbolos tatuados nos antebraços, como na wiki; as máscaras em 3D, uma por membro: Nathaniel, riscada de vermelho, preta e a do sorriso — `weapons.js seitaMask`) que a Magistrada chama (os membros da Seita das Máscaras) — refazer na técnica atual
        (pedido de 2026-10-27).
- [x] **SKIN do ANFITRIÃO do ARNALDO ≠ ANFITRIÃO base** — entregue na v3.52.0: o Anfitrião selecionável das Relíquias tem o
      visual do AMPHITRUO (o Gaius); o do Arnaldo continua com o visual do Arnaldo.
- [x] **O ESTRANGEIRO: a TRANSFORMAÇÃO pelo cânone** (2026-10-30) — a wiki não tem forma nova para ele; "Incubar" é a
      habilidade canônica e agora faz o que a wiki diz: a LARVA vai na cabeça do adversário (exposto: +12% de dano
      recebido; a sanidade não volta e escoa 3/s); zerada, ECLODE (90 de dano e um Doppelganger sai dela) e outra larva
      entra 8 s depois. Corrigido junto: `energyRegenMult: 0` era ignorado (como o `takenMult` 0).
- [x] **O ESTRANGEIRO: melhorar a ABDUÇÃO** (pedido e entregue em 2026-10-31). Agora (`abducao_luz`, R2 + △, tipo
      `abductBeam`): o FEIXE DE LUZ verde desce do céu (cone largo, miolo forte girando, o disco aceso lá em cima e as
      partículas subindo) e SEGUE o alvo devagar no aviso (`follow` 2,2 m/s: correndo, ele escapa); quem é pego FLUTUA
      GIRANDO no meio da luz por 1 s (`hover` 2,6 m) entre os estalos da interferência de sinal (som novo
      `signalStatic`), é cravado no chão e volta com o ESQUECIMENTO (`forget`: −15 de sanidade e DESORIENTADO — o
      movimento invertido — por 1,8 s, "O QUE ACONTECEU?"). O Suspender do Kian (`sigils`) continua como era.
- [x] **O Portador do Trono** (`char_diabo.py`, 2026-10-31) revisto pela "Arte Completa Cinematic O Portador do Trono" e a
      wiki: os CHIFRES pelo cânone (o par anelado subindo + o par em FOICE descendo; saiu a galhada clara), a COROA DE
      ESPINHOS dourada em leque atrás da cabeça, as ASAS DE BRAÇOS mais densas e ramificadas, os músculos do tronco, os
      braços mais finos e as pernas de BODE com o jarrete bem para trás e o pelo em relevo.
- [x] **ESPECIAIS PRÓPRIOS** (pedido de 2026-10-31: "Amalia ainda não tem um especial próprio"). Hoje 17 usam o
      especial genérico `cinematicCombo` (avança e dá uma sequência de golpes, às vezes com um extra): Aguiar, Amalia,
      Balu, Celestine, Cristopher, Dalmo, Ferreiro, Gaius, Gal Sal, Guizo, Jae, Juan, Lírio, Magistrada, Raziel,
      Veríssimo e Xande. Cada um precisa de um especial com a identidade dele (pelo cânone), como os que já têm tipo
      próprio (Ato Final do Arnaldo, Supernova da Erin, Inexistir do Kian...). Começar pela AMALIA (arqueira: o especial
      de corpo a corpo não combina com ela).
      [~] 2026-10-31: AMALIA feita — "Não Perde a Cabeça!" (`specials/headshot.js`): puxa o arco com a aura ciano (close
      dos olhos acesos), a chuva de flechas cai em volta do alvo e o prende, e a Flecha Flamejante final vai na CABEÇA
      (206 de dano, de perto e de longe).
      Revisão de 2026-10-31 (o que cada `cinematicCombo` tem de próprio):
      - JÁ TÊM IDENTIDADE (o combo com extras próprios): Gal Sal (aproximação, corrente, Sigilos, tiros, previsão),
        Guizo (a câmera de filmar, as cópias), Raziel (o banquete, dreno de sangue), Magistrada (a esfera de sombras).
      - [x] GENÉRICOS (só a sequência de golpes): Veríssimo, Xande, Aguiar, Ferreiro, Celestine, Gaius, Balu, Lírio
        (Balu e Lírio com os MESMOS golpes), Cristopher, Dalmo, Jae, Juan (e o Juan no Ódio, só com sangramento).
        Feito em 2026-10-31 — o `cinematicCombo` ganhou peças novas (pacto de sangue, Anular, corrente/corda presa,
        golpe pelas costas, sumiço, armadilha, X no chão, roubo de energia, onda de pressão, chão rachando, estados no
        alvo depois da cena) e cada um ficou com a identidade do cânone:
        BALU paga o Machado Demônio com o sangue, derruba na ombrada (Derrubar e Atacar), marreta o alvo caído e fecha
        no 110%; LÍRIO laça com as Amarras de Sangue, Mão Pesada, cabeçada e ergue a Leonora devagar para o Golpe
        Pesado; CELESTINE prende com as duas machadinhas na corrente e corta pelas costas ("Nada Pessoal"); GAIUS
        ANULA (estados ruins, projéteis e a habilidade do adversário) e o alvo sai ANULADO (sem habilidades por 4 s);
        VERÍSSIMO lê as brechas (Inteligência Estratégica): o alvo sai ANALISADO (+20% de dano) e as assistências ficam
        prontas; FERREIRO bebe a energia do alvo com a Espada Consumidora e o deixa CONSUMIDO; XANDE chega de skate, a
        Velocidade Mortal e o taco na corrente; AGUIAR puxa na corda para a armadilha de urso e o deixa sangrando;
        CRISTOPHER faz a cena de ação (chutes, pulo nas costas, Suplex de Dublê) e se recupera um pouco; DALMO segura
        o crânio (o fim das arenas) e o alvo fica ATORDOADO; JAE some, surge nas costas e deixa o X, CEGO e sangrando;
        JUAN se corta, o Vínculo de Sangue prende os dois e a Faca Predadora bebe até o Descarnar. (O Juan no Ódio não
        usa especial de golpes: o dele é o Renascimento.)
- [x] **A MAÇA DO GAIUS pela série** (feita em 2026-10-31: `weapons.js ironMace` refeita pela arte, a mão segura perto do pomo) (pedido de 2026-10-31): a arte oficial (wiki, "Maça de Gaius em Calamidade") é uma
      maça de ABAS — cabo longo escuro com o couro enrolado em diagonal, anel no colarinho, cabeça prateada com 6 abas
      pontudas em forma de lâmina, uma ponta no topo e uma pontinha no pomo. A do jogo era uma bola com caixinhas.
- [ ] **MELHORAR O MODELO DO PORTADOR DO TRONO** (pedido de 2026-10-31) — a evolução do Diabo (o Juan no ódio → O Diabo →
      o Portador do Trono). A revisão acima (chifres, coroa de espinhos, asas, pernas de bode) ainda não basta: refazer o
      corpo na técnica atual (`sculpt_lib`) pela "Arte Completa Cinematic O Portador do Trono" e a wiki, para ele ler como
      a forma final e mais forte da linha do Diabo — maior e mais monstruoso que O Diabo, sem perder o kit e as juntas.
- [x] **O AMIGO IMAGINÁRIO: melhorar os PODERES e o CÂNONE** (pedido de 2026-10-31) — revisto pela wiki "Amigo
      Imaginário": o AGARRÃO (antes "Tentáculos que Prendem", poça debaixo do alvo — invenção) agora sai de baixo do capuz
      e PUXA a vítima até a criatura, a deixa para o Derreter; no Frenesi de Sangue, irritada, ARREMESSA longe (40, ~8 m).
      O DISSOLVER (antes virava poça intocável e se curava sozinho — invenção) agora AGARRA quem está colado e o ABSORVE:
      cura exatamente o dano que causou (testado: 59 de dano → 59 de vida; errou, nada). O SINO no Frenesi soa distorcido
      e a vítima MORDE A SI MESMA (16 + sangramento). Derreter, Garras e os Bichos da Ilha já batiam com o cânone.
      Ainda sem cânone no jogo: "quem foi afetado pelas pinturas não consegue se afastar" (sem pinturas no jogo).
- [ ] **NOVOS PERSONAGENS — O SEGREDO NA ILHA** (pedido de 2026-10-31): os protagonistas da campanha (levantar na wiki
      quem são e o que fazem antes de modelar).
- [x] **NOVOS PERSONAGENS — OS CINCO** (pedido de 2026-10-31; grupo completo e especial de grupo na v4.8.0 — sobram só a
      PROPOSTA das submetralhadoras e o polimento dos modelos, abaixo): completar o grupo. No jogo: Xande, Guizo e Lírio; faltam
      (pela wiki, `lore/MEMBROS.md`) Dara Alice Venturini (Médica de Campo), Francisco "Chico" Albuquerque (Técnico) e
      Morato Vertaler (o líder). O Voytek Nowak fica de fora (decisão do dono, 2026-10-31). Com o grupo completo, entra o
      especial de grupo dos Cinco.
      - [x] **DARA** (v4.6.0, 2026-11-01): `src/characters/dara.js` + `tools/blender/char_dara.py` → `public/models/dara.glb`
        (1,57 m, faixa ciano, gargantilha, sobretudo preto, blusa verde com os óculos de aviador vermelhos, bandoleiras,
        lanterna UV, radar, alicate, walkie-talkie no braço, a bolsa grande, as meias vermelha e ciano). Do cânone:
        Paramédico (△ + ○, cura), "ótima investigadora"/Perito (△ + L2 Olho de Investigadora, `analyze`) e Dedicação
        (R2 + △: aguenta 2 golpes e recupera as esquivas). PROPOSTA: punhos, □ Lanterna UV (`photoFlash`, cega 1,4 s),
        especial Bolsa de Emergência e a Transformação "Ninguém Fica Pra Trás". Elemento Medo (sem afinidade, como o
        Veríssimo). Falas com todo o elenco e agarrão próprio.
      - [x] **CHICO** (v4.7.0): `src/characters/chico.js` + `tools/blender/char_chico.py`. Cânone: Farol da Van (△ + ○,
        cega), Scanner de Energia (△ + L2), Joias de Escudo Mental (passiva `iKnewIt`), Remendão (R2 + △). PROPOSTA: □ Pulso
        do Scanner, especial Conexão Neural, Transformação Engenhosidade. Balanço: 6×8 contra o elenco de teste.
      - [x] **MORATO** (v4.7.0): `src/characters/morato.js` + `tools/blender/char_morato.py`. Cânone: a METRALHADORA (□,
        prop `machineGun`), "Tamo com Ele" (△ + ○), Larva da Fúria "Calabresa" (△ + L2). PROPOSTA: Linha de Frente,
        especial Pelos Cinco, Transformação Último Sacrifício, passiva "Ainda de Pé" (`revenge` com `label`). Balanço: 6×9.
      - [x] **A VAN DOS CINCO do Chico** (pedido do dono, v4.7.0): △ + □, `stuntCar` com `vehicle: 'van'` — a van do
        Acampamento vem por trás com a DARA no volante e atropela (PROPOSTA). Testada: 85 de dano.
      - [x] **ACAMPAMENTO — fogueira pisável** (pedido do dono, v4.7.0): `fireZones` (1 de dano/s; 2/s em criatura de Morte).
      - [x] **CENÁRIO ILHA DE TIPORA** (pedido do dono, v4.7.0): `tools/blender/arena_tipora.py` — a praça do vilarejo (só a praça,
        sem interiores), igreja no morro ao norte com o cemitério, lampiões, a mata entre a vila e a MANSÃO DOS MORETTI no
        penhasco e o FAROL na praia (facho girando, `beacons`); distâncias pelo mapa da ilha. A refinar: mais casas do
        vilarejo pela lista da wiki, a Torre do Sino / Tenebris como evento do mapa, a Tinta.
      - [x] **MORATO — as MAGRAS na Calabresa** (pedido do dono, 2026-11-01): as Amarras de Sangue "Magras" eram do Morato
        antes de ele dar ao Lírio, então a Larva da Fúria "Calabresa" agora estala as MESMAS Magras do Lírio (`bloodBind`
        com `gut`, tripas trançadas e voltas no corpo) e, em seguida, ele engole a Calabresa (`buff` no bloodBind →
        `applySelfBuff`). Testada: prende o alvo e liga o ódio.
      - [x] O especial de grupo dos Cinco (Xande, Guizo, Lírio, Dara, Chico e Morato) — feito na v4.8.0 (`teamSpecials.js os_cinco`; ver "OS CINCO — especial de grupo" na seção dos especiais de grupo).
      - [x] **SUBMETRALHADORAS da Dara e do Chico** (v4.11.0, 2026-11-02; pedido do dono). Cânone (wiki, Arsenal de cada
        um): Dara — "submetralhadora personalizada de cor vermelha e azul, com um chaveiro de um emoji sorrindo"; Chico —
        "Mac 10 com um detalhe vermelho na parte superior e dois fios coloridos ligando ela ao Chico". Viraram o □ (rajada
        de 5×8 e 6×7, mais fraca que a metralhadora do Morato; `weapons.js daraSmg/mac10`, na mão só no □). Os fios do
        Chico vão da arma ao quadril e seguem a mão a cada quadro (cores vermelho/azul: PROPOSTA). O que era □ virou
        habilidade (PROPOSTA de comando): Lanterna UV no △ + □ da Dara, Pulso do Scanner no R2 + × do Chico.
        - [x] Usadas na coreografia de Os Cinco (v4.12.1): o Chico solta o pulso do scanner e emenda uma rajada da
          Mac-10; a Dara abre com a rajada da submetralhadora, acende a Lanterna UV e fecha no soco (`sceneProps` com a
          `smg` dos dois; o dano de cada um é dividido entre as partes).
      - [x] **ESPECIAIS PRÓPRIOS PELO CÂNONE** (v4.12.0, 2026-11-02; pedido do dono: "escolha o melhor especial pra cada
        um"). Revisados os 39: os outros já tinham especial com a identidade do cânone (revisão de 2026-10-31); estes
        quatro ainda usavam um especial genérico ou emprestado. Fonte: os resumos de episódio da wiki (os vídeos não
        dão para assistir daqui). Nomes e números: PROPOSTA.
        - Carniçal — **Controle Absoluto** (wiki: o controle "é absoluto", a vítima ataca a si mesma, como Brúlio, e chora
          Lodo): o Símbolo Espiral acende, o alvo se golpeia 3× com os PRÓPRIOS golpes e leva UMA Garra da Morte; sai
          LENTO. Antes: a sequência de garras do Raziel.
        - Morato — **Pelos Cinco** (Sinais do Outro Lado, ep. 7: segura a horda com a metralhadora e engole a Calabresa
          contra o Estrangeiro): duas rajadas, a Calabresa e a investida de ombro; deixa as assistências prontas.
        - Chico — **Mina de Proximidade** (wiki: a mina armada com a Dara contra o Interflorado, "Chico a explodindo"; a
          granada de FUMAÇA contra o Fummu): fumaça, mina no pé do alvo, rajada da Mac-10 e a explosão; o alvo sai cego.
          Isso resolve a dúvida da "granada do Chico": no cânone é de fumaça, e a explosão é a mina.
        - Dara — **Racha** (wiki: a motorista dos Cinco, segura a van na batida e ganha um racha): ela pega a van,
          atropela, dá o cavalo de pau e volta na segunda passada (`specials/racha.js`; ~250 de dano nas duas).
        - Motor (`cinematicCombo`): `standOff`, `selfStrike`, `tears`, `rage`, `burst`, `closeIn`, `smoke`,
          `mine`, `boom`; o close de rosto do 'control' mira a altura real da cabeça (o Carniçal é mais alto).
      - [x] **CARNIÇAL REFEITO SOBRE UMA BASE CC0** (pedido do dono, 2026-11-01, Blender MCP): o corpo masculino realista e o
        crânio realista do pacote "Human Base Meshes" da Blender Studio (CC0, `assets_src/README.md`) encaixados no
        esqueleto de lutador (`tools/blender/base_body.py`: armadura temporária com pesos automáticos, os mesmos pesos vão
        para o jogo). Por cima: fibras de Lodo por deslocamento seguindo cada músculo, cristas pálidas e o vermelho no
        trapézio/costas/dorsais (referência do dono), cintura fina, dedos longos até o meio da coxa, garras, tendões
        enrolados, o topo do crânio rompido com o cérebro rosado, o Símbolo Espiral na testa e SEM MANDÍBULA de osso: a
        mandíbula é de LODO (fios que escorrem até o pescoço). A refinar: menos contraste das estrias sob a luz das arenas.
      - [x] **CARNIÇAL COM O KIT FRIO** (pedido do dono, 2026-11-01; wiki: "calmo e preciso", controla quem o ataca pela
        Hipnose e faz atacar a si mesmo, como Brúlio): △ + ○ Hipnose Espiral nova (`spiralSelfHarm`: quem OLHA para o
        Símbolo entra em transe, chora Lodo, se golpeia 2× e fica LENTO), □ Lágrimas de Lodo (PROPOSTA: deixa LENTO) no
        lugar da Investida Mortal, anda mais devagar (7,4). Mantidos: Salto, Pancada Poderosa, Comando, garras no combo e o
        Instinto Mortal (quando ferido vira o bicho). A fazer: a passiva "olha para o agressor" (hipnose de contra-ataque
        ao apanhar, como no cânone) e a Investida Mortal dentro do Instinto Mortal.
      - [~] Modelos refeitos pelas artes da wiki (2026-11-01, Blender em modo background + prévias): Dara (bracelete dourado, gola branca, bolsas nas coxas; cores pelo texto da wiki: blusa esverdeada, calça marrom, sobretudo preto),
        Chico (macacão bege da wiki, visor colorido na testa, scanner aceso, walkie de luz azul), Morato (dreads em coque, faixa de pontas longas, camuflado,
        mochila). Polir mais pelo Blender MCP com o dono (o MCP caiu depois de um `read_homefile` — não usar isso).
- [ ] **FUTURO PERSONAGEM — CALISTO, EM DUAS VERSÕES** (pedido do dono, 2026-11-01; só no TODO por enquanto): a versão de
      **Sinais do Outro Lado** e a versão do FUTURO, de **Enigma do Medo**, como versões do mesmo personagem
      (`VERSION_GROUPS`). Antes de modelar: análise das habilidades ANTES e DEPOIS pela wiki (rituais, poderes,
      itens, armas, visual e personalidade de cada época) e o que muda entre elas no jogo (□, habilidades, especial,
      Transformação). Marcar como PROPOSTA o que não for do cânone.
- [ ] **NOVOS PERSONAGENS — ENIGMA DO MEDO** (pedido de 2026-10-31): **MIA + LUPI** (a protagonista e o cachorro, como
      dupla) e **JASER**, com a versão melhorada **O DESASSOMBRADO** (forma/transformação dele). Levantar na wiki o
      visual, os itens e os poderes de cada um antes de modelar.
- [~] **ATUALIZAÇÃO FUTURA — CENÁRIO "O PALCO DO ANFITRIÃO"** (pedido de 2026-10-31). **Feito em 2026-11-01 (v4.5.0):**
      o cenário (`tools/blender/arena_palco.py` → `public/arenas/palco.glb`: chão roxo com o Símbolo aceso, muro do
      pódio com friso dourado, arquibancada em anel, estandartes, 8 tochas de chama de Energia com luz roxa, dois
      pódios); a PLATEIA de ~400 Anfitriões (casacão, máscara de gás, olhos roxos) em 4 poses, em 14 grupos `CROWD_`
      que pulam com a empolgação (`arena.cheer` em glbArena.js: golpe forte, combo, especial e K.O. agitam; o quase-K.O.
      silencia); o NARRADOR (`src/arena/palcoHost.js` + `config/palcoLines.js`: abertura, primeiro sangue, golpe forte,
      combo, especial, transformação, quase-K.O., K.O., sem repetir a fala seguida e sem atropelar as falas dos
      lutadores) e os EVENTOS a cada 24–34 s, iguais para os dois (mais rápidos, tudo dói mais, só golpe físico,
      sanidade de presente). **Falta:** trocar as POSES da plateia por evento (hoje ela só pula/para), vaia e grito
      (só o aplauso no K.O.), o CLOSE da câmera na plateia na habilidade Plateia do Anfitrião (hoje a plateia do mapa só
      se levanta junto) e conferir no celular. v4.5.1: o narrador PROVOCA um dos lutadores a partir do 2º round
      (`PALCO_LINES.tease`: Arnaldo, Gaius, Celestine, Magistrada, Kian, Dante, Erin, Veríssimo, Diabo, Juan, Anfitrião,
      Amphitruo, Carniçal, Amigo; os outros com a provocação geral). Os jogos do Calamidade ep. 6 não foram conferidos no episódio (as regras são
      propostas no tom do personagem).
      Um cenário novo inspirado nos JOGOS do Anfitrião em Calamidade ep. 6 (conferir o episódio e a wiki antes de
      desenhar: os jogos, as regras, o que ele fala). É outro mapa, separado do `arena_coliseu.py` atual (o de areia
      ao entardecer, sem plateia).
      - **Visual:** um COLISEU todo em ROXO (pedra, arquibancadas e estandartes), iluminado por TOCHAS com as chamas de
        ENERGIA (as mesmas `energyFlames` das miniaturas; a luz delas tingindo a arena).
      - **A plateia de ANFITRIÕES:** as arquibancadas cheias de Anfitriões (o modelo dele, em instâncias para pesar pouco)
        em poses variadas — aplaudindo, de braços para cima, gritando, de pé, sentados, apontando — e a plateia REAGE à
        luta: golpe forte, combo grande, especial, quase-KO e KO mudam as poses e o som (aplauso, vaia, grito, silêncio
        de expectativa).
      - **EVENTOS ALEATÓRIOS do mapa:** de tempos em tempos o Anfitrião anuncia um evento (ideias a fechar pelo cânone:
        regra nova por alguns segundos, o botão dele, uma armadilha na arena, a plateia jogando coisas, chão que muda,
        "só vale golpe X"); aviso antes, duração curta, igual para os dois lutadores.
      - **O NARRADOR (o Anfitrião):** fala durante a luta em faixa de texto (e som), comentando a luta, ZOANDO os
        lutadores (frases por personagem, ácido como ele é), anunciando os eventos e narrando os momentos (primeiro
        sangue, combo, transformação, especial, KO). Reaproveitar o sistema de falas (`config/introVoices.js` /
        `dialogues.js`) com um bloco próprio do narrador; sem repetir a mesma fala seguida.
      - **Jogar COM o Anfitrião nesse mapa:** sem vantagem nenhuma; ele só segue sendo o narrador do mapa (pode ganhar
        falas próprias de "narrar a si mesmo").
      - **A habilidade da PLATEIA** (`hostAudience`, combat/hostAbilities.js — ele se curva e a plateia aplaude): NESTE
        mapa a câmera corta para um CLOSE dos Anfitriões da arquibancada aplaudindo e volta.
      - [x] **A Plateia FORA do Palco** (v4.14.1): nas outras arenas 8 Anfitriões se materializam em volta da arena
        (clarão neon, um a um), batem palmas durante a cena e o buff, e somem; ele se curva para o mais perto da câmera.
      - Técnico: o cenário em `tools/blender/arena_*.py` (a técnica atual); a plateia como modelos instanciados com
        algumas poses prontas (trocadas por eventos da luta); os eventos e o narrador num módulo do mapa ligado ao
        Match/World (desligado nos outros cenários); conferir desempenho no celular.
- [~] Os outros que ainda não usam a técnica atual (`char_*.py` sem `sculpt_lib`, conferido em 2026-10-26): Aghata, Amigo,
      Dalmo, Erin, Estrangeiro, Ferreiro, Guizo, Jae, Labirinto e Magistrada (fora o Portador do Trono acima; o Manancial
      foi refeito em 2026-10-26).
      2026-10-31: ACABAMENTO COMUM (`sculpt_lib.cloth_pass` / `hair_pass`) em Aghata, Dalmo, Erin, Ferreiro, Guizo, Jae e
      Labirinto — as dobras do pano e os fios do cabelo em relevo, sem mudar a forma (os .glb ~20% maiores). Magistrada,
      Amigo e Estrangeiro revistos pelas artes (acima). Um refazer completo de cada um pela arte oficial (como o do
      Veríssimo) continua possível, um por vez.

# EQUIPE — BARRA DE EQUIPE E ESPECIAIS EM EQUIPE

Pedido de 2026-10-17 (inspirado no Naruto Storm 4). Vale só na **batalha em equipe** (líder + 2 assistências). Por
enquanto é documentação; a implementação vai por fases (abaixo).

### Barra de Equipe
- Uma barra por lado, embaixo do painel do líder, que **enche quanto mais o jogador usa as assistências**.
  Balanceamento (v3.32.0): cada chamada de assistência **+6%**, cada troca **+3%** — cerca de 17 chamadas para encher,
  ≈ uma vez por partida (o Especial em Equipe é raro). Não esvazia sozinha; reinicia a cada partida (não a cada round).
- **Cheia + Transformação** (segurar △ com a Barra de Transformação pronta): o líder **e as assistências** se
  transformam juntos — as assistências que têm forma (Dante → Olhos Abertos, Arnaldo → Anfitrião etc.) aparecem
  transformadas até o fim do round. **Gasta a barra inteira.**
- **Cheia + △ △ △ ○**: o **Especial em Equipe**. **Gasta a barra inteira** (e a sanidade do especial normal).
  Sem a barra cheia, △ △ △ ○ continua sendo o especial normal (△ △ ○).
- O comando usa a mesma janela curta da Carga (0,45 s entre os toques, v3.31.0): os três △ precisam ser seguidos.

### Especial em Equipe — dano
- **Dano = especial normal do líder + 100** (com o especial base de 250: 350). Não é a soma das partes: os golpes das
  assistências entram dentro desses +100 (cada parte delas tem dano limitado), e o especial do líder sai inteiro.
- O alvo não pode defender nem fugir depois que a primeira parte acerta (como o especial normal).

### Especial em Equipe SIMPLIFICADO (quem não tem ligação na lore)
1. A assistência 1 entra e dá uma sequência de socos **ou** a habilidade △ → ○ dela;
2. a assistência 2 entra e faz o mesmo;
3. o líder fecha com o **próprio especial** (△ △ ○).

### Especiais CUSTOMIZADOS (ligação na lore) — regra de prioridade
Cada equipe tem um especial próprio só quando os personagens têm **ligação na lore**. Ordem (a primeira que valer):
1. **Os 3 do mesmo grupo com especial de grupo** (ex.: 3 Mascarados) → o especial do grupo, em que **aparecem todos os
   membros do grupo** (mesmo dano de qualquer Especial em Equipe; muda só a animação).
2. **Um trio com especial próprio** (ex.: Joui + Kaiser + Arthur) → o especial do trio.
3. **Uma dupla com ligação** (ex.: Cristopher + Kaiser) → o terceiro (sem ligação) **ataca primeiro** (socos ou a
   habilidade dele) e depois a dupla faz o **especial dela**. Se houver duas duplas possíveis, vale a que tem o líder.
   Uma dupla de um grupo **não precisa do grupo completo** para ter o especial dela.
4. **Ninguém ligado** → o simplificado.

Exemplos do Storm 4 que serviram de base: Naruto + Sasuke + Kiba → o Kiba ataca e Naruto e Sasuke fazem o especial
deles; Pain + Konan + Hidan → o especial da Akatsuki; Pain + Konan + Sasuke → o especial do Pain e da Konan (o Sasuke
ataca antes).

### Ligações (a tabela vai para `src/config/teamLinks.js`)
Confirmadas pelo pedido:
- [x] **Joui + Kaiser + Arthur** — virou o grupo **FORÇA D** (a equipe de Desconjuração; pedido do dono: a Equipe Abutres
  é a de Calamidade, sem o Kaiser). Vale com 3 da equipe. (2026-11-02) Thiago e Liz NÃO são da Força D. Joui surge
  atrás e corta, Kaiser a rajada de Balas Amaldiçoadas, Arthur o tiro do Rebirth (verde); o líder fecha com o especial.
- [ ] **EQUIPE E** (Segredo na Floresta: Arthur, Kaiser e Joui MAIS NOVOS, Thiago e Liz) — correção do dono (2026-11-02):
  o especial da Equipe E só entra quando existirem as versões jovens do Arthur, do Kaiser e do Joui. Até lá, o Thiago e a
  Liz podem entrar no elenco como lutadores da Ordem (sem ligação de equipe).
- [x] **Cristopher + Kaiser** — especial de dupla "A Muralha e o Disparo": o terceiro ataca primeiro, o Cristopher dá a
  ombrada e SEGURA o alvo e o Kaiser (o filho) dispara.
- [x] **Mascarados** (Dalmo, Aguiar, Jae, Kemi, Labirinto, Juan) — especial de grupo com 3 ou mais na equipe: os seis
  aparecem em roda em volta do alvo (os de fora da equipe entram como convidados) e golpeiam um após o outro.
- [x] **Ordo Calamitas** (2026-10-31, escolha do dono) — grupo com 3 na equipe (Celestine, Gaius, Amalia; Faustus,
  Marius, Remus e Cascadia entram quando estiverem no elenco): a Celestine cruza as lâminas, o Gaius dá o corte final
  do gládio em energia roxa e a Amalia atira a Flecha Flamejante. Testado: 306 de dano, sem erro.
- [x] **Arnaldo + Veríssimo** (2026-10-31, escolha do dono) — dupla "A Espada da Fita Vermelha" (os melhores amigos, a
  mesma espada): o Veríssimo abre a guarda com a estocada (BRECHA NA GUARDA) e o Arnaldo fecha com o rodopio da fita.
  `link.order` define quem entra antes. Testado com o Arnaldo e com o Veríssimo de líder (335 / 347).
- Escriptas, outras duplas da Ordo Realitas e Portadores: o dono decidiu esperar ter mais personagens de cada equipe
  (2026-10-31).
- [x] **FORÇA D — coreografia** (2026-11-02): Kaiser em close conjura a Cinerária e envolve a cena em névoa; Joui surge
  atrás do alvo e as espirais da espada marcam o corte; Arthur atravessa a névoa correndo e ataca com a Arma de Sangue.
  Efeitos visuais substituem cigarro/modelagem novos.
- [x] **Equipe Abutres — especial de grupo** (2026-11-02): coreografia jogável com Dante, Balu, Joui e Arthur, usando
  lodo, machado, katana e Arma de Sangue. [x] Carina Leone (v4.17.0) entra no fim com o mangual e a Glock. [x] Rubens
  Naluti (v4.18.0) fecha com o Salto Fantasma e a martelada.
- [ ] **Balu + Rubens — especial de dupla** (pedido do dono, 2026-11-02; os dois amigos dos Abutres): o Balu avança
  para bater gritando **"RUBINHOO! VAMOS DAR UMA COÇA NELE!"**, o Rubens responde **"É RUBENS!"** e entra junto,
  ajudando a bater. Entra como `kind: 'duo'` em `config/teamLinks.js` (com `order`: o Balu primeiro). **As habilidades
  e golpes que cada um usa na cena serão escolhidos com o dono antes de implementar.**
- [x] **OS CINCO — especial de grupo** (2026-11-02): Morato comanda e dispara a metralhadora; Chico combina pulso do
  scanner e clarão do farol; Xande avança de skate com o taco; Lírio prende com as Magras e golpeia com a Leonora; Guizo
  registra com a câmera e corta; Dara usa a lanterna UV e finaliza no corpo a corpo. Mantidos os itens e habilidades
  canônicos, sem granada ou ritual inventado.
- [x] **A Plateia** é só do ANFITRIÃO e do AMPHITRUO (o Amphitruo herda o kit do Anfitrião) — conferido em 2026-11-01.

### Fases
- [x] **F1** Barra de Equipe: enche com as assistências (+6) e trocas (+3), aparece na HUD (e no toque), reinicia por
  partida (`COMBAT.teamGauge`, `Fighter.addTeamGauge`).
- [x] **F2** △ △ △ ○ com a barra cheia → Especial em Equipe **simplificado** para todo mundo (+ a IA usando; no toque, o
  botão ESPECIAL vira o de equipe com a barra cheia). `abilities.js teamSpecial`, `COMBAT.teamSpecial` (bônus 100).
- [x] **F3** Transformação em equipe com a barra cheia (2026-10-25): gasta a barra; quem tem forma entra com o modelo e a
  ficha dela (Dante → Olhos Abertos...), quem só desperta entra com aura e +25% de dano; dura até o fim do round ou até
  entrar em campo numa troca. Cinemática do tríptico (`HUD.teamCut`, referência do dono: três painéis inclinados com
  linhas na cor de cada um).
- [x] **F4** (2026-10-26) `teamLinks.js` ligado ao Especial em Equipe com a regra do TODO (grupo > trio > dupla; duas
  duplas → a do líder) e os três primeiros especiais customizados (`combat/teamSpecials.js`): banner e painéis da
  ligação (versão curta, para não esconder os golpes), golpe próprio de cada membro, o líder fecha com o especial dele e
  o dano é o mesmo de qualquer Especial em Equipe. Testado: as três ligações + a equipe sem ligação (simplificado).
  **Versões do mesmo personagem** (pedido): uma versão nova é uma ficha com `baseId`; na ligação, `'kaiser'` vale para
  qualquer versão e `'kaiser_calamidade'` só para ela; duas versões na mesma equipe contam como um membro; com várias
  ligações valendo, ganha `priority` > grupo/trio/dupla > a mais específica > a do líder (testado com ligações de teste).
- [x] Telas: a placa da seleção da equipe mostra "ESPECIAL EM EQUIPE · <nome>" (tracejado enquanto o cursor completa a
  ligação, cheio quando ela está escolhida), no PC e no celular.

---

# 3. LIMPEZA E SAÚDE DO PROJETO

## Git

* [x] Procurar arquivos temporários
* [x] Procurar código morto
* [x] Procurar imports antigos
* [x] Procurar arquivos duplicados
* [x] Corrigir referências quebradas

## Validação

* [x] Conferir erros de console
* [x] Conferir warnings
* [x] Testar inicialização
* [x] Testar menu
* [x] Testar seleção
* [x] Testar batalha
* [x] Testar vitória
* [x] Testar retorno ao menu
* [x] Testar reinício
* [x] Testar troca entre modos

---

> Conferido na versão estável (2026-10-08): nada temporário versionado; imports sem uso removidos; build sem aviso
> (textos num chunk próprio); versão compilada testada: menu → batalha → vitória → revanche → menu → treinamento.
> "Procurar código morto" (funções sem uso) fica para depois.
>
> Código morto (2026-10-26, depois da v3.43.0): varredura de todo `src` (arquivos que nenhuma página/ferramenta alcança,
> exports sem uso, declarações locais sem uso). Removidos: `TitleScreen` (+ a chave `title.press` nas 13 línguas e o CSS
> `#title`), `watchChain`, `necktie`, `getCharacter`, `isArenaLoaded`, `learnedStats`, `VOLUME_CHANNELS`,
> `VOLUME_OPTIONS`, `volumeLabel`, `fxLabel`, `FX_NAMES` e o `UP` de `projectiles.js`. Ficam de propósito: `src/dev/*`
> (ferramentas do console), `sw-template.js` (lido pelo `vite.config.js`) e `teamLinks.js` (a F4). O build voltou a sair
> sem aviso: o `main` tinha 878 kB → chunks `modelos` e `especiais` (main 532 kB); versão compilada testada (menu →
> seleção → cenário → luta, galeria) sem erro no console.

# 4. ARNALDO FRITZ / O ANFITRIÃO / SENHOR VERÍSSIMO

Os três **já possuem modelos próprios prontos**.

Não recriar os modelos.

O trabalho pendente é:

* melhoria;
* correção;
* animação;
* rig;
* materiais;
* efeitos;
* câmera;
* IA;
* balanceamento;
* integração final.

---

# 5. ARNALDO FRITZ

## Modelo

* [x] Revisar proporções
* [x] Revisar rosto
* [x] Revisar cabelo/barba
* [x] Revisar óculos
* [x] Revisar roupas
* [x] Revisar relógio
* [x] Revisar espada
* [x] Revisar materiais
* [x] Revisar texturas
* [x] Conferir rig
* [x] Conferir qualidade no jogo

## Animações

* [x] Idle
* [x] Caminhada
* [x] Corrida
* [x] Ataques
* [x] Espada
* [x] Emissor de Pulsos
* [x] Finta Teatral
* [x] Pulso Paranormal
* [x] Rodopio da Fita
* [x] Aniquilador
* [x] Ensaio Geral
* [x] Ato Final
* [x] Transformação
* [x] Vitória

## Combate

* [x] Testar dano
* [x] Testar cooldown
* [x] Testar custos
* [x] Testar hitboxes
* [x] Testar telegraphs
* [x] Testar IA
* [x] Balancear (v4.13.1: 46 → 41 → 36 → 34%, na beirada — `arnaldo` 1.08/0.94)

---

> Finalizado na versão estável: modelo revisado no jogo (sem problema visível), todas as animações existem e rodam,
> pose de vitória própria (`vic_arnaldo`), kit inteiro testado sem erro, CPU usa o kit todo e transforma. "Balancear"
> fica para a etapa de balanceamento.

# 6. O ANFITRIÃO

## Modelo

* [x] Revisar matéria de Energia
* [x] Revisar máscara
* [x] Revisar olhos
* [x] Revisar cabos
* [x] Revisar relógio
* [x] Revisar aura
* [x] Revisar materiais
* [x] Revisar efeitos
* [x] Conferir rig
* [x] Conferir leitura durante combate

## Animações

* [x] Idle
* [x] Movimentação
* [x] Ataques
* [x] Braços de Energia
* [x] Distorção
* [x] Tempo Distorcido
* [x] Transformação
* [x] Vitória

## Combate

* [x] Disparo do Caos
* [x] Regra do Jogo
* [x] Distorção
* [x] Tempo Distorcido
* [x] A Plateia
* [x] ChronoSense
* [x] Jogo do Anfitrião
* [x] Conferir telegraphs
* [x] Conferir counterplay
* [x] Conferir aleatoriedade
* [x] Garantir que aleatoriedade nunca determine um acerto invisível
* [x] Revisar IA
* [x] Balancear (v4.13.1: linha própria `anfitriao` 0.92/1.05 — 75 → 89 → 64 → 63%)

## Personalidade

O Anfitrião deve continuar:

* teatral;
* caótico;
* imprevisível;
* provocador;
* absurdo;
* com humor ácido.

Evitar falas genéricas.

---

> Finalizado na versão estável: as 9 habilidades, □, especial (aviso de 1 s com sigilo no alvo) e agarrão testados
> sem erro; Percepção Anacrônica desvia o 1º golpe e entra em recarga; pose de vitória própria (`vic_anfitriao`);
> corrigida a tela preta do cabo do relógio. "Balancear" fica para a etapa de balanceamento.

# 7. SENHOR VERÍSSIMO

## Modelo

* [x] Revisar proporções
* [x] Revisar rosto
* [x] Revisar cabelo
* [x] Revisar barba
* [x] Revisar roupa
* [x] Revisar gravata
* [x] Revisar jaqueta
* [x] Revisar espada
* [x] Revisar materiais
* [x] Revisar texturas
* [x] Conferir rig

## Animações

* [x] Idle
* [x] Caminhada
* [x] Corrida
* [x] Ataques
* [x] Guarda do Comandante
* [x] Inteligência Estratégica
* [x] Análise Tática
* [x] Investida dos Aniquiladores
* [x] Jaqueta de Veríssimo
* [x] Especial
* [x] Vitória

## Combate

* [x] Testar Guarda do Comandante
* [x] Testar Inteligência Estratégica
* [x] Testar Análise Tática
* [x] Testar Investida dos Aniquiladores
* [x] Testar Jaqueta
* [x] Testar Segredo de Veríssimo
* [x] Revisar IA
* [x] Balancear (v4.13.1: 45 → 32 → 32 → 36% — `verissimo` 1.22/0.97)

---

> Finalizado na versão estável: Guarda do Comandante contra-ataca, Inteligência Estratégica dá o corte extra (26 → 38),
> Segredo deixa com 1 de vida, kit e especial sem erro, pose de vitória própria (`vic_verissimo`). "Balancear" fica
> para a etapa de balanceamento.

# 8. ESPADA DE ARNALDO / VERÍSSIMO

* [x] Conferir modelo
* [x] Conferir proporções
* [x] Conferir posicionamento
* [ ] Conferir bainha
* [x] Fazer fita vermelha reagir aos movimentos
* [ ] Corrigir clipping
* [x] Garantir movimentação adequada em cada personagem

---

> Fita voltou a ficar vermelha (o flash de dano zerava o brilho dela). Bainha e clipping fino ficam para depois.

# 9. COMBATE — SISTEMAS UNIVERSAIS

## Combo

* [x] Conferir escalonamento (`COMBAT.comboScaling` 100/100/90/80/72/65/58/50%)
* [x] Conferir limite (piso de 50%)
* [x] Conferir especiais (`comboScalingFloor.special` 75%)
* [x] Conferir grabs (`comboScalingFloor.grab` 75%)
* [x] Conferir finalizadores (2026-11-02: os 39 e as 20 formas terminam o combo com `launch` — o Dante com `push` —,
      ↑ + ○ `launchHigh` e ↓ + ○ `knockdown`; 3–6 golpes, último de 48–81)
* [x] Conferir HUD (marcador de dano do combo travado no canto de quem bate, como no Naruto Storm — P1 à esquerda,
      P2 à direita; com a contagem "N ACERTOS" a partir de 2, nos 13 idiomas)
* [x] Evitar infinitos (`maxLaunchesPerCombo` 1 + anti-repetição)

Referência inicial:

```text
1º = 100%
2º = 100%
3º = 90%
4º = 80%
5º = 70%
6º = 60%
mínimo = 50%
```

**Esses valores não são definitivos.**

---

# 10. DODGE

* [x] Testar contra combos (2026-11-02, no jogo: L2 até 2 quadros depois do golpe começar evita o golpe de Arthur,
      Kaiser, Dara, Morato, Carniçal e Balu, e gasta a carga; tarde demais o golpe entra e o L2 vira Substituição)
* [x] Testar contra projéteis (tiro único do Arthur evitado por inteiro; numa rajada — Kaiser, Dara, Morato — os tiros
      depois da invulnerabilidade ainda acertam: 59 → 32, 35 → 23, 51 → 37; é a regra, rajada se esquiva pela posição)

---

# 11. SUBSTITUIÇÃO

* [x] Confirmar funcionamento durante stun (2026-11-02: L2 atordoado sai andando 1,26 m, invulnerável, gasta 1 carga)
* [x] Confirmar interrupção de combo (o L2 apertado no congelamento do acerto fica guardado e sai no fim dele; depois
      da Substituição quem defendeu pune o atacante em 6 de 6 duelos, sem levar dano de volta)
* [x] Conferir deslocamento lateral (passo curto para o lado — teste `positioning`)
* [x] Evitar aparecer diretamente atrás por padrão (nunca nas costas do atacante — teste `positioning`)
* [x] Conferir cargas (1 carga de esquiva — teste `combat-universal`)
* [x] Conferir cooldown (1,2 s — `COMBAT.substitution`)
* [x] Testar com todo o elenco (2026-11-02: os 39, no meio da praça de Tipora e encostados na borda — 78/78)

---

# 12. GRAB / THROW TECH

* [x] Conferir dano (2026-11-02, os 39 contra o Joui: 53–79, a diferença vem dos elementos e resistências)
* [x] Conferir defesa (Defesa + ○ no começo escapa — `COMBAT.grabTech`, teste `combat-universal`)
* [x] Conferir cenas (as 39 rodam até o fim, ~2,2 s, sem erro)
* [x] Conferir câmera (todas abrem a cena com câmera própria)
* [x] Criar/revisar variações individuais (`GRAB_SCENES`: os 39 têm a sua; formas e versões reaproveitam a da base)

### Exemplos

* [x] Kaiser — braço (socos e a Acácia no fim)
* [x] Juan — faca no pescoço (`fx: 'throat'`, cura 15)
* [x] Aguiar — machado (corte, chute e o machado de cima, sangrando)
* [x] Outros personagens

---

# 13. DEATH GOD

Death God é **SPECIAL/ULT**, não grab.

Conferido em 2026-11-02 no especial ENVELHECIMENTO do Deus da Morte (`specials/ageGrab.js`, testado no jogo contra o Joui):

* [x] Uma utilização por rodada (não pega quem já está envelhecido; a recarga zera no round seguinte)
* [x] Cooldown (60 s, 50 de sanidade)
* [x] Telegraph (preparo de 0,55 s: a mão se estende com fumaça cinza e o som `fearGaze`)
* [x] Escape (esquiva ou Substituição durante o preparo: erra e gasta a carga da esquiva — antes só escapava se a
      invulnerabilidade da esquiva ainda durasse no instante do agarrão; corrigido como nos especiais de investida.
      Esquivar entre 0 e 0,45 s depois do preparo começar escapa; depois de 0,55 s, pega)
* [x] Debuff (ENVELHECIDO: −40% de dano, −30% de velocidade, sem regenerar sanidade)
* [x] Duração (até o fim do round: cores e postura voltam no round seguinte)
* [x] Câmera (dois planos + rosto da vítima + órbita)
* [x] Modelo (`public/models/deus_morte.glb`)
* [x] Rig (esqueleto padrão; anim `dm_lift`)
* [x] Material (cabelo branco e pele acinzentada no alvo, devolvidos no fim)
* [x] Efeitos (fumaça na mão e no pescoço, distorção, cinzas caindo do envelhecido)

---

# 14. WAKEUP

* [x] Invulnerabilidade (`COMBAT.wakeupInvuln` + invulnerável caído)
* [x] Roll (× ou L2 logo depois de cair levanta rolando — `COMBAT.down`)
* [x] Ataque (2026-11-02: ○ no fim do levantar sai no 1º quadro livre, ainda invulnerável)
* [x] Pressão justa (caído é invulnerável e levanta com 0,35 s de invulnerabilidade: golpe "meaty" não entra)
* [x] Evitar loops (derrubado 4× seguidas, o defensor tem 15–18 quadros livres a cada levantar para defender ou esquivar)

---

# 15. INPUT BUFFER

* [x] □ (2026-11-02, no fim de um soco no vazio: até 6 quadros antes sai o tiro no 1º quadro livre)
* [x] ○ (durante o golpe entra na fila do combo)
* [x] △ (até 6 quadros antes começa a carga)
* [x] L2 (sai a esquiva; o L2 também cancela o golpe depois do ponto de cancelamento)
* [x] Buffer durante recuperação (`COMBAT.inputBuffer` 0,12 s)
* [x] Evitar comandos acidentais (apertado 10 ou 16 quadros antes: descartado)
* [x] Conferir janela (0,12 s ≈ 7 quadros)

---

# 16. DEFESA

* [x] Defesa normal
* [x] Perfect Block (`COMBAT.defense.perfect` 0,1 s + contra-atordoamento)
* [x] Resistência (barra de defesa com regeneração)
* [x] Guard Break (`guardCrush` / som `guardBreak`)
* [x] Golpe △+○ (2026-11-02, os 39 contra a defesa: golpes pesados gastam 35–93 da defesa e passam 14–49; agarrões
      — Suplex do Kian, Espiral Descendente da Magistrada, Perturbação Discente — e a Lâmina do Medo (`guardBreak`)
      passam; a Acácia da Kaiser cai de cima — sai da área para escapar; buffs e curas não interagem)
* [x] Consumo de defesa (`guardDamage` 0,9 por ponto bloqueado)
* [x] Interação com grabs (2026-11-02: o agarrão passa pela defesa — 56–77 de dano; escapa com Defesa + ○ no começo)
* [x] Evitar quebra injusta (defesa cheia: Arthur só quebra com ~1,7 s de pressão contínua, mais de uma sequência;
      Balu, Dante, Lírio e Deus da Morte em 2,5 s não quebram; o desgaste é de 15–45 de vida)

---

# 17. ANTI-REPETIÇÃO

* [x] Limite de lançamentos (`maxLaunchesPerCombo`)
* [x] Limite de projéteis (`maxVolleys` 2 no ar)
* [x] Redução por repetição (`COMBAT.repeat`: 3ª vez seguida 70%)
* [x] Proteção contra loops
* [x] Não prejudicar personagens dependentes de repetição (2026-11-02: a regra só vale para o MESMO golpe corpo a corpo
      3x seguidas; cada golpe do combo tem nome próprio — só o Amigo repete "Garra seca" 2x, abaixo do limite —, e
      tiros, rajadas e golpes de vários acertos contam uma vez)

---

# 18. ESPECIAIS / TELEGRAPHS

Todo especial de grande impacto deve possuir leitura clara.

* [x] Conferir todos os especiais (2026-11-02, os 39 contra o Joui, sem erro: 146–331 de dano, 3–8 s; Marionete do
      Dante, Carniçal da Esfinge da Nubi e o Pacto do Diabo são de efeito, sem dano direto)
* [x] Conferir projéteis (2026-11-02, o □ dos 39 a 7 m: livre 23–81; na defesa passa ~1/3 e gasta 17–88 da defesa;
      Dalmo e Cristopher não atiram — o □ do Dalmo é o contra-ataque "Pode Vir!")
* [x] Supernova (a Granada de Luz real pega o especial)
* [x] Em Nome do Caos (mesma granada; errou, ela não se explode)
* [x] Especiais do Anfitrião (O Jogo do Anfitrião 263 de dano, Ato Final do Arnaldo 270; as 9 habilidades da Relíquia
      sem erro — as de utilidade, como Multiplicação, Distorção e A Plateia, não causam dano)
* [x] Flash Grenade (Granada de Luz)
* [x] Conferir esquiva (2026-11-02). Os de aviso (Arthur, Kaiser) já erravam com a esquiva nos últimos 0,45 s do
      aviso (~0,33 s de janela no teste). Os de investida (`cinematicCombo` com `dash`) NÃO dava para esquivar: a
      investida persegue e pegava o alvo no meio da esquiva. Corrigido: esquiva ou Substituição durante a investida (ou
      na janela do aviso logo antes) faz o especial errar e gasta a carga — Carniçal ~0,3 s, Lírio e Morato ~0,15 s.
      Caído continua sendo pego.
* [x] Conferir interrupção quando aplicável (os 39: um golpe no preparo do especial cancela, nenhum segue)
* [x] Evitar dano sem feedback (2026-11-02: todo dano passa por `applyHit` ou mostra sangue/aviso; faltava o preço em
      vida de quem não tem sanidade — Erin em Nome do Caos — fora das habilidades: agora sangue e "−N DE VIDA")

---

# 19. TRANSFORMAÇÕES

## Geral

* [x] Barra (Barra de Transformação `COMBAT.storm`)
* [x] Condição (cheia + vida ≤ 35%)
* [x] Custo (Barra de Transformação cheia + vida ≤ 35%; zera a barra)
* [x] Duração (até o fim do round)
* [x] Animação (2026-11-02: as 37 transformações rodam sem erro, cada uma com cinemática própria de 1,3–5,3 s)
* [x] Câmera (a cinemática segura a câmera do começo ao fim em todas)
* [x] Efeitos
* [x] Retorno (volta da forma no fim do round)
* [x] Vitória (vence o round com a pose de vitória NA forma; a tela final mostra só a forma)

## Formas

* [x] Fantasma (forms/fantasma.js)
* [x] Mutilador (forms/aguiar_mutilador.js)
* [x] ??? (Capacete do ??? — forms/labirinto_elmo.js)
* [x] Erin — Em Nome do Caos (forms/erin_caos.js)
* [x] Anfitrião (forms/anfitriao.js)
* [x] Juan — Portador do Trono (forms/diabo.js)
* [x] Outras formas (20 formas: Shi no Kage, Olhos Abertos, Calamidade, ET, Colosso, X, Desertor, Verdadeiro Raziel,
      Magistrada, Amphitruo, Deus da Morte e as outras — ver `characters/forms/`)

---

# 20. KIAN — TRANSCENDÊNCIA

> Obsoleto (conferido em 2026-10-10): o kit atual do Kian não tem mais a Transcendência como habilidade — a
> Transformação dele é o Invólucro do Conhecimento (`awakenMode`). O tipo `transcend` continua em `abilities.js`
> (sem custo de regeneração e com dreno no fim), mas nenhum lutador usa.

* [x] Conferir Precognição (passiva `precognition`: não é pego desprevenido)
* [x] Evitar esquiva automática injusta (a Precognição não esquiva sozinha)

---

# 21. ELEMENTOS

Os elementos devem continuar ligados principalmente aos **rituais**.

Não criar multiplicador elemental universal para todos os ataques sem nova decisão.

## Ciclo

```text
SANGUE
↓
CONHECIMENTO
↓
ENERGIA
↓
MORTE
↓
SANGUE
```

## Medo

* Fora do ciclo
* Ligado ao Outro Lado

## Cores

* Sangue → vermelho
* Conhecimento → dourado
* Energia → roxo/verde
* Morte → preto/cinza
* Medo → identidade própria

### Validação

* [ ] Conferir rituais
* [x] Conferir cores (`config/elements.js`: Sangue vermelho, Conhecimento dourado, Energia roxo, Morte cinza)
* [x] Conferir seleção (elemento aparece na seleção e na lista de golpes)
* [ ] Conferir nomenclatura
* [x] Não aplicar dano elemental universal

---

# 22. SANIDADE / PE

Utilizar:

**SANIDADE / PE**

Não criar barra separada de Exposição Paranormal sem nova decisão.

* [x] Conferir HUD (barra de sanidade única, sem barra de Exposição)
* [x] Conferir custos (2026-11-02: todas as habilidades dos 39 e das formas com custo e recarga; 10–40 de sanidade,
      especial 50 — a Erin em Nome do Caos paga com a vida)
* [x] Conferir regeneração (2,5/s parado + Carga △ 32/s; quem envelhece pelo Deus da Morte não regenera)
* [x] Conferir transformações (a Barra de Transformação é separada da sanidade)
* [x] Conferir habilidades

---

# 23. PERSONAGENS — FIDELIDADE

## KAISER

* [ ] Revisar Cinerária
* [ ] Conferir duração
* [ ] Revisar rituais
* [x] Avaliar Acácia (no kit)
* [ ] Avaliar Dissipar Espíritos
* [ ] Revisar Resistência
* [x] Desert Eagle
* [x] Karambit
* [x] Balas amaldiçoadas
* [x] Nebulosa
* [x] Conferir visual (remodelada pela arte na v3.38.0)

---

## ARTHUR

* [x] Conferir braço esquerdo
* [x] Revisar Arma de Sangue (v3.39.0: habilidade R2 + ×, paga 40 de vida, alcance e sangramento; v3.41.0: a lâmina nasce do punho direito e o físico vira cortes)
* [x] Arma de Sangue deve consumir vida (passiva `bloodPrice`: sem sanidade, paga com vida)
* [x] Revisar Rebirth (v3.39.0: roxo de Calamidade, Energia)
* [x] Revisar crânios (caveirinhas de energia no Rebirth)
* [x] Revisar raios (raios roxos nos tiros)
* [ ] Revisar Dystopia
* [ ] Revisar Templo do Ódio
* [x] Revisar sniper carregado (v3.14.0: laser com atraso e aviso — dá para desviar)
* [ ] Conferir risco/recompensa

---

## JOUI

* [x] Teleporte das Sombras
* [x] Olhar do Desespero
* [x] Shi no Kage
* [x] Máscara das Pessoas nas Sombras: o modelo usa a máscara e a habilidade **Tomado pelo Ódio** (R2 + ×) ativa os poderes dela; na forma Shi no Kage ele a entregou à Magistrada (v3.42.0)
* [x] Coincidência Forçada
* [x] Decepar
* [x] +30% finisher abaixo de 20%
* [ ] Conferir alcance
* [ ] Conferir combos
* [ ] Evitar pressão excessiva

---

## AGHATA

**Nome oficial: AGHATA**

* [x] Utilizar referência visual definida (remodel na técnica nova — §23.5, v4.15.0)
* [x] Descarnar (especial) — v4.15.1: o ritual de Sangue arranca a pele e derrete a carne (carne viva, pele em pedaços,
      a carne pingando com vapor de sangue e a poça no chão); sem o raio de antes. Vale também para o Juan, as
      assistências e o agarrão
* [x] Livro — v4.16.0: o grimório aberto na mão esquerda no Descarnar e na Leitura de Rituais
* [x] Faca
* [x] Ritual de Leitura (Leitura de Rituais)
* [x] Colar Encharcado de Sangue (passiva `bloodNecklace`) — v4.16.0 pelo cânone: −20% de dano de Sangue, rituais de Sangue
      +10% e sangramento +15% (a referência abaixo)
* [x] Identificação Macabra (PROPOSTA, v4.16.0): não perde o rastro de quem fica furtivo e vê o sigilo debaixo do verdadeiro
      no meio de clones e ilusões
* [x] Passagem de Conhecimento Expandido pelo cânone (v4.16.0): o □ vira o do adversário até o fim do round (testado
      contra Kemi e Dante; falta conferir contra os 39)
* [x] Conferir bleed (2026-11-02: 23 de dano no corte + 12 de sangramento em 3 s com a faca amaldiçoada)
* [ ] Conferir dano físico
* [ ] Conferir resistência
* [ ] Avaliar aumento do combo

Referência inicial:

```text
+15% bleed
-20% dano de Sangue
```

---

## GAL

Conferido no código em 2026-10-22 (revisão da Ultimate e do despertar): os itens marcados existem no kit atual.
* [x] Ereshkigal (Ativar Ereshkigal, trás + □)
* [x] Duas lâminas (modelo Ereškigal no Blender, v3.34.0)
* [x] Correntes (Corrente de Captura □, Corrente Gancho △ + □, puxão trás + ○)
* [x] Corrente Giratória
* [x] Controle Mental
* [x] Perfect Block (`defense.perfectBlock`: 0,15 s, contra-ataque 0,7 s)
* [x] Teleporte
* [x] Desviar Balas (passiva `bulletDodge`)
* [ ] Rejeitar Névoa — não existe no kit; a origem do pedido não foi encontrada na wiki (conferir antes de fazer)
* [ ] Arremesso — a habilidade "Arremessar" da wiki (acertar e arremessar o alvo para longe) não tem golpe próprio
* [x] Mortal Speed (Velocidade Mortal)
* [x] Passiva (dreno X/Y enquanto a Ereshkigal está ativa)
* [ ] Conferir controle de espaço
* [x] **Ultimate Injustiça refeita pela cena do cânone** (2026-10-22): corrente → Controle Mental (o alvo ajoelha sob o
  sigilo) → a fala inteira → 3 cortes "sabidos antes" (Bênção Maldita) → cruz final que derruba. Mesmo dano, custo e
  recarga; dano em cada impacto; esquiva/defesa da corrente continuam valendo.
* [x] **Despertar Afinidade com Precognição pela wiki** (2026-10-22): passa a dar a passiva Precognição (não é pego
  desprevenido) e a janela do Bloqueio Perfeito vai a 0,2 s; velocidade +15% → +10%.
* [x] **Nomes (pedido de 2026-10-22):** a Ultimate se chama **"Injustiça né?"** (banner curto) e a transformação
  **"O Realizador do Destino"** (apelido oficial do Gal; o poder continua sendo a Afinidade com Precognição).
* [x] Destacar a venda (brilho dourado) na ativação do despertar: as marcas da venda acendem e pulsam enquanto durar
  (`awakenMode.glowMat`).
* [x] **Cura que cobra sanidade deixa de ser passiva** (pedido do usuário, 2026-10-08): vira uma HABILIDADE que liga a
  cura do alvo + o roubo de sanidade por alguns segundos; fora dela, o físico do Gal é normal

---

## DANTE

* [x] Tentáculos de Lodo
* [x] Decadência
* [x] Hold
* [x] Slow
* [ ] Conferir alcance
* [ ] Conferir dano
* [ ] Evitar loop

---

## ERIN

* [x] Em Nome do Caos (forms/erin_caos.js)
* [x] Máscara de gás
* [x] Custo em vida (passiva `noSanity`)
* [x] Sem barra de sanidade adicional (barra zerada e travada)
* [x] Cena de suicídio (specials/kamikaze.js)
* [x] Vitória caso o rival vá junto (`sacrificeWin`)
* [x] Supernova
* [x] Black Hole (Envelhecimento Localizado "Black Hole")
* [ ] Cura
* [x] Telegraph (Granada de Luz)

---

## AGUIAR

* [x] Máscara
* [x] Sangramento
* [x] Machado (remodelado no Blender (v3.33.0))
* [ ] Cura
* [ ] Efeitos próprios
* [ ] IA

---

## LABIRINTO

* [x] Tempestade Caótica (forms/labirinto_elmo.js)
* [x] Raio contínuo (`beam`)
* [x] Rastreamento (a ponta segue o alvo (`track` 6,5))
* [x] Counterplay (um dash escapa do raio)
* [ ] Identidade própria
* [ ] Não aumentar força apenas por tier

---

## XANDE

* [ ] Revisar kit
* [ ] Conferir elemento/rituais
* [ ] Conferir mobilidade
* [ ] Conferir dano
* [ ] Conferir identidade

---

## LÍRIO

* [ ] Revisar kit
* [ ] Conferir dano
* [ ] Conferir alcance
* [x] Conferir visual (remodelado no Blender na v3.40.0)
* [ ] Conferir IA

---

## FERREIRO

* [x] Spiral Hypnosis
* [x] Tiros amaldiçoados
* [ ] Controle de distância
* [ ] Dano
* [ ] IA

---

## JUAN / DIABO

* [x] Pacto
* [x] Lança de Sangue (forms/diabo.js)
* [x] Poças
* [x] Transporte
* [x] Hate (`devilHate`)
* [x] Regeneração (`regen` da forma)
* [x] Blood Armor (Armadura de Sangue Diabólica)
* [ ] Explosão do ombro
* [x] Portador do Trono
* [ ] Testar comeback

Referências antigas de teste:

```text
Bleed: 4 → 3/s
Hate: +20% → +15%
Lifesteal: 0.12 → 0.08
Vida da forma: 1250 → 1150
```

**Todos esses valores são provisórios e devem obrigatoriamente ser reanalisados após os testes de balanceamento.**

---

## KEMI

* [x] Rodar nova telemetria (v4.13.1: 4 rodadas de 1482 lutas)
* [x] Conferir winrate (51 → 47 → 43 → 54%, na faixa)
* [x] Conferir dano (~3600–3700 causado por luta, entre os mais altos, recebe ~3100)
* [ ] Conferir facilidade de execução
* [x] Não nerfar com base em poucas partidas (sem ajuste novo: `kemi` 0.97 desde a v3.32)

---

## BALU

* [x] Conferir modelo (remodelado no Blender na v3.40.0)
* [ ] Conferir animações
* [x] Machado
* [x] **Machado em Giro arremessa a arma que está na mão** (pedido do usuário, 2026-10-08): com o Machado
  Demônio ativo (machado virou clava/maça de sangue), o □ deve lançar a clava — hoje lança o machado comum
* [x] Blood Curse (Amaldiçoar Arma com Sangue)
* [x] Demon Axe (Machado Demônio)
* [x] Imposing Voice (Fala Imponente)
* [x] Resistência (Colete Físico-Balístico)
* [x] Ataque de chão (Derrubar e Atacar)
* [ ] Coração de Urso
* [ ] IA
* [ ] Balanceamento

---

# 23.5 REMODELAR COM A TÉCNICA NOVA (Blender MCP + `sculpt_lib`)

A partir da v3.23 os modelos passaram a ser feitos com a técnica nova (`tools/blender/sculpt_lib.py`: escultura por
metaballs, relevo na própria malha, roupa por `clothe`, cascas por `shell_grid`), conferindo com as referências da
wiki. Os modelos abaixo ainda são da técnica antiga (peças geométricas coladas) e devem ser refeitos na mesma
qualidade do Cristino / Cristopher / Dante v2 — um por vez, com o kit e as juntas preservados.
(A Aghata já teve um remodel, mas foi antes da técnica nova: entra aqui.)

**Já na técnica nova:** Cristino, Cristopher, Dante (+ Olhos Abertos), Juan / Henri, Deus da Morte, Existido de Morte, A Marionete.

- [x] **O Carniçal como personagem jogável** (criatura do Outro Lado) — feito em 2026-11-01: `src/characters/carnical.js` (Outro Lado, Morte) com modelo de lutador próprio (`tools/blender/char_carnical.py` → `public/models/carnical.glb`; o NPC continua em `public/npcs`). Kit da wiki: Garra da Morte (combo e especial), □ Investida Mortal e △ + × Salto (Físico Paranormal), △ + L2 Pancada Poderosa, △ + ○ Hipnose Espiral, R2 + △ Comando, Transformação Instinto Mortal e a passiva Corpo Fechado (bala comum entra com 40%: `o.ballistic` em projectiles.js). Falas de introdução e vitória contra todo o elenco e agarrão próprio. Reanimar Corpos ficou de fora (o Deus da Morte e o Diabo já invocam).

## Personagens jogáveis

* [x] Aghata (v4.15.0)
* [x] Aguiar (v3.33.0)
* [ ] Amigo Imaginário
* [x] Arnaldo Fritz (2026-10-26)
* [x] Arthur Cervero (v3.41.0)
* [x] Balu (v3.40.0)
* [ ] Dalmo (e o Colosso)
* [ ] Erin
* [ ] O Estrangeiro
* [ ] Ferreiro
* [x] Gal Sal (v3.34.0)
* [ ] Guizo
* [ ] Jae
* [x] Joui (v3.41.0)
* [x] Kaiser (v3.38.0)
* [x] Kemi (v3.34.0)
* [x] Kian (2026-10-26)
* [ ] Labirinto
* [x] Lírio (v3.40.0)
* [ ] A Magistrada
* [x] O Diabo (2026-10-26)
* [x] Senhor Veríssimo (2026-10-26)
* [x] Xande (v3.33.0)

## Formas com modelo próprio

* [x] O Anfitrião (2026-10-26)
* [ ] O Portador do Trono (forma do Juan) — revisto em 2026-10-31; refazer completo pedido (ver *MELHORAR O MODELO DO PORTADOR DO TRONO*)
* [x] A Fantasma (forma da Kemi) (v3.34.0)

## Invocações

* [x] Os Mananciais (Ferreiro) — refeitos na técnica atual (2026-10-26, `char_manancial.py` com `sculpt_lib`) pelas
  miniaturas oficiais (fugitivo, barbudo, velho, imóvel, castanho) e pela HQ de O Segredo na Floresta Pt. 2: pele pálida
  cinza-esverdeada, corpo esquálido (costelas, clavículas, espinha, escápulas, barriga funda), ORELHAS pontudas, olhos
  FUNDOS e PRETOS, cabelo preto comprido repartido emoldurando o rosto, só TRAPOS escuros, dedos longos com unhas sujas e o
  Símbolo Espiral no peito (texturas `face_manancial` e `skin_manancial_torso`; a camisa/calça brancas antigas saíram).
  Revisado no Blender e no jogo (Chamar os Mananciais).
* [x] Zumbi de Sangue e Zumbi de Sangue forte (O Diabo / Portador do Trono) — refeitos em 2026-10-31 na técnica do
  Carniçal (`npc_sculpt_lib.py`, metaballs + cor por vértice) pelas miniaturas da wiki "Zumbis de Sangue": o FRACO com o
  crânio grande e calvo, as ÓRBITAS VAZIAS (são cegos), a bocarra de presas compridas cor de marfim e o corpo magro de
  braços longos; o FORTE como o BESTIAL (a corcova de músculo, quase de quatro, o crânio partido ao meio no topo, a
  mandíbula enorme com o dobro de presas, o sangue pingando). Pele gosmenta com placas escuras, estrias claras e veias.
  Mesmas juntas: as poses e os golpes não mudaram.
* [x] As feras de tinta — cão e javali (Amigo Imaginário) — refeitas em 2026-10-31 na técnica do Carniçal
  (`npc_sculpt_lib.py`) pelas miniaturas da wiki ("Javalis Infectados", "Cachorros Selvagens Infectados"): o pelo marrom
  em mechas com a crina espetada e os tufos desgrenhados, o FLANCO aberto com a carne e as COSTELAS saltando, as VEIAS
  grossas serpenteando e se ramificando por cima do pelo (assentadas na superfície real do corpo) até o olho vermelho
  de onde a tinta escorre, os dentes enormes saindo da boca; o javali com as quatro PRESAS curvas, o cão de peito fundo,
  cintura fina, a língua e o rabo peludo curvado. Mesmas juntas. (O visualizador `npcs.html` agora mostra os dois.)

---

# 24. CURAS

Cada personagem deve possuir identidade visual própria.

* [ ] Revisar efeitos
* [ ] Evitar reutilizar exatamente o mesmo efeito
* [ ] Conferir cores
* [ ] Conferir partículas
* [ ] Conferir animação
* [ ] Conferir leitura

---

# 25. TELEPORTES

Cada personagem deve possuir identidade própria.

* [ ] Rastro específico
* [ ] Evitar mesmo efeito para todos
* [ ] Conferir velocidade
* [ ] Conferir origem/destino
* [ ] Conferir câmera
* [ ] Conferir colisão
* [ ] Conferir interação com ataques

---

# 26. FANTASMA / MUTILADOR / FORMAS ESPECIAIS

## Fantasma

* [ ] Animações próprias
* [ ] Loop de balas
* [ ] Bandagens envolvendo o corpo
* [ ] Efeito próprio de transformação
* [ ] Rastro de teleporte
* [ ] Pose
* [ ] Vitória

## Mutilador

Título:

**??? · MUTILADOR NOTURNO · A FANTASMA**

* [ ] Conferir apresentação
* [ ] Conferir máscara
* [ ] Conferir transformação
* [ ] Conferir pose

## Juan

Título:

**PORTADOR DO TRONO**

* [ ] Conferir apresentação
* [ ] Blood Armor
* [ ] Explosão do ombro
* [ ] Transformação

---

# 27. ANIMAÇÕES

* [ ] Revisar placeholders
* [ ] Criar animações próprias das formas
* [ ] Revisar transformações
* [ ] Revisar ataques especiais
* [ ] Revisar vitórias
* [ ] Revisar derrotas
* [ ] Revisar transições
* [ ] Corrigir clipping
* [ ] Corrigir poses artificiais

---

# 28. CÂMERA

## Combate

* [ ] Distância
* [ ] Acompanhamento
* [ ] Movimentação lateral
* [ ] Zoom
* [ ] Transformações
* [x] Especiais cinematográficos (v3.44.0: transições suaves, sem entrar no cenário)
* [ ] Evitar atravessar cenário
* [ ] Evitar esconder personagens
* [ ] Equipe
* [ ] Personagens grandes
* [ ] Personagens pequenos

## Vitória

* [ ] Centralizar vencedor
* [ ] Enquadrar vencedor
* [ ] Movimento cinematográfico
* [ ] Pose própria
* [ ] Frase
* [ ] Subtítulo
* [ ] Iluminação
* [ ] Transformação

---

# 29. INTRODUÇÕES

O sistema de introdução deve permanecer separado das frases de vitória.

## Estrutura

* [ ] `INTRO_DIALOGUES`
* [ ] `VICTORY_LINES`

Nunca misturar os dois.

## Conteúdo

Referência atual do sistema:

* 15 personagens;
* 210 confrontos;
* 2 variações por confronto;
* 420 cenas;
* 840 falas.

## Apresentação

* [ ] Duração dinâmica
* [ ] Destaque de quem fala
* [ ] Câmera enquadrando os dois
* [ ] Sem HUD
* [ ] Sem cronômetro
* [ ] Transição para batalha
* [ ] Variações

## Escrita

* [ ] Personagem responde ao outro
* [ ] Evitar frases genéricas
* [ ] Evitar clichês
* [ ] Manter personalidade
* [ ] Manter rivalidades
* [ ] Manter humor
* [ ] Anfitrião especialmente ácido
* [ ] Não fazer todos falarem igual

---

# 30. FRASES DE VITÓRIA

* [ ] Revisar todas
* [ ] Conferir personalidade
* [ ] Conferir formas
* [ ] Conferir subtítulos
* [ ] Conferir câmera
* [ ] Conferir animação
* [ ] Diferenciar de introduções
* [ ] Evitar clichês

---

# 31. IA

## Estratégia

* [ ] Reconhecer repetição
* [ ] Evitar spam
* [ ] Reagir a telegraphs
* [ ] Reagir à Flash Grenade
* [ ] Priorizar summons
* [ ] Utilizar recursos
* [ ] Transformar
* [ ] Recuar
* [ ] Pressionar
* [ ] Utilizar assistência

## Dificuldades

* [ ] Fácil
* [ ] Normal
* [ ] Difícil
* [ ] Muito Difícil

A dificuldade deve melhorar comportamento, não apenas aumentar dano.

## Treinamento

* [ ] Rodar CPU × CPU
* [ ] Atualizar `public/ai/learned.json`
* [ ] Treinar novamente após mudanças importantes

---

# 32. TELEMETRIA

Após finalizar alterações relevantes dos kits:

* [ ] Rodar `npm run balance` (o script ainda não existe — ver §76.5)
* [x] CPU × CPU (v4.13.1, `src/dev/balance.js`)
* [ ] 2–3 partidas por confronto
* [x] Registrar vitórias
* [x] Registrar dano
* [x] Registrar uso de habilidades (`moves`: os 8 golpes que mais acertaram por personagem)
* [ ] Registrar combos
* [ ] Registrar duração
* [ ] Registrar transformações
* [ ] Registrar especiais
* [ ] Registrar comportamento da IA

---

# 33. REGRA ABSOLUTA DE BUFFS E NERFS

**Nenhum buff ou nerf presente neste TODO é definitivo.**

Todos os valores são hipóteses de trabalho.

Isso inclui:

* dano;
* vida;
* PE;
* custo;
* cooldown;
* velocidade;
* duração;
* bleed;
* lifesteal;
* Hate;
* resistência;
* multiplicadores;
* força de transformação;
* assistências;
* especiais;
* alcance;
* recuperação.

Depois dos testes:

* [ ] Confirmar
* [ ] Aumentar
* [ ] Reduzir
* [ ] Remover
* [ ] Reverter
* [ ] Criar novo ajuste

conforme os dados.

### Processo

1. Rodar telemetria.
2. Identificar outliers.
3. Alterar pouco.
4. Rodar novamente.
5. Comparar.
6. Testar manualmente.
7. Verificar se a mudança não criou outro problema.
8. Repetir.
9. Só então considerar o personagem estabilizado.

Uma única partida nunca deve determinar um nerf ou buff.

Oscilações de aproximadamente 10–20% podem acontecer em poucas partidas.

---

# 34. OBJETIVO DE BALANCEAMENTO

## S

* Kian
* Gal
* Formas especiais

## A

* Dante
* Joui
* Juan
* Ferreiro

## B

* Kaiser
* Arthur
* Erin
* Aghata
* Kemi
* Aguiar
* Balu

## C

* Xande
* Lírio
* Labirinto

Referência de equilíbrio:

**35%–65%**

Tier representa função/força geral e não necessariamente uma obrigação de winrate.

---

# 35. LAN / ONLINE

## Teste real

* [ ] PC 1 host
* [ ] PC 2 convidado
* [ ] Código
* [ ] Senha
* [ ] Sala pública
* [ ] Sala privada
* [ ] Entrada por código
* [ ] Seleção
* [ ] Batalha
* [ ] Sincronização
* [ ] RNG
* [ ] Checksum
* [ ] Correção de estado

## Radmin

* [ ] Testar PC × PC
* [ ] Testar IP virtual
* [ ] Testar latência
* [ ] Testar desconexão
* [ ] Testar reconexão

## Falhas

* [ ] Queda do host
* [ ] Failover
* [ ] Fechamento
* [ ] Retorno ao menu

## Futuro

* [ ] Equipe em LAN
* [ ] Assistências em rede
* [ ] Mais jogadores

---

# 36. MOBILE

## Testes reais

* [ ] Android
* [ ] iPhone
* [ ] Toque nos menus
* [ ] Seleção
* [ ] Batalha
* [ ] HUD
* [ ] Controles
* [ ] Orientação
* [ ] Resoluções
* [ ] Performance

## HUD

* [ ] Compactação
* [ ] Skill strip
* [ ] Vida
* [ ] PE
* [ ] Dodge
* [ ] Timer
* [ ] Assistências

---

# 37. SISTEMA DE IDIOMAS

> ✅ **Interface ligada (próxima versão após a v3.10.1):** OPÇÕES → IDIOMA troca na hora toda a interface (menu
> principal, opções, seleção, configurações da batalha, cenário, carregamento, vitória, pausa/treino, comandos, online,
> HUD, chamadas da luta e botões de toque). Os 13 arquivos `src/i18n/locales/*.js` têm as mesmas chaves (teste em
> `tests/i18n.test.js`). **Ainda em português:** conteúdo dos personagens (golpes, habilidades, descrições, falas),
> novidades (aviso na tela), nomes/descrições dos cenários, passos do Tutorial e os avisos de combate que são nomes de
> poderes/frases dos personagens. Os avisos do SISTEMA (errou, recarregando, longe demais, bloqueio perfeito…) e as
> mensagens da partida online já traduzem (`tAlert` em `src/i18n/index.js`).

Criar:

**CONFIGURAÇÕES → IDIOMA**

O jogador deve poder escolher manualmente o idioma do jogo.

---

# 38. IDIOMAS PRIORITÁRIOS

## Primeira camada

* [x] 🇧🇷 Português — Brasil (`pt-BR`)
* [x] 🇵🇹 Português — Portugal (`pt-PT`)
* [x] 🇺🇸 Inglês (`en`)
* [x] 🇪🇸 Espanhol (`es`)
* [x] 🇩🇪 Alemão (`de`)
* [x] 🇫🇷 Francês (`fr`)
* [x] 🇮🇹 Italiano (`it`)
* [x] 🇷🇺 Russo (`ru`)
* [x] 🇨🇳 Chinês (`zh`)
* [x] 🇯🇵 Japonês (`ja`)
* [x] 🇰🇷 Coreano (`ko`)
* [x] 🇹🇷 Turco (`tr`)
* [x] 🇵🇱 Polonês (`pl`)

(interface traduzida nos 13; o conteúdo segue a §40)

## Expansão futura

* [ ] Holandês
* [ ] Sueco
* [ ] Tcheco
* [ ] Árabe
* [ ] Hindi
* [ ] Outros idiomas conforme demanda

A arquitetura deve permitir adicionar idiomas sem modificar a lógica do jogo.

---

# 39. SISTEMA DE LOCALIZAÇÃO

Estrutura centralizada implementada em `src/i18n/`.

* [ ] Remover textos hardcoded gradualmente

---

# 40. TEXTOS LOCALIZÁVEIS

Todo texto visível deve passar pelo sistema.

## Interface

* [x] Menu
* [x] Configurações
* [x] Seleção
* [x] Loading
* [x] Pausa
* [x] Vitória
* [ ] Derrota

## Combate

* [ ] Habilidades
* [ ] Descrições
* [x] Alerts (os do sistema; nomes de poderes ficam como conteúdo)
* [x] SPECIAL
* [x] MISS
* [x] DODGED
* [x] NO DODGES
* [x] DANO
* [ ] HITS
* [x] Timer
* [ ] Assistências
* [ ] Transformações

## Conteúdo

* [ ] Personagens
* [ ] Títulos
* [ ] Introduções
* [ ] Vitórias
* [ ] Tutorial
* [ ] Torre
* [ ] Torneio
* [x] LAN
* [x] Online

## PRÓXIMA TAREFA (pedido do usuário em 2026-10-09, depois do Torneio local)

Traduzir o resto do jogo para os 13 idiomas:

* [ ] DIÁLOGOS (falas de introdução, vitória e batalha em `config/dialogues.js`)
* [ ] Nomes de golpes, habilidades, especiais e transformações
* [ ] Descrições e informações dos personagens (estilo, identidade, frases)
* [ ] Nome do jogo (logo/título por idioma, se fizer sentido)
* [ ] Novidades, cenários (nomes e descrições), passos do Tutorial e o resto que ainda está em português

---

# 41. DIÁLOGOS LOCALIZADOS

Os diálogos devem utilizar IDs, não texto diretamente na lógica.

Exemplo:

```text
dialogue.characterA.characterB.01
dialogue.characterA.characterB.02
```

Idiomas:

```text
pt-BR
pt-PT
en
es
de
fr
it
ru
zh
ja
ko
tr
pl
```

* [ ] Todas as introduções
* [ ] Todas as vitórias
* [ ] Todas as frases especiais
* [ ] Fallback
* [ ] Verificação de tradução ausente

---

# 42. FONTES INTERNACIONAIS

Suportar:

* [ ] Latin
* [ ] Cirílico
* [ ] Japonês
* [ ] Chinês
* [ ] Coreano

Testar:

* [ ] Menu
* [ ] HUD
* [ ] Nomes
* [ ] Diálogos
* [ ] Habilidades
* [ ] Vitória
* [ ] Torre
* [ ] Torneio

Evitar fonte que gere quadrados ou caracteres ausentes.

---

# 43. TEXTOS DINÂMICOS

Suportar:

```text
"Vencedor: {player}"
"Andar {floor}"
"{hits} HITS"
"{damage} DANO"
```

* [ ] Pluralização
* [ ] Números
* [ ] Gênero quando necessário
* [ ] Ordem das palavras
* [ ] Datas
* [ ] Valores
* [ ] Percentuais

Não montar frases concatenando palavras fixas quando a ordem mudar entre idiomas.

---

# 44. DETECÇÃO AUTOMÁTICA DE IDIOMA

Implementado em `src/i18n/index.js` via `detectBrowserLanguage()` respeitando a preferência manual do jogador em primeiro lugar.

---

# 45. TORNEIO

## Objetivo

Criar modo inspirado no sistema de torneio de jogos de arena, permitindo montar um campeonato personalizado.

O jogador deve poder escolher os participantes e as equipes.

> v1 LOCAL (2026-10-09, escopo escolhido pelo usuário: local primeiro, online depois; lutas só de CPU sempre
> sorteadas): `src/game/tournament.js` (chave, testes em `tests/tournament.test.js`) + `TournamentSetupScreen` /
> `TournamentScreen`. 2–8 participantes humano/CPU, solo ou equipe (líder + 2), tempo/rounds/dificuldade/cenário
> (fixo ou aleatório), cada humano escolhe na vez, CPU sorteia; eliminatória com "passa direto"; humano × CPU com o
> humano no P1, humano × humano P1 × P2; tela de campeão. Falta o ONLINE (§48).

---

# 46. TORNEIO — JOGADORES

Suportar:

**1 a 8 jogadores**

* [ ] 1 jogador (o mínimo é 2 participantes; 1 humano + CPUs funciona)
* [x] 2 jogadores
* [x] 3 jogadores
* [x] 4 jogadores
* [x] 5 jogadores
* [x] 6 jogadores
* [x] 7 jogadores
* [x] 8 jogadores

Participantes podem ser:

* humanos locais;
* humanos online;
* CPU.

---

# 47. TORNEIO — LOCAL

* [x] Escolher quantidade de jogadores
* [x] Definir cada jogador
* [x] Definir CPU
* [x] Escolher controles (humano × humano: P1 × P2; humano × CPU: humano no P1)
* [x] Escolher equipes
* [x] Escolher personagens
* [x] Configurar regras

---

# 48. TORNEIO — ONLINE

* [ ] Criar sala
* [ ] Código
* [ ] Senha opcional
* [ ] Número de jogadores
* [ ] Lista de participantes
* [ ] Ready
* [ ] Host controla configurações
* [ ] Distribuição dos participantes
* [ ] Sincronização da chave
* [ ] Sincronização dos resultados
* [ ] Desconexão
* [ ] Reconexão
* [ ] Tratamento de abandono

---

# 49. TORNEIO — EQUIPES

Cada equipe deve poder ser configurada individualmente.

Exemplo:

```text
TIME 1
- Personagem A
- Personagem B
- Personagem C

TIME 2
- Personagem D
- Personagem E
- Personagem F
```

* [ ] Quantidade de integrantes (fixo: líder + 2)
* [x] Personagens individuais
* [x] Humano/CPU
* [ ] Repetição quando permitido
* [x] Assistências
* [x] Trocas
* [x] HUD

---

# 50. TORNEIO — CHAVE

Criar representação visual.

* [x] Rodada inicial
* [x] Quartas
* [x] Semifinal
* [x] Final
* [x] Vencedor
* [x] Eliminado
* [x] Avanço automático
* [x] CPU × CPU (sorteado)
* [x] Humano × CPU
* [x] Humano × Humano

A estrutura deve adaptar-se ao número de participantes.

---

# 51. TORNEIO — REGRAS

* [x] Tempo
* [x] Rounds
* [x] Dificuldade
* [x] Cenário
* [x] Equipes
* [x] Assistências
* [x] Condição de vitória
* [ ] Revanche
* [x] Avanço
* [x] Eliminação

---

# 52. TORNEIO — APRESENTAÇÃO

* [ ] Abertura
* [ ] Participantes
* [ ] Equipes
* [ ] Chave
* [ ] Transição
* [ ] Resultado
* [ ] Atualização da chave
* [ ] Próximo confronto
* [ ] Final
* [ ] Campeão
* [ ] Tela final

---

# 53. TORNEIO — IDIOMAS

Todas as informações do torneio devem ser localizáveis.

* [x] Nome das rodadas
* [x] Jogadores
* [x] Equipes
* [x] Chave
* [x] Resultados
* [x] Campeão
* [x] Eliminado
* [x] Configurações

---

# 54. TORRE

## Conceito

Modo inspirado na Torre de Mortal Kombat.

O jogador começa no primeiro andar e enfrenta uma sequência de adversários.

Ao vencer:

**sobe um andar.**

Objetivo:

**chegar ao topo da torre.**

---

# 55. TORRE — ESTRUTURA

> v2 (2026-10-09, pedido do usuário): menu com **8 torres** (4 em cima, 4 embaixo); só a 1ª livre, as outras com
> cadeado até zerar a anterior. Clicou → a torre em **3D estilo Babel** (`ui/towerStage.js`): a câmera sobe da base
> ao topo e afasta mostrando a torre inteira. Escolhe UM lutador (não troca, nem na pausa) e a **dificuldade, que vale
> para todos os andares**. Andares sem repetir adversário (o próprio lutador pode aparecer: Kaiser × Kaiser vale).
> No topo um **vilão sorteado a cada subida** (Anfitrião, Fantasma, Mutilador, ???, Erin do Caos, Portador do Trono,
> Deus da Morte) **fortalecido** conforme a dificuldade (vida ×1,3–2,2, dano ×1,1–1,5, recebe menos). Torre VIII =
> Torre de Babel: os andares são os vilões e o Deus da Morte no topo, ainda mais forte. O menu mostra a dificuldade
> MAIS DIFÍCIL já zerada em cada torre (`localStorage['arena_torres']`).

* [x] Criar modo
* [x] Tela de seleção
* [x] Mapa vertical
* [x] Andares
* [x] Adversários
* [x] Progressão
* [x] Chefes
* [x] Topo
* [x] Tela de conclusão

---

# 56. TORRE — PROGRESSÃO

Estrutura:

```text
ANDAR 1
   ↓
ANDAR 2
   ↓
ANDAR 3
   ↓
ANDAR 4
   ↓
ANDAR 5
   ↓
...
   ↓
TOPO
```

* [x] Definir quantidade de andares (8)
* [x] Definir adversários
* [x] Definir dificuldade
* [x] Definir chefes
* [x] Definir chefe final
* [ ] Definir recompensas
* [ ] Definir condições especiais

---

# 57. TORRE — ADVERSÁRIOS

Podem existir:

* personagem normal;

* personagem transformado;

* equipe;

* CPU difícil;

* batalha especial;

* chefe.

* [x] Lista de adversários

* [x] Progressão

* [x] Evitar repetição

* [ ] Encontros especiais

* [ ] Chefes

---

# 58. TORRE — ENTRE BATALHAS

Definir o que acontece depois da vitória.

Possibilidades:

* [ ] Recuperação de vida
* [ ] Recuperação de PE
* [ ] Recuperação parcial
* [ ] Modificadores
* [ ] Escolha de caminho
* [ ] Recompensas
* [ ] Bônus
* [ ] Penalidades
* [ ] Batalhas especiais

Regra principal:

**venceu → sobe.**

---

# 59. TORRE — DERROTA

Definir:

* [ ] Derrota encerra a torre (escolhido: não encerra — dá para tentar o andar de novo)
* [x] Retry
* [x] Checkpoint (o andar atual)
* [x] Andar máximo
* [ ] Salvar progresso
* [ ] Estatísticas

---

# 60. TORRE — CHEFES

* [ ] Batalhas especiais
* [ ] Apresentações
* [ ] HUD
* [ ] Música
* [ ] Dificuldade
* [ ] Recompensa
* [ ] Chefe final

---

# 61. TORRE — RECOMPENSAS

Definir posteriormente.

Possibilidades:

* [ ] Personagem
* [ ] Forma
* [ ] Cenário
* [ ] Cosméticos
* [ ] Títulos
* [ ] Frases
* [ ] Ícones
* [ ] Estatísticas
* [ ] Apenas recorde/progressão

Não criar um sistema enorme de recompensas antes de definir o escopo.

---

# 62. TORRE — IDIOMAS

* [x] Andar
* [x] Chefe
* [x] Próximo andar
* [x] Vitória
* [x] Derrota
* [x] Topo
* [ ] Recompensa
* [x] Recorde
* [x] Continuar
* [x] Reiniciar
* [ ] Falas dos chefes (o Deus da Morte usa as falas do Ferreiro; falas próprias de chefe ficam para depois)

---

# 63. TREINO

* [ ] Bot parado
* [ ] Regeneração
* [ ] Reset
* [ ] Reset de posição
* [ ] Reset de vida
* [ ] Reset de PE
* [ ] Reset de cooldown
* [ ] Mostrar dano
* [ ] Mostrar combo
* [ ] Testar transformações
* [ ] Testar especiais
* [ ] Testar grabs
* [ ] Testar assists

---

# 64. CPU × CPU

* [ ] Selecionar personagem
* [ ] Selecionar personagem adversário
* [ ] Dificuldade
* [ ] Cenário
* [ ] Tempo
* [ ] Início automático
* [ ] Reinício
* [ ] Estatísticas
* [ ] Telemetria
* [ ] Múltiplas partidas

---

# 65. MODOS PRINCIPAIS

O menu deve contemplar:

```text
BATALHA
TREINO
CPU × CPU
TORNEIO
TORRE
LAN / ONLINE
```

Futuramente:

```text
NOVOS MODOS
```

---

# 66. BATALHA EM EQUIPE

* [ ] 2×2
* [ ] Troca
* [ ] Assistência
* [ ] HUD
* [ ] Câmera
* [ ] IA
* [ ] Vitória
* [ ] Transformações
* [ ] LAN
* [ ] Online

---

# 67. ASSISTÊNCIAS

Entradas:

* [ ] Analógico esquerdo
* [ ] Analógico direito
* [ ] D-pad esquerda
* [ ] D-pad direita
* [ ] Assist 1
* [ ] Assist 2

Comportamentos:

* [ ] Movimento
* [ ] Sem movimento
* [ ] Arthur — Ódio Incontrolável
* [ ] Arthur — Descarnar
* [ ] Conferir todos os demais assists
* [ ] Balancear cooldown
* [ ] Conferir leitura

---

# 68. HUD

## Geral

* [ ] Portraits
* [ ] Vida
* [ ] SANIDADE / PE
* [ ] Dodge
* [ ] Timer
* [ ] Combo
* [ ] Dano
* [ ] Assistências
* [ ] Alertas
* [ ] Cores dos jogadores

## Indicadores

* [x] **Banner do nome do especial/transformação refeito** (pedido de 2026-10-22; feito no mesmo dia: faixa cresce com o
  texto, letra pela largura, duas linhas se precisar): hoje é só um texto por cima da tela
  (`#banner` em `styles.css`, `HUD.banner`) e fica bugado — a fonte (até 160 px, linha de 140 px) sai para fora da faixa
  preta de 120 px atrás, nomes longos não quebram nem cabem (o tamanho só cai por contagem de letras), o texto e a faixa
  inclinam juntos e cortam nas bordas, e no celular ocupa a tela toda. Fazer a faixa crescer com o texto, limitar o
  tamanho pela largura real, quebrar em duas linhas se precisar e manter o banner curto (ex.: "Injustiça né?").
* [ ] SPECIAL
* [ ] MISS
* [ ] DODGED
* [ ] NO DODGES
* [ ] DANO ###
* [ ] N HITS

---

# 69. MENU PRINCIPAL

* [ ] Definir nome final
* [ ] Definir logo final
* [ ] Tipografia
* [ ] Música
* [ ] Cartões
* [ ] Ícones
* [ ] Navegação
* [ ] Transições
* [ ] Consistência entre telas

---

# 70. SELEÇÃO DE PERSONAGEM

* [ ] Layout
* [ ] Portraits
* [ ] Informações
* [ ] Elementos
* [ ] Nomes
* [ ] Formas
* [ ] Fundos temáticos
* [ ] Equipes
* [ ] Assistências
* [ ] Mobile
* [ ] Idiomas

---

# 71. ÁUDIO

Buscar recursos com licença compatível.

> 2026-10-09: efeitos sonoros CC0 do Kenney (Impact Sounds, RPG Audio, Sci-Fi Sounds, Interface Sounds) via
> `tools/import-sounds.py`. O usuário ouviu e reprovou os socos e a espada do Kenney (soavam como pancada em saco) →
> golpes trocados por pacotes CC0 de combate do OpenGameArt (37 hits/punches, Punch, 20 Sword Sound Effects, swishes):
> silêncio do começo cortado (chegava a 270 ms), pico normalizado, espada acertando = aço + golpe no corpo, whoosh no
> ar. Depois (2º pedido): tiros (M4, escopeta, sniper — cada disparo da biblioteca de armas vira uma variação),
> garras/carne, correntes, chicote, teleporte, batimento, pulo/aterrissagem, medo e K.O. — 39 sons gravados.
> 3º pedido: os sons paranormais também (ritual, carga, especial armado/início, power-up, dreno, renascer, lâmina do
> medo, máscara, fumaça, faixa, aplausos e o zumbido em loop da Carga de Poder) — 52 sons gravados. Seguem
> sintetizados `ready` (aviso de interface) e `laugh` (a risada gravada do Anfitrião foi reprovada pelo usuário). Trocar um som: mapa de `tools/import-sounds.py`.
> O foco é efeito sonoro, não música (pedido do usuário).

* [x] Socos
* [x] Impactos
* [x] Bloqueios
* [ ] Esquivas
* [ ] Transformações
* [ ] Especiais
* [x] Menus
* [ ] Vitória
* [ ] Música do menu
* [ ] Música de batalha
* [ ] Música de transformação
* [ ] Música de chefes
* [ ] Música de Torneio
* [ ] Música de Torre

---

# 72. EFEITOS VISUAIS

> 2026-10-09: texturas CC0 do Kenney Particle Pack (`tools/import-fx.py` → `public/fx/`): fumaça de verdade em todas
> as partículas de fumaça (girando), clarão de estrela nos golpes, bola de fogo + estouro + pedrinhas na explosão,
> pedrinhas nos golpes pesados no chão, faíscas elétricas na energia paranormal e brilho no bloqueio perfeito.

* [x] Socos
* [x] Impactos
* [x] Explosões
* [x] Cortes (arco com degradê, borda quente e varredura)
* [ ] Tiros
* [ ] Projéteis
* [x] Fumaça
* [x] Energia
* [ ] Sangue
* [ ] Teleporte
* [ ] Efeitos paranormais

Os efeitos não podem prejudicar a leitura do combate.

---

# 73. CENÁRIOS / BLENDER

## Orfanato / cidade

* [ ] Dividir grandes blocos
* [ ] Corrigir oclusão
* [ ] Corrigir transparência
* [ ] Corrigir colisão
* [ ] Conferir câmera
* [ ] Conferir performance

## Cemitério / ruínas

* [ ] Dividir grandes blocos
* [ ] Corrigir oclusão
* [ ] Corrigir colisão
* [ ] Conferir câmera
* [ ] Conferir performance

## Técnica

A solução definitiva deve preferencialmente ser feita no Blender.

O protótipo de divisão automática com:

* `union-find`;
* `autoOcc`;
* separação de geometria;

pode servir como apoio.

---

# 74. PERFORMANCE

* [ ] FPS em batalha
* [ ] FPS em transformação
* [ ] FPS com muitos efeitos
* [ ] FPS em cenários grandes
* [ ] Memória
* [ ] Loading
* [ ] Descarregamento
* [ ] Partículas
* [ ] Listeners
* [ ] Objetos não destruídos
* [ ] Mobile

---

# 76. ARQUITETURA DOS MODOS

Torneio e Torre devem reutilizar:

* [ ] Sistema de combate
* [ ] Sistema de personagens
* [ ] Sistema de IA
* [ ] Sistema de HUD
* [ ] Sistema de câmera
* [ ] Sistema de seleção
* [ ] Sistema de regras
* [ ] Sistema de áudio
* [ ] Sistema de localização

Não criar um segundo sistema de combate separado para cada modo.

---

# 76.5 ANÁLISE DO JOGO (v3.10.1) — MELHORIAS NOVAS

Levantado em 2026-10-08 olhando o código e o jogo rodando. Só entra aqui o que ainda NÃO estava no TODO (ou estava
genérico demais), com o motivo. Nenhum item é de balanceamento.

## Carregamento e desempenho (celular primeiro)

* [ ] **Carregar sob demanda:** hoje a abertura baixa TUDO — `preloadModels` (todos os ~25 `.glb`, 22 MB) e
  `preloadArenas` (os 5 cenários, 16 MB). Baixar só no "Carregamento" os lutadores escolhidos (2, ou 6 na equipe) +
  as formas deles + o cenário, com cache; a seleção mostra os retratos/miniaturas.
* [ ] **Comprimir os `.glb`** (meshopt ou Draco; texturas em KTX2/WebP). O maior é o Diabo (1,6 MB).
* [x] **Contador de desempenho de dev** (feito em 2026-10-22: `src/dev/perf.js`, `?perf` ou F8 no dev) (FPS, memória, objetos na cena) para medir cada cenário/personagem antes e
  depois das otimizações acima.

## Opções e acessibilidade

* [ ] **Remapear teclas e botões** (hoje fixos em `config/controls.js`), salvo no navegador.
* [x] **Falas:** opção de desligar as falas durante a luta (Opções › Partida › Falas na luta, 2026-10-22).

## Personagens e animação

* [x] **Pose de vitória própria para o Arthur** (`vic_arthur`: a sniper apoiada no ombro; `victoryProp` mostra a arma
  na vitória). Correção da análise: a Lírio já tinha a dela (`victory_hammer`, a Leonora erguida).
* [x] **REAJUSTE DAS ANIMAÇÕES** — 2ª parte (2026-10-26, pacote aprovado pelo dono): Quaternius **Universal Animation
  Library** (Standard, grátis, licença CC0 conferida no License.txt), baixado de quaternius.itch.io. O pacote NÃO vai
  para o repositório; `tools/anim/retarget-ual.mjs` redireciona as animações para o esqueleto do jogo (giro de cada
  osso desde a pose T da fonte, calibrado para o repouso do jogo; quadril e tronco medidos como segmento; passada tirada
  do arquivo com root motion) e grava `src/anim/ualClips.js` (12 clipes `ual_*`: andar, trote, corrida, pulo, queda,
  rolamento, reações, idle, agachado, morte). No jogo: `run` ← Jog_Fwd_Loop, `walk` ← Walk_Loop, `fall` ← Jump_Loop
  (as feitas à mão ficam como `*_classic`); interpolação linear para clipes densos (`clip.linear`). Ficam os próprios:
  pulo, dash, esquiva (tempo de jogabilidade) e a reação a golpe (o Hit_Chest do pacote é fraco demais — comparado na
  tela). Conferido na tela: tronco igual ao da fonte (idle 2°, andar 5°, trote 23°), corrida casando a velocidade.
  1ª parte feita em 2026-10-23 (`anim/locomotionClips.js`): corrida, caminhada, pulo,
  queda, dash, esquiva e reação a golpe refeitos à mão com ciclos de verdade (contato, absorção, passagem, impulso; giro
  do quadril, contra-giro do tronco, cabeça estabilizada); a caminhada de costas e as das formas saem deles. FALTA a
  importação de um pacote gratuito: precisa do OK do dono para o pacote escolhido (ex.: Quaternius Universal Animation
  Library, CC0) — baixar arquivos de terceiros não é feito sem aprovação — e o redirecionamento para o esqueleto.
  Pedido original (2026-10-23: "as animações do jogo já são antigas pro nível que está o jogo"): importar animações de movimento GRATUITAS e de licença livre (ex.: Quaternius Universal Animation Library,
  CC0; conferir a licença de cada pacote antes de usar), redirecionar para o esqueleto do jogo (`anim/clips.js` hoje é
  todo feito à mão em poses-chave) e ajustar para o estilo da luta: andar, correr, pular, cair, esquiva, dash, idle,
  levar golpe. Começar pela movimentação (é o que mais aparece) e manter as poses de golpe próprias de cada personagem.
* [x] **Idles próprios** (2026-10-23, `anim/idleClips.js`): 18 posturas novas — os 8 que dividiam `idle_knife`, os 4 de
  `idle_katana` e os 6 de `idle_fist` ganharam a sua (ex.: Jae agachada com o punhal perto do rosto, Xande com o taco no
  ombro e o skate à frente, Joui no iaijutsu, Cristopher gingando na guarda de boxe, Kian sereno de braços abertos).
  Ainda dividem: Balu e Lírio (`idle_hammer`), Erin e Gal Sal (`idle_dual`), Arnaldo e Magistrada (`idle_arnaldo`).

## Qualidade do código e testes

* [ ] **Dividir os arquivos gigantes:** `combat/abilities.js` (3 024 linhas) e `combat/Fighter.js` (2 810) em módulos
  por família (movimento, buffs, invocações, agarrão, esquiva, transformação).
* [ ] **Teste de fumaça automático dos kits:** todas as habilidades, especiais, agarrões e transformações de todos os
  personagens, sem erro e sem cinemática presa (hoje é feito à mão no navegador) — num navegador sem tela (ex.:
  Playwright) dentro do `npm test`.
* [ ] **Mais testes de sistema:** só 28 testes hoje; faltam Barra de Transformação, Despertar, volta da forma no fim do
  round, cutscene do agarrão e o aprendizado da CPU.
* [ ] **Script `npm run balance`:** o §32 manda rodar, mas ele não existe no `package.json` — rodar o `runBalance` num
  navegador sem tela e salvar a tabela em arquivo.

## Online

* [ ] **Netcode com rollback** no lugar do lockstep com atraso (hoje a luta espera o quadro do outro chegar): muito
  melhor com ping alto. A simulação já usa sorteio com semente; falta salvar/restaurar o estado da luta.

## Para o jogador (fora do Torneio/Torre)

* [ ] **Perfil e estatísticas salvas:** vitórias por personagem, mais usado, maior combo, tempo jogado.
* [ ] **Fichas dos personagens:** galeria com a lore de cada um (o banco `lore/membros.json` já existe).
* [ ] **Desafios de combo** curtos por personagem, dentro do Treino.

---

# 77. REGRESSÃO FINAL

## Combate

* [ ] Sem combo infinito
* [ ] Sem grab impossível
* [ ] Sem especial invisível
* [ ] Sem esquiva sem counterplay
* [ ] Sem transformação quebrada
* [ ] Sem habilidade inútil
* [ ] Sem loops

## Personagens

* [ ] Todos carregam
* [ ] Todos possuem habilidades
* [ ] Todos possuem vitória
* [ ] Todos possuem introduções
* [ ] Todos possuem IA
* [ ] Todos possuem transformação quando aplicável
* [ ] Nenhum placeholder inesperado

## Rede

* [ ] LAN
* [ ] Radmin
* [ ] Sincronização
* [ ] Desconexão
* [ ] Failover

## Modos

* [ ] Batalha
* [ ] Treino
* [ ] CPU × CPU
* [ ] LAN/Online
* [ ] Torneio
* [ ] Torre

## Mobile

* [ ] Menu
* [ ] Seleção
* [ ] Batalha
* [ ] HUD
* [ ] Controles

## Idiomas

* [ ] Português BR
* [ ] Português PT
* [ ] Inglês
* [ ] Espanhol
* [ ] Alemão
* [ ] Francês
* [ ] Italiano
* [ ] Russo
* [ ] Chinês
* [ ] Japonês
* [ ] Coreano
* [ ] Turco
* [ ] Polonês

---

# 78. NÃO FAZER AGORA

* [ ] Não recriar modelos que já estão bons
* [ ] Não adicionar personagens em massa antes do balanceamento
* [ ] Não tratar buffs/nerfs como definitivos
* [ ] Não criar sistema elemental universal
* [ ] Não transformar TODO em changelog
* [ ] Não balancear com uma única partida
* [ ] Não criar segundo sistema de combate para Torneio/Torre
* [ ] Não criar dezenas de recompensas antes de definir a Torre
* [ ] Não polir cenários antes de estabilizar gameplay
* [ ] Não adicionar efeitos que prejudiquem leitura
* [ ] Não criar tradução hardcoded
* [ ] Não depender de uma única fonte que não suporte idiomas asiáticos/cirílicos
* [ ] Não implementar sistemas grandes sem reutilizar arquitetura existente

---

# 79. ORDEM FINAL DE EXECUÇÃO

## ETAPA 1 — ESTABILIDADE

* [x] Git
* [x] Limpeza
* [x] Check
* [x] Build
* [x] Regressão

## ETAPA 2 — PERSONAGENS RECENTES

* [x] Arnaldo
* [x] Anfitrião
* [x] Veríssimo
* [x] Animações
* [x] Efeitos
* [x] IA
* [x] Testes

## ETAPA 3 — COMBATE

> Etapas 3, 4 e 5 testadas e confirmadas pelo usuário em 2026-10-09.

* [x] Dodge
* [x] Substitution
* [x] Grab
* [x] Throw tech
* [x] Combo
* [x] Defesa
* [x] Wakeup
* [x] Telegraphs
* [x] Transformações
* [x] Assists

## ETAPA 4 — BALANCEAMENTO

* [x] Telemetria
* [x] CPU × CPU
* [x] 2–3 partidas por confronto
* [x] Buffs
* [x] Nerfs
* [x] Reanálise
* [x] Testes manuais
* [x] Nova telemetria

**Nenhum valor é definitivo antes desta etapa.**

## ETAPA 5 — INFRAESTRUTURA

* [x] Sistema de idiomas (interface; conteúdo dos personagens ainda em português — §37/§40)
* [x] Português BR
* [x] Português PT
* [x] Inglês
* [x] Espanhol
* [x] Alemão
* [x] Francês
* [x] Italiano
* [x] Russo
* [x] Chinês
* [x] Japonês
* [x] Coreano
* [x] Turco
* [x] Polonês
* [x] LAN
* [x] Radmin
* [x] Mobile
* [x] iPhone
* [x] Android

## ETAPA 6 — NOVOS MODOS

### Torneio

* [x] Local
* [ ] Online
* [x] 1–8 jogadores (2–8 participantes)
* [x] CPU
* [x] Equipes
* [x] Assistências
* [x] Chave
* [x] Regras
* [x] Resultados
* [x] Campeão

### Torre

* [x] Seleção
* [x] Andares
* [x] Adversários
* [x] Progressão
* [x] Recuperação (cada andar começa com vida e sanidade cheias)
* [ ] Modificadores
* [x] Chefes (vilão fortalecido no topo de cada uma das 8 torres)
* [x] Chefe final (Torre de Babel)
* [ ] Recompensas
* [x] Topo
* [x] Recorde

## ETAPA 7 — POLIMENTO

* [ ] HUD
* [ ] Menus
* [ ] Seleção
* [ ] Câmera
* [ ] Vitória
* [ ] Animações
* [ ] Efeitos
* [ ] Áudio
* [ ] Cenários
* [ ] Performance

## ETAPA 8 — CONTEÚDO FUTURO

* [x] Jae-yoon (Jae → X)
* [x] Dalmo (Dalmo → Colosso)
* [ ] Novas transformações
* [ ] Novos personagens
* [ ] Novos cenários
* [ ] Novos idiomas
* [ ] Novos modos

---

# 80. CHECKLIST DE LANÇAMENTO

Antes de considerar uma versão realmente pronta:

## Gameplay

* [ ] Combate estável
* [x] Balanceamento testado (v4.13.1: 4 rodadas de 1482 lutas com os 39 + focadas; 34–35 dos 39 entre 35% e 65%, os de
      fora na beirada, 32–34%)
* [ ] Sem infinitos
* [ ] Sem exploits conhecidos
* [ ] Specials legíveis
* [ ] Transformações funcionando
* [ ] IA funcionando

## Conteúdo

* [ ] Personagens
* [ ] Introduções
* [ ] Vitórias
* [ ] Transformações
* [ ] Cenários
* [ ] Efeitos
* [ ] Áudio

## Modos

* [ ] Batalha
* [ ] Treino
* [ ] CPU × CPU
* [ ] LAN/Online
* [ ] Torneio
* [ ] Torre

## Rede

* [ ] PC × PC
* [ ] Radmin
* [ ] Sincronização
* [ ] Desconexão

## Mobile

* [ ] Android
* [ ] iPhone

## Internacionalização

* [ ] PT-BR
* [ ] PT-PT
* [ ] EN
* [ ] ES
* [ ] DE
* [ ] FR
* [ ] IT
* [ ] RU
* [ ] ZH
* [ ] JA
* [ ] KO
* [ ] TR
* [ ] PL

## Interface

* [ ] Menu
* [ ] Seleção
* [ ] Configurações
* [ ] HUD
* [ ] Vitória
* [ ] Derrota
* [ ] Loading
* [ ] Idioma

---

# 81. VISÃO FINAL

O Arena Paranormal deve chegar a um estado em que seja possível:

### LUTAR

Combate 3D completo com:

* combos;
* defesa;
* dodge;
* substituição;
* grabs;
* especiais;
* transformações;
* assistências;
* equipes.

### JOGAR DIFERENTES MODOS

```text
BATALHA
TREINO
CPU × CPU
TORNEIO
TORRE
LAN / ONLINE
```

### DISPUTAR TORNEIOS

Permitir:

**1–8 jogadores → local/online → equipes → chave → confrontos → final → campeão.**

### SUBIR A TORRE

Permitir:

**andar → batalha → vitória → subir → batalha mais difícil → chefe → topo.**

### JOGAR NO IDIOMA PREFERIDO

Permitir seleção entre os principais idiomas:

**Português BR, Português PT, Inglês, Espanhol, Alemão, Francês, Italiano, Russo, Chinês, Japonês, Coreano, Turco, Polonês e futuras expansões.**

### TER PERSONAGENS ÚNICOS

Cada personagem deve possuir:

* personalidade;
* diálogos;
* introduções;
* frases de vitória;
* habilidades próprias;
* efeitos próprios;
* animações;
* transformações;
* IA coerente;
* identidade visual.

### REGRA PRINCIPAL DO PROJETO

> **O jogo deve ficar bom antes de ficar enorme.**

E, principalmente:

> **Nenhum buff, nerf ou valor de balanceamento deste TODO deve ser considerado definitivo antes da bateria de testes. Os dados de telemetria, partidas CPU × CPU e testes manuais devem determinar o balanceamento final.**

- [x] **Nomes das Transformações com a cara do personagem** (pedido do dono, 2026-11-01: "gladiador paranormal e combate
  perfeito não têm a cara do personagem; Kaiser transformado deveria ser Angel of the Night"): Kaiser **Angel of the
  Night** (Combate Perfeito), Xande **Rei do Rolê** (Gladiador Paranormal), Balu **O Urso Acordou** (Resistência à Dor),
  Lírio **A Fúria da Leonora** (Sangue de Ferro), Nubi **O Chacal Desperto** (Afinidade com a Morte). Os efeitos não
  mudaram; o poder canônico fica no comentário. Os outros já tinham nome próprio (Olhos Sempre Abertos, Shi no Kage, O
  Colosso, Em Nome do Caos, Tocado pela Coroa...).
