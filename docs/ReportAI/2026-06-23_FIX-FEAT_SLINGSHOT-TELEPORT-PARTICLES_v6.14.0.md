# FIX+FEAT: Slingshot sz real + recuo, Teleport rotation + particles

## 1. Output bruto dos 4 greps da Etapa 1

### Grep 1 — onGetHexCenter no Phase6CombatV2
```
52:  const { recalc, calcVersion, getCellAt, getHexCenter, drawHex,
53:          hexCenter, hexCorner, pixelToHex,
54:          padRef, sizeRef } = useHexCanvas({
85:      const sz = sizeRef.current
86:      const center = hexCenter(row, col, padRef.current.x, padRef.current.y, sz)
150:    onGetHexCenter: (row, col) => hexCenter(row, col, padRef.current.x, padRef.current.y, sizeRef.current),
252:    const sz = sizeRef.current
253:    const padX = padRef.current.x
254:    const padY = padRef.current.y
264:        hexCenter, drawHex,
288:    const sz = sizeRef.current
```

### Grep 2 — sz no useCombatEngine
```
30:  onSetCharScales, onSetCharVisualPos, onGetHexCenter,
294:      sz: 0,
302:      hexCenter: onGetHexCenter || ((r, c) => ({ x: 0, y: 0 })),
303:      padX: 0,
304:      padY: 0,
585:            sz: 0,
593:            hexCenter: onGetHexCenter || ((r, c) => ({ x: 0, y: 0 })),
594:            padX: 0,
595:            padY: 0,
```

### Grep 3 — charVisualPos/charScales/drawX/drawY no drawCombatBoard
```
10:    charScales = {}, charVisualPos = {},
106:      if (ch) {
107:        const visualPos = charVisualPos[ch.id]
108:        const scale = charScales[ch.id] ?? 1.0
109:        const drawX = visualPos ? visualPos.x : center.x
110:        const drawY = visualPos ? visualPos.y : center.y
...
```

### Grep 4 — charScales/charVisualPos no Phase6CombatV2
```
148:    onSetCharScales: (updater) => setCharScalesRef.current(updater),
149:    onSetCharVisualPos: (updater) => setCharVisualPosRef.current(updater),
174:  const [charScales, setCharScales] = useState({})
175:  const [charVisualPos, setCharVisualPos] = useState({})
183:  const setCharScalesRef = useRef(setCharScales)
184:  const setCharVisualPosRef = useRef(setCharVisualPos)
185:  useEffect(() => { setCharScalesRef.current = setCharScales }, [setCharScales])
186:  useEffect(() => { setCharVisualPosRef.current = setCharVisualPos }, [setCharVisualPos])
265:        charScales, charVisualPos,
```

---

## 2. ANTES e DEPOIS de cada mudança

### FIX 1 — onGetSz callback

**Phase6CombatV2.jsx** — adicionado após `onGetHexCenter` (linha 151):
```js
// ANTES:
onGetHexCenter: (row, col) => hexCenter(row, col, padRef.current.x, padRef.current.y, sizeRef.current),
})

// DEPOIS:
onGetHexCenter: (row, col) => hexCenter(row, col, padRef.current.x, padRef.current.y, sizeRef.current),
onGetSz: () => sizeRef.current,
onEmitParticles: (x, y, options) => {
  emitBurst(
    (updater) => { particlesRef.current = updater(particlesRef.current) },
    x, y, options
  )
},
```

**useCombatEngine.js** — desestruturação (linha 30):
```js
// ANTES:
onSetCharScales, onSetCharVisualPos, onGetHexCenter,

// DEPOIS:
onSetCharScales, onSetCharVisualPos, onSetCharRotation,
onGetHexCenter, onGetSz,
onEmitParticles,
```

**useCombatEngine.js — moverPersonagem** (linhas 289-310):
```js
// ANTES:
animFn({
  ...
  steps,
  sz: 0,             // ← bug: sempre 0
  ...

// DEPOIS:
const realSz = onGetSz ? onGetSz() : 36
animFn({
  ...
  steps,
  sz: realSz,
  setCharRotation: onSetCharRotation || (() => {}),
  onEmitParticles: onEmitParticles || (() => {}),
```

**useCombatEngine.js — estagioMover** (linhas 580-602):
```js
// ANTES:
animFn({
  ...
  sz: 0,             // ← bug: sempre 0
  ...

// DEPOIS:
const realSz = onGetSz ? onGetSz() : 36
animFn({
  ...
  sz: realSz,
  setCharRotation: onSetCharRotation || (() => {}),
  onEmitParticles: onEmitParticles || (() => {}),
```

---

### FIX 2 — drawChar extraído + if/else visualPos

