# REFACTOR — useEffectMachine — 5 Correções Arquiteturais

> **Versão:** ARENATESTBED v6.9.13 → v6.10.0 / SITE v10.160.16 → v10.160.17  
> **Data:** 2026-06-23  
> **Tipo:** Refactor  
> **Autor:** Agente LDI (automated)

---

## Etapa 1 — Prova de Leitura (6 greps)

### 1. setTimeout em useEffectMachine.js
```
src/.../useEffectMachine.js:56: setTimeout(() => finalizarEfeito(canal), definicao.duracao)
```

### 2. tipo: no effectsMap.js
```
src/.../effectsMap.js:4:    tipo: 'pontual',
src/.../effectsMap.js:20:    tipo: 'pontual',
src/.../effectsMap.js:36:    tipo: 'pontual',
src/.../effectsMap.js:52:    tipo: 'pontual',
src/.../effectsMap.js:68:    tipo: 'pontual',
src/.../effectsMap.js:84:    tipo: 'pontual',
src/.../effectsMap.js:100:    tipo: 'pontual',
src/.../effectsMap.js:116:    tipo: 'pontual',
src/.../effectsMap.js:132:    tipo: 'pontual',
src/.../effectsMap.js:148:    tipo: 'pontual',
src/.../effectsMap.js:164:    tipo: 'persistente',
src/.../effectsMap.js:180:    tipo: 'pontual',
src/.../effectsMap.js:196:    tipo: 'pontual',
src/.../effectsMap.js:212:    tipo: 'pontual',
src/.../effectsMap.js:227:    tipo: 'pontual',
src/.../effectsMap.js:242:    tipo: 'persistente',
src/.../effectsMap.js:258:    tipo: 'persistente',
src/.../effectsMap.js:264:      tipo: 'movimento',   ← params.tipo (HighlightEffect)
src/.../effectsMap.js:272:    tipo: 'persistente',
src/.../effectsMap.js:278:      tipo: 'ataque',       ← params.tipo
src/.../effectsMap.js:286:    tipo: 'persistente',
src/.../effectsMap.js:292:      tipo: 'alcance',      ← params.tipo
src/.../effectsMap.js:300:    tipo: 'pontual',
src/.../effectsMap.js:307:      tipo: 'limpar',       ← params.tipo
```
**20 effect-level `tipo:` + 4 params-level `tipo:`**

### 3. hud em useEffectMachine.js
```
src/.../useEffectMachine.js:13:  hud: { estado: ESTADO_IDLE, fila: [], ativo: null },
src/.../useEffectMachine.js:20:    hud: { ...canaisPadrao.hud },
src/.../useEffectMachine.js:71:    if (canal === 'hud') {
```

### 4. executarRenderer em useEffectMachine.js
```
src/.../useEffectMachine.js:3: import { executar as executarRenderer } from '../components/effects/EffectRenderer'
src/.../useEffectMachine.js:53:    executarRenderer(definicao.primitivo, { ...definicao.params, ...dados, alvo })
```

### 5. executar fn em EffectRenderer.js
```
src/.../EffectRenderer.js:137: export function executar(primitivo, params) {
src/.../EffectRenderer.js:143:   fn(params)
```

### 6. onFinalizar em EffectRenderer.js
```
src/.../EffectRenderer.js:26:     const { atacanteId, alvoId, onFinalizar } = params
src/.../EffectRenderer.js:28:       if (onFinalizar) setTimeout(onFinalizar, 100)
src/.../EffectRenderer.js:34:     if (!atacante || !alvo) { if (onFinalizar) setTimeout(onFinalizar, 100); return }
src/.../EffectRenderer.js:49:         if (onFinalizar) onFinalizar()
src/.../EffectRenderer.js:56:         if (onFinalizar) onFinalizar()
src/.../EffectRenderer.js:71:     const { atacanteId, alvoId, onFinalizar } = params
src/.../EffectRenderer.js:73:       if (onFinalizar) setTimeout(onFinalizar, 50)
src/.../EffectRenderer.js:79:     if (!atacante || !alvo) { if (onFinalizar) setTimeout(onFinalizar, 50); return }
src/.../EffectRenderer.js:101:         if (onFinalizar) onFinalizar()
```

