import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useJackStore } from '../store/useJackStore'
import { CASOS } from '../data/casos'

export default function CasoSelect() {
  const { t } = useLanguage()
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
      <h2 className="jdc-dungeon-select-title">{t('games.jackcandy.casoselect_titulo')}</h2>
      <p className="jack-text jack-text--dim jdc-casoselect-sub">
        {t('games.jackcandy.casoselect_sub')}
      </p>

      {casosDisponiveis.length === 0 && casosResolvidos.length === 0 && (
        <p className="jack-text jack-text--dim jdc-text-center">
          {t('games.jackcandy.casoselect_vazio')}
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
          <span className="jdc-icon-lg">📋</span>
          <div className="jdc-flex-left">
            <span className="jack-text" style={{ fontSize: '0.85rem' }}>
              {caso.nome}
              {store.casoAtivo === caso.id && (
                <span className="jack-text--amber jdc-badge-ongoing">{t('games.jackcandy.casoselect_andamento')}</span>
              )}
            </span>
            <span className="jack-text--dim jdc-casoselect-detail">
              {caso.cidade} · {caso.suspeitos.length} suspeitos · {caso.pistasNecessarias} pistas mínimas
            </span>
            <span className="jack-text--dim jdc-casoselect-client">
              {t('games.jackcandy.casoselect_cliente', { nome: caso.cliente || t('games.jackcandy.casoselect_anonimo') })}
            </span>
          </div>
          <span className="jdc-arrow-amber">→</span>
        </motion.button>
      ))}

      {casosResolvidos.length > 0 && (
        <div className="jdc-casoselect-resolvidos-wrap">
          <p className="jack-text jack-text--dim jdc-casoselect-resolvidos-label">
            {t('games.jackcandy.casoselect_resolvidos')}
          </p>
          {casosResolvidos.map(caso => (
            <div key={caso.id} className="jdc-dungeon-card"
              className="jdc-casoselect-resolvido-card" style={{ borderLeftColor: '#22C55E' }}>
              <span className="jdc-icon-lg">✅</span>
              <div className="jdc-flex-left">
                <span className="jack-text jdc-text-sm">{caso.nome}</span>
                <span className="jack-text--dim jdc-casoselect-resolvido-desc">
                  {caso.resolucao?.monologo?.substring(0, 70)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="jdc-casoselect-footer">
        <button className="jack-btn jdc-btn-xs" onClick={() => store.setFase('vila')}>
          {t('games.jackcandy.voltar')}
        </button>
      </div>
    </motion.div>
  )
}
