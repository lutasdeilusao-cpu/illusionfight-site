# Investigação — banner iaThinking renderiza durante turno do jogador

> Versão: 6.3.8 / 10.158.13
> Data: 2026-06-22

---

## Etapa 1 — Grep

```
145:  const { characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual } = combat
152:  const currentChar = useMemo(() =>
153:    characters.find(c => c.id === currentCharId),
154:    [characters, currentCharId]
156:  const isPlayerTurn = currentChar?.time === 'jogador'
176:    console.log('[TC-16] iaThinking mudou', { iaThinking, isPlayerTurn: currentChar?.time === 'jogador', currentCharId: currentChar?.id })
177:  }, [iaThinking])
201:      highlightedCells, attackCells, rangeCells, currentChar,
207:  }, [characters, obstaculos, ..., currentChar, ...]
222:    if (!canvas || inputLockedRef.current || !isPlayerTurn || winner) return
235:    if (subPhase === 'free' && isPlayerTurn && !iaThinking) {
236:      const clickedOwnToken = currentChar?.posicao?.row === row && currentChar?.posicao?.col === col
244:          characters.filter(c => c.vivo && c.id !== currentChar.id)
248:          currentChar.posicao.row, currentChar.posicao.col,
261:  }, [isPlayerTurn, iaThinking, cols, rows, ...]
262:      currentChar, actionPanel, highlightedCells, attackCells,
380:  {actionPanel && isPlayerTurn && subPhase === 'free' && currentChar && !inputLocked && (
382:    <div className="atb-action-panel-name">{currentChar.nome}</div>
393:    {currentChar?.inventario?.pocaoHP > 0 && (
396:      ❤ ×{currentChar.inventario.pocaoHP}
399:    {currentChar?.inventario?.pocaoMP > 0 && (
402:      💧 ×{currentChar.inventario.pocaoMP}
410:    <span className={`atb-top-turn ${currentChar?.time === 'ia' ? 'enemy' : 'player'}`}>
411:      {currentChar
412:        ? `${t('...turn_of')} ${currentChar.nome}`
414:      {isPlayerTurn && subPhase && (
417:      {iaThinking && ` · ${t('...ia_thinking_short')}`}
435:    const isActive = ch.id === currentChar?.id
467:    {isPlayerTurn && !iaThinking && !inputLocked ? (
496:    <span className="atb-ia-dots">{t('...ia_thinking')}</span>
```

## Logs adicionados

| ID | Arquivo | Linha | Contexto |
|----|---------|-------|----------|
| TC-17 | V2 | 417 | BANNER iaThinking RENDERIZANDO (top bar) |
| TC-18 | V2 | 468 | RENDER botões (bottom nav) |
| TC-19 | V2 | 153 | currentChar recalculado (useMemo) |
| TC-20 | engine | 422 | setCurrentCharId chamado |

## Build

```
✓ built in 1.11s
```

## Instrução para teste

1. Abrir Treino V2
2. Abrir console (F12)
3. Mover jogador, atacar IA
4. Observar se `[TC-17] BANNER iaThinking RENDERIZANDO` aparece enquanto o jogador deveria estar jogando
5. Colar TODO o console aqui — procurar especialmente os logs TC-17, TC-18 e TC-19
