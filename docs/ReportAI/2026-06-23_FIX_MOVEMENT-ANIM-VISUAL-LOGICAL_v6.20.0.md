# FIX: Movement Animations — Visual-Only Steps (V1+V2)

> **Data:** 2026-06-23
> **Versão:** ARENATESTBED **6.19.0 → 6.20.0** / SITE **10.160.36 → 10.160.37**
> **Commit:** (ver abaixo)
> **Status:** CORRIGIDO

---

## Problema

### V1 (ALTA) — Movement animations mutam `posicao` lógico durante animação visual

As 3 animações de movimento (`moveAnim1Standard.js`, `moveAnim2Teleport.js`, `moveAnim3Slingshot.js`) usavam `syncCharacters` para atualizar o `posicao` lógico do personagem **a cada step** da animação. Isso viola o princípio de separação visual/lógico.

**Risco:** Se o componente for desmontado durante um step intermediário, o `posicao` lógico fica num hexágono intermediário — estado inconsistente.

**Contraste:** Attack/range/defense animations usam `setCharVisualPos` (visual-only) e nunca tocam `posicao` lógico.

### V2 (MÉDIA) — Movement animations não tinham `setCharVisualPos` no contrato

`moveAnim1Standard.js` e `moveAnim2Teleport.js` não recebiam `setCharVisualPos` no destructuring do `execute()`, embora `useCombatEngine.js` já passasse o parâmetro. Isso quebrava a consistência da API entre as 3 animações de movimento.

---

## Etapa 1 — Prova de leitura (greps)

### Comando 1 — `syncCharacters` / `posicao` mutation

```
> Get-ChildItem ... | ForEach-Object { Select-String -Path $_.FullName -Pattern "syncCharacters|posicao.*row|posicao.*col" }

attackAnim1StandardPlus.js:16:  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
attackAnim1StandardPlus.js:17:  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
attackAnim1StandardPlus.js:39:          alvo.posicao.row, alvo.posicao.col)
attackAnim2RageDash.js:19:  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
attackAnim2RageDash.js:20:  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
attackAnim2RageDash.js:69:            onBalloon(alvo.id, word, 'impact', alvo.posicao.row, alvo.posicao.col)
attackAnim3EnergyPunch.js:20:  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
attackAnim3EnergyPunch.js:21:  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
attackAnim3EnergyPunch.js:101:        onBalloon(alvo.id, word, 'impact', alvo.posicao.row, alvo.posicao.col)
rangeAnim1StraightShot.js:15:  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
rangeAnim1StraightShot.js:16:  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
rangeAnim1StraightShot.js:75:        alvo.posicao.row, alvo.posicao.col)
rangeAnim2BurstFire.js:17:  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
rangeAnim2BurstFire.js:18:  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
rangeAnim2BurstFire.js:96:            alvo.posicao.row, alvo.posicao.col)
rangeAnim3SpiritGun.js:18:  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
rangeAnim3SpiritGun.js:19:  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
rangeAnim3SpiritGun.js:87:            alvo.posicao.row, alvo.posicao.col)
defenseAnim1Hit.js:10:  const pos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
defenseAnim2Block.js:14:  const alvoPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
defenseAnim2Block.js:15:  const atacPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
defenseAnim3MagicShield.js:14:  const alvoPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
defenseAnim3MagicShield.js:15:  const atacPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
moveAnim1Standard.js:9: * @param {function} syncCharacters
moveAnim1Standard.js:20:  charsRef, syncCharacters,
moveAnim1Standard.js:33:    syncCharacters(prev =>
moveAnim1Standard.js:35:        ? { ...c, posicao: { row: step.row, col: step.col } }
moveAnim2Teleport.js:9:  charsRef, syncCharacters,
moveAnim2Teleport.js:33:      syncCharacters(prev =>
moveAnim2Teleport.js:35:          ? { ...c, posicao: { row: destino.row, col: destino.col } }
moveAnim3Slingshot.js:9:  sz, charsRef, syncCharacters,
moveAnim3Slingshot.js:64:      syncCharacters(prev =>
moveAnim3Slingshot.js:66:          ? { ...c, posicao: { row: destino.row, col: destino.col } }
```

