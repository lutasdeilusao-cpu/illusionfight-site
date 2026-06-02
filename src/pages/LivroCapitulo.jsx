import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../context/LanguageContext'
import { useReader } from '../context/ReaderContext'
import { TRIAL_ACTIVE } from '../config/trial'
import { useAchievements } from '../context/AchievementsContext'
import index from '../data/livro-index.json'
import './LivroCapitulo.css'

const chapterLoaders = import.meta.glob('../data/livro/pt/*.md', { query: '?raw', import: 'default' })

export default function LivroCapitulo() {
  const { setReaderMode } = useReader()
  const { id } = useParams()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const { desbloquear } = useAchievements()

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [])

  useEffect(() => { localStorage.setItem('ldi-livro-ultimo', id) }, [id])

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
      const path = `../data/livro/pt/${id}.md`
      const loader = chapterLoaders[path]
      if (loader) {
        try {
          const content = await loader()
          setMd(content)
          if (id === 'capitulo-01') desbloquear('leitor_marelia')
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
          <title>Capítulo não encontrado — Lutas de Ilusão</title>
        </Helmet>
        <div className="container">
          <p className="livro-capitulo__erro">Este capítulo ainda não foi publicado.</p>
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
        <title>{chapter[tituloKey]} — Lutas de Ilusão</title>
      </Helmet>
      <div className="container">
        <button className="livro-capitulo__back" onClick={() => navigate('/livro')}>
          ← VOLTAR AO ÍNDICE
        </button>

        <div className="livro-capitulo__header">
          <div className="livro-capitulo__header-numero">
            CAPÍTULO {String(chapter.numero).padStart(2, '0')}
          </div>
          <h1 className="livro-capitulo__header-titulo">{chapter[tituloKey]}</h1>
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
