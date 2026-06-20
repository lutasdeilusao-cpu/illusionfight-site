import { getHexLine, distanciaHex } from './hexUtils'

const DIRECOES = {
  norte: { dr: -1, dc: 0 },
  sul: { dr: +1, dc: 0 },
}

export function getLineInDirection(origemRow, origemCol, direcao, distancia, cols, rows) {
  const delta = DIRECOES[direcao]
  if (!delta) return []

  const destinoRow = origemRow + delta.dr * distancia
  const destinoCol = origemCol + delta.dc * distancia

  const clampedRow = Math.max(0, Math.min(rows - 1, destinoRow))
  const clampedCol = Math.max(0, Math.min(cols - 1, destinoCol))

  const cells = getHexLine(origemRow, origemCol, clampedRow, clampedCol)

  const distReal = distanciaHex({ row: origemRow, col: origemCol }, { row: clampedRow, col: clampedCol })
  return cells.filter(c => {
    const d = distanciaHex({ row: origemRow, col: origemCol }, c)
    return d <= distancia
  })
}

export function getPersonagensNaLinha(origemRow, origemCol, direcao, distancia, cols, rows, personagens) {
  const cells = getLineInDirection(origemRow, origemCol, direcao, distancia, cols, rows)
  return cells
    .map(c => {
      const ch = personagens.find(p => p.vivo && p.posicao?.row === c.row && p.posicao?.col === c.col)
      if (!ch) return null
      const cellIndex = cells.findIndex(cell => cell.row === c.row && cell.col === c.col)
      const pos = cellIndex + 1
      const multiplier = pos <= 2 ? 1.0 : 0.75
      return { char: ch, row: c.row, col: c.col, pos, multiplier }
    })
    .filter(Boolean)
}
