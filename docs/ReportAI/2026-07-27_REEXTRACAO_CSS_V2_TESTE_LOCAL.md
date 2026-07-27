# Reextração fiel CSS v2 — oficialização da v2 autossuficiente

Data: 2026-07-27  
Versões: SITE `10.192.29 → 10.192.30`; Top Trumps `5.44.9 → 5.44.10`

## Checkpoint

- HEAD inicial: `1980624d`
- Stashes preservados:
  - `stash@{0}: checkpoint-pre-mapeamento-toptrumps-images-2026-07-27`
  - `stash@{1}: checkpoint-pre-mapeamento-toptrumps-2026-07-27`
- Os dois CSVs não rastreados em `docs/Marketing/limpeza/Int/` foram reconhecidos pelo usuário como limpeza própria e permaneceram intocados.

## Prova de origem → destino

As regras abaixo mantêm os mesmos valores e declarações da fonte. A compactação de regras em uma linha nos módulos não altera o texto das declarações.

| Regra reextraída | Origem em `TopTrumps.css` | Destino modular | Confirmação |
|---|---:|---:|---|
| `.tt-game-container` | 2336 | `GameScreen.css:9` | `position`, `overflow`, `max-width: 480px` e `margin: 0 auto` idênticos |
| `.tt-opponent-mini-wrapper` | 2367 | `GameScreen.css:21` | `margin-top: 0` e `padding-bottom: 0.05rem` idênticos |
| `.tt-opponent-mini-label` | 2380 | `GameScreen.css:22` | bloco integral copiado |
| `.tt-player-card-wrapper .tt-card-wrapper` | 2399 | `GameScreen.css:17` | `max-height: 100%` idêntico |
| imagem dentro do card do jogador | 2400 | `GameScreen.css:18` | `max-height` e `object-fit` idênticos |
| `.tt-vs-heartbeat` | 2415 | `GameScreen.css:25` | `margin-bottom: 0` e bloco visual idênticos |
| `.tt-vs-heartbeat-glow` | 2427 | `GameScreen.css:26` | bloco integral copiado |
| `.tt-vs-heartbeat-glow::after` | 2437 | `GameScreen.css:27` | bloco integral copiado |
| `.tt-vs-heartbeat-text` | 2449 | `GameScreen.css:28` | bloco integral copiado |
| `tt-vs-heartbeat-pulse` | 2461 | `GameScreen.css:29` | keyframe integral copiado |
| `tt-vs-heartbeat-color` | 2465 | `GameScreen.css:30` | keyframe integral copiado |
| `.tt-btn-desistir` + estados | 2471–2476 | `GameScreen.css:32–33` | transição e estados idênticos |
| `.tt-confirm-overlay` | 1490 | `GameScreen.css:34` | `animation: ttFadeIn 0.2s ease` idêntica |
| `.tt-desistir-overlay` | 1893 | `GameScreen.css:52` | `animation: tt-fade-in 0.2s ease` idêntica |
| `.tt-desistir-modal` e derivados | 1905–1972 | `GameScreen.css:53–61` | blocos integrais copiados |
| `tt-fade-in` | 1976 | `GameScreen.css:62` | keyframe integral copiado |
| `tt-confirm-enter` vencedor no cascade | 2087 | `GameScreen.css:36` | escala inicial `0.9` copiada da última definição |
| mobile `.tt-confirm-modal`/`.tt-confirm-value-num` | 1466–1474 | `GameScreen.css:63` | media query integral copiada |
| `.tt-btn-deck-builder` + hover | 449–469 | `MenuScreen.css:33–34` | transições/estado idênticos |
| `.tt-link-album` + hover | 471–485 | `MenuScreen.css:35–36` | transição/estado idênticos |
| `.tt-locked-modal` | 2015–2029 | `MenuScreen.css:39` | borda laranja, 420px, shadow e animação idênticos |
| regras internas de menu/modal ausentes | 1880–2110 | `MenuScreen.css:37–67` | propriedades copiadas da fonte |
| `tt-confirm-enter` e `tt-fade-in` | 2087 e 1976 | `MenuScreen.css:68–69` | keyframes integrais copiados |
| `ttFadeIn` e `tt-bg-cycle` | 529 e 559 | `MenuScreen.css:71–72` | keyframes integrais copiados |
| `.tt-page` e `.tt-page::before` | 540–557 | `ResultScreen.css:3–4` | blocos integrais copiados |
| `tt-bg-cycle` | 559 | `ResultScreen.css:5` | keyframe integral copiado |
| `.tt-result-container` | 2349 | `ResultScreen.css:6` | padding físico `0.4rem 0.75rem 0.2rem` idêntico |
| `.tt-game-header` e derivados | 2355–2365 | `ResultScreen.css:7–11` | blocos integrais copiados |
| `.tt-result-val-you/sep/ai` | 2491–2493 | `ResultScreen.css:20–22` | valores idênticos |
| `.tt-cards-swipe-container` | 2494 | `ResultScreen.css:23` | `-webkit-user-select: none` copiado |
| `.tt-swipe-btn` + estados | 2513–2536 | `ResultScreen.css:30–31` | transição e estados idênticos |
| `.tt-btn-next-round` + estados | 2546–2551 | `ResultScreen.css:34–35` | transição e estados idênticos |
| mobile `.tt-onoma-texto` | 1481 | `CurtainReveal.css:86–89` | `font-size: 3rem` idêntico |

