import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAchievements } from '../context/AchievementsContext'
import { supabase } from '../lib/supabase'
import { subscribeToSala, subscribeToMovimentos, registrarMovimento, atualizarSala, encerrarSala, incrementarPartidaDiaria, atualizarMPStats, escolherPPT, finalizarPPT } from '../hooks/useTopTrumpsMP'
import deck from '../data/supertrunfo-pt.json'
import './TopTrumpsMP.css'

const todasCartas = deck.cartas
const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({
  id, nome: id === 'rank_sdr' ? 'Rank SDR' : id === 'poder_mental' ? 'Poder Mental' : id === 'velocidade' ? 'Velocidade' : id === 'resistencia' ? 'Resistência' : id === 'nivel_xama' ? 'Nível Xamã' : id === 'fator_caos' ? 'Fator Caos' : id === 'energia_base' ? 'Energia Base' : 'Poder Explosivo',
  descricao, inverso: id === 'rank_sdr'
}))

function embaralhar(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function avatarCor(id) {
  let hash = 0; for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${hash % 360}, 65%, 45%)`
}

export default function TopTrumpsMP() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { desbloquear } = useAchievements()
  const desbloquearRef = useRef(desbloquear)
  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])

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
  const [jaMovi, setJaMovi] = useState(false)
  const [meuPapel, setMeuPapel] = useState(null)
  const [deckLocal, setDeckLocal] = useState([])
  const [oponenteNome, setOponenteNome] = useState('Oponente')
  const [pptEscolhi, setPptEscolhi] = useState(false)
  const [pptEscolhaOponente, setPptEscolhaOponente] = useState(null)
  const [pptResultado, setPptResultado] = useState(null)
  const [pptAmbosEscolheram, setPptAmbosEscolheram] = useState(false)

  const salaRef = useRef(sala)
  const faseRef = useRef(fase)
  const meuPapelRef = useRef(meuPapel)
  const jaMoviRef = useRef(jaMovi)
  const movimentoRecebidoRef = useRef(movimentoRecebido)
  const cartaLocalRef = useRef(cartaLocal)

  useEffect(() => { salaRef.current = sala }, [sala])
  useEffect(() => { meuPapelRef.current = meuPapel }, [meuPapel])
  useEffect(() => { jaMoviRef.current = jaMovi }, [jaMovi])
  useEffect(() => { movimentoRecebidoRef.current = movimentoRecebido }, [movimentoRecebido])
  useEffect(() => { cartaLocalRef.current = cartaLocal }, [cartaLocal])
  useEffect(() => { faseRef.current = fase }, [fase])

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
      const { data } = await supabase.from('toptrumps_decks').select('carta_id').eq('user_id', user.id)
      if (!data?.length) return
      const cartas = data.map(d => todasCartas.find(c => c.id_num === d.carta_id)).filter(Boolean)
      if (!cartas.length) return
      const qtd = Math.min(sala.total_turnos, cartas.length)
      setDeckLocal(embaralhar(cartas).slice(0, qtd))
    })()
  }, [user, sala?.total_turnos])

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
          registrarMovimento(salaRef.current.id, user.id, cartaLocalRef.current?.id_num, rand, true).then(() => {
            setJaMovi(true)
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [ehMinhaVez, fase, sala?.turno_atual, jaMovi])

  function jogarAtributo(atributoId) {
    if (!ehMinhaVez || fase !== 'jogando' || !sala || jaMovi || !cartaLocal) return
    registrarMovimento(sala.id, user.id, cartaLocal.id_num, atributoId, false).then(() => {
      setJaMovi(true)
    })
  }

  async function resolverRodada() {
    const s = salaRef.current
    if (!s) { console.log('[MP] resolverRodada — sem sala'); return }
    console.log('[MP] resolverRodada chamada, turno:', s.turno_atual, 'salaId:', s.id)
    const { data: movs, error: errMovs } = await supabase
      .from('toptrumps_movimentos')
      .select('*')
      .eq('sala_id', s.id)
      .eq('turno', s.turno_atual)
      .order('created_at', { ascending: true })
    console.log('[MP] resolverRodada movimentos encontrados:', movs?.length, movs)
    if (errMovs) { console.error('[MP] resolverRodada erro:', errMovs); return }
    if (!movs || movs.length < 2) { console.log('[MP] resolverRodada aguardando segundo movimento, saindo'); return }

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

    const papel = meuPapelRef.current
    const ganhei = (papel === 'j1' && res === 'j1_venceu') || (papel === 'j2' && res === 'j2_venceu')
    const empatou = res === 'empate'

    setResultadoRodada(ganhei ? 'ganhou' : empatou ? 'empate' : 'perdeu')
    setAtributoEscolhido(movJ1.atributo)
    setCartaOponente(papel === 'j1' ? cartaJ2 : cartaJ1)

    const novosPontosJ1 = (s.pontos_j1 || 0) + (res === 'j1_venceu' ? 1 : 0)
    const novosPontosJ2 = (s.pontos_j2 || 0) + (res === 'j2_venceu' ? 1 : 0)
    const novoTurno = s.turno_atual + 1
    const fim = novoTurno > s.total_turnos

    setFase('resultado')

    if (fim) {
      const vencedor = novosPontosJ1 > novosPontosJ2 ? s.jogador1_id : novosPontosJ2 > novosPontosJ1 ? s.jogador2_id : null
      const perdedor = vencedor === s.jogador1_id ? s.jogador2_id : s.jogador1_id

      await atualizarSala(s.id, {
        pontos_j1: novosPontosJ1,
        pontos_j2: novosPontosJ2,
        turno_atual: s.total_turnos,
        status: 'encerrada'
      })

      await encerrarSala(s.id, vencedor, perdedor, s.modo, null, null)
      await atualizarMPStats(s.jogador1_id, novosPontosJ1 > novosPontosJ2 ? 'vitoria' : novosPontosJ1 < novosPontosJ2 ? 'derrota' : 'empate')
      await atualizarMPStats(s.jogador2_id, novosPontosJ2 > novosPontosJ1 ? 'vitoria' : novosPontosJ2 < novosPontosJ1 ? 'derrota' : 'empate')
    } else {
      await atualizarSala(s.id, {
        pontos_j1: novosPontosJ1,
        pontos_j2: novosPontosJ2,
        turno_atual: novoTurno,
        jogador_da_vez: res === 'j1_venceu' ? s.jogador1_id : res === 'j2_venceu' ? s.jogador2_id : s.jogador_da_vez
      })
    }
  }

  useEffect(() => {
    if (!jaMovi || !movimentoRecebido || fase !== 'jogando') return
    console.log('[MP] chamando resolverRodada, turno:', salaRef.current?.turno_atual, 'salaId:', salaId)
    resolverRodada()
  }, [jaMovi, movimentoRecebido])

  useEffect(() => {
    if (fase !== 'resultado') return
    const t = setTimeout(() => {
      const s = salaRef.current
      if (!s) return
      if (s.status === 'encerrada' || s.turno_atual >= s.total_turnos) {
        setFase('fim')
      } else {
        setFase('jogando')
        setAtributoEscolhido(null)
        setResultadoRodada(null)
        setMovimentoRecebido(false)
        setJaMovi(false)
        setCartaOponente(null)
        setUltimoMovimento(null)
        setEhMinhaVez(s.jogador_da_vez === user.id)
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [fase])

  useEffect(() => {
    if (fase !== 'carregando' || !salaId) return
    const timer = setTimeout(async () => {
      console.log('[MP] Timeout 2min — nenhum adversário entrou')
      await supabase.from('toptrumps_salas').delete().eq('id', salaId)
      navigate('/extras/toptrumps/lobby', {
        state: { mensagem: 'Nenhum adversário encontrado. Tente novamente.' }
      })
    }, 120000)
    return () => clearTimeout(timer)
  }, [fase, salaId, navigate])

  useEffect(() => {
    console.log('[RT] useEffect movimentos disparou, salaId:', salaId, 'user:', user?.id, 'fase:', fase)
    if (!salaId) return
    const sub1 = subscribeToSala(salaId, (p) => {
      const s = p.new
      const anterior = salaRef.current
      setSala(s)

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

      if (anterior && s.turno_atual !== anterior.turno_atual && s.status === 'em_jogo') {
        setFase('jogando')
        setAtributoEscolhido(null)
        setResultadoRodada(null)
        setMovimentoRecebido(false)
        setJaMovi(false)
        setCartaOponente(null)
        setUltimoMovimento(null)
        setEhMinhaVez(s.jogador_da_vez === user.id)
      }
      if (s.status === 'encerrada') setFase('fim')
    })
    const sub2 = subscribeToMovimentos(salaId, (p) => {
      console.log('[MP] Realtime UPDATE recebido, novo:', JSON.stringify(p.new))
      console.log('[MP] jaMoviRef.current:', jaMoviRef.current, 'movimentoRecebidoRef.current:', movimentoRecebidoRef.current)
      const mov = p.new
      setUltimoMovimento(mov)
      if (mov.jogador_id !== user.id) {
        console.log('[MP] verificando se chama resolverRodada, condicao: movimento oponente, jaMoviRef:', jaMoviRef.current)
        if (jaMoviRef.current) {
          console.log('[MP] chamando resolverRodada, turno:', salaRef.current?.turno_atual, 'salaId:', salaId)
          resolverRodada()
        } else {
          setMovimentoRecebido(true)
        }
      } else {
        setJaMovi(true)
        console.log('[MP] verificando se chama resolverRodada, condicao: meu movimento, movimentoRecebidoRef:', movimentoRecebidoRef.current)
        if (movimentoRecebidoRef.current) {
          console.log('[MP] chamando resolverRodada, turno:', salaRef.current?.turno_atual, 'salaId:', salaId)
          resolverRodada()
        }
      }
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
          <p>Carregando partida...</p>
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
          <h2 className="ttmp-ppt-titulo">Pedra, Papel, Tesoura</h2>
          <p className="ttmp-ppt-subtitulo">O vencedor come&ccedil;a!</p>
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
              {pptEscolhi && <p className="ttmp-ppt-aguardando">Aguardando oponente...</p>}
            </>
          ) : (
            <div className="ttmp-ppt-resultado">
              <div className="ttmp-ppt-jogadores">
                <div className="ttmp-ppt-jogada">
                  <span className="ttmp-ppt-jogada-label">Voc&ecirc;</span>
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
                {pptResultado === 'ganhou' ? 'Voc&ecirc; venceu!' : pptResultado === 'perdeu' ? 'Voc&ecirc; perdeu!' : 'Empate!'}
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
          <p>Preparando cartas...</p>
        </div>
      </section>
    )
    return (
      <section className="ttmp-page">
        <div className="ttmp-hud">
          <div className="ttmp-hud-jogador">
            <span className="ttmp-hud-nome">VOCÊ</span>
            <span className="ttmp-hud-placar-valor">{placar.eu}</span>
          </div>
          <div className="ttmp-hud-centro">
            <span className="ttmp-hud-rodada">RODADA {sala?.turno_atual}/{sala?.total_turnos}</span>
            <div className={`ttmp-timer${tempoRestante <= 5 ? ' ttmp-timer--warn' : ''}`}>
              <svg viewBox="0 0 60 60" className="ttmp-timer-svg">
                <circle cx="30" cy="30" r="26" className="ttmp-timer-bg" />
                <circle cx="30" cy="30" r="26" className="ttmp-timer-fill"
                  style={{ strokeDashoffset: 163.36 * (1 - tempoRestante / 30) }}
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
            <div className="ttmp-card-avatar" style={{ background: avatarCor(cartaLocal.id) }}>
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
                  <span className="ttmp-atributo-nome">{attr.nome}</span>
                  <span className="ttmp-atributo-valor">{cartaLocal.atributos[attr.id]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="ttmp-vs">
            <span className="ttmp-vs-texto">VS</span>
            {!ehMinhaVez && !jaMovi && (
              <span className="ttmp-vez-message">Advers&aacute;rio escolhendo...</span>
            )}
          </div>
          <div className="ttmp-card">
            {cartaOponente ? (
              <>
                <div className="ttmp-card-avatar" style={{ background: avatarCor(cartaOponente.id) }}>
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
                        <span className="ttmp-atributo-nome">{a.nome}</span>
                        <span className="ttmp-atributo-valor">{cartaOponente.atributos[a.id]}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="ttmp-card--face-down">
                <div className="ttmp-card-avatar ttmp-card-avatar--oponente" style={{ background: '#1a1a2e' }}>
                  <span className="ttmp-card-avatar-iniciais">?</span>
                </div>
                <h3 className="ttmp-card-nome">???</h3>
                <p className="ttmp-card-elemental">???</p>
                <div className="ttmp-card-atributos">
                  {atributos.map(attr => (
                    <div key={attr.id} className="ttmp-atributo-btn ttmp-atributo-btn--disabled">
                      <span className="ttmp-atributo-nome">{attr.nome}</span>
                      <span className="ttmp-atributo-valor">??</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (fase === 'resultado') {
    if (!cartaLocal || !cartaOponente) return null
    const attr = atributos.find(a => a.id === atributoEscolhido)
    return (
      <section className="ttmp-page">
        <div className="ttmp-hud">
          <div className="ttmp-hud-jogador">
            <span className="ttmp-hud-nome">VOCÊ</span>
            <span className="ttmp-hud-placar-valor">{placar.eu}</span>
          </div>
          <div className="ttmp-hud-centro">
            <span className="ttmp-hud-rodada">RODADA {sala?.turno_atual}/{sala?.total_turnos}</span>
          </div>
          <div className="ttmp-hud-oponente">
            <span className="ttmp-hud-nome">{oponenteNome.toUpperCase()}</span>
            <span className="ttmp-hud-placar-valor">{placar.oponente}</span>
          </div>
        </div>
        <div className="ttmp-mesa">
          <div className="ttmp-card">
            <div className="ttmp-card-avatar" style={{ background: avatarCor(cartaLocal.id) }}>
              <span className="ttmp-card-avatar-iniciais">{cartaLocal.nome.split('—')[0].trim().charAt(0)}</span>
            </div>
            <h3 className="ttmp-card-nome">{cartaLocal.nome}</h3>
            <p className="ttmp-card-elemental">{cartaLocal.elemental}</p>
            <div className="ttmp-card-atributos">
              {atributos.map(a => (
                <div key={a.id} className={`ttmp-atributo-btn${a.id === atributoEscolhido ? ` ttmp-atributo--${resultadoRodada}` : ''}`}>
                  <span className="ttmp-atributo-nome">{a.nome}</span>
                  <span className="ttmp-atributo-valor">{cartaLocal.atributos[a.id]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ttmp-vs">
            <span className={`ttmp-resultado-texto ttmp-resultado--${resultadoRodada}`}>
              {resultadoRodada === 'ganhou' ? 'VOCÊ VENCEU!' : resultadoRodada === 'perdeu' ? 'OPONENTE VENCEU!' : 'EMPATE!'}
            </span>
            <span className="ttmp-resultado-atributo">{attr?.nome}</span>
          </div>
          <div className="ttmp-card">
            <div className="ttmp-card-avatar" style={{ background: avatarCor(cartaOponente.id) }}>
              <span className="ttmp-card-avatar-iniciais">{cartaOponente.nome.split('—')[0].trim().charAt(0)}</span>
            </div>
            <h3 className="ttmp-card-nome">{cartaOponente.nome}</h3>
            <p className="ttmp-card-elemental">{cartaOponente.elemental}</p>
            <div className="ttmp-card-atributos">
              {atributos.map(a => {
                let c = 'ttmp-atributo-btn'
                if (a.id === atributoEscolhido) {
                  if (resultadoRodada === 'ganhou') c += ' ttmp-atributo--perdeu'
                  else if (resultadoRodada === 'perdeu') c += ' ttmp-atributo--ganhou'
                  else c += ' ttmp-atributo--empate'
                }
                return (
                  <div key={a.id} className={c}>
                    <span className="ttmp-atributo-nome">{a.nome}</span>
                    <span className="ttmp-atributo-valor">{cartaOponente.atributos[a.id]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (fase === 'fim') {
    if (!sala) return null
    const venceu = placar.eu > placar.oponente
    const empatou = placar.eu === placar.oponente
    return (
      <section className="ttmp-page">
        <div className="ttmp-fim">
          <h2 className="ttmp-fim-titulo">FIM DE JOGO</h2>
          <div className={`ttmp-fim-icone${venceu ? ' ttmp-fim-icone--vitoria' : empatou ? ' ttmp-fim-icone--empate' : ' ttmp-fim-icone--derrota'}`}>
            {venceu ? '🏆' : empatou ? '🤝' : '💀'}
          </div>
          <h3 className={`ttmp-fim-resultado${venceu ? ' ttmp-fim-titulo--vitoria' : empatou ? ' ttmp-fim-titulo--empate' : ' ttmp-fim-titulo--derrota'}`}>
            {venceu ? 'VOCÊ VENCEU!' : empatou ? 'EMPATE!' : 'VOCÊ PERDEU!'}
          </h3>
          <div className="ttmp-fim-placar">
            <div className="ttmp-fim-placar-item">
              <span className="ttmp-fim-placar-valor">{placar.eu}</span>
              <span className="ttmp-fim-placar-label">VOCÊ</span>
            </div>
            <span className="ttmp-fim-placar-divisor">×</span>
            <div className="ttmp-fim-placar-item">
              <span className="ttmp-fim-placar-valor">{placar.oponente}</span>
              <span className="ttmp-fim-placar-label">{oponenteNome.toUpperCase()}</span>
            </div>
          </div>
          <div className="ttmp-fim-actions">
            <Link to="/extras" className="ttmp-btn-voltar">VOLTAR AOS EXTRAS</Link>
          </div>
        </div>
      </section>
    )
  }

  return null
}
