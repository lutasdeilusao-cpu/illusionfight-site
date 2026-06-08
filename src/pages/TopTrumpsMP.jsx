import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { getDeck } from '../lib/getDeck'
import { useAchievements } from '../context/AchievementsContext'
import { useReader } from '../context/ReaderContext'
import { supabase } from '../lib/supabase'
import { subscribeToSala, subscribeToMovimentos, registrarMovimento, atualizarSala, encerrarSala, incrementarPartidaDiaria, atualizarMPStats, escolherPPT, finalizarPPT } from '../hooks/useTopTrumpsMP'
import './TopTrumpsMP.css'

function attrNomeKey(id) {
  const map = {
    rank_sdr: 'games.toptrumps.atributo_rank_sdr',
    poder_mental: 'games.toptrumps.atributo_poder_mental',
    velocidade: 'games.toptrumps.atributo_velocidade',
    resistencia: 'games.toptrumps.atributo_resistencia',
    nivel_xama: 'games.toptrumps.atributo_nivel_xama',
    fator_caos: 'games.toptrumps.atributo_fator_caos',
    energia_base: 'games.toptrumps.atributo_energia_base',
  }
  return map[id] || 'games.toptrumps.atributo_poder_explosivo'
}

function avatarCor(id) {
  let hash = 0; for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${hash % 360}, 65%, 45%)`
}

import { MP_VERSION } from '../config/version'
export default function TopTrumpsMP() {
  const { t, locale } = useLanguage()
  const deck = getDeck(locale)
  const todasCartas = deck.cartas
  const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({
    id, nomeKey: attrNomeKey(id),
    descricao, inverso: id === 'rank_sdr'
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

  const salaId = searchParams.get('sala')

  const [sala, setSala] = useState(null)
  const [fase, setFase] = useState('carregando')
  const [cartaLocal, setCartaLocal] = useState(null)
  const [cartaOponente, setCartaOponente] = useState(null)
  const [atributoEscolhido, setAtributoEscolhido] = useState(null)
  const [resultadoRodada, setResultadoRodada] = useState(null)
  const [ehMinhaVez, setEhMinhaVez] = useState(false)
  const [tempoRestante, setTempoRestante] = useState(30)
  const [movimentoRecebido, setMovimentoRecebido] = useState(false)
  const [ultimoMovimento, setUltimoMovimento] = useState(null)
  const [girando, setGirando] = useState(false)
  const [particulas, setParticulas] = useState([])
  const [jaMovi, setJaMovi] = useState(false)
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

  function sortearOnomatopeia() {
    const idx = Math.floor(Math.random() * ONOMATOPEIAS.length)
    setOnomaTexto(ONOMATOPEIAS[idx])
  }

  const salaRef = useRef(sala)
  const faseRef = useRef(fase)
  const meuPapelRef = useRef(meuPapel)
  const cartaLocalRef = useRef(cartaLocal)
  const deckOponenteRef = useRef(deckOponente)

  useEffect(() => { salaRef.current = sala }, [sala])
  useEffect(() => { meuPapelRef.current = meuPapel }, [meuPapel])
  useEffect(() => { cartaLocalRef.current = cartaLocal }, [cartaLocal])
  useEffect(() => { faseRef.current = fase }, [fase])
  useEffect(() => { deckOponenteRef.current = deckOponente }, [deckOponente])

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
      setEhMinhaVez(data.jogador_da_vez === user.id)
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
      const cartas = meuDeck.map(d => todasCartas.find(c => c.id_num === d.carta_id)).filter(Boolean)
      if (!cartas.length) return
      const qtd = Math.min(sala.total_turnos, cartas.length)
      setDeckLocal(cartas.slice(0, qtd))
    })()
  }, [user, sala?.total_turnos])

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
      const cartasOpp = deckOpp.map(d => todasCartas.find(c => c.id_num === d.carta_id)).filter(Boolean)
      setDeckOponente(cartasOpp.slice(0, qtd))
    })()
  }, [salaId, user, sala?.jogador2_id])

  useEffect(() => {
    if (!deckLocal.length || !sala) return
    const idx = Math.min((sala.turno_atual || 1) - 1, deckLocal.length - 1)
    setCartaLocal(deckLocal[idx])
  }, [deckLocal, sala?.turno_atual])

  useEffect(() => {
    if (!ehMinhaVez || fase !== 'jogando' || jaMovi || !sala || !cartaLocal) return
    setTempoRestante(30)
    const iv = setInterval(() => {
      setTempoRestante(t => {
        if (t <= 1) {
          clearInterval(iv)
          const attrs = atributos.map(a => a.id)
          const rand = attrs[Math.floor(Math.random() * attrs.length)]
          const s = salaRef.current
          const idxOp = ((s.turno_atual || 1) - 1) % Math.max(deckOponenteRef.current.length, 1)
          const cartaOp = deckOponenteRef.current[idxOp] || null
          registrarMovimento(s.id, user.id, cartaLocalRef.current?.id_num, rand, true, cartaOp?.id_num || null).then(() => {
            setJaMovi(true)
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [ehMinhaVez, fase, sala?.turno_atual, jaMovi])

  function seguirParaProximaRodada() {
    const s = salaRef.current
    if (!s) return
    if (s.status === 'encerrada' || s.turno_atual > s.total_turnos) {
      setFase('fim')
      return
    }
    setAtributoEscolhido(null)
    setResultadoRodada(null)
    setMovimentoRecebido(false)
    setJaMovi(false)
    setCartaOponente(null)
    setUltimoMovimento(null)
    setGirando(false)
    setEhMinhaVez(s.jogador_da_vez === user.id)
    setFase('jogando')
  }

  function jogarAtributo(atributoId) {
    if (!ehMinhaVez || fase !== 'jogando' || !sala || jaMovi || !cartaLocal || girando) return
    const idxOp = ((sala.turno_atual || 1) - 1) % Math.max(deckOponente.length, 1)
    const cartaOp = deckOponente[idxOp] || null
    registrarMovimento(sala.id, user.id, cartaLocal.id_num, atributoId, false, cartaOp?.id_num || null).then(() => {
      setJaMovi(true)
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
    setGirando(true)
    setTimeout(() => {
      sortearOnomatopeia()
      setCortinaAtiva(true)
    }, 600)
    setTimeout(() => {
      setGirando(false)
      setCortinaAtiva(false)
      gerarParticulasMP(resultadoFinal)
      setFase('revelacao')
    }, 1800)
  }

  async function resolverRodada() {
    try {
      const s = salaRef.current
      if (!s) { return }
      const { data: movs, error: errMovs } = await supabase
        .from('toptrumps_movimentos')
        .select('*')
        .eq('sala_id', s.id)
        .eq('turno', s.turno_atual)
        .order('criado_em', { ascending: true })
      if (errMovs) { console.error('[MP] resolverRodada erro:', errMovs); return }

      // Caso padrão: dois movimentos (ambos jogadores jogaram)
      if (movs && movs.length >= 2) {
        const movJ1 = movs.find(m => m.jogador_id === s.jogador1_id)
        const movJ2 = movs.find(m => m.jogador_id === s.jogador2_id)
        if (!movJ1 || !movJ2) return

        const cartaJ1 = todasCartas.find(c => c.id_num === movJ1.carta_id)
        const cartaJ2 = todasCartas.find(c => c.id_num === movJ2.carta_id)
        if (!cartaJ1 || !cartaJ2) return

        const attr = atributos.find(a => a.id === movJ1.atributo)
        if (!attr) return

        const v1 = cartaJ1.atributos[movJ1.atributo]
        const v2 = cartaJ2.atributos[movJ2.atributo]

        let res
        if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
        else res = v1 > v2 ? 'j1_venceu' : v1 < v2 ? 'j2_venceu' : 'empate'

        // segue lógica existente para atualizar estado e sala
        const papel = s.jogador1_id === user.id ? 'j1' : 'j2'
        const ganhei = (papel === 'j1' && res === 'j1_venceu') || (papel === 'j2' && res === 'j2_venceu')
        const empatou = res === 'empate'

        setResultadoRodada(ganhei ? 'ganhou' : empatou ? 'empate' : 'perdeu')
        setAtributoEscolhido(movJ1.atributo)
        setCartaOponente(papel === 'j1' ? cartaJ2 : cartaJ1)

        const novosPontosJ1 = (s.pontos_j1 || 0) + (res === 'j1_venceu' ? 1 : 0)
        const novosPontosJ2 = (s.pontos_j2 || 0) + (res === 'j2_venceu' ? 1 : 0)
        const novoTurno = s.turno_atual + 1
        const proximoJogador = s.jogador_da_vez === s.jogador1_id ? s.jogador2_id : s.jogador1_id
        const fim = novoTurno > s.total_turnos
        const resultadoFinal = ganhei ? 'ganhou' : empatou ? 'empate' : 'perdeu'

        if (fim) {
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
          setSala(prev => ({ ...prev, pontos_j1: novosPontosJ1, pontos_j2: novosPontosJ2, turno_atual: novoTurno, jogador_da_vez: proximoJogador }))
          setEhMinhaVez(proximoJogador === user.id)
        }

        iniciarRevelacao(resultadoFinal)
        return
      }

      if (movs && movs.length === 1) {
        const mov = movs[0]
        const cartaAtiva = todasCartas.find(c => c.id_num === mov.carta_id)
        if (!cartaAtiva) { return }

        const cartaOponenteObj = mov.carta_id_oponente
          ? todasCartas.find(c => c.id_num === mov.carta_id_oponente)
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
        if (attr.inverso) res = v1 < v2 ? 'j1_venceu' : v1 > v2 ? 'j2_venceu' : 'empate'
        else res = v1 > v2 ? 'j1_venceu' : v1 < v2 ? 'j2_venceu' : 'empate'

        const papel = s.jogador1_id === user.id ? 'j1' : 'j2'
        const ganhei = (papel === 'j1' && res === 'j1_venceu') || (papel === 'j2' && res === 'j2_venceu')
        const empatou = res === 'empate'

        setResultadoRodada(ganhei ? 'ganhou' : empatou ? 'empate' : 'perdeu')
        setAtributoEscolhido(mov.atributo)
        setCartaOponente(papel === 'j1' ? (mov.jogador_id === s.jogador1_id ? cartaOponenteObj : cartaAtiva) : (mov.jogador_id === s.jogador2_id ? cartaOponenteObj : cartaAtiva))

        const novosPontosJ1 = (s.pontos_j1 || 0) + (res === 'j1_venceu' ? 1 : 0)
        const novosPontosJ2 = (s.pontos_j2 || 0) + (res === 'j2_venceu' ? 1 : 0)
        const novoTurno = s.turno_atual + 1
        const proximoJogador = s.jogador_da_vez === s.jogador1_id ? s.jogador2_id : s.jogador1_id
        const fim = novoTurno > s.total_turnos
        const resultadoFinal = ganhei ? 'ganhou' : empatou ? 'empate' : 'perdeu'

        if (fim) {
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
          setSala(prev => ({ ...prev, pontos_j1: novosPontosJ1, pontos_j2: novosPontosJ2, turno_atual: novoTurno, jogador_da_vez: proximoJogador }))
          setEhMinhaVez(proximoJogador === user.id)
        }

        iniciarRevelacao(resultadoFinal)
        return
      }

      return
    } catch (err) {
      console.error('[MP] resolverRodada erro crítico:', err)
    }
  }

  // NOTE: Para Top Trumps (um jogador por rodada) não dependemos mais
  // dos refs jaMovi/movimentoRecebido para decidir quando resolver a rodada.
  // A resolução é acionada imediatamente ao receber o INSERT na tabela
  // `toptrumps_movimentos` (veja subscribeToMovimentos abaixo).

  useEffect(() => {
    if (fase !== 'carregando' || !salaId) return
    const timer = setTimeout(async () => {
      await supabase.from('toptrumps_salas').delete().eq('id', salaId)
      navigate('/games/toptrumps/lobby', {
        state: { mensagem: 'Nenhum adversário encontrado. Tente novamente.' }
      })
    }, 120000)
    return () => clearTimeout(timer)
  }, [fase, salaId, navigate])

  // Heartbeat: atualiza ping a cada 15s durante o jogo
  useEffect(() => {
    if (!salaId || !user || fase !== 'jogando' || !meuPapelRef.current) return
    const coluna = meuPapelRef.current === 'j1' ? 'ultimo_ping_j1' : 'ultimo_ping_j2'
    const interval = setInterval(async () => {
      await supabase.from('toptrumps_salas').update({ [coluna]: new Date().toISOString() }).eq('id', salaId)
    }, 15000)
    return () => clearInterval(interval)
  }, [salaId, user, fase, meuPapel])

  // Watchdog: a cada 20s verifica se oponente desconectou (>60s sem ping)
  useEffect(() => {
    if (!salaId || !user || fase !== 'jogando' || !meuPapelRef.current) return
    const colunaOponente = meuPapelRef.current === 'j1' ? 'ultimo_ping_j2' : 'ultimo_ping_j1'
    const interval = setInterval(async () => {
      const s = salaRef.current
      if (!s) return
      const ultimoPing = s[colunaOponente]
      if (ultimoPing && Date.now() - new Date(ultimoPing).getTime() > 60000) {
        await supabase.rpc('encerrar_por_desconexao', { p_sala_id: salaId, p_user_id: user.id })
        setFase('fim')
      }
    }, 20000)
    return () => clearInterval(interval)
  }, [salaId, user, fase, meuPapel])

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
      setSala(s)

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
        setEhMinhaVez(s.jogador_da_vez === user.id)
        return
      }

      if (anterior && s.turno_atual !== anterior.turno_atual && s.status === 'em_jogo' && faseRef.current !== 'revelacao' && faseRef.current !== 'fim') {
        setFase('jogando')
        setAtributoEscolhido(null)
        setResultadoRodada(null)
        setMovimentoRecebido(false)
        setJaMovi(false)
        setCartaOponente(null)
        setUltimoMovimento(null)
        setEhMinhaVez(s.jogador_da_vez === user.id)
      }
      if (s.status === 'encerrada' && faseRef.current !== 'resultado' && faseRef.current !== 'revelacao') setFase('fim')
    })
    const sub2 = subscribeToMovimentos(salaId, (p) => {
      const mov = p.new
      setUltimoMovimento(mov)

      if (mov.jogador_id === user.id) {
        setJaMovi(true)
      } else {
        setMovimentoRecebido(true)
      }

      resolverRodada()
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
          <p>{t('games.toptrumps.mp.carregando')}</p>
        </div>
      </section>
    )
  }

  if (fase === 'ppt') {
    const opcoes = [
      { valor: 0, nome: 'Pedra', icone: '\u270A' },
      { valor: 1, nome: 'Papel', icone: '\u270B' },
      { valor: 2, nome: 'Tesoura', icone: '\u270C\uFE0F' }
    ]
    const minhaEscolha = meuPapel === 'j1' ? sala?.carta_aposta_j1 : sala?.carta_aposta_j2
    return (
      <section className="ttmp-page">
        <div className="ttmp-ppt-container">
          <h2 className="ttmp-ppt-titulo">{t('games.toptrumps.mp.ppt_titulo')}</h2>
          <p className="ttmp-ppt-subtitulo">{t('games.toptrumps.mp.ppt_subtitulo')}</p>
          {!pptAmbosEscolheram ? (
            <>
              <div className="ttmp-ppt-opcoes">
                {opcoes.map(op => (
                  <button key={op.valor}
                    className="ttmp-ppt-btn"
                    disabled={pptEscolhi}
                    onClick={() => {
                      setPptEscolhi(true)
                      escolherPPT(salaId, user.id, op.valor, meuPapel === 'j1')
                    }}>
                    <span className="ttmp-ppt-icone">{op.icone}</span>
                    <span className="ttmp-ppt-nome">{op.nome}</span>
                  </button>
                ))}
              </div>
              {pptEscolhi && <p className="ttmp-ppt-aguardando">{t('games.toptrumps.mp.ppt_aguardando')}</p>}
            </>
          ) : (
            <div className="ttmp-ppt-resultado">
              <div className="ttmp-ppt-jogadores">
                <div className="ttmp-ppt-jogada">
                  <span className="ttmp-ppt-jogada-label">{t('games.toptrumps.mp.ppt_voce')}</span>
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
                {pptResultado === 'ganhou' ? t('games.toptrumps.mp.ppt_venceu') : pptResultado === 'perdeu' ? t('games.toptrumps.mp.ppt_perdeu') : t('games.toptrumps.mp.ppt_empate')}
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
          <p>{t('games.toptrumps.mp.preparando_cartas')}</p>
        </div>
      </section>
    )
    return (
      <>
        <div className="ttmp-fire-particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="ttmp-fire-particle" />
          ))}
        </div>
        <section className="ttmp-page">
        <div className="ttmp-hud">
          <div className="ttmp-hud-jogador">
            <span className="ttmp-hud-nome">{t('games.toptrumps.mp.hud_voce')}</span>
            <span className="ttmp-hud-placar-valor">{placar.eu}</span>
          </div>
          <div className="ttmp-hud-centro">
            <span className="ttmp-hud-rodada">{t('games.toptrumps.mp.hud_rodada', { n: sala?.turno_atual, total: sala?.total_turnos })}</span>
            <div className={`ttmp-timer${tempoRestante <= 5 ? ' ttmp-timer--warn' : ''}`}>
              <svg viewBox="0 0 60 60" className="ttmp-timer-svg">
                <circle cx="30" cy="30" r="26" className="ttmp-timer-bg" />
                <circle cx="30" cy="30" r="26" className="ttmp-timer-fill"
                  transform="rotate(-90 30 30)" />
              </svg>
              <span className="ttmp-timer-texto">{tempoRestante}</span>
            </div>
          </div>
          <div className="ttmp-hud-oponente">
            <span className="ttmp-hud-nome">{oponenteNome.toUpperCase()}</span>
            <span className="ttmp-hud-placar-valor">{placar.oponente}</span>
          </div>
        </div>
        <div className="ttmp-mesa">
          <div className="ttmp-card">
            <div className="ttmp-card-avatar">
              <span className="ttmp-card-avatar-iniciais">{cartaLocal.nome.split('—')[0].trim().charAt(0)}</span>
            </div>
            <h3 className="ttmp-card-nome">{cartaLocal.nome}</h3>
            <p className="ttmp-card-elemental">{cartaLocal.elemental}</p>
            <div className="ttmp-card-atributos">
              {atributos.map(attr => (
                <button key={attr.id}
                  className={`ttmp-atributo-btn${!ehMinhaVez || jaMovi ? ' ttmp-atributo-btn--disabled' : ''}`}
                  disabled={!ehMinhaVez || jaMovi}
                  onClick={() => jogarAtributo(attr.id)}
                  title={attr.descricao}>
                  <span className="ttmp-atributo-nome">{t(attr.nomeKey)}</span>
                  <span className="ttmp-atributo-valor">{cartaLocal.atributos[attr.id]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="ttmp-vs">
            <span className="ttmp-vs-texto">{t('games.toptrumps.mp.hud_vs')}</span>
            {!ehMinhaVez && !jaMovi && (
              <span className="ttmp-vez-message">{t('games.toptrumps.mp.hud_adversario_escolhendo')}</span>
            )}
          </div>
          <div className={`ttmp-card${girando ? ' ttmp-spinning-reveal' : ''}`}>
            {cartaOponente ? (
              <>
                <div className="ttmp-card-avatar">
                  <span className="ttmp-card-avatar-iniciais">{cartaOponente.nome.split('—')[0].trim().charAt(0)}</span>
                </div>
                <h3 className="ttmp-card-nome">{cartaOponente.nome}</h3>
                <p className="ttmp-card-elemental">{cartaOponente.elemental}</p>
                <div className="ttmp-card-atributos">
                  {atributos.map(a => {
                    let c = 'ttmp-atributo-btn ttmp-atributo-btn--disabled'
                    if (a.id === atributoEscolhido) {
                      if (resultadoRodada === 'ganhou') c += ' ttmp-atributo--perdeu'
                      else if (resultadoRodada === 'perdeu') c += ' ttmp-atributo--ganhou'
                      else c += ' ttmp-atributo--empate'
                    }
                    return (
                      <div key={a.id} className={c}>
                        <span className="ttmp-atributo-nome">{t(a.nomeKey)}</span>
                        <span className="ttmp-atributo-valor">{cartaOponente.atributos[a.id]}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="ttmp-card--face-down">
                <div className="ttmp-card-avatar ttmp-card-avatar--oponente">
                  <span className="ttmp-card-avatar-iniciais">?</span>
                </div>
                <h3 className="ttmp-card-nome">???</h3>
                <p className="ttmp-card-elemental">???</p>
                <div className="ttmp-card-atributos">
                  {atributos.map(attr => (
                    <div key={attr.id} className="ttmp-atributo-btn ttmp-atributo-btn--disabled">
                      <span className="ttmp-atributo-nome">{t(attr.nomeKey)}</span>
                      <span className="ttmp-atributo-valor">??</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Curtain overlay for animation */}
        {cortinaAtiva && (
          <div className="ttmp-curtain-overlay">
            <div className="ttmp-curtain-inner" />
            <div className="ttmp-curtain-onomatopeia">
              <span className="ttmp-onoma-texto">{onomaTexto}</span>
            </div>
          </div>
        )}
      </section>
      </>
    )
  }

  if (fase === 'revelacao') {
    if (!cartaLocal || !cartaOponente) return null
    const attr = atributos.find(a => a.id === atributoEscolhido)
    const vezTexto = sala?.jogador_da_vez === user.id ? t('games.toptrumps.mp.revelacao_sua_vez') : t('games.toptrumps.mp.revelacao_vez_oponente', { nome: oponenteNome })

    return (
      <>
        <div className="ttmp-fire-particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="ttmp-fire-particle" />
          ))}
        </div>
        <section className="ttmp-page">
        {particulas.map(p => (
          <div key={p.id}
            className={`ttmp-particula ttmp-particula--${p.tipo} ttmp-particula--v${p.variante}`} />
        ))}
        <div className="ttmp-revelacao-banner">
          <div>
            <span className="ttmp-revelacao-title">{t('games.toptrumps.mp.revelacao_titulo')}</span>
            <span className="ttmp-revelacao-subtitle">{vezTexto}</span>
          </div>
          <span className={`ttmp-resultado-badge ttmp-resultado--${resultadoRodada}`}>
            {resultadoRodada === 'ganhou' ? t('games.toptrumps.mp.revelacao_voce_venceu') : resultadoRodada === 'perdeu' ? t('games.toptrumps.mp.revelacao_oponente_venceu') : t('games.toptrumps.mp.revelacao_empate')}
          </span>
        </div>

        <div className="ttmp-hud">
          <div className="ttmp-hud-jogador">
            <span className="ttmp-hud-nome">{t('games.toptrumps.mp.hud_voce')}</span>
            <span className="ttmp-hud-placar-valor">{placar.eu}</span>
          </div>
          <div className="ttmp-hud-centro">
            <span className="ttmp-hud-rodada">{t('games.toptrumps.mp.hud_rodada', { n: sala?.turno_atual, total: sala?.total_turnos })}</span>
            <span className="ttmp-revelacao-note">{t('games.toptrumps.mp.atributo_escolhido', { nome: attr ? t(attr.nomeKey) : '' })}</span>
          </div>
          <div className="ttmp-hud-oponente">
            <span className="ttmp-hud-nome">{oponenteNome.toUpperCase()}</span>
            <span className="ttmp-hud-placar-valor">{placar.oponente}</span>
          </div>
        </div>

        <div className="ttmp-mesa ttmp-mesa--revelacao">
          <div className="ttmp-card ttmp-card--revelado">
            <div className="ttmp-card-avatar">
              <span className="ttmp-card-avatar-iniciais">{cartaLocal.nome.split('—')[0].trim().charAt(0)}</span>
            </div>
            <h3 className="ttmp-card-nome">{cartaLocal.nome}</h3>
            <p className="ttmp-card-elemental">{cartaLocal.elemental}</p>
            <div className="ttmp-card-atributos">
              {atributos.map(a => (
                <div key={a.id} className={`ttmp-atributo-btn${a.id === atributoEscolhido ? ` ttmp-atributo--${resultadoRodada}` : ''}`}>
                  <span className="ttmp-atributo-nome">{t(a.nomeKey)}</span>
                  <span className="ttmp-atributo-valor">{cartaLocal.atributos[a.id]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ttmp-vs">
            <span className={`ttmp-resultado-texto ttmp-resultado--${resultadoRodada}`}>
              {resultadoRodada === 'ganhou' ? t('games.toptrumps.mp.revelacao_voce_venceu_exclamacao') : resultadoRodada === 'perdeu' ? t('games.toptrumps.mp.revelacao_oponente_venceu_exclamacao') : t('games.toptrumps.mp.revelacao_empate_exclamacao')}
            </span>
            <span className="ttmp-resultado-atributo">{attr ? t(attr.nomeKey) : ''}</span>
          </div>

          <div className="ttmp-card ttmp-card--revelado">
            <div className="ttmp-card-avatar">
              <span className="ttmp-card-avatar-iniciais">{cartaOponente.nome.split('—')[0].trim().charAt(0)}</span>
            </div>
            <h3 className="ttmp-card-nome">{cartaOponente.nome}</h3>
            <p className="ttmp-card-elemental">{cartaOponente.elemental}</p>
            <div className="ttmp-card-atributos">
              {atributos.map(a => (
                <div key={a.id} className={`ttmp-atributo-btn${a.id === atributoEscolhido ? ` ttmp-atributo--${resultadoRodada}` : ''}`}>
                  <span className="ttmp-atributo-nome">{t(a.nomeKey)}</span>
                  <span className="ttmp-atributo-valor">{cartaOponente.atributos[a.id]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="ttmp-proxima-btn" onClick={seguirParaProximaRodada}>
          {t('games.toptrumps.mp.revelacao_proxima')}
        </button>
      </section>
      </>
    )
  }

  if (fase === 'fim') {
    if (!sala) return null
    const venceu = placar.eu > placar.oponente
    const empatou = placar.eu === placar.oponente
    return (
      <section className="ttmp-page">
        <div className="ttmp-fim">
          <h2 className="ttmp-fim-titulo">{t('games.toptrumps.mp.fim_titulo')}</h2>
          <div className={`ttmp-fim-icone${venceu ? ' ttmp-fim-icone--vitoria' : empatou ? ' ttmp-fim-icone--empate' : ' ttmp-fim-icone--derrota'}`}>
            {venceu ? '🏆' : empatou ? '🤝' : '💀'}
          </div>
          <h3 className={`ttmp-fim-resultado${venceu ? ' ttmp-fim-titulo--vitoria' : empatou ? ' ttmp-fim-titulo--empate' : ' ttmp-fim-titulo--derrota'}`}>
            {venceu ? t('games.toptrumps.mp.fim_voce_venceu') : empatou ? t('games.toptrumps.mp.fim_empate') : t('games.toptrumps.mp.fim_voce_perdeu')}
          </h3>
          <div className="ttmp-fim-placar">
            <div className="ttmp-fim-placar-item">
              <span className="ttmp-fim-placar-valor">{placar.eu}</span>
              <span className="ttmp-fim-placar-label">{t('games.toptrumps.mp.fim_voce')}</span>
            </div>
            <span className="ttmp-fim-placar-divisor">×</span>
            <div className="ttmp-fim-placar-item">
              <span className="ttmp-fim-placar-valor">{placar.oponente}</span>
              <span className="ttmp-fim-placar-label">{oponenteNome.toUpperCase()}</span>
            </div>
          </div>
          <div className="ttmp-fim-actions">
            <Link to="/games" className="ttmp-btn-voltar">{t('games.toptrumps.mp.fim_voltar_games')}</Link>
          </div>
        </div>
      </section>
    )
  }

  return null
}
