# ILLUSIONFIGHT.COM — SITE MAP

*Última atualização: 2026-06-05*  
*Versão: 1.47*  |  `[SITE] versão carregada: 1.47`

> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.**

---

## 1. ESTRUTURA DE PASTAS

```
/
├── index.html                          # Entry point HTML + SEO/OG tags + GA + SPA redirect script
├── package.json                        # Dependências e scripts (inclui predeploy/deploy)
├── vite.config.js                      # Configuração Vite (base: /illusionfight-site/)
├── SITE_MAP.md                         # Este arquivo
├── PREMIUM_AUDIT.md                    # Auditoria de conteúdo premium
├── AGENTS.md                           # Regras do agente opencode
├── .gitignore                          # Node, dist, .env, Retcon.md
├── public/
│   ├── favicon.svg                     # Favicon LDI
│   ├── og-image.jpg                    # Open Graph preview (1200×630)
│   ├── 404.html                        # Redirect SPA para GitHub Pages
│   ├── sitemap.xml                     # Sitemap 8 URLs para crawlers
│   └── webtoon/
│       └── 00/pt/01~21.png             # 21 páginas do webtoon Ep. 00
└── src/
    ├── App.jsx                         # Layout global (TrialBanner, Navbar, Routes, Footer, ScrollToTop, NotificationBalloon, CookieBanner)
    ├── main.jsx                        # Entry point React (ReaderProvider, HelmetProvider, BrowserRouter, LanguageProvider, AuthProvider, FichasProvider)
    ├── index.css                       # CSS Global (reset, vars, .btn, .glitch, reveal animations, newsletter-cta, home-support)
    │
    ├── assets/images/
    │   ├── banners/                    # banner-01.png ~ banner-04.png (~2.3MB cada)
    │   ├── characters/                 # jack-balloon.png
    │   ├── episodes/                   # thumb-ep00.png
    │   ├── logos/                      # logo-pt.png, logo-en.png
    │   └── music/                      # lutas-de-ilusao.png
    │
    ├── components/
    │   ├── Puzzles/                    # 6 puzzles reutilizáveis (Stealth, Decoder, SlidingTiles, Labirinto, Anagrama, Força)
    │   ├── ResultCard/                 # Canvas share card com paletas por jogo
    │   ├── ModalSemFichas/             # Modal arcade "SEM FICHAS" com overlay
    │   ├── SearchModal/                # Modal de busca global
    │   ├── LoginGate/                  # Gate de login reutilizável
    │   ├── AchievementToast/           # Toast de achievement com partículas
    │   └── ...                         # 19 componentes + SearchModal
    ├── config/
    │   ├── site.js                     # SITE_NAME, SITE_NAME_PT, DOMAIN
    │   └── trial.js                    # TRIAL_ACTIVE — true libera conteúdo premium
    ├── context/
    │   ├── AuthContext.jsx             # Provider de autenticação (user, perfil, login, logout)
    │   ├── AchievementsContext.jsx     # Provider de achievements (desbloquear, toast, persistência)
    │   ├── FichasContext.jsx           # Provider de fichas (saldo, coleta diária, gastar, role-based)
    │   ├── LanguageContext.jsx          # Provider de i18n: locale, t(), changeLocale()
    │   └── ReaderContext.jsx           # Estado global readerMode — esconde Navbar e TrialBanner nos leitores
    ├── data/                           # 16 arquivos JSON + dados i18n
    ├── hooks/                          # 12 hooks customizados
    ├── i18n/
    │   ├── pt.json                     # Traduções PT
    │   ├── en.json                     # Traduções EN
    │   ├── es.json                     # Traduções ES
    │   └── locales.js                  # Import aggregator + LOCALE_LABELS
    ├── pages/
    │   ├── Arena/                       # LDI Arena Mode — combate CPU standalone
    │   │   ├── store/                   # useArenaStore.js (sheet, match, XP, Supabase)
    │   │   └── data/                    # arena-enemies.json (8 inimigos tier 1-4)
    │   ├── JackCandy/                   # Jack Dream Beer — idle noir investigativo
    │   │   ├── store/                   # useJackStore.js
    │   │   ├── data/                    # flags, cidades, npcs, itens, dungeons, monologues, casos, pistas
    │   │   ├── screens/                 # 13 screens
    │   │   └── components/             # 6 componentes
    │   ├── LDI/                         # Lendas do LDI — RPG narrativo
    │   │   ├── engine/                  # dice.js, combat.js, character.js, flags.js, scenes.js
    │   │   ├── store/                   # useGameStore.js, useCombatStore.js
    │   │   ├── data/                    # scenes/*.json, enemies/*.json, characterData, manualData, powersData
    │   │   └── components/              # Typewriter, SceneView, ChoiceList, CombatView, DiceRoll, etc.
    │   ├── MiniGames/                   # Arcade puzzles standalone
    │   ├── Perfil/                      # Hub com 5 abas (Conquistas, Arena, Coleção, Conta, Recompensas)
    │   │   └── abas/                    # Componentes de cada aba
    │   └── ...
```

