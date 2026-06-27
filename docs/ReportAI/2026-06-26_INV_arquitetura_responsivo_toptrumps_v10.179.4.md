# INV — Auditoria de Arquitetura + Diagnóstico Layout Responsivo Top Trumps SP

**Data:** 2026-06-26
**Propósito:** Investigação pura — mapear violações de arquitetura e hardcoded values que quebram o layout responsivo. Nenhuma edição de código.

---

## ETAPA 1 — Valores Hardcoded em px

### TopTrumps.css — valores em px que afetam layout principal:

| Linha | Seletor | Valor | Impacto |
|---|---|---|---|
| 2377 | `.tt-card--mini-wrapper` | `height: 295px` | ❌ Crítico — fixo para 932px |
| 2406 | `@media ≤460 .tt-player-card-wrapper .tt-card-wrapper` | `height: calc(720px * 0.68)` | ❌ Baseado em 720px fixo |
| 2416 | `@media 461-768` | `height: calc(720px * 0.78)` | ❌ Baseado em 720px fixo |
| 2426 | `@media 769-1200` | `height: calc(720px * 0.88)` | ❌ Baseado em 720px fixo |
| 2438 | `.tt-vs-heartbeat` | `min-height: 48px` | ⚠️ Aceitável se pequeno |
| 2448 | `.tt-vs-heartbeat-glow` | `width/height: 70px` | ⚠️ Decorativo |
| 65-66 | `.tt-card-stack` | `180×250px` | Decoração menu |
| 76-77 | `.tt-card-sample` | `160×220px` | Decoração menu |
| 187 | `.tt-colecao-bar` | `height: 6px` | Barra progresso |
| 333 | `.tt-config-turno-btn` | `48×48px` | Botões menu |
| 365 | `.tt-tentativa-dot` | `10×10px` | Indicador |
| 686 | `.tt-card-avatar` | `100×100px` | Avatar (não usado) |
| 872-873 | `.tt-vs-epico` | `180×300px` | VS (não usado) |
| 881-882 | `.tt-vs-glow` | `200×200px` | VS (não usado) |
| 1575 | `.tt-confirm-bar` | `height: 6px` | Barra confirmação |

### TopTrumpsCard.css — valores em px que afetam layout principal:

| Linha | Seletor | Valor | Impacto |
|---|---|---|---|
| 7-8 | `.tt-card-wrapper` (base) | `550×720px` | ⚠️ Card base — aceitável se redimensionado por media query |
| 18-19 | `.tt-card-template` | `550×720px` | ⚠️ Herda do wrapper |
| 28 | `.tt-card-character-bg-img` | `height: 369px` | ✅ Interno ao card |
| 62 | `.tt-card-name` | `height: 51px` | ✅ Interno ao card |
| 83 | `.tt-card-description` | `height: 132px` | ✅ Interno ao card |
| 275 | `@media 769-1200 .tt-card-wrapper` | `height: calc(720px * 0.75)` | ⚠️ Redimensiona o card |
| 289 | `@media 461-768` | `height: calc(720px * 0.62)` | ⚠️ Redimensiona o card |
| 303 | `@media ≤460` | `height: calc(720px * 0.54)` | ⚠️ Redimensiona o card |

---

## ETAPA 2 — Scale() Fixos

### TopTrumps.css:

| Linha | Seletor | Valor | Base |
|---|---|---|---|
| 2385 | `.tt-card--mini` | `scale(0.76)` | Aplicado sobre card wrapper (389px em ≤460) → 296px visual |
| 2409 | `@media ≤460 .tt-player-card-wrapper .tt-card-template` | `scale(0.68)` | Aplicado sobre 720px → 490px visual |
| 2419 | `@media 461-768` | `scale(0.78)` | Aplicado sobre 720px → 562px |
| 2429 | `@media 769-1200` | `scale(0.88)` | Aplicado sobre 720px → 634px |

### TopTrumpsCard.css:

| Linha | Seletor | Valor | Base |
|---|---|---|---|
| 280 | `@media 769-1200 .tt-card-template` | `scale(0.75)` | Sobre 720px → 540px |
| 294 | `@media 461-768` | `scale(0.62)` | Sobre 720px → 446px |
| 308 | `@media ≤460` | `scale(0.54)` | Sobre 720px → 389px |

