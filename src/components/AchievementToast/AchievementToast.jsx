import { useEffect } from 'react'
import thumbEp00 from '../../assets/images/episodes/thumb-ep00.png'
import { useLanguage } from '../../context/LanguageContext'
import './AchievementToast.css'

export default function AchievementToast({ achievement, fecharToast }) {
  const { t } = useLanguage()
  useEffect(() => {
    const timer = setTimeout(fecharToast, 5000)
    return () => clearTimeout(timer)
  }, [fecharToast])

  return (
    <div className="achievement-overlay" onClick={fecharToast}>
      <div className="achievement-card" onClick={e => e.stopPropagation()}>
        <div className="achievement-particles">
          {[...Array(12)].map((_, i) => (
            <span key={i} className={`particle p-${i}`} />
          ))}
        </div>
        <img src={thumbEp00} className="achievement-jack" alt="Jack" />
        <div className="achievement-label">{t('achievement.titulo')}</div>
        <div className="achievement-icone">{achievement.icone}</div>
        <div className="achievement-nome">{achievement.nome}</div>
        <div className="achievement-descricao">{achievement.descricao}</div>
        <button className="achievement-btn" onClick={fecharToast}>{t('achievement.continuar')}</button>
      </div>
    </div>
  )
}
