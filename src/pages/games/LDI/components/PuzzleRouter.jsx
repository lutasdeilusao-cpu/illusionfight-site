import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PuzzleSlidingTiles from './PuzzleSlidingTiles'
import PuzzleStealthGrid from './PuzzleStealthGrid'
import PuzzleDecoder from './PuzzleDecoder'
import PuzzleSimonSays from './PuzzleSimonSays'
import PuzzleWireCut from './PuzzleWireCut'

const REWARDS = {
  clue: { label: 'pista', icon: '📋', desc: 'Informação obtida' },
  xp: { label: 'XP', icon: '⚡', desc: 'Experiência ganha' },
  credits: { label: 'créditos', icon: '💰', desc: 'Créditos recebidos' },
  item: { label: 'item', icon: '🎒', desc: 'Item encontrado' },
}

const PUZZLE_CONFIG = {
  sliding: { component: PuzzleSlidingTiles, label: '🧩 Organizar Dados', desc: 'Deslize os tiles para reconstruir o arquivo' },
  stealth: { component: PuzzleStealthGrid, label: '🧩 Rota Furtiva', desc: 'Atravesse o grid sem ser detectado' },
  decoder: { component: PuzzleDecoder, label: '🧩 Decodificar Sinal', desc: 'Sintonize a frequência correta' },
  simon: { component: PuzzleSimonSays, label: '🧩 Sequência de Acesso', desc: 'Repita a sequência de segurança' },
  wire: { component: PuzzleWireCut, label: '🧩 Corte de Cabos', desc: 'Corte os cabos certos na ordem correta' },
}

export default function PuzzleRouter({ type, difficulty = 3, furtividade = 0, onComplete }) {
  const [status, setStatus] = useState('playing')
  const [reward, setReward] = useState(null)
  const [skipUsed, setSkipUsed] = useState(false)

  const config = PUZZLE_CONFIG[type]
  if (!config) return <div className="ldi-puzzle-error">Puzzle desconhecido: {type}</div>

  const PuzzleComponent = config.component

  const handleSolve = () => {
    const rewards = generateReward(type, difficulty, true)
    setReward(rewards)
    setStatus('solved')
    onComplete?.(true, rewards)
  }

  const handleFail = () => {
    const rewards = generateReward(type, difficulty, false)
    setReward(rewards)
    setStatus('failed')
    onComplete?.(false, rewards)
  }

  const handleSkip = () => {
    setSkipUsed(true)
    handleFail()
  }

  if (status === 'solved' || status === 'failed') {
    return (
      <motion.div
        className="ldi-puzzle-result"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`ldi-puzzle-result-icon ${status === 'solved' ? 'ldi-puzzle-result--ok' : 'ldi-puzzle-result--fail'}`}>
          {status === 'solved' ? '✅' : '⚠️'}
        </div>
        <div className="ldi-puzzle-result-title">
          {status === 'solved' ? 'Puzzle Resolvido!' : 'Puzzle Não Resolvido'}
        </div>
        <div className="ldi-puzzle-result-rewards">
          {reward?.map((r, i) => (
            <div key={i} className="ldi-puzzle-reward-item">
              <span className="ldi-puzzle-reward-icon">{r.icon}</span>
              <span className="ldi-puzzle-reward-text">
                {r.amount > 0 ? `+${r.amount} ${r.label}` : r.label}
              </span>
              <span className="ldi-puzzle-reward-desc">{r.desc}</span>
            </div>
          ))}
          {(!reward || reward.length === 0) && (
            <div className="ldi-puzzle-reward-item">Nenhuma recompensa</div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="ldi-puzzle-room">
      <div className="ldi-puzzle-header">
        <h3 className="ldi-puzzle-title">{config.label}</h3>
        <p className="ldi-puzzle-desc">{config.desc}</p>
        <p className="ldi-puzzle-difficulty">
          Dificuldade: {'⬛'.repeat(difficulty)}{'⬜'.repeat(5 - difficulty)}
        </p>
      </div>
      <PuzzleComponent
        size={difficulty === 5 ? 4 : 3}
        furtividade={furtividade}
        onSolve={handleSolve}
        onSkip={handleSkip}
        onFail={handleFail}
      />
      {!skipUsed && (
        <button className="ldi-puzzle-skip" onClick={handleSkip}>
          Pular puzzle (recompensa reduzida)
        </button>
      )}
    </div>
  )
}

function generateReward(type, difficulty, solved) {
  const rewards = []
  const mult = solved ? 1 : 0.3

  if (type === 'sliding' || type === 'stealth') {
    const xp = Math.round((5 + difficulty * 2) * mult)
    if (xp > 0) rewards.push({ icon: '⚡', label: 'XP', amount: xp, desc: `${xp} de experiência` })
    if (solved && Math.random() > 0.5) {
      rewards.push({ icon: '📋', label: 'pista', amount: 1, desc: 'Informação obtida' })
    }
  }

  if (type === 'decoder' || type === 'simon') {
    const credits = Math.round((30 + difficulty * 15) * mult)
    if (credits > 0) rewards.push({ icon: '💰', label: 'créditos', amount: credits, desc: `${credits} créditos` })
    if (solved) {
      rewards.push({ icon: '📋', label: 'pista', amount: 1, desc: 'Informação crítica' })
    }
  }

  if (type === 'wire') {
    const xp = Math.round((8 + difficulty * 3) * mult)
    if (xp > 0) rewards.push({ icon: '⚡', label: 'XP', amount: xp, desc: `${xp} de experiência` })
    if (solved) {
      rewards.push({ icon: '🎒', label: 'item', amount: 1, desc: 'Cura Menor encontrada' })
    }
  }

  return rewards
}
