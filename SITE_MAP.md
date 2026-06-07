# ILLUSIONFIGHT.COM — SITE MAP

*Última atualização: 2026-06-07*  
*Versão: 2.64*  |  `[SITE] versão carregada: 2.64`

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
    │   ├── ScrollToTopOnNav/           # Scroll to top on navigation change
    │   ├── TypewriterPhrase/          # Typewriter animado
    │   ├── ShopSection/               # Loja de produtos físicos
    │   ├── PlatformIcons/             # Ícones de plataformas de música
    │   ├── SocialBar/                 # Barra de redes sociais
    │   ├── HeroEffect/                # Efeitos visuais do hero
    │   └── ...                         # 25 componentes + SearchModal + Puzzles + ResultCard + LoginGate + ModalSemFichas + AchievementToast
    ├── config/
    │   ├── site.js                     # SITE_NAME, SITE_NAME_PT, DOMAIN
    │   └── trial.js                    # TRIAL_ACTIVE — true libera conteúdo premium
    ├── context/
    │   ├── AuthContext.jsx             # Provider de autenticação (user, perfil, login, logout)
    │   ├── AchievementsContext.jsx     # Provider de achievements (desbloquear, toast, persistência)
    │   ├── FichasContext.jsx           # Provider de fichas (saldo, coleta diária, gastar, role-based)
    │   ├── LanguageContext.jsx          # Provider de i18n: locale, t(), changeLocale()
    │   └── ReaderContext.jsx           # Estado global readerMode — esconde Navbar e TrialBanner nos leitores
    ├── data/                           # 18 arquivos JSON (incl. quiz-pt, supertrunfo-pt, search-index, notificacoes, nowlive, episodios, planos, produtos, + i18n livro/)
    ├── hooks/                          # 12 hooks customizados (useFichaGate, useHeroEffect, usePersonagens, useScrollPosition, useScrollReveal, useSlideshow, useSwipe, useTopTrumpsDB, useTopTrumpsMP, useTypewriter, useViewportScroll, useZoom)
    ├── i18n/
    │   ├── pt.json                     # Traduções PT
    │   ├── en.json                     # Traduções EN
    │   ├── es.json                     # Traduções ES
    │   └── locales.js                  # Import aggregator + LOCALE_LABELS
    ├── pages/
    │   ├── Admin.jsx                    # Painel admin (isaiasgamedev@gmail.com) — gerencia submissions
    │   ├── Cadastro.jsx                 # Cadastro de conta (nome, email, telefone, senha)
    │   ├── Leaderboard.jsx              # Ranking global com 20 posições mockadas
    │   ├── Login.jsx                    # Login com email/senha via Supabase Auth
    │   ├── Quiz.jsx                     # Quiz SDR — 3 modos (ranqueado/elite/primordial), banco de perguntas
    │   ├── Arena/                       # LDI Arena Mode — combate CPU standalone
    │   │   ├── store/                   # useArenaStore.js (sheet, match, XP, Supabase)
    │   │   ├── data/                    # arena-enemies.json (8 inimigos tier 1-4)
    │   │   ├── screens/                 # Telas de combate
    │   │   └── components/             # Componentes auxiliares
    │   ├── ArenaTatics/                 # LDI TATICS — sistema tático por turnos EM REFATORAÇÃO
    │   │   ├── store/                   # useArenaTaticsStore.js (Zustand + Supabase save)
    │   │   ├── data/                    # roster.js (20 personagens), aiPersonalities.js (16 IAs), classes.js, combat.js, elementais.js, eventos.js, juice.js
    │   │   ├── screens/                 # Intro, TeamSelect, Batalha, PreBatalha, Vitoria, Derrota, SimulacaoAuto, ClasseSelect, Customizacao, TeamBuilder
    │   │   └── components/             # GridCanvas (isométrico Canvas 2D), ActionMenu, SkillModal, StatusBar, DanoPopup, TurnoIndicator, TiledMap
    │   ├── Duelo/                       # DUELO LDI — card game 1v1 vs IA
    │   │   ├── store/                   # useDueloStore.js
    │   │   ├── data/                    # Cartas, habilidades
    │   │   ├── engine/                  # ai.js (IA greedy)
    │   │   ├── screens/                 # Menu, Vitória, Derrota
    │   │   └── components/             # Board, Hand, StatusBar, BattleLog, TributeSelector, CardPreviewModal, TrapActivator
    │   ├── JackCandy/                   # Jack Dream Beer — idle noir investigativo
    │   │   ├── store/                   # useJackStore.js
    │   │   ├── data/                    # flags, cidades, npcs, itens, dungeons, monologues, casos, pistas
    │   │   ├── screens/                 # 13 screens
    │   │   └── components/             # 6 componentes
    │   ├── LDI/                         # LDI LENDAS — RPG narrativo
    │   │   ├── engine/                  # dice.js, combat.js, character.js, flags.js, scenes.js
    │   │   ├── store/                   # useGameStore.js, useCombatStore.js
    │   │   ├── data/                    # scenes/*.json, enemies/*.json, characterData, manualData, powersData
    │   │   └── components/              # Typewriter, SceneView, ChoiceList, CombatView, DiceRoll, etc.
    │   ├── MiniGames/                   # Arcade puzzles standalone
    │   ├── Perfil/                      # Hub com 6 abas (Conquistas, Arena, Coleção, Conta, Recompensas, Tamagoshi)
    │   │   └── abas/                    # PerfilConquistas, PerfilArena, PerfilColecao, PerfilConta, Recompensas, PerfilTamagoshi
    │   ├── Tamagoshi/                   # TAMA LDI — tamagotchi com ciclo de vida completo
    │   └── ...
