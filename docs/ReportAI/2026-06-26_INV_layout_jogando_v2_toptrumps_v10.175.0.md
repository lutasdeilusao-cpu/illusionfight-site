# INVESTIGAÇÃO v2: Layout Fase Jogando Top Trumps SP — Botão Som, VS Glow, Mini Card

**Data:** 2026-06-26
**Versão SITE:** 10.175.0 / **TS:** 5.33.0
**Tipo:** INV (leitura pura — nenhuma edição de código)

---

## 1️⃣  Botão de som — posição atual

### JSX (6 ocorrências — uma por fase)
```
LineNumber Line
---------- ----
 624  fase='menu':     <button className="tt-sound-toggle" ...>
 783  fase='ppt':      <button className="tt-sound-toggle" ...>
 872  fase='jogando':  <button className="tt-sound-toggle" ...>
 999  fase='resultado':<button className="tt-sound-toggle" ...>
1084  fase='recompensa':<button className="tt-sound-toggle" ...>
1134  fase='fim_jogo': <button className="tt-sound-toggle" ...>
```

### CSS (linhas 1–26)
```css
.tt-sound-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 999;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.15s;
}
.tt-sound-toggle:hover {
  background: rgba(255,255,255,0.12);
  transform: scale(1.1);
}
.tt-sound-toggle:active {
  transform: scale(0.95);
}
```

### Resposta
- **O botão está FORA do `.tt-game-container`.** No JSX da fase jogando (linhas 871–922), ele está como filho direto de `<section className="tt-page">`, **antes** do `<div className="tt-game-container">`. É um irmão anterior, não um filho do container de jogo.
- **Posicionado com `position: fixed; top: 1rem; right: 1rem;`** — flutua no canto superior direito da viewport, independente do scroll ou do container.
- **Para trazê-lo para dentro do container de jogo:** precisa mover o `<button>` para dentro do `.tt-game-container` no JSX e trocar `position: fixed` para `position: relative` ou `absolute` dentro do container.

---

## 2️⃣  VS heartbeat — posição e glow desligado

### JSX (linhas 898–900)
```jsx
898:           <div className="tt-vs-heartbeat">
899:             <div className="tt-vs-heartbeat-glow" />
900:             <span className="tt-vs-heartbeat-text">VS</span>
901:           </div>
```

### CSS completo (linhas 2429–2466)
```css
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
2441:   display: none;         /* ← DESLIGADO */
2442: }
2443: .tt-vs-heartbeat-glow::after {
2444:   display: none;         /* ← DESLIGADO */
2445: }
2446: .tt-vs-heartbeat-text {
2447:   position: relative; z-index: 5;
2448:   font-family: "RacingGames", "Orbitron", sans-serif;
2449:   font-size: 1.4rem; font-weight: 900; line-height: 1;
2450:   background: linear-gradient(135deg, #e8853a, #f4a227, #e8853a);
2451:   background-size: 300% 300%;
2452:   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
2453:   background-clip: text;
2454:   animation: tt-vs-heartbeat-color 4s ease-in-out infinite, tt-vs-heartbeat-pulse 1.8s ease-in-out infinite;
2455:   letter-spacing: 0.06em;
2456:   filter: drop-shadow(0 0 20px rgba(232,133,58,0.4));
2457: }
2458: @keyframes tt-vs-heartbeat-pulse {
2459:   0%, 100% { transform: scale(0.85); opacity: 0.6; }
2460:   50% { transform: scale(1.2); opacity: 1; }
2461: }
2462: @keyframes tt-vs-heartbeat-color {
2463:   0% { background-position: 0% 50%; }
2464:   50% { background-position: 100% 50%; }
2465:   100% { background-position: 0% 50%; }
2466: }
```

