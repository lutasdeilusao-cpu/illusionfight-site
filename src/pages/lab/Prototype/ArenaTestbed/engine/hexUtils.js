/**
 * Hex grid utilities — LDI Arena Testbed
 * Suporte para grids hexagonais (odd-r offset, flat-top)
 *
 * REFATORADO v2 — Funções centralizadas de linha de visão e alcance
 * usando coordenadas cúbicas para precisão máxima.
 */

const SQRT3 = Math.sqrt(3)

// ── Conversão Offset ↔ Cúbico (odd-r) ──────────────────
// offset: { row, col }  |  cubo: { q, r, s }

function offsetToCubo(row, col) {
  const q = col
  const r = row - (col - (col & 1)) / 2
  const s = -q - r
  return { q, r, s }
}

function cuboToOffset(q, r) {
  const col = q
  const row = r + (q - (q & 1)) / 2
  return { row, col }
}

function cuboRound(q, r, s) {
  let qr = Math.round(q)
  let rr = Math.round(r)
  let sr = Math.round(s)
  const dq = Math.abs(qr - q)
  const dr = Math.abs(rr - r)
  const ds = Math.abs(sr - s)
  if (dq > dr && dq > ds) qr = -rr - sr
  else if (dr > ds) rr = -qr - sr
  else sr = -qr - rr
  return { q: qr, r: rr, s: sr }
}

function cuboLerp(a, b, t) {
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t,
    s: a.s + (b.s - a.s) * t,
  }
}

// ── Geração do grid ────────────────────────────────────

export function gerarGrid(cols, rows) {
  const cells = []
  const w = SQRT3
  const h = 1.5
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : w / 2
      const cx = col * w + offsetX
      const cy = row * h
      cells.push({ row, col, cx, cy, hexX: cx, hexY: cy, id: `${row}_${col}` })
    }
  }
  return cells
}

// ── Distância hexagonal ────────────────────────────────

export function distanciaHex(a, b) {
  const ca = offsetToCubo(a.row, a.col)
  const cb = offsetToCubo(b.row, b.col)
  return (Math.abs(ca.q - cb.q) + Math.abs(ca.r - cb.r) + Math.abs(ca.s - cb.s)) / 2
}

// ── Vizinhos ────────────────────────────────────────────

export function getVizinhos(row, col, cols, rows) {
  const dirs = col % 2 === 0
    ? [[-1, 0], [1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]]
    : [[-1, 0], [1, 0], [0, -1], [1, -1], [0, 1], [1, 1]]
  const neighbors = []
  for (const [dr, dc] of dirs) {
    const nr = row + dr
    const nc = col + dc
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      neighbors.push({ row: nr, col: nc })
    }
  }
  return neighbors
}

// ═════════════════════════════════════════════════════════
//  NOVAS FUNÇÕES CENTRALIZADAS — Linha de Visão e Alcance
// ═════════════════════════════════════════════════════════

/**
 * getHexLine — Retorna a lista ordenada de células hexagonais entre
 * origem e alvo (coordenadas offset), EXCLUINDO a origem e INCLUINDO o alvo.
 * Usa interpolação cúbica com cubeRound para precisão.
 *
 * @param {number} rowA - linha da origem
 * @param {number} colA - coluna da origem
 * @param {number} rowB - linha do alvo
 * @param {number} colB - coluna do alvo
 * @returns {Array<{row:number, col:number}>} células no caminho (sem origem, com alvo)
 */
