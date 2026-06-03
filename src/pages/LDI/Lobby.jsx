import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useGameStore } from './store/useGameStore'
import { loadSheets, deleteSheet } from './hooks/useLDIStorage'
import './LDI.css'

export default function Lobby() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const loadFromCloud = useGameStore(s => s.loadFromCloud)
  const resetGame = useGameStore(s => s.resetGame)
  const [saves, setSaves] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    loadSheets(user.id).then(data => {
      setSaves(data || [])
      setLoading(false)
    })
  }, [user])

  const handleContinue = async (sheetId) => {
    if (!user) return
    const ok = await loadFromCloud(user.id, sheetId)
    if (ok) {
      const currentSave = useGameStore.getState().save
      if (currentSave.status !== 'active') {
        const sheet = useGameStore.getState().sheet
        useGameStore.getState().updateSave({
          id: null,
          status: 'active',
          current_scene_id: '1.2',
          post_combat_scene: null,
          day_in_game: 1,
          credits: 0,
          pv_current: Math.max(1, (sheet?.attributes?.R || 0) * 5),
          pm_current: Math.max(2, (sheet?.attributes?.PdF || 0) * 4),
          clues_collected: [],
          flags: {},
          arc: 1,
        })
      }
      navigate('/extras/ldi/game')
    }
  }

  const handleDelete = async (sheetId) => {
    if (!window.confirm('Deletar esta ficha permanentemente?')) return
    await deleteSheet(sheetId)
    setSaves(prev => prev.filter(s => s.id !== sheetId))
  }

  const handleNew = () => {
    resetGame()
    navigate('/extras/ldi/create')
  }

  return (
    <div className="ldi-lobby">
      <div className="ldi-lobby-bg" />
      <motion.div
        className="ldi-lobby-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="ldi-lobby-brand">
          <h1 className="ldi-lobby-title">LENDAS DO LDI</h1>
          <p className="ldi-lobby-sub">Arco 1: Descobrimento</p>
          <p className="ldi-lobby-desc">
            Um RPG narrativo de livro-jogo digital no universo Lutas de Ilusão.
            Suas escolhas definem seu destino na arena.
          </p>
        </div>

        <div className="ldi-lobby-actions">
          <button onClick={handleNew} className="ldi-btn ldi-btn--primary">
            NOVA FICHA
          </button>
        </div>

        {user && (
          <div className="ldi-lobby-saves">
            <h3>Suas Fichas</h3>
            {loading && <p>Carregando...</p>}
            {!loading && saves.length === 0 && <p>Nenhuma ficha salva ainda.</p>}
            {saves.map(s => (
              <div key={s.id} className="ldi-save-card">
                <div className="ldi-save-card-info">
                  <span className="ldi-save-card-name">{s.sheet_name}</span>
                  <span className="ldi-save-card-meta">Arma: {s.weapon} · Arco {s.arc || 1}</span>
                </div>
                <div className="ldi-save-card-actions">
                  <button className="ldi-btn ldi-btn--primary" onClick={() => handleContinue(s.id)}>
                    CONTINUAR
                  </button>
                  <button className="ldi-btn ldi-btn--danger" onClick={() => handleDelete(s.id)}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!user && (
          <div className="ldi-lobby-guest">
            <p>Modo visitante — sem salvamento na nuvem.</p>
            <p><Link to="/login">Faça login</Link> para salvar seu progresso.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
