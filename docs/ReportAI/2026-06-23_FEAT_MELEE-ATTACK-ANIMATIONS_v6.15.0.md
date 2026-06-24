# FEAT: 3 Melee Attack Animations — StandardPlus + RageDash + EnergyPunch

**Data:** 2026-06-23
**Versão:** SITE 10.160.27 · ARENATESTBED 6.15.0
**Hash:** `dcdb49d3`
**Deploy:** Published ✅

---

## 1. ETAPA 1 — Prova de leitura (greps)

### 1.1 AuraEffect / melee atual em EffectRenderer
```
EffectRenderer.js:50:    const origem = atacante.posicao
EffectRenderer.js:51:    const destino = personagemAlvo.posicao
EffectRenderer.js:88:  AuraEffect: ({ params, dados, alvo }) => {
EffectRenderer.js:89:    console.log('[PRIMITIVO] AuraEffect', { params, dados, alvo })
EffectRenderer.js:90:    logAnimIds('AuraEffect', dados)
EffectRenderer.js:92:    if (!atacanteId || !_refs.charsRef || !_refs.syncCharsRef) {
EffectRenderer.js:101:    const origem = { ...atacante.posicao }
EffectRenderer.js:102:    const destino = personagemAlvo.posicao
EffectRenderer.js:105:    const meioRow = Math.round(origem.row + dirRow * 0.7)
EffectRenderer.js:106:    const meioCol = Math.round(origem.col + dirCol * 0.7)
EffectRenderer.js:108:    if (_refs.syncCharsRef) {
EffectRenderer.js:109:      _refs.syncCharsRef.current(prev =>
EffectRenderer.js:110:        prev.map(c => c.id === atacanteId ? { ...c, posicao: { row: meioRow, col: meioCol } } : c)
EffectRenderer.js:115:      if (_refs.syncCharsRef) {
EffectRenderer.js:116:        _refs.syncCharsRef.current(prev =>
EffectRenderer.js:117:          prev.map(c => c.id === atacanteId ? { ...c, posicao: origem } : c)
```

### 1.2 onAnimarMelee / animarAtaqueMelee em useCombatEngine.js
```
useCombatEngine.js:25:  onAnimarMelee, onAnimarProjetil,
useCombatEngine.js:161:  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
useCombatEngine.js:162:    if (onAnimarMelee) onAnimarMelee(atacante, alvo, resultado, onFinalizar)
useCombatEngine.js:163:    else if (onFinalizar) onFinalizar()
useCombatEngine.js:166:  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
useCombatEngine.js:167:    if (onAnimarProjetil) onAnimarProjetil(atacante, alvo, resultado, onFinalizar)
useCombatEngine.js:168:    else if (onFinalizar) onFinalizar()
useCombatEngine.js:417:    const cbFinalizar = () => aposAnimacaoAtaque(currentChar, target, resultado)
useCombatEngine.js:418:    if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado, cbFinalizar)
useCombatEngine.js:419:    else animarAtaqueProjetil(currentChar, target, resultado, cbFinalizar)
useCombatEngine.js:657:              if (atacante.tipoAtaque === 'melee') animarAtaqueMelee(atacante, alvo, res, callbackFinal)
```

### 1.3 melee / onAnimarMelee em Phase6CombatV2.jsx
```
Phase6CombatV2.jsx:46:          movimento: 1, ataqueMelee: 1, ataqueRange: 1,
Phase6CombatV2.jsx:96:    onAnimarMelee: (atacante, alvo, resultado, onFinalizar) => {
Phase6CombatV2.jsx:97:      dispatchEffect({ tipo: 'melee', alvo: alvo.id, dados: { atacanteId: atacante.id, alvoId: alvo.id, resultado, onFinalizar }, caller: 'onAnimarMelee' })
```

