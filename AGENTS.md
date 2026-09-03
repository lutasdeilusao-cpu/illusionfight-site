# AGENTS.md — Illusion Fight Site

## Mandatory workflow for every code change

No exceptions. Every modification to any game file:

> **⚠️ O VERSION NUMBER VEM PRIMEIRO — NÃO PULE ESTA ETAPA**

1. **🔴 BUMP THE VERSION** — Abra `C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI\src\config\version.js` e **INCREMENTE** a versão do jogo/site modificado.
   > **Regra absoluta:** toda task que toca **qualquer arquivo** do projeto sobe `SITE_VERSION` patch obrigatoriamente, sem exceção. Se a task também mexe em um jogo específico, sobe a versão do jogo **e** a do site.
2. **🔴 Update `SITE_MAP.md`** — Atualize o número da versão na tabela de rotas
3. **`npm run build`** — if it fails, fix before proceeding. `sourcemap: true` é obrigatório em todas as builds até o lançamento (Novembro 2026). Nunca remover sem autorização explícita de Isaias.
4. **`git add -A && git commit -m "<desc> + vX.X.X"`**
5. **`git push`**
6. **`npm run deploy`**
7. **Verify** the deploy published without errors

> **📋 AO FINAL, O RELATÓRIO DEVE INCLUIR:**
> ```
> | Versão | Antes | Depois |
> |--------|-------|--------|
> | SITE_VERSION | X.X.X | → **Y.Y.Y** |
> ```

## Stack

- **Vite 8** + **React 19** (JSX only, no TypeScript)
- **React Router 7** (client-side routing)
- **Zustand 5** (state management per game)
- **Framer Motion 12** (animations)
- **Supabase** (`@supabase/supabase-js` v2) — auth, realtime, save persistence
- **gh-pages** — deploy to GitHub Pages branch
- **react-helmet-async** — per-page `<title>`
- **react-markdown** — book chapter rendering
- **Zero CSS-in-JS** — every component has a matching `.css` file. No `style={{}}` in JSX.
- **No lint, no typecheck.** Only verification is `npm run build`.

## Environment

- `.env` sets `VITE_DEBUG=true` (dev)
- `.env.production` sets `VITE_DEBUG=false`
- **Domínio oficial:** `https://illusionfight.com/` (GitHub Pages + CNAME)
- Vite base: `/` (custom domain)
- Supabase project: `dvxfrzixtetdzmdrzkpx.supabase.co` — client initialized in `src/lib/supabase.js` with anon key

## 🤖 Custom Agents

O projeto possui agentes personalizados em `.github/agents/`:

| Agente | Arquivo | Trigger | Descrição |
|--------|---------|---------|-----------|
| **LDI** | `.github/agents/ldi.agent.md` | `/ldi` | Workflow completo de versionamento + deploy. Sem micro-commits. Toda alteração → bump version → build → commit → push → deploy + relatório. |

## Deploy commands (must run in this order)

```
npm run build        # vite build → dist/
npm run deploy       # predeploy runs build, then gh-pages pushes dist/ to gh-pages branch
git push             # push main branch source
```

`npm run dev` starts the Vite dev server. `npm run preview` previews the production build locally.

## SPA on GitHub Pages

`public/404.html` catches 404s, extracts the original path, and redirects to `/?/<path>`. A script in `index.html` head restores the clean URL via `history.replaceState`. Do not remove or break either file.

## Version constants (every game has its own)

| Game | Constant | File |
|---|---|---|
| Site global | `SITE_VERSION` | `src/config/version.js` |
| Pesadelo Particular | `PP_VERSION` | `src/config/version.js` |
| Lendas do LDI | `LDI_VERSION` | `src/config/version.js` |
| Jack Dream Candy | `JACK_VERSION` | `src/config/version.js` |
| LDI Gangues | `GANGUES_VERSION` | `src/config/version.js` |
| Arena LDI Tatics | `TATICS_VERSION` | `src/config/version.js` |
| MiniGames | `MINIGAMES_VERSION` | `src/config/version.js` |
| Top Trumps SP | `TS_VERSION` | `src/config/version.js` |
| Top Trumps MP | `TM_VERSION` | `src/config/version.js` |

