import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import useHexCanvas from '../engine/useHexCanvas'
import {
  resolverAtaque, resolverContraAtaque, rolarD6, calcularFD,
  getCasasMovimento, getChanceAcerto,
} from '../engine/combat'
import { getCelulasAlcance, getCelulasAtaque, distanciaHex, encontrarCaminho, getHexLine } from '../engine/hexUtils'
import { decidirAcaoIA } from '../engine/ai'
import { PODERES_BASE, getPoderesPorId, temPoderDisponivel, aplicarBonusPoder } from '../data/poderes'
import JokenpoModal from './JokenpoModal'
import PowerChoiceModal from './PowerChoiceModal'
import './Phase4Combat.css'

const SQRT3 = Math.sqrt(3)
const SUB_PHASES = ['movimento', 'ataque', 'item']

export default function Phase4Combat({ boardState, poderesEscolhidos = {}, onBackToPhase1, onBackToPhase3 }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const angleRef = useRef(0)
  const trailRef = useRef([])
  const rafRef = useRef(null)

  const { boardChars, obstaculos, itensChao, cols, rows, tileUrl } = boardState
  const agiUmPraUm = true

  const { recalc, calcVersion, getCellAt, getHexCenter, drawHex,
          hexCenter, hexCorner, pixelToHex,
          padRef, sizeRef } = useHexCanvas({
    canvasRef, cols, rows, minSz: 18, maxSz: 36,
  })

  const [characters, setCharacters] = useState(() =>
    boardChars.map(bc => ({
      ...bc.charData,
      posicao: { row: bc.row, col: bc.col },
      vivo: true,
      poderesEscolhidos: poderesEscolhidos[bc.charData?.id] || [],
    }))
  )
  const [turnOrder, setTurnOrder] = useState([])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [phase, setPhase] = useState('prepare')
  const [subPhase, setSubPhase] = useState(null)
  const [highlightedCells, setHighlightedCells] = useState([])
  const [attackCells, setAttackCells] = useState([])
  const [rangeCells, setRangeCells] = useState([])
  const [subPhaseStep, setSubPhaseStep] = useState(null)
  const [projectilePath, setProjectilePath] = useState([])
  const [battleLog, setBattleLog] = useState([])
  const [winner, setWinner] = useState(null)
  const [jokenpoNeeded, setJokenpoNeeded] = useState(null)
  const [orderingPhase, setOrderingPhase] = useState(null)
  const [playerTeamOrder, setPlayerTeamOrder] = useState([])
  const [crossTieQueue, setCrossTieQueue] = useState([])
  const [currentCrossTie, setCurrentCrossTie] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [d6Result, setD6Result] = useState(null)
  const [itensChaoAtual, setItensChaoAtual] = useState(itensChao || {})
  const [iaThinking, setIaThinking] = useState(false)
  const [turnoAcoes, setTurnoAcoes] = useState({ moveu: false, atacou: false })
  const [actionPanel, setActionPanel] = useState(false)
  const [turnAnnouncement, setTurnAnnouncement] = useState(null)
  const [announcementClass, setAnnouncementClass] = useState('')

  const [logDrawerOpen, setLogDrawerOpen] = useState(false)
  const [charModal, setCharModal] = useState(null)
  const [pendingMove, setPendingMove] = useState(null)
  const drawerListRef = useRef(null)

  const [destinoEscolhido, setDestinoEscolhido] = useState(null)
  const [caminhoEscolhido, setCaminhoEscolhido] = useState([])

  useEffect(() => {
    if (logDrawerOpen && drawerListRef.current) {
      drawerListRef.current.scrollTop = drawerListRef.current.scrollHeight
    }
  }, [battleLog, logDrawerOpen])

  const [movementPath, setMovementPath] = useState(null)
  const [attackAnim, setAttackAnim] = useState(null)
  const [damageFlash, setDamageFlash] = useState({})
  const [projectilePos, setProjectilePos] = useState(null)
  const [balloons, setBalloons] = useState([])
  const [shaking, setShaking] = useState(false)
  const [flashDmg, setFlashDmg] = useState(false)
  const [defensePending, setDefensePending] = useState(null)
  const [powerAttackMode, setPowerAttackMode] = useState(false)
  const [powerChoiceModal, setPowerChoiceModal] = useState(null)
  const [danoPopup, setDanoPopup] = useState(null)
  const [hpAnterior, setHpAnterior] = useState({})
  const [attackBanner, setAttackBanner] = useState(null)
  const animatingRef = useRef(false)
  const animTimersRef = useRef([])
  const announceTimerRef = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const executarAtaqueRef = useRef(null)
  const moverPersonagemRef = useRef(null)
  const winnerRef = useRef(null)
  const iaThinkingRef = useRef(false)
  const tileImgRef = useRef(null)
  const [tileLoaded, setTileLoaded] = useState(false)
  const sortedGlobalRef = useRef([])
  const crossTieQueueRef = useRef([])
  const crossTieResultsRef = useRef([])
  const defesaBonusRef = useRef(0)

  function clearAnimTimers() {
    animTimersRef.current.forEach(t => clearTimeout(t))
    animTimersRef.current = []
  }

  function setAnimTimer(fn, delay) {
    const id = setTimeout(fn, delay)
    animTimersRef.current.push(id)
    return id
  }

  function anunciar(texto, duracao = 2000, cls = '') {
    setTurnAnnouncement(texto)
    setAnnouncementClass(cls)
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
    announceTimerRef.current = setTimeout(() => { setTurnAnnouncement(null); setAnnouncementClass('') }, duracao)
  }

  const charsRef = useRef(characters)
  const turnRef = useRef(currentTurn)
  const orderRef = useRef(turnOrder)
  useEffect(() => { charsRef.current = characters }, [characters])
  useEffect(() => { turnRef.current = currentTurn }, [currentTurn])
  useEffect(() => { orderRef.current = turnOrder }, [turnOrder])

  const [remainingMove, setRemainingMove] = useState(0)

  useEffect(() => {
    if (!tileUrl) return
    const img = new Image()
    img.src = tileUrl
    img.onload = () => {
      tileImgRef.current = img
      setTileLoaded(true)
    }
  }, [tileUrl])

  useEffect(() => {
    const alive = characters.filter(c => c.vivo)
    const sorted = [...alive].sort((a, b) => b.agi - a.agi)

    const agiGroups = {}
    sorted.forEach(ch => {
      if (!agiGroups[ch.agi]) agiGroups[ch.agi] = []
      agiGroups[ch.agi].push(ch)
    })

    const grupos = Object.values(agiGroups).sort((a, b) => b[0].agi - a[0].agi)

    const ordemParcial = []
    const empatesInternosJogador = []
    const empatesCruzados = []

    for (const grupo of grupos) {
      if (grupo.length === 1) {
        ordemParcial.push(grupo[0])
        continue
      }
      const jogadores = grupo.filter(c => c.time === 'jogador')
      const ias = grupo.filter(c => c.time === 'ia')

      if (ias.length === 0) {
        ordemParcial.push(...jogadores)
        empatesInternosJogador.push({ agi: grupo[0].agi, chars: jogadores })
      } else if (jogadores.length === 0) {
        const shuffled = [...ias].sort(() => Math.random() - 0.5)
        ordemParcial.push(...shuffled)
      } else {
        const shuffledIas = [...ias].sort(() => Math.random() - 0.5)
        ordemParcial.push(...jogadores, ...shuffledIas)
        empatesInternosJogador.push({ agi: grupo[0].agi, chars: jogadores })
        empatesCruzados.push({ agi: grupo[0].agi, jogadores, ias: shuffledIas })
      }
    }

    sortedGlobalRef.current = ordemParcial

    setTimeout(() => {
      const timeJogador = ordemParcial.filter(c => c.time === 'jogador')
      setPlayerTeamOrder(timeJogador)

      if (empatesInternosJogador.length > 0 || empatesCruzados.length > 0) {
        setOrderingPhase('player_internal')
        setCrossTieQueue(empatesCruzados)
      } else {
        const order = ordemParcial.map(c => c.id)
        setTurnOrder(order)
        startPlayerTurn(order, 0)
      }
    }, 0)
  }, [])

  function handleJokenpoResult(winnerName) {
    if (orderingPhase === 'jokenpo_cross') {
      handleJokenpoResultCruzado(winnerName)
    }
  }

  function confirmarOrdemInterna() {
    const base = sortedGlobalRef.current
    let jogadorIdx = 0
    const novaOrdem = base.map(c => {
      if (c.time === 'jogador') return playerTeamOrder[jogadorIdx++]
      return c
    })
    sortedGlobalRef.current = novaOrdem

    if (crossTieQueue.length > 0) {
      setOrderingPhase('jokenpo_cross')
      iniciarProximoJokenpoCruzado(crossTieQueue, novaOrdem)
    } else {
      setOrderingPhase(null)
      const order = novaOrdem.map(c => c.id)
      setTurnOrder(order)
      startPlayerTurn(order, 0)
    }
  }

  function iniciarProximoJokenpoCruzado(queue, ordemAtual) {
    if (queue.length === 0) {
      aplicarOrdemCruzada(ordemAtual)
      return
    }
    const grupo = queue[0]
    const jogadoresRestantes = grupo.jogadores.filter(j =>
      !crossTieResultsRef.current.some(r => r.winner?.id === j.id || r.loser?.id === j.id)
    )
    const iasRestantes = grupo.ias.filter(ia =>
      !crossTieResultsRef.current.some(r => r.winner?.id === ia.id || r.loser?.id === ia.id)
    )

    if (jogadoresRestantes.length === 0 || iasRestantes.length === 0) {
      crossTieQueueRef.current = queue.slice(1)
      iniciarProximoJokenpoCruzado(queue.slice(1), ordemAtual)
      return
    }

    setCurrentCrossTie({
      playerChar: jogadoresRestantes[0],
      iaChar: iasRestantes[0],
      grupoAgi: grupo.agi,
      remainingQueue: queue,
    })
    setJokenpoNeeded([jogadoresRestantes[0], iasRestantes[0]])
  }

  function handleJokenpoResultCruzado(winnerName) {
    const { playerChar, iaChar, remainingQueue } = currentCrossTie
    const winner = winnerName === playerChar.nome ? playerChar : iaChar
    const loser = winner.id === playerChar.id ? iaChar : playerChar

    crossTieResultsRef.current.push({ winner, loser })
    setJokenpoNeeded(null)
    setCurrentCrossTie(null)

    iniciarProximoJokenpoCruzado(remainingQueue, sortedGlobalRef.current)
  }

  function aplicarOrdemCruzada(ordemBase) {
    const results = crossTieResultsRef.current
    const novaOrdem = [...ordemBase]

    for (const grupo of [...new Set(results.map(r => r.winner.agi))]) {
      const blocoIdx = []
      novaOrdem.forEach((c, i) => {
        if (c.agi === grupo && results.some(r => r.winner.id === c.id || r.loser.id === c.id)) blocoIdx.push(i)
      })
      if (blocoIdx.length === 0) continue

      const winners = results.filter(r => r.winner.agi === grupo).map(r => r.winner)
      const losers = results.filter(r => r.loser.agi === grupo).map(r => r.loser)

      const winnerOrdem = winners.filter(w => bloco.some(b => b.id === w.id))
      const loserOrdem = losers.filter(l => bloco.some(b => b.id === l.id))
      const blocoOrdenado = []
      const maxLen = Math.max(winnerOrdem.length, loserOrdem.length)
      for (let i = 0; i < maxLen; i++) {
        if (winnerOrdem[i]) blocoOrdenado.push(winnerOrdem[i])
        if (loserOrdem[i]) blocoOrdenado.push(loserOrdem[i])
      }

      blocoIdx.forEach((pos, i) => {
        if (blocoOrdenado[i]) novaOrdem[pos] = blocoOrdenado[i]
      })
    }

    sortedGlobalRef.current = novaOrdem
    setOrderingPhase(null)
    const order = novaOrdem.map(c => c.id)
    setTurnOrder(order)
    startPlayerTurn(order, 0)
  }

  function logEstadoTurno(origem, orderLocal, idxLocal) {
    const chars = charsRef.current
    const ativo = chars.find(c => c.id === orderLocal[idxLocal])
    console.log(
      `[TURNO:${origem}] ativo=${ativo?.nome}(${ativo?.time})` +
      ` | vivos: ${chars.filter(c => c.vivo).map(c => `${c.nome}(hp=${c.hp})`).join(', ')}` +
      ` | order=[${orderLocal.join(',')}] idx=${idxLocal}`
    )
  }

  function startPlayerTurn(order, startIndex) {
    setTurnOrder(order)
    setCurrentTurn(startIndex)
    const firstChar = characters.find(c => c.id === order[startIndex])
    if (firstChar?.time === 'ia') {
      setPhase('enemy_turn')
      anunciar(t('prototype.arena_testbed.announce_ia_turn'), 1500, 'ia')
      setTimeout(() => executarIA(firstChar), 1000)
    } else if (firstChar) {
      logEstadoTurno('startPlayerTurn', order, startIndex)
      setPhase(null)
      setTurnoAcoes({ moveu: false, atacou: false })
      setSubPhase('free')
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
      anunciar(t('prototype.arena_testbed.announce_player_turn'))
      setTimeout(() => {
        anunciar(t('prototype.arena_testbed.free_hint'), 2500)
      }, 2200)
    }
  }

  function enterSubPhase(sub, char) {
    if (!char) return
    if (sub === 'movimento') {
      const mov = getCasasMovimento(char.agi, agiUmPraUm)
      const moveCells = getCelulasAlcance(
        char.posicao.row, char.posicao.col, mov,
        cols, rows, obstaculos
      )
      const freeCells = moveCells.filter(c => {
        const occupied = characters.some(ch =>
          ch.vivo && ch.id !== char.id && ch.posicao?.row === c.row && ch.posicao?.col === c.col
        )
        const hasObstacle = obstaculos[`${c.row}_${c.col}`]?.tipo === 1
        return !occupied && !hasObstacle
      })
      setHighlightedCells(freeCells)
      setAttackCells([])
      setRemainingMove(mov)
      setSubPhase('movimento')
      setPhase(null)
    } else if (sub === 'acao') {
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
      setSubPhaseStep('escolher_acao')
      setSubPhase('acao')
      setPhase(null)
    }
  }

  const currentChar = useMemo(() => {
    if (turnOrder.length === 0) return null
    return characters.find(c => c.id === turnOrder[currentTurn])
  }, [characters, turnOrder, currentTurn])

  const isPlayerTurn = currentChar?.time === 'jogador'

  const subPhaseLabel = useMemo(() => {
    if (!subPhase) return ''
    if (subPhase === 'free') return t('prototype.arena_testbed.free_turn_hint')
    if (subPhase === 'movimento') return t('prototype.arena_testbed.subphase_move')
    return t('prototype.arena_testbed.subphase_action')
  }, [subPhase, t])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sz = sizeRef.current
    const padX = padRef.current.x
    const padY = padRef.current.y
    offsetRef.current = { x: padX, y: padY }
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const hlSet = new Set(highlightedCells.map(c => `${c.row}_${c.col}`))
    const atkSet = new Set(attackCells.map(c => `${c.row}_${c.col}`))
    const rangeSet = new Set(rangeCells.map(c => `${c.row}_${c.col}`))
    const projPathSet = new Set(projectilePath.map(c => `${c.row}_${c.col}`))
    const destSet = new Set(caminhoEscolhido.map(c => `${c.row}_${c.col}`))
    const destKey = destinoEscolhido ? `${destinoEscolhido.row}_${destinoEscolhido.col}` : null

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const center = hexCenter(row, col, padX, padY, sz)
        const key = `${row}_${col}`
        const obs = obstaculos[key]
        const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)

        let fill = '#3d2208'
        let stroke = '#5c3410'

        if (obs) {
          const colors = { 1: '#555', 2: '#080b18', 3: '#8b4513', 4: '#6b5b3e' }
          fill = colors[obs.tipo] || '#555'
          stroke = '#333'
        } else if (itensChaoAtual[key]) {
          fill = itensChaoAtual[key].tipo === 'hp' ? '#002211' : '#001133'
          stroke = itensChaoAtual[key].tipo === 'hp' ? '#00ff88' : '#00eeff'
        }

        if (atkSet.has(key)) {
          fill = 'rgba(255,34,68,0.08)'
          stroke = '#ff2244'
        } else if (rangeSet.has(key)) {
          fill = 'rgba(255,204,0,0.05)'
          stroke = '#ffcc00'
        } else if (hlSet.has(key)) {
          fill = 'rgba(0,238,255,0.06)'
          stroke = '#00eeff'
        }

        if (destSet.has(key) && key !== destKey) {
          fill = 'rgba(0,238,255,0.12)'
          stroke = 'rgba(255,255,255,0.6)'
        }

        if (destKey && key === destKey) {
          fill = 'rgba(0,238,255,0.2)'
          stroke = '#ffffff'
        }

        let shadow = null
        if (atkSet.has(key)) {
          shadow = { blur: 12, color: '#ff2244' }
        } else if (rangeSet.has(key)) {
          shadow = { blur: 8, color: '#ffcc00' }
        } else if (hlSet.has(key)) {
          shadow = { blur: 12, color: '#00eeff' }
        } else if (!obs && !ch && !itensChaoAtual[key]) {
          shadow = { blur: 4, color: '#7a4a1a' }
        }

        const lw = destKey && key === destKey ? 2.5 : (hlSet.has(key) ? 1.5 : (atkSet.has(key) ? 1.5 : (rangeSet.has(key) ? 1 : 1)))
        if (!obs && !itensChaoAtual[key] && tileImgRef.current) {
          ctx.save()
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i)
            const px = center.x + sz * Math.cos(angle)
            const py = center.y + sz * Math.sin(angle)
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(tileImgRef.current, center.x - sz, center.y - sz, sz * 2, sz * 2)
          if (fill !== '#3d2208') {
            ctx.fillStyle = fill
            ctx.fill()
          }
          ctx.restore()
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i)
            const px = center.x + sz * Math.cos(angle)
            const py = center.y + sz * Math.sin(angle)
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
          }
          ctx.closePath()
          if (shadow) { ctx.shadowBlur = shadow.blur; ctx.shadowColor = shadow.color }
          ctx.strokeStyle = stroke
          ctx.lineWidth = lw
          ctx.stroke()
          ctx.shadowBlur = 0
        } else {
          drawHex(ctx, center, sz, fill, stroke, lw, shadow)
        }

        if (ch) {
          const flashOn = damageFlash[ch.id] !== undefined && damageFlash[ch.id] % 2 === 0

          if (ch.time === 'jogador') {
            const angle = angleRef.current
            ctx.save()
            ctx.translate(center.x, center.y)
            ctx.rotate(angle)
            for (let i = 0; i < 6; i++) {
              ctx.beginPath()
              ctx.moveTo(sz * 0.62, 0)
              ctx.lineTo(sz * 0.72, 0)
              ctx.strokeStyle = 'rgba(0,255,136,0.6)'
              ctx.lineWidth = 2
              ctx.stroke()
              ctx.rotate(Math.PI / 3)
            }
            ctx.restore()

            ctx.beginPath()
            ctx.arc(center.x, center.y, sz * 0.48, 0, Math.PI * 2)
            ctx.fillStyle = '#001a0d'
            ctx.fill()
            ctx.strokeStyle = '#00ff88'
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.fillStyle = '#00ff88'
            ctx.font = `700 ${sz * 0.35}px Orbitron, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(ch.nome.charAt(0).toUpperCase(), center.x, center.y)
          } else {
            const angle = angleRef.current
            ctx.save()
            ctx.translate(center.x, center.y)
            ctx.rotate(angle)
            for (let i = 0; i < 6; i++) {
              ctx.beginPath()
              ctx.moveTo(sz * 0.62, 0)
              ctx.lineTo(sz * 0.72, 0)
              ctx.strokeStyle = 'rgba(255,34,68,0.6)'
              ctx.lineWidth = 2
              ctx.stroke()
              ctx.rotate(Math.PI / 3)
            }
            ctx.restore()

            ctx.beginPath()
            ctx.arc(center.x, center.y, sz * 0.48, 0, Math.PI * 2)
            ctx.fillStyle = '#1a0008'
            ctx.fill()
            ctx.strokeStyle = '#ff2244'
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.fillStyle = '#ff2244'
            ctx.font = `700 ${sz * 0.35}px Orbitron, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(ch.nome.charAt(0).toUpperCase(), center.x, center.y)
          }

          const isActive = ch.id === currentChar?.id
          if (isActive) {
            ctx.beginPath()
            ctx.arc(center.x, center.y, sz * 0.85, 0, Math.PI * 2)
            ctx.globalAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 300)
            ctx.strokeStyle = ch.time === 'jogador' ? '#00eeff' : '#ff2244'
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.globalAlpha = 1
          }

          const barW = sz * 0.9
          const barH = 4
          const barX = center.x - barW / 2
          const barY = center.y + sz * 0.45
          ctx.fillStyle = '#0a0a0a'
          ctx.fillRect(barX, barY, barW, barH)
          const hpPct = ch.hp / ch.hpMax
          if (hpPct > 0.5) {
            ctx.fillStyle = '#00ff88'
          } else if (hpPct > 0.25) {
            ctx.fillStyle = '#ffcc00'
          } else {
            ctx.fillStyle = '#ff2244'
            ctx.shadowBlur = 6
            ctx.shadowColor = '#ff2244'
          }
          ctx.fillRect(barX, barY, barW * hpPct, barH)
          ctx.shadowBlur = 0
        }

        if (projPathSet.has(key) && !projectilePos?.row === row && !projectilePos?.col === col) {
          drawHex(ctx, center, sz, fill, 'rgba(255,200,0,0.3)', 2)
        }

        if (projectilePos && projectilePos.row === row && projectilePos.col === col) {
          ctx.beginPath()
          ctx.arc(center.x, center.y, sz * 0.25, 0, Math.PI * 2)
          ctx.fillStyle = '#ffcc00'
          ctx.fill()
          ctx.strokeStyle = '#ff8800'
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(center.x, center.y, sz * 0.35, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,200,0,0.2)'
          ctx.fill()
        }
      }
    }

    for (const t of trailRef.current) {
      const tc = hexCenter(t.row, t.col, padX, padY, sz)
      ctx.beginPath()
      ctx.arc(tc.x, tc.y, sz * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0,238,255,${t.alpha * 0.4})`
      ctx.fill()
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const center = hexCenter(row, col, padX, padY, sz)
        const key = `${row}_${col}`
        const obs = obstaculos[key]
        const item = itensChaoAtual[key]
        const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)

        if (obs && !ch) {
          ctx.fillStyle = '#fff'
          ctx.font = '16px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const icons = { 1: '🧱', 2: '🕳️', 3: '🪤', 4: '📦' }
          ctx.fillText(icons[obs.tipo] || '?', center.x, center.y)
        } else if (item && !ch && !obs) {
          ctx.fillStyle = '#fff'
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(item.tipo === 'hp' ? '❤️' : '💙', center.x, center.y)
        }
      }
    }
  }, [characters, obstaculos, itensChaoAtual, cols, rows, highlightedCells, attackCells, rangeCells, currentChar, damageFlash, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido, tileLoaded])

  useEffect(() => {
    const container = canvasContainerRef.current
    const canvas = canvasRef.current
    if (container) {
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { inlineSize, blockSize } = entry.contentBoxSize?.[0] || {}
          const w = entry.contentRect.width
          const h = entry.contentRect.height
        }
      })
      ro.observe(container)
      return () => { ro.disconnect() }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function loop() {
      angleRef.current = (angleRef.current || 0) + 0.018
      trailRef.current = trailRef.current
        .map(t => ({ ...t, alpha: t.alpha - 0.07 }))
        .filter(t => t.alpha > 0)
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw, calcVersion])

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas || animatingRef.current || !isPlayerTurn || iaThinkingRef.current || winnerRef.current) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    const sz = sizeRef.current
    const padX = offsetRef.current.x || sz * 1.5
    const padY = offsetRef.current.y || sz * SQRT3
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, sz)
    if (!hex) return
    const { row, col } = hex

    if (subPhase === 'free' && isPlayerTurn && !iaThinking) {
      const clickedOwnToken = currentChar?.posicao?.row === row && currentChar?.posicao?.col === col
      if (clickedOwnToken && !actionPanel) {
        setActionPanel(true)
        return
      }
      if (actionPanel) {
        setActionPanel(false)
        return
      }
    }

    if (subPhase === 'movimento') {
      if (highlightedCells.some(c => c.row === row && c.col === col)) {
        const ocupadas = new Set(
          characters.filter(c => c.vivo && c.id !== currentChar.id)
            .map(c => `${c.posicao.row}_${c.posicao.col}`)
        )
        const cam = encontrarCaminho(
          currentChar.posicao.row, currentChar.posicao.col,
          row, col, cols, rows, obstaculos, ocupadas
        )
        setDestinoEscolhido({ row, col })
        setCaminhoEscolhido(cam ? cam.slice(1) : [{ row, col }])
        setPendingMove({ row, col })
      }
    } else if (subPhase === 'acao') {
      if (subPhaseStep === 'escolher_alvo' && attackCells.some(c => c.row === row && c.col === col)) {
        const target = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
        if (target) executarAtaqueRef.current?.(target)
      }
    }
  }, [
    isPlayerTurn, iaThinking, cols, rows, subPhase, subPhaseStep,
    currentChar, actionPanel, highlightedCells, attackCells, characters, obstaculos,
  ])

  const handleTouch = useCallback((e) => {
    if (e.cancelable) e.preventDefault()
    const touch = e.changedTouches[0]
    handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY })
  }, [handleCanvasClick])

  function moverPersonagem(row, col) {
    if (!currentChar || animating) return
    clearAnimTimers()
    setDestinoEscolhido(null)
    setCaminhoEscolhido([])

    const origem = currentChar.posicao
    const ocupadas = new Set(
      characters
        .filter(c => c.vivo && c.id !== currentChar.id)
        .map(c => `${c.posicao.row}_${c.posicao.col}`)
    )
    const caminho = encontrarCaminho(
      origem.row, origem.col, row, col,
      cols, rows, obstaculos, ocupadas
    )

    if (!caminho || caminho.length < 2) {
      setCharacters(prev =>
        prev.map(c =>
          c.id === currentChar.id ? { ...c, posicao: { row, col } } : c
        )
      )
      setHighlightedCells([])
      setRemainingMove(0)
      aposMovimento(row, col)
      return
    }

    const steps = caminho.slice(1)
    animatingRef.current = true
    setAnimating(true)
    setHighlightedCells([])

    let stepIdx = 0
    function avancarPasso() {
      if (stepIdx >= steps.length) {
        animatingRef.current = false
        setAnimating(false)
        setRemainingMove(0)
        aposMovimento(row, col)
        return
      }
      const passo = steps[stepIdx]
      trailRef.current = [...trailRef.current, { row: passo.row, col: passo.col, alpha: 1.0 }]
      setCharacters(prev =>
        prev.map(c =>
          c.id === currentChar.id ? { ...c, posicao: { row: passo.row, col: passo.col } } : c
        )
      )
      stepIdx++
      setAnimTimer(avancarPasso, 150)
    }
    setAnimTimer(avancarPasso, 50)
  }
  moverPersonagemRef.current = moverPersonagem

  function aposMovimento(row, col) {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Moveu para (${row}, ${col})`)
    const charAtualizado = {
      ...currentChar,
      posicao: { row, col },
    }
    const key = `${row}_${col}`
    if (itensChaoAtual[key]) {
      const item = itensChaoAtual[key]
      setCharacters(prev =>
        prev.map(c =>
          c.id === currentChar.id
            ? {
                ...c,
                inventario: {
                  ...c.inventario,
                  [item.tipo === 'hp' ? 'pocaoHP' : 'pocaoMP']: (c.inventario?.[item.tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'] || 0) + 1,
                },
              }
            : c
        )
      )
      setItensChaoAtual(prev => { const n = { ...prev }; delete n[key]; return n })
      addLog(`[${currentChar.nome}] Coletou Poção ${item.tipo === 'hp' ? 'HP' : 'MP'} do chão!`)
    }
    setTurnoAcoes(prev => ({ ...prev, moveu: true }))
    setSubPhase('free')
    setHighlightedCells([])
    setActionPanel(false)
  }

  function iniciarMovimento() {
    if (!currentChar || animating || turnoAcoes.moveu) return
    setActionPanel(false)
    anunciar(t('prototype.arena_testbed.announce_move'), 1200)
    const mov = getCasasMovimento(currentChar.agi, agiUmPraUm)
    const moveCells = getCelulasAlcance(
      currentChar.posicao.row, currentChar.posicao.col,
      mov, cols, rows, obstaculos
    )
    const freeCells = moveCells.filter(c => {
      const occupied = characters.some(ch =>
        ch.vivo && ch.id !== currentChar.id && ch.posicao?.row === c.row && ch.posicao?.col === c.col
      )
      const hasObstacle = obstaculos[`${c.row}_${c.col}`]?.tipo === 1
      return !occupied && !hasObstacle
    })
    setHighlightedCells(freeCells)
    setAttackCells([])
    setRemainingMove(mov)
    setSubPhase('movimento')
  }

  function cancelarAcao() {
    setHighlightedCells([])
    setAttackCells([])
    setRangeCells([])
    setSubPhaseStep(null)
    setPendingMove(null)
    setDestinoEscolhido(null)
    setCaminhoEscolhido([])
    setSubPhase('free')
    setActionPanel(false)
  }

  function confirmarMovimento() {
    if (!pendingMove) return
    moverPersonagemRef.current?.(pendingMove.row, pendingMove.col)
    setPendingMove(null)
  }

  function pularMovimento() {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Pulou a fase de movimento.`)
    setHighlightedCells([])
    enterSubPhase('acao', currentChar)
  }

  function escolherAcao(tipoAcao) {
    if (!currentChar || animating) return
    setPowerAttackMode(tipoAcao === 'power_attack')
    anunciar(t('prototype.arena_testbed.announce_attack'), 1200)
    addLog(`[${currentChar.nome}] Escolheu: ${tipoAcao}`)
    const alcanceMax = currentChar.tipoAtaque === 'melee' ? 1 : currentChar.pdf
    const atkCells = getCelulasAtaque(
      currentChar.posicao.row, currentChar.posicao.col,
      currentChar.tipoAtaque, cols, rows,
      alcanceMax, obstaculos
    )
    setRangeCells(atkCells)
    const enemyCells = atkCells.filter(c =>
      characters.some(ch => ch.vivo && ch.time !== currentChar.time && ch.posicao?.row === c.row && ch.posicao?.col === c.col)
    )
    setAttackCells(enemyCells)
    setHighlightedCells([])
    setSubPhaseStep('escolher_alvo')
    setSubPhase('acao')
  }

  function escolherTipoAtaque() {
    if (!currentChar || animating) return
    const poderesDisponiveis = getPoderesPorId(poderesEscolhidos[currentChar.id] || currentChar.poderesEscolhidos || [])
      .filter(p => p.gatilho === 'ataque' && currentChar.mp >= p.custoMP)
    if (poderesDisponiveis.length === 0) {
      setActionPanel(false)
      confirmarEscolhaAtaque({ rotulo: '', poderId: null, custoMP: 0, disponivel: true })
      return
    }
    const opcoes = [
      { rotulo: t('prototype.arena_testbed.pcm_comum'), poderId: null, custoMP: 0, disponivel: true },
      ...poderesDisponiveis.map(p => ({
        rotulo: `${p.nome_pt} (-${p.custoMP} MP)`,
        poderId: p.id,
        custoMP: p.custoMP,
        disponivel: true,
      })),
    ]
    setPowerChoiceModal({ mode: 'ataque', charName: currentChar.nome, opcoes })
  }

  function confirmarEscolhaAtaque(opcao) {
    setPowerChoiceModal(null)
    if (!currentChar || animating) return
    setPowerAttackMode(!!opcao.poderId)
    const nomeTipo = opcao.poderId ? 'power_attack' : 'common_attack'
    anunciar(t('prototype.arena_testbed.announce_attack'), 1200)
    addLog(`[${currentChar.nome}] Escolheu: ${nomeTipo}`)
    if (opcao.poderId) {
      const poder = PODERES_BASE.find(p => p.id === opcao.poderId)
      if (poder) addLog(`⚡ ${currentChar.nome} usará ${poder.nome_pt}!`)
    }
    const alcanceMax = currentChar.tipoAtaque === 'melee' ? 1 : currentChar.pdf
    const atkCells = getCelulasAtaque(
      currentChar.posicao.row, currentChar.posicao.col,
      currentChar.tipoAtaque, cols, rows,
      alcanceMax, obstaculos
    )
    setRangeCells(atkCells)
    const enemyCells = atkCells.filter(c =>
      characters.some(ch => ch.vivo && ch.time !== currentChar.time && ch.posicao?.row === c.row && ch.posicao?.col === c.col)
    )
    setAttackCells(enemyCells)
    setHighlightedCells([])
    setSubPhaseStep('escolher_alvo')
    setSubPhase('acao')
  }

  function pularAcao() {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Pulou a fase de ação.`)
    setAttackCells([])
    setRangeCells([])
    setSubPhaseStep(null)
    finalizarTurno()
  }

  function adicionarBalao(alvoId, texto, tipo, row, col) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sz = sizeRef.current
    const center = hexCenter(row, col, padRef.current.x, padRef.current.y, sz)
    const scaleX = rect.width / canvas.width
    const scaleY = rect.height / canvas.height
    const containerRect = canvasContainerRef.current?.getBoundingClientRect()
    const balaoX = center.x * scaleX + rect.left - (containerRect?.left ?? 0)
    const balaoY = center.y * scaleY + rect.top - (containerRect?.top ?? 0) - sz * 0.8

    const key = Date.now() + Math.random()
    setBalloons(prev => [...prev, { id: key, x: balaoX, y: balaoY, texto, tipo, key }])
    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.key !== key))
    }, 1300)
  }

  function aplicarDano(alvoId, dano, donoDoAtaque) {
    if (dano <= 0) return
    const alvo = charsRef.current.find(c => c.id === alvoId)
    if (!alvo) return
    const novoHp = Math.max(0, alvo.hp - dano)
    setHpAnterior(prev => ({ ...prev, [alvoId]: alvo.hp }))
    charsRef.current = charsRef.current.map(c =>
      c.id === alvoId ? { ...c, hp: novoHp } : c
    )
    setCharacters(prev =>
      prev.map(c =>
        c.id === alvoId ? { ...c, hp: novoHp } : c
      )
    )
    setDanoPopup({ dano, alvoId, key: Date.now() })
    setTimeout(() => setDanoPopup(null), 800)
    adicionarBalao(alvoId, `-${dano}`, 'damage', alvo.posicao?.row, alvo.posicao?.col)
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
    setFlashDmg(true)
    setTimeout(() => setFlashDmg(false), 400)
    const fazerFlash = (count) => {
      if (count >= 6) {
        setDamageFlash(prev => { const n = { ...prev }; delete n[alvoId]; return n })
        return
      }
      setDamageFlash(prev => ({ ...prev, [alvoId]: count }))
      setTimeout(() => fazerFlash(count + 1), 120)
    }
    fazerFlash(0)
  }

  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
    const origem = atacante.posicao
    const destino = alvo.posicao
    const dirRow = destino.row - origem.row
    const dirCol = destino.col - origem.col
    const meioRow = Math.round(origem.row + dirRow * 0.7)
    const meioCol = Math.round(origem.col + dirCol * 0.7)
    setCharacters(prev =>
      prev.map(c =>
        c.id === atacante.id ? { ...c, posicao: { row: meioRow, col: meioCol } } : c
      )
    )
    setAnimTimer(() => {
      setCharacters(prev =>
        prev.map(c =>
          c.id === atacante.id ? { ...c, posicao: origem } : c
        )
      )
      setAnimTimer(() => {
        if (onFinalizar) onFinalizar()
        else aposAnimacaoAtaque(atacante, alvo, resultado)
      }, 200)
    }, 300)
  }

  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
    const origem = atacante.posicao
    const destino = alvo.posicao
    const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
    setProjectilePath(steps)
    let stepIdx = 0
    function avancarProjetil() {
      if (stepIdx >= steps.length) {
        setProjectilePos(null)
        setProjectilePath([])
        if (onFinalizar) onFinalizar()
        else aposAnimacaoAtaque(atacante, alvo, resultado)
        return
      }
      setProjectilePos({ row: steps[stepIdx].row, col: steps[stepIdx].col })
      setProjectilePath(prev => prev.filter((_, i) => i > 0))
      stepIdx++
      setAnimTimer(avancarProjetil, 320)
    }
    avancarProjetil()
  }

  function aposAnimacaoAtaque(atacante, alvo, resultado) {
    setProjectilePos(null)
    clearAnimTimers()
    if (resultado.criticoDefensivo) {
      addLog(`  🛡️ ${t('prototype.arena_testbed.log_blocked')}`)
      adicionarBalao(alvo.id, 'CRÍTICO DEF!', 'block', alvo.posicao?.row, alvo.posicao?.col)
    } else {
      const danoFinal = Math.max(1, resultado.dano || 1)
      aplicarDano(alvo.id, danoFinal, atacante)
      addLog(`  💥 ${alvo.nome} recebeu ${danoFinal} de dano!`)
    }
    if (resultado.criticoDefensivo) {
      adicionarFloatTexto(alvo.id, t('prototype.arena_testbed.float_blocked'), '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
    }
    if (resultado.criticoDefensivo) {
      setAnimTimer(() => {
        const contra = resolverContraAtaque(alvo, atacante, resultado.fa / 2)
        contra.logs.forEach(l => addLog(`  ↺ ${l}`))
        if (contra.dano > 0) {
          aplicarDano(atacante.id, contra.dano, alvo)
          adicionarFloatTexto(atacante.id, t('prototype.arena_testbed.float_contra'), '#ff8800', atacante.posicao?.row, atacante.posicao?.col)
          addLog(`  ${atacante.nome} recebe ${contra.dano} de dano do contra-ataque!`)
        }
        if (resultado.ataqueExtra) {
          setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
        } else {
          setAnimTimer(() => {
            const hpAtacante = charsRef.current.find(c => c.id === atacante.id)?.hp ?? 0
            if (hpAtacante <= 0) {
              charsRef.current = charsRef.current.map(c =>
                c.id === atacante.id ? { ...c, vivo: false } : c
              )
              setCharacters(charsRef.current)
              setTurnOrder(prev => prev.filter(id => id !== atacante.id))
              addLog(`💀 ${atacante.nome} foi derrotado pelo contra-ataque!`)
              setAnimating(false)
              animatingRef.current = false
              if (!verificarVitoria()) finalizarTurno()
            } else {
              finalizarAposAtaque(alvo, resultado)
            }
          }, 400)
        }
      }, 500)
    } else {
      if (resultado.ataqueExtra) {
        setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
      } else {
        setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
      }
    }
  }

  function adicionarFloatTexto(charId, texto, cor, row, col) {
    let tipo = 'block'
    if (cor === '#ffcc00') tipo = 'extra'
    else if (cor === '#ff8800') tipo = 'contra'
    else if (cor === '#4488ff') tipo = 'block'
    adicionarBalao(charId, texto, tipo, row, col)
  }

  function executarAtaque(target) {
    if (!currentChar || animating) return
    clearAnimTimers()
    animatingRef.current = true
    setAnimating(true)
    setAttackCells([])

    let atacanteFinal = currentChar
    const poderesAtivos = getPoderesPorId(poderesEscolhidos[currentChar.id] || currentChar.poderesEscolhidos || [])

    if (powerAttackMode) {
      const poder = poderesAtivos.find(p => p.gatilho === 'ataque')
      if (poder && currentChar.mp >= poder.custoMP) {
        setCharacters(prev => prev.map(c =>
          c.id === currentChar.id ? { ...c, mp: c.mp - poder.custoMP } : c
        ))
        if (poder.efeito.atributo === 'fa') {
          atacanteFinal = { ...currentChar, forca: currentChar.forca + poder.efeito.bonus }
        } else if (poder.efeito.atributo === 'pdf') {
          atacanteFinal = { ...currentChar, pdf: currentChar.pdf + poder.efeito.bonus }
        }
        addLog(`⚡ ${currentChar.nome} usou ${poder.nome_pt}!`)
      }
      setPowerAttackMode(false)
    }

    const d6Val = rolarD6()
    setD6Result(d6Val)
    const dist = distanciaHex(currentChar.posicao, target.posicao)
    const resultado = resolverAtaque(atacanteFinal, target, Math.ceil(dist))
    addLog(`⚔️ ${currentChar.nome} ataca ${target.nome}!`)
    resultado.logs.forEach(l => addLog(`  ${l}`))
    if (currentChar.tipoAtaque === 'melee') {
      animarAtaqueMelee(currentChar, target, resultado)
    } else {
      animarAtaqueProjetil(currentChar, target, resultado)
    }
  }
  executarAtaqueRef.current = executarAtaque

  function handleAtaqueExtra(atacante, alvo, faBase) {
    const faExtra = Math.round((faBase / 2) * 10) / 10
    addLog(`⚡ ATAQUE EXTRA! FA = ${faExtra}`)
    adicionarFloatTexto(atacante.id, t('prototype.arena_testbed.float_extra'), '#ffcc00', atacante.posicao?.row, atacante.posicao?.col)

    const d6Def = rolarD6()
    const isCriticoDefExtra = d6Def === 6
    const fd = calcularFD(alvo, isCriticoDefExtra, d6Def)
    addLog(`  🎲 ${alvo.nome} FD extra: ARM=${alvo.arm} AGI=${alvo.agi} d6=${d6Def}${isCriticoDefExtra ? ' [CRÍTICO DEFENSIVO]' : ''} → FD=${fd}`)

    if (isCriticoDefExtra) {
      addLog(`  🛡️ ${alvo.nome} defendeu criticamente o ataque extra!`)
      adicionarFloatTexto(alvo.id, t('prototype.arena_testbed.float_blocked'), '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
      finalizarAposAtaque(alvo, { dano: 0 })
    } else {
      const danoExtra = Math.max(1, Math.round(faExtra - fd))
      addLog(`  💥 Dano extra: ${danoExtra}`)
      aplicarDano(alvo.id, danoExtra, atacante)
      finalizarAposAtaque(alvo, { dano: danoExtra })
    }
  }

  function finalizarAposAtaque(alvo, resultado) {
    setAnimating(false)
    animatingRef.current = false
    setD6Result(null)
    clearAnimTimers()

    if (winnerRef.current) return

    const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
    if (hpAtual <= 0) {
      charsRef.current = charsRef.current.map(c =>
        c.id === alvo.id ? { ...c, vivo: false } : c
      )
      setCharacters(charsRef.current)
      setTurnOrder(prev => prev.filter(id => id !== alvo.id))
      addLog(`💀 ${alvo.nome} foi derrotado!`)
      setAnimTimer(() => {
        if (verificarVitoria()) return
        // Não finalizar turno — devolver controle ao jogador com atacou:true
        setTurnoAcoes(prev => ({ ...prev, atacou: true }))
        setSubPhase('free')
        setHighlightedCells([])
        setAttackCells([])
        setRangeCells([])
        anunciar(t('prototype.arena_testbed.announce_player_turn'))
      }, 300)
    } else {
      setTurnoAcoes(prev => ({ ...prev, atacou: true }))
      setSubPhase('free')
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
      anunciar(t('prototype.arena_testbed.announce_player_turn'))
    }
  }

  function usarItem(tipo) {
    if (!currentChar || animating) return
    const key = tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'
    const qty = currentChar.inventario?.[key] || 0
    if (qty <= 0) return
    setCharacters(prev =>
      prev.map(c => {
        if (c.id !== currentChar.id) return c
        const newQty = (c.inventario?.[key] || 0) - 1
        const max = tipo === 'hp' ? c.hpMax : c.mpMax
        const newVal = Math.min(max, (tipo === 'hp' ? c.hp : c.mp) + 5)
        return {
          ...c,
          [tipo === 'hp' ? 'hp' : 'mp']: newVal,
          inventario: { ...c.inventario, [key]: newQty },
        }
      })
    )
    addLog(`💊 ${currentChar.nome} usou Poção ${tipo === 'hp' ? 'HP' : 'MP'}! (+5)`)
    finalizarTurno()
  }

  function verificarVitoria() {
    const chars = charsRef.current
    const pVivos = chars.filter(c => c.vivo && c.time === 'jogador')
    const iVivos = chars.filter(c => c.vivo && c.time === 'ia')
    if (pVivos.length === 0) {
      winnerRef.current = 'ia'
      setWinner('ia')
      setPhase('resultado')
      anunciar(t('prototype.arena_testbed.announce_defeat'), 3000, 'ia')
      addLog('🏆 IA venceu a partida!')
      return true
    }
    if (iVivos.length === 0) {
      winnerRef.current = 'jogador'
      setWinner('jogador')
      setPhase('resultado')
      anunciar(t('prototype.arena_testbed.announce_victory'), 3000, 'vitoria')
      addLog('🏆 Jogador venceu a partida!')
      return true
    }
    return false
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
    setAnimating(false)
    if (verificarVitoria()) return
    setSubPhase(null)
    const order = orderRef.current
    const turnIdx = turnRef.current
    const nextIdx = (turnIdx + 1) % order.length
    const nextId = order[nextIdx]
    const chars = charsRef.current
    const nextChar = chars.find(c => c.id === nextId)
    setCurrentTurn(nextIdx)
    if (nextChar?.time === 'ia') {
      setPhase('enemy_turn')
      anunciar(t('prototype.arena_testbed.announce_ia_turn'), 1500, 'ia')
      setTimeout(() => executarIA(nextChar), 1000)
    } else if (nextChar) {
      logEstadoTurno('finalizarTurno', order, nextIdx)
      setPhase(null)
      setTurnoAcoes({ moveu: false, atacou: false })
      setSubPhase('free')
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
      anunciar(t('prototype.arena_testbed.announce_player_turn'))
      setTimeout(() => {
        anunciar(t('prototype.arena_testbed.free_hint'), 2500)
      }, 2200)
    }
  }

  function executarIA(iaChar) {
    setIaThinking(true)
    iaThinkingRef.current = true
    console.log(`[IA:inicio] iaChar=${iaChar.nome} winnerRef=${winnerRef.current}`)
    addLog(`🤖 Turno da IA: ${iaChar.nome}`)
    setAnimTimer(() => {
      const charsAgora = charsRef.current
      const iaAtual = charsAgora.find(c => c.id === iaChar.id)
      if (!iaAtual || !iaAtual.vivo) {
        iaThinkingRef.current = false
        setIaThinking(false)
        finalizarTurno()
        return
      }
      addLog(`  ${iaChar.nome} — Fase: Movimento`)
      const inimigos = charsAgora.filter(c => c.vivo && c.time === 'jogador')
      const movIA = getCasasMovimento(iaAtual.agi, agiUmPraUm)
      const moveCells = getCelulasAlcance(
        iaAtual.posicao.row, iaAtual.posicao.col,
        movIA, cols, rows, obstaculos
      )
      setHighlightedCells(moveCells)
      const dec = decidirAcaoIA(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual)
      setAnimTimer(() => {
        setHighlightedCells([])
        if (dec.tipo === 'andar') {
          const destino = { row: dec.detalhes.row, col: dec.detalhes.col }
          setAttackCells([destino])
          const origem = iaAtual.posicao
          const ocupadasIA = new Set(
            charsAgora
              .filter(c => c.vivo && c.id !== iaChar.id)
              .map(c => `${c.posicao.row}_${c.posicao.col}`)
          )
          const caminho = encontrarCaminho(
            origem.row, origem.col, destino.row, destino.col,
            cols, rows, obstaculos, ocupadasIA
          )
          const steps = caminho ? caminho.slice(1) : [destino]
          let stepIdx = 0
          function avancarPassoIA() {
            if (stepIdx >= steps.length) {
              setAttackCells([])
              dec.logs.forEach(l => addLog(`  ${l}`))
              setAnimTimer(acaoIA, 300)
              return
            }
            const passo = steps[stepIdx]
            trailRef.current = [...trailRef.current, { row: passo.row, col: passo.col, alpha: 1.0 }]
            setCharacters(prev =>
              prev.map(c => c.id === iaChar.id ? { ...c, posicao: { row: passo.row, col: passo.col } } : c)
            )
            stepIdx++
            setAnimTimer(avancarPassoIA, 150)
          }
          setAnimTimer(avancarPassoIA, 400)
        } else {
          addLog(`  ${iaChar.nome} não se moveu.`)
          setAnimTimer(acaoIA, 1000)
        }
      }, 1800)
    }, 1500)

    function acaoIA() {
      const charsAgora2 = charsRef.current
      const iaAtual2 = charsAgora2.find(c => c.id === iaChar.id)
      if (!iaAtual2 || !iaAtual2.vivo) {
        iaThinkingRef.current = false
        setIaThinking(false)
        finalizarTurno()
        return
      }
      addLog(`  ${iaChar.nome} — Fase: Ação`)
      const inimigos2 = charsAgora2.filter(c => c.vivo && c.time === 'jogador')
      const dec2 = decidirAcaoIA(iaAtual2, inimigos2, charsAgora2, obstaculos, cols, rows, itensChaoAtual)
      console.log(`[IA:acao] tipo=${dec2.tipo} podeAtacar=${dec2.tipo === 'atacar'} iaPos=(${iaAtual2.posicao?.row},${iaAtual2.posicao?.col}) alvo=${dec2.detalhes?.alvo?.nome} alvoPos=(${dec2.detalhes?.alvo?.posicao?.row},${dec2.detalhes?.alvo?.posicao?.col})`)
      if (dec2.tipo === 'atacar') {
        const alvo = dec2.detalhes.alvo
        const res = dec2.detalhes.resultado
        const isMiss = dec2.detalhes.miss === true
        const atacante = iaAtual2
        const alcanceMaxIA = atacante.tipoAtaque === 'melee' ? 1 : atacante.pdf
        const rangeCellsIA = getCelulasAtaque(
          atacante.posicao.row, atacante.posicao.col,
          atacante.tipoAtaque, cols, rows,
          alcanceMaxIA, obstaculos
        )
        setRangeCells(rangeCellsIA)
        setAttackCells([])
        const callbackFinal = () => {
          if (winnerRef.current) { finalizarTurnoIA(); return }
          setProjectilePos(null)
          setProjectilePath([])

          if (isMiss) {
            adicionarBalao(alvo.id, 'MISS!', 'miss', alvo.posicao?.row, alvo.posicao?.col)
            finalizarTurnoIA()
            return
          }

          if (res.criticoDefensivo) {
            addLog(`  🛡️ ${t('prototype.arena_testbed.log_blocked')}`)
            adicionarFloatTexto(atacante.id, t('prototype.arena_testbed.float_blocked'), '#4488ff', atacante.posicao?.row, atacante.posicao?.col)
            adicionarBalao(atacante.id, 'CRÍTICO DEF!', 'block', atacante.posicao?.row, atacante.posicao?.col)
          } else {
            const danoBase = Math.max(1, res.dano || 1)
            const danoFinal = Math.max(1, danoBase - defesaBonusRef.current)
            defesaBonusRef.current = 0
            if (danoFinal < danoBase) addLog(`  🛡️ Defesa+2 reduziu dano: ${danoBase} → ${danoFinal}`)
            aplicarDano(alvo.id, danoFinal, atacante)
            addLog(`  💥 ${alvo.nome} recebeu ${danoFinal} de dano!`)
          }
          const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
          if (hpAtual <= 0) {
            charsRef.current = charsRef.current.map(c =>
              c.id === alvo.id ? { ...c, vivo: false } : c
            )
            setCharacters(charsRef.current)
            setTurnOrder(prev => prev.filter(id => id !== alvo.id))
            addLog(`💀 ${alvo.nome} foi derrotado!`)
            setAnimTimer(() => {
              if (verificarVitoria()) return
              finalizarTurnoIA()
            }, 300)
          } else {
            finalizarTurnoIA()
          }
        }
        // Check if target player has defense power
        const podeDefesa = alvo.time === 'jogador' && charsRef.current.find(c => c.id === alvo.id)?.mp >= 3 && temPoderDisponivel(alvo, poderesEscolhidos, 'defesa', 3)
        function mostrarBannerAtaqueIA() {
          const bannerText = `${atacante.nome} ${t('prototype.arena_testbed.ia_attack_banner')}`
          setAttackBanner({ texto: bannerText })
          setTimeout(() => setAttackBanner(null), 1500)
        }
        function iniciarAnimacaoAtaqueIA() {
          setAnimTimer(() => {
            setRangeCells([])
            setAttackCells([{ row: alvo.posicao.row, col: alvo.posicao.col }])
            setAnimTimer(() => {
              setRangeCells([])
              setAttackCells([])
              addLog(`  ${atacante.nome} ataca ${alvo.nome}!`)
              dec2.logs.forEach(l => addLog(`  ${l}`))
              if (atacante.tipoAtaque === 'melee') {
                animarAtaqueMelee(atacante, alvo, res, callbackFinal)
              } else {
                animarAtaqueProjetil(atacante, alvo, res, callbackFinal)
              }
            }, 700)
          }, 1200)
        }
        if (podeDefesa) {
          mostrarBannerAtaqueIA()
          setDefensePending({
            alvo,
            atacante,
            faBruto: res.fa,
            onResolve: (bonus) => {
              defesaBonusRef.current = bonus
              if (bonus > 0) {
                setCharacters(prev => prev.map(c =>
                  c.id === alvo.id ? { ...c, mp: c.mp - 3 } : c
                ))
                addLog(`🛡️ ${alvo.nome} usou Defesa+2! (-3 MP)`)
              }
              iniciarAnimacaoAtaqueIA()
            },
          })
        } else {
          mostrarBannerAtaqueIA()
          defesaBonusRef.current = 0
          iniciarAnimacaoAtaqueIA()
        }
      } else {
        dec2.logs.forEach(l => addLog(`  ${l}`))
        setAnimTimer(finalizarTurnoIA, 500)
      }
    }

    function finalizarTurnoIA() {
      setProjectilePos(null)
      setProjectilePath([])
      addLog(`  ✅ ${iaChar.nome} finalizou o turno.`)
      if (verificarVitoria()) {
        iaThinkingRef.current = false
        setIaThinking(false)
        return
      }
      const order3 = orderRef.current
      const turnIdx3 = turnRef.current
      const nextIdx3 = (turnIdx3 + 1) % order3.length
      const nextId3 = order3[nextIdx3]
      const chars3 = charsRef.current
      const nextChar3 = chars3.find(c => c.id === nextId3)
      setCurrentTurn(nextIdx3)
      if (nextChar3?.time === 'ia') {
        setPhase('enemy_turn')
        setAnimTimer(() => executarIA(nextChar3), 1800)
      } else if (nextChar3) {
        logEstadoTurno('finalizarTurnoIA', order3, nextIdx3)
        setPhase(null)
        setTurnoAcoes({ moveu: false, atacou: false })
        setSubPhase('free')
        setHighlightedCells([])
        setAttackCells([])
        setRangeCells([])
        iaThinkingRef.current = false
        setIaThinking(false)
        anunciar(t('prototype.arena_testbed.announce_player_turn'))
        setTimeout(() => {
          anunciar(t('prototype.arena_testbed.free_hint'), 2500)
        }, 2200)
      } else {
        iaThinkingRef.current = false
        setIaThinking(false)
      }
    }
  }

  function addLog(text) {
    setBattleLog(prev => [...prev, { text, time: Date.now() }])
  }

  if (phase === 'resultado' && winner) {
    return (
      <div className="atb-result">
        <div className="atb-result-card">
          <h2>{winner === 'jogador'
            ? t('prototype.arena_testbed.victory_player')
            : t('prototype.arena_testbed.victory_ia')}
          </h2>
          <p className="atb-result-sub">{t('prototype.arena_testbed.match_over')}</p>
          <button className="atb-btn atb-btn-primary" onClick={onBackToPhase1}>
            {t('prototype.arena_testbed.play_again')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {orderingPhase === 'player_internal' && (
        <div className="atb-ordering-overlay">
          <div className="atb-ordering-modal">
            <div className="atb-ordering-title">ORDEM DE ATAQUE — SEU TIME</div>
            <div className="atb-ordering-subtitle">
              Reordene os personagens com mesma AGI usando as setas
            </div>
            <div className="atb-ordering-list">
              {playerTeamOrder.map((ch, idx) => {
                const prevSameAgi = idx > 0 && playerTeamOrder[idx - 1].agi === ch.agi
                const nextSameAgi = idx < playerTeamOrder.length - 1 && playerTeamOrder[idx + 1].agi === ch.agi
                const isMovable = prevSameAgi || nextSameAgi
                return (
                  <div key={ch.id} className={`atb-ordering-row ${isMovable ? 'movable' : 'locked'}`}>
                    <div className="atb-ordering-position">{idx + 1}º</div>
                    <div className="atb-ordering-name">{ch.nome}</div>
                    <div className="atb-ordering-agi">AGI {ch.agi}</div>
                    <div className="atb-ordering-arrows">
                      <button
                        className="atb-ordering-btn"
                        disabled={!isMovable || idx === 0 || playerTeamOrder[idx - 1].agi !== ch.agi}
                        onClick={() => {
                          const novo = [...playerTeamOrder]
                          ;[novo[idx - 1], novo[idx]] = [novo[idx], novo[idx - 1]]
                          setPlayerTeamOrder(novo)
                        }}
                      >▲</button>
                      <button
                        className="atb-ordering-btn"
                        disabled={!isMovable || idx === playerTeamOrder.length - 1 || playerTeamOrder[idx + 1].agi !== ch.agi}
                        onClick={() => {
                          const novo = [...playerTeamOrder]
                          ;[novo[idx], novo[idx + 1]] = [novo[idx + 1], novo[idx]]
                          setPlayerTeamOrder(novo)
                        }}
                      >▼</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="atb-ordering-confirm" onClick={confirmarOrdemInterna}>
              ✓ CONFIRMAR ORDEM
            </button>
          </div>
        </div>
      )}
    <div className={`atb-root ${shaking ? 'atb-shake' : ''}`}>
      {flashDmg && <div className="atb-flash-overlay" />}
      {jokenpoNeeded && (
        <JokenpoModal
          player1Name={jokenpoNeeded[0]?.nome || '?'}
          player2Name={jokenpoNeeded[1]?.nome || '?'}
          onResult={handleJokenpoResult}
        />
      )}

      {powerChoiceModal && (
        <PowerChoiceModal
          mode={powerChoiceModal.mode}
          charName={powerChoiceModal.charName}
          opcoes={powerChoiceModal.opcoes}
          onEscolher={(op) => {
            if (powerChoiceModal.mode === 'ataque') {
              confirmarEscolhaAtaque(op)
            }
          }}
        />
      )}

      {turnAnnouncement && (
        <div className="atb-announcement-overlay">
          <div className={`atb-announcement-text ${announcementClass}`}>
            {turnAnnouncement}
          </div>
        </div>
      )}

      {defensePending && (() => {
        const poderesDefesa = getPoderesPorId(poderesEscolhidos[defensePending.alvo.id] || defensePending.alvo.poderesEscolhidos || [])
          .filter(p => p.gatilho === 'defesa' && defensePending.alvo.mp >= p.custoMP)
        const opcoes = [
          { rotulo: t('prototype.arena_testbed.pcm_sem_poder'), poderId: null, custoMP: 0, disponivel: true },
          ...poderesDefesa.map(p => ({
            rotulo: `${p.nome_pt} (-${p.custoMP} MP)`,
            poderId: p.id,
            custoMP: p.custoMP,
            disponivel: true,
          })),
        ]
        return (
          <PowerChoiceModal
            mode="defesa"
            charName={defensePending.alvo.nome}
            faBruto={defensePending.faBruto}
            opcoes={opcoes}
            onEscolher={(op) => {
              setDefensePending(null)
              const bonus = op.poderId ? 2 : 0
              defesaBonusRef.current = bonus
              if (bonus > 0) {
                setCharacters(prev => prev.map(c =>
                  c.id === defensePending.alvo.id ? { ...c, mp: c.mp - 3 } : c
                ))
                addLog(`🛡️ ${defensePending.alvo.nome} usou Defesa+2! (-3 MP)`)
              }
              defensePending.onResolve(bonus)
            }}
          />
        )
      })()}

      {danoPopup && (
        <div className="atb-dano-popup" key={danoPopup.key}>
          <div className="atb-dano-popup-num">-{danoPopup.dano}</div>
        </div>
      )}

      {attackBanner && (
        <div className="atb-attack-banner">
          <div className="atb-attack-banner-text">{attackBanner.texto}</div>
        </div>
      )}

      {actionPanel && isPlayerTurn && subPhase === 'free' && currentChar && (
        <div className="atb-action-panel">
          <div className="atb-action-panel-name">{currentChar.nome}</div>
          <button
            className="atb-action-panel-btn"
            disabled={turnoAcoes.moveu}
            onClick={() => { setActionPanel(false); iniciarMovimento() }}
          >
            👟 {t('prototype.arena_testbed.btn_move')}
          </button>
          <button
            className="atb-action-panel-btn atb-action-panel-btn--attack"
            disabled={turnoAcoes.atacou}
            onClick={() => { setActionPanel(false); escolherTipoAtaque() }}
          >
            ⚔ {t('prototype.arena_testbed.btn_attack')}
          </button>
          {currentChar?.inventario?.pocaoHP > 0 && (
            <button
              className="atb-action-panel-btn atb-action-panel-btn--hp"
              onClick={() => { setActionPanel(false); usarItem('hp') }}
            >
              ❤ ×{currentChar.inventario.pocaoHP}
            </button>
          )}
          {currentChar?.inventario?.pocaoMP > 0 && (
            <button
              className="atb-action-panel-btn atb-action-panel-btn--mp"
              onClick={() => { setActionPanel(false); usarItem('mp') }}
            >
              💧 ×{currentChar.inventario.pocaoMP}
            </button>
          )}
        </div>
      )}

      <div className="atb-top-bar">
        <button className="atb-top-back" onClick={onBackToPhase1}>←</button>
        <div className="atb-top-info">
          <span className={`atb-top-turn ${currentChar?.time === 'ia' ? 'enemy' : 'player'}`}>
            {currentChar
              ? `${t('prototype.arena_testbed.turn_of')} ${currentChar.nome}`
              : t('prototype.arena_testbed.preparing_battle')}
            {isPlayerTurn && subPhase && (
              <span className="atb-top-subphase"> · {subPhaseLabel}</span>
            )}
            {iaThinking && ` · ${t('prototype.arena_testbed.ia_thinking_short')}`}
          </span>
        </div>
        <button className="atb-top-log-btn" onClick={() => setLogDrawerOpen(true)}>≡</button>
      </div>

      <div className="atb-canvas-wrap" ref={canvasContainerRef}>
        <canvas ref={canvasRef} className="atb-canvas" onClick={handleCanvasClick} onTouchEnd={handleTouch} />
        <div className="atb-balloon-container">
          {balloons.map(b => (
            <div
              key={b.key}
              className={`atb-balloon atb-balloon--${b.tipo}`}
              style={{ '--x': `${b.x}px`, '--y': `${b.y}px` }}
            >
              {b.texto}
            </div>
          ))}
        </div>
      </div>

      <div className="atb-hud">
        {characters.filter(c => c.vivo).map(ch => {
          const isActive = ch.id === currentChar?.id
          const hpAntigo = hpAnterior[ch.id] ?? ch.hp
          const hpPct = (ch.hp / ch.hpMax) * 100
          const antigoPct = (hpAntigo / ch.hpMax) * 100
          const perdeuHP = hpAntigo > ch.hp
          return (
            <div
              key={ch.id}
              className={`atb-hud-chip ${isActive ? 'atb-hud-chip--active' : ''}`}
              onClick={() => setCharModal(ch)}
            >
              <div className={`atb-hud-dot ${ch.time}`} />
              <div className="atb-hud-info">
                <div className="atb-hud-name">{ch.nome}</div>
                <div className="atb-hud-bars">
                  <div className="atb-hud-bar-row">
                    <div className="atb-hud-bar-track">
                      {perdeuHP && <div className="atb-hud-bar-fill hp-delta" style={{ '--pct': `${antigoPct}%` }} />}
                      <div className="atb-hud-bar-fill hp" style={{ '--pct': `${hpPct}%` }} />
                    </div>
                  </div>
                  <div className="atb-hud-bar-row">
                    <div className="atb-hud-bar-track">
                      <div className="atb-hud-bar-fill mp" style={{ '--pct': `${(ch.mp / ch.mpMax) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="atb-bottom-nav">
        {isPlayerTurn && !iaThinking ? (
          <>
            {subPhase === 'free' && (
              <button className="atb-action-btn atb-action-btn--end-turn" onClick={finalizarTurno}>
                ⏭ {t('prototype.arena_testbed.end_turn')}
              </button>
            )}

            {subPhase === 'movimento' && (
              <>
                {pendingMove ? (
                  <>
                    <button className="atb-action-btn atb-action-btn--confirm" onClick={confirmarMovimento}>
                      ✓ {t('prototype.arena_testbed.btn_confirm_move')}
                    </button>
                    <button className="atb-action-btn atb-action-btn--cancel" onClick={cancelarAcao}>
                      ✕ {t('prototype.arena_testbed.btn_cancel')}
                    </button>
                  </>
                ) : null}
              </>
            )}

            {subPhase === 'acao' && subPhaseStep === 'escolher_alvo' && (
              <>
                <button className="atb-action-btn atb-action-btn--cancel" onClick={cancelarAcao}>
                  × {t('prototype.arena_testbed.btn_cancel')}
                </button>
              </>
            )}
          </>
        ) : (
          <div className="atb-ia-thinking-row">
            <span className="atb-ia-dots">{t('prototype.arena_testbed.ia_thinking')}</span>
          </div>
        )}
      </div>

      {logDrawerOpen && (
        <div className="atb-drawer-overlay" onClick={() => setLogDrawerOpen(false)}>
          <div className="atb-drawer" onClick={e => e.stopPropagation()}>
            <div className="atb-drawer-handle" />
            <div className="atb-drawer-title">{t('prototype.arena_testbed.battle_log')}</div>
            <div className="atb-drawer-list" ref={drawerListRef}>
              {battleLog.slice(-30).map((entry, i) => (
                <div key={i} className="atb-drawer-entry">{entry.text}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {charModal && (
        <div className="atb-modal-overlay" onClick={() => setCharModal(null)}>
          <div className="atb-modal" onClick={e => e.stopPropagation()}>
            <div className="atb-modal-header">
              <div className={`atb-modal-dot ${charModal.time}`} />
              <span className="atb-modal-name">{charModal.nome}</span>
              <button className="atb-modal-close" onClick={() => setCharModal(null)}>✕</button>
            </div>
            <div className="atb-modal-body">
              <div className="atb-modal-stat">
                <span className="atb-modal-stat-label hp">{t('prototype.arena_testbed.label_hp')}</span>
                <div className="atb-modal-bar-track">
                  <div className="atb-modal-bar-fill hp" style={{ '--pct': `${(charModal.hp / charModal.hpMax) * 100}%` }} />
                </div>
                <span className="atb-modal-stat-val">{Math.ceil(charModal.hp)}/{charModal.hpMax}</span>
              </div>
              <div className="atb-modal-stat">
                <span className="atb-modal-stat-label mp">{t('prototype.arena_testbed.label_mp')}</span>
                <div className="atb-modal-bar-track">
                  <div className="atb-modal-bar-fill mp" style={{ '--pct': `${(charModal.mp / charModal.mpMax) * 100}%` }} />
                </div>
                <span className="atb-modal-stat-val">{Math.ceil(charModal.mp)}/{charModal.mpMax}</span>
              </div>
              <div className="atb-modal-attr-row">
                <span>{t('prototype.arena_testbed.attr_forca')}: {charModal.forca}</span>
                <span>{t('prototype.arena_testbed.attr_agi')}: {charModal.agi}</span>
                <span>{t('prototype.arena_testbed.attr_dex')}: {charModal.dex}</span>
              </div>
              <div className="atb-modal-attr-row">
                <span>{t('prototype.arena_testbed.attr_pdf')}: {charModal.pdf}</span>
                <span>{t('prototype.arena_testbed.attr_res')}: {charModal.res}</span>
                <span>{t('prototype.arena_testbed.attr_arm')}: {charModal.arm}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
