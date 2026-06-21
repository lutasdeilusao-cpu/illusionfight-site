# ArenaTestbed — Mapa Completo de Arquivos

> Gerado em 2026-06-21. 57 arquivos no total.
> Legenda: 🟢 puro (sem React/sem estado) | 🔵 componente (React stateful) | ⚪ órfão (não importado)

---

## 1. Orquestrador

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `ArenaTestbed.jsx` | Orquestrador central: enum FaseArena, ModoJogo, FASES_CONFIG, handlers de navegação entre fases | — (entry point) | 🔵 |
| `ArenaTestbed.css` | Estilos do orquestrador + step indicator | `ArenaTestbed.jsx` | — |

---

## 2. Componentes de Fase (Phase0–Phase6)

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `Phase0Start.jsx` | Fase 0: criar nova ficha ou carregar ficha existente | `ArenaTestbed.jsx` | 🔵 |
| `Phase0Start.css` | Estilos da Fase 0 | `Phase0Start.jsx` | — |
| `Phase1SheetBuilder.jsx` | Fase 1: criação de fichas de personagem (atributos, time) | `ArenaTestbed.jsx` | 🔵 |
| `Phase1SheetBuilder.css` | Estilos da Fase 1 | `Phase1SheetBuilder.jsx` | — |
| `Phase2Customize.jsx` | Fase 2: personalização visual (cor, ícone, nome) | `ArenaTestbed.jsx` | 🔵 |
| `Phase2Customize.css` | Estilos da Fase 2 | `Phase2Customize.jsx` | — |
| `Phase3ModeSelect.jsx` | Fase 3: escolha de modo (Treino ativo, Campanha desabilitada) | `ArenaTestbed.jsx` | 🔵 |
| `Phase3ModeSelect.css` | Estilos da Fase 3 | `Phase3ModeSelect.jsx` | — |
| `Phase4BoardSetup.jsx` | Fase 4: montagem do tabuleiro hexgrid | `ArenaTestbed.jsx` | 🔵 |
| `Phase4BoardSetup.css` | Estilos da Fase 4 | `Phase4BoardSetup.jsx` | — |
| `Phase5PowerSelect.jsx` | Fase 5: seleção de poderes por personagem (com collapse + filtros) | `ArenaTestbed.jsx` | 🔵 |
| `Phase5PowerSelect.css` | Estilos da Fase 5 | `Phase5PowerSelect.jsx` | — |
| `Phase6Combat.jsx` | Fase 6: combate completo em tabuleiro hexagonal | `ArenaTestbed.jsx` | 🔵 |
| `Phase6Combat.css` | Estilos da Fase 6 | `Phase6Combat.jsx` | — |

---

## 3. Componentes de UI Reutilizáveis/Auxiliares

### Usados por Phase6Combat

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `JokenpoModal.jsx` | Modal de Jokenpo para desempate de AGI cruzado | `Phase6Combat.jsx` | 🔵 |
| `JokenpoModal.css` | Estilos do Jokenpo modal | `JokenpoModal.jsx` | — |
| `PowerChoiceModal.jsx` | Modal de escolha de tipo de ataque (comum/poder) e defesa | `Phase6Combat.jsx` | 🔵 |
| `PowerChoiceModal.css` | Estilos do PowerChoiceModal | `PowerChoiceModal.jsx` | — |

### Usados por Phase5PowerSelect

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `PowerFilterBar.jsx` | Barra de filtro: abas de elemento + ordenação FA/FD/A-Z | `Phase5PowerSelect.jsx` | 🔵 |
| `PowerFilterBar.css` | Estilos do PowerFilterBar | `PowerFilterBar.jsx` | — |
| `PowerGrid.jsx` | Grade CSS Grid de cards de poder | `Phase5PowerSelect.jsx` | 🔵 |
| `PowerGrid.css` | Estilos do PowerGrid | `PowerGrid.jsx` | — |
| `PowerCard.jsx` | Card individual de poder (nome, MP, expansão de descrição) | `PowerGrid.jsx` | 🔵 |
| `PowerCard.css` | Estilos do PowerCard | `PowerCard.jsx` | — |
| `PowerDescription.jsx` | Texto descritivo expansível do poder | `PowerCard.jsx` | 🔵 |
| `PowerDescription.css` | Estilos do PowerDescription | `PowerDescription.jsx` | — |
| `SortToggle.jsx` | Botão de ordenação com indicador ▲/▼ | `PowerFilterBar.jsx` | 🔵 |
| `SortToggle.css` | Estilos do SortToggle | `SortToggle.jsx` | — |

### ⚪ Órfãos (não importados atualmente)

