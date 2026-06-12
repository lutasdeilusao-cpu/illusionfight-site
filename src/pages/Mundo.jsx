import { useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { TRIAL_ACTIVE } from '../config/trial'
import { usePersonagens } from '../hooks/usePersonagens'
import { useScrollReveal } from '../hooks/useScrollReveal'
import CharacterCard from '../components/CharacterCard'
import dataPt from '../data/mundo-pt.json'
import dataEn from '../data/mundo-en.json'
import dataEs from '../data/mundo-es.json'
import './Mundo.css'

const dataMap = { pt: dataPt, en: dataEn, es: dataEs }

const PROTAGONIST_IDS = ['kim', 'jack', 'nina']

export default function Mundo() {
  const { locale, t } = useLanguage()
  const data = dataMap[locale] ?? dataPt
  const navigate = useNavigate()
  const all = usePersonagens()
  const protagonists = all.filter(p => PROTAGONIST_IDS.includes(p.id))
  const trackRef = useRef(null)
  const ref = useScrollReveal()

  const scroll = (dir) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  return (
    <>
      <Helmet>
        <title>{t('helmet.mundo')}</title>
        <meta name="description" content={t('pages.mundo.og_desc')} />
        <meta property="og:title" content={t('pages.mundo.og_title')} />
        <meta property="og:description" content={t('pages.mundo.og_desc')} />
        <meta property="og:url" content="https://illusionfight.com/mundo" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="pt" href="https://illusionfight.com/mundo" />
        <link rel="alternate" hrefLang="en" href="https://illusionfight.com/mundo" />
        <link rel="alternate" hrefLang="es" href="https://illusionfight.com/mundo" />
      </Helmet>

      <section className="mundo-hero">
        <div className="container">
          <h1 className="mundo-hero__title">{t('pages.mundo.titulo')}</h1>
          <p className="mundo-hero__subtitle">{t('pages.mundo.subtitulo')}</p>
        </div>
      </section>

      <section ref={ref} className="mundo-section mundo-section--alt reveal" id="personagens">
        <div className="container">
          <h2 className="section-title">{t('pages.mundo.personagens_titulo')}</h2>
          <div className="mundo-personagens-row">
            {protagonists.map(p => (
              <CharacterCard key={p.id} character={p} />
            ))}
          </div>
          <button className="mundo-ver-todos" onClick={() => navigate('/personagens')}>
            {t('pages.mundo.ver_todos')}
          </button>
        </div>
      </section>

      <section className="mundo-section" id="bravara">
        <div className="container">
          <h2 className="section-title">{t('pages.mundo.bravara')}</h2>
          <div className="mundo-locais-grid">
            {data.localizacoes.map(l => (
              <div key={l.nome} className="mundo-local-card">
                <span className="mundo-local-tag">{l.tag}</span>
                <h4 className="mundo-local-nome">{l.nome}</h4>
                <p className="mundo-local-desc">{l.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mundo-section mundo-section--alt" id="timeline">
        <div className="container">
          <h2 className="section-title">{t('pages.mundo.timeline')}</h2>
          <div className="timeline-wrapper">
            <button className="timeline-arrow timeline-arrow--left" onClick={() => scroll(-1)} aria-label={t('pages.mundo.timeline_prev')}></button>
            <div className="timeline-track" ref={trackRef}>
              {data.timeline.map(p => (
                <div key={p.ano} className={`timeline-point${p.ano === '20XX' ? ' timeline-point--now' : ''}`}>
                  <span className="timeline-titulo">{p.titulo}</span>
                  <span className="timeline-ano">{p.ano}</span>
                  <span className="timeline-texto">{p.texto}</span>
                </div>
              ))}
            </div>
            <button className="timeline-arrow timeline-arrow--right" onClick={() => scroll(1)} aria-label={t('pages.mundo.timeline_next')}></button>
          </div>
        </div>
      </section>

      <section className="mundo-section" id="ldi">
        <div className="container">
          <h2 className="section-title">{t('pages.mundo.ldi')}</h2>

          <div className="mundo-combat-grid">
            {data.modos_combate.map(m => (
              <div key={m.nome} className="mundo-combat-card">
                <span className="mundo-combat-icon">{m.icone}</span>
                <h3 className="mundo-combat-title">{m.nome}</h3>
                <p className="mundo-combat-desc">{m.descricao}</p>
              </div>
            ))}
          </div>

          <div className="mundo-elementais">
            <p className="mundo-text mundo-text--max mundo-text--center">
              {data.elementais.intro}
            </p>
            <div className="mundo-elementais-grid">
              {data.elementais.primarios.map(el => (
                <span key={el} className="mundo-elemental-badge">{el}</span>
              ))}
            </div>
            <div className="mundo-elementais-exemplos">
              {data.elementais.exemplos.map(ex => (
                <div key={ex.personagem} className="mundo-elemental-ex">
                  <strong>{ex.personagem}</strong>
                  <span>{ex.elemental}</span>
                  {ex.nota && <em>{ex.nota}</em>}
                </div>
              ))}
            </div>
          </div>

          <h3 className="mundo-section-subtitle">{t('pages.mundo.ranking_sdr')}</h3>
          <div className="mundo-ranking">
            {data.ranking_sdr.map((r, i) => (
              <div key={r.faixa} className={`mundo-ranking-item mundo-ranking-item--${i + 1}`}>
                <div>
                  <span className="mundo-ranking-faixa">{r.faixa}</span>
                  <span className="mundo-ranking-label">{r.label}</span>
                  <p className="mundo-ranking-desc">{r.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mundo-section mundo-section--alt" id="xakaxi">
        <div className="container">
          <h2 className="section-title">{t('pages.mundo.xakaxi')}</h2>
          <p className="mundo-text mundo-text--max mundo-text--center">
            {data.xakaxi.intro}
          </p>
          <div className="mundo-tech-grid">
            {data.xakaxi.tecnologias.map(t => (
              <div key={t.nome} className="mundo-tech-card">
                <h4 className="mundo-tech-nome">{t.nome}</h4>
                <p className="mundo-tech-desc">{t.descricao}</p>
              </div>
            ))}
          </div>
          {!TRIAL_ACTIVE && (
            <div className="mundo-premium-badge">
              <p>{t('pages.mundo.premium_ritual')}</p>
              <span className="mundo-premium-tag">{t('pages.mundo.premium')}</span>
            </div>
          )}
        </div>
      </section>

      <section className="mundo-section" id="glossario">
        <div className="container">
          <h2 className="section-title">{t('pages.mundo.glossario')}</h2>
          <div className="mundo-glossario-grid">
            {data.glossario.map(g => (
              <div key={g.sigla} className={`mundo-glossario-card${g.premium && !TRIAL_ACTIVE ? ' mundo-glossario-card--premium' : ''}`}>
                <span className="mundo-glossario-sigla">{g.sigla}</span>
                <span className="mundo-glossario-nome">{g.nome}</span>
                <p className="mundo-glossario-desc">{g.descricao}</p>
                {g.premium && <span className="mundo-premium-tag mundo-premium-tag--sm">{t('pages.mundo.premium')}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
