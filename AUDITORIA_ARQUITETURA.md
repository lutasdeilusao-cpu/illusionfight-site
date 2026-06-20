# Auditoria de Arquitetura — Arquivos com 300+ linhas

> **Data:** 2026-06-19 21:08
> **Regra:** AGENTS.md §124 — "Todo arquivo tocado com mais de 300 linhas deve ser avaliado para extração antes de adicionar mais código."
> **Total de arquivos:** 80 acima do limite de 300 linhas

---

## 1. COMPONENTES/PÁGINAS MONOLÍTICOS (300+ linhas, misturam UI + lógica)

Estes são os candidatos prioritários para refatoração. Cada um mescla renderização, estado, efeitos colaterais e dados inline.

| Prioridade | Linhas | Arquivo | Descrição | Sugestão de Extração |
|-----------|--------|---------|-----------|----------------------|
| 🔴 **ALTA** | 1545 | pages/Prototype/ArenaTestbed/components/Phase3Combat.jsx | Combate hex-grid com engine inline + canvas + Jokenpo + modal | Extrair engine de combate (ataque/movimento/AI) para arquivo separado; extrair CharInfoModal |
| 🔴 **ALTA** | 1398 | pages/PesadeloParticular/PP.jsx | Jogo detetive completo: feed, mensagens, stories, telefonema, puzzles | Extrair PhoneCall overlay; extrair StoryViewer para pistas narrativas |
| 🔴 **ALTA** | 1090 | pages/TopTrumps.jsx | Top Trumps SP: menu, seleção de carta, rodadas, AI, placar, Supabase | Extrair RoundScreen (seleção + comparação + resultado); extrair RelatorioScreen |
| 🔴 **ALTA** | 955 | pages/Duelo/DueloRoute.jsx | Orquestrador do Duelo: coin toss, fases, AI, vitória/derrota | Extrair CoinTossAnimation; extrair painel de botões de ação por fase |
| 🔴 **ALTA** | 883 | pages/TopTrumpsMP.jsx | Multiplayer: sala, PPT, cartas, heartbeat, lobby/finish inline | Extrair PPT selection panel; extrair round UI do lobby |
| 🔴 **ALTA** | 869 | pages/Arena/ArenaCombat.jsx | Combate turno-a-turno: trash talk, modos de ataque, dados dramáticos | Extrair ChatLog (trash talk); extrair DramaticDice como wrapper |
| 🔴 **ALTA** | 824 | pages/ArenaTatics/screens/BuildingInterior.jsx | Exploração interior: canvas, NPC, itens, dados de layout inline | Extrair definições de layout para data file; extrair NpcDialog |
| 🔴 **ALTA** | 783 | pages/ArenaTatics/screens/Batalha.jsx | Combate tático grid: menu de ação, skill targeting, AI, status | Extrair CombatActionController; extrair lógica AI para engine |
| 🟡 **MÉDIA** | 533 | pages/LDI/Create.jsx | Wizard de criação de personagem multi-etapas | Extrair cada etapa em StepName, StepAttrs, StepElemental; extrair ManualBatalha |
| 🟡 **MÉDIA** | 530 | pages/JackCandy/screens/Dungeon.jsx | Dungeon com encontros, monólogos, auto-mode, inventário | Extrair EncounterPanel; extrair auto-mode runner para hook |
| 🟡 **MÉDIA** | 477 | pages/LDI/components/CombatView.jsx | Display de combate LDI: ações, dados, dano, diálogo inimigo inline | Extrair FRASES_INIMIGO para JSON; extrair CombatEffects |
| 🟡 **MÉDIA** | 400 | pages/Quiz.jsx | Quiz com 3 modos: perguntas, timer, Supabase, resultados | Extrair QuestionCard; extrair ResultsScreen |
| 🟡 **MÉDIA** | 386 | pages/ArenaTatics/screens/CityOverworld.jsx | Exploração cidade: canvas, colisão, minimapa, NPC, clima | Extrair hook usePlayerMovement; extrair MiniMap component |
| 🟡 **MÉDIA** | 381 | pages/Arena/ArenaCreate.jsx | Builder de ficha arena: atributos, vantagens, desvantagens | Extrair seções do formulário; extrair ManualBatalha |
| 🟡 **MÉDIA** | 360 | pages/Arena/ArenaLobby.jsx | Lobby arena: lista de fichas, seleção de batalha, XP, NeoGuide | Extrair BattleSelector; extrair NeoGuideIntro |
| 🟢 **BAIXA** | 346 | pages/ArenaTatics/screens/BatalhaSimulacao.jsx | Simulação AI vs AI com grid e status | Extrair SimStatusBar; extrair auto-resolve para hook |
| 🟢 **BAIXA** | 324 | pages/TopTrumpsLobby.jsx | Lobby multiplayer: fila, Supabase realtime, presença, apostas | Extrair QueuePanel; extrair BetModal |
| 🟢 **BAIXA** | 301 | pages/Duelo/components/Board.jsx | Grid 2D do Duelo com monstros, overlays e dicas | Extrair GridCell; extrair GameHints |
| 🟢 **BAIXA** | 409 | pages/Prototype/ArenaTestbed/components/Phase2BoardSetup.jsx | Setup de board protótipo: canvas, ferramentas, steppers | Extrair Toolbar; extrair config panel |
| 🟢 **BAIXA** | 401 | pages/Tamagoshi/screens/RestaurarSaude.jsx | Minigame de restaurar saúde: drag, partículas, animação | Extrair gerador de partículas; extrair useDragItem hook |
| 🟢 **BAIXA** | 340 | pages/Tamagoshi/screens/Passear.jsx | Endless runner: canvas, obstáculos, score, game over | Extrair useEndlessRunner hook; extrair ScorePanel |
| 🟢 **BAIXA** | 332 | pages/TopTrumps/components/DeckBuilder.jsx | Deck builder: grid, viewer, save/load, imports de imagem | Extrair CardViewerModal; extrair mapa de imports |
| 🟢 **BAIXA** | 305 | components/NinaMusicPlayer/NinaMusicPlayer.jsx | Player YouTube com Nina balloon, admin unlock | Extrair useYouTubePlayer hook; extrair NinaBalloon |

