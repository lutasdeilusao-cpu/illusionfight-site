import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'
import enemiesData from './data/arena-enemies.json'

export default function ArenaLobby({ onNavigate }) {
  const { user } = useAuth()
  const store = useArenaStore()
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEnemies, setShowEnemies] = useState(null)

  useEffect(() => {
    if (!user) return
    store.loadSheets(user.id).then(data => { setSheets(data); setLoading(false) })
  }, [user])

  const handleLutar = (sheet) => {
    store.loadSheet(sheet)
    setShowEnemies(sheet)
  }

  const handleSelectEnemy = (enemy) => {
    store.startMatch(enemy)
    onNavigate('combat')
  }

  return (
    <div className="arena-lobby">
      <div className="arena-header">
        <button className="arena-back" onClick={() => window.history.back()}>← extras</button>
        <h1 className="arena-titulo"><span className="arena-titulo-glitch" data-text="LDI ARENA">LDI ARENA</span></h1>
        <p className="arena-sub"><span className="arena-cursor">█</span> crie sua ficha. lute contra a CPU. suba no ranking.</p>
      </div>

      {showEnemies ? (
        <div className="arena-enemy-select">
          <div className="arena-section-label">
            <span>▶ SELECIONE O INIMIGO</span>
            <div className="arena-section-linha" />
          </div>
          <div className="arena-enemy-grid">
            {enemiesData.map(enemy => (
              <motion.div key={enemy.id} className="arena-enemy-card"
                style={{ '--cor': enemy.difficulty === 'easy' ? '#22C55E' : enemy.difficulty === 'medium' ? '#F5A623' : enemy.difficulty === 'hard' ? '#8B0000' : '#A855F4' }}
                onClick={() => handleSelectEnemy(enemy)} whileHover={{ scale: 1.02 }}>
                <div className="arena-enemy-tier">TIER {enemy.tier}</div>
                <div className="arena-enemy-name">{enemy.name}</div>
                <div className="arena-enemy-rank">Rank #{enemy.rank}</div>
                <div className="arena-enemy-stats">
                  F:{enemy.stats.F} H:{enemy.stats.H} R:{enemy.stats.R} A:{enemy.stats.A} PdF:{enemy.stats.PdF}
                </div>
                <div className="arena-enemy-mode">{enemy.preferred_mode === 'fists' ? '✊' : enemy.preferred_mode === 'armed' ? '⚔️' : '⚡'} {enemy.preferred_mode}</div>
                {enemy.elemental && <div className="arena-enemy-elemental">{enemy.elemental}</div>}
              </motion.div>
            ))}
          </div>
          <button className="arena-btn-sair" onClick={() => setShowEnemies(null)}>← voltar</button>
        </div>
      ) : (
        <>
          <div className="arena-section-label">
            <span>▶ SUAS FICHAS</span>
            <div className="arena-section-linha" />
          </div>
          {loading && <p className="arena-loading">carregando...</p>}
          {!loading && sheets.length === 0 && (
            <p className="arena-empty">nenhuma ficha ainda. crie sua primeira!</p>
          )}
          <div className="arena-sheet-grid">
            {sheets.map(sheet => (
              <motion.div key={sheet.id} className="arena-sheet-card"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleLutar(sheet)}>
                <div className="arena-sheet-emoji">{sheet.elemental === 'fogo' ? '🔥' : sheet.elemental === 'agua' ? '💧' : sheet.elemental === 'terra' ? '🪨' : sheet.elemental === 'ar' ? '💨' : sheet.elemental === 'trevas' ? '🌑' : sheet.elemental === 'luz' ? '✨' : '⚪'}</div>
                <div className="arena-sheet-name">{sheet.sheet_name}</div>
                <div className="arena-sheet-attrs">
                  F:{sheet.attributes.F} H:{sheet.attributes.H} R:{sheet.attributes.R} A:{sheet.attributes.A} PdF:{sheet.attributes.PdF}
                </div>
                <div className="arena-sheet-xp">XP: {sheet.xp_total || 0}</div>
                <div className="arena-sheet-cta">LUTAR</div>
              </motion.div>
            ))}
          </div>
          <div className="arena-new-sheet" onClick={() => { store.newSheet(); onNavigate('create') }}>
            ➕ NOVA FICHA
          </div>
        </>
      )}
    </div>
  )
}
