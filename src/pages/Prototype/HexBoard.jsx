import { useRef, useEffect, useState, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import './HexBoard.css'

const HEX_SIZE = 36
const SQRT3 = Math.sqrt(3)

function hexCorner(center, size, i) {
  const angle = (Math.PI / 180) * (60 * i - 30)
  return {
    x: center.x + size * Math.cos(angle),
    y: center.y + size * Math.sin(angle),
  }
}

function drawHex(ctx, center, size, fill, stroke) {
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
  ctx.lineWidth = 1.5
  ctx.stroke()
}

export default function HexBoard() {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const [cols, setCols] = useState(8)
  const [rows, setRows] = useState(6)

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
        const offsetX = row % 2 === 0 ? 0 : w / 2
        const cx = padX + col * w + offsetX
        const cy = padY + row * h

        const fill = '#1a1a22'
        const stroke = '#2e2e3a'
        drawHex(ctx, { x: cx, y: cy }, HEX_SIZE, fill, stroke)
      }
    }
  }, [cols, rows])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  return (
    <div className="hex-board-wrapper">
      <div className="hex-board-controls">
        <label className="hex-label">
          <span>{t('prototype.hex_board.cols')}</span>
          <input
            type="range"
            min={2}
            max={20}
            value={cols}
            onChange={e => setCols(Number(e.target.value))}
          />
          <span className="hex-value">{cols}</span>
        </label>
        <label className="hex-label">
          <span>{t('prototype.hex_board.rows')}</span>
          <input
            type="range"
            min={2}
            max={20}
            value={rows}
            onChange={e => setRows(Number(e.target.value))}
          />
          <span className="hex-value">{rows}</span>
        </label>
      </div>
      <div className="hex-board-canvas-wrap">
        <canvas ref={canvasRef} className="hex-canvas" />
      </div>
    </div>
  )
}
