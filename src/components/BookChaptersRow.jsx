import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { TRIAL_ACTIVE } from '../config/trial'
import index from '../data/livro-index.json'
import './BookChaptersRow.css'

export default function BookChaptersRow() {
  const ref = useScrollReveal()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'
  const taglineKey = locale === 'en' ? 'tagline_en' : locale === 'es' ? 'tagline_es' : 'tagline_pt'

  const published = index
    .filter(ch => ch.publicado || TRIAL_ACTIVE)
    .sort((a, b) => b.numero - a.numero)

  return (
    <section ref={ref} className="book-chapters-row reveal">
      <div className="container">
        <h2 className="section-title">ÚLTIMOS CAPÍTULOS</h2>
        <div className="book-chapters-row__fade">
          <div className="book-chapters-row__scroll">
            {published.map(ch => (
              <div
                key={ch.id}
                className="book-card"
                onClick={() => navigate(`/livro/${ch.id}`)}
              >
                <div className="book-card__thumb">
                  <span className="book-card__numero">
                    CAP. {String(ch.numero).padStart(2, '0')}
                  </span>
                </div>
                <div className="book-card__info">
                  <span className="book-card__label">{ch[tituloKey]}</span>
                  {!ch.publicado && (
                    <span className="book-card__badge book-card__badge--PREMIUM">PREMIUM</span>
                  )}
                </div>
                <div className="book-card__overlay">
                  <p className="book-card__tagline">{ch[taglineKey]}</p>
                  <span className={`book-card__badge ${ch.publicado ? 'book-card__badge--FREE' : 'book-card__badge--PREMIUM'}`}>
                    {ch.publicado ? 'FREE' : 'PREMIUM'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
