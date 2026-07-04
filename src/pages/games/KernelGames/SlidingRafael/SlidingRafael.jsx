import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReader } from '../../../../context/ReaderContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import PuzzleSlidingRafael from './PuzzleSlidingRafael'
import '../KernelGame.css'

export default function SlidingRafael() {
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const { t } = useLanguage()

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const [result, setResult] = useState(null)
  const [plays, setPlays] = useState(0)

  const handleSolve = () => { setResult('win'); setPlays(p => p + 1) }
  const handleFail = () => { setResult('lose'); setPlays(p => p + 1) }

  const retry = () => { setResult(null) }

  if (result === 'win') {
    return (
      <div className="kg-page">
        <div className="kg-scanlines" />
        <div className="kg-result">
          <div className="kg-result-emoji">🏆</div>
          <h2 className="kg-result-title kg-result-win">{t('games.minigames.resultado_vitoria')}</h2>
          <p className="kg-result-sub">Sliding Puzzle</p>
          <div className="kg-result-btns">
            <button className="kg-btn kg-btn-win" onClick={retry}>{t('games.minigames.resultado_jogar_novamente')}</button>
            <button className="kg-btn kg-btn-back" onClick={() => navigate('/games')}>{t('games.minigames.voltar')}</button>
          </div>
        </div>
      </div>
    )
  }

  if (result === 'lose') {
    return (
      <div className="kg-page">
        <div className="kg-scanlines" />
        <div className="kg-result">
          <div className="kg-result-emoji">💀</div>
          <h2 className="kg-result-title kg-result-lose">{t('games.minigames.resultado_derrota')}</h2>
          <p className="kg-result-sub">Sliding Puzzle</p>
          <div className="kg-result-btns">
            <button className="kg-btn kg-btn-lose" onClick={retry}>{t('games.minigames.resultado_tentar_novamente')}</button>
            <button className="kg-btn kg-btn-back" onClick={() => navigate('/games')}>{t('games.minigames.voltar')}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kg-page">
      <div className="kg-scanlines" />
      <PuzzleSlidingRafael key={plays} onSolve={handleSolve} onFail={handleFail} onBack={() => navigate('/games')} />
    </div>
  )
}