---

## 2. PÁGINAS E ROTAS

| Rota | Componente | Arquivo | Status | Descrição |
|---|---|---|---|---|
| `/` | Home | `src/pages/Home.jsx` | ✅ | Landing page: HeroSlideshow, LatestEpisodes, CharactersRow, BookChaptersRow, MusicSection, NowLive, home-support CTA, StoryProgress, newsletter-cta, ShopSection |
| `/personagens` | Personagens | `src/pages/Personagens.jsx` | ✅ | Grid com todos os 9 personagens agrupados por categoria |
| `/personagens/:id` | PersonagemDetalhe | `src/pages/PersonagemDetalhe.jsx` | ✅ | Detalhe do personagem (2 colunas, nome, idade, status, ranking, arma, estilo, elemental, descrição, frase, relações) |
| `/livro` | Livro | `src/pages/Livro.jsx` | ✅ | 16 capítulos com controle de publicação, botão Continuar lendo |
| `/livro/:id` | LivroCapitulo | `src/pages/LivroCapitulo.jsx` | ✅ | Leitor com react-markdown, lazy loading, modo imersivo |
| `/assinar` | Assinar | `src/pages/Assinar.jsx` | ✅ v1.41 | 3 tiers: RANQUEADO (free), ELITE (R$10/mês), PRIMORDIAL (R$30/mês). Newsletter + PIX + ficha anchor line |
| `/autor` | Autor | `src/pages/Autor.jsx` | ✅ | História de Isaias Leal em 4 blocos, CTA para assinar |
| `/webtoon` | Webtoon | `src/pages/Webtoon.jsx` | ✅ | Grid de episódios publicados com thumbnails e badges de idioma |
| `/webtoon/:id` | WebtoonEpisodio | `src/pages/WebtoonEpisodio.jsx` | ✅ | Leitor vertical lazy load, fundo preto, max 800px, modo imersivo |
| `/musicas` | Musicas | `src/pages/Musicas.jsx` | ✅ | Faixas com capa + plataformas + placeholder videoclipes |
| `/mundo` | Mundo | `src/pages/Mundo.jsx` | ✅ | Lore completo: Bravara, LDI, Xakaxi, Timeline, Glossário, Personagens |
| `/games` | Games | `src/pages/Games/Games.jsx` | ✅ v1.0 | Hub arcade anos 90: 8 cards JOGOS (LDI, Jack, Top Trumps, MiniGames, Arena, Pesadelo, Duelo, Tamagoshi) + 2 CONTEÚDO (Quiz, Leaderboard) |
| `/games/toptrumps` | TopTrumps | `src/pages/TopTrumps.jsx` | ✅ | Top Trumps — jogo de cartas colecionáveis com deck personalizado, recompensa diária e menu redesign |
| `/games/toptrumps/lobby` | TopTrumpsLobby | `src/pages/TopTrumpsLobby.jsx` | ✅ | Lobby multiplayer com seleção de modo (free/apostado), matchmaking (sala privada/código/fila pública) |
| `/games/toptrumps/multiplayer` | TopTrumpsMP | `src/pages/TopTrumpsMP.jsx` | ✅ | Partida multiplayer em tempo real via Supabase Realtime — timer 30s, PPT, transferência de cartas |
| `/games/ldi` | LDILobby | `src/pages/LDI/Lobby.jsx` | ✅ | Lendas do LDI — lobby do RPG narrativo |
| `/games/ldi/create` | LDICreate | `src/pages/LDI/Create.jsx` | ✅ | NeoGuide guiado + Ficha Completa (vantagens, desvantagens, perícias) |
| `/games/ldi/game` | LDIGame | `src/pages/LDI/Game.jsx` | ✅ | Tela principal de jogo (cena narrativa + typewriter) |
| `/games/ldi/combat` | LDICombat | `src/pages/LDI/Combat.jsx` | ✅ | Tela de combate 3D&T com 3 modos + seleção de poderes |
| `/games/ldi/sheet` | LDISheet | `src/pages/LDI/Sheet.jsx` | ✅ | Ficha do personagem (consulta) |
| `/games/ldi/clues` | LDIClues | `src/pages/LDI/Clues.jsx` | ✅ | Caderno de pistas |
| `/games/ldi/end` | LDIEnd | `src/pages/LDI/End.jsx` | ✅ | Tela de fim de jogo |
| `/games/ldi/puzzle` | LDIPuzzle | `src/pages/LDI/PuzzlePage.jsx` | ✅ | Roteador de puzzles in-game |
| `/games/ldi/diagnostico` | Diagnostico | `src/pages/LDI/Diagnostico.jsx` | ✅ v1.0.4 | Tela de diagnóstico admin (cenas, flags, save) |
| `/games/ldi-arena` | ArenaRoute | `src/pages/Arena/ArenaRoute.jsx` | ✅ FINALIZADO v1.7.3 | LDI Arena Mode — criação de ficha + combate CPU standalone com progressão de inimigos — **PRONTO PARA LANÇAMENTO** |
| `/games/jackcandy` | JackCandy | `src/pages/JackCandy/JackCandy.jsx` | ✅ v5.1.1 | Jack Dream Beer — idle noir investigativo |
| `/games/minigames` | MiniGames | `src/pages/MiniGames/MiniGames.jsx` | ✅ v1.1.8 | 6 puzzles standalone arcade |
| `/games/pesadelo` | PP | `src/pages/PesadeloParticular/PP.jsx` | ✅ FINALIZADO v1.5.1 | Pesadelo Particular — 20 casos, Supabase save, puzzles reais, combate, i18n — **PRONTO PARA LANÇAMENTO** |
| `/games/duelo` | DueloRoute | `src/pages/Duelo/DueloRoute.jsx` | ✅ v1.1.0 | Duelo LDI — card game 1v1 vs IA. 60 cartas, IA greedy, menu, vitória/derrota |
| `/games/tamagoshi` | Tamagoshi | `src/pages/Tamagoshi/Tamagoshi.jsx` | ✅ v1.2.1 | Tamagoshi LDI — criatura virtual com personalidade, decaimento em tempo real, Supabase save |

