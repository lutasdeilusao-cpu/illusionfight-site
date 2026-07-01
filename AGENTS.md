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
| Lendas do LDI | `LDI_VERSION` | `src/pages/LDI/store/useGameStore.js:1` |
| Jack Dream Candy | `JACK_VERSION` | `src/pages/JackCandy/store/useJackStore.js:1` |
| Top Trumps | `MP_VERSION` | `src/pages/TopTrumpsMP.jsx:21` (no store dir) |
| MiniGames | `MINIGAMES_VERSION` | `src/pages/MiniGames/version.js:1` |
| Arena Mode | `ARENA_VERSION` | `src/pages/Arena/ArenaRoute.jsx:10` (not in store) |
| Pesadelo Particular | `PP_VERSION` | `src/pages/PesadeloParticular/PP.jsx:7` |
| Arena LDI Tatics | `TATICS_VERSION` | `src/config/version.js` |
| Site global | `SITE_VERSION` | `src/config/version.js` |

Each logs to console on mount: `[LDI] versão carregada: X.X.X`, etc.



**Automation:** `python deploy.py -g <game> -m "description"` does steps 1-6 in one command. Use `--minor` or `--major` for non-patch bumps. Accepts multiple `-g` values.

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

## Decisões e Hurdles Documentados

Registro vivo de problemas já resolvidos no projeto para o agente não repetir os mesmos erros.

- **Canvas height não se comporta como div em flex** — sempre medir o pai, nunca o canvas
- **FK profiles_id_fkey** — insert em profiles só após SIGNED_IN, nunca no signUp direto
- **emailRedirectTo** deve ser URL fixa `https://illusionfight.com/login`, nunca `window.location.origin`
- **Nunca migrar para nova biblioteca de rendering sem ganho visual comprovado** (lição Pixi.js)
- **Sempre `maybeSingle()`** em vez de `single()` no Supabase para evitar erro em resultado vazio
- **Glob path quebra silenciosamente ao mover componente de pasta** — `import.meta.glob` usa caminho relativo ao arquivo atual. Se o componente é movido (ex: `src/pages/` → `src/pages/content/`), o glob `'../data/**/*.md'` não acha mais nada, mas não dá erro — só retorna vazio. Sempre verificar paths de `import.meta.glob` após refactors que movem arquivos.

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

- **Game pages** (`/games/ldi`, `/games/jackcandy`, `/games/toptrumps`, etc.) have their own data/, store/, components/ subdirectories with independent Zustand stores. They do not share state.
- **i18n** uses `LanguageContext` (persisted as `ldi-locale` in localStorage) with JSON files in `src/i18n/`. The `t("key.path")` function resolves translations.
- **ReaderContext** wraps the app — when `readerMode` is true, Navbar and TrialBanner are hidden (used by WebtoonEpisodio and LivroCapitulo).
- **z-index layers** are defined and must not collide: SearchModal (2000), AchievementToast (1500), Navbar (1000), TrialBanner (998), CookieBanner (200), LDINotification (150), ScrollToTop (100), MusicSection dropdown (50).
- **Book chapters** are `.md` files in `src/data/livro/{lang}/` loaded via `import.meta.glob`. Publication control is in `src/data/livro-index.json` (`publicado: true/false`).
- **Webtoon pages** live in `public/webtoon/` (not `src/assets/`) because they need direct URL access.
- **All other assets** go in `src/assets/` and are imported (Vite processes and hashes them).
- **Supabase migrations** are in `supabase/migrations/`. Files 001-003 exist only on the remote database; the repo has `004_jack_v3.sql` and `005_pesadelo_particular.sql`. All tables use RLS with `auth.uid() = user_id`.
- **Fichas system** — virtual currency managed by `FichasContext`. Games gate access via `useFichaGate` hook and `ModalSemFichas` component.
