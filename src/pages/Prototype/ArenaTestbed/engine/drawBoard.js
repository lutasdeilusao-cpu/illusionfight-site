const SQRT3 = Math.sqrt(3)

export function drawBoard({
  ctx, canvas, sizeRef, padRef, hexCenter, drawHex, pixelToHex,
  rows, cols, obstaculos, itensChaoAtual, characters, currentChar,
  highlightedCells, attackCells, rangeCells, projectilePath, projectilePos,
  caminhoEscolhido, destinoEscolhido, damageFlash, trailRef, angleRef,
  tileImgRef,
}) {
  if (!canvas || !ctx) return
  const sz = sizeRef.current
  const padX = padRef.current.x
  const padY = padRef.current.y
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const hlSet = new Set(highlightedCells.map(c => `${c.row}_${c.col}`))
  const atkSet = new Set(attackCells.map(c => `${c.row}_${c.col}`))
  const rangeSet = new Set(rangeCells.map(c => `${c.row}_${c.col}`))
  const projPathSet = new Set(projectilePath.map(c => `${c.row}_${c.col}`))
  const destSet = new Set(caminhoEscolhido.map(c => `${c.row}_${c.col}`))
  const destKey = destinoEscolhido ? `${destinoEscolhido.row}_${destinoEscolhido.col}` : null

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const center = hexCenter(row, col, padX, padY, sz)
      const key = `${row}_${col}`
      const obs = obstaculos[key]
      const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)

      let fill = '#3d2208'
      let stroke = '#5c3410'

      if (obs) {
        const colors = { 1: '#555', 2: '#080b18', 3: '#8b4513', 4: '#6b5b3e' }
        fill = colors[obs.tipo] || '#555'
        stroke = '#333'
      } else if (itensChaoAtual[key]) {
        fill = itensChaoAtual[key].tipo === 'hp' ? '#002211' : '#001133'
        stroke = itensChaoAtual[key].tipo === 'hp' ? '#00ff88' : '#00eeff'
      }

      if (atkSet.has(key)) { fill = 'rgba(255,34,68,0.08)'; stroke = '#ff2244' }
      else if (rangeSet.has(key)) { fill = 'rgba(255,204,0,0.05)'; stroke = '#ffcc00' }
      else if (hlSet.has(key)) { fill = 'rgba(0,238,255,0.06)'; stroke = '#00eeff' }

      if (destSet.has(key) && key !== destKey) { fill = 'rgba(0,238,255,0.12)'; stroke = 'rgba(255,255,255,0.6)' }
      if (destKey && key === destKey) { fill = 'rgba(0,238,255,0.2)'; stroke = '#ffffff' }

      let shadow = null
      if (atkSet.has(key)) shadow = { blur: 12, color: '#ff2244' }
      else if (rangeSet.has(key)) shadow = { blur: 8, color: '#ffcc00' }
      else if (hlSet.has(key)) shadow = { blur: 12, color: '#00eeff' }
      else if (!obs && !ch && !itensChaoAtual[key]) shadow = { blur: 4, color: '#7a4a1a' }

      const lw = destKey && key === destKey ? 2.5 : (hlSet.has(key) ? 1.5 : (atkSet.has(key) ? 1.5 : (rangeSet.has(key) ? 1 : 1)))

      if (!obs && !itensChaoAtual[key] && tileImgRef?.current) {
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
        if (fill !== '#3d2208') { ctx.fillStyle = fill; ctx.fill() }
        ctx.restore()
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 180) * (60 * i)
          const px = center.x + sz * Math.cos(angle)
          const py = center.y + sz * Math.sin(angle)
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath()
        if (shadow) { ctx.shadowBlur = shadow.blur; ctx.shadowColor = shadow.color }
        ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke()
        ctx.shadowBlur = 0
      } else {
        drawHex(ctx, center, sz, fill, stroke, lw, shadow)
      }

      if (ch) {
        const flashOn = damageFlash[ch.id] !== undefined && damageFlash[ch.id] % 2 === 0
        const angle = angleRef.current
        const isPlayer = ch.time === 'jogador'

        const jogadores = characters.filter(c => c.time === 'jogador')
        const playerIndex = jogadores.findIndex(j => j.id === ch.id)
        const playerColors = ['#00ff88', '#4488ff', '#ffcc00', '#ff8800']
        const iaColor = '#ff2244'
        const color = isPlayer ? playerColors[playerIndex % playerColors.length] : iaColor
        const bgColor = isPlayer ? '#001a0d' : '#1a0008'

        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.rotate(angle)
        for (let i = 0; i < 6; i++) {
          ctx.beginPath()
          ctx.moveTo(sz * 0.62, 0)
          ctx.lineTo(sz * 0.72, 0)
          ctx.strokeStyle = isPlayer ? 'rgba(0,255,136,0.6)' : 'rgba(255,34,68,0.6)'
          ctx.lineWidth = 2; ctx.stroke()
          ctx.rotate(Math.PI / 3)
        }
        ctx.restore()

        ctx.beginPath()
        ctx.arc(center.x, center.y, sz * 0.48, 0, Math.PI * 2)
        ctx.fillStyle = bgColor; ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()

        ctx.fillStyle = color
        ctx.font = `700 ${sz * 0.35}px Orbitron, sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(ch.nome.charAt(0).toUpperCase(), center.x, center.y)

        const isActive = ch.id === currentChar?.id
        if (isActive) {
          ctx.beginPath()
          ctx.arc(center.x, center.y, sz * 0.85, 0, Math.PI * 2)
          ctx.globalAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 300)
          ctx.strokeStyle = isPlayer ? (playerIndex === 0 ? '#00eeff' : playerIndex === 1 ? '#88aaff' : '#ffcc88') : '#ff2244'
          ctx.lineWidth = 1; ctx.stroke()
          ctx.globalAlpha = 1
        }

        const barW = sz * 0.9, barH = 4
        const barX = center.x - barW / 2, barY = center.y + sz * 0.45
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(barX, barY, barW, barH)
        const hpPct = ch.hp / ch.hpMax
        ctx.fillStyle = hpPct > 0.5 ? '#00ff88' : hpPct > 0.25 ? '#ffcc00' : '#ff2244'
        if (hpPct <= 0.25) { ctx.shadowBlur = 6; ctx.shadowColor = '#ff2244' }
        ctx.fillRect(barX, barY, barW * hpPct, barH)
        ctx.shadowBlur = 0
      }

      if (projPathSet.has(key) && !projectilePos?.row === row && !projectilePos?.col === col) {
        drawHex(ctx, center, sz, fill, 'rgba(255,200,0,0.3)', 2)
      }

      if (projectilePos && projectilePos.row === row && projectilePos.col === col) {
        ctx.beginPath()
        ctx.arc(center.x, center.y, sz * 0.25, 0, Math.PI * 2)
        ctx.fillStyle = '#ffcc00'; ctx.fill()
        ctx.strokeStyle = '#ff8800'; ctx.lineWidth = 2; ctx.stroke()
        ctx.beginPath()
        ctx.arc(center.x, center.y, sz * 0.35, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,200,0,0.2)'; ctx.fill()
      }
    }
  }

  for (const t of trailRef.current) {
    const tc = hexCenter(t.row, t.col, padX, padY, sz)
    ctx.beginPath()
    ctx.arc(tc.x, tc.y, sz * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0,238,255,${t.alpha * 0.4})`
    ctx.fill()
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const center = hexCenter(row, col, padX, padY, sz)
      const key = `${row}_${col}`
      const obs = obstaculos[key]
      const item = itensChaoAtual[key]
      const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
      if (obs && !ch) {
        ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        const icons = { 1: '🧱', 2: '🕳️', 3: '🪤', 4: '📦' }
        ctx.fillText(icons[obs.tipo] || '?', center.x, center.y)
      } else if (item && !ch && !obs) {
        ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(item.tipo === 'hp' ? '❤️' : '💙', center.x, center.y)
      }
    }
  }
}

export function initCanvasLoop(canvasRef, drawFn) {
  let raf = null
  function loop() {
    drawFn()
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(raf)
}