**Versão atual:** `1.2.1` (console: `[TAMA] versão carregada: 1.2.1`)

### Estrutura de arquivos

```
src/pages/Tamagoshi/
├── Tamagoshi.jsx              # Container: fase routing, decay init, intervals
├── Tamagoshi.css              # ~450 linhas estilo dark neon
├── store/
│   └── useTamagoshiStore.js   # Zustand: métricas, decaimento offline, Supabase save
├── data/
│   ├── criaturas.js           # 30 criaturas, 6 personalidades, 5 raridades
│   ├── personalidades.js      # 6 tipos com textos de notificação por urgência (fallback)
│   │   └── falas-criatura.js  # 30 criaturas com 4+ falas únicas por ação
│   ├── passeios.js            # 6 locais de Marelia com bônus por personalidade
│   └── evolucoes.js           # 4 estágios (ovo→filhote→adulto→ancião) + variantes
├── screens/
│   ├── Ovo.jsx                # Ovo pulsante, clique para eclodir
│   ├── Selecao.jsx            # Escolha da criatura (varia por tier)
│   ├── Criatura.jsx           # Tela principal: métricas, sprite, balão, ações
│   ├── Passeio.jsx            # Seleção de local com bônus de personalidade
│   ├── Brincadeira.jsx        # 4 mini-interações com feedback
│   └── Luto.jsx               # Morte + cooldown de 24h + recomeço
└── components/
    ├── MetricBar.jsx          # Barra animada fome/higiene/energia/humor
    ├── CriaturaSprite.jsx     # Emoji com animação por status/estágio
    ├── BalloonFala.jsx        # Balão de fala com texto da personalidade
    └── CooldownTimer.jsx      # Contador regressivo pós-morte
```

### Decaimento das métricas (tempo real + offline)

