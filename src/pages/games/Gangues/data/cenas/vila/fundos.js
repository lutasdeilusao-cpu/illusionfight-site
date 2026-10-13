// Ilustrações em pixel art: mapa externo em 5 faixas de 568px e uma imagem por
// cômodo. A colisão continua em mundo.js e interiores.js.
import { comFundos } from '../pista/fundos.js'
import b1 from '../../../assets/backgrounds/vila-bloco-1.webp'
import b2 from '../../../assets/backgrounds/vila-bloco-2.webp'
import b3 from '../../../assets/backgrounds/vila-bloco-3.webp'
import b4 from '../../../assets/backgrounds/vila-bloco-4.webp'
import b5 from '../../../assets/backgrounds/vila-bloco-5.webp'
import birosca0 from '../../../assets/backgrounds/vila-int-birosca_0.webp'
import birosca1 from '../../../assets/backgrounds/vila-int-birosca_1.webp'
import oficina0 from '../../../assets/backgrounds/vila-int-oficina_0.webp'
import brecho0 from '../../../assets/backgrounds/vila-int-brecho_0.webp'
import blocoa0 from '../../../assets/backgrounds/vila-int-bloco_a_0.webp'
import blocoa1 from '../../../assets/backgrounds/vila-int-bloco_a_1.webp'
import blocoa2 from '../../../assets/backgrounds/vila-int-bloco_a_2.webp'
import blocoa3 from '../../../assets/backgrounds/vila-int-bloco_a_3.webp'
import blocoa4 from '../../../assets/backgrounds/vila-int-bloco_a_4.webp'
import blocoa5 from '../../../assets/backgrounds/vila-int-bloco_a_5.webp'
import blocoa6 from '../../../assets/backgrounds/vila-int-bloco_a_6.webp'
import blocoa7 from '../../../assets/backgrounds/vila-int-bloco_a_7.webp'
import blocoa8 from '../../../assets/backgrounds/vila-int-bloco_a_8.webp'
import blocoa9 from '../../../assets/backgrounds/vila-int-bloco_a_9.webp'
import blocoa10 from '../../../assets/backgrounds/vila-int-bloco_a_10.webp'

export const FUNDO_VILA = { blocos: [b1, b2, b3, b4, b5], blocoH: 568 }

export const FUNDO_INT_VILA = {
  birosca: [birosca0, birosca1],
  oficina: [oficina0],
  brecho: [brecho0],
  bloco_a: [blocoa0, blocoa1, blocoa2, blocoa3, blocoa4, blocoa5, blocoa6, blocoa7, blocoa8, blocoa9, blocoa10],
}

export { comFundos }
