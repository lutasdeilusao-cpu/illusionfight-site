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
| `/games/tamagoshi` | Tamagoshi | `src/pages/Tamagoshi/Tamagoshi.jsx` | ✅ v1.1.0 | Tamagoshi LDI — criatura virtual com personalidade, decaimento em tempo real, Supabase save |
| `/leaderboard` | Leaderboard | `src/pages/Leaderboard.jsx` | ✅ | Ranking global com pódio, tabela e posição do usuário |
| `/quiz` | Quiz | `src/pages/Quiz.jsx` | ✅ | Quiz SDR interativo com 3 modos, timer, ajudas e rank |
| `/login` | Login | `src/pages/Login.jsx` | ✅ | Login com email/senha via Supabase |
| `/cadastro` | Cadastro | `src/pages/Cadastro.jsx` | ✅ | Cadastro com nome, email, telefone, senha |
| `/perfil` | Perfil | `src/pages/Perfil/Perfil.jsx` | ✅ | Hub com 5 abas navegáveis: Conquistas, Arena, Coleção, Conta, Recompensas |
| `/admin` | Admin | `src/pages/Admin.jsx` | ✅ | Painel de auditoria de compartilhamentos — acesso restrito ao admin |

---

## 3. COMPONENTES

| Componente | Arquivo JSX | Arquivo CSS | Usado em | Descrição |
|---|---|---|---|---|
| TrialBanner | `TrialBanner.jsx` | `TrialBanner.css` | App (global) | Faixa âmbar fixa abaixo da navbar (TRIAL_MODE) |
| Navbar | `Navbar.jsx` | `Navbar.css` | App (global) | Logo LDI, 7 links (Webtoon, Livro, Músicas, Games, Mundo, AUTOR, APOIAR âmbar), lang switcher, drawer mobile, avatar+saída ou ENTRAR |
| HeroSlideshow | `HeroSlideshow.jsx` | `HeroSlideshow.css` | Home | 4 imagens com crossfade 1.2s, Ken Burns (1.0→1.08), overlays, scanlines, HeroEffect canvas |
| HeroEffect | `HeroEffect.jsx` | `HeroEffect.css` | HeroSlideshow | Canvas com 40-60 linhas teal/âmbar caindo |
| TypewriterPhrase | `TypewriterPhrase.jsx` | `TypewriterPhrase.css` | HeroSlideshow | Frase com efeito de digitação em loop (~28s) |
| LatestEpisodes | `LatestEpisodes.jsx` | `LatestEpisodes.css` | Home | Grid 3 episódios com thumbnail real + overlay hover |
| CharactersRow | `CharactersRow.jsx` | `CharactersRow.css` | Home | Scroll horizontal (Kim, Jack, Nina) com fade gradient |
| CharacterCard | `CharacterCard.jsx` | `CharacterCard.css` | CharactersRow, Personagens | Card 200×300, hover scale(1.12), overlay com bio e CTA |
| BookChaptersRow | `BookChaptersRow.jsx` | `BookChaptersRow.css` | Home | Scroll horizontal com cards de capítulos publicados |
| AchievementToast | `AchievementToast/AchievementToast.jsx` | `AchievementToast/AchievementToast.css` | App (global) | Toast centralizado com partículas, overlay escuro e foto do Jack |
| LoginGate | `LoginGate/LoginGate.jsx` | `LoginGate/LoginGate.css` | TopTrumps, Arena, Quiz | Bloco de aviso que exige login — recebe prop feature (nome) e children (conteúdo logado) |
| Games | `Games.jsx` | `Games.css` | /games | Hub arcade anos 90: 8 JOGOS + 2 CONTEÚDO, scanlines, glitch, INSERIR FICHA pulsante |
| MusicSection | `MusicSection.jsx` | `MusicSection.css` | Home | 5 círculos (140px), hover abre dropdown com 6 plataformas |
| StoryProgress | `StoryProgress.jsx` | `StoryProgress.css` | Home | Timeline horizontal "ONDE ESTAMOS" com tracks e bullets animados |
| NowLive | `NowLive.jsx` | `NowLive.css` | Home | 4 cards Netflix-style com gradiente da plataforma |
| ShopSection | `ShopSection.jsx` | `ShopSection.css` | Home | Carrossel infinito drag/swipe com 10 produtos placeholder |
| SocialBar | `SocialBar.jsx` | `SocialBar.css` | Navbar, Footer | Ícones X, Instagram, TikTok, YouTube |
| Footer | `Footer.jsx` | `Footer.css` | App (global) | 3 colunas com links internos e externos, SocialBar, copyright |
| ScrollToTop | `ScrollToTop.jsx` | `ScrollToTop.css` | App (global) | Botão fixo canto inferior direito, aparece após 400px de scroll |
| ScrollToTopOnNav | `ScrollToTopOnNav.jsx` | — | App (global) | Escuta mudanças de rota e faz scrollTo(0,0) |
| NotificationBalloon | `NotificationBalloon.jsx` | `NotificationBalloon.css` | App (global) | Balão com foto do Jack, 10 mensagens aleatórias, 3min/10min/8s |
| CookieBanner | `CookieBanner.jsx` | `CookieBanner.css` | App (global) | Banner LGPD/GDPR, persiste aceitação em localStorage |
| SearchModal | `SearchModal/SearchModal.jsx` | `SearchModal/SearchModal.css` | App (global) | Modal de busca global, Ctrl+K, resultados agrupados |
| PlatformIcons | `PlatformIcons.jsx` | — | MusicSection, NowLive | SVGs inline das plataformas |
| PuzzleStealthGrid | `Puzzles/PuzzleStealthGrid.jsx` | `Puzzles/Puzzles.css` | MiniGames, LDI | Grid stealth com câmeras dinâmicas, BFS, pegadas, zoom, swipe |
| PuzzleDecoder | `Puzzles/PuzzleDecoder.jsx` | `Puzzles/Puzzles.css` | MiniGames, LDI | Decodificador de frequência com Waveform SVG e heartbeat |
| PuzzleSlidingTiles | `Puzzles/PuzzleSlidingTiles.jsx` | `Puzzles/Puzzles.css` | MiniGames, LDI | Puzzle 3×3 / 4×4 com embaralhamento |
| PuzzleLabirinto | `Puzzles/PuzzleLabirinto.jsx` | `Puzzles/Puzzles.css` | MiniGames, Jack | Labirinto com recursive backtracking e BFS dicas |
| PuzzleAnagrama | `Puzzles/PuzzleAnagrama.jsx` | `Puzzles/Puzzles.css` | MiniGames, Jack | Anagrama multi-palavra/frase com 5 dificuldades |
| PuzzleForça | `Puzzles/PuzzleForça.jsx` | `Puzzles/Puzzles.css` | MiniGames | Palavra Secreta/Forca com filtro de possíveis e hangman |
| ResultCard | `ResultCard/ResultCard.jsx` | `ResultCard/ResultCard.css` | MiniGames | Canvas share card com paletas por jogo |
| ModalSemFichas | `ModalSemFichas/ModalSemFichas.jsx` | `ModalSemFichas/ModalSemFichas.css` | Games, Perfil | Modal arcade "SEM FICHAS" com opções de recarga |

