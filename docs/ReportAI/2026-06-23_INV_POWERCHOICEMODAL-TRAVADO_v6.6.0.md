# INV: PowerChoiceModal travando sem liberar turno + ataque comum ausente

**Data:** 2026-06-23
**Investigador:** opencode
**Versão afetada:** v6.6.0 (commit e595baf4 — deleção do monolito Phase6Combat.jsx)

---

## ETAPA 1 — Prova de Leitura

### Arquivos lidos na íntegra
| Arquivo | Linhas |
|---|---|
| `src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx` | 523 |
| `src/pages/Prototype/ArenaTestbed/engine/useCombatEngine.js` | 678 |
| `src/pages/Prototype/ArenaTestbed/components/modals/PowerChoiceModal.jsx` | 44 |
| `src/pages/Prototype/ArenaTestbed/engine/useUIController.js` | 80 |
| `src/pages/Prototype/ArenaTestbed/data/poderes.js` | 76 |

### Grep 1 — PowerChoiceModal em Phase6CombatV2.jsx
```
src/.../Phase6CombatV2.jsx:11:   import PowerChoiceModal from '...'
src/.../Phase6CombatV2.jsx:154:   powerChoiceModal, defensePending } = ui
src/.../Phase6CombatV2.jsx:340:   {powerChoiceModal && (
src/.../Phase6CombatV2.jsx:341:     <PowerChoiceModal
src/.../Phase6CombatV2.jsx:342:       mode={powerChoiceModal.mode}
src/.../Phase6CombatV2.jsx:343:       charName={powerChoiceModal.charName}
src/.../Phase6CombatV2.jsx:344:       opcoes={powerChoiceModal.opcoes}
src/.../Phase6CombatV2.jsx:346:         if (powerChoiceModal.mode === 'ataque') {
src/.../Phase6CombatV2.jsx:348:         } else if (powerChoiceModal.mode === 'defesa') {
src/.../Phase6CombatV2.jsx:362:     <PowerChoiceModal   (defensePending block)
```

### Grep 2 — PowerChoiceModal no V1 (git show e595baf4~1:Phase6Combat.jsx)
```
import PowerChoiceModal from '...'
actionPanel, powerAttackMode, powerChoiceModal, defensePending,
{powerChoiceModal && (
  <PowerChoiceModal
    mode={powerChoiceModal.mode}
    charName={powerChoiceModal.charName}
    opcoes={powerChoiceModal.opcoes}
    onEscolher={(op) => {
      engine.actions.confirmarEscolhaAtaque(op)
    }}
  />
)}
<PowerChoiceModal ... (defense block com opcoes transformadas)
onClick={actions.escolherTipoAtaque}
```

### Grep 3 — Props que PowerChoiceModal aceita (PowerChoiceModal.jsx:4)
```
export default function PowerChoiceModal({ mode, charName, faBruto, opcoes, onEscolher })
```

### Grep 4 — Engine dispara modal (useCombatEngine.js)
```
50:  const [powerChoiceModal, setPowerChoiceModal] = useState(null)
337: setPowerChoiceModal({ mode: 'ataque', charName: currentChar.nome, opcoes: poderesDisponiveis })
341: setPowerChoiceModal(null)
651:   powerChoiceModal,
662:   setPowerAttackMode, setPowerChoiceModal,
```

### Grep 5 — useUIController gerencia modal
```
(nenhuma ocorrência — UIController não gerencia PowerChoiceModal)
```

### Grep 6 — Callbacks de fechamento no engine
```
148-150: animarAtaqueMelee(..., onFinalizar)
153-155: animarAtaqueProjetil(..., onFinalizar)
229:     onUnlockInput(1500)  ← em finalizarAposAtaque (alvo morto)
239:     onUnlockInput(1500)  ← em finalizarAposAtaque (alvo vivo)
313:     onUnlockInput(0)     ← em aposMovimento
639:     onUnlockInput(0)     ← em finalizarTurnoIA
```

---

## ETAPA 2 — Comparação V1 vs V2

### Q1 — Props do PowerChoiceModal

