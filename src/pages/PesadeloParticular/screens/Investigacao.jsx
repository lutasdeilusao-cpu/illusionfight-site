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

  if (naoVisitados.length === 0) {
    return (
      <div className="pp-container">
        <div className="pp-section-label">Todos os locais foram investigados</div>
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
      <div className="pp-section-label">HP: {store.hp}/30</div>

      <div style={{ marginTop: 16 }}>
        <div className="pp-invest-nome">{local.nome}</div>
        <div className="pp-invest-desc">{local.desc}</div>

        {puzzleAtivo && <PuzzleWrapper tipo={local.puzzle} onSolve={handlePuzzleSolve} />}

        {!puzzleAtivo && !pistaRevelada && (
          <button className="pp-btn pp-btn--primary" onClick={handleInvestigar}>
            {local.puzzle && local.puzzle !== 'nenhum' ? 'INVESTIGAR (puzzle)' : 'INVESTIGAR'}
          </button>
        )}

        {pistaRevelada && pistasLocal.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {pistasLocal.map(p => (
              <motion.div key={p.id} className={`pp-pista-card ${p.tipo === 'fio' ? 'pp-pista-fio' : ''}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="pp-pista-tipo">{p.tipo === 'fio' ? '✨ FIO' : p.tipo.toUpperCase()}</div>
                <div className="pp-pista-texto">{p.texto}</div>
              </motion.div>
            ))}
          </div>
        )}

        {naoVisitados.length > 1 && pistaRevelada && (
          <button className="pp-btn" style={{ marginTop: 12 }}
            onClick={() => { setPistaRevelada(false); setLocalIdx((localIdx + 1) % naoVisitados.length) }}>
            próximo local →
          </button>
        )}
        {pistaRevelada && (
          <button className="pp-btn pp-btn--primary" style={{ marginTop: 8, marginLeft: 8 }}
            onClick={() => store.setFase('dossier')}>VOLTAR AO DOSSIER</button>
        )}
      </div>
    </div>
  )
}
