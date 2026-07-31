import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { getDeck } from '../../../lib/getDeck'
import { useAchievements } from '../../../context/AchievementsContext'
import { useReader } from '../../../context/ReaderContext'
import { supabase } from '../../../lib/supabase'
import { subscribeToSala, subscribeToMovimentos, subscribeToMatchPresence, registrarMovimento, atualizarSala, encerrarSala, incrementarPartidaDiaria, atualizarMPStats, escolherPPT, finalizarPPT } from '../../../hooks/useTopTrumpsMP'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { sfx } from '../../../lib/sfx'
import { getTopTrumpsCardImage } from '../../../lib/topTrumpsCardImages'
import MultiplayerGameScreen from './components/multiplayer/MultiplayerGameScreen'
import ResultScreen from './components/ResultScreen/ResultScreen'
import { ordenarDeckDeterministico } from './utils/deterministicDeck'
import './TopTrumpsMP.css'

let __heartbeatRodando = false

function logMP(evento, detalhes = {}) {
  console.log(`[TTMP:${evento}]`, {
    horario: new Date().toISOString(),
    ...detalhes
  })
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

function avatarCor(id) {
  let hash = 0; for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${hash % 360}, 65%, 45%)`
}

import { TM_VERSION } from '../../../config/version'
export default function TopTrumpsMP() {
  const { t, tt, locale } = useLanguage()
  const deck = getDeck(locale)
  const todasCartas = deck.cartas
  const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({
    id, nomeKey: attrNomeKey(id),
    descricao
  }))
  const { setReaderMode } = useReader()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, perfil } = useAuth()
  const { desbloquear } = useAchievements()
  const desbloquearRef = useRef(desbloquear)
  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])

  // Reader mode
  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  // ── Sound toggle ──
  const [somAtivo, setSomAtivo] = useState(sfx.enabled)
  function toggleSom() {
    const novo = sfx.toggle()
    setSomAtivo(novo)
  }

  const salaId = searchParams.get('sala')

  const [sala, setSala] = useState(null)
  const [fase, setFase] = useState('carregando')
  const [cartaLocal, setCartaLocal] = useState(null)
  const [cartaOponente, setCartaOponente] = useState(null)
  const [atributoEscolhido, setAtributoEscolhido] = useState(null)
  const [resultadoRodada, setResultadoRodada] = useState(null)
  const [tempoRestante, setTempoRestante] = useState(30)
  const [rodadaLiberada, setRodadaLiberada] = useState(false)
  const [movimentoRecebido, setMovimentoRecebido] = useState(false)
  const [ultimoMovimento, setUltimoMovimento] = useState(null)
  const [girando, setGirando] = useState(false)
  const [cartaSelecionada, setCartaSelecionada] = useState(null)
  const [jaMovi, setJaMovi] = useState(false)
  const [swipeRevealed, setSwipeRevealed] = useState(false)
  const [resultadoTempo, setResultadoTempo] = useState(30)
  const [prontoLocal, setProntoLocal] = useState(false)
  const [prontoOponente, setProntoOponente] = useState(false)
  const ehMinhaVez = Boolean(user?.id && sala?.jogador_da_vez === user.id)

  // ── Heartbeat contínuo durante o jogo (igual ao SP) ──
  useEffect(() => {
    if (fase === 'jogando' && rodadaLiberada && !jaMovi) {
      if (!__heartbeatRodando) {
        sfx.startHeartbeatLoop()
        __heartbeatRodando = true
      }
    } else {
      sfx.stopHeartbeatLoop()
      __heartbeatRodando = false
    }
    return () => { sfx.stopHeartbeatLoop(); __heartbeatRodando = false }
  }, [fase, rodadaLiberada, jaMovi])
  const [meuPapel, setMeuPapel] = useState(null)
  const [deckLocal, setDeckLocal] = useState([])
  const [deckOponente, setDeckOponente] = useState([])
  const [oponenteNome, setOponenteNome] = useState('Oponente')
  const [pptEscolhi, setPptEscolhi] = useState(false)
  const [pptEscolhaOponente, setPptEscolhaOponente] = useState(null)
  const [pptResultado, setPptResultado] = useState(null)
  const [pptAmbosEscolheram, setPptAmbosEscolheram] = useState(false)

  // Onomatopoeias da cortina
  const ONOMATOPEIAS = [
    'KABOOM!', 'POW!', 'CRASH!', 'BOOM!', 'WHAM!',
    'BLAM!', 'KRAK!', 'SMASH!', 'BANG!', 'ZAP!',
    'KABLAM!', 'THWACK!', 'CRUNCH!', 'SLAM!', 'KAPOW!',
    'WHACK!', 'BAM!', 'CLANG!', 'KRAKOOM!', 'SWISH!'
  ]
  const [onomaTexto, setOnomaTexto] = useState('KABOOM!')
  const [cortinaAtiva, setCortinaAtiva] = useState(false)
  const [particulas, setParticulas] = useState([])

  function sortearOnomatopeia() {
    const idx = Math.floor(Math.random() * ONOMATOPEIAS.length)
    setOnomaTexto(ONOMATOPEIAS[idx])
  }

  const salaRef = useRef(sala)
  const faseRef = useRef(fase)
  const meuPapelRef = useRef(meuPapel)
  const cartaLocalRef = useRef(cartaLocal)
  const deckOponenteRef = useRef(deckOponente)
  const salaPendenteRef = useRef(null)
  const turnosEmProcessamentoRef = useRef(new Set())
  const turnosProcessadosRef = useRef(new Set())
  const jogadaEmEnvioRef = useRef(false)
  const presenceChannelRef = useRef(null)
  const rodadaAvancandoRef = useRef(false)

  useEffect(() => { salaRef.current = sala }, [sala])
  useEffect(() => { meuPapelRef.current = meuPapel }, [meuPapel])
  useEffect(() => { cartaLocalRef.current = cartaLocal }, [cartaLocal])
  useEffect(() => { faseRef.current = fase }, [fase])
  useEffect(() => { deckOponenteRef.current = deckOponente }, [deckOponente])

  useEffect(() => {
    const cartas = [cartaLocal, cartaOponente].filter(Boolean)
    cartas.forEach((carta) => {
      const imagem = new Image()
      imagem.src = getTopTrumpsCardImage(carta)
    })
  }, [cartaLocal, cartaOponente])

  useEffect(() => {
    if (fase !== 'jogando' || !sala?.id || !sala?.turno_atual) {
      setRodadaLiberada(false)
      return
    }
    setRodadaLiberada(false)
    logMP('BARREIRA_FECHADA', {
      salaId: sala.id,
      turno: sala.turno_atual,
      duracaoMs: 5000
    })
    const timer = setTimeout(() => {
      setRodadaLiberada(true)
      logMP('BARREIRA_LIBERADA', {
        salaId: sala.id,
        turno: sala.turno_atual,
        jogadorDaVez: sala.jogador_da_vez,
        meuJogadorId: user?.id,
        ehMinhaVez: sala.jogador_da_vez === user?.id
      })
    }, 5000)
    return () => clearTimeout(timer)
  }, [fase, sala?.id, sala?.turno_atual])

  const placar = sala ? {
    eu: meuPapel === 'j1' ? (sala.pontos_j1 || 0) : (sala.pontos_j2 || 0),
    oponente: meuPapel === 'j1' ? (sala.pontos_j2 || 0) : (sala.pontos_j1 || 0)
  } : { eu: 0, oponente: 0 }

  useEffect(() => {
    if (!salaId || !user) return;
    (async () => {
      const { data } = await supabase.from('toptrumps_salas').select('*').eq('id', salaId).single()
      if (!data) { setFase('fim'); return }
      setSala(data)
      const papel = data.jogador1_id === user.id ? 'j1' : data.jogador2_id === user.id ? 'j2' : null
      setMeuPapel(papel)
      if (data.status === 'em_jogo' && data.carta_aposta_j1 === -1) {
        setFase('jogando')
      } else if (data.status === 'em_jogo') {
        setFase('ppt')
        if (papel === 'j1' ? data.aposta_confirmada_j1 : data.aposta_confirmada_j2) {
          setPptEscolhi(true)
        }
      }

      const opId = data.jogador1_id === user.id ? data.jogador2_id : data.jogador1_id
      if (opId) {
        const { data: profile } = await supabase.from('profiles').select('nome').eq('id', opId).single()
        if (profile?.nome) setOponenteNome(profile.nome)
      }
    })()
  }, [salaId, user])

  useEffect(() => {
    if (!user || !sala?.total_turnos) return;
    (async () => {
      const { data: meuDeck } = await supabase.from('toptrumps_decks').select('carta_id').eq('user_id', user.id).order('carta_id', { ascending: true })
      if (!meuDeck?.length) return
      // Dedup por carta_id (deck antigo pode ter duplicatas)
      const vistos = new Set()
      const cartas = meuDeck
        .map(d => d.carta_id)
        .filter(id => {
          if (vistos.has(id)) return false
          vistos.add(id)
          return true
        })
        .map(id => todasCartas.find(c => c.id === id))
        .filter(Boolean)
      if (!cartas.length) return
      // Embaralha para não usar sempre as mesmas cartas na ordem do banco
      const embaralhadas = ordenarDeckDeterministico(cartas, sala.id, user.id)
      const qtd = Math.min(sala.total_turnos, embaralhadas.length)
      setDeckLocal(embaralhadas.slice(0, qtd))
    })()
  }, [user?.id, sala?.id, sala?.total_turnos])

  useEffect(() => {
    if (!salaId || !user) return
    ;(async () => {
      const { data: s } = await supabase.from('toptrumps_salas').select('*').eq('id', salaId).single()
      if (!s) return
      const opId = s.jogador1_id === user.id ? s.jogador2_id : s.jogador1_id
      if (!opId) return
      const qtd = s.total_turnos
      const { data: deckOpp } = await supabase
        .from('toptrumps_decks')
        .select('carta_id')
        .eq('user_id', opId)
        .order('carta_id', { ascending: true })
      if (!deckOpp?.length) return
      // Dedup por carta_id
      const vistos = new Set()
      const cartasOpp = deckOpp
        .map(d => d.carta_id)
        .filter(id => {
          if (vistos.has(id)) return false
          vistos.add(id)
          return true
        })
        .map(id => todasCartas.find(c => c.id === id))
        .filter(Boolean)
      // Embaralha para variedade
      const embaralhadas = ordenarDeckDeterministico(cartasOpp, s.id, opId)
      setDeckOponente(embaralhadas.slice(0, qtd))
    })()
  }, [salaId, user?.id, sala?.jogador1_id, sala?.jogador2_id])

  useEffect(() => {
    if (!deckLocal.length || !sala) return
    const idx = Math.min((sala.turno_atual || 1) - 1, deckLocal.length - 1)
    setCartaLocal(deckLocal[idx])
  }, [deckLocal, sala?.turno_atual])

  useEffect(() => {
    if (!sala?.id || !sala?.turno_atual) return
    jogadaEmEnvioRef.current = false
    rodadaAvancandoRef.current = false
    setProntoLocal(false)
    setProntoOponente(false)
    setResultadoTempo(30)
    setJaMovi(false)
    setMovimentoRecebido(false)
    setUltimoMovimento(null)
    setTempoRestante(30)
    logMP('TURNO_REARMADO', {
      salaId: sala.id,
      turno: sala.turno_atual,
      jogadorDaVez: sala.jogador_da_vez,
      meuJogadorId: user?.id
    })
  }, [sala?.id, sala?.turno_atual])

  useEffect(() => {
    if (fase !== 'fim') return
    const resultadoMeu = meuPapel === 'j1' ? 'j1_venceu' : 'j2_venceu'
    const temResultadoOficial = sala?.resultado === 'j1_venceu' || sala?.resultado === 'j2_venceu' || sala?.resultado === 'empate'
    const venceu = temResultadoOficial ? sala.resultado === resultadoMeu : placar.eu > placar.oponente
    const empatou = temResultadoOficial ? sala.resultado === 'empate' : placar.eu === placar.oponente
    if (venceu) sfx.win()
    else if (empatou) sfx.draw()
    else sfx.lose()
    logMP('RETORNO_LOBBY_AGENDADO', {
      salaId: sala?.id,
      atrasoMs: 5000
    })
    const timer = setTimeout(() => {
      navigate('/games/toptrumps/lobby', { replace: true })
    }, 5000)
    return () => clearTimeout(timer)
  }, [fase, navigate, placar.eu, placar.oponente, meuPapel, sala?.id, sala?.resultado])

  useEffect(() => {
    const bloqueios = {
      rodadaNaoLiberada: !rodadaLiberada,
      naoEhMinhaVez: !ehMinhaVez,
      faseInvalida: fase !== 'jogando',
      jaMoveu: jaMovi,
      salaAusente: !sala,
      cartaAusente: !cartaLocal
    }
    logMP('TIMER_AVALIADO', {
      salaId: sala?.id,
      turno: sala?.turno_atual,
      cartaId: cartaLocal?.id,
      bloqueios
    })
    if (Object.values(bloqueios).some(Boolean)) return
    logMP('TIMER_INICIADO', {
      salaId: sala.id,
      turno: sala.turno_atual,
      cartaId: cartaLocal.id,
      jogadorId: user?.id
    })
    setTempoRestante(30)
    const iv = setInterval(() => {
      setTempoRestante(t => {
        if (t <= 1) {
          clearInterval(iv)
          sfx.timerUrgent()
          // rank_sdr não é atributo jogável (apenas informativo na carta)
          const attrs = atributos.filter(a => a.id !== 'rank_sdr').map(a => a.id)
          const rand = attrs[Math.floor(Math.random() * attrs.length)]
          const s = salaRef.current
          const idxOp = ((s.turno_atual || 1) - 1) % Math.max(deckOponenteRef.current.length, 1)
          const cartaOp = deckOponenteRef.current[idxOp] || null
          registrarMovimento(s.id, user.id, cartaLocalRef.current?.id, rand, true, cartaOp?.id || null).then((resultado) => {
            logMP('JOGADA_TIMEOUT', {
              salaId: s.id,
              turnoLocal: s.turno_atual,
              movimento: resultado?.data,
              erro: resultado?.error || null
            })
            if (!resultado?.error) setJaMovi(true)
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [rodadaLiberada, ehMinhaVez, fase, sala?.id, sala?.turno_atual, jaMovi, cartaLocal?.id, user?.id])

  function liberarProximaRodada(motivo) {
    if (rodadaAvancandoRef.current) return
    rodadaAvancandoRef.current = true
    logMP('RESULTADO_LIBERADO', { salaId: salaRef.current?.id, turno: salaRef.current?.turno_atual, motivo })
    seguirParaProximaRodada()
  }

  function confirmarProximaRodada() {
    const turno = salaRef.current?.turno_atual
    if (!turno || prontoLocal) return
    setProntoLocal(true)
    logMP('RESULTADO_CONFIRMADO', { salaId, turno, jogadorId: user?.id })
    presenceChannelRef.current?.track({
      user_id: user.id,
      ready_turn: turno,
      online_at: new Date().toISOString()
    })
  }

  function seguirParaProximaRodada() {
    const s = salaPendenteRef.current || salaRef.current
    if (!s) return
    logMP('PROXIMA_RODADA', {
      salaId: s.id,
      turno: s.turno_atual,
      status: s.status,
      tinhaSalaPendente: Boolean(salaPendenteRef.current)
    })
    if (salaPendenteRef.current) {
      salaPendenteRef.current = null
      salaRef.current = s
      const idxCarta = Math.min((s.turno_atual || 1) - 1, deckLocal.length - 1)
      if (deckLocal[idxCarta]) setCartaLocal(deckLocal[idxCarta])
      setSala(s)
    }
    sfx.click()
    if (s.status === 'encerrada' || s.turno_atual > s.total_turnos) {
      sfx.nextRound()
      setFase('fim')
      return
    }
    sfx.nextRound()
    setAtributoEscolhido(null)
    setResultadoRodada(null)
    setMovimentoRecebido(false)
    setJaMovi(false)
    setCartaOponente(null)
    setUltimoMovimento(null)
    setGirando(false)
    setSwipeRevealed(false)
    setFase('jogando')
  }

  function jogarAtributo(atributoId) {
    if (!rodadaLiberada || !ehMinhaVez || fase !== 'jogando' || !sala || jaMovi || jogadaEmEnvioRef.current || !cartaLocal || girando) {
      logMP('JOGADA_BLOQUEADA', {
        atributo: atributoId,
        salaId: sala?.id,
        turno: sala?.turno_atual,
        cartaId: cartaLocal?.id,
        rodadaLiberada,
        ehMinhaVez,
        fase,
        jaMovi,
        enviando: jogadaEmEnvioRef.current,
        girando
      })
      return
    }
    jogadaEmEnvioRef.current = true
    sfx.click()
    sfx.select()
    const idxOp = ((sala.turno_atual || 1) - 1) % Math.max(deckOponente.length, 1)
    const cartaOp = deckOponente[idxOp] || null
    logMP('JOGADA_ENVIANDO', {
      salaId: sala.id,
      turnoLocal: sala.turno_atual,
      jogadorId: user.id,
      cartaId: cartaLocal.id,
      atributo: atributoId
    })
    registrarMovimento(sala.id, user.id, cartaLocal.id, atributoId, false, cartaOp?.id || null).then((resultado) => {
      logMP('JOGADA_CONFIRMADA', {
        salaId: sala.id,
        turnoLocal: sala.turno_atual,
        movimento: resultado?.data,
        erro: resultado?.error || null
      })
      if (!resultado?.error) setJaMovi(true)
      else jogadaEmEnvioRef.current = false
    })
  }

  function gerarParticulasMP(tipo) {
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

  function iniciarRevelacao(resultadoFinal) {
    setSwipeRevealed(false)
    sfx.cardFlip()
    sfx.vs()
    sfx.startHeartbeatLoop()
    __heartbeatRodando = true
    setGirando(true)
    setTimeout(() => {
      sortearOnomatopeia()
      setCortinaAtiva(true)
    }, 600)
    setTimeout(() => {
      sfx.stopHeartbeatLoop()
      __heartbeatRodando = false
      setGirando(false)
      setCortinaAtiva(false)
      if (resultadoFinal === 'ganhou') sfx.win()
      else if (resultadoFinal === 'empate') sfx.draw()
      else sfx.lose()
      gerarParticulasMP(resultadoFinal)
      setFase('revelacao')
    }, 1800)
  }

  useEffect(() => {
    if (fase !== 'revelacao') return
    setResultadoTempo(30)
    const interval = setInterval(() => {
      setResultadoTempo(tempo => {
        if (tempo <= 1) {
          clearInterval(interval)
          liberarProximaRodada('tempo-esgotado')
          return 0
        }
        return tempo - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [fase, sala?.turno_atual])

  async function resolverRodada(turnoMovimento, origem = 'realtime') {
    let chaveTurno = null
    try {
      const salaAtual = salaRef.current
      if (!salaAtual) { return }
      const turnoAlvo = turnoMovimento ?? salaAtual.turno_atual
      chaveTurno = `${salaAtual.id}:${turnoAlvo}`
      if (turnosEmProcessamentoRef.current.has(chaveTurno) || turnosProcessadosRef.current.has(chaveTurno)) {
        logMP('RODADA_IGNORADA', {
          salaId: salaAtual.id,
          turno: turnoAlvo,
          origem,
          processando: turnosEmProcessamentoRef.current.has(chaveTurno),
          processada: turnosProcessadosRef.current.has(chaveTurno)
        })
        return
      }
      turnosEmProcessamentoRef.current.add(chaveTurno)
      logMP('RODADA_RESOLVENDO', {
        salaId: salaAtual.id,
        turno: turnoAlvo,
        turnoSalaLocal: salaAtual.turno_atual,
        fase: faseRef.current,
        origem
      })
      const s = { ...salaAtual, turno_atual: turnoAlvo }
      const { data: movs, error: errMovs } = await supabase
        .from('toptrumps_movimentos')
        .select('*')
        .eq('sala_id', s.id)
        .eq('turno', turnoAlvo)
        .order('criado_em', { ascending: true })
      if (errMovs) { console.error('[MP] resolverRodada erro:', errMovs); return }
      logMP('RODADA_MOVIMENTOS', {
        salaId: s.id,
        turno: turnoAlvo,
        origem,
        quantidade: movs?.length || 0,
        movimentos: (movs || []).map(m => ({
          id: m.id,
          jogadorId: m.jogador_id,
          atributo: m.atributo,
          cartaId: m.carta_id
        }))
      })
      const movimentosUnicos = Array.from(
        new Map((movs || []).map(movimento => [movimento.jogador_id, movimento])).values()
      )
      if (movimentosUnicos.length !== (movs?.length || 0)) {
        logMP('RODADA_DUPLICATAS_DESCARTADAS', {
          salaId: s.id,
          turno: turnoAlvo,
          recebidos: movs.length,
          validos: movimentosUnicos.length
        })
      }

      // Caso padrão: dois movimentos (ambos jogadores jogaram)
      if (movimentosUnicos.length >= 2) {
        const movJ1 = movimentosUnicos.find(m => m.jogador_id === s.jogador1_id)
        const movJ2 = movimentosUnicos.find(m => m.jogador_id === s.jogador2_id)
        if (!movJ1 || !movJ2) return

        const cartaJ1 = todasCartas.find(c => c.id === movJ1.carta_id)
        const cartaJ2 = todasCartas.find(c => c.id === movJ2.carta_id)
        if (!cartaJ1 || !cartaJ2) return

        const attr = atributos.find(a => a.id === movJ1.atributo)
        if (!attr) return

        const v1 = cartaJ1.atributos[movJ1.atributo]
        const v2 = cartaJ2.atributos[movJ2.atributo]

        let res
        res = v1 > v2 ? 'j1_venceu' : v1 < v2 ? 'j2_venceu' : 'empate'

        // segue lógica existente para atualizar estado e sala
        const papel = s.jogador1_id === user.id ? 'j1' : 'j2'
        const ganhei = (papel === 'j1' && res === 'j1_venceu') || (papel === 'j2' && res === 'j2_venceu')
        const empatou = res === 'empate'

        setResultadoRodada(ganhei ? 'ganhou' : empatou ? 'empate' : 'perdeu')
        setAtributoEscolhido(movJ1.atributo)
        setCartaLocal(papel === 'j1' ? cartaJ1 : cartaJ2)
        setCartaOponente(papel === 'j1' ? cartaJ2 : cartaJ1)

        const novosPontosJ1 = (s.pontos_j1 || 0) + (res === 'j1_venceu' ? 1 : 0)
        const novosPontosJ2 = (s.pontos_j2 || 0) + (res === 'j2_venceu' ? 1 : 0)
        const novoTurno = s.turno_atual + 1
        const proximoJogador = s.jogador_da_vez === s.jogador1_id ? s.jogador2_id : s.jogador1_id
        const fim = novoTurno > s.total_turnos
        const resultadoFinal = ganhei ? 'ganhou' : empatou ? 'empate' : 'perdeu'

        const souAutoridade = user.id === s.jogador1_id
        if (!souAutoridade) {
          logMP('RODADA_AGUARDANDO_AUTORIDADE', {
            salaId: s.id,
            turno: turnoAlvo,
            autoridadeId: s.jogador1_id,
            meuJogadorId: user.id
          })
        } else if (fim) {
          const vencedor = novosPontosJ1 > novosPontosJ2 ? s.jogador1_id : novosPontosJ2 > novosPontosJ1 ? s.jogador2_id : null
          const perdedor = vencedor === s.jogador1_id ? s.jogador2_id : s.jogador1_id

          await atualizarSala(s.id, {
            pontos_j1: novosPontosJ1,
            pontos_j2: novosPontosJ2,
            turno_atual: s.total_turnos,
            status: 'encerrada'
          })

          const cartaVencedor = vencedor === s.jogador1_id ? s.carta_aposta_j1 : s.carta_aposta_j2
          const cartaPerdedor = perdedor === s.jogador1_id ? s.carta_aposta_j1 : s.carta_aposta_j2
          await encerrarSala(s.id, vencedor, perdedor, s.modo, cartaVencedor, cartaPerdedor)
          if (perfil?.tier === 'elite' || perfil?.tier === 'primordial') {
            await atualizarMPStats(s.jogador1_id, novosPontosJ1 > novosPontosJ2 ? 'vitoria' : novosPontosJ1 < novosPontosJ2 ? 'derrota' : 'empate')
            await atualizarMPStats(s.jogador2_id, novosPontosJ2 > novosPontosJ1 ? 'vitoria' : novosPontosJ2 < novosPontosJ1 ? 'derrota' : 'empate')
          }
        } else {
          await atualizarSala(s.id, {
            pontos_j1: novosPontosJ1,
            pontos_j2: novosPontosJ2,
            turno_atual: novoTurno,
            jogador_da_vez: proximoJogador
          })
          salaPendenteRef.current = {
            ...s,
            pontos_j1: novosPontosJ1,
            pontos_j2: novosPontosJ2,
            turno_atual: novoTurno,
            jogador_da_vez: proximoJogador
          }
        }

        turnosProcessadosRef.current.add(chaveTurno)
        logMP('RODADA_RESOLVIDA', { salaId: s.id, turno: turnoAlvo, origem, resultado: resultadoFinal, movimentos: 2 })
        iniciarRevelacao(resultadoFinal)
        return
      }

      if (movimentosUnicos.length === 1) {
        const mov = movimentosUnicos[0]
        const cartaAtiva = todasCartas.find(c => c.id === mov.carta_id)
        if (!cartaAtiva) { return }

        const cartaOponenteObj = mov.carta_id_oponente
          ? todasCartas.find(c => c.id === mov.carta_id_oponente)
          : null

        if (!cartaOponenteObj) { return }

        const attr = atributos.find(a => a.id === mov.atributo)
        if (!attr) return

        let v1, v2
        if (mov.jogador_id === s.jogador1_id) {
          v1 = cartaAtiva.atributos[mov.atributo]
          v2 = cartaOponenteObj.atributos[mov.atributo]
        } else {
          v2 = cartaAtiva.atributos[mov.atributo]
          v1 = cartaOponenteObj.atributos[mov.atributo]
        }

        let res
        res = v1 > v2 ? 'j1_venceu' : v1 < v2 ? 'j2_venceu' : 'empate'

        const papel = s.jogador1_id === user.id ? 'j1' : 'j2'
        const ganhei = (papel === 'j1' && res === 'j1_venceu') || (papel === 'j2' && res === 'j2_venceu')
        const empatou = res === 'empate'

        setResultadoRodada(ganhei ? 'ganhou' : empatou ? 'empate' : 'perdeu')
        setAtributoEscolhido(mov.atributo)
        const souAutorMovimento = mov.jogador_id === user.id
        setCartaLocal(souAutorMovimento ? cartaAtiva : cartaOponenteObj)
        setCartaOponente(souAutorMovimento ? cartaOponenteObj : cartaAtiva)

        const novosPontosJ1 = (s.pontos_j1 || 0) + (res === 'j1_venceu' ? 1 : 0)
        const novosPontosJ2 = (s.pontos_j2 || 0) + (res === 'j2_venceu' ? 1 : 0)
        const novoTurno = s.turno_atual + 1
        const proximoJogador = s.jogador_da_vez === s.jogador1_id ? s.jogador2_id : s.jogador1_id
        const fim = novoTurno > s.total_turnos
        const resultadoFinal = ganhei ? 'ganhou' : empatou ? 'empate' : 'perdeu'

        const souAutoridade = user.id === s.jogador1_id
        if (!souAutoridade) {
          logMP('RODADA_AGUARDANDO_AUTORIDADE', {
            salaId: s.id,
            turno: turnoAlvo,
            autoridadeId: s.jogador1_id,
            meuJogadorId: user.id
          })
        } else if (fim) {
          const vencedor = novosPontosJ1 > novosPontosJ2 ? s.jogador1_id : novosPontosJ2 > novosPontosJ1 ? s.jogador2_id : null
          const perdedor = vencedor === s.jogador1_id ? s.jogador2_id : s.jogador1_id

          await atualizarSala(s.id, {
            pontos_j1: novosPontosJ1,
            pontos_j2: novosPontosJ2,
            turno_atual: s.total_turnos,
            status: 'encerrada'
          })

          const cartaVencedor = vencedor === s.jogador1_id ? s.carta_aposta_j1 : s.carta_aposta_j2
          const cartaPerdedor = perdedor === s.jogador1_id ? s.carta_aposta_j1 : s.carta_aposta_j2
          await encerrarSala(s.id, vencedor, perdedor, s.modo, cartaVencedor, cartaPerdedor)
          if (perfil?.tier === 'elite' || perfil?.tier === 'primordial') {
            await atualizarMPStats(s.jogador1_id, novosPontosJ1 > novosPontosJ2 ? 'vitoria' : novosPontosJ1 < novosPontosJ2 ? 'derrota' : 'empate')
            await atualizarMPStats(s.jogador2_id, novosPontosJ2 > novosPontosJ1 ? 'vitoria' : novosPontosJ2 < novosPontosJ1 ? 'derrota' : 'empate')
          }
        } else {
          await atualizarSala(s.id, {
            pontos_j1: novosPontosJ1,
            pontos_j2: novosPontosJ2,
            turno_atual: novoTurno,
            jogador_da_vez: proximoJogador
          })
          salaPendenteRef.current = {
            ...s,
            pontos_j1: novosPontosJ1,
            pontos_j2: novosPontosJ2,
            turno_atual: novoTurno,
            jogador_da_vez: proximoJogador
          }
        }

        turnosProcessadosRef.current.add(chaveTurno)
        logMP('RODADA_RESOLVIDA', { salaId: s.id, turno: turnoAlvo, origem, resultado: resultadoFinal, movimentos: 1 })
        iniciarRevelacao(resultadoFinal)
        return
      }

      return
    } catch (err) {
      console.error('[MP] resolverRodada erro crítico:', err)
    } finally {
      if (chaveTurno) turnosEmProcessamentoRef.current.delete(chaveTurno)
    }
  }

  // NOTE: Para Top Trumps (um jogador por rodada) não dependemos mais
  // dos refs jaMovi/movimentoRecebido para decidir quando resolver a rodada.
  // A resolução é acionada imediatamente ao receber o INSERT na tabela
  // `toptrumps_movimentos` (veja subscribeToMovimentos abaixo).

  useEffect(() => {
    if (fase !== 'jogando' || !salaId || !sala?.turno_atual) return
    const turnoMonitorado = sala.turno_atual
    const reconciliar = () => resolverRodada(turnoMonitorado, 'reconciliacao')
    const interval = setInterval(reconciliar, 2000)
    return () => clearInterval(interval)
  }, [fase, salaId, sala?.turno_atual])

  useEffect(() => {
    if (fase !== 'carregando' || !salaId) return
    const timer = setTimeout(async () => {
      await supabase.from('toptrumps_salas').delete().eq('id', salaId)
      navigate('/games/toptrumps/lobby', {
        state: { mensagem: tt('sem_oponente') }
      })
    }, 120000)
    return () => clearTimeout(timer)
  }, [fase, salaId, navigate])

  // Heartbeat: atualiza ping a cada 15s durante o jogo
  useEffect(() => {
    if (!salaId || !user || fase !== 'jogando' || !meuPapelRef.current) return
    const coluna = meuPapelRef.current === 'j1' ? 'ultimo_ping_j1' : 'ultimo_ping_j2'
    const atualizarPing = async () => {
      await supabase.from('toptrumps_salas').update({ [coluna]: new Date().toISOString() }).eq('id', salaId)
    }
    atualizarPing()
    const interval = setInterval(async () => {
      await atualizarPing()
    }, 15000)
    return () => clearInterval(interval)
  }, [salaId, user, fase, meuPapel])

  // Watchdog: a cada 20s verifica se oponente desconectou (>60s sem ping)
  useEffect(() => {
    if (!salaId || !user || fase !== 'jogando' || !meuPapelRef.current) return
    const colunaOponente = meuPapelRef.current === 'j1' ? 'ultimo_ping_j2' : 'ultimo_ping_j1'
    const interval = setInterval(async () => {
      const { data: s } = await supabase
        .from('toptrumps_salas')
        .select('*')
        .eq('id', salaId)
        .maybeSingle()
      if (!s) return
      const ultimoPing = s[colunaOponente]
      if (ultimoPing && Date.now() - new Date(ultimoPing).getTime() > 60000) {
        const { error } = await supabase.rpc('encerrar_por_desconexao', { p_sala_id: salaId, p_user_id: user.id })
        if (error) {
          console.error('[MP] erro ao encerrar por desconexão:', error)
          return
        }
        const salaEncerrada = { ...s, status: 'encerrada', resultado: meuPapelRef.current === 'j1' ? 'j1_venceu' : 'j2_venceu' }
        salaRef.current = salaEncerrada
        setSala(salaEncerrada)
        setFase('fim')
      }
    }, 20000)
    return () => clearInterval(interval)
  }, [salaId, user, fase, meuPapel])

  // Presença realtime: encerra assim que o canal confirma a saída do oponente.
  useEffect(() => {
    if (!salaId || !user?.id || !meuPapelRef.current) return
    const channel = subscribeToMatchPresence(salaId, user.id, async (jogadorQueSaiu) => {
      const s = salaRef.current
      const oponenteId = meuPapelRef.current === 'j1' ? s?.jogador2_id : s?.jogador1_id
      if (!s || jogadorQueSaiu !== oponenteId || s.status === 'encerrada' || faseRef.current === 'fim') return
      logMP('OPONENTE_SAIU', { salaId, jogadorQueSaiu })
      const { error } = await supabase.rpc('encerrar_por_desconexao', { p_sala_id: salaId, p_user_id: user.id })
      if (error) {
        console.error('[MP] erro ao encerrar saída realtime:', error)
        return
      }
      const salaEncerrada = { ...s, status: 'encerrada', resultado: meuPapelRef.current === 'j1' ? 'j1_venceu' : 'j2_venceu' }
      salaRef.current = salaEncerrada
      setSala(salaEncerrada)
      setFase('fim')
    }, (presenceState) => {
      const s = salaRef.current
      if (!s?.turno_atual) return
      const oponenteId = meuPapelRef.current === 'j1' ? s.jogador2_id : s.jogador1_id
      const presencas = Object.values(presenceState).flat()
      const confirmouLocal = presencas.some(p => p.user_id === user.id && Number(p.ready_turn) === s.turno_atual)
      const confirmouOponente = presencas.some(p => p.user_id === oponenteId && Number(p.ready_turn) === s.turno_atual)
      setProntoLocal(confirmouLocal)
      setProntoOponente(confirmouOponente)
      if (confirmouLocal && confirmouOponente && faseRef.current === 'revelacao') {
        liberarProximaRodada('ambos-confirmaram')
      }
    })
    presenceChannelRef.current = channel
    return () => {
      presenceChannelRef.current = null
      channel.unsubscribe()
    }
  }, [salaId, user?.id, meuPapel])

  // beforeunload: jogador fechou o browser → ele perde
  useEffect(() => {
    if (!salaId || !user) return
    const handleUnload = () => {
      navigator.sendBeacon(
        'https://dvxfrzixtetdzmdrzkpx.supabase.co/rest/v1/rpc/encerrar_por_desconexao',
        JSON.stringify({ p_sala_id: salaId, p_user_id: user.id })
      )
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [salaId, user])

  useEffect(() => {
    if (!salaId) return
    const sub1 = subscribeToSala(salaId, (p) => {
      const s = p.new
      const anterior = salaRef.current
      if (s.status === 'encerrada' && faseRef.current !== 'revelacao') {
        salaPendenteRef.current = null
        salaRef.current = s
        setSala(s)
        setFase('fim')
        logMP('SALA_ENCERRADA_APLICADA', { salaId, resultado: s.resultado })
        return
      }
      const rodadaEmExibicao = faseRef.current === 'jogando' || faseRef.current === 'revelacao'
      const deveReterSala = rodadaEmExibicao && (
        (anterior && s.turno_atual !== anterior.turno_atual) ||
        s.status === 'encerrada'
      )
      if (deveReterSala) {
        salaPendenteRef.current = s
        logMP('SALA_RETIDA', {
          salaId,
          turnoLocal: anterior?.turno_atual,
          turnoRemoto: s.turno_atual,
          statusRemoto: s.status,
          fase: faseRef.current
        })
        if (anterior?.turno_atual) resolverRodada(anterior.turno_atual, 'sala-avancou')
      } else {
        salaRef.current = s
        setSala(s)
        logMP('SALA_APLICADA', {
          salaId,
          turno: s.turno_atual,
          status: s.status,
          fase: faseRef.current
        })
      }

      // J2 entrou na sala → PPT phase para ambos os clientes
      if (s.status === 'em_jogo' && s.jogador2_id && (!anterior || !anterior.jogador2_id)) {
        setFase('ppt')
        return
      }

      // PPT: ambos escolheram
      if (faseRef.current === 'ppt' && s.aposta_confirmada_j1 && s.aposta_confirmada_j2) {
        const escolhaJ1 = s.carta_aposta_j1
        const escolhaJ2 = s.carta_aposta_j2
        const ehJ1 = meuPapelRef.current === 'j1'
        setPptEscolhaOponente(ehJ1 ? escolhaJ2 : escolhaJ1)
        setPptAmbosEscolheram(true)
        const diff = (3 + escolhaJ1 - escolhaJ2) % 3
        if (diff === 0) setPptResultado('empate')
        else if ((diff === 1 && ehJ1) || (diff === 2 && !ehJ1)) setPptResultado('ganhou')
        else setPptResultado('perdeu')
        return
      }

      // PPT finalizado -> jogando
      if (anterior && s.carta_aposta_j1 === -1 && anterior.carta_aposta_j1 !== -1) {
        setFase('jogando')
        setAtributoEscolhido(null)
        setResultadoRodada(null)
        setMovimentoRecebido(false)
        setJaMovi(false)
        setCartaOponente(null)
        setUltimoMovimento(null)
        return
      }

      if (!deveReterSala && s.status === 'encerrada' && faseRef.current !== 'resultado' && faseRef.current !== 'revelacao') setFase('fim')
    })
    const sub2 = subscribeToMovimentos(salaId, (p) => {
      const mov = p.new
      logMP('MOVIMENTO_REALTIME', {
        salaId,
        turno: mov.turno,
        movimentoId: mov.id,
        jogadorId: mov.jogador_id,
        fase: faseRef.current,
        turnoLocal: salaRef.current?.turno_atual
      })
      setUltimoMovimento(mov)

      const turnoExibido = salaRef.current?.turno_atual
      if (mov.turno === turnoExibido) {
        if (mov.jogador_id === user.id) {
          setJaMovi(true)
        } else {
          setMovimentoRecebido(true)
        }
      } else {
        logMP('MOVIMENTO_ATRASADO_IGNORADO', {
          salaId,
          turnoMovimento: mov.turno,
          turnoExibido,
          movimentoId: mov.id,
          jogadorId: mov.jogador_id
        })
      }

      resolverRodada(mov.turno, 'realtime')
    })
    return () => { sub1.unsubscribe(); sub2.unsubscribe() }
  }, [salaId, user?.id])

  useEffect(() => {
    if (!pptAmbosEscolheram || !salaId) return
    const s = salaRef.current
    if (!s) return
    const escolhaJ1 = s.carta_aposta_j1
    const escolhaJ2 = s.carta_aposta_j2
    const diff = (3 + escolhaJ1 - escolhaJ2) % 3

    const t = setTimeout(async () => {
      if (diff === 0) {
        await supabase.from('toptrumps_salas').update({
          carta_aposta_j1: null,
          carta_aposta_j2: null,
          aposta_confirmada_j1: false,
          aposta_confirmada_j2: false
        }).eq('id', salaId)
        setPptEscolhi(false)
        setPptEscolhaOponente(null)
        setPptResultado(null)
        setPptAmbosEscolheram(false)
      } else {
        const vencedorId = diff === 1 ? s.jogador1_id : s.jogador2_id
        await supabase.from('toptrumps_salas').update({
          jogador_da_vez: vencedorId,
          turno_atual: 1,
          carta_aposta_j1: -1,
          carta_aposta_j2: null,
          aposta_confirmada_j1: false,
          aposta_confirmada_j2: false
        }).eq('id', salaId)
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [pptAmbosEscolheram, salaId])

  if (fase === 'carregando') {
    return (
      <section className="ttmp-page">
        <div className="ttmp-loading">
          <div className="ttmp-loading-spinner" />
          <p>{tt('mp.carregando')}</p>
        </div>
      </section>
    )
  }

  if (fase === 'ppt') {
    const opcoes = [
      { valor: 0, nome: tt('ppt_pedra'), icone: '\u270A' },
      { valor: 1, nome: tt('ppt_papel'), icone: '\u270B' },
      { valor: 2, nome: tt('ppt_tesoura'), icone: '\u270C\uFE0F' }
    ]
    const minhaEscolha = meuPapel === 'j1' ? sala?.carta_aposta_j1 : sala?.carta_aposta_j2
    return (
      <section className="ttmp-page">
        <div className="ttmp-ppt-container">
          <h2 className="ttmp-ppt-titulo">{tt('mp.ppt_titulo')}</h2>
          <p className="ttmp-ppt-subtitulo">{tt('mp.ppt_subtitulo')}</p>
          {!pptAmbosEscolheram ? (
            <>
              <div className="ttmp-ppt-opcoes">
                {opcoes.map(op => (
                  <button key={op.valor}
                    className="ttmp-ppt-btn"
                    disabled={pptEscolhi}
                    onClick={() => {
                      sfx.pptChoice()
                      setPptEscolhi(true)
                      escolherPPT(salaId, user.id, op.valor, meuPapel === 'j1')
                    }}>
                    <span className="ttmp-ppt-icone">{op.icone}</span>
                    <span className="ttmp-ppt-nome">{op.nome}</span>
                  </button>
                ))}
              </div>
              {pptEscolhi && <p className="ttmp-ppt-aguardando">{tt('mp.ppt_aguardando')}</p>}
            </>
          ) : (
            <div className="ttmp-ppt-resultado">
              <div className="ttmp-ppt-jogadores">
                <div className="ttmp-ppt-jogada">
                  <span className="ttmp-ppt-jogada-label">{tt('mp.ppt_voce')}</span>
                  <span className="ttmp-ppt-jogada-icone">
                    {opcoes.find(o => o.valor === minhaEscolha)?.icone}
                  </span>
                </div>
                <div className="ttmp-ppt-jogada">
                  <span className="ttmp-ppt-jogada-label">{oponenteNome}</span>
                  <span className="ttmp-ppt-jogada-icone">
                    {opcoes.find(o => o.valor === pptEscolhaOponente)?.icone}
                  </span>
                </div>
              </div>
              <div className={`ttmp-ppt-resultado-texto ttmp-resultado--${pptResultado}`}>
                {pptResultado === 'ganhou' ? tt('mp.ppt_venceu') : pptResultado === 'perdeu' ? tt('mp.ppt_perdeu') : tt('mp.ppt_empate')}
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  if (fase === 'jogando') {
    if (!cartaLocal) return (
      <section className="ttmp-page">
        <div className="ttmp-loading">
          <div className="ttmp-loading-spinner" />
          <p>{tt('mp.preparando_cartas')}</p>
        </div>
      </section>
    )
    return (
      <MultiplayerGameScreen
        cartaLocal={cartaLocal}
        cartaLocalImg={getTopTrumpsCardImage(cartaLocal)}
        placar={placar}
        rodada={sala?.turno_atual}
        totalTurnos={sala?.total_turnos}
        tempoRestante={tempoRestante}
        oponenteNome={oponenteNome}
        locale={locale}
        rodadaLiberada={rodadaLiberada}
        ehMinhaVez={ehMinhaVez}
        jaMovi={jaMovi}
        girando={girando}
        somAtivo={somAtivo}
        cortinaAtiva={cortinaAtiva}
        onomaTexto={onomaTexto}
        onToggleSom={toggleSom}
        onJogarAtributo={jogarAtributo}
        tt={tt}
      />
    )
  }

  if (fase === 'revelacao') {
    if (!cartaLocal || !cartaOponente) return null
    const resultadoTexto = resultadoRodada === 'ganhou'
      ? tt('mp.revelacao_voce_venceu')
      : resultadoRodada === 'perdeu'
        ? tt('mp.revelacao_oponente_venceu')
        : tt('mp.revelacao_empate')

    return (
      <ResultScreen
        cartaJogador={cartaLocal}
        cartaIA={cartaOponente}
        cartaJogadorImg={getTopTrumpsCardImage(cartaLocal)}
        cartaIAImg={getTopTrumpsCardImage(cartaOponente)}
        atributoEscolhido={atributoEscolhido}
        resultado={resultadoRodada}
        resultadoTexto={resultadoTexto}
        placar={{ jogador: placar.eu, ia: placar.oponente }}
        rodada={sala?.turno_atual}
        totalTurnos={sala?.total_turnos}
        swipeRevealed={swipeRevealed}
        onSwipeToggle={() => setSwipeRevealed(revelada => !revelada)}
        onProximaRodada={confirmarProximaRodada}
        particulas={particulas}
        templateIdxJogador={cartaLocal.id % 6}
        templateIdxIA={cartaOponente.id % 6}
        atributos={atributos}
        locale={locale}
        cartaOponenteTexto={oponenteNome}
        proximaRodadaTexto={tt('mp.revelacao_proxima')}
        aguardandoOponenteTexto={tt('mp.revelacao_aguardando')}
        resultadoTempo={resultadoTempo}
        prontoLocal={prontoLocal}
        prontoOponente={prontoOponente}
        tt={tt}
      />
    )
  }

  if (fase === 'fim') {
    if (!sala) return null
    const resultadoMeu = meuPapel === 'j1' ? 'j1_venceu' : 'j2_venceu'
    const temResultadoOficial = sala.resultado === 'j1_venceu' || sala.resultado === 'j2_venceu' || sala.resultado === 'empate'
    const venceu = temResultadoOficial ? sala.resultado === resultadoMeu : placar.eu > placar.oponente
    const empatou = temResultadoOficial ? sala.resultado === 'empate' : placar.eu === placar.oponente
    return (
      <section className="ttmp-page">
        <div className="ttmp-fim">
          <h2 className="ttmp-fim-titulo">{tt('mp.fim_titulo')}</h2>
          <div className={`ttmp-fim-icone${venceu ? ' ttmp-fim-icone--vitoria' : empatou ? ' ttmp-fim-icone--empate' : ' ttmp-fim-icone--derrota'}`}>
            {venceu ? '🏆' : empatou ? '🤝' : '💀'}
          </div>
          <h3 className={`ttmp-fim-resultado${venceu ? ' ttmp-fim-titulo--vitoria' : empatou ? ' ttmp-fim-titulo--empate' : ' ttmp-fim-titulo--derrota'}`}>
            {venceu ? tt('mp.fim_voce_venceu') : empatou ? tt('mp.fim_empate') : tt('mp.fim_voce_perdeu')}
          </h3>
          <div className="ttmp-fim-placar">
            <div className="ttmp-fim-placar-item">
              <span className="ttmp-fim-placar-valor">{placar.eu}</span>
              <span className="ttmp-fim-placar-label">{tt('mp.fim_voce')}</span>
            </div>
            <span className="ttmp-fim-placar-divisor">×</span>
            <div className="ttmp-fim-placar-item">
              <span className="ttmp-fim-placar-valor">{placar.oponente}</span>
              <span className="ttmp-fim-placar-label">{oponenteNome.toUpperCase()}</span>
            </div>
          </div>
          <div className="ttmp-fim-actions">
            <BackToGamesBtn to="/" onClick={() => sfx.click()} label={tt('mp.fim_voltar_games')} />
          </div>
        </div>
      </section>
    )
  }

  return null
}