**drawCombatBoard.js** — função interna `drawChar` adicionada antes de `export function drawCombatBoard`:
```js
// ANTES: código inline duplicado para player e enemy
// DEPOIS: função drawChar(ctx, ch, x, y, scale, { sz, angle, currentChar, charRotation })
// - Unifica player/enemy draw (diferença só nas cores)
// - Aplica ctx.translate(x,y) → ctx.rotate() → ctx.scale → ctx.translate(-x,-y)
// - Desenha spokes, círculo, ícone/letra, active ring, HP bar

```

**drawCombatBoard.js — bloco `if (ch)`** (linhas 106-230):
```js
// ANTES: 124 linhas de código inline com duplicação player/enemy
// DEPOIS:
if (ch) {
  const visualPos = charVisualPos[ch.id]
  const scale = charScales[ch.id] ?? 1.0
  if (scale > 0.01) {
    if (visualPos) {
      drawChar(ctx, ch, visualPos.x, visualPos.y, scale, { sz, angle, currentChar, charRotation })
    } else {
      drawChar(ctx, ch, center.x, center.y, scale, { sz, angle, currentChar, charRotation })
    }
  }
}
```

---

### FIX 3 — Slingshot parâmetros

**moveAnim3Slingshot.js** completo:

```js
// ANTES:
const RECOIL_DIST_MULTIPLIER = 1.5  // ← imperceptível
const RECOIL_STEPS = 7
const RECOIL_INTERVAL = 28
const LAUNCH_STEPS = 9
const LAUNCH_INTERVAL = 28

// DEPOIS:
const RECOIL_DIST_MULTIPLIER = 4.5  // ← exagerado cartoon
const RECOIL_STEPS = 8
const RECOIL_INTERVAL = 22
const LAUNCH_STEPS = 10
const LAUNCH_INTERVAL = 18

// Logs adicionados:
console.log('[SLINGSHOT] execute called', { charId, origem, destino, sz })
console.log('[SLINGSHOT] originCenter', originCenter, 'destCenter', destCenter)
console.log('[SLINGSHOT] recoilDist', recoilDist)

// Partículas adicionadas no launch:
if (onEmitParticles) {
  const trailDir = { x: nx, y: ny }
  onEmitParticles(x, y, {
    count: 3, color: '#ffaa00',
    speed: 2, radius: 2,
    mode: 'trail', trailDir,
  })
}
```

---

### FEAT 1 — Teleport rotation

**moveAnim2Teleport.js** — completo:
```js
// ANTES: sem rotação, sem partículas
// DEPOIS:
const ROTATION_SPEED = 0.45
let rotationAngle = 0

function shrink() {
  step++
  rotationAngle += ROTATION_SPEED
  setCharScales(prev => ({ ...prev, [charId]: scale }))
  if (setCharRotation) setCharRotation(prev => ({ ...prev, [charId]: rotationAngle }))
  // burst de saída quando scale <= 0
  ...
}

function grow() {
  step++
  rotationAngle += ROTATION_SPEED
  setCharScales(prev => ({ ...prev, [charId]: scale }))
  if (setCharRotation) setCharRotation(prev => ({ ...prev, [charId]: rotationAngle }))
  // burst de chegada no início
  ...
  // limpa rotation ao finalizar
  if (setCharRotation) setCharRotation(prev => { const n = { ...prev }; delete n[charId]; return n })
}
```

**Phase6CombatV2.jsx** — novos estados:
```js
const [charRotation, setCharRotation] = useState({})
const particlesRef = useRef([])

// Refs:
const setCharRotationRef = useRef(setCharRotation)
useEffect(() => { setCharRotationRef.current = setCharRotation }, [setCharRotation])
```

**drawCombatBoard.js** — novo parâmetro + rotate:
```js
// params:
charRotation = {},

// dentro de drawChar:
ctx.save()
ctx.translate(x, y)
if (rot) ctx.rotate(rot)
ctx.scale(scale, scale)
ctx.translate(-x, -y)
```

---

### FEAT 2 — particles.js

**Arquivo criado:** `engine/animations/particles.js` (70 linhas)

**3 funções exportadas:**
- `emitBurst(setParticles, x, y, { count, color, speed, radius, mode, trailDir })` — emite rajada de partículas (radiate/converge/trail)
- `updateParticles(particles, decay)` — atualiza posições + alpha, remove mortas
- `drawParticles(ctx, particles)` — desenha partículas no canvas

**Integração no Phase6CombatV2.jsx:**
```js
import { emitBurst, updateParticles, drawParticles } from '../engine/animations/particles'

// No onFrame:
particlesRef.current = updateParticles(particlesRef.current)

// Após drawCombatBoard:
drawParticles(ctx, particlesRef.current)
```

---

## 3. particles.js completo

