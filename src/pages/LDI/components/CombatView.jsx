import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Onomatopeia, DiceRollDisplay, ScreenFlash } from './DiceRoll'
import { checkNearDeath } from '../engine/character'

const MODE_ICONS = { fists: '✊', armed: '⚔️', power: '⚡' }
const MODE_LABELS = { fists: 'Mãos Livres', armed: 'Armado', power: 'Poder' }

export default function CombatView({
  sheet,
  save,
  combat,
  onAttack,
  onEnemyAttack,
  onSelectMode,
  onEndCombat,
  onFlee,
}) {
  const [showOnomatopeia, setShowOnomatopeia] = useState(null)
  const [flashRed, setFlashRed] = useState(false)
  const [playerDice, setPlayerDice] = useState(null)
  const [enemyDice, setEnemyDice] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [damageNumber, setDamageNumber] = useState(null)
  const logEndRef = useRef(null)

  const pvMax = (sheet?.attributes?.R || 0) * 5 || 1
  const pmMax = (sheet?.attributes?.PdF || 0) * 4 || 2
  const pvPct = Math.max(0, ((save?.pv_current ?? pvMax) / pvMax) * 100)
  const enemyPvMax = combat.enemy?.pv_max || 1
  const enemyPvPct = Math.max(0, ((combat.enemy?.pv_current ?? enemyPvMax) / enemyPvMax) * 100)
  const nearDeath = checkNearDeath(sheet, save?.pv_current ?? pvMax)

  const log = combat.log || []
  const visibleLog = log.slice(-8)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  const handleAttack = async () => {
    if (animating) return
    setAnimating(true)

    // Player attack
    setShowOnomatopeia({ mode: combat.playerMode, critical: false })
    const result = onAttack()
    if (result) {
      setPlayerDice({ result: result.fa, success: result.damage > 0 })
      if (result.damage > 0) setDamageNumber({ value: result.damage, target: 'enemy', x: 60, y: 20 })
    }

    await new Promise(r => setTimeout(r, 800))

    if (result?.defeated) {
      setShowOnomatopeia(null)
      setAnimating(false)
      handleEndCombat('victory')
      return
    }

    setShowOnomatopeia(null)

    // Enemy attack
    await new Promise(r => setTimeout(r, 300))
    setFlashRed(true)
    setShowOnomatopeia({ mode: combat.enemy?.preferred_mode || 'fists', critical: false })
    const enemyResult = onEnemyAttack()
    if (enemyResult) {
      setEnemyDice({ result: enemyResult.fa, success: enemyResult.damage > 0 })
      if (enemyResult.damage > 0) setDamageNumber({ value: enemyResult.damage, target: 'player', x: 20, y: 20 })
    }

    const newPlayerPv = Math.max(0, (save?.pv_current ?? pvMax) - (enemyResult?.damage || 0))
    if (newPlayerPv <= 0) {
      await new Promise(r => setTimeout(r, 800))
      setShowOnomatopeia(null)
      setFlashRed(false)
      setAnimating(false)
      handleEndCombat('defeat')
      return
    }

    await new Promise(r => setTimeout(r, 800))
    setShowOnomatopeia(null)
    setFlashRed(false)
    setPlayerDice(null)
    setEnemyDice(null)
    setDamageNumber(null)
    setAnimating(false)
  }

  const handleEndCombat = (result) => {
    onEndCombat(result)
  }

  if (!combat.active || !combat.enemy) return null

  return (
    <div className="ldi-combat">
      {flashRed && <ScreenFlash color="red" intensity={0.4} duration={300} />}
      {nearDeath && <div className="ldi-vignette ldi-vignette--pulse" />}

      <AnimatePresence>
        {showOnomatopeia && (
          <Onomatopeia
            key={Date.now()}
            mode={showOnomatopeia.mode}
            critical={showOnomatopeia.critical}
            onDone={() => {}}
          />
        )}
      </AnimatePresence>

      <div className="ldi-combat-grid">
        {/* Player Column */}
        <div className="ldi-combat-player">
          <h3 className="ldi-combat-name">{sheet?.sheet_name || 'Você'}</h3>

          <div className="ldi-combat-hp-bar">
            <div className="ldi-combat-hp-label">
              <span>PV</span>
              <span>{save?.pv_current ?? pvMax}/{pvMax}</span>
            </div>
            <motion.div
              className="ldi-combat-hp-track"
              animate={nearDeath ? { x: [-2, 2, -2, 2, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={`ldi-combat-hp-fill ${pvPct <= 30 ? 'ldi-hp--danger' : pvPct <= 60 ? 'ldi-hp--warning' : 'ldi-hp--safe'}`}
                initial={false}
                animate={{ width: `${pvPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </motion.div>
          </div>

          <div className="ldi-combat-pm-bar">
            <span className="ldi-combat-pm-label">PM</span>
            <div className="ldi-combat-pm-icons">
              {Array.from({ length: pmMax }, (_, i) => (
                <motion.span
                  key={i}
                  className={`ldi-pm-icon ${i < (save?.pm_current ?? pmMax) ? 'ldi-pm-icon--active' : ''}`}
                  initial={false}
                  animate={i === (save?.pm_current ?? pmMax) ? { scale: [1, 0.5, 0], opacity: [1, 0.5, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >◆</motion.span>
              ))}
            </div>
          </div>

          <div className="ldi-combat-mode">
            <span className="ldi-combat-mode-label">Modo:</span>
            <span className="ldi-combat-mode-value">{MODE_ICONS[combat.playerMode]} {MODE_LABELS[combat.playerMode]}</span>
          </div>

          <div className="ldi-combat-powers">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className={`ldi-power-star ${i < combat.powersUsed ? 'ldi-power-star--used' : 'ldi-power-star--active'}`}>
                ★
              </span>
            ))}
          </div>

          {nearDeath && (
            <div className="ldi-near-death-badge">⚠ PERTO DA MORTE</div>
          )}
        </div>

        {/* Combat Log */}
        <div className="ldi-combat-log">
          <div className="ldi-combat-log-feed">
            {visibleLog.map((entry, i) => (
              <motion.div
                key={i}
                className={`ldi-log-entry ldi-log-entry--${entry.type}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {entry.text}
              </motion.div>
            ))}
            <div ref={logEndRef} />
          </div>

          <div className="ldi-combat-mode-select">
            {Object.entries(MODE_ICONS).map(([mode, icon]) => (
              <button
                key={mode}
                className={`ldi-mode-btn ${combat.playerMode === mode ? 'ldi-mode-btn--active' : ''}`}
                onClick={() => onSelectMode(mode)}
                disabled={animating}
              >
                {icon} {MODE_LABELS[mode]}
              </button>
            ))}
            <button
              className="ldi-mode-btn ldi-mode-btn--flee"
              onClick={onFlee}
              disabled={animating}
            >
              🏃 Fugir
            </button>
          </div>

          <button
            className="ldi-combat-attack-btn"
            onClick={handleAttack}
            disabled={animating}
          >
            {animating ? '⚔️ ROLANDO...' : '⚔️ ATACAR'}
          </button>
        </div>

        {/* Enemy Column */}
        <div className="ldi-combat-enemy">
          <h3 className="ldi-combat-name ldi-combat-name--enemy">{combat.enemy.name}</h3>

          <div className="ldi-combat-hp-bar">
            <div className="ldi-combat-hp-label">
              <span>PV</span>
              <span>{combat.enemy.pv_current}/{enemyPvMax}</span>
            </div>
            <motion.div
              className="ldi-combat-hp-track"
              animate={damageNumber?.target === 'enemy' ? { x: [-3, 3, -3, 3, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="ldi-combat-hp-fill ldi-hp--enemy"
                initial={false}
                animate={{ width: `${enemyPvPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </motion.div>
          </div>

          <div className="ldi-combat-enemy-mode">
            <span>Modo: {MODE_ICONS[combat.enemy.preferred_mode || 'fists']} {MODE_LABELS[combat.enemy.preferred_mode || 'fists']}</span>
          </div>

          {damageNumber && damageNumber.target === 'enemy' && (
            <motion.div
              className="ldi-dmg-float"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              +{damageNumber.value}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {playerDice && (
          <DiceRollDisplay result={playerDice.result} success={playerDice.success} onDone={() => setPlayerDice(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
