import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import kronikiHappy from "../../../../assets/images/tamagoshi/01/kroniki-happy.png";
import GameControls from '../components/GameControls'
import { useLanguage } from '../../../../context/LanguageContext'

const STEP = 32
const STEP_MS = 80
const SPRITE_W = 32
const SPRITE_H = 32
const INTERIOR_SIZE = 800

const INTERIOR_NAMES = {}

const interiorSpawns = {
  yohualticit: { x: 200, y: 450 },
  jao: { x: 150, y: 200 },
  recovery: { x: 150, y: 200 },
  bar: { x: 150, y: 200 },
  training: { x: 150, y: 200 },
  fashion: { x: 150, y: 200 },
  save: { x: 150, y: 200 },
  casa: { x: 150, y: 200 },
  info: { x: 200, y: 300 },
  equipment_shop: { x: 200, y: 300 },
  biblioteca: { x: 200, y: 300 },
  arena_sub: { x: 200, y: 300 },
  concessionaria: { x: 200, y: 300 },
}

const EXIT_ZONE = { x: 350, y: 750, w: 100, h: 50, name: 'SAIDA' }

function getInteriorColliders(mapId) {
  const cols = []

  if (mapId === 'yohualticit') {
    cols.push({ x: 0, y: 0, w: 800, h: 16 })
    cols.push({ x: 0, y: 0, w: 16, h: 600 })
    cols.push({ x: 784, y: 0, w: 16, h: 600 })
    cols.push({ x: 0, y: 584, w: 350, h: 16 })
    cols.push({ x: 450, y: 584, w: 350, h: 16 })
    cols.push({ x: 350, y: 200, w: 100, h: 40 })
    for (let i = 0; i < 10; i++) {
      cols.push({ x: 50, y: 40 + i * 50, w: 60, h: 4 })
      cols.push({ x: 690, y: 40 + i * 50, w: 60, h: 4 })
    }
    cols.push({ x: 350, y: 100, w: 100, h: 8 })
  } else {
    cols.push({ x: 0, y: 0, w: 800, h: 16 })
    cols.push({ x: 0, y: 0, w: 16, h: 800 })
    cols.push({ x: 784, y: 0, w: 16, h: 800 })
  }
  return cols
}

function isInteriorSolid(x, y, mapId) {
  const cols = getInteriorColliders(mapId)
  for (const c of cols) {
    if (x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h) return true
  }
  if (x < 0 || y < 0 || x >= INTERIOR_SIZE || y >= INTERIOR_SIZE) return true
  return false
}

function playerCollidesInterior(px, py, mapId) {
  const hit = { ox: 8, oy: 22, w: 16, h: 8 }
  const points = [
    { x: px + hit.ox, y: py + hit.oy },
    { x: px + hit.ox + hit.w - 1, y: py + hit.oy },
    { x: px + hit.ox, y: py + hit.oy + hit.h - 1 },
    { x: px + hit.ox + hit.w - 1, y: py + hit.oy + hit.h - 1 },
  ]
  return points.some(p => isInteriorSolid(p.x, p.y, mapId))
}

function getInteriorZone(px, py) {
  if (px >= EXIT_ZONE.x && px < EXIT_ZONE.x + EXIT_ZONE.w &&
      py >= EXIT_ZONE.y && py < EXIT_ZONE.y + EXIT_ZONE.h) {
    return 'SAIDA'
  }
  return null
}

