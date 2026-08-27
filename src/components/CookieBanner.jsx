import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { trackEvent, updateAnalyticsConsent } from '../lib/analytics'
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
    updateAnalyticsConsent(true)
    trackEvent('analytics_consent_granted', { consent_source: 'cookie_banner' })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        {t('cookie.text')}
      </p>
      <button className="cookie-banner-btn" data-analytics-id="cookie_accept" onClick={handleAccept}>
        {t('cookie.accept')}
      </button>
    </div>
  )
}
