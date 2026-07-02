import { useKpI18n } from '../hooks/useKpI18n'

export default function KPVictoryScreen({ winner, onRestart, onMenu }) {
  const { t } = useKpI18n()
  return (
    <div className="victory-overlay show">
      <div className="victory-title">
        {winner === 0 ? t('kp.victory.vitoria') : t('kp.victory.derrota')}
      </div>
      <div className="victory-sub">
        {winner === 0 ? t('kp.victory.venceu_texto') : t('kp.victory.perdeu_texto')}
      </div>
      <button className="btn-restart" onClick={onRestart}>{t('kp.victory.revanche')}</button>
      <button className="btn-restart" onClick={onMenu} style={{ borderColor: 'var(--olive)', color: 'var(--ghost)' }}>{t('kp.victory.menu')}</button>
    </div>
  )
}
