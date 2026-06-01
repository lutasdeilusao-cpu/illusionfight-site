import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../context/LanguageContext'
import musicas from '../data/musicas.json'
import lutasDeIlusaoImg from '../assets/images/music/lutas-de-ilusao.png'
import { platformIconMap } from './PlatformIcons'
import './MusicSection.css'

const capaMap = { 'lutas-de-ilusao.png': lutasDeIlusaoImg }

export default function MusicSection() {
  const { t } = useLanguage()
  const [openId, setOpenId] = useState(null)
  const sectionRef = useRef(null)
  const hoverTimer = useRef(null)

  const isTouch = useRef(window.matchMedia('(hover: none)').matches).current

  const close = useCallback(() => setOpenId(null), [])

  const open = useCallback((id) => setOpenId(id), [])

  useEffect(() => {
    if (!openId || isTouch) return
    const handler = (e) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openId, isTouch, close])

  return (
    <section className="music-section" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">{t('music.title')}</h2>
        <div className="music-grid">
          {musicas.map((m) => {
            const hasPlatforms = m.plataformas.length > 0
            const imgSrc = capaMap[m.capa]
            const isOpen = openId === m.id

            const handleMouseEnter = () => {
              if (isTouch || !hasPlatforms) return
              clearTimeout(hoverTimer.current)
              open(m.id)
            }

            const handleMouseLeave = () => {
              if (isTouch) return
              hoverTimer.current = setTimeout(close, 200)
            }

            const handleClick = () => {
              if (!hasPlatforms) return
              if (isTouch) {
                setOpenId(isOpen ? null : m.id)
              }
            }

            const handleDropdownMouseEnter = () => {
              clearTimeout(hoverTimer.current)
            }

            const handleDropdownMouseLeave = () => {
              hoverTimer.current = setTimeout(close, 200)
            }

            return (
              <div key={m.id} className="music-item">
                <button
                  className={`music-circle${!hasPlatforms ? ' music-circle--placeholder' : ''}`}
                  style={!imgSrc && !hasPlatforms ? { background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-secondary))' } : {}}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleClick}
                  disabled={!hasPlatforms}
                >
                  {imgSrc ? (
                    <img src={imgSrc} alt={m.titulo} />
                  ) : (
                    <svg className="music-circle__note" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  )}
                </button>

                <p className="music-title">{m.titulo}</p>
                {!hasPlatforms && <span className="music-item__badge">{t('music.comingSoon')}</span>}

                {hasPlatforms && isOpen && (
                  <div
                    className="platform-dropdown"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    {m.plataformas.map((p) => {
                      const Icon = platformIconMap[p.icone]
                      return (
                        <a
                          key={p.nome}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="platform-item"
                          style={{ '--platform-color': p.cor }}
                        >
                          <span className="platform-item__icon">{Icon ? <Icon /> : null}</span>
                          <span className="platform-item__name">{p.nome}</span>
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
