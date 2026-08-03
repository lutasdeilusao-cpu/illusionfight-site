import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'
import { useArenaStore, limiteFichasPorTier, podeCriarFicha } from './store/useArenaStore'
import { ARENA_INITIAL_PARTY_SIZE } from './data/arenaLoadout.js'
import enemiesData from './data/arena-enemies.json'

export default function ArenaLobby({ onNavigate }) {
  const { t } = useLanguage()
  const { user, perfil } = useAuth()
  const store = useArenaStore()
  const [loading, setLoading] = useState(Boolean(user))
  const [choosingEnemy, setChoosingEnemy] = useState(false)
  const roster = store.roster
  const party = store.activeParty
  const rosterLimit = limiteFichasPorTier(perfil?.tier)

  useEffect(() => {
    store.setEnemyCatalog(enemiesData)
    if (!user) { setLoading(false); return }
    store.loadSheets(user.id).finally(() => setLoading(false))
  }, [user])

  const startCreation = () => {
    if (!podeCriarFicha(perfil, roster.length)) return
    sfx.click()
    store.newSheet()
    onNavigate('create')
  }

  const toggleParty = (member) => {
    const selected = party.some(item => item.id === member.id)
    if (selected) { store.setActiveParty(party.filter(item => item.id !== member.id)); return }
    if (party.length >= ARENA_INITIAL_PARTY_SIZE || party.some(item => item.combat_path === member.combat_path)) return
    sfx.select()
    store.setActiveParty([...party, member])
  }

  const unlocked = new Set(party.flatMap(member => member.enemies_unlocked || ['treinamento']))
  const enemies = enemiesData.filter(enemy => unlocked.has(enemy.id))

  const startBattle = (enemy) => {
    store.loadSheet(party[0])
    store.startMatch(enemy, enemies)
    sfx.vs()
    onNavigate('combat')
  }

  if (loading) return <main className="arena-lobby"><div className="arena-lobby-empty">{t('games.arena.carregando')}</div></main>

  if (choosingEnemy) return (
    <main className="arena-lobby">
      <header className="arena-lobby-hero arena-lobby-hero--enemies">
        <p className="arena-lobby-titulo">{t('games.arena.party.single_title')}</p>
        <h1 className="arena-lobby-nome arena-lobby-nome--enemy">2 × 2</h1>
        <p className="arena-lobby-sub">{t('games.arena.party.enemy_team_desc')}</p>
      </header>
      <div className="arena-lobby-divider" />
      <p className="arena-lobby-section-label">{t('games.arena.escolha_oponente')}</p>
      <div className="arena-sheet-list">
        {enemies.map(enemy => (
          <button key={enemy.id} className="arena-sheet-card-v arena-sheet-card-v--enemy" onClick={() => startBattle(enemy)}>
            <span className="arena-sheet-avatar">{t(`games.arena.enemy_names.${enemy.id}`)[0]}</span>
            <span className="arena-sheet-info">
              <strong className="arena-sheet-name-v">{t(`games.arena.enemy_names.${enemy.id}`)}</strong>
              <span className="arena-sheet-meta">{t('games.arena.party.enemy_duo')} · RANK #{enemy.rank}</span>
              <span className="arena-sheet-stats">{['A', 'H', 'R', 'D'].map(attr => <span key={attr} className="arena-sheet-stat"><span className="arena-sheet-stat-label">{attr}</span><b className="arena-sheet-stat-val">{enemy.stats[attr]}</b></span>)}</span>
            </span>
            <span className="arena-sheet-arrow">→</span>
          </button>
        ))}
      </div>
      <button className="arena-new-sheet arena-new-sheet--back" onClick={() => setChoosingEnemy(false)}>{t('games.arena.btn_voltar')}</button>
    </main>
  )

  return (
    <main className="arena-lobby">
      <header className="arena-lobby-hero">
        <p className="arena-lobby-titulo">{t('games.arena.modo_standalone')}</p>
        <h1 className="arena-lobby-nome">LDI ARENA</h1>
        <p className="arena-lobby-sub">{roster.length < 2 ? t('games.arena.party.subtitle') : t('games.arena.party.single_desc')}</p>
      </header>
      <div className="arena-lobby-divider" />

      {roster.length < 2 ? (
        <section className="arena-onboarding-panel">
          <span className="arena-onboarding-step">0{roster.length + 1} / 02</span>
          <h2>{t('games.arena.party.create_member', { n: roster.length + 1 })}</h2>
          <p>{roster.length === 0 ? t('games.arena.party.onboarding') : t('games.arena.party.second_member')}</p>
          <button className="arena-new-sheet arena-new-sheet--primary" onClick={startCreation}>
            <span className="arena-new-sheet-icon">+</span>{roster.length === 0 ? t('games.arena.party.start') : t('games.arena.party.continue')}
          </button>
        </section>
      ) : (
        <>
          <div className="arena-lobby-section-label arena-lobby-section-label--row"><span>{t('games.arena.party.roster')}</span><span>{roster.length}/{rosterLimit}</span></div>
          <div className="arena-sheet-list">
            {roster.map(member => {
              const selected = party.some(item => item.id === member.id)
              const unavailable = !selected && party.some(item => item.combat_path === member.combat_path)
              return (
                <button key={member.id} disabled={unavailable} className={`arena-sheet-card-v ${selected ? 'arena-sheet-card-v--selected' : ''}`} onClick={() => toggleParty(member)}>
                  <span className="arena-sheet-avatar">{member.sheet_name[0].toUpperCase()}</span>
                  <span className="arena-sheet-info"><strong className="arena-sheet-name-v">{member.sheet_name}</strong><span className="arena-sheet-meta">{t(`games.arena.loadout.paths.${member.combat_path}.name`)}</span><span className="arena-sheet-stats">{['A', 'H', 'R', 'D'].map(attr => <span key={attr} className="arena-sheet-stat"><span className="arena-sheet-stat-label">{attr}</span><b className="arena-sheet-stat-val">{member.attributes[attr]}</b></span>)}</span></span>
                  <span className="arena-party-status">{selected ? '✓' : '+'}</span>
                </button>
              )
            })}
          </div>
          <p className="arena-party-counter">{t('games.arena.party.battle_ready', { n: party.length })}</p>
          <button className="arena-new-sheet arena-new-sheet--primary" disabled={party.length !== 2} onClick={() => setChoosingEnemy(true)}>{t('games.arena.party.enter_arena')}</button>
          {roster.length < rosterLimit && <button className="arena-new-sheet" onClick={startCreation}><span className="arena-new-sheet-icon">+</span>{t('games.arena.nova_ficha')}</button>}
        </>
      )}
      <BackToGamesBtn />
    </main>
  )
}
