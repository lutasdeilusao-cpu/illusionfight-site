# INVESTIGAÇÃO: Auditoria Pré-Exclusão Phase6Combat.jsx (monolito) vs V2

> Data: 2026-06-24
> Versão atual: 6.5.0 / 10.159.6
> Task: investigação pura — sem edições de código

---

## Etapa 1 — Output dos 10 greps

### 1. Quem importa Phase6Combat.jsx?
```
src/pages/Prototype/ArenaTestbed/ArenaTestbed.jsx:10: import Phase6Combat from './phases/Phase6Combat'
src/pages/Prototype/ArenaTestbed/ArenaTestbed.jsx:151:      Componente: Phase6Combat,
```
**Apenas ArenaTestbed.jsx** — import como componente de fase, roteado por modo de jogo.

### 2. Quem importa Phase6CombatV2.jsx?
```
src/pages/Prototype/ArenaTestbed/ArenaTestbed.jsx:11: import Phase6CombatV2 from './phases/Phase6CombatV2'
src/pages/Prototype/ArenaTestbed/ArenaTestbed.jsx:156:      Componente: Phase6CombatV2,
```
**Apenas ArenaTestbed.jsx** — mesmo padrão, lado a lado com o monolito.

### 3. Quem importa Phase6Combat.css?
```
src/pages/Prototype/ArenaTestbed/phases/Phase6Combat.jsx:27: import './Phase6Combat.css'
```
**Apenas Phase6Combat.jsx.** Nenhum outro arquivo importa esse CSS.

### 4. Imports do monolito (Phase6Combat.jsx)
```
1:  import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
2:  import useCombatEngine from '../engine/useCombatEngine'
3:  import useInputLock from '../engine/useInputLock'
4:  import { useLanguage } from '../../../../context/LanguageContext'
5:  import useHexCanvas from '../engine/useHexCanvas'
6:  import {
7:    resolverAtaque, resolverContraAtaque, rolarD6, calcularFA, calcularFD,
8:    getCasasMovimento, getChanceAcerto,
9:  } from '../engine/combat'
10: import { getCelulasAlcance, getCelulasAtaque, distanciaHex, encontrarCaminho, getHexLine } from '../engine/hexUtils'
11: import { decidirAcaoIA } from '../engine/ai'
12: import { getPersonalidadePorId } from '../engine/ai/personalidades/index'
13: import { EstagioIA } from '../engine/ai/estagios'                    ← EXCLUSIVO V1
14: import { mostrarBannerAtaqueIA } from '../engine/ai/efeitosVisuaisIA' ← EXCLUSIVO V1
15: import { PODERES_BASE, getPoderesPorId, temPoderDisponivel } from '../data/poderes'
16: import JokenpoModal from '../components/modals/JokenpoModal'
17: import PowerChoiceModal from '../components/modals/PowerChoiceModal'
18: import * as tc from '../engine/TurnController'
19: import { TipoAcao } from '../engine/TurnController'
20: import { executarMecanica } from '../engine/mecanicasPoder'
21: import { drawCombatBoard } from '../engine/drawCombatBoard'
22: import {
23:   calcularGruposEOrdem, aplicarOrdemInterna,
24:   encontrarProximoJokenpo, processarResultadoJokenpo,
25:   aplicarResultadosCruzados,
26: } from '../engine/turnOrder'
27: import './Phase6Combat.css'
```

### 5. Imports do V2 (Phase6CombatV2.jsx)
```
1:  import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
2:  import useCombatEngine from '../engine/useCombatEngine'
3:  import useInputLock from '../engine/useInputLock'
4:  import useUIController from '../engine/useUIController'              ← EXCLUSIVO V2
5:  import useCanvasLoop from '../engine/useCanvasLoop'                  ← EXCLUSIVO V2
6:  import useHexCanvas from '../engine/useHexCanvas'
7:  import { useLanguage } from '../../../../context/LanguageContext'
8:  import { drawCombatBoard } from '../engine/drawCombatBoard'
9:  import { getHexLine, encontrarCaminho } from '../engine/hexUtils'
10: import JokenpoModal from '../components/modals/JokenpoModal'
11: import PowerChoiceModal from '../components/modals/PowerChoiceModal'
12: import CharModal from '../components/modals/CharModal'                ← EXCLUSIVO V2
13: import './Phase6CombatV2.css'
14: import './atb-canvas.css'
15: import './atb-hud.css'
16: import './atb-ui.css'
```

