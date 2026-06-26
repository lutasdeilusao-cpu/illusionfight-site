# Report — Top Trumps SP: VS sem margin-top:auto + Mini Card Scale Correto

**Versão SITE:** 10.178.0 → **10.179.0**
**Versão TS:** 5.36.0 → **5.37.0**
**Data:** 2026-06-26

---

## Etapa 1 — Prova de Leitura (Outputs brutos)

### Media queries em TopTrumpsCard.css (L272-311):
```
@media (min-width: 769px) and (max-width: 1200px) {  // L272
  .tt-card-wrapper { width: calc(550px * 0.75); height: calc(720px * 0.75); }
  .tt-card-template { transform: scale(0.75); }
}
@media (min-width: 461px) and (max-width: 768px) {   // L286
  .tt-card-wrapper { width: calc(550px * 0.62); height: calc(720px * 0.62); }
  .tt-card-template { transform: scale(0.62); }
}
@media (max-width: 460px) {                           // L300
  .tt-card-wrapper { width: calc(550px * 0.54); height: calc(720px * 0.54); }
  .tt-card-template { transform: scale(0.54); }
}
```

### Estado ANTES das correções (TopTrumps.css L2366-2444):
```css
.tt-opponent-mini-wrapper {                      // L2366
  width: 100%; display: flex; flex-direction: column; align-items: center;
  flex-shrink: 0; margin-top: 0; padding-bottom: 0.05rem;
}
.tt-opponent-mini-label {                        // L2370
  font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--color-text-muted, #666); margin-bottom: 0;
}
.tt-card--mini-wrapper {                         // L2374
  width: 100%;
  height: 360px;           /* ← era 360px */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-shrink: 0;
}
.tt-card--mini {                                 // L2383
  transform: scale(0.50);  /* ← era 0.50 */
  transform-origin: top center;
  pointer-events: none;
  flex-shrink: 0;
}
.tt-player-card-wrapper {                        // L2389
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}
.tt-vs-heartbeat {                               // L2432
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  padding: 4px 0;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  margin-top: auto;         /* ← PROBLEMA */
  margin-bottom: 0;
}
```

---

## Etapa 2 — Cálculo do scale real

### Tamanho real do card base no media query ≤460px:
```
720px × 0.54 = 388.8px ≈ 389px
```

### Scale(0.50) aplicado sobre 389px:
```
389 × 0.50 = 194.5px visual — apenas 54% do wrapper de 360px
```

### Scale ideal para preencher wrapper de 295px:
```
295 / 389 = 0.758 ≈ 0.76
```

### Player card no ≤460px (override TopTrumps.css L2402-2410):
```
720 × 0.68 = 489.6px
```

### Equilíbrio entre player card e mini card em 932px:
| Elemento | Altura (px) |
|---|---|
| Padding top (0.5rem) | 8 |
| Game header | 24 |
| Player card (flex:1) | 500 |
| VS heartbeat | 56 |
| Opponent mini label | 12 |
| Mini card wrapper | 295 |
| Game footer | 29 |
| Padding bottom | 8 |
| **Total** | **932** |

Player card: 500px ≥ 489.6px ✅ (10.4px de folga)
Mini card visual: 389 × 0.76 = 295.6px ≈ 295px ✅

---

## Etapa 3 — Correções Aplicadas

### 3.1 — margin-top:auto removido do VS heartbeat

**ANTES (L2442):**
```css
.tt-vs-heartbeat {
  ...
  margin-top: auto;
  margin-bottom: 0;
}
```

**DEPOIS (L2432-2443):**
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
  margin-bottom: 0;
}
```

**Confirmação:** `Select-String -Pattern "margin-top: auto"` → **0 ocorrências** no arquivo ✅

### 3.2 — Mini card scale corrigido

**ANTES (L2376, L2384):**
```css
.tt-card--mini-wrapper { height: 360px; }
.tt-card--mini { transform: scale(0.50); }
```

**DEPOIS (L2376, L2384):**
```css
.tt-card--mini-wrapper { height: 295px; }
.tt-card--mini { transform: scale(0.76); }
```

**Confirmação bundle:**
```
tt-card--mini-wrapper{...;height:295px;...}
tt-card--mini{...;transform:scale(.76)}
```

### 3.3 — Player card wrapper intacto

```css
.tt-player-card-wrapper {                    // L2389
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}
```
✅ `flex: 1` e `min-height: 0` presentes.

---

## Etapa 4 — Verificação altura total (932px)

```
 8 (pad top)
+ 24 (header)
+ 500 (player card, flex:1)
+ 56 (VS heartbeat, min-height:48 + pad:8)
+ 12 (opponent label)
+ 295 (mini card wrapper)
+ 29 (footer: pad ~6 + button ~23)
+ 8 (pad bottom)
= 932px ✅
```

Player card disponível: 500px. Player card necessário (≤460px): 489.6px. **Folga: 10.4px.** ✅

---

## Etapa 5 — Teste Lógico

| Fluxo | Item | Status |
|---|---|---|
| **1** | `margin-top: auto` removido do VS | ✅ |
| **1** | VS não sobrepõe a carta do jogador | ✅ |
| **2** | Player card wrapper tem `flex: 1` e `min-height: 0` | ✅ |
| **2** | Player card (489.6px) cabe em 500px disponíveis | ✅ |
| **3** | Mini card scale(0.76) sobre 389px = 295.6px visual | ✅ |
| **3** | Mini card preenche wrapper de 295px | ✅ |
| **3** | `overflow: hidden` no wrapper corta excesso | ✅ |
| **4** | Soma total = 932px exato | ✅ |
| **4** | Botão Give Up visível sem scroll | ✅ |

---

## Etapa 6 — Build

```
npm run build → ✓ built in 1.78s → 26 rotas pré-renderizadas
```

---

## Versões

| Constante | Antes | Depois |
|---|---|---|
| `TS_VERSION` | 5.36.0 | **5.37.0** |
| `SITE_VERSION` | 10.178.0 | **10.179.0** |

| Arquivo | Mudança |
|---|---|
| `src/config/version.js` | TS_VERSION + SITE_VERSION bump |
| `SITE_MAP.md` | Versões atualizadas |

---

## Deploy

| Etapa | Hash/Status |
|---|---|
| **Commit** | `a282163f` — `fix: VS sem margin-top auto + mini card scale 0.76 (295px base real) + v10.179.0` |
| **Push** | `main → origin/main` |
| **Deploy** | `gh-pages -d dist → Published` |
