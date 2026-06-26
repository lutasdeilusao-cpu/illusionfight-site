import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { useLanguage } from '../../../../context/LanguageContext'
import { CASOS } from '../data/casos'
import { PISTAS } from '../data/pistas'
import PistaCard from '../components/PistaCard'
import { PuzzleDecoder, PuzzleStealthGrid, PuzzleSlidingTiles, PuzzleLabirinto, PuzzleAnagrama } from '../../../../components/Puzzles'

const CUSTO_ARROMBAR = { decoder: 1500, stealth: 2000, sliding: 1000, labirinto: 1500, anagrama: 1000, default: 1000 }
const DANO_PUZZLE_FALHOU = 5

export default function Investigacao({ localId }) {
  const { t } = useLanguage()
  const store = useJackStore()
  const [pistaRevelada, setPistaRevelada] = useState(false)
  const [puzzleAtivo, setPuzzleAtivo] = useState(false)
  const [puzzleResolvido, setPuzzleResolvido] = useState(false)
  const [puzzleFalhou, setPuzzleFalhou] = useState(false)

  // Hooks ANTES de qualquer return condicional
  const caso = CASOS[store.casoAtivo]
  const local = caso?.locais?.find(l => l.id === localId)
  const custoPuzzle = CUSTO_ARROMBAR[local?.puzzle] || CUSTO_ARROMBAR.default
  const jaVisitado = store.locaisVisitados.includes(localId)
  const pistaId = local?.pistas?.[0]
  const pista = PISTAS[pistaId]
  const temDungeon = local?.dungeon && !jaVisitado
  const temPuzzle = local?.puzzle && !jaVisitado && !puzzleResolvido

  useEffect(() => {
    if (jaVisitado) setPistaRevelada(true)
  }, [jaVisitado])

  useEffect(() => {
    if (store.locaisVisitados.includes(localId)) {
      if (!pistaRevelada) {
        setPistaRevelada(true)
        if (pistaId && !store.pistasColetadas.includes(pistaId)) {
          store.coletarPista(pistaId)
        }
      }
      return
    }
    if (store._localPendente === localId && !store._retornoInvestigacao) {
      store.visitarLocal(localId)
      setPistaRevelada(true)
    }
  }, [store.locaisVisitados, store._retornoInvestigacao])

  // Returns condicionais SÃ“ depois de todos os hooks
  if (!caso || !local) {
    store.setFase('dossier')
    return null
  }

  const handleRevelar = () => {
    if (temPuzzle) { setPuzzleAtivo(true); return }
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
    setPuzzleFalhou(false)
    if (temDungeon) {
      useJackStore.setState({ _retornoInvestigacao: true, _localPendente: localId })
      store.setFase(`dungeon_${local.dungeon}`)
      return
    }
    store.visitarLocal(localId)
    if (pistaId) store.coletarPista(pistaId)
    setPistaRevelada(true)
  }

  const handlePuzzleFail = () => {
    console.log('[INV] puzzle falhou. moral antes:', store.hpAtual, '| apÃ³s:', store.hpAtual - DANO_PUZZLE_FALHOU)
    store.setHpAtual(store.hpAtual - DANO_PUZZLE_FALHOU)
    store.setMonologo(`fui visto. custa ${DANO_PUZZLE_FALHOU} de moral.`)
    setPuzzleFalhou(true)
    setPuzzleAtivo(false)
  }

  const handleArrombar = () => {
    if (store.cervejas < custoPuzzle) return
    store.gastar(custoPuzzle)
    store.setMonologo(`custou ${custoPuzzle} cervejas. literalmente.`)
    handleResolverPuzzle()
  }

  const irParaDungeon = () => {
    useJackStore.setState({ _retornoInvestigacao: true, _localPendente: localId })
    store.setFase(`dungeon_${local.dungeon}`)
  }

  return (
    <motion.div className="jdc-investigacao" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-investigacao-header">
        <span className="jack-text--amber">{local.nome}</span>
        <button className="jack-btn jdc-btn-xs" onClick={() => store.setFase('dossier')}>
          {t('games.jackcandy.investigacao_voltar_dossier')}
        </button>
      </div>

      <div className="jdc-interior-balao jdc-mt-1">
        <p className="jdc-interior-balao-text">{local.desc}</p>
      </div>

      {puzzleAtivo && !puzzleFalhou && (
        <motion.div className="jdc-investigacao-puzzle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="jack-text jack-text--amber jdc-inv-puzzle-title">ðŸ§© {local.puzzleLabel}</p>
          <p className="jack-text jack-text--dim jdc-inv-puzzle-desc">
            {local.puzzle === 'decoder' && t('games.jackcandy.investigacao_puzzle_decoder')}
            {local.puzzle === 'stealth' && t('games.jackcandy.investigacao_puzzle_stealth')}
            {local.puzzle === 'sliding' && t('games.jackcandy.investigacao_puzzle_sliding')}
            {!['decoder', 'stealth', 'sliding'].includes(local.puzzle) && t('games.jackcandy.investigacao_puzzle_default')}
          </p>
          <div className="jdc-investigacao-puzzle-area">
            {local.puzzle === 'decoder' && <PuzzleDecoder key={`decoder-${localId}`} onSolve={handleResolverPuzzle} onFail={handlePuzzleFail} />}
            {local.puzzle === 'stealth' && <PuzzleStealthGrid key={`stealth-${localId}`} onSolve={handleResolverPuzzle} onFail={handlePuzzleFail} config={{ size: 4, hasTimer: true }} />}
            {local.puzzle === 'sliding' && <PuzzleSlidingTiles key={`sliding-${localId}`} onSolve={handleResolverPuzzle} onFail={handlePuzzleFail} config={{ size: 3 }} />}
            {local.puzzle === 'labirinto' && <PuzzleLabirinto key={`labirinto-${localId}`} onSolve={handleResolverPuzzle} onFail={handlePuzzleFail} />}
            {local.puzzle === 'anagrama' && <PuzzleAnagrama key={`anagrama-${localId}`} onSolve={handleResolverPuzzle} onFail={handlePuzzleFail} />}
            {!['decoder', 'stealth', 'sliding', 'labirinto', 'anagrama'].includes(local.puzzle) && (
              <PuzzleAnagrama key={`anagrama-fallback-${localId}`} onSolve={handleResolverPuzzle} onFail={handlePuzzleFail} />
            )}
          </div>
        </motion.div>
      )}

      {puzzleFalhou && (
        <motion.div className="jdc-investigacao-puzzle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="jack-text jack-text--crimson jdc-inv-fail-title">
            {t('games.jackcandy.investigacao_puzzle_falhou', { dano: DANO_PUZZLE_FALHOU })}
          </p>
          <p className="jack-text jack-text--dim jdc-inv-fail-dica">
            {t('games.jackcandy.investigacao_puzzle_falhou_dica')}
          </p>
          <div className="jack-buttons jdc-inv-fail-buttons">
            <button className="jack-btn jack-btn--amber" onClick={() => { setPuzzleFalhou(false); setPuzzleAtivo(true) }}>
              {t('games.jackcandy.investigacao_tentar_novo')}
            </button>
            <button className="jack-btn jack-btn--crimson" onClick={handleArrombar} disabled={store.cervejas < custoPuzzle}>
              {store.cervejas >= custoPuzzle
                ? t('games.jackcandy.investigacao_arrombar', { custo: custoPuzzle })
                : t('games.jackcandy.investigacao_sem_cervejas', { atual: store.cervejas, custo: custoPuzzle })}
            </button>
          </div>
        </motion.div>
      )}

      {temDungeon && !puzzleAtivo && !pistaRevelada && (
        <div className="jdc-investigacao-dungeon-gate">
          <p className="jack-text jack-text--crimson jdc-inv-dungeon-label">âš”ï¸ {local.dungeonLabel}</p>
          <button className="jack-btn jack-btn--crimson jdc-btn-mt-05" onClick={irParaDungeon}>
            {t('games.jackcandy.investigacao_enfrentar')}
          </button>
        </div>
      )}

      {pistaRevelada && pista && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="jack-text jack-text--amber jdc-inv-pista-title">ðŸ” {t('games.jackcandy.investigacao_pista_encontrada')}</p>
          <PistaCard pista={pista} />
          {jaVisitado ? (
            <p className="jack-text jack-text--dim jdc-inv-ja-visitado">
              {t('games.jackcandy.investigacao_ja_visitado')}
            </p>
          ) : (
            <button className="jack-btn jack-btn--amber jdc-btn-mt-05" onClick={() => store.setFase('dossier')}>
              {t('games.jackcandy.investigacao_voltar_dossier')}
            </button>
          )}
        </motion.div>
      )}

      {!pistaRevelada && !temDungeon && !puzzleAtivo && !puzzleFalhou && (
        <button className="jack-btn jack-btn--amber jdc-btn-mt-1" onClick={handleRevelar}>
          {t('games.jackcandy.investigacao_investigar')}
        </button>
      )}
    </motion.div>
  )
}
