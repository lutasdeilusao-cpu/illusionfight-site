import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from './store/useGameStore'
import { useCombatStore } from './store/useCombatStore'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import SceneView from './components/SceneView'
import ManualDrawer from './components/ManualDrawer'
import './LDI.css'

const ATTR_NAMES = {
  F: 'Potência',
  H: 'Agilidade',
  R: 'Resistência',
  A: 'Proteção',
  PdF: 'Poder Elemental',
}

export default function Game() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const { sheet, save, currentScene, choices, sceneNav, setScene, makeChoice, updateSave, saveToCloud, updateSheet, clearLevelUp } = useGameStore()
  const combat = useCombatStore()
  const [levelUpAttr, setLevelUpAttr] = useState(null)
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  useEffect(() => {
    if (!sheet?.sheet_name) {
      navigate('/extras/ldi/create')
      return
    }
    if (!currentScene && save.status === 'active') {
      setScene(save.current_scene_id || '1.1')
    }
  }, [sheet, currentScene, save, navigate, setScene])

  useEffect(() => {
    if (combat.active) {
      navigate('/extras/ldi/combat')
    }
  }, [combat.active, navigate])

  useEffect(() => {
    console.log('[GAME] useEffect save.status:', save?.status)
    if (save.status === 'ended_victory' || save.status === 'ended_defeat' || save.status === 'ended_fork') {
      if (user) saveToCloud(user.id)
      navigate('/extras/ldi/end')
    }
  }, [save.status, navigate, user, saveToCloud])

  const handleChoice = useCallback((choice) => {
    makeChoice(choice).catch(e => console.error('[LDI] choice error:', e))
    if (user) saveToCloud(user.id).catch(e => console.error('[LDI] save falhou:', e))
  }, [makeChoice, user, saveToCloud])

  const handleLevelUpAttr = (attr) => {
    setLevelUpAttr(attr)
  }

  const handleConfirmLevelUp = () => {
    if (!levelUpAttr) return
    const attrs = { ...sheet.attributes }
    attrs[levelUpAttr] = Math.min(4, (attrs[levelUpAttr] || 0) + 1)
    updateSheet({ attributes: attrs })
    clearLevelUp()
    setLevelUpAttr(null)
  }

  if (save?.level_up_available) {
    return (
      <div className="ldi-game">
        <div className="ldi-levelup-overlay">
          <motion.div
            className="ldi-levelup-box"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="ldi-levelup-title">LEVEL UP</div>
            <div className="ldi-levelup-sub">Escolha um atributo para aprimorar:</div>
            {Object.entries(ATTR_NAMES).map(([key, label]) => {
              const current = sheet?.attributes?.[key] || 0
              const atMax = current >= 4
              return (
                <div key={key} className="ldi-levelup-attr">
                  <span className="ldi-levelup-attr-label">{label}</span>
                  <span className="ldi-levelup-attr-value">{current}</span>
                  <button
                    className="ldi-levelup-attr-btn"
                    onClick={() => handleLevelUpAttr(key)}
                    disabled={atMax}
                    style={levelUpAttr === key ? { borderColor: '#F5B84A', background: 'rgba(239,159,39,0.15)' } : {}}
                  >+</button>
                </div>
              )
            })}
            <button
              className="ldi-levelup-confirm"
              onClick={handleConfirmLevelUp}
              disabled={!levelUpAttr}
              style={!levelUpAttr ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              CONFIRMAR
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!currentScene) {
    return (
      <div className="ldi-game">
        <div className="ldi-game-loading">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="ldi-game">
      <div className="ldi-game-hud">
        <span className="ldi-game-hud-item" onClick={() => navigate('/extras/ldi/sheet')}>
          📋 Ficha
        </span>
        <span className="ldi-game-hud-item">
          Dia {save.day_in_game}
        </span>
        <span className="ldi-game-hud-item">
          💰 {save.credits}
        </span>
        <span className="ldi-game-hud-item" onClick={() => navigate('/extras/ldi/clues')}>
          📓 Pistas ({save.clues_collected?.length || 0})
        </span>
        <span className="ldi-game-hud-item" onClick={() => setShowManual(true)} style={{ cursor: 'pointer' }}>
          📖 Manual
        </span>
        <span className="ldi-game-hud-item ldi-game-hud-pv">
          ❤️ {save.pv_current}/{Math.max(1, (sheet?.attributes?.R || 0) * 5)}
        </span>
      </div>

      <SceneView
        scene={currentScene}
        choices={choices}
        onChoice={handleChoice}
        sceneNav={sceneNav}
      />

      <ManualDrawer open={showManual} onClose={() => setShowManual(false)} />
    </div>
  )
}
