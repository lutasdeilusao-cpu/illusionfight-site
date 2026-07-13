# Graph Report - .  (2026-07-13)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2083 nodes · 5446 edges · 154 communities (138 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `11eac838`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 113
- Community 114
- Community 115
- Community 116
- Community 118
- Community 119
- Community 125

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 366 edges
2. `useAuth()` - 107 edges
3. `useReader()` - 61 edges
4. `SFX` - 58 edges
5. `logEntry()` - 43 edges
6. `AudioManager` - 42 edges
7. `useKpI18n()` - 39 edges
8. `Phase6CombatV2()` - 34 edges
9. `useJackStore` - 32 edges
10. `supabase` - 31 edges

## Surprising Connections (you probably didn't know these)
- `TeamSelect()` --indirect_call--> `eq()`  [INFERRED]
  src/pages/games/ArenaTatics/screens/TeamSelect.jsx → tests/paridade-exata.mjs
- `MusicCircle()` --calls--> `useLanguage()`  [EXTRACTED]
  src/components/MusicSection.jsx → src/context/LanguageContext.jsx
- `ManualBatalha()` --calls--> `useLanguage()`  [EXTRACTED]
  src/pages/games/Arena/ArenaCreate.jsx → src/context/LanguageContext.jsx
- `NeoGuideIntro()` --calls--> `useLanguage()`  [EXTRACTED]
  src/pages/games/Arena/ArenaLobby.jsx → src/context/LanguageContext.jsx
- `HpBarDelta()` --calls--> `useLanguage()`  [EXTRACTED]
  src/pages/games/ArenaTatics/components/CombatResultModal.jsx → src/context/LanguageContext.jsx

## Import Cycles
- None detected.

