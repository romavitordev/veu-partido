# Vistoria dos mapas antigos (2026-11-15)

Pedido do dono: "procure mais coisas para melhorar ... maior detalhamento com mais informações de referências e polir
os antigos mapas, agora pode usar o modo espectador para ter uma visão melhor dos mapas".

Feita com o modo Explorar (v4.52.0): uma vista aérea na diagonal e uma de chão de cada mapa antigo. Os mapas novos
(Ferro Velho, Circo, Pássaros, Treb Ciach) já saíram da pesquisa de `REFERENCIAS-MAPAS.md` e ficam fora.

## O que se vê

| Mapa | Criado | Estado | O que falta |
| --- | --- | --- | --- |
| Tipora | 2026-11-01 | o pior: um disco de terra lisa com grama em volta, quase nenhum objeto | quase tudo: referência, chão, borda, peças |
| Palco do Anfitrião | 2026-11-01 | disco roxo com a cruz de luz; bonito de longe, vazio de perto | cortinas, plateia, cenário de palco, luzes de ribalta |
| Santo Berço | 2026-10-02 | a praça tem o Símbolo Espiral e mais nada no meio; as casas ficam longe | calçamento, bancas, poço/fonte, vida de vilarejo na borda da praça |
| Coliseu | 2026-10-01 | areia lisa, três pedras e duas pilastras no meio | marcas de luta na areia, armas e escudos caídos, sangue velho, arquibancada mais próxima |
| Orfanato (dia/noite) | 2026-10-01 | gramado com manchas escuras soltas (raízes?) e bancos | raízes de verdade, caminhos de terra, brinquedos do pátio, folhas |
| Igreja (noite/dia) | 2026-10-26 | só paredes de tijolo vermelho na vista; falta conferir por dentro | bancos, altar, vitrais (conferir no Explorar por dentro) |
| Acampamento | 2026-10-09 | bem vestido (barracas, fogueira, bancos, luzes) | só ajustes |
| Suvaco | 2026-10-02 | bem vestido (balcão, sinuca, prédios) | só ajustes |

Regra para a área de luta: ela precisa continuar livre para os golpes e a câmera. O detalhe vai no CHÃO (textura,
marcas, decalques, tufos baixos sem colisão) e na BORDA (peças altas e cheias, onde a câmera não passa).

## Gráficos (além dos mapas)

- O "ficou mais bonito" que o dono notou é, provavelmente, a v4.48.1: a névoa era misturada antes do tom e do sRGB e
  lavava os mapas de névoa densa (+35% de brilho médio no Santo Berço).
- Próximos ganhos, do mais barato ao mais caro:
  1. **Sombra de contato (GTAO, `GTAOPass` do próprio Three.js)** só no nível "alta": os modelos low-poly ganham
     volume nos cantos e onde encostam no chão. Medir o custo por quadro.
  2. **Mapa de ambiente** (`PMREMGenerator` com o céu de cada mapa): reflexo suave nos metais (armas, o Coliseu).
  3. **Decalques no chão** (marcas, sangue, rachaduras) em vez de chão de uma cor só.
  4. **Gradação de cor por mapa** (uma LUT pequena) para cada cenário ter a sua cara.

## Ordem proposta

1. Tipora (o mais vazio) — pesquisa de referência primeiro, como em `REFERENCIAS-MAPAS.md`.
2. Palco do Anfitrião.
3. Santo Berço.
4. Coliseu.
5. Orfanato.
6. Igreja (vistoria por dentro).

Cada mapa: referências → Blender (pelo MCP, `tools/blender/arena_<id>.py`) → conferir no Explorar e numa luta.
