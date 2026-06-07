import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'

const BANCO = {
  easy: [
    'MARELIA', 'BRAVARA', 'KRONOS', 'SANGUE', 'DREADS',
    'ARENA', 'LUVAS', 'NICKS', 'RANKS', 'BALAS',
    'VISOR', 'GRADE', 'PEDRA', 'CHAMA', 'BENGALA',
    'PODER', 'SOMBRA', 'LUTA', 'FACAO', 'BOMBA',
  ],
  medium: [
    'XAKIXI', 'AURANIS', 'SHUNTARO', 'VITORIA', 'PRIMORDIAL',
    'YAWANARI', 'KARNAZAR', 'NEOGUIDE', 'ELEMENTAL', 'BERIMBAU',
    'BOMBETA', 'CAPANGA', 'OSVALDO', 'RANKING', 'THUNDERBOLT',
    'FREDERICO', 'HELENA', 'DIGITAL', 'CACHORRO', 'BENGALA',
  ],
  hard: [
    'SANGUE PRIMORDIAL', 'MODO OBSERVADOR', 'SALA PRIVADA',
    'JACK CACHORRAO', 'XAKAXI EDITION', 'DREADS VERDES',
    'MESTRE VIRAN', 'HYPER MOMENT', 'PRIMEIRA REGRA',
    'TREVAS PRIMORDIAIS', 'JACK E NINA LUTAM', 'KIM NO LDI',
    'BENGALA DO JACK', 'KATANA DE NINA', 'PAJÉ YAWANARI',
  ],
  extreme: [
    'LUTAS DE ILUSAO', 'KIM NAO IMPLORA PRA NINGUEM',
    'PAJÉ YAWANARI CHEGOU PRA DIVAR', 'EU VOU MATAR ESSE CARA',
    'A DOR E CEM POR CENTO REAL', 'NAO HA REGRAS NA BRIGA DE RUA',
    'HELENA TINHA DOZE ANOS', 'JACK CACHORRAO GRAVA TUDO',
    'SHUNTARO VEIO DE AZUMA', 'TREIS BILHOES DE JOGADORES',
    'KRONOS QUER O CORPO PRIMORDIAL', 'NINA CORTOU COM A KATANA',
  ],
}

const CONFIGS = {
  easy:    { erros: 6, timer: null, opcoes: 6  },
  medium:  { erros: 5, timer: 60,  opcoes: 8  },
  hard:    { erros: 4, timer: 45,  opcoes: 10 },
  extreme: { erros: 3, timer: 30,  opcoes: 12 },
}

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

function filtrarPossíveis(opcoes, resposta, letrasCorretas, letrasErradas) {
  return opcoes.filter(op => {
    for (const l of letrasErradas) { if (op.includes(l)) return false }
    for (const l of letrasCorretas) { if (!op.includes(l)) return false }
    for (let i = 0; i < resposta.length; i++) {
      if (resposta[i] === ' ') continue
      if (letrasCorretas.has(resposta[i]) && op[i] !== resposta[i]) return false
    }
    return true
  })
}

