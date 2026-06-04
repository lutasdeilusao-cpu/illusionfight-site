import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { NPCS } from '../data/npcs'
import { DUNGEONS } from '../data/dungeons'
import { MONOLOGUES } from '../data/monologues'

const LOCAIS = [
  { id: 'paje', nome: 'Pajé', emoji: '⛺', desc: 'Barraca do Pajé', cor: '#F5A623', npc: 'paje' },
  { id: 'kim', nome: 'Kim', emoji: '🍺', desc: 'Boteco do Jazz', cor: '#8B0000', npc: 'kim' },
  { id: 'nina', nome: 'Nina', emoji: '⭐', desc: 'Delegacia', cor: '#A855F4', npc: 'nina' },
  { id: 'osvaldo', nome: 'Osvaldo', emoji: '🔧', desc: 'Oficina', cor: '#F97316', npc: 'osvaldo' },
  { id: 'onibus', nome: 'Ônibus', emoji: '🚌', desc: 'Dungeon', cor: '#666', dungeon: 'onibus' },
  { id: 'rua', nome: 'Rua Marelia', emoji: '🏚️', desc: 'Dungeon', cor: '#666', dungeon: 'rua' },
]

export default function Vila() {
  const store = useJackStore()

  const getStatus = (id) => {
    const npc = NPCS[id]
    if (npc?.requerFlag && !store.flags[npc.requerFlag]) return 'locked'
    if (store.dungeonsCompletas.includes(id)) return 'done'
    return 'open'
  }

  return (
    <motion.div className="jdc-vila" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Skyline */}
      <div className="jdc-vila-bg">
        <div className="jdc-vila-skyline">
          <span>🏢</span><span>🏠</span><span>🏚️</span><span>🏪</span><span>🏛️</span>
          <span>🌙</span>
        </div>
        <div className="jdc-vila-street">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <div className="jdc-vila-title">M A R E L I A</div>
      <p className="jack-text jack-text--dim" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        a cidade nunca dorme. ninguém dorme.
      </p>

      {/* Map grid */}
      <div className="jdc-vila-grid">
        {LOCAIS.map(local => {
          const status = getStatus(local.id)
          const locked = status === 'locked'
          const done = status === 'done'
          const npc = NPCS[local.npc]
          const dungeon = DUNGEONS[local.dungeon]

          return (
            <motion.button
              key={local.id}
              className={`jdc-vila-card ${locked ? 'jdc-vila-card--locked' : ''} ${done ? 'jdc-vila-card--done' : ''}`}
              onClick={() => {
                if (locked) return
                if (local.npc) store.setFase(`interior_${local.npc}`)
                if (local.dungeon) store.setFase(`dungeon_${local.dungeon}`)
              }}
              disabled={locked}
              whileHover={{ scale: 1.03, borderColor: local.cor }}
              whileTap={{ scale: 0.97 }}
              style={{ borderLeftColor: local.cor }}
            >
              <div className="jdc-vila-card-emoji">{locked ? '🔒' : done ? '✓' : local.emoji}</div>
              <div className="jdc-vila-card-info">
                <span className="jdc-vila-card-nome" style={{ color: locked ? '#444' : '#C8C8C8' }}>
                  {local.nome}
                </span>
                <span className="jdc-vila-card-desc">
                  {locked ? 'trancado' : done ? 'completo' : local.desc}
                </span>
                {dungeon && !locked && !done && (
                  <span className="jdc-vila-card-detail">
                    {dungeon.inimigos} inimigos · {dungeon.dropCap} cap
                    {dungeon.boss ? ` · boss: ${dungeon.boss.nome}` : ''}
                  </span>
                )}
                {done && dungeon && (
                  <span className="jdc-vila-card-detail">rejogar ({Math.floor(dungeon.dropCap / 2)} cap)</span>
                )}
              </div>
              <div className="jdc-vila-card-arrow" style={{ color: local.cor }}>→</div>
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="jdc-vila-legend">
        <span>🟢 Aberto</span>
        <span>🔒 Trancado</span>
        <span>✓ Completo</span>
      </div>
    </motion.div>
  )
}
