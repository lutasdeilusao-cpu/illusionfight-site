# ILLUSIONFIGHT.COM — SITE MAP

> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.**

---

## 1. ESTRUTURA DE PASTAS

```
/
├── index.html                          # Entry point HTML + SEO/OG tags + GA + SPA redirect script
├── package.json                        # Dependências e scripts (inclui predeploy/deploy)
├── vite.config.js                      # Configuração Vite (base: /)
├── AGENTS.md                           # Regras do agente + workflow obrigatório
├── SITE_MAP.md                         # Este arquivo
├── docs/                                # Documentação do projeto
├── scripts/                             # Scripts utilitários
├── sandbox/                             # Sandbox de testes
├── TilemapReact/                        # Testes de tilemap React
├── .gitignore                          # Node, dist, .env, Retcon.md
├── .env                                # Variáveis dev (VITE_DEBUG=true)
├── .env.production                     # Variáveis prod (VITE_DEBUG=false)
├── public/
│   ├── favicon-ldi.png                 # Favicon (logo LDI, 512×512 PNG)
│   ├── og-image.jpg                    # Open Graph preview (1200×630)
│   ├── 404.html                        # Redirect SPA para GitHub Pages
│   ├── sitemap.xml                     # Sitemap para crawlers (18 URLs ativas)
│   ├── sw.js                           # Service worker (placeholder)
│   ├── CNAME                           # Domínio customizado
│   ├── _redirects                      # 10 regras de trailing slash (301)
│   ├── assets/                         # Assets públicos
│   │   ├── arena/terrenos/
│   │   │   └── tile_default.png        # Tile padrão do tabuleiro
│   │   └── images/
│   │       ├── characters/             # 10 renders: alan, helena, jack, kim, kronos, lisa, nina, shuntaro, voidhunter, yawanari
│   │       ├── livro/                  # 4 capas de capítulo (01~04.png)
│   │       └── tamagoshi/              # Sprites tamagoshi (SEO fallback)
│   ├── fonts/
│   │   ├── animeace2_bld.ttf           # Fonte anime (animeace2)
│   │   ├── BringRace.otf               # Fonte customizada LDI
│   │   ├── Ethnocentric-Regular.otf    # Fonte sci-fi
│   │   └── RacingGames.ttf             # Fonte racing
│   ├── games/                          # HTML estático SEO (15 dirs com index.html)
│   │   ├── index.html                  # /games/
│   │   ├── jackcandy/index.html        # /games/jackcandy/
│   │   ├── ldi/index.html              # /games/ldi/
│   │   ├── ldi-arena/index.html        # /games/ldi-arena/
│   │   ├── ldi-tatics/index.html       # /games/ldi-tatics/
│   │   ├── minigames/index.html        # /games/minigames/
│   │   └── pesadelo/index.html         # /games/pesadelo/
│   ├── arena/sfx/                      # SFX de combate (combat/, item/, magic/, phase/, ui/)
│   ├── leaderboard/index.html          # /leaderboard/
│   ├── livro/index.html                # /livro/
│   ├── loja/index.html                 # /loja/
│   ├── mundo/index.html                # /mundo/
│   ├── musicas/index.html              # /musicas/
│   ├── personagens/index.html          # /personagens/
│   ├── quiz/index.html                 # /quiz/
│   └── webtoon/
│       ├── index.html                  # /webtoon/
│       ├── 00/pt/01~21.png             # 21 páginas do webtoon Ep. 00
│       └── 01/pt/01~37.png             # 37 páginas do webtoon Ep. 01 (O Sonho)
├── supabase/
│   ├── migrations/
│   │   ├── 004_jack_v3.sql            # Jack Candy v3
│   │   ├── 005_pesadelo_particular.sql # Pesadelo Particular
│   │   ├── 006_arena_enemies_unlocked.sql # Arena inimigos
│   │   ├── 006_tamagoshi.sql           # Tamagoshi v1
│   │   ├── 007_jack_v4_xp_nivel.sql    # Jack Candy v4 XP
│   │   ├── 008_tamagoshi_trocas.sql    # Tamagoshi trocas
│   │   ├── 009_tamagoshi_v2.sql        # Tamagoshi v2
│   │   ├── 010_profiles_admin_role.sql # Profiles: is_admin, role, tier
│   │   ├── 010_tamagoshi_fix_columns.sql # Tamagoshi fix colunas
│   │   ├── 011_arena_tatics_roster.sql # Arena Tatics roster
│   │   ├── 012_tatics_card_pool.sql    # Cartas + evolução (v7.0)
│   │   ├── 013_fichas_tables.sql       # Fichas + fichas_historico
│   │   ├── 013_pesadelo_saves.sql      # Pesadelo saves
│   │   ├── 014_toptrumps_decks_builder.sql # Top Trumps deck builder
│   │   ├── 015_profiles_last_seen_at.sql # Profiles last_seen_at
│   │   ├── 016_toptrumps_ranking.sql   # Top Trumps ranking mensal
│   │   ├── 017_drop_tamagoshi_tables.sql # Drop Tamagoshi obsoletas
│   │   ├── 018_ensure_fichas_constraints.sql # PK user_id fichas
│   │   ├── 018_profiles_country.sql    # País nos perfis
│   │   ├── 019_dix_initial_1000.sql    # 1000 DIX iniciais
│   │   ├── 020_toptrumps_decks_unique_constraint.sql # UNIQUE (user_id, carta_id)
│   │   ├── 021_toptrumps_stats_carta_ganha.sql # Coluna carta_ganha_hoje
│   │   ├── 021_profiles_is_test_account.sql # Flag is_test_account em profiles
│   │   └── 022_fix_null_country_codes.sql # Fix países null em profiles
│   └── functions/
│       ├── create-checkout-session/index.ts  # Stripe checkout (JWT obrigatório)
│       ├── stripe-webhook/index.ts           # Stripe webhook (no-verify-jwt)
│       └── cancel-subscription/index.ts      # Cancelar assinatura (JWT obrigatório)
└── src/
    ├── App.jsx                         # Layout global + Routes
    ├── main.jsx                        # Entry point React (Providers: Helmet, BrowserRouter, Reader, Language, Auth, Fichas)
    ├── index.css                       # CSS Global (reset, vars, .btn, .glitch, reveal, newsletter-cta, home-support)
    │
    ├── assets/images/
│   │   ├── banners/                    # banner-01.png ~ banner-05.png (~2.3MB cada)
│   │   ├── characters/                 # jack-balloon.png, CS.png
│   │   ├── episodes/                   # thumb-ep00.png, thumb-ep01.png
│   │   ├── livro/                      # capitulo-01.png ~ capitulo-03.png (capas oficiais dos 3 caps publicados)
│   │   ├── logos/                      # logo-pt.png, logo-en.png
│   │   ├── music/                      # 01.png ~ 16.png (capas randomizadas por visita)
│   │   ├── ComingSoon.png              # Placeholder para conteúdo não lançado (~2.3MB)
    │   ├── cards/                      # Cartas Top Trumps + TemplateBase 0-5 + CardInterrogation
    │   ├── prototype/                  # tile_test.png
    │   └── tamagoshi/                  # Sprites tamagoshi (kroniki-* por ID, 01~10)
    │
    ├── components/
    │   ├── AchievementToast/           # Toast de achievement com partículas (dentro do AchievementsContext)
    │   ├── BackToGamesBtn              # Botão voltar para /games/
    │   ├── BookChaptersRow/            # Seção home: capítulos do livro
    │   ├── CharacterCard/              # Card de personagem
    │   ├── CharactersRow/              # Seção home: grid personagens
    │   ├── CookieBanner/               # Banner LGPD/cookies
    │   ├── Footer/                     # Footer global
    │   ├── HeroEffect/                 # Efeitos visuais do hero
    │   ├── HeroSlideshow/              # Slideshow do hero na home
    │   ├── LatestEpisodes/             # Seção home: últimos episódios
    │   ├── LoginGate/                  # Gate de login reutilizável
    │   ├── ModalConfirmacaoFicha/      # Modal confirmação antes de gastar ficha
    │   ├── ModalLancamento             # Modal de lançamento/newsletter
    │   ├── ModalSemFichas/             # Modal arcade "SEM FICHAS"
    │   ├── FichaGateRoute/            # Gate rota: login + ficha + FREE info em todas as rotas de game
    │   ├── GuestNotice                 # Aviso para usuários guest
    │   ├── MusicSection/               # Seção home: música
    │   ├── Navbar/                     # Navbar global com menu hamburger + logo IF (img)
    │   ├── LDINotification/            # Balão de notificação
    │   ├── NowLive/                    # Seção home: agora ao vivo
    │   ├── PlatformIcons.jsx           # Ícones de plataformas de música
    │   ├── ProdutoDigitalCard          # Card de produto digital na loja
    │   ├── Puzzles/                    # 7 puzzles + index.js + css + sfx
    │   ├── ResultCard/                 # Canvas share card com paletas por jogo
    │   ├── ScrollToTop/                # Botão voltar ao topo
    │   ├── ScrollToTopOnNav.jsx        # Scroll to top on navigation change
    │   ├── NinaMusicPlayer/            # Player de música flutuante
    │   ├── SearchModal/                # Modal de busca global
    │   ├── ShopSection/                # Loja de produtos físicos
    │   ├── SocialBar/                  # Barra de redes sociais
    │   ├── TopTrumpsCard               # Card de carta Top Trumps (reutilizado no SP e MP)
    │   ├── StoryProgress/              # Seção home: progresso da história
    │   ├── TrialBanner/                # Banner de teste gratuito
    │   ├── TypewriterPhrase/           # Typewriter animado
    │   └── UnifiedNotification/        # Notificação unificada global (renderizada em App.jsx)
    │
    ├── config/
    │   ├── site.js                     # SITE_NAME, SITE_NAME_PT, DOMAIN
    │   ├── trial.js                    # TRIAL_ACTIVE = false
    │   ├── version.js                  # Todas as versões centralizadas
    │   ├── fichas.js                   # Constantes de fichas (FREE_LIMITE, CUSTOS)
    │   └── launch.js                   # Datas de lançamento
    │
    ├── context/
    │   ├── AchievementsContext.jsx     # Provider: desbloquear, toast, persistência Supabase
    │   ├── AuthContext.jsx             # Provider: user, perfil, session, login, logout
    │   ├── DixContext.jsx              # Provider: DIX wallet transactions
    │   ├── EventosContext.jsx          # Provider: eventos globais do sistema
    │   ├── FichasContext.jsx           # Provider: saldo, coleta diária, gastar, role-based
    │   ├── LanguageContext.jsx          # Provider i18n: locale, t(), changeLocale()
    │   ├── LanguageProvider.jsx        # Provider wrapper i18n
    │   └── ReaderContext.jsx           # Estado readerMode — esconde Navbar/TrialBanner
    │
    ├── lib/
    │   ├── supabase.js                 # Cliente Supabase (anon key + URL)
    │   ├── stripe.js                   # Stripe frontend: iniciarCheckout(), cancelarAssinatura(), getPriceDisplay()
    │   ├── getDeck.js                  # Utilitário de carregamento de deck
    │   ├── notificationManager.js      # Gerenciador de notificações
    │   └── sfx.js                      # Sistema de SFX (click, select, reward, etc.)
    │
    ├── data/
    │   ├── achievements-pt.json        # Achievements do sistema
    │   ├── episodios.json              # Episódios do webtoon
    │   ├── livro-index.json            # Índice dos capítulos (publicado, título multi-lang)
    │   ├── loja-digital.json           # Produtos digitais da loja
    │   ├── livro/                      # Capítulos em markdown (pt/, en/, es/)
    │   ├── mundo-pt.json               # Lore do mundo (PT)
    │   ├── mundo-en.json               # Lore do mundo (EN)
    │   ├── mundo-es.json               # Lore do mundo (ES)
    │   ├── musicas.json                # Dados das músicas
    │   ├── notificacoes.json           # Notificações do sistema
    │   ├── nowlive.json                # Status "ao vivo"
    │   ├── paises.js                   # Lista de países (formulários)
    │   ├── personagens-pt.json         # Personagens (PT)
    │   ├── personagens-en.json         # Personagens (EN)
    │   ├── personagens-es.json         # Personagens (ES)
    │   ├── planos.json                 # Planos de assinatura (tiers)
    │   ├── produtos.json               # Produtos da loja
    │   ├── quiz-pt.json                # Banco de perguntas do Quiz
    │   ├── search-index.js             # Índice de busca global
    │   ├── supertrunfo-pt.json         # Cartas do Top Trumps (PT)
    │   ├── supertrunfo-en.json         # Cartas do Top Trumps (EN)
    │   ├── supertrunfo-es.json         # Cartas do Top Trumps (ES)
    │
    ├── hooks/
    │   ├── useFichaGate.js             # Gate de fichas para jogos
    │   ├── useHeroEffect.js            # Efeitos do hero
    │   ├── usePersonagens.js           # Carrega personagens por locale
    │   ├── useScrollPosition.js        # Posição do scroll
    │   ├── useScrollReveal.js          # IntersectionObserver reveal
    │   ├── useSlideshow.js             # Slideshow automático
    │   ├── useSwipe.js                 # Detecção de swipe touch
    │   ├── useLeaderboardDB.js         # Supabase queries Leaderboard
    │   ├── usePresence.js              # Presença online
    │   ├── useTopTrumpsMP.js           # Multiplayer Top Trumps
    │   ├── useTypewriter.js            # Efeito typewriter
    │   ├── useViewportScroll.js        # Scroll do viewport
    │   └── useZoom.js                  # Zoom em imagens
    │
    ├── i18n/
    │   ├── pt.json                     # Traduções PT (site)
    │   ├── en.json                     # Traduções EN (site)
    │   ├── es.json                     # Traduções ES (site)
    │   ├── pp_pt.json                  # Traduções PT (Pesadelo Particular)
    │   ├── pp_en.json                  # Traduções EN (Pesadelo Particular)
    │   ├── pp_es.json                  # Traduções ES (Pesadelo Particular)
    │   ├── arena-trash-en.json         # Falas arena (EN)
    │   ├── arena-trash-es.json         # Falas arena (ES)
    │   ├── cardLabels.js               # Labels de cartas
    │   └── locales.js                  # Import aggregator + LOCALE_LABELS
    │
    ├── pages/
    │   ├── games/                       # Jogos
    │   │   ├── Games.jsx                # Hub de games
    │   │   ├── Games.css
    │   │   ├── Arena/                   # LDI Arena Mode
    │   │   ├── ArenaTatics/             # LDI TATICS
    │   │   ├── Duelo/                   # DUELO LDI
    │   │   ├── JackCandy/               # Jack Dream Beer
    │   │   ├── LDI/                     # LDI LENDAS (RPG narrativo)
    │   │   ├── MiniGames/               # Mini-games arcade
    │   │   ├── PesadeloParticular/      # Pesadelo Particular
    │   │   ├── Tamagoshi/               # TAMA LDI
    │   │   └── TopTrumps/               # Top Trumps card game
    │   │       ├── TopTrumps.jsx
    │   │       ├── TopTrumps.css
    │   │       ├── TopTrumpsLobby.jsx
    │   │       ├── TopTrumpsLobby.css
    │   │       ├── TopTrumpsMP.jsx
    │   │       ├── TopTrumpsMP.css
    │   │       ├── components/
    │   │       └── hooks/
    │   │
    │   ├── content/                     # Conteúdo do site
    │   │   ├── Livro.jsx                # Lista de capítulos
    │   │   ├── Livro.css
    │   │   ├── LivroCapitulo.jsx        # Leitor de capítulo
    │   │   ├── LivroCapitulo.css
    │   │   ├── Mundo.jsx                # Lore do universo
    │   │   ├── Mundo.css
    │   │   ├── Musicas.jsx              # Página de músicas
    │   │   ├── Musicas.css
    │   │   ├── Personagens.jsx          # Grid de personagens
    │   │   ├── Personagens.css
    │   │   ├── PersonagemDetalhe.jsx    # Detalhe do personagem
    │   │   ├── PersonagemDetalhe.css
    │   │   ├── Webtoon.jsx              # Grid episódios webtoon
    │   │   ├── Webtoon.css
    │   │   ├── WebtoonEpisodio.jsx      # Leitor webtoon
    │   │   └── WebtoonEpisodio.css
    │   │
    │   ├── platform/                    # Plataforma (auth, perfil, admin)
    │   │   ├── Admin.jsx                # Painel admin
    │   │   ├── Admin.css
    │   │   ├── Assinar.jsx              # Página de assinaturas + Stripe
    │   │   ├── Assinar.css
    │   │   ├── Cadastro.jsx             # Cadastro de conta
    │   │   ├── Leaderboard.jsx          # Ranking global
    │   │   ├── Leaderboard.css
    │   │   ├── Login.jsx                # Login Supabase Auth
    │   │   ├── Login.css
    │   │   └── Perfil/                  # Hub do perfil do usuário
    │   │       ├── Perfil.jsx
    │   │       ├── Perfil.css
    │   │       ├── PerfilProgresso.jsx
    │   │       ├── PerfilProgresso.css
    │   │       └── abas/
    │   │
    │   ├── site/                        # Site pages
    │   │   ├── Autor.jsx                # Sobre o autor
    │   │   ├── Autor.css
    │   │   ├── Custos.jsx               # Transparência financeira
    │   │   ├── Custos.css
    │   │   ├── Home.jsx                 # Landing page
    │   │   ├── Loja/                    # Loja
    │   │   │   ├── Loja.jsx
    │   │   │   └── Loja.css
    │   │   ├── NotFound/                # 404
    │   │   │   ├── NotFound.jsx
    │   │   │   └── NotFound.css
    │   │   ├── Quiz.jsx                 # Quiz SDR
    │   │   └── Quiz.css
    │   │
    │   └── lab/                         # Laboratório / protótipos
    │       └── Prototype/               # Protótipos (admin-only)
    │   │       ├── IntroNoir.jsx       # Intro noir
    │   │       ├── Monologue.jsx       # Monólogo
    │   │       ├── PistaCard.jsx       # Card de pista
    │   │       └── StatusBar.jsx       # Barra de status
    │   │
    │   ├── LDI/                        # LDI LENDAS (RPG narrativo)
    │   │   ├── Lobby.jsx               # Lobby do jogo
    │   │   ├── Create.jsx              # Criação de personagem
    │   │   ├── Game.jsx                # Tela principal de jogo
    │   │   ├── Combat.jsx              # Tela de combate
    │   │   ├── Sheet.jsx               # Ficha do personagem
    │   │   ├── Clues.jsx               # Caderno de pistas
    │   │   ├── End.jsx                 # Tela de fim
    │   │   ├── PuzzlePage.jsx          # Roteador de puzzles
    │   │   ├── LDI.css
    │   │   ├── engine/
    │   │   │   ├── dice.js             # Sistema de dados
    │   │   │   ├── combat.js           # Sistema de combate 3D&T
    │   │   │   ├── character.js        # Lógica de personagem
    │   │   │   ├── flags.js            # Sistema de flags
    │   │   │   └── scenes.js           # Gerenciamento de cenas
    │   │   ├── store/
    │   │   │   ├── useGameStore.js     # Zustand: jogo principal
    │   │   │   └── useCombatStore.js   # Zustand: combate
    │   │   ├── data/
    │   │   │   ├── characterData.js    # Dados de personagem
    │   │   │   ├── manualData.js       # Dados do manual
    │   │   │   ├── powersData.js       # Dados de poderes
    │   │   │   ├── scenes/             # Cenas em JSON
    │   │   │   └── enemies/            # Inimigos em JSON
    │   │   ├── components/
    │   │   │   ├── CharacterSheetView.jsx # Visualização da ficha
    │   │   │   ├── ChoiceList.jsx      # Lista de escolhas
    │   │   │   ├── ClueBook.jsx        # Caderno de pistas
    │   │   │   ├── CombatView.jsx      # Visão de combate
    │   │   │   ├── DiceRoll.jsx        # Rolagem de dados
    │   │   │   ├── ManualDrawer.jsx    # Gaveta do manual
    │   │   │   ├── PuzzleDecoder.jsx   # Puzzle: decodificador
    │   │   │   ├── PuzzleRouter.jsx    # Roteador de puzzles
    │   │   │   ├── PuzzleSimonSays.jsx # Puzzle: Simon Says
    │   │   │   ├── PuzzleSlidingTiles.jsx # Puzzle: tiles deslizantes
    │   │   │   ├── PuzzleStealthGrid.jsx  # Puzzle: grid furtivo
    │   │   │   ├── PuzzleWireCut.jsx   # Puzzle: corte de fios
    │   │   │   ├── SceneView.jsx       # Visão de cena narrativa
    │   │   │   └── Typewriter.jsx      # Efeito typewriter
    │   │   └── hooks/
    │   │       └── useLDIStorage.js    # Hook de storage local
    │   │
    │   ├── MiniGames/                  # Mini-games arcade
    │   │   ├── MiniGames.jsx           # Container
    │   │   ├── MiniGames.css
    │   │   └── version.js              # Console.log version
    │   │
    │   ├── Perfil/                     # Hub do perfil do usuário
    │   │   ├── Perfil.jsx              # Container com abas
    │   │   ├── Perfil.css
    │   │   └── abas/
    │   │       ├── PerfilConquistas.jsx   # Aba: conquistas
    │   │       ├── PerfilArena.jsx        # Aba: arena
    │   │       ├── PerfilColecao.jsx      # Aba: coleção + botão Deck Builder
    │   │       ├── PerfilConta.jsx        # Aba: conta + assinatura Stripe
    │   │       ├── PerfilTamagoshi.jsx    # Aba: tamagoshi
    │   │       ├── PerfilTamagoshi.css
    │   │       ├── PerfilProgresso.jsx    # Aba: progresso do jogo
    │   │       ├── PerfilProgresso.css
    │   │       ├── Recompensas.jsx        # Aba: recompensas
    │   │       └── Recompensas.css
    │   │
    │   ├── PesadeloParticular/         # Pesadelo Particular
    │   │   ├── PP.jsx                  # Container principal
    │   │   ├── PP.css
    │   │   ├── store/
    │   │   │   └── usePPStore.js       # Zustand: save, progresso
    │   │   ├── data/
    │   │   │   ├── casos.js            # 20 casos
    │   │   │   ├── inimigos.js         # Inimigos
    │   │   │   ├── pistas.js           # Pistas
    │   │   │   ├── pp-i18n.js          # Traduções internas
    │   │   │   ├── resolver.js         # Lógica de resolução
    │   │   │   └── telefonema.js       # Roteiro de telefonemas
    │   │   ├── screens/
    │   │   │   ├── CadernoSuspeitas.jsx  # Caderno de suspeitas
    │   │   │   ├── CasoAbertura.jsx      # Abertura de caso
    │   │   │   ├── Confronto.jsx         # Confronto final
    │   │   │   ├── Dormindo.jsx          # Tela dormindo
    │   │   │   ├── Dossier.jsx           # Dossier do caso
    │   │   │   ├── FinalScreen.jsx       # Tela final
    │   │   │   ├── Investigacao.jsx      # Investigação
    │   │   │   ├── MapaCidade.jsx        # Mapa da cidade
    │   │   │   └── Resolucao.jsx         # Resolução do caso
    │   │   └── components/
    │   │       └── PuzzleWrapper.jsx     # Wrapper de puzzles
    │   │
    │   └── Tamagoshi/                  # TAMA LDI
    │       ├── Tamagoshi.jsx           # Container
    │       ├── Tamagoshi.css
    │       ├── store/
    │       │   └── useTamagoshiStore.js # Zustand: métricas, DIX, lifecycle
    │       ├── data/
    │       │   ├── criaturas.js        # 32 criaturas
    │       │   ├── evolucoes.js        # 4 estágios
    │       │   ├── falas-criatura-pt.js # Falas por criatura (PT)
    │       │   ├── falas-criatura-en.js # Falas por criatura (EN)
    │       │   ├── falas-criatura-es.js # Falas por criatura (ES)
    │       │   ├── itens_loja.js       # Itens da loja
    │       │   ├── moedas.js           # DIX constants
    │       │   ├── tamagoshi-season1.json # JSON T1: IDs 1-10
    │       │   ├── passeios.js         # 6 locais
    │       │   ├── personalidades.js   # 6 personalidades
    │       ├── sfx.js                  # Sons sintéticos via Web Audio API
    │       ├── screens/
    │       │   ├── Alimentar.jsx       # Minigame alimentar
    │       │   ├── Banhar.jsx          # Minigame banhar
    │       │   ├── Brincadeira.jsx     # 4 mini-interações
    │       │   ├── Criatura.jsx        # Tela principal
    │       │   ├── Gacha.jsx           # Gacha (sorteio de criaturas)
    │       │   ├── Loja.jsx            # Loja de itens
    │       │   ├── Luto.jsx            # Morte + cooldown
    │       │   ├── Ovo.jsx             # Ovo pulsante
    │       │   ├── Partida.jsx         # Despedida + fama
    │       │   ├── Passear.jsx         # Minigame grid
    │       │   ├── Passeio.jsx         # Seleção de local
    │       │   ├── RestaurarSaude.jsx  # Cura de criatura
    │       │   ├── Selecao.jsx         # Escolha da criatura
    │       │   ├── Termo.jsx           # Termo de uso do jogo
    │       │   └── Termo.css
    │       └── components/
    │           ├── BalloonFala.jsx     # Balão de fala
    │           ├── CooldownTimer.jsx   # Timer de cooldown
    │           ├── CriaturaSprite.jsx  # Sprite da criatura
    │           └── MetricBar.jsx       # Barra de métricas
    │
```

