import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import kronikiHappy from '../../../assets/images/tamagoshi/kroniki-happy.png'
import GameControls from '../components/GameControls'
import CityHUD from '../components/CityHUD'
import { useLanguage } from '../../../context/LanguageContext'
import {
  DISTRITOS,
  getTileColorName,
  isSolid,
  getBuildingAt,
  getNpcAt,
  getExitAt,
  getZonaNome,
} from '../data/districts'

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */
const STEP        = 32
const STEP_MS     = 80
const SPRITE_W    = 32
const SPRITE_H    = 32

function playerCollides(px, py, distrito) {
  const hit = { ox: 8, oy: 22, w: 16, h: 8 }
  const pts = [
    [px+hit.ox, py+hit.oy], [px+hit.ox+hit.w-1, py+hit.oy],
    [px+hit.ox, py+hit.oy+hit.h-1], [px+hit.ox+hit.w-1, py+hit.oy+hit.h-1],
  ]
  return pts.some(([x,y]) => isSolid(distrito, Math.floor(x/STEP), Math.floor(y/STEP)))
}

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export default function CityOverworld({
  districtId = 'central',
  onEnterBuilding,
  onDistrictTransition,
  onBackToMenu,
  spawnPoint,
}) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const playerRef = useRef(null)
  const wrapRef = useRef(null)
  const mmCanvasRef = useRef(null)
  const mmPlayerRef = useRef(null)
  const animRef = useRef(null)
  const distritoRef = useRef(null)

  const [hudText, setHudText] = useState({ pos:'', cam:'', tile:'' })
  const [zoneText, setZoneText] = useState('')
  const [zoneVisible, setZoneVisible] = useState(false)
  const [interactLabel, setInteractLabel] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [npcDialog, setNpcDialog] = useState(null)

  const distrito = DISTRITOS[districtId]
  const WORLD_W = distrito.mapW * STEP
  const WORLD_H = distrito.mapH * STEP
  const TILE_COLORS = distrito.tileColors

  // Resolve nome do prédio via i18n
  const buildingName = useCallback((b) => t(b.nameKey), [t])
  const zoneNameFn = useCallback((z) => t(z.nameKey), [t])

  const initialX = spawnPoint?.x ?? 20*STEP
  const initialY = spawnPoint?.y ?? 16*STEP
  const s = useRef({
    px:initialX, py:initialY, camX:0, camY:0,
    moving:false, moveFrom:{x:0,y:0}, moveTo:{x:0,y:0},
    moveProgress:1, moveStart:0, currentZone:null,
    transitioning: false,
    pendingExit: null,
  })

  // Atualiza posição quando spawnPoint muda (transição entre distritos)
  useEffect(() => {
    if (spawnPoint?.x != null && spawnPoint?.y != null) {
      s.current.px = spawnPoint.x
      s.current.py = spawnPoint.y
      s.current.moveProgress = 1
      s.current.moving = false
      s.current.camX = 0
      s.current.camY = 0
    }
    // Mostra nome do distrito ao entrar
    const name = districtId === 'central' ? t('tatics.zones.central')
      : districtId === 'residencial' ? t('tatics.zones.residencial')
      : t('tatics.zones.comercial')
    setZoneText(name)
    setZoneVisible(true)
    const zt = setTimeout(() => setZoneVisible(false), 3000)
    return () => clearTimeout(zt)
  }, [spawnPoint, districtId, t])

  /* ── Draw map ── */
  const drawMap = useCallback(() => {
    distritoRef.current = distrito
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false
    ctx.fillStyle = '#1a2a10'; ctx.fillRect(0,0,WORLD_W,WORLD_H)

    for (let ty=0; ty<distrito.mapH; ty++) for (let tx=0; tx<distrito.mapW; tx++) {
      const x=tx*STEP, y=ty*STEP
      const tileName = getTileColorName(distrito, tx, ty)
      ctx.fillStyle = TILE_COLORS[tileName] || TILE_COLORS.grass
      ctx.fillRect(x,y,STEP,STEP)
      ctx.strokeStyle='rgba(0,0,0,0.08)'; ctx.strokeRect(x,y,STEP,STEP)
    }

    distrito.buildings.forEach(b => {
      const bx=b.x*STEP, by=b.y*STEP, bw=b.w*STEP, bh=b.h*STEP
      ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(bx+4,by+4,bw,bh)
      ctx.fillStyle=b.color; ctx.fillRect(bx,by,bw,bh)
      ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=2; ctx.strokeRect(bx,by,bw,bh)
      ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(bx,by,bw,4)
      const dx=bx+(b.w*STEP)/2-6, dy=by+bh-4
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(dx,dy,12,4)
      ctx.fillStyle=b.labelColor; ctx.font='bold 7px monospace'; ctx.textAlign='center'
      ctx.fillText(buildingName(b), bx+bw/2, by+bh+14)
      if (b.subOnly) { ctx.fillStyle='#ff4444'; ctx.font='bold 5px monospace'; ctx.fillText(t('tatics.city.sub_only'), bx+bw/2, by+bh+24) }
    })

    distrito.npcs.forEach(npc => {
      ctx.fillStyle = npc.color || '#cc3333'
      ctx.fillRect(npc.x, npc.y, npc.w || 10, npc.h || 14)
      ctx.fillStyle = '#222'
      ctx.fillRect(npc.x - 2, npc.y - 2, (npc.w || 10) + 4, 4)
      ctx.fillStyle = npc.color || '#cc3333'
      ctx.font = 'bold 6px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(t(npc.nameKey), npc.x + (npc.w || 10) / 2, npc.y - 6)
    })

    distrito.trees.forEach(([tx,ty]) => {
      ctx.fillStyle='#1a4a10'; ctx.beginPath(); ctx.arc(tx,ty,8,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#2a6a18'; ctx.beginPath(); ctx.arc(tx-2,ty-2,5,0,Math.PI*2); ctx.fill()
    })
    distrito.lamps.forEach(([lx,ly]) => {
      ctx.fillStyle='#666'; ctx.fillRect(lx,ly,2,10)
      ctx.fillStyle='#ffd700'; ctx.fillRect(lx-1,ly-2,4,3)
    })
  },[districtId, buildingName, t, WORLD_W, WORLD_H, distrito])

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
      distrito.zonas.forEach(z => { mctx.fillStyle=z.color; mctx.fillRect(z.tx*STEP*sx, z.ty*STEP*sy, z.tw*STEP*sx, z.th*STEP*sy) })
      mctx.globalAlpha=1
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[drawMap, districtId])

  /* ── Game Loop ── */
  useEffect(() => {
    const player = playerRef.current, canvas = canvasRef.current, mmPlayer = mmPlayerRef.current
    if (!canvas||!player) return
    const VW=480, VH=700, PH=160, VHe=VH-PH
    let zt = null
    let currentDistrito = distrito

    function move() {
      if (!s.current.moving) return
      const e = performance.now()-s.current.moveStart
      s.current.moveProgress = Math.min(e/STEP_MS,1)
      const t = 1-(1-s.current.moveProgress)*(1-s.current.moveProgress)
      s.current.px = s.current.moveFrom.x + (s.current.moveTo.x-s.current.moveFrom.x)*t
      s.current.py = s.current.moveFrom.y + (s.current.moveTo.y-s.current.moveFrom.y)*t
      if (s.current.moveProgress>=1) { s.current.px=s.current.moveTo.x; s.current.py=s.current.moveTo.y; s.current.moving=false }
    }

    function checkZones() {
      const tx=Math.floor(s.current.px/STEP), ty=Math.floor(s.current.py/STEP)
      const z = getZonaNome(tx, ty, currentDistrito.zonas)
      const zName = z ? zoneNameFn(z) : ''
      if (zName !== s.current.currentZone) {
        s.current.currentZone = zName
        if (zName) { setZoneText(zName); setZoneVisible(true); if (zt) clearTimeout(zt); zt=setTimeout(()=>setZoneVisible(false),3000) }
        else setZoneVisible(false)
      }

      // Interagir com prédios
      const b = getBuildingAt(s.current.px, s.current.py, currentDistrito)
      if (b) { setInteractLabel(t('tatics.city.interact_enter', { name: buildingName(b) })); return }

      // Interagir com saída de distrito
      const exit = getExitAt(s.current.px, s.current.py, currentDistrito)
      if (exit) {
        const exitName = exit.to === 'residencial' ? t('tatics.zones.residencial')
          : exit.to === 'central' ? t('tatics.zones.central')
          : t('tatics.zones.comercial')
        setInteractLabel(`[A] IR PARA: ${exitName}`)
        s.current.pendingExit = exit
        return
      }

      setInteractLabel('')
      s.current.pendingExit = null
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
      checkZones()
      checkExit()
      animRef.current = requestAnimationFrame(loop)
    }

    currentDistrito = distrito
    animRef.current = requestAnimationFrame(loop)
    return ()=>{if(animRef.current)cancelAnimationFrame(animRef.current);if(zt)clearTimeout(zt)}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[districtId, onDistrictTransition, buildingName, zoneNameFn, t])

  /* ── GameControls callbacks ── */
  const handleAnalogMove = useCallback((dx, dy) => {
    const st = s.current
    if (st.moving) return
    const d = distritoRef.current || DISTRITOS[districtId]
    const nx=Math.round(st.px/STEP)*STEP+dx*STEP, ny=Math.round(st.py/STEP)*STEP+dy*STEP
    if (nx<0||ny<0||nx+SPRITE_W>d.mapW*STEP||ny+SPRITE_H>d.mapH*STEP||playerCollides(nx,ny,d)) return
    st.moveFrom={x:st.px,y:st.py}; st.moveTo={x:nx,y:ny}; st.moving=true; st.moveProgress=0; st.moveStart=performance.now()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[districtId])

  const hBA = useCallback(() => {
    const d = distritoRef.current || DISTRITOS[districtId]

    // NPC dialog
    const npc = getNpcAt(s.current.px, s.current.py, d)
    if (npc) {
      setNpcDialog(t(npc.dialogKey || 'tatics.city.detective_dialog'))
      setTimeout(() => setNpcDialog(null), 3000)
      return
    }

    // Saída de distrito (manual — só quando aperta A)
    if (s.current.pendingExit && !s.current.transitioning) {
      const exit = s.current.pendingExit
      s.current.transitioning = true
      setTransitioning(true)
      setTimeout(() => {
        s.current.transitioning = false
        s.current.pendingExit = null
        onDistrictTransition(exit.to, { x: exit.spawnTile.x * STEP, y: exit.spawnTile.y * STEP })
        setTransitioning(false)
      }, 350)
      return
    }

    // Entrar em prédio
    const b = getBuildingAt(s.current.px, s.current.py, d)
    if (b) onEnterBuilding(b.interiorMapId, buildingName(b))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[onEnterBuilding, districtId, buildingName, t, onDistrictTransition])

  const hBB = useCallback(()=>setShowMenu(p=>!p),[])

  const districtName = districtId === 'central'
    ? t('tatics.zones.central')
    : districtId === 'residencial'
      ? t('tatics.zones.residencial')
      : t('tatics.zones.comercial')

  return (
    <div className="city-container">
      <AnimatePresence mode="wait">
        {!transitioning && (
          <motion.div
            key={districtId}
            ref={wrapRef}
            className="city-canvas-wrap"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.25 }}
          >
            <canvas ref={canvasRef} id="city-canvas" />

            <div ref={playerRef} className="city-player">
              <div className="city-player-inner"><img src={kronikiHappy} alt="" className="city-player-img" /></div>
            </div>

            <div className="city-hud">
              <div>{t('tatics.city.hud_pos')}: {hudText.pos}</div>
              <div>{t('tatics.city.hud_cam')}: {hudText.cam}</div>
              <div>{t('tatics.city.hud_tile')}: {hudText.tile}</div>
            </div>

            <CityHUD
              districtName={districtName}
              zoneText={zoneText}
              zoneVisible={zoneVisible}
              interactLabel={interactLabel}
              npcDialog={npcDialog}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              onBackToMenu={onBackToMenu}
              t={t}
            />

            <div className="city-minimap">
              <canvas ref={mmCanvasRef} className="city-minimap-canvas" />
              <div ref={mmPlayerRef} className="city-mm-player" />
              <div className="city-minimap-border" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GameControls onMove={handleAnalogMove} onA={hBA} onB={hBB} />
    </div>
  )
}
