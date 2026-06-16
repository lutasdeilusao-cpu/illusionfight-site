import { useState, useRef, useEffect, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import * as PIXI from 'pixi.js'
import {
  createPixiApp, hexCenter, hexCorners, canvasSize,
  COLORS, obsIcon, itemIcon,
} from '../engine/pixiRenderer'
import './Phase2BoardSetup.css'

const HEX_SIZE = 20
const SQRT3 = Math.sqrt(3)

function pixelToHex(px, py, cols, rows, padX, padY, size) {
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
  { id: 1, labelKey: 'prototype.arena_testbed.obs1', color: COLORS.obsWall, icon: '🧱' },
  { id: 2, labelKey: 'prototype.arena_testbed.obs2', color: COLORS.obsHole, icon: '🕳️' },
  { id: 3, labelKey: 'prototype.arena_testbed.obs3', color: COLORS.obsTrap, icon: '🪤' },
  { id: 4, labelKey: 'prototype.arena_testbed.obs4', color: COLORS.obsBox, icon: '📦' },
]

export default function Phase2BoardSetup({ characters, onConfirm, onBack }) {
  const { t } = useLanguage()
  const pixiContainerRef = useRef(null)
  const appRef = useRef(null)
  const boardLayerRef = useRef(null)

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

  // Inicializa Pixi
  useEffect(() => {
    if (!pixiContainerRef.current) return
    const { width, height } = canvasSize(cols, rows, HEX_SIZE)
    const app = createPixiApp(pixiContainerRef.current, width, height)
    appRef.current = app
    const layer = new PIXI.Container()
    app.stage.addChild(layer)
    boardLayerRef.current = layer

    app.view.addEventListener('click', handleCanvasEvent)
    app.view.addEventListener('touchend', handleTouchEvent, { passive: false })
    app.view.addEventListener('mousemove', handleMouseMove)

    return () => {
      if (appRef.current) {
        appRef.current.view.removeEventListener('click', handleCanvasEvent)
        appRef.current.view.removeEventListener('touchend', handleTouchEvent)
        appRef.current.view.removeEventListener('mousemove', handleMouseMove)
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render board when state changes
  useEffect(() => {
    if (!appRef.current) return
    const { width, height, padX, padY } = canvasSize(cols, rows, HEX_SIZE)
    appRef.current.renderer.resize(width, height)
    renderBoard()
  }, [cols, rows, boardChars, obstaculos, itensChao, hoveredCell, selectedChar])

  function getEventCoords(e) {
    const rect = appRef.current?.view.getBoundingClientRect()
    if (!rect) return null
    const scaleX = appRef.current.view.width / rect.width
    const scaleY = appRef.current.view.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function handleTouchEvent(e) {
    e.preventDefault()
    const touch = e.changedTouches[0]
    handleCanvasEvent({ clientX: touch.clientX, clientY: touch.clientY })
  }

  function handleMouseMove(e) {
    const coords = getEventCoords(e)
    if (!coords) return
    const { padX, padY } = canvasSize(cols, rows, HEX_SIZE)
    const hex = pixelToHex(coords.x, coords.y, cols, rows, padX, padY, HEX_SIZE)
    setHoveredCell(hex)
  }

  function handleCanvasEvent(e) {
    const coords = getEventCoords(e)
    if (!coords) return
    const { padX, padY } = canvasSize(cols, rows, HEX_SIZE)
    const hex = pixelToHex(coords.x, coords.y, cols, rows, padX, padY, HEX_SIZE)
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
      setItensChao(prev => ({ ...prev, [key]: { tipo: tool === 'item_hp' ? 'hp' : 'mp' } }))
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
          prev.map(c => c.charId === selectedChar.charId ? { ...c, row, col } : c)
        )
        setSelectedChar(null)
      }
    }
  }

  function renderBoard() {
    const layer = boardLayerRef.current
    const app = appRef.current
    if (!layer || !app) return
    layer.removeChildren()

    const { padX, padY } = canvasSize(cols, rows, HEX_SIZE)
    const sz = HEX_SIZE

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const { x: cx, y: cy } = hexCenter(row, col, padX, padY, sz)
        const key = `${row}_${col}`
        const obs = obstaculos[key]
        const item = itensChao[key]
        const ch = boardChars.find(c => c.row === row && c.col === col)
        const isHovered = hoveredCell?.row === row && hoveredCell?.col === col
        const isSelected = selectedChar && boardChars.find(c => c.charId === selectedChar.charId && c.row === row && c.col === col)

        let fillColor = COLORS.hexBase
        let strokeColor = isHovered ? COLORS.activeStroke : COLORS.hexStroke
        let strokeWidth = isHovered ? 2.5 : 1.5

        if (obs) {
          const colors = { 1: COLORS.obsWall, 2: COLORS.obsHole, 3: COLORS.obsTrap, 4: COLORS.obsBox }
          fillColor = colors[obs.tipo] || COLORS.obsWall
          strokeColor = 0x444444
        } else if (item) {
          fillColor = item.tipo === 'hp' ? COLORS.itemHP : COLORS.itemMP
          strokeColor = item.tipo === 'hp' ? COLORS.hexHighStroke : 0x42a5f5
        }

        if (isSelected) {
          strokeColor = COLORS.activeStroke
          strokeWidth = 3
        }

        const g = new PIXI.Graphics()
        const pts = hexCorners(cx, cy, sz)
        g.lineStyle(strokeWidth, strokeColor, 1)
        g.beginFill(fillColor)
        g.drawPolygon(pts)
        g.endFill()
        layer.addChild(g)

        if (obs && !ch) {
          const icon = new PIXI.Text(obsIcon(obs.tipo), { fontSize: 18 })
          icon.anchor.set(0.5, 0.5)
          icon.x = cx; icon.y = cy
          layer.addChild(icon)
        } else if (item && !ch && !obs) {
          const icon = new PIXI.Text(itemIcon(item.tipo), { fontSize: 16 })
          icon.anchor.set(0.5, 0.5)
          icon.x = cx; icon.y = cy
          layer.addChild(icon)
        }

        if (ch) {
          const charData = characters.find(c => c.id === ch.charId)
          const dotColor = ch.time === 'jogador' ? COLORS.playerFill : COLORS.iaFill
          const dotStroke = ch.time === 'jogador' ? COLORS.playerStroke : COLORS.iaStroke
          const dot = new PIXI.Graphics()
          dot.lineStyle(2, isSelected ? COLORS.activeStroke : dotStroke, 1)
          dot.beginFill(dotColor)
          dot.drawCircle(cx, cy, sz * 0.55)
          dot.endFill()
          layer.addChild(dot)

          const label = new PIXI.Text(charData?.emoji || ch.nome.charAt(0).toUpperCase(), {
            fontSize: Math.round(sz * 0.4),
            fill: 0xffffff,
            fontWeight: 'bold',
          })
          label.anchor.set(0.5, 0.5)
          label.x = cx; label.y = cy - 2
          layer.addChild(label)
        }

        if (!obs && !ch && !item) {
          const coord = new PIXI.Text(`${row},${col}`, {
            fontSize: 9,
            fill: 0x3a3a4a,
            fontFamily: 'monospace',
          })
          coord.anchor.set(0.5, 0.5)
          coord.x = cx; coord.y = cy + sz * 0.15
          layer.addChild(coord)
        }
      }
    }
  }

  useEffect(() => {
    const initial = characters.map((ch, idx) => {
      const assignedCol = ch.time === 'jogador' ? Math.floor(idx / 2) : cols - 1 - Math.floor(idx / 2)
      const assignedRow = ch.time === 'jogador' ? (idx % 2) * (rows - 1) : (idx % 2) * (rows - 1)
      return { charId: ch.id, nome: ch.nome, time: ch.time, row: assignedRow, col: assignedCol }
    })
    setBoardChars(initial)
  }, [characters, cols, rows])

  const allPlaced = useMemo(() => boardChars.length === characters.length, [boardChars, characters])

  const validPlacement = useMemo(() => {
    const playerChars = boardChars.filter(c => c.time === 'jogador')
    const iaChars = boardChars.filter(c => c.time === 'ia')
    const playerOK = playerChars.every(c => c.col < cols / 2)
    const iaOK = iaChars.every(c => c.col >= cols / 2)
    const occupied = new Set(boardChars.map(c => `${c.row}_${c.col}`))
    const noOverlap = occupied.size === boardChars.length
    return playerOK && iaOK && noOverlap && allPlaced
  }, [boardChars, cols, allPlaced])

  function handleConfirm() {
    onConfirm({
      boardChars: boardChars.map(c => ({ ...c, charData: characters.find(ch => ch.id === c.charId) })),
      obstaculos, itensChao, cols, rows,
    })
  }

  return (
    <div className="tab-fase2">
      <div className="tab-fase2-header">
        <h3>{t('prototype.arena_testbed.phase2_title')}</h3>
        <button className="tab-btn tab-btn-secondary" onClick={onBack}>
          ← {t('prototype.arena_testbed.back')}
        </button>
      </div>
      <div className="tab-fase2-body">
        <div className="tab-fase2-toolbar">
          <div className="tab-fase2-toolgroup">
            <span className="tab-fase2-toolgroup-label">{t('prototype.arena_testbed.tools')}</span>
            <button className={`tab-fase2-tool ${tool === 'select' ? 'active' : ''}`} onClick={() => setTool('select')}>👆</button>
            <button className={`tab-fase2-tool ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')}>🧹</button>
          </div>
          <div className="tab-fase2-toolgroup">
            <span className="tab-fase2-toolgroup-label">{t('prototype.arena_testbed.obstacles')}</span>
            {OBSTACLE_TYPES.map(ot => (
              <button key={ot.id} className={`tab-fase2-tool ${tool === `obs${ot.id}` ? 'active' : ''}`} onClick={() => setTool(`obs${ot.id}`)}>{ot.icon}</button>
            ))}
          </div>
          <div className="tab-fase2-toolgroup">
            <span className="tab-fase2-toolgroup-label">{t('prototype.arena_testbed.items')}</span>
            <button className={`tab-fase2-tool ${tool === 'item_hp' ? 'active' : ''}`} onClick={() => setTool('item_hp')}>❤️</button>
            <button className={`tab-fase2-tool ${tool === 'item_mp' ? 'active' : ''}`} onClick={() => setTool('item_mp')}>💙</button>
          </div>
          {tool === 'obs3' && (
            <div className="tab-fase2-tool-config">
              <label><span>HP:</span>
                <select value={obs3HP} onChange={e => setObs3HP(Number(e.target.value))}>
                  <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                </select>
              </label>
              <label><span>{t('prototype.arena_testbed.effect')}:</span>
                <select value={obs3Effect} onChange={e => setObs3Effect(e.target.value)}>
                  <option value="nenhum">{t('prototype.arena_testbed.effect_none')}</option>
                  <option value="explosao">{t('prototype.arena_testbed.effect_explosion')}</option>
                  <option value="congelamento">{t('prototype.arena_testbed.effect_freeze')}</option>
                </select>
              </label>
            </div>
          )}
          {tool === 'obs4' && (
            <div className="tab-fase2-tool-config">
              <label className="tab-fase2-checkbox"><input type="checkbox" checked={obs4Movable} onChange={e => setObs4Movable(e.target.checked)} />{t('prototype.arena_testbed.movable')}</label>
              <label className="tab-fase2-checkbox"><input type="checkbox" checked={obs4Destructible} onChange={e => setObs4Destructible(e.target.checked)} />{t('prototype.arena_testbed.destructible')}</label>
            </div>
          )}
        </div>

        <div className="tab-fase2-canvas-wrap">
          <div ref={pixiContainerRef} className="tab-fase2-pixi-container" />
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

        <div className="tab-fase2-char-info">
          <div className="tab-fase2-char-list">
            {boardChars.map(ch => (
              <div key={ch.charId} className={`tab-fase2-char-chip ${selectedChar?.charId === ch.charId ? 'selected' : ''}`} onClick={() => setSelectedChar(ch)}>
                <span className={`tab-fase2-char-team ${ch.time}`}>{ch.time === 'jogador' ? '👤' : '🤖'}</span>
                <span>{ch.nome}</span>
                <span className="tab-fase2-char-pos">({ch.row},{ch.col})</span>
              </div>
            ))}
          </div>
          {selectedChar && <p className="tab-fase2-hint">{t('prototype.arena_testbed.click_to_place')}</p>}
        </div>
      </div>
      <div className="tab-fase2-footer">
        <button className="tab-btn tab-btn-primary" disabled={!validPlacement} onClick={handleConfirm}>
          {t('prototype.arena_testbed.start_match')} ⚔️
        </button>
        {!validPlacement && <p className="tab-fase2-warning">{t('prototype.arena_testbed.placement_warning')}</p>}
      </div>
    </div>
  )
}
