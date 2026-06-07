import { useRef, useEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../context/LanguageContext'
import produtos from '../data/produtos.json'
import './ShopSection.css'

export default function ShopSection() {
  const { t } = useLanguage()
  const ref = useScrollReveal()
  const trackRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const items = [...produtos, ...produtos, ...produtos]

  const onPointerDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX - trackRef.current.offsetLeft
    scrollLeft.current = trackRef.current.scrollLeft
    trackRef.current.style.cursor = 'grabbing'
    trackRef.current.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!isDragging.current) return
    const x = e.pageX - trackRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    trackRef.current.scrollLeft = scrollLeft.current - walk
  }

  const onPointerUp = () => {
    isDragging.current = false
    if (trackRef.current) trackRef.current.style.cursor = 'grab'
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const handleScroll = () => {
      const itemWidth = track.scrollWidth / 3
      if (track.scrollLeft < itemWidth * 0.1) {
        track.scrollLeft += itemWidth
      } else if (track.scrollLeft > itemWidth * 1.9) {
        track.scrollLeft -= itemWidth
      }
    }
    track.addEventListener('scroll', handleScroll)
    track.scrollLeft = track.scrollWidth / 3
    return () => track.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={ref} className="shop-section reveal">
      <div className="shop-section-header">
        <h2 className="section-title">{t('shop.titulo')}</h2>
      </div>
      <div
        ref={trackRef}
        className="shop-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {items.map((produto, i) => (
          <a
            key={`${produto.id}-${i}`}
            href={produto.url}
            className="shop-card"
            draggable="false"
            onClick={(e) => { if (isDragging.current) e.preventDefault() }}
          >
            <div className="shop-card-image">
              {produto.imagem
                ? <img src={produto.imagem} alt={produto.nome_pt} draggable="false" />
                : <div className="shop-card-placeholder">
                    <span className="shop-card-tipo">{produto.tipo.toUpperCase()}</span>
                  </div>
              }
              <span className="shop-card-badge">{produto.badge_pt}</span>
            </div>
            <div className="shop-card-footer">
              <p className="shop-card-nome">{produto.nome_pt}</p>
              <p className="shop-card-preco">{produto.preco}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
