import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'

export default function TurnoIndicator({ turno, fase }) {
  const { t } = useLanguage()
  return (
    <div className={`tatics-turno ${fase === 'inimigo' ? 'turno-inimigo' : 'turno-player'}`}>
      <div className="tatics-turno-linha">
        <span className="tatics-turno-icone">
          {fase === 'player' ? '⚔️' : fase === 'inimigo' ? '⏳' : '⚡'}
        </span>
        <span className="tatics-turno-texto">
          {fase === 'player' ? t('games.tatics.seu_turno') : fase === 'inimigo' ? t('games.tatics.inimigo_agindo') : t('games.tatics.turno_n', { n: turno })}
        </span>
        <span className="tatics-turno-rodada">R{fase === 'player' ? turno : Math.max(1, turno - 1)}</span>
      </div>
      <div className="tatics-turno-bar" />
    </div>
  )
}
