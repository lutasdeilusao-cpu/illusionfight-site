import { useEffect, useState, useRef } from 'react'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'
import { MONOLOGUES } from '../data/monologues'

function rollD6() { return Math.floor(Math.random() * 6) + 1 }

const TRACK_LEN = 30

function renderTrack(playerPos, inimigos) {
  let line = ''
  for (let i = 0; i < TRACK_LEN; i++) {
    if (i === playerPos) line += '@'
    else if (i >= TRACK_LEN - inimigos && i < TRACK_LEN) line += 'X'
    else line += '·'
  }
  return line
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
  const hpMax = store.hpMax
  const stopRef = useRef(false)

  useEffect(() => {
    if (dungeon) {
      setLog([`${dungeon.nome}`])
      store.setMonologo(MONOLOGUES.dungeon1_inicio || '')
    }
  }, [])

  // Auto-walk + combat loop
  useEffect(() => {
    if (fase !== 'combat') return
    stopRef.current = false

    const tick = () => {
      if (stopRef.current) return

      setPlayerPos(prev => {
        const next = prev + 1

        // Check if reached enemies
        const enemyStart = TRACK_LEN - inimigos
        const state = useJackStore.getState()
        const danoArma = state.equipado?.arma?.dano || 0
        const defesa = state.equipado?.armadura?.dano || 0

        if (next >= enemyStart && inimigos > 0) {
          // Combat!
          const dmgInimigo = Math.max(1, rollD6() - defesa)

          setHp(h => {
            const novo = h - dmgInimigo
            if (novo <= 0) {
              stopRef.current = true
              setLog(l => [...l, `capanga ataca. (-${dmgInimigo} hp)`, 'você morreu.'])
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
            setLog(l => [...l, `capanga ataca. (-${dmgInimigo} hp)`, `derrubou capanga. (${atq} vs ${def})`])
          } else {
            setLog(l => [...l, `capanga ataca. (-${dmgInimigo} hp)`, `errou. (${atq} vs ${def})`])
          }

          setInimigos(prevIn => {
            const nextIn = prevIn - 1
            if (nextIn <= 0) {
              if (dungeon?.boss) {
                stopRef.current = true
                setBossAtivo(true)
                setLog(l => [...l, '', `--- ${dungeon.boss.nome} aparece! ---`, ''])
                setTimeout(() => {
                  const atqB = rollD6() + danoArma
                  const defB = rollD6()
                  if (atqB > defB) {
                    store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
                    setLog(l => [...l, `acertou ${dungeon.boss.nome}!`, `${dungeon.boss.nome} derrotado!`])
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
                    setLog(l => [...l, `errou. (${atqB} vs ${defB})`, `${dungeon.boss.nome} ataca. (-${dmgB} hp)`])
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

          return prev // Don't advance past enemies
        }

        return next
      })
    }

    const interval = setInterval(tick, 800)
    return () => { clearInterval(interval); stopRef.current = true }
  }, [fase, inimigos])

  const track = renderTrack(playerPos, inimigos)
  const hpPct = hpMax > 0 ? Math.max(0, Math.round((hp / hpMax) * 20)) : 0
  const hpBar = '█'.repeat(hpPct) + '░'.repeat(20 - hpPct)

  if (fase === 'derrota') {
    return (
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <p className="jack-text jack-text--crimson" style={{ fontSize: '2rem' }}>💀</p>
        <p className="jack-text jack-text--crimson">você morreu.</p>
        <button className="jack-btn" onClick={() => { stopRef.current = true; store.setFase('vila') }} style={{ marginTop: '1rem' }}>[ voltar ]</button>
      </div>
    )
  }

  if (fase === 'vitoria') {
    return (
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <p style={{ fontSize: '2rem' }}>✅</p>
        <p className="jack-text jack-text--amber">{dungeon.nome} — completo!</p>
        <p className="jack-text">+{dungeon.dropCap} capangas{dungeon.dropNotas > 0 ? `, +${dungeon.dropNotas} notas` : ''}</p>
        {dungeon.id === 'onibus' && <p className="jack-text jack-text--dim">🏷️ notas de dix desbloqueadas!</p>}
        <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ marginTop: '1rem' }}>[ voltar ]</button>
      </div>
    )
  }

  if (bossAtivo) {
    return (
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <pre className="jdc-dungeon-ascii">
          <div>@  vs  [X]</div>
        </pre>
        <p className="jack-text jack-text--amber">lutando contra {dungeon?.boss?.nome}...</p>
        <div className="jdc-cb2-hp">
          <span className="jdc-cb2-hp-label">Your health : </span>
          <span className="jdc-cb2-hp-text">{hp}/{hpMax}</span>
        </div>
        <div className="jdc-cb2-sep">----------------------------------------------------------------------------------------------------</div>
        <div style={{ maxHeight: '200px', overflowY: 'auto', margin: '0.25rem 0' }}>
          {log.slice(-10).map((entry, i) => <p key={i} className="jdc-cb2-log-entry">{entry}</p>)}
        </div>
      </div>
    )
  }

  return (
    <div className="jdc-dungeon">
      {/* Walking track */}
      <pre className="jdc-dungeon-ascii" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        <div>{track}</div>
      </pre>

      <div className="jdc-cb2-hp">
        <span className="jdc-cb2-hp-label">Your health : </span>
        <span className="jdc-cb2-hp-text">{hp}/{hpMax}</span>
      </div>

      <div className="jdc-cb2-sep">----------------------------------------------------------------------------------------------------</div>

      <div style={{ maxHeight: '250px', overflowY: 'auto', margin: '0.25rem 0' }}>
        {log.slice(-15).map((entry, i) => (
          <p key={i} className="jdc-cb2-log-entry">{entry}</p>
        ))}
      </div>

      <div className="jdc-cb2-sep">----------------------------------------------------------------------------------------------------</div>

      <div style={{ marginTop: '0.5rem' }}>
        <p className="jack-text jack-text--dim">inimigos restantes: {inimigos}</p>
        <button className="jack-btn jack-btn--crimson" onClick={() => { stopRef.current = true; store.setFase('vila') }} style={{ fontSize: '0.7rem' }}>
          [ fugir ]
        </button>
      </div>
    </div>
  )
}