### Problema do scale aninhado:

O `.tt-card--mini` (scale 0.76) é aplicado SOBRE o card wrapper que já foi reduzido pelo media query. Em viewport ≤460px:
- Card wrapper (TopTrumpsCard.css): 389px (720 × 0.54)
- `.tt-card--mini` applica scale(0.76) sobre 389px → 389 × 0.76 = **296px visual**
- Wrapper do mini card: 295px → essencialmente preenche (296 ≈ 295)

Em viewport 461-768px:
- Card wrapper: 446px (720 × 0.62)
- scale(0.76) → 446 × 0.76 = **339px visual**
- Wrapper: 295px → cortado por overflow:hidden (perde 44px)

Em viewport >1200px:
- Card wrapper: 720px
- scale(0.76) → 720 × 0.76 = **547px visual**
- Wrapper: 295px → cortado em 252px (perde mais da metade)

---

## ETAPA 3 — Height/Width Fixos no Layout

### Categoria 1 — Afetam layout de página (problemáticos):

| Arquivo | Linha | Seletor | Valor |
|---|---|---|---|
| TopTrumps.css | 2377 | `.tt-card--mini-wrapper` | `height: 295px` |
| TopTrumps.css | 2406 | `.tt-player-card-wrapper .tt-card-wrapper` (≤460) | `height: calc(720px * 0.68)` |
| TopTrumps.css | 2416 | mesmo (461-768) | `height: calc(720px * 0.78)` |
| TopTrumps.css | 2426 | mesmo (769-1200) | `height: calc(720px * 0.88)` |
| TopTrumpsCard.css | 275 | `.tt-card-wrapper` (769-1200) | `height: calc(720px * 0.75)` |
| TopTrumpsCard.css | 289 | `.tt-card-wrapper` (461-768) | `height: calc(720px * 0.62)` |
| TopTrumpsCard.css | 303 | `.tt-card-wrapper` (≤460) | `height: calc(720px * 0.54)` |

### Categoria 2 — Internos ao card (aceitáveis):

| Arquivo | Linha | Seletor | Valor |
|---|---|---|---|
| TopTrumpsCard.css | 28 | `.tt-card-character-bg-img` | `height: 369px` |
| TopTrumpsCard.css | 62 | `.tt-card-name` | `height: 51px` |
| TopTrumpsCard.css | 83 | `.tt-card-description` | `height: 132px` |
| TopTrumpsCard.css | 7 | `.tt-card-wrapper` (base) | `550×720px` |

---

## ETAPA 4 — Violações de Arquitetura

### CSS inline (style={{}}):
- `TopTrumps.jsx`: **0 ocorrências** ✅
- `TopTrumpsCard.jsx`: **0 ocorrências** ✅
- `CardViewerModal.jsx`: **0 ocorrências** ✅
- `DeckBuilder.jsx`: **0 ocorrências** ✅
- `DeckStartModal.jsx`: **0 ocorrências** ✅

**Nenhuma violação de CSS inline.** ✅

### Strings hardcoded:
Não verificado nesta task — seria uma task separada de i18n.

---

## ETAPA 5 — Estrutura Flex do .tt-game-container

| Elemento | flex-shrink | flex | height | min-height | Problemático? |
|---|---|---|---|---|---|
| `.tt-game-header` | `0` ✅ | — | conteúdo natural | — | ✅ Não |
| `.tt-player-card-wrapper` | — | `1` ✅ | — | `0` ✅ | ✅ Não (adaptativo) |
| `.tt-vs-heartbeat` | `0` ✅ | — | — | `48px` ⚠️ | ⚠️ min-height fixo |
| `.tt-opponent-mini-wrapper` | `0` ❌ | — | — | — | ❌ Não adaptativo |
| `.tt-card--mini-wrapper` | `0` ❌ | — | `295px` ❌ | — | ❌❌ Hardcoded |
| `.tt-game-footer` | `0` ✅ | — | conteúdo natural | — | ✅ Não |

