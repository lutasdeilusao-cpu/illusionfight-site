import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useJackStore } from '../store/useJackStore'
import { CASOS } from '../data/casos'

export default function CasoSelect() {
  const store = useJackStore()

  const casosDisponiveis = Object.values(CASOS).filter(c => {
    if (store.casosResolvidos?.includes(c.id)) return false
    if (store.casoAtivo === c.id) return true
    if (c.flagRequisito && !store.flags[c.flagRequisito]) return false
    return true
  })

  const casosResolvidos = Object.values(CASOS).filter(c =>
    store.casosResolvidos?.includes(c.id)
  )

  useEffect(() => {
    console.log('[CASOS] disponíveis:', casosDisponiveis.map(c => c.id))
    console.log('[CASOS] resolvidos:', casosResolvidos.map(c => c.id))
  }, [store.casosResolvidos, store.flags])

  return (
    <motion.div className="jdc-dungeon-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="jdc-dungeon-select-title">CASOS</h2>
      <p className="jack-text jack-text--dim" style={{ textAlign: 'center', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
        investigue. acuse. resolva.
      </p>

      {casosDisponiveis.length === 0 && casosResolvidos.length === 0 && (
        <p className="jack-text jack-text--dim" style={{ textAlign: 'center' }}>
          nenhum caso disponível ainda.
        </p>
      )}

      {casosDisponiveis.map(caso => (
        <motion.button
          key={caso.id}
          className="jdc-dungeon-card"
          style={{ borderLeftColor: store.casoAtivo === caso.id ? '#EC4899' : '#F5A623' }}
          onClick={() => {
            if (store.casoAtivo === caso.id) {
              store.setFase('dossier')
            } else {
              useJackStore.setState({ _casoPreview: caso.id })
              store.setFase('caso_abertura')
            }
          }}
          whileHover={{ x: 4 }}
        >
          <span style={{ fontSize: '1.2rem' }}>📋</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span className="jack-text" style={{ fontSize: '0.85rem' }}>
              {caso.nome}
              {store.casoAtivo === caso.id && (
                <span className="jack-text--amber" style={{ fontSize: '0.65rem', marginLeft: '0.5rem' }}>● em andamento</span>
              )}
            </span>
            <span className="jack-text--dim" style={{ fontSize: '0.65rem', display: 'block' }}>
              {caso.cidade} · {caso.suspeitos.length} suspeitos · {caso.pistasNecessarias} pistas mínimas
            </span>
            <span className="jack-text--dim" style={{ fontSize: '0.6rem', fontStyle: 'italic', display: 'block', marginTop: '0.2rem' }}>
              cliente: {caso.cliente || 'anônimo'}
            </span>
          </div>
          <span style={{ color: '#F5A623' }}>→</span>
        </motion.button>
      ))}

      {casosResolvidos.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <p className="jack-text jack-text--dim" style={{ fontSize: '0.7rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            RESOLVIDOS
          </p>
          {casosResolvidos.map(caso => (
            <div key={caso.id} className="jdc-dungeon-card"
              style={{ borderLeftColor: '#22C55E', opacity: 0.6, cursor: 'default' }}>
              <span style={{ fontSize: '1.2rem' }}>✅</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <span className="jack-text" style={{ fontSize: '0.85rem' }}>{caso.nome}</span>
                <span className="jack-text--dim" style={{ fontSize: '0.65rem', fontStyle: 'italic', display: 'block' }}>
                  {caso.resolucao?.monologo?.substring(0, 70)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ fontSize: '0.7rem' }}>
          [ voltar ]
        </button>
      </div>
    </motion.div>
  )
}
