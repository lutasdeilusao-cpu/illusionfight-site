import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useReader } from '../../../context/ReaderContext'
import { useGanguesStore } from './store/useGanguesStore'
import useGanguesI18n from './hooks/useGanguesI18n'
import GanguesLobby from './GanguesLobby'
import GanguesSaveSelect from './GanguesSaveSelect'
import GanguesModes from './GanguesModes'
import GanguesCreate from './GanguesCreate'
import GanguesCombat from './GanguesCombat'
import GanguesVictory from './GanguesVictory'
import GanguesProgression from './GanguesProgression'
import GanguesStoryMap from './GanguesStoryMap'
import GanguesTerritorio from './GanguesTerritorio'
import GanguesCena from './GanguesCena'
import GanguesAlbum from './GanguesAlbum'
import GanguesBatalha from './GanguesBatalha'
import GanguesClube from './GanguesClube'
import GanguesClubeSala from './GanguesClubeSala'
import GanguesClubeResultado from './GanguesClubeResultado'
import { temCena } from './data/cenas/pista.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX } from './data/ganguesLoadout.js'
import { gerarBandoInimigo, gerarBandoChefe, gerarBandoRevezamento, gerarBandoEvento, gerarBandoClube } from './data/ganguesEncontros.js'
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
  // De onde a Coleção foi aberta (lobby OU território) — pra o "← Voltar" dela
  // devolver o jogador exatamente onde estava, e não sempre pro lobby.
  const faseAntesAlbum = useRef('lobby')
  const navegar = (destino) => {
    if (destino === 'album') faseAntesAlbum.current = fase
    setFase(destino)
  }

  // Conta logada: cada gangue é um save separado (ver GanguesSaveSelect) — a
  // primeira coisa a fazer é escolher/criar um save, antes de ver o lobby.
  // Guest não tem save (joga só em memória), vai direto pro lobby de sempre.
  // O redirect só pode acontecer UMA VEZ por sessão do componente: `user` do
  // AuthContext ganha uma referência nova toda vez que o Supabase refaz o
  // token (ex: ao voltar de aba/app em segundo plano) — sem o guard, esse
  // efeito reagia de novo e chutava o jogador de volta pra tela de saves no
  // meio do jogo, mesmo sem ele ter feito nada.
  const saveSelectFeito = useRef(false)
  useEffect(() => {
    if (!user) return
    store.setUserId(user.id)
    if (saveSelectFeito.current) return
    saveSelectFeito.current = true
    setFase(current => (current === 'lobby' ? 'save-select' : current))
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
    const temRevezamento = alvo?.revezamento?.pool?.length
    if ((!alvo?.enemyId && !temRevezamento && !alvo?.evento && !alvo?.clube) || party.length < 1) { setFase('story'); return }
    // Tropa inteira no chão (todos PV 0) — não entra em luta até se recuperar
    // na birosca. Na cena o aviso aparece antes de sair; aqui (mapa/trilha) é
    // rede de segurança pra não cair numa derrota garantida em loop. O Clube
    // da Luta é exceção: o 3º fiado já curou a tropa antes de vir pra cá.
    if (!alvo?.clube && party.every(m => Number(m.attributes?.pv_atual ?? 1) <= 0)) {
      console.warn('[GANGUES] tropa no chão — luta bloqueada, volta pro mapa')
      setFase(temCena(alvo?.territorioId) ? 'territorio' : 'story')
      return
    }

    // Modo de dificuldade escolhido pelo jogador — escala TODO bando.
    const modo = store.storyProgress?.__dificuldade || 'medio'

    let enemyTeam
    if (alvo.clube) {
      // Clube da Luta — gauntlet de 3 rondas, bando fixo (não escala com o
      // jogador). A ronda vem do storyTarget (1 → 2 → 3).
      enemyTeam = gerarBandoClube({ enemiesData, ronda: Number(alvo.clubeRonda) || 3 })
      if (!enemyTeam?.length) { setFase('territorio'); return }
    } else if (alvo.evento) {
      // Encontro aleatório de rua — bando um pouco acima da ficha, com teto.
      enemyTeam = gerarBandoEvento({ territorioId: alvo.territorioId, playerTeam: party, enemiesData, modo })
      if (!enemyTeam?.length) { setFase('story'); return }
    } else if (alvo.isChefe) {
      // Bando do chefe = orçamento de pontos FIXO por território (não escala com
      // o jogador — o loop é voltar mais forte). Ver gerarBandoChefe.
      enemyTeam = gerarBandoChefe({ territorioId: alvo.territorioId, playerTeam: party, enemiesData, modo })
      if (!enemyTeam?.length) { setFase('story'); return }
    } else if (temRevezamento) {
      // Encontro de dungeon (túnel/galpão): capangas fracos que se revezam,
      // quase sempre 1 sozinho. Não escala com o jogador nem usa o pool do
      // território — orçamento leve e fixo por corpo.
      enemyTeam = gerarBandoRevezamento({ ...alvo.revezamento, enemiesData, modo })
      if (!enemyTeam?.length) { setFase('story'); return }
    } else if (alvo.fixo) {
      const enemy = enemiesData.find(e => e.id === alvo.enemyId)
      if (!enemy) { setFase('story'); return }
      enemyTeam = [enemy]
    } else {
      enemyTeam = gerarBandoInimigo({ territorioId: alvo.territorioId, dificuldade: alvo.dificuldade, modo, playerTeam: party, enemiesData, pontosFixos: alvo.pontosFixos, liderFixo: alvo.liderFixo })
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
      {fase === 'lobby' && <GanguesLobby onNavigate={navegar} />}
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
      {fase === 'story' && <GanguesStoryMap onNavigate={setFase} />}
      {fase === 'album' && <GanguesAlbum onNavigate={navegar} voltar={() => setFase(faseAntesAlbum.current)} />}
      {fase === 'batalha' && <GanguesBatalha onNavigate={setFase} />}
      {fase === 'clube' && <GanguesClube onNavigate={navegar} />}
      {fase === 'clube-sala' && <GanguesClubeSala onNavigate={navegar} />}
      {fase === 'clube-fuga' && (
        <GanguesClubeResultado
          modo="fuga"
          divida={Math.round(store.storyProgress?.__birosca?.divida || 0)}
          onVoltar={() => {
            const v = store.storyTarget?.voltar
            store.setStoryTarget(v?.territorioId ? { territorioId: v.territorioId } : null)
            navegar(v?.territorioId ? 'territorio' : 'lobby')
          }}
        />
      )}
      {fase === 'territorio' && (
        temCena(store.storyTarget?.territorioId)
          ? <GanguesCena onNavigate={navegar} />
          : <GanguesTerritorio onNavigate={navegar} />
      )}
      {fase === 'combat' && <GanguesCombat onNavigate={setFase} />}
      {fase === 'victory' && <GanguesVictory onNavigate={setFase} />}
    </div>
  )
}