| Arquivo | Responsabilidade | Último uso conhecido | Tipo |
|---------|-----------------|---------------------|------|
| `ActionControls.jsx` | Painel de ações do jogador (Mover/Atacar/Item) | Foi extraído na refatoração revertida (REFATORACAO_PHASE3_ESTUDO.md), nunca reintegrado | 🔵 |
| `ActionControls.css` | Estilos do ActionControls | — | — |
| `BattleLogDrawer.jsx` | Drawer de log de batalha deslizante | Foi extraído na refatoração revertida, nunca reintegrado | 🔵 |
| `BattleLogDrawer.css` | Estilos do BattleLogDrawer | — | — |
| `CharInfoModal.jsx` | Modal de informações do personagem | Foi extraído na refatoração revertida, nunca reintegrado | 🔵 |
| `CharInfoModal.css` | Estilos do CharInfoModal | — | — |
| `CombatHUD.jsx` | HUD de fichas dos personagens | Foi extraído na refatoração revertida, nunca reintegrado | 🔵 |
| `CombatHUD.css` | Estilos do CombatHUD | — | — |
| `OrderingModal.jsx` | Modal de reordenação de turno (ordem de ataque do time) | Foi extraído na refatoração revertida, nunca reintegrado | 🔵 |
| `OrderingModal.css` | Estilos do OrderingModal | — | — |
| `PowerLinePreview.jsx` | Preview interativo da Investida (direção N/S) | Removido junto com a Investida, preservado para reconstrução futura | 🔵 |
| `PowerLinePreview.css` | Estilos do PowerLinePreview | — | — |
| `getLineInDirection.js` | Cálculo de células em linha reta N/S | Removido junto com a Investida, preservado para reconstrução futura | 🟢 |

---

## 4. engine/ — Lógica pura

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `TurnController.js` | Orquestrador único de turno (ordem, avanço, restrições, agendamentos) | `Phase6Combat.jsx` | 🟢 |
| `combat.js` | Motor de combate: FA, FD, resolverAtaque, criarPersonagem, rolarD6 | `Phase6Combat.jsx` | 🟢 |
| `hexUtils.js` | Utilitários de grid hexagonal (distância, vizinhos, linha de visão, pathfinding) | `Phase6Combat.jsx`, `Phase4BoardSetup.jsx`, `getLineInDirection.js`, `drawBoard.js` | 🟢 |
| `ai.js` | IA para personagens: decidirAcaoIA, pathfinding | `Phase6Combat.jsx` | 🟢 |
| `mecanicasPoder.js` | Camada 2 de poderes: lookup MECANICAS + executarMecanica + bonusAtributo | `Phase6Combat.jsx` | 🟢 |
| `turnOrder.js` | Cálculo de ordem de turno pré-partida: grupos AGI, empates, Jokenpo | `Phase6Combat.jsx` | 🟢 |
| `drawCombatBoard.js` | Função pura de desenho do canvas de combate | `Phase6Combat.jsx` | 🟢 |
| `regrasFicha.js` | Validação de regras: limite de fichas, personagens, cores, nomes | `Phase0Start.jsx`, `Phase2Customize.jsx` | 🟢 |
| `useHexCanvas.js` | Hook React: recálculo de tamanho do hex grid, pixelToHex, hexCenter | `Phase6Combat.jsx`, `Phase4BoardSetup.jsx` | 🔵 (hook) |
| `drawBoard.js` | ⚪ Função de desenho do board — **substituída por drawCombatBoard.js** (código legado) | Não importado por ninguém | 🟢 |

---

## 5. data/ — Catálogos e armazenamento

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `poderes.js` | Catálogo de poderes (PODERES_BASE + getPoderesPorId, temPoderDisponivel) | `ArenaTestbed.jsx`, `Phase5PowerSelect.jsx`, `Phase6Combat.jsx` | 🟢 |
| `fichaStorage.js` | Persistência de fichas (localStorage, futuramente Supabase) | `ArenaTestbed.jsx`, `Phase0Start.jsx` | 🟢 |

---

## 6. components/effects/ — Sistema de efeitos visuais

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `effectsMap.js` | ⚪ Mapa de visualId → componente de efeito (estrutura vazia, aguardando implementação) | Não importado por ninguém | 🟢 |

---

## 7. Documentação

| Arquivo | Responsabilidade |
|---------|-----------------|
| `REFATORACAO_PHASE3_ESTUDO.md` | Estudo da refatoração revertida do Phase3Combat (7 regras para extrações seguras) |

---

## Resumo

| Categoria | Ativos | Órfãos | Total |
|-----------|--------|--------|-------|
| Orquestrador | 2 | 0 | 2 |
| Componentes de Fase | 14 | 0 | 14 |
| UI Reutilizáveis | 11 | 13 | 24 |
| engine/ | 9 | 1 | 10 |
| data/ | 2 | 0 | 2 |
| components/effects/ | 0 | 1 | 1 |
| Documentação | 1 | 0 | 1 |
| **Total** | **39** | **15** | **54** |

### Órfãos sinalizados para atenção

| Arquivo | Motivo |
|---------|--------|
| `ActionControls.jsx/.css` | Refatoração revertida — código morto (não reintegrado) |
| `BattleLogDrawer.jsx/.css` | Refatoração revertida — código morto |
| `CharInfoModal.jsx/.css` | Refatoração revertida — código morto |
| `CombatHUD.jsx/.css` | Refatoração revertida — código morto |
| `OrderingModal.jsx/.css` | Refatoração revertida — código morto |
| `PowerLinePreview.jsx/.css` | Preservado para reconstrução futura da Investida |
| `getLineInDirection.js` | Preservado para reconstrução futura da Investida |
| `effectsMap.js` | Estrutura vazia, aguardando implementação de visuais |
| `drawBoard.js` | Substituído por `drawCombatBoard.js` — legado não removido |
