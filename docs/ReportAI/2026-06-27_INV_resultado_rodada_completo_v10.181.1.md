# INV — Diagnóstico completo da tela resultado_rodada — v10.181.1

> Investigação pura — nenhuma edição de código.

---

## 1. Estrutura HTML completa (TopTrumps.jsx:858-950)

```
<section className="tt-page">                          [871]
  ├── <button tt-sound-toggle />                        [872]
  ├── {particulas.map(...)}                             [875-877]
  └── <div tt-result-container>                         [878]  — height: 100dvh, flex column, overflow:hidden
       ├── <div tt-game-header>                         [879]  — flex-shrink:0
       │    ├── <div tt-game-round>                     [880]
       │    └── <div tt-game-score>                     [883]
       ├── <div tt-result-badge tt-result-win/lose/draw>[889]  — flex-shrink:0, ~40px
       ├── <div tt-result-attr-comparison>               [899]  — flex-shrink:0, ~50px
       │    ├── <div tt-result-attr-name>               [900]
       │    └── <div tt-result-values>                  [901]
       ├── <div tt-cards-swipe-container>                [908]  — flex:1, position:relative
       │    ├── <div tt-cards-swipe-track>               [909]  — width:200%, height:100%
       │    │    ├── <div tt-swipe-card-slot>            [910]  — width:50%, height:100%, flex column, justify-content:center
       │    │    │    ├── <span tt-swipe-label>          [911]  — flex-shrink:0, ~20px
       │    │    │    └── <TopTrumpsCard>                [912]
       │    │    └── <div tt-swipe-card-slot>            [922]
       │    │         ├── <span tt-swipe-label>          [923]
       │    │         └── <TopTrumpsCard>                [924]
       │    └── <button tt-swipe-btn>                   [935]  — position:absolute, top:50%
       └── <button tt-btn-next-round>                   [943]  — flex-shrink:0, ~50px
```

## 2. Problemas encontrados

### P1 — Card sem escala responsiva no swipe slot

**Causa raiz:** `TopTrumpsCard.css:4-8` define `.tt-card-wrapper { width: 550px; height: 720px }`. As media queries (linhas 270-311) escalam o card para `.tt-card-wrapper`, mas o seletor `.tt-swipe-card-slot .tt-card-wrapper` (`TopTrumps.css:2498`) só tem `max-height: 100%; max-width: 100%` — NÃO redefine `width`/`height` explicitamente.

| Viewport | Largura do slot | Card width | Efeito |
|---|---|---|---|
| 430px mobile | ~400px | 550px | ❌ Card 150px maior que o container — cortado pelo `overflow:hidden` |
| 768px tablet | ~700px | 550px | ✅ Cabe |
| 1257px desktop | ~480px (max-width) | 550px | ❌ Card 70px maior — cortado |

**Proposta:** Adicionar escala no `.tt-swipe-card-slot .tt-card-wrapper` similar ao `.tt-player-card-wrapper` (que usa `calc(550px * 0.54)`).

---

### P2 — Card não centralizado no slot (justify-content:center vs max-height)

**Causa raiz:** `.tt-swipe-card-slot` (`TopTrumps.css:2497`) tem `display: flex; flex-direction: column; align-items: center; justify-content: center`. O card tem `max-height: 100%`. Se o card for maior que o slot, `max-height: 100%` o limita, mas sem `overflow: visible` no card, o conteúdo interno do card (atributos, nome) fica fora da área visível porque o `.tt-card-template { width: 550px; height: 720px }` ainda renderiza o conteúdo interno nas posições absolutas originais.

**Proposta:** Aplicar `transform: scale(...)` no `.tt-swipe-card-slot .tt-card-wrapper` com `transform-origin: center center` para que o card inteiro (incluindo conteúdo interno) seja redimensionado proporcionalmente.

---

### P3 — overflow:hidden na resultado_rodada sem scroll

**Causa raiz:** `.tt-result-container` (`TopTrumps.css:2349-2354`) tem `height: 100dvh; overflow: hidden`. Se o conteúdo total (header + badge + attr + swipe container com 2 cartas + botão) exceder a altura disponível, o conteúdo é cortado sem possibilidade de scroll.

**Cálculo para iPhone 14 Pro Max (430×932, 100dvh=932px):**
- Header: ~30px
- Badge: ~40px
- Attr comparison: ~50px
- Swipe container: flex:1 = 932 - (30+40+50+50+20+20) = ~722px
- Button next round: ~50px
- Padding: ~20px
- Total consumed: ~200px fixos, swipe container leva o resto
- Card height em 550×720: no mobile, se não tiver escala, 720px não cabe em 722px.

**Proposta:** Manter `overflow: hidden` (não queremos scroll), mas garantir que o card caiba via escala.

---

### P4 — Botão tt-swipe-btn sobrepõe a carta

