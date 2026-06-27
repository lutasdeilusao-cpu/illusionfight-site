import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TRIAL_ACTIVE } from '../../../config/trial'
import { useAuth } from '../../../context/AuthContext'
import { useAchievements } from '../../../context/AchievementsContext'
import { useReader } from '../../../context/ReaderContext'
import { useLanguage } from '../../../context/LanguageContext'
import { getDeck } from '../../../lib/getDeck'
import { TS_VERSION } from '../../../config/version'
import { useEventos } from '../../../context/EventosContext'
import { supabase } from '../../../lib/supabase'
import { carregarDeck as carregarDeckDB, salvarCartasDeck, substituirDeck, registrarPartida, carregarTentativas, consumirTentativa, marcarCartaGanha, verificarCartaGanhaHoje, migrarLocalStorageParaSupabase, registrarPontuacaoRanking } from '../../../hooks/useLeaderboardDB'
import TopTrumpsCard from '../../../components/TopTrumpsCard/TopTrumpsCard'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'
import { usePresence } from '../../../hooks/usePresence'
import Jokempo from '../../../components/Jokempo/Jokempo'
import cardFallback from '../../../assets/images/cards/characters/card-fallback.png'
import img01 from '../../../assets/images/cards/characters/card-01.png'
import img02 from '../../../assets/images/cards/characters/card-02.png'
import img03 from '../../../assets/images/cards/characters/card-03.png'
import img04 from '../../../assets/images/cards/characters/card-04.png'
import img05 from '../../../assets/images/cards/characters/card-05.png'
import img06 from '../../../assets/images/cards/characters/card-06.png'
import img07 from '../../../assets/images/cards/characters/card-07.png'
import img08 from '../../../assets/images/cards/characters/card-08.png'
import img09 from '../../../assets/images/cards/characters/card-09.png'
import img10 from '../../../assets/images/cards/characters/card-10.png'
import img11 from '../../../assets/images/cards/characters/card-11.png'
import img12 from '../../../assets/images/cards/characters/card-12.png'
import img13 from '../../../assets/images/cards/characters/card-13.png'
import img14 from '../../../assets/images/cards/characters/card-14.png'
import img15 from '../../../assets/images/cards/characters/card-15.png'
import img21 from '../../../assets/images/cards/characters/card-21.png'
import img23 from '../../../assets/images/cards/characters/card-23.png'
import CardViewerModal from './components/CardViewerModal'
import DeckBuilder from './components/DeckBuilder'
import DeckStartModal from './components/DeckStartModal'
import './TopTrumps.css'

// ── Imagens oficiais por id_num (season 1) ──
const CARD_IMAGES = {
  1: img01, 2: img02, 3: img03, 4: img04, 5: img05,
  6: img06, 7: img07, 8: img08, 9: img09, 10: img10,
  11: img11, 12: img12, 13: img13, 14: img14, 15: img15,
  21: img21, 23: img23,
}
function bgCarta(carta) {
  return CARD_IMAGES[carta?.id] || cardFallback
}



function attrNomeKey(id) {
  const map = {
    rank_sdr: 'atributo_rank_sdr',
    poder_mental: 'atributo_poder_mental',
    velocidade: 'atributo_velocidade',
    resistencia: 'atributo_resistencia',
    nivel_xama: 'atributo_nivel_xama',
    fator_caos: 'atributo_fator_caos',
    energia_base: 'atributo_energia_base',
  }
  return map[id] || 'atributo_poder_explosivo'
}

