# FEAT: Overlay DOM de impacto via canal overlay + EventBus

> **Data:** 2026-06-23
> **Versão:** ARENATESTBED **6.19.0** / SITE **10.160.36**
> **Commit:** `293bc5ac`
> **Status:** Deploy publicado ✅

---

## ETAPA 1 — Output BRUTO dos 4 comandos

### Comando 1 — Container balloon e ref no JSX

```
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:33:  const canvasContainerRef = useRef(null)
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:101:      const containerRect = canvasContainerRef.current?.getBoundingClientRect()
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:600:        <div className="atb-canvas-wrap" ref={canvasContainerRef}>
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:602:          <div className="atb-balloon-container"></div>
```

### Comando 2 — initRenderer call site (linhas 288-302)

```javascript
  useEffect(() => {
    initRenderer({
      trailRef,
      charsRef: charsFnRef,
      syncCharsRef: syncCharsFnRef,
      setAnimTimerRef: setAnimTimerFnRef,

      highlightRef,
    })
  }, [])
```

### Comando 3 — Primitivos overlay atuais (linhas 155-171)

```javascript
  StatusEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] StatusEffect', { params, dados, alvo })
    logAnimIds('StatusEffect', dados)
  },
  TextoEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] TextoEffect', { params, dados, alvo })
    logAnimIds('TextoEffect', dados)
  },
  FlashEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] FlashEffect', { params, dados, alvo })
    logAnimIds('FlashEffect', dados)
  },
  ShakeEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ShakeEffect', { params, dados, alvo })
    logAnimIds('ShakeEffect', dados)
  },
}
```

### Comando 4 — Como emit é importado/usado nos primitivos canvas

```
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:1:import { emit } from '../../engine/eventBus'
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:63:        emit('effect:end', { canal: 'canvas' })
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:71:        emit('effect:end', { canal: 'canvas' })
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:121:        emit('effect:end', { canal: 'canvas' })
```

---

## ETAPA 2 — overlayContainerRef

### 2.1 — Adicionar ref no Phase6CombatV2.jsx

**ANTES** (linha 46):
```javascript
  const charactersRef = useRef([])

  const { obstaculos
```

**DEPOIS** (linha 46-47):
```javascript
  const charactersRef = useRef([])
  const overlayContainerRef = useRef(null)

  const { obstaculos
```

### 2.2 — Passar para initRenderer

**ANTES** (linhas 289-298):
```javascript
  useEffect(() => {
    initRenderer({
      trailRef,
      charsRef: charsFnRef,
      syncCharsRef: syncCharsFnRef,
      setAnimTimerRef: setAnimTimerFnRef,

      highlightRef,
    })
  }, [])
```

**DEPOIS** (linhas 289-299):
```javascript
  useEffect(() => {
    initRenderer({
      trailRef,
      charsRef: charsFnRef,
      syncCharsRef: syncCharsFnRef,
      setAnimTimerRef: setAnimTimerFnRef,

      highlightRef,
      overlayContainerRef,
    })
  }, [])
```

### 2.3 — Adicionar ref ao JSX

**ANTES** (linha 602):
```jsx
          <div className="atb-balloon-container"></div>
```

**DEPOIS** (linha 602):
```jsx
          <div className="atb-balloon-container" ref={overlayContainerRef}></div>
```

---

## ETAPA 3 — Confirmar import emit

`import { emit } from '../../engine/eventBus'` já existe na linha 1 do EffectRenderer.js. ✅

---

## ETAPA 4 — Primitivos overlay implementados

### 4.1 — ImpactoEffect (linhas 83-112)

**ANTES:**
```javascript
  ImpactoEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ImpactoEffect', { params, dados, alvo })
    logAnimIds('ImpactoEffect', dados)
  },
```