```

---

## 2. PÁGINAS E ROTAS

| Rota | Componente | Arquivo | Status | Tradução | Descrição |
|---|---|---|---|---|---|
| `/` | Home | `src/pages/Home.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Landing page: HeroSlideshow, LatestEpisodes, CharactersRow, BookChaptersRow, MusicSection, NowLive, home-support CTA, StoryProgress, newsletter-cta, ShopSection |
| `/personagens` | Personagens | `src/pages/Personagens.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Grid com todos os 9 personagens agrupados por categoria |
| `/personagens/:id` | PersonagemDetalhe | `src/pages/PersonagemDetalhe.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Detalhe do personagem (2 colunas, nome, idade, status, ranking, arma, estilo, elemental, descrição, frase, relações) |
| `/livro` | Livro | `src/pages/Livro.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | 16 capítulos com controle de publicação, botão Continuar lendo |
| `/livro/:id` | LivroCapitulo | `src/pages/LivroCapitulo.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Leitor com react-markdown, lazy loading, modo imersivo |
| `/assinar` | Assinar | `src/pages/Assinar.jsx` | ✅ v1.41 | ✅ PT ✅ EN ✅ ES | 3 tiers: RANQUEADO (free), ELITE (R$10/mês), PRIMORDIAL (R$30/mês). Newsletter + PIX + ficha anchor line |
| `/autor` | Autor | `src/pages/Autor.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | História de Isaias Leal em 4 blocos, CTA para assinar |
| `/webtoon` | Webtoon | `src/pages/Webtoon.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Grid de episódios publicados com thumbnails e badges de idioma |
| `/webtoon/:id` | WebtoonEpisodio | `src/pages/WebtoonEpisodio.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Leitor vertical lazy load, fundo preto, max 800px, modo imersivo |
| `/musicas` | Musicas | `src/pages/Musicas.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Faixas com capa + plataformas + placeholder videoclipes |
| `/mundo` | Mundo | `src/pages/Mundo.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Lore completo: Bravara, LDI, Xakaxi, Timeline, Glossário, Personagens |
| `/games/toptrumps` | TopTrumps | `src/pages/TopTrumps.jsx` | ✅ v2.63 | ✅ PT ✅ EN ✅ ES | LDI TRUMPS — jogo de cartas colecionáveis com deck personalizado, recompensa diária e menu redesign — **1ª temporada** |
| `/games/toptrumps/lobby` | TopTrumpsLobby | `src/pages/TopTrumpsLobby.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Lobby multiplayer com seleção de modo (free/apostado), matchmaking (sala privada/código/fila pública) |
| `/games/toptrumps/multiplayer` | TopTrumpsMP | `src/pages/TopTrumpsMP.jsx` | ✅ | ⏳ PT ⏳ EN ⏳ ES | Partida multiplayer em tempo real via Supabase Realtime — timer 30s, PPT, transferência de cartas |
| `/games/ldi` | LDILobby | `src/pages/LDI/Lobby.jsx` | ✅ | ⏳ PT ⏳ EN ⏳ ES | LDI LENDAS — lobby do RPG narrativo — **core gameplay perfeito (1ª temporada), textos pendentes de revisão** |
| `/games/ldi/create` | LDICreate | `src/pages/LDI/Create.jsx` | ✅ | ⏳ PT ⏳ EN ⏳ ES | NeoGuide guiado + Ficha Completa (vantagens, desvantagens, perícias) |
| `/games/ldi/game` | LDIGame | `src/pages/LDI/Game.jsx` | ✅ | ⏳ PT ⏳ EN ⏳ ES | Tela principal de jogo (cena narrativa + typewriter) |
| `/games/ldi/combat` | LDICombat | `src/pages/LDI/Combat.jsx` | ✅ | ⏳ PT ⏳ EN ⏳ ES | Tela de combate 3D&T com 3 modos + seleção de poderes |
| `/games/ldi/sheet` | LDISheet | `src/pages/LDI/Sheet.jsx` | ✅ | ⏳ PT ⏳ EN ⏳ ES | Ficha do personagem (consulta) |
| `/games/ldi/clues` | LDIClues | `src/pages/LDI/Clues.jsx` | ✅ | ⏳ PT ⏳ EN ⏳ ES | Caderno de pistas |
| `/games/ldi/end` | LDIEnd | `src/pages/LDI/End.jsx` | ✅ | ⏳ PT ⏳ EN ⏳ ES | Tela de fim de jogo |
| `/games/ldi/puzzle` | LDIPuzzle | `src/pages/LDI/PuzzlePage.jsx` | ✅ | ⏳ PT ⏳ EN ⏳ ES | Roteador de puzzles in-game |
| `/games/ldi/diagnostico` | Diagnostico | `src/pages/LDI/Diagnostico.jsx` | ✅ v1.0.4 | ⏳ PT ⏳ EN ⏳ ES | Tela de diagnóstico admin (cenas, flags, save) |
| `/games/ldi-arena` | ArenaRoute | `src/pages/Arena/ArenaRoute.jsx` | ✅ FINALIZADO v1.7.3 | ⏳ PT ⏳ EN ⏳ ES | LDI ARENA — criação de ficha + combate CPU standalone com progressão de inimigos — **1ª temporada** |
| `/games/ldi-tatics` | ArenaTaticsRoute | `src/pages/ArenaTatics/ArenaTaticsRoute.jsx` | ✅ v6.3.0 | ⏳ PT ⏳ EN ⏳ ES | LDI TATICS — sistema tático por turnos com visão **isométrica (Canvas 2D)**: grid 16×16 (TILE 80×40), câmera suave com lerp + drag-to-pan, minimapa top-down (120px), hover glow em tiles de alcance, path glow na animação de movimento (aliados e inimigos), diamond hit test nos cliques, free look mode (🔍) para navegar o mapa. 20 personagens jogáveis, 3v3, sistema de equipamentos, desbloqueio de slots, 16 personalidades de IA, simulação automática, juice visual (screen shake, flash, dano popup). **Cidade de Marélia expandida — 8 distritos (Central, Residencial, Comercial, Industrial, Porto, Mercado, Yohualticit, Subúrbio), 13 interiores únicos, 10 NPCs com diálogo, sistema de clima (dia/noite/chuva), partículas (folhas/chuva), useCityStore (Zustand), relógio dinâmico.** |
| `/games/jackcandy` | JackCandy | `src/pages/JackCandy/JackCandy.jsx` | ✅ v5.1.2 | ⏳ PT ⏳ EN ⏳ ES | Jack Dream Beer — idle noir investigativo — **1ª temporada** (testado até Aruane, core loop ok) |
| `/games/minigames` | MiniGames | `src/pages/MiniGames/MiniGames.jsx` | ✅ v1.2.1 | ✅ PT ✅ EN ✅ ES | MINI GAMES — 6 puzzles standalone arcade + Enduro Kroniki (LANÇADO ⛔) |
| `/games/pesadelo` | PP | `src/pages/PesadeloParticular/PP.jsx` | ✅ i18n v1.5.29 | ⏳ PT ⏳ EN ⏳ ES | PRESADELO PARTICULAR — 20 casos, Supabase save, puzzles reais, combate — **1ª temporada** |
| `/games/duelo` | DueloRoute | `src/pages/Duelo/DueloRoute.jsx` | ✅ v1.2.8 | ✅ PT ✅ EN ✅ ES | DUELO LDI — card game 1v1 vs IA. 60 cartas, IA greedy, menu, vitória/derrota — **1ª temporada** |
| `/games/tamagoshi` | Tamagoshi | `src/pages/Tamagoshi/Tamagoshi.jsx` | ✅ v1.10.3 | ⏳ PT ⏳ EN ⏳ ES | TAMA LDI — ciclo de vida completo, DIX economy, loja, 3 minigames, Hall da Fama — **1ª temporada** |