| Prop | V2 (Phase6CombatV2.jsx:341-353) | V1 (git show e595baf4~1) | Status |
|---|---|---|---|
| `mode` | `powerChoiceModal.mode` ✓ | `powerChoiceModal.mode` ✓ | Igual |
| `charName` | `powerChoiceModal.charName` ✓ | `powerChoiceModal.charName` ✓ | Igual |
| `opcoes` | `powerChoiceModal.opcoes` — **RAW powers** 🚫 | `opcoes` — **formatado** {rotulo, poderId, custoMP, disponivel} ✓ | **DIFERENTE** |
| `faBruto` | ausente (só no 2º modal de defesa) | ausente no modal de ataque | Igual |
| `onEscolher` | presente ✓ | presente ✓ | Igual |

**Prop ausente no V2:** Nenhuma prop está faltando nominalmente, mas o **conteúdo de `opcoes`** é radicalmente diferente:
- V1: `opcoes` = `[{ rotulo: t('pcm_comum'), poderId: null, custoMP: 0, disponivel: true }, ...poderes.map(p => ({ rotulo: t(p.chaveI18n), poderId: p.id, custoMP, disponivel: true }))]`
- V2: `opcoes` = `poderesDisponiveis` (raw array de objetos de `PODERES_BASE`, que têm `id`, `chaveI18n`, `custoMP`, `gatilho`, etc. — **sem `rotulo`, sem `poderId`, sem `disponivel`**)

---

### Q2 — Fluxo completo de abertura do modal no V2

1. **Jogador clica ⚔ Atacar** → `actions.escolherTipoAtaque` (Phase6CombatV2.jsx:390)
2. **`escolherTipoAtaque`** (useCombatEngine.js:327-338):
   - L:328 — Busca `currentChar` de `charsRef.current`
   - L:329 — `if (!currentChar || animatingRef.current) return` — guard
   - L:330-331 — `getPoderesPorId(...).filter(p => p.gatilho === 'ataque' && mp >= custoMP)` — filtra poderes disponíveis
   - L:332-335 — **Se 0 poderes disponíveis:** `confirmarEscolhaAtaque({ poderId: null, custoMP: 0, disponivel: true })` → pula modal
   - L:337 — **Se ≥1 poder disponível:** `setPowerChoiceModal({ mode: 'ataque', charName, opcoes: poderesDisponiveis })` — abre modal com **raw powers** 🚫

3. **React render** → `powerChoiceModal` truthy → `<PowerChoiceModal>` renderizado (Phase6CombatV2.jsx:340-355)

---

### Q3 — Fluxo completo de confirmação no V2

1. **Jogador clica botão no modal** → `onClick={() => onEscolher(op)}` (PowerChoiceModal.jsx:31)
2. **Handler `onEscolher`** (Phase6CombatV2.jsx:345-353):
   - L:346 — `if (powerChoiceModal.mode === 'ataque')`
   - L:347 — `actions.confirmarEscolhaAtaque(op)` chamada
3. **`confirmarEscolhaAtaque(op)`** (useCombatEngine.js:340-352):
   - L:341 — `setPowerChoiceModal(null)` → modal fecha
   - L:342-343 — refetch `currentChar`, guard
   - L:344 — `setPowerAttackMode(!!opcao.poderId)` ← **op.poderId === undefined** → powerAttackMode = false 🚫
   - L:345 — calcula alcance
   - L:346 — `getCelulasAtaque(...)`
   - L:347 — `setRangeCells(atkCells)`
   - L:348 — `setAttackCells(...)` — filtra células com inimigos
   - L:350 — `setSubPhaseStep('escolher_alvo')`
   - L:351 — `setSubPhase('acao')`
4. **Jogador clica em inimigo** → `handleCanvasClick` (Phase6CombatV2.jsx:256-259) → `actions.executarAtaque(target)`
5. **`executarAtaque(target)`** (useCombatEngine.js:354-383):
   - L:358 — `lockInput()` → input travado
   - L:364 — `if (powerAttackMode)` → **false** (op.poderId era undefined) → poder ignora
   - L:375-382 — ataque resolve, anima, `aposAnimacaoAtaque → finalizarAposAtaque → unlockInput`

**🚩 PROBLEMA:** O fluxo **SÓ funciona se o usuário conseguir clicar em um botão do modal**. Mas:

