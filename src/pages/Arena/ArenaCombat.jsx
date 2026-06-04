import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useArenaStore } from './store/useArenaStore'
import { calcFA, calcFD, calcDamage, calcInitiative } from '../LDI/engine/combat'
import { POWERS_BY_ELEMENTAL } from '../LDI/data/powersData'
import './Arena.css'

const ONOMATOPEIAS_FISTS = ['POW!', 'WHAM!', 'CRACK!']
const ONOMATOPEIAS_ARMED = ['SLASH!', 'CLANG!', 'THWACK!']
const ONOMATOPEIAS_POWER = ['BOOM!', 'ZAP!', 'FWOOSH!']
const MODE_ICONS = { fists: '✊', armed: '⚔️', power: '⚡' }
const MODE_LABELS = { fists: 'Mãos Livres', armed: 'Armado', power: 'Poder' }

function getOnomatopeia(mode) {
  if (mode === 'fists') return ONOMATOPEIAS_FISTS[Math.floor(Math.random() * ONOMATOPEIAS_FISTS.length)]
  if (mode === 'armed') return ONOMATOPEIAS_ARMED[Math.floor(Math.random() * ONOMATOPEIAS_ARMED.length)]
  if (mode === 'power') return ONOMATOPEIAS_POWER[Math.floor(Math.random() * ONOMATOPEIAS_POWER.length)]
  return ONOMATOPEIAS_FISTS[0]
}

