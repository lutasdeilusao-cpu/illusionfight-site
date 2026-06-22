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
import { TipoAcao } from './TurnController'

export default function useCombatEngine({
  boardChars, obstaculos, itensChao, cols, rows, poderesEscolhidos, agiUmPraUm = true,

  onLog, onDano, onBalao,
  onAnimarMelee, onAnimarProjetil,
  onVitoria, onTurnoJogador, onTurnoIA,
  onLockInput, onUnlockInput,
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
  const [orderingPhase, setOrderingPhase] = useState(null)
  const [jokenpoNeeded, setJokenpoNeeded] = useState(null)
  const [currentCrossTie, setCurrentCrossTie] = useState(null)
  const [playerTeamOrder, setPlayerTeamOrder] = useState([])
  const [crossTieQueue, setCrossTieQueue] = useState([])

  const charsRef = useRef(characters)
  const animatingRef = useRef(false)
  const iaThinkingRef = useRef(false)
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

  const currentChar = characters.find(c => c.id === currentCharId)
  const isPlayerTurn = currentChar?.time === 'jogador'

  function addLog(text) { if (onLog) onLog(text) }

  function syncCharacters(updater) {
    const next = typeof updater === 'function' ? updater(charsRef.current) : updater
    charsRef.current = next
    setCharacters(next)
  }

  function getCharacters() { return charsRef.current }

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
      winnerRef.current = 'ia'; setWinner('ia')
      if (onVitoria) onVitoria('ia')
      addLog('🏆 IA venceu a partida!'); return true
    }
    if (iVivos.length === 0) {
      winnerRef.current = 'jogador'; setWinner('jogador')
      if (onVitoria) onVitoria('jogador')
      addLog('🏆 Jogador venceu a partida!'); return true
    }
    return false
  }

  function aplicarDano(alvoId, dano, atacante) {
    console.log('[INV-HP] fluxo-dano', { origem: atacante?.time || 'desconhecido', alvoId, dano, atacanteNome: atacante?.nome })
    charsRef.current = charsRef.current.map(c => c.id === alvoId ? { ...c, hp: Math.max(0, c.hp - dano) } : c)
    setCharacters(charsRef.current)
    console.log('[INV-HP] onDano disparado', { alvoId, dano, hpAntes: (charsRef.current.find(c => c.id === alvoId)?.hp ?? 0) + dano })
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
      addLog(`  🛡️ BLOQUEIO!`)
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
        if (resultado.ataqueExtra) setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
        else setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
      }, 500)
    } else {
      if (resultado.ataqueExtra) setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
      else setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
    }
  }

  // Bug 1 fix: única declaração de handleAtaqueExtra com os logs completos da bíblia
  function handleAtaqueExtra(atacante, alvo, faBase) {
    const faExtra = Math.round((faBase / 2) * 10) / 10
    addLog(`⚡ ATAQUE EXTRA! FA = ${faExtra}`)
    adicionarFloatTexto(atacante.id, 'EXTRA!', '#ffcc00', atacante.posicao?.row, atacante.posicao?.col)
    const d6Def = rolarD6()
    const isCriticoDefExtra = d6Def === 6
    const fd = calcularFD(alvo, isCriticoDefExtra, d6Def)
    addLog(`  🎲 ${alvo.nome} FD extra: ARM=${alvo.arm} AGI=${alvo.agi} d6=${d6Def}${isCriticoDefExtra ? ' [CRÍTICO DEFENSIVO]' : ''} → FD=${fd}`)
    if (isCriticoDefExtra) {
      addLog(`  🛡️ ${alvo.nome} defendeu criticamente o ataque extra!`)
      adicionarFloatTexto(alvo.id, 'BLOQUEIO!', '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
      finalizarAposAtaque(alvo, { dano: 0 })
    } else {
      const danoExtra = Math.max(1, Math.round(faExtra - fd))
      addLog(`  💥 Dano extra: ${danoExtra}`)
      aplicarDano(alvo.id, danoExtra, atacante)
      finalizarAposAtaque(alvo, { dano: danoExtra })
    }
  }

  // Bug 2 fix: finalizarAposAtaque volta para subPhase:'free' em vez de chamar onTurnoJogador
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
        tc.registrarAcao(currentCharIdRef.current, TipoAcao.ATACAR)
        setTurnoAcoes(prev => ({ ...prev, atacou: true }))
        setSubPhase('free')
        setHighlightedCells([])
        setAttackCells([])
        setRangeCells([])
        if (onUnlockInput) onUnlockInput(1500)
      }, 1200)
    } else {
      setAnimTimer(() => {
        tc.registrarAcao(currentCharIdRef.current, TipoAcao.ATACAR)
        setTurnoAcoes(prev => ({ ...prev, atacou: true }))
        setSubPhase('free')
        setHighlightedCells([])
        setAttackCells([])
        setRangeCells([])
        if (onUnlockInput) onUnlockInput(1500)
      }, 800)
    }
  }

  function iniciarMovimento() {
    const ch = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!ch || animatingRef.current || turnoAcoes.moveu) return
    if (!tc.podeAgir(currentCharIdRef.current, TipoAcao.MOVER)) return
    setActionPanel(false)
    const mov = getCasasMovimento(ch.agi, agiUmPraUm)
    const moveCells = getCelulasAlcance(ch.posicao.row, ch.posicao.col, mov, cols, rows, obstaculos)
    const freeCells = moveCells.filter(c => {
      const occupied = charsRef.current.some(c2 =>
        c2.vivo && c2.id !== currentCharIdRef.current && c2.posicao?.row === c.row && c2.posicao?.col === c.col
      )
      const hasObstacle = obstaculos[`${c.row}_${c.col}`]?.tipo === 1
      return !occupied && !hasObstacle
    })
    setHighlightedCells(freeCells)
    setSubPhase('movimento')
  }

  // Bug 3 fix: moverPersonagem calcula pathfinding internamente, não lê de estado React
  function moverPersonagem(row, col) {
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar) return
    const ocupadas = new Set(
      charsRef.current.filter(c => c.vivo && c.id !== currentChar.id).map(c => `${c.posicao.row}_${c.posicao.col}`)
    )
    const caminho = encontrarCaminho(currentChar.posicao.row, currentChar.posicao.col, row, col, cols, rows, obstaculos, ocupadas)
    if (!caminho || caminho.length === 0) return
    const steps = caminho.slice(1)
    animatingRef.current = true
    if (onLockInput) onLockInput()
    setHighlightedCells([])
    let stepIdx = 0
    function avancarPasso() {
      if (stepIdx >= steps.length) {
        animatingRef.current = false
        aposMovimento(row, col)
        return
      }
      const passo = steps[stepIdx]
      charsRef.current = charsRef.current.map(c => c.id === currentChar.id ? { ...c, posicao: { row: passo.row, col: passo.col } } : c)
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
    const key = `${row}_${col}`
    if (itensChaoAtual[key]) {
      const item = itensChaoAtual[key]
      const potKey = item.tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'
      charsRef.current = charsRef.current.map(c =>
        c.id === currentChar.id
          ? { ...c, inventario: { ...c.inventario, [potKey]: (c.inventario?.[potKey] || 0) + 1 } }
          : c
      )
      setCharacters(charsRef.current)
      setItensChaoAtual(prev => { const n = { ...prev }; delete n[key]; return n })
      addLog(`[${currentChar.nome}] Coletou Poção ${item.tipo === 'hp' ? 'HP' : 'MP'} do chão!`)
    }
    setTurnoAcoes(prev => ({ ...prev, moveu: true }))
    tc.registrarAcao(currentCharIdRef.current, TipoAcao.MOVER)
    setSubPhase('free')
    setHighlightedCells([])
    setActionPanel(false)
    if (onUnlockInput) onUnlockInput(0)
  }

  function confirmarMovimento() {
    if (!pendingMove) return
    moverPersonagem(pendingMove.row, pendingMove.col)
    setPendingMove(null)
  }

  function cancelarAcao() {
    setSubPhase('free'); setHighlightedCells([]); setAttackCells([]); setRangeCells([])
    setSubPhaseStep(null); setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([])
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
    setAttackCells(atkCells.filter(c => charsRef.current.some(ch => ch.vivo && ch.time !== currentChar.time && ch.posicao?.row === c.row && ch.posicao?.col === c.col)))
    setHighlightedCells([])
    setSubPhaseStep('escolher_alvo')
    setSubPhase('acao')
  }

  function executarAtaque(target) {
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar || animatingRef.current) return
    if (!tc.podeAgir(currentCharIdRef.current, TipoAcao.ATACAR)) return
    clearAnimTimers()
    animatingRef.current = true
    if (onLockInput) onLockInput()
    setAttackCells([])

    let atacanteFinal = currentChar
    if (powerAttackMode) {
      const poder = getPoderesPorId(poderesEscolhidos[currentChar.id] || currentChar.poderesEscolhidos || [])
        .find(p => p.gatilho === 'ataque')
      if (poder && currentChar.mp >= poder.custoMP) {
        charsRef.current = charsRef.current.map(c => c.id === currentChar.id ? { ...c, mp: c.mp - poder.custoMP } : c)
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

  function pularAcao() { finalizarTurno() }

  function finalizarTurno() {
    setHighlightedCells([]); setAttackCells([]); setRangeCells([]); setSubPhaseStep(null)
    setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([]); setActionPanel(false)
    animatingRef.current = false
    if (verificarVitoria()) return
    setSubPhase(null)
    avancarEAcionar()
  }

  function configurarTurnoPara(charId) {
    setCurrentCharId(charId)
    currentCharIdRef.current = charId
    setTurnVersion(v => v + 1)
    const proxChar = charsRef.current.find(c => c.id === charId)
    if (!proxChar) return
    if (proxChar.time === 'ia') {
      if (onTurnoIA) onTurnoIA(proxChar)
      if (onLockInput) onLockInput()
      setAnimTimer(() => executarIA(proxChar), 1000)
    } else {
      setTurnoAcoes({ moveu: false, atacou: false })
      setSubPhase('free')
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
      if (onLockInput) onLockInput()
      if (onTurnoJogador) onTurnoJogador(proxChar)
    }
  }

  function avancarEAcionar() {
    const nextId = tc.avancarTurno()
    if (nextId) configurarTurnoPara(nextId)
  }

  function iniciarPartida() {
    const alive = charsRef.current.filter(c => c.vivo)
    const { ordemParcial, empatesInternosJogador, empatesCruzados } = calcularGruposEOrdem(alive)
    sortedGlobalRef.current = ordemParcial
    const timeJogador = ordemParcial.filter(c => c.time === 'jogador')
    setPlayerTeamOrder(timeJogador)

    if (empatesInternosJogador.length > 0) {
      setOrderingPhase('player_internal')
      setCrossTieQueue(empatesCruzados)
    } else if (empatesCruzados.length > 0) {
      setOrderingPhase('jokenpo_cross')
      setCrossTieQueue(empatesCruzados)
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
      setOrderingPhase('jokenpo_cross')
      iniciarProximoJokenpoCruzado(queue, novaOrdem)
    } else {
      setOrderingPhase(null)
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
    setCurrentCrossTie({ playerChar: encontrado.playerChar, iaChar: encontrado.iaChar, grupoAgi: encontrado.grupo.agi, remainingQueue: encontrado.remainingQueue })
    setJokenpoNeeded([encontrado.playerChar, encontrado.iaChar])
  }

  function handleJokenpoResult(winnerName) {
    if (!currentCrossTie) return
    const { playerChar, iaChar, remainingQueue } = currentCrossTie
    const { winner, loser } = processarResultadoJokenpo(playerChar, iaChar, winnerName)
    crossTieResultsRef.current.push({ winner, loser })
    setJokenpoNeeded(null)
    setCurrentCrossTie(null)
    iniciarProximoJokenpoCruzado(remainingQueue, sortedGlobalRef.current)
  }

  function aplicarOrdemCruzada(ordemBase) {
    const novaOrdem = aplicarResultadosCruzados(ordemBase, crossTieResultsRef.current)
    sortedGlobalRef.current = novaOrdem
    setOrderingPhase(null)
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
    setIaThinking(true); iaThinkingRef.current = true
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
              setAttackCells([]); dec.logs.forEach(l => addLog(`  ${l}`))
              setAnimTimer(estagioAgir, 300); return
            }
            charsRef.current = charsRef.current.map(c => c.id === iaChar.id ? { ...c, posicao: { row: steps[stepIdx].row, col: steps[stepIdx].col } } : c)
            setCharacters(charsRef.current)
            stepIdx++; setAnimTimer(avancarPassoIA, 150)
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
        const alvo = dec2.detalhes.alvo; const res = dec2.detalhes.resultado; const isMiss = dec2.detalhes.miss === true
        const atacante = iaAtual2
        setRangeCells(getCelulasAtaque(atacante.posicao.row, atacante.posicao.col, atacante.tipoAtaque, cols, rows, atacante.tipoAtaque === 'melee' ? 1 : atacante.pdf, obstaculos))
        setAttackCells([])
        const callbackFinal = () => {
          if (winnerRef.current) { finalizarTurnoIA(); return }
          if (isMiss) { adicionarBalao(alvo.id, 'MISS!', 'miss', alvo.posicao?.row, alvo.posicao?.col); setAnimTimer(() => finalizarTurnoIA(), 1300); return }
          if (res.criticoDefensivo) {
            adicionarBalao(atacante.id, 'CRÍTICO DEF!', 'block', atacante.posicao?.row, atacante.posicao?.col)
          } else {
            const danoFinal = Math.max(1, (res.dano || 1) - defesaBonusRef.current); defesaBonusRef.current = 0
            aplicarDano(alvo.id, danoFinal, atacante)
          }
          const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
          if (hpAtual <= 0) {
            charsRef.current = charsRef.current.map(c => c.id === alvo.id ? { ...c, vivo: false } : c)
            setCharacters(charsRef.current); tc.marcarMorto(alvo.id)
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
              setRangeCells([]); setAttackCells([])
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
                setCharacters(charsRef.current); addLog(`🛡️ ${alvo.nome} usou Defesa+2! (-3 MP)`)
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
      iaThinkingRef.current = false; setIaThinking(false)
      if (onUnlockInput) onUnlockInput(0)
      if (verificarVitoria()) return
      avancarEAcionar()
    }
  }

  return {
    characters, turnoAcoes, currentCharId, isPlayerTurn, syncCharacters, getCharacters,
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
    orderingPhase, jokenpoNeeded, currentCrossTie, playerTeamOrder, crossTieQueue,
  }
}
