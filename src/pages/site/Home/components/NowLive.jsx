import { useLanguage } from '../../../../context/LanguageContext'
import data from '../../../../data/nowlive.json'
import { platformIconMap } from '../../../../components/PlatformIcons'
import HomeSectionHeading from './HomeSectionHeading'
import './NowLive.css'

const platRGB = {
  youtube: [255, 0, 0],
  tiktok: [100, 100, 100],
  twitter: [100, 100, 100],
  instagram: [225, 48, 108],
}

export default function NowLive() {
  const { t } = useLanguage()
  const items = data.filter(item => item.ativo)

  return (
    <section className="nowlive-section">
      <div className="container">
        {/* Sem descrição: são quatro links, o título já diz tudo. */}
        <HomeSectionHeading
          eyebrow={t('home.section_social')}
          title={t('home.section_networks')}
        />
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
                aria-label={`${item.plataforma} — ${item.titulo}`}
                style={{ '--plat-r': r, '--plat-g': g, '--plat-b': b }}
              >
                {Icon && <span className="nowlive-card-icon"><Icon /></span>}
                <span className="nowlive-card-label">{item.plataforma}</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
