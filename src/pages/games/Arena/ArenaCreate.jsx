import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'
import { ARENA_ATTRIBUTE_MAX, ARENA_CREATION_POINTS, ARENA_PATHS, getArenaResources } from './data/arenaLoadout.js'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'

const PATH_MARKS = { atacante: 'A', defensor: 'D', mistico: 'M' }
const ATTRS = ['A', 'H', 'R', 'D']

export default function ArenaCreate({ onNavigate, blockedPaths = [], creationNumber = 1, onCreated }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = useArenaStore()
  const sheet = store.sheet
  const [step, setStep] = useState('path')
  const [error, setError] = useState('')
  const spent = ATTRS.reduce((sum, attr) => sum + (sheet.attributes?.[attr] || 0), 0)
  const remaining = ARENA_CREATION_POINTS - spent

  useEffect(() => { setStep('path'); setError('') }, [creationNumber])

  const selectPath = (id) => {
    if (blockedPaths.includes(id)) return
    sfx.select()
    setError('')
    store.updateSheet({ combat_path: id, attributes: { A: 0, H: 0, R: 0, D: 0 }, loadout_version: 2 })
  }

  const continueToAttributes = () => {
    if (!sheet.sheet_name?.trim()) { setError(t('games.arena.erro_nome')); return }
    if (!ARENA_PATHS.includes(sheet.combat_path)) { setError(t('games.arena.loadout.errors.path')); return }
    setError('')
    setStep('attributes')
  }

  const changeAttribute = (attr, delta) => {
    const current = sheet.attributes?.[attr] || 0
    if (delta > 0 && (remaining <= 0 || current >= ARENA_ATTRIBUTE_MAX)) return
    if (delta < 0 && current <= 0) return
    sfx.select()
    store.updateSheet({ attributes: { ...sheet.attributes, [attr]: current + delta } })
  }

  const save = async () => {
    if (remaining !== 0) { setError(t('games.arena.party.spend_all', { n: remaining })); return }
    if ((sheet.attributes?.R || 0) < 1) { setError(t('games.arena.party.resistance_required')); return }
    const saved = user ? await store.saveToCloud(user.id) : store.addLocalSheet(sheet)
    if (!saved) { setError(t('games.arena.party.save_error')); return }
    onCreated?.(saved)
    if (!onCreated) onNavigate('lobby')
  }

  if (step === 'attributes') {
    const resources = getArenaResources(sheet.combat_path, sheet.attributes?.R)
    return <div className="arena-create">
      <div className="arc-header"><div className="arc-header-center"><p className="arena-lobby-titulo arena-lobby-titulo--sm">{t('games.arena.party.distribute_title')}</p><p className="arc-header-name">{sheet.sheet_name}</p></div></div>
      <div className="arc-step">
        <div className="arc-points-console"><span>{t(`games.arena.loadout.paths.${sheet.combat_path}.name`)}</span><strong>{remaining}</strong><small>{t('games.arena.party.points_remaining')}</small></div>
        <div className="arc-attr-list">
          {ATTRS.map(attr => <div key={attr} className="arc-attr-card"><div className="arc-attr-avatar">{attr}</div><div className="arc-attr-info"><div className="arc-attr-name">{t(`games.arena.attr_labels.${attr}`)}</div><div className="arc-attr-desc">{t(`games.arena.attr_desc.${attr}`)}</div></div><div className="arc-attr-controls"><button className="arc-attr-btn" disabled={(sheet.attributes?.[attr] || 0) <= 0} onClick={() => changeAttribute(attr, -1)}>−</button><span className="arc-attr-val">{sheet.attributes?.[attr] || 0}</span><button className="arc-attr-btn" disabled={remaining <= 0 || (sheet.attributes?.[attr] || 0) >= ARENA_ATTRIBUTE_MAX} onClick={() => changeAttribute(attr, 1)}>+</button></div></div>)}
        </div>
        <div className="arc-resource-preview"><span>PV <b>{resources.pvMax}</b></span><span>PM <b>{resources.pmMax}</b></span></div>
        {error && <p className="arena-err">{error}</p>}
        <div className="arc-nav"><BackToGamesBtn onClick={() => { setError(''); setStep('path') }} label={t('games.arena.btn_voltar')} /><button className="arc-btn-salvar" onClick={save}>{t('games.arena.party.finish_member')}</button></div>
      </div>
    </div>
  }

  return <div className="arena-create">
    <div className="arc-header"><div className="arc-header-center"><p className="arena-lobby-titulo arena-lobby-titulo--sm">{t('games.arena.loadout.path_title')}</p></div></div>
    <div className="arc-step">
      <div className="arc-name-hero arc-name-hero--simple"><div className="arc-name-avatar arc-name-avatar--neutral">{sheet.sheet_name ? sheet.sheet_name[0].toUpperCase() : '?'}</div><input className="arc-name-input" value={sheet.sheet_name || ''} onChange={event => store.updateSheet({ sheet_name: event.target.value })} placeholder={t('games.arena.placeholder_nome')} autoFocus /></div>
      <div className="arc-loadout-grid arc-loadout-grid--styles">{ARENA_PATHS.map(id => <button key={id} disabled={blockedPaths.includes(id)} className={`arc-loadout-card ${sheet.combat_path === id ? 'arc-loadout-card--active' : ''}`} onClick={() => selectPath(id)}><span className="arc-path-mark">{PATH_MARKS[id]}</span><span className="arc-path-copy"><strong>{t(`games.arena.loadout.paths.${id}.name`)}</strong><span className="arc-path-resource">{t('games.arena.loadout.resource_rate', getArenaResources(id, 1))}</span>{blockedPaths.includes(id) && <span className="arc-path-blocked">{t('games.arena.party.path_unavailable')}</span>}</span><span className="arc-path-check">{sheet.combat_path === id ? '✓' : '→'}</span></button>)}</div>
      {error && <p className="arena-err">{error}</p>}
      <div className="arc-nav"><BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.arena.btn_voltar')} /><button className="arc-btn-salvar" onClick={continueToAttributes}>{t('games.arena.btn_proximo')}</button></div>
    </div>
  </div>
}
