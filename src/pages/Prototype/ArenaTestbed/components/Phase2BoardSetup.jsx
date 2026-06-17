import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import './Phase2BoardSetup.css'

const SQRT3 = Math.sqrt(3)

function hexCorner(center, size, i) {
  const angle = (Math.PI / 180) * (60 * i)
  return {
    x: center.x + size * Math.cos(angle),
    y: center.y + size * Math.sin(angle),
  }
}

function drawHex(ctx, center, size, fill, stroke, lineWidth = 1) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const p = hexCorner(center, size, i)
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  }
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

function hexCenter(row, col, padX, padY, size) {
  const w = size * 1.5
  const h = size * SQRT3
  const offsetY = col % 2 === 0 ? 0 : h / 2
  return {
    x: padX + col * w,
    y: padY + row * h + offsetY,
  }
}

function pixelToHex(px, py, cols, rows, padX, padY, size) {
  const w = size * SQRT3
  const h = size * 1.5
  let closest = null
  let closestDist = Infinity
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const c = hexCenter(row, col, padX, padY, size)
      const dist = Math.sqrt((px - c.x) ** 2 + (py - c.y) ** 2)
      if (dist < closestDist && dist < size) {
        closestDist = dist
        closest = { row, col }
      }
    }
  }
  return closest
}

const OBSTACLE_TYPES = [
  { id: 1, labelKey: 'prototype.arena_testbed.obs1', icon: '🧱', nome: 'PAREDE' },
  { id: 2, labelKey: 'prototype.arena_testbed.obs2', icon: '🕳️', nome: 'BURACO' },
  { id: 3, labelKey: 'prototype.arena_testbed.obs3', icon: '🪤', nome: 'ARMADILHA' },
  { id: 4, labelKey: 'prototype.arena_testbed.obs4', icon: '📦', nome: 'CAIXA' },
]

export default function Phase2BoardSetup({ characters, onConfirm, onBack }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)

  const [cols, setCols] = useState(7)
  const [rows, setRows] = useState(11)
  const [boardChars, setBoardChars] = useState([])
  const [obstaculos, setObstaculos] = useState({})
  const [itensChao, setItensChao] = useState({})
  const [tool, setTool] = useState('select')
  const [selectedChar, setSelectedChar] = useState(null)
  const [hoveredCell, setHoveredCell] = useState(null)
  const [obs3HP, setObs3HP] = useState(1)
  const [obs3Effect, setObs3Effect] = useState('nenhum')
  const [obs4Movable, setObs4Movable] = useState(false)
  const [obs4Destructible, setObs4Destructible] = useState(false)

  useEffect(() => {
    const initial = characters.map((ch, idx) => {
      const assignedCol = ch.time === 'jogador' ? Math.floor(idx / 2) : cols - 1 - Math.floor(idx / 2)
      const assignedRow = ch.time === 'jogador' ? (idx % 2) * (rows - 1) : (idx % 2) * (rows - 1)
      return {
        charId: ch.id,
        nome: ch.nome,
        time: ch.time,
        row: assignedRow,
        col: assignedCol,
      }
    })
    setBoardChars(initial)
  }, [characters, cols, rows])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    const containerW = canvas.clientWidth
    const containerH = canvas.clientHeight

    const byWidth = Math.floor(containerW / (cols * 1.5 + 0.75))
    const byHeight = Math.floor(containerH / (rows * SQRT3 + SQRT3 * 0.5))
    const sz = Math.max(14, Math.min(40, Math.min(byWidth, byHeight)))