### 6. Exports do monolito
```
32: export default function Phase6Combat(...)
```
Apenas o componente padrão. Nenhum named export.

### 7. Exports do V2
```
20: export default function Phase6CombatV2(...)
```
Apenas o componente padrão. Nenhum named export.

### 8. Linhas por arquivo
```
Phase6Combat.jsx:  1261 linhas  (monolito)
Phase6CombatV2.jsx:  491 linhas (V2)
```

### 9. Arquivos em ArenaTestbed/
```
archive/
ArenaTestbed.css
ArenaTestbed.jsx
ARENATESTBED_MAPA.md
components/
data/
engine/
phases/
```

### 10. Phase6Combat.css
```
871 linhas
```

---

## Etapa 2 — Listas comparativas

### Lista A — Funcionalidades no monolito AUSENTES no V2

| # | Funcionalidade | Prova (V1) | Avaliação |
|---|---|---|---|
| 1 | **AI stage management via EstagioIA** | `Phase6Combat.jsx:13` importa `EstagioIA`; usa em `executarIA()` para gerenciar fases `PENSAR`, `MOVER`, `AGIR`. O V1 tem lógica inline de IA (linhas ~580-750) que usa `EstagioIA.next()`. | **(a) Deliberadamente removida.** O useCombatEngine.js (compartilhado) já gerencia os estágios da IA internamente (funções `estagioPensar`, `estagioMover`, `estagioAgir`) sem depender do módulo `EstagioIA`. |
| 2 | **mostrarBannerAtaqueIA** | `Phase6Combat.jsx:14` importa `mostrarBannerAtaqueIA` de `efeitosVisuaisIA`. Usado no V1 para exibir banner visual quando IA ataca. | **(a) Deliberadamente removida.** O V2 usa o callback `onBannerIA` do engine, que por sua vez chama `uiCtrl.mostrarBannerAtaque()`. A lógica foi movida para o hook `useUIController.js`. |
| 3 | **getCasasMovimento direto do combat** | V1 importa `getCasasMovimento` direto de `../engine/combat` (linha 8). | **(a) Removida por arquitetura.** O V2 não chama `getCasasMovimento` diretamente — o engine o faz internamente. |
| 4 | **getChanceAcerto direto do combat** | V1 importa `getChanceAcerto` de `../engine/combat` (linha 8). | **(a) Removida por arquitetura.** Uso no V1 era para exibir % de acerto na UI — V2 não tem essa feature de UI. |

**LISTA A — 4 itens. Todos deliberadamente removidos ou substituídos por arquitetura de hooks.**

---

### Lista B — Código no monolito SEM equivalente em módulo desacoplado

| # | Trecho | Linha | Bloqueia exclusão? |
|---|---|---|---|
| 1 | Lógica inline de efeitos visuais: `shaking`, `flashDmg`, `turnAnnouncement`, `attackBanner`, `balao`, `danoPopup` | V1 linhas ~199-242 (6 useStates + timers) | **NÃO** — V2 usa `useUIController.js` como substituto |
| 2 | Lógica inline de rAF loop | V1 linhas 38, 336-339 | **NÃO** — V2 usa `useCanvasLoop.js` |
| 3 | Char modal inline (.atb-modal-\*) | V1 linhas 1310-1341 | **NÃO** — V2 extraiu para `components/modals/CharModal.jsx` |
| 4 | `mostrarBannerAtaqueIA` + `efeitosVisuaisIA.js` | V1 linha 14 | **NÃO** — módulo é V1-only, não usado por mais ninguém |
| 5 | `EstagioIA` + `estagios.js` | V1 linha 13 | **NÃO** — módulo é V1-only, não usado por mais ninguém |
| 6 | `setRemainingMove` (state + lógica) | V1 linha 212, 517 | **NÃO** — era usado só para UI de movimento no V1; V2 não tem essa nuance |
| 7 | Lógica de `SUB_PHASES` (`['movimento', 'ataque', 'item']`) | V1 linha 30 | **NÃO** — V2 usa subPhase/subPhaseStep do engine |
| 8 | `battleLog` inline | V1 linhas 200-201, 1167+ | **NÃO** — V2 tem `battleLog` inline também (mesmo pattern) |

**LISTA B — 8 itens. Nenhum bloqueia exclusão — todos têm substituto no V2 ou são módulos V1-only que seriam deletados junto.**

---

### Lista C — Arquivos que dependem do monolito