**Antes da correção:** `moveAnim1Standard.js:33-35` chamava `syncCharacters` **em todo step**.
**Depois da correção:** `syncCharacters` apenas no último step (`moveAnim1Standard.js:37`).

`moveAnim2Teleport.js:33-35` e `moveAnim3Slingshot.js:64-66` já chamavam `syncCharacters` apenas uma vez (correto) — sem mudança.

---

### Comando 2 — `setCharVisualPos` em animation files

```
> Get-ChildItem ... | ForEach-Object { Select-String -Path $_.FullName -Pattern "setCharVisualPos" }

attackAnim1StandardPlus.js:13:  setCharVisualPos, onEmitParticles,
(... 26 ocorrências em attack/range/defense ...)
movement/moveAnim1Standard.js:14: * @param {function} setCharVisualPos - (updater) => void
movement/moveAnim3Slingshot.js:11:  setCharVisualPos, moveAnimId, onFinalize,
movement/moveAnim3Slingshot.js:38:    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
movement/moveAnim3Slingshot.js:52:    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
movement/moveAnim3Slingshot.js:70:      setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
```

**Antes:** `moveAnim1Standard.js` tinha `setCharVisualPos` apenas no JSDoc (linha 14), não no destructuring. `moveAnim2Teleport.js` não tinha em lugar nenhum.

**Depois:** Ambos passaram a receber `setCharVisualPos` no destructuring.

---

### Comando 3 — `execute` destructuring nos 3 movement files

**Antes:**
```
--- moveAnim1Standard.js ---
export function execute({
  charId, steps,
  charsRef, syncCharacters,
  setAnimTimer, onTrail, onClearTrail,
  moveAnimId, onFinalize,
})

--- moveAnim2Teleport.js ---
export function execute({
  charId, origem, destino,
  charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, setCharRotation, moveAnimId, onFinalize,
  onEmitParticles, onGetHexCenter,
})

--- moveAnim3Slingshot.js ---
export function execute({
  charId, origem, destino,
  sz, charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY,
  onEmitParticles,
})
```

**Depois:**
```
--- moveAnim1Standard.js ---
export function execute({
  charId, steps,
  charsRef, syncCharacters,
  setAnimTimer, onTrail, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY, sz,
})

--- moveAnim2Teleport.js ---
export function execute({
  charId, origem, destino,
  charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, setCharRotation, setCharVisualPos, moveAnimId, onFinalize,
  onEmitParticles, onGetHexCenter,
})

--- moveAnim3Slingshot.js ---
export function execute({
  charId, origem, destino,
  sz, charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY,
  onEmitParticles,
})
```

Agora as 3 têm `setCharVisualPos` no contrato.

---

### Comando 4 — Parâmetros passados a `animFn()` em `useCombatEngine.js`

```
> Select-String -Path "useCombatEngine.js" -Pattern "animFn\(\{" -Context 0,20

moverPersonagem (linha 385):
  charId, origem, destino, steps, sz, charsRef, syncCharacters, setAnimTimer,
  onTrail, onClearTrail, setCharScales, setCharVisualPos, setCharRotation,
  hexCenter, padX, padY, moveAnimId, onEmitParticles, onFinalize

IA estagioMover (linha 679):
  charId, origem, destino, steps, sz, charsRef, syncCharacters, setAnimTimer,
  onTrail, onClearTrail, setCharScales, setCharVisualPos, setCharRotation,
  hexCenter, padX, padY, moveAnimId, onEmitParticles, onFinalize
```

Ambos os call sites já passavam `setCharVisualPos`, `hexCenter`, `padX`, `padY`, `sz`. A correção só fez as animações passarem a usar esses parâmetros.

---

## Etapa 2 — Correções

### Arquivo: `moveAnim1Standard.js`

