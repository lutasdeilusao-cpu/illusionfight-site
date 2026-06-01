import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import './Autor.css'

export default function Autor() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>Autor — Lutas de Ilusão</title>
      </Helmet>
      <section className="autor">
        <div className="container">
          <h1 className="autor__byline">
            <span className="autor__byline-prefix">BY:</span>
            <span className="autor__byline-name">ISAIAS LEAL</span>
          </h1>

          <div className="autor__blocks">
            {[0, 1, 2, 3].map(i => (
              <p key={i} className="autor__block">{t(`autor.blocks.${i}`)}</p>
            ))}
          </div>

          <button className="autor__cta" onClick={() => navigate('/assinar')}>
            {t('autor.cta')}
          </button>
        </div>
      </section>
    </>
  )
}
