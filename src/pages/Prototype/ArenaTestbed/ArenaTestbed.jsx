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

export const FaseArena = Object.freeze({
  INICIO: 0,
  FICHA: 1,
  PERSONALIZACAO: 2,
  MODO: 3,
  TABULEIRO: 4,
  PODERES: 5,
  COMBATE: 6,
})

const ORDEM_FASES = Object.values(FaseArena)

export default function ArenaTestbed() {
  const { t } = useLanguage()
  const [phase, setPhase] = useState(FaseArena.INICIO)
  const [characters, setCharacters] = useState([])
  const [boardState, setBoardState] = useState(null)
  const [poderesEscolhidos, setPoderesEscolhidos] = useState({})
  const [fichaId, setFichaId] = useState(null)

  function handleNewGame() {
    setFichaId(null)
    setPhase(FaseArena.FICHA)
  }

  function handleLoadGame(ficha) {
    setFichaId(ficha.id || null)
    setCharacters(ficha.personagens || [])
    setPhase(FaseArena.PERSONALIZACAO)
  }

  function handlePhase1Confirm(chars) {
    setCharacters(chars)
    setPhase(FaseArena.PERSONALIZACAO)
  }

  function handlePhase2Confirm(chars) {
    setCharacters(chars)
    salvarFicha({ id: fichaId, personagens: chars })
    setFichaId(null)
    setPhase(FaseArena.MODO)
  }

  function handleSelectTraining() {
    setPhase(FaseArena.TABULEIRO)
  }

  function handlePhase4Confirm(board) {
    setBoardState({ ...board })
    setPhase(FaseArena.PODERES)
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
    setPhase(FaseArena.COMBATE)
  }

  function handleBackToInicio() {
    setPhase(FaseArena.INICIO)
    setCharacters([])
    setBoardState(null)
    setPoderesEscolhidos({})
    setFichaId(null)
  }

  function handleBackToFicha() {
    setPhase(FaseArena.FICHA)
  }

  function handleBackToPersonalizacao() {
    setPhase(FaseArena.PERSONALIZACAO)
  }

  function handleBackToModo() {
    setPhase(FaseArena.MODO)
  }

  function handleBackToTabuleiro() {
    setPhase(FaseArena.TABULEIRO)
  }

  function handleBackToPoderes() {
    setPhase(FaseArena.PODERES)
  }

  const FASES_CONFIG = {
    [FaseArena.INICIO]: {
      Componente: Phase0Start,
      props: () => ({ onNewGame: handleNewGame, onLoadGame: handleLoadGame }),
    },
    [FaseArena.FICHA]: {
      Componente: Phase1SheetBuilder,
      props: () => ({ onConfirm: handlePhase1Confirm }),
    },
    [FaseArena.PERSONALIZACAO]: {
      Componente: Phase2Customize,
      props: () => ({ personagens: characters, onConfirm: handlePhase2Confirm, onBack: handleBackToInicio }),
    },
    [FaseArena.MODO]: {
      Componente: Phase3ModeSelect,
      props: () => ({ onSelectTraining: handleSelectTraining, onBack: handleBackToPersonalizacao }),
    },
    [FaseArena.TABULEIRO]: {
      Componente: Phase4BoardSetup,
      props: () => ({ characters, onConfirm: handlePhase4Confirm, onBack: handleBackToModo }),
    },
    [FaseArena.PODERES]: {
      Componente: Phase5PowerSelect,
      props: () => ({ characters, onConfirm: handlePowerConfirm, onBack: handleBackToTabuleiro }),
    },
    [FaseArena.COMBATE]: {
      Componente: Phase6Combat,
      props: () => ({ boardState, poderesEscolhidos, onBackToPhase1: handleBackToInicio, onBackToPhase5: handleBackToPoderes }),
      condicaoExtra: () => !!boardState,
    },
  }

  const config = FASES_CONFIG[phase]
  const podeRenderizar = config && (!config.condicaoExtra || config.condicaoExtra())

  return (
    <div className="tab-arena-testbed">
      <div className="tab-step-indicator">
        {ORDEM_FASES.map(step => (
          <div
            key={step}
            className={`tab-step-item ${phase === step ? 'active' : ''} ${phase > step ? 'done' : ''}`}
          >
            <div className="tab-step-circle">
              {phase > step ? '✓' : step + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="tab-phase-content">
        {podeRenderizar && (
          <config.Componente {...config.props()} />
        )}
      </div>
    </div>
  )
}
