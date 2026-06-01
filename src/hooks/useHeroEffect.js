import { useEffect, useRef } from 'react'

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export function useHeroEffect(canvasRef) {
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = Math.floor(randomBetween(40, 60))
    const lines = Array.from({ length: count }, () => {
      const isAmber = Math.random() < 1 / 6
      return {
        x: Math.random() * canvas.width,
        y: -randomBetween(60, 180),
        speed: randomBetween(40, 80),
        length: randomBetween(60, 180),
        color: isAmber
          ? `rgba(244, 162, 39, ${randomBetween(0.05, 0.1)})`
          : `rgba(0, 180, 216, ${randomBetween(0.08, 0.18)})`,
      }
    })

    let lastTime = performance.now()

    const draw = (now) => {
      const dt = (now - lastTime) / 1000
      lastTime = now

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const line of lines) {
        line.y += line.speed * dt
        if (line.y - line.length > canvas.height) {
          line.y = -line.length
          line.x = Math.random() * canvas.width
        }

        ctx.beginPath()
        ctx.moveTo(line.x, line.y - line.length)
        ctx.lineTo(line.x, line.y)
        ctx.strokeStyle = line.color
        ctx.lineWidth = 1
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef])
}