const gridW = (cols - 1) * sz * 1.5 + sz * 2
const gridH = (rows - 1) * sz * SQRT3 + sz * SQRT3

    const padX = Math.round((containerW - gridW) / 2)
    const padY = Math.round((containerH - gridH) / 2)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const center = hexCenter(row, col, padX, padY, sz)
        const key = `${row}_${col}`
        const obs = obstaculos[key]
        const item = itensChao[key]
        const ch = boardChars.find(c => c.row === row && c.col === col)

        let fill = '#0b0e20'
        let stroke = '#1a1e3a'

        if (obs) {
          fill = '#0a0a0a'
          stroke = '#333'
        } else if (item) {
          fill = item.tipo === 'hp' ? '#002211' : '#001133'
          stroke = item.tipo === 'hp' ? '#00ff88' : '#00eeff'
        }

        if (hoveredCell && hoveredCell.row === row && hoveredCell.col === col) {
          stroke = '#00eeff'
        }

        drawHex(ctx, center, sz, fill, stroke, stroke === '#00eeff' ? 2 : 1)

        if (obs) {
          ctx.fillStyle = '#fff'
          ctx.font = '16px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const obsType = OBSTACLE_TYPES.find(o => o.id === obs.tipo)
          ctx.fillText(obsType?.icon || '?', center.x, center.y)
        }

        if (item && !obs) {
          ctx.fillStyle = '#fff'
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(item.tipo === 'hp' ? '❤️' : '💙', center.x, center.y)
        }

        if (ch) {
          if (ch.time === 'jogador') {
            const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, sz * 0.7)
            grad.addColorStop(0, '#003322')
            grad.addColorStop(1, '#001a10')
            ctx.beginPath()
            ctx.arc(center.x, center.y, sz * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = grad
            ctx.fill()
            ctx.strokeStyle = '#00ff88'
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.fillStyle = '#00ff88'
            ctx.font = `bold ${sz * 0.38}px Orbitron, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(ch.nome.charAt(0).toUpperCase(), center.x, center.y)
          } else {
            const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, sz * 0.7)
            grad.addColorStop(0, '#330011')
            grad.addColorStop(1, '#1a0008')
            ctx.beginPath()
            ctx.arc(center.x, center.y, sz * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = grad
            ctx.fill()
            ctx.strokeStyle = '#ff2244'
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.fillStyle = '#ff2244'
            ctx.font = `bold ${sz * 0.38}px Orbitron, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(ch.nome.charAt(0).toUpperCase(), center.x, center.y)
          }
        }
      }
    }
  }, [cols, rows, boardChars, obstaculos, itensChao, hoveredCell])

  useEffect(() => { draw() }, [draw])

  const allPlaced = useMemo(() => {
    return boardChars.length === characters.length
  }, [boardChars, characters])

  const validPlacement = useMemo(() => {
    const playerChars = boardChars.filter(c => c.time === 'jogador')
    const iaChars = boardChars.filter(c => c.time === 'ia')
    const playerOK = playerChars.every(c => c.col < cols / 2)
    const iaOK = iaChars.every(c => c.col >= cols / 2)
    const occupied = new Set(boardChars.map(c => `${c.row}_${c.col}`))
    const noOverlap = occupied.size === boardChars.length
    return playerOK && iaOK && noOverlap && allPlaced
  }, [boardChars, cols, allPlaced])

  function handleTouch(e) {
    e.preventDefault()
    const touch = e.changedTouches[0]
    handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY })
  }

  function handleCanvasClick(e) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    const sz = Math.max(14, Math.min(40, Math.min(
      Math.floor(canvas.width / (cols * 1.5 + 0.75)),
      Math.floor(canvas.height / (rows * SQRT3 + SQRT3 * 0.5))
    )))
const gridW = (cols - 1) * sz * 1.5 + sz * 2
const gridH = (rows - 1) * sz * SQRT3 + sz * SQRT3
    const padX = Math.round((canvas.width - gridW) / 2)
    const padY = Math.round((canvas.height - gridH) / 2)
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, sz)
    if (!hex) return
    const { row, col } = hex
    const key = `${row}_${col}`

    if (tool === 'eraser') {
      setObstaculos(prev => { const n = { ...prev }; delete n[key]; return n })
      setItensChao(prev => { const n = { ...prev }; delete n[key]; return n })
      return
    }

    if (tool.startsWith('obs')) {
      const tipo = parseInt(tool.replace('obs', ''))
      if (boardChars.some(c => c.row === row && c.col === col)) return
      if (itensChao[key]) return
      setObstaculos(prev => ({
        ...prev,
        [key]: {
          tipo,
          hp: tipo === 3 ? obs3HP : undefined,
          efeito: tipo === 3 ? obs3Effect : undefined,
          movel: tipo === 4 ? obs4Movable : undefined,
          destrutivel: tipo === 4 ? obs4Destructible : undefined,
        },
      }))
      return
    }

    if (tool === 'item_hp' || tool === 'item_mp') {
      if (boardChars.some(c => c.row === row && c.col === col)) return
      if (obstaculos[key]) return
      const tipo = tool === 'item_hp' ? 'hp' : 'mp'
      setItensChao(prev => ({ ...prev, [key]: { tipo } }))
      return
    }

    if (tool === 'select') {
      const clickedChar = boardChars.find(c => c.row === row && c.col === col)
      if (clickedChar) {
        setSelectedChar(clickedChar)
      } else if (selectedChar) {
        if (boardChars.some(c => c.row === row && c.col === col)) return
        if (obstaculos[key]?.tipo === 1 || obstaculos[key]?.tipo === 2) return
        setBoardChars(prev =>
          prev.map(c =>
            c.charId === selectedChar.charId ? { ...c, row, col } : c
          )
        )
        setSelectedChar(null)
      }
      return
    }
  }

  function handleCanvasMove(e) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    const sz = Math.max(14, Math.min(40, Math.min(
      Math.floor(canvas.width / (cols * 1.5 + 0.75)),
      Math.floor(canvas.height / (rows * SQRT3 + SQRT3 * 0.5))
    )))
