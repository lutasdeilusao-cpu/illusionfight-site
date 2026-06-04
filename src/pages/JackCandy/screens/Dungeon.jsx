import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'
import { MONOLOGUES } from '../data/monologues'

function rollD6() { return Math.floor(Math.random() * 6) + 1 }

const INTERVALO = 1200
const MAX_VISIVEIS = 5

const PLAYER_ART = [
  '   __/⟃____\\__',
  '  (  •  - •  )',
  '   ⎛  \\_∧_/  ⎞',
  '  /⎜  /|⎺|\\  ⎝',
  ' ⎛_⎝ ⎠_⎞',
]

const PLAYER_HIT = [
  '   __/⟃____\\__',
  '  (  x  x  )',
  '   ⎛  \\_∧_/  ⎞',
  '  /⎜  /|⎺|\\  ⎝',
  ' ⎛_⎝ ⎠_⎞',
]

export default function Dungeon({ dungeonId }) {
  const store = useJackStore()
  const dungeon = DUNGEONS[dungeonId]
  const [log, setLog] = useState([])
  const [hp, setHp] = useState(store.hpAtual)
  const hpMax = store.hpMax
  const [fase, setFase] = useState('combat')
  const [hitAnim, setHitAnim] = useState(false)
  const [killAnim, setKillAnim] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [restantes, setRestantes] = useState(dungeon?.inimigos || 0)

  const inimigosRef = useRef(dungeon?.inimigos || 0)
  const hpRef = useRef(store.hpAtual)
  const stopRef = useRef(false)
  const danoArmaRef = useRef(store.equipado?.arma?.dano || 0)
  const defesaRef = useRef(store.equipado?.armadura?.dano || 0)

  const totalInimigos = dungeon?.inimigos || 0

  useEffect(() => {
    if (dungeon) {
      setLog([`${dungeon.nome}`])
      store.setMonologo(MONOLOGUES.dungeon1_inicio || '')
    }
    danoArmaRef.current = store.equipado?.arma?.dano || 0
    defesaRef.current = store.equipado?.armadura?.dano || 0
  }, [])

  useEffect(() => {
    if (fase !== 'combat') return
    stopRef.current = false

    const tick = () => {
      if (stopRef.current) return
      if (inimigosRef.current <= 0) return

      const danoArma = danoArmaRef.current
      const defesa = defesaRef.current

      // Player attacks first
      const atq = rollD6() + danoArma
      const def = rollD6()
      const acertou = atq > def

      if (acertou) {
        // Killed! Enemy doesn't attack back
        store.ganharCapangas(1)
        inimigosRef.current--
        setRestantes(inimigosRef.current)
        setKillAnim(true)
        setTimeout(() => setKillAnim(false), 400)
        const restantes = inimigosRef.current
        setProgresso(prev => prev + 1)

        if (restantes <= 0) {
          stopRef.current = true
          setLog(l => [...l, `💥 derrubou! (${atq} vs ${def}) +1 cap`, `✅ todos derrubados!`])
          if (dungeon?.boss) {
            setTimeout(() => {
              const atqB = rollD6() + danoArma
              const defB = rollD6()
              if (atqB > defB) {
                store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
                setLog(l => [...l, `🎯 acertou ${dungeon.boss.nome}!`, `🏆 ${dungeon.boss.nome} derrotado!`])
                setTimeout(() => setFase('vitoria'), 500)
              } else {
                const dmgB = rollD6() + (dungeon.boss?.dmg || 3)
                const novoHp = hpRef.current - dmgB
                hpRef.current = novoHp
                setHp(novoHp)
                if (novoHp <= 0) {
                  store.setMonologo(MONOLOGUES.morre || '')
                  setTimeout(() => setFase('derrota'), 100)
                } else {
                  // Boss second try
                  setTimeout(() => {
                    const atqB2 = rollD6() + danoArma
                    const defB2 = rollD6()
                    if (atqB2 > defB2) {
                      store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
                      setLog(l => [...l, `🎯 acertou ${dungeon.boss.nome}!`, `🏆 derrotado!`])
                      setTimeout(() => setFase('vitoria'), 500)
                    } else {
                      stopRef.current = true
                      store.setMonologo(MONOLOGUES.morre || '')
                      setLog(l => [...l, `❌ errou o boss.`, `💀 você morreu.`])
                      setTimeout(() => setFase('derrota'), 100)
                    }
                  }, 1000)
                }
              }
            }, 1000)
          } else {
            if (hpRef.current <= 0) {
              store.setMonologo(MONOLOGUES.morre || '')
              setFase('derrota')
            } else {
              store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
              setFase('vitoria')
            }
          }
          return
        }

        setLog(l => [...l, `💥 derrubou! (${atq} vs ${def}) +1 cap`])
        return
      }

      // Missed - enemy attacks back (dano capado em 3)
      const dmg = Math.min(3, Math.max(1, rollD6() - defesa))
      const novoHp = hpRef.current - dmg
      hpRef.current = novoHp
      setHp(novoHp)
      setHitAnim(true)
      setTimeout(() => setHitAnim(false), 400)

      if (novoHp <= 0) {
        stopRef.current = true
        setLog(l => [...l, `❌ errou. (${atq} vs ${def})`, `⚔️ capanga ataca! (-${dmg} hp)`, `💀 você morreu.`])
        store.setMonologo(MONOLOGUES.morre || '')
        setTimeout(() => setFase('derrota'), 100)
        return
      }

      setLog(l => [...l, `❌ errou. (${atq} vs ${def})`, `⚔️ capanga ataca! (-${dmg} hp)`])
    }

    const interval = setInterval(tick, INTERVALO)
    return () => { clearInterval(interval); stopRef.current = true }
  }, [fase])

  const playerArt = hitAnim ? PLAYER_HIT : PLAYER_ART
  const pct = totalInimigos > 0 ? Math.round((progresso / totalInimigos) * 100) : 0
  const hpPct = hpMax > 0 ? Math.max(0, Math.round((hp / hpMax) * 100)) : 0
  const hpColor = hpPct > 60 ? '#22C55E' : hpPct > 30 ? '#F5A623' : '#E02020'

  if (fase === 'derrota') {
    return (
      <div className="jdc-dungeon" style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <p style={{ fontSize: '3rem', color: '#8B0000' }}>💀</p>
          <p className="jack-text jack-text--crimson" style={{ fontSize: '1.2rem' }}>você morreu.</p>
          <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ marginTop: '1rem' }}>[ voltar ]</button>
        </motion.div>
      </div>
    )
  }

  if (fase === 'vitoria') {
    return (
      <div className="jdc-dungeon" style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <p style={{ fontSize: '3rem' }}>✅</p>
          <p className="jack-text jack-text--amber" style={{ fontSize: '1.2rem' }}>{dungeon.nome} — completo!</p>
          <p className="jack-text">+{dungeon.dropCap} capangas{dungeon.dropNotas > 0 ? `, +${dungeon.dropNotas} notas` : ''}</p>
          {dungeon.id === 'onibus' && <p className="jack-text jack-text--dim">🏷️ notas desbloqueadas!</p>}
          <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ marginTop: '1rem' }}>[ voltar ]</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="jdc-dungeon">
      {/* Status */}
      <div className="jdc-dungeon-status">
        <span className="jdc-dungeon-status-loc">{dungeon.nome}</span>
        <span className="jdc-dungeon-status-hp">
          <span className="jdc-dungeon-status-hp-label">HP</span>
          <span className="jdc-dungeon-status-hp-val">{hp}/{hpMax}</span>
        </span>
      </div>

      {/* Player + Enemy art side by side */}
      <div className="jdc-dungeon-player-art">
        <motion.div
          className="jdc-dungeon-player-body"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          {playerArt.map((l, i) => (
            <pre key={i} className={`jdc-dungeon-player-line ${i === 1 ? 'jdc-dungeon-face' : ''}`}>{l}</pre>
          ))}
        </motion.div>
        <AnimatePresence>
          {inimigosRef.current > 0 && Array.from({ length: Math.min(restantes, 5) }).map((_, i) => (
            <motion.div key={i} className="jdc-dungeon-enemy-group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
            >
              <pre className="jdc-dungeon-enemy-line"> ╭───╮ </pre>
              <pre className="jdc-dungeon-enemy-line"> │ x │ </pre>
              <pre className="jdc-dungeon-enemy-line"> ╰───╯ </pre>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="jdc-dungeon-progress-wrap">
        <motion.div
          className="jdc-dungeon-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="jack-text jack-text--dim" style={{ fontSize: '0.65rem', textAlign: 'center', margin: '0.25rem 0' }}>
        {inimigosRef.current} inimigo{inimigosRef.current !== 1 ? 's' : ''} restante{inimigosRef.current !== 1 ? 's' : ''}
      </p>

      {/* HP bar */}
      <div className="jdc-dungeon-hpbar">
        <motion.div className="jdc-dungeon-hpbar-fill"
          animate={{ width: `${hpPct}%` }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: hpColor }}
        />
      </div>

      <div className="jdc-dungeon-sep"></div>

      {/* Log */}
      <div className="jdc-dungeon-log">
        <AnimatePresence>
          {log.slice(-6).map((entry, i) => (
            <motion.p key={i} className="jdc-dungeon-log-entry"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >{entry}</motion.p>
          ))}
        </AnimatePresence>
      </div>

      <div className="jdc-dungeon-sep"></div>

      <div className="jdc-dungeon-footer">
        <span className="jack-text jack-text--dim">progresso: {pct}%</span>
        <button className="jack-btn jack-btn--crimson" onClick={() => { stopRef.current = true; store.setFase('vila') }}>
          [ fugir ]
        </button>
      </div>
    </div>
  )
}