---

## 4. HOOKS

| Hook | Arquivo | Usado em | O que faz |
|---|---|---|---|
| `useSlideshow` | `useSlideshow.js` | HeroSlideshow | Auto-advance 6s + crossfade 1.2s |
| `useHeroEffect` | `useHeroEffect.js` | HeroEffect | Canvas com 40-60 linhas verticais caindo |
| `useTypewriter` | `useTypewriter.js` | TypewriterPhrase | Digita/apaga em loop (~28s ciclo) |
| `useScrollPosition` | `useScrollPosition.js` | Navbar | Detecta scroll > 20px para background |
| `usePersonagens` | `usePersonagens.js` | CharactersRow, Personagens, PersonagemDetalhe | Carrega JSON + agrupa por categoria |
| `useScrollReveal` | `useScrollReveal.js` | Vários componentes Home | IntersectionObserver, classe `revealed` na viewport |
| `useTopTrumpsDB` | `useTopTrumpsDB.js` | TopTrumps | Funções Supabase: deck, partidas, stats, migração |
| `useTopTrumpsMP` | `useTopTrumpsMP.js` | TopTrumpsLobby, TopTrumpsMP | Multiplayer: salas, matchmaking, jogadas, heartbeat |
| `useSwipe` | `useSwipe.js` | PuzzleStealthGrid, ShopSection | Touch swipe reutilizável |
| `useZoom` | `useZoom.js` | PuzzleStealthGrid | Zoom + controlsVisible auto-hide |
| `useViewportScroll` | `useViewportScroll.js` | PuzzleStealthGrid | Offset {x,y} para centralizar player |
| `useFichaGate` | `useFichaGate.js` | Games, Perfil | Gate de fichas para jogos — check + modal |

---

## 5. DADOS (JSON)

