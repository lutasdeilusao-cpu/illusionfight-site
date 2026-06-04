import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { DUNGEONS } from '../data/dungeons'

export default function DungeonSelect() {
  const store = useJackStore()
  const dungeons = Object.values(DUNGEONS)

  return (
    <motion.div className="jdc-vila" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-vila-title">DUNGEONS</div>
      <p className="jack-text jack-text--dim" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        entre onde a noite é mais escura
      </p>

      <div className="jdc-vila-grid">
        {dungeons.map(d => {
          const completa = store.dungeonsCompletas.includes(d.id)
          const locked = d.id === 'rua' && !store.dungeonsCompletas.includes('onibus')
          const bloqueada = locked

          return (
            <motion.button
              key={d.id}
              className={`jdc-vila-card ${bloqueada ? 'jdc-vila-card--locked' : ''} ${completa ? 'jdc-vila-card--done' : ''}`}
              onClick={() => {
                if (bloqueada) return
                store.setFase(`dungeon_${d.id}`)
              }}
              disabled={bloqueada}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ borderLeftColor: completa ? '#22C55E' : bloqueada ? '#444' : '#8B0000' }}
            >
              <div className="jdc-vila-card-emoji">
                {completa ? '🔄' : bloqueada ? '🔒' : d.emoji || '⚔️'}
              </div>
              <div className="jdc-vila-card-info">
                <span className="jdc-vila-card-nome" style={{ color: bloqueada ? '#444' : '#C8C8C8' }}>
                  {d.nome}
                </span>
                <span className="jdc-vila-card-desc">{d.desc}</span>
                <span className="jdc-vila-card-detail">
                  {completa
                    ? `rejogar (${Math.floor(d.dropCap / 2)} cervejas)`
                    : `${d.inimigos} inimigos · ${d.dropCap} cervejas`}
                  {d.dropNotas > 0 ? ` · ${d.dropNotas} notas` : ''}
                  {d.boss ? ` · boss: ${d.boss.nome}` : ''}
                </span>
              </div>
              <div className="jdc-vila-card-arrow" style={{ color: bloqueada ? '#444' : '#8B0000' }}>→</div>
            </motion.button>
          )
        })}
      </div>

      <div className="jdc-vila-legend">
        <span>⚔️ Nova</span>
        <span>🔒 Trancada</span>
        <span>🔄 Rejogar</span>
      </div>
    </motion.div>
  )
}
