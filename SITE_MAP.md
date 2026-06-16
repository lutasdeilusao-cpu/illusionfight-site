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
│   ├── favicon.svg                     # Favicon LDI
│   ├── og-image.jpg                    # Open Graph preview (1200×630)
│   ├── 404.html                        # Redirect SPA para GitHub Pages
│   ├── sitemap.xml                     # Sitemap para crawlers
│   ├── sw.js                           # Service worker (placeholder)
│   ├── assets/                         # Assets públicos (imagens de fallback)
│   ├── fonts/
│   │   └── BringRace.otf              # Fonte customizada
│   └── webtoon/
│       └── 00/pt/01~21.png             # 21 páginas do webtoon Ep. 00
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
│   │   ├── 010_stripe_billing.sql      # Stripe: subscription columns
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
│   │   └── 021_toptrumps_stats_carta_ganha.sql # Coluna carta_ganha_hoje
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
    │   ├── banners/                    # banner-01.png ~ banner-04.png (~2.3MB cada)
│   │   ├── characters/                 # jack-balloon.png, CS.png
│   │   ├── episodes/                   # thumb-ep00.png, thumb-ep01.png│   │   ├── livro/                      # capitulo-01.png ~ capitulo-03.png (capas oficiais dos 3 caps publicados)│   │   ├── logos/                      # logo-pt.png, logo-en.png
│   │   ├── music/                      # 01.png ~ 16.png (capas randomizadas por visita)
│   │   ├── ComingSoon.png              # Placeholder para conteúdo não lançado (~2.3MB)
    │   └── tamagoshi/                  # Sprites tamagoshi (kroniki-*.png)
    │
    ├── components/
    │   ├── AchievementToast/           # Toast de achievement com partículas
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
    │   ├── ModalSemFichas/             # Modal arcade "SEM FICHAS"
    │   ├── FichaGateRoute/            # Gate rota: login + ficha + FREE info em todas as rotas de game
    │   ├── MusicSection/               # Seção home: música
    │   ├── Navbar/                     # Navbar global com menu hamburger
    │   ├── LDINotification/            # Balão de notificação
    │   ├── NowLive/                    # Seção home: agora ao vivo
    │   ├── PlatformIcons.jsx           # Ícones de plataformas de música
    │   ├── Puzzles/                    # 6 puzzles reutilizáveis
    │   ├── ResultCard/                 # Canvas share card com paletas por jogo
    │   ├── ScrollToTop/                # Botão voltar ao topo
    │   ├── ScrollToTopOnNav.jsx        # Scroll to top on navigation change
    │   ├── NinaMusicPlayer/            # Player de música flutuante
    │   ├── SearchModal/                # Modal de busca global
    │   ├── ShopSection/                # Loja de produtos físicos
    │   ├── SocialBar/                  # Barra de redes sociais
    │   ├── StoryProgress/              # Seção home: progresso da história
    │   ├── TrialBanner/                # Banner de teste gratuito
    │   └── TypewriterPhrase/           # Typewriter animado
    │
    ├── config/
    │   ├── site.js                     # SITE_NAME, SITE_NAME_PT, DOMAIN
    │   ├── trial.js                    # TRIAL_ACTIVE = false
    │   └── version.js                  # Todas as versões centralizadas
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
    │   └── stripe.js                   # Stripe frontend: iniciarCheckout(), cancelarAssinatura(), getPriceDisplay()
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
    │   ├── Admin.jsx                   # Painel admin
    │   ├── Admin.css
    │   ├── Assinar.jsx                 # Página de assinaturas + Stripe
    │   ├── Assinar.css
    │   ├── Autor.jsx                   # Sobre o autor
    │   ├── Autor.css
    │   ├── Cadastro.jsx                # Cadastro de conta
    │   ├── Games/                      # Hub de games
    │   │   ├── Games.jsx
    │   │   └── Games.css
    │   ├── Home.jsx                    # Landing page
    │   ├── Leaderboard.jsx             # Ranking global
    │   ├── Leaderboard.css
    │   ├── Livro.jsx                   # Lista de capítulos
    │   ├── Livro.css
    │   ├── LivroCapitulo.jsx           # Leitor de capítulo
    │   ├── LivroCapitulo.css
    │   ├── Login.jsx                   # Login Supabase Auth
    │   ├── Login.css
    │   ├── Mundo.jsx                   # Lore do universo
    │   ├── Mundo.css
    │   ├── Musicas.jsx                 # Página de músicas
    │   ├── Musicas.css
    │   ├── Personagens.jsx             # Grid de personagens
    │   ├── Personagens.css
    │   ├── PersonagemDetalhe.jsx       # Detalhe do personagem
    │   ├── PersonagemDetalhe.css
    │   ├── Quiz.jsx                    # Quiz SDR
    │   ├── Quiz.css
    │   ├── TopTrumps.jsx               # Top Trumps card game
    │   ├── TopTrumps.css
    │   ├── TopTrumpsLobby.jsx          # Lobby multiplayer
    │   ├── TopTrumpsLobby.css
    │   ├── TopTrumpsMP.jsx             # Partida multiplayer
    │   ├── TopTrumpsMP.css
    │   ├── Webtoon.jsx                 # Grid episódios webtoon
    │   ├── Webtoon.css
    │   ├── WebtoonEpisodio.jsx         # Leitor webtoon
    │   ├── WebtoonEpisodio.css
    │   │
    │   ├── Arena/                      # LDI Arena Mode
    │   │   ├── ArenaRoute.jsx          # Container + roteamento
    │   │   ├── Arena.css
    │   │   ├── ArenaLobby.jsx          # Lobby (seleção de dificuldade)
    │   │   ├── ArenaCreate.jsx         # Criação de ficha
    │   │   ├── ArenaCombat.jsx         # Tela de combate
    │   │   ├── ArenaVictory.jsx        # Tela de vitória
    │   │   ├── store/
    │   │   │   └── useArenaStore.js    # Zustand: sheet, match, XP, Supabase
    │   │   └── data/
    │   │       ├── arena-enemies.json  # 8 inimigos tier 1-4
    │   │       └── trash_talk.json     # Falas dos inimigos
    │   │
    │   ├── ArenaTatics/                # LDI TATICS
    │   │   ├── ArenaTaticsRoute.jsx    # Container principal
    │   │   ├── ArenaTatics.css
    │   │   ├── store/
    │   │   │   ├── useArenaTaticsStore.js  # Zustand: save, batalha, progresso
    │   │   │   └── useCityStore.js         # Zustand: cidade, clima, NPCs
    │   │   ├── data/
    │   │   │   ├── roster.js           # 20 personagens jogáveis
    │   │   │   ├── classTree.js        # Árvore de evolução das 6 classes (v7.0)
    │   │   │   ├── cardPool.js         # Sistema de sorteio de cartas (pool de 10)
    │   │   │   ├── aiPersonalities.js  # 16 personalidades de IA
    │   │   │   ├── classes.js          # Classes dos personagens
    │   │   │   ├── combat.js           # Sistema de combate
    │   │   │   ├── cosmeticos.js       # Cosméticos/aparência
    │   │   │   ├── districts.js        # Distritos de Marélia (8)
    │   │   │   ├── elementais.js       # Elementais (sistema legado)
    │   │   │   ├── elementals.js       # Elementais (sistema atual)
    │   │   │   ├── enemies.js          # Inimigos do overworld
    │   │   │   ├── equipment.js        # Equipamentos
    │   │   │   ├── eventos.js          # Eventos aleatórios
    │   │   │   ├── juice.js            # Efeitos visuais
    │   │   │   ├── levelProgression.js # Progressão de nível (v7.0: suporta evolução)
    │   │   │   └── tilemaps/           # Mapas tile JSON
    │   │   ├── screens/
    │   │   │   ├── Batalha.jsx         # Tela de batalha principal
    │   │   │   ├── BatalhaSimulacao.jsx # Simulação de batalha
    │   │   │   ├── BuildingInterior.jsx # Interiores de prédios
    │   │   │   ├── CityOverworld.jsx   # Mapa da cidade (isométrico)
    │   │   │   ├── ClasseSelect.jsx    # Seleção de classe
    │   │   │   ├── Customizacao.jsx    # Customização de personagem
    │   │   │   ├── Derrota.jsx         # Tela de derrota
    │   │   │   ├── EvolutionScreen.jsx # Tela de evolução de classe (Nv40/Nv70)
    │   │   │   ├── Intro.jsx           # Tela de introdução
    │   │   │   ├── PreBatalha.jsx      # Pré-batalha (preparação)
    │   │   │   ├── SimulacaoAuto.jsx   # Simulação automática
    │   │   │   ├── TeamBuilder.jsx     # Montagem de time
    │   │   │   ├── TeamSelect.jsx      # Seleção de time
    │   │   │   └── Vitoria.jsx         # Tela de vitória
    │   │   └── components/
    │   │       ├── ActionMenu.jsx      # Menu de ações em batalha
    │   │       ├── CityHUD.jsx         # HUD da cidade
    │   │       ├── CombatResultModal.jsx # Modal resultado combate
    │   │       ├── ConfirmEndTurn.jsx  # Confirmação fim de turno
    │   │       ├── DanoPopup.jsx       # Popup de dano
    │   │       ├── EnemyTurnBanner.jsx # Banner turno inimigo
    │   │       ├── EventoBanner.jsx    # Banner de evento
    │   │       ├── GameControls.jsx    # Controles do jogo
    │   │       ├── Grid.jsx            # Grid de batalha
    │   │       ├── GridCanvas.jsx      # Canvas isométrico 2D
    │   │       ├── JuiceComponents.jsx # Componentes de juice
    │   │       ├── SkillModal.jsx      # Modal de habilidades
    │   │       ├── SkillPreviewModal.jsx # Preview de habilidade
    │   │       ├── StatusBar.jsx       # Barra de status
    │   │       ├── TiledMap.jsx        # Mapa tile-based
    │   │       └── TurnoIndicator.jsx  # Indicador de turno
    │   │
    │   ├── Duelo/                      # DUELO LDI
    │   │   ├── DueloRoute.jsx          # Container
    │   │   ├── Duelo.css
    │   │   ├── version.js              # Console.log version
    │   │   ├── store/
    │   │   │   └── useDueloStore.js    # Zustand: game state
    │   │   ├── data/
    │   │   │   └── cards.js            # 60 cartas
    │   │   ├── engine/
    │   │   │   ├── ai.js               # IA greedy
    │   │   │   ├── deck.js             # Lógica de deck
    │   │   │   ├── effects.js          # Efeitos de cartas
    │   │   │   ├── gameState.js        # Estado do jogo
    │   │   │   └── phases.js           # Fases do turno
    │   │   ├── screens/
    │   │   │   ├── DueloMenu.jsx       # Menu principal
    │   │   │   ├── DueloVitoria.jsx    # Tela de vitória
    │   │   │   ├── DueloVitoria.css
    │   │   │   └── DueloDerrota.jsx    # Tela de derrota
    │   │   │   └── DueloDerrota.css
    │   │   └── components/
    │   │       ├── BattleLog.jsx       # Log de batalha
    │   │       ├── Board.jsx           # Tabuleiro
    │   │       ├── Card.jsx            # Card component
    │   │       ├── CardPreviewModal.jsx # Preview de carta
    │   │       ├── CardSlot.jsx        # Slot de carta
    │   │       ├── Hand.jsx            # Mão do jogador
    │   │       ├── LPDisplay.jsx       # Display de LP
    │   │       ├── PlayerZone.jsx      # Zona do jogador
    │   │       ├── StatusBar.jsx       # Barra de status
    │   │       ├── TrapActivator.jsx   # Ativador de armadilha
    │   │       └── TributeSelector.jsx # Seletor de tributo
    │   │
    │   ├── JackCandy/                  # Jack Dream Beer
    │   │   ├── JackCandy.jsx           # Container principal
    │   │   ├── JackCandy.css
    │   │   ├── store/
    │   │   │   └── useJackStore.js     # Zustand: flags, progresso
    │   │   ├── data/
    │   │   │   ├── casos.js            # Casos investigativos
    │   │   │   ├── cidades.js          # Cidades visitáveis
    │   │   │   ├── dungeons.js         # Dungeons
    │   │   │   ├── flags.js            # Flags de progresso
    │   │   │   ├── itens.js            # Itens do jogo
    │   │   │   ├── monologues.js       # Monólogos do Jack
    │   │   │   ├── npcs.js             # NPCs
    │   │   │   └── pistas.js           # Pistas investigativas
    │   │   ├── screens/
    │   │   │   ├── CasoAbertura.jsx    # Abertura de caso
    │   │   │   ├── CasoSelect.jsx      # Seleção de caso
    │   │   │   ├── Descanso.jsx        # Tela de descanso
    │   │   │   ├── Dossier.jsx         # Dossier do caso
    │   │   │   ├── Dungeon.jsx         # Exploração de dungeon
    │   │   │   ├── DungeonSelect.jsx   # Seleção de dungeon
    │   │   │   ├── Interior.jsx        # Interiores
    │   │   │   ├── Interrogatorio.jsx  # Interrogatório
    │   │   │   ├── Intro.jsx           # Introdução
    │   │   │   ├── Inventario.jsx      # Inventário
    │   │   │   ├── Investigacao.jsx    # Investigação
    │   │   │   ├── MainMenu.jsx        # Menu principal
    │   │   │   └── Vila.jsx            # Tela de vila
    │   │   └── components/
    │   │       ├── CombatLog.jsx       # Log de combate
    │   │       ├── DialogoCaso.jsx     # Diálogo de caso
    │   │       ├── DicaToast.jsx       # Dica toast
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
    │       │   ├── falas-criatura.js   # Falas por criatura
    │       │   ├── itens_loja.js       # Itens da loja
    │       │   ├── moedas.js           # DIX constants
    │       │   ├── tamagoshi-season1.json # JSON T1: IDs 1-10
    │       │   ├── passeios.js         # 6 locais
    │       │   ├── personalidades.js   # 6 personalidades
    │       │   └── sfx.js              # Sons sintéticos via Web Audio API
    │       ├── screens/
    │       │   ├── Alimentar.jsx       # Minigame alimentar
    │       │   ├── Banhar.jsx          # Minigame banhar
    │       │   ├── Brincadeira.jsx     # 4 mini-interações
    │       │   ├── Criatura.jsx        # Tela principal
    │       │   ├── Loja.jsx            # Loja de itens
    │       │   ├── Luto.jsx            # Morte + cooldown
    │       │   ├── Ovo.jsx             # Ovo pulsante
    │       │   ├── Partida.jsx         # Despedida + fama
    │       │   ├── Passear.jsx         # Minigame grid
    │       │   ├── Passeio.jsx         # Seleção de local
    │       │   └── Selecao.jsx         # Escolha da criatura
    │       └── components/
    │           ├── BalloonFala.jsx     # Balão de fala
    │           ├── CooldownTimer.jsx   # Timer de cooldown
    │           ├── CriaturaSprite.jsx  # Sprite da criatura
    │           └── MetricBar.jsx       # Barra de métricas
    │
    └── store/                          # (vazio — stores estão por página)
