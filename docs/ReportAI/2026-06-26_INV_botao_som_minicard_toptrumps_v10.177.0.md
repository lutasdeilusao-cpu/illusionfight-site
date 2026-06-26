# INV — Diagnóstico: Botão Som + Mini Card (Top Trumps SP)

**Data:** 2026-06-26
**Versão:** 10.177.0
**Propósito:** Investigar por que o botão de som "ainda aparece no canto direito" e o mini card "continua pequeno" apesar dos commits.

---

## ETAPA 1 — Histórico real dos últimos commits

```
21758ad3 inv: verificação task anterior TopTrumps + v10.177.0    (18:38, docs only)
2e95507b report: VS glow + mini card altura TopTrumps v10.177.0  (18:29, docs only)
4aec6beb fix: VS glow intensidade + mini card altura 238px       (18:29, CSS + version)
b011b2db fix: layout jogando v3 — botão som dentro container      (18:05, CSS + JSX + version)
```

**Commit que tocou CSS/JSX:** `4aec6beb` (VS glow + mini card) e `b011b2db` (som dentro container).
**Commits seguintes** (`2e95507b` e `21758ad3`): apenas relatórios/docs — **não tocam CSS nem JSX.**

---

## ETAPA 2 — Botão de som

### 2.1 CSS atual do `.tt-sound-toggle` (L1-26):
```
position: absolute;
top: 0.75rem;
right: 0.75rem;
z-index: 10;
```
**✅ position: absolute (NÃO fixed).** Alterado de `fixed` para `absolute` no commit `b011b2db`.

### 2.2 Posição no JSX por fase:

| Fase | Botão dentro de? | Container com position? |
|---|---|---|
| **Menu** (L622-626) | Filho direto de `tt-page--menu` | `tt-page--menu` tem `position: relative` |
| **PPT** (L782-785) | Filho direto de `tt-page` | `tt-page` tem `position: relative` |
| **Jogando** (L871-875) | **Dentro** de `tt-game-container` | `tt-game-container` tem `position: relative` |
| **Resultado rodada** (L998-1001) | Filho direto de `tt-page` | `tt-page` tem `position: relative` |
| **Recompensa** (L1082-1086) | Filho direto de `tt-page` | `tt-page` tem `position: relative` |
| **Fim jogo** (L1132-1136) | Filho direto de `tt-page` | `tt-page` tem `position: relative` |

**O botão foi movido para DENTRO de `tt-game-container` APENAS na fase jogando.** Nas demais fases, é filho direto de `tt-page`.

### 2.3 `.tt-game-container` tem `position: relative`? ✅ (L2334)
### 2.4 `.tt-page` tem `position: relative`? ✅ (L541)

### 2.5 Bundle CSS (enviado ao browser):
```
tt-sound-toggle{z-index:10;...;width:2.2rem;height:2.2rem;...;position:absolute;top:.75rem;right:.75rem}
```
**✅ position: absolute no bundle — sem fixed.**

### 2.6 Por que ainda aparece no canto direito?

**O botão SEMPRE esteve no canto direito e continua lá.** A mudança do commit `b011b2db` foi:

| Propriedade | Antes | Depois |
|---|---|---|
| `position` | `fixed` | `absolute` |
| `top` | `1rem` | `0.75rem` |
| `right` | `1rem` | `0.75rem` |
| `z-index` | `999` | `10` |
| Referência | viewport (fixed) | `.tt-game-container` ou `.tt-page` (absolute) |

A posição **visual** (top-right) não mudou — o que mudou foi a referência de posicionamento e o z-index. O botão continua no canto direito porque `position: absolute; top: 0.75rem; right: 0.75rem` dentro de um container `position: relative` que ocupa 100% da largura produz o mesmo resultado visual que `position: fixed; top: 1rem; right: 1rem`.

**Se a intenção era mover o botão para outro lugar (centralizar, etc.), isso nunca foi implementado — não estava no escopo da task.**