| Arquivo | Localização | Idiomas | Conteúdo | Usado em |
|---|---|---|---|---|
| `site.js` | `src/config/` | — | SITE_CONFIG | TrialBanner, Navbar |
| `pt.json` | `src/i18n/` | PT | Nav, hero, episódios, música, progress, trial, footer, assinar, newsletter, etc. | Todos os componentes |
| `en.json` | `src/i18n/` | EN | Mesma estrutura | Todos os componentes |
| `es.json` | `src/i18n/` | ES | Mesma estrutura | Todos os componentes |
| `personagens-pt.json` | `src/data/` | PT | 9 personagens com dados completos | usePersonagens |
| `personagens-en.json` | `src/data/` | EN | 9 personagens | usePersonagens |
| `personagens-es.json` | `src/data/` | ES | 9 personagens | usePersonagens |
| `livro-index.json` | `src/data/` | PT/EN/ES | 16 capítulos + controle de publicação | Livro, BookChaptersRow |
| `capitulo-01.md` ~ `16.md` | `src/data/livro/pt/` | PT | Conteúdo integral dos capítulos | LivroCapitulo (lazy load) |
| `musicas.json` | `src/data/` | — | 5 faixas com plataformas | MusicSection |
| `planos.json` | `src/data/` | PT/EN/ES | 3 tiers: Ranqueado, Elite, Primordial | Assinar |
| `episodios.json` | `src/data/` | PT/EN/ES | Ep. 00 com 21 páginas, thumbnail | Webtoon, LatestEpisodes |
| `nowlive.json` | `src/data/` | — | 4 cards de redes sociais | NowLive |
| `produtos.json` | `src/data/` | PT/EN/ES | 10 produtos placeholder | ShopSection |
| `notificacoes.json` | `src/data/` | PT | 10 mensagens na voz do Jack | NotificationBalloon |
| `mundo-pt.json` | `src/data/` | PT | Localizações, Timeline, Tecnologias, Glossário, Ranking | Mundo |
| `mundo-en.json` | `src/data/` | EN | Mesma estrutura | Mundo |
| `mundo-es.json` | `src/data/` | ES | Mesma estrutura | Mundo |
| `quiz-pt.json` | `src/data/` | PT | 85 perguntas com categorias e dicas | Quiz |
| `supertrunfo-pt.json` | `src/data/` | PT | 76 cartas com 8 atributos em 5 tiers | TopTrumps |
| `achievements-pt.json` | `src/data/` | PT | 14 achievements (8 base + 5 Top Trumps + 1 divulgador) | AchievementsContext, Perfil |
| `search-index.js` | `src/data/` | PT | Índice flat para busca global | SearchModal |
| `001_toptrumps.sql` | `supabase/migrations/` | — | Schema toptrumps_decks, partidas, stats | Supabase |
| `002_toptrumps_mp.sql` | `supabase/migrations/` | — | Schema toptrumps_salas, movimentos, mp_stats | Supabase |
| `003_lendas_ldi.sql` | `supabase/migrations/` | — | Schema character_sheets, game_saves | Supabase |
| `004_jack_v3.sql` | `supabase/migrations/` | — | Schema jack_saves com slot_num e investigação | Supabase |

---

## 6. ASSETS

| Tipo | Pasta | Arquivos | Status |
|---|---|---|---|
| Banners | `src/assets/images/banners/` | `banner-01.png` ~ `banner-04.png` | ✅ Final (~2.3MB cada) |
| Logos | `src/assets/images/logos/` | `logo-pt.png`, `logo-en.png` | ✅ Final |
| Characters | `src/assets/images/characters/` | `jack-balloon.png` | ✅ Final |
| Episodes | `src/assets/images/episodes/` | `thumb-ep00.png` | ✅ Final |
| Music | `src/assets/images/music/` | `lutas-de-ilusao.png` | ✅ Final |
| Webtoon | `public/webtoon/` | `00/pt/01~21.png` | ✅ Episódio 00 PT |
| OG Image | `public/` | `og-image.jpg` | ✅ Final |
| Favicon | `public/` | `favicon.svg` | ✅ Final |
| Fonts | — | Google Fonts (Rajdhani, IBM Plex Sans, JetBrains Mono) | ✅ Via Google Fonts |

---

## 7. CONFIGURAÇÃO

