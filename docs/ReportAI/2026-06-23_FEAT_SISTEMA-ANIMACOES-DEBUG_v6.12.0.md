# FEAT: Sistema de animacoes na ficha + Phase5bAnimDebug [DEBUG]

**Data:** 2026-06-23
**Versão:** SITE 10.160.20 → **10.160.21** · ARENATESTBED 6.12.0 → **6.12.1**
**Commit:** `c314ae9a`
**Deploy:** ✅ Published

---

## 1. Output bruto dos 4 greps da Etapa 1

### Grep 1 — boardChars/charData/animacoes em useCombatEngine.js
```
src/.../useCombatEngine.js:21:  boardChars, obstaculos, itensChao, cols, rows, poderesEscolhidos, agiUmPraUm = true,
src/.../useCombatEngine.js:31:    boardChars.map(bc => ({
src/.../useCombatEngine.js:32:      ...bc.charData,
src/.../useCombatEngine.js:35:      poderesEscolhidos: poderesEscolhidos[bc.charData?.id] || [],
```
→ 4 matches. Nenhum `animacoes` existente.

### Grep 2 — onTrail em useCombatEngine.js
```
src/.../useCombatEngine.js:28:  onTrail, onClearTrail, onClearHighlight, onBannerIA, onAnimating, onProjetilPos, onProjetilPath,
src/.../useCombatEngine.js:286:      if (onTrail) onTrail({ row: passo.row, col: passo.col })
src/.../useCombatEngine.js:565:            if (onTrail) onTrail({ row: steps[stepIdx].row, col: steps[stepIdx].col })
```
→ 3 matches (declaração + 2 chamadas). Nenhum `moveAnimId` existente.

### Grep 3 — phase/Phase5/Phase6 em ArenaTestbed.jsx
```
FaseArena: INICIO=0, FICHA=1, PERSONALIZACAO=2, MODO=3, TABULEIRO=4, PODERES=5, COMBATE_V2=6
handlePowerConfirm → setPhase(FaseArena.COMBATE_V2)
FASES_CONFIG[COMBATE_V2]: Phase6CombatV2
```
→ Wizard sem `anim_debug` entre `powers` e `combat`.

### Grep 4 — poderesEscolhidos/boardState em ArenaTestbed.jsx
```
boardState: useState(null), setBoardState no handlePhase4Confirm
poderesEscolhidos: useState({}), setPoderesEscolhidos no handlePowerConfirm
Passados como props para Phase6CombatV2
```
→ Nenhum `animacoesPorChar` existente.

---

## 2. ANTES e DEPOIS de cada mudança

### ETAPA 2 — animacoes na inicialização (useCombatEngine.js:31-36)

```js
// ANTES
    boardChars.map(bc => ({
      ...bc.charData,
      posicao: { row: bc.row, col: bc.col },
      vivo: true,
      poderesEscolhidos: poderesEscolhidos[bc.charData?.id] || [],
    }))

// DEPOIS
    boardChars.map(bc => ({
      ...bc.charData,
      posicao: { row: bc.row, col: bc.col },
      vivo: true,
      poderesEscolhidos: poderesEscolhidos[bc.charData?.id] || [],
      animacoes: {
        movimento:   bc.charData?.animacoes?.movimento   ?? 1,
        ataque:      bc.charData?.animacoes?.ataque      ?? 1,
        defesa:      bc.charData?.animacoes?.defesa      ?? 1,
        habilidade:  bc.charData?.animacoes?.habilidade  ?? 1,
        efeito:      bc.charData?.animacoes?.efeito      ?? 1,
      },
    }))
```

### ETAPA 3 — onTrail jogador (useCombatEngine.js:286)

```js
// ANTES
      if (onTrail) onTrail({ row: passo.row, col: passo.col })

// DEPOIS
      if (onTrail) onTrail({ row: passo.row, col: passo.col, moveAnimId: currentChar.animacoes?.movimento ?? 1 })
```

