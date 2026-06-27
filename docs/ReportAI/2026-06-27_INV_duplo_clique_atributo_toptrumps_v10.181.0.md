# INV — Duplo clique no atributo para abrir modal de confirmação — v10.181.0

> Investigação pura — nenhuma edição de código.

---

## 1. Fluxo completo (toque → modal)

| Etapa | Arquivo | Linha | Detalhe |
|---|---|---|---|
| **Render atributo** | `TopTrumpsCard.jsx` | 84-122 | Mapa de `ATTR_META` → dois `<div>` por atributo (label + valor) |
| **Handler onClick** | `TopTrumpsCard.jsx` | 104, 113 | `onClick={clicavel && !disabled ? () => onAttributeClick(attr.key) : undefined}` |
| **Condição de clicável** | `TopTrumpsCard.jsx` | 87 | `clicavel = !!onAttributeClick && !mystery` |
| **Condição de disabled** | `TopTrumpsCard.jsx` | 92, 98 | `(disabled \|\| mystery) && 'tt-card-attr--disabled'` |
| **Prop onAttributeClick** | `TopTrumps.jsx` | 766 | `onAttributeClick={!isVezIA ? (attr) => onClickAtributo(attr) : undefined}` |
| **Prop disabled** | `TopTrumps.jsx` | 767 | `disabled={girando \|\| !!confirmandoAtributo \|\| isVezIA \|\| iaEscolhendo}` |
| **Função onClickAtributo** | `TopTrumps.jsx` | 285-289 | Guard + `setConfirmandoAtributo(atributoId)` |
| **Abertura do modal** | `TopTrumps.jsx` | 798 | `{confirmandoAtributo && (() => { ... })}` |

**Fluxo lógico:**
1. Render → `clicavel = true`, `disabled = false` → `onClick` é função
2. Toque → `onClick` dispara → `onClickAtributo(attr.key)`
3. Guard `if (girando || confirmandoAtributo) return` → passa (ambos falsos)
4. `sfx.select()` → `setConfirmandoAtributo(atributoId)` (síncrono)
5. Re-render → `confirmandoAtributo` truthy → modal aparece

## 2. Respostas (Q1–Q7)

| # | Pergunta | Resposta | Evidência |
|---|---|---|---|
| Q1 | Handler usa onClick, onTouchStart ou onPointerDown? | **`onClick`** | `TopTrumpsCard.jsx:104,113` — `onClick={...}` |
| Q2 | Há delay no mobile? | **Sim — ~300ms** | Nenhum `touch-action` definido em `TopTrumpsCard.css` ou `TopTrumps.css`. Default `touch-action: auto` no mobile faz o browser esperar para detectar double-tap antes de sintetizar `click` |
| Q3 | Estado do modal é setado diretamente? | **Sim, diretamente** | `TopTrumps.jsx:288` — `setConfirmandoAtributo(atributoId)` é síncrono no handler, sem intermediário |
| Q4 | Existe useEffect ou async entre clique e abertura? | **Não** | `onClickAtributo` (285-289) é síncrono puro. O modal abre condicionalmente na render: `{confirmandoAtributo && ...}` |
| Q5 | Elemento pai com onTouchStart/onTouchEnd? | **Não** | `grep` por `onTouchStart|onTouchEnd|touchstart|touchend` em `TopTrumps.jsx` e `TopTrumpsCard.jsx` → vazio |
| Q6 | CSS com touch-action ou pointer-events bloqueante? | **`pointer-events: none` no `.tt-card-template-img`** (imagem PNG decorativa, linha 42) — correto: permite que cliques passem pela moldura até os dados. **Nenhum `touch-action` definido.** |
| Q7 | Ocorre em mobile, desktop ou ambos? | Provavelmente **mais perceptível em mobile** | Desktop não tem delay de tap-to-click. O double-click pode também ocorrer em desktop se o usuário clicar muito rápido (React batched state + guard). |

## 3. Causa raiz

**Causa primária:** Ausência de `touch-action: manipulation` nos elementos `.tt-card-attr-clickable` (`TopTrumpsCard.jsx:104,113`).

No mobile, o browser com `touch-action: auto` (padrão) espera ~300ms após um toque para determinar se é um tap único ou double-tap. Só então o evento `click` é sintetizado. Para o usuário, o jogo parece não responder ao primeiro toque, então ele toca novamente. O segundo toque, agora com o modal já aberto (se o primeiro click eventualmente chegou), ou com o primeiro click ainda processando, cria a percepção de "precisa de dois cliques".

**Fatores agravantes:**
- O guard `if (girando || confirmandoAtributo) return` no `onClickAtributo` (`TopTrumps.jsx:286`) é bem-intencionado mas pode engolir o segundo clique se o primeiro já setou `confirmandoAtributo` e o modal ainda não re-renderizou.
- Os elementos clicáveis são `<div>` com `role="button"`, não `<button>` nativos. `<button>` tem comportamento de click mais consistente em mobile (o browser não precisa sintetizar `click` de touch — `<button>` recebe `click` nativamente).

**Causa secundária:** Dois `<div>` separados (label + valor) com `onClick` idêntico podem criar confusão no targeting do evento em touch (o ponto de toque pode cair na label OU no valor, e em telas pequenas a diferença é milimétrica).

## 4. Proposta de correção

> ⚠️ Apenas proposta — nenhuma implementação nesta task.

1. **Adicionar `touch-action: manipulation`** na classe `.tt-card-attr-clickable` no `TopTrumpsCard.css`
   ```css
   .tt-card-attr-clickable {
     cursor: pointer;
     touch-action: manipulation;
     transition: transform 0.15s, filter 0.15s;
   }
   ```
   Isso elimina o delay de 300ms em mobile — o browser não espera por double-tap.

2. **Considerar usar `<button>` em vez de `<div role="button">`** para os atributos clicáveis. `<button>` tem comportamento de click mais previsível em mobile porque já é um elemento intrinsecamente interativo — o browser não precisa sintetizar `click` de touch.

3. **Adicionar `user-select: none`** nos atributos clicáveis para evitar seleção de texto acidental durante o toque.

4. **O guard do `onClickAtributo`** está correto e não deve ser removido — ele previne duplo clique. A causa raiz não está no guard.
