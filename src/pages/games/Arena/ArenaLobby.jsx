import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'
import { useArenaStore, limiteFichasPorTier, podeCriarFicha } from './store/useArenaStore'
import { ARENA_INITIAL_PARTY_SIZE, ARENA_MAX_PARTY_SIZE, ARENA_MULTIPLAYER_SIZES, hasArenaMultiplayer } from './data/arenaLoadout.js'
import enemiesData from './data/arena-enemies.json'

export default function ArenaLobby({ onNavigate }) {
  const { t } = useLanguage()
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const store = useArenaStore()
  const [loading, setLoading] = useState(Boolean(user))
  const [choosingEnemy, setChoosingEnemy] = useState(false)

  const roster = store.roster
  const party = store.activeParty
  const rosterLimit = limiteFichasPorTier(perfil?.tier)
  const multiplayerEnabled = hasArenaMultiplayer(perfil?.tier)

  useEffect(() => {
    store.setEnemyCatalog(enemiesData)
    if (!user) { setLoading(false); return }
    store.loadSheets(user.id).finally(() => setLoading(false))
  }, [user])

  const startCreation = () => {
    if (!podeCriarFicha(perfil, roster.length)) return
    store.newSheet()
    onNavigate('create')
  }

  const toggleParty = (member) => {
    const selected = party.some(item => item.id === member.id)
    if (selected) { store.setActiveParty(party.filter(item => item.id !== member.id)); return }
    if (party.length >= ARENA_INITIAL_PARTY_SIZE) return
    if (party.some(item => item.combat_path === member.combat_path)) return
    store.setActiveParty([...party, member])
    sfx.select()
  }

  const startBattle = (enemy) => {
    if (party.length !== ARENA_INITIAL_PARTY_SIZE) return
    store.loadSheet(party[0])
    store.startMatch(enemy, enemies)
    sfx.vs()
    onNavigate('combat')
  }

  const unlocked = new Set(party.flatMap(member => member.enemies_unlocked || ['treinamento']))
  const enemies = enemiesData.filter(enemy => unlocked.has(enemy.id))

  if (loading) return <div className="arena-lobby"><p className="arena-lobby-sub">{t('games.arena.carregando')}</p></div>

  return (
    <div className="arena-lobby">
      <header className="arena-lobby-hero arena-lobby-hero--sm">
        <p className="arena-lobby-titulo">{t('games.arena.modo_standalone')}</p>
        <h1 className="arena-lobby-nome">{t('games.arena.party.title')}</h1>
        <p className="arena-lobby-sub">{t('games.arena.party.subtitle')}</p>
      </header>

      <section className="arena-sheet-section">
        <div className="arena-section-title-row">
          <h2 className="arena-section-title">{t('games.arena.party.roster')}</h2>
          <span>{t('games.arena.limite.fichas_usadas', { n: roster.length, limite: rosterLimit })}</span>
        </div>

        {roster.length < 2 && (
          <div className="arena-empty-state">
            <p>{t('games.arena.party.onboarding')}</p>
            <button className="arena-new-sheet-btn" onClick={startCreation}>{t('games.arena.party.create_team')}</button>
          </div>
        )}

        <div className="arena-sheets-grid">
          {roster.map(member => {
            const selected = party.some(item => item.id === member.id)
            const duplicatePath = !selected && party.some(item => item.combat_path === member.combat_path)
            return (
              <button key={member.id} disabled={duplicatePath} className={`arena-sheet-card ${selected ? 'arena-sheet-card--selected' : ''}`} onClick={() => toggleParty(member)}>
                <strong>{member.sheet_name}</strong>
                <span>{t(`games.arena.loadout.paths.${member.combat_path}.name`)}</span>
                <small>{selected ? t('games.arena.party.selected') : duplicatePath ? t('games.arena.party.path_unavailable') : t('games.arena.party.select')}</small>
              </button>
            )
          })}
        </div>

        {roster.length >= 2 && roster.length < rosterLimit && <button className="arena-new-sheet-btn" onClick={startCreation}>+ {t('games.arena.nova_ficha')}</button>}
        <p className="arena-lobby-sub">{t('games.arena.party.progression', { max: ARENA_MAX_PARTY_SIZE })}</p>
      </section>

      <section className="arena-mode-tabs">
        <h2 className="arena-section-title">{t('games.arena.party.single_title')}</h2>
        <p>{t('games.arena.party.single_desc')}</p>
        <button className="arena-lutar-btn" disabled={party.length !== 2} onClick={() => setChoosingEnemy(true)}>
          {t('games.arena.party.battle_ready', { n: party.length })}
        </button>
      </section>

      <section className="arena-mode-tabs">
        <h2 className="arena-section-title">{t('games.arena.party.multiplayer_title')}</h2>
        <p>{multiplayerEnabled ? t('games.arena.party.multiplayer_subscriber') : t('games.arena.party.multiplayer_locked')}</p>
        <div className="arena-actions-row">
          {ARENA_MULTIPLAYER_SIZES.map(size => <button key={size} className="arena-mode-btn" disabled>{t('games.arena.party.multiplayer_size', { n: size })}</button>)}
        </div>
        {multiplayerEnabled ? <small>{t('games.arena.party.multiplayer_coming')}</small> : <button className="arena-new-sheet-btn" onClick={() => navigate('/apoie')}>{t('games.arena.party.see_plans')}</button>}
      </section>

      {choosingEnemy && (
        <section className="arena-enemy-section">
          <h2 className="arena-section-title">{t('games.arena.escolha_oponente')}</h2>
          <p className="arena-lobby-sub">{t('games.arena.party.enemy_team_desc')}</p>
          <div className="arena-enemy-list">
            {enemies.map(enemy => <button key={enemy.id} className="arena-enemy-card" onClick={() => startBattle(enemy)}><strong>{t(`games.arena.enemy_names.${enemy.id}`)}</strong><span>{t('games.arena.party.enemy_duo')}</span></button>)}
          </div>
          <button className="arena-exit-btn" onClick={() => setChoosingEnemy(false)}>{t('games.arena.btn_voltar')}</button>
        </section>
      )}

      <BackToGamesBtn />
    </div>
  )
}
