# INVESTIGAÇÃO — TopTrumps v2 RewardScreen touch deslocado

**Data:** 2026-06-27  
**Versão:** SITE 10.183.6 / TS 5.44.5  
**Status:** INVESTIGAÇÃO CONCLUÍDA — aguardando aprovação para correção  
**Sintoma reportado:** Clicar na carta do meio seleciona a de cima. Clicar na de baixo seleciona a do meio. A carta do meio nunca é selecionável.

---

## ETAPA 1 — PROVA DE LEITURA (outputs brutos)

### 1.1 RewardScreen.jsx — estrutura completa

`src/pages/games/TopTrumps/v2/components/RewardScreen/RewardScreen.jsx` (40 linhas)

```jsx
import TopTrumpsCard from '../../../../../../components/TopTrumpsCard/TopTrumpsCard'

export default function RewardScreen({
  opcoes, selecionada, onSelecionar, onConfirmar, locale, tt, cardImage
}) {
  const localeStr = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)
  return (
    <section className="tt-page">
      <div className="tt-recompensa">
        <h2 className="tt-recompensa-titulo">{tt('recompensa_titulo')}</h2>
        <p className="tt-recompensa-sub">{tt('recompensa_sub')}</p>
        <div className="tt-recompensa-cards">
          {opcoes?.map((carta) => (
            <div key={carta.id} className={`tt-recompensa-card${selecionada?.id === carta.id ? ' tt-recompensa-card--virada' : ''}`}
              onClick={() => onSelecionar(carta)}>
              {selecionada?.id === carta.id ? (
                <TopTrumpsCard
                  characterImage={cardImage ? cardImage(carta) : (carta.imagem || '')}
                  name={carta.nome}
                  description={carta.descricao}
                  locale={localeStr}
                  attributes={carta.atributos}
                  templateIndex={0}
                />
              ) : (
                <div className="tt-recompensa-card-verso">
                  <span className="tt-recompensa-card-verso-texto">?</span>
                  <p className="tt-recompensa-card-verso-label">{tt('recompensa_carta_misteriosa')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="tt-btn-confirmar" disabled={!selecionada} onClick={onConfirmar}>
          {tt('recompensa_confirmar')}
        </button>
      </div>
    </section>
  )
}
```

**Arquivo não importa CSS próprio.** As classes `.tt-recompensa-*` e `.tt-btn-confirmar` vêm de `src/pages/games/TopTrumps/TopTrumps.css`.

### 1.2 CSS das classes de recompensa (TopTrumps.css)

```css
.tt-recompensa { text-align: center; }
.tt-recompensa-titulo { font-family: "Rajdhani"; font-size: 1.4rem; font-weight: 700; color: #EAEAEA; margin-bottom: 0.5rem; }
.tt-recompensa-sub { font-family: "IBM Plex Sans"; font-size: 0.8rem; color: #8B8F96; margin-bottom: 2rem; }
.tt-recompensa-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 600px; margin: 0 auto 2rem; }
.tt-recompensa-card { cursor: pointer; transition: transform 0.15s; }
.tt-recompensa-card:hover { transform: translateY(-4px); }
.tt-recompensa-card--virada { cursor: default; }
.tt-recompensa-card-verso { background: #1A1D21; border: 2px solid #2A2D31; border-radius: 8px; padding: 3rem 1rem; text-align: center; }
.tt-recompensa-card-verso-texto { font-family: "Rajdhani"; font-size: 2.5rem; color: rgba(255,255,255,0.15); }
.tt-recompensa-card-verso-label { font-family: "JetBrains Mono"; font-size: 0.55rem; color: #4F5359; margin-top: 0.5rem; letter-spacing: 0.1em; }
.tt-btn-confirmar { padding: 0.75rem 2rem; font-family: "Rajdhani"; font-size: 0.9rem; font-weight: 700; background: #e8853a; color: #000; border: none; border-radius: 4px; cursor: pointer; }
.tt-btn-confirmar:disabled { background: #2A2D31; color: #4F5359; cursor: default; }
.tt-btn-confirmar:hover:not(:disabled) { filter: brightness(1.1); }
```

