import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TRIAL_ACTIVE } from '../config/trial.js'
import livroIndex from '../data/livro-index.json'
import { useLanguage } from '../context/LanguageContext'
import comingSoonImg from '../assets/images/ComingSoon.png'
import capa01 from '../assets/images/livro/capitulo-01.png'
import capa02 from '../assets/images/livro/capitulo-02.png'
import capa03 from '../assets/images/livro/capitulo-03.png'
import './BookChaptersRow.css'

const capaMap = {
  'capitulo-01': capa01,
  'capitulo-02': capa02,
  'capitulo-03': capa03,
}

export default function BookChaptersRow() {
  const { t } = useLanguage()
  const scrollRef = useRef(null)
  const capitulos = [...livroIndex].slice(0, 6)

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
      <h2 className="book-chapters-title">{t('pages.livro.titulo')}</h2>
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
                <div
                  className="book-chapter-card__inner"
                  style={{
                    backgroundImage: `url(${cap.publicado && capaMap[cap.id] ? capaMap[cap.id] : comingSoonImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="book-chapter-card__overlay">
                    <p className="book-chapter-card__tagline">{cap.tagline_pt}</p>
                  </div>
                </div>
                <div className="book-chapter-card__footer">
                  <span className="book-chapter-card__titulo">{cap.titulo}</span>
                  {!cap.publicado && (
                    <span className="book-chapter-card__badge">{t('pages.livro.premium')}</span>
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