### Respostas
- `.tt-vs-heartbeat-glow` → **`display: none`** na **linha 2441**
- `.tt-vs-heartbeat-glow::after` → **`display: none`** na **linha 2444**
- A animação `tt-vs-heartbeat-pulse` está definida na **linha 2458**
- **Por que o círculo de pulsação não aparece?** Porque o glow foi desligado propositalmente (`display: none` no elemento e no `::after`). O **texto VS** está ativo e animando (gradiente + pulse scale + drop-shadow), mas o glow decorativo ao redor não renderiza.
- **Para ativar:** Trocar `display: none` por `display: block` (ou `flex`) nas linhas 2441 e 2444. Pode precisar ajustar dimensões e posição absoluta para centralizar atrás do texto VS.

---

## 3️⃣  Ordem dos elementos no JSX (fase jogando)

### Output bruto (linhas 869–929)
```
870:         <div className="tt-fire-particles">
871:         <section className="tt-page">
872:         <button className="tt-sound-toggle" ...>     ← sound toggle (FORA do container)
873:         </button>
875:         <div className="tt-game-container">          ← INÍCIO DO CONTAINER
876:           <div className="tt-game-header">            ← 1. HEADER
877-884:       ...
885:           </div>
886:           <div className="tt-player-card-wrapper">   ← 2. PLAYER CARD
887-896:         <TopTrumpsCard ... />
897:           </div>
898:           <div className="tt-vs-heartbeat">           ← 3. VS HEARTBEAT
899:             <div className="tt-vs-heartbeat-glow" />
900:             <span className="tt-vs-heartbeat-text">VS</span>
901:           </div>
902:           <div className="tt-opponent-mini-wrapper">  ← 4. OPPONENT MINI
903-907:         ...
908:             <div className="tt-card--mini-wrapper">
909-914:           <TopTrumpsCard mini={true} ... />
915:             </div>
916:           </div>
917:           <div className="tt-game-footer">            ← 5. FOOTER
918-921:         ...
922:         </div>                                        ← FIM DO CONTAINER
```

### Ordem exata (de cima para baixo):
| # | Elemento | Classe | JSX linha |
|---|----------|--------|-----------|
| 1 | Header | `.tt-game-header` | 876 |
| 2 | **Carta do jogador** | `.tt-player-card-wrapper` | 886 |
| 3 | **VS** | `.tt-vs-heartbeat` | 898 |
| 4 | **Mini card adversário** | `.tt-opponent-mini-wrapper` | 902 |
| 5 | Footer | `.tt-game-footer` | 917 |

A ordem atual **já corresponde exatamente** à ordem desejada:
```
Header → Player Card → VS → Mini Card → Footer ✅
```

---

## 4️⃣  CSS completo de cada elemento — margens e flex

### Flex-shrink de cada elemento

| Elemento | flex-shrink | margin | padding |
|----------|------------|--------|---------|
| `.tt-game-header` | `flex-shrink: 0` | — | `padding: 0.25rem 0` |
| `.tt-player-card-wrapper` | (default) | — | — |
| `.tt-vs-heartbeat` | `flex-shrink: 0` | — | `padding: 6px 0` |
| `.tt-opponent-mini-wrapper` | `flex-shrink: 0` | `margin-top: 0` | `padding-bottom: 0.05rem` |
| `.tt-game-footer` | `flex-shrink: 0` | **`margin-top: auto`** | `padding: 0.15rem 0 0.2rem 0` |

### Observações importantes
- **`margin-top: auto` no `.tt-game-footer`** (linha 2467): empurra o footer para o fundo do container. Como o `.tt-player-card-wrapper` tem `flex: 1`, ele compete com o `margin-top: auto` pelo espaço excedente. Na prática, o footer vai para o final e o player card preenche o espaço entre o header e o VS.
- **Nenhuma margem entre elementos consecutivos.** Não há `gap` no `.tt-game-container`, nem `margin` entre VS e player card ou entre VS e mini card. A distância é controlada apenas pelo `padding` de cada elemento.
- **`margin-top: 0` explícito** no `.tt-opponent-mini-wrapper` — confirma que não há separação entre VS e mini card.

