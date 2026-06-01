import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import index from '../data/livro-index.json'
import './BookChaptersRow.css'

export default function BookChaptersRow() {
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'
  const resumoKey = locale === 'en' ? 'resumo_en' : locale === 'es' ? 'resumo_es' : 'resumo_pt'

  const published = index
    .filter(ch => ch.publicado)
    .sort((a, b) => b.numero - a.numero)

  return (
    <section className="book-chapters-row">
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
                  <p className="book-card__resumo">{ch[resumoKey]}</p>
                </div>
                <div className="book-card__overlay">
                  <div className="book-card__overlay-label">{ch[tituloKey]}</div>
                  <p className="book-card__overlay-resumo">{ch[resumoKey]}</p>
                  <button className="book-card__overlay-btn">LER AGORA</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