## Reconexões

| Componente | Import CSS conectado |
|---|---|
| `GameHUD.jsx` | `./GameHUD.css` |
| `SoundToggle.jsx` | `./SoundToggle.css` |
| `BurstParticles.jsx` | `./BurstParticles.css` |
| `FireParticles.jsx` | `./FireParticles.css` |

## Isolamento de produção

- O Shadow DOM e a rota temporária `/games/toptrumps/v2-css-test` foram removidos.
- O conflito comprovado era a importação estática de `TopTrumps.jsx` por `App.jsx`: `TopTrumps.jsx:42` importa `TopTrumps.css`, que o Vite colocava no CSS global inicial. Seletores compartilhados como `.tt-page--menu` (`TopTrumps.css:32`) e `.tt-sound-toggle` (`TopTrumps.css:2`) alcançavam a v2 antes de `/legacy` ser aberta.
- `TopTrumps.jsx` agora é carregado com `lazy()` exclusivamente pela rota `/games/toptrumps/legacy`; o build separou o monólito no chunk `TopTrumps-*.css`.
- `/games/toptrumps` e `/games/toptrumps/v2` continuam apontando para `TopTrumpsSP_v2`.
- `TopTrumps.css` permanece importado somente por `TopTrumps.jsx`.
- **A v2 em produção não depende mais de `TopTrumps.css`.**

## Imports antes/depois

| Arquivo | Antes | Depois |
|---|---|---|
| `App.jsx` | import estático de `TopTrumps`; import/rota Shadow DOM de teste | `lazy(() => import('./pages/games/TopTrumps/TopTrumps'))`; rota de teste removida |
| `TopTrumpsSP_v2.jsx` | sem import do monólito | continua sem import do monólito; CSS chega pelos componentes de cada tela |
| `GameScreen.jsx` | sem CSS próprio | `../../styles/GameScreen.css` |
| `MenuScreen.jsx` | sem CSS próprio | `../../styles/MenuScreen.css` |
| `ResultScreen.jsx` | sem CSS próprio | `../../styles/ResultScreen.css` |
| `CurtainReveal.jsx` | sem CSS próprio | `./CurtainReveal.css` |
| `GameHUD.jsx` | sem CSS próprio | `./GameHUD.css` |
| `SoundToggle.jsx` | sem CSS próprio | `./SoundToggle.css` |
| `BurstParticles.jsx` | sem CSS próprio | `./BurstParticles.css` |
| `FireParticles.jsx` | sem CSS próprio | `./FireParticles.css` |

## Validação

- `git diff --check`: aprovado.
- `npm run build`: aprovado com Vite 8.0.16, 1351 módulos transformados e 26 rotas pré-renderizadas.
- Sourcemap permaneceu habilitado e foi gerado.
- O build gerou `TopTrumps-*.css` (43,66 kB) como chunk separado da v1; o CSS principal caiu de 636,10 kB para 617,92 kB.
- Chromium headless, viewport 390×844:
  - menu inicial, configuração, escolha do deck e PPT: renderização visual conferida;
  - jogo: 50 classes `tt-*` renderizadas, zero classes sem seletor correspondente no CSSOM;
  - confirmação de desistência: overlay, modal, ações e botões renderizados;
  - resultado: 50 classes `tt-*` renderizadas, zero classes sem seletor correspondente no CSSOM;
  - zero `console.error` e zero `pageerror` em todo o fluxo.
- Arquivos de engine e `e2e/routes.spec.js`: intocados.