```js
export function emitBurst(setParticles, x, y, {
  count = 8, color = '#ffffff', speed = 3, radius = 3,
  mode = 'radiate', trailDir = null,
} = {}) {
  const newParticles = []
  for (let i = 0; i < count; i++) {
    let vx, vy
    if (mode === 'radiate') {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3
      vx = Math.cos(angle) * speed * (0.7 + Math.random() * 0.6)
      vy = Math.sin(angle) * speed * (0.7 + Math.random() * 0.6)
    } else if (mode === 'converge') {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3
      vx = -Math.cos(angle) * speed * (0.7 + Math.random() * 0.6)
      vy = -Math.sin(angle) * speed * (0.7 + Math.random() * 0.6)
    } else if (mode === 'trail' && trailDir) {
      const perp = { x: -trailDir.y, y: trailDir.x }
      const side = Math.random() > 0.5 ? 1 : -1
      vx = perp.x * side * speed * Math.random() - trailDir.x * speed * 0.3
      vy = perp.y * side * speed * Math.random() - trailDir.y * speed * 0.3
    }
    newParticles.push({ x, y, vx, vy, alpha: 1.0, radius, color })
  }
  setParticles(prev => [...prev, ...newParticles])
}

export function updateParticles(particles, decay = 0.06) {
  return particles
    .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy,
      alpha: p.alpha - decay, vx: p.vx * 0.92, vy: p.vy * 0.92 }))
    .filter(p => p.alpha > 0)
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, p.alpha)
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.fill()
    ctx.restore()
  }
}
```

---

## 4. moveAnim2Teleport.js — ANTES e DEPOIS

**ANTES** (46 linhas):
```js
const SHRINK_STEPS = 10
const SHRINK_INTERVAL = 30
const GROW_STEPS = 13
const GROW_INTERVAL = 30
export function execute({
  charId, destino, charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, moveAnimId, onFinalize,
}) {
  let step = 0
  function shrink() { ... }
  function grow() { ... }
  shrink()
}
```

**DEPOIS** (71 linhas):
```js
const SHRINK_STEPS = 10
const SHRINK_INTERVAL = 30
const GROW_STEPS = 13
const GROW_INTERVAL = 30
const ROTATION_SPEED = 0.45
export function execute({
  charId, origem, destino, charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, setCharRotation, moveAnimId, onFinalize,
  onEmitParticles, onGetHexCenter,
}) {
  let step = 0
  let rotationAngle = 0
  function shrink() {
    step++
    rotationAngle += ROTATION_SPEED
    const scale = Math.max(0, 1 - step / SHRINK_STEPS)
    setCharScales(prev => ({ ...prev, [charId]: scale }))
    if (setCharRotation) setCharRotation(prev => ({ ...prev, [charId]: rotationAngle }))
    if (scale <= 0 && onEmitParticles && onGetHexCenter && origem) {
      const pos = onGetHexCenter(origem.row, origem.col)
      onEmitParticles(pos.x, pos.y, { count: 10, color: '#00eeff', speed: 4, radius: 3, mode: 'radiate' })
    }
    if (step < SHRINK_STEPS) setAnimTimer(shrink, SHRINK_INTERVAL)
    else {
      syncCharacters(prev => prev.map(c => c.id === charId ? { ...c, posicao: { row: destino.row, col: destino.col } } : c))
      if (onEmitParticles && onGetHexCenter) {
        const pos = onGetHexCenter(destino.row, destino.col)
        onEmitParticles(pos.x, pos.y, { count: 10, color: '#00eeff', speed: 4, radius: 3, mode: 'converge' })
      }
      step = 0
      setAnimTimer(grow, SHRINK_INTERVAL)
    }
  }
  function grow() {
    step++
    rotationAngle += ROTATION_SPEED
    const scale = Math.min(1, step / GROW_STEPS)
    setCharScales(prev => ({ ...prev, [charId]: scale }))
    if (setCharRotation) setCharRotation(prev => ({ ...prev, [charId]: rotationAngle }))
    if (step < GROW_STEPS) setAnimTimer(grow, GROW_INTERVAL)
    else {
      setCharScales(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (setCharRotation) setCharRotation(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
    }
  }
  shrink()
}
```

---

## 5. moveAnim3Slingshot.js — ANTES e DEPOIS

**ANTES** (64 linhas):
```js
const RECOIL_STEPS = 7
const RECOIL_INTERVAL = 28
const LAUNCH_STEPS = 9
const LAUNCH_INTERVAL = 28
export function execute({
  charId, origem, destino, sz, charsRef, syncCharacters,
  setAnimTimer, onClearTrail, setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY,
}) {
  ...
  const recoilDist = sz * 1.5
  ...
  function launch() {
    ...
    // sem partículas
    ...
  }
}
```

