# FIX v3: Layout Fase Jogando Top Trumps SP — Botão Som + VS Glow + Mini Card + VS Posição

**Data:** 2026-06-26
**Versão SITE:** 10.175.0 → **10.176.0**
**Versão TS:** 5.33.0 → **5.34.0**
**Tipo:** FIX (correção cirúrgica com base na investigação v2)

---

## 1️⃣  Outputs brutos — ETAPA 1 (prova de leitura)

### JSX (linhas 870–922)
```
870:         </div>
871:         <section className="tt-page">
872:         <button className="tt-sound-toggle" ...>     ← ANTES: FORA do container
873:           {somAtivo ? '🔊' : '🔇'}
874:         </button>
875:         <div className="tt-game-container">
876:           <div className="tt-game-header">
...
922:         </div>
```

### CSS (linhas 2429–2469)
```
2429: .tt-vs-heartbeat {
2430:   display: flex;
2431:   align-items: center;
2432:   justify-content: center;
2433:   width: 100%;
2434:   min-height: 48px;
2435:   padding: 6px 0;
2436:   flex-shrink: 0;
2437:   position: relative;
2438:   z-index: 2;
2439: }
2440: .tt-vs-heartbeat-glow {
2441:   display: none;                       ← DESLIGADO
2442: }
2443: .tt-vs-heartbeat-glow::after {
2444:   display: none;                       ← DESLIGADO
2445: }
...
2467: .tt-game-footer { ... margin-top: auto; ... }  ← CONCORRIA COM flex:1
```

---

## 2️⃣  Correções aplicadas

### Correção 1 — Botão de som: mover para dentro do container + position absolute

**Arquivo:** `TopTrumps.jsx` (linha 872–875) + `TopTrumps.css` (linhas 2–18)

**ANTES (JSX):**
```jsx
<section className="tt-page">
<button className="tt-sound-toggle" ...>    ← fora do container
  {somAtivo ? '🔊' : '🔇'}
</button>
<div className="tt-game-container">
```

**ANTES (CSS):**
```css
.tt-sound-toggle {
  position: fixed;        ← flutuava na viewport
  top: 1rem;
  right: 1rem;
  z-index: 999;
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1.2rem;
}
```

**DEPOIS (JSX):**
```jsx
<section className="tt-page">
<div className="tt-game-container">
  <button className="tt-sound-toggle" ...>    ← dentro do container
    {somAtivo ? '🔊' : '🔇'}
  </button>
  <div className="tt-game-header">
```

**DEPOIS (CSS):**
```css
.tt-sound-toggle {
  position: absolute;     ← ancorado no container
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  width: 2.2rem;
  height: 2.2rem;
  font-size: 1.1rem;
}

.tt-game-container {
  position: relative;     ← necessário para anchor do absolute
  ...
}
```

**Confirmação:** `.tt-sound-toggle` → `position: absolute;` linha 3. `.tt-game-container` → `position: relative;` linha 2334.

---

### Correção 2 — VS heartbeat glow: ativar círculo de pulsação

**Arquivo:** `TopTrumps.css` (linhas 2443–2458)

**ANTES:**
```css
.tt-vs-heartbeat-glow {
  display: none;
}
.tt-vs-heartbeat-glow::after {
  display: none;
}
```

**DEPOIS:**
```css
.tt-vs-heartbeat-glow {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,133,58,0.25) 0%, transparent 70%);
  animation: tt-vs-heartbeat-pulse 1.8s ease-in-out infinite;
  z-index: 1;
}
.tt-vs-heartbeat-glow::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 1.5px solid rgba(232,133,58,0.3);
  animation: tt-vs-heartbeat-pulse 1.8s ease-in-out infinite 0.2s;
}
```

**Confirmação:** `.tt-vs-heartbeat-glow` linha 2443 com `position: absolute; z-index: 1`.

---

### Correção 3 — VS mais colado à carta: margin-top:auto

**Arquivo:** `TopTrumps.css` (linhas 2429–2441)

**ANTES:**
```css
.tt-vs-heartbeat {
  ...
  padding: 6px 0;
  ...
  z-index: 2;
}
```

**DEPOIS:**
```css
.tt-vs-heartbeat {
  ...
  padding: 4px 0;
  ...
  z-index: 2;
  margin-top: auto;
  margin-bottom: 0;
}
```

