import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useFichas } from '../../../context/FichasContext'
import { useLanguage } from '../../../context/LanguageContext'
import { getGanguesProgression } from './data/ganguesLoadout.js'
import { useGanguesStore } from './store/useGanguesStore.js'
import './GanguesTrainingZone.css'

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0))

const createPublicTestSheet = (id, sheetName, combatPath) => ({
  id,
  sheet_name: sheetName,
  attributes: { A: 1, H: 1, R: 1, D: 1, progression: {} },
  elemental: 'neutro',
  combat_path: combatPath,
  loadout_version: 2,
  xp_total: 0,
  enemies_unlocked: ['treinamento'],
})

export default function GanguesTrainingZone({ onNavigate, publicAccess = false }) {
  const { user } = useAuth()
  const { isAdmin, loading } = useFichas()
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [selectedId, setSelectedId] = useState(store.activeParty[0]?.id || store.roster[0]?.id || '')
  const [xpToAdd, setXpToAdd] = useState(0)
  const [status, setStatus] = useState('')
  const selected = useMemo(() => store.roster.find(member => member.id === selectedId), [store.roster, selectedId])

  useEffect(() => {
    if (!publicAccess || store.roster.length) return
    const first = store.addLocalSheet(createPublicTestSheet('public-training-defender', `${t('games.gangues.training.character')} 1`, 'defensor'))
    const second = store.addLocalSheet(createPublicTestSheet('public-training-mystic', `${t('games.gangues.training.character')} 2`, 'mistico'))
    store.setActiveParty([first, second])
    setSelectedId(first.id)
  }, [publicAccess, store.roster.length, t])

  useEffect(() => { setXpToAdd(0); setStatus('') }, [selectedId])

  if (!publicAccess && loading) return <main className="gang-training"><p>{t('games.gangues.carregando')}</p></main>
  if (!publicAccess && !isAdmin) return <main className="gang-training gang-training--blocked"><h1>{t('games.gangues.training.denied')}</h1><button onClick={() => onNavigate('lobby')}>{t('games.gangues.btn_voltar')}</button></main>

  const grantXp = async () => {
    const amount = clamp(xpToAdd, 0, 999999)
    if (!selected || amount <= 0) return
    const progression = getGanguesProgression(selected)
    const change = {
      xp_total: (selected.xp_total || 0) + amount,
      attributes: { ...selected.attributes, progression: { ...progression, xp_unspent: progression.xp_unspent + amount } },
    }
    store.loadSheet(selected)
    store.updateSheet(change)
    const saved = user?.id ? await store.saveToCloud(user.id) : (store.updateRosterSheet(selected.id, change), true)
    setStatus(t(`games.gangues.training.${saved ? 'xp_granted' : 'save_error'}`, { n: amount }))
    if (saved) setXpToAdd(0)
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

          {selected && <section className="gang-training__console">
            <h2>{t('games.gangues.training.grant_xp')}</h2>
            <div className="gang-training__xp-summary">
              <span>{t('games.gangues.training.total_xp')}</span><strong>{selected.xp_total || 0}</strong>
              <span>{t('games.gangues.training.available_xp')}</span><strong>{getGanguesProgression(selected).xp_unspent}</strong>
            </div>
            <label className="gang-training__xp-input">{t('games.gangues.training.xp_to_add')}<input type="number" min="0" max="999999" inputMode="numeric" value={xpToAdd} onChange={event => setXpToAdd(clamp(event.target.value, 0, 999999))} /></label>
            <p className="gang-training__xp-help">{t('games.gangues.training.xp_help')}</p>

            {status && <p className="gang-training__status" role="status">{status}</p>}
            <div className="gang-training__actions">
              <button className="gang-training__save" disabled={xpToAdd <= 0} onClick={grantXp}>{t('games.gangues.training.add_xp')}</button>
              <button onClick={() => { setXpToAdd(0); setStatus('') }}>{t('games.gangues.training.clear')}</button>
            </div>
          </section>}
        </>
      )}
      <button className="gang-training__back" onClick={() => onNavigate('lobby')}>← {t('games.gangues.btn_voltar')}</button>
    </main>
  )
}
