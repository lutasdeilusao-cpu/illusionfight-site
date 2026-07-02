import { useKpI18n } from '../hooks/useKpI18n'

export default function KPHandoffScreen({ playerIdx, onContinue }) {
  const { t } = useKpI18n()
  const prefix = playerIdx === 0 ? 'p1' : 'p2'
  return (
    <div className="handoff-overlay show">
      <div className="handoff-box">
        <div className="handoff-order">{t('kp.handoff.titulo')}</div>
        <div className={`handoff-player ${prefix}`}>{t('kp.perigo.player_prefix')}{playerIdx + 1}</div>
        <div className="handoff-sub">{t('kp.handoff.instrucao')}</div>
        <button className="handoff-btn" onClick={onContinue}>{t('kp.handoff.pronto')}</button>
        <div className="handoff-reticle" />
      </div>
    </div>
  )
}
