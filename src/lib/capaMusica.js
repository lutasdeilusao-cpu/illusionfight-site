// Capa de cada música e de cada faixa da Rádio Nina: src/assets/images/music/capas/<nome>.webp.
// Toda versão tem capa própria (geradas por LAB-NVIDIA/capas_musicas.py):
// - música do catálogo: <id>.webp (a "Tudo que vejo é freeze" do catálogo usa freeze.webp);
// - faixa só da rádio: o nome do arquivo em slug; se o slug for igual ao id de
//   uma música do catálogo (outra versão, mesmo nome), usa <slug>-radio.webp.
import musicas from '../data/musicas.json'

const capas = import.meta.glob('../assets/images/music/capas/*.webp', { eager: true, import: 'default' })
const arquivo = nome => capas[`../assets/images/music/capas/${nome}.webp`]
const padrao = arquivo('lutas-de-ilusao')
const CATALOGO = new Set(musicas.map(m => m.id))
const CAPA_DO_CATALOGO = { 'tudo-que-vejo-e-freeze': 'freeze' }

export function capaDaMusica(musica) {
  return arquivo(CAPA_DO_CATALOGO[musica?.id] || musica?.id) || padrao
}

const slug = key => (key || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .split('isaias leal music')[0].replace('.mp3', '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export function capaDaFaixa(key) {
  const s = slug(key)
  return arquivo(CATALOGO.has(s) ? `${s}-radio` : s) || padrao
}