**DEPOIS:**
```javascript
  ImpactoEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ImpactoEffect', { params, dados, alvo })
    logAnimIds('ImpactoEffect', dados)
    const container = _refs.overlayContainerRef?.current
    if (!container) {
      emit('effect:end', { canal: 'overlay' })
      return
    }
    const critico = dados.critico || false
    const el = document.createElement('div')
    el.className = critico
      ? 'atb-overlay-impacto atb-overlay-impacto--critico'
      : 'atb-overlay-impacto'
    el.textContent = String(dados.valor ?? '')
    if (dados.alvoPos) {
      el.style.setProperty('--overlay-x', `${dados.alvoPos.x}px`)
      el.style.setProperty('--overlay-y', `${dados.alvoPos.y}px`)
    }
    container.appendChild(el)
    requestAnimationFrame(() => {
      el.classList.add('atb-overlay-impacto--active')
    })
    const duracao = critico ? 1300 : 1200
    setTimeout(() => {
      el.remove()
      emit('effect:end', { canal: 'overlay' })
    }, duracao)
  },
```

### 4.2 — TextoEffect (linhas 161-192)

**ANTES:**
```javascript
  TextoEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] TextoEffect', { params, dados, alvo })
    logAnimIds('TextoEffect', dados)
  },
```

**DEPOIS:**
```javascript
  TextoEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] TextoEffect', { params, dados, alvo })
    logAnimIds('TextoEffect', dados)
    const container = _refs.overlayContainerRef?.current
    if (!container) {
      emit('effect:end', { canal: 'overlay' })
      return
    }
    const el = document.createElement('div')
    el.className = 'atb-overlay-texto'
    const conteudo = dados.valor !== undefined ? String(dados.valor)
      : dados.nome ? dados.nome
      : dados.texto ? dados.texto
      : ''
    el.textContent = conteudo
    if (dados.alvoPos) {
      el.style.setProperty('--overlay-x', `${dados.alvoPos.x}px`)
      el.style.setProperty('--overlay-y', `${dados.alvoPos.y}px`)
      el.classList.add('atb-overlay-texto--positioned')
    } else {
      el.classList.add('atb-overlay-texto--centered')
    }
    container.appendChild(el)
    requestAnimationFrame(() => {
      el.classList.add('atb-overlay-texto--active')
    })
    const duracao = params.duracao || 800
    setTimeout(() => {
      el.remove()
      emit('effect:end', { canal: 'overlay' })
    }, duracao)
  },
```

### 4.3 — FlashEffect (linhas 194-213)

**ANTES:**
```javascript
  FlashEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] FlashEffect', { params, dados, alvo })
    logAnimIds('FlashEffect', dados)
  },
```

**DEPOIS:**
```javascript
  FlashEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] FlashEffect', { params, dados, alvo })
    logAnimIds('FlashEffect', dados)
    const container = _refs.overlayContainerRef?.current
    if (!container) {
      emit('effect:end', { canal: 'overlay' })
      return
    }
    const el = document.createElement('div')
    el.className = 'atb-overlay-flash'
    el.style.setProperty('--flash-color', params.cor || '#ff0000')
    container.appendChild(el)
    requestAnimationFrame(() => {
      el.classList.add('atb-overlay-flash--active')
    })
    const duracao = params.duracao || 400
    setTimeout(() => {
      el.remove()
      emit('effect:end', { canal: 'overlay' })
    }, duracao)
  },
```

### 4.4 — ShakeEffect (linhas 215-232)

**ANTES:**
```javascript
  ShakeEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ShakeEffect', { params, dados, alvo })
    logAnimIds('ShakeEffect', dados)
  },
```

**DEPOIS:**
```javascript
  ShakeEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ShakeEffect', { params, dados, alvo })
    logAnimIds('ShakeEffect', dados)
    const container = _refs.overlayContainerRef?.current
    if (!container) {
      emit('effect:end', { canal: 'overlay' })
      return
    }
    container.classList.add('atb-overlay-shake')
    const duracao = params.duracao || 500
    setTimeout(() => {
      container.classList.remove('atb-overlay-shake')
      emit('effect:end', { canal: 'overlay' })
    }, duracao)
  },
```

---

## ETAPA 5 — effectsMap atualizado

### 5.1 — Novo: `impacto` (inserido antes de `dano`)

```javascript
  impacto: {
    canal: 'overlay',
    duracao_auto: false,
    prioridade: 2,
    primitivo: 'ImpactoEffect',
    dadosObrigatorios: ['valor'],
    params: {
      cor: '#ff4444',
      particula: null,
      tamanho: 1.0,
      velocidade: 'rapida',
      som: null,
      impactoAoChegar: null,
      impactoParams: null,
    },
  },
```

