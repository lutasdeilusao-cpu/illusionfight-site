import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePPStore } from '../store/usePPStore'
import { getCaso, getLocaisParaCaso, getPistasParaCaso, getSuspeitosParaCaso } from '../data/resolver'
import { useAuth } from '../../../../context/AuthContext'
import { useLanguage } from '../../../../context/LanguageContext'

export default function Dossier() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = usePPStore()
  const caso = getCaso(store.casoAtivo)
  const [showAcusar, setShowAcusar] = useState(false)
  const [resultado, setResultado] = useState(null)

  if (!caso || !store.casoDados) { store.setFase('mapa'); return null }

  const locais = getLocaisParaCaso(caso.id)
  const pistas = getPistasParaCaso(caso.id)
  const suspeitos = getSuspeitosParaCaso(caso.id)
  const cd = store.casoDados
  const pistasColetadas = cd.pistasCaso || []
  const pistasSuficientes = pistasColetadas.length >= caso.pistasNecessarias

  const handleAcusar = (suspeitoId) => {
    store.acusar(suspeitoId)
    if (suspeitoId === caso.culpado) {
      const erradas = cd.acusacoesErradas || 0
      const bonusPistas = pistasColetadas.length >= caso.pistas.length ? 0.2 : 0
      const bonusFio = caso.fios.filter(f => pistasColetadas.includes(f)).length * 0.1
      let m = erradas === 0 ? 1.0 : erradas === 1 ? 0.7 : 0.4
      m += bonusPistas + bonusFio
      const ganho = Math.floor(caso.reputacao_ganho * Math.min(m, 1.5))
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
          <div className="pp-resol-badge">{t('pp.dossier.caso_encerrado')}</div>
          <div className="pp-resol-nome">{caso.nome}</div>
          <p style={{ color: '#666', fontSize: 14 }}>{t('pp.dossier.reputacao', { valor: resultado.ganho })}</p>
          <p style={{ color: '#888', fontSize: 12, maxWidth: 400, margin: '16px auto', lineHeight: 1.7 }}>
            {caso.dialogoResolucao.map((l, i) => (
              <span key={i} style={{ display: 'block', marginBottom: 8, color: l.personagem === 'jack' ? '#00FF88' : l.personagem === 'kim' ? '#F5A623' : '#888', fontStyle: l.personagem === 'narração' ? 'italic' : 'normal' }}>
                {l.texto}
              </span>
            ))}
          </p>
          <button className="pp-btn pp-btn--primary" onClick={() => { store.setFase('mapa'); if (user) store.saveToCloud(user.id) }}>
            {t('pp.dossier.voltar_mapa')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pp-container">
      <div className="pp-dossier-header">
        <button className="pp-back" onClick={() => store.setFase('mapa')}>{t('pp.local.mapa_voltar')}</button>
        <div className="pp-dossier-header-right">
          <h2 className="pp-dossier-caso-nome">{caso.nome}</h2>
          <div className="pp-dossier-caso-meta">
            <span className="pp-dossier-dif-badge">
              {'◆'.repeat(caso.dificuldade)}
            </span>
            <span>+{caso.reputacao_ganho} rep</span>
            <span>{t('pp.geral.hp', { hp: store.hp })}</span>
          </div>
        </div>
      </div>

      {resultado?.tipo === 'inocente' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="pp-dossier-acusar-feedback">
          {t('pp.dossier.inocente')}
        </motion.div>
      )}

      {/* SUSPEITOS */}
      <div className="pp-section">
        <div className="pp-section-label">{t('pp.dossier.suspeitos')}</div>
        {suspeitos.map(s => {
          const estado = cd.suspeitosAtivos.find(sa => sa.id === s.id)
          const acusado = estado?.status === 'acusado'
          const isCulpado = acusado && s.id === caso.culpado
          return (
            <div key={s.id} className="pp-dossier-suspeito"
              style={acusado ? { borderTop: `2px solid ${isCulpado ? '#8B0000' : '#EC4899'}`, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' } : {}}>
              <div className="pp-avatar pp-avatar--enemy">
                {s.nome[0]}
              </div>
              <div className="pp-dossier-suspeito-wrap">
                <div className="pp-dossier-suspeito-nome">{s.nome}</div>
                <div className="pp-dossier-suspeito-desc">{s.desc}</div>
              </div>
              {acusado && <span style={{ color: isCulpado ? '#8B0000' : '#EC4899', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 }}>
                {isCulpado ? 'CULPADO' : 'ACUSADO'}
              </span>}
            </div>
          )
        })}
      </div>

      {/* PISTAS */}
      <div className="pp-section">
        <div className="pp-section-label">{t('pp.dossier.pistas_label')} ({pistasColetadas.length}/{caso.pistasNecessarias} mínimo)</div>
        {pistas.filter(p => pistasColetadas.includes(p.id)).map(p => (
          <motion.div key={p.id} className={`pp-pista-card ${p.tipo === 'fio' ? 'pp-pista-fio' : ''}`}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="pp-pista-tipo">{p.tipo === 'fio' ? '✨ FIO' : p.tipo.toUpperCase()}</div>
            <div className="pp-pista-texto">{p.texto}</div>
          </motion.div>
        ))}
        {pistasColetadas.length === 0 && (
          <div style={{ color: '#444', fontSize: 11, fontStyle: 'italic', padding: '8px 0' }}>
            {t('pp.feed.stories_vazio')}
          </div>
        )}
      </div>

      {/* LOCAIS */}
      <div className="pp-section">
        <div className="pp-section-label">{t('pp.dossier.locais')}</div>
        {locais.map(l => {
          const visitado = (cd.locaisInvestidos || []).includes(l.id)
          return (
            <div key={l.id} className={`pp-dossier-local ${visitado ? 'pp-dossier-local--visitado' : ''}`}
              onClick={() => { if (!visitado) store.setFase('investigar') }}>
              <span style={{ fontSize: 14 }}>🔍</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#eee', fontSize: 13 }}>{l.nome}</div>
                <div style={{ color: '#666', fontSize: 10 }}>{l.desc}</div>
              </div>
              {visitado ? <span style={{ color: '#22C55E', fontSize: 12 }}>✓</span> :
                <span style={{ color: '#F5A623', fontSize: 14 }}>→</span>}
            </div>
          )
        })}
      </div>

      {/* ACUSAR */}
      <div className="pp-section">
        {!showAcusar ? (
          <button className="pp-atk-btn" disabled={!pistasSuficientes}
            onClick={() => setShowAcusar(true)}>
            {pistasSuficientes ? t('pp.abertura.investigar').replace('INVESTIGAR','ACUSAR') : `Pistas: ${pistasColetadas.length}/${caso.pistasNecessarias}`}
          </button>
        ) : (
          <div>
            <div className="pp-section-label">QUEM É O CULPADO?</div>
            {suspeitos.map(s => (
              <button key={s.id} className="pp-btn pp-btn--danger"
                style={{ display: 'block', width: '100%', marginBottom: 4, textAlign: 'left' }}
                onClick={() => handleAcusar(s.id)}>
                ⚡ {s.nome}
              </button>
            ))}
            <button className="pp-btn pp-btn-sair" onClick={() => setShowAcusar(false)} style={{ marginTop: 4 }}>
              cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
