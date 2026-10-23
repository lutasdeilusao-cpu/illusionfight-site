// Capa de cada música: src/assets/images/music/capas/<id>.webp.
// As versões em outro idioma da mesma música usam a capa da original (MESMA_CAPA).
const capas = import.meta.glob('../assets/images/music/capas/*.webp', { eager: true, import: 'default' })
const MESMA_CAPA = {
  'todo-lo-que-veo-es-freeze': 'freeze',
  'all-i-see-is-freeze': 'freeze',
  'tudo-que-vejo-e-freeze': 'freeze',
}
const padrao = capas['../assets/images/music/capas/lutas-de-ilusao.webp']

export function capaDaMusica(musica) {
  const id = MESMA_CAPA[musica?.id] || musica?.id
  return capas[`../assets/images/music/capas/${id}.webp`] || padrao
}
