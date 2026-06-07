import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useJackStore } from '../store/useJackStore'
import { NPCS } from '../data/npcs'
import { MONOLOGUES } from '../data/monologues'
import { getCidade, getLocaisVisiveis, getCidadeNavegacao } from '../data/cidades'
import { CASOS } from '../data/casos'

export default function Vila() {
  const { t } = useLanguage()
  const store = useJackStore()
  const [cidadeId, setCidadeId] = useState(store.cidadeAtual || 'marelia')
  const [tempoParado, setTempoParado] = useState(0)
  const timerRef = useRef(null)

  const cidade = getCidade(cidadeId)
  const nav = getCidadeNavegacao(cidadeId)
  const locais = getLocaisVisiveis(cidadeId, store.flags)

  useEffect(() => {
    store.setCidade(cidadeId)
  }, [cidadeId])

  useEffect(() => {
    if (cidadeId !== 'marelia') return
    timerRef.current = setInterval(() => {
      setTempoParado(t => {
        if (t >= 60 && !store.flags.ESCADARIA_VISITADA) {
          if (!locais.find(l => l.id === 'escadaria')) {
            // Escadaria aparece
          }
          return t
        }
        return t + 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [cidadeId])

  const podeNavegar = (direcao) => {
    if (direcao === 'anterior') return !!nav.anterior
    if (direcao === 'proxima') {
      if (cidadeId === 'marelia') return !!(store.flags.AURANIS_LIBERADO)
      if (cidadeId === 'auranis') return !!(store.flags.KARNAZAR_LIBERADO)
      return false
    }
    return false
  }

  // Determinar próximo objetivo (card que deve glow)
  const getNextObjectiveId = () => {
    const f = store.flags || {}
    const dc = store.dungeonsCompletas || []
    if (!f.TEM_BENGALA) return 'paje'
    if (dc.length === 0) return null // manual: tem que ir pra dungeon
    if (dc.includes('onibus') && !dc.includes('rua')) return null // dungeon
    if (dc.includes('onibus') && !f.KIM_LIBERADO) return 'kim'
    if (dc.includes('rua') && !f.NINA_LIBERADO) return 'nina'
    if (dc.includes('rua') && !f.OSVALDO_LIBERADO) return 'osvaldo'
    if (f.KIM_LIBERADO && store.cervejasPorSegundo < 2) return 'kim'
    if (f.OSVALDO_LIBERADO && !store.equipado.armadura) return 'osvaldo'
    if (store.notas > 100 && store.cervejas > 300) return 'kim'
    return null
  }
  const nextId = getNextObjectiveId()

  // Verificar casos disponíveis nesta cidade
  const casoDisponivel = Object.values(CASOS).find(c => {
    if (store.casosResolvidos?.includes(c.id)) return false
    if (store.casoAtivo) return false
    if (c.flagRequisito && !store.flags[c.flagRequisito]) return false
    if (c.cidade !== cidadeId && c.cidade !== 'revisita') return false
    // Caso 4: revisita em qualquer cidade, precisa dos 3 anteriores resolvidos
    if (c.cidade === 'revisita') {
      return store.casosResolvidos?.length >= 3
    }
    return true
  })

  const irParaCidade = (id) => {
    if (id === 'auranis' && !store.flags.AURANIS_LIBERADO) return
    if (id === 'karnazar' && !store.flags.KARNAZAR_LIBERADO) return
    setCidadeId(id)
  }

  return (
    <motion.div className="jdc-vila" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Skyline */}
      <div className="jdc-vila-bg">
        <div className="jdc-vila-skyline">
          {cidade.skyline.map((e, i) => <span key={i}>{e}</span>)}
        </div>
        <div className="jdc-vila-periodo">
          {store.periodo === 'DIA' ? t('games.jackcandy.vila_dia') : t('games.jackcandy.vila_noite')}
        </div>
      </div>

      <div className="jdc-vila-title">{cidade.nome}</div>
      <p className="jack-text jack-text--dim" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
        {cidade.desc}
      </p>

      {/* Navegação entre cidades */}
      <div className="jdc-vila-nav-cidades">
        <button
          className={`jdc-sb-btn ${!podeNavegar('anterior') ? 'jdc-sb-btn--disabled' : ''}`}
          onClick={() => podeNavegar('anterior') && irParaCidade(nav.anterior)}
          disabled={!podeNavegar('anterior')}
        >◀ {nav.anterior ? getCidade(nav.anterior).nome : ''}</button>
        <div className="jdc-vila-nav-indicador">
          {['marelia', 'auranis', 'karnazar'].map(id => (
            <span key={id} className={`jdc-vila-nav-dot ${id === cidadeId ? 'jdc-vila-nav-dot--active' : ''} ${!store.flags.AURANIS_LIBERADO && id !== 'marelia' ? 'jdc-vila-nav-dot--locked' : ''}`} />
          ))}
        </div>
        <button
          className={`jdc-sb-btn ${!podeNavegar('proxima') ? 'jdc-sb-btn--disabled' : ''}`}
          onClick={() => podeNavegar('proxima') && irParaCidade(nav.proxima)}
          disabled={!podeNavegar('proxima')}
        >{nav.proxima ? getCidade(nav.proxima).nome : ''} ▶</button>
      </div>

      {/* Grid de locais */}
      <div className="jdc-vila-grid">
        {/* Caso em andamento — sempre visível no topo */}
        {store.casoAtivo && (() => {
          const casoAtivo = CASOS[store.casoAtivo]
          if (!casoAtivo) return null
          return (
            <motion.button
              className="jdc-vila-card jdc-vila-card--glow"
              onClick={() => store.setFase('dossier')}
              whileHover={{ scale: 1.03, borderColor: '#EC4899' }}
              whileTap={{ scale: 0.97 }}
              style={{ borderLeftColor: '#EC4899', gridColumn: '1 / -1' }}
            >
              <div className="jdc-vila-card-emoji">🔍</div>
              <div className="jdc-vila-card-info">
                <span className="jdc-vila-card-nome" style={{ color: '#EC4899' }}>
                  {t('games.jackcandy.vila_caso_andamento')}
                </span>
                <span className="jdc-vila-card-desc">{casoAtivo.nome}</span>
                <span className="jdc-vila-card-detail" style={{ color: '#F5A623' }}>
                  {t('games.jackcandy.vila_progresso_caso', { pistas: store.pistasColetadas.length, restantes: casoAtivo.locais.length - store.locaisVisitados.length })}
                </span>
              </div>
              <div className="jdc-vila-card-arrow" style={{ color: '#EC4899' }}>→</div>
            </motion.button>
          )
        })()}

        {/* Caso disponível — card destacado */}
        {casoDisponivel && (
          <motion.button
            className="jdc-vila-card jdc-vila-card--glow"
            onClick={() => {
              store.iniciarCaso(casoDisponivel.id, casoDisponivel.suspeitos)
              store.setMonologo(casoDisponivel.abertura[0])
            }}
            whileHover={{ scale: 1.03, borderColor: '#EC4899' }}
            whileTap={{ scale: 0.97 }}
            style={{ borderLeftColor: '#EC4899', gridColumn: '1 / -1' }}
          >
            <div className="jdc-vila-card-emoji">📋</div>
            <div className="jdc-vila-card-info">
              <span className="jdc-vila-card-nome" style={{ color: '#EC4899' }}>
                NOVO CASO
              </span>
              <span className="jdc-vila-card-desc">{casoDisponivel.nome}</span>
              <span className="jdc-vila-card-detail" style={{ color: '#EC4899' }}>
                {casoDisponivel.cliente ? t('games.jackcandy.vila_cliente', { nome: casoDisponivel.cliente }) : t('games.jackcandy.vila_sem_cliente')}
              </span>
            </div>
            <div className="jdc-vila-card-arrow" style={{ color: '#EC4899' }}>→</div>
          </motion.button>
        )}

        {locais.map(local => {
          const locked = local.requerFlag && !store.flags[local.requerFlag]
          const done = store.flags[local.requerFlag] && local.interior === false && !local.npc
          const npc = local.npc ? NPCS[local.npc] : null

          return (
            <motion.button
              key={local.id}
              className={`jdc-vila-card ${locked ? 'jdc-vila-card--locked' : ''} ${local.id === nextId ? 'jdc-vila-card--glow' : ''}`}
              onClick={() => {
                if (locked) return
                if (local.dungeon) {
                  store.setFase(`dungeon_${local.dungeon}`)
                } else if (local.npc) {
                  store.setFase(`interior_${local.npc}`)
                } else if (local.id === 'cortico') {
                  store.setMonologo(MONOLOGUES.entra_cortico)
                } else if (local.id === 'terminal' || local.id === 'terminal_auranis') {
                  store.setMonologo(MONOLOGUES.terminal_ouviu)
                  const atual = store.flags.TERMINAL_OUVIDAS
                  const contagem = (typeof atual === 'number' ? atual : atual ? 1 : 0) + 1
                  useJackStore.setState(s => ({ flags: { ...s.flags, TERMINAL_OUVIDAS: contagem } }))
                  if (contagem >= 3) {
                    store.setFlag('TERMINAL_OUVIU')
                    const dc = store.dungeonsCompletas || []
                    if (dc.includes('onibus') && dc.includes('rua') && store.nivel >= 8) {
                      store.setFlag('AURANIS_LIBERADO')
                    }
                  }
                } else if (local.id === 'escuro') {
                  store.setFlag('ESCURO_VISITADO')
                  store.setMonologo(MONOLOGUES.entra_escuro)
                } else if (local.id === 'escadaria') {
                  store.setFlag('ESCADARIA_VISITADA')
                  store.setMonologo(MONOLOGUES.escadaria_monologo)
                }
              }}
              disabled={locked}
              whileHover={{ scale: locked ? 1 : 1.03, borderColor: local.cor }}
              whileTap={{ scale: locked ? 1 : 0.97 }}
              style={{ borderLeftColor: local.cor }}
            >
              <div className="jdc-vila-card-emoji">{locked ? '🔒' : local.emoji}</div>
              <div className="jdc-vila-card-info">
                <span className="jdc-vila-card-nome" style={{ color: locked ? '#444' : '#C8C8C8' }}>
                  {local.nome}
                </span>
                <span className="jdc-vila-card-desc">
                  {locked ? t('games.jackcandy.vila_trancado') : (npc?.saudacao || local.desc)}
                </span>
                {local.dungeon && !locked && (
                  <span className="jdc-vila-card-detail">{t('games.jackcandy.vila_dungeon')}</span>
                )}
              </div>
              <div className="jdc-vila-card-arrow" style={{ color: local.cor }}>→</div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
