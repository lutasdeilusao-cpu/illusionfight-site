import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'
import { ARENA_STYLES, ARENA_TECHNIQUES, ARENA_WEAKNESSES, STYLE_WEAPONS } from './data/arenaLoadout.js'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'

const ATTRS = ['F', 'H', 'R', 'A', 'PdF']
const ATTR_EMOJI = { F: '💪', H: '🎯', R: '🛡️', A: '🦾', PdF: '✨' }
const STEPS = ['attrs', 'identity', 'loadout']

export default function ArenaCreate({ onNavigate, skipIntro = false, onFirstVisit }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const store = useArenaStore()
  const [step, setStep] = useState(skipIntro ? 'attrs' : 'intro')
  const [errors, setErrors] = useState({})
  const [guestSaveModal, setGuestSaveModal] = useState(false)

  useEffect(() => {
    if (!skipIntro) onFirstVisit?.()
  }, [])

  const sheet = store.sheet
  const attrs = sheet.attributes
  const points = store.points_available
  const stepIndex = STEPS.indexOf(step)

  const changeAttribute = (attr, delta) => {
    if (delta > 0 && points <= 0) return
    if (delta < 0 && attrs[attr] <= 0) return
    const value = attrs[attr] + delta
    if (value > 5) return
    store.updateSheet({ attributes: { ...attrs, [attr]: value } })
    if (delta > 0) store.spendPoints(1)
    else store.gainPoints(1)
    sfx.select()
  }

  const selectStyle = (id) => {
    sfx.select()
    store.updateSheet({ combat_style: id, weapon: STYLE_WEAPONS[id].weapon, loadout_version: 1 })
  }

  const toggleTechnique = (id) => {
    const current = sheet.technique_ids || []
    if (current.includes(id)) {
      store.updateSheet({ technique_ids: current.filter(item => item !== id) })
      sfx.cancel()
      return
    }
    if (current.length >= 2) return
    store.updateSheet({ technique_ids: [...current, id] })
    sfx.select()
  }

  const nextFromAttributes = () => {
    const nextErrors = {}
    if (points > 0) nextErrors.points = t('games.arena.erro_pontos')
    if (attrs.R < 1) nextErrors.resistance = t('games.arena.erro_r_min')
    setErrors(nextErrors)
    if (!Object.keys(nextErrors).length) setStep('identity')
  }

  const nextFromIdentity = () => {
    if (!sheet.sheet_name?.trim()) { setErrors({ name: t('games.arena.erro_nome') }); return }
    setErrors({})
    setStep('loadout')
  }

  const save = async () => {
    const nextErrors = {}
    if (!sheet.combat_style) nextErrors.style = t('games.arena.loadout.errors.style')
    if ((sheet.technique_ids || []).length !== 2) nextErrors.techniques = t('games.arena.loadout.errors.techniques')
    if (!sheet.weakness_id) nextErrors.weakness = t('games.arena.loadout.errors.weakness')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (!user) { setGuestSaveModal(true); return }
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
        <button className="arc-btn-primary arc-btn-primary--intro" onClick={() => setStep('attrs')}>{t('games.arena.intro_criar_direto')}</button>
        <BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.arena.btn_voltar')} />
      </div>
    )
  }

  return (
    <div className="arena-create">
      <div className="arc-header">
        <div className="arc-header-center">
          <p className="arena-lobby-titulo arena-lobby-titulo--sm">{t('games.arena.nova_ficha')}</p>
          {sheet.sheet_name && <p className="arc-header-name">{sheet.sheet_name}</p>}
        </div>
        <div className="arena-create-steps">
          {STEPS.map((item, index) => <div key={item} className={`arena-create-step-dot ${step === item ? 'arena-create-step-dot--active' : index < stepIndex ? 'arena-create-step-dot--done' : ''}`} />)}
        </div>
      </div>

      {step === 'attrs' && (
        <div className="arc-step">
          <div className="arc-section-label">{t('games.arena.pag_atributos')} <span className="arc-pontos">{t('games.arena.attrs_pontos_restantes', { n: points })}</span></div>
          <div className="arc-attr-list">
            {ATTRS.map(attr => (
              <div key={attr} className="arc-attr-card">
                <div className="arc-attr-avatar">{ATTR_EMOJI[attr]}</div>
                <div className="arc-attr-info"><div className="arc-attr-name">{t(`games.arena.attr_labels.${attr}`)}</div><div className="arc-attr-desc">{t(`games.arena.attr_desc.${attr}`)}</div></div>
                <div className="arc-attr-controls">
                  <button className="arc-attr-btn" onClick={() => changeAttribute(attr, -1)} disabled={attrs[attr] <= 0}>−</button>
                  <span className="arc-attr-val">{attrs[attr]}</span>
                  <button className="arc-attr-btn" onClick={() => changeAttribute(attr, 1)} disabled={attrs[attr] >= 5 || points <= 0}>+</button>
                </div>
              </div>
            ))}
          </div>
          {Object.values(errors).map(error => <p className="arena-err" key={error}>{error}</p>)}
          <div className="arc-nav"><BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.arena.btn_voltar')} /><button className="arc-btn-primary" onClick={nextFromAttributes}>{t('games.arena.btn_proximo')}</button></div>
        </div>
      )}

      {step === 'identity' && (
        <div className="arc-step">
          <div className="arc-section-label">{t('games.arena.pag_identidade')}</div>
          <div className="arc-name-hero arc-name-hero--simple">
            <div className="arc-name-avatar arc-name-avatar--neutral">{sheet.sheet_name ? sheet.sheet_name[0].toUpperCase() : '?'}</div>
            <input className="arc-name-input" value={sheet.sheet_name || ''} onChange={event => store.updateSheet({ sheet_name: event.target.value })} placeholder={t('games.arena.placeholder_nome')} autoFocus />
          </div>
          {errors.name && <p className="arena-err">{errors.name}</p>}
          <div className="arc-nav"><BackToGamesBtn onClick={() => setStep('attrs')} label={t('games.arena.btn_voltar')} /><button className="arc-btn-primary" onClick={nextFromIdentity}>{t('games.arena.btn_proximo')}</button></div>
        </div>
      )}

      {step === 'loadout' && (
        <div className="arc-step">
          <div className="arc-section-label">{t('games.arena.loadout.style_title')}</div>
          <div className="arc-loadout-grid arc-loadout-grid--styles">
            {ARENA_STYLES.map(id => <button key={id} className={`arc-loadout-card ${sheet.combat_style === id ? 'arc-loadout-card--active' : ''}`} onClick={() => selectStyle(id)}><strong>{t(`games.arena.loadout.styles.${id}.name`)}</strong><span>{t(`games.arena.loadout.styles.${id}.desc`)}</span></button>)}
          </div>

          <div className="arc-section-label">{t('games.arena.loadout.techniques_title')} <span className="arc-pontos">{(sheet.technique_ids || []).length}/2</span></div>
          <div className="arc-loadout-grid">
            {ARENA_TECHNIQUES.map(id => <button key={id} className={`arc-loadout-card ${(sheet.technique_ids || []).includes(id) ? 'arc-loadout-card--active' : ''}`} onClick={() => toggleTechnique(id)}><strong>{t(`games.arena.loadout.techniques.${id}.name`)}</strong><span>{t(`games.arena.loadout.techniques.${id}.desc`)}</span></button>)}
          </div>

          <div className="arc-section-label">{t('games.arena.loadout.weakness_title')}</div>
          <div className="arc-loadout-grid">
            {ARENA_WEAKNESSES.map(id => <button key={id} className={`arc-loadout-card arc-loadout-card--weakness ${sheet.weakness_id === id ? 'arc-loadout-card--active' : ''}`} onClick={() => store.updateSheet({ weakness_id: id })}><strong>{t(`games.arena.loadout.weaknesses.${id}.name`)}</strong><span>{t(`games.arena.loadout.weaknesses.${id}.desc`)}</span></button>)}
          </div>
          {Object.values(errors).map(error => <p className="arena-err" key={error}>{error}</p>)}
          <div className="arc-nav"><BackToGamesBtn onClick={() => setStep('identity')} label={t('games.arena.btn_voltar')} /><button className="arc-btn-salvar" onClick={save}>{t('games.arena.btn_salvar_lutar')}</button></div>
        </div>
      )}

      <AnimatePresence>
        {guestSaveModal && <motion.div className="arena-guest-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGuestSaveModal(false)}><motion.div className="arena-guest-modal" onClick={event => event.stopPropagation()}><div className="arena-guest-modal-inner"><div className="arena-guest-modal-emoji">🔒</div><h2 className="arena-guest-modal-titulo">{t('games.arena.guest_save_prompt_title')}</h2><p className="arena-guest-modal-desc">{t('games.arena.guest_save_prompt_desc')}</p><div className="arena-guest-modal-btns"><button className="arena-guest-modal-btn arena-guest-modal-btn--primary" onClick={() => navigate('/cadastro')}>{t('games.arena.guest_create_account')}</button><button className="arena-guest-modal-btn" onClick={() => onNavigate('lobby')}>{t('games.arena.guest_continue_without_saving')}</button></div></div></motion.div></motion.div>}
      </AnimatePresence>
    </div>
  )
}
