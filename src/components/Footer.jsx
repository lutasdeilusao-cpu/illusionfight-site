import { useLanguage } from '../context/LanguageContext'
import SocialBar from './SocialBar'
import './Footer.css'

export default function Footer() {
  const { t } = useLanguage()

  const colKeys = ['footer.columns.0', 'footer.columns.1', 'footer.columns.2']

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {colKeys.map((colKey, ci) => (
            <div key={ci} className="footer__col">
              <h4 className="footer__heading">{t(`${colKey}.title`)}</h4>
              <ul className="footer__list">
                {[0, 1, 2, 3].map(i => (
                  <li key={i}><a href="#">{t(`${colKey}.links.${i}`)}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <SocialBar />

        <div className="footer__bottom">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
