import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import './LoginGate.css'

export default function LoginGate({ feature, children }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  if (user) return children
  return (
    <div className="login-gate">
      <div className="login-gate-icon">🔒</div>
      <p className="login-gate-text">{t('login_gate.texto', { feature })}</p>
      <Link to="/cadastro" className="login-gate-btn">{t('login_gate.criar')}</Link>
      <Link to="/login" className="login-gate-link">{t('login_gate.entrar')}</Link>
    </div>
  )
}
