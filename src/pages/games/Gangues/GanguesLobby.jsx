import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import GanguesNaming from './GanguesNaming'
import { sfx } from '../../../lib/sfx'
import { useGanguesStore } from './store/useGanguesStore'
import { GANGUES_INITIAL_PARTY_SIZE, GANGUES_MAX_PARTY_SIZE, getGanguesProgression, getGanguesRosterLimitComHistoria } from './data/ganguesLoadout.js'
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

const PATH_MARKS = { atacante: 'A', defensor: 'D', mistico: 'M' }

export default function GanguesLobby({ onNavigate }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, perfil } = useAuth()
  const store = useGanguesStore()
  const [loading, setLoading] = useState(Boolean(user))
  const [avisoParty, setAvisoParty] = useState('')
  const [avisoPoderes, setAvisoPoderes] = useState(null) // { nomes } — poderes por equipar
  const [renomeando, setRenomeando] = useState(false)
  const [rosterIndex, setRosterIndex] = useState(0)
  const roster = store.roster
  const party = store.activeParty
  // Cresce por tier pago OU por território dominado na história — vale o maior.
  const rosterLimit = getGanguesRosterLimitComHistoria(perfil?.tier, store.storyProgress, store.rep)
  // Time de batalha = quantos você recrutou, até o teto — não depende mais
  // de XP acumulado. Antes era "cresce só grindando", o que não bate com a
  // fantasia de "recrutar mais = levar mais gente pra briga".
  const partyLimit = Math.min(roster.length, GANGUES_MAX_PARTY_SIZE)

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

  // O elenco já foi carregado pela tela de save (GanguesSaveSelect.selecionarSave)
  // pra quem tem conta — aqui só recarrega se por algum motivo chegou no lobby
  // sem passar por lá (ex: guest, que não tem save nenhum).
  useEffect(() => {
    store.setEnemyCatalog(enemiesData)
    if (!user || store._saveId) { setLoading(false); return }
    setLoading(false)
  }, [user])

  // Sem elenco pra escolher de verdade (tudo que existe cabe no limite da
  // gangue), não faz sentido obrigar o jogador a marcar manualmente quem vai
  // pra batalha — os únicos lutadores que tem já são os que têm que ir. Só
  // preenche sozinho quando ninguém nunca escolheu nada (não briga com quem
  // já desmarcou alguém de propósito).
  useEffect(() => {
    if (party.length === 0 && roster.length > 0) {
      store.setActiveParty(roster.slice(0, partyLimit))
    }
  }, [roster.length, partyLimit])

  const startRecruitment = () => {
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
      {roster.length > 0 && <header className="gang-lobby-hero gang-lobby-hero--compact">
        <h1 className="gang-lobby-nome">{store.gangName}</h1>
        <button className="gang-lobby-rename" onClick={() => setRenomeando(true)}>✎ {t('games.gangues.naming.renomear')}</button>
      </header>
      }

      {/* Onboarding só quando o elenco está VAZIO. Com 1 ficha, o jogador
          continua vendo a lista pra poder excluir também a última — nunca
          é empurrado pra criação por ter deletado alguém. */}
      {roster.length === 0 ? (
        <section className="gang-onboarding-panel gang-onboarding-panel--solo">
          <div className="gang-onboarding-panel__stamp" aria-hidden="true"><span>LDI</span><b>GANGUES</b></div>
          <span className="gang-onboarding-step">{t('games.gangues.recruitment.first_mission')}</span>
          <h2>{t('games.gangues.recruitment.assemble')}</h2>
          <p>{t('games.gangues.recruitment.lobby_pitch')}</p>
          <div className="gang-onboarding-panel__slots" aria-hidden="true"><i>?</i><span>+</span><i>?</i></div>
          <button className="gang-new-sheet gang-new-sheet--primary" onClick={startRecruitment}>
            <span className="gang-new-sheet-icon">⚡</span>{t('games.gangues.recruitment.enter')}
          </button>
        </section>
      ) : (
        <>
          <button className="gang-home-actions__play gang-home-actions__play--top" onClick={tentarBatalha}>{t('games.gangues.modes.abrir')} <b>→</b></button>

          <RosterCarousel
            roster={roster}
            party={party}
            partyLimit={partyLimit}
            rosterLimit={rosterLimit}
            rosterIndex={rosterIndex}
            setRosterIndex={setRosterIndex}
            handleSheetClick={handleSheetClick}
            abrirProgressao={abrirProgressao}
            deleteProgressionMember={deleteProgressionMember}
            startRecruitment={startRecruitment}
            t={t}
          />

          <p className="gang-party-counter">{t('games.gangues.party_size_atual', { n: party.length, max: partyLimit })}</p>
          {avisoParty && <p className="gang-err">{avisoParty}</p>}
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
      {/* Saída do jogo: quem tem save volta pra tela de escolher gangue — sair
          do jogo (voltar pro catálogo) é uma ação de lá, não daqui. Guest não
          tem save nenhum, então "sair" continua saindo direto pro catálogo. */}
      <button className="gang-lobby-quit" onClick={() => store._saveId ? onNavigate('save-select') : navigate('/games')}>
        {t('games.gangues.sair_do_jogo')}
      </button>
    </main>
  )
}

/** Elenco em carrossel de cartinhas — mesma linguagem visual do recrutamento
 *  (GanguesCreate): 3 cartas visíveis (prev/current/next), tocar na do meio
 *  marca/desmarca pra batalha, tocar nas laterais só navega. */
function RosterCarousel({ roster, party, partyLimit, rosterLimit, rosterIndex, setRosterIndex, handleSheetClick, abrirProgressao, deleteProgressionMember, startRecruitment, t }) {
  useEffect(() => {
    if (rosterIndex >= roster.length) setRosterIndex(0)
  }, [roster.length, rosterIndex])

  const move = (direction) => {
    sfx.select()
    setRosterIndex(index => (index + direction + roster.length) % roster.length)
  }

  const at = (offset) => roster[(rosterIndex + offset + roster.length) % roster.length]
  const slides = roster.length > 1
    ? [{ member: at(-1), position: 'prev' }, { member: at(0), position: 'current' }, { member: at(1), position: 'next' }]
    : roster.map(member => ({ member, position: 'current' }))

  const atual = at(0)
  const xpDisponivel = atual ? getGanguesProgression(atual).xp_unspent : 0

  return (
    <section className="gang-roster-carousel">
      <div className="gang-lobby-section-label gang-lobby-section-label--row"><span>{t('games.gangues.party.roster')}</span><span>{roster.length}/{rosterLimit}</span></div>

      <div className="gang-recruit__stage">
        <div className="gang-recruit__street" aria-hidden="true"><i /><i /><i /></div>
        {roster.length > 1 && <button className="gang-recruit__arrow gang-recruit__arrow--left" onClick={() => move(-1)}>‹</button>}
        <div className="gang-recruit__slides">
          {slides.map(({ member, position }) => {
            const selected = party.some(item => item.id === member.id)
            const unavailable = !selected && party.length >= partyLimit
            return (
              <motion.button
                key={`${position}-${member.id}`}
                disabled={position === 'current' && unavailable}
                className={`gang-fighter-card gang-fighter-card--${position} gang-fighter-card--${member.combat_path}${selected ? ' gang-fighter-card--selected' : ''}`}
                onClick={() => position === 'current' ? handleSheetClick(member) : move(position === 'prev' ? -1 : 1)}
                initial={{ opacity: 0, scale: .9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="gang-fighter-card__number">#{String(roster.indexOf(member) + 1).padStart(2, '0')}</span>
                {selected && <span className="gang-fighter-card__selected">✓ {t('games.gangues.party.selected')}</span>}
                <span className="gang-fighter-card__portrait" aria-hidden="true"><i>{member.sheet_name[0].toUpperCase()}</i><b>{PATH_MARKS[member.combat_path]}</b></span>
                <span className="gang-fighter-card__copy">
                  <small>{t(`games.gangues.loadout.paths.${member.combat_path}.name`)}</small>
                  <strong>{member.sheet_name}</strong>
                  <em>{['A', 'H', 'R', 'D'].map(attr => `${attr}${member.attributes[attr]}`).join(' · ')}</em>
                </span>
                <span className="gang-fighter-card__cta">{selected ? t('games.gangues.party.remover') : t('games.gangues.party.select')}</span>
              </motion.button>
            )
          })}
        </div>
        {roster.length > 1 && <button className="gang-recruit__arrow gang-recruit__arrow--right" onClick={() => move(1)}>›</button>}
        {atual && <div className="gang-roster-carousel__actions">
          <button className="gang-sheet-delete-btn gang-sheet-delete-btn--roster" onClick={() => deleteProgressionMember(atual)} aria-label={t('games.gangues.progression.delete')}>×</button>
          <button className="gang-sheet-ficha" onClick={() => abrirProgressao(atual)}>{t('games.gangues.progression.open_sheet')}</button>
          {xpDisponivel > 0 && <button className="gang-sheet-levelup" onClick={() => abrirProgressao(atual)}>{t('games.gangues.progression.xp_badge', { n: xpDisponivel })}</button>}
        </div>}
      </div>

      {roster.length > 1 && <div className="gang-recruit__dots">
        {roster.map((member, index) => <button key={member.id} className={index === rosterIndex ? 'is-active' : ''} onClick={() => setRosterIndex(index)} />)}
      </div>}

      {roster.length < rosterLimit && <button className="gang-new-sheet" onClick={startRecruitment}><span className="gang-new-sheet-icon">+</span>{t('games.gangues.recruitment.title')}</button>}
    </section>
  )
}
