import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import './Phase2BoardSetup.css'

const SQRT3 = Math.sqrt(3)

function hexCorner(center, size, i) {
  const angle = (Math.PI / 180) * (60 * i - 30)
  return {
    x: center.x + size * Math.cos(angle),
    y: center.y + size * Math.sin(angle),
  }
}

function drawHex(ctx, center, size, fill, stroke, lineWidth = 1.5) {
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
  const w = size * SQRT3
  const h = size * 1.5
  const offsetX = row % 2 === 0 ? 0 : w / 2
  return {
    x: padX + col * w + offsetX,
    y: padY + row * h,
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
  { id: 1, labelKey: 'prototype.arena_testbed.obs1', color: '#555', icon: '🧱' },
  { id: 2, labelKey: 'prototype.arena_testbed.obs2', color: '#1a1a2e', icon: '🕳️' },
  { id: 3, labelKey: 'prototype.arena_testbed.obs3', color: '#8b4513', icon: '🪤' },
  { id: 4, labelKey: 'prototype.arena_testbed.obs4', color: '#6b5b3e', icon: '📦' },
]

export default function Phase2BoardSetup({ characters, onConfirm, onBack }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)

  const [cols, setCols] = useState(7)
  const [rows, setRows] = useState(11)
  const [boardChars, setBoardChars] = useState([]) // { id, row, col }
  const [obstaculos, setObstaculos] = useState({})
  const [itensChao, setItensChao] = useState({})
  const [tool, setTool] = useState('select') // 'select' | 'obs1'|'obs2'|'obs3'|'obs4' | 'item_hp'|'item_mp' | 'eraser'
  const [selectedChar, setSelectedChar] = useState(null)
  const [hoveredCell, setHoveredCell] = useState(null)
  const [hexSize, setHexSize] = useState(24)
  const [obs3HP, setObs3HP] = useState(1)
  const [obs3Effect, setObs3Effect] = useState('nenhum')
  const [obs4Movable, setObs4Movable] = useState(false)
  const [obs4Destructible, setObs4Destructible] = useState(false)

  // Inicializa posições dos personagens
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

    const w = hexSize * SQRT3
    const h = hexSize * 1.5
    const padX = hexSize * SQRT3
    const padY = hexSize * 1.5

    const canvasW = cols * w + w / 2 + padX * 2
    const canvasH = rows * h + h / 3 + padY * 2

    canvas.width = canvasW
    canvas.height = canvasH
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const center = hexCenter(row, col, padX, padY, hexSize)
        const key = `${row}_${col}`
        const obs = obstaculos[key]
        const item = itensChao[key]
        const ch = boardChars.find(c => c.row === row && c.col === col)

        let fill = '#1a1a2e'
        let stroke = '#2a2a4a'

        if (obs) {
          const obsType = OBSTACLE_TYPES.find(o => o.id === obs.tipo)
          fill = obsType?.color || '#555'
          stroke = '#444'
        } else if (item) {
          fill = item.tipo === 'hp' ? '#003322' : '#002244'
          stroke = item.tipo === 'hp' ? '#00cc44' : '#0088ff'
        }

        if (hoveredCell && hoveredCell.row === row && hoveredCell.col === col) {
          stroke = '#0af'
        }

        drawHex(ctx, center, hexSize, fill, stroke)

        // Ícone do obstáculo
        if (obs) {
          ctx.fillStyle = '#fff'
          ctx.font = '18px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const obsType = OBSTACLE_TYPES.find(o => o.id === obs.tipo)
          ctx.fillText(obsType?.icon || '?', center.x, center.y)
        }

        // Item no chão
        if (item && !obs) {
          ctx.fillStyle = '#fff'
          ctx.font = '16px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(item.tipo === 'hp' ? '❤️' : '💙', center.x, center.y)
        }

        // Personagem
        if (ch) {
          const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, hexSize * 0.7)
          if (ch.time === 'jogador') {
            gradient.addColorStop(0, '#00ff88')
            gradient.addColorStop(1, '#006633')
          } else {
            gradient.addColorStop(0, '#ff4444')
            gradient.addColorStop(1, '#991111')
          }
          ctx.beginPath()
          ctx.arc(center.x, center.y, hexSize * 0.55, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
          ctx.strokeStyle = ch.time === 'jogador' ? '#00ff88' : '#ff4444'
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.fillStyle = '#fff'
          ctx.font = `bold ${hexSize * 0.4}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(ch.nome.charAt(0).toUpperCase(), center.x, center.y)
        }

        // Grid label (small)
        if (!obs && !ch) {
          ctx.fillStyle = '#3a3a5a'
          ctx.font = '9px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(`${row},${col}`, center.x, center.y + hexSize * 0.15)
        }
      }
    }
  }, [cols, rows, boardChars, obstaculos, itensChao, hoveredCell, hexSize])

  useEffect(() => { draw() }, [draw])

  // Lateral zone validation
  const allPlaced = useMemo(() => {
    return boardChars.length === characters.length
  }, [boardChars, characters])

  // Check if chars are correctly placed (player left, IA right)
  const validPlacement = useMemo(() => {
    const playerChars = boardChars.filter(c => c.time === 'jogador')
    const iaChars = boardChars.filter(c => c.time === 'ia')

    // Player chars on left side (col < cols/2)
    const playerOK = playerChars.every(c => c.col < cols / 2)
    const iaOK = iaChars.every(c => c.col >= cols / 2)

    // No overlapping
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
    const w = hexSize * SQRT3
    const h = hexSize * 1.5
    const padX = hexSize * SQRT3
    const padY = hexSize * 1.5
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, hexSize)
    if (!hex) return

    const { row, col } = hex
    const key = `${row}_${col}`

    if (tool === 'eraser') {
      setObstaculos(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      setItensChao(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
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
      setItensChao(prev => ({
        ...prev,
        [key]: { tipo },
      }))
      return
    }

    if (tool === 'select') {
      const clickedChar = boardChars.find(c => c.row === row && c.col === col)
      if (clickedChar) {
        setSelectedChar(clickedChar)
      } else if (selectedChar) {
        // Move character to this cell if empty
        if (boardChars.some(c => c.row === row && c.col === col)) return
        if (obstaculos[key]?.tipo === 1 || obstaculos[key]?.tipo === 2) return
        setBoardChars(prev =>
          prev.map(c =>
            c.charId === selectedChar.charId
              ? { ...c, row, col }
              : c
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
    const w = hexSize * SQRT3
    const h = hexSize * 1.5
    const padX = hexSize * SQRT3
    const padY = hexSize * 1.5
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, hexSize)
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

  const unplacedChars = characters.filter(
    ch => !boardChars.some(bc => bc.charId === ch.id)
  )

  return (
    <div className="p2-root">
      <div className="p2-header">
        <h3>{t('prototype.arena_testbed.phase2_title')}</h3>
        <button className="p2-btn p2-btn-secondary" onClick={onBack}>
          ← {t('prototype.arena_testbed.back')}
        </button>
      </div>

      <div className="p2-body">
        {/* Toolbar */}
        <div className="p2-toolbar">
          <div className="p2-toolgroup">
            <span className="p2-toolgroup-label">{t('prototype.arena_testbed.tools')}</span>
            <button
              className={`p2-tool ${tool === 'select' ? 'active' : ''}`}
              onClick={() => setTool('select')}
              title={t('prototype.arena_testbed.tool_select')}
            >
              👆
            </button>
            <button
              className={`p2-tool ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title={t('prototype.arena_testbed.tool_eraser')}
            >
              🧹
            </button>
          </div>

          <div className="p2-toolgroup">
            <span className="p2-toolgroup-label">{t('prototype.arena_testbed.obstacles')}</span>
            {OBSTACLE_TYPES.map(ot => (
              <button
                key={ot.id}
                className={`p2-tool ${tool === `obs${ot.id}` ? 'active' : ''}`}
                onClick={() => setTool(`obs${ot.id}`)}
                title={t(ot.labelKey)}
              >
                {ot.icon}
              </button>
            ))}
          </div>

          <div className="p2-toolgroup">
            <span className="p2-toolgroup-label">{t('prototype.arena_testbed.items')}</span>
            <button
              className={`p2-tool ${tool === 'item_hp' ? 'active' : ''}`}
              onClick={() => setTool('item_hp')}
              title={t('prototype.arena_testbed.potion_hp')}
            >
              ❤️
            </button>
            <button
              className={`p2-tool ${tool === 'item_mp' ? 'active' : ''}`}
              onClick={() => setTool('item_mp')}
              title={t('prototype.arena_testbed.potion_mp')}
            >
              💙
            </button>
          </div>

          {/* Obstacle 3 config */}
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
                <span>{t('prototype.arena_testbed.effect')}:</span>
                <select value={obs3Effect} onChange={e => setObs3Effect(e.target.value)}>
                  <option value="nenhum">{t('prototype.arena_testbed.effect_none')}</option>
                  <option value="explosao">{t('prototype.arena_testbed.effect_explosion')}</option>
                  <option value="congelamento">{t('prototype.arena_testbed.effect_freeze')}</option>
                </select>
              </label>
            </div>
          )}

          {/* Obstacle 4 config */}
          {tool === 'obs4' && (
            <div className="p2-tool-config">
              <label className="p2-checkbox">
                <input type="checkbox" checked={obs4Movable} onChange={e => setObs4Movable(e.target.checked)} />
                {t('prototype.arena_testbed.movable')}
              </label>
              <label className="p2-checkbox">
                <input type="checkbox" checked={obs4Destructible} onChange={e => setObs4Destructible(e.target.checked)} />
                {t('prototype.arena_testbed.destructible')}
              </label>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="p2-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="p2-canvas"
            onClick={handleCanvasClick}
            onTouchEnd={handleTouch}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setHoveredCell(null)}
          />

          {/* Grid Controls — Steppers */}
          <div className="p2-stepper-row">
            <div className="p2-stepper-group">
              <span className="p2-stepper-label">{t('prototype.arena_testbed.cols')}</span>
              <div className="p2-stepper">
                <button className="p2-stepper-btn" disabled={cols <= 1} onClick={() => setCols(c => Math.max(1, c - 1))}>−</button>
                <span className="p2-stepper-value">{cols}</span>
                <button className="p2-stepper-btn" disabled={cols >= 10} onClick={() => setCols(c => Math.min(10, c + 1))}>+</button>
              </div>
            </div>
            <div className="p2-stepper-group">
              <span className="p2-stepper-label">{t('prototype.arena_testbed.rows')}</span>
              <div className="p2-stepper">
                <button className="p2-stepper-btn" disabled={rows <= 1} onClick={() => setRows(r => Math.max(1, r - 1))}>−</button>
                <span className="p2-stepper-value">{rows}</span>
                <button className="p2-stepper-btn" disabled={rows >= 15} onClick={() => setRows(r => Math.min(15, r + 1))}>+</button>
              </div>
            </div>
            <div className="p2-stepper-group">
              <span className="p2-stepper-label">{t('prototype.arena_testbed.hex_size')}</span>
              <div className="p2-stepper">
                <button className="p2-stepper-btn" disabled={hexSize <= 14} onClick={() => setHexSize(s => Math.max(14, s - 2))}>−</button>
                <span className="p2-stepper-value">{hexSize}</span>
                <button className="p2-stepper-btn" disabled={hexSize >= 40} onClick={() => setHexSize(s => Math.min(40, s + 2))}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Character info */}
        <div className="p2-char-info">
          <div className="p2-char-list">
            {boardChars.map(ch => {
              const charData = characters.find(c => c.id === ch.charId)
              return (
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
              )
            })}
          </div>
          {selectedChar && (
            <p className="p2-hint">
              {t('prototype.arena_testbed.click_to_place')}
            </p>
          )}
        </div>
      </div>

      <div className="p2-footer">
        <button
          className="p2-btn p2-btn-primary"
          disabled={!validPlacement}
          onClick={handleConfirm}
        >
          {t('prototype.arena_testbed.start_match')} ⚔️
        </button>
        {!validPlacement && (
          <p className="p2-warning">{t('prototype.arena_testbed.placement_warning')}</p>
        )}
      </div>
    </div>
  )
}
