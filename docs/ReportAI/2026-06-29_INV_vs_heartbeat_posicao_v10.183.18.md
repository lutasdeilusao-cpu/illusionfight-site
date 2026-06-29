# INVESTIGAÇÃO: VS Heartbeat — Posicionamento relativo à carta visível

**Data:** 2026-06-29
**Versão atual:** `SITE_VERSION = 10.183.18` / `TS_VERSION = 5.45.2`
**Arquivos analisados:**
- `src/pages/games/TopTrumps/TopTrumps.css` (efetivo)
- `src/pages/games/TopTrumps/styles/GameScreen.css` (não importado — **dead code**)
- `src/pages/games/TopTrumps/components/GameScreen/GameScreen.jsx`
- `src/components/TopTrumpsCard/TopTrumpsCard.jsx`
- `src/components/TopTrumpsCard/TopTrumpsCard.css`

---

## ⚠️ DESCOBERTA CRÍTICA — `GameScreen.css` é DEAD CODE

O arquivo `src/pages/games/TopTrumps/styles/GameScreen.css` contém a correção
(`flex: 0 0 auto` no `.tt-player-card-wrapper`) mas **nunca é importado em
nenhum lugar**. Zero referências em todo o projeto.

A linha `TS_VERSION = '5.45.2'` em `version.js` menciona:
> `"fix: VS deslocado para baixo (flex: 1 → flex: 0 0 auto + space-between)"`

Ou seja, a correção foi registrada no changelog/versão mas **nunca entrou em
vigor** porque o arquivo onde foi aplicada não está na árvore de imports.

O CSS que realmente vigora é `TopTrumps.css` (importado em `TopTrumpsSP.jsx:21`),
que ainda tem `flex: 1`.

---

## ETAPA 2 — Perguntas respondidas

### 1. Display e flex-direction de `.tt-game-container`

**Arquivo:** `TopTrumps.css:2336-2348`

```css
.tt-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100dvh;
  justify-content: space-between;
  /* também: position: relative; max-width: 480px; margin: 0 auto; */
}
```

**Resposta:** `display: flex; flex-direction: column; justify-content: space-between`.

---

### 2. Como `.tt-vs-heartbeat` está posicionado hoje?

**Arquivo:** `TopTrumps.css:2415-2425`

```css
.tt-vs-heartbeat {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  padding: 4px 0;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}
```

- **position: relative** — NÃO é absolute.
- É um **flex child** normal de `.tt-game-container`, entre `.tt-player-card-wrapper` e `.tt-opponent-mini-wrapper` no fluxo vertical.
- Nenhum `top`, `bottom`, `left`, `right` ou `transform` de deslocamento.
- `flex-shrink: 0` — não encolhe.
- `min-height: 48px` — altura mínima.

**Estrutura DOM em `GameScreen.jsx:24-57`:**
```
.tt-game-container (flex column, space-between)
  ├── .tt-game-header (flex-shrink: 0)
  ├── .tt-player-card-wrapper (flex: 1 ← AQUI O PROBLEMA)
  │     └── .tt-card-wrapper (297×388.8px, position: relative)
  │           └── .tt-card-template (550×720, scale(0.54), position: absolute)
  ├── .tt-vs-heartbeat (position: relative, min-height: 48px)
  ├── .tt-opponent-mini-wrapper (flex: 0 0 30dvh, max 350px)
  └── .tt-game-footer (flex-shrink: 0)
```

---

### 3. Tamanho real renderizado de `.tt-card-template`

**Arquivo:** `TopTrumpsCard.css:14-20` + `TopTrumps.css:2403-2413`

```css
/* TopTrumpsCard.css — tamanho nativo */
.tt-card-template {
  position: absolute;
  top: 0; left: 0;
  width: 550px;
  height: 720px;
}

/* TopTrumps.css — escala aplicada */
.tt-player-card-wrapper .tt-card-template {
  transform: scale(0.54);
  transform-origin: top left;
}

/* TopTrumps.css — wrapper corta o excesso */
.tt-player-card-wrapper .tt-card-wrapper {
  width: calc(550px * 0.54);   /* = 297px */
  height: calc(720px * 0.54);  /* = 388.8px */
  overflow: hidden;
}
```

