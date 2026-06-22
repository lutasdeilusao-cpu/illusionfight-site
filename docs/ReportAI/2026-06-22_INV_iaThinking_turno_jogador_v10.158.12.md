# Investigação — iaThinking durante turno do jogador

> Versão: 6.3.7 / 10.158.12
> Data: 2026-06-22

---

## Etapa 2 — Greps

### Grep 1 — engine

```
53:  const [iaThinking, setIaThinking] = useState(false)
64:  const iaThinkingRef = useRef(false)
414:  function configurarTurnoPara(charId) {
421:      if (onTurnoIA) onTurnoIA(proxChar)
422:      if (onLockInput) onLockInput()
423:      setAnimTimer(() => executarIA(proxChar), 1000)
425:      setIaThinking(false)
426:      iaThinkingRef.current = false
432:      if (onLockInput) onLockInput()
433:      if (onTurnoJogador) onTurnoJogador(proxChar)
437:  function avancarEAcionar() {
439:    if (nextId) configurarTurnoPara(nextId)
521:  function executarIA(iaChar) {
522:    setIaThinking(true); iaThinkingRef.current = true
639:    function finalizarTurnoIA() {
641:      iaThinkingRef.current = false; setIaThinking(false)
642:      if (onUnlockInput) onUnlockInput(0)
643:      avancarEAcionar()
645:      characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual, isPlayerTurn,
662:      setIaThinking, setPhase,
669:      usarItem, pularAcao, finalizarTurno, executarIA,
```

### Grep 2 — V2

```
32:  const { inputLocked, inputLockedRef, lockInput, unlockInput } = useInputLock()
117:    onTurnoJogador: (proxChar) => {
120:      unlockInput(1500)
123:    onTurnoIA: (proxChar) => {
129:    onLockInput: lockInput,
130:    onUnlockInput: unlockInput,
143:  const { characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual } = combat
216:    if (!canvas || inputLockedRef.current || !isPlayerTurn || winner) return
229:    if (subPhase === 'free' && isPlayerTurn && !iaThinking) {
255:  }, [isPlayerTurn, iaThinking, cols, rows, subPhase, subPhaseStep,
374:  {actionPanel && isPlayerTurn && subPhase === 'free' && currentChar && !inputLocked && (
411:  {iaThinking && ` · ${t('prototype.arena_testbed.ia_thinking_short')}`}
461:  {isPlayerTurn && !iaThinking && !inputLocked ? (
```

### Grep 3 — fujona.js

```
(no output — nenhuma referência a setIaThinking/iaThinking)
```

## Logs adicionados (TC-01 a TC-16)

| ID | Arquivo | Linha | Contexto |
|----|---------|-------|----------|
| TC-01 | engine | 415 | `configurarTurnoPara` primeira linha |
| TC-02 | engine | 523 | `setIaThinking → TRUE` em `executarIA` |
| TC-03 | engine | 426, 535, 576, 641 | `setIaThinking → FALSE` em configTurnoPara-jogador, estagioPensar-morto, estagioAgir-morto, finalizarTurnoIA |
| TC-04 | engine | 524 | `executarIA iniciado` |
| TC-05 | engine | 531 | `estagioPensar iniciado` |
| TC-06 | engine | 541 | `estagioMover iniciado` |
| TC-07 | engine | 569 | `estagioAgir iniciado` |
| TC-08 | engine | 642 | `finalizarTurnoIA iniciado` |
| TC-09 | engine | 273, 362, 425, 436 | `onLockInput chamado` (moverPersonagem, executarAtaque, configTurnoPara-ia, configTurnoPara-jogador) |
| TC-10 | engine | 229, 240, 317, 656 | `onUnlockInput chamado` (finalizarApos-morte, finalizarApos-vivo, aposMovimento, finalizarTurnoIA) |
| TC-11 | engine | 440 | `avancarEAcionar chamado` |
| TC-12 | V2 | 118 | `onTurnoJogador` com `inputLockedAntes` |
| TC-13 | V2 | 124 | `onTurnoIA` com `inputLockedAntes` |
| TC-14 | V2 | 131 | `onLockInput → lockInput()` |
| TC-15 | V2 | 132 | `onUnlockInput → unlockInput()` |
| TC-16 | V2 | 176 | `iaThinking mudou` via `useEffect` |

## Grep de confirmação

```
grep -rn "INV-\|ATK-EXTRA\|INV-HP" src/pages/Prototype/ArenaTestbed/
→ (no output) ✅
```

## Build

```
✓ built in 1.19s
```

## Instrução para teste

1. Abrir Treino V2
2. Abrir console do navegador (F12)
3. Mover jogador, atacar IA
4. Observar se `iaThinking` aparece como `true` durante turno do jogador
5. Colar TODO o console aqui — do início ao fim, incluindo todos os logs TC-01 a TC-16
