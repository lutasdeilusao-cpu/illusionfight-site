import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../../context/LanguageContext'
import { useReader } from '../../context/ReaderContext'
import { useAuth } from '../../context/AuthContext'
import { TRIAL_ACTIVE } from '../../config/trial'
import { estaDisponivel } from '../../config/site'
import index from '../../data/contos-index.json'
import './LivroCapitulo.css'
import './Contos.css'

const contoLoaders = import.meta.glob('../../data/livro/contos/**/*.md', { query: '?raw', import: 'default' })

export default function ContoCapitulo() {
  const { setReaderMode } = useReader()
  const { historia, cap } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [])

  useEffect(() => {
    if (historia && cap) localStorage.setItem('ldi-conto-ultimo', `${historia}/${cap}`)
  }, [historia, cap])

  const [md, setMd] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize]         = useState(() => Number(localStorage.getItem('ldi-reader-fontsize') || 18))
  const [fontFamily, setFontFamily]     = useState(() => localStorage.getItem('ldi-reader-fontfamily') || 'var(--font-body)')
  const [contentWidth, setContentWidth] = useState(() => localStorage.getItem('ldi-reader-width') || '680px')

  useEffect(() => { localStorage.setItem('ldi-reader-fontsize',   fontSize)     }, [fontSize])
  useEffect(() => { localStorage.setItem('ldi-reader-fontfamily', fontFamily)   }, [fontFamily])
  useEffect(() => { localStorage.setItem('ldi-reader-width',      contentWidth) }, [contentWidth])

  const FONT_FAMILIES = [
    { label: t('pages.livro.padrao'), value: 'var(--font-body)' },
    { label: t('pages.livro.serif'),  value: 'Georgia, serif' },
    { label: t('pages.livro.sans'),   value: 'Inter, sans-serif' },
    { label: t('pages.livro.mono'),   value: 'var(--font-mono)' },
  ]
  const WIDTHS = [
    { label: t('pages.livro.estreito'), value: '520px' },
    { label: t('pages.livro.medio'),    value: '680px' },
    { label: t('pages.livro.largo'),    value: '860px' },
  ]

  const h = index.find(x => x.id === historia)
  const capitulo = h?.capitulos.find(c => c.id === cap)
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'

  useEffect(() => {
    setNotFound(false)
    if (!h || !capitulo || (!estaDisponivel(capitulo, isAdmin) && !TRIAL_ACTIVE)) {
      setNotFound(true)
      return
    }
    const load = async () => {
      const lang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt'
      const path = `../../data/livro/contos/${lang}/${historia}/${cap}.md`
      const loader = contoLoaders[path] || contoLoaders[`../../data/livro/contos/pt/${historia}/${cap}.md`]
      if (loader) {
        try { setMd(await loader()); return } catch { /* fallthrough */ }
      }
      setNotFound(true)
    }
    load()
  }, [historia, cap, h, capitulo, isAdmin, locale])

  if (notFound) {
    return (
      <section className="livro-capitulo">
        <Helmet><title>{t('pages.helmet.capitulo_nao_encontrado')}</title></Helmet>
        <div className="container">
          <p className="livro-capitulo__erro">{t('pages.livro.nao_encontrado')}</p>
          <button className="livro-capitulo__back" onClick={() => navigate(`/livro/contos/${historia || ''}`)}>
            {t('pages.livro.voltar_indice')}
          </button>
        </div>
      </section>
    )
  }

  const disponiveis = h.capitulos.filter(c => estaDisponivel(c, isAdmin) || TRIAL_ACTIVE)
  const cur = disponiveis.findIndex(c => c.id === cap)
  const anterior = disponiveis[cur - 1]
  const proximo = disponiveis[cur + 1]

  return (
    <section className="livro-capitulo">
      <Helmet>
        <title>{capitulo ? `${capitulo[tituloKey]} — ${h[tituloKey]}` : t('pages.helmet.capitulo_nao_encontrado')}</title>
      </Helmet>
      <div className="container">
        <nav className="livro-linhas livro-linhas--reader">
          <Link to="/livro" className="livro-linha">{t('pages.contos.linha_principal')}</Link>
          <Link to="/livro/contos" className="livro-linha">{t('pages.contos.linha_contos')}</Link>
        </nav>

        <button className="livro-capitulo__back" onClick={() => navigate(`/livro/contos/${historia}`)}>
          {t('pages.livro.voltar_indice')}
        </button>

        <div className="reader-settings-wrap">
          <button className="reader-settings-toggle" onClick={() => setShowSettings(s => !s)} aria-label={t('pages.livro.config_leitura')}>
            Aa
          </button>
          {showSettings && (
            <div className="reader-settings-panel">
              <div className="reader-settings-row">
                <span className="reader-settings-label">{t('pages.livro.fonte')}</span>
                <div className="reader-settings-group">
                  <button className="reader-settings-btn" onClick={() => setFontSize(s => Math.max(14, s - 2))}>A−</button>
                  <span className="reader-settings-value">{fontSize}px</span>
                  <button className="reader-settings-btn" onClick={() => setFontSize(s => Math.min(24, s + 2))}>A+</button>
                </div>
              </div>
              <div className="reader-settings-row">
                <span className="reader-settings-label">{t('pages.livro.tipo')}</span>
                <div className="reader-settings-group">
                  {FONT_FAMILIES.map(f => (
                    <button key={f.value} className={`reader-settings-btn${fontFamily === f.value ? ' reader-settings-btn--active' : ''}`} onClick={() => setFontFamily(f.value)}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="reader-settings-row">
                <span className="reader-settings-label">{t('pages.livro.largura')}</span>
                <div className="reader-settings-group">
                  {WIDTHS.map(w => (
                    <button key={w.value} className={`reader-settings-btn${contentWidth === w.value ? ' reader-settings-btn--active' : ''}`} onClick={() => setContentWidth(w.value)}>
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="livro-capitulo__header">
          <div className="livro-capitulo__header-numero">
            {h[tituloKey]} · {t('pages.contos.cap')} {String(capitulo?.numero || 1).padStart(2, '0')}
          </div>
          {capitulo && <h1 className="livro-capitulo__header-titulo">{capitulo[tituloKey]}</h1>}
        </div>

        <div
          className="livro-capitulo__content"
          style={{
            '--reader-font-size': `${fontSize}px`,
            '--reader-font-family': fontFamily,
            '--reader-max-width': contentWidth,
          }}
        >
          <ReactMarkdown>{md}</ReactMarkdown>
        </div>

        <div className="livro-capitulo__nav">
          {anterior ? (
            <button className="livro-capitulo__nav-btn" onClick={() => navigate(`/livro/contos/${historia}/${anterior.id}`)}>
              ← {anterior[tituloKey]}
            </button>
          ) : (
            <span className="livro-capitulo__nav-btn livro-capitulo__nav-btn--hidden">←</span>
          )}
          {proximo ? (
            <button className="livro-capitulo__nav-btn" onClick={() => navigate(`/livro/contos/${historia}/${proximo.id}`)}>
              {proximo[tituloKey]} →
            </button>
          ) : (
            <span className="livro-capitulo__nav-btn livro-capitulo__nav-btn--hidden">→</span>
          )}
        </div>
      </div>
    </section>
  )
}
