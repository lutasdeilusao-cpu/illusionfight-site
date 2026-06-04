import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { NPCS } from '../data/npcs'

const MAPA = [
  '                M A R E L I A',
  '    _______________________________',
  '   /                               \\',
  '  |    ___       ___       ___      |',
  '  |   |   |     |   |     |   |     |',
  '  |   | o |     | o |     | o |     |',
  '  |   |___|     |___|     |___|     |',
  '  |                                 |',
  '  |             ___                 |',
  '  |            |   |                |',
  '  |            | ~ |                |',
  '  |            |___|                |',
  '  |                                 |',
  '  |                                 |',
  '  |___________[PORTAL]______________|',
]

const NPC_LIST = [
  { id: 'paje', nome: 'Pajé', icon: '⛺', desc: 'Barraca do Pajé' },
  { id: 'kim', nome: 'Kim', icon: '🍺', desc: 'Boteco do Jazz', req: null },
  { id: 'nina', nome: 'Nina', icon: '⭐', desc: 'Delegacia da Nina', req: 'NINA_LIBERADO' },
  { id: 'osvaldo', nome: 'Osvaldo', icon: '🔧', desc: 'Oficina do Osvaldo', req: 'OSVALDO_LIBERADO' },
]

export default function Vila() {
  const store = useJackStore()

  return (
    <motion.div className="jdc-vila" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-vila-title">M A R E L I A</div>
      <pre className="jdc-vila-ascii" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {MAPA.map((l, i) => <div key={i}>{l}</div>)}
      </pre>
      {!store.dungeonsCompletas.includes('onibus') && (
        <p className="jack-text jack-text--dim" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          🚌 dungeon disponível: O Ônibus (clique DUN na barra superior)
        </p>
      )}
      {store.dungeonsCompletas.includes('onibus') && !store.dungeonsCompletas.includes('rua') && (
        <p className="jack-text jack-text--dim" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          🏙️ dungeon disponível: A Rua de Marelia (clique DUN)
        </p>
      )}
      <div className="jdc-vila-npcs">
        {NPC_LIST.map(npc => {
          const locked = npc.req && !store.flags[npc.req]
          return (
            <button
              key={npc.id}
              className={`jdc-vila-npc-btn ${locked ? 'jdc-vila-npc-btn--locked' : ''}`}
              onClick={() => {
                if (locked) return
                store.setFase(`interior_${npc.id}`)
              }}
              disabled={locked}
            >
              <span className="jdc-vila-npc-icon">{npc.icon}</span>
              <span className="jdc-vila-npc-nome">{npc.nome}</span>
              <span className="jdc-vila-npc-desc">{npc.desc}</span>
              {locked && <span className="jdc-vila-npc-lock">🔒</span>}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
