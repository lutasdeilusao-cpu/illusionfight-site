import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { sfxMinigames } from './sfx-minigames'

const COLORS = ['#00B4D8', '#FF6B6B', '#22C55E', '#A855F4']
const COR_NOME = ['azul', 'vermelho', 'verde', 'amarelo']

export default function PuzzleSimonSays({ onSolve, onFail, config = {} }) {
  const { t } = useLanguage()
  const difficulty = config?.difficulty || 'easy'
  const maxRounds = difficulty === 'hard' ? 8 : difficulty === 'medium' ? 6 : 5

  const [sequence, setSequence] = useState([])
  const [playerSeq, setPlayerSeq] = useState([])
  const [phase, setPhase] = useState('showing')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [round, setRound] = useState(0)

  // Refs para evitar stale closures nos callbacks
  const phaseRef = useRef(phase)
  const seqRef = useRef(sequence)
  const playerRef = useRef(playerSeq)
  const onSolveRef = useRef(onSolve)
  const onFailRef = useRef(onFail)
  const timeoutsRef = useRef([])

  // Manter refs sincronizados
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { seqRef.current = sequence }, [sequence])
  useEffect(() => { playerRef.current = playerSeq }, [playerSeq])
  useEffect(() => { onSolveRef.current = onSolve }, [onSolve])
  useEffect(() => { onFailRef.current = onFail }, [onFail])

  // Limpar timeouts pendentes ao desmontar
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  // Tocar som quando uma cor acende na sequência
  useEffect(() => {
    if (activeIndex >= 0 && phase === 'showing') {
      const nome = COR_NOME[activeIndex]
      sfxMinigames.simon[nome]?.()
    }
  }, [activeIndex, phase])

  useEffect(() => {
    if (phase !== 'showing') return
    if (round >= maxRounds) { onSolveRef.current(); return }
    const newSeq = [...seqRef.current]
    if (newSeq.length === 0) {
      for (let i = 0; i < 3; i++) newSeq.push(Math.floor(Math.random() * 4))
    } else {
      newSeq.push(Math.floor(Math.random() * 4))
    }
    setSequence(newSeq)
    let i = 0
    const interval = setInterval(() => {
      if (i >= newSeq.length) {
        clearInterval(interval)
        setPhase('input')
        setPlayerSeq([])
        return
      }
      setActiveIndex(newSeq[i])
      const t = setTimeout(() => setActiveIndex(-1), 300)
      timeoutsRef.current.push(t)
      i++
    }, 600)
    return () => clearInterval(interval)
  }, [round, phase, maxRounds])

  const handleColorClick = useCallback((colorIndex) => {
    const p = phaseRef.current
    if (p !== 'input') return
    const seq = seqRef.current
    const player = playerRef.current
    const next = player.length
    console.log('[SIMON] click cor:', colorIndex, '| next index:', next, '| seq len:', seq.length, '| phase:', p)
    const nome = COR_NOME[colorIndex]
    sfxMinigames.simon[nome]?.()
    if (colorIndex !== seq[next]) {
      console.log('[SIMON] erro! esperado:', seq[next], 'recebido:', colorIndex)
      sfxMinigames.simon.erroSimon()
      onFailRef.current()
      return
    }
    const newPlayer = [...player, colorIndex]
    setPlayerSeq(newPlayer)
    if (newPlayer.length >= seq.length) {
      console.log('[SIMON] sequencia completa! round completo')
      sfxMinigames.simon.sequenciaCompleta()
      setPhase('showing')
      setRound(r => r + 1)
    }
  }, [])

  return (
    <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
        {t('games.minigames.simon.round_label', { n: round + 1, max: maxRounds })}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        maxWidth: '280px',
        margin: '0 auto',
      }}>
        {[0, 1, 2, 3].map(i => (
          <button
            key={i}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '12px',
              border: `3px solid ${COLORS[i]}`,
              backgroundColor: activeIndex === i ? COLORS[i] : `${COLORS[i]}33`,
              cursor: phase === 'input' ? 'pointer' : 'default',
              transition: 'background-color 0.1s, transform 0.1s',
              transform: activeIndex === i ? 'scale(1.05)' : 'scale(1)',
              boxShadow: activeIndex === i ? `0 0 20px ${COLORS[i]}88` : 'none',
            }}
            onClick={() => handleColorClick(i)}
            disabled={phase !== 'input'}
          />
        ))}
      </div>
      <div style={{
        fontFamily: "'Share Tech Mono',monospace",
        fontSize: '0.85rem',
        color: '#F5A623',
        marginTop: '1rem',
      }}>
        {phase === 'showing' ? t('games.minigames.simon.observando') : t('games.minigames.simon.repita')}
      </div>
    </div>
  )
}
