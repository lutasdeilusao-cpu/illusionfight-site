# AGENTS.md — Illusion Fight Site

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
- **No lint, no typecheck, no test suite.** Only verification is `npm run build`.

## Environment

- `.env` sets `VITE_DEBUG=true` (dev)
- `.env.production` sets `VITE_DEBUG=false`
- Vite base: `/illusionfight-site/` (configured in `vite.config.js`)
- Supabase project: `dvxfrzixtetdzmdrzkpx.supabase.co` — client initialized in `src/lib/supabase.js` with anon key

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
| Site global | `SITE_VERSION` | `src/config/version.js:1` |

Each logs to console on mount: `[LDI] versão carregada: X.X.X`, etc.

## Mandatory workflow for every code change

No exceptions. Every modification to any game file:

1. **Bump the version** in the corresponding file above
2. **Update `SITE_MAP.md`** with the new version number
3. **`npm run build`** — if it fails, fix before proceeding
4. **`git add -A && git commit -m "<desc> + vX.X.X"`**
5. **`git push`**
6. **`npm run deploy`**
7. **Verify** the deploy published without errors

At the end of every task, deliver a report table: file modified | what changed | old version → new version | commit hash | deploy status.

## Conduct rules

- **Never** overwrite entire arrays — add items instead
- **Never** remove diagnostic `console.log`s unless asked
- **Never** use inline `style={{}}` for visual properties — keep it in CSS
- **Always** verify no existing files were destroyed before deploy
- **Always** check ALL cards are present when modifying `src/pages/Extras.jsx`
- **Always** read `SITE_MAP.md` before changes that affect routes or versions
- **Read `SITE_MAP.md` first** for route tables, component inventory, data file locations, and z-index layer map before navigating the codebase

## Architecture notes

- **Game pages** (`/extras/ldi`, `/extras/jackcandy`, `/extras/toptrumps`, etc.) have their own data/, store/, components/ subdirectories with independent Zustand stores. They do not share state.
- **i18n** uses `LanguageContext` (persisted as `ldi-locale` in localStorage) with JSON files in `src/i18n/`. The `t("key.path")` function resolves translations.
- **ReaderContext** wraps the app — when `readerMode` is true, Navbar and TrialBanner are hidden (used by WebtoonEpisodio and LivroCapitulo).
- **z-index layers** are defined and must not collide: SearchModal (2000), Navbar (1000), TrialBanner (998), CookieBanner (200), NotificationBalloon (150), ScrollToTop (100), MusicSection dropdown (50).
- **Book chapters** are `.md` files in `src/data/livro/{lang}/` loaded via `import.meta.glob`. Publication control is in `src/data/livro-index.json` (`publicado: true/false`).
- **Webtoon pages** live in `public/webtoon/` (not `src/assets/`) because they need direct URL access.
- **All other assets** go in `src/assets/` and are imported (Vite processes and hashes them).
- **Supabase migrations** are in `supabase/migrations/`. Files 001-003 exist only on the remote database; the repo has `004_jack_v3.sql` and `005_pesadelo_particular.sql`. All tables use RLS with `auth.uid() = user_id`.
- **Fichas system** — virtual currency managed by `FichasContext`. Games gate access via `useFichaGate` hook and `ModalSemFichas` component.
