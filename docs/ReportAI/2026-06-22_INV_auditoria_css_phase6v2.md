# INVESTIGAÇÃO: Auditoria Completa CSS e Dependências Phase6CombatV2

> Data: 2026-06-24 (continuação da sessão 2026-06-22)
> Propósito: Inventariar classes, cruzar com uso real no V2, identificar lixo e gaps.

---

## Etapa 1 — Inventário de classes no CSS (grep "^\.")

Output completo (classes definidas em `Phase6Combat.css`):

```
.atb-root::-webkit-scrollbar — 17
.atb-top-bar — 21
.atb-top-back, .atb-top-log-btn — 32-33
.atb-top-end-turn — 54
.atb-top-cancel — 74
.atb-top-info — 93
.atb-top-turn — 99
.atb-top-turn.player — 111
.atb-top-turn.enemy — 112
.atb-top-subphase — 114
.atb-canvas-wrap — 123
.atb-canvas-wrap::before — 140
.atb-canvas — 155
.atb-balloon-container — 163
.atb-action-panel — 171
.atb-action-panel-name — 193
.atb-action-panel-btn — 205
.atb-action-panel-btn:hover:not(:disabled) — 224
.atb-action-panel-btn:disabled — 228
.atb-action-panel-btn--attack — 233
.atb-action-panel-btn--hp — 237
.atb-action-panel-btn--mp — 241
.atb-action-panel-btn--close — 245
.atb-balloon — 252
.atb-balloon--damage — 264
.atb-balloon--heal — 265
.atb-balloon--block — 266
.atb-balloon--extra — 267
.atb-balloon--contra — 268
.atb-balloon--miss — 269
.atb-hud — 286
.atb-hud-chip — 296
.atb-hud-chip:hover — 310
.atb-hud-chip--active — 314
.atb-hud-dot — 319, 328
.atb-hud-dot.jogador — 326
.atb-hud-dot.ia — 327
.atb-hud-info — 330
.atb-hud-name — 335
.atb-hud-bars — 347
.atb-hud-bar-row — 353
.atb-hud-bar-track — 355, 947
.atb-hud-bar-fill — 361
.atb-hud-bar-fill.hp — 367
.atb-hud-bar-fill.mp — 368
.atb-hud-bar-fill.hp-delta — 948
.atb-bottom-nav — 370
.atb-action-btn — 383
.atb-action-btn:hover:not(:disabled) — 404
.atb-action-btn:disabled — 409
.atb-action-btn--attack — 414
.atb-action-btn--attack:hover:not(:disabled) — 419
.atb-action-btn--confirm — 424
.atb-action-btn--cancel — 430
.atb-action-btn--end — 435
.atb-action-btn--end-turn — 442
.atb-action-btn--skip — 449
.atb-action-btn--item — 454
.atb-item-qty — 462
.atb-phase-hint — 479
.atb-ia-thinking-row — 487
.atb-ia-dots — 495
.atb-drawer-overlay — 507
.atb-drawer — 516
.atb-drawer-handle — 527
.atb-drawer-title — 535
.atb-drawer-list — 545
.atb-drawer-entry — 550
.atb-modal-overlay — 558
.atb-modal — 568
.atb-modal-header — 576
.atb-modal-dot — 585
.atb-modal-dot.jogador — 592
.atb-modal-dot.ia — 593
.atb-modal-name — 595
.atb-modal-close — 602
.atb-modal-close:hover — 617
.atb-modal-body — 621
.atb-modal-stat — 628
.atb-modal-stat-label — 634
.atb-modal-stat-label.hp — 641
.atb-modal-stat-label.mp — 642
.atb-modal-bar-track — 644
.atb-modal-bar-fill — 651
.atb-modal-bar-fill.hp — 657
.atb-modal-bar-fill.mp — 658
.atb-modal-stat-val — 660
.atb-modal-attr-row — 668
.atb-result — 676
.atb-result-card — 684
.atb-result-card h2 — 695
.atb-result-sub — 705
.atb-btn — 712
.atb-btn-primary — 723
.atb-btn-primary:hover — 729
.atb-root.atb-shake — 739
.atb-flash-overlay — 743
.atb-announcement-overlay — 757
.atb-announcement-text — 776
.atb-announcement-text.ia — 790
.atb-announcement-text.vitoria — 797
.atb-ordering-overlay — 812
.atb-ordering-modal — 822
.atb-ordering-title — 834
.atb-ordering-subtitle — 844
.atb-ordering-list — 851
.atb-ordering-row — 857
.atb-ordering-row.movable — 867
.atb-ordering-row.locked — 872
.atb-ordering-position — 876
.atb-ordering-name — 883
.atb-ordering-agi — 890
.atb-ordering-arrows — 896
.atb-ordering-btn — 902
.atb-ordering-btn:hover:not(:disabled) — 917
.atb-ordering-btn:disabled — 922
.atb-ordering-confirm — 927
.atb-ordering-confirm:hover — 943
.atb-dano-popup — 958
.atb-dano-popup-num — 963
.atb-attack-banner — 975
.atb-attack-banner-text — 979
```