### 1.4 charVisualPos / drawChar em drawCombatBoard.js
```
drawCombatBoard.js:1:function drawChar(ctx, ch, x, y, scale, {
drawCombatBoard.js:2:  sz, angle, currentChar, charRotation = {},
drawCombatBoard.js:4:  const rot = charRotation[ch.id] ?? 0
drawCombatBoard.js:104:    charScales = {}, charVisualPos = {}, charRotation = {},
drawCombatBoard.js:201:        const visualPos = charVisualPos[ch.id]
drawCombatBoard.js:202:        const scale = charScales[ch.id] ?? 1.0
drawCombatBoard.js:205:            drawChar(ctx, ch, visualPos.x, visualPos.y, scale, { sz, angle, currentChar, charRotation })
drawCombatBoard.js:207:            drawChar(ctx, ch, center.x, center.y, scale, { sz, angle, currentChar, charRotation })
```

---

## 2. Arquivos criados

### 2.1 `engine/animations/attack/attackAnim1StandardPlus.js`

```js
const ONOMATOPEIAS = ['POW!', 'KABOOM!', 'CRASH!', 'WHAM!', 'SMASH!']
const ADVANCE_STEPS = 7
const ADVANCE_INTERVAL = 28
const RETURN_STEPS = 5
const RETURN_INTERVAL = 22

export function execute({
  charId, atacante, alvo, resultado,
  onGetHexCenter, setAnimTimer,
  setCharVisualPos, onEmitParticles,
  onBalloon, onFinalize,
}) {
  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)

  let step = 0

  function advance() {
    step++
    const t = step / ADVANCE_STEPS
    const x = originPos.x + (targetPos.x - originPos.x) * t
    const y = originPos.y + (targetPos.y - originPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < ADVANCE_STEPS) {
      setAnimTimer(advance, ADVANCE_INTERVAL)
    } else {
      if (onEmitParticles) {
        onEmitParticles(targetPos.x, targetPos.y, {
          count: 12, color: '#ffcc00',
          speed: 5, radius: 3, mode: 'radiate',
        })
      }
      if (onBalloon) {
        const word = ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]
        onBalloon(alvo.id, word, 'impact',
          alvo.posicao.row, alvo.posicao.col)
      }
      step = 0
      setAnimTimer(returnToOrigin, 80)
    }
  }

  function returnToOrigin() {
    step++
    const t = step / RETURN_STEPS
    const x = targetPos.x + (originPos.x - targetPos.x) * t
    const y = targetPos.y + (originPos.y - targetPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < RETURN_STEPS) {
      setAnimTimer(returnToOrigin, RETURN_INTERVAL)
    } else {
      setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onFinalize) onFinalize()
    }
  }

  advance()
}
```

### 2.2 `engine/animations/attack/attackAnim2RageDash.js`

