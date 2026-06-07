import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */
const STEP       = 32   // px per step
const STEP_MS    = 160  // ms per step animation
const SPRITE_W   = 32
const SPRITE_H   = 32

const MAP_W = 55
const MAP_H = 30
const WORLD_W = MAP_W * STEP
const WORLD_H = MAP_H * STEP

const TILE_COLORS = {
  grass:       '#2d5a1e',
  dark_grass:  '#1e3d14',
  path:        '#8a9a6a',
  dark_path:   '#6a7a4e',
  water:       '#1a3a5a',
  building_roof: '#4a3a2a',
  wall:        '#3a3a3a',
  floor_in:    '#4a4a3a',
}

/* ── BUILDING DEFINITIONS (Marélia) ── */
const BUILDINGS = [
  {
    id: 'yohualticit', name: 'PRÉDIO DA YOHUALTICIT',
    x: 18, y: 4, w: 8, h: 7,
    color: '#8b1a1a', labelColor: '#cc4444',
    zoneName: 'PRÉDIO DA YOHUALTICIT',
    interiorMapId: 'yohualticit',
  },
  {
    id: 'jao', name: 'MERCADINHO DO SEU JÃO',
    x: 8, y: 14, w: 6, h: 4,
    color: '#c47820', labelColor: '#e8a040',
    zoneName: 'MERCADINHO DO SEU JÃO',
    interiorMapId: 'jao',
  },
  {
    id: 'recovery', name: 'RECOVERY CENTER',
    x: 38, y: 14, w: 5, h: 4,
    color: '#2a6040', labelColor: '#40a060',
    zoneName: 'RECOVERY CENTER',
    interiorMapId: 'recovery',
  },
  {
    id: 'bar', name: 'BAR DO ZÉ',
    x: 30, y: 20, w: 5, h: 4,
    color: '#6b3a50', labelColor: '#a05070',
    zoneName: 'BAR DO ZÉ',
    interiorMapId: 'bar',
  },
  {
    id: 'training', name: 'TRAINING CENTER',
    x: 40, y: 22, w: 5, h: 4,
    color: '#2a4060', labelColor: '#4060a0',
    zoneName: 'TRAINING CENTER',
    interiorMapId: 'training',
  },
  {
    id: 'fashion', name: 'FASHION CENTER',
    x: 10, y: 22, w: 5, h: 4,
    color: '#804060', labelColor: '#b06090',
    zoneName: 'FASHION CENTER',
    interiorMapId: 'fashion',
  },
  {
    id: 'save', name: 'SAVE CENTER',
    x: 26, y: 12, w: 4, h: 3,
    color: '#505a50', labelColor: '#707a70',
    zoneName: 'SAVE CENTER',
    interiorMapId: 'save',
  },
  {
    id: 'casa', name: 'CASA DO PERSONAGEM',
    x: 4, y: 24, w: 4, h: 3,
    color: '#6b4a20', labelColor: '#a07030',
    zoneName: 'CASA DO PERSONAGEM',
    interiorMapId: 'casa',
  },
]

/* ── DETECTIVE ── */
const DETECTIVE = { x: 780, y: 600 }

/* ── EXTERNAL ZONES (for door detection) ── */
const ZONE_DOOR_W = 3  // tiles
const ZONE_DOOR_H = 3

function getBuildingAt(px, py) {
  const tx = Math.floor(px / STEP)
  const ty = Math.floor(py / STEP)
  for (const b of BUILDINGS) {
    // Door zone is at the south edge of each building, centered
    const doorX = b.x + Math.floor(b.w / 2) - 1
    const doorY = b.y + b.h
    if (tx >= doorX && tx < doorX + ZONE_DOOR_W &&
        ty >= doorY && ty < doorY + ZONE_DOOR_H) {
      return b
    }
  }
  return null
}

function getDetectiveZone(px, py) {
  const tx = Math.floor(px / STEP)
  const ty = Math.floor(py / STEP)
  const detTx = Math.floor(DETECTIVE.x / STEP)
  const detTy = Math.floor(DETECTIVE.y / STEP)
  if (tx >= detTx - 1 && tx <= detTx + 1 &&
      ty >= detTy - 1 && ty <= detTy + 1) {
    return true
  }
  return false
}

