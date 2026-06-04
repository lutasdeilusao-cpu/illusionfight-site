import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const PERSONAGEM_STYLE = {
  jack: { fonte: "'Share Tech Mono', monospace", cor: '#00FF88', label: 'Jack', italico: false, peso: 'bold' },
  nina: { fonte: 'Georgia, serif', cor: '#FF6B6B', label: 'Nina', italico: true },
  kim: { fonte: "'Courier New', monospace", cor: '#F5A623', label: 'Kim', italico: false },
  paje: { fonte: 'Georgia, serif', cor: '#A855F4', label: 'Pajé', italico: true },
  narração: { fonte: "'Share Tech Mono', monospace", cor: '#555', label: null, italico: true },
}

const VELOCIDADE = 28

export default function DialogoCaso({ linhas, onFim }) {
  const [linhaAtual, setLinhaAtual] = useState(0)
  const [textoDigitado, setTextoDigitado] = useState('')
  const [linhasCompletas, setLinhasCompletas] = useState([])
  const [terminado, setTerminado] = useState(false)
  const [pulando, setPulando] = useState(false)

  useEffect(() => {
    if (!linhas || linhas.length === 0) { setTerminado(true); return }
    setLinhaAtual(0)
    setTextoDigitado('')
    setLinhasCompletas([])
    setTerminado(false)
  }, [linhas])

  useEffect(() => {
    if (terminado || pulando) return
    if (linhaAtual >= linhas.length) { setTerminado(true); return }
    const linha = linhas[linhaAtual]
    const texto = linha.texto
    let i = 0
    setTextoDigitado('')
    const t = setInterval(() => {
      i++
      setTextoDigitado(texto.slice(0, i))
      if (i >= texto.length) {
        clearInterval(t)
        setTimeout(() => {
          setLinhasCompletas(prev => [...prev, linha])
          setTextoDigitado('')
          setLinhaAtual(prev => prev + 1)
        }, 400)
      }
    }, VELOCIDADE)
    return () => clearInterval(t)
  }, [linhaAtual, terminado, pulando])

  const pular = () => {
    setPulando(true)
    setLinhasCompletas(linhas)
    setTextoDigitado('')
    setTerminado(true)
  }

  const renderLinha = (linha, idx, digitando = false) => {
    const estilo = PERSONAGEM_STYLE[linha.personagem] || PERSONAGEM_STYLE.jack
    return (
      <motion.div key={idx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '0.6rem' }}>
        {estilo.label && (
          <span style={{ fontFamily: estilo.fonte, color: estilo.cor, fontSize: '0.65rem',
            display: 'block', marginBottom: '0.15rem', letterSpacing: '0.1em' }}>
            {estilo.label.toUpperCase()}
          </span>
        )}
        <span style={{ fontFamily: estilo.fonte, color: digitando ? estilo.cor : `${estilo.cor}cc`,
          fontSize: '0.82rem', fontStyle: estilo.italico ? 'italic' : 'normal', lineHeight: '1.5',
          fontWeight: estilo.peso || 'normal' }}>
          {digitando ? textoDigitado : linha.texto}
          {digitando && <span style={{ animation: 'cursor-blink 0.7s infinite', opacity: 1 }}>▌</span>}
        </span>
      </motion.div>
    )
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ minHeight: '8rem', marginBottom: '1rem' }}>
        {linhasCompletas.map((l, i) => renderLinha(l, i, false))}
        {!terminado && linhaAtual < linhas.length && renderLinha(linhas[linhaAtual], linhaAtual, true)}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {!terminado && (
          <button className="jack-btn" onClick={pular} style={{ fontSize: '0.65rem', borderColor: '#333', color: '#555' }}>
            [ pular ]
          </button>
        )}
        {terminado && (
          <motion.button className="jack-btn jack-btn--amber" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={onFim}>[ continuar ]</motion.button>
        )}
      </div>
    </div>
  )
}