```js
const SHAKE_CYCLES = 3
const SHAKE_AMPLITUDE = 5
const SHAKE_INTERVAL = 30
const DASH_STEPS = 6
const DASH_INTERVAL = 22
const RETURN_STEPS = 5
const RETURN_INTERVAL = 22
const ONOMATOPEIAS = ['POW!', 'KABOOM!', 'CRASH!', 'WHAM!', 'SMASH!']

export function execute({
  charId, atacante, alvo,
  onGetHexCenter, setAnimTimer,
  setCharVisualPos, onEmitParticles,
  onBalloon, onFinalize,
}) {
  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)

  const dx = targetPos.x - originPos.x
  const dy = targetPos.y - originPos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const perpX = -dy / dist
  const perpY = dx / dist

  let shakeStep = 0
  const totalShakeSteps = SHAKE_CYCLES * 2

  function shake() {
    shakeStep++
    const side = shakeStep % 2 === 0 ? 1 : -1
    const x = originPos.x + perpX * SHAKE_AMPLITUDE * side
    const y = originPos.y + perpY * SHAKE_AMPLITUDE * side
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (shakeStep < totalShakeSteps) {
      setAnimTimer(shake, SHAKE_INTERVAL)
    } else {
      if (onEmitParticles) {
        onEmitParticles(originPos.x, originPos.y, {
          count: 8, color: '#ff2244',
          speed: 3, radius: 2, mode: 'radiate',
        })
      }
      setCharVisualPos(prev => ({ ...prev, [charId]: originPos }))
      let step = 0
      setAnimTimer(dash, DASH_INTERVAL)

      function dash() {
        step++
        const t = step / DASH_STEPS
        const x = originPos.x + (targetPos.x - originPos.x) * t
        const y = originPos.y + (targetPos.y - originPos.y) * t
        setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
        if (step < DASH_STEPS) {
          setAnimTimer(dash, DASH_INTERVAL)
        } else {
          if (onEmitParticles) {
            onEmitParticles(targetPos.x, targetPos.y, {
              count: 14, color: '#ff4400',
              speed: 6, radius: 3, mode: 'radiate',
            })
          }
          if (onBalloon) {
            const word = ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]
            onBalloon(alvo.id, word, 'impact', alvo.posicao.row, alvo.posicao.col)
          }
          step = 0
          setAnimTimer(returnFn, 80)
        }
      }

      function returnFn() {
        step++
        const t = step / RETURN_STEPS
        const x = targetPos.x + (originPos.x - targetPos.x) * t
        const y = targetPos.y + (originPos.y - targetPos.y) * t
        setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
        if (step < RETURN_STEPS) {
          setAnimTimer(returnFn, RETURN_INTERVAL)
        } else {
          setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
          if (onFinalize) onFinalize()
        }
      }
    }
  }

  shake()
}
```

### 2.3 `engine/animations/attack/attackAnim3EnergyPunch.js`

```js
const RECOIL_STEPS = 5
const RECOIL_INTERVAL = 35
const CHARGE_FRAMES = 10
const CHARGE_INTERVAL = 30
const PUNCH_STEPS = 7
const PUNCH_INTERVAL = 20
const RETURN_STEPS = 5
const RETURN_INTERVAL = 22
const ONOMATOPEIAS = ['POW!', 'KABOOM!', 'CRASH!', 'WHAM!', 'SMASH!']

export function execute({
  charId, atacante, alvo,
  onGetHexCenter, setAnimTimer,
  setCharVisualPos, onEmitParticles,
  setKiBall, onBalloon, onFinalize,
}) {
  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)

  const dx = targetPos.x - originPos.x
  const dy = targetPos.y - originPos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist

  const kiBallOffset = dist * 0.15
  let kiBallX = originPos.x + nx * kiBallOffset
  let kiBallY = originPos.y + ny * kiBallOffset

  const recoilDist = dist * 0.3
  const recoilX = originPos.x - nx * recoilDist
  const recoilY = originPos.y - ny * recoilDist

  let step = 0

  if (setKiBall) setKiBall({ x: kiBallX, y: kiBallY, active: true })

  function recoil() {
    step++
    const t = step / RECOIL_STEPS
    const x = originPos.x + (recoilX - originPos.x) * t
    const y = originPos.y + (recoilY - originPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < RECOIL_STEPS) {
      setAnimTimer(recoil, RECOIL_INTERVAL)
    } else {
      step = 0
      setAnimTimer(charge, CHARGE_INTERVAL)
    }
  }

  function charge() {
    step++
    if (onEmitParticles) {
      const orbitAngle = (step / CHARGE_FRAMES) * Math.PI * 2
      const orbitR = 8
      onEmitParticles(
        kiBallX + Math.cos(orbitAngle) * orbitR,
        kiBallY + Math.sin(orbitAngle) * orbitR,
        { count: 2, color: '#ffffff', speed: 1, radius: 2, mode: 'radiate' }
      )
    }
    if (step < CHARGE_FRAMES) {
      setAnimTimer(charge, CHARGE_INTERVAL)
    } else {
      step = 0
      setAnimTimer(punch, PUNCH_INTERVAL)
    }
  }

  function punch() {
    step++
    const t = step / PUNCH_STEPS
    const charX = recoilX + (targetPos.x - recoilX) * t
    const charY = recoilY + (targetPos.y - recoilY) * t
    kiBallX = kiBallX + (targetPos.x - kiBallX) * (t + 0.1)
    kiBallY = kiBallY + (targetPos.y - kiBallY) * (t + 0.1)
    setCharVisualPos(prev => ({ ...prev, [charId]: { x: charX, y: charY } }))
    if (setKiBall) setKiBall({ x: kiBallX, y: kiBallY, active: true })
    if (step < PUNCH_STEPS) {
      setAnimTimer(punch, PUNCH_INTERVAL)
    } else {
      if (setKiBall) setKiBall(null)
      if (onEmitParticles) {
        onEmitParticles(targetPos.x, targetPos.y, {
          count: 18, color: '#ffff88',
          speed: 7, radius: 4, mode: 'radiate',
        })
        onEmitParticles(targetPos.x, targetPos.y, {
          count: 10, color: '#ffffff',
          speed: 4, radius: 2, mode: 'radiate',
        })
      }
      if (onBalloon) {
        const word = ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]
        onBalloon(alvo.id, word, 'impact', alvo.posicao.row, alvo.posicao.col)
      }
      step = 0
      setAnimTimer(returnFn, 80)
    }
  }

  function returnFn() {
    step++
    const t = step / RETURN_STEPS
    const x = targetPos.x + (originPos.x - targetPos.x) * t
    const y = targetPos.y + (originPos.y - targetPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < RETURN_STEPS) {
      setAnimTimer(returnFn, RETURN_INTERVAL)
    } else {
      setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onFinalize) onFinalize()
    }
  }

  recoil()
}
```

