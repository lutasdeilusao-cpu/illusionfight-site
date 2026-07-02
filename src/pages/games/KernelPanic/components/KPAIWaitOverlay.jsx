const ACTION_LABELS = {
  draw: 'Baixando módulo...',
  place: 'Instalando módulo no grid...',
  equip_used: 'Ativando equipamento...',
  ai_shoot: 'Iniciando ataque...',
  pass: 'Encerrando ciclo...',
  perigo_up: 'Exposição aumentando...',
}

export default function KPAIWaitOverlay({ currentStep, totalSteps, actions }) {
  const currentAction = actions[currentStep]
  const label = currentAction ? (ACTION_LABELS[currentAction.type] || 'Processando...') : 'Executando algoritmo...'

  return (
    <div className="ai-wait-overlay show">
      <div className="ai-wait-box">
        <div className="ai-wait-label">IA PROCESSANDO</div>
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
