import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePPStore } from '../store/usePPStore'
import { getCaso, getLocaisParaCaso, getPistasParaCaso } from '../data/resolver'
import PuzzleDecoder from '../../../components/Puzzles/PuzzleDecoder'
import PuzzleStealthGrid from '../../../components/Puzzles/PuzzleStealthGrid'
import PuzzleSlidingTiles from '../../../components/Puzzles/PuzzleSlidingTiles'
import PuzzleLabirinto from '../../../components/Puzzles/PuzzleLabirinto'
import PuzzleAnagrama from '../../../components/Puzzles/PuzzleAnagrama'
import { useAuth } from '../../../context/AuthContext'

export default function Investigacao() {
  const { user } = useAuth()
  const store = usePPStore()
  const caso = getCaso(store.casoAtivo)
  const [localIdx, setLocalIdx] = useState(0)
  const [puzzleAtivo, setPuzzleAtivo] = useState(false)
  const [puzzleResolvido, setPuzzleResolvido] = useState(false)

  if (!caso || !store.casoDados) { store.setFase('mapa'); return null }

  const locais = getLocaisParaCaso(caso.id)
  const pistas = getPistasParaCaso(caso.id)
  const visitados = store.casoDados.locaisInvestidos || []
  const naoVisitados = locais.filter(l => !visitados.includes(l.id))

  if (naoVisitados.length === 0) {
    return (
      <div className="pp-container">
        <p className="pp-loading">Todos os locais foram investigados.</p>
        <button className="pp-btn pp-btn--primary" onClick={() => store.setFase('dossier')}>
          VOLTAR AO DOSSIER
        </button>
      </div>
    )
  }

  const local = naoVisitados[localIdx]
  const pistasLocal = pistas.filter(p => local.pistas.includes(p.id))

  const handleRevelar = () => {
    if (local.puzzle && !puzzleResolvido) {
      setPuzzleAtivo(true)
      return
    }
    store.visitarLocal(local.id)
    pistasLocal.forEach(p => store.coletarPista(p.id, p.tipo))
    setPuzzleResolvido(false)
    setPuzzleAtivo(false)
  }

  const handleResolverPuzzle = () => {
    setPuzzleResolvido(true)
    setPuzzleAtivo(false)
    handleRevelar()
  }

  if (!local) return null

  return (
    <div className="pp-container">
      <button className="pp-back" onClick={() => store.setFase('dossier')}>← dossier</button>

      <div className="pp-invest-local">
        <div className="pp-invest-nome">{local.nome}</div>
        <div className="pp-invest-desc">{local.desc}</div>

        {puzzleAtivo && (
          <div className="pp-invest-puzzle-area">
            <p style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>Resolva o puzzle para investigar este local.</p>
            {local.puzzle === 'decoder' && <PuzzleDecoder onSolve={handleResolverPuzzle} onFail={() => setPuzzleAtivo(false)} />}
            {local.puzzle === 'stealth' && <PuzzleStealthGrid config={{ size: 4 }} onSolve={handleResolverPuzzle} onFail={() => setPuzzleAtivo(false)} />}
            {local.puzzle === 'sliding' && <PuzzleSlidingTiles config={{ size: 3 }} onSolve={handleResolverPuzzle} onFail={() => setPuzzleAtivo(false)} />}
            {local.puzzle === 'labirinto' && <PuzzleLabirinto onSolve={handleResolverPuzzle} onFail={() => setPuzzleAtivo(false)} />}
            {local.puzzle === 'anagrama' && <PuzzleAnagrama onSolve={handleResolverPuzzle} onFail={() => setPuzzleAtivo(false)} />}
            <button className="pp-btn" onClick={() => setPuzzleAtivo(false)} style={{ marginTop: 8 }}>voltar</button>
          </div>
        )}

        {!puzzleAtivo && (
          <div>
            {pistasLocal.map(p => (
              <motion.div key={p.id} className={`pp-pista-card ${p.tipo === 'fio' ? 'pp-pista-fio' : ''}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="pp-pista-tipo">{p.tipo === 'fio' ? '✨ FIO' : p.tipo.toUpperCase()}</div>
                <div className="pp-pista-texto">{p.texto}</div>
              </motion.div>
            ))}
            <button className="pp-btn pp-btn--primary" style={{ marginTop: 12 }} onClick={handleRevelar}>
              {local.puzzle ? `INVESTIGAR (puzzle)` : 'INVESTIGAR'}
            </button>
            {naoVisitados.length > 1 && (
              <button className="pp-btn" style={{ marginTop: 8, marginLeft: 8 }}
                onClick={() => setLocalIdx((localIdx + 1) % naoVisitados.length)}>
                próximo local →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
