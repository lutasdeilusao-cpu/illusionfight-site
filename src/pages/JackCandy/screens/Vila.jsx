import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { NPCS } from '../data/npcs'
import { MONOLOGUES } from '../data/monologues'
import { getCidade, getLocaisVisiveis, getCidadeNavegacao } from '../data/cidades'

export default function Vila() {
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
          {store.periodo === 'DIA' ? '☀️ DIA' : '🌙 NOITE'}
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
        {locais.map(local => {
          const locked = local.requerFlag && !store.flags[local.requerFlag]
          const done = store.flags[local.requerFlag] && local.interior === false && !local.npc
          const npc = local.npc ? NPCS[local.npc] : null

          return (
            <motion.button
              key={local.id}
              className={`jdc-vila-card ${locked ? 'jdc-vila-card--locked' : ''}`}
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
                  const contagem = (store.flags.TERMINAL_OUVIDAS || 0) + 1
                  store.setFlag('TERMINAL_OUVIDAS')
                  if (contagem >= 3) store.setFlag('TERMINAL_OUVIU')
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
                  {locked ? 'trancado' : (npc?.saudacao || local.desc)}
                </span>
                {local.dungeon && !locked && (
                  <span className="jdc-vila-card-detail">⚔️ dungeon</span>
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
