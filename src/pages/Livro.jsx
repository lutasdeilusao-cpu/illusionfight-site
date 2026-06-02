import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { TRIAL_ACTIVE } from '../config/trial'
import index from '../data/livro-index.json'
import './Livro.css'

export default function Livro() {
  const [ultimo, setUltimo] = useState(null)
  const navigate = useNavigate()
  const { locale } = useLanguage()

  useEffect(() => {
    setUltimo(localStorage.getItem('ldi-livro-ultimo'))
  }, [])

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'

  return (
    <section className="livro-page">
      <Helmet>
        <title>Livro — Lutas de Ilusão</title>
      </Helmet>
      <div className="container">
        {ultimo && (
          <Link to={`/livro/${ultimo}`} className="livro-continuar">
            → Continuar lendo
          </Link>
        )}
        <h2 className="section-title">CAPÍTULOS</h2>
        <div className="livro-page__list">
          {index.map(ch => {
            const liberado = ch.publicado || TRIAL_ACTIVE
            return (
              <div key={ch.id} className="livro-page__item">
                <span className="livro-page__numero">CAP. {String(ch.numero).padStart(2, '0')}</span>
                <div className="livro-page__info">
                  <span
                    className={`livro-page__titulo${liberado ? '' : ' livro-page__titulo--locked'}`}
                    onClick={() => liberado && navigate(`/livro/${ch.id}`)}
                  >
                    {ch[tituloKey]}
                  </span>
                  <div className="livro-page__meta">
                    {liberado && ch.data_publicacao && (
                      <span className="livro-page__data">{ch.data_publicacao}</span>
                    )}
                    {!ch.publicado && TRIAL_ACTIVE && <span className="livro-page__badge livro-page__badge--premium">PREMIUM</span>}
                    {!liberado && <span className="livro-page__badge">EM BREVE</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
