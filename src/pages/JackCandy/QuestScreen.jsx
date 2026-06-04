import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useJackStore, AREAS } from './store/useJackStore'

const TRACK_LENGTH = 40

function renderTrack(step, totalSteps, inimigosRestantes, inimigoNome, areaId) {
  const area = AREAS[areaId]
  if (!area) return ''
  const totalEnemies = area.inimigos
  const enemiesDefeated = totalEnemies - inimigosRestantes
  const spawnInterval = Math.floor(totalSteps / (totalEnemies + 1))
  const enemyPositions = []
  for (let i = 0; i < totalEnemies; i++) {
    enemyPositions.push(spawnInterval * (i + 1))
  }

  let line = ''
  for (let i = 0; i < totalSteps; i++) {
    if (i === step) {
      line += '@'
    } else if (enemyPositions.includes(i) && i >= enemiesDefeated * spawnInterval + spawnInterval) {
      line += 'X'
    } else {
      line += '·'
    }
  }
  if (step >= totalSteps - 1) line = '@' + '·'.repeat(totalSteps - 1)
  return line
}

export default function QuestScreen({ areaId, onBack }) {
  const store = useJackStore()
  const intervalRef = useRef(null)
  const area = AREAS[areaId]
  if (!area) return null

  const step = store.questStep
  const totalSteps = 15
  const track = renderTrack(step, totalSteps, store.questInimigosRestantes, area.inimigoNome, areaId)
  const progress = store.questProgress || 0

  useEffect(() => {
    if (store.questResultado) return
    intervalRef.current = setInterval(() => {
      store.tickQuest()
    }, 500)
    return () => clearInterval(intervalRef.current)
  }, [store.questResultado])

  useEffect(() => {
    if (store.questResultado) {
      clearInterval(intervalRef.current)
    }
  }, [store.questResultado])

  const hpPct = store.questMaxHp > 0 ? Math.max(0, (store.questHp / store.questMaxHp) * 100) : 0

  if (store.questResultado === 'completo') {
    return (
      <motion.div className="jdc-quest-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="jdc-quest-check">✅</div>
        <div className="jdc-quest-result-title">{area.nome} — completo</div>
        <div className="jdc-quest-result-reward">
          +{store.areasCompletas.includes(areaId) ? Math.floor(area.recompensa / 2) : area.recompensa} capangas
          {!store.areasCompletas.includes(areaId) && area.item && <span> · {area.item.icone} {area.item.nome}</span>}
        </div>
        <button className="jack-btn" onClick={onBack}>[ voltar ]</button>
      </motion.div>
    )
  }

  if (store.questResultado === 'derrota') {
    return (
      <motion.div className="jdc-quest-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="jdc-quest-check" style={{ color: '#8B0000' }}>💀</div>
        <div className="jdc-quest-result-title">derrota</div>
        <div className="jdc-quest-result-reward">você não conseguiu dessa vez.</div>
        <button className="jack-btn" onClick={onBack}>[ voltar ]</button>
      </motion.div>
    )
  }

  return (
    <div className="jdc-quest">
      <div className="jdc-quest-header">{area.nome}</div>
      <div className="jdc-quest-desc">{area.desc}</div>

      <div className="jdc-quest-track-container">
        <div className="jdc-quest-track">{track}</div>
      </div>

      <div className="jdc-quest-hp">
        <span className="jdc-quest-hp-label">HP</span>
        <div className="jdc-quest-hp-bar">
          <div className="jdc-quest-hp-fill" style={{ width: `${hpPct}%` }} />
        </div>
        <span className="jdc-quest-hp-text">{store.questHp}/{store.questMaxHp}</span>
      </div>

      <div className="jdc-quest-info">
        <span>inimigos restantes: {store.questInimigosRestantes}</span>
      </div>

      {store.monologoAtual && (
        <div className="jdc-quest-log">
          <span className="jack-text--crimson">{store.monologoAtual}</span>
        </div>
      )}
    </div>
  )
}