function DiceSlot({ onDone }) {
  const [n, setN] = useState('?')
  const [rolling, setRolling] = useState(true)
  const [final, setFinal] = useState(null)

  useEffect(() => {
    const start = Date.now()
    const duration = 400
    let frame
    function anim() {
      const elapsed = Date.now() - start
      if (elapsed < duration) {
        setN(Math.floor(Math.random() * 6) + 1)
        frame = requestAnimationFrame(anim)
      } else {
        const result = Math.floor(Math.random() * 6) + 1
        setFinal(result)
        setN(result)
        setRolling(false)
        if (onDone) setTimeout(onDone, 600)
      }
    }
    frame = requestAnimationFrame(anim)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <motion.div className="arena-dice-slot"
      initial={{ scale: 0.5 }} animate={rolling ? { rotate: [0, 360], scale: [0.8, 1.2, 0.8] } : { scale: 1.3 }}
      transition={rolling ? { duration: 0.2, repeat: Infinity } : { type: 'spring', stiffness: 300 }}>
      🎲 {n}
    </motion.div>
  )
}

export default function ArenaCombat({ onNavigate }) {
  const store = useArenaStore()
  const { sheet, match } = store
  const enemy = match.enemy

  const isR = Number(sheet?.attributes?.R) || 0
  const isPdF = Number(sheet?.attributes?.PdF) || 0
  const pvMax = Math.max(1, isR * 5)
  const pmMax = Math.max(2, isPdF * 5)

  const [playerPv, setPlayerPv] = useState(Math.max(1, match.pv_current || pvMax))
  const [playerPm, setPlayerPm] = useState(Math.max(2, match.pm_current || pmMax))
  const [enemyPv, setEnemyPv] = useState(Number(enemy?.pv_current) || Number(enemy?.pv_max) || 10)
  const [log, setLog] = useState([])
  const [animating, setAnimating] = useState(false)
  const [mode, setMode] = useState('fists')
  const [showPowerSelect, setShowPowerSelect] = useState(true)
  const [selectedPowers, setSelectedPowers] = useState([])

  const [showOnomatopeia, setShowOnomatopeia] = useState(null)
  const [flashRed, setFlashRed] = useState(false)
  const [showDice, setShowDice] = useState(false)
  const [showEnemyTurn, setShowEnemyTurn] = useState(false)
  const [damageFloat, setDamageFloat] = useState(null)

  const logRef = useRef(null)
  const elemental = sheet?.elemental || 'neutro'
  const availablePowers = POWERS_BY_ELEMENTAL[elemental] || POWERS_BY_ELEMENTAL.neutro

  useEffect(() => {
    if (!enemy) { onNavigate('lobby'); return }
    const pInit = calcInitiative(sheet)
    const eInit = calcInitiative({ attributes: enemy.stats })
    setLog([{ type: 'system', text: `🎲 Iniciativa: Você ${pInit} vs ${enemy.name} ${eInit}` }])
  }, [])

  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [log.length])

  const addLog = (type, text) => setLog(l => [...l, { type, text }])

  const togglePower = (id) => {
    setSelectedPowers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const endMatch = (result) => {
    store.endMatch(result)
    onNavigate('victory')
  }

  const getEnemySheet = () => {
    const stats = enemy?.stats || {}
    return { attributes: { F: Number(stats.F)||0, H: Number(stats.H)||1, R: Number(stats.R)||0, A: Number(stats.A)||0, PdF: Number(stats.PdF)||0 } }
  }

  const getPlayerSheet = () => {
    const a = sheet?.attributes || {}
    return { attributes: { F: Number(a.F)||0, H: Number(a.H)||0, R: Number(a.R)||0, A: Number(a.A)||0, PdF: Number(a.PdF)||0 } }
  }

  const executeEnemyTurn = () => {
    setShowEnemyTurn(true)
    setTimeout(() => {
      setShowEnemyTurn(false)
      setFlashRed(true)
      setShowDice(true)

      setTimeout(() => {
        setShowDice(false)
        const eMode = enemy.preferred_mode || 'fists'
        const wBonus = Number(enemy.weapon_damage) || 0
        const fa = calcFA(eMode, getEnemySheet(), wBonus)
        const fd = calcFD(getPlayerSheet(), true)
        const dmg = Math.max(0, calcDamage(Number(fa.value)||0, Number(fd.value)||0))
        setShowOnomatopeia(eMode)

        addLog('enemy', `${enemy.name} ataca (${fa.breakdown}) vs sua FD ${fd.value} = ${dmg} dano`)

        if (dmg > 0) {
          const nextPv = Math.max(0, playerPv - dmg)
          setPlayerPv(nextPv)
          setDamageFloat({ value: dmg, target: 'player' })
          setTimeout(() => setDamageFloat(null), 800)

          if (nextPv <= 0) {
            addLog('system', '💀 Você foi derrotado!')
            setTimeout(() => { setFlashRed(false); setShowOnomatopeia(null); endMatch('defeat') }, 800)
            return
          }
        }
        setTimeout(() => { setFlashRed(false); setShowOnomatopeia(null) }, 600)
      }, 500)
    }, 1500)
  }

  const handleAttack = (powerCost = 0) => {
    if (animating) return
    setAnimating(true)

    const wBonus = Number(enemy?.weapon_damage) || 0
    const pBonus = Number(powerCost) * 2
    const fa = calcFA(mode, getPlayerSheet(), wBonus)
    const fd = calcFD(getEnemySheet(), true)
    const baseDmg = Math.max(0, calcDamage(Number(fa.value)||0, Number(fd.value)||0))
    const dmg = baseDmg + pBonus

    setShowOnomatopeia(mode)
    setShowDice(true)

    const playerSide = mode === 'power' ? 'power' : 'player'

    setTimeout(() => {
      setShowDice(false)
      if (powerCost > 0) {
        setPlayerPm(p => Math.max(0, p - powerCost))
        const pname = selectedPowers.map(id => availablePowers.find(x => x.id === id)?.name || id)[0]
        addLog(playerSide, `⚡ ${pname} gastou ${powerCost} PM (+${pBonus} dano)`)
      }
      addLog(playerSide, `Você ataca (${fa.breakdown}) vs FD ${fd.value} = ${dmg} dano`)

      const nextEpv = Math.max(0, enemyPv - dmg)
      setEnemyPv(nextEpv)
      if (dmg > 0) setDamageFloat({ value: dmg, target: 'enemy' })
      setTimeout(() => setDamageFloat(null), 800)

      if (nextEpv <= 0) {
        setShowOnomatopeia(null)
        addLog('system', '⚔️ VITÓRIA!')
        setTimeout(() => { setAnimating(false); store.endMatch('victory'); onNavigate('victory') }, 600)
        return
      }

      setShowOnomatopeia(null)
      executeEnemyTurn()
      setAnimating(false)
    }, 500)
  }

  if (!enemy) return null

  if (showPowerSelect) {
    return (
      <div className="arena-combat">
        <div className="arena-power-select">
          <h2 className="arena-power-title">Preparar Poderes</h2>
          <p className="arena-power-sub">Selecione até 4 poderes elementais ({elemental})</p>
          <div className="arena-power-grid">
            {availablePowers.map(p => (
              <motion.button key={p.id}
                className={`arena-power-card ${selectedPowers.includes(p.id) ? 'arena-power-card--selected' : ''}`}
                onClick={() => togglePower(p.id)} whileHover={{ scale: 1.02 }}>
                <div className="arena-power-header">{p.name} <span>⚡{p.cost} PM</span></div>
                <p>{p.desc}</p>
              </motion.button>
            ))}
          </div>
          <div className="arena-power-footer">
            <span>{selectedPowers.length}/4</span>
            <button className="arena-btn-primary" onClick={() => setShowPowerSelect(false)}>
              {selectedPowers.length === 0 ? 'ENTRAR (sem poderes)' : `ENTRAR (${selectedPowers.length} poderes)`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pvPct = Math.max(0, (playerPv / pvMax) * 100)
  const epvPct = Math.max(0, (enemyPv / (Number(enemy.pv_max) || 10)) * 100)
  const nearDeath = playerPv <= isR

  const logEntries = ['player', 'power', 'enemy_attack']

  return (
    <div className="arena-combat">
      <AnimatePresence>
        {flashRed && (
          <motion.div className="arena-flash"
            initial={{ opacity: 0.4 }} animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onAnimationComplete={() => setFlashRed(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEnemyTurn && (
          <motion.div className="arena-enemy-turn-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.span className="arena-enemy-turn-text"
              animate={{ opacity: [1, 0.2, 1, 0.2, 1] }}
              transition={{ duration: 1.5 }}>=== VEZ DO INIMIGO ===</motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDice && <DiceSlot onDone={() => {}} />}
      </AnimatePresence>

      <AnimatePresence>
        {showOnomatopeia && (
          <motion.div className="arena-onomatopeia"
            initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            {getOnomatopeia(showOnomatopeia)}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="arena-combat-header">
        <button className="arena-back" onClick={() => { store.endMatch('defeat'); onNavigate('lobby') }}>← lobby</button>
        <h2 className="arena-combat-vs">{sheet?.sheet_name} vs {enemy.name}</h2>
      </div>

      <div className="arena-combat-grid">
        <div className="arena-combat-side">
          <h3>{sheet?.sheet_name}</h3>
          <div className="arena-bar-wrap">
            <span>PV {playerPv}/{pvMax}</span>
            <div className="arena-bar">
              <motion.div className={`arena-bar-fill ${nearDeath ? 'arena-bar-fill--danger-pulse' : 'arena-bar-green'}`}
                animate={{ width: `${pvPct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
            </div>
          </div>
          <div className="arena-bar-wrap">
            <span>PM</span>
            <div className="arena-pm-icons">{Array.from({ length: pmMax }, (_, i) => <span key={i} className={`arena-pm-dot ${i < playerPm ? 'arena-pm-dot--on' : ''}`}>◆</span>)}</div>
          </div>
          <div className="arena-mode">Modo: {MODE_ICONS[mode]} {MODE_LABELS[mode]}</div>
          {nearDeath && (
            <motion.div className="arena-near-death" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
              ⚠ PERTO DA MORTE
            </motion.div>
          )}
        </div>

        <div className="arena-combat-side arena-combat-enemy">
          <h3>{enemy.name}</h3>
          <div className="arena-bar-wrap">
            <span>PV {enemyPv}/{Number(enemy.pv_max) || 10}</span>
            <div className="arena-bar">
              <motion.div className="arena-bar-fill arena-bar-red"
                animate={{ width: `${epvPct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
            </div>
          </div>
          <div className="arena-mode">Modo: {MODE_ICONS[enemy.preferred_mode || 'fists']} {MODE_LABELS[enemy.preferred_mode || 'fists']}</div>
        </div>
      </div>

      <div className="arena-log-area">
        <div className="arena-log-feed">
          {log.slice(-8).map((l, i) => {
            if (l.type === 'system') return <div key={i} className="arena-log-system">{l.text}</div>
            if (l.type === 'enemy') return <div key={i} className="arena-log-bubble arena-log-bubble--enemy">{l.text}</div>
            return <div key={i} className="arena-log-bubble arena-log-bubble--player">{l.text}</div>
          })}
          <div ref={logRef} />
        </div>
      </div>

      <AnimatePresence>
        {damageFloat && (
          <motion.div className={`arena-dmg-float arena-dmg-float--${damageFloat.target}`}
            initial={{ y: 0, opacity: 1 }} animate={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.8 }}>-{damageFloat.value}</motion.div>
        )}
      </AnimatePresence>

      <div className="arena-combat-actions">
        <div className="arena-mode-btns">
          {Object.entries(MODE_ICONS).map(([m, icon]) => (
            <button key={m} className={`arena-mode-btn ${mode === m ? 'arena-mode-btn--active' : ''}`}
              onClick={() => setMode(m)} disabled={animating}>{icon} {MODE_LABELS[m]}</button>
          ))}
        </div>
        <button className="arena-btn-flee" onClick={() => { addLog('system', '🏃 Você fugiu!'); store.endMatch('defeat'); onNavigate('lobby') }} disabled={animating}>FUGIR</button>
        {mode === 'power' && selectedPowers.length > 0 && (
          <div className="arena-power-attacks">
            {selectedPowers.map(id => {
              const fp = availablePowers.find(x => x.id === id)
              if (!fp) return null
              const can = playerPm >= (fp.cost || 1) && !animating
              return <button key={id} className="arena-power-btn" disabled={!can}
                onClick={() => handleAttack(fp.cost || 1)}>{fp.name} ⚡{fp.cost} PM</button>
            })}
          </div>
        )}
        <button className="arena-attack-btn" onClick={() => handleAttack()} disabled={animating}>
          {animating ? '...' : 'ATACAR'}
        </button>
      </div>
    </div>
  )
}
