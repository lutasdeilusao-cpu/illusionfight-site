import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAchievements } from '../context/AchievementsContext'
import todosAchievements from '../data/achievements-pt.json'
import './Perfil.css'

export default function Perfil() {
  const navigate = useNavigate()
  const { user, perfil, logout, carregando } = useAuth()
  const { desbloqueados } = useAchievements()

  if (carregando) return <section className="perfil-page"><p className="perfil-carregando">Carregando...</p></section>
  if (!user) { navigate('/login'); return null }

  return (
    <section className="perfil-page">
      <div className="perfil-header">
        <div className="perfil-avatar">{perfil?.nome?.[0]?.toUpperCase() || '...'}</div>
        <h1 className="perfil-nome">{perfil?.nome || '...'}</h1>
        <p className="perfil-email">{user.email}</p>
      </div>

      <h2 className="perfil-section-title">ACHIEVEMENTS</h2>
      <div className="perfil-achievements">
        {todosAchievements.map(a => {
          const desbloqueado = desbloqueados.includes(a.id)
          const secretoNaoVisto = a.secreto && !desbloqueado
          return (
            <div
              key={a.id}
              className={`perfil-achievement-card${desbloqueado ? '' : ' perfil-achievement-card--locked'}`}
            >
              <span className="perfil-achievement-icone">
                {secretoNaoVisto ? '🔒' : a.icone}
              </span>
              <span className="perfil-achievement-nome">
                {secretoNaoVisto ? '???' : a.nome}
              </span>
              <span className="perfil-achievement-desc">
                {secretoNaoVisto ? 'Achievement secreto' : a.descricao}
              </span>
            </div>
          )
        })}
      </div>

      <button className="perfil-logout" onClick={logout}>SAIR</button>
    </section>
  )
}
