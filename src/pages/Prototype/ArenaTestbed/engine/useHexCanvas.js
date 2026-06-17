import { useRef, useEffect, useCallback, useState } from 'react'
import { gerarGrid } from './hexUtils'

const SQRT3 = Math.sqrt(3)

function hexCorner(center, size, i) {
  const angle = (Math.PI / 180) * (60 * i)
  return {
    x: center.x + size * Math.cos(angle),
    y: center.y + size * Math.sin(angle),
  }
}

function drawHex(ctx, center, size, fill, stroke, lineWidth = 1.5, shadow = null) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const p = hexCorner(center, size, i)
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  }
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  if (shadow) {
    ctx.shadowBlur = shadow.blur
    ctx.shadowColor = shadow.color
  }
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.stroke()
  if (shadow) {
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  }
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

function calcGridProps(containerW, containerH, cols, rows, minSz, maxSz) {
  const byWidth = Math.floor(containerW / (cols * 1.5 + 0.5))
  const byHeight = Math.floor(containerH / (rows * SQRT3))
  const sz = Math.max(minSz, Math.min(maxSz, Math.min(byWidth, byHeight)))
  const gridSpan = (cols - 1) * sz * 1.5
  const gridW = gridSpan + sz * 2
  const gridH = (rows - 1) * sz * SQRT3 + sz * SQRT3
  const padX = Math.round((containerW - gridSpan) / 2)
  const padY = Math.round((containerH - gridH) / 2)
  return { hexSize: sz, padX, padY, gridW, gridH }
}

export default function useHexCanvas({ canvasRef, cols, rows, minSz = 14, maxSz = 40 }) {
  const [hexSize, setHexSize] = useState(30)
  const [calcVersion, setCalcVersion] = useState(0)
  const padRef = useRef({ x: 0, y: 0 })
  const sizeRef = useRef(30)

  const recalc = useCallback(() => {
  const canvas = canvasRef.current
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return

  const parentW = parent.clientWidth
  const parentH = parent.clientHeight
  const parentRect = parent.getBoundingClientRect()
  const canvasRect = canvas.getBoundingClientRect()
  const parentStyle = window.getComputedStyle(parent)
  const canvasStyle = window.getComputedStyle(canvas)

  const pStyle = window.getComputedStyle(parent)
  const pBorderLeft = parseFloat(pStyle.borderLeftWidth) || 0
  const pBorderRight = parseFloat(pStyle.borderRightWidth) || 0
  const pBorderTop = parseFloat(pStyle.borderTopWidth) || 0
  const pBorderBottom = parseFloat(pStyle.borderBottomWidth) || 0
  const pPadLeft = parseFloat(pStyle.paddingLeft) || 0
  const pPadRight = parseFloat(pStyle.paddingRight) || 0
  const pPadTop = parseFloat(pStyle.paddingTop) || 0
  const pPadBottom = parseFloat(pStyle.paddingBottom) || 0
  const containerW = Math.round(parent.clientWidth - pPadLeft - pPadRight)
  const containerH = Math.round(parent.clientHeight - pPadTop - pPadBottom)

  const byWidth = Math.floor(containerW / (cols * 1.5 + 0.5))
  const byHeight = Math.floor(containerH / (rows * SQRT3))
  const sz = Math.max(minSz, Math.min(maxSz, Math.min(byWidth, byHeight)))
  const gridSpan = (cols - 1) * sz * 1.5
  const gridW = gridSpan + sz * 2
  const gridH = (rows - 1) * sz * SQRT3 + sz * SQRT3
  const padX = Math.round((containerW - gridSpan) / 2)
  const padY = Math.round((containerH - gridH) / 2)

  console.log(
    `[HEX] cols:${cols} rows:${rows} sz:${sz} padX:${padX} padY:${padY} grid:${gridW.toFixed(0)}x${gridH.toFixed(0)} fill:${((gridW/containerW)*100).toFixed(0)}%w ${((gridH/containerH)*100).toFixed(0)}%h`
  )

  if (containerW <= 0 || containerH <= 0) return

  canvas.width = containerW
  canvas.height = containerH

  setHexSize(sz)
  sizeRef.current = sz
  padRef.current = { x: padX, y: padY }
  setCalcVersion(v => v + 1)
}, [canvasRef, cols, rows, minSz, maxSz])

  useEffect(() => {
    recalc()
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => recalc())
    ro.observe(canvas.parentElement)
    window.addEventListener('resize', recalc)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recalc)
    }
  }, [recalc, canvasRef])

  const getCanvasPoint = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }, [canvasRef])

  const getCellAt = useCallback((clientX, clientY) => {
    const pt = getCanvasPoint(clientX, clientY)
    if (!pt) return null
    const sz = sizeRef.current
    const { x: padX, y: padY } = padRef.current
    return pixelToHex(pt.x, pt.y, cols, rows, padX, padY, sz)
  }, [getCanvasPoint, cols, rows])

  const getHexCenter = useCallback((row, col) => {
    const sz = sizeRef.current
    const { x: padX, y: padY } = padRef.current
    return hexCenter(row, col, padX, padY, sz)
  }, [])

  return {
    hexSize,
    calcVersion,
    recalc,
    getCanvasPoint,
    getCellAt,
    getHexCenter,
    drawHex,
    pixelToHex,
    hexCenter,
    hexCorner,
    padRef,
    sizeRef,
  }
}
