/**
 * pixiRenderer.js — LDI Arena Testbed
 * Camada de renderização Pixi.js v7 para Phase2 e Phase3.
 * React chama métodos públicos deste módulo; nunca acessa internals do Pixi diretamente.
 */

import * as PIXI from 'pixi.js'

const SQRT3 = Math.sqrt(3)

// ── Paleta ────────────────────────────────────────
export const COLORS = {
  hexBase:        0x1a1a22,
  hexStroke:      0x2e2e3a,
  hexHighlight:   0x2a3a2a,
  hexHighStroke:  0x4caf50,
  hexAtk:         0x3a1a1a,
  hexAtkStroke:   0xe74c3c,
  hexRange:       0x3a3a1a,
  hexRangeStroke: 0xf0c040,
  hexPath:        0x3a5a3a,
  hexPathStroke:  0xffffff,
  hexDest:        0x2a4a6a,
  hexDestStroke:  0xffffff,
  obsWall:        0x555555,
  obsHole:        0x1a1a2e,
  obsTrap:        0x8b4513,
  obsBox:         0x6b5b3e,
  itemHP:         0x1b3a1b,
  itemMP:         0x1a2a4a,
  playerFill:     0x2e7d32,
  playerStroke:   0x4caf50,
  iaFill:         0xc0392b,
  iaStroke:       0xe74c3c,
  activeStroke:   0xc9a84c,
  flashFill:      0xff2222,
  particleNormal: 0xffcc00,
  particleCrit:   0xff6600,
  particleMelee:  0xff3333,
  particleBlock:  0x4488ff,
  white:          0xffffff,
  black:          0x000000,
}

// ── Hex geometry ──────────────────────────────────
export function hexCenter(row, col, padX, padY, size) {
  const w = size * SQRT3
  const h = size * 1.5
  const offsetX = row % 2 === 0 ? 0 : w / 2
  return {
    x: padX + col * w + offsetX,
    y: padY + row * h,
  }
}

export function hexCorners(cx, cy, size) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    pts.push(cx + size * Math.cos(angle), cy + size * Math.sin(angle))
  }
  return pts
}

export function canvasSize(cols, rows, size) {
  const w = size * SQRT3
  const h = size * 1.5
  const padX = size * SQRT3
  const padY = size * 1.5
  return {
    width:  Math.ceil(cols * w + w / 2 + padX * 2),
    height: Math.ceil(rows * h + h / 3 + padY * 2),
    padX,
    padY,
  }
}

// ── Criar app Pixi ────────────────────────────────
export function createPixiApp(container, width, height) {
  const app = new PIXI.Application({
    width,
    height,
    backgroundColor: 0x0d0d0f,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })
  container.appendChild(app.view)
  app.view.style.width  = '100%'
  app.view.style.height = '100%'
  app.view.style.display = 'block'
  return app
}

// ── Desenhar hexágono como Graphics ───────────────
export function drawHexGraphics(g, cx, cy, size, fillColor, strokeColor, strokeWidth = 1.5) {
  const pts = hexCorners(cx, cy, size)
  g.clear()
  g.lineStyle(strokeWidth, strokeColor, 1)
  g.beginFill(fillColor)
  g.drawPolygon(pts)
  g.endFill()
}

// ── Criar token de personagem ─────────────────────
export function createCharToken(size, char) {
  const container = new PIXI.Container()

  const circle = new PIXI.Graphics()
  const fillColor = char.time === 'jogador' ? COLORS.playerFill : COLORS.iaFill
  const strokeColor = char.time === 'jogador' ? COLORS.playerStroke : COLORS.iaStroke
  circle.lineStyle(2, strokeColor, 1)
  circle.beginFill(fillColor)
  circle.drawCircle(0, 0, size * 0.55)
  circle.endFill()
  container.addChild(circle)

  const label = new PIXI.Text(char.emoji || char.nome.charAt(0).toUpperCase(), {
    fontSize: Math.round(size * 0.45),
    fill: 0xffffff,
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
  })
  label.anchor.set(0.5, 0.5)
  label.y = -2
  container.addChild(label)

  const barBg = new PIXI.Graphics()
  barBg.beginFill(0x333333)
  barBg.drawRect(-size * 0.45, size * 0.45, size * 0.9, 4)
  barBg.endFill()
  container.addChild(barBg)

  const barFg = new PIXI.Graphics()
  barFg.beginFill(COLORS.hexHighStroke)
  barFg.drawRect(-size * 0.45, size * 0.45, size * 0.9, 4)
  barFg.endFill()
  container.addChild(barFg)

  container._circle  = circle
  container._label   = label
  container._barBg   = barBg
  container._barFg   = barFg
  container._charRef = char

  return container
}

