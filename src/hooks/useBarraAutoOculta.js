import { useCallback, useEffect, useRef, useState } from 'react'

/** Barra do leitor: some quando o leitor desce (a página é o que importa),
 *  volta quando ele sobe ou toca na página. Perto do topo fica sempre à
 *  mostra. `forcar` mantém visível (ex.: fim do capítulo). */
export function useBarraAutoOculta({ limiar = 12, topo = 80 } = {}) {
  const [visivel, setVisivel] = useState(true)
  const ultimoY = useRef(0)

  useEffect(() => {
    ultimoY.current = window.scrollY
    let quadro = 0
    const onScroll = () => {
      if (quadro) return
      quadro = requestAnimationFrame(() => {
        quadro = 0
        const y = window.scrollY
        const delta = y - ultimoY.current
        if (y < topo) setVisivel(true)
        else if (delta > limiar) setVisivel(false)
        else if (delta < -limiar) setVisivel(true)
        if (Math.abs(delta) > limiar) ultimoY.current = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (quadro) cancelAnimationFrame(quadro)
    }
  }, [limiar, topo])

  const alternar = useCallback(() => setVisivel(v => !v), [])
  const mostrar = useCallback(() => setVisivel(true), [])

  return { visivel, alternar, mostrar }
}
