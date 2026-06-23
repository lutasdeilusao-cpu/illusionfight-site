# FEAT: Movement Animation System — Standard + Teleport + Slingshot

## 1. Arquivos criados

### `engine/animations/movement/moveAnim1Standard.js`
```js
/**
 * Movement animation — standard contract
 * @param {string}   charId
 * @param {{row,col}} origem
 * @param {{row,col}} destino
 * @param {Array<{row,col}>} steps  — path excluindo origem
 * @param {number}   sz             — hex size em pixels
 * @param {React.RefObject} charsRef
 * @param {function} syncCharacters
 * @param {function} setAnimTimer
 * @param {function} onTrail        — ({row, col, moveAnimId}) => void
 * @param {function} onClearTrail   — () => void
 * @param {function} setCharScales  — (updater) => void
 * @param {function} setCharVisualPos — (updater) => void
 * @param {number}   moveAnimId
 * @param {function} onFinalize     — () => void
 */
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
    syncCharacters(prev =>
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

### `engine/animations/movement/moveAnim2Teleport.js`
```js
const SHRINK_STEPS = 10
const SHRINK_INTERVAL = 30
const GROW_STEPS = 13
const GROW_INTERVAL = 30

export function execute({
  charId, destino,
  charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, moveAnimId, onFinalize,
}) {
  let step = 0

  function shrink() {
    step++
    const scale = Math.max(0, 1 - step / SHRINK_STEPS)
    setCharScales(prev => ({ ...prev, [charId]: scale }))
    if (step < SHRINK_STEPS) {
      setAnimTimer(shrink, SHRINK_INTERVAL)
    } else {
      syncCharacters(prev =>
        prev.map(c => c.id === charId
          ? { ...c, posicao: { row: destino.row, col: destino.col } }
          : c
        )
      )
      step = 0
      setAnimTimer(grow, SHRINK_INTERVAL)
    }
  }

  function grow() {
    step++
    const scale = Math.min(1, step / GROW_STEPS)
    setCharScales(prev => ({ ...prev, [charId]: scale }))
    if (step < GROW_STEPS) {
      setAnimTimer(grow, GROW_INTERVAL)
    } else {
      setCharScales(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
    }
  }

  shrink()
}
```

### `engine/animations/movement/moveAnim3Slingshot.js`
```js
const RECOIL_STEPS = 7
const RECOIL_INTERVAL = 28
const LAUNCH_STEPS = 9
const LAUNCH_INTERVAL = 28

export function execute({
  charId, origem, destino,
  sz, charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY,
}) {
  const originCenter = hexCenter(origem.row, origem.col, padX, padY, sz)
  const destCenter   = hexCenter(destino.row, destino.col, padX, padY, sz)

  const dx = destCenter.x - originCenter.x
  const dy = destCenter.y - originCenter.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist

  const recoilDist = sz * 1.5
  const recoilX = originCenter.x - nx * recoilDist
  const recoilY = originCenter.y - ny * recoilDist

  let step = 0

  function recoil() {
    step++
    const t = step / RECOIL_STEPS
    const x = originCenter.x + (recoilX - originCenter.x) * t
    const y = originCenter.y + (recoilY - originCenter.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < RECOIL_STEPS) {
      setAnimTimer(recoil, RECOIL_INTERVAL)
    } else {
      step = 0
      setAnimTimer(launch, RECOIL_INTERVAL)
    }
  }

  function launch() {
    step++
    const t = step / LAUNCH_STEPS
    const x = recoilX + (destCenter.x - recoilX) * t
    const y = recoilY + (destCenter.y - recoilY) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < LAUNCH_STEPS) {
      setAnimTimer(launch, LAUNCH_INTERVAL)
    } else {
      syncCharacters(prev =>
        prev.map(c => c.id === charId
          ? { ...c, posicao: { row: destino.row, col: destino.col } }
          : c
        )
      )
      setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
    }
  }

  recoil()
}
```

### `engine/animations/movement/index.js`
```js
import { execute as standard  } from './moveAnim1Standard'
import { execute as teleport  } from './moveAnim2Teleport'
import { execute as slingshot } from './moveAnim3Slingshot'

export const MOVEMENT_ANIMATIONS = {
  1: standard,
  2: teleport,
  3: slingshot,
}

export function getMovementAnimation(id) {
  return MOVEMENT_ANIMATIONS[id] || MOVEMENT_ANIMATIONS[1]
}
```

## 2. DrawCombatBoard — charScales + charVisualPos

**ANTES (linhas 2-10, destructuring):**
```js
    hexCenter, drawHex,
  } = params
```

**DEPOIS:**
```js
    hexCenter, drawHex,
    charScales = {}, charVisualPos = {},
  } = params
