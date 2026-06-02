import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../context/LanguageContext'
import { useReader } from '../context/ReaderContext'
import index from '../data/livro-index.json'
import './LivroCapitulo.css'

const chapterLoaders = import.meta.glob('../data/livro/pt/*.md', { query: '?raw', import: 'default' })

export default function LivroCapitulo() {
  const { setReaderMode } = useReader()
  const { id } = useParams()
  const navigate = useNavigate()
  const { locale } = useLanguage()

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [])
  const [md, setMd] = useState('')
  const [notFound, setNotFound] = useState(false)

  const chapter = index.find(ch => ch.id === id)
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'

  useEffect(() => {
    if (!chapter || !chapter.publicado) {
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
