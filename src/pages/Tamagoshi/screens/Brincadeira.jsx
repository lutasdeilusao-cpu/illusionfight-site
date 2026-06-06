import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
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
  { id: 'stealth',  nome: 'Infiltração',     Component: PuzzleStealthGrid },
  { id: 'decoder',  nome: 'Decoder',          Component: PuzzleDecoder },
  { id: 'sliding',  nome: 'Sliding Tiles',    Component: PuzzleSlidingTiles },
  { id: 'labirinto',nome: 'Labirinto',        Component: PuzzleLabirinto },
  { id: 'anagrama', nome: 'Anagrama',         Component: PuzzleAnagrama },
  { id: 'forca',    nome: 'Palavra Secreta',  Component: PuzzleForça },
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
    setResultado('vitoria')
    setFaseJogo('resultado')
    store.brincar()
    store.ganharDix(store._userId, DIX_POR_ACAO, 'brincou com criatura')
    const texto = getFala(store.personalidade, 'boasVindas', store.criaturaId)
    setFala(texto || 'foi divertido! 🎉')
  }

  const handleFail = () => {
    setResultado('derrota')
    setFaseJogo('resultado')
    setFala('você pode treinar mais nos Minigames! 💪')
  }

  const handleSair = () => { onConcluir() }

  const irParaMiniGames = () => {
    window.location.href = '/illusionfight-site/games/minigames'
  }

  const config = getConfig(puzzle.id)
  const Component = puzzle.Component

  return (
    <div className="tama-screen">
      {/* Mini sprite no canto inferior direito */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <CriaturaSprite
          criaturaId={store.criaturaId}
          status={store.status}
          estagio={store.estagio}
          criaturas={CRIATURAS}
          estado="feliz"
        />
        {fala && (
          <div style={{
            background: '#111', border: '1px solid #555', borderRadius: 8,
            padding: '4px 8px', fontSize: '0.65rem', color: '#ccc',
            maxWidth: 160, textAlign: 'center',
          }}>
            {fala}
          </div>
        )}
      </div>

      {faseJogo === 'apresentando' && (
        <div className="tama-brincadeira" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            style={{ fontSize: '4rem' }}
          >🎲</motion.div>
          <h2 style={{ color: '#F5A623', fontSize: '1.2rem', letterSpacing: '0.15em', textAlign: 'center' }}>
            {puzzle.nome}
          </h2>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>preparando desafio...</p>
        </div>
      )}

      {faseJogo === 'jogando' && (
        <div className="tama-brincadeira" style={{ padding: '4rem 1rem' }}>
          <div style={{
            maxWidth: 600, margin: '0 auto 1rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: '#F5A623', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>
              {puzzle.nome}
            </span>
            <button
              className="tama-btn"
              style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem', opacity: 0.6 }}
              onClick={handleSair}
            >
              [ sair ]
            </button>
          </div>
          <div style={{ maxWidth: 600, margin: '0 auto', background: '#0a0a0a', border: '1px solid #222', borderRadius: 4, padding: '1.5rem' }}>
            <Component onSolve={handleSolve} onFail={handleFail} config={config} />
          </div>
        </div>
      )}

      {faseJogo === 'resultado' && (
        <div className="tama-brincadeira" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            style={{ fontSize: '4rem' }}
          >
            {resultado === 'vitoria' ? '🎉' : '💪'}
          </motion.div>
          <h2 style={{
            color: resultado === 'vitoria' ? '#22C55E' : '#F5A623',
            fontSize: '1.1rem', letterSpacing: '0.15em',
          }}>
            {resultado === 'vitoria' ? 'boa! você brincou!' : 'foi por pouco!'}
          </h2>
          <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center', maxWidth: 300 }}>
            {resultado === 'vitoria'
              ? 'a criatura adorou brincar com você!'
              : 'tente de novo ou pratique nos Minigames!'}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <motion.button
              className="tama-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConcluir}
            >
              [ voltar ]
            </motion.button>
            <motion.button
              className="tama-btn"
              style={{ borderColor: '#22C55E', color: '#22C55E' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={irParaMiniGames}
            >
              [ + puzzles ]
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}
