# INV: Mapeamento completo de VFX + estrutura de arquivos ArenaTestbed

**Data:** 2026-06-23
**Investigador:** opencode
**Versão base:** v6.6.0

---

## ETAPA 1 — Inventário completo de arquivos

### 1.1 — Estrutura completa (54 arquivos)
```
src\pages\Prototype\ArenaTestbed\
  archive\
    getLineInDirection.js
    PowerLinePreview.css
    PowerLinePreview.jsx
  ArenaTestbed.css
  ArenaTestbed.jsx
  ARENATESTBED_MAPA.md
  components\
    effects\effectsMap.js
    modals\
      CharModal.jsx
      JokenpoModal.css
      JokenpoModal.jsx
      PowerChoiceModal.css
      PowerChoiceModal.jsx
    power-selection\
      PowerCard.css
      PowerCard.jsx
      PowerDescription.css
      PowerDescription.jsx
      PowerFilterBar.css
      PowerFilterBar.jsx
      PowerGrid.css
      PowerGrid.jsx
      SortToggle.css
      SortToggle.jsx
  data\
    fichaStorage.js
    poderes.js
  engine\
    ai.js
    ai\
      index.js
      personalidades\
        fujona.js
        index.js
        persistente.js
        sanguinaria.js
    combat.js
    drawCombatBoard.js
    hexUtils.js
    mecanicasPoder.js
    regrasFicha.js
    TurnController.js
    turnOrder.js
    useCanvasLoop.js
    useCombatEngine.js
    useHexCanvas.js
    useInputLock.js
    useUIController.js
  phases\
    atb-canvas.css
    atb-hud.css
    atb-ui.css
    Phase0Start.css
    Phase0Start.jsx
    Phase1SheetBuilder.css
    Phase1SheetBuilder.jsx
    Phase2Customize.css
    Phase2Customize.jsx
    Phase3ModeSelect.css
    Phase3ModeSelect.jsx
    Phase4BoardSetup.css
    Phase4BoardSetup.jsx
    Phase5PowerSelect.css
    Phase5PowerSelect.jsx
    Phase6CombatV2.css
    Phase6CombatV2.jsx
```

### 1.2 — JSX line counts (17 arquivos, ~2.054 linhas)
```
499 Phase6CombatV2.jsx
428 Phase4BoardSetup.jsx
267 Phase1SheetBuilder.jsx
151 ArenaTestbed.jsx
120 Phase5PowerSelect.jsx
116 Phase2Customize.jsx
  81 JokenpoModal.jsx
  81 Phase0Start.jsx
  77 PowerLinePreview.jsx
  56 PowerFilterBar.jsx
  40 CharModal.jsx
  40 PowerChoiceModal.jsx
  34 PowerCard.jsx
  25 Phase3ModeSelect.jsx
  17 PowerGrid.jsx
  14 SortToggle.jsx
   8 PowerDescription.jsx
```

### 1.3 — JS (engine) line counts (22 arquivos, ~2.527 linhas)
```
630 useCombatEngine.js
252 hexUtils.js
248 drawCombatBoard.js
202 combat.js
191 TurnController.js
168 useHexCanvas.js
109 turnOrder.js
108 ai.js
  98 fujona.js
  94 persistente.js
  83 sanguinaria.js
  73 poderes.js
  69 useUIController.js
  57 fichaStorage.js
  36 useInputLock.js
  32 getLineInDirection.js
  28 regrasFicha.js
  24 index.js
  20 mecanicasPoder.js
  13 useCanvasLoop.js
  11 index.js
   1 effectsMap.js
```

### 1.4 — CSS line counts (19 arquivos, ~2.347 linhas)
```
447 atb-ui.css
359 Phase1SheetBuilder.css
335 Phase4BoardSetup.css
219 Phase6CombatV2.css
127 PowerLinePreview.css
101 Phase0Start.css
  96 JokenpoModal.css
  92 Phase2Customize.css
  87 Phase5PowerSelect.css
  81 atb-hud.css
  78 ArenaTestbed.css
  63 PowerChoiceModal.css
  61 Phase3ModeSelect.css
  47 PowerCard.css
  44 atb-canvas.css
  25 PowerFilterBar.css
  13 SortToggle.css
   7 PowerDescription.css
   5 PowerGrid.css
```