function buildInterior(ctx, mapId) {
  const W = INTERIOR_SIZE, H = INTERIOR_SIZE

  ctx.fillStyle = '#3a3a30'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  for (let x = 0; x < W; x += STEP) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += STEP) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  switch (mapId) {
    case 'yohualticit': {
      ctx.fillStyle = '#4a4a3a'
      ctx.fillRect(16, 16, 768, 568)

      ctx.fillStyle = '#5a4a3a'
      ctx.fillRect(350, 200, 100, 40)
      ctx.fillStyle = '#6a5a4a'
      ctx.fillRect(355, 205, 90, 30)
      ctx.font = 'bold 10px monospace'
      ctx.fillStyle = '#e8c96a'
      ctx.textAlign = 'center'
      ctx.fillText('RECEPÇÃO', 400, 225)

      const leftDoorX = 50, rightDoorX = 690
      for (let i = 0; i < 10; i++) {
        const yPos = 40 + i * 50
        ctx.fillStyle = '#5a3a2a'
        ctx.fillRect(leftDoorX, yPos, 60, 36)
        ctx.fillStyle = '#6a4a3a'
        ctx.fillRect(leftDoorX + 2, yPos + 2, 56, 32)
        ctx.fillStyle = '#e8c96a'
        ctx.font = 'bold 7px monospace'
        ctx.fillText(`ANDAR ${String(i + 1).padStart(2, '0')}`, leftDoorX + 30, yPos + 22)

        ctx.fillStyle = '#5a3a2a'
        ctx.fillRect(rightDoorX, yPos, 60, 36)
        ctx.fillStyle = '#6a4a3a'
        ctx.fillRect(rightDoorX + 2, yPos + 2, 56, 32)
        ctx.fillStyle = '#e8c96a'
        ctx.font = 'bold 7px monospace'
        ctx.fillText(`ANDAR ${String(i + 11).padStart(2, '0')}`, rightDoorX + 30, yPos + 22)
      }

      ctx.fillStyle = '#2a4a6a'
      ctx.fillRect(350, 100, 100, 40)
      ctx.fillStyle = '#3a5a8a'
      ctx.fillRect(352, 102, 96, 36)
      ctx.fillStyle = '#88ccff'
      ctx.font = 'bold 8px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('CARDS ZONE', 400, 125)

      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#8a3a3a'
      ctx.fillRect(352, 752, 96, 36)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('SAÍDA', 400, 775)

      ctx.fillStyle = 'rgba(232,201,106,0.15)'
      ctx.font = 'bold 24px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('YOHUALTICIT', 400, 450)

      break
    }

    case 'jao': {
      ctx.fillStyle = '#5a4a30'
      ctx.fillRect(50, 50, 700, 700)
      const stalls = [
        { x: 80, y: 80, w: 150, h: 100 },
        { x: 280, y: 80, w: 150, h: 100 },
        { x: 480, y: 80, w: 150, h: 100 },
        { x: 80, y: 300, w: 150, h: 100 },
        { x: 280, y: 300, w: 150, h: 100 },
        { x: 480, y: 300, w: 150, h: 100 },
        { x: 160, y: 520, w: 200, h: 100 },
        { x: 440, y: 520, w: 200, h: 100 },
      ]
      stalls.forEach((s, i) => {
        ctx.fillStyle = '#6a5a40'
        ctx.fillRect(s.x, s.y, s.w, s.h)
        ctx.fillStyle = '#8a7a60'
        ctx.fillRect(s.x + 4, s.y + 4, s.w - 8, s.h - 8)
        ctx.fillStyle = '#e8c96a'
        ctx.font = 'bold 7px monospace'
        ctx.textAlign = 'center'
        const labels = ['FRUTAS', 'GRÃOS', 'ARTESANATO', 'CARNES', 'LATICÍNIOS', 'ERVAS', 'SEU JÃO', 'OFERTAS']
        ctx.fillText(labels[i], s.x + s.w / 2, s.y + s.h / 2 + 3)
      })
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'recovery': {
      ctx.fillStyle = '#3a5a4a'
      ctx.fillRect(16, 16, 768, 768)
      const stations = [
        { x: 80, y: 100, w: 120, h: 120 },
        { x: 300, y: 100, w: 120, h: 120 },
        { x: 520, y: 100, w: 120, h: 120 },
        { x: 190, y: 350, w: 120, h: 120 },
        { x: 410, y: 350, w: 120, h: 120 },
      ]
      stations.forEach(s => {
        ctx.fillStyle = '#4a7a5a'
        ctx.fillRect(s.x, s.y, s.w, s.h)
        ctx.fillStyle = '#5a9a6a'
        ctx.fillRect(s.x + 4, s.y + 4, s.w - 8, s.h - 8)
        ctx.fillStyle = '#88ffaa'
        ctx.font = 'bold 7px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('✦ RECUPERAÇÃO ✦', s.x + s.w / 2, s.y + s.h / 2 + 3)
      })
      ctx.fillStyle = '#5a7a5a'
      ctx.fillRect(320, 550, 160, 50)
      ctx.fillStyle = '#88ffaa'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('CENTRAL DE RECUPERAÇÃO', 400, 580)
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'bar': {
      ctx.fillStyle = '#4a3030'
      ctx.fillRect(16, 16, 768, 768)
      ctx.fillStyle = '#6a4a30'
      ctx.fillRect(250, 250, 300, 40)
      ctx.fillStyle = '#8a6a50'
      ctx.fillRect(254, 254, 292, 32)
      ctx.fillStyle = '#e8c96a'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('BAR DO ZÉ', 400, 275)
      const tables = [
        { x: 100, y: 400 }, { x: 300, y: 400 }, { x: 500, y: 400 },
        { x: 150, y: 550 }, { x: 400, y: 550 },
      ]
      tables.forEach(t => {
        ctx.fillStyle = '#5a3a2a'
        ctx.fillRect(t.x, t.y, 60, 60)
        ctx.fillStyle = '#7a5a4a'
        ctx.fillRect(t.x + 2, t.y + 2, 56, 56)
      })
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#2a2a4a'
        ctx.fillRect(650, 100 + i * 120, 80, 90)
        ctx.fillStyle = '#3a3a6a'
        ctx.fillRect(654, 104 + i * 120, 72, 82)
        ctx.fillStyle = '#88ccff'
        ctx.font = 'bold 6px monospace'
        ctx.fillText('FLIPERAMA', 690, 150 + i * 120)
      }
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'training': {
      ctx.fillStyle = '#2a303a'
      ctx.fillRect(16, 16, 768, 768)
      const mats = [
        { x: 50, y: 50, w: 300, h: 200 },
        { x: 450, y: 50, w: 300, h: 200 },
        { x: 50, y: 350, w: 300, h: 200 },
        { x: 450, y: 350, w: 300, h: 200 },
      ]
      mats.forEach(m => {
        ctx.fillStyle = '#3a4050'
        ctx.fillRect(m.x, m.y, m.w, m.h)
        ctx.fillStyle = '#4a5070'
        ctx.fillRect(m.x + 4, m.y + 4, m.w - 8, m.h - 8)
        ctx.fillStyle = '#88aacc'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('ESTAÇÃO DE TREINO', m.x + m.w / 2, m.y + m.h / 2 + 3)
      })
      ctx.fillStyle = '#ff4444'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('⚡ EXCLUSIVO ASSINANTES ⚡', 400, 700)
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'fashion': {
      ctx.fillStyle = '#3a2030'
      ctx.fillRect(16, 16, 768, 768)
      for (let i = 0; i < 4; i++) {
        const mx = 100 + i * 180, my = 100
        ctx.fillStyle = '#6a3050'
        ctx.fillRect(mx, my, 80, 160)
        ctx.fillStyle = '#8a5070'
        ctx.fillRect(mx + 4, my + 4, 72, 152)
        ctx.fillStyle = '#ff88cc'
        ctx.font = 'bold 7px monospace'
        ctx.textAlign = 'center'
        const styles = ['RANQUEADO', 'ELITE', 'PRIMORDIAL', 'LIMITADO']
        ctx.fillText(styles[i], mx + 40, my + 180)
      }
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#8a8aaa'
        ctx.fillRect(100 + i * 180, 400, 80, 120)
        ctx.fillStyle = '#aaaacc'
        ctx.fillRect(104 + i * 180, 404, 72, 112)
      }
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'save': {
      ctx.fillStyle = '#3a3a3a'
      ctx.fillRect(16, 16, 768, 768)
      for (let i = 0; i < 3; i++) {
        const sx = 150 + i * 200, sy = 150
        ctx.fillStyle = '#4a4a5a'
        ctx.fillRect(sx, sy, 120, 100)
        ctx.fillStyle = '#5a5a7a'
        ctx.fillRect(sx + 4, sy + 4, 112, 92)
        ctx.fillStyle = '#88ddff'
        ctx.font = 'bold 8px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('🖥 TERMINAL', sx + 60, sy + 55)
      }
      ctx.fillStyle = '#4a5a4a'
      ctx.fillRect(300, 500, 200, 100)
      ctx.fillStyle = '#5a7a5a'
      ctx.fillRect(304, 504, 192, 92)
      ctx.fillStyle = '#88ffaa'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SERVIDOR CENTRAL', 400, 555)
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'casa': {
      ctx.fillStyle = '#3a3028'
      ctx.fillRect(16, 16, 768, 768)
      ctx.fillStyle = '#5a4a3a'
      ctx.fillRect(50, 50, 300, 200)
      ctx.fillStyle = '#6a5a4a'
      ctx.fillRect(54, 54, 292, 192)
      ctx.fillStyle = '#7a4a3a'
      ctx.fillRect(100, 80, 180, 60)
      ctx.fillStyle = '#e8c96a'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('🛋 SALA DE ESTAR', 200, 115)
      ctx.fillStyle = '#4a3a2a'
      ctx.fillRect(500, 50, 250, 300)
      ctx.fillStyle = '#5a4a3a'
      ctx.fillRect(504, 54, 242, 292)
      ctx.fillStyle = '#ffcc88'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('📌 CADERNO DE PISTAS', 625, 100)
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = 'rgba(255,204,136,0.2)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(520, 130 + i * 40)
        ctx.lineTo(740, 130 + i * 40)
        ctx.stroke()
      }
      ctx.fillStyle = '#5a3a3a'
      ctx.fillRect(50, 400, 200, 150)
      ctx.fillStyle = '#6a4a4a'
      ctx.fillRect(54, 404, 192, 142)
      ctx.fillStyle = '#e8c96a'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('🛏 QUARTO', 150, 480)
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'info': {
      ctx.fillStyle = '#3a4a5a'
      ctx.fillRect(16, 16, 768, 768)
      ctx.fillStyle = '#4a5a6a'
      ctx.fillRect(300, 200, 200, 80)
      ctx.fillStyle = '#5a6a8a'
      ctx.fillRect(304, 204, 192, 72)
      ctx.fillStyle = '#88ccff'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('📋 POSTO DE INFORMAÇÕES', 400, 235)
      ctx.fillStyle = '#2a3a4a'
      ctx.fillRect(100, 60, 200, 160)
      ctx.fillStyle = '#3a5a7a'
      ctx.fillRect(104, 64, 192, 152)
      ctx.fillStyle = '#88aacc'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('🗺 MAPA DE MARÉLIA', 200, 100)
      ctx.strokeStyle = 'rgba(136,204,255,0.2)'
      ctx.lineWidth = 1
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(110, 120 + i * 25); ctx.lineTo(290, 120 + i * 25); ctx.stroke()
      }
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#4a5a4a'
        ctx.fillRect(60 + i * 120, 500, 100, 130)
        ctx.fillStyle = '#5a6a5a'
        ctx.fillRect(64 + i * 120, 504, 92, 122)
        ctx.fillStyle = '#aaeeaa'
        ctx.font = 'bold 6px monospace'
        ctx.fillText('FOLHETO', 110 + i * 120, 550)
      }
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'equipment_shop': {
      ctx.fillStyle = '#2a2a3a'
      ctx.fillRect(16, 16, 768, 768)
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#3a2a2a'
        ctx.fillRect(40, 60 + i * 120, 100, 100)
        ctx.fillStyle = '#5a3a3a'
        ctx.fillRect(44, 64 + i * 120, 92, 92)
        ctx.fillStyle = '#ff8888'
        ctx.font = 'bold 7px monospace'
        ctx.textAlign = 'center'
        const armas = ['ESPADA', 'MACHADO', 'ADAGA', 'CAJADO']
        ctx.fillText(`⚔ ${armas[i]}`, 90, 110 + i * 120)
      }
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#2a3a3a'
        ctx.fillRect(620, 100 + i * 140, 120, 120)
        ctx.fillStyle = '#3a5a5a'
        ctx.fillRect(624, 104 + i * 140, 112, 112)
        ctx.fillStyle = '#88ffcc'
        ctx.font = 'bold 7px monospace'
        ctx.fillText(`🛡 ARMADURA`, 680, 160 + i * 140)
      }
      ctx.fillStyle = '#3a3a4a'
      ctx.fillRect(320, 500, 160, 60)
      ctx.fillStyle = '#4a4a6a'
      ctx.fillRect(324, 504, 152, 52)
      ctx.fillStyle = '#ffd700'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('💰 BALCÃO', 400, 535)
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'biblioteca': {
      ctx.fillStyle = '#2a2a30'
      ctx.fillRect(16, 16, 768, 768)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const bx = 60 + col * 140, by = 60 + row * 130
          ctx.fillStyle = '#3a2a20'
          ctx.fillRect(bx, by, 100, 100)
          ctx.fillStyle = '#5a3a2a'
          ctx.fillRect(bx + 4, by + 4, 92, 92)
          for (let b = 0; b < 8; b++) {
            const colors = ['#8a4a3a', '#4a6a3a', '#3a4a6a', '#6a3a4a', '#4a3a6a', '#6a6a3a']
            ctx.fillStyle = colors[b % colors.length]
            ctx.fillRect(bx + 8 + b * 10, by + 10, 8, 80)
          }
        }
      }
      ctx.fillStyle = '#3a3030'
      ctx.fillRect(280, 450, 240, 100)
      ctx.fillStyle = '#4a4040'
      ctx.fillRect(284, 454, 232, 92)
      ctx.fillStyle = '#e8c96a'
      ctx.font = 'bold 9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('📖 MESA DE LEITURA — LORE DE MARÉLIA', 400, 500)
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'arena_sub': {
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(16, 16, 768, 768)
      ctx.fillStyle = '#2a2a2a'
      ctx.beginPath()
      ctx.ellipse(400, 350, 250, 150, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#8a4a4a'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(400, 350, 250, 150, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(138,74,74,0.3)'
      ctx.lineWidth = 2
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const x1 = 400 + Math.cos(angle) * 245
        const y1 = 350 + Math.sin(angle) * 145
        const x2 = 400 + Math.cos(angle) * 260
        const y2 = 350 + Math.sin(angle) * 160
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      }
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#3a3030'
        ctx.fillRect(40, 580 + i * 40, 720, 35)
        ctx.fillStyle = '#4a3a3a'
        ctx.fillRect(44, 584 + i * 40, 712, 27)
      }
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = ['#444', '#555', '#666'][i % 3]
        ctx.beginPath()
        ctx.arc(80 + i * 35, 595 + (i % 3) * 40, 6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    case 'concessionaria': {
      ctx.fillStyle = '#3a3a3a'
      ctx.fillRect(16, 16, 768, 768)
      ctx.fillStyle = '#4a4a4a'
      ctx.fillRect(50, 100, 700, 300)
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      for (let x = 50; x < 750; x += 40) {
        ctx.fillRect(x, 100, 20, 300)
      }
      const vehicles = [
        { x: 100, y: 150, color: '#cc4444', label: '🚗 SEDAN' },
        { x: 300, y: 150, color: '#44aacc', label: '🚙 OFF-ROAD' },
        { x: 500, y: 150, color: '#88cc44', label: '🏍 MOTO' },
      ]
      vehicles.forEach(v => {
        ctx.fillStyle = v.color
        ctx.fillRect(v.x, v.y, 120, 60)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fillRect(v.x + 10, v.y + 10, 100, 40)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 8px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(v.label, v.x + 60, v.y + 35)
      })
      ctx.fillStyle = '#2a3a3a'
      ctx.fillRect(300, 550, 200, 60)
      ctx.fillStyle = '#3a5a5a'
      ctx.fillRect(304, 554, 192, 52)
      ctx.fillStyle = '#88ffff'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('💰 VENDAS', 400, 585)
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
      break
    }

    default: {
      ctx.fillStyle = '#3a3a3a'
      ctx.fillRect(16, 16, 768, 768)
      ctx.fillStyle = '#666'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('INTERIOR', 400, 400)
      ctx.fillStyle = '#6a2a2a'
      ctx.fillRect(350, 750, 100, 40)
      ctx.fillStyle = '#ff6666'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SAÍDA', 400, 775)
    }
  }
}

export default function BuildingInterior({ mapId, buildingName, onExit }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const playerRef = useRef(null)
  const wrapRef = useRef(null)
  const animRef = useRef(null)

  const [hudText, setHudText] = useState('')
  const [interactLabel, setInteractLabel] = useState('')
  const onExitRef = useRef(onExit)
  onExitRef.current = onExit
  const startMoveRef = useRef(null)

  const stateRef = useRef({
    px: interiorSpawns[mapId]?.x || 200,
    py: interiorSpawns[mapId]?.y || 200,
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
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = INTERIOR_SIZE
    canvas.height = INTERIOR_SIZE
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    buildInterior(ctx, mapId)
  }, [mapId])

  useEffect(() => {
    const s = stateRef.current
    const player = playerRef.current
    const canvas = canvasRef.current
    if (!canvas || !player) return

    const VW = 480, VH = 700, PANEL_H = 160, VH_eff = VH - PANEL_H

    function updateMovement() {
      if (!s.moving) { s.spriteIdle = true; return }
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
      s.spriteFrame = s.spriteIdle ? 0 : (s.spriteFrame + 1) % 4
      const bx = -(s.spriteFrame * SPRITE_W)
      const by = -(row * SPRITE_H)
      player.style.backgroundPosition = `${bx}px ${by}px`
      player.style.transform = s.spriteFlip ? 'scaleX(-1)' : 'scaleX(1)'
    }

    function startMove(dx, dy) {
      if (s.moving) return
      const nx = Math.round(s.px / STEP) * STEP + dx * STEP
      const ny = Math.round(s.py / STEP) * STEP + dy * STEP
      if (nx < 0 || ny < 0 || nx + SPRITE_W > INTERIOR_SIZE || ny + SPRITE_H > INTERIOR_SIZE) return
      if (playerCollidesInterior(nx, ny, mapId)) return

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
    startMoveRef.current = startMove

    function gameLoop(now) {
      updateMovement()
      updateSprite()

      const targetCamX = s.px - VW / 2 + SPRITE_W / 2
      const targetCamY = s.py - VH_eff / 2 + SPRITE_H / 2 - PANEL_H / 2
      s.camX += (targetCamX - s.camX) * 0.08
      s.camY += (targetCamY - s.camY) * 0.08
      s.camX = Math.max(0, Math.min(INTERIOR_SIZE - VW, s.camX))
      s.camY = Math.max(0, Math.min(INTERIOR_SIZE - VH_eff, s.camY))

      canvas.style.transform = `translate(${-s.camX}px, ${-s.camY}px)`
      player.style.left = (s.px - s.camX) + 'px'
      player.style.top = (s.py - s.camY) + 'px'

      setHudText(t(`tatics.interior_names.${mapId}`) || buildingName)

      const zone = getInteriorZone(s.px, s.py)
      if (zone === 'SAIDA') {
        setInteractLabel(t('tatics.interior.interact_exit'))
      } else {
        setInteractLabel('')
      }

      animRef.current = requestAnimationFrame(gameLoop)
    }

    animRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [mapId, buildingName])

  const handleAnalogMove = useCallback((dx, dy) => {
    startMoveRef.current(dx, dy)
  }, [])

  const handleButtonA = useCallback(() => {
    const s = stateRef.current
    if (getInteriorZone(s.px, s.py) === 'SAIDA') {
      onExitRef.current(mapId)
    }
  }, [mapId])

  const handleButtonB = useCallback(() => {
  }, [])

  return (
    <div className="city-container">
      <div ref={wrapRef} className="city-canvas-wrap">
        <canvas ref={canvasRef} id="interior-canvas" />
        <div ref={playerRef} className="city-player">
          <div className="city-player-inner"><img src={kronikiHappy} alt="" className="city-player-img" /></div>
        </div>
        <div className="city-hud">{hudText}</div>

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
      </div>

      <GameControls onMove={handleAnalogMove} onA={handleButtonA} onB={handleButtonB} />
    </div>
  )
}
