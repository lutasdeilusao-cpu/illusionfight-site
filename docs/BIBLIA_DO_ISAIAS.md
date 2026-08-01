# BÍBLIA DO ISAIAS — Filosofia, Arquitetura e Regras do Projeto

> Documento único e definitivo. Tudo que o agente precisa saber sobre como Isaias trabalha, como o portal funciona, arquitetura, código, CSS, i18n.

## Índice
0. [Consultar o Graphify primeiro](#0-antes-de-qualquer-grep-amplo--consultar-o-graphify)
1. [Filosofia](#1-filosofia)
2. [Stack](#2-stack--ambiente)
3. [Workflow Obrigatório](#3-workflow-obrigatório)
4. [Layout & CSS](#4-layout--css)
5. [i18n](#5-i18n)
6. [Arquitetura do Portal](#6-arquitetura-do-portal)
7. [Regras de Código](#7-regras-de-código)
8. [Versionamento](#8-versionamento)
9. [Sistemas do Portal](#9-sistemas-do-portal)
10. [Decisões e Hurdles](#10-decisões-e-hurdles)
11. [Infraestrutura](#11-infraestrutura)
12. [Conduct Rules](#12-conduct-rules)

---

## 🗑️ Contador de Merda do Agente de Código — 1

> **#001 — 2026-07-04:** Agente criou 2 arquivos por jogo (wrapper+puzzle) para Kernel Games, quebrando o padrão de 1 arquivo por jogo do repositório. **Lição:** seguir o padrão existente; não inventar arquitetura sem aprovação.
>
> **#002 — 2026-07-04:** Agente fez merge wrapper+puzzle em 6 jogos e **não commitou nem fez push/deploy** — relatou "✅" para tudo mesmo assim. Isaias encontrou o erro. **Lição:** NUNCA confiar no relatório do agente anterior. Sempre verificar `git status` + `git log` antes de prosseguir.
>
> **#003 — 2026-07-04:** MazeRafael e BulletHellRafael tiveram null refs pós-countdown (~3s):
> 1. `getUnvisitedNeighbors()` lia `mazeRef.current`, mas `generateMaze()` só atribuía a ref **depois** do loop — durante a geração a ref era null.
> 2. `startGame()` acessava `canvasRef`/`arenaRef`/`hudRef` ainda na fase countdown, que não renderiza esses elementos — refs null.
> 3. Playwright não pegou porque não esperou o countdown inteiro.
> **Lição:** nunca acessar refs de DOM enquanto a fase ainda não renderizou esses elementos (mudar fase primeiro, acessar refs depois, num rAF). Nunca ler uma ref dentro da própria função que a atribui — passar a variável local como parâmetro. Teste mental de null ref é obrigatório para código em callbacks de `setTimeout`/`useEffect`.
>
> **#004 — 2026-07-04:** GlitchRafael renderizava o grid via JSX (`gridData.map()` → `<span>`) ignorando `rowBreak` — 1218 caracteres numa linha só, estourando o container. Tentativa de fix com `{rowBreak ? '\n' : null}` falhou: React 19 em produção otimiza/remove text nodes `\n` "insignificantes". **Fix correto:** construir o grid imperativamente via `document.createDocumentFragment()` + `createTextNode('\n')` + `appendChild()`, com `preRef`; atualizações visuais direto no DOM, sem `setState`. **Lição:** `\n` via JSX/VDOM dentro de `<pre>` não é confiável — se o original usa DOM imperativo, a versão React deve usar o mesmo approach via `useRef`. Dado que existe na estrutura mas não é usado no render é bug. Teste funcional deve checar `pre.textContent.split('\n').length > 1`, não só ausência de console.error.

---

## 0. Antes de qualquer grep amplo — consultar o Graphify

Este projeto tem um grafo de conhecimento gerado pelo Graphify em `graphify-out/`. Serve bem para perguntas de **relação/arquitetura** ("como X se conecta com Y", "o que depende desse módulo", "quais clusters existem"). **Não confiar nele para perguntas de "onde existe um arquivo/nome específico"** — testado em 2026-07-13: `graphify query "onde estão todas as cópias de combat.js e ai.js"` devolveu um traversal com seeds mal interpretados (fuzzy-match tosco nos tokens da pergunta, não busca semântica real) e não achou as cópias que o grep manual já tinha confirmado. Para esse tipo de busca, **grep continua sendo a ferramenta certa**, não `graphify query`.

Uso recomendado, nessa ordem:
1. `graphify-out/GRAPH_REPORT.md` — visão geral, god nodes, comunidades (útil para entender arquitetura geral)
2. `graphify path <A> <B>` — relação entre dois arquivos conhecidos
3. `graphify explain <arquivo>` — detalhe de um nó específico já identificado
4. `graphify query "pergunta"` — usar com ceticismo; validar o resultado antes de confiar, principalmente para perguntas do tipo "onde/quantas cópias existem de X"
5. `grep` — sempre a ferramenta padrão para localizar arquivos/strings por nome; nunca substituída pelo grafo

Não substitui grep/prova de leitura em tasks de bug — a regra de colar output real continua valendo.

---

## 1. Filosofia

**Mobile-first de verdade — não existe desktop.** Todo jogo/página, em qualquer dispositivo, parece um app de celular: container `max-width: 480px; margin: 0 auto`, backgrounds em `position: fixed; inset: 0` atrás do container. Nunca esticar horizontalmente.

**Cada pixel é intencional.** Nada de padding/margem/gap arbitrário — ver tabela exata em §4. Se não tiver certeza do resultado visual, ler o CSS existente e entender o fluxo antes de editar. "Fazer por fazer" não é aceito; correção esperada já na primeira tentativa, mas refazer 2-3x até acertar é normal.

**Sem frescura.** Zero CSS-in-JS para estático. Zero libs novas sem ganho visual comprovado (lição Pixi.js — não repetir). Mais de 2 arquivos novos ou arquivo passando de 300 linhas → propor extração/arquitetura e aguardar aprovação antes de executar. Nunca sobrescrever array inteiro (adicionar itens). Nunca remover `console.log` de diagnóstico sem permissão.

---

## 2. Stack & Ambiente

| Tecnologia | Versão | Uso |
|---|---|---|
| Vite | 8 | Build (`@vitejs/plugin-react`) |
| React | 19.1 | JSX only, **sem TypeScript** |
| React Router | 7.6 | Client-side routing |
| Zustand | 5 | State por jogo |
| Framer Motion | 12.40 | Animações |
| Supabase | 2.107 | Auth, realtime, save |
| Pixi.js | 7.4 | Canvas (só onde necessário) |
| gh-pages | 6.3 | Deploy |
| react-helmet-async | 3.0 | `<title>`/meta por página |
| react-markdown | 10.1 | Capítulos do livro |
| Playwright | 1.61 | Pré-renderização (build) |

- Domínio: `https://illusionfight.com/` · Vite base: `/` · Supabase: `dvxfrzixtetdzmdrzkpx.supabase.co` (client em `src/lib/supabase.js`, anon key)
- Stripe (`src/lib/stripe.js`): ELITE R$10/mês, PRIMORDIAL R$30/mês
- `.env`: `VITE_DEBUG=true` (dev) / `false` (prod); `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PRICE_ELITE`, `VITE_STRIPE_PRICE_PRIMORDIAL`
- `vite.config.js`: `base: '/'`, `build: { sourcemap: true }` — **obrigatório até setembro 2026, nunca remover**

---

## 3. Workflow Obrigatório

> Sem exceção. Toda task que toca qualquer arquivo do projeto:

```
1. BUMP DE VERSÃO → src/config/version.js (SITE_VERSION sempre; + versão do jogo se aplicável)
2. ATUALIZAR SITE_MAP.md (rotas + tabela de versões)
3. npm run build — se falhar, corrigir antes de prosseguir. sourcemap:true obrigatório.
4. git add -A && git commit -m "<desc> + vX.X.X"
5. git push
6. npm run deploy
7. Verificar que o deploy publicou sem erros
```

**Relatório obrigatório ao final de toda task:**
```
| Arquivo | O que mudou | Versão |
|---|---|---|
| src/config/version.js | SITE_VERSION bump | X.X.X → Y.Y.Y |
| SITE_MAP.md | Versão atualizada | ✅ |
| Commit | abc1234 — desc + vY.Y.Y | ✅ |
| Deploy | Status | ✅/❌ |
```

---

## 4. Layout & CSS

**Container vertical (regra geral):**
```css
.kg-page, .game-wrapper /* qualquer container de jogo */ {
  position: relative; width: 100%; max-width: 480px; /* NUNCA mude */
  min-height: 100vh; margin: 0 auto; overflow: hidden;
}
```
Backgrounds (scanlines, grids) em `position: fixed; inset: 0` atrás do container. Esticar horizontalmente = errado.

**Botão voltar:**
- Nível 2 (menu dificuldade → catálogo Kernel Games): `onBack` prop → `navigate('/games')`
- Nível 1 (gameplay → menu do próprio jogo): `cleanup(); setPhase('select')` (Sliding) / `setActive(false); setPhase('select')` (Código Perdido)
- Fase `countdown` (~3s) não precisa de botão. Fase `game` precisa no HUD. Fase `select` precisa de volta ao catálogo.

**Padding — valores exatos (nunca os "errados" ao lado):**

| Elemento | Correto | Errado |
|---|---|---|
| Arena/área de jogo | `8px` | `16px` |
| HUD | `6px 12px` | `8px 16px` |
| Game body (CodigoPerdido) | `8px 6px 6px` | `16px 14px 12px` |
| Margem subtítulo menu | `24px` | `40px` |
| Gap entre botões menu | `6px` | `8px` |
| Screen padding (select) | `24px 16px` | `28px 20px` |

**Tile sizing (Sliding Puzzle):** cálculo em JS deve bater com o padding CSS — padding 8px cada lado → `clientWidth - 16`; nunca mudar um sem o outro.

**Teclado virtual (Código Perdido/forca):** container `width: 100%` sem `max-width`; teclas `flex: 1` sem `max-width` individual; `min-height: 44px` (WCAG); gap 5px entre linhas, 4px entre teclas.

**HUD padrão:** `[← back 44×44] [timer/vidas] [centro] [dificuldade]` — back 44×44px borda 1px cyan; `flex-shrink: 0; border-bottom: 1px solid var(--ghost)`.

**Mobile-first não é media query no fim.** Errado: CSS de desktop "consertado" com `@media`. Certo: pensar em portrait desde o início — `max-width: 480px` já resolve a adaptação.

**CSS custom properties:** globais em `src/index.css :root` (`--bg-primary`, `--accent-teal`, etc.); por jogo com prefixo (`--pp-jack`, `--tt-orange`, `--cp-cyan`, `--sr-ghost`); dinâmicas via inline (`--cor-neon`, `--pct`, `--delay`).

**Canvas em flex:** não se comporta como div — sempre medir `clientWidth`/`clientHeight` do container pai, nunca o canvas.

**CSS inline — aceitável só para runtime:** custom properties injection (`style={{'--cor-neon': jogo.cor}}`), valores calculados (`width: ${pct}%`), imagem dinâmica (`backgroundImage: url(${src})`), partículas Framer Motion com posição randômica. **Proibido** (vai pro CSS): `textAlign`, `padding`, `margin`, `color`, `display`, `position`, `cursor`, `opacity`, `zIndex`, ou qualquer padrão repetido 5+ vezes.

Zero CSS-in-JS — cada componente tem um `.css`. Classes kebab-case/BEM-like com prefixo por jogo (`sr-*`, `cp-*`, `pp-*`, `tt-*`).

*Violações pendentes de correção:* `DueloRoute.jsx` (cores de borda/botão inline), `LDI/Lobby.jsx` e `LDI/Game.jsx` (`marginTop`, `marginRight`, `cursor` inline).

---

## 5. i18n

- Provider: `LanguageProvider` (`src/context/`) · Agregador: `src/i18n/locales.js` (deepMerge dos JSONs) · Hook: `useLanguage()` → `{ locale, t, tt, changeLocale }`
- `t("games.arena.atacar")` — notação de pontos, suporta `[0]` em arrays. Fallback: retorna o próprio path. Interpolação: `{varName}`. `tt(path)` prefixa `games.toptrumps.` automaticamente.
- **deepMerge:** recursivo, substitui arrays (não concatena); argumento posterior sobrescreve em conflito.
- **rafael_*.json** (`src/components/Puzzles/i18n/`) NÃO passam pelo `locales.js` — import dinâmico relativo ao hook `useRafaelI18n.js`, cache module-level. Mover o hook quebra o import silenciosamente (glob retorna vazio, sem erro).

**Namespaces principais:** `nav`, `hero`, `episodes`, `musicas`, `achievement`, `login_gate`, `search`, `shop`, `footer`, `assinar`, `tatics`, `quiz`, `autor`, `site`, e `games.*` (duelo, minigames, tatics, arena, lobby, mp, tamagoshi ~150+, pesadelo, jackcandy ~200, ldi ~170).

**Arquivos:** `pt.json`/`en.json`/`es.json` (`src/i18n/`, ~2200+ linhas cada, base do site) + `pp_*.json`, `tt_*.json`, `arena-trash-*.json`, `cardLabels.js` no mesmo diretório; `rafael_*.json` em `src/components/Puzzles/i18n/`.

**Regras:** chaves totalmente aninhadas (não plana). PT/EN/ES obrigatório para toda string visível — chave faltando bloqueia commit. Nome de arquivo sempre `{prefixo}_{locale}.json`. Locale em `localStorage['ldi-locale']`, default `pt`.

**Jogos sem i18n próprio** (strings direto em pt/en/es.json): JackCandy (`games.jackcandy.*`), LDI (`games.ldi.*`), Tamagoshi (`games.tamagoshi.*`), Duelo (`games.duelo.*`), MiniGames (`games.minigames.*`), Quiz (`quiz.*`).

---

## 6. Arquitetura do Portal

```
/
├── index.html, package.json, vite.config.js, AGENTS.md, SITE_MAP.md
├── docs/                  # Bíblia, ReportAI/
├── scripts/, .env(.production)
├── public/                # 404.html (SPA redirect), CNAME, _redirects,
│                           sitemap.xml, sw.js, assets/, games/ (15 HTML SEO), webtoon/
├── supabase/               # migrations/ (004-022), functions/ (3 Stripe Edge Functions)
└── src/
    ├── App.jsx, main.jsx, index.css
    ├── config/             # version.js, site.js, fichas.js, launch.js, trial.js
    ├── context/            # 8 providers
    ├── lib/                # supabase.js, sfx.js, stripe.js, getDeck.js, notificationManager.js
    ├── hooks/ (13), i18n/ (13 arquivos), data/ (29 arquivos), assets/images/
    ├── components/         # 30+ reutilizáveis, incl. Puzzles/ (SlidingRafael, CodigoPerdido)
    └── pages/
        ├── games/ (13 jogos), content/ (8), platform/ (7), site/ (6), lab/ (protótipos)
```

**Provider hierarchy (main.jsx):** `ReaderProvider → HelmetProvider → BrowserRouter → AuthProvider → FichasProvider → DixProvider → AchievementsProvider → EventosProvider → LanguageProvider → App`

**Rotas principais:** `/`, `/personagens(/:id)`, `/livro(/:id)`, `/webtoon(/:id)`, `/musicas`, `/mundo`, `/games`, `/games/ldi*` (8 rotas, FichaGateRoute isFree), `/games/jackcandy`, `/games/minigames` (isFree), `/games/ldi-arena`, `/games/ldi-tatics`, `/games/pesadelo`, `/games/duelo`, `/games/tamagoshi` (isFree), `/games/toptrumps(/legacy|/lobby|/multiplayer)`, `/games/kernel-panic`, `/games/sliding-rafael`, `/games/codigo-perdido`, `/assinar`, `/login`, `/cadastro`, `/perfil`, `/admin`, `/leaderboard`, `/autor`, `/quiz`, `/loja`, `/custos`, `/prototype(/srgrm|/arenatestbed)`, `*` → NotFound. (Todas as `FichaGateRoute` sem `isFree` exigem fichas.)

**ReaderMode:** `ReaderContext` (booleano) — oculta Navbar+TrialBanner. Usado em LivroCapitulo, WebtoonEpisodio, SlidingRafael, CodigoPerdido. Ativar via `useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [])`.

**z-index (nunca colidir, nunca valor solto):** MusicSection dropdown 50 · ScrollToTop 100 · TrialBanner 140 · LDINotification 150 · CookieBanner 200 · Navbar 1000 · AchievementToast 1500 · SearchModal 2000.

---

## 7. Regras de Código

**JS/JSX:** JSX only, sem TypeScript (apesar de `@types/react` em devDeps). Toda string visível ao usuário via `t()` — nunca hardcoded. Nunca sobrescrever array inteiro. Nunca remover `console.log` de diagnóstico sem permissão. Supabase: `maybeSingle()` (não `single()`). Insert em `profiles` só após `SIGNED_IN`, nunca no signUp direto. `emailRedirectTo` fixo: `https://illusionfight.com/login` (nunca `window.location.origin`).

**Bloqueia commit:** string hardcoded visível, CSS inline estático, chave i18n faltando em PT/EN/ES, insert direto no Supabase fora do listener correto, chave/URL exposta.

**Verificação:** não existe linter nem typecheck — única verificação é `npm run build`. Conferir visualmente que nada existente quebrou antes do deploy.

---

## 8. Versionamento

Tudo centralizado em `src/config/version.js`: `SITE_VERSION`, `SLIDING_VERSION`, `CODIGO_VERSION`, `TATICS_VERSION`, `PP_VERSION`, `LDI_VERSION`, `JACK_VERSION`, `MINIGAMES_VERSION`, `ARENA_VERSION`, `TAMA_VERSION`, `DUELO_VERSION`, `TS_VERSION`, `TM_VERSION`, `SRGRM_VERSION`, `ARENATESTBED_VERSION`, `KP_VERSION`. Os arquivos de jogo importam de lá.

Toda task → `SITE_VERSION` patch, sem exceção. Task em jogo específico → bump do jogo **e** do site. Cada jogo loga no mount: `[NOME] versão carregada: X.X.X`. `SITE_MAP.md` sempre atualizado junto.

---

## 9. Sistemas do Portal

**SFX** (`src/lib/sfx.js`) — singleton `sfx`, Web Audio API pura (sons sintetizados, sem arquivos externos), `enabled` em `localStorage['ldi-sfx-enabled']`, AudioContext lazy com auto-resume. 32 funções: UI (`click`, `menuHover`, `select`, `cancel`), Timer (`countdownTick`, `timerUrgent`), Game (`win`, `lose`, `draw`, `reward`, `nextRound`), Battle (`attackSlash/Heavy/Quick/Energy/Critical/Punch`), Card (`cardFlip`, `vs`), Dramatic (`explosion`, `heartbeat`, `start/stopHeartbeatLoop`), Interaction (`typing`, `diceTick/Land`, `message`, `pptChoice`), Power (`powerUsage`, `speakPowerName` via TTS), `notification`. Import: `import { sfx } from '../../lib/sfx'`.

**Fichas** (`FichasContext`) — moeda virtual. Tabelas Supabase `fichas`/`fichas_historico`. Por tier: free=100, elite=10, primordial=30, moderator=10, admin=999. Coleta diária via `coletarDiarias()`. Flag `FICHAS_GATE_ATIVO` em `src/config/fichas.js` desliga o gate inteiro.

**FichaGateRoute** (`src/components/FichaGateRoute/`) — fluxo `carregando → login → gamefree → liberado → confirmacao → semfichas`. Props: `gameId`, `feature`, `nomeExibicao`, `isFree`, `children`. Se gate desligado, renderiza `children` direto. Persistência: `localStorage['ficha_gate_{gameId}']` = data de hoje.

**Auth** (`AuthContext`) — Supabase email/password. Profile insert só após `SIGNED_IN`. `last_seen_at` via `sendBeacon` no beforeunload. Guest não desbloqueia achievements. `LoginGate` (`src/components/LoginGate/`) é modal reutilizável.

**Notification System** (`notificationManager.js`) — fila singleton persistida em `localStorage['ldi-notif-queue']`. `NOTIF_TTL_MS = 5 min`: itens expirados são purgados silenciosamente em toda leitura (`_purgeExpired`), independente de tipo. Ordem FIFO. Cooldown global (não por tipo) de `COOLDOWN_MS = 15 min`. Tipos: `achievement`, `cta_conta`, `ldi_tip`, `nina_music`. `clearByType('achievement')` na transição `user → null` (AchievementsContext) continua como defense-in-depth mesmo com o TTL resolvendo o staleness. `UnifiedNotification` (montado em App.jsx) inscreve-se via `notificationManager.subscribe()`.

**DIX — duas camadas sobre a mesma wallet Supabase (`dix_wallet`):**
- **DixContext** (`src/context/DixContext.jsx`): cria carteira no primeiro login com saldo por tier — `DIX_BOAS_VINDAS = { free: 100, elite: 500, primordial: 1000 }`; recarrega pro tier se saldo chegar a zero. Expõe `creditarDix`, `gastarDix`, `carregarHistorico`, `saldo`, `loading`. Usado em Perfil, PerfilProgresso.
- **Tamagoshi** (`src/pages/games/Tamagoshi/data/moedas.js`): `DIX_POR_ACAO = 10` (alimentar/banhar/brincar/restaurar), `DIX_LOGIN_DIARIO = 25`, `DIX_GACHA = 50`, `DIX_BONUS_LOCAL = 5`. Escreve direto no Supabase via `useTamagoshiStore.ganharDix`, não passa pelo DixContext.

---

## 10. Decisões e Hurdles

- **`import.meta.glob`** resolve caminho relativo ao arquivo atual — se o componente muda de pasta, o glob não acha nada e **não dá erro**, só retorna vazio. Sempre reconferir paths após mover arquivos. Caso conhecido: `rafael_*.json` via `useRafaelI18n.js`.
- **Supabase:** insert em `profiles` só após `SIGNED_IN`; sempre `maybeSingle()`; `emailRedirectTo` fixo.
- **Nunca migrar biblioteca sem ganho visual comprovado** (lição Pixi.js).

---

## 11. Infraestrutura

```bash
npm run build   # vite build + prerender 26 rotas
npm run deploy  # gh-pages push dist/ → branch gh-pages
git push        # push da branch main
```

- **GitHub Pages + SPA:** `public/404.html` captura 404 e redireciona pra `/?/<path>`; script no `<head>` do `index.html` restaura URL limpa via `history.replaceState`. CNAME `illusionfight.com`. 15+ HTML estáticos em `public/*/index.html` pra crawlers SEO. `public/_redirects` com 10+ regras de trailing slash 301.
- **Supabase:** projeto `dvxfrzixtetdzmdrzkpx.supabase.co`, migrations em `supabase/migrations/` (004-022), RLS em todas as tabelas (`auth.uid() = user_id`). Tabelas principais: `profiles`, `toptrumps_decks`, `dix_wallet`, `tamagoshi_saves`, `fichas`, `fichas_historico`. Edge Functions Stripe: `create-checkout-session` (JWT), `stripe-webhook` (sem JWT), `cancel-subscription` (JWT).
- **Sitemap:** 18 URLs públicas em `public/sitemap.xml`, rotas privadas de fora (login/cadastro/perfil/admin/assinar/custos/prototype/multiplayer). `hreflang`: pt, en, es, x-default.

---

## 12. Conduct Rules

1. Nunca sobrescrever array inteiro — adicionar itens.
2. Nunca remover `console.log` de diagnóstico sem permissão.
3. Nunca `style={{}}` para propriedade visual estática — vai no CSS.
4. Sempre verificar que nada existente quebrou antes do deploy.
5. Sempre verificar todos os cards presentes ao mexer em `Games.jsx` (KERNEL_JOGOS).
6. Sempre ler `SITE_MAP.md` antes de mudanças que afetam rotas/versões — é a referência de rotas, inventário de componentes, dados e z-index.
7. Nunca commitar sem build bem-sucedido. Nunca pular bump de versão. Sempre atualizar `SITE_MAP.md` junto.
8. Pensar antes de codificar — visualizar o resultado, testar mentalmente.
9. Perguntar se não tiver certeza. Melhor perguntar do que fazer errado.

---

> "Você tem certeza que fez o que foi pedido?" — Isaias
