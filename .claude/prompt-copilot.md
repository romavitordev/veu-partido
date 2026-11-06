Projeto VÉU PARTIDO (Vite + Three.js, jogo de luta fan made de Ordem Paranormal), branch main. Fale em pt-BR.

REGRAS (siga sempre)
- Fiel ao cânone (wiki Ordem Paranormal). O que não for cânone, marque como PROPOSTA no comentário do código e no TODO.
- Antes de cada commit: auditoria de segredos no diff staged (nunca chave/token/senha real, nem em teste).
- Stage com `git add -A -- . ':!.claude'` (nunca commitar .claude/).
- Depois de `npm test`, rode `git checkout -- public/ai/learned.json`.
- Validar com `npm test`, `npm run check` e `npm run build`; se mexer em habilidades, `npm run moves` (regera HABILIDADES.md).
- A cada versão: marcar [x] no TODO o que foi entregue, atualizar CHANGELOG.md, CHANGELOG-CLIENTE.md, CHANGELOG-ADMIN.md,
  src/config/version.js, package.json e README. Commit termina com "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>".
- Comentários e nomes no estilo do código vizinho (comentários em pt-BR explicando o porquê, com a fonte do cânone).
- PvE está em espera: não mexer.

TAREFAS (em ordem)

1. TAGS PENDENTES: package.json está em 4.8.0, mas as tags v4.7.1 e v4.8.0 não existem. Crie a tag anotada
   `v4.8.0` no commit atual e faça push da tag (ela dispara .github/workflows/release-apps.yml, que gera PC e Android).
   Crie `v4.7.1` no commit 6a2bd22 só se o dono quiser essa release separada.

2. CARNIÇAL — passiva "Olhar ao Agressor" (cânone, wiki "Carniçal Preto da Morte": "assim que é atacado, olha para seu
   agressor e usa sua Hipnose para o controlar"). Em src/combat/passives.js, nova passiva (ex.: type 'aggressorGaze'):
   ao levar golpe CORPO A CORPO, 25% de chance (recarga interna de 12 s) de o atacante entrar num transe curto e se
   golpear UMA vez. Reaproveite a lógica do tipo `spiralSelfHarm` em src/combat/abilities.js (pode extrair uma função
   comum). Adicione em src/characters/carnical.js (passives) e um teste em tools/check-roster.mjs.

3. CARNIÇAL — Investida Mortal no Instinto Mortal (wiki: "investindo com ataques sequenciais devastadores"). Hoje o □ é
   Lágrimas de Lodo. Durante a Transformação (awakening 'Instinto Mortal'), o □ deve virar a Investida Mortal antiga
   (`{ ...raziel.ranged, name: 'Investida Mortal', color: RED, element: 'morte', bleed: undefined }`, tipo dashStrike).
   Veja como outros lutadores trocam o ranged no awakening (procure por `ranged` dentro de `awakening` nos
   personagens/formas) e siga o mesmo padrão.

4. CARNIÇAL — estrias menos contrastadas no jogo (sob a luz roxa das arenas ficaram fortes). Em
   tools/blender/char_carnical.py: na função `body_col`, reduza o clareamento das cristas (`k * 0.6` → ~`k * 0.4`) e,
   em `torso_fn`, a amplitude dos peitorais em leque. Regerar com `node tools/blender/build.mjs carnical`
   (precisa do Blender 5.2 e de assets_src/blender-human-base-meshes/, já baixado nesta máquina). Não edite o .glb à mão.

5. PÁGINA SOBRE — fotos antigas: public/sobre/selecao.webp, luta.webp e marionete.webp ainda são de antes de Os Cinco.
   Tire prints novos no jogo (seleção com o elenco atual; uma luta na Ilha de Tipora; o Carniçal usando a Hipnose
   Espiral) e gere as duas versões de cada (800 px e 480 px de largura, .webp, mesmos nomes). Atualize os `alt` no
   sobre.html para descrever as fotos novas. Ferramenta de print: src/dev/shots.js (instruções no topo do arquivo).

6. ILHA DE TIPORA — refinos do TODO (tools/blender/arena_tipora.py, depois `node tools/blender/build.mjs tipora`):
   mais casas do vilarejo pela lista da wiki, a Torre do Sino como marco do mapa. A Tinta e o evento do Tenebris
   ficam para depois (são PROPOSTA a combinar com o dono).

NÃO FAÇA SEM O DONO (decisões dele): submetralhadoras da Dara/Chico, ritual da Dara, granada do Chico, o Calisto
(precisa da análise das duas versões na wiki), modelos novos no Blender MCP.

Ao terminar cada tarefa: testes verdes, docs atualizados, commit próprio. Uma versão nova (4.8.1 ou 4.9.0, pela regra
do README) para o conjunto, com tag e push.
