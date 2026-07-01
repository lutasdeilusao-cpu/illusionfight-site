import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../../context/LanguageContext'
import { useReader } from '../../context/ReaderContext'
import { useAuth } from '../../context/AuthContext'
import { TRIAL_ACTIVE } from '../../config/trial'
import { estaDisponivel } from '../../config/site'
import { useAchievements } from '../../context/AchievementsContext'
import { useEventos } from '../../context/EventosContext'
import ModalLancamento from '../../components/ModalLancamento/ModalLancamento'
import index from '../../data/livro-index.json'
import './LivroCapitulo.css'

const chapterLoaders = import.meta.glob('../../data/livro/**/*.md', { query: '?raw', import: 'default' })

export default function LivroCapitulo() {
  const { setReaderMode } = useReader()
  const { id } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const { desbloquear } = useAchievements()
  const { registrarEvento } = useEventos()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const desbloquearRef = useRef(desbloquear)
  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [])

  useEffect(() => { localStorage.setItem('ldi-livro-ultimo', id) }, [id])

  useEffect(() => {
    if (id) registrarEvento('capitulo_lido', `Leu o capÃ­tulo ${id}`, Number(id))
  }, [id])

  useEffect(() => {
    const saveScroll = () => localStorage.setItem(`ldi-livro-scroll-${id}`, window.scrollY)
    window.addEventListener('beforeunload', saveScroll)
    return () => { saveScroll(); window.removeEventListener('beforeunload', saveScroll) }
  }, [id])

  useEffect(() => {
    const saved = localStorage.getItem(`ldi-livro-scroll-${id}`)
    if (saved) window.scrollTo(0, parseInt(saved))
  }, [id])

  const FONT_SIZES = [14, 16, 18, 20, 24]
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

  const [md, setMd] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [showSettings, setShowSettings]     = useState(false)
  const [fontSize, setFontSize]             = useState(() => Number(localStorage.getItem('ldi-reader-fontsize')   || 18))
  const [fontFamily, setFontFamily]         = useState(() => localStorage.getItem('ldi-reader-fontfamily')        || 'var(--font-body)')
  const [contentWidth, setContentWidth]     = useState(() => localStorage.getItem('ldi-reader-width')             || '680px')
  const [showModal, setShowModal]           = useState(false)
  const sentinelRef = useRef(null)

  useEffect(() => { localStorage.setItem('ldi-reader-fontsize',   fontSize)     }, [fontSize])
  useEffect(() => { localStorage.setItem('ldi-reader-fontfamily', fontFamily)   }, [fontFamily])
  useEffect(() => { localStorage.setItem('ldi-reader-width',      contentWidth) }, [contentWidth])

  const chapter = index.find(ch => ch.id === id)
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'

  useEffect(() => {
    setNotFound(false)

    if (!chapter || (id !== 'capitulo-01' && !estaDisponivel(chapter, isAdmin) && !TRIAL_ACTIVE)) {
      setNotFound(true)
      return
    }

    const loadChapter = async () => {
      const lang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt'
      const path = `../../data/livro/${lang}/${id}.md`
      let loader = chapterLoaders[path]
      if (!loader) {
        const fallbackPath = `../../data/livro/pt/${id}.md`
        loader = chapterLoaders[fallbackPath]
      }
      if (loader) {
        try {
          const content = await loader()
          setMd(content)
          if (id === 'capitulo-01') desbloquearRef.current('leitor_marelia')
          return
        } catch {}
      }
      setNotFound(true)
    }

    loadChapter()
  }, [id, chapter, isAdmin, locale])

  // Sentinel: dispara modal ao final do capÃ­tulo 1
  useEffect(() => {
    if (id !== 'capitulo-01' || !sentinelRef.current) return
    if (sessionStorage.getItem('ldi-modal-lancamento-visto')) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setShowModal(true)
    }, { threshold: 0.1 })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [id, md])

  if (notFound) {
    return (
      <section className="livro-capitulo">
        <Helmet>
          <title>{t('pages.helmet.capitulo_nao_encontrado')}</title>
        </Helmet>
        <div className="container">
          <p className="livro-capitulo__erro">{t('pages.livro.nao_encontrado')}</p>
        </div>
      </section>
    )
  }

  const idx = index.findIndex(ch => ch.id === id)
  const prev = idx > 0 ? index[idx - 1] : null
  const next = idx < index.length - 1 ? index[idx + 1] : null
  const prevPublished = prev && estaDisponivel(prev, isAdmin) ? prev : null
  const nextPublished = next && estaDisponivel(next, isAdmin) ? next : null
  const capitulos = index.filter(c => c.id === 'capitulo-01' || estaDisponivel(c, isAdmin) || TRIAL_ACTIVE)
  const currentIndex = capitulos.findIndex(c => c.id === id)
  const anterior = capitulos[currentIndex - 1]
  const proximo = capitulos[currentIndex + 1]

  return (
    <section className="livro-capitulo">
      <Helmet>
        <title>{chapter ? `${chapter[tituloKey]} — ${t('site.nome_curto')}` : t('pages.helmet.capitulo_nao_encontrado')}</title>
      </Helmet>
      <div className="container">
        <button className="livro-capitulo__back" onClick={() => navigate('/livro')}>
          {t('pages.livro.voltar_indice')}
        </button>

        <div className="reader-settings-wrap">
          <button
            className="reader-settings-toggle"
            onClick={() => setShowSettings(s => !s)}
            aria-label={t('pages.livro.config_leitura')}
          >
            Aa
          </button>

          {showSettings && (
            <div className="reader-settings-panel">
              {/* Tamanho da fonte */}
              <div className="reader-settings-row">
                <span className="reader-settings-label">{t('pages.livro.fonte')}</span>
                <div className="reader-settings-group">
                  <button
                    className="reader-settings-btn"
                    onClick={() => setFontSize(s => Math.max(14, s - 2))}
                  >
                    Aâˆ’
                  </button>
                  <span className="reader-settings-value">{fontSize}px</span>
                  <button
                    className="reader-settings-btn"
                    onClick={() => setFontSize(s => Math.min(24, s + 2))}
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* FamÃ­lia da fonte */}
              <div className="reader-settings-row">
                <span className="reader-settings-label">{t('pages.livro.tipo')}</span>
                <div className="reader-settings-group">
                  {FONT_FAMILIES.map(f => (
                    <button
                      key={f.value}
                      className={`reader-settings-btn${fontFamily === f.value ? ' reader-settings-btn--active' : ''}`}
                      onClick={() => setFontFamily(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Largura do conteÃºdo */}
              <div className="reader-settings-row">
                <span className="reader-settings-label">{t('pages.livro.largura')}</span>
                <div className="reader-settings-group">
                  {WIDTHS.map(w => (
                    <button
                      key={w.value}
                      className={`reader-settings-btn${contentWidth === w.value ? ' reader-settings-btn--active' : ''}`}
                      onClick={() => setContentWidth(w.value)}
                    >
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
            {chapter ? `${t('pages.livro.capitulo')} ${String(chapter.numero).padStart(2, '0')}` : ''}
          </div>
          {chapter && <h1 className="livro-capitulo__header-titulo">{chapter[tituloKey]}</h1>}
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
          <div ref={sentinelRef} style={{ height: 1 }} />
        </div>

        <ModalLancamento mostrar={showModal} onFechar={() => setShowModal(false)} />

        <div className="livro-nav-flutuante">
          {anterior && (
            <Link to={`/livro/${anterior.id}`} className="livro-nav-btn">
              â† {anterior[tituloKey]}
            </Link>
          )}
          {proximo && (
            <Link to={`/livro/${proximo.id}`} className="livro-nav-btn livro-nav-btn--proximo">
              {proximo[tituloKey]} â†’
            </Link>
          )}
        </div>

        <div className="livro-capitulo__nav">
          {prevPublished ? (
            <button
              className="livro-capitulo__nav-btn"
              onClick={() => navigate(`/livro/${prevPublished.id}`)}
            >
              â† {prevPublished[tituloKey]}
            </button>
          ) : (
            <span className="livro-capitulo__nav-btn livro-capitulo__nav-btn--hidden">â†</span>
          )}

          {nextPublished ? (
            <button
              className="livro-capitulo__nav-btn"
              onClick={() => navigate(`/livro/${nextPublished.id}`)}
            >
              {nextPublished[tituloKey]} â†’
            </button>
          ) : (
            <span className="livro-capitulo__nav-btn livro-capitulo__nav-btn--hidden">â†’</span>
          )}
        </div>
      </div>
    </section>
  )
}
