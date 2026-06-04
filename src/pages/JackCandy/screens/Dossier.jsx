import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { CASOS } from '../data/casos'
import { PISTAS } from '../data/pistas'
import PistaCard from '../components/PistaCard'

export default function Dossier() {
  const store = useJackStore()
  const caso = CASOS[store.casoAtivo]
  const [showAcusar, setShowAcusar] = useState(false)
  const [resolucaoAtiva, setResolucaoAtiva] = useState(false)
  const [casoResolvidoId, setCasoResolvidoId] = useState(null)

  if (!caso && !resolucaoAtiva) {
    store.setFase('vila')
    return null
  }

  const pistasSuficientes = store.pistasColetadas.length >= caso.pistasNecessarias
  const suspeitosAtivos = store.suspeitos.filter(s => s.status === 'ativo')

  const handleAcusar = (suspeitoId) => {
    const suspeitoDoCaso = caso.suspeitos.find(x => x.id === suspeitoId)
    console.log('[DOSSIER] acusando:', suspeitoId, '| culpado:', suspeitoDoCaso?.culpado)
    console.log('[DOSSIER] confronto:', caso.confronto)
    if (suspeitoDoCaso?.culpado) {
      store.acusar(suspeitoId)
      setCasoResolvidoId(caso.id)
      store.resolverCaso(caso.flagResolucao)
      store.setMonologo('é ele. sempre foi ele.')
      setResolucaoAtiva(true)
      setShowAcusar(false)
      console.log('[DOSSIER] caso resolvido:', caso.id, '| flag:', caso.flagResolucao)
    } else {
      store.acusar(suspeitoId)
      store.acusacaoErrada()
      setShowAcusar(false)
    }
  }

  return (
    <motion.div className="jdc-dossier" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {import.meta.env.DEV && (
        <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button className="jack-btn" style={{ fontSize: '0.6rem', borderColor: '#333', color: '#555' }}
            onClick={() => {
              useJackStore.setState({
                suspeitos: caso.suspeitos.map(s => ({ ...s, status: 'ativo' })),
                pistasColetadas: caso.locais.flatMap(l => l.pistas || []),
                locaisVisitados: caso.locais.map(l => l.id),
                acusacoesErradas: 0,
              })
              console.log('[DEBUG] caso preenchido:', store.casoAtivo)
            }}>
            [debug: preencher caso]
          </button>
          <button className="jack-btn" style={{ fontSize: '0.6rem', borderColor: '#333', color: '#555' }}
            onClick={() => {
              useJackStore.setState({ casoAtivo: null, pistasColetadas: [], suspeitos: [], locaisVisitados: [], acusacoesErradas: 0 })
              console.log('[DEBUG] caso limpo')
            }}>
            [debug: limpar caso]
          </button>
        </div>
      )}

      <div className="jdc-dossier-header">
        <span className="jdc-dossier-titulo">📋 {caso.nome}</span>
        <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ fontSize: '0.7rem' }}>
          [ fechar ]
        </button>
      </div>

      <div className="jdc-dossier-abertura">
        {caso.abertura.map((p, i) => (
          <p key={i} className="jack-text jack-text--dim" style={{ fontStyle: 'italic' }}>{p}</p>
        ))}
      </div>

      <div className="jdc-dossier-suspeitos">
        <p className="jack-text jack-text--amber" style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>SUSPEITOS</p>
        {store.suspeitos.map(s => (
          <div key={s.id} className={`jdc-dossier-suspeito ${s.status === 'eliminado' ? 'jdc-dossier-suspeito--eliminado' : ''} ${s.status === 'acusado' ? 'jdc-dossier-suspeito--acusado' : ''}`}>
            <span>{s.status === 'eliminado' ? '❌' : s.status === 'acusado' ? '🎯' : '👤'}</span>
            <div>
              <span className="jack-text">{s.nome}</span>
              <span className="jack-text--dim" style={{ fontSize: '0.65rem', display: 'block' }}>{s.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="jdc-dossier-pistas">
        <p className="jack-text jack-text--amber" style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
          PISTAS ({store.pistasColetadas.length}/{caso.pistasNecessarias} mínimo)
        </p>
        {store.pistasColetadas.length === 0 && (
          <p className="jack-text jack-text--dim">nenhuma pista ainda. visite os locais do caso.</p>
        )}
        {store.pistasColetadas.map(pid => (
          <PistaCard key={pid} pista={PISTAS[pid]} />
        ))}
        {store.pistasColetadas.length >= caso.pistasNecessarias && (
          <div className="jdc-dossier-dica">
            👓 "você tem evidências suficientes para uma acusação. mas mais pistas aumentam suas chances." — Prof. Máquina
          </div>
        )}
      </div>

      <div className="jdc-dossier-acusar">
        {!showAcusar ? (
          <>
            <button className="jack-btn jack-btn--crimson" onClick={() => setShowAcusar(true)} disabled={!pistasSuficientes}
              style={{ marginBottom: '0.3rem' }}>
              {pistasSuficientes ? '[ acusar ]' : `[ acusar — ${store.pistasColetadas.length}/${caso.pistasNecessarias} pistas ]`}
            </button>
            {suspeitosAtivos.length === 0 && (
              <button className="jack-btn" onClick={() => {
                useJackStore.setState({ suspeitos: caso.suspeitos.map(s => ({ ...s, status: 'ativo' })) })
                setShowAcusar(false)
              }} style={{ fontSize: '0.65rem', borderColor: '#444', color: '#666' }}>
                [ reiniciar suspeitos ]
              </button>
            )}
          </>
        ) : (
          <div>
            <p className="jack-text jack-text--crimson" style={{ fontSize: '0.8rem' }}>quem é o culpado?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
              {suspeitosAtivos.map(s => (
                <button key={s.id} className="jack-btn jack-btn--crimson" onClick={() => handleAcusar(s.id)} style={{ textAlign: 'left' }}>
                  [ {s.nome} ]
                </button>
              ))}
              <button className="jack-btn" onClick={() => setShowAcusar(false)} style={{ fontSize: '0.7rem' }}>
                [ cancelar ]
              </button>
            </div>
            {store.acusacoesErradas > 0 && (
              <p className="jack-text jack-text--dim" style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>
                acusações erradas: {store.acusacoesErradas}. penalidade: -50🍺 cada.
              </p>
            )}
          </div>
        )}
      </div>

      {resolucaoAtiva && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '1rem', marginTop: '1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <p className="jack-text jack-text--amber" style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>
            caso resolvido.
          </p>
          <p className="jack-text jack-text--dim" style={{ fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '1rem' }}>
            {CASOS[casoResolvidoId]?.resolucao?.monologo}
          </p>
          {CASOS[casoResolvidoId]?.confronto?.dungeon && (
            <button className="jack-btn jack-btn--crimson" onClick={() => store.setFase(`dungeon_${CASOS[casoResolvidoId].confronto.dungeon}`)}>
              [ confronto final ]
            </button>
          )}
          {CASOS[casoResolvidoId]?.confronto?.especial === 'interrogatorio' && (
            <button className="jack-btn jack-btn--crimson" onClick={() => store.setFase('interrogatorio')}>
              [ interrogatório ]
            </button>
          )}
          <br />
          <button className="jack-btn" onClick={() => store.setFase('caso_select')} style={{ marginTop: '0.5rem' }}>
            [ voltar aos casos ]
          </button>
        </motion.div>
      )}

      <div className="jdc-dossier-locais">
        <p className="jack-text jack-text--amber" style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
          LOCAIS PARA INVESTIGAR
        </p>
        {caso.locais.map(loc => {
          const visitado = store.locaisVisitados.includes(loc.id)
          return (
            <button key={loc.id} className={`jdc-dossier-local ${visitado ? 'jdc-dossier-local--visitado' : ''}`}
              onClick={() => { store.setMonologo(loc.desc); store.setFase(`investigar_${loc.id}`) }}
              style={{ borderLeftColor: visitado ? '#22C55E' : '#F5A623' }}>
              <span>{visitado ? '✅' : '🔍'}</span>
              <div className="jdc-dossier-local-info">
                <span className="jack-text" style={{ fontSize: '0.8rem' }}>{loc.nome}</span>
                {!visitado && <span className="jack-text--dim" style={{ fontSize: '0.65rem', display: 'block' }}>{loc.desc}</span>}
                {loc.puzzle && !visitado && <span className="jack-text--amber" style={{ fontSize: '0.6rem', display: 'block' }}>🧩 {loc.puzzleLabel}</span>}
                {loc.dungeon && !visitado && <span className="jack-text--crimson" style={{ fontSize: '0.6rem', display: 'block' }}>⚔️ {loc.dungeonLabel}</span>}
              </div>
              <span className="jdc-dossier-local-arrow">→</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
