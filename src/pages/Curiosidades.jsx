import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import './Curiosidades.css'

export default function Curiosidades() {
  const { t } = useLanguage()

  return (
    <>
      <Helmet><title>Curiosidades — Lutas de Ilusão</title></Helmet>
      <section className="curiosidades-hero">
        <div className="container">
          <h1 className="curiosidades-hero__title">{t('curiosidades.title')}</h1>
          <p className="curiosidades-hero__subtitle">{t('curiosidades.subtitle')}</p>
        </div>
      </section>
    </>
  )
}
