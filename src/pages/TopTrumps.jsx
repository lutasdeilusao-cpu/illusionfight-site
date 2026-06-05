import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { TRIAL_ACTIVE } from '../config/trial'
import { useAuth } from '../context/AuthContext'
import { useAchievements } from '../context/AchievementsContext'
import LoginGate from '../components/LoginGate/LoginGate'
import { carregarDeck as carregarDeckDB, salvarCartasDeck, registrarPartida, carregarTentativas, incrementarTentativa, migrarLocalStorageParaSupabase } from '../hooks/useTopTrumpsDB'
import deck from '../data/supertrunfo-pt.json'
import './TopTrumps.css'

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

function keyPorUser(user, suffix) {
  const uid = user?.id || 'anon'
  return `ldi-toptrumps-${suffix}-${uid}`
}

export default function TopTrumps() {
  const { user } = useAuth()
  const { desbloquear } = useAchievements()
  const desbloquearRef = useRef(desbloquear)
  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])

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
  const [tentativasRestantes, setTentativasRestantes] = useState(3)
  const [cartaRecompensaSelecionada, setCartaRecompensaSelecionada] = useState(null)
  const [menuStep, setMenuStep] = useState(null)
  const [girando, setGirando] = useState(false)
  const [particulas, setParticulas] = useState([])
  const [historicoRodadas, setHistoricoRodadas] = useState([])

  function getDeckKey() { return keyPorUser(user, 'deck') }

  function getTierInicial() {
    if (!user) return 'free'
    return 'free'
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
      setHistoricoRodadas(h => [...h, { rodada, cartaJogador: { nome: cartaJogador.nome, atributos: cartaJogador.atributos }, cartaIA: { nome: cartaIA.nome, atributos: cartaIA.atributos }, atributo: attr.nome, valorJogador: vJ, valorIA: vI, resultado: res }])
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
      const podeGanhar = tentativasRestantes > 0
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
    incrementarTentativa(user.id).then(usadas => {
      setTentativasRestantes(Math.max(0, 3 - usadas))
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
    carregarTentativas(user.id).then(({ usadas }) => {
      console.log('[TT] tentativas carregadas:', usadas)
      setTentativasRestantes(Math.max(0, 3 - usadas))
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
          <div className="tt-title-group"><h1 className="tt-title-main">TOP TRUMPS</h1><span className="tt-title-sub">— LDI</span></div>
          <p className="tt-title-desc">Jogo de cartas colecionáveis do universo LDI</p>
          <div className="tt-colecao">
            <span className="tt-colecao-label">{deckUsuario.length} / {todasCartas.length} CARTAS COLETADAS</span>
            <div className="tt-colecao-bar"><div className="tt-colecao-bar-fill" style={{ width: `${pct}%` }} /></div>
          </div>
          <LoginGate feature="o Top Trumps">
            {(menuStep === null || menuStep === 'modo') && (
              <div className="tt-modos">
                <div className="tt-modo-card" onClick={() => { setMenuStep('config'); }}>
                  <h3 className="tt-modo-titulo">SINGLE PLAYER</h3><p className="tt-modo-desc">Jogue contra a IA</p>
                </div>
                <Link to="/games/toptrumps/lobby" className="tt-modo-card">
                  <h3 className="tt-modo-titulo">MULTIPLAYER</h3><p className="tt-modo-desc">Jogue contra outros jogadores em tempo real</p>
                </Link>
              </div>
            )}
            {menuStep === 'config' && (
              <div className="tt-config tt-fade-in">
                <span className="tt-config-label">NÚMERO DE TURNOS</span>
                <div className="tt-config-turnos">
                  {[5, 10, 15, 20].map(n => (
                    <button key={n}
                      className={`tt-config-turno-btn${totalTurnos === n ? ' tt-config-turno-btn--ativo' : ''}`}
                      disabled={n > maxTurnos}
                      onClick={() => setTotalTurnos(n)}>{n}</button>
                  ))}
                </div>
                <div className="tt-config-tentativas">
                  {[0, 1, 2].map(i => (<span key={i} className={`tt-tentativa-dot${i < (3 - tentativasRestantes) ? ' tt-tentativa-dot--gasta' : ''}`} />))}
                  <span className="tt-tentativa-texto">{tentativasRestantes} chance(s) de ganhar carta hoje</span>
                </div>
                {jaGanhouHoje && <p className="tt-ja-jogou">Você já ganhou sua carta hoje. Volte amanhã!</p>}
                <button className={`tt-btn-jogar${totalTurnos !== null ? '' : ' tt-btn-jogar--disabled'}`}
                  disabled={totalTurnos === null} onClick={() => {
                    console.log('[TT] JOGAR clicado — totalTurnos:', totalTurnos, 'disabled:', totalTurnos === null)
                    iniciarJogo()
                  }}>JOGAR</button>
                <Link to="/perfil?aba=colecao" className="tt-link-album">Ver meu álbum de cartas →</Link>
              </div>
            )}
          </LoginGate>
          <Link to="/games" className="tt-voltar">VOLTAR AOS GAMES</Link>
        </div>
      </div></section>
    )
  }

  if (fase === 'jogando') {
    if (!cartaJogador || !cartaIA) return null
    return (
      <section className="tt-page">
        <div className="tt-hud">
          <span className="tt-hud-rodada">RODADA {rodada}/{totalTurnos}</span>
          <div className="tt-hud-placar"><span className="tt-hud-placar-jogador">VOCÊ: {placar.jogador}</span><span className="tt-hud-placar-ia">IA: {placar.ia}</span></div>
        </div>
        <div className="tt-cards">
          <div className="tt-card-jogador">
            <div className="tt-card-avatar" style={{ background: avatarCor(cartaJogador.id) }}><span className="tt-card-avatar-iniciais">{cartaJogador.nome.split('—')[0].trim().charAt(0)}</span></div>
            <h3 className="tt-card-nome">{cartaJogador.nome}</h3><p className="tt-card-elemental">{cartaJogador.elemental}</p>
            <div className="tt-card-atributos">{atributos.map(attr => (<button key={attr.id} className="tt-atributo-btn" disabled={girando} onClick={() => jogarAtributo(attr.id)} title={attr.descricao}><span className="tt-atributo-nome">{attr.nome}</span><span className="tt-atributo-valor">{cartaJogador.atributos[attr.id]}</span></button>))}</div>
          </div>
          <div className="tt-vs"><span className="tt-vs-texto">VS</span></div>
          <div className={`tt-card-ia tt-card-face-down${girando ? ' spinning-reveal' : ''}`}>
            <div className="tt-card-avatar tt-card-avatar--ia" style={{ background: '#1a1a2e' }}><span className="tt-card-avatar-iniciais">?</span></div>
            <h3 className="tt-card-nome">???</h3><p className="tt-card-elemental">???</p>
            <div className="tt-card-atributos">{atributos.map(attr => (<div key={attr.id} className="tt-atributo-btn tt-atributo-btn--disabled"><span className="tt-atributo-nome">{attr.nome}</span><span className="tt-atributo-valor">??</span></div>))}</div>
          </div>
        </div>
      </section>
    )
  }

  if (fase === 'resultado_rodada') {
    if (!cartaJogador || !cartaIA) return null
    const attr = atributos.find(a => a.id === atributoEscolhido)
    return (
      <section className="tt-page">
        {particulas.map(p => {
          const style = { left: `${p.x}%`, top: `${p.y}%`, width: `${p.tam}px`, height: `${p.tam}px`, background: p.cor, animationDuration: `${p.duracao}s`, '--angle': `${p.angle}deg`, '--dist': `${p.dist}px` }
          return <div key={p.id} className="tt-particula" style={style} />
        })}
        <div className="tt-hud"><span className="tt-hud-rodada">RODADA {rodada}/{totalTurnos}</span><div className="tt-hud-placar"><span className="tt-hud-placar-jogador">VOCÊ: {placar.jogador}</span><span className="tt-hud-placar-ia">IA: {placar.ia}</span></div></div>
        <div className="tt-cards">
          <div className="tt-card-jogador">
            <div className="tt-card-avatar" style={{ background: avatarCor(cartaJogador.id) }}><span className="tt-card-avatar-iniciais">{cartaJogador.nome.split('—')[0].trim().charAt(0)}</span></div>
            <h3 className="tt-card-nome">{cartaJogador.nome}</h3><p className="tt-card-elemental">{cartaJogador.elemental}</p>
            <div className="tt-card-atributos">{atributos.map(a => (<div key={a.id} className={`tt-atributo-btn${a.id === atributoEscolhido ? ` tt-atributo--${resultado}` : ''}`}><span className="tt-atributo-nome">{a.nome}</span><span className="tt-atributo-valor">{cartaJogador.atributos[a.id]}</span></div>))}</div>
          </div>
          <div className="tt-vs"><span className="tt-resultado-texto">{resultado === 'ganhou' ? 'VOCÊ VENCEU!' : resultado === 'perdeu' ? 'IA VENCEU!' : 'EMPATE!'}</span><span className="tt-resultado-atributo">{attr?.nome}</span></div>
          <div className="tt-card-ia">
            <div className="tt-card-avatar" style={{ background: avatarCor(cartaIA.id) }}><span className="tt-card-avatar-iniciais">{cartaIA.nome.split('—')[0].trim().charAt(0)}</span></div>
            <h3 className="tt-card-nome">{cartaIA.nome}</h3><p className="tt-card-elemental">{cartaIA.elemental}</p>
            <div className="tt-card-atributos">{atributos.map(a => { let c = 'tt-atributo-btn'; if (a.id === atributoEscolhido) c += resultado === 'ganhou' ? ' tt-atributo--perdeu' : resultado === 'perdeu' ? ' tt-atributo--ganhou' : ' tt-atributo--empate'; return <div key={a.id} className={c}><span className="tt-atributo-nome">{a.nome}</span><span className="tt-atributo-valor">{cartaIA.atributos[a.id]}</span></div> })}</div>
          </div>
        </div>
        <button className="tt-proxima-btn" onClick={proximaRodada}>{rodada >= totalTurnos ? 'VER RESULTADO FINAL' : 'PRÓXIMA RODADA'}</button>
      </section>
    )
  }

  if (fase === 'recompensa') {
    return (
      <section className="tt-page">
        <div className="tt-recompensa">
          <h2 className="tt-recompensa-titulo">VITÓRIA! ESCOLHA SUA RECOMPENSA</h2>
          <p className="tt-recompensa-sub">Você ganhou uma carta nova. Selecione abaixo:</p>
          <div className="tt-recompensa-cards">
            {recompensaOpcoes.map((carta) => (
              <div key={carta.id} className={`tt-recompensa-card${cartaRecompensaSelecionada?.id === carta.id ? ' tt-recompensa-card--virada' : ''}`} onClick={() => setCartaRecompensaSelecionada(carta)}>
                {cartaRecompensaSelecionada?.id === carta.id ? (
                  <div className="tt-recompensa-card-frente">
                    <div className="tt-card-avatar" style={{ background: avatarCor(carta.id) }}><span className="tt-card-avatar-iniciais">{carta.nome.split('—')[0].trim().charAt(0)}</span></div>
                    <h3 className="tt-card-nome">{carta.nome}</h3><p className="tt-card-elemental">{carta.elemental}</p><p className="tt-card-descricao">{carta.descricao.slice(0, 80)}...</p>
                    <div className="tt-card-atributos">{atributos.map(a => (<div key={a.id} className="tt-atributo-btn"><span className="tt-atributo-nome">{a.nome}</span><span className="tt-atributo-valor">{carta.atributos[a.id]}</span></div>))}</div>
                  </div>
                ) : (<div className="tt-recompensa-card-verso"><span className="tt-recompensa-card-verso-texto">?</span><p className="tt-recompensa-card-verso-label">CARTA MISTERIOSA</p></div>)}
              </div>
            ))}
          </div>
          <button className="tt-btn-confirmar" disabled={!cartaRecompensaSelecionada} onClick={() => escolherRecompensa(cartaRecompensaSelecionada)}>CONFIRMAR RECOMPENSA</button>
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
    const titulo = venceu ? 'VOCÊ VENCEU!' : empatou ? 'EMPATE!' : 'IA VENCEU!'
    return (
      <section className="tt-page">
        <div className="tt-relatorio">
          <h2 className="tt-relatorio-titulo">RELATÓRIO DA ARENA</h2>
          <p className="tt-relatorio-sub">Top Trumps — LDI</p>
          <div className="tt-relatorio-icone">{icone}</div>
          <h3 className={`tt-relatorio-resultado${venceu ? ' tt-fim-titulo--vitoria' : empatou ? ' tt-fim-titulo--empate' : ' tt-fim-titulo--derrota'}`}>{titulo}</h3>
          <div className="tt-relatorio-placar">
            <div className="tt-relatorio-placar-item"><span className="tt-relatorio-placar-valor">{placar.jogador}</span><span className="tt-relatorio-placar-label">VOCÊ</span></div>
            <span className="tt-relatorio-placar-divisor">×</span>
            <div className="tt-relatorio-placar-item"><span className="tt-relatorio-placar-valor">{placar.ia}</span><span className="tt-relatorio-placar-label">IA</span></div>
          </div>
          <div className="tt-relatorio-stats">
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{rodadasJogadas}</span><span className="tt-relatorio-stat-label">Rodadas</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{placar.jogador}</span><span className="tt-relatorio-stat-label">Vitórias</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{derrotas}</span><span className="tt-relatorio-stat-label">Derrotas</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{empates}</span><span className="tt-relatorio-stat-label">Empates</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{attrMaisEscolhido}</span><span className="tt-relatorio-stat-label">Attr. + usado</span></div>
            <div className="tt-relatorio-stat"><span className="tt-relatorio-stat-valor">{melhorRodada?.cartaJogador.nome || '—'}</span><span className="tt-relatorio-stat-label">Melhor vitória</span></div>
          </div>
          <div className="tt-relatorio-lista">
            <h4 className="tt-relatorio-lista-titulo">CONFRONTOS</h4>
            {historicoRodadas.map((h, i) => (<div key={i} className="tt-relatorio-lista-item"><span className="tt-relatorio-lista-icon">{h.resultado === 'ganhou' ? '✓' : h.resultado === 'perdeu' ? '✗' : '='}</span><span className="tt-relatorio-lista-nome">{h.cartaJogador.nome} vs {h.cartaIA.nome}</span><span className="tt-relatorio-lista-attr">{h.atributo}</span><span className="tt-relatorio-lista-valor">{h.valorJogador} × {h.valorIA}</span></div>))}
          </div>
          {venceu && jaGanhouHoje && <p className="tt-fim-aviso">Você já ganhou sua carta hoje. Volte amanhã para ganhar mais!</p>}
          <div className="tt-fim-actions">
            <button className="tt-btn-jogar" onClick={() => setFase('menu')}>JOGAR NOVAMENTE</button>
            <Link to="/games" className="tt-btn-jogar tt-btn-jogar--secondary">VOLTAR AOS GAMES</Link>
          </div>
        </div>
      </section>
    )
  }

  return null
}
