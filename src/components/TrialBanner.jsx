import { useState, useEffect } from 'react'
import { SITE_CONFIG } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import './TrialBanner.css'

export default function TrialBanner({ hidden }) {
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!SITE_CONFIG.TRIAL_MODE) return null
  if (hidden) return null

  return (
    <div className={`trial-banner${scrolled ? ' scrolled' : ''}`}>
      <p>{t('trial.message')}</p>
    </div>
  )
}
