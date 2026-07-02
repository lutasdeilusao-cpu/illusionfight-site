import { useKpI18n } from '../hooks/useKpI18n'

export default function KPInfoBar({ round, currentPlayer, deckCount, cemeteryCount, terrainName }) {
  const { t } = useKpI18n()
  return (
    <div className="info-bar">
      <div className="info-cell">
        <span className="ic-label">{t('kp.infobar.ciclo')}</span>
        <span className="ic-val">{round}</span>
      </div>
      <div className="info-cell">
        <span className="ic-label">{t('kp.infobar.operador')}</span>
        <span className="ic-val">{t('kp.perigo.player_prefix')}{currentPlayer + 1}</span>
      </div>
      <div className="info-cell">
        <span className="ic-label">{t('kp.infobar.stack')}</span>
        <span className="ic-val">{deckCount}</span>
      </div>
      <div className="info-cell">
        <span className="ic-label">{t('kp.infobar.lixo')}</span>
        <span className="ic-val">{cemeteryCount}</span>
      </div>
    </div>
  )
}
