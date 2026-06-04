import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { CASOS } from '../data/casos'
import { PISTAS } from '../data/pistas'
import PistaCard from '../components/PistaCard'
import { PuzzleDecoder, PuzzleStealthGrid, PuzzleSlidingTiles, PuzzleLabirinto, PuzzleAnagrama } from '../../../components/Puzzles'

export default function Investigacao({ localId }) {
  const store = useJackStore()
  const caso = CASOS[store.casoAtivo]
  const [pistaRevelada, setPistaRevelada] = useState(false)
  const [puzzleAtivo, setPuzzleAtivo] = useState(false)
  const [puzzleResolvido, setPuzzleResolvido] = useState(false)

  if (!caso) {
    store.setFase('dossier')
    return null
  }

  const local = caso.locais.find(l => l.id === localId)
  if (!local) {
    store.setFase('dossier')
    return null
  }

  const jaVisitado = store.locaisVisitados.includes(localId)
  const pistaId = local.pistas?.[0]
  const pista = PISTAS[pistaId]
  const temDungeon = local.dungeon && !jaVisitado
  const temPuzzle = local.puzzle && !jaVisitado && !puzzleResolvido

  useEffect(() => {
    if (jaVisitado) {
      setPistaRevelada(true)
    }
  }, [jaVisitado])

  const handleRevelar = () => {
    if (temPuzzle) {
      setPuzzleAtivo(true)
      return
    }
    if (temDungeon) {
      useJackStore.setState({ _retornoInvestigacao: true, _localPendente: localId })
      store.setFase(`dungeon_${local.dungeon}`)
      return
    }
    store.visitarLocal(localId)
    if (pistaId) store.coletarPista(pistaId)
    setPistaRevelada(true)
  }

  const handleResolverPuzzle = () => {
    setPuzzleResolvido(true)
    setPuzzleAtivo(false)
    if (temDungeon) {
      useJackStore.setState({ _retornoInvestigacao: true, _localPendente: localId })
      store.setFase(`dungeon_${local.dungeon}`)
      return
    }
    store.visitarLocal(localId)
    if (pistaId) store.coletarPista(pistaId)
    setPistaRevelada(true)
  }

  const irParaDungeon = () => {
    useJackStore.setState({ _retornoInvestigacao: true, _localPendente: localId })
    store.setFase(`dungeon_${local.dungeon}`)
  }

  // Quando volta da dungeon: detecta retorno e revela pista
  useEffect(() => {
    // Se o local foi visitado (retorno de dungeon) e a pista ainda não foi revelada
    if (store.locaisVisitados.includes(localId)) {
      if (!pistaRevelada) {
        setPistaRevelada(true)
        if (pistaId && !store.pistasColetadas.includes(pistaId)) {
          store.coletarPista(pistaId)
        }
      }
      return
    }
    // Se voltou de dungeon mas local ainda não visitado, visita e revela
    if (store._localPendente === localId && !store._retornoInvestigacao) {
      store.visitarLocal(localId)
      setPistaRevelada(true)
    }
  }, [store.locaisVisitados, store._retornoInvestigacao])

  return (
    <motion.div className="jdc-investigacao" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-investigacao-header">
        <span className="jack-text--amber">{local.nome}</span>
        <button className="jack-btn" onClick={() => store.setFase('dossier')} style={{ fontSize: '0.7rem' }}>
          [ voltar pro dossier ]
        </button>
      </div>

      {/* Descrição do local */}
      <div className="jdc-interior-balao" style={{ marginTop: '1rem' }}>
        <p className="jdc-interior-balao-text">{local.desc}</p>
      </div>

      {/* Puzzle gate */}
      {puzzleAtivo && (
        <motion.div className="jdc-investigacao-puzzle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="jack-text jack-text--amber" style={{ fontSize: '0.85rem' }}>🧩 {local.puzzleLabel}</p>
          <p className="jack-text jack-text--dim" style={{ fontSize: '0.75rem' }}>
            {local.puzzle === 'decoder' && 'o documento está cifrado. use o decoder para revelar a mensagem.'}
            {local.puzzle === 'stealth' && 'o local está vigiado. passe sem ser visto.'}
            {local.puzzle === 'sliding' && 'o documento foi rasgado. reconstitua os pedaços.'}
          </p>
          <div className="jdc-investigacao-puzzle-area">
            {local.puzzle === 'decoder' && (
              <PuzzleDecoder onSolve={handleResolverPuzzle} onFail={handleResolverPuzzle} />
            )}
            {local.puzzle === 'stealth' && (
              <PuzzleStealthGrid onSolve={handleResolverPuzzle} onFail={handleResolverPuzzle} config={{ size: 4 }} />
            )}
            {local.puzzle === 'sliding' && (
              <PuzzleSlidingTiles onSolve={handleResolverPuzzle} onFail={handleResolverPuzzle} config={{ size: 3 }} />
            )}
            {!['decoder', 'stealth', 'sliding'].includes(local.puzzle) && (
              <PuzzleAnagrama onSolve={handleResolverPuzzle} onFail={handleResolverPuzzle} />
            )}
          </div>
          <button className="jack-btn jack-btn--amber" onClick={handleResolverPuzzle} style={{ marginTop: '0.5rem' }}>
            [ resolver puzzle ]
          </button>
        </motion.div>
      )}

      {/* Dungeon gate */}
      {temDungeon && !puzzleAtivo && !pistaRevelada && (
        <div className="jdc-investigacao-dungeon-gate">
          <p className="jack-text jack-text--crimson" style={{ fontSize: '0.8rem' }}>⚔️ {local.dungeonLabel}</p>
          <button className="jack-btn jack-btn--crimson" onClick={irParaDungeon} style={{ marginTop: '0.5rem' }}>
            [ enfrentar ]
          </button>
        </div>
      )}

      {/* Pista revelada */}
      {pistaRevelada && pista && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="jack-text jack-text--amber" style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
            🔍 pista encontrada:
          </p>
          <PistaCard pista={pista} />
          {jaVisitado ? (
            <p className="jack-text jack-text--dim" style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>
              este local já foi investigado.
            </p>
          ) : (
            <button className="jack-btn jack-btn--amber" onClick={() => store.setFase('dossier')} style={{ marginTop: '0.5rem' }}>
              [ voltar pro dossier ]
            </button>
          )}
        </motion.div>
      )}

      {/* Botão investigar (ainda não visitado, sem puzzle/dungeon pendente) */}
      {!pistaRevelada && !temDungeon && !puzzleAtivo && (
        <button className="jack-btn jack-btn--amber" onClick={handleRevelar} style={{ marginTop: '1rem' }}>
          [ investigar este local ]
        </button>
      )}
    </motion.div>
  )
}