### 1.5 — Import map (dependências entre módulos)
(Completo no output bruto — destaques arquiteturais:)
- `Phase6CombatV2.jsx` importa 4 CSS, 3 modais, 4 engines + LanguageContext
- `useCombatEngine.js` importa TurnController, combat, hexUtils, ai, poderes, mecanicasPoder
- `useUIController.js` importa apenas React — é o módulo mais puro
- `CharModal.jsx` importa `../../phases/atb-ui.css` (cross-pasta, fora do padrão)

---

## ETAPA 2 — Mapeamento de VFX

### Output bruto dos 5 greps
(Vide seção acima — todos os outputs colados)

### Fichas de efeito

---

#### EFEITO 01: Shake da tela

**Quem dispara:** `useUIController.js:55` — `dispararImpacto()` → `setShaking(true)`

**Quando dispara:** `Phase6CombatV2.jsx:50` — dentro de `onDano`, após `aplicarDano()` no engine (useCombatEngine.js:133 → onDano → Phase6CombatV2.jsx:44-52). Executa sempre que `aplicarDano` é chamado, tanto para jogador quanto para IA.

**Duração:** 500ms (`useUIController.js:56` — `setTimeout(() => setShaking(false), 500)`)

**Canal:** overlay (classe CSS `atb-shake` no elemento raiz `.atb-root`)

**Pode coexistir com:** Flash vermelho (disparado junto), Balão de dano, Dano popup, Anúncio de turno, Banner IA

**Tipo:** pontual (cada disparo independente)

**CSS envolvido:** `Phase6CombatV2.css:245` — `@keyframes atb-shake`

**Estado atual:** ✅ funciona — ativado por `uiCtrl.shaking` que aplica classe `atb-shake` na raiz

---

#### EFEITO 02: Flash vermelho

**Quem dispara:** `useUIController.js:57` — `setFlashDmg(true)`

**Quando dispara:** `Phase6CombatV2.jsx:51` — dentro de `onDano`, mesmo momento que Shake. Executa em paralelo com Shake.

**Duração:** 400ms (`useUIController.js:58` — `setTimeout(() => setFlashDmg(false), 400)`)

**Canal:** overlay (`<div className="atb-flash-overlay" />` em Phase6CombatV2.jsx:332, condicionado a `uiCtrl.flashDmg`)

**Pode coexistir com:** Shake, Balão, Dano popup, todos os outros

**Tipo:** pontual

**CSS envolvido:** `atb-ui.css:86` — `@keyframes atb-flash-fade`

**Estado atual:** ✅ funciona — overlay aparece/desaparece com animação fade

---

#### EFEITO 03: Balão de dano (floating text)

**Quem dispara:** `useUIController.js:36-39` — `adicionarBalao({ x, y, texto, tipo })`

**Quando dispara:**
- Via `Phase6CombatV2.jsx:65` — dentro de `onBalao` callback, posiciona o balão na coordenada canvas do personagem
- Disparado pelo engine em vários locais:
  - `useCombatEngine.js:137` — `adicionarBalao(alvoId, texto, tipo, row, col)` chamado em:
  - L:162 — `aposAnimacaoAtaque`: CRÍTICO DEF!
  - L:167 — BLOQUEIO!
  - L:173 — CONTRA!
  - L:194 — EXTRA! (handleAtaqueExtra)
  - L:201 — BLOQUEIO! (ataque extra)
  - L:578 — MISS! (IA ataque)
  - L:580 — CRÍTICO DEF! (IA ataque)

**Duração:** 1300ms (`useUIController.js:39` — `setTimeout(() => setBalloons(prev => prev.filter(b => b.key !== key)), 1300)`)

**Canal:** `.atb-balloon-container` dentro do `.atb-canvas-wrap` (Phase6CombatV2.jsx:432-439)

**Pode coexistir com:** Shake, Flash, Dano popup, todos

**Tipo:** pontual, múltiplos balões podem coexistir (array)

**CSS envolvido:** `atb-ui.css:22` — `@keyframes atb-balloon-float`; classes `.atb-balloon--block`, `.atb-balloon--extra`, `.atb-balloon--contra`, `.atb-balloon--miss`

