import { useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import './GuestNotice.css'

// Altura fixa da tira — igual ao padrão da Rádio Nina (--radio-nina-h),
// reservada via CSS var pra quem envolve este componente (ex: .gang-page)
// empurrar o próprio conteúdo pra baixo em vez de deixar a tira flutuar
// por cima do jogo.
const GUEST_NOTICE_H = '30px'

export default function GuestNotice() {
  const { t } = useLanguage()
  const { user } = useAuth()

  useEffect(() => {
    document.documentElement.style.setProperty('--guest-notice-h', user ? '0px' : GUEST_NOTICE_H)
    return () => document.documentElement.style.setProperty('--guest-notice-h', '0px')
  }, [user])

  if (user) return null

  return (
    <div className="guest-notice">
      <span className="guest-notice__dot" aria-hidden="true" />
      <span className="guest-notice__text">{t('games.gangues.guest_banner')}</span>
      <Link to="/cadastro" className="guest-notice__cta">
        {t('games.gangues.guest_create_account')}
      </Link>
    </div>
  )
}