| Métrica | Decaimento/h | Crítico em | Personalidade afeta |
|---------|-------------|------------|-------------------|
| Fome | -6 | ~16h | Independente: ×0.8 |
| Higiene | -3 | ~33h | Independente: ×0.8 |
| Energia | -4 | ~25h | Independente: ×0.8 |
| Humor | -2 | ~50h | Carente: ×1.2 / Fofo: mínimo 20 (se login ≤12h) |

- Status `critico` quando qualquer métrica ≤ 0
- Morte após 24h contínuas em crítico
- Cooldown de 24h pós-morte

### Supabase

**Tabela:** `tamagoshi_saves` (migration `006_tamagoshi.sql`)
- PK: `(user_id, slot)`
- Colunas: `criatura_id, personalidade, fase, estagio, fome, higiene, energia, humor, status, cooldown_ate, ...`
- RLS: `auth.uid() = user_id`

### Seleção por tier

| Tier | Opções |
|------|--------|
| Free | 1 criatura aleatória |
| Elite | 3 criaturas (uma por tipo) |
| Primordial | 10 criaturas |

---

## 11. NOTAS TÉCNICAS

### Stack
- **Vite 8** — Build tool. Zero config para JSX, CSS, assets.
- **React 19** — Última versão estável. JSX puro.
- **React Router 7** — Rotas client-side.
- **react-markdown** — Renderização do livro.
- **react-helmet-async** — Títulos dinâmicos por página.
- **Zero CSS-in-JS** — Todo estilo em arquivos `.css` separados.
- **Zero inline styles** — Nenhum `style={{}}` no JSX.

### i18n
- `LanguageContext` com `locale` persistido em `localStorage('ldi-locale')`.
- Função `t("chave.rota")` busca no JSON do locale atual.
- Personagens: hook `usePersonagens` carrega o JSON correto por `locale`.
- Livro: `livro-index.json` tem `titulo`, `titulo_en`, `titulo_es`.

### Assets
- **Regra:** todo asset em `src/assets/`. Nada na raiz ou `public/` além de favicon, og-image, 404.html e webtoon/.
- **Imports:** usar `import img from './caminho.png'` (Vite processa e hasheia).
- **Webtoon pages:** em `public/webtoon/` para URLs diretas no leitor.

### Livro
- Capítulos em markdown em `src/data/livro/{lang}/`.
- `import.meta.glob` para lazy loading.
- Controle de acesso via `publicado: true/false` em `livro-index.json`.

### Modo Imersivo (ReaderContext)
- `ReaderContext` provider em `main.jsx` (engloba toda a app).
- `readerMode` ativado em `WebtoonEpisodio` e `LivroCapitulo` via `useEffect` com cleanup.

### Camadas de z-index
```
z-index 2000 — SearchModal overlay
z-index 1000 — Navbar
z-index 998  — TrialBanner
z-index 200  — CookieBanner
z-index 150  — NotificationBalloon
z-index 100  — ScrollToTop
z-index 50   — MusicSection dropdown
z-index 10   — BookCard, CharacterCard hover (scale)
```

### Scroll Reveal
- Hook `useScrollReveal` com IntersectionObserver (threshold 0.15).
- Classes CSS: `.reveal` (fade + translateY), `.reveal-left` (translateX), `.reveal-delay-1/2/3`.

### Deploy (GitHub Pages)

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server local (Vite) |
| `npm run build` | Build de produção para `dist/` |
| `npm run preview` | Preview local do build |
| `npm run deploy` | Build + push do `dist/` para branch `gh-pages` |
| `git push` | Sincroniza código fonte na `main` |

- **Repositório:** https://github.com/lutasdeilusao-cpu/illusionfight-site
- **Site publicado:** https://lutasdeilusao-cpu.github.io/illusionfight-site/
- **Branch de deploy:** `gh-pages` (automática via `gh-pages` package)

### SPA no GitHub Pages (404 redirect)
1. **`public/404.html`** — Extrai o path original, remove o prefixo do repositório e redireciona para `/?/{path}`.
2. **`index.html`** (script no `<head>`) — Detecta query string começando com `/` e restaura a URL limpa via `history.replaceState`.

**Fluxo:** `/personagens` → 404 → `404.html` redireciona para `/?/personagens` → `index.html` restaura para `/personagens` → React Router renderiza.
