import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Prototype.css'

const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

export default function Prototype() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  if (!user) {
    return (
      <section className="prototype-page">
        <div className="prototype-bloqueado">
          <h2>Protótipo</h2>
          <p>Faça login com uma conta admin para acessar.</p>
          <button className="proto-btn proto-btn-primary" onClick={() => navigate('/login')}>Ir para Login</button>
        </div>
      </section>
    )
  }

  if (!isAdmin) {
    return (
      <section className="prototype-page">
        <div className="prototype-bloqueado">
          <h2>Protótipo</h2>
          <p>Acesso restrito a administradores.</p>
          <button className="proto-btn proto-btn-secondary" onClick={() => navigate('/')}>Voltar ao Início</button>
        </div>
      </section>
    )
  }

  return (
    <section className="prototype-page">
      <div className="prototype-header">
        <h2>🧪 RPG System Morto — Protótipo</h2>
        <button className="proto-btn proto-btn-secondary" onClick={() => navigate('/')}>← Voltar</button>
      </div>
      <iframe
        src="/prototype/rpg-morto.html"
        title="RPG System Morto"
        className="prototype-iframe"
      />
    </section>
  )
}
