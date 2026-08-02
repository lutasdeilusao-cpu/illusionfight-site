import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'
import { ARENA_PATHS, ARENA_PATH_PRESETS } from './data/arenaLoadout.js'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'

const PATH_ICONS = { atacante: '⚔️', defensor: '🛡️', mistico: '✨' }

export default function ArenaCreate({ onNavigate, skipIntro = false, onFirstVisit }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const store = useArenaStore()
  const [step, setStep] = useState(skipIntro ? 'path' : 'intro')
  const [error, setError] = useState('')
  const [guestSaveModal, setGuestSaveModal] = useState(false)
  const sheet = store.sheet

  useEffect(() => {
    if (!skipIntro) onFirstVisit?.()
  }, [])

  const selectPath = (id) => {
    sfx.select()
    setError('')
    store.updateSheet({
      combat_path: id,
      attributes: { ...ARENA_PATH_PRESETS[id] },
      loadout_version: 2,
    })
  }

  const save = async () => {
    if (!sheet.sheet_name?.trim()) {
      setError(t('games.arena.erro_nome'))
      return
    }
    if (!ARENA_PATHS.includes(sheet.combat_path)) {
      setError(t('games.arena.loadout.errors.path'))
      return
    }
    if (!user) {
      setGuestSaveModal(true)
      return
    }
    await store.saveToCloud(user.id)
    onNavigate('lobby')
  }

  if (step === 'intro') {
    return (
      <div className="arena-create arena-lobby arena-lobby--intro">
        <div className="arena-lobby-hero">
          <p className="arena-lobby-titulo">{t('games.arena.modo_standalone')}</p>
          <h1 className="arena-lobby-nome arena-lobby-nome--lg">{t('games.arena.nova_ficha')}</h1>
          <p className="arena-lobby-sub">{t('games.arena.loadout.intro')}</p>
        </div>
        <button className="arc-btn-primary arc-btn-primary--intro" onClick={() => setStep('path')}>{t('games.arena.intro_criar_direto')}</button>
        <BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.arena.btn_voltar')} />
      </div>
    )
  }

  return (
    <div className="arena-create">
      <div className="arc-header">
        <div className="arc-header-center"><p className="arena-lobby-titulo arena-lobby-titulo--sm">{t('games.arena.loadout.path_title')}</p></div>
      </div>

      <div className="arc-step">
        <div className="arc-name-hero arc-name-hero--simple">
          <div className="arc-name-avatar arc-name-avatar--neutral">{sheet.sheet_name ? sheet.sheet_name[0].toUpperCase() : '?'}</div>
          <input className="arc-name-input" value={sheet.sheet_name || ''} onChange={event => store.updateSheet({ sheet_name: event.target.value })} placeholder={t('games.arena.placeholder_nome')} autoFocus />
        </div>

        <p className="arena-lobby-sub">{t('games.arena.loadout.path_intro')}</p>
        <div className="arc-loadout-grid arc-loadout-grid--styles">
          {ARENA_PATHS.map(id => (
            <button key={id} className={`arc-loadout-card ${sheet.combat_path === id ? 'arc-loadout-card--active' : ''}`} onClick={() => selectPath(id)}>
              <strong>{PATH_ICONS[id]} {t(`games.arena.loadout.paths.${id}.name`)}</strong>
              <span>{t(`games.arena.loadout.paths.${id}.desc`)}</span>
            </button>
          ))}
        </div>

        {error && <p className="arena-err">{error}</p>}
        <div className="arc-nav"><BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.arena.btn_voltar')} /><button className="arc-btn-salvar" onClick={save}>{t('games.arena.btn_salvar_lutar')}</button></div>
      </div>

      <AnimatePresence>
        {guestSaveModal && <motion.div className="arena-guest-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGuestSaveModal(false)}><motion.div className="arena-guest-modal" onClick={event => event.stopPropagation()}><div className="arena-guest-modal-inner"><div className="arena-guest-modal-emoji">🔒</div><h2 className="arena-guest-modal-titulo">{t('games.arena.guest_save_prompt_title')}</h2><p className="arena-guest-modal-desc">{t('games.arena.guest_save_prompt_desc')}</p><div className="arena-guest-modal-btns"><button className="arena-guest-modal-btn arena-guest-modal-btn--primary" onClick={() => navigate('/cadastro')}>{t('games.arena.guest_create_account')}</button><button className="arena-guest-modal-btn" onClick={() => onNavigate('lobby')}>{t('games.arena.guest_continue_without_saving')}</button></div></div></motion.div></motion.div>}
      </AnimatePresence>
    </div>
  )
}
