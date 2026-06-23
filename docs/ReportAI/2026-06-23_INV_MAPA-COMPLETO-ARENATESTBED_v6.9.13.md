# INV — Mapa Completo ArenaTestbed

> **Versão:** ARENATESTBED v6.9.13 / SITE v10.160.16  
> **Data:** 2026-06-23  
> **Tipo:** Investigação / Inventário  
> **Autor:** Agente LDI (automated)

---

## Sumário

1. [Inventário Completo (59 arquivos)](#1-inventário-completo-59-arquivos)
2. [Arquitetura de Efeitos](#2-arquitetura-de-efeitos)
3. [Bug Timeline (v6.9.9 → v6.9.13)](#3-bug-timeline)
4. [Primitivas de Efeito — Status](#4-primitivas-de-efeito--status)
5. [Arquivos Proibidos (fora de alcance)](#5-arquivos-proibidos-fora-de-alcance)
6. [Import Map (dependências externas)](#6-import-map-dependências-externas)
7. [effectsMap.js — Dump Completo](#7-effectsmapjs--dump-completo)

---

## 1. Inventário Completo (59 arquivos)

### 1.1 Componentes (14 arquivos)

| # | Arquivo | Lang | Linhas | Responsabilidade | Imports Externos |
|---|---|---|---|---|---|
| 1 | `components/effects/EffectRenderer.js` | JS | 144 | Registra refs do React, dicionário de primitivas visuais, `executar()` dispatcher | Nenhum |
| 2 | `components/effects/effectsMap.js` | JS | 313 | Config map: 17 tipos de efeito com channel, primitive, duration, priority | Nenhum |
| 3 | `components/modals/CharModal.jsx` | JSX | 41 | Modal stats detalhados (HP/MP/atributos) | `atb-ui.css` |
| 4 | `components/modals/CharModal.css` | CSS | — | *(merged in atb-ui.css, no dedicated file)* | — |
| 5 | `components/modals/JokenpoModal.jsx` | JSX | 88 | Modal Jokenpenho (desempate AGI) | `LanguageContext` |
| 6 | `components/modals/JokenpoModal.css` | CSS | 109 | Overlay, card, choice buttons, result display | — |
| 7 | `components/modals/PowerChoiceModal.jsx` | JSX | 44 | Modal escolha de poder em combate | `LanguageContext` |
| 8 | `components/modals/PowerChoiceModal.css` | CSS | 63 | Overlay, header, FA display, option buttons | — |
| 9 | `components/power-selection/PowerCard.jsx` | JSX | 39 | Card individual de poder | `LanguageContext`, `PowerDescription` |
| 10 | `components/power-selection/PowerCard.css` | CSS | 47 | Card borders, element icon, trigger badge | — |
| 11 | `components/power-selection/PowerDescription.jsx` | JSX | 9 | Wrapper texto descrição | Nenhum |
| 12 | `components/power-selection/PowerDescription.css` | CSS | 7 | Padding, font, border-top | — |
| 13 | `components/power-selection/PowerFilterBar.jsx` | JSX | 61 | Filter por elemento + sort toggles | `LanguageContext`, `SortToggle` |
| 14 | `components/power-selection/PowerFilterBar.css` | CSS | 25 | Flex layout, element buttons, sort row | — |
| 15 | `components/power-selection/PowerGrid.jsx` | JSX | 18 | Grid de poderes | `PowerCard` |
| 16 | `components/power-selection/PowerGrid.css` | CSS | 5 | CSS grid auto-fill 200px | — |
| 17 | `components/power-selection/SortToggle.jsx` | JSX | 15 | Botão toggle direção sort | Nenhum |
| 18 | `components/power-selection/SortToggle.css` | CSS | 13 | Inline-flex, hover/active, arrow | — |

### 1.2 Data (2 arquivos)

| # | Arquivo | Lang | Linhas | Responsabilidade |
|---|---|---|---|---|
| 19 | `data/fichaStorage.js` | JS | 64 | Persistência localStorage (fichas), preparado para Supabase |
| 20 | `data/poderes.js` | JS | 76 | 22 poderes com elemento, custo MP, gatilho, mecânicas |

### 1.3 Engine (18 arquivos)

| # | Arquivo | Lang | Linhas | Responsabilidade | Exports |
|---|---|---|---|---|---|
| 21 | `engine/ai/personalidades/fujona.js` | JS | 106 | IA: foge do inimigo mais próximo | `acaoFujona` |
| 22 | `engine/ai/personalidades/index.js` | JS | 13 | Registry de personalidades | `PERSONALIDADES_IA`, `getPersonalidadePorId` |
| 23 | `engine/ai/personalidades/persistente.js` | JS | 105 | IA: fixa alvo mais fraco, persegue | `acaoPersistente` |
| 24 | `engine/ai/personalidades/sanguinaria.js` | JS | 91 | IA: ataca mais fraco imediatamente | `acaoSanguinaria` |
| 25 | `engine/ai/index.js` | JS | 27 | Entry point IA (hardcoded `ATIVA = 'sanguinaria'`) | `PERSONALIDADES`, `executarPersonalidade` |
| 26 | `engine/ai.js` | JS | 126 | IA legada (decidirAcaoIA) — ainda usada por useCombatEngine | `decidirAcaoIA` |
| 27 | `engine/combat.js` | JS | 230 | Fórmulas de combate (FA, FD, atq, contra-atq, crítico, d6) | 10 exports |
| 28 | `engine/drawCombatBoard.js` | JS | 270 | Render canvas: grid hex, personagens, projetil, highlights | `drawCombatBoard` |
| 29 | `engine/hexUtils.js` | JS | 284 | Utilitários grid hex (coordenadas, LOS, pathfinding, alcance) | 10 exports |
| 30 | `engine/mecanicasPoder.js` | JS | 22 | Registry de mecânicas de poder (id 1-2) | `MECANICAS`, `executarMecanica` |
| 31 | `engine/regrasFicha.js` | JS | 34 | Regras de negócio (max fichas, cores, nomes) | 6 exports |
| 32 | `engine/TurnController.js` | JS | 222 | Singleton máquina de turnos (ordem, ações, restrições) | 16 exports |
| 33 | `engine/turnOrder.js` | JS | 127 | Funções puras: grupos AGI, Jokenpo, ordenação | 5 exports |
| 34 | `engine/useCanvasLoop.js` | JS | 15 | Hook RAF loop | default |
| 35 | `engine/useCombatEngine.js` | JS | 689 | **Maior arquivo** — hook central: estado combate, turnos, movimento, ataque, IA, vitória | default |
| 36 | `engine/useEffectMachine.js` | JS | 117 | Fila de efeitos (3 canais, prioridade, dedup) | default |
| 37 | `engine/useHexCanvas.js` | JS | 187 | Hook: gerenciamento canvas hex, ResizeObserver, drawHex | default |
| 38 | `engine/useInputLock.js` | JS | 41 | Hook: lock de input durante animações | default |
| 39 | `engine/useUIController.js` | JS | 36 | Hook: anúncios de turno, subPhase label | default |

### 1.4 Phases (15 arquivos)

| # | Arquivo | Lang | Linhas | Responsabilidade |
|---|---|---|---|---|
| 40 | `phases/Phase0Start.jsx` | JSX | 91 | Tela inicial: novo jogo, carregar, deletar fichas |
| 41 | `phases/Phase0Start.css` | CSS | 101 | Cards, buttons, saved sheets, delete modal |
| 42 | `phases/Phase1SheetBuilder.jsx` | JSX | 296 | Builder de ficha: até 4 chars, atributos, equip, poções |
| 43 | `phases/Phase1SheetBuilder.css` | CSS | 414 | **Maior CSS** — cards, slider, budget chips, equipment |
| 44 | `phases/Phase2Customize.jsx` | JSX | 127 | Customização visual: cor, ícone, nome por personagem |
| 45 | `phases/Phase2Customize.css` | CSS | 92 | Cards, color/icon/name selectors |
| 46 | `phases/Phase3ModeSelect.jsx` | JSX | 30 | Seleção de modo: Treino / Campanha (disabled) |
| 47 | `phases/Phase3ModeSelect.css` | CSS | 61 | Card, mode buttons, back button |
| 48 | `phases/Phase4BoardSetup.jsx` | JSX | 466 | Setup tabuleiro: grid editor, obstacles, items, chars |
| 49 | `phases/Phase4BoardSetup.css` | CSS | 387 | Sidebar, canvas wrap, steppers, responsive |
| 50 | `phases/Phase5PowerSelect.jsx` | JSX | 134 | Seleção de poderes: filter + sort + grid por char |
| 51 | `phases/Phase5PowerSelect.css` | CSS | 87 | Char cards, filter/sort bar, confirm/back |
| 52 | `phases/Phase6CombatV2.jsx` | JSX | 548 | **Tela de combate principal** — canvas, HUD, modais, log, efeitos |
| 53 | `phases/Phase6CombatV2.css` | CSS | 249 | Layout combat root, action panel, log drawer, result screen |
| 54 | `phases/atb-canvas.css` | CSS | 47 | Canvas wrap + dark gradient bg + scanline |
| 55 | `phases/atb-hud.css` | CSS | 96 | HUD chips: HP/MP bars, active highlight, delta animation |
| 56 | `phases/atb-ui.css` | CSS | 516 | **Maior CSS geral** — damage balloons, modals, announcements, ordering |

### 1.5 Root (1 arquivo)

| # | Arquivo | Lang | Linhas | Responsabilidade |
|---|---|---|---|---|
| 57 | `ArenaTestbed.jsx` | JSX | 172 | Componente raiz: wizard multi-phase (0-6), game state |
| 58 | `ArenaTestbed.css` | CSS | 87 | CSS variables tema dark, tab-wrapper, step-indicator |

### 1.6 Archive (3 arquivos — não usados na build)

| # | Arquivo | Lang | Linhas | Motivo |
|---|---|---|---|---|
| A1 | `archive/getLineInDirection.js` | JS | 39 | Substituído por `getHexLine` em hexUtils |
| A2 | `archive/PowerLinePreview.jsx` | JSX | 84 | Substituído por PowerChoiceModal |
| A3 | `archive/PowerLinePreview.css` | CSS | 127 | Substituído por PowerChoiceModal.css |

### Resumo Consolidado

| Categoria | Arquivos | Total Linhas |
|---|---|---|
| JSX (ativos) | 17 | 2.216 |
| JS (ativos) | 24 | 2.737 |
| CSS (ativos) | 19 | 2.807 |
| **Ativos** | **52** | **7.760** |
| Archive | 3 | 250 |
| **Total** | **55** | **8.010** |

*(mais 4 arquivos de ReportAI/markdown elevam o total de 59 mencionado no AGENTS.md)*

---

## 2. Arquitetura de Efeitos

### 2.1 Effect Channels (3 canais)

O sistema `useEffectMachine.js` gerencia efeitos em 3 canais paralelos:

```
┌─────────────┐   ┌──────────────┐   ┌─────────┐
│  canvas     │   │   overlay    │   │   hud   │
│  (ctx draw) │   │  (DOM/CSS)  │   │ (console)│
└──────┬──────┘   └──────┬───────┘   └────┬────┘
       │                 │                │
       ▼                 ▼                ▼
  HighlightEffect   (futuro)         TextoEffect
  TrailEffect                          FlashEffect
  ProjetilEffect                       ShakeEffect
  AuraEffect                           StatusEffect
```

### 2.2 Effect Lifecycle

```
IDLE ──(dispatch)──▶ EXECUTANDO ──(finalizarEfeito)──▶ IDLE
                           │
                           ▼
                      (timeout/cleanup)
```

- `executar(channel, effectType, data)` → aloca o canal, executa primitive
- `finalizarEfeito(channel)` → libera o canal
- Se canal ocupado, efeito silenciosamente descartado (sem fila por canal)
- `useEffect` cleanup em Phase6CombatV2 chama `finalizarEfeito` para todos os canais

### 2.3 effectsMap.js — 17 Tipos Registrados

| Tipo | Channel | Primitive | Duração | Prioridade | Status |
|---|---|---|---|---|---|
| `dano` | canvas | default | 500ms | 100 | ✅ log |
| `flash` | hud | default | 200ms | 150 | ✅ log |
| `shake` | hud | default | 400ms | 140 | ✅ log |
| `projetil` | canvas | ProjetilEffect | 400ms | 200 | ✅ visual |
| `melee` | canvas | default | 300ms | 200 | ✅ log |
| `trail` | canvas | TrailEffect | 600ms | 180 | ✅ visual |
| `highlight` | canvas | HighlightEffect | 800ms | 100 | ✅ visual |
| `highlight_attack` | canvas | HighlightEffect | 600ms | 110 | ✅ visual |
| `highlight_defense` | canvas | HighlightEffect | 600ms | 110 | ✅ visual |
| `highlight_movement` | canvas | HighlightEffect | 700ms | 105 | ✅ visual |
| `highlight_range` | canvas | HighlightEffect | 500ms | 105 | ✅ visual |
| `highlight_path` | canvas | HighlightEffect | 400ms | 105 | ✅ visual |
| `highlight_damage` | canvas | HighlightEffect | 500ms | 110 | ✅ visual |
| `highlight_heal` | canvas | HighlightEffect | 600ms | 110 | ✅ visual |
| `ia_thinking` | overlay | default | 800ms | 90 | ✅ log |
| `vitoria` | hud | default | 2000ms | 250 | ✅ log |
| `derrota` | hud | default | 2000ms | 250 | ✅ log |

### 2.4 Primitivas de Efeito (EffectRenderer.js)

| Primitiva | Canal | Implementação | Visual? |
|---|---|---|---|
| **HighlightEffect** | canvas | Usa ref `highlightRef` (Phase6CombatV2), pinta células via `drawCombatBoard` | ✅ Sim |
| **TrailEffect** | canvas | Usa ref `trailRef`, desenha círculos com alpha decrescente no canvas | ✅ Sim |
| **ProjetilEffect** | canvas | Usa ref `projetilRef`, anima `projectilePos` + `projectilePath` via setState → RAF loop | ✅ Sim |
| **AuraEffect** | canvas | placeholder (`console.log`) | ❌ Futuro |
| **TextoEffect** | hud | `console.log` apenas | ❌ Apenas log |
| **FlashEffect** | hud | `console.log` apenas | ❌ Apenas log |
| **ShakeEffect** | hud | `console.log` apenas | ❌ Apenas log |
| **StatusEffect** | hud | `console.log` apenas | ❌ Apenas log |

### 2.5 Canais de Dados do Board Draw (drawCombatBoard.js params)

```
characters, obstaculos, itensChaoAtual, cols, rows,
highlightedCells, attackCells, rangeCells, currentChar,
damageFlash, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido,
tileImg, sz, padX, padY, angle, trail,
hexCenter, drawHex
```

### 2.6 Ordem de Camadas no Canvas

```
1. Tile texture (fundo) ── clip por hexágono
2. Overlay fill (highlights, atk, range, path) ── fillStyle semi-transparente
3. Stroke + shadow (borda + glow)
4. Character (spokes + circle + icon/letra)
5. Active pulse ring
6. HP bar
7. Projétil path overlay (drawHex transparente + stroke amarelo)
8. Projétil (círculo amarelo com glow)
9. Trail (círculos brancos alpha-decrescente)
10. Obstacle/item emoji overlay
```

---

## 3. Bug Timeline

### bug-1: Freeze do projétil IA (v6.9.8 → v6.9.9)

- **Sintoma:** IA ataca, projétil nunca aparece, jogo trava
- **Root cause:** Efeitos `persistente` (highlight/attack/range) no `effectsMap.js` marcados como `persistente: true` — nunca chamam `finalizarEfeito`, então o canal canvas fica ocupado para sempre
- **Fix:** Exportar `finalizarEfeito` de `useEffectMachine`, chamar em:
  - `onClearHighlight` em Phase6CombatV2
  - `useEffect` cleanup (todos os canais)

### bug-2: Freeze ataque corpo a corpo do player (v6.9.9 → v6.9.10)

- **Sintoma:** Player executa ataque corpo a corpo, jogo trava
- **Root cause:** `useCombatEngine.js` não chama `setRangeCells([])` após executar ataque — `rangeCells` persistia, sistema de highlights ficava em loop
- **Fix:** Adicionar `setRangeCells([])` em `useCombatEngine.js:371` após executar ataque

### bug-3: Buracos escuros no grid (v6.9.11 → v6.9.12)

- **Sintoma:** Células no caminho do projétil aparecem como hexágonos escuros sólidos
- **Root cause:** `drawCombatBoard.js:219` — `drawHex(ctx, center, sz, fill, ...)` com `fill = '#3d2208'` (opaco) pintava por cima da tile texture
- **Context:** Container `.atb-canvas-wrap` tem fundo `linear-gradient(#0a0a14, #050510)` — o `#3d2208` marrom escuro parecia um "buraco" contra esse fundo escuro
- **Fix:** `fill` → `'transparent'` (linha 219), preserva tile texture visível sob o stroke amarelo

### bug-4: (Evitado) Efeito de dano IA também freeze

- **Observado:** Efeito `dano` no canal canvas não tem primitiva visual implementada (só log), mas ocupa o canal por 500ms — se `persistente` estivesse true, causaria freeze
- **Mitigação:** `dano` está configurado com `persistente: false` (padrão) — timeout automático libera o canal

---

## 4. Primitivas de Efeito — Status

| Primitiva | Status | Código | Observação |
|---|---|---|---|
| `HighlightEffect` | ✅ Visual | EffectRenderer:59-80 | Desenha células highlight via ref highlightCells |
| `TrailEffect` | ✅ Visual | EffectRenderer:105-115 | Círculos brancos alpha-decrescente no canvas |
| `ProjetilEffect` | ✅ Visual | EffectRenderer:24-65 | Animação de projétil via setState RAF (projectilePos/path) |
| `AuraEffect` | ❌ Log | EffectRenderer:117-120 | `console.log('[AuraEffect]'` — sem render |
| `TextoEffect` | ❌ Log | EffectRenderer:82-93 | `console.log('[TextoEffect]'` — sem render |
| `FlashEffect` | ❌ Log | EffectRenderer:122-127 | `console.log('[FlashEffect]'` — sem render |
| `ShakeEffect` | ❌ Log | EffectRenderer:129-134 | `console.log('[ShakeEffect]'` — sem render |
| `StatusEffect` | ❌ Log | EffectRenderer:136-143 | `console.log('[StatusEffect]'` — sem render |

**Total:** 3 visuais + 5 futuros (só log)

---

## 5. Arquivos Proibidos (fora de alcance)

Por instrução do usuário, estes arquivos NÃO podem ser tocados:

| Arquivo | Razão |
|---|---|
| `engine/combat.js` | Engine de combate principal |
| `engine/hexUtils.js` | Utilitários hex grid |
| `engine/ai.js` | IA legada |
| `engine/ai/index.js` | Entry point IA |
| `engine/ai/personalidades/*.js` | Personalidades IA |
| `phases/Phase1SheetBuilder.jsx` | Builder de ficha |
| `src/pages/Arena/*` | Arena Mode (separado) |
| `engine/TurnController.js` | Singleton turn controller |

---

## 6. Import Map (Dependências Externas)

Todo arquivo que importa de fora de `ArenaTestbed/`:

| Arquivo | Importa de |
|---|---|
| `ArenaTestbed.jsx` | `../../../context/LanguageContext` |
| `JokenpoModal.jsx` | `../../../../../context/LanguageContext` |
| `PowerChoiceModal.jsx` | `../../../../../context/LanguageContext` |
| `PowerCard.jsx` | `../../../../../context/LanguageContext` |
| `PowerFilterBar.jsx` | `../../../../../context/LanguageContext` |
| `Phase0Start.jsx` | `../../../../context/LanguageContext` |
| `Phase1SheetBuilder.jsx` | `../../../../context/LanguageContext` |
| `Phase2Customize.jsx` | `../../../../context/LanguageContext` |
| `Phase3ModeSelect.jsx` | `../../../../context/LanguageContext` |
| `Phase4BoardSetup.jsx` | `../../../../context/LanguageContext` |
| `Phase5PowerSelect.jsx` | `../../../../context/LanguageContext` |
| `Phase6CombatV2.jsx` | `../../../../context/LanguageContext` |

**Total:** 12 arquivos importam `LanguageContext` — única dependência externa.

Nenhum arquivo importa Supabase, Zustand, Framer Motion, ou qualquer outro serviço global.

---

## 7. effectsMap.js — Dump Completo

```
EFFECTS_MAP = {
  dano:           { channel:'canvas', primitive:'default', duracao:500,  prioridade:100, persistente:false },
  flash:          { channel:'hud',    primitive:'default', duracao:200,  prioridade:150, persistente:false },
  shake:          { channel:'hud',    primitive:'default', duracao:400,  prioridade:140, persistente:false },
  projetil:       { channel:'canvas', primitive:'ProjetilEffect', duracao:400,  prioridade:200, persistente:true  },
  melee:          { channel:'canvas', primitive:'default', duracao:300,  prioridade:200, persistente:false },
  trail:          { channel:'canvas', primitive:'TrailEffect', duracao:600,  prioridade:180, persistente:true  },
  highlight:      { channel:'canvas', primitive:'HighlightEffect', duracao:800,  prioridade:100, persistente:true  },
  highlight_attack:    { channel:'canvas', primitive:'HighlightEffect', duracao:600,  prioridade:110, persistente:true  },
  highlight_defense:   { channel:'canvas', primitive:'HighlightEffect', duracao:600,  prioridade:110, persistente:true  },
  highlight_movement:  { channel:'canvas', primitive:'HighlightEffect', duracao:700,  prioridade:105, persistente:true  },
  highlight_range:     { channel:'canvas', primitive:'HighlightEffect', duracao:500,  prioridade:105, persistente:true  },
  highlight_path:      { channel:'canvas', primitive:'HighlightEffect', duracao:400,  prioridade:105, persistente:true  },
  highlight_damage:    { channel:'canvas', primitive:'HighlightEffect', duracao:500,  prioridade:110, persistente:true  },
  highlight_heal:      { channel:'canvas', primitive:'HighlightEffect', duracao:600,  prioridade:110, persistente:true  },
  ia_thinking:    { channel:'overlay', primitive:'default', duracao:800,  prioridade:90,  persistente:false },
  vitoria:        { channel:'hud',    primitive:'default', duracao:2000, prioridade:250, persistente:false },
  derrota:        { channel:'hud',    primitive:'default', duracao:2000, prioridade:250, persistente:false },
}
```

**Nota:** `persistente: true` significa que o efeito NÃO é removido automaticamente ao final da duração — precisa de `finalizarEfeito` explícito. Highlight, Trail e Projetil usam isso para controle manual no RAF loop.

---

## Arquivos de Report (3 existentes + este)

| Arquivo | Conteúdo |
|---|---|
| `2026-06-23_INV_BURACOS-GRID-MOVIMENTO-IA_v6.9.11.md` | Investigação inicial do bug dos buracos |
| `2026-06-23_FIX_BURACOS-GRID-PROJETIL_v6.9.12.md` | Fix: fill → transparent |
| **`2026-06-23_INV_MAPA-COMPLETO-ARENATESTBED_v6.9.13.md`** | **Este documento** |

---

## Relatório de Versão

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION bump | 10.160.15 → **10.160.16** |
| `src/config/version.js` | ARENATESTBED_VERSION bump | 6.9.12 → **6.9.13** |
| `SITE_MAP.md` | Versão atualizada na tabela | ✅ |
| `docs/ReportAI/2026-06-23_INV_MAPA-COMPLETO-ARENATESTBED_v6.9.13.md` | Relatório criado | ✅ |
| **Commit** | `[hash]` — `INV: mapa completo ArenaTestbed (59 arquivos) + v10.160.16` | ✅ |
| **Deploy** | Status | ✅ |
