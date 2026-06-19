import { MORTO_VERSION } from '../../config/version'
console.log(`[MORTO] versão carregada: ${MORTO_VERSION}`)

import { useLanguage } from '../../context/LanguageContext'
import { Helmet } from 'react-helmet-async'
import BackToGamesBtn from '../../components/BackToGamesBtn/BackToGamesBtn'
import './Morto.css'

export default function Morto() {
  const { t } = useLanguage()

  return (
    <section className="morto-page">
      <Helmet>
        <title>{t('games.morto.meta_title')} — Illusion Fight</title>
        <meta name="description" content={t('games.morto.meta_desc')} />
      </Helmet>

      <div className="morto-header">
        <BackToGamesBtn />
        <h1 className="morto-title">{t('games.morto.titulo')}</h1>
        <p className="morto-subtitle">{t('games.morto.subtitulo')}</p>
      </div>

      <div className="morto-iframe-wrapper">
        <iframe
          src="/prototype/rpg-morto.html"
          title={t('games.morto.titulo')}
          className="morto-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </section>
  )
}