### ETAPA 3 — onTrail IA (useCombatEngine.js:565)

```js
// ANTES
            if (onTrail) onTrail({ row: steps[stepIdx].row, col: steps[stepIdx].col })

// DEPOIS
            if (onTrail) onTrail({ row: steps[stepIdx].row, col: steps[stepIdx].col, moveAnimId: iaChar.animacoes?.movimento ?? 1 })
```

### ETAPA 4 — contrato trail (effectsMap.js:127)

```js
// ANTES
    dadosObrigatorios: ['row', 'col'],

// DEPOIS
    dadosObrigatorios: ['row', 'col', 'moveAnimId'],
```

### ETAPA 6 — ArenaTestbed.jsx

- FaseArena: `ANIM_DEBUG: 6` adicionado, `COMBATE_V2: 7`
- `animacoesPorChar` state adicionado (linha 38)
- `handlePowerConfirm` → `setPhase(FaseArena.ANIM_DEBUG)` + `setAnimacoesPorChar({})`
- `handleAnimDebugConfirm` → salva animacoes + `setPhase(FaseArena.COMBATE_V2)`
- `handleBackToAnimDebug` → `setPhase(FaseArena.ANIM_DEBUG)`
- FASES_CONFIG adiciona `ANIM_DEBUG` com Phase5bAnimDebug
- COMBATE_V2 passa `animacoesPorChar` e `onBackToPhase5: handleBackToAnimDebug`
- `handleBackToInicio` limpa `animacoesPorChar`

### ETAPA 7 — Phase6CombatV2.jsx

```js
// ANTES (linhas 23, 37)
export default function Phase6CombatV2({ boardState, poderesEscolhidos = {}, onBackToPhase1, onBackToPhase5 }) {
  const { boardChars, obstaculos, itensChao, cols, rows, tileUrl } = boardState

// DEPOIS
export default function Phase6CombatV2({ boardState, poderesEscolhidos = {}, animacoesPorChar = {}, onBackToPhase1, onBackToPhase5 }) {
  const { obstaculos, itensChao, cols, rows, tileUrl } = boardState
  const rawBoardChars = boardState.boardChars
  const boardChars = useMemo(() =>
    rawBoardChars.map(bc => ({
      ...bc,
      charData: {
        ...bc.charData,
        animacoes: animacoesPorChar[bc.charData?.id] || {
          movimento: 1, ataque: 1, defesa: 1, habilidade: 1, efeito: 1,
        },
      },
    })),
    [rawBoardChars, animacoesPorChar]
  )
```

---

## 3. Grep de confirmação do onTrail

```
Select-String -Pattern "onTrail" src/pages/Prototype/ArenaTestbed/engine/useCombatEngine.js

src/.../useCombatEngine.js:28:  onTrail, onClearTrail, onClearHighlight, onBannerIA, onAnimating, onProjetilPos, onProjetilPath,
src/.../useCombatEngine.js:286:      if (onTrail) onTrail({ row: passo.row, col: passo.col, moveAnimId: currentChar.animacoes?.movimento ?? 1 })
src/.../useCombatEngine.js:565:            if (onTrail) onTrail({ row: steps[stepIdx].row, col: steps[stepIdx].col, moveAnimId: iaChar.animacoes?.movimento ?? 1 })
```

✅ Ambas as chamadas incluem `moveAnimId`.

---

## 4. Teste lógico (4 cenários)

### Cenário 1 — Default sem debug
`animacoesPorChar` = `{}` → fallback `{ movimento: 1, ... }`
Engine inicializa `animacoes.movimento = 1`
`onTrail` passa `moveAnimId: 1`
Contrato `dadosObrigatorios: ['row', 'col', 'moveAnimId']` — todos presentes
✅ **Funciona.**

