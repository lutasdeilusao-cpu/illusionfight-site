import { useState, useMemo } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { PODERES_BASE } from './data/poderes'
import Phase1SheetBuilder from './components/Phase1SheetBuilder'
import Phase2BoardSetup from './components/Phase2BoardSetup'
import Phase3PowerSelect from './components/Phase3PowerSelect'
import Phase4Combat from './components/Phase4Combat'
import './ArenaTestbed.css'

export default function ArenaTestbed() {
  const { t } = useLanguage()
  const [phase, setPhase] = useState(1) // 1 | 2 | 3 | 4
  const [characters, setCharacters] = useState([])
  const [boardState, setBoardState] = useState(null)
  const [poderesEscolhidos, setPoderesEscolhidos] = useState({})

  function handlePhase1Confirm(chars) {
    setCharacters(chars)
    setPhase(2)
  }

  function handlePhase2Confirm(board) {
    setBoardState({ ...board })
    setPhase(3)
  }

  function handlePowerConfirm(poderes) {
    // Auto-assign random powers for IA characters
    const poderesComIA = { ...poderes }
    characters.filter(ch => ch.time === 'ia').forEach(ch => {
      if (!poderesComIA[ch.id]) {
        const limite = Math.min(ch.res || 1, 4)
        const shuffled = [...PODERES_BASE].sort(() => Math.random() - 0.5)
        poderesComIA[ch.id] = shuffled.slice(0, Math.min(limite, Math.floor(Math.random() * 3) + 1)).map(p => p.id)
      }
    })
    setPoderesEscolhidos(poderesComIA)
    setPhase(4)
  }

  function handleBackToPhase1() {
    setPhase(1)
    setCharacters([])
    setBoardState(null)
    setPoderesEscolhidos({})
  }

  function handleBackToPhase2() {
    setPhase(2)
  }

  function handleBackToPhase3() {
    setPhase(3)
  }

  const stepLabels = useMemo(() => [
    t('prototype.arena_testbed.phase1_short'),
    t('prototype.arena_testbed.phase2_short'),
    t('prototype.arena_testbed.power_short'),
    t('prototype.arena_testbed.phase4_short'),
  ], [t])

  return (
    <div className="tab-arena-testbed">
      <div className="tab-step-indicator">
        {[1, 2, 3, 4].map(step => (
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

      <div className="tab-phase-content">
        {phase === 1 && (
          <Phase1SheetBuilder
            onConfirm={handlePhase1Confirm}
          />
        )}
        {phase === 2 && (
          <Phase2BoardSetup
            characters={characters}
            onConfirm={handlePhase2Confirm}
            onBack={handleBackToPhase1}
          />
        )}
        {phase === 3 && (
          <Phase3PowerSelect
            characters={characters}
            onConfirm={handlePowerConfirm}
            onBack={handleBackToPhase2}
          />
        )}
        {phase === 4 && boardState && (
          <Phase4Combat
            boardState={boardState}
            poderesEscolhidos={poderesEscolhidos}
            onBackToPhase1={handleBackToPhase1}
            onBackToPhase3={handleBackToPhase3}
          />
        )}
      </div>
    </div>
  )
}