function embaralhar(arr) { return [...arr].sort(() => Math.random() - 0.5) }
function avatarCor(id) {
  let hash = 0; for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${hash % 360}, 65%, 45%)`
}

function keyPorUser(user, suffix) {
  const uid = user?.id || 'anon'
  return `ldi-toptrumps-${suffix}-${uid}`
}

export default function TopTrumps() {
  const { t, tt, locale } = useLanguage()
  const navigate = useNavigate()
  const deck = getDeck(locale)
  const todasCartas = deck.cartas
  const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({
    id, nomeKey: attrNomeKey(id),
    descricao
  }))
  const { user, perfil } = useAuth()
  usePresence({ userId: user?.id, modo: 'single', tier: perfil?.tier || 'free' })
  const { desbloquear } = useAchievements()
  const { registrarEvento } = useEventos()
  const { setReaderMode } = useReader()
  const desbloquearRef = useRef(desbloquear)
  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])

  // Reader mode: esconde Navbar e Footer durante o jogo
  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  const [fase, setFase] = useState('menu')
  const [deckJogador, setDeckJogador] = useState([])
  const [deckIA, setDeckIA] = useState([])
  const [cartaJogador, setCartaJogador] = useState(null)
  const [cartaIA, setCartaIA] = useState(null)
  const [atributoEscolhido, setAtributoEscolhido] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [placar, setPlacar] = useState({ jogador: 0, ia: 0 })
  const [rodada, setRodada] = useState(1)
  const [totalTurnos, setTotalTurnos] = useState(null)
  const [deckUsuario, setDeckUsuario] = useState([])
  const [recompensaOpcoes, setRecompensaOpcoes] = useState([])
  const [jaGanhouHoje, setJaGanhouHoje] = useState(false)
  const [tentativasMax, setTentativasMax] = useState(3)
  const [tentativasRestantes, setTentativasRestantes] = useState(3)
  const [cartaRecompensaSelecionada, setCartaRecompensaSelecionada] = useState(null)
  const [menuStep, setMenuStep] = useState(null)
  const [girando, setGirando] = useState(false)
  const [particulas, setParticulas] = useState([])
  const [historicoRodadas, setHistoricoRodadas] = useState([])
  const [showDesistirModal, setShowDesistirModal] = useState(false)
  const [modalMultiplayerLocked, setModalMultiplayerLocked] = useState(false)
  const [swipeRevealed, setSwipeRevealed] = useState(false)

  // Card viewer + deck builder
  const [viewerIdx, setViewerIdx] = useState(null)
  const [showDeckBuilder, setShowDeckBuilder] = useState(false)
  const [showDeckStart, setShowDeckStart] = useState(false)

  // Template randomization (6 templates, 0-5)
  const [templateIdxJogador, setTemplateIdxJogador] = useState(0)
  const [templateIdxIA, setTemplateIdxIA] = useState(0)

  function sortearTemplates() {
    const p = Math.floor(Math.random() * 6)
    let ia = Math.floor(Math.random() * 6)
    while (ia === p) ia = Math.floor(Math.random() * 6)
    setTemplateIdxJogador(p)
    setTemplateIdxIA(ia)
  }

  // Onomatopoeias da cortina
  const ONOMATOPEIAS = [
    'KABOOM!', 'POW!', 'CRASH!', 'BOOM!', 'WHAM!',
    'BLAM!', 'KRAK!', 'SMASH!', 'BANG!', 'ZAP!',
    'KABLAM!', 'THWACK!', 'CRUNCH!', 'SLAM!', 'KAPOW!',
    'WHACK!', 'BAM!', 'CLANG!', 'KRAKOOM!', 'SWISH!'
  ]
  const [onomaTexto, setOnomaTexto] = useState('KABOOM!')

  function sortearOnomatopeia() {
    const idx = Math.floor(Math.random() * ONOMATOPEIAS.length)
    setOnomaTexto(ONOMATOPEIAS[idx])
  }

  // Confirmation + animation states
  const [confirmandoAtributo, setConfirmandoAtributo] = useState(null)
  const [cartaSumindo, setCartaSumindo] = useState(false)
  const [cortinaAtiva, setCortinaAtiva] = useState(false)
  const [revelandoResultado, setRevelandoResultado] = useState(false)

  // ── Alternância de turnos ──
  const [vezAtual, setVezAtual] = useState('jogador')
  const [iaEscolhendo, setIaEscolhendo] = useState(false)

  // ── Heartbeat loop durante a escolha de atributo ──
  const [somAtivo, setSomAtivo] = useState(sfx.enabled)
  function toggleSom() {
    const novo = sfx.toggle()
    setSomAtivo(novo)
  }
  useEffect(() => {
    if (fase === 'jogando' && !confirmandoAtributo) {
      sfx.startHeartbeatLoop()
    } else {
      sfx.stopHeartbeatLoop()
    }
    return () => sfx.stopHeartbeatLoop()
  }, [fase, confirmandoAtributo])

  // ── IA turn trigger: quando vezAtual === 'ia' e fase === 'jogando', dispara com delay ──
  useEffect(() => {
    if (vezAtual !== 'ia' || fase !== 'jogando') return
    const timer = setTimeout(() => iaEscolherAtributo(), 500)
    return () => clearTimeout(timer)
  }, [vezAtual, fase])

  // Max attribute values across ALL cards
  const maxAtrib = todasCartas.reduce((acc, c) => {
    Object.entries(c.atributos).forEach(([k, v]) => {
      if (!acc[k] || v > acc[k]) acc[k] = v
    })
    return acc
  }, {})

  function getDeckKey() { return keyPorUser(user, 'deck') }

  function getTierInicial() {
    if (!user) return 'free'
    return perfil?.role || 'free'
  }

  function getCartasIniciais() {
    return embaralhar([...todasCartas]).slice(0, 5)
  }

  async function carregarDeckLocal() {
    if (!user) return []
    const chave = getDeckKey()
    const salvo = localStorage.getItem(chave)
    if (salvo) {
      const ids = JSON.parse(salvo)
      return ids.map(id => todasCartas.find(c => c.id === id)).filter(Boolean)
    }
    const iniciais = getCartasIniciais()
    localStorage.setItem(chave, JSON.stringify(iniciais.map(c => c.id)))
    return iniciais
  }

  function iniciarJogo() {
    if (!user || totalTurnos > deckUsuario.length) return
    const d = embaralhar([...deckUsuario])
    const metade = Math.ceil(d.length / 2)
    setDeckJogador(d.slice(0, metade))
    setDeckIA(d.slice(metade))
    setCartaJogador(d[0]); setCartaIA(d[metade])
    setFase('jogando'); setRodada(1); setPlacar({ jogador: 0, ia: 0 })
    setHistoricoRodadas([])
    sortearTemplates()
  }

  function iniciarJogoComCartas(cartaIds) {
    // cartaIds = array de IDs (id_num) vindos do deck ou aleatório
    // Garante que não haja cartas repetidas dentro do deck de cada jogador
    sfx.nextRound()
    // Player: 5 cartas únicas da coleção (embaralhadas)
    const pool = embaralhar([...deckUsuario])
    const cartasJogador = pool.slice(0, 5)
    // IA: 5 cartas únicas da coleção (pode coincidir com as do player)
    const cartasIA = embaralhar([...deckUsuario]).slice(0, 5)
    setDeckJogador(cartasJogador)
    setDeckIA(cartasIA)
    setCartaJogador(cartasJogador[0] || null)
    setCartaIA(cartasIA[0] || null)
    setPlacar({ jogador: 0, ia: 0 })
    setHistoricoRodadas([])
    sortearTemplates()
    setVezAtual('jogador')
    setIaEscolhendo(false)
    setFase('ppt')
  }

  function resolverPPT(winnerName) {
    if (winnerName === tt('ppt_voce')) {
      sfx.win()
      setVezAtual('jogador')
    } else if (winnerName === null) {
      sfx.draw()
      setVezAtual('jogador')
    } else {
      sfx.lose()
      setVezAtual('ia')
    }
    setTimeout(() => {
      setRodada(1)
      setFase('jogando')
    }, 1500)
  }

  function gerarParticulas(tipo) {
    const qtd = tipo === 'empate' ? 20 : 35
    const variantes = ['a','b','c','d','e','f']
    const nova = []
    for (let i = 0; i < qtd; i++) {
      nova.push({
        id: Date.now() + i,
        variante: variantes[i % variantes.length],
        tipo
      })
    }
    setParticulas(nova)
    setTimeout(() => setParticulas([]), 1800)
  }

  function onClickAtributo(atributoId) {
    if (girando || confirmandoAtributo) return
    sfx.select()
    setConfirmandoAtributo(atributoId)
  }

  function cancelarJogada() {
    sfx.cancel()
    setConfirmandoAtributo(null)
  }

  function iaEscolherAtributo() {
    if (!cartaJogador || !cartaIA || fase !== 'jogando') return
    setIaEscolhendo(true)
    // Aguarda delay dramático antes de escolher
    setTimeout(() => {
      if (!cartaJogador || !cartaIA) { setIaEscolhendo(false); return }
      // IA escolhe um atributo aleatório (não vê os valores do jogador — é justo)
      // rank_sdr não é um atributo jogável (é apenas informativo na carta)
      const attrsDisponiveis = atributos.filter(attr => cartaIA.atributos[attr.id] !== undefined && attr.id !== 'rank_sdr')
      if (!attrsDisponiveis.length) { setIaEscolhendo(false); return }
      const escolhido = attrsDisponiveis[Math.floor(Math.random() * attrsDisponiveis.length)]
      setIaEscolhendo(false)
      resolverRodada(escolhido.id, 'ia')
    }, 1500)
  }

  function resolverRodada(attrKey, escolhidoPor) {
    if (!cartaJogador || !cartaIA) return
    const attr = atributos.find(a => a.id === attrKey)
    if (!attr) return
    const vJ = cartaJogador.atributos[attrKey]
    const vI = cartaIA.atributos[attrKey]
    let res
    res = vJ > vI ? 'ganhou' : vJ < vI ? 'perdeu' : 'empate'

    setAtributoEscolhido(attrKey)
    setResultado(res)
    setConfirmandoAtributo(null)

    // Step 1: Card starts fading + card flip SFX
    sfx.cardFlip()
    setCartaSumindo(true)
    setGirando(true)

    // Step 2: Curtain sweeps in + VS drum + heartbeat
    setTimeout(() => {
      sortearOnomatopeia()
      sfx.vs()
      sfx.startHeartbeatLoop()
      setCortinaAtiva(true)
    }, 600)

    // Step 3: Reveal opponent card + show result
    setTimeout(() => {
      sfx.stopHeartbeatLoop()
      setCartaSumindo(false)
      setCortinaAtiva(false)
      setGirando(false)

      if (res === 'ganhou') {
        sfx.win()
        setPlacar(p => ({ ...p, jogador: p.jogador + 1 }))
      }
      if (res === 'perdeu') {
        sfx.lose()
        setPlacar(p => ({ ...p, ia: p.ia + 1 }))
      }
      if (res === 'empate') sfx.draw()

      setHistoricoRodadas(h => [...h, {
        rodada,
        cartaJogador: { nome: cartaJogador.nome, atributos: cartaJogador.atributos },
        cartaIA: { nome: cartaIA.nome, atributos: cartaIA.atributos },
        atributo: tt(attr.nomeKey), valorJogador: vJ, valorIA: vI, resultado: res,
        escolhidoPor
      }])

      setFase('resultado_rodada')
      gerarParticulas(res)
    }, 1800)
  }

  function confirmarJogada() {
    const attrKey = confirmandoAtributo
    if (!attrKey || !cartaJogador || !cartaIA) return
    setConfirmandoAtributo(null)
    resolverRodada(attrKey, 'jogador')
  }

  function proximaRodada() {
    setSwipeRevealed(false)
    sfx.nextRound()
    if (rodada >= totalTurnos) { finalizarPartida(); return }
    // Usa módulo para ciclar pelas cartas do deck — cada deck contém cartas únicas
    const pJ = deckJogador[rodada % deckJogador.length]
    const pI = deckIA[rodada % deckIA.length]
    setCartaJogador(pJ); setCartaIA(pI)
    setAtributoEscolhido(null); setResultado(null)
    setRodada(r => r + 1); setFase('jogando')
    sortearTemplates()
    // Alterna vezAtual (IA será disparada pelo useEffect abaixo)
    setVezAtual(v => v === 'jogador' ? 'ia' : 'jogador')
  }

  async function handleDesistir() {
    sfx.lose()
    setShowDesistirModal(false)
    // Conta como derrota
    const rodadasJogadas = historicoRodadas.length
    const vitorias = historicoRodadas.filter(h => h.resultado === 'ganhou').length
    const derrotas = historicoRodadas.filter(h => h.resultado === 'perdeu').length + 1
    const empates = historicoRodadas.filter(h => h.resultado === 'empate').length
    setPlacar(p => ({ ...p, ia: p.ia + 1 }))
    setFase('fim_jogo')
    if (!user) return
    // Cada partida consuma 1 tentativa (await p/ evitar race condition)
    if (user) {
      const usadas = await consumirTentativa(user.id)
      setTentativasRestantes(Math.max(0, tentativasMax - usadas))
    }
    registrarPartida(user.id, { jogadas: rodadasJogadas, vitorias, derrotas, empates, resultado: 'derrota' }).then(stats => {
      if (stats.total_derrotas === 1) desbloquearRef.current('primeira_derrota_trumps')
      if (stats.total_partidas === 10) desbloquearRef.current('veterano_trumps_10')
      if (stats.total_partidas === 100) desbloquearRef.current('centuriao_trumps')
      if (stats.total_partidas === 1000) desbloquearRef.current('lenda_trumps')
    })
  }

  async function finalizarPartida() {
    const venceu = placar.jogador > placar.ia
    if (venceu) {
      sfx.win()
      registrarEvento('trumps_vitoria', 'Venceu uma partida no Top Trumps', 1)
      registrarEvento('jogo_jogado', 'Jogou Top Trumps', 1)
      if (user?.id) registrarPontuacaoRanking(user.id)
    }
    else if (placar.jogador === placar.ia) sfx.draw()
    else sfx.lose()
    if (!user) {
      setFase('fim_jogo')
      return
    }
    const resultado = venceu ? 'vitoria' : placar.jogador === placar.ia ? 'empate' : 'derrota'
    const jogadas = historicoRodadas.length
    const vitorias = historicoRodadas.filter(h => h.resultado === 'ganhou').length
    const derrotas = historicoRodadas.filter(h => h.resultado === 'perdeu').length
    const empates = historicoRodadas.filter(h => h.resultado === 'empate').length

    // Cada partida consuma 1 tentativa — AWAIT para evitar race condition
    let usadasHoje = 0
    if (user) {
      usadasHoje = await consumirTentativa(user.id)
      setTentativasRestantes(Math.max(0, tentativasMax - usadasHoje))
    }
    if (venceu) {
      const jaGanhou = jaGanhouHoje
      const tentativasSobrando = tentativasMax - usadasHoje
      const podeGanhar = tentativasSobrando > 0 && !jaGanhou
      if (podeGanhar) {
        // Usa deckUsuario (carregado do Supabase) em vez de localStorage
        const idsTem = new Set(deckUsuario.map(c => String(c.id)))
        const pool = todasCartas.filter(c => !idsTem.has(String(c.id)))
        if (pool.length > 0) {
          setRecompensaOpcoes(embaralhar(pool).slice(0, 3))
          setFase('recompensa')
          window.__partidaPendente = { jogadas, vitorias, derrotas, empates, resultado }
          return
        }
      } else {
        setJaGanhouHoje(true)
      }
    }
    setFase('fim_jogo')
    registrarPartida(user.id, { jogadas, vitorias, derrotas, empates, resultado }).then(stats => {
      if (stats.total_vitorias === 1) desbloquearRef.current('primeira_vitoria_trumps')
      if (stats.total_derrotas === 1) desbloquearRef.current('primeira_derrota_trumps')
      if (stats.total_partidas === 10) desbloquearRef.current('veterano_trumps_10')
      if (stats.total_partidas === 100) desbloquearRef.current('centuriao_trumps')
      if (stats.total_partidas === 1000) desbloquearRef.current('lenda_trumps')
    })
  }

  async function escolherRecompensa(carta) {
    // Verificação extra no banco ANTES de dar a carta (anti-reload)
    if (user) {
      const jaGanhou = await verificarCartaGanhaHoje(user.id)
      if (jaGanhou) {
        console.warn('[TT] Tentativa de ganhar carta novamente no mesmo dia — bloqueado pelo servidor')
        setFase('fim_jogo')
        return
      }
    }
    const chave = getDeckKey()
    const ids = JSON.parse(localStorage.getItem(chave) || '[]')
    ids.push(carta.id)
    localStorage.setItem(chave, JSON.stringify(ids))
    setDeckUsuario([...deckUsuario, carta])
    salvarCartasDeck(user.id, [carta.id])
    setJaGanhouHoje(true)
    await marcarCartaGanha(user.id)
    const pendente = window.__partidaPendente || { jogadas: historicoRodadas.length, vitorias: 0, derrotas: 0, empates: 0, resultado: 'vitoria' }
    registrarPartida(user.id, { ...pendente, carta_recompensa: carta.id }).then(stats => {
      if (stats.total_vitorias === 1) desbloquearRef.current('primeira_vitoria_trumps')
      if (stats.total_partidas === 10) desbloquearRef.current('veterano_trumps_10')
      if (stats.total_partidas === 100) desbloquearRef.current('centuriao_trumps')
      if (stats.total_partidas === 1000) desbloquearRef.current('lenda_trumps')
    })
    window.__partidaPendente = null
    setFase('fim_jogo')
  }

  useEffect(() => {
    if (!user) return
    carregarDeckDB(user.id).then(ids => {
      const idsUnicos = [...new Set(ids || [])]
      let cartas = idsUnicos.map(id => todasCartas.find(c => c.id === id)).filter(Boolean)

      if (idsUnicos.length > 0 && cartas.length < 5) {
        console.log('[TT] deck corrompido — apenas', cartas.length, 'cartas válidas de', idsUnicos.length, '. Gerando novo deck...')
        const novas = embaralhar([...todasCartas]).slice(0, 5)
        substituirDeck(user.id, novas.map(c => c.id)).then(() => {
          setDeckUsuario(novas)
        })
        return
      }

      setDeckUsuario(cartas)

      if (perfil?.role === 'admin' || perfil?.is_admin) {
        const idsTem = new Set(idsUnicos.map(id => Number(id)))
        const todosIds = todasCartas.map(c => c.id)
        const faltando = todosIds.filter(n => !idsTem.has(n))
        if (faltando.length > 0) {
          console.log('[TT] Admin auto-fill — adicionando cartas faltantes:', faltando)
          salvarCartasDeck(user.id, faltando)
        }
      }
    })
    carregarTentativas(user.id, getTierInicial()).then(({ usadas, jaGanhouHoje: jaGanhou, limite }) => {
      setTentativasMax(limite)
      setTentativasRestantes(Math.max(0, limite - usadas))
      setJaGanhouHoje(jaGanhou || false)
    })
  }, [user])

  // Guest: gera deck temporário em memória (sem persistência)
  useEffect(() => {
    if (user) return
    if (deckUsuario.length === 0) {
      setDeckUsuario(embaralhar([...todasCartas]).slice(0, 5))
    }
  }, [user])

  useEffect(() => {
    if (totalTurnos !== null || deckUsuario.length === 0) { return }
    const opcoes = [5, 10, 15, 20].filter(n => n <= deckUsuario.length)
    if (opcoes.length === 1) { setTotalTurnos(opcoes[0]) }
  }, [deckUsuario, totalTurnos])

  if (fase === 'menu') {
    const pct = deckUsuario.length / todasCartas.length * 100
    const maxTurnos = deckUsuario.length
    return (
      <section className="tt-page tt-page--menu"><div className="tt-menu-bg" /><div className="tt-menu-layout">
        {/* Sound toggle */}
          <button className="tt-sound-toggle" onClick={toggleSom} title={somAtivo ? tt('som_desativar') : tt('som_ativar')}>
          {somAtivo ? '🔊' : '🔇'}
        </button>
        <div className="tt-menu-cards"><div className="tt-card-stack">
          <div className="tt-card-sample tt-card-sample--1" /><div className="tt-card-sample tt-card-sample--2" />
          <div className="tt-card-sample tt-card-sample--3"><div className="tt-card-sample-pattern" /><div className="tt-card-sample-logo">LDI</div></div>
        </div></div>
        <div className="tt-menu-content">
          <div className="tt-title-group"><h1 className="tt-title-main">{tt('menu_titulo')}</h1></div>
          <p className="tt-title-desc">{tt('menu_desc')}</p>
          {user && (
            <div className="tt-colecao">
              <span className="tt-colecao-label">{tt('menu_cartas_coletadas', { n: deckUsuario.length, total: todasCartas.length })}</span>
              <div className="tt-colecao-bar"><div className="tt-colecao-bar-fill" ref={el => { if (el) el.style.setProperty('--fill', `${pct}%`) }} /></div>
            </div>
          )}
          <>
            {!user && (menuStep === null || menuStep === 'modo') && (
              <div className="tt-guest-aviso-previo">
                <p className="tt-guest-aviso-texto">
                  {tt('guest_aviso_previo')}
                </p>
                <Link to="/cadastro" className="tt-guest-aviso-link">
                  {tt('guest_aviso_criar_conta')}
                </Link>
              </div>
            )}
            {(menuStep === null || menuStep === 'modo') && (
              <div className="tt-modos">
                <div className="tt-modo-card" onClick={() => { sfx.click(); setMenuStep('config'); }}>
                  <h3 className="tt-modo-titulo">{tt('menu_single_player')}</h3><p className="tt-modo-desc">{tt('menu_single_desc')}</p>
                </div>
                {user ? (
                  <Link to="/games/toptrumps/lobby" className="tt-modo-card" onClick={() => sfx.click()}>
                    <h3 className="tt-modo-titulo">{tt('menu_multiplayer')}</h3><p className="tt-modo-desc">{tt('menu_multi_desc')}</p>
                  </Link>
                ) : (
                  <div className="tt-modo-card tt-modo-card--locked" onClick={() => { sfx.click(); setModalMultiplayerLocked(true) }}>
                    <h3 className="tt-modo-titulo">{tt('menu_multiplayer')}</h3>
                    <p className="tt-modo-desc">{tt('menu_multi_desc')}</p>
                    <span className="tt-modo-card-lock-icon">🔒</span>
                  </div>
                )}
              </div>
            )}
            {menuStep === 'config' && (
              <div className="tt-config tt-fade-in">
                <span className="tt-config-label">{tt('menu_num_turnos')}</span>
                <div className="tt-config-turnos">
                  {[5, 10, 15, 20].map(n => (
                    <button key={n}
                      className={`tt-config-turno-btn${totalTurnos === n ? ' tt-config-turno-btn--ativo' : ''}`}
                      disabled={n > maxTurnos}
                      onClick={() => { sfx.click(); setTotalTurnos(n); }}>{n}</button>
                  ))}
                </div>
                {user && (
                  jaGanhouHoje ? (
                    <div className="tt-ja-ganhou-hoje">
                      <span className="tt-ja-ganhou-icone">🏆</span>
                      <p className="tt-ja-ganhou-texto">{tt('menu_ja_ganhou')}</p>
                    </div>
                  ) : deckUsuario.length >= todasCartas.length ? (
                    <div className="tt-ja-ganhou-hoje">
                      <span className="tt-ja-ganhou-icone">🏆</span>
                      <p className="tt-ja-ganhou-texto">{tt('menu_ja_ganhou_todas')}</p>
                    </div>
                  ) : (
                    <div className="tt-config-tentativas">
                      {Array.from({length: tentativasMax}).map((_, i) => (<span key={i} className={`tt-tentativa-dot${i < (tentativasMax - tentativasRestantes) ? ' tt-tentativa-dot--gasta' : ''}`} />))}
                      <span className="tt-tentativa-texto">{tt('menu_tentativas', { restantes: tentativasRestantes, max: tentativasMax })}</span>
                    </div>
                  )
                )}
                <button className={`tt-btn-jogar${totalTurnos !== null ? '' : ' tt-btn-jogar--disabled'}`}
                  disabled={totalTurnos === null} onClick={() => {
                    sfx.click()
                    setShowDeckStart(true)
                  }}>{tt('jogar')}</button>
                {user && (
                  <>
                <button className="tt-btn-deck-builder" onClick={() => { sfx.click(); setShowDeckBuilder(true) }}>
                  🃏 {tt('deckBuilderBtn')}
                </button>
                <Link to="/perfil?aba=colecao" className="tt-link-album">{tt('menu_album')}</Link>
                  </>
                )}
              </div>
            )}
          </>
          <BackToGamesBtn onClick={() => { sfx.click(); if (menuStep === 'config') { setMenuStep(null) } else { navigate(-1) } }} label={tt('menu_voltar_games')} />
        </div>
      </div>
      {/* Card Viewer */}
      {viewerIdx !== null && deckUsuario[viewerIdx] && (
        <CardViewerModal
          carta={deckUsuario[viewerIdx]}
          onClose={() => setViewerIdx(null)}
          onPrev={viewerIdx > 0 ? () => setViewerIdx(viewerIdx - 1) : null}
          onNext={viewerIdx < deckUsuario.length - 1 ? () => setViewerIdx(viewerIdx + 1) : null}
        />
      )}
      {/* Deck Builder */}
      {showDeckBuilder && (
        <DeckBuilder
          userId={user?.id}
          deck={{ cartas: todasCartas }}
          deckIds={deckUsuario.map(c => c.id)}
          onSaved={() => {
            setShowDeckBuilder(false);
            if (user) {
              carregarDeckDB(user.id).then(ids => {
                  const cartas = (ids || []).map(id => todasCartas.find(c => c.id === id)).filter(Boolean)
                setDeckUsuario(cartas)
              })
            }
          }}
          onClose={() => setShowDeckBuilder(false)}
        />
      )}
      {/* Deck Start Modal */}
      {showDeckStart && (
        <DeckStartModal
          userId={user?.id}
          deck={{ cartas: todasCartas }}
          totalTurnos={totalTurnos}
          deckIds={deckUsuario.map(c => c.id)}
          onConfirm={(ids) => { setShowDeckStart(false); iniciarJogoComCartas(ids); }}
          onCancel={() => setShowDeckStart(false)}
        />
      )}
      {/* Multiplayer Locked Modal (guest) */}
      {modalMultiplayerLocked && (
        <div className="tt-locked-overlay" onClick={() => setModalMultiplayerLocked(false)}>
          <div className="tt-locked-modal" onClick={e => e.stopPropagation()}>
            <h3 className="tt-locked-titulo">{tt('multiplayer_locked_titulo')}</h3>
            <p className="tt-locked-desc">{tt('multiplayer_locked_desc')}</p>
            <div className="tt-locked-actions">
              <Link to="/cadastro" className="tt-locked-btn tt-locked-btn--primary" onClick={() => sfx.click()}>
                {tt('multiplayer_locked_criar_conta')}
              </Link>
              <button className="tt-locked-btn" onClick={() => { sfx.click(); setModalMultiplayerLocked(false) }}>
                {tt('cancelar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
    )
  }

  if (fase === 'ppt') {
    return (
      <section className="tt-page">
        <button className="tt-sound-toggle" onClick={toggleSom} title={somAtivo ? tt('som_desativar') : tt('som_ativar')}>
          {somAtivo ? '\uD83D\uDD0A' : '\uD83D\uDD07'}
        </button>
        <div className="tt-ppt-container">
          <Jokempo
            player1Name={tt('ppt_voce')}
            player2Name={tt('ppt_ia')}
            animated={true}
            onResult={(winnerName) => resolverPPT(winnerName)}
            i18nLabels={{
              title:    tt('ppt_titulo'),
              subtitle: tt('ppt_subtitulo'),
              rock:     tt('ppt_pedra'),
              paper:    tt('ppt_papel'),
              scissors: tt('ppt_tesoura'),
              you:      tt('ppt_voce'),
              opponent: tt('ppt_ia'),
              win:      tt('ppt_voce_vence'),
              lose:     tt('ppt_ia_vence'),
              draw:     tt('ppt_empate'),
            }}
          />
        </div>
      </section>
    )
  }

  if (fase === 'jogando') {
    if (!cartaJogador || !cartaIA) return null
    const locale = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)
    const isVezIA = vezAtual === 'ia'
    return (
      <>
        <div className="tt-fire-particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="tt-fire-particle" />
          ))}
        </div>
        <section className="tt-page">
        <div className="tt-game-container">
          <button className="tt-sound-toggle" onClick={toggleSom} title={somAtivo ? tt('som_desativar') : tt('som_ativar')}>
            {somAtivo ? '\uD83D\uDD0A' : '\uD83D\uDD07'}
          </button>
          <div className="tt-game-header">
            <div className="tt-game-round">
              {tt('hud_rodada', { n: rodada, total: totalTurnos })}
            </div>
            <div className="tt-game-score">
              <span className="tt-score-you">{tt('voce')} {placar.jogador}</span>
              <span className="tt-score-sep">:</span>
              <span className="tt-score-ai">{tt('ia')} {placar.ia}</span>
            </div>
          </div>
          <div className="tt-player-card-wrapper">
            <TopTrumpsCard
              characterImage={bgCarta(cartaJogador)}
              name={cartaJogador.nome}
              description={cartaJogador.descricao}
              locale={locale}
              attributes={cartaJogador.atributos}
              onAttributeClick={!isVezIA ? (attr) => onClickAtributo(attr) : undefined}
              disabled={girando || !!confirmandoAtributo || isVezIA || iaEscolhendo}
              templateIndex={templateIdxJogador}
            />
          </div>
          <div className="tt-vs-heartbeat">
            <div className="tt-vs-heartbeat-glow" />
            <span className="tt-vs-heartbeat-text">VS</span>
          </div>
          <div className="tt-opponent-mini-wrapper">
            <span className="tt-opponent-mini-label">
              {isVezIA
                ? tt('adversario_escolhendo')
                : tt('adversario')}
            </span>
            <div className="tt-card--mini-wrapper">
              <TopTrumpsCard
                mystery={true}
                mini={true}
                locale={locale}
                templateIndex={cartaIA ? (cartaIA.id % 6) : 0}
              />
            </div>
          </div>
          <div className="tt-game-footer">
            <button className="tt-btn-desistir" onClick={() => { sfx.click(); setShowDesistirModal(true); }}>
              {tt('desistir')}
            </button>
          </div>
        </div>

        {/* Confirmation overlay */}
        {confirmandoAtributo && (() => {
          const attr = atributos.find(a => a.id === confirmandoAtributo)
          const vJ = cartaJogador.atributos[confirmandoAtributo]
          const maxV = maxAtrib[confirmandoAtributo]
          const pctMax = Math.round((vJ / maxV) * 100)
          return (
            <div className="tt-confirm-overlay">
              <div className="tt-confirm-modal">
                <span className="tt-confirm-label">{tt('confirmar_atributo')}</span>
                <span className="tt-confirm-attr-nome">{attr ? tt(attr.nomeKey) : ''}</span>
                <div className="tt-confirm-values">
                  <div className="tt-confirm-value-box">
                    <span className="tt-confirm-value-label">{tt('seu_valor')}</span>
                    <span className="tt-confirm-value-num">{vJ}</span>
                  </div>
                  <div className="tt-confirm-value-box">
                    <span className="tt-confirm-value-label">{tt('valor_maximo')}</span>
                    <span className="tt-confirm-value-num tt-confirm-value-max">{maxV}</span>
                  </div>
                </div>
                <div className="tt-confirm-bar">
                  <div className="tt-confirm-bar-fill" ref={el => { if (el) el.style.width = `${pctMax}%` }} />
                </div>
                <span className="tt-confirm-pct">{tt('do_maximo', { pct: pctMax })}</span>
                <div className="tt-confirm-buttons">
                  <button className="tt-confirm-btn tt-confirm-btn--cancel" onClick={cancelarJogada}>{tt('cancelar')}</button>
                  <button className="tt-confirm-btn tt-confirm-btn--ok" onClick={confirmarJogada}>{tt('confirmar')}</button>
                </div>
              </div>
            </div>
          )
        })()}

        {cortinaAtiva && (
          <div className="tt-curtain-overlay">
            <div className="tt-curtain-inner" />
            <div className="tt-curtain-onomatopeia">
              <span className="tt-onoma-texto">{onomaTexto}</span>
            </div>
          </div>
        )}

        {/* DESISTIR confirmation modal */}
        {showDesistirModal && (
          <div className="tt-desistir-overlay" onClick={() => setShowDesistirModal(false)}>
            <div className="tt-desistir-modal" onClick={e => e.stopPropagation()}>
              <h3 className="tt-desistir-modal-titulo">{tt('desistir_modal_titulo')}</h3>
              <p className="tt-desistir-modal-desc">{tt('desistir_modal_desc')}</p>
              <div className="tt-desistir-modal-actions">
                <button className="tt-desistir-modal-btn tt-desistir-modal-btn--cancel" onClick={() => { sfx.click(); setShowDesistirModal(false); }}>{tt('cancelar')}</button>
                <button className="tt-desistir-modal-btn tt-desistir-modal-btn--confirm" onClick={handleDesistir}>{tt('desistir_modal_confirmar')}</button>
              </div>
            </div>
          </div>
        )}
      </section>
      </>
    )
  }

  if (fase === 'resultado_rodada') {
    if (!cartaJogador || !cartaIA) return null
    const attr = atributos.find(a => a.id === atributoEscolhido)
    const locale = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)
    const vJ = cartaJogador.atributos[atributoEscolhido]
    const vI = cartaIA.atributos[atributoEscolhido]
    return (
      <>
        <div className="tt-fire-particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="tt-fire-particle" />
          ))}
        </div>
        <section className="tt-page">
        <button className="tt-sound-toggle" onClick={toggleSom} title={somAtivo ? tt('som_desativar') : tt('som_ativar')}>
          {somAtivo ? '🔊' : '🔇'}
        </button>
        {particulas.map(p => (
          <div key={p.id} className={`tt-particula tt-particula--${p.tipo} tt-particula--v${p.variante}`} />
        ))}
        <div className="tt-result-container">
          <div className="tt-game-header">
            <div className="tt-game-round">
              {tt('hud_rodada', { n: rodada, total: totalTurnos })}
            </div>
            <div className="tt-game-score">
              <span className="tt-score-you">{placar.jogador}</span>
              <span className="tt-score-sep">:</span>
              <span className="tt-score-ai">{placar.ia}</span>
            </div>
          </div>
          <div className={`tt-result-badge ${
            resultado === 'ganhou' ? 'tt-result-win' :
            resultado === 'perdeu' ? 'tt-result-lose' :
            'tt-result-draw'
          }`}>
            {resultado === 'ganhou' ? tt('voce_venceu') :
             resultado === 'perdeu' ? tt('ia_venceu') :
             tt('empate')}
          </div>
          {attr && (
            <div className="tt-result-attr-comparison">
              <div className="tt-result-attr-name">{tt(attr.nomeKey)}</div>
              <div className="tt-result-values">
                <span className="tt-result-val-you">{vJ}</span>
                <span className="tt-result-val-sep">×</span>
                <span className="tt-result-val-ai">{vI}</span>
              </div>
            </div>
          )}
          <div className="tt-cards-swipe-container">
            <div className={`tt-cards-swipe-track${swipeRevealed ? ' tt-cards-swipe-track--revealed' : ''}`}>
              <div className="tt-swipe-card-slot">
                <span className="tt-swipe-label">{tt('sua_carta')}</span>
                <TopTrumpsCard
                  characterImage={bgCarta(cartaJogador)}
                  name={cartaJogador.nome}
                  description={cartaJogador.descricao}
                  locale={locale}
                  attributes={cartaJogador.atributos}
                  disabled={true}
                  templateIndex={templateIdxJogador}
                />
              </div>
              <div className="tt-swipe-card-slot">
                <span className="tt-swipe-label">{tt('carta_adversario')}</span>
                <TopTrumpsCard
                  characterImage={bgCarta(cartaIA)}
                  name={cartaIA.nome}
                  description={cartaIA.descricao}
                  locale={locale}
                  attributes={cartaIA.atributos}
                  disabled={true}
                  templateIndex={templateIdxIA}
                />
              </div>
            </div>
            <button
              className={`tt-swipe-btn${swipeRevealed ? ' tt-swipe-btn--left' : ' tt-swipe-btn--right'}`}
              onClick={() => setSwipeRevealed(r => !r)}
              aria-label={swipeRevealed ? tt('swipe_voltar') : tt('swipe_ver_adversario')}
            >
              {swipeRevealed ? '←' : '→'}
            </button>
          </div>
          <button className="tt-btn-next-round" onClick={proximaRodada}>
            {rodada >= totalTurnos ? tt('result_final') : tt('proxima_rodada')}
          </button>
        </div>
      </section>
      </>
    )
  }

  if (fase === 'recompensa') {
    const locale = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)
    return (
      <section className="tt-page">
        {/* Sound toggle */}
        <button className="tt-sound-toggle" onClick={toggleSom} title={somAtivo ? tt('som_desativar') : tt('som_ativar')}>
          {somAtivo ? '🔊' : '🔇'}
        </button>
        <div className="tt-recompensa">
          <h2 className="tt-recompensa-titulo">{tt('recompensa_titulo')}</h2>
          <p className="tt-recompensa-sub">{tt('recompensa_sub')}</p>
          <div className="tt-recompensa-cards">
            {recompensaOpcoes.map((carta) => (
              <div key={carta.id} className={`tt-recompensa-card${cartaRecompensaSelecionada?.id === carta.id ? ' tt-recompensa-card--virada' : ''}`} onClick={() => { sfx.select(); setCartaRecompensaSelecionada(carta); }}>
                {cartaRecompensaSelecionada?.id === carta.id ? (
                  <TopTrumpsCard
                    characterImage={bgCarta(carta)}
                    name={carta.nome}
                    description={carta.descricao}
                    locale={locale}
                    attributes={carta.atributos}
                    templateIndex={0}
                  />
                ) : (<div className="tt-recompensa-card-verso"><span className="tt-recompensa-card-verso-texto">?</span><p className="tt-recompensa-card-verso-label">{tt('recompensa_carta_misteriosa')}</p></div>)}
              </div>
            ))}
          </div>
                <button className="tt-btn-confirmar" disabled={!cartaRecompensaSelecionada} onClick={() => { sfx.reward(); escolherRecompensa(cartaRecompensaSelecionada); }}>{tt('recompensa_confirmar')}</button>
        </div>
      </section>
    )
  }

  if (fase === 'fim_jogo') {
    const venceu = placar.jogador > placar.ia
    const empatou = placar.jogador === placar.ia
    const rodadasJogadas = historicoRodadas.length
    const derrotas = historicoRodadas.filter(h => h.resultado === 'perdeu').length
    const empates = historicoRodadas.filter(h => h.resultado === 'empate').length
    const freqAttr = {}
    historicoRodadas.forEach(h => { freqAttr[h.atributo] = (freqAttr[h.atributo] || 0) + 1 })
    const attrMaisEscolhido = Object.entries(freqAttr).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    let melhorDiferenca = -1, melhorRodada = null
    historicoRodadas.forEach(h => {
      if (h.resultado === 'ganhou') {
        const attr = atributos.find(a => a.nome === h.atributo)
        const diff = h.valorJogador - h.valorIA
        if (diff > melhorDiferenca) { melhorDiferenca = diff; melhorRodada = h }
      }
    })
    const icone = venceu ? '🏆' : empatou ? '🤝' : '💀'
    const titulo = venceu ? tt('result_voce_venceu') : empatou ? tt('result_empate') : tt('result_ia_venceu')
    return (
      <section className="tt-page">
        {/* Sound toggle */}
        <button className="tt-sound-toggle" onClick={toggleSom} title={somAtivo ? tt('som_desativar') : tt('som_ativar')}>
          {somAtivo ? '🔊' : '🔇'}
        </button>
        <div className="tt-relatorio">
          <h2 className="tt-relatorio-titulo">{tt('relatorio_titulo')}</h2>
          <p className="tt-relatorio-sub">{tt('relatorio_sub')}</p>
          <div className="tt-relatorio-icone">{icone}</div>
          <h3 className={`tt-relatorio-resultado${venceu ? ' tt-fim-titulo--vitoria' : empatou ? ' tt-fim-titulo--empate' : ' tt-fim-titulo--derrota'}`}>{titulo}</h3>
          {!user && (
            <p className="tt-guest-cta">
              {tt('guest_cta_criar_conta')}{' '}
              <Link to="/cadastro">{tt('guest_cta_link')}</Link>
            </p>
          )}
          <div className="tt-relatorio-placar">
            <div className="tt-relatorio-placar-item"><span className="tt-relatorio-placar-valor">{placar.jogador}</span><span className="tt-relatorio-placar-label">{tt('relatorio_voce')}</span></div>
            <span className="tt-relatorio-placar-divisor">×</span>
            <div className="tt-relatorio-placar-item"><span className="tt-relatorio-placar-valor">{placar.ia}</span><span className="tt-relatorio-placar-label">{tt('relatorio_ia_label')}</span></div>
          </div>
          <div className="tt-relatorio-stats">
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{rodadasJogadas}</span><span className="tt-relatorio-stat-label">{tt('relatorio_rodadas')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{placar.jogador}</span><span className="tt-relatorio-stat-label">{tt('relatorio_vitorias')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{derrotas}</span><span className="tt-relatorio-stat-label">{tt('relatorio_derrotas')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{empates}</span><span className="tt-relatorio-stat-label">{tt('relatorio_empates')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{attrMaisEscolhido}</span><span className="tt-relatorio-stat-label">{tt('relatorio_attr_usado')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{melhorRodada?.cartaJogador.nome || '—'}</span><span className="tt-relatorio-stat-label">{tt('relatorio_melhor_vitoria')}</span></div>
          </div>
          <div className="tt-relatorio-lista">
            <h4 className="tt-relatorio-lista-titulo">{tt('relatorio_confrontos')}</h4>
            {historicoRodadas.map((h, i) => (<div key={i} className="tt-relatorio-lista-item"><span className="tt-relatorio-lista-icon">{h.resultado === 'ganhou' ? '✓' : h.resultado === 'perdeu' ? '✗' : '='}</span><span className="tt-relatorio-lista-nome">{h.cartaJogador.nome} vs {h.cartaIA.nome}</span><span className="tt-relatorio-lista-attr">{h.atributo}</span><span className="tt-relatorio-lista-valor">{h.valorJogador} × {h.valorIA}</span></div>))}
          </div>
          {venceu && jaGanhouHoje && <p className="tt-fim-aviso">{tt('relatorio_ja_ganhou')}</p>}
          <div className="tt-fim-actions">
            <button className="tt-btn-jogar" onClick={() => { sfx.click(); setFase('menu'); }}>{tt('btn_jogar_novamente')}</button>
            <BackToGamesBtn onClick={() => { sfx.click(); setFase('menu'); }} label={tt('menu_voltar_menu')} />
          </div>
        </div>
      </section>
    )
  }

  return null
}