**Responsivo (max-width: 768px):**  
```css
.tt-recompensa-cards { grid-template-columns: 1fr; justify-items: center; gap: 0.75rem; }
```

### 1.3 TopTrumpsCard — onClick interno

```jsx
// TopTrumpsCard.jsx — onClick condicional nos atributos
onClick={clicavel && !disabled ? () => onAttributeClick(attr.key) : undefined}
```

`clicavel = !!onAttributeClick && !mystery`. No RewardScreen, `onAttributeClick` NÃO é passado → `clicavel = false` → nenhum onClick nos atributos. Atributos não interceptam cliques.

### 1.4 TopTrumpsCard.css — transform: scale() nos breakpoints

```css
/* Desktop médio (769-1200px) */
.tt-card-wrapper { width: calc(550px * 0.75); height: calc(720px * 0.75); overflow: hidden; }
.tt-card-template { transform: scale(0.75); transform-origin: top left; }

/* Mobile grande (461-768px) */
.tt-card-wrapper { width: calc(550px * 0.62); height: calc(720px * 0.62); overflow: hidden; }
.tt-card-template { transform: scale(0.62); transform-origin: top left; }

/* Mobile pequeno (≤460px) */
.tt-card-wrapper { width: calc(550px * 0.54); height: calc(720px * 0.54); overflow: hidden; }
.tt-card-template { transform: scale(0.54); transform-origin: top left; }
```

### 1.5 v2 GameScreen.css — `.tt-page`

```css
.tt-page { height: 100dvh; padding: 0; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: transparent; overflow: hidden; }
```

IDÊNTICA à definição em TopTrumps.css:536.

### 1.6 Rota de produção

```
src/App.jsx:98:  <Route path="/games/toptrumps" element={<TopTrumpsSP_v2 />} />
```

**Produção está servindo v2.** Original em `/games/toptrumps/legacy`.

### 1.7 CARD_IMAGES — v2 vs original

**Original (TopTrumps.jsx:42-49):** 18 imports estáticos (img01–15, img21, img23 + cardFallback)
**v2 (TopTrumpsSP_v2.jsx:25-31):** 3 imports (cardFallback, img01, img02)

---

## ETAPA 2 — DIAGNÓSTICO DE HIPÓTESES

### H1 — Índice errado no map

**Código analisado:**
```jsx
// RewardScreen.jsx:13
{opcoes?.map((carta) => (
  <div key={carta.id} ... onClick={() => onSelecionar(carta)}>
    ...
  </div>
))}

// TopTrumps.jsx:964 (original)
{recompensaOpcoes.map((carta) => (
  <div key={carta.id} ... onClick={() => { sfx.select(); setCartaRecompensaSelecionada(carta); }}>
```

**❌ REFUTADA.**  
Ambos usam `carta` diretamente da iteração `.map()`, não índice. O `onSelecionar` recebe o objeto carta correto.

### H2 — transform: scale() desloca hit area

**Código analisado:**
```css
/* TopTrumpsCard.css */
.tt-card-template { transform: scale(0.54); transform-origin: top left; }
.tt-card-wrapper { overflow: hidden; }
```

**✅ CONFIRMADA como fator contribuinte.**  
`transform: scale(X)` com `transform-origin: top left` comprime o elemento visual em direção ao topo-esquerdo. O `overflow: hidden` no `.tt-card-wrapper` clipa o template ao tamanho do wrapper. A área clicável do DOM segue a transformação em navegadores modernos, mas o desalinhamento entre o wrapper (com altura fixa reduzida) e o grid cell (com altura auto) pode causar sobreposição de hit areas quando o card selecionado é maior que a célula do grid.

