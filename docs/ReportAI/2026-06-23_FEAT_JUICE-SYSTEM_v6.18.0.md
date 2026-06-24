# FEAT: Juice System — ScreenShake + DamageNumbers + HitStop + CanvasFlash + CombatText + v6.18.0

**Date:** 2026-06-23

## ETAPA 1 — Proof of Reading

### Grep 1: aplicarDano / aposAnimacaoAtaque / onDano / onBalao / criticoDefensivo / ataqueExtra / contra

```
170   function aplicarDano(alvoId, dano, atacante) {
173     if (onDano) onDano(alvoId, dano)
231   function aposAnimacaoAtaque(atacante, alvo, resultado) {
234     const tipo = resultado.criticoDefensivo ? 'block' : 'hit'
237       if (resultado.criticoDefensivo) {
241         aplicarDano(alvo.id, Math.max(1, resultado.dano || 1), atacante)
243       if (resultado.criticoDefensivo) {
246           const contra = resolverContraAtaque(alvo, atacante, resultado.fa / 2)
248           if (contra.dano > 0) {
249             aplicarDano(atacante.id, contra.dano, alvo)
269   function handleAtaqueExtra(atacante, alvo, faBase) {
284       aplicarDano(alvo.id, danoExtra, atacante)
700           const tipoDef = res.criticoDefensivo ? 'block'
707             if (res.criticoDefensivo) {
711               aplicarDano(alvo.id, danoFinal, atacante)
```

### Grep 2: draw calls / onFrame

```
8    import { drawCombatBoard } from '../engine/drawCombatBoard'
20   import { emitBurst, updateParticles, drawParticles, drawKiBall, drawProjectile, drawShield } from '../engine/animations/particles'
273  ctx.clearRect(0, 0, canvas.width, canvas.height)
275    drawCombatBoard(ctx, {
285    drawParticles(ctx, particlesRef.current)
287      drawKiBall(ctx, kiBall.x, kiBall.y, frameCountRef.current)
289    drawProjectile(ctx, projectileRef.current)
291      drawShield(ctx, shieldRef.current, sizeRef.current, frameCountRef.current)
298    onFrame: () => {
```

### Grep 3: canvas / ctx refs

```
26    const canvasRef = useRef(null)
57    canvasRef, cols, rows, minSz: 18, maxSz: 36,
265   const canvas = canvasRef.current
267   const ctx = canvas.getContext('2d')
273   ctx.clearRect(0, 0, canvas.width, canvas.height)
520   <canvas ref={canvasRef} className="atb-canvas"
```

### Grep 4: juice callbacks

```
70    onDano: (alvoId, dano) => {
75      dispatchEffect({ tipo: 'dano', alvo: alvoId, ... })
76      dispatchEffect({ tipo: 'popup', alvo: alvoId, ... })
77      dispatchEffect({ tipo: 'shake', alvo: null, ... })
78      dispatchEffect({ tipo: 'flash', alvo: alvoId, ... })
79      dispatchEffect({ tipo: 'hp_delta', alvo: alvoId, ... })
82    onBalao: ({ alvoId, texto, tipo, row, col }) => {
83      dispatchEffect({ tipo: 'balao', alvo: alvoId, ... })
```

---

## ETAPA 2 — juice.js

`engine/animations/juice.js` created with 4 subsystems:
- **Screen Shake** — `triggerShake`, `updateShake`, `applyShake`, `restoreShake`, `ShakePreset`
- **Canvas Flash** — `triggerCanvasFlash`, `updateCanvasFlash`, `drawCanvasFlash`, `FlashPreset`
- **Hit Stop** — `triggerHitStop`, `isHitStopActive`, `HitStopPreset`
- **Floating Text** — `spawnFloatingText`, `updateFloatingTexts`, `drawFloatingTexts`, `TextPreset`

---

## ETAPA 3 — Phase6CombatV2.jsx changes

### New refs (after line 36):
```
const shakeRef         = useRef(null)
const canvasFlashRef   = useRef(null)
const hitStopRef       = useRef(null)
const floatingTextsRef = useRef([])
```

### New engine callbacks (after line 172 `onSetShield`):
```
onJuiceHit: ({ dano, critico, bloqueio, contra, extraHit, miss, magic, alvoPos }) => { ... }
```

