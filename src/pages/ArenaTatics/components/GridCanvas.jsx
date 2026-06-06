import { useRef, useEffect, useCallback } from 'react'

// ── Isometric constants ──
const TILE_W = 80, TILE_H = 40
const HW = TILE_W / 2, HH = TILE_H / 2
const GRID_W = 16, GRID_H = 16
const LERP = 0.08

function isoToScreen(x, y) { return { sx: (x - y) * HW, sy: (x + y) * HH } }
function screenToIsoFloat(px, py) { return { gx: (px / HW + py / HH) / 2, gy: (py / HH - px / HW) / 2 } }
function dentroDoLosango(px, py, tx, ty) {
  const c = isoToScreen(tx, ty)
  const dx = Math.abs(px - c.sx), dy = py - c.sy
  if (dy < 0 || dy > TILE_H) return false
  if (dx * HH > dy * HW * 1.04) return false
  if (dy * HW + dx * HH > 2 * HW * HH * 1.04) return false
  return true
}
function encontrarTile(px, py) {
  const { gx, gy } = screenToIsoFloat(px, py)
  const cx = Math.round(gx), cy = Math.round(gy)
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      const nx = cx + dx, ny = cy + dy
      if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H && dentroDoLosango(px, py, nx, ny)) return { x: nx, y: ny }
    }
  return null
}

const MIN_SX = isoToScreen(0, GRID_H - 1).sx
const MAX_SX = isoToScreen(GRID_W - 1, 0).sx
const MIN_SY = isoToScreen(0, 0).sy
const MAX_SY = isoToScreen(GRID_W - 1, GRID_H - 1).sy
const WORLD_W = MAX_SX - MIN_SX, WORLD_H = MAX_SY - MIN_SY

const MM_S = 120, MM_C = Math.floor(MM_S / Math.max(GRID_W, GRID_H)), MM_O = Math.floor((MM_S - GRID_W * MM_C) / 2)

const ELEM_CORES = {
  fogo: '#FF6347', gelo: '#4A90D9', relampago: '#FFD700',
  luz: '#00BFFF', vento: '#C0C0C0', terra: '#CD853F',
}
const elemCor = el => ELEM_CORES[el] || '#888'

