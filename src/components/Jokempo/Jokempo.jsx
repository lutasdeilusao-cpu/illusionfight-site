import { useState, useEffect, useRef } from 'react'
import './Jokempo.css'

const EMOJI = {
  rock:     '\u270A',
  paper:    '\u270B',
  scissors: '\u270C\uFE0F',
}

const CHOICES = ['rock', 'paper', 'scissors']

function getWinner(p1, p2) {
  if (p1 === p2) return 'draw'
  if (
    (p1 === 'rock'     && p2 === 'scissors') ||
    (p1 === 'scissors' && p2 === 'paper')    ||
    (p1 === 'paper'    && p2 === 'rock')
  ) return 'p1'
  return 'p2'
}

export default function Jokempo({
  player1Name = 'Jogador',
  player2Name = 'IA',
  onResult,
  animated = true,
  i18nLabels = {},
}) {
  const [phase, setPhase] = useState('escolha')
  const [p1Choice, setP1Choice] = useState(null)
  const [p2Choice, setP2Choice] = useState(null)
  const [animStep, setAnimStep] = useState(0)
  const [animEmoji, setAnimEmoji] = useState(EMOJI.rock)
  const [winner, setWinner] = useState(null)
  const intervalRef = useRef(null)
  const emojiCycle = [EMOJI.rock, EMOJI.paper, EMOJI.scissors]

  const labels = {
    title:     i18nLabels.title     || 'Jokenp\u00F4',
    subtitle:  i18nLabels.subtitle  || 'Escolha sua jogada',
    rock:      i18nLabels.rock      || 'Pedra',
    paper:     i18nLabels.paper     || 'Papel',
    scissors:  i18nLabels.scissors  || 'Tesoura',
    you:       i18nLabels.you       || player1Name,
    opponent:  i18nLabels.opponent  || player2Name,
    win:       i18nLabels.win       || 'Voc\u00EA venceu!',
    lose:      i18nLabels.lose      || 'Voc\u00EA perdeu!',
    draw:      i18nLabels.draw      || 'Empate!',
  }

  function handleChoice(choice) {
    if (phase !== 'escolha') return
    const aiChoice = CHOICES[Math.floor(Math.random() * 3)]
    setP1Choice(choice)
    setP2Choice(aiChoice)

    if (!animated) {
      const result = getWinner(choice, aiChoice)
      setWinner(result)
      setPhase('resultado')
      if (onResult) {
        const winnerName = result === 'p1' ? player1Name : result === 'p2' ? player2Name : null
        setTimeout(() => onResult(winnerName), 800)
      }
      return
    }

    setPhase('animando')
    setAnimStep(0)
    setAnimEmoji(emojiCycle[0])

    let step = 0
    intervalRef.current = setInterval(() => {
      step++
      setAnimEmoji(emojiCycle[step % 3])
      setAnimStep(step)
      if (step >= 2) {
        clearInterval(intervalRef.current)
        setTimeout(() => {
          const result = getWinner(choice, aiChoice)
          setWinner(result)
          setPhase('resultado')
          if (onResult) {
            const winnerName = result === 'p1' ? player1Name : result === 'p2' ? player2Name : null
            setTimeout(() => onResult(winnerName), 1200)
          }
        }, 400)
      }
    }, 400)
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <div className="jkp-container">
      {phase === 'escolha' && (
        <>
          <p className="jkp-titulo">{labels.title}</p>
          <p className="jkp-subtitulo">{labels.subtitle}</p>
          <div className="jkp-opcoes">
            {CHOICES.map(c => (
              <button key={c} className="jkp-btn" onClick={() => handleChoice(c)}>
                <span className="jkp-emoji">{EMOJI[c]}</span>
                <span className="jkp-label">{labels[c]}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'animando' && (
        <div className="jkp-batalha">
          <p className="jkp-texto-animado">
            {['JO', 'KEN', 'P\u00D4'][animStep]}
          </p>
          <div className="jkp-maos">
            <div className="jkp-mao jkp-mao--p1">
              <span className="jkp-emoji">{animEmoji}</span>
              <span className="jkp-mao-label">{labels.you}</span>
            </div>
            <div className="jkp-mao jkp-mao--p2">
              <span className="jkp-emoji">{animEmoji}</span>
              <span className="jkp-mao-label">{labels.opponent}</span>
            </div>
          </div>
        </div>
      )}

      {phase === 'resultado' && (
        <div className="jkp-resultado">
          <div className="jkp-maos">
            <div className={`jkp-mao${winner === 'p1' ? ' jkp-mao--vencedor' : winner === 'p2' ? ' jkp-mao--perdedor' : ''}`}>
              <span className="jkp-emoji">{EMOJI[p1Choice]}</span>
              <span className="jkp-mao-label">{labels.you}</span>
            </div>
            <div className={`jkp-mao${winner === 'p2' ? ' jkp-mao--vencedor' : winner === 'p1' ? ' jkp-mao--perdedor' : ''}`}>
              <span className="jkp-emoji">{EMOJI[p2Choice]}</span>
              <span className="jkp-mao-label">{labels.opponent}</span>
            </div>
          </div>
          <p className={`jkp-resultado-texto${winner === 'p1' ? ' jkp-resultado--win' : winner === 'p2' ? ' jkp-resultado--lose' : ' jkp-resultado--draw'}`}>
            {winner === 'p1' ? labels.win : winner === 'p2' ? labels.lose : labels.draw}
          </p>
        </div>
      )}
    </div>
  )
}
