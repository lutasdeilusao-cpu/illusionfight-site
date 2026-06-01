import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import musicas from '../data/musicas.json'
import { platformIconMap } from './PlatformIcons'
import './MusicSection.css'

export default function MusicSection() {
  const { t } = useLanguage()
  const [openId, setOpenId] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    if (!openId) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openId])

  return (
    <section className="music-section" ref={ref}>
      <div className="container">
        <h2 className="section-title">{t('music.title')}</h2>
        <div className="music-grid">
          {musicas.map((m) => {
            const hasPlatforms = m.plataformas.length > 0
            const isOpen = openId === m.id
            return (
              <div key={m.id} className="music-item">
                <button
                  className={`music-circle${!hasPlatforms ? ' music-circle--disabled' : ''}`}
                  style={{ background: m.capa ? `url(${m.capa}) center/cover` : m.cor }}
                  onClick={() => hasPlatforms && setOpenId(isOpen ? null : m.id)}
                  disabled={!hasPlatforms}
                >
                  {!m.capa && (
                    <svg className="music-circle__note" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  )}
                </button>

                <p className="music-item__title">{m.titulo}</p>
                {!hasPlatforms && <span className="music-item__badge">{t('music.comingSoon')}</span>}

                {hasPlatforms && isOpen && (
                  <div className="music-dropdown">
                    {m.plataformas.map((p) => {
                      const Icon = platformIconMap[p.icone]
                      return (
                        <a
                          key={p.nome}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="music-dropdown__item"
                          style={{ '--platform-color': p.cor }}
                          onClick={() => setOpenId(null)}
                        >
                          <span className="music-dropdown__icon">{Icon ? <Icon /> : null}</span>
                          <span className="music-dropdown__name">{p.nome}</span>
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
