import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import kronikiHappy from '../../../assets/images/tamagoshi/kroniki-happy.png'
import GameControls from '../components/GameControls'

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */
const STEP        = 32
const STEP_MS     = 80
const SPRITE_W    = 32
const SPRITE_H    = 32
const ANALOG_RADIUS = 40

const MAP_W = 55
const MAP_H = 30
const WORLD_W = MAP_W * STEP
const WORLD_H = MAP_H * STEP

const TILE_COLORS = {
  grass: '#2d5a1e', dark_grass: '#1e3d14',
  path: '#8a9a6a', dark_path: '#6a7a4e', water: '#1a3a5a',
}

const BUILDINGS = [
  { id: 'yohualticit', name: 'PRÉDIO DA YOHUALTICIT', x:18, y:4, w:8, h:7, color:'#8b1a1a', labelColor:'#cc4444', interiorMapId:'yohualticit' },
  { id: 'jao', name: 'MERCADINHO DO SEU JÃO', x:8, y:14, w:6, h:4, color:'#c47820', labelColor:'#e8a040', interiorMapId:'jao' },
  { id: 'recovery', name: 'RECOVERY CENTER', x:38, y:14, w:5, h:4, color:'#2a6040', labelColor:'#40a060', interiorMapId:'recovery' },
  { id: 'bar', name: 'BAR DO ZÉ', x:30, y:20, w:5, h:4, color:'#6b3a50', labelColor:'#a05070', interiorMapId:'bar' },
  { id: 'training', name: 'TRAINING CENTER', x:40, y:22, w:5, h:4, color:'#2a4060', labelColor:'#4060a0', interiorMapId:'training' },
  { id: 'fashion', name: 'FASHION CENTER', x:10, y:22, w:5, h:4, color:'#804060', labelColor:'#b06090', interiorMapId:'fashion' },
  { id: 'save', name: 'SAVE CENTER', x:26, y:12, w:4, h:3, color:'#505a50', labelColor:'#707a70', interiorMapId:'save' },
  { id: 'casa', name: 'CASA DO PERSONAGEM', x:4, y:24, w:4, h:3, color:'#6b4a20', labelColor:'#a07030', interiorMapId:'casa' },
]

const DETECTIVE = { x: 780, y: 600 }
const ZONE_DOOR_W = 3, ZONE_DOOR_H = 3

function getBuildingAt(px, py) {
  const tx = Math.floor(px / STEP), ty = Math.floor(py / STEP)
  for (const b of BUILDINGS) {
    const doorX = b.x + Math.floor(b.w / 2) - 1, doorY = b.y + b.h
    if (tx >= doorX && tx < doorX + ZONE_DOOR_W && ty >= doorY && ty < doorY + ZONE_DOOR_H) return b
  }
  return null
}

function getDetectiveZone(px, py) {
  const tx = Math.floor(px / STEP), ty = Math.floor(py / STEP)
  const detTx = Math.floor(DETECTIVE.x / STEP), detTy = Math.floor(DETECTIVE.y / STEP)
  return tx >= detTx - 1 && tx <= detTx + 1 && ty >= detTy - 1 && ty <= detTy + 1
}