| Arquivo | Localização | O que configura |
|---|---|---|
| `vite.config.js` | Raiz | `base: '/illusionfight-site/'`, plugin React |
| `package.json` | Raiz | Dependências, scripts dev/build/preview/predeploy/deploy |
| `site.js` | `src/config/` | SITE_NAME, SITE_NAME_PT, DOMAIN |
| `trial.js` | `src/config/` | TRIAL_ACTIVE — true libera todo conteúdo, false ativa paywall |
| `supabase.js` | `src/lib/` | Cliente Supabase com URL e anon key |
| `AuthContext.jsx` | `src/context/` | Provider global de autenticação (user, perfil, login, logout) |
| `AchievementsContext.jsx` | `src/context/` | Provider global de achievements (desbloquear, toast, persistência) |
| `FichasContext.jsx` | `src/context/` | Provider global de fichas (saldo, coleta diária, gastar, role-based) |
| `LanguageContext.jsx` | `src/context/` | Provider de i18n: locale, t(), changeLocale() |
| `ReaderContext.jsx` | `src/context/` | readerMode — esconde Navbar e TrialBanner nos leitores |
| `locales.js` | `src/i18n/` | Importa JSONs + LOCALE_LABELS |
| `main.jsx` | Raiz | AuthProvider > ReaderProvider > HelmetProvider > BrowserRouter > FichasProvider > LanguageProvider > App |
| `App.jsx` | Raiz | Layout global: Navbar (z1000), TrialBanner (z998), Routes, Footer, ScrollToTop, NotificationBalloon, CookieBanner |
| `index.html` | Raiz | SEO meta tags, OG tags, Twitter Card, Google Analytics, SPA redirect script |
| `public/404.html` | `public/` | Redirect SPA — captura 404 do GitHub Pages e redireciona com query param |

---

## 8. FEATURES IMPLEMENTADAS

### Navegação & Layout
- ✅ **Navbar global** — Logo LDI, 7 links (Webtoon, Livro, Músicas, Games, Mundo, AUTOR, APOIAR âmbar), lang switcher (PT/ES/EN), drawer mobile, SocialBar, avatar+saída ou ENTRAR
- ✅ **Navbar acima do TrialBanner** — z-index 1000 (topo), TrialBanner z-index 998 (abaixo)
- ✅ **Footer** — 3 colunas com links dinâmicos, Newsletter (Substack), SocialBar, copyright
- ✅ **Trial Banner** — Faixa âmbar fixa controlada por TRIAL_MODE, fundo sólido ao scrollar
- ✅ **ScrollToTop** — Botão fixo canto inferior direito, aparece após 400px
- ✅ **Cookie Banner** — LGPD/GDPR, barra fixa no rodapé, persistência localStorage
- ✅ **Save point Livro / Webtoon** — localStorage restaura scroll ao voltar
- ✅ **Navegação flutuante** — Botões fixos ← anterior / próximo → no leitor
- ✅ **Modo imersivo** — Navbar e TrialBanner ocultos em WebtoonEpisodio e LivroCapitulo via ReaderContext
- ✅ **Busca global** — Modal overlay (z2000), Ctrl+K/Cmd+K, indexa personagens/livro/webtoon/músicas/lore
- ✅ **Trial system** — src/config/trial.js, badge sempre visível
- ✅ **sitemap.xml** — 8 rotas públicas + link rel no index.html

### Home
- ✅ **Hero Slideshow** — 4 imagens crossfade 1.2s, Ken Burns, scanlines, HeroEffect, Typewriter
- ✅ **Latest Episodes** — Grid 3 cards, Ep. 00 thumbnail real + overlay hover
- ✅ **BookChaptersRow** — Scroll horizontal com cards 200×300
- ✅ **CharactersRow** — Scroll horizontal com Kim, Jack, Nina
- ✅ **Música / No Ar Agora / Progresso / Shop** — Todas seções implementadas
- ✅ **Newsletter CTA** — Link para Substack
- ✅ **Scroll Reveal** — Animações fade+translateY via IntersectionObserver

### Quiz SDR
- ✅ **3 modos de jogo** — RANQUEADO (10 perguntas), ELITE (20), PRIMORDIAL (30)
- ✅ **Timer 30s** — Barra visual, vermelha <10s, timeout = erro
- ✅ **Ajudas** — Pular (2/sessão), Gangue (1/sessão)
- ✅ **Rank final** — Score + bônus de velocidade
- ✅ **85 perguntas PT** — 4 categorias, dicas kim/jack/nina
- ✅ **Animações** — Flash verde acerto, shake vermelho erro, contagem regressiva do rank

### Games Hub

- ✅ **Página /games** — 8 cards JOGOS + 2 CONTEÚDO, scanlines, glitch "GAMES", INSERIR FICHA pulsante
- ✅ **Ficha gate** — Controle de acesso por fichas para LDI, Jack e Top Trumps