const gridW = (cols - 1) * sz * 1.5 + sz * 2
const gridH = (rows - 1) * sz * SQRT3 + sz * SQRT3
    const padX = Math.round((canvas.width - gridW) / 2)
    const padY = Math.round((canvas.height - gridH) / 2)
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, sz)
    setHoveredCell(hex)
  }

  function handleConfirm() {
    const finalBoard = {
      boardChars: boardChars.map(c => ({
        ...c,
        charData: characters.find(ch => ch.id === c.charId),
      })),
      obstaculos,
      itensChao,
      cols,
      rows,
    }
    onConfirm(finalBoard)
  }

  return (
    <div className="p2-root">
      <div className="p2-body">
        <div className="p2-left">
          <div>
            <span className="p2-section-label">FERRAMENTAS</span>
            <div className="p2-tool-grid two-col">
              <button
                className={`p2-tool-btn ${tool === 'select' ? 'active' : ''}`}
                onClick={() => setTool('select')}
              >
                <span className="p2-tool-icon">👆</span>
                SELECIONAR
              </button>
              <button
                className={`p2-tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                onClick={() => setTool('eraser')}
              >
                <span className="p2-tool-icon">🧹</span>
                APAGAR
              </button>
            </div>
          </div>

          <div>
            <span className="p2-section-label">OBSTÁCULOS</span>
            <div className="p2-tool-grid four-grid">
              {OBSTACLE_TYPES.map(ot => (
                <button
                  key={ot.id}
                  className={`p2-tool-btn ${tool === `obs${ot.id}` ? 'active' : ''}`}
                  onClick={() => setTool(`obs${ot.id}`)}
                >
                  <span className="p2-tool-icon">{ot.icon}</span>
                  {ot.nome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="p2-section-label">ITENS</span>
            <div className="p2-tool-grid two-col">
              <button
                className={`p2-tool-btn ${tool === 'item_hp' ? 'active' : ''}`}
                onClick={() => setTool('item_hp')}
              >
                <span className="p2-tool-icon">❤️</span>
                HP
              </button>
              <button
                className={`p2-tool-btn ${tool === 'item_mp' ? 'active' : ''}`}
                onClick={() => setTool('item_mp')}
              >
                <span className="p2-tool-icon">💧</span>
                MP
              </button>
            </div>
          </div>

          {tool === 'obs3' && (
            <div className="p2-tool-config">
              <label>
                <span>HP:</span>
                <select value={obs3HP} onChange={e => setObs3HP(Number(e.target.value))}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </label>
              <label>
                <span>EFEITO:</span>
                <select value={obs3Effect} onChange={e => setObs3Effect(e.target.value)}>
                  <option value="nenhum">NENHUM</option>
                  <option value="explosao">EXPLOSÃO</option>
                  <option value="congelamento">CONGELAMENTO</option>
                </select>
              </label>
            </div>
          )}

          {tool === 'obs4' && (
            <div className="p2-tool-config">
              <label className="p2-checkbox">
                <input type="checkbox" checked={obs4Movable} onChange={e => setObs4Movable(e.target.checked)} />
                MÓVEL
              </label>
              <label className="p2-checkbox">
                <input type="checkbox" checked={obs4Destructible} onChange={e => setObs4Destructible(e.target.checked)} />
                DESTRUÍVEL
              </label>
            </div>
          )}

          <div className="p2-chars-section">
            {boardChars.map(ch => (
              <div
                key={ch.charId}
                className={`p2-char-chip ${selectedChar?.charId === ch.charId ? 'selected' : ''}`}
                onClick={() => setSelectedChar(ch)}
              >
                <span className={`p2-char-team ${ch.time}`}>
                  {ch.time === 'jogador' ? '👤' : '🤖'}
                </span>
                <span>{ch.nome}</span>
                <span className="p2-char-pos">({ch.row},{ch.col})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p2-right">
          <div className="p2-canvas-wrap">
            <canvas
              ref={canvasRef}
              className="p2-canvas"
              onClick={handleCanvasClick}
              onTouchEnd={handleTouch}
              onMouseMove={handleCanvasMove}
              onMouseLeave={() => setHoveredCell(null)}
            />
          </div>

          <div className="p2-stepper-row">
            <div className="p2-stepper-group">
              <span className="p2-stepper-label">COLUNAS</span>
              <div className="p2-stepper">
                <button className="p2-stepper-btn" disabled={cols <= 1} onClick={() => setCols(c => Math.max(1, c - 1))}>−</button>
                <span className="p2-stepper-value">{cols}</span>
                <button className="p2-stepper-btn" disabled={cols >= 10} onClick={() => setCols(c => Math.min(10, c + 1))}>+</button>
              </div>
            </div>
            <div className="p2-stepper-group">
              <span className="p2-stepper-label">LINHAS</span>
              <div className="p2-stepper">
                <button className="p2-stepper-btn" disabled={rows <= 1} onClick={() => setRows(r => Math.max(1, r - 1))}>−</button>
                <span className="p2-stepper-value">{rows}</span>
                <button className="p2-stepper-btn" disabled={rows >= 15} onClick={() => setRows(r => Math.min(15, r + 1))}>+</button>
              </div>
            </div>
          </div>

          <div className="p2-footer">
            <button
              className="p2-btn-primary"
              disabled={!validPlacement}
              onClick={handleConfirm}
            >
              ⚔ INICIAR PARTIDA
            </button>
            {selectedChar && (
              <p className="p2-hint">CLIQUE NO TABULEIRO PARA POSICIONAR</p>
            )}
            {!validPlacement && !selectedChar && (
              <p className="p2-warning">POSICIONE JOGADORES À ESQUERDA E IA À DIREITA</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
