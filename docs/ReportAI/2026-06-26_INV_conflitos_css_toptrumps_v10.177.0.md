# INV — Auditoria de Conflitos CSS/JS no Top Trumps SP

**Data:** 2026-06-26
**Propósito:** Investigar por que as correções CSS (VS glow + mini card height) podem não estar refletindo visualmente. Investigação pura — nenhum código editado.

---

## Resumo Executivo

**Não há conflitos.** Nenhum CSS global, inline, ou JS sobrescreve as classes investigadas. O bundle contém exatamente os valores que foram commitados. Se a mudança visual não está aparecendo, a causa **não é conflito de CSS/JS** neste código.

---

## ETAPA 1 — CSS inline no JSX

### TopTrumps.jsx
`Select-String -Pattern "style=\{"` → **0 ocorrências.** Nenhum CSS inline.

### TopTrumpsCard.jsx
`Select-String -Pattern "style=\{"` → **0 ocorrências.** Nenhum CSS inline.

---

## ETAPA 2 — CSS global sobrescrevendo

### Todos os CSS do projeto (93 arquivos, excluindo TopTrumps/ e TopTrumpsCard/)
`Select-String -Pattern "tt-sound-toggle|tt-vs-heartbeat|tt-game-container|tt-card--mini"` em **todos** os CSS não-TopTrumps → **0 ocorrências.**

Nenhum arquivo CSS fora de `TopTrumps.css` contém qualquer regra para as classes investigadas.

---

## ETAPA 3 — Ordem de importação CSS

| Arquivo | Linha | Import |
|---|---|---|
| `src/main.jsx` | 14 | `import './index.css'` (global) |
| `src/pages/games/TopTrumps/TopTrumps.jsx` | 39 | `import './TopTrumps.css'` |
| `src/App.jsx` | — | Nenhum import de CSS |

`index.css` é importado globalmente em `main.jsx`, mas **não contém nenhuma regra para as classes investigadas** (ETAPA 2 confirmou zero matches). Portanto a ordem de importação é irrelevante para este caso.

---

## ETAPA 4 — Classes duplicadas no mesmo CSS

Cada classe consultada aparece **exatamente uma vez** no arquivo:

| Classe | Linhas | Aparições |
|---|---|---|
| `.tt-sound-toggle` | 2 (regra), 20 (:hover), 24 (:active) | **1 bloco único** |
| `.tt-vs-heartbeat-glow` | 2443 (regra), 2453 (::after) | **1 bloco + 1 pseudo-elemento** |
| `.tt-card--mini-wrapper` | 2372 | **1 única definição** |
| `.tt-game-container` | 2333 | **1 única definição** |

Nenhuma definição conflitante. Não há "última definição vencedora" porque cada classe aparece só uma vez.

---

## ETAPA 5 — JS manipulando style/classList diretamente

### TopTrumps.jsx
`Select-String -Pattern "\.style\.|setAttribute.*style|classList"` → 2 ocorrências:

| Linha | Código | Relevante? |
|---|---|---|
| 637 | `el.style.setProperty('--fill', ...)` | ❌ Coleção de cartas (menu), não relacionado |
| 946 | `el.style.width = \`${pctMax}%\`` | ❌ Barra de confirmação de atributo, não relacionado |

**Nenhuma** das ocorrências altera `.tt-sound-toggle`, `.tt-vs-heartbeat-glow`, `.tt-card--mini-wrapper`, ou `.tt-game-container`.

### TopTrumpsCard.jsx
`Select-String -Pattern "\.style\.|setAttribute.*style"` → **0 ocorrências.**

---

## ETAPA 6 — Bundle gerado (fonte da verdade)

Build executado com sucesso. Bundle CSS analisado: `dist/assets/index-C62bIwhf.css`.

### `.tt-sound-toggle` no bundle
```
position:absolute; top:.75rem; right:.75rem; z-index:10
```
**✅ position:absolute — sem fixed.**

### `.tt-vs-heartbeat-glow` no bundle
```
background:radial-gradient(circle,#e8853a8c 0%,#e8853a26 50%,#0000 75%)
filter:blur(2px)
width:70px;height:70px
```
**✅ Opacidade 0.55→0.15, blur, 70px.**

### `.tt-vs-heartbeat-glow::after` no bundle
```
border:2px solid #e8853aa6
inset:-10px
box-shadow:0 0 12px #e8853a80,0 0 24px #e8853a4d,inset 0 0 12px #e8853a26
```
**✅ Border 2px/0.65, inset -10px, box-shadow triplo.**

### `.tt-card--mini-wrapper` no bundle
```
height:238px
```
**✅ 238px.**

### `.tt-game-container` no bundle
```
position:relative
```
**✅ position:relative presente.**

---

## Conclusão

| Questão | Resposta |
|---|---|
| **1.** Existe CSS inline sobrescrevendo? | **Não.** Zero `style={{}}` nas classes investigadas. |
| **2.** Existe CSS global sobrescrevendo? | **Não.** Nenhum arquivo fora de TopTrumps.css contém regras para estas classes. |
| **3.** Classes duplicadas no TopTrumps.css? | **Não.** Cada classe aparece uma única vez. |
| **4.** JS manipulando .style diretamente? | **Não.** As 2 ocorrências são em elementos não relacionados (coleção, barra de atributo). |
| **5.** Bundle contém position:fixed ou position:absolute? | **position:absolute; top:.75rem; right:.75rem; z-index:10.** Sem `fixed`. |
| **VS glow valores corretos no bundle?** | ✅ Sim (0.55, blur(2px), 70px, box-shadow triplo). |
| **Mini card 238px no bundle?** | ✅ Sim. |
| **Game-container position:relative?** | ✅ Sim. |

**Diagnóstico final:** O código CSS está correto, o bundle contém os valores esperados, e não há conflitos de CSS ou JS. Se a mudança visual não está aparecendo no browser, a causa pode ser:
1. **Cache do navegador** — arquivo CSS antigo em cache. Hard refresh (Ctrl+F5) necessário.
2. **Fase errada sendo visualizada** — o layout "jogando" só aparece após o PPT decorativo. Verificar se está na fase correta.
3. **Servidor de produção desatualizado** — o deploy pode não ter sido completado (verificar `npm run deploy`).
