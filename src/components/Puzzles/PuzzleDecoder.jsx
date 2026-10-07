import './Puzzles.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { sfxMinigames } from './sfx-minigames'

// Decodificador de Frequência: cada canal tem um alvo; o jogador ajusta a
// sintonia até ficar dentro da tolerância e aperta decodificar. O alvo de cada
// canal fica à mostra; o canal acende "travado" quando acerta. Errar gasta
// uma tentativa e mostra pra que lado ajustar.
const CONFIGS = {
  easy:    { bars: 1, timer: 45,  attempts: 5, tolerance: 8  },
  medium:  { bars: 2, timer: 45,  attempts: 4, tolerance: 6  },
  hard:    { bars: 3, timer: 30,  attempts: 3, tolerance: 5  },
  extreme: { bars: 4, timer: 20,  attempts: 3, tolerance: 4  },
}
const CORES = ['#00B4D8', '#A855F4', '#FF6B6B', '#22C55E'] // canal 1–4 (traço do gráfico)

function gerarAlvo() {
  return 20 + Math.floor(Math.random() * 61)
}

function Waveform({ sliders, travados, solved, heartbeat }) {
  const width = 280, height = 70
  return (
    <svg className="puzzle-decoder-onda" viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      <path className={`puzzle-decoder-pulso${heartbeat ? ' is-on' : ''}`} d={`M0,${height/2} L${width*0.3},${height/2} L${width*0.35},${height/2-8} L${width*0.38},${height/2+12} L${width*0.41},${height/2-20} L${width*0.44},${height/2+8} L${width*0.47},${height/2} L${width},${height/2}`} />
      <line className="puzzle-decoder-eixo" x1="0" y1={height/2} x2={width} y2={height/2} />
      {sliders.map((sl, idx) => {
        const amp = 20 * (sl / 100)
        const freq = 0.04 + (sl / 100) * 0.12
        const points = Array.from({ length: width }, (_, x) => `${x === 0 ? 'M' : 'L'}${x},${height/2 + amp * Math.sin(x * freq + idx * 0.8)}`).join(' ')
        const cor = solved || travados[idx] ? '#22C55E' : CORES[idx]
        return <path key={idx} d={points} fill="none" stroke={cor} strokeWidth={solved || travados[idx] ? 2 : 1.3} />
      })}
    </svg>
  )
}

export default function PuzzleDecoder({ onSolve, onFail, config = {} }) {
  const { t } = useLanguage()
  const difficulty = config.difficulty || 'easy'
  const cfg = CONFIGS[difficulty]
  const [targets] = useState(() => Array.from({ length: cfg.bars }, gerarAlvo))
  const [sliders, setSliders] = useState(() => Array.from({ length: cfg.bars }, () => 50))
  const [attempts, setAttempts] = useState(0)
  const [hints, setHints] = useState([])
  const [done, setDone] = useState(false)
  const [solved, setSolved] = useState(false)
  const [timeLeft, setTimeLeft] = useState(cfg.timer)
  const [heartbeat, setHeartbeat] = useState(false)
  const lastSlideSfx = useRef(0)
  const alignedPlayed = useRef(false)

  useEffect(() => {
    if (done) return
    const timerInt = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setDone(true); setTimeout(() => onFail?.(), 500); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerInt)
  }, [done])

  useEffect(() => {
    if (done) return
    const beatInt = setInterval(() => { setHeartbeat(true); setTimeout(() => setHeartbeat(false), 600) }, 10000)
    return () => clearInterval(beatInt)
  }, [done])

  const travados = sliders.map((sl, i) => Math.abs(sl - targets[i]) <= cfg.tolerance)
  const allAligned = travados.every(Boolean)
  // SFX: revelar quando todos os canais alinham
  useEffect(() => {
    if (allAligned && !done && !alignedPlayed.current) {
      alignedPlayed.current = true
      sfxMinigames.revelar()
    }
    if (!allAligned) alignedPlayed.current = false
  }, [allAligned, done])

  const handleDecode = useCallback(() => {
    if (done) return
    if (allAligned) {
      setSolved(true); setDone(true)
      sfxMinigames.vitoria()
      setTimeout(() => onSolve?.(), 800)
      return
    }
    const next = attempts + 1
    setAttempts(next)
    setHints(sliders.map((sl, i) => (Math.abs(sl - targets[i]) <= cfg.tolerance ? 'ok' : sl < targets[i] ? 'subir' : 'descer')))
    if (next >= cfg.attempts) { setDone(true); setTimeout(() => onFail?.(), 800) }
  }, [sliders, targets, done, attempts, allAligned, cfg])

  const updateSlider = (idx, val) => {
    setSliders(prev => prev.map((s, i) => (i === idx ? val : s)))
    setHints(prev => prev.map((h, i) => (i === idx ? null : h)))
    const agora = Date.now()
    if (agora - lastSlideSfx.current > 100) { lastSlideSfx.current = agora; sfxMinigames.slide() }
  }

  const urgencia = timeLeft <= 10 ? ' is-urgente' : timeLeft <= 20 ? ' is-aviso' : ''
  return (
    <div className="puzzle-container">
      <div className="puzzle-title">{t('games.minigames.decoder.titulo_jogo')}</div>
      <p className="puzzle-desc">{cfg.bars > 1 ? t('games.minigames.decoder.instrucao_n') : t('games.minigames.decoder.instrucao_1')}</p>
      <div className="puzzle-decoder-topo">
        <span className={`puzzle-decoder-tempo${urgencia}`}>⏱ {timeLeft}s</span>
        <span className="puzzle-decoder-tentativas">{t('games.minigames.tentativas', { a: attempts, b: cfg.attempts })}</span>
      </div>
      <Waveform sliders={sliders} travados={travados} solved={solved} heartbeat={heartbeat} />
      <div className="puzzle-decoder-canais">
        {sliders.map((sl, idx) => (
          <div key={idx} className={`puzzle-decoder-canal${travados[idx] ? ' is-travado' : ''}`} style={{ '--canal': CORES[idx] }}>
            <div className="puzzle-decoder-linha">
              {cfg.bars > 1 && <span className="puzzle-decoder-num">{idx + 1}</span>}
              <span className="puzzle-decoder-alvo">{t('games.minigames.decoder.alvo')} <b>{targets[idx]}</b> <small>±{cfg.tolerance}</small></span>
              <span className="puzzle-decoder-valor">{sl}</span>
              <span className="puzzle-decoder-estado">
                {travados[idx] ? t('games.minigames.decoder.travado')
                  : hints[idx] === 'subir' ? t('games.minigames.decoder.subir')
                    : hints[idx] === 'descer' ? t('games.minigames.decoder.descer') : ''}
              </span>
            </div>
            <input className="puzzle-decoder-range" type="range" min="0" max="100" value={sl} onChange={e => updateSlider(idx, Number(e.target.value))} disabled={done} aria-label={`${t('games.minigames.decoder.alvo')} ${targets[idx]}`} />
          </div>
        ))}
      </div>
      {solved
        ? <p className="puzzle-decoder-msg is-ok">{t('games.minigames.decoder.decifrado')}</p>
        : allAligned && <p className="puzzle-decoder-msg">{t('games.minigames.decoder.alinhado')}</p>}
      <div className="puzzle-buttons">
        <button className="puzzle-btn puzzle-btn--amber" onClick={handleDecode} disabled={done}>{t('games.minigames.decoder.decodificar', { n: attempts, total: cfg.attempts })}</button>
      </div>
    </div>
  )
}
