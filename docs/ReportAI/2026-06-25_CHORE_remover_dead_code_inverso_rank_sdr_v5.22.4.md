# CHORE — Remover Dead Code `inverso` rank_sdr no Top Trumps

**Data:** 2026-06-25
**Versão:** 5.22.4 (TS) / 10.162.43 (SITE)

---

## ETAPA 1 — PROVA DE LEITURA (outputs brutos)

### `grep -n "inverso" src/pages/TopTrumps.jsx`
```
106     descricao, inverso: id === 'rank_sdr'
388     if (attr.inverso) res = vJ < vI ? 'ganhou' : vJ > vI ? 'perdeu' : 'empate'
1107         const diff = attr?.inverso ? h.valorIA - h.valorJogador : h.valorJogador - h.valorIA
```

### `grep -n "inverso" src/pages/TopTrumpsMP.jsx`
```
41     descricao, inverso: id === 'rank_sdr'
345         if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
421         if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
```

### `grep -n "inverso" src/pages/TopTrumps/components/CardViewerModal.jsx`
```
174                     const inverso = k === 'rank_sdr'
178                         <span className="tt-viewer-stat-val">{inverso ? `#${val}` : val}</span>
182                             ref={el => { if (el) el.style.width = `${inverso ? Math.max(5, 100 - pct) : pct}%` }}
```

### `grep -n "inverso" src/pages/TopTrumps/components/DeckBuilder.jsx`
```
286                       const inverso = k === 'rank_sdr'
301                           <span className="tt-deckbuilder-viewer-stat-val">{inverso ? `#${v}` : v}</span>
```

### `grep -rn "inverso" src/components/TopTrumpsCard/`
```
(Sem resultados)
```

### `grep -n "rank_sdr" src/pages/TopTrumps.jsx`
```
77     rank_sdr: 'games.toptrumps.atributo_rank_sdr',
106     descricao, inverso: id === 'rank_sdr'
372       // rank_sdr não é um atributo jogável (é apenas informativo na carta)
373       const attrsDisponiveis = atributos.filter(attr => cartaIA.atributos[attr.id] !== undefined && attr.id !== 'rank_sdr')
```

### `grep -n "rank_sdr" src/pages/TopTrumpsMP.jsx`
```
18     rank_sdr: 'games.toptrumps.atributo_rank_sdr',
41     descricao, inverso: id === 'rank_sdr'
229           // rank_sdr não é atributo jogável (apenas informativo na carta)
230           const attrs = atributos.filter(a => a.id !== 'rank_sdr').map(a => a.id)
```

---

## ETAPA 2 — Remoção do dead code (6 pontos)

### A. Campo inverso na construção do array `atributos` (TopTrumps.jsx:104–107)

**ANTES (linhas 104–107):**
```js
const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({
    id, nomeKey: attrNomeKey(id),
    descricao, inverso: id === 'rank_sdr'
}))
```

**DEPOIS (linhas 104–107):**
```js
const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({
    id, nomeKey: attrNomeKey(id),
    descricao
}))
```

**Grep confirmação pós:** sem resultados.

---

### B. Branch `if (attr.inverso)` na resolução (TopTrumps.jsx:387–389)

**ANTES (linhas 387–389):**
```js
let res
if (attr.inverso) res = vJ < vI ? 'ganhou' : vJ > vI ? 'perdeu' : 'empate'
else res = vJ > vI ? 'ganhou' : vJ < vI ? 'perdeu' : 'empate'
```

**DEPOIS (linhas 387–388):**
```js
let res
res = vJ > vI ? 'ganhou' : vJ < vI ? 'perdeu' : 'empate'
```

**Grep confirmação pós:** sem resultados.

---

### C. Branch `attr?.inverso` no diff do histórico (TopTrumps.jsx:1106–1107)

**ANTES (linhas 1106–1107):**
```js
const attr = atributos.find(a => a.nome === h.atributo)
const diff = attr?.inverso ? h.valorIA - h.valorJogador : h.valorJogador - h.valorIA
```

**DEPOIS (linhas 1105–1106):**
```js
const attr = atributos.find(a => a.nome === h.atributo)
const diff = h.valorJogador - h.valorIA
```

**Grep confirmação pós:** sem resultados.

---

### D. Branches `if (attr.inverso)` na resolução do MP (TopTrumpsMP.jsx:344–346 e 419–422)

**ANTES (linhas 344–346 — 2-move resolution):**
```js
let res
if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
else res = v1 > v2 ? 'j1_venceu' : v1 < v2 ? 'j2_venceu' : 'empate'
```

**DEPOIS (linhas 344–345):**
```js
let res
res = v1 > v2 ? 'j1_venceu' : v1 < v2 ? 'j2_venceu' : 'empate'
```

**ANTES (linhas 419–422 — 1-move resolution):**
```js
let res
if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
else res = v1 > v2 ? 'j1_venceu' : v1 < v2 ? 'j2_venceu' : 'empate'
```

**DEPOIS (linhas 419–420):**
```js
let res
res = v1 > v2 ? 'j1_venceu' : v1 < v2 ? 'j2_venceu' : 'empate'
```

**Grep confirmação pós:** sem resultados.

---

### E. Variável `inverso` no CardViewerModal.jsx (linha 174)

**ANTES (linhas 174–182):**
```js
const inverso = k === 'rank_sdr'
return (
  <div key={k} className="tt-viewer-stat">
    <span className="tt-viewer-stat-label">{attrNome(k)}</span>
    <span className="tt-viewer-stat-val">{inverso ? `#${val}` : val}</span>
    <div className="tt-viewer-stat-bar">
      <div className="tt-viewer-stat-bar-fill"
        ref={el => { if (el) el.style.width = `${inverso ? Math.max(5, 100 - pct) : pct}%` }}
      />
    </div>
  </div>
)
```

**DEPOIS (linhas 174–182):**
```js
const isRankSdr = k === 'rank_sdr'
return (
  <div key={k} className="tt-viewer-stat">
    <span className="tt-viewer-stat-label">{attrNome(k)}</span>
    <span className="tt-viewer-stat-val">{isRankSdr ? `#${val}` : val}</span>
    <div className="tt-viewer-stat-bar">
      <div className="tt-viewer-stat-bar-fill"
        ref={el => { if (el) el.style.width = `${isRankSdr ? Math.max(5, 100 - pct) : pct}%` }}
      />
    </div>
  </div>
)
```

**Grep confirmação pós:** `inverso` → 0 resultados. `isRankSdr` presente nas 3 linhas.

---

### F. Variável `inverso` no DeckBuilder.jsx (linha 286)

**ANTES (linhas 286–303):**
```js
const inverso = k === 'rank_sdr'
return (
  <div key={k} className="tt-deckbuilder-viewer-stat">
    <span className="tt-deckbuilder-viewer-stat-label">
      {{ rank_sdr: t('games.toptrumps.atributo_rank_sdr'), ... }[k] || k}
    </span>
    <span className="tt-deckbuilder-viewer-stat-val">{inverso ? `#${v}` : v}</span>
  </div>
)
```

**DEPOIS (linhas 286–303):**
```js
const isRankSdr = k === 'rank_sdr'
return (
  <div key={k} className="tt-deckbuilder-viewer-stat">
    <span className="tt-deckbuilder-viewer-stat-label">
      {{ rank_sdr: t('games.toptrumps.atributo_rank_sdr'), ... }[k] || k}
    </span>
    <span className="tt-deckbuilder-viewer-stat-val">{isRankSdr ? `#${v}` : v}</span>
  </div>
)
```

**Grep confirmação pós:** `inverso` → 0 resultados. `isRankSdr` presente na linha 286 e 301.

---

## ETAPA 4 — TESTE LÓGICO

| Fluxo | Passos | Resultado |
|---|---|---|
| 1 — SP jogador escolhe poder_mental | `atributos.find(a => a.id === 'poder_mental')` → attr sem `inverso` → `res = vJ > vI ? 'ganhou' : ...` → maior vence | ✅ |
| 2 — SP IA escolhe velocidade | `atributos.filter(attr => ... attr.id !== 'rank_sdr')` → rank_sdr continua excluído | ✅ |
| 3 — Histórico diff | `h.valorJogador - h.valorIA` direto, positivo = jogador tinha valor maior = vitória | ✅ |
| 4 — MP resolução (ambas rotas) | `v1 > v2 ? 'j1_venceu' : ...` direto, sem condicional | ✅ |
| 5 — CardViewerModal rank_sdr | `isRankSdr ? `#${val}` : val` → `#999999` exibe corretamente | ✅ |

---

## Build output

```
npm run build → OK (1273 modules, 6.72s)
npm run deploy → Published (gh-pages)
```

Apenas warnings pré-existentes (chunk size > 500kB, dynamic imports ineficazes).

---

## Versões

| Constante | Antes | Depois |
|---|---|---|
| `TS_VERSION` | **5.22.3** | → **5.22.4** |
| `SITE_VERSION` | **10.162.42** | → **10.162.43** |
| `SITE_MAP.md` | ✅ atualizado | ✅ |

## Commit

```
Hash: a3533cc9
Mensagem: chore: remover dead code inverso rank_sdr Top Trumps + v5.22.4
Arquivos: 8 changed (740 insertions, 18 deletions)
```

## Deploy

Status: ✅ **Published** sem erros.