function drawChar(ctx, sx, sy, char, size, isAlly, frame) {
  const cor = elemCor(char.elemental)
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(sx, sy + size - 2, size / 2.2, size / 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = cor
  ctx.beginPath()
  ctx.moveTo(sx, sy - 2)
  ctx.lineTo(sx + size / 2, sy + size / 3)
  ctx.lineTo(sx + size / 2.5, sy + size - 2)
  ctx.lineTo(sx - size / 2.5, sy + size - 2)
  ctx.lineTo(sx - size / 2, sy + size / 3)
  ctx.closePath()
  ctx.fill()
  if (char.hpMax) {
    const bw = size + 4, bh = 3, by = sy + size + 2
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(sx - bw / 2, by, bw, bh)
    const pct = Math.max(0, char.hp / char.hpMax)
    ctx.fillStyle = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#ef4444'
    ctx.fillRect(sx - bw / 2, by, bw * pct, bh)
  }
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(sx + size / 4, sy + size / 4)
  ctx.lineTo(sx, sy + size / 2)
  ctx.lineTo(sx - size / 4, sy + size / 4)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = isAlly ? '#e8c96a' : '#999'
  ctx.font = 'bold 8px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(char.nome || char.id, sx, sy + size + 14)
  if (isAlly) {
    const p = Math.sin(frame * 0.06) * 0.2 + 0.8
    ctx.strokeStyle = `rgba(232,201,106,${p * 0.5})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(sx, sy + size / 3, size / 2 + 3, 0, Math.PI * 2)
    ctx.stroke()
  }
}

export default function GridCanvas({ aliados = [], inimigos = [], alcance = [], turnoFase = 'idle', onCasaClick = () => {}, alvoHighlight = null, obstrucoes = [], freeLook = false }) {
  const canvasRef = useRef(null)
  const camRef = useRef({ x: 0, y: 0 })
  const hoverRef = useRef(null)
  const frameRef = useRef(0)
  const aRef = useRef(aliados); const iRef = useRef(inimigos)
  const alRef = useRef(alcance); const oRef = useRef(obstrucoes)
  const ahRef = useRef(alvoHighlight); const fRef = useRef(turnoFase)
  const clRef = useRef(onCasaClick); const flRef = useRef(freeLook)
  const dragRef = useRef({ ativo: false, startX: 0, startY: 0, camStartX: 0, camStartY: 0 })

  useEffect(() => { aRef.current = aliados }, [aliados])
  useEffect(() => { iRef.current = inimigos }, [inimigos])
  useEffect(() => { alRef.current = alcance }, [alcance])
  useEffect(() => { oRef.current = obstrucoes }, [obstrucoes])
  useEffect(() => { ahRef.current = alvoHighlight }, [alvoHighlight])
  useEffect(() => { fRef.current = turnoFase }, [turnoFase])
  useEffect(() => { clRef.current = onCasaClick }, [onCasaClick])
  useEffect(() => { flRef.current = freeLook }, [freeLook])

  const handlePD = useCallback((cx, cy) => {
    const c = canvasRef.current; if (!c) return
    const r = c.getBoundingClientRect()
    const mx = cx - r.left, my = cy - r.top
    const cam = camRef.current
    const tile = encontrarTile(mx + cam.x, my + cam.y)
    if (!tile) return
    const a = aRef.current, i = iRef.current, ob = oRef.current, al = alRef.current
    clRef.current(tile.x, tile.y, {
      x: tile.x, y: tile.y,
      aliado: a.find(p => p.x === tile.x && p.y === tile.y && p.hp > 0) || null,
      inimigo: i.find(p => p.x === tile.x && p.y === tile.y && p.hp > 0) || null,
      obstrucao: ob.some(o => o.x === tile.x && o.y === tile.y),
      emAlcance: al.some(c => c.x === tile.x && c.y === tile.y),
    })
  }, [])

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const onClick = e => {
      if (flRef.current) return // free look: ignora clique
      handlePD(e.clientX, e.clientY)
    }
    const onTouch = e => {
      e.preventDefault(); const t = e.changedTouches[0]
      if (flRef.current) { /* touch drag handled by start/move */ return }
      handlePD(t.clientX, t.clientY)
    }
    const onDown = e => {
      if (!flRef.current) return
      const r = c.getBoundingClientRect()
      dragRef.current = { ativo: true, startX: e.clientX, startY: e.clientY, camStartX: camRef.current.x, camStartY: camRef.current.y }
      c.style.cursor = 'grabbing'
    }
    const onMove = e => {
      const r = c.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      const cam = camRef.current
      if (flRef.current && dragRef.current.ativo) {
        const d = dragRef.current
        cam.x = d.camStartX - (e.clientX - d.startX)
        cam.y = d.camStartY - (e.clientY - d.startY)
        return
      }
      if (fRef.current === 'mover' || fRef.current === 'target') {
        const tile = encontrarTile(mx + cam.x, my + cam.y)
        const al = alRef.current
        if (tile && al.some(x => x.x === tile.x && x.y === tile.y)) { hoverRef.current = tile; c.style.cursor = 'pointer' }
        else { hoverRef.current = null; c.style.cursor = 'default' }
      } else { hoverRef.current = null; c.style.cursor = 'default' }
    }
    const onUp = () => { if (dragRef.current.ativo) { dragRef.current.ativo = false; c.style.cursor = flRef.current ? 'grab' : 'default' } }
    const onLeave = () => { hoverRef.current = null; onUp() }

    // Touch drag
    const onTouchStart = e => {
      if (!flRef.current) return
      const t = e.changedTouches[0]
      dragRef.current = { ativo: true, startX: t.clientX, startY: t.clientY, camStartX: camRef.current.x, camStartY: camRef.current.y }
    }
    const onTouchMove = e => {
      if (!flRef.current || !dragRef.current.ativo) return
      e.preventDefault()
      const t = e.changedTouches[0]
      const d = dragRef.current
      camRef.current.x = d.camStartX - (t.clientX - d.startX)
      camRef.current.y = d.camStartY - (t.clientY - d.startY)
    }
    const onTouchEnd = () => { dragRef.current.ativo = false }

    c.addEventListener('click', onClick)
    c.addEventListener('touchstart', onTouchStart, { passive: true })
    c.addEventListener('touchmove', onTouchMove, { passive: false })
    c.addEventListener('touchend', onTouchEnd)
    c.addEventListener('mousedown', onDown)
    c.addEventListener('mousemove', onMove)
    c.addEventListener('mouseup', onUp)
    c.addEventListener('mouseleave', onLeave)
    if (freeLook) c.style.cursor = 'grab'
    return () => {
      c.removeEventListener('click', onClick)
      c.removeEventListener('touchstart', onTouchStart)
      c.removeEventListener('touchmove', onTouchMove)
      c.removeEventListener('touchend', onTouchEnd)
      c.removeEventListener('mousedown', onDown)
      c.removeEventListener('mousemove', onMove)
      c.removeEventListener('mouseup', onUp)
      c.removeEventListener('mouseleave', onLeave)
    }
  }, [handlePD, freeLook])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); let animId
    const resize = () => { const p = canvas.parentElement; if (p) { canvas.width = p.clientWidth; canvas.height = p.clientHeight } }
    resize(); window.addEventListener('resize', resize)

    function loop() {
      const VW = canvas.width, VH = canvas.height
      const cam = camRef.current, frame = frameRef.current
      const al = aRef.current, ini = iRef.current, alc = alRef.current
      const ob = oRef.current, alvoHL = ahRef.current, fase = fRef.current

      // Camera: se estiver arrastando no freeLook, não segue personagem
      const dragging = dragRef.current.ativo
      if (!dragging && !flRef.current) {
        const target = al.find(p => p.hp > 0)
        if (target) {
          const ps = isoToScreen(target.x, target.y)
          cam.x += (ps.sx - VW / 2 - cam.x) * LERP
          cam.y += (ps.sy - VH / 2 - cam.y) * LERP
        }
      }
      const M = 150
      cam.x = Math.max(MIN_SX - M, Math.min(MAX_SX + M - VW, cam.x))
      cam.y = Math.max(MIN_SY - M, Math.min(MAX_SY + M - VH, cam.y))

      const ox = -cam.x, oy = -cam.y
      ctx.clearRect(0, 0, VW, VH)

      // Tiles
      for (let y = 0; y < GRID_H; y++)
        for (let x = 0; x < GRID_W; x++) {
          const p = isoToScreen(x, y)
          const sx = p.sx + ox, sy = p.sy + oy
          if (sx + HW < -20 || sx - HW > VW + 20 || sy < -20 || sy + TILE_H > VH + 20) continue

          const emAlcance = alc.some(c => c.x === x && c.y === y)
          const isOb = ob.some(o => o.x === x && o.y === y)
          const temInimigo = ini.some(i => i.x === x && i.y === y && i.hp > 0)
          const isAlvoHL = alvoHL && alvoHL.x === x && alvoHL.y === y

          ctx.fillStyle = (x + y) % 2 === 0 ? '#1e2e1e' : '#223322'
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(sx + HW, sy + HH); ctx.lineTo(sx, sy + TILE_H); ctx.lineTo(sx - HW, sy + HH)
          ctx.closePath(); ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.stroke()

          if (isOb && !temInimigo) {
            ctx.strokeStyle = 'rgba(200,50,50,0.4)'; ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(sx - 6, sy + HH - 6); ctx.lineTo(sx + 6, sy + HH + 6)
            ctx.moveTo(sx + 6, sy + HH - 6); ctx.lineTo(sx - 6, sy + HH + 6)
            ctx.stroke()
          }

          // Range: move=laranja, target=vermelho, animando=path glow
          if (emAlcance) {
            if (fase === 'animando') {
              ctx.shadowColor = '#f4a227';
              ctx.shadowBlur = 14;
              ctx.fillStyle = '#f4a227';
              ctx.globalAlpha = 0.85;
              ctx.beginPath();
              ctx.arc(sx, sy + HH, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.fillStyle = '#fff7e0';
              ctx.globalAlpha = 0.95;
              ctx.beginPath();
              ctx.arc(sx, sy + HH, 5, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
              ctx.shadowColor = 'transparent';
            } else {
              const isTarget = fase === 'target';
              ctx.fillStyle = isTarget ? 'rgba(226,75,74,0.25)' : 'rgba(244,162,39,0.25)';
              ctx.beginPath();
              ctx.moveTo(sx, sy); ctx.lineTo(sx + HW, sy + HH);
              ctx.lineTo(sx, sy + TILE_H); ctx.lineTo(sx - HW, sy + HH);
              ctx.closePath(); ctx.fill();
              ctx.strokeStyle = isTarget ? 'rgba(226,75,74,0.5)' : 'rgba(244,162,39,0.5)';
              ctx.lineWidth = 2; ctx.stroke();
            }
          }

          if (isAlvoHL) {
            ctx.shadowColor = '#E24B4A'; ctx.shadowBlur = 16
            ctx.strokeStyle = 'rgba(226,75,74,0.8)'; ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(sx, sy); ctx.lineTo(sx + HW, sy + HH)
            ctx.lineTo(sx, sy + TILE_H); ctx.lineTo(sx - HW, sy + HH)
            ctx.closePath(); ctx.stroke()
            ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'
          }

          const h = hoverRef.current
          if (emAlcance && h && h.x === x && h.y === y) {
            const p = Math.sin(frame * 0.1) * 0.25 + 0.75
            ctx.shadowColor = '#f4a227'; ctx.shadowBlur = 20 * p
            ctx.strokeStyle = `rgba(255,220,120,${p})`; ctx.lineWidth = 4
            ctx.beginPath()
            ctx.moveTo(sx, sy); ctx.lineTo(sx + HW, sy + HH)
            ctx.lineTo(sx, sy + TILE_H); ctx.lineTo(sx - HW, sy + HH)
            ctx.closePath(); ctx.stroke()
            ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'
          }

          if (temInimigo) {
            const e = ini.find(i => i.x === x && i.y === y && i.hp > 0)
            if (e) drawChar(ctx, sx, sy - 2, e, 14, false, frame)
          }
        }

      // Allies
      for (const ally of al) {
        if (ally.hp <= 0) continue
        const p = isoToScreen(ally.x, ally.y)
        const sx = p.sx + ox, sy = p.sy + oy
        if (sx + HW < -20 || sx - HW > VW + 20 || sy < -20 || sy + TILE_H > VH + 20) continue
        drawChar(ctx, sx, sy - 2, ally, 18, true, frame)
      }

      // ── Minimap ──
      const mx0 = VW - MM_S - 8, my0 = 8
      ctx.fillStyle = 'rgba(10,10,10,0.65)'
      ctx.fillRect(mx0, my0, MM_S, MM_S)
      ctx.fillStyle = '#151515'
      ctx.fillRect(mx0 + MM_O, my0 + MM_O, GRID_W * MM_C, GRID_H * MM_C)

      for (let y = 0; y < GRID_H; y++)
        for (let x = 0; x < GRID_W; x++) {
          const px = mx0 + MM_O + x * MM_C, py = my0 + MM_O + y * MM_C
          const isOb = ob.some(o => o.x === x && o.y === y)
          const isEnemy = ini.some(i => i.x === x && i.y === y && i.hp > 0)
          ctx.fillStyle = (x + y) % 2 === 0 ? '#1a261a' : '#1e2a1e'
          ctx.fillRect(px, py, MM_C, MM_C)
          if (isOb && !isEnemy) {
            ctx.strokeStyle = 'rgba(200,50,50,0.4)'; ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(px + 2, py + 2); ctx.lineTo(px + MM_C - 2, py + MM_C - 2)
            ctx.moveTo(px + MM_C - 2, py + 2); ctx.lineTo(px + 2, py + MM_C - 2)
            ctx.stroke()
          }
          if (isEnemy) {
            const e = ini.find(i => i.x === x && i.y === y && i.hp > 0)
            if (e) {
              ctx.fillStyle = elemCor(e.elemental)
              ctx.beginPath(); ctx.arc(px + MM_C / 2, py + MM_C / 2, Math.max(2, MM_C / 3 - 1), 0, Math.PI * 2); ctx.fill()
            }
          }
        }

      // Viewport
      const tl = screenToIsoFloat(cam.x, cam.y)
      const br = screenToIsoFloat(cam.x + VW, cam.y + VH)
      const vpX = Math.max(0, Math.floor(tl.gx)), vpY = Math.max(0, Math.floor(tl.gy))
      const vpW = Math.min(GRID_W, Math.ceil(br.gx)) - vpX, vpH = Math.min(GRID_H, Math.ceil(br.gy)) - vpY
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5
      ctx.strokeRect(mx0 + MM_O + vpX * MM_C, my0 + MM_O + vpY * MM_C, vpW * MM_C, vpH * MM_C)

      for (const ally of al) {
        if (ally.hp <= 0) continue
        const px = mx0 + MM_O + ally.x * MM_C + MM_C / 2
        const py = my0 + MM_O + ally.y * MM_C + MM_C / 2
        ctx.shadowColor = '#f4a227'; ctx.shadowBlur = 6
        ctx.fillStyle = '#f4a227'
        ctx.beginPath(); ctx.arc(px, py, Math.max(3, MM_C / 2 - 1), 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff7e0'
        ctx.beginPath(); ctx.arc(px, py, Math.max(2, MM_C / 3 - 1), 0, Math.PI * 2); ctx.fill()
        ctx.shadowColor = 'transparent'
      }

      frameRef.current++
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated', touchAction: 'none' }} />
}
