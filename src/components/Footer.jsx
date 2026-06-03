import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import SocialBar from './SocialBar'
import './Footer.css'

const routeMap = {
  'Apoiar o Projeto': '/assinar',
  'Sobre o Autor': '/autor',
  'Support the Project': '/assinar',
  'About the Author': '/autor',
  'Apoyar el Proyecto': '/assinar',
  'Sobre el Autor': '/autor',
}

const externalMap = {
  'Newsletter': 'https://illusionfight.substack.com/subscribe',
}

export default function Footer({ hidden }) {
  const { t } = useLanguage()

  const colKeys = ['footer.columns.0', 'footer.columns.1', 'footer.columns.2']

  if (hidden) return null

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {colKeys.map((colKey, ci) => {
            const links = t(`${colKey}.links`)
            return (
              <div key={ci} className="footer__col">
                <h4 className="footer__heading">{t(`${colKey}.title`)}</h4>
                <ul className="footer__list">
                  {Array.isArray(links) && links.map((link, i) => {
                    const route = routeMap[link]
                    const external = externalMap[link]
                    return (
                      <li key={i}>
                        {route ? (
                          <Link to={route}>{link}</Link>
                        ) : external ? (
                          <a href={external} target="_blank" rel="noopener noreferrer">{link}</a>
                        ) : (
                          <a href="#">{link}</a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        <SocialBar />

        <div className="footer__bottom">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
