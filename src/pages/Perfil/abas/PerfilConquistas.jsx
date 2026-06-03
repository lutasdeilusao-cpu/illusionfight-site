import { useAchievements } from '../../../context/AchievementsContext'
import todosAchievements from '../../../data/achievements-pt.json'

export default function PerfilConquistas() {
  const { desbloqueados } = useAchievements()
  return (
    <div className="perfil-achievements">
      {todosAchievements.map(a => {
        const unlocked = desbloqueados.includes(a.id)
        const secretoNaoVisto = a.secreto && !unlocked
        return (
          <div key={a.id} className={`perfil-achievement-card ${unlocked ? 'perfil-achievement-card--unlocked' : 'perfil-achievement-card--locked'}`}>
            <div className="perfil-achievement-icone">{a.icone}</div>
            <div className="perfil-achievement-nome">{secretoNaoVisto ? '???' : a.nome}</div>
            <div className="perfil-achievement-desc">{secretoNaoVisto ? 'Achievement secreto' : a.descricao}</div>
            <div className={`perfil-achievement-status ${unlocked ? 'status-unlocked' : 'status-locked'}`}>
              {unlocked ? '✓ DESBLOQUEADO' : '🔒 BLOQUEADO'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
