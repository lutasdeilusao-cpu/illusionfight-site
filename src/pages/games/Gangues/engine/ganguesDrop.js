/* Sorteio de drop com garantia.
   Cada inimigo derrotado conta 1 vitória pra cada linha da tabela dele
   (data/ganguesDrops.js). A linha cai se o sorteio passar OU se o contador
   chegar na garantia (ceil(1/chance)); caiu, o contador da linha zera.
   Função pura: recebe os contadores, devolve os novos e o que caiu. */
import { dropsDoInimigo, garantiaDe, chaveDrop, rolarVariante } from '../data/ganguesDrops.js'

export function rolarDrops(enemyIds = [], contadores = {}, rnd = Math.random) {
  const novos = { ...contadores }
  const ganhos = []
  for (const enemyId of enemyIds) {
    for (const linha of dropsDoInimigo(enemyId)) {
      const chave = chaveDrop(enemyId, linha)
      const tentativas = (novos[chave] || 0) + 1
      if (rnd() < linha.chance || tentativas >= garantiaDe(linha.chance)) {
        ganhos.push({ ...linha, enemyId: Number(enemyId), ...(linha.tipo === 'equip' ? { variante: rolarVariante(linha.id, rnd) } : {}) })
        novos[chave] = 0
      } else novos[chave] = tentativas
    }
  }
  return { ganhos, contadores: novos }
}

/** Quantas vitórias faltam, no máximo, pra linha cair. */
export function faltamPraGarantia(enemyId, linha, contadores = {}) {
  return Math.max(1, garantiaDe(linha.chance) - (contadores[chaveDrop(enemyId, linha)] || 0))
}
