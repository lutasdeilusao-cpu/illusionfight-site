# INV — Diagnóstico: Corte da Carta no Desktop — Scale Duplo e Overflow

**Data:** 2026-06-26
**Versão:** 10.179.5
**Propósito:** Investigação pura — entender exatamente por que a carta do jogador é cortada em viewport >460px.

---

## ETAPA 2 — Tamanho Real do Card por Breakpoint

### Tabela de tamanhos (mini card e player card)

| Breakpoint | Card wrapper (TopTrumpsCard) | Player override (TopTrumps) | Player scale | Player visual H | Mini scale | Mini visual H |
|---|---|---|---|---|---|---|
| ≤460px | 297×389px | width:374px; height:100% | scale(0.68) | 720×0.68=**490px** | scale(0.71) | 389×0.71=**276px** |
| 461-768px | 341×446px | width:429px; height:100% | scale(0.78) | 720×0.78=**562px** | scale(0.69) | 446×0.69=**308px** |
| 769-1200px | 413×540px | width:484px; height:100% | scale(0.88) | 720×0.88=**634px** | scale(0.65) | 540×0.65=**351px** |
| >1200px | **550×720px** | **NENHUM override** | **NENHUM** | **720px** | scale(0.65) | 720×0.65=**468px** |

### Especificidade dos seletores

| Seletor | Especificidade | Onde |
|---|---|---|
| `.tt-card-wrapper` | (0,1,0) | TopTrumpsCard.css — base/media queries |
| `.tt-player-card-wrapper .tt-card-wrapper` | (0,2,1) | TopTrumps.css — override |
| `.tt-card-template` | (0,1,0) | TopTrumpsCard.css |
| `.tt-player-card-wrapper .tt-card-template` | (0,2,1) | TopTrumps.css |

Para o **player card**: o TopTrumps.css ganha em todos os breakpoints onde tem override (≤460, 461-768, 769-1200). Para >1200px, **não há override** — o player card cai para o base 550×720px SEM scale.

Para o **mini card**: o TopTrumpsCard.css se aplica diretamente (não tem override específico). O `.tt-card--mini` aplica scale sobre o tamanho DOM do card wrapper.

---

## ETAPA 3 — Estrutura do Player Card Wrapper

**L2402-2412:**
```css
.tt-player-card-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;          /* ← CORTA O CARD */
}
.tt-player-card-wrapper .tt-card-wrapper { max-height: 100%; }
.tt-player-card-wrapper .tt-card-wrapper .tt-card-template img { max-height: 100%; object-fit: contain; }
```

- `flex: 1` ✅ — adaptativo
- `min-height: 0` ✅ — necessário para flex:1
- `overflow: hidden` ✅ — mas é isso que CORTA o card quando ele é maior que o wrapper

---

## ETAPA 4 — Container max-width: 480px

O `.tt-game-container` tem `max-width: 480px; margin: 0 auto`. Mas as media queries USAM a viewport width, não a largura do container.

| Viewport real | Container | Media query que o card usa |
|---|---|---|
| 430px | 430px | ≤460px (viewport < 460) |
| **480px** | **480px** | **461-768px** (viewport > 460) |
| 500px | 480px | 461-768px |
| 768px | 480px | 461-768px |
| 769px | 480px | 769-1200px |
| 1440px | 480px | **>1200px (BASE — sem override)** |

**Problema 1:** Em viewport de 480px, o container tem exatamente 480px de largura (seu max-width), mas o card usa o breakpoint 461-768px (porque a viewport é 480, não ≤460). O player card scale(0.78) produz 550×0.78 = 429px de largura visual. Mas o wrapper foi definido com `width: calc(550px * 0.78) = 429px`. Isso é MENOR que 480px ✅ — cabe.

**Problema 2:** Em viewport de 1440px, NENHUMA media query de card se aplica. O player cai para o base 550×720px SEM scale override. Largura 550px > container 480px → **corta 70px de largura**. Altura 720px > espaço disponível → cortado.

---

## ETAPA 5 — Cálculo Numérico para Viewport 768px

### Premissas:
- Viewport: 768×1024 (iPad vertical)
- Container: max 480px, height 100dvh = 1024px
- Breakpoint: **461-768px** (viewport 768 ≤ 768)

### Player card:
1. **Card wrapper height:** TopTrumpsCard diz 446px, TopTrumps override diz `height: 100%` (especificidade maior) → `height: 100%` = altura do `.tt-player-card-wrapper`
2. **Player wrapper height:** `flex: 1` → 1024 - 40(header) - 56(VS) - 307(mini 30dvh) - 50(footer) - 16(pads) = **555px**
3. **Card wrapper width:** `width: calc(550 * 0.78) = 429px` — cabe em 480px ✅
4. **Card template scale:** `scale(0.78)` sobre 550×720 → **429×562px visual**
5. **Comparação:** 562px visual > 555px wrapper → ❌ **CORTADO em 7px**

### Mini card:
1. **Card wrapper height:** TopTrumpsCard.css → `height: 446px`
2. **Mini wrapper height:** `30dvh` → 1024 × 0.30 = **307px**
3. **Mini card scale:** 461-768px → `scale(0.69)`
4. **Mini card visual:** 446 × 0.69 = **308px**
5. **Comparação:** 308px visual > 307px wrapper → ❌ **CORTADO em 1px**

O corte no player card é de apenas 7px, e no mini card de 1px. Mas isso é em iPad 768×1024 com a refatoração dvh aplicada.

### Cálculo para DESKTOP COMUM (1440×900):

