import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useReader } from '../../../context/ReaderContext'
import { useGanguesStore } from './store/useGanguesStore'
import useGanguesI18n from './hooks/useGanguesI18n'
import GanguesLobby from './GanguesLobby'
import GanguesModes from './GanguesModes'
import GanguesEnemyPick from './GanguesEnemyPick'
import GanguesCreate from './GanguesCreate'
import GanguesCombat from './GanguesCombat'
import GanguesVictory from './GanguesVictory'
import GanguesTrainingZone from './GanguesTrainingZone'
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

export default function GanguesRoute({ publicTraining = false }) {
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const store = useGanguesStore()
  const i18nReady = useGanguesI18n()
  const [fase, setFase] = useState(publicTraining ? 'training' : 'lobby')
  const [creationParty, setCreationParty] = useState([])

  useEffect(() => {
    if (user) {
      store.setUserId(user.id)
      store.loadStoryProgress(user.id)
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
    const party = store.roster.slice(0, GANGUES_STORY_BATTLE_PARTY_MAX)
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
      enemyTeam = gerarBandoInimigo({ territorioId: alvo.territorioId, dificuldade: alvo.dificuldade, playerTeam: party, enemiesData })
      if (!enemyTeam?.length) { setFase('story'); return }
    }
    store.startMatch(enemyTeam[0], enemyTeam, party)
    setFase('combat')
  }, [fase])

  if (!i18nReady) return <div className="gang-page" />

  return (
    <div className={`gang-page ${fase === 'training' ? 'gang-page--training' : ''} ${fase === 'lobby' ? 'gang-page--lobby' : ''}`}>
      <GuestNotice />
      {fase === 'lobby' && <GanguesLobby onNavigate={setFase} />}
      {fase === 'create' && (
        <GanguesCreate
          onNavigate={setFase}
          skipIntro
          creationNumber={creationParty.length ? creationParty.length + 1 : store.roster.length + 1}
          blockedPaths={(creationParty.length ? creationParty : store.roster.length === 1 ? store.roster : []).map(member => member.combat_path)}
          onCreated={(member) => {
            const base = creationParty.length ? creationParty : store.roster.length === 1 ? store.roster : []
            const next = [...base, member]
            if (store.roster.length === 0 && next.length < 2) {
              setCreationParty(next)
              store.newSheet()
            } else {
              if (next.length === 2) store.setActiveParty(next)
              setCreationParty([])
              setFase('lobby')
            }
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
      {fase === 'training' && <GanguesTrainingZone onNavigate={setFase} publicAccess={publicTraining} />}
    </div>
  )
}