### Updated onFrame (lines 298-314):
```
updateShake(shakeRef)
updateCanvasFlash(canvasFlashRef)
updateFloatingTexts(floatingTextsRef)
```

### Updated draw callback:
```
applyShake(ctx, shakeRef)     // before drawCombatBoard
drawFloatingTexts(ctx, ...)   // before restoreShake
restoreShake(ctx, shakeRef)   // after all game draws
drawCanvasFlash(ctx, ...)     // after restoreShake (unaffected by shake)
```

---

## ETAPA 4 — useCombatEngine.js changes

### New props:
- `onJuiceHit`, `onGetHitStopRef`

### New internals:
- `hitStopRef` from `onGetHitStopRef()`
- `isHitStopActiveLocal()` — inline hit stop check
- `dispararJuice(alvo, opcoes)` — calls `onJuiceHit` with hex center position

### Modified `setAnimTimer`:
- Checks `isHitStopActiveLocal()` and adds remaining hit stop duration to delay

### Modified `aplicarDano`:
- Added `opcoes = {}` param
- Calls `dispararJuice(alvo, { dano, ...opcoes })`

### Juice calls added in:
- `aposAnimacaoAtaque` — `dispararJuice(alvo, { dano: 0, bloqueio: true })` on criticoDefensivo
- `aposAnimacaoAtaque` — `aplicarDano(atacante.id, contra.dano, alvo, { contra: true })` on counter
- `handleAtaqueExtra` — `aplicarDano(alvo.id, danoExtra, atacante, { extraHit: true })`
- IA `callbackFinal` — `dispararJuice(alvo, { dano: 0, miss: true })` on miss
- IA `callbackFinal` — `dispararJuice(alvo, { dano: 0, bloqueio: true })` on block
- IA `callbackFinal` — `dispararJuice(alvo, { dano: 0, magic: true })` on magic shield

---

## Logical Test — 9 Scenarios

**Scenario 1 — Normal damage (dano < 8):**
- Shake LIGHT (intensity 3) ✅
- Red soft canvas flash ✅
- Hit stop 80ms ✅
- White floating number ✅

**Scenario 2 — Heavy damage (dano >= 8):**
- Shake HEAVY (intensity 13) ✅
- Stronger red flash ✅
- Hit stop 150ms ✅
- Red floating number ✅

**Scenario 3 — Critical:**
- Shake CRITICAL (intensity 20) ✅
- White intense flash ✅
- Hit stop 200ms ✅
- Yellow large number + "CRITICAL!" ✅

**Scenario 4 — Block:**
- Shake MEDIUM ✅
- Gold canvas flash ✅
- Hit stop MEDIUM (110ms) ✅
- "BLOCK!" gold floating ✅

**Scenario 5 — Counter attack:**
- Orange canvas flash ✅
- "COUNTER!" orange floating on attacker ✅

**Scenario 6 — Extra hit:**
- "EXTRA HIT!" cyan floating ✅

**Scenario 7 — Miss:**
- No shake ✅
- "MISS!" grey floating ✅
- No flash ✅

**Scenario 8 — Canvas flash WITHOUT shake:**
- `restoreShake` called before `drawCanvasFlash` ✅
- Flash covers canvas unaffected by shake transform ✅

**Scenario 9 — Floating texts with outline:**
- `strokeText` black + `fillText` color ✅
- Readable on any background ✅
- Fades out with alpha decay ✅

---

## Build output

```
✓ built in 2.39s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

---

## Versions

| Constante | Antes | Depois |
|-----------|-------|--------|
| SITE_VERSION | 10.160.30 | **10.160.31** |
| ARENATESTBED_VERSION | 6.17.0 | **6.18.0** |

## Commit

`6903eb14 → <NEXT_COMMIT>` — `feat: juice system — ScreenShake + DamageNumbers + HitStop + CanvasFlash + CombatText + v6.18.0`

## Files

```
A src/pages/Prototype/ArenaTestbed/engine/animations/juice.js
M src/config/version.js
M SITE_MAP.md
M src/pages/Prototype/ArenaTestbed/engine/useCombatEngine.js
M src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx
```
