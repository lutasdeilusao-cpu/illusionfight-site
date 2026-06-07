/* ═══════════════════════════════════════════════════
   DISTRICTS — Dados dos distritos da cidade de Marélia
   
   Cada distrito é autossuficiente com:
   - tilemap (cores do chão)
   - buildings (prédios com posição, cor, interior)
   - colliders (água, obstáculos)
   - decorative (árvores, postes)
   - npcs
   - exits (conexões para outros distritos)
   
   Uso: import { DISTRITOS } from './data/districts'
   ═══════════════════════════════════════════════════ */

const STEP = 32

export const DISTRITOS = {
  central: {
    id: 'central',
    nameKey: 'tatics.zones.central',
    mapW: 55,
    mapH: 30,

    tileColors: {
      grass: '#2d5a1e',
      dark_grass: '#1e3d14',
      path: '#8a9a6a',
      dark_path: '#6a7a4e',
      water: '#1a3a5a',
    },

    // Função que define a cor de cada tile (x, y em tiles)
    getTileColor(tx, ty) {
      const mH = ty >= 13 && ty <= 15
      const mV = tx >= 12 && tx <= 14
      const pH = (ty >= 7 && ty <= 9) || (ty >= 13 && ty <= 15) || (ty >= 19 && ty <= 21) || (ty >= 23 && ty <= 25)
      const pV = (tx >= 5 && tx <= 7) || (tx >= 13 && tx <= 15) || (tx >= 21 && tx <= 23) || (tx >= 31 && tx <= 33) || (tx >= 39 && tx <= 41)

      if ((mH && tx >= 2 && tx <= 24) || (mV && ty >= 2 && ty <= 24)) return 'path'
      if (pH || pV) return 'path'
      if ((tx + ty) % 11 === 0) return 'dark_grass'

      const waterZones = [
        { x: 0, y: 0, w: 3, h: 4 }, { x: 23, y: 0, w: 3, h: 3 },
        { x: 0, y: 26, w: 3, h: 3 }, { x: 44, y: 0, w: 10, h: 5 },
      ]
      for (const wz of waterZones) {
        if (tx >= wz.x && tx < wz.x + wz.w && ty >= wz.y && ty < wz.y + wz.h) return 'water'
      }
      return 'grass'
    },

    buildings: [
      { id: 'yohualticit', nameKey: 'tatics.buildings.yohualticit', x: 18, y: 4, w: 8, h: 7, color: '#8b1a1a', labelColor: '#cc4444', interiorMapId: 'yohualticit' },
      { id: 'jao', nameKey: 'tatics.buildings.jao', x: 8, y: 14, w: 6, h: 4, color: '#c47820', labelColor: '#e8a040', interiorMapId: 'jao' },
      { id: 'recovery', nameKey: 'tatics.buildings.recovery', x: 38, y: 14, w: 5, h: 4, color: '#2a6040', labelColor: '#40a060', interiorMapId: 'recovery' },
      { id: 'bar', nameKey: 'tatics.buildings.bar', x: 30, y: 20, w: 5, h: 4, color: '#6b3a50', labelColor: '#a05070', interiorMapId: 'bar' },
      { id: 'training', nameKey: 'tatics.buildings.training', x: 40, y: 22, w: 5, h: 4, color: '#2a4060', labelColor: '#4060a0', interiorMapId: 'training', subOnly: true },
      { id: 'fashion', nameKey: 'tatics.buildings.fashion', x: 10, y: 22, w: 5, h: 4, color: '#804060', labelColor: '#b06090', interiorMapId: 'fashion' },
      { id: 'save', nameKey: 'tatics.buildings.save', x: 26, y: 12, w: 4, h: 3, color: '#505a50', labelColor: '#707a70', interiorMapId: 'save' },
      { id: 'casa', nameKey: 'tatics.buildings.casa', x: 4, y: 24, w: 4, h: 3, color: '#6b4a20', labelColor: '#a07030', interiorMapId: 'casa' },
    ],

    // Obstáculos sólidos (bloqueiam movimento)
    solidTiles: [
      { x: 14, y: 8, w: 1, h: 2 },
      { x: 28, y: 18, w: 2, h: 1 },
      { x: 35, y: 8, w: 1, h: 3 },
      { x: 6, y: 10, w: 2, h: 2 },
    ],

    // Água (bloqueia movimento)
    waterTiles: [
      { x: 0, y: 0, w: 3, h: 4 }, { x: 23, y: 0, w: 3, h: 3 },
      { x: 0, y: 26, w: 3, h: 3 }, { x: 44, y: 0, w: 10, h: 5 },
    ],

    // Decoração
    trees: [
      [200, 300], [250, 400], [350, 250], [500, 350], [600, 280],
      [700, 500], [300, 550], [450, 650], [550, 450], [150, 500],
      [850, 300], [900, 600], [100, 700], [650, 700], [350, 750],
    ],
    lamps: [
      [450, 450], [550, 550], [350, 400], [650, 500],
    ],

    npcs: [
      {
        id: 'detetive',
        nameKey: 'tatics.city.detective_label',
        x: 780, y: 600, w: 10, h: 14,
        color: '#cc3333',
        dialogKey: 'tatics.city.detective_dialog',
      },
    ],

    // Saídas para outros distritos (borda do mapa)
    exits: {
      norte: { to: 'residencial', spawnTile: { x: 25, y: 28 } },
    },

    // Zonas nomeadas internas (não são saídas)
    zonas: [
      { nameKey: 'tatics.zones.central', tx: 14, ty: 8, tw: 10, th: 6, color: '#e8c96a' },
      { nameKey: 'tatics.zones.comercial', tx: 4, ty: 14, tw: 14, th: 10, color: '#6ab4e8' },
      { nameKey: 'tatics.zones.residencial', tx: 28, ty: 14, tw: 14, th: 10, color: '#6ae8a0' },
      { nameKey: 'tatics.zones.sul', tx: 4, ty: 24, tw: 14, th: 6, color: '#c96ae8' },
      { nameKey: 'tatics.zones.yohualticit', tx: 18, ty: 0, tw: 14, th: 6, color: '#e86a6a' },
    ],
  },

  /* ── BAIRRO RESIDENCIAL ── */
  residencial: {
    id: 'residencial',
    nameKey: 'tatics.zones.residencial',
    mapW: 55,
    mapH: 30,

    tileColors: {
      grass: '#1e3d2a',
      dark_grass: '#152e1f',
      path: '#6a7a5a',
      dark_path: '#4a5a3e',
      water: '#1a2a4a',
    },

    getTileColor(tx, ty) {
      const isPathH = ty >= 13 && ty <= 15
      const isPathV = tx >= 12 && tx <= 14
      const isSecondaryH = (ty >= 5 && ty <= 6) || (ty >= 19 && ty <= 20) || (ty >= 25 && ty <= 26)
      const isSecondaryV = (tx >= 5 && tx <= 6) || (tx >= 19 && tx <= 20) || (tx >= 33 && tx <= 34) || (tx >= 47 && tx <= 48)
      const isWater = (tx >= 42 && tx <= 46) && (ty >= 18 && ty <= 22)

      if (isWater) return 'water'
      if ((isPathH && tx >= 2 && tx <= 52) || (isPathV && ty >= 2 && ty <= 28)) return 'path'
      if (isSecondaryH || isSecondaryV) return 'dark_path'
      if ((tx + ty) % 7 === 0) return 'dark_grass'
      return 'grass'
    },

    buildings: [
      { id: 'casa_a', nameKey: 'tatics.buildings.casa', x: 4, y: 3, w: 4, h: 3, color: '#6b4a20', labelColor: '#a07030', interiorMapId: 'casa' },
      { id: 'casa_b', nameKey: 'tatics.buildings.casa', x: 22, y: 3, w: 4, h: 3, color: '#5a3d1a', labelColor: '#906020', interiorMapId: 'casa' },
      { id: 'casa_c', nameKey: 'tatics.buildings.casa', x: 38, y: 3, w: 4, h: 3, color: '#7a5a2a', labelColor: '#b08040', interiorMapId: 'casa' },
      { id: 'casa_d', nameKey: 'tatics.buildings.casa', x: 4, y: 20, w: 4, h: 3, color: '#6b4a20', labelColor: '#a07030', interiorMapId: 'casa' },
      { id: 'casa_e', nameKey: 'tatics.buildings.casa', x: 30, y: 20, w: 4, h: 3, color: '#5a3d1a', labelColor: '#906020', interiorMapId: 'casa' },
    ],

    solidTiles: [
      { x: 15, y: 8, w: 1, h: 1 },
      { x: 28, y: 10, w: 2, h: 1 },
      { x: 40, y: 8, w: 1, h: 2 },
      { x: 10, y: 25, w: 1, h: 1 },
      { x: 35, y: 25, w: 2, h: 1 },
    ],

    waterTiles: [
      { x: 42, y: 18, w: 5, h: 5 },
    ],

    trees: [
      [100, 150], [200, 120], [450, 100], [600, 200], [350, 80],
      [700, 150], [800, 300], [150, 400], [500, 250], [750, 400],
      [200, 550], [650, 550], [800, 600], [100, 650], [400, 700],
    ],
    lamps: [
      [300, 400], [550, 300], [700, 450], [400, 550],
      [650, 650], [250, 250],
    ],

    npcs: [],

    exits: {
      sul: { to: 'central', spawnTile: { x: 25, y: 1 } },
    },

    zonas: [
      { nameKey: 'tatics.zones.residencial', tx: 0, ty: 0, tw: 55, th: 30, color: '#6ae8a0' },
    ],
  },
}

