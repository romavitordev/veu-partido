# Fontes das habilidades: episódio, minuto e cena (TODO 2.5)

Levantamento de 2026-11-08 para o item "Verificar as cenas relevantes nos episódios oficiais".

## Como foi feito

- **Wiki:** as páginas dos 39 personagens na wiki da Ordem Paranormal (ordemparanormal.fandom.com) foram baixadas pela API. As referências `{{Citar ep|campanha|episódio|t=minuto}}` foram convertidas para "campanha, episódio, minuto" pelo `Módulo:Episódios/dados` da própria wiki.
- **Ligação habilidade → cena:** feita automaticamente. Vale primeiro a legenda de imagem que cita a habilidade (por exemplo "Kian usando o Ritual de Inexistir"). Sem legenda, vale a citação mais próxima depois da menção à habilidade na página. Por isso cada linha é uma **pista para conferir**, não uma prova.
- **HQs:** a HQ "Ordem Paranormal: Assimilação → Desconjuração" cobre de Iniciação até Desconjuração parte 2. O dono mandou o link no Scribd. São 764 páginas só de imagem, sem texto pesquisável, então elas ficam para conferências pontuais dos personagens dessas campanhas: Arthur, Joui, Kaiser, Dante, Erin, Agatha, Kian, Gal/Sal e Magistrada.
- **Versões de cada personagem (orientação do dono, 2026-11-08):** cada versão segue a fonte do próprio arco. O Joui de O Segredo na Floresta não é o Joui de Calamidade. A HQ vale como referência oficial (visual e de cena) para as versões da Equipe E / Desconjuração. Calamidade ainda não tem HQ; lá valem a wiki e os resumos dos episódios.
- **Episódios:** nenhum episódio foi assistido. As cenas sem citação ficam para conferir quando houver tempo.

## Resultado

- 118 de 295 habilidades têm cena citada na wiki.
- As outras 177 são de dois tipos:
  - **Habilidades de ficha:** passivas e rituais que aparecem na ficha do personagem, mas sem cena citada.
  - **PROPOSTAS do jogo:** golpes criados para o combate; os comentários de cada `src/characters/*.js` dizem quais são.
- Os minutos vêm da wiki; quando ela dava só segundos, eles foram convertidos.

## Decisão tomada nesta auditoria

- **Joui com a Shi no Kage, △ + L2:**
  - O golpe se chamava "Decepar", mas na wiki o Decepar é poder da **máscara**, e a forma é a fase em que o Joui já entregou a máscara à Magistrada.
  - O golpe continua (foi pedido explícito do dono e é esgrima da katana), agora com o nome **Corte Ceifador** (PROPOSTA).
  - O Decepar canônico continua só no Joui mascarado, como passiva.

## Tabela por personagem

### ARTHUR CERVERO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Solo do Abutre | — (sem cena citada na wiki) |  |
| Olhos Sempre Abertos | — (sem cena citada na wiki) |  |
| Sniper | — (sem cena citada na wiki) |  |
| Rebirth | Desconjuração, ep. 14, 2h45m00s |  |
| Ódio Incontrolável "Templo do Ódio" | — (sem cena citada na wiki) |  |
| Paralisia de Sangue "Dystopia" | — (sem cena citada na wiki) |  |
| Analisar Brecha | Desconjuração, ep. 18, 42m52s |  |
| Arma de Sangue | Calamidade, ep. 4, 3h29m55s |  |

### JOUI JOUKI

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Execução das Sombras | — (sem cena citada na wiki) |  |
| Shi no Kage | Calamidade, ep. 9, 13m18s | Joui adquirindo a Shi no Kage em |
| Sombra Rasteira | — (sem cena citada na wiki) |  |
| Teleporte das Sombras | Calamidade, ep. 2, 4h05m45s |  |
| Envelhecimento Localizado "Mateo" | — (sem cena citada na wiki) |  |
| Olhar do Desespero | Calamidade, ep. 2, 4h13m54s |  |
| Portal das Sombras | Calamidade, ep. 2, 4h13m54s |  |
| Tomado pelo Ódio | — (sem cena citada na wiki) |  |
| Pavor Anormal | Desconjuração, ep. 16, 35m20s |  |

