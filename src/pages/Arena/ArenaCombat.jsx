import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useArenaStore } from './store/useArenaStore'
import { calcFA, calcFD, calcDamage, calcInitiative } from '../LDI/engine/combat'
import { POWERS_BY_ELEMENTAL } from '../LDI/data/powersData'
import trashTalkNPCs from './data/trash_talk.json'
import { sfx } from '../../lib/sfx'
import './Arena.css'

const ONOMATOPEIAS_FISTS = ['POW!', 'WHAM!', 'CRACK!']
const ONOMATOPEIAS_ARMED = ['SLASH!', 'CLANG!', 'THWACK!']
const ONOMATOPEIAS_POWER = ['BOOM!', 'ZAP!', 'FWOOSH!']
const MODE_ICONS = { fists: '✊', armed: '⚔️', power: '⚡' }
const MODE_LABELS = {}

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
  const anim = phase === 'rolling'
    ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.05, 0.95, 1] }
    : phase === 'landing' ? { scale: [1.4, 0.9, 1.1, 1], rotate: 0 } : { scale: 1, rotate: 0 }
  const trans = phase === 'rolling' ? { duration: 0.15, repeat: Infinity } : { duration: 0.4, ease: 'easeOut' }

  return (
    <motion.div className="arena-dice-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <motion.div className={numberClass} animate={anim} transition={trans}>🎲 {display}</motion.div>
      {phase === 'showing' && (
        <motion.div className={labelClass} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {isCritical ? t('games.arena.dice_critico') : t('games.arena.dice_resultado', { n: finalValue })}
        </motion.div>
      )}
    </motion.div>
  )
}

function OnomaPopup({ word, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900)
    return () => clearTimeout(t)
  }, [])
  return (
    <motion.div
      className="arena-onomatopeia"
      initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.35, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      {word}
    </motion.div>
  )
}

