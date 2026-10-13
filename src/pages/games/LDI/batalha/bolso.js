// Bolso do jogador: PV, grana e poções. Mora no save, em `flags.bolso`.
// O PV passa de uma luta pra outra; só volta com poção ou no ponto de recuperação,
// que custa grana. Vencer uma luta às vezes dá grana, às vezes poção, às vezes nada.
export const PV_MAX = 400
export const CUSTO_RECUPERAR = 15
export const PRECO_POCAO = 25
export const CURA_POCAO = 150
// Perdeu: a história segue, mas você sai com pouco PV.
export const PV_DERROTA = 0.25

const BOLSO_NOVO = { pv: PV_MAX, grana: 20, pocoes: 1 }
export const bolsoDe = save => ({ ...BOLSO_NOVO, ...(save.flags?.bolso || {}) })

// O que cai da luta vencida: grana (mais quanto mais forte o inimigo), poção ou nada.
export function sortearPremio(inimigoId) {
  const r = Math.random()
  if (r < 0.55) return { grana: 8 + Math.round(Math.random() * 10) + inimigoId * 4 }
  if (r < 0.8) return { pocoes: 1 }
  return {}
}