**Footer:** `margin-top: auto` removido (linha 2481):
```css
.tt-game-footer { width: 100%; display: flex; justify-content: center; padding-top: 0.15rem; flex-shrink: 0; padding-bottom: 0.2rem; }
```

**Confirmação:** `.tt-vs-heartbeat` com `margin-top: auto` na linha 2440. `.tt-game-footer` sem `margin-top: auto` na linha 2481.

---

### Correção 4 — Mini card maior: height 240px

**Arquivo:** `TopTrumps.css` (linhas 2371–2379)

**ANTES:**
```css
.tt-card--mini-wrapper {
  ...
  height: 130px;
  ...
}
```

**DEPOIS:**
```css
.tt-card--mini-wrapper {
  ...
  height: 240px;
  ...
}
```

**Confirmação:** `.tt-card--mini-wrapper` linha 2372 com `height: 240px`.

---

## 3️⃣  Cálculo de altura total (932px — iPhone 14 Pro Max)

| Elemento | Altura (px) | Fonte |
|----------|------------|-------|
| Padding top | ~8 | `0.5rem` |
| Button de som | ~35 | `2.2rem` absolute no canto |
| Header | ~40 | flex-shrink:0 |
| Player card (flex:1) | **~510** | espaço restante |
| VS heartbeat (min-height:48 + pad:4×2) | ~56 | `margin-top: auto; min-height: 48px` |
| Opponent mini label | ~20 | conteúdo |
| Opponent mini wrapper | 240 | `height: 240px` explícito |
| Footer | ~35 | flex-shrink:0 |
| Padding bottom (safe-area) | ~8 | `max(0.5rem, env(...))` |
| **Total fixo** | **~422** | |
| **Restante para player card** | **~510** | ✅ Cabe 490px (scale 0.68) sobram 20px |

---

## 4️⃣  Teste lógico

### Fluxo 1 — Botão de som
- ✅ Não tapa mais a carta (está dentro do container, absolute no canto)
- ✅ Posicionado canto superior direito dentro do container
- ✅ `.tt-game-container` tem `position: relative`

### Fluxo 2 — VS heartbeat glow
- ✅ Círculo laranja pulsando aparece atrás do texto VS (`z-index: 1` vs texto `z-index: 5`)
- ✅ Anel externo animado aparece (`::after` com `inset: -8px`)
- ✅ Texto VS continua visível acima do glow

### Fluxo 3 — VS posicionamento
- ✅ VS colado abaixo da carta do jogador via `margin-top: auto`
- ✅ Footer não usa mais `margin-top: auto`

### Fluxo 4 — Mini card
- ✅ Card completo visível dentro de 240px (720×0.33 = 238px)
- ✅ `overflow: hidden` no wrapper — nada vaza

### Fluxo 5 — Zero scroll
- ✅ Total fixo (~422px) + player card flex:1 = 100dvh
- ✅ Nenhum elemento excede o container

---

## 5️⃣  Output do build

```
✓ built in 1.90s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Apenas warnings conhecidos — sem erros.

---

## 6️⃣  Versões

| Constante | Antes | Depois |
|-----------|-------|--------|
| `SITE_VERSION` | **10.175.0** | → **10.176.0** |
| `TS_VERSION` | **5.33.0** | → **5.34.0** |

---

## 7️⃣  Commit e Deploy

- Commit: `b011b2db` — `fix: layout jogando v3 — botão som dentro container + VS glow ativado + mini card 240px + VS margin-top:auto + v10.176.0`
- Push: ✅ `main -> main`
- Deploy: ✅ **Published** (gh-pages)

---

## 8️⃣  Verificação manual recomendada

Abrir no Chrome DevTools em **iPhone 14 Pro Max (430×932)**:
1. `/games/toptrumps` → 1v1 → jogar
2. **Fase jogando:**
   - Botão de som no **canto superior direito DENTRO do container** (não sobrepõe carta)
   - VS heartbeat com **círculo laranja pulsando** atrás do texto
   - VS **colado abaixo da carta** (margin-top:auto)
   - Mini card adversário **completo** (não cortado)
   - **Zero scroll**
3. Testar também em 375×812 (iPhone X)
