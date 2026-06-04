import { useState, useEffect } from 'react'
import { usePPStore } from '../store/usePPStore'
import { getCaso } from '../data/resolver'
import { getInimigo } from '../data/inimigos'

function rollD6() { return Math.floor(Math.random() * 6) + 1 }

export default function Confronto() {
  const store = usePPStore()
  const caso = getCaso(store.casoAtivo)
  const [log, setLog] = useState([])
  const [playerHp, setPlayerHp] = useState(30)
  const [enemyHp, setEnemyHp] = useState(0)
  const [acabou, setAcabou] = useState(false)
  const [venceu, setVenceu] = useState(false)
  const playerMaxHp = 30

  if (!caso) { store.setFase('mapa'); return null }

  const inimigo = caso.confronto?.inimigo_id ? getInimigo(caso.confronto.inimigo_id) : { nome: 'Desconhecido', hp: 20, atk: 3, def: 1 }
  const ehInterrogatorio = caso.confronto?.tipo === 'interrogatorio'

  useEffect(() => {
    if (enemyHp === 0) setEnemyHp(inimigo.hp)
  }, [])

  if (ehInterrogatorio) {
    return (
      <div className="pp-container">
        <h2 style={{ color: '#F5A623', textAlign: 'center', marginBottom: 20 }}>Interrogatório</h2>
        <p style={{ color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
          Você confronta {caso.confronto?.alvo || 'o suspeito'} com as evidências coletadas.
        </p>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button className="pp-btn pp-btn--primary" onClick={() => store.setFase('dossier')}>
            CONTINUAR
          </button>
        </div>
      </div>
    )
  }

  const handleAtacar = () => {
    if (acabou) return
    const pDmg = Math.max(0, rollD6() + 2 - inimigo.def)
    let nEhp = Math.max(0, enemyHp - pDmg)
    setEnemyHp(nEhp)
    setLog(l => [...l, { text: `Você ataca e causa ${pDmg} de dano. (HP inimigo: ${nEhp})`, side: 'player' }])

    if (nEhp <= 0) {
      setAcabou(true)
      setVenceu(true)
      setLog(l => [...l, { text: '⚔️ Você venceu o confronto!', side: 'system' }])
      return
    }

    setTimeout(() => {
      const eDmg = Math.max(0, rollD6() + inimigo.atk - 2)
      let nPhp = Math.max(0, playerHp - eDmg)
      setPlayerHp(nPhp)
      setLog(l => [...l, { text: `${inimigo.nome} ataca e causa ${eDmg} de dano. (Seu HP: ${nPhp})`, side: 'enemy' }])
      if (nPhp <= 0) {
        setAcabou(true)
        setVenceu(false)
        setLog(l => [...l, { text: '💀 Você foi derrotado!', side: 'system' }])
      }
    }, 600)
  }

  const playerPct = Math.max(0, (playerHp / playerMaxHp) * 100)
  const enemyPct = Math.max(0, (enemyHp / inimigo.hp) * 100)

  return (
    <div className="pp-container">
      <div className="pp-dossier-header">
        <button className="pp-back" onClick={() => store.setFase('dossier')}>← dossier</button>
        <h2 style={{ color: '#F5A623', margin: 0 }}>VS {inimigo.nome}</h2>
      </div>

      <div className="pp-combat-stats">
        <div className="pp-combat-side">
          <div className="pp-combat-name">Você</div>
          <div className="pp-combat-hp-bar">
            <div className={`pp-combat-hp-fill ${playerPct < 30 ? 'pp-combat-hp-fill--danger' : ''}`}
              style={{ '--hp-pct': `${playerPct}%` }} />
          </div>
          <span style={{ fontSize: 10, color: '#555' }}>HP {playerHp}/{playerMaxHp}</span>
        </div>
        <div className="pp-combat-side">
          <div className="pp-combat-name">{inimigo.nome}</div>
          <div className="pp-combat-hp-bar">
            <div className="pp-combat-hp-fill" style={{ '--hp-pct': `${enemyPct}%` }} />
          </div>
          <span style={{ fontSize: 10, color: '#555' }}>HP {enemyHp}/{inimigo.hp}</span>
        </div>
      </div>

      <div className="pp-combat-log">
        {log.slice(-6).map((l, i) => (
          <div key={i} className="pp-combat-log-line" style={{ color: l.side === 'player' ? '#00FF88' : l.side === 'system' ? '#F5A623' : '#cc5555' }}>
            {l.text}
          </div>
        ))}
      </div>

      {!acabou ? (
        <button className="pp-btn pp-btn--primary" onClick={handleAtacar} style={{ width: '100%' }}>
          ATACAR
        </button>
      ) : (
        <button className="pp-btn pp-btn--primary" onClick={() => store.setFase('dossier')}>
          {venceu ? 'CONTINUAR' : 'TENTAR DE NOVO'}
        </button>
      )}
    </div>
  )
}
