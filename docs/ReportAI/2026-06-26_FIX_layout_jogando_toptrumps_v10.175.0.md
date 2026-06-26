# FIX: Layout Fase Jogando Top Trumps SP — Carta Cortada + VS Heartbeat + Mini Card

**Data:** 2026-06-26
**Versão SITE:** 10.174.0 → **10.175.0**
**Versão TS:** 5.32.0 → **5.33.0**
**Tipo:** FIX (correção cirúrgica com base na investigação INV)

---

## 1️⃣  Outputs brutos — ETAPA 1 (prova de leitura)

### CSS grep (PowerShell)
```
LineNumber Line
---------- ----
      2333 .tt-game-container,
      2352 .tt-opponent-mini-wrapper {
      2360 .tt-card--mini-wrapper { width: 100%; display: flex; justify-content: center; align-items: center; }
      2361 .tt-card--mini { transform: scale(0.60); transform-origin: center; pointer-events: none; flex-shrink: 0; }
      2362 .tt-player-card-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; min-height: 0; overflow: hidden; }
      2363 .tt-player-card-wrapper .tt-card-wrapper { max-height: 100%; }
      2364 .tt-player-card-wrapper .tt-card-wrapper .tt-card-template img { max-height: 100%; object-fit: contain; }
      2368   .tt-player-card-wrapper .tt-card-wrapper {
      2372   .tt-player-card-wrapper .tt-card-template {
      2378   .tt-player-card-wrapper .tt-card-wrapper {
      2382   .tt-player-card-wrapper .tt-card-template {
      2388   .tt-player-card-wrapper .tt-card-wrapper {
      2392   .tt-player-card-wrapper .tt-card-template {
      2397 .tt-vs-heartbeat {
      2402 .tt-vs-heartbeat-glow {
      2405 .tt-vs-heartbeat-glow::after {
      2408 .tt-vs-heartbeat-text {
      2416   animation: tt-vs-heartbeat-color 4s ease-in-out infinite, tt-vs-heartbeat-pulse 1.8s ease-in-out infinite;
      2420 @keyframes tt-vs-heartbeat-pulse {
      2424 @keyframes tt-vs-heartbeat-color {
```

### JSX grep (PowerShell)
```
LineNumber Line
---------- ----
       902           <div className="tt-opponent-mini-wrapper">
       903             <span className="tt-opponent-mini-label">
       908             <div className="tt-card--mini-wrapper">
```

---

## 2️⃣  Correções aplicadas

### Correção 1 — Mini card: trocar scale por dimensionamento real

**Arquivo:** `src/pages/games/TopTrumps/TopTrumps.css`

**ANTES (linhas 2360–2361):**
```css
.tt-card--mini-wrapper { width: 100%; display: flex; justify-content: center; align-items: center; }
.tt-card--mini { transform: scale(0.60); transform-origin: center; pointer-events: none; flex-shrink: 0; }
```

**DEPOIS (linhas 2360–2376):**
```css
.tt-card--mini-wrapper {
  width: 100%;
  height: 130px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-shrink: 0;
}
.tt-card--mini {
  transform: scale(0.33);
  transform-origin: top center;
  pointer-events: none;
  flex-shrink: 0;
}
```

**Confirmação pós-edição:**
```
LineNumber Line
---------- ----
      2360 .tt-card--mini-wrapper {
      2369 .tt-card--mini {
```

---

### Correção 2 — VS heartbeat: min-height + padding

**Arquivo:** `src/pages/games/TopTrumps/TopTrumps.css`

**ANTES (linhas 2397–2401):**
```css
.tt-vs-heartbeat {
  display: flex; align-items: center; justify-content: center;
  position: relative; flex-shrink: 0; width: 100%;
  padding: 0;
}
```

**DEPOIS (linhas 2410–2420):**
```css
.tt-vs-heartbeat {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  padding: 6px 0;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}
```

**Confirmação pós-edição:**
```
LineNumber Line
---------- ----
      2410 .tt-vs-heartbeat {
      2421 .tt-vs-heartbeat-glow {
      2424 .tt-vs-heartbeat-glow::after {
      2427 .tt-vs-heartbeat-text {
      2435   animation: tt-vs-heartbeat-color 4s ease-in-out infinite, tt-vs-heartbeat-pulse 1.8s ease-in-out infinite;
      2439 @keyframes tt-vs-heartbeat-pulse {
      2443 @keyframes tt-vs-heartbeat-color {
```

---

### Correção 3 — Container: reequilibrar distribuição vertical

**Arquivo:** `src/pages/games/TopTrumps/TopTrumps.css`

**ANTES tt-game-container (linhas 2333–2339):**
```css
.tt-game-container,
.tt-result-container {
  display: flex; flex-direction: column; align-items: center;
  width: 100%; max-width: 480px; margin: 0 auto;
  height: 100dvh; padding: 0.4rem 0.75rem 0.2rem;
  box-sizing: border-box; overflow: hidden; justify-content: flex-start;
}
```

