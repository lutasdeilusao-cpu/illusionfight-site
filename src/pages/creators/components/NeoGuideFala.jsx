import { useEffect, useState } from 'react'
import rosto from '../../../assets/images/creators/neoguide-rosto.webp'
import './NeoGuideFala.css'

const MS_POR_LETRA = 16

function semAnimacao() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

/** Balão da NeoGuide. O texto "digita" na primeira vez que aparece;
 *  tocar no balão completa na hora. */
export default function NeoGuideFala({ texto, nome, compacta = false }) {
  const [mostrado, setMostrado] = useState(() => (semAnimacao() ? texto.length : 0))

  useEffect(() => {
    if (semAnimacao()) { setMostrado(texto.length); return undefined }
    setMostrado(0)
    const id = setInterval(() => {
      setMostrado(n => {
        if (n >= texto.length) { clearInterval(id); return n }
        return n + 1
      })
    }, MS_POR_LETRA)
    return () => clearInterval(id)
  }, [texto])

  const digitando = mostrado < texto.length

  return (
    <div className={`neo-fala${compacta ? ' neo-fala--compacta' : ''}`}>
      <img className="neo-fala__rosto" src={rosto} alt="" width="256" height="256" />
      <button type="button" className="neo-fala__balao" onClick={() => setMostrado(texto.length)}>
        <span className="neo-fala__nome">{nome}</span>
        <span className="neo-fala__texto" aria-live="polite">
          {texto.slice(0, mostrado)}
          {digitando && <span className="neo-fala__cursor" aria-hidden="true" />}
        </span>
      </button>
    </div>
  )
}
