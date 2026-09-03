import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import musicas from '../../../../data/musicas.json'
import img01 from '../../../../assets/images/music/01.png'
import img02 from '../../../../assets/images/music/02.png'
import img03 from '../../../../assets/images/music/03.png'
import img04 from '../../../../assets/images/music/04.png'
import img05 from '../../../../assets/images/music/05.png'
import img06 from '../../../../assets/images/music/06.png'
import img07 from '../../../../assets/images/music/07.png'
import img08 from '../../../../assets/images/music/08.png'
import img09 from '../../../../assets/images/music/09.png'
import img10 from '../../../../assets/images/music/10.png'
import img11 from '../../../../assets/images/music/11.png'
import img12 from '../../../../assets/images/music/12.png'
import img13 from '../../../../assets/images/music/13.png'
import img14 from '../../../../assets/images/music/14.png'
import img15 from '../../../../assets/images/music/15.png'
import img16 from '../../../../assets/images/music/16.png'
import HomeSectionHeading from './HomeSectionHeading'
import './MusicSection.css'

const allImages = [img01, img02, img03, img04, img05, img06, img07, img08, img09, img10, img11, img12, img13, img14, img15, img16]

function MusicCircle({ m }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const hasPlatforms = m.plataformas.length > 0

  return (
    <div className="music-item">
      <button
        className={`music-circle${!hasPlatforms ? ' music-circle--placeholder' : ''}${!m._img && !hasPlatforms ? ' music-circle--placeholder-bg' : ''}`}
        onClick={() => navigate('/musicas')}
      >
        {m._img ? (
          <img src={m._img} alt={m.titulo} width="300" height="300" loading="lazy" decoding="async" />
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

  const doubled = useMemo(() => {
    const releases = musicas.filter(music => music.publicado !== false).reverse()
    const ordered = releases.map((music, index) => ({ ...music, _img: allImages[index % allImages.length] }))
    return [...ordered, ...ordered]
  }, [])

  return (
    <section className="music-section">
      <div className="container">
        <HomeSectionHeading eyebrow={t('home.section_music_category')} title={t('home.section_music')} />
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
