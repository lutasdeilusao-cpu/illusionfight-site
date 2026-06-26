# INVESTIGAÇÃO: Layout "Jogando" Top Trumps SP — Carta Cortada, VS Heartbeat, Mini Card

**Data:** 2026-06-26
**Versão SITE:** 10.174.0 / **TS:** 5.32.0
**Tipo:** INV (leitura pura — sem edições de código)
**Arquivos analisados:**
- `src/pages/games/TopTrumps/TopTrimps.jsx` (1176 linhas)
- `src/pages/games/TopTrumps/TopTrumps.css` (2482 linhas)
- `src/components/TopTrumpsCard/TopTrumpsCard.jsx` (135 linhas)
- `src/components/TopTrumpsCard/TopTrumpsCard.css` (311 linhas)

---

## 1️⃣  Ordem dos elementos no JSX (linhas 875–922)

```
.tt-game-container (flex column, height: 100dvh, overflow: hidden)
├── .tt-game-header          (flex-shrink: 0)
├── .tt-player-card-wrapper  (flex: 1, overflow: hidden)
│   └── TopTrumpsCard        (carta do jogador, 550×720 → escala 0.68/0.78/0.88)
├── .tt-vs-heartbeat          (flex-shrink: 0, width: 100%)
│   ├── .tt-vs-heartbeat-glow (display: none — ver seção 3)
│   └── .tt-vs-heartbeat-text  ("VS" animado)
├── .tt-opponent-mini-wrapper (flex-shrink: 0)
│   ├── .tt-opponent-mini-label
│   └── .tt-card--mini-wrapper
│       └── TopTrumpsCard (mini={true}, mystery={true})
└── .tt-game-footer          (flex-shrink: 0, margin-top: auto)
```

VS heartbeat **EXISTE no DOM** (linhas 898–901 do JSX) e tem CSS próprio (linhas 2397–2428 do CSS).

---

## 2️⃣  Root Cause #1 — Carta do jogador cortada no topo

### O conflito

O `<TopTrumpsCard>` do oponente com `mini={true}` tem **dois escalonamentos** encadeados:

1. `.tt-card-wrapper` recebe `width/height` do media query do TopTrumpsCard.css (ex: `593×389` em <=460px com scale 0.54)
2. Mas esse mesmo elemento também ganha a classe `.tt-card--mini`, que aplica `transform: scale(0.60)` (linha 2361 do TopTrumps.css)

**Problema:** `transform: scale()` **não afeta o layout** — o elemento ainda ocupa o espaço DOM original (550×720 ou 297×389). O visual é reduzido para 178×233, mas o **espaço no flex column** permanece o equivalente ao box unscaled.

### Cálculo de altura (<=460px, viewport ~812px real)

| Elemento | Altura no layout | Fonte |
|----------|-----------------|-------|
| Padding top (0.4rem) | ~6px | `.tt-game-container` |
| Header | ~30px | Flex-shrink 0, conteúdo |
| **Opponent mini card DOM** | **~389px** | 720×0.54 = 389 (não reduzido pelo scale) |
| Opponent label | ~18px | `.tt-opponent-mini-label` |
| VS heartbeat | ~35px | Flex-shrink 0, padding + texto |
| Footer | ~35px | Flex-shrink 0 |
| Padding bottom (0.2rem) | ~3px | |
| **Subtotal (não-player)** | **~516px** | |
| **Restante para player card** | **~296px** | 812 − 516 |
| **Player card necessário** | **490px** | 720×0.68 |

A carta do jogador precisa de 490px mas só recebe ~296px. O `flex: 1` no wrapper não adianta porque o container com `overflow: hidden` corta o excesso, e o `justify-content: flex-start` empilha tudo no topo.

**OBS:** Em desktop (769–1200px) a discrepância é menor (68% scale na mini × 0.88 na player) mas o mesmo padrão ocorre.

---

## 3️⃣  Situação do VS Heartbeat — Existe mas pode estar encoberto ou cortado

### DOM: PRESENTE (linhas 898–901)
```jsx
<div className="tt-vs-heartbeat">
  <div className="tt-vs-heartbeat-glow" />
  <span className="tt-vs-heartbeat-text">VS</span>
</div>
```

### CSS: FUNCIONAL (linhas 2397–2428)
- `.tt-vs-heartbeat`: display flex, width 100%, flex-shrink 0, position relative
- `.tt-vs-heartbeat-text`: gradient animado, `filter: drop-shadow(...)`, animação heartbeat-pulse (0.85→1.2)
- `.tt-vs-heartbeat-glow`: **`display: none`** (linha 2403)
- `.tt-vs-heartbeat-glow::after`: **`display: none`** (linha 2406)

