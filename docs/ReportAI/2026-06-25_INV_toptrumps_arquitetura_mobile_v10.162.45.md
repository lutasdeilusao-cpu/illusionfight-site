# INVESTIGAÇÃO: Arquitetura Mobile Top Trumps

**Data:** 2026-06-25
**Versão atual (SITE):** 10.162.45
**Tipo:** INV (investigação pura — sem edições)
**Arquivos analisados:**
- `src/pages/TopTrumps.jsx` (1096 linhas)
- `src/pages/TopTrumps.css` (2220 linhas)
- `src/components/TopTrumpsCard/TopTrumpsCard.jsx` (134 linhas)
- `src/components/TopTrumpsCard/TopTrumpsCard.css` (311 linhas)

---

## 1️⃣ Outputs brutos dos comandos solicitados

### Grep `useSwipe`

```
PS C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI> grep -rn "useSwipe" src/
(empty — nenhum resultado)
```

### Grep `swipe`

```
PS C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI> grep -rn "swipe" src/
(empty — nenhum resultado)
```

### Grep `touch` (TopTrumps)

```
PS C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI> grep -rn "touch" src/pages/TopTrumps.jsx src/pages/TopTrumps.css
(empty — nenhum resultado)
```

### Grep `@media` (TopTrumps)

```
PS C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI> grep -rn "@media" src/pages/TopTrumps.css
(empty — 0 @media queries no CSS principal)
```

```
PS C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI> grep -rn "@media" src/components/TopTrumpsCard/TopTrumpsCard.css
src/components/TopTrumpsCard/TopTrumpsCard.css:272: @media (min-width: 769px) and (max-width: 1200px) {
src/components/TopTrumpsCard/TopTrumpsCard.css:286: @media (min-width: 461px) and (max-width: 768px) {
src/components/TopTrumpsCard/TopTrumpsCard.css:300: @media (max-width: 460px) {
```

### Grep flex-wrap / flex-direction: column (TopTrumps)

```
PS C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI> grep -rn "flex-wrap" src/pages/TopTrumps.css
(empty — nenhum)

PS C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI> grep -rn "flex-direction.*column" src/pages/TopTrumps.css
271: .tt-game-header { display: flex; flex-direction: column; }
483: .tt-game-cards { display: flex; flex-direction: row; }
497: .tt-select-attr-panel { display: flex; flex-direction: column; }
693: .tt-end-msg { display: flex; flex-direction: column; }
783: .tt-card-options-area { display: flex; flex-direction: column; }
814: .tt-ia-card-area { display: flex; flex-direction: column; }
```

### Grep `transform: translateX` / `scrollIntoView` (TopTrumps)

```
PS C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI> grep -rn "translateX" src/pages/TopTrumps.jsx src/pages/TopTrumps.css
(empty — nenhum)

PS C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI> grep -rn "scrollIntoView" src/pages/TopTrumps.jsx
(empty — nenhum)
```

---

## 2️⃣ Mapeamento JSX das fases do jogo

### Estado `fase === 'menu'` (linhas 98–216)

```
.tt-menu-container
  ├── .tt-header
  │     └── título + logoTipo + descrição
  ├── .tt-options
  │     ├── .tt-option-button("Jogar Solo" → setFase('jogando') + initSolo)
  │     ├── .tt-option-button("Jogar Dupla" → setFase('jogando') + initMulti)
  │     ├── .tt-option-button("Multijogador" → navega /games/toptrumps-mp)
  │     └── .tt-option-button("Regras" → mostra regras)
  ├── .tt-rules (condicional)
  └── .tt-mobile-presets (condicional — NOTA: só tem um comentário "em breve")
```

**Observação:** `.tt-mobile-presets` existe no JSX (`{mobilePresetsVisivel && ...}`) mas está vazio (apenas um placeholder "Em breve"). O state `mobilePresets` é setado como `true` via um botão "Mobile Presets", mas não há conteúdo implementado.

### Estado `fase === 'jogando'` (linhas 225–591)

```
.tt-game-container
  ├── .tt-game-header (flex-direction: column)
  │     ├── .tt-game-title ("Rodada X")
  │     └── .tt-game-subtitle (info do jogador + pontuação)
  │
  ├── .tt-game-cards (flex-direction: row → container flex horizontal)
  │     ├── Div da carta do jogador (se revelada)
  │     │     ├── <TopTrumpsCard> com props: characterImage, name, description, attributes, onAttributeClick
  │     │     └── .tt-card-owner-label ("Sua Carta")
  │     └── Div da carta do oponente/IA
  │           ├── <TopTrumpsCard> com props: faceDown (se oculta), characterImage, name, description, attributes
  │           └── .tt-card-owner-label ("Adversário")
  │
  ├── .tt-select-attr-panel (flex-direction: column)
  │     └── .tt-select-attr-title ("Escolha seu atributo")
  │     └── .tt-attr-options (grid 3×3)
  │           └── .tt-attr-option × N (botões de atributo)
  │
  ├── .tt-ia-card-area (flex-direction: column)
  │     └── se IA já escolheu → revela carta + atributo escolhido
  │
  └── .tt-card-options-area (flex-direction: column)
        └── .tt-card-option × N (cartas na mão do jogador — multi-turno)
```

### Estado `fase === 'resultado_rodada'` (linhas 595–680)

```
.tt-result-container
  ├── .tt-result-title ("Você venceu!" / "Você perdeu!" / "Empate!")
  ├── .tt-result-detalhes (atributo comparado, valores)
  │     ├── .tt-result-jogador (nome + valor)
  │     └── .tt-result-adversario (nome + valor)
  └── .tt-result-btn ("Próxima Rodada" → nova rodada ou fim de jogo)
```

