import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import musicas from '../data/musicas.json'
import lutasDeIlusaoImg from '../assets/images/music/lutas-de-ilusao.png'
import { platformIconMap } from '../components/PlatformIcons'
import './Musicas.css'

const capaMap = { 'lutas-de-ilusao.png': lutasDeIlusaoImg }

export default function Musicas() {
  const { t } = useLanguage()

  return (
    <>
      <Helmet>
        <title>Music — Illusion Fight</title>
        <meta name="description" content="Listen to the Illusion Fight original soundtrack — epic instrumental tracks from the LDI universe. Featuring Sinfonia Imperfeita and more." />
        <meta property="og:title" content="Music — Illusion Fight" />
        <meta property="og:description" content="Listen to the Illusion Fight original soundtrack from the LDI universe." />
        <meta property="og:url" content="https://illusionfight.com/musicas" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hreflang="pt" href="https://illusionfight.com/musicas" />
        <link rel="alternate" hreflang="en" href="https://illusionfight.com/musicas" />
        <link rel="alternate" hreflang="es" href="https://illusionfight.com/musicas" />
      </Helmet>
      <section className="musicas-hero">
        <div className="container">
          <h1 className="musicas-hero__title">{t('pages.musicas.titulo')}</h1>
          <p className="musicas-hero__subtitle">{t('musicas.subtitle')}</p>
        </div>
      </section>

      <section className="musicas-faixas">
        <div className="container">
          {musicas.map(m => {
            const capa = capaMap[m.capa]
            const isPlaceholder = !m.publicado
            const hasRealLinks = m.publicado && m.plataformas.some(p => p.url)
            return (
              <div key={m.id} className={`musica-card${isPlaceholder ? ' musica-card--placeholder' : ''}`}>
                <div className="musica-card__capa" style={capa ? {} : { background: m.cor }}>
                  {capa && <img src={capa} alt={m.titulo} />}
                  {isPlaceholder && <span className="musica-card__coming-soon">{t('pages.musicas.em_breve')}</span>}
                </div>
                <div className="musica-card__info">
                  <h2 className="musica-card__titulo">{m.titulo}</h2>
                  <p className="musica-card__artista">{m.artista} {m.ano ? `· ${m.ano}` : ''}</p>
                  {isPlaceholder ? (
                    <span className="musica-card__badge-placeholder">{t('pages.musicas.em_breve')}</span>
                  ) : (
                    <div className="musica-card__plataformas">
                      {m.plataformas.map(p => {
                        const Icon = platformIconMap[p.icone]
                        const isDisabled = !p.url
                        return (
                          <a
                            key={p.nome}
                            href={p.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`musica-card__plataforma${isDisabled ? ' musica-card__plataforma--disabled' : ''}`}
                            title={p.nome}
                            onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                          >
                            {Icon && <Icon />}
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="musicas-clipes">
        <div className="container">
          <h2 className="section-title">{t('pages.musicas.videoclipes')}</h2>
          <p className="musicas-clipes__placeholder">{t('musicas.clipesPlaceholder')}</p>
        </div>
      </section>
    </>
  )
}
