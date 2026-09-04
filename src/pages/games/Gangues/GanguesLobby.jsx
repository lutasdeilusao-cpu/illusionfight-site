import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useFichas } from '../../../context/FichasContext'
import { useNavigate } from 'react-router-dom'
import GanguesNaming from './GanguesNaming'
import { sfx } from '../../../lib/sfx'
import { useGanguesStore } from './store/useGanguesStore'
import { GANGUES_INITIAL_PARTY_SIZE, GANGUES_MAX_PARTY_SIZE, getGanguesPartySizeLimit, getGanguesProgression, getGanguesRosterLimitComHistoria } from './data/ganguesLoadout.js'
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

export default function GanguesLobby({ onNavigate }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, perfil } = useAuth()
  const { isAdmin } = useFichas()
  const store = useGanguesStore()
  const [loading, setLoading] = useState(Boolean(user))
  const [avisoParty, setAvisoParty] = useState('')
  const [avisoPoderes, setAvisoPoderes] = useState(null) // { nomes } — poderes por equipar
  const [renomeando, setRenomeando] = useState(false)
  const roster = store.roster
  const party = store.activeParty
  // Cresce por tier pago OU por território dominado na história — vale o maior.
  const rosterLimit = getGanguesRosterLimitComHistoria(perfil?.tier, store.storyProgress)
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

  const startCreation = () => {
    if (roster.length >= rosterLimit) return
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
    onNavigate('modes')
  }

  const equiparAgora = () => {
    const alvo = party.find(m => avisoPoderes?.nomes.includes(m.sheet_name)) || party[0]
    setAvisoPoderes(null)
    if (alvo) abrirProgressao(alvo)
  }
  const entrarAssimMesmo = () => { setAvisoPoderes(null); onNavigate('modes') }

  if (loading) return <main className="gang-lobby"><div className="gang-lobby-empty">{t('games.gangues.carregando')}</div></main>

  // Primeira coisa ao entrar: batizar a gangue. É o nome que reverbera.
  if (!store.gangName) return <GanguesNaming onDone={() => {}} />
  if (renomeando) return <GanguesNaming modoEdicao onDone={() => setRenomeando(false)} />

  return (
    <main className="gang-lobby">
      <header className="gang-lobby-hero">
        <p className="gang-lobby-titulo">{t('games.gangues.modo_standalone')} · LDI GANGUES</p>
        <h1 className="gang-lobby-nome">{store.gangName}</h1>
        <button className="gang-lobby-rename" onClick={() => setRenomeando(true)}>✎ {t('games.gangues.naming.renomear')}</button>
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
          {/* Monta a dupla e segue pra seleção de modo (história / batalha).
              Sempre clicável: se faltar lutador, avisa aqui em vez de bloquear. */}
          <button className="gang-new-sheet gang-new-sheet--primary" onClick={tentarBatalha}>{t('games.gangues.modes.abrir')}</button>
          {roster.length < rosterLimit && <button className="gang-new-sheet" onClick={startCreation}><span className="gang-new-sheet-icon">+</span>{t('games.gangues.nova_ficha')}</button>}
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
