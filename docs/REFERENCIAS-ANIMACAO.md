# Referências visuais de animação e timing (TODO 2.1)

Pesquisa feita em 2026-11-08 para guiar o timing, os arcos de movimento, o peso e a câmera dos golpes.
Cada referência abaixo traz **o que copiar** e **onde isso já existe (ou falta) no Véu Partido**.
Valores medidos a 60 quadros por segundo (1 quadro ≈ 0,0167 s).

## 1. Street Fighter 6: proporção de startup, active e recovery e o tamanho do hitstop

Fontes: as tabelas de frame data da comunidade ([SuperCombo / srk.shib.live, Game Data](https://srk.shib.live/w/Street_Fighter_6/Game_Data),
[Ryu](https://srk.shib.live/w/Street_Fighter_6/Ryu/Frame_data), [Terry](https://srk.shib.live/w/Street_Fighter_6/Terry/Data)).

| Golpe | Startup | Active | Hitstop |
|---|---|---|---|
| Ryu, soco fraco | 4 f | 3 f | — |
| Ryu, soco médio | 6 f | 4 f | — |
| Ryu, soco forte | 10 f | 5 f | — |
| Terry, chute fraco em pé | 5 f | 2 f | 9 f |
| Terry, soco médio agachado | — | — | 11 f |
| Terry, soco forte agachado | — | — | 13 f |

**O que copiar**
- A regra de três degraus: o golpe fraco sai em cerca de 4–5 quadros, o médio em cerca de 6 e o forte em 10–12. O golpe ativo dura mais quanto mais pesado.
- O hitstop cresce com o peso (9 → 11 → 13 quadros, isto é, 0,15 → 0,18 → 0,22 s) e congela **os dois** lutadores.

**Como estamos**
- O startup já bate:
  - Os golpes leves do Dalmo (`dur 0.3`, `active [0.09, 0.17]`) saem em cerca de 5 quadros.
  - O Soco de arena (`active [0.2, …]`) sai em 12.
- O nosso hitstop é **menor**: vai de 0,06 a 0,12 s (4–7 quadros) nos golpes de combo e chega a 0,14 s nas habilidades.
  - É de propósito, porque o jogo é 3D, tem combos longos e o ritmo é de arena, não de jogo de luta 2D.
  - **PROPOSTA:** subir só os **finalizadores** (`finisher: 'launch'`) para 0,13–0,15 s e deixar os golpes do meio do combo como estão. O "estalo" do último golpe fica maior sem deixar o combo arrastado.

## 2. Guilty Gear (Xrd e Strive), Arc System Works: animação limitada e poses-chave seguradas

Fontes:
- [Entrevista da Epic com a Arc System Works sobre o Strive](https://www.unrealengine.com/en-US/developer-interviews/how-guilty-gear--strive--hits-an-ultra-combo-with-groundbreaking-visuals-and-gameplay).
- A palestra da GDC sobre a animação do Skullgirls (no [GDC Vault](https://gdcvault.com/)), sobre poses-chave fortes, antecipação e timing.

**O que copiar**
- O Strive usa **animação limitada**, isto é, poses-chave seguradas por alguns quadros em vez de interpolação suave, sobretudo nos overdrives e nas cenas.
- Os autores querem que o resultado pareça "a animação do Guilty Gear", não uma imitação de anime desenhado à mão.
- Cada golpe tem **uma pose de impacto** que lê de longe (silhueta clara) e fica parada um instante.

**Como estamos**
- `anim/strikePolish.js` (1ª leva) já faz antecipação, passagem (overshoot) e peso na volta, mas **interpola tudo de forma suave**.
- **PROPOSTA:** um modo `stepped` opcional no `Animator` que segure a pose por 2–3 quadros nos especiais `cinematicCombo` (a pose do golpe e a do impacto). Só nos especiais, para não perder a fluidez do combate normal.
  - Bons primeiros testes: Arnaldo, Joui e a Menina do Pássaro da Beatrice.

## 3. Naruto Ultimate Ninja Storm (CyberConnect2): câmera de especial

Fontes:
- [Wikipédia, Ultimate Ninja Storm](https://en.wikipedia.org/wiki/Naruto:_Ultimate_Ninja_Storm).
- [Siliconera, a evolução do estilo anime da CC2](https://www.siliconera.com/evolution-of-cyberconnect-2s-anime-style-graphics/).

**O que copiar**
- Na luta, a câmera **sempre mostra os dois lados** e eles se movem pela arena inteira, sem ficar cara a cara num plano só. É o que a nossa câmera de arena já faz.
- Nos jutsus finais, a câmera **gira e torce** em volta dos projéteis (o "Itano Circus", homenagem aos mísseis de Macross).
  - **PROPOSTA:** aplicar esse giro nos especiais de enxame, como os insetos do Morato, as cópias do Dante e as penas e corvos.
- As cenas seguem o anime da série, foram feitas com ajuda dos estúdios da série e dão o peso narrativo do especial.
  - Para nós, isso confirma a regra do projeto de seguir a cena do cânone (o "Ordem Paranormal" como fonte do especial).

## 4. Princípios que valem para todos (resumo prático)

1. **Antecipação proporcional ao peso.** Golpe leve: quase nenhuma. Golpe pesado: o corpo carrega para trás e o quadril desce. *(Já feito na 1ª leva.)*
2. **Impacto = congelar + tremer + partículas + som**, tudo no mesmo quadro. *(Feito; ver `world.hitstop`, `impactFx` e a skill de game feel.)*
3. **Passagem e peso na volta:** o golpe passa do ponto e volta devagar. *(Feito.)*
4. **Pose de impacto segurada** nos especiais. *(PROPOSTA, item 2.)*
5. **Hitstop maior no último golpe do combo.** *(PROPOSTA, item 1.)*
6. **Câmera girando em volta de projéteis em enxame.** *(PROPOSTA, item 3.)*

As propostas 4–6 ficam para decidir com o dono antes de mexer, porque mudam a sensação de todos os personagens.
