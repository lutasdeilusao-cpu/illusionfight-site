import { useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useGanguesStore } from './store/useGanguesStore'
import { GANGUES_CHARACTER_CATALOG, getGanguesAvailableCharacterIds, getGanguesCharacter } from './data/ganguesCharacters.js'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'

const PATH_MARKS = { atacante: 'A', defensor: 'D', mistico: 'M' }

export default function GanguesCreate({ onNavigate, onCreated }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = useGanguesStore()
  const [selectedId, setSelectedId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const recruitedIds = useMemo(() => new Set(store.roster.map(member => Number(member.character_template_id)).filter(Boolean)), [store.roster])
  const availableIds = useMemo(() => new Set(getGanguesAvailableCharacterIds({
    campaignClears: store.campaignClears,
    storyProgress: store.storyProgress,
    rep: store.rep,
    eventCharacterIds: store.eventCharacterIds,
  })), [store.campaignClears, store.storyProgress, store.rep, store.eventCharacterIds])
  const selected = getGanguesCharacter(selectedId)

  const choose = id => {
    if (!availableIds.has(id) || recruitedIds.has(id)) return
    sfx.select()
    setSelectedId(id)
    setError('')
  }

  const recruit = async () => {
    if (!selected) return
    setSaving(true)
    const saved = await store.recruitTemplate(selected.id, user?.id)
    setSaving(false)
    if (!saved) { setError(t('games.gangues.party.save_error')); return }
    sfx.reward()
    onCreated?.(saved)
    if (!onCreated) onNavigate('lobby')
  }

  return (
    <main className="gang-create gang-character-select">
      <header className="gc-header"><div className="gc-header-center">
        <p className="gang-lobby-titulo gang-lobby-titulo--sm">{t('games.gangues.escolha_lutador')}</p>
        <p className="gc-header-name">{store.roster.length}/10</p>
      </div></header>

      <div className="gang-character-grid">
        {GANGUES_CHARACTER_CATALOG.map(character => {
          const available = availableIds.has(character.id)
          const recruited = recruitedIds.has(character.id)
          return (
            <button key={character.id} type="button" disabled={!available || recruited}
              className={`gang-character-card${selectedId === character.id ? ' gang-character-card--selected' : ''}${!available ? ' gang-character-card--locked' : ''}`}
              onClick={() => choose(character.id)}>
              <span className={`gang-character-mark gang-path--${character.combat_path}`}>{available ? PATH_MARKS[character.combat_path] : '🔒'}</span>
              <strong>{available ? character.name : `#${String(character.id).padStart(2, '0')}`}</strong>
              <small>{available ? t(`games.gangues.loadout.paths.${character.combat_path}.name`) : t('games.gangues.progression.unlock_path_first')}</small>
              {recruited && <b>✓</b>}
            </button>
          )
        })}
      </div>

      {selected && <section className="gang-character-detail">
        <div className={`gang-character-detail-avatar gang-path--${selected.combat_path}`}>{selected.name[0]}</div>
        <div><span>#{String(selected.id).padStart(2, '0')}</span><h2>{selected.name}</h2><p>{t(`games.gangues.progression.paths.${selected.special_path}`)}</p></div>
        <div className="gang-character-stats">{Object.entries(selected.base_stats).map(([attribute, value]) => <span key={attribute}><small>{attribute}</small><b>{value}</b></span>)}</div>
        <div className="gang-character-technique"><strong>{t(`games.gangues.progression.skills.${selected.base_technique.id}`)}</strong><span>{selected.base_technique.pm_cost} PM</span></div>
      </section>}

      {error && <p className="gang-err">{error}</p>}
      <div className="gc-nav">
        <BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.gangues.btn_voltar')} />
        <button className="gc-btn-salvar" disabled={!selected || saving} onClick={recruit}>{t('games.gangues.report.recrutar')}</button>
      </div>
    </main>
  )
}
