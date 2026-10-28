import { useState, useRef, useCallback, useEffect } from 'react'
import * as tc from './TurnController'
import {
  calcularGruposEOrdem, aplicarOrdemInterna,
  encontrarProximoJokenpo, processarResultadoJokenpo,
  aplicarResultadosCruzados,
} from './turnOrder'
import { getCasasMovimento } from './combat'
import { getCelulasAlcance, getCelulasAtaque, distanciaHex, encontrarCaminho, getHexLine } from './hexUtils'
import { decidirAcaoIA } from './ai'
import { getPersonalidadePorId } from './ai/personalidades/index'
import { resolverGolpe, poderesDisponiveis, melhorPoder } from './regras'
import { TipoAcao } from './TurnController'
import { emit } from './eventBus'
import { getMovementAnimation } from './animations/movement/index'
import { getAttackAnimation, getRangeAnimation } from './animations/attack/index'
import { getDefenseAnimation, DefenseAnimId } from './animations/defense/index'

export default function useCombatEngine({
  boardChars, obstaculos, itensChao, cols, rows, poderesEscolhidos, agiUmPraUm = true,

  onLog, onDano, onBalao,
  onAnimarMelee, onAnimarProjetil,
  onVitoria, onTurnoJogador, onTurnoIA,
  onLockInput, onUnlockInput,
  onAtualizarChars,
  onTrail, onClearTrail, onClearHighlight, onBannerIA, onAnimating, onProjetilPos, onProjetilPath,
  onSetCharScales, onSetCharVisualPos, onSetCharRotation,
  onGetHexCenter, onGetSz,
  onEmitParticles, onSetKiBall, onSetProjectile,
  onSetCharFlash, onSetShield,
  onJuiceHit, onGetHitStopRef,
}) {
  const [characters, setCharacters] = useState(() =>
    boardChars.map(bc => ({
      ...bc.charData,
      posicao: { row: bc.row, col: bc.col },
      vivo: true,
      poderesEscolhidos: poderesEscolhidos[bc.charData?.id] || [],
      animacoes: {
        movimento:    bc.charData?.animacoes?.movimento    ?? 1,
        ataqueMelee:  bc.charData?.animacoes?.ataqueMelee  ?? 1,
        ataqueRange:  bc.charData?.animacoes?.ataqueRange  ?? 1,
        defesa:       bc.charData?.animacoes?.defesa       ?? 1,
        habilidade:   bc.charData?.animacoes?.habilidade   ?? 1,
        efeito:       bc.charData?.animacoes?.efeito       ?? 1,
      },
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
  const poderAtaqueIdRef = useRef(null)
  const tutorialMostradoRef = useRef(false)
  const currentCharIdRef = useRef(null)

  useEffect(() => { charsRef.current = characters }, [characters])
  useEffect(() => { currentCharIdRef.current = currentCharId }, [currentCharId])

  const hitStopRef = onGetHitStopRef ? onGetHitStopRef() : { current: null }

  function isHitStopActiveLocal() {
    const h = hitStopRef.current
    if (!h?.active) return false
    if (Date.now() - h.startTime >= h.duration) {
      hitStopRef.current = null
      return false
    }
    return true
  }

  function dispararJuice(alvo, opcoes = {}) {
    if (!onJuiceHit || !onGetHexCenter) return
    const pos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
    onJuiceHit({ ...opcoes, alvoPos: pos })
  }

  function animarDefesa(alvo, atacante, tipo, onFinalizar) {
    const animId = alvo.animacoes?.defesa ?? 1

    const resolvedId = tipo === 'hit' ? DefenseAnimId.HIT
      : tipo === 'block' ? DefenseAnimId.BLOCK
      : animId

    const animFn = getDefenseAnimation(resolvedId)
    animFn({
      charId: alvo.id,
      alvo,
      atacante,
      tipo,
      onGetHexCenter: onGetHexCenter || (() => ({ x: 0, y: 0 })),
      setAnimTimer,
      setCharVisualPos: onSetCharVisualPos || (() => {}),
      setCharFlash: onSetCharFlash || (() => {}),
      onEmitParticles: onEmitParticles || (() => {}),
      setShield: onSetShield || (() => {}),
      sz: onGetSz ? onGetSz() : 36,
      onFinalize: onFinalizar,
    })
  }

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
    let extra = 0
    if (isHitStopActiveLocal()) {
      const h = hitStopRef.current
      extra = Math.max(0, h.duration - (Date.now() - h.startTime))
    }
    const id = setTimeout(fn, delay + extra)
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

  function aplicarDano(alvoId, dano, atacante, opcoes = {}) {
    charsRef.current = charsRef.current.map(c => c.id === alvoId ? { ...c, hp: Math.max(0, c.hp - dano) } : c)
    setCharacters(charsRef.current)
    if (onDano) onDano(alvoId, dano)
    const alvo = charsRef.current.find(c => c.id === alvoId)
    if (alvo) dispararJuice(alvo, { dano, critico: opcoes.critico, ...opcoes })
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
    const animId = atacante.animacoes?.ataqueMelee ?? 1
    const animFn = getAttackAnimation(animId)
    animFn({
      charId: atacante.id,
      atacante,
      alvo,
      resultado,
      onGetHexCenter: onGetHexCenter || (() => ({ x: 0, y: 0 })),
      setAnimTimer,
      syncCharacters,
      setCharVisualPos: onSetCharVisualPos || (() => {}),
      onEmitParticles: onEmitParticles || (() => {}),
      setKiBall: onSetKiBall || (() => {}),
      onBalloon: (alvoId, texto, tipo, row, col) => {
        adicionarBalao(alvoId, texto, tipo, row, col)
      },
      onFinalize: onFinalizar,
    })
  }

  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
    const animId = atacante.animacoes?.ataqueRange ?? 1
    const animFn = getRangeAnimation(animId)
    animFn({
      charId: atacante.id,
      atacante,
      alvo,
      resultado,
      obstaculos,
      onGetHexCenter: onGetHexCenter || (() => ({ x: 0, y: 0 })),
      setAnimTimer,
      setCharVisualPos: onSetCharVisualPos || (() => {}),
      onEmitParticles: onEmitParticles || (() => {}),
      setProjectile: onSetProjectile || (() => {}),
      setKiBall: onSetKiBall || (() => {}),
      onBalloon: (alvoId, texto, tipo, row, col) => {
        adicionarBalao(alvoId, texto, tipo, row, col)
      },
      onFinalize: onFinalizar,
    })
  }

  function gastarMP(charId, custo) {
    if (!custo) return
    charsRef.current = charsRef.current.map(c => c.id === charId ? { ...c, mp: c.mp - custo } : c)
    setCharacters(charsRef.current)
  }

  // Golpe único de jogador e IA: a regra sai pronta de resolverGolpe (regras.js);
  // aqui só se paga o MP, se anima e se aplica. aoTerminar devolve o turno a quem bateu.
  function executarGolpe(atacante, alvo, { poderAtaque = null, poderDefesa = null }, aoTerminar) {
    const distancia = distanciaHex(atacante.posicao, alvo.posicao)
    const r = resolverGolpe(atacante, alvo, { distancia, poderAtaque, poderDefesa })
    gastarMP(atacante.id, r.custoAtaque)
    gastarMP(alvo.id, r.custoDefesa)
    addLog(`⚔️ ${atacante.nome} ataca ${alvo.nome}!`)
    r.logs.forEach(l => addLog(`  ${l}`))
    const depois = () => aplicarGolpe(atacante, alvo, r, aoTerminar)
    if (atacante.tipoAtaque === 'melee') animarAtaqueMelee(atacante, alvo, r.golpe || {}, depois)
    else animarAtaqueProjetil(atacante, alvo, r.golpe || {}, depois)
  }

  function aplicarGolpe(atacante, alvo, r, aoTerminar) {
    clearAnimTimers()
    if (!r.acertou) {
      adicionarBalao(alvo.id, 'MISS!', 'miss', alvo.posicao?.row, alvo.posicao?.col)
      dispararJuice(alvo, { dano: 0, miss: true })
      setAnimTimer(() => encerrarGolpe(aoTerminar), 1300)
      return
    }
    const bloqueio = r.golpe.criticoDefensivo
    animarDefesa(alvo, atacante, bloqueio ? 'block' : r.custoDefesa ? 'magic' : 'hit', () => {
      if (bloqueio) {
        addLog(`  🛡️ BLOQUEIO!`)
        adicionarBalao(alvo.id, 'CRÍTICO DEF!', 'block', alvo.posicao?.row, alvo.posicao?.col)
        dispararJuice(alvo, { dano: 0, bloqueio: true })
        adicionarFloatTexto(alvo.id, 'BLOQUEIO!', '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
      } else {
        aplicarDano(alvo.id, r.dano, atacante)
        if (r.custoDefesa) dispararJuice(alvo, { dano: 0, magic: true })
      }
      const seguir = () => {
        if (r.extra) setAnimTimer(() => aplicarExtra(atacante, alvo, r.extra, aoTerminar), 600)
        else setAnimTimer(() => encerrarGolpe(aoTerminar), 400)
      }
      if (!r.contra) { seguir(); return }
      setAnimTimer(() => {
        r.contra.logs.forEach(l => addLog(`  ↺ ${l}`))
        if (r.contra.dano > 0) {
          aplicarDano(atacante.id, r.contra.dano, alvo, { contra: true })
          adicionarFloatTexto(atacante.id, 'CONTRA!', '#ff8800', atacante.posicao?.row, atacante.posicao?.col)
        }
        seguir()
      }, 500)
    })
  }

  function aplicarExtra(atacante, alvo, extra, aoTerminar) {
    extra.logs.forEach(l => addLog(`  ${l}`))
    adicionarFloatTexto(atacante.id, 'EXTRA!', '#ffcc00', atacante.posicao?.row, atacante.posicao?.col)
    if (extra.criticoDef) adicionarFloatTexto(alvo.id, 'BLOQUEIO!', '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
    else aplicarDano(alvo.id, extra.dano, atacante, { extraHit: true })
    encerrarGolpe(aoTerminar)
  }

  // Marca quem caiu (o alvo ou, no contra-ataque, quem bateu), confere vitória e devolve o turno.
  function encerrarGolpe(aoTerminar) {
    animatingRef.current = false
    if (winnerRef.current) return
    const caidos = charsRef.current.filter(c => c.vivo && c.hp <= 0)
    if (caidos.length) {
      charsRef.current = charsRef.current.map(c => (c.vivo && c.hp <= 0 ? { ...c, vivo: false } : c))
      setCharacters(charsRef.current)
      caidos.forEach(c => { tc.marcarMorto(c.id); addLog(`💀 ${c.nome} foi derrotado!`) })
    }
    setAnimTimer(() => { if (verificarVitoria()) return; aoTerminar() }, caidos.length ? 1200 : 800)
  }

  function voltarAoTurnoJogador() {
    if (!charsRef.current.find(c => c.id === currentCharIdRef.current)?.vivo) { finalizarTurno(); return }
    tc.registrarAcao(currentCharIdRef.current, TipoAcao.ATACAR)
    setTurnoAcoes(prev => ({ ...prev, atacou: true }))
    setSubPhase('free')
    setHighlightedCells([])
    setAttackCells([])
    setRangeCells([])
    if (onUnlockInput) onUnlockInput(1500)
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

    const moveAnimId = currentChar.animacoes?.movimento ?? 1
    const animFn = getMovementAnimation(moveAnimId)

    const realSz = onGetSz ? onGetSz() : 36
    animFn({
      charId: currentChar.id,
      origem: currentChar.posicao,
      destino: { row, col },
      steps,
      sz: realSz,
      charsRef,
      syncCharacters,
      setAnimTimer,
      onTrail,
      onClearTrail,
      setCharScales: onSetCharScales || (() => {}),
      setCharVisualPos: onSetCharVisualPos || (() => {}),
      setCharRotation: onSetCharRotation || (() => {}),
      hexCenter: onGetHexCenter || ((r, c) => ({ x: 0, y: 0 })),
      padX: 0,
      padY: 0,
      moveAnimId,
      onEmitParticles: onEmitParticles || (() => {}),
      onFinalize: () => {
        animatingRef.current = false
        aposMovimento(row, col)
      },
    })
  }

  function aposMovimento(row, col) {
    if (onClearHighlight) onClearHighlight()
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
    if (onClearTrail) onClearTrail()
    setTurnoAcoes(prev => ({ ...prev, moveu: true }))
    tc.registrarAcao(currentCharIdRef.current, TipoAcao.MOVER)
    setSubPhase('free')
    setHighlightedCells([])
    setCaminhoEscolhido([])
    setDestinoEscolhido(null)
    setActionPanel(false)
    if (onUnlockInput) onUnlockInput(0)
  }

  function confirmarMovimento() {
    if (!pendingMove) return
    if (onClearHighlight) onClearHighlight()
    moverPersonagem(pendingMove.row, pendingMove.col)
    setPendingMove(null)
    setCaminhoEscolhido([])
    setDestinoEscolhido(null)
  }

  function cancelarAcao() {
    if (onClearHighlight) onClearHighlight()
    setSubPhase('free'); setHighlightedCells([]); setAttackCells([]); setRangeCells([])
    setSubPhaseStep(null); setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([])
  }

  function escolherTipoAtaque() {
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar || animatingRef.current) return
    const opcoes = poderesDisponiveis(currentChar, 'ataque', poderesEscolhidos[currentChar.id])
    if (opcoes.length === 0) {
      setActionPanel(false)
      confirmarEscolhaAtaque({ poderId: null, custoMP: 0, disponivel: true })
      return
    }
    setPowerChoiceModal({ mode: 'ataque', charName: currentChar.nome, opcoes })
  }

  function confirmarEscolhaAtaque(opcao) {
    setPowerChoiceModal(null)
    const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
    if (!currentChar || animatingRef.current) return
    setPowerAttackMode(!!opcao.poderId)
    poderAtaqueIdRef.current = opcao.poderId || null
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
    setRangeCells([])

    const poderAtaque = poderesDisponiveis(currentChar, 'ataque', poderesEscolhidos[currentChar.id])
      .find(p => p.id === poderAtaqueIdRef.current) || null
    poderAtaqueIdRef.current = null
    setPowerAttackMode(false)
    // A IA defende pela mesma regra que o jogador: o melhor poder de defesa que ela pode pagar.
    const poderDefesa = melhorPoder(target, 'defesa', poderesEscolhidos[target.id])
    executarGolpe(currentChar, target, { poderAtaque, poderDefesa }, voltarAoTurnoJogador)
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
      setIaThinking(false)
      iaThinkingRef.current = false
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

          const moveAnimId = iaAtual.animacoes?.movimento ?? 1
          const animFn = getMovementAnimation(moveAnimId)

          const realSz = onGetSz ? onGetSz() : 36
          animFn({
            charId: iaChar.id,
            origem: iaAtual.posicao,
            destino,
            steps,
            sz: realSz,
            charsRef,
            syncCharacters,
            setAnimTimer,
            onTrail,
            onClearTrail,
            setCharScales: onSetCharScales || (() => {}),
            setCharVisualPos: onSetCharVisualPos || (() => {}),
            setCharRotation: onSetCharRotation || (() => {}),
            hexCenter: onGetHexCenter || ((r, c) => ({ x: 0, y: 0 })),
            padX: 0,
            padY: 0,
            moveAnimId,
            onEmitParticles: onEmitParticles || (() => {}),
            onFinalize: () => {
              if (onClearTrail) onClearTrail()
              setAttackCells([]); dec.logs.forEach(l => addLog(`  ${l}`))
              setAnimTimer(estagioAgir, 300)
            },
          })
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
      if (dec2.tipo === 'atacar' && tc.podeAgir(iaChar.id, TipoAcao.ATACAR)) {
        const atacante = iaAtual2
        const alvo = charsAgora2.find(c => c.id === dec2.detalhes.alvo.id) || dec2.detalhes.alvo
        const poderAtaque = poderesDisponiveis(atacante, 'ataque', poderesEscolhidos[atacante.id])
          .find(p => p.id === dec2.detalhes.poderId) || null
        dec2.logs.forEach(l => addLog(`  ${l}`))
        setRangeCells(getCelulasAtaque(atacante.posicao.row, atacante.posicao.col, atacante.tipoAtaque, cols, rows, atacante.tipoAtaque === 'melee' ? 1 : atacante.pdf, obstaculos))
        setAttackCells([])
        const golpear = (poderDefesa) => {
          setAnimTimer(() => {
            setRangeCells([])
            setAttackCells([{ row: alvo.posicao.row, col: alvo.posicao.col }])
            setAnimTimer(() => {
              setRangeCells([]); setAttackCells([])
              tc.registrarAcao(iaChar.id, TipoAcao.ATACAR)
              executarGolpe(atacante, alvo, { poderAtaque, poderDefesa }, finalizarTurnoIA)
            }, 700)
          }, 1200)
        }
        if (onBannerIA) onBannerIA(atacante.nome)
        const defesas = alvo.time === 'jogador' ? poderesDisponiveis(alvo, 'defesa', poderesEscolhidos[alvo.id]) : []
        if (defesas.length) {
          setDefensePending({
            alvo, atacante, faBruto: null,
            opcoes: [
              { rotulo: 'Sem poder', poderId: null, custoMP: 0, disponivel: true },
              ...defesas.map(p => ({ rotulo: `${p.chaveI18n} (-${p.custoMP} MP)`, poderId: p.id, custoMP: p.custoMP, disponivel: true })),
            ],
            onResolve: (poderId) => golpear(defesas.find(p => p.id === poderId) || null),
          })
        } else golpear(alvo.time === 'jogador' ? null : melhorPoder(alvo, 'defesa', poderesEscolhidos[alvo.id]))
      } else {
        dec2.logs.forEach(l => addLog(`  ${l}`))
        setAnimTimer(finalizarTurnoIA, 500)
      }
    }

    function finalizarTurnoIA() {
      addLog(`  ✅ ${iaChar.nome} finalizou o turno.`)
      iaThinkingRef.current = false; setIaThinking(false)
      emit('effect:end', { canal: 'hud' })
      if (onUnlockInput) onUnlockInput(0)
    if (verificarVitoria()) return
      avancarEAcionar()
    }
  }

  return {
    combat: {
      characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual, isPlayerTurn,
    },
    ui: {
      subPhase, subPhaseStep, highlightedCells, attackCells, rangeCells,
      actionPanel, powerAttackMode, powerChoiceModal, defensePending,
    },
    ordering: {
      orderingPhase, jokenpoNeeded, currentCrossTie, playerTeamOrder, crossTieQueue,
    },
    move: {
      pendingMove, destinoEscolhido, caminhoEscolhido,
    },
    set: {
      setTurnoAcoes, setSubPhase, setSubPhaseStep,
      setHighlightedCells, setAttackCells, setRangeCells,
      setActionPanel, setPowerAttackMode, setPowerChoiceModal,
      setPendingMove, setDestinoEscolhido, setCaminhoEscolhido,
      setIaThinking, setPhase,
      setWinner, setOrderingPhase, setJokenpoNeeded, setCurrentCrossTie,
      setPlayerTeamOrder, setCrossTieQueue, setItensChaoAtual, setDefensePending,
    },
    actions: {
      iniciarPartida, iniciarMovimento, moverPersonagem, confirmarMovimento,
      cancelarAcao, escolherTipoAtaque, confirmarEscolhaAtaque, executarAtaque,
      usarItem, pularAcao, finalizarTurno, executarIA,
      confirmarOrdemInterna, handleJokenpoResult,
    },
    utils: {
      syncCharacters, getCharacters, setAnimTimer, clearAnimTimers, addLog, turnVersion,
    },
  }
}