```

---

## 2. PÁGINAS E ROTAS

| Rota | Componente | Arquivo | Versão | Status | Tradução | Descrição |
|---|---|---|---|---|---|---|---|
| `/` | Home | `src/pages/Home.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Landing page: HeroSlideshow, LatestEpisodes, CharactersRow, BookChaptersRow, MusicSection, NowLive, StoryProgress, newsletter-cta, ShopSection, home-support CTA |
| `/personagens` | Personagens | `src/pages/Personagens.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Grid com todos os 9 personagens por categoria |
| `/personagens/:id` | PersonagemDetalhe | `src/pages/PersonagemDetalhe.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Detalhe: nome, idade, status, ranking, arma, estilo, elemental, descrição, frase, relações |
| `/livro` | Livro | `src/pages/Livro.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | 16 capítulos com controle de publicação |
| `/livro/:id` | LivroCapitulo | `src/pages/LivroCapitulo.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Leitor react-markdown, lazy loading, readerMode |
| `/assinar` | Assinar | `src/pages/Assinar.jsx` | ✅ v2.90 | ✅ Stripe | ✅ PT ✅ EN ✅ ES | Inline CSS removido, hardcoded strings → t(), Helmet i18n, i18n pt/en/es completo |
| `/autor` | Autor | `src/pages/Autor.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | História do autor Isaias Leal |
| `/webtoon` | Webtoon | `src/pages/Webtoon.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Grid episódios com thumbnails |
| `/webtoon/:id` | WebtoonEpisodio | `src/pages/WebtoonEpisodio.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Leitor vertical lazy load, readerMode |
| `/musicas` | Musicas | `src/pages/Musicas.jsx` | — | ✅ FINALIZADO | ✅ PT ✅ EN ✅ ES | 36 faixas oficiais, shuffle ao carregar, links para todas as plataformas |

> **📌 OBS:** Todas as 36 músicas oficiais do Isaias Leal estão lançadas na página `/musicas` com shuffle automático ao carregar. **Todas as thumbs oficiais criadas** — atualmente todas usam a capa de "Lutas de Ilusão" como placeholder até serem criadas as artes individuais.
| `/mundo` | Mundo | `src/pages/Mundo.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Lore: Bravara, LDI, Xakaxi, Timeline, Glossário |
| `/games` | Games | `src/pages/Games/Games.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Hub central de todos os jogos |
| `/games/toptrumps` | TopTrumps | `src/pages/TopTrumps.jsx` | ✅ v5.21.0 | ✅ 1ª temp. ✅ Deck Build | ✅ PT ✅ EN ✅ ES | Deck builder integrado à conta, visualização de carta, recompensa diária |
| `/games/toptrumps/lobby` | TopTrumpsLobby | `src/pages/TopTrumpsLobby.jsx` | — | ✅ 🔒 | ✅ PT ✅ EN ✅ ES | Lobby multiplayer com matchmaking |
| `/games/toptrumps/multiplayer` | TopTrumpsMP | `src/pages/TopTrumpsMP.jsx` | ✅ v5.11.0 | ✅ 🔒 | ✅ PT ✅ EN ✅ ES | Partida multiplayer em tempo real |
| `/games/ldi` | LDILobby | `src/pages/LDI/Lobby.jsx` | ✅ v2.67 | ✅ 1ª temp. | ✅ PT ✅ EN ✅ ES | RPG narrativo — lobby |
| `/games/ldi/create` | LDICreate | `src/pages/LDI/Create.jsx` | ✅ v2.67 | ✅ | ✅ PT ✅ EN ✅ ES | NeoGuide + Ficha Completa |
| `/games/ldi/game` | LDIGame | `src/pages/LDI/Game.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Cena narrativa + typewriter |
| `/games/ldi/combat` | LDICombat | `src/pages/LDI/Combat.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Combate 3D&T |
| `/games/ldi/sheet` | LDISheet | `src/pages/LDI/Sheet.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Ficha do personagem |
| `/games/ldi/clues` | LDIClues | `src/pages/LDI/Clues.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Caderno de pistas |
| `/games/ldi/end` | LDIEnd | `src/pages/LDI/End.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Tela de fim |
| `/games/ldi/puzzle` | LDIPuzzle | `src/pages/LDI/PuzzlePage.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Roteador de puzzles |
| `/games/jackcandy` | JackCandy | `src/pages/JackCandy/JackCandy.jsx` | ✅ v5.2.1 | ✅ 1ª temp. | ✅ PT ✅ EN ✅ ES | Idle noir investigativo — CSS inline audit: static styles movidos para .css, i18n carregando/monologo_fechar |
| `/games/minigames` | MiniGames | `src/pages/MiniGames/MiniGames.jsx` | ✅ **v2.0.0** | ✅ **100%** | ✅ PT ✅ EN ✅ ES | 8 puzzles arcade + i18n completo nos puzzles (todos os componentes traduzidos pt/en/es) |
| `/games/ldi-arena` | ArenaRoute | `src/pages/Arena/ArenaRoute.jsx` | ✅ v1.27.0 | ✅ 🔒 | ✅ PT ✅ EN ✅ ES | LDI ARENA — combate CPU standalone + guest temp sheet (jogável sem conta) |
| `/games/ldi-tatics` | ArenaTaticsRoute | `src/pages/ArenaTatics/ArenaTaticsRoute.jsx` | ✅ v7.4.0 | 🔒 Pós-lançamento (multiplayer pendente) | ✅ PT ✅ EN ✅ ES | Tático isométrico Canvas 2D + Cidade Marélia |
| `/games/pesadelo` | PP | `src/pages/PesadeloParticular/PP.jsx` | ✅ v2.3.1 | ✅ 1ª temp. 🔒 | ✅ PT ✅ EN ✅ ES | 20 casos, 3 slots, guest mode, Supabase save |
| `/games/duelo` | DueloRoute | `src/pages/Duelo/DueloRoute.jsx` | ✅ v2.8.0 | 🔒 Pós-lançamento (multiplayer pendente) | ✅ PT ✅ EN ✅ ES | Card game 1v1 vs IA — ataque direto Yu-Gi-Oh style |
| `/games/tamagoshi` | Tamagoshi | `src/pages/Tamagoshi/Tamagoshi.jsx` | ✅ v2.5.0 | ✅ S1 sprite completo! | ✅ PT ✅ EN ✅ ES | 10/10 criaturas S1 com sprite próprio, i18n completo pt/en/es |
| `/loja` | Loja | `src/pages/Loja/Loja.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Produtos físicos e digitais |
| `/leaderboard` | Leaderboard | `src/pages/Leaderboard.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Ranking global |
| `/quiz` | Quiz | `src/pages/Quiz.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | 3 modos, banco de perguntas |
| `/login` | Login | `src/pages/Login.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Login Supabase Auth |
| `/cadastro` | Cadastro | `src/pages/Cadastro.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Cadastro de conta |
| `/perfil` | Perfil | `src/pages/Perfil/Perfil.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Hub 6 abas + assinatura Stripe |
| `/custos` | Custos | `src/pages/Custos.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Transparência financeira do projeto |
| `/admin` | Admin | `src/pages/Admin.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Painel admin exclusivo |
| `/prototype` | Prototype | `src/pages/Prototype/Prototype.jsx` + `HexBoard.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Protótipos admin-only: menu de seleção + Morto Engine + Combat Board Hexa |
| `*` (catch-all) | NotFound | `src/pages/NotFound/NotFound.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | 404 com contador 5s + redirect automático p/ home + noindex |

---

## 3. VERSÕES

> ✅ **Fonte:** `src/config/version.js` (arquivo único de versionamento)

| Constante | Versão | Descrição |
|---|---|---|
| `SITE_VERSION` | **10.120.0** | Site — Protótipo: glow hexágonos, menu radial, anúncios de turno v6.1.0 |
| `PP_VERSION` | **2.3.1** | Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json |
| `LDI_VERSION` | **2.0.1** | Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro) |
| `JACK_VERSION` | **5.3.1** | Jack Dream Beer — guest aviso visual fix (centralizado, card, botão) |
| `ARENA_VERSION` | **1.31.0** | Arena LDI — Testbed: fixes linha de visão PDF, morte/partida, ataque pós-movimento, flag AGI (ver PROTOTYPE 2.10.0 para fix morte imediata) |
| `TAMA_VERSION` | **2.5.1** | Tamagoshi LDI — guest aviso no termo (título, texto explicativo, link cadastro) |
| `DUELO_VERSION` | **2.8.0** | Duelo LDI — ataque direto Yu-Gi-Oh style + fix TELEPORT |
| `MINIGAMES_VERSION` | **2.0.0** | MiniGames (i18n completo pt/en/es) |
| `TS_VERSION` | **5.22.3** | Top Trumps SP — multiplayer travado para guest (modal de login) |
| `TM_VERSION` | **5.11.0** | Top Trumps MP — cron job limpar-salas-fantasma diário (3h) |
| `TATICS_VERSION` | **7.4.0** | Arena LDI Tatics (tagline i18n pt/en/es) |
| `PROTOTYPE_VERSION` | **6.1.0** | Protótipo — Arena Testbed: refinamento visual — glow hexágonos (shadowBlur), menu radial no token, anúncios de turno overlay, botão passar turno no top bar, bottom nav simplificado |

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
| `AchievementToast` | Toast de achievement |

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
| `010_stripe_billing.sql` | Stripe subscription |
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

### z-index: SearchModal(2000) > AchievementToast(1500) > Navbar(1000) > TrialBanner(998) > CookieBanner(200) > LDINotification(150) > ScrollToTop(100) > MusicSection(50)

### Deploy: `npm run build` → `npm run deploy` (gh-pages). `python deploy.py -g <game> -m "desc"` para automação completa.

**Repositório:** https://github.com/lutasdeilusao-cpu/illusionfight-site
**Site:** https://illusionfight.com/
