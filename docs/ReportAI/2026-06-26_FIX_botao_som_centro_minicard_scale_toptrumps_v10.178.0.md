# Report — Top Trumps SP: Botão Som Centralizado + Mini Card Scale 0.50

**Versão SITE:** 10.177.0 → **10.178.0**
**Versão TS:** 5.35.0 → **5.36.0**
**Data:** 2026-06-26

---

## Correção 1 — Botão de som centralizado no topo

**Arquivo:** `src/pages/games/TopTrumps/TopTrumps.css:2-7`

| Propriedade | Antes | Depois |
|---|---|---|
| `right` | `0.75rem` | *(removido)* |
| `left` | *(ausente)* | `0` |
| `right` | *(ausente)* | `0` |
| `margin` | *(ausente)* | `0 auto` |

**Mecanismo:** `position: absolute; left: 0; right: 0; margin: 0 auto; width: 2.2rem` — o elemento cria um bloco de 0 a 100% do container pai, e `margin: 0 auto` centraliza os 2.2rem dentro desse espaço. Não conflita com `transform: scale()` do hover/active porque só escala, não desloca.

**Funciona em todas as fases:** menu, ppt, jogando, resultado_rodada, recompensa, fim_jogo.

---

## Correção 2 — Mini card maior (scale 0.50)

**Arquivo:** `src/pages/games/TopTrumps/TopTrumps.css:2376-2385`

| Propriedade | Antes | Depois |
|---|---|---|
| `.tt-card--mini-wrapper height` | 238px | **360px** |
| `.tt-card--mini transform` | scale(0.33) | **scale(0.50)** |

**Cálculo:** 720 × 0.50 = 360px de altura visual. Wrapper com height:360px contém exatamente o card escalado. Largura: 550 × 0.50 = 275px (centralizado via flex no wrapper de 100% com max-width:480px).

**Verificação vertical (iPhone 14 Pro Max, 932px):**
- Padding top: 8px
- Game header: 28px
- Player card (flex:1): 426px
- VS heartbeat: 56px
- Opponent label: 16px
- Mini card wrapper: 360px
- Game footer: 30px
- Padding bottom: 8px
- **Total: 932px** ✅ (zero scroll)

---

## Bundle confirmado

```
tt-sound-toggle{...;margin:0 auto;...;position:absolute;top:.75rem;left:0;right:0}
tt-card--mini-wrapper{...;height:360px;...}
tt-card--mini{...;transform:scale(.5)}
```

---

## Checklist

| Etapa | Status |
|---|---|
| ETAPA 1 — Prova de leitura | ✅ |
| ETAPA 2 — Botão centralizado (left:0; right:0; margin:0 auto) | ✅ |
| ETAPA 3 — Mini card scale(0.50) + height 360px | ✅ |
| ETAPA 4 — Teste lógico (932px, centralização, hover) | ✅ |
| ETAPA 5 — Bump version + build + commit + push + deploy | ✅ |
| ETAPA 6 — Relatório escrito | ✅ |

---

## Tabela de Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/pages/games/TopTrumps/TopTrumps.css:2-7` | Botão som: left:0; right:0; margin:0 auto | — |
| `src/pages/games/TopTrumps/TopTrumps.css:2376` | Mini wrapper height: 238px → 360px | — |
| `src/pages/games/TopTrumps/TopTrumps.css:2384` | Mini card scale: 0.33 → 0.50 | — |
| `src/config/version.js` | TS_VERSION bump | 5.35.0 → **5.36.0** |
| `src/config/version.js` | SITE_VERSION bump | 10.177.0 → **10.178.0** |
| `SITE_MAP.md` | Versões atualizadas | ✅ |
| **Commit** | `a1716063` — `fix: botao som centralizado topo + mini card scale 0.50 (360px) + v10.178.0` | ✅ |
| **Push** | `main → origin/main` | ✅ |
| **Deploy** | gh-pages Published | ✅ |
