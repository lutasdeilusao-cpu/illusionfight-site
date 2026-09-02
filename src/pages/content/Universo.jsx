import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import universos from '../../data/universo-index.json'
import './Livro.css'
import './Contos.css'
import './Universo.css'

const docs = import.meta.glob('../../data/universo/**/*.json', { eager: true, import: 'default' })

/* ── inline: **negrito** e *itálico* ── */
function Inline({ children }) {
  const s = String(children || '')
  const parts = s.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g).filter(Boolean)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>
    return <span key={i}>{p}</span>
  })
}

function Tags({ itens }) {
  if (!itens?.length) return null
  return (
    <div className="u-tags">
      {itens.map((t, i) => <span key={i} className="u-tag"><Inline>{t}</Inline></span>)}
    </div>
  )
}

function Corpo({ blocos, t }) {
  return (blocos || []).map((b, i) => <Bloco key={i} b={b} t={t} />)
}

function Bloco({ b, t }) {
  switch (b.t) {
    case 'prose':
      return <p className="u-p"><Inline>{b.texto}</Inline></p>
    case 'sub':
      return <h4 className="u-sub"><Inline>{b.texto}</Inline></h4>
    case 'tags':
      return <Tags itens={b.itens} />
    case 'lista':
      return <ul className="u-lista">{b.itens.map((it, i) => <li key={i}><Inline>{it}</Inline></li>)}</ul>
    case 'quote':
      return (
        <blockquote className="u-quote">
          <p><Inline>{b.texto}</Inline></p>
          {b.cite && <cite>— <Inline>{b.cite}</Inline></cite>}
        </blockquote>
      )
    case 'tabela':
      return (
        <div className="u-tabela-wrap">
          <table className="u-tabela">
            {b.head?.length > 0 && <thead><tr>{b.head.map((h, i) => <th key={i}><Inline>{h}</Inline></th>)}</tr></thead>}
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><Inline>{c}</Inline></td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    case 'box':
      return <div className={`u-box u-box--${b.variant || 'default'}`}><Corpo blocos={b.corpo} t={t} /></div>
    case 'card':
      return (
        <div className={`u-card u-card--${b.variant || 'default'}`}>
          {b.titulo && <h3 className="u-card__titulo"><Inline>{b.titulo}</Inline></h3>}
          <Tags itens={b.tags} />
          <Corpo blocos={b.corpo} t={t} />
        </div>
      )
    case 'callout':
      return (
        <div className={`u-callout u-callout--${b.kind || 'twist'}`}>
          {b.label && <span className="u-callout__label"><Inline>{b.label}</Inline></span>}
          {b.titulo && <h3 className="u-callout__titulo"><Inline>{b.titulo}</Inline></h3>}
          <Corpo blocos={b.corpo} t={t} />
        </div>
      )
    case 'protagonista':
      return (
        <div className="u-protag">
          <span className="u-protag__nome"><Inline>{b.nome}</Inline></span>
          <span className="u-protag__papel"><Inline>{b.papel}</Inline></span>
          <Tags itens={b.tags} />
          <Corpo blocos={b.corpo} t={t} />
        </div>
      )
    case 'timeline':
      return (
        <div className="u-timeline">
          {b.itens.map((it, i) => (
            <div key={i} className="u-tl-item">
              <span className="u-tl-label"><Inline>{it.label}</Inline></span>
              <h3 className="u-tl-titulo"><Inline>{it.titulo}</Inline></h3>
              <Tags itens={it.tags} />
              <Corpo blocos={it.corpo} t={t} />
            </div>
          ))}
        </div>
      )
    case 'personagens':
      return (
        <div className="u-chars">
          {b.itens.map((c, i) => (
            <div key={i} className="u-char">
              <span className="u-char__nome"><Inline>{c.nome}</Inline></span>
              {c.papel && <span className="u-char__papel"><Inline>{c.papel}</Inline></span>}
              {c.desc && <p className="u-char__desc"><Inline>{c.desc}</Inline></p>}
              {c.power && <p className="u-char__linha"><span className="u-char__k">{t('pages.universo.forca')}</span> <Inline>{c.power}</Inline></p>}
              {c.flaw && <p className="u-char__linha u-char__linha--flaw"><span className="u-char__k">{t('pages.universo.falha')}</span> <Inline>{c.flaw}</Inline></p>}
              <Tags itens={c.tags} />
            </div>
          ))}
        </div>
      )
    default:
      return null
  }
}

export default function Universo() {
  const { universo } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()

  const meta = universos.find(x => x.id === universo)
  const u = meta && !meta.externo ? meta : null

  const [aba, setAba] = useState(u?.secoes?.[0]?.id || null)

  const sufT = locale === 'en' ? '_en' : locale === 'es' ? '_es' : ''
  const suf = locale === 'en' ? '_en' : locale === 'es' ? '_es' : '_pt'

  useEffect(() => { setAba(u?.secoes?.[0]?.id || null); window.scrollTo(0, 0) }, [universo])
  useEffect(() => { window.scrollTo(0, 0) }, [aba])

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
  const aviso = u[`aviso${suf}`] || u.aviso_pt
  const soPt = (u.idiomas || ['pt']).length === 1 && (u.idiomas || ['pt'])[0] === 'pt'
  const abaAtiva = u.secoes.find(s => s.id === aba) || u.secoes[0]

  const idiomas = u.idiomas || ['pt']
  const lang = idiomas.includes(locale) ? locale : 'pt'
  const partes = (abaAtiva.partes || [abaAtiva.id])
    .map(pid => docs[`../../data/universo/${u.id}/${lang}/${pid}.json`]
      || docs[`../../data/universo/${u.id}/pt/${pid}.json`])
    .filter(Boolean)

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
                className={`universo-tab${aba === s.id ? ' universo-tab--ativa' : ''}`}
                onClick={() => setAba(s.id)}
              >
                {s[`titulo${sufT}`] || s.titulo}
              </button>
            ))}
          </nav>
        )}

        {aviso && <p className="universo-aviso">⚠ {aviso}</p>}

        {partes.map((p, i) => (
          <section key={i} className="universo-parte">
            <div className="universo-parte__head">
              {p.icone && <span className="universo-parte__icone" aria-hidden="true">{p.icone}</span>}
              <h2 className="universo-parte__titulo">{p.titulo}</h2>
            </div>
            <Corpo blocos={p.blocos} t={t} />
          </section>
        ))}
      </div>
    </section>
  )
}