- **Botões estão desabilitados**: `disabled={!op.disponivel}` — e raw powers não têm `disponivel` → `!undefined = true` → disabled
- **Botões não têm texto**: `{op.rotulo}` — raw powers têm `chaveI18n`, não `rotulo` → `undefined` renderizado
- **Não há opção "ataque comum"**: V1 tinha `{ rotulo: t('pcm_comum'), poderId: null, ... }` como primeira opção — V2 não tem
- **Modal não tem botão fechar**: overlay `onClick={() => {}}` — vazio

**Conclusão: o jogador fica preso no modal sem poder interagir → TRAVADO**

---

### Q4 — Ataque comum sem poder

**V1** (git show e595baf4~1):
- Linha `escolherTipoAtaque`: se `poderesDisponiveis.length === 0`, chama `confirmarEscolhaAtaque({ rotulo: '', poderId: null, custoMP: 0, disponivel: true })` → sem modal, vai direto para seleção de alvo
- Se há poderes, o modal sempre inclui `{ rotulo: t('pcm_comum'), poderId: null, ... }` como primeira opção

**V2** (useCombatEngine.js:332-334):
- Se `poderesDisponiveis.length === 0` → chama `confirmarEscolhaAtaque({ poderId: null, custoMP: 0, disponivel: true })` → sem modal, OK
- **Se há poderes, NÃO inclui opção "ataque comum"** no modal 🚫

---

### Q5 — useInputLock no fluxo de poder

| Ação | V2 - Chamada de lock/unlock | Linha |
|---|---|---|
| Turno do jogador inicia | `unlockInput(1500)` | Phase6CombatV2.jsx:129 |
| Ação executada (ataque) | `lockInput()` | useCombatEngine.js:360 |
| Após animação de ataque | `unlockInput(1500)` | useCombatEngine.js:229/239 |
| Após movimento | `unlockInput(0)` | useCombatEngine.js:313 |

**🚩 Input NÃO é travado antes de abrir o modal** — Não há `lockInput()` em `escolherTipoAtaque` (useCombatEngine.js:327). O modal abre com input destravado, o que não causa o travamento por si só, mas significa que o jogador poderia clicar no canvas por baixo do modal (embora o modal tenha `onClick={() => {}}` no overlay, que só previne fechamento, não cliques no canvas — mas o canvas está atrás do overlay no DOM).

**Input é destravado APENAS após `finalizarAposAtaque`** — que SÓ é chamado se o ataque completar o ciclo. Se o modal trava, o ciclo nunca chega em `executarAtaque`, então não há `lockInput`/`unlockInput` envolvido. O problema não é de input lock: é que **o modal simplesmente não oferece interação válida**.

---

## ETAPA 3 — Hipóteses

### Hipótese 1 (MAIS PROVÁVEL — ~90%)

**Refactoring incompleto: `opcoes` do modal são raw power objects, não opções formatadas**

Quando `escolherTipoAtaque` foi movida de Phase6Combat.jsx (V1) para useCombatEngine.js (V2), a transformação de objetos poder → opções do modal foi perdida.

**Evidência:**
- `useCombatEngine.js:337` — `setPowerChoiceModal({ ..., opcoes: poderesDisponiveis })` — raw powers
- V1 (git show e595baf4~1) — construía `opcoes` com `{ rotulo, poderId, custoMP, disponivel }` + opção "ataque comum"
- `poderes.js:1-62` — `PODERES_BASE` objects têm `id`, `chaveI18n`, etc. — **não têm** `rotulo`, `poderId`, `disponivel`
- `PowerChoiceModal.jsx:30-31` — renderiza `op.rotulo` e `disabled={!op.disponivel}` → ambos undefined
- `PowerChoiceModal.jsx:8` — overlay `onClick={() => {}}` — sem close/cancel

**O que precisaria ser verdade:**
O `escolherTipoAtaque` original (V1) construía opcoes com `t()` e formato específico. Ao mover para o engine, essa lógica foi substituída por `opcoes: poderesDisponiveis` sem transformação.