---

## Correções Aplicadas

### Correção 1 — `setTimeout` raw → `setAnimTimer`

**ANTES** (useEffectMachine.js:55-57):
```js
if (definicao.tipo === 'pontual') {
  setTimeout(() => finalizarEfeito(canal), definicao.duracao)
}
```

**DEPOIS** (useEffectMachine.js:62-63):
```js
if (definicao.duracao_auto === true) {
  timerFnRef.current(() => finalizarEfeito(canal), definicao.duracao)
}
```

Adicionado timer centralizado (useEffectMachine.js:23-27):
```js
const timerFnRef = useRef((fn, delay) => setTimeout(fn, delay))

const setEffectTimer = useCallback((fn) => {
  timerFnRef.current = fn
}, [])
```

Em Phase6CombatV2.jsx, wire do timer do engine (linha 174):
```js
useEffect(() => {
  setEffectTimer(utils.setAnimTimer)
}, [])
```

**Grep confirmação:**
```
> Select-String -Pattern "setTimeout" useEffectMachine.js
src/.../useEffectMachine.js:23: const timerFnRef = useRef((fn, delay) => setTimeout(fn, delay))
```
✅ Apenas o fallback do `timerFnRef` — nenhum `setTimeout` raw para efeitos.

---

### Correção 2 — `tipo: 'pontual'/'persistente'` → `duracao_auto: true/false`

**ANTES** — 20 entradas com `tipo: 'pontual'` ou `tipo: 'persistente'` no top-level:

```
dano:           { tipo: 'pontual', duracao: 800, ... }
flash:          { tipo: 'pontual', duracao: 400, ... }
shake:          { tipo: 'pontual', duracao: 500, ... }
balao:          { tipo: 'pontual', duracao: 1300, ... }
popup:          { tipo: 'pontual', duracao: 800, ... }
banner_ia:      { tipo: 'pontual', duracao: 1500, ... }
anuncio_turno:  { tipo: 'pontual', duracao: 2000, ... }
trail:          { tipo: 'pontual', duracao: 500, ... }
melee:          { tipo: 'pontual', duracao: 500, ... }
projetil:       { tipo: 'pontual', duracao: 600, ... }
ia_thinking:    { tipo: 'persistente', duracaoPorTurno: 3000, ... }
vitoria:        { tipo: 'pontual', duracao: 3000, ... }
hp_delta:       { tipo: 'pontual', duracao: 600, ... }
bola_de_fogo:   { tipo: 'pontual', duracao: 600, ... }
bola_de_gelo:   { tipo: 'pontual', duracao: 600, ... }
veneno:         { tipo: 'persistente', duracaoPorTurno: 600, ... }
highlight_movimento: { tipo: 'persistente', ... }
highlight_ataque:    { tipo: 'persistente', ... }
highlight_range:     { tipo: 'persistente', ... }
highlight_limpar:    { tipo: 'pontual', duracao: 1, ... }
```

**DEPOIS** — `tipo:` removido do top-level, substituído por `duracao_auto:`:
```
dano:           { duracao_auto: true, duracao: 800, ... }
flash:          { duracao_auto: true, duracao: 400, ... }
...
highlight_movimento: { duracao_auto: false, ... }
highlight_ataque:    { duracao_auto: false, ... }
highlight_range:     { duracao_auto: false, ... }
highlight_limpar:    { duracao_auto: true, duracao: 1, ... }
```

Params-level `tipo:` (`tipo: 'movimento'`, `'ataque'`, `'alcance'`, `'limpar'`) preservados — são parâmetros do HighlightEffect.