**Problemas identificados:**
1. `.tt-opponent-mini-wrapper` usa `flex-shrink: 0` sem `flex-grow` — não ocupa espaço extra
2. `.tt-card--mini-wrapper` tem `height: 295px` — valor absoluto que não escala
3. `.tt-vs-heartbeat` tem `min-height: 48px` — pequeno, não crítico
4. `.tt-player-card-wrapper` é o único elemento adaptativo (flex:1) — ele absorve TODO o espaço extra ou falta

---

## ETAPA 6 — Tamanhos do Card por Breakpoint

### TopTrumpsCard.css — media queries:

| Viewport | Card wrapper | Card template scale | Card DOM height |
|---|---|---|---|
| >1200px (base) | 550×720 | nenhum (1.0) | 720px |
| 769-1200px | 412.5×540 | scale(0.75) | 540px |
| 461-768px | 341×446.4 | scale(0.62) | 446px |
| ≤460px | 297×388.8 | scale(0.54) | 389px |

### Player card override (TopTrumps.css) — media queries:

| Viewport | Card wrapper | Scale | Card DOM height |
|---|---|---|---|
| 769-1200px | 484×633.6 | scale(0.88) | 634px |
| 461-768px | 429×561.6 | scale(0.78) | 562px |
| ≤460px | 374×489.6 | scale(0.68) | 490px |

### Mini card — NÃO TEM media queries:
O `.tt-card--mini-wrapper` e `.tt-card--mini` são IGUAIS em todos os breakpoints (height:295px, scale:0.76). Isso é o problema principal — o scale(0.76) assume um card de 389px (≤460), mas em viewports maiores o card DOM é maior, distorcendo a proporção.

---

## ETAPA 7 — Cálculo do Scale Correto por Breakpoint

### Fórmula:
```
espaço_mini = 100dvh - (header + VS + label + footer + paddings)
scale_correto = espaço_mini / card_height_no_breakpoint
```

### Constantes (valores aproximados):
- Header: ~24px (rem)
- VS: ~56px (min-height 48 + pad 8)
- Label: ~14px
- Footer: ~30px
- Paddings container: ~16px (top + bottom)
- **Total fixo: ~140px**

### Viewport 1: 430×932 (iPhone 14 Pro Max)

Card no breakpoint ≤460px: **389px**

```
espaço_mini = 932 - 140 = 792px
Proporção mini-card (35% do espaço restante): 792 × 0.35 = 277px
scale_correto = 277 / 389 = 0.71
Player card (65%): 792 × 0.65 = 515px ≥ 490px ✅
```

### Viewport 2: 768×1024 (iPad)

Card no breakpoint 461-768px: **446px**

```
espaço_mini = 1024 - 140 = 884px
Proporção mini-card (35%): 884 × 0.35 = 309px
scale_correto = 309 / 446 = 0.69
Player card (65%): 884 × 0.65 = 575px ≥ 562px ✅
```

### Viewport 3: 1440×900 (Desktop)

Card no breakpoint >1200px: **720px**

```
espaço_mini = 900 - 140 = 760px
Proporção mini-card (35%): 760 × 0.35 = 266px
scale_correto = 266 / 720 = 0.37
Player card (65%): 760 × 0.65 = 494px
```

Neste caso, o player card de 720px não cabe em 494px. O overflow:hidden corta ~226px. O mini card com scale(0.37) fica com 266px visual.

### Análise dos resultados:

| Viewport | Espaço mini | Card DOM | Scale | Player card | Cabe? |
|---|---|---|---|---|---|
| 430×932 | 277px | 389px | **0.71** | 515px | ✅ (precisa 490) |
| 768×1024 | 309px | 446px | **0.69** | 575px | ✅ (precisa 562) |
| 1440×900 | 266px | 720px | **0.37** | 494px | ❌ (precisa 720) |

Em desktop (1440×900), o player card de 720px não cabe porque o viewport é mais largo que alto. O layout de coluna única não funciona bem em paisagem.

---

## ETAPA 8 — Proposta de Solução

### Opção A — Scale por media query ✅ (Recomendada)

