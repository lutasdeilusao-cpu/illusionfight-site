import { CASOS } from './casos'

/**
 * Retorna um caso pelo ID.
 */
export function getCaso(casoId) {
  return CASOS.find(c => c.id === casoId) || null
}

/**
 * Retorna os locais de um caso (já estão dentro do objeto do caso).
 */
export function getLocaisParaCaso(casoId) {
  const caso = getCaso(casoId)
  return caso?.locais || []
}

/**
 * Retorna as pistas de um caso.
 */
export function getPistasParaCaso(casoId) {
  const caso = getCaso(casoId)
  return caso?.pistas || []
}

/**
 * Retorna os suspeitos de um caso.
 */
export function getSuspeitosParaCaso(casoId) {
  const caso = getCaso(casoId)
  return caso?.suspeitos || []
}

/**
 * Retorna os casos disponíveis baseado nos já resolvidos e na reputação atual.
 * Caso 01 sempre disponível. Demais exigem que o caso pai esteja resolvido
 * OU que desbloqueado === true E reputacao >= reputacao_minima.
 */
export function casosDisponiveis(casosResolvidos, reputacao) {
  return CASOS.filter(c => {
    if (casosResolvidos.includes(c.id)) return false // já resolvido
    if (c.desbloqueado && reputacao >= (c.reputacao_minima || 0)) return true
    // Verifica se algum caso resolvido desbloqueia este
    const desbloqueadoPorPai = casosResolvidos.some(rid => {
      const casoPai = CASOS.find(cc => cc.id === rid)
      return casoPai?.desbloqueia?.includes(c.id)
    })
    if (desbloqueadoPorPai && reputacao >= (c.reputacao_minima || 0)) return true
    return false
  })
}
