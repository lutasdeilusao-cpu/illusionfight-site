# Diagnóstico de fidelidade — CSS modular v2 vs CSS real da v1

Data: 2026-07-27

Fonte da verdade: `src/pages/games/TopTrumps/TopTrumps.css`

Escopo: comparação somente-leitura. Nenhum CSS foi escrito, corrigido, recriado, movido ou reconectado.

## Conclusão executiva

A hipótese de que toda a tentativa modular era uma recriação visual pobre não se confirma por inteiro.

- `GameHUD.css`, `SoundToggle.css`, `BurstParticles.css` e `FireParticles.css` são cópias semanticamente fiéis dos blocos correspondentes do monólito.
- `CurtainReveal.css` copia fielmente todas as regras-base e keyframes, mas omite o override mobile de `.tt-onoma-texto`.
- A perda de fidelidade está concentrada em `GameScreen.css`, `MenuScreen.css` e `ResultScreen.css`.
- Nesses três arquivos existem 17 regras divergentes e 75 regras, pseudoestados, overrides ou keyframes ausentes, considerando a responsabilidade real dos respectivos JSX.
- A divergência estrutural mais grave é `.tt-game-container`: v1 usa `max-width: 480px`, `position: relative`, `overflow: hidden` e `margin: 0 auto`; a tentativa v2 usa `max-width: 1200px` e omite as outras três propriedades.
- O menu modular não levou 39 regras relevantes, incluindo textos, estados disabled, hover, modal completo e dois overrides mobile.
- O resultado modular não levou 17 regras relevantes, incluindo HUD compartilhado, cores dos valores, pseudoestados dos botões e fundo animado.
- A tentativa modular contém 16 nomes de keyframe contra 31 nomes únicos na v1. Faltam 15 nomes únicos globalmente.
- Os tokens não inventam uma paleta nova: todos os 12 valores correspondem a valores literais presentes na v1. O problema é cobertura, não adulteração dos valores.

## Metodologia

Foi usado um parser estrutural somente-leitura com balanceamento de chaves para:

1. separar regras-base, pseudoestados e regras dentro de `@media`;
2. preservar múltiplas ocorrências do mesmo seletor;
3. comparar propriedade por propriedade;
4. normalizar apenas espaços insignificantes;
5. resolver os tokens v2 para seus valores literais antes de classificar divergência;
6. associar ao componente as classes efetivamente presentes no JSX correspondente;
7. incluir os keyframes chamados pelas regras associadas.

Portanto, diferenças como:

```css
font-family: var(--font-rajdhani);
font-family: "Rajdhani", sans-serif;
```

foram classificadas como equivalentes, não como divergência.

## Passo 0 — Checkpoint

Output inicial:

```text
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
	deleted: docs/ReportAI/2026-07-18_FIX_READING_COMPLETION_GATE_v10.192.26.md
	deleted: docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.23.md
	deleted: docs/ReportAI/2026-07-27_INV_TOPTRUMPS_V1_V2_ORFAOS_v10.192.28.md

no changes added to commit
stash@{0}: On main: checkpoint-pre-mapeamento-toptrumps-images-2026-07-27
stash@{1}: On main: checkpoint-pre-mapeamento-toptrumps-2026-07-27
```

As três exclusões foram confirmadas pelo usuário como limpeza intencional de relatórios antigos. Elas foram preservadas. Os dois stashes permanecem intactos.

## Passos 1–3 — Comparação por arquivo e seletor

### 1. `GameHUD/GameHUD.css`

Resultado: 6 regras v1, 6 regras v2, 0 divergentes, 0 ausentes.

Todos os seletores são semanticamente idênticos:

```text
.tt-game-header
.tt-game-round
.tt-game-score
.tt-score-you
.tt-score-sep
.tt-score-ai
```

#### `.tt-game-header`

V1 real e v2 órfão:

```css
display: flex;
justify-content: space-between;
align-items: center;
width: 100%;
padding: 0.25rem 0;
flex-shrink: 0;
```

DIVERGÊNCIAS: nenhuma.

#### `.tt-game-round`

V1 real e v2 órfão:

```css
font-size: 0.72rem;
font-family: var(--font-accent, 'BringRace', sans-serif);
color: var(--color-accent, #f90);
text-transform: uppercase;
letter-spacing: 0.05em;
```

DIVERGÊNCIAS: nenhuma.

#### `.tt-game-score`

V1 real e v2 órfão:

```css
display: flex;
gap: 0.3rem;
align-items: center;
font-size: 0.85rem;
font-weight: 700;
```

DIVERGÊNCIAS: nenhuma.

#### `.tt-score-you`, `.tt-score-sep`, `.tt-score-ai`

V1 real e v2 órfão:

```css
.tt-score-you { color: var(--color-success, #4caf50); }
.tt-score-sep { color: var(--color-text-muted, #666); }
.tt-score-ai  { color: var(--color-danger, #f44); }
```

DIVERGÊNCIAS: nenhuma.

Veredito: fiel. O arquivo está desconectado, mas não foi simplificado.

### 2. `SoundToggle/SoundToggle.css`

Resultado: 3 regras v1, 3 regras v2, 0 divergentes, 0 ausentes.

#### `.tt-sound-toggle`

V1 real e v2 órfão:

```css
position: fixed;
top: 0.5rem;
left: 0;
right: 0;
margin: 0 auto;
z-index: 100;
width: 2.2rem;
height: 2.2rem;
border: 1px solid rgba(255,255,255,0.15);
border-radius: 50%;
background: rgba(0,0,0,0.5);
backdrop-filter: blur(6px);
font-size: 1.1rem;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
transition: background 0.2s, transform 0.15s;
```

DIVERGÊNCIAS: nenhuma.

#### `.tt-sound-toggle:hover`

V1 real e v2 órfão:

```css
background: rgba(255,255,255,0.12);
transform: scale(1.1);
```

DIVERGÊNCIAS: nenhuma.

#### `.tt-sound-toggle:active`

V1 real e v2 órfão:

```css
transform: scale(0.95);
```

DIVERGÊNCIAS: nenhuma.

Veredito: fiel. O problema é o componente estar desconectado, não seu CSS.

### 3. `BurstParticles/BurstParticles.css`

Resultado: 15 regras/keyframes v1, 15 v2, 0 divergentes, 0 ausentes.

Seletores e keyframes idênticos:

```text
.tt-particula
.tt-particula--ganhou
.tt-particula--perdeu
.tt-particula--empate
.tt-particula--va
.tt-particula--vb
.tt-particula--vc
.tt-particula--vd
.tt-particula--ve
.tt-particula--vf
@keyframes tt-burst-a
@keyframes tt-burst-b
@keyframes tt-burst-c
@keyframes tt-burst-d
@keyframes tt-burst-e
@keyframes tt-burst-f
```

> A contagem trata o grupo de variantes e keyframes conforme suas ocorrências estruturais; todas as propriedades comparadas são iguais.

#### `.tt-particula`

V1 real e v2 órfão:

```css
position: fixed;
z-index: 500;
border-radius: 50%;
pointer-events: none;
animation-fill-mode: forwards;
```

DIVERGÊNCIAS: nenhuma.

#### Variantes de resultado

V1 real e v2 órfão:

```css
.tt-particula--ganhou { background: #e8853a; }
.tt-particula--perdeu { background: #e74c3c; }
.tt-particula--empate { background: #fff; }
```

DIVERGÊNCIAS: nenhuma.

#### Variantes de posição/animação

V1 real e v2 órfão:

```css
.tt-particula--va { top: 10%; left: 20%; width: 8px; height: 8px; animation: tt-burst-a 1s ease-out forwards; }
.tt-particula--vb { top: 30%; left: 50%; width: 6px; height: 6px; animation: tt-burst-b 1.2s ease-out forwards; }
.tt-particula--vc { top: 60%; left: 80%; width: 10px; height: 10px; animation: tt-burst-c 0.9s ease-out forwards; }
.tt-particula--vd { top: 80%; left: 15%; width: 7px; height: 7px; animation: tt-burst-d 1.1s ease-out forwards; }
.tt-particula--ve { top: 50%; left: 35%; width: 14px; height: 14px; animation: tt-burst-e 1.3s ease-out forwards; }
.tt-particula--vf { top: 20%; left: 70%; width: 5px; height: 5px; animation: tt-burst-f 0.8s ease-out forwards; }
```