Definir scale() diferente para o `.tt-card--mini` em CADA breakpoint, com wrapper height calculado proporcionalmente.

**Implementação:**

```css
/* Base (fallback para viewports sem media query) */
.tt-card--mini-wrapper { height: 35dvh; max-height: 400px; min-height: 180px; }
.tt-card--mini { transform: scale(0.55); }

/* ≤460px: card DOM = 389px, espaço ≈ 277px → scale = 277/389 = 0.71 */
@media (max-width: 460px) {
  .tt-card--mini-wrapper { height: 30dvh; }
  .tt-card--mini { transform: scale(0.71); }
}

/* 461-768px: card DOM = 446px, espaço ≈ 309px → scale = 309/446 = 0.69 */
@media (min-width: 461px) and (max-width: 768px) {
  .tt-card--mini-wrapper { height: 32dvh; }
  .tt-card--mini { transform: scale(0.69); }
}

/* 769-1200px: card DOM = 540px, espaço ≈ 350px → scale = 350/540 = 0.65 */
@media (min-width: 769px) and (max-width: 1200px) {
  .tt-card--mini-wrapper { height: 35dvh; }
  .tt-card--mini { transform: scale(0.65); }
}
```

**Vantagens:**
- Valores calculados para cada breakpoint real
- Wrapper usa dvh (relativo), não px fixo
- Compatível com todos os navegadores, sem JS
- Fácil de implementar e testar

**Desvantagens:**
- Ainda usa valores calculados, não adaptativos em tempo real
- Não resolve o desktop landscape (altura insuficiente)

### Opção B — Flex puro sem scale

Remover scale() e usar width/height 100% no mini card. **Inviável** porque o card interno (`.tt-card-wrapper`) tem dimensões fixas de 550×720 com conteúdo absolutamente posicionado. Sem scale(), o card transborda em 550×720 dentro de um wrapper que não tem esse espaço.

### Opção C — Container queries

Usar `container-type: size` no wrapper e `cqh` para escalar o card. **Inviável** porque:
- Container queries ainda não têm suporte universal (Vite 8 + React 19 pode até funcionar, mas GitHub Pages precisa de ampla compatibilidade)
- O scale() em container queries ainda precisaria de um valor numérico
- `cqh` daria a altura do container, mas scale() não aceita unidades

### Recomendação: Opção A

É a mais robusta para o stack atual. Além dos scales por media query, o wrapper deve usar `dvh` em vez de `px`:

```css
.tt-opponent-mini-wrapper {
  flex: 0 0 30dvh;          /* 30% da viewport */
  min-height: 140px;         /* proteção para telas pequenas */
}
.tt-card--mini-wrapper {
  height: 100%;              /* preenche o pai */
  width: 100%;
  overflow: hidden;
}
```

E o scale do mini card em cada breakpoint, calculado como:
```
scale = (viewport_height × 0.30 - gap) / card_dom_height
```

Onde gap ≈ 30px (label + padding do container) e card_dom_height é o valor da tabela da Etapa 6.

---

## Resumo das Violações Encontradas

| Tipo | Arquivo | Linha | Detalhe | Gravidade |
|---|---|---|---|---|
| Height fixo | TopTrumps.css | 2377 | `.tt-card--mini-wrapper height: 295px` | 🔴 Alta |
| Scale fixo | TopTrumps.css | 2385 | `.tt-card--mini scale(0.76)` — único valor p/ todos breakpoints | 🔴 Alta |
| Height fixo | TopTrumps.css | 2406-2426 | Player card heights em `calc(720px * N)` sem consultar viewport | 🟡 Média |
| Scale fixo | TopTrumpsCard.css | 280-308 | Card template scales por media query (aceitável mas não ideal) | 🟢 Baixa |
| flex-shrink:0 | TopTrumps.css | 2369 | `.tt-opponent-mini-wrapper` sem flex-grow | 🟡 Média |
| min-height fixo | TopTrumps.css | 2438 | `.tt-vs-heartbeat min-height: 48px` | 🟢 Baixa |
| CSS inline | Todos JSX | — | Nenhum style={{}} encontrado | ✅ Zero |