/* ═══════════════════════════════════════════════════
   HELPERS — Funções auxiliares que usam dados do distrito
   ═══════════════════════════════════════════════════ */

export function getTileColorName(distrito, tx, ty) {
  return distrito.getTileColor(tx, ty)
}

export function isSolid(distrito, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= distrito.mapW || ty >= distrito.mapH) return true

  // Prédios
  for (const b of distrito.buildings) {
    if (tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return true
  }

  // Borda do mapa
  if (tx === 0 || ty === 0 || tx === distrito.mapW - 1 || ty === distrito.mapH - 1) return true

  // Água
  for (const w of distrito.waterTiles) {
    if (tx >= w.x && tx < w.x + w.w && ty >= w.y && ty < w.y + w.h) return true
  }

  // Obstáculos
  for (const o of distrito.solidTiles) {
    if (tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h) return true
  }

  return false
}

export function getBuildingAt(px, py, distrito) {
  const STEP = 32
  const ZONE_DOOR_W = 3
  const ZONE_DOOR_H = 3
  const tx = Math.floor(px / STEP)
  const ty = Math.floor(py / STEP)

  for (const b of distrito.buildings) {
    const doorX = b.x + Math.floor(b.w / 2) - 1
    const doorY = b.y + b.h
    if (tx >= doorX && tx < doorX + ZONE_DOOR_W && ty >= doorY && ty < doorY + ZONE_DOOR_H) return b
  }
  return null
}

export function getExitAt(px, py, distrito) {
  const STEP = 32
  const tx = Math.floor(px / STEP)
  const ty = Math.floor(py / STEP)
  const EXIT_ZONE = 2 // tiles de largura da zona de transição

  // Verifica cada borda
  for (const [dir, exitData] of Object.entries(distrito.exits)) {
    switch (dir) {
      case 'norte':
        if (ty <= EXIT_ZONE) return exitData
        break
      case 'sul':
        if (ty >= distrito.mapH - 1 - EXIT_ZONE) return exitData
        break
      case 'leste':
        if (tx >= distrito.mapW - 1 - EXIT_ZONE) return exitData
        break
      case 'oeste':
        if (tx <= EXIT_ZONE) return exitData
        break
    }
  }
  return null
}

export function getZonaNome(tileX, tileY, zonas) {
  for (const z of zonas) {
    if (tileX >= z.tx && tileX < z.tx + z.tw && tileY >= z.ty && tileY < z.ty + z.th) return z
  }
  return null
}