> **⚠️ Atenção:** A partir de Julho 2026, TODAS as versões estão centralizadas em `src/config/version.js`. As versões individuais nos arquivos de jogo agora são imports desse único arquivo.

Each logs to console on mount: `[LDI] versão carregada: X.X.X`, etc.



At the end of every task, deliver a **report table** with the version changes **highlighted**:

```
| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | TATICS_VERSION bump | X.X.X → **Y.Y.Y** |
| `src/config/version.js` | SITE_VERSION bump | X.X → **Y.Y** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| **Commit** | `abc1234` — `desc + vY.Y.Y` | ✅ |
| **Deploy** | Status | ✅/❌ |
```

## Conduct rules

- **Never** overwrite entire arrays — add items instead
- **Never** remove diagnostic `console.log`s unless asked
- **Never** use inline `style={{}}` for visual properties — keep it in CSS
- **Always** verify no existing files were destroyed before deploy
- **Always** check ALL cards are present when modifying `src/pages/Extras.jsx`
- **Always** read `SITE_MAP.md` before changes that affect routes or versions
- **Read `SITE_MAP.md` first** for route tables, component inventory, data file locations, and z-index layer map before navigating the codebase
- **Arquivos proibidos — nunca tocar**:
  - `e2e/routes.spec.js`
  > ArenaTestbed não tem mais restrição de arquivos proibidos (revisado em 11/07/2026 — V1 do combate foi deletado, V2 é a única versão ativa, protótipo em desenvolvimento normal).

## Decisões e Hurdles Documentados

Registro vivo de problemas já resolvidos no projeto para o agente não repetir os mesmos erros.

