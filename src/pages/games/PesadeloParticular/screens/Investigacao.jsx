import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePPStore } from '../store/usePPStore'
import { getCaso, getLocaisParaCaso, getPistasParaCaso } from '../data/resolver'
import PuzzleWrapper from '../components/PuzzleWrapper'
import { useAuth } from '../../../../context/AuthContext'
import { useLanguage } from '../../../../context/LanguageContext'

export default function Investigacao() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = usePPStore()
  const caso = getCaso(store.casoAtivo)
  const [localIdx, setLocalIdx] = useState(0)
  const [puzzleAtivo, setPuzzleAtivo] = useState(false)
  const [pistaRevelada, setPistaRevelada] = useState(false)

  if (!caso || !store.casoDados) { store.setFase('mapa'); return null }

  const locais = getLocaisParaCaso(caso.id)
  const pistas = getPistasParaCaso(caso.id)
  const visitados = store.casoDados.locaisInvestidos || []
  const naoVisitados = locais.filter(l => !visitados.includes(l.id))
  const hpPct = Math.max(0, (store.hp / 30) * 100)

  if (naoVisitados.length === 0) {
    return (
      <div className="pp-container">
        <div className="pp-section-label">{t('pp.local.todos_investigados')}</div>
        <button className="pp-btn pp-btn--primary" onClick={() => store.setFase('dossier')}>{t('pp.local.voltar_dossier_btn')}</button>
      </div>
    )
  }

  const local = naoVisitados[localIdx]
  const pistasLocal = pistas.filter(p => local.pistas?.includes(p.id))

  const handlePuzzleSolve = (sucesso) => {
    setPuzzleAtivo(false)
    if (sucesso) {
      store.visitarLocal(local.id)
      pistasLocal.forEach(p => store.coletarPista(p.id, p.tipo))
      setPistaRevelada(true)
    } else {
      store.danoHP(10)
      if (user) store.saveToCloud(user.id)
    }
  }

  const handleInvestigar = () => {
    if (local.puzzle && local.puzzle !== 'nenhum') {
      setPuzzleAtivo(true)
      return
    }
    store.visitarLocal(local.id)
    pistasLocal.forEach(p => store.coletarPista(p.id, p.tipo))
    setPistaRevelada(true)
  }

  if (!local) return null

  return (
    <div className="pp-container">
      <button className="pp-back" onClick={() => store.setFase('dossier')}>{t('pp.local.dossier_voltar')}</button>

      <div style={{ marginTop: 8 }}>
        <div className="pp-section-label">{t('pp.local.hp_label')}</div>
        <div className="pp-bar" style={{ marginBottom: 16 }}>
          <div className={`pp-bar-fill ${hpPct < 30 ? 'pp-bar-danger' : 'pp-bar-green'}`}
            style={{ '--hp-pct': `${hpPct}%` }} />
        </div>
        <span className="pp-invest-hp-label">
          {t('pp.geral.hp', { hp: store.hp })}
        </span>
      </div>

      <div className="pp-section-label">{t('pp.local.restantes', { n: naoVisitados.length })}</div>

      <div style={{ marginTop: 12 }}>
        <div className="pp-invest-nome">{local.nome}</div>
        <div className="pp-invest-desc">{local.desc}</div>

        {puzzleAtivo && (
          <div className="pp-puzzle-container-styled">
            <div className="pp-puzzle-corner" />
            <PuzzleWrapper tipo={local.puzzle} onSolve={handlePuzzleSolve} />
          </div>
        )}

        {!puzzleAtivo && !pistaRevelada && (
          <button className="pp-btn pp-btn--primary" onClick={handleInvestigar}
            style={{ marginTop: 12 }}>
            {local.puzzle && local.puzzle !== 'nenhum' ? t('pp.local.investigar_puzzle_btn') : t('pp.local.investigar_btn')}
          </button>
        )}

        {pistaRevelada && pistasLocal.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {pistasLocal.map((p, i) => (
              <motion.div key={p.id} className={`pp-pista-card ${p.tipo === 'fio' ? 'pp-pista-fio' : ''}`}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}>
                <div className="pp-pista-tipo">{p.tipo === 'fio' ? 'âœ¨ FIO' : p.tipo.toUpperCase()}</div>
                <div className="pp-pista-texto">{p.texto}</div>
              </motion.div>
            ))}
          </div>
        )}

        {naoVisitados.length > 1 && pistaRevelada && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="pp-btn" onClick={() => { setPistaRevelada(false); setLocalIdx((localIdx + 1) % naoVisitados.length) }}>
              prÃ³ximo local â†’
            </button>
          </div>
        )}
        {pistaRevelada && (
          <button className="pp-btn pp-btn--primary" style={{ marginTop: 12 }}
            onClick={() => store.setFase('dossier')}>{t('pp.local.voltar_dossier_btn')}</button>
        )}
      </div>
    </div>
  )
}
