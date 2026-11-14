# Recursos de modelagem: bases prontas, bibliotecas e efeitos

Levantamento feito em 2026-11-14 a pedido do dono ("skills de modelagem, bibliotecas de modelos e efeitos visuais
prontos que possam ajudar na modelagem, como uma base pronta pra edição de modelo ou até objetos prontos"). Serve para
as próximas atualizações e para evoluir os mapas antigos.

**Regra do projeto:** nada de terceiros é baixado sem o OK do dono. Só entra o que é **CC0** (ou licença equivalente,
conferida na página do pacote) e fica em `assets_src/` (fora do git), como os kits do Kenney (`assets_src/README.md`).
Antes de usar, confira na página oficial a licença e o formato (`.glb`/`.gltf`).

## 1. O que o projeto já tem

| Recurso | Licença | Onde | Uso hoje |
|---|---|---|---|
| Kits do Kenney (Fantasy Town, Nature, Graveyard, Castle, Furniture, City) | CC0 | `assets_src/kenney/`, `tools/blender/kenney.py` (`put`, `house`) | Santo Berço e outros cenários |
| Human Base Meshes (Blender Studio) | CC0 | `assets_src/blender-human-base-meshes/`, `base_body.py` | corpo do Carniçal |
| Universal Animation Library (Quaternius) | CC0 | `assets_src/quaternius/` | corrida, caminhada, queda |
| Particle Pack (Kenney) | CC0 | `public/fx/` | fumaça, fogo, faíscas |
| Texturas pintadas em canvas | do projeto | `src/arena/arenaTextures.js` | todos os cenários, pelo nome do material |
| Blender MCP (`search_assets` / `import_asset`) | por fonte | MCP do Blender | busca e importa da Poly Haven, Sketchfab e Poly Pizza direto no Blender |

## 2. Modelos prontos (objetos e kits)

| Fonte | O que tem | Licença | Bom para |
|---|---|---|---|
| [Quaternius — Medieval Village MegaKit](https://quaternius.com/packs/medievalvillagemegakit.html) | casas modulares medievais, paredes, telhados, adereços; FBX, OBJ e glTF | CC0 (60–70% grátis; o resto pago: conferir quais estão na parte grátis) | Treb Ciach, Santo Berço, vilas em geral |
| [OpenGameArt — Lowpoly Medieval Village Pack (Quaternius)](https://opengameart.org/content/lowpoly-medieval-village-pack) | casas e adereços low poly | CC0 | vilas |
| [OpenGameArt — Modular Village](https://opengameart.org/content/modular-village) | peças modulares de vila | conferir na página | vilas |
| [itch.io — Low Poly Medieval Village (Square Wheel)](https://squarewheelinteractive.itch.io/low-poly-medieval-village) | 5 casas, .blend e textura | CC0 | casas de base para editar |
| [Kenney — Nature Kit](https://kenney.nl/assets/nature-kit) (já baixado) | 330 peças de natureza | CC0 | árvores, pedras |
| [Poly Haven — modelos](https://polyhaven.com) | modelos realistas (troncos, pedras, móveis, adereços) | CC0 ([licença](https://polyhaven.com/license)) | adereços realistas; API pública |
| Poly Pizza | milhares de low poly em `.glb` | a licença varia por modelo (CC0 ou CC-BY): conferir cada um | objetos avulsos |

Listagens pagas ou sem licença clara (CGTrader, packs sem página de licença) ficam de fora.

## 3. Texturas (PBR) para trocar as pintadas em canvas

| Fonte | Licença | Observação |
|---|---|---|
| [Poly Haven — texturas](https://polyhaven.com) | CC0 | ~800 texturas (madeira, reboco, telhado, pedra, terreno); API em `api.polyhaven.com` |
| [ambientCG](https://ambientcg.com) | CC0 | 1K–8K, API pública sem chave; o CC0 permite incluir os arquivos no jogo |

Para o navegador: usar só o mapa de cor (e talvez normal) em 512–1K, convertido para `.webp`/`.jpg`, para não pesar o
download. As texturas em canvas continuam como reserva (não pesam nada).

## 4. Efeitos visuais prontos (Three.js)

| Biblioteca | O que faz | Licença |
|---|---|---|
| [@wolffo/three-fire](https://www.npmjs.com/package/@wolffo/three-fire) | fogo volumétrico (ray marching), versão Three.js comum e WebGPU/TSL | MIT |
| [ThreeVolumetricFire](https://github.com/Housz/ThreeVolumetricFire) | fogo volumétrico deformável por curva ([fórum](https://discourse.threejs.org/t/threevolumetricfire-a-library-for-spline-deformable-volumetric-fire/88529)) | conferir |
| [three-volumetric-pass](https://awesome.ecosyste.ms/projects/github.com%2Fameobea%2Fthree-volumetric-pass) | neblina e nuvens volumétricas em pós-processamento | conferir |

Candidato forte: o fogo da fogueira do Treb Ciach, do Acampamento e das tochas. Testar o custo no jogo (ray marching
pesa em placa fraca) antes de trocar os cones `FLICKER_`.

## 5. Geradores e bases no Blender

| Ferramenta | O que faz | Licença |
|---|---|---|
| [Buildify](https://www.cgchannel.com/2022/07/download-free-blender-3d-building-generator-buildify/) (Pavel Oliva) | prédios procedurais em Geometry Nodes a partir de uma biblioteca de peças | grátis (Gumroad); feito para Blender 3.2: testar no 5.2 |
| [buildingnodes](https://github.com/durman/buildingnodes) | modelagem procedural de prédios | código aberto; não faz telhado |
| [Biblioteca de Geometry Nodes para prédios (80.lv)](https://80.lv/articles/grab-a-free-geometry-nodes-library-for-procedural-buildings-in-blender) | node groups grátis | conferir |

Nenhum gerador faz enxaimel ou palha de fábrica: para casas medievais, o caminho mais rápido é kit modular
(Quaternius ou Kenney) mais o nosso código (`cottage()` em `arena_treb_ciach.py`).

## 6. Skills de modelagem para o Claude

Já instaladas e úteis: `blender-image-to-3d`, `blender-staged-scene-construction`, `level-design`,
`concept-target-visual-gate`, `voxel-diorama-blender`, `threejs-*` e `anthropic-skills:modelos-3d-blender-mcp`.

Encontradas na internet (revisar o SKILL.md e os scripts antes de instalar, como recomenda a
[Snyk](https://snyk.io/articles/top-claude-skills-3d-modeling-game-dev-shader-programming)):
- [kevinbadi/blender-skills](https://github.com/kevinbadi/blender-skills): skills para fluxos de produto no Blender via MCP.
- [blender-3d (Smithery)](https://smithery.ai/skills/pacphi/blender-3d): controle do Blender via MCP.
- [blender (skills.sh)](https://skills.sh/phuetz/code-buddy/blender): bpy em modo headless e em lote.
- [Guia: melhores skills de Blender](https://skillselion.com/guides/best-blender-skills-for-claude-code).

## 7. Plano sugerido

1. Treb Ciach (agora): fica com o modelo feito à mão e as texturas em canvas (v4.45.1).
2. Com o OK do dono, baixar e testar o **Quaternius Medieval Village MegaKit** (parte CC0) e algumas texturas CC0 da
   **Poly Haven/ambientCG** (palha, reboco, pedra, madeira) num cenário só e medir o peso.
3. Se der certo: criar `tools/blender/quaternius.py` (como o `kenney.py`) e evoluir os mapas antigos (Santo Berço,
   Acampamento, Orfanato), um por versão.
4. Testar o `@wolffo/three-fire` na fogueira e medir o FPS.
