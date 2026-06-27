# INV — Diagnóstico CSS resultado_rodada — Arquitetura — v10.181.3

---

## ETAPA 1 — TopTrumpsCard.css completo

(Veja output bruto acima — 311 linhas, inclui media queries com scale 0.75, 0.62, 0.54)

## ETAPA 2 — resultado_rodada CSS (linhas 2341-2555)

(Veja output bruto acima — bloco completo de .tt-result-container a .tt-game-cards)

## ETAPA 3 — jogando CSS (linhas 2381-2451)

(Veja output bruto acima — .tt-player-card-wrapper, .tt-card--mini-wrapper, .tt-vs-heartbeat)

## ETAPA 4 — Todos os seletores que afetam .tt-card-wrapper e .tt-card-template

**TopTrumps.css:**
| Linha | Seletor |
|---|---|
| 2399 | `.tt-player-card-wrapper .tt-card-wrapper { max-height: 100%; }` |
| 2400 | `.tt-player-card-wrapper .tt-card-wrapper .tt-card-template img { max-height: 100%; object-fit: contain; }` |
| 2403-2404 | `.tt-player-card-wrapper .tt-card-wrapper, .tt-card--mini-wrapper .tt-card-wrapper { width: calc(550px * 0.54); height: calc(720px * 0.54); overflow: hidden; }` |
| 2410-2411 | `.tt-player-card-wrapper .tt-card-template, .tt-card--mini-wrapper .tt-card-template { transform: scale(0.54); transform-origin: top left; }` |
| 2498-2502 | `.tt-swipe-card-slot .tt-card-wrapper { width: calc(550px * 0.54); height: calc(720px * 0.54); overflow: hidden; }` |
| 2504-2509 | `.tt-swipe-card-slot .tt-card-template { width: calc(550px * 0.54); height: calc(720px * 0.54); transform: scale(0.54); transform-origin: top center; }` |

**TopTrumpsCard.css:**
| Linha | Seletor |
|---|---|
| 6-12 | `.tt-card-wrapper { width: 550px; height: 720px; overflow: visible; flex-shrink: 0; position: relative; }` |
| 14-20 | `.tt-card-template { position: absolute; top: 0; left: 0; width: 550px; height: 720px; }` |
| 276-283 | `@media (769-1200px) { .tt-card-wrapper { width: calc(550px*0.75); height: calc(720px*0.75); } .tt-card-template { transform: scale(0.75); transform-origin: top left; } }` |
| 290-297 | `@media (461-768px) { .tt-card-wrapper { width: calc(550px*0.62); height: calc(720px*0.62); } .tt-card-template { transform: scale(0.62); transform-origin: top left; } }` |
| 304-311 | `@media (max-width: 460px) { .tt-card-wrapper { width: calc(550px*0.54); height: calc(720px*0.54); } .tt-card-template { transform: scale(0.54); transform-origin: top left; } }` |

## ETAPA 5 — git diff HEAD~1

```diff
-.tt-swipe-card-slot .tt-card-wrapper { max-height: 100%; max-width: 100%; }
+.tt-swipe-card-slot .tt-card-wrapper {
+  width: calc(550px * 0.54);
+  height: calc(720px * 0.54);
+  overflow: hidden;
+}
+
+.tt-swipe-card-slot .tt-card-template {
+  width: calc(550px * 0.54);
+  height: calc(720px * 0.54);
+  transform: scale(0.54);
+  transform-origin: top center;
+}

-  width: 2.2rem;
-  height: 2.2rem;
+  width: 2.75rem;
+  height: 2.75rem;
```

## ETAPA 6 — JSX resultado_rodada (linhas 856-950)

(Veja output bruto acima)

**Identificações:**
- `.tt-swipe-card-slot` NÃO tem classe adicional — apenas `className="tt-swipe-card-slot"` (linhas 910, 922)
- `<TopTrumpsCard>` NÃO recebe prop de tamanho ou escala — apenas `characterImage, name, description, locale, attributes, disabled={true}, templateIndex`
- Botão `.tt-swipe-btn` está DENTRO de `.tt-cards-swipe-container` (linha 935), após `.tt-cards-swipe-track` (linha 934 fecha), como `position: absolute`

## ETAPA 7 — Tabela comparativa: jogando vs resultado_rodada

| Propriedade | Fase jogando | Fase resultado_rodada |
|---|---|---|
| Container do card | `.tt-player-card-wrapper` | `.tt-swipe-card-slot` (dentro de `.tt-cards-swipe-container` > `.tt-cards-swipe-track`) |
| position do container | `flex: 1; display: flex` (relativo) | `width: 50%; height: 100%; display: flex; flex-direction: column` |
| overflow do container | `overflow: hidden` | `overflow: hidden` |
| display do container | `flex`, `align-items: center`, `justify-content: center` | `flex`, `flex-direction: column`, `align-items: center`, `justify-content: center` |
| flex do container | `flex: 1; min-height: 0` | `width: 50%; height: 100%` (sem flex) |
| Override de width no .tt-card-wrapper | `width: calc(550px * 0.54)` | `width: calc(550px * 0.54)` ✅ (após correção) |
| Override de height no .tt-card-wrapper | `height: calc(720px * 0.54)` | `height: calc(720px * 0.54)` ✅ (após correção) |
| transform: scale() no .tt-card-template | `transform: scale(0.54)` | `transform: scale(0.54)` ✅ (após correção) |
| transform-origin | `top left` | `top center` |
| O DOM box do card ocupa espaço no layout? | SIM — wrapper tem 297×389px (550*0.54 × 720*0.54) | SIM — wrapper tem 297×389px ✅ (após correção) |