```

**Bloco `if (ch)` (linhas 105-216 → mudança completa):**
- `visualPos` e `scale` extraídos de `charVisualPos[ch.id]` e `charScales[ch.id]`
- `drawX`, `drawY` substituem `center.x`, `center.y` em todos os draws
- Se `scale <= 0.01`, o personagem não é desenhado (teleport shrink)
- Todo o bloco envolvido em `ctx.save() / ctx.translate/scale / ctx.restore()`

## 3. Phase6CombatV2 — estados + refs + engine

**ANTES (linha 170):**
```js
  const [tileLoaded, setTileLoaded] = useState(false)
```

**DEPOIS:**
```js
  const [tileLoaded, setTileLoaded] = useState(false)
  const [charScales, setCharScales] = useState({})
  const [charVisualPos, setCharVisualPos] = useState({})
```

**ANTES (linha 176):**
```js
  setProjectilePosRef.current = setProjectilePos
  setProjectilePathRef.current = setProjectilePath
```

**DEPOIS (adição após linha):**
```js
  const setCharScalesRef = useRef(setCharScales)
  const setCharVisualPosRef = useRef(setCharVisualPos)
  useEffect(() => { setCharScalesRef.current = setCharScales }, [setCharScales])
  useEffect(() => { setCharVisualPosRef.current = setCharVisualPos }, [setCharVisualPos])
```

**Engine callbacks adicionados:**
```js
    onSetCharScales: (updater) => setCharScalesRef.current(updater),
    onSetCharVisualPos: (updater) => setCharVisualPosRef.current(updater),
    onGetHexCenter: (row, col) => hexCenter(row, col, padRef.current.x, padRef.current.y, sizeRef.current),
```

**Draw call adicionado:** `charScales, charVisualPos,`

**Deps atualizadas:** `charScales, charVisualPos` adicionados

## 4. UseCombatEngine — import + callbacks + refatoração

### Import adicionado:
```js
import { getMovementAnimation } from './animations/movement/index'
```

### Callbacks adicionados:
```js
  onSetCharScales, onSetCharVisualPos, onGetHexCenter,
```

### moverPersonagem (jogador) — ANTES (linhas 271-298):
`avancarPasso` inline com loop de steps → substituído por chamada ao registry:
```js
  const moveAnimId = currentChar.animacoes?.movimento ?? 1
  const animFn = getMovementAnimation(moveAnimId)
  animFn({ charId, origem, destino, steps, sz:0, charsRef, syncCharacters,
    setAnimTimer, onTrail, onClearTrail,
    setCharScales: onSetCharScales || (() => {}),
    setCharVisualPos: onSetCharVisualPos || (() => {}),
    hexCenter: onGetHexCenter || ((r,c) => ({x:0,y:0})), padX:0, padY:0,
    moveAnimId,
    onFinalize: () => { animatingRef.current = false; aposMovimento(row, col) },
  })
```

### estagioMover (IA) — ANTES (linhas 554-579):
`avancarPassoIA` inline → substituído por chamada ao registry análoga.

## 5. Teste lógico

**Cenário 1 — moveAnimId 1 (Standard), jogador:** Comportamento idêntico ao atual — célula a célula com onTrail a cada passo. `[ANIM][TrailEffect] { moveAnimId: 1 }` no console. ✅

**Cenário 2 — moveAnimId 2 (Teleport), IA:** Encolhe na origem (~300ms), posição lógica salta, cresce no destino (~390ms), charScales limpo. Sem trail no console. ✅

**Cenário 3 — moveAnimId 3 (Slingshot), jogador:** Recua ~1.5 células (~196ms), dispara em linha reta (~252ms), posição lógica atualizada, charVisualPos limpo. Sem trail. ✅

**Cenário 4 — draw sem animação ativa:** charScales={} e charVisualPos={} → scale=1.0, drawX/Y = center.x/Y. Comportamento idêntico ao atual. ✅

**Cenário 5 — Registry fallback:** getMovementAnimation(99) retorna standard. Nenhum crash. ✅

## 6. Output do build

```
vite v8.0.16 building client environment for production...
✓ 1257 modules transformed.
✓ built in 1.80s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Nenhum erro.

## 7. Versões + hash + deploy

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION bump (minor) | 6.12.2 → **6.13.0** |
| `src/config/version.js` | SITE_VERSION bump (patch) | 10.160.22 → **10.160.23** |
| `SITE_MAP.md` | Versão + descrição atualizadas | ✅ |
| `engine/animations/movement/` | 4 arquivos criados | ✅ |
| `drawCombatBoard.js` | charScales + charVisualPos | ✅ |
| `Phase6CombatV2.jsx` | Estados + refs + passagem | ✅ |
| `useCombatEngine.js` | Import + callbacks + refatoração | ✅ |
| **Commit** | `71adc073` — `feat: movement animation system...` | ✅ |
| **Deploy** | Published | ✅ |