---

## Etapa 2 — Classes que o V2 realmente usa

```
atb-action-btn
atb-action-btn--cancel
atb-action-btn--confirm
atb-action-btn--end-turn
atb-action-panel
atb-action-panel-btn
atb-action-panel-btn--attack
atb-action-panel-btn--hp
atb-action-panel-btn--mp
atb-action-panel-name
atb-announcement-overlay
atb-attack-banner
atb-attack-banner-text
atb-balloon-container
atb-bottom-nav
atb-btn
atb-btn-primary
atb-canvas
atb-canvas-wrap
atb-dano-popup
atb-dano-popup-num
atb-drawer
atb-drawer-entry
atb-drawer-handle
atb-drawer-list
atb-drawer-overlay
atb-drawer-title
atb-flash-overlay
atb-hud
atb-hud-bar-fill
atb-hud-bar-row
atb-hud-bars
atb-hud-bar-track
atb-hud-dot
atb-hud-info
atb-hud-name
atb-ia-dots
atb-ia-thinking-row
atb-ordering-agi
atb-ordering-arrows
atb-ordering-btn
atb-ordering-confirm
atb-ordering-list
atb-ordering-modal
atb-ordering-name
atb-ordering-overlay
atb-ordering-position
atb-ordering-subtitle
atb-ordering-title
atb-result
atb-result-card
atb-result-sub
atb-top-back
atb-top-bar
atb-top-info
atb-top-log-btn
atb-top-subphase
```

Plus sub-classes usadas dinamicamente (não capturadas pelo grep de className estático):
- `atb-shake` — via `uiCtrl.shaking ? 'atb-shake' : ''`
- `atb-hud-chip--active` — via `${isActive ? 'atb-hud-chip--active' : ''}`
- `atb-top-turn` + `.player` / `.enemy` — via `${currentChar?.time === 'ia' ? 'enemy' : 'player'}`
- `atb-balloon--${b.tipo}` — via `atb-balloon--${b.tipo}` (damage, heal, block, extra, contra, miss)
- `atb-announcement-text` + `.ia` / `.vitoria` — via `uiCtrl.announcementClass`
- `atb-ordering-row` + `.movable` / `.locked` — via `${isMovable ? 'movable' : 'locked'}`
- `atb-hud-bar-fill hp` — via `"atb-hud-bar-fill hp"`
- `atb-hud-bar-fill mp` — via `"atb-hud-bar-fill mp"`
- `atb-hud-bar-fill hp-delta` — via `"atb-hud-bar-fill hp-delta"`
- `atb-action-panel-btn--close` — NÃO usada no V2
- `atb-hud-dot` — via `"atb-hud-dot"` (mas SEM `.jogador`/`.ia`, usa inline `--dot-color`)

---

## Etapa 3 — Cruzamento

### Lista A — Classes usadas no V2 E definidas no CSS
(72 classes base + sub-classes dinâmicas)

`atb-root`, `atb-top-bar`, `atb-top-back`, `atb-top-log-btn`, `atb-top-info`, `atb-top-turn`, `atb-top-turn.player`, `atb-top-turn.enemy`, `atb-top-subphase`, `atb-canvas-wrap`, `atb-canvas`, `atb-balloon-container`, `atb-balloon`, `atb-balloon--damage`, `atb-balloon--heal`, `atb-balloon--block`, `atb-balloon--extra`, `atb-balloon--contra`, `atb-balloon--miss`, `atb-action-panel`, `atb-action-panel-name`, `atb-action-panel-btn`, `atb-action-panel-btn--attack`, `atb-action-panel-btn--hp`, `atb-action-panel-btn--mp`, `atb-hud`, `atb-hud-chip`, `atb-hud-chip--active`, `atb-hud-dot`, `atb-hud-info`, `atb-hud-name`, `atb-hud-bars`, `atb-hud-bar-row`, `atb-hud-bar-track`, `atb-hud-bar-fill`, `atb-hud-bar-fill.hp`, `atb-hud-bar-fill.mp`, `atb-hud-bar-fill.hp-delta`, `atb-bottom-nav`, `atb-action-btn`, `atb-action-btn--confirm`, `atb-action-btn--cancel`, `atb-action-btn--end-turn`, `atb-ia-thinking-row`, `atb-ia-dots`, `atb-drawer-overlay`, `atb-drawer`, `atb-drawer-handle`, `atb-drawer-title`, `atb-drawer-list`, `atb-drawer-entry`, `atb-result`, `atb-result-card`, `atb-result-sub`, `atb-btn`, `atb-btn-primary`, `atb-root.atb-shake`, `atb-flash-overlay`, `atb-announcement-overlay`, `atb-announcement-text`, `atb-announcement-text.ia`, `atb-announcement-text.vitoria`, `atb-ordering-overlay`, `atb-ordering-modal`, `atb-ordering-title`, `atb-ordering-subtitle`, `atb-ordering-list`, `atb-ordering-row`, `atb-ordering-row.movable`, `atb-ordering-row.locked`, `atb-ordering-position`, `atb-ordering-name`, `atb-ordering-agi`, `atb-ordering-arrows`, `atb-ordering-btn`, `atb-ordering-confirm`, `atb-dano-popup`, `atb-dano-popup-num`, `atb-attack-banner`, `atb-attack-banner-text`

