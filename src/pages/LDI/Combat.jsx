import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from './store/useGameStore'
import { useCombatStore } from './store/useCombatStore'
import { useAuth } from '../../context/AuthContext'
import CombatView from './components/CombatView'
import './LDI.css'

export default function Combat() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sheet, save, updateSave, setScene, saveToCloud } = useGameStore()
  const combat = useCombatStore()

  useEffect(() => {
    if (!combat.active) {
      navigate('/extras/ldi/game')
    }
  }, [combat.active, navigate])

  const handleAttack = () => {
    const result = combat.executeAttack(sheet)
    return result
  }

  const handleEnemyAttack = () => {
    const result = combat.executeEnemyAttack(sheet)
    if (result) {
      const newPv = Math.max(0, (save?.pv_current ?? 10) - result.damage)
      updateSave({ pv_current: newPv })
    }
    return result
  }

  const handleSelectMode = (mode) => {
    combat.selectMode(mode)
  }

  const handleEndCombat = async (result) => {
    if (result === 'victory') {
      const creditsGain = 50 + Math.floor(Math.random() * 30)
      updateSave({
        credits: (save?.credits || 0) + creditsGain,
      })
      combat.resetCombat()
      const gs = useGameStore.getState()
      const returnScene = gs.save?.post_combat_scene || gs.save?.current_scene_id || '1.3'
      console.log('[LDI] pós-combate victory, returnScene:', returnScene)
      await setScene(returnScene)
      if (user) saveToCloud(user.id)
      navigate('/extras/ldi/game')
    } else if (result === 'defeat') {
      updateSave({ status: 'ended_defeat' })
      combat.resetCombat()
      if (user) saveToCloud(user.id)
      navigate('/extras/ldi/end')
    } else {
      combat.resetCombat()
      if (user) saveToCloud(user.id)
      navigate('/extras/ldi/game')
    }
  }

  const handleFlee = () => {
    handleEndCombat('flee')
  }

  return (
    <div className="ldi-page ldi-page--combat">
      <CombatView
        sheet={sheet}
        save={save}
        combat={combat}
        onAttack={handleAttack}
        onEnemyAttack={handleEnemyAttack}
        onSelectMode={handleSelectMode}
        onEndCombat={handleEndCombat}
        onFlee={handleFlee}
      />
    </div>
  )
}
