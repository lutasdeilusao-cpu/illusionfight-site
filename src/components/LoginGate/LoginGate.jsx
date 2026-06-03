import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LoginGate.css'

export default function LoginGate({ feature, children }) {
  const { user } = useAuth()
  if (user) return children
  return (
    <div className="login-gate">
      <div className="login-gate-icon">🔒</div>
      <p className="login-gate-text">Para acessar {feature} você precisa ter uma conta.</p>
      <Link to="/cadastro" className="login-gate-btn">CRIAR CONTA GRÁTIS</Link>
      <Link to="/login" className="login-gate-link">Já tenho conta — entrar</Link>
    </div>
  )
}
