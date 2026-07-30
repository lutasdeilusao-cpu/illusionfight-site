function hashSeed(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function ordenarDeckDeterministico(cartas, salaId, jogadorId) {
  const seed = `${salaId}:${jogadorId}`
  return [...cartas].sort((cartaA, cartaB) => {
    const ordemA = hashSeed(`${seed}:${cartaA.id}`)
    const ordemB = hashSeed(`${seed}:${cartaB.id}`)
    return ordemA - ordemB || cartaA.id - cartaB.id
  })
}
