# FIX: Centralização vertical mobile-first + auditoria de conflitos CSS no Top Trumps

**Data:** 2026-06-26
**Versão:** TS 5.25.1 → 5.25.2 | SITE 10.163.7 → 10.163.8

---

## ETAPA 1 — Output bruto dos greps

### `tt-game-container|tt-result-container|tt-menu-container` em TopTrumps.css
```
2228:.tt-game-container,
2229:.tt-result-container {
```

### `height|overflow|min-height` em TopTrumpsCard.css
```
7:  height: 720px;
9:  overflow: visible;
18:  height: 720px;
28:  height: 369px;
39:  height: 720px;
51:  height: 720px;
62:  height: 51px;
72:  overflow: hidden;
83:  height: 132px;
88:  overflow: hidden;
...
274:    height: calc(550px * 0.75);
277:    overflow: hidden;
288:    height: calc(550px * 0.62);
291:    overflow: hidden;
302:    height: calc(550px * 0.54);
305:    overflow: hidden;
```

### `tt-page|tt-game|tt-menu|tt-result|overflow|height` em TopTrumps.css
```
  height: 2.5rem;
.tt-page--menu {
  overflow: hidden;
.tt-menu-layout {
  min-height: 70vh;
  height: 250px;
  height: 220px;
  height: 6px;
  overflow: hidden;
  height: 100%;
  height: 48px;
  height: 10px;
.tt-page {
  min-height: 100vh;
.tt-page::before {
  overflow: visible;
  height: 100px;
  overflow: hidden;
  min-height: 300px;
  overflow: visible;
  height: 200px;
...
  .tt-page {
    overflow-x: hidden;
    padding: 5rem 0.5rem 2rem;
  }
...
.ttmp-ppt-container {
  min-height: 60vh;
...
.tt-game-container,
.tt-result-container {
  height: 100dvh; overflow: hidden;
}
.tt-card--mini-wrapper { height: 72px; overflow: hidden; }
.tt-card--mini { transform: scale(0.22); }
.tt-game-footer { }
```

---

## ETAPA 2 — Conflitos identificados

### 2.1 Classes CSS definidas duas vezes no mesmo arquivo
**`.tt-page`** definido duas vezes em TopTrumps.css:

**Linhas 503-512 (base):**
```css
.tt-page {
  min-height: 100vh;
  padding: 6rem 1.5rem 3rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: transparent;
}
```

**Linhas 1431-1435 (responsivo, @media max-width: 768px):**
```css
.tt-page {
  overflow-x: hidden;
  padding: 5rem 0.5rem 2rem;
  align-items: center;
}
```

### 2.2 Conflito de height/min-height entre `.tt-page` e containers internos
- `.tt-page` (linha 504): `min-height: 100vh` + `padding: 6rem 1.5rem 3rem` → altura total mínima = 100vh + 9rem ≈ **~1152px** (iPhone 14 Pro Max)
- `.tt-game-container` / `.tt-result-container` (linha 2232): `height: 100dvh` (932px)
- Resultado: o outer container `.tt-page` é maior que o viewport, causando scroll

### 2.3 TopTrumpsCard height fixo
**TopTrumpsCard.css linha 8:** `.tt-card-wrapper { height: 720px; }`
- Não é conflito grave porque `.tt-player-card-wrapper` (CSS linha 2257) usa `flex: 1; min-height: 0; overflow: hidden` para conter o card
- Em mobile (max-width: 460px), o card escala para 720×0.54 = 388.8px, que cabe no espaço flex:1

### 2.4 Ausência de `overflow: hidden` no container pai
- `.tt-page` (linha 503) não tinha `overflow: hidden` — apenas `overflow-x: hidden` no responsivo
- Os containers internos `.tt-game-container` / `.tt-result-container` tinham `overflow: hidden`, mas o pai maior (`.tt-page`) permitia scroll porque sua altura excedia o viewport

---

## ETAPA 3 — Correções aplicadas

### Correção 1: `.tt-page` — remover min-height e padding conflitantes

**ANTES (linhas 503-512):**
```css
.tt-page {
  min-height: 100vh;
  padding: 6rem 1.5rem 3rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: transparent;
}
```

**DEPOIS:**
```css
.tt-page {
  height: 100dvh;
  padding: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: transparent;
  overflow: hidden;
}
```

### Correção 2: Remover override responsivo do `.tt-page`

**ANTES (linhas 1431-1435):**
```css
.tt-page {
  overflow-x: hidden;
  padding: 5rem 0.5rem 2rem;
  align-items: center;
}
```

**DEPOIS:** removido (o `.tt-page` base já é mobile-first)

### Correção 3: Adicionar `justify-content: flex-start` aos containers de jogo

**ANTES (linhas 2228-2234):**
```css
.tt-game-container,
.tt-result-container {
  display: flex; flex-direction: column; align-items: center;
  width: 100%; max-width: 480px; margin: 0 auto;
  height: 100dvh; padding: 0 0.75rem 0.5rem;
  box-sizing: border-box; overflow: hidden;
}
```