### Causas possíveis do "sumiço"
1. **Espaço esmagado:** o mini card ocupa ~389px no layout, sobrando pouco espaço entre o player card e o footer. O VS heartbeat pode estar renderizado mas invisível por estar comprimido a ~0px de altura.
2. **Overflow escondido:** `.tt-game-container` tem `overflow: hidden`. Se o layout total exceder 100dvh, o VS na zona intermediária é cortado.
3. **O glow foi desligado** propositalmente (`display: none`), mas o texto `VS` continua ativo. Se aparecer só o texto sem glow, pode parecer "quebrado".

### Recomendação
Aumentar `padding` no `.tt-vs-heartbeat` (ex: `padding: 6px 0`) e/ou dar um `min-height` explícito (ex: `min-height: 40px`) para garantir visibilidade mesmo com layout espremido.

---

## 4️⃣  Posicionamento do Mini Card Adversário

### Dados CSS relevantes

```css
/* TopTrumps.css:2360 */
.tt-card--mini-wrapper { width: 100%; display: flex; justify-content: center; align-items: center; }

/* TopTrumps.css:2361 */
.tt-card--mini { transform: scale(0.60); transform-origin: center; pointer-events: none; flex-shrink: 0; }
```

### Problema
O `transform-origin: center` centraliza visualmente dentro do box DOM, mas:
- O box DOM permanece 297×389 (em <=460px)
- O `flex-shrink: 0` impede compressão
- Não há `overflow: hidden` no `.tt-opponent-mini-wrapper` — se o wrapper pai tiver altura limitada, o mini card vaza visualmente

### Efeito colateral
Por não ter `overflow: hidden`, o mini card pode vazar para fora do `.tt-game-container` pelo fundo, contribuindo para o scroll ou corte geral.

### Recomendação
Adicionar `overflow: hidden` em `.tt-opponent-mini-wrapper` ou aplicar `margin-bottom: -40%` (altura visual extra) para compensar a diferença entre DOM height e visual height.

---

## 5️⃣  Altura total estimada (para depuração)

Cenário: iPhone 14 Pro Max (430×932, Safari com chrome ~812px)

| Camada | Altura DOM (px) | Altura visual (px) |
|--------|----------------|-------------------|
| Padding top | 6 | 6 |
| Header | 30 | 30 |
| Player card wrapper (flex:1) | ~296 | ~296 (cortado, precisa de 490) |
| VS heartbeat | 35 | 35 |
| Opponent mini label | 18 | 18 |
| Opponent mini card | 389 | 233 (scale 0.60) |
| Footer | 35 | 35 |
| Padding bottom | 3 | 3 |
| **Total** | **~812** | **~656** |

O layout "cabe" no viewport, mas a distribuição é desbalanceada porque o elemento visualmente pequeno (mini card) ocupa 389px de layout DOM.

---

## 6️⃣  Causa Raiz Resumida

| Problema | Causa | Prioridade |
|----------|-------|-----------|
| Carta cortada | Mini card ocupa 389px DOM (não 233px visual) por causa de `transform: scale()` que não libera layout. Player card só recebe ~296px | 🔴 Alta |
| VS heartbeat "sumido" | Pouco espaço entre player card e mini card + overflow:hidden no container | 🟡 Média |
| Mini card mal posicionado | `transform-origin: center` com scale puramente visual; sem overflow:hidden no wrapper | 🟢 Baixa |

---

## 7️⃣  Recomendações de Correção

1. **Trocar `transform: scale()` no mini card** por dimensionamento real (`width/height` calculados) para liberar layout, ou usar `margin-bottom` negativo para compensar a diferença.
2. **Dar `min-height` explícito** ao `.tt-vs-heartbeat` (ex: 40px com padding vertical) para garantir que o "VS" apareça mesmo em layout espremido.
3. **Adicionar `overflow: hidden`** em `.tt-opponent-mini-wrapper` para evitar vazamento visual.
4. **Avaliar `justify-content: center`** em vez de `flex-start` no `.tt-game-container` para distribuir o espaço uniformemente (em vez de empilhar no topo).

---

> **Status:** Investigação concluída. Nenhum código foi editado. Próximo passo: refatorar escala do mini card e adicionar min-height ao VS heartbeat.
