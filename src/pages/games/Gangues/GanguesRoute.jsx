import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useReader } from '../../../context/ReaderContext'
import { useGanguesStore } from './store/useGanguesStore'
import useGanguesI18n from './hooks/useGanguesI18n'
import GanguesLobby from './GanguesLobby'
import GanguesSaveSelect from './GanguesSaveSelect'
import GanguesModes from './GanguesModes'
import GanguesEnemyPick from './GanguesEnemyPick'
import GanguesCreate from './GanguesCreate'
import GanguesCombat from './GanguesCombat'
import GanguesVictory from './GanguesVictory'
import GanguesProgression from './GanguesProgression'
import GanguesStoryMap from './GanguesStoryMap'
import GanguesTerritorio from './GanguesTerritorio'
import GanguesCena from './GanguesCena'
import { temCena } from './data/cenas/pista.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX } from './data/ganguesLoadout.js'
import { gerarBandoInimigo, GANGUES_CHEFE_EQUIPE } from './data/ganguesEncontros.js'
import GuestNotice from '../../../components/GuestNotice/GuestNotice'
import enemiesData from './data/gangues-enemies.json'
import './Gangues.css'

import { GANGUES_VERSION } from '../../../config/version'
console.log(`[GANGUES] versão carregada: ${GANGUES_VERSION}`)

export default function GanguesRoute() {
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const store = useGanguesStore()
  const i18nReady = useGanguesI18n()
  const [fase, setFase] = useState('lobby')

  // Conta logada: cada gangue é um save separado (ver GanguesSaveSelect) — a
  // primeira coisa a fazer é escolher/criar um save, antes de ver o lobby.
  // Guest não tem save (joga só em memória), vai direto pro lobby de sempre.
  useEffect(() => {
    if (user) {
      store.setUserId(user.id)
      setFase(current => (current === 'lobby' ? 'save-select' : current))
    }
  }, [user])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  // Modo história: quando entra em 'story-combat', monta a batalha com o
  // inimigo do nó e cai no GanguesCombat normal. A vitória volta pro
  // território (marcando o nó) via GanguesVictory.
  // Bairro é gangue contra gangue: o time de batalha usa o ELENCO inteiro
  // (não o activeParty da Arena, que tem seu próprio teto/lógica separada),
  // até o teto do modo história (GANGUES_STORY_BATTLE_PARTY_MAX). Chefe leva
  // a equipe fixa da própria gangue (GANGUES_CHEFE_EQUIPE — sempre a mesma,
  // dá pra aprender e voltar mais preparado); punição fixa (ex: bot de
  // treinamento) é 1 inimigo certo; treta comum sorteia um bando novo a cada
  // tentativa (gerarBandoInimigo) — nunca o mesmo bando duas vezes.
  useEffect(() => {
    if (fase !== 'story-combat') return
    const alvo = store.storyTarget
    const selected = store.activeParty.filter(member => store.roster.some(item => item.id === member.id))
    const party = (selected.length ? selected : store.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX)
    if (!alvo?.enemyId || party.length < 1) { setFase('story'); return }

    let enemyTeam
    if (alvo.isChefe) {
      const ids = GANGUES_CHEFE_EQUIPE[alvo.territorioId] || [alvo.enemyId]
      enemyTeam = ids.map(id => enemiesData.find(e => e.id === id)).filter(Boolean)
      if (!enemyTeam.length) { setFase('story'); return }
    } else if (alvo.fixo) {
      const enemy = enemiesData.find(e => e.id === alvo.enemyId)
      if (!enemy) { setFase('story'); return }
      enemyTeam = [enemy]
    } else {
      enemyTeam = gerarBandoInimigo({ territorioId: alvo.territorioId, dificuldade: alvo.dificuldade, playerTeam: party, enemiesData, pontosFixos: alvo.pontosFixos })
      if (!enemyTeam?.length) { setFase('story'); return }
    }
    store.startMatch(enemyTeam[0], enemyTeam, party)
    setFase('combat')
  }, [fase])

  if (!i18nReady) return (
    <div className="gang-page gang-page--loading" role="status" aria-label="LDI Gangues">
      <span className="gang-loading-mark" aria-hidden="true">LDI</span>
      <i className="gang-loading-line" aria-hidden="true" />
    </div>
  )

  return (
    <div className={`gang-page ${fase === 'lobby' ? 'gang-page--lobby' : ''}`}>
      <GuestNotice />
      {fase === 'save-select' && <GanguesSaveSelect onNavigate={setFase} />}
      {fase === 'lobby' && <GanguesLobby onNavigate={setFase} />}
      {fase === 'create' && (
        <GanguesCreate
          onNavigate={setFase}
          onCreated={() => {
            const roster = useGanguesStore.getState().roster
            if (roster.length < 2) return
            if (!useGanguesStore.getState().activeParty.length) store.setActiveParty(roster.slice(0, 2))
            setFase('lobby')
          }}
        />
      )}
      {fase === 'progression' && <GanguesProgression onNavigate={setFase} />}
      {fase === 'modes' && <GanguesModes onNavigate={setFase} />}
      {fase === 'enemy' && <GanguesEnemyPick onNavigate={setFase} />}
      {fase === 'story' && <GanguesStoryMap onNavigate={setFase} />}
      {fase === 'territorio' && (
        temCena(store.storyTarget?.territorioId)
          ? <GanguesCena onNavigate={setFase} />
          : <GanguesTerritorio onNavigate={setFase} />
      )}
      {fase === 'combat' && <GanguesCombat onNavigate={setFase} />}
      {fase === 'victory' && <GanguesVictory onNavigate={setFase} />}
    </div>
  )
}