| Propriedade | Valor |
|---|---|
| Tamanho nativo da carta | 550×720 px |
| Scale aplicado | 0.54 |
| **Tamanho visual renderizado** | **297×388.8 px** |
| `.tt-card-wrapper` tem `position: relative`? | ✅ Sim (`TopTrumpsCard.css:11`) |
| `.tt-card-template` tem `position: absolute`? | ✅ Sim (`TopTrumpsCard.css:15`) |

`.tt-player-card-wrapper` **NÃO tem altura fixa** — usa `flex: 1` e cresce para
ocupar o espaço vertical restante. A carta fica centralizada verticalmente
dentro deste wrapper via `align-items: center; justify-content: center`.

---

### 4. Altura do `.tt-opponent-mini-wrapper` vs `.tt-player-card-wrapper`

**Arquivo:** `TopTrumps.css:2367-2371` (opponent) e `TopTrumps.css:2390-2398` (player)

```css
/* Opponent */
.tt-opponent-mini-wrapper {
  flex: 0 0 30dvh;
  min-height: 140px;
  max-height: 350px;
}

/* Player */
.tt-player-card-wrapper {
  flex: 1;            /* ← cresce sem limite */
  min-height: 0;
}
```

| Wrapper | Altura | Comportamento |
|---|---|---|
| `.tt-player-card-wrapper` | **Variável** — `flex: 1` | Cresce para ocupar todo espaço restante entre header e VS. Pode chegar a 500+ px. |
| `.tt-opponent-mini-wrapper` | **30dvh** (max 350px) | Tamanho fixo proporcional à viewport. |

**Sim, as alturas são diferentes.** O player wrapper é sempre maior que o opponent
wrapper em viewports típicas.

---

## ETAPA 3 — Análise de Hipóteses

### Mecânica do problema

Com `flex: 1` no `.tt-player-card-wrapper` e `justify-content: space-between`:

```
Cálculo do gap entre fundo visual da carta e .tt-vs-heartbeat:

gap = (wrapperHeight - cardVisualHeight) / 2

Onde:
  wrapperHeight   = 100dvh - header - VS - opponent - footer
  cardVisualHeight = 388.8px (fixo, scale(0.54) de 720px)

Exemplo (viewport 800px):
  header(30) + opponent(240) + VS(48) + footer(30) = 348px
  wrapperHeight = 800 - 348 = 452px
  gap = (452 - 388.8) / 2 = 31.6px

Exemplo (viewport 1000px):
  header(30) + opponent(300) + VS(48) + footer(30) = 408px
  wrapperHeight = 1000 - 408 = 592px
  gap = (592 - 388.8) / 2 = 101.6px ← MUITO NOTÁVEL
```

O gap cresce com a viewport. **Nunca diminui.** Segue proporcional à altura da tela.

---

### Hipótese A — position: absolute relativo ao card visível

**Viabilidade:** 🟡 Parcial

- `.tt-card-wrapper` já tem `position: relative` ✅
- `.tt-card-template` dentro dele tem `position: absolute` e dimensões conhecidas
- **Problema:** VS é irmão do wrapper no DOM (`GameScreen.jsx`), não filho. Para
  ancorar ao card, o VS precisaria estar DENTRO de `.tt-player-card-wrapper` ou
  de `.tt-card-wrapper`.
- Isso exige **modificação estrutural no JSX** de `GameScreen.jsx` e talvez
  de `TopTrumpsCard.jsx`.
- Risco de regressão: moderate — qualquer mudança no DOM afeta o fluxo flex dos
  elementos irmãos.

---

### Hipótese B — negative margin-top no VS

**Viabilidade:** ❌ Inviável como valor fixo

- O gap é **variável com a viewport** (31px em 800dvh → 101px em 1000dvh)
- Um `margin-top: -Xpx` fixo só funcionaria para um único tamanho de tela
- `calc()` puro não resolve porque depende da altura real do wrapper que é
  dinâmica (flex: 1)
- **Alternativa:** calcular o margin via JS (getBoundingClientRect) — que é
  essencialmente a Hipótese C

---

### Hipótese C — anchor via getBoundingClientRect (JS/ref)

**Viabilidade:** 🟢 Robusta, mas pesada

- `GameScreen.jsx` poderia usar `useRef` no `.tt-player-card-wrapper`,
  medir `getBoundingClientRect()` do `.tt-card-template` dentro dele e
  ajustar o VS via `style.transform` ou `style.marginTop`
