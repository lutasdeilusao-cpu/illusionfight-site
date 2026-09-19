import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useReader } from '../../../context/ReaderContext'
import { useTutorialProgress } from '../../../context/TutorialProgressContext'
import { useGanguesStore } from './store/useGanguesStore'
import useGanguesI18n from './hooks/useGanguesI18n'
import GanguesLobby from './screens/GanguesLobby'
import GanguesSaveSelect from './screens/GanguesSaveSelect'
import GanguesModes from './screens/GanguesModes'
import GanguesCreate from './screens/GanguesCreate'
import GanguesCombat from './screens/GanguesCombat'
import GanguesVictory from './screens/GanguesVictory'
import GanguesProgression from './screens/GanguesProgression'
import GanguesStoryMap from './screens/GanguesStoryMap'
import GanguesTerritorio from './screens/GanguesTerritorio'
import GanguesCena from './screens/GanguesCena'
import GanguesAlbum from './screens/GanguesAlbum'
import GanguesBatalha from './screens/GanguesBatalha'
import GanguesClube from './screens/GanguesClube'
import GanguesClubeSala from './screens/GanguesClubeSala'
import GanguesClubeResultado from './screens/GanguesClubeResultado'
import { temCena } from './data/cenas/cenaHelpers.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX } from './data/ganguesLoadout.js'
import { gerarBandoInimigo, gerarBandoChefe, gerarBandoRevezamento, gerarBandoEvento, gerarBandoClube, suavizarPrimeiraLuta, escalarInimigo } from './data/ganguesEncontros.js'
import { ajustarPontosFixo } from './data/ganguesDificuldade.js'
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
  // Ponte pro TutorialProgressContext (global, fora do chunk do jogo) saber
  // qual save está ativo agora — sem isso ele teria que importar o store do
  // Gangues direto, o que puxaria o jogo inteiro pro bundle principal (ver
  // comentário grande em TutorialProgressContext.jsx).
  const { definirSaveAtivo } = useTutorialProgress()
  useEffect(() => { definirSaveAtivo(store._saveId) }, [store._saveId, definirSaveAtivo])
  const [fase, setFase] = useState('lobby')
  // De onde a Coleção foi aberta (lobby OU território) — pra o "← Voltar" dela
  // devolver o jogador exatamente onde estava, e não sempre pro lobby.
  const faseAntesAlbum = useRef('lobby')
  // Mesma ideia pro recrutamento: o banner "recrutamento liberado" abre a
  // criação de personagem de DENTRO da cena (Isaias, 2026-09-14) — sem isso,
  // confirmar o recruta sempre chutava o jogador pro lobby, obrigando a
  // escolher modo de jogo e território de novo.
  const faseAntesCreate = useRef('lobby')
  const navegar = (destino) => {
    if (destino === 'album') faseAntesAlbum.current = fase
    if (destino === 'create') faseAntesCreate.current = fase
    setFase(destino)
  }

  // Botão "Voltar" ÚNICO e padronizado (pedido do Isaias, 18/09/2026: "os
  // botões estão fora de padrão... tem que ser um botão grande no alto...
  // você volta pra página anterior") — pilha real de fases visitadas, não
  // um destino chumbado por tela. Cada mudança de fase empilha a fase nova;
  // "voltar" desempilha a atual e a anterior, e reassenta na anterior (que
  // volta a subir no próximo empilhamento, quando ela virar "a atual" de
  // novo) — efeito idêntico ao botão voltar do navegador, sem precisar
  // reescrever toda chamada de navegação existente pra alimentar a pilha
  // manualmente. Fases transitórias (ex: 'story-combat', que só existe pra
  // montar a luta e sai sozinha) entram e saem da pilha sem problema — não
  // tem tela renderizada nelas pra clicar voltar durante o instante em que
  // existem. Não é usado nas fases que já têm saída própria: a primeira
  // tela do jogo (Sair, ver GanguesSaveSelect/GanguesNaming) e o combate
  // (confirmação própria, ver GanguesCombatSairConfirm.jsx).
  const historicoRef = useRef([])
  useEffect(() => {
    historicoRef.current.push(fase)
    if (historicoRef.current.length > 20) historicoRef.current.shift()
  }, [fase])
  const voltar = () => {
    const hist = historicoRef.current
    hist.pop()
    const anterior = hist.pop()
    if (anterior) setFase(anterior)
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
    if (user) {
      store.setUserId(user.id)
      if (saveSelectFeito.current) return
      saveSelectFeito.current = true
      setFase(current => (current === 'lobby' ? 'save-select' : current))
      return
    }
    // `user` virou falso DEPOIS de já ter estado logado nesta aba (logout,
    // sem recarregar a página) — sem isso, _userId/roster/saves da conta
    // anterior ficavam presos no store, e o próximo guest/login na MESMA aba
    // herdava um _userId órfão (ver logoutReset no useGanguesStore.js: o
    // sintoma era "a gangue não pode ser fundada" pro próximo a jogar ali).
    if (saveSelectFeito.current) {
      store.logoutReset()
      saveSelectFeito.current = false
      setFase('lobby')
    }
  }, [user])

  // Gancho de debug (18/09/2026) — só em dev, mesma ideia do
  // `window.__ganguesStore`: deixa Playwright pular direto pra uma luta
  // real (recruta os 3 alvos, monta o bando com o gerador oficial,
  // chama startMatch de verdade) sem depender de arrastar o analógico
  // pela cena navegável, que trava em automação.
  useEffect(() => {
    if (!import.meta.env?.DEV) return
    window.__ganguesDebugFight = async (templateIds = [2, 4, 5]) => {
      // `store` (o objeto vindo de useGanguesStore()) é um snapshot congelado
      // no render em que este efeito foi montado ([] de deps) — ler
      // store.roster depois de mutar via recruitTemplate ainda devolve o
      // array VELHO. useGanguesStore.getState() sempre lê o estado atual de
      // verdade, igual o próprio window.__ganguesStore já faz.
      const live = () => useGanguesStore.getState()
      for (const id of templateIds) {
        if (!live().roster.some(s => s.character_template_id === id)) await live().recruitTemplate(id)
      }
      const party = live().roster.filter(s => templateIds.includes(s.character_template_id))
      live().setActiveParty(party)
      const bando = gerarBandoInimigo({ territorioId: 'pista', pontosFixo: ajustarPontosFixo(14, 'facil'), playerTeam: party, enemiesData })
      window.__ganguesDebugLast = { party, bando, enemiesDataLen: enemiesData?.length }
      if (!bando?.length) { console.error('[GANGUES DEBUG] gerarBandoInimigo falhou', { party, bando, enemiesDataLen: enemiesData?.length }); return }
      live().startMatch(bando[0], bando, party)
      setFase('combat')
    }
    // Gancho extra de debug (18/09/2026, tela de "padronizar os botões") —
    // pula direto pra qualquer fase sem precisar clicar a UI inteira
    // (útil pra testar Modes/Story/Território/etc, que exigem roster ≥2
    // já montado). Recruta 2 padrão se o roster ainda tiver menos que
    // isso.
    window.__ganguesDebugFase = async (fase, templateIds = [1, 3]) => {
      const live = () => useGanguesStore.getState()
      if (live().roster.length < 2) {
        for (const id of templateIds) {
          if (!live().roster.some(s => s.character_template_id === id)) await live().recruitTemplate(id)
        }
        const party = live().roster.filter(s => templateIds.includes(s.character_template_id))
        live().setActiveParty(party)
      }
      if (!live().gangName) live().setGangName('Gangue Debug')
      setFase(fase)
    }
  }, [])

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
    // 1ª luta de toda conta nova vem suavizada (1 corpo, metade dos pontos),
    // não importa nível/dificuldade — ver suavizarPrimeiraLuta. Chefe/clube/
    // torre ficam de fora (gated por progresso, nunca são a 1ª luta na prática).
    const primeiraLuta = !store.storyProgress?.__primeiraLutaFeita

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
      if (primeiraLuta) enemyTeam = suavizarPrimeiraLuta(enemyTeam)
    } else if (alvo.isChefe) {
      // Bando do chefe = orçamento de pontos FIXO por território (não escala com
      // o jogador — o loop é voltar mais forte). Ver gerarBandoChefe.
      enemyTeam = gerarBandoChefe({ territorioId: alvo.territorioId, playerTeam: party, enemiesData, modo })
      if (!enemyTeam?.length) { setFase('story'); return }
    } else if (temRevezamento) {
      // Encontro de dungeon (túnel/galpão): capangas fracos que se revezam,
      // quase sempre 1 sozinho, orçamento leve e fixo por corpo — A MENOS que
      // o POI peça "multidão garantida" (qtdMin/qtdMax) e/ou escalonamento
      // pelo time (ratioComTime), caso do galpão do Carvão (ver interiores.js).
      enemyTeam = gerarBandoRevezamento({ ...alvo.revezamento, enemiesData, modo, playerTeam: party })
      if (!enemyTeam?.length) { setFase('story'); return }
      if (primeiraLuta) enemyTeam = suavizarPrimeiraLuta(enemyTeam)
    } else if (alvo.fixo) {
      // Nível fixo (Generais da Pista, rua comum dos outros territórios): a
      // MESMA ficha catalogada, escalada pro ponto autorado do POI/nó
      // (`pontosFixos`) + ajuste de dificuldade — nunca contra o time do
      // jogador. Sem `pontosFixos` (ex: um `viraTreta` sem esse campo), cai
      // pro stat cru do catálogo como já era antes.
      const enemy = enemiesData.find(e => e.id === alvo.enemyId)
      if (!enemy) { setFase('story'); return }
      enemyTeam = [alvo.pontosFixos > 0 ? escalarInimigo(enemy, ajustarPontosFixo(alvo.pontosFixos, modo)) : enemy]
      if (primeiraLuta) enemyTeam = suavizarPrimeiraLuta(enemyTeam)
    } else {
      // Bando de vários corpos com orçamento total FIXO (ex: galpao_m2) —
      // ver gerarBandoInimigo em ganguesEncontros.js.
      enemyTeam = gerarBandoInimigo({ territorioId: alvo.territorioId, pontosFixo: ajustarPontosFixo(alvo.pontosFixos, modo), playerTeam: party, enemiesData, liderFixo: alvo.liderFixo, moldesPool: alvo.moldesPool, qtdMin: alvo.qtdMin, qtdMax: alvo.qtdMax })
      if (!enemyTeam?.length) { setFase('story'); return }
      if (primeiraLuta) enemyTeam = suavizarPrimeiraLuta(enemyTeam)
    }
    if (primeiraLuta && !alvo.clube && !alvo.isChefe) store.marcarPrimeiraLutaFeita()
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
          onNavigate={(destino) => setFase(destino === 'lobby' ? faseAntesCreate.current : destino)}
          onCreated={(_membro, eraDuplaFundadora) => {
            // Pedido do Isaias, 19/09/2026, print do lobby logo depois de
            // escolher os 2 primeiros: "essa tela não é mais necessária
            // depois que escolher os personagens, deve ir direto pra
            // escolher modo de jogo". `eraDuplaFundadora` vem do próprio
            // GanguesCreate (`initialRecruitment`, calculado lá porque por
            // aqui `activeParty` já foi preenchido ANTES de chamar
            // `onCreated`, então não dava pra adivinhar isso só olhando o
            // store neste ponto). Voltar pro lobby só pra clicar de novo em
            // "escolher modo de jogo" era um passo a mais sem função —
            // pula direto pra 'modes'. Recrutamento de reforço depois
            // (roster > 2, não é mais a fundação) continua voltando pra
            // onde a tela de criação foi aberta (lobby, cena, etc.), como
            // sempre foi.
            setFase(eraDuplaFundadora ? 'modes' : faseAntesCreate.current)
          }}
        />
      )}
      {fase === 'progression' && <GanguesProgression onNavigate={setFase} />}
      {fase === 'modes' && <GanguesModes onNavigate={setFase} onVoltar={voltar} />}
      {fase === 'story' && <GanguesStoryMap onNavigate={setFase} onVoltar={voltar} />}
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
          : <GanguesTerritorio onNavigate={navegar} onVoltar={voltar} />
      )}
      {fase === 'combat' && <GanguesCombat onNavigate={setFase} onSairConfirmado={() => setFase('lobby')} />}
      {fase === 'victory' && <GanguesVictory onNavigate={navegar} />}
    </div>
  )
}