### Lista B — Classes definidas no CSS mas NÃO usadas no V2 (lixo)
(31 classes)

| # | Classe | Linha CSS | Motivo |
|---|--------|-----------|--------|
| 1 | `.atb-top-end-turn` | 54 | Só V1 (usa botão na top bar) |
| 2 | `.atb-top-end-turn:hover` | 70 | Só V1 |
| 3 | `.atb-top-cancel` | 74 | Só V1 |
| 4 | `.atb-top-cancel:hover` | 89 | Só V1 |
| 5 | `.atb-action-btn--attack` | 414 | Só V1 (V2 usa atb-action-panel-btn--attack) |
| 6 | `.atb-action-btn--attack:hover:not(:disabled)` | 419 | Só V1 |
| 7 | `.atb-action-btn--end` | 435 | Só V1 (botão end turn diferente) |
| 8 | `.atb-action-btn--skip` | 449 | Só V1 |
| 9 | `.atb-action-btn--item` | 454 | Só V1 |
| 10 | `.atb-item-qty` | 462 | Só V1 |
| 11 | `.atb-phase-hint` | 479 | Só V1 |
| 12 | `.atb-modal-overlay` | 558 | Só V1 (V2 usa CharModal com CSS próprio) |
| 13 | `.atb-modal` | 568 | Só V1 |
| 14 | `.atb-modal-header` | 576 | Só V1 |
| 15 | `.atb-modal-dot` | 585 | Só V1 |
| 16 | `.atb-modal-dot.jogador` | 592 | Só V1 |
| 17 | `.atb-modal-dot.ia` | 593 | Só V1 |
| 18 | `.atb-modal-name` | 595 | Só V1 |
| 19 | `.atb-modal-close` | 602 | Só V1 |
| 20 | `.atb-modal-close:hover` | 617 | Só V1 |
| 21 | `.atb-modal-body` | 621 | Só V1 |
| 22 | `.atb-modal-stat` | 628 | Só V1 |
| 23 | `.atb-modal-stat-label` | 634 | Só V1 |
| 24 | `.atb-modal-stat-label.hp` | 641 | Só V1 |
| 25 | `.atb-modal-stat-label.mp` | 642 | Só V1 |
| 26 | `.atb-modal-bar-track` | 644 | Só V1 |
| 27 | `.atb-modal-bar-fill` | 651 | Só V1 |
| 28 | `.atb-modal-bar-fill.hp` | 657 | Só V1 |
| 29 | `.atb-modal-bar-fill.mp` | 658 | Só V1 |
| 30 | `.atb-modal-stat-val` | 660 | Só V1 |
| 31 | `.atb-modal-attr-row` | 668 | Só V1 |
| 32 | `.atb-hud-dot.jogador` | 326 | V2 usa inline `--dot-color` no lugar |
| 33 | `.atb-hud-dot.ia` | 327 | V2 usa inline `--dot-color` no lugar |

### Lista C — Classes usadas no V2 mas NÃO definidas no CSS
(0 — todas as classes que o V2 usa estão no CSS)

Nenhum gap encontrado. Todas as classes `atb-*` referenciadas no V2 têm definição correspondente no CSS.

---

## Etapa 4 — Variáveis CSS globais necessárias

```
var(--dot-color, #00ff88)  — definida inline no V2 (fallback no CSS)
var(--ldi-bg)
var(--ldi-bg2)
var(--ldi-bg3)
var(--ldi-border)
var(--ldi-cyan)
var(--ldi-cyan-dim)
var(--ldi-font-hud)
var(--ldi-font-mono)
var(--ldi-gold)
var(--ldi-red)
var(--ldi-red-dim)
var(--ldi-text)
var(--ldi-text-dim)
var(--pct)                 — definida inline no V2 (style)
var(--x)                   — definida inline no V2 (style)
var(--y)                   — definida inline no V2 (style)
```