- **Canvas height não se comporta como div em flex** — sempre medir o pai, nunca o canvas
- **FK profiles_id_fkey** — insert em profiles só após SIGNED_IN, nunca no signUp direto
- **emailRedirectTo** deve ser URL fixa `https://illusionfight.com/login`, nunca `window.location.origin`
- **Nunca migrar para nova biblioteca de rendering sem ganho visual comprovado** (lição Pixi.js)
- **Sempre `maybeSingle()`** em vez de `single()` no Supabase para evitar erro em resultado vazio
- **Glob path quebra silenciosamente ao mover componente de pasta** — `import.meta.glob` usa caminho relativo ao arquivo atual. Se o componente é movido (ex: `src/pages/` → `src/pages/content/`), o glob `'../data/**/*.md'` não acha mais nada, mas não dá erro — só retorna vazio. Sempre verificar paths de `import.meta.glob` após refactors que movem arquivos.
- **notificationManager.queue persiste em localStorage entre sessões** — achievements enfileirados por um usuário logado permanecem na fila após logout. Quando o guest continua navegando, `UnifiedNotification` encontra as notificações stale e exibe popup de achievement. A correção é limpar (`clearByType('achievement')`) na transição `user → null` em `AchievementsContext`. As notificações LDI tip não são afetadas.
- **LINGUAGEM VISUAL ÚNICA — a base é a navbar** — o portal tem UMA linguagem, extraída da navbar/drawer e codificada em `src/styles/design-system.css` (importado por `index.css`). O visitante tem que sentir que está no mesmo aplicativo o tempo todo: nada de cada área ter paleta, fonte e efeito próprios. Antes eram 4 âmbares (`#f5a623`, `#e8853a`, `#f4a227`, `#ffae32`) e 4 cianos (`#00b4d8`, `#00eeff`, `#00e5ff`, `#18dafb`) espalhados — hoje são `--if-amber` e `--if-cyan`/`--if-teal`. **Nunca escreva hex novo numa página**: use os tokens. Os gestos de assinatura são o canto chanfrado (`clip-path` cortando o topo direito, nunca `border-radius`), o eyebrow mono `IF // ALGO`, o índice numerado, a varredura de luz no hover e a barra ativa `inset 2px`. Primitivas prontas: `.if-panel`, `.if-btn`, `.if-field`, `.if-eyebrow`, `.if-item`, `.if-badge`, `.if-divider`, `.if-stagger`.
- **Cor em canvas não aceita `var()`** — `ctx.fillStyle = 'var(--if-cyan)'` não pinta nada e falha em silêncio. A unificação de paleta vale para CSS e para `style={{}}` de JSX; motores de jogo que desenham em canvas (`drawCombatBoard.js`, `particles.js`, `GridCanvas.jsx`) continuam com hex literal de propósito.
- **i18n é carregado por idioma e por área** — `src/i18n/locales.js` expõe `carregarCore(locale)`, `carregarArea(area, locale)` e `areaDaRota(pathname)`; o `LanguageProvider` baixa só o núcleo do idioma ativo e puxa a área pesada quando a rota entra nela. Antes os 3 idiomas inteiros entravam no bundle (~356K) para servir um. Estrutura: `i18n/core/<lang>.json` (navegação, home, histórias, conta — sempre), `i18n/games/<lang>.json` (strings de dentro dos jogos, inclui pp e toptrumps), `i18n/prototype/<lang>.json`, e `gangues-<lang>.json` à parte via `useGanguesI18n()`. **Chave nova vai no arquivo da área, nunca num monolito**; e tem que existir nos 3 idiomas.
- **O PORTAL É MOBILE ONLY — uma visão só, a do celular** — não é mobile-first, é mobile e ponto. Não importa a plataforma que acessa: num monitor de 1920px o site é o MESMO app de celular, numa coluna centralizada, com o resto da tela servindo de moldura. Não existe visão desktop, nem "versão desktop do componente X", nem breakpoint que revela algo a mais em tela grande. A coluna é `#root` em `src/index.css` (`--app-w: 480px`, NUNCA mude) e toda página herda — não repita `max-width` por página. Vale para TODA página, jogo, overlay e componente.
- **Mobile only: as três armadilhas** — media query, unidade `vw` e `position: fixed` medem o VIEWPORT, não a coluna; num desktop enxergam 1920px e quebram a visão única. (1) `@media`: `max-width` ≥ 480 é sempre verdadeiro dentro da coluna → desembrulhe o bloco; `min-width` ≥ 480 é estilo desktop → apague. Só sobrevive query abaixo de 480 ou não-dimensional (`prefers-reduced-motion`, `orientation`). (2) `vw`: `78vw` num desktop = 1497px — use `calc(78 * var(--app-vw) / 100)`, inclusive dentro de `clamp()` de fonte. (3) `position: fixed`: cola na borda da tela — confine com `left/right: var(--app-gutter)` (bloco pronto no `index.css`); painel ancorado à direita, como o drawer, leva só `right`. Foi assim que a Rádio Nina parou de atravessar o monitor inteiro. Detalhes na Bíblia §4.
- **Kernel Games: padding mínimo, espaço máximo** — dentro do container portrait, cada pixel conta:
  - `.sr-arena` / arena: padding 8px (não 16px). O cálculo de tileSize no JS deve bater com o CSS (`clientWidth - 16` para padding 8px).
  - `.sr-hud` / `.cp-hud`: padding 6px 12px (não 8px 16px)
  - `.cp-game-body`: padding 8px 6px 6px (não 16px 14px 12px)
  - Margens de elementos de menu: 24px (não 40px)
  - Keyboard: sem max-width no container, teclas sem max-width individual, `flex: 1` distribui igualmente, min-height 44px
