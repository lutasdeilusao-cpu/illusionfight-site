import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useJackStore } from '../store/useJackStore'
import { useEventos } from '../../../../context/EventosContext'
import { CASOS } from '../data/casos'
import { PISTAS } from '../data/pistas'
import PistaCard from '../components/PistaCard'
import DialogoCaso from '../components/DialogoCaso'

export default function Dossier() {
  const { t } = useLanguage()
  const { registrarEvento } = useEventos()
  const store = useJackStore()
  const casoRef = useRef(null)
  const caso = CASOS[store.casoAtivo]
  if (caso && !casoRef.current) casoRef.current = caso
  const casoAtivo = casoRef.current || caso

  const [showAcusar, setShowAcusar] = useState(false)
  const [resolucaoAtiva, setResolucaoAtiva] = useState(false)
  const [casoResolvidoId, setCasoResolvidoId] = useState(null)

  console.log('[DOSSIER] render | casoAtivo:', casoAtivo?.id, '| resolucaoAtiva:', resolucaoAtiva, '| store.casoAtivo:', store.casoAtivo)

  if (!casoAtivo && !resolucaoAtiva) {
    store.setFase('caso_select')
    return null
  }

  const pistasSuficientes = (store.pistasColetadas?.length || 0) >= (casoAtivo?.pistasNecessarias || 0)
  const suspeitosAtivos = store.suspeitos?.filter(s => s.status === 'ativo') || []

  const handleAcusar = (suspeitoId) => {
    if (!casoAtivo) return
    const suspeitoDoCaso = casoAtivo.suspeitos.find(x => x.id === suspeitoId)
    console.log('[DOSSIER] acusando:', suspeitoId, '| culpado:', suspeitoDoCaso?.culpado)
    console.log('[DOSSIER] confronto:', casoAtivo.confronto)
    if (suspeitoDoCaso?.culpado) {
      store.acusar(suspeitoId)
      setResolucaoAtiva(true)
      setShowAcusar(false)
      setCasoResolvidoId(casoAtivo.id)
      store.setMonologo('Ã© ele. sempre foi ele.')
      registrarEvento('jack_caso', 'Resolveu um caso no Jack Dream Beer', 1)
      registrarEvento('jogo_jogado', 'Jogou Jack Dream Beer', 1)
      store.resolverCaso(casoAtivo.flagResolucao)
      console.log('[DOSSIER] caso resolvido:', casoAtivo.id, '| flag:', casoAtivo.flagResolucao)
    } else {
      store.acusar(suspeitoId)
      store.acusacaoErrada()
      setShowAcusar(false)
    }
  }

  return (
    <motion.div className="jdc-dossier" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {true && (
        <div className="jdc-dossier-debug">
          <button className="jack-btn jdc-dossier-debug-btn"
            onClick={() => {
              if (!casoAtivo) return
              useJackStore.setState({
                suspeitos: casoAtivo.suspeitos.map(s => ({ ...s, status: 'ativo' })),
                pistasColetadas: casoAtivo.locais.flatMap(l => l.pistas || []),
                locaisVisitados: casoAtivo.locais.map(l => l.id),
                acusacoesErradas: 0,
              })
              console.log('[DEBUG] caso preenchido:', store.casoAtivo)
            }}>
            [debug: preencher caso]
          </button>
          <button className="jack-btn" style={{ fontSize: '0.6rem', borderColor: '#333', color: '#555' }}
            onClick={() => {
              useJackStore.setState({ casoAtivo: null, pistasColetadas: [], suspeitos: [], locaisVisitados: [], acusacoesErradas: 0 })
              casoRef.current = null
              console.log('[DEBUG] caso limpo')
            }}>
            [debug: limpar caso]
          </button>
        </div>
      )}

      {casoAtivo && (
        <>
          <div className="jdc-dossier-header">
            <span className="jdc-dossier-titulo">ðŸ“‹ {casoAtivo.nome}</span>
            <button className="jack-btn jdc-btn-xs" onClick={() => store.setFase('vila')}>
              [ fechar ]
            </button>
          </div>

          <div className="jdc-dossier-abertura">
            {casoAtivo.abertura.map((p, i) => (
              <p key={i} className="jack-text jack-text--dim jdc-dossier-abertura-texto">{p}</p>
            ))}
          </div>

          <div className="jdc-dossier-suspeitos">
            <p className="jack-text jack-text--amber jdc-dossier-section-title">{t('games.jackcandy.dossier_suspeitos')}</p>
            {store.suspeitos.map(s => (
              <div key={s.id} className={`jdc-dossier-suspeito ${s.status === 'eliminado' ? 'jdc-dossier-suspeito--eliminado' : ''} ${s.status === 'acusado' ? 'jdc-dossier-suspeito--acusado' : ''}`}>
                <span>{s.status === 'eliminado' ? 'âŒ' : s.status === 'acusado' ? 'ðŸŽ¯' : 'ðŸ‘¤'}</span>
                <div>
                  <span className="jack-text">{s.nome}</span>
                  <span className="jack-text--dim jdc-dossier-suspeito-desc">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="jdc-dossier-pistas">
            <p className="jack-text jack-text--amber jdc-dossier-section-title">
              {t('games.jackcandy.dossier_pistas', { n: store.pistasColetadas.length, total: casoAtivo.pistasNecessarias })}
            </p>
            {store.pistasColetadas.length === 0 && (
              <p className="jack-text jack-text--dim">{t('games.jackcandy.dossier_sem_pistas')}</p>
            )}
            {store.pistasColetadas.map(pid => (
              <PistaCard key={pid} pista={PISTAS[pid]} />
            ))}
            {store.pistasColetadas.length >= casoAtivo.pistasNecessarias && (
              <div className="jdc-dossier-dica">
                {t('games.jackcandy.dossier_dica')}
              </div>
            )}
          </div>

          <div className="jdc-dossier-acusar">
            {!showAcusar ? (
              <>
                <button className="jack-btn jack-btn--crimson jdc-mb-03" onClick={() => setShowAcusar(true)} disabled={!pistasSuficientes}>
                  {pistasSuficientes ? t('games.jackcandy.dossier_acusar') : t('games.jackcandy.dossier_acusar_incompleto', { n: store.pistasColetadas.length, total: casoAtivo.pistasNecessarias })}
                </button>
                {suspeitosAtivos.length === 0 && (
                  <button className="jack-btn jdc-dossier-restart-btn" onClick={() => {
                    useJackStore.setState({ suspeitos: casoAtivo.suspeitos.map(s => ({ ...s, status: 'ativo' })) })
                    setShowAcusar(false)
                  }}>
                    {t('games.jackcandy.dossier_reiniciar')}
                  </button>
                )}
              </>
            ) : (
              <div>
                <p className="jack-text jack-text--crimson jdc-dossier-culpado-title">{t('games.jackcandy.dossier_culpado')}</p>
                <div className="jdc-dossier-culpado-list">
                  {suspeitosAtivos.map(s => (
                    <button key={s.id} className="jack-btn jack-btn--crimson jdc-dossier-acusar-btn" onClick={() => handleAcusar(s.id)}>
                      [ {s.nome} ]
                    </button>
                  ))}
                  <button className="jack-btn jdc-btn-xs" onClick={() => setShowAcusar(false)}>
                    {t('games.jackcandy.dossier_cancelar')}
                  </button>
                </div>
                {store.acusacoesErradas > 0 && (
                  <p className="jack-text jack-text--dim jdc-dossier-penalidade">
                    {t('games.jackcandy.dossier_penalidade', { n: store.acusacoesErradas })}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="jdc-dossier-locais">
            <p className="jack-text jack-text--amber jdc-dossier-section-title">
              {t('games.jackcandy.dossier_locais')}
            </p>
            {casoAtivo.locais.map(loc => {
              const visitado = store.locaisVisitados.includes(loc.id)
              return (
                <button key={loc.id} className={`jdc-dossier-local ${visitado ? 'jdc-dossier-local--visitado' : ''}`}
                  onClick={() => { store.setMonologo(loc.desc); store.setFase(`investigar_${loc.id}`) }}
                  style={{ borderLeftColor: visitado ? '#22C55E' : '#F5A623' }}>
                  <span>{visitado ? 'âœ…' : 'ðŸ”'}</span>
                  <div className="jdc-dossier-local-info">
                    <span className="jack-text jdc-dossier-local-nome">{loc.nome}</span>
                    {!visitado && <span className="jack-text--dim jdc-dossier-local-desc">{loc.desc}</span>}
                    {loc.puzzle && !visitado && <span className="jack-text--amber jdc-dossier-local-tag">ðŸ§© {loc.puzzleLabel}</span>}
                    {loc.dungeon && !visitado && <span className="jack-text--crimson jdc-dossier-local-tag">âš”ï¸ {loc.dungeonLabel}</span>}
                  </div>
                  <span className="jdc-dossier-local-arrow">â†’</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {resolucaoAtiva && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="jdc-mt-1">
          <p className="jack-text jack-text--amber jdc-dossier-resolvido-title">
            {t('games.jackcandy.dossier_resolvido')}
          </p>
          <div className="jdc-caso-dialogo">
            <DialogoCaso
              linhas={CASOS[casoResolvidoId]?.dialogoResolucao
                || [{ personagem: 'jack', texto: CASOS[casoResolvidoId]?.resolucao?.monologo || 'resolvido.' }]}
              onFim={() => {
                const casoData = CASOS[casoResolvidoId]
                if (casoData?.confronto?.dungeon) {
                  store.setFase(`dungeon_${casoData.confronto.dungeon}`)
                } else if (casoData?.confronto?.especial === 'interrogatorio') {
                  store.setFase('interrogatorio')
                } else {
                  store.setFase('caso_select')
                }
              }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
