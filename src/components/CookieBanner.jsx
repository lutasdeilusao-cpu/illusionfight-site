import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './CookieBanner.css'

export default function CookieBanner() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('ldi-cookies-accepted')
    if (!accepted) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('ldi-cookies-accepted', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        {t('cookie.text')}
      </p>
      <button className="cookie-banner-btn" onClick={handleAccept}>
        {t('cookie.accept')}
      </button>
    </div>
  )
}
