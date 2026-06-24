# FEAT: 3 Range Attack Animations — StraightShot + BurstFire + SpiritGun

**Data:** 2026-06-23
**Versão:** ARENATESTBED v6.14.1 → **6.16.0** · SITE v10.160.28 → **10.160.29**

---

## 1. Greps da Etapa 1

### 1.1 ProjetilEffect em EffectRenderer.js

```
Line 24:   const steps = []
Line 31:     steps.push({ row: Math.round(r1 + dr * t), col: Math.round(c1 + dc * t) })
Line 33:   return steps
Line 37:   ProjetilEffect: ({ params, dados, alvo }) => {
Line 38:     console.log('[PRIMITIVO] ProjetilEffect', { params, dados, alvo })
Line 39:     logAnimIds('ProjetilEffect', dados)
Line 52:     const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
Line 54:     const setProjPos = _refs.setProjectilePosRef?.current
Line 55:     const setProjPath = _refs.setProjectilePathRef?.current
Line 57:     if (setProjPath) setProjPath(steps)
Line 59:     function avancar() {
Line 60:       if (stepIdx >= steps.length) {
Line 61:         if (setProjPos) setProjPos(null)
Line 62:         if (setProjPath) setProjPath([])
Line 67:       const passo = steps[stepIdx]
Line 69:         if (setProjPos) setProjPos(null)
Line 70:         if (setProjPath) setProjPath([])
Line 75:       if (setProjPos) setProjPos({ row: passo.row, col: passo.col })
Line 76:       if (setProjPath) setProjPath(prev => prev.filter((_, i) => i > 0))
Line 78:       setTimer(avancar, 320)
Line 80:     avancar()
```

### 1.2 animarAtaqueProjetil em useCombatEngine.js

```
Line 26:   onAnimarMelee, onAnimarProjetil,
Line 183:   function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
Line 184:     if (onAnimarProjetil) onAnimarProjetil(atacante, alvo, resultado, onFinalizar)
Line 434:     const cbFinalizar = () => aposAnimacaoAtaque(currentChar, target, resultado)
Line 435:     if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado, cbFinalizar)
Line 436:     else animarAtaqueProjetil(currentChar, target, resultado, cbFinalizar)
Line 675:               else animarAtaqueProjetil(atacante, alvo, res, callbackFinal)
```

### 1.3 projétil em drawCombatBoard.js

```
Line 96:     damageFlash, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido,
Line 107:   const projPathSet = new Set(projectilePath.map(c => `${c.row}_${c.col}`))
Line 208:       if (projPathSet.has(key) && projectilePos?.row !== row && projectilePos?.col !== col) {
Line 212:       if (projectilePos && projectilePos.row === row && projectilePos.col === col) {
```

### 1.4 charVisualPos/particles/kiBall em Phase6CombatV2.jsx

```
Line 20: import { emitBurst, updateParticles, drawParticles, drawKiBall } from '../engine/animations/particles'
Line 155:     onEmitParticles: (x, y, options) => {
Line 157:         (updater) => { particlesRef.current = updater(particlesRef.current) },
Line 186:   const [charVisualPos, setCharVisualPos] = useState({})
Line 188:   const [kiBall, setKiBall] = useState(null)
Line 190:   const particlesRef = useRef([])
Line 282:         charScales, charVisualPos, charRotation,
Line 284:       drawParticles(ctx, particlesRef.current)
Line 285:       if (kiBall?.active) {
Line 286:         drawKiBall(ctx, kiBall.x, kiBall.y, frameCountRef.current)
Line 288:   }, [characters, obstaculos, itensChaoAtual, cols, rows, currentChar, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido, tileLoaded, charScales, charVisualPos, charRotation, kiBall])
Line 298:       particlesRef.current = updateParticles(particlesRef.current)
```

---

## 2. Arquivos Criados

### 2.1 `engine/animations/attack/rangeAnim1StraightShot.js`