**Versão atual:** `1.10.3` (console: `[TAMA] versão carregada: 1.10.3`)
| `/leaderboard` | Leaderboard | `src/pages/Leaderboard.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Ranking global com 20 posições, vitórias/derrotas/pontos |
| `/quiz` | Quiz | `src/pages/Quiz.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Quiz SDR — 3 modos (ranqueado 10q/elite 20q/primordial 30q), banco de perguntas, dicas de personagem |
| `/login` | Login | `src/pages/Login.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Login com email/senha via Supabase Auth, redireciona para /perfil |
| `/cadastro` | Cadastro | `src/pages/Cadastro.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Cadastro com nome, email, telefone, senha — migra achievements locais |
| `/perfil` | Perfil | `src/pages/Perfil/Perfil.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Hub do perfil com 6 abas (Conquistas, Arena, Coleção, Conta, Recompensas, Tamagoshi), exibe tier |
| `/admin` | Admin | `src/pages/Admin.jsx` | ✅ | ✅ PT ✅ EN ✅ ES | Painel admin exclusivo (isaiasgamedev@gmail.com) — gerencia submissions pendentes do ResultCard |

### Estrutura de arquivos

```
src/pages/Tamagoshi/
├── Tamagoshi.jsx              # Container: fase routing, subFase (alimentar/banhar/passear/loja), lifecycle init
├── Tamagoshi.css              # ~580 linhas estilo dark neon
├── store/
│   └── useTamagoshiStore.js   # Zustand: métricas, decaimento, DIX wallet, inventário, lifecycle, troca, Supabase
├── data/
│   ├── criaturas.js           # 30 criaturas, 6 personalidades, 5 raridades
│   ├── personalidades.js      # 6 tipos com textos de notificação por urgência (fallback)
│   │   └── falas-criatura.js  # 30 criaturas com 4+ falas únicas por ação
│   ├── passeios.js            # 6 locais de Marelia com bônus por personalidade
│   ├── evolucoes.js           # 4 estágios (ovo→filhote→adulto→ancião) + variantes
│   ├── moedas.js              # DIX constants, fases lifecycle, badges map, textos partida
│   └── itens_loja.js          # 7 itens (comida/sabonete/shampoo/guia/pente/guloseima/apito) + COMIDA_TEMATICA
├── screens/
│   ├── Ovo.jsx                # Ovo pulsante, clique para eclodir
│   ├── Selecao.jsx            # Escolha da criatura (varia por tier)
│   ├── Criatura.jsx           # Tela principal: métricas, sprite, balão, ações, DIX display, admin
│   ├── Passeio.jsx            # Seleção de local com bônus de personalidade
│   ├── Brincadeira.jsx        # 4 mini-interações com feedback
│   ├── Alimentar.jsx          # Minigame: clicar item 4x para encher barra, consome inventário
│   ├── Banhar.jsx             # Minigame: arrastar mouse/touch up-down, bolhas, consome sabonete
│   ├── Passear.jsx            # Minigame: grid 8x4 com obstáculos, setas/swipe até bandeira
│   ├── Loja.jsx               # Loja de itens com DIX, inventário por criatura
│   ├── Partida.jsx            # Animação de despedida + salão da fama + nova adoção
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

