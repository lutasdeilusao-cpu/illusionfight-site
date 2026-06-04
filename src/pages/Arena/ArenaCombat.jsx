import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useArenaStore } from './store/useArenaStore'
import { calcFA, calcFD, calcDamage, calcInitiative, deathTest } from '../LDI/engine/combat'
import { POWERS_BY_ELEMENTAL } from '../LDI/data/powersData'

const MODE_ICONS = { fists: '✊', armed: '⚔️', power: '⚡' }
const MODE_LABELS = { fists: 'Mãos Livres', armed: 'Armado', power: 'Poder' }

export default function ArenaCombat({ onNavigate }) {
  const store = useArenaStore()
  const { sheet, match } = store
  const enemy = match.enemy

  const isR = sheet.attributes?.R || 0
  const isPdF = sheet.attributes?.PdF || 0
  const pvMax = isR * 5
  const pmMax = isPdF * 5
  const [playerPv, setPlayerPv] = useState(match.pv_current || pvMax)
  const [playerPm, setPlayerPm] = useState(match.pm_current || pmMax)
  const [enemyPv, setEnemyPv] = useState(enemy?.pv_current ?? enemy?.pv_max ?? 10)
  const [log, setLog] = useState([])
  const [animating, setAnimating] = useState(false)
  const [mode, setMode] = useState('fists')
  const [showPowerSelect, setShowPowerSelect] = useState(true)
  const [selectedPowers, setSelectedPowers] = useState([])
  const logRef = useRef(null)

  const elemental = sheet.elemental || 'neutro'
  const availablePowers = POWERS_BY_ELEMENTAL[elemental] || POWERS_BY_ELEMENTAL.neutro

  useEffect(() => {
    if (!enemy) { onNavigate('lobby'); return }
    const pInit = calcInitiative(sheet)
    const eInit = calcInitiative({ attributes: enemy.stats })
    setLog([{ text: `🎲 Iniciativa: Você ${pInit} vs ${enemy.name} ${eInit}` }])
  }, [])

  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [log.length])

  const addLog = (text) => setLog(l => [...l, { text }])

  const togglePower = (id) => {
    setSelectedPowers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const endMatch = (result) => {
    store.endMatch(result)
    onNavigate('victory')
  }

  const executeEnemyTurn = () => {
    const eMode = enemy.preferred_mode || 'fists'
    const wBonus = enemy.weapon_damage || 0
    const fa = calcFA(eMode, { attributes: enemy.stats }, wBonus)
    const fd = calcFD(sheet, true)
    const dmg = calcDamage(fa.value, fd.value)
    addLog(`${enemy.name} ataca (${fa.breakdown}) vs sua FD ${fd.value} = ${dmg} dano`)
    if (dmg > 0) {
      const nextPv = Math.max(0, playerPv - dmg)
      setPlayerPv(nextPv)
      if (nextPv <= 0) {
        addLog('💀 Você foi derrotado!')
        endMatch('defeat')
        return true
      }
    }
    return false
  }

  const handleAttack = (powerCost = 0) => {
    if (animating) return
    setAnimating(true)
    const wBonus = enemy?.weapon_damage || 0
    const pBonus = powerCost * 2
    const fa = calcFA(mode, sheet, wBonus)
    const fd = calcFD({ attributes: enemy.stats }, true)
    const dmg = calcDamage(fa.value, fd.value) + pBonus

    if (powerCost > 0) {
      setPlayerPm(p => Math.max(0, p - powerCost))
      addLog(`⚡ ${selectedPowers.map(id => availablePowers.find(x => x.id === id)?.name || id)[0]} gastou ${powerCost} PM (+${pBonus} dano)`)
    }
    addLog(`Você ataca (${fa.breakdown}) vs FD ${fd.value} = ${dmg} dano`)

    const nextEpv = Math.max(0, enemyPv - dmg)
    setEnemyPv(nextEpv)

    if (nextEpv <= 0) {
      addLog('⚔️ VITÓRIA!')
      setTimeout(() => { store.endMatch('victory'); onNavigate('victory') }, 600)
      setAnimating(false)
      return
    }

    setTimeout(() => {
      const dead = executeEnemyTurn()
      setAnimating(dead)
    }, 400)
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
  const epvPct = Math.max(0, (enemyPv / (enemy.pv_max || 10)) * 100)

  return (
    <div className="arena-combat">
      <div className="arena-combat-header">
        <button className="arena-back" onClick={() => { store.endMatch('defeat'); onNavigate('lobby') }}>← lobby</button>
        <h2 className="arena-combat-vs">{sheet.sheet_name} vs {enemy.name}</h2>
      </div>

      <div className="arena-combat-grid">
        <div className="arena-combat-side">
          <h3>{sheet.sheet_name}</h3>
          <div className="arena-bar-wrap">
            <span>PV {playerPv}/{pvMax}</span>
            <div className="arena-bar"><motion.div className="arena-bar-fill arena-bar-green" animate={{ width: `${pvPct}%` }} /></div>
          </div>
          <div className="arena-bar-wrap">
            <span>PM</span>
            <div className="arena-pm-icons">{Array.from({ length: pmMax }, (_, i) => <span key={i} className={`arena-pm-dot ${i < playerPm ? 'arena-pm-dot--on' : ''}`}>◆</span>)}</div>
          </div>
          <div className="arena-mode">Modo: {MODE_ICONS[mode]} {MODE_LABELS[mode]}</div>
        </div>

        <div className="arena-combat-side arena-combat-enemy">
          <h3>{enemy.name}</h3>
          <div className="arena-bar-wrap">
            <span>PV {enemyPv}/{enemy.pv_max || 10}</span>
            <div className="arena-bar"><motion.div className="arena-bar-fill arena-bar-red" animate={{ width: `${epvPct}%` }} /></div>
          </div>
          <div className="arena-mode">Modo: {MODE_ICONS[enemy.preferred_mode || 'fists']} {MODE_LABELS[enemy.preferred_mode || 'fists']}</div>
        </div>
      </div>

      <div className="arena-log">
        {log.slice(-8).map((l, i) => <div key={i} className="arena-log-line">{l.text}</div>)}
        <div ref={logRef} />
      </div>

      <div className="arena-combat-actions">
        <div className="arena-mode-btns">
          {Object.entries(MODE_ICONS).map(([m, icon]) => (
            <button key={m} className={`arena-mode-btn ${mode === m ? 'arena-mode-btn--active' : ''}`}
              onClick={() => setMode(m)} disabled={animating}>{icon} {MODE_LABELS[m]}</button>
          ))}
        </div>
        <button className="arena-btn-flee" onClick={() => { addLog('🏃 Você fugiu!'); store.endMatch('defeat'); onNavigate('lobby') }} disabled={animating}>FUGIR</button>
        {mode === 'power' && selectedPowers.length > 0 && (
          <div className="arena-power-attacks">
            {selectedPowers.map(id => {
              const fp = availablePowers.find(x => x.id === id)
              if (!fp) return null
              const can = playerPm >= (fp.cost || 1) && !animating
              return <button key={id} className="arena-power-btn" disabled={!can}
                onClick={() => {
                  setAnimating(true)
                  handleAttack(fp.cost || 1)
                  setTimeout(() => setAnimating(false), 600)
                }}>{fp.name} ⚡{fp.cost} PM</button>
            })}
          </div>
        )}
        <button className="arena-attack-btn" onClick={handleAttack} disabled={animating}>
          {animating ? '...' : 'ATACAR'}
        </button>
      </div>
    </div>
  )
}