### Top Trumps LDI — v1.0.9
- ✅ **Jogo vs IA** — 76 cartas, 8 atributos, 5 tiers
- ✅ **Deck personalizado** — localStorage + Supabase, 5-10 cartas iniciais
- ✅ **Recompensa diária** — Até 3 tentativas/dia, ganhe 1 carta por vitória
- ✅ **Álbum no perfil** — Grid 76 cartas, obtidas/faltantes, badges de tier
- ✅ **Menu redesign** — 2 colunas, cartas CSS, barra de coleção
- ✅ **5 new achievements** — Primeira Vitória, Aprendiz, Veterano (10), Centurião (100), Lenda (1000)
- ✅ **Multiplayer Realtime** — Matchmaking, PPT, timer 30s, transferência de cartas, heartbeat + watchdog
- ✅ **12+ bugfixes** — Race conditions, sala fantasma, alternância de turno, modo apostado, IA fallback
- ✅ **Ranked só para assinantes** — Elite+ para multiplayer ranqueado, modo apostado com badge ELITE+
- **Versão:** `[MP] versão carregada: 1.0.9`

### Leaderboard
- ✅ Pódio visual (top 3), tabela (4-20), abas de filtro, seção "Sua posição"

### Achievement Mensal de Compartilhamento
- ✅ Tabela share_submissions, seção no perfil, painel /admin, achievement divulgador

### Autenticação + Achievements + Fichas
- ✅ **AuthContext** — Sessão Supabase, listener onAuthStateChange, migração localStorage→Supabase
- ✅ **AchievementsContext** — 14 achievements, toast centralizado, partículas
- ✅ **FichasContext** — Saldo, coleta diária, gastar, role-based (free=3, elite=10, admin=999)
- ✅ **Páginas** — /login, /cadastro, /perfil (5 abas)
- ✅ **Navbar adaptativa** — ENTRAR quando anônimo, avatar+nome+sair quando logado
- ✅ **Cartas id_num** — Sequencial (1-76) para persistência int4 no Supabase

### Personagens / Livro / Webtoon / Assinatura / Autor / Notificações
- ✅ Todas implementadas e em produção

### SEO & Analytics
- ✅ Meta tags, Open Graph, Twitter Card, GA, SPA 404 fallback

### Deploy / Estilo
- ✅ GitHub Pages + Vite, basename, scrollbar customizada, scroll horizontal sem scrollbar

---

## 9. FEATURES PENDENTES

- ❌ **Músicas — player dedicado** — Letras e contexto narrativo por faixa
- ❌ **Personagens: imagens reais** — Substituir placeholders por artwork final
- ❌ **Páginas EN/ES completas** — Capítulos do livro traduzidos
- ❌ **Logo ES** — Apenas PT e EN têm logo em imagem
- ❌ **Modo light** — Dark mode fixo, sem toggle
- ❌ **Domínio customizado** — www.illusionfight.com
- ❌ **Integração Stripe** — Links reais de pagamento
- ❌ **Quiz EN/ES** — Banco de perguntas traduzido
- ❌ **Quiz — silhuetas dos personagens** — Avatares visuais nas ajudas
- ❌ **Quiz — leaderboard** — Ranking global de pontuações
- ❌ **Top Trumps EN/ES** — Tradução das cartas
- ❌ **Top Trumps — imagens reais** — Artwork final dos personagens
- ❌ **Achievement divulgador — automação** — Verificação via API do X/YouTube
- ❌ **Achievements EN/ES** — Tradução
- ❌ **Leaderboard de achievements** — Comparação entre usuários
- ❌ **Perfil com avatar customizável** — Upload de foto, capa, bio
- ❌ **PuzzleForça no MiniGames** — Componente existe, falta integrar no grid

---

---

## 10. LENDAS DO LDI — RPG Narrativo

**Tipo:** Jogo interativo (livro-jogo digital)  
**Status:** ✅ Arco 1 implementado  
**Acesso:** FREE  
**Stack:** React 19 · Zustand · Framer Motion · Supabase  
**Versão atual:** `1.0.61` (console: `[LDI] versão carregada: 1.0.61`)  
**Rota:** `/games/ldi/*`

