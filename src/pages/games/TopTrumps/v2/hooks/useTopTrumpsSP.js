import { useState, useEffect, useCallback } from 'react'

function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function useTopTrumpsSP({
  user, deckUsuario, todasCartas, atributos,
  jaGanhouHoje, tentativasMax,
  consumir, registrarPartida, registrarEvento, registrarPontuacaoRanking,
  desbloquear,
  onEfeitosRevelacao,
  onFinalizarComRecompensa
}) {
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
  const [vezAtual, setVezAtual] = useState('jogador')
  const [iaEscolhendo, setIaEscolhendo] = useState(false)
  const [girando, setGirando] = useState(false)
  const [confirmandoAtributo, setConfirmandoAtributo] = useState(null)
  const [historicoRodadas, setHistoricoRodadas] = useState([])
  const [swipeRevealed, setSwipeRevealed] = useState(false)
  const [templateIdxJogador, setTemplateIdxJogador] = useState(0)
  const [templateIdxIA, setTemplateIdxIA] = useState(0)
  const [recompensaOpcoes, setRecompensaOpcoes] = useState([])
  const [cartaRecompensaSelecionada, setCartaRecompensaSelecionada] = useState(null)

  useEffect(() => {
    if (totalTurnos !== null || deckUsuario.length === 0) return
    const opcoes = [5, 10, 15, 20].filter(n => n <= deckUsuario.length)
    if (opcoes.length === 1) setTotalTurnos(opcoes[0])
  }, [deckUsuario, totalTurnos])

  useEffect(() => {
    if (vezAtual !== 'ia' || fase !== 'jogando') return
    const timer = setTimeout(() => iaEscolherAtributo(), 500)
    return () => clearTimeout(timer)
  }, [vezAtual, fase])

  function sortearTemplates() {
    const p = Math.floor(Math.random() * 6)
    let ia = Math.floor(Math.random() * 6)
    while (ia === p) ia = Math.floor(Math.random() * 6)
    setTemplateIdxJogador(p)
    setTemplateIdxIA(ia)
  }

  function iaEscolherAtributo() {
    if (!cartaJogador || !cartaIA || fase !== 'jogando') return
    setIaEscolhendo(true)
    setTimeout(() => {
      if (!cartaJogador || !cartaIA) { setIaEscolhendo(false); return }
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
    const res = vJ > vI ? 'ganhou' : vJ < vI ? 'perdeu' : 'empate'

    setAtributoEscolhido(attrKey)
    setResultado(res)
    setConfirmandoAtributo(null)
    setGirando(true)

    onEfeitosRevelacao(res, {
      onReveal: () => {
        setGirando(false)
        if (res === 'ganhou') setPlacar(p => ({ ...p, jogador: p.jogador + 1 }))
        if (res === 'perdeu') setPlacar(p => ({ ...p, ia: p.ia + 1 }))
        setHistoricoRodadas(h => [...h, {
          rodada,
          cartaJogador: { nome: cartaJogador.nome, atributos: cartaJogador.atributos },
          cartaIA: { nome: cartaIA.nome, atributos: cartaIA.atributos },
          atributo: attr.nomeKey, valorJogador: vJ, valorIA: vI, resultado: res,
          escolhidoPor
        }])
        setFase('resultado_rodada')
      }
    })
  }

  async function finalizarPartida() {
    const venceu = placar.jogador > placar.ia
    if (venceu) {
      registrarEvento('trumps_vitoria', 'Venceu uma partida no Top Trumps', 1)
      registrarEvento('jogo_jogado', 'Jogou Top Trumps', 1)
      if (user?.id) registrarPontuacaoRanking(user.id)
    }
    if (!user) { setFase('fim_jogo'); return }
    const resultadoStr = venceu ? 'vitoria' : placar.jogador === placar.ia ? 'empate' : 'derrota'
    const jogadas = historicoRodadas.length
    const vitorias = historicoRodadas.filter(h => h.resultado === 'ganhou').length
    const derrotas = historicoRodadas.filter(h => h.resultado === 'perdeu').length
    const empates = historicoRodadas.filter(h => h.resultado === 'empate').length

    let usadasHoje = 0
    if (user) usadasHoje = await consumir(user.id)

    if (venceu) {
      const podeGanhar = (tentativasMax - usadasHoje) > 0 && !jaGanhouHoje
      if (podeGanhar) {
        const idsTem = new Set(deckUsuario.map(c => String(c.id)))
        const pool = todasCartas.filter(c => !idsTem.has(String(c.id)))
        if (pool.length > 0) {
          setRecompensaOpcoes(embaralhar(pool).slice(0, 3))
          setFase('recompensa')
          window.__partidaPendente = { jogadas, vitorias, derrotas, empates, resultado: resultadoStr }
          return
        }
      }
    }
    setFase('fim_jogo')
    registrarPartida(user.id, { jogadas, vitorias, derrotas, empates, resultado: resultadoStr }).then(stats => {
      if (stats.total_vitorias === 1) desbloquear('primeira_vitoria_trumps')
      if (stats.total_derrotas === 1) desbloquear('primeira_derrota_trumps')
      if (stats.total_partidas === 10) desbloquear('veterano_trumps_10')
      if (stats.total_partidas === 100) desbloquear('centuriao_trumps')
      if (stats.total_partidas === 1000) desbloquear('lenda_trumps')
    })
  }

  function iniciarJogoComCartas() {
    const pool = embaralhar([...deckUsuario])
    const cartasJogador = pool.slice(0, 5)
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
    if (winnerName === deckJogador[0]?.nome || winnerName === 'VOC\u00CA') {
      setVezAtual('jogador')
    } else if (winnerName === null) {
      setVezAtual('jogador')
    } else {
      setVezAtual('ia')
    }
    setTimeout(() => {
      setRodada(1)
      setFase('jogando')
    }, 1500)
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
    resolverRodada(attrKey, 'jogador')
  }

  function proximaRodada() {
    setSwipeRevealed(false)
    if (rodada >= totalTurnos) { finalizarPartida(); return }
    const pJ = deckJogador[rodada % deckJogador.length]
    const pI = deckIA[rodada % deckIA.length]
    setCartaJogador(pJ)
    setCartaIA(pI)
    setAtributoEscolhido(null)
    setResultado(null)
    setRodada(r => r + 1)
    setFase('jogando')
    sortearTemplates()
    setVezAtual(v => v === 'jogador' ? 'ia' : 'jogador')
  }

  async function handleDesistir() {
    setPlacar(p => ({ ...p, ia: p.ia + 1 }))
    if (user) await consumir(user.id)
    const jogadas = historicoRodadas.length
    const vitorias = historicoRodadas.filter(h => h.resultado === 'ganhou').length
    const derrotas = historicoRodadas.filter(h => h.resultado === 'perdeu').length + 1
    const empates = historicoRodadas.filter(h => h.resultado === 'empate').length
    setFase('fim_jogo')
    if (!user) return
    registrarPartida(user.id, { jogadas, vitorias, derrotas, empates, resultado: 'derrota' }).then(stats => {
      if (stats.total_derrotas === 1) desbloquear('primeira_derrota_trumps')
      if (stats.total_partidas === 10) desbloquear('veterano_trumps_10')
      if (stats.total_partidas === 100) desbloquear('centuriao_trumps')
      if (stats.total_partidas === 1000) desbloquear('lenda_trumps')
    })
  }

  return {
    fase, cartaJogador, cartaIA, placar, rodada, totalTurnos, setTotalTurnos,
    vezAtual, iaEscolhendo, girando, confirmandoAtributo, atributoEscolhido,
    resultado, historicoRodadas, swipeRevealed, setSwipeRevealed,
    templateIdxJogador, templateIdxIA, recompensaOpcoes,
    cartaRecompensaSelecionada, setCartaRecompensaSelecionada,
    iniciarJogoComCartas, resolverPPT, onClickAtributo,
    cancelarJogada, confirmarJogada, proximaRodada, handleDesistir,
    setFase
  }
}
