// Ilustrações em pixel art da Pista. O mapa externo é cortado em 5 faixas de
// 568px (o mundo tem 760×2840) e cada cômodo dos interiores tem a sua imagem.
// A colisão continua vindo de mundo.js e interiores.js — a arte só desenha.
import b1 from '../../../assets/backgrounds/pista-bloco-1.webp'
import b2 from '../../../assets/backgrounds/pista-bloco-2.webp'
import b3 from '../../../assets/backgrounds/pista-bloco-3.webp'
import b4 from '../../../assets/backgrounds/pista-bloco-4.webp'
import b5 from '../../../assets/backgrounds/pista-bloco-5.webp'
import birosca0 from '../../../assets/backgrounds/pista-int-birosca_0.webp'
import birosca1 from '../../../assets/backgrounds/pista-int-birosca_1.webp'
import birosca2 from '../../../assets/backgrounds/pista-int-birosca_2_0.webp'
import oficina from '../../../assets/backgrounds/pista-int-oficina_0.webp'
import loja from '../../../assets/backgrounds/pista-int-loja_0.webp'
import tunel0 from '../../../assets/backgrounds/pista-int-tunel_0.webp'
import tunel1 from '../../../assets/backgrounds/pista-int-tunel_1.webp'
import tunel2 from '../../../assets/backgrounds/pista-int-tunel_2.webp'
import galpao0 from '../../../assets/backgrounds/pista-int-galpao_0.webp'
import galpao1 from '../../../assets/backgrounds/pista-int-galpao_1.webp'
import galpao2 from '../../../assets/backgrounds/pista-int-galpao_2.webp'
import galpao3 from '../../../assets/backgrounds/pista-int-galpao_3.webp'

export const FUNDO_PISTA = { blocos: [b1, b2, b3, b4, b5], blocoH: 568 }

export const FUNDO_INT_PISTA = {
  birosca: [birosca0, birosca1],
  birosca_2: [birosca2],
  oficina: [oficina],
  loja: [loja],
  tunel: [tunel0, tunel1, tunel2],
  galpao: [galpao0, galpao1, galpao2, galpao3],
}

// Junta a ilustração de cada cômodo (`comodo.fundo`) aos interiores.
export function comFundos(interiores, fundos) {
  return Object.fromEntries(Object.entries(interiores).map(([id, inter]) => [id, {
    ...inter,
    comodos: inter.comodos.map((c, i) => (fundos[id]?.[i] ? { ...c, fundo: fundos[id][i] } : c)),
  }]))
}