**DEPOIS** (84 linhas):
```js
const RECOIL_DIST_MULTIPLIER = 4.5
const RECOIL_STEPS = 8
const RECOIL_INTERVAL = 22
const LAUNCH_STEPS = 10
const LAUNCH_INTERVAL = 18
export function execute({
  charId, origem, destino, sz, charsRef, syncCharacters,
  setAnimTimer, onClearTrail, setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY, onEmitParticles,
}) {
  console.log('[SLINGSHOT] execute called', { charId, origem, destino, sz })
  ...
  const recoilDist = sz * RECOIL_DIST_MULTIPLIER
  console.log('[SLINGSHOT] recoilDist', recoilDist)
  ...
  function launch() {
    ...
    if (onEmitParticles) {
      const trailDir = { x: nx, y: ny }
      onEmitParticles(x, y, { count: 3, color: '#ffaa00', speed: 2, radius: 2, mode: 'trail', trailDir })
    }
    ...
  }
}
```

---

## 6. Teste lógico (6 cenórios)

**Cenário 1 — sz real chegando no Slingshot:**
- `onGetSz()` retorna `sizeRef.current` (ex: 28)
- `realSz = 28` em `moverPersonagem` e `estagioMover`
- `recoilDist = 28 * 4.5 = 126px`
- Log `[SLINGSHOT] recoilDist 126` aparece no console
✅

**Cenário 2 — Slingshot sem duplicação:**
- Durante o voo, `charVisualPos[charId]` ativo
- `if (visualPos)` → `drawChar(ctx, ch, visualPos.x, visualPos.y, ...)`
- Personagem NÃO desenhado na posição lógica (`center.x/y`)
- Personagem visível voando em linha reta
✅

**Cenário 3 — Teleport com rotação:**
- `rotationAngle += 0.45` a cada step do shrink/grow
- `charRotation[charId]` aumentando, passado via `setCharRotation`
- `drawChar` aplica `if (rot) ctx.rotate(rot)` no outer save
- Personagem gira visivelmente durante shrink e grow
✅

**Cenário 4 — Partículas Teleport:**
- Burst `radiate` de 10 partículas `#00eeff` na origem quando `scale <= 0`
- Burst `converge` de 10 partículas `#00eeff` no destino quando grow começa
- `updateParticles` no `onFrame`: alpha -0.06/frame, velocity *0.92
- Partículas somem em ~16 frames (alpha 1.0 / 0.06 ≈ 16.7)
✅

**Cenário 5 — Partículas Slingshot:**
- Rastro `trail` de 3 partículas `#ffaa00` por step do launch
- Direção perpendicular ao voo via `trailDir = { x: nx, y: ny }`
- Mesmo sistema de decay
✅

**Cenário 6 — Standard não afetado:**
- `moveAnimId 1` (STANDARD) não usa `setCharRotation`, `onEmitParticles`, `charVisualPos`
- `drawChar` com `charRotation[ch.id] = undefined` → `rot = 0` → `if (0)` false, sem rotate
- Trail normal, zero mudança de comportamento
✅

---

## 7. Output completo do npm run build

```
vite v8.0.16 building client environment for production...
✓ 1258 modules transformed.
✓ built in 1.72s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

1258 módulos (antes 1257 → +1 particles.js). 0 erros. Sourcemaps preservados.

---

## 8. Versões + hash + deploy

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION bump (minor) | 6.13.1 → **6.14.0** |
| `src/config/version.js` | SITE_VERSION bump (patch) | 10.160.24 → **10.160.25** |
| `SITE_MAP.md` | Versões atualizadas + particles.js | ✅ |
| `engine/animations/particles.js` | **CRIADO** — sistema de partículas (emitBurst, updateParticles, drawParticles) | ✅ |
| `engine/animations/movement/moveAnim2Teleport.js` | ROTATION_SPEED + setCharRotation + burst partículas | ✅ |
| `engine/animations/movement/moveAnim3Slingshot.js` | RECOIL_DIST_MULTIPLIER 4.5 + steps/interval ajustados + debug logs + trail particles | ✅ |
| `engine/drawCombatBoard.js` | drawChar extraído + charRotation aplicado + if/else visualPos | ✅ |
| `engine/useCombatEngine.js` | onGetSz, onSetCharRotation, onEmitParticles nos 2 call sites | ✅ |
| `phases/Phase6CombatV2.jsx` | charRotation state/ref, particlesRef, onFrame update, drawParticles | ✅ |
| **Commit** | `c359070a` — `fix+feat: Slingshot sz real + recuo, Teleport rotation, particles + v6.14.0` | ✅ |
| **Deploy** | Published | ✅ |