### KAISER

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Cinerária | Calamidade, ep. 9, 40m21s |  |
| Angel of the Night | Calamidade, ep. 9, 40m21s |  |
| Foto com Flash | — (sem cena citada na wiki) |  |
| Sentir Através "Dendrobium" | — (sem cena citada na wiki) |  |
| Balas Amaldiçoadas | Desconjuração, ep. 4, 1h13m00s |  |
| Granada "Nebulosa" | Desconjuração, ep. 3, 3h40m42s |  |
| Baforada Cinerária | — (sem cena citada na wiki) |  |
| Acácia | — (sem cena citada na wiki) |  |

### DANTE

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Invocação: A Marionete | Calamidade, ep. 0, 3h09m56s | Carente em |
| Olhos Abertos | Calamidade, ep. 0, 3h05m14s | Dante após Transcender com 50% de Exposição Paranormal em |
| Decadenza | — (sem cena citada na wiki) |  |
| Embaralhar "Trinitá" | — (sem cena citada na wiki) |  |
| Tentáculos de Lodo | — (sem cena citada na wiki) |  |
| Cicatrização "Paradiso" | — (sem cena citada na wiki) |  |
| Destruição Temporal "Rotura" | — (sem cena citada na wiki) |  |

### ERIN PARKER

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Supernova | Desconjuração, ep. 2, 2h39m40s |  |
| Em Nome do Caos | — (sem cena citada na wiki) |  |
| Escopeta calibre 12 | Desconjuração, ep. 1, 1h22m38s |  |
| Granada "Supernova" | — (sem cena citada na wiki) |  |
| Granada "Nebulosa" | — (sem cena citada na wiki) |  |
| Bênção Maldita | Desconjuração, ep. 15, 2h01m54s |  |
| Envelhecimento Localizado "Black Hole" | — (sem cena citada na wiki) |  |
| Granada de Luz | — (sem cena citada na wiki) |  |

### AGHATA

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Descarnar | Desconjuração, ep. 16, 23m23s | Agatha usando o Ritual de Descarnar no Arthur em |
| Passagem de Conhecimento Expandido | Desconjuração, ep. 4, 1h10m17s |  |
| Faca Arremessada | — (sem cena citada na wiki) |  |
| Amaldiçoar Arma | — (sem cena citada na wiki) |  |
| Facas Amaldiçoadas | — (sem cena citada na wiki) |  |
| Passagem de Conhecimento | Desconjuração, ep. 4, 1h10m17s |  |
| Leitura de Rituais | — (sem cena citada na wiki) |  |

### BALU

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Pancada do Urso | — (sem cena citada na wiki) |  |
| O Urso Acordou | — (sem cena citada na wiki) |  |
| Machado em Giro | — (sem cena citada na wiki) |  |
| Amaldiçoar Arma com Sangue | — (sem cena citada na wiki) |  |
| Machado Demônio | — (sem cena citada na wiki) |  |
| Fala Imponente | — (sem cena citada na wiki) |  |
| 110% | — (sem cena citada na wiki) |  |
| Colete Físico-Balístico | — (sem cena citada na wiki) |  |

### CARINA LEONE

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Dança dos Leone | — (sem cena citada na wiki) |  |
| Todos os Leone | Calamidade, ep. 3, 0h07m18s |  |
| Glock Silenciada | Calamidade, ep. 0, 0h33m20s |  |
| Faca no Olho | — (sem cena citada na wiki) |  |
| Bater e Reposicionar | — (sem cena citada na wiki) |  |
| Furtividade | — (sem cena citada na wiki) |  |
| Pergaminho da Pertinácia | Calamidade, ep. 12, 2h18m29s |  |

### RUBENS NALUTI

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Pelo Johnny | — (sem cena citada na wiki) |  |
| Ainda Bem Que Eu Voltei | Calamidade, ep. 12, 3h44m12s |  |
| Glock Silenciada | — (sem cena citada na wiki) |  |
| Salto Fantasma | Calamidade, ep. 3, 3h05m07s |  |
| Queima-Roupa | Calamidade, ep. 9, 1h14m17s | Relógio de Arnaldo Fritz em |
| Mira de Elite | — (sem cena citada na wiki) |  |
| Tratar Ferimentos | — (sem cena citada na wiki) |  |
| Coração Pulsante | — (sem cena citada na wiki) |  |

### BEATRICE PORTINARI

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Menina do Pássaro | — (sem cena citada na wiki) |  |
| Lembrar | Desconjuração, ep. 11, 3h17m59s |  |
| Balestra | — (sem cena citada na wiki) |  |
| Voo do Orpheu | — (sem cena citada na wiki) |  |
| Virote Silencioso | — (sem cena citada na wiki) |  |
| Vício em Adrenalina | Desconjuração, ep. 6, 3h25m54s |  |
| Clarão dos LEDs | — (sem cena citada na wiki) |  |

