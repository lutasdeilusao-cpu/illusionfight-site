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

const DURACAO = {
  player_dado: 2200,
  player_onoma: 600,
  enemy_turno: 1500,
  enemy_dado: 2200,
  enemy_onoma: 600,
  enemy_trash: 1200,
  fim_turno: 100,
}

const ESTADOS = {
  IDLE: 'idle',
  PLAYER_DADO: 'player_dado',
  PLAYER_ONOMA: 'player_onoma',
  ENEMY_TURNO: 'enemy_turno',
  ENEMY_DADO: 'enemy_dado',
  ENEMY_ONOMA: 'enemy_onoma',
  ENEMY_TRASH: 'enemy_trash',
  FIM_TURNO: 'fim_turno',
}

const delay = ms => new Promise(res => setTimeout(res, ms))

function getOnomatopeia(mode) {
  if (mode === 'fists') return ONOMATOPEIAS_FISTS[Math.floor(Math.random() * ONOMATOPEIAS_FISTS.length)]
  if (mode === 'armed') return ONOMATOPEIAS_ARMED[Math.floor(Math.random() * ONOMATOPEIAS_ARMED.length)]
  if (mode === 'power') return ONOMATOPEIAS_POWER[Math.floor(Math.random() * ONOMATOPEIAS_POWER.length)]
  return ONOMATOPEIAS_FISTS[0]
}

