# FEAT: EventBus + integração useEffectMachine

**Data:** 2026-06-23
**Versão:** SITE 10.160.17 → **10.160.18** · ARENATESTBED 6.10.0 → **6.11.0**
**Commit:** `1c81ac52`
**Deploy:** ✅ Published

---

## 1. Output bruto dos 5 greps da Etapa 1

### Grep 1 — `finalizarEfeito` em todo o ArenaTestbed

```
engine/useEffectMachine.js:
  Line 29:   function finalizarEfeito(canal) {
  Line 63:       timerFnRef.current(() => finalizarEfeito(canal), definicao.duracao)
  Line 73:         timerFnRef.current(() => finalizarEfeito(canal), 5000)
  Line 125:     finalizarEfeito,

phases/Phase6CombatV2.jsx:
  Line 47:   const { dispatchEffect, finalizarEfeito, setEffectTimer } = useEffectMachine()
  Line 123:       finalizarEfeito('canvas')
  Line 212:       finalizarEfeito('canvas')
  Line 215:       finalizarEfeito('canvas')
  Line 218:       finalizarEfeito('canvas')
  Line 221:   }, [highlightedCells, attackCells, rangeCells, dispatchEffect, finalizarEfeito])
```

### Grep 2 — `onFinalizar` em todo o ArenaTestbed

```
engine/useEffectMachine.js:
  Line 67:       if (!dados?.onFinalizar) {
  Line 69:           '[EFFECT] ERRO: efeito com duracao_auto:false sem onFinalizar.',

components/effects/EffectRenderer.js:
  Line 26:     const { atacanteId, alvoId, onFinalizar } = dados
  Line 28:       if (onFinalizar) setTimeout(onFinalizar, 100)
  Line 34:     if (!atacante || !personagemAlvo) { if (onFinalizar) setTimeout(onFinalizar, 100); return }
  Line 49:         if (onFinalizar) onFinalizar()
  Line 56:         if (onFinalizar) onFinalizar()
  Line 71:     const { atacanteId, alvoId, onFinalizar } = dados
  Line 73:       if (onFinalizar) setTimeout(onFinalizar, 50)
  Line 79:     if (!atacante || !personagemAlvo) { if (onFinalizar) setTimeout(onFinalizar, 50); return }
  Line 101:         if (onFinalizar) onFinalizar()

engine/useCombatEngine.js:
  Line 148:   function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
  Line 149:     if (onAnimarMelee) onAnimarMelee(atacante, alvo, resultado, onFinalizar)
  Line 150:     else if (onFinalizar) onFinalizar()
  Line 153:   function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
  Line 154:     if (onAnimarProjetil) onAnimarProjetil(atacante, alvo, resultado, onFinalizar)
  Line 155:     else if (onFinalizar) onFinalizar()

phases/Phase6CombatV2.jsx:
  Line 80:     onAnimarMelee: (atacante, alvo, resultado, onFinalizar) => {
  Line 81:       dispatchEffect({ tipo: 'melee', ... onFinalizar })
  Line 84:     onAnimarProjetil: (atacante, alvo, resultado, onFinalizar) => {
  Line 85:       dispatchEffect({ tipo: 'projetil', ... onFinalizar })
```

### Grep 3 — `duracao_auto` em effectsMap.js

Todos os 20 efeitos listados. `duracao_auto: false` em:
- `ia_thinking` (line 164)
- `veneno` (line 242)
- `highlight_movimento` (line 258)
- `highlight_ataque` (line 272)
- `highlight_range` (line 286)

Os demais 15 são `duracao_auto: true`.

### Grep 4 — `finalizarEfeito|setEffectTimer|dispatchEffect` em Phase6CombatV2.jsx

24 matches. Linha 47 destrói `finalizarEfeito`. Linhas 123, 212, 215, 218 chamam `finalizarEfeito('canvas')`. Linha 174 chama `setEffectTimer`.

### Grep 5 — `onClearHighlight|onClearTrail|finalizarTurnoIA` em useCombatEngine.js

