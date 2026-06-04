import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { NPCS } from '../data/npcs'

const MAPA = [
  '                    M A R E L I A                    ',
  '     _______________________________________________',
  '    /                                               \\',
  '   |   [BOTECO]      [DELEGACIA]    [OFICINA]       |',
  '   |   DO JAZZ       DA NINA        DO OSVALDO      |',
  '   |   ______        ______         ______          |',
  '   |  /      \\      /      \\       /      \\        |',
  '   | | o    o |    | o    o |     | o    o |        |',
  '   |  \\______/      \\______/       \\______/         |',
  '   |         [BARRACA DO PAJÉ]                      |',
  '   |              ___                                |',
  '   |             /   \\                               |',
  '   |            | ~~~ |                              |',
  '   |             \\___/                               |',
  '   |    ==========[PORTAL LDI]==========             |',
  '   |_______________________________________________/',
]

const NPC_MAP = {
  'BOTECO': 'kim',
  'DELEGACIA': 'nina',
  'OFICINA': 'osvaldo',
  'BARRACA DO PAJÉ': 'paje',
}

export default function Vila() {
  const store = useJackStore()
  const [hover, setHover] = useState(null)

  const handleClick = (npcId) => {
    const npc = NPCS[npcId]
    if (!npc) return
    if (npc.requerFlag && !store.flags[npc.requerFlag]) return
    store.setFase(`interior_${npcId}`)
  }

  return (
    <motion.div className="jdc-vila" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-vila-title">M A R E L I A</div>
      <div className="jdc-vila-map">
        <pre className="jdc-vila-ascii">
          {MAPA.map((linha, y) => (
            <div key={y} style={{ position: 'relative' }}>
              {Object.entries(NPC_MAP).map(([nome, npcId]) => {
                const idx = linha.indexOf(nome)
                if (idx === -1) return null
                const npc = NPCS[npcId]
                const locked = npc?.requerFlag && !store.flags[npc.requerFlag]
                return (
                  <span
                    key={npcId}
                    className={`jdc-vila-npc ${locked ? 'jdc-vila-npc--locked' : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${idx * 0.6}ch`,
                      cursor: locked ? 'not-allowed' : 'pointer',
                      opacity: locked ? 0.3 : 1,
                    }}
                    onClick={() => handleClick(npcId)}
                    onMouseEnter={() => setHover(npcId)}
                    onMouseLeave={() => setHover(null)}
                  >
                    {nome}
                  </span>
                )
              })}
              <span>{linha}</span>
            </div>
          ))}
        </pre>
      </div>
      {hover && <p className="jack-text jack-text--dim">[ {NPCS[hover]?.nome} ] {NPCS[hover]?.saudacao}</p>}
    </motion.div>
  )
}
