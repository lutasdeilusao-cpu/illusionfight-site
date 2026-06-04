import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePPStore } from '../store/usePPStore'
import { getCaso, getLocaisParaCaso, getPistasParaCaso, getSuspeitosParaCaso } from '../data/resolver'
import { useAuth } from '../../../context/AuthContext'

export default function Dossier() {
  const { user } = useAuth()
  const store = usePPStore()
  const caso = getCaso(store.casoAtivo)
  const [showAcusar, setShowAcusar] = useState(false)
  const [resultado, setResultado] = useState(null)

  if (!caso || !store.casoDados) { store.setFase('mapa'); return null }

  const locais = getLocaisParaCaso(caso.id)
  const pistas = getPistasParaCaso(caso.id)
  const suspeitos = getSuspeitosParaCaso(caso.id)
  const casoDados = store.casoDados
  const pistasColetadas = casoDados.pistasCaso || []
  const pistasSuficientes = pistasColetadas.length >= caso.pistasNecessarias

  const handleAcusar = (suspeitoId) => {
    store.acusar(suspeitoId)
    if (suspeitoId === caso.culpado) {
      // Calcular reputação
      const erradas = casoDados.acusacoesErradas || 0
      const bonusPistas = pistasColetadas.length >= caso.pistas.length ? 0.2 : 0
      const bonusFio = caso.fios.filter(f => pistasColetadas.includes(f)).length * 0.1
      let multiplicador = erradas === 0 ? 1.0 : erradas === 1 ? 0.7 : 0.4
      multiplicador += bonusPistas + bonusFio
      const ganho = Math.floor(caso.reputacao_ganho * Math.min(multiplicador, 1.5))
      store.ganharReputacao(ganho)
      store.resolverCaso(caso.id)
      if (user) store.saveToCloud(user.id)
      setResultado({ tipo: 'culpado', ganho })
    } else {
      store.acusacaoErrada()
      setResultado({ tipo: 'inocente' })
      setTimeout(() => setResultado(null), 2000)
    }
  }

  if (resultado?.tipo === 'culpado') {
    return (
      <div className="pp-container">
        <div className="pp-resol-card">
          <div className="pp-resol-nome">{caso.nome} — Resolvido</div>
          <div className="pp-resol-badge">CASO ENCERRADO</div>
          <div className="pp-resol-rep">+{resultado.ganho} reputação</div>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
            {caso.dialogoResolucao.map((l, i) => (
              <span key={i} style={{ display: 'block', marginBottom: 8, color: l.personagem === 'jack' ? '#00FF88' : l.personagem === 'kim' ? '#F5A623' : '#888', fontStyle: l.personagem === 'narração' ? 'italic' : 'normal' }}>
                {l.texto}
              </span>
            ))}
          </p>
          <button className="pp-btn pp-btn--primary" onClick={() => { store.setFase('mapa'); if (user) store.saveToCloud(user.id) }}>
            VOLTAR AO MAPA
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pp-container">
      <div className="pp-dossier-header">
        <button className="pp-back" onClick={() => store.setFase('mapa')}>← mapa</button>
        <h2 style={{ color: '#F5A623', margin: 0 }}>{caso.nome}</h2>
      </div>

      {resultado?.tipo === 'inocente' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#8B0000', textAlign: 'center', padding: 10, border: '1px solid #8B0000', marginBottom: 12 }}>
          Inocente! Você perdeu reputação.
        </motion.div>
      )}

      {/* Suspeitos */}
      <div className="pp-section">
        <div className="pp-section-label">Suspeitos</div>
        {suspeitos.map(s => {
          const estado = casoDados.suspeitosAtivos.find(sa => sa.id === s.id)
          const acusado = estado?.status === 'acusado'
          return (
            <div key={s.id} className={`pp-dossier-suspeito ${acusado ? 'pp-dossier-suspeito--acusado' : ''}`}>
              <span style={{ fontSize: 14 }}>👤</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#eee', fontSize: 13 }}>{s.nome}</div>
                <div style={{ color: '#666', fontSize: 10 }}>{s.desc}</div>
              </div>
              {acusado && <span style={{ color: '#EC4899', fontSize: 10 }}>ACUSADO</span>}
            </div>
          )
        })}
      </div>

      {/* Pistas */}
      <div className="pp-section">
        <div className="pp-section-label">Pistas ({pistasColetadas.length}/{caso.pistasNecessarias} mínimo)</div>
        {pistas.filter(p => pistasColetadas.includes(p.id)).map(p => (
          <motion.div key={p.id} className={`pp-pista-card ${p.tipo === 'fio' ? 'pp-pista-fio' : ''}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="pp-pista-tipo">{p.tipo === 'fio' ? '✨ FIO' : p.tipo.toUpperCase()}</div>
            <div className="pp-pista-texto">{p.texto}</div>
          </motion.div>
        ))}
      </div>

      {/* Locais */}
      <div className="pp-section">
        <div className="pp-section-label">Locais</div>
        {locais.map(l => {
          const visitado = (casoDados.locaisInvestidos || []).includes(l.id)
          return (
            <div key={l.id} className={`pp-dossier-local ${visitado ? 'pp-dossier-local--visitado' : ''}`}
              onClick={() => { if (!visitado) store.setFase('investigar') }}>
              <span>{visitado ? '✓' : '🔍'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#eee', fontSize: 13 }}>{l.nome}</div>
                <div style={{ color: '#666', fontSize: 10 }}>{l.desc}</div>
              </div>
              {!visitado && <span style={{ color: '#F5A623' }}>→</span>}
            </div>
          )
        })}
      </div>

      {/* Acusar */}
      <div className="pp-section">
        {!showAcusar ? (
          <button className="pp-btn pp-btn--danger" disabled={!pistasSuficientes}
            onClick={() => setShowAcusar(true)}>
            {pistasSuficientes ? 'ACUSAR' : `Precisa de ${caso.pistasNecessarias} pistas (${pistasColetadas.length})`}
          </button>
        ) : (
          <div>
            <div className="pp-section-label">QUEM É O CULPADO?</div>
            {suspeitos.map(s => (
              <button key={s.id} className="pp-btn pp-btn--danger" style={{ display: 'block', width: '100%', marginBottom: 4 }}
                onClick={() => handleAcusar(s.id)}>
                {s.nome}
              </button>
            ))}
            <button className="pp-btn" onClick={() => setShowAcusar(false)}>cancelar</button>
          </div>
        )}
      </div>
    </div>
  )
}