## ETAPA 8 — Q1-Q5

**Q1: O transform: scale(0.54) reduz o espaço que o elemento ocupa no layout ou apenas a aparência visual?**

Apenas a aparência visual. `transform: scale()` NÃO altera o DOM box do elemento — o box continua ocupando o espaço original (550×720). Quem reduz o DOM box SÃO as props `width` e `height` explícitas no `.tt-card-wrapper`. O `transform: scale()` só escala visualmente o conteúdo interno. **Evidência:** `.tt-card-template` tem `position: absolute` (TopTrumpsCard.css:14) — o template é absolute dentro do wrapper. O wrapper tem `width: calc(550px * 0.54)` no override (TopTrumps.css:2499-2500) — ESSA é a linha que reduz o DOM box.

**Q2: Na fase jogando, o card tem width/height redefinidos explicitamente no DOM box?**

SIM. `.tt-player-card-wrapper .tt-card-wrapper` (TopTrumps.css:2403-2407) define `width: calc(550px * 0.54)` e `height: calc(720px * 0.54)`. O DOM box é 297×389px. O `transform: scale(0.54)` no template (linha 2412) escala visualmente o conteúdo absolute interno.

**Q3: Na fase resultado_rodada após a última task, o card tem width/height redefinidos?**

SIM (após a correção da última task). `.tt-swipe-card-slot .tt-card-wrapper` (TopTrumps.css:2498-2502) define `width: calc(550px * 0.54)` e `height: calc(720px * 0.54)`. Antes da correção, era apenas `max-height: 100%; max-width: 100%`, que NÃO reduzia o DOM box do wrapper (que permanecia 550×720 do base).

**Q4: O .tt-swipe-card-slot tem overflow: hidden? Se sim, o que exatamente está sendo cortado?**

SIM (TopTrumps.css:2497). Tem `overflow: hidden`. Antes da correção, o `.tt-card-wrapper` tinha DOM box de 550×720px mas o slot só tinha a largura do viewport (ex: 430px). O card era cortado horizontalmente (parte direita invisível) e verticalmente se excedesse. Após a correção, o DOM box do wrapper é 297×389px, que cabe dentro do slot em viewports >297px.

**Q5: O .tt-cards-swipe-container tem overflow: hidden?**

SIM (TopTrumps.css:2494). Tem `overflow: hidden`. Este overflow corta QUALQUER conteúdo do container que exceda suas dimensões. Antes da correção, o track (200% de largura) + cards (550px cada) excediam o container e eram cortados. Após a correção, os cards têm DOM box reduzido para 297×389px, que cabe dentro de slots de 50% do container.

## ETAPA 9 — Proposta de arquitetura limpa

**A — A estrutura do swipe (track 200% + dois slots 50%) é compatível com o card de tamanho fixo?**

Sim, desde que o DOM box do card seja explicitamente reduzido. O track de 200% contém dois slots de 50% cada (100% do track = 50% do container). Cada slot tem `display: flex; justify-content: center` que centraliza o card. Com o DOM box de 297×389px, cabe perfeitamente. O problema antes da correção era que o DOM box do card era 550×720px (não reduzido), que excedia os slots.

**B — O que a fase jogando faz que faz o card aparecer corretamente, e como replicar no swipe slot?**

A fase jogando usa `.tt-player-card-wrapper` com `flex: 1` + `.tt-card-wrapper` com override explícito de `width/height: calc(550px * 0.54)`. Isso reduz o DOM box do card para 297×389px. O `overflow: hidden` corta qualquer excesso. O `align-items: center; justify-content: center` centraliza o card no espaço flexível.

A correção replicou exatamente isso para o swipe slot: `.tt-swipe-card-slot .tt-card-wrapper` agora tem os mesmos overrides de width/height. A diferença principal é o `transform-origin: top center` (em vez de `top left` na jogando) — porque no swipe slot o card está num flex column com `justify-content: center`, e o `top center` alinha horizontalmente no centro e verticalmente no topo.

**C — Faz sentido remover o swipe track/slot e simplificar para uma estrutura mais simples?**

Sim, faria sentido para eliminar a complexidade. Alternativa: um único container flex com `overflow: hidden` e dois `<TopTrumpsCard>` lado a lado, controlados por estado React (`mostrarCartaJogador` / `mostrarCartaIA`), cada um com `display: ${swipeRevealed ? 'none' : 'flex'}` ou com animação CSS de fade/translate controlada por classe. Isso eliminaria:
- O track de 200% com translateX
- Os slots de 50%
- A necessidade de acertar escalas em containers aninhados

No entanto, a estrutura atual (com a correção aplicada) funciona. A simplificação seria uma refatoração para reduzir complexidade futura, não uma correção de bug.
