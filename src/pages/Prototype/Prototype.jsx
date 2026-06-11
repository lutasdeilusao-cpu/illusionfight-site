import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { PROTOTYPE_VERSION } from '../../config/version'
import './Prototype.css'

console.log(`[PROTOTYPE] versão carregada: ${PROTOTYPE_VERSION}`)

const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
const HTML_PATH = '/prototype/rpg-morto.html'
const FILE_NAME = 'rpg-system-morto.html'

export default function Prototype() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  const handleExport = async () => {
    try {
      const res = await fetch(HTML_PATH)
      const html = await res.text()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = FILE_NAME
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed:', e)
    }
  }

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
        <div className="prototype-header-actions">
          <button className="proto-btn proto-btn-export" onClick={handleExport}>⬇ Exportar HTML</button>
          <button className="proto-btn proto-btn-secondary" onClick={() => navigate('/')}>← Voltar</button>
        </div>
      </div>
      <iframe
        src={HTML_PATH}
        title="RPG System Morto"
        className="prototype-iframe"
      />
    </section>
  )
}
