import { useLanguage } from '../context/LanguageContext'
import './MusicSection.css'

const SPOTIFY_URL = 'https://open.spotify.com/artist/29DpyoO8XusblZ26OH7Qbn'

export default function MusicSection() {
  const { t } = useLanguage()

  return (
    <section className="music">
      <div className="container">
        <div className="music__inner">
          <svg className="music__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="22" fill="#1DB954" />
            <path d="M34 20.5c-5-2.5-13-2.7-17.7-1.5a1.5 1.5 0 0 1-.8-2.9c5.4-1.4 14.2-1.2 19.8 1.6a1.5 1.5 0 0 1-1.3 2.8zM33 25.2c-4.2-2.1-10.7-2.3-14.6-1a1.3 1.3 0 0 1-.8-2.4c4.6-1.5 11.9-1.3 16.7 1.1a1.3 1.3 0 1 1-1.3 2.3zM31.8 29.9c-3.5-1.7-8.9-1.8-12.2-.8a1 1 0 1 1-.6-2c3.8-1 9.6-1 13.5 1a1 1 0 1 1-.7 1.8z" fill="#fff" />
          </svg>
          <p className="music__title">{t('music.title')}</p>
          <a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--spotify"
          >
            {t('music.cta')}
          </a>
        </div>
      </div>
    </section>
  )
}