---

## 2. ARQUIVOS DE DADOS GRANDES (esperado — apenas dados, sem lógica)

Nenhum destes precisa ser refatorado — são dados puros. Alguns são grandes por natureza (catálogos, falas, cenas).

| Linhas | Arquivo | Conteúdo |
|--------|---------|----------|
| 4440 | pages/PesadeloParticular/data/casos.js | 20 casos investigativos com árvores de diálogo |
| 2922 | i18n/pt.json | Traduções PT do site |
| 2897 | i18n/en.json | Traduções EN |
| 2896 | i18n/es.json | Traduções ES |
| 2230 | data/supertrunfo-pt.json | ~180 cartas de Top Trumps (PT) |
| 2230 | data/supertrunfo-en.json | Cartas (EN) |
| 2230 | data/supertrunfo-es.json | Cartas (ES) |
| 1570 | pages/Tamagoshi/data/falas-criatura-pt.js | 32 criaturas × falas (PT) |
| 1570 | pages/Tamagoshi/data/falas-criatura-en.js | Falas (EN) |
| 1570 | pages/Tamagoshi/data/falas-criatura-es.js | Falas (ES) |
| 1492 | data/quiz-pt.json | Banco de perguntas do Quiz |
| 1190 | data/musicas.json | Catálogo de 36+ músicas |
| 772 | pages/LDI/data/scenes/pt/act1.json | Cenas narrativas Ato 1 (PT) |
| 772 | pages/LDI/data/scenes/en/act1.json | Cenas (EN) |
| 772 | pages/LDI/data/scenes/es/act1.json | Cenas (ES) |
| 733 | pages/ArenaTatics/data/districts.js | 8 distritos de Marélia com dados completos |
| 573 | pages/LDI/data/scenes/pt/act3.json | Cenas Ato 3 (PT) |
| 531 | pages/ArenaTatics/data/classTree.js | Árvore de evolução das 6 classes |
| 522 | pages/LDI/data/scenes/en/act3.json | Cenas Ato 3 (EN) |
| 442 | i18n/arena-trash-es.json | Falas de inimigos da arena (ES) |
| 442 | i18n/arena-trash-en.json | Falas de inimigos (EN) |
| 428 | pages/PesadeloParticular/data/pp-i18n.js | Traduções internas do PP |
| 382 | pages/ArenaTatics/data/aiPersonalities.js | 16 personalidades de IA |
| 319 | pages/LDI/data/scenes/pt/act2.json | Cenas Ato 2 (PT) |
| 319 | pages/LDI/data/scenes/en/act2.json | Cenas Ato 2 (EN) |
| 303 | pages/Tamagoshi/data/criaturas.js | 32 criaturas com atributos |
| 2563 | pages/Prototype/rpg-morto.html | HTML standalone do Morto Engine (iframe) |

---

## 3. STORES (ZUSTAND) GRANDES

| Linhas | Arquivo | Risco | Descrição |
|--------|---------|-------|-----------|
| 860 | pages/Duelo/store/useDueloStore.js | 🔴 **ALTO** | Maior store do projeto. Acumula: game state, deck, efeitos, fases, timer, log de batalha. Mistura sincronização Supabase com lógica de jogo pura. **Sugestão:** separar useDueloGameStore (lógica de jogo pura) de useDueloPersistStore (save/load Supabase) |
| 659 | pages/Tamagoshi/store/useTamagoshiStore.js | 🟡 **MÉDIO** | Gerencia métricas, inventário, DIX, ciclo de vida, save/load. Coeso porque é um domínio único (tamagoshi), mas grande. **Sugestão:** extrair lógica de decaimento/time para hook separado |
| 398 | pages/JackCandy/store/useJackStore.js | 🟢 **BAIXO** | Flags de progresso, itens, diálogos. Dentro do esperado para jogo narrativo. |
| 325 | pages/LDI/store/useGameStore.js | 🟢 **BAIXO** | Estado de jogo LDI. Dentro do esperado. |

