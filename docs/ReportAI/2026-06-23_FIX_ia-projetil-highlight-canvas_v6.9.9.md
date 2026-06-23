# FIX: IA e jogador travam no projétil/melee — highlight_range bloqueia canal canvas

**Data:** 2026-06-23
**Versão:** ARENATESTBED 6.9.10 / SITE 10.160.13
**Tipo:** FIX
**Status:** CORRIGIDO

---

## Problema

IA e jogador travam ao atacar porque `highlight_movimento`/`highlight_ataque`/`highlight_range` eram classificados como `tipo: 'persistente'` no `effectsMap.js`. Effects `persistente` nunca auto-finalizam (`useEffectMachine.js:55-56` só finaliza `pontual` via `setTimeout`), ocupando o canal `canvas` para sempre. Effects subsequentes (`trail`, `projetil`, `melee`) enfileiram mas nunca executam.

### Problema 1 (v6.9.9): Caminhos que limpavam highlight sem liberar canal

| Caminho | `highlightRef` | Canal canvas |
|---------|---------------|--------------|
| `onClearHighlight` (jogador: confirmar/cancelar movimento) | ✅ `clearHighlight()` | ❌ jamais finalizado |
| `setHighlightedCells([])` via estado React (fluxo IA) | ✅ (indireto via draw loop) | ❌ jamais finalizado |
| `cancelarAcao` / `finalizarTurno` (jogador) | ✅ | ❌ jamais finalizado |

### Problema 2 (v6.9.10): `executarAtaque` não limpava `rangeCells`

Mesmo com o Problema 1 corrigido, o ataque do jogador (melee ou projétil) travava porque:

1. `confirmarEscolhaAtaque` seta `rangeCells` e `attackCells` (ambos com células)
2. `executarAtaque` chama `setAttackCells([])` mas **não** `setRangeCells([])`
3. `useEffect` detecta attackCells vazio → `finalizarEfeito('canvas')` → encerra `highlight_ataque`
4. Fila tem: `[highlight_range, melee/projetil]`
5. `highlight_range` (persistente) inicia → nunca finaliza → `melee`/`projetil` nunca executam

---

## Solução

### v6.9.9 — Liberar canal canvas nos clear paths

1. **`useEffectMachine.js`** — `finalizarEfeito` exposto no objeto retornado. Antes era função interna inacessível.
2. **`Phase6CombatV2.jsx:onClearHighlight`** — após `clearHighlight()`, chama `finalizarEfeito('canvas')`.
3. **`Phase6CombatV2.jsx:useEffect`** — quando qualquer array de highlight vai de não-vazio → vazio, chama `finalizarEfeito('canvas')`.

### v6.9.10 — `setRangeCells([])` em `executarAtaque`

4. **`useCombatEngine.js:executarAtaque`** — `setRangeCells([])` adicionado após `setAttackCells([])` para limpar o highlight de alcance antes de disparar a animação de ataque.

---

## Arquivos modificados

### `src/config/version.js` (v6.9.9)

```
- SITE_VERSION = '10.160.11'
+ SITE_VERSION = '10.160.12'
- ARENATESTBED_VERSION = '6.9.8'
+ ARENATESTBED_VERSION = '6.9.9'
```

### `src/config/version.js` (v6.9.10)

```
- SITE_VERSION = '10.160.12'
+ SITE_VERSION = '10.160.13'
- ARENATESTBED_VERSION = '6.9.9'
+ ARENATESTBED_VERSION = '6.9.10'
```

### `src/pages/Prototype/ArenaTestbed/engine/useEffectMachine.js`

**Linha 110-116:** `finalizarEfeito` adicionado ao return.

**Antes:**
```javascript
  return {
    dispatchEffect,
    getEstadoCanal,
    getEfeitoAtivo,
    getFilaCanal,
  }
```

**Depois:**
```javascript
  return {
    dispatchEffect,
    finalizarEfeito,
    getEstadoCanal,
    getEfeitoAtivo,
    getFilaCanal,
  }
```

### `src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx`

**Linha 47:** Destructuring inclui `finalizarEfeito`.

**Antes:** `const { dispatchEffect } = useEffectMachine()`
**Depois:** `const { dispatchEffect, finalizarEfeito } = useEffectMachine()`

**Linha 121-124:** `onClearHighlight` chama `finalizarEfeito('canvas')`.

**Antes:**
```javascript
    onClearHighlight: () => {
      clearHighlight()
    },
```

**Depois:**
```javascript
    onClearHighlight: () => {
      clearHighlight()
      finalizarEfeito('canvas')
    },
```

**Linha 207-215:** Cleanup no useEffect para quando células vão de não-vazio → vazio (caminho IA).