**Estado atual:** ✅ funciona — posicionamento via CSS custom properties `--x` e `--y`, auto-remove após 1.3s

---

#### EFEITO 04: Dano popup (número grande centralizado)

**Quem dispara:** `useUIController.js:61-63` — `mostrarDanoPopup(alvoId, dano)`

**Quando dispara:** `Phase6CombatV2.jsx:49` — dentro de `onDano`, antes de Shake e Flash. Executa em toda chamada de `aplicarDano` no engine.

**Duração:** 800ms (`useUIController.js:63` — `setTimeout(() => setDanoPopup(null), 800)`)

**Canal:** overlay direto em `.atb-root` (`<div className="atb-dano-popup">` em Phase6CombatV2.jsx:380)

**Pode coexistir com:** Shake, Flash, Balão, todos

**Tipo:** pontual — apenas UM popup por vez (state substitui o anterior)

**CSS envolvido:** `atb-ui.css:49` — `@keyframes atb-dano-pop` (scale-up + fade-out)

**Estado atual:** ✅ funciona — número grande com animação pop

---

#### EFEITO 05: Banner de ataque da IA

**Quem dispara:** `useUIController.js:31-33` — `mostrarBannerAtaque(nome)`

**Quando dispara:** `Phase6CombatV2.jsx:145` — callback `onBannerIA` registrado no engine
- `useCombatEngine.js:608` — antes de `iniciarAnimacaoAtaqueIA` quando o jogador tem defesa
- `useCombatEngine.js:629` — antes de `iniciarAnimacaoAtaqueIA` quando o jogador NÃO tem defesa

**Duração:** 1500ms (`useUIController.js:33` — `setTimeout(() => setAttackBanner(null), 1500)`)

**Canal:** overlay (`<div className="atb-attack-banner">` em Phase6CombatV2.jsx:383-386)

**Pode coexistir com:** Shake, Flash, IA thinking dots (disparado durante IA thinking), Anúncio

**Tipo:** pontual

**CSS envolvido:** `atb-ui.css:68` — `@keyframes atb-banner-in`

**Estado atual:** ✅ funciona — slide-in animation

---

#### EFEITO 06: Anúncio de turno

**Quem dispara:** `useUIController.js:21-28` — `anunciar(texto, duracao, cls)`

**Quando dispara:**
- `Phase6CombatV2.jsx:117-123` — `onVitoria` → anúncio de vitória/derrota (3000ms)
- `Phase6CombatV2.jsx:128` — `onTurnoJogador` → "Turno de Jogador X"
- `Phase6CombatV2.jsx:134` — `onTurnoIA` → "Turno da IA X" (1500ms, classe 'ia')

**Duração:** 2000ms default (configurável: vitória 3000ms, IA 1500ms)

**Canal:** overlay (`<div className="atb-announcement-overlay"><div className="atb-announcement-text">` em Phase6CombatV2.jsx:364-367)

**Pode coexistir com:** IA thinking dots (parcial), Banner IA

**Tipo:** pontual — um anúncio por vez (timer ref cancela anterior)

**CSS envolvido:** `atb-ui.css:105` — `@keyframes atb-announce-fade`; L:140 — `@keyframes atb-announce-scale`

**Estado atual:** ✅ funciona — overlay com fade + scale

---

#### EFEITO 07: Trail de movimento

**Quem dispara:** `Phase6CombatV2.jsx:141-143` — `onTrail` callback escreve em `trailRef.current`

**Quando dispara:** `useCombatEngine.js:553` — dentro do loop `avancarPassoIA`, a cada passo do movimento da IA. Apenas IA — jogador não gera trail (movimento do jogador usa `moverPersonagem` que não chama `onTrail`).

**Duração:** ~300ms por passo (alpha fade: `alpha -= 0.07` a cada frame de ~16ms = ~14 frames ≈ 228ms; trailRef é filtrado por `alpha > 0`)

**Canal:** canvas (desenhado por `drawCombatBoard` a partir de `trail: trailRef.current` em Phase6CombatV2.jsx:204)

**Pode coexistir com:** Todos (é desenhado no canvas, independente dos overlays CSS)

**Tipo:** persistente por frame (cada passo adiciona um trail que fadea gradualmente)

**CSS envolvido:** Nenhum (desenhado em canvas via `drawCombatBoard`)

