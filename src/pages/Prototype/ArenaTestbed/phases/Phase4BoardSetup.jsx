import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import useHexCanvas from '../engine/useHexCanvas'
import { audio } from '../engine/audioManager'
import './Phase4BoardSetup.css'

const OBS3_HP_OPTIONS = [1, 2, 3]
const MAX_COLS = 10
const MAX_ROWS = 15

const OBSTACLE_TYPES = [
  { id: 1, labelKey: 'prototype.arena_testbed.obs1', icon: '🧱' },
  { id: 2, labelKey: 'prototype.arena_testbed.obs2', icon: '🕳️' },
  { id: 3, labelKey: 'prototype.arena_testbed.obs3', icon: '🪤' },
  { id: 4, labelKey: 'prototype.arena_testbed.obs4', icon: '📦' },
]

export default function Phase4BoardSetup({ characters, onConfirm }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const [cols, setCols] = useState(7)
  const [rows, setRows] = useState(4)
  const { hexSize, calcVersion, recalc, getCellAt, hexCenter, drawHex, padRef, sizeRef } = useHexCanvas({
    canvasRef, cols, rows, minSz: 14, maxSz: 50000000000000000,
  })
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
  const tileImgRef = useRef(null)
  const [tileLoaded, setTileLoaded] = useState(false)
  const [isPortrait, setIsPortrait] = useState(
    () => window.matchMedia('(orientation: portrait)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const handler = e => setIsPortrait(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const initial = characters.map((ch, idx) => {
      const assignedCol = ch.time === 'jogador' ? Math.floor(idx / 2) : cols - 1 - Math.floor(idx / 2)
      const assignedRow = ch.time === 'jogador' ? (idx % 2) * (rows - 1) : (idx % 2) * (rows - 1)
      return {
        charId: ch.id,
        nome: ch.aparencia?.nome || ch.nome || '',
        time: ch.time,
        aparencia: ch.aparencia,
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

    const sz = sizeRef.current
    const { x: padX, y: padY } = padRef.current

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

        if (!obs && !item && tileImgRef.current) {
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
          ctx.restore()
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i)
            const px = center.x + sz * Math.cos(angle)
            const py = center.y + sz * Math.sin(angle)
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.strokeStyle = stroke
          ctx.lineWidth = stroke === '#00eeff' ? 2 : 1
          ctx.stroke()
        } else {
          drawHex(ctx, center, sz, fill, stroke, stroke === '#00eeff' ? 2 : 1)
        }

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
          const cor = ch.aparencia?.cor || (ch.time === 'jogador' ? '#00ff88' : '#ff2244')
          const icone = ch.aparencia?.icone

          if (ch.time === 'jogador') {
            const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, sz * 0.7)
            const r = parseInt(cor.slice(1,3), 16)
            const g = parseInt(cor.slice(3,5), 16)
            const b = parseInt(cor.slice(5,7), 16)
            grad.addColorStop(0, `rgba(${r},${g},${b},0.1)`)
            grad.addColorStop(1, `rgba(0,0,0,0.4)`)
            ctx.beginPath()
            ctx.arc(center.x, center.y, sz * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = grad
            ctx.fill()
            ctx.strokeStyle = cor
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.fillStyle = cor
            if (icone) {
              ctx.save()
              ctx.translate(center.x, center.y)
              ctx.strokeStyle = cor
              ctx.lineWidth = 2
              ctx.beginPath()
              if (icone === 'circle') ctx.arc(0, 0, sz * 0.2, 0, Math.PI * 2)
              else if (icone === 'square') ctx.rect(-sz * 0.18, -sz * 0.18, sz * 0.36, sz * 0.36)
              else if (icone === 'diamond') { ctx.moveTo(0, -sz * 0.25); ctx.lineTo(sz * 0.2, 0); ctx.lineTo(0, sz * 0.25); ctx.lineTo(-sz * 0.2, 0); ctx.closePath() }
              ctx.stroke()
              ctx.restore()
            } else {
              ctx.font = `bold ${sz * 0.38}px Orbitron, sans-serif`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(ch.nome ? ch.nome.charAt(0).toUpperCase() : '?', center.x, center.y)
            }
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
  }, [cols, rows, boardChars, obstaculos, itensChao, hoveredCell, hexCenter, drawHex, padRef, sizeRef, tileLoaded])

  useEffect(() => {
    const img = new Image()
    img.src = '/assets/arena/terrenos/tile_default.png'
    img.onload = () => {
      tileImgRef.current = img
      setTileLoaded(true)
    }
  }, [])

  useEffect(() => { draw() }, [draw, calcVersion])

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
    const hex = getCellAt(e.clientX, e.clientY)
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
    const hex = getCellAt(e.clientX, e.clientY)
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
      tileUrl: '/assets/arena/terrenos/tile_default.png',
    }
    onConfirm(finalBoard)
  }

  return (
    <div className={`p2-root ${isPortrait ? 'portrait' : ''}`}>
      <div className="p2-body">
        <div className="p2-left">
          <div>
            <span className="p2-section-label">{t('prototype.arena_testbed.tools')}</span>
            <div className="p2-tool-grid two-col">
              <button
                className={`p2-tool-btn ${tool === 'select' ? 'active' : ''}`}
                onClick={() => { audio.toggle(); setTool('select') }}
              >
                <span className="p2-tool-icon">👆</span>
                <span className="p2-btn-label">{t('prototype.arena_testbed.tool_select')}</span>
              </button>
              <button
                className={`p2-tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                onClick={() => { audio.toggle(); setTool('eraser') }}
              >
                <span className="p2-tool-icon">🧹</span>
                <span className="p2-btn-label">{t('prototype.arena_testbed.tool_eraser')}</span>
              </button>
            </div>
          </div>

          <div>
            <span className="p2-section-label">{t('prototype.arena_testbed.obstacles')}</span>
            <div className="p2-tool-grid four-grid">
              {OBSTACLE_TYPES.map(ot => (
                <button
                  key={ot.id}
                  className={`p2-tool-btn ${tool === `obs${ot.id}` ? 'active' : ''}`}
                  onClick={() => { audio.toggle(); setTool(`obs${ot.id}`) }}
                >
                  <span className="p2-tool-icon">{ot.icon}</span>
                  <span className="p2-btn-label">{t(ot.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="p2-section-label">{t('prototype.arena_testbed.items')}</span>
            <div className="p2-tool-grid two-col">
              <button
                className={`p2-tool-btn ${tool === 'item_hp' ? 'active' : ''}`}
                onClick={() => { audio.toggle(); setTool('item_hp') }}
              >
                <span className="p2-tool-icon">❤️</span>
                <span className="p2-btn-label">{t('prototype.arena_testbed.label_hp')}</span>
              </button>
              <button
                className={`p2-tool-btn ${tool === 'item_mp' ? 'active' : ''}`}
                onClick={() => { audio.toggle(); setTool('item_mp') }}
              >
                <span className="p2-tool-icon">💧</span>
                <span className="p2-btn-label">{t('prototype.arena_testbed.label_mp')}</span>
              </button>
            </div>
          </div>

          {tool === 'obs3' && (
            <div className="p2-tool-config">
              <label>
                <span>{t('prototype.arena_testbed.label_hp')}:</span>
                <select value={obs3HP} onChange={e => { audio.select(); setObs3HP(Number(e.target.value)) }}>
                  {OBS3_HP_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
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

          <div className="p2-chars-section">
            {boardChars.map(ch => (
              <div
                key={ch.charId}
                className={`p2-char-chip ${selectedChar?.charId === ch.charId ? 'selected' : ''}`}
                onClick={() => { audio.select(); setSelectedChar(ch) }}
              >
                <span className={`p2-char-team ${ch.time}`}>
                  {ch.time === 'jogador' ? '👤' : '🤖'}
                </span>
                <span>{ch.aparencia?.nome || ch.nome}</span>
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
              <span className="p2-stepper-label">{t('prototype.arena_testbed.cols')}</span>
              <div className="p2-stepper">
                <button className="p2-stepper-btn" disabled={cols <= 1} onClick={() => { audio.click(); setCols(c => Math.max(1, c - 1)) }}>−</button>
                <span className="p2-stepper-value">{cols}</span>
                <button className="p2-stepper-btn" disabled={cols >= MAX_COLS} onClick={() => { audio.click(); setCols(c => Math.min(MAX_COLS, c + 1)) }}>+</button>
              </div>
            </div>
            <div className="p2-stepper-group">
              <span className="p2-stepper-label">{t('prototype.arena_testbed.rows')}</span>
              <div className="p2-stepper">
                <button className="p2-stepper-btn" disabled={rows <= 1} onClick={() => { audio.click(); setRows(r => Math.max(1, r - 1)) }}>−</button>
                <span className="p2-stepper-value">{rows}</span>
                <button className="p2-stepper-btn" disabled={rows >= MAX_ROWS} onClick={() => { audio.click(); setRows(r => Math.min(MAX_ROWS, r + 1)) }}>+</button>
              </div>
            </div>
          </div>

          <div className="p2-footer">
            <button
              className="p2-btn-primary"
              disabled={!validPlacement}
              onClick={() => { audio.confirm(); handleConfirm() }}
            >
              ⚔ {t('prototype.arena_testbed.start_match')}
            </button>
            {selectedChar && (
              <p className="p2-hint">{t('prototype.arena_testbed.click_to_place')}</p>
            )}
            {!validPlacement && !selectedChar && (
              <p className="p2-warning">{t('prototype.arena_testbed.placement_warning')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
