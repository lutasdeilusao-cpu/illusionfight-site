import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from './store/useGameStore'
import { useCombatStore } from './store/useCombatStore'
import { useAuth } from '../../context/AuthContext'
import SceneView from './components/SceneView'
import './LDI.css'

export default function Game() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sheet, save, currentScene, choices, setScene, makeChoice, updateSave, saveToCloud } = useGameStore()
  const combat = useCombatStore()

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
    if (save.status === 'ended_victory' || save.status === 'ended_defeat' || save.status === 'ended_fork') {
      if (user) saveToCloud(user.id)
      navigate('/extras/ldi/end')
    }
  }, [save.status, navigate, user, saveToCloud])

  const handleChoice = useCallback((choice) => {
    makeChoice(choice).catch(e => console.error('[LDI] choice error:', e))
    if (user) saveToCloud(user.id).catch(e => console.error('[LDI] save falhou:', e))
  }, [makeChoice, user, saveToCloud])

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
        <span className="ldi-game-hud-item ldi-game-hud-pv">
          ❤️ {save.pv_current}/{Math.max(1, (sheet?.attributes?.R || 0) * 5)}
        </span>
      </div>

      <SceneView
        scene={currentScene}
        choices={choices}
        onChoice={handleChoice}
      />
    </div>
  )
}
