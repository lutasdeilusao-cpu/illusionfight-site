import { useKpI18n } from '../hooks/useKpI18n'

export default function KPAIWaitOverlay({ currentStep, totalSteps, actions }) {
  const { t } = useKpI18n()

  const ACTION_LABELS = {
    draw: t('kp.aiwait.baixando'),
    place: t('kp.aiwait.instalando'),
    equip_used: t('kp.aiwait.ativando'),
    ai_shoot: t('kp.aiwait.atacando'),
    pass: t('kp.aiwait.encerrando'),
    perigo_up: t('kp.aiwait.exposicao'),
  }

  const currentAction = actions[currentStep]
  const label = currentAction ? (ACTION_LABELS[currentAction.type] || t('kp.aiwait.processando')) : t('kp.aiwait.algoritmo')

  return (
    <div className="ai-wait-overlay show">
      <div className="ai-wait-box">
        <div className="ai-wait-label">{t('kp.aiwait.titulo')}</div>
        <div className="ai-wait-title">KERNEL PANIC</div>
        <div className="ai-wait-dots">
          <div className="ai-wait-dot" />
          <div className="ai-wait-dot" />
          <div className="ai-wait-dot" />
        </div>
        <div className="ai-wait-sub">{label}</div>
      </div>
    </div>
  )
}