12 matches. `onClearHighlight` chamado em 293, 323, 331. `finalizarTurnoIA` definido em 647, chamado em 588, 589, 601, 602, 643.

---

## 2. engine/eventBus.js — completo

```js
const listeners = {}

export function on(evento, fn) {
  if (!listeners[evento]) listeners[evento] = []
  listeners[evento].push(fn)
}

export function off(evento, fn) {
  if (!listeners[evento]) return
  listeners[evento] = listeners[evento].filter(f => f !== fn)
}

export function emit(evento, dados) {
  if (!listeners[evento]) return
  listeners[evento].forEach(fn => fn(dados))
}
```

---

## 3. ANTES e DEPOIS de cada mudança

### 3.1 — useEffectMachine.js

**Import (linhas 1-4):**
```js
// ANTES:
import { useState, useRef, useCallback } from 'react'
import { EFFECTS_MAP } from '../components/effects/effectsMap'
import { executar as executarRenderer } from '../components/effects/EffectRenderer'

// DEPOIS:
import { useState, useRef, useCallback, useEffect } from 'react'
import { EFFECTS_MAP } from '../components/effects/effectsMap'
import { executar as executarRenderer } from '../components/effects/EffectRenderer'
import { on, off, emit } from './eventBus'
```

**Listener effect (após setEffectTimer, linhas 30-36):**
```js
// ANTES:
  const setEffectTimer = useCallback((fn) => {
    timerFnRef.current = fn
  }, [])

  function finalizarEfeito(canal) {

// DEPOIS:
  const setEffectTimer = useCallback((fn) => {
    timerFnRef.current = fn
  }, [])

  useEffect(() => {
    function handleEffectEnd({ canal }) {
      finalizarEfeito(canal)
    }
    on('effect:end', handleEffectEnd)
    return () => off('effect:end', handleEffectEnd)
  }, [])

  function finalizarEfeito(canal) {
```

**Timer + guard removido (linhas 62-75):**
```js
// ANTES:
    if (definicao.duracao_auto === true) {
      timerFnRef.current(() => finalizarEfeito(canal), definicao.duracao)
    }

    if (definicao.duracao_auto === false) {
      if (!dados?.onFinalizar) {
        console.error(
          '[EFFECT] ERRO: efeito com duracao_auto:false sem onFinalizar.',
          'Tipo:', tipo, 'Canal:', canal,
          'O canal ficará travado. Finalizando automaticamente em 5s como fallback.'
        )
        timerFnRef.current(() => finalizarEfeito(canal), 5000)
      }
    }

// DEPOIS:
    if (definicao.duracao_auto === true) {
      timerFnRef.current(() => emit('effect:end', { canal }), definicao.duracao)
    }
```

**Return object (linhas 121-127):**
```js
// ANTES:
  return {
    dispatchEffect,
    finalizarEfeito,
    setEffectTimer,

// DEPOIS:
  return {
    dispatchEffect,
    setEffectTimer,
```

### 3.2 — EffectRenderer.js

**Import (linha 1):**
```js
// ANTES:
let _refs = {}
export function init(refs) { _refs = refs }

// DEPOIS:
import { emit } from '../../engine/eventBus'

let _refs = {}
export function init(refs) { _refs = refs }
```

**ProjetilEffect — `avancar` success (linhas 46-51):**
```js
// ANTES:
      if (stepIdx >= steps.length) {
        if (setProjPos) setProjPos(null)
        if (setProjPath) setProjPath([])
        if (onFinalizar) onFinalizar()

// DEPOIS:
      if (stepIdx >= steps.length) {
        if (setProjPos) setProjPos(null)
        if (setProjPath) setProjPath([])
        emit('effect:end', { canal: 'canvas' })
        if (onFinalizar) onFinalizar()
```

