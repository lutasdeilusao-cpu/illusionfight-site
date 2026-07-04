import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReader } from '../../../../context/ReaderContext'
import PuzzleCodigoPerdido from '../../../../components/Puzzles/PuzzleCodigoPerdido'
import BackToGamesBtn from '../../../../components/BackToGamesBtn/BackToGamesBtn'
import './CodigoPerdido.css'

const CFG = ['easy', 'normal', 'hard']

const TAGLINE = {
  easy:   'Palavras de 3–6 caracteres · Conceitos básicos',
  normal: 'Palavras de 7–10 caracteres · Termos técnicos',
  hard:   'Palavras de 11+ caracteres · Jargão avançado',
}

export default function CodigoPerdido() {
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const [screen, setScreen] = useState('menu')
  const [diff, setDiff] = useState(null)
  const [result, setResult] = useState(null)

  const handleSolve = () => {
    setResult({ win: true })
    setScreen('result')
  }

  const handleFail = () => {
    setResult({ win: false })
    setScreen('result')
  }

  if (screen === 'result') {
    return (
      <div className="codigo-page">
        <div className="codigo-scanlines" />
        <div className="codigo-result">
          <div className="codigo-res-tag">Minigame · MG-03</div>
          <div className={`codigo-res-title ${result.win ? 'codigo-res-title--ok' : 'codigo-res-title--bad'}`}>
            {result.win ? 'CÓDIGO\nDECIFRADO' : 'CÓDIGO\nPERDIDO'}
          </div>
          <div className="codigo-res-msg">
            {result.win ? 'Pacote de dados recuperado com sucesso.' : 'Número máximo de tentativas excedido. Pacote corrompido.'}
          </div>
          <div className="codigo-res-btns">
            <button className="codigo-res-btn codigo-res-btn--p" onClick={() => { setScreen('game'); setDiff(diff) }}>
              ◎ Decifrar Novamente
            </button>
            <button className="codigo-res-btn codigo-res-btn--s" onClick={() => setScreen('menu')}>
              ← Selecionar Dificuldade
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'game') {
    return (
      <div className="codigo-page">
        <div className="codigo-scanlines" />
        <div className="codigo-game">
          <PuzzleCodigoPerdido
            onSolve={handleSolve}
            onFail={handleFail}
            config={{ difficulty: diff }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="codigo-page">
      <div className="codigo-scanlines" />
      <div className="codigo-menu">
        <div className="codigo-sel-tag">Minigame · MG-03</div>
        <div className="codigo-sel-title">CÓDIGO<br />PERDIDO</div>
        <div className="codigo-sel-sub">Decifre o código antes que o firewall o apague</div>
        <div className="codigo-btns">
          {CFG.map(d => (
            <button
              key={d}
              className="codigo-diff-btn"
              onClick={() => { setDiff(d); setScreen('game') }}
            >
              <span className="codigo-diff-btn-nome">◎ {d.toUpperCase()}</span>
              <span className="codigo-diff-btn-info">{TAGLINE[d]}</span>
            </button>
          ))}
        </div>
        <div className="codigo-back">
          <BackToGamesBtn onClick={() => navigate('/games?aba=kernel')} label="← Voltar aos Jogos" />
        </div>
      </div>
    </div>
  )
}
