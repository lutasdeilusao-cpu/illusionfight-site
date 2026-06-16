import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import './Phase2BoardSetup.css'

const HEX_SIZE = 32
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

    const w = HEX_SIZE * SQRT3
    const h = HEX_SIZE * 1.5
    const padX = HEX_SIZE * SQRT3
    const padY = HEX_SIZE * 1.5

    const canvasW = cols * w + w / 2 + padX * 2
    const canvasH = rows * h + h / 3 + padY * 2

    canvas.width = canvasW
    canvas.height = canvasH
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const center = hexCenter(row, col, padX, padY, HEX_SIZE)
        const key = `${row}_${col}`
        const obs = obstaculos[key]
        const item = itensChao[key]
        const ch = boardChars.find(c => c.row === row && c.col === col)

        let fill = '#1a1a22'
        let stroke = '#2e2e3a'

        if (obs) {
          const obsType = OBSTACLE_TYPES.find(o => o.id === obs.tipo)
          fill = obsType?.color || '#555'
          stroke = '#444'
        } else if (item) {
          fill = item.tipo === 'hp' ? '#1b3a1b' : '#1a2a4a'
          stroke = item.tipo === 'hp' ? '#4caf50' : '#42a5f5'
        }

        if (hoveredCell && hoveredCell.row === row && hoveredCell.col === col) {
          stroke = '#c9a84c'
        }

        drawHex(ctx, center, HEX_SIZE, fill, stroke)

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
          const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, HEX_SIZE * 0.7)
          if (ch.time === 'jogador') {
            gradient.addColorStop(0, '#2e7d32')
            gradient.addColorStop(1, '#1b4d1b')
          } else {
            gradient.addColorStop(0, '#c0392b')
            gradient.addColorStop(1, '#7b1a1a')
          }
          ctx.beginPath()
          ctx.arc(center.x, center.y, HEX_SIZE * 0.55, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
          ctx.strokeStyle = ch.time === 'jogador' ? '#4caf50' : '#e74c3c'
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.fillStyle = '#fff'
          ctx.font = `bold ${HEX_SIZE * 0.4}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(ch.nome.charAt(0).toUpperCase(), center.x, center.y)
        }

        // Grid label (small)
        if (!obs && !ch) {
          ctx.fillStyle = '#3a3a4a'
          ctx.font = '9px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(`${row},${col}`, center.x, center.y + HEX_SIZE * 0.15)
        }
      }
    }
  }, [cols, rows, boardChars, obstaculos, itensChao, hoveredCell])

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
    const w = HEX_SIZE * SQRT3
    const h = HEX_SIZE * 1.5
    const padX = HEX_SIZE * SQRT3
    const padY = HEX_SIZE * 1.5
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, HEX_SIZE)
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
    const w = HEX_SIZE * SQRT3
    const h = HEX_SIZE * 1.5
    const padX = HEX_SIZE * SQRT3
    const padY = HEX_SIZE * 1.5
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, HEX_SIZE)
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
    <div className="tab-fase2">
      <div className="tab-fase2-header">
        <h3>{t('prototype.arena_testbed.phase2_title')}</h3>
        <button className="tab-btn tab-btn-secondary" onClick={onBack}>
          ← {t('prototype.arena_testbed.back')}
        </button>
      </div>

      <div className="tab-fase2-body">
        {/* Toolbar */}
        <div className="tab-fase2-toolbar">
          <div className="tab-fase2-toolgroup">
            <span className="tab-fase2-toolgroup-label">{t('prototype.arena_testbed.tools')}</span>
            <button
              className={`tab-fase2-tool ${tool === 'select' ? 'active' : ''}`}
              onClick={() => setTool('select')}
              title={t('prototype.arena_testbed.tool_select')}
            >
              👆
            </button>
            <button
              className={`tab-fase2-tool ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title={t('prototype.arena_testbed.tool_eraser')}
            >
              🧹
            </button>
          </div>

          <div className="tab-fase2-toolgroup">
            <span className="tab-fase2-toolgroup-label">{t('prototype.arena_testbed.obstacles')}</span>
            {OBSTACLE_TYPES.map(ot => (
              <button
                key={ot.id}
                className={`tab-fase2-tool ${tool === `obs${ot.id}` ? 'active' : ''}`}
                onClick={() => setTool(`obs${ot.id}`)}
                title={t(ot.labelKey)}
              >
                {ot.icon}
              </button>
            ))}
          </div>

          <div className="tab-fase2-toolgroup">
            <span className="tab-fase2-toolgroup-label">{t('prototype.arena_testbed.items')}</span>
            <button
              className={`tab-fase2-tool ${tool === 'item_hp' ? 'active' : ''}`}
              onClick={() => setTool('item_hp')}
              title={t('prototype.arena_testbed.potion_hp')}
            >
              ❤️
            </button>
            <button
              className={`tab-fase2-tool ${tool === 'item_mp' ? 'active' : ''}`}
              onClick={() => setTool('item_mp')}
              title={t('prototype.arena_testbed.potion_mp')}
            >
              💙
            </button>
          </div>

          {/* Obstacle 3 config */}
          {tool === 'obs3' && (
            <div className="tab-fase2-tool-config">
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
            <div className="tab-fase2-tool-config">
              <label className="tab-fase2-checkbox">
                <input type="checkbox" checked={obs4Movable} onChange={e => setObs4Movable(e.target.checked)} />
                {t('prototype.arena_testbed.movable')}
              </label>
              <label className="tab-fase2-checkbox">
                <input type="checkbox" checked={obs4Destructible} onChange={e => setObs4Destructible(e.target.checked)} />
                {t('prototype.arena_testbed.destructible')}
              </label>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="tab-fase2-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="tab-fase2-canvas"
            onClick={handleCanvasClick}
            onTouchEnd={handleTouch}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setHoveredCell(null)}
          />

          {/* Grid Controls — Steppers */}
          <div className="atb-stepper-row">
            <div className="atb-stepper-group">
              <span className="atb-stepper-label">{t('prototype.arena_testbed.cols')}</span>
              <div className="atb-stepper">
                <button className="atb-stepper-btn" disabled={cols <= 1} onClick={() => setCols(c => Math.max(1, c - 1))}>−</button>
                <span className="atb-stepper-value">{cols}</span>
                <button className="atb-stepper-btn" disabled={cols >= 10} onClick={() => setCols(c => Math.min(10, c + 1))}>+</button>
              </div>
            </div>
            <div className="atb-stepper-group">
              <span className="atb-stepper-label">{t('prototype.arena_testbed.rows')}</span>
              <div className="atb-stepper">
                <button className="atb-stepper-btn" disabled={rows <= 1} onClick={() => setRows(r => Math.max(1, r - 1))}>−</button>
                <span className="atb-stepper-value">{rows}</span>
                <button className="atb-stepper-btn" disabled={rows >= 15} onClick={() => setRows(r => Math.min(15, r + 1))}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Character info */}
        <div className="tab-fase2-char-info">
          <div className="tab-fase2-char-list">
            {boardChars.map(ch => {
              const charData = characters.find(c => c.id === ch.charId)
              return (
                <div
                  key={ch.charId}
                  className={`tab-fase2-char-chip ${selectedChar?.charId === ch.charId ? 'selected' : ''}`}
                  onClick={() => setSelectedChar(ch)}
                >
                  <span className={`tab-fase2-char-team ${ch.time}`}>
                    {ch.time === 'jogador' ? '👤' : '🤖'}
                  </span>
                  <span>{ch.nome}</span>
                  <span className="tab-fase2-char-pos">({ch.row},{ch.col})</span>
                </div>
              )
            })}
          </div>
          {selectedChar && (
            <p className="tab-fase2-hint">
              {t('prototype.arena_testbed.click_to_place')}
            </p>
          )}
        </div>
      </div>

      <div className="tab-fase2-footer">
        <button
          className="tab-btn tab-btn-primary"
          disabled={!validPlacement}
          onClick={handleConfirm}
        >
          {t('prototype.arena_testbed.start_match')} ⚔️
        </button>
        {!validPlacement && (
          <p className="tab-fase2-warning">{t('prototype.arena_testbed.placement_warning')}</p>
        )}
      </div>
    </div>
  )
}