### Especial: `fase === 'fim_de_jogo'` / `fase === 'game_over'`

```
.tt-end-container
  ├── .tt-end-victory / .tt-end-defeat
  ├── .tt-end-msg (flex-direction: column)
  │     ├── título ("Você venceu o jogo!")
  │     ├── subtítulo (resumo, cartas restantes)
  │     └── estatísticas (se houver)
  └── .tt-end-buttons
        ├── .tt-option-button("Voltar ao Menu")
        └── .tt-option-button("Jogar Novamente")
```

---

## 3️⃣ Mapeamento CSS atual — responsividade e layout mobile

### TopTrumps.css (2220 linhas) — NENHUMA `@media` query

- **`tt-game-cards`** (linha 483): `display: flex; flex-direction: row; gap: 1rem; justify-content: center; flex-wrap: nowrap;`
  - **Problema:** força layout horizontal sem quebra. Em viewport < 1100px de largura, duas cartas de 550px cada não cabem lado a lado (precisam de 1100px + gaps). Como não há `flex-wrap: wrap`, vaza horizontalmente.
- **Todas as classes de layout da fase `jogando`** usam `rem`/`px` fixos para larguras máximas, sem breakpoints.
- Container `.tt-game-container` (linha 472): `max-width: 1200px; margin: 0 auto;`
- Não existe classe `.tt-mobile-*` em lugar nenhum do CSS.

### TopTrumpsCard.css (311 linhas) — 3 @media queries (APENAS escala proporcional)

| Breakpoint | Scale | Técnica |
|---|---|---|
| 769–1200px | `0.75` (412.5×540) | `transform: scale()` + wrapper dimensionado |
| 461–768px | `0.62` (341×446.4) | `transform: scale()` + wrapper dimensionado |
| ≤460px | `0.54` (297×388.8) | `transform: scale()` + wrapper dimensionado |

**Problema:** `transform: scale()` apenas reduz a carta visualmente, mas:
- O elemento DOM mantém 550×720px originais. O wrapper tem `overflow: hidden`, então o excesso some.
- Areas clicáveis (atributos) mantêm as coordenadas originais de hitbox. Em telas pequenas, a escala visual é de 0.54, mas o click target ainda corresponde ao bounding box original.
- Cartas em `flex-direction: row` no pai não se beneficiam da escala: duas cartas escaladas 0.54 ocupam 2 × 297px = 594px + gaps, o que ainda não cabe em viewports < ~640px sem overflow.

---

## 4️⃣ Estado de swipe/deslize horizontal

**Não existe swipe implementado em nenhum arquivo do projeto Top Trumps.**

- Nenhum hook `useSwipe` importado ou definido no JSX.
- Nenhum `onTouchStart`/`onTouchMove`/`onTouchEnd` nos elementos.
- Nenhuma `transform: translateX(...)` para animar deslize horizontal.
- Nenhum `scrollIntoView` para scroll programático.
- Nenhuma dependência de biblioteca de swipe/swiper (ex: `swiper.js`, `react-swipeable`).

---

## 5️⃣ Props do componente TopTrumpsCard

Definição em `TopTrumpsCard.jsx:28-39`:

| Prop | Tipo | Default | Onde é usada |
|---|---|---|---|
| `characterImage` | string (URL) | — | bg do personagem |
| `name` | string | `''` | `.tt-card-name` |
| `description` | string | `''` | `.tt-card-description` |
| `locale` | `'pt'\|'en'\|'es'` | `'pt'` | lookup em `CARD_LABELS` |
| `attributes` | object `{}` | `{}` | valores dos stats |
| `faceDown` | boolean | `false` | mostra verso (? icon) |
| `mystery` | boolean | `false` | mostra `???` + `CardInterrogation.png` |
| `onAttributeClick` | function | — | callback ao clicar num atributo |
| `disabled` | boolean | `false` | desabilita clicks nos atributos |
| `templateIndex` | number | `0` | qual template PNG usar (0–5) |

**Observação importante:** O JSX de `TopTrumps.jsx` passa props usando `carta={{...}}` onde `carta` é um objeto do deck. As props efetivamente passadas dependem de como o objeto `carta` é montado, que é feito via `fetchPersonagens` e contém as chaves do JSON original (`characterImage`, `name`, `description`, `attributes`).

Os nomes das props no componente **não correspondem** exatamente às chaves do JSON de personagens — por exemplo, no JSX principal vemos que o spread `{...carta}` passa `characterImage` que vem da chave `characterImage` do JSON, e `attributes` que vem de `carta.attributes`.

---

## Diagnóstico resumido

| Aspecto | Status | Risco |
|---|---|---|
| Responsivo CSS (TopTrumps.css) | ❌ Nenhuma `@media` query | 2220 linhas sem adaptação mobile |
| Responsivo CSS (TopTrumpsCard.css) | ⚠️ Só scale() | Hitbox não escala, overflow oculto |
| Layout duas cartas lado a lado | ❌ flex-row sem wrap | Não cabe em <1100px |
| Swipe horizontal | ❌ Não existe | Navegação vertical apenas |
| `useSwipe` hook | ❌ Não existe no projeto | — |
| Container `tt-game-cards` | ❌ `nowrap` + `row` | Vaza horizontal em mobile |
| Painel `.tt-mobile-presets` | ❌ Placeholder vazio | "Em breve" nunca implementado |
| Estado `mobilePresets` | ⚠️ Existe no JSX | Seta true mas sem conteúdo |
| Classes `.tt-mobile-*` | ❌ Nenhuma no CSS | — |