### 5.2 — Todos os overlay com `duracao_auto: false`

| Tipo | ANTES | DEPOIS |
|------|-------|--------|
| `impacto` | (não existia) | `duracao_auto: false` (novo) |
| `dano` | `duracao_auto: true, duracao: 800` | `duracao_auto: false` |
| `flash` | `duracao_auto: true, duracao: 400` | `duracao_auto: false` |
| `shake` | `duracao_auto: true, duracao: 500` | `duracao_auto: false` |
| `balao` | `duracao_auto: true, duracao: 1300` | `duracao_auto: false` |
| `popup` | `duracao_auto: true, duracao: 800` | `duracao_auto: false` |
| `banner_ia` | `duracao_auto: true, duracao: 1500` | `duracao_auto: false` |
| `anuncio_turno` | `duracao_auto: true, duracao: 2000` | `duracao_auto: false` |
| `vitoria` | `duracao_auto: true, duracao: 3000` | `duracao_auto: false` |
| `veneno` | `duracao_auto: false` (já era) | mantido |

---

## ETAPA 6 — onDano no Phase6CombatV2

**ANTES** (linhas 80-90):
```javascript
    onDano: (alvoId, dano) => {
      if (dano <= 0) return
      const alvo = charactersRef.current.find(c => c.id === alvoId)
      if (!alvo) return
      setHpAnterior(prev => ({ ...prev, [alvoId]: alvo.hp }))
      dispatchEffect({ tipo: 'dano', alvo: alvoId, dados: { valor: dano }, caller: 'onDano' })
      dispatchEffect({ tipo: 'popup', alvo: alvoId, dados: { valor: dano }, caller: 'onDano' })
      dispatchEffect({ tipo: 'shake', alvo: null, dados: {}, caller: 'onDano' })
      dispatchEffect({ tipo: 'flash', alvo: alvoId, dados: {}, caller: 'onDano' })
      dispatchEffect({ tipo: 'hp_delta', alvo: alvoId, dados: { dano }, caller: 'onDano' })
    },
```

**DEPOIS** (linhas 80-89):
```javascript
    onDano: (alvoId, dano) => {
      if (dano <= 0) return
      const alvo = charactersRef.current.find(c => c.id === alvoId)
      if (!alvo) return
      setHpAnterior(prev => ({ ...prev, [alvoId]: alvo.hp }))
      dispatchEffect({ tipo: 'impacto', alvo: alvoId, dados: { valor: dano, critico: dano >= 8 }, caller: 'onDano' })
      dispatchEffect({ tipo: 'shake', alvo: null, dados: {}, caller: 'onDano' })
      dispatchEffect({ tipo: 'flash', alvo: alvoId, dados: {}, caller: 'onDano' })
      dispatchEffect({ tipo: 'hp_delta', alvo: alvoId, dados: { dano }, caller: 'onDano' })
    },
```

---

## ETAPA 7 — CSS adicionado ao atb-ui.css

