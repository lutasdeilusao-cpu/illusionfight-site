// Ilustrações em pixel art: mapa externo em 5 faixas de 568px e uma imagem por
// cômodo. A colisão continua em mundo.js e interiores.js.
import { comFundos } from '../pista/fundos.js'
import b1 from '../../../assets/backgrounds/baixada-bloco-1.webp'
import b2 from '../../../assets/backgrounds/baixada-bloco-2.webp'
import b3 from '../../../assets/backgrounds/baixada-bloco-3.webp'
import b4 from '../../../assets/backgrounds/baixada-bloco-4.webp'
import b5 from '../../../assets/backgrounds/baixada-bloco-5.webp'
import birosca0 from '../../../assets/backgrounds/baixada-int-birosca_0.webp'
import birosca1 from '../../../assets/backgrounds/baixada-int-birosca_1.webp'
import padaria0 from '../../../assets/backgrounds/baixada-int-padaria_0.webp'
import birosca20 from '../../../assets/backgrounds/baixada-int-birosca_2_0.webp'
import deposito0 from '../../../assets/backgrounds/baixada-int-deposito_0.webp'

export const FUNDO_BAIXADA = { blocos: [b1, b2, b3, b4, b5], blocoH: 568 }

export const FUNDO_INT_BAIXADA = {
  birosca: [birosca0, birosca1],
  padaria: [padaria0],
  birosca_2: [birosca20],
  deposito: [deposito0],
}

export { comFundos }
