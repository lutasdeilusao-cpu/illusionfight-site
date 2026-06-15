/**
 * Hex grid utilities — LDI Arena Testbed
 * Suporte para grids hexagonais (top-down, flat-top)
 */

const SQRT3 = Math.sqrt(3)

/**
 * Gera coordenadas de todos os hexágonos no grid
 */
export function gerarGrid(cols, rows) {
  const cells = []
  const w = SQRT3 // largura de um hex
  const h = 1.5   // altura de um hex

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : w / 2
      const cx = col * w + offsetX
      const cy = row * h
      cells.push({
        row,
        col,
        cx,
        cy,
        hexX: cx,
        hexY: cy,
        id: `${row}_${col}`,
      })
    }
  }
  return cells
}

/**
 * Distância em hexágonos entre duas células (flat-top axial)
 */
export function distanciaHex(a, b) {
  const ax = a.col - Math.floor(a.row / 2)
  const ay = a.row
  const bx = b.col - Math.floor(b.row / 2)
  const by = b.row
  const dx = ax - bx
  const dy = ay - by
  return (Math.abs(dx) + Math.abs(dx + dy) + Math.abs(dy)) / 2
}

/**
 * Retorna vizinhos de uma célula (até 6 direções)
 */
export function getVizinhos(row, col, cols, rows) {
  const dirs = row % 2 === 0
    ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
    : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]

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

/**
 * BFS para encontrar células alcançáveis em N passos
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
      // Obstáculo Tipo 1 bloqueia passagem
      const obs = obstaculos?.[key]
      if (obs && obs.tipo === 1) continue
      visited.add(key)
      queue.push({ ...viz, dist: current.dist + 1 })
    }
  }
  return result
}

/**
 * BFS para encontrar células de ataque alcançáveis
 * Melee: alcance 1
 * Distância: alcance configurável (padrão 4)
 */
export function getCelulasAtaque(startRow, startCol, tipoAtaque, cols, rows, alcanceMax = 4) {
  const alcance = tipoAtaque === 'melee' ? 1 : alcanceMax
  const visited = new Set()
  const queue = [{ row: startRow, col: startCol, dist: 0 }]
  const result = []

  visited.add(`${startRow}_${startCol}`)

  while (queue.length > 0) {
    const current = queue.shift()
    if (current.dist >= alcance) continue

    const vizinhos = getVizinhos(current.row, current.col, cols, rows)
    for (const viz of vizinhos) {
      const key = `${viz.row}_${viz.col}`
      if (visited.has(key)) continue
      visited.add(key)
      const newDist = current.dist + 1
      if (newDist <= alcance) {
        result.push({ row: viz.row, col: viz.col, distancia: newDist })
      }
      queue.push({ ...viz, dist: newDist })
    }
  }
  return result
}

/**
 * Encontra o caminho mais curto entre duas células (BFS), evitando obstáculos Tipo 1
 */
export function encontrarCaminho(startRow, startCol, endRow, endCol, cols, rows, obstaculos) {
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
      if (obs && (obs.tipo === 1 || (obs.tipo === 2 && false))) continue
      visited.add(key)
      queue.push({ ...viz, path: [...current.path, viz] })
    }
  }
  return null
}