**Como confirmar:**
Adicionar `console.log('[INV] powerChoiceModal.opcoes', opcoes)` em `useCombatEngine.js:337` e verificar que os objetos não têm `poderId`, `rotulo`, ou `disponivel`.

---

### Hipótese 2 (PROVÁVEL — ~8%)

**`escolherTipoAtaque` perdeu guard `inputLockedRef.current`**

**Evidência:**
- V1: `if (!currentChar || animating || inputLockedRef.current) return` — 3 guards
- V2: `if (!currentChar || animatingRef.current) return` — apenas 2 guards, sem `inputLockedRef`

**O que precisaria ser verdade:**
Se o input estiver locked no momento do clique no botão "Atacar", a função V2 não protegeria contra execução duplicada.

**Contra-evidência:**
- O botão "Atacar" está dentro do `actionPanel`, que só renderiza se `!inputLocked` (Phase6CombatV2.jsx:380)
- O modal abre, mas input não está locked neste ponto

**Como confirmar:**
Log `inputLockedRef.current` no início de `escolherTipoAtaque` V2.

---

### Hipótese 3 (IMPROVÁVEL — ~2%)

**`handleCanvasClick` não processa clique em alvo após modal**

**Evidência:**
- `handleCanvasClick` (Phase6CombatV2.jsx:255-258) processa `subPhase === 'acao'` e `subPhaseStep === 'escolher_alvo'`
- Isso só falharia se `attackCells` estivesse vazio ou se `executarAtaque` tivesse bug

**Contra-evidência:**
- O fluxo de `confirmarEscolhaAtaque` → `setAttackCells(...)` roda antes do modal sequer fechar (mas como o modal não fecha porque está travado...)
- Mesmo que fechasse, `attackCells` e `subPhase`/`subPhaseStep` estariam configurados

---

## Conclusão

**Causa raiz mais provável:** Linha `useCombatEngine.js:337` — `setPowerChoiceModal({ mode: 'ataque', charName: currentChar.nome, opcoes: poderesDisponiveis })` passa raw power objects (sem `rotulo`, `poderId`, `disponivel`) para o modal, que exibe botões sem texto e desabilitados, sem opção de "ataque comum" e sem botão fechar → **jogador fica preso**.

**O que precisa de log adicional antes de corrigir:**
```js
// Em useCombatEngine.js, antes de setPowerChoiceModal na linha 337:
console.log('[INV] poder to modal sample:', JSON.stringify(poderesDisponiveis[0]))
console.log('[INV] has rotulo?', 'rotulo' in (poderesDisponiveis[0] || {}))
console.log('[INV] has poderId?', 'poderId' in (poderesDisponiveis[0] || {}))
console.log('[INV] has disponivel?', 'disponivel' in (poderesDisponiveis[0] || {}))
```

## Apêndice: Comparação linha a linha — V1 vs V2

| Aspecto | V1 (Phase6Combat.jsx) | V2 (useCombatEngine.js) | Impacto |
|---|---|---|---|
| Onde está `escolherTipoAtaque` | No componente Phase6Combat | No engine useCombatEngine | Perde acesso a `t()`, `inputLockedRef` |
| Formato `opcoes` | Array de `{rotulo, poderId, custoMP, disponivel}` | Raw power objects | Botões do modal quebrados |
| Tem "ataque comum"? | Sim (`t('pcm_comum')` como 1ª opção) | **Não** | Impossível atacar sem poder |
| Guard `inputLockedRef` | `if (... || inputLockedRef.current) return` | **Ausente** | (menor, protegido pelo actionPanel) |
| Log de escolha | `addLog('Escolheu: common/power_attack')` | **Ausente** | (cosmético) |
| Log de poder escolhido | `addLog('usará [poder]!')` | **Ausente** | (cosmético) |
| Fluxo sem poderes | `confirmarEscolhaAtaque({ poderId: null })` | `confirmarEscolhaAtaque({ poderId: null })` | Igual (funciona) |
| Fechar modal no overlay? | `onClick={() => {}}` (vazio) | `onClick={() => {}}` (vazio) | Igual (sem fechar) |
| Defense `opcoes` | Construído no JSX com `t()` e formato correto | Construído no engine com formato correto (linhas 612-617) | Defense OK |