### SENHOR VERÍSSIMO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Oficial Comandante | — (sem cena citada na wiki) |  |
| Líder da Ordo Realitas | Calamidade, ep. 12, 4h20m48s |  |
| Escopeta de Varredura | — (sem cena citada na wiki) |  |
| Inteligência Estratégica | Calamidade, ep. 11, 3h02m28s |  |
| Brecha na Guarda | — (sem cena citada na wiki) |  |
| Em Seu Caminho | Calamidade, ep. 11, 2h37m48s |  |
| Jaqueta de Veríssimo | — (sem cena citada na wiki) |  |

### CRISTOPHER

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Por Você, Filho! | — (sem cena citada na wiki) |  |
| Último Sacrifício | — (sem cena citada na wiki) |  |
| Cena de Ação | — (sem cena citada na wiki) |  |
| Suplex de Dublê | — (sem cena citada na wiki) |  |
| Direção Avançada | Segredo na Floresta, ep. 1, 0h58m59s |  |
| Levanta, Grandão! | — (sem cena citada na wiki) |  |
| A Muralha | — (sem cena citada na wiki) |  |

### KIAN

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Inexistir | Calamidade, ep. 7, 4h55m00s | Kian usando o Ritual de Inexistir no corpo de Artemis em |
| Realizador da Calamidade | Desconjuração, ep. 13, 3h13m26s |  |
| Impacto Sigilar | — (sem cena citada na wiki) |  |
| Teletransporte | Desconjuração, ep. 20, 3h40m34s |  |
| Levitação | Desconjuração, ep. 20, 3h58m24s |  |
| Lâmina do Medo | Calamidade, ep. 11, 1h30m12s |  |
| Rejeitar Névoa | Desconjuração, ep. 20, 3h51m30s |  |
| Toque da Morte | Desconjuração, ep. 20, 3h44m28s |  |

### GAL SAL

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Injustiça né? | — (sem cena citada na wiki) |  |
| O Realizador do Destino | — (sem cena citada na wiki) |  |
| Corrente de Captura | — (sem cena citada na wiki) |  |
| Ativar Ereshkigal | — (sem cena citada na wiki) |  |
| Corrente Gancho | — (sem cena citada na wiki) |  |
| Teletransporte | — (sem cena citada na wiki) |  |
| Controle Mental | Desconjuração, ep. 6, 6h20m17s |  |
| Corrente Giratória | — (sem cena citada na wiki) |  |
| Velocidade Mortal | Calamidade, ep. 2, 2h46m38s |  |

### NUBI

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Carniçal da Esfinge | Calamidade, ep. 10, 2h48m17s | Carniçal da Esfinge em |
| O Chacal Desperto | — (sem cena citada na wiki) |  |
| Lodo da Morte | — (sem cena citada na wiki) |  |
| Desvio Imperturbável | — (sem cena citada na wiki) |  |
| Decadência | — (sem cena citada na wiki) |  |
| Lodo que Prende | — (sem cena citada na wiki) |  |
| Sentença do Chacal | — (sem cena citada na wiki) |  |
| Ritual de Drenagem | — (sem cena citada na wiki) |  |

### XANDE

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Por Eles | Sinais do Outro Lado, ep. 7, 3h25m39s |  |
| Rei do Rolê | — (sem cena citada na wiki) |  |
| Skate Caótico | Sinais do Outro Lado, ep. 5, 2h28m01s |  |
| Amaldiçoar Arma | Sinais do Outro Lado, ep. 1, 13m53s |  |
| Polarização Caótica | Sinais do Outro Lado, ep. 1, 3h26m38s |  |
| Tela de Ruído | Sinais do Outro Lado, ep. 2, 30m12s |  |
| Velocidade Mortal | Sinais do Outro Lado, ep. 3, 25m32s |  |
| Cicatrização | Sinais do Outro Lado, ep. 3, 1h16m04s |  |

### GUIZO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Registro do Outro Lado | — (sem cena citada na wiki) |  |
| Distorcer Aparência | Sinais do Outro Lado, ep. 1, 22m04s |  |
| Invadir Mente | Sinais do Outro Lado, ep. 3, 43m55s |  |
| Decadência | Sinais do Outro Lado, ep. 1, 17m57s |  |
| Amaldiçoar Arma com Sangue | Sinais do Outro Lado, ep. 1, 1h56m04s |  |
| Velocidade Mortal | Sinais do Outro Lado, ep. 2, 27m38s |  |
| Embaralhar | Sinais do Outro Lado, ep. 3, 30m25s |  |
| Espirais da Perdição | Sinais do Outro Lado, ep. 7, 55m09s |  |
| Cicatrização | Sinais do Outro Lado, ep. 5, 3h59m07s |  |

