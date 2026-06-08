# ILLUSIONFIGHT.COM — SITE MAP

*Última atualização: 2026-06-08*
*Versão: 7.3*  |  `[SITE] versão carregada: 7.3`  |  🌐 **`https://illusionfight.com/`** (domínio oficial)
*Versão: 7.3*  |  `[SITE] versão carregada: 7.3`  |  🌐 **`https://illusionfight.com/`** (domínio oficial)
*TATICS versão: 7.0.0* | `[TATICS] versão carregada: 7.0.0`

> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.**

---

## 1. ESTRUTURA DE PASTAS

```
/
├── index.html                          # Entry point HTML + SEO/OG tags + GA + SPA redirect script
├── package.json                        # Dependências e scripts (inclui predeploy/deploy)
├── vite.config.js                      # Configuração Vite (base: /illusionfight-site/)
├── AGENTS.md                           # Regras do agente + workflow obrigatório
├── SITE_MAP.md                         # Este arquivo
├── ANALISE_COMPLETA.md                 # Análise técnica completa
├── PREMIUM_AUDIT.md                    # Auditoria de conteúdo premium
├── IasLDITatics.md                     # Documentação LDI Tatics
├── LdiTatics-MAP.md                    # Mapa de navegação LDI Tatics
├── ExpansãoJack.md                     # Proposta de expansão Jack
├── Lutas de Ilusão - Retcon.md         # Documento de retcon
├── Marketing-MAP.md                    # Mapa de marketing
├── PROPOSTA_CIDADE_MARELIA_v2.md       # Proposta cidade Marélia
├── RefactoryBattleLDITatics.md         # Refactory batalha LDI Tatics
├── PLANO_CLASSES_LDI_TATICS.md          # Planejamento árvore de classes
├── RELATORIO_CLASSES_COMPLETO.md        # Relatório das 42 variações de classe
├── deploy.py                           # Automação deploy (bump → build → commit → push → deploy)
├── _add_i18n.py                        # Script utilitário i18n
├── _connect_i18n.py                    # Script utilitário i18n
├── _scan_and_fix.py                    # Script utilitário lint
├── _translate_games.py                 # Script tradução jogos
├── _translate_games2.py                # Script tradução jogos
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
│   │   └── 011_arena_tatics_roster.sql # Arena Tatics roster
│   │   └── 012_tatics_card_pool.sql    # Cartas + evolução (v7.0)
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
    │   ├── characters/                 # jack-balloon.png
    │   ├── episodes/                   # thumb-ep00.png
    │   ├── logos/                      # logo-pt.png, logo-en.png
    │   ├── music/                      # lutas-de-ilusao.png
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
    │   ├── NotificationBalloon/        # Balão de notificação
    │   ├── NowLive/                    # Seção home: agora ao vivo
    │   ├── PlatformIcons.jsx           # Ícones de plataformas de música
    │   ├── Puzzles/                    # 6 puzzles reutilizáveis
    │   ├── ResultCard/                 # Canvas share card com paletas por jogo
    │   ├── ScrollToTop/                # Botão voltar ao topo
    │   ├── ScrollToTopOnNav.jsx        # Scroll to top on navigation change
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
    │   ├── AuthContext.jsx             # Provider: user, perfil, session, login, logout
    │   ├── AchievementsContext.jsx     # Provider: desbloquear, toast, persistência Supabase
    │   ├── FichasContext.jsx           # Provider: saldo, coleta diária, gastar, role-based
    │   ├── LanguageContext.jsx          # Provider i18n: locale, t(), changeLocale()
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
    │   ├── livro/                      # Capítulos em markdown (pt/, en/, es/)
    │   ├── mundo-pt.json               # Lore do mundo (PT)
    │   ├── mundo-en.json               # Lore do mundo (EN)
    │   ├── mundo-es.json               # Lore do mundo (ES)
    │   ├── musicas.json                # Dados das músicas
    │   ├── notificacoes.json           # Notificações do sistema
    │   ├── nowlive.json                # Status "ao vivo"
    │   ├── personagens-pt.json         # Personagens (PT)
    │   ├── personagens-en.json         # Personagens (EN)
    │   ├── personagens-es.json         # Personagens (ES)
    │   ├── planos.json                 # Planos de assinatura (tiers)
    │   ├── produtos.json               # Produtos da loja
    │   ├── quiz-pt.json                # Banco de perguntas do Quiz
    │   ├── search-index.js             # Índice de busca global
    │   └── supertrunfo-pt.json         # Cartas do Top Trumps
    │
    ├── hooks/
    │   ├── useFichaGate.js             # Gate de fichas para jogos
    │   ├── useHeroEffect.js            # Efeitos do hero
    │   ├── usePersonagens.js           # Carrega personagens por locale
    │   ├── useScrollPosition.js        # Posição do scroll
    │   ├── useScrollReveal.js          # IntersectionObserver reveal
    │   ├── useSlideshow.js             # Slideshow automático
    │   ├── useSwipe.js                 # Detecção de swipe touch
    │   ├── useTopTrumpsDB.js           # Supabase queries Top Trumps
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
    │   │       ├── PerfilColecao.jsx      # Aba: coleção
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
    │       │   ├── criaturas.js        # 30 criaturas
    │       │   ├── evolucoes.js        # 4 estágios
    │       │   ├── falas-criatura.js   # Falas por criatura
    │       │   ├── itens_loja.js       # Itens da loja
    │       │   ├── moedas.js           # DIX constants
    │       │   ├── passeios.js         # 6 locais
    │       │   └── personalidades.js   # 6 personalidades
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
| `/assinar` | Assinar | `src/pages/Assinar.jsx` | ✅ v2.89 | ✅ Stripe | ✅ PT ✅ EN ✅ ES | 3 tiers via Stripe Checkout. Preços dinâmicos por locale |
| `/autor` | Autor | `src/pages/Autor.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | História do autor Isaias Leal |
| `/webtoon` | Webtoon | `src/pages/Webtoon.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Grid episódios com thumbnails |
| `/webtoon/:id` | WebtoonEpisodio | `src/pages/WebtoonEpisodio.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Leitor vertical lazy load, readerMode |
| `/musicas` | Musicas | `src/pages/Musicas.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Faixas com capa + plataformas |
| `/mundo` | Mundo | `src/pages/Mundo.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Lore: Bravara, LDI, Xakaxi, Timeline, Glossário |
| `/games` | Games | `src/pages/Games/Games.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Hub central de todos os jogos |
| `/games/toptrumps` | TopTrumps | `src/pages/TopTrumps.jsx` | ✅ v2.63 | ✅ 1ª temp. | ✅ PT ✅ EN ✅ ES | Cartas colecionáveis, deck, recompensa diária |
| `/games/toptrumps/lobby` | TopTrumpsLobby | `src/pages/TopTrumpsLobby.jsx` | — | ✅ 🔒 | ✅ PT ✅ EN ✅ ES | Lobby multiplayer com matchmaking |
| `/games/toptrumps/multiplayer` | TopTrumpsMP | `src/pages/TopTrumpsMP.jsx` | ✅ v2.65 | ✅ 🔒 | ✅ PT ✅ EN ✅ ES | Partida multiplayer em tempo real |
| `/games/ldi` | LDILobby | `src/pages/LDI/Lobby.jsx` | ✅ v2.66 | ✅ 1ª temp. | ✅ PT ✅ EN ✅ ES | RPG narrativo — lobby |
| `/games/ldi/create` | LDICreate | `src/pages/LDI/Create.jsx` | ✅ v2.67 | ✅ | ✅ PT ✅ EN ✅ ES | NeoGuide + Ficha Completa |
| `/games/ldi/game` | LDIGame | `src/pages/LDI/Game.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Cena narrativa + typewriter |
| `/games/ldi/combat` | LDICombat | `src/pages/LDI/Combat.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Combate 3D&T |
| `/games/ldi/sheet` | LDISheet | `src/pages/LDI/Sheet.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Ficha do personagem |
| `/games/ldi/clues` | LDIClues | `src/pages/LDI/Clues.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Caderno de pistas |
| `/games/ldi/end` | LDIEnd | `src/pages/LDI/End.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Tela de fim |
| `/games/ldi/puzzle` | LDIPuzzle | `src/pages/LDI/PuzzlePage.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Roteador de puzzles |
| `/games/jackcandy` | JackCandy | `src/pages/JackCandy/JackCandy.jsx` | ✅ v5.1.3 | ✅ 1ª temp. | ✅ PT ✅ EN ✅ ES | Idle noir investigativo |
| `/games/minigames` | MiniGames | `src/pages/MiniGames/MiniGames.jsx` | ✅ v1.3.0 | ✅ | ✅ PT ✅ EN ✅ ES | 6 puzzles arcade + Enduro Kroniki |
| `/games/ldi-arena` | ArenaRoute | `src/pages/Arena/ArenaRoute.jsx` | ✅ v1.7.3 | ✅ 🔒 | ✅ PT ✅ EN ✅ ES | LDI ARENA — combate CPU standalone |
| `/games/ldi-tatics` | ArenaTaticsRoute | `src/pages/ArenaTatics/ArenaTaticsRoute.jsx` | ✅ v6.4.0 | ✅ (refatoração) | ✅ PT ✅ EN ✅ ES | Tático isométrico Canvas 2D + Cidade Marélia |
| `/games/pesadelo` | PP | `src/pages/PesadeloParticular/PP.jsx` | ✅ v1.7.0 | ✅ 1ª temp. 🔒 | ✅ PT ✅ EN ✅ ES | 20 casos com Supabase save |
| `/games/duelo` | DueloRoute | `src/pages/Duelo/DueloRoute.jsx` | ✅ v1.2.9 | ✅ 1ª temp. 🔒 | ✅ PT ✅ EN ✅ ES | Card game 1v1 vs IA |
| `/games/tamagoshi` | Tamagoshi | `src/pages/Tamagoshi/Tamagoshi.jsx` | ✅ v1.11.0 | ✅ 1ª temp. | ✅ PT ✅ EN ✅ ES | Tamagotchi: ciclo de vida completo |
| `/leaderboard` | Leaderboard | `src/pages/Leaderboard.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Ranking global |
| `/quiz` | Quiz | `src/pages/Quiz.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | 3 modos, banco de perguntas |
| `/login` | Login | `src/pages/Login.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Login Supabase Auth |
| `/cadastro` | Cadastro | `src/pages/Cadastro.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Cadastro de conta |
| `/perfil` | Perfil | `src/pages/Perfil/Perfil.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Hub 6 abas + assinatura Stripe |
| `/admin` | Admin | `src/pages/Admin.jsx` | — | ✅ | ✅ PT ✅ EN ✅ ES | Painel admin exclusivo |