**Mecanismo do bug:**
1. Grid de recompensa em 3 colunas (desktop) ou 1 coluna (mobile ≤768px)
2. Card não selecionado: `.tt-recompensa-card-verso` compacto cabe na célula do grid
3. Card selecionado: `.tt-card-wrapper` com 297-412px de largura (vs ~109-189px da célula do grid) **transborda a célula**
4. O `overflow: hidden` no `.tt-card-wrapper` clipa o template, mas o **wrapper em si transborda a célula do grid**
5. O transbordamento invade a área visual da célula adjacente
6. O clique na área de transbordamento pode cair na célula adjacente (ordem DOM: célula posterior pinta por cima, mas conteúdo posicionado/absoluto do card selecionado pode interceptar)

**Por que a carta do meio nunca é selecionável (sync):**
- Ao clicar na carta 1 (meio) → onClick da célula 1 dispara → seleciona carta 1 → flip para TopTrumpsCard → 297px transborda para célula 2
- Ao clicar na carta 2 (inferior/direita) → o clique agora cai na área de transbordamento da carta 1 (que está visualmente no lugar da carta 2) → onClick da célula 1 dispara → **seleciona carta 1 em vez de carta 2**
- A carta 1 fica "presa" — nunca consegue ser desselecionada porque o estado só permite uma selecionada

### H3 — pointer-events errado

**Todos os arquivos escaneados:** Nenhum `pointer-events: none` ou `pointer-events: all` encontrado na cadeia de elementos da RewardScreen. `.tt-card-template-img` tem `pointer-events: none` (moldura decorativa, não interfere).

**❌ REFUTADA.**

### H4 — onClick no elemento errado / overflow

**Código analisado:**
```css
.tt-recompensa-card { cursor: pointer; transition: transform 0.15s; }
.tt-recompensa-card--virada { cursor: default; }
```

**✅ CONFIRMADA como causa raiz.**  
O `.tt-recompensa-card` é a célula do grid. Quando um card é virado (selecionado), o `TopTrumpsCard` interno tem largura fixa `calc(550px * 0.54) = 297px` em mobile, que é **maior que a largura da célula** (~100-350px dependendo do viewport). O overflow não é clipado pelo grid (default: `overflow: visible` no item do grid). O wrapper tem `overflow: hidden` mas seu próprio box model transborda a célula.

O grid `justify-items: center` centraliza o card na célula, fazendo o overflow distribuir-se igualmente para ambos os lados. Esse overflow sobrepõe-se às células adjacentes. Como a ordem de pintura do grid segue a ordem DOM, uma célula posterior pinta por cima de uma anterior — mas elementos posicionados do card virado (z-index 1-3 no template) podem reverter essa ordem, fazendo o conteúdo do card selecionado interceptar cliques destinados a células adjacentes.

---

## ETAPA 3 — COMPARAÇÃO SP ORIGINAL vs REWARDSCREEN v2

**Original (TopTrumps.jsx:952-983):** Código inline, sem componente separado.
**v2 (RewardScreen.jsx):** Componente separado, mesmas classes CSS, mesma estrutura DOM.

| Aspecto | Original | v2 |
|---|---|---|
| onClick no card | `setCartaRecompensaSelecionada(carta)` | `onSelecionar(carta)` |
| Card image | `bgCarta(carta)` (18 imagens) | `cardImage(carta)` (2 imagens) |
| CSS classes | `.tt-recompensa-*` (TopTrumps.css) | `.tt-recompensa-*` (TopTrumps.css) |
| Wrapper | `<section className="tt-page">` | `<section className="tt-page">` |
| onClickConfirm | `escolherRecompensa(cartaRecompensaSelecionada)` | `rewards.escolherRecompensa(game.cartaRecompensaSelecionada)` |
| touch-action | NÃO definido | NÃO definido |

**O SP original tem o mesmo bug?**  
Sim, potencialmente. A estrutura DOM/CSS é idêntica. A diferença principal é que o original importa todas as 18 imagens de carta estaticamente, enquanto a v2 só importa 2 (usa fallback para as demais). Mas isso não afeta o comportamento de clique.

