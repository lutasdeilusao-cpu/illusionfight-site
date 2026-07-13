# Graph Report - SiteLDI  (2026-07-13)

## Corpus Check
- 653 files · ~755,104 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2200 nodes · 5551 edges · 161 communities (142 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `041b9556`
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
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- extraction-spec.md

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
- `OnomaPopup()` --indirect_call--> `t()`  [INFERRED]
  src/pages/games/Arena/ArenaCombat.jsx → src/pages/games/PesadeloParticular/data/pp-i18n.js
- `PowerReveal()` --indirect_call--> `t()`  [INFERRED]
  src/pages/games/Arena/ArenaCombat.jsx → src/pages/games/PesadeloParticular/data/pp-i18n.js
- `MusicCircle()` --calls--> `useLanguage()`  [EXTRACTED]
  src/components/MusicSection.jsx → src/context/LanguageContext.jsx
- `ManualBatalha()` --calls--> `useLanguage()`  [EXTRACTED]
  src/pages/games/Arena/ArenaCreate.jsx → src/context/LanguageContext.jsx

## Import Cycles
- None detected.

## Communities (161 total, 19 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (53): KPAIWaitOverlay(), KPDefenseModal(), KPFieldSlot(), KPHandCard(), KPHandoffScreen(), KPInfoBar(), KPInspectModal(), KPIntelModal() (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (45): BattleLog(), Board(), Card(), CardPreviewModal(), Hand(), LPDisplay(), StatusBar(), CARDS (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (23): BANCO, CONFIGS, prepararUnidades(), PuzzleAnagrama(), shuffleArray(), CONFIGS, gerarAlvo(), PuzzleDecoder() (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (59): ALLY_TEMPLATES, APUNHALAR_BLEED_CHANCE, areaTargetsPicked, ARMORS, ARROW_DEFAULT_ORDER, ATK_VS_DEF_ATTR, ATTRS, BLEED_EFFECT (+51 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (14): BackToGamesBtn(), randomPick(), Derrota(), Intro(), LINES_EN, LINES_ES, LINES_PT, Vitoria() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (40): App(), CookieBanner(), ScrollToTop(), ScrollToTopOnNav(), ReaderContext, ReaderProvider(), useReader(), ArenaTaticsRoute() (+32 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (24): DialogoCaso(), PERSONAGEM_STYLE, DICAS, DicaToast(), getDica(), IntroNoir(), PistaCard(), StatusBar() (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (24): CASOS, getInimigo(), INIMIGOS_I18N, PISTAS, casosDisponiveis(), getCaso(), getLocaisParaCaso(), getPistasParaCaso() (+16 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (30): clearHighlight(), CharModal(), applyShake(), drawCanvasFlash(), drawFloatingTexts(), FlashPreset, HitStopPreset, isHitStopActive() (+22 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): hasFlag(), setFlag(), allScenes, filterChoices(), getSceneFromCache(), loadScene(), scenesCache, setScenesLocale() (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (21): ADV_COSTS, ArenaCreate(), ATTR_EMOJI, ATTRS, DIS_GAINS, MANUAL_KEYS, ManualBatalha(), PERK_COSTS (+13 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (28): CFG, hexAlpha(), PuzzleBulletHellRafael(), DIF_CFG, KEYBOARD_ROWS, pick(), PuzzleCodigoPerdido(), CFG (+20 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (23): getNomePais(), PAISES, atualizarStats(), _carregarPosicao(), carregarPosicaoUsuario(), carregarPosicaoUsuarioArena(), carregarPosicaoUsuarioTama(), _carregarRanking() (+15 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (22): ArenaCombat(), delay(), getOnomatopeia(), MODE_ICONS, MODE_LABELS, OnomaPopup(), ONOMATOPEIAS_ARMED, ONOMATOPEIAS_FISTS (+14 more)

### Community 16 - "Community 16"
Cohesion: 0.11
Nodes (30): GuestNotice(), LoginGate(), AchievementsContext, AchievementsProvider(), useAchievements(), AuthContext, AuthProvider(), useAuth() (+22 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (23): atualizarMPStats(), atualizarSala(), carregarMPStats(), codigoSala(), confirmarAposta(), criarSala(), definirAposta(), encerrarSala() (+15 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (12): DUNGEONS, FLAGS, ITENS, MONOLOGUES, DAMAGE_WORDS, Dungeon(), HIT_WORDS, rollD6() (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (23): DIRECOES, getLineInDirection(), getPersonagensNaLinha(), PowerLinePreview(), acaoFujona(), avancarUmaCasa(), celulaMaisDistante(), inimigoMaisFracoEmAlcance() (+15 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (10): AttackAnimId, RangeAnimId, execute(), execute(), execute(), DefenseAnimId, getDefenseAnimation(), REGISTRY (+2 more)

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
Cohesion: 0.14
Nodes (15): agendarAcao(), avancarTurno(), CHAVES_ACAO, criarAcoes(), definirRestricao(), inicializar(), log(), marcarMorto() (+7 more)

### Community 25 - "Community 25"
Cohesion: 0.24
Nodes (11): ARROWS, closeInventoryPanel(), closeSwapPanel(), getActiveArrow(), getActiveArrowName(), isBowWeapon(), isDaggerWeapon(), isSwordWeapon() (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (22): cancelTargeting(), castMagicArea(), castMagicResolved(), checkBattleEnd(), clearMagicQueue(), endTurn(), hideTargetSelector(), logDivider() (+14 more)

### Community 27 - "Community 27"
Cohesion: 0.08
Nodes (34): FichaGateRoute(), getHoje(), isDesbloqueadoHoje(), ModalConfirmacaoFicha(), ModalSemFichas(), useDix(), ADMIN_EMAILS, FICHAS_POR_TIER (+26 more)

### Community 28 - "Community 28"
Cohesion: 0.13
Nodes (20): badgeCorClass(), ProdutoDigitalCard(), ShopSection(), TrialBanner(), ADMIN_EMAILS, cancelarAssinatura(), getPriceDisplay(), iniciarCheckout() (+12 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (16): PuzzleDecoder(), generateReward(), PUZZLE_CONFIG, PuzzleRouter(), REWARDS, COLORS, PuzzleSimonSays(), generateGoal() (+8 more)

### Community 30 - "Community 30"
Cohesion: 0.16
Nodes (15): BADGES, DIX_BOAS_VINDAS, TEXTOS_PARTIDA, BARRA_PARA_CAMPO, BASE_DECAY, calcBarra(), calcEstado(), defaultState (+7 more)

### Community 31 - "Community 31"
Cohesion: 0.35
Nodes (13): applyCounterAttack(), applyDamage(), atkBonus(), calcRawDmg(), calcRawDmgWithArrow(), defBonus(), getAttrTestMod(), getEffectMod() (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.13
Nodes (14): externalMap, Footer(), routeMap, LOCALES, Navbar(), SOCIAL_LINKS, SocialBar(), SITE_CONFIG (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.19
Nodes (17): DanoPopup(), resolverAcaoIA(), aplicarStatus(), FX_INFO, podeAgir(), podeMover(), processarStatus(), resolverAtaque() (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.19
Nodes (17): bgCarta(), CARD_IMAGES, DECK_CONFIG, DECK_LABELS, DeckBuilder(), bgCarta(), CARD_IMAGES, DeckStartModal() (+9 more)

### Community 35 - "Community 35"
Cohesion: 0.21
Nodes (15): PERSONALIDADES, getPersonalidadePorId(), PERSONALIDADES_IA, acaoPersistente(), calcularPassos(), inimigoMenorHP(), melhorPoderParaAtaque(), podeAtacarAlvo() (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.13
Nodes (14): execute(), ONOMATOPEIAS, execute(), ONOMATOPEIAS, execute(), ONOMATOPEIAS, getAttackAnimation(), getRangeAnimation() (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (8): calcularFase(), Alimentar(), Loja(), Ovo(), Passear(), Termo(), useTamagoshiStore, Tamagoshi()

### Community 38 - "Community 38"
Cohesion: 0.17
Nodes (11): PowerChoiceModal(), ELEM_ICON, PowerCard(), PowerDescription(), ELEMENTOS, PowerFilterBar(), PowerGrid(), SortToggle() (+3 more)

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (12): CharactersRow(), LatestEpisodes(), thumbMap, allImages, MusicCircle(), MusicSection(), shuffleArray(), NowLive() (+4 more)

### Community 40 - "Community 40"
Cohesion: 0.20
Nodes (9): PP, t(), getItemDef(), ITEMS_CONSUMABLE, renderAreaTwoButtons(), selectItemUse(), showInventoryTargetSelector(), showTab() (+1 more)

### Community 41 - "Community 41"
Cohesion: 0.12
Nodes (26): estaNoPool(), getCartaInfo(), getKarauksDisponiveis(), getMorakiOuTivaraDisponiveis(), getPool(), poolCompleto(), sortearCartaInicial1(), sortearCartaInicial2() (+18 more)

### Community 42 - "Community 42"
Cohesion: 0.21
Nodes (15): ArenaTestbed(), FaseArena, ModoJogo, ORDEM_FASES, carregarFichas(), deletarFicha(), escreverNoStorage(), gerarId() (+7 more)

### Community 43 - "Community 43"
Cohesion: 0.19
Nodes (11): BookChaptersRow(), capaMap, formatarData(), SearchModal(), estaDisponivel(), index, formatarData(), Livro() (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.13
Nodes (13): TEMPLATES, TopTrumpsCard(), ATTR_META, CARD_LABELS, attrNomeKey(), BurstParticles(), CurtainReveal(), FireParticles() (+5 more)

### Community 45 - "Community 45"
Cohesion: 0.31
Nodes (7): carregarDeck(), ATTR_KEYS, bgCarta(), CARD_IMAGES, CardViewerModal(), CARD_IMAGES, PerfilColecao()

### Community 46 - "Community 46"
Cohesion: 0.17
Nodes (15): ConfirmEndTurn(), STATUS_ICONS, StatusBar(), TurnoIndicator(), sortearIAs(), Batalha(), calcularCaminho(), getAlcanceMovimento() (+7 more)

### Community 47 - "Community 47"
Cohesion: 0.23
Nodes (11): getPoderesDisponiveis(), getPoderesPorId(), PODERES_BASE, temPoderDisponivel(), executarMecanica(), MECANICAS, aplicarOrdemInterna(), aplicarResultadosCruzados() (+3 more)

### Community 48 - "Community 48"
Cohesion: 0.11
Nodes (24): AchievementToast(), TypewriterPhrase(), useLanguage(), useTypewriter(), TrapActivator(), Monologue(), getTelefonema(), TELEFONEMA_PADRAO (+16 more)

### Community 49 - "Community 49"
Cohesion: 0.10
Nodes (20): CACADOR, CONTROLADOR, COVARDE, ESPELHO, ESTRATEGISTA, EXTERMINADOR, getDescricaoIA(), KAMIKAZE (+12 more)

### Community 50 - "Community 50"
Cohesion: 0.15
Nodes (12): CRIATURAS_BASE, SPRITE_1, SPRITE_10, SPRITE_2, SPRITE_3, SPRITE_4, SPRITE_5, SPRITE_6 (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.18
Nodes (11): executar(), init(), primitivos, _refs, EFFECTS_MAP, emit(), listeners, off() (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 53 - "Community 53"
Cohesion: 0.13
Nodes (19): CHOICES, EMOJI, Jokempo(), carregarTentativas(), consumirTentativa(), marcarCartaGanha(), salvarCartasDeck(), substituirDeck() (+11 more)

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
Cohesion: 0.25
Nodes (13): CityHUD(), DISTRITOS, getBuildingAt(), getBuildingRedSquareRange(), getExitAt(), getExitRedSquareRange(), getNpcAt(), getTileColorName() (+5 more)

### Community 60 - "Community 60"
Cohesion: 0.26
Nodes (9): CriaturaSprite(), ESTADO_ANIM, COMIDA_TEMATICA, ITEM_KEY_MAP, ITENS_LOJA, Banhar(), getCtx(), sfx (+1 more)

### Community 61 - "Community 61"
Cohesion: 0.15
Nodes (14): FALAS_CRIATURA, FALAS_CRIATURA, FALAS_CRIATURA, getPasseio(), PASSEIO_KEY_MAP, PASSEIOS, FALAS_MAP, PERS_NOME_KEY (+6 more)

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (10): gerarGrid(), drawHex(), hexCenter(), hexCorner(), pixelToHex(), SQRT3, useHexCanvas(), OBS3_HP_OPTIONS (+2 more)

### Community 63 - "Community 63"
Cohesion: 0.20
Nodes (12): CharacterCard(), DATA, GROUP_LABELS, GROUP_ORDER, usePersonagem(), usePersonagens(), usePersonagensAgrupados(), dataMap (+4 more)

### Community 64 - "Community 64"
Cohesion: 0.24
Nodes (10): GameControls(), BuildingInterior(), buildInterior(), EXIT_ZONE, getInteriorColliders(), getInteriorZone(), INTERIOR_NAMES, interiorSpawns (+2 more)

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (10): captureEmailFromDialog(), CSV_PATH, csvEncode(), __dirname, extractEmailFromPage(), main(), parseCSV(), RESULTS_PATH (+2 more)

### Community 66 - "Community 66"
Cohesion: 0.09
Nodes (22): 1. ESTRUTURA DE PASTAS, 2. PÁGINAS E ROTAS, 3. VERSÕES, 4. COMPONENTES GLOBAIS (App.jsx), 5. STRIPE / ASSINATURAS, 6. SUPABASE, 7. TAMAGOSHI — Detalhamento, 8. NOTAS TÉCNICAS (+14 more)

### Community 67 - "Community 67"
Cohesion: 0.27
Nodes (10): dentroDoLosango(), drawChar(), ELEM_CORES, elemCor(), encontrarTile(), GridCanvas(), isoToScreen(), MM_C (+2 more)

### Community 68 - "Community 68"
Cohesion: 0.31
Nodes (9): ACESSORIOS, ARMADURAS, ARMES, calcularBonus(), getAllEquipamentos(), getEquipamento(), ELEM_COR, EMOJI (+1 more)

### Community 69 - "Community 69"
Cohesion: 0.19
Nodes (16): BANNER_URLS, BANNERS, HeroSlideshow(), SLIDE_KEYS, bfsPath(), gerarLabirinto(), MAZE_CONFIGS, PuzzleLabirinto() (+8 more)

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
Cohesion: 0.12
Nodes (16): AGENTS.md — Illusion Fight Site, Architecture notes, Conduct rules, 🤖 Custom Agents, Decisões e Hurdles Documentados, Deploy commands (must run in this order), Environment, Este documento é trabalho em progresso (+8 more)

### Community 76 - "Community 76"
Cohesion: 0.36
Nodes (8): ADMIN_EMAILS, getGreetingKey(), getNinaSessionState(), loadYoutubeApi(), NinaMusicPlayer(), onYoutubeApi(), readyListeners, setNinaSessionState()

### Community 77 - "Community 77"
Cohesion: 0.12
Nodes (16): 0. Antes de qualquer grep amplo — consultar o Graphify, 10. Decisões e Hurdles, 11. Infraestrutura, 12. Conduct Rules, 1. Filosofia, 2. Stack & Ambiente, 3. Workflow Obrigatório, 4. Layout & CSS (+8 more)

### Community 78 - "Community 78"
Cohesion: 0.31
Nodes (8): corDisponivel(), CORES_DISPONIVEIS, getCoresDisponiveis(), getNomesDisponiveis(), nomeDisponivel(), NOMES_DISPONIVEIS, podeAdicionarPersonagemABatalha(), Phase2Customize()

### Community 79 - "Community 79"
Cohesion: 0.13
Nodes (27): applyBleed(), applyBleedNoStack(), applyDisease(), applyEffect(), applyMagicEffect(), applySupport(), castMagic(), clearLog() (+19 more)

### Community 80 - "Community 80"
Cohesion: 0.29
Nodes (6): BalloonFala(), MetricBar(), CRIATURAS, Criatura(), Partida(), TIPO_PARA_KEY

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
Cohesion: 0.27
Nodes (6): getMovementAnimation(), MovementAnimId, REGISTRY, execute(), execute(), execute()

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
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

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
Cohesion: 0.21
Nodes (17): aiAct(), aliveEnemySide(), alivePlayerSide(), DAMAGE_TIERS, damageSpellAvailable(), damageSpellCost(), getAreaTargets(), HEAL_TIERS (+9 more)

### Community 100 - "Community 100"
Cohesion: 0.50
Nodes (3): ADMIN_ROUTES, AUTH_ROUTES, PUBLIC_ROUTES

### Community 101 - "Community 101"
Cohesion: 0.67
Nodes (3): ENEMIES_BY_TIER, gerarTimeInimigo(), getInimigoPorSDR()

### Community 102 - "Community 102"
Cohesion: 0.33
Nodes (6): CooldownTimer(), getFala(), Brincadeira(), getConfig(), PUZZLES, Luto()

### Community 103 - "Community 103"
Cohesion: 0.50
Nodes (3): ALLOWED_PRICE_IDS, stripe, supabase

### Community 154 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 155 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 156 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 157 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **430 isolated node(s):** `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)`, `Step 1 - Ensure graphify is installed`, `Step 2 - Detect files` (+425 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Community 48` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 23`, `Community 27`, `Community 28`, `Community 30`, `Community 32`, `Community 34`, `Community 37`, `Community 38`, `Community 39`, `Community 42`, `Community 43`, `Community 44`, `Community 45`, `Community 46`, `Community 49`, `Community 53`, `Community 54`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 69`, `Community 70`, `Community 73`, `Community 76`, `Community 78`, `Community 80`, `Community 83`, `Community 85`, `Community 86`, `Community 87`, `Community 90`, `Community 102`?**
  _High betweenness centrality (0.339) - this node is a cross-community bridge._
- **Why does `SFX` connect `Community 6` to `Community 34`, `Community 12`, `Community 45`, `Community 13`, `Community 15`, `Community 44`, `Community 17`, `Community 53`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `useReader()` connect `Community 7` to `Community 0`, `Community 1`, `Community 4`, `Community 37`, `Community 8`, `Community 42`, `Community 12`, `Community 13`, `Community 16`, `Community 48`, `Community 17`, `Community 53`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)` to the rest of the system?**
  _430 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05016722408026756 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05536568694463431 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11088709677419355 - nodes in this community are weakly interconnected._