- **Kernel Games: CSS mobile-first NÃO é media query no fim** — o layout deve ser pensado para retrato desde o início. Adicionar `@media (min-width: 600px)` com overrides no final do CSS é trabalho superficial e NÃO será aceito. O container .kg-page com max-width já resolve a adaptação.
- **CSS de jogo nunca pode usar seletor de elemento global** — regras como `header {}` vazam porque os CSS importados pelo Vite são globais. Sempre limitar pelo wrapper do jogo (`.kp-wrapper header`) e manter classes prefixadas; um `header { display:flex }` do Kernel Panic quebrou o cabeçalho do lobby multiplayer.
- **Cascata CSS deve ser validada no bundle final do Vite** — CSS importado por um componente filho pode aparecer antes do CSS base importado pelo componente pai. Um modificador com a mesma especificidade pode funcionar numa concatenação manual e ser sobrescrito em produção. Modificadores críticos de layout devem usar especificidade suficiente ou ficar depois da regra base; o teste deve carregar o CSS gerado em `dist/assets/` e conferir os estilos computados e o comportamento real no Playwright. Caso conhecido: `.gang-page` sobrescreveu o scroll mobile de `.gang-page--training` na Zona de Treinamento.
- **Kernel Games: hierarquia de botão Voltar** — dentro do gameplay: `setPhase('select')` + cleanup (volta ao menu de dificuldade). No menu de dificuldade: `onBack` prop → `navigate('/games')` (volta ao catálogo Kernel Games).
- **Isaias exige revisão visual real, não checklist burocrática** — toda mudança de CSS/layout deve ser pensada e testada visualmente. Valores arbitrários sem intenção de uso de espaço serão rejeitados. Se o agente não tem certeza do resultado visual, deve ler os CSS existentes e entender o fluxo de layout antes de editar.
- **Deploy sem commit = deploy perdido** — o workflow obrigatório é bump → build → commit → push → deploy. Pular commit/push faz o código-fonte não acompanhar o build publicado. NUNCA pular `git add -A && git commit && git push` antes de `npm run deploy`.

## Regra Anti-Over-Engineering

Antes de criar **mais de 2 arquivos novos** para resolver qualquer problema, o agente deve apresentar a proposta e aguardar aprovação explícita.

## Regra de Tamanho de Arquivo

Todo arquivo tocado com **mais de 300 linhas** deve ser avaliado para extração antes de adicionar mais código. Propor a extração, não executar sem aprovação.

## Segurança é hábito, não fase

Nenhum commit pode passar com:
- String hardcoded visível ao usuário
- CSS inline (`style={{}}` para propriedades visuais)
- Chave i18n faltando em **PT/EN/ES**
- Insert direto em tabela Supabase fora do listener correto

## Este documento é trabalho em progresso

AGENTS.md **deve crescer** a cada problema novo resolvido no projeto. A cada task concluída com uma decisão relevante de arquitetura, o agente **deve propor adição** ao AGENTS.md.

## Architecture notes