---

## 3. VERSÕES

| Constante | Versão | Arquivo |
|---|---|---|
| `SITE_VERSION` | 4.1 | `src/config/version.js:5` |
| `PP_VERSION` | 1.7.0 | `src/config/version.js:10` |
| `LDI_VERSION` | 1.0.61 | `src/config/version.js:11` |
| `JACK_VERSION` | 5.1.4 | `src/config/version.js:12` |
| `ARENA_VERSION` | 1.7.3 | `src/config/version.js:13` |
| `TAMA_VERSION` | 1.11.0 | `src/config/version.js:14` |
| `DUELO_VERSION` | 1.2.9 | `src/config/version.js:15` |
| `MINIGAMES_VERSION` | 1.3.0 | `src/config/version.js:16` |
| `MP_VERSION` | 1.1.0 | `src/config/version.js:17` |
| `TATICS_VERSION` | 7.0.0 | `src/config/version.js:19` |

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
| `NotificationBalloon` | Balão de notificação |
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
| `011_arena_tatics_roster.sql` | Arena Tatics roster |
| `012_tatics_card_pool.sql` | Card pool + evolução |
| `013_fichas_tables.sql` | Tabelas fichas + fichas_historico |
| `010_profiles_admin_role.sql` | is_admin, role, tier |
| `010_tamagoshi_fix_columns.sql` | Fix colunas |
| `010_stripe_billing.sql` | Stripe subscription |
| `011_arena_tatics_roster.sql` | Roster Tatics |
| `012_tatics_card_pool.sql` | Cartas + evolução (v7.0) |

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

### z-index: SearchModal(2000) > Navbar(1000) > TrialBanner(998) > CookieBanner(200) > NotificationBalloon(150) > ScrollToTop(100) > MusicSection(50)

### Deploy: `npm run build` → `npm run deploy` (gh-pages). `python deploy.py -g <game> -m "desc"` para automação completa.

**Repositório:** https://github.com/lutasdeilusao-cpu/illusionfight-site
**Site:** https://lutasdeilusao-cpu.github.io/illusionfight-site/
