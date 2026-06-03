import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/useGameStore'
import { useCombatStore } from './store/useCombatStore'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import CombatView from './components/CombatView'
import './LDI.css'

export default function Combat() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const { sheet, save, updateSave, updateSheet, setScene, saveToCloud, gainXp } = useGameStore()
  const combat = useCombatStore()
  const [showXpToast, setShowXpToast] = useState(false)

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  useEffect(() => {
    console.log('[COMBAT] useEffect combat.active:', combat.active)
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
    console.log('[COMBAT] handleEndCombat chamado, result:', result)
    console.log('[COMBAT] save.status atual:', save?.status)
    console.log('[COMBAT] save.pv_current:', save?.pv_current)
    if (result === 'victory') {
      console.log('[COMBAT] victory - atualizando save')
      const creditsGain = 50 + Math.floor(Math.random() * 30)
      updateSave({
        credits: (save?.credits || 0) + creditsGain,
        status: 'active',
      })
      combat.resetCombat()
      const xpGain = 50
      gainXp(xpGain)
      setShowXpToast(true)
      console.log('[COMBAT] XP toast exibido:', xpGain)
      await new Promise(r => setTimeout(r, 2000))
      setShowXpToast(false)
      const gs = useGameStore.getState()
      const base = gs.save?.post_combat_scene || gs.save?.current_scene_id || '1.3'
      const returnScene = base.endsWith('-luta') ? base.replace('-luta', '-pos') : base
      console.log('[LDI] pós-combate victory, returnScene:', returnScene)
      await setScene(returnScene)
      if (user) saveToCloud(user.id)
      console.log('[COMBAT] victory - navegando para game, returnScene:', returnScene)
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
      <AnimatePresence>
        {showXpToast && (
          <motion.div
            className="ldi-xp-toast"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
          >
            +{50} XP
          </motion.div>
        )}
      </AnimatePresence>
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