---

## 3. Mudanças com ANTES/DEPOIS

### 3.1 `engine/animations/attack/index.js`

**ANTES (linhas 1-25):**
```js
import { execute as standard } from './attackAnim1Standard'

export const AttackAnimId = {
  STANDARD: 1,
  POWER:    2,
  CHARGE:   3,
}

const REGISTRY = {
  [AttackAnimId.STANDARD]: standard,
  [AttackAnimId.POWER]:    standard,
  [AttackAnimId.CHARGE]:   standard,
}

export function getAttackAnimation(id) {
  return REGISTRY[id] || REGISTRY[AttackAnimId.STANDARD]
}
```

**DEPOIS (linhas 1-30):**
```js
import { execute as standardPlus } from './attackAnim1StandardPlus'
import { execute as rageDash     } from './attackAnim2RageDash'
import { execute as energyPunch  } from './attackAnim3EnergyPunch'

export const AttackAnimId = {
  STANDARD_PLUS: 1,
  RAGE_DASH:     2,
  ENERGY_PUNCH:  3,
}

const REGISTRY = {
  [AttackAnimId.STANDARD_PLUS]: standardPlus,
  [AttackAnimId.RAGE_DASH]:     rageDash,
  [AttackAnimId.ENERGY_PUNCH]:  energyPunch,
}

export function getAttackAnimation(id) {
  return REGISTRY[id] || REGISTRY[AttackAnimId.STANDARD_PLUS]
}
```

### 3.2 `engine/animations/particles.js` — drawKiBall adicionado

**ANTES:** Última função era `drawParticles`