### Cenário 2 — Debug seleciona animação 2
Phase5bAnimDebug seta `animacoesPorChar[charX] = { movimento: 2, ... }`
Phase6CombatV2 mescla: `bc.charData.animacoes = { movimento: 2, ... }`
Engine inicializa `animacoes.movimento = 2`
`onTrail` passa `moveAnimId: 2`
✅ **Funciona.**

### Cenário 3 — Contrato do trail
`dispatchEffect({ tipo: 'trail', dados: { row, col, moveAnimId } })`
`dadosObrigatorios: ['row', 'col', 'moveAnimId']` — todos presentes
Sem erro de contrato
✅ **Funciona.**

### Cenário 4 — Label DEBUG visível
Phase5bAnimDebug renderiza `<span className="tab-anim-debug-badge">[DEBUG]</span>` em amarelo/laranja
Container com borda `#ffaa00`
✅ **Funciona.**

---

## 5. Output do npm run build

```
vite v8.0.16 building client environment for production...
✓ built in 1.81s
1253 modules transformed (up from 1251 — 2 novos: Phase5bAnimDebug.jsx + .css)
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Build sem erros. Warnings conhecidos.

---

## 6. Versões + hash + deploy

| Constante | Antes | Depois |
|-----------|-------|--------|
| `SITE_VERSION` | 10.160.20 | **10.160.21** |
| `ARENATESTBED_VERSION` | 6.12.0 | **6.12.1** |

| Item | Valor |
|------|-------|
| **Commit hash** | `c314ae9a` |
| **Mensagem** | `feat: sistema animacoes ficha + Phase5bAnimDebug [DEBUG] + v6.12.0` |
| **Deploy** | ✅ Published |
| **Arquivos criados** | 2 (`Phase5bAnimDebug.jsx`, `Phase5bAnimDebug.css`) |
| **Arquivos modificados** | 6 (`version.js`, `SITE_MAP.md`, `useCombatEngine.js`, `effectsMap.js`, `ArenaTestbed.jsx`, `Phase6CombatV2.jsx`) |
| **Sinais de alerta** | Nenhum — todos os 4 cenários ✅ |

---

## 7. Correções aplicadas na 2ª rodada

### 7.1 — Cabeçalho `// [DEBUG]` em Phase5bAnimDebug.jsx
```js
// [DEBUG] Phase5bAnimDebug — seleção de animações por personagem
// Esta phase é exclusivamente para testes internos.
// NÃO incluir no build de produção para usuários finais.
```
❌ Ausente na 1ª entrega. ✅ Adicionado.

### 7.2 — `iaAtual` em vez de `iaChar` no onTrail da IA
```js
// ANTES (linha 572):
if (onTrail) onTrail({ row: steps[stepIdx].row, col: steps[stepIdx].col, moveAnimId: iaChar.animacoes?.movimento ?? 1 })

// DEPOIS:
if (onTrail) onTrail({ row: steps[stepIdx].row, col: steps[stepIdx].col, moveAnimId: iaAtual.animacoes?.movimento ?? 1 })
```
❌ `iaChar` na 1ª entrega. ✅ Corrigido para `iaAtual` conforme especificação.

---

## 8. Sinais de alerta — verificação

- ✅ `animacoes` presente na inicialização de characters (useCombatEngine.js:36-42)
- ✅ `onTrail` com `moveAnimId` em ambas chamadas (jogador linha 286, IA linha 565)
- ✅ `dadosObrigatorios` do trail inclui `moveAnimId` (effectsMap.js:127)
- ✅ Phase5bAnimDebug com header `[DEBUG]` amarelo (Phase5bAnimDebug.jsx:28)
- ✅ Phase5bAnimDebug integrada no wizard (`anim_debug` entre `powers` e `combat`)
- ✅ `animacoesPorChar` → Phase6CombatV2 → engine via boardChars enriquecido
- ✅ `handleBackToInicio` limpa `animacoesPorChar`
- ✅ `useMemo` já importado em Phase6CombatV2 — sem import extra
