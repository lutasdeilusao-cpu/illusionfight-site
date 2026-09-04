import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useFichas } from '../../../context/FichasContext'
import { useNavigate } from 'react-router-dom'
import NeoGuideDialog from './components/NeoGuideDialog'
import { sfx } from '../../../lib/sfx'
import { useGanguesStore, limiteFichasPorTier, podeCriarFicha } from './store/useGanguesStore'
import { GANGUES_INITIAL_PARTY_SIZE, GANGUES_MAX_PARTY_SIZE, getGanguesPartySizeLimit, getGanguesProgression } from './data/ganguesLoadout.js'
import { getGanguesSpecials } from './data/ganguesSpecials.js'
import enemiesData from './data/gangues-enemies.json'

/** Nomes dos lutadores da party que têm poder ATIVO comprado mas ainda com
 *  vaga livre pra equipar. Sem equipar, eles só usam ataque normal. */
function lutadoresComPoderPraEquipar(party) {
  return party
    .filter(member => {
      const prog = getGanguesProgression(member)
      if ((prog.selected_specials?.length || 0) >= 2) return false
      const specials = getGanguesSpecials(member)
      return specials.some(s =>
        s.kind === 'active' &&
        (prog.special_levels?.[s.id] || 0) > 0 &&
        !prog.selected_specials?.includes(s.id))
    })
    .map(member => member.sheet_name)
}
import './GanguesLobby.css'
import './GanguesProgressionFlow.css'

const NEOGUIDE_SEEN_KEY = 'ldi-gangues-neoguide-seen'

function pickEnemyTeam(pool, size) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const team = shuffled.slice(0, size)
  while (team.length < size && pool.length) team.push(pool[Math.floor(Math.random() * pool.length)])
  return team
}