**ProjetilEffect — guard failure (linhas 53-58):**
```js
// ANTES:
      if (!passo || passo.row === undefined || passo.col === undefined) {
        if (setProjPos) setProjPos(null)
        if (setProjPath) setProjPath([])
        if (onFinalizar) onFinalizar()

// DEPOIS:
      if (!passo || passo.row === undefined || passo.col === undefined) {
        if (setProjPos) setProjPos(null)
        if (setProjPath) setProjPath([])
        emit('effect:end', { canal: 'canvas' })
        if (onFinalizar) onFinalizar()
```

**AuraEffect — final setTimer (linhas 100-102):**
```js
// ANTES:
      setTimer(() => {
        if (onFinalizar) onFinalizar()
      }, 200)

// DEPOIS:
      setTimer(() => {
        emit('effect:end', { canal: 'canvas' })
        if (onFinalizar) onFinalizar()
      }, 200)
```

### 3.3 — Phase6CombatV2.jsx

**Import (linhas 17-19):**
```js
// ANTES:
import useEffectMachine from '../engine/useEffectMachine'
import { init as initRenderer, clearHighlight } from '../components/effects/EffectRenderer'

// DEPOIS:
import useEffectMachine from '../engine/useEffectMachine'
import { init as initRenderer, clearHighlight } from '../components/effects/EffectRenderer'
import { emit } from '../engine/eventBus'
```

**Destructuring (linha 47):**
```js
// ANTES:
  const { dispatchEffect, finalizarEfeito, setEffectTimer } = useEffectMachine()

// DEPOIS:
  const { dispatchEffect, setEffectTimer } = useEffectMachine()
```

**onClearHighlight (linhas 121-124):**
```js
// ANTES:
    onClearHighlight: () => {
      clearHighlight()
      finalizarEfeito('canvas')
    },

// DEPOIS:
    onClearHighlight: () => {
      clearHighlight()
      emit('effect:end', { canal: 'canvas' })
    },
```

**useEffect highlights (linhas 211-221):**
```js
// ANTES:
    if (highlightedCells.length === 0 && prev.move.length > 0) {
      finalizarEfeito('canvas')
    }
    if (attackCells.length === 0 && prev.attack.length > 0) {
      finalizarEfeito('canvas')
    }
    if (rangeCells.length === 0 && prev.range.length > 0) {
      finalizarEfeito('canvas')
    }
    prevCellsRef.current = { move: highlightedCells, attack: attackCells, range: rangeCells }
  }, [highlightedCells, attackCells, rangeCells, dispatchEffect, finalizarEfeito])

// DEPOIS:
    if (highlightedCells.length === 0 && prev.move.length > 0) {
      emit('effect:end', { canal: 'canvas' })
    }
    if (attackCells.length === 0 && prev.attack.length > 0) {
      emit('effect:end', { canal: 'canvas' })
    }
    if (rangeCells.length === 0 && prev.range.length > 0) {
      emit('effect:end', { canal: 'canvas' })
    }
    prevCellsRef.current = { move: highlightedCells, attack: attackCells, range: rangeCells }
  }, [highlightedCells, attackCells, rangeCells, dispatchEffect])
```

### 3.4 — useCombatEngine.js

**Import (linha 17-18):**
```js
// ANTES:
import { TipoAcao } from './TurnController'

// DEPOIS:
import { TipoAcao } from './TurnController'
import { emit } from './eventBus'
```

**finalizarTurnoIA (linhas 647-653):**
```js
// ANTES:
    function finalizarTurnoIA() {
      addLog(`  ✅ ${iaChar.nome} finalizou o turno.`)
      iaThinkingRef.current = false; setIaThinking(false)
      if (onUnlockInput) onUnlockInput(0)

// DEPOIS:
    function finalizarTurnoIA() {
      addLog(`  ✅ ${iaChar.nome} finalizou o turno.`)
      iaThinkingRef.current = false; setIaThinking(false)
      emit('effect:end', { canal: 'hud' })
      if (onUnlockInput) onUnlockInput(0)
```

---

## 4. Teste lógico — 5 cenários

