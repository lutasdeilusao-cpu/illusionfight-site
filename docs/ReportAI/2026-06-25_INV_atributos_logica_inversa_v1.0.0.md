# INV — Auditoria de Lógica Inversa nos Atributos do Top Trumps

**Data:** 2026-06-25
**Versão do documento:** 1.0.0
**Propósito:** Investigação pura — verificar se existe lógica "menor vence" em outros atributos além de rank_sdr, e confirmar se rank_sdr é ou não selecionável em jogo.

---

## ETAPA 1 — PROVA DE LEITURA (grep bruto)

### Comando 1: `src/pages/TopTrumps.jsx` — inverso/inverse/menor/lower/reverse/inverte/invertido
```
LineNumber Line
---------- ----
       106     descricao, inverso: id === 'rank_sdr'
       388     if (attr.inverso) res = vJ < vI ? 'ganhou' : vJ > vI ? 'perdeu' : 'empate'
      1107         const diff = attr?.inverso ? h.valorIA - h.valorJogador : h.valorJogador - h.valorIA
```

### Comando 2: `src/i18n/cardLabels.js` — inverso/inverse/menor/lower/reverse/inverte/invertido
```
LineNumber Line
---------- ----
        40  * rank_sdr não tem max fixo (escala inversa - menor é melhor).
```
(Comentário apenas — sem implementação de lógica.)

### Comando 3: `src/pages/TopTrumpsMP.jsx` — inverso/inverse/menor/lower/reverse/inverte/invertido
```
LineNumber Line
---------- ----
        41     descricao, inverso: id === 'rank_sdr'
       345         if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
       421         if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
```

### Comando 4: `src/hooks/useLeaderboardDB.js` — inverso/inverse/menor/lower/reverse/inverte/invertido
```
(Sem resultados — output vazio)
```

### Comando 5: `src/data/supertrunfo-pt.json` — inverso/inverse/menor vence/lower wins
```
(Sem resultados — output vazio. A descrição do rank_sdr contém "Menor = melhor" mas a busca por "menor vence" e "lower wins" não encontra.)
```

> **Nota:** O grep por "menor vence" não capturou a descrição do rank_sdr nos JSONs porque o texto é "Menor = melhor", não "menor vence". O grep por "menor" (sem " vence") teria capturado, mas o comando foi executado conforme especificado.

---

## ETAPA 2 — LEITURA CIRÚRGICA DA RESOLUÇÃO

### Função `resolverRodada` — TopTrumps.jsx:381–436

```js
function resolverRodada(attrKey, escolhidoPor) {
    if (!cartaJogador || !cartaIA) return
    const attr = atributos.find(a => a.id === attrKey)
    if (!attr) return
    const vJ = cartaJogador.atributos[attrKey]
    const vI = cartaIA.atributos[attrKey]
    let res
    if (attr.inverso) res = vJ < vI ? 'ganhou' : vJ > vI ? 'perdeu' : 'empate'
    else res = vJ > vI ? 'ganhou' : vJ < vI ? 'perdeu' : 'empate'
    // ... animação, placar, histórico, mudança de fase
}
```

A lógica (linha 388):
- `attr.inverso` é **truthy** → `vJ < vI` = vitória (menor vence)
- `attr.inverso` é **falsy** → `vJ > vI` = vitória (maior vence)

### ATTR_META — cardLabels.js:42–50

```js
export const ATTR_META = [
  { key: 'poder_mental',    labelId: 'pm',   max: 100, cssKey: 'pm' },
  { key: 'resistencia',     labelId: 're',   max: 100, cssKey: 're' },
  { key: 'velocidade',      labelId: 'vl',   max: 100, cssKey: 'vl' },
  { key: 'nivel_xama',      labelId: 'nx',   max: 10,  cssKey: 'nx' },
  { key: 'fator_caos',      labelId: 'fc',   max: 100, cssKey: 'fc' },
  { key: 'energia_base',    labelId: 'eb',   max: 100, cssKey: 'eb' },
  { key: 'poder_explosivo', labelId: 'pe',   max: 100, cssKey: 'pe' },
]
```

**Nenhum** dos 7 atributos em ATTR_META possui campo `inverso` ou equivalente.

### Por atributo — resposta explícita:

| Atributo | Tem campo inverso? | Como é tratado na comparação? |
|---|---|---|
| `poder_mental` | ❌ | Maior vence (padrão do `else` na linha 389) |
| `resistencia` | ❌ | Maior vence |
| `velocidade` | ❌ | Maior vence |
| `nivel_xama` | ❌ | Maior vence |
| `fator_caos` | ❌ | Maior vence |
| `energia_base` | ❌ | Maior vence |
| `poder_explosivo` | ❌ | Maior vence |

### Onde o inverso é definido?

O campo `inverso` NÃO está em ATTR_META. Ele é criado **dinamicamente** na construção do array `atributos`:

