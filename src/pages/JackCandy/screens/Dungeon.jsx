import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'
import { MONOLOGUES } from '../data/monologues'
import CombatLog from '../components/CombatLog'

function rollD6() { return Math.floor(Math.random() * 6) + 1 }

export default function Dungeon({ dungeonId }) {
  const store = useJackStore()
  const dungeon = DUNGEONS[dungeonId]
  const [log, setLog] = useState([])
  const [inimigosRest, setInimigosRest] = useState(dungeon?.inimigos || 0)
  const [hp, setHp] = useState(store.hpAtual)
  const [hpMax] = useState(store.hpMax)
  const [fase, setFase] = useState('introducao')
  const [bossFase, setBossFase] = useState(false)
  const tickRef = useRef(null)

  useEffect(() => {
    if (dungeon) {
      setLog([`você entrou no ${dungeon.nome}. está escuro.`])
      store.setMonologo(MONOLOGUES.dungeon1_inicio || '')
    }
  }, [])

  useEffect(() => {
    if (fase !== 'combat' && fase !== 'boss') return
    if (inimigosRest <= 0 && !bossFase) {
      setFase('vitoria')
      return
    }
    tickRef.current = setInterval(() => {
      const atq = rollD6() + (store.equipado?.arma?.dano || 0)
      const def = rollD6()
      const dano = Math.max(0, atq - def)
      if (dano > 0) {
        setLog(l => [...l, `você derrubou um capanga. (rolou ${atq} vs ${def}) +1 cap`])
        store.ganharCapangas(1)
      } else {
        setLog(l => [...l, `você errou. (rolou ${atq} vs ${def})`])
      }
      const dmgInimigo = rollD6()
      setHp(h => {
        const novo = h - dmgInimigo
        setLog(l => [...l, `capanga acertou você. (-${dmgInimigo} hp)`])
        if (novo <= 0) {
          clearInterval(tickRef.current)
          setFase('derrota')
          store.setMonologo(MONOLOGUES.morre || '')
        }
        return Math.max(0, novo)
      })
      setInimigosRest(r => {
        const next = r - 1
        if (next <= 0 && dungeon?.boss && !bossFase) {
          setBossFase(true)
          setLog(l => [...l, `--- um inimigo maior aparece: ${dungeon.boss.nome} ---`])
          return next
        }
        return next
      })
    }, 2000)
    return () => clearInterval(tickRef.current)
  }, [fase, bossFase])

  const handleBossCombat = () => {
    if (fase !== 'boss') return
    clearInterval(tickRef.current)
    const atq = rollD6() + (store.equipado?.arma?.dano || 0)
    const def = rollD6()
    const dano = Math.max(0, atq - def)
    if (dano > 0) {
      setLog(l => [...l, `você acertou o ${dungeon.boss.nome}! (${atq} vs ${def})`])
      setLog(l => [...l, `--- ${dungeon.boss.nome} caiu. ---`])
      setFase('vitoria')
    } else {
      setLog(l => [...l, `você errou o ${dungeon.boss.nome}. (${atq} vs ${def})`])
      const dmgBoss = rollD6() + dungeon.boss.dmg
      setHp(h => {
        const novo = h - dmgBoss
        setLog(l => [...l, `${dungeon.boss.nome} acertou você. (-${dmgBoss} hp)`])
        if (novo <= 0) {
          setFase('derrota')
          store.setMonologo(MONOLOGUES.morre || '')
        }
        return Math.max(0, novo)
      })
    }
  }

  if (fase === 'derrota') {
    return (
      <motion.div className="jdc-dungeon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="jdc-dungeon-over">💀</div>
        <p className="jack-text jack-text--crimson">você morreu na dungeon.</p>
        <p className="jack-text jack-text--dim">capangas acumulados nesta run: você perdeu metade.</p>
        <button className="jack-btn" onClick={() => store.setFase('vila')}>[ voltar para a vila ]</button>
      </motion.div>
    )
  }

  if (fase === 'vitoria') {
    store.completarDungeon(dungeonId, dungeon.dropCap, dungeon.dropNotas)
    return (
      <motion.div className="jdc-dungeon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="jdc-dungeon-over">✅</div>
        <p className="jack-text jack-text--amber">{dungeon.nome} — completo!</p>
        <p className="jack-text">+{dungeon.dropCap} capangas{dungeon.dropNotas > 0 ? `, +${dungeon.dropNotas} notas` : ''}</p>
        <button className="jack-btn" onClick={() => store.setFase('vila')}>[ voltar para a vila ]</button>
      </motion.div>
    )
  }

  return (
    <div className="jdc-dungeon">
      <div className="jdc-dungeon-header">{dungeon.nome}</div>
      <CombatLog entries={log} inimigosRestantes={inimigosRest} hp={hp} hpMax={hpMax} />
      <div className="jack-buttons">
        {fase === 'introducao' && (
          <button className="jack-btn jack-btn--amber" onClick={() => setFase('combat')}>
            [ começar ]
          </button>
        )}
        {fase === 'combat' && (
          <button className="jack-btn jack-btn--crimson" onClick={() => store.setFase('vila')} style={{ fontSize: '0.7rem' }}>
            [ fugir ]
          </button>
        )}
        {fase === 'boss' && (
          <button className="jack-btn jack-btn--amber" onClick={handleBossCombat}>
            [ enfrentar {dungeon.boss?.nome} ]
          </button>
        )}
      </div>
    </div>
  )
}
