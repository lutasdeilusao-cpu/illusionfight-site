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

// Faixa da Rádio Nina (nome do arquivo no R2) → capa. Versões (remix, rock,
// "version 2", aberturas em outra língua) usam a capa da música de origem.
const CAPA_POR_NOME = [
  ['lutas de ilusao', 'lutas-de-ilusao'], ['luchas de ilusion', 'lutas-de-ilusao'], ['illusion fight', 'lutas-de-ilusao'],
  ['sorte minha', 'sorte-minha'], ['andando por voce', 'andando-por-voce'], ['asilo star', 'asilo-star'],
  ['chegando', 'chegando'], ['deixa essa night rolar', 'deixa-essa-night-rolar'], ['eles dizem', 'eles-dizem'],
  ['felicidade que eu nao procurava', 'felicidade-que-eu-nao-procurava'], ['inevitave', 'inevitavel'],
  ['lisa linda', 'lisa-linda-demais'], ['meu lugar', 'meu-lugar'], ['nuvens', 'nuvens'],
  ['o dia depois do julgamento', 'o-dia-depois-do-julgamento'], ['pique esconde', 'pique-esconde'],
  ['so mais um round', 'so-mais-um-round'], ['trono e coroa', 'trono-e-coroa'],
  ['tudo que sinto e love', 'tudo-que-sinto-e-love'], ['freeze', 'freeze'], ['vilanesca', 'vilanesca'],
  ['escola pra', 'escola-pra-q'],
]
const normaliza = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()

export function capaDaFaixa(key) {
  const nome = normaliza(key)
  const achou = CAPA_POR_NOME.find(([trecho]) => nome.includes(trecho))
  return achou ? capaDaMusica({ id: achou[1] }) : padrao
}
