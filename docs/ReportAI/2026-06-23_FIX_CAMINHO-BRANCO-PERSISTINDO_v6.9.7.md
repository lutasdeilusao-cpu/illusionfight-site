# FIX: Células brancas persistindo após movimento

**Versão:** ARENATESTBED v6.9.7 · SITE v10.160.10
**Data:** 2026-06-23
**Baseado em:** docs/ReportAI/2026-06-23_INV_HIGHLIGHT-CELULAS-PERSISTINDO_v6.9.6.md

---

## 1. Output bruto dos 3 greps da Etapa 1

### 1.1 — aposMovimento

```
function aposMovimento(row, col) {
    if (onClearHighlight) onClearHighlight()
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Moveu para (${row}, ${col})`)
    const key = `${row}_${col}`
    if (itensChaoAtual[key]) {
      const item = itensChaoAtual[key]
      const potKey = item.tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'
      charsRef.current = charsRef.current.map(c =>
        c.id === currentChar.id
          ? { ...c, inventario: { ...c.inventario, [potKey]: (c.inventario?.[potKey] || 0) + 1 } }
          : c
      )
      setCharacters(charsRef.current)
      setItensChaoAtual(prev => { const n = { ...prev }; delete n[key]; return n })
      addLog(`[${currentChar.nome}] Coletou Poção ${item.tipo === 'hp' ? 'HP' : 'MP'} do chão!`)
    }
    if (onClearTrail) onClearTrail()
    setTurnoAcoes(prev => ({ ...prev, moveu: true }))
    tc.registrarAcao(currentCharIdRef.current, TipoAcao.MOVER)
    setSubPhase('free')
    setHighlightedCells([])
    setActionPanel(false)
    if (onUnlockInput) onUnlockInput(0)
  }
```

### 1.2 — confirmarMovimento

```
  function confirmarMovimento() {
    if (!pendingMove) return
    if (onClearHighlight) onClearHighlight()
    moverPersonagem(pendingMove.row, pendingMove.col)
    setPendingMove(null)
  }
```

### 1.3 — Grep de setCaminhoEscolhido / setDestinoEscolhido

```
LineNumber Line
---------- ----
       45   const [caminhoEscolhido, setCaminhoEscolhido] = useState([])
       46   const [destinoEscolhido, setDestinoEscolhido] = useState(null)
      329     setSubPhaseStep(null); setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([])
      412     setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([]); setActionPanel(false)
      669       setPendingMove, setDestinoEscolhido, setCaminhoEscolhido,
```

---

## 2. Trechos ANTES e DEPOIS

### aposMovimento — ANTES

```js
    // linha 313-316
    setSubPhase('free')
    setHighlightedCells([])
    setActionPanel(false)
    if (onUnlockInput) onUnlockInput(0)
```

### aposMovimento — DEPOIS

```js
    // linha 313-318
    setSubPhase('free')
    setHighlightedCells([])
    setCaminhoEscolhido([])       // linha 315 — NOVO
    setDestinoEscolhido(null)      // linha 316 — NOVO
    setActionPanel(false)
    if (onUnlockInput) onUnlockInput(0)
```

### confirmarMovimento — ANTES

```js
    // linha 321-324
    function confirmarMovimento() {
      if (!pendingMove) return
      if (onClearHighlight) onClearHighlight()
      moverPersonagem(pendingMove.row, pendingMove.col)
      setPendingMove(null)
    }
```

### confirmarMovimento — DEPOIS

```js
    // linha 321-328
    function confirmarMovimento() {
      if (!pendingMove) return
      if (onClearHighlight) onClearHighlight()
      moverPersonagem(pendingMove.row, pendingMove.col)
      setPendingMove(null)
      setCaminhoEscolhido([])     // linha 326 — NOVO
      setDestinoEscolhido(null)    // linha 327 — NOVO
    }
```

---

## 3. Grep de confirmação pós-edição

```
LineNumber Line
---------- ----
       45   const [caminhoEscolhido, setCaminhoEscolhido] = useState([])
       46   const [destinoEscolhido, setDestinoEscolhido] = useState(null)
      315     setCaminhoEscolhido([])         // ← dentro de aposMovimento
      316     setDestinoEscolhido(null)        // ← dentro de aposMovimento
      326     setCaminhoEscolhido([])         // ← dentro de confirmarMovimento
      327     setDestinoEscolhido(null)        // ← dentro de confirmarMovimento
      333     setSubPhaseStep(null); setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([])  // cancelarAcao
      416     setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([]); setActionPanel(false)  // finalizarTurno
      673       setPendingMove, setDestinoEscolhido, setCaminhoEscolhido,
```

---

## 4. Teste lógico fluxo por fluxo

### Fluxo 1 — Jogador move e confirma

1. Clica mover → caminho escolhido aparece em branco ✅
2. Confirma → `confirmarMovimento` → `setCaminhoEscolhido([])` + `setDestinoEscolhido(null)` → caminho some ✅
3. `aposMovimento` executa → `setCaminhoEscolhido([])` + `setDestinoEscolhido(null)` novamente (idempotente) ✅
4. Canvas redesenha: zero células brancas ✅

**Resultado: ✅ funciona**

### Fluxo 2 — Jogador cancela movimento

- `cancelarAcao` (linha 330-334) já zera ambos ✅ — não precisa mexer

**Resultado: ✅ funciona**

### Fluxo 3 — Fim de turno

- `finalizarTurno` (linha 410-417) já zera ambos ✅ — não precisa mexer

**Resultado: ✅ funciona**

---

## 5. Output completo do npm run build

```
✓ built in 1.92s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
> gh-pages -d dist
Published
```

(sem erros, sourcemaps intactos)

---

## 6. Versões antes e depois

| Constante | Antes | Depois |
|-----------|-------|--------|
| SITE_VERSION | 10.160.9 | **10.160.10** |
| ARENATESTBED_VERSION | 6.9.6 | **6.9.7** |

---

## 7. Hash do commit + deploy

- **Commit:** `87729252` — `fix: zerar caminhoEscolhido e destinoEscolhido em aposMovimento e confirmarMovimento + v10.160.10`
- **Deploy:** Published ✅

---

## 8. Teste manual

Após mover personagem no Arena Testbed, verificar que zero células brancas persistem no canvas. O caminho branco do movimento some imediatamente após confirmar a ação.
