# INV: IA trava no projetil — persistente highlight bloqueia canal canvas da state machine

**Versão:** ARENATESTBED v6.9.8 · SITE v10.160.11
**Data:** 2026-06-23
**Status:** INVESTIGAÇÃO EM ANDAMENTO

---

## 1. Output bruto dos greps da Etapa 1

### 1.1 — highlightRef sync do React state

Arquivo: Phase6CombatV2.jsx
```
Line 163:   highlightRef.current = { move: highlightedCells, attack: attackCells, range: rangeCells }
```

### 1.2 — useEffect que dispara highlight effects na state machine

Arquivo: Phase6CombatV2.jsx
```
Line 194:   const prevCellsRef = useRef({ move: [], attack: [], range: [] })
Line 195:   useEffect(() => {
Line 196:     const prev = prevCellsRef.current
Line 197:     if (highlightedCells.length > 0 && prev.move.length === 0) {
Line 198:       dispatchEffect({ tipo: 'highlight_movimento', canal: 'canvas', dados: { cells: highlightedCells } })
Line 199:     }
Line 200:     if (attackCells.length > 0 && prev.attack.length === 0) {
Line 201:       dispatchEffect({ tipo: 'highlight_ataque', canal: 'canvas', dados: { cells: attackCells } })
Line 202:     }
Line 203:     if (rangeCells.length > 0 && prev.range.length === 0) {
Line 204:       dispatchEffect({ tipo: 'highlight_range', canal: 'canvas', dados: { cells: rangeCells } })
Line 205:     }
Line 206:     prevCellsRef.current = { move: highlightedCells, attack: attackCells, range: rangeCells }
Line 207:   }, [highlightedCells, attackCells, rangeCells, dispatchEffect])
```

### 1.3 — Todos os dispatchEffect em Phase6CombatV2.jsx

```
47: const { dispatchEffect } = useEffectMachine()
59: dispatchEffect({ tipo: 'dano', alvo: alvoId, dados: { valor: dano }, caller: 'onDano' })
60: dispatchEffect({ tipo: 'popup', alvo: alvoId, dados: { valor: dano }, caller: 'onDano' })
61: dispatchEffect({ tipo: 'shake', alvo: null, dados: {}, caller: 'onDano' })
62: dispatchEffect({ tipo: 'flash', alvo: alvoId, dados: {}, caller: 'onDano' })
63: dispatchEffect({ tipo: 'hp_delta', alvo: alvoId, dados: { dano }, caller: 'onDano' })
67: dispatchEffect({ tipo: 'balao', alvo: alvoId, dados: { texto, tipo, row, col }, caller: 'onBalao' })
81: dispatchEffect({ tipo: 'melee', alvo: alvo.id, dados: { atacanteId: atacante.id, alvoId: alvo.id, resultado, onFinalizar }, caller: 'onAnimarMelee' })
85: dispatchEffect({ tipo: 'projetil', alvo: alvo.id, dados: { atacanteId: atacante.id, alvoId: alvo.id, resultado, onFinalizar }, caller: 'onAnimarProjetil' })
89: dispatchEffect({ tipo: 'vitoria', alvo: null, dados: { vencedor }, caller: 'onVitoria' })
101: dispatchEffect({ tipo: 'anuncio_turno', alvo: proxChar.id, dados: { nome: proxChar.nome, time: 'jogador' }, caller: 'onTurnoJogador' })
108: dispatchEffect({ tipo: 'anuncio_turno', alvo: proxChar.id, dados: { nome: proxChar.nome, time: 'ia' }, caller: 'onTurnoIA' })
109: dispatchEffect({ tipo: 'ia_thinking', alvo: proxChar.id, dados: {}, caller: 'onTurnoIA' })
119: dispatchEffect({ tipo: 'trail', alvo: null, dados: { row: passo.row, col: passo.col }, caller: 'onTrail' })
128: dispatchEffect({ tipo: 'banner_ia', alvo: null, dados: { nome }, caller: 'onBannerIA' })
198: dispatchEffect({ tipo: 'highlight_movimento', canal: 'canvas', dados: { cells: highlightedCells } })
201: dispatchEffect({ tipo: 'highlight_ataque', canal: 'canvas', dados: { cells: attackCells } })
204: dispatchEffect({ tipo: 'highlight_range', canal: 'canvas', dados: { cells: rangeCells } })
```

### 1.4 — effectsMap: quais efeitos canvas são persistente vs pontual

