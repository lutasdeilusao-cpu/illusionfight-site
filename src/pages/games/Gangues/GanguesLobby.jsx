import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useFichas } from '../../../context/FichasContext'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import NeoGuideDialog from './components/NeoGuideDialog'
import GanguesProgressionPanel from './components/GanguesProgressionPanel'
import { sfx } from '../../../lib/sfx'
import { useGanguesStore, limiteFichasPorTier, podeCriarFicha } from './store/useGanguesStore'
import { GANGUES_INITIAL_PARTY_SIZE, GANGUES_MAX_PARTY_SIZE, getGanguesPartySizeLimit } from './data/ganguesLoadout.js'
import enemiesData from './data/gangues-enemies.json'

const NEOGUIDE_SEEN_KEY = 'ldi-gangues-neoguide-seen'

function pickEnemyTeam(pool, size) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const team = shuffled.slice(0, size)
  while (team.length < size && pool.length) team.push(pool[Math.floor(Math.random() * pool.length)])
  return team
}

export default function GanguesLobby({ onNavigate }) {
  const { t } = useLanguage()
  const { user, perfil } = useAuth()
  const { isAdmin } = useFichas()
  const store = useGanguesStore()
  const [loading, setLoading] = useState(Boolean(user))
  const [choosingEnemy, setChoosingEnemy] = useState(false)
  const [showNeoGuide, setShowNeoGuide] = useState(false)
  const roster = store.roster
  const party = store.activeParty
  const rosterLimit = limiteFichasPorTier(perfil?.tier)
  const totalXp = roster.reduce((sum, member) => sum + (member.xp_total || 0), 0)
  const partyLimit = getGanguesPartySizeLimit(totalXp)
  const progressionMember = party[0]

  const applyProgression = async (member, change) => {
    if (!member || !change) return
    store.loadSheet(member)
    store.updateSheet(change)
    if (user?.id) await store.saveToCloud(user.id)
    else store.updateRosterSheet(member.id, change)
  }

  useEffect(() => {
    store.setEnemyCatalog(enemiesData)
    if (!user) { setLoading(false); return }
    store.loadSheets(user.id).finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (loading || roster.length > 0) return
    try { if (!localStorage.getItem(NEOGUIDE_SEEN_KEY)) setShowNeoGuide(true) } catch { setShowNeoGuide(true) }
  }, [loading, roster.length])

  const dismissNeoGuide = () => {
    try { localStorage.setItem(NEOGUIDE_SEEN_KEY, '1') } catch {}
    setShowNeoGuide(false)
  }

  const startCreation = () => {
    if (!podeCriarFicha(perfil, roster.length)) return
    sfx.click()
    store.newSheet()
    onNavigate('create')
  }

  const toggleParty = (member) => {
    const selected = party.some(item => item.id === member.id)
    if (selected) { store.setActiveParty(party.filter(item => item.id !== member.id)); return }
    if (party.length >= partyLimit) return
    sfx.select()
    store.setActiveParty([...party, member])
  }

  const unlocked = new Set(party.flatMap(member => member.enemies_unlocked || ['treinamento']))
  const enemyPool = enemiesData.filter(enemy => unlocked.has(enemy.id))

  const startBattle = (enemy) => {
    store.loadSheet(party[0])
    const others = enemyPool.filter(item => item.id !== enemy.id)
    const extra = pickEnemyTeam(others.length ? others : [enemy], Math.max(0, party.length - 1))
    store.startMatch(enemy, [enemy, ...extra])
    sfx.vs()
    onNavigate('combat')
  }

  if (loading) return <main className="gang-lobby"><div className="gang-lobby-empty">{t('games.gangues.carregando')}</div></main>

  if (choosingEnemy) return (
    <main className="gang-lobby">
      <header className="gang-lobby-hero gang-lobby-hero--enemies">
        <p className="gang-lobby-titulo">{t('games.gangues.party.single_title')}</p>
        <h1 className="gang-lobby-nome gang-lobby-nome--enemy">{party.length} × {party.length}</h1>
        <p className="gang-lobby-sub">{t('games.gangues.party.enemy_team_desc')}</p>
      </header>
      <div className="gang-lobby-divider" />
      <p className="gang-lobby-section-label">{t('games.gangues.escolha_oponente')}</p>
      <div className="gang-sheet-list">
        {enemyPool.map(enemy => (
          <button key={enemy.id} className="gang-sheet-card-v gang-sheet-card-v--enemy" onClick={() => startBattle(enemy)}>
            <span className="gang-sheet-avatar">{t(`games.gangues.enemy_names.${enemy.id}`)[0]}</span>
            <span className="gang-sheet-info">
              <strong className="gang-sheet-name-v">{t(`games.gangues.enemy_names.${enemy.id}`)}</strong>
              <span className="gang-sheet-meta">{t('games.gangues.party.enemy_duo')} · RANK #{enemy.rank}</span>
              <span className="gang-sheet-stats">{['A', 'H', 'R', 'D'].map(attr => <span key={attr} className="gang-sheet-stat"><span className="gang-sheet-stat-label">{attr}</span><b className="gang-sheet-stat-val">{enemy.stats[attr]}</b></span>)}</span>
            </span>
            <span className="gang-sheet-arrow">→</span>
          </button>
        ))}
      </div>
      <button className="gang-new-sheet gang-new-sheet--back" onClick={() => setChoosingEnemy(false)}>{t('games.gangues.btn_voltar')}</button>
    </main>
  )

  return (
    <main className="gang-lobby">
      <AnimatePresence>
        {showNeoGuide && (
          <NeoGuideDialog lines={t('games.gangues.neoguide.intro')} onFinish={dismissNeoGuide} onSkip={dismissNeoGuide} />
        )}
      </AnimatePresence>
      <header className="gang-lobby-hero">
        <p className="gang-lobby-titulo">{t('games.gangues.modo_standalone')}</p>
        <h1 className="gang-lobby-nome">LDI GANGUES</h1>
        <p className="gang-lobby-sub">{roster.length < GANGUES_INITIAL_PARTY_SIZE ? t('games.gangues.party.subtitle') : t('games.gangues.party.single_desc')}</p>
      </header>
      <div className="gang-lobby-divider" />

      {isAdmin && (
        <button className="gang-training-entry" onClick={() => onNavigate('training')}>
          <span>⚙</span>
          <span><strong>{t('games.gangues.training.entry')}</strong><small>{t('games.gangues.training.entry_desc')}</small></span>
          <b>→</b>
        </button>
      )}

      {roster.length < GANGUES_INITIAL_PARTY_SIZE ? (
        <section className="gang-onboarding-panel">
          <span className="gang-onboarding-step">0{roster.length + 1} / 0{GANGUES_INITIAL_PARTY_SIZE}</span>
          <h2>{t('games.gangues.party.create_member', { n: roster.length + 1 })}</h2>
          <p>{roster.length === 0 ? t('games.gangues.party.onboarding') : t('games.gangues.party.second_member')}</p>
          <button className="gang-new-sheet gang-new-sheet--primary" onClick={startCreation}>
            <span className="gang-new-sheet-icon">+</span>{roster.length === 0 ? t('games.gangues.party.start') : t('games.gangues.party.continue')}
          </button>
        </section>
      ) : (
        <>
          <div className="gang-lobby-section-label gang-lobby-section-label--row"><span>{t('games.gangues.party.roster')}</span><span>{roster.length}/{rosterLimit}</span></div>
          <div className="gang-sheet-list">
            {roster.map(member => {
              const selected = party.some(item => item.id === member.id)
              const unavailable = !selected && party.length >= partyLimit
              return (
                <button key={member.id} disabled={unavailable} className={`gang-sheet-card-v ${selected ? 'gang-sheet-card-v--selected' : ''}`} onClick={() => toggleParty(member)}>
                  <span className="gang-sheet-avatar">{member.sheet_name[0].toUpperCase()}</span>
                  <span className="gang-sheet-info"><strong className="gang-sheet-name-v">{member.sheet_name}</strong><span className="gang-sheet-meta">{t(`games.gangues.loadout.paths.${member.combat_path}.name`)}</span><span className="gang-sheet-stats">{['A', 'H', 'R', 'D'].map(attr => <span key={attr} className="gang-sheet-stat"><span className="gang-sheet-stat-label">{attr}</span><b className="gang-sheet-stat-val">{member.attributes[attr]}</b></span>)}</span></span>
                  <span className="gang-party-status">{selected ? '✓' : '+'}</span>
                </button>
              )
            })}
          </div>
          <p className="gang-party-counter">{t('games.gangues.party_size_atual', { n: party.length, max: partyLimit })}</p>
          {partyLimit < GANGUES_MAX_PARTY_SIZE && <p className="gang-party-counter">{t('games.gangues.party_size_bloqueado')}</p>}
          {progressionMember && <GanguesProgressionPanel member={progressionMember} onApply={applyProgression} />}
          <button className="gang-new-sheet gang-new-sheet--primary" disabled={party.length < GANGUES_INITIAL_PARTY_SIZE} onClick={() => setChoosingEnemy(true)}>{t('games.gangues.party.enter_gangues')}</button>
          {roster.length < rosterLimit && <button className="gang-new-sheet" onClick={startCreation}><span className="gang-new-sheet-icon">+</span>{t('games.gangues.nova_ficha')}</button>}
        </>
      )}
      <BackToGamesBtn />
    </main>
  )
}