**Dependências obrigatórias do CSS global (fora do Phase6Combat.css):**
- `--ldi-bg`, `--ldi-bg2`, `--ldi-bg3` — cores de fundo
- `--ldi-border` — cor de borda
- `--ldi-cyan`, `--ldi-cyan-dim` — cor de destaque primária
- `--ldi-red`, `--ldi-red-dim` — cor de inimigo/dano
- `--ldi-gold` — cor de ouro (ataque extra)
- `--ldi-text`, `--ldi-text-dim` — cores de texto
- `--ldi-font-hud` — fonte HUD (mono ou display)
- `--ldi-font-mono` — fonte monoespaçada

---

## Etapa 5 — Efeitos JS vs CSS

### a) Animações CSS puras (@keyframes + animation)

| @keyframes | animation | Linha |
|---|---|---|
| `atb-panel-slide-in` | `animation: atb-panel-slide-in 0.18s ease-out forwards` | 185/188 |
| `atb-balloon-float` | `animation: atb-balloon-float 1.2s ease-out forwards` | 258/271 |
| `atb-ia-pulse` | `animation: atb-ia-pulse 1.2s ease-in-out infinite` | 499/502 |
| `atb-shake` | `animation: atb-shake 0.4s ease-in-out` | 740/733 |
| `atb-flash-fade` | `animation: atb-flash-fade 0.4s ease-out forwards` | 749/752 |
| `atb-announce-fade` | `animation: atb-announce-fade 2s ease-in-out forwards` | 766/769 |
| `atb-announce-scale` | `animation: atb-announce-scale 2s ease-in-out forwards` | 787/804 |
| `atb-delta-shrink` | `animation: atb-delta-shrink 0.8s ease-out forwards` | 951/953 |
| `atb-dano-pop` | `animation: atb-dano-pop 0.8s ease-out forwards` | 966/968 |
| `atb-banner-in` | `animation: atb-banner-in 1.2s ease-out forwards` | 983/985 |

### b) Efeitos toggled por JS

| Efeito | Classe CSS | Ativado por | No V2 |
|---|---|---|---|
| Shake | `.atb-root.atb-shake` | `uiCtrl.shaking` | `className={`atb-root ${uiCtrl.shaking ? 'atb-shake' : ''}`}` |
| Flash | `.atb-flash-overlay` | `uiCtrl.flashDmg` | `{uiCtrl.flashDmg && <div className="atb-flash-overlay" />}` |
| Anúncio | `.atb-announcement-overlay` | `uiCtrl.turnAnnouncement` | `{uiCtrl.turnAnnouncement && <div className="atb-announcement-overlay">...}` |
| Balão | `.atb-balloon--${tipo}` | `uiCtrl.balloons[]` | `{uiCtrl.balloons.map(b => <div className={`atb-balloon atb-balloon--${b.tipo}`}>...}` |
| Dano popup | `.atb-dano-popup` | `uiCtrl.danoPopup` | `{uiCtrl.danoPopup && <div className="atb-dano-popup">...}` |
| Banner ataque | `.atb-attack-banner` | `uiCtrl.attackBanner` | `{uiCtrl.attackBanner && <div className="atb-attack-banner">...}` |

Todos os efeitos são gerenciados pelo hook `useUIController.js` que expõe estados reativos (`shaking`, `flashDmg`, `turnAnnouncement`, `balloons`, `danoPopup`, `attackBanner`) e funções (`dispararImpacto`, `dispararFlash`, `anunciar`, `adicionarBalao`, `mostrarDanoPopup`, `mostrarBannerAtaque`). Nenhum estado de efeito vive no V2.

---

## Conclusão

| Métrica | Valor |
|---|---|
| Classes CSS definidas | ~120 |
| Classes usadas pelo V2 | ~72 |
| Classes lixo (V1-only) | 33 |
| Classes faltando (gap) | 0 |
| Variáveis CSS globais necessárias | 11 (`--ldi-*` + fontes) |
| @keyframes animações CSS | 10 |
| Efeitos toggled por JS | 6 |

**33 classes são lixo — candidatas a remoção num futuro CSS só do V2.** Correspondem a:
- Modal de personagem antigo (V1): 18 classes `.atb-modal-*`
- Botões da top bar antiga: `.atb-top-end-turn`, `.atb-top-cancel` + hovers
- Botões de ação específicos do V1: `.atb-action-btn--attack`, `--end`, `--skip`, `--item` + hovers
- Misc V1: `.atb-item-qty`, `.atb-phase-hint`
- Sub-classes `.jogador`/`.ia` no hud-dot (V2 usa `--dot-color`)

**Dependência zero de gaps** — toda classe que o V2 usa já está definida. O único CSS externo necessário são as variáveis globais `--ldi-*` definidas no `index.css` ou `ArenaTestbed.css`.