```
highlight_movimento: canal: 'canvas', tipo: 'persistente'  ← NUNCA finaliza
highlight_ataque:    canal: 'canvas', tipo: 'persistente'  ← NUNCA finaliza
highlight_range:     canal: 'canvas', tipo: 'persistente'  ← NUNCA finaliza
trail:               canal: 'canvas', tipo: 'pontual'      ← auto-finaliza via setTimeout (500ms)
melee:               canal: 'canvas', tipo: 'pontual'      ← auto-finaliza via setTimeout (500ms)
projetil:            canal: 'canvas', tipo: 'pontual'      ← auto-finaliza via setTimeout (600ms)
bola_de_fogo:        canal: 'canvas', tipo: 'pontual'
bola_de_gelo:        canal: 'canvas', tipo: 'pontual'
highlight_limpar:    canal: 'canvas', tipo: 'pontual', duracao: 1  ← NUNCA é disparado
```

### 1.5 — useEffectMachine: tratamento de estados

```
Line  5: const ESTADO_IDLE = 'IDLE'
Line  6: const ESTADO_EXECUTANDO = 'EXECUTANDO'
Line  7: const ESTADO_AGUARDANDO = 'AGUARDANDO'
Line  8: const ESTADO_BLOQUEADO = 'BLOQUEADO'
Line 24: function finalizarEfeito(canal) {          ← só chamado via setTimeout (pontual)
Line 35:     c.estado = ESTADO_IDLE                  ← canal volta a IDLE
Line 40: function executarEfeitoInterno(canal, definicao, tipo, alvo, dados) {
Line 42:     c.estado = ESTADO_EXECUTANDO            ← canal fica EXECUTANDO
Line 55:     if (definicao.tipo === 'pontual') {     ← só pontual agenda finalização
Line 56:       setTimeout(() => finalizarEfeito(canal), definicao.duracao)
Line 68:     const canal = definicao.canal || 'overlay'
Line 71:     if (canal === 'hud') { executarEfeitoInterno(...); return }
Line 76:     if (c.estado === ESTADO_BLOQUEADO) { return }  ← rejeita
Line 81:     if (c.estado === ESTADO_IDLE) { executarEfeitoInterno(...); return }  ← só executa se IDLE
Line 94:     c.fila.push(...)                        ← senão: enfileira
```

---

## 2. Análise — Fluxo completo da trava

### O que acontece:

1. **Turno do jogador:** O jogador seleciona um personagem. `highlightedCells` fica não-vazio → `useEffect` (linha 195-207) dispara `highlight_movimento` na state machine (canal: canvas, tipo: persistente).

2. **State machine processa:** `executarEfeitoInterno` (linha 40) é chamada → `c.estado = ESTADO_EXECUTANDO` (linha 42). Como o efeito é `persistente` (não `pontual`), **nenhum setTimeout agenda finalizarEfeito** (a branch da linha 55 não executa). O canal canvas fica **EXECUTANDO para sempre**.

3. **Jogador move e confirma:** `setHighlightedCells([])` zera o React state → o `useEffect` dispara novamente, mas `highlightedCells.length > 0` é falso → **nenhum dispatchEffect é chamado para limpar o efeito da state machine**. O canal canvas permanece EXECUTANDO.

4. **highlight_limpar nunca usado:** O efeito `highlight_limpar` existe em effectsMap.js (linha 298, tipo: 'pontual', duracao: 1) mas **nunca é disparado em lugar nenhum**. É código morto.

5. **Turno da IA começa:** `onTurnoIA` (linha 107-112) dispara `anuncio_turno` (overlay) e `ia_thinking` (hud). Ambos executam normalmente porque são canais diferentes.

6. **IA movimenta:** `onTrail` tenta disparar `trail` (canvas, pontual). Como o canal canvas está EXECUTANDO, o efeito é **ENFILEIRADO** (linha 94).

7. **IA decide atacar:** `decidirAcaoComPersonalidade` (linha 580) → `estagioAgir` → `setRangeCells(...)` → o useEffect dispara `highlight_range` (canvas, persistente) → também **ENFILEIRADO**.

8. **IA atira projetil:** `animarAtaqueProjetil` (linha 613) → `onAnimarProjetil` (linha 154) → `dispatchEffect({ tipo: 'projetil' })` (linha 85) → **ENFILEIRADO** no canal canvas.

9. **Trava:** A fila do canal canvas contém: `trail`, `highlight_range`, `highlight_ataque` (ou similar), `projetil`. Nada na fila executa porque o canal nunca sai de EXECUTANDO — o efeito `highlight_movimento` original (persistente) nunca finalizou. O `projetil` nunca executa → `onFinalizar` nunca é chamado → o `callbackFinal` da IA nunca roda → a IA fica travada aguardando a animação do projetil.

