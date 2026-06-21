import { useState, useMemo } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { PODERES_BASE } from './data/poderes'
import Phase0Start from './components/Phase0Start'
import Phase1SheetBuilder from './components/Phase1SheetBuilder'
import Phase2Customize from './components/Phase2Customize'
import Phase3ModeSelect from './components/Phase3ModeSelect'
import Phase4BoardSetup from './components/Phase4BoardSetup'
import Phase5PowerSelect from './components/Phase5PowerSelect'
import Phase6Combat from './components/Phase6Combat'
import { salvarFicha } from './data/fichaStorage'
import './ArenaTestbed.css'

export default function ArenaTestbed() {
  const { t } = useLanguage()
  const [phase, setPhase] = useState(0)
  const [characters, setCharacters] = useState([])
  const [boardState, setBoardState] = useState(null)
  const [poderesEscolhidos, setPoderesEscolhidos] = useState({})

  function handleNewGame() {
    setPhase(1)
  }

  function handleLoadGame(ficha) {
    setCharacters(ficha.personagens || [])
    setPhase(2)
  }

  function handlePhase1Confirm(chars) {
    setCharacters(chars)
    setPhase(2)
  }

  function handlePhase2Confirm(chars) {
    setCharacters(chars)
    salvarFicha({ personagens: chars })
    setPhase(3)
  }

  function handleSelectTraining() {
    setPhase(4)
  }

  function handlePhase4Confirm(board) {
    setBoardState({ ...board })
    setPhase(5)
  }

  function handlePowerConfirm(poderes) {
    const poderesComIA = { ...poderes }
    characters.filter(ch => ch.time === 'ia').forEach(ch => {
      if (!poderesComIA[ch.id]) {
        const limite = Math.min(ch.res || 1, 4)
        const shuffled = [...PODERES_BASE].sort(() => Math.random() - 0.5)
        poderesComIA[ch.id] = shuffled.slice(0, Math.min(limite, Math.floor(Math.random() * 3) + 1)).map(p => p.id)
      }
    })
    setPoderesEscolhidos(poderesComIA)
    setPhase(6)
  }

  function handleBackToPhase0() {
    setPhase(0)
    setCharacters([])
    setBoardState(null)
    setPoderesEscolhidos({})
  }

  function handleBackToPhase1() {
    setPhase(1)
  }

  function handleBackToPhase2() {
    setPhase(2)
  }

  function handleBackToPhase3() {
    setPhase(3)
  }

  function handleBackToPhase4() {
    setPhase(4)
  }

  function handleBackToPhase5() {
    setPhase(5)
  }

  const stepLabels = useMemo(() => [
    t('prototype.arena_testbed.phase0_short'),
    t('prototype.arena_testbed.phase1_short'),
    t('prototype.arena_testbed.phase2_short'),
    t('prototype.arena_testbed.phase3_short'),
    t('prototype.arena_testbed.phase4_short'),
    t('prototype.arena_testbed.phase5_short'),
    t('prototype.arena_testbed.phase6_short'),
  ], [t])

  return (
    <div className="tab-arena-testbed">
      <div className="tab-step-indicator">
        {[0, 1, 2, 3, 4, 5, 6].map(step => (
          <div
            key={step}
            className={`tab-step-item ${phase === step ? 'active' : ''} ${phase > step ? 'done' : ''}`}
          >
            <div className="tab-step-circle">
              {phase > step ? '✓' : step + 1}
            </div>
            <span className="tab-step-label">{stepLabels[step]}</span>
          </div>
        ))}
      </div>

      <div className="tab-phase-content">
        {phase === 0 && (
          <Phase0Start
            onNewGame={handleNewGame}
            onLoadGame={handleLoadGame}
          />
        )}
        {phase === 1 && (
          <Phase1SheetBuilder
            onConfirm={handlePhase1Confirm}
          />
        )}
        {phase === 2 && (
          <Phase2Customize
            personagens={characters}
            onConfirm={handlePhase2Confirm}
            onBack={handleBackToPhase0}
          />
        )}
        {phase === 3 && (
          <Phase3ModeSelect
            onSelectTraining={handleSelectTraining}
            onBack={handleBackToPhase2}
          />
        )}
        {phase === 4 && (
          <Phase4BoardSetup
            characters={characters}
            onConfirm={handlePhase4Confirm}
            onBack={handleBackToPhase3}
          />
        )}
        {phase === 5 && (
          <Phase5PowerSelect
            characters={characters}
            onConfirm={handlePowerConfirm}
            onBack={handleBackToPhase4}
          />
        )}
        {phase === 6 && boardState && (
          <Phase6Combat
            boardState={boardState}
            poderesEscolhidos={poderesEscolhidos}
            onBackToPhase1={handleBackToPhase0}
            onBackToPhase5={handleBackToPhase5}
          />
        )}
      </div>
    </div>
  )
}