export default function PuzzleForça({ onSolve, onFail, config = {} }) {
  const difficulty = config.difficulty || 'easy'
  const cfg = CONFIGS[difficulty]
  const banco = BANCO[difficulty]

  const [resposta] = useState(() => shuffleArray([...banco])[0])
  const [opcoes] = useState(() => {
    const sem = shuffleArray([...banco]).filter(p => p !== resposta)
    return shuffleArray([resposta, ...sem.slice(0, cfg.opcoes - 1)])
  })

  const [letrasCorretas, setLetrasCorretas] = useState(new Set())
  const [letrasErradas, setLetrasErradas] = useState(new Set())
  const [erros, setErros] = useState(0)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(cfg.timer)
  const [acusou, setAcusou] = useState(null)

  const letrasResposta = useMemo(() => new Set(resposta.replace(/ /g, '').split('')), [resposta])
  const possíveis = useMemo(() => filtrarPossíveis(opcoes, resposta, letrasCorretas, letrasErradas), [opcoes, resposta, letrasCorretas, letrasErradas])

  console.log('[FORCA] difficulty:', difficulty, '| resposta:', resposta, '| opcoes:', opcoes.length)

  useEffect(() => {
    if (!cfg.timer || done) return
    const interval = setInterval(() => { setTimeLeft(prev => { if (prev <= 1) { setDone(true); setTimeout(() => onFail?.(), 500); return 0 } return prev - 1 }) }, 1000)
    return () => clearInterval(interval)
  }, [done, cfg.timer])

  useEffect(() => {
    if (done) return
    if ([...letrasResposta].every(l => letrasCorretas.has(l))) { setDone(true); setTimeout(() => onSolve?.(), 600) }
  }, [letrasCorretas])

  const clicarLetra = useCallback((letra) => {
    if (done || letrasCorretas.has(letra) || letrasErradas.has(letra)) return
    if (letrasResposta.has(letra)) { setLetrasCorretas(prev => new Set([...prev, letra])) }
    else {
      const novosErros = erros + 1; setLetrasErradas(prev => new Set([...prev, letra])); setErros(novosErros)
      if (novosErros >= cfg.erros) { setDone(true); setTimeout(() => onFail?.(), 800) }
    }
  }, [done, letrasCorretas, letrasErradas, letrasResposta, erros, cfg.erros])

  const acusarPalavra = useCallback((palavra) => {
    if (done) return; setAcusou(palavra)
    if (palavra === resposta) { setDone(true); setLetrasCorretas(new Set(letrasResposta)); setTimeout(() => onSolve?.(), 800) }
    else { const novosErros = Math.min(erros + 2, cfg.erros); setErros(novosErros); setAcusou(null); if (novosErros >= cfg.erros) { setDone(true); setTimeout(() => onFail?.(), 800) } }
  }, [done, resposta, letrasResposta, erros, cfg.erros])

  const timerColor = timeLeft <= 10 ? '#DC143C' : timeLeft <= 20 ? '#F5A623' : '#555'
  const errosColor = erros >= cfg.erros - 1 ? '#DC143C' : erros >= cfg.erros - 2 ? '#F5A623' : '#555'

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">🎡 Palavra Secreta</div>
      <p className="puzzle-desc">descubra a palavra clicando nas letras. acuse a palavra quando souber.</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', marginBottom: '0.75rem' }}>
        {cfg.timer ? <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize: timeLeft <= 10 ? '1.1rem' : timeLeft <= 20 ? '0.9rem' : '0.65rem', color: timerColor, fontWeight: timeLeft <= 20 ? 'bold' : 'normal', animation: timeLeft <= 10 ? 'timer-urgent 0.5s infinite' : timeLeft <= 20 ? 'timer-warn 1s infinite' : 'none', transition: 'font-size 0.3s, color 0.3s', letterSpacing:'0.1em' }}>⏱ {timeLeft}s</span> : <span />}
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.65rem', color:errosColor }}>erros: {erros}/{cfg.erros}</span>
      </div>

      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.55rem', color:'#333', textAlign:'center', lineHeight:1.4, marginBottom:'0.5rem', userSelect:'none' }}>
        {[`  +---+`,`  |   ${erros >= 1 ? 'O' : ' '}`,`  |  ${erros >= 3 ? '/' : ' '}${erros >= 2 ? '|' : ' '}${erros >= 4 ? '\\' : ' '}`,`  |  ${erros >= 5 ? '/' : ' '} ${erros >= 6 ? '\\' : ' '}`,`  |`,`==+==`].map((l,i) => <div key={i}>{l}</div>)}
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'4px', margin:'0.75rem auto' }}>
        {resposta.split('').map((char, i) => char === ' ' ? <span key={i} style={{ width:12, display:'inline-block' }} /> : (
          <motion.div key={i} className="puzzle-forca-cell" animate={letrasCorretas.has(char) ? { background:'rgba(245,166,35,0.15)', borderColor:'#F5A623' } : {}} transition={{ duration:0.2 }}>
            {letrasCorretas.has(char) ? char : ''}
          </motion.div>
        ))}
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'4px', margin:'0.75rem auto', maxWidth:320 }}>
        {ALFABETO.map(letra => {
          const correta = letrasCorretas.has(letra); const errada = letrasErradas.has(letra)
          return <motion.button key={letra} onClick={() => clicarLetra(letra)} disabled={done || correta || errada}
            whileHover={!done && !correta && !errada ? { scale:1.1 } : {}} whileTap={!done && !correta && !errada ? { scale:0.9 } : {}}
            style={{ width:28, height:28, background: correta ? 'rgba(34,197,94,0.2)' : errada ? '#0a0a0a' : '#111',
              border:`1px solid ${correta ? '#22C55E' : errada ? '#1a1a1a' : '#333'}`, color: correta ? '#22C55E' : errada ? '#222' : '#888',
              fontFamily:"'Share Tech Mono',monospace", fontSize:'0.7rem', cursor: done || correta || errada ? 'default' : 'pointer',
              borderRadius:2, transition:'all 0.15s', textDecoration: errada ? 'line-through' : 'none' }}>{letra}</motion.button>
        })}
      </div>

      <div style={{ marginTop:'0.75rem' }}>
        <p style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.6rem', color:'#444', letterSpacing:'0.15em', marginBottom:'0.4rem', textAlign:'center' }}>
          POSSÍVEIS ({possíveis.length}/{opcoes.length})
        </p>
        {(difficulty === 'easy' || (difficulty === 'medium' && possíveis.length <= 4) || (difficulty === 'hard' && possíveis.length <= 2)) && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
            {opcoes.map((op, i) => {
              const possivel = possíveis.includes(op)
              return <motion.button key={i} onClick={() => possivel && !done ? acusarPalavra(op) : null} disabled={!possivel || done}
                animate={acusou === op ? { x:[0,-4,4,-4,0] } : {}} transition={{ duration:0.3 }}
                style={{ background: possivel ? '#0a0a0a' : 'transparent', border:`1px solid ${possivel ? '#2a2a2a' : 'transparent'}`,
                  borderLeft:`3px solid ${possivel ? '#F5A623' : 'transparent'}`, color: possivel ? '#888' : '#222',
                  fontFamily:"'Share Tech Mono',monospace", fontSize:'0.7rem', padding:'0.35rem 0.6rem',
                  cursor: possivel && !done ? 'pointer' : 'default', textAlign:'left', borderRadius:2,
                  textDecoration: !possivel ? 'line-through' : 'none', transition:'all 0.2s', letterSpacing:'0.05em' }}>
                {possivel ? `[ ${op} ]` : op}
              </motion.button>
            })}
          </div>
        )}
        <p style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.58rem', color:'#333', textAlign:'center', marginTop:'0.4rem' }}>
          clique numa palavra para acusar · acusação errada = -2 tentativas
        </p>
      </div>
    </div>
  )
}