## Communities (154 total, 16 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (53): KPAIWaitOverlay(), KPDefenseModal(), KPFieldSlot(), KPHandCard(), KPHandoffScreen(), KPInfoBar(), KPInspectModal(), KPIntelModal() (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (45): BattleLog(), Board(), Card(), CardPreviewModal(), Hand(), LPDisplay(), CARDS, getCardByNum() (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (57): BANNER_URLS, BANNERS, HeroSlideshow(), SLIDE_KEYS, BANCO, CONFIGS, prepararUnidades(), PuzzleAnagrama() (+49 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (61): ALLY_TEMPLATES, APUNHALAR_BLEED_CHANCE, areaTargetsPicked, ARMORS, ARROW_DEFAULT_ORDER, ATK_VS_DEF_ATTR, ATTRS, BLEED_EFFECT (+53 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (25): AchievementToast(), BackToGamesBtn(), CharacterCard(), CookieBanner(), TypewriterPhrase(), useLanguage(), usePersonagensAgrupados(), useTypewriter() (+17 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (24): App(), ScrollToTop(), ScrollToTopOnNav(), useAchievements(), useEventos(), ReaderContext, useReader(), chapterLoaders (+16 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (24): DialogoCaso(), PERSONAGEM_STYLE, DICAS, DicaToast(), getDica(), IntroNoir(), PistaCard(), StatusBar() (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (25): CASOS, getInimigo(), INIMIGOS_I18N, PISTAS, casosDisponiveis(), getCaso(), getLocaisParaCaso(), getPistasParaCaso() (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (30): clearHighlight(), CharModal(), applyShake(), drawCanvasFlash(), drawFloatingTexts(), FlashPreset, HitStopPreset, isHitStopActive() (+22 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): hasFlag(), setFlag(), allScenes, filterChoices(), getSceneFromCache(), loadScene(), scenesCache, setScenesLocale() (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (25): GuestNotice(), useAuth(), registrarPontuacaoArenaRanking(), ADV_COSTS, ArenaCreate(), ATTR_EMOJI, ATTRS, DIS_GAINS (+17 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (20): BulletHellRafael(), CFG, hexAlpha(), PuzzleBulletHellRafael(), CodigoPerdido(), DIF_CFG, KEYBOARD_ROWS, pick() (+12 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (24): atualizarStats(), _carregarPosicao(), carregarPosicaoUsuario(), carregarPosicaoUsuarioArena(), carregarPosicaoUsuarioTama(), _carregarRanking(), carregarRankingArena(), carregarRankingTama() (+16 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (20): ArenaCombat(), delay(), getOnomatopeia(), MODE_ICONS, MODE_LABELS, ONOMATOPEIAS_ARMED, ONOMATOPEIAS_FISTS, ONOMATOPEIAS_POWER (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (17): AchievementsContext, AchievementsProvider(), AuthContext, AuthProvider(), DixContext, DixProvider(), EventosContext, EventosProvider() (+9 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (22): atualizarMPStats(), atualizarSala(), carregarMPStats(), codigoSala(), confirmarAposta(), criarSala(), definirAposta(), encerrarSala() (+14 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (12): DUNGEONS, FLAGS, ITENS, MONOLOGUES, DAMAGE_WORDS, Dungeon(), HIT_WORDS, rollD6() (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.19
Nodes (21): DIRECOES, getLineInDirection(), getPersonagensNaLinha(), PowerLinePreview(), acaoFujona(), avancarUmaCasa(), celulaMaisDistante(), inimigoMaisFracoEmAlcance() (+13 more)

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (16): AttackAnimId, RangeAnimId, execute(), execute(), execute(), DefenseAnimId, getDefenseAnimation(), REGISTRY (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (17): CombatResultModal(), HpBarDelta(), TokenMini(), EnemyTurnBanner(), Grid(), Token(), EfeitoTag(), STATUS_ICONS_MAP (+9 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (18): ATTR_LABELS, CharacterSheetView(), WEAPON_NAMES, CombatView(), FRASES_INIMIGO, MODE_ICONS, MODE_LABELS, DiceRollDisplay() (+10 more)

### Community 23 - "Community 23"
Cohesion: 0.19
Nodes (13): ActionMenu(), SkillModal(), CLASSES, getClassesDisponiveis(), EFEITO_AURA, getCorPorElemental(), PALETAS_CORES, ELEMENTAIS (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.15
Nodes (14): agendarAcao(), avancarTurno(), CHAVES_ACAO, criarAcoes(), definirRestricao(), inicializar(), log(), marcarMorto() (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.19
Nodes (14): closeInventoryPanel(), closeSwapPanel(), endRound(), hasEffect(), isBowWeapon(), isDaggerWeapon(), isShieldWeapon(), isSwordWeapon() (+6 more)

### Community 26 - "Community 26"
Cohesion: 0.31
Nodes (23): cancelTargeting(), castMagicArea(), castMagicResolved(), checkBattleEnd(), clearMagicQueue(), endTurn(), hideTargetSelector(), logDivider() (+15 more)

### Community 27 - "Community 27"
Cohesion: 0.16
Nodes (17): FichaGateRoute(), getHoje(), isDesbloqueadoHoje(), ModalConfirmacaoFicha(), ModalSemFichas(), getHoje(), isDesbloqueadoHoje(), marcarDesbloqueado() (+9 more)

### Community 28 - "Community 28"
Cohesion: 0.15
Nodes (15): TrialBanner(), ADMIN_EMAILS, getNomePais(), PAISES, cancelarAssinatura(), getPriceDisplay(), iniciarCheckout(), PRICE_DISPLAY (+7 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (16): PuzzleDecoder(), generateReward(), PUZZLE_CONFIG, PuzzleRouter(), REWARDS, COLORS, PuzzleSimonSays(), generateGoal() (+8 more)

### Community 30 - "Community 30"
Cohesion: 0.15
Nodes (16): BADGES, calcularFase(), DIX_BOAS_VINDAS, TEXTOS_PARTIDA, BARRA_PARA_CAMPO, BASE_DECAY, calcBarra(), calcEstado() (+8 more)

### Community 31 - "Community 31"
Cohesion: 0.18
Nodes (25): applyBleed(), applyBleedNoStack(), applyCounterAttack(), applyDamage(), applyEffect(), applyMagicEffect(), applySupport(), atkBonus() (+17 more)

### Community 32 - "Community 32"
Cohesion: 0.13
Nodes (14): externalMap, Footer(), routeMap, LOCALES, Navbar(), SOCIAL_LINKS, SocialBar(), SITE_CONFIG (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (17): DanoPopup(), TurnoIndicator(), resolverAcaoIA(), aplicarStatus(), FX_INFO, podeAgir(), processarStatus(), resolverAtaque() (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.19
Nodes (17): bgCarta(), CARD_IMAGES, DECK_CONFIG, DECK_LABELS, DeckBuilder(), bgCarta(), CARD_IMAGES, DeckStartModal() (+9 more)

### Community 35 - "Community 35"
Cohesion: 0.19
Nodes (16): PERSONALIDADES, getPersonalidadePorId(), PERSONALIDADES_IA, acaoPersistente(), calcularPassos(), inimigoMenorHP(), melhorPoderParaAtaque(), podeAtacarAlvo() (+8 more)

### Community 36 - "Community 36"
Cohesion: 0.13
Nodes (14): execute(), ONOMATOPEIAS, execute(), ONOMATOPEIAS, execute(), ONOMATOPEIAS, getAttackAnimation(), getRangeAnimation() (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (14): getFala(), Alimentar(), Banhar(), Brincadeira(), getConfig(), PUZZLES, Criatura(), Loja() (+6 more)

### Community 38 - "Community 38"
Cohesion: 0.17
Nodes (11): PowerChoiceModal(), ELEM_ICON, PowerCard(), PowerDescription(), ELEMENTOS, PowerFilterBar(), PowerGrid(), SortToggle() (+3 more)

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (12): CharactersRow(), LatestEpisodes(), thumbMap, allImages, MusicCircle(), MusicSection(), shuffleArray(), NowLive() (+4 more)

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (16): OnomaPopup(), PowerReveal(), PP, t(), aliveEnemySide(), alivePlayerSide(), ARROWS, getAreaTargets() (+8 more)

### Community 41 - "Community 41"
Cohesion: 0.20
Nodes (15): estaNoPool(), getCartaInfo(), getKarauksDisponiveis(), getMorakiOuTivaraDisponiveis(), getPool(), poolCompleto(), sortearCartaInicial1(), sortearCartaInicial2() (+7 more)

### Community 42 - "Community 42"
Cohesion: 0.21
Nodes (15): ArenaTestbed(), FaseArena, ModoJogo, ORDEM_FASES, carregarFichas(), deletarFicha(), escreverNoStorage(), gerarId() (+7 more)

### Community 43 - "Community 43"
Cohesion: 0.19
Nodes (11): BookChaptersRow(), capaMap, formatarData(), SearchModal(), estaDisponivel(), index, formatarData(), Livro() (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (10): TEMPLATES, TopTrumpsCard(), ATTR_META, CARD_LABELS, BurstParticles(), CurtainReveal(), FireParticles(), GameScreen() (+2 more)

### Community 45 - "Community 45"
Cohesion: 0.16
Nodes (12): carregarDeck(), DECKS, getDeck(), ATTR_KEYS, bgCarta(), CARD_IMAGES, CardViewerModal(), attrNomeKey() (+4 more)

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (15): STATUS_ICONS, StatusBar(), sortearIAs(), podeMover(), temStatus(), Batalha(), calcularCaminho(), getAlcanceMovimento() (+7 more)

### Community 47 - "Community 47"
Cohesion: 0.19
Nodes (13): getPoderesDisponiveis(), getPoderesPorId(), PODERES_BASE, temPoderDisponivel(), getCelulasAlcance(), executarMecanica(), MECANICAS, TipoAcao (+5 more)

### Community 48 - "Community 48"
Cohesion: 0.21
Nodes (12): useDix(), useFichas(), PerfilArena(), PerfilConquistas(), MOTIVO_KEY_MAP, Recompensas(), Perfil(), SECOES (+4 more)

### Community 49 - "Community 49"
Cohesion: 0.12
Nodes (16): CACADOR, CONTROLADOR, COVARDE, ESPELHO, ESTRATEGISTA, EXTERMINADOR, KAMIKAZE, MISTICO (+8 more)

### Community 50 - "Community 50"
Cohesion: 0.13
Nodes (15): CRIATURAS, CRIATURAS_BASE, SPRITE_1, SPRITE_10, SPRITE_2, SPRITE_3, SPRITE_4, SPRITE_5 (+7 more)

### Community 51 - "Community 51"
Cohesion: 0.18
Nodes (11): executar(), init(), primitivos, _refs, EFFECTS_MAP, emit(), listeners, off() (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.16
Nodes (9): CHOICES, EMOJI, Jokempo(), GameOverScreen(), ONOMATOPEIAS, useGameEffects(), useTopTrumpsSP(), CARD_IMAGES (+1 more)

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (11): migrarLocalStorageParaSupabase(), salvarCartasDeck(), substituirDeck(), usePresence(), attrNomeKey(), bgCarta(), CARD_IMAGES, embaralhar() (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (13): decidirAcaoIA(), calcularFA(), calcularFD(), criarPersonagem(), getCasasMovimento(), getHP(), getMP(), resolverAtaque() (+5 more)

### Community 55 - "Community 55"
Cohesion: 0.19
Nodes (14): bump_version(), _cmd_to_str(), get_version(), main(), deploy.py -- Automate the full LDI workflow: version bump -> build -> commit ->, Read the current version string from a source file., Bump a semver string: '1.2.3' + 'patch' -> '1.2.4'., In-place replace the version string in a source file (line containing the const) (+6 more)

### Community 56 - "Community 56"
Cohesion: 0.13
Nodes (15): gh-pages, devDependencies, gh-pages, pg, @playwright/test, @types/react, @types/react-dom, vite (+7 more)

### Community 57 - "Community 57"
Cohesion: 0.13
Nodes (15): dependencies, pixi.js, playwright, react-dom, react-markdown, @supabase/supabase-js, @vitejs/plugin-react-oxc, zustand (+7 more)

### Community 58 - "Community 58"
Cohesion: 0.15
Nodes (4): platformIconMap, allImages, Musicas(), shuffleArray()

### Community 59 - "Community 59"
Cohesion: 0.32
Nodes (12): CityHUD(), DISTRITOS, getBuildingAt(), getBuildingRedSquareRange(), getExitAt(), getExitRedSquareRange(), getNpcAt(), getTileColorName() (+4 more)

### Community 60 - "Community 60"
Cohesion: 0.21
Nodes (10): BalloonFala(), CriaturaSprite(), ESTADO_ANIM, MetricBar(), COMIDA_TEMATICA, ITEM_KEY_MAP, ITENS_LOJA, getCtx() (+2 more)

### Community 61 - "Community 61"
Cohesion: 0.16
Nodes (13): FALAS_CRIATURA, FALAS_CRIATURA, FALAS_CRIATURA, getPasseio(), PASSEIO_KEY_MAP, PASSEIOS, FALAS_MAP, PERS_NOME_KEY (+5 more)

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (10): gerarGrid(), drawHex(), hexCenter(), hexCorner(), pixelToHex(), SQRT3, useHexCanvas(), OBS3_HP_OPTIONS (+2 more)

### Community 63 - "Community 63"
Cohesion: 0.26
Nodes (9): DATA, GROUP_LABELS, GROUP_ORDER, usePersonagem(), usePersonagens(), dataMap, Mundo(), PROTAGONIST_IDS (+1 more)

### Community 64 - "Community 64"
Cohesion: 0.24
Nodes (10): GameControls(), BuildingInterior(), buildInterior(), EXIT_ZONE, getInteriorColliders(), getInteriorZone(), INTERIOR_NAMES, interiorSpawns (+2 more)

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (10): captureEmailFromDialog(), CSV_PATH, csvEncode(), __dirname, extractEmailFromPage(), main(), parseCSV(), RESULTS_PATH (+2 more)

### Community 66 - "Community 66"
Cohesion: 0.29
Nodes (7): ArenaTaticsRoute(), randomPick(), getDescricaoIA(), TODAS_IAS, EMOJI, SimulacaoAuto(), useCityStore

### Community 67 - "Community 67"
Cohesion: 0.27
Nodes (10): dentroDoLosango(), drawChar(), ELEM_CORES, elemCor(), encontrarTile(), GridCanvas(), isoToScreen(), MM_C (+2 more)

### Community 68 - "Community 68"
Cohesion: 0.31
Nodes (9): ACESSORIOS, ARMADURAS, ARMES, calcularBonus(), getAllEquipamentos(), getEquipamento(), ELEM_COR, EMOJI (+1 more)

### Community 69 - "Community 69"
Cohesion: 0.27
Nodes (10): aplicarBonusEvolucao(), aplicarBonusHpSp(), BASE_L1, calcAtributosNoNivel(), construirPersonagemNivelado(), getSkillsEvolutivas(), getSkillsNoNivel(), SKILL_SLOTS (+2 more)

### Community 70 - "Community 70"
Cohesion: 0.36
Nodes (7): CIDADES, getCidade(), getCidadeNavegacao(), getLocaisVisiveis(), NPCS, MainMenu(), Vila()

### Community 71 - "Community 71"
Cohesion: 0.25
Nodes (8): ChoiceList(), container, itemAnim, SceneView(), detectarPrefixo(), isFala(), PERSONAGEM_STYLE, Typewriter()

### Community 72 - "Community 72"
Cohesion: 0.22
Nodes (3): calcAtkWithTerrain(), calcDefWithTerrain(), getTerrainMods()

### Community 73 - "Community 73"
Cohesion: 0.29
Nodes (6): LDINotification(), PERSONAGENS, shuffle(), UnifiedNotification(), notificationManager, NotificationType

### Community 74 - "Community 74"
Cohesion: 0.24
Nodes (4): calcAtkWithTerrain(), calcDefWithTerrain(), eq(), getTerrainMods()

### Community 75 - "Community 75"
Cohesion: 0.36
Nodes (7): LoginGate(), calcularRank(), embaralhar(), gerarDicaGangue(), MODOS, Quiz(), selecionarPerguntas()

### Community 76 - "Community 76"
Cohesion: 0.36
Nodes (8): ADMIN_EMAILS, getGreetingKey(), getNinaSessionState(), loadYoutubeApi(), NinaMusicPlayer(), onYoutubeApi(), readyListeners, setNinaSessionState()

### Community 77 - "Community 77"
Cohesion: 0.28
Nodes (7): CFG, MazeRafael(), MSGS_FAIL, MSGS_OK, opposite(), PuzzleMazeRafael(), shuffleArr()

### Community 78 - "Community 78"
Cohesion: 0.31
Nodes (8): corDisponivel(), CORES_DISPONIVEIS, getCoresDisponiveis(), getNomesDisponiveis(), nomeDisponivel(), NOMES_DISPONIVEIS, podeAdicionarPersonagemABatalha(), Phase2Customize()

### Community 79 - "Community 79"
Cohesion: 0.28
Nodes (9): applyDisease(), clearLog(), DISEASE_STAGES, getEffectiveMaxHP(), initBattle(), pickRandomEnemies(), processDiseaseProgression(), restartBattle() (+1 more)

### Community 80 - "Community 80"
Cohesion: 0.46
Nodes (5): badgeCorClass(), ProdutoDigitalCard(), ShopSection(), iniciarCheckoutLoja(), Loja()

### Community 81 - "Community 81"
Cohesion: 0.29
Nodes (7): scripts, build, deploy, dev, migration, predeploy, preview

### Community 82 - "Community 82"
Cohesion: 0.29
Nodes (6): en, enDesc, es, esDesc, pt, ptNomes

### Community 83 - "Community 83"
Cohesion: 0.57
Nodes (4): FRASES, getFrase(), PALETTES, ResultCard()

### Community 84 - "Community 84"
Cohesion: 0.33
Nodes (3): _cleanupGlobals(), teardownGame(), SRGRM()

### Community 85 - "Community 85"
Cohesion: 0.48
Nodes (5): CLASS_TREE, getEvolucaoAtiva(), getNo(), getNomeClasse(), EvolutionScreen()

### Community 86 - "Community 86"
Cohesion: 0.38
Nodes (6): Create(), ADVANTAGES, ATTR_TOOLTIPS, DISADVANTAGES, PERKS, SPECIALIZATIONS

### Community 87 - "Community 87"
Cohesion: 0.38
Nodes (6): ACOES, gerarBolhas(), gerarParticulas(), ITEM_EMOJI, ITENS_SAUDE, RestaurarSaude()

### Community 88 - "Community 88"
Cohesion: 0.52
Nodes (6): dismissCookie(), GAMES, run(), sleep(), startServer(), testGame()

### Community 89 - "Community 89"
Cohesion: 0.24
Nodes (10): Combat(), drawer, ManualDrawer(), ACHIEVEMENTS, End(), END_MESSAGES, ATTR_KEYS, Game() (+2 more)

### Community 90 - "Community 90"
Cohesion: 0.53
Nodes (5): CRIATURAS_T1_GACHA, Gacha(), isFreeSpinUsed(), marcarFreeSpinUsado(), sortearT1()

### Community 91 - "Community 91"
Cohesion: 0.33
Nodes (4): PRICE_TO_TIER, stripe, supabase, webhookSecret

### Community 92 - "Community 92"
Cohesion: 0.60
Nodes (5): analyzeGame(), dismissCookie(), GAMES, main(), sleep()

### Community 93 - "Community 93"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 94 - "Community 94"
Cohesion: 0.60
Nodes (4): decodeCd(), main(), slug(), URLS

### Community 95 - "Community 95"
Cohesion: 0.40
Nodes (3): DIST_DIR, INDEX_PATH, ROUTES

### Community 96 - "Community 96"
Cohesion: 0.70
Nodes (3): HeroEffect(), randomBetween(), useHeroEffect()

### Community 97 - "Community 97"
Cohesion: 0.32
Nodes (12): aiAct(), DAMAGE_TIERS, damageSpellAvailable(), damageSpellCost(), HEAL_TIERS, healSpellAvailable(), isCajadoWeapon(), mpCostQueue() (+4 more)

### Community 100 - "Community 100"
Cohesion: 0.50
Nodes (3): ADMIN_ROUTES, AUTH_ROUTES, PUBLIC_ROUTES

### Community 101 - "Community 101"
Cohesion: 0.67
Nodes (3): ENEMIES_BY_TIER, gerarTimeInimigo(), getInimigoPorSDR()

### Community 102 - "Community 102"
Cohesion: 0.48
Nodes (6): CFG, generateBoard(), getNeighbors(), isSolved(), PuzzleSlidingRafael(), SlidingRafael()

### Community 103 - "Community 103"
Cohesion: 0.50
Nodes (3): ALLOWED_PRICE_IDS, stripe, supabase

## Knowledge Gaps
- **341 isolated node(s):** `PUBLIC_ROUTES`, `AUTH_ROUTES`, `ADMIN_ROUTES`, `name`, `private` (+336 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 23`, `Community 27`, `Community 28`, `Community 30`, `Community 32`, `Community 33`, `Community 34`, `Community 37`, `Community 38`, `Community 39`, `Community 42`, `Community 43`, `Community 45`, `Community 46`, `Community 48`, `Community 50`, `Community 52`, `Community 53`, `Community 54`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 66`, `Community 70`, `Community 73`, `Community 75`, `Community 76`, `Community 77`, `Community 78`, `Community 80`, `Community 83`, `Community 85`, `Community 86`, `Community 87`, `Community 89`, `Community 90`, `Community 102`?**
  _High betweenness centrality (0.340) - this node is a cross-community bridge._
- **Why does `useReader()` connect `Community 7` to `Community 0`, `Community 1`, `Community 66`, `Community 2`, `Community 37`, `Community 102`, `Community 8`, `Community 42`, `Community 12`, `Community 13`, `Community 77`, `Community 17`, `Community 52`, `Community 53`, `Community 84`, `Community 89`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `SFX` connect `Community 6` to `Community 34`, `Community 102`, `Community 12`, `Community 77`, `Community 13`, `Community 15`, `Community 45`, `Community 17`, `Community 52`, `Community 53`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `PUBLIC_ROUTES`, `AUTH_ROUTES`, `ADMIN_ROUTES` to the rest of the system?**
  _341 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05016722408026756 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.056140350877192984 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05257312106627175 - nodes in this community are weakly interconnected._