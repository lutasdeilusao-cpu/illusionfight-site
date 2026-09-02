import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { parseUniverso } from '../../lib/parseUniverso'
import universos from '../../data/universo-index.json'
import './Livro.css'
import './Contos.css'
import './Universo.css'

const docs = import.meta.glob('../../data/universo/**/*.md', { query: '?raw', import: 'default' })

function Verbete({ v, aberto, onToggle, t }) {
  return (
    <div className={`uverb${aberto ? ' uverb--aberto' : ''}`}>
      <button type="button" className="uverb__head" onClick={onToggle} aria-expanded={aberto}>
        <span className="uverb__nome">{v.nome}</span>
        <span className="uverb__chevron" aria-hidden="true" />
      </button>

      {v.chips.length > 0 && (
        <div className="uverb__chips">
          {v.chips.map(([k, val], i) => (
            <span key={i} className="uverb__chip">
              <span className="uverb__chip-k">{k}</span>
              <span className="uverb__chip-v">{val}</span>
            </span>
          ))}
        </div>
      )}

      {!aberto && v.teaser && <p className="uverb__teaser">{v.teaser}</p>}

      {aberto && (
        <div className="uverb__body">
          {v.corpo.map((c, i) => {
            if (c.tipo === 'sub') return <p key={i} className="uverb__sub">{c.texto}</p>
            if (c.rotulo) return <p key={i}><span className="uverb__rotulo">{c.rotulo}</span> {c.texto}</p>
            return <p key={i}>{c.texto}</p>
          })}
          <button type="button" className="uverb__fechar" onClick={onToggle}>{t('pages.universo.recolher')}</button>
        </div>
      )}
    </div>
  )
}

export default function Universo() {
  const { universo } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()

  const meta = universos.find(x => x.id === universo)
  const u = meta && !meta.externo ? meta : null

  const [secao, setSecao] = useState(u?.secoes?.[0]?.id || null)
  const [raw, setRaw] = useState('')
  const [abertos, setAbertos] = useState(() => new Set())

  const sufT = locale === 'en' ? '_en' : locale === 'es' ? '_es' : ''
  const suf = locale === 'en' ? '_en' : locale === 'es' ? '_es' : '_pt'

  useEffect(() => { setSecao(u?.secoes?.[0]?.id || null) }, [universo])

  useEffect(() => {
    if (!u || !secao) return
    const idiomas = u.idiomas || ['pt']
    const lang = idiomas.includes(locale) ? locale : 'pt'
    const path = `../../data/universo/${u.id}/${lang}/${secao}.md`
    const loader = docs[path] || docs[`../../data/universo/${u.id}/pt/${secao}.md`]
    if (loader) loader().then(setRaw).catch(() => setRaw(''))
    else setRaw('')
    window.scrollTo(0, 0)
  }, [u, secao, locale])

  const parsed = useMemo(() => parseUniverso(raw), [raw])

  useEffect(() => {
    const first = parsed.grupos.find(g => g.entradas.length)?.entradas[0]?.id
    setAbertos(first ? new Set([first]) : new Set())
  }, [parsed])

  const toggle = (id) => setAbertos(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  if (!universo) return <Navigate to="/mundo" replace />
  if (meta?.externo) return <Navigate to={meta.rota} replace />
  if (!u) {
    return (
      <section className="livro-page">
        <div className="container">
          <p className="livro-capitulo__erro">{t('pages.obra.nao_encontrado')}</p>
          <button className="livro-capitulo__back" onClick={() => navigate('/mundo')}>{t('pages.universo.voltar')}</button>
        </div>
      </section>
    )
  }

  const titulo = u[`titulo${sufT}`] || u.titulo
  const subtitulo = u[`subtitulo${suf}`] || u.subtitulo_pt
  const soPt = (u.idiomas || ['pt']).length === 1 && (u.idiomas || ['pt'])[0] === 'pt'
  const totalVerbetes = parsed.grupos.reduce((a, g) => a + g.entradas.length, 0)

  return (
    <section className="universo-page" data-tema={u.id}>
      <Helmet>
        <title>{titulo} — {t('pages.mundoHub.titulo')} | Illusion Fight</title>
        <meta name="description" content={subtitulo} />
        <meta property="og:title" content={`${titulo} — Illusion Fight`} />
        <meta property="og:description" content={subtitulo} />
        <meta property="og:url" content={`https://illusionfight.com/mundo/${u.id}`} />
      </Helmet>

      <header className="universo-hero">
        <div className="universo-hero__fx" aria-hidden="true" />
        <div className="container">
          <nav className="universo-crumbs">
            <Link to="/mundo">{t('pages.mundoHub.titulo')}</Link>
            <span>·</span>
            <span>{titulo}</span>
          </nav>
          <h1 className="universo-hero__titulo">{titulo}</h1>
          <p className="universo-hero__sub">{subtitulo}</p>
          {totalVerbetes > 0 && (
            <p className="universo-hero__count">
              {t('pages.universo.verbetes').replace('{n}', totalVerbetes)}
            </p>
          )}
          {soPt && locale !== 'pt' && <p className="universo-hero__aviso">{t('pages.obra.idioma_unico')}</p>}
        </div>
      </header>

      <div className="container universo-body">
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

        {parsed.intro.length > 0 && (
          <div className="universo-intro">
            {parsed.intro.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}

        {parsed.grupos.map((g, gi) => (
          <section key={gi} className="universo-grupo">
            {g.titulo && (
              <div className="universo-grupo__head">
                <h2 className="universo-grupo__titulo">{g.titulo}</h2>
                {g.entradas.length > 0 && <span className="universo-grupo__badge">{g.entradas.length}</span>}
              </div>
            )}
            {g.intro.map((p, i) => <p key={i} className="universo-grupo__intro">{p}</p>)}
            {g.entradas.length > 0 && (
              <div className="universo-entradas">
                {g.entradas.map(v => (
                  <Verbete key={v.id} v={v} aberto={abertos.has(v.id)} onToggle={() => toggle(v.id)} t={t} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  )
}