---

## 4. ARQUIVOS DE ESTILO (CSS) GRANDES

> Observação: O projeto usa CSS separado por componente (zero CSS-in-JS). Arquivos grandes são esperados, mas alguns podem beneficiar de modularização.

| Linhas | Arquivo | Nota |
|--------|---------|------|
| 3039 | pages/ArenaTatics/ArenaTatics.css | 🔴 **MAIOR CSS do projeto.** Cobre ~15 screens + componentes. Extrair CSS por screen (ex: Batalha.css, CityOverworld.css, BuildingInterior.css) já reduziria drasticamente. |
| 2391 | pages/LDI/LDI.css | 🔴 Cobre Lobby, Create, Game, Combat, Sheet, Clues, End, PuzzlePage. Extrair por screen. |
| 1916 | pages/TopTrumps.css | 🟡 Cobre TopTrumps.jsx + MP + Lobby. Separar por página. |
| 1868 | pages/JackCandy/JackCandy.css | 🟡 Cobre o jogo inteiro (~12 screens). Separar por screen. |
| 1729 | pages/Tamagoshi/Tamagoshi.css | 🟡 Cobre ~10 screens do tamagoshi. |
| 1399 | pages/PesadeloParticular/PP.css | 🟡 Cobre PP inteiro (~8 screens). |
| 1253 | pages/Arena/Arena.css | 🟡 Cobre Lobby, Create, Combat, Victory. |
| 1171 | pages/Duelo/Duelo.css | 🟢 Cobre Duelo inteiro, mas é um jogo único. |
| 824 | pages/Prototype/ArenaTestbed/components/Phase3Combat.css | 🟢 Específico de um componente. |
| 761 | pages/TopTrumpsMP.css | 🟢 Específico do MP. |
| 663 | pages/Perfil.css | 🟢 Cobre perfil com ~7 abas. |
| 663 | pages/Quiz.css | 🟢 Específico do quiz. |
| 488 | pages/TopTrumpsLobby.css | 🟢 Específico do lobby. |
| 459 | pages/Mundo.css | 🟢 Página de lore. |
| 394 | pages/Assinar.css | 🟢 Página de assinatura. |
| 384 | components/Puzzles/Puzzles.css | 🟢 Cobre todos os puzzles (~7). |
| 372 | pages/TopTrumps/components/DeckBuilder.css | 🟢 Específico. |
| 359 | pages/Prototype/ArenaTestbed/components/Phase1SheetBuilder.css | 🟢 Específico. |
| 354 | components/HeroSlideshow.css | 🟢 Componente único. |
| 341 | pages/Perfil/abas/PerfilTamagoshi.css | 🟢 Específico. |
| 340 | components/Navbar.css | 🟢 Componente único. |
| 335 | pages/Prototype/ArenaTestbed/components/Phase2BoardSetup.css | 🟢 Específico. |

---

## 5. OUTROS ARQUIVOS GRANDES (hooks, lib, engine)

| Linhas | Arquivo | Tipo | Descrição |
|--------|---------|------|-----------|
| 357 | hooks/useLeaderboardDB.js | Hook | Queries Supabase de leaderboard + ranking. Grande mas coeso. |
| 351 | lib/sfx.js | Util | Web Audio API — sons sintéticos. Data-driven (mapeamento nota→freq). Esperado. |
| 312 | pages/Duelo/engine/ai.js | Engine | IA do Duelo com lógica de prioridade. Coeso. |

---

## 6. RESUMO E RECOMENDAÇÕES

### Ações prioritárias (impacto imediato)

1. **🔴 CSS Monolítico → modular**: ArenaTatics/ArenaTatics.css (3039 linhas) e LDI/LDI.css (2391 linhas) — quebrar por screen. Cada screen já existe como arquivo separado, só o CSS que não.

2. **🔴 Phase3Combat.jsx** (1545 linhas): Extrair engine de combate hex e modal de personagem. É protótipo, mas está enorme.

3. **🔴 Stores**: useDueloStore.js (860 linhas) separar em game + persist.

### Ações de médio prazo

4. **🟡 PP.jsx**, **TopTrumps.jsx**, **DueloRoute.jsx** — cada um com 900-1400 linhas. Extrair componentes de tela (ex: PhoneCall, RoundScreen, CoinToss).

5. **🟡 LDI/Create.jsx** (533 linhas) — extrair etapas do wizard.

6. **🟡 CSS de JackCandy, Tamagoshi, PP, Arena** — quebrar por screen.

### Arquivos que NÃO devem ser tocados

- Todos os JSON de dados (i18n, cartas, cenas, quiz, músicas, falas de criatura) — são dados puros, o tamanho é proporcional ao conteúdo.
- Stores de JackCandy, LDI, Tamagoshi — coesos, dentro do esperado.
- CSS pequenos e específicos (<500 linhas, um componente só).
- Hooks (useLeaderboardDB) e lib (sfx.js) — coesos.

---

*Relatório gerado em 2026-06-19 21:08 · Nenhum código foi alterado.*
