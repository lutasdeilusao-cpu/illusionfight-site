import { SITE_CONFIG } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import './TrialBanner.css'

export default function TrialBanner() {
  const { t } = useLanguage()
  if (!SITE_CONFIG.TRIAL_MODE) return null

  return (
    <div className="trial-banner">
      <p>{t('trial.message')}</p>
    </div>
  )
}
