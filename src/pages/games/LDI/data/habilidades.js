// As habilidades de cada Veia. O id é veia × 10 + ordem (do básico ao
// avançado). Nome, o que faz e onde se aprende moram no i18n em
// games.ldi.habilidades.<id>. Cada jogador só aprende as da própria Veia.
export const HABILIDADES = [
  { id: 11, veia: 1 }, { id: 12, veia: 1 }, { id: 13, veia: 1 },
  { id: 21, veia: 2 }, { id: 22, veia: 2 }, { id: 23, veia: 2 },
  { id: 31, veia: 3 }, { id: 32, veia: 3 }, { id: 33, veia: 3 },
  { id: 41, veia: 4 }, { id: 42, veia: 4 }, { id: 43, veia: 4 },
  { id: 51, veia: 5 }, { id: 52, veia: 5 }, { id: 53, veia: 5 },
]

export const habilidadePorId = id => HABILIDADES.find(h => h.id === id) || null
export const habilidadesDaVeia = veia => HABILIDADES.filter(h => h.veia === veia)
