import { useState } from 'react'
import { useLanguage } from '../../../../../../context/LanguageContext'
import { audio } from '../../engine/audioManager'
import './JokenpoModal.css'

const OPTIONS = ['pedra', 'papel', 'tesoura']

function getResult(p1, p2) {
  if (p1 === p2) return 'empate'
  if (
    (p1 === 'pedra' && p2 === 'tesoura') ||
    (p1 === 'papel' && p2 === 'pedra') ||
    (p1 === 'tesoura' && p2 === 'papel')
  ) return 'p1'
  return 'p2'
}

export default function JokenpoModal({ player1Name, player2Name, onResult, onClose }) {
  const { t } = useLanguage()
  const [choice, setChoice] = useState(null)
  const [result, setResult] = useState(null)
  const [iaChoice, setIaChoice] = useState(null)

  function handleChoose(opt) {
    const ia = OPTIONS[Math.floor(Math.random() * OPTIONS.length)]
    setChoice(opt)
    setIaChoice(ia)
    const res = getResult(opt, ia)
    setResult(res)
    audio.jokenpoChoice()
    setTimeout(() => {
      audio.jokenpoResult()
      onResult(res === 'p1' ? player1Name : res === 'p2' ? player2Name : null)
    }, 1500)
  }

  return (
    <div className="tab-jokenpo-overlay">
      <div className="tab-jokenpo-modal">
        <h3>{t('prototype.arena_testbed.jokenpo_title')}</h3>
        <p className="tab-jokenpo-subtitle">
          {t('prototype.arena_testbed.jokenpo_desc', { p1: player1Name, p2: player2Name })}
        </p>

        {!choice && (
          <div className="tab-jokenpo-options">
            {OPTIONS.map(opt => (
              <button
                key={opt}
                className="tab-jokenpo-btn"
                onClick={() => handleChoose(opt)}
              >
                <span className="tab-jokenpo-icon">
                  {opt === 'pedra' ? 'âœŠ' : opt === 'papel' ? 'âœ‹' : 'âœŒï¸'}
                </span>
                <span>{t(`prototype.arena_testbed.jokenpo_${opt}`)}</span>
              </button>
            ))}
          </div>
        )}

        {choice && iaChoice && (
          <div className="tab-jokenpo-result">
            <div className="tab-jokenpo-battle">
              <div className="tab-jokenpo-player">
                <span className="tab-jokenpo-icon">
                  {choice === 'pedra' ? 'âœŠ' : choice === 'papel' ? 'âœ‹' : 'âœŒï¸'}
                </span>
                <span className="tab-jokenpo-name">{player1Name}</span>
              </div>
              <span className="tab-jokenpo-vs">VS</span>
              <div className="tab-jokenpo-player">
                <span className="tab-jokenpo-icon">
                  {iaChoice === 'pedra' ? 'âœŠ' : iaChoice === 'papel' ? 'âœ‹' : 'âœŒï¸'}
                </span>
                <span className="tab-jokenpo-name">{player2Name}</span>
              </div>
            </div>
            <p className="tab-jokenpo-veredito">
              {result === 'empate'
                ? t('prototype.arena_testbed.jokenpo_tie')
                : t('prototype.arena_testbed.jokenpo_winner', {
                    winner: result === 'p1' ? player1Name : player2Name,
                  })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