- `TopTrumpsCard` não faz `forwardRef` — precisaria de `React.forwardRef`
  ou de ref na div `.tt-player-card-wrapper` + `querySelector`
- **Prós:** funciona em qualquer viewport, qualquer escala
- **Contras:** complexidade extra, re-renders, `useLayoutEffect` ou `ResizeObserver`
- Risco de regressão: baixo (mexe só em JS, não em layout)

---

### ⭐ Hipótese D (Recomendada) — `flex: 1` → `flex: 0 0 auto` no `.tt-player-card-wrapper`

**Viabilidade:** 🟢✅ **Mais simples. Já foi tentada (mas nunca entrou em vigor).**

**O que fazer:**
1. Em `TopTrumps.css:2391`, mudar `flex: 1` para `flex: 0 0 auto` no
   `.tt-player-card-wrapper`
2. Opcional: atualizar `position: relative` e `z-index: 2` (já existem em
   `GameScreen.css` mas o `TopTrumps.css` não os tem neste bloco)

**Efeito:**
- `.tt-player-card-wrapper` passa a ter altura = conteúdo (388.8px)
- VS fica **imediatamente abaixo** do card visual — gap = 0
- `justify-content: space-between` distribui o espaço restante igualmente
  entre todos os itens (header↔card, card↔VS, VS↔opponent, opponent↔footer)
- O VS sempre cola no card, independente da viewport

**Cálculo do layout resultante (viewport 800px):**
```
Conteúdo total: header(30) + card(388.8) + VS(48) + opponent(240) + footer(30) = 736.8px
Espaço restante: 800 - 736.8 = 63.2px
Gaps (4 gaps): ~15.8px cada
```

**Cálculo (viewport 1000px, opponent cap 350px):**
```
Conteúdo total: 30 + 388.8 + 48 + 350 + 30 = 846.8px
Espaço restante: 1000 - 846.8 = 153.2px
Gaps (4 gaps): ~38.3px cada
```

Em ambos os casos, VS está GRUDADO no card visual. Gaps são distribuídos
uniformemente, sem ponto focal de desconforto visual.

**Semântica:** Foi exatamente o que o commit `TS v5.45.2` tentou fazer.
A mudança existe em `GameScreen.css:16` mas o arquivo nunca foi ativado.

**Arquivos a alterar (apenas 1):**
- `src/pages/games/TopTrumps/TopTrumps.css` — linha 2391

**Risco de regressão:** Baixo
- Afeta apenas o layout do GameScreen (não atinge MenuScreen, ResultScreen, etc.)
- Único elemento afetado é `.tt-player-card-wrapper` e seus descendentes
- VS, opponent e footer continuam com `flex-shrink: 0` — não encolhem
- Em viewports muito pequenas (< 650px), se o conteúdo ultrapassar
  `100dvh`, o wrapper pode precisar de `overflow: hidden` (já tem)
  e `min-height: 0` (já tem)

---

## ETAPA 4 — Conclusão

| Hipótese | Viável? | Esforço | Robustez |
|---|---|---|---|
| A — absolute no card wrapper | 🟡 Parcial | Médio (modificar DOM) | Média |
| B — negative margin fixo | ❌ Não | — | — |
| C — getBoundingClientRect | 🟢 Sim | Alto (refs, forwardRef, observer) | Máxima |
| **D — flex: 0 0 auto** | **🟢✅** | **Mínimo (1 linha CSS)** | **Alta** |

**Recomendação:** Implementar **Hipótese D** — mudar `flex: 1` para `flex: 0 0 auto`
em `TopTrumps.css:2391`. É a correção que já consta no changelog (`TS v5.45.2`)
mas nunca foi aplicada ao CSS ativo.

**Arquivo:** `src/pages/games/TopTrumps/TopTrumps.css` — linha 2391
**Mudança:** `flex: 1` → `flex: 0 0 auto`
**Não requer:** JS, refs, DOM restructuring, novos componentes

---

## Arquivos não modificados (conforme regras)

- ❌ `engine/combat.js`
- ❌ `engine/hexUtils.js`
- ❌ `engine/ai.js`
- ❌ `Phase1SheetBuilder.jsx`
- ❌ `src/pages/Arena/`
- ❌ `e2e/routes.spec.js`
- ✅ `GameScreen.css` — dead code, NÃO será ativado (apenas referência)
