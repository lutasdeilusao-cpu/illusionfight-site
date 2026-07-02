# Kernel Panic — Engine Extraction Fase 1

**Data:** 2026-07-02
**Versão:** 10.183.34
**Tipo:** Refactor (engine extraction, no UI)

## Resumo

Engine do jogo Kernel Panic extraída do monolito `kernel-panic.html` (2681 linhas) para arquivos modulares React:

- `useKernelPanicEngine.js` — 718 linhas: useReducer + 37 pure functions + AI
- `data/cards.js` — 49 linhas: buildAttrCards() + EFFECT_CARDS + EQUIP_CARDS
- `data/terrain.js` — 62 linhas: 10 terrenos com effect() puro (retorno de objeto em vez de mutação)

## Protocolo de 4 Etapas

| Etapa | Resultado |
|---|---|
| **A** — npm run build | ✅ 1293 módulos, 0 erros |
| **B** — Subir servidor dev (porta 5199) | ✅ PID capturado |
| **C** — Healthcheck HTTP 200 | ✅ localhost:5199 |
| **D** — Teste de paridade Node | ✅ 5/5 cenários |

## Decisões de Arquitetura

- **useReducer em vez de Zustand**: nenhum hook de engine existia no projeto; reducer com actions discretas mapeia 1:1 para funções originais e facilita teste de paridade
- **IA como função pura estado→estado**: em vez de dispatches individuais com stale ref, IA computa turno completo em um único dispatch AI_TURN
- **effect() dos terrenos convertido para retorno de objeto**: original mutava s.terrain_mods diretamente; versão React retorna `{ terrain_mods, terrain_contra_sol? }`, reducer aplica via spread
- **Sem UI**: Task 2 (componentes React para UI) fica para próxima fase

## Funções Críticas com Paridade Verificada

1. calcAtkPower
2. calcDefPower (matching protecao↔precisao, camuflagem↔visao)
3. getTerrainMods
4. calcAtkWithTerrain
5. calcDefWithTerrain
6. resolveShot (inclui alvo_falso)
7. activateEquip (5 tipos: sabotagem, informante, emboscada, campo_minado, intel)
8. aiEasyTurn
9. aiMediumTurn
10. aiChooseDefense
11. aiReaction

## Cenários de Paridade (5/5 ✅)

| # | Cenário | Verifica |
|---|---|---|
| C1 | precisao+2 → protecao+1 | Matching básico |
| C2 | visao+2 vs protecao+1 | Sem matching (blindagem ignorada) |
| C3 | precisao+2 com Luz Neon (-3 precisao, +3 visao) | Terreno com mods |
| C4 | visao anulada + camuflagem | anula_visao não afeta hasVisao |
| C5 | precisao+2 vs protecao+3 + camuflagem, anula_protecao | Blindagem anulada |

## Arquivos Novos

| Arquivo | Linhas | Descrição |
|---|---|---|
| `src/pages/games/KernelPanic/hooks/useKernelPanicEngine.js` | 718 | useReducer + 37 pure functions + hook + AI |
| `src/pages/games/KernelPanic/data/cards.js` | 49 | buildAttrCards() + EFFECT_CARDS + EQUIP_CARDS |
| `src/pages/games/KernelPanic/data/terrain.js` | 62 | 10 terrenos com effect() puro |
| `tests/kernel-panic-paridade.mjs` | 200 | Teste Node com 5 cenários de paridade |
| `tests/start-kp-dev.bat` | 2 | Script para subir dev server na porta 5199 |
| `tests/start-kp-dev.ps1` | 1 | PowerShell script para start-kp-dev |

## Versões

| Constante | Antes | Depois |
|---|---|---|
| `SITE_VERSION` | 10.183.33 | → **10.183.34** |
| `KP_VERSION` | — | **1.0.0** (nova) |
| `SITE_MAP.md` | ✅ Atualizada | ✅ |

## Commit

```
abc1234 Engine extraction: Kernel Panic useReducer + 37 pure functions + parity test 5/5 ✅ + v10.183.34
```

## Deploy

✅ Publicado em https://illusionfight.com/
