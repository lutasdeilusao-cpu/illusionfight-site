import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useGanguesStore } from './store/useGanguesStore'
import { GANGUES_CHARACTER_CATALOG, getGanguesAvailableCharacterIds } from './data/ganguesCharacters.js'
import { sfx } from '../../../lib/sfx'

const PATH_MARKS = { atacante: 'A', defensor: 'D', mistico: 'M' }
const ATTRIBUTES = ['A', 'H', 'R', 'D']

export default function GanguesCreate({ onNavigate, onCreated }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = useGanguesStore()
  const [initialRecruitment] = useState(() => store.roster.length === 0)
  const required = initialRecruitment ? 2 : 1
  const [activeIndex, setActiveIndex] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const candidates = useMemo(() => {
    const recruited = new Set(store.roster.map(member => Number(member.character_template_id)).filter(Boolean))
    const available = new Set(getGanguesAvailableCharacterIds({
      campaignClears: store.campaignClears,
      storyProgress: store.storyProgress,
      rep: store.rep,
      eventCharacterIds: store.eventCharacterIds,
    }))
    return GANGUES_CHARACTER_CATALOG.filter(character => available.has(character.id) && !recruited.has(character.id))
  }, [store.roster, store.campaignClears, store.storyProgress, store.rep, store.eventCharacterIds])

  const detail = candidates.find(character => character.id === detailId) || null
  const at = offset => candidates[(activeIndex + offset + candidates.length) % candidates.length]
  const slides = candidates.length > 1
    ? [{ character: at(-1), position: 'prev' }, { character: at(0), position: 'current' }, { character: at(1), position: 'next' }]
    : candidates.map(character => ({ character, position: 'current' }))

  useEffect(() => {
    const close = event => { if (event.key === 'Escape') setDetailId(null) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const move = direction => {
    if (candidates.length < 2) return
    sfx.select()
    setActiveIndex(index => (index + direction + candidates.length) % candidates.length)
  }

  const openSheet = character => {
    sfx.click()
    setDetailId(character.id)
  }

  const toggleSelection = character => {
    const selected = selectedIds.includes(character.id)
    if (selected) setSelectedIds(ids => ids.filter(id => id !== character.id))
    else if (selectedIds.length < required) setSelectedIds(ids => [...ids, character.id])
    else setSelectedIds(ids => [...ids.slice(1), character.id])
    sfx.select()
    setDetailId(null)
  }

  const confirmRecruitment = async () => {
    if (selectedIds.length !== required || saving) return
    setSaving(true)
    setError('')
    const saved = []
    for (const characterId of selectedIds) {
      const member = await store.recruitTemplate(characterId, user?.id)
      if (!member) break
      saved.push(member)
    }
    setSaving(false)
    if (saved.length !== required) {
      setError(t('games.gangues.party.save_error'))
      return
    }
    store.setActiveParty([...store.activeParty, ...saved].slice(0, 2))
    sfx.reward()
    onCreated?.(saved[saved.length - 1])
    if (!onCreated) onNavigate('lobby')
  }

  return (
    <main className="gang-recruit">
      <header className="gang-recruit__head">
        <button className="gang-recruit__back" onClick={() => onNavigate('lobby')} aria-label={t('games.gangues.btn_voltar')}>←</button>
        <span className="if-eyebrow">IF // {t('games.gangues.recruitment.eyebrow')}</span>
        <h1>{initialRecruitment ? t('games.gangues.recruitment.title_initial') : t('games.gangues.recruitment.title')}</h1>
        <p>{t(`games.gangues.recruitment.${initialRecruitment ? 'subtitle_initial' : 'subtitle'}`, { n: required })}</p>
      </header>

      <section className="gang-recruit__stage" aria-label={t('games.gangues.recruitment.candidates')}>
        <div className="gang-recruit__street" aria-hidden="true"><i /><i /><i /></div>
        <button className="gang-recruit__arrow gang-recruit__arrow--left" onClick={() => move(-1)} aria-label={t('games.gangues.recruitment.previous')}>‹</button>
        <div className="gang-recruit__slides">
          {slides.map(({ character, position }) => {
            const selected = selectedIds.includes(character.id)
            return (
              <motion.button
                key={`${position}-${character.id}`}
                className={`gang-fighter-card gang-fighter-card--${position} gang-fighter-card--${character.combat_path}${selected ? ' gang-fighter-card--selected' : ''}`}
                onClick={() => position === 'current' ? openSheet(character) : move(position === 'prev' ? -1 : 1)}
                initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
              >
                <span className="gang-fighter-card__number">#{String(character.id).padStart(2, '0')}</span>
                {selected && <span className="gang-fighter-card__selected">✓ {t('games.gangues.recruitment.marked')}</span>}
                <span className="gang-fighter-card__portrait" aria-hidden="true"><i>{character.name[0]}</i><b>{PATH_MARKS[character.combat_path]}</b></span>
                <span className="gang-fighter-card__copy"><small>{t(`games.gangues.loadout.paths.${character.combat_path}.name`)}</small><strong>{character.name}</strong><em>{t(`games.gangues.progression.paths.${character.special_path}`)}</em></span>
                <span className="gang-fighter-card__cta">{t('games.gangues.recruitment.open_sheet')} →</span>
              </motion.button>
            )
          })}
        </div>
        <button className="gang-recruit__arrow gang-recruit__arrow--right" onClick={() => move(1)} aria-label={t('games.gangues.recruitment.next')}>›</button>
      </section>

      <div className="gang-recruit__dots">{candidates.map((character, index) => <button key={character.id} className={index === activeIndex ? 'is-active' : ''} onClick={() => setActiveIndex(index)} aria-label={character.name} />)}</div>

      <section className="gang-recruit__picks">
        <div><span>{t('games.gangues.recruitment.your_picks')}</span><strong>{selectedIds.length}/{required}</strong></div>
        <div className="gang-recruit__slots">
          {Array.from({ length: required }, (_, index) => {
            const character = candidates.find(item => item.id === selectedIds[index])
            return <button key={index} disabled={!character} onClick={() => character && openSheet(character)} className={character ? 'is-filled' : ''}>{character ? <><b>{character.name[0]}</b><span>{character.name}</span><i>✓</i></> : <><b>+</b><span>{t('games.gangues.recruitment.empty_slot')}</span></>}</button>
          })}
        </div>
        {error && <p className="gang-err">{error}</p>}
        <button className="gang-recruit__confirm" disabled={selectedIds.length !== required || saving} onClick={confirmRecruitment}>{saving ? t('games.gangues.carregando') : t('games.gangues.recruitment.confirm', { n: required })}</button>
      </section>

      <AnimatePresence>
        {detail && <motion.div className="gang-sheet-modal" role="dialog" aria-modal="true" aria-labelledby="gang-sheet-name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="gang-sheet-modal__scrim" onClick={() => setDetailId(null)} aria-label={t('games.gangues.recruitment.close')} />
          <motion.article className={`gang-sheet-modal__card gang-sheet-modal__card--${detail.combat_path}`} initial={{ y: 60, scale: .94 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 24 }}>
            <button className="gang-sheet-modal__close" onClick={() => setDetailId(null)} aria-label={t('games.gangues.recruitment.close')}>×</button>
            <div className="gang-sheet-modal__hero"><span>#{String(detail.id).padStart(2, '0')}</span><i>{detail.name[0]}</i><small>{t(`games.gangues.loadout.paths.${detail.combat_path}.name`)}</small><h2 id="gang-sheet-name">{detail.name}</h2><p>{t(`games.gangues.progression.paths.${detail.special_path}`)}</p></div>
            <div className="gang-sheet-modal__stats">{ATTRIBUTES.map(attribute => <div key={attribute}><span>{t(`games.gangues.attr_labels.${attribute}`)}</span><strong>{detail.base_stats[attribute]}</strong><i>{Array.from({ length: 5 }, (_, index) => <b key={index} className={index < detail.base_stats[attribute] ? 'is-on' : ''} />)}</i></div>)}</div>
            <div className="gang-sheet-modal__resources"><span><small>PV</small><strong>{detail.base_resources.pv_max}</strong></span><span><small>PM</small><strong>{detail.base_resources.pm_max}</strong></span></div>
            <div className="gang-sheet-modal__technique"><small>{t('games.gangues.recruitment.starting_technique')}</small><strong>{t(`games.gangues.progression.skills.${detail.base_technique.id}`)}</strong><span>{detail.base_technique.pm_cost} PM</span></div>
            <button className={`gang-sheet-modal__select${selectedIds.includes(detail.id) ? ' is-selected' : ''}`} onClick={() => toggleSelection(detail)}>{selectedIds.includes(detail.id) ? t('games.gangues.recruitment.remove') : t('games.gangues.recruitment.select')}</button>
          </motion.article>
        </motion.div>}
      </AnimatePresence>
    </main>
  )
}