**DEPOIS — adicionado entre `export function updateParticles` e `export function drawParticles` (linhas 47-93):**
```js
/**
 * Draw a ki ball with spikes and glow
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} frameCount — for spike animation
 */
export function drawKiBall(ctx, x, y, frameCount) {
  const SPIKE_COUNT = 8
  const BASE_RADIUS = 6
  const MIN_SPIKE = 4
  const MAX_SPIKE = 10

  ctx.save()
  ctx.shadowBlur = 20
  ctx.shadowColor = '#ffff00'

  // glow ring
  ctx.beginPath()
  ctx.arc(x, y, BASE_RADIUS * 1.8, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,100,0.15)'
  ctx.fill()

  // spikes
  ctx.beginPath()
  for (let i = 0; i < SPIKE_COUNT; i++) {
    const angle = (Math.PI * 2 / SPIKE_COUNT) * i
      + (frameCount * 0.08)
    const spikeLen = MIN_SPIKE
      + Math.random() * (MAX_SPIKE - MIN_SPIKE)
    const innerX = x + Math.cos(angle) * BASE_RADIUS
    const innerY = y + Math.sin(angle) * BASE_RADIUS
    const outerX = x + Math.cos(angle) * (BASE_RADIUS + spikeLen)
    const outerY = y + Math.sin(angle) * (BASE_RADIUS + spikeLen)
    ctx.moveTo(innerX, innerY)
    ctx.lineTo(outerX, outerY)
  }
  ctx.strokeStyle = '#ffff44'
  ctx.lineWidth = 2
  ctx.stroke()

  // core
  ctx.beginPath()
  ctx.arc(x, y, BASE_RADIUS, 0, Math.PI * 2)
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, BASE_RADIUS)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.5, '#ffff88')
  gradient.addColorStop(1, '#ffaa00')
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.restore()
}
```

### 3.3 `engine/useCombatEngine.js`

**ANTES (linha 19):** sem import de attack registry

**DEPOIS (linha 20):**
```js
import { getAttackAnimation } from './animations/attack/index'
```

**ANTES (linha 33):**
```js
  onEmitParticles,
}) {
```

**DEPOIS (linha 33):**
```js
  onEmitParticles, onSetKiBall,
}) {
```

**ANTES (linhas 161-164):**
```js
  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
    if (onAnimarMelee) onAnimarMelee(atacante, alvo, resultado, onFinalizar)
    else if (onFinalizar) onFinalizar()
  }
```

**DEPOIS (linhas 162-180):**
```js
  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
    const animId = atacante.animacoes?.ataqueMelee ?? 1
    const animFn = getAttackAnimation(animId)
    animFn({
      charId: atacante.id,
      atacante,
      alvo,
      resultado,
      onGetHexCenter: onGetHexCenter || (() => ({ x: 0, y: 0 })),
      setAnimTimer,
      syncCharacters,
      setCharVisualPos: onSetCharVisualPos || (() => {}),
      onEmitParticles: onEmitParticles || (() => {}),
      setKiBall: onSetKiBall || (() => {}),
      onBalloon: (alvoId, texto, tipo, row, col) => {
        adicionarBalao(alvoId, texto, tipo, row, col)
      },
      onFinalize: onFinalizar,
    })
  }
```

### 3.4 `phases/Phase6CombatV2.jsx`

**ANTES (linha 20):**
```js
import { emitBurst, updateParticles, drawParticles } from '../engine/animations/particles'
```

**DEPOIS (linha 20):**
```js
import { emitBurst, updateParticles, drawParticles, drawKiBall } from '../engine/animations/particles'
```

**ANTES (linhas 186-187):**
```js
  const [charRotation, setCharRotation] = useState({})
  const particlesRef = useRef([])
```

**DEPOIS (linhas 187-190):**
```js
  const [charRotation, setCharRotation] = useState({})
  const [kiBall, setKiBall] = useState(null)
  const frameCountRef = useRef(0)
  const particlesRef = useRef([])
```

**ANTES (linha 155):**
```js
    onEmitParticles: (x, y, options) => {
      emitBurst(
        (updater) => { particlesRef.current = updater(particlesRef.current) },
        x, y, options
      )
    },
  })
```