### Causa raiz:

**Efeitos `persistente` (highlight_movimento, highlight_ataque, highlight_range) no canal canvas nunca são finalizados na state machine.** A única maneira de finalizar um efeito persistente é:
- Chamar `finalizarEfeito('canvas')` diretamente (impossível de fora — função interna)
- Disparar `highlight_limpar` (pontual, duracao:1) que nunca é usado
- O `useEffect` da linha 195-207 só **dispara** highlights quando `length > 0 && prev.length === 0`. Nunca **finaliza** o efeito anterior quando os cells vão a zero.

### Evidências adicionais:

O `clearHighlight()` em `EffectRenderer.js:4-6` zera `_refs.highlightRef.current` **diretamente**, sem passar pela state machine. Isso funciona para o desenho visual (que lê de `highlightRef.current` na linha 219), mas não libera o canal canvas da state machine.

O sync do `highlightRef.current` na linha 163 (`highlightRef.current = { move: highlightedCells, ... }`) já garante que os highlights visuais funcionem sem precisar da state machine.

---

## 3. Fluxo da IA com state machine (log do console)

Log fornecido pelo usuário:

```
[EFFECT][overlay] iniciando: anuncio_turno
[EFFECT][overlay] encerrado: anuncio_turno
[EFFECT][canvas] iniciando: highlight_movimento      ← PLAYER highlight trava canal
[PRIMITIVO] HighlightEffect {cor: '#00eeff', ...}
[EFFECT][canvas] enfileirado: trail caller: onTrail   ← trail vai pra fila
... (turno muda para IA)
[EFFECT][overlay] iniciando: anuncio_turno            ← overlay: normal
[EFFECT][hud] iniciando: ia_thinking                  ← hud: normal (executa direto)
[EFFECT][overlay] encerrado: anuncio_turno
[EFFECT][canvas] enfileirado: highlight_movimento     ← IA highlight vai pra fila
[EFFECT][canvas] enfileirado: highlight_ataque         ← vai pra fila
[EFFECT][canvas] enfileirado: trail caller: onTrail   ← trail vai pra fila
[EFFECT][overlay] iniciando: banner_ia                ← overlay: normal
[EFFECT][overlay] encerrado: banner_ia
[EFFECT][canvas] enfileirado: highlight_range          ← vai pra fila
[EFFECT][canvas] enfileirado: highlight_ataque         ← vai pra fila
[EFFECT][canvas] enfileirado: projetil caller: ...     ← PROJETIL vai pra fila
```

**Observe:** nenhum `[EFFECT][canvas] iniciando:` aparece após o primeiro `highlight_movimento`. Todos são `enfileirado`. Nenhum `[EFFECT][canvas] encerrado:` aparece. O projetil nunca inicia.

---

## 4. Hipótese de correção

**Opção A (mínima):** Remover os três `dispatchEffect({ tipo: 'highlight_*' })` do `useEffect` em `Phase6CombatV2.jsx:198-204`. Os highlights visuais continuam funcionando via `highlightRef.current` sync (linha 163). O canal canvas nunca fica bloqueado por efeitos persistentes.

**Opção B (mais robusta):** Disparar `highlight_limpar` quando as células forem a zero no `useEffect`. Mas `highlight_limpar` (pontual, duracao:1) seria enfileirado se o canal estiver EXECUTANDO — precisa finalizar o efeito anterior primeiro.

**Opção C (expor finalizarEfeito):** Retornar `finalizarEfeito` de `useEffectMachine` e chamar explicitamente antes de disparar novos highlights. Mais flexível mas acopla a API.

**Recomendação:** Opção A — remover dispatchEffect duplicado para highlights na state machine. É a mudança mais segura, localizada, e não afeta a lógica visual porque o sync do ref (linha 163) já cobre o desenho do canvas.

---

## 5. Versões

| Constante | Antes | Depois |
|-----------|-------|--------|
| SITE_VERSION | 10.160.10 | **10.160.11** |
| ARENATESTBED_VERSION | 6.9.7 | **6.9.8** |

## 6. Arquivos

- `src/pages/Prototype/ArenaTestbed/engine/useEffectMachine.js` (116 linhas)
- `src/pages/Prototype/ArenaTestbed/components/effects/effectsMap.js` (313 linhas)
- `src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx` (24273 bytes)
- `src/pages/Prototype/ArenaTestbed/engine/useCombatEngine.js` (688 linhas)

---

**Status:** CORRIGIDO — ver `docs/ReportAI/2026-06-23_FIX_IA-TRAVA-PROJETIL-CANAL-CANVAS_v6.9.9.md`