**Tabelas:** (migrations `006_tamagoshi.sql` + `009_tamagoshi_v2.sql`)

| Tabela | PK | Descrição |
|--------|----|-----------|
| `tamagoshi_saves` | `(user_id, slot)` | Save state: métricas, fase, inventario (JSONB), flags (JSONB), status, cooldown |
| `tamagoshi_trocas` | `key` (UUID8) | Pedidos de troca entre jogadores, status pendente/confirmado/24h expira |
| `dix_wallet` | `user_id` | Saldo de DIX por jogador |
| `dix_historico` | auto-increment | Log de transações DIX (valor, motivo, timestamp) |
| `tamagoshi_badges` | auto-increment | Badges conquistadas por fase (user_id, criatura_id, badge_id) |
| `tamagoshi_fama` | auto-increment | Criaturas que completaram o ciclo (user_id, criatura_id, nome_custom, badges[]) |

- RLS: `auth.uid() = user_id` em todas

### Ciclo de Vida (v1.3.0)

| Fase | Duração | Badge | Transição |
|------|---------|-------|-----------|
| Ovo | 0–3 dias | — | Eclode em filhote |
| Filhote | 4–60 dias | 🐣 `filhote` | — |
| Jovem | 61–120 dias | 🌱 `jovem` | — |
| Adulto | 121–180 dias | 🌳 `adulto` | — |
| Veterano | 181–270 dias | ⚔️ `veterano` | — |
| Ancião | 271–365 dias | 👑 `anciao` | — |
| Partida | >365 dias | ✨ `partida` | Escreve em `tamagoshi_fama`, zera save |

### DIX Economy

- **Ganhos:** +10 DIX por ação (alimentar/banhar/passear/brincar), +25 DIX login diário, +5 bônus se passear no local temático
- **Gastos:** itens na loja (5–30 DIX)
- **Saldo:** tabela `dix_wallet`, histórico em `dix_historico`
- **Inventário:** coluna JSONB `inventario` em `tamagoshi_saves`, persistido por criatura

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
- `import.meta.glob('../data/livro/**/*.md')` para lazy loading multi-idioma.
- Controle de acesso via `publicado: true/false` em `livro-index.json`.
- **PT**: 16 capítulos (1-16) | **EN**: 3 capítulos (1-3) | **ES**: 3 capítulos (1-3)

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