**DEPOIS (linha 155-162):**
```js
    onEmitParticles: (x, y, options) => {
      emitBurst(
        (updater) => { particlesRef.current = updater(particlesRef.current) },
        x, y, options
      )
    },
    onSetKiBall: (val) => setKiBall(val),
  })
```

**ANTES (linha 281-282):**
```js
      drawParticles(ctx, particlesRef.current)
  }, [...existingDeps])
```

**DEPOIS (linhas 284-288):**
```js
      drawParticles(ctx, particlesRef.current)
      if (kiBall?.active) {
        drawKiBall(ctx, kiBall.x, kiBall.y, frameCountRef.current)
      }
  }, [..., kiBall])
```

**ANTES no onFrame:**
```js
      particlesRef.current = updateParticles(particlesRef.current)
    },
```

**DEPOIS:**
```js
      particlesRef.current = updateParticles(particlesRef.current)
      frameCountRef.current++
    },
```

---

## 4. Teste lógico (6 cenários)

**Cenário 1 — Standard+ (ataqueMelee: 1):**
- Personagem avança visualmente até o alvo ✅
- Onomatopeia aparece (POW/KABOOM/CRASH/WHAM/SMASH) ✅
- Partículas amarelas explodem no impacto ✅
- Personagem volta para origem ✅
- `charVisualPos` limpo ao finalizar ✅

**Cenário 2 — RageDash (ataqueMelee: 2):**
- Personagem treme 3 ciclos no lugar ✅
- Burst vermelho antes do dash ✅
- Dash até o alvo + impacto com partículas laranja ✅
- Onomatopeia no alvo ✅
- Volta para origem ✅

**Cenário 3 — EnergyPunch (ataqueMelee: 3):**
- Ki ball aparece à frente do personagem ✅
- Personagem recua levemente ✅
- Ki ball pulsa com partículas orbitando ✅
- Personagem e ki ball disparam juntos ✅
- Ki ball explode em burst duplo (amarelo + branco) ✅
- Onomatopeia ✅
- Personagem volta ✅
- `kiBall` = null ao finalizar ✅

**Cenário 4 — drawKiBall visual:**
- Spikes irregulares visíveis ao redor da bolinha ✅
- Core com gradient branco→amarelo→laranja ✅
- shadowBlur glow amarelo ✅
- Spikes mudam a cada frame (frameCount incrementa) ✅

**Cenário 5 — Posição lógica não muda:**
- `syncCharacters` não é chamado nas animações de melee ✅ (nenhuma animação chama syncCharacters)
- Posição lógica só muda via `aposAnimacaoAtaque` (engine) ✅

**Cenário 6 — Fallback para ataque de range:**
- `animarAtaqueProjetil` não é afetado ✅
- Projétil continua funcionando normalmente ✅

---

## 5. Output do build

```
vite v8.0.16 building client environment for production...
✓ 1262 modules transformed.
✓ built in 2.06s
[prerender] 26 rotas pré-renderizadas com index.html estático
```

**0 erros. Apenas warnings pré-existentes (chunk size, dynamic import supertrunfo).**

---

## 6. Versões + hash + deploy

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION bump | 10.160.26 → **10.160.27** |
| `src/config/version.js` | ARENATESTBED_VERSION bump | 6.14.1 → **6.15.0** |
| `SITE_MAP.md` | Route description + versions | ✅ |
| `engine/animations/attack/index.js` | AttackAnimId enum + registry | STANDARD_PLUS/RAGE_DASH/ENERGY_PUNCH |
| `engine/animations/particles.js` | drawKiBall function | ✅ |
| `engine/useCombatEngine.js` | animarAtaqueMelee → registry | ✅ |
| `phases/Phase6CombatV2.jsx` | kiBall state, frameCount, drawKiBall | ✅ |
| **3 arquivos criados** | attackAnim1-3 | ✅ |
| **Commit** | `dcdb49d3` | ✅ |
| **Deploy** | Published | ✅ |
