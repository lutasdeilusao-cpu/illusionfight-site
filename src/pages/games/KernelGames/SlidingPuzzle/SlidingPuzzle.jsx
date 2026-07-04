import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReader } from '../../../../context/ReaderContext'
import PuzzleSlidingTiles from '../../../../components/Puzzles/PuzzleSlidingTiles'
import BackToGamesBtn from '../../../../components/BackToGamesBtn/BackToGamesBtn'
import './SlidingPuzzle.css'

const CFG = {
  easy:   { size: 3, label: 'FÁCIL',   col: '#00e5ff', timer: 180  },
  normal: { size: 4, label: 'NORMAL',  col: '#b400ff', timer: 600  },
  hard:   { size: 5, label: 'DIFÍCIL', col: '#ff0055', timer: 1200 },
}

export default function SlidingPuzzle() {
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const [screen, setScreen] = useState('menu')
  const [diff, setDiff] = useState(null)
  const [result, setResult] = useState(null)

  const handleSolve = () => {
    const cfg = CFG[diff]
    setResult({ win: true, diff: cfg.label, col: cfg.col })
    setScreen('result')
  }

  const handleFail = () => {
    const cfg = CFG[diff]
    setResult({ win: false, diff: cfg.label, col: cfg.col })
    setScreen('result')
  }

  if (screen === 'result') {
    return (
      <div className="sliding-page">
        <div className="sliding-scanlines" />
        <div className="sliding-result">
          <div className="sliding-res-tag">Minigame · MG-01</div>
          <div className={`sliding-res-title ${result.win ? 'sliding-res-title--ok' : 'sliding-res-title--bad'}`}>
            {result.win ? 'SISTEMA\nRESTAURADO' : 'SISTEMA\nCORROMPIDO'}
          </div>
          <div className="sliding-res-msg" style={{ color: result.col }}>
            {result.win ? 'Sequência restaurada. Fluxo de dados estabilizado.' : 'Tempo esgotado. Fragmentação permanente detectada.'}
          </div>
          <div className="sliding-res-btns">
            <button className="sliding-res-btn sliding-res-btn--p" onClick={() => { setScreen('game'); setDiff(diff) }}>
              ◎ Tentar Novamente
            </button>
            <button className="sliding-res-btn sliding-res-btn--s" onClick={() => setScreen('menu')}>
              ← Selecionar Dificuldade
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'game') {
    const cfg = CFG[diff]
    return (
      <div className="sliding-page">
        <div className="sliding-scanlines" />
        <div className="sliding-game">
          <PuzzleSlidingTiles
            onSolve={handleSolve}
            onFail={handleFail}
            config={{
              size: cfg.size,
              timerSeconds: cfg.timer,
              difficultyLabel: cfg.label,
              difficultyColor: cfg.col,
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="sliding-page">
      <div className="sliding-scanlines" />
      <div className="sliding-menu">
        <div className="sliding-sel-tag">Minigame · MG-01</div>
        <div className="sliding-sel-title">SLIDING<br />PUZZLE</div>
        <div className="sliding-sel-sub">Reorganize o fluxo de dados fragmentado</div>
        <div className="sliding-btns">
          {Object.entries(CFG).map(([key, c]) => (
            <button
              key={key}
              className="sliding-diff-btn"
              style={{ '--btn-cor': c.col }}
              onClick={() => { setDiff(key); setScreen('game') }}
            >
              <span className="sliding-diff-btn-nome">◎ {c.label}</span>
              <span className="sliding-diff-btn-info">
                Grade {c.size}×{c.size} · {c.size * c.size - 1} peças · {Math.floor(c.timer / 60)} minutos
              </span>
            </button>
          ))}
        </div>
        <div className="sliding-back">
          <BackToGamesBtn onClick={() => navigate('/games?aba=kernel')} label="← Voltar aos Jogos" />
        </div>
      </div>
    </div>
  )
}
