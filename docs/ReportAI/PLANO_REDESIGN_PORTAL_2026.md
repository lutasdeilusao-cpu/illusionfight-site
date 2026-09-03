# Plano de Redesign Visual do Portal — 2026

## Objetivo

Unificar o portal na linguagem visual inaugurada pela Navbar: interface escura, tecnológica, editorial e futurista, com neon ciano para navegação, âmbar para monetização, recortes geométricos, profundidade controlada e movimento com propósito.

O redesign não altera a arquitetura funcional de cada página nem reorganiza conteúdo sem necessidade. Cada fase preserva rotas, dados, analytics, acessibilidade e comportamento já existentes.

## Princípios

1. **KISS:** componentes simples, responsabilidades claras e nenhum sistema visual paralelo desnecessário.
2. **Clean Code:** nomes semânticos, dados separados da apresentação e estilos limitados ao wrapper da página.
3. **Performance:** carregamento crítico mínimo, imagens responsivas, lazy loading abaixo da dobra, animações em `transform`/`opacity` e ausência de bibliotecas novas.
4. **Mobile-first:** a experiência é desenhada primeiro para 360–480 px e cresce sem perder densidade ou hierarquia.
5. **Identidade consistente:** ciano comunica exploração e interação; âmbar comunica apoio, loja e valor; violeta comunica universos e conteúdo extraordinário.
6. **Acessibilidade:** foco visível, contraste legível, alvos de toque adequados e respeito a `prefers-reduced-motion`.
7. **Evolução incremental:** uma área por versão, sempre com build, revisão visual, commit, push, deploy e verificação pública.

## Fundação visual compartilhada

- Fundo profundo com grid técnico discreto e luz radial localizada.
- Cabeçalhos de seção com índice, kicker e título editorial.
- Cards sem arredondamento excessivo, recorte técnico e bordas luminosas apenas quando interativos.
- Estados de hover/foco que explicam a ação.
- Movimento curto e previsível; nada animado apenas por decoração.
- Tokens existentes em `src/index.css` continuam sendo a base. Novos tokens globais só entram quando três ou mais páginas realmente precisarem deles.

## Estratégia de i18n

O JSON global cresceu além do que é confortável para manutenção. A migração será progressiva por domínio:

- Cada página ou módulo grande recebe `{dominio}_pt.json`, `{dominio}_en.json` e `{dominio}_es.json`.
- `locales.js` continua como único agregador e faz o merge dos módulos.
- As chaves públicas permanecem estáveis durante a extração para evitar refatorações sem valor.
- Uma chave só sai do JSON global depois de existir nos três arquivos dedicados.
- Conteúdo compartilhado fica no módulo que representa sua responsabilidade, não duplicado em vários JSONs.

## Fases

### Fase 1 — Home

- Concentrar a página em `src/pages/site/Home/`: `Home.jsx`, `Home.css` e `components/`.
- Mover para essa pasta somente as sete seções comprovadamente exclusivas da Home; `DeferredSection` permanece compartilhado.
- Preservar um arquivo JSX + CSS por seção para reviews pequenos e responsabilidades únicas.
- Extrair os namespaces de apresentação da Home para `home_{locale}.json`.
- Manter a ordem atual das seções.
- Redesenhar Hero, episódios, personagens, capítulos, músicas, apoio, redes, games e newsletter.
- Preservar carregamento imediato apenas para Hero, episódios e personagens.
- Manter seções abaixo da dobra com lazy loading e `DeferredSection`.
- Medir bundle, CLS visual, erros de console e comportamento em 390×844 e viewport amplo.

### Fase 2 — Histórias e leitores

- Hub de histórias, linha principal, contos e obras.
- Cards editoriais e estados de liberação alinhados ao calendário.
- Leitores continuam priorizando tipografia, foco e ausência de distrações.

### Fase 3 — Mundos e personagens

- Hub de universos, páginas de worldbuilding, catálogo e detalhes de personagens.
- Identidade individual por universo dentro da mesma gramática visual.

### Fase 4 — Webtoon e músicas

- Catálogo e leitor do Webtoon.
- Biblioteca musical, plataformas e integração visual com a Rádio Nina.

### Fase 5 — Games e páginas de entrada

- Catálogo, lobby compartilhado e páginas externas aos gameplays.
- Os jogos preservam suas identidades e layouts internos; o redesign cobre a moldura do portal.

### Fase 6 — Monetização

- Apoiar, Loja, produtos digitais, custos e pontos de conversão.
- Hierarquia âmbar consistente, comunicação transparente e analytics preservados.

### Fase 7 — Conta e plataforma

- Login, cadastro, perfil, leaderboard e estados de autenticação.
- Formulários claros, feedback acessível e redução de ruído visual.

### Fase 8 — Shell global e fechamento

- Footer, busca, banners, notificações, cookies, 404 e estados de carregamento.
- Auditoria final de consistência, i18n, performance, acessibilidade e regressões.

## Critérios de conclusão de cada fase

- `SITE_VERSION` e `SITE_MAP.md` atualizados.
- PT/EN/ES completos, sem texto visível hardcoded novo.
- Nenhum arquivo ou card preexistente removido por acidente.
- `npm run build` aprovado com sourcemaps.
- Revisão visual real em viewport móvel e ampla.
- Fluxos interativos principais exercitados.
- `graphify update .` executado.
- Commit e fonte enviados antes do deploy.
- Versão confirmada diretamente no bundle servido por `illusionfight.com`.

## Fora de escopo da Fase 1

- Reordenar seções da Home.
- Trocar textos editoriais ou calendário de publicação.
- Alterar regras de autenticação, fichas, assinatura ou jogos.
- Criar uma biblioteca de componentes genérica antes de surgirem três usos reais.