**TopTrumps.jsx:104–107** (SP):
```js
const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({
    id, nomeKey: attrNomeKey(id),
    descricao, inverso: id === 'rank_sdr'
}))
```

**TopTrumpsMP.jsx:39–42** (MP):
```js
const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({
    id, nomeKey: attrNomeKey(id),
    descricao, inverso: id === 'rank_sdr'
}))
```

O array `deck.meta.atributos_explicacao` contém **todos os 8 atributos** (incluindo rank_sdr). O `inverso` é `true` **apenas** quando `id === 'rank_sdr'`. Para todos os outros 7, `inverso` é `false`.

---

## ETAPA 3 — AUDITORIA DO rank_sdr

### A. rank_sdr é renderizado como clicável ou apenas informativo?

**APENAS informativo.** TopTrumpsCard.jsx:123–129:

```js
{/* Rank SDR */}
{!mystery && attributes.rank_sdr !== undefined && (
  <div className="tt-card-rank">
    <span className="tt-card-rank-label">{labels.rank}</span>
    <span className="tt-card-rank-value">#{attributes.rank_sdr}</span>
  </div>
)}
```

- Renderizado em `<div>` **separado** do map de ATTR_META (linha 83–121)
- **Sem** `onClick`, `role="button"`, `tabIndex`, ou `onKeyDown`
- Classe CSS `tt-card-rank` (não `tt-card-attr-clickable`)
- Exibido como `#valor` (prefixo `#`)

**Os 7 atributos jogáveis** (ATTR_META) são renderizados com:
- `onClick`, `role="button"`, `tabIndex`, `onKeyDown` — todos clicáveis
- Classes `tt-card-attr-clickable` e `tt-card-attr--disabled`

### B. Existe algum caminho onde rank_sdr poderia ser selecionado como atributo de comparação?

**Não.** Em todos os pontos de seleção ele é explicitamente excluído:

**SP — IA escolhe atributo (TopTrumps.jsx:372–373):**
```js
// rank_sdr não é um atributo jogável (é apenas informativo na carta)
const attrsDisponiveis = atributos.filter(attr => cartaIA.atributos[attr.id] !== undefined && attr.id !== 'rank_sdr')
```

**MP — Timeout auto-pick (TopTrumpsMP.jsx:229–231):**
```js
// rank_sdr não é atributo jogável (apenas informativo na carta)
const attrs = atributos.filter(a => a.id !== 'rank_sdr').map(a => a.id)
```

**Jogador:** rank_sdr não é clicável na carta (ver item A acima), então o jogador nunca pode selecioná-lo via clique.

### C. O campo `inverso: true` existe em algum objeto de configuração referente ao rank_sdr fora do ATTR_META?

**Fora do ATTR_META:** O `inverso: true` é definido **apenas** nos arrays `atributos` construídos em:
- TopTrumps.jsx:106 — `inverso: id === 'rank_sdr'`
- TopTrumpsMP.jsx:41 — `inverso: id === 'rank_sdr'`

**Não há** nenhum outro objeto de configuração (arquivo JSON, constante, hook, etc.) que defina `inverso: true` para rank_sdr ou qualquer outro atributo.

**CardViewerModal.jsx:174** e **DeckBuilder.jsx:286** usam variáveis locais `const inverso = k === 'rank_sdr'` apenas para **renderização visual** (exibir `#valor` e inverter a barra de progresso). Isso não afeta a lógica de jogo.

---

## ETAPA 4 — VARREDURA COMPLETA

### Output bruto do grep recursivo em `src/` (arquivos .js, .jsx, .json)

