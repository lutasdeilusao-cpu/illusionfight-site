import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { PROTOTYPE_VERSION } from '../../config/version'
import './Prototype.css'

console.log(`[PROTOTYPE] versão carregada: ${PROTOTYPE_VERSION}`)

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
      <iframe
        src="/prototype/rpg-morto.html"
        title="Protótipo"
        className="prototype-iframe"
      />
    </section>
  )
}