function pickTrash(arr) {
  if (!arr || !arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

function DiceSlot({ finalValue }) {
  const [display, setDisplay] = useState('?')
  const [phase, setPhase] = useState('rolling')

  useEffect(() => {
    let frame
    const start = Date.now()
    const rollDuration = 800

    function roll() {
      const elapsed = Date.now() - start
      if (elapsed < rollDuration) {
        setDisplay(Math.floor(Math.random() * 6) + 1)
        frame = requestAnimationFrame(roll)
      } else {
        setPhase('landing')
        setDisplay(finalValue)
        setTimeout(() => setPhase('showing'), 200)
      }
    }
    frame = requestAnimationFrame(roll)
    return () => cancelAnimationFrame(frame)
  }, [])

  const isCritical = finalValue === 6
  const numberClass = phase === 'rolling'
    ? 'arena-dice-number arena-dice-number--rolling'
    : `arena-dice-number arena-dice-number--showing${isCritical ? ' arena-dice-number--critico' : ''}`
  const labelClass = isCritical ? 'arena-dice-label arena-dice-label--critico' : 'arena-dice-label'

  const rotationAnim = phase === 'rolling'
    ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.05, 0.95, 1] }
    : phase === 'landing'
    ? { scale: [1.4, 0.9, 1.1, 1], rotate: 0 }
    : { scale: 1, rotate: 0 }

  const rotationTransition = phase === 'rolling'
    ? { duration: 0.15, repeat: Infinity }
    : { duration: 0.4, ease: 'easeOut' }

  return (
    <motion.div className="arena-dice-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}>
      <motion.div className={numberClass}
        animate={rotationAnim} transition={rotationTransition}>
        🎲 {display}
      </motion.div>
      {phase === 'showing' && (
        <motion.div className={labelClass}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {isCritical ? '⚡ CRÍTICO!' : `resultado: ${finalValue}`}
        </motion.div>
      )}
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
  const [mode, setMode] = useState('fists')
  const [showPowerSelect, setShowPowerSelect] = useState(true)
  const [selectedPowers, setSelectedPowers] = useState([])
  const [damageFloat, setDamageFloat] = useState(null)

  const [turnoEstado, setTurnoEstado] = useState('idle')
  const turnoEstadoRef = useRef('idle')
  const dadosTurnoRef = useRef({})
  const saidNearDeath = useRef(false)
  const saidEnemyLow = useRef(false)
  const timerRef = useRef(null)
  const chatQueue = useRef(Promise.resolve())

  const logRef = useRef(null)
  const elemental = sheet?.elemental || 'neutro'
  const availablePowers = POWERS_BY_ELEMENTAL[elemental] || POWERS_BY_ELEMENTAL.neutro

  const playerInitial = (sheet?.sheet_name || 'V')[0].toUpperCase()
  const enemyInitial = (enemy?.name || 'I')[0].toUpperCase()

  const animating = turnoEstado !== 'idle'
  const diceValue = (turnoEstado === 'player_dado') ? dadosTurnoRef.current.playerDado
    : (turnoEstado === 'enemy_dado') ? dadosTurnoRef.current.enemyDado : null
  const showOnoma = (turnoEstado === 'player_onoma') ? mode
    : (turnoEstado === 'enemy_onoma') ? dadosTurnoRef.current.enemyMode : null
  const showTurno = turnoEstado === 'enemy_turno'
  const showFlash = turnoEstado === 'enemy_dado'

  useEffect(() => {
    if (!enemy) { onNavigate('lobby'); return }
    const pInit = calcInitiative(sheet)
    const eInit = calcInitiative({ attributes: enemy.stats })
    setLog([{ type: 'system', text: `🎲 Iniciativa: Você ${pInit} vs ${enemy.name} ${eInit}`, id: Date.now() }])
    saidNearDeath.current = false
    saidEnemyLow.current = false
  }, [])

  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [log.length])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const addLogWithDelay = (type, text, sender) => {
    const msgId = Date.now() + Math.random()
    const typingTime = Math.min(300 + text.length * 18, 1800)
    chatQueue.current = chatQueue.current.then(async () => {
      setLog(l => [...l, { type, text: '__typing__', id: msgId + '-typing', sender }])
      await delay(typingTime)
      setLog(l => l.map(m => m.id === msgId + '-typing' ? { ...m, text, id: msgId } : m))
    })
  }

  const addTrashWithDelay = (category) => {
    const talk = enemy?.trash_talk?.[category]
    const line = pickTrash(talk)
    if (!line) return
    chatQueue.current = chatQueue.current.then(async () => {
      await delay(600)
      const text = `${enemy.name}: ${line}`
      const typingTime = Math.min(300 + text.length * 18, 1800)
      setLog(l => [...l, { type: 'trash', text: '__typing__', id: Date.now() + '-typing', sender: { name: enemy.name, initial: enemyInitial, side: 'enemy' } }])
      await delay(typingTime)
      setLog(l => l.map(m => m.text === '__typing__' && m.type === 'trash' ? { ...m, text, id: Date.now() } : m))
    })
  }

  const addSystemLog = (text) => {
    setLog(l => [...l, { type: 'system', text, id: Date.now() }])
  }

  const togglePower = (id) => {
    setSelectedPowers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const endMatch = (result) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    turnoEstadoRef.current = 'idle'
    setTurnoEstado('idle')
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

  const avancarEstado = (estado, duracao) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    turnoEstadoRef.current = estado
    setTurnoEstado(estado)

    if (duracao > 0) {
      timerRef.current = setTimeout(() => {
        onEstadoCompleto(estado)
      }, duracao)
    }
  }

  const onEstadoCompleto = (estado) => {
    const d = dadosTurnoRef.current

    switch (estado) {
      case 'player_dado': {
        const nextEpv = Math.max(0, enemyPv - d.playerDmg)
        setEnemyPv(nextEpv)
        if (d.playerDmg > 0) setDamageFloat({ value: d.playerDmg, target: 'enemy' })

        const playerSide = mode === 'power' ? 'power' : 'player'
        if (d.powerCost > 0) {
          const pname = selectedPowers.map(id => availablePowers.find(x => x.id === id)?.name || id)[0]
          addLogWithDelay(playerSide, `⚡ ${pname} gastou ${d.powerCost} PM (+${d.powerBonus} dano)`, { name: sheet?.sheet_name, initial: playerInitial, side: 'player' })
        }
        addLogWithDelay(playerSide, `Você ataca (${d.playerBreakdown}) vs FD ${d.playerFD} = ${d.playerDmg} dano`, { name: sheet?.sheet_name, initial: playerInitial, side: 'player' })

        if (d.playerRoll === 6) addTrashWithDelay('take_critical')
        else if (d.playerDmg > 0) addTrashWithDelay('take_damage')

        if (nextEpv <= 0) {
          addSystemLog('⚔️ VITÓRIA!')
          setTimeout(() => endMatch('victory'), 600)
          return
        }

        if (nextEpv <= (Number(enemy.pv_max) || 10) * 0.3 && !saidEnemyLow.current) {
          saidEnemyLow.current = true
          addTrashWithDelay('enemy_near_death')
        }

        avancarEstado('player_onoma', DURACAO.player_onoma)
        break
      }

      case 'player_onoma':
        setDamageFloat(null)
        avancarEstado('enemy_turno', DURACAO.enemy_turno)
        break

      case 'enemy_turno':
        avancarEstado('enemy_dado', DURACAO.enemy_dado)
        break

      case 'enemy_dado': {
        const nextPv = Math.max(0, playerPv - d.enemyDmg)
        setPlayerPv(nextPv)
        if (d.enemyDmg > 0) setDamageFloat({ value: d.enemyDmg, target: 'player' })

        addLogWithDelay('enemy', `${enemy.name} ataca (${d.enemyBreakdown}) vs sua FD ${d.enemyFD} = ${d.enemyDmg} dano`, { name: enemy.name, initial: enemyInitial, side: 'enemy' })

        if (d.enemyDmg > 0) {
          addTrashWithDelay('attack_hit')
        } else {
          addTrashWithDelay('attack_miss')
        }

        if (nextPv <= 0) {
          addSystemLog('💀 Você foi derrotado!')
          setTimeout(() => endMatch('defeat'), 600)
          return
        }

        if (nextPv <= isR && !saidNearDeath.current) {
          saidNearDeath.current = true
          addTrashWithDelay('player_near_death')
        }

        avancarEstado('enemy_onoma', DURACAO.enemy_onoma)
        break
      }

      case 'enemy_onoma':
        setDamageFloat(null)
        avancarEstado('enemy_trash', DURACAO.enemy_trash)
        break

      case 'enemy_trash':
        avancarEstado('fim_turno', DURACAO.fim_turno)
        break

      case 'fim_turno':
        turnoEstadoRef.current = 'idle'
        setTurnoEstado('idle')
        break
    }
  }

  const handleAttack = (powerCost = 0) => {
    if (turnoEstadoRef.current !== 'idle') return

    // Calcular TUDO antes de começar
    const wBonus = Number(enemy?.weapon_damage) || 0
    const pBonus = Number(powerCost) * 2
    const fa = calcFA(mode, getPlayerSheet(), wBonus)
    const fd = calcFD(getEnemySheet(), true)
    const baseDmg = Math.max(0, calcDamage(Number(fa.value)||0, Number(fd.value)||0))
    const playerDmg = baseDmg + pBonus

    const eMode = enemy.preferred_mode || 'fists'
    const eBonus = Number(enemy.weapon_damage) || 0
    const eFA = calcFA(eMode, getEnemySheet(), eBonus)
    const eFD = calcFD(getPlayerSheet(), true)
    const enemyDmg = Math.max(0, calcDamage(Number(eFA.value)||0, Number(eFD.value)||0))

    dadosTurnoRef.current = {
      playerRoll: fa.roll,
      playerDmg,
      playerBreakdown: fa.breakdown,
      playerFD: fd.value,
      playerDado: fa.roll,
      powerCost,
      powerBonus: pBonus,
      enemyRoll: eFA.roll,
      enemyDmg,
      enemyBreakdown: eFA.breakdown,
      enemyFD: eFD.value,
      enemyDado: eFA.roll,
      enemyMode: eMode,
    }

    if (powerCost > 0) setPlayerPm(p => Math.max(0, p - powerCost))

    avancarEstado('player_dado', DURACAO.player_dado)
  }

  if (!enemy) return null

  if (showPowerSelect) {
    return (
      <div className="arena-combat arena-container">
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

  const renderBubble = (type, text, sender) => {
    const avatarClass = type === 'player' ? 'arena-chat-avatar--player' : type === 'trash' ? 'arena-chat-avatar--trash' : 'arena-chat-avatar--enemy'
    const bubbleClass = type === 'player' ? 'arena-chat-bubble--player' : type === 'trash' ? 'arena-chat-bubble--trash' : 'arena-chat-bubble--enemy'
    const msgClass = type === 'player' ? 'arena-chat-msg arena-chat-msg--player' : 'arena-chat-msg'

    if (text === '__typing__') {
      return (
        <motion.div key={Math.random()} className={msgClass} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div className={`arena-chat-avatar ${avatarClass}`}>{sender?.initial || '?'}</div>
          <div className="arena-chat-bubble arena-chat-typing">
            <div className="arena-chat-dot" /><div className="arena-chat-dot" /><div className="arena-chat-dot" />
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div key={Math.random()} className={msgClass} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className={`arena-chat-avatar ${avatarClass}`}>{sender?.initial || '?'}</div>
        <div className={`arena-chat-bubble ${bubbleClass}`}>{text}</div>
      </motion.div>
    )
  }

  return (
    <div className="arena-combat arena-container">
      <AnimatePresence>
        {showFlash && (
          <motion.div className="arena-flash"
            initial={{ opacity: 0.4 }} animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTurno && (
          <motion.div className="arena-enemy-turn-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.span className="arena-enemy-turn-text"
              animate={{ opacity: [1, 0.2, 1, 0.2, 1] }}
              transition={{ duration: 1.5 }}>=== VEZ DO INIMIGO ===</motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {diceValue && <DiceSlot finalValue={diceValue} />}
      </AnimatePresence>

      <AnimatePresence>
        {showOnoma && (
          <motion.div className="arena-onomatopeia"
            initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.175, 0.885, 0.32, 1.275] }}>
            {getOnomatopeia(showOnoma)}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="arena-combat-header">
        <button className="arena-back" onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); store.endMatch('defeat'); onNavigate('lobby') }}>← lobby</button>
        <h2 className="arena-combat-vs">{sheet?.sheet_name} vs {enemy.name}</h2>
      </div>

      <div className="arena-combat-grid">
        <div className="arena-combat-side">
          <h3>{sheet?.sheet_name}</h3>
          <div className="arena-bar-wrap">
            <span>PV {playerPv}/{pvMax}</span>
            <div className="arena-bar">
              <div className={`arena-bar-fill ${nearDeath ? 'arena-bar-fill--danger-pulse' : 'arena-bar-green'}`}
                style={{ '--bar-pct': `${pvPct}%` }} />
            </div>
          </div>
          <div className="arena-bar-wrap">
            <span>PM</span>
            <div className="arena-pm-icons">{Array.from({ length: pmMax }, (_, i) => <span key={i} className={`arena-pm-dot ${i < playerPm ? 'arena-pm-dot--on' : ''}`}>◆</span>)}</div>
          </div>
          <div className="arena-mode-label">Modo: {MODE_ICONS[mode]} {MODE_LABELS[mode]}</div>
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
              <div className="arena-bar-fill arena-bar-red"
                style={{ '--bar-pct': `${epvPct}%` }} />
            </div>
          </div>
          <div className="arena-mode-label">Modo: {MODE_ICONS[enemy.preferred_mode || 'fists']} {MODE_LABELS[enemy.preferred_mode || 'fists']}</div>
        </div>
      </div>

      <div className="arena-log-area">
        <div className="arena-log-feed">
          {(Array.isArray(log) ? log : []).map(l => {
            if (l.type === 'system') {
              return (
                <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <div className="arena-chat-bubble arena-chat-bubble--system">{l.text}</div>
                </motion.div>
              )
            }
            return renderBubble(l.type, l.text, l.sender)
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
        <button className="arena-btn-flee" onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); store.endMatch('defeat'); onNavigate('lobby') }} disabled={animating}>FUGIR</button>
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