---

## 5️⃣  Mini card — tamanho visual real

### Card base (TopTrumpsCard.css linhas 6–11)
```css
.tt-card-wrapper {
  width: 550px;
  height: 720px;
  overflow: visible;
  flex-shrink: 0;
  position: relative;
}
```

No media query <=460px (TopTrumpsCard.css linha 300):
```css
.tt-card-wrapper {
  width: calc(550px * 0.54);
  height: calc(720px * 0.54);
  overflow: hidden;
}
```

Ou seja: DOM box do mini card = 297×389px (antes de aplicar o `.tt-card--mini`).

### Com scale(0.33) do `.tt-card--mini` (linha 2380-2384):
```
Largura visual: 550 × 0.33 = 181.5px
Altura visual:  720 × 0.33 = 237.6px
```

### Wrapper atual (linha 2371-2378):
```css
.tt-card--mini-wrapper {
  height: 130px;       ← fixo
  overflow: hidden;    ← corta excesso
}
```

### Altura ideal para mostrar o card inteiro:
```
720 × 0.33 = 237.6px ≈ 238px
```

**Atualmente:** wrapper com 130px de altura corta **~108px da parte de baixo** do card (237 − 130 = 107px).

### Efeito do `transform-origin: top center`
- **Corta a parte de BAIXO.** O `transform-origin: top center` ancora o topo do card no topo do wrapper. O `overflow: hidden` corta tudo que excede 130px para baixo.

---

## 6️⃣  Diagnóstico consolidado

### Botão de som
| Pergunta | Resposta |
|----------|----------|
| Está dentro ou fora do container de jogo? | **FORA.** É filho direto de `section.tt-page`, antes de `div.tt-game-container` |
| Qual CSS controla sua posição? | `position: fixed; top: 1rem; right: 1rem` — flutua na viewport |
| O que precisa mudar para centralizá-lo? | Mover o `<button>` para dentro do `.tt-game-container` no JSX; trocar `position: fixed` para algo que flua com o layout |

### VS heartbeat glow
| Pergunta | Resposta |
|----------|----------|
| `.tt-vs-heartbeat-glow` tem `display: none`? | **Sim.** Linha **2441** |
| `.tt-vs-heartbeat-glow::after` tem `display: none`? | **Sim.** Linha **2444** |
| Por que o círculo de pulsação não aparece? | Foi desligado propositalmente. Apenas o texto "VS" está visível com gradiente + drop-shadow |
| O que precisa mudar para ativá-lo? | Trocar `display: none` → `display: block` nas linhas 2441 e 2444. Ajustar dimensões/posição se necessário |

### VS posicionamento
| Pergunta | Resposta |
|----------|----------|
| O VS está após o player card ou antes? | **APÓS** o player card — ordem: header → player → **VS** → mini → footer |
| Qual margin controla a distância entre VS e a carta? | **Nenhuma.** Não há margin ou gap entre `.tt-player-card-wrapper` e `.tt-vs-heartbeat`. O espaço vem do `padding: 6px 0` do próprio VS |

### Mini card
| Pergunta | Resposta |
|----------|----------|
| Com scale(0.33), qual height ideal no wrapper para mostrar o card inteiro? | **~238px** (720 × 0.33) |
| O `transform-origin: top center` corta a parte de baixo ou de cima? | **Parte de BAIXO** — o topo ancora no topo do wrapper, o overflow:hidden corta o excesso inferior |

### Ordem atual vs desejada
```
Desejada:  Header → Player Card → VS → Mini Card → Footer
Atual:     Header → Player Card → VS → Mini Card → Footer ✅
```

**A ordem já está correta.** O problema de layout anterior (carta cortada) foi resolvido pelo fix anterior (mini card height 130px). O corte atual de 108px no mini card é intencional (mystery card parcial) — se quiser o card inteiro, subir wrapper height para 238px.
