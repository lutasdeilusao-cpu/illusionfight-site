import { useState, useEffect, useRef } from 'react'
import { usePPStore } from '../store/usePPStore'
import { getCaso } from '../data/resolver'

export default function CasoAbertura() {
  const store = usePPStore()
  const caso = getCaso(store.casoAtivo)
  const [fim, setFim] = useState(false)
  const [linhaAtual, setLinhaAtual] = useState(0)
  const [textoDigitado, setTextoDigitado] = useState('')
  const [linhasCompletas, setLinhasCompletas] = useState([])
  const timerRef = useRef(null)

  if (!caso) { store.setFase('mapa'); return null }

  const linhas = caso.dialogoAbertura || []

  useEffect(() => {
    if (linhaAtual >= linhas.length) { setFim(true); return }
    const linha = linhas[linhaAtual]
    let i = textoDigitado.length

    timerRef.current = setInterval(() => {
      if (i >= linha.texto.length) {
        clearInterval(timerRef.current)
        setTimeout(() => {
          setLinhasCompletas(l => [...l, { ...linha, texto: linha.texto }])
          setLinhaAtual(l => l + 1)
          setTextoDigitado('')
        }, 500)
        return
      }
      setTextoDigitado(linha.texto.slice(0, i + 1))
      i++
    }, 30)

    return () => clearInterval(timerRef.current)
  }, [linhaAtual])

  if (fim) {
    return (
      <div className="pp-container">
        <div className="pp-header">
          <h1 className="pp-title">{caso.nome}</h1>
          <p className="pp-subtitle">{caso.monologoAbertura}</p>
        </div>
        <div className="pp-abertura-dialogo">
          {caso.dialogoAbertura.map((l, i) => (
            <div key={i} style={{ marginBottom: 12, color: l.personagem === 'jack' ? '#00FF88' : l.personagem === 'nina' ? '#FF6B6B' : l.personagem === 'kim' ? '#F5A623' : '#888', fontStyle: l.personagem === 'narração' ? 'italic' : 'normal' }}>
              {l.texto}
            </div>
          ))}
        </div>
        <button className="pp-btn pp-btn--primary" onClick={() => store.setFase('dossier')}>
          INVESTIGAR
        </button>
      </div>
    )
  }

  return (
    <div className="pp-container" onClick={() => { if (linhaAtual >= linhas.length) setFim(true) }}>
      <div className="pp-section-label">{caso.nome}</div>
      {linhasCompletas.map((l, i) => (
        <div key={i} style={{ marginBottom: 10, color: l.personagem === 'jack' ? '#00FF88' : l.personagem === 'nina' ? '#FF6B6B' : l.personagem === 'kim' ? '#F5A623' : '#888', fontStyle: l.personagem === 'narração' ? 'italic' : 'normal' }}>
          {l.texto}
        </div>
      ))}
      {linhaAtual < linhas.length && (
        <div style={{ marginBottom: 10, color: '#C8C8C8' }}>
          {textoDigitado}<span className="arena-cursor">█</span>
        </div>
      )}
    </div>
  )
}