DIVERGÊNCIAS: nenhuma. Os seis keyframes também são idênticos propriedade por propriedade.

Veredito: fiel.

### 4. `CurtainReveal/CurtainReveal.css`

Resultado: todas as regras-base e os 5 keyframes são idênticos; falta 1 override mobile.

#### `.tt-curtain-overlay`

V1 real e v2 órfão:

```css
position: fixed;
inset: 0;
z-index: 900;
pointer-events: none;
animation: tt-curtain-open 1.2s ease-in-out forwards;
```

DIVERGÊNCIAS: nenhuma.

#### `.tt-curtain-inner`

V1 real e v2 órfão:

```css
position: absolute;
inset: 0;
background: linear-gradient(
  135deg,
  #e8853a 0%, #f4a227 20%,
  #e74c3c 40%, #9b59b6 60%,
  #3498db 80%, #e8853a 100%
);
background-size: 200% 200%;
clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
animation: tt-curtain-sweep 0.8s ease-in-out forwards;
```

DIVERGÊNCIAS: nenhuma efetiva. Nos dois lados há duas declarações `animation` no bloco; a segunda sobrescreve `tt-curtain-gradient`. Isso é comportamento herdado da v1, não divergência da extração.

#### `.tt-curtain-onomatopeia`

V1 real e v2 órfão:

```css
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
z-index: 10;
animation: tt-onoma-appear 0.8s ease-out forwards;
```

DIVERGÊNCIAS: nenhuma.

#### `.tt-onoma-texto`

Regras-base v1 e v2:

```css
font-family: "Bangers", cursive;
font-size: 6rem;
font-weight: 900;
color: #ffeb3b;
text-shadow:
  4px 4px 0 #e8853a,
  -2px -2px 0 #e8853a,
  2px -2px 0 #e8853a,
  -2px 2px 0 #e8853a,
  0 0 20px rgba(255, 235, 59, 0.8),
  0 0 60px rgba(232, 133, 58, 0.6);
letter-spacing: 0.05em;
display: inline-block;
animation: tt-onoma-impact 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.2) forwards;
transform-origin: center;
```

DIVERGÊNCIAS:

- regra-base: nenhuma;
- ausente no v2:

```css
@media (max-width: 768px) {
  .tt-onoma-texto {
    font-size: 3rem;
  }
}
```

Os keyframes `tt-curtain-sweep`, `tt-curtain-open`, `tt-curtain-gradient`, `tt-onoma-appear` e `tt-onoma-impact` são idênticos.

Veredito: parcialmente fiel apenas por perda de responsividade.

### 5. `FireParticles/FireParticles.css`

Resultado: 29 regras/keyframes v1, 29 v2, 0 divergentes, 0 ausentes.

#### `.tt-fire-particles`

V1 real e v2 órfão:

```css
position: fixed;
inset: 0;
z-index: 1;
pointer-events: none;
overflow: visible;
```

DIVERGÊNCIAS: nenhuma.

#### `.tt-fire-particle`

V1 real e v2 órfão:

```css
position: fixed;
bottom: -20px;
border-radius: 50%;
background: radial-gradient(circle at 30% 30%, rgba(255, 160, 60, 0.9), rgba(232, 133, 58, 0.4), transparent);
animation: tt-fire-rise 6s linear infinite, tt-particle-hue 8s ease-in-out infinite;
will-change: transform, opacity;
```

DIVERGÊNCIAS: nenhuma.

As 25 regras `:nth-child(1)` até `:nth-child(25)` são idênticas em:

- `left`;
- `animation-delay`;
- `width`;
- `height`;
- `--drift`;
- `--drift2`.

Os keyframes `tt-fire-rise` e `tt-particle-hue` também são idênticos.

Veredito: fiel.

### 6. `styles/GameScreen.css`

Resultado: 61 regras relevantes na v1, 42 na tentativa, 9 divergentes e 21 ausentes. Das ausentes, 3 são keyframes.

