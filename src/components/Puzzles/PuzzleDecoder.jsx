import { useState, useEffect, useRef, useCallback } from 'react'

const CONFIGS = {
  easy:    { bars: 1, timer: 45,  attempts: 5, tolerance: 8  },
  medium:  { bars: 2, timer: 45,  attempts: 4, tolerance: 6  },
  hard:    { bars: 3, timer: 30,  attempts: 3, tolerance: 5  },
  extreme: { bars: 4, timer: 20,  attempts: 3, tolerance: 4  },
}

function gerarAlvo() {
  return 20 + Math.floor(Math.random() * 61)
}

function Waveform({ sliders, targets, tolerance, solved, heartbeat }) {
  const width = 280, height = 70
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}
      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #1a1a1a', borderRadius: 4, display: 'block' }}>
      <path d={`M0,${height/2} L${width*0.3},${height/2} L${width*0.35},${height/2-8} L${width*0.38},${height/2+12} L${width*0.41},${height/2-20} L${width*0.44},${height/2+8} L${width*0.47},${height/2} L${width},${height/2}`}
        fill="none" stroke={heartbeat ? '#DC143C' : '#1a0000'} strokeWidth={heartbeat ? 1.5 : 0.8}
        style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }} opacity={heartbeat ? 0.8 : 0.3} />
      <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#222" strokeWidth="0.5" strokeDasharray="4,4" />
      {sliders.map((sl, idx) => {
        const target = targets[idx]
        const diff = Math.abs(sl - target)
        const aligned = diff <= tolerance
        const color = solved ? '#22C55E' : aligned ? '#F5A623' : ['#00B4D8','#A855F4','#FF6B6B','#22C55E'][idx]
        const amp = 20 * (sl / 100)
        const freq = 0.04 + (sl / 100) * 0.12
        const points = Array.from({ length: width }, (_, x) => {
          const y = height/2 + amp * Math.sin(x * freq + idx * 0.8)
          return `${x === 0 ? 'M' : 'L'}${x},${y}`
        }).join(' ')
        return (<path key={idx} d={points} fill="none" stroke={color} strokeWidth={solved ? 2 : 1.2} opacity={solved ? 1 : aligned ? 0.9 : 0.5 + idx * 0.1} />)
      })}
      <text x={width/2} y={height - 4} textAnchor="middle" fill="#444" fontSize="7" fontFamily="monospace">
        {sliders.map((s, i) => `${s}MHz`).join(' · ')} — alvo: {targets.map(t => `${t}±${tolerance}`).join(' ')}
      </text>
    </svg>
  )
}

export default function PuzzleDecoder({ onSolve, onFail, config = {} }) {
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

  console.log('[DECODER] difficulty:', difficulty, '| bars:', cfg.bars, '| targets:', targets)

  useEffect(() => {
    if (done) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setDone(true); setTimeout(() => onFail?.(), 500); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [done])

  useEffect(() => {
    if (done) return
    const t = setInterval(() => { setHeartbeat(true); setTimeout(() => setHeartbeat(false), 600) }, 10000)
    return () => clearInterval(t)
  }, [done])

  const allAligned = sliders.every((sl, i) => Math.abs(sl - targets[i]) <= cfg.tolerance)

  const handleDecode = useCallback(() => {
    if (done) return
    if (allAligned) {
      setSolved(true); setDone(true)
      setTimeout(() => onSolve?.(), 800)
      return
    }
    const next = attempts + 1
    setAttempts(next)
    const newHints = sliders.map((sl, i) => {
      const diff = Math.abs(sl - targets[i])
      if (diff <= cfg.tolerance) return '✓'
      return sl < targets[i] ? '↑ aumentar' : '↓ diminuir'
    })
    setHints(newHints)
    if (next >= cfg.attempts) { setDone(true); setTimeout(() => onFail?.(), 800) }
  }, [sliders, targets, done, attempts, allAligned, cfg])

  const updateSlider = (idx, val) => { setSliders(prev => prev.map((s, i) => i === idx ? val : s)) }
  const timerColor = timeLeft <= 10 ? '#8B0000' : timeLeft <= 20 ? '#F5A623' : '#555'

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">📡 Decodificador de Frequência</div>
      <p className="puzzle-desc">sintonize {cfg.bars > 1 ? 'todas as frequências' : 'na frequência correta'} para decifrar a mensagem.</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', marginBottom: '0.3rem' }}>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: timerColor }}>⏱ {timeLeft}s</span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: '#555' }}>tentativas: {attempts}/{cfg.attempts}</span>
      </div>
      <Waveform sliders={sliders} targets={targets} tolerance={cfg.tolerance} solved={solved} heartbeat={heartbeat} />
      <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {sliders.map((sl, idx) => {
          const aligned = Math.abs(sl - targets[idx]) <= cfg.tolerance
          const barColor = ['#00B4D8','#A855F4','#FF6B6B','#22C55E'][idx]
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {cfg.bars > 1 && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', color: aligned ? '#22C55E' : barColor, minWidth: 12 }}>{aligned ? '✓' : `${idx+1}`}</span>}
              <input type="range" min="0" max="100" value={sl} onChange={e => updateSlider(idx, Number(e.target.value))} disabled={done} style={{ flex: 1, accentColor: aligned ? '#22C55E' : barColor }} />
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: aligned ? '#22C55E' : '#666', minWidth: 36 }}>{sl}%</span>
              {hints[idx] && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', color: hints[idx] === '✓' ? '#22C55E' : '#F5A623', minWidth: 70 }}>{hints[idx]}</span>}
            </div>
          )
        })}
      </div>
      {allAligned && !done && <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#22C55E', textAlign: 'center', marginTop: '0.5rem', animation: 'vision-pulse 0.5s infinite' }}>✓ frequências alinhadas — confirme</p>}
      {solved && <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.85rem', color: '#22C55E', textAlign: 'center', marginTop: '0.5rem' }}>✓ sinal decifrado.</p>}
      <div className="puzzle-buttons" style={{ marginTop: '0.6rem' }}>
        <button className="jack-btn jack-btn--amber" onClick={handleDecode} disabled={done}>[ decodificar ({attempts}/{cfg.attempts}) ]</button>
      </div>
    </div>
  )
}