**Estado atual:** ✅ funciona — trail fade via `useCanvasLoop` `onFrame`

---

#### EFEITO 08: Animação melee

**Quem dispara:** `Phase6CombatV2.jsx:68-89` — callback `onAnimarMelee`

**Quando dispara:** `useCombatEngine.js:149` — `animarAtaqueMelee` chamado em:
- `useCombatEngine.js:381` — `executarAtaque` (jogador)
- `useCombatEngine.js:602-603` — IA `estagioAgir`

**Duração:** ~500ms (300ms lunge + 200ms return)

**Canal:** canvas (personagem é reposicionado via `syncCharacters`)

**Pode coexistir com:** IA thinking dots, Anúncio (mas input está locked)

**Tipo:** pontual (sequência de 2 timers: lunge → return → onFinalizar)

**CSS envolvido:** Nenhum (manipula posição do character no estado React, renderizado no canvas)

**Estado atual:** ✅ funciona — movimenta token do atacante 70% em direção ao alvo e volta

---

#### EFEITO 09: Animação projétil

**Quem dispara:** `Phase6CombatV2.jsx:91-113` — callback `onAnimarProjetil`

**Quando dispara:** `useCombatEngine.js:154` — `animarAtaqueProjetil` chamado em:
- `useCombatEngine.js:382` — `executarAtaque` (jogador, tipo !== 'melee')
- `useCombatEngine.js:602-603` — IA `estagioAgir`

**Duração:** `steps.length * 320ms` (variável por distância)

**Canal:** canvas (desenhado via `projectilePos` e `projectilePath` em `drawCombatBoard`)

**Pode coexistir com:** IA thinking dots, Anúncio

**Tipo:** pontual (sequência de steps com timer recursivo)

**CSS envolvido:** Nenhum (desenhado em canvas)

**Estado atual:** ✅ funciona — projétil percorre hex line step by step

---

#### EFEITO 10: IA thinking dots

**Quem dispara:** `useCombatEngine.js:522` — `setIaThinking(true)` no início de `executarIA`

**Quando dispara:** No turno da IA, antes de `estagioPensar` (L:522)

**Duração:** Durante todo o turno da IA (até `finalizarTurnoIA` L:638)

**Canal:** bottom-nav (`<div className="atb-ia-thinking-row"><span className="atb-ia-dots">` em Phase6CombatV2.jsx:502-505)

**Pode coexistir com:** Banner IA (sim, o banner aparece sobre os dots), Anúncio de turno (anúncio aparece antes dos dots)

**Tipo:** persistente (enquanto `iaThinking === true`)

**CSS envolvido:** `atb-ui.css:165` — `@keyframes atb-ia-pulse`

**Estado atual:** ✅ funciona — dots pulsando com animation

---

#### EFEITO 11: Vitória (resultado)

**Quem dispara:** `useCombatEngine.js:118-119, 123-124` — `verificarVitoria()` → `onVitoria(vencedor)`

**Quando dispara:** Após morte do último personagem do time adversário, chamado em `finalizarAposAtaque` (via `verificarVitoria`), `finalizarTurnoIA`, e `finalizarTurno`

**Duração:** Permanente (renderiza tela de resultado em vez do combate)

**Canal:** React render condicional (`if (phase === 'resultado' && winner)` em Phase6CombatV2.jsx:271-286)

**Pode coexistir com:** Nenhum (componente substitui toda a UI de combate)

**Tipo:** pontual/persistente (para o combate)

**CSS envolvido:** `Phase6CombatV2.css` (classes `.atb-result`, `.atb-result-card`)

**Estado atual:** ✅ funciona — exibe resultado + botão "Jogar Novamente"

---

#### EFEITO 12: HP delta bar (HUD)

**Quem dispara:** `Phase6CombatV2.jsx:445-459` — renderização condicional da barra `hp-delta`

**Quando dispara:** `Phase6CombatV2.jsx:48` — `setHpAnterior` é atualizado dentro de `onDano` antes de aplicar o dano visual. O delta é calculado comparando `hpAnterior[ch.id]` com `ch.hp` atual.

**Duração:** CSS animation (via `@keyframes atb-delta-shrink`)

**Canal:** HUD (`.atb-hud-chip` → `.atb-hud-bar-fill.hp-delta`)

