import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import musicas from '../data/musicas.json'
import lutasDeIlusaoImg from '../assets/images/music/lutas-de-ilusao.png'
import './MusicSection.css'

const capaMap = { 'lutas-de-ilusao.png': lutasDeIlusaoImg }

function MusicCircle({ m }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const hasPlatforms = m.plataformas.length > 0
  const imgSrc = capaMap[m.capa]

  return (
    <div className="music-item">
      <button
        className={`music-circle${!hasPlatforms ? ' music-circle--placeholder' : ''}`}
        style={!imgSrc && !hasPlatforms ? { background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-secondary))' } : {}}
        onClick={() => navigate('/musicas')}
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
    </div>
  )
}

export default function MusicSection() {
  const ref = useScrollReveal()
  const { t } = useLanguage()
  const trackRef = useRef(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const pause = () => { el.style.animationPlayState = 'paused' }
    const resume = () => { el.style.animationPlayState = 'running' }
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    return () => {
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
    }
  }, [])

  const doubled = [...musicas, ...musicas]

  return (
    <section ref={ref} className="music-section reveal">
      <div className="container">
        <h2 className="section-title">{t('music.title')}</h2>
        <div className="music-carousel">
          <div className="music-carousel__track" ref={trackRef}>
            {doubled.map((m, i) => (
              <MusicCircle key={`${m.id}-${i}`} m={m} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
