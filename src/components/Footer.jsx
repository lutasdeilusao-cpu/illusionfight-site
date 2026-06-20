import { useState } from 'react'
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
  'Como funcionamos': '/custos',
  'How it works': '/custos',
  'Cómo funciona': '/custos',
}

const externalMap = {
  'Newsletter': 'https://illusionfight.substack.com/subscribe',
}

export default function Footer({ hidden }) {
  const { t } = useLanguage()
  const [openSections, setOpenSections] = useState(new Set())

  const colKeys = ['footer.columns.0', 'footer.columns.1', 'footer.columns.2']

  const toggleSection = (ci) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(ci)) next.delete(ci); else next.add(ci)
      return next
    })
  }

  if (hidden) return null

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {colKeys.map((colKey, ci) => {
            const links = t(`${colKey}.links`)
            const isOpen = openSections.has(ci)
            return (
              <div key={ci} className="footer__col">
                <button className="footer__heading" onClick={() => toggleSection(ci)} aria-expanded={isOpen}>
                  {t(`${colKey}.title`)}
                  <span className={`footer__chevron${isOpen ? ' footer__chevron--open' : ''}`} />
                </button>
                <div className={`footer__list-wrap${isOpen ? ' footer__list-wrap--open' : ''}`}>
                  <ul className="footer__list">
                    {Array.isArray(links) && links.map((link, i) => {
                      const route = routeMap[link]
                      const external = externalMap[link]
                      return (
                        <li key={i}>
                          {route ? (
                            <Link to={route} onClick={() => setOpenSections(new Set())}>{link}</Link>
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
