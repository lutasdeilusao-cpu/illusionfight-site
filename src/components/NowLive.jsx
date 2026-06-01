import { useLanguage } from '../context/LanguageContext'
import data from '../data/nowlive.json'
import TwitterEmbed from './TwitterEmbed'
import InstagramEmbed from './InstagramEmbed'
import './NowLive.css'

const icons = {
  youtube: (
    <svg viewBox="0 0 24 24" fill="#FF0000" width="14" height="14">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E4405F" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="#E4405F" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="#E4405F" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="#fff" width="14" height="14">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="#fff" width="14" height="14">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
}

export default function NowLive() {
  const { t } = useLanguage()
  const entries = Object.entries(data).filter(([, v]) => v.ativo)

  return (
    <section className="nowlive-section">
      <div className="container">
        <h2 className="section-title">{t('nowlive.title')}</h2>
        <div className="nowlive-grid">
          {entries.map(([key, item]) => (
            <div key={key} className="nowlive-item">
              <span className="nowlive-label">
                {icons[key]}
                {item.label}
              </span>
              <div className="nowlive-embed">
                {key === 'youtube' && (
                  <iframe src={item.embedUrl} style={{ width: '100%', aspectRatio: '16/9' }} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={item.label} />
                )}
                {key === 'instagram' && (
                  <InstagramEmbed embedUrl={item.embedUrl} />
                )}
                {key === 'tiktok' && (
                  <iframe src={item.embedUrl} width="100%" height="480" frameBorder="0" allow="encrypted-media" title={item.label} />
                )}
                {key === 'twitter' && (
                  <TwitterEmbed tweetUrl={item.tweetUrl} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