```
Filename                  Line Line Content
───────                   ──── ────
TopTrumpsCard.jsx            22     attributes        - { rank_sdr, poder_mental, ...
TopTrumpsCard.jsx           124         {!mystery && attributes.rank_sdr !== undefined && (
TopTrumpsCard.jsx           127             <span className="tt-card-rank-value">#{attributes.rank_sdr}</span>
supertrunfo-en.json           7       "rank_sdr": "Posição no ranking mundial SDR. Menor = melhor.",
supertrunfo-en.json          35+        (rank_sdr values for all 76 cards — EN)
supertrunfo-es.json           7       "rank_sdr": "Posição no ranking mundial SDR. Menor = melhor.",
supertrunfo-es.json          35+        (rank_sdr values for all 76 cards — ES)
supertrunfo-pt.json           7       "rank_sdr": "Posição no ranking mundial SDR. Menor = melhor.",
supertrunfo-pt.json          35+        (rank_sdr values for all 76 cards — PT)
cardLabels.js                40  * rank_sdr não tem max fixo (escala inversa - menor é melhor).
en.json                    1534       "atributo_rank_sdr": "SDR Rank",
es.json                    1534       "atributo_rank_sdr": "Rango SDR",
pt.json                    1561       "atributo_rank_sdr": "Rank SDR",
CardViewerModal.jsx         33 const ATTR_KEYS = ['rank_sdr', 'poder_mental', 'velocidade', ...
CardViewerModal.jsx         68       rank_sdr: t('games.toptrumps.atributo_rank_sdr'),
CardViewerModal.jsx        174                     const inverso = k === 'rank_sdr'
CardViewerModal.jsx        178                         <span className="tt-viewer-stat-val">{inverso ? `#${val}` : val}
CardViewerModal.jsx        182                             ref={el => { ... inverso ? Math.min(100, val / 100) : (val / attr.max) * 100 }}
DeckBuilder.jsx            286                       const inverso = k === 'rank_sdr'
DeckBuilder.jsx            291                               rank_sdr: t('games.toptrumps.atributo_rank_sdr'),
DeckBuilder.jsx            301                           <span className="tt-deckbuilder-viewer-stat-val">{inverso ? `#${val}` : val}
TopTrumps.jsx               77     rank_sdr: 'games.toptrumps.atributo_rank_sdr',
TopTrumps.jsx              106     descricao, inverso: id === 'rank_sdr'
TopTrumps.jsx              372       // rank_sdr não é um atributo jogável (é apenas informativo na carta)
TopTrumps.jsx              373       const attrsDisponiveis = atributos.filter(attr => cartaIA.atributos[attr.id] != ...
TopTrumps.jsx              388     if (attr.inverso) res = vJ < vI ? 'ganhou' : vJ > vI ? 'perdeu' : 'empate'
TopTrumps.jsx             1107         const diff = attr?.inverso ? h.valorIA - h.valorJogador : h.valorJogador - h.valorIA
TopTrumpsMP.jsx             18     rank_sdr: 'games.toptrumps.atributo_rank_sdr',
TopTrumpsMP.jsx             41     descricao, inverso: id === 'rank_sdr'
TopTrumpsMP.jsx            229           // rank_sdr não é atributo jogável (apenas informativo na carta)
TopTrumpsMP.jsx            230           const attrs = atributos.filter(a => a.id !== 'rank_sdr').map(a => a.id)
TopTrumpsMP.jsx            345         if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
TopTrumpsMP.jsx            421         if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
```

### Resposta: existe algum atributo ALÉM de rank_sdr com lógica "menor vence"?

**Não.** Lista completa de todas as ocorrências de lógica inversa no código:

| Arquivo | Linha | Código | Atributo alvo |
|---|---|---|---|
| `TopTrumps.jsx` | 106 | `inverso: id === 'rank_sdr'` | rank_sdr |
| `TopTrumps.jsx` | 388 | `if (attr.inverso) res = vJ < vI ? ...` | rank_sdr (via array) |
| `TopTrumps.jsx` | 1107 | `const diff = attr?.inverso ? ...` | rank_sdr (via array) |
| `TopTrumpsMP.jsx` | 41 | `inverso: id === 'rank_sdr'` | rank_sdr |
| `TopTrumpsMP.jsx` | 345 | `if (attr.inverso) res = v1 < v2 ? ...` | rank_sdr (via array) |
| `TopTrumpsMP.jsx` | 421 | `if (attr.inverso) res = v1 < v2 ? ...` | rank_sdr (via array) |
| `CardViewerModal.jsx` | 174 | `const inverso = k === 'rank_sdr'` | rank_sdr (render apenas) |
| `DeckBuilder.jsx` | 286 | `const inverso = k === 'rank_sdr'` | rank_sdr (render apenas) |

Todos os 8 pontos referenciam **exclusivamente** rank_sdr. Nenhum deles se aplica a poder_mental, velocidade, resistencia, nivel_xama, fator_caos, energia_base, ou poder_explosivo.

---

## Conclusão Final

1. **Único atributo com lógica inversa:** `rank_sdr` — confirmado por código em todos os 8 pontos do sistema.
2. **Rank_sdr NÃO é jogável em nenhum cenário:**
   - SP (TopTrumps.jsx:373): IA explicitamente filtra `attr.id !== 'rank_sdr'`
   - MP (TopTrumpsMP.jsx:230): Timeout explicitamente filtra `a.id !== 'rank_sdr'`
   - Jogador: não pode clicar porque rank_sdr é renderizado como `<div>` estático (TopTrumpsCard.jsx:124–129), fora do loop ATTR_META
3. **A lógica inversa em rank_sdr é dead code** — o código suportaria "menor vence" se rank_sdr fosse selecionável, mas ele nunca é selecionado.
4. **Nenhum outro atributo (poder_mental, velocidade, resistencia, nivel_xama, fator_caos, energia_base, poder_explosivo) tem ou poderia ter lógica inversa** — todos são `inverso: false` pela construção `id === 'rank_sdr'`, e a engine de comparação (linhas 388–389 SP, 345–346/421–422 MP) só bifurca em `attr.inverso`.