#### Regras comuns sem divergência

As seguintes regras presentes nos dois lados são semanticamente idênticas:

```text
.tt-page
.tt-page::before
@keyframes tt-bg-cycle
.tt-fade-in
@keyframes ttFadeIn
.tt-game-header
.tt-game-round
.tt-game-score
.tt-score-you
.tt-score-sep
.tt-score-ai
.tt-player-card-wrapper
.tt-card--mini-wrapper
.tt-card--mini
.tt-player-card-wrapper .tt-card-template
.tt-card--mini-wrapper .tt-card-template
.tt-game-footer
.tt-confirm-modal
.tt-confirm-label
.tt-confirm-attr-nome
.tt-confirm-values
.tt-confirm-value-box
.tt-confirm-value-label
.tt-confirm-value-num
.tt-confirm-value-max
.tt-confirm-bar
.tt-confirm-bar-fill
.tt-confirm-pct
.tt-confirm-buttons
.tt-confirm-btn
.tt-confirm-btn:hover
.tt-confirm-btn--cancel
.tt-confirm-btn--ok
```

Trocas de literais por tokens foram resolvidas e confirmadas como equivalentes.

#### `.tt-game-container`

V1 real:

```css
position: relative;
display: flex;
flex-direction: column;
align-items: center;
width: 100%;
height: 100dvh;
overflow: hidden;
box-sizing: border-box;
max-width: 480px;
margin: 0 auto;
padding: 0.5rem max(1rem, env(safe-area-inset-right))
         max(0.5rem, env(safe-area-inset-bottom))
         max(1rem, env(safe-area-inset-left));
```

V2 órfão:

```css
display: flex;
flex-direction: column;
align-items: center;
width: 100%;
max-width: 1200px;
height: 100dvh;
padding: 0.5rem max(1rem, env(safe-area-inset-right))
         max(0.5rem, env(safe-area-inset-bottom))
         max(1rem, env(safe-area-inset-left));
box-sizing: border-box;
```

DIVERGÊNCIAS:

- `max-width`: v1 `480px` vs v2 `1200px`;
- `position: relative`: ausente na v2;
- `overflow: hidden`: ausente na v2;
- `margin: 0 auto`: ausente na v2.

Classificação: infiel e estruturalmente incompatível com o layout portrait real.

#### `.tt-opponent-mini-wrapper`

V1 real:

```css
width: 100%;
display: flex;
flex-direction: column;
align-items: center;
flex: 0 0 30dvh;
min-height: 140px;
max-height: 350px;
overflow: hidden;
margin-top: 0;
padding-bottom: 0.05rem;
```

V2 órfão: igual, exceto sem as duas últimas propriedades.

DIVERGÊNCIAS:

- `margin-top: 0`: ausente;
- `padding-bottom: 0.05rem`: ausente.

#### `.tt-player-card-wrapper .tt-card-wrapper`

V1 real:

```css
max-height: 100%;
width: calc(550px * 0.54);
height: calc(720px * 0.54);
overflow: hidden;
```

V2 órfão:

```css
width: calc(550px * 0.54);
height: calc(720px * 0.54);
overflow: hidden;
```

DIVERGÊNCIAS:

- `max-height: 100%`: ausente na v2.

#### `.tt-vs-heartbeat`

V1 real contém `margin-bottom: 0`; v2 omite essa propriedade. As demais propriedades são iguais.

#### `.tt-btn-desistir`

V1 real contém `transition: background 0.2s`; v2 omite a transição.

Também estão completamente ausentes na v2:

```css
.tt-btn-desistir:hover,
.tt-btn-desistir:active {
  background: rgba(255,68,68,0.12);
}
```

#### `.tt-confirm-overlay`

V1 real:

```css
position: fixed;
inset: 0;
z-index: 1000;
background: rgba(0, 0, 0, 0.7);
display: flex;
align-items: center;
justify-content: center;
animation: ttFadeIn 0.2s ease;
backdrop-filter: blur(4px);
```

V2 órfão: igual, exceto:

- `animation: ttFadeIn 0.2s ease`: ausente.

#### `.tt-desistir-overlay`

