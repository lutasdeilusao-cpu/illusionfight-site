import { useEffect, useRef, useState } from 'react'
import './LinhaDoTempo.css'

/** Linha vertical que vai acendendo conforme a página rola; cada ponto
 *  acende quando a luz chega nele. */
export default function LinhaDoTempo({ pontos }) {
  const ref = useRef(null)
  const [acesos, setAcesos] = useState(0)

  useEffect(() => {
    let raf = 0
    const medir = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const caixa = el.getBoundingClientRect()
      const alvo = window.innerHeight * 0.6
      const p = Math.min(1, Math.max(0, (alvo - caixa.top) / caixa.height))
      el.style.setProperty('--tl-luz', p.toFixed(4))
      const marcos = el.querySelectorAll('.tl-ponto')
      let n = 0
      marcos.forEach(m => { if (m.getBoundingClientRect().top < alvo) n += 1 })
      setAcesos(n)
    }
    const pedir = () => { if (!raf) raf = requestAnimationFrame(medir) }
    medir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => { window.removeEventListener('scroll', pedir); window.removeEventListener('resize', pedir); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="tl" ref={ref}>
      <span className="tl__trilho" aria-hidden="true"><span className="tl__luz" /></span>
      <ol className="tl__lista">
      {pontos.map((p, i) => (
        <li key={p.ano} className={`tl-ponto${i < acesos ? ' is-aceso' : ''}${p.ano === '20XX' ? ' tl-ponto--agora' : ''}`}>
          <span className="tl-ponto__marca" aria-hidden="true" />
          <span className="tl-ponto__ano">{p.ano}</span>
          <h3 className="tl-ponto__titulo">{p.titulo}</h3>
          <p className="tl-ponto__texto">{p.texto}</p>
        </li>
      ))}
      </ol>
    </div>
  )
}