**Antes** (linhas 18-44):
```javascript
export function execute({
  charId, steps,
  charsRef, syncCharacters,
  setAnimTimer, onTrail, onClearTrail,
  moveAnimId, onFinalize,
}) {
  let stepIdx = 0

  function advance() {
    if (stepIdx >= steps.length) {
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
      return
    }
    const step = steps[stepIdx]
    syncCharacters(prev =>                         // ← V1: muta posicao em CADA step
      prev.map(c => c.id === charId
        ? { ...c, posicao: { row: step.row, col: step.col } }
        : c
      )
    )
    if (onTrail) onTrail({ row: step.row, col: step.col, moveAnimId })
    stepIdx++
    setAnimTimer(advance, 150)
  }

  setAnimTimer(advance, 50)
}
```

**Depois** (linhas 18-56):
```javascript
export function execute({
  charId, steps,
  charsRef, syncCharacters,
  setAnimTimer, onTrail, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY, sz,                     // ← V2: parâmetros adicionados
}) {
  let stepIdx = 0

  function advance() {
    if (stepIdx >= steps.length) {
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
      return
    }
    const isLastStep = stepIdx === steps.length - 1
    const step = steps[stepIdx]

    if (isLastStep) {                              // ← Último step: commit lógico
      syncCharacters(prev =>
        prev.map(c => c.id === charId
          ? { ...c, posicao: { row: step.row, col: step.col } }
          : c
        )
      )
      if (setCharVisualPos) {
        setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      }
    } else {                                       // ← Steps intermediários: visual-only
      const center = hexCenter(step.row, step.col, padX, padY, sz)
      if (setCharVisualPos) {
        setCharVisualPos(prev => ({ ...prev, [charId]: { x: center.x, y: center.y } }))
      }
    }

    if (onTrail) onTrail({ row: step.row, col: step.col, moveAnimId })
    stepIdx++
    setAnimTimer(advance, 150)
  }

  setAnimTimer(advance, 50)
}
```

### Arquivo: `moveAnim2Teleport.js`

**Antes** (linhas 7-13):
```javascript
export function execute({
  charId, origem, destino,
  charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, setCharRotation, moveAnimId, onFinalize,
  onEmitParticles, onGetHexCenter,
})
```

**Depois** (linhas 7-13):
```javascript
export function execute({
  charId, origem, destino,
  charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, setCharRotation, setCharVisualPos, moveAnimId, onFinalize,
  onEmitParticles, onGetHexCenter,
})
```

Apenas `setCharVisualPos` adicionado ao destructuring (API consistency). Sem mudança funcional — teleport já faz sync uma vez entre shrink e grow.

### Arquivo: `moveAnim3Slingshot.js` — **sem mudanças**

Já estava correto: `setCharVisualPos` no contrato, usado durante recoil/launch, `syncCharacters` apenas no final.

---

## Etapa 3 — Confirmação pós-edição

```
> Get-ChildItem ... -Filter "*.js" | ForEach-Object { Select-String -Path $_.FullName -Pattern "^export function execute" -Context 0,8 }

--- moveAnim1Standard.js ---
export function execute({
  charId, steps,
  charsRef, syncCharacters,
  setAnimTimer, onTrail, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY, sz,                    ← ✅ NOVO
})

--- moveAnim2Teleport.js ---
export function execute({
  charId, origem, destino,
  charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, setCharRotation, setCharVisualPos, moveAnimId, onFinalize,
  onEmitParticles, onGetHexCenter,
})                                              ← ✅ setCharVisualPos adicionado

--- moveAnim3Slingshot.js ---
export function execute({
  charId, origem, destino,
  sz, charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY,
  onEmitParticles,
})                                              ← ✅ já estava correto
```

