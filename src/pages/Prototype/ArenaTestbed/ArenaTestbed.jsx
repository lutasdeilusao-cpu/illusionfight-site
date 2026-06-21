import { useState, useMemo } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { PODERES_BASE } from './data/poderes'
import Phase0Start from './components/Phase0Start'
import Phase1SheetBuilder from './components/Phase1SheetBuilder'
import Phase2Customize from './components/Phase2Customize'
import Phase3BoardSetup from './components/Phase3BoardSetup'
import Phase4PowerSelect from './components/Phase4PowerSelect'
import Phase5Combat from './components/Phase5Combat'
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

  function handlePhase3Confirm(board) {
    setBoardState({ ...board })
    setPhase(4)
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
    setPhase(5)
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

  const stepLabels = useMemo(() => [
    t('prototype.arena_testbed.phase0_short'),
    t('prototype.arena_testbed.phase1_short'),
    t('prototype.arena_testbed.phase2_short'),
    t('prototype.arena_testbed.phase3_short'),
    t('prototype.arena_testbed.phase4_short'),
    t('prototype.arena_testbed.phase5_short'),
  ], [t])

  return (
    <div className="tab-arena-testbed">
      <div className="tab-step-indicator">
        {[0, 1, 2, 3, 4, 5].map(step => (
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
          <Phase3BoardSetup
            characters={characters}
            onConfirm={handlePhase3Confirm}
            onBack={handleBackToPhase2}
          />
        )}
        {phase === 4 && (
          <Phase4PowerSelect
            characters={characters}
            onConfirm={handlePowerConfirm}
            onBack={handleBackToPhase3}
          />
        )}
        {phase === 5 && boardState && (
          <Phase5Combat
            boardState={boardState}
            poderesEscolhidos={poderesEscolhidos}
            onBackToPhase1={handleBackToPhase0}
            onBackToPhase4={handleBackToPhase4}
          />
        )}
      </div>
    </div>
  )
}
