# AGENTS.md — Illusion Fight Site

## Mandatory workflow for every code change

No exceptions. Every modification to any game file:

> **⚠️ O VERSION NUMBER VEM PRIMEIRO — NÃO PULE ESTA ETAPA**

1. **🔴 BUMP THE VERSION** — Abra `C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI\src\config\version.js` e **INCREMENTE** a versão do jogo/site modificado.
   > **Regra absoluta:** toda task que toca **qualquer arquivo** do projeto sobe `SITE_VERSION` patch obrigatoriamente, sem exceção. Se a task também mexe em um jogo específico, sobe a versão do jogo **e** a do site.
2. **🔴 Update `SITE_MAP.md`** — Atualize o número da versão na tabela de rotas
3. **`npm run build`** — if it fails, fix before proceeding. `sourcemap: true` é obrigatório em todas as builds até o lançamento (Setembro 2026). Nunca remover sem autorização explícita de Isaias.
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
| Arena Mode | `ARENA_VERSION` | `src/config/version.js` |
| Arena LDI Tatics | `TATICS_VERSION` | `src/config/version.js` |
| MiniGames | `MINIGAMES_VERSION` | `src/config/version.js` |
| Top Trumps SP | `TS_VERSION` | `src/config/version.js` |
| Top Trumps MP | `TM_VERSION` | `src/config/version.js` |

> **⚠️ Atenção:** A partir de Julho 2026, TODAS as versões estão centralizadas em `src/config/version.js`. As versões individuais nos arquivos de jogo agora são imports desse único arquivo.

Each logs to console on mount: `[LDI] versão carregada: X.X.X`, etc.



**Automation:** `python deploy.py -g <game> -m "description"` does steps 1-6 in one command. Use `--minor` or `--major` for non-patch bumps. Accepts multiple `-g` values.

> **⚠️ deploy.py restaurado em 2026-07-05** — havia sido deletado na sanitização de documentos (commit `4325d47f`). O script foi reescrito para apontar para `src/config/version.js` (versões centralizadas). Se um agente disser que o deploy.py não existe, é porque não fez `git pull` da versão mais recente.

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
- **Kernel Games: layout OBRIGATORIAMENTE vertical (portrait)** — REGRA GERAL DO PORTAL. Não existe versão desktop. Todo jogo, independente do dispositivo, deve ocupar UM container vertical (max-width: 480px, margin: 0 auto) centralizado na tela. O background (scanlines) usa position: fixed para cobrir o viewport atrás do jogo. O jogo NUNCA estica horizontalmente.
- **Kernel Games: padding mínimo, espaço máximo** — dentro do container portrait, cada pixel conta:
  - `.sr-arena` / arena: padding 8px (não 16px). O cálculo de tileSize no JS deve bater com o CSS (`clientWidth - 16` para padding 8px).
  - `.sr-hud` / `.cp-hud`: padding 6px 12px (não 8px 16px)
  - `.cp-game-body`: padding 8px 6px 6px (não 16px 14px 12px)
  - Margens de elementos de menu: 24px (não 40px)
  - Keyboard: sem max-width no container, teclas sem max-width individual, `flex: 1` distribui igualmente, min-height 44px
- **Kernel Games: CSS mobile-first NÃO é media query no fim** — o layout deve ser pensado para retrato desde o início. Adicionar `@media (min-width: 600px)` com overrides no final do CSS é trabalho superficial e NÃO será aceito. O container .kg-page com max-width já resolve a adaptação.
- **Kernel Games: hierarquia de botão Voltar** — dentro do gameplay: `setPhase('select')` + cleanup (volta ao menu de dificuldade). No menu de dificuldade: `onBack` prop → `navigate('/games')` (volta ao catálogo Kernel Games).
- **Isaias exige revisão visual real, não checklist burocrática** — toda mudança de CSS/layout deve ser pensada e testada visualmente. Valores arbitrários sem intenção de uso de espaço serão rejeitados. Se o agente não tem certeza do resultado visual, deve ler os CSS existentes e entender o fluxo de layout antes de editar.
- **deploy.py foi deletado silenciosamente na sanitização de docs (commit `4325d47f`)** — AGENTS.md e BÍBLIA.md continuavam referenciando `python deploy.py` como automação, mas o arquivo não existia. Agentes que tentavam usar recebiam `FileNotFoundError` e "deploy falhou silenciosamente". O script foi reescrito em 2026-07-05 para apontar para `src/config/version.js` (versões centralizadas). Sempre verificar se `deploy.py` existe antes de confiar na documentação. Se sumir de novo, restaurar do histórico do git (`git restore deploy.py`).
- **Deploy sem commit = deploy perdido** — AGENTS.md workflow diz: bump → build → commit → push → deploy. Pular commit/push faz o código fonte sumir para sempre. O gh-pages recebe o build, mas main não tem o fonte. O script `deploy.py` executa commit+push AUTOMATICAMENTE, evitando esse erro humano. Se o agente estiver fazendo deploy manual, NUNCA pular `git add -A && git commit && git push` antes de `npm run deploy`.

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

- **Lobby multiplayer compartilhado é separado das máquinas dos jogos** — a rota `/games/multiplayer/lobby` e `useSharedLobbyMachine` cuidam apenas de entrar na fila canônica do banco, reconciliar a sala e encaminhar os dois usuários confirmados. Presence não é fonte de verdade para matchmaking. Cada jogo fornece seu adaptador de fila; no Top Trumps, a confirmação exige uma linha em `toptrumps_salas`, dois IDs de usuários distintos e `status = em_jogo`. Após a confirmação, a máquina específica do jogo assume a partida pela mesma `salaId`.
- **Top Trumps MP: state machine é a autoridade única do turno** — mudanças de fase, início/fim da apresentação do resultado, confirmações dos jogadores e liberação da próxima rodada devem passar exclusivamente por `useMultiplayerTurnMachine`. Eventos do Supabase, presença, animações e timers apenas despacham eventos; é proibido alterar a fase diretamente ou manter um segundo cronômetro de resultado fora da máquina. Os dois jogadores devem assinar o mesmo tópico de presença por sala (`presenca-partida-${salaId}`); incluir `userId` no nome separa os clientes e impede confirmações mútuas.

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
