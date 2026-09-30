import { useEffect, useState } from 'react'

/** Quanto do capítulo (o bloco de texto `alvoRef`) já passou pela tela, de 0
 *  a 100. Mede o texto, não a página inteira — o fim (reações, próximo
 *  capítulo) não conta como leitura. */
export function useProgressoLeitura(alvoRef, dependencia) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let quadro = 0
    const medir = () => {
      quadro = 0
      const el = alvoRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const percorrido = window.innerHeight - r.top
      const total = r.height || 1
      setPct(Math.max(0, Math.min(100, Math.round((percorrido / total) * 100))))
    }
    const onScroll = () => { if (!quadro) quadro = requestAnimationFrame(medir) }
    medir()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (quadro) cancelAnimationFrame(quadro)
    }
  }, [alvoRef, dependencia])

  return pct
}

/** Minutos de leitura estimados (~220 palavras por minuto). */
export function minutosDeLeitura(md = '') {
  const palavras = md.replace(/[#*_>`[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(palavras / 220))
}
