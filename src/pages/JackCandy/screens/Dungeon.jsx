import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'
import { MONOLOGUES } from '../data/monologues'

function rollD6() { return Math.floor(Math.random() * 6) + 1 }

const TRACK_LEN = 35
const MAX_VISIBLE_ENEMIES = 5
const ENEMY_SPACING = 4

const PLAYER_ART = [
  '__/=====\\__',
  '  ( -  - )',
  '   \\_∧_/',
  '  /|___|\\',
]

const ENEMY_ART = [
  ' ╭───╮ ',
  ' │ x │ ',
  ' ╰───╯ ',
]

function renderTrack(playerPos, inimigos) {
  const visible = Math.min(inimigos, MAX_VISIBLE_ENEMIES)
  const enemyPositions = []
  const startPos = TRACK_LEN - (visible * (ENEMY_SPACING + 1))
  for (let i = 0; i < visible; i++) {
    enemyPositions.push(startPos + i * (ENEMY_SPACING + 1))
  }

  let line = ''
  for (let i = 0; i < TRACK_LEN; i++) {
    if (i === playerPos) line += '@'
    else if (enemyPositions.includes(i)) line += 'X'
    else line += '·'
  }
  return { line, enemyPositions }
}

export default function Dungeon({ dungeonId }) {
  const store = useJackStore()
  const dungeon = DUNGEONS[dungeonId]
  const [log, setLog] = useState([])
  const [inimigos, setInimigos] = useState(dungeon?.inimigos || 0)
  const [hp, setHp] = useState(store.hpAtual)
  const [fase, setFase] = useState('combat')
  const [playerPos, setPlayerPos] = useState(0)
  const [bossAtivo, setBossAtivo] = useState(false)
  const [lastDmg, setLastDmg] = useState(null)
  const [lastKill, setLastKill] = useState(false)
  const [hitAnim, setHitAnim] = useState(false)
  const hpMax = store.hpMax
  const stopRef = useRef(false)

  useEffect(() => {
    if (dungeon) {
      setLog([`${dungeon.nome}`])
      store.setMonologo(MONOLOGUES.dungeon1_inicio || '')
    }
  }, [])

  useEffect(() => {
    if (fase !== 'combat') return
    stopRef.current = false

    const tick = () => {
      if (stopRef.current) return

      setPlayerPos(prev => {
        const next = prev + 1
        const visible = Math.min(inimigos, MAX_VISIBLE_ENEMIES)
        const startPos = TRACK_LEN - (visible * (ENEMY_SPACING + 1))
        const enemyPositions = []
        for (let i = 0; i < visible; i++) {
          enemyPositions.push(startPos + i * (ENEMY_SPACING + 1))
        }
        const reachedEnemy = enemyPositions.includes(next)

        if (reachedEnemy && inimigos > 0) {
          const state = useJackStore.getState()
          const danoArma = state.equipado?.arma?.dano || 0
          const defesa = state.equipado?.armadura?.dano || 0
          const dmgInimigo = Math.max(1, rollD6() - defesa)

          setHitAnim(true)
          setTimeout(() => setHitAnim(false), 300)
          setLastDmg({ value: dmgInimigo, type: 'enemy' })
          setTimeout(() => setLastDmg(null), 600)

          setHp(h => {
            const novo = h - dmgInimigo
            if (novo <= 0) {
              stopRef.current = true
              setLog(l => [...l, `⚔️ capanga ataca! (-${dmgInimigo} hp)`, `💀 você morreu.`])
              store.setMonologo(MONOLOGUES.morre || '')
              setTimeout(() => setFase('derrota'), 100)
            }
            return Math.max(0, novo)
          })

          if (hp <= 0) return prev

          const atq = rollD6() + danoArma
          const def = rollD6()
          if (atq > def) {
            store.ganharCapangas(1)
            setLastKill(true)
            setTimeout(() => setLastKill(false), 400)
            setLog(l => [...l, `⚔️ capanga ataca! (-${dmgInimigo} hp)`, `💥 derrubou! (${atq} vs ${def}) +1 cap`])
          } else {
            setLog(l => [...l, `⚔️ capanga ataca! (-${dmgInimigo} hp)`, `❌ errou. (${atq} vs ${def})`])
          }

          setInimigos(prevIn => {
            const nextIn = prevIn - 1
            if (nextIn <= 0) {
              if (dungeon?.boss) {
                stopRef.current = true
                setBossAtivo(true)
                setLog(l => [...l, '', `🔥 ${dungeon.boss.nome} aparece!`, ''])
                setTimeout(() => {
                  const atqB = rollD6() + danoArma
                  const defB = rollD6()
                  if (atqB > defB) {
                    store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
                    setLog(l => [...l, `🎯 acertou ${dungeon.boss.nome}!`, `🏆 ${dungeon.boss.nome} derrotado!`])
                    setTimeout(() => setFase('vitoria'), 300)
                  } else {
                    const dmgB = rollD6() + (dungeon.boss?.dmg || 3)
                    setHp(h => {
                      if (h - dmgB <= 0) {
                        store.setMonologo(MONOLOGUES.morre || '')
                        setTimeout(() => setFase('derrota'), 100)
                      }
                      return Math.max(0, h - dmgB)
                    })
                    setLog(l => [...l, `❌ errou. (${atqB} vs ${defB})`, `💢 ${dungeon.boss.nome} ataca! (-${dmgB} hp)`])
                  }
                }, 1500)
                return 0
              }
              stopRef.current = true
              store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
              setTimeout(() => setFase('vitoria'), 200)
              return 0
            }
            return nextIn
          })
          return prev
        }
        return next
      })
    }

    const interval = setInterval(tick, 900)
    return () => { clearInterval(interval); stopRef.current = true }
  }, [fase, inimigos])

  const { line: trackLine, enemyPositions } = renderTrack(playerPos, inimigos)
  const hpPct = hpMax > 0 ? Math.max(0, Math.round((hp / hpMax) * 100)) : 0
  const hpColor = hpPct > 60 ? '#22C55E' : hpPct > 30 ? '#F5A623' : '#E02020'
  const playerArt = hitAnim ? PLAYER_ART.map(l => l.replace('( -  - )', '( x  x )')) : PLAYER_ART

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

  if (bossAtivo) {
    return (
      <div className="jdc-dungeon" style={{ textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p style={{ fontSize: '2rem', color: '#E02020' }}>[BOSS]</p>
          <p className="jack-text jack-text--amber">lutando contra {dungeon?.boss?.nome}...</p>
          <div className="jdc-dungeon-hpbar">
            <motion.div className="jdc-dungeon-hpbar-fill" animate={{ width: `${hpPct}%` }}
              transition={{ duration: 0.3 }} style={{ backgroundColor: hpColor }} />
          </div>
          <span className="jack-text jack-text--dim">{hp}/{hpMax}</span>
          <div className="jdc-dungeon-log">
            {log.slice(-8).map((entry, i) => <p key={i} className="jdc-dungeon-log-entry">{entry}</p>)}
          </div>
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

      {/* Player ASCII art */}
      <div className="jdc-dungeon-player-art">
        <AnimatePresence>
          {enemyPositions.length > 0 && enemyPositions[0] <= playerPos + 3 && (
            <motion.div className="jdc-dungeon-enemy-art"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {ENEMY_ART.map((l, i) => <pre key={i} className="jdc-dungeon-enemy-line">{l}</pre>)}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="jdc-dungeon-player-body"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {playerArt.map((l, i) => (
            <pre key={i} className={`jdc-dungeon-player-line ${i === 1 ? 'jdc-dungeon-face' : ''}`}>{l}</pre>
          ))}
        </motion.div>
      </div>

      {/* Track */}
      <div className="jdc-dungeon-track-wrap">
        <pre className="jdc-dungeon-track">{trackLine}</pre>
      </div>

      {/* Damage float */}
      <AnimatePresence>
        {lastDmg && (
          <motion.div className="jdc-dungeon-dmgfloat"
            initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            style={{ color: lastDmg.type === 'enemy' ? '#E02020' : '#F5A623' }}
          >-{lastDmg.value}</motion.div>
        )}
      </AnimatePresence>

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
          {log.slice(-10).map((entry, i) => (
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
        <span className="jack-text jack-text--dim">inimigos: {inimigos}</span>
        <button className="jack-btn jack-btn--crimson" onClick={() => { stopRef.current = true; store.setFase('vila') }}>
          [ fugir ]
        </button>
      </div>
    </div>
  )
}
