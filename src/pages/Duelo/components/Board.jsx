import { useDueloStore } from '../store/useDueloStore'
import LPDisplay from './LPDisplay'
import { GRID_ROWS, GRID_COLS } from '../engine/gameState'

export default function Board() {
  const store = useDueloStore()
  const grid = store.grid
  const sel = store.selectedMonster
  const moveCells = store.moveCells || []
  const attackCells = store.attackCells || []
  const isPlayerTurn = store.currentTurn === 'PLAYER'

  const isMoveCell = (r, c) => moveCells.some(m => m.row === r && m.col === c)
  const isAttackCell = (r, c) => attackCells.some(a => a.row === r && a.col === c)
  const isSelected = (r, c) => sel?.row === r && sel?.col === c

  const handleCellClick = (r, c) => {
    const cell = grid[r][c]
    const s = useDueloStore.getState()

    if (s.gamePhase === 'OVER' || s.gamePhase === 'PREPARATION') return

    // Se tem monstro selecionado e clicou em casa de MOV
    if (s.selectedMonster && isMoveCell(r, c)) {
      s.moveMonster(r, c)
      return
    }

    // Se tem monstro selecionado e clicou em inimigo no RNG
    if (s.selectedMonster && isAttackCell(r, c) && cell?.monster && cell.monster.owner !== s.grid[s.selectedMonster.row][s.selectedMonster.col]?.monster?.owner) {
      s.attackMonster(r, c)
      return
    }

    // Clicou no próprio monstro — seleciona
    if (cell?.monster && cell.monster.owner === 'PLAYER') {
      s.selectMonster(r, c)
      return
    }

    // Clicou em casa vazia — limpa seleção
    s.clearSelection()
  }

  const getCellClass = (r, c) => {
    const cell = grid[r][c]
    let classes = 'duelo-grid-cell'
    if (isSelected(r, c)) classes += ' duelo-grid-cell--selected'
    if (isMoveCell(r, c)) classes += ' duelo-grid-cell--move'
    if (isAttackCell(r, c)) classes += ' duelo-grid-cell--attack'
    if (cell?.monster) {
      classes += cell.monster.owner === 'PLAYER' ? ' duelo-grid-cell--ally' : ' duelo-grid-cell--enemy'
    }
    if (r <= 1) classes += ' duelo-grid-cell--ai-territory'
    else if (r >= 3) classes += ' duelo-grid-cell--player-territory'
    else classes += ' duelo-grid-cell--neutral'
    return classes
  }

  const getEffectiveAtk = (card) => {
    const buff = store.tempBuffs?.find(b => b.cardId === card.id_num)
    return (card.atk || 0) + (buff?.atkBonus || 0)
  }

  const getEffectiveDef = (card) => {
    const buff = store.tempBuffs?.find(b => b.cardId === card.id_num)
    return (card.def || 0) + (buff?.defBonus || 0)
  }

  return (
    <div className="duelo-board">
      {/* LP bar */}
      <div className="duelo-lp-row">
        <LPDisplay lp={store.aiLP} isPlayer={false} />
        <div className="duelo-deck-info">
          <span>🂠 {store.aiDeck.length}</span>
          <span className="duelo-deck-label">IA</span>
        </div>
        <div className="duelo-versus">VS</div>
        <div className="duelo-deck-info">
          <span className="duelo-deck-label">VOCÊ</span>
          <span>🂠 {store.playerDeck.length}</span>
        </div>
        <LPDisplay lp={store.playerLP} isPlayer={true} />
      </div>

      {/* Grid 5×5 */}
      <div className="duelo-grid-container">
        <div className="duelo-grid">
          {Array.from({ length: GRID_ROWS }, (_, r) => (
            <div key={r} className="duelo-grid-row">
              {Array.from({ length: GRID_COLS }, (_, c) => {
                const cell = grid[r][c]
                const monster = cell?.monster
                const trap = cell?.trap
                const showTrap = trap && (
                  (trap.revealed) ||
                  (monster?.owner === 'PLAYER' && r >= 3) ||
                  (!monster && r >= 3 && trap)
                )

                return (
                  <div
                    key={c}
                    className={getCellClass(r, c)}
                    onClick={() => handleCellClick(r, c)}
                  >
                    {monster && (
                      <div className={`duelo-grid-monster duelo-grid-monster--${monster.owner?.toLowerCase()}`}>
                        <span className="duelo-grid-monster-name">{monster.name}</span>
                        <div className="duelo-grid-monster-stats">
                          <span className="duelo-stat-atk">⚔ {getEffectiveAtk(monster)}</span>
                          <span className="duelo-stat-def">🛡 {getEffectiveDef(monster)}</span>
                          {monster.mov !== undefined && (
                            <span className="duelo-stat-mov">👟{monster.mov}</span>
                          )}
                          {monster.rng !== undefined && (
                            <span className="duelo-stat-rng">🎯{monster.rng}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {showTrap && !monster && (
                      <div className="duelo-grid-trap">
                        {trap.revealed ? '🕳️' : '⚡'}
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
          {store.moveCells.length > 0 && 'Clique em casa azul para mover | '}
          {store.attackCells.some(c => grid[c.row][c.col]?.monster?.owner === 'AI') && 'Clique em casa vermelha para atacar | '}
          Clique em outra casa ou no mesmo monstro para deselecionar
        </div>
      )}
    </div>
  )
}
