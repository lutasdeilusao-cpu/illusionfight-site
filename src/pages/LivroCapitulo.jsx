import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../context/LanguageContext'
import { useReader } from '../context/ReaderContext'
import { TRIAL_ACTIVE } from '../config/trial'
import { useAchievements } from '../context/AchievementsContext'
import { useEventos } from '../context/EventosContext'
import index from '../data/livro-index.json'
import './LivroCapitulo.css'

const chapterLoaders = import.meta.glob('../data/livro/**/*.md', { query: '?raw', import: 'default' })

export default function LivroCapitulo() {
  const { setReaderMode } = useReader()
  const { id } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { desbloquear } = useAchievements()
  const { registrarEvento } = useEventos()
  const desbloquearRef = useRef(desbloquear)
  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [])

  useEffect(() => { localStorage.setItem('ldi-livro-ultimo', id) }, [id])

  useEffect(() => {
    if (id) registrarEvento('capitulo_lido', `Leu o capítulo ${id}`, Number(id))
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

  const [md, setMd] = useState('')
  const [notFound, setNotFound] = useState(false)

  const chapter = index.find(ch => ch.id === id)
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'

  useEffect(() => {
    if (!chapter || (!chapter.publicado && !TRIAL_ACTIVE)) {
      setNotFound(true)
      return
    }

    const loadChapter = async () => {
      const lang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt'
      const path = `../data/livro/${lang}/${id}.md`
      let loader = chapterLoaders[path]
      // fallback: se não achar no locale atual, tenta PT
      if (!loader) {
        const fallbackPath = `../data/livro/pt/${id}.md`
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
  }, [id, chapter])

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
  const prevPublished = prev?.publicado ? prev : null
  const nextPublished = next?.publicado ? next : null
  const capitulos = index.filter(c => c.publicado)
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

        <div className="livro-capitulo__header">
          <div className="livro-capitulo__header-numero">
            {chapter ? `${t('pages.livro.capitulo')} ${String(chapter.numero).padStart(2, '0')}` : ''}
          </div>
          {chapter && <h1 className="livro-capitulo__header-titulo">{chapter[tituloKey]}</h1>}
        </div>

        <div className="livro-capitulo__content">
          <ReactMarkdown>{md}</ReactMarkdown>
        </div>

        <div className="livro-nav-flutuante">
          {anterior && (
            <Link to={`/livro/${anterior.id}`} className="livro-nav-btn">
              ← {anterior[tituloKey]}
            </Link>
          )}
          {proximo && (
            <Link to={`/livro/${proximo.id}`} className="livro-nav-btn livro-nav-btn--proximo">
              {proximo[tituloKey]} →
            </Link>
          )}
        </div>

        <div className="livro-capitulo__nav">
          {prevPublished ? (
            <button
              className="livro-capitulo__nav-btn"
              onClick={() => navigate(`/livro/${prevPublished.id}`)}
            >
              ← {prevPublished[tituloKey]}
            </button>
          ) : (
            <span className="livro-capitulo__nav-btn livro-capitulo__nav-btn--hidden">←</span>
          )}

          {nextPublished ? (
            <button
              className="livro-capitulo__nav-btn"
              onClick={() => navigate(`/livro/${nextPublished.id}`)}
            >
              {nextPublished[tituloKey]} →
            </button>
          ) : (
            <span className="livro-capitulo__nav-btn livro-capitulo__nav-btn--hidden">→</span>
          )}
        </div>
      </div>
    </section>
  )
}
