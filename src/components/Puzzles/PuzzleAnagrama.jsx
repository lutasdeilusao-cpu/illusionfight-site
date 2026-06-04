import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const BANCO = {
  easy: [
    'MARELIA', 'BRAVARA', 'KRONOS', 'SANGUE', 'DREADS',
    'ARENA', 'LUVAS', 'NICKS', 'RANKS', 'BALAS',
    'VISOR', 'GRADE', 'PEDRA', 'CHAMA', 'FACAO',
    'BENGALA', 'BOMBA', 'LUTA', 'PODER', 'SOMBRA',
  ],
  medium: [
    'XAKIXI', 'AURANIS', 'SHUNTARO', 'VITORIA', 'BENGALA',
    'PRIMORDIAL', 'YAWANARI', 'KARNAZAR', 'NEOGUIDE',
    'ELEMENTAL', 'BERIMBAU', 'BOMBETA', 'CAPANGA',
    'OSVALDO', 'RANKING', 'THUNDERBOLT', 'CACHORRO',
    'FREDERICO', 'HELENA', 'DIGITAL',
  ],
  hard: [
    'SANGUE PRIMORDIAL', 'MODO OBSERVADOR', 'SALA PRIVADA',
    'JACK CACHORRAO', 'XAKAXI EDITION', 'DREADS VERDES',
    'MESTRE VIRAN', 'HYPER MOMENT', 'PRIMEIRA REGRA',
    'MODO XAMA', 'TREVAS PRIMORDIAIS', 'BRIGUENTO',
  ],
  extreme: [
    'LUTAS DE ILUSAO', 'SANGUE PRIMORDIAL ATIVO',
    'KRONOS NA ILHA PRIVADA', 'JACK E KIM JUNTOS',
    'PRIMEIRA REGRA DA BRIGA', 'MODO OBSERVADOR ATIVO',
    'TREVAS DEVORANDO TUDO', 'SALA PRIVADA DE TREINO',
    'XAKAXI EDITION SERIE LIMITADA', 'NEOGUIDE VERIFICACAO',
  ],
  epic: [
    'KIM NAO IMPLORA PRA NINGUEM', 'PAJÉ YAWANARI CHEGOU PRA DIVAR',
    'ISSO SO PODE SER UM SONHO', 'EU VOU MATAR ESSE CARA',
    'A DOR E CEM POR CENTO REAL', 'BRIGUENTO CENTO E QUARENTA E UM',
    'SHUNTARO VEIO DE AZUMA PRA ISSO', 'HELENA TINHA DOZE ANOS',
    'NAO HA REGRAS NA BRIGA DE RUA', 'TREIS BILHOES DE JOGADORES',
  ],
}

const CONFIGS = {
  easy:    { timer: 45, tentativas: 5, tipo: 'letra'  },
  medium:  { timer: 40, tentativas: 4, tipo: 'letra'  },
  hard:    { timer: 35, tentativas: 3, tipo: 'palavra' },
  extreme: { timer: 25, tentativas: 3, tipo: 'palavra' },
  epic:    { timer: 20, tentativas: 2, tipo: 'palavra' },
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  if (a.join('') === arr.join('') && a.length > 1) { [a[0], a[1]] = [a[1], a[0]] }
  return a
}

function prepararUnidades(palavra, tipo) {
  return shuffleArray(tipo === 'palavra' ? palavra.split(' ') : palavra.split(''))
}

