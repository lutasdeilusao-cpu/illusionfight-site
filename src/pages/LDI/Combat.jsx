import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/useGameStore'
import { useCombatStore } from './store/useCombatStore'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import CombatView from './components/CombatView'
import ManualDrawer from './components/ManualDrawer'
import { POWERS_BY_ELEMENTAL } from './data/powersData'
import './LDI.css'

export default function Combat() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const { sheet, save, updateSave, updateSheet, setScene, saveToCloud, gainXp } = useGameStore()
  const combat = useCombatStore()
  const [showXpToast, setShowXpToast] = useState(false)
  const [showPowerSelect, setShowPowerSelect] = useState(true)
  const [selectedPowers, setSelectedPowers] = useState([])
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    console.log('[LDI] readerMode setado')
    console.log('[LDI] readerMode setado para true (Combat)')
    setReaderMode(true)
    return () => {
      console.log('[LDI] readerMode setado para false (Combat cleanup)')
      setReaderMode(false)
    }
  }, [setReaderMode])

  useEffect(() => {
    console.log('[COMBAT] useEffect combat.active:', combat.active)
    if (!combat.active) {
      navigate('/extras/ldi/game')
    }
  }, [combat.active, navigate])

  const elemental = sheet?.elemental || 'neutro'
  const availablePowers = POWERS_BY_ELEMENTAL[elemental] || POWERS_BY_ELEMENTAL.neutro

  const togglePower = (powerId) => {
    setSelectedPowers(prev =>
      prev.includes(powerId) ? prev.filter(id => id !== powerId) : prev.length < 4 ? [...prev, powerId] : prev
    )
  }

  const handleStartCombat = () => {
    setShowPowerSelect(false)
    const powerNames = selectedPowers.map(id => {
      const p = availablePowers.find(x => x.id === id)
      return p?.name || id
    })
    combat.addLog({
      type: 'initiative',
      text: `🔮 Poderes preparados: ${powerNames.join(', ') || 'nenhum'}`,
    })
  }

  const handleAttack = (powerCost = 0) => {
    if (powerCost > 0) {
      const newPm = Math.max(0, (save?.pm_current ?? 0) - powerCost)
      updateSave({ pm_current: newPm })
    }
    const result = combat.executeAttack(sheet, powerCost * 2)
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
    if (result === 'victory') {
      const creditsGain = 50 + Math.floor(Math.random() * 30)
      updateSave({
        credits: (save?.credits || 0) + creditsGain,
        status: 'active',
      })
      combat.resetCombat()
      const xpGain = 10
      gainXp(xpGain)
      setShowXpToast(true)
      await new Promise(r => setTimeout(r, 2000))
      setShowXpToast(false)
      const gs = useGameStore.getState()
      const base = gs.save?.post_combat_scene || gs.save?.current_scene_id || '1.3'
      const returnScene = base.endsWith('-luta') ? base.replace('-luta', '-pos') : base
      await setScene(returnScene)
      if (user) saveToCloud(user.id)
      navigate('/extras/ldi/game')
    } else if (result === 'defeat') {
      const gs = useGameStore.getState()
      const postScene = gs.save?.post_combat_scene || ''
      if (postScene.startsWith('4.')) {
        combat.resetCombat()
        await setScene('4.2_derrota')
        if (user) saveToCloud(user.id)
        navigate('/extras/ldi/game')
      } else {
        updateSave({ status: 'ended_defeat' })
        combat.resetCombat()
        if (user) saveToCloud(user.id)
        navigate('/extras/ldi/end')
      }
    } else {
      combat.resetCombat()
      if (user) saveToCloud(user.id)
      navigate('/extras/ldi/game')
    }
  }

  const handleFlee = () => {
    handleEndCombat('flee')
  }

  if (showPowerSelect && combat.active) {
    return (
      <div className="ldi-page ldi-page--combat">
        <div className="ldi-power-select">
          <motion.div
            className="ldi-power-select-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="ldi-power-select-title">Preparar Poderes</h2>
            <p className="ldi-power-select-sub">
              Selecione até 4 poderes elementais ({elemental}) para usar neste combate.
              <button className="ldi-power-select-manual" onClick={() => setShowManual(true)}>📖</button>
            </p>
            <div className="ldi-power-select-grid">
              {availablePowers.map(p => {
                const selected = selectedPowers.includes(p.id)
                return (
                  <motion.button
                    key={p.id}
                    className={`ldi-power-select-card ${selected ? 'ldi-power-select-card--selected' : ''}`}
                    onClick={() => togglePower(p.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="ldi-power-select-card-header">
                      <span className="ldi-power-select-card-name">{p.name}</span>
                      <span className="ldi-power-select-card-cost">⚡{p.cost} PM</span>
                    </div>
                    <p className="ldi-power-select-card-desc">{p.desc}</p>
                  </motion.button>
                )
              })}
            </div>
            <div className="ldi-power-select-footer">
              <span className="ldi-power-select-count">{selectedPowers.length}/4 selecionados</span>
              <button
                className="ldi-btn ldi-btn--primary"
                onClick={handleStartCombat}
              >
                {selectedPowers.length === 0 ? 'ENTRAR EM COMBATE (SEM PODERES)' : `ENTRAR EM COMBATE (${selectedPowers.length} PODERES)`}
              </button>
            </div>
          </motion.div>
        </div>
        <ManualDrawer open={showManual} onClose={() => setShowManual(false)} />
      </div>
    )
  }

  return (
    <div className="ldi-page ldi-page--combat">
      <div className="ldi-combat-manual-btn" onClick={() => setShowManual(true)} title="Manual">📖</div>
      <AnimatePresence>
        {showXpToast && (
          <motion.div
            className="ldi-xp-toast"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
          >
            +10 XP
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
        selectedPowers={selectedPowers.map(id => availablePowers.find(p => p.id === id)).filter(Boolean)}
        availablePowers={availablePowers}
      />
      <ManualDrawer open={showManual} onClose={() => setShowManual(false)} />
    </div>
  )
}
