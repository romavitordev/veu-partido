# Referências dos mapas futuros

Levantamento de 2026-11-09 para a seção "Cenários de luta" do TODO. Pedido do dono: "antes de modelar qualquer coisa busque referências na wiki e episódios, tire print, compare, escreva". Todos os 8 lugares abaixo devem virar arena um dia, por isso o repertório cobre todos.

## Como foi feito

- **Wiki:** a página de cada lugar foi baixada pela API da wiki (ordemparanormal.fandom.com/pt-br). Também foram baixadas Couraças, PSIKOLERA, Harpia, Cristino e Coroa de Espinhos (local), porque elas descrevem os lugares que não têm página própria.
- **Imagens da wiki:** 139 imagens dos lugares, baixadas na largura máxima de 1280 px:
  - os modelos 3D oficiais ("Modelo 3D - …", feitos em Unity para a live);
  - as fotos de cômodos, as plantas e os mapas desenhados;
  - os panfletos e pôsteres que aparecem no jogo.

  As imagens dos personagens ficaram de fora.
- **Episódios:** 32 prints tirados dos episódios oficiais no YouTube.
  - As cenas foram achadas pelas miniaturas do próprio YouTube (uma a cada ~3 min) e depois capturadas no minuto exato.
  - O nome de cada arquivo diz a campanha, o episódio e o minuto. Exemplo: `HEX05_4h10_abrigo_escarlata.png` é Hexatombe, episódio 5, 4h10.
- **Onde estão:** `Referencias visuais/Mapas/<mapa>/wiki/` e `…/episodios/`.
  - Cada mapa também tem uma folha de contato com tudo junto: `Referencias visuais/Mapas/<mapa>.jpg`.
  - É arte de terceiros, então fica só na máquina: a pasta está no `.gitignore` (só os `.md` entram no git). Para refazer, os links estão neste documento.
- **Legenda:** **canon** é o que a wiki ou o episódio mostram. **PROPOSTA** é o que o jogo inventa para virar arena.

## Visão geral

| Mapa | Campanha | Material | Luz e paleta | Recomendação |
|---|---|---|---|---|
| Ferro Velho (Base dos Couraças) | Hexatombe ep. 5 e 7 | 21 renders 3D, 4 prints, arte do carro | Cânion; noite azul com janelas vermelhas, ou pôr do sol laranja | **1ª escolha** |
| Circo dos PSIKOLERA | Hexatombe ep. 4, 7 e 8 | 16 imagens, 4 prints | Dia de sol na caatinga; vermelho, azul e amarelo de circo | **2ª escolha** |
| Acampamento dos Pássaros | Hexatombe ep. 3 e 4 | 8 renders 3D, 5 barracas, 3 prints | Névoa vermelha densa, fogueira | Forte, mas fica parecido com o Ferro Velho |
| Sertão / arena final | Hexatombe ep. 10 | 3 prints, mapa, artes conceituais | Lua de Sangue enorme; roxo e vermelho | Boa, mas tem pouco material visual |
| Acampamento Lua da Benquerença | Natal Macabro pt. 1 | 14 renders 3D, 2 mapas em panfleto | Noite azul-petróleo, cabanas de madeira | Boa; atenção, já existe o "Acampamento Varminho" |
| Granja Abobrinha | Sinais do Outro Lado ep. 1 | 9 fotos de cômodos, vista aérea, 2 agroglifos | Pôr do sol laranja e verde; estilo cartunesco | Boa, mas o estilo destoa do resto |
| Mansão Leone | Calamidade ep. 1 | 3 plantas, 2 mapas, 9 cômodos (vista de cima) | Madeira, tapete vermelho, sangue | Muito parecida com a Mansão Endiabrada |
| Vilarejo Treb Ciach | A Vigília ep. 1 | Mapa desenhado, 7 recortes, 3 prints | Cinza de neblina, casas de palha, fogueira do Samhain | Campanha ainda em andamento (ep. 3 sem data) |

---

## 1. Ferro Velho: a base dos Couraças