### LDI Arena Mode — FINALIZADO ✅ v1.7.2
**Status:** PRONTO PARA LANÇAMENTO
**Rota:** `/games/ldi-arena`
**Stack:** React 19 · Zustand · Framer Motion · Supabase
**Console:** `[ARENA] versão carregada: 1.7.2`
- ✅ Criação de ficha 3D&T com intro + manual drawer + skipIntro
- ✅ Combate vertical com chat WhatsApp-style, attack cards, dado e onomatopeia inline
- ✅ 8 inimigos com trash talk personalizado (8 personalidades randomizadas por luta)
- ✅ Sistema de progressão: desbloqueio sequencial de inimigos por ficha
- ✅ Power select redesign com cards glass
- ✅ Tela de vitória com fases (mensagem final → HP zero → K.O.! → resultado)
- ✅ Modo imersivo (navbar/footer ocultos) + botão voltar ao site
- ✅ Save cloud Supabase + delete ficha + intro localStorage
- ✅ Layout responsivo: mobile chat fullscreen, desktop vertical elegante
- ✅ Redesign completo: lobby, create, combat, victory, power select

---

## 11. JACK DREAM BEER — Idle Noir Investigativo

**Tipo:** Idle game narrativo com dungeons automáticas + investigação  
**Status:** ✅ v4.0 — 3 cidades, 11 dungeons, 28 itens, 10 NPCs, 4 casos investigativos  
**Acesso:** FREE (requer login)  
**Stack:** React 19 · Zustand · Framer Motion · Supabase  
**Versão atual:** `5.1.1` (console: `[JACK] versão carregada: 5.1.1`)  
**Rota:** `/games/jackcandy`
**GDD completo:** `docs/JACK_BEER_GDD.md`

### Pesadelo Particular — FINALIZADO ✅ v1.5.1
**Status:** PRONTO PARA LANÇAMENTO  
**Rota:** `/games/pesadelo`  
**Stack:** React 19 · Zustand · Framer Motion · Supabase  
**Console:** `[PP] versão carregada: 1.5.1`
- ✅ 20 casos investigativos com dados reais (01-05 completos, 06-20 placeholder)
- ✅ Sistema de batalha com nível escalável
- ✅ 5 puzzles reutilizáveis embedded (Decoder, StealthGrid, Labirinto, Anagrama, SlidingTiles)
- ✅ Save cloud via Supabase (UPSERT com RLS `auth.uid() = user_id`)
- ✅ Modo imersivo (navbar/footer/trial banner ocultos via ReaderContext)
- ✅ Menu inicial com CONTINUAR (mantém save) e NOVO JOGO (reseta Supabase + estado)
- ✅ Chat WhatsApp-style (ConvoView) com typewriter e avatares por personagem
- ✅ Story viewer de evidências estilo Instagram (click to close, X button)
- ✅ i18n PT com estrutura pronta para EN/ES
- ✅ Sistema de reputação, acusações erradas, bloqueio por excesso de erros
- ✅ Layout responsivo mobile-first (480px max, altura 100vh fixa, scroll contido)

### Mini Games — Arcade Puzzles
**Versão:** `1.1.8` (console: `[MINIGAMES] versão carregada: 1.1.8`)  
**Rota:** `/games/minigames`
**Status:** ✅ 6 puzzles standalone (Infiltração 3 dificuldades, Decoder, Sliding Tiles, Labirinto, Anagrama, Palavra Secreta/Força)

### Mecânicas Implementadas
- ✅ Main Menu com 3 save slots (F5 volta ao menu)
- ✅ Cervejas acumulam automaticamente (+1/s + passivos de itens)
- ✅ 3 moedas: 🍺 cervejas, 💵 notas, 💎 fragmentos
- ✅ Dossier — 4 casos investigativos com pistas, acusação, resolução
- ✅ CasoSelect + CasoAbertura com IntroNoir animada + DialogoCaso typewriter
- ✅ Interrogatório com Kim, suspense resolution screen
- ✅ Moral sync real-time, visitarLocal garantido, acusação síncrona
- ✅ Sistema de Fichas (Supabase, coleta diária, gate nos jogos)
- ✅ Pajé, Bengala Steampunk, Fase Intro → Mundo
- ✅ HP com regen automática (1 a cada 10s, pausa em dungeon)
- ✅ 3 cidades: Marelia, Auranis, Karnazar (desbloqueio progressivo)
- ✅ 11 dungeons com 3 mecânicas: combate, stealth, fuga
- ✅ 10 NPCs com lojas, missões e aliados
- ✅ 28 itens em 5 categorias (arma, armadura, acessório, consumível, upgrade)
- ✅ Inventário com equip slots, swap, desequipar, abas
- ✅ Sistema Dia/Noite com cooldown 30s
- ✅ Sistema Primordial: medidor 0-10, dobra dano ao encher
- ✅ Sistema de Aliados: Kim/Nina/Shuntaro para dungeons
- ✅ Professor Máquina: dicas contextuais após idle + cards glow
- ✅ 5 puzzles reutilizáveis (Labirinto, Anagrama, StealthGrid, Decoder, SlidingTiles)
- ✅ Chuva de caracteres no fundo (efeito noir)
- ✅ Auto-save localStorage + cloud Supabase (UPSERT)
- ✅ LoginGate — requer conta no site
- ✅ Modo imersivo (sem navbar/footer)

