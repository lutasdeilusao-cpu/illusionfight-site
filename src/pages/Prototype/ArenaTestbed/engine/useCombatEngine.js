import { useState, useRef, useCallback, useEffect } from 'react'
import * as tc from './TurnController'
import {
  calcularGruposEOrdem, aplicarOrdemInterna,
  encontrarProximoJokenpo, processarResultadoJokenpo,
  aplicarResultadosCruzados,
} from './turnOrder'
import {
  resolverAtaque, resolverContraAtaque, rolarD6, calcularFA, calcularFD,
  getCasasMovimento, getChanceAcerto,
} from './combat'
import { getCelulasAlcance, getCelulasAtaque, distanciaHex, encontrarCaminho, getHexLine } from './hexUtils'
import { decidirAcaoIA } from './ai'
import { getPersonalidadePorId } from './ai/personalidades/index'
import { PODERES_BASE, getPoderesPorId, temPoderDisponivel } from '../data/poderes'
import { executarMecanica } from './mecanicasPoder'

export default function useCombatEngine({
  boardChars, obstaculos, itensChao, cols, rows, poderesEscolhidos, agiUmPraUm = true,

  onLog, onDano, onBalao,
  onAnimarMelee, onAnimarProjetil,
  onVitoria, onTurnoJogador, onTurnoIA,
  onAtualizarChars,
}) {
  const [characters, setCharacters] = useState(() =>
    boardChars.map(bc => ({
      ...bc.charData,
      posicao: { row: bc.row, col: bc.col },
      vivo: true,
      poderesEscolhidos: poderesEscolhidos[bc.charData?.id] || [],
    }))
  )
  const [turnoAcoes, setTurnoAcoes] = useState({ moveu: false, atacou: false })
  const [currentCharId, setCurrentCharId] = useState(null)
  const [phase, setPhase] = useState('prepare')
  const [subPhase, setSubPhase] = useState(null)
  const [subPhaseStep, setSubPhaseStep] = useState(null)
  const [highlightedCells, setHighlightedCells] = useState([])
  const [attackCells, setAttackCells] = useState([])
  const [rangeCells, setRangeCells] = useState([])
  const [caminhoEscolhido, setCaminhoEscolhido] = useState([])
  const [destinoEscolhido, setDestinoEscolhido] = useState(null)
  const [pendingMove, setPendingMove] = useState(null)
  const [actionPanel, setActionPanel] = useState(false)
  const [powerAttackMode, setPowerAttackMode] = useState(false)
  const [powerChoiceModal, setPowerChoiceModal] = useState(null)
  const [defensePending, setDefensePending] = useState(null)
  const [winner, setWinner] = useState(null)
  const [iaThinking, setIaThinking] = useState(false)
  const [itensChaoAtual, setItensChaoAtual] = useState(itensChao || {})
  const [turnVersion, setTurnVersion] = useState(0)

  const charsRef = useRef(characters)
  const animatingRef = useRef(false)
  const iaThinkingRef = useRef(false)
  const inputLockedRef = useRef(false)
  const winnerRef = useRef(null)
  const animTimersRef = useRef([])
  const sortedGlobalRef = useRef([])
  const crossTieResultsRef = useRef([])
  const crossTieQueueRef = useRef([])
  const defesaBonusRef = useRef(0)
  const tutorialMostradoRef = useRef(false)
  const currentCharIdRef = useRef(null)

  useEffect(() => { charsRef.current = characters }, [characters])
  useEffect(() => { currentCharIdRef.current = currentCharId }, [currentCharId])

  const isPlayerTurn = characters.find(c => c.id === currentCharId)?.time === 'jogador'

  function addLog(text) { if (onLog) onLog(text) }

  function clearAnimTimers() {
    animTimersRef.current.forEach(t => clearTimeout(t))
    animTimersRef.current = []
  }

  function setAnimTimer(fn, delay) {
    const id = setTimeout(fn, delay)
    animTimersRef.current.push(id)
    return id
  }

  function getDisplayName(ch) {
    if (ch?.aparencia?.nome) return ch.aparencia.nome
    if (ch?.nome) return ch.nome
    const chars = charsRef.current
    const jogadores = chars.filter(c => c.time === 'jogador')
    const idx = jogadores.findIndex(j => j.id === ch?.id)
    if (ch?.time === 'jogador') return `Jogador ${idx + 1}`
    const ias = chars.filter(c => c.time === 'ia')
    const iaIdx = ias.findIndex(i => i.id === ch?.id)
    return `IA ${iaIdx + 1}`
  }

  function verificarVitoria() {
    const c = charsRef.current
    const pVivos = c.filter(ch => ch.vivo && ch.time === 'jogador')
    const iVivos = c.filter(ch => ch.vivo && ch.time === 'ia')
    if (pVivos.length === 0) {
      winnerRef.current = 'ia'
      setWinner('ia')
      if (onVitoria) onVitoria('ia')
      addLog('🏆 IA venceu a partida!')
      return true
    }
    if (iVivos.length === 0) {
      winnerRef.current = 'jogador'
      setWinner('jogador')
      if (onVitoria) onVitoria('jogador')
      addLog('🏆 Jogador venceu a partida!')
      return true
    }
    return false
  }

  function aplicarDano(alvoId, dano, atacante) {
    charsRef.current = charsRef.current.map(c =>
      c.id === alvoId ? { ...c, hp: Math.max(0, c.hp - dano) } : c
    )
    setCharacters(charsRef.current)
    if (onDano) onDano(alvoId, dano)
  }

  function adicionarBalao(alvoId, texto, tipo, row, col) {
    if (onBalao) onBalao({ alvoId, texto, tipo, row, col })
  }

  function adicionarFloatTexto(charId, texto, cor, row, col) {
    let tipo = 'block'
    if (cor === '#ffcc00') tipo = 'extra'
    else if (cor === '#ff8800') tipo = 'contra'
    else if (cor === '#4488ff') tipo = 'block'
    adicionarBalao(charId, texto, tipo, row, col)
  }

  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
    if (onAnimarMelee) onAnimarMelee(atacante, alvo, resultado, onFinalizar)
    else if (onFinalizar) onFinalizar()
  }

  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
    if (onAnimarProjetil) onAnimarProjetil(atacante, alvo, resultado, onFinalizar)
    else if (onFinalizar) onFinalizar()
  }

  function aposAnimacaoAtaque(atacante, alvo, resultado) {
    clearAnimTimers()
    if (resultado.criticoDefensivo) {
      addLog(`  🛡️ ${'Bloqueio!'}`)
      adicionarBalao(alvo.id, 'CRÍTICO DEF!', 'block', alvo.posicao?.row, alvo.posicao?.col)
    } else {
      aplicarDano(alvo.id, Math.max(1, resultado.dano || 1), atacante)
    }
    if (resultado.criticoDefensivo) {
      adicionarFloatTexto(alvo.id, 'BLOQUEIO!', '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
      setAnimTimer(() => {
        const contra = resolverContraAtaque(alvo, atacante, resultado.fa / 2)
        contra.logs.forEach(l => addLog(`  ↺ ${l}`))
        if (contra.dano > 0) {
          aplicarDano(atacante.id, contra.dano, alvo)
          adicionarFloatTexto(atacante.id, 'CONTRA!', '#ff8800', atacante.posicao?.row, atacante.posicao?.col)
        }
        if (resultado.ataqueExtra) {
          setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
        } else setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
      }, 500)
    } else {
      if (resultado.ataqueExtra) setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
      else setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
    }
  }

  function handleAtaqueExtra(atacante, alvo, faBase) {
    const faExtra = Math.round((faBase / 2) * 10) / 10
    adicionarFloatTexto(atacante.id, 'EXTRA!', '#ffcc00', atacante.posicao?.row, atacante.posicao?.col)
    const d6Def = rolarD6()
    const isCriticoDefExtra = d6Def === 6
    const fd = calcularFD(alvo, isCriticoDefExtra, d6Def)
    if (isCriticoDefExtra) {
      adicionarFloatTexto(alvo.id, 'BLOQUEIO!', '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
      finalizarAposAtaque(alvo, { dano: 0 })
    } else {
      const danoExtra = Math.max(1, Math.round(faExtra - fd))
      aplicarDano(alvo.id, danoExtra, atacante)
      finalizarAposAtaque(alvo, { dano: danoExtra })
    }
  }

  function finalizarAposAtaque(alvo, resultado) {
    animatingRef.current = false
    if (winnerRef.current) return
    const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
    if (hpAtual <= 0) {
      charsRef.current = charsRef.current.map(c => c.id === alvo.id ? { ...c, vivo: false } : c)
      setCharacters(charsRef.current)
      tc.marcarMorto(alvo.id)
      addLog(`💀 ${alvo.nome} foi derrotado!`)
      setAnimTimer(() => {
        if (verificarVitoria()) return
        setTurnoAcoes({ moveu: false, atacou: false })
        if (onTurnoJogador) onTurnoJogador()
      }, 1200)
    } else {
      setAnimTimer(() => {
        setTurnoAcoes({ moveu: false, atacou: false })
        if (onTurnoJogador) onTurnoJogador()
      }, 800)
    }
  }

  function handleAtaqueExtra(atacante, alvo, faBase) {
    const faExtra = Math.round((faBase / 2) * 10) / 10
    adicionarFloatTexto(atacante.id, 'EXTRA!', '#ffcc00', atacante.posicao?.row, atacante.posicao?.col)
    const d6Def = rolarD6()
    const isCriticoDefExtra = d6Def === 6
    const fd = calcularFD(alvo, isCriticoDefExtra, d6Def)
    if (isCriticoDefExtra) {
      adicionarFloatTexto(alvo.id, 'BLOQUEIO!', '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
      finalizarAposAtaque(alvo, { dano: 0 })
    } else {
      const danoExtra = Math.max(1, Math.round(faExtra - fd))
      aplicarDano(alvo.id, danoExtra, atacante)
      finalizarAposAtaque(alvo, { dano: danoExtra })
    }
  }

  function handleCanvasClick(e) { return }

  function iniciarMovimento() {
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar || animatingRef.current || turnoAcoes.moveu) return
    setActionPanel(false)
    const mov = getCasasMovimento(currentChar.agi, agiUmPraUm)
    const moveCells = getCelulasAlcance(currentChar.posicao.row, currentChar.posicao.col, mov, cols, rows, obstaculos)
    setHighlightedCells(moveCells)
    setSubPhase('movimento')
  }

  function moverPersonagem(row, col) {
    const caminho = caminhoEscolhido
    if (!caminho || caminho.length === 0) return
    const steps = caminho.slice(1)
    animatingRef.current = true
    setHighlightedCells([])
    let stepIdx = 0
    function avancarPasso() {
      if (stepIdx >= steps.length) {
        animatingRef.current = false
        aposMovimento(row, col)
        return
      }
      const passo = steps[stepIdx]
      charsRef.current = charsRef.current.map(c =>
        c.id === currentCharIdRef.current ? { ...c, posicao: { row: passo.row, col: passo.col } } : c
      )
      setCharacters(charsRef.current)
      stepIdx++
      setAnimTimer(avancarPasso, 150)
    }
    setAnimTimer(avancarPasso, 50)
  }

  function aposMovimento(row, col) {
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Moveu para (${row}, ${col})`)
    setTurnoAcoes(prev => ({ ...prev, moveu: true }))
    setSubPhase('free')
    setHighlightedCells([])
    setActionPanel(false)
  }

  function confirmarMovimento() {
    if (!pendingMove) return
    moverPersonagem(pendingMove.row, pendingMove.col)
    setPendingMove(null)
  }

  function cancelarAcao() {
    setSubPhase('free')
    setHighlightedCells([])
    setAttackCells([])
    setRangeCells([])
    setSubPhaseStep(null)
    setPendingMove(null)
    setDestinoEscolhido(null)
    setCaminhoEscolhido([])
  }

  function escolherTipoAtaque() {
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar || animatingRef.current) return
    const poderesDisponiveis = getPoderesPorId(poderesEscolhidos[currentChar.id] || currentChar.poderesEscolhidos || [])
      .filter(p => p.gatilho === 'ataque' && currentChar.mp >= p.custoMP)
    if (poderesDisponiveis.length === 0) {
      setActionPanel(false)
      confirmarEscolhaAtaque({ poderId: null, custoMP: 0, disponivel: true })
      return
    }
    setPowerChoiceModal({ mode: 'ataque', charName: currentChar.nome, opcoes: poderesDisponiveis })
  }

  function confirmarEscolhaAtaque(opcao) {
    setPowerChoiceModal(null)
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar || animatingRef.current) return
    setPowerAttackMode(!!opcao.poderId)
    const alcanceMax = currentChar.tipoAtaque === 'melee' ? 1 : currentChar.pdf
    const atkCells = getCelulasAtaque(currentChar.posicao.row, currentChar.posicao.col, currentChar.tipoAtaque, cols, rows, alcanceMax, obstaculos)
    setRangeCells(atkCells)
    const enemyCells = atkCells.filter(c =>
      charsRef.current.some(ch => ch.vivo && ch.time !== currentChar.time && ch.posicao?.row === c.row && ch.posicao?.col === c.col)
    )
    setAttackCells(enemyCells)
    setHighlightedCells([])
    setSubPhaseStep('escolher_alvo')
    setSubPhase('acao')
  }

  function executarAtaque(target) {
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar || animatingRef.current) return
    clearAnimTimers()
    animatingRef.current = true
    setAttackCells([])

    let atacanteFinal = currentChar
    if (powerAttackMode) {
      const poder = getPoderesPorId(poderesEscolhidos[currentChar.id] || currentChar.poderesEscolhidos || [])
        .find(p => p.gatilho === 'ataque')
      if (poder && currentChar.mp >= poder.custoMP) {
        charsRef.current = charsRef.current.map(c =>
          c.id === currentChar.id ? { ...c, mp: c.mp - poder.custoMP } : c
        )
        setCharacters(charsRef.current)
        atacanteFinal = executarMecanica(poder.mecanicaId, poder.params, { atacante: currentChar })
      }
      setPowerAttackMode(false)
    }

    const d6Val = rolarD6()
    const dist = distanciaHex(currentChar.posicao, target.posicao)
    const resultado = resolverAtaque(atacanteFinal, target, Math.ceil(dist))
    addLog(`⚔️ ${currentChar.nome} ataca ${target.nome}!`)
    resultado.logs.forEach(l => addLog(`  ${l}`))
    if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado)
    else animarAtaqueProjetil(currentChar, target, resultado)
  }

  function usarItem(tipo) {
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar || animatingRef.current) return
    const key = tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'
    const qty = currentChar.inventario?.[key] || 0
    if (qty <= 0) return
    charsRef.current = charsRef.current.map(c => {
      if (c.id !== currentChar.id) return c
      const newQty = (c.inventario?.[key] || 0) - 1
      const max = tipo === 'hp' ? c.hpMax : c.mpMax
      const newVal = Math.min(max, (tipo === 'hp' ? c.hp : c.mp) + 5)
      return { ...c, [tipo === 'hp' ? 'hp' : 'mp']: newVal, inventario: { ...c.inventario, [key]: newQty } }
    })
    setCharacters(charsRef.current)
    addLog(`💊 ${currentChar.nome} usou Poção ${tipo === 'hp' ? 'HP' : 'MP'}! (+5)`)
    finalizarTurno()
  }

  function pularAcao() {
    finalizarTurno()
  }

  function finalizarTurno() {
    setHighlightedCells([])
    setAttackCells([])
    setRangeCells([])
    setSubPhaseStep(null)
    setPendingMove(null)
    setDestinoEscolhido(null)
    setCaminhoEscolhido([])
    setActionPanel(false)
    animatingRef.current = false
    if (verificarVitoria()) return
    setSubPhase(null)
    avancarEAcionar()
  }

  function configurarTurnoPara(charId) {
    setCurrentTurn(charId)
    const proxChar = charsRef.current.find(c => c.id === charId)
    if (!proxChar) return
    if (proxChar.time === 'ia') {
      if (onTurnoIA) onTurnoIA(proxChar)
      setAnimTimer(() => executarIA(proxChar), 1000)
    } else {
      setTurnoAcoes({ moveu: false, atacou: false })
      setSubPhase('free')
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
      if (onTurnoJogador) onTurnoJogador(proxChar)
    }
  }

  function setCurrentTurn(charId) {
    setCurrentCharId(charId)
    currentCharIdRef.current = charId
    setTurnVersion(v => v + 1)
  }

  function avancarEAcionar() {
    const nextId = tc.avancarTurno()
    if (nextId) configurarTurnoPara(nextId)
  }

  function iniciarPartida() {
    const alive = charsRef.current.filter(c => c.vivo)
    const { ordemParcial, empatesInternosJogador, empatesCruzados } = calcularGruposEOrdem(alive)
    sortedGlobalRef.current = ordemParcial

    if (empatesInternosJogador.length > 0) {
      crossTieQueueRef.current = empatesCruzados
      onTurnoJogador?.()
    } else if (empatesCruzados.length > 0) {
      crossTieQueueRef.current = empatesCruzados
      sortedGlobalRef.current = ordemParcial
      iniciarProximoJokenpoCruzado(empatesCruzados, ordemParcial)
    } else {
      const order = ordemParcial.map(c => c.id)
      tc.inicializar(order)
      configurarTurnoPara(tc.quemEstaNaVez())
    }
  }

  function confirmarOrdemInterna(playerTeamOrder) {
    const base = sortedGlobalRef.current
    const novaOrdem = aplicarOrdemInterna(base, playerTeamOrder)
    sortedGlobalRef.current = novaOrdem
    const queue = crossTieQueueRef.current
    if (queue && queue.length > 0) {
      iniciarProximoJokenpoCruzado(queue, novaOrdem)
    } else {
      const order = novaOrdem.map(c => c.id)
      tc.inicializar(order)
      configurarTurnoPara(tc.quemEstaNaVez())
    }
  }

  function iniciarProximoJokenpoCruzado(queue, ordemAtual) {
    const encontrado = encontrarProximoJokenpo(queue, crossTieResultsRef.current)
    if (!encontrado) {
      aplicarOrdemCruzada(ordemAtual)
      return
    }
    if (encontrado.salto) {
      crossTieQueueRef.current = queue.slice(1)
      iniciarProximoJokenpoCruzado(encontrado.remainingQueue, ordemAtual)
      return
    }
    if (onTurnoJogador) onTurnoJogador({ tipo: 'jokenpo', playerChar: encontrado.playerChar, iaChar: encontrado.iaChar })
  }

  function handleJokenpoResult(winnerName, playerChar, iaChar) {
    const { winner, loser } = processarResultadoJokenpo(playerChar, iaChar, winnerName)
    crossTieResultsRef.current.push({ winner, loser })
    iniciarProximoJokenpoCruzado(
      [{ jogadores: [playerChar], ias: [iaChar] }],
      sortedGlobalRef.current
    )
  }

  function aplicarOrdemCruzada(ordemBase) {
    const novaOrdem = aplicarResultadosCruzados(ordemBase, crossTieResultsRef.current)
    sortedGlobalRef.current = novaOrdem
    const order = novaOrdem.map(c => c.id)
    tc.inicializar(order)
    configurarTurnoPara(tc.quemEstaNaVez())
  }

  function decidirAcaoComPersonalidade(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual, fase = 'acao') {
    const personalidade = getPersonalidadePorId(iaAtual.personalidadeId)
    if (personalidade) return personalidade.fn(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual, fase)
    return decidirAcaoIA(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual)
  }

  function executarIA(iaChar) {
    setIaThinking(true)
    iaThinkingRef.current = true
    addLog(`🤖 Turno da IA: ${iaChar.nome}`)
    setAnimTimer(estagioPensar, 1500)

    function estagioPensar() {
      const charsAgora = charsRef.current
      const iaAtual = charsAgora.find(c => c.id === iaChar.id)
      if (!iaAtual || !iaAtual.vivo) { iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
      addLog(`  ${iaChar.nome} — Fase: Movimento`)
      const inimigos = charsAgora.filter(c => c.vivo && c.time === 'jogador')
      setHighlightedCells(getCelulasAlcance(iaAtual.posicao.row, iaAtual.posicao.col, getCasasMovimento(iaAtual.agi, agiUmPraUm), cols, rows, obstaculos))
      const dec = decidirAcaoComPersonalidade(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual, 'movimento')
      setAnimTimer(estagioMover, 1800)

      function estagioMover() {
        setHighlightedCells([])
        if (dec.tipo === 'andar') {
          const destino = { row: dec.detalhes.row, col: dec.detalhes.col }
          setAttackCells([destino])
          const origem = iaAtual.posicao
          const ocupadasIA = new Set(charsAgora.filter(c => c.vivo && c.id !== iaChar.id).map(c => `${c.posicao.row}_${c.posicao.col}`))
          const caminho = encontrarCaminho(origem.row, origem.col, destino.row, destino.col, cols, rows, obstaculos, ocupadasIA)
          const steps = caminho ? caminho.slice(1) : [destino]
          let stepIdx = 0
          function avancarPassoIA() {
            if (stepIdx >= steps.length) {
              setAttackCells([])
              dec.logs.forEach(l => addLog(`  ${l}`))
              setAnimTimer(estagioAgir, 300)
              return
            }
            charsRef.current = charsRef.current.map(c => c.id === iaChar.id ? { ...c, posicao: { row: steps[stepIdx].row, col: steps[stepIdx].col } } : c)
            setCharacters(charsRef.current)
            stepIdx++
            setAnimTimer(avancarPassoIA, 150)
          }
          setAnimTimer(avancarPassoIA, 400)
        } else {
          addLog(`  ${iaChar.nome} não se moveu.`)
          setAnimTimer(estagioAgir, 1000)
        }
      }
    }

    function estagioAgir() {
      const charsAgora2 = charsRef.current
      const iaAtual2 = charsAgora2.find(c => c.id === iaChar.id)
      if (!iaAtual2 || !iaAtual2.vivo) { iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
      addLog(`  ${iaChar.nome} — Fase: Ação`)
      const inimigos2 = charsAgora2.filter(c => c.vivo && c.time === 'jogador')
      const dec2 = decidirAcaoComPersonalidade(iaAtual2, inimigos2, charsAgora2, obstaculos, cols, rows, itensChaoAtual)
      if (dec2.tipo === 'atacar') {
        const alvo = dec2.detalhes.alvo
        const res = dec2.detalhes.resultado
        const isMiss = dec2.detalhes.miss === true
        const atacante = iaAtual2
        setRangeCells(getCelulasAtaque(atacante.posicao.row, atacante.posicao.col, atacante.tipoAtaque, cols, rows, atacante.tipoAtaque === 'melee' ? 1 : atacante.pdf, obstaculos))
        setAttackCells([])
        const callbackFinal = () => {
          if (winnerRef.current) { finalizarTurnoIA(); return }
          if (isMiss) {
            adicionarBalao(alvo.id, 'MISS!', 'miss', alvo.posicao?.row, alvo.posicao?.col)
            setAnimTimer(() => finalizarTurnoIA(), 1300)
            return
          }
          if (res.criticoDefensivo) {
            adicionarBalao(atacante.id, 'CRÍTICO DEF!', 'block', atacante.posicao?.row, atacante.posicao?.col)
          } else {
            const danoFinal = Math.max(1, (res.dano || 1) - defesaBonusRef.current)
            defesaBonusRef.current = 0
            aplicarDano(alvo.id, danoFinal, atacante)
          }
          const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
          if (hpAtual <= 0) {
            charsRef.current = charsRef.current.map(c => c.id === alvo.id ? { ...c, vivo: false } : c)
            setCharacters(charsRef.current)
            tc.marcarMorto(alvo.id)
            addLog(`💀 ${alvo.nome} foi derrotado!`)
            setAnimTimer(() => { if (verificarVitoria()) return; finalizarTurnoIA() }, 1200)
          } else setAnimTimer(() => finalizarTurnoIA(), 800)
        }
        const podeDefesa = alvo.time === 'jogador' && charsRef.current.find(c => c.id === alvo.id)?.mp >= 3 && temPoderDisponivel(alvo, poderesEscolhidos, 'defesa', 3)
        function iniciarAnimacaoAtaqueIA() {
          setAnimTimer(() => {
            setRangeCells([])
            setAttackCells([{ row: alvo.posicao.row, col: alvo.posicao.col }])
            setAnimTimer(() => {
              setRangeCells([])
              setAttackCells([])
              addLog(`  ${atacante.nome} ataca ${alvo.nome}!`)
              dec2.logs.forEach(l => addLog(`  ${l}`))
              if (atacante.tipoAtaque === 'melee') animarAtaqueMelee(atacante, alvo, res, callbackFinal)
              else animarAtaqueProjetil(atacante, alvo, res, callbackFinal)
            }, 700)
          }, 1200)
        }
        if (podeDefesa) {
          setDefensePending({ alvo, atacante, faBruto: res.fa,
            onResolve: (bonus) => {
              defesaBonusRef.current = bonus
              if (bonus > 0) {
                charsRef.current = charsRef.current.map(c => c.id === alvo.id ? { ...c, mp: c.mp - 3 } : c)
                setCharacters(charsRef.current)
                addLog(`🛡️ ${alvo.nome} usou Defesa+2! (-3 MP)`)
              }
              iniciarAnimacaoAtaqueIA()
            },
          })
        } else { defesaBonusRef.current = 0; iniciarAnimacaoAtaqueIA() }
      } else {
        dec2.logs.forEach(l => addLog(`  ${l}`))
        setAnimTimer(finalizarTurnoIA, 500)
      }
    }

    function finalizarTurnoIA() {
      addLog(`  ✅ ${iaChar.nome} finalizou o turno.`)
      iaThinkingRef.current = false
      setIaThinking(false)
      if (verificarVitoria()) return
      avancarEAcionar()
    }
  }

  return {
    characters, turnoAceos: turnoAcoes, currentCharId, isPlayerTurn,
    iniciarPartida, iniciarMovimento, moverPersonagem, confirmarMovimento,
    cancelarAcao, escolherTipoAtaque, confirmarEscolhaAtaque, executarAtaque,
    usarItem, pularAcao, finalizarTurno, executarIA,
    setAnimTimer, clearAnimTimers, setTurnoAcoes,
    setHighlightedCells, setAttackCells, setRangeCells,
    setActionPanel, setPowerAttackMode, setPowerChoiceModal, setSubPhase,
    setSubPhaseStep, setPendingMove, setDestinoEscolhido, setCaminhoEscolhido,
    setIaThinking, setPhase, addLog, turnVersion,
    highlightedCells, attackCells, rangeCells, subPhase, subPhaseStep,
    pendingMove, destinoEscolhido, caminhoEscolhido, actionPanel,
    powerChoiceModal, defensePending, winner, iaThinking, itensChaoAtual,
    confirmarOrdemInterna, handleJokenpoResult, iniciarPartida,
  }
}
