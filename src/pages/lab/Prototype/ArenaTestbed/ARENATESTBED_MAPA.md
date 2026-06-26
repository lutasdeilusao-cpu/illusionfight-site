# ArenaTestbed — Mapa Completo de Arquivos

> Gerado em 2026-06-21. 54 arquivos no total.
> Legenda: 🟢 puro (sem React/sem estado) | 🔵 componente (React stateful) | ⚪ órfão (não importado ativamente)

---

## 1. Orquestrador

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `ArenaTestbed.jsx` | Orquestrador central: enum FaseArena, ModoJogo, FASES_CONFIG, handlers de navegação entre fases 0→6 | — (entry point) | 🔵 |
| `ArenaTestbed.css` | Estilos do orquestrador + step indicator | `ArenaTestbed.jsx` | — |

---

## 2. Componentes de Fase (phases/)

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `phases/Phase0Start.jsx` | Fase 0: criar nova ficha ou carregar ficha existente | `ArenaTestbed.jsx` | 🔵 |
| `phases/Phase0Start.css` | Estilos da Fase 0 | `Phase0Start.jsx` | — |
| `phases/Phase1SheetBuilder.jsx` | Fase 1: criação de fichas (atributos, time, personalidade IA) | `ArenaTestbed.jsx` | 🔵 |
| `phases/Phase1SheetBuilder.css` | Estilos da Fase 1 | `Phase1SheetBuilder.jsx` | — |
| `phases/Phase2Customize.jsx` | Fase 2: personalização visual (cor, ícone, nome) | `ArenaTestbed.jsx` | 🔵 |
| `phases/Phase2Customize.css` | Estilos da Fase 2 | `Phase2Customize.jsx` | — |
| `phases/Phase3ModeSelect.jsx` | Fase 3: escolha de modo (Treino ativo, Campanha desabilitada) | `ArenaTestbed.jsx` | 🔵 |
| `phases/Phase3ModeSelect.css` | Estilos da Fase 3 | `Phase3ModeSelect.jsx` | — |
| `phases/Phase4BoardSetup.jsx` | Fase 4: montagem do tabuleiro hexgrid | `ArenaTestbed.jsx` | 🔵 |
| `phases/Phase4BoardSetup.css` | Estilos da Fase 4 | `Phase4BoardSetup.jsx` | — |
| `phases/Phase5PowerSelect.jsx` | Fase 5: seleção de poderes (collapse, filtros, grid de cards) | `ArenaTestbed.jsx` | 🔵 |
| `phases/Phase5PowerSelect.css` | Estilos da Fase 5 | `Phase5PowerSelect.jsx` | — |
| `phases/Phase6Combat.jsx` | Fase 6: combate completo em tabuleiro hexagonal | `ArenaTestbed.jsx` | 🔵 |
| `phases/Phase6Combat.css` | Estilos da Fase 6 | `Phase6Combat.jsx` | — |

---

## 3. Componentes de UI Reutilizáveis/Auxiliares

### components/modals/

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `components/modals/JokenpoModal.jsx` | Modal de Jokenpo para desempate de AGI cruzado | `phases/Phase6Combat.jsx` | 🔵 |
| `components/modals/JokenpoModal.css` | Estilos do modal | `JokenpoModal.jsx` | — |
| `components/modals/PowerChoiceModal.jsx` | Modal de escolha de ataque (comum/poder) e defesa | `phases/Phase6Combat.jsx` | 🔵 |
| `components/modals/PowerChoiceModal.css` | Estilos do modal | `PowerChoiceModal.jsx` | — |

### components/power-selection/

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `components/power-selection/PowerFilterBar.jsx` | Abas de elemento + ordenação FA/FD/A-Z | `phases/Phase5PowerSelect.jsx` | 🔵 |
| `components/power-selection/PowerFilterBar.css` | Estilos | `PowerFilterBar.jsx` | — |
| `components/power-selection/PowerGrid.jsx` | Grade CSS Grid de cards | `phases/Phase5PowerSelect.jsx` | 🔵 |
| `components/power-selection/PowerGrid.css` | Estilos | `PowerGrid.jsx` | — |
| `components/power-selection/PowerCard.jsx` | Card individual (nome, MP, expansão de descrição) | `PowerGrid.jsx` | 🔵 |
| `components/power-selection/PowerCard.css` | Estilos | `PowerCard.jsx` | — |
| `components/power-selection/PowerDescription.jsx` | Texto descritivo expansível | `PowerCard.jsx` | 🔵 |
| `components/power-selection/PowerDescription.css` | Estilos | `PowerDescription.jsx` | — |
| `components/power-selection/SortToggle.jsx` | Botão de ordenação ▲/▼ | `PowerFilterBar.jsx` | 🔵 |
| `components/power-selection/SortToggle.css` | Estilos | `SortToggle.jsx` | — |

### components/effects/

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `components/effects/effectsMap.js` | ⚪ Mapa visualId → componente de efeito (estrutura vazia) | Não importado | 🟢 |

---