### LÍRIO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Leonora | Sinais do Outro Lado, ep. 1, 15m58s | Leonora em |
| A Fúria da Leonora | — (sem cena citada na wiki) |  |
| Canivete de osso | Sinais do Outro Lado, ep. 7, 33m46s |  |
| Golpe Pesado | Sinais do Outro Lado, ep. 2, 25m33s |  |
| Cai Dentro | Sinais do Outro Lado, ep. 5, 2h39m54s | Amarra de Sangue em |
| Amarras de Sangue "Magras" | — (sem cena citada na wiki) |  |
| Leonora Amaldiçoada (Sangue) | — (sem cena citada na wiki) |  |
| Proteção Pesada | Sinais do Outro Lado, ep. 5, 2h39m54s | Amarra de Sangue em |

### DARA

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Racha | — (sem cena citada na wiki) |  |
| Ninguém Fica Pra Trás | — (sem cena citada na wiki) |  |
| Submetralhadora | — (sem cena citada na wiki) |  |
| Lanterna UV | — (sem cena citada na wiki) |  |
| Paramédico | Sinais do Outro Lado, ep. 2, 57m28s |  |
| Olho de Investigadora | — (sem cena citada na wiki) |  |
| Dedicação | Sinais do Outro Lado, ep. 2, 12m40s |  |

### CHICO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Mina de Proximidade | — (sem cena citada na wiki) |  |
| Engenhosidade | Sinais do Outro Lado, ep. 1, 3h49m24s | Scanner de Manifestação Paranormal de Energia em |
| Mac-10 | — (sem cena citada na wiki) |  |
| Pulso do Scanner | — (sem cena citada na wiki) |  |
| Farol da Van | — (sem cena citada na wiki) |  |
| Scanner de Energia | — (sem cena citada na wiki) |  |
| Remendão | Sinais do Outro Lado, ep. 1, 3h49m24s | Scanner de Manifestação Paranormal de Energia em |
| A Van dos Cinco | — (sem cena citada na wiki) |  |

### MORATO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Pelos Cinco | — (sem cena citada na wiki) |  |
| Último Sacrifício | — (sem cena citada na wiki) |  |
| Metralhadora | Sinais do Outro Lado, ep. 7, 1h05m24s |  |
| Tamo com Ele | Sinais do Outro Lado, ep. 7, 46m30s |  |
| Larva da Fúria "Calabresa" | — (sem cena citada na wiki) |  |
| Linha de Frente | — (sem cena citada na wiki) |  |

### DALMO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Finalização de Arena | — (sem cena citada na wiki) |  |
| O Colosso | Hexatombe, ep. 7, 3h41m55s |  |
| Pode Vir! | — (sem cena citada na wiki) |  |
| Pressão Atmosférica | — (sem cena citada na wiki) |  |
| Agarrão de Arena | — (sem cena citada na wiki) |  |
| Atropelar | — (sem cena citada na wiki) |  |
| A Glória Era Viciante | Hexatombe, ep. 1, 0h05m33s |  |

### AGUIAR

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Caçada no Acampamento | — (sem cena citada na wiki) |  |
| Máscara do Mutilador Noturno | — (sem cena citada na wiki) |  |
| Machado na Corda | — (sem cena citada na wiki) |  |
| Ataque Especial | — (sem cena citada na wiki) |  |
| Armadilha de Urso | — (sem cena citada na wiki) |  |
| Cães de Caça | Hexatombe, ep. 1, 0h05m29s |  |
| Predador de Sangue | — (sem cena citada na wiki) |  |

### JAE

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| A Marca do X | — (sem cena citada na wiki) |  |
| Capuz de X | — (sem cena citada na wiki) |  |
| Punhais Arremessados | — (sem cena citada na wiki) |  |
| Punhal X | — (sem cena citada na wiki) |  |
| Shhh... | Natal Macabro, ep. 2, 2h30m48s |  |
| Assassinato Furtivo | — (sem cena citada na wiki) |  |
| Zona dos Sussurros | — (sem cena citada na wiki) |  |

