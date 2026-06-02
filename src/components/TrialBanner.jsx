import { useState, useEffect } from 'react'
import { SITE_CONFIG } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { useReader } from '../context/ReaderContext'
import './TrialBanner.css'

export default function TrialBanner() {
  const { readerMode } = useReader()
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!SITE_CONFIG.TRIAL_MODE) return null

  return (
    <div className={`trial-banner${scrolled ? ' scrolled' : ''}`} data-hidden={readerMode}>
      <p>{t('trial.message')}</p>
    </div>
  )
}
