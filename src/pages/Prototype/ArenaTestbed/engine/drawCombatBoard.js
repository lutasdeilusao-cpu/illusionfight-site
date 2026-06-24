function drawCharacter(ctx, ch, x, y, scale, rotation, currentChar, angle, sz) {
  const isPlayer = ch.time === 'jogador'
  const cor = ch.aparencia?.cor || (isPlayer ? '#00ff88' : '#ff2244')
  const icone = ch.aparencia?.icone
  const nomeDisplay = ch.aparencia?.nome || ch.nome || ''
  const corBg = isPlayer ? '#001a0d' : '#1a0008'
  const r = parseInt(cor.slice(1, 3), 16)
  const g = parseInt(cor.slice(3, 5), 16)
  const b = parseInt(cor.slice(5, 7), 16)
  const corSpokes = isPlayer ? `rgba(${r},${g},${b},0.6)` : 'rgba(255,34,68,0.6)'

  ctx.save()
  ctx.translate(x, y)
  if (rotation) ctx.rotate(rotation)
  ctx.scale(scale, scale)
  ctx.translate(-x, -y)

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(sz * 0.62, 0)
    ctx.lineTo(sz * 0.72, 0)
    ctx.strokeStyle = corSpokes
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.rotate(Math.PI / 3)
  }
  ctx.restore()

  ctx.beginPath()
  ctx.arc(x, y, sz * 0.48, 0, Math.PI * 2)
  ctx.fillStyle = corBg
  ctx.fill()
  ctx.strokeStyle = cor
  ctx.lineWidth = 2
  ctx.stroke()

  if (icone) {
    ctx.save()
    ctx.translate(x, y)
    ctx.strokeStyle = cor
    ctx.lineWidth = 2
    ctx.beginPath()
    if (icone === 'circle') ctx.arc(0, 0, sz * 0.18, 0, Math.PI * 2)
    else if (icone === 'square') ctx.rect(-sz * 0.16, -sz * 0.16, sz * 0.32, sz * 0.32)
    else if (icone === 'diamond') { ctx.moveTo(0, -sz * 0.22); ctx.lineTo(sz * 0.18, 0); ctx.lineTo(0, sz * 0.22); ctx.lineTo(-sz * 0.18, 0); ctx.closePath() }
    ctx.stroke()
    ctx.restore()
  } else {
    ctx.fillStyle = cor
    ctx.font = `700 ${sz * 0.35}px Orbitron, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(nomeDisplay.charAt(0).toUpperCase(), x, y)
  }

  const isActive = ch.id === currentChar?.id
  if (isActive) {
    ctx.beginPath()
    ctx.arc(x, y, sz * 0.85, 0, Math.PI * 2)
    ctx.globalAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 300)
    ctx.strokeStyle = isPlayer ? cor : '#ff2244'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const barW = sz * 0.9
  const barH = 4
  const barX = x - barW / 2
  const barY = y + sz * 0.45
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(barX, barY, barW, barH)
  const hpPct = ch.hp / ch.hpMax
  if (hpPct > 0.5) {
    ctx.fillStyle = '#00ff88'
  } else if (hpPct > 0.25) {
    ctx.fillStyle = '#ffcc00'
  } else {
    ctx.fillStyle = '#ff2244'
    ctx.shadowBlur = 6
    ctx.shadowColor = '#ff2244'
  }
  ctx.fillRect(barX, barY, barW * hpPct, barH)
  ctx.shadowBlur = 0

  ctx.restore()
}

export function drawCombatBoard(ctx, params) {
  const {
    characters, obstaculos, itensChaoAtual, cols, rows,
    highlightedCells, attackCells, rangeCells, currentChar,
    damageFlash, caminhoEscolhido, destinoEscolhido,
    tileImg, sz,
    padX, padY,
    angle, trail,
    hexCenter, drawHex,
    charScales = {}, charVisualPos = {}, charRotation = {},
  } = params

  const hlSet = new Set(highlightedCells.map(c => `${c.row}_${c.col}`))
  const atkSet = new Set(attackCells.map(c => `${c.row}_${c.col}`))
  const rangeSet = new Set(rangeCells.map(c => `${c.row}_${c.col}`))
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

      if (atkSet.has(key)) {
        fill = 'rgba(255,34,68,0.08)'
        stroke = '#ff2244'
      } else if (rangeSet.has(key)) {
        fill = 'rgba(255,204,0,0.05)'
        stroke = '#ffcc00'
      } else if (hlSet.has(key)) {
        fill = 'rgba(255,255,255,0.06)'
        stroke = '#ffffff'
      }

      if (destSet.has(key) && key !== destKey) {
        fill = 'rgba(255,255,255,0.12)'
        stroke = 'rgba(255,255,255,0.6)'
      }

      if (destKey && key === destKey) {
        fill = 'rgba(255,255,255,0.2)'
        stroke = '#ffffff'
      }

      let shadow = null
      if (atkSet.has(key)) {
        shadow = { blur: 12, color: '#ff2244' }
      } else if (rangeSet.has(key)) {
        shadow = { blur: 8, color: '#ffcc00' }
      } else if (hlSet.has(key)) {
        shadow = { blur: 12, color: '#ffffff' }
      } else if (!obs && !ch && !itensChaoAtual[key]) {
        shadow = { blur: 4, color: '#7a4a1a' }
      }

      const lw = destKey && key === destKey ? 2.5 : (hlSet.has(key) ? 1.5 : (atkSet.has(key) ? 1.5 : (rangeSet.has(key) ? 1 : 1)))
      if (!obs && !itensChaoAtual[key] && tileImg) {
        ctx.save()
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 180) * (60 * i)
          const px = center.x + sz * Math.cos(a)
          const py = center.y + sz * Math.sin(a)
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(tileImg, center.x - sz, center.y - sz, sz * 2, sz * 2)
        if (fill !== '#3d2208') {
          ctx.fillStyle = fill
          ctx.fill()
        }
        ctx.restore()
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 180) * (60 * i)
          const px = center.x + sz * Math.cos(a)
          const py = center.y + sz * Math.sin(a)
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath()
        if (shadow) { ctx.shadowBlur = shadow.blur; ctx.shadowColor = shadow.color }
        ctx.strokeStyle = stroke
        ctx.lineWidth = lw
        ctx.stroke()
        ctx.shadowBlur = 0
      } else {
        drawHex(ctx, center, sz, fill, stroke, lw, shadow)
      }

      if (ch) {
        const visualPos = charVisualPos[ch.id]
        const scale = charScales[ch.id] ?? 1.0
        if (visualPos) {
          // SKIP — drawn in pass 2 (on top of everything)
        } else if (scale > 0.01) {
          const rotation = charRotation[ch.id] ?? 0
          drawCharacter(ctx, ch, center.x, center.y, scale, rotation, currentChar, angle, sz)
        }
      }

    }
  }

  // PASS 2 — animated characters drawn on top of everything
  for (const [charId, visualPos] of Object.entries(charVisualPos)) {
    const ch = characters.find(c => c.id === charId && c.vivo)
    if (!ch) continue
    const scale = charScales[charId] ?? 1.0
    if (scale <= 0.01) continue
    const rotation = charRotation[charId] ?? 0
    drawCharacter(ctx, ch, visualPos.x, visualPos.y, scale, rotation, currentChar, angle, sz)
  }

  for (const t of trail) {
    const tc = hexCenter(t.row, t.col, padX, padY, sz)
    ctx.beginPath()
    ctx.arc(tc.x, tc.y, sz * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${t.alpha * 0.4})`
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
        ctx.fillStyle = '#fff'
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const icons = { 1: '🧱', 2: '🕳️', 3: '🪤', 4: '📦' }
        ctx.fillText(icons[obs.tipo] || '?', center.x, center.y)
      } else if (item && !ch && !obs) {
        ctx.fillStyle = '#fff'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.tipo === 'hp' ? '❤️' : '💙', center.x, center.y)
      }
    }
  }
}
