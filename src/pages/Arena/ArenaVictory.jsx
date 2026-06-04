import { motion } from 'framer-motion'
import { useArenaStore } from './store/useArenaStore'

export default function ArenaVictory({ onNavigate }) {
  const store = useArenaStore()
  const { sheet, match } = store

  const isVitoria = match.status === 'victory'
  const xpGain = isVitoria ? 10 : 0

  const pv = (sheet.attributes?.R || 0) * 5
  const pm = (sheet.attributes?.PdF || 0) * 5

  return (
    <div className="arena-victory arena-container">
      <div className="arena-victory-header">
        <h1 className={`arena-victory-title ${isVitoria ? 'arena-victory-win' : 'arena-victory-lose'}`}>
          {isVitoria ? '⚔️ VITÓRIA!' : '💀 DERROTA'}
        </h1>
        <p className="arena-victory-sub">{isVitoria ? 'Você provou seu valor na arena.' : 'A derrota só fortalece o guerreiro.'}</p>
      </div>

      <div className="arena-victory-card">
        <div className="arena-victory-sheet-name">{sheet.sheet_name}</div>
        <div className="arena-victory-attrs">
          <div className="arena-victory-attr"><span>F</span>{sheet.attributes.F}</div>
          <div className="arena-victory-attr"><span>H</span>{sheet.attributes.H}</div>
          <div className="arena-victory-attr"><span>R</span>{sheet.attributes.R}</div>
          <div className="arena-victory-attr"><span>A</span>{sheet.attributes.A}</div>
          <div className="arena-victory-attr"><span>PdF</span>{sheet.attributes.PdF}</div>
        </div>
        <div className="arena-victory-stats">
          <span>PV: {pv}</span>
          <span>PM: {pm}</span>
          <span>XP: {sheet.xp_total || 0}</span>
        </div>
        {isVitoria && (
          <motion.div className="arena-xp-gain" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            +{xpGain} XP
          </motion.div>
        )}
      </div>

      <div className="arena-victory-btns">
        <button className="arena-btn-primary" onClick={() => onNavigate('lobby')}>LUTAR DE NOVO</button>
        <button className="arena-btn-sair" onClick={() => { store.updateSheet({}); onNavigate('lobby') }}>ESCOLHER OUTRA FICHA</button>
      </div>
    </div>
  )
}
