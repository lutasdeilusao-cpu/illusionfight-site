import { useEffect, useState } from 'react'

export function useViewportScroll(playerPos, cellSize, viewportPx, gridSize) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const targetX = -(playerPos.c * cellSize - viewportPx / 2 + cellSize / 2)
    const targetY = -(playerPos.r * cellSize - viewportPx / 2 + cellSize / 2)
    const maxX = -(gridSize * cellSize - viewportPx)
    const maxY = -(gridSize * cellSize - viewportPx)
    setOffset({
      x: Math.min(0, Math.max(maxX, targetX)),
      y: Math.min(0, Math.max(maxY, targetY)),
    })
  }, [playerPos, cellSize, viewportPx, gridSize])

  return offset
}
