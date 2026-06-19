import { useLanguage } from '../context/LanguageContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import data from '../data/nowlive.json'
import { platformIconMap } from './PlatformIcons'
import './NowLive.css'

const platRGB = {
  youtube: [255, 0, 0],
  tiktok: [100, 100, 100],
  twitter: [100, 100, 100],
  instagram: [225, 48, 108],
}

export default function NowLive() {
  const ref = useScrollReveal()
  const { t } = useLanguage()
  const items = data.filter(item => item.ativo)

  return (
    <section ref={ref} className="nowlive-section reveal">
      <div className="container">
        <h2 className="section-title">{t('nowlive.title')}</h2>
        <p className="nowlive-subtitle">{t('nowlive.subtitle')}</p>
        <div className="nowlive-grid">
          {items.map(item => {
            const [r, g, b] = platRGB[item.icone] || [100, 100, 100]
            const Icon = platformIconMap[item.icone]
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nowlive-card"
                style={{ '--plat-r': r, '--plat-g': g, '--plat-b': b, '--cor-plat': item.corPlataforma }}
              >
                <div className="nowlive-card-thumb">
                  <div className="nowlive-card-overlay">{t('nowlive.abrir')}</div>
                  {Icon && <span className="nowlive-card-icon"><Icon /></span>}
                </div>
                <div className="nowlive-card-footer">
                  <span className="nowlive-card-label">{item.plataforma}</span>
                  <h3 className="nowlive-card-titulo">{item.titulo}</h3>
                  <p className="nowlive-card-desc">{item.descricao}</p>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}