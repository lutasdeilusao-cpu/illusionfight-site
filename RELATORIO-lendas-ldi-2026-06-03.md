# Relatório de Entrega — Lendas do LDI
**Data:** 2026-06-03  
**Versão entregue:** Arco 1 — Build inicial  
**URL de produção:** (pendente deploy)  
**Commit hash:** (pendente commit)  
**Branch:** main

---

## ✅ O que foi implementado

### Estrutura
- `src/pages/LDI/` — 7 páginas (Lobby, Create, Game, Combat, Sheet, Clues, End)
- `src/pages/LDI/engine/` — 5 módulos de lógica pura (dice, combat, flags, scenes, character)
- `src/pages/LDI/store/` — 2 stores Zustand (useGameStore, useCombatStore)
- `src/pages/LDI/data/scenes/` — act1.json (27 cenas do Ato I)
- `src/pages/LDI/data/enemies/` — enemies.json (7 fichas de inimigos)
- `src/pages/LDI/components/` — 10 componentes (Typewriter, SceneView, ChoiceList, CombatView, DiceRoll, CharacterSheetView, ClueBook, PuzzleSlidingTiles, PuzzleStealthGrid, PuzzleDecoder)

### Supabase
- Migration: `supabase/migrations/003_lendas_ldi.sql`
- Tabelas: `character_sheets`, `game_saves`
- RLS: `auth.uid() = user_id`

### Engine de Jogo
- `dice.js`: rollD6, rollWithDelay, testAttribute
- `combat.js`: calcFA (3 modos), calcFD, calcDamage, applyStatus, tickStatuses, deathTest, calcInitiative
- `flags.js`: setFlag, hasFlag, requiresFlag
- `scenes.js`: loadScene, filterChoices (com verificação de atributos, custo, flags)
- `character.js`: calcMaxPV, calcMaxPM, applyXP, checkNearDeath

### Componentes React
- Typewriter com skip por Enter/Espaço/clique
- ChoiceList com stagger (80ms), choices bloqueadas com motivo, custo inline
- CombatView em grid 3 colunas com barras de PV/PM animadas, log, seleção de modo
- DiceRoll com animação slot machine (400ms) + breakdown em cascata
- CharacterSheetView com barras de atributos e status
- ClueBook com filtros e cards
- 3 puzzles completos

### Efeitos Visuais
- [x] Typewriter com skip por Enter
- [x] Choices com stagger de entrada
- [x] Flash vermelho em dano recebido
- [x] Vinheta Perto da Morte pulsando
- [x] Onomatopeias de combate
- [x] Dado com efeito slot machine
- [x] Transições de cena (clipPath VHS split)
- [x] Barras de PV/PM animadas
- [x] Log de combate com scroll automático
- [x] Tela de Game Over dramática

### Cenas — Ato I completo (1.1 → 2.1)
1.1 → 1.1d (NeoGuide), 1.2 (Desconexão), 1.3 (6 opções), 1.3a–f, 1.3-mafama, 1.4, 1.4a–c, 1.5, 1.5a, 2.1 → 2.1d, end_act1

### Inimigos
StormByte_91, Kaeda, GhostPulse, IronVeil, NULL_ENTITY (3 versões)

---

## ⚠️ Pendências e Limitações
- Save/load do Supabase não conectado (funciona com estado local)
- Após combate, retorna à cena anterior (não avança automaticamente)
- Puzzles não estão integrados às cenas (componentes independentes)
- Sistema de áudio não implementado (conforme especificado)
- Tela de ranking SDR não implementada
- Apenas idioma PT (sem i18n)

## 📦 Dependências adicionadas
| Pacote | Versão | Motivo |
|--------|--------|--------|
| framer-motion | ^12.7.5 | Animações e transições |
| zustand | ^5.0.5 | Estado global |

## 🚀 Próximos passos sugeridos
1. Conectar Supabase (persistência de saves)
2. Integrar puzzles às cenas narrativas
3. Implementar Ato II (cenas 2.1 → 3.1)
4. Adicionar trilha sonora / efeitos de som
5. Batalhas Kaeda, GhostPulse, IronVeil testadas
6. Sistema de áudio imersivo