**Causa raiz:** `.tt-swipe-btn` (`TopTrumps.css:2504-2521`) tem `position: absolute; top: 50%; right: 15px` (ou left). O container pai `.tt-cards-swipe-container` tem `position: relative`. `top: 50%` centraliza verticalmente em relação ao container. `right: 15px` posiciona a 15px da borda direita.

Em viewport estreito (430px mobile):
- Container width: ~400px
- Card width: 550px → cortado pelo `overflow: hidden`
- Botão em `right: 15px` + `width: 2.2rem (~35px)` → botão visível na borda direita
- O botão NÃO sobrepõe a carta VISÍVEL porque a carta está cortada — mas isso é porque o card está mal posicionado

O botão tem `z-index: 10`, fica acima do card. Funciona, mas a posição `top: 50%` é relativa ao container, que pode ser maior ou menor que o card.

**Proposta:** Manter posicionamento, mas corrigir o card primeiro. Se o card couber no slot, o botão ficará naturalmente na lateral.

---

### P5 — Área de toque do botão insuficiente

**Causa raiz:** `.tt-swipe-btn` tem `width: 2.2rem` (~35.2px) e `height: 2.2rem` (~35.2px). O mínimo recomendado para alvos de toque em mobile é 44×44px (WCAG 2.5.8 / Apple HIG / Material Design).

**Proposta:** Aumentar para `width: 2.75rem; height: 2.75rem` (~44px).

---

### P6 — swipeRevealed não reseta ao entrar na tela

**Causa raiz:** `swipeRevealed` é inicializado como `false` (linha 123) e resetado só em `proximaRodada()` (linha 376). Se o usuário revelar a carta do oponente, avançar para a próxima rodada (que reseta), e depois voltar para resultado_rodada via re-render, o estado persiste. Mas como `proximaRodada` sempre reseta, e cada nova rodada é um novo resultado_rodada via `setFase('resultado_rodada')`, isso não causa erro prático.

Mas há um cenário: se o usuário abrir o swipe, ver a carta do oponente, e a fase mudar de resultado_rodada → fim_jogo (última rodada), o `swipeRevealed` fica como estava. Não impacta porque `fim_jogo` não usa `swipeRevealed`.

**Proposta:** Não requer correção — o estado é resetado corretamente em `proximaRodada()`.

---

### P7 — Classes CSS conflitantes entre jogando e resultado_rodada

**Causa raiz:** Várias classes CSS são compartilhadas entre as fases:
- `.tt-game-header` (linha 2355) — usado em jogando E resultado_rodada
- `.tt-game-round`, `.tt-game-score` — idem
- `.tt-page` (linha 536) — usado em todas as fases, tem `height: 100dvh; overflow: hidden`

Isso não é um problema em si, mas significa que mudanças no CSS da fase jogando podem afetar resultado_rodada e vice-versa.

**Proposta:** Documentar o compartilhamento para evitar regressões.

---

### P8 — tt-swipe-label consome espaço vertical precioso

**Causa raiz:** `.tt-swipe-label` (`TopTrumps.css:2499-2502`) tem `font-size: 0.6rem; flex-shrink: 0; margin-bottom: 0.15rem`. O label "YOUR CARD" / "OPPONENT'S CARD" ocupa ~15-20px verticais. Em viewports pequenos (430px mobile, 932px altura total), cada pixel conta.

**Proposta:** Em viewports muito pequenos, considerar `font-size: 0.5rem` ou ocultar o label em favor do contexto visual.

---

### P9 — Fire particles continuam na resultado_rodada

**Causa raiz:** (TopTrumps.jsx:866-870) As `tt-fire-particles` são renderizadas em `resultado_rodada`, `jogando`, e `ppt`. São 25 divs com animação CSS, posicionadas com `position: fixed`. Consomem memória/GPU em mobile.

**Proposta:** Avaliar se as partículas de fogo são necessárias na tela de resultado (já há partículas de resultado via `{particulas.map(...)}`).

## 3. Resumo de problemas por severidade

| # | Problema | Severidade | Arquivo:Linha |
|---|---|---|---|
| P1 | Card sem escala no swipe-slot | 🔴 Alta | TopTrumpsCard.css:4 + TopTrumps.css:2498 |
| P2 | Card não centralizado corretamente | 🟡 Média | TopTrumps.css:2497 |
| P3 | overflow:hidden corta conteúdo | 🟡 Média | TopTrumps.css:2353 |
| P4 | Botão sobrepõe carta em viewports estreitos | 🟢 Baixa | TopTrumps.css:2504-2520 |
| P5 | Área de toque < 44px | 🟢 Baixa | TopTrumps.css:2508-2509 |
| P6 | swipeRevealed persiste entre fases | 🟢 Muito baixa | TopTrumps.jsx:123 |
| P7 | Classes CSS compartilhadas entre fases | 🟢 Observação | TopTrumps.css:2355 |
| P8 | Label consome espaço em mobile | 🟢 Baixa | TopTrumps.css:2499-2502 |
| P9 | Fire particles em resultado | 🟢 Muito baixa | TopTrumps.jsx:866 |
