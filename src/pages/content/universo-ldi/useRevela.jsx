import { useEffect, useRef, useState } from 'react'

/** Liga `visivel` quando o elemento entra na tela (uma vez só). */
export function useRevela(margem = '0px 0px -10% 0px') {
  const ref = useRef(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setVisivel(true); return }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisivel(true); obs.disconnect() }
    }, { rootMargin: margem })
    obs.observe(el)
    return () => obs.disconnect()
  }, [margem])

  return [ref, visivel]
}

/** Seção com título no padrão da página e revelação ao entrar na tela. */
export function Secao({ id, indice, titulo, intro, alt, children }) {
  const [ref, visivel] = useRevela()
  return (
    <section
      ref={ref}
      id={id}
      className={`uldi-secao${alt ? ' uldi-secao--alt' : ''}${visivel ? ' is-visivel' : ''}`}
    >
      <div className="uldi-secao__head">
        <span className="uldi-secao__indice">{String(indice).padStart(2, '0')}</span>
        <h2 className="uldi-secao__titulo">{titulo}</h2>
      </div>
      {intro && <p className="uldi-secao__intro">{intro}</p>}
      {children}
    </section>
  )
}