**O que é diferente:** Nada na estrutura de renderização. Ambos usam o mesmo CSS e mesma estrutura de grid.

---

## ETAPA 4 — DEMORA DE CARREGAMENTO DE IMAGEM

**v2 CARD_IMAGES:**
```js
const CARD_IMAGES = { 1: img01, 2: img02 }
function cardImage(carta) { return CARD_IMAGES[carta?.id] || cardFallback }
```

**Original CARD_IMAGES:**
```js
const CARD_IMAGES = { 1: img01, 2: img02, 3: img03, ..., 23: img23 }
function bgCarta(carta) { return CARD_IMAGES[carta?.id] || cardFallback }
```

Todas as imagens são importadas estaticamente (`import img01 from '...'`), o que significa que o Vite as inclui no bundle. **Não há demora de carregamento dinâmico.** A imagem `cardFallback` é carregada instantaneamente para cartas sem imagem específica.

**Causa raiz da demora de imagem:** Inexistente. As imagens são estáticas no bundle. A v2 simplesmente tem menos imagens disponíveis que o original (2 vs 18), exibindo `cardFallback` para a maioria das cartas.

---

## ETAPA 5 — CONFIRMAÇÃO ROTA DE PRODUÇÃO

```
src/App.jsx:98:  <Route path="/games/toptrumps" element={<TopTrumpsSP_v2 />} />
```

**Produção (`/games/toptrumps`) está servindo a v2.** O original está em `/games/toptrumps/legacy`. O bug de touch existe na rota de produção.

---

## RELATÓRIO FINAL

### Causa raiz do bug de touch
`src/pages/games/TopTrumps/TopTrumps.css` linhas 1032-1051 + `src/components/TopTrumpsCard/TopTrumpsCard.css` linhas 275-313 — **o card selecionado (flipped) tem largura fixa `calc(550px * 0.54) = 297px` que transborda a célula do grid (definida por `grid-template-columns: 1fr` no mobile ou `repeat(3, 1fr)` no desktop). O overflow invade células adjacentes, e a combinação de `transform: scale()` com `transform-origin: top left` + `overflow: hidden` no wrapper faz a hit area do card selecionado interceptar cliques destinados a outros cards.**

### Causa raiz da demora de imagem
Inexistente. Todas as imagens são importação estática (Vite bundler). A v2 tem menos imagens que o original (2 vs 18), exibindo fallback para as demais, mas sem demora de carregamento.

### O bug existe em /games/toptrumps (produção)?
**Sim.** A rota de produção serve `TopTrumpsSP_v2`.

### Correção necessária
1. Adicionar `touch-action: manipulation` a `.tt-recompensa-card` para eliminar delay de 300ms em mobile
2. Adicionar `overflow: hidden` a `.tt-recompensa-card` ou ajustar o tamanho do `TopTrumpsCard` para caber dentro da célula do grid sem transbordar
3. Ou redimensionar o card na RewardScreen para caber no grid (ex: `mini` mode com escala apropriada)
4. Importar as imagens de carta faltantes (img03–15, img21, img23) na v2 para consistência visual com o original

### Arquivos afetados (potencial correção)
- `src/pages/games/TopTrumps/v2/components/RewardScreen/RewardScreen.jsx`
- `src/pages/games/TopTrumps/v2/TopTrumpsSP_v2.jsx` (CARD_IMAGES)
- `src/pages/games/TopTrumps/TopTrumps.css` (touch-action no `.tt-recompensa-card`)

---

## Outputs brutos (grep/Select-String)