```
> Select-String -Path "moveAnim1Standard.js" -Pattern "syncCharacters|setCharVisualPos"

moveAnim1Standard.js:20:  charsRef, syncCharacters,
moveAnim1Standard.js:22:  setCharVisualPos, moveAnimId, onFinalize,
moveAnim1Standard.js:37:      syncCharacters(prev =>             ← chamado 1x (isLastStep)
moveAnim1Standard.js:43:      if (setCharVisualPos) {            ← clear no último step
moveAnim1Standard.js:44:        setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
moveAnim1Standard.js:48:      if (setCharVisualPos) {            ← set nos steps intermediários
moveAnim1Standard.js:49:        setCharVisualPos(prev => ({ ...prev, [charId]: { x: center.x, y: center.y } }))
```

---

## Etapa 4 — Teste lógico

### Fluxo 1: Jogador move 3 hexágonos (Standard)

| Step | Antes (v6.19.0) | Depois (v6.20.0) | Risco |
|:----:|-----------------|-----------------|:-----:|
| 0 | `syncCharacters({posicao: hex1})` | `setCharVisualPos(pixel_hex1)` | ❌ antigo: posicao = hex1 se abortar |
| 1 | `syncCharacters({posicao: hex2})` | `setCharVisualPos(pixel_hex2)` | ❌ antigo: posicao = hex2 se abortar |
| 2 | `syncCharacters({posicao: hex3})` | **último step:** `syncCharacters({posicao: hex3})` + limpa visualPos | ✅ |
| ✅ | Visual correto | Visual idêntico | — |

### Fluxo 2: IA move (Standard)

`useCombatEngine.js:679` passa exatamente os mesmos parâmetros que `moverPersonagem`. Funciona de forma idêntica ao fluxo do jogador.

### Fluxo 3: Teleport

`syncCharacters` continua sendo chamado 1x entre shrink e grow. Sempre foi o comportamento correto. `setCharVisualPos` agora está no contrato apenas por consistência.

### Fluxo 4: Slingshot

Já estava correto — sem mudanças.

### Fluxo 5: Desmontagem durante animação

**Antes:** se componente desmonta no step 1 de 3, `posicao` lógico fica em hex2.
**Depois:** se componente desmonta no step 1 de 3, `posicao` lógico permanece na origem. O estado visual intermediário (`charVisualPos`) morre com o componente.

✅ **TODOS OS FLUXOS APROVADOS**

---

## Etapa 5 — Build output

```
> npm run build

vite v8.0.16 building client environment for production...
✓ 1270 modules transformed.
✓ built in 2.17s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Build sem erros. Apenas warnings pré-existentes (chunk size, ineffective dynamic import).

---

## Etapa 6 — Line count

```
> Get-ChildItem -Path "movement" -Filter "*.js" | ForEach-Object { $c = (Get-Content $_.FullName | Measure-Object -Line).Lines; Write-Output "$($_.Name): $c lines" }

index.js: 24 lines
moveAnim1Standard.js: 43 → 57 lines (+14)
moveAnim2Teleport.js: 64 → 64 lines (sem mudança de linhas)
moveAnim3Slingshot.js: 70 → 70 lines (sem mudança)
```

---

## Etapa 7 — Versões

| Constante | Antes | Depois |
|-----------|-------|--------|
| `SITE_VERSION` | 10.160.36 | → **10.160.37** |
| `ARENATESTBED_VERSION` | 6.19.0 | → **6.20.0** |

---

## Etapa 8 — Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/config/version.js` | Bump SITE_VERSION + ARENATESTBED_VERSION |
| `SITE_MAP.md` | Versões atualizadas na tabela |
| `engine/animations/movement/moveAnim1Standard.js` | V1+V2: visual-only steps + setCharVisualPos + hexCenter/padX/padY/sz |
| `engine/animations/movement/moveAnim2Teleport.js` | V2: setCharVisualPos adicionado ao destructuring |
| `docs/ReportAI/2026-06-23_FIX_MOVEMENT-ANIM-VISUAL-LOGICAL_v6.20.0.md` | Este relatório |

---

## Etapa 9 — Commit + Push + Deploy

(Ver seção final para hash e status do deploy)
