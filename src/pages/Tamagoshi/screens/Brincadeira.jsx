import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { sfx } from '../sfx'
import { CRIATURAS } from '../data/criaturas'
import CriaturaSprite from '../components/CriaturaSprite'
import { PERSONALIDADES, getFala } from '../data/personalidades'
import { DIX_POR_ACAO } from '../data/moedas'
import {
  PuzzleDecoder,
  PuzzleStealthGrid,
  PuzzleSlidingTiles,
  PuzzleLabirinto,
  PuzzleAnagrama,
  PuzzleForça,
} from '../../../components/Puzzles'

// ATENÇÃO: Enduro (Passear) NÃO pode entrar aqui — é exclusivo do botão "passear"
// e também aparece como card standalone no MiniGames. Se adicionar novos puzzles,
// mantenha o Enduro fora desta lista.
const PUZZLES = [
  { id: 'stealth',  nomeKey: 'puzzle_stealth',  Component: PuzzleStealthGrid },
  { id: 'decoder',  nomeKey: 'puzzle_decoder',  Component: PuzzleDecoder },
  { id: 'sliding',  nomeKey: 'puzzle_sliding',  Component: PuzzleSlidingTiles },
  { id: 'labirinto',nomeKey: 'puzzle_labirinto',Component: PuzzleLabirinto },
  { id: 'anagrama', nomeKey: 'puzzle_anagrama', Component: PuzzleAnagrama },
  { id: 'forca',    nomeKey: 'puzzle_forca',    Component: PuzzleForça },
]

function getConfig(puzzleId) {
  const configs = {
    stealth:  { size: 4, hasTimer: true, timerSegundos: 30, cameraCount: 3, visionRange: 2 },
    decoder:  { difficulty: 'easy' },
    sliding:  { size: 3 },
    labirinto:{ difficulty: 'easy' },
    anagrama: { difficulty: 'easy' },
    forca:    { difficulty: 'easy' },
  }
  return configs[puzzleId] || {}
}

export default function Brincadeira({ onConcluir }) {
  const { t, locale } = useLanguage()
  const store = useTamagoshiStore()
  const pers = PERSONALIDADES[store.personalidade] || PERSONALIDADES.CARENTE

  // Sorteia um puzzle aleatório na montagem
  const puzzle = useMemo(() => {
    const idx = Math.floor(Math.random() * PUZZLES.length)
    return PUZZLES[idx]
  }, [])

  const [faseJogo, setFaseJogo] = useState('apresentando')
  const [resultado, setResultado] = useState(null)
  const [fala, setFala] = useState('')

  // Mostra "apresentando" por 2s, depois inicia o jogo
  useEffect(() => {
    const t = setTimeout(() => setFaseJogo('jogando'), 2000)
    return () => clearTimeout(t)
  }, [])

  const handleSolve = () => {
    sfx.conclusao()
    setResultado('vitoria')
    setFaseJogo('resultado')
    store.brincar()
    store.ganharDix(store._userId, DIX_POR_ACAO, 'brincou com criatura')
    const texto = getFala(store.personalidade, 'boasVindas', store.criaturaId, t, locale)
    setFala(texto || t('games.tamagoshi.brincadeira_divertido'))
  }

  const handleFail = () => {
    sfx.erro()
    setResultado('derrota')
    setFaseJogo('resultado')
    setFala(t('games.tamagoshi.brincadeira_treinar'))
  }

  const handleSair = () => { onConcluir() }

  const irParaMiniGames = () => {
    window.location.href = '/games/minigames'
  }

  const config = getConfig(puzzle.id)
  const Component = puzzle.Component

  return (
    <div className="tama-screen">
      {/* Mini sprite no canto inferior direito */}
      <div className="tama-brincadeira-sprite-corner">
        <CriaturaSprite
          criaturaId={store.criaturaId}
          status={store.status}
          estagio={store.estagio}
          criaturas={CRIATURAS}
        />
        {fala && (
          <div className="tama-brincadeira-fala">
            {fala}
          </div>
        )}
      </div>

      {faseJogo === 'apresentando' && (
        <div className="tama-brincadeira-apresentando">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="tama-brincadeira-apresentando-icone"
          >🎲</motion.div>
          <h2 className="tama-brincadeira-apresentando-nome">
            {t('games.tamagoshi.' + puzzle.nomeKey)}
          </h2>
          <p className="tama-brincadeira-apresentando-sub">{t('games.tamagoshi.brincadeira_preparando')}</p>
        </div>
      )}

      {faseJogo === 'jogando' && (
        <div className="tama-brincadeira tama-brincadeira--jogando">
          <div className="tama-brincadeira-header">
            <span className="tama-brincadeira-header-nome">
              {t('games.tamagoshi.' + puzzle.nomeKey)}
            </span>
            <button
              className="tama-btn tama-btn--sair"
              onClick={() => { sfx.clique(); handleSair() }}
            >
              {t('games.tamagoshi.brincadeira_sair')}
            </button>
          </div>
          <div className="tama-brincadeira-puzzle-container">
            <Component onSolve={handleSolve} onFail={handleFail} config={config} />
          </div>
        </div>
      )}

      {faseJogo === 'resultado' && (
        <div className="tama-brincadeira-resultado-container">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="tama-brincadeira-resultado-icone"
          >
            {resultado === 'vitoria' ? '🎉' : '💪'}
          </motion.div>
          <h2 className={`tama-brincadeira-resultado ${resultado === 'vitoria' ? 'tama-brincadeira-resultado--vitoria' : 'tama-brincadeira-resultado--derrota'}`}>
            {resultado === 'vitoria' ? t('games.tamagoshi.brincadeira_ganhou') : t('games.tamagoshi.brincadeira_perdeu')}
          </h2>
          <p className="tama-brincadeira-resultado-desc">
            {resultado === 'vitoria'
              ? t('games.tamagoshi.brincadeira_ganhou_desc')
              : t('games.tamagoshi.brincadeira_perdeu_desc')}
          </p>
          <div className="tama-brincadeira-resultado-botoes">
            <motion.button
              className="tama-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { sfx.clique(); onConcluir() }}
            >
              {t('games.tamagoshi.voltar')}
            </motion.button>
            <motion.button
              className="tama-btn tama-btn--puzzles"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { sfx.clique(); irParaMiniGames() }}
            >
              {t('games.tamagoshi.brincadeira_mais_puzzles')}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}