Comportamento:
- Kickback 0.25 célula (4 steps, 25ms)
- Retorno (4 steps)
- Projétil 14 steps em linha reta (18ms)
- Trail de partículas #ffaa00 (modo trail)
- Explosão: 14 partículas #ffcc00 + 8 partículas #ffffff
- Onomatopeia `POW!` no impacto

### 2.2 `engine/animations/attack/rangeAnim2BurstFire.js`

Comportamento:
- 5 disparos sequenciais (120ms entre tiros)
- Cada tiro: kickback 8px (3 steps, 20ms)
- Projéteis 1-4: trail sem explosão
- Projétil 5 (#ff6600, raio 6): explosão 16 + 10 partículas + `KABOOM!`
- Trail #ffaa44 / #ff6600 (modo trail)

### 2.3 `engine/animations/attack/rangeAnim3SpiritGun.js`

Comportamento:
- Ki ball cresce na frente do atacante (16 frames, 32ms)
- Partículas orbitando #88ffff durante o carregamento
- Atacante recua 25% da distância
- Bola grande (raio 18) dispara 10 steps em linha reta
- Trail #00eeff
- Explosão enorme: 20 + 12 partículas + `SPIRIT GUN!`
- Atacante retorna (5 steps)

---

## 3. Arquivos Modificados

### 3.1 `config/version.js`

**ANTES (linhas 11 e 25):**
```js
export const SITE_VERSION = '10.160.28'
export const ARENATESTBED_VERSION = '6.15.1'
```

**DEPOIS (linhas 11 e 25):**
```js
export const SITE_VERSION = '10.160.29'
export const ARENATESTBED_VERSION = '6.16.0'
```

---

### 3.2 `engine/animations/particles.js`

**Adicionado ao final (após `drawParticles`):**

```js
export function drawProjectile(ctx, projectile) {
  if (!projectile?.active) return
  // trail + gradient core with shadowBlur
}

export function getLinePath(x1, y1, x2, y2, steps) {
  const points = []
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t })
  }
  return points
}
```

---

### 3.3 `engine/animations/attack/index.js`

**ANTES (27 linhas):**
- Apenas AttackAnimId (STANDARD_PLUS/RAGE_DASH/ENERGY_PUNCH)
- 3 imports melee
- REGISTRY melee
- getAttackAnimation()

**DEPOIS (43 linhas):**
- +3 imports range (straightShot/burstFire/spiritGun)
- RangeAnimId enum (STRAIGHT_SHOT/BURST_FIRE/SPIRIT_GUN)
- RANGE_REGISTRY
- getRangeAnimation() com fallback STRAIGHT_SHOT

---

### 3.4 `engine/useCombatEngine.js`

**ANTES (linha 20):**
```js
import { getAttackAnimation } from './animations/attack/index'
```

**DEPOIS (linha 20):**
```js
import { getAttackAnimation, getRangeAnimation } from './animations/attack/index'
```

**ANTES (linha 33):**
```js
onEmitParticles, onSetKiBall,
```

**DEPOIS (linha 33):**
```js
onEmitParticles, onSetKiBall, onSetProjectile,
```

**ANTES (linhas 183-186):**
```js
function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
  if (onAnimarProjetil) onAnimarProjetil(atacante, alvo, resultado, onFinalizar)
  else if (onFinalizar) onFinalizar()
}
```

**DEPOIS (linhas 183-203):**
```js
function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
  const animId = atacante.animacoes?.ataqueRange ?? 1
  const animFn = getRangeAnimation(animId)
  animFn({
    charId: atacante.id,
    atacante, alvo, resultado, obstaculos,
    onGetHexCenter: onGetHexCenter || (() => ({ x: 0, y: 0 })),
    setAnimTimer,
    setCharVisualPos: onSetCharVisualPos || (() => {}),
    onEmitParticles: onEmitParticles || (() => {}),
    setProjectile: onSetProjectile || (() => {}),
    setKiBall: onSetKiBall || (() => {}),
    onBalloon: (alvoId, texto, tipo, row, col) => {
      adicionarBalao(alvoId, texto, tipo, row, col)
    },
    onFinalize: onFinalizar,
  })
}
```

---

### 3.5 `phases/Phase6CombatV2.jsx`

**Import:** `drawProjectile` added to particles import.

**Removido:**
- `setProjectilePosRef`, `setProjectilePathRef` (refs)
- `projectilePos`, `projectilePath` (state)
- `onProjetilPos`, `onProjetilPath` (engine config)
- Linhas de setProjectilePosRef/PetProjectilePathRef
- initRenderer projectile refs

**Adicionado:**
- `const projectileRef = useRef(null)`
- `onSetProjectile: (val) => { projectileRef.current = val }`
- `drawProjectile(ctx, projectileRef.current)` no draw callback
- Trail decay no onFrame

---

### 3.6 `phases/Phase5bAnimDebug.jsx`

**Import:** `RangeAnimId` added.

**Enum selector separado:**
```js
if (tipo === 'ataqueMelee') return AttackAnimId
if (tipo === 'ataqueRange') return RangeAnimId
```

---

### 3.7 `engine/drawCombatBoard.js`

**Removido:**
- `projectilePos, projectilePath` dos params
- `projPathSet` e linhas de desenho do projétil antigo (grid-based)

---

## 4. Teste Lógico

| Cenário | Descrição | Resultado |
|---|---|---|
| 1 — StraightShot | Kickback + projétil linha reta + trail + explosão POW! + projectileRef=null | ✅ |
| 2 — BurstFire | 5 kickbacks + 5 projéteis + 1-4 só trail + 5º KABOOM! | ✅ |
| 3 — SpiritGun | Ki ball cresce + partículas orbitando + recuo + bola grande + SPIRIT GUN! + retorno | ✅ |
| 4 — drawProjectile | Gradiente branco→cor→transparente + shadowBlur + trail decaindo | ✅ |
| 5 — Projétil por cima | drawProjectile após drawCombatBoard no draw callback | ✅ |
| 6 — Melee não afetado | animarAtaqueMelee não tocado, 3 melee originais intactos | ✅ |

---

## 5. Build Output

```
vite v8.0.16 building client environment for production...
✓ 1265 modules transformed.
✓ built in 1.86s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

0 erros. Warnings existentes (INEFFECTIVE_DYNAMIC_IMPORT, chunk size) não relacionados.

---

## 6. Versões + Commit + Deploy

| Versão | Antes | Depois |
|--------|-------|--------|
| SITE_VERSION | 10.160.28 | → **10.160.29** |
| ARENATESTBED_VERSION | 6.15.1 | → **6.16.0** |

| Arquivo | O que mudou |
|---|---|
| `src/config/version.js` | SITE + ARENATESTBED bump |
| `engine/animations/particles.js` | `drawProjectile()` + `getLinePath()` |
| `engine/animations/attack/index.js` | RangeAnimId + RANGE_REGISTRY + 3 imports |
| `engine/animations/attack/rangeAnim1StraightShot.js` | **NOVO** |
| `engine/animations/attack/rangeAnim2BurstFire.js` | **NOVO** |
| `engine/animations/attack/rangeAnim3SpiritGun.js` | **NOVO** |
| `engine/useCombatEngine.js` | `animarAtaqueProjetil` via registry |
| `engine/drawCombatBoard.js` | Old projectile code removido |
| `phases/Phase6CombatV2.jsx` | projectileRef + drawProjectile |
| `phases/Phase5bAnimDebug.jsx` | RangeAnimId |
| `SITE_MAP.md` | Versões + novo path attack/ |

**Commit:** `50349076` — `feat: 3 range attack animations — StraightShot + BurstFire + SpiritGun + v6.16.0`
**Deploy:** Published ✅