## 4. engine/ — Lógica pura

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `engine/ai.js` | IA básica original (`decidirAcaoIA` — padrão, sem personalidade) | `phases/Phase6Combat.jsx` | 🟢 |
| `engine/ai/index.js` | ⚪ **Código legado** — `PERSONALIDADES` map + `executarPersonalidade()` com `ATIVA` hardcoded. **Não usado** — substituído por `personalidades/index.js` | Ninguém importa (ainda referenciado por imports antigos quebrados) | 🟢 |
| `engine/ai/estagios.js` | Enum `EstagioIA` = `{ PENSAR, MOVER, AGIR, FINALIZAR }` | `phases/Phase6Combat.jsx` | 🟢 |
| `engine/ai/efeitosVisuaisIA.js` | `mostrarBannerAtaqueIA()` — efeito visual de banner | `phases/Phase6Combat.jsx` | 🟢 |
| `engine/ai/personalidades/index.js` | Catálogo `PERSONALIDADES_IA` + `getPersonalidadePorId()` | `phases/Phase6Combat.jsx`, `phases/Phase1SheetBuilder.jsx` | 🟢 |
| `engine/ai/personalidades/sanguinaria.js` | Sempre ataca o inimigo de menor HP, sem recuar | Via `personalidades/index.js` | 🟢 |
| `engine/ai/personalidades/fujona.js` | Foge na fase Movimento, reavalia ataque na fase Ação | Via `personalidades/index.js` | 🟢 |
| `engine/ai/personalidades/persistente.js` | Fixa alvo via `alvoFixadoId`, só troca se outro ficar mais fraco | Via `personalidades/index.js` | 🟢 |
| `engine/combat.js` | Motor de combate: FA, FD, `resolverAtaque`, `criarPersonagem`, `rolarD6` | `phases/Phase6Combat.jsx`, `phases/Phase1SheetBuilder.jsx`, `engine/ai.js`, personalidades | 🟢 |
| `engine/drawCombatBoard.js` | Função pura de desenho do canvas de combate | `phases/Phase6Combat.jsx` | 🟢 |
| `engine/hexUtils.js` | Utilitários de grid hexagonal (odd-r offset): distância, vizinhos, linha de visão, BFS pathfinding | Fases 4+6, personalidades, `engine/ai.js`, `archive/getLineInDirection.js` | 🟢 |
| `engine/mecanicasPoder.js` | Camada 2 de poderes: lookup `MECANICAS` + `executarMecanica()` + `bonusAtributo` | `phases/Phase6Combat.jsx` | 🟢 |
| `engine/regrasFicha.js` | Validação: limite de fichas (9), personagens (3), cores, nomes | `phases/Phase0Start.jsx`, `phases/Phase2Customize.jsx` | 🟢 |
| `engine/TurnController.js` | Orquestrador único de turno: ordem, avanço, restrições, agendamentos, `TipoAcao` | `phases/Phase6Combat.jsx` | 🟢 |
| `engine/turnOrder.js` | Cálculo de ordem de turno pré-partida: grupos AGI, empates, Jokenpo | `phases/Phase6Combat.jsx` | 🟢 |
| `engine/useCombatEngine.js` | Hook React espelhando a lógica de combate (sem integração) | Não importado ainda | 🔵 |
| `engine/useHexCanvas.js` | Hook React: recálculo de tamanho do hex grid, pixelToHex, hexCenter | `phases/Phase6Combat.jsx`, `phases/Phase4BoardSetup.jsx` | 🔵 |

---

## 5. data/ — Catálogos e armazenamento

| Arquivo | Responsabilidade | Importado por | Tipo |
|---------|-----------------|---------------|------|
| `data/poderes.js` | Catálogo de poderes (21 definições com elemento, mecânica, valorComparativo) | `ArenaTestbed.jsx`, `phases/Phase5PowerSelect.jsx`, `phases/Phase6Combat.jsx`, personalidades | 🟢 |
| `data/fichaStorage.js` | Persistência de fichas em `localStorage` (interface async, pronta para Supabase) | `ArenaTestbed.jsx`, `phases/Phase0Start.jsx` | 🟢 |

---

## 6. archive/ — Preservados (não ativos)

| Arquivo | Origem | Motivo |
|---------|--------|--------|
| `archive/PowerLinePreview.jsx` | `components/PowerLinePreview.jsx` original | Preservado para reconstrução futura da Investida |
| `archive/PowerLinePreview.css` | `components/PowerLinePreview.css` original | Preservado |
| `archive/getLineInDirection.js` | `engine/getLineInDirection.js` | Preservado para reconstrução futura da Investida |

---

## 7. Documentação

| Arquivo | Responsabilidade |
|---------|-----------------|
| `REFATORACAO_PHASE3_ESTUDO.md` | Estudo da refatoração revertida do Phase3Combat (7 regras para extrações seguras) |
| `ARENATESTBED_MAPA.md` | Este arquivo — inventário completo do ArenaTestbed |

---

## 8. ⚪ engine/ai/index.js — Órfão com imports quebrados

O arquivo `engine/ai/index.js` foi substituído por `engine/ai/personalidades/index.js` mas não foi deletado. Ele ainda importa de `./sanguinaria`, `./fujona`, `./persistente` (caminhos errados — estão em `./personalidades/`). Não é importado por ninguém ativamente. **Pode ser deletado.**

---

## Resumo

| Categoria | Ativos | ⚪ Órfãos | Total |
|-----------|--------|-----------|-------|
| Orquestrador | 2 | 0 | 2 |
| Componentes de Fase (phases/) | 14 | 0 | 14 |
| UI Reutilizáveis (modals + power-selection + effects) | 17 | 1 | 18 |
| engine/ | 15 | 1 | 16 |
| data/ | 2 | 0 | 2 |
| archive/ | 0 | 3 | 3 |
| Documentação | 2 | 0 | 2 |
| **Total** | **52** | **5** | **57** |
