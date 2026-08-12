import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useFichas } from '../../../context/FichasContext'
import { useLanguage } from '../../../context/LanguageContext'
import { getGanguesProgression } from './data/ganguesLoadout.js'
import { GANGUES_ALL_SPECIALS, getGanguesSpecialPath, getGanguesSpecialPaths } from './data/ganguesSpecials.js'
import { useGanguesStore } from './store/useGanguesStore.js'
import './GanguesTrainingZone.css'

const ATTRIBUTES = ['A', 'H', 'R', 'D']
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0))

export default function GanguesTrainingZone({ onNavigate }) {
  const { user } = useAuth()
  const { isAdmin, loading } = useFichas()
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [selectedId, setSelectedId] = useState(store.activeParty[0]?.id || store.roster[0]?.id || '')
  const [draft, setDraft] = useState(null)
  const [snapshot, setSnapshot] = useState(null)
  const [status, setStatus] = useState('')
  const selected = useMemo(() => store.roster.find(member => member.id === selectedId), [store.roster, selectedId])

  useEffect(() => {
    if (!selected) return
    const progression = getGanguesProgression(selected)
    const next = {
      xp_total: selected.xp_total || 0,
      ap: progression.ap,
      xp_unspent: progression.xp_unspent,
      special_path: progression.special_path,
      attributes: Object.fromEntries(ATTRIBUTES.map(attribute => [attribute, selected.attributes?.[attribute] || 0])),
      special_levels: Object.fromEntries(GANGUES_ALL_SPECIALS.map(special => [special.id, progression.special_levels[special.id] || 0])),
      selected_specials: progression.selected_specials,
    }
    setDraft(next)
    setSnapshot(structuredClone(next))
    setStatus('')
  }, [selectedId, selected])

  if (loading) return <main className="gang-training"><p>{t('games.gangues.carregando')}</p></main>
  if (!isAdmin) return <main className="gang-training gang-training--blocked"><h1>{t('games.gangues.training.denied')}</h1><button onClick={() => onNavigate('lobby')}>{t('games.gangues.btn_voltar')}</button></main>

  const updateNumber = (field, value, max = 999999) => setDraft(current => ({ ...current, [field]: clamp(value, 0, max) }))
  const updateAttribute = (attribute, value) => setDraft(current => ({ ...current, attributes: { ...current.attributes, [attribute]: clamp(value, 0, 99) } }))
  const updateSpecial = (specialId, value) => setDraft(current => {
    const level = clamp(value, 0, 3)
    return {
      ...current,
      special_levels: { ...current.special_levels, [specialId]: level },
      selected_specials: level === 0 ? current.selected_specials.filter(id => id !== specialId) : current.selected_specials,
    }
  })
  const updateSpecialPath = (specialPath) => setDraft(current => ({ ...current, special_path: specialPath, selected_specials: [] }))
  const toggleSpecial = (specialId) => setDraft(current => {
    const equipped = current.selected_specials.includes(specialId)
    if (!equipped && (!current.special_levels[specialId] || current.selected_specials.length >= 2)) return current
    return { ...current, selected_specials: equipped ? current.selected_specials.filter(id => id !== specialId) : [...current.selected_specials, specialId] }
  })

  const persist = async (values, messageKey) => {
    if (!selected || !values) return
    const progression = {
      ...getGanguesProgression(selected),
      ap: values.ap,
      xp_unspent: values.xp_unspent,
      special_path: values.special_path,
      special_levels: values.special_levels,
      selected_specials: values.selected_specials,
    }
    const change = { xp_total: values.xp_total, attributes: { ...selected.attributes, ...values.attributes, progression } }
    store.loadSheet(selected)
    store.updateSheet(change)
    const saved = user?.id ? await store.saveToCloud(user.id) : (store.updateRosterSheet(selected.id, change), true)
    setStatus(t(`games.gangues.training.${saved ? messageKey : 'save_error'}`))
  }

  return (
    <main className="gang-training">
      <header className="gang-training__hero">
        <span>{t('games.gangues.training.admin_badge')}</span>
        <h1>{t('games.gangues.training.title')}</h1>
        <p>{t('games.gangues.training.subtitle')}</p>
      </header>

      {!store.roster.length ? <p className="gang-training__empty">{t('games.gangues.training.empty')}</p> : (
        <>
          <label className="gang-training__select-label" htmlFor="training-character">{t('games.gangues.training.character')}</label>
          <select id="training-character" className="gang-training__select" value={selectedId} onChange={event => setSelectedId(event.target.value)}>
            {store.roster.map(member => <option key={member.id} value={member.id}>{member.sheet_name}</option>)}
          </select>

          {draft && <section className="gang-training__console">
            <h2>{t('games.gangues.training.experience')}</h2>
            <div className="gang-training__fields">
              <label>{t('games.gangues.training.total_xp')}<input type="number" min="0" value={draft.xp_total} onChange={event => updateNumber('xp_total', event.target.value)} /></label>
              <label>{t('games.gangues.training.available_xp')}<input type="number" min="0" value={draft.xp_unspent} onChange={event => updateNumber('xp_unspent', event.target.value)} /></label>
              <label>{t('games.gangues.training.ap')}<input type="number" min="0" max="9" value={draft.ap} onChange={event => updateNumber('ap', event.target.value, 9)} /></label>
            </div>

            <h2>{t('games.gangues.training.attributes')}</h2>
            <div className="gang-training__fields gang-training__fields--attributes">
              {ATTRIBUTES.map(attribute => <label key={attribute}>{attribute}<input type="number" min="0" max="99" value={draft.attributes[attribute]} onChange={event => updateAttribute(attribute, event.target.value)} /></label>)}
            </div>

            <h2>{t('games.gangues.progression.special_path')}</h2>
            <select className="gang-training__select" value={draft.special_path || ''} onChange={event => updateSpecialPath(event.target.value)}>
              {getGanguesSpecialPaths(selected.combat_path).map(item => <option key={item.id} value={item.id}>{t(`games.gangues.progression.paths.${item.id}`)}</option>)}
            </select>

            <h2>{t('games.gangues.training.powers')} <small>{t('games.gangues.training.equipped', { n: draft.selected_specials.length })}</small></h2>
            <div className="gang-training__powers">
              {(getGanguesSpecialPath(selected.combat_path, draft.special_path)?.specials || []).map(special => {
                const level = draft.special_levels[special.id]
                const equipped = draft.selected_specials.includes(special.id)
                return <article key={special.id} className={equipped ? 'gang-training__power gang-training__power--equipped' : 'gang-training__power'}>
                  <strong>{t(`games.gangues.progression.skills.${special.id}`)}</strong>
                  <label>{t('games.gangues.training.level')}<select value={level} onChange={event => updateSpecial(special.id, event.target.value)}>{[0, 1, 2, 3].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
                  <button disabled={!level || (!equipped && draft.selected_specials.length >= 2)} onClick={() => toggleSpecial(special.id)}>{t(`games.gangues.progression.${equipped ? 'unequip' : 'equip'}`)}</button>
                </article>
              })}
            </div>

            {status && <p className="gang-training__status" role="status">{status}</p>}
            <div className="gang-training__actions">
              <button className="gang-training__save" onClick={() => persist(draft, 'saved')}>{t('games.gangues.training.save')}</button>
              <button onClick={() => { setDraft(structuredClone(snapshot)); setStatus(t('games.gangues.training.restored')) }}>{t('games.gangues.training.restore')}</button>
            </div>
          </section>}
        </>
      )}
      <button className="gang-training__back" onClick={() => onNavigate('lobby')}>← {t('games.gangues.btn_voltar')}</button>
    </main>
  )
}
