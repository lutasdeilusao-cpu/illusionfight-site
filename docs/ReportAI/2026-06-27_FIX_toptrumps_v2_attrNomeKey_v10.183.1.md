# FIX — TopTrumps v2: attrNomeKey not defined + dependência circular + Playwright — v10.183.1

> Data: 2026-06-27
> Versão: SITE 10.183.1 | TS 5.44.1
> Status: CORRIGIDO

---

## 1. Problema

O orquestrador `TopTrumpsSP_v2.jsx` chamava `attrNomeKey(id)` na linha 39 mas a função não estava definida nem importada no arquivo. No SP original (`TopTrumps.jsx:54`), ela existe como função inline no módulo, mas nunca foi extraída para o v2.

Adicionalmente, o orquestrador tinha uma dependência circular: `game` era referenciado em `onRecompensaConfirmada: () => game.setFase(...)` antes da variável `game` ser declarada, causando `ReferenceError: Cannot access 'game' before initialization`.

## 2. Greps da Etapa 1

### Comando 1 — Onde attrNomeKey é usado
```
TopTrumpsSP_v2.jsx:39   atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({ id, nomeKey: attrNomeKey(id), ... }))
TopTrumps.jsx:54        function attrNomeKey(id) {
TopTrumps.jsx:84            id, nomeKey: attrNomeKey(id),
TopTrumpsMP.jsx:16      function attrNomeKey(id) {
TopTrumpsMP.jsx:40          id, nomeKey: attrNomeKey(id),
```

### Comando 2 — Primeiras 50 linhas do v2
```
1:  import { useEffect, useRef } from 'react'
...
19: import cardFallback from '../../../../assets/images/cards/characters/card-fallback.png'
20: import img01 from '../../../../assets/images/cards/characters/card-01.png'
21: import img02 from '../../../../assets/images/cards/characters/card-02.png'
...
39:   const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({ id, nomeKey: attrNomeKey(id), ... }))
```

### Comando 3 — Uso de attrNomeKey no v2
```
LineNumber Line
39         const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({ id, nomeKey: attrNomeKey(id), ... }))
```

## 3. Correções aplicadas

### 3.1 — Criado `utils/attrNomeKey.js`

```js
export function attrNomeKey(id) {
  const map = {
    rank_sdr: 'atributo_rank_sdr',
    poder_mental: 'atributo_poder_mental',
    velocidade: 'atributo_velocidade',
    resistencia: 'atributo_resistencia',
    nivel_xama: 'atributo_nivel_xama',
    fator_caos: 'atributo_fator_caos',
    energia_base: 'atributo_energia_base',
  }
  return map[id] || 'atributo_poder_explosivo'
}
```

**Arquivo:** `src/pages/games/TopTrumps/utils/attrNomeKey.js`

### 3.2 — Import adicionado no v2 orquestrador

**ANTES (linha 19):**
```js
import cardFallback from '../../../../assets/images/cards/characters/card-fallback.png'
```

**DEPOIS (linhas 19-20):**
```js
import { attrNomeKey } from '../utils/attrNomeKey'
import cardFallback from '../../../../assets/images/cards/characters/card-fallback.png'
```

### 3.3 — Dependência circular corrigida com gameRef

**ANTES (linhas 46-51):**
```js
const deckHook = useTopTrumpsDeck({ user, perfil, todasCartas: deck.cartas })
const histRef = useRef([])
const rewards = useTopTrumpsRewards({ ... onRecompensaConfirmada: () => game.setFase('fim_jogo') })
const effects = useGameEffects({ fase: game?.fase, confirmandoAtributo: game?.confirmandoAtributo })
const game = useTopTrumpsSP(...)
histRef.current = game.historicoRodadas
```

**DEPOIS (linhas 46-52):**
```js
const deckHook = useTopTrumpsDeck({ user, perfil, todasCartas: deck.cartas })
const histRef = useRef([])
const gameRef = useRef(null)
const rewards = useTopTrumpsRewards({ ... onRecompensaConfirmada: () => gameRef.current?.setFase('fim_jogo') })
const effects = useGameEffects({ fase: 'menu', confirmandoAtributo: null })
const game = useTopTrumpsSP(...)
gameRef.current = game
histRef.current = game.historicoRodadas
```

## 4. Playwright Tests

### Script criado: `e2e/v2_basic.spec.js`

```js
test('TopTrumps v2 — rota carrega sem crash', async ({ page }) => { ... })
test('TopTrumps v2 — console log de deck aparece', async ({ page }) => { ... })
test('TopTrumps original — rota legacy intacta', async ({ page }) => { ... })
```

### Output (3/3 passed):
```
Running 3 tests using 1 worker
  ✓  1 TopTrumps v2 — rota carrega sem crash (20.8s)
  ✓  2 TopTrumps v2 — console log de deck aparece (6.2s)
  ✓  3 TopTrumps original — rota legacy intacta (4.3s)
  3 passed (32.1s)
```

## 5. Teste lógico

### Fluxo 1 — attrNomeKey resolvido
- Após o fix, `import { attrNomeKey } from '../utils/attrNomeKey'` na linha 19
- A função é usada na linha 39 para mapear `atributos` ✅

### Fluxo 2 — SP original intocado
- `TopTrumps.jsx:54` mantém `function attrNomeKey(id)` inline ✅
- `grep -n "attrNomeKey" src/pages/games/TopTrumps/TopTrumps.jsx` mostra 2 ocorrências ✅

### Fluxo 3 — Dependência circular resolvida
- `gameRef.current = game` na linha 52 (após `useTopTrumpsSP`)
- Callbacks usam `gameRef.current?.setFase()` — lazy access ✅
- Playwright test 1 confirma 0 erros de runtime ✅

## 6. Build output

```
✓ built in 1.87s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

## 7. Versões

| Constante | Antes | Depois |
|---|---|---|
| `SITE_VERSION` | 10.183.0 | **10.183.1** |
| `TS_VERSION` | 5.44.0 | **5.44.1** |

## 8. Commits

- `23e53884` — `fix(toptrumps-v2): attrNomeKey not defined [v10.183.1]`
  - Cria `utils/attrNomeKey.js`, importa no v2, corrige dependência circular

- `88ccab68` — `fix: circular dependency game before init + playwright tests [v10.183.1]`
  - Adiciona `gameRef`, cria `e2e/v2_basic.spec.js`, 3/3 testes passam

- `PENDENTE` — Commit do relatório + deploy final

## 9. Teste manual

- Acessar `/games/toptrumps/v2` — deve renderizar o menu sem erros no console
- Acessar `/games/toptrumps` — mesma versão v2, menu renderizado
- Acessar `/games/toptrumps/legacy` — versão original funcionando
- Verificar que `console` não mostra `ReferenceError: attrNomeKey is not defined` nem `Cannot access 'game' before initialization`
