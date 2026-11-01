# Padrão de qualidade — página SOBRE / BAIXAR (`sobre.html`)

Status do checklist do padrão de qualidade de sites (Roma & Buganza) para esta página, reavaliado em 2026-11-01 (v4.7.1).
`[x]` feito · `[~]` parcial · `[ ]` pendente · **N/A** não se aplica (com o motivo).

As notas de Lighthouse abaixo de v3.27.1 são uma medição histórica e não representam esta versão. Reexecutar Lighthouse
depois da atualização visual, especialmente Performance e Acessibilidade.

## 1. Design e referências
- [x] Direção visual a partir de referências — ThoughtLab (Refero Styles), ver [DESIGN-SOBRE.md](DESIGN-SOBRE.md) e o README.
- [x] Tokens antes das telas (variáveis CSS em `src/sobre.css`: cores com papel, espaçamento 8·16·24·48·96, raios).
- [x] No máximo 2 famílias de fonte (Bebas Neue + Inter); um `h1`, hierarquia h2/h3.
- [x] Contraste WCAG AA: corpo 13:1, texto fraco 6:1, botão carmesim com texto branco 5,7:1.
- [x] `prefers-reduced-motion` respeitado (sem rolagem suave nem transições).
- N/A Efeitos pesados (WebGL/shader), Cult UI e ShaderGradient — a página é HTML/CSS puro, sem React; o 3D é o próprio
  jogo, a um clique.
- N/A Modelos 3D na página — usamos capturas reais do jogo (WebP), não o modelo.

## 2. Frontend
- [x] Mobile first: hero com captura em largura total, ações empilhadas, navegação horizontal e conteúdo em uma coluna.
- [x] Sem rolagem horizontal em viewports emulados de 320, 360 e 390 px; a tabela e as faixas de filtros têm rolagem local.
- [x] Áreas de toque ≥ 44 px nos botões, navegação, filtros, perguntas e passos de instalação.
- N/A Tema claro/escuro — a marca do jogo é escura (decisão registrada no DESIGN-SOBRE.md).
- [x] CTAs e versão aparecem acima da dobra em viewports emulados de 320, 360 e 390 × 844 px; confirmar em aparelhos reais.
- N/A WhatsApp, formulário e prova social de negócio — é um jogo grátis de fã, sem contato comercial. As "provas" são as
  telas reais do jogo ao lado de cada afirmação.
- [x] Imagens WebP com `width`/`height`, `srcset` (480 px no celular), `loading="lazy"` abaixo da dobra e
  `fetchpriority="high"` na imagem do topo.
- [x] Fontes com `display=swap`, sem bloquear a primeira pintura (carregadas por `preload` + troca).
- N/A Scripts de terceiros — não há analytics, pixel nem chat.
- [x] HTML semântico (`header`, `nav`, `main`, `section`, `footer`), link "Pular para o conteúdo", foco visível.
- [x] `alt` descritivo em todas as imagens de conteúdo.
- N/A Labels de formulário — a página não tem formulário.
- [x] `title` e `meta description` próprios, canonical, Open Graph e Twitter Card (com `og.jpg`).
- [x] JSON-LD `VideoGame` + `FAQPage`.
- [x] `sitemap.xml` e `robots.txt` (em `public/`, valem para o site todo).
- [ ] Search Console — precisa da conta do dono do site (romavitordev) para verificar o domínio github.io.
- N/A Google Business Profile e GA4 — não é negócio local e o jogo não usa analytics.

## 3. Backend
- N/A — página estática no GitHub Pages (HTTPS do próprio GitHub); sem servidor, rotas, banco nem segredos.
  Segredos: a auditoria do commit continua (nenhum segredo no repositório).

## 4. Compliance e LGPD
- N/A Consentimento, cookies e controlador — a página não coleta dado pessoal nem usa cookies; as opções do jogo ficam
  só no `localStorage` do aparelho. Única chamada externa: as fontes do Google Fonts (o navegador manda o IP ao Google)
  — se quiser zero terceiros, dá para hospedar as fontes junto do jogo.

## 5. Entrega
- [x] README com a página e as referências visuais usadas.
- [x] Textos e telas reais, sem placeholder (tamanhos dos downloads tirados da release v3.26.1).
- [~] Revisão visual local em desktop e celular (320, 360, 390, 768 e 1280 px); faltam Lighthouse atual e testes em aparelhos reais.
- [x] Favicon e imagem de compartilhamento (`public/sobre/og.jpg`).
- [x] Página 404 personalizada (`public/404.html`).
- N/A Treinamento de painel — não há painel.

## Pendente
- Search Console (conta do dono).
- Lighthouse desta versão, especialmente Performance e Acessibilidade.
- Teste em Safari (iOS) e Samsung Internet, em aparelho real.
- Opcional: hospedar as fontes localmente para não depender do Google Fonts.
- Opcional: traduzir a página (o jogo tem 13 idiomas; a página está só em pt-BR).
