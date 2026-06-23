# FIX: IA trava no projetil — remover dispatchEffect highlight do useEffect

**Versão:** ARENATESTBED v6.9.9 · SITE v10.160.12
**Data:** 2026-06-23
**Baseado em:** docs/ReportAI/2026-06-23_INV_IA-TRAVA-PROJETIL-EFFECTMACHINE_v6.9.8.md

---

## 1. Causa raiz

Os `dispatchEffect({ tipo: 'highlight_movimento' })` em `Phase6CombatV2.jsx:198-204` bloqueavam o canal `canvas` da state machine (`useEffectMachine`) com efeitos `tipo: 'persistente'`. Esses efeitos nunca são finalizados (só `pontual` auto-finaliza via `setTimeout`), deixando o canal em `ESTADO_EXECUTANDO` para sempre.

Todos os efeitos canvas subsequentes (`trail`, `highlight_range`, `projetil`) eram enfileirados mas nunca executados. O `projetil` não rodava → `onFinalizar` nunca chamado → IA travava.

Os highlights visuais não dependem da state machine — são sincronizados diretamente via `highlightRef.current = { move: highlightedCells, ... }` na linha 163.

## 2. O que mudou

**Arquivo:** `src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx`
**Linhas:** 194-207 (antes) → 194-196 (depois)

### ANTES
```js
const prevCellsRef = useRef({ move: [], attack: [], range: [] })
useEffect(() => {
    const prev = prevCellsRef.current
    if (highlightedCells.length > 0 && prev.move.length === 0) {
      dispatchEffect({ tipo: 'highlight_movimento', canal: 'canvas', dados: { cells: highlightedCells } })
    }
    if (attackCells.length > 0 && prev.attack.length === 0) {
      dispatchEffect({ tipo: 'highlight_ataque', canal: 'canvas', dados: { cells: attackCells } })
    }
    if (rangeCells.length > 0 && prev.range.length === 0) {
      dispatchEffect({ tipo: 'highlight_range', canal: 'canvas', dados: { cells: rangeCells } })
    }
    prevCellsRef.current = { move: highlightedCells, attack: attackCells, range: rangeCells }
}, [highlightedCells, attackCells, rangeCells, dispatchEffect])
```

### DEPOIS
```js
// NOTA: highlights visuais são sincronizados via highlightRef.current no useEffect acima.
//       Não usar dispatchEffect para highlights — eles bloqueariam o canal canvas
//       e impediriam trail, projetil e outros efeitos de executarem.
```

## 3. Verificação — dispatchEffect highlight removidos

```bash
Select-String -Path "Phase6CombatV2.jsx" -Pattern "highlight_movimento|highlight_ataque|highlight_range|prevCellsRef"
# (sem output — todos removidos)
```

## 4. Teste lógico

**Fluxo — IA ataca com projetil:**
1. Jogador move → `highlightRef.current` sync direto (linha 163) ✅
2. Canal canvas permanece `IDLE` (nunca foi ocupado) ✅
3. IA turno → `dispatchEffect({ tipo: 'trail' })` → canal `IDLE` → **executa imediatamente** ✅
4. IA ataca → `dispatchEffect({ tipo: 'projetil' })` → canal `IDLE` → **executa imediatamente** ✅
5. `ProjetilEffect` anima → chama `onFinalizar()` → IA avança ✅

**Resultado: ✅ funciona**

**Fluxo — Highlights visuais continuam funcionando:**
- `highlightRef.current = { move: highlightedCells, ... }` (linha 163) continua sincronizando ✅
- `drawCombatBoard` lê de `highlightRef.current` (linha 219) ✅
- `clearHighlight()` zera o ref diretamente ✅

**Resultado: ✅ funciona**

## 5. Build

```
✓ built in 1.93s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
> gh-pages -d dist
Published
```

## 6. Versões

| Constante | Antes | Depois |
|-----------|-------|--------|
| SITE_VERSION | 10.160.11 | **10.160.12** |
| ARENATESTBED_VERSION | 6.9.8 | **6.9.9** |

## 7. Commit

**Hash:** `30ab9e80`  
**Mensagem:** `fix: remover dispatchEffect highlight do useEffect — canal canvas livre para projetil da IA + v10.160.12`  
**Deploy:** Published ✅

## 8. Teste manual

Abrir Arena Testbed, colocar um personagem IA com `tipoAtaque: 'distancia'` (projetil), avançar turnos. Verificar:
- IA move (trail aparece) ✅
- IA dispara projetil (projétil anima da origem ao alvo) ✅
- Dano aparece no alvo ✅
- IA finaliza turno normalmente ✅
