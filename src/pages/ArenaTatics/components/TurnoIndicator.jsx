import { motion } from 'framer-motion'

export default function TurnoIndicator({ turno, fase }) {
  return (
    <div className={`tatics-turno ${fase === 'inimigo' ? 'turno-inimigo' : 'turno-player'}`}>
      <div className="tatics-turno-linha">
        <span className="tatics-turno-icone">
          {fase === 'player' ? '⚔️' : fase === 'inimigo' ? '⏳' : '⚡'}
        </span>
        <span className="tatics-turno-texto">
          {fase === 'player' ? 'SEU TURNO' : fase === 'inimigo' ? 'INIMIGO AGINDO...' : `TURNO ${turno}`}
        </span>
        <span className="tatics-turno-rodada">R{fase === 'player' ? turno : Math.max(1, turno - 1)}</span>
      </div>
      <div className="tatics-turno-bar" />
    </div>
  )
}
