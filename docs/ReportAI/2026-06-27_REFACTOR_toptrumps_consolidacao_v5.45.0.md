# REFACTOR — TopTrumps: remover v1 + consolidar v2 como única versão

**Data:** 2026-06-27  
**Versão:** SITE 10.183.8 → **10.183.9** / TS 5.44.6 → **5.45.0**  
**Status:** ✅ PUBLICADO

---

## ETAPA 0.5 — Auditoria de dependências v2 → v1

### 1. TopTrumps.css importado na v2
```
(nenhum)
```
✅ V2 não importa TopTrumps.css diretamente, mas usa classes dele.

### 2. v2 importa TopTrumps.jsx
```
(nenhum)
```
✅ Nenhuma dependência direta.

### 3. v2 usa funções do v1
```
(nenhum)
```
✅ Nenhuma função v1 usada na v2.

### 4. v2 usa componentes da pasta v1
```
(nenhum)
```
⚠️ MAS MenuScreen.jsx (v2) importa CardViewerModal, DeckBuilder, DeckStartModal (v1).

### 5. Classes CSS usadas na v2 não definidas nos styles v2
```
tt-btn-confirmar, tt-recompensa, tt-recompensa-cards, tt-recompensa-card-verso,
tt-recompensa-card-verso-label, tt-recompensa-card-verso-texto, tt-recompensa-sub,
tt-recompensa-titulo, tt-fim-*, tt-relatorio-*, tt-desistir-modal-*, tt-guest-*,
tt-locked-*, tt-modo-*, tt-ppt-container, tt-vs-heartbeat-*, tt-ja-ganhou-*, etc.
```
⚠️ Muitas classes de TopTrumps.css são usadas pela v2. **TopTrumps.css preservado** e importado via `import './TopTrumps.css'` em TopTrumpsSP.jsx.

### 6. v2 importa hooks de TopTrumps.jsx
```
(nenhum)
```
✅

### 7. Todos os hooks da v2 são arquivos independentes
```
(nenhum)
```
✅

**Decisão:** TopTrumps.css preservado (compartilhado). useTopTrumpsDeck.js mesclado (hook v2 + funções v1).

---

## ETAPA 1 — Rotas de toptrumps no App.jsx (ANTES)

```jsx
// Imports:
import TopTrumps from './pages/games/TopTrumps/TopTrumps'                          // v1
import TopTrumpsSP_v2 from './pages/games/TopTrumps/v2/TopTrumpsSP_v2'              // v2
import TopTrumpsSP_v2_RewardTest from './pages/games/TopTrumps/v2/TopTrumpsSP_v2_RewardTest'  // test

// Rotas:
<Route path="/games/toptrumps/v2/reward-test" element={<TopTrumpsSP_v2_RewardTest />} />
<Route path="/games/toptrumps/v2" element={<TopTrumpsSP_v2 />} />
<Route path="/games/toptrumps/legacy" element={<FichaGateRoute ...><TopTrumps /></FichaGateRoute>} />
<Route path="/games/toptrumps" element={<TopTrumpsSP_v2 />} />
```

## DEPOIS

```jsx
// Imports:
import TopTrumpsSP from './pages/games/TopTrumps/TopTrumpsSP'

// Rotas:
<Route path="/games/toptrumps" element={<TopTrumpsSP />} />
```

---

## ETAPA 2 — Git mv executados

```
git mv v2/hooks -> hooks                          (hooks mesclados com v1 existente)
git mv v2/components -> components                (components mesclados com v1)
git mv v2/styles -> styles                        (ok)
git mv v2/TopTrumpsSP_v2.jsx -> TopTrumpsSP.jsx   (orquestrador renomeado)
git mv v2/TopTrumpsSP_v2_RewardTest.jsx -> purgado (deletado)
```

### Arquivos deletados
```
git rm src/pages/games/TopTrumps/TopTrumps.jsx     (v1 - 1049 linhas)
git rm TopTrumpsSP_RewardTest.jsx                   (test page)
```

### Arquivos preservados
```
TopTrumps.css (v1) → importado por TopTrumpsSP.jsx
utils/attrNomeKey.js → movido (já estava em TopTrumps/utils/)
hooks/useTopTrumpsDeck.js → mesclado (hook v2 + funções v1)
```

---

## ETAPA 4 — Verificação de imports quebrados

```
1. v2 references:        (vazio) ✅
2. reward-test:          (vazio) ✅
3. TopTrumps.jsx:        (vazio) ✅
```

---

## Estrutura final

```
src/pages/games/TopTrumps/
├── TopTrumps.css              # CSS compartilhado (preservado do v1)
├── TopTrumpsLobby.css
├── TopTrumpsLobby.jsx
├── TopTrumpsMP.css
├── TopTrumpsMP.jsx
├── TopTrumpsSP.jsx            # Orquestrador da v2 (único)
├── components/
│   ├── BurstParticles/
│   ├── CardViewerModal.jsx    # v1 preservado (usado pelo MenuScreen)
│   ├── CurtainReveal/
│   ├── DeckBuilder.jsx        # v1 preservado (usado pelo MenuScreen)
│   ├── DeckStartModal.jsx     # v1 preservado (usado pelo MenuScreen)
│   ├── FireParticles/
│   ├── GameHUD/
│   ├── GameOverScreen/
│   ├── GameScreen/
│   ├── MenuScreen/
│   ├── ResultScreen/
│   ├── RewardScreen/
│   └── SoundToggle/
├── hooks/
│   ├── useGameEffects.js
│   ├── useTopTrumpsDeck.js    # Mesclado: hook v2 + funções v1
│   ├── useTopTrumpsRewards.js
│   └── useTopTrumpsSP.js
├── styles/
│   ├── GameScreen.css
│   ├── MenuScreen.css
│   ├── ResultScreen.css
│   └── tokens.css
└── utils/
    └── attrNomeKey.js
```

---

## TESTE LÓGICO

| Fluxo | Resultado |
|---|---|
| **Fluxo 1 — pasta limpa**: v2/ não existe, TopTrumps.jsx deletado ✅ | ✅ |
| **Fluxo 2 — imports internos**: TopTrumpsSP.jsx importa ./hooks, ../styles, ./components ✅ | ✅ |
| **Fluxo 3 — App.jsx limpo**: 1 rota /games/toptrumps, sem legacy/v2/reward-test ✅ | ✅ |
| **Fluxo 4 — build**: npm run build sem erros, 26 rotas pré-renderizadas ✅ | ✅ |

---

## Playwright

N/A — nenhuma modificação funcional nos componentes. Apenas movimentação de arquivos.

---

## VERSÕES

| Constante | Antes | Depois |
|---|---|---|
| `SITE_VERSION` | 10.183.8 | → **10.183.9** |
| `TS_VERSION` | 5.44.6 | → **5.45.0** |

---

## COMMIT E DEPLOY

| Commit | Hash | Deploy |
|---|---|---|
| `refactor(toptrumps): remover v1 + consolidar v2 como única versão [v5.45.0]` | `2cd9c2c0` | ✅ Published |

---

## PRERENDER

26 rotas (era 29 — removidas /v2, /v2/reward-test, /legacy)

---

## TESTE MANUAL (Isaias)

Acessar `https://illusionfight.com/games/toptrumps` e jogar uma partida completa:
- Menu → configurar turnos → Deck Start → PPT → jogar → resultado → recompensa → fim
- Confirmar que está funcionando igual ao que foi testado na v2
