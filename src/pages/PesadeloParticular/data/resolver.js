import { CASOS } from '../data/casos'
import { PISTAS } from '../data/pistas'
import { defineSuspeito } from '../data/suspeitos'
import { defineLocal } from '../data/locais'

export function getCaso(id) { return CASOS.find(c => c.id === id) || null }

export function getPistasParaCaso(casoId) {
  return PISTAS.filter(p => p.casoId === casoId)
}

export function getLocaisParaCaso(casoId) {
  const caso = getCaso(casoId)
  if (!caso) return []
  return caso.locais.map(l => ({ ...l, ...defineLocal(l.id) }))
}

export function getSuspeitosParaCaso(casoId) {
  const caso = getCaso(casoId)
  if (!caso) return []
  return caso.suspeitos.map(s => {
    const def = defineSuspeito(s.id) || {}
    return { ...s, ...def }
  })
}

export function casosDisponiveis(casosResolvidos, reputacao) {
  return CASOS.filter(c => {
    if (casosResolvidos.includes(c.id)) return false
    const preReq = c.preRequisitos || []
    if (preReq.length === 0) return true
    const todosResolvidos = preReq.every(pr => casosResolvidos.includes(pr))
    if (!todosResolvidos) return false
    if (c.reputacao_minima && reputacao < c.reputacao_minima) return false
    return true
  })
}