```css
/* ══════════════════════════════════════════
   OVERLAY DOM — Canal overlay primitivos
   ══════════════════════════════════════════ */

.atb-balloon-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  overflow: hidden;
}

/* ── Número de dano grande (ImpactoEffect) ── */
.atb-overlay-impacto {
  position: absolute;
  left: var(--overlay-x, 50%);
  top: var(--overlay-y, 40%);
  transform: translate(-50%, -50%) scale(0.2);
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 3.5rem;
  font-weight: 900;
  color: #ff4444;
  line-height: 1;
  pointer-events: none;
  opacity: 0;
  text-shadow:
    0 0 10px rgba(255, 68, 68, 0.9),
    0 0 20px rgba(255, 68, 68, 0.6),
    0 0 40px rgba(255, 68, 68, 0.3),
    2px 2px 0 rgba(0, 0, 0, 0.8);
}

.atb-overlay-impacto--critico {
  font-size: 5rem;
  color: #ffcc00;
  text-shadow:
    0 0 12px rgba(255, 204, 0, 1),
    0 0 24px rgba(255, 204, 0, 0.7),
    0 0 48px rgba(255, 204, 0, 0.4),
    0 0 80px rgba(255, 140, 0, 0.3),
    2px 2px 0 rgba(0, 0, 0, 0.9);
}

.atb-overlay-impacto--active {
  animation: overlay-impacto-pop 1.2s
    cubic-bezier(0.17, 0.67, 0.3, 1.3) forwards;
}

.atb-overlay-impacto--critico.atb-overlay-impacto--active {
  animation: overlay-impacto-critico-pop 1.3s
    cubic-bezier(0.17, 0.67, 0.3, 1.5) forwards;
}

@keyframes overlay-impacto-pop {
  0%   { opacity: 0;
         transform: translate(-50%, -50%) scale(0.2); }
  30%  { opacity: 1;
         transform: translate(-50%, -70%) scale(1.1); }
  60%  { opacity: 1;
         transform: translate(-50%, -90%) scale(1.0); }
  85%  { opacity: 0.8;
         transform: translate(-50%, -110%) scale(0.95); }
  100% { opacity: 0;
         transform: translate(-50%, -130%) scale(0.9); }
}

@keyframes overlay-impacto-critico-pop {
  0%   { opacity: 0;
         transform: translate(-50%, -50%) scale(0.2) rotate(-8deg); }
  25%  { opacity: 1;
         transform: translate(-50%, -65%) scale(1.3) rotate(3deg); }
  50%  { opacity: 1;
         transform: translate(-50%, -85%) scale(1.1) rotate(-1deg); }
  75%  { opacity: 1;
         transform: translate(-50%, -105%) scale(1.05) rotate(0deg); }
  90%  { opacity: 0.7;
         transform: translate(-50%, -125%) scale(1.0); }
  100% { opacity: 0;
         transform: translate(-50%, -140%) scale(0.95); }
}

/* ── Texto genérico (TextoEffect) ── */
.atb-overlay-texto {
  position: absolute;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 700;
  pointer-events: none;
  opacity: 0;
}

.atb-overlay-texto--positioned {
  left: var(--overlay-x);
  top: var(--overlay-y);
  transform: translate(-50%, -50%);
  font-size: 1rem;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255,255,255,0.5),
               2px 2px 0 rgba(0,0,0,0.8);
}

.atb-overlay-texto--centered {
  left: 50%;
  top: 38%;
  transform: translate(-50%, -50%);
  font-size: 1.4rem;
  letter-spacing: 0.15em;
  color: #ffffff;
  text-shadow: 0 0 12px rgba(255,255,255,0.5);
  text-align: center;
  width: 100%;
}

.atb-overlay-texto--active {
  animation: overlay-texto-float 0.9s ease-out forwards;
}

@keyframes overlay-texto-float {
  0%   { opacity: 0;
         transform: translate(-50%, -50%) scale(0.5); }
  25%  { opacity: 1;
         transform: translate(-50%, -70%) scale(1.05); }
  70%  { opacity: 1;
         transform: translate(-50%, -90%) scale(1.0); }
  100% { opacity: 0;
         transform: translate(-50%, -110%) scale(0.9); }
}

/* ── Flash de tela (FlashEffect) ── */
.atb-overlay-flash {
  position: absolute;
  inset: 0;
  background: var(--flash-color, #ff0000);
  opacity: 0;
  pointer-events: none;
}

.atb-overlay-flash--active {
  animation: overlay-flash-pulse 0.4s ease-out forwards;
}

@keyframes overlay-flash-pulse {
  0%   { opacity: 0.35; }
  40%  { opacity: 0.20; }
  100% { opacity: 0; }
}

/* ── Shake do container (ShakeEffect) ── */
@keyframes overlay-shake {
  0%   { transform: translate(0, 0); }
  15%  { transform: translate(-4px, 2px); }
  30%  { transform: translate(4px, -2px); }
  45%  { transform: translate(-3px, 3px); }
  60%  { transform: translate(3px, -1px); }
  75%  { transform: translate(-2px, 2px); }
  90%  { transform: translate(2px, -1px); }
  100% { transform: translate(0, 0); }
}

.atb-overlay-shake {
  animation: overlay-shake 0.5s ease-out;
}
```

---

## ETAPA 8 — Teste lógico

