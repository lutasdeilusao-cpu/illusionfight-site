import { useEffect, useRef } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import './LeitorPaginas.css'

/** As páginas do capítulo, empilhadas sem vão — cada página WEB SHARD já é
 *  uma composição fechada. width/height reservam o espaço antes da imagem
 *  chegar (sem pulo de layout, e o "continuar da pág. N" cai no lugar
 *  certo). A página que cruza o meio da tela é a "atual". */
export default function LeitorPaginas({ paginas, proporcao, onPagina, onToque, ultimaRef }) {
  const { t } = useLanguage()
  const lista = useRef(null)
  const onPaginaRef = useRef(onPagina)
  onPaginaRef.current = onPagina
  const [largura, altura] = proporcao || [800, 1280]

  useEffect(() => {
    const raiz = lista.current
    if (!raiz) return
    const observer = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (e.isIntersecting) onPaginaRef.current(Number(e.target.dataset.pagina))
      })
    }, { rootMargin: '-50% 0px -50% 0px' })
    raiz.querySelectorAll('[data-pagina]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [paginas])

  return (
    <div className="ws-paginas" ref={lista} onClick={onToque}>
      {paginas.map((p, i) => (
        <img
          key={p.src}
          id={`ws-pag-${p.numero}`}
          ref={i === paginas.length - 1 ? ultimaRef : null}
          data-pagina={p.numero}
          className="ws-paginas__img"
          src={p.src}
          width={largura}
          height={altura}
          loading={i < 2 ? 'eager' : 'lazy'}
          fetchpriority={i === 0 ? 'high' : undefined}
          decoding="async"
          alt={t('webShard.leitor.pagina', { n: p.numero })}
        />
      ))}
    </div>
  )
}
