import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import index from '../data/livro-index.json'
import './Livro.css'

export default function Livro() {
  const navigate = useNavigate()
  const { locale } = useLanguage()

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'

  return (
    <section className="livro-page">
      <div className="container">
        <h2 className="section-title">CAPÍTULOS</h2>
        <div className="livro-page__list">
          {index.map(ch => (
            <div key={ch.id} className="livro-page__item">
              <span className="livro-page__numero">CAP. {String(ch.numero).padStart(2, '0')}</span>
              <div className="livro-page__info">
                <span
                  className={`livro-page__titulo${ch.publicado ? '' : ' livro-page__titulo--locked'}`}
                  onClick={() => ch.publicado && navigate(`/livro/${ch.id}`)}
                >
                  {ch[tituloKey]}
                </span>
                <div className="livro-page__meta">
                  {ch.publicado && ch.data_publicacao && (
                    <span className="livro-page__data">{ch.data_publicacao}</span>
                  )}
                  {!ch.publicado && <span className="livro-page__badge">EM BREVE</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