// ── Atualizar barra HP do token ───────────────────
export function updateTokenHP(token, hp, hpMax, size) {
  const pct = Math.max(0, hp / hpMax)
  const color = pct > 0.5 ? 0x4caf50 : pct > 0.25 ? 0xff9800 : 0xf44336
  const fg = token._barFg
  fg.clear()
  fg.beginFill(color)
  fg.drawRect(-size * 0.45, size * 0.45, size * 0.9 * pct, 4)
  fg.endFill()
}

// ── Flash de dano no token ────────────────────────
export function flashToken(token, app, onDone) {
  const circle = token._circle
  const originalFill = token._charRef.time === 'jogador' ? COLORS.playerFill : COLORS.iaFill
  const originalStroke = token._charRef.time === 'jogador' ? COLORS.playerStroke : COLORS.iaStroke
  let count = 0
  const MAX = 6
  const tick = () => {
    count++
    const isRed = count % 2 === 1
    circle.clear()
    circle.lineStyle(2, isRed ? 0xff4444 : originalStroke, 1)
    circle.beginFill(isRed ? COLORS.flashFill : originalFill)
    circle.drawCircle(0, 0, token._size * 0.55 || 16)
    circle.endFill()
    if (count < MAX) {
      setTimeout(tick, 100)
    } else {
      if (onDone) onDone()
    }
  }
  tick()
}

// ── Shake do token ────────────────────────────────
export function shakeToken(token, app) {
  const originX = token.x
  const originY = token.y
  const shakes = [4, -4, 3, -3, 2, -2, 1, -1, 0]
  let i = 0
  const tick = () => {
    if (i >= shakes.length) {
      token.x = originX
      token.y = originY
      return
    }
    token.x = originX + shakes[i]
    token.y = originY
    i++
    setTimeout(tick, 40)
  }
  tick()
}

// ── Floater de dano (balão estilo Ragnarok) ───────
export function spawnDamageFloat(stage, x, y, value, isCrit = false) {
  const container = new PIXI.Container()
  container.x = x
  container.y = y

  const balloon = new PIXI.Graphics()
  const bgColor = isCrit ? 0x8b4000 : 0xc9a84c
  const borderColor = isCrit ? 0xff6600 : 0xffd700
  balloon.lineStyle(2, borderColor, 1)
  balloon.beginFill(bgColor)
  balloon.drawEllipse(0, -18, 28, 16)
  balloon.endFill()
  balloon.lineStyle(0)
  balloon.beginFill(bgColor)
  balloon.drawPolygon([-6, -6, 6, -6, 0, 4])
  balloon.endFill()
  container.addChild(balloon)

  const text = new PIXI.Text(String(value), {
    fontSize: isCrit ? 18 : 14,
    fill: isCrit ? 0xffcc00 : 0xffffff,
    fontWeight: 'bold',
    fontFamily: 'Cinzel, serif',
    stroke: 0x000000,
    strokeThickness: 3,
  })
  text.anchor.set(0.5, 0.5)
  text.y = -18
  container.addChild(text)

  stage.addChild(container)

  let elapsed = 0
  const DURATION = 900
  const ticker = new PIXI.Ticker()
  ticker.add((delta) => {
    elapsed += delta * (1000 / 60)
    const t = Math.min(elapsed / DURATION, 1)
    container.y = y - t * 48
    container.alpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4
    if (t >= 1) {
      ticker.destroy()
      stage.removeChild(container)
      container.destroy({ children: true })
    }
  })
  ticker.start()
}

// ── Floater de texto (BLOQUEIO!, CONTRA!, EXTRA!) ─
export function spawnTextFloat(stage, x, y, text, color = 0xffffff) {
  const container = new PIXI.Container()
  container.x = x
  container.y = y

  const label = new PIXI.Text(text, {
    fontSize: 16,
    fill: color,
    fontWeight: 'bold',
    fontFamily: 'Cinzel, serif',
    stroke: 0x000000,
    strokeThickness: 4,
  })
  label.anchor.set(0.5, 0.5)
  container.addChild(label)
  stage.addChild(container)

  container.scale.set(0.5)
  let elapsed = 0
  const DURATION = 1200
  const ticker = new PIXI.Ticker()
  ticker.add((delta) => {
    elapsed += delta * (1000 / 60)
    const t = Math.min(elapsed / DURATION, 1)
    const scaleVal = t < 0.2 ? 0.5 + (t / 0.2) * 0.8 : 1.3 - (t - 0.2) * 0.3
    container.scale.set(Math.max(0.1, scaleVal))
    container.y = y - t * 56
    container.alpha = t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5
    if (t >= 1) {
      ticker.destroy()
      stage.removeChild(container)
      container.destroy({ children: true })
    }
  })
  ticker.start()
}