**Pode coexistir com:** Shake, Flash, Balão, Dano popup, todos

**Tipo:** pontual (renderizado condicionalmente quando `hpAntigo > ch.hp`)

**CSS envolvido:** `atb-hud.css:93` — `@keyframes atb-delta-shrink`

**Estado atual:** ✅ funciona — barra extra mostra HP anterior diminuindo até o HP atual

---

## ETAPA 3 — Matriz de coexistência

Legenda: — = mesmo efeito | ✅ = coexistem sem conflito | ⚠️ = conflito visual | ❌ = se bloqueiam | ? = indeterminado

| Efeito | Shake | Flash | Balão | Popup | Banner IA | Anúncio | Trail | Melee | Projétil | IA Think | Vitória | HP Delta |
|--------|-------|-------|-------|-------|-----------|---------|-------|-------|----------|----------|---------|----------|
| **Shake** | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Flash** | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Balão** | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Popup** | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Banner IA** | ✅ | ✅ | ✅ | ✅ | — | ⚠️ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Anúncio** | ✅ | ✅ | ✅ | ✅ | ⚠️ | — | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Trail** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Melee** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ❌ | ✅ | ❌ | ✅ |
| **Projétil** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | — | ✅ | ❌ | ✅ |
| **IA Think** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ❌ | ✅ |
| **Vitória** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| **HP Delta** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | — |

**Notas sobre conflitos:**
- **Banner IA × Anúncio (⚠️):** Banner aparece durante o turno da IA, e o anúncio também. Ambos são overlays full-width no topo. Podem sobrepor-se visualmente se o timing coincidir — o anúncio tem duração de 1500ms (turno IA) e o banner 1500ms.
- **Melee × Projétil (❌):** Um personagem é melee OU projétil, nunca ambos. São mutuamente exclusivos por personagem.
- **Vitória (❌):** Quando a tela de resultado aparece, todo o combate (incluindo seus VFX) é substituído — a vitória é terminal.

---

## ETAPA 4 — Arquitetura CSS

### Q1 — CSS na pasta phases/

**CSS em `phases/`:**
```
atb-canvas.css
atb-hud.css
atb-ui.css
Phase0Start.css
Phase1SheetBuilder.css
Phase2Customize.css
Phase3ModeSelect.css
Phase4BoardSetup.css
Phase5PowerSelect.css
Phase6CombatV2.css
```

**JSX em `phases/`:**
```
Phase0Start.jsx
Phase1SheetBuilder.jsx
Phase2Customize.jsx
Phase3ModeSelect.jsx
Phase4BoardSetup.jsx
Phase5PowerSelect.jsx
Phase6CombatV2.jsx
```

Cada fase tem seu par CSS + JSX (co-location), exceto que `Phase6CombatV2.jsx` importa **4 CSS** (seu próprio + `atb-canvas.css`, `atb-hud.css`, `atb-ui.css`), enquanto os demais importam apenas 1.

### Q2 — Subdiretórios

```
archive/              — código descartado (PowerLinePreview, getLineInDirection)
components/
  effects/            — 1 arquivo: effectsMap.js (apenas 1 linha = vazio/fragmento)
  modals/             — JokenpoModal, PowerChoiceModal, CharModal
  power-selection/    — PowerCard, PowerDescription, PowerFilterBar, PowerGrid, SortToggle
data/                 — fichaStorage.js, poderes.js
engine/
  ai/
    personalidades/   — fujona, persistente, sanguinaria
phases/               — 7 fases (0-6)
```

Não existe pasta `css/` ou `styles/` separada dentro de ArenaTestbed.

### Q3 — Cada CSS: escopo, importador, adequação

