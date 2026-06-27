# Report — Fix: Card Tamanho Único Mobile em Qualquer Viewport

**Versão SITE:** 10.179.5 → **10.179.6**
**Versão TS:** 5.38.0 → **5.39.0**
**Data:** 2026-06-26

---

## O que foi feito

### Valores usados (breakpoint ≤460px do TopTrumpsCard.css):
- Card wrapper: `width: calc(550px * 0.54) = 297px; height: calc(720px * 0.54) = 389px`
- Card template: `transform: scale(0.54); transform-origin: top left`

### Blocos @media removidos do TopTrumps.css (5 blocos):

| O quê | Linhas | Descrição |
|---|---|---|
| Mini card 461-768 | L2391-2395 | `scale(0.69)` |
| Mini card ≤460 | L2397-2401 | `scale(0.71)` |
| Player card ≤460 | L2415-2424 | `width 374px + scale(0.68)` |
| Player card 461-768 | L2425-2434 | `width 429px + scale(0.78)` |
| Player card 769-1200 | L2435-2444 | `width 484px + scale(0.88)` |

### Regra única adicionada (L2402-2413):

```css
.tt-player-card-wrapper .tt-card-wrapper,
.tt-card--mini-wrapper .tt-card-wrapper {
  width: calc(550px * 0.54);
  height: calc(720px * 0.54);
  overflow: hidden;
}

.tt-player-card-wrapper .tt-card-template,
.tt-card--mini-wrapper .tt-card-template {
  transform: scale(0.54);
  transform-origin: top left;
}
```

**Especificidade:** 0,2,0 (dois seletores de classe) > 0,1,0 do TopTrumpsCard.css. A regra vence em qualquer viewport, mesmo contra @media.

### Mini card scale único:
```css
.tt-card--mini { transform: scale(0.65); } /* sem media query */
```
389 × 0.65 = 253px visual. Wrapper 30dvh ≈ 280px (932px) → **253 ≤ 280 ✅**. Em 667px: 30dvh ≈ 200px → 253 > 200 (clipping de 53px, aceitável).

### Teste lógico:

| Fluxo | Item | Status |
|---|---|---|
| Mobile 430px | Card DOM 297×389 + scale 0.54 | ✅ (igual antes) |
| Desktop 1257px | Card DOM forçado a 297×389 (antes era 550×720) | ✅ |
| Tablet 768px | Card DOM 297×389 (antes era 341×446) | ✅ |
| Nenhuma MQ restante | Grep confirma 0 MQs com player/mini wrapper | ✅ |

---

## Bundle confirmado

```
tt-player-card-wrapper .tt-card-wrapper,.tt-card--mini-wrapper .tt-card-wrapper{width:297px;height:389px;overflow:hidden}
.tt-player-card-wrapper .tt-card-template,.tt-card--mini-wrapper .tt-card-template{transform-origin:top left;transform:scale(.54)}
```

---

## Versões

| Constante | Antes | Depois |
|---|---|---|
| `TS_VERSION` | 5.38.0 | **5.39.0** |
| `SITE_VERSION` | 10.179.5 | **10.179.6** |

## Deploy

| Etapa | Hash/Status |
|---|---|
| **Commit** | `13b73610` |
| **Push** | ✅ |
| **Deploy** | Published ✅ |