V1 contém `animation: tt-fade-in 0.2s ease`; v2 omite.

#### `.tt-desistir-modal`

V1 real:

```css
background: #1A1D21;
border: 1px solid rgba(231, 76, 60, 0.3);
border-radius: 16px;
padding: 2rem;
max-width: 400px;
width: 90%;
display: flex;
flex-direction: column;
align-items: center;
gap: 1rem;
box-shadow: 0 20px 60px rgba(0,0,0,0.5),
            0 0 30px rgba(231, 76, 60, 0.1);
animation: tt-confirm-enter 0.3s ease;
```

V2 órfão omite:

- `box-shadow` completo;
- `animation: tt-confirm-enter 0.3s ease`.

#### `@keyframes tt-confirm-enter`

A v1 possui duas definições com o mesmo nome. A definição posterior vence no cascade:

```css
from { opacity: 0; transform: scale(0.9) translateY(20px); }
to   { opacity: 1; transform: scale(1) translateY(0); }
```

A v2 levou apenas a definição anterior:

```css
from { transform: scale(0.85) translateY(20px); opacity: 0; }
to   { transform: scale(1) translateY(0); opacity: 1; }
```

DIVERGÊNCIA:

- escala inicial efetiva: v1 `0.9` vs v2 `0.85`.

#### Regras totalmente ausentes em `GameScreen.css`

```text
@media (max-width: 768px) .tt-confirm-modal
@media (max-width: 768px) .tt-confirm-value-num
.tt-desistir-modal-titulo
.tt-desistir-modal-desc
.tt-desistir-modal-actions
.tt-desistir-modal-btn
.tt-desistir-modal-btn--cancel
.tt-desistir-modal-btn--cancel:hover
.tt-desistir-modal-btn--confirm
.tt-desistir-modal-btn--confirm:hover
.tt-opponent-mini-label
.tt-player-card-wrapper .tt-card-wrapper .tt-card-template img
.tt-vs-heartbeat-glow
.tt-vs-heartbeat-glow::after
.tt-vs-heartbeat-text
.tt-btn-desistir:hover
.tt-btn-desistir:active
@keyframes tt-fade-in
@keyframes tt-vs-heartbeat-pulse
@keyframes tt-vs-heartbeat-color
```

As ausências do glow e seus dois keyframes explicam diretamente um centro “VS” visualmente morto.

Veredito: infiel.

### 7. `styles/MenuScreen.css`

Resultado: 75 regras relevantes na v1, 37 na tentativa, 4 divergentes e 38 ausentes. Das ausentes, 4 são keyframes.

#### Regras comuns semanticamente fiéis

As 33 regras comuns sem divergência incluem:

```text
.tt-menu-bg
.tt-menu-layout
.tt-menu-cards
.tt-card-stack
.tt-card-sample
.tt-card-sample--1
.tt-card-sample--2
.tt-card-sample--3
.tt-menu-content
.tt-title-group
.tt-title-main
.tt-title-desc
.tt-colecao
.tt-colecao-label
.tt-colecao-bar
.tt-colecao-bar-fill
.tt-guest-aviso-previo
.tt-modos
.tt-modo-card
.tt-modo-card:hover
.tt-config
.tt-config-turnos
.tt-config-turno-btn
.tt-config-turno-btn:hover
.tt-config-turno-btn--ativo
.tt-config-tentativas
.tt-tentativa-dot
.tt-tentativa-dot--gasta
.tt-btn-jogar
.tt-ja-ganhou-hoje
@media (max-width: 768px) .tt-menu-layout
@media (max-width: 768px) .tt-menu-cards
@media (max-width: 768px) .tt-title-main
```

#### `.tt-btn-deck-builder`

V1 e v2 têm as mesmas propriedades-base, exceto:

- v1: `transition: background 0.2s, transform 0.15s`;
- v2: sem `transition`.

Também falta `.tt-btn-deck-builder:hover`.

#### `.tt-link-album`

V1 e v2 têm as mesmas propriedades-base, exceto:

- v1: `transition: opacity 0.2s`;
- v2: sem `transition`.

Também falta `.tt-link-album:hover`.