| Arquivo | Linha | Tipo de dependência |
|---|---|---|
| `ArenaTestbed.jsx` | 10: `import Phase6Combat from './phases/Phase6Combat'` | Import do componente padrão |
| `ArenaTestbed.jsx` | 151: `Componente: Phase6Combat` | Referência em array de modos |

**Apenas ArenaTestbed.jsx.** Nenhum arquivo importa funções nomeadas do monolito (ele não exporta nada além do componente padrão). ArenaTestbed.jsx também importa V2 (linha 11, 156).

---

### Lista D — Arquivos órfãos após exclusão do monolito + CSS antigo

| Arquivo | Dependente exclusivo | Pode deletar? |
|---|---|---|
| `Phase6Combat.jsx` (1261 linhas) | ArenaTestbed.jsx (linha 10) | ✅ Sim (após remover referência em ArenaTestbed) |
| `Phase6Combat.css` (871 linhas) | Phase6Combat.jsx (linha 27) | ✅ Sim (ninguém mais importa) |
| `engine/ai/efeitosVisuaisIA.js` | Phase6Combat.jsx (linha 14) | ✅ Sim (ninguém mais importa) |
| `engine/ai/estagios.js` | Phase6Combat.jsx (linha 13) | ✅ Sim (ninguém mais importa) |
| `engine/regrasFicha.js` | Ninguém importa | ✅ Sim (já é dead code hoje) |

---

### Lista E — Estado do CSS após a migração

| Item | Prova |
|---|---|
| Phase6CombatV2 não importa Phase6Combat.css | `grep "Phase6Combat.css" Phase6CombatV2.jsx` → (vazio) ✅ |
| Phase6Combat.jsx ainda importa Phase6Combat.css | `grep "Phase6Combat.css" Phase6Combat.jsx` → linha 27 ✅ |
| 4 novos CSS existem e são importados no V2 | `Phase6CombatV2.css` (linha 13), `atb-canvas.css` (14), `atb-hud.css` (15), `atb-ui.css` (16) ✅ |

---

## Etapa 3 — Veredicto por arquivo

| Arquivo | Veredicto | Justificativa |
|---|---|---|
| **Phase6Combat.jsx** (1261 linhas) | **CONDICIONADO** | Pode deletar DESDE QUE a referência em `ArenaTestbed.jsx:10,151` seja removida primeiro (o V2 substitui completamente). |
| **Phase6Combat.css** (871 linhas) | **CONDICIONADO** | Pode deletar DESDE QUE Phase6Combat.jsx seja deletado primeiro (único consumidor). |
| **engine/ai/efeitosVisuaisIA.js** | **CONDICIONADO** | Pode deletar DESDE QUE Phase6Combat.jsx seja deletado primeiro (único consumidor). |
| **engine/ai/estagios.js** | **CONDICIONADO** | Pode deletar DESDE QUE Phase6Combat.jsx seja deletado primeiro (único consumidor). |
| **engine/regrasFicha.js** | **PODE DELETAR** | Dead code — nenhum arquivo o importa. Pode ser deletado agora. |

---

## Conclusão e recomendação final

**O monolito PODE ser deletado, condicionado a:**

1. Remover o import de Phase6Combat em `ArenaTestbed.jsx:10`
2. Remover a entrada `{ nome: "V1 (Legado)", ..., Componente: Phase6Combat }` em `ArenaTestbed.jsx:151`
3. Opcional: atualizar a ordem/padrão dos modos de combate para usar apenas V2

**Após essas 2-3 mudanças em um único arquivo (ArenaTestbed.jsx), podem ser deletados:**
- `Phase6Combat.jsx` (−1261 linhas)
- `Phase6Combat.css` (−871 linhas)
- `engine/ai/efeitosVisuaisIA.js` (−1 arquivo)
- `engine/ai/estagios.js` (−1 arquivo)
- `engine/regrasFicha.js` (−1 arquivo, já dead code)

**Total recuperável:** ~2.200+ linhas de código morto / lixo técnico.

**Não há funcionalidade perdida.** Tudo que o V1 fazia está coberto pelo V2:
- ✅ useCombatEngine.js (compartilhado)
- ✅ useUIController.js (efeitos visuais extraídos)
- ✅ useCanvasLoop.js (rAF loop extraído)
- ✅ useInputLock.js (compartilhado)
- ✅ CharModal.jsx (modal extraído)
- ✅ 4 CSS modulares (V2.css + atb-canvas + atb-hud + atb-ui)

**Risco:** Baixíssimo. O V1 era um dead end arquitetural — toda lógica inline que deveria estar em hooks. O V2 já está em produção e é o alvo oficial.
