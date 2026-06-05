import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Intro({ onEnter }) {
  const [texto, setTexto] = useState('')
  const [fase, setFase] = useState('digitando')
  const fullText = 'Bem-vindo ao Sistema de Batalhas por Equipe do LDI.\nConectando Simulador...\nEnergia mental detectada.\nIniciando protocolo de seleção de classe.'

  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i++
      setTexto(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(t)
        setTimeout(() => setFase('pronto'), 500)
      }
    }, 35)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Glitch logo */}
      <div className="tatica-glitch" data-text="LDI ARENA" style={{
        fontFamily: 'Courier New', fontSize: '2.2rem', fontWeight: 900,
        color: '#FFD700', letterSpacing: '0.15em', marginBottom: '2rem',
        position: 'relative',
      }}>
        LDI ARENA
      </div>

      {/* NeoGuide text */}
      <div style={{
        maxWidth: 320, fontFamily: 'Courier New', fontSize: '0.8rem',
        color: '#00ff88', lineHeight: 1.7, marginBottom: '2rem',
        textAlign: 'center',
      }}>
        {texto.split('\n').map((l, i) => (
          <span key={i}>{l}<br /></span>
        ))}
        {fase === 'digitando' && <span style={{ display: 'inline-block', width: 6, height: 14, background: '#00ff88', marginLeft: 2, animation: 'pp-blink 1s step-end infinite' }} />}
      </div>

      {fase === 'pronto' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          style={{
            padding: '1rem 2.5rem', background: 'transparent',
            border: '2px solid #FFD700', borderRadius: 12,
            color: '#FFD700', fontFamily: 'Courier New', fontSize: '1rem',
            fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255,215,0,0.15)',
          }}>
          ENTRAR NA ARENA
        </motion.button>
      )}
    </div>
  )
}
