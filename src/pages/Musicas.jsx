import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import musicas from '../data/musicas.json'
import lutasDeIlusaoImg from '../assets/images/music/lutas-de-ilusao.png'
import { platformIconMap } from '../components/PlatformIcons'
import './Musicas.css'

const capaMap = { 'lutas-de-ilusao.png': lutasDeIlusaoImg }

export default function Musicas() {
  const { t } = useLanguage()
  const publicadas = musicas.filter(m => m.plataformas.length > 0)

  return (
    <>
      <Helmet><title>Músicas — Lutas de Ilusão</title></Helmet>
      <section className="musicas-hero">
        <div className="container">
          <h1 className="musicas-hero__title">MÚSICAS</h1>
          <p className="musicas-hero__subtitle">{t('musicas.subtitle')}</p>
        </div>
      </section>

      <section className="musicas-faixas">
        <div className="container">
          {publicadas.map(m => {
            const capa = capaMap[m.capa]
            return (
              <div key={m.id} className="musica-card">
                <div className="musica-card__capa" style={capa ? {} : { background: m.cor }}>
                  {capa && <img src={capa} alt={m.titulo} />}
                </div>
                <div className="musica-card__info">
                  <h2 className="musica-card__titulo">{m.titulo}</h2>
                  <p className="musica-card__artista">{m.artista} · 2024</p>
                  <div className="musica-card__plataformas">
                    {m.plataformas.map(p => {
                      const Icon = platformIconMap[p.icone]
                      return (
                        <a
                          key={p.nome}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="musica-card__plataforma"
                          title={p.nome}
                        >
                          {Icon && <Icon />}
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="musicas-clipes">
        <div className="container">
          <h2 className="section-title">Videoclipes</h2>
          <p className="musicas-clipes__placeholder">{t('musicas.clipesPlaceholder')}</p>
        </div>
      </section>
    </>
  )
}