**Grep confirmação:**
```
> Select-String -Pattern "tipo:" effectsMap.js
src/.../effectsMap.js:264:      tipo: 'movimento',
src/.../effectsMap.js:278:      tipo: 'ataque',
src/.../effectsMap.js:292:      tipo: 'alcance',
src/.../effectsMap.js:307:      tipo: 'limpar',
```
✅ Apenas params-level `tipo:` (HighlightEffect) — top-level removido.

```
> Select-String -Pattern "duracao_auto" effectsMap.js | Measure-Object -Line
Lines: 20
```
✅ Uma entrada `duracao_auto:` para cada efeito.

---

### Correção 3 — HUD com fila (sem tratamento especial)

**ANTES** (useEffectMachine.js:71-74):
```js
if (canal === 'hud') {
  executarEfeitoInterno(canal, definicao, tipo, alvo, dados)
  return
}
```
E em `executarEfeitoInterno` (linha 42):
```js
c.estado = tipo === 'vitoria' ? ESTADO_BLOQUEADO : ESTADO_EXECUTANDO
```

**DEPOIS** — bloco especial removido, HUD passa pelo mesmo fluxo:
```js
// (bloco removido — HUD vai direto para as verificações de estado)
```
E em `executarEfeitoInterno` (useEffectMachine.js:47-49):
```js
c.estado = (tipo === 'vitoria' && canal !== 'hud')
  ? ESTADO_BLOQUEADO
  : ESTADO_EXECUTANDO
```

**Grep confirmação:**
```
> Select-String -Pattern "canal === 'hud'" useEffectMachine.js
(no output)
```
✅ Bloco removido.

```
> Select-String -Pattern "hud" useEffectMachine.js
src/.../useEffectMachine.js:13:  hud: { estado: ESTADO_IDLE, fila: [], ativo: null },
src/.../useEffectMachine.js:20:    hud: { ...canaisPadrao.hud },
src/.../useEffectMachine.js:47:    c.estado = (tipo === 'vitoria' && canal !== 'hud')
```
✅ Apenas inicialização + guard de bloqueio — HUD nunca bloqueia.

---

### Correção 4 — Separar `params` de `dados` no `executarRenderer`

**ANTES** (useEffectMachine.js:53):
```js
executarRenderer(definicao.primitivo, { ...definicao.params, ...dados, alvo })
```

**DEPOIS** (useEffectMachine.js:60):
```js
executarRenderer(definicao.primitivo, { params: definicao.params, dados, alvo })
```

**Primitivos atualizados em EffectRenderer.js:**

| Primitivo | ANTES | DEPOIS |
|---|---|---|
| `ProjetilEffect` | `(params)` → `params.atacanteId` | `({ params, dados, alvo })` → `dados.atacanteId` |
| `AuraEffect` | `(params)` → `params.atacanteId` | `({ params, dados, alvo })` → `dados.atacanteId` |
| `TrailEffect` | `(params)` → `params.row, params.col` | `({ params, dados, alvo })` → `dados.row, dados.col` |
| `HighlightEffect` | `(params)` → `params.tipo, params.cells` | `({ params, dados, alvo })` → `params.tipo, dados.cells` |
| `ImpactoEffect` | `(params)` | `({ params, dados, alvo })` |
| `TextoEffect` | `(params)` | `({ params, dados, alvo })` |
| `FlashEffect` | `(params)` | `({ params, dados, alvo })` |
| `ShakeEffect` | `(params)` | `({ params, dados, alvo })` |
| `StatusEffect` | `(params)` | `({ params, dados, alvo })` |

**executar()** (EffectRenderer.js:138-144):
```js
// ANTES:
export function executar(primitivo, params) { ... fn(params) }
// DEPOIS:
export function executar(primitivo, { params, dados, alvo }) { ... fn({ params, dados, alvo }) }
```

