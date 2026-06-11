import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReader } from '../context/ReaderContext'
import { useLanguage } from '../context/LanguageContext'
import { criarSala, entrarSalaPorCodigo, entrarFilaPublica, verificarLimiteDiario, incrementarPartidaDiaria, definirAposta, confirmarAposta, subscribeToSala } from '../hooks/useTopTrumpsMP'
import { carregarDeck as carregarDeckDB } from '../hooks/useLeaderboardDB'
import deck from '../data/supertrunfo-pt.json'
import './TopTrumpsLobby.css'

const todasCartas = deck.cartas

export default function TopTrumpsLobby() {
  const { t, locale } = useLanguage()
  const deck = getDeck(locale)
  const { user, perfil } = useAuth()
  const { setReaderMode } = useReader()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

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
  const [naFila, setNaFila] = useState(false)
  const [fraseIdx, setFraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [digitando, setDigitando] = useState(true)
  const [glitch, setGlitch] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const location = useLocation()

  const [avisoApostadoConfirmado, setAvisoApostadoConfirmado] = useState(false)
  const [showAviso, setShowAviso] = useState(false)
  const timerRef = useRef(null)

  // FRASES loaded from i18n keys below

  useEffect(() => {
    if (!user) return
    carregarDeckDB(user.id).then(ids => {
      const cartas = (ids || []).map(id => todasCartas.find(c => c.id_num === id)).filter(Boolean)
      setDeckUsuario(cartas)
    })
  }, [user])

  useEffect(() => {
    if (location.state?.mensagem) {
      setMensagem(location.state.mensagem)
      const t = setTimeout(() => {
        setMensagem('')
        window.history.replaceState({}, document.title)
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [location.state])

  useEffect(() => {
    console.log('[LOBBY] useEffect subscription disparou, salaId:', salaId)
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
        navigate(`/games/toptrumps/multiplayer?sala=${salaId}`)
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
    // Multiplayer liberado para todos via ficha — sem limite diário
    setLimiteInfo({ pode: true, usadas: 0, limite: 999 })
  }

  async function handleCriarSala() {
    if (!user || !modo || !turnos) return
    setAguardando(true)
    setErro('')
    const result = await criarSala(user.id, modo, 'privada', turnos)
    if (!result) { setErro(t('games.toptrumps.lobby.erro_criar')); setAguardando(false); return }
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
    if (modo === 'free') navigate(`/games/toptrumps/multiplayer?sala=${result.salaId}`)
  }

  async function handleFilaPublica() {
    console.log('[LOBBY] handleFilaPublica chamado')
    if (!user || !modo || !turnos) return
    setAguardando(true)
    setErro('')
    const result = await entrarFilaPublica(user.id, modo, turnos)
    console.log('[LOBBY] resultado fila:', result)
    setSalaId(result.salaId)
    console.log('[LOBBY] salaId setado:', result.salaId)
    setSouJ1(result.novo !== false)
    salaEntradaRef.current = false
    if (result.novo) {
      setNaFila(true)
      setAguardando(false)
    } else {
      setAguardando(false)
      if (modo === 'free') navigate(`/games/toptrumps/multiplayer?sala=${result.salaId}`)
    }
  }

  function handleSairFila() {
    setNaFila(false)
    setSalaId(null)
    setFraseIdx(0)
    setCharIdx(0)
  }

  // Typewriter effect for waiting screen
  useEffect(() => {
    if (!naFila) return
    const frase = t('games.toptrumps.lobby.frases_fila')[fraseIdx]
    if (digitando) {
      if (charIdx < frase.length) {
        const t = setTimeout(() => setCharIdx(i => i + 1), 40)
        return () => clearTimeout(t)
      } else {
        setDigitando(false)
        const t = setTimeout(() => {
          setGlitch(true)
          setTimeout(() => setGlitch(false), 150)
          setTimeout(() => { setGlitch(true); setTimeout(() => setGlitch(false), 120); }, 400)
          setTimeout(() => { setGlitch(true); setTimeout(() => setGlitch(false), 100); }, 800)
        }, 1500)
        return () => clearTimeout(t)
      }
    } else {
      const t = setTimeout(() => {
        setFraseIdx(i => (i + 1) % t('games.toptrumps.lobby.frases_fila').length)
        setCharIdx(0)
        setDigitando(true)
      }, 2800)
      return () => clearTimeout(t)
    }
  }, [naFila, fraseIdx, charIdx, digitando])

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

      const ehFree = perfil?.tier !== 'elite' && perfil?.tier !== 'primordial'

      return (
        <section className="ttmp-page">
      <h1 className="ttmp-titulo">{t('games.toptrumps.lobby.titulo')}</h1>

      {etapa === 'modo' && (
        <div className="ttmp-modos">
          <div className="ttmp-modo-card" onClick={() => selecionarModo('free')}>
            <h3 className="ttmp-modo-titulo">{t('games.toptrumps.lobby.modo_free')}</h3>
            <p className="ttmp-modo-desc">{t('games.toptrumps.lobby.modo_free_desc')}</p>
          </div>
          <div className={`ttmp-modo-card ttmp-modo-card--warning${ehFree ? ' ttmp-modo-card--disabled' : ''}`}
            onClick={() => { if (!ehFree) selecionarModo('apostado') }}>
            <div className="ttmp-modo-card-header">
              <h3 className="ttmp-modo-titulo">{t('games.toptrumps.lobby.modo_apostado')}</h3>
              {ehFree && <span className="ttmp-modo-badge">{t('games.toptrumps.lobby.modo_elite_badge')}</span>}
            </div>
            <p className="ttmp-modo-desc">{t('games.toptrumps.lobby.modo_apostado_desc')}</p>
            {ehFree && <p className="ttmp-modo-restricao">{t('games.toptrumps.lobby.modo_apostado_restricao')}</p>}
          </div>
        </div>
      )}

      {etapa === 'turnos' && (
        <div className="ttmp-turnos-wrap">
          <p className="ttmp-info">{t('games.toptrumps.lobby.turnos_info')}</p>
          <div className="ttmp-turnos">
            {[5, 10, 15, 20].map(n => (
              <button key={n}
                className={`ttmp-turno-btn${turnos === n ? ' ttmp-turno-btn--ativo' : ''}`}
                onClick={() => selecionarTurnos(n)}>{n}</button>
            ))}
          </div>
        </div>
      )}

      {naFila && (
        <div className="ttmp-fila">
          <h2 className="ttmp-fila-titulo">{t('games.toptrumps.lobby.fila_titulo')}</h2>
          <div className="ttmp-fila-frase">
            <span className={`ttmp-fila-texto${glitch ? ' ttmp-fila-glitch' : ''}`}>
              {t('games.toptrumps.lobby.frases_fila')[fraseIdx]?.slice(0, charIdx)}
            </span>
            <span className="ttmp-fila-cursor">|</span>
          </div>
          <div className="ttmp-fila-dots">
            <span className="ttmp-dot" /><span className="ttmp-dot" /><span className="ttmp-dot" />
          </div>
          <button className="ttmp-fila-sair" onClick={handleSairFila}>{t('games.toptrumps.lobby.fila_sair')}</button>
        </div>
      )}

      {!naFila && etapa === 'matchmaking' && (
        <div className="ttmp-matchmaking">
          {!podeJogar ? (
            <div className="ttmp-limite">
              <p>{t('games.toptrumps.lobby.limite_aviso', { usadas: limiteInfo?.usadas, limite: limiteInfo?.limite })}</p>
            </div>
          ) : (
            <>
              <p className="ttmp-info">{t('games.toptrumps.lobby.matchmaking_info')}</p>
              <div className="ttmp-matchmaking-botoes">
                <button className="ttmp-btn" onClick={handleCriarSala} disabled={aguardando}>
                  {aguardando ? t('games.toptrumps.lobby.criando') : t('games.toptrumps.lobby.btn_criar_sala')}
                </button>
                <div className="ttmp-entrar-codigo">
                  <input type="text" className="ttmp-input" placeholder={t('games.toptrumps.lobby.input_placeholder')} value={codigoInput}
                    onChange={e => setCodigoInput(e.target.value.toUpperCase())} maxLength={8} />
                  <button className="ttmp-btn" onClick={handleEntrarCodigo} disabled={codigoInput.length < 8 || aguardando}>
                    {t('games.toptrumps.lobby.btn_entrar')}
                  </button>
                </div>
                <button className="ttmp-btn" onClick={handleFilaPublica} disabled={aguardando || naFila}>
                  {aguardando ? t('games.toptrumps.lobby.procurando') : t('games.toptrumps.lobby.btn_fila_publica')}
                </button>
              </div>
              {aguardando && <div className="ttmp-spinner" />}
            </>
          )}

          {codigoSala && (
            <div className="ttmp-codigo-container">
              <p className="ttmp-codigo-label">{t('games.toptrumps.lobby.codigo_label')}</p>
              <div className="ttmp-codigo">{codigoSala}</div>
              <button className="ttmp-codigo-btn" onClick={copyCodigo}>{t('games.toptrumps.lobby.btn_copiar_codigo')}</button>
              <p className="ttmp-info">{t('games.toptrumps.lobby.codigo_info')}</p>
            </div>
          )}

          {modo === 'apostado' && salaId && !apostaConfirmada && (
            <div className="ttmp-aposta">
              <p className="ttmp-aposta-title">{t('games.toptrumps.lobby.aposta_title')}</p>
              <p className="ttmp-aposta-aviso">{t('games.toptrumps.lobby.aposta_aviso')}</p>
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
              <button className="ttmp-btn" disabled={!cartaAposta}
                onClick={() => { if (!avisoApostadoConfirmado) setShowAviso(true); else handleConfirmarAposta() }}>
                {t('games.toptrumps.lobby.btn_confirmar_aposta')}
              </button>
            </div>
          )}

          {showAviso && (
            <div className="ttmp-aviso-overlay" onClick={() => setShowAviso(false)}>
              <div className="ttmp-aviso-modal" onClick={e => e.stopPropagation()}>
                <h2 className="ttmp-aviso-titulo">{t('games.toptrumps.lobby.aviso_titulo')}</h2>
                <p className="ttmp-aviso-texto">{t('games.toptrumps.lobby.aviso_texto')}</p>
                <div className="ttmp-aviso-botoes">
                  <button className="ttmp-btn ttmp-btn--teal" onClick={() => { setAvisoApostadoConfirmado(true); setShowAviso(false); handleConfirmarAposta() }}>
                    {t('games.toptrumps.lobby.btn_entendi')}
                  </button>
                  <button className="ttmp-btn ttmp-btn--transparente" onClick={() => setShowAviso(false)}>
                    {t('games.toptrumps.lobby.btn_voltar')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {apostaConfirmada && <p className="ttmp-info">{t('games.toptrumps.lobby.aposta_aguardando')}</p>}
          {apostaOponente && <p className="ttmp-info">{t('games.toptrumps.lobby.aposta_oponente_pronto')}</p>}
          {erro && <p className="ttmp-erro">{erro}</p>}
          {mensagem && <p className="ttmp-mensagem">{mensagem}</p>}
        </div>
      )}
    </section>
  )
}