export default function ArenaCombat({ onNavigate }) {
  const { t } = useLanguage()
  MODE_LABELS.fists = t('games.arena.modo_fists')
  MODE_LABELS.armed = t('games.arena.modo_armed')
  MODE_LABELS.power = t('games.arena.modo_power')
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

  const [diceOn, setDiceOn] = useState(null)
  const [onomaCurrent, setOnomaCurrentState] = useState(null)
  const [turnOverlay, setTurnOverlay] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [atkDisabled, setAtkDisabled] = useState(false)
  const [somAtivo, setSomAtivo] = useState(sfx.enabled)

  const dadosRef = useRef({})
  const timerRef = useRef(null)
  const pvRef = useRef({ player: playerPv, enemy: enemyPv })
  const stepRef = useRef(-1)
  const saidNearDeath = useRef(false)
  const saidEnemyLow = useRef(false)
  const chatQueue = useRef(Promise.resolve())
  const npcPersonality = useRef(null)

  const logRef = useRef(null)
  const logAreaRef = useRef(null)
  const elemental = sheet?.elemental || 'neutro'
  const availablePowers = POWERS_BY_ELEMENTAL[elemental] || POWERS_BY_ELEMENTAL.neutro
  const playerInitial = (sheet?.sheet_name || 'V')[0].toUpperCase()
  const enemyInitial = (enemy?.name || 'I')[0].toUpperCase()

  useEffect(() => { pvRef.current = { player: playerPv, enemy: enemyPv } }, [playerPv, enemyPv])

  useEffect(() => {
    if (!enemy) { onNavigate('lobby'); return }
    const pInit = calcInitiative(sheet)
    const eInit = calcInitiative({ attributes: enemy.stats })
    const eName = t('games.arena.enemy_names.' + enemy.id) || enemy.name
    setLog([{ type: 'system', text: t('games.arena.log_iniciativa', { pInit, enemyName: eName, eInit }), id: Date.now() }])
    saidNearDeath.current = false
    saidEnemyLow.current = false
    npcPersonality.current = trashTalkNPCs[Math.floor(Math.random() * trashTalkNPCs.length)]
    setTimeout(() => addTrashWithDelay('battle_start'), 800)
  }, [])

  // Auto-scroll — sempre acompanha a conversa
  const scrollLogToBottom = useCallback(() => {
    if (logAreaRef.current) {
      logAreaRef.current.scrollTop = logAreaRef.current.scrollHeight
    }
    logRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])
  useEffect(() => { scrollLogToBottom() }, [log, scrollLogToBottom])
  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current) } }, [])

  const addLogWithDelay = (type, text, sender, extra = {}) => {
    const msgId = Date.now() + Math.random()
    const isCard = type === 'attack_card'
    const typingTime = isCard ? 400 : Math.min(300 + text.length * 18, 1800)
    chatQueue.current = chatQueue.current.then(async () => {
      if (!isCard) {
        setLog(l => [...l, { type, text: '__typing__', id: msgId + '-typing', sender }])
        await delay(typingTime)
        setLog(l => l.map(m => m.id === msgId + '-typing' ? { ...m, text, id: msgId } : m))
      } else {
        await delay(typingTime)
        setLog(l => [...l, { type: 'attack_card', id: msgId, sender, ...extra }])
      }
    })
  }

  const addTrashWithDelay = (category) => {
    const npc = npcPersonality.current
    // Try i18n first, fallback to JSON
    let talk
    if (npc) {
      const i18nTalk = t('games.arena.trash_talk_npc.' + npc.id + '.' + category, { returnObjects: true })
      talk = Array.isArray(i18nTalk) && i18nTalk.length ? i18nTalk : npc?.trash_talk?.[category]
    }
    if (!talk) talk = enemy?.trash_talk?.[category]
    const line = pickTrash(talk)
    if (!line) return
    const senderName = (npc && t('games.arena.npc_names.' + npc.id)) || (enemy && t('games.arena.enemy_names.' + enemy.id)) || enemy?.name || '???'
    chatQueue.current = chatQueue.current.then(async () => {
      await delay(600)
      const text = `${senderName}: ${line}`
      const typingTime = Math.min(300 + text.length * 18, 1800)
      setLog(l => [...l, { type: 'trash', text: '__typing__', id: Date.now() + '-typing', sender: { name: senderName, initial: (senderName[0] || '?').toUpperCase(), side: 'enemy' } }])
      await delay(typingTime)
      setLog(l => l.map(m => m.text === '__typing__' && m.type === 'trash' ? { ...m, text, id: Date.now() } : m))
    })
  }

  const addSystemLog = (text) => {
    setLog(l => [...l, { type: 'system', text, id: Date.now() }])
  }

  const togglePower = (id) => {
    setSelectedPowers(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev)
  }

  const cleanup = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setDiceOn(null)
    setOnomaCurrentState(null)
    setTurnOverlay(false)
    setFlashOn(false)
    setAtkDisabled(false)
    setDamageFloat(null)
  }

  const endMatch = (result) => {
    cleanup()
    if (result === 'victory') sfx.win()
    else sfx.lose()
    store.endMatch(result)
    onNavigate('victory')
  }

  const fireOnoma = useCallback((mode) => {
    const word = getOnomatopeia(mode)
    setOnomaCurrentState({ id: Date.now() + Math.random(), word })
  }, [])

  const getEnemySheet = () => {
    const stats = enemy?.stats || {}
    return { attributes: { F: Number(stats.F)||0, H: Number(stats.H)||1, R: Number(stats.R)||0, A: Number(stats.A)||0, PdF: Number(stats.PdF)||0 } }
  }

  const getPlayerSheet = () => {
    const a = sheet?.attributes || {}
    return { attributes: { F: Number(a.F)||0, H: Number(a.H)||0, R: Number(a.R)||0, A: Number(a.A)||0, PdF: Number(a.PdF)||0 } }
  }

  const nextStep = useCallback(() => {
    const s = stepRef.current
    const d = dadosRef.current
    const pv = pvRef.current

    switch (s) {
      // 0 → jogador jogou dado, mostra resultado, atualiza HP inimigo, checa morte
      case 0: {
        const nEPv = Math.max(0, pv.enemy - d.pDmg)
        setEnemyPv(nEPv)
        if (d.pDmg > 0) setDamageFloat({ value: d.pDmg, target: 'enemy' })

        const powerName = d.pCost > 0 ? (selectedPowers.map(id => (t('games.arena.powers.' + elemental + '.' + id + '.name') || availablePowers.find(x => x.id === id)?.name || id))[0]) : null
        const onoma = getOnomatopeia(mode)
        addLogWithDelay('attack_card', '', { name: sheet?.sheet_name, initial: playerInitial, side: 'player' }, {
          side: 'player', breakdown: d.pBreak, fd: d.pFD, dmg: d.pDmg,
          powerName, powerBonus: d.pBonus, diceRoll: d.pRoll, onoma
        })

        if (d.pRoll === 6) addTrashWithDelay('take_critical')
        else if (d.pDmg > 0) addTrashWithDelay('take_damage')

        if (nEPv <= 0) { addSystemLog(t('games.arena.log_vitoria')); setTimeout(() => endMatch('victory'), 600); return }

        if (nEPv <= (Number(enemy.pv_max) || 10) * 0.3 && !saidEnemyLow.current) {
          saidEnemyLow.current = true; addTrashWithDelay('enemy_near_death')
        }

        setDiceOn(null)
        fireOnoma(mode)
        stepRef.current = 1
        chatQueue.current.then(() => { timerRef.current = setTimeout(nextStep, 1800) })
        break
      }

      // 1 → onomatopeia do player terminou, mostra overlay VEZ DO INIMIGO
      case 1: {
        setDamageFloat(null)
        setTurnOverlay(true)
        stepRef.current = 2
        timerRef.current = setTimeout(nextStep, 2800)
        break
      }

      // 2 → overlay terminou, mostra dado do inimigo
      case 2: {
        setTurnOverlay(false)
        setDiceOn(d.eDado)
        stepRef.current = 3
        timerRef.current = setTimeout(nextStep, 2200)
        break
      }

      // 3 → dado do inimigo terminou, atualiza HP player, checa morte
      case 3: {
        const nPPv = Math.max(0, pv.player - d.eDmg)
        setPlayerPv(nPPv)
        if (d.eDmg > 0) setDamageFloat({ value: d.eDmg, target: 'player' })

        const onoma = getOnomatopeia(d.eMode)
        const eName = t('games.arena.enemy_names.' + enemy.id) || enemy.name
        addLogWithDelay('attack_card', '', { name: eName, initial: enemyInitial, side: 'enemy' }, {
          side: 'enemy', breakdown: d.eBreak, fd: d.eFD, dmg: d.eDmg,
          diceRoll: d.eRoll, onoma
        })
        if (d.eDmg > 0) addTrashWithDelay('attack_hit')
        else addTrashWithDelay('attack_miss')

        if (nPPv <= 0) { addSystemLog(t('games.arena.log_derrota')); setTimeout(() => endMatch('defeat'), 600); return }

        if (nPPv <= isR && !saidNearDeath.current) {
          saidNearDeath.current = true; addTrashWithDelay('player_near_death')
        }

        setDiceOn(null)
        setFlashOn(false)
        fireOnoma(d.eMode)
        stepRef.current = 4
        chatQueue.current.then(() => { timerRef.current = setTimeout(nextStep, 1800) })
        break
      }

      // 4 → onomatopeia do inimigo terminou, mostra trash talk
      case 4: {
        setDamageFloat(null)
        stepRef.current = 5
        timerRef.current = setTimeout(nextStep, 2000)
        break
      }

      // 5 → trash terminou, volta ao idle
      case 5: {
        cleanup()
        stepRef.current = -1
        break
      }
    }
  }, [mode, selectedPowers, availablePowers, sheet, enemy, playerInitial, enemyInitial, isR])

  const handleAttack = (powerCost = 0) => {
    if (stepRef.current >= 0) return
    sfx.click()

    const wBonus = Number(enemy?.weapon_damage) || 0
    const pBonus = Number(powerCost) * 2
    const fa = calcFA(mode, getPlayerSheet(), wBonus)
    const fd = calcFD(getEnemySheet(), true)
    const pDmg = Math.max(0, calcDamage(Number(fa.value)||0, Number(fd.value)||0)) + pBonus

    const eMode = enemy.preferred_mode || 'fists'
    const eBonus = Number(enemy.weapon_damage) || 0
    const eFA = calcFA(eMode, getEnemySheet(), eBonus)
    const eFD = calcFD(getPlayerSheet(), true)
    const eDmg = Math.max(0, calcDamage(Number(eFA.value)||0, Number(eFD.value)||0))

    dadosRef.current = {
      pRoll: fa.roll, pDmg, pBreak: fa.breakdown, pFD: fd.value, pDado: fa.roll,
      pCost: powerCost, pBonus,
      eRoll: eFA.roll, eDmg, eBreak: eFA.breakdown, eFD: eFD.value, eDado: eFA.roll, eMode,
    }

    if (powerCost > 0) setPlayerPm(p => Math.max(0, p - powerCost))

    setAtkDisabled(true)
    setDiceOn(fa.roll)
    stepRef.current = 0
    timerRef.current = setTimeout(nextStep, 2200)
  }

  if (!enemy) return null

  if (showPowerSelect) {
    return (
      <div className="arena-combat arena-container">
        <div className="arena-power-select">
          <h2 className="arena-power-title">{t('games.arena.combat_power_titulo')}</h2>
          <p className="arena-power-sub">{t('games.arena.combat_power_sub', { elemental })}</p>
          <div className="arena-power-grid">
            {availablePowers.map(p => (
              <motion.button key={p.id}
                className={`arena-power-card ${selectedPowers.includes(p.id) ? 'arena-power-card--selected' : ''}`}
                onClick={() => { sfx.click(); togglePower(p.id) }}
                whileHover={{ x: 0 }}
              >
                <div className="arena-power-card-icon">⚡</div>
                <div className="arena-power-card-body">
                  <div className="arena-power-header">
                    <span className="arena-power-header-name">{t('games.arena.powers.' + elemental + '.' + p.id + '.name') || p.name}</span>
                    <span className="arena-power-header-cost">⚡ {p.cost} PM</span>
                  </div>
                  <p>{t('games.arena.powers.' + elemental + '.' + p.id + '.desc') || p.desc}</p>
                </div>
                <span className="arena-power-card-check">✓</span>
              </motion.button>
            ))}
          </div>
          <div className="arena-power-footer">
            <span className="arena-power-counter">
              {t('games.arena.selecionados', { n: selectedPowers.length })}
            </span>
            <button className="arena-btn-primary" onClick={() => { sfx.click(); setShowPowerSelect(false) }}>
              {selectedPowers.length === 0 ? t('games.arena.combat_entrar_sem') : t('games.arena.combat_entrar_com', { n: selectedPowers.length })}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pvPct = Math.max(0, (playerPv / pvMax) * 100)
  const epvPct = Math.max(0, (enemyPv / (Number(enemy.pv_max) || 10)) * 100)
  const pmPct = Math.max(0, (playerPm / pmMax) * 100)
  const nearDeath = playerPv <= isR

  const elemCores = {
    fogo: '#FF4500', agua: '#00B4D8', terra: '#8B6914', ar: '#A8DADC',
    eletrico: '#F5A623', trevas: '#9B59B6', neutro: '#00B4D8',
  }
  const playerElemCor = elemCores[elemental] || '#00B4D8'
  const enemyElemCor = elemCores[enemy.elemental] || '#cc4444'
  const MODE_EMOJI = { fists: '✊', armed: '⚔️', power: '⚡' }

  return (
    <div className="arena-combat arena-container">

      <AnimatePresence>
        {flashOn && (
          <motion.div className="arena-flash" initial={{ opacity: 0.4 }} animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {turnOverlay && (
          <motion.div className="arena-enemy-turn-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.span className="arena-enemy-turn-text" animate={{ opacity: [1, 0.2, 1, 0.2, 1] }} transition={{ duration: 1.5 }}>
              {t('games.arena.combat_vez_inimigo')}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {damageFloat && (
          <motion.div className={`arena-dmg-float arena-dmg-float--${damageFloat.target}`}
            initial={{ y: 0, opacity: 1 }} animate={{ y: -30, opacity: 0 }} transition={{ duration: 0.8 }}>
            -{damageFloat.value}
          </motion.div>
        )}
      </AnimatePresence>

      {/* player strip */}
      <div className="arena-fighter-strip" style={{ '--elem-cor': playerElemCor }}>
        <div className="arena-fighter-avatar">
          {playerInitial}
          <span className="arena-fighter-avatar-elem" style={{ background: playerElemCor }} />
        </div>
        <div className="arena-fighter-info">
          <div className="arena-fighter-name">{sheet?.sheet_name}</div>
          <div className="arena-fighter-bars">
            <div className="arena-fighter-bar-row">
              <span className="arena-fighter-bar-label">{t('games.arena.hp')}</span>
              <div className="arena-fighter-bar-track">
                <div className={`arena-fighter-bar-fill ${nearDeath ? 'arena-fighter-bar-fill--danger' : 'arena-fighter-bar-fill--hp-player'}`}
                  style={{ '--bar-pct': `${pvPct}%` }} />
              </div>
              <span className="arena-fighter-bar-val">{playerPv}/{pvMax}</span>
            </div>
            <div className="arena-fighter-bar-row">
              <span className="arena-fighter-bar-label">{t('games.arena.mp')}</span>
              <div className="arena-fighter-bar-track">
                <div className="arena-fighter-bar-fill arena-fighter-bar-fill--pm"
                  style={{ '--bar-pct': `${pmPct}%` }} />
              </div>
              <span className="arena-fighter-bar-val">{playerPm}/{pmMax}</span>
            </div>
          </div>
          {nearDeath && <div className="arena-near-death-strip">{t('games.arena.perto_morte')}</div>}
        </div>
      </div>

      {/* vs bar */}
      <div className="arena-vs-bar">
        <button className="arena-vs-bar-back" onClick={() => { cleanup(); store.endMatch('defeat'); onNavigate('lobby') }}>{t('games.arena.btn_lobby')}</button>
        <div className="arena-vs-bar-line" />
        <span className="arena-vs-bar-label">VS</span>
        <div className="arena-vs-bar-line" />
        <button className="arena-sfx-toggle" onClick={() => { sfx.toggle(); setSomAtivo(sfx.enabled) }} title={t('games.arena.sfx_toggle')}>
          {sfx.enabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* chat log */}
      <div className="arena-log-area" ref={logAreaRef}>
        {(Array.isArray(log) ? log : []).map(l => {
          if (l.type === 'system') return (
            <motion.div key={l.id} className="arena-msg-wrap arena-msg-wrap--system"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="arena-bubble arena-bubble--system">{l.text}</span>
            </motion.div>
          )

          if (l.type === 'attack_card') {
            const isPlayer = l.side === 'player'
            return (
              <motion.div key={l.id} className={`arena-msg-wrap ${isPlayer ? 'arena-msg-wrap--player' : ''}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`arena-msg-avatar ${isPlayer ? 'arena-msg-avatar--player' : 'arena-msg-avatar--enemy'}`}>
                  {isPlayer ? playerInitial : enemyInitial}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className={`arena-attack-card arena-attack-card--${isPlayer ? 'player' : 'enemy'}`}>
                    <div className="arena-attack-card-header">
                      {isPlayer ? t('games.arena.card_ataque') : t('games.arena.card_ataque_inimigo')}
                    </div>
                    <div className="arena-attack-card-body">
                      <div className="arena-attack-card-row">
                        <span className="arena-attack-card-key">{t('games.arena.fa_label')}</span>
                        <span className="arena-attack-card-val">{l.breakdown}</span>
                      </div>
                      <div className="arena-attack-card-row">
                        <span className="arena-attack-card-key">{t('games.arena.fd_label')}</span>
                        <span className="arena-attack-card-val">{l.fd}</span>
                      </div>
                      {l.diceRoll != null && (
                        <div className="arena-attack-card-row">
                          <span className="arena-attack-card-key">🎲</span>
                          <span className="arena-attack-card-val" style={{ color: l.diceRoll === 6 ? '#F5A623' : '#888', fontSize: 14, fontWeight: 700 }}>
                            {l.diceRoll}
                          </span>
                        </div>
                      )}
                      {l.powerName && (
                        <div className="arena-attack-card-row">
                          <span className="arena-attack-card-key">{t('games.arena.card_poder')}</span>
                          <span className="arena-attack-card-val">⚡ {l.powerName} +{l.powerBonus}</span>
                        </div>
                      )}
                      <div className="arena-attack-card-divider" />
                      <div className="arena-attack-card-damage">
                        <span className="arena-attack-card-damage-label">{t('games.arena.card_dano')}</span>
                        <span className={`arena-attack-card-damage-val ${l.dmg === 0 ? 'arena-attack-card-damage-val--zero' : ''}`}>
                          {l.dmg === 0 ? t('games.arena.card_bloqueado') : l.dmg}
                        </span>
                      </div>
                    </div>
                  </div>
                  {l.onoma && (
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
                      style={{
                        textAlign: 'center',
                        fontFamily: "'Impact','Arial Black',sans-serif",
                        fontSize: 22,
                        color: '#F5A623',
                        textShadow: '2px 2px 0 #8B0000, 0 0 16px rgba(245,166,35,0.6)',
                        letterSpacing: 3,
                        padding: '4px 0',
                      }}
                    >
                      {l.onoma}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          }

          const isPlayer = l.type === 'player'
          const isTrash = l.type === 'trash'
          const avClass = isPlayer ? 'arena-msg-avatar--player' : isTrash ? 'arena-msg-avatar--trash' : 'arena-msg-avatar--enemy'
          const bbClass = isPlayer ? 'arena-bubble--player' : isTrash ? 'arena-bubble--trash' : 'arena-bubble--enemy'

          if (l.text === '__typing__') return (
            <motion.div key={l.id} className={`arena-msg-wrap ${isPlayer ? 'arena-msg-wrap--player' : ''}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`arena-msg-avatar ${avClass}`}>{l.sender?.initial || '?'}</div>
              <div className={`arena-bubble ${bbClass}`}>
                <div className="arena-typing-dots">
                  <div className="arena-typing-dot" /><div className="arena-typing-dot" /><div className="arena-typing-dot" />
                </div>
              </div>
            </motion.div>
          )

          return (
            <motion.div key={l.id} className={`arena-msg-wrap ${isPlayer ? 'arena-msg-wrap--player' : ''}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`arena-msg-avatar ${avClass}`}>{l.sender?.initial || '?'}</div>
              <div className={`arena-bubble ${bbClass}`}>{l.text}</div>
            </motion.div>
          )
        })}
        <div ref={logRef} />
      </div>

      {/* inimigo strip */}
      <div className="arena-fighter-strip arena-fighter-strip--enemy" style={{ '--elem-cor': enemyElemCor }}>
        <div className="arena-fighter-avatar arena-fighter-avatar--enemy"
          style={{ borderColor: `${enemyElemCor}66`, background: `radial-gradient(circle at 35% 35%, ${enemyElemCor}33, #0a0a0a)` }}>
          {enemyInitial}
          <span className="arena-fighter-avatar-elem" style={{ background: enemyElemCor }} />
        </div>
        <div className="arena-fighter-info">
          <div className="arena-fighter-name">{t('games.arena.enemy_names.' + enemy.id) || enemy.name}</div>
          <div className="arena-fighter-bars">
            <div className="arena-fighter-bar-row">
              <span className="arena-fighter-bar-label">{t('games.arena.hp')}</span>
              <div className="arena-fighter-bar-track">
                <div className="arena-fighter-bar-fill arena-fighter-bar-fill--hp-enemy"
                  style={{ '--bar-pct': `${epvPct}%` }} />
              </div>
              <span className="arena-fighter-bar-val">{enemyPv}/{Number(enemy.pv_max)||10}</span>
            </div>
          </div>
          <div className="arena-fighter-mode">{MODE_EMOJI[enemy.preferred_mode||'fists']} {MODE_LABELS[enemy.preferred_mode||'fists']}</div>
        </div>
      </div>

      {/* actions */}
      <div className="arena-actions-bar">
        <div className="arena-mode-btns">
          {Object.entries(MODE_ICONS).map(([m, icon]) => (
            <button key={m} className={`arena-mode-btn ${mode === m ? 'arena-mode-btn--active' : ''}`}
              onClick={() => { sfx.click(); setMode(m) }} disabled={atkDisabled}>{icon} {MODE_LABELS[m]}</button>
          ))}
        </div>
        {mode === 'power' && selectedPowers.length > 0 && (
          <div className="arena-power-attacks">
            {selectedPowers.map(id => {
              const fp = availablePowers.find(x => x.id === id)
              if (!fp) return null
              const can = playerPm >= (fp.cost || 1) && !atkDisabled
              return <button key={id} className="arena-power-btn" disabled={!can}
                onClick={() => { sfx.click(); handleAttack(fp.cost || 1) }}>{t('games.arena.powers.' + elemental + '.' + id + '.name') || fp.name} ⚡{fp.cost} PM</button>
            })}
          </div>
        )}
        <div className="arena-actions-row">
          <button className="arena-exit-btn" onClick={() => { sfx.click(); cleanup(); store.endMatch('defeat'); onNavigate('lobby') }} disabled={atkDisabled}>
            ✕ {t('games.arena.btn_sair')}
          </button>
          <button className="arena-btn-flee" onClick={() => { sfx.click(); cleanup(); store.endMatch('defeat'); onNavigate('lobby') }} disabled={atkDisabled}>{t('games.arena.btn_fugir')}</button>
          <button className="arena-attack-btn" onClick={() => handleAttack()} disabled={atkDisabled}>
            {atkDisabled ? '...' : t('games.arena.btn_atacar')}
          </button>
        </div>
      </div>

    </div>
  )
}