**Grep confirmação:**
```
> Select-String -Pattern "\.\.\.definicao\.params" useEffectMachine.js
(no output)
```
✅ Spread operator removido.

---

### Correção 5 — Guard de `onFinalizar` obrigatório

**DEPOIS** (useEffectMachine.js:66-75):
```js
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
```

**Grep confirmação:**
```
> Select-String -Pattern "onFinalizar" useEffectMachine.js
src/.../useEffectMachine.js:67:      if (!dados?.onFinalizar) {
src/.../useEffectMachine.js:69:          '[EFFECT] ERRO: efeito com duracao_auto:false sem onFinalizar.',
```
✅ Guard presente + fallback 5s.

---

## Teste Lógico Global (5 Cenários)

| # | Cenário | Comportamento Esperado | Resultado |
|---|---------|----------------------|-----------|
| C1 | `dispatchEffect({ tipo: 'dano', dados: { valor } })` — `duracao_auto: true` | Timer via `timerFnRef`(setAnimTimer) → `finalizarEfeito` após 800ms | ✅ |
| C2 | `dispatchEffect({ tipo: 'melee', dados: { atacanteId, alvoId, onFinalizar } })` — `duracao_auto: true` | Auto-timer 500ms (libera canal) + primitive chama `dados.onFinalizar` (continua engine) — independentes | ✅ |
| C3 | `dispatchEffect({ tipo: 'highlight_movimento', dados: { cells } })` — `duracao_auto: false`, sem `onFinalizar` | `console.error` → fallback 5s libera canal. Highlight visual permanece via `highlightRef` | ✅ |
| C4 | `dispatchEffect({ tipo: 'hp_delta', ... })` + `dispatchEffect({ tipo: 'ia_thinking', ... })` — ambos HUD | `hp_delta` executa → `ia_thinking` enfileirado (`[EFFECT][hud] enfileirado`) → após 600ms, processa fila | ✅ |
| C5 | `dispatchEffect({ tipo: 'projetil', dados: { cor: '#ff0000', ... } })` | `params.cor` (#ffaa00) e `dados.cor` (#ff0000) são objetos separados — sem shadowing | ✅ |

---

## Build Output

```
✓ built in 4.39s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

✅ Build bem-sucedido sem erros.

---

## Relatório Final

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION bump | 10.160.16 → **10.160.17** |
| `src/config/version.js` | ARENATESTBED_VERSION bump (minor) | 6.9.13 → **6.10.0** |
| `src/.../useEffectMachine.js` | C1: timerFnRef + setEffectTimer; C2: duracao_auto; C3: hud queue (block removido); C4: params/dados separados; C5: guard onFinalizar | ✅ |
| `src/.../effectsMap.js` | C2: 20x `tipo:` → `duracao_auto:` | ✅ |
| `src/.../EffectRenderer.js` | C4: primitivos recebem `{ params, dados, alvo }` | ✅ |
| `src/.../Phase6CombatV2.jsx` | C1: `setEffectTimer(utils.setAnimTimer)` via useEffect | ✅ |
| `SITE_MAP.md` | Versão atualizada na tabela | ✅ |
| `docs/ReportAI/..._REFACTOR_EFFECT-MACHINE-5-CORRECOES_v6.10.0.md` | Este relatório | ✅ |
| **Commit** | `d0182641` — `refactor: useEffectMachine 5 correções arquiteturais + v6.10.0` | ✅ |
| **Deploy** | **Published** | ✅ |

### Correções por status

| # | Correção | Status |
|---|---|---|
| 1 | `setTimeout` raw → `setAnimTimer` | ✅ aplicada |
| 2 | `tipo:` → `duracao_auto:` | ✅ aplicada |
| 3 | HUD com fila (sem bypass) | ✅ aplicada |
| 4 | `params`/`dados` separados | ✅ aplicada |
| 5 | Guard `onFinalizar` obrigatório | ✅ aplicada |
