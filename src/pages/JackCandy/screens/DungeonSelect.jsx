import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'

export default function DungeonSelect() {
  const store = useJackStore()
  const dungeons = Object.values(DUNGEONS)

  return (
    <motion.div className="jdc-vila" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-vila-title">DUNGEONS</div>
      <p className="jack-text jack-text--dim" style={{ marginBottom: '1rem' }}>
        selecione uma dungeon
      </p>
      <div className="jdc-vila-npcs">
        {dungeons.map(d => {
          const completa = store.dungeonsCompletas.includes(d.id)
          const locked = d.id === 'rua' && !store.dungeonsCompletas.includes('onibus')
          const locked2 = d.id === 'boteco' && !store.dungeonsCompletas.includes('rua')
          const bloqueada = locked || locked2

          return (
            <button
              key={d.id}
              className={`jdc-vila-npc-btn ${bloqueada ? 'jdc-vila-npc-btn--locked' : ''}`}
              onClick={() => {
                if (completa) return
                if (bloqueada) return
                store.setFase(`dungeon_${d.id}`)
              }}
              disabled={bloqueada || completa}
            >
              <span className="jdc-vila-npc-icon">
                {completa ? '✅' : bloqueada ? '🔒' : '⚔️'}
              </span>
              <span className="jdc-vila-npc-nome">{d.nome}</span>
              <span className="jdc-vila-npc-desc">{d.desc}</span>
              <span className="jdc-vila-npc-desc">
                {completa ? 'completa' : `${d.inimigos} inimigos · ${d.dropCap} cap`}
                {d.dropNotas > 0 ? `, ${d.dropNotas} notas` : ''}
              </span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
