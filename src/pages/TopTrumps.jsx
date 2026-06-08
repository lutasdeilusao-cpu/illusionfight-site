import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { TRIAL_ACTIVE } from '../config/trial'
import { useAuth } from '../context/AuthContext'
import { useAchievements } from '../context/AchievementsContext'
import { useReader } from '../context/ReaderContext'
import LoginGate from '../components/LoginGate/LoginGate'
import { useLanguage } from '../context/LanguageContext'
import { carregarDeck as carregarDeckDB, salvarCartasDeck, registrarPartida, carregarTentativas, incrementarTentativa, migrarLocalStorageParaSupabase } from '../hooks/useTopTrumpsDB'
import deck from '../data/supertrunfo-pt.json'
import TopTrumpsCard from '../components/TopTrumpsCard/TopTrumpsCard'
import defaultBg from '../assets/images/cards/bg01.png'
import './TopTrumps.css'

const todasCartas = deck.cartas
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

const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({
  id, nomeKey: attrNomeKey(id),
  descricao, inverso: id === 'rank_sdr'
}))

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
  const { t } = useLanguage()
  const { user, perfil } = useAuth()
  const { desbloquear } = useAchievements()
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

  // Confirmation + animation states
  const [confirmandoAtributo, setConfirmandoAtributo] = useState(null)
  const [cartaSumindo, setCartaSumindo] = useState(false)
  const [cortinaAtiva, setCortinaAtiva] = useState(false)
  const [revelandoResultado, setRevelandoResultado] = useState(false)

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
    const tier = getTierInicial()
    const qtd = tier === 'primordial' ? 30 : tier === 'elite' ? 20 : 10
    return embaralhar(todasCartas).slice(0, qtd)
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
    setConfirmandoAtributo(atributoId)
  }

  function cancelarJogada() {
    setConfirmandoAtributo(null)
  }

  function confirmarJogada() {
    const attrKey = confirmandoAtributo
    if (!attrKey || !cartaJogador || !cartaIA) return
    setConfirmandoAtributo(null)

    const attr = atributos.find(a => a.id === attrKey)
    const vJ = cartaJogador.atributos[attrKey]
    const vI = cartaIA.atributos[attrKey]
    let res
    if (attr.inverso) res = vJ < vI ? 'ganhou' : vJ > vI ? 'perdeu' : 'empate'
    else res = vJ > vI ? 'ganhou' : vJ < vI ? 'perdeu' : 'empate'

    setAtributoEscolhido(attrKey)
    setResultado(res)

    // Step 1: Card starts fading
    setCartaSumindo(true)
    setGirando(true)

    // Step 2: Curtain sweeps in
    setTimeout(() => {
      setCortinaAtiva(true)
    }, 600)

    // Step 3: Reveal opponent card + show result
    setTimeout(() => {
      setCartaSumindo(false)
      setCortinaAtiva(false)
      setGirando(false)

      if (res === 'ganhou') setPlacar(p => ({ ...p, jogador: p.jogador + 1 }))
      if (res === 'perdeu') setPlacar(p => ({ ...p, ia: p.ia + 1 }))

      setHistoricoRodadas(h => [...h, {
        rodada,
        cartaJogador: { nome: cartaJogador.nome, atributos: cartaJogador.atributos },
        cartaIA: { nome: cartaIA.nome, atributos: cartaIA.atributos },
        atributo: t(attr.nomeKey), valorJogador: vJ, valorIA: vI, resultado: res
      }])

      setFase('resultado_rodada')
      gerarParticulas(res)
    }, 1800)
  }

  function proximaRodada() {
    if (rodada >= totalTurnos) { finalizarPartida(); return }
    const pJ = deckJogador[rodada % deckJogador.length]
    const pI = deckIA[rodada % deckIA.length]
    setCartaJogador(pJ); setCartaIA(pI)
    setAtributoEscolhido(null); setResultado(null)
    setRodada(r => r + 1); setFase('jogando')
  }

  function finalizarPartida() {
    const venceu = placar.jogador > placar.ia
    const resultado = venceu ? 'vitoria' : placar.jogador === placar.ia ? 'empate' : 'derrota'
    const jogadas = historicoRodadas.length
    const vitorias = historicoRodadas.filter(h => h.resultado === 'ganhou').length
    const derrotas = historicoRodadas.filter(h => h.resultado === 'perdeu').length
    const empates = historicoRodadas.filter(h => h.resultado === 'empate').length

    if (venceu) {
      const podeGanhar = tentativasRestantes > 0 && !jaGanhouHoje
      if (podeGanhar) {
        const teto = TRIAL_ACTIVE ? Infinity : 49
        const idsTem = new Set(JSON.parse(localStorage.getItem(getDeckKey()) || '[]'))
        const pool = todasCartas.filter((c, i) => i <= teto && !idsTem.has(c.id))
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

  function escolherRecompensa(carta) {
    const chave = getDeckKey()
    const ids = JSON.parse(localStorage.getItem(chave) || '[]')
    ids.push(carta.id_num)
    localStorage.setItem(chave, JSON.stringify(ids))
    setDeckUsuario([...deckUsuario, carta])
    salvarCartasDeck(user.id, [carta.id_num])
    setJaGanhouHoje(true)
    incrementarTentativa(user.id, getTierInicial()).then(usadas => {
      setTentativasRestantes(Math.max(0, tentativasMax - usadas))
    })
    const pendente = window.__partidaPendente || { jogadas: historicoRodadas.length, vitorias: 0, derrotas: 0, empates: 0, resultado: 'vitoria' }
    registrarPartida(user.id, { ...pendente, carta_recompensa: carta.id_num }).then(stats => {
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
      const cartas = (ids || []).map(id => todasCartas.find(c => c.id_num === id)).filter(Boolean)
      setDeckUsuario(cartas)
    })
    carregarTentativas(user.id, getTierInicial()).then(({ usadas, jaGanhouHoje: jaGanhou, limite }) => {
      setTentativasMax(limite)
      setTentativasRestantes(Math.max(0, limite - usadas))
      setJaGanhouHoje(jaGanhou || false)
    })
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
        <div className="tt-menu-cards"><div className="tt-card-stack">
          <div className="tt-card-sample tt-card-sample--1" /><div className="tt-card-sample tt-card-sample--2" />
          <div className="tt-card-sample tt-card-sample--3"><div className="tt-card-sample-pattern" /><div className="tt-card-sample-logo">LDI</div></div>
        </div></div>
        <div className="tt-menu-content">
          <div className="tt-title-group"><h1 className="tt-title-main">{t('games.toptrumps.menu_titulo')}</h1><span className="tt-title-sub">{t('games.toptrumps.menu_subtitulo')}</span></div>
          <p className="tt-title-desc">{t('games.toptrumps.menu_desc')}</p>
          <div className="tt-colecao">
            <span className="tt-colecao-label">{t('games.toptrumps.menu_cartas_coletadas', { n: deckUsuario.length, total: todasCartas.length })}</span>
            <div className="tt-colecao-bar"><div className="tt-colecao-bar-fill" style={{ '--fill': `${pct}%` }} /></div>
          </div>
          <LoginGate feature="o Top Trumps">
            {(menuStep === null || menuStep === 'modo') && (
              <div className="tt-modos">
                <div className="tt-modo-card" onClick={() => { setMenuStep('config'); }}>
                  <h3 className="tt-modo-titulo">{t('games.toptrumps.menu_single_player')}</h3><p className="tt-modo-desc">{t('games.toptrumps.menu_single_desc')}</p>
                </div>
                <Link to="/games/toptrumps/lobby" className="tt-modo-card">
                  <h3 className="tt-modo-titulo">{t('games.toptrumps.menu_multiplayer')}</h3><p className="tt-modo-desc">{t('games.toptrumps.menu_multi_desc')}</p>
                </Link>
              </div>
            )}
            {menuStep === 'config' && (
              <div className="tt-config tt-fade-in">
                <span className="tt-config-label">{t('games.toptrumps.menu_num_turnos')}</span>
                <div className="tt-config-turnos">
                  {[5, 10, 15, 20].map(n => (
                    <button key={n}
                      className={`tt-config-turno-btn${totalTurnos === n ? ' tt-config-turno-btn--ativo' : ''}`}
                      disabled={n > maxTurnos}
                      onClick={() => setTotalTurnos(n)}>{n}</button>
                  ))}
                </div>
                <div className="tt-config-tentativas">
                  {Array.from({length: tentativasMax}).map((_, i) => (<span key={i} className={`tt-tentativa-dot${i < (tentativasMax - tentativasRestantes) ? ' tt-tentativa-dot--gasta' : ''}`} />))}
                  <span className="tt-tentativa-texto">{t('games.toptrumps.menu_tentativas', { restantes: tentativasRestantes, max: tentativasMax })}</span>
                </div>
                {jaGanhouHoje && <p className="tt-ja-jogou">{t('games.toptrumps.menu_ja_ganhou')}</p>}
                <button className={`tt-btn-jogar${totalTurnos !== null ? '' : ' tt-btn-jogar--disabled'}`}
                  disabled={totalTurnos === null} onClick={() => {
                    iniciarJogo()
                  }}>{t('games.toptrumps.jogar')}</button>
                <Link to="/perfil?aba=colecao" className="tt-link-album">{t('games.toptrumps.menu_album')}</Link>
              </div>
            )}
          </LoginGate>
          <Link to="/games" className="tt-voltar">{t('games.toptrumps.menu_voltar_games')}</Link>
        </div>
      </div></section>
    )
  }

  if (fase === 'jogando') {
    if (!cartaJogador || !cartaIA) return null
    const locale = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)
    return (
      <>
        <div className="tt-fire-particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="tt-fire-particle" />
          ))}
        </div>
        <section className="tt-page">
        <div className="tt-hud-new">
          <div className="tt-round-badge">
            <span className="tt-round-label">{t('games.toptrumps.hud_rodada', { n: rodada, total: totalTurnos })}</span>
          </div>
          <div className="tt-score-row">
            <div className="tt-score-item tt-score--player">
              <span className="tt-score-label">VOCÊ</span>
              <span className="tt-score-value">{placar.jogador}</span>
            </div>
            <div className="tt-score-divider">:</div>
            <div className="tt-score-item tt-score--ia">
              <span className="tt-score-label">IA</span>
              <span className="tt-score-value">{placar.ia}</span>
            </div>
          </div>
        </div>
        <div className="tt-cards">
          <TopTrumpsCard
            characterImage={defaultBg}
            name={cartaJogador.nome}
            description={cartaJogador.descricao}
            locale={locale}
            attributes={cartaJogador.atributos}
            onAttributeClick={(attrKey) => onClickAtributo(attrKey)}
            disabled={girando || !!confirmandoAtributo}
          />
          <div className={`tt-vs-epico${cortinaAtiva ? ' tt-cortina-ativa' : ''}`}>
            <div className="tt-vs-glow" />
            <span className="tt-vs-texto-grande">VS</span>
          </div>
          <div className={`tt-card-oponente-wrapper${cartaSumindo ? ' tt-carta-sumindo' : ''}`}>
            <TopTrumpsCard
              mystery
              name=""
              description=""
              locale={locale}
              attributes={{}}
            />
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
                <span className="tt-confirm-label">{t('games.toptrumps.confirmar_atributo')}</span>
                <span className="tt-confirm-attr-nome">{attr ? t(attr.nomeKey) : ''}</span>
                <div className="tt-confirm-values">
                  <div className="tt-confirm-value-box">
                    <span className="tt-confirm-value-label">{t('games.toptrumps.seu_valor')}</span>
                    <span className="tt-confirm-value-num">{vJ}</span>
                  </div>
                  <div className="tt-confirm-value-box">
                    <span className="tt-confirm-value-label">{t('games.toptrumps.valor_maximo')}</span>
                    <span className="tt-confirm-value-num tt-confirm-value-max">{maxV}</span>
                  </div>
                </div>
                <div className="tt-confirm-bar">
                  <div className="tt-confirm-bar-fill" style={{ width: `${pctMax}%` }} />
                </div>
                <span className="tt-confirm-pct">{pctMax}% do máximo</span>
                <div className="tt-confirm-buttons">
                  <button className="tt-confirm-btn tt-confirm-btn--cancel" onClick={cancelarJogada}>{t('games.toptrumps.cancelar')}</button>
                  <button className="tt-confirm-btn tt-confirm-btn--ok" onClick={confirmarJogada}>{t('games.toptrumps.confirmar')}</button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Curtain overlay for animation */}
        {cortinaAtiva && (
          <div className="tt-curtain-overlay">
            <div className="tt-curtain-inner" />
            <div className="tt-curtain-onomatopeia">
              <span className="tt-onoma-texto">KABOOM!</span>
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
    return (
      <>
        <div className="tt-fire-particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="tt-fire-particle" />
          ))}
        </div>
        <section className="tt-page">
        {particulas.map(p => (
          <div key={p.id} className={`tt-particula tt-particula--${p.tipo} tt-particula--v${p.variante}`} />
        ))}
        <div className="tt-hud-new">
          <div className="tt-round-badge">
            <span className="tt-round-label">{t('games.toptrumps.hud_rodada', { n: rodada, total: totalTurnos })}</span>
          </div>
          <div className="tt-score-row">
            <div className="tt-score-item tt-score--player">
              <span className="tt-score-label">VOCÊ</span>
              <span className="tt-score-value">{placar.jogador}</span>
            </div>
            <div className="tt-score-divider">:</div>
            <div className="tt-score-item tt-score--ia">
              <span className="tt-score-label">IA</span>
              <span className="tt-score-value">{placar.ia}</span>
            </div>
          </div>
        </div>
        <div className="tt-cards">
          <TopTrumpsCard
            characterImage={defaultBg}
            name={cartaJogador.nome}
            description={cartaJogador.descricao}
            locale={locale}
            attributes={cartaJogador.atributos}
          />
          <div className={`tt-vs tt-vs--result ${resultado === 'ganhou' ? 'tt-vs--vitoria' : resultado === 'perdeu' ? 'tt-vs--derrota' : 'tt-vs--empate'}`}>
            <span className="tt-resultado-texto">{resultado === 'ganhou' ? t('games.toptrumps.result_voce_venceu') : resultado === 'perdeu' ? t('games.toptrumps.result_ia_venceu') : t('games.toptrumps.result_empate')}</span>
            {attr && (
              <div className="tt-resultado-attr-box">
                <span className="tt-resultado-attr-nome">{t(attr.nomeKey)}</span>
                <div className="tt-resultado-attr-duelo">
                  <div className="tt-resultado-attr-lado tt-resultado-attr-lado--jogador">
                    <span className="tt-resultado-attr-label">{t('games.toptrumps.voce')}</span>
                    <span className={`tt-resultado-attr-valor ${resultado === 'ganhou' ? 'tt-resultado-attr--ganhou' : resultado === 'perdeu' ? 'tt-resultado-attr--perdeu' : ''}`}>{cartaJogador.atributos[atributoEscolhido]}</span>
                  </div>
                  <span className="tt-resultado-attr-x">×</span>
                  <div className="tt-resultado-attr-lado tt-resultado-attr-lado--ia">
                    <span className="tt-resultado-attr-label">{t('games.toptrumps.ia')}</span>
                    <span className={`tt-resultado-attr-valor ${resultado === 'perdeu' ? 'tt-resultado-attr--ganhou' : resultado === 'ganhou' ? 'tt-resultado-attr--perdeu' : ''}`}>{cartaIA.atributos[atributoEscolhido]}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <TopTrumpsCard
            characterImage={defaultBg}
            name={cartaIA.nome}
            description={cartaIA.descricao}
            locale={locale}
            attributes={cartaIA.atributos}
          />
        </div>
        <button className="tt-proxima-btn" onClick={proximaRodada}>{rodada >= totalTurnos ? t('games.toptrumps.result_final') : t('games.toptrumps.result_proxima')}</button>
      </section>
      </>
    )
  }

  if (fase === 'recompensa') {
    const locale = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)
    return (
      <section className="tt-page">
        <div className="tt-recompensa">
          <h2 className="tt-recompensa-titulo">{t('games.toptrumps.recompensa_titulo')}</h2>
          <p className="tt-recompensa-sub">{t('games.toptrumps.recompensa_sub')}</p>
          <div className="tt-recompensa-cards">
            {recompensaOpcoes.map((carta) => (
              <div key={carta.id} className={`tt-recompensa-card${cartaRecompensaSelecionada?.id === carta.id ? ' tt-recompensa-card--virada' : ''}`} onClick={() => setCartaRecompensaSelecionada(carta)}>
                {cartaRecompensaSelecionada?.id === carta.id ? (
                  <TopTrumpsCard
                    characterImage={defaultBg}
                    name={carta.nome}
                    description={carta.descricao}
                    locale={locale}
                    attributes={carta.atributos}
                  />
                ) : (<div className="tt-recompensa-card-verso"><span className="tt-recompensa-card-verso-texto">?</span><p className="tt-recompensa-card-verso-label">{t('games.toptrumps.recompensa_carta_misteriosa')}</p></div>)}
              </div>
            ))}
          </div>
          <button className="tt-btn-confirmar" disabled={!cartaRecompensaSelecionada} onClick={() => escolherRecompensa(cartaRecompensaSelecionada)}>{t('games.toptrumps.recompensa_confirmar')}</button>
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
        const diff = attr?.inverso ? h.valorIA - h.valorJogador : h.valorJogador - h.valorIA
        if (diff > melhorDiferenca) { melhorDiferenca = diff; melhorRodada = h }
      }
    })
    const icone = venceu ? '🏆' : empatou ? '🤝' : '💀'
    const titulo = venceu ? t('games.toptrumps.result_voce_venceu') : empatou ? t('games.toptrumps.result_empate') : t('games.toptrumps.result_ia_venceu')
    return (
      <section className="tt-page">
        <div className="tt-relatorio">
          <h2 className="tt-relatorio-titulo">{t('games.toptrumps.relatorio_titulo')}</h2>
          <p className="tt-relatorio-sub">{t('games.toptrumps.relatorio_sub')}</p>
          <div className="tt-relatorio-icone">{icone}</div>
          <h3 className={`tt-relatorio-resultado${venceu ? ' tt-fim-titulo--vitoria' : empatou ? ' tt-fim-titulo--empate' : ' tt-fim-titulo--derrota'}`}>{titulo}</h3>
          <div className="tt-relatorio-placar">
            <div className="tt-relatorio-placar-item"><span className="tt-relatorio-placar-valor">{placar.jogador}</span><span className="tt-relatorio-placar-label">{t('games.toptrumps.relatorio_voce')}</span></div>
            <span className="tt-relatorio-placar-divisor">×</span>
            <div className="tt-relatorio-placar-item"><span className="tt-relatorio-placar-valor">{placar.ia}</span><span className="tt-relatorio-placar-label">{t('games.toptrumps.relatorio_ia_label')}</span></div>
          </div>
          <div className="tt-relatorio-stats">
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{rodadasJogadas}</span><span className="tt-relatorio-stat-label">{t('games.toptrumps.relatorio_rodadas')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{placar.jogador}</span><span className="tt-relatorio-stat-label">{t('games.toptrumps.relatorio_vitorias')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{derrotas}</span><span className="tt-relatorio-stat-label">{t('games.toptrumps.relatorio_derrotas')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{empates}</span><span className="tt-relatorio-stat-label">{t('games.toptrumps.relatorio_empates')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{attrMaisEscolhido}</span><span className="tt-relatorio-stat-label">{t('games.toptrumps.relatorio_attr_usado')}</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{melhorRodada?.cartaJogador.nome || '—'}</span><span className="tt-relatorio-stat-label">{t('games.toptrumps.relatorio_melhor_vitoria')}</span></div>
          </div>
          <div className="tt-relatorio-lista">
            <h4 className="tt-relatorio-lista-titulo">{t('games.toptrumps.relatorio_confrontos')}</h4>
            {historicoRodadas.map((h, i) => (<div key={i} className="tt-relatorio-lista-item"><span className="tt-relatorio-lista-icon">{h.resultado === 'ganhou' ? '✓' : h.resultado === 'perdeu' ? '✗' : '='}</span><span className="tt-relatorio-lista-nome">{h.cartaJogador.nome} vs {h.cartaIA.nome}</span><span className="tt-relatorio-lista-attr">{h.atributo}</span><span className="tt-relatorio-lista-valor">{h.valorJogador} × {h.valorIA}</span></div>))}
          </div>
          {venceu && jaGanhouHoje && <p className="tt-fim-aviso">{t('games.toptrumps.relatorio_ja_ganhou')}</p>}
          <div className="tt-fim-actions">
            <button className="tt-btn-jogar" onClick={() => setFase('menu')}>{t('games.toptrumps.btn_jogar_novamente')}</button>
            <Link to="/games" className="tt-btn-jogar tt-btn-jogar--secondary">{t('games.toptrumps.menu_voltar_games')}</Link>
          </div>
        </div>
      </section>
    )
  }

  return null
}
