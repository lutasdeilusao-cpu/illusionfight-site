import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../../context/LanguageContext'
import musicas from '../../data/musicas.json'
import { platformIconMap } from '../../components/PlatformIcons'
import img01 from '../../assets/images/music/01.png'
import img02 from '../../assets/images/music/02.png'
import img03 from '../../assets/images/music/03.png'
import img04 from '../../assets/images/music/04.png'
import img05 from '../../assets/images/music/05.png'
import img06 from '../../assets/images/music/06.png'
import img07 from '../../assets/images/music/07.png'
import img08 from '../../assets/images/music/08.png'
import img09 from '../../assets/images/music/09.png'
import img10 from '../../assets/images/music/10.png'
import img11 from '../../assets/images/music/11.png'
import img12 from '../../assets/images/music/12.png'
import img13 from '../../assets/images/music/13.png'
import img14 from '../../assets/images/music/14.png'
import img15 from '../../assets/images/music/15.png'
import img16 from '../../assets/images/music/16.png'
import './Musicas.css'

const allImages = [img01, img02, img03, img04, img05, img06, img07, img08, img09, img10, img11, img12, img13, img14, img15, img16]

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Musicas() {
  const { t } = useLanguage()
  const shuffled = useMemo(() => shuffleArray(musicas), [])
  const randomImages = useMemo(() => shuffleArray(allImages), [])

  return (
    <>
      <Helmet>
        <title>Music â€” Illusion Fight</title>
        <meta name="description" content="Listen to the Illusion Fight original soundtrack â€” epic instrumental tracks from the LDI universe. Featuring Sinfonia Imperfeita and more." />
        <meta property="og:title" content="Music â€” Illusion Fight" />
        <meta property="og:description" content="Listen to the Illusion Fight original soundtrack from the LDI universe." />
        <meta property="og:url" content="https://illusionfight.com/musicas" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="pt" href="https://illusionfight.com/musicas" />
        <link rel="alternate" hrefLang="en" href="https://illusionfight.com/musicas" />
        <link rel="alternate" hrefLang="es" href="https://illusionfight.com/musicas" />
      </Helmet>
      <section className="musicas-hero">
        <div className="container">
          <h1 className="musicas-hero__title">{t('pages.musicas.titulo')}</h1>
          <p className="musicas-hero__subtitle">{t('musicas.subtitle')}</p>
        </div>
      </section>

      <section className="musicas-faixas">
        <div className="container">
          {shuffled.map((m, i) => {
            const capa = randomImages[i % randomImages.length]
            const isPlaceholder = !m.publicado
            const hasRealLinks = m.publicado && m.plataformas.some(p => p.url)
            return (
              <div key={`${m.id}-${i}`} className={`musica-card${isPlaceholder ? ' musica-card--placeholder' : ''}`}>
                <div className="musica-card__capa">
                  {capa && <img src={capa} alt={m.titulo} />}
                  {isPlaceholder && <span className="musica-card__coming-soon">{t('pages.musicas.em_breve')}</span>}
                </div>
                <div className="musica-card__info">
                  <h2 className="musica-card__titulo">{m.titulo}</h2>
                  <p className="musica-card__artista">{m.artista} {m.ano ? `Â· ${m.ano}` : ''}</p>
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