**Fontes**
- Wiki: [Ferro Velho](https://ordemparanormal.fandom.com/pt-br/wiki/Ferro_Velho), [Couraças](https://ordemparanormal.fandom.com/pt-br/wiki/Coura%C3%A7as) e [Coroa de Espinhos (local)](https://ordemparanormal.fandom.com/pt-br/wiki/Coroa_de_Espinhos_(local)).
- Episódios:
  - [HEX ep. 5, 3h49](https://youtu.be/zsOSZ_r9mhg?t=13760): chegada de Jae e Labirinto.
  - [HEX ep. 5, 4h00](https://youtu.be/zsOSZ_r9mhg?t=14420): o cânion à noite.
  - [HEX ep. 5, 4h10](https://youtu.be/zsOSZ_r9mhg?t=15000): o Abrigo da Escarlata.
  - Guerra no [HEX ep. 7](https://youtu.be/K_c2VdmPuLg).

**Canon (wiki)**
- Antigo desmanche e depósito de carcaças de carro.
- Fica no fundo de um cânion, com descida em zigue-zague.
- Portão enorme entre duas torres de observação, protegido por estacas de madeira.
- Dentro:
  - pilhas de carcaças;
  - uma grua/guindaste sempre em movimento, que guardava o Miasma, o sacrifício dos Couraças;
  - oficina mecânica, garagem e galpão;
  - o Abrigo: um quarto de motel com espelhos e correntes.
- Cheiro de óleo e ferrugem.
- Na guerra do dia 3:
  - o Mutilador Noturno arremessa dinamite e destrói a blindagem da grua;
  - o Chispa bate o carro num paredão de pedra;
  - o abrigo termina incendiado.

**O que os renders e prints mostram**
- Paredões de pedra altos dos dois lados.
- A grua de treliça amarela com a cabine blindada no alto.
- Muralha de sucata com estacas e duas torres no portão, com janelas iluminadas de vermelho.
- Lâmpadas penduradas em postes de madeira.
- O F4000 (caminhão com espinhos e lâmina) estacionado.
- A arte do episódio mostra um grande símbolo de garras pintado de vermelho no paredão do cânion.
- Duas luzes oficiais:
  - noite: lua azul cheia, névoa azul e luz vermelha nas janelas;
  - pôr do sol: laranja forte com poeira.
- No episódio 5 o Abrigo é vermelho saturado, com correntes no teto.

**Comparação**
- A wiki e o modelo 3D batem.
- O episódio acrescenta as marcas em "X" verde-neon nas carcaças, os rastros do ritual do X.

**PROPOSTA para arena**
- Pátio circular (raio ~20) entre as pilhas de carcaças. As pilhas formam a borda.
- A grua fica atrás de um dos lados, na silhueta.
- O portão com as torres fica do lado oposto.
- Luz de noite azul com janelas vermelhas, ou variação "pôr do sol".
- Dá para reaproveitar a ideia dos `Breakable` (carcaças/tambores).
- O F4000 pode ficar parado ao fundo.

## 2. Circo dos PSIKOLERA (Circo dos Irmãos Davo)

**Fontes**
- Wiki: [Circo dos Irmãos Davo](https://ordemparanormal.fandom.com/pt-br/wiki/Circo_dos_Irm%C3%A3os_Davo) e [PSIKOLERA](https://ordemparanormal.fandom.com/pt-br/wiki/PSIKOLERA).
- Episódios:
  - [HEX ep. 4, 3h18](https://youtu.be/yh_J363Ork4?t=11928): fachada e bandeirolas.
  - [3h24](https://youtu.be/yh_J363Ork4?t=12250): barraca de jogo.
  - [3h36](https://youtu.be/yh_J363Ork4?t=13000): leitura de mão.
  - [3h55](https://youtu.be/yh_J363Ork4?t=14100): dentro da lona.
  - Ataque dos Vampiros no ep. 7 e sequestro do Caíto no ep. 8.

**Canon**
- Circo itinerante "Show do Diabo", dos anos 60, que ficou parado na Coroa de Espinhos.
- O letreiro está quebrado ("Circo dos Iãs D").
- A banda transformou o lugar em base e cobriu tudo de pôsteres e pichações.
- Lado de fora, à esquerda: barracas de jogos em fila (dardos, acerte o pato, basquete, quiromancia).
- Perto da lona: área dos canhões, medidor de força e placa de foto.
- Dentro da lona:
  - arquibancadas de madeira e cadeiras de plástico;
  - palco improvisado com caixas de som;
  - no centro, o **globo da morte** adaptado como trono do sacrifício (Caíto).
- Lança-chamas instalados como defesa.

**O que as imagens mostram**
- Céu azul de dia e chão de terra clara.
- Mata seca em volta e paredões de arenito no horizonte.
- Barracas em vermelho, amarelo e azul gastos.
- A entrada da lona tem uma enorme cara de demônio pintada, com chifres vermelhos e boca aberta como porta.
- A lona é listrada de vermelho e branco.
- Bandeirolas entre postes.
- Os pôsteres "O Circo" (palhaço) e os panfletos da banda estão salvos.

**Comparação**
- No episódio, a lona aparece com a pintura dos PSIKOLERA por cima: logo e caveira em fundo azul.
- A arte de "Arquivos Secretos" mostra o circo original em chamas, com uma fachada de diabo.

**PROPOSTA para arena**
- **Dentro da lona:** picadeiro circular com o globo da morte no centro (cenário sólido, os lutadores circulam em volta) e arquibancadas em anel como borda.
- **Ou do lado de fora:** pátio entre as barracas e a fachada de demônio.
- É a única arena de dia: contrasta com todas as outras, que são noturnas.

## 3. Acampamento dos Pássaros

**Fontes**
- Wiki: [Acampamento dos Pássaros](https://ordemparanormal.fandom.com/pt-br/wiki/Acampamento_dos_P%C3%A1ssaros).
- Episódios:
  - Pós-créditos do HEX ep. 3.
  - [HEX ep. 4, 4h14](https://youtu.be/yh_J363Ork4?t=15250): barraca com o símbolo de Sangue.
  - [4h18](https://youtu.be/yh_J363Ork4?t=15500): cabeça na estaca.
  - [4h23](https://youtu.be/yh_J363Ork4?t=15800): o lago na névoa.

**Canon**
- Montado à beira de um grande lago, com uma barraca para cada Pássaro: Corvo, Coruja, Harpia, Papagaio e Pomba.
- No centro:
  - fogueira grande, de troncos e partes de corpos;
  - caldeirão;
  - bancos de madeira.
- Depois do massacre dos Vampiros (noite do dia 1):
  - névoa espessa;
  - sangue por todo lado;
  - cabeças cravadas em estacas na frente das barracas.
- A barraca do Corvo tem uma estátua do Serafim Vermelho e um grande símbolo de Sangue de madeira.
- A barraca do Pomba fica mais afastada; foi assim que ele escapou.

**O que as imagens mostram**
- Tudo é tingido de vermelho pela névoa.
- Lonas de barraca vermelhas e cinza-claro, com estacas de madeira.
- Lanternas vermelhas penduradas.
- Árvores secas e capim alto.
- Fogueira laranja no meio.
- Variações oficiais de luz: laranja de pôr do sol, roxo e vermelho.

**Comparação**
- O texto e o modelo batem.
- O print do episódio mostra o lago como um branco de névoa sem horizonte. Para uma arena, isso é ótimo: a borda some na névoa.

**PROPOSTA para arena**
- Fogueira e caldeirão no centro, como obstáculo.
- As 5 barracas em anel.
- Estacas com cabeças só como silhueta, para não exagerar no gore.
- O lago em um dos lados, sumindo na névoa vermelha.

## 4. Sertão de Hexatombe: a arena final (Cristino e Harpia)

**Fontes**
- Wiki: [Coroa de Espinhos (local)](https://ordemparanormal.fandom.com/pt-br/wiki/Coroa_de_Espinhos_(local)), [Cristino](https://ordemparanormal.fandom.com/pt-br/wiki/Cristino) e [Harpia](https://ordemparanormal.fandom.com/pt-br/wiki/Harpia).
- Episódios:
  - [HEX ep. 10, 2h50](https://youtu.be/g53ZfYHUQOw?t=10200).
  - [2h58](https://youtu.be/g53ZfYHUQOw?t=10700).
  - [3h08](https://youtu.be/g53ZfYHUQOw?t=11300).
  - [Mapa no HEX ep. 4, 2h14](https://youtu.be/yh_J363Ork4?t=8094).
  - [Cidade Deserta no HEX ep. 4, 1h57](https://youtu.be/yh_J363Ork4?t=7029).

**Canon**
- A Coroa de Espinhos fica na caatinga, entre Bahia, Pernambuco e Piauí.
- Mata branca e seca e clima árido.
- A partir do 4º dia, o Sangue deixa o solo e a vegetação parcialmente vermelhos.
- Na noite final, Cristino espera na "arena do combate final" observando a **Lua de Sangue**; Argano chega carregando os crânios.
- A wiki **não descreve** a arena; o visual vem só do episódio.
- O mapa desenhado mostra trilhas que formam uma lua minguante.

**O que os prints mostram**
- Clareira de terra roxa e vermelha.
- Mata espinhosa em volta.
- Uma Lua de Sangue enorme no céu, com luz rosa e roxa.
- Silhuetas de galhos secos.

**Comparação**
- A wiki dá o clima (caatinga, Sangue); o episódio dá a imagem.
- Os outros lugares da Coroa (Igreja Antiga no morro, Mercado Central, Mansão Abandonada, porta do bunker) têm uma imagem cada e podem virar decoração de fundo.

**PROPOSTA para arena**
- Clareira circular de terra avermelhada e cercas de mandacaru e xique-xique.
- A Lua de Sangue grande no céu, e a Igreja Antiga no morro ao longe.
- É fácil de modelar (terreno, plantas, céu) e o impacto visual é forte.

## 5. Acampamento Lua da Benquerença (Natal Macabro)

**Fontes**
- Wiki: [Acampamento Lua da Benquerença](https://ordemparanormal.fandom.com/pt-br/wiki/Acampamento_Lua_da_Benqueren%C3%A7a).
- Episódios:
  - [Natal Macabro pt. 1, 1h58](https://youtu.be/YrEdL71DYpY?t=7104).
  - [4h25](https://youtu.be/YrEdL71DYpY?t=15936).
  - [4h31](https://youtu.be/YrEdL71DYpY?t=16300).

**Canon**
- Complexo de cabanas de madeira à beira de estrada, no Parque Ecológico Hadoque (Inquisidor do Vale, PR), em volta do **Lago Diamante**.
- Casa Juno, onde Alice Lucina fazia rituais de Sangue.
- Lenda da "Caçadora de Gente".
- Os panfletos de 2013 e 2022 trazem o mapa completo:
  - cabanas Eclipse e outras;
  - lago, píer e trilhas.

**O que as imagens mostram**
- Noite azul-petróleo com lua cheia e névoa.
- Cabanas de madeira escura sobre pilotis, com varanda.
- Interiores quentes: lâmpadas amarelas e papel de parede florido na Casa Juno.
- Cerca de madeira, árvores secas e a lápide de Alice Lucina.
- Uma árvore de Natal no teaser da Casa Juno.

**Comparação**
- A wiki é curta.
- O mapa do panfleto e os 14 renders dão a planta inteira.

**PROPOSTA para arena**
- Clareira entre três cabanas, com o píer do lago ao fundo.
- Luz azul da lua e janelas amarelas.
- Toque de Natal: luzinhas e a árvore da Casa Juno.
- **Atenção:** já existe a arena "Acampamento Varminho" (noite azul na mata). Para não repetir, esta precisa do lago e das cabanas como protagonistas.

## 6. Granja Abobrinha (Sinais do Outro Lado)

**Fontes**
- Wiki: [Granja Abobrinha](https://ordemparanormal.fandom.com/pt-br/wiki/Granja_Abobrinha).
- Episódios:
  - [SDOL ep. 1, 2h22](https://youtu.be/k5y48mQTdpE?t=8526): a porteira.
  - [3h11](https://youtu.be/k5y48mQTdpE?t=11484): a sala dos Magal.

**Canon**
- Pequena fazenda da Família Magal.
- Casa de dois andares:
  - sala, cozinha e banheiro no térreo;
  - corredor com quadros e três quartos em cima.
- Lado de fora:
  - casa na árvore (o Jerson, as larvas e o centro de pesquisa do Morato);
  - chiqueiro, curral e galinheiro;
  - poço;
  - milharal com **agroglifos** (sigilos de Energia e Conhecimento).

**O que as imagens mostram**
- Céu de pôr do sol laranja.
- Placa de madeira "Granja Abobrinha" na entrada.
- Casa branca com telhado de telha.
- Terra batida e mata verde em volta.
- Os agroglifos vistos de cima.
- O estilo da campanha é **cartunesco** (personagens chibi), diferente do resto do jogo.

**Comparação**
- A wiki lista os cômodos; as fotos oficiais mostram cada um.
- O episódio confirma a porteira com a van chegando ao pôr do sol.

**PROPOSTA para arena**
- O terreiro entre a casa, o poço e o curral, com o milharal e um agroglifo no chão (marca de luz de Energia).
- Luz de pôr do sol, a única arena com essa luz.
- Manter o realismo do jogo e não copiar o estilo chibi.

## 7. Mansão Leone (Calamidade)

**Fontes**
- Wiki: [Mansão Leone](https://ordemparanormal.fandom.com/pt-br/wiki/Mans%C3%A3o_Leone).
- Episódios:
  - [OPC ep. 1, 1h53](https://youtu.be/TRSlNehdWzs?t=6804): saguão.
  - [2h07](https://youtu.be/TRSlNehdWzs?t=7668): salão da escada.
  - [2h16](https://youtu.be/TRSlNehdWzs?t=8208): escritório e sala.

**Canon**
- Base da máfia Leone.
- Térreo:
  - Saguão de Entrada com porta dupla, tapete comprido e mesa no fundo;
  - Frigorífico com a passagem secreta atrás de uma geladeira;
  - Salão da Escada (onde a Rana abriu o portal).
- 1º andar: Enfermaria e Escritório do Marco.
- Bunker: Salão de Investigação, Informática, Armas e Cofre (onde o Diabo aparece).
- Depois vira base da Ordo Realitas.

**O que as imagens mostram**
- Mapas vistos de cima, no estilo do tabuleiro da live.
- Piso de madeira, tapetes vermelhos com estampa, escada com corrimão vermelho e plantas nos cantos.
- Depois do massacre, sangue espalhado pelo chão.
- O jardim da frente é simétrico, com chafariz.
- As plantas baixas estão em italiano ("Piano Terra", "Sala d'ingresso").

**Comparação**
- Tudo que se vê é vista de cima.
- Não existe render 3D oficial; a altura e as paredes seriam inferidas.

**PROPOSTA para arena**
- Saguão com o tapete vermelho e a escada no fundo, ou o cofre do bunker (metal frio, contraste forte).
- **Atenção:** é muito parecida com a Mansão Endiabrada (madeira escura, tapete). Só vale se for bem diferente, por exemplo o bunker ou o frigorífico.

## 8. Vilarejo Treb Ciach (A Vigília)

**Fontes**
- Wiki: [Treb Ciach](https://ordemparanormal.fandom.com/pt-br/wiki/Treb_Ciach).
- Episódios:
  - [AV ep. 1, 2h20](https://youtu.be/AWb-Y9nXZkE?t=8400): interior de madeira.
  - [4h26](https://youtu.be/AWb-Y9nXZkE?t=15960): ruína de pedra.
  - [5h08](https://youtu.be/AWb-Y9nXZkE?t=18480): casas de palha.

**Canon**
- Província no noroeste da Irlanda.
- Ritual anual de Samhain: a **chama de proteção** é renovada numa grande fogueira no vilarejo.
- Casas de barro, madeira, pedra e palha.
- Em volta:
  - Árvore Anciã (campo florido, apiário, porta de pedra);
  - Fazenda;
  - Igreja Abandonada com cemitério sem nomes;
  - Lago com estrutura de madeira e casa do Druida;
  - Pântano dos Afogados;
  - Tenda Militar.

**O que as imagens mostram**
- O mapa é desenhado à mão, com vinhetas de cada lugar.
- No episódio:
  - cinza de neblina, quase monocromático;
  - casas de palha com telhado grosso;
  - muro de pedra com cruz celta;
  - interior de madeira iluminado por lareira laranja.

**Comparação**
- A campanha ainda está no ar: o ep. 3 está "TBA" no módulo da wiki.
- Mais material deve sair; vale esperar antes de fechar o visual.

**PROPOSTA para arena**
- Praça do vilarejo com a grande fogueira do Samhain no centro (a chama de proteção) e casas de palha em volta.
- Neblina cinza com o fogo laranja como única cor.

---

## Recomendação para os 2 primeiros

1. **Ferro Velho:** o que tem mais material, com 21 renders oficiais por vários ângulos e duas luzes prontas. O pátio entre as pilhas de sucata vira arena naturalmente.
2. **Circo dos PSIKOLERA:** visual único (dia, cores de circo, fachada de demônio, globo da morte). É a arena mais diferente de todas as que já existem.

Alternativa se o dono quiser variar de campanha: **Sertão (arena final)** ou **Acampamento Lua da Benquerença**.