---

## ETAPA 3 — Mini Card

### 3.1 CSS atual:
```
.tt-card--mini-wrapper { height: 238px; }   (L2374)
.tt-card--mini { transform: scale(0.33); }   (L2382)
```

### 3.2 Bundle CSS:
```
tt-card--mini-wrapper{...;height:238px;...}
tt-card--mini{...;transform:scale(.33);...}
```
**✅ height:238px e scale(0.33) no bundle.**

### 3.3 Media queries em TopTrumps.css (L2399-2429):

Há 3 @media, todas entre linhas 2399-2429. **Nenhuma** toca `.tt-card--mini-wrapper` ou `.tt-card--mini`. Apenas afetam `.tt-player-card-wrapper`.

### 3.4 Media queries em TopTrumpsCard.css (L272-311):

Há 3 @media. **Nenhuma** toca `.tt-card--mini-wrapper` ou `.tt-card--mini`. Apenas afetam `.tt-card-wrapper` e `.tt-card-template` genéricos.

### 3.5 Por que o mini card "continua pequeno"?

O mini card usa `transform: scale(0.33)` — é **intencionalmente pequeno** por ser uma miniatura. O card base é 550×720; em scale(0.33) ele mede ~182×238px visuais. O wrapper tem `height: 238px` para conter exatamente essa altura.

**Linha do tempo do height do wrapper:**
- Original: `130px` (card cortado)
- Commit `b011b2db`: `240px` (espaço generoso)
- Commit `4aec6beb`: `238px` (exato = 720 × 0.33)

O wrapper agora tem a altura **exata** do card em scale(0.33). Se o usuário acha o mini card pequeno, a solução é aumentar o `scale()` — não é um bug de CSS, é uma decisão de design.

---

## ETAPA 4 — Deploy

| Branch | Commit | Timestamp | Contém CSS fixes? |
|---|---|---|---|
| `main` (HEAD) | `21758ad3` | 18:38:18 | Sim (herdado de `4aec6beb`) |
| `gh-pages` (live) | `2f7ef8df` | 18:29:22 | **Sim** (build de `4aec6beb`) |

O deploy contém `assets/index-C62bIwhf.css` com `height:238px` e `position:absolute` ✅.
O branch `gh-pages` está 2 commits atrás do `main`, mas esses commits são apenas docs (não afetam o jogo).

**O deploy está correto. O código no ar contém as alterações.**

---

## Conclusão

| Questão | Resposta |
|---|---|
| **Botão: position no CSS?** | `position: absolute; top: 0.75rem; right: 0.75rem` — NÃO é fixed |
| **Botão: dentro do container na fase jogando?** | ✅ Sim, dentro de `tt-game-container` |
| **Botão: bundle contém position:fixed?** | Não. `position:absolute` no bundle |
| **Botão: por que ainda no canto direito?** | Porque `position: absolute; right: 0.75rem` COLOCA no canto direito. Só mudou de `fixed` p/ `absolute`, a posição visual é a mesma |
| **Mini card: height no CSS?** | `238px` ✅ |
| **Mini card: media query sobrescrevendo?** | **Nenhuma.** Zero @media toca `.tt-card--mini-wrapper` |
| **Mini card: bundle contém 238px?** | ✅ Sim |
| **Mini card: por que ainda pequeno?** | `scale(0.33)` é intencional. O wrapper agora tem altura exata do card (238px). Se quer maior, precisa aumentar o scale |
| **Deploy: gh-pages contém as mudanças?** | ✅ Sim. `index-C62bIwhf.css` com valores corretos |

**Diagnóstico final:** O código está correto, o deploy está correto, não há conflitos. O botão de som continua visualmente no canto direito porque a task anterior (b011b2db) mudou de `fixed` para `absolute` mas manteve `right: 0.75rem` — a posição visual é idêntica. O mini card continua pequeno porque `scale(0.33)` é um valor de design, não um bug.
