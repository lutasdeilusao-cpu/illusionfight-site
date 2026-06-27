# Report — Refactoring Layout Fase Jogando: dvh + Scales por Breakpoint

**Versão SITE:** 10.179.4 → **10.179.5**
**Versão TS:** 5.37.2 → **5.38.0**
**Data:** 2026-06-26

---

## 4 Correções Aplicadas

### Correção 1 — `.tt-opponent-mini-wrapper` (L2367-2371)

**ANTES:**
```css
.tt-opponent-mini-wrapper {
  width: 100%; display: flex; flex-direction: column; align-items: center;
  flex-shrink: 0; margin-top: 0; padding-bottom: 0.05rem;
}
```

**DEPOIS:**
```css
.tt-opponent-mini-wrapper {
  width: 100%; display: flex; flex-direction: column; align-items: center;
  flex: 0 0 30dvh; min-height: 140px; max-height: 350px;
  overflow: hidden; margin-top: 0; padding-bottom: 0.05rem;
}
```

### Correção 2 — `.tt-card--mini-wrapper` (L2376-2383)

**ANTES:** `height: 295px` — hardcoded para 932px
**DEPOIS:** `height: 100%` — preenche o pai que agora controla altura via dvh

### Correção 3 — `.tt-card--mini` (L2384-2400)

**ANTES:** `scale(0.76)` — único valor para todos os breakpoints

**DEPOIS:**
```css
.tt-card--mini { transform: scale(0.65); }                    /* >768px */
@media (min-width: 461px) and (max-width: 768px) { scale(0.69); }  /* tablet */
@media (max-width: 460px) { scale(0.71); }                         /* mobile */
```

### Correção 4 — Player card heights (L2418, L2428, L2438)

**ANTES:** `height: calc(720px * 0.68/0.78/0.88)` em cada media query
**DEPOIS:** `height: 100%` em todos os três breakpoints

---

## Cálculo de Distribuição

### Mobile 430×932 (iPhone 14 Pro Max):

| Elemento | Altura |
|---|---|
| `100dvh` | 932px |
| Header | ~40px |
| VS heartbeat | ~56px |
| Mini wrapper (30dvh) | **280px** |
| Footer | ~50px |
| Paddings | ~16px |
| **Total fixo** | **~442px** |
| **Player card (flex:1)** | **490px** |
| Mini scale (0.71) 389×0.71 | **276px visual** |

### Tablet 768×1024 (iPad):

| Elemento | Altura |
|---|---|
| `100dvh` | 1024px |
| Mini wrapper (30dvh) | **307px** |
| **Player card (flex:1)** | **555px** |
| Mini scale (0.69) 446×0.69 | **308px visual** |

---

## Teste Lógico

| Fluxo | Item | Status |
|---|---|---|
| **1** | `.tt-card--mini-wrapper` sem height px | ✅ `height: 100%` |
| **1** | `.tt-opponent-mini-wrapper` com 30dvh | ✅ `flex: 0 0 30dvh` |
| **1** | Player card com height:100% nas 3 MQs | ✅ |
| **2** | Mobile 932px: mini wrapper 280px | ✅ |
| **2** | Mobile 932px: scale 0.71 → 276px visual | ✅ |
| **2** | Mobile 932px: player card 490px disponível | ✅ |
| **3** | Tablet 1024px: mini wrapper 307px | ✅ |
| **3** | Tablet 1024px: scale 0.69 → 308px visual | ✅ |
| **4** | Nenhum height em px nos elementos de layout | ✅ (só decorativos) |

---

## Build

```
npm run build → ✓ built in 1.80s → 26 rotas pré-renderizadas
```

## Bundle confirmado
```
opponent-mini-wrapper{flex:0 0 30dvh;min-height:140px;max-height:350px;...}
card--mini-wrapper{height:100%;...}
```

---

## Versões

| Constante | Antes | Depois |
|---|---|---|
| `TS_VERSION` | 5.37.2 | **5.38.0** |
| `SITE_VERSION` | 10.179.4 | **10.179.5** |

## Deploy

| Etapa | Hash/Status |
|---|---|
| **Commit** | `6071f924` |
| **Push** | ✅ |
| **Deploy** | Published ✅ |