function isSolid(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true
  for (const b of BUILDINGS) { if (tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return true }
  if (tx === 0 || ty === 0 || tx === MAP_W - 1 || ty === MAP_H - 1) return true
  const water = [{x:0,y:0,w:3,h:4},{x:23,y:0,w:3,h:3},{x:0,y:26,w:3,h:3},{x:44,y:0,w:10,h:5}]
  for (const w of water) { if (tx >= w.x && tx < w.x + w.w && ty >= w.y && ty < w.y + w.h) return true }
  const obs = [{x:14,y:8,w:1,h:2},{x:28,y:18,w:2,h:1},{x:35,y:8,w:1,h:3},{x:6,y:10,w:2,h:2}]
  for (const o of obs) { if (tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h) return true }
  return false
}

function playerCollides(px, py) {
  const hit = { ox: 8, oy: 22, w: 16, h: 8 }
  const pts = [
    [px+hit.ox, py+hit.oy], [px+hit.ox+hit.w-1, py+hit.oy],
    [px+hit.ox, py+hit.oy+hit.h-1], [px+hit.ox+hit.w-1, py+hit.oy+hit.h-1],
  ]
  return pts.some(([x,y]) => isSolid(Math.floor(x/STEP), Math.floor(y/STEP)))
}

const ZONES = [
  { name:'PRAÇA CENTRAL', tx:14, ty:8, tw:10, th:6, color:'#e8c96a' },
  { name:'BAIRRO COMERCIAL', tx:4, ty:14, tw:14, th:10, color:'#6ab4e8' },
  { name:'BAIRRO RESIDENCIAL', tx:28, ty:14, tw:14, th:10, color:'#6ae8a0' },
  { name:'DISTRITO SUL', tx:4, ty:24, tw:14, th:6, color:'#c96ae8' },
  { name:'ÁREA DA YOHUALTICIT', tx:18, ty:0, tw:14, th:6, color:'#e86a6a' },
]

function getZoneName(tileX, tileY) {
  for (const z of ZONES) { if (tileX >= z.tx && tileX < z.tx+z.tw && tileY >= z.ty && tileY < z.ty+z.th) return z.name }
  return null
}

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export default function CityOverworld({ onEnterBuilding, onBackToMenu, spawnPoint }) {
  const canvasRef = useRef(null)
  const playerRef = useRef(null)
  const wrapRef = useRef(null)
  const mmCanvasRef = useRef(null)
  const mmPlayerRef = useRef(null)
  const animRef = useRef(null)

  const [hudText, setHudText] = useState({ pos:'', cam:'', tile:'' })
  const [zoneText, setZoneText] = useState('')
  const [zoneVisible, setZoneVisible] = useState(false)
  const [interactLabel, setInteractLabel] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const initialX = spawnPoint?.x ?? 20*STEP
  const initialY = spawnPoint?.y ?? 16*STEP
  const s = useRef({
    px:initialX, py:initialY, camX:0, camY:0,
    moving:false, moveFrom:{x:0,y:0}, moveTo:{x:0,y:0},
    moveProgress:1, moveStart:0, currentZone:null,
  })

  /* ── Draw map ── */
  const drawMap = useCallback(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false
    ctx.fillStyle = '#1a2a10'; ctx.fillRect(0,0,WORLD_W,WORLD_H)
    for (let ty=0; ty<MAP_H; ty++) for (let tx=0; tx<MAP_W; tx++) {
      const x=tx*STEP, y=ty*STEP
      let color = TILE_COLORS.grass
      const mH = ty>=13&&ty<=15, mV = tx>=12&&tx<=14
      const pH = (ty>=7&&ty<=9)||(ty>=13&&ty<=15)||(ty>=19&&ty<=21)||(ty>=23&&ty<=25)
      const pV = (tx>=5&&tx<=7)||(tx>=13&&tx<=15)||(tx>=21&&tx<=23)||(tx>=31&&tx<=33)||(tx>=39&&tx<=41)
      if ((mH&&tx>=2&&tx<=24)||(mV&&ty>=2&&ty<=24)) color = TILE_COLORS.path
      else if (pH||pV) color = TILE_COLORS.path
      else if ((tx+ty)%11===0) color = TILE_COLORS.dark_grass
      const wz = [{x:0,y:0,w:3,h:4},{x:23,y:0,w:3,h:3},{x:0,y:26,w:3,h:3},{x:44,y:0,w:10,h:5}]
      for (const w of wz) { if (tx>=w.x&&tx<w.x+w.w&&ty>=w.y&&ty<w.y+w.h) { color=TILE_COLORS.water; break } }
      ctx.fillStyle=color; ctx.fillRect(x,y,STEP,STEP)
      ctx.strokeStyle='rgba(0,0,0,0.08)'; ctx.strokeRect(x,y,STEP,STEP)
    }
    BUILDINGS.forEach(b => {
      const bx=b.x*STEP, by=b.y*STEP, bw=b.w*STEP, bh=b.h*STEP
      ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(bx+4,by+4,bw,bh)
      ctx.fillStyle=b.color; ctx.fillRect(bx,by,bw,bh)
      ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=2; ctx.strokeRect(bx,by,bw,bh)
      ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(bx,by,bw,4)
      const dx=bx+(b.w*STEP)/2-6, dy=by+bh-4
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(dx,dy,12,4)
      ctx.fillStyle=b.labelColor; ctx.font='bold 7px monospace'; ctx.textAlign='center'
      ctx.fillText(b.name, bx+bw/2, by+bh+14)
      if (b.id==='training') { ctx.fillStyle='#ff4444'; ctx.font='bold 5px monospace'; ctx.fillText('SÓ ASSINANTES', bx+bw/2, by+bh+24) }
    })
    ctx.fillStyle='#cc3333'; ctx.fillRect(DETECTIVE.x,DETECTIVE.y,10,14)
    ctx.fillStyle='#222'; ctx.fillRect(DETECTIVE.x-2,DETECTIVE.y-2,14,4)
    ctx.fillStyle='#cc3333'; ctx.font='bold 6px monospace'; ctx.textAlign='center'
    ctx.fillText('DETETIVE', DETECTIVE.x+5, DETECTIVE.y-6)
    const trees = [[200,300],[250,400],[350,250],[500,350],[600,280],[700,500],[300,550],[450,650],[550,450],[150,500],[850,300],[900,600],[100,700],[650,700],[350,750]]
    trees.forEach(([tx,ty]) => {
      ctx.fillStyle='#1a4a10'; ctx.beginPath(); ctx.arc(tx,ty,8,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#2a6a18'; ctx.beginPath(); ctx.arc(tx-2,ty-2,5,0,Math.PI*2); ctx.fill()
    })
    ;[[450,450],[550,550],[350,400],[650,500]].forEach(([lx,ly]) => {
      ctx.fillStyle='#666'; ctx.fillRect(lx,ly,2,10)
      ctx.fillStyle='#ffd700'; ctx.fillRect(lx-1,ly-2,4,3)
    })
  },[])

  /* ── Init canvas + minimap ── */
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    c.width=WORLD_W; c.height=WORLD_H; drawMap()
    const mm = mmCanvasRef.current
    if (mm) {
      mm.width=80; mm.height=80
      const mctx = mm.getContext('2d'); mctx.imageSmoothingEnabled=false
      mctx.drawImage(c,0,0,WORLD_W,WORLD_H,0,0,80,80)
      mctx.globalAlpha=0.25; const sx=80/WORLD_W, sy=80/WORLD_H
      ZONES.forEach(z => { mctx.fillStyle=z.color; mctx.fillRect(z.tx*STEP*sx, z.ty*STEP*sy, z.tw*STEP*sx, z.th*STEP*sy) })
      mctx.globalAlpha=1
    }
  },[drawMap])

  /* ── Game Loop ── */
  useEffect(() => {
    const player = playerRef.current, canvas = canvasRef.current, mmPlayer = mmPlayerRef.current
    if (!canvas||!player) return
    const VW=480, VH=700, PH=160, VHe=VH-PH
    let zt = null
    function move() {
      if (!s.current.moving) return
      const e = performance.now()-s.current.moveStart
      s.current.moveProgress = Math.min(e/STEP_MS,1)
      const t = 1-(1-s.current.moveProgress)*(1-s.current.moveProgress)
      s.current.px = s.current.moveFrom.x + (s.current.moveTo.x-s.current.moveFrom.x)*t
      s.current.py = s.current.moveFrom.y + (s.current.moveTo.y-s.current.moveFrom.y)*t
      if (s.current.moveProgress>=1) { s.current.px=s.current.moveTo.x; s.current.py=s.current.moveTo.y; s.current.moving=false }
    }
    function zone() {
      const tx=Math.floor(s.current.px/STEP), ty=Math.floor(s.current.py/STEP)
      const z = getZoneName(tx,ty)
      if (z!==s.current.currentZone) {
        s.current.currentZone=z
        if (z) { setZoneText(z); setZoneVisible(true); if (zt) clearTimeout(zt); zt=setTimeout(()=>setZoneVisible(false),3000) }
        else setZoneVisible(false)
      }
      const b = getBuildingAt(s.current.px,s.current.py)
      if (b) setInteractLabel(`[A] ENTRAR: ${b.name}`)
      else if (getDetectiveZone(s.current.px,s.current.py)) setInteractLabel('[A] FALAR COM DETETIVE')
      else setInteractLabel('')
    }
    function loop() {
      move()
      const tcx = s.current.px-VW/2+SPRITE_W/2, tcy = s.current.py-VHe/2+SPRITE_H/2-PH/2
      s.current.camX += (tcx-s.current.camX)*0.08; s.current.camY += (tcy-s.current.camY)*0.08
      s.current.camX = Math.max(0,Math.min(WORLD_W-VW,s.current.camX))
      s.current.camY = Math.max(0,Math.min(WORLD_H-VHe,s.current.camY))
      canvas.style.transform = `translate(${-s.current.camX}px,${-s.current.camY}px)`
      player.style.left = (s.current.px-s.current.camX)+'px'
      player.style.top = (s.current.py-s.current.camY+2)+'px'
      const tx=Math.floor(s.current.px/STEP), ty=Math.floor(s.current.py/STEP)
      setHudText({pos:`${Math.round(s.current.px)},${Math.round(s.current.py)}`, cam:`${Math.round(s.current.camX)},${Math.round(s.current.camY)}`, tile:`${tx},${ty}`})
      if (mmPlayer) { mmPlayer.style.left = (s.current.px/WORLD_W)*80+'px'; mmPlayer.style.top = (s.current.py/WORLD_H)*80+'px' }
      zone(); animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return ()=>{if(animRef.current)cancelAnimationFrame(animRef.current);if(zt)clearTimeout(zt)}
  },[])

  /* ── Teclado removido — jogo 100% touch/mobile ── */

  /* ── GameControls callbacks ── */
  const handleAnalogMove = useCallback((dx, dy) => {
    const st = s.current
    if (st.moving) return
    const nx=Math.round(st.px/STEP)*STEP+dx*STEP, ny=Math.round(st.py/STEP)*STEP+dy*STEP
    if (nx<0||ny<0||nx+SPRITE_W>WORLD_W||ny+SPRITE_H>WORLD_H||playerCollides(nx,ny)) return
    st.moveFrom={x:st.px,y:st.py}; st.moveTo={x:nx,y:ny}; st.moving=true; st.moveProgress=0; st.moveStart=performance.now()
  },[])

  const hBA = useCallback(() => {
    const b=getBuildingAt(s.current.px,s.current.py)
    if (b) onEnterBuilding(b.interiorMapId,b.name)
    else if (getDetectiveZone(s.current.px,s.current.py)) { setInteractLabel('DETETIVE: "Você acha que isso aqui é só um joguinho?"'); setTimeout(()=>setInteractLabel(''),3000) }
  },[onEnterBuilding])
  const hBB = useCallback(()=>setShowMenu(p=>!p),[])

  return (
    <div className="city-container">
      <div ref={wrapRef} className="city-canvas-wrap">
        <canvas ref={canvasRef} id="city-canvas" />

        <div ref={playerRef} className="city-player" style={{position:'absolute',width:'28px',height:'28px',zIndex:100,pointerEvents:'none'}}>
          <div className="city-player-inner"><img src={kronikiHappy} alt="" className="city-player-img" /></div>
        </div>

        <div className="city-hud">
          <div>POS: {hudText.pos}</div>
          <div>CAM: {hudText.cam}</div>
          <div>TILE: {hudText.tile}</div>
        </div>

        <div className={`city-zone-hud ${zoneVisible?'visible':''}`}>{zoneText}</div>

        <div className="city-minimap">
          <canvas ref={mmCanvasRef} className="city-minimap-canvas" />
          <div ref={mmPlayerRef} className="city-mm-player" />
          <div className="city-minimap-border" />
        </div>

        <AnimatePresence>{interactLabel&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="city-interact-label">{interactLabel}</motion.div>
        )}</AnimatePresence>

        <AnimatePresence>{showMenu&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="city-menu-overlay" onClick={()=>setShowMenu(false)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="city-menu-panel" onClick={e=>e.stopPropagation()}>
              <h3 className="city-menu-title">MENU</h3>
              <button className="city-menu-btn" onClick={onBackToMenu}>VOLTAR AO MENU PRINCIPAL</button>
              <button className="city-menu-btn city-menu-btn-close" onClick={()=>setShowMenu(false)}>CONTINUAR</button>
            </motion.div>
          </motion.div>
        )}</AnimatePresence>
      </div>

      <GameControls onMove={handleAnalogMove} onA={hBA} onB={hBB} />
    </div>
  )
}
