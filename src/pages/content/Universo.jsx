import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../../context/LanguageContext'
import { readerMdComponents } from '../../lib/mdComponents'
import universos from '../../data/universo-index.json'
import './Livro.css'
import './Contos.css'
import './Universo.css'

const docs = import.meta.glob('../../data/universo/**/*.md', { query: '?raw', import: 'default' })

export default function Universo() {
  const { universo } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()

  const u = universos.find(x => x.id === universo && !x.externo)
  const [secao, setSecao] = useState(u?.secoes?.[0]?.id || null)
  const [md, setMd] = useState('')

  const sufT = locale === 'en' ? '_en' : locale === 'es' ? '_es' : ''
  const suf = locale === 'en' ? '_en' : locale === 'es' ? '_es' : '_pt'

  useEffect(() => {
    setSecao(u?.secoes?.[0]?.id || null)
  }, [universo])

  useEffect(() => {
    if (!u || !secao) return
    const idiomas = u.idiomas || ['pt']
    const lang = idiomas.includes(locale) ? locale : 'pt'
    const path = `../../data/universo/${u.id}/${lang}/${secao}.md`
    const loader = docs[path] || docs[`../../data/universo/${u.id}/pt/${secao}.md`]
    if (loader) loader().then(setMd).catch(() => setMd(''))
    else setMd('')
    window.scrollTo(0, 0)
  }, [u, secao, locale])

  if (!universo) return <Navigate to="/mundo" replace />
  if (universos.find(x => x.id === universo)?.externo) {
    return <Navigate to={universos.find(x => x.id === universo).rota} replace />
  }
  if (!u) {
    return (
      <section className="livro-page">
        <div className="container">
          <p className="livro-capitulo__erro">{t('pages.obra.nao_encontrado')}</p>
          <button className="livro-capitulo__back" onClick={() => navigate('/mundo')}>
            {t('pages.universo.voltar')}
          </button>
        </div>
      </section>
    )
  }

  const titulo = u[`titulo${sufT}`] || u.titulo
  const subtitulo = u[`subtitulo${suf}`] || u.subtitulo_pt
  const soPt = (u.idiomas || ['pt']).length === 1 && (u.idiomas || ['pt'])[0] === 'pt'

  return (
    <section className="livro-page universo-page">
      <Helmet>
        <title>{titulo} — {t('pages.mundoHub.titulo')} | Illusion Fight</title>
        <meta name="description" content={subtitulo} />
        <meta property="og:title" content={`${titulo} — Illusion Fight`} />
        <meta property="og:description" content={subtitulo} />
        <meta property="og:url" content={`https://illusionfight.com/mundo/${u.id}`} />
      </Helmet>

      <div className="container">
        <nav className="livro-linhas">
          <Link to="/mundo" className="livro-linha">{t('pages.mundoHub.titulo')}</Link>
          <span className="livro-linha livro-linha--ativa">{titulo}</span>
        </nav>

        <header className="universo-hero">
          <h1 className="universo-hero__titulo">{titulo}</h1>
          <p className="universo-hero__sub">{subtitulo}</p>
          {soPt && locale !== 'pt' && (
            <p className="universo-hero__aviso">{t('pages.obra.idioma_unico')}</p>
          )}
        </header>

        {u.secoes.length > 1 && (
          <nav className="universo-tabs">
            {u.secoes.map(s => (
              <button
                key={s.id}
                type="button"
                className={`universo-tab${secao === s.id ? ' universo-tab--ativa' : ''}`}
                onClick={() => setSecao(s.id)}
              >
                {s[`titulo${sufT}`] || s.titulo}
              </button>
            ))}
          </nav>
        )}

        <article className="universo-doc">
          <ReactMarkdown components={readerMdComponents}>{md}</ReactMarkdown>
        </article>
      </div>
    </section>
  )
}