### KEMI

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Contrato de Morte | — (sem cena citada na wiki) |  |
| Vestir as Faixas | — (sem cena citada na wiki) |  |
| Sniper Fantasma | Natal Macabro, ep. 1, 21m04s | Munição de Kemi em |
| Disparo da Morte | — (sem cena citada na wiki) |  |
| Pistola Transtornada | — (sem cena citada na wiki) |  |
| Perita | — (sem cena citada na wiki) |  |
| Revólver .38 | — (sem cena citada na wiki) |  |

### LABIRINTO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| O Labirinto é a Resposta | Natal Macabro, ep. 3, 4h4m22s |  |
| Capacete do ??? | — (sem cena citada na wiki) |  |
| Rajada Caótica | Hexatombe, ep. 1, 3h36m24s |  |
| Labirinto Mental | Hexatombe, ep. 9, 4m37s |  |
| Mapa Sanguíneo | — (sem cena citada na wiki) |  |
| Capturar Momento | — (sem cena citada na wiki) |  |

### HENRI

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Hemorragia Severa | Hexatombe, ep. 4, 5h09m12s |  |
| Ódio do Diabo | — (sem cena citada na wiki) |  |
| Lâmina de Sangue | — (sem cena citada na wiki) |  |
| Descarnar Discente | Hexatombe, ep. 4, 5h09m12s |  |
| Perturbação Discente | Hexatombe, ep. 4, 5h09m12s |  |
| Vínculo de Sangue | — (sem cena citada na wiki) |  |
| Armadura de Sangue Diabólica | Hexatombe, ep. 4, 5h09m12s |  |

### CRISTINO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Odeio Gente Barulhenta | Hexatombe, ep. 8, 6h13m58s |  |
| Tocado pela Coroa | — (sem cena citada na wiki) |  |
| Espingarda Socadeira | — (sem cena citada na wiki) |  |
| Lampião Explosivo | — (sem cena citada na wiki) |  |
| Trilha de Lampiões | — (sem cena citada na wiki) |  |
| Corda do Telhado | — (sem cena citada na wiki) |  |
| Decepar | — (sem cena citada na wiki) |  |

### RAZIEL

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Banquete de Sangue | — (sem cena citada na wiki) |  |
| O Verdadeiro Raziel | — (sem cena citada na wiki) |  |
| Vulto Retalhador | — (sem cena citada na wiki) |  |
| Bote Retalhador | — (sem cena citada na wiki) |  |
| Mordida | — (sem cena citada na wiki) |  |
| Endurecer Sangue | — (sem cena citada na wiki) |  |
| Maldição Sanguínea | — (sem cena citada na wiki) |  |

### ARNALDO FRITZ

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Ato Final | — (sem cena citada na wiki) |  |
| A Relíquia do Relógio | — (sem cena citada na wiki) |  |
| Emissor de Pulsos Paranormais | Sinais do Outro Lado, ep. 1, 1h20m38s | Emissor de Pulsos Paranormais em |
| Finta Teatral | — (sem cena citada na wiki) |  |
| Pulso Paranormal | — (sem cena citada na wiki) |  |
| Rodopio da Fita | — (sem cena citada na wiki) |  |
| Aniquilador | Calamidade, ep. 6, 4h54m50s |  |
| Ensaio Geral | — (sem cena citada na wiki) |  |

### FERREIRO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Espada Consumidora | — (sem cena citada na wiki) |  |
| Pacto do Santo | — (sem cena citada na wiki) |  |
| Lodo arremessado | — (sem cena citada na wiki) |  |
| Hipnose Espiral | Segredo na Floresta, ep. 2, 4h08m12s | Hipnose Espiral em |
| Chamar os Mananciais | — (sem cena citada na wiki) |  |
| Conforto de Santo Berço | — (sem cena citada na wiki) |  |
| Armadura do Ferreiro | — (sem cena citada na wiki) |  |

### CELESTINE

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Duelo Final | Calamidade, ep. 6, 4h58m38s |  |
| A Máscara do Desespero | Calamidade, ep. 6, 5h01m23s | Acordo entre o Anfitrião e a Magistrada em |
| Machadinha na Corrente | — (sem cena citada na wiki) |  |
| Aliança Falsa | — (sem cena citada na wiki) |  |
| Código | Calamidade, ep. 6, 2h58m25s |  |
| Sala da Morte | Calamidade, ep. 6, 4h58m38s |  |
| Endorfina | Calamidade, ep. 5, 3h18m54s | Vício na Endorfina em |