**Cenário 1 — Contrato do bus:**
- `ImpactoEffect` cria elemento, anima via `requestAnimationFrame`, remove via `setTimeout`, emite `emit('effect:end', { canal: 'overlay' })`
- Bus notifica `useEffectMachine` → `finalizarEfeito('overlay')` → fila avança
- Nenhum timer paralelo (duracao_auto: false, então useEffectMachine não agenda timer)
✅

**Cenário 2 — Guard sem container:**
- `overlayContainerRef.current` é null (antes do mount)
- Primitivo chama `emit('effect:end')` e retorna sem criar DOM
- Canal overlay não trava
✅

**Cenário 3 — duracao_auto: false em todos os overlay:**
- `useEffectMachine` não agenda timer (`if (definicao.duracao_auto === true)` é false)
- O primitivo é o único responsável por finalizar via `emit('effect:end')`
- Hit stop não interfere — hit stop pausa decays no `onFrame` do canvas, mas timers DOM do overlay continuam rodando normalmente
✅

**Cenário 4 — Dano crítico:**
- `dados: { valor: 12, critico: true }` dispatchado em `onDano` quando `dano >= 8`
- Elemento com `atb-overlay-impacto atb-overlay-impacto--critico`
- Animação maior (1.3s), cor amarela neon, rotate nos keyframes
✅

**Cenário 5 — Shake e Flash via bus:**
- `ShakeEffect` adiciona classe `atb-overlay-shake` ao container, setTimeout remove
- `FlashEffect` cria div `atb-overlay-flash`, setTimeout remove
- Ambos emitem `effect:end` ao finalizar
- Canal overlay avança corretamente
✅

**Cenário 6 — Zero vazamento para Phase6CombatV2:**
- Phase6CombatV2 só tem: `const overlayContainerRef = useRef(null)`, `initRenderer({ overlayContainerRef })`, `ref={overlayContainerRef}` no JSX, `dispatchEffect({ tipo: 'impacto', ... })` no onDano
- Toda lógica DOM (criação, animação, remoção, emissão effect:end) está no EffectRenderer.js
- Nenhum primitivo canvas foi alterado
✅

---

## ETAPA 9 — Build output

```
> npm run build

> illusion-fight@1.0.0 build
> vite build && node scripts/prerender-routes.js

vite v8.0.16 building client environment for production...
✓ 1270 modules transformed.
...
dist/assets/index-CwB8swrV.css                          544.76 kB │ gzip:  87.65 kB
dist/assets/index-j3C01yw6.js                         3,000.55 kB │ gzip: 897.00 kB │ map: 7,400.74 kB
...
✓ built in 2.13s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Build sem erros. Warnings pré-existentes (chunk size, dynamic imports duplicados).

---

## ETAPA 10 — Versões, hash, deploy

| Constante | Antes | Depois |
|-----------|-------|--------|
| `SITE_VERSION` | 10.160.35 | → **10.160.36** |
| `ARENATESTBED_VERSION` | 6.18.4 | → **6.19.0** (minor) |

### Arquivos modificados

| Arquivo | O que mudou |
|---------|-------------|
| `src/config/version.js` | SITE_VERSION +1, ARENATESTBED_VERSION minor +1 |
| `SITE_MAP.md` | Versões atualizadas |
| `phases/Phase6CombatV2.jsx` | `overlayContainerRef` + initRenderer + JSX ref + onDano usa `impacto` |
| `components/effects/EffectRenderer.js` | ImpactoEffect, TextoEffect, FlashEffect, ShakeEffect DOM |
| `components/effects/effectsMap.js` | `impacto` entry + `duracao_auto: false` em todos overlay |
| `phases/atb-ui.css` | CSS overlay DOM (impacto, texto, flash, shake) |

| Item | Detalhe |
|------|---------|
| **Commit** | `293bc5ac` — `feat: overlay DOM via EffectRenderer + EventBus + ImpactoEffect neon + v6.19.0` |
| **Push** | ✅ `main → main` |
| **Deploy** | ✅ Published |
| **Relatório** | `docs/ReportAI/2026-06-23_FEAT_OVERLAY-DOM-EVENTBUS_v6.19.0.md` |