1. Viewport: 1440×900
2. Container: max 480px, height 100dvh = 900px
3. Breakpoint: **>1200px** (viewport 1440 > 1200)

### Player card:
1. **Card wrapper height:** TopTrumpsCard base → `height: 720px`
2. **Player override:** NENHUM para >1200px → **NENHUM scale!** NENHUM width/height override!
3. **Card wrapper width:** base `width: 550px` > container 480px → ❌ **CORTADO 70px de largura**
4. **Card template:** NENHUM scale → renderiza em 550×720px
5. **Player wrapper height:** 900 - 40 - 56 - 270(30dvh) - 50 - 16 = **468px**
6. **Comparação:** 720px > 468px → ❌ **CORTADO 252px de altura**

### Mini card:
1. **Card wrapper height:** TopTrumpsCard base → `height: 720px`
2. **Mini wrapper height:** 30dvh = 270px (900×0.30)
3. **Mini card scale:** base `scale(0.65)`
4. **Mini card visual:** 720 × 0.65 = **468px**
5. **Comparação:** 468px > 270px → ❌ **CORTADO 198px**

---

## ETAPA 6 — Causa Raiz

### Questão 1: O card entra em qual breakpoint quando viewport tem 768px?
**Breakpoint 461-768px** (viewport 768 ≤ 768). O TopTrumpsCard.css define `height: 446px` e `scale(0.62)` para `.tt-card-wrapper` e `.tt-card-template`. O TopTrumps.css override para player card define `scale(0.78)` e `height: 100%`. **Linhas:** TopTrumpsCard.css L286-297 e TopTrumps.css L2425-2434.

### Questão 2: O TopTrumps.css sobrescreve o height?
**Sim, para o player card.** `.tt-player-card-wrapper .tt-card-wrapper` (especificidade 0,2,1) ganha de `.tt-card-wrapper` (0,1,0). O TopTrumps.css define `height: 100%` nos 3 breakpoints com override. **MAS para >1200px não há override** — o player card cai para o base `height: 720px` (TopTrumpsCard.css L8). **Linha crítica:** TopTrumps.css L2435-2444 tem override apenas até 1200px; >1200px SEM override.

### Questão 3: O scale() é aplicado sobre o DOM height real ou sobre 720px?
**Sobre 720px (o base).** O `.tt-card-template` tem `width: 550px; height: 720px` (L18-19 do TopTrumpsCard.css). O `scale()` é aplicado neste elemento via `transform`. O `transform: scale(N)` no `.tt-card-template` reduz visualmente de 720px para 720×N. **O DOM box não muda** — o elemento continua com 550×720 no layout, mas o overflow:hidden do pai corta o excesso visual.

### Questão 4: O .tt-player-card-wrapper tem overflow: hidden?
**Sim, L2409:** `overflow: hidden`. A altura do wrapper é determinada por `flex: 1` (L2403). Com a refatoração dvh, em desktop 1440×900 o wrapper tem 468px disponíveis. O card renderiza 720px visual. O overflow:hidden corta 252px.

### Questão 5: Em viewport de 480px (exato), qual breakpoint?
**461-768px.** A viewport de 480px NÃO é ≤460, então cai no breakpoint 461-768. O player card usa `scale(0.78)` → 429×562px. O wrapper (flex:1) com 30dvh mini e demais elementos tem ~555px. O card (562px) é cortado em ~7px. **Não é o breakpoint ideal** — o ideal seria que viewport 480 (que é o max-width do container) usasse os valores do breakpoint ≤460px. Mas as media queries usam viewport width, não container width.

---

## Resumo — Causa Raiz Confirmada

**Há 3 problemas simultâneos que causam o corte no desktop:**

### Problema 1 — Missing media query para >1200px (🔴 Crítico)
O `TopTrumps.css` define overrides para o player card nos breakpoints ≤460, 461-768, e 769-1200. **Não há override para >1200px.** Em viewports >1200px, o player card cai para o base:
- `.tt-card-wrapper { width: 550px; height: 720px }` (TopTrumpsCard.css L7-8)
- SEM scale no `.tt-card-template`
- O card renderiza em 550×720 DENTRO de um container de max 480px
- `overflow: hidden` corta 70px de largura e centenas de px de altura

**Linha:** TopTrumps.css L2435-2444 — o último media query vai até 1200px. Após 1200px, não há regras.

### Problema 2 — Media queries usam viewport width, não container width (🟡 Médio)
O `.tt-game-container` tem `max-width: 480px`, mas as media queries do card usam `@media (max-width: 460px)` baseado na viewport. Em viewport de 500px (navegador não maximizado), o container tem 480px (max-width) mas o card usa o breakpoint 461-768 com scale(0.78) — mais agressivo que o necessário. Um container de 480px deveria usar o mesmo scale que um viewport ≤460.

### Problema 3 — Scale aninhado entre 2 arquivos CSS (🟡 Médio)
O `TopTrumpsCard.css` define `scale(0.62)` para 461-768px no `.tt-card-template`. O `TopTrumps.css` override define `scale(0.78)` no `.tt-player-card-wrapper .tt-card-template`. Para o player card, o scale(0.78) vence. Mas para o MINI card, só o scale(0.62) do TopTrumpsCard.css se aplica ANTES do `.tt-card--mini scale(0.69)` — resultando em scale DUPLO: o card wrapper é reduzido para 446px pelo media query, DEPOIS o `.tt-card--mini` escala 446×0.69 = 308px.

**Este scale duplo (TopTrumpsCard.css + .tt-card--mini) é o bug arquitetural principal.**