// ── Partículas de impacto melee ───────────────────
export function spawnMeleeParticles(stage, x, y, isCrit = false) {
  const COUNT = isCrit ? 16 : 8
  const color = isCrit ? COLORS.particleCrit : COLORS.particleMelee
  const particles = []

  for (let i = 0; i < COUNT; i++) {
    const p = new PIXI.Graphics()
    p.beginFill(color)
    p.drawCircle(0, 0, isCrit ? 4 : 2.5)
    p.endFill()
    p.x = x
    p.y = y
    const angle = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.5
    const speed = 2 + Math.random() * 3
    p._vx = Math.cos(angle) * speed
    p._vy = Math.sin(angle) * speed
    p._life = 1
    stage.addChild(p)
    particles.push(p)
  }

  let elapsed = 0
  const DURATION = 500
  const ticker = new PIXI.Ticker()
  ticker.add((delta) => {
    elapsed += delta * (1000 / 60)
    const t = Math.min(elapsed / DURATION, 1)
    for (const p of particles) {
      p.x += p._vx
      p.y += p._vy
      p._vy += 0.15
      p.alpha = 1 - t
    }
    if (t >= 1) {
      ticker.destroy()
      for (const p of particles) {
        stage.removeChild(p)
        p.destroy()
      }
    }
  })
  ticker.start()
}

// ── Projétil com trilha de partículas ────────────
export function spawnProjectile(stage, fromX, fromY, toX, toY, isCrit = false, onArrive) {
  const color = isCrit ? COLORS.particleCrit : COLORS.particleNormal
  const trail = []
  const MAX_TRAIL = 8

  const bullet = new PIXI.Graphics()
  bullet.beginFill(color)
  bullet.drawCircle(0, 0, isCrit ? 7 : 5)
  bullet.endFill()
  bullet.lineStyle(2, 0xffffff, 0.3)
  bullet.drawCircle(0, 0, isCrit ? 10 : 7)
  bullet.x = fromX
  bullet.y = fromY
  stage.addChild(bullet)

  const dx = toX - fromX
  const dy = toY - fromY
  const dist = Math.sqrt(dx * dx + dy * dy)
  const SPEED = 6
  const FRAMES = Math.ceil(dist / SPEED)
  let frame = 0

  const ticker = new PIXI.Ticker()
  ticker.add(() => {
    frame++
    const t = Math.min(frame / FRAMES, 1)
    bullet.x = fromX + dx * t
    bullet.y = fromY + dy * t

    const tp = new PIXI.Graphics()
    tp.beginFill(color, 0.5)
    tp.drawCircle(0, 0, isCrit ? 4 : 3)
    tp.endFill()
    tp.x = bullet.x
    tp.y = bullet.y
    tp._alpha = 0.6
    stage.addChildAt(tp, stage.children.indexOf(bullet))
    trail.push(tp)

    for (const tr of trail) {
      tr._alpha -= 0.06
      tr.alpha = Math.max(0, tr._alpha)
    }

    for (let i = trail.length - 1; i >= 0; i--) {
      if (trail[i]._alpha <= 0) {
        stage.removeChild(trail[i])
        trail[i].destroy()
        trail.splice(i, 1)
      }
    }

    if (t >= 1) {
      ticker.destroy()
      stage.removeChild(bullet)
      bullet.destroy()
      for (const tr of trail) {
        stage.removeChild(tr)
        tr.destroy()
      }
      if (onArrive) onArrive()
    }
  })
  ticker.start()
}

// ── Flash de tela (crítico ofensivo) ─────────────
export function screenFlash(stage, stageW, stageH, color = 0xffffff) {
  const overlay = new PIXI.Graphics()
  overlay.beginFill(color, 0.25)
  overlay.drawRect(0, 0, stageW, stageH)
  overlay.endFill()
  stage.addChild(overlay)

  let elapsed = 0
  const DURATION = 300
  const ticker = new PIXI.Ticker()
  ticker.add((delta) => {
    elapsed += delta * (1000 / 60)
    overlay.alpha = 0.25 * (1 - elapsed / DURATION)
    if (elapsed >= DURATION) {
      ticker.destroy()
      stage.removeChild(overlay)
      overlay.destroy()
    }
  })
  ticker.start()
}

// ── Ícone de obstáculo como Text Pixi ────────────
export function obsIcon(tipo) {
  const icons = { 1: '🧱', 2: '🕳️', 3: '🪤', 4: '📦' }
  return icons[tipo] || '?'
}

export function itemIcon(tipo) {
  return tipo === 'hp' ? '❤️' : '💙'
}
