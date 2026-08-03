import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useGanguesStore } from './store/useGanguesStore'
import { GANGUES_ATTRIBUTE_MAX, GANGUES_CREATION_POINTS, GANGUES_PATHS, getGanguesResources } from './data/ganguesLoadout.js'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'

const PATH_MARKS = { atacante: 'A', defensor: 'D', mistico: 'M' }
const ATTRS = ['A', 'H', 'R', 'D']

export default function GanguesCreate({ onNavigate, blockedPaths = [], creationNumber = 1, onCreated }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = useGanguesStore()
  const sheet = store.sheet
  const [step, setStep] = useState('path')
  const [error, setError] = useState('')
  const spent = ATTRS.reduce((sum, attr) => sum + (sheet.attributes?.[attr] || 0), 0)
  const remaining = GANGUES_CREATION_POINTS - spent

  useEffect(() => { setStep('path'); setError('') }, [creationNumber])

  const selectPath = (id) => {
    if (blockedPaths.includes(id)) return
    sfx.select()
    setError('')
    store.updateSheet({ combat_path: id, attributes: { A: 0, H: 0, R: 0, D: 0 }, loadout_version: 2 })
  }

  const continueToAttributes = () => {
    if (!sheet.sheet_name?.trim()) { setError(t('games.gangues.erro_nome')); return }
    if (!GANGUES_PATHS.includes(sheet.combat_path)) { setError(t('games.gangues.loadout.errors.path')); return }
    setError('')
    setStep('attributes')
  }

  const changeAttribute = (attr, delta) => {
    const current = sheet.attributes?.[attr] || 0
    if (delta > 0 && (remaining <= 0 || current >= GANGUES_ATTRIBUTE_MAX)) return
    if (delta < 0 && current <= 0) return
    sfx.select()
    store.updateSheet({ attributes: { ...sheet.attributes, [attr]: current + delta } })
  }

  const save = async () => {
    if (remaining !== 0) { setError(t('games.gangues.party.spend_all', { n: remaining })); return }
    if ((sheet.attributes?.R || 0) < 1) { setError(t('games.gangues.party.resistance_required')); return }
    const saved = user ? await store.saveToCloud(user.id) : store.addLocalSheet(sheet)
    if (!saved) { setError(t('games.gangues.party.save_error')); return }
    onCreated?.(saved)
    if (!onCreated) onNavigate('lobby')
  }

  if (step === 'attributes') {
    const resources = getGanguesResources(sheet.combat_path, sheet.attributes?.R)
    return <div className="gang-create">
      <div className="gc-header"><div className="gc-header-center"><p className="gang-lobby-titulo gang-lobby-titulo--sm">{t('games.gangues.party.distribute_title')}</p><p className="gc-header-name">{sheet.sheet_name}</p></div></div>
      <div className="gc-step">
        <div className="gc-points-console"><span>{t(`games.gangues.loadout.paths.${sheet.combat_path}.name`)}</span><strong>{remaining}</strong><small>{t('games.gangues.party.points_remaining')}</small></div>
        <div className="gc-attr-list">
          {ATTRS.map(attr => <div key={attr} className="gc-attr-card"><div className="gc-attr-avatar">{attr}</div><div className="gc-attr-info"><div className="gc-attr-name">{t(`games.gangues.attr_labels.${attr}`)}</div><div className="gc-attr-desc">{t(`games.gangues.attr_desc.${attr}`)}</div></div><div className="gc-attr-controls"><button className="gc-attr-btn" disabled={(sheet.attributes?.[attr] || 0) <= 0} onClick={() => changeAttribute(attr, -1)}>−</button><span className="gc-attr-val">{sheet.attributes?.[attr] || 0}</span><button className="gc-attr-btn" disabled={remaining <= 0 || (sheet.attributes?.[attr] || 0) >= GANGUES_ATTRIBUTE_MAX} onClick={() => changeAttribute(attr, 1)}>+</button></div></div>)}
        </div>
        <div className="gc-resource-preview"><span>PV <b>{resources.pvMax}</b></span><span>PM <b>{resources.pmMax}</b></span></div>
        {error && <p className="gang-err">{error}</p>}
        <div className="gc-nav"><BackToGamesBtn onClick={() => { setError(''); setStep('path') }} label={t('games.gangues.btn_voltar')} /><button className="gc-btn-salvar" onClick={save}>{t('games.gangues.party.finish_member')}</button></div>
      </div>
    </div>
  }

  return <div className="gang-create">
    <div className="gc-header"><div className="gc-header-center"><p className="gang-lobby-titulo gang-lobby-titulo--sm">{t('games.gangues.loadout.path_title')}</p></div></div>
    <div className="gc-step">
      <div className="gc-name-hero gc-name-hero--simple"><div className="gc-name-avatar gc-name-avatar--neutral">{sheet.sheet_name ? sheet.sheet_name[0].toUpperCase() : '?'}</div><input className="gc-name-input" value={sheet.sheet_name || ''} onChange={event => store.updateSheet({ sheet_name: event.target.value })} placeholder={t('games.gangues.placeholder_nome')} autoFocus /></div>
      <div className="gc-loadout-grid gc-loadout-grid--styles">{GANGUES_PATHS.map(id => <button key={id} disabled={blockedPaths.includes(id)} className={`gc-loadout-card ${sheet.combat_path === id ? 'gc-loadout-card--active' : ''}`} onClick={() => selectPath(id)}><span className="gc-path-mark">{PATH_MARKS[id]}</span><span className="gc-path-copy"><strong>{t(`games.gangues.loadout.paths.${id}.name`)}</strong><span className="gc-path-resource">{t('games.gangues.loadout.resource_rate', getGanguesResources(id, 1))}</span>{blockedPaths.includes(id) && <span className="gc-path-blocked">{t('games.gangues.party.path_unavailable')}</span>}</span><span className="gc-path-check">{sheet.combat_path === id ? '✓' : '→'}</span></button>)}</div>
      {error && <p className="gang-err">{error}</p>}
      <div className="gc-nav"><BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.gangues.btn_voltar')} /><button className="gc-btn-salvar" onClick={continueToAttributes}>{t('games.gangues.btn_proximo')}</button></div>
    </div>
  </div>
}
