import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TRIAL_ACTIVE } from '../config/trial.js'
import livroIndex from '../data/livro-index.json'
import './BookChaptersRow.css'

export default function BookChaptersRow() {
  const scrollRef = useRef(null)
  const capitulos = [...livroIndex].reverse()

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -640, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 640, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') scrollRef.current?.scrollBy({ left: -640, behavior: 'smooth' })
      if (e.key === 'ArrowRight') scrollRef.current?.scrollBy({ left: 640, behavior: 'smooth' })
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <section className="book-chapters-section">
      <h2 className="book-chapters-title">ÚLTIMOS CAPÍTULOS</h2>
      <div className="book-chapters-wrapper">
        <button className="book-chapters-arrow book-chapters-arrow--left" onClick={scrollLeft}>‹</button>
        <div className="book-chapters-scroll" ref={scrollRef}>
          {capitulos.map(cap => {
            const liberado = cap.publicado || TRIAL_ACTIVE
            const Wrapper = liberado ? Link : 'div'
            const wrapperProps = liberado ? { to: `/livro/${cap.id}` } : {}
            return (
              <Wrapper
                key={cap.id}
                className="book-chapter-card"
                {...wrapperProps}
              >
                <div className="book-chapter-card__inner">
                  <span className="book-chapter-card__num">CAP. {String(cap.numero).padStart(2, '0')}</span>
                  <div className="book-chapter-card__overlay">
                    <p className="book-chapter-card__tagline">{cap.tagline_pt}</p>
                  </div>
                </div>
                <div className="book-chapter-card__footer">
                  <span className="book-chapter-card__titulo">{cap.titulo}</span>
                  {!cap.publicado && (
                    <span className="book-chapter-card__badge">PREMIUM</span>
                  )}
                </div>
              </Wrapper>
            )
          })}
        </div>
        <button className="book-chapters-arrow book-chapters-arrow--right" onClick={scrollRight}>›</button>
      </div>
    </section>
  )
}
