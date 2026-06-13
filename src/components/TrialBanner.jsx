import { useState, useEffect } from 'react'
import { BETA_ACTIVE } from '../config/trial'
import { LAUNCH_DATE, ADMIN_EMAILS } from '../config/launch'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import './TrialBanner.css'

export default function TrialBanner({ hidden }) {
  const { t } = useLanguage()
  const { user, perfil } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!BETA_ACTIVE) return null
  if (hidden) return null
  if (isAdmin) return null

  return (
    <div className={`trial-banner${scrolled ? ' scrolled' : ''}`}>
      <p className="trial-banner__text">
        {t('beta.message', { date: LAUNCH_DATE })}
      </p>
      <a
        href="mailto:contato@illusionfight.com"
        className="trial-banner__cta"
      >
        {t('beta.cta')}
      </a>
    </div>
  )
}
