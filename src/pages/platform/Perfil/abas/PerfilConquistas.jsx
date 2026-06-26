import { useAchievements } from '../../../../context/AchievementsContext'
import { useLanguage } from '../../../../context/LanguageContext'
import todosAchievements from '../../../../data/achievements-pt.json'

export default function PerfilConquistas() {
  const { t } = useLanguage()
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
            <div className="perfil-achievement-desc">{secretoNaoVisto ? t('site.perfil.conquistas_secreto') : a.descricao}</div>
            <div className={`perfil-achievement-status ${unlocked ? 'status-unlocked' : 'status-locked'}`}>
              {unlocked ? t('site.perfil.conquistas_desbloqueado') : t('site.perfil.conquistas_bloqueado')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
