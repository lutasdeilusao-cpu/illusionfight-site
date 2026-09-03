import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { estaDisponivel } from '../../../../config/site.js'
import { useAuth } from '../../../../context/AuthContext'
import livroIndex from '../../../../data/livro-index.json'
import { useLanguage } from '../../../../context/LanguageContext'
import { releaseDateFor, resolveAccessLevel } from '../../../../lib/releaseAccess.js'
import comingSoonImg from '../../../../assets/images/ComingSoon.png'
import HomeSectionHeading from './HomeSectionHeading'
import './BookChaptersRow.css'

const coverModules = import.meta.glob('../../../../assets/images/livro/capitulo-*', {
  eager: true,
  import: 'default',
  query: '?url',
})
const coverMap = Object.fromEntries(Object.entries(coverModules).map(([path, url]) => [
  path.split('/').pop().replace(/\.[^.]+$/, ''),
  url,
]))

function formatarData(dataStr) {
  if (!dataStr) return ''
  const [a, m, d] = dataStr.split('-')
  return `${d}/${m}/${a}`
}

export default function BookChaptersRow() {
  const { t, locale } = useLanguage()
  const { user, perfil } = useAuth()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const scrollRef = useRef(null)
  const level = resolveAccessLevel(user, perfil)
  const isAvailable = chapter => chapter.id === 'capitulo-01' || estaDisponivel(chapter, isAdmin, { user, perfil })
  const available = livroIndex.filter(isAvailable).sort((a, b) => b.numero - a.numero)
  const upcoming = livroIndex.filter(chapter => !isAvailable(chapter)).sort((a, b) => (
    releaseDateFor(a, level) || '').localeCompare(releaseDateFor(b, level) || '')
  )
  const capitulos = [...available, ...upcoming].slice(0, 6)
  const titleKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'
  const taglineKey = locale === 'en' ? 'tagline_en' : locale === 'es' ? 'tagline_es' : 'tagline_pt'

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -640, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 640, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') scrollRef.current?.scrollBy({ left: -640, behavior: 'smooth' })
      if (e.key === 'ArrowRight') scrollRef.current?.scrollBy({ left: 640, behavior: 'smooth' })
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <section className="book-chapters-section">
      <div className="container">
        <HomeSectionHeading eyebrow={t('home.section_stories')} title={t('home.section_chapters')} />
      </div>
      <div className="book-chapters-wrapper">
        <button className="book-chapters-arrow book-chapters-arrow--left" onClick={scrollLeft} aria-label={t('home.previous')}>‹</button>
        <div className="book-chapters-scroll" ref={scrollRef}>
          {capitulos.map(cap => {
            const liberado = isAvailable(cap)
            const cover = coverMap[cap.id]
            const releaseDate = releaseDateFor(cap, level)
            const Wrapper = liberado ? Link : 'div'
            const wrapperProps = liberado ? { to: `/historias/lutas-de-ilusao/${cap.id}` } : {}
            return (
              <Wrapper
                key={cap.id}
                className="book-chapter-card"
                {...wrapperProps}
              >
                <div className="book-chapter-card__inner">
                  <img
                    className="book-chapter-card__image"
                    src={liberado && cover ? cover : comingSoonImg}
                    alt=""
                    width={liberado && cover ? 204 : 768}
                    height={liberado && cover ? 284 : 1344}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="book-chapter-card__overlay">
                    <p className="book-chapter-card__tagline">{cap[taglineKey]}</p>
                  </div>
                </div>
                <div className="book-chapter-card__footer">
                  <span className="book-chapter-card__titulo">{cap[titleKey]}</span>
                  {!liberado && (
                    <span className="book-chapter-card__badge">
                      {releaseDate ? `${t('pages.livro.em_breve')} ${formatarData(releaseDate)}` : t('pages.livro.em_breve')}
                    </span>
                  )}
                </div>
              </Wrapper>
            )
          })}
        </div>
        <button className="book-chapters-arrow book-chapters-arrow--right" onClick={scrollRight} aria-label={t('home.next')}>›</button>
      </div>
    </section>
  )
}