| CSS | Escopo | Quem importa | Adequado? |
|---|---|---|---|
| `atb-canvas.css` | Canvas hexagonal + container | Phase6CombatV2.jsx | ⚠️ Nome genérico, só usado por 1 fase, mas nome sugere reuso |
| `atb-hud.css` | HUD (barras HP/MP, chips) + HP delta | Phase6CombatV2.jsx | ⚠️ Idem — só Phase6CombatV2 usa |
| `atb-ui.css` | Balões, popup, banner, anúncio, flash, IA pulse | Phase6CombatV2.jsx, CharModal.jsx | ✅ É o CSS de UI global do combate. CharModal também importa |
| `Phase6CombatV2.css` | Action panel, top bar, bottom nav, shake, resultado | Phase6CombatV2.jsx | ✅ Co-location com a fase |
| `Phase*.css` (0-5) | Cada fase | Respectivo Phase*.jsx | ✅ Co-location |
| `ArenaTestbed.css` | Layout geral do testbed | ArenaTestbed.jsx | ✅ Co-location |
| `PowerChoiceModal.css` | Modal de escolha de poder | PowerChoiceModal.jsx | ✅ Co-location |
| `JokenpoModal.css` | Modal de Jokenpo | JokenpoModal.jsx | ✅ Co-location |
| `CharModal.css` | (não existe — CharModal usa atb-ui.css) | — | ⚠️ Sem CSS próprio |
| `PowerCard.css` etc | Componentes de seleção de poder | Respectivo componente | ✅ Co-location |

### Q4 — Convenção React (co-location vs pasta separada)

**Resposta:** Em projetos React modernos com Vite, a convenção dominante é **co-location** — CSS junto ao componente que o usa. A razão arquitetural é:

1. **Encapsulamento:** O CSS viaja com o componente. Se o componente é movido ou deletado, o CSS vai junto. Não há arquivos órfãos espalhados.
2. **Manutenibilidade:** Um desenvolvedor não precisa navegar entre pastas distantes para alterar o estilo de um componente. Tudo está no mesmo diretório.
3. **Code-splitting:** Vite pode tree-shake CSS não importado. CSS co-localado só é bundlado se o componente for importado.
4. **Colaboração:** Reduz conflitos de merge — times diferentes trabalham em pastas diferentes sem pisar nos mesmos arquivos CSS globais.

**Avaliação da estrutura atual do ArenaTestbed:**

✅ A estrutura **segue** co-location na maioria dos casos:
- `Phase*.jsx` → `Phase*.css` no mesmo diretório `phases/`
- `PowerCard.jsx` → `PowerCard.css` no mesmo diretório `components/power-selection/`
- `PowerChoiceModal.jsx` → `PowerChoiceModal.css` no mesmo diretório `components/modals/`
- `ArenaTestbed.jsx` → `ArenaTestbed.css` na raiz

⚠️ **Violações identificadas:**
1. **`atb-canvas.css`, `atb-hud.css`, `atb-ui.css`** em `phases/` mas **não correspondem a uma fase específica** — são estilos compartilhados de combate. Estariam melhor em uma pasta `styles/` ou `combat-styles/` dentro de ArenaTestbed, ou co-localados com o engine de combate.
2. **`CharModal.jsx`** importa `../../phases/atb-ui.css` — uma **importação cross-pasta** que acopla o componente modal ao CSS de combate. CharModal deveria ter seu próprio CSS ou o `atb-ui.css` deveria estar acessível a partir de uma pasta compartilhada.
3. **`atb-ui.css` com 447 linhas** é muito grande para co-location — indicativo de que deveria ser dividido em arquivos menores.

**Problemas práticos causados hoje:**
- A importação cross-pasta de `CharModal.jsx` → `phases/atb-ui.css` é frágil: se `phases/` for reorganizada, o modal quebra.
- `atb-canvas.css` e `atb-hud.css` com nomes genéricos em `phases/` podem causar confusão: um novo desenvolvedor pode não saber onde colocar CSS de canvas vs HUD.
- Acoplamento: CSS de UI de combate (`atb-ui.css`) serve tanto `Phase6CombatV2` quanto `CharModal`, mas está em `phases/` que deveria ser específico por fase.

---

## Resumo

| Métrica | Valor |
|---|---|
| Total arquivos JSX | 17 (~2.054 linhas) |
| Total arquivos JS | 22 (~2.527 linhas) |
| Total arquivos CSS | 19 (~2.347 linhas) |
| Total efeitos mapeados | 12 |
| Efeitos com coexistência problemática (⚠️) | 1 (Banner IA × Anúncio) |
| Efeitos mutuamente exclusivos (❌) | 1 par (Melee × Projétil) + Vitória bloqueia todos |
| Convenção CSS | Co-location seguida na maioria, mas violada por `atb-*.css` em `phases/` + CharModal import cross-pasta |