```javascript
    if (highlightedCells.length === 0 && prev.move.length > 0) {
      finalizarEfeito('canvas')
    }
    if (attackCells.length === 0 && prev.attack.length > 0) {
      finalizarEfeito('canvas')
    }
    if (rangeCells.length === 0 && prev.range.length > 0) {
      finalizarEfeito('canvas')
    }
```

### `src/pages/Prototype/ArenaTestbed/engine/useCombatEngine.js`

**Linha 370-371:** `setRangeCells([])` adicionado em `executarAtaque`.

**Antes:**
```javascript
    setAttackCells([])

    let atacanteFinal = currentChar
```

**Depois:**
```javascript
    setAttackCells([])
    setRangeCells([])

    let atacanteFinal = currentChar
```

### `SITE_MAP.md`

Tabela de versões atualizada:
- `SITE_VERSION`: 10.160.11 → **10.160.13**
- `ARENATESTBED_VERSION`: 6.9.8 → **6.9.10**

---

## Teste lógico

### Fluxo Jogador: clicar em "Mover" → selecionar destino → confirmar

1. Jogador clica "Mover" → `iniciarMovimento()` → `setHighlightedCells(freeCells)` ✅
2. `useEffect` detecta `highlightedCells.length > 0 && prev.move.length === 0` → `dispatchEffect({ tipo: 'highlight_movimento' })` → canal canvas = EXECUTANDO ✅
3. Jogador clica destino → `confirmarMovimento()` → `onClearHighlight()`:
   - `clearHighlight()` → zera ref ✅
   - `finalizarEfeito('canvas')` → canal volta a IDLE (ou executa próximo na fila) ✅
4. `moverPersonagem()` → loop de passos → `onTrail()` → `dispatchEffect({ tipo: 'trail' })` → canal canvas estava IDLE, trail executa imediatamente ✅

### Fluxo IA: pensar → mover → atirar projétil

1. `estagioPensar`: `setHighlightedCells(getCelulasAlcance(...))` → highlight_movimento dispatchado → canal canvas = EXECUTANDO ✅
2. `estagioMover`: `setHighlightedCells([])` + `setAttackCells([destino])`:
   - `useEffect` detecta `highlightedCells.length === 0 && prev.move.length > 0` → `finalizarEfeito('canvas')` → canal liberado ✅
   - `useEffect` detecta `attackCells.length > 0 && prev.attack.length === 0` → `dispatchEffect({ tipo: 'highlight_ataque' })` → canal canvas = EXECUTANDO (novo highlight) ✅
3. Movimento IA → `onTrail()` → trail enfileirado (canal ocupado por highlight_ataque) ⚠️
4. `estagioAgir`: `setRangeCells(...)` → enfileirado atrás do trail... 

Wait — há um problema aqui. Durante o movimento da IA, o `onTrail` é chamado, mas o canal canvas está ocupado pelo `highlight_ataque`. O trail vai enfileirar. Depois, quando o movimento termina:

5. `setAttackCells([])` + `setRangeCells([])` no início da animação de ataque:
   - `useEffect` detecta `attackCells.length === 0 && prev.attack.length > 0` → `finalizarEfeito('canvas')` → libera canal, executa próximo na fila (trail!) ✅

Mas o trail foi chamado durante o movimento (várias vezes, uma por passo). Todos os trails estão enfileirados. Quando finalizamos o highlight_ataque, o primeiro trail executa. Mas o movimento já acabou — os trails são do passado.

Isso é um problema menor: os trails aparecem atrasados (durante a animação de ataque em vez de durante o movimento). Mas não causa travamento — o efeito visual é ligeiramente incorreto, mas o projétil eventualmente executa.

**Análise de risco:** O trail atrasado não quebra o jogo. O bug principal (projétil nunca executar) está corrigido.

### Fluxo Jogador: mover → atacar (melee ou projétil) — v6.9.10

1. Jogador move, trails executam ✅
2. Jogador clica "Atacar" → `escolherTipoAtaque` → `confirmarEscolhaAtaque`:
   - `setRangeCells(atkCells)` → useEffect → `dispatchEffect({ tipo: 'highlight_range' })` ✅
   - `setAttackCells(atkCells.filter(enemies))` → useEffect → `dispatchEffect({ tipo: 'highlight_ataque' })`
   - Canvas fila: `[highlight_range]` (ataque executa primeiro), **highlight_ataque** é o ativo ✅
3. Jogador clica no alvo → `executarAtaque(target)`:
   - `setAttackCells([])` + **`setRangeCells([])`** (NOVO) ✅
   - useEffect: `attackCells.length === 0 && prev.attack.length > 0` → `finalizarEfeito('canvas')` ✅
   - useEffect: `rangeCells.length === 0 && prev.range.length > 0` → `finalizarEfeito('canvas')` (já IDLE, no-op) ✅
   - highlight_ataque encerrado, fila `[highlight_range]` → highlight_range inicia
   - **Mas rangeCells está vazio!** → outro useEffect detecta imediatamente → `finalizarEfeito('canvas')` → highlight_range encerrado ✅
   - Fila `[melee/projetil]` → executa ✅