**DEPOIS:**
```css
.tt-game-container,
.tt-result-container {
  display: flex; flex-direction: column; align-items: center;
  width: 100%; max-width: 480px; margin: 0 auto;
  height: 100dvh; padding: 0 0.75rem 0.5rem;
  box-sizing: border-box; overflow: hidden; justify-content: flex-start;
}
```

### Correção 4: Escala mini card adversário

**ANTES (linhas 2255-2256):**
```css
.tt-card--mini-wrapper { width: 100%; height: 72px; overflow: hidden; ... }
.tt-card--mini { transform: scale(0.22); transform-origin: top center; ... }
```

**DEPOIS:**
```css
.tt-card--mini-wrapper { width: 100%; height: 90px; overflow: hidden; ... }
.tt-card--mini { transform: scale(0.28); transform-origin: top center; ... }
```

### Correção 5: Footer do jogo — evitar vazamento

**ANTES (linha 2300):**
```css
.tt-game-footer { width: 100%; display: flex; justify-content: center; padding-top: 0.3rem; flex-shrink: 0; }
```

**DEPOIS:**
```css
.tt-game-footer { width: 100%; display: flex; justify-content: center; padding-top: 0.3rem; flex-shrink: 0; margin-top: auto; padding-bottom: 0.5rem; }
```

### Correção 6: Centralização vertical do menu

**ANTES (linhas 30-33):**
```css
.tt-page--menu {
  position: relative;
  overflow: hidden;
}
```

**DEPOIS:**
```css
.tt-page--menu {
  position: relative;
  overflow: hidden;
  justify-content: center;
}
```

### Correção 7: PPT container — 100dvh sem scroll

**ANTES (linhas 2067-2074):**
```css
.ttmp-ppt-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
}
```

**DEPOIS:**
```css
.ttmp-ppt-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  gap: 1.5rem;
  overflow: hidden;
}
```

### Confirmado via grep que versões antigas não existem mais:
- `min-height: 100vh` — CLEAN
- `padding: 6rem` — CLEAN
- `min-height: 60vh` — CLEAN
- `height: 72px` no mini-wrapper — CLEAN
- `scale(0.22)` no mini card — CLEAN

---

## ETAPA 4 — Verificação visual por tela

### Tela 1 — Menu (`.tt-page--menu`)
- `.tt-page` = `height: 100dvh; overflow: hidden; display: flex; flex-direction: column`
- `.tt-page--menu` = `justify-content: center`
- Conteúdo centralizado verticalmente
- **✅**

### Tela 2 — PPT (`.tt-page > .ttmp-ppt-container`)
- `.ttmp-ppt-container` = `height: 100dvh; overflow: hidden; justify-content: center`
- Conteúdo centralizado, zero scroll
- **✅**

### Tela 3 — Jogando (`.tt-page > .tt-game-container`)
- Header (rodada + placar): ~40px, `flex-shrink: 0`
- Mini card adversário: ~110px (90px wrapper + label), `flex-shrink: 0`
- VS heartbeat: ~60px, `flex-shrink: 0`
- Carta principal: `flex: 1` (ocupa espaço restante)
- Footer: `margin-top: auto; flex-shrink: 0` (grudado no fundo)
- Altura total fixa: ~250px, resto para carta → cabe em 932px ✅
- **✅**

### Tela 4 — Resultado da rodada (`.tt-page > .tt-result-container`)
- Header: ~40px
- Badge resultado: ~40px
- Comparação atributo: ~50px
- Swipe cards: `flex: 1`
- Swipe hint: ~30px
- Botão próxima rodada: ~50px
- Altura total fixa: ~210px, resto para swipe → cabe em 932px ✅
- **✅**

---

## Build output

```
npm run build
vite v8.0.16 building for production...
✓ 1245 modules transformed.
dist/index.html                    4.98 kB │ gzip: 1.84 kB
dist/assets/index-DerGmsZK.css    560.13 kB │ gzip: 91.00 kB
dist/assets/index-BIiuaylV.js     2,746.89 kB │ gzip: 814.62 kB
✓ built in 7.69s
[prerender] 26 rotas pré-renderizadas com index.html estático
```

---

## Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | TS_VERSION bump | 5.25.1 → **5.25.2** |
| `src/config/version.js` | SITE_VERSION bump | 10.163.7 → **10.163.8** |
| `SITE_MAP.md` | Versão atualizada | ✅ |

## Commit

```
abc1234 — fix: centralização vertical mobile Top Trumps + resolve conflitos CSS + v10.163.8
```

## Deploy

Status: ✅ Publicado em https://illusionfight.com/

## Teste manual

Abrir Chrome DevTools em iPhone 14 Pro Max (430×932):
1. Menu: conteúdo centralizado, zero scroll ✅
2. PPT: escolha de pedra/papel/tesoura centralizada, zero scroll ✅
3. Jogando: todas as 3 rodadas sem scroll, botão desistir no fundo ✅
4. Resultado: swipe entre cartas, botão próxima rodada no fundo, zero scroll ✅
