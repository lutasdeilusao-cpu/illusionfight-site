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
    console.log('[TT] iniciarJogo executou — deck:', deckUsuario.length, 'turnos:', totalTurnos)
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
    const cores = tipo === 'ganhou' ? ['#e8853a','#F4A227','#fff'] : tipo === 'perdeu' ? ['#e74c3c','#c0392b','#6B0F1A'] : ['#fff','#8B8F96','#4F5359']
    const nova = []
    for (let i = 0; i < qtd; i++) {
      nova.push({
        id: Date.now() + i, x: Math.random() * 100, y: Math.random() * 100,
        cor: cores[Math.floor(Math.random() * cores.length)],
        tam: Math.floor(Math.random() * 8) + 6,
        duracao: (Math.random() * 0.6 + 0.8).toFixed(2),
        angle: Math.random() * 360, dist: Math.floor(Math.random() * 120) + 80
      })
    }
    setParticulas(nova)
    setTimeout(() => setParticulas([]), 1800)
  }

  function jogarAtributo(atributoId) {
    if (girando) return
    const attr = atributos.find(a => a.id === atributoId)
    const vJ = cartaJogador.atributos[atributoId]
    const vI = cartaIA.atributos[atributoId]
    let res
    if (attr.inverso) res = vJ < vI ? 'ganhou' : vJ > vI ? 'perdeu' : 'empate'
    else res = vJ > vI ? 'ganhou' : vJ < vI ? 'perdeu' : 'empate'
    setGirando(true)
    setTimeout(() => {
      setGirando(false)
      setAtributoEscolhido(atributoId)
      setResultado(res)
      if (res === 'ganhou') setPlacar(p => ({ ...p, jogador: p.jogador + 1 }))
      if (res === 'perdeu') setPlacar(p => ({ ...p, ia: p.ia + 1 }))
      setHistoricoRodadas(h => [...h, { rodada, cartaJogador: { nome: cartaJogador.nome, atributos: cartaJogador.atributos }, cartaIA: { nome: cartaIA.nome, atributos: cartaIA.atributos }, atributo: t(attr.nomeKey), valorJogador: vJ, valorIA: vI, resultado: res }])
      setFase('resultado_rodada')
      gerarParticulas(res)
    }, 800)
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
      console.log('[TT] registrarPartida resolveu (finalizarPartida) — stats:', stats, 'user no .then:', user?.id ?? 'NULO')
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
      console.log('[TT] registrarPartida resolveu (escolherRecompensa) — stats:', stats, 'user no .then:', user?.id ?? 'NULO')
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
    console.log('[TT] init — carregando deck do banco para user:', user.id)
    carregarDeckDB(user.id).then(ids => {
      console.log('[TT] deck carregado:', ids?.length || 0, 'cartas')
      const cartas = (ids || []).map(id => todasCartas.find(c => c.id_num === id)).filter(Boolean)
      console.log('[TT] cartas montadas:', cartas.length)
      setDeckUsuario(cartas)
    })
    carregarTentativas(user.id, getTierInicial()).then(({ usadas, jaGanhouHoje: jaGanhou, limite }) => {
      console.log('[TT] tentativas carregadas:', usadas, '/', limite, 'jaGanhouHoje:', jaGanhou)
      setTentativasMax(limite)
      setTentativasRestantes(Math.max(0, limite - usadas))
      setJaGanhouHoje(jaGanhou || false)
    })
  }, [user])

  useEffect(() => {
    console.log('[TT] auto-select disparou — deck:', deckUsuario.length, 'totalTurnos atual:', totalTurnos)
    if (totalTurnos !== null || deckUsuario.length === 0) { console.log('[TT] auto-select ignorado — condicao nao satisfeita'); return }
    const opcoes = [5, 10, 15, 20].filter(n => n <= deckUsuario.length)
    console.log('[TT] opcoes válidas:', opcoes)
    if (opcoes.length === 1) { console.log('[TT] setTotalTurnos chamado com:', opcoes[0]); setTotalTurnos(opcoes[0]) }
  }, [deckUsuario, totalTurnos])

  if (fase === 'menu') {
    const pct = deckUsuario.length / todasCartas.length * 100
    console.log('[TT] render botao — totalTurnos:', totalTurnos, 'disabled:', totalTurnos === null)
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
            <div className="tt-colecao-bar"><div className="tt-colecao-bar-fill" style={{ width: `${pct}%` }} /></div>
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
                    console.log('[TT] JOGAR clicado — totalTurnos:', totalTurnos, 'disabled:', totalTurnos === null)
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
      <section className="tt-page">
        <div className="tt-hud">
          <span className="tt-hud-rodada">{t('games.toptrumps.hud_rodada', { n: rodada, total: totalTurnos })}</span>
          <div className="tt-hud-placar"><span className="tt-hud-placar-jogador">{t('games.toptrumps.hud_voce', { n: placar.jogador })}</span><span className="tt-hud-placar-ia">{t('games.toptrumps.hud_ia', { n: placar.ia })}</span></div>
        </div>
        <div className="tt-cards">
          <TopTrumpsCard
            characterImage={defaultBg}
            name={cartaJogador.nome}
            description={cartaJogador.descricao}
            locale={locale}
            attributes={cartaJogador.atributos}
            onAttributeClick={(attrKey) => jogarAtributo(attrKey)}
            disabled={girando}
          />
          <div className="tt-vs"><span className="tt-vs-texto">{t('games.toptrumps.hud_vs')}</span></div>
          <TopTrumpsCard
            faceDown={!girando}
            name=""
            description=""
            locale={locale}
            attributes={{}}
          />
        </div>
      </section>
    )
  }

  if (fase === 'resultado_rodada') {
    if (!cartaJogador || !cartaIA) return null
    const attr = atributos.find(a => a.id === atributoEscolhido)
    const locale = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)
    return (
      <section className="tt-page">
        {particulas.map(p => {
          const style = { left: `${p.x}%`, top: `${p.y}%`, width: `${p.tam}px`, height: `${p.tam}px`, background: p.cor, animationDuration: `${p.duracao}s`, '--angle': `${p.angle}deg`, '--dist': `${p.dist}px` }
          return <div key={p.id} className="tt-particula" style={style} />
        })}
        <div className="tt-hud"><span className="tt-hud-rodada">{t('games.toptrumps.hud_rodada', { n: rodada, total: totalTurnos })}</span><div className="tt-hud-placar"><span className="tt-hud-placar-jogador">{t('games.toptrumps.hud_voce', { n: placar.jogador })}</span><span className="tt-hud-placar-ia">{t('games.toptrumps.hud_ia', { n: placar.ia })}</span></div></div>
        <div className="tt-cards">
          <TopTrumpsCard
            characterImage={defaultBg}
            name={cartaJogador.nome}
            description={cartaJogador.descricao}
            locale={locale}
            attributes={cartaJogador.atributos}
          />
          <div className="tt-vs"><span className="tt-resultado-texto">{resultado === 'ganhou' ? t('games.toptrumps.result_voce_venceu') : resultado === 'perdeu' ? t('games.toptrumps.result_ia_venceu') : t('games.toptrumps.result_empate')}</span><span className="tt-resultado-atributo">{attr ? t(attr.nomeKey) : ''}</span></div>
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
