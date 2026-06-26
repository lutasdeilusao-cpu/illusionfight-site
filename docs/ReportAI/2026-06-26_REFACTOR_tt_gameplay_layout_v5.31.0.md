# Top Trumps SP — Gameplay Layout Redesign

**Data:** 2026-06-26
**Versão:** TS 5.31.0 | SITE 10.169.0
**Status:** CORRIGIDO

## Problema

Usuário reportou que o layout da tela de gameplay do Top Trumps SP tinha:
1. Carta do oponente no topo — desperdiçava espaço, design mal aproveitado
2. Carta do oponente cortada (cut off) — `height: 90px; overflow: hidden` escondia 55% da carta
3. Carta do jogador no final — espaço visual mal distribuído
4. Muito espaço vazio entre os elementos

## Mudanças realizadas

### JSX — TopTrumps.jsx:886-920

**Antes:** opponent-mini-wrapper → VS → player-card-wrapper → footer

```jsx
<div className="tt-opponent-mini-wrapper">...</div>
<div className="tt-vs-heartbeat">...</div>
<div className="tt-player-card-wrapper">...</div>
<div className="tt-game-footer">...</div>
```

**Depois:** player-card-wrapper → VS → opponent-mini-wrapper → footer

```jsx
<div className="tt-player-card-wrapper">...</div>
<div className="tt-vs-heartbeat">...</div>
<div className="tt-opponent-mini-wrapper">...</div>
<div className="tt-game-footer">...</div>
```

### CSS — TopTrumps.css:2352-2364

| Propriedade | Antes | Depois |
|---|---|---|
| `.tt-opponent-mini-wrapper` | `margin-bottom: 0.15rem` | `margin-top: 0.1rem; padding-bottom: 0.15rem` |
| `.tt-card--mini-wrapper` | `height: 90px; overflow: hidden` | removido (card totalmente visível) |
| `.tt-card--mini-wrapper` | `align-items: flex-start` | `align-items: center` |
| `.tt-card--mini` | `scale(0.28); transform-origin: top center` | `scale(0.30); transform-origin: center` |
| `.tt-player-card-wrapper` | `align-items: center` | `align-items: flex-start; padding-top: 0.3rem` |

### Detalhamento

1. **Swap DOM order** — player card agora é o primeiro elemento no flex container, recebendo `flex: 1` e ocupando o espaço principal. Opponent card vai para depois do VS, acima do footer.

2. **Opponent card sem corte** — removido `height: 90px` e `overflow: hidden` do `.tt-card--mini-wrapper`. O card em scale(0.30) tem 720 × 0.30 = 216px de altura, completamente visível.

3. **Opponent card escala** — ajustado de 0.28 para 0.30 (~40% da altura visível da carta do jogador em viewport mobile típico).

4. **Transform origin** — mudado de `top center` para `center` para centralizar verticalmente no wrapper.

5. **Player card alinhamento** — mudado de `align-items: center` (vertical center) para `align-items: flex-start` (topo), posicionando a carta no início do espaço disponível.

## Grep de confirmação

```bash
grep -n "tt-opponent-mini-wrapper\|tt-player-card-wrapper\|tt-card--mini-wrapper\|tt-card--mini" src/pages/games/TopTrumps/TopTrumps.jsx src/pages/games/TopTrumps/TopTrumps.css
```

Resultado JSX:
- Linha 886: `<div className="tt-player-card-wrapper">` (antes era opponent)
- Linha 901: `<div className="tt-vs-heartbeat">`
- Linha 905: `<div className="tt-opponent-mini-wrapper">` (antes era player)

Resultado CSS:
- Linha 2352: `.tt-opponent-mini-wrapper { margin-top: 0.1rem; ... }`
- Linha 2360: `.tt-card--mini-wrapper { width: 100%; display: flex; ... }` (sem height/overflow)
- Linha 2361: `.tt-card--mini { transform: scale(0.30); ... }`
- Linha 2362: `.tt-player-card-wrapper { align-items: flex-start; padding-top: 0.3rem; }`

## Build

`npm run build` — sucesso, 0 erros.

## Versões

| Constante | Antes | Depois |
|---|---|---|
| TS_VERSION | 5.30.0 | **5.31.0** |
| SITE_VERSION | 10.168.0 | **10.169.0** |

## Commit

`e517c54b` — "refactor: tt gameplay layout — player card top, opponent card bottom (40%), fix cut-off + v10.169.0"

## Deploy

Published — GitHub Pages gh-pages branch.

## Teste manual pendente

- Verificar se a carta do oponente aparece completa (sem corte) em mobile + desktop
- Verificar proporção ~40% entre carta do oponente e carta do jogador
- Verificar se o botão GIVE UP ainda está acessível (deve ficar no final, abaixo da carta do oponente)
- Testar em viewport pequeno (~360×640) e grande (~1440×900)
- Verificar se o VS heartbeat animation ainda funciona corretamente
- Verificar fase `resultado_rodada` se o layout também precisa de ajuste similar