function getBuildingAtTile(tx, ty) {
  for (const b of BUILDINGS) {
    if (tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return b
  }
  return null
}

/* ── COLLISION ── */
function isSolid(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true
  // Check if inside a building
  for (const b of BUILDINGS) {
    // Building body is solid
    if (tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return true
  }
  // Map border walls
  if (tx === 0 || ty === 0 || tx === MAP_W - 1 || ty === MAP_H - 1) return true
  // Water bodies (rough rectangles)
  const waterZones = [
    { x: 0, y: 0, w: 3, h: 4 },
    { x: 23, y: 0, w: 3, h: 3 },
    { x: 0, y: 26, w: 3, h: 3 },
    { x: 44, y: 0, w: 10, h: 5 },
  ]
  for (const w of waterZones) {
    if (tx >= w.x && tx < w.x + w.w && ty >= w.y && ty < w.y + w.h) return true
  }
  // Some interior walls / obstacles
  const obstacles = [
    { x: 14, y: 8, w: 1, h: 2 }, { x: 28, y: 18, w: 2, h: 1 },
    { x: 35, y: 8, w: 1, h: 3 }, { x: 6, y: 10, w: 2, h: 2 },
  ]
  for (const o of obstacles) {
    if (tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h) return true
  }
  return false
}

function playerCollides(px, py, obstaculos = []) {
  const hit = { ox: 8, oy: 22, w: 16, h: 8 }
  const x0 = Math.floor((px + hit.ox) / STEP)
  const y0 = Math.floor((py + hit.oy) / STEP)
  const x1 = Math.floor((px + hit.ox + hit.w - 1) / STEP)
  const y1 = Math.floor((py + hit.oy + hit.h - 1) / STEP)
  return isSolid(x0, y0) || isSolid(x1, y0) || isSolid(x0, y1) || isSolid(x1, y1)
}

/* ── ZONES ── */
const ZONES = [
  { name: 'PRAÇA CENTRAL', tx: 14, ty: 8, tw: 10, th: 6 },
  { name: 'BAIRRO COMERCIAL', tx: 4, ty: 14, tw: 14, th: 10 },
  { name: 'BAIRRO RESIDENCIAL', tx: 28, ty: 14, tw: 14, th: 10 },
  { name: 'DISTRITO SUL', tx: 4, ty: 24, tw: 14, th: 6 },
  { name: 'ÁREA DA YOHUALTICIT', tx: 18, ty: 0, tw: 14, th: 6 },
]

function getZoneName(tileX, tileY) {
  for (const z of ZONES) {
    if (tileX >= z.tx && tileX < z.tx + z.tw && tileY >= z.ty && tileY < z.ty + z.th) return z.name
  }
  return null
}

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export default function CityOverworld({ onEnterBuilding, onBackToMenu }) {
  const canvasRef = useRef(null)
  const playerRef = useRef(null)
  const wrapRef = useRef(null)
  const animRef = useRef(null)

  const [hudText, setHudText] = useState('')
  const [zoneText, setZoneText] = useState('')
  const [zoneVisible, setZoneVisible] = useState(false)
  const [interactLabel, setInteractLabel] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  // Movement state (refs for game loop)
  const stateRef = useRef({
    px: 20 * STEP,
    py: 16 * STEP,
    camX: 0, camY: 0,
    moving: false,
    moveFrom: { x: 0, y: 0 },
    moveTo: { x: 0, y: 0 },
    moveProgress: 1,
    moveStart: 0,
    spriteDir: 'down',
    spriteFlip: false,
    spriteFrame: 0,
    spriteIdle: true,
    lastFrameTime: 0,
    currentZone: null,
    zoneHideTimer: null,
  })

  const keysRef = useRef({})
  const lastMoveKeyRef = useRef(0)

  /* ── Draw map ── */
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    // Background
    ctx.fillStyle = '#1a2a10'
    ctx.fillRect(0, 0, WORLD_W, WORLD_H)

    // Grid of grass/path tiles
    for (let ty = 0; ty < MAP_H; ty++) {
      for (let tx = 0; tx < MAP_W; tx++) {
        const x = tx * STEP, y = ty * STEP
        // Determine tile type based on position
        let color = TILE_COLORS.grass

        // Paths (central cross)
        const isMainH = ty >= 13 && ty <= 15
        const isMainV = tx >= 12 && tx <= 14
        const isPathH = (ty === 8 || ty === 14 || ty === 20 || ty === 24)
        const isPathV = (tx === 6 || tx === 14 || tx === 22 || tx === 32 || tx === 40)

        if ((isMainH && tx >= 2 && tx <= 24) || (isMainV && ty >= 2 && ty <= 24)) {
          color = TILE_COLORS.path
        } else if (isPathH || isPathV) {
          color = TILE_COLORS.path
        } else if ((tx + ty) % 11 === 0) {
          color = TILE_COLORS.dark_grass
        }

        // Water
        const waterZones = [
          { x: 0, y: 0, w: 3, h: 4 }, { x: 23, y: 0, w: 3, h: 3 },
          { x: 0, y: 26, w: 3, h: 3 }, { x: 44, y: 0, w: 10, h: 5 },
        ]
        for (const w of waterZones) {
          if (tx >= w.x && tx < w.x + w.w && ty >= w.y && ty < w.y + w.h) {
            color = TILE_COLORS.water
            break
          }
        }

        ctx.fillStyle = color
        ctx.fillRect(x, y, STEP, STEP)

        // Subtle grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.08)'
        ctx.strokeRect(x, y, STEP, STEP)
      }
    }

    // ── Draw buildings ──
    BUILDINGS.forEach(b => {
      const bx = b.x * STEP, by = b.y * STEP
      const bw = b.w * STEP, bh = b.h * STEP

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(bx + 4, by + 4, bw, bh)

      // Main building body
      ctx.fillStyle = b.color
      ctx.fillRect(bx, by, bw, bh)

      // Border
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 2
      ctx.strokeRect(bx, by, bw, bh)

      // Roof detail (lighter top edge)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(bx, by, bw, 4)

      // Door indicator (small rect at bottom center of building)
      const doorX = bx + (b.w * STEP) / 2 - 6
      const doorY = by + bh - 4
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(doorX, doorY, 12, 4)

      // Building label below it
      ctx.fillStyle = b.labelColor
      ctx.font = 'bold 7px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(b.name, bx + bw / 2, by + bh + 14)

      // Special label for Training Center
      if (b.id === 'training') {
        ctx.fillStyle = '#ff4444'
        ctx.font = 'bold 5px monospace'
        ctx.fillText('SÓ ASSINANTES', bx + bw / 2, by + bh + 24)
      }
    })

    // ── Detective ──
    const dtx = DETECTIVE.x, dty = DETECTIVE.y
    ctx.fillStyle = '#cc3333'
    ctx.fillRect(dtx, dty, 10, 14)
    // Detective hat
    ctx.fillStyle = '#222'
    ctx.fillRect(dtx - 2, dty - 2, 14, 4)
    // Label
    ctx.fillStyle = '#cc3333'
    ctx.font = 'bold 6px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('DETETIVE', dtx + 5, dty - 6)

    // ── Decorative elements ──
    // Trees
    const treePositions = [
      [200, 300], [250, 400], [350, 250], [500, 350], [600, 280],
      [700, 500], [300, 550], [450, 650], [550, 450], [150, 500],
      [850, 300], [900, 600], [100, 700], [650, 700], [350, 750],
    ]
    treePositions.forEach(([tx, ty]) => {
      ctx.fillStyle = '#1a4a10'
      ctx.beginPath()
      ctx.arc(tx, ty, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#2a6a18'
      ctx.beginPath()
      ctx.arc(tx - 2, ty - 2, 5, 0, Math.PI * 2)
      ctx.fill()
    })

    // Lampposts / small decoration
    const lampposts = [
      [450, 450], [550, 550], [350, 400], [650, 500],
    ]
    lampposts.forEach(([lx, ly]) => {
      ctx.fillStyle = '#666'
      ctx.fillRect(lx, ly, 2, 10)
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(lx - 1, ly - 2, 4, 3)
    })
  }, [])

  /* ── Init canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = WORLD_W
    canvas.height = WORLD_H
    drawMap()
  }, [drawMap])

  /* ── Game Loop ── */
  useEffect(() => {
    const s = stateRef.current
    const player = playerRef.current
    const canvas = canvasRef.current
    if (!canvas || !player) return

    const VW = 480
    const VH = 700
    const PANEL_H = 160
    const VH_eff = VH - PANEL_H

    let zoneHideTimer = null

    function updateMovement() {
      if (!s.moving) {
        s.spriteIdle = true
        return
      }
      const elapsed = performance.now() - s.moveStart
      s.moveProgress = Math.min(elapsed / STEP_MS, 1)
      const t = 1 - (1 - s.moveProgress) * (1 - s.moveProgress)
      s.px = s.moveFrom.x + (s.moveTo.x - s.moveFrom.x) * t
      s.py = s.moveFrom.y + (s.moveTo.y - s.moveFrom.y) * t
      if (s.moveProgress >= 1) {
        s.px = s.moveTo.x
        s.py = s.moveTo.y
        s.moving = false
      }
    }

    function updateSprite() {
      const rowMap = { down: 0, side: 1, up: 2 }
      const row = rowMap[s.spriteDir] || 0
      if (!s.spriteIdle) {
        s.spriteFrame = (s.spriteFrame + 1) % 4
      } else {
        s.spriteFrame = 0
      }
      const bx = -(s.spriteFrame * SPRITE_W)
      const by = -(row * SPRITE_H)
      player.style.backgroundPosition = `${bx}px ${by}px`
      player.style.transform = s.spriteFlip ? 'scaleX(-1)' : 'scaleX(1)'
    }

    function startMove(dx, dy) {
      if (s.moving) return
      const nx = Math.round(s.px / STEP) * STEP + dx * STEP
      const ny = Math.round(s.py / STEP) * STEP + dy * STEP
      if (nx < 0 || ny < 0 || nx + SPRITE_W > WORLD_W || ny + SPRITE_H > WORLD_H) return
      if (playerCollides(nx, ny)) return

      if (dy === 1)  { s.spriteDir = 'down';  s.spriteFlip = false }
      if (dy === -1) { s.spriteDir = 'up';    s.spriteFlip = false }
      if (dx === 1)  { s.spriteDir = 'side';  s.spriteFlip = false }
      if (dx === -1) { s.spriteDir = 'side';  s.spriteFlip = true  }

      s.spriteIdle = false
      s.moveFrom = { x: s.px, y: s.py }
      s.moveTo = { x: nx, y: ny }
      s.moving = true
      s.moveProgress = 0
      s.moveStart = performance.now()
    }

    function updateZoneHud() {
      const tileX = Math.floor(s.px / STEP)
      const tileY = Math.floor(s.py / STEP)
      const zone = getZoneName(tileX, tileY)
      if (zone !== s.currentZone) {
        s.currentZone = zone
        if (zone) {
          setZoneText(zone)
          setZoneVisible(true)
          if (zoneHideTimer) clearTimeout(zoneHideTimer)
          zoneHideTimer = setTimeout(() => setZoneVisible(false), 3000)
        } else {
          setZoneVisible(false)
        }
      }

      // Check if near a building door
      const building = getBuildingAt(s.px, s.py)
      if (building) {
        setInteractLabel(`[A] ENTRAR: ${building.name}`)
      } else if (getDetectiveZone(s.px, s.py)) {
        setInteractLabel(`[A] FALAR COM DETETIVE`)
      } else {
        setInteractLabel('')
      }
    }

    function gameLoop(now) {
      updateMovement()
      updateSprite(now)

      // Camera
      const targetCamX = s.px - VW / 2 + SPRITE_W / 2
      const targetCamY = s.py - VH_eff / 2 + SPRITE_H / 2 - PANEL_H / 2
      s.camX += (targetCamX - s.camX) * 0.08
      s.camY += (targetCamY - s.camY) * 0.08
      s.camX = Math.max(0, Math.min(WORLD_W - VW, s.camX))
      s.camY = Math.max(0, Math.min(WORLD_H - VH_eff, s.camY))

      canvas.style.transform = `translate(${-s.camX}px, ${-s.camY}px)`
      player.style.left = (s.px - s.camX) + 'px'
      player.style.top = (s.py - s.camY) + 'px'

      setHudText(`POS: ${Math.round(s.px)}, ${Math.round(s.py)}`)

      updateZoneHud()
      animRef.current = requestAnimationFrame(gameLoop)
    }

    animRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (zoneHideTimer) clearTimeout(zoneHideTimer)
    }
  }, [])

  /* ── Keyboard ── */
  useEffect(() => {
    const keyMap = {
      ArrowUp: { dx: 0, dy: -1 }, w: { dx: 0, dy: -1 }, W: { dx: 0, dy: -1 },
      ArrowDown: { dx: 0, dy: 1 }, s: { dx: 0, dy: 1 }, S: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 }, a: { dx: -1, dy: 0 }, A: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 }, d: { dx: 1, dy: 0 }, D: { dx: 1, dy: 0 },
    }

    const handleKeyDown = (e) => {
      const s = stateRef.current
      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        // Call startMove via the game loop's scope
        const nx = Math.round(s.px / STEP) * STEP + dir.dx * STEP
        const ny = Math.round(s.py / STEP) * STEP + dir.dy * STEP
        if (nx < 0 || ny < 0 || nx + SPRITE_W > WORLD_W || ny + SPRITE_H > WORLD_H) return
        if (playerCollides(nx, ny)) return
        if (s.moving) return

        if (dir.dy === 1)  { s.spriteDir = 'down';  s.spriteFlip = false }
        if (dir.dy === -1) { s.spriteDir = 'up';    s.spriteFlip = false }
        if (dir.dx === 1)  { s.spriteDir = 'side';  s.spriteFlip = false }
        if (dir.dx === -1) { s.spriteDir = 'side';  s.spriteFlip = true  }

        s.spriteIdle = false
        s.moveFrom = { x: s.px, y: s.py }
        s.moveTo = { x: nx, y: ny }
        s.moving = true
        s.moveProgress = 0
        s.moveStart = performance.now()
      }

      // A / Enter — interact
      if (e.key === 'a' || e.key === 'A' || e.key === 'Enter') {
        const building = getBuildingAt(s.px, s.py)
        if (building) {
          onEnterBuilding(building.interiorMapId, building.name)
        } else if (getDetectiveZone(s.px, s.py)) {
          setInteractLabel('DETETIVE: "Você acha que isso aqui é só um joguinho?"')
          setTimeout(() => setInteractLabel(''), 3000)
        }
      }

      // Escape — menu
      if (e.key === 'Escape') {
        setShowMenu(p => !p)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEnterBuilding])

  /* ── Touch analog stick ── */
  const touchStateRef = useRef({
    activeId: null,
    interval: null,
    dir: { dx: 0, dy: 0 },
    centerX: 0, centerY: 0,
  })

  const handleTouchStart = useCallback((e) => {
    const ts = touchStateRef.current
    if (ts.activeId !== null) return
    const touch = e.changedTouches[0]
    ts.activeId = touch.identifier
    const rect = wrapRef.current.getBoundingClientRect()
    ts.centerX = rect.left + rect.width / 2
    ts.centerY = rect.top + rect.height * 0.65
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const ts = touchStateRef.current
    const s = stateRef.current
    for (const touch of e.changedTouches) {
      if (touch.identifier === ts.activeId) {
        const dx = touch.clientX - ts.centerX
        const dy = touch.clientY - ts.centerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const ANALOG_RADIUS = 40
        const threshold = 0.35

        let newDir = { dx: 0, dy: 0 }
        if (dist > 5) {
          const nx = dx / ANALOG_RADIUS
          const ny = dy / ANALOG_RADIUS
          if (Math.abs(nx) > Math.abs(ny)) {
            if (Math.abs(nx) > threshold) newDir = { dx: nx > 0 ? 1 : -1, dy: 0 }
          } else {
            if (Math.abs(ny) > threshold) newDir = { dx: 0, dy: ny > 0 ? 1 : -1 }
          }
        }

        if (newDir.dx !== ts.dir.dx || newDir.dy !== ts.dir.dy) {
          ts.dir = newDir
          if (ts.interval) { clearInterval(ts.interval); ts.interval = null }
          if (ts.dir.dx !== 0 || ts.dir.dy !== 0) {
            const nx = Math.round(s.px / STEP) * STEP + ts.dir.dx * STEP
            const ny = Math.round(s.py / STEP) * STEP + ts.dir.dy * STEP
            if (!(nx < 0 || ny < 0 || nx + SPRITE_W > WORLD_W || ny + SPRITE_H > WORLD_H) && !playerCollides(nx, ny) && !s.moving) {
              if (ts.dir.dy === 1)  { s.spriteDir = 'down';  s.spriteFlip = false }
              if (ts.dir.dy === -1) { s.spriteDir = 'up';    s.spriteFlip = false }
              if (ts.dir.dx === 1)  { s.spriteDir = 'side';  s.spriteFlip = false }
              if (ts.dir.dx === -1) { s.spriteDir = 'side';  s.spriteFlip = true  }
              s.spriteIdle = false
              s.moveFrom = { x: s.px, y: s.py }
              s.moveTo = { x: nx, y: ny }
              s.moving = true
              s.moveProgress = 0
              s.moveStart = performance.now()
            }
            ts.interval = setInterval(() => {
              const s2 = stateRef.current
              if (ts.dir.dx !== 0 || ts.dir.dy !== 0) {
                const nx2 = Math.round(s2.px / STEP) * STEP + ts.dir.dx * STEP
                const ny2 = Math.round(s2.py / STEP) * STEP + ts.dir.dy * STEP
                if (!(nx2 < 0 || ny2 < 0 || nx2 + SPRITE_W > WORLD_W || ny2 + SPRITE_H > WORLD_H) && !playerCollides(nx2, ny2) && !s2.moving) {
                  if (ts.dir.dy === 1)  { s2.spriteDir = 'down';  s2.spriteFlip = false }
                  if (ts.dir.dy === -1) { s2.spriteDir = 'up';    s2.spriteFlip = false }
                  if (ts.dir.dx === 1)  { s2.spriteDir = 'side';  s2.spriteFlip = false }
                  if (ts.dir.dx === -1) { s2.spriteDir = 'side';  s2.spriteFlip = true  }
                  s2.spriteIdle = false
                  s2.moveFrom = { x: s2.px, y: s2.py }
                  s2.moveTo = { x: nx2, y: ny2 }
                  s2.moving = true
                  s2.moveProgress = 0
                  s2.moveStart = performance.now()
                }
              }
            }, 200)
          }
        }
        break
      }
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    const ts = touchStateRef.current
    ts.activeId = null
    if (ts.interval) { clearInterval(ts.interval); ts.interval = null }
    ts.dir = { dx: 0, dy: 0 }
  }, [])

  /* ── A/B button handlers ── */
  const handleButtonA = useCallback(() => {
    const s = stateRef.current
    const building = getBuildingAt(s.px, s.py)
    if (building) {
      onEnterBuilding(building.interiorMapId, building.name)
    } else if (getDetectiveZone(s.px, s.py)) {
      setInteractLabel('DETETIVE: "Você acha que isso aqui é só um joguinho?"')
      setTimeout(() => setInteractLabel(''), 3000)
    }
  }, [onEnterBuilding])

  const handleButtonB = useCallback(() => {
    setShowMenu(p => !p)
  }, [])

  return (
    <div className="city-container">
      {/* ── Canvas wrapper ── */}
      <div
        ref={wrapRef}
        className="city-canvas-wrap"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <canvas ref={canvasRef} id="city-canvas" />
        {/* Player sprite */}
        <div
          ref={playerRef}
          id="city-player"
          style={{
            position: 'absolute',
            width: '32px', height: '32px',
            zIndex: 100,
            pointerEvents: 'none',
            imageRendering: 'pixelated',
            backgroundImage: 'url(/illusionfight-site/assets/playerSheet.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '128px 96px',
            backgroundPosition: '0px 0px',
          }}
        />

        {/* HUD */}
        <div className="city-hud">{hudText}</div>

        {/* Zone HUD */}
        <div className={`city-zone-hud ${zoneVisible ? 'visible' : ''}`}>
          {zoneText}
        </div>

        {/* Interact label */}
        <AnimatePresence>
          {interactLabel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="city-interact-label"
            >
              {interactLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu overlay */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="city-menu-overlay"
              onClick={() => setShowMenu(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="city-menu-panel"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="city-menu-title">MENU</h3>
                <button className="city-menu-btn" onClick={onBackToMenu}>
                  VOLTAR AO MENU PRINCIPAL
                </button>
                <button className="city-menu-btn city-menu-btn-close" onClick={() => setShowMenu(false)}>
                  CONTINUAR
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Game Boy Panel ── */}
      <div className="city-gb-panel">
        <div className="city-controls-area">
          <div className="city-dpad-hint">
            <div className="city-dpad-arrows">
              <span>▲</span>
              <div style={{ display: 'flex', gap: 24 }}>
                <span>◄</span>
                <span>►</span>
              </div>
              <span>▼</span>
            </div>
            <div className="city-dpad-label">WASD / SETAS</div>
          </div>

          <div className="city-ab-buttons">
            <button className="city-btn-ab city-btn-a" onClick={handleButtonA}>A</button>
            <button className="city-btn-ab city-btn-b" onClick={handleButtonB}>B</button>
          </div>
        </div>
      </div>
    </div>
  )
}
