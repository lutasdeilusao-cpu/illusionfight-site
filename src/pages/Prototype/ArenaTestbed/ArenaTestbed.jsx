import { useState, useMemo } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Phase1SheetBuilder from './components/Phase1SheetBuilder'
import Phase2BoardSetup from './components/Phase2BoardSetup'
import Phase3Combat from './components/Phase3Combat'
import './ArenaTestbed.css'

export default function ArenaTestbed() {
  const { t } = useLanguage()
  const [phase, setPhase] = useState(1) // 1 | 2 | 3
  const [characters, setCharacters] = useState([])
  const [boardState, setBoardState] = useState(null)

  function handlePhase1Confirm(chars) {
    setCharacters(chars)
    setPhase(2)
  }

  function handlePhase2Confirm(board) {
    setBoardState(board)
    setPhase(3)
  }

  function handleBackToPhase1() {
    setPhase(1)
    setCharacters([])
    setBoardState(null)
  }

  function handleBackToPhase2() {
    setPhase(2)
  }

  const stepLabels = useMemo(() => [
    t('prototype.arena_testbed.phase1_short'),
    t('prototype.arena_testbed.phase2_short'),
    t('prototype.arena_testbed.phase3_short'),
  ], [t])

  return (
    <div className="tab-arena-testbed">
      {/* Step indicator */}
      <div className="tab-step-indicator">
        {[1, 2, 3].map(step => (
          <div
            key={step}
            className={`tab-step-item ${phase === step ? 'active' : ''} ${phase > step ? 'done' : ''}`}
          >
            <div className="tab-step-circle">
              {phase > step ? '✓' : step}
            </div>
            <span className="tab-step-label">{stepLabels[step - 1]}</span>
          </div>
        ))}
      </div>

      {/* Phase content */}
      <div className="tab-phase-content">
        {phase === 1 && (
          <Phase1SheetBuilder onConfirm={handlePhase1Confirm} />
        )}
        {phase === 2 && (
          <Phase2BoardSetup
            characters={characters}
            onConfirm={handlePhase2Confirm}
            onBack={handleBackToPhase1}
          />
        )}
        {phase === 3 && boardState && (
          <Phase3Combat
            boardState={boardState}
            onBackToPhase1={handleBackToPhase1}
          />
        )}
      </div>
    </div>
  )
}
