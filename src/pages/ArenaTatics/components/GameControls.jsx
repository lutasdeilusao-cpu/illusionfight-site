import { useRef, useEffect, useCallback } from 'react'

/* ═══════════════════════════════════════════════════
   GameControls — Componente reutilizável de controle
   
   Usado tanto no CityOverworld quanto no BuildingInterior.
   Inclui:
   - Analog stick virtual (knob segue o mouse/touch em 360°)
   - Botões A e B
   - Suporte a touch e mouse
   ═══════════════════════════════════════════════════ */

const ANALOG_RADIUS = 40

export default function GameControls({ onMove, onA, onB, moveIntervalMs = 180 }) {
  const analogElRef = useRef(null)
  const knobRef = useRef(null)

  const aRef = useRef({
    activeId: null,
    interval: null,
    dir: { dx: 0, dy: 0 },
    cx: 0,
    cy: 0,
  })

  function doMoveAnalog(dx, dy) {
    if (onMove) onMove(dx, dy)
  }

  function analogRepeat() {
    const a = aRef.current
    if (a.dir.dx !== 0 || a.dir.dy !== 0) doMoveAnalog(a.dir.dx, a.dir.dy)
  }

  function updateAnalog(clientX, clientY) {
    const a = aRef.current
    const el = analogElRef.current
    const knob = knobRef.current
    if (!el || !knob) return


    let dx = clientX - a.cx
    let dy = clientY - a.cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Clamp knob position to analog radius
    if (dist > ANALOG_RADIUS) {
      dx = (dx / dist) * ANALOG_RADIUS
      dy = (dy / dist) * ANALOG_RADIUS
    }

    // Move knob visual to follow mouse/touch in 360°
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`

    // Direction detection (4-directional for movement)
    const threshold = 0.35
    let nd = { dx: 0, dy: 0 }
    if (dist > 5) {
      const nx = dx / ANALOG_RADIUS
      const ny = dy / ANALOG_RADIUS
      if (Math.abs(nx) > Math.abs(ny)) {
        if (Math.abs(nx) > threshold) nd = { dx: nx > 0 ? 1 : -1, dy: 0 }
      } else {
        if (Math.abs(ny) > threshold) nd = { dx: 0, dy: ny > 0 ? 1 : -1 }
      }
    }

    if (nd.dx !== a.dir.dx || nd.dy !== a.dir.dy) {
      a.dir = nd
      if (a.interval) { clearInterval(a.interval); a.interval = null }
      if (a.dir.dx !== 0 || a.dir.dy !== 0) {
        doMoveAnalog(a.dir.dx, a.dir.dy)
        a.interval = setInterval(analogRepeat, moveIntervalMs)
      }
    }
  }

  function resetAnalog() {
    const a = aRef.current
    const knob = knobRef.current
    if (knob) knob.style.transform = 'translate(-50%,-50%)'
    if (a.interval) { clearInterval(a.interval); a.interval = null }
    a.dir = { dx: 0, dy: 0 }
    a.activeId = null
  }

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    const a = aRef.current
    const el = analogElRef.current
    if (!el) return
    if (a.activeId !== null) return

    const touch = e.changedTouches[0]
    a.activeId = touch.identifier

    const r = el.getBoundingClientRect()
    a.cx = r.left + r.width / 2
    a.cy = r.top + r.height / 2

    updateAnalog(touch.clientX, touch.clientY)
  }, [])

  const handleTouchMove = useCallback((e) => {
    const a = aRef.current
    for (const t of e.changedTouches) {
      if (t.identifier === a.activeId) { updateAnalog(t.clientX, t.clientY); break }
    }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const a = aRef.current
    for (const t of e.changedTouches) {
      if (t.identifier === a.activeId) { resetAnalog(); break }
    }
  }, [])

  // Mouse handlers
  const handleMouseDown = useCallback((e) => {
    // Só ativa o analógico se o clique foi DENTRO do círculo do analógico, não nos botões
    const a = aRef.current
    const el = analogElRef.current
    if (!el) return
    if (a.activeId !== null) return
    // Verifica se o clique foi no próprio analógico ou dentro dele
    const analogRect = el.getBoundingClientRect()
    const cx = analogRect.left + analogRect.width / 2
    const cy = analogRect.top + analogRect.height / 2
    const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2)
    if (dist > analogRect.width / 2 + 20) return  // muito longe do analógico

    a.activeId = 'mouse'
    a.cx = cx
    a.cy = cy

    updateAnalog(e.clientX, e.clientY)
  }, [])

  useEffect(() => {
    const mm = (e) => {
      const a = aRef.current
      if (a.activeId === 'mouse') updateAnalog(e.clientX, e.clientY)
    }
    const mu = () => {
      const a = aRef.current
      if (a.activeId === 'mouse') resetAnalog()
    }
    window.addEventListener('mousemove', mm)
    window.addEventListener('mouseup', mu)
    return () => {
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('mouseup', mu)
    }
  }, [])

  return (
    <div className="city-controls-touch-area">
      <div className="city-gb-panel">
        {/* Analog stick — left side */}
        <div
          ref={analogElRef}
          className="city-analog-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="city-analog-outer">
            <div className="city-analog-inner" />
            <div ref={knobRef} className="city-analog-knob" />
          </div>
        </div>

        <div className="city-controls-area">
          <div className="city-ab-buttons">
            <button className="city-btn-ab city-btn-a" onClick={onA}>A</button>
            <button className="city-btn-ab city-btn-b" onClick={onB}>B</button>
          </div>
        </div>
      </div>
    </div>
  )
}
