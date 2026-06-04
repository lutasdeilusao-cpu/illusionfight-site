import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'
import { MONOLOGUES } from '../data/monologues'

function rollD6() { return Math.floor(Math.random() * 6) + 1 }

const INTERVALO = 1200

export default function Dungeon({ dungeonId }) {
  const store = useJackStore()
  const dungeon = DUNGEONS[dungeonId]
  const [log, setLog] = useState([])
  const [hp, setHp] = useState(store.hpAtual)
  const hpMax = store.hpMax
  const [fase, setFase] = useState('combat')
  const [progresso, setProgresso] = useState(0)
  const [restantes, setRestantes] = useState(dungeon?.inimigos || 0)
  const [animHit, setAnimHit] = useState(false)
  const [animKill, setAnimKill] = useState(false)

  const inimigosRef = useRef(dungeon?.inimigos || 0)
  const hpRef = useRef(store.hpAtual)
  const stopRef = useRef(false)
  const danoArmaRef = useRef(store.equipado?.arma?.dano || 0)
  const defesaRef = useRef(store.equipado?.armadura?.dano || 0)
  const totalInimigos = dungeon?.inimigos || 0

  if (!dungeon) {
    return (
      <div className="jdc-dungeon">
        <p className="jack-text jack-text--crimson">dungeon não encontrada: {dungeonId}</p>
        <button className="jack-btn" onClick={() => store.setFase('dungeon_select')}>[ voltar ]</button>
      </div>
    )
  }

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
      const atq = rollD6() + danoArma
      const def = rollD6()
      const acertou = atq > def

      if (acertou) {
        store.ganharCapangas(1)
        inimigosRef.current--
        setRestantes(inimigosRef.current)
        setAnimKill(true)
        setTimeout(() => setAnimKill(false), 400)
        setProgresso(prev => prev + 1)

        if (inimigosRef.current <= 0) {
          stopRef.current = true
          setLog(l => [...l, `💥 derrubou! (${atq} vs ${def}) +1 cap`, `✅ todos derrubados!`])
          if (dungeon?.boss) {
            // Boss battle - auto resolve
            setTimeout(() => {
              const atqB = rollD6() + danoArma
              const defB = rollD6()
              if (atqB > defB) {
                store.setHpAtual(hpRef.current)
                store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
                setLog(l => [...l, `🎯 acertou ${dungeon.boss.nome}!`, `🏆 ${dungeon.boss.nome} derrotado!`])
                setTimeout(() => setFase('vitoria'), 500)
              } else {
                const dmgB = rollD6() + (dungeon.boss?.dmg || 3)
                const novoHp = hpRef.current - dmgB
                hpRef.current = novoHp
                setHp(novoHp)
                if (novoHp <= 0) {
                  store.setHpAtual(0)
                  store.setMonologo(MONOLOGUES.morre || '')
                  setTimeout(() => setFase('derrota'), 100)
                } else {
                  // Second try
                  const atqB2 = rollD6() + danoArma
                  if (atqB2 > defB) {
                    store.setHpAtual(hpRef.current)
                    store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
                    setLog(l => [...l, `🎯 acertou boss!`, `🏆 derrotado!`])
                    setTimeout(() => setFase('vitoria'), 500)
                  } else {
                    store.setHpAtual(0)
                    store.setMonologo(MONOLOGUES.morre || '')
                    setTimeout(() => setFase('derrota'), 100)
                  }
                }
              }
            }, 1000)
          } else {
            const hpReal = useJackStore.getState().hpAtual
            if (hpReal <= 0 || hpRef.current <= 0) {
              store.setHpAtual(0)
              store.setMonologo(MONOLOGUES.morre || '')
              setFase('derrota')
            } else {
              store.setHpAtual(hpRef.current)
              store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
              setFase('vitoria')
            }
          }
          return
        }
        setLog(l => [...l, `💥 derrubou! (${atq} vs ${def}) +1 cap`])
        return
      }

      const dmg = Math.min(3, Math.max(1, rollD6() - defesa))
      const novoHp = hpRef.current - dmg
      hpRef.current = novoHp
      setHp(novoHp)
      setAnimHit(true)
      setTimeout(() => setAnimHit(false), 400)

      if (novoHp <= 0) {
        stopRef.current = true
        store.setHpAtual(0)
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

  const pct = totalInimigos > 0 ? Math.round((progresso / totalInimigos) * 100) : 0
  const hpPct = hpMax > 0 ? Math.max(0, Math.round((hp / hpMax) * 100)) : 0
  const hpColor = hpPct > 60 ? '#22C55E' : hpPct > 30 ? '#F5A623' : '#E02020'
  const visibleEnemies = Math.min(restantes, 5)

  if (fase === 'derrota') {
    return (
      <div className="jdc-dungeon" style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="jdc-dungeon-end-icon" style={{ color: '#8B0000' }}>💀</div>
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
          <div className="jdc-dungeon-end-icon" style={{ color: '#F5A623' }}>✅</div>
          <p className="jack-text jack-text--amber" style={{ fontSize: '1.2rem' }}>{dungeon?.nome || 'Dungeon'} — completo!</p>
          <p className="jack-text">+{dungeon.dropCap} capangas{dungeon.dropNotas > 0 ? `e +${dungeon.dropNotas} notas` : ''}</p>
          {dungeon.id === 'onibus' && <p className="jack-text jack-text--dim">🏷️ notas desbloqueadas!</p>}
          <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ marginTop: '1rem' }}>[ voltar ]</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="jdc-dungeon">
      <div className="jdc-dungeon-status">
        <span className="jdc-dungeon-status-loc">{dungeon?.nome || 'Dungeon'}</span>
        <span className="jdc-dungeon-status-hp">
          <span className="jdc-dungeon-status-hp-label">HP</span>
          <span className="jdc-dungeon-status-hp-val">{hp}/{hpMax}</span>
        </span>
      </div>

      {/* Battle scene */}
      <div className="jdc-dungeon-battle">
        <motion.div
          className="jdc-dungeon-player-hero"
          animate={{
            x: ['-5%', '5%', '-5%'],
            y: [0, -4, 0],
          }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <motion.div
            className="jdc-dungeon-player-sprite"
            animate={{ scale: animHit ? 1.1 : 1 }}
          >🕵️</motion.div>
          <span className="jdc-dungeon-player-label">Jack</span>
        </motion.div>

        <div className="jdc-dungeon-vs">
          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.3, repeat: Infinity }}>⚡</motion.span>
        </div>

        <div className="jdc-dungeon-enemies">
          {Array.from({ length: visibleEnemies }).map((_, i) => (
            <motion.div
              key={i}
              className="jdc-dungeon-enemy-sprite"
              animate={i === visibleEnemies - 1 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ opacity: 1 - i * 0.1 }}
            >
              <motion.span
                className="jdc-dungeon-enemy-emoji"
                animate={animKill ? { opacity: 0, scale: 0 } : {}}
              >👤</motion.span>
            </motion.div>
          ))}
          {restantes > 5 && (
            <span className="jack-text jack-text--dim" style={{ fontSize: '0.7rem' }}>+{restantes - 5}</span>
          )}
        </div>
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
        {restantes} inimigo{restantes !== 1 ? 's' : ''} restante{restantes !== 1 ? 's' : ''}
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

      {/* Use item */}
      <div className="jdc-dungeon-items">
        {store.inventario.filter(i => i.id === 'energetico').length > 0 && (
          <button className="jack-btn" onClick={() => {
            store.usarItem('energetico')
            const novaHp = Math.min(hpMax, hp + 10)
            setHp(novaHp)
            hpRef.current = novaHp
            setLog(l => [...l, `🥫 usou energético. +10 HP`])
          }} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
            [ 🥫 energético +10 HP ]
          </button>
        )}
      </div>

      <div className="jdc-dungeon-footer">
        <span className="jack-text jack-text--dim">progresso: {pct}%</span>
        <button className="jack-btn jack-btn--crimson" onClick={() => { stopRef.current = true; store.setFase('vila') }}>
          [ fugir ]
        </button>
      </div>
    </div>
  )
}
