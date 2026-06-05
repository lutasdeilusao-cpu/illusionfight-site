import shutil, os

# Read the current file first
with open('src/pages/Tamagoshi/screens/Passear.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove DOM car overlay (carRef, carStyle, setCarStyle)
# Remove import of kronikIdle (we'll readd)
content = content.replace(
    "import kronikIdle from '../../../assets/images/tamagoshi/kroniki-idle.png'\n\n",
    ""
)

# Remove carRef 
content = content.replace(
    "  const carRef = useRef(null)\n",
    ""
)

# Remove carStyle state
content = content.replace(
    "  const [carStyle, setCarStyle] = useState({})\n\n",
    "\n"
)

# Remove the img loading effect (we'll move it)
content = content.replace(
    "  useEffect(() => {\n    const img = new Image()\n    img.src = kronikIdle\n    img.onload = () => { imgRef.current = img }\n  }, [])\n\n",
    ""
)

# Remove the drawRoad function and replace with full draw
old_draw = '''  function drawRoad() {
    const ca = canvasRef.current; if (!ca) return
    const ctx = ca.getContext('2d'); if (!ctx) return
    const s = g.current
    const W = GAME_W, H = GAME_H, lw = W / LANE_COUNT
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#1e1e4a'; ctx.fillRect(lw, 0, W - lw * 2, H)
    ctx.strokeStyle = '#ffffff88'; ctx.lineWidth = 2; ctx.setLineDash([14, 10])
    for (let i = 1; i < LANE_COUNT; i++) { ctx.beginPath(); ctx.moveTo(lw * i, 0); ctx.lineTo(lw * i, H); ctx.stroke() }
    ctx.setLineDash([])
    ctx.strokeStyle = '#ffffffcc'; ctx.lineWidth = 3
    for (let y = -(48+24) + (s.roadOff % (48+24)); y < H + (48+24); y += 48+24) {
      for (let lane = 1; lane < LANE_COUNT; lane++) { ctx.beginPath(); ctx.moveTo(lw * lane, y); ctx.lineTo(lw * lane, y + 48); ctx.stroke() }
    }
    ctx.font = '32px "Segoe UI Emoji","Apple Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (const ob of s.obstacles) { ctx.fillText(ob.e, ob.x + 21, ob.y + 21) }
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, W, 40)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillText('# ' + s.score, 12, 20)
    ctx.textAlign = 'right'
    let h = ''; for (let i = 0; i < LIVES; i++) h += i < s.lives ? '#' : 'x'
    ctx.fillText(h, W - 12, 20)
    ctx.fillStyle = '#aaa'; ctx.textAlign = 'center'; ctx.font = '12px monospace'
    ctx.fillText('pista ' + s.stage + '/' + STAGE_COUNT, W / 2, 20)
  }'''

new_draw = '''  function draw() {
    const ca = canvasRef.current; if (!ca) return
    const ctx = ca.getContext('2d'); if (!ctx) return
    const s = g.current
    const W = GAME_W, H = GAME_H, lw = W / LANE_COUNT
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#1e1e4a'; ctx.fillRect(lw, 0, W - lw * 2, H)
    ctx.strokeStyle = '#ffffff88'; ctx.lineWidth = 2; ctx.setLineDash([14, 10])
    for (let i = 1; i < LANE_COUNT; i++) { ctx.beginPath(); ctx.moveTo(lw * i, 0); ctx.lineTo(lw * i, H); ctx.stroke() }
    ctx.setLineDash([])
    ctx.strokeStyle = '#ffffffcc'; ctx.lineWidth = 3
    for (let y = -(48+24) + (s.roadOff % (48+24)); y < H + (48+24); y += 48+24) {
      for (let lane = 1; lane < LANE_COUNT; lane++) { ctx.beginPath(); ctx.moveTo(lw * lane, y); ctx.lineTo(lw * lane, y + 48); ctx.stroke() }
    }
    ctx.font = '32px "Segoe UI Emoji","Apple Color Emoji",sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (const ob of s.obstacles) { ctx.fillText(ob.e, ob.x + 21, ob.y + 21) }
    for (const c of s.coins) { ctx.fillText(c.e, c.x + 15, c.y + 15) }
    const cx = lw * s.lane + (lw - 50) / 2 + 25
    const cy = H - 50 - 16 + 25
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, 25, 0, Math.PI * 2)
    ctx.clip()
    if (imgRef.current && imgRef.current.complete) {
      ctx.drawImage(imgRef.current, cx - 25, cy - 25, 50, 50)
    } else {
      ctx.fillStyle = '#FF3366'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 20px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('K', cx, cy + 1)
    }
    ctx.restore()
    ctx.fillStyle = 'rgba(0,0,0,0.8)'
    ctx.fillRect(0, 0, W, 40)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px monospace'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText('\u2B50 ' + s.score, 12, 20)
    ctx.textAlign = 'right'
    let h = ''
    for (let i = 0; i < 3; i++) h += i < s.lives ? '\u2764\uFE0F' : '\uD83D\uDDA4'
    ctx.fillText(h, W - 12, 20)
    ctx.fillStyle = '#aaa'
    ctx.textAlign = 'center'
    ctx.font = '12px monospace'
    ctx.fillText('pista ' + s.stage + '/' + 10, W / 2, 20)
  }'''

content = content.replace(old_draw, new_draw)

# Replace BASED_SPEED
content = content.replace('BASE_SPEED = 2.5', 'BASE_SPEED = 4')
content = content.replace('speed: BASE_SPEED', 'speed: 4')

# Add coins to game state
content = content.replace(
    "lastObs: 0, obstacles: []",
    "lastObs: 0, lastCoin: 0, obstacles: [], coins: []"
)

# Add coin logic to tick
old_obs_check = '''      if (s.frame - (s.lastObs || 0) > Math.max(5, 90 - (s.stage - 1) * 5)) {
        s.lastObs = s.frame
        s.obstacles.push({ x: (GAME_W / LANE_COUNT) * Math.floor(Math.random() * LANE_COUNT), y: -42, e: ['\\U0001F697','\\U0001FAA8','\\U0001F333','\\U0001F699','\\U0001F6FB'][Math.floor(Math.random() * 5)] })
      }
      const cx = laneX(s.lane); const cy = GAME_H - 50 - 16
      s.obstacles = s.obstacles.filter(o => {
        o.y += s.speed
        if (o.y > GAME_H) return false
        if (o.x < cx + 50 - 8 && o.x + 42 > cx + 8 && o.y < cy + 50 - 8 && o.y + 42 > cy + 8) {
          s.lives--
          if (s.lives <= 0) { endGame(); return false }
          return false
        }
        return true
      })
      if (s.score >= s.stage * 500 && s.stage < STAGE_COUNT) { s.stage++; setStage(s.stage) }
      if (s.frame % 15 === 0) setDisp(s.score)
      drawRoad()
      const lw = GAME_W / LANE_COUNT
      const left = lw * s.lane + (lw - 50) / 2
      setCarStyle({ position: 'absolute', bottom: 16, left: left + 'px', width: 50, height: 50, borderRadius: '50%', zIndex: 999,
        background: imgRef.current ? '#fff' : 'white',
        border: '3px solid #FF3366', boxShadow: '0 0 20px rgba(255,51,102,0.9)',
        overflow: 'hidden',
      })'''

new_obs_check = '''      if (s.frame - (s.lastObs || 0) > Math.max(30, 70 - (s.stage - 1) * 5)) {
        s.lastObs = s.frame
        s.obstacles.push({ x: (GAME_W / LANE_COUNT) * Math.floor(Math.random() * LANE_COUNT), y: -42, e: ['\U0001F697','\U0001FAA8','\U0001F333','\U0001F699','\U0001F6FB'][Math.floor(Math.random() * 5)] })
      }
      if (s.frame - (s.lastCoin || 0) > 10) {
        s.lastCoin = s.frame
        s.coins.push({ x: (GAME_W / LANE_COUNT) * Math.floor(Math.random() * LANE_COUNT) + 7, y: -30, e: ['\u2B50','\U0001F34E','\U0001F48E'][Math.floor(Math.random() * 3)] })
      }
      const cx = laneX(s.lane); const cy = GAME_H - 50 - 16
      s.obstacles = s.obstacles.filter(o => {
        o.y += s.speed
        if (o.y > GAME_H) return false
        if (o.x < cx + 50 - 8 && o.x + 42 > cx + 8 && o.y < cy + 50 - 8 && o.y + 42 > cy + 8) {
          s.lives--
          if (s.lives <= 0) { endGame(); return false }
          return false
        }
        return true
      })
      s.coins = s.coins.filter(c => {
        c.y += s.speed
        if (c.y > GAME_H) return false
        if (c.x < cx + 50 - 4 && c.x + 30 > cx + 8 && c.y < cy + 50 - 4 && c.y + 30 > cy + 8) {
          s.score += 50
          return false
        }
        return true
      })
      if (s.score >= s.stage * 500 && s.stage < STAGE_COUNT) { s.stage++; setStage(s.stage) }
      if (s.frame % 10 === 0) setDisp(s.score)
      draw()'''

content = content.replace(old_obs_check, new_obs_check)

# Remove setCarStyle from startGame
old_start = '''  function startGame() {
    g.current = { running: true, lane: 2, score: 0, lives: LIVES, stage: 1, frame: 1, roadOff: 0, speed: BASE_SPEED, lastObs: 0, obstacles: [] }
    setStage(1); setDisp(0); setPhase('playing')
    const lw = GAME_W / LANE_COUNT
    setCarStyle({ position: 'absolute', bottom: 16, left: (lw * 2 + (lw - 50) / 2) + 'px', width: 50, height: 50, borderRadius: '50%', zIndex: 999,
      background: '#fff', border: '3px solid #FF3366', boxShadow: '0 0 20px rgba(255,51,102,0.9)',
    })
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, 33)
  }'''

new_start = '''  function startGame() {
    g.current = { running: true, lane: 2, score: 0, lives: 3, stage: 1, frame: 1, roadOff: 0, speed: 4, lastObs: 0, lastCoin: 0, obstacles: [], coins: [] }
    setStage(1); setDisp(0); setPhase('playing')
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, 30)
  }'''

content = content.replace(old_start, new_start)

# Remove carRef from JSX
content = content.replace(
    '            <div ref={carRef} style={carStyle} />\n',
    ''
)

content = content.replace(
    '<div ref={carRef} style={carStyle} />',
    ''
)

# Remove the second interval (car position updater) since car is now on canvas
old_update_int = '''  useEffect(() => {
    if (phase !== 'playing') return
    const update = setInterval(() => {
      const s = g.current; if (!s.running) return
      const lw = GAME_W / LANE_COUNT
      const left = lw * s.lane + (lw - 50) / 2
      setCarStyle(prev => ({ ...prev, left: left + 'px' }))
    }, 50)
    return () => clearInterval(update)
  }, [phase])
'''

content = content.replace(old_update_int, '')

# Change interval cleanup
content = content.replace(
    "if (intervalRef.current) clearInterval(intervalRef.current); g.current.running = false",
    "if (intervalRef.current) clearInterval(intervalRef.current); g.current.running = false"
)

# Replace 'delay ' + s.stage to use stars
content = content.replace(
    "'# ' + s.score",
    "'\\u2B50 ' + s.score"
)

# Replace hearts
content = content.replace(
    "for (let i = 0; i < 3; i++) h += i < s.lives ? '#' : 'x'",
    "for (let i = 0; i < 3; i++) h += i < s.lives ? '\\u2764\\uFE0F' : '\\U0001F5A4'",
)

with open('src/pages/Tamagoshi/screens/Passear.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done, size:', len(content))