---

## 2. PÁGINAS E ROTAS

| Rota | Componente | Arquivo | Versão | Status | Tradução | Descrição |
|---|---|---|---|---|---|---|---|
| `/` | Home | `src/pages/site/Home.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Landing page: HeroSlideshow, LatestEpisodes, CharactersRow, BookChaptersRow, MusicSection, NowLive, StoryProgress, newsletter-cta, ShopSection, home-support CTA |
| `/personagens` | Personagens | `src/pages/content/Personagens.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Grid com todos os 9 personagens por categoria |
| `/personagens/:id` | PersonagemDetalhe | `src/pages/content/PersonagemDetalhe.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Detalhe: nome, idade, status, ranking, arma, estilo, elemental, descrição, frase, relações |
| `/livro` | Livro | `src/pages/content/Livro.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | 16 capítulos com controle de publicação |
| `/livro/:id` | LivroCapitulo | `src/pages/content/LivroCapitulo.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Leitor react-markdown, lazy loading, readerMode |
| `/assinar` | Assinar | `src/pages/platform/Assinar.jsx` | ✅ v2.90 | ✅ Stripe | ✅ PT ✅ EN ✅ ES | Inline CSS removido, hardcoded strings → t(), Helmet i18n, i18n pt/en/es completo |
| `/autor` | Autor | `src/pages/site/Autor.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Sobre o projeto e o universo |
| `/webtoon` | Webtoon | `src/pages/content/Webtoon.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Grid episódios com thumbnails |
| `/webtoon/:id` | WebtoonEpisodio | `src/pages/content/WebtoonEpisodio.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Leitor vertical lazy load, readerMode |
| `/musicas` | Musicas | `src/pages/content/Musicas.jsx` | — | ✅ FINALIZADO | ✅ PT ✅ EN ✅ ES | 36 faixas oficiais, shuffle ao carregar, links para todas as plataformas |