#### `.tt-locked-overlay`

V1 contém `animation: tt-fade-in 0.2s ease`; v2 omite.

#### `.tt-locked-modal`

V1 real:

```css
background: #1A1D21;
border: 1px solid rgba(232,133,58,0.3);
border-radius: 16px;
padding: 2rem;
max-width: 420px;
width: 90%;
display: flex;
flex-direction: column;
align-items: center;
gap: 1rem;
box-shadow: 0 20px 60px rgba(0,0,0,0.5),
            0 0 30px rgba(232,133,58,0.1);
animation: tt-confirm-enter 0.3s ease;
```

V2 órfão:

```css
background: #1A1D21;
border: 1px solid rgba(231,76,60,0.3);
border-radius: 16px;
padding: 2rem;
max-width: 400px;
width: 90%;
display: flex;
flex-direction: column;
align-items: center;
gap: 1rem;
```

DIVERGÊNCIAS:

- borda: laranja `rgba(232,133,58,0.3)` vs vermelho `rgba(231,76,60,0.3)`;
- `max-width`: `420px` vs `400px`;
- `box-shadow`: ausente;
- `animation`: ausente.

#### Regras totalmente ausentes em `MenuScreen.css`

```text
.tt-card-stack:hover
.tt-card-sample-pattern
.tt-card-sample-logo
.tt-guest-aviso-texto
.tt-guest-aviso-link
.tt-guest-aviso-link:hover
.tt-modo-titulo
.tt-modo-desc
.tt-config-label
.tt-tentativa-texto
.tt-ja-ganhou-icone
.tt-ja-ganhou-texto
.tt-btn-jogar:hover:not(:disabled)
.tt-btn-jogar--disabled
.tt-btn-jogar:disabled
.tt-btn-deck-builder:hover
.tt-link-album:hover
.tt-fade-in
.tt-page
.tt-page::before
.tt-config-turno-btn:disabled
.tt-config-turno-btn:disabled:hover
@media (max-width: 768px) .tt-menu-content
@media (max-width: 768px) .tt-modos
.tt-modo-card--locked
.tt-modo-card--locked:hover
.tt-modo-card-lock-icon
.tt-locked-titulo
.tt-locked-desc
.tt-locked-actions
.tt-locked-btn
.tt-locked-btn:hover
.tt-locked-btn--primary
.tt-locked-btn--primary:hover
@keyframes ttFadeIn
@keyframes tt-bg-cycle
@keyframes tt-confirm-enter
@keyframes tt-fade-in
```

Veredito: infiel. O arquivo porta o esqueleto, mas perde grande parte da tipografia interna, estados de interação, modal, fundo e responsividade.

### 8. `styles/ResultScreen.css`

Resultado: 35 regras relevantes na v1, 18 na tentativa, 4 divergentes e 16 ausentes. Uma ausência é keyframe.

#### Regras comuns semanticamente fiéis

```text
.tt-result-badge
.tt-result-win
.tt-result-lose
.tt-result-draw
.tt-result-attr-comparison
.tt-result-attr-name
.tt-result-values
.tt-cards-swipe-track
.tt-cards-swipe-track--revealed
.tt-swipe-card-slot
.tt-swipe-card-slot .tt-card-wrapper
.tt-swipe-card-slot .tt-card-template
.tt-swipe-label
.tt-swipe-btn--right
.tt-swipe-btn--left
```

#### `.tt-cards-swipe-container`

V1 real:

```css
flex: 1;
width: 100%;
overflow: hidden;
min-height: 0;
position: relative;
user-select: none;
-webkit-user-select: none;
```

V2 órfão omite:

- `-webkit-user-select: none`.

#### `.tt-swipe-btn`

V1 real contém:

```css
transition: background 0.2s, transform 0.2s;
```

V2 omite a transição e também não porta:

```css
.tt-swipe-btn:hover,
.tt-swipe-btn:active {
  background: rgba(255,255,255,0.22);
  transform: translateY(-50%) scale(1.12);
}
```

#### `.tt-btn-next-round`

V1 real contém `transition: opacity 0.2s`; v2 omite.

Também falta:

```css
.tt-btn-next-round:hover,
.tt-btn-next-round:active {
  opacity: 0.85;
}
```

#### Regras totalmente ausentes em `ResultScreen.css`

```text
.tt-page
.tt-page::before
.tt-game-header
.tt-game-round
.tt-game-score
.tt-score-you
.tt-score-sep
.tt-score-ai
.tt-result-val-you
.tt-result-val-sep
.tt-result-val-ai
.tt-swipe-btn:hover
.tt-swipe-btn:active
.tt-btn-next-round:hover
.tt-btn-next-round:active
@keyframes tt-bg-cycle
```

Observação importante: `.tt-result-container` aparece nominalmente no arquivo v2, mas não é fiel ao bloco efetivo atual da v1. A v1 atual usa padding físico `0.4rem 0.75rem 0.2rem`; a tentativa usa `max(... safe-area ...)`. Para fins de reextração, o bloco deve vir da fonte atual, não ser reaproveitado por nome.

Veredito: infiel por cobertura incompleta, embora a maioria das regras que levou esteja correta.

## Passo 4 — Animações e keyframes

### Output RAW — v1

```text
529:@keyframes ttFadeIn {
559:@keyframes tt-bg-cycle {
612:@keyframes tt-fire-rise {
634:@keyframes tt-particle-hue {
920:@keyframes tt-vs-glow-pulse {
931:@keyframes tt-vs-glow-color {
939:@keyframes tt-vs-pulse-texto {
950:@keyframes tt-pulse-border {
955:@keyframes tt-shimmer {
1205:@keyframes card-spin-reveal {
1239:@keyframes tt-burst-a {
1240:@keyframes tt-burst-b {
1241:@keyframes tt-burst-c {
1242:@keyframes tt-burst-d {
1243:@keyframes tt-burst-e {
1244:@keyframes tt-burst-f {
1517:@keyframes tt-confirm-enter {
1657:@keyframes tt-curtain-sweep {
1666:@keyframes tt-curtain-open {
1681:@keyframes tt-curtain-gradient {
1718:@keyframes tt-onoma-appear {
1725:@keyframes tt-onoma-impact {
1741:@keyframes tt-card-fade-out {
1976:@keyframes tt-fade-in {
2087:@keyframes tt-confirm-enter {
2280:@keyframes tt-ppt-pop-in {
2286:@keyframes tt-ppt-shake {
2292:@keyframes tt-ppt-reveal {
2298:@keyframes tt-ppt-pulse {
2461:@keyframes tt-vs-heartbeat-pulse {
2465:@keyframes tt-vs-heartbeat-color {
2545:@keyframes tt-hint-pulse {
```

Há 32 declarações e 31 nomes únicos; `tt-confirm-enter` é definido duas vezes.

### Nomes presentes na tentativa modular

```text
tt-bg-cycle
ttFadeIn
tt-confirm-enter
tt-burst-a
tt-burst-b
tt-burst-c
tt-burst-d
tt-burst-e
tt-burst-f
tt-curtain-sweep
tt-curtain-open
tt-curtain-gradient
tt-onoma-appear
tt-onoma-impact
tt-fire-rise
tt-particle-hue
```

### Keyframes globais ausentes na tentativa modular

```text
card-spin-reveal
tt-card-fade-out
tt-fade-in
tt-hint-pulse
tt-ppt-pop-in
tt-ppt-pulse
tt-ppt-reveal
tt-ppt-shake
tt-pulse-border
tt-shimmer
tt-vs-glow-color
tt-vs-glow-pulse
tt-vs-heartbeat-color
tt-vs-heartbeat-pulse
tt-vs-pulse-texto
```

Os mais diretamente ligados aos oito arquivos analisados são:

- `tt-fade-in`;
- `tt-vs-heartbeat-color`;
- `tt-vs-heartbeat-pulse`;
- `tt-hint-pulse`.

Os demais pertencem a áreas da v1 que não ganharam arquivo modular correspondente neste lote, reforçando que a decomposição não cobriu toda a superfície visual.

## Passo 5 — Fontes, variáveis e tokens

Conteúdo RAW de `v2/styles/tokens.css`:

```css
:root {
  --tt-orange: #e8853a;
  --tt-orange-alt: #f4a227;
  --tt-win: #1ea064;
  --tt-lose: #e74c3c;
  --tt-bg-card: rgba(255,255,255,0.04);
  --tt-border: #2A2D31;
  --tt-text: #EAEAEA;
  --tt-muted: #8B8F96;
  --tt-dark: #4F5359;
  --font-rajdhani: "Rajdhani", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --font-ibm: "IBM Plex Sans", sans-serif;
}
```

### Correspondência com a v1

| Token v2 | Valor | Existe literalmente na v1? | Uso real na v2 modular |
|---|---|---|---|
| `--tt-orange` | `#e8853a` | Sim, dezenas de ocorrências | Sim |
| `--tt-orange-alt` | `#f4a227` | Sim | Sim |
| `--tt-win` | `#1ea064` | Sim | Não nos oito arquivos |
| `--tt-lose` | `#e74c3c` | Sim | Não nos oito arquivos |
| `--tt-bg-card` | `rgba(255,255,255,0.04)` | Sim | Não nos oito arquivos |
| `--tt-border` | `#2A2D31` | Sim | Não nos oito arquivos |
| `--tt-text` | `#EAEAEA` | Sim | Sim |
| `--tt-muted` | `#8B8F96` | Sim | Sim |
| `--tt-dark` | `#4F5359` | Sim | Sim |
| `--font-rajdhani` | `"Rajdhani", sans-serif` | Sim | Sim |
| `--font-mono` | `"JetBrains Mono", monospace` | Sim | Sim |
| `--font-ibm` | `"IBM Plex Sans", sans-serif` | Sim | Sim |

Veredito dos tokens:

- não são valores inventados;
- não alteram visualmente as regras nas quais substituem os literais;
- são incompletos como representação da paleta global da v1;
- essa incompletude não é a causa principal da pobreza visual, porque os arquivos continuam usando muitos valores literais;
- a causa principal comprovada é a ausência de regras inteiras, pseudoestados, media overrides e keyframes.

## Passo 6 — Tabela final

Contagem estrutural: regras-base, pseudoestados, regras em `@media` e keyframes associados contam individualmente.

| Componente | Nº seletores/regras na v1 real | Nº na tentativa v2 | Nº com divergência de valores | Nº ausentes na v2 | Nº de keyframes ausentes | Veredito |
|---|---:|---:|---:|---:|---:|---|
| `GameHUD.css` | 6 | 6 | 0 | 0 | 0 | fiel |
| `SoundToggle.css` | 3 | 3 | 0 | 0 | 0 | fiel |
| `BurstParticles.css` | 15 | 15 | 0 | 0 | 0 | fiel |
| `CurtainReveal.css` | 10 | 9 | 0 | 1 | 0 | parcialmente fiel |
| `FireParticles.css` | 29 | 29 | 0 | 0 | 0 | fiel |
| `GameScreen.css` | 61 | 42 | 9 | 21 | 3 | infiel |
| `MenuScreen.css` | 75 | 37 | 4 | 38 | 4 | infiel |
| `ResultScreen.css` | 35 | 18 | 4 | 16 | 1 | infiel |

## Tamanho e forma reais do problema

Não é necessário reextrair tudo do zero indiscriminadamente.

Blocos comprovadamente reaproveitáveis quanto à fidelidade:

```text
GameHUD.css
SoundToggle.css
BurstParticles.css
FireParticles.css
regras-base e keyframes de CurtainReveal.css
```

Blocos que exigem reextração sistemática da fonte atual:

```text
GameScreen.css
MenuScreen.css
ResultScreen.css
override mobile de CurtainReveal.css
```

O método seguro para uma tarefa futura é extrair do monólito por responsabilidade do JSX, preservando:

1. todas as ocorrências de cada seletor;
2. seletores compostos e pseudoestados;
3. regras dentro de media queries;
4. keyframes chamados;
5. ordem de cascade e nomes duplicados;
6. regras compartilhadas em um módulo comum explícito;
7. o limite portrait atual de `480px`.

Nenhuma dessas mudanças foi aplicada nesta rodada.
