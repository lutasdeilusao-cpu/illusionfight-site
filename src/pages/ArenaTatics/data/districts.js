/* ═══════════════════════════════════════════════════
   DISTRICTS — Dados dos distritos da cidade de Marélia

   Cada distrito é autossuficiente com:
   - tileColors + getTileColor() → mapa procedural colorido
   - buildings → prédios visitáveis com portas
   - solidTiles, waterTiles → colisão
   - trees, lamps → decoração
   - npcs → personagens
   - exits → conexões entre distritos
   - zonas → áreas nomeadas

   Uso: import { DISTRITOS, ... } from './data/districts'
   ═══════════════════════════════════════════════════ */

const STEP = 32

export const DISTRITOS = {

  /* ═══════════════════════════════════════════════
     PRAÇA CENTRAL — Centro histórico, ruas de pedra
     ═══════════════════════════════════════════════ */
  central: {
    id: 'central',
    nameKey: 'tatics.zones.central',
    mapW: 55,
    mapH: 30,

    tileColors: {
      grass:       '#3a7a2a',
      dark_grass:  '#2a5a1e',
      path:        '#b8a88a',
      dark_path:   '#9a8a6e',
      water:       '#2a5a8a',
      stone:       '#8a8a90',
      dark_stone:  '#6a6a70',
      sand:        '#c8b878',
    },

    getTileColor(tx, ty) {
      const avH = ty === 7 || ty === 13 || ty === 19 || ty === 23
      const avV = tx === 5 || tx === 13 || tx === 21 || tx === 31 || tx === 39
      const mainH = ty >= 13 && ty <= 15
      const mainV = tx >= 12 && tx <= 14

      const waterZones = [
        { x: 0, y: 0, w: 3, h: 4 }, { x: 23, y: 0, w: 3, h: 3 },
        { x: 0, y: 26, w: 3, h: 3 }, { x: 44, y: 0, w: 10, h: 5 },
      ]
      for (const wz of waterZones) {
        if (tx >= wz.x && tx < wz.x + wz.w && ty >= wz.y && ty < wz.y + wz.h) return 'water'
      }

      if (tx >= 12 && tx <= 16 && ty >= 10 && ty <= 11) return 'stone'
      if (tx >= 13 && tx <= 15 && ty >= 12 && ty <= 12) return 'dark_stone'

      if ((mainH && tx >= 2 && tx <= 24) || (mainV && ty >= 2 && ty <= 24)) return 'path'
      if (avH || avV) return 'dark_path'
      if ((tx + ty) % 11 === 0) return 'dark_grass'
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

    solidTiles: [
      { x: 14, y: 8, w: 1, h: 2 }, { x: 28, y: 18, w: 2, h: 1 },
      { x: 35, y: 8, w: 1, h: 3 }, { x: 6, y: 10, w: 2, h: 2 },
    ],

    waterTiles: [
      { x: 0, y: 0, w: 3, h: 4 }, { x: 23, y: 0, w: 3, h: 3 },
      { x: 0, y: 26, w: 3, h: 3 }, { x: 44, y: 0, w: 10, h: 5 },
    ],

    trees: [
      [200, 300], [250, 400], [350, 250], [500, 350], [600, 280],
      [700, 500], [300, 550], [450, 650], [550, 450], [150, 500],
      [850, 300], [900, 600], [100, 700], [650, 700], [350, 750],
    ],
    lamps: [[450, 450], [550, 550], [350, 400], [650, 500]],

    npcs: [{
      id: 'detetive', nameKey: 'tatics.city.detective_label',
      x: 780, y: 600, w: 10, h: 14, color: '#cc3333',
      dialogKey: 'tatics.city.detective_dialog',
    }],

    exits: {
      norte: { to: 'comercial', spawnTile: { x: 25, y: 33 } },
      sul:   { to: 'residencial', spawnTile: { x: 25, y: 1 } },
      oeste: { to: 'yohualticit', spawnTile: { x: 43, y: 15 } },
    },

    zonas: [
      { nameKey: 'tatics.zones.central', tx: 14, ty: 8, tw: 10, th: 6, color: '#e8c96a' },
      { nameKey: 'tatics.zones.comercial', tx: 4, ty: 14, tw: 14, th: 10, color: '#6ab4e8' },
      { nameKey: 'tatics.zones.residencial', tx: 28, ty: 14, tw: 14, th: 10, color: '#6ae8a0' },
      { nameKey: 'tatics.zones.sul', tx: 4, ty: 24, tw: 14, th: 6, color: '#c96ae8' },
      { nameKey: 'tatics.zones.yohualticit', tx: 18, ty: 0, tw: 14, th: 6, color: '#e86a6a' },
    ],
  },

  /* ═══════════════════════════════════════════════
     BAIRRO RESIDENCIAL — Ruas arborizadas, pracinha, laguinho
     ═══════════════════════════════════════════════ */
  residencial: {
    id: 'residencial',
    nameKey: 'tatics.zones.residencial',
    mapW: 55,
    mapH: 30,

    tileColors: {
      grass:       '#4a8a3a',
      dark_grass:  '#2a6a20',
      path:        '#9a8a7a',
      dark_path:   '#7a6a5a',
      water:       '#3a6a9a',
      garden:      '#6aaa50',
      flower:      '#c87060',
      stone:       '#8a8a90',
    },

    getTileColor(tx, ty) {
      const avH = ty === 4 || ty === 10 || ty === 16 || ty === 22 || ty === 28
      const avV = tx === 4 || tx === 10 || tx === 18 || tx === 26 || tx === 34 || tx === 42 || tx === 50
      const mainH = ty >= 13 && ty <= 14
      const mainV = tx >= 12 && tx <= 13
      const plaza = tx >= 24 && tx <= 28 && ty >= 12 && ty <= 15

      if (tx >= 42 && tx <= 46 && ty >= 18 && ty <= 22) return 'water'

      if (plaza) {
        if ((tx === 25 || tx === 27) && (ty === 13 || ty === 14)) return 'flower'
        return 'garden'
      }
      if (tx >= 24 && tx <= 28 && (ty === 11 || ty === 16)) return 'stone'

      if ((mainH && tx >= 2 && tx <= 52) || (mainV && ty >= 2 && ty <= 28)) return 'path'
      if (avH || avV) return 'dark_path'
      if (avH && tx % 3 === 0) return 'stone'
      if (avV && ty % 3 === 0) return 'stone'

      if ((tx + ty) % 7 === 0) return 'dark_grass'
      if (tx % 2 === 0 && ty % 2 === 0 && tx >= 6 && tx <= 48 && ty >= 6 && ty <= 24) return 'garden'
      return 'grass'
    },

    buildings: [
      { id: 'casa_n1', nameKey: 'tatics.buildings.casa', x: 6,  y: 2, w: 3, h: 2, color: '#7a5a3a', labelColor: '#a08050', interiorMapId: 'casa' },
      { id: 'casa_n2', nameKey: 'tatics.buildings.casa', x: 15, y: 2, w: 3, h: 2, color: '#5a4a2a', labelColor: '#806040', interiorMapId: 'casa' },
      { id: 'casa_n3', nameKey: 'tatics.buildings.casa', x: 22, y: 2, w: 3, h: 2, color: '#8a6a4a', labelColor: '#b09060', interiorMapId: 'casa' },
      { id: 'casa_n4', nameKey: 'tatics.buildings.casa', x: 32, y: 2, w: 3, h: 2, color: '#6a5a3a', labelColor: '#907050', interiorMapId: 'casa' },
      { id: 'casa_n5', nameKey: 'tatics.buildings.casa', x: 40, y: 2, w: 3, h: 2, color: '#5a3a2a', labelColor: '#805040', interiorMapId: 'casa' },
      { id: 'casa_n6', nameKey: 'tatics.buildings.casa', x: 48, y: 2, w: 3, h: 2, color: '#7a6a4a', labelColor: '#a09060', interiorMapId: 'casa' },
      { id: 'casa_o1', nameKey: 'tatics.buildings.casa', x: 6,  y: 6, w: 3, h: 2, color: '#6a4a3a', labelColor: '#907050', interiorMapId: 'casa' },
      { id: 'casa_o2', nameKey: 'tatics.buildings.casa', x: 6,  y: 12, w: 3, h: 2, color: '#8a5a3a', labelColor: '#b08050', interiorMapId: 'casa' },
      { id: 'casa_o3', nameKey: 'tatics.buildings.casa', x: 6,  y: 18, w: 3, h: 2, color: '#5a4a3a', labelColor: '#807050', interiorMapId: 'casa' },
      { id: 'casa_o4', nameKey: 'tatics.buildings.casa', x: 6,  y: 24, w: 3, h: 2, color: '#7a5a4a', labelColor: '#a08060', interiorMapId: 'casa' },
      { id: 'casa_e1', nameKey: 'tatics.buildings.casa', x: 30, y: 6, w: 3, h: 2, color: '#5a6a3a', labelColor: '#809050', interiorMapId: 'casa' },
      { id: 'casa_e2', nameKey: 'tatics.buildings.casa', x: 36, y: 6, w: 3, h: 2, color: '#6a5a4a', labelColor: '#908060', interiorMapId: 'casa' },
      { id: 'casa_e3', nameKey: 'tatics.buildings.casa', x: 30, y: 12, w: 3, h: 2, color: '#8a7a4a', labelColor: '#b0a060', interiorMapId: 'casa' },
      { id: 'casa_e4', nameKey: 'tatics.buildings.casa', x: 36, y: 18, w: 3, h: 2, color: '#5a3a3a', labelColor: '#806060', interiorMapId: 'casa' },
      { id: 'casa_e5', nameKey: 'tatics.buildings.casa', x: 30, y: 24, w: 3, h: 2, color: '#7a6a3a', labelColor: '#a09050', interiorMapId: 'casa' },
      { id: 'casa_s1', nameKey: 'tatics.buildings.casa', x: 6,  y: 26, w: 3, h: 2, color: '#6a5a2a', labelColor: '#908040', interiorMapId: 'casa' },
      { id: 'casa_s2', nameKey: 'tatics.buildings.casa', x: 22, y: 26, w: 3, h: 2, color: '#8a6a3a', labelColor: '#b09050', interiorMapId: 'casa' },
      { id: 'casa_s3', nameKey: 'tatics.buildings.casa', x: 36, y: 26, w: 3, h: 2, color: '#5a5a3a', labelColor: '#808050', interiorMapId: 'casa' },
      { id: 'subprefeitura', nameKey: 'tatics.buildings.save', x: 20, y: 24, w: 4, h: 3, color: '#4a5a6a', labelColor: '#6a8a9a', interiorMapId: 'save' },
      { id: 'capela', nameKey: 'tatics.buildings.casa', x: 44, y: 12, w: 3, h: 3, color: '#7a6a6a', labelColor: '#a09090', interiorMapId: 'casa' },
    ],

    solidTiles: [
      { x: 14, y: 6, w: 1, h: 1 }, { x: 28, y: 10, w: 2, h: 1 },
      { x: 40, y: 8, w: 1, h: 2 }, { x: 10, y: 25, w: 1, h: 1 },
      { x: 48, y: 10, w: 1, h: 1 }, { x: 15, y: 22, w: 1, h: 2 },
      { x: 35, y: 25, w: 2, h: 1 }, { x: 20, y: 6, w: 1, h: 1 },
      { x: 44, y: 25, w: 1, h: 1 },
    ],

    waterTiles: [{ x: 42, y: 18, w: 5, h: 5 }],

    trees: [
      [140, 140], [280, 140], [420, 140], [560, 140], [700, 140], [800, 140],
      [140, 350], [350, 220], [500, 220], [700, 300], [850, 200],
      [200, 480], [450, 480], [650, 480], [800, 450],
      [100, 640], [300, 640], [500, 640], [700, 640], [850, 600],
      [150, 800], [400, 780], [650, 800],
      [1380, 600], [1420, 640], [1460, 600], [1400, 680], [1480, 660],
    ],
    lamps: [
      [200, 200], [400, 200], [600, 200], [800, 280],
      [200, 400], [600, 400], [800, 500],
      [300, 650], [600, 650],
    ],

    npcs: [
      {
        id: 'idoso', nameKey: 'tatics.city.idoso_label',
        x: 400, y: 600, w: 10, h: 14, color: '#88aa66',
        dialogKey: 'tatics.city.idoso_dialog',
      },
      {
        id: 'crianca', nameKey: 'tatics.city.crianca_label',
        x: 700, y: 300, w: 10, h: 14, color: '#66aacc',
        dialogKey: 'tatics.city.crianca_dialog',
      },
    ],
    exits: {
      norte: { to: 'central', spawnTile: { x: 25, y: 28 } },
      leste: { to: 'industrial', spawnTile: { x: 1, y: 15 } },
      sul:   { to: 'suburbio', spawnTile: { x: 25, y: 1 } },
    },
    zonas: [
      { nameKey: 'tatics.zones.residencial', tx: 0, ty: 0, tw: 55, th: 30, color: '#6ae8a0' },
    ],
  },

  /* ═══════════════════════════════════════════════
     BAIRRO COMERCIAL — Lojas, vitrines, movimento
     ═══════════════════════════════════════════════ */
  comercial: {
    id: 'comercial',
    nameKey: 'tatics.zones.comercial',
    mapW: 60,
    mapH: 35,

    tileColors: {
      grass:       '#5a7a3a',
      dark_grass:  '#3a5a20',
      path:        '#b0a090',
      dark_path:   '#908070',
      water:       '#3a7a9a',
      stone:       '#9a9aa0',
      sidewalk:    '#c8b8a8',
      marble:      '#d0c8b8',
    },

    getTileColor(tx, ty) {
      const avH = ty === 6 || ty === 12 || ty === 18 || ty === 24 || ty === 30
      const avV = tx === 6 || tx === 14 || tx === 22 || tx === 30 || tx === 38 || tx === 46 || tx === 54
      const mainH = ty >= 14 && ty <= 15
      const mainV = tx >= 13 && tx <= 14
      const centerPlaza = tx >= 26 && tx <= 32 && ty >= 14 && ty <= 18

      // Water fountain in plaza
      if (tx >= 28 && tx <= 30 && ty >= 15 && ty <= 17) return 'water'
      if (centerPlaza) return 'marble'
      if (ty >= 16 && ty <= 18 && tx >= 22 && tx <= 36) return 'sidewalk'

      if ((mainH && tx >= 2 && tx <= 58) || (mainV && ty >= 2 && ty <= 33)) return 'path'
      if (avH || avV) return 'dark_path'
      if ((tx + ty) % 9 === 0) return 'stone'

      return 'grass'
    },

    buildings: [
      { id: 'info', nameKey: 'tatics.buildings.info', x: 14, y: 4, w: 4, h: 3, color: '#4a6a8a', labelColor: '#6a9aba', interiorMapId: 'info' },
      { id: 'equipment_shop', nameKey: 'tatics.buildings.equipment_shop', x: 42, y: 4, w: 5, h: 4, color: '#6a4a6a', labelColor: '#9a6a9a', interiorMapId: 'equipment_shop' },
      { id: 'concessionaria', nameKey: 'tatics.buildings.concessionaria', x: 2, y: 10, w: 6, h: 4, color: '#4a6a6a', labelColor: '#6a9a9a', interiorMapId: 'concessionaria' },
      { id: 'jao', nameKey: 'tatics.buildings.jao', x: 20, y: 22, w: 6, h: 4, color: '#c47820', labelColor: '#e8a040', interiorMapId: 'jao' },
      { id: 'fashion', nameKey: 'tatics.buildings.fashion', x: 40, y: 22, w: 5, h: 4, color: '#804060', labelColor: '#b06090', interiorMapId: 'fashion' },
      { id: 'bar', nameKey: 'tatics.buildings.bar', x: 10, y: 28, w: 5, h: 4, color: '#6b3a50', labelColor: '#a05070', interiorMapId: 'bar' },
    ],

    solidTiles: [
      { x: 28, y: 16, w: 1, h: 1 }, { x: 14, y: 10, w: 1, h: 1 },
      { x: 46, y: 10, w: 1, h: 2 },
    ],

    waterTiles: [{ x: 28, y: 15, w: 3, h: 3 }],

    trees: [
      [320, 160], [420, 200], [180, 400], [520, 350], [650, 300],
      [780, 450], [850, 250], [150, 600], [450, 650], [700, 600],
      [950, 300], [1000, 550], [250, 800], [600, 850], [900, 700],
    ],
    lamps: [
      [300, 200], [500, 200], [700, 200], [200, 400],
      [500, 400], [800, 400], [300, 600], [700, 600],
      [200, 700], [600, 700],
    ],

    npcs: [
      {
        id: 'vendedor', nameKey: 'tatics.city.vendedor_label',
        x: 500, y: 550, w: 10, h: 14, color: '#cc8844',
        dialogKey: 'tatics.city.vendedor_dialog',
      },
      {
        id: 'mendigo', nameKey: 'tatics.city.mendigo_label',
        x: 150, y: 700, w: 10, h: 14, color: '#886666',
        dialogKey: 'tatics.city.mendigo_dialog',
      },
    ],

    exits: {
      sul:   { to: 'central', spawnTile: { x: 25, y: 1 } },
      leste: { to: 'industrial', spawnTile: { x: 1, y: 15 } },
      norte: { to: 'mercado', spawnTile: { x: 20, y: 23 } },
    },

    zonas: [
      { nameKey: 'tatics.zones.comercial', tx: 0, ty: 0, tw: 60, th: 35, color: '#6ab4e8' },
    ],
  },

  /* ═══════════════════════════════════════════════
     DISTRITO INDUSTRIAL — Fábricas, galpões, training
     ═══════════════════════════════════════════════ */
  industrial: {
    id: 'industrial',
    nameKey: 'tatics.zones.industrial',
    mapW: 50,
    mapH: 30,

    tileColors: {
      concrete:    '#5a5a60',
      dark_concrete: '#4a4a50',
      path:        '#6a6a70',
      dark_path:   '#5a5a60',
      grass:       '#3a5a2a',
      dark_grass:  '#2a4a1e',
      water:       '#3a5a7a',
      oil:         '#2a2a3a',
      metal:       '#7a7a8a',
    },

    getTileColor(tx, ty) {
      const avH = ty === 5 || ty === 11 || ty === 17 || ty === 23
      const avV = tx === 5 || tx === 13 || tx === 21 || tx === 29 || tx === 37 || tx === 45
      const mainH = ty >= 14 && ty <= 15
      const mainV = tx >= 12 && tx <= 13
      const factoryZone = (tx >= 30 && tx <= 44 && ty >= 18 && ty <= 26) || (tx >= 4 && tx <= 18 && ty >= 2 && ty <= 10)

      // Oil puddles
      if ((tx === 35 || tx === 36) && (ty === 20 || ty === 21)) return 'oil'
      if ((tx === 8 || tx === 9) && (ty === 5 || ty === 6)) return 'oil'

      if (factoryZone) return 'concrete'
      if ((mainH && tx >= 2 && tx <= 48) || (mainV && ty >= 2 && ty <= 28)) return 'path'
      if (avH || avV) return 'dark_path'
      if (tx % 5 === 0 && ty % 5 === 0) return 'metal'
      if ((tx + ty) % 8 === 0) return 'dark_grass'
      return 'grass'
    },

    buildings: [
      { id: 'training', nameKey: 'tatics.buildings.training', x: 4, y: 4, w: 8, h: 6, color: '#2a4060', labelColor: '#4060a0', interiorMapId: 'training', subOnly: true },
      { id: 'arena_sub', nameKey: 'tatics.buildings.arena_sub', x: 34, y: 20, w: 7, h: 5, color: '#6a2a2a', labelColor: '#aa4444', interiorMapId: 'arena_sub' },
      { id: 'recovery', nameKey: 'tatics.buildings.recovery', x: 36, y: 4, w: 5, h: 4, color: '#2a6040', labelColor: '#40a060', interiorMapId: 'recovery' },
    ],

    solidTiles: [
      { x: 25, y: 14, w: 2, h: 1 }, { x: 40, y: 10, w: 1, h: 2 },
      { x: 12, y: 20, w: 1, h: 1 }, { x: 30, y: 25, w: 2, h: 1 },
      { x: 45, y: 5, w: 1, h: 1 },
    ],

    waterTiles: [{ x: 46, y: 26, w: 4, h: 4 }],

    trees: [
      [200, 400], [350, 300], [500, 450], [100, 600], [700, 350],
    ],
    lamps: [
      [160, 160], [400, 160], [640, 160], [160, 400],
      [640, 400], [400, 600], [640, 600],
    ],

    npcs: [
      {
        id: 'operario', nameKey: 'tatics.city.operario_label',
        x: 350, y: 550, w: 10, h: 14, color: '#888888',
        dialogKey: 'tatics.city.operario_dialog',
      },
    ],

    exits: {
      norte: { to: 'comercial', spawnTile: { x: 25, y: 33 } },
      sul:   { to: 'suburbio', spawnTile: { x: 25, y: 1 } },
      oeste: { to: 'residencial', spawnTile: { x: 52, y: 15 } },
    },

    zonas: [
      { nameKey: 'tatics.zones.industrial', tx: 0, ty: 0, tw: 50, th: 30, color: '#8a8a90' },
    ],
  },

  /* ═══════════════════════════════════════════════
     PORTO — Docas, água, navios
     ═══════════════════════════════════════════════ */
  porto: {
    id: 'porto',
    nameKey: 'tatics.zones.porto',
    mapW: 40,
    mapH: 25,

    tileColors: {
      water:       '#2a5a8a',
      deep_water:  '#1a3a6a',
      dock:        '#7a6a5a',
      dark_dock:   '#6a5a4a',
      path:        '#8a7a6a',
      concrete:    '#6a6a70',
      sand:        '#b8a878',
      grass:       '#4a6a3a',
    },

    getTileColor(tx, ty) {
      // Water covers bottom half
      if (ty >= 15) return 'deep_water'
      if (ty >= 12) return 'water'
      // Docks
      if ((ty === 11 || ty === 12) && tx >= 2 && tx <= 38) return 'dock'
      if (ty === 10 && (tx >= 2 && tx <= 18)) return 'dark_dock'
      if (ty === 10 && (tx >= 22 && tx <= 38)) return 'dark_dock'
      // Pier
      if (tx >= 18 && tx <= 22 && ty >= 8 && ty <= 14) return 'concrete'
      // Path
      if (ty === 3 || ty === 7 || tx === 3 || tx === 20 || tx === 36) return 'path'
      if ((tx + ty) % 6 === 0) return 'sand'
      return 'grass'
    },

    buildings: [
      { id: 'save', nameKey: 'tatics.buildings.save', x: 2, y: 2, w: 4, h: 3, color: '#505a50', labelColor: '#707a70', interiorMapId: 'save' },
      { id: 'bar', nameKey: 'tatics.buildings.bar', x: 30, y: 2, w: 5, h: 4, color: '#6b3a50', labelColor: '#a05070', interiorMapId: 'bar' },
    ],

    solidTiles: [
      { x: 10, y: 8, w: 1, h: 1 }, { x: 28, y: 6, w: 1, h: 1 },
    ],

    waterTiles: [
      { x: 0, y: 12, w: 40, h: 13 },
    ],

    trees: [
      [120, 80], [280, 80], [640, 120], [800, 160],
      [200, 250], [600, 280],
    ],
    lamps: [
      [100, 300], [300, 300], [600, 350], [800, 300],
    ],

    npcs: [
      {
        id: 'marinheiro', nameKey: 'tatics.city.marinheiro_label',
        x: 400, y: 350, w: 10, h: 14, color: '#2a6a8a',
        dialogKey: 'tatics.city.marinheiro_dialog',
      },
    ],

    exits: {
      norte: { to: 'industrial', spawnTile: { x: 25, y: 28 } },
      oeste: { to: 'suburbio', spawnTile: { x: 43, y: 15 } },
    },

    zonas: [
      { nameKey: 'tatics.zones.porto', tx: 0, ty: 0, tw: 40, th: 25, color: '#4a8aba' },
    ],
  },

  /* ═══════════════════════════════════════════════
     MERCADO — Feira livre, barracas, movimento popular
     ═══════════════════════════════════════════════ */
  mercado: {
    id: 'mercado',
    nameKey: 'tatics.zones.mercado',
    mapW: 40,
    mapH: 25,

    tileColors: {
      ground:      '#8a7a5a',
      dark_ground: '#6a5a4a',
      path:        '#a09070',
      grass:       '#5a7a3a',
      stall:       '#c47830',
      dark_stall:  '#a06020',
      water:       '#3a6a7a',
      sand:        '#c8b878',
    },

    getTileColor(tx, ty) {
      const marketRow = ty >= 8 && ty <= 16
      const marketCol = tx >= 4 && tx <= 36

      // Stalls grid
      if (marketRow && marketCol) {
        if (tx % 8 === 0 || tx % 8 === 1) return 'stall'
        if (ty % 3 === 0) return 'dark_stall'
        return 'ground'
      }
      if (ty === 4 || ty === 20 || tx === 2 || tx === 38) return 'path'
      if ((tx + ty) % 7 === 0) return 'sand'
      return 'grass'
    },

    buildings: [
      { id: 'jao', nameKey: 'tatics.buildings.jao', x: 14, y: 2, w: 8, h: 4, color: '#c47820', labelColor: '#e8a040', interiorMapId: 'jao' },
      { id: 'save', nameKey: 'tatics.buildings.save', x: 32, y: 20, w: 4, h: 3, color: '#505a50', labelColor: '#707a70', interiorMapId: 'save' },
    ],

    solidTiles: [
      { x: 20, y: 12, w: 2, h: 1 }, { x: 12, y: 15, w: 1, h: 1 },
    ],

    waterTiles: [{ x: 2, y: 22, w: 3, h: 3 }],

    trees: [
      [100, 80], [700, 100], [300, 600], [600, 650],
    ],
    lamps: [
      [200, 200], [500, 200], [300, 400], [600, 400],
    ],

    npcs: [
      {
        id: 'feirante', nameKey: 'tatics.city.feirante_label',
        x: 350, y: 300, w: 10, h: 14, color: '#cc8833',
        dialogKey: 'tatics.city.feirante_dialog',
      },
      {
        id: 'cozinheira', nameKey: 'tatics.city.cozinheira_label',
        x: 550, y: 500, w: 10, h: 14, color: '#aa6644',
        dialogKey: 'tatics.city.cozinheira_dialog',
      },
    ],

    exits: {
      norte: { to: 'comercial', spawnTile: { x: 20, y: 33 } },
    },

    zonas: [
      { nameKey: 'tatics.zones.mercado', tx: 0, ty: 0, tw: 40, th: 25, color: '#d4a040' },
    ],
  },

  /* ═══════════════════════════════════════════════
     YOHUALTICIT — Distrito corporativo místico
     ═══════════════════════════════════════════════ */
  yohualticit: {
    id: 'yohualticit',
    nameKey: 'tatics.zones.yohualticit',
    mapW: 45,
    mapH: 30,

    tileColors: {
      floor:       '#3a2a3a',
      dark_floor:  '#2a1a2a',
      path:        '#5a4a5a',
      dark_path:   '#4a3a4a',
      glow:        '#6a3a8a',
      neon:        '#8a4aba',
      water:       '#4a2a6a',
      grass:       '#2a3a2a',
    },

    getTileColor(tx, ty) {
      const avH = ty === 5 || ty === 11 || ty === 17 || ty === 23
      const avV = tx === 5 || tx === 13 || tx === 21 || tx === 29 || tx === 37
      const mainH = ty >= 14 && ty <= 15
      const mainV = tx >= 12 && tx <= 13
      const neonZone = (tx >= 34 && tx <= 42 && ty >= 20 && ty <= 26)
      const glowPools = (tx === 21 && ty === 14) || (tx === 29 && ty === 14)

      if (neonZone) return 'neon'
      if (glowPools) return 'glow'
      if ((mainH && tx >= 2 && tx <= 43) || (mainV && ty >= 2 && ty <= 28)) return 'path'
      if (avH || avV) return 'dark_path'
      if (tx % 4 === 0 && ty % 4 === 0) return 'glow'
      return 'floor'
    },

    buildings: [
      { id: 'yohualticit', nameKey: 'tatics.buildings.yohualticit', x: 18, y: 4, w: 10, h: 8, color: '#6a1a3a', labelColor: '#aa4477', interiorMapId: 'yohualticit' },
      { id: 'biblioteca', nameKey: 'tatics.buildings.biblioteca', x: 4, y: 16, w: 5, h: 4, color: '#3a2a5a', labelColor: '#6a4a9a', interiorMapId: 'biblioteca' },
    ],

    solidTiles: [
      { x: 22, y: 14, w: 1, h: 1 }, { x: 30, y: 6, w: 1, h: 2 },
      { x: 10, y: 24, w: 1, h: 1 }, { x: 36, y: 16, w: 1, h: 1 },
    ],

    waterTiles: [{ x: 38, y: 2, w: 4, h: 4 }],

    trees: [
      [300, 500], [600, 400], [800, 600], [200, 700],
    ],
    lamps: [
      [200, 200], [500, 200], [800, 200], [300, 500],
      [600, 500], [200, 700], [600, 700],
    ],

    npcs: [
      {
        id: 'seguranca', nameKey: 'tatics.city.seguranca_label',
        x: 600, y: 500, w: 10, h: 14, color: '#444488',
        dialogKey: 'tatics.city.seguranca_dialog',
      },
    ],

    exits: {
      leste: { to: 'central', spawnTile: { x: 1, y: 15 } },
      sul:   { to: 'residencial', spawnTile: { x: 25, y: 1 } },
    },

    zonas: [
      { nameKey: 'tatics.zones.yohualticit', tx: 0, ty: 0, tw: 45, th: 30, color: '#8a4aba' },
    ],
  },

  /* ═══════════════════════════════════════════════
     SUBÚRBIO — Periferia industrial, abandonado
     ═══════════════════════════════════════════════ */
  suburbio: {
    id: 'suburbio',
    nameKey: 'tatics.zones.suburbio',
    mapW: 45,
    mapH: 25,

    tileColors: {
      dirt:        '#5a4a3a',
      dark_dirt:   '#4a3a2a',
      path:        '#6a5a4a',
      dark_path:   '#5a4a3a',
      grass:       '#3a4a2a',
      dry_grass:   '#4a5a2a',
      water:       '#3a5a5a',
      rubble:      '#5a5a50',
      metal:       '#6a6a5a',
    },

    getTileColor(tx, ty) {
      const avH = ty === 4 || ty === 10 || ty === 16 || ty === 22
      const avV = tx === 4 || tx === 12 || tx === 20 || tx === 28 || tx === 36

      // Rubble patches
      if ((tx >= 2 && tx <= 5 && ty >= 18 && ty <= 22) ||
          (tx >= 32 && tx <= 36 && ty >= 14 && ty <= 18)) return 'rubble'
      if ((tx >= 38 && tx <= 42 && ty >= 6 && ty <= 10)) return 'metal'

      if (ty === 14 || ty === 15 || tx === 22 || tx === 23) return 'path'
      if (avH || avV) return 'dark_path'
      if ((tx + ty) % 5 === 0) return 'dry_grass'
      return 'dirt'
    },

    buildings: [
      { id: 'casa_sub1', nameKey: 'tatics.buildings.casa', x: 6, y: 2, w: 4, h: 3, color: '#5a3a2a', labelColor: '#805040', interiorMapId: 'casa' },
      { id: 'casa_sub2', nameKey: 'tatics.buildings.casa', x: 32, y: 2, w: 4, h: 3, color: '#4a3a2a', labelColor: '#705040', interiorMapId: 'casa' },
      { id: 'save', nameKey: 'tatics.buildings.save', x: 20, y: 18, w: 4, h: 3, color: '#505a50', labelColor: '#707a70', interiorMapId: 'save' },
    ],

    solidTiles: [
      { x: 14, y: 8, w: 1, h: 1 }, { x: 36, y: 12, w: 1, h: 2 },
      { x: 8, y: 16, w: 1, h: 1 }, { x: 28, y: 20, w: 1, h: 1 },
    ],

    waterTiles: [{ x: 40, y: 20, w: 5, h: 5 }],

    trees: [
      [200, 300], [600, 200], [800, 400], [400, 600],
    ],
    lamps: [
      [200, 150], [600, 150], [400, 400], [800, 350],
    ],

    npcs: [],

    exits: {
      norte: { to: 'industrial', spawnTile: { x: 25, y: 28 } },
      leste: { to: 'porto', spawnTile: { x: 20, y: 3 } },
    },

    zonas: [
      { nameKey: 'tatics.zones.suburbio', tx: 0, ty: 0, tw: 45, th: 25, color: '#8a7a5a' },
    ],
  },
}

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

export function getTileColorName(distrito, tx, ty) {
  return distrito.getTileColor(tx, ty)
}

export function isSolid(distrito, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= distrito.mapW || ty >= distrito.mapH) return true
  for (const b of distrito.buildings) {
    if (tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return true
  }
  if (tx === 0 || ty === 0 || tx === distrito.mapW - 1 || ty === distrito.mapH - 1) return true
  for (const w of distrito.waterTiles) {
    if (tx >= w.x && tx < w.x + w.w && ty >= w.y && ty < w.y + w.h) return true
  }
  for (const o of distrito.solidTiles) {
    if (tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h) return true
  }
  return false
}

/* ── Exit red square range (matches exactly where 4×2 tiles are drawn) ── */
const EXIT_COLS = 4
export function getExitRedSquareRange(dir, distrito) {
  const midX = Math.floor(distrito.mapW / 2)
  const midY = Math.floor(distrito.mapH / 2)
  const half = Math.floor(EXIT_COLS / 2)
  switch (dir) {
    case 'norte': return { startTx: midX - half, endTx: midX + half - 1, startTy: 0, endTy: 1 }
    case 'sul': return { startTx: midX - half, endTx: midX + half - 1, startTy: distrito.mapH - 2, endTy: distrito.mapH - 1 }
    case 'leste': return { startTx: distrito.mapW - 2, endTx: distrito.mapW - 1, startTy: midY - half, endTy: midY + half - 1 }
    case 'oeste': return { startTx: 0, endTx: 1, startTy: midY - half, endTy: midY + half - 1 }
    default: return null
  }
}

/* ── Building door red square range (4×2 tiles in front of door) ── */
export function getBuildingRedSquareRange(b) {
  const midX = b.x + Math.floor(b.w / 2)
  const doorY = b.y + b.h
  return { startTx: midX - 2, endTx: midX + 1, startTy: doorY, endTy: doorY + 1 }
}

/* ── Only detects if player is ON the building red squares ── */
export function getBuildingAt(px, py, distrito) {
  const tx = Math.floor(px / STEP), ty = Math.floor(py / STEP)
  for (const b of distrito.buildings) {
    const r = getBuildingRedSquareRange(b)
    if (tx >= r.startTx && tx <= r.endTx && ty >= r.startTy && ty <= r.endTy) return b
  }
  return null
}

/* ── Only detects if player is ON the exit red squares ── */
export function getExitAt(px, py, distrito) {
  const tx = Math.floor(px / STEP), ty = Math.floor(py / STEP)
  for (const [dir, exitData] of Object.entries(distrito.exits)) {
    const r = getExitRedSquareRange(dir, distrito)
    if (!r) continue
    if (tx >= r.startTx && tx <= r.endTx && ty >= r.startTy && ty <= r.endTy) return exitData
  }
  return null
}

export function getZonaNome(tileX, tileY, zonas) {
  for (const z of zonas) {
    if (tileX >= z.tx && tileX < z.tx + z.tw && tileY >= z.ty && tileY < z.ty + z.th) return z
  }
  return null
}

export function getNpcAt(px, py, distrito) {
  const tx = Math.floor(px / 32), ty = Math.floor(py / 32)
  for (const npc of distrito.npcs) {
    const ntx = Math.floor(npc.x / 32), nty = Math.floor(npc.y / 32)
    if (tx >= ntx - 1 && tx <= ntx + 1 && ty >= nty - 1 && ty <= nty + 1) return npc
  }
  return null
}