export function getHexLine(rowA, colA, rowB, colB) {
  const dist = distanciaHex({ row: rowA, col: colA }, { row: rowB, col: colB })
  if (dist === 0) return []

  const a = offsetToCubo(rowA, colA)
  const b = offsetToCubo(rowB, colB)

  const cells = []
  const steps = Math.ceil(dist)
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const lerp = cuboLerp(a, b, t)
    const rounded = cuboRound(lerp.q, lerp.r, lerp.s)
    const offset = cuboToOffset(rounded.q, rounded.r)
    // Valida limites do grid
    cells.push({ row: offset.row, col: offset.col })
  }

  // Remove duplicatas (caso o rounding gere células repetidas)
  const seen = new Set()
  return cells.filter(c => {
    const key = `${c.row}_${c.col}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * hasWallBetween — Verifica se existe Parede (Tipo 1) entre origem e alvo.
 * Percorre célula a célula o resultado de getHexLine.
 * Apenas Tipo 1 bloqueia — Buraco, Destrutível e Móvel não bloqueiam PDF.
 *
 * @param {number} rowA
 * @param {number} colA
 * @param {number} rowB
 * @param {number} colB
 * @param {object} obstaculos - mapa `"row_col" → { tipo }`
 * @returns {boolean} true se houver parede no caminho
 */
export function hasWallBetween(rowA, colA, rowB, colB, obstaculos = {}) {
  const line = getHexLine(rowA, colA, rowB, colB)
  // A linha já exclui a origem e inclui o alvo.
  // Excluímos o alvo por coordenada (não por índice) — após dedup
  // em getHexLine o alvo pode não estar no último índice.
  for (const cell of line) {
    if (cell.row === rowB && cell.col === colB) continue
    const key = `${cell.row}_${cell.col}`
    const obs = obstaculos[key]
    if (obs && obs.tipo === 1) return true
  }
  return false
}

/**
 * getCellsInMeleeRange — Retorna as células adjacentes que são alvos
 * válidos para ataque corpo a corpo.
 * Parede (Tipo 1) e Buraco (Tipo 2) bloqueiam Melee.
 * Tipo 3 e Tipo 4 são alvos válidos se adjacentes.
 *
 * @returns {Array<{row:number, col:number, distancia:number}>}
 */
export function getCellsInMeleeRange(origemRow, origemCol, cols, rows, obstaculos = {}) {
  const vizinhos = getVizinhos(origemRow, origemCol, cols, rows)
  return vizinhos
    .filter(cell => {
      const key = `${cell.row}_${cell.col}`
      const obs = obstaculos[key]
      if (!obs) return true
      // Tipo 1 e Tipo 2 bloqueiam Melee
      if (obs.tipo === 1 || obs.tipo === 2) return false
      return true
    })
    .map(cell => ({ row: cell.row, col: cell.col, distancia: 1 }))
}

/**
 * getCellsInPdfRange — Retorna todas as células dentro do raio de `pdf`
 * células de distância hexagonal que têm linha de visão desobstruída
 * (nenhuma Parede Tipo 1 no caminho entre origem e alvo).
 * Usa BFS para alcance + hasWallBetween para linha de visão.
 *
 * @returns {Array<{row:number, col:number, distancia:number}>}
 */
export function getCellsInPdfRange(origemRow, origemCol, pdf, cols, rows, obstaculos = {}) {
  const result = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (row === origemRow && col === origemCol) continue

      const dist = distanciaHex({ row: origemRow, col: origemCol }, { row, col })
      if (dist > pdf) continue

      // Apenas células sem parede no caminho
      if (!hasWallBetween(origemRow, origemCol, row, col, obstaculos)) {
        result.push({ row, col, distancia: dist })
      }
    }
  }

  return result
}

// ═════════════════════════════════════════════════════════
//  FUNÇÕES LEGADO — Mantidas para movimento / pathfinding
// ═════════════════════════════════════════════════════════

/**
 * BFS para encontrar células alcançáveis em N passos (movimento)
 */
export function getCelulasAlcance(startRow, startCol, passos, cols, rows, obstaculos) {
  const visited = new Set()
  const queue = [{ row: startRow, col: startCol, dist: 0 }]
  const result = []

  visited.add(`${startRow}_${startCol}`)

  while (queue.length > 0) {
    const current = queue.shift()
    if (current.dist > 0) {
      result.push({ row: current.row, col: current.col })
    }
    if (current.dist >= passos) continue

    const vizinhos = getVizinhos(current.row, current.col, cols, rows)
    for (const viz of vizinhos) {
      const key = `${viz.row}_${viz.col}`
      if (visited.has(key)) continue
      const obs = obstaculos?.[key]
      if (obs && (obs.tipo === 1 || obs.tipo === 2)) continue
      visited.add(key)
      queue.push({ ...viz, dist: current.dist + 1 })
    }
  }
  return result
}

/**
 * getCelulasAtaque — Função unificada que delega para as funções
 * especializadas conforme o tipo de ataque.
 * Jogador e IA usam esta mesma função — sem lógica paralela.
 */
export function getCelulasAtaque(startRow, startCol, tipoAtaque, cols, rows, alcanceMax = 4, obstaculos = {}) {
  if (tipoAtaque === 'melee') {
    return getCellsInMeleeRange(startRow, startCol, cols, rows, obstaculos)
  }
  // distância
  return getCellsInPdfRange(startRow, startCol, alcanceMax, cols, rows, obstaculos)
}

/**
 * Encontra o caminho mais curto entre duas células (BFS), evitando obstáculos
 * Tipo 1 (Parede) e Tipo 2 (Buraco) bloqueiam movimento.
 * Também evita células ocupadas por outros personagens (exceto o destino final).
 */
export function encontrarCaminho(startRow, startCol, endRow, endCol, cols, rows, obstaculos, ocupadas = new Set()) {
  const visited = new Set()
  const queue = [{ row: startRow, col: startCol, path: [{ row: startRow, col: startCol }] }]
  visited.add(`${startRow}_${startCol}`)

  while (queue.length > 0) {
    const current = queue.shift()
    if (current.row === endRow && current.col === endCol) {
      return current.path
    }
    const vizinhos = getVizinhos(current.row, current.col, cols, rows)
    for (const viz of vizinhos) {
      const key = `${viz.row}_${viz.col}`
      if (visited.has(key)) continue
      const obs = obstaculos?.[key]
      if (obs && (obs.tipo === 1 || obs.tipo === 2)) continue
      // Bloqueia células ocupadas por outros personagens (exceto destino final)
      if (ocupadas.has(key) && !(viz.row === endRow && viz.col === endCol)) continue
      visited.add(key)
      queue.push({ ...viz, path: [...current.path, viz] })
    }
  }
  return null
}