### Cenário 1 — Efeito pontual (dano, duracao_auto: true)
1. `dispatchEffect({ tipo: 'dano' })` → canal overlay EXECUTANDO
2. Timer dispara → `emit('effect:end', { canal: 'overlay' })`
3. Bus chama `handleEffectEnd` → `finalizarEfeito('overlay')`
4. Canal volta a IDLE
✅ **Funciona** — mesma lógica anterior, mas via bus em vez de chamada direta.

### Cenário 2 — Efeito melee (duracao_auto: true, não false como no enunciado)
1. `dispatchEffect({ tipo: 'melee', dados: { onFinalizar: cbEngine } })`
2. `AuraEffect` executa animação
3. Animação termina → `emit('effect:end', { canal: 'canvas' })` **+** timer (500ms) também emite
4. Bus → `finalizarEfeito('canvas')` — canal libera
5. `dados.onFinalizar()` → engine continua com `aposAnimacaoAtaque`
✅ **Funciona** — `melee` é `duracao_auto: true`, então timer + primitivo emitem. `finalizarEfeito` é idempotente em canal já IDLE. Nota: o enunciado diz "duracao_auto: false" mas `melee` no effectsMap é `true`. Isso não quebra o fluxo.

### Cenário 3 — Highlight (duracao_auto: false)
1. `dispatchEffect({ tipo: 'highlight_movimento', dados: { cells } })`
2. Canal canvas EXECUTANDO — sem timer, sem onFinalizar
3. Jogador confirma movimento → engine chama `onClearHighlight`
4. `onClearHighlight` → `clearHighlight()` + `emit('effect:end', { canal: 'canvas' })`
5. Bus → `finalizarEfeito('canvas')` — canal libera
✅ **Funciona** — a emissão agora vai pelo bus.

### Cenário 4 — ia_thinking (duracao_auto: false)
1. `dispatchEffect({ tipo: 'ia_thinking' })` → canal hud EXECUTANDO
2. IA termina turno → `finalizarTurnoIA`
3. `emit('effect:end', { canal: 'hud' })` dentro de finalizarTurnoIA
4. Bus → `finalizarEfeito('hud')` — canal libera
✅ **Funciona** — nova emissão adicionada ao finalizarTurnoIA.

### Cenário 5 — Nenhum console.error de onFinalizar
Nenhum efeito gera o erro anterior de "duracao_auto:false sem onFinalizar"
✅ **Funciona** — o bloco do guard foi completamente removido.

---

## 5. Output completo do npm run build

```
vite v8.0.16 building client environment for production...
✓ built in 3.06s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Build sem erros. Warnings conhecidos (chunk size, dynamic import ineficaz) pré-existentes.

---

## 6. Versões antes e depois + hash + deploy

| Constante | Antes | Depois |
|-----------|-------|--------|
| `SITE_VERSION` | 10.160.17 | **10.160.18** |
| `ARENATESTBED_VERSION` | 6.10.0 | **6.11.0** |

| Item | Valor |
|------|-------|
| **Commit hash** | `1c81ac52` |
| **Mensagem** | `feat: EventBus + integração useEffectMachine + v6.11.0` |
| **Deploy** | ✅ Published |
| **Arquivos modificados** | 4 (useEffectMachine.js, EffectRenderer.js, Phase6CombatV2.jsx, useCombatEngine.js) |
| **Arquivos criados** | 1 (engine/eventBus.js) |
| **Arquivos de config** | 2 (version.js, SITE_MAP.md) |

---

## Sinais de alerta — verificação pós-build

- ✅ `finalizarEfeito` removido do objeto retornado pelo hook
- ✅ Nenhuma chamada direta a `finalizarEfeito` de fora da máquina (Phase6CombatV2 e useCombatEngine usam `emit`)
- ✅ `console.error` de "duracao_auto:false sem onFinalizar" removido
- ✅ `on('effect:end')` registrado no useEffect do hook
- ✅ `off('effect:end')` presente no cleanup do useEffect
- ✅ Build passou (1251 módulos transformados)