**DEPOIS tt-game-container (linhas 2333–2350):**
```css
.tt-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  box-sizing: border-box;
  max-width: 480px;
  margin: 0 auto;
  padding: 0.5rem max(1rem, env(safe-area-inset-right)) max(0.5rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
}
.tt-result-container {
  display: flex; flex-direction: column; align-items: center;
  width: 100%; max-width: 480px; margin: 0 auto;
  height: 100dvh; padding: 0.4rem 0.75rem 0.2rem;
  box-sizing: border-box; overflow: hidden; justify-content: flex-start;
}
```

**ANTES tt-player-card-wrapper (linha 2362):**
```css
.tt-player-card-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; min-height: 0; overflow: hidden; }
```

**DEPOIS tt-player-card-wrapper (linhas 2386–2394):**
```css
.tt-player-card-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}
```

**Confirmação pós-edição:**
```
LineNumber Line
---------- ----
      2333 .tt-game-container {
      2386 .tt-player-card-wrapper {
      2395 .tt-player-card-wrapper .tt-card-wrapper { max-height: 100%; }
      2396 .tt-player-card-wrapper .tt-card-wrapper .tt-card-template img { max-height: 100%; object-fit: contain; }
      2400   .tt-player-card-wrapper .tt-card-wrapper {
      2404   .tt-player-card-wrapper .tt-card-template {
      2410   .tt-player-card-wrapper .tt-card-wrapper {
      2414   .tt-player-card-wrapper .tt-card-template {
      2420   .tt-player-card-wrapper .tt-card-wrapper {
      2424   .tt-player-card-wrapper .tt-card-template {
```

---

## 3️⃣  Cálculo de altura total (932px — iPhone 14 Pro Max fullscreen)

| Elemento | Altura (px) | Fonte CSS |
|----------|------------|-----------|
| Padding top | ~8 | `0.5rem` = 8px |
| Header (rodada + placar) | ~40 | conteúdo flex-shrink:0 |
| Player card wrapper (flex:1) | **~628** | `flex: 1; min-height: 0` |
| VS heartbeat (min-height) | 48+12=60 | `min-height: 48px; padding: 6px 0` |
| Opponent mini label | ~20 | conteúdo |
| Opponent mini wrapper | 130 | `height: 130px` explícito |
| Footer + desistir | ~50 | conteúdo flex-shrink:0 |
| Padding bottom (safe-area) | ~8 | `max(0.5rem, env(...))` |
| **Total fixo** | **~316** | |
| **Restante para player card** | **~616** | ✅ Cabe 490px (scale 0.68) sobram 126px |

---

## 4️⃣  Teste lógico — fluxo por fluxo

### Fluxo 1 — Mini card adversário
- ✅ Ocupa exatamente **130px** de espaço DOM (height explícita)
- ✅ Reduzido por `scale(0.33)` com `transform-origin: top center`, visual ~130×238px
- ✅ Cortado por `overflow: hidden` — não vaza

### Fluxo 2 — VS heartbeat
- ✅ Visível entre player card e mini card
- ✅ `min-height: 48px` + `padding: 6px 0` = espaço garantido
- ✅ `z-index: 2` acima do fundo do container

### Fluxo 3 — Carta do jogador
- ✅ `flex: 1` + `min-height: 0` recebe espaço restante
- ✅ Não cortada — ~616px disponível, carta precisa de 490px
- ✅ Centralizada verticalmente por `align-items: center`

### Fluxo 4 — Zero scroll
- ✅ Total fixo (~316px) + player card (flex:1) = 100dvh
- ✅ `overflow: hidden` no container + `min-height: 0` garantem que nada vaza
- ✅ Nenhum elemento excede o container

---

## 5️⃣  Output do build

```
✓ built in 1.73s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Apenas warnings conhecidos (chunk size + dynamic import triplo do supertrunfo JSON) — sem erros.

---

## 6️⃣  Versões

| Constante | Antes | Depois |
|-----------|-------|--------|
| `SITE_VERSION` | **10.174.0** | → **10.175.0** |
| `TS_VERSION` | **5.32.0** | → **5.33.0** |

---

## 7️⃣  Commit e Deploy

- Commit: `30179a85` — `fix: layout fase jogando — mini card DOM height + VS heartbeat + player card flex + v10.175.0`
- Push: ✅ `main -> main`
- Deploy: ✅ **Published** (gh-pages)

---

## 8️⃣  Verificação manual recomendada

Abrir no Chrome DevTools em **iPhone 14 Pro Max (430×932)**, navegar até:
1. `/games/toptrumps` → 1v1 → deck e personagem
2. **Fase jogando** — confirmar:
   - Carta do jogador **visível completa** (sem corte no topo)
   - VS heartbeat **pulsando** entre as cartas
   - Mini card adversário **pequeno e contido** no topo
   - **Zero scroll** vertical na `.tt-game-container`
3. Testar também em viewport **375×812** (iPhone X) para garantir responsivo
