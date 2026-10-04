import { useState } from 'react'
import { motion } from 'framer-motion'
import PuzzleSlidingTiles from './PuzzleSlidingTiles'
import PuzzleStealthGrid from './PuzzleStealthGrid'
import PuzzleDecoder from './PuzzleDecoder'
import PuzzleSimonSays from './PuzzleSimonSays'
import PuzzleWireCut from './PuzzleWireCut'
import './puzzles.css'

// Os tipos que as cenas pedem (puzzleType) → o minijogo que roda.
const PUZZLES = {
  terminal: PuzzleSlidingTiles, sliding: PuzzleSlidingTiles,
  stealth: PuzzleStealthGrid, decoder: PuzzleDecoder,
  simon: PuzzleSimonSays, wire: PuzzleWireCut,
}

// Roda o minijogo e devolve onComplete(resolvido, pista).
export default function PuzzleRouter({ t, type, difficulty = 3, onComplete }) {
  const [status, setStatus] = useState('jogando')
  const tipo = PUZZLES[type] ? type : 'simon'
  const Puzzle = PUZZLES[tipo]
  const chave = `games.ldi.puzzle.tipos.${tipo === 'terminal' ? 'sliding' : tipo}`

  if (status !== 'jogando') {
    const ok = status === 'ok'
    return (
      <motion.div className="ldi-puzzle-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`ldi-puzzle-result-icon ${ok ? 'ldi-puzzle-result--ok' : 'ldi-puzzle-result--fail'}`}>{ok ? '✅' : '⚠️'}</div>
        <div className="ldi-puzzle-result-title">{t(ok ? 'games.ldi.puzzle.ok' : 'games.ldi.puzzle.falha')}</div>
        <button type="button" className="if-btn if-btn--ghost" onClick={() => onComplete(ok, ok ? t(`${chave}.pista`) : null)}>
          {t('games.ldi.puzzle.continuar')}
        </button>
      </motion.div>
    )
  }

  return (
    <div className="ldi-puzzle-room">
      <div className="ldi-puzzle-header">
        <h3 className="ldi-puzzle-title">{t(`${chave}.titulo`)}</h3>
        <p className="ldi-puzzle-desc">{t(`${chave}.desc`)}</p>
        <p className="ldi-puzzle-difficulty">{t('games.ldi.puzzle.dificuldade')}: {'⬛'.repeat(difficulty)}{'⬜'.repeat(5 - difficulty)}</p>
      </div>
      <Puzzle size={difficulty === 5 ? 4 : 3} furtividade={0}
        onSolve={() => setStatus('ok')} onFail={() => setStatus('falha')} onSkip={() => setStatus('falha')} />
      <button type="button" className="ldi-puzzle-skip" onClick={() => setStatus('falha')}>{t('games.ldi.puzzle.pular')}</button>
    </div>
  )
}