4. Animação de ataque (melee/projetil) executa sem travamento ✅
5. Callback `cbFinalizar` → `aposAnimacaoAtaque` → dano aplicado ✅

### Fluxo Cancelar ação

1. Jogador em subPhase='movimento' → clica "Cancelar" → `cancelarAcao()`:
   - `onClearHighlight()` → `clearHighlight()` + `finalizarEfeito('canvas')` ✅
   - `setHighlightedCells([])`, `setAttackCells([])`, `setRangeCells([])` → useEffect detecta todos vazios, mas `finalizarEfeito('canvas')` é chamado de novo → canal já está IDLE, no-op ✅

### Fluxo Finalizar turno

1. `finalizarTurno()`:
   - `setHighlightedCells([]); setAttackCells([]); setRangeCells([])` → useEffect cleanup libera canal ✅
   - `onClearHighlight` NÃO é chamado (não está no código de finalizarTurno) — mas o useEffect cleanup cobre este caso ✅

### Conclusão do teste lógico

| Fluxo | Highlight inicia | Canal liberado | Trail executa | Ataque executa |
|-------|-----------------|---------------|--------------|----------------|
| Jogador mover | ✅ | ✅ `onClearHighlight` | ✅ | N/A |
| Jogador atacar (melee) | ✅ | ✅ `setRangeCells([])` + useEffect cleanup | N/A | ✅ **melee** |
| Jogador atacar (projétil) | ✅ | ✅ `setRangeCells([])` + useEffect cleanup | N/A | ✅ **projetil** |
| IA mover + atirar | ✅ | ✅ useEffect cleanup | ✅ (possivelmente atrasado) | ✅ |
| Cancelar | ✅ | ✅ `onClearHighlight` | N/A | N/A |
| Finalizar turno | ✅ | ✅ useEffect cleanup | N/A | N/A |

**Veredito:** TRAVAMENTO CORRIGIDO. Efeitos visuais de trail durante movimento IA podem aparecer com atraso, mas não causam falha funcional.

---

## Build

```
> vite build && node scripts/prerender-routes.js
✓ built in 1.92s
[prerender] 26 rotas pré-renderizadas com status 200 nativo.
```

Build concluído sem erros. Sourcemap presente em todos os chunks.

---

## Versões

| Constante | v6.9.8 (antes) | v6.9.9 | v6.9.10 (depois) |
|-----------|----------------|--------|-------------------|
| SITE_VERSION | 10.160.11 | 10.160.12 | → **10.160.13** |
| ARENATESTBED_VERSION | 6.9.8 | 6.9.9 | → **6.9.10** |

---

## Commits

### v6.9.9
```
commit c260a776
FIX: IA trava no projetil — finalizarEfeito exposto e chamado nos clear highlight paths + v10.160.12 / 6.9.9
```
Deploy: ✅ Published

### v6.9.10
```
commit <pending>
FIX: Jogador trava no melee/projetil — setRangeCells([]) adicionado em executarAtaque + v10.160.13 / 6.9.10
```
Deploy: <pending>

---

## Arquivos tocados

| Arquivo | O que mudou |
|---------|-------------|
| `src/config/version.js` | SITE_VERSION 10.160.11→10.160.13, ARENATESTBED_VERSION 6.9.8→6.9.10 |
| `SITE_MAP.md` | Versões atualizadas na tabela |
| `src/pages/Prototype/ArenaTestbed/engine/useEffectMachine.js` | `finalizarEfeito` exposto no return |
| `src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx` | `finalizarEfeito('canvas')` em onClearHighlight + useEffect cleanup |
| `src/pages/Prototype/ArenaTestbed/engine/useCombatEngine.js` | `setRangeCells([])` adicionado em `executarAtaque` (linha 371) |
| `docs/ReportAI/2026-06-23_FIX_ia-projetil-highlight-canvas_v6.9.9.md` | Este relatório |

---

## Teste manual pendente

1. Entrar no Prototype → Arena Testbed
2. Iniciar partida com personagem **melee** (ex: força, alcance 1)
3. Mover o personagem, atacar um inimigo — verificar se a animação melee executa
4. Iniciar nova partida com personagem **projétil** (alcance, PDF)
5. Mover, atacar — verificar se o projétil é disparado sem travamento
6. Verificar se trails aparecem durante movimento do jogador
7. Observar se há atraso nos trails durante movimento da IA
8. Confirmar que o jogo não trava após múltiplos turnos completos (jogador e IA)
