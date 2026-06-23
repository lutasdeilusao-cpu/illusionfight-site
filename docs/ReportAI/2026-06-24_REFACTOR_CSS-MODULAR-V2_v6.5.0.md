# REFACTOR: CSS Modular V2 — Phase6CombatV2 + atb-canvas + atb-hud + atb-ui

> Versão: 6.5.0 / 10.159.6
> Hash: `a676d62d`
> Deploy: `Published` ✅

---

## Etapa 1 — Proof-of-reading greps

### 1. Import atual do CSS no V2
```
src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx:13: import './Phase6Combat.css'
```

### 2. Import no V1 (intacto, não tocar)
```
src/pages/Prototype/ArenaTestbed/phases/Phase6Combat.jsx:27: import './Phase6Combat.css'
```

### 3. CSS existentes antes da migração
```
ArenaTestbed.css
```

### 4. atb-root no CSS original
```
Phase6Combat.css:6:  .atb-root {
Phase6Combat.css:17: .atb-root::-webkit-scrollbar {
Phase6Combat.css:739: .atb-root.atb-shake {
```

---

## Etapa 2 — Arquivos criados

| Arquivo | Responsabilidade | Classes migradas | @keyframes |
|---|---|---|---|
| `Phase6CombatV2.css` | Root, top bar, bottom nav, action panel, botões, result base, shake | 30 | `atb-panel-slide-in`, `atb-shake` |
| `atb-canvas.css` | Canvas wrap, canvas, balão container | 4 | — |
| `atb-hud.css` | Chips, barras HP/MP, dot de time, delta | 16 | `atb-delta-shrink` |
| `atb-ui.css` | Balões, dano popup, flash, anúncio, ia-thinking, drawer, ordering, result | 42 | `atb-balloon-float`, `atb-ia-pulse`, `atb-flash-fade`, `atb-announce-fade`, `atb-announce-scale`, `atb-dano-pop`, `atb-banner-in` |

**Classes lixo (33) NÃO migradas** — confirmado via grep negativo:

```
.atb-top-end-turn, .atb-top-cancel (+ hovers)
.atb-action-btn--attack, --end, --skip, --item (+ hovers)
.atb-item-qty, .atb-phase-hint
.atb-modal-overlay, .atb-modal, .atb-modal-header
.atb-modal-dot, .atb-modal-dot.jogador, .atb-modal-dot.ia
.atb-modal-name, .atb-modal-close (+ hover)
.atb-modal-body, .atb-modal-stat, .atb-modal-stat-label (+ .hp/.mp)
.atb-modal-bar-track, .atb-modal-bar-fill (+ .hp/.mp)
.atb-modal-stat-val, .atb-modal-attr-row
.atb-hud-dot.jogador, .atb-hud-dot.ia
.atb-action-panel-btn--close
```

---

## Etapa 3 — Substituição do import

### ANTES (linha 13)
```js
import './Phase6Combat.css'
```

### DEPOIS (linhas 13-16)
```js
import './Phase6CombatV2.css'
import './atb-canvas.css'
import './atb-hud.css'
import './atb-ui.css'
```

### Grep de confirmação
```
PS> grep "Phase6Combat.css" Phase6CombatV2.jsx
(saída vazia) ✅
```

`Phase6Combat.jsx` continua com `import './Phase6Combat.css'` intacto — não tocado.

---

## Teste lógico — 8 fluxos

### Fluxo 1 — Action panel slide-in
Classe: `atb-action-panel`, animação `atb-panel-slide-in`
→ Coberto por: **Phase6CombatV2.css** ✅

### Fluxo 2 — Shake + flash na tela
Classes: `atb-root.atb-shake` (keyframe `atb-shake`), `atb-flash-overlay` (keyframe `atb-flash-fade`)
→ Coberto por: **Phase6CombatV2.css** + **atb-ui.css** ✅

### Fluxo 3 — Balão de dano + popup
Classes: `atb-balloon atb-balloon--damage` (keyframe `atb-balloon-float`), `atb-dano-popup` (keyframe `atb-dano-pop`)
→ Coberto por: **atb-ui.css** ✅

### Fluxo 4 — Banner ataque IA
Classes: `atb-attack-banner`, `atb-attack-banner-text` (keyframe `atb-banner-in`)
→ Coberto por: **atb-ui.css** ✅

### Fluxo 5 — Anúncio de turno
Classes: `atb-announcement-overlay`, `atb-announcement-text` + `.ia` / `.vitoria`
→ Coberto por: **atb-ui.css** ✅

### Fluxo 6 — Ordering modal
Classes: Toda família `.atb-ordering-*` (14 classes)
→ Coberto por: **atb-ui.css** ✅

### Fluxo 7 — HUD chip ativo + delta HP
Classes: `atb-hud-chip--active`, `atb-hud-bar-fill.hp-delta` (keyframe `atb-delta-shrink`)
→ Coberto por: **atb-hud.css** ✅

### Fluxo 8 — Top bar com player/enemy
Classes: `atb-top-turn.player`, `atb-top-turn.enemy`
→ Coberto por: **Phase6CombatV2.css** ✅

**8/8 ✅ — Nenhum gap.**

---

## Build

```
vite v8.0.16 → ✓ 1251 modules transformed → ✓ built in 921ms → [prerender] 26 rotas
```

CSS bundle: 541.30 kB (marginal +0.02 kB vs 541.28 kB anterior — 4 novos imports)
Módulos: 1251 (+4 vs 1247 anterior — 4 novos CSS)

---

## Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION minor +1 | 6.4.1 → **6.5.0** |
| `src/config/version.js` | SITE_VERSION patch +1 | 10.159.5 → **10.159.6** |
| `SITE_MAP.md` | Versões atualizadas | ✅ |
| `Phase6CombatV2.css` | Criado (30 classes, 2 @keyframes) | 🆕 |
| `atb-canvas.css` | Criado (4 classes) | 🆕 |
| `atb-hud.css` | Criado (16 classes, 1 @keyframe) | 🆕 |
| `atb-ui.css` | Criado (42 classes, 7 @keyframes) | 🆕 |
| `Phase6CombatV2.jsx` | Import trocado (1→4) | ✅ |
| **Commit** | `a676d62d` — `refactor: CSS modular V2 ... v6.5.0` | ✅ |
| **Deploy** | `Published` | ✅ |

---

## Teste manual pendente

1. Abrir Treino V2 → action panel abre com slide-in da direita
2. Atacar → shake na tela + flash vermelho
3. Dano aparece → balão flutua + popup "-X" no centro
4. Turno da IA → banner "IA ataca!" no topo
5. Anúncio de turno → overlay com nome do personagem (azul para jogador, vermelho para IA)
6. Ordering → modal de ordenação com setas movable/locked
7. HUD → chip ativo destacado com borda ciano, barra de HP encolhendo com delta vermelho
8. Top bar → label "Vez de ..." com cor dinâmica player (ciano) / enemy (vermelho)
