# INV: Células brancas persistindo após movimento

**Versão:** ARENATESTBED v6.9.6 · SITE v10.160.9
**Data:** 2026-06-23
**Investigador:** opencode-agent

---

## 1. Output bruto dos 5 greps

### 1.1 — drawCombatBoard: highlightedCells, caminhoEscolhido, destinoEscolhido, cores

```
drawCombatBoard.js:
  Line 4:     highlightedCells, attackCells, rangeCells, currentChar,
  Line 5:     damageFlash, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido,
  Line 12:   const hlSet = new Set(highlightedCells.map(c => `${c.row}_${c.col}`))
  Line 16:   const destSet = new Set(caminhoEscolhido.map(c => `${c.row}_${c.col}`))
  Line 17:   const destKey = destinoEscolhido ? `${destinoEscolhido.row}_${destinoEscolhido.col}` : null
  Line 45:         fill = 'rgba(255,255,255,0.06)'         // highlight (hlSet)
  Line 46:         stroke = '#ffffff'
  Line 50:         fill = 'rgba(255,255,255,0.12)'         // caminhoEscolhido (destSet, exceto destino)
  Line 51:         stroke = 'rgba(255,255,255,0.6)'
  Line 55:         fill = 'rgba(255,255,255,0.2)'          // destinoEscolhido (destKey)
  Line 56:         stroke = '#ffffff'
```

### 1.2 — Phase6CombatV2: drawCombatBoard() call

```
Phase6CombatV2.jsx:
  Line 220:     drawCombatBoard(ctx, {
  (context around 220-224 mostra que caminhoEscolhido e destinoEscolhido vêm do estado React)
```

### 1.3 — EffectRenderer: clearHighlight e highlightRef

```
EffectRenderer.js:
  Line 4: export function clearHighlight() {
  Line 5:   if (_refs.highlightRef) {
  Line 6:     _refs.highlightRef.current = { move: [], attack: [], range: [] }
  Line 118:     if (!_refs.highlightRef) return
  Line 121:       _refs.highlightRef.current = { move: [], attack: [], range: [] }
  Line 124:     const key = tipo === 'movimento' ? 'move' : tipo === 'ataque' ? 'attack' : 'range'
  Line 125:     _refs.highlightRef.current = {
  Line 126:       ..._refs.highlightRef.current,
```

### 1.4 — Phase6CombatV2: highlightRef referências

```
Phase6CombatV2.jsx:
  Line 31:   const highlightRef = useRef({ move: [], attack: [], range: [] })
  Line 163:   highlightRef.current = { move: highlightedCells, attack: attackCells, range: rangeCells }
  Line 190:       highlightRef,
  Line 219:     const hl = highlightRef.current
  Line 263:       const hl = highlightRef.current
  Line 278:       const hl2 = highlightRef.current
```

### 1.5 — useCombatEngine: setCaminhoEscolhido / setDestinoEscolhido

```
useCombatEngine.js:
  Line 45:   const [caminhoEscolhido, setCaminhoEscolhido] = useState([])
  Line 46:   const [destinoEscolhido, setDestinoEscolhido] = useState(null)
  Line 329:     setSubPhaseStep(null); setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([])
  Line 412:     setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([]); setActionPanel(false)
  Line 669:       setPendingMove, setDestinoEscolhido, setCaminhoEscolhido,
```

---

## 2. Respostas Q1–Q4

### Q1 — drawCombatBoard desenha caminhoEscolhido/destinoEscolhido com branco?

**SIM.** Em `drawCombatBoard.js`:

- Linha 50: `fill = 'rgba(255,255,255,0.12)'` — células do caminho escolhido (exceto destino final)
- Linha 51: `stroke = 'rgba(255,255,255,0.6)'`
- Linha 55: `fill = 'rgba(255,255,255,0.2)'` — célula do destino final
- Linha 56: `stroke = '#ffffff'`

Essas cores são iguais (mesmo branco, mesmo alpha baixo) à cor de highlight do movimento (`rgba(255,255,255,0.06)` / `#ffffff`), apenas com alpha mais forte. Ou seja, **as células brancas que persistem são do caminho escolhido, não do highlightRef**, porque a lógica de desenho do destSet e destKey é independente (não é `else if` do hlSet) e executa depois, sobrescrevendo cores.

### Q2 — Quando caminhoEscolhido e destinoEscolhido são zerados?

**DEPOIS** do redesenho, ou nunca até o fim do turno.

- `useCombatEngine.js:329` — `cancelarAcao()` → zera ambos
- `useCombatEngine.js:412` — `finalizarTurno()` → zera ambos

**NÃO são zerados em:**
- `aposMovimento` (linha 292) — só chama `setHighlightedCells([])`, não toca em `caminhoEscolhido`/`destinoEscolhido`
- `confirmarMovimento` (linha 319) — só `setPendingMove(null)`, não zera caminho/destino

### Q3 — draw() recebe caminhoEscolhido e destinoEscolhido de estado React ou ref?

**DO ESTADO REACT.** Em `Phase6CombatV2.jsx`, as variáveis `caminhoEscolhido` e `destinoEscolhido` são obtidas do engine via:

```
const { pendingMove, destinoEscolhido, caminhoEscolhido } = move
```

O `draw()` é chamado a cada `requestAnimationFrame` (linha 197+). Como `caminhoEscolhido` e `destinoEscolhido` são estado React que NÃO foram zerados após o movimento, **há 0 frames com valores limpos** — eles persistem até `cancelarAcao` ou `finalizarTurno`.

### Q4 — clearHighlight zera caminhoEscolhido/destinoEscolhido?

**NÃO.** `EffectRenderer.js:4-6`:

```js
export function clearHighlight() {
  if (_refs.highlightRef) {
    _refs.highlightRef.current = { move: [], attack: [], range: [] }
  }
}
```

Zera apenas `highlightRef`. Não toca em `caminhoEscolhido` nem `destinoEscolhido`.

---

## 3. Hipótese Final

**Causa raiz:** Após `aposMovimento` (linha 292) e `confirmarMovimento` (linha 319), os estados `caminhoEscolhido` (react state) e `destinoEscolhido` (react state) nunca são zerados. O canvas continua desenhando o caminho branco a cada frame porque `drawCombatBoard` recebe esses valores diretamente do estado React (não de um ref). As células brancas visíveis são o *caminho que o personagem percorreu*, pintado com `rgba(255,255,255,0.12)` (linha 50) e o destino com `rgba(255,255,255,0.2)` (linha 55) — mesma cor das células de highlight.

**Evidência principal:**
- `useCombatEngine.js:292-317` — `aposMovimento()` não contém `setCaminhoEscolhido([])` nem `setDestinoEscolhido(null)`
- `drawCombatBoard.js:16-17, 49-57` — `caminhoEscolhido` e `destinoEscolhido` são desenhados com branco

**Correção necessária:** Adicionar `setCaminhoEscolhido([])` e `setDestinoEscolhido(null)` dentro de `aposMovimento` (após linha 314) e/ou em `confirmarMovimento` (após linha 323), **antes** ou junto com `setHighlightedCells([])`.
