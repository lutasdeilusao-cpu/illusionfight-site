import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'
import { MONOLOGUES } from '../data/monologues'

function rollD6() { return Math.floor(Math.random() * 6) + 1 }

const ENEMY_ART = {
  normal: [ '  X  ', ' /|\\ ', ' / \\ ' ],
  boss:  [ ' [X] ', ' /|\\|', ' / \\ ' ],
}

function renderEnemyArt(count, isBoss = false) {
  const art = isBoss ? ENEMY_ART.boss : ENEMY_ART.normal
  if (count <= 0) return ['','','']
  const lines = ['', '', '']
  for (let i = 0; i < Math.min(count, 6); i++) {
    for (let r = 0; r < 3; r++) {
      lines[r] += art[r] + '  '
    }
  }
  return lines
}

export default function Dungeon({ dungeonId }) {
  const store = useJackStore()
  const dungeon = DUNGEONS[dungeonId]
  const [log, setLog] = useState([])
  const [inimigosRest, setInimigosRest] = useState(dungeon?.inimigos || 0)
  const [hp, setHp] = useState(store.hpAtual)
  const [hpMax] = useState(store.hpMax)
  const [fase, setFase] = useState('intro')
  const [bossAtivo, setBossAtivo] = useState(false)
  const [turno, setTurno] = useState(0)
  const logRef = useRef(null)

  useEffect(() => {
    if (dungeon) {
      setLog([`${dungeon.nome}`])
      store.setMonologo(MONOLOGUES.dungeon1_inicio || '')
      setFase('combat')
    }
  }, [])

  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  const handleTurno = () => {
    if (fase !== 'combat') return
    const atq = rollD6() + (store.equipado?.arma?.dano || 0)
    const def = rollD6()
    const dano = Math.max(0, atq - def)
    const dmgInimigo = Math.max(1, rollD6() - (store.equipado?.armadura?.dano || 0))

    const novosLogs = []
    let novoHp = hp
    let novosInimigos = inimigosRest

    if (dano > 0) {
      novosLogs.push(`você acertou um capanga. (${atq} vs ${def}) +1 capangas`)
      store.ganharCapangas(1)
    } else {
      novosLogs.push(`você errou. (${atq} vs ${def})`)
    }

    novoHp -= dmgInimigo
    novosLogs.push(`capanga revida. (-${dmgInimigo} hp)`)
    novosInimigos--

    if (novoHp <= 0) {
      setLog(l => [...l, ...novosLogs, 'você morreu.'])
      setFase('derrota')
      store.setMonologo(MONOLOGUES.morre || '')
      return
    }

    if (novosInimigos <= 0 && dungeon?.boss && !bossAtivo) {
      setBossAtivo(true)
      setLog(l => [...l, ...novosLogs, '', `--- ${dungeon.boss.nome} aparece! ---`, ''])
      setInimigosRest(0)
      setHp(novoHp)
      setTurno(t => t + 1)
      return
    }

    if (novosInimigos <= 0 && !dungeon?.boss) {
      setLog(l => [...l, ...novosLogs, '', 'todos derrubados. dungeon completa!', ''])
      store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
      setFase('vitoria')
      return
    }

    setLog(l => [...l, ...novosLogs])
    setInimigosRest(novosInimigos)
    setHp(novoHp)
    setTurno(t => t + 1)
  }

  const handleBossTurno = () => {
    if (fase !== 'combat' || !bossAtivo) return
    const atq = rollD6() + (store.equipado?.arma?.dano || 0)
    const def = rollD6()
    const dano = Math.max(0, atq - def)
    const dmgBoss = rollD6() + (dungeon?.boss?.dmg || 3)

    const novosLogs = []
    let novoHp = hp

    if (dano > 0) {
      novosLogs.push(`você acertou ${dungeon.boss.nome}! (${atq} vs ${def})`)
    } else {
      novosLogs.push(`você errou. (${atq} vs ${def})`)
    }

    novoHp -= dmgBoss
    novosLogs.push(`${dungeon.boss.nome} ataca. (-${dmgBoss} hp)`)

    if (novoHp <= 0) {
      setLog(l => [...l, ...novosLogs, 'você morreu.'])
      setFase('derrota')
      store.setMonologo(MONOLOGUES.morre || '')
      return
    }

    // Vitória contra boss
    setLog(l => [...l, ...novosLogs, '', `${dungeon.boss.nome} derrotado!`, ''])
    store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
    setFase('vitoria')
  }

  const hpPct = hpMax > 0 ? Math.max(0, Math.round((hp / hpMax) * 20)) : 0
  const hpBar = '█'.repeat(hpPct) + '░'.repeat(20 - hpPct)
  const inimigosVisiveis = bossAtivo ? 1 : inimigosRest
  const enemyLines = renderEnemyArt(inimigosVisiveis, bossAtivo)

  if (fase === 'derrota') {
    return (
      <div className="jdc-dungeon">
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <p className="jack-text jack-text--crimson" style={{ fontSize: '2rem' }}>💀</p>
          <p className="jack-text jack-text--crimson">você morreu.</p>
          <p className="jack-text jack-text--dim">perdeu metade dos capangas desta run.</p>
          <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ marginTop: '1rem' }}>[ voltar ]</button>
        </div>
      </div>
    )
  }

  if (fase === 'vitoria') {
    return (
      <div className="jdc-dungeon">
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <p style={{ fontSize: '2rem' }}>✅</p>
          <p className="jack-text jack-text--amber">{dungeon.nome} — completo!</p>
          <p className="jack-text">+{dungeon.dropCap} capangas{dungeon.dropNotas > 0 ? `, +${dungeon.dropNotas} notas` : ''}</p>
          {dungeon.id === 'onibus' && <p className="jack-text jack-text--dim">🏷️ notas de dix desbloqueadas!</p>}
          <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ marginTop: '1rem' }}>[ voltar ]</button>
        </div>
      </div>
    )
  }

  return (
    <div className="jdc-dungeon">
      {/* ASCII enemies */}
      <pre className="jdc-dungeon-ascii" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div>{enemyLines[0]}</div>
        <div>{enemyLines[1]}</div>
        <div>{enemyLines[2]}</div>
      </pre>

      {/* HP bar CB2 style */}
      <div className="jdc-cb2-hp">
        <span className="jdc-cb2-hp-label">Your health : </span>
        <span className="jdc-cb2-hp-text">{hp}/{hpMax}</span>
      </div>

      {/* Separator */}
      <div className="jdc-cb2-sep">----------------------------------------------------------------------------------------------------</div>

      {/* Combat log */}
      <div className="jdc-cb2-log">
        {log.slice(-12).map((entry, i) => (
          <p key={i} className="jdc-cb2-log-entry">{entry}</p>
        ))}
        <div ref={logRef} />
      </div>

      <div className="jdc-cb2-sep">----------------------------------------------------------------------------------------------------</div>

      {/* Actions */}
      <div className="jdc-dungeon-actions">
        <p className="jack-text jack-text--dim">inimigos restantes: {bossAtivo ? dungeon.boss.nome : inimigosRest}</p>
        {!bossAtivo && (
          <button className="jack-btn jack-btn--amber" onClick={handleTurno}>
            [ atacar ]
          </button>
        )}
        {bossAtivo && (
          <button className="jack-btn jack-btn--amber" onClick={handleBossTurno}>
            [ enfrentar {dungeon.boss.nome} ]
          </button>
        )}
        <button className="jack-btn jack-btn--crimson" onClick={() => store.setFase('vila')} style={{ fontSize: '0.7rem' }}>
          [ fugir ]
        </button>
      </div>
    </div>
  )
}
