import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePPStore } from '../store/usePPStore'
import { getCaso } from '../data/resolver'
import { getInimigo } from '../data/inimigos'
import { useAuth } from '../../../context/AuthContext'
import { t } from '../data/pp-i18n'

const rollD6 = () => Math.floor(Math.random() * 6) + 1
const delay = ms => new Promise(r => setTimeout(r, ms))

function DicePP({ value, onDone }) {
  const [phase, setPhase] = useState('rolling')
  const [n, setN] = useState('?')
  useEffect(() => {
    let f; const s = Date.now()
    function anim() {
      if (Date.now() - s < 800) { setN(Math.floor(Math.random() * 6) + 1); f = requestAnimationFrame(anim) }
      else { setPhase('landing'); setN(value); setTimeout(() => { setPhase('showing'); setTimeout(onDone, 1200) }, 200) }
    }
    f = requestAnimationFrame(anim)
    return () => cancelAnimationFrame(f)
  }, [])
  const crit = value === 6
  const cls = phase === 'rolling' ? 'pp-dice-number pp-dice-rolling' : `pp-dice-number pp-dice-showing${crit ? ' pp-dice-crit' : ''}`
  return (
    <motion.div className="pp-dice-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <motion.div className={cls} animate={phase === 'rolling' ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.05, 0.95, 1] } : { scale: 1 }} transition={phase === 'rolling' ? { duration: 0.15, repeat: Infinity } : {}}>🎲 {n}</motion.div>
      {phase === 'showing' && <motion.div className={`pp-dice-label${crit ? ' pp-dice-label--crit' : ''}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{crit ? t('pt', 'batalha.critico') : t('pt', 'batalha.resultado', { valor: value })}</motion.div>}
    </motion.div>
  )
}

export default function Confronto() {
  const { user } = useAuth()
  const store = usePPStore()
  const caso = getCaso(store.casoAtivo)

  const [playerHp, setPlayerHp] = useState(store.hp || 30)
  const [eHp, setEHp] = useState(0)
  const [log, setLog] = useState([])
  const [acabou, setAcabou] = useState(false)
  const [atkDisabled, setAtkDisabled] = useState(false)
  const [diceOn, setDiceOn] = useState(null)
  const [onoma, setOnoma] = useState(null)
  const [flashOn, setFlashOn] = useState(false)
  const [dmgFloat, setDmgFloat] = useState(null)
  const diceRef = useRef(null)
  const stepRef = useRef(-1)
  const timerRef = useRef(null)
  const dadosRef = useRef({})

  if (!caso) { store.setFase('mapa'); return null }

  const inimigo = caso.confronto?.inimigo_id ? getInimigo(caso.confronto.inimigo_id) : { nome: 'Desconhecido', hp: 20, atk: 3, def: 1 }
  const ehInterrogatorio = caso.confronto?.tipo === 'interrogatorio'
  const pHpMax = 30
  const eHpMax = inimigo.hp

  useEffect(() => { if (eHp === 0) setEHp(eHpMax) }, [])

  const showDice = (v) => new Promise(res => { diceRef.current = res; setDiceOn(v) })
  const addLog = (side, text) => setLog(l => [...l, { side, text, id: Date.now() }])

  const cleanup = () => { if (timerRef.current) clearTimeout(timerRef.current); setAtkDisabled(false); setDiceOn(null); setOnoma(null); setFlashOn(false); setDmgFloat(null); stepRef.current = -1 }

  const nextStep = async () => {
    const s = stepRef.current
    const d = dadosRef.current
    switch (s) {
      case 0: {
        const nEhp = Math.max(0, eHp - d.pDmg); setEHp(nEhp)
        if (d.pDmg > 0) { setDmgFloat({ v: d.pDmg, t: 'enemy' }); await delay(800); setDmgFloat(null) }
        addLog('player', t('pt', 'batalha.voce_ataca', { dano: d.pDmg }))
        setDiceOn(null); setOnoma('fists')
        if (nEhp <= 0) { addLog('system', t('pt', 'batalha.vitoria_msg')); await delay(800); cleanup(); store.setFase('dossier'); return }
        stepRef.current = 1; timerRef.current = setTimeout(nextStep, 1000)
        break
      }
      case 1: {
        setOnoma(null); setFlashOn(true)
        const nPhp = Math.max(0, playerHp - d.eDmg)
        if (d.eDmg > 0) setPlayerHp(nPhp)
        stepRef.current = 2; timerRef.current = setTimeout(nextStep, 400)
        break
      }
      case 2: {
        await showDice(d.eRoll); setDiceOn(null); setFlashOn(false); setOnoma('fists')
        addLog('enemy', t('pt', 'batalha.inimigo_ataca_log', { nome: inimigo.nome, dano: d.eDmg }))
        if (d.eDmg > 0) { setDmgFloat({ v: d.eDmg, t: 'player' }); await delay(800); setDmgFloat(null) }
        const finalPHp = Math.max(0, playerHp - d.eDmg); setPlayerHp(finalPHp)
        if (finalPHp <= 0) {
          store.danoHP(15); addLog('system', t('pt', 'batalha.derrota_msg'))
          await delay(800); cleanup()
          if (user) store.saveToCloud(user.id)
          return
        }
        setOnoma(null); cleanup(); setAtkDisabled(false)
        break
      }
    }
  }

  const handleAtacar = async () => {
    if (atkDisabled) return
    setAtkDisabled(true)
    const pDmg = Math.max(0, rollD6() + 2 - inimigo.def)
    const eDmg = Math.max(0, rollD6() + inimigo.atk - 2)
    const pRoll = rollD6(); const eRoll = rollD6()
    dadosRef.current = { pDmg, eDmg, eRoll }
    await showDice(pRoll); setDiceOn(null)
    setOnoma('fists')
    stepRef.current = 0; timerRef.current = setTimeout(nextStep, 1000)
  }

  if (ehInterrogatorio) {
    return (
      <div className="pp-container">
        <div className="pp-dossier-header">
          <button className="pp-back" onClick={() => store.setFase('dossier')}>{t('pt', 'local.dossier_voltar')}</button>
          <h2 style={{ color: '#F5A623', margin: 0 }}>Interrogatório: {caso.confronto?.alvo}</h2>
        </div>
        <p style={{ color: '#888', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 20 }}>
          Você confronta {caso.confronto?.alvo} com todas as evidências coletadas. Cada acusação precisa de uma pista do tipo Fio no Caderno de Suspeitas para ser feita.
        </p>
        <button className="pp-btn pp-btn--primary" onClick={() => store.setFase('dossier')}>CONTINUAR</button>
      </div>
    )
  }

  const ppPct = Math.max(0, (playerHp / pHpMax) * 100)
  const epPct = Math.max(0, (eHp / eHpMax) * 100)

  return (
    <div className="pp-container">
      <AnimatePresence>{flashOn && <motion.div className="pp-flash" initial={{ opacity: 0.3 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }} />}</AnimatePresence>
      <AnimatePresence>{diceOn !== null && <DicePP value={diceOn} onDone={() => { if (diceRef.current) { const cb = diceRef.current; diceRef.current = null; cb() } }} />}</AnimatePresence>
      <AnimatePresence>{onoma && <motion.div className="pp-onomatopeia" initial={{ scale: 0.3, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>POW!</motion.div>}</AnimatePresence>

      <div className="pp-dossier-header">
        <button className="pp-back" onClick={() => { cleanup(); store.setFase('dossier') }}>{t('pt', 'local.dossier_voltar')}</button>
        <h2 style={{ color: '#F5A623', margin: 0 }}>VS {inimigo.nome}</h2>
      </div>

      <div className="pp-combat-grid">
        <div className="pp-combat-side">
          <h3>Jack</h3>
          <div className="pp-bar-wrap"><span className="pp-bar-label">{t('pt', 'geral.hp', { hp: playerHp })}/{pHpMax}</span>
            <div className="pp-bar"><div className={`pp-bar-fill ${ppPct < 30 ? 'pp-bar-danger' : 'pp-bar-green'}`} style={{ '--hp-pct': `${ppPct}%` }} /></div>
          </div>
        </div>
        <div className="pp-combat-side pp-combat-enemy">
          <h3>{inimigo.nome}</h3>
          <div className="pp-bar-wrap"><span className="pp-bar-label">{t('pt', 'geral.hp', { hp: eHp })}/{eHpMax}</span>
            <div className="pp-bar"><div className="pp-bar-fill pp-bar-red" style={{ '--hp-pct': `${epPct}%` }} /></div>
          </div>
        </div>
      </div>

      <div className="pp-chat-area">
        <div className="pp-chat-feed">
          {log.slice(-5).map(l => l.side === 'system' ? (
            <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="pp-chat-system">{l.text}</div></motion.div>
          ) : (
            <motion.div key={l.id} className={`pp-chat-msg ${l.side === 'player' ? 'pp-chat-msg--player' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`pp-chat-avatar ${l.side === 'player' ? 'pp-chat-avatar--player' : 'pp-chat-avatar--enemy'}`}>{l.side === 'player' ? 'J' : inimigo.nome[0]}</div>
              <div className={`pp-chat-bubble ${l.side === 'player' ? 'pp-chat-bubble--player' : 'pp-chat-bubble--enemy'}`}>{l.text}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>{dmgFloat && <motion.div className={`pp-dmg-float pp-dmg-float--${dmgFloat.t}`} initial={{ y: 0, opacity: 1 }} animate={{ y: -30, opacity: 0 }} transition={{ duration: 0.8 }}>-{dmgFloat.v}</motion.div>}</AnimatePresence>

      <button className="pp-atk-btn" onClick={handleAtacar} disabled={atkDisabled}>{atkDisabled ? '...' : t('pt', 'batalha.atacar')}</button>
    </div>
  )
}
