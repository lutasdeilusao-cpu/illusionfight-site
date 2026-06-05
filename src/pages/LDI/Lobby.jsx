import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useGameStore } from './store/useGameStore'
import { loadSheets, deleteSheet } from './hooks/useLDIStorage'
import ManualDrawer from './components/ManualDrawer'
import './LDI.css'

const ELEMENTAL_COLORS = {
  fogo: '#E02020',
  agua: '#1E6FBF',
  terra: '#8B5E3C',
  ar: '#A0D2DB',
  trevas: '#6B2FA0',
  luz: '#FFD700',
  neutro: '#8B8F96',
}

const WEAPON_ICONS = {
  katana: '🗡️',
  laminas: '⚔️',
  corrente: '🔗',
}

const ARCO_LABELS = {
  1: 'Arco 1: Descobrimento',
}

export default function Lobby() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const loadFromCloud = useGameStore(s => s.loadFromCloud)
  const resetGame = useGameStore(s => s.resetGame)
  const [saves, setSaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [titlePhase, setTitlePhase] = useState('typing')
  const [titleText, setTitleText] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)

  const FULL_TITLE = 'LENDAS DO LDI'

  useEffect(() => {
    if (!user) return
    setLoading(true)
    loadSheets(user.id).then(data => {
      setSaves(data || [])
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (titlePhase === 'typing') {
      if (titleText.length < FULL_TITLE.length) {
        const t = setTimeout(() => setTitleText(FULL_TITLE.slice(0, titleText.length + 1)), 80)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setTitlePhase('glitch'), 300)
        return () => clearTimeout(t)
      }
    }
    if (titlePhase === 'glitch') {
      setTitleText('LENDAS D0 LDI')
      const t1 = setTimeout(() => setTitleText('L3ND4S D0 LD1'), 100)
      const t2 = setTimeout(() => setTitleText('██████ ███'), 200)
      const t3 = setTimeout(() => setTitleText('LENDAS D0 LD1'), 350)
      const t4 = setTimeout(() => setTitleText('L3ND4S D0 LDI'), 450)
      const t5 = setTimeout(() => setTitleText(''), 600)
      const t6 = setTimeout(() => {
        setTitlePhase('rewrite')
      }, 700)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6) }
    }
    if (titlePhase === 'rewrite') {
      if (titleText.length < FULL_TITLE.length) {
        const t = setTimeout(() => setTitleText(FULL_TITLE.slice(0, titleText.length + 1)), 60)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setTitlePhase('idle'), 2000)
        return () => clearTimeout(t)
      }
    }
    if (titlePhase === 'idle') {
      const t = setTimeout(() => {
        setTitleText('')
        setTitlePhase('typing')
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [titlePhase, titleText])

  const handleContinue = async (sheetId) => {
    console.log('[LOBBY] handleContinue chamado, sheetId:', sheetId)
    console.log('[LOBBY] user:', user?.id)
    if (!user) return
    const ok = await loadFromCloud(user.id, sheetId)
    console.log('[LOBBY] loadFromCloud resultado:', ok)
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
      navigate('/games/ldi/game')
    }
  }

  const handleDelete = async (sheetId) => {
    if (!window.confirm('Deletar esta ficha permanentemente?')) return
    await deleteSheet(sheetId)
    setSaves(prev => prev.filter(s => s.id !== sheetId))
  }

  const handleNewGuided = () => {
    setShowNewModal(false)
    resetGame()
    navigate('/games/ldi/create?mode=guided')
  }

  const handleNewFull = () => {
    setShowNewModal(false)
    resetGame()
    navigate('/games/ldi/create?mode=full')
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
          <h1 className={`ldi-lobby-title ${titlePhase === 'glitch' ? 'ldi-glitch' : ''}`}>
            {titleText}
            {titlePhase === 'typing' && <span className="ldi-typewriter-cursor" />}
          </h1>
          <p className="ldi-lobby-sub">Arco 1: Descobrimento</p>
          <p className="ldi-lobby-desc">
            Um RPG narrativo de livro-jogo digital no universo Lutas de Ilusão.
            Suas escolhas definem seu destino na arena.
          </p>
        </div>

        <div className="ldi-lobby-actions">
          <button onClick={() => setShowNewModal(true)} className="ldi-btn ldi-btn--primary">
            NOVA FICHA
          </button>
          <button onClick={() => setShowManual(true)} className="ldi-btn ldi-btn--ghost">
            📖 Manual do Jogo
          </button>
        </div>

        {user && (
          <div className="ldi-lobby-saves">
            <h3>Suas Fichas</h3>
            {loading && <p>Carregando...</p>}
            {!loading && saves.length === 0 && <p>Nenhuma ficha salva ainda.</p>}
            {saves.map(s => {
              const attrs = s.attributes || {}
              const elColor = ELEMENTAL_COLORS[s.elemental] || ELEMENTAL_COLORS.neutro
              const weaponIcon = WEAPON_ICONS[s.weapon] || WEAPON_ICONS.katana
              const arcoLabel = ARCO_LABELS[s.arc] || `Arco ${s.arc || 1}`
              return (
                <motion.div
                  key={s.id}
                  className="ldi-save-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="ldi-save-card-header">
                    <span className="ldi-save-card-name">{s.sheet_name}</span>
                    <button className="ldi-save-delete" onClick={() => handleDelete(s.id)} title="Deletar">🗑</button>
                  </div>
                  <div className="ldi-save-card-badges">
                    {Object.entries({ F: attrs.F, H: attrs.H, R: attrs.R, A: attrs.A, PdF: attrs.PdF }).map(([k, v]) => (
                      <span key={k} className="ldi-attr-badge">{k}:{v || 0}</span>
                    ))}
                  </div>
                  <div className="ldi-save-card-footer">
                    <span className="ldi-save-card-weapon">{weaponIcon} {s.weapon}</span>
                    <span className="ldi-save-card-elemental" style={{ color: elColor }}>● {s.elemental || 'neutro'}</span>
                    <span className="ldi-save-card-arc">{arcoLabel}</span>
                    <button className="ldi-btn ldi-btn--continue" onClick={() => handleContinue(s.id)}>
                      CONTINUAR
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {!user && (
          <div className="ldi-lobby-guest">
            <p>Modo visitante — sem salvamento na nuvem.</p>
            <p><Link to="/login">Faça login</Link> para salvar seu progresso.</p>
          </div>
        )}
      </motion.div>

      <ManualDrawer open={showManual} onClose={() => setShowManual(false)} />

      <AnimatePresence>
        {showNewModal && (
          <>
            <motion.div
              className="ldi-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewModal(false)}
            />
            <motion.div
              className="ldi-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="ldi-modal-title">Nova Ficha</h2>
              <p className="ldi-modal-sub">Escolha como criar seu personagem no LDI:</p>
              <div className="ldi-modal-options">
                <button className="ldi-modal-option" onClick={handleNewGuided}>
                  <span className="ldi-modal-option-icon">🤖</span>
                  <span className="ldi-modal-option-title">Entrar com ajuda da NeoGuide</span>
                  <span className="ldi-modal-option-desc">Fluxo guiado: responda perguntas e o sistema monta sua ficha passo a passo. Ideal para iniciantes.</span>
                </button>
                <button className="ldi-modal-option" onClick={handleNewFull}>
                  <span className="ldi-modal-option-icon">⚙️</span>
                  <span className="ldi-modal-option-title">Construir do zero</span>
                  <span className="ldi-modal-option-desc">Formulário completo: escolha vantagens, desvantagens, perícias e especializações. Para veteranos.</span>
                </button>
              </div>
              <button className="ldi-modal-cancel" onClick={() => setShowNewModal(false)}>Cancelar</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