### Estrutura de Arquivos
```
src/pages/JackCandy/
├── JackCandy.jsx                   # Container: MainMenu gate, fase routing, intervals
├── JackCandy.css                   # 1140 linhas estilos noir
├── store/
│   └── useJackStore.js             # Zustand: recursos, equipamento, dungeons, Primordial, Supabase
├── data/
│   ├── flags.js / cidades.js / npcs.js / itens.js / dungeons.js / monologues.js
│   ├── casos.js                    # 4 casos investigativos com diálogos e suspeitos
│   └── pistas.js                   # Base de pistas para os casos
├── screens/
│   ├── MainMenu.jsx                # 3 save slots: novo jogo, continuar, deletar
│   ├── Intro.jsx                   # Typewriter + Pajé + compra da bengala
│   ├── Vila.jsx                    # Hub multi-cidade: cards, navegação
│   ├── Interior.jsx                # Loja: balão NPC, abas, ícones, missões
│   ├── Inventario.jsx              # Equip slots com swap, dropdown, abas
│   ├── Dungeon.jsx                 # Combate auto + stealth + fuga + Primordial
│   ├── DungeonSelect.jsx           # Grid de dungeons com filtro progressivo
│   ├── Descanso.jsx               # Tela de descanso entre dias
│   ├── Dossier.jsx                 # Hub de investigação com pistas, acusação
│   ├── CasoSelect.jsx             # Seleção de caso investigativo
│   ├── CasoAbertura.jsx           # Abertura de caso com animação noir
│   ├── Investigacao.jsx           # Tela de investigação ativa
│   └── Interrogatorio.jsx         # Interrogatório com Kim
└── components/
    ├── StatusBar.jsx               # HP bar CSS, recursos, MND/INV/DUN
    ├── DicaToast.jsx               # Professor Máquina com 👓
    ├── Monologue.jsx               # Balão de monólogo fixo no rodapé
    ├── IntroNoir.jsx               # Animação de abertura noir (holofote, silhueta)
    ├── DialogoCaso.jsx             # Typewriter multi-personagem para casos
    ├── PistaCard.jsx               # Card de pista individual
    └── CombatLog.jsx               # (legado — mantido para compatibilidade)
```

### Rotas internas do jogo
A navegação é interna via estado `fase` no JackCandy.jsx, sem react-router interno.

### Supabase — Tabelas
| Tabela | Descrição |
|---|---|
| `jack_saves` | Save slots (UPSERT com onConflict user_id+slot_num) |
| `fichas` | Saldo de fichas por usuário |
| `fichas_historico` | Histórico de transações de fichas |
| `character_sheets` | Fichas de personagem (compartilhada com LDI/Arena) |

### Inimigos — Arco 1 (LDI Narrativo)
| ID | Nome | Dificuldade | Notas |
|---|---|---|---|
| stormbyte_91 | StormByte_91 | easy | Tutorial de combate |
| kaeda | Kaeda | medium | Primeiro contato |
| ghostpulse | GhostPulse | medium | Ataque elemental |
| ironveil | IronVeil | hard | Tanque |
| null_entity_encounter1 | NULL_ENTITY (1) | medium | Primeiro encontro |
| null_entity_encounter2 | NULL_ENTITY (2) | hard | Segundo encontro |
| null_entity_final | NULL_ENTITY (Final) | very_hard | Chefe final |
| robo_rank_baixo | Robô de Rank Baixo | easy | Beco |
| stormbyte_elite | StormByte_Elite | medium | Versão 2 |
| sombra_digital | Sombra Digital | hard | Furtividade + poder elemental |