export default function PuzzleAnagrama({ onSolve, onFail, config = {} }) {
  const difficulty = config.difficulty || 'easy'
  const cfg = CONFIGS[difficulty]
  const banco = BANCO[difficulty]
  const numPalavras = difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : difficulty === 'extreme' ? 4 : difficulty === 'epic' ? 5 : 1
  const [palavras] = useState(() => { const s = shuffleArray([...banco]); return s.slice(0, numPalavras) })
  const [indicePalavraAtual, setIndicePalavraAtual] = useState(0)
  const [unidades, setUnidades] = useState(() => prepararUnidades(palavras[0], cfg.tipo))
  const [selected, setSelected] = useState([])
  const [tentativas, setTentativas] = useState(0)
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(cfg.timer)
  const [palavrasResolvidas, setPalavrasResolvidas] = useState([])
  const palavraAtual = palavras[indicePalavraAtual]

  console.log('[ANAGRAMA] difficulty:', difficulty, '| palavras:', palavras, '| tipo:', cfg.tipo)

  useEffect(() => {
    if (done) return
    const t = setInterval(() => { setTimeLeft(prev => { if (prev <= 1) { setDone(true); setTimeout(() => onFail?.(), 500); return 0 } return prev - 1 }) }, 1000)
    return () => clearInterval(t)
  }, [done])

  const handleClick = useCallback((idx) => { if (done) return; setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]) }, [done])
  const handleSubmit = useCallback(() => {
    if (done || selected.length === 0) return
    const formado = selected.map(i => unidades[i]).join(cfg.tipo === 'palavra' ? ' ' : '').trim()
    const correto = palavraAtual
    console.log('[ANAGRAMA] formado:', JSON.stringify(formado), '| correto:', JSON.stringify(correto), '| match:', formado === correto)
    if (formado === correto) {
      const novasResolvidas = [...palavrasResolvidas, palavraAtual]
      setPalavrasResolvidas(novasResolvidas); setSelected([]); setMsg(`✓ "${palavraAtual}"`)
      if (novasResolvidas.length >= numPalavras) { setDone(true); setTimeout(() => onSolve?.(), 600); return }
      const prox = indicePalavraAtual + 1; setIndicePalavraAtual(prox); setUnidades(prepararUnidades(palavras[prox], cfg.tipo))
      setTimeout(() => setMsg(''), 1000)
    } else {
      const nova = tentativas + 1; setTentativas(nova); setSelected([])
      if (nova >= cfg.tentativas) { setDone(true); setMsg(`✗ era "${palavraAtual}"`); setTimeout(() => onFail?.(), 800) }
      else setMsg(`"${formado}" — errado. ${cfg.tentativas - nova} tentativas restantes.`)
    }
  }, [selected, unidades, palavraAtual, done, tentativas, palavrasResolvidas, indicePalavraAtual])

  const timerColor = timeLeft <= 10 ? '#DC143C' : timeLeft <= 20 ? '#F5A623' : '#555'
  const timerFontSize = timeLeft <= 10 ? '1.1rem' : timeLeft <= 20 ? '0.9rem' : '0.65rem'

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">🔤 Anagrama</div>
      <p className="puzzle-desc">{cfg.tipo === 'palavra' ? 'reordene as palavras para formar a frase correta.' : 'reordene as letras para formar a palavra correta.'}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize: timerFontSize, color: timerColor, fontWeight: timeLeft <= 20 ? 'bold' : 'normal', animation: timeLeft <= 10 ? 'timer-urgent 0.5s infinite' : timeLeft <= 20 ? 'timer-warn 1s infinite' : 'none', transition: 'font-size 0.3s, color 0.3s', letterSpacing: '0.1em' }}>⏱ {timeLeft}s</span>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.65rem', color:'#555' }}>{palavrasResolvidas.length+1}/{numPalavras} · tentativas: {tentativas}/{cfg.tentativas}</span>
      </div>
      {numPalavras > 1 && (
        <div style={{ display:'flex', gap:'0.3rem', justifyContent:'center', marginBottom:'0.5rem' }}>
          {palavras.map((p,i) => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background: palavrasResolvidas.includes(p) ? '#22C55E' : i===indicePalavraAtual ? '#F5A623' : '#222', border:'1px solid #333', transition:'background 0.3s' }} />)}
        </div>
      )}
      {palavrasResolvidas.length > 0 && <div style={{ marginBottom:'0.5rem', textAlign:'center' }}>{palavrasResolvidas.map((p,i) => <span key={i} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.6rem', color:'#22C55E', marginRight:'0.5rem', opacity:0.7 }}>✓ {p}</span>)}</div>}
      <div className="puzzle-anagrama-letras">
        {unidades.map((u, idx) => (
          <motion.button key={idx} className={`puzzle-anagrama-letra ${selected.includes(idx) ? 'puzzle-anagrama-letra--selected' : ''}`}
            onClick={() => handleClick(idx)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={done}
            style={{ padding: cfg.tipo === 'palavra' ? '0.4rem 0.7rem' : undefined, width: cfg.tipo === 'palavra' ? 'auto' : undefined, fontSize: cfg.tipo === 'palavra' ? '0.75rem' : undefined }}>{u}</motion.button>
        ))}
      </div>
      <div className="puzzle-anagrama-preview"><span className="puzzle-anagrama-preview-label">formado: </span><span className="puzzle-anagrama-preview-text">{selected.length > 0 ? selected.map(i => unidades[i]).join('') : '...'}</span></div>
      {msg && <p className="puzzle-hint" style={{ color: msg.startsWith('✓') ? '#22C55E' : msg.startsWith('✗') ? '#8B0000' : '#F5A623' }}>{msg}</p>}
      <div className="puzzle-buttons">
        <button className="jack-btn" onClick={() => setSelected([])} disabled={done}>[ limpar ]</button>
        <button className="jack-btn jack-btn--amber" onClick={handleSubmit} disabled={done || selected.length === 0}>[ confirmar ]</button>
      </div>
    </div>
  )
}
