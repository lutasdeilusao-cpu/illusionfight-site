import { useState } from 'react'
import { useDueloStore } from '../store/useDueloStore'
import LPDisplay from './LPDisplay'
import { GRID_ROWS, GRID_COLS, manhattan } from '../engine/gameState'

export default function Board() {
  const store = useDueloStore()
  const grid = store.grid
  const sel = store.selectedMonster
  const moveCells = store.moveCells || []
  const attackCells = store.attackCells || []
  const isPlayerTurn = store.currentTurn === 'PLAYER'
  const [hoverCell, setHoverCell] = useState(null)

  // pendingPlacement — célula clicada aguardando confirmação
  const pending = store.pendingPlacement

  const isMoveCell = (r, c) => moveCells.some(m => m.row === r && m.col === c)
  const isAttackCell = (r, c) => attackCells.some(a => a.row === r && a.col === c)
  const isSelected = (r, c) => sel?.row === r && sel?.col === c

  // Calcula células das áreas de TODAS as armadilhas do player no grid (persistente)
  const isPersistentTrapArea = (r, c) => {
    for (let rr = 0; rr < GRID_ROWS; rr++) {
      for (let cc = 0; cc < GRID_COLS; cc++) {
        const t = grid[rr][cc]?.trap
        if (t && t.owner === 'PLAYER' && !t.revealed && t.area) {
          const dist = manhattan(rr, cc, r, c)
          if (dist > 0 && dist <= t.area) return true
        }
      }
    }
    return false
  }

  // Calcula células de efeitos de campo ativos (magias persistentes)
  const isFieldEffectCell = (r, c) => {
    const fe = store.fieldEffects || []
    return fe.some(f => f.row === r && f.col === c)
  }

  // Calcula células da área de armadilha com base no hover (placement)
  const isTrapAreaCell = (r, c) => {
    // Usa pendingPlacement como fallback quando modal está aberto
    const target = pending ? { row: pending.row, col: pending.col } : hoverCell
    if (!target || store.waitingForGridTarget !== 'trap') return false
    const trapCard = store.selectedHandCard
    if (!trapCard || !trapCard.area) return false
    const dist = manhattan(target.row, target.col, r, c)
    return dist > 0 && dist <= trapCard.area
  }

  // Highlight para célula alvo de magia no hover (mesmo estilo da armadilha)
  const isSpellHoverCell = (r, c) => {
    if (store.waitingForGridTarget !== 'spell') return false
    const target = pending ? { row: pending.row, col: pending.col } : hoverCell
    if (!target) return false
    return target.row === r && target.col === c
  }

  const isHoveredCell = (r, c) => {
    // Se tem pendingPlacement, destaca a célula pendente
    if (pending) return pending.row === r && pending.col === c
    return hoverCell && hoverCell.row === r && hoverCell.col === c
  }

  const getEffectiveAtk = (card) => {
    const buff = store.tempBuffs?.find(b => b.cardId === card.id_num)
    return (card.atk || 0) + (buff?.atkBonus || 0)
  }

  const getEffectiveDef = (card) => {
    const buff = store.tempBuffs?.find(b => b.cardId === card.id_num)
    return (card.def || 0) + (buff?.defBonus || 0)
  }

  // O clique é tratado pelo DueloRoute via função global
  const handleCellClick = (r, c) => {
    const s = useDueloStore.getState()
    if (s.gamePhase !== 'PLAYING' && s.gamePhase !== 'OVER') return

    // Se não é turno do player, não faz nada
    if (s.currentTurn !== 'PLAYER') return

    // Fase DESCER — colocar carta
    if (s.turnPhase === 'DESCER' && s.waitingForGridTarget) {
      s.placeCardOnGrid(r, c)
      return
    }

    // Fase MOVIMENTO
    if (s.turnPhase === 'MOVIMENTO') {
      const cell = grid[r][c]
      if (s.selectedMonster && isMoveCell(r, c)) {
        s.moveMonster(r, c)
        return
      }
      if (cell?.monster && cell.monster.owner === 'PLAYER') {
        s.selectMonster(r, c)
        return
      }
      s.clearSelection()
      return
    }

    // Fase ATAQUE
    if (s.turnPhase === 'ATAQUE') {
      const cell = grid[r][c]
      if (s.selectedMonster && isAttackCell(r, c) && cell?.monster && cell.monster.owner !== 'PLAYER') {
        s.attackMonster(r, c)
        return
      }
      if (cell?.monster && cell.monster.owner === 'PLAYER') {
        s.selectMonster(r, c)
        return
      }
      s.clearSelection()
      return
    }
  }

  const getCellClass = (r, c) => {
    const cell = grid[r][c]
    let classes = 'duelo-grid-cell'
    if (isSelected(r, c)) classes += ' duelo-grid-cell--selected'
    if (isMoveCell(r, c)) classes += ' duelo-grid-cell--move'
    if (isAttackCell(r, c)) classes += ' duelo-grid-cell--attack'
    if (isPersistentTrapArea(r, c)) classes += ' duelo-grid-cell--trap-area'
    if (isTrapAreaCell(r, c)) classes += ' duelo-grid-cell--trap-area'
    if (isHoveredCell(r, c) && store.waitingForGridTarget === 'trap') classes += ' duelo-grid-cell--trap-hover'
    if (isSpellHoverCell(r, c)) classes += ' duelo-grid-cell--trap-hover'
    if (isFieldEffectCell(r, c)) classes += ' duelo-grid-cell--field-effect'
    if (cell?.monster) {
      classes += cell.monster.owner === 'PLAYER' ? ' duelo-grid-cell--ally' : ' duelo-grid-cell--enemy'
    }
    // Sacrifice target highlight
    if (store.waitingForGridTarget === 'sacrifice' && cell?.monster?.owner === 'PLAYER') {
      const isTarget = store.sacrificeTargets?.some(t => t.row === r && t.col === c)
      classes += isTarget ? ' duelo-grid-cell--sacrifice-selected' : ' duelo-grid-cell--sacrifice-target'
    }
    return classes
  }

  return (
    <div className="duelo-board">
      {/* LP bars */}
      <div className="duelo-lp-row">
        <LPDisplay lp={store.aiLP} isPlayer={false} />
        <div className="duelo-deck-info">
          <span>🂠 {store.aiDeck.length}</span>
          <span className="duelo-deck-label">IA</span>
        </div>
        <div className="duelo-versus">⚔</div>
        <div className="duelo-deck-info">
          <span className="duelo-deck-label">VOCÊ</span>
          <span>🂠 {store.playerDeck.length}</span>
        </div>
        <LPDisplay lp={store.playerLP} isPlayer={true} />
      </div>

      {/* Grid */}
      <div className="duelo-grid-container">
        <div className="duelo-grid">
          {Array.from({ length: GRID_ROWS }, (_, r) => (
            <div key={r} className="duelo-grid-row">
              {Array.from({ length: GRID_COLS }, (_, c) => {
                const cell = grid[r][c]
                const monster = cell?.monster
                const trap = cell?.trap

                // Armadilha visível SOMENTE ao dono
                const isMyTrap = trap && trap.owner === 'PLAYER'
                const showTrap = isMyTrap && !monster

                return (
                  <div
                    key={c}
                    className={getCellClass(r, c)}
                    onClick={() => handleCellClick(r, c)}
                    onMouseEnter={() => setHoverCell({ row: r, col: c })}
                    onMouseLeave={() => setHoverCell(null)}
                  >
                    {monster && (
                      <div className={`duelo-grid-monster duelo-grid-monster--${monster.owner?.toLowerCase()}`}>
                        <span className="duelo-grid-monster-name">{monster.name}</span>
                        <div className="duelo-grid-monster-stats">
                          <span className="duelo-stat-atk">⚔{getEffectiveAtk(monster)}</span>
                          <span className="duelo-stat-def">🛡{getEffectiveDef(monster)}</span>
                          {monster.mov !== undefined && (
                            <span className="duelo-stat-mov">👟{monster.mov}</span>
                          )}
                          {monster.rng !== undefined && (
                            <span className="duelo-stat-rng">🎯{monster.rng}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {showTrap && (
                      <div className="duelo-grid-trap">
                        ⚡
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Dica de interação */}
      {isPlayerTurn && store.selectedMonster && (
        <div className="duelo-grid-hint">
          {store.moveCells.length > 0 && '👟 Clique em casa destacada para mover | '}
          {store.attackCells.length > 0 && '⚔ Clique em inimigo destacado para atacar | '}
          Clique em outro monstro aliado para selecionar
        </div>
      )}
    </div>
  )
}