### Estrutura de arquivos LDI
```
src/pages/LDI/
├── Lobby.jsx / LDI.css          # Lobby (título animado, cards, modal, manual)
├── Create.jsx                    # NeoGuide guiado + Ficha Completa
├── Game.jsx                      # Tela principal de cena
├── Combat.jsx                    # Tela de combate 3D&T
├── Sheet.jsx                     # Ficha do personagem
├── Clues.jsx                     # Caderno de pistas
├── End.jsx                       # Tela de fim de jogo
├── PuzzlePage.jsx                # Roteador de puzzles in-game
├── Diagnostico.jsx               # Tela de diagnóstico admin (v1.0.4)
├── hooks/
│   └── useLDIStorage.js          # CRUD Supabase: saveSheet, loadSheets, game_saves
├── engine/
│   ├── dice.js / combat.js / character.js / flags.js / scenes.js
├── store/
│   ├── useGameStore.js           # Save, sheet, cena, XP, cloud save
│   └── useCombatStore.js         # Estado de combate (FA, FD, log, status)
├── data/
│   ├── scenes/act1~4.json        # Cenas dos Atos I-IV
│   ├── enemies/enemies.json      # 10 inimigos
│   ├── characterData.js          # Vantagens, Desvantagens, Perícias
│   ├── manualData.js             # Seções do Manual do Jogo
│   └── powersData.js             # 42 poderes em 7 elementais (6 por elemental)
└── components/
    ├── Typewriter.jsx            # Efeito de digitação com personagem por prefixo [NOME]
    ├── SceneView.jsx             # Container de cena + transição
    ├── ChoiceList.jsx            # Escolhas com stagger + bloqueio
    ├── CombatView.jsx            # Grid de combate 3 colunas com log WhatsApp-style
    ├── DiceRoll.jsx              # Dado animado + onomatopeias (POW, SLASH, BOOM)
    ├── CharacterSheetView.jsx    # Ficha visual com barras
    ├── ClueBook.jsx              # Caderno de pistas
    ├── PuzzleRouter.jsx          # Roteador de puzzles por tipo
    ├── PuzzleSimonSays.jsx       # Puzzle de memória
    ├── PuzzleWireCut.jsx         # Puzzle de corte de fios
    ├── ManualDrawer.jsx          # Drawer lateral do Manual
    ├── PuzzleSlidingTiles.jsx    # Puzzle 3×3 / 4×4
    ├── PuzzleStealthGrid.jsx     # Puzzle stealth com câmeras
    └── PuzzleDecoder.jsx         # Puzzle de frequência
```

### Supabase — Tabelas LDI
| Tabela | Descrição |
|---|---|
| `character_sheets` | Fichas dos personagens — persistem entre runs |
| `game_saves` | Estado de cada run — vinculado à ficha |

**Migration:** `supabase/migrations/003_lendas_ldi.sql`  
**RLS:** `auth.uid() = user_id`

### Cloud Save — Fluxo
- **Usuário logado:** save automático no Supabase
- **Visitante:** joga sem persistência (sessão apenas)
- **Lobby:** lista fichas salvas do usuário logado
- **Funções:** `saveToCloud(userId)`, `loadFromCloud(userId, sheetId)`

### Sistemas implementados
- Engine de combate 3D&T (dice.js · combat.js · character.js)
- Sistema de flags e cenas em JSON (4 atos)
- 6 puzzles: Sliding Tiles · Stealth Grid · Decoder · Simon Says · Wire Cut · PuzzlePage router
- Efeitos visuais: typewriter · onomatopeias · flash de dano · dado animado
- Auto-save no Supabase por transição de cena
- Transições de cena com split VHS / tela preta
- Manual do Jogo (drawer lateral) com 9 seções
- Criação completa: Vantagens (custo), Desvantagens (ganho), Perícias, Especializações
- 42 poderes em 7 elementais (6 por elemental)
- Personagem por prefixo `[NOME]` no texto → cor, fonte e bg por personagem
- Fontes nativas: Arial, Georgia, Trebuchet MS, Courier New, Impact
- F5 no jogo redireciona pro Lobby
- Diagnóstico admin para debugging de cenas, flags e saves

### Bugfixes aplicados (últimos)
- ✅ PM consumido por poderes no combate, executeAttack com powerBonus
- ✅ Level up modal com +/- desfazer, XP progressivo `10 + n*2`
- ✅ F5 no Game.jsx redireciona pro Lobby
- `LDI_VERSION 1.0.61`. Commit: `d7894bf`

### Dependências
| Pacote | Versão | Motivo |
|---|---|---|
| framer-motion | ^12.x | Animações e transições |
| zustand | ^5.x | Estado global |

---

## 12. TAMAGOSHI LDI — Criatura Virtual

**Versão atual:** `1.0.0` (console: `[TAMA] versão carregada: 1.0.0`)

### Estrutura de arquivos

```
src/pages/Tamagoshi/
├── Tamagoshi.jsx              # Container: fase routing, decay init, intervals
├── Tamagoshi.css              # ~450 linhas estilo dark neon
├── store/
│   └── useTamagoshiStore.js   # Zustand: métricas, decaimento offline, Supabase save
├── data/
│   ├── criaturas.js           # 30 criaturas, 6 personalidades, 5 raridades
│   ├── personalidades.js      # 6 tipos com textos de notificação por urgência
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