### GAIUS

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Ciente da Própria Força | — (sem cena citada na wiki) |  |
| A Relíquia de Energia | Calamidade, ep. 5, 3h41m29s |  |
| Maça Arremessada | — (sem cena citada na wiki) |  |
| Golpe do Veterano | — (sem cena citada na wiki) |  |
| Anular | — (sem cena citada na wiki) |  |
| Carga do Veterano | — (sem cena citada na wiki) |  |
| Cansado, Mas Firme | — (sem cena citada na wiki) |  |

### AMALIA

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Não Perde a Cabeça! | Calamidade, ep. 6, 3h19m25s |  |
| Memória Revivida | — (sem cena citada na wiki) |  |
| Flecha Flamejante | — (sem cena citada na wiki) |  |
| Longa-Distância | Calamidade, ep. 6, 3h19m40s |  |
| Chuva de Flechas | — (sem cena citada na wiki) |  |
| Altruísmo | Calamidade, ep. 6, 29m37s |  |
| Flechas Caóticas | — (sem cena citada na wiki) |  |

### O DIABO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Pacto | Calamidade, ep. 12, 4h24m58s | Diabo oferecendo um pacto para Kian em |
| Renascimento | — (sem cena citada na wiki) |  |
| Lança de Sangue | — (sem cena citada na wiki) |  |
| Veias de Sangue | Calamidade, ep. 3, 10m36s |  |
| Ódio do Diabo | Calamidade, ep. 4, 1h34m41s |  |
| Transportar pelo Sangue | Calamidade, ep. 4, 1h34m41s |  |
| Senhor do Sangue | Calamidade, ep. 3, 37m53s |  |
| Sangue nos Arredores | Calamidade, ep. 4, 1h34m41s |  |

### A MAGISTRADA

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Prisão das Sombras | Calamidade, ep. 11, 1h32m57s |  |
| Reescrever a Realidade | — (sem cena citada na wiki) |  |
| Sigilo do Conhecimento | — (sem cena citada na wiki) |  |
| Chamar as Máscaras | — (sem cena citada na wiki) |  |
| Dimensão das Sombras | Desconjuração, ep. 9, 7m51s | Dimensão das Sombras em |
| Olhar do Desespero | Calamidade, ep. 2, 4h13m54s |  |
| Controle Mental | Desconjuração, ep. 9, 11m18s |  |
| Dispersão de Dano | Calamidade, ep. 8, 3h26m37s |  |
| Levitação | Calamidade, ep. 9, 4m41s |  |

### O ESTRANGEIRO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Tortura Mental | — (sem cena citada na wiki) |  |
| Incubar | — (sem cena citada na wiki) |  |
| Rajada Psíquica | — (sem cena citada na wiki) |  |
| Comandar | Sinais do Outro Lado, ep. 7, 3h23m20s |  |
| Oblívio | Sinais do Outro Lado, ep. 7, 3h27m17s |  |
| Aparição | Sinais do Outro Lado, ep. 4, 4h18m53s |  |
| Abdução | — (sem cena citada na wiki) |  |
| Homens de Terno | — (sem cena citada na wiki) |  |
| Ninho de Interflorados | — (sem cena citada na wiki) |  |
| Toque Sutil | Sinais do Outro Lado, ep. 7, 3h27m17s |  |

### AMIGO IMAGINÁRIO

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Todo Mundo Vai Morrer | Segredo na Ilha, ep. 7, 5h19m18s |  |
| Frenesi de Sangue | — (sem cena citada na wiki) |  |
| Tentáculo | — (sem cena citada na wiki) |  |
| Derreter | Segredo na Ilha, ep. 8, 1h32m58s |  |
| Agarrão | Segredo na Ilha, ep. 8, 25m27s |  |
| O Sino | Segredo na Ilha, ep. 7, 5h19m18s |  |
| Bichos da Ilha | — (sem cena citada na wiki) |  |
| Dissolver | Segredo na Ilha, ep. 8, 1h32m00s |  |

### CARNIÇAL

| Habilidade | Fonte (campanha, episódio, minuto) | Cena |
|---|---|---|
| Controle Absoluto | — (sem cena citada na wiki) |  |
| Instinto Mortal | Segredo na Floresta, ep. 6, 7m49s |  |
| Lágrimas de Lodo | — (sem cena citada na wiki) |  |
| Hipnose Espiral | Segredo na Floresta, ep. 6, 7m49s |  |
| Salto do Carniçal | — (sem cena citada na wiki) |  |
| Pancada Poderosa | Segredo na Floresta, ep. 6, 14m15s |  |
| Comando | Segredo na Floresta, ep. 6, 14m15s |  |