export default function GanguesLobby({ onNavigate }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, perfil } = useAuth()
  const { isAdmin } = useFichas()
  const store = useGanguesStore()
  const [loading, setLoading] = useState(Boolean(user))
  const [choosingEnemy, setChoosingEnemy] = useState(false)
  const [showNeoGuide, setShowNeoGuide] = useState(false)
  const [avisoParty, setAvisoParty] = useState('')
  const [avisoPoderes, setAvisoPoderes] = useState(null) // { nomes } — poderes por equipar
  const roster = store.roster
  const party = store.activeParty
  const rosterLimit = limiteFichasPorTier(perfil?.tier)
  const totalXp = roster.reduce((sum, member) => sum + (member.xp_total || 0), 0)
  const partyLimit = getGanguesPartySizeLimit(totalXp)

  // Abre a tela dedicada de progressão pra essa ficha.
  const abrirProgressao = (member) => {
    sfx.click()
    store.setProgressionTarget(member.id)
    onNavigate('progression')
  }

  const deleteProgressionMember = async (member) => {
    if (!member || !window.confirm(t('games.gangues.progression.delete_confirm', { name: member.sheet_name }))) return
    await store.deleteSheet(member.id)
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

  // Clicar no card só seleciona/deseleciona pra batalha. A progressão é
  // uma parada consciente pelo botão LEVEL UP — nunca por engano.
  const handleSheetClick = (member) => { setAvisoParty(''); toggleParty(member) }

  // O botão de batalha só avisa quando falta lutador — nunca bloqueia a tela.
  const tentarBatalha = () => {
    if (roster.length < GANGUES_INITIAL_PARTY_SIZE) {
      sfx.cancel(); setAvisoParty(t('games.gangues.party.need_two', { n: roster.length })); return
    }
    if (party.length < GANGUES_INITIAL_PARTY_SIZE) {
      sfx.cancel(); setAvisoParty(t('games.gangues.party.select_two', { n: party.length })); return
    }
    setAvisoParty('')

    // Poderes ativos comprados mas não equipados: em batalha só sobra o
    // ataque normal. Avisa antes — dá pra equipar diferente por confronto.
    const nomes = lutadoresComPoderPraEquipar(party)
    if (nomes.length > 0) {
      sfx.notification?.()
      setAvisoPoderes({ nomes })
      return
    }
    setChoosingEnemy(true)
  }

  const equiparAgora = () => {
    const alvo = party.find(m => avisoPoderes?.nomes.includes(m.sheet_name)) || party[0]
    setAvisoPoderes(null)
    if (alvo) abrirProgressao(alvo)
  }
  const entrarAssimMesmo = () => { setAvisoPoderes(null); setChoosingEnemy(true) }

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

      {/* Onboarding só quando o elenco está VAZIO. Com 1 ficha, o jogador
          continua vendo a lista pra poder excluir também a última — nunca
          é empurrado pra criação por ter deletado alguém. */}
      {roster.length === 0 ? (
        <section className="gang-onboarding-panel">
          <span className="gang-onboarding-step">01 / 0{GANGUES_INITIAL_PARTY_SIZE}</span>
          <h2>{t('games.gangues.party.create_member', { n: 1 })}</h2>
          <p>{t('games.gangues.party.onboarding')}</p>
          <button className="gang-new-sheet gang-new-sheet--primary" onClick={startCreation}>
            <span className="gang-new-sheet-icon">+</span>{t('games.gangues.party.start')}
          </button>
        </section>
      ) : (
        <>
          {/* Modo história — o jeito principal de jogar: dominar Marelia
              território por território no mapa. É o destaque do lobby. */}
          <button className="gang-story-entry" onClick={() => { sfx.select?.(); onNavigate('story') }}>
            <span className="if-eyebrow">IF // MARELIA</span>
            <span className="gang-story-entry-head">
              <span className="gang-story-entry-icon">🗺</span>
              <strong>{t('games.gangues.story.entry')}</strong>
            </span>
            <small>{t('games.gangues.story.entry_desc')}</small>
            <span className="gang-story-entry-cta">{t('games.gangues.story.entry_cta')} <b>→</b></span>
          </button>

          <div className="gang-lobby-section-label gang-lobby-section-label--row"><span>{t('games.gangues.party.roster')}</span><span>{roster.length}/{rosterLimit}</span></div>
          <div className="gang-sheet-list">
            {roster.map(member => {
              const selected = party.some(item => item.id === member.id)
              const unavailable = !selected && party.length >= partyLimit
              const xpDisponivel = getGanguesProgression(member).xp_unspent
              return (
                <div key={member.id} className="gang-sheet-card-shell">
                  <button disabled={unavailable} className={`gang-sheet-card-v ${selected ? 'gang-sheet-card-v--selected' : ''}`} onClick={() => handleSheetClick(member)}>
                    <span className="gang-sheet-avatar">{member.sheet_name[0].toUpperCase()}</span>
                    <span className="gang-sheet-info"><strong className="gang-sheet-name-v">{member.sheet_name}</strong><span className="gang-sheet-meta">{t(`games.gangues.loadout.paths.${member.combat_path}.name`)}</span><span className="gang-sheet-stats">{['A', 'H', 'R', 'D'].map(attr => <span key={attr} className="gang-sheet-stat"><span className="gang-sheet-stat-label">{attr}</span><b className="gang-sheet-stat-val">{member.attributes[attr]}</b></span>)}</span></span>
                    <span className="gang-party-status">{selected ? '✓' : '+'}</span>
                  </button>
                  <div className="gang-sheet-card-side">
                    <button className="gang-sheet-delete-btn gang-sheet-delete-btn--roster" onClick={() => deleteProgressionMember(member)} aria-label={t('games.gangues.progression.delete')}>×</button>
                    {/* Ver ficha completa — atributos, PV/PM, subcaminho, poderes.
                        É a mesma tela onde se gasta XP. */}
                    <button className="gang-sheet-ficha" onClick={() => abrirProgressao(member)}>
                      {t('games.gangues.progression.open_sheet')}
                    </button>
                    {xpDisponivel > 0 && (
                      <button className="gang-sheet-levelup" onClick={() => abrirProgressao(member)}>
                        {t('games.gangues.progression.xp_badge', { n: xpDisponivel })}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="gang-party-counter">{t('games.gangues.party_size_atual', { n: party.length, max: partyLimit })}</p>
          {partyLimit < GANGUES_MAX_PARTY_SIZE && <p className="gang-party-counter">{t('games.gangues.party_size_bloqueado')}</p>}
          {avisoParty && <p className="gang-err">{avisoParty}</p>}
          {roster.length < rosterLimit && <button className="gang-new-sheet" onClick={startCreation}><span className="gang-new-sheet-icon">+</span>{t('games.gangues.nova_ficha')}</button>}
          {/* Batalha avulsa — secundária. Sempre clicável: se faltar lutador,
              avisa aqui em vez de bloquear. */}
          <button className="gang-new-sheet gang-quick-battle" onClick={tentarBatalha}>{t('games.gangues.party.enter_gangues')}</button>
          <p className="gang-quick-battle-hint">{t('games.gangues.party.quick_desc')}</p>
        </>
      )}
      {avisoPoderes && (
        <div className="gang-progression-prompt" role="dialog" aria-modal="true" aria-labelledby="gang-poderes-prompt-title">
          <div className="gang-progression-prompt__card">
            <span className="gang-progression-prompt__icon">⚔</span>
            <h2 id="gang-poderes-prompt-title">{t('games.gangues.party.equipar_titulo')}</h2>
            <p>{t('games.gangues.party.equipar_corpo', { nomes: avisoPoderes.nomes.join(', ') })}</p>
            <button className="gang-progression-prompt__confirm" onClick={equiparAgora}>{t('games.gangues.party.equipar_agora')}</button>
            <button onClick={entrarAssimMesmo}>{t('games.gangues.party.equipar_depois')}</button>
          </div>
        </div>
      )}
      {/* Saída do jogo: "SAIR", não "voltar aos games" — quem joga sente
          que está saindo de um jogo, não navegando num site. */}
      <button className="gang-lobby-quit" onClick={() => navigate('/games')}>
        {t('games.gangues.sair_do_jogo')}
      </button>
    </main>
  )
}
