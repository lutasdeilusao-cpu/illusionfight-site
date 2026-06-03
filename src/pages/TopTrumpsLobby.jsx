import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { criarSala, entrarSalaPorCodigo, entrarFilaPublica, verificarLimiteDiario, incrementarPartidaDiaria, definirAposta, confirmarAposta, subscribeToSala } from '../hooks/useTopTrumpsMP'
import { carregarDeck as carregarDeckDB } from '../hooks/useTopTrumpsDB'
import deck from '../data/supertrunfo-pt.json'
import './TopTrumpsLobby.css'

const todasCartas = deck.cartas

export default function TopTrumpsLobby() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [modo, setModo] = useState(null)
  const [turnos, setTurnos] = useState(null)
  const [etapa, setEtapa] = useState('modo')
  const [codigoSala, setCodigoSala] = useState('')
  const [codigoInput, setCodigoInput] = useState('')
  const [salaId, setSalaId] = useState(null)
  const [statusSala, setStatusSala] = useState('')
  const [erro, setErro] = useState('')
  const [aguardando, setAguardando] = useState(false)
  const [deckUsuario, setDeckUsuario] = useState([])
  const [cartaAposta, setCartaAposta] = useState(null)
  const [apostaConfirmada, setApostaConfirmada] = useState(false)
  const [apostaOponente, setApostaOponente] = useState(false)
  const [limiteInfo, setLimiteInfo] = useState(null)
  const [souJ1, setSouJ1] = useState(true)
  const [salaAposEntrada, setSalaAposEntrada] = useState(false)

  const salaEntradaRef = useRef(false)

  useEffect(() => {
    if (!user) return
    carregarDeckDB(user.id).then(ids => {
      const cartas = (ids || []).map(id => todasCartas.find(c => c.id_num === id)).filter(Boolean)
      setDeckUsuario(cartas)
    })
  }, [user])

  useEffect(() => {
    if (!salaId) return
    const sub = subscribeToSala(salaId, (payload) => {
      setStatusSala(payload.new.status)
      if (payload.new.jogador2_id && !salaEntradaRef.current) {
        salaEntradaRef.current = true
        setSalaAposEntrada(true)
      }
      if (souJ1 && payload.new.aposta_confirmada_j2) setApostaOponente(true)
      if (!souJ1 && payload.new.aposta_confirmada_j1) setApostaOponente(true)
      if (payload.new.status === 'em_jogo') {
        navigate(`/extras/toptrumps/multiplayer?sala=${salaId}`)
      }
    })
    return () => sub.unsubscribe()
  }, [salaId, souJ1, navigate])

  async function selecionarModo(m) {
    setModo(m)
    setEtapa('turnos')
  }

  async function selecionarTurnos(n) {
    setTurnos(n)
    setEtapa('matchmaking')
    if (!user) return
    const tier = perfil?.tier || 'free'
    const info = await verificarLimiteDiario(user.id, tier)
    setLimiteInfo(info)
  }

  async function handleCriarSala() {
    if (!user || !modo || !turnos) return
    setAguardando(true)
    setErro('')
    const result = await criarSala(user.id, modo, 'privada', turnos)
    if (!result) { setErro('Erro ao criar sala'); setAguardando(false); return }
    setCodigoSala(result.codigo)
    setSalaId(result.salaId)
    setSouJ1(true)
    salaEntradaRef.current = false
    setAguardando(false)
  }

  async function handleEntrarCodigo() {
    if (!user || !codigoInput.trim() || !turnos) return
    setAguardando(true)
    setErro('')
    const result = await entrarSalaPorCodigo(user.id, codigoInput.trim(), turnos)
    if (result.erro) { setErro(result.erro); setAguardando(false); return }
    setSalaId(result.salaId)
    setSouJ1(false)
    salaEntradaRef.current = false
    setAguardando(false)
  }

  async function handleFilaPublica() {
    if (!user || !modo || !turnos) return
    setAguardando(true)
    setErro('')
    const result = await entrarFilaPublica(user.id, modo, turnos)
    setSalaId(result.salaId)
    setSouJ1(result.novo !== false)
    salaEntradaRef.current = false
    setAguardando(false)
  }

  async function handleConfirmarAposta() {
    if (!user || !salaId || !cartaAposta) return
    setErro('')
    await definirAposta(salaId, user.id, cartaAposta.id_num, souJ1)
    await confirmarAposta(salaId, souJ1)
    setApostaConfirmada(true)
  }

  function copyCodigo() {
    navigator.clipboard?.writeText(codigoSala)
  }

  const podeJogar = !limiteInfo || limiteInfo.pode

  return (
    <section className="ttmp-page">
      <h1 className="ttmp-titulo">MULTIPLAYER</h1>

      {etapa === 'modo' && (
        <div className="ttmp-modos">
          <div className="ttmp-modo-card" onClick={() => selecionarModo('free')}>
            <h3 className="ttmp-modo-titulo">MODO FREE</h3>
            <p className="ttmp-modo-desc">Ganhe uma carta aleatória do seu tier</p>
          </div>
          <div className="ttmp-modo-card ttmp-modo-card--warning" onClick={() => selecionarModo('apostado')}>
            <h3 className="ttmp-modo-titulo">MODO APOSTADO</h3>
            <p className="ttmp-modo-desc">Aposte uma carta. Vencedor leva tudo.</p>
          </div>
        </div>
      )}

      {etapa === 'turnos' && (
        <div className="ttmp-turnos-wrap">
          <p className="ttmp-info">A partida usa o menor número entre os dois jogadores.</p>
          <div className="ttmp-turnos">
            {[5, 10, 15, 20].map(n => (
              <button key={n}
                className={`ttmp-turno-btn${turnos === n ? ' ttmp-turno-btn--ativo' : ''}`}
                onClick={() => selecionarTurnos(n)}>{n}</button>
            ))}
          </div>
        </div>
      )}

      {etapa === 'matchmaking' && (
        <div className="ttmp-matchmaking">
          {!podeJogar ? (
            <div className="ttmp-limite">
              <p>Você já jogou {limiteInfo?.usadas}/{limiteInfo?.limite} partidas hoje. Volte amanhã!</p>
            </div>
          ) : (
            <>
              <p className="ttmp-info">Escolha como deseja jogar:</p>
              <div className="ttmp-matchmaking-botoes">
                <button className="ttmp-btn" onClick={handleCriarSala} disabled={aguardando}>
                  {aguardando ? 'CRIANDO...' : 'CRIAR SALA PRIVADA'}
                </button>
                <div className="ttmp-entrar-codigo">
                  <input type="text" className="ttmp-input" placeholder="Código (LDI-XXXX)" value={codigoInput}
                    onChange={e => setCodigoInput(e.target.value.toUpperCase())} maxLength={8} />
                  <button className="ttmp-btn" onClick={handleEntrarCodigo} disabled={codigoInput.length < 8 || aguardando}>
                    ENTRAR
                  </button>
                </div>
                <button className="ttmp-btn" onClick={handleFilaPublica} disabled={aguardando}>
                  {aguardando ? 'PROCURANDO...' : 'FILA PÚBLICA'}
                </button>
              </div>
              {aguardando && <div className="ttmp-spinner" />}
            </>
          )}

          {codigoSala && (
            <div className="ttmp-codigo-container">
              <p className="ttmp-codigo-label">Código da sala:</p>
              <div className="ttmp-codigo">{codigoSala}</div>
              <button className="ttmp-codigo-btn" onClick={copyCodigo}>COPIAR CÓDIGO</button>
              <p className="ttmp-info">Compartilhe o código para seu oponente entrar.</p>
            </div>
          )}

          {modo === 'apostado' && salaId && !apostaConfirmada && (
            <div className="ttmp-aposta">
              <p className="ttmp-aposta-title">Selecione a carta que deseja apostar:</p>
              <p className="ttmp-aposta-aviso">⚠️ Se você perder, esta carta some do seu deck para sempre</p>
              <div className="ttmp-aposta-grid">
                {deckUsuario.map(carta => (
                  <div key={carta.id}
                    className={`ttmp-aposta-card${cartaAposta?.id === carta.id ? ' ttmp-aposta-card--selected' : ''}`}
                    onClick={() => setCartaAposta(carta)}>
                    <span className="ttmp-aposta-card-nome">{carta.nome}</span>
                    <span className="ttmp-aposta-card-tier">{carta.tier}</span>
                  </div>
                ))}
              </div>
              <button className="ttmp-btn" disabled={!cartaAposta} onClick={handleConfirmarAposta}>CONFIRMAR APOSTA</button>
            </div>
          )}

          {apostaConfirmada && <p className="ttmp-info">Aposta confirmada. Aguardando oponente...</p>}
          {apostaOponente && <p className="ttmp-info">Oponente já apostou.</p>}
          {erro && <p className="ttmp-erro">{erro}</p>}
        </div>
      )}
    </section>
  )
}
