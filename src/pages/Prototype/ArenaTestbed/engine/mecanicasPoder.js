export const MECANICAS = {
  1: { nome: 'bonusAtributo', fn: executarBonusAtributo },
  2: { nome: 'defesaPrompt', fn: null },
}

export function executarMecanica(mecanicaId, params, contexto) {
  const mech = MECANICAS[mecanicaId]
  if (!mech || !mech.fn) return contexto.atacante
  return mech.fn(params, contexto)
}

function executarBonusAtributo(params, { atacante }) {
  if (!params || !params.atributo) return atacante
  const bonus = params.bonus || 0
  const novo = { ...atacante }
  if (params.atributo === 'fa') {
    novo.forca = (atacante.forca || 0) + bonus
  } else if (params.atributo === 'pdf') {
    novo.pdf = (atacante.pdf || 0) + bonus
  }
  return novo
}
