import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import './GuestNotice.css'

export default function GuestNotice() {
  const { t } = useLanguage()
  const { user } = useAuth()

  if (user) return null

  return (
    <div className="guest-notice">
      <span className="guest-notice__text">
        {t('games.gangues.guest_banner')}
      </span>
      <Link to="/cadastro" className="guest-notice__cta">
        {t('games.gangues.guest_create_account')}
      </Link>
    </div>
  )
}