- **Lobby multiplayer compartilhado é a entrada oficial dos jogos** — a rota `/games/multiplayer/lobby` e `useSharedLobbyMachine` cuidam apenas de acionar a fila oficial do jogo, observar a sala devolvida e encaminhar os usuários confirmados. Cada game aponta seu menu para essa rota com `game` e `mode`, fornece um adaptador próprio e mantém sua máquina de partida independente. Presence não é fonte de verdade para matchmaking. No Top Trumps, `entrar_fila_publica` é a autoridade para criar/conciliar a sala; o cliente nunca procura e reutiliza uma sala anterior antes da RPC. A rota legada `/games/toptrumps/lobby` existe somente como redirect de compatibilidade.
- **Lobby multiplayer: encontro não navega imediatamente** — `MATCHED` inicia uma preparação visual de 5 segundos controlada por `useSharedLobbyMachine`. A UI informa que o rival foi encontrado e que os jogadores estão sendo sincronizados; o adaptador do jogo só recebe `onMatch(salaId)` quando a contagem chega a zero. IDs de sala, chaves de fila e linguagem de diagnóstico ficam apenas nos logs, nunca na interface final.
- **Top Trumps MP: state machine é a autoridade única do turno** — mudanças de fase, início/fim da apresentação do resultado, confirmações dos jogadores e liberação da próxima rodada devem passar exclusivamente por `useMultiplayerTurnMachine`. Eventos do Supabase, presença, animações e timers apenas despacham eventos; é proibido alterar a fase diretamente ou manter um segundo cronômetro de resultado fora da máquina. Os dois jogadores devem assinar o mesmo tópico de presença por sala (`presenca-partida-${salaId}`); incluir `userId` no nome separa os clientes e impede confirmações mútuas.
- **Top Trumps MP: barreira curta antes da escolha** — ao entrar em `jogando` ou mudar `turno_atual`, a interação permanece bloqueada por 2 segundos para conciliar turno, carta e autoridade entre os clientes. O cronômetro de escolha de 30 segundos começa somente depois dessa liberação. Não remover a barreira sem substituir sua garantia de consistência.
- **Top Trumps MP: URLs de salas encerradas são efêmeras** — a tela final registra em `sessionStorage` um prazo local de 30 segundos por `salaId`. Durante esse prazo, reload na mesma aba preserva o relatório; sem prazo ativo ou depois de expirar, qualquer acesso a uma sala `encerrada` redireciona imediatamente para `/games/toptrumps`. O botão final e o retorno automático também removem o prazo e voltam ao início do Top Trumps, nunca ao catálogo `/games`.
- **Top Trumps MP: PPT tem prazo obrigatório** — cada cliente dispõe de 30 segundos para escolher pedra, papel ou tesoura. No zero, o próprio cliente envia uma opção aleatória por `escolherPPT`; o guard síncrono `pptEscolhiRef` impede envio manual e automático duplicado.

- **Top Trumps: artes oficiais centralizadas** — toda arte de personagem deve usar o nome `card-NN.png` em `src/assets/images/cards/characters/`, com `NN` correspondente ao `id` existente nos catálogos `supertrunfo-pt.json`, `supertrunfo-en.json` e `supertrunfo-es.json`. Componentes devem resolver a imagem exclusivamente por `src/lib/topTrumpsCardImages.js`; é proibido recriar mapas manuais de imports por card. Ao adicionar uma arte, validar que os IDs dos três catálogos coincidem, que o resolvedor encontra todas as imagens e que nenhuma cai em `card-fallback.png`.
- **Game pages** (`/games/ldi`, `/games/jackcandy`, `/games/toptrumps`, etc.) have their own data/, store/, components/ subdirectories with independent Zustand stores. They do not share state.
- **i18n** uses `LanguageContext` (persisted as `ldi-locale` in localStorage) with JSON files in `src/i18n/`. The `t("key.path")` function resolves translations.
- **ReaderContext** wraps the app — when `readerMode` is true, Navbar and TrialBanner are hidden (used by WebtoonEpisodio and LivroCapitulo).
- **z-index layers** are defined and must not collide: SearchModal (2000), AchievementToast (1500), Navbar (1000), TrialBanner (998), CookieBanner (200), LDINotification (150), ScrollToTop (100), MusicSection dropdown (50).
- **Book chapters** are `.md` files in `src/data/livro/{lang}/` loaded via `import.meta.glob`. Publication control is in `src/data/livro-index.json` (`publicado: true/false`).
- **Webtoon pages** live in `public/webtoon/` (not `src/assets/`) because they need direct URL access.
- **All other assets** go in `src/assets/` and are imported (Vite processes and hashes them).
- **Supabase migrations** are in `supabase/migrations/`. Files 001-003 exist only on the remote database; the repo has `004_jack_v3.sql` and `005_pesadelo_particular.sql`. All tables use RLS with `auth.uid() = user_id`.
- **Fichas system** — virtual currency managed by `FichasContext`. Games gate access via `useFichaGate` hook and `ModalSemFichas` component.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
