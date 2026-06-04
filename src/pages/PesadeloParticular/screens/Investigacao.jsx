import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePPStore } from '../store/usePPStore'
import { getCaso, getLocaisParaCaso, getPistasParaCaso } from '../data/resolver'
import PuzzleWrapper from '../components/PuzzleWrapper'
import { useAuth } from '../../../context/AuthContext'

export default function Investigacao() {
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
        <div className="pp-section-label">Todos os locais investigados</div>
        <button className="pp-btn pp-btn--primary" onClick={() => store.setFase('dossier')}>VOLTAR AO DOSSIER</button>
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
      <button className="pp-back" onClick={() => store.setFase('dossier')}>← dossier</button>

      <div style={{ marginTop: 8 }}>
        <div className="pp-section-label">HP</div>
        <div className="pp-bar" style={{ marginBottom: 16 }}>
          <div className={`pp-bar-fill ${hpPct < 30 ? 'pp-bar-danger' : 'pp-bar-green'}`}
            style={{ '--hp-pct': `${hpPct}%` }} />
        </div>
        <span style={{ fontSize: 10, color: '#555', display: 'block', textAlign: 'right', marginTop: -12, marginBottom: 12 }}>
          {store.hp}/30
        </span>
      </div>

      <div className="pp-section-label">Local ({naoVisitados.length} restantes)</div>

      <div style={{ marginTop: 12 }}>
        <div className="pp-invest-nome">{local.nome}</div>
        <div className="pp-invest-desc">{local.desc}</div>

        {puzzleAtivo && (
          <div style={{
            background: 'linear-gradient(135deg, #0a1f00 0%, #0a0a0a 100%)',
            border: '1px solid #1a3a1a', borderTop: '2px solid #F5A623',
            clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
            padding: 24, margin: '16px 0',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, background: '#F5A623', clipPath: 'polygon(0 0, 100% 100%, 100% 0)', opacity: 0.4 }} />
            <PuzzleWrapper tipo={local.puzzle} onSolve={handlePuzzleSolve} />
          </div>
        )}

        {!puzzleAtivo && !pistaRevelada && (
          <button className="pp-btn pp-btn--primary" onClick={handleInvestigar}
            style={{ marginTop: 12 }}>
            {local.puzzle && local.puzzle !== 'nenhum' ? 'INVESTIGAR (puzzle)' : 'INVESTIGAR'}
          </button>
        )}

        {pistaRevelada && pistasLocal.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {pistasLocal.map((p, i) => (
              <motion.div key={p.id} className={`pp-pista-card ${p.tipo === 'fio' ? 'pp-pista-fio' : ''}`}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}>
                <div className="pp-pista-tipo">{p.tipo === 'fio' ? '✨ FIO' : p.tipo.toUpperCase()}</div>
                <div className="pp-pista-texto">{p.texto}</div>
              </motion.div>
            ))}
          </div>
        )}

        {naoVisitados.length > 1 && pistaRevelada && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="pp-btn" onClick={() => { setPistaRevelada(false); setLocalIdx((localIdx + 1) % naoVisitados.length) }}>
              próximo local →
            </button>
          </div>
        )}
        {pistaRevelada && (
          <button className="pp-btn pp-btn--primary" style={{ marginTop: 12 }}
            onClick={() => store.setFase('dossier')}>VOLTAR AO DOSSIER</button>
        )}
      </div>
    </div>
  )
}