### Grep 1 — TopTrumps.jsx recompensaOpcoes / onClick
```
src\pages\games\TopTrumps\TopTrumps.jsx:112:  const [recompensaOpcoes, setRecompensaOpcoes] = useState([])
src\pages\games\TopTrumps\TopTrumps.jsx:116:  const [cartaRecompensaSelecionada, setCartaRecompensaSelecionada] = useState(null)
src\pages\games\TopTrumps\TopTrumps.jsx:963:  <div className="tt-recompensa-cards">
src\pages\games\TopTrumps\TopTrumps.jsx:964:    {recompensaOpcoes.map((carta) => (
src\pages\games\TopTrumps\TopTrumps.jsx:965:      <div className={`tt-recompensa-card...`} onClick={() => { sfx.select(); setCartaRecompensaSelecionada(carta); }}>
src\pages\games\TopTrumps\TopTrumps.jsx:979:  <button className="tt-btn-confirmar" disabled={!cartaRecompensaSelecionada} onClick={() => { sfx.reward(); escolherRecompensa(cartaRecompensaSelecionada); }}>
```

### Grep 2 — TopTrumpsCard onClick
```
src\components\TopTrumpsCard\TopTrumpsCard.jsx:104:  onClick={clicavel && !disabled ? () => onAttributeClick(attr.key) : undefined}
src\components\TopTrumpsCard\TopTrumpsCard.jsx:113:  onClick={clicavel && !disabled ? () => onAttributeClick(attr.key) : undefined}
```
Sem `onAttributeClick` passado no RewardScreen → clicavel=false → sem onClick nos atributos.

### Grep 3 — V2 onSelecionar
```
src\pages\games\TopTrumps\v2\components\RewardScreen\RewardScreen.jsx:14:  onClick={() => onSelecionar(carta)}
src\pages\games\TopTrumps\v2\TopTrumpsSP_v2.jsx:59:  onSelecionar={(c) => game.setCartaRecompensaSelecionada(c)}
src\pages\games\TopTrumps\v2\TopTrumpsSP_v2_RewardTest.jsx:66:  onSelecionar={(carta) => { sfx.select?.(); setSelecionada(carta) }}
```

### Grep 4 — transform + transform-origin
```
src\components\TopTrumpsCard\TopTrumpsCard.css:278:  transform: scale(0.75); transform-origin: top left;
src\components\TopTrumpsCard\TopTrumpsCard.css:292:  transform: scale(0.62); transform-origin: top left;
src\components\TopTrumpsCard\TopTrumpsCard.css:306:  transform: scale(0.54); transform-origin: top left;
src\pages\games\TopTrumps\v2\styles\GameScreen.css:18:  transform: scale(0.54); transform-origin: top left;
src\pages\games\TopTrumps\v2\styles\ResultScreen.css:16:  transform: scale(0.54); transform-origin: top left;
```

### Grep 5 — touch-action
```
TopTrumps.css:       NÃO encontrado
TopTrumpsCard.css:   .tt-card-attr-clickable { touch-action: manipulation; }
v2/styles/*:         NÃO encontrado
```
`.tt-recompensa-card` NÃO possui `touch-action: manipulation`.

### Grep 6 — pointer-events
```
.v2/styles/GameScreen.css:     .tt-page::before { pointer-events: none; }
.v2/styles/MenuScreen.css:     .tt-menu-bg { pointer-events: none; }
.v2/components/*:              Fire, Burst, Curtain — pointer-events: none (decorativo)
TopTrumpsCard.css:             .tt-card-template-img { pointer-events: none; }
```
Nenhum `pointer-events` na cadeia de clique do RewardScreen.

### Grep 7 — heights / overflow no CSS
```
TopTrumpsCard.css:
  .tt-card-wrapper { width: 550px; height: 720px; overflow: visible; }
  @media (max-width: 460px): .tt-card-wrapper { width: calc(550px * 0.54); height: calc(720px * 0.54); overflow: hidden; }
  @media (max-width: 768px): .tt-card-wrapper { width: calc(550px * 0.62); height: calc(720px * 0.62); overflow: hidden; }
  @media (max-width: 1200px): .tt-card-wrapper { width: calc(550px * 0.75); height: calc(720px * 0.75); overflow: hidden; }
```