> **📌 OBS:** Todas as 36 músicas oficiais do Isaias Leal estão lançadas na página `/musicas` com shuffle automático ao carregar. **Todas as thumbs oficiais criadas** — atualmente todas usam a capa de "Lutas de Ilusão" como placeholder até serem criadas as artes individuais.
| `/mundo` | Mundo | `src/pages/content/Mundo.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Lore: Bravara, LDI, Xakaxi, Timeline, Glossário |
| `/games` | Games | `src/pages/games/Games.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Hub central de todos os jogos |
| `/games/toptrumps` | TopTrumps | `src/pages/games/TopTrumps/TopTrumps.jsx` | ✅ v5.27.0 | ✅ 1ª temp. ✅ Deck Build | ✅ PT ✅ EN ✅ ES | fix PPT: traduções, layout mobile, revelação simultânea |
| `/games/toptrumps/lobby` | TopTrumpsLobby | `src/pages/games/TopTrumps/TopTrumpsLobby.jsx` | — | ✅ 🔒 | ✅ PT ✅ EN ✅ ES | Lobby multiplayer com matchmaking |
| `/games/toptrumps/multiplayer` | TopTrumpsMP | `src/pages/games/TopTrumps/TopTrumpsMP.jsx` | ✅ v5.12.0 | ✅ 🔒 | ✅ PT ✅ EN ✅ ES | JSON v2 — id numérico em vez de slug |
| `/games/ldi` | LDILobby | `src/pages/games/LDI/Lobby.jsx` | ✅ v2.67 | ✅ 1ª temp. | ✅ PT ✅ EN ✅ ES | RPG narrativo — lobby |
| `/games/ldi/create` | LDICreate | `src/pages/games/LDI/Create.jsx` | ✅ v2.67 | ✅ | ✅ PT ✅ EN ✅ ES | NeoGuide + Ficha Completa |
| `/games/ldi/game` | LDIGame | `src/pages/games/LDI/Game.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Cena narrativa + typewriter |
| `/games/ldi/combat` | LDICombat | `src/pages/games/LDI/Combat.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Combate 3D&T |
| `/games/ldi/sheet` | LDISheet | `src/pages/games/LDI/Sheet.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Ficha do personagem |
| `/games/ldi/clues` | LDIClues | `src/pages/games/LDI/Clues.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Caderno de pistas |
| `/games/ldi/end` | LDIEnd | `src/pages/games/LDI/End.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Tela de fim |
| `/games/ldi/puzzle` | LDIPuzzle | `src/pages/games/LDI/PuzzlePage.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Roteador de puzzles |
| `/games/jackcandy` | JackCandy | `src/pages/games/JackCandy/JackCandy.jsx` | ✅ v5.2.1 | ✅ 1ª temp. | ✅ PT ✅ EN ✅ ES | Idle noir investigativo — CSS inline audit: static styles movidos para .css, i18n carregando/monologo_fechar |
| `/games/minigames` | MiniGames | `src/pages/games/MiniGames/MiniGames.jsx` | ✅ **v4.0.2** | ✅ **100%** | ✅ PT ✅ EN ✅ ES | 8 puzzles arcade, todos os níveis free |
| `/games/ldi-arena` | ArenaRoute | `src/pages/games/Arena/ArenaRoute.jsx` | ✅ v1.27.0 | ✅ 🔒 | ✅ PT ✅ EN ✅ ES | LDI ARENA — combate CPU standalone + guest temp sheet (jogável sem conta) |
| `/games/ldi-tatics` | ArenaTaticsRoute | `src/pages/games/ArenaTatics/ArenaTaticsRoute.jsx` | ✅ v7.4.0 | 🔒 Pós-lançamento (multiplayer pendente) | ✅ PT ✅ EN ✅ ES | Tático isométrico Canvas 2D + Cidade Marélia |
| `/games/pesadelo` | PP | `src/pages/games/PesadeloParticular/PP.jsx` | ✅ v2.3.1 | ✅ 1ª temp. 🔒 | ✅ PT ✅ EN ✅ ES | 20 casos, 3 slots, guest mode, Supabase save |
| `/games/duelo` | DueloRoute | `src/pages/games/Duelo/DueloRoute.jsx` | ✅ v2.8.0 | 🔒 Pós-lançamento (multiplayer pendente) | ✅ PT ✅ EN ✅ ES | Card game 1v1 vs IA — ataque direto Yu-Gi-Oh style |
| `/games/tamagoshi` | Tamagoshi | `src/pages/games/Tamagoshi/Tamagoshi.jsx` | ✅ v3.0.2 | ✅ Lançado | ✅ PT ✅ EN ✅ ES | 32 criaturas em FALAS_CRIATURA ordenadas por ID (1-32), double-encoding corrigido |
| `/loja` | Loja | `src/pages/site/Loja/Loja.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Produtos físicos e digitais |
| `/leaderboard` | Leaderboard | `src/pages/platform/Leaderboard.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Ranking global |
| `/quiz` | Quiz | `src/pages/site/Quiz.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | 3 modos, banco de perguntas |
| `/login` | Login | `src/pages/platform/Login.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Login Supabase Auth |
| `/cadastro` | Cadastro | `src/pages/platform/Cadastro.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Cadastro de conta |
| `/perfil` | Perfil | `src/pages/platform/Perfil/Perfil.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Hub 6 abas + assinatura Stripe |
| `/custos` | Custos | `src/pages/site/Custos.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Transparência financeira do projeto |
| `/admin` | Admin | `src/pages/platform/Admin.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Painel admin exclusivo |
| `/prototype` | Prototype | `src/pages/lab/Prototype/Prototype.jsx` | ✅ v2.5.2 | ✅ | ✅ PT ✅ EN ✅ ES | Hub de protótipos admin-only: cards que navegam para sub-rotas. |
| `/prototype/srgrm` | SRGRM 3v3 | `src/pages/lab/Prototype/SRGRM/SRGRM.jsx` + `game-logic.js` | ✅ v3.5.0 | ✅ | ✅ PT ✅ EN ✅ ES | Sistema RPG 3v3 (substitui Morto Engine). Criação de personagem, aliados, combate tático. |
| `/prototype/arenatestbed` | Arena Testbed | `src/pages/lab/Prototype/ArenaTestbed/ArenaTestbed.jsx` | ✅ v6.21.2 | ✅ | ✅ PT ✅ EN ✅ ES | Testbed de animações e combate da Arena. |
| `*` (catch-all) | NotFound | `src/pages/site/NotFound/NotFound.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | 404 com contador 5s + redirect automático p/ home + noindex |

> **📌 SE0 e Indexação:**
> - **Sitemap público** (`public/sitemap.xml`) contém **18 URLs** — as páginas públicas listadas acima. Rotas privadas (`/login`, `/cadastro`, `/perfil`, `/admin`, `/assinar`, `/custos`, `/prototype`) e multiplayer (`/games/toptrumps/lobby`, `/games/toptrumps/multiplayer`) **não estão no sitemap**.
> - `/games/tamagoshi` e `/games/duelo` existem no React Router mas **não estão no sitemap público** (não indexadas pelo Google).
> - **15 arquivos HTML estáticos** em `public/*/index.html` são servidos pelo GitHub Pages para crawlers que não executam JS — cada um com `<meta http-equiv="refresh">` redirecionando para a SPA real + `<title>` e `<meta description>` específicos.
> - **`public/_redirects`** — 10 regras de trailing slash (301) para rotas sem barra → com barra.
> - **`index.html` raiz** — JSON-LD schema.org/WebSite, meta tags sem "brasileiro" ou "autor".
> - **Rotas protegidas por autenticação** (`🔒` na tabela acima) usam `<FichaGateRoute>` para verificar login + fichas antes de liberar o jogo. `/games/toptrumps/lobby` e `/games/toptrumps/multiplayer` exigem conta.

---

## 3. VERSÕES

> ✅ **Fonte:** `src/config/version.js` (arquivo único de versionamento)

| Constante | Versão | Descrição |
|---|---|---|
| `SITE_VERSION` | **10.166.0** | i18n Top Trumps extraída para tt_pt/en/es.json + fix PPT keys faltantes |
| `PP_VERSION` | **2.3.1** | Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json |
| `LDI_VERSION` | **2.0.1** | Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro) |
| `JACK_VERSION` | **5.3.1** | Jack Dream Beer — guest aviso visual fix (centralizado, card, botão) |
| `ARENA_VERSION` | **1.31.0** | Arena LDI — Testbed: fixes linha de visão PDF, morte/partida, ataque pós-movimento, flag AGI (ver PROTOTYPE 2.10.0 para fix morte imediata) |
| `TAMA_VERSION` | **3.3.3** | Tamagoshi LDI — fix: RestaurarSaude check inventário só na entrada (useState init) |
| `DUELO_VERSION` | **2.8.0** | Duelo LDI — ataque direto Yu-Gi-Oh style + fix TELEPORT |
| `MINIGAMES_VERSION` | **4.0.2** | readerMode: Navbar e Footer ocultos |
| `TS_VERSION` | **5.28.0** | Top Trumps SP — i18n extraída para tt_pt/en/es.json + fix PPT keys |
| `TM_VERSION` | **5.12.0** | Top Trumps MP — JSON v2: id numérico em vez de slug |
| `TATICS_VERSION` | **7.5.0** | Arena LDI Tatics — fix: centralização padX hexgrid (gridSpan em vez de gridW) |
| `SRGRM_VERSION` | **3.5.0** | SRGRM 3v3 — extração fiel do original rpg_3v3-3-4-1.html, 129 funções preservadas |
| `ARENATESTBED_VERSION` | **6.21.2** | FIX: add play(key) method to AudioManager — EffectRenderer was calling audio.play() which didn't exist |

---

## 4. COMPONENTES GLOBAIS (App.jsx)

| Componente | Função |
|---|---|
| `ScrollToTopOnNav` | Sobe scroll ao navegar |
| `Navbar` | Navbar com menu hamburger, search |
| `SearchModal` | Busca global |
| `TrialBanner` | Banner trial (oculto readerMode) |
| `Footer` | Footer global |
| `ScrollToTop` | Botão voltar ao topo |
| `LDINotification` | Balão de notificação |
| `NinaMusicPlayer` | Player de música flutuante |
| `UnifiedNotification` | Notificação unificada |
| `CookieBanner` | Banner LGPD |
| `LoginGate` | Gate de login reutilizável (importado, usado internamente) |

> **Nota:** `AchievementToast` não é renderizado diretamente em App.jsx — está dentro do `AchievementsContext`. `FichaGateRoute` é um wrapper de rota usado em cada `<Route>` de jogo.

---

## 5. STRIPE / ASSINATURAS

- **Frontend:** `src/lib/stripe.js` — `iniciarCheckout(tier)`, `cancelarAssinatura()`, `getPriceDisplay(locale)`
- **Edge Functions:**
  | Função | JWT | Descrição |
  |--------|-----|-----------|
  | `create-checkout-session` | ✅ | Cria sessão Stripe Checkout |
  | `stripe-webhook` | ❌ | Eventos Stripe |
  | `cancel-subscription` | ✅ | `cancel_at_period_end` |
- **Webhook:** `https://dvxfrzixtetdzmdrzkpx.supabase.co/functions/v1/stripe-webhook`
- **Tiers pagos:** ELITE (R$10/mês), PRIMORDIAL (R$30/mês)

---

## 6. SUPABASE

**Projeto:** `dvxfrzixtetdzmdrzkpx`

### Migrations

| Migration | Descrição |
|---|---|
| `004_jack_v3.sql` | Jack Candy v3 |
| `005_pesadelo_particular.sql` | Pesadelo Particular |
| `006_arena_enemies_unlocked.sql` | Arena inimigos |
| `006_tamagoshi.sql` | Tamagoshi v1 |
| `007_jack_v4_xp_nivel.sql` | Jack v4 XP |
| `008_tamagoshi_trocas.sql` | Trocas |
| `009_tamagoshi_v2.sql` | Tamagoshi v2 |
| `010_profiles_admin_role.sql` | Admin role em profiles |
| `010_tamagoshi_fix_columns.sql` | Fix colunas tamagoshi |
| `011_arena_tatics_roster.sql` | Arena Tatics roster |
| `012_tatics_card_pool.sql` | Card pool + evolução |
| `013_fichas_tables.sql` | Tabelas fichas + fichas_historico |
| `013_pesadelo_saves.sql` | Pesadelo saves |
| `014_toptrumps_decks_builder.sql` | Top Trumps deck builder |
| `015_profiles_last_seen_at.sql` | Profiles last_seen_at |
| `016_toptrumps_ranking.sql` | Top Trumps ranking mensal |
| `017_drop_tamagoshi_tables.sql` | Drop Tamagoshi obsoletas |
| `018_ensure_fichas_constraints.sql` | PK user_id fichas |
| `018_profiles_country.sql` | País nos perfis |
| `019_dix_initial_1000.sql` | 1000 DIX iniciais |
| `020_toptrumps_decks_unique_constraint.sql` | UNIQUE (user_id, carta_id) |
| `021_toptrumps_stats_carta_ganha.sql` | Coluna carta_ganha_hoje |
| `021_profiles_is_test_account.sql` | Flag is_test_account em profiles |
| `022_fix_null_country_codes.sql` | Fix países null em profiles |

### Tabelas principais: `profiles`, `toptrumps_decks`, `share_submissions`, `tamagoshi_saves`, `tamagoshi_trocas`, `dix_wallet`, `dix_historico`, `tamagoshi_badges`, `tamagoshi_fama`

---

## 7. TAMAGOSHI — Detalhamento

### Decaimento (tempo real + offline)

| Métrica | Decaimento/h | Crítico em |
|---|---|---|
| Fome | -6 | ~16h |
| Higiene | -3 | ~33h |
| Energia | -4 | ~25h |
| Humor | -2 | ~50h |

### Ciclo de Vida: Ovo (0-3d) → Filhote (4-60d) → Jovem (61-120d) → Adulto (121-180d) → Veterano (181-270d) → Ancião (271-365d) → Partida (>365d)

### DIX: +10/ação, +25/login diário. Gastos: 5-30 DIX.

### Seleção por tier: Ranqueado=1 criatura, ELITE=3, PRIMORDIAL=10

---

## 8. NOTAS TÉCNICAS

### Stack: Vite 8 + React 19 + React Router 7 + Zustand 5 + Framer Motion 12 + Supabase v2

### i18n: PT/EN/ES via LanguageContext. PP tem i18n própria.

### z-index: SearchModal(2000) > AchievementToast(1500) > Navbar(1000) > CookieBanner(200) > LDINotification(150) > TrialBanner(140) > ScrollToTop(100) > MusicSection(50)

### engine/eventBus.js: Singleton pub/sub (on/off/emit). Integrado ao useEffectMachine (ouvinte `effect:end`), EffectRenderer (emite de primitivos), Phase6CombatV2 (`onClearHighlight`/highlights), useCombatEngine (`finalizarTurnoIA`). Substitui chamadas diretas a `finalizarEfeito` por `emit('effect:end', { canal })`.

### Deploy: `npm run build` → `npm run deploy` (gh-pages). `python deploy.py -g <game> -m "desc"` para automação completa.

**Repositório:** https://github.com/lutasdeilusao-cpu/illusionfight-site
**Site:** https://illusionfight.